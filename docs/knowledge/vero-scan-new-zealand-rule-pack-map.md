# Vero Scan — New Zealand Rule-Pack Map

**Status: Draft from official sources, for lawyer review. Not legal advice.**

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company type:** Limited company (Ltd) registered under the Companies Act 1993, not an FMC reporting entity and not a "large" company unless stated.
**Source:** No lawyer-supplied source document exists for New Zealand. Every line below cites an official source (legislation.govt.nz, companiesoffice.govt.nz, privacy.org.nz, ird.govt.nz, fma.govt.nz, xrb.govt.nz, mbie.govt.nz) listed in section 7, with the date it was checked.
**Stage and trigger assignments are proposals.** A lawyer approves, edits or strikes each line before it is encoded or affects a score.

> Technical mapping, not legal advice. Nothing here has been reviewed by a New Zealand lawyer.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every New Zealand company at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Collects or holds personal information (the Privacy Act 2020 has no size threshold) |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Supplies consumers |
| MARKETING | Sends commercial electronic messages (new trigger) |
| AI | Uses or builds AI in the product |
| SECTOR.PAYMENTS, .CREDIT, .CRYPTO | Financial service provider activity; only as triggers here |
| LARGE | Meets the "large" entity test (new trigger) |
| INVESTED | Has raised or is raising equity |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault). Routes refer to the *Verification Solutions Matrix*, section 5.

**Verification route.** Each item names one of: an engine **fact** (exact key from `packages/connectors/src/fact-keys.ts`), a **slot** (document upload, tier 4) or an **attestation** (tier 5). Slot and attestation ids (`nz_…`) are proposals; they do not exist in code yet.

**Item ids.** `NZ-<layer>.<nn>`. A rule cites the map and the id, for example "New Zealand map §3, NZ-1.08".

**Sources and "checked".** Each line cites a key (`[NZ-S2]`) from section 7, which gives the URL, the date (16 Nov 2026 for all) and how the page was read:
- **R**: opened and read.
- **S**: the official page was read through its indexed text, in a search limited to that official domain.
- **N**: named but not opened. Every line resting on an N source carries **[verify]**.

**[verify]** means the line could not be fully confirmed from an official source on 16 Nov 2026, or a figure, section number or date needs a lawyer's check. The text says what is uncertain.

**What the engine can see in New Zealand.** The Companies Office register through the NZBN API (`nz.companies`, needs `NZ_NZBN_API_KEY`, not yet tried against a real reply): NZBN, company number, name, status code (50 Registered, 80 Removed, liquidation and receivership codes), entity type, incorporation date, **annual return filing month and the date the last one was filed**, and how many current directors there are and how many of them are companies. Names and addresses never leave the parser. That makes New Zealand's annual return the most automatable annual filing of the five countries.

---

## 2. Notes for the owner and the reviewing lawyer

1. **Annual return overdue is computable.** With `annual_return_filing_month` and `annual_return_last_filed_on`, a rule can say "the return for this year's filing month has not been filed" once the month has ended. Removal from the register is the Registrar's sanction [NZ-S2], so this should be one of the strongest New Zealand findings, once the first real reply confirms the date format.
2. **Director identification number: not confirmed.** MBIE consulted on a director ID; the Companies Office mentions a director ID verification service for online authority. Whether a statutory director ID duty is in force could not be confirmed (NZ-1.06). Do not encode a director-ID rule until a lawyer confirms.
3. **Commissioned software: law may have changed.** The former Copyright Act s 21(3) gave copyright in a commissioned computer program to the person who paid for it. The current text, as indexed on legislation.govt.nz, appears to show only s 21(1) and (2). Which rule applies to a contractor's code today is the biggest New Zealand uncertainty (NZ-2.02). Either way a written assignment settles it.
4. **No beneficial-ownership register** was found in force; shareholders are on the public register, which the engine does not read (it keeps no people).
5. **Engine gaps (not built; proposals only).** (a) Shareholder count and share-issue events from the register (counts only). (b) GST number from the NZBN record, if published, for NZ-3.07. (c) A `web.policy.complaint_route_opc` fact. (d) FSP register import for NZ-3.09.

---

## 3. Item map

