# Backend gaps found while building the web app

Nothing here was changed in `apps/api`, `packages/rules` or `packages/shared`. Each item says what the
screen does today so nothing is invented.

| # | Where | The gap | What the web app does until it's closed |
|---|---|---|---|
| 1 | `POST /v1/auth/magic-link/verify` | `magic_link_invalid` is one answer for an expired link and a used one, so the screens can't tell them apart. | A browser remembers the links it used and says "already been used". Anywhere else, the words cover both. |
| 2 | `POST /v1/companies/:id/projection` | Takes no `scope` and matches rule keys on one company, so it can't project a group, and the same rule key can exist on two companies. | One company: the API's figure. A group: the sum of each fix's `points`, capped at 100 and shown as "about". |
| 3 | `GET /v1/companies/:id/areas/:layer` | Takes no `scope`, while Home's area scores can be for the group. An area page can show a different number from its Home row. | Area page has a button per company in the group. |
| 4 | `issueDetailSchema` | Has no clause text or proposed wording, so the design's "What your contract says" redline has nothing real to strike. | Shows the API's `fix` text in the same panel. The strike-through appears when a clause is supplied. |
| 5 | `registryCandidateSchema` | Has no registered agent, which the design's Confirm screen shows. | Row left out. |
| 6 | Scan pipeline | Nothing emails when a scan finishes or a source recovers: `notifyOrganisation` is in-app only. The designs promise "We'll email you". | Copy changed to point at What's new. |
| 7 | `scanSchema.checksDone` | Counts a source that is down as done, so a partial scan reads as complete. | The screen counts `sources` where `down` is false. |
| 8 | `/v1/companies` | There's no "current company" for an organisation with several parents. | Uses the oldest company with no parent. |
| 9 | Fixture connectors | `CompanyRef.scenario` can't be set through the API, so a single source can't be made to fail from a test. | The end-to-end test sets one source to `error` with SQL. Names with "broken" fail every source. |
| 10 | `sourceName` in fixtures | "official sanctions" and "the USPTO" read as sentence fragments on a row. | The web app has a title per `connectorId`, falling back to `sourceName`. |
| 11 | "A person will look it up" (Not found) | No endpoint takes this request. | Links to the coming-next lawyer booking route. |

Rate limits: behind the web server's `/v1` rewrite, the API sees one client address unless `TRUST_PROXY=true`.
This is a deployment setting rather than a bug, and `.env.example` says so.

## Seen in the API log during end-to-end runs

- `DeprecationWarning: Calling client.query() when the client is already executing a query` (pg). Something in the API runs two queries at once on one client. It works today, but pg 9 removes it. The log doesn't say which route.

## Uploads through the /v1 rewrite

Measured with a fake upstream behind the real `next start` build: before the fix, every upload over 10 MB failed, at any speed. Next.js cuts a body passing through a rewrite at `experimental.proxyClientMaxBodySize` (10 MB by default), the API then waits for bytes that never come, and it ends in a 500 at 30s. So the limit was 10 MB rather than a connection speed. `next.config.ts` now sets it to `MAX_UPLOAD_MB` + 1. The 30-second limit below only counts time with nothing moving, so a slow upload that keeps sending is not cut off. The cost: the web server holds up to that much of each upload in memory while it passes through.

## The /v1 rewrite has a 30-second limit

Measured with a fake upstream behind the real `next start` build. The proxy opens a new connection for every call, so an idle connection can never be reused and reset: 130 calls, including 60 spaced at the upstream idle cut-off, had no failures. An upstream answer in 25s came through as 200. One taking 35s became a plain 500 at 30.04s, logged as `socket hang up` (code `ECONNRESET`). So the proxy errors in the overloaded run are what an API slower than 30s looks like, not a fault in the rewrite. A real user would only hit this if a call took over 30s, and sees the plain error state with Try again. `CONNECTOR_TIMEOUT_MS` (20s) keeps register searches inside it. Not measured: large uploads on a slow connection.

## Passed checks have no wording of their own

`issueSummarySchema` sends `headline`, which always describes the problem ("annual accounts are overdue"), even when the outcome is `pass`. Beside "Passed" that says the opposite of what's true. The rule's own `title` ("Annual accounts") exists in `packages/rules` and is stored on each finding, but isn't in the summary. **Please add `title` to `issueSummarySchema`.** Until then the web app names a passed check by its `area` ("Filings"), so several rows in one area can read the same, and hides the problem text on a passed issue's page.

## Backend status of the items above

The backend pass closed what it honestly could. What each one now means for the web app:

