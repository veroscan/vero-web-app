# Vero backend v2: plan and gap list (19 Nov 2026)

This plan brings the API in line with the v2 product scope (`vero-build/product-design-v2/SCOPE.md`). Vero is a standalone scan for any user: VCs, companies and individuals. There is no lawyer in the product, and any country can be scanned. The engine (`docs/ENGINE-STATUS.md`, `docs/GLOBAL-COVERAGE.md`) is not changed here, and nor are the scoring rules (owner decisions, 6 Nov).

## Owner decisions this plan follows (19 Nov 2026)
1. **Badge:** a score of 80 or more, no open urgent gap, at least half the checks counted, and a full scan in the last 90 days. No lawyer condition. The badge says only what Vero checked.
2. **Ownership:** anyone can scan and follow any company, read-only. The team that adds a company as its own can answer questions and upload evidence. Checking that a claim is genuine comes later.
3. **Billing:** Stripe checkout and webhooks, switched off until `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set. Until then, an admin changes plans by hand.
4. **Coordination:** nothing in `packages/*` or `docs/*` (other than this file) is edited, and no test suite is run, until the engine session says its builders are done. Tests then run one at a time through its lock script.

## Design: own and follow
Every company row belongs to one organisation, under the row-level security that exists today. A new `company.relationship` column takes `own` or `follow`.

- **Own:** everything that works today: answers, documents, attestations, "we don't have this", deadlines done and undone, sharing and the badge.
- **Follow:** a public-data scan of someone else's company, kept in the follower's own organisation. The questionnaire, vault, attestations, missing-document statements, marking deadlines and the badge refuse with a plain 403 ("You follow this company, so you can see its public record but can't add evidence for it."). Findings that need the company's own evidence stay "to check". Issues still list "what proof clears it", without an upload.
- **No sharing across organisations.** A follower never sees an owner's answers or documents. An owner who wants an investor to see more sends a share link, which already exists.
- **Owning a company you follow** turns a followed row into an owned one (`relationship` changes and is audited), for a team that turns out to run it. This is allowed today without checking the claim is genuine, per decision 2.

## Work, in order
| # | Area | What gets built | Tests |
|---|---|---|---|
| 1 | Data | Migration: `company.relationship` (own, follow; default own, so existing rows stay own). Plan limits `followLimit` in `plans.ts`. | Migration, RLS, isolation |
| 2 | Guards | One helper, `requireOwned(company)`, used by questionnaire, attestations, vault upload, confirm, delete, missing, deadlines done and undone, badge issue, and shares create. Followers get 403 `follows_only`. | Every route: own vs follow, and each role |
| 3 | Watchlist | `GET /v1/watchlist` (followed companies: score or range, word, coverage, last scanned, last change), `POST /v1/watchlist` (from a registry candidate or a country and name: creates a follow row and starts a public scan), `DELETE /v1/watchlist/:companyId`, `POST /v1/companies/:id/own`. | Limits, duplicates, other countries, coverage level |
| 4 | Alerts | Monitoring also re-scans followed companies on the follower's plan cadence, with the same caps and cost guard. The same change rules apply (new urgent or important issue, status change, sanctions, a drop of 5 or more with a new issue), and alerts go to the follower. | Fake clock, caps, no alert for "couldn't check" |
| 5 | History | `GET /v1/companies/:id/history`: every finalised scan with date, trigger, score or range (by plan), word, coverage, method and rule-pack versions, and the change summary when there is one. | Plans, order, a company with no scans |
| 6 | Home | Overview adds `whatChanged`: the latest change summary since the person last looked, or null. | Empty, monitoring change, manual scan |
| 7 | Proof | Issue detail adds `proof: [{ slotKey, label, state }]` (the documents that clear it) and `canAddEvidence` (own and plan has vault). Follow rows get the list without the upload. | Own, follow, Free |
| 8 | Badge | `badgeEligibility` drops the lawyer condition and adds "a full scan in the last 90 days". The blockers are reworded, and the method version bumped. Follow rows have no badge. | Every blocker, the boundary days |
| 9 | Out of scope | Orders, bookings and the customer side of lawyer review are removed: routes, tables kept but unused, plan entitlements `lawyerReviewsPerQuarter` dropped, and lawyer words removed from responses. The admin rule-pack approval and staff stay, because Code & Clause still reviews the rule packs. | Routes gone (404), nothing references them |
| 10 | Billing | Stripe Checkout session, customer portal link, signed webhook (`checkout.session.completed`, `customer.subscription.updated` and `.deleted`, idempotent by event id), plan sync, all audited. Off until the keys are set, and then the routes say "Payments aren't switched on yet". Prices come from Stripe and are never hard-coded. | Signature, replay, downgrade, unknown customer |
| 11 | Countries | Shared country list becomes ISO 3166, with `countryCoverage` on company create, registry search and overview, so pickers aren't stuck on three countries. | Every level |
| 12 | Audit fixes | Public share and badge tokens stop exposing the organisation id; TOTP recovery codes; "add another company" works end to end; the four untested screens' API paths are covered. | As listed |
| 13 | Final pass | Full chain through the lock script: lint, types, licences, all unit and API tests, HTTP e2e. Then a scenario audit of every route with every role and plan. | Green or reported |

## Files the engine session keeps (19 Nov 2026)
These stay the engine session's even after its builders finish. A change needed in any of them is asked of that session, not made here:
- `apps/api/src/modules/scans/` (pipeline.ts, facts.ts and the rest)
- `apps/api/src/db/reference-sync.ts` and the admin rule-pack approval route
- `apps/api/test/scan-*.test.ts`, `scoring-decision.test.ts` and `scripts/e2e-http.ts`
- `scripts/rules-review.ts`

A followed company simply has no answers or documents, so the pipeline needs no change for step 1: its evidence rules come out "to check" as they do today. Step 4 calls `startFullScan` from the monitoring module, without editing scans. The questionnaire now also holds `eu_offers_services`, `eu_establishment` and `uk_establishment` (question 2) and `eu_trademark_numbers` (question 23). The follow guard refuses all of them alike.

## Open with the client (from her 8 and 12 Nov messages, still unanswered)
- **Who approves rule packs.** The engine was told Code & Clause's lawyers will. She wants no Code & Clause anywhere and said "We need to talk about this". The approval route stays, and it doesn't name who approves.
- **The badge without a lawyer.** The owner decided on 19 Nov (decision 1). She hasn't confirmed it.
- **Removing lawyer booking and document ordering.** Step 9 follows the v2 scope. She hasn't confirmed it.
- **Not yet given:** the disclaimer wording, Vero's legal entity, address and contact email, and how the Claude for Startups credits apply.
- **Plans and prices.** None given, so plan limits stay proposals and prices come from Stripe once set.

## What still needs keys (unchanged)
Every source that needs a key stays `unavailable` until it is set. Stripe joins that list: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the price ids for each plan.