### 3.1 Layer 1 — Corporate foundation

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| NZ-1.01 | Company on the Companies Register and registered (not removed, in liquidation or in receivership) | 1 | S2 | ALL | 1 | Facts `registry.nz.companies.identified`, `registry.nz.companies.status_code`, `registry.nz.companies.status`, `registry.nz.companies.company_number`, `registry.nz.companies.nzbn`, `registry.nz.companies.incorporated_on` | [NZ-S1] |
| NZ-1.02 | Entity type is a limited company | 1 | S2 | ALL | 1 | Facts `registry.nz.companies.entity_type_code`, `registry.nz.companies.entity_type` | [NZ-S1] |
| NZ-1.03 | Constitution: optional (the Companies Act applies where there is none); if adopted, amended or removed, it is filed with the Companies Office | 1 | S2 | ALL | 4 / 5 | Slot `nz_constitution`; attestation `nz_no_constitution`. **[verify]** the filing rule and period: Companies Office page found, not read | [NZ-S3] |
| NZ-1.04 | Registered office and address for service in New Zealand | 1 | S2 | ALL | 5 | Attestation `nz_registered_office` (the engine does not keep addresses). **[verify]** requirements: Companies Office "Company addresses" page found, not read | [NZ-S3] |
| NZ-1.05 | At least one director who lives in New Zealand, or who lives in Australia and is a current director of an Australian-incorporated company (ACN given). The Registrar generally treats more than 183 days' presence in 12 months as living in New Zealand. A sole director who meets the rule cannot be removed until a new qualifying director is appointed | 1 | S2 | ALL | 5 | Attestation `nz_resident_director`; supporting fact `registry.nz.companies.directors_count` (at least 1) | [NZ-S4] |
| NZ-1.06 | Director identification number | 1 | S2 | ALL | 5 | **[verify]** whether any director-ID duty is in force: only MBIE consultation papers and a Companies Office "director ID verification" service were found. Not to be encoded until confirmed | [NZ-S5] |
| NZ-1.07 | Directors are natural persons | 1 | S2 | ALL | 1 | Fact `registry.nz.companies.directors_entity_count` (expected 0). **[verify]** that a company cannot be a director under the Companies Act 1993: not read in this check | [NZ-S1], [NZ-S6] |
| NZ-1.08 | Annual return filed each year during the company's filing month (first one in the calendar year after incorporation); fee NZ$49.74 plus GST; extensions possible; the Registrar may remove a company that does not file. The filing month cannot be changed while a return is due or overdue, or to December or January | 1 | S3 (annual) | ALL | 1 | Facts `registry.nz.companies.annual_return_filing_month`, `registry.nz.companies.annual_return_last_filed_on` | [NZ-S2] |
| NZ-1.09 | Share register kept in New Zealand at the registered office (unless the constitution allows another address or a divided register), with every share issue recorded | 1 | S2 | ALL | 5 | Attestation `nz_share_register` | [NZ-S7] |
| NZ-1.10 | Financial statements: a "large" company (total assets above NZ$66m at each of the two preceding balance dates, or revenue above NZ$33m in each of the two preceding periods, as inflation-adjusted from 1 Jan 2022) prepares general purpose financial statements and has them audited; overseas companies and their subsidiaries have lower thresholds and file them | 1 | S3 (annual) | LARGE | 5 / 4 | Attestation `nz_large_test`; slot `nz_financial_statements`. **[verify]** the filing and audit rules and the 25%-overseas-owned case: XRB material read, Companies Act ss 201–207 not read | [NZ-S8] |
| NZ-1.11 | Small company accounts for tax: financial statements prepared for Inland Revenue | 1 | S3 (annual) | ALL (not large) | 5 | Attestation `nz_tax_financials`. **[verify]** the IRD minimum requirements: not opened | [NZ-S9] |
| NZ-1.12 | Company records: minutes, resolutions, interests register | 1 | S2 | ALL | 5 | Vault slot `nz_company_records`. **[verify]** Companies Act s 189: not read | [NZ-S6] |
| NZ-1.13 | Changes of directors notified to the Registrar | 1 | event-driven | ALL | 1 / 5 | Fact `registry.nz.companies.directors_count` (change between scans, signal only); attestation `nz_director_changes`. **[verify]** the 20-working-day period: not read | [NZ-S6] |

