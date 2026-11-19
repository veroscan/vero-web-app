# Vero Scan — Denmark Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Sources:** Official legislation, government and regulator pages only (retsinformation.dk, Skattestyrelsen / skat.dk, Forbrugerombudsmanden, EUR-Lex). Each line gives its URL and the date checked. Secondary sources (law-firm notes, vendor blogs, lovguiden.dk) were used only to find the official text and are never cited.
**Company forms covered:** anpartsselskab (ApS) and aktieselskab (A/S).
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Lines marked **[verify]** must not be encoded as a pass/fail rule until the uncertainty named on the line is resolved.

Denmark is an EU member state. Common EU rules are in `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`; this map adds only Danish specifics and points to the EU section for the rest.

**How the Danish statutes were read.** Retsinformation serves its consolidated acts as PDFs. Each PDF named below was fetched from retsinformation.dk on 16 Nov 2026 and its text extracted and read. The main texts: selskabsloven LBK nr 331 af 20/03/2025; årsregnskabsloven LBK nr 402 af 23/03/2026; ophavsretsloven LBK nr 1093 af 20/08/2023; lov om arbejdstageres opfindelser LBK nr 104 af 24/01/2012; databeskyttelsesloven lov nr 502 af 23/05/2018 (as enacted); cookiebekendtgørelsen BEK nr 1148 af 09/12/2011; lov nr 467 af 14/05/2025 on the AI Act.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Danish ApS or A/S at that stage |
| APS / AS | Only an ApS, or only an A/S |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Sells to consumers (B2C) |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| SECTOR.PAYMENTS, .EMONEY, .CRYPTO, .CREDIT | Sector packs (Finanstilsynet), triggers only |
| INVESTED | Has raised or is raising |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a document slot) · 5 attested (vault). Routes follow the *Verification Solutions Matrix* (`docs/knowledge/vero-scan-verification-solutions.md`).

**[verify]** means: not confirmed from an official source on 16 Nov 2026. The line says exactly what is uncertain.

**Source column.** "checked 16 Nov 2026" appears only where the text was read on that day. A page our tool could not read is marked **[verify]: official page not readable by our tool on 16 Nov 2026**.

### Engine facts available for Denmark

`dk.cvr` is off until `DK_CVR_USERNAME` and `DK_CVR_PASSWORD` are set, and has never been tried against a real reply (`docs/NATIONAL-REGISTERS.md`). While it is off, `registry.global.opencorporates.*` answers for Denmark if its own token is set. No rule reads these facts yet. A miss (`identified` = null) means "not found in this register", never "does not exist".

| Fact key(s) | What it can show | What it cannot show |
|---|---|---|
| `registry.dk.cvr.identified`, `cvr_number`, `registered_name` | The company is in CVR, its number and name | Anything when CVR is off |
| `registry.dk.cvr.legal_form_code`, `legal_form` | ApS or A/S | — |
| `registry.dk.cvr.status` | Status as CVR gives it (lower-cased; the exact words are unconfirmed) | Why a company is inactive |
| `registry.dk.cvr.founded_on` | Founding date | The date the founding document was signed, or the registration date |
| `registry.dk.cvr.industry_code` | Main industry code, a sector signal | That a licence is held |
| `registry.dk.cvr.postcode`, `municipality` | Where the company's address is | The full address (not kept) |
| `registry.dk.cvr.production_units_count` | Number of production units | — |
| `registry.dk.cvr.executive_members_count`, `board_members_count` | How many current executive (direktion) and board (bestyrelse) members | Names; whether a supervisory board (tilsynsråd) is used [verify how CVR labels it]; the auditor |
| `registry.global.opencorporates.*` | Fallback register facts while CVR is off | Danish-law specifics |
| `registry.eu.vies_vat.valid`, `request_date`, `name_matches` | A Danish VAT number (DK + 8 digits) is valid in VIES | Whether the company should be registered |
| `registry.global.gleif.*` | The LEI record, if any | Anything about Danish law |
| `registry.sanctions.match`, `possible_match`, `lists_checked` | Company name screened against the stored sanctions lists | That the company is or is not sanctioned |
| `web.policy.*` | Website scan: privacy notice and sections, cookie behaviour, terms, refund and complaints pages, AI disclosure | Legal adequacy; there is no Danish imprint (name, hjemsted, CVR) fact yet |
| `github.*` | Repository licence files and dependency manifests, if GitHub is connected | Who owns the code |

