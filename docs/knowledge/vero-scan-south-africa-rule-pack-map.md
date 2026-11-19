# Vero Scan — South Africa Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 18 November 2026
**Sources:** Official legislation, government and regulator pages only (justice.gov.za, gov.za, CIPC, Information Regulator, SARS, Department of Employment and Labour, the dtic, National Consumer Commission, FSCA). Each line gives its URL and the date checked. Secondary sources (law-firm notes, vendor blogs) were used only to find the official page and are never cited.
**Company form covered:** private company, "Proprietary Limited" / "(Pty) Ltd", under the Companies Act 71 of 2008.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Lines marked **[verify]** must not be encoded as a pass/fail rule until the uncertainty named on the line is resolved.

**South Africa is not in the EU or the EEA.** EU rules do not apply to a South African company as such. The only EU reference below is the AI Act line in Section 11, which reaches a South African company only when it places AI systems on the EU market.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every South African (Pty) Ltd at that stage |
| WEBSITE / APP | Has a public website or a published app |
| ECOMMERCE | Offers goods or services for sale, hire or exchange by electronic transaction (ECTA Chapter VII) |
| PERSONAL_DATA | Processes personal information |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Sells to consumers (B2C), including small juristic persons below the CPA threshold |
| DIRECT_MARKETING | Markets directly by phone, SMS, email or other electronic means |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| EU_MARKET | Places products or services on the EU market (matters for the EU AI Act only) |
| SECTOR.FINANCIAL_SERVICES, .CRYPTO, .PAYMENTS, .CREDIT | Sector packs (FSCA, SARB, NCR), triggers only |
| INVESTED | Has raised or is raising |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a document slot) · 5 attested (vault). Routes follow the *Verification Solutions Matrix* (`docs/knowledge/vero-scan-verification-solutions.md`).

**[verify]** means: not confirmed from an official source on 18 Nov 2026. The line says exactly what is uncertain. A threshold, deadline or section number marked [verify] is a lead, not a fact.

**Source column.** "checked 18 Nov 2026" appears only where the page was read on that day. A page our tool could not read is marked **[verify]: official page not readable by our tool on 18 Nov 2026**.

**Companies Act text used.** The Department of Justice consolidated copy (generated 29 May 2025), which includes the Companies Amendment Act 16 of 2024 and the Companies Second Amendment Act 17 of 2024. Several provisions of Act 16 of 2024 (for example a new s 33(1)(a) and changes to s 30(4)) were "to be proclaimed" in that copy.

### Engine facts available for South Africa

**No South African register fact exists in the engine today.** There is no `registry.za.*` key: company existence, status, directors, annual-return filing, VAT registration and beneficial ownership cannot be read from an official source by the engine. Every such line below is Tier 4 or Tier 5 until a CIPC connection exists (see note 1 in section 2).

