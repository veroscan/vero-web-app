# Rule pack coverage

Draft content for Code & Clause to review. Nothing here is legal advice, and every pack stays `status: draft` until a named lawyer approves it through the admin tool.

## How the packs were encoded

- Every rule cites the map line it came from in `sources`. `test/packs.test.ts` opens the map and fails if the line isn't there.
- A rule is `confidence: needs_review` if, and only if, a cited line is tagged `[verify]`, `[?]` or `[K]`, or sits in the map's section 6 ("to confirm before encoding"). The same test enforces both directions. These rules show `verify` and aren't scored.
- `[verify]` is applied to the whole map row, even where it only qualifies the checking route or one threshold. That is the literal instruction, and it has consequences: see "Questions for the lawyer".
- Each rule's severity, cost-of-delay inputs and plain-language text are proposals. The maps give layer, stage, trigger and tier, but no severity.
- Consequence text only states a penalty or date where the map gives one. Otherwise it describes the business effect, such as what comes up in due diligence.

## Counts

| Pack | Rules | needs_review |
|---|---|---|
| US (federal items for Delaware companies) | 57 | 13 |
| US-DE | 83 | 11 |
| **Delaware company total** | **140** | **24** |
| GB | 126 | 18 |
| NG | 109 | 18 |

## Left for later, by map section

These aren't encoded yet. Items marked "optional" or "event" don't fit a pass or gap on a normal scan.

### Delaware map

| Section | Item | Why it's left |
|---|---|---|
| 1 | Entity structure selection | Stage 1 choice, not a check |
| 1 | Certificate of Amendment, Merger, Dissolution | Event-driven; would need an event fact |
| 4 | CTA applicability and BOI assessment | Not applicable to US-formed companies, as the map says. Only the foreign-entity rule is encoded |
| 12 | Radio spectrum licence, equipment authorisation | Narrow sub-triggers (spectrum, hardware) the questionnaire doesn't ask yet |
| 19 | Cyber liability insurance | Optional |
| 21 | Product terms beyond the published terms check | Covered by US-DE.COM.TERMS for now |
| 22 | Joint venture, distribution and reseller agreements as separate items | Rolled into one commercial agreements slot |

### UK map

| Section | Item | Why it's left |
|---|---|---|
| 1 | Company name availability search | Stage 1 lookup, not a finding |
| 1 | Change of director and registered office filings, share transfer documents | Event-driven |
| 1 | Share allotment filings (SH01) as their own rule | The fact is published and backs GB.FUND.ROUND_DOCUMENTS |
| 2 | Construction Industry Scheme | The map says n/a for most tech companies |
| 2 | Tax reliefs, R&D relief, Patent Box | Optional |
| 4 | FCA Connect application, regulatory sandbox | Process evidence or optional |
| 5 | Payment system operator designation | Rarely applies; the compliance row is encoded |
| 6 | Code powers, numbering, premium rate, spectrum | Narrow sub-triggers, and all tagged [verify] |
| 9 | Registered designs | Optional |
| 10 | Cybersecurity insurance | Optional |
| 11 | Business rates | Tagged [verify], and needs a VOA route |
| 12 | COSHH, HSE notification | The map says this rarely applies to software companies |
| 16 | Bug bounty policy | Optional |
| 17 | Partnership and joint venture agreements | Only where entered into |

### Nigeria map

| Section | Item | Why it's left |
|---|---|---|
| 1 | CAC Form 1.1, incorporation fees and stamp duty | Replaced by the status report, or informational |
| 1 | Register of Secretaries | Only if a secretary is appointed; part of the statutory registers slot in practice |
| 2 and 3 | Tax exemption and incentive approvals | Optional |
| 6, 13 | Regulatory sandbox approvals | Optional |
| 8 and 18 | Startup Label, incentives, investment documents | Optional incentive, eligibility-based |
| 9 | Copyright notification, copyright licences | Voluntary, or where licensing applies |
| 10 | Trade mark assignment | Event-driven |
| 12 | Type Approval Certificate | Narrow sub-trigger (equipment), tagged [verify] |
| 17 | Health practitioner licensing documents | Personal data; needs a "held / not held" design |
| 28 | Cybersecurity insurance | Optional |
| 29 | SON and the PRODUCTS trigger | The map doesn't say which tech products need certification |