**Not built for Denmark:** share capital, owners and beneficial owners, filed annual reports, and the auditor. CVR holds the first three and the annual reports, but `dk.cvr` does not read them (`docs/NATIONAL-REGISTERS.md`).

---

## 2. Notes for the reviewing lawyer

1. **Annual report deadline is 6 months, not 5.** Årsregnskabsloven §138 in LBK 402/2026 says the report must reach Erhvervsstyrelsen no later than 6 months after year end (4 months for class D). Our brief said 5 months.
2. **ApS minimum capital is DKK 20,000** and A/S DKK 400,000 (selskabsloven §4(2), LBK 331/2025). A later amendment (lov nr 710 af 20/06/2025) was named in a search result we could not open; whether it exists and changed any section used here is **[verify]**.
3. **No director residency rule found.** We searched LBK 331/2025 and found no residency or nationality requirement for directors or board members. An absence is not proof: **[verify]**.
4. **Beneficial owners.** §58a requires registration in Erhvervsstyrelsen's system "as soon as possible". Public access to the data ended on 1 September 2025 according to our engine docs, but Erhvervsstyrelsen's page refused our tool: **[verify]**.
5. **VAT threshold** confirmed as DKK 50,000, now measured per calendar year from 1 January 2025 (Skattestyrelsen minutes). The momsloven sections (§71 b, §71 e) were not read in the act itself.
6. **AI Act authority.** Lov nr 467/2025 names Digitaliseringsstyrelsen, Datatilsynet and Domstolsstyrelsen and is shown "Gældende" on a Retsinformation printout dated 16 Nov 2026. A replacement bill (L 111, 2025-26) was reported; its fate is **[verify]**.
7. **Missing engine facts** that would raise several Tier 5 lines to Tier 1: a website imprint check (name, hjemsted, CVR number); CVR owner register and beneficial-owner presence; filed annual report date; auditor role.

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Registered with Erhvervsstyrelsen within 2 weeks of signing the founding document | 1 | S2 | ALL | 1 | `registry.dk.cvr.identified`, `founded_on`. If not registered or notified within 2 weeks, registration cannot take place. Cannot show the signing date | Selskabsloven §40(1), LBK 331/2025: https://www.retsinformation.dk/eli/lta/2025/331/pdf, checked 16 Nov 2026 |
| Company form is ApS or A/S, and the name says so | 1 | S2 | ALL | 1 | `registry.dk.cvr.legal_form_code`, `legal_form`, `registered_name` contains "ApS" / "A/S" | Selskabsloven §2(1), checked 16 Nov 2026 |
| Company active | 1 | S2 | ALL | 1 | `registry.dk.cvr.status` (status words unconfirmed: map them after the first real reply) | `docs/NATIONAL-REGISTERS.md` (engine, not law) |
| Registrable changes filed within 2 weeks | 1 | event-driven | ALL | 5 | Attestation. Applies to every fact the act makes registrable, counted from the decision | Selskabsloven §9(1), checked 16 Nov 2026 |
| Management and auditor registered | 1 | S2 | ALL | 1 / 5 | `registry.dk.cvr.executive_members_count`, `board_members_count`; the auditor has no fact yet (attestation) | Selskabsloven §10(1), checked 16 Nov 2026 |
| Activity code on record | 1 | S2 | ALL | 1 | `registry.dk.cvr.industry_code`. A sector signal for Section 8, not an obligation | `docs/NATIONAL-REGISTERS.md` |
| Company name screened against sanctions lists | 3 | S2 | ALL | 3 | `registry.sanctions.match`, `possible_match`, `lists_checked`. International pack item | `docs/GLOBAL-COVERAGE.md` (engine, not law) |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Articles (vedtægter) state name, object, capital and number or nominal value of shares, share rights and the other §28 items | 1 | S2 | ALL | 4 | Slot: vedtægter. They form part of the signed founding document (§25) | Selskabsloven §§25, 28, checked 16 Nov 2026 |
| Share capital at least DKK 20,000 (ApS) or DKK 400,000 (A/S) | 1 | S2 | ALL | 4 | Slot: vedtægter or CVR extract. No engine fact: `dk.cvr` does not read capital | Selskabsloven §4(2), checked 16 Nov 2026 |
| At least 25% of capital, and at least DKK 20,000, paid in at registration | 1 | S2 | ALL | 4 | Slot: proof of payment. 25% must stay paid at all times (§33) | Selskabsloven §§33, 40(2), checked 16 Nov 2026 |
| Owner register (ejerbog) set up as soon as possible, kept in the EU/EEA | 1 | S2 | ALL | 5 | Attestation. It may be kept by registering the owner data in Erhvervsstyrelsen's IT system (§50(2)); it must be available to public authorities (§51) | Selskabsloven §§50-52, checked 16 Nov 2026 |
| Holders of 5% or more notify the company within 2 weeks | 1 | event-driven | ALL | 5 | Attestation. Further thresholds 10, 15, 20, 25, 50, 90, 100%, 1/3 and 2/3 | Selskabsloven §§55-56, checked 16 Nov 2026 |
| Significant owners (or "none") registered in Erhvervsstyrelsen's public owner register at incorporation, and changes as soon as possible | 1 | S2 | ALL | 5 | Attestation now; Tier 1 once a CVR owner fact is built | Selskabsloven §58, checked 16 Nov 2026 |
| Beneficial owners identified and registered as soon as possible | 1 | S2 | ALL | 5 | Attestation. If none can be identified, the registered executive members are registered as beneficial owners (§58a(3)) | Selskabsloven §58a(1)-(3), checked 16 Nov 2026 |
| Beneficial owners reviewed at least once a year, result presented at the meeting that approves the annual report | 1 | S3 | ALL | 5 | Attestation; Slot: board minutes | Selskabsloven §58a(4), checked 16 Nov 2026 |
| Beneficial-owner evidence kept 5 years | 1 | S2 | ALL | 5 | Attestation | Selskabsloven §58a(5), checked 16 Nov 2026 |
| Beneficial-owner data no longer public in CVR | 1 | — | — | — | Note: public access ended 1 Sep 2025 (engine docs); access limited to authorities, obliged entities and those with a legitimate interest **[verify]**. Refer to "EU Section 6 — Beneficial ownership (AML)" | **[verify]**: https://erhvervsstyrelsen.dk/adgang-til-oplysninger-om-reelle-ejere-begraenses-0: official page not readable by our tool on 16 Nov 2026 |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Small companies report at least under accounting class B | 1 | S3 | ALL | — | Note for rule text | Årsregnskabsloven §7, LBK 402/2026: https://www.retsinformation.dk/eli/lta/2026/402/pdf, checked 16 Nov 2026 |
| Annual report filed with Erhvervsstyrelsen without undue delay after approval, received within 6 months of year end | 1 | S3 | ALL | 4 | Slot: approved annual report (or CVR receipt). 4 months for class D. No dispensation. No engine fact: filed reports are not read | Årsregnskabsloven §138, checked 16 Nov 2026 |
| Ordinary general meeting in time to file the approved report | 1 | S3 | ALL | 4 | Slot: minutes. The meeting approves the report, decides on profit or loss, and on any change to an audit opt-out (§88(1)). The report may be in English if the general meeting decides and the articles say so (§100 a) | Selskabsloven §§88, 100 a, checked 16 Nov 2026 |
| EU accounts and company-law directives | 1 | — | — | — | Refer to "EU Section 9 — Company law and accounts" | EU common map |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| A recognised management structure | 1 | S2 | ALL | 1 | `registry.dk.cvr.executive_members_count` ≥ 1. Board plus executive, or executive only (with a supervisory board in an A/S) | Selskabsloven §111(1), checked 16 Nov 2026 |
| A/S board or supervisory board has at least 3 members | 1 | S2 | AS | 1 | `registry.dk.cvr.board_members_count` ≥ 3 where `legal_form` is A/S. A supervisory board may not show as `board` [verify against a real CVR reply] | Selskabsloven §111(2), checked 16 Nov 2026 |
| A/S: majority of the board are not executives; an executive cannot chair | 1 | S2 | AS | 5 | Attestation (the engine counts people, it cannot tell who holds both roles) | Selskabsloven §111(1) nr 1, checked 16 Nov 2026 |
| No residency rule for directors | 1 | — | — | — | Note: none found in LBK 331/2025 **[verify]** | Selskabsloven, checked 16 Nov 2026 |
| Audit, unless a valid opt-out | 1 | S2 | ALL | 4 | Slot: auditor's report, or the opt-out statement in the annual report. A class B company may opt out if, in 2 consecutive years, it does not exceed two of: balance DKK 4m, net revenue DKK 8m, 12 full-time staff on average (§135(1)). No opt-out if balance exceeds DKK 50m in 2 consecutive years (§135(2)). Barred after certain convictions or findings (§135 a) | Årsregnskabsloven §§135, 135 a, checked 16 Nov 2026 |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Employee inventions: employer's right to claim | 2 | S2 | EMPLOYEES | 5 | Slot: employment contract IP clause. Employer may require transfer of an invention reached through the employee's service and within the business's field (§5); employee must tell the employer without undue delay (§6); employer must claim within 4 months of the notice (§7); reasonable compensation is due even if agreed otherwise (§8); a patent filed within 6 months after leaving is presumed made during employment (§9) | Lov om arbejdstageres opfindelser, LBK 104/2012 §§5-9: https://www.retsinformation.dk/eli/lta/2012/104/pdf, checked 16 Nov 2026 |
| Software written by employees belongs to the employer | 2 | S2 | EMPLOYEES | 5 | Attestation. Copyright in a program made by an employee at work or on the employer's instructions passes to the employer | Ophavsretsloven §59, LBK 1093/2023: https://www.retsinformation.dk/eli/lta/2023/1093/pdf, checked 16 Nov 2026 |
| Contractors and founders assign IP in writing | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Slot: IP assignment agreement. §59 covers employees and software only; that nothing transfers other works or contractor work by law is our reading **[verify]** | Ophavsretsloven §59, checked 16 Nov 2026 |
| Trademark registered with DKPTO, or an EU trade mark | 2 | S2 | ALL | 4 | Slot: registration certificate. Refer to "EU Section 11 — EU trade mark". Danish term (10 years) and renewal rules **[verify]** | **[verify]**: https://www.dkpto.dk: official page not readable by our tool on 16 Nov 2026 |

