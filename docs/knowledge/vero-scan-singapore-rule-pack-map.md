# Vero Scan — Singapore Rule-Pack Map

**Status: Draft from official sources, for lawyer review. Not legal advice.**

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company type:** Private company limited by shares (Pte. Ltd.), non-listed, incorporated under the Companies Act 1967.
**Source:** No lawyer-supplied source document exists for Singapore. Every line below cites an official source (sso.agc.gov.sg, acra.gov.sg, pdpc.gov.sg, dnc.gov.sg, iras.gov.sg, cpf.gov.sg, ipos.gov.sg, imda.gov.sg) listed in section 7, with the date it was checked.
**Stage and trigger assignments are proposals.** A lawyer approves, edits or strikes each line before it is encoded or affects a score.

> Technical mapping, not legal advice. Nothing here has been reviewed by a Singapore lawyer.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Singapore private company at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Collects, uses or discloses personal data (PDPA) |
| EMPLOYEES | Has employees |
| CPF_EMPLOYEES | Employs Singapore Citizens or Permanent Residents (new trigger) |
| FOREIGN_WORKERS | Employs people on work passes |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | B2C product |
| MARKETING | Sends marketing messages, calls or emails (new trigger) |
| NOMINEES | Has a nominee director or nominee shareholder (new trigger) |
| AI | Uses or builds AI in the product |
| SECTOR.PAYMENTS, .CRYPTO | MAS-licensed activity; only as triggers here |
| INVESTED | Has raised or is raising equity |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault). Routes refer to the *Verification Solutions Matrix*, section 5.

**Verification route.** Each item names one of: an engine **fact** (exact key from `packages/connectors/src/fact-keys.ts`), a **slot** (document upload, tier 4) or an **attestation** (tier 5). Slot and attestation ids (`sg_…`) are proposals; they do not exist in code yet.

**Item ids.** `SG-<layer>.<nn>`. A rule cites the map and the id, for example "Singapore map §3, SG-1.13".

**Sources and "checked".** Each line cites a key (`[SG-S3]`) from section 7, which gives the URL, the date (16 Nov 2026 for all) and how the page was read:
- **R**: opened and read.
- **S**: the official page was read through its indexed text, in a search limited to that official domain.
- **N**: named but not opened. Every line resting on an N source carries **[verify]**.

**[verify]** means the line could not be fully confirmed from an official source on 16 Nov 2026, or a figure, section number or date needs a lawyer's check. The text says what is uncertain.

**What the engine can see in Singapore.** ACRA's "Entities Registered with ACRA" dataset on data.gov.sg (`sg.acra`, keyless, checked against a real reply on 16 Nov 2026): UEN, name, status, entity type, UEN issue date, issuing agency and registered-office postcode. It is a **monthly copy** with **no officers, shareholders or filings**. Those are in ACRA's paid BizFile service, which is not built. So annual return, director and shareholder items are tier 4 (a BizFile business profile upload) or tier 5.

---

## 2. Notes for the owner and the reviewing lawyer