| Fact key(s) | What it can show | What it cannot show |
|---|---|---|
| `registry.global.gleif.*` | The LEI record, if any (most small (Pty) Ltds have none) | Anything about South African law, or CIPC status |
| `registry.sanctions.match`, `possible_match`, `lists_checked` | Company name screened against the stored sanctions lists | That the company is or is not sanctioned (a person must check) |
| `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `retention_statement`, `transfers_section`, `dpo_contact`, `dpa_named`, `children_section` | Privacy notice present and which POPIA s 18 items it shows. `dpa_named` recognises "Information Regulator" and inforegulator.org.za | Legal adequacy under POPIA; whether the Information Officer is registered |
| `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count`, `cookie_policy_found` | Cookie banner and behaviour before consent | Whether South African law requires consent for a given cookie (no cookie-specific rule found) |
| `web.policy.terms_found`, `refund_policy_found`, `complaints_policy_found`, `accessibility_found`, `ai_disclosure_found` | Presence of terms, refund, complaints, accessibility and AI pages | Their content |
| `web.policy.legal_notice_present`, `registration_number_shown` | A supplier-information block and a registration number on the site (ECTA s 43, Companies Act s 32(4)) | Whether the number is correct or matches CIPC |
| `web.policy.language_supported` | The scan can read the site's language (English is read) | Whether a document is in plain language (CPA s 22) |
| `github.*` | Repository licence files and dependency manifests, if GitHub is connected | Who owns the code |

**Not available for South Africa:** `registry.eu.vies_vat.*` (VIES covers EU member states only) and any EU register fact.

---

## 2. Notes for the reviewing lawyer

1. **CIPC API exists, behind sign-in.** The CIPC "APIVerse Hub" developer portal (https://developer.cipc.co.za/, checked 18 Nov 2026) lists an Authorisation API (OAuth 2.0, must be subscribed to first), a Companies API ("read-only" search and retrieval of company data) and a BO API (subscribe link not active). Filing, XBRL, disqualified-directors, streaming, documents and IP APIs are marked "Coming Soon". Subscription is by sign-in at the portal (subscribe link points to apim.cipc.co.za); the page has no sign-up link, no eligibility rule, no price, and its "Terms and Conditions" link is empty. The SLA page says subscribers are those who signed up for an API key and accepted the Terms of Use, promises 99.5% uptime, applies throttling and says some sandbox APIs do not connect to production data; it names no fee and no approval step. Documentation is at guide.cipc.co.za, which our tool could not reach on 18 Nov 2026, so whether it is public without login is **[verify]**. We did not sign up or call any API.
2. **CIPC website search is not for automated use.** The CIPC eServices terms (clause 3(1)(c)) bar using "any technology to search and gain any information from this site" without CIPC's prior written permission; business use of content must be limited to specified clients (clause 4(5)); requests go to CIPC Legal Services (clause 4(6)). The eServices homepage shows a guest "Enterprise Search", and clause 12(1) requires registration as a customer to use CIPC services. The engine must not scrape eServices or BizPortal; the BizPortal terms page was not readable by our tool.
3. **No public list of registered Information Officers found.** The Information Regulator's eServices officers page says registration of the Information Officer "is not optional" and is done on the eServices portal; it mentions no public list or search. The Regulator's legal page lists no such register. A machine-readable list therefore cannot be assumed; that none exists anywhere is **[verify]**.
4. **VAT threshold changed.** SARS says the compulsory threshold rose from R1 million to R2.3 million from 1 April 2026, and the voluntary threshold from R50,000 to R120,000. SARS's Budget 2026 FAQ says the amendments "have not yet been promulgated" but SARS is administering the new figures. The R1 million in our brief is out of date.
5. **Annual return timing confirmed.** Companies Act s 33(1) leaves the period to regulation; CIPC states 30 business days after the anniversary of incorporation, with the beneficial ownership declaration and the AFS or financial accountability supplement. CIPC blocks the annual return if BO filing is not up to date (from 1 July 2024).
6. **Audit or independent review thresholds unread.** s 30(2) and (2A) were read; the public interest score thresholds in the Companies Regulations (regs 26-29) were not, because the gov.za regulations file exceeded our tool's size limit.
7. **ECTA read from the 2002 Gazette text.** The gov.za copy is a scan our tool could not read; we read the same Gazette No. 23708 text hosted on saaa.gov.za. Later amendments to ss 43-46 were not checked.
8. **Cookies:** we found no South African statute or regulator rule specific to cookies. Cookie consent is mapped only as a POPIA consent signal, **[verify]**.
9. **Missing engine facts** that would raise several Tier 4/5 lines to Tier 1: a CIPC company status, directors and annual-return date fact (via the Companies API); a SARS VAT vendor check; a PAIA manual link check on the website (PAIA s 51(3)(a)).

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Company registered with CIPC and gives its name or registration number on demand | 1 | S2 | ALL | 4 | Slot: CIPC registration certificate. No engine fact: the CIPC register is not connected. The company must not misstate its name or number (s 32(1)(b)) | Companies Act s 32(1): https://www.justice.gov.za/legislation/acts/2008-071.pdf, checked 18 Nov 2026 |
| Private company name ends with "Proprietary Limited" or "(Pty) Ltd." | 1 | S2 | ALL | 4 | Slot: CIPC registration certificate. A name that is only the registration number must be followed by "(South Africa)" (s 11(3)(a)) | Companies Act s 11(3)(c)(ii), checked 18 Nov 2026 |
| "(RF)" after the name where the MOI restricts amendment | 1 | S2 | ALL | — | Note: required if the MOI uses s 15(2)(b) or (c) to restrict or prohibit amending a provision (s 11(3)(b)) | Companies Act s 11(3)(b), checked 18 Nov 2026 |
| Registered office continuously maintained in South Africa | 1 | S2 | ALL | 5 | Attestation. The address is first given on the Notice of Incorporation; a change is filed with a fee and takes effect on the later of the stated date or 5 business days after filing (s 23(4)) | Companies Act s 23(3), (4), checked 18 Nov 2026 |
| Deregistration risk after two years of missing annual returns | 1 | S2 | ALL | 5 | Attestation that annual returns are current. CIPC may remove a company that has not filed for two or more years in a row and, on demand, gives no satisfactory reason (s 82(3)(a)). CIPC says it then starts the deregistration process; deregistration withdraws juristic personality, and active directors may be held liable | Companies Act s 82(3), (4), checked 18 Nov 2026; CIPC Annual Returns FAQ v5.0: https://annualreturns.cipc.co.za/docs/FAQ_Annual_Returns.pdf, checked 18 Nov 2026 |
| Reinstatement after deregistration | 1 | — | — | — | Note: any interested person may apply to CIPC to reinstate a deregistered company (s 82(4)) | Companies Act s 82(4), checked 18 Nov 2026 |
| Business rescue begun by board resolution | 1 | S2 | ALL | 5 | Attestation: not in business rescue or liquidation. The board may resolve to begin business rescue if the company is financially distressed with a reasonable prospect of rescue; the resolution has no effect until filed (s 129(1), (2)(b)) | Companies Act s 129, checked 18 Nov 2026 |
| Status, directors and filings not readable by the engine | 1 | — | — | — | Note: no South African register fact exists. A CIPC Companies API exists behind sign-in (section 2, note 1); the eServices search must not be scraped (note 2) | https://developer.cipc.co.za/, checked 18 Nov 2026; https://eservices.cipc.co.za/TermsConditions.aspx, checked 18 Nov 2026 |
| LEI record, where one exists | 1 | S4 | INVESTED | 1 | `registry.global.gleif.*`. Not a South African obligation; a lookup aid only | Engine behaviour (`docs/GLOBAL-COVERAGE.md`), not law |
| Company name screened against sanctions lists | 3 | S2 | ALL | 3 | `registry.sanctions.match`, `possible_match`, `lists_checked`. International pack item; South Africa's own targeted financial sanctions list is not mapped here **[verify]** | `docs/GLOBAL-COVERAGE.md` (engine behaviour, not law) |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Memorandum of Incorporation consistent with the Act | 1 | S2 | ALL | 4 | Slot: MOI. A provision that contravenes the Act is void (s 15(1)). The MOI may deal with matters the Act does not address, alter alterable provisions, or impose stricter rules (s 15(2)) | Companies Act s 15(1), (2), checked 18 Nov 2026 |
| Securities register established in the prescribed form | 1 | S2 | ALL | 4 | Slot: securities register. As soon as practicable after an issue, record names and addresses of holders and the number issued to each (s 50(2)(b)). Not public; no engine fact | Companies Act s 50(1), (2), checked 18 Nov 2026 |
| Natural-person beneficial owners recorded in the securities register | 1 | S2 | ALL | 5 | Attestation. A company that is not an "affected company" must record prescribed beneficial-owner information and update it within the prescribed period after a change (s 50(3A)) | Companies Act s 50(3A), checked 18 Nov 2026 |
| Beneficial ownership filed with CIPC within 10 business days of incorporation | 1 | S2 | ALL | 4 | Slot: CIPC BO filing confirmation. Applies to entities incorporated on or after 24 May 2023; all CIPC-registered entities except co-operatives must file BO information. No engine fact | CIPC Beneficial Ownership page: https://www.cipc.co.za/?page_id=16055, checked 18 Nov 2026 |
| Amended BO declaration within 10 business days of a change | 1 | event-driven | ALL | 5 | Attestation | CIPC Beneficial Ownership page, checked 18 Nov 2026 |
| Definition of beneficial owner used by CIPC | 1 | S2 | ALL | — | Note for rule text: an individual who ultimately owns or effectively controls the company, through beneficial interests, voting rights, power to appoint or remove directors, or material influence over management, including through chains of ownership | CIPC Beneficial Ownership page, checked 18 Nov 2026 |
| Percentage threshold for private-company BO disclosure | 1 | — | — | — | Note: the CIPC page gives no percentage. The 5% figure in s 56(7)(aA) applies to affected companies. Whether CIPC regulations set a percentage for private companies is **[verify]** | **[verify]**: Companies Regulations on beneficial ownership not read |
| 5% beneficial-interest register kept by affected companies | 1 | S2 | ALL (affected companies) | 5 | Attestation. An affected company must keep a register of disclosures and of persons holding 5% or more of a class (s 56(7)) | Companies Act s 56(7), checked 18 Nov 2026 |
| Meaning of "affected company" | 1 | — | — | — | Note: the definition was not read **[verify]**; most private companies are expected to fall outside it, which would leave them on the s 50(3A) route | **[verify]**: Companies Act definition not read |
| Openness of BO information filed with CIPC | 1 | — | — | — | Note: s 33(1A) says CIPC must make the annual return available electronically "to any person as prescribed". Whether filed BO data is open to the public is **[verify]** | Companies Act s 33(1A), checked 18 Nov 2026 |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Annual financial statements prepared within 6 months of year end | 1 | S3 | ALL | 5 | Attestation. Must include a directors' report (s 30(3)(b)) | Companies Act s 30(1), checked 18 Nov 2026 |
| Board approval and director signature on the AFS | 1 | S3 | ALL | 4 | Slot: signed AFS. Presented to the first shareholders meeting after board approval (s 30(3)(c), (d)) | Companies Act s 30(3), checked 18 Nov 2026 |
| CIPC annual return within 30 business days after the incorporation anniversary | 1 | S2 | ALL | 4 | Slot: annual return filing certificate. s 33(1) sets the duty and leaves the period to regulation; CIPC states 30 business days, with penalties for late filing. Filed electronically only (BizPortal, eServices, self-service centre). No engine fact | Companies Act s 33(1), checked 18 Nov 2026; CIPC Annual Returns FAQ v5.0, checked 18 Nov 2026; CIPC Beneficial Ownership page, checked 18 Nov 2026 |
| Registers copied into the annual return (securities and beneficial interest) | 1 | S2 | ALL | 4 | Same slot. s 33(1)(aA) securities register; s 33(1)(aB) register under s 56(7)(aA) | Companies Act s 33(1)(aA), (aB), checked 18 Nov 2026 |
| Financial accountability supplement or AFS filed with the annual return | 1 | S3 | ALL | 4 | Slot: AFS (if audited) or FAS. CIPC says the company must file its latest BO declaration and its AFS or FAS with the annual return, plus a compliance checklist | CIPC Annual Returns FAQ v5.0, checked 18 Nov 2026; Companies Act s 33(1)(a), checked 18 Nov 2026 |
| BO declaration must be current before the annual return can be filed | 1 | S2 | ALL | — | Note: a "hard stop" from 1 July 2024; BO non-compliant entities cannot complete the annual return | CIPC Beneficial Ownership page, checked 18 Nov 2026 |
| Compliance person designated in each annual return | 1 | S2 | ALL | 5 | Attestation. A director, employee or other person responsible for the company's compliance with the Part of the Act that contains s 33, and Chapter 3 if it applies (s 33(3)) | Companies Act s 33(3), checked 18 Nov 2026 |
| CIPC fee for the annual return by turnover band | 1 | — | — | — | Note: CIPC fees depend on turnover and on late filing. The current 2008-Act fee table was cut off in our reading **[verify]** | CIPC Annual Returns FAQ v5.0, checked 18 Nov 2026 (fee table incomplete) |
| AGM duty in the Act is for public companies | 1 | — | — | — | Note: s 61(7) requires a public company to hold an AGM. A private company's MOI may still require one: read the MOI | Companies Act s 61(7), checked 18 Nov 2026 |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Board of at least one director | 1 | S2 | ALL | 4 | Slot: CIPC registration certificate or disclosure showing directors. The MOI may set a higher number (s 66(3)) and, for a profit company, must let shareholders elect at least 50% of directors (s 66(4)(b)). The engine keeps no names | Companies Act s 66(2)(a), (3), (4), checked 18 Nov 2026 |
| No company secretary needed for a private company | 1 | — | — | — | Note: s 86(1) makes a secretary mandatory only for public and state-owned companies, unless the MOI requires one | Companies Act s 86(1), (2), checked 18 Nov 2026 |
| Audit or independent review of the AFS, unless owner-managed | 1 | S3 | ALL | 4 | Slot: auditor's report or independent review report. A private company is audited if the regulations require it (public interest), or voluntarily; otherwise independently reviewed (s 30(2)(b)). If every securities holder is also a director, no audit or review is needed unless the regulations require audit for its class or another law or agreement does (s 30(2A)) | Companies Act s 30(2), (2A), checked 18 Nov 2026 |
| Public interest score thresholds for audit or independent review | 1 | S3 | ALL | — | **[verify]**: the score method and thresholds are in Companies Regulations 26-29, which we did not read (file too large for our tool). No figure may be encoded yet | **[verify]**: https://www.gov.za/sites/default/files/gcis_document/201409/34239rg9526gon351.pdf: official page not readable by our tool on 18 Nov 2026 |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Works made by employees in the course of employment belong to the employer | 2 | S2 | EMPLOYEES | 5 | Attestation, or Slot: employment contract IP clause. Applies to a work made under a contract of service or apprenticeship (s 21(1)(d)), subject to any agreement excluding it (s 21(1)(e)) | Copyright Act 98 of 1978 s 21(1): https://iponline.cipc.co.za/Publications/Acts/Copyright_Act.pdf, checked 18 Nov 2026 |
| Copyright assignment only valid in writing, signed by the assignor | 2 | S1 | ALL (founders), CONTRACTORS | 4 | Slot: IP assignment agreement. An exclusive licence must also be in writing and signed (s 22(3)) | Copyright Act s 22(3), checked 18 Nov 2026 |
| Contractor- and founder-written code stays with its author without an assignment | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Attestation. The commissioning rule in s 21(1)(c) lists photographs, portraits, gravures, films and sound recordings, not computer programs. That code written by a contractor or a founder before employment stays with the author is our reading **[verify]** | Copyright Act s 21(1)(c), checked 18 Nov 2026 |
| Pending amendments to s 21 of the Copyright Act | 2 | — | — | — | Note: bills to amend s 21 were found; whether any has been enacted is **[verify]** | **[verify]**: bill status not checked on an official page |
| Third-party code licences visible in the repository | 2 | S2 | WEBSITE / APP | 1 | `github.*` licence files and dependency manifests. A signal for licence review, not an ownership check | Engine behaviour, not law |
| Trade mark registration lasts 10 years, renewable for 10-year periods | 2 | S2 | ALL | 4 | Slot: registration certificate. Renewal runs 10 years from the expiry of the last registration (s 37(2)); the registrar may remove an unrenewed mark (s 37(3)) | Trade Marks Act 194 of 1993 s 37: https://www.thedtic.gov.za/wp-content/uploads/trade_marks_act.pdf, checked 18 Nov 2026 |
| CIPC as the trade marks office | 2 | S2 | ALL | — | Note: CIPC runs the trade marks office through IPOnline; the CIPC trade mark pages were not read **[verify]**. A South African filing covers South Africa only | **[verify]**: CIPC trade mark pages not read on 18 Nov 2026 |
| Inventions and patents | 2 | S3 | ALL | — | Trigger only. **[verify]**: Patents Act 57 of 1978 not read, including any employee-invention rule | **[verify]**: not read |

### Section 6 — Data protection and cookies

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| POPIA applies, supervised by the Information Regulator | 3 | S2 | PERSONAL_DATA | — | Note: Chapter 3 conditions and most of the Act in force from 1 July 2020 | POPIA, Act 4 of 2013 (commencement table): https://www.justice.gov.za/legislation/acts/2013-004.pdf, checked 18 Nov 2026 |
| Privacy notice given when collecting personal information | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `names_company` (s 18(1)(b) name and address), `rights_section` (s 18(1)(h)(iii), (iv) access, correction, objection), `transfers_section` (s 18(1)(g)). Before collection if collected directly (s 18(2)(a)) | POPIA s 18, checked 18 Nov 2026 |
| Complaint route to the Information Regulator named in the notice | 3 | S2 | WEBSITE / APP | 1 | `web.policy.dpa_named` (recognises "Information Regulator" and inforegulator.org.za). s 18(1)(h)(v): the right to complain to the Regulator and its contact details | POPIA s 18(1)(h)(v), checked 18 Nov 2026 |
| Records kept no longer than necessary | 3 | S2 | PERSONAL_DATA | 1 / 5 | `web.policy.retention_statement` as a signal only: s 14 limits retention but does not require a published statement. Attestation for practice | POPIA s 14, checked 18 Nov 2026 |
| Head of the private body serves as Information Officer | 3 | S2 | ALL | — | Note: for a private body the Information Officer is the head as defined in PAIA s 1 | POPIA s 1 ("information officer"), checked 18 Nov 2026 |
| Information Officer registered with the Regulator before taking up duties | 3 | S2 | ALL | 4 | Slot: Information Regulator registration certificate. s 55(2): officers take up duties only after the responsible party has registered them. The Regulator says registration "is not optional" and is done on its eServices portal (eservices.inforegulator.org.za). No engine fact | POPIA s 55(2), checked 18 Nov 2026; https://eservices.inforegulator.org.za/officers/default.aspx, checked 18 Nov 2026 |
| Deputy Information Officers designated as needed | 3 | S2 | ALL | 5 | Attestation. Designation as necessary to carry out s 55(1) duties (s 56) | POPIA s 56, checked 18 Nov 2026 |
| No public list of registered Information Officers found | 3 | — | — | — | Note: the officers page and the Regulator's legal page show no public list or search. That no machine-readable list exists anywhere is **[verify]** | https://eservices.inforegulator.org.za/officers/default.aspx, checked 18 Nov 2026; https://inforegulator.org.za/legal/, checked 18 Nov 2026 |
| Registration fee for Information Officers | 3 | — | — | — | Note: the officers page mentions no fee; that registration is free is **[verify]** | https://eservices.inforegulator.org.za/officers/default.aspx, checked 18 Nov 2026 |
| PAIA manual compiled, kept updated and published on the website | 3 | S2 | ALL | 4 | Slot: PAIA manual. Must give the head's postal and street address, phone and email (s 51(1)(a)), POPIA processing details (s 51(1)(c)) and be on the website, if any (s 51(3)(a)). `web.policy.dpo_contact` is a weak signal for the contact detail only | PAIA s 51: https://www.justice.gov.za/legislation/acts/2000-002.pdf, checked 18 Nov 2026 |
| Small private companies no longer exempt from the PAIA manual since 1 January 2022 | 3 | S2 | ALL | — | Note: the Regulator's PAIA Guide says that from 1 January 2022 every private and public body must have its manual available. The last exemption notice on the Regulator's legal page is GG 44785 (GeN 397, 30 June 2021) | PAIA Guide (Sept 2021): https://inforegulator.org.za/wp-content/uploads/2020/07/PAIA-Guide-English_20210905.pdf, checked 18 Nov 2026; https://inforegulator.org.za/legal/, checked 18 Nov 2026 |
| Any PAIA manual exemption notice after 2021 | 3 | — | — | — | Note: none found. That no later Gazette exemption under s 51(4) exists is **[verify]** | **[verify]**: Government Gazette not searched |
| Security safeguards, with a written contract for every operator | 3 / 6 | S2 | PERSONAL_DATA | 5 | Attestation; Slot: operator agreement. Reasonable technical and organisational measures (s 19); the operator must be bound by written contract and must notify the responsible party immediately of a compromise (s 21) | POPIA ss 19, 21, checked 18 Nov 2026 |
| Breach (security compromise) notified to the Regulator and data subjects | 3 | S2 | PERSONAL_DATA | 5 | Attestation. "As soon as reasonably possible" after discovery (s 22(2)); in writing by post, email, prominent website notice, news media or as the Regulator directs (s 22(4)) | POPIA s 22, checked 18 Nov 2026 |
| Children's information needs prior consent of a competent person | 3 | S2 | CONSUMER (services used by children) | 1 / 5 | `web.policy.children_section` shows a section exists; adequacy needs review. A child is under 18 (s 1). Other grounds in s 35(1) | POPIA ss 34, 35(1), checked 18 Nov 2026 |
| Prior authorisation from the Regulator for listed processing | 3 | S2 | PERSONAL_DATA (listed types) | 4 | Slot: Regulator authorisation. Includes linking unique identifiers across parties, credit reporting, and sending special or children's information to a country without adequate protection (s 57(1)) | POPIA s 57, checked 18 Nov 2026 |
| Electronic direct marketing only with consent or to existing customers | 3 | S2 | DIRECT_MARKETING | 5 | Attestation. Consent may be asked once (s 69(2)); customers only for own similar products with an opt-out at collection and in each message (s 69(3)); every message names the sender and gives an opt-out address (s 69(4)) | POPIA s 69, checked 18 Nov 2026 |
| Transfers outside South Africa on a lawful basis | 3 | S2 | PERSONAL_DATA | 1 / 5 | `web.policy.transfers_section` (presence). Adequate law, binding rules or agreement, consent, contract necessity and other grounds in s 72(1) | POPIA s 72, checked 18 Nov 2026 |
| Cookie consent before non-essential cookies | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count`, `cookie_policy_found`. **[verify]**: no cookie-specific statute or Regulator rule found; treating cookies as POPIA consent processing is our reading | **[verify]**: no official page found |
| PAIA annual report to the Information Regulator | 3 | S3 | ALL | — | Trigger only. The Regulator runs a portal for PAIA annual reports; whether a private body must file, and the deadline, are **[verify]** | **[verify]**: https://inforegulator.org.za/paia/paia-annual-reports/ not read |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Income tax registration happens automatically through CIPC | 3 | S2 | ALL | 5 | Attestation: income tax reference number held. SARS: CIPC-registered companies need no separate income tax registration; the company is linked through a direct interface with CIPC | SARS Corporate Income Tax: https://www.sars.gov.za/types-of-tax/corporate-income-tax/, checked 18 Nov 2026 |
| Provisional tax returns twice a year | 3 | S3 | ALL | 5 | Attestation. First return six months from the start of the year, second at year end, with payment; optional top-up after year end | SARS Corporate Income Tax, checked 18 Nov 2026 |
| ITR14 annual company return | 3 | S3 | ALL | 5 | Attestation. The filing deadline (12 months after year end) is from a secondary source only **[verify]** | **[verify]**: deadline not on the SARS page read |
| VAT registration once taxable supplies pass R2.3 million a year | 3 | S3 | ALL | 5 | Attestation. SARS applies the compulsory threshold of R2.3 million (previously R1 million) from 1 April 2026. No engine fact: no SARS vendor check; VIES not used | SARS FAQ: https://www.sars.gov.za/faq/what-is-the-new-threshold-for-vat-registration/, checked 18 Nov 2026; SARS Budget 2026 FAQ: https://www.sars.gov.za/about/sars-tax-and-customs-system/budget/budget-2026-frequently-asked-questions/, checked 18 Nov 2026 |
| Legal basis of the R2.3 million VAT figure | 3 | — | — | — | Note: SARS says the amendments "have not yet been promulgated". Whether the VAT Act s 23 amendment is now law, and the exact s 23 wording, are **[verify]** | **[verify]**: Value-Added Tax Act s 23 not read |
| Voluntary VAT registration above R120,000 | 3 | S3 | ALL | — | Note: SARS Budget 2026 FAQ, from 1 April 2026 (previously R50,000) | SARS Budget 2026 FAQ, checked 18 Nov 2026 |
| Employer registration for employees' tax within 21 business days | 3 | S2 | EMPLOYEES | 4 | Slot: SARS employer registration. Within 21 business days after becoming an employer, unless no employee is liable for normal tax | Fourth Schedule para 15(1) to the Income Tax Act, as stated in SARS Guide for Employers (2027): https://www.sars.gov.za/guide-for-employers-in-respect-of-employees-tax-2027/, checked 18 Nov 2026 |
| Skills Development Levy registration above R500,000 payroll | 3 | S2 | EMPLOYEES | 5 | Attestation. Not needed if the leviable amount over the next 12 months is not expected to exceed R500,000 (SDL Act ss 4, 5 as stated by SARS) | SARS Guide for Employers (2027), checked 18 Nov 2026 |
| UIF contributions registered with SARS or the UI Commissioner | 3 | S2 | EMPLOYEES | 5 | Attestation. Employers not registered with SARS for employees' tax or SDL register with the UI Commissioner | SARS Guide for Employers (2027), checked 18 Nov 2026 |
| Monthly EMP201 payment within 7 days after month end | 3 | S2 | EMPLOYEES | 5 | Attestation. Employees' tax, SDL and UIF; if the 7th is a weekend or public holiday, the last business day before it | SARS Guide for Employers (2027), checked 18 Nov 2026 |
| EMP501 employer reconciliation | 3 | S3 | EMPLOYEES | 5 | Attestation. Submission periods **[verify]**: not in the part of the SARS guide read | **[verify]**: SARS guide read only in part |
| Compensation Fund (COIDA) registration | 3 | S2 | EMPLOYEES | 4 | Slot: registration certificate. **[verify]**: COIDA and Compensation Fund pages not read (labour.gov.za not reachable by our tool) | **[verify]**: official page not readable by our tool on 18 Nov 2026 |
| Written particulars of employment given at the start | 3 | S2 | EMPLOYEES | 4 | Slot: employment contract. List in s 29(1)(a)-(p); revised on change (s 29(2)); kept 3 years after termination (s 29(4)). Not for employees working under 24 hours a month (s 28(1)); items (n)-(p) not for employers with fewer than 5 employees (s 28(2)) | BCEA 75 of 1997 ss 28, 29: https://admin.labour.gov.za/DocumentCenter/Acts/Basic%20Conditions%20of%20Employment/Act%20-%20Basic%20Conditions%20of%20Employment.pdf, checked 18 Nov 2026 |
| Statement of employee rights displayed at the workplace | 3 | S2 | EMPLOYEES (5 or more) | 5 | Attestation. In the prescribed form and the official languages spoken at the workplace (s 30); not for employers with fewer than 5 employees (s 28(2)) | BCEA ss 28(2), 30, checked 18 Nov 2026 |
| National minimum wage of R30.23 per ordinary hour from 1 March 2026 | 3 | S2 | EMPLOYEES | 5 | Attestation. Farm and domestic workers also R30.23; expanded public works programme R16.62; learnerships per Schedule 2 | GN R7083, GG 54075 of 3 Feb 2026: https://www.gov.za/sites/default/files/gcis_document/202602/54075rg11941gon7083.pdf, checked 18 Nov 2026 |
| Employment equity duties for designated employers | 3 | S3 | EMPLOYEES (50 or more) | — | Trigger only. The 50-employee threshold and any 2025 changes are **[verify]**: Employment Equity Act not read | **[verify]**: not read |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Financial services provider licence (FAIS) | 3 | S2 | SECTOR.FINANCIAL_SERVICES | 4 | Slot: FSCA licence. The FSCA lists FSPs and crypto asset service providers among the entities it regulates. A register import is not built | FSCA Regulated Entities: https://www.fsca.co.za/Regulated-Entities/, checked 18 Nov 2026 |
| Crypto assets declared a financial product | 3 | S2 | SECTOR.CRYPTO | 4 | Slot: FSCA licence or representative appointment. Declared under the FAIS Act by General Notice 1350 in GG 47334 of 19 October 2022; the notice text was not read **[verify]** | **[verify]**: https://www.gov.za/sites/default/files/gcis_document/202210/47334gen1350.pdf: official page not readable by our tool on 18 Nov 2026 |
| Payment services and SARB oversight | 3 | S2 | SECTOR.PAYMENTS | 4 | Slot: authorisation or sponsorship evidence. **[verify]**: SARB and National Payment System Act pages not read | **[verify]**: not read |
| Credit provider registration with the NCR | 3 | S2 | SECTOR.CREDIT | 4 | Slot: NCR registration. **[verify]**: National Credit Act not read | **[verify]**: not read |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Supplier details on the website where goods or services are sold | 4 | S2 | ECOMMERCE | 1 / 5 | `web.policy.legal_notice_present`, `registration_number_shown`; content in review. s 43(1)(a)-(g): full name and legal status; physical address and phone; website and email; self-regulatory memberships; codes of conduct; for a legal person its registration number, office bearers' names and place of registration; address for legal service | ECTA 25 of 2002 s 43(1), GG 23708 of 2 Aug 2002: https://saaa.gov.za/wp-content/uploads/2025/06/ECT-ACT.pdf, checked 18 Nov 2026 |
| Price, payment, delivery and policy information on the website | 4 | S3 | ECOMMERCE | 1 / 5 | `web.policy.terms_found` (s 43(1)(k)), `refund_policy_found` (s 43(1)(n)), `privacy_notice_found` (s 43(1)(p)). Also main characteristics, full price with transport and taxes, payment manner, delivery time, record access, ADR code, minimum duration and s 44 rights (s 43(1)(h)-(r)) | ECTA s 43(1), checked 18 Nov 2026 |
| Chance to review, correct and withdraw before placing the order | 4 | S3 | ECOMMERCE | 5 | Attestation. If s 43(1) or (2) is not met, the consumer may cancel within 14 days of receiving the goods or services (s 43(3)) | ECTA s 43(2), (3), checked 18 Nov 2026 |
| Sufficiently secure payment system | 4 | S3 | ECOMMERCE | 5 | Attestation. The supplier is liable for damage caused by a failure (s 43(6)) | ECTA s 43(5), (6), checked 18 Nov 2026 |
| Seven-day cooling-off for online sales | 4 | S3 | ECOMMERCE, CONSUMER | 1 / 5 | `web.policy.refund_policy_found`. Cancel without reason within 7 days of receiving goods, or of concluding a services agreement; only the direct cost of return may be charged; refund within 30 days (s 44) | ECTA s 44, checked 18 Nov 2026 |
| Scope and exclusions of ECTA Chapter VII (s 42) | 4 | — | — | — | Note: which transactions fall outside ss 43-46 (s 42) was not read **[verify]** | **[verify]**: ECTA s 42 not read |
| Order executed within 30 days unless agreed otherwise | 4 | S3 | ECOMMERCE | 5 | Attestation | ECTA s 46(1), checked 18 Nov 2026 |
| Unsolicited commercial email offers an unsubscribe and the data source | 4 | S2 | DIRECT_MARKETING | 5 | Attestation. Must offer cancellation of the mailing-list subscription and, on request, the source of the personal information; sending after being told communications are unwelcome is an offence (s 45(1), (4)) | ECTA s 45, checked 18 Nov 2026 |
| Name and registration number on electronic notices and invoices | 4 | S2 | ALL | 1 / 5 | `web.policy.registration_number_shown` as a signal. Required in all notices and official publications, including electronic ones under ECTA, and on letters, invoices and receipts (s 32(4)); contravention is an offence (s 32(5)) | Companies Act s 32(4), (5), checked 18 Nov 2026 |
| CPA does not protect juristic persons at or above the Minister's threshold | 4 | S3 | CONSUMER | — | Note: the CPA does not apply where the consumer is a juristic person whose asset value or annual turnover equals or exceeds the threshold set under s 6 (s 5(2)(b)) | Consumer Protection Act 68 of 2008 s 5(2): https://thencc.org.za/wp-content/uploads/2020/11/Consumer-Protection-Act.pdf, checked 18 Nov 2026 |
| R2 million CPA threshold figure | 4 | — | — | — | Note: the National Consumer Commission states a threshold of 2 million rand. The Gazette notice setting it was not read **[verify]** | https://thencc.org.za/other-regulators/, checked 18 Nov 2026; **[verify]**: https://www.gov.za/sites/default/files/gcis_document/201409/34181gon294.pdf: official page not readable by our tool on 18 Nov 2026 |
| Five-business-day cooling-off after direct marketing (CPA) | 4 | S3 | CONSUMER, DIRECT_MARKETING | 5 | Attestation. Rescind within 5 business days of the later of conclusion or delivery; refund within 15 business days. Does not apply where ECTA s 44 applies (s 16(1)) | CPA s 16, checked 18 Nov 2026 |
| Consumer documents in plain language | 4 | S3 | CONSUMER | 5 | Attestation. `web.policy.language_supported` shows only that the scan can read the language | CPA s 22, checked 18 Nov 2026 |
| Procedure to stop direct marketing on demand | 4 | S2 | DIRECT_MARKETING | 5 | Attestation. Anyone may refuse, require discontinuance or pre-emptively block direct marketing (s 11(1)); marketers must have procedures to receive demands and must not contact those who demanded or registered a block (s 11(4)) | CPA s 11, checked 18 Nov 2026 |
| Direct marketer registration and monthly cleansing against the NCC Opt-Out Registry | 4 | S2 | DIRECT_MARKETING | 5 | Attestation. NCC draft guidelines (comment period extended to 6 Nov 2026) say every direct marketer must register before marketing, renew yearly, and cleanse its list monthly under the CPA Amendment Regulations 2026. **[verify]**: the 2026 regulations were not read and the guidelines are a draft | NCC draft Opt-Out Registry Guidelines 2026: https://thencc.org.za/wp-content/uploads/2026/10/NCC-Guidelines-Notice-of-Extension-and-NCC-Guidelines-Opt-Out-Registry-Guidelines.pdf, checked 18 Nov 2026 |
| Website accessibility | 4 | S3 | WEBSITE / APP | 1 / 5 | `web.policy.accessibility_found`. **[verify]**: no South African rule binding a private company's website found | **[verify]**: no official page found |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Share issue resolved by the board within MOI-authorised shares | 5 | S4 | INVESTED | 4 | Slot: board resolution. Shares beyond the authorisation may be retroactively authorised within 60 business days; otherwise the excess issue is a nullity (s 38(2), (3)) | Companies Act s 38, checked 18 Nov 2026 |
| Register of securities updated after the issue | 5 | S4 | INVESTED | 5 | Attestation (see Section 2) | Companies Act s 50(2), checked 18 Nov 2026 |
| Financial assistance for subscribing securities needs a special resolution | 5 | S4 | INVESTED | 4 | Slot: special resolution. Under an employee share scheme or a special resolution adopted within the previous two years, and the board must be satisfied on solvency, liquidity and fair terms (s 44(3)) | Companies Act s 44, checked 18 Nov 2026 |
| Loans and other assistance to directors and related parties (s 45) | 5 | S4 | INVESTED | 4 | Slot: special resolution and shareholder notice. Same special-resolution and solvency tests (s 45(3)); written notice to shareholders within 10 business days if above one-tenth of 1% of net worth, otherwise within 30 business days after year end (s 45(5)). Section amended with effect from 27 December 2024 | Companies Act s 45(3), (5), checked 18 Nov 2026 |
| Offer of unlisted securities to the public needs a registered prospectus | 5 | S4 | INVESTED (offer to the public) | — | Trigger only. s 99(2), (3); offers listed in s 96(1) (professional investors, offers to existing holders, to directors, employee share schemes and others) are not offers to the public | Companies Act ss 96(1), 99, checked 18 Nov 2026 |
| Minimum acquisition cost for the s 96(1)(b) exemption | 5 | — | — | — | Note: the amount is prescribed under s 96(2)(a); figure not read **[verify]** | **[verify]**: Companies Regulations not read |
| Crowdfunding and exchange control | 5 | S4 | INVESTED | — | Trigger only. **[verify]**: no FSCA crowdfunding rule or SARB exchange-control page read | **[verify]**: not read |

