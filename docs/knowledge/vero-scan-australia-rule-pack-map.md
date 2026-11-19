# Vero Scan — Australia Rule-Pack Map

**Status: Draft from official sources, for lawyer review. Not legal advice.**

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company type:** Proprietary company limited by shares (Pty Ltd) registered under the Corporations Act 2001, not a large proprietary company unless stated.
**Source:** No lawyer-supplied source document exists for Australia. Every line below cites an official source (legislation.gov.au, asic.gov.au, abrs.gov.au, ato.gov.au, oaic.gov.au, acma.gov.au, ipaustralia.gov.au, industry.gov.au) listed in section 7, with the date it was checked.
**Stage and trigger assignments are proposals.** A lawyer approves, edits or strikes each line before it is encoded or affects a score.

> Technical mapping, not legal advice. Nothing here has been reviewed by an Australian lawyer.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Australian proprietary company at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Handles personal information |
| PRIVACY_ACT | Covered by the Privacy Act: annual turnover above A$3m in any financial year since 2001, or within an exception to the small business exemption (new trigger) |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Supplies consumers |
| ENTERPRISE | Sells to businesses on standard form contracts |
| MARKETING | Sends commercial emails or SMS (new trigger) |
| TELEMARKETING | Makes telemarketing calls (new trigger) |
| AI | Uses or builds AI in the product |
| SECTOR.PAYMENTS, .CREDIT, .CRYPTO | ASIC or AUSTRAC-regulated activity; only as triggers here |
| LARGE_PROPRIETARY | Meets the large proprietary company test (new trigger) |
| INVESTED | Has raised or is raising equity |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault). Routes refer to the *Verification Solutions Matrix*, section 5.

**Verification route.** Each item names one of: an engine **fact** (exact key from `packages/connectors/src/fact-keys.ts`), a **slot** (document upload, tier 4) or an **attestation** (tier 5). Slot and attestation ids (`au_…`) are proposals; they do not exist in code yet.

**Item ids.** `AU-<layer>.<nn>`. A rule cites the map and the id, for example "Australia map §3, AU-1.10".

**Sources and "checked".** Each line cites a key (`[AU-S3]`) from section 7, which gives the URL, the date (16 Nov 2026 for all) and how the page was read:
- **R**: opened and read.
- **S**: the official page was read through its indexed text, in a search limited to that official domain.
- **N**: named but not opened. Every line resting on an N source carries **[verify]**.

**[verify]** means the line could not be fully confirmed from an official source on 16 Nov 2026, or a figure, section number or date needs a lawyer's check. The text says what is uncertain.

**What the engine can see in Australia.** Only ABN Lookup (`au.abr`), which is the **tax** register of businesses, not ASIC's company register (`docs/NATIONAL-REGISTERS.md`). It gives ABN and ACN, name, ABN status, entity type, GST registration and its start date, and the state and postcode of the main business location. It does **not** say whether a company is registered, deregistered or late with ASIC, and it has no directors, members or review dates. It needs a key (`AU_ABR_GUID`) and has not been tried against a real reply. ASIC status is tier 4 (a current ASIC company extract) until a paid broker or ASIC's company dataset is approved.

---

## 2. Notes for the owner and the reviewing lawyer

1. **ABN status is not company status.** An active ABN does not prove the company is registered with ASIC, and a cancelled ABN does not prove deregistration. Rules must say "tax registration", never "company registered", when reading `registry.au.abr.*`.
2. **Privacy Act coverage is a gate.** Most small businesses (turnover A$3m or less) are outside the Privacy Act unless an exception applies [AU-S6]. Privacy lines therefore switch on through `PRIVACY_ACT`, which needs a turnover and exception attestation. A founder who answers wrongly gets the wrong set: the attestation must list the exceptions plainly.
3. **10 December 2026.** The automated decision-making transparency rule in APP 1.7–1.9 starts in under a month from the check date [AU-S7]. It is the most time-critical Australian item (AU-3.03).
4. **Proposed changes not in force.** The 2026–27 Budget announced higher large-proprietary thresholds (revenue A$100m, assets A$50m); ASIC says the current thresholds apply until the law changes [AU-S4].
5. **Engine gaps (not built; proposals only).** (a) ASIC company status, review date and officeholders (paid brokers, or ASIC's weekly company dataset on data.gov.au, a bulk file that needs the owner's go-ahead). (b) A `web.policy.complaint_route_oaic` fact. (c) IP Australia trade mark search for AU-2.05.