### 3.2 Layer 2 — IP and technology

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| NZ-2.01 | Employer is the first owner of copyright in a literary, dramatic, musical or artistic work (computer programs are literary works) an employee makes in the course of employment, unless agreed otherwise (Copyright Act 1994 s 21(2)) | 2 | S2 | EMPLOYEES | 5 | Vault slot `nz_employment_agreements` (IP clause) | [NZ-S10] |
| NZ-2.02 | Commissioned software from contractors: who owns it by default | 2 | S2 | CONTRACTORS | 5 | Vault slot `nz_contractor_ip` (written assignment); supporting facts `github.contributor_count`, `github.contributor_logins`, `docusign.envelopes_completed`. **[verify]** whether the commissioning rule in former s 21(3) (commissioner owns a commissioned computer program it paid for) still applies, and since when if repealed (note 3) | [NZ-S10] |
| NZ-2.03 | Founders' pre-incorporation IP assigned to the company | 2 | S1 | ALL | 5 | Vault slot `nz_founder_ip_assignment` | [NZ-S10] |
| NZ-2.04 | Trade mark filed with IPONZ (copyright has no registration in New Zealand) | 2 | S2 / S3 | ALL | 4 | Slot `nz_trademark`. **[verify]** IPONZ search access: not opened | [NZ-S11] |

### 3.3 Layer 3 — Compliance and regulatory

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| NZ-3.01 | Privacy Act 2020 information privacy principles apply to the company | 3 | S2 | PERSONAL_DATA | 5 | Attestation `nz_privacy_act`. **[verify]** that there is no size threshold: not read in this check | [NZ-S12] |
| NZ-3.02 | Privacy officer appointed | 3 | S2 | PERSONAL_DATA | 5 + 1 | Attestation `nz_privacy_officer`; fact `web.policy.dpo_contact`. **[verify]** Privacy Act 2020 s 201: OPC pages refer to "your privacy officer" but the section was not read | [NZ-S12], [NZ-S13] |
| NZ-3.03 | Privacy statement when collecting from the individual (IPP 3) | 3 | S2 | WEBSITE / APP | 1 | Facts `web.policy.privacy_notice_found`, `web.policy.names_company`, `web.policy.rights_section`, `web.policy.last_updated`. **[verify]** the IPP 3 content list: not read | [NZ-S14] |
| NZ-3.04 | IPP 3A (from 1 May 2026): when collecting personal information indirectly, notify the individual (agency name and address or equivalent, among other matters), unless an exception applies; only for information collected from 1 May 2026 | 3 | S2 | PERSONAL_DATA (indirect collection) | 5 | Attestation `nz_ipp3a` | [NZ-S15] |
| NZ-3.05 | Notifiable privacy breach: notify the Privacy Commissioner (and affected people) as soon as practicable; OPC expects no later than 72 hours after becoming aware; failing to notify without reasonable excuse is an offence | 3 | S2 / event-driven | PERSONAL_DATA | 5 | Vault slot `nz_breach_plan` | [NZ-S13] |
| NZ-3.06 | Disclosure overseas protected (IPP 12) | 3 | S2 | PERSONAL_DATA (data leaves NZ) | 1 / 5 | Fact `web.policy.transfers_section`; vault slot `nz_transfers`. **[verify]** IPP 12: not read | [NZ-S14] |
| NZ-3.07 | GST registration within 21 days once turnover was over NZ$60,000 in the last 12 months or is expected to go over it in the next 12; voluntary below that | 3 | S3 | ALL | 4 | Slot `nz_gst_registration` (engine gap 5b) | [NZ-S9] |
| NZ-3.08 | Registered as an employer with Inland Revenue before the first payday; PAYE; KiwiSaver; written employment agreements | 3 | S2 (first employee) | EMPLOYEES | 4 / 5 | Slot `nz_employer_registration`; attestation `nz_employment_agreements`. **[verify]** all of it: IRD and Employment NZ pages not opened | [NZ-S16] |
| NZ-3.09 | Registered on the Financial Service Providers Register where required | 3 | S2 | SECTOR.PAYMENTS, .CREDIT, .CRYPTO | 3 | FSP Register (engine gap 5d). **[verify]** scope and importability: not opened. Trigger only | [NZ-S17] |