### Section 11 — AI

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| No South African AI act; draft national AI policy withdrawn | 6 | — | AI | — | Note: the Draft National AI Policy published for comment in 2026 was withdrawn after fictitious sources were found in its references; Cabinet approved the withdrawal (SAnews, 5 June 2026). No AI law is mentioned | https://www.sanews.gov.za/south-africa/cabinet-approves-withdrawal-ai-policy, checked 18 Nov 2026 |
| Revised national AI policy | 6 | — | AI | — | Note: a revised policy is being prepared; its status is **[verify]** | **[verify]**: no newer official statement read |
| Automated decisions with legal or substantial effect | 6 | S3 | AI, PERSONAL_DATA | 5 | Attestation. A decision based solely on automated profiling is not allowed unless linked to a contract with the request met or safeguards in place, or governed by a law or code (s 71(1), (2)); safeguards include a chance to make representations (s 71(3)) | POPIA s 71, checked 18 Nov 2026 |
| EU AI Act duties when selling AI into the EU | 6 | S3 | AI, EU_MARKET | 5 | Attestation. Refer to "EU Section 7 — AI Act" in `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`; it reaches a South African company only through the EU market | EU common map |
| AI use disclosed on the website | 6 | S3 | AI, WEBSITE | 1 | `web.policy.ai_disclosure_found`. Presence only; no South African disclosure duty found | Engine behaviour, not law |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above.

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| CIPC annual return, with BO declaration and AFS or FAS | Section 3 | Within 30 business days after each anniversary of incorporation | Attestation; filing certificate upload |
| Annual financial statements | Section 3 | Within 6 months after year end | Attestation |
| BO changes to CIPC | Section 2 | Within 10 business days of a change | Attestation |
| Provisional tax (IRP6) | Section 7 | Six months into the year, and at year end | Attestation |
| ITR14 company return | Section 7 | 12 months after year end **[verify]** | Attestation |
| EMP201 (PAYE, SDL, UIF) | Section 7 | Monthly, within 7 days after month end | Attestation |
| EMP501 reconciliation | Section 7 | Periods **[verify]** | Attestation |
| VAT returns | Section 7 | Period **[verify]** | Attestation |
| Opt-Out Registry renewal and list cleansing | Section 9 | Yearly renewal; monthly cleansing **[verify]** | Attestation |
| PAIA manual update | Section 6 | "On a regular basis" (s 51(2)) | Attestation |
| Trade mark renewal | Section 5 | Every 10 years | Attestation; certificate date |