---

## 3. Item map

### 3.1 Layer 1 — Corporate foundation

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| AU-1.01 | Company registered with ASIC and not deregistered | 1 | S2 | ALL | 4 | Slot `au_asic_extract` (current company extract). Supporting facts `registry.au.abr.acn`, `registry.au.abr.entity_type_code`, `registry.au.abr.registered_name` (tax register, not proof of ASIC status) | [AU-S1], [AU-S2] |
| AU-1.02 | ABN held and active | 1 / 3 | S2 | ALL | 1 | Facts `registry.au.abr.identified`, `registry.au.abr.abn`, `registry.au.abr.abn_status`, `registry.au.abr.abn_status_from` | [AU-S1], [AU-S9] |
| AU-1.03 | Internal governance by a constitution or the replaceable rules (or both) | 1 | S2 | ALL | 5 / 4 | Attestation `au_constitution_or_rules`; slot `au_constitution`. **[verify]** source: ASIC "company building blocks" pages not read on this point; Corporations Act s 134 not read | [AU-S3] |
| AU-1.04 | Registered office: a physical street address in Australia (not a PO Box), with the occupier's consent if it is someone else's address; a principal place of business is also kept | 1 | S2 | ALL | 4 / 5 | Slot `au_asic_extract`; attestation `au_office_consent`. Facts `registry.au.abr.state` and `registry.au.abr.postcode` are the main business location for tax, not the registered office | [AU-S2] |
| AU-1.05 | At least one director who ordinarily resides in Australia | 1 | S2 | ALL | 5 / 4 | Attestation `au_resident_director`; slot `au_asic_extract` (officeholders). The engine keeps no people | [AU-S2] |
| AU-1.06 | Company secretary optional for a proprietary company; if appointed, at least one ordinarily resides in Australia | 1 | S2 | ALL (has a secretary) | 5 | Attestation `au_secretary` | [AU-S2] |
| AU-1.07 | Every director holds a director identification number, applied for before appointment (up to 12 months ahead); only the director can apply; late application is a criminal offence | 1 | S1 / S2 | ALL | 5 | Attestation `au_director_ids` (one per director; the number is not public and is never stored) | [AU-S5] |
| AU-1.08 | Register of members kept, showing for each holding whether the shares are held beneficially; changes to members and beneficial-ownership status notified to ASIC | 1 | S2 | ALL | 5 / 4 | Attestation `au_members_register`; slot `au_asic_extract` (members). **[verify]** Corporations Act ss 168–169 and the notification period: ASIC page on beneficial ownership status found, not read | [AU-S10] |
| AU-1.09 | Beneficial ownership: no general beneficial-ownership register for proprietary companies was found in force | 1 | — | ALL | — | Information only. **[verify]** that no such register has been legislated (none found on official pages read) | [AU-S10] |
| AU-1.10 | Annual review: ASIC issues an annual statement at each review date; the company checks and corrects its details and pays the annual review fee; late fees apply | 1 | S2 (annual) | ALL | 4 | Slot `au_annual_statement` (statement and fee receipt). Engine gap 5a | [AU-S3] |
| AU-1.11 | Solvency resolution by the directors within 2 months after each review date, unless a financial report was lodged with ASIC in the past 12 months. If the resolution is negative, or none is passed in time, lodge Form 485 within 7 days (after the 2-month period ends) | 1 | S2 (annual) | ALL | 5 | Attestation `au_solvency_resolution`; vault for the minute | [AU-S3] |
| AU-1.12 | Financial reports: a small proprietary company generally need not prepare or lodge them; a large proprietary company (2 of 3: consolidated revenue A$50m or more, consolidated gross assets A$25m or more, 100 or more employees at year end, for years from 1 Jul 2019) prepares, audits (unless ASIC relief) and lodges a financial report and directors' report | 1 | S3 (annual) | LARGE_PROPRIETARY | 5 / 4 | Attestation `au_size_test`; slot `au_financial_report` for large companies. **[verify]** other triggers for small companies (shareholder direction, foreign control) and lodgement deadline: not confirmed | [AU-S4] |
| AU-1.13 | Changes to officeholders and addresses notified to ASIC | 1 | event-driven | ALL | 5 | Attestation `au_asic_changes`. **[verify]** the 28-day period for these changes: confirmed only for share issues (AU-5.01) | [AU-S8] |
| AU-1.14 | Minutes of directors' and members' meetings and resolutions recorded and kept | 1 | S2 | ALL | 5 | Vault slot `au_minutes`. **[verify]** Corporations Act s 251A (one-month rule): not read | [AU-S10] |

