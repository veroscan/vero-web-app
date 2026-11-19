# Scan engine: scenario audit

15 Nov 2026. This page checks the core engine against the situations a real company can be in, using fixture sources and made-up facts only (no provider was asked). It tests the owner's standing decisions: an urgent finding caps the score at 74, coverage is always shown, empty document slots are unscored, thin areas are limited and a thin first result is an "Early read". It also checks the honesty rules: a source that couldn't be checked is never a pass or a fail, a registry miss is never "doesn't exist", Delaware is never live, and no rule is approved by a lawyer yet.

**The specification lives in three test files.** Their `describe` and `it` titles read as plain sentences:

- `packages/rules/test/scenarios/engine-scenarios.test.ts` runs the pure engine (`runEngine`, `scoreFindings`, `computeDeadlines`) over a made-up world (`world.ts` in the same folder): one company per MVP country, with healthy facts and helpers that break one thing at a time. It has 93 tests.
- `apps/api/test/scenarios/pipeline-scenarios.test.ts` runs the real pipeline: `startFullScan`, the scan job, the retry job and monitoring re-scans, on embedded Postgres with row-level security and fixture connectors.
- `apps/api/test/scenarios/honesty-fixes.test.ts` has one test for each engine bug fixed below.

Where a scenario was already covered well by an existing test, the matrix names that test rather than repeating it.

Key to the Result column: **passes** means the engine already behaves as it should. **Bug fixed** means it didn't, and a minimal fix with its own test went in. **Decision** means it works as written, but whether that is right is a judgement for the owner, so nothing was changed.

## The matrix

### Country and market

| # | Scenario | Expected | Result |
|---|---|---|---|
| 1 | Clean, healthy company with everything on file (GB, NG, US-DE) | Healthy, no urgent issue, more than half of what applies counted, coverage shown; no Verified badge without a lawyer review | Passes |
| 2 | Young company with little checked (each country) | A score is shown but says "Early read", never Healthy. Areas follow the same rule. Empty slots are unscored. The free range shows how thin it is. | Passes. With no documents, all three countries score 100 on 10 to 20 of 64 to 75 checks and say "Early read". |
| 3 | Market mixes: GB+NG, GB+US, NG+GB+US, US-DE+GB+NG, US-DE+EU/FR | Only compliance and AI-and-data rules follow a company abroad, never its filings. EU, FR and other countries add nothing. The score stays between 0 and 100, and an urgent finding still caps it. | Passes |
| 4 | An investors market (`kind: investors`) compared with an operating market | An investor country adds no rules. An operating market adds its overlay and its data-protection register, never its company register. | Passes (pipeline) |
| 5 | France, and other countries not offered | French sources are never asked in a customer scan. French facts, even a "ceased" French record, change no finding and no score. | Passes (pure and pipeline). France-only scans: `france-sources.test.ts`. |

### Sources that couldn't be checked

| # | Scenario | Expected | Result |
|---|---|---|---|
| 6 | Every source unavailable (each country; pipeline "Offline" company) | No fact from a source that is down is known. Anything only a source decides is "to check" (`source_unavailable`). No calendar date comes from a source that is down. The scan is partial. | Passes |
| 7 | One source unavailable, error, waiting, unsupported or ambiguous | `verify` with the matching reason, and `reason_source` names the source. Checks that don't read that source are unchanged. | Passes |
| 8 | A paid vendor waiting, then resolved on retry | Shows "waiting" and is unscored. The retry job asks again and re-scores (`source_recovered`), and the check is then decided. | Passes (pipeline). Same business id reused: `scan-identifiers.test.ts`. |
| 9 | Stale list. Sanctions stale means the whole sanctions check is unavailable. | `unavailable`, never "no match" | Passes (engine). The list logic itself: `reference-refresh.test.ts`, connectors `reference.test.ts`. |
| 10 | Missing identifiers (VAT, ICO number, trademark serials), then added and re-checked | `unsupported`, then "to check" with `needs_identifier` and the source's own words. Adding the number brings the retry forward. | Passes. Engine side in the scenarios. End to end with fake HMRC: `scan-identifiers.test.ts`. |
| 11 | Ambiguous name match ("Twin" company) | Never taken as the company. The candidates are stored. | Passes |
| 12 | Cached paid-vendor answers compared with "check again" | Reused for `VENDOR_CACHE_DAYS`. "Check again" pays once and reuses the business id. Errors and waits are never kept, and sample answers are never kept either. | Passes. `scan-identifiers.test.ts`; sample answers in the scenarios. |

### Findings and scoring