### Section 6 — Data protection and cookies

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| GDPR plus the Danish Data Protection Act; authority is Datatilsynet | 3 | S2 | PERSONAL_DATA | — | Refer to "EU Section 1 — GDPR". We read the act as enacted in 2018; later amendments **[verify]** | Databeskyttelsesloven, lov nr 502/2018: https://www.retsinformation.dk/eli/lta/2018/502/pdf, checked 16 Nov 2026 |
| Privacy notice published | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `retention_statement`, `transfers_section`, `dpo_contact` (EU Section 1). A complaint route naming Datatilsynet cannot be checked: no such fact yet | EU common map |
| Children's consent: age 13 for online services offered directly to children | 3 | S2 | CONSUMER (services to children) | 1 / 5 | `web.policy.children_section`; under 13 needs parental consent or approval | Databeskyttelsesloven §6(2)-(3), checked 16 Nov 2026 |
| CPR numbers processed only on a listed ground | 3 | S2 | PERSONAL_DATA | 5 | Attestation. For private companies: required by law, consent, or the other grounds in §11(2) | Databeskyttelsesloven §11(2), checked 16 Nov 2026 |
| DPO, records, DPIA, processors, breach notification | 3 / 6 | S2 | PERSONAL_DATA | 5 | Attestation; refer to EU Section 1. No Danish public DPO list is built **[verify whether one exists]** | EU common map |
| Cookie consent after full information, before non-essential storage | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count` = 0, `cookie_policy_found`. Exceptions for transmission and for storage strictly needed for a service the user asked for (§4). Refer to "EU Section 2 — ePrivacy and cookies" | Cookiebekendtgørelsen BEK 1148/2011 §§3-4: https://www.retsinformation.dk/eli/lta/2011/1148/pdf, checked 16 Nov 2026 |
| Who supervises cookie rules | 3 | — | — | — | Note: Digitaliseringsstyrelsen since 15 Dec 2022 (from Erhvervsstyrelsen); Datatilsynet for the personal-data side **[verify]**: no official page read | **[verify]**: https://digst.dk: not read |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| VAT registration once taxable sales exceed DKK 50,000 in a calendar year | 3 | S3 | ALL | 1 | `registry.eu.vies_vat.valid` for the company's DK VAT number. Before 1 Jan 2025 the test was 12 rolling months. Cannot show turnover. Refer to "EU Section 5 — VAT" | Skattestyrelsen, Momskontaktudvalget minutes (Nov 2024), citing momsloven §71 e(1), jf. §71 b nr 1: https://sktst.dk/media/olfb14qw/referat-momskontaktudvalgsmoede-den-7-november.pdf, checked 16 Nov 2026. Momsloven itself not read **[verify]** |
| Registered as employer on virk.dk before the first payroll | 3 | S2 | EMPLOYEES | 4 | Slot: registration receipt. Then access to eIndkomst | https://skat.dk/erhverv/ansatte-og-loen/ansat-din-foerste-medarbejder, checked 16 Nov 2026 |
| Monthly eIndkomst reporting, A-skat and AM-bidrag paid | 3 | S2 | EMPLOYEES | 5 | Attestation. Report "0" in a month with no pay. Deadlines on a linked page **[verify]** | Same page, checked 16 Nov 2026 |
| ATP and occupational injury insurance | 3 | S2 | EMPLOYEES | 4 | Slot: insurance policy. **[verify]**: no official page read | **[verify]**: not read |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Payment or e-money institution licence | 3 | S2 | SECTOR.PAYMENTS, .EMONEY | 4 | Slot: Finanstilsynet licence. Register import not built | **[verify]**: https://www.finanstilsynet.dk: not read |
| Crypto-asset service provider (MiCA) | 3 | S2 | SECTOR.CRYPTO | 4 | Slot: authorisation. Refer to "EU Section 12 — Other EU digital rules (triggers)" | **[verify]**: not read |
| Consumer credit | 3 | S2 | SECTOR.CREDIT | 4 | Slot: licence | **[verify]**: not read |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Website and e-mails show name, registered office (hjemsted) and CVR number | 4 | S2 | WEBSITE | 5 | Attestation until an imprint fact exists. Also on letters and other business papers | Selskabsloven §2(4), checked 16 Nov 2026 |
| If share capital is shown, both subscribed and paid-up capital are shown | 4 | S2 | WEBSITE | 5 | Attestation | Selskabsloven §33(4), checked 16 Nov 2026 |
| Website shows the e-commerce information: name, physical address, e-mail (a contact form is not enough), CVR number | 4 | S2 | WEBSITE | 5 | Attestation. Refer to "EU Section 3 — E-commerce information duties" (e-handelsloven §7) | Forbrugerombudsmanden, "Nettjek" checklist: https://forbrugerombudsmanden.dk/media/18319/nettjek.pdf, checked 16 Nov 2026 (publication date not shown **[verify]**); e-handelsloven itself not read |
| Order confirmed electronically at once | 4 | S3 | CONSUMER | 5 | Attestation (e-handelsloven §§10-12 per the checklist) | Same checklist, checked 16 Nov 2026 |
| Pre-contract information and 14-day withdrawal right | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.terms_found`, `refund_policy_found`. Missing information about the withdrawal right can be fined (forbrugeraftaleloven). Refer to "EU Section 4 — Consumer law" | Same checklist, checked 16 Nov 2026; forbrugeraftaleloven itself not read **[verify]** |
| Terms available to download | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.terms_found`; download format checked in review | Same checklist, checked 16 Nov 2026 |
| Accessibility | 4 | S3 | WEBSITE / APP | 1 / 5 | `web.policy.accessibility_found`. Refer to "EU Section 8 — Accessibility"; Danish implementing act **[verify]** | **[verify]**: not read |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Capital increase decision registered within 2 weeks | 5 | S4 | INVESTED | 4 | Slot: general-meeting minutes and CVR registration. Completion can be registered only once the required capital and premium are paid, with proof for cash (§174) | Selskabsloven §§9, 174, checked 16 Nov 2026 |
| Pre-emption rights respected or validly waived | 5 | S4 | INVESTED | 5 | Attestation. Existing owners have pro-rata rights in a cash increase; waived by the majority needed to amend the articles (§162(2)) | Selskabsloven §162, checked 16 Nov 2026 |
| Debt conversion: decision and board statement | 5 | S4 | INVESTED (convertibles) | 5 | Attestation | Selskabsloven §161, checked 16 Nov 2026 |
| Warrant or convertible increases registered within 4 weeks after year end | 5 | S4 | INVESTED (warrants, convertibles) | 5 | Attestation, when the subscription period exceeds 12 months | Selskabsloven §175, checked 16 Nov 2026 |
| ApS: no public offer of shares, except listed exemptions | 5 | S4 | APS, INVESTED | — | Trigger only. Allowed: qualified investors only; fewer than 150 non-qualified persons per EU/EEA country; units of at least EUR 100,000 or at least EUR 100,000 per investor; crowdfunding under the EU crowdfunding regulation. An ApS may not list its shares on a regulated market or MTF | Selskabsloven §1(3)-(4), checked 16 Nov 2026 |
| Prospectus for a public offer | 5 | S4 | INVESTED | — | Trigger only. Refer to "EU Section 10 — Fundraising and prospectus" | EU common map |

### Section 11 — AI

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| AI Act applies directly in Denmark | 6 | S3 | AI | 5 | Attestation. Refer to "EU Section 7 — AI Act". Dates as amended by Regulation (EU) 2026/1744: Art 5(1)(ba)/(bb) prohibitions from 2 Dec 2026; Art 50(2) marking for systems placed on the market before 2 Aug 2026 by 2 Dec 2026; Annex III high-risk from 2 Dec 2027; Annex I from 2 Aug 2028 | https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng, checked 16 Nov 2026 |
| Danish AI authorities | 6 | — | AI | — | Note: Digitaliseringsstyrelsen (notifying authority, single point of contact, market surveillance for prohibited practices), Datatilsynet (Art 5(1)(d) and (g)), Domstolsstyrelsen (courts' administrative AI use). Act in force 2 Aug 2025; replacement bill L 111 **[verify]** | Lov nr 467 af 14/05/2025 §§2, 12: https://www.retsinformation.dk/api/pdf/249582, checked 16 Nov 2026 (printout marks it "Gældende") |
| Fines for prohibited AI practices | 6 | — | AI | — | Note for consequence text: breaches of Art 5(1)(a)-(g) are punishable by fine | Lov nr 467/2025 §10, checked 16 Nov 2026 |
| AI use disclosed on the website | 6 | S3 | AI, WEBSITE | 1 | `web.policy.ai_disclosure_found`. Presence only | EU common map, EU Section 7 |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above.

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Annual report to Erhvervsstyrelsen | Section 3 | Within 6 months of year end (class B, C) | Attestation; upload |
| Ordinary general meeting | Section 3 | In time for the filing above | Attestation |
| Beneficial-owner review | Section 2 | Yearly, at the annual-report meeting | Attestation |
| Registrable changes | Section 1 | Within 2 weeks of the decision | Attestation |
| Owner (5%) notifications | Section 2 | Within 2 weeks | Attestation |
| Warrant and convertible increases | Section 10 | 4 weeks after year end | Attestation |
| eIndkomst, A-skat, AM-bidrag | Section 7 | Monthly (deadline **[verify]**) | Attestation |
| VAT returns | Section 7 | Period **[verify]** | Attestation |
| Trademark renewal | Section 5 | Every 10 years **[verify]** | Attestation |

---

## 4. Counts by tier

| Tier | Items | What this means |
|---|---|---|
| 1 Official live or URL scan | 15 (10 pure; 5 mixed 1 / 5) | CVR covers registration, form, status, management counts and activity; VIES covers VAT; the website scan covers privacy, cookies, terms and AI disclosure |
| 2 Licensed vendor | 0 | Not needed once CVR credentials are set; OpenCorporates is the fallback |
| 3 Official list import | 1 | Sanctions lists |
| 4 Document-verified | 13 | Articles, capital, payment proof, annual report, minutes, audit, employer registration, trademark, licences |
| 5 Attested | 22 | Owner register, beneficial owners, IP, data-protection records, payroll, imprint, fundraising formalities |
| Notes (no tier) | 10 | Context lines a rule can quote, not checks |

Total in Sections 1–11: 61 lines (51 checkable items, 10 notes). 18 of them carry **[verify]**, plus 3 calendar lines in Section 12.

---

## 5. The core set every Danish tech company must show at Stage 2

1. In CVR as ApS or A/S, active (Tier 1).
2. Management registered; an A/S board of at least 3 (Tier 1).
3. Capital at least DKK 20,000 (ApS) or 400,000 (A/S), at least 25% paid (Tier 4).
4. Articles, owner register, significant owners and beneficial owners registered (Tier 4 / 5).
5. Annual report filed within 6 months, with audit or a valid opt-out (Tier 4, from S3).
6. Privacy notice and prior cookie consent on the website (Tier 1, WEBSITE).
7. Name, hjemsted, CVR number, address and e-mail on the website (Tier 5 until an imprint fact exists).
8. Founders' and contractors' IP assigned in writing (Tier 5).

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

- Whether lov nr 710/2025 changed any selskabsloven section used here (§§2, 4, 9, 28, 33, 40, 50-58a, 88, 111, 161-175).
- Public access to beneficial-owner data since 1 Sep 2025, and who may still see it.
- That no residency or nationality rule applies to directors.
- How CVR labels a supervisory board (tilsynsråd) and the status words.
- Momsloven §71 b and §71 e text, and VAT return periods.
- eIndkomst, A-skat and AM-bidrag deadlines; ATP and occupational injury insurance duties.
- Databeskyttelsesloven amendments after 2018; whether a public Danish DPO list exists.
- Cookie supervision by Digitaliseringsstyrelsen.
- E-handelsloven §7 and forbrugeraftaleloven in their own text; the Nettjek checklist's date.
- Danish Accessibility Act implementation.
- DKPTO trademark term and renewal; Finanstilsynet licence pages.
- Status of the replacement AI bill (L 111, 2025-26).
- That no statutory IP transfer covers contractors, founders or non-software works.

---

## Not encoded (16 Nov 2026)

The draft pack `packages/rules/src/packs/dk.ts` (version 0.1.0) encodes the rest of this map, together with the EU common rules it adds (DK.CORP.UBO_ANNUAL_CHECK takes the place of the EU yearly check, because §58a(4) asks for it now); the items below have no rule of their own.

| Item | Section | Why |
|---|---|---|
| Activity code on record | Section 1 | Not an obligation: a sector signal only |
| Company name screened against sanctions lists | Section 1 | Covered by INTL.SANCT.SCREENING |
| The name says "ApS" or "A/S" (part of the company-form line) | Section 1 | DK.CORP.LEGAL_FORM checks the form code only; the name is not checked |
| Beneficial-owner data no longer public in CVR | Section 2 | Note, and [verify] |
| Small companies report at least under accounting class B | Section 3 | Note for rule text (used by DK.CORP.AUDIT) |
| EU accounts and company-law directives | Section 3 | Note: refers to the EU map |
| No residency rule for directors | Section 4 | Note, and [verify] |
| IP assignment in writing (contractors, and the people who set up the company) | Section 5 | [verify] whether any work transfers by law; covered by INTL.IP.OWNER_ASSIGNMENT and INTL.IP.CONTRACTOR_ASSIGNMENT |
| GDPR plus the Danish Data Protection Act; authority is Datatilsynet | Section 6 | Note, and [verify] later amendments; the GDPR duties are the EU common rules (DK.DP.*), naming Datatilsynet |
| Privacy notice published | Section 6 | Covered by DK.DP.PRIVACY_NOTICE, which cites this line |
| Children's consent: age 13 | Section 6 | Covered by DK.DP.CHILD_CONSENT (age 13), which cites this line |
| DPO, records, DPIA, processors, breach notification | Section 6 | [verify] whether a public DPO list exists; covered by DK.DP.DPO, DK.DP.ROPA, DK.AI.DPIA, DK.DP.PROCESSING_AGREEMENTS and DK.DP.BREACH |
| Cookie consent after full information, before non-essential storage | Section 6 | Covered by DK.DP.COOKIE_CONSENT and DK.DP.COOKIE_POLICY, which cite this line |
| Who supervises cookie rules | Section 6 | Note, and [verify] |
| VAT registration once taxable sales exceed DKK 50,000 | Section 7 | [verify] (momsloven not read), and no fact shows turnover or the Danish VAT register. VIES validity is DK.TAX.VAT_VIES |
| ATP and occupational injury insurance | Section 7 | [verify]: no official page read, so the duty is unconfirmed |
| Payment or e-money institution licence | Section 8 | [verify]: no official page read; licence rules not mapped |
| Crypto-asset service provider (MiCA) | Section 8 | [verify]: no official page read; licence rules not mapped |
| Consumer credit | Section 8 | [verify]: no official page read; licence rules not mapped |
| Website and e-mails show name, hjemsted and CVR number | Section 9 | Covered by DK.COM.WEBSITE_IDENTITY and DK.CORP.COMPANY_PARTICULARS, which cite this line |
| Website shows the e-commerce information (Nettjek checklist) | Section 9 | [verify] checklist date; covered by DK.COM.WEBSITE_IDENTITY |
| Pre-contract information and 14-day withdrawal right | Section 9 | [verify] (forbrugeraftaleloven not read); covered by DK.CONSUMER.PRE_CONTRACT_INFO and DK.CONSUMER.WITHDRAWAL |
| Accessibility | Section 9 | [verify] Danish act; covered by DK.CONSUMER.ACCESSIBILITY |
| ApS: no public offer of shares, except listed exemptions | Section 10 | Trigger only; the exemptions it shares with the EU rules are in DK.FUND.PROSPECTUS_EXEMPTION |
| Prospectus for a public offer | Section 10 | Trigger only; covered by DK.FUND.PROSPECTUS_EXEMPTION |
| AI Act applies directly in Denmark | Section 11 | Covered by the EU common AI rules (DK.AI.ROLES, DK.AI.PROHIBITED_PRACTICES, DK.AI.LITERACY and the rest) |
| Danish AI authorities | Section 11 | Note, and [verify] |
| Fines for prohibited AI practices | Section 11 | Note for consequence text |
| Compliance calendar | Section 12 | Not items. The annual report recurrence is on DK.CORP.ANNUAL_REPORT; the rest are attestations without a fixed date, or [verify] |

Encoded but always "to check" until a lawyer confirms the tagged line: DK.CORP.AS_BOARD, DK.IP.TRADEMARK, DK.EMP.EINDKOMST. CVR facts are never read as a problem: the source has not been tried against a real reply.
