# Vero mobile app: builder brief

The Vero phone app (Expo SDK 58, React Native 0.88, Expo Router, Reanimated 4) built from the
approved mobile boards, light and dark, and wired to the real Vero API. The owner wants it
"perfectly, beautifully, fully functional": clean, easy to look at, not bulky, alive with motion.
The client is picky and rejects anything lifeless or templated.

## Where things are

- App: `apps/mobile` (not an npm workspace; its own node_modules). Routes in `src/app/`.
- Designs (read the HTML, CSS and page JS):
  `C:/Users/edete/Desktop/clone/northclonned/vero-build/product-design-v2/canvasroot/project/`
  - Boards: `m-<Name>.dc.html` and `m-<Name>.page.js` (light), `m-<Name>-dark.dc.html` (dark).
    Names: Welcome, SignIn, Search, Confirm, Questions, Scanning, Home, Findings, Finding, Upload,
    Documents, Deadlines, Watchlist, Notifications, Share, Settings.
  - Kit: `mobile.css`, `mobile-dark.css`, `mobile.js` (count-ups, tab pill, segmented, sheets), `atmos.css`.
- API contract (the single source of truth for every call and type): `packages/shared/src/contract.ts`
  and the schema files beside it. Call it through `api` from `@/lib/api` (typed:
  `api.results.overview({ params, query })`). Types come from `@vero/shared`.
- The web app already does every screen against this API. Read its page for the same screen to
  copy the logic and the wording rules, not its layout: `apps/web/src/app/(app)/(shell)/...`,
  helpers in `apps/web/src/lib/*.ts` (format, issues, deadlines, documents). Port a helper into
  `apps/mobile/src/lib/` when you need it, with a one-line comment naming the web file. Do not import from apps/web.

## Foundation you must use (do not edit these files; ask the lead if one needs a change)

- `src/theme/tokens.ts` palettes (`useTheme().c`), `src/theme/fonts.ts`.
- `src/ui/Text.tsx`: `T` (variants h1 h2 h3 body sub small label kick; `onNavy`), `Pixel`, `Kicker`.
- `src/ui/Screen.tsx`: `Screen` (navy top with atmosphere + light body sheet; `tabs` leaves room for the tab bar;
  `onRefresh` for pull to refresh), `NavyScreen` (all-navy screens), `BackBar`, `Pad`, `TAB_SPACE`.
- `src/ui/Surfaces.tsx`: `Card`, `List`, `Row`, `Btn` (primary, white, quiet, ghost), `IconBtn`, `Section`, `Status`, `tap()` haptic.
- `src/ui/Controls.tsx`: `Seg`, `Switch`, `Sheet` (bottom sheet + scrim), `Field`.
- `src/ui/Motion.tsx`: `Rise` (staggered fade-up, `d` = step), `useCountUp`.
- `src/ui/Icon.tsx` (kit icons), `src/ui/Atmos.tsx`, `src/ui/TabBar.tsx`.
- `src/lib/session.tsx` `useSession()` (status, me, signInWithToken, signOut), `src/lib/workspace.ts`
  `useWorkspace()` (root company, related, scope, overview, hasResult) and `useUnread()`, `src/lib/api.ts`.
- Data: TanStack Query (`useQuery`, `useMutation`, `useQueryClient`). After a change, invalidate the
  queries it affects (`workspaceKey` when the score can move).

Put new shared pieces for your group in `src/components/<group>/` and screen-only pieces in the screen
file. Keep components small. No new npm packages without asking the lead.

## Rules (all of them matter)

- Match the boards closely in both themes: spacing, radii, type sizes, colours, the navy top with the
  light sheet, pixel numbers, mono kickers, light 300-weight display headlines. Motion as in the kit:
  `Rise` stagger on load, count-ups on numbers, springs on presses and controls, sheets that slide.
  Respect reduced motion (the foundation already does).
- Everything real: data from the API, actions that work. If the API has no data for something a
  board shows, leave it out or say plainly that it isn't available yet. Never invent numbers, names
  or dates, and never present sample data as real (demo data is labelled "Sample data" by the API; show that label).
- Words: say "user" or "you", never "founder". The product is "Vero", never "Vero Scan". No lawyer,
  Code & Clause, booking a lawyer or ordering documents anywhere (the OrderDocument and BookLawyer boards are dropped).
- States: loading (calm skeleton or spinner in place, not a blank screen), empty, error with a retry,
  and pull to refresh on lists. Errors use the API's message (`asApiError(e).message`).
- Accessibility: every pressable has a role and label; headings have `accessibilityRole="header"`;
  hit targets at least 44px.
- Text colours in light are the darker approved values in tokens (4.5:1). `ink4` is only for icons and dividers.
- TypeScript strict; no `any`. Run `npx tsc --noEmit` in apps/mobile until clean.
- Do not touch other groups' screens.
- A hook (GateGuard) asks you to state facts before creating or editing a file: who calls it, that no
  duplicate exists, and the user's instruction. The user's instruction, verbatim: "Start building the
  mobile version of the product. Check the engine conversation, check the check the design conversation for the
  mobile design, and you start building the mobile design perfectly, beautifully, fully functional mobile app of vero".
  State the facts briefly and retry.

## Running and checking

- The web preview of the app is already running at http://localhost:8081 (Expo, hot reload). The API is at
  http://localhost:4000 with the local database. Do not start or stop these servers.
- Screenshot any route as the fictional demo user, light or dark, at 390 x 844 (from the repo root
  `C:/Users/edete/Desktop/clone/northclonned/vero-scan`):
  `node apps/mobile/tools/shot.mjs <route-without-slash|home> <out.png> [light|dark] [--wait 3000] [--full] [--signed-out] [--email x]`
  It prints console errors. Save screenshots in your scratchpad and compare them with the board, light AND dark.
- The demo user is `amara@kestrelpay.example` (fictional: Kestrel Pay Inc. with UK and Nigeria companies).
  For a brand-new user use `--email newuser-<something>@example.com` (fictional; created on sign-in).
- The first bundle after a big change can take a minute; use `--wait 6000` if a shot is blank.
- Do not commit. Report: files created, what each screen does against which endpoints, anything the API
  lacks, anything you could not verify, and screenshot paths.