| # | Scenario | Expected | Result |
|---|---|---|---|
| 13 | Sanctions exact match (US-DE) | Urgent defect, capped at 74, `held_by_urgent`. The words say "matches an entry" and "may be another business", never "sanctioned". | Passes |
| 14 | Sanctions possible match | The source says `ambiguous`, so the check is "to check" and a person checks it. Monitoring says "is close to … a person needs to check it". | Passes |
| 15 | Sanctions match on a GB or NG company with no sanctions exposure | Should be urgent | **Decision D2.** No rule scores it. |
| 16 | Company ceased: UK dissolved, in liquidation or in administration; NG inactive | Urgent defect, capped at 74, and says why | Passes |
| 17 | Registry miss: CH or CAC "not found" | "To check", never "doesn't exist" | Passes |
| 18 | Registry miss: Delaware vendor, ICO list, website privacy notice | Should not read as proof of absence | **Decision D3.** It counts as a gap. The words are careful. |
| 19 | Companies House record with no `company_status` | "To check" | **Bug fixed (B2).** It was an urgent "not active" defect. |
| 20 | Urgent finding | Perfect company held at exactly 74, word "Needs work", `held_by_urgent` true, badge says "urgent issues still open" | Passes |
| 21 | Many important findings, none urgent | No cap, and the word follows the number | Passes |
| 22 | Score never above 100 or below 0, always whole (400 random finding sets); deterministic across reruns (pure and pipeline) | Within range, stable | Passes |
| 23 | 60 draft rules `needs_review`, every rule `draft` | Never scored, even with every fact known | Passes (13 + 11 + 18 + 18 = 60) |
| 24 | GitHub facts present | Findings and score identical with or without them | Passes |

### Documents

| # | Scenario | Expected | Result |
|---|---|---|---|
| 25 | All slots empty, some filed, filed but unconfirmed | Empty means "not checked yet". Uploaded but waiting for a person means no `vault.*` facts and still "to check". Confirmed means it counts. | Passes (pipeline) |
| 26 | Person says "we don't have it" | A real gap. Founder IP assignment is critical, so the score is held at 74. | Passes |
| 27 | Blank signature line, then confirmed as signed. Text saying "ignore previous instructions". | Blank line means rejected unless the person says it's signed. The injected text stays a suggestion. | Passes. The Claude helper on, off, failing and injected: `document-helper.test.ts`. |
| 28 | Delaware certificate filed but not validated, validated recently, validated but old | "To check", then pass ("certified"), then gap | Passes. See D7 on who validates. |
| 29 | Free plan range | Uses public data and answers only | **Bug fixed (B1).** A check worked out from documents (Delaware good standing) counted as public. |

### Monitoring

| # | Scenario | Expected | Result |
|---|---|---|---|
| 30 | Monitoring rescan with no change | Recorded, nobody told | Passes |
| 31 | Monitoring rescan with a new urgent finding | Told, in plain words | Passes |
| 32 | Monitoring rescan with a source unavailable | Never a change, even when the score moves | Passes |
| 33 | Score drop | Counted only with a new finding | Passes (`monitoring-changes.test.ts`) |
| 34 | Sanctions match, then the list goes stale, then it is back | Not new | **Decision D6.** It is told again as new. |

### Platform

| # | Scenario | Expected | Result |
|---|---|---|---|
| 35 | Two organisations | Neither sees the other's rows on any table that has `organisation_id`, the new ones included (vendor_record, monitoring_change, organisation_setting, github_*, and 0016/0017 when present) | Passes. The test finds the tables from the schema, so new tables are covered automatically. |
| 36 | Job retried after it finished; scan started twice while one is moving | Nothing more is written. The same scan comes back. | Passes |
| 37 | Deadlines: past, upcoming, none | Past is overdue, near is due soon. No source date means "waiting on a date from the source", never invented. The plain "We check this with Companies House" is shown. Draft rules are flagged. | Passes |
| 38 | Words: no legal conclusion; "doesn't exist" only ever denied; "how we know" never shows a tier number; documents and answers never say "Checked with" | As stated | Passes |

## Bugs found and fixed

- **B1. The free plan range counted a document-based check as public.** `free_plan_evidence` treated any `derived.*` fact as public, but `derived.us.good_standing_current` is worked out only from the vault certificate. Fix: one line in `packages/rules/src/engine.ts`. A derived fact now counts as the facts it reads (`rootInputs`). Test: "the free plan range never counts a check that only a document can decide".
- **B2. A Companies House profile with no `company_status` became the urgent "not active" defect.** `parseProfile` wrote `status: 'unknown'`, and `GB.CORP.STATUS` reads anything other than "active" as a critical defect, so the score was capped at 74 from missing data. Fix: in `packages/connectors/src/sources/companies-house.ts` the status is now published only when the record has one, so the check waits. Test: `honesty-fixes.test.ts`.

No scoring number, weight, rule text or owner decision was changed.

## Decisions needed from the owner (nothing changed)

