# Vero Scan — Canada (Federal, CBCA) Rule-Pack Map

**Status: Draft from official sources, for lawyer review. Not legal advice.**

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company type:** Business corporation incorporated under the Canada Business Corporations Act (CBCA), non-distributing (not a reporting issuer). Provincial corporations are out of scope: they are not in Corporations Canada's register.
**Source:** No lawyer-supplied source document exists for Canada. Every line below cites an official source (laws-lois.justice.gc.ca, ised-isde.canada.ca, canada.ca, priv.gc.ca, crtc.gc.ca, osc.ca) listed in section 7, with the date it was checked.
**Stage and trigger assignments are proposals.** A lawyer approves, edits or strikes each line before it is encoded or affects a score.

> Technical mapping, not legal advice. Nothing here has been reviewed by a Canadian lawyer.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every CBCA corporation at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Collects, uses or discloses personal information in commercial activity |
| PROVINCE.QC, .BC, .AB, .ON, … | Operates in, has customers in, or employs people in that province (new triggers) |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Supplies consumers |
| MARKETING | Sends commercial electronic messages (new trigger) |
| AI | Uses or builds AI in the product |
| SECTOR.PAYMENTS, .CRYPTO | Money services or payment service provider activity; only as triggers here |
| PRESCRIBED_SECTOR | In a sector with Canadian ownership or control requirements (new trigger) |
| INVESTED | Has raised or is raising equity |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault). Routes refer to the *Verification Solutions Matrix*, section 5.

**Verification route.** Each item names one of: an engine **fact** (exact key from `packages/connectors/src/fact-keys.ts`), a **slot** (document upload, tier 4) or an **attestation** (tier 5). Slot and attestation ids (`ca_…`) are proposals; they do not exist in code yet.

**Item ids.** `CA-<layer>.<nn>`. A rule cites the map and the id, for example "Canada map §3, CA-1.09".

**Sources and "checked".** Each line cites a key (`[CA-S3]`) from section 7, which gives the URL, the date (16 Nov 2026 for all) and how the page was read:
- **R**: opened and read.
- **S**: the official page was read through its indexed text, in a search limited to that official domain.
- **N**: named but not opened. Every line resting on an N source carries **[verify]**.

**[verify]** means the line could not be fully confirmed from an official source on 16 Nov 2026, or a figure, section number or date needs a lawyer's check. The text says what is uncertain.

**What the engine can see in Canada.** Corporations Canada's Federal Corporation API (`ca.corporations`, needs `CA_CORPORATIONS_API_KEY`, not yet tried against a real reply). By corporation number only (no name search): status, the Act, incorporation date, **the latest annual return year**, the **minimum and maximum number of directors in the articles**, and the number of directors (never names). ISC filings are not public and are not in the API.

---

## 2. Notes for the owner and the reviewing lawyer

1. **Two strong automatic checks.** (a) Annual return: `last_annual_return_year` against the anniversary month and the 60-day window (CA-1.10). (b) Board size: `directors_count` against `directors_minimum` and `directors_maximum` from the articles (CA-1.03). Both need the first real reply to confirm the field values.
2. **Resident Canadian directors still apply.** CBCA s 105(3) was read on Justice Canada's site (current to 19 Oct 2026, last amended 26 Mar 2026): at least 25% of directors must be resident Canadians, or at least one if there are fewer than four. Proposals to remove it were found, but it is in force (CA-1.04).
3. **Provinces are triggers, not packs.** Privacy (Quebec, Alberta, British Columbia), consumer protection, employment standards, workers' compensation and extra-provincial registration all vary by province. This map names them only as triggers. A province pack is future work.
4. **No federal director ID** was found for CBCA directors. **[verify]** before telling users there is none.
5. **Engine gaps (not built; proposals only).** (a) The CRA's public GST/HST registry check for CA-3.05. (b) FINTRAC's MSB registry list for CA-3.08. (c) A `web.policy.complaint_route_opc` fact. (d) CIPO trademark search for CA-2.05.

---

## 3. Item map