| # | Status | What changed, or why it was left |
|---|---|---|
| 1 | Fixed | The code stays `magic_link_invalid`. The error now carries `reason: 'used' \| 'expired'`, available as `ApiError.reason`. A made-up token gets no reason. |
| 2 | Fixed | `POST /projection?scope=group` takes `fixes: [{ companyId, ruleKey }]`, so the same rule on two companies stays two fixes. The response adds `heldByUrgent`. |
| 3 | Fixed | `GET /areas/:layer?scope=group`. |
| 4 | Left | There is no clause text. The classifier never keeps document text, on purpose, and nothing extracts clauses. It would need the Claude classifier and a Client decision. |
| 5 | Fixed | `registryCandidateSchema.registeredAgent`: Delaware only, null elsewhere. |
| 6 | Fixed | A real email (template `scan-result`) goes to owners and admins when a scan someone started finishes, and when a source recovers. A plain re-score sends none. It holds no score. |
| 7 | Fixed | `checksDone` no longer counts a source that is down. `checksDown` is new, so done + down + waiting = total. |
| 8 | Left | Choosing a current company is a product decision. The oldest company with no parent is a fair default until then. |
| 9 | Left | Letting the API set a test scenario would put a test control into production code. |
| 10 | Fixed | `scanSourceSchema.title` is a name that stands alone on a row. |
| 11 | Fixed | `POST` and `GET /v1/registry/lookup-requests`. It reaches the lawyer team, and the client is notified. Rate limited. |
| Passed checks | Fixed | `issueSummarySchema.title`, the rule's own name. Use it beside "Passed". |
| pg warning | Fixed | One overview path ran two queries at once on a transaction. It now runs them in turn. |
| 30-second limit | Left | No endpoint takes that long on a normal machine, measured. The exception is a large upload on a slow connection: 25 MB needs about 7 Mbps. That's a web server setting, not an API change. |
| `TRUST_PROXY` | Left | A deployment setting, as this file says. |

An oversized upload is refused in the browser, before sending. Sent through the `/v1` rewrite, the API's 413 sometimes came back as a 500, because the API answers while the body is still arriving. A client that calls the API directly still gets the 413.

## The to-do list isn't reachable on Free

The decision says an empty document slot stays "Not checked yet" on every plan and becomes the to-do list. On Free, `GET /issues?outcome=to_check` returns nothing and `GET /issues/:ruleKey` refuses anything outside the top three, so a Free user never sees those items or the "We don't have it" choice. The API would accept the POST. Left as it is for now: the Client's product document gives Free no uploads, so a Free user couldn't act on the list anyway. Free still says what its range rests on ("Based on 24 of 81 checks"). The web app shows what the API sends.

## Seen on screen, for the owner to judge

- **The Area screen's title** is the area's description, not the design's written sentence, because the API has no such sentence.

## Documents, orders and bookings

| Where | What the API lacks | What the screen does |
|---|---|---|
| Book a lawyer | No availability or calendar. The design's grid of real times can't be real. | Asks when would suit, says there's no live calendar, and says it isn't booked until a lawyer confirms. No "Add to your calendar". |
| Book a lawyer, order | `priceMinor` is null, and there's no payment or turnaround. | Shows "Not set yet" and "Your lawyer will say", and says nothing is charged. |
| Order | No fields for who signs. No email goes to a signer. The design says "We'll send them the deed" and "It files itself here". | Name and email go in `notes`, labelled for the lawyer, with "We won't email them". The steps say you add the signed copy yourself. |
| Document not accepted | Only a one-line `rejectionReason` and a signature hint: no pages, names or who signed. | Shows those words, and a figure clearly labelled as an example. The design's per-person rows and page 4 aren't real. |
| Add a document | `suggestion` has a label only, with no parties or dates, so "between X and Y, signed on 3 November" can't be said. | Shows the label and the signature hint. |
| Add a document | Upload has no progress over the typed client. | Shows that it's uploading, with no invented percentage. |
| Documents on Free | `GET /documents` sends no slots on Free, on purpose. | Shows the upgrade path rather than an empty list. |
| Documents | Connections always answer "not connected". | Shows that plainly, with no Connect button. |
| Scan results | A filed or removed document re-scores in the background, with no signal to wait on from the document calls. | Says "Your score is updating". |

## Deadlines and company records

| Where | What the API lacks | What the screen does |
|---|---|---|
| Deadlines, all plans | `deadlineWatching` isn't read anywhere in the API, and no job re-checks a company on a timer. Only reminders and retries of failed sources run on their own. So Scale has no real watching behind it yet. | Free and Growth say a date is checked "when you run a check" and point to Scale. Scale shows the API's own "We check this with...". It makes no promise about how often. |
| Deadlines | No retrieval date on a deadline. | "Last checked" comes from the company's `checkedAt` in the records response, for dates from a register only. |
| Deadlines | No calendar feed, so the design's "Add these to your calendar" has nothing behind it. | Left out. |
| Deadlines | Marking done takes no proof. The design says "ask for proof". | Marks it straight away with an Undo on the row, which then says "You told us this is done". |
| Deadlines | The design's penalty line ("$25,000") and "one of your two directors" aren't on a deadline. | Left out. Only the title, company, tracking words and basis show. |
| Records, every country | `howWeKnow` says "Found on the X list" for any list check, including when the answer was no. | Worded on the web as "Checked the X list". The API should send this itself. |
| Records, every country | The answer for a register lookup is "No" (`.listed`, `.registered`, `.filed`). | Shown as "Not found", with "That isn't proof". The API should send this itself. |
| Records, every country | `needsYou` is only ever true for a missing Delaware certificate. | The web also counts overdue dates, not-found rows with an open issue, a possible sanctions match and an ambiguous source. |
| Records, every country | The toast in the design says "Nothing has changed". The API doesn't compare one check with the last. | Says "Checked again just now" only. |
| Records, Delaware | No rows for franchise tax or the EIN. The design's "We confirmed it on Delaware's website" isn't something we do. | Left out. Certificates say "You uploaded this and we read it". |
| Records, Nigeria | No rows for annual returns or a payments licence, because there are no facts for them. | Left out. The status report band explains what "Active" does and doesn't show. |
| Records | Each row's link to an issue is mapped on the web from a fact to a rule, because the API doesn't send it. | A link only shows when that issue is really open for this company. |

