# Launch checklist: what is left for the owner

Written 26 Nov 2026, after the web polish on branch `web-polish`. The product, the screens, the engine and the
tests are done. What remains needs your accounts, your money or your lawyer, so it can't be done for you.

## 1. Keys and settings (in `vero-scan/.env`)

Copy `.env.example` to `.env` and fill these. `docs/GET-YOUR-KEYS.md` has a direct link and steps for every key.
Never paste a key into chat.

**Needed to run at all in production**
- `NODE_ENV=production`
- `APP_ENCRYPTION_KEY`: a new random value (`node -e "console.log(crypto.randomBytes(32).toString('base64'))"`).
  The one in the example file is for development only.
- `DATABASE_URL` (and the migrator URL): your hosted Postgres.
- `WEB_BASE_URL`, `API_BASE_URL`, `ALLOWED_ORIGINS`, `WEBSITE_ORIGINS`: your real https addresses.
- `TRUST_PROXY=true` behind a load balancer. Keep `COOKIE_SECURE=true`.
- `RESEND_API_KEY` and `MAIL_FROM` on your own domain: without them sign-in links can't be emailed.
- `SPACES_*`: file storage for uploaded documents.

**Switches more of the product on**
- Register and source keys (Companies House, OpenCorporates, USPTO, EUIPO, HMRC and the rest): each one that is set
  stops that source showing as "down" in scans.
- `ANTHROPIC_API_KEY` and `AI_DOCUMENT_HELPER_ENABLED=true`: reads uploaded documents more deeply.
- `MONITORING_ENABLED=true`: automatic re-checks of followed companies (the watchlist says "re-checks are off" until then).
- `STRIPE_*`: paid plans and checkout. Until set, the plan page says plainly that billing isn't switched on.

After keys are in: run `npm run db:migrate`, start the API and web, and run one real scan per country you sell in.

## 2. The lawyer signs the rules

Every rule pack is a draft until a lawyer approves it, and the product says so on every result and report.
1. Give your lawyer a staff account with the Lawyer role (`/admin` → the person → Staff access → Lawyer).
2. They review each country's pack on `/admin` (it lists the rules still marked for review) and the review queue on
   `/review/work`.
3. When satisfied, an admin approves the pack on `/admin`: it asks for the approver's name and a confirmation.
   The approval is recorded in the audit log, and "draft, not yet reviewed" disappears for that country.

## 3. Two things only you can decide

- **The score font.** Lowres Pixel (the pixel numbers) is licensed for personal use only. Buy a commercial licence,
  or say which font should replace it, before launch.
- **Hosting.** Where the web app, API, database and file storage run. The app needs nothing unusual: Node 24,
  Postgres 16+, an S3-compatible bucket, and outbound HTTPS to the registers.

## What was verified before hand-over

- Typecheck, lint and the licence check (419 packages, no copyleft) pass.
- Unit and integration tests: over 8,200 pass.
- HTTP end-to-end (sign-in, scan, upload, score change, public link): 29 checks pass.
- Browser end-to-end on a production build, with accessibility checks (WCAG 2 A/AA) on every screen in light and
  dark, desktop and phone: 102 of 103 passed in the last full run; the remaining one timed out when the machine
  suspended and passed on its own rerun.