### 3.1 Layer 1 — Corporate foundation

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CA-1.01 | Federal corporation exists and is active (not dissolved) | 1 | S2 | ALL | 1 | Facts `registry.ca.corporations.identified`, `registry.ca.corporations.corporation_number`, `registry.ca.corporations.status`, `registry.ca.corporations.incorporated_on`, `registry.ca.corporations.registered_name` | [CA-S1] |
| CA-1.02 | Incorporated under the CBCA (not another federal Act) | 1 | S2 | ALL | 1 | Fact `registry.ca.corporations.act` | [CA-S1] |
| CA-1.03 | Number of directors within the minimum and maximum set in the articles | 1 | S2 | ALL | 1 | Facts `registry.ca.corporations.directors_count`, `registry.ca.corporations.directors_minimum`, `registry.ca.corporations.directors_maximum`. **[verify]** CBCA s 102 / s 6 wording: not read | [CA-S1], [CA-S2] |
| CA-1.04 | Resident Canadian directors: at least 25% of directors, or at least one if fewer than four (s 105(3)); a majority in prescribed sectors with Canadian ownership or control rules (s 105(3.1)) | 1 | S2 | ALL; PRESCRIBED_SECTOR for the majority rule | 5 | Attestation `ca_resident_directors` (the engine keeps no people) | [CA-S2] |
| CA-1.05 | Articles of incorporation and by-laws | 1 | S2 | ALL | 4 | Slot `ca_articles_bylaws` (certificate and articles). [verify] CBCA ss 6, 103: not read | [CA-S2] |
| CA-1.06 | Registered office in the province named in the articles; change of address notified to Corporations Canada | 1 | S2 | ALL | 5 | Attestation `ca_registered_office` (the engine does not keep addresses). **[verify]** CBCA s 19 and the 15-day notice period: not read | [CA-S2] |
| CA-1.07 | Corporate records kept: articles, by-laws, minutes, resolutions, directors register, securities register | 1 | S2 | ALL | 5 | Vault slot `ca_minute_book`. **[verify]** CBCA ss 20, 50: not read | [CA-S2] |
| CA-1.08 | Register of individuals with significant control (ISC) kept; updated at least once a year and within 15 days of becoming aware of a change | 1 | S2 | ALL | 5 | Attestation `ca_isc_register` (not public) | [CA-S3] |
| CA-1.09 | ISC information filed with Corporations Canada (since 22 Jan 2024): at incorporation (or within 30 days after an amalgamation or continuance certificate), with every annual return, and within 15 days of recording a change in the ISC register. Not filing can mean a refused Certificate of Compliance or administrative dissolution | 1 | S2 | ALL | 4 / 5 | Slot `ca_isc_filing_confirmation`; attestation fallback (filings are not public). [verify] which event starts the 15 days: Corporations Canada's pages say "recording" in one place and "becoming informed" in another | [CA-S3] |
| CA-1.10 | Annual return filed within 60 days after the anniversary date (of incorporation, amalgamation or continuance); not accepted before the anniversary; C$12 online; filed together with ISC information. Corporations Canada's policy is to dissolve after two years of non-filing, after a final notice giving 120 days | 1 | S3 (annual) | ALL | 1 | Fact `registry.ca.corporations.last_annual_return_year` against `registry.ca.corporations.incorporated_on` (anniversary) | [CA-S4] |
| CA-1.11 | Changes of directors notified to Corporations Canada | 1 | event-driven | ALL | 1 / 5 | Fact `registry.ca.corporations.directors_count` (change between scans, signal only); attestation `ca_director_changes`. **[verify]** CBCA s 113 and the 15-day period: not read | [CA-S2] |
| CA-1.12 | Annual meeting of shareholders and financial statements placed before it | 1 | S3 (annual) | ALL | 5 | Attestation `ca_annual_meeting`. **[verify]** CBCA ss 133, 155 (timing: within 15 months of the last meeting and 6 months of year end): not read | [CA-S2] |
| CA-1.13 | Auditor: shareholders of a non-distributing corporation may resolve not to appoint one; all shareholders must consent, including those not otherwise entitled to vote; the resolution lasts only until the next annual meeting (s 163) | 1 | S3 (annual) | ALL | 5 / 4 | Attestation `ca_audit_exemption`; slot `ca_audit_exemption_resolution` | [CA-S5] |
| CA-1.14 | Extra-provincial registration in each province where the corporation carries on business | 1 | S2 | PROVINCE.* | 4 | Slot `ca_extraprovincial_registration`. **[verify]** each province's rule: not opened | [CA-S6] |

