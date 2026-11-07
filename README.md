# Vero Scan website (Next.js)

The Vero Scan marketing site, converted from 18 static HTML pages to a Next.js 15 project (App Router, React 19,
TypeScript `strict`, static export). The pages are meant to look and behave exactly like the static site they were
converted from; `tools/` contains the scripts that prove it.

| | |
|---|---|
| Framework | Next.js 15.5, React 19, TypeScript 5.9 (strict) |
| Output | static export in `out/` (`output: "export"`), one `.html` file per route |
| Runtime dependencies | `next`, `react`, `react-dom` only (MIT). No Tailwind, no UI kit, no `sharp` use |
| Dev server | `npm run dev` on port **4325** |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on :4325. `/product` works; the old `/product.html` still answers too (dev-only rewrites). |
| `npm run build` | Type check, lint and static export to `out/`. |
| `npm run start` | Serves `out/` on :4326 with clean URLs (`tools/serve.mjs`, no dependencies). |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` / ESLint (`next/core-web-vitals` + `next/typescript`). |
| `npm run convert` | Regenerates the section components from the original HTML (see "The converter"). |
| `npm run parity:dom` | DOM parity of `out/` against the original pages (no browser). |
| `npm run parity:visual -- --width 1440 --motion reduced` | Screenshot diff, original vs export. |
| `npm run parity:behaviour` | Same interactions on both sites, compared. |

## Structure

```
src/
  app/                       routes: layout.tsx, not-found.tsx, one folder per page (page.tsx = metadata + JSON-LD + sections)
  components/
    shell/                   Loader, PageTransition, Header (+ NavDropdown, NavMock), MobileMenu, Footer, Lightbox,
                             CurrentLink (aria-current), RuntimeScripts (loads the animation runtime)
    sections/<page>/         one component per <section> of the page, named for what it is
    ui/                      pieces that repeat: Button, LinkArrow, Eyebrow, SectionHead, FaqList, FaqSection, CtaBand,
                             Icon, JsonLd
  lib/                       site.ts (nav, footer, company facts), metadata.ts, jsonld.ts, runtime.ts (scripts per
                             route), routes.ts, css.ts (typed CSS custom properties), cx.ts, bootstrap.ts, brand.ts
  styles/                    the original stylesheets, unchanged, plus utilities.css (see "Styles")
public/
  vero/                      loader.js, scenes.js, pages-*.js, mark/ (the 3D V), logos, favicons, og image
  build/assets/              the template's minified runtime bundles (app, about, blog, work)
  assets/fonts/              self-hosted Figtree and JetBrains Mono