---

## 4. Counts by tier

| Tier | Items | What this means |
|---|---|---|
| 1 Official live or URL scan | 14 (6 pure; 8 mixed 1 / 5) | Website scan only: privacy notice and its POPIA s 18 items, cookies, ECTA s 43 supplier details, refund, AI disclosure, `github.*`, LEI. No South African register is connected |
| 2 Licensed vendor | 0 | Not built: a CIPC Companies API exists behind sign-in and would replace vendors |
| 3 Official list import | 1 | Sanctions lists |
| 4 Document-verified | 26 | CIPC certificate, MOI, securities register, BO filing, annual return certificate, AFS and audit or review report, IO registration, PAIA manual, SARS employer registration, contracts, licences, resolutions |
| 5 Attested | 35 | Registered office, status, BO updates, tax, payroll, POPIA practices, consumer terms, marketing, IP ownership |
| Notes (no tier) | 33 | Context lines a rule can quote, not checks |

Total in Sections 1–11: 109 lines (76 checkable items, 33 notes). 30 of them carry **[verify]**, plus 4 calendar lines in Section 12.

---

## 5. The core set every South African tech company must show at Stage 2

1. Registered with CIPC as a private company whose name ends "(Pty) Ltd" (Tier 4: no register fact yet).
2. MOI in place and consistent with the Act; securities register kept (Tier 4).
3. At least one director (Tier 4).
4. Beneficial ownership filed with CIPC within 10 business days of incorporation (companies incorporated from 24 May 2023) and kept current (Tier 4 / 5).
5. Registered office maintained in South Africa (Tier 5).
6. Annual return with BO declaration filed within 30 business days after each anniversary (Tier 4).
7. Information Officer registered with the Information Regulator, and a PAIA manual on the website (Tier 4).
8. Privacy notice with the POPIA s 18 items, including the Information Regulator complaint route (Tier 1, WEBSITE).
9. Website supplier details under ECTA s 43 where anything is sold online, including the registration number (Tier 1 / 5).
10. Founders' and contractors' IP assigned in writing and signed (Tier 4).

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