### 3.2 Layer 2 — IP and technology

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| AU-2.01 | Employer generally owns IP employees create in relation to the business; exceptions must be in the employment contract | 2 | S2 | EMPLOYEES | 5 | Vault slot `au_employment_contracts` (IP clause). [verify] Copyright Act 1968 s 35(6): not read | [AU-S11] |
| AU-2.02 | IP a contractor creates belongs to the contractor unless the contract says otherwise: written assignment needed | 2 | S2 | CONTRACTORS | 5 | Vault slot `au_contractor_ip`; supporting facts `github.contributor_count`, `github.contributor_logins`, `docusign.envelopes_completed` | [AU-S11] |
| AU-2.03 | Employee inventions: no clear statutory default; case law implies employer ownership only for inventions within the employee's duties: express assignment advised | 2 | S3 | EMPLOYEES | 5 | Same slot as AU-2.01 | [AU-S11] |
| AU-2.04 | Founders' pre-incorporation IP assigned to the company | 2 | S1 | ALL | 5 | Vault slot `au_founder_ip_assignment` | [AU-S11] |
| AU-2.05 | Trade mark filed with IP Australia | 2 | S2 / S3 | ALL | 4 | Slot `au_trademark`. **[verify]** IP Australia search access (engine gap 5c): not opened | [AU-S11] |

### 3.3 Layer 3 — Compliance and regulatory

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| AU-3.01 | Privacy Act coverage decided: covered if turnover exceeded A$3m in any financial year since 2001, or if an exception applies (private health service provider holding health information, trading in personal information, related to a covered body, Commonwealth contracted service provider, CDR-accredited, credit reporting body, opted in, prescribed; AML/CTF reporting entities for that information, with tranche 2 entities from 1 Jul 2026) | 3 | S2 | PERSONAL_DATA | 5 | Attestation `au_privacy_act_coverage` (sets `PRIVACY_ACT`) | [AU-S6] |
| AU-3.02 | APP privacy policy published and kept current: who the company is, what it collects and why, access and correction, complaints, overseas disclosure and the likely countries | 3 | S2 | PRIVACY_ACT, WEBSITE | 1 | Facts `web.policy.privacy_notice_found`, `web.policy.names_company`, `web.policy.rights_section`, `web.policy.transfers_section`, `web.policy.last_updated`. **[verify]** the APP 1.4 content list: APP 1 guidelines (Oct 2025) found, not read | [AU-S7] |
| AU-3.03 | From 10 Dec 2026, where a computer program makes, or substantially and directly helps make, decisions that significantly affect individuals' rights or interests using personal information, the privacy policy says so (APP 1.7–1.9). Applies to decisions made from that date | 3 / 6 | S3 | PRIVACY_ACT, AI | 1 / 5 | Fact `web.policy.ai_disclosure_found` (partial: it does not test the APP 1.8 contents); attestation `au_adm_transparency`. [verify] the three APP 1.7 conditions word for word | [AU-S7] |
| AU-3.04 | Notifiable Data Breaches scheme: assess a suspected eligible breach and notify the OAIC and affected individuals | 3 | S2 / event-driven | PRIVACY_ACT | 5 | Vault slot `au_breach_plan`. **[verify]** the 30-day assessment period: not read in this check | [AU-S6] |
| AU-3.05 | GST registration within 21 days of GST turnover reaching A$75,000 (current or projected basis); an ABN is needed first | 3 | S3 | ALL | 1 | Facts `registry.au.abr.gst_registered`, `registry.au.abr.gst_registered_from` against an attestation of turnover `au_gst_turnover` | [AU-S9] |
| AU-3.06 | PAYG withholding registration before the first payment to employees; superannuation guarantee; Single Touch Payroll | 3 | S2 (first employee) | EMPLOYEES | 4 / 5 | Slot `au_payg_registration`; attestation `au_super_stp`. **[verify]** all of it: ATO employer pages not opened | [AU-S12] |
| AU-3.07 | Workers' compensation insurance (state or territory scheme) | 3 | S2 | EMPLOYEES | 4 | Slot `au_workers_comp`. **[verify]** state-specific rules: not opened | [AU-S12] |
| AU-3.08 | Fair Work: National Employment Standards; Fair Work Information Statement to new employees | 3 | S2 | EMPLOYEES | 5 | Attestation `au_fair_work`. **[verify]** not opened | [AU-S13] |
| AU-3.09 | Financial services, credit or AML/CTF registration or licence | 3 | S2 | SECTOR.PAYMENTS, .CREDIT, .CRYPTO | 3 | ASIC professional registers; AUSTRAC. **[verify]** importability and scope: not opened. Trigger only | [AU-S14] |