### 3.4 Layer 4 — Commercial

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| NZ-4.01 | Fair Trading Act 1986: no misleading or deceptive conduct; unfair contract terms in standard form consumer and small trade contracts | 4 | S3 | CONSUMER | 5 + 1 | Vault slot `nz_terms_review`; fact `web.policy.terms_found`. **[verify]** not read | [NZ-S18] |
| NZ-4.02 | Consumer Guarantees Act 1993: guarantees apply to consumer supplies and cannot be contracted out of for consumers; business-to-business contracting out must be in writing | 4 | S3 | CONSUMER | 5 + 1 | Vault slot `nz_terms_review`; fact `web.policy.refund_policy_found`. **[verify]** not read | [NZ-S18] |
| NZ-4.03 | Unsolicited Electronic Messages Act 2007: consent, accurate sender information, and a functional unsubscribe facility | 4 | S3 | MARKETING | 5 | Attestation `nz_uema`. **[verify]** requirements and the unsubscribe period: not read | [NZ-S19] |

### 3.5 Layer 5 — Fundraising

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| NZ-5.01 | Share issue notified to the Companies Office within 10 working days (number, issue date, holdings and each shareholder's legal name and address), new shareholders registered at the same time, and recorded on the share register; a change to total shares is also notified within 10 working days | 5 | event-driven | INVESTED | 4 / 5 | Slot `nz_share_issue_notice` (Companies Office confirmation); attestation. Engine gap 5a | [NZ-S7] |
| NZ-5.02 | Small offers exclusion (FMC Act Sch 1 cl 12): personal offers to no more than 20 investors, no more than NZ$2m in any 12 months (shared with crowdfunding under cl 6), no advertising, a warning statement to investors, and notice to the FMA; 50 or more shareholders from small offers makes the company an FMC reporting entity | 5 | S4 | INVESTED | 5 / 4 | Attestation `nz_small_offers`; slot `nz_fma_notice` | [NZ-S20] |
| NZ-5.03 | Wholesale investor exclusions (eligible, large, investment business investors) | 5 | S4 | INVESTED | 5 | Attestation `nz_wholesale_certificates`. **[verify]** FMC Act Sch 1 cl 3 and certificate rules: not read | [NZ-S20] |
| NZ-5.04 | Board resolution and certificate for the issue; pre-emption rights unless the constitution changes them | 5 | S4 | INVESTED | 5 | Vault slot `nz_issue_resolution`. **[verify]** Companies Act ss 45, 47: not read | [NZ-S6] |
| NZ-5.05 | Shareholders' agreement and investment documents | 5 | S4 | INVESTED | 5 | Vault (International pack slots) | — (contractual) |

### 3.6 Layer 6 — AI and data

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| NZ-6.01 | **Status, not an obligation.** No AI-specific statute found. New Zealand's AI Strategy (July 2025) follows a proportionate, risk-based approach using existing law | 6 | — | AI | — | Information only | [NZ-S21] |
| NZ-6.02 | **Guidance.** Responsible AI Guidance for Businesses (MBIE, July 2025): voluntary; purpose, governance, procurement, privacy, security, transparency, testing and monitoring | 6 | S3 | AI | 5 | Vault slot `nz_ai_governance` (International pack AI rule) | [NZ-S21] |
| NZ-6.03 | **Binding law applied to AI.** The Privacy Act 2020 applies to personal information used in AI tools | 6 | S3 | AI, PERSONAL_DATA | 1 / 5 | Fact `web.policy.ai_disclosure_found`; same vault slot. **[verify]** OPC AI guidance: not opened | [NZ-S13] |

---

## 4. Counts

| | Items |
|---|---|
| Total items (NZ-1.01 to NZ-6.03) | 37 |
| Carrying **[verify]** | 22 |
| Tier 1 possible (register or URL scan) | 11 |
| Tier 3 | 1 |
| Tier 4 (alone or with another route) | 7 |
| Tier 5 only | 17 |
| Information only | 1 |

Tier rows overlap where an item has two routes (for example "4 / 5").

---

## 5. Core set every New Zealand company must show at Stage 2

1. Registered, a limited company, not removed or in liquidation (NZ-1.01, 1.02; tier 1).
2. Annual return filed in its filing month (NZ-1.08; tier 1).
3. A director living in New Zealand or Australia (NZ-1.05; tier 5), directors all natural persons (NZ-1.07; tier 1).
4. Share register kept and share issues notified (NZ-1.09, 5.01; tier 5 / 4).
5. Privacy officer and privacy statement (NZ-3.02, 3.03).
6. Founders' and contractors' IP assigned (NZ-2.02, 2.03; tier 5).

---

## 6. To confirm before encoding

- Director identification number: in force or not (NZ-1.06).
- Copyright Act s 21(3) commissioning rule: current status (NZ-2.02).
- Privacy Act 2020 s 201 (privacy officer), IPP 3 and IPP 12 contents.
- Companies Act sections cited as [verify] (constitution filing, director changes, records, ss 45, 47, 189, 201–207).
- Fair Trading Act, Consumer Guarantees Act, Unsolicited Electronic Messages Act details.
- Employer registration and KiwiSaver.
- NZBN API: first real reply, especially the date format for `annual_return_last_filed_on`.

---

## 7. Sources (all checked 16 Nov 2026)

| Key | Source | URL | How read |
|---|---|---|---|
| NZ-S1 | Companies Office register through the NZBN API (as documented for the engine) | https://api.business.govt.nz/ ; `docs/NATIONAL-REGISTERS.md` | Engine documentation (official OpenAPI checked 16 Nov 2026; no real reply) |
| NZ-S2 | Companies Office, "Completing an annual return"; "Changing your annual return filing month" | https://companies-register.companiesoffice.govt.nz/help-centre/company-annual-returns/completing-an-annual-return/ | S |
| NZ-S3 | Companies Office, "Adding, amending or removing a company constitution"; "Company addresses" | https://companies-register.companiesoffice.govt.nz/help-centre/keeping-company-details-up-to-date/adding-amending-or-removing-a-company-constitution/ | N (found, content not read) |
| NZ-S4 | Companies Office, "Who can be a director"; "Before you set up a company" | https://companies-register.companiesoffice.govt.nz/help-centre/company-directors/who-can-be-a-director/ | S |
| NZ-S5 | MBIE, "Consultation on Whether to Introduce a Director Identification Number"; Companies Office, "Confirming your authority to manage information" | https://www.mbie.govt.nz/assets/abc4548fa8/consultation-on-whether-to-introduce-a-director-identification-number.pdf | S |
| NZ-S6 | Companies Act 1993 | https://www.legislation.govt.nz/act/public/1993/0105/latest/whole.html | N |
| NZ-S7 | Companies Office, "Issuing shares in a company"; "Managing share allocations" | https://companies-register.companiesoffice.govt.nz/help-centre/starting-a-company/issuing-shares-in-a-company/ | S |
| NZ-S8 | External Reporting Board, "Financial Reporting (Inflation Adjustments) Regulations 2021"; XRB A2 | https://www.xrb.govt.nz/standards/accounting-standards/accounting-standards-framework/financial-reporting-inflation-adjustments-regulations-2021/ | S |
| NZ-S9 | Inland Revenue, "Registering for GST"; IR375 GST guide (Mar 2026) | https://www.ird.govt.nz/gst/registering-for-gst | S (tax financial statements: N) |
| NZ-S10 | Copyright Act 1994, s 21 (as at 13 Nov 2025) | https://www.legislation.govt.nz/act/public/1994/0143/latest/whole.html | S (direct page refused the reader, HTTP 403) |
| NZ-S11 | IPONZ | https://www.iponz.govt.nz | N |
| NZ-S12 | Privacy Act 2020 | https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html | N |
| NZ-S13 | Office of the Privacy Commissioner, "Breach management" (Poupou Matatapu) | https://www.privacy.org.nz/responsibilities/poupou-matatapu-doing-privacy-well/breach-management/ | S |
| NZ-S14 | Office of the Privacy Commissioner, "Privacy principles" | https://www.privacy.org.nz/privacy-principles/ | N (found, content not read) |
| NZ-S15 | Office of the Privacy Commissioner, "IPP3A"; IPP3A guidance (16 Dec 2025) | https://www.privacy.org.nz/resources-and-learning/a-z-topics/ipp3a/ | S |
| NZ-S16 | Inland Revenue employer pages; Employment New Zealand | https://www.ird.govt.nz/employing-staff ; https://www.employment.govt.nz | N |
| NZ-S17 | Financial Service Providers Register | https://fsp-register.companiesoffice.govt.nz | N |
| NZ-S18 | Fair Trading Act 1986; Consumer Guarantees Act 1993; Commerce Commission | https://www.legislation.govt.nz/act/public/1986/0121/latest/whole.html ; https://www.legislation.govt.nz/act/public/1993/0091/latest/whole.html | N |
| NZ-S19 | Unsolicited Electronic Messages Act 2007; Department of Internal Affairs | https://www.legislation.govt.nz/act/public/2007/0007/latest/whole.html | N |
| NZ-S20 | FMA, "Summary of Schedule 1 exclusions under the FMC Act"; "Offers under the FMC Act" | https://www.fma.govt.nz/assets/Information-sheets/141101-Exclusions-under-the-Financial-Markets-Conduct-Act-2013-FMC-Act-summary-of-schedule-1.pdf | S (the summary sheet is from 2014: [verify] against the current Act) |
| NZ-S21 | MBIE, "Responsible Artificial Intelligence guidance for businesses"; "New Zealand's Strategy for Artificial Intelligence" (Jul 2025) | https://www.mbie.govt.nz/business-and-employment/business/support-for-business/responsible-ai-guidance-for-businesses | S |

The legislation.govt.nz paths for the Companies Act, Privacy Act, Fair Trading Act, Consumer Guarantees Act and Unsolicited Electronic Messages Act were written from their Act numbers and were not opened: **[verify]** each resolves before a rule cites it.

---

## 8. Not encoded (draft pack `packages/rules/src/packs/nz.ts`, 16 Nov 2026)

The draft pack `NZ` 0.1.0 holds 11 rules from 11 items. Rules that cite a **[verify]** line are `needs_review`: they can only say "a person needs to check this" until a lawyer clears the line. `NZ.FUND.OFFER_EXCLUSION` also cites source NZ-S20, which section 7 flags for checking, so it is `needs_review` too. These 26 items were left out:

| Item | Why it is not a rule yet |
|---|---|
| NZ-1.03 | [verify], not read; the International pack already asks for the constitution |
| NZ-1.04 | [verify], not read |
| NZ-1.06 | Not to be encoded until a lawyer confirms a director ID duty exists (note 2) |
| NZ-1.07 | [verify] the rule itself |
| NZ-1.10, NZ-1.11 | [verify]; the "large" test is not asked yet |
| NZ-1.12 | [verify]; covered by `INTL.CORP.RESOLUTIONS` |
| NZ-1.13 | [verify] the 20-working-day period |
| NZ-2.01 | A default ownership rule, no added duty; covered by `INTL.IP.STAFF_ASSIGNMENT` |
| NZ-2.02 | [verify] (note 3); covered by `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| NZ-2.03 | Same as `INTL.IP.OWNER_ASSIGNMENT` |
| NZ-2.04 | [verify]; not a legal duty |
| NZ-3.01 | [verify]; a scope statement, the `PERSONAL_DATA` trigger is used instead |
| NZ-3.03 | [verify]; `INTL.DP.PRIVACY_NOTICE` checks the website |
| NZ-3.06, NZ-3.08, NZ-3.09 | [verify] |
| NZ-4.01 to NZ-4.03 | [verify], the Acts were not read |
| NZ-5.03, NZ-5.04 | [verify] |
| NZ-5.05 | Covered by the International pack's fundraising slots |
| NZ-6.01 | Information only |
| NZ-6.02 | Covered by the International pack's AI rules |
| NZ-6.03 | [verify]; covered by the International pack's AI rules |

Encoded with care: `NZ.CORP.STATUS` reads the status code: 50 passes, 80 (Removed) is a defect, and every other code (liquidation, receivership) is "verify". `NZ.CORP.ANNUAL_RETURN` is worked out by `derived.nz.annual_return_overdue` from the filing month, the last filing date and the incorporation date; any of them missing or unreadable makes it "verify". The director count is never read as proof of residence. `NZ.DP.BREACH` stands in for `INTL.SEC.INCIDENT_RESPONSE`, and `NZ.CORP.SHARE_REGISTER` for `INTL.EQUITY.CAP_TABLE`.

### Website rules not encoded (17 Nov 2026): regulator named in the notice, and legal notice

The website scan can now read `web.policy.dpa_named`, `web.policy.dpa_countries`, `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, and the EU packs use them. NZ: NZ-3.03 (IPP 3) is [verify] on its content list and says nothing about naming the Privacy Commissioner, so none was added. The map lists no duty to show company particulars on a website.