- **D1. The company badge doesn't look at how facts are known.** `badgeEligibility` counts a "You told us" answer (tier 5) and a self-validated document (tier 4) the same as a Companies House fact. The verification document says only tiers 1 to 3, or tier 4 with an authenticity check, earn "verified". The lawyer review in the last 12 months is today's only safeguard.
- **D2. GB and NG have no core sanctions rule.** Only the US pack has the urgent `US.SANCT.SCREENING`. `GB.SANCT.SCREENING` is "Important", stage 3 and needs sanctions exposure. Nigeria has none at all. A UK or Nigerian company whose name exactly matches a sanctions entry gets no finding and no cap. Monitoring still notifies.
- **D3. Some registry misses count as gaps.** The Delaware vendor not returning the company, a name not found on the ICO list, and the website scan not finding a privacy notice are each scored as a gap, an "Important" one for the first two. Companies House and CAC misses are "to check". The words are careful ("That doesn't mean the company doesn't exist", "That may not mean you haven't paid"), but the score still treats the miss as absence.
- **D4. Delaware status from the vendor.** No rule reads `vendor_status` (correct: never live). As a result, a vendor answer of "void" or "dissolved" changes no finding. Monitoring would still notify "Our licensed data provider now shows the company status as …". Decide whether that notice is wanted, and whether a vendor's "void" should at least make standing "to check".
- **D5. A document outranks a register's bad status.** `NG.CORP.CAC_REGISTRATION` passes on a filed Certificate of Incorporation even when the CAC says "inactive": the satisfied condition is checked before the defect. A certificate proves the company was created, not that it is active now. `US-DE.CORP.ENTITY_ON_RECORD` has the same shape.
- **D6. After a source outage, a known problem is told again as new.** A rule that was "to check" during an outage and is a gap again afterwards counts as a new finding (the code says so deliberately). A sanctions match seen before a stale-list week is notified again. This only happens when the outage lasts until the next monitoring scan.
- **D7. "Validated" is the person's tick.** The Delaware certificate becomes "certified" when the person sets `validated` at confirm. Nothing checks the number on Delaware's validator, although the rule text says "We'll confirm its number on Delaware's own website". The build brief allows "validated by the user", so the words may need to change, not the code.
- **D8. The website is tier 1.** `web.policy_scan` uses method `official_live`, so its facts show "Checked with your website today" and are stored as tier 1. The company's own website is not an official source.
- **D9. Match confidence is not used once a source says "found".** Tier 3 list matches are meant to be "probable" when match confidence is low. The engine scores them in full.
- **D10. "We'll try again" isn't kept.** When Companies House answers the main record but a sub-section fails, the result is `found` with "We'll try again". `found` is never retried, so it waits for the next scan.

## Surprising, but not wrong

- With no documents, all three fixture companies score **100** on fewer than a quarter of their checks. "Early read" and the coverage line carry the honesty here, and the free range shows "95 to 100". That is right under the owner's rules, but worth seeing on a real screen.
- The fixture sanctions source "matches" every made-up name except the Kestrel Pay ones, because its default scenario is `found`. Any demo or test company with another name is a sanctions match in sample mode. A US-DE company is then capped at 74. A GB or NG company is not affected, because of D2.
- Founder IP assignment is critical. Saying "we don't have it" alone holds a perfect company at 74.
- Adding `fr` or `eu` to `SANCTIONS_LISTS` screens every company against those lists, not only French ones. That is probably right for sanctions, but it isn't stated anywhere.
- Coverage totals include the 60 rules still waiting on a lawyer as "to check". So "Early read" can't be escaped until those rules are approved, or a company has many other checks.

## Real-data risks the samples can't show

- **Name matching.** Fixtures match on exact names. Real registers return "Ltd" or "Limited", trading names and near matches. Ambiguous results stop the check, which is safe but could happen often. Exact matches with a low confidence are scored in full (D9).
- **Status words.** `GB.CORP.STATUS` passes only on `active`. Companies House also uses `open`, `registered`, `converted-closed` and `voluntary-arrangement`, and for some company types the normal state is not `active`. Any of these would be an urgent defect. Mono's CAC status strings are unknown: they are lower-cased, and the rule needs exactly `active` or `inactive`.
- **Sanctions.** Real lists produce false possible matches on common words, and the UK list is about 50 MB. The 24-hour freshness limit has never met a real refresh failure.
- **Website scan.** JavaScript-rendered sites, cookie walls and robots rules will make "not found" common, and that is scored as a gap (D3).
- **Vendor timing.** The Middesk report wait time and Mono's field names are unconfirmed. A "not found" is cached for 30 days.
- **Dates.** Every "today" is UTC. Deadlines near midnight and the Companies House identity-verification dates have never met real data.
- **Documents.** The heuristic signature check reads text only. A scanned PDF with a real signature reads as "unknown", and a printed blank line reads as unsigned.
- **Answers.** Questionnaire answers are tier 5 but decide many rules in full. Real people will answer "yes" to things that aren't so.