## Limits that apply to all three

- **Which pack runs: a proposal for Code & Clause to confirm.** The product document says incorporation decides the corporate layer and each country with operations or users adds its compliance and regulatory obligations. So the country of incorporation runs in full, and each other market among GB, NG and US-DE adds that pack's layer 3 and layer 6 rules. A rule can opt in or out with `market_overlay`. Opted out as tied to being a company there, in `src/packs/annotations.ts`: tax registrations and returns, US state registrations, premises, Nigerian expatriate quotas, and security policies (not one country's law). Employer rules apply only where the company employs people. The maps were written for companies incorporated in each country, so whether each obligation really reaches a foreign company needs a lawyer's view, row by row. A market answered as "US" adds both the federal and Delaware packs, because California and Delaware privacy sit in the Delaware pack.
- **One rule, one count.** AI policies shared across packs (`shared_obligation`) count once. Data protection rules count once per country, because each is a different law, so a company with users in three countries is asked for three sets. Whether one document can satisfy several needs a decision.
- **Investor countries add no rules yet.** Nothing in the maps ties a fundraising rule to where a company's investors are. The nearest are `GB.EQUITY.EIS_SEIS` ("UK angel or VC investors", a relief for UK companies) and `NG.FOREIGN.CCI` (foreign capital into a Nigerian company), and both already sit with the country of incorporation. The product document expects investor countries to affect fundraising, so this is a gap for the lawyer to fill. None has been invented.
- **Registers with no connector yet.** FCA, FinCEN, CBN, SEC Nigeria, FCCPC, Home Office, Gazette and the other list imports in the maps aren't connectors in this build, so those rules are satisfied through a document for now. The Gazette half of the UK core set item 3 isn't covered: Companies House insolvency records are.
- **Website checks.** The scan is a plain first page load. Reject-as-easy-as-accept, banner position (GAID) and GPC need the browser pass in matrix section 14. Those facts aren't published, so nothing claims them. A link not found on the home page reads as "we couldn't find".
- **Unseen documents: the owner's decision, a proposal pending Client approval.** An empty document slot shows as `verify` ("not checked yet") on every plan and never lowers a score. It becomes a gap only when the person says they don't have that document (`declared_missing`), which any rule decided by documents alone can take. Answers to the questions in `src/packs/annotations.ts` count at any plan: yes passes as "You told us", no is a real gap. If the document is uploaded later, the document wins and the statement clears. So a score can rest on few checks, and every score now says how many ("Based on 16 of 118 checks").
- **Urgent cap: a proposal pending Client approval.** While any scored critical finding is open, the overall score can't exceed 74, so the word can't be Healthy, and a free range's top is cut to match. The layer cap of 49 stays. With two urgent issues open, fixing one can show "+0 points".
- **Tier weighting.** The matrix suggests attested items count partially. The brief's scoring doesn't, so all scored items count in full.

## Questions for the lawyer

1. **Core items that aren't scored yet.** Literal tagging leaves these as `verify`: NDPC registration (Nigeria 3 and 4), CAC annual returns (Nigeria 2), UK statutory registers (UK 8). The design shows the NDPC finding with points, so it won't match until the tag is cleared.
2. **UK director identity checks.** The matrix says a missing `identity_verified_on` after the deadline is a gap. Companies House's forum says that field only appears for checks done by an authorised agent, and that some verified people show nothing for a while. We count any verification field as on record, and call it a gap only after the person's own due date. A false gap is still possible.
3. **Delaware through Cobalt.** Cobalt's live mode pulls from state sites, which Delaware forbids, so it's never used for Delaware. Whether Cobalt's stored Delaware data is acceptable needs a written answer from the vendor.
4. **First-year dates.** "Annual" items with no stated first date, such as franchise tax, are raised on the first occurrence after incorporation.
5. **Month-end year ends.** A year end on the last day of a month is treated as landing on the last day of the target month, which the maps don't state.