tools/                       html2tsx.py, dom_parity.py, parity.mjs, behaviour.mjs, lib/browser.mjs
```

## How the animation runtime is wired

The template's animation code (Lenis smooth scroll, GSAP and ScrollTrigger, intro loader, page transition, custom
cursor, magnetic buttons, split-text reveals, product scenes, the 3D V mark) is minified third-party-built JavaScript.
It is kept as it is under `public/` and is not rewritten. Everything else is React.

* The page markup is server-rendered by React and stays untouched until the runtime starts.
* `src/components/shell/RuntimeScripts.tsx` (a client component in the root layout) waits until React has
  hydrated, then appends the scripts **one after another**, in the order the static site loaded them:
  `config.js`, `loader.js`, the app bundle (a module), then the page's own scripts. The list per route is in
  `src/lib/runtime.ts`. Loading after hydration is what keeps the runtime's DOM changes (split words, added classes)
  away from React's hydration, so there are no hydration warnings.
* The runtime waits for the browser `load` event to refresh its scroll measurements. If hydration finishes after
  `load`, `RuntimeScripts` replays `load` once at the end.
* The pre-hydration inline script from the old `<head>` (adds `js`, reads `pd-seen` and `pd-trans` from
  `sessionStorage`) is `src/lib/bootstrap.ts`, rendered inline in the layout head so it runs before first paint.
  `<html>` carries `suppressHydrationWarning` because that script and the runtime change its classes.
* Raw HTML is injected in two places only: that boot script and the JSON-LD blocks (`ui/JsonLd.tsx`).

## Navigation

Internal links are plain `<a href="/product">`, not `next/link`, and the address bar shows clean paths (`/`, `/product`,
`/insights/<slug>`), never `.html`. The template's page transition (the V canvas and the page name) runs on ordinary
full-page navigation: it intercepts clicks on same-site links without a file extension (and `.html` ones), stores the
page name in `sessionStorage` and then sets `window.location`. Client-side routing would skip all of that, so links
stay plain anchors. The export writes `out/product.html`, `out/insights/<slug>.html` and `out/404.html`, so the host
must map `/product` to `product.html`: Vercel, Netlify and Cloudflare Pages do this by default, and `npm run start`
does it locally. `next dev` also answers the old `.html` addresses through development-only rewrites in `next.config.ts`.

## Head, metadata, fonts

* `src/lib/metadata.ts` builds each page's title, description, robots, Open Graph and article tags with the Metadata
  API; JSON-LD is rendered by `ui/JsonLd.tsx` (site entities in the layout, page entities in each `page.tsx`).
* No canonical URL or absolute `og:url`: the production domain is not decided. The share image is a root-relative
  `<meta property="og:image">` in the layout because the Metadata API would turn it into a `localhost` URL without
  a `metadataBase`. Set `metadataBase` and move it into `metadata` when the domain is known.
* Fonts are self-hosted (`public/assets/fonts`, `src/styles/fonts.css`). Nothing is requested from a third-party
  host.

## Styles

The original stylesheets are in `src/styles/` unchanged and are imported in the order the static pages linked them
(layout: `fonts`, `app`, `vero`, `utilities`; then the page's own files). `postcss.config.mjs` is empty on purpose,
so Next does not re-process CSS that is already prefixed and minified.

Static inline `style="..."` attributes became single-purpose classes in `styles/utilities.css`
(`u-margin-top-28px`). Styles that carry data (`--w: 49%`, positions) stay as typed style objects built with
`cssVars()`.

## The converter

`tools/html2tsx.py` produced the first draft of every section from the original HTML (attributes in JSX form, SVG
camel-cased, entities decoded, `<a href>` made root-relative, meaningful whitespace kept). It also recognises the
markup that repeats and writes it as ui components fed by typed data (`FaqSection`, `CtaBand`, `SectionHead`,
`Button`, `LinkArrow`, `Eyebrow`, and arrays such as `PU_ROWS` for runs of three or more identical items).
The generated files are the product and can be edited by hand; running `npm run convert` again overwrites
`src/components/sections/**` and the `page.tsx` files, so only do that from a clean state.

## Adding a page

1. Create `src/app/<route>/page.tsx` that exports `metadata = pageMetadata({ title, description })` and returns
   `<main>` with its section components (put them in `src/components/sections/<route>/`).
2. Import the page's extra stylesheets from `src/styles/` in `page.tsx`.
3. Add the route to `PAGE_SCRIPTS` in `src/lib/runtime.ts` if it needs page scripts, and to `NAV` /
   `FOOTER_COLUMNS` in `src/lib/site.ts` if it belongs in the menus.
4. The page transition shows the page name from a route map inside `public/build/assets/app-*.js` (search for
   `"sample-report":"Sample report"`); add the new route there, or it falls back to an empty label.

## Checking parity

Reference site: `python -m http.server 4324 --directory ../vero-web/site`. Export: `npm run build`, then
`npm run start` (port 4326). The browser scripts use Playwright from `northclonned/vero-build/tools`, take the
`.browser.lock` folder first and run one Chromium at a time.

* **DOM** (`parity:dom`): both documents are parsed and normalised (Next scripts and hydration markers dropped,
  whitespace that is only formatting dropped, attribute and class order ignored, URLs resolved, utility classes
  expanded back to the inline style they replaced) and compared node by node, plus title, meta, icons, JSON-LD and
  stylesheet order.
* **Visual** (`parity:visual`): both sites at 1440 and 390 wide, reduced motion (final states) and normal motion
  (after the loader), fixed scroll positions, pixel diff of each pair. In normal motion the canvases, marquee, scenes
  and areas accordion are hidden on both sides because they animate continuously.
* **Behaviour** (`parity:behaviour`): loader, header dropdown, mobile menu, serve tabs, areas accordion, FAQ, forms,
  insights filters, page transition and the 404 page, each run on both sites and compared.

## Parity results (last full run, on the final build)

`npm run build` finishes with no TypeScript, lint or compiler warnings; `npm run typecheck` and `npm run lint` are clean.

**DOM (`parity:dom`): 18 of 18 pages identical** after normalisation (body, title, meta, icons, JSON-LD, stylesheet order).

**Behaviour (`parity:behaviour`): 10 of 10 identical** (loader, header dropdown, mobile menu, serve tabs, areas
accordion, FAQ, forms with the inert endpoint, insights filter, page transition, 404). No console errors, no failed
requests and no horizontal overflow on any page in any run. The page heights match to the pixel on every page.

**Visual (`parity:visual`)**: share of pixels that differ by more than 24 per channel, per page, mean / worst scroll
position (worst single frames: `for-investors` at 390 in normal motion, 20.5%, is the looping badge card caught
mid cross-fade; the next-worst frame is 3.2%). The remaining differences are animation phases (a looping scene or a text reveal caught a few milliseconds
apart), not layout: every page is the same height and the diff images show only the moving element.

| page | 1440-reduced mean / max | 390-reduced mean / max | 1440-normal mean / max | 390-normal mean / max | height |
|---|---|---|---|---|---|
| index | 0.000% / 0.00% | 0.001% / 0.01% | 0.001% / 0.00% | 0.001% / 0.01% | equal |
| product | 0.000% / 0.00% | 0.001% / 0.01% | 0.050% / 0.24% | 0.171% / 1.11% | equal |
| methodology | 0.008% / 0.11% | 0.018% / 0.24% | 0.012% / 0.10% | 0.049% / 0.39% | equal |
| security | 0.009% / 0.09% | 0.014% / 0.18% | 0.038% / 0.25% | 0.402% / 1.70% | equal |
| for-investors | 0.000% / 0.00% | 0.001% / 0.01% | 0.037% / 0.30% | 2.564% / 20.51% | equal |
| for-founders | 0.025% / 0.34% | 0.047% / 0.65% | 0.661% / 2.26% | 0.491% / 2.54% | equal |
| coverage | 0.023% / 0.25% | 0.021% / 0.26% | 0.027% / 0.14% | 0.379% / 1.35% | equal |
| sample-report | 0.080% / 1.12% | 0.001% / 0.01% | 0.006% / 0.04% | 0.400% / 3.20% | equal |
| about | 0.026% / 0.33% | 0.050% / 0.68% | 0.000% / 0.00% | 0.160% / 0.59% | equal |
| insights | 0.001% / 0.00% | 0.003% / 0.01% | 0.001% / 0.00% | 0.017% / 0.07% | equal |
| waitlist | 0.028% / 0.10% | 0.037% / 0.25% | 0.002% / 0.00% | 0.001% / 0.01% | equal |
| contact | 0.047% / 0.19% | 0.050% / 0.34% | 0.001% / 0.00% | 0.001% / 0.01% | equal |
| privacy-policy | 0.013% / 0.04% | 0.013% / 0.10% | 0.013% / 0.04% | 0.004% / 0.02% | equal |
| terms-of-service | 0.069% / 0.28% | 0.010% / 0.04% | 0.040% / 0.07% | 0.004% / 0.02% | equal |
| 404 | 0.002% / 0.00% | 0.142% / 0.28% | 0.002% / 0.00% | 0.003% / 0.01% | equal |
| insights/cac-annual-returns-and-status | 0.011% / 0.05% | 0.114% / 1.57% | 0.068% / 0.45% | 0.140% / 0.97% | equal |
| insights/contractor-ip-assignment | 0.015% / 0.05% | 0.104% / 1.42% | 0.015% / 0.05% | 0.308% / 2.32% | equal |
| insights/nigeria-gaid-cookie-banners | 0.008% / 0.06% | 0.110% / 1.52% | 0.030% / 0.17% | 0.225% / 1.49% | equal |

Per run:

* 1440-reduced: pages 18, mean 0.020%, worst sample-report 1.12%, heights equal True, scripts same True, anim same True, next errors 0, next failed 0, overflow max 0, next warnings 3 (orig 3)
* 390-reduced: pages 18, mean 0.041%, worst insights/cac-annual-returns-and-status 1.57%, heights equal True, scripts same True, anim same True, next errors 0, next failed 0, overflow max 0, next warnings 3 (orig 3)
* 1440-normal: pages 18, mean 0.056%, worst for-founders 2.26%, heights equal True, scripts same True, anim same True, next errors 0, next failed 0, overflow max 0, next warnings 2 (orig 3)
* 390-normal: pages 18, mean 0.296%, worst for-investors 20.51%, heights equal True, scripts same True, anim same True, next errors 0, next failed 0, overflow max 0, next warnings 2 (orig 3)

The scripts and "scripts same" check also confirm that both sites loaded the same runtime files in the same order, and
"anim same" that the runtime made the same changes to the page (split words and lines, mark canvas, root classes,
revealed elements). Console warnings are the template runtime's own (`GSAP target [data-reveal] not found` on pages
without reveals) and appear on the original too.

## Known differences from the static site

Each one is intended; none changes what a visitor sees.

1. **Links and assets are root-relative and clean** (`/product`, `/vero/logo-ink.svg`) instead of relative with `.html`
   (`product.html`, `../vero/...`). They resolve to the same files; the page transition derives the same route names.
2. **The runtime scripts are loaded after hydration**, by `RuntimeScripts`, in the original order, instead of as
   `<script>` tags in `<head>`. The loader counter starts about as soon as before (hydration adds a few hundred ms on a
   slow machine). `config.js`, `loader.js` and the app bundle are preloaded from the head to keep that gap small.
3. **Stylesheets are Next's CSS chunks** (hashed names) instead of `<link>` tags to the original files. The rules and
   their order are the same (checked by `parity:dom`). The `blog` preload and modulepreload hints are not emitted.
4. **JSON-LD**: the site entities are in `<head>`; each page's own block is rendered at the top of `<body>`
   (React cannot put a script into `<head>` from a page). Search engines read both.
5. **Head extras and omissions**: Next adds `twitter:title` and `twitter:description` (copied from Open Graph) and
   preload hints for the logo images; the 404 page is marked `noindex` by Next (the original said `noindex, follow`,
   the same thing); `og:image` is declared in the layout (see "Head, metadata, fonts").
6. **Static inline styles are utility classes** (`style="margin:0"` -> `u-margin-0`); computed styles are identical.
7. **Whitespace that is not rendered is not emitted**: spaces between the children of flex and grid containers
   (derived from the stylesheets by the converter and the checker).
8. **One stray empty `<p>`** that the privacy policy and the terms had before their first heading (never closed in the
   source, rendered as nothing) is gone.

## Licences

`next`, `react` and `react-dom` are MIT. Dev tooling: `typescript` (Apache-2.0), `eslint` and `eslint-config-next` (MIT).
Next lists `sharp` as an optional dependency; its libvips binaries are LGPL-3.0 and images are exported unoptimised, so
`npm install` runs `tools/prune-optional.mjs` (postinstall), which removes `node_modules/sharp` and `node_modules/@img`.
Not shipped in the site but present in `node_modules`: `axe-core` (MPL-2.0, pulled in by the ESLint accessibility
rules) and `@vercel/og` (MPL-2.0, bundled inside Next and unused). Fonts: Figtree and JetBrains Mono (SIL OFL 1.1).