## Trust and account

| Where | What the API lacks | What the screen does |
|---|---|---|
| Plan | No way to ask for a plan, no billing and no prices. Only staff can set a plan. | Says there's no checkout, shows "Not set yet", and sends the question to a call with a lawyer. Nothing changes until staff change it. |
| Plan, Deadlines | Nothing runs `deadlineWatching`, `rulesChangeAlerts` or `annualVerification`. | Scale shows "Planned" for each. `lib/plan-words.ts` holds the words: set `live: true` there when one runs, and Plan and Deadlines follow. |
| Lawyer review | No reviewer name on a verdict. | Says "A lawyer read this on {date}", with no name. |
| Lawyer review | Nothing says whether a filed document is queued for a lawyer, and there's no per-document question. The design's "Does it move ownership...?" isn't sent. | Says a lawyer hasn't read it yet, shows the slot's reason, and offers "Ask a lawyer to read it". |
| Badge | No image or embed for a website, and a token can't be shown again. The design's "badge for your website" has nothing to put on a site. | Offers the link, shown once. To get a new one, the badge is issued again. |
| Badge | No projection of what a fix would do to the badge. The design's "takes your score to about 80" isn't sent. | Shows the blockers as sent, and links to the issues. |
| Badge | No sample public report, so the design's "See what the public page looks like" has nowhere to go. | Left out. |
| Shared report | No way for a reader to ask for documents. | The design's "Request documents" is left out. |
| Shared report | `checked` has no status or date of its own. | "Checked" or "Not checked" is read from the words, and the report's own date covers it. |
| Settings | No email preferences, calendar feed or time zone. | Left out. Says everything comes to What's new, and that you can't choose yet. |
| Settings | No way to add a company after the first onboarding that keeps the others' results in view. | "Add a company" is left out. |
| Settings | No recovery codes for two-step sign-in, and no QR code (the web has no QR library). | Shows the key and an authenticator link. |
| Invitations | No way to see which team an invite is for before joining. | Says "a team", and joining takes a button press. |
| Shared report, badge link | The public token starts with the organisation's id, so that id shows in the link's address. The API needs it to find the right tenant. | The page and the API's answer show no ids, but the address does. Only the API can change this. |

## The lawyer desk, admin and the report

| Where | What the API lacks | What the screen does |
|---|---|---|
| Review desk, Admin | `/v1/me` doesn't say if someone is staff, so the app can't show them a way in, and a lawyer sees the admin tab until the API refuses them. | Staff reach the desk at `/review`. Each page draws only after the API answers, and a refusal shows nothing else. |
| Review document | No document text, clauses or pages, so the design's page with a flagged clause and suggested wording can't be real. | Shows the file's facts, a link to open it, and the findings as sent. Nothing suggests wording. |
| Review document | No rule pack status on a task or finding. | Says in words that rules are drafts until Code & Clause approves a pack. |
| Review queue | No "3 of 9 read" per client, no reviewer names, and no next task. The design's "Up next" and "9 left" aren't sent. | Shows You, Someone else or Not assigned. |
| Review document | Reviewer names aren't on verdicts, so the desk doesn't show who decided. | Dates and verdicts only. |
| Orders and calls | The list doesn't send an item's current status, or the meeting link and time for a booking. | Says "New" or "Updated before", and lets staff set a status. There's no way to set a meeting link here. |
| Orders and calls | `note` on an update isn't stored or passed on, as far as the response shows. | Labelled "Note for the record". |
| Admin | No "what changed" text per pack, no "mark as reviewed" and no review date. | Left out. Shows status, approver, date and counts. |
| Admin | Any admin can approve a pack, with whatever name they type. Nothing checks that they're at Code & Clause. | The confirmation says what it means. The API should check this. |
| Admin | The users list doesn't send an organisation's plan, and has no search. | Lets admins move a plan without showing the current one, and pages through people. |
| Report | No file from the API, and no PDF library in the stack. | Print or save as PDF, through the browser. |
| Report | No per-fact provenance across a report, or the design's rows like "Code ownership". | One row per company from the records, plus lawyer review, method and rule packs. |
| Report | The report isn't saved, so printing later reflects the latest scan. | Shows the scan's date on each page. |