### 3.2 Layer 2 — IP and technology

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CA-2.01 | Employer is the first owner of copyright in a work an employee makes in the course of employment under a contract of service, absent agreement to the contrary (Copyright Act s 13(3)) | 2 | S2 | EMPLOYEES | 5 | Vault slot `ca_employment_contracts` (IP clause) | [CA-S7] |
| CA-2.02 | Contractors are the first owners of what they write: a signed written assignment is needed; moral rights can be waived but not assigned | 2 | S2 | CONTRACTORS | 5 | Vault slot `ca_contractor_ip`; supporting facts `github.contributor_count`, `github.contributor_logins`, `docusign.envelopes_completed`. **[verify]** Copyright Act ss 13(4), 14.1: not read | [CA-S7] |
| CA-2.03 | Employee inventions: no statutory employer-ownership rule found; written invention assignment advised | 2 | S3 | EMPLOYEES | 5 | Same slot as CA-2.01. **[verify]** that the Patent Act has no default rule: not read | [CA-S8] |
| CA-2.04 | Founders' pre-incorporation IP assigned to the corporation | 2 | S1 | ALL | 5 | Vault slot `ca_founder_ip_assignment` | [CA-S7] |
| CA-2.05 | Trademark filed with CIPO | 2 | S2 / S3 | ALL | 4 | Slot `ca_trademark`. **[verify]** CIPO search access: not opened | [CA-S8] |

### 3.3 Layer 3 — Compliance and regulatory

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CA-3.01 | PIPEDA applies to personal information in commercial activity. In Alberta, British Columbia and Quebec a substantially similar provincial law applies instead within the province; PIPEDA still applies to interprovincial and international transactions | 3 | S2 | PERSONAL_DATA; PROVINCE.QC, .BC, .AB | 5 | Attestation `ca_privacy_laws` (which laws apply) | [CA-S9] |
| CA-3.02 | Privacy policy available (openness); an individual accountable for compliance designated | 3 | S2 | WEBSITE / APP | 1 + 5 | Facts `web.policy.privacy_notice_found`, `web.policy.names_company`, `web.policy.rights_section`, `web.policy.dpo_contact`; attestation `ca_privacy_officer`. **[verify]** PIPEDA Sch 1 principles 4.1 and 4.8: not read | [CA-S10] |
| CA-3.03 | Breach of security safeguards: report to the OPC if it creates a real risk of significant harm, notify affected individuals and relevant third parties, and keep a record of every breach (24 months) | 3 | S2 / event-driven | PERSONAL_DATA | 5 | Vault slot `ca_breach_records`. [verify] the 24-month retention, which comes from an older OPC guide | [CA-S9] |
| CA-3.04 | Quebec Law 25 duties (person in charge of personal information, privacy impact assessments, confidentiality incident register, privacy by default) | 3 | S2 | PROVINCE.QC | 5 | Attestation `ca_qc_law25`. **[verify]** all of it: Quebec sources not opened | [CA-S11] |
| CA-3.05 | GST/HST registration within 29 days once taxable supplies exceed C$30,000 in a single calendar quarter or over the last four consecutive quarters (small supplier test, associates included); tax is collected from the supply that crosses the threshold | 3 | S3 | ALL | 4 | Slot `ca_gst_hst_registration` (engine gap 5a) | [CA-S12] |
| CA-3.06 | Payroll program account with the CRA before the first remittance; source deductions | 3 | S2 (first employee) | EMPLOYEES | 4 | Slot `ca_payroll_account`. **[verify]** CRA payroll pages not opened | [CA-S12] |
| CA-3.07 | Provincial employment standards and workers' compensation registration | 3 | S2 | EMPLOYEES, PROVINCE.* | 4 / 5 | Slot `ca_workers_comp`. **[verify]** each province: not opened | [CA-S6] |
| CA-3.08 | Money services business registration with FINTRAC; payment service provider registration under the Retail Payment Activities Act | 3 | S2 | SECTOR.PAYMENTS, .CRYPTO | 3 | FINTRAC MSB registry; Bank of Canada PSP registry. **[verify]** both: not opened. Trigger only | [CA-S13] |