1. **A miss in the monthly copy is not a problem with the company.** A company incorporated this month may be missing (`docs/NATIONAL-REGISTERS.md`). Rules reading `registry.sg.acra.*` must treat a miss as unknown.
2. **BizFile business profile as the standard upload.** One ACRA business profile (bought by the company) evidences status, officers, registered office, share capital, members and the last annual return. Proposed slot `sg_business_profile`, used by many lines below. Its authenticity check (ACRA's own verification of a profile) is **[verify]**.
3. **RORC and nominee registers changed in 2025.** From 16 Jun 2025, new companies file registrable-controller and nominee information at incorporation; the private-register update window is now 7 calendar days and central filing 2 business days [SG-S2]. ACRA's central registers are not public, so these are tier 5.
4. **Engine gaps (not built; proposals only).** (a) BizFile API (paid) for officers, members and annual-return dates. (b) IRAS GST-registered business search for SG-3.07. (c) PDPC's published DPO list, if importable, for SG-3.01. (d) A `web.policy.complaint_route_pdpc` fact (only ICO and NDPC exist).

---

## 3. Item map

### 3.1 Layer 1 — Corporate foundation

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| SG-1.01 | Company registered with ACRA and its UEN live (not deregistered or struck off) | 1 | S2 | ALL | 1 | Facts `registry.sg.acra.identified`, `registry.sg.acra.uen`, `registry.sg.acra.status`, `registry.sg.acra.uen_issued_on`, `registry.sg.acra.issuing_agency`; slot `sg_business_profile` when the monthly copy misses | [SG-S1] |
| SG-1.02 | Entity type is a local private company limited by shares | 1 | S2 | ALL | 1 | Fact `registry.sg.acra.entity_type`; name check `registry.sg.acra.registered_name` (Pte. Ltd.) | [SG-S1] |
| SG-1.03 | Constitution adopted and lodged with ACRA | 1 | S2 | ALL | 4 | Slot `sg_constitution`. **[verify]** lodgement rule and section (Companies Act s 19, s 35 ff.): ACRA pages on the constitution not opened | [SG-S10] |
| SG-1.04 | Registered office in Singapore; registers such as the RORC are kept there | 1 | S2 | ALL | 1 / 4 | Fact `registry.sg.acra.registered_postcode` (present); slot `sg_business_profile`. [verify] the statutory section (s 142) and opening-hours rule: not read | [SG-S2], [SG-S10] |
| SG-1.05 | At least one director ordinarily resident in Singapore | 1 | S2 | ALL | 5 / 4 | Attestation `sg_resident_director`; slot `sg_business_profile` lists directors. The engine keeps no people. [verify] statutory section (s 145) | [SG-S3] |
| SG-1.06 | Company secretary appointed within 6 months of incorporation, and the post not left vacant for more than 6 months; the secretary is a natural person and not the sole director | 1 | S2 | ALL | 5 / 4 | Attestation `sg_secretary`; slot `sg_business_profile`. [verify] whether the secretary must be resident in Singapore (s 171): ACRA page read did not say | [SG-S3] |
| SG-1.07 | Auditor appointed within 3 months of incorporation, unless the company is exempt from audit | 1 | S2 | ALL (not audit-exempt) | 5 / 4 | Attestation `sg_auditor`; slot `sg_business_profile` (electronic register of auditors) | [SG-S3], [SG-S5] |
| SG-1.08 | ACRA's electronic registers of members, directors, secretaries, CEO (if appointed) and auditors (if appointed) kept up to date through BizFile; changes filed within 14 days | 1 | S2 / event-driven | ALL | 4 | Slot `sg_business_profile` | [SG-S2] |
| SG-1.09 | Private Register of Registrable Controllers set up on the day of registration, kept at the registered office or the corporate service provider's office, updated within 7 days of a controller confirming a change; notices sent to every controller at least once a year | 1 | S2 | ALL (unless exempt) | 5 | Attestation `sg_rorc` (register not public) | [SG-S2] |
| SG-1.10 | RORC information filed with ACRA's central register within 2 business days of updating the private register; companies registered from 16 Jun 2025 file at registration; no extension of time | 1 | S2 / event-driven | ALL (unless exempt) | 5 | Attestation `sg_central_rorc` (central register not public) | [SG-S2] |
| SG-1.11 | Registers of nominee directors and nominee shareholders kept and updated within 7 days; filed with ACRA's central registers within 2 business days | 1 | S2 / event-driven | NOMINEES | 5 | Attestation `sg_nominee_registers` | [SG-S2] |
| SG-1.12 | Annual general meeting within 6 months after the financial year end (non-listed); 60-day extension can be applied for | 1 | S3 (annual) | ALL | 5 / 4 | Attestation `sg_agm`; slot `sg_business_profile` (AGM date). **[verify]** when a private company may dispense with the AGM (not covered by the pages read) | [SG-S4] |
| SG-1.13 | Annual return filed within 7 months after the financial year end (non-listed). Late filing penalty S$300 within 3 months of the due date, S$600 after | 1 | S3 (annual) | ALL | 4 | Slot `sg_business_profile` (last annual return date). No fact: the open dataset holds no filings (engine gap 4a). **[verify]** the 8-month case: ACRA's text, as read, gives 8 months for non-listed companies "with a share capital or an overseas branch register"; whether that means *and* (branch register outside Singapore) must be confirmed, because most companies have share capital | [SG-S4] |
| SG-1.14 | Financial statements prepared and filed with the annual return (XBRL unless exempt) | 1 | S3 (annual) | ALL | 4 | Slot `sg_financial_statements`. **[verify]** XBRL exemptions and the exempt-private-company relief: ACRA pages found, not read | [SG-S5] |
| SG-1.15 | Audit exemption as a "small company": private company meeting 2 of 3 for each of the two immediately preceding financial years: revenue not above S$10m, total assets not above S$10m, 50 or fewer full-time employees; assessed on a group basis for group members | 1 | S3 (annual) | ALL (claims exemption) | 5 | Attestation `sg_small_company`. **[verify]** whether ACRA's announced review has raised the revenue and asset thresholds; members holding 5% or more may still require an audit | [SG-S5] |
| SG-1.16 | Board and members' resolutions and minutes kept | 1 | S2 | ALL | 5 | Vault slot `sg_resolutions`. [verify] statutory basis: not read | [SG-S10] |

### 3.2 Layer 2 — IP and technology

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| SG-2.01 | Employer is the default owner of copyright in works an employee creates in the course of employment (Copyright Act 2021, from 21 Nov 2021) | 2 | S2 | EMPLOYEES | 5 | Vault slot `sg_employment_contracts` (IP clause) | [SG-S6] |
| SG-2.02 | Contractors: a non-employee author owns the work unless the contract assigns it; for commissioned photographs, portraits, engravings, sound recordings and films the creator is now the default owner; written assignment needed | 2 | S2 | CONTRACTORS | 5 | Vault slot `sg_contractor_ip`; supporting facts `github.contributor_count`, `github.contributor_logins`, `docusign.envelopes_completed`. [verify] the default for commissioned software, which the IPOS factsheet does not name | [SG-S6] |
| SG-2.03 | Employee inventions: employer entitlement where made in the course of normal duties | 2 | S3 | EMPLOYEES | 5 | Same slot as SG-2.01. **[verify]** Patents Act 1994 s 49: not read | [SG-S11] |
| SG-2.04 | Founders' pre-incorporation IP assigned to the company | 2 | S1 | ALL | 5 | Vault slot `sg_founder_ip_assignment` | [SG-S6] |
| SG-2.05 | Trademark filed with IPOS | 2 | S2 / S3 | ALL | 4 | Slot `sg_trademark_certificate`. **[verify]** IPOS search access: not opened | [SG-S11] |

### 3.3 Layer 3 — Compliance and regulatory

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| SG-3.01 | At least one Data Protection Officer designated, with contact details available to the public; DPO registered with the PDPC (ACRA-registered entities through the PDPC online form or BizFile) and kept active at all times | 3 | S2 | PERSONAL_DATA | 5 + 1 | Attestation `sg_dpo`; fact `web.policy.dpo_contact` (public contact) | [SG-S7] |
| SG-3.02 | Data protection policies and a notice of purposes; people can ask for access and correction | 3 | S2 | WEBSITE / APP | 1 | Facts `web.policy.privacy_notice_found`, `web.policy.names_company`, `web.policy.rights_section`, `web.policy.retention_statement`, `web.policy.last_updated`. **[verify]** the PDPA sections (ss 12, 20, 21, 22, 25): PDPC obligations page found, not read | [SG-S7], [SG-S12] |
| SG-3.03 | Data breach: assess; notify the PDPC within 3 calendar days of determining a breach is notifiable (likely significant harm, or 500 or more individuals); notify affected people where required | 3 | S2 / event-driven | PERSONAL_DATA | 5 | Vault slot `sg_breach_plan`. [verify] how the 3 days are counted: PDPC's 2021 guide starts the day after determination; the current portal text says "from the time" of determination | [SG-S8] |
| SG-3.04 | Overseas transfers of personal data protected to a comparable standard | 3 | S2 | PERSONAL_DATA (data leaves Singapore) | 1 / 5 | Fact `web.policy.transfers_section`; vault slot `sg_transfers`. **[verify]** PDPA s 26 and the Regulations: not read | [SG-S12] |
| SG-3.05 | Contracts with data intermediaries (processors) cover data protection | 3 | S2 | PERSONAL_DATA (uses processors) | 5 | Vault slot `sg_dpa` (PDPC's guide on data protection clauses found, not read) | [SG-S7] |
| SG-3.06 | Do Not Call: before sending a marketing message or call to a Singapore number, check the DNC Register (unless clear and unambiguous consent in evidential form); results valid 21 days under the 2021 guidelines; opt-outs honoured | 3 | S3 | MARKETING | 5 | Attestation `sg_dnc_checks`. [verify] the validity period (older PDPC material says 30 days) and the opt-out period | [SG-S9] |
| SG-3.07 | GST registration with IRAS when taxable turnover exceeds S$1m (calendar-year retrospective test, or 12-month prospective test with 30 days to apply); voluntary registration possible | 3 | S3 | ALL | 4 | Slot `sg_gst_registration`. Engine gap 4b | [SG-S13] |
| SG-3.08 | CPF: CPF Submission Number obtained before paying contributions; contributions for Singapore Citizen and PR employees earning more than S$50 a month, due by the last day of the month | 3 | S2 (first employee) | CPF_EMPLOYEES | 4 | Slot `sg_cpf_csn` (CPF welcome letter with CSN) | [SG-S14] |
| SG-3.09 | Work passes held for foreign employees | 3 | S3 | FOREIGN_WORKERS | 5 | Attestation `sg_work_passes`. **[verify]** MOM rules: not opened | [SG-S15] |
| SG-3.10 | MAS licence for payment services or digital token services | 3 | S2 | SECTOR.PAYMENTS, .CRYPTO | 3 | MAS Financial Institutions Directory. **[verify]** importability and the Payment Services Act 2019 scope: not opened. Trigger only | [SG-S16] |

### 3.4 Layer 4 — Commercial

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| SG-4.01 | Unsolicited commercial emails and SMS sent in bulk: labelled, with sender details and a working unsubscribe facility | 4 | S3 | MARKETING | 5 | Attestation `sg_spam_control`. **[verify]** Spam Control Act 2007 requirements (the "<ADV>" label and unsubscribe timing): not read | [SG-S17] |
| SG-4.02 | No unfair practices towards consumers; consumer remedies for defective goods | 4 | S3 | CONSUMER | 5 | Attestation `sg_cpfta`; vault slot `sg_terms_review`. **[verify]** Consumer Protection (Fair Trading) Act 2003 and CCCS guidance: not opened | [SG-S18] |
| SG-4.03 | Website terms, refund and complaints information published (good practice; statutory only where a consumer rule requires it) | 4 | S3 | WEBSITE, CONSUMER | 1 | Facts `web.policy.terms_found`, `web.policy.refund_policy_found`, `web.policy.complaints_policy_found`. **[verify]** whether any statute requires these online: none confirmed | [SG-S18] |

### 3.5 Layer 5 — Fundraising

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| SG-5.01 | New share issue recorded with ACRA (return of allotment). For a private company, the allotment takes effect only when ACRA updates the electronic register of members, and the allotment date cannot be backdated; ACRA's general guidance says to file new share issues within 14 days | 5 | event-driven | INVESTED | 4 | Slot `sg_business_profile` (members and share capital after the round). **[verify]** whether the 14-day period binds private companies: ACRA's allotment page states 14 days only for public companies | [SG-S19] |
| SG-5.02 | Offer of shares without a prospectus relies on an exemption (small offers, private placement, offers to institutional or accredited investors) | 5 | S4 | INVESTED | 5 | Attestation `sg_offer_exemption`. **[verify]** all of it: Securities and Futures Act 2001 ss 272A, 272B, 274, 275 and their limits (commonly stated as S$5m in 12 months for small offers and 50 persons in 12 months for private placements) were **not** confirmed from an official source | [SG-S20] |
| SG-5.03 | RORC, nominee registers and electronic register of members updated after the round | 5 | S4 | INVESTED | 5 | Re-uses SG-1.08 to SG-1.11 | [SG-S2] |
| SG-5.04 | Shareholders' agreement and investment documents | 5 | S4 | INVESTED | 5 | Vault (International pack slots) | — (contractual) |

### 3.6 Layer 6 — AI and data

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| SG-6.01 | **Status, not an obligation.** No AI-specific statute found. The PDPA applies to personal data used to develop and deploy AI | 6 | — | AI | — | Information only | [SG-S21] |
| SG-6.02 | **Guidance.** PDPC Advisory Guidelines on Use of Personal Data in AI Recommendation and Decision Systems (2024): consent and notification when training or deploying AI, data-intermediary role of bespoke developers, best practices | 6 | S3 | AI, PERSONAL_DATA | 5 | Vault slot `sg_ai_governance` (International pack AI rule) | [SG-S21] |
| SG-6.03 | **Guidance.** PDPC Advisory Guidelines on Use of Personal Data in Generative AI | 6 | S3 | AI, PERSONAL_DATA | 5 | Same slot. **[verify]** issue date and status: the PDPC page was found in a search but not read | [SG-S21] |
| SG-6.04 | **Guidance.** Model AI Governance Framework (IMDA and PDPC) | 6 | S3 | AI | 5 | Same slot. **[verify]** current edition: not opened | [SG-S22] |
| SG-6.05 | AI use disclosed to users (follows from the PDPC notification guidance where personal data is used; otherwise good practice) | 6 | S3 | AI | 1 | Fact `web.policy.ai_disclosure_found` | [SG-S21] |

---

## 4. Counts

| | Items |
|---|---|
| Total items (SG-1.01 to SG-6.05) | 43 |
| Carrying **[verify]** | 25 |
| Tier 1 possible (open dataset or URL scan, alone or with another route) | 8 |
| Tier 3 | 1 |
| Tier 4 (alone or with tier 1/5) | 13 |
| Tier 5 only | 21 |
| Information only | 1 |

Tier rows overlap where an item has two routes (for example "5 / 4").

---

## 5. Core set every Singapore private company must show at Stage 2

1. Registered with ACRA, UEN live, local private company (SG-1.01, 1.02; tier 1).
2. Registered office present (SG-1.04; tier 1).
3. Resident director, secretary within 6 months, auditor within 3 months unless exempt (SG-1.05 to 1.07; tier 5 / 4).
4. RORC kept and filed with the central register (SG-1.09, 1.10; tier 5).
5. DPO designated with public contact details (SG-3.01; tier 5 + 1).
6. Privacy notice on the website (SG-3.02; tier 1).
7. Founders' and contractors' IP assigned (SG-2.02, 2.04; tier 5).

---

## 6. To confirm before encoding

- Annual return: the 8-month case (SG-1.13); AGM dispensation for private companies (SG-1.12).
- Small-company audit thresholds after ACRA's review (SG-1.15); XBRL exemptions (SG-1.14).
- 14-day share-change rule for private companies (SG-5.01).
- Securities and Futures Act offer exemptions and limits (SG-5.02): nothing confirmed.
- DNC validity (21 or 30 days) and breach-notification day counting.
- Secretary residency; Companies Act sections cited as [verify].
- Whether a BizFile business profile can be authenticated automatically.

---

## 7. Sources (all checked 16 Nov 2026)

| Key | Source | URL | How read |
|---|---|---|---|
| SG-S1 | ACRA, "Entities Registered with ACRA" on data.gov.sg (as documented for the engine) | https://data.gov.sg/datasets/d_3f960c10fed6145404ca7b821f263b87/view ; `docs/NATIONAL-REGISTERS.md` | Engine documentation, checked against a real reply on 16 Nov 2026 |
| SG-S2 | ACRA, "Company registers: Requirements & deadlines"; "Setting up & maintaining a RORC"; "Filing with the Central RORC" | https://www.acra.gov.sg/how-to-guides/setting-up-a-local-company/maintaining-company-registers ; https://www.acra.gov.sg/manage/companies/legal-requirements-common-offences/maintaining-local-companys-information-registers/rorc/central-rorc/ | R (first), S (others) |
| SG-S3 | ACRA, "Step 4.3: Choosing company directors & other key officers"; "Post-registration guide: Local company" | https://www.acra.gov.sg/register/business/registering-different-business-structures/local-company/appointing-company-directors-other-key-officers/ ; https://www.acra.gov.sg/register/business/after-registering/local-company/ | S |
| SG-S4 | ACRA, "Deadline & requirements for annual returns"; "Due dates & requirements for AGMs"; "Penalties & enforcement action: Late annual return filing" | https://www.acra.gov.sg/manage/companies/legal-requirements-common-offences/filing-annual-returns-companies/deadline-requirements/ ; https://www.acra.gov.sg/manage/companies/legal-requirements-common-offences/holding-annual-general-meetings/due-dates-requirements/ | S |
| SG-S5 | ACRA, "Audit exemptions: Small company concept"; "Reducing Compliance Costs for Small Companies: Review of Audit Exemption Framework"; "Financial statements: Filing requirements & exemptions" | https://www.acra.gov.sg/manage/companies/legal-requirements-common-offences/preparing-financial-statements/audit-exemptions/ | S |
| SG-S6 | IPOS, "Ownership and Commercialisation"; Copyright Act 2021 factsheets | https://www.ipos.gov.sg/about-ip/copyright/ownership-and-commercialisation/ | S |
| SG-S7 | PDPC, "Data Protection Officer"; "A Step-by-Step Guide on Managing DPO Information" (28 Feb 2025) | https://www.pdpc.gov.sg/dpo | S |
| SG-S8 | PDPC, "Report your organisation's data breach"; Guide on Managing and Notifying Data Breaches (15 Mar 2021) | https://www.pdpc.gov.sg/organisations/e-services/report-your-organisations-data-breach | S |
| SG-S9 | PDPC, Advisory Guidelines on the Do Not Call Provisions (revised 1 Feb 2021); DNC Registry for organisations | https://www.dnc.gov.sg/org_more.html | S |
| SG-S10 | Companies Act 1967 | https://sso.agc.gov.sg/Act/CoA1967 | N |
| SG-S11 | Patents Act 1994; Trade Marks Act 1998; IPOS | https://sso.agc.gov.sg/Act/PA1994 ; https://www.ipos.gov.sg | N |
| SG-S12 | Personal Data Protection Act 2012; PDPC "Data protection obligations" | https://sso.agc.gov.sg/Act/PDPA2012 ; https://www.pdpc.gov.sg/overview-of-pdpa/the-legislation/personal-data-protection-act/data-protection-obligations | N (Act); S (PDPC page found, content not read) |
| SG-S13 | IRAS, "Do I need to register for GST"; "GST and digital economy: overseas businesses" | https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/gst-registration-deregistration/do-i-need-to-register-for-gst | S |
| SG-S14 | CPF Board, "Employer obligations"; "When and how do I obtain my CSN as a new employer" | https://www.cpf.gov.sg/employer/employer-obligations | S |
| SG-S15 | Ministry of Manpower, work passes | https://www.mom.gov.sg | N |
| SG-S16 | Monetary Authority of Singapore, Financial Institutions Directory; Payment Services Act 2019 | https://www.mas.gov.sg | N |
| SG-S17 | Spam Control Act 2007 | https://sso.agc.gov.sg/Act/SCA2007 | N |
| SG-S18 | Consumer Protection (Fair Trading) Act 2003; CCCS | https://sso.agc.gov.sg/Act/CPFTA2003 ; https://www.cccs.gov.sg | N |
| SG-S19 | ACRA, "Filing a return of allotment of shares"; "Updating company information, officers & shareholders" | https://www.acra.gov.sg/manage/companies/shares/allotment-of-shares/ | S |
| SG-S20 | Securities and Futures Act 2001 | https://sso.agc.gov.sg/Act/SFA2001 | N |
| SG-S21 | PDPC, Advisory Guidelines on Use of Personal Data in AI Recommendation and Decision Systems; Advisory Guidelines on Use of Personal Data in Generative AI | https://www.pdpc.gov.sg/guidelines-and-consultation/2024/02/advisory-guidelines-on-use-of-personal-data-in-ai-recommendation-and-decision-systems | S |
| SG-S22 | IMDA / PDPC, Model AI Governance Framework | https://www.pdpc.gov.sg/help-and-resources/2020/01/model-ai-governance-framework | N |

The sso.agc.gov.sg short links (`/Act/CoA1967`, `/Act/PDPA2012` and so on) and the IMDA framework link were written from the Acts' citations and were not opened: **[verify]** each resolves before a rule cites it.

---

## 8. Not encoded (draft pack `packages/rules/src/packs/sg.ts`, 16 Nov 2026)

The draft pack `SG` 0.1.0 holds 20 rules from 20 items. Rules that cite a **[verify]** line are `needs_review`: they can only say "a person needs to check this" until a lawyer clears the line. These 23 items were left out:

| Item | Why it is not a rule yet |
|---|---|
| SG-1.03 | [verify] lodgement rule; the International pack already asks for the constitution (`INTL.CORP.CONSTITUTION`) |
| SG-1.15 | [verify] thresholds. `SG.CORP.AUDITOR` accepts "we are exempt" as a statement and enforces no threshold |
| SG-1.16 | [verify]; covered by `INTL.CORP.RESOLUTIONS` |
| SG-2.01 | A default ownership rule, no added duty; covered by `INTL.IP.STAFF_ASSIGNMENT` |
| SG-2.02 | [verify]; covered by `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| SG-2.03 | [verify]; covered by `INTL.IP.STAFF_ASSIGNMENT` |
| SG-2.04 | Same as `INTL.IP.OWNER_ASSIGNMENT` |
| SG-2.05 | [verify], source not opened; not a legal duty |
| SG-3.02 | [verify] PDPA sections; `INTL.DP.PRIVACY_NOTICE` checks the website |
| SG-3.03 | [verify] how the 3 days are counted; `INTL.SEC.INCIDENT_RESPONSE` asks for the same plan. Encode once the counting is confirmed |
| SG-3.04 | [verify], the Act was not read |
| SG-3.09 | [verify], MOM not opened |
| SG-3.10 | [verify], MAS not opened |
| SG-4.01, SG-4.02 | [verify], the Acts were not read |
| SG-4.03 | [verify] no statute confirmed; `INTL.COM.TERMS` checks published terms |
| SG-5.02 | [verify] all of it, including the offer limits |
| SG-5.04 | Covered by the International pack's fundraising slots |
| SG-6.01 | Information only |
| SG-6.02 | Covered by the International pack's AI rules |
| SG-6.03, SG-6.04 | [verify]; covered by the International pack's AI rules |
| SG-6.05 | `INTL.AI.TRANSPARENCY` checks the same website disclosure |

Encoded with care: `SG.CORP.STATUS` passes on "registered" (read in a real reply) or a business profile, is a defect only for the dataset's words for a deregistered or struck-off UEN, and is "verify" for any other word or a miss in the monthly copy. `SG.CORP.ANNUAL_RETURN` enforces no deadline (the 7- or 8-month question). `SG.DP.PROCESSING_AGREEMENTS` stands in for `INTL.DP.PROCESSING_AGREEMENTS`. New questions: `sg_nominees` and `sg_cpf_employees`.

### Website rules not encoded (17 Nov 2026): regulator named in the notice, and legal notice

The website scan can now read `web.policy.dpa_named`, `web.policy.dpa_countries`, `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, and the EU packs use them. SG: SG-3.02 is [verify] on the PDPA sections and lists no duty to name the PDPC in the notice, so none was added. The map lists no duty to show company particulars on a website.