### 3.4 Layer 4 — Commercial

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| AU-4.01 | Australian Consumer Law: consumer guarantees that cannot be excluded; no misleading or deceptive conduct | 4 | S3 | CONSUMER | 5 + 1 | Vault slot `au_terms_review`; facts `web.policy.terms_found`, `web.policy.refund_policy_found`. **[verify]** the Competition and Consumer Act 2010 Sch 2 and the consumer definition thresholds: not read | [AU-S15] |
| AU-4.02 | Unfair contract terms in standard form consumer and small business contracts (prohibited, with penalties) | 4 | S3 | CONSUMER, ENTERPRISE | 5 | Vault slot `au_terms_review`. **[verify]** commencement and small-business thresholds: not read | [AU-S15] |
| AU-4.03 | Spam Act: consent for every commercial electronic message (including when another business sends for you), with evidence on request; sender identified; a working, free unsubscribe with clear instructions, functional for at least 30 days, honoured within 5 business days. Purely factual messages are a narrow exception | 4 | S3 | MARKETING | 5 | Attestation `au_spam_act` | [AU-S16] |
| AU-4.04 | Do Not Call Register checks before telemarketing calls | 4 | S3 | TELEMARKETING | 5 | Attestation `au_dncr`. **[verify]** not opened | [AU-S16] |

### 3.5 Layer 5 — Fundraising

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| AU-5.01 | Every share issue notified to ASIC within 28 days on Form 484 (change to share structure and to members register); no fee, late fee after 28 days. Non-cash issue under a written contract also needs Form 207Z; a class division or conversion is Form 211 within 14 days | 5 | event-driven | INVESTED | 4 | Slot `au_form_484` (lodgement receipt) or `au_asic_extract` after the round | [AU-S8] |
| AU-5.02 | Capital raised without a prospectus relies on an exemption: small-scale personal offers (20 investors and A$2m in 12 months, no advertising), sophisticated or professional investors (s 708) | 5 | S4 | INVESTED | 5 | Attestation `au_s708_exemption` (which one, investor count, amount). [verify] the exact s 708(1) wording ("not more than 20" versus "fewer than 20"): ASIC's page as read and the statute differ in summaries | [AU-S17] |
| AU-5.03 | Crowd-sourced funding offer through a licensed intermediary | 5 | S4 | INVESTED (CSF) | 5 | Attestation `au_csf`. ASIC RG 261 found; [verify] eligibility for proprietary companies | [AU-S17] |
| AU-5.04 | Proprietary company shareholder limit (non-employee shareholders) | 5 | S4 | INVESTED | 5 | Attestation `au_shareholder_limit`. **[verify]** Corporations Act s 113 (50 non-employee shareholders): not read | [AU-S10] |
| AU-5.05 | Shareholders' agreement and investment documents | 5 | S4 | INVESTED | 5 | Vault (International pack slots) | — (contractual) |

### 3.6 Layer 6 — AI and data

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| AU-6.01 | **Binding law.** Automated decision-making transparency in the privacy policy from 10 Dec 2026 | 6 | S3 | PRIVACY_ACT, AI | 1 / 5 | Cross-reference AU-3.03 (encoded once there) | [AU-S7] |
| AU-6.02 | **Guidance.** Guidance for AI Adoption (National AI Centre, 21 Oct 2025): six essential practices; replaces and simplifies the Voluntary AI Safety Standard. Voluntary | 6 | S3 | AI | 5 | Vault slot `au_ai_governance` (International pack AI rule) | [AU-S18] |
| AU-6.03 | **Guidance.** Australia's AI Ethics Principles; National AI Plan 2025 | 6 | — | AI | — | Information only | [AU-S18] |

---

## 4. Counts

| | Items |
|---|---|
| Total items (AU-1.01 to AU-6.03) | 40 |
| Carrying **[verify]** | 21 |
| Tier 1 possible (ABN Lookup or URL scan) | 6 |
| Tier 3 | 1 |
| Tier 4 (alone or with another route) | 11 |
| Tier 5 only | 20 |
| Information only | 2 |