- Public interest score method and audit or independent review thresholds (Companies Regulations 26-29).
- Definition of "affected company" and any BO percentage threshold for private companies; whether filed BO data is public.
- Commencement since May 2025 of the "to be proclaimed" parts of the Companies Amendment Act 16 of 2024 (for example s 33(1)(a)).
- Current CIPC annual return fee table.
- VAT: promulgation of the R2.3 million compulsory threshold (VAT Act s 23) and VAT return periods.
- ITR14 deadline and EMP501 periods.
- COIDA registration with the Compensation Fund; Employment Equity designated-employer threshold after the 2025 changes.
- CPA s 6 threshold notice (the R2 million figure) and the CPA Amendment Regulations 2026 on the Opt-Out Registry.
- ECTA s 42 scope and exclusions for the s 44 cooling-off; any amendment to ss 43-46 since 2002.
- That no public or machine-readable list of registered Information Officers exists; whether registration is free; PAIA annual report duty for private bodies.
- That no PAIA manual exemption notice was issued after 30 June 2021.
- Cookie consent: whether any South African rule specific to cookies exists.
- That contractor- and founder-written code stays with its author without assignment; Copyright Amendment Bill status; Patents Act and employee inventions.
- Trade mark filing through CIPC (pages not read).
- FAIS declaration of crypto assets (GN 1350 of 2022) text; SARB payments and NCR credit triggers; crowdfunding and exchange control.
- Revised national AI policy status.
- Whether the CIPC API documentation (guide.cipc.co.za) is public, what the API Terms of Use say, and any fee.
- South Africa's national targeted financial sanctions list, if a South Africa-specific list is wanted.