### 3.4 Layer 4 — Commercial

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CA-4.01 | CASL: consent (express or implied) for commercial electronic messages; sender identified; unsubscribe mechanism at no cost, readily performed, valid for at least 60 days after sending, and honoured without delay and within 10 business days | 4 | S3 | MARKETING | 5 | Attestation `ca_casl` | [CA-S14] |
| CA-4.02 | Competition Act: no false or misleading representations, including drip pricing | 4 | S3 | CONSUMER | 5 | Attestation `ca_competition_act`. **[verify]** the drip-pricing provisions and dates: not opened | [CA-S15] |
| CA-4.03 | Provincial consumer protection (internet agreements, cancellation and refund rules) | 4 | S3 | CONSUMER, PROVINCE.* | 5 + 1 | Vault slot `ca_terms_review`; facts `web.policy.terms_found`, `web.policy.refund_policy_found`. **[verify]** each province: not opened | [CA-S6] |
| CA-4.04 | Quebec French-language requirements for contracts of adhesion, websites and product information | 4 | S3 | PROVINCE.QC | 5 | Attestation `ca_qc_french`. **[verify]** not opened | [CA-S11] |

### 3.5 Layer 5 — Fundraising

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CA-5.01 | Share issue: directors' resolution and securities register updated; no Corporations Canada filing for the issue itself; ISC register updated and filed within 15 days if control changes (CA-1.08, 1.09) | 5 | event-driven | INVESTED | 5 | Vault slot `ca_share_issue_resolution`. **[verify]** CBCA s 25 and that no federal filing is required: not read | [CA-S2], [CA-S3] |
| CA-5.02 | Prospectus exemption relied on. Private issuer exemption (NI 45-106 s 2.4): generally no report of exempt distribution if its conditions are met. Other exemptions (for example accredited investor, s 2.3): Form 45-106F1 filed within 10 days after the distribution, in each jurisdiction where purchasers are; NI 45-110 crowdfunding: 30 days | 5 | S4 | INVESTED | 4 / 5 | Slot `ca_45106f1` (filed report); attestation `ca_prospectus_exemption`. [verify] the private issuer conditions and provincial differences (for example BC Form 45-106F6) | [CA-S16] |
| CA-5.03 | Shareholders' agreement (or unanimous shareholder agreement) and investment documents | 5 | S4 | INVESTED | 5 | Vault (International pack slots) | — (contractual) |

