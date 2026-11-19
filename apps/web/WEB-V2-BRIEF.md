# Vero web app v2: build brief (19 Nov 2026)

The web app (`apps/web`, Next.js 16, React 19) still shows the old pink "Vero Scan" v1 screens. We are rebuilding
every screen to the **approved v2 design**, in **both bright and dark themes**, with rich, smooth motion like the
Vero website, on top of the **real API and scan engine** (no sample data in the UI, ever).

The owner's words: "We have our designs, pick up from our designs, the latest designs, dark and white, everything,
the animations. It should be smooth, it should be heavily animated, it should be clean, just like the website...
integrating the engine scan." The client is very picky: premium, alive, breathable, investor-grade. She rejected
work as "basic", "bleh", "lifeless", "vibe coded".

## The design (source of truth)

- Boards: `C:/Users/edete/Desktop/clone/northclonned/vero-build/product-design-v2/canvasroot/project/`
  - `<Page>.dc.html` (bright) and `<Page>-dark.dc.html` (dark). Page-specific CSS is in the `<style>` inside
    `<helmet>`; markup follows. `<Page>.page.js` holds each board's sample rows and small interactions.
  - Pages: SignUp, SignIn, NewScan, Confirm, Questions, Scanning, FirstResult, Overview, Findings, Finding, Area,
    Documents, AddDocument, Deadlines, Records, History, Watchlist, Share, SharedReport, Notifications, Settings, Plan.
- Look at them rendered: a static server runs at **http://localhost:4500/<Page>.dc.html** (and `-dark`).
- Rules: `vero-build/product-design-v2/BRIEF.md` (read its "Never do" list) and `SCOPE.md`.
  The sample data in those boards (Kestrel Pay, Amara...) is **design sample data only**. In the app every
  number, name and row comes from the API.

## Hard product rules

- Vero is a scanner. No lawyers, no "book a lawyer", no ordering documents, no Code & Clause anywhere a customer
  sees. A finding says what is missing, why it matters, what proof clears it, and lets the owner upload it.
- Users are anyone (company, investor, individual). Never say "founder". Brand is "Vero", never "Vero Scan".
- Plain English, sentence case. Status is a coloured word. No dots before words, pills, chips with codes, icon
  tiles on rows, rainbow avatars, emoji, unicode arrows, tiny all-caps labels (the mono kicker from web.css is the
  one exception, as in the boards), gradient buttons in bright, cards inside cards, rows of identical stat tiles.
- Coverage: any country. Show the company's `countryCoverage` (level + sentence) in context. Scores: urgent caps at
  74, coverage ("based on N of M checks") always shown, "Early read" below half coverage.
- Followed companies (relationship `follow`) are read-only: no uploads, no answers. The API answers 403
  `follows_only`; hide those actions instead of letting people hit it.

## The kit (already in place, use it, do not restyle it)

Global CSS, loaded by `src/app/layout.tsx`:
- `src/app/styles/kit.css`: the design's atmos.css + web.css + app.css **verbatim**. All the board classes exist:
  `.hero .bar .content .after .pagehead .meta .acts .mod .mh .sub .r .seg .tabs .tab .n2 table th td tr.f .ft2
  .src2 .st2 .gain .muted .btn .btn-p .btn-g .health .big .delta2 .blocks .chart .next .imp .r1 .r2 .r3 .r3b
  .rgt .cu .drawer .scrim .dh .db .df .clause .proof .up .pixel .mono .kick .arrowlink .disp .otag .glass ...`
- `src/app/styles/base.css`: forms (`.field .input .check .switch`), `.note`, states, toast, `.btn-lg .btn-sm
  .btn-w .btn-danger`, `.link`, responsive shell (sidebar becomes a drawer under 960px).
- `src/app/styles/motion.css`: `.rv/.in` reveal, `.words`, `.rows-in` (staggered rows: set `--r` per child),
  `.scanline`, `.grow` (bars from the left, `--i` stagger), `svg.flow` drawing, view-transition page changes.
- `src/app/styles/kit-dark.css`: **generated**. Never edit it.

Components (import, do not edit):
- `@/components/Shell`: `AppShell` (already wraps every page under `app/(app)/(shell)`), `Hero` (navy
  atmosphere + flow lines + top bar + `.content`), `After` (the light working area that rides up over the hero
  edge, `.content.after`), `Plain` (bar + content, no hero), `TopBar`, `PublicBar` (for public pages),
  `useWatchlist()`. Page skeleton, matching the boards:
  ```tsx
  <Hero crumb={...optional}>
    <div className="pagehead">...</div>
    <div className="r1">...glass `.mod.health` + white `.mod.next`...</div>
  </Hero>
  <After> ...white .mod panels... </After>
  ```