---

## Not encoded (18 Nov 2026)

Rule pack `packages/rules/src/packs/za.ts`, version 0.1.0 (draft): 43 South African rules, with the International pack after them. No South African register is connected, so no rule reads a register fact and none is "critical". One rule rests on a [verify] line and can only say "to check": `ZA.TAX.VAT_REGISTRATION` (the R2.3 million threshold SARS applies is not yet promulgated, so the rule states no figure). Website rules fail only when `web.policy.language_supported` is true.

| Item | Section | Why |
|---|---|---|
| "(RF)" after the name; reinstatement; status not readable | Section 1 | Notes |
| Deregistration risk after two years of missing annual returns | Section 1 | Folded into `ZA.CORP.ANNUAL_RETURN`, which cites it |
| LEI record; sanctions screening | Section 1 | Covered by the International pack (`INTL.SANCT.SCREENING`); sanctions is [verify] |
| BO definition, percentage threshold, 5% register of affected companies, "affected company", openness of BO data | Section 2 | Notes, most [verify]. The 5% register applies to affected companies, which most private companies are expected not to be ([verify]) |
| CIPC fee table; AGM duty for public companies; registers copied into the return | Section 3 | Notes; the fee table is [verify]. The registers ride on `ZA.CORP.ANNUAL_RETURN` |
| No company secretary for a private company; public interest score | Section 4 | Note; the score thresholds are [verify], so `ZA.CORP.AUDIT_OR_REVIEW` names no figure |
| Contractor- and founder-written code; pending s 21 amendments; patents; CIPC trade marks office | Section 5 | [verify]; `ZA.IP.ASSIGNMENT` rests on the clean s 22(3) line |
| Third-party code licences | Section 5 | Engine signal, not law |
| POPIA applies; head as Information Officer; deputy officers; no public list; fee | Section 6 | Notes, or folded into `ZA.DP.INFORMATION_OFFICER`; the list and the fee are [verify] |
| Records kept no longer than necessary | Section 6 | POPIA asks for no published statement, so a page check would mislead |
| Prior authorisation from the Regulator | Section 6 | No fact or question says whether the company does the listed processing |
| Cookie consent; PAIA annual report; PAIA exemption after 2021 | Section 6 | [verify] |
| ITR14 deadline; voluntary VAT; EMP501; COIDA; employment equity | Section 7 | [verify], a note, or a trigger only |
| Statement of employee rights displayed | Section 7 | Applies from 5 employees; no fact gives the head count |
| FAIS, crypto, payments, NCR credit | Section 8 | All [verify] except FAIS, which has no trigger (no "financial services" sector fact) |
| Review before ordering; secure payment; order within 30 days | Section 9 | Attestation-only details of ECTA ss 43 and 46, left for the lawyer to choose; `ZA.CONSUMER.SALE_INFORMATION` covers the s 43 information |
| ECTA s 42 scope; CPA threshold figure; Opt-Out Registry; accessibility | Section 9 | [verify] |
| CPA juristic-person threshold; CPA s 16 cooling-off | Section 9 | Note; the CPA cooling-off does not apply where ECTA s 44 does, which `ZA.CONSUMER.COOLING_OFF` covers |
| s 96 minimum cost; crowdfunding and exchange control | Section 10 | [verify] |
| No AI act; revised policy; EU AI Act through the EU market | Section 11 | Notes; no fact says the company sells into the EU |
| Compliance calendar | Section 12 | Not items. The 6-month statements and 10-year trade mark renewal are on their rules |