### 3.6 Layer 6 — AI and data

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CA-6.01 | **Status, not an obligation.** No federal AI statute is in force: the Artificial Intelligence and Data Act (in Bill C-27) is archived, and ISED states there is no AI-specific regulatory framework | 6 | — | AI | — | Information only | [CA-S17] |
| CA-6.02 | **Guidance.** Voluntary Code of Conduct on the Responsible Development and Management of Advanced Generative AI Systems (Sept 2023; implementation guide March 2025). Voluntary and not enforceable | 6 | S3 | AI | 5 | Vault slot `ca_ai_governance` (International pack AI rule) | [CA-S17] |
| CA-6.03 | **Binding law applied to AI.** PIPEDA applies to personal information used to build or run AI (see the OPC's 2026 joint investigation findings on OpenAI) | 6 | S3 | AI, PERSONAL_DATA | 1 / 5 | Fact `web.policy.ai_disclosure_found`; same vault slot. [verify] what the OPC findings require of other businesses | [CA-S9] |
| CA-6.04 | **Binding provincial law.** Quebec: inform people of decisions based exclusively on automated processing | 6 | S3 | AI, PROVINCE.QC | 5 | Attestation `ca_qc_automated_decisions`. **[verify]** not opened | [CA-S11] |

---

## 4. Counts

| | Items |
|---|---|
| Total items (CA-1.01 to CA-6.04) | 38 |
| Carrying **[verify]** | 24 |
| Tier 1 possible (register or URL scan) | 8 |
| Tier 3 | 1 |
| Tier 4 (alone or with another route) | 9 |
| Tier 5 only | 19 |
| Information only | 1 |

Tier rows overlap where an item has two routes (for example "4 / 5").

---

## 5. Core set every CBCA corporation must show at Stage 2

1. Active CBCA corporation (CA-1.01, 1.02; tier 1).
2. Board size within the articles (CA-1.03; tier 1) and resident Canadian directors (CA-1.04; tier 5).
3. Annual return filed within 60 days of the anniversary (CA-1.10; tier 1).
4. ISC register kept and ISC information filed (CA-1.08, 1.09; tier 5 / 4).
5. Minute book and securities register (CA-1.07; tier 5).
6. Privacy policy and accountable individual (CA-3.02; tier 1 + 5).
7. Founders' and contractors' IP assigned (CA-2.02, 2.04; tier 5).

---

## 6. To confirm before encoding

- CBCA sections cited as [verify] (6, 19, 20, 25, 50, 102, 103, 113, 133, 155).
- ISC 15-day trigger ("recording" or "becoming informed").
- PIPEDA principles 4.1 and 4.8; breach-record retention.
- Each provincial trigger: privacy (QC, BC, AB), consumer protection, employment, workers' compensation, extra-provincial registration, Quebec French language.
- NI 45-106 private issuer conditions; provincial report forms.
- Absence of a federal director ID.
- Corporations Canada API: first real reply (status words, annual return year).

---

## 7. Sources (all checked 16 Nov 2026)

| Key | Source | URL | How read |
|---|---|---|---|
| CA-S1 | Corporations Canada, Federal Corporation API (as documented for the engine) | https://ised-isde.canada.ca/site/corporations-canada/en ; `docs/NATIONAL-REGISTERS.md` | Engine documentation (official OpenAPI checked 16 Nov 2026; no real reply) |
| CA-S2 | Canada Business Corporations Act, R.S.C. 1985, c. C-44 (s 105 read; current to 19 Oct 2026, last amended 26 Mar 2026) | https://laws-lois.justice.gc.ca/eng/acts/C-44/section-105.html ; https://laws-lois.justice.gc.ca/eng/acts/c-44/fulltext.html | R (s 105); N (other sections) |
| CA-S3 | Corporations Canada, "Individuals with significant control"; "File your information"; "New filing requirement in effect" | https://ised-isde.canada.ca/site/corporations-canada/en/individuals-significant-control | S |
| CA-S4 | Corporations Canada, "Annual return" (business corporations) | https://ised-isde.canada.ca/site/corporations-canada/en/annual-return-business-corporations | S |
| CA-S5 | CBCA s 163 (dispensing with auditor) | https://laws-lois.justice.gc.ca/eng/acts/C-44/section-163.html | R |
| CA-S6 | Provincial corporate registries, consumer protection, employment standards and workers' compensation bodies | (one per province; none opened) | N |
| CA-S7 | Copyright Act, R.S.C. 1985, c. C-42, s 13 (current to 19 Oct 2026) | https://laws-lois.justice.gc.ca/eng/acts/C-42/section-13.html | R (s 13(3)); N (ss 13(4), 14.1) |
| CA-S8 | Patent Act; Canadian Intellectual Property Office | https://laws-lois.justice.gc.ca/eng/acts/P-4/ ; https://ised-isde.canada.ca/site/canadian-intellectual-property-office/en | N |
| CA-S9 | OPC, "Provincial laws that may apply instead of PIPEDA"; "What you need to know about mandatory reporting of breaches of security safeguards"; PIPEDA Findings #2026-002 | https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/prov-pipeda/ ; https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/gd_pb_201810/ | S |
| CA-S10 | Personal Information Protection and Electronic Documents Act, S.C. 2000, c. 5 | https://laws-lois.justice.gc.ca/eng/acts/P-8.6/ | N |
| CA-S11 | Commission d'accès à l'information du Québec; Office québécois de la langue française | https://www.cai.gouv.qc.ca ; https://www.oqlf.gouv.qc.ca | N |
| CA-S12 | CRA, "General Information for GST/HST Registrants" (RC4022) | https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4022/general-information-gst-hst-registrants.html | S (payroll: N) |
| CA-S13 | FINTRAC; Bank of Canada, retail payments supervision | https://fintrac-canafe.canada.ca ; https://www.bankofcanada.ca | N |
| CA-S14 | CRTC, "Frequently Asked Questions about Canada's Anti-Spam Legislation"; CASL guidance on implied consent; Compliance and Enforcement Decision CRTC 2019-111 | https://crtc.gc.ca/eng/com500/faq500.htm | S |
| CA-S15 | Competition Bureau; Competition Act, R.S.C. 1985, c. C-34 | https://competition-bureau.canada.ca ; https://laws-lois.justice.gc.ca/eng/acts/C-34/ | N |
| CA-S16 | OSC, "Form 45-106F1 - Report of Exempt Distribution" and its tips sheet; NI 45-106 | https://www.osc.ca/en/industry/companies/reporting-issuer-and-issuer-forms/form-45-106f1-report-exempt-distribution | S |
| CA-S17 | ISED, "Artificial Intelligence and Data Act" (archived); consultation on a code of practice for generative AI; "Enhancing trust in artificial intelligence through increased transparency" | https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act | S |

The Justice Canada paths for the Patent Act (P-4), PIPEDA (P-8.6) and the Competition Act (C-34) were written from their chapter numbers and were not opened: **[verify]** each resolves before a rule cites it.

---

## 8. Not encoded (draft pack `packages/rules/src/packs/ca.ts`, 16 Nov 2026)

The draft pack `CA` 0.1.0 holds 12 rules from 12 items. Rules that cite a **[verify]** line are `needs_review`: they can only say "a person needs to check this" until a lawyer clears the line. These 26 items were left out:

| Item | Why it is not a rule yet |
|---|---|
| CA-1.05 | [verify]; the International pack already asks for the constitution (`INTL.CORP.CONSTITUTION`) |
| CA-1.06 | [verify] s 19 and the notice period |
| CA-1.07 | [verify]; covered by `INTL.CORP.RESOLUTIONS` and `INTL.EQUITY.CAP_TABLE` |
| CA-1.11 | [verify] s 113 and the 15-day period |
| CA-1.12 | [verify] timing |
| CA-1.14 | [verify] each province; provinces are triggers only |
| CA-2.01 | A default ownership rule, no added duty; covered by `INTL.IP.STAFF_ASSIGNMENT` |
| CA-2.02 | [verify]; covered by `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| CA-2.03 | [verify]; covered by `INTL.IP.STAFF_ASSIGNMENT` |
| CA-2.04 | Same as `INTL.IP.OWNER_ASSIGNMENT` |
| CA-2.05 | [verify]; not a legal duty |
| CA-3.02 | [verify] PIPEDA principles; `INTL.DP.PRIVACY_NOTICE` checks the website |
| CA-3.03 | [verify] the 24-month retention; `INTL.SEC.INCIDENT_RESPONSE` asks for the breach plan |
| CA-3.04 | [verify], Quebec sources not opened |
| CA-3.06 to CA-3.08 | [verify], not opened |
| CA-4.02 to CA-4.04 | [verify], not opened |
| CA-5.01 | [verify] s 25 |
| CA-5.03 | Covered by the International pack's fundraising slots |
| CA-6.01 | Information only |
| CA-6.02 | Covered by the International pack's AI rules |
| CA-6.03 | [verify]; covered by the International pack's AI rules |
| CA-6.04 | [verify], not opened |

Encoded with care: `CA.CORP.STATUS` passes on "active", is a defect only when the status word contains "dissolved", and is "verify" for any other word or a miss (a provincial corporation is not in the federal register). `CA.CORP.ANNUAL_RETURN` is worked out by `derived.ca.annual_return_overdue` from the incorporation date and the latest annual return year; either missing makes it "verify". `CA.CORP.BOARD_SIZE` is `needs_review` because of the [verify] on s 102.

### Website rules not encoded (17 Nov 2026): regulator named in the notice, and legal notice

The website scan can now read `web.policy.dpa_named`, `web.policy.dpa_countries`, `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, and the EU packs use them. CA: CA-3.02 is [verify] on PIPEDA Sch 1 principles 4.1 and 4.8 and lists no duty to name the Privacy Commissioner in the policy, so none was added. The map lists no duty to show company particulars on a website.