- `@/components/Icon`: `<Icon name="flag" />` (sprite already mounted; names in Icon.tsx; add none).
- `@/components/Motion`: `Reveal` (panel arrives on scroll, `i` = stagger index), `Words` (h1 words slide up
  from a mask), `Scramble` (mono kicker decodes in, like the website), `CountUp` (scores and key numbers),
  `FlowLines`, `Atmos` (for full-bleed atmosphere outside Hero, e.g. auth pages), `SmoothScroll` (already on).
- `@/components/Bits`: `Loading`, `ErrorState`, `Empty`, `ScoreBasis`, `SampleNote`, `SourcesDownNote`,
  `PlanLink`, `Redline`. `@/components/TLink` for internal links (page transitions). `@/components/Toast`.
- `@/components/Session`: `useSession()` gives `me`, `companies`, `root`, `related`, `overview`, `scope`,
  `hasResult`, `isDemo`, `unread`, `refresh()`.
- Data: `@/lib/api` (`api.<group>.<call>`, typed from `packages/shared/src/contract.ts`), `@/lib/useResource`,
  plus the per-area helpers in `src/lib/*.ts` (format, issues, documents, deadlines, records, questions, trust,
  plan-words, words...). Reuse them; they hold logic the old screens already proved with tests
  (`src/lib/web.test.ts`). If you change a lib file, keep its exported behaviour or update web.test.ts with it.

## Your page CSS

- One file per screen family: `src/app/styles/pages/<name>.css`, imported **from the page file itself**
  (`import '@/app/styles/pages/<name>.css';`). Scope every selector under a page root class (`.pg-<name>`) so
  pages never fight. Port the board's `<style>` block, re-scoped.
- Write **bright colours only**, preferring tokens (`var(--ink) --ink-2 --ink-3 --ink-4 --line --line-2 --panel
  --bg --navy --sky-2 --good --warn --urgent --*-bg --soft --field --field-line`). Tokens flip automatically.
- After changing it, run `npm run styles:dark --workspace @vero/web` (from the repo root): it maps your
  hex colours to the approved dark palette, exactly as the dark boards were made. Then compare with the
  `-dark` board and add dark-only fixes in your CSS under `[data-theme="dark"] .pg-<name> ...` if needed.
- Inline `style={{...}}` colours: tokens only (inline hex never flips to dark).

## Motion (required, it is half the brief)

Every screen: h1 via `<Words>`, the mono kicker via `<Scramble>`, panels via `<Reveal i={n}>` (or the kit's
own `.mod` arrival), table rows with `.rows-in` + `--r`, scores and key numbers via `<CountUp>` in `.pixel`,
progress bars with `.grow`. Scanning screens use `.scanline` and live arriving rows. Hovers: the kit's.
Motion must explain and settle; nothing loops for show (the atmosphere drift is the one ambient motion).
Everything must hold still under `prefers-reduced-motion` (motion.css handles the classes it defines; any
JS animation you add must check `prefersCalm()` from `@/lib/motion`).

## Checking your work (required)

- Dev stack is running: web http://localhost:3000 (Next dev, hot reload), API :4000 (live connectors with no
  keys, plus the fictional seeded demo org), DB :54329. Do not start or stop servers.
- Screenshot as the demo user (fictional Kestrel Pay data):
  `node apps/web/tools/shot.mjs <route-without-leading-slash|home> <out.png> [light|dark] [--full] [--width 390] [--email free@...]`
  from the repo root. Example: `node apps/web/tools/shot.mjs issues C:/.../shots/issues-dark.png dark --full`.
  Save screenshots in your own scratch folder. Open them and compare with the board, both themes, and at 390px.
  Demo accounts: `amara@kestrelpay.example` (Growth), `founder@wrenlabs.example` (Free, still onboarding-ish).
- Typecheck: `npx tsc --noEmit -p apps/web/tsconfig.json` (from the repo root). It must be clean for your files.
- Do NOT run vitest, Playwright, lint or the e2e suites (the coordinator runs them, one at a time). Do NOT
  commit, push, or touch git branches.
- The first write to a new file may hit a "GateGuard" hook asking for facts. State them briefly (who imports the
  file, that nothing else does the same job, what data it reads, the owner's instruction above) and retry.

## Boundaries

- Edit only the files of the screens you were given, their page CSS, and new components you create under
  `src/components/<your-area>/`. Do not edit kit.css, base.css, motion.css, Shell.tsx, Motion.tsx, Icon.tsx,
  Bits.tsx, Session.tsx, layout.tsx, or other builders' pages. If you need a shared change, say so in your report.
- Do not edit `apps/api`, `packages/*` or the design folder. If the API lacks something a screen needs, build the
  screen with what exists, say plainly in the UI what isn't available yet (no fake data), and list the gap in
  your report.
- Keep existing `data-testid` attributes and accessible names where the element still exists (the Playwright
  suite uses them); the coordinator updates the specs afterwards. List any you removed or renamed in your report.
- Delete components that your screens no longer use only if no other file imports them (grep first).

## Report back

Short: routes done (bright, dark, mobile checked), screenshots' paths, API gaps, shared changes you need,
testids removed or renamed, anything you could not finish.