Tier rows overlap where an item has two routes (for example "5 / 4").

---

## 5. Core set every Australian proprietary company must show at Stage 2

1. Registered with ASIC (AU-1.01; tier 4 until ASIC status is built) and ABN active (AU-1.02; tier 1).
2. Registered office in Australia and a resident director (AU-1.04, 1.05; tier 4 / 5).
3. Director IDs held by every director (AU-1.07; tier 5).
4. Annual statement reviewed, fee paid and solvency resolution passed (AU-1.10, 1.11; tier 4 / 5).
5. Members register kept, with beneficial-ownership status (AU-1.08; tier 5).
6. Privacy Act coverage decided; privacy policy published if covered (AU-3.01, 3.02).
7. Founders' and contractors' IP assigned (AU-2.02, 2.04; tier 5).

---

## 6. To confirm before encoding

- The 30-day NDB assessment period; APP 1.4 and APP 1.7–1.8 contents; statutory privacy tort commencement (not an item: no route).
- Large proprietary test triggers beyond size, and the Budget 2026–27 change if legislated.
- Corporations Act sections cited as [verify] (113, 134, 168–169, 251A, 708(1)).
- 28-day period for officeholder and address changes.
- Employer obligations (PAYG, super, STP, workers' compensation, Fair Work): no official page opened.
- ACL and unfair contract terms details.
- ABN Lookup: first real reply; whether ASIC status can be added.

---

## 7. Sources (all checked 16 Nov 2026)

| Key | Source | URL | How read |
|---|---|---|---|
| AU-S1 | ABN Lookup, Australian Business Register (as documented for the engine) | https://abr.business.gov.au/ ; `docs/NATIONAL-REGISTERS.md` | Engine documentation (official pages checked 16 Nov 2026; no real reply) |
| AU-S2 | ASIC, "Company officeholders (directors and secretaries)"; "Register a company" | https://www.asic.gov.au/for-business-and-companies/companies/company-building-blocks/company-officeholders-directors-and-secretaries | S |
| AU-S3 | ASIC, "Company annual review"; "Run your company" | https://www.asic.gov.au/for-business-and-companies/companies/company-annual-review | S |
| AU-S4 | ASIC, "Are you a large or small proprietary company" | https://www.asic.gov.au/regulatory-resources/financial-reporting-and-audit/preparers-of-financial-reports/are-you-a-large-or-small-proprietary-company | S |
| AU-S5 | ABRS, "Who needs to apply and when"; "Top questions when applying for a director ID" | https://www.abrs.gov.au/director-identification-number/who-needs-apply-and-when | S |
| AU-S6 | OAIC, "Small business"; "Part 4: Notifiable Data Breach (NDB) Scheme" | https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/organisations/small-business | S |
| AU-S7 | OAIC, "New resources on transparency for use of AI and automated decision-making"; APP 1.7–1.9 Transparency Obligation Fact Sheet (Sep 2026); APP Guidelines Chapter 1 (Oct 2025) | https://www.oaic.gov.au/news/media-centre/new-resources-on-transparency-for-use-of-ai-and-automated-decision-making | S |
| AU-S8 | ASIC, "Company share issues"; "How to change company details - Share structure" (Jun 2025) | https://www.asic.gov.au/for-business-and-companies/companies/company-share-and-shareholder-rules-and-changes/company-share-issues | S |
| AU-S9 | ATO, "Registering for GST" | https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/registering-for-gst | S |
| AU-S10 | Corporations Act 2001 (Cth); ASIC, "Transfer of shares or change to beneficial ownership status" | https://www.legislation.gov.au/C2004A00818/latest/text ; https://www.asic.gov.au/for-business-and-companies/companies/company-share-and-shareholder-rules-and-changes/transfer-of-shares-or-change-to-beneficial-ownership-status | N (Act); S (ASIC page found, content not read) |
| AU-S11 | IP Australia, "Who owns intellectual property?"; Patent Manual 7.2.8.5 | https://www.ipaustralia.gov.au/understanding-ip/who-owns-ip | S |
| AU-S12 | ATO employer obligations; state workers' compensation regulators | https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers | N |
| AU-S13 | Fair Work Ombudsman | https://www.fairwork.gov.au | N |
| AU-S14 | ASIC professional registers; AUSTRAC | https://www.asic.gov.au ; https://www.austrac.gov.au | N |
| AU-S15 | Competition and Consumer Act 2010, Schedule 2 (Australian Consumer Law); ACCC | https://www.legislation.gov.au/C2004A00109/latest/text ; https://www.accc.gov.au | N |
| AU-S16 | ACMA, "Email and SMS unsubscribe rules" fact sheet (May 2024); Spam Act 2003 | https://www.acma.gov.au/sites/default/files/2024-05/Fact%20sheet%20-%20email%20and%20SMS%20unsubscribe%20rules.pdf | S (Do Not Call Register: N) |
| AU-S17 | ASIC, "Disclosure documents to be provided to potential investors when raising funds"; RG 254 (Apr 2026); RG 261 | https://www.asic.gov.au/regulatory-resources/fundraising/disclosure-documents-to-be-provided-to-potential-investors-when-raising-funds | S |
| AU-S18 | Department of Industry, Science and Resources, "Guidance for AI adoption"; "Voluntary AI Safety Standard"; "Australia's AI Ethics Principles" | https://www.industry.gov.au/publications/guidance-for-ai-adoption | S |

The Federal Register of Legislation ids (C2004A00818 for the Corporations Act 2001, C2004A00109 for the Competition and Consumer Act 2010) were written from memory and were not opened: **[verify]** each resolves before a rule cites it.

---

## 8. Not encoded (draft pack `packages/rules/src/packs/au.ts`, 16 Nov 2026)

The draft pack `AU` 0.1.0 holds 15 rules from 15 items. Rules that cite a **[verify]** line are `needs_review`: they can only say "a person needs to check this" until a lawyer clears the line. These 25 items were left out:

| Item | Why it is not a rule yet |
|---|---|
| AU-1.03 | [verify]; the International pack already asks for the constitution (`INTL.CORP.CONSTITUTION`) |
| AU-1.08 | [verify] sections and notice period; `INTL.EQUITY.CAP_TABLE` asks for the members register |
| AU-1.09 | Information only |
| AU-1.12 | [verify] other triggers and the deadline; the large proprietary test is not asked yet |
| AU-1.14 | [verify]; covered by `INTL.CORP.RESOLUTIONS` |
| AU-2.01, AU-2.03 | Covered by `INTL.IP.STAFF_ASSIGNMENT` (AU-2.01 is also [verify]) |
| AU-2.02 | A default ownership rule, no added duty; covered by `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| AU-2.04 | Same as `INTL.IP.OWNER_ASSIGNMENT` |
| AU-2.05 | [verify]; not a legal duty |
| AU-3.02 | [verify] the APP 1.4 contents; `INTL.DP.PRIVACY_NOTICE` checks the website |
| AU-3.04 | [verify] the 30-day assessment; `INTL.SEC.INCIDENT_RESPONSE` asks for the same plan |
| AU-3.06 to AU-3.09 | [verify], the official pages were not opened |
| AU-4.01, AU-4.02 | [verify], the Act was not read; `INTL.COM.TERMS` checks published terms |
| AU-4.04 | [verify], not opened |
| AU-5.03 | [verify] eligibility; there is no crowd-funding trigger |
| AU-5.04 | [verify] s 113 |
| AU-5.05 | Covered by the International pack's fundraising slots |
| AU-6.01 | Encoded once, at AU-3.03 (`AU.DP.AUTOMATED_DECISIONS`, from 10 Dec 2026) |
| AU-6.02 | Covered by the International pack's AI rules |
| AU-6.03 | Information only |

Encoded with care: no rule reads ABN Lookup as company status. `AU.TAX.ABN` is a defect only for a cancelled ABN, and says it is the tax registration. `AU.CORP.ASIC_REGISTRATION` needs the ASIC extract. `AU.TAX.GST` gives "verify", not a gap, when no GST registration shows, because the turnover is only the company's to say. New question: `au_privacy_act` (sets `PRIVACY_ACT`; "not sure" stays unknown).

### Website rules not encoded (17 Nov 2026): regulator named in the notice, and legal notice

The website scan can now read `web.policy.dpa_named`, `web.policy.dpa_countries`, `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, and the EU packs use them. AU: AU-3.02 lists "complaints" as part of the APP privacy policy, which is how to complain to the company, not the OAIC, and the APP 1.4 content list is [verify] (not read). No rule naming the OAIC was added. The map lists no duty to show company particulars on a website.
