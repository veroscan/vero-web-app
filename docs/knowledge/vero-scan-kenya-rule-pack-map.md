# Vero Scan — Kenya Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 18 November 2026
**Sources:** Official legislation, government and regulator pages only (Business Registration Service, Office of the Data Protection Commissioner, Kenya Revenue Authority, Social Health Authority, NSSF, Kenya Copyright Board, Central Bank of Kenya, Competition Authority of Kenya). Each line gives its URL and the date checked. Secondary sources (law-firm notes, vendor pages, search snippets) were used only to find the official page and are never cited.
**Company form covered:** private company limited by shares under the Companies Act 2015 (No. 17 of 2015).
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Lines marked **[verify]** must not be encoded as a pass/fail rule until the uncertainty named on the line is resolved.

**Kenya is not in the EU or the EEA.** No EU rule applies to a Kenyan company as Kenyan law. An EU rule reaches a Kenyan company only when it sells into the EU market; the one line that says so (Section 11) points to `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Kenyan private company limited by shares at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| ODPC_REGISTRATION | Not exempt from ODPC registration: turnover or revenue of KES 5 million or more, or 10 or more employees, or a Third Schedule purpose (Section 6) |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Sells to consumers (B2C) |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| EU_MARKET | Places products or services on the EU market |
| SECTOR.PAYMENTS, .CREDIT, .CRYPTO, .TELECOMS | Sector packs (CBK, CMA, Communications Authority), triggers only |
| INVESTED | Has raised or is raising |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a document slot) · 5 attested (vault). Routes follow the *Verification Solutions Matrix* (`docs/knowledge/vero-scan-verification-solutions.md`).

**[verify]** means: not confirmed from an official source on 18 Nov 2026. The line says exactly what is uncertain. A threshold, deadline or section number marked [verify] is a lead, not a fact.

**Source column.** "checked 18 Nov 2026" appears only where the page was read on that day. A page our tool could not read is marked **[verify]: official page not readable by our tool on 18 Nov 2026**.

**Which text of the Companies Act we read.** Kenya Law (kenyalaw.org and new.kenyalaw.org) refused our tool on 18 Nov 2026 (HTTP 403, or an empty bot-check response). We read the Companies Act from the copy BRS publishes, which is the Kenya Law *Revised Edition 2021*. Amendments made after that edition were not checked (see note 1 below).

### Engine facts available for Kenya

**No Kenyan register fact exists today.** The engine has no BRS, ODPC or KRA connector, so every company-register, data-protection-register and tax-registration line below is Tier 4 or 5 until one exists. A miss on the facts below means "not found", never "does not exist".

| Fact key(s) | What it can show | What it cannot show |
|---|---|---|
| (none) Kenyan company register | Nothing: no BRS connector exists | Registration, status, directors, shareholders, annual return or accounts filing |
| (none) ODPC register | Nothing: no ODPC connector exists (the published list is bot-protected, note 3) | Whether the company holds a current ODPC certificate |
| (none) KRA | Nothing: no KRA PIN or VAT checker is wired | PIN, VAT registration, eTIMS onboarding, tax compliance |
| `registry.global.gleif.*` | The LEI record, if any | Anything about Kenyan law |
| `registry.sanctions.match`, `possible_match`, `lists_checked` | Company name screened against the stored sanctions lists | That the company is or is not sanctioned (a person must check) |
| `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `retention_statement`, `transfers_section`, `dpo_contact`, `children_section` | Website privacy notice and its sections | Legal adequacy under the Data Protection Act 2019 |
| `web.policy.dpa_named` | The privacy notice names the ODPC or links odpc.go.ke | That naming it is legally required (Section 6) |
| `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count`, `cookie_policy_found` | Cookie banner and cookies or trackers set before consent | A Kenyan cookie rule (none found) |
| `web.policy.terms_found`, `refund_policy_found`, `complaints_policy_found`, `accessibility_found` | Terms, refund, complaints and accessibility pages exist | Content adequacy under the Consumer Protection Act 2012 |
| `web.policy.legal_notice_present`, `registration_number_shown` | The site shows a legal notice and a registration number | That every item prescribed under Companies Act s 67 is shown |
| `web.policy.ai_disclosure_found` | The site discloses AI use | A Kenyan legal duty to disclose (none mapped) |
| `web.policy.language_supported` | The scan could read the site's language (English is read) | Anything legal |
| `github.*` | Repository licence files and dependency manifests, if GitHub is connected | Who owns the code |

**Not available for Kenya:** `registry.eu.vies_vat.*` (VIES covers EU member states only) and any EU register fact.

---

## 2. Notes for the reviewing lawyer

1. **Companies Act text is the Revised Edition 2021.** BRS hosts it at brs.go.ke; Kenya Law refused our tool. Any amendment after 2021 (for example by later business-laws or finance statutes) was not checked. Every Companies Act line below is confirmed against that edition only. The same applies to the Data Protection Act (2019 Gazette text on odpc.go.ke) and the VAT Act (KRA's Revised Edition 2021, checked against KRA's live VAT page for the threshold).
2. **Corrections to our brief.** The annual return is due within **28 days** after the return date, not 30 (s 705(3)(b)). The return of allotment is **s 333** (within one month), not s 343. The name rule is **s 54**, not s 58 (s 58 is the Registrar's power to direct a change of name). The registered-office duty is **s 46**; s 47 is the change-of-address procedure.
3. **ODPC registration exemption runs the other way from our brief.** Regulation 13(2) of the 2021 Registration Regulations exempts a controller or processor that has annual turnover or revenue **below** KES 5 million **and** fewer than 10 employees. Both conditions are needed. The exemption does not apply to Third Schedule purposes (reg 13(4)), and exempt entities must still comply with Parts IV and VI of the Act (reg 13(3)).
4. **Register API question (BRS).** We found no publicly documented BRS company-search API, no "business search API" and no published integration programme for banks on brs.go.ke or ecitizen.go.ke on 18 Nov 2026. What exists: (a) the Official Search (CR12) inside eCitizen, which needs an eCitizen login and a fee of KES 650, and works only for companies whose BRS status is "Verified" (BRS FAQs PDF, https://brs.go.ke/wp-content/uploads/2024/05/FAQs.pdf); (b) a no-login "Compliance Check" search by name or registration number that only says whether a company is on the Registrar's list of companies that may not be operating (https://brs.go.ke/boi-notice1/); (c) an eCitizen API reference at https://apidocs.ecitizen.go.ke/index.html/ that returned HTTP 503 to our tool, so we could not see what it covers, who may apply or what it costs **[verify]**. Commercial KYB vendors resell BRS lookups; we did not use them and they are not official. We did not apply, sign up, log in or call any API.
5. **Register API question (ODPC).** The Act makes the register of data controllers and processors a public document (s 21(3)) and the Regulations require the ODPC to publish the list on its website every 30 days (reg 14(2)). The pages https://www.odpc.go.ke/registered-data-handlers/ and https://www.odpc.go.ke/expired-data-handlers/ returned a Radware "Verifying your browser" bot-check to our tool, with no data, on 18 Nov 2026. We could not confirm the format, the fields or whether it is searchable. The registration portal https://dataportal.odpc.go.ke/ needs an account (/Account/Login) and shows no public search or certificate check. Result: no machine-readable, no-login, bot-free ODPC register is available to us today. The ODPC's PDFs under /wp-content/ were readable.
6. **Beneficial ownership is not public.** The 2023 amendment to the Beneficial Ownership Regulations says the information is not to be made public or published, with narrow exceptions. The engine cannot check it; it stays Tier 4 or 5.
7. **No annual general meeting rule for private companies found.** Section 310 imposes the AGM on public companies. That a private company need hold none is our reading **[verify]**; its articles may require one.
8. **Copyright in commissioned works.** Copyright Act s 31(1)(a) deems copyright in a work commissioned by someone other than the author's employer transferred to the commissioner, subject to agreement. This is wider than many common-law systems. Whether it reaches ordinary software development by a contractor is a question for the lawyer; a written assignment stays the recommended route.
9. **Unreadable on 18 Nov 2026:** Kenya Law (all Acts and the 2020 Beneficial Ownership Regulations), labour.go.ke (Employment Act), kipi.go.ke (Industrial Property Act, Trade Marks Act), cma.or.ke (Capital Markets Act, crowdfunding regulations), the ODPC HTML pages (Radware), the ODPC AI guidance note (HTTP 404), the eCitizen API reference (HTTP 503). Lines resting on these carry **[verify]**.
10. **Missing engine facts** that would raise several Tier 4 and 5 lines to Tier 1: a BRS company record (status, directors, secretary, annual-return year), an ODPC registration check by name or number, and a KRA PIN or VAT status check.

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Incorporated by the Registrar of Companies through BRS eCitizen | 1 | S2 | ALL | 4 | Slot: certificate of incorporation (s 18). The application states the name, registered office location, how liability is limited and that the company is private (s 13(2)), with a memorandum and articles (s 13(1)). BRS takes applications online at brs.ecitizen.go.ke; the FAQ gives a fee of KES 10,750. No Kenyan register fact exists | Companies Act 2015 ss 13, 18 (Rev. 2021): https://brs.go.ke/wp-content/uploads/2023/03/CompaniesAct17of2015.pdf, checked 18 Nov 2026; BRS FAQs: https://brs.go.ke/wp-content/uploads/2024/05/FAQs.pdf, checked 18 Nov 2026 |
| Private limited company name ends with "limited" or "ltd." | 1 | S2 | ALL | 4 | Slot: certificate of incorporation. The Cabinet Secretary may exempt a private company by notice (s 55): Slot for the exemption notice if relied on | Companies Act 2015 ss 54, 55: https://brs.go.ke/wp-content/uploads/2023/03/CompaniesAct17of2015.pdf, checked 18 Nov 2026 |
| Registered office kept at all times for communications and notices | 1 | S2 | ALL | 5 | Attestation. A change of address takes effect only when the Registrar registers it (s 47(2)) | Companies Act 2015 ss 46, 47, checked 18 Nov 2026 |
| Official search (CR12) as evidence of current officers and shareholders | 1 | S2 | ALL | 4 | Slot: CR12 official search. Evidence route, not a duty. Needs an eCitizen login and a KES 650 fee; only companies with "Verified" status get an automated search | BRS FAQs: https://brs.go.ke/wp-content/uploads/2024/05/FAQs.pdf, checked 18 Nov 2026 |
| Not named on the Registrar's list of companies that may not be operating | 1 | S2 | ALL | 5 | Attestation, or a person checks the no-login Compliance Check search by name or number. The notice cites ss 93A and 894(1). Under s 894 the Registrar writes, then sends a registered letter, then may gazette a striking-off notice. No engine fact | https://brs.go.ke/boi-notice1/, checked 18 Nov 2026 (last updated 21 Aug 2026); Companies Act 2015 s 894, checked 18 Nov 2026 |
| Company name screened against sanctions lists | 3 | S2 | ALL | 3 | `registry.sanctions.match`, `possible_match`, `lists_checked`. International pack item; Kenya's own sanctions and AML regime is not mapped here **[verify]** | `docs/GLOBAL-COVERAGE.md` (engine behaviour, not law) |
| Legal Entity Identifier record, where the company has one | 1 | S3 | ALL | 1 | `registry.global.gleif.*`. Not a Kenyan legal duty; a supporting identity signal only | `docs/GLOBAL-COVERAGE.md` (engine behaviour, not law) |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Memorandum and articles lodged with the registration application | 1 | S2 | ALL | 4 | Slot: memorandum and articles. Model articles in force at registration fill any gap the registered articles do not exclude or modify (s 21) | Companies Act 2015 ss 13(1), 21: https://brs.go.ke/wp-content/uploads/2023/03/CompaniesAct17of2015.pdf, checked 18 Nov 2026 |
| Register of members kept with names, addresses, dates and shareholdings | 1 | S2 | ALL | 5 | Attestation, or Slot: register of members. Must show each member's shares (by number and class where relevant) and the amount paid; includes beneficial owner information, if any (s 93(1)-(3)). Kept at the registered office unless regulations allow otherwise (s 94) | Companies Act 2015 ss 93, 94, checked 18 Nov 2026 |
| Copy of the register of members lodged with the Registrar within 30 days | 1 | S2 | ALL | 4 | Slot: lodgement acknowledgement. Within 30 days after completing its preparation (s 93(8)); amendments lodged within 14 days (s 93(9)). Fine up to KES 500,000 | Companies Act 2015 s 93(8)-(10), checked 18 Nov 2026 |
| Register of beneficial owners kept by the company | 1 | S2 | ALL | 5 | Attestation. Content as prescribed by the Beneficial Ownership Regulations (s 93A(1)-(2)) | Companies Act 2015 s 93A, checked 18 Nov 2026 |
| Beneficial owners register lodged with the Registrar within 30 days of preparation | 1 | S2 | ALL | 4 | Slot: BRS acknowledgement of the beneficial ownership filing. BRS publishes a user guide for updating it on BRS version 2 | Companies Act 2015 s 93A(3), checked 18 Nov 2026; https://brs.go.ke/companies-registry/, checked 18 Nov 2026 |
| Beneficial-owner changes lodged within 14 days of amending the register | 1 | event-driven | ALL | 5 | Attestation. The company lodges the amendment within 14 days (s 93A(4)); a director, member or beneficial owner must tell the company of a change within 14 days (2023 amendment, new reg 5C) | Companies Act 2015 s 93A(4), checked 18 Nov 2026; L.N. 162 of 2023: https://brs.go.ke/wp-content/uploads/2023/11/L.-N.-162-Companies-Beneficial-Ownership-Information-Amendment-Regulations-2023.pdf, checked 18 Nov 2026 |
| Beneficial owner test (10% of shares or votes, board control, significant influence) | 1 | S2 | ALL | — | Note for rule text: BRS says at least 10% of issued shares, at least 10% of votes, a right to appoint or remove a director, or significant influence or control. The 2023 amendment rewrote the appointment limb as a right to appoint or remove **a majority** of the board. The 10% figures were not read in the 2020 principal Regulations (Kenya Law refused our tool) **[verify]** | BRS FAQs, checked 18 Nov 2026; L.N. 162 of 2023 reg 3, checked 18 Nov 2026; **[verify]**: L.N. 12 of 2020 official page not readable by our tool on 18 Nov 2026 |
| Beneficial ownership information is not published | 1 | — | — | — | Note: the 2023 amendment text says the information is not made available to the public or published, with narrow exceptions. Explains why this stays Tier 4 or 5 | L.N. 162 of 2023, checked 18 Nov 2026 |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Annual return lodged within 28 days after its return date | 1 | S2 | ALL | 4 | Slot: annual return filing receipt from eCitizen. The return date is the anniversary of incorporation, or of the date the last return was made up to (s 705(2)). Signed by a director or the secretary. Filed under "Maintain a Company" on eCitizen | Companies Act 2015 s 705: https://brs.go.ke/wp-content/uploads/2023/03/CompaniesAct17of2015.pdf, checked 18 Nov 2026; BRS FAQs, checked 18 Nov 2026 |
| Annual return contents: registered office, company type and principal activities | 1 | — | — | — | Note: plus particulars prescribed by regulations, and share capital information (s 706, s 707) | Companies Act 2015 ss 706, 707, checked 18 Nov 2026 |
| Financial statements lodged within 9 months of the accounting reference period (private company) | 1 | S3 | ALL | 4 | Slot: filing receipt. Directors lodge for each financial year (s 683). A first period longer than 12 months has its own deadline (s 684(2)) | Companies Act 2015 ss 683, 684, checked 18 Nov 2026 |
| Small company lodges at least its balance sheet | 1 | S3 | ALL | 4 | Slot: lodged balance sheet. Profit and loss account and directors' report are optional; the auditor's report goes with it unless the company is exempt from audit. The balance sheet must say it was lodged under the small companies regime | Companies Act 2015 s 686, checked 18 Nov 2026 |
| Small company test: two of turnover, net assets and head count | 1 | — | — | — | Note: qualifies as small if it meets two or more of turnover not more than KES 50 million, net assets not more than KES 20 million, not more than 25 employees (monthly average). Later years need the test met in two consecutive years (s 624(2)) | Companies Act 2015 s 624, checked 18 Nov 2026 |
| Annual general meeting duty is written for public companies | 1 | — | — | — | Note: s 310 requires a public company to hold an AGM within six months of its accounting reference date. That a private company has no statutory AGM duty is our reading **[verify]**; check the articles | Companies Act 2015 s 310, checked 18 Nov 2026 |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Private company has at least one director | 1 | S2 | ALL | 4 | Slot: CR12 official search. The Registrar may direct an appointment within one to three months (s 130) | Companies Act 2015 ss 128(1), 130: https://brs.go.ke/wp-content/uploads/2023/03/CompaniesAct17of2015.pdf, checked 18 Nov 2026 |
| At least one director is a natural person | 1 | S2 | ALL | 4 | Slot: CR12 official search | Companies Act 2015 s 129(1), checked 18 Nov 2026 |
| Directors are at least 18 years old | 1 | S2 | ALL | 5 | Attestation. An appointment of someone under 18 is void | Companies Act 2015 s 131, checked 18 Nov 2026 |
| Register of directors and register of directors' residential addresses | 1 | S2 | ALL | 5 | Attestation. Register of directors open for inspection at the registered office or another permitted place (s 134); separate register of usual residential addresses (s 137) | Companies Act 2015 ss 134, 137, checked 18 Nov 2026 |
| No director residency or nationality rule found | 1 | — | — | — | Note: we found none in the sections read. Absence is **[verify]** | **[verify]**: no section stating it was read |
| Company secretary required once paid-up capital is KES 5 million or more | 1 | S2 | ALL | 4 / 5 | Slot: CR12 (shows the secretary), or Attestation that paid-up capital is below KES 5 million. Without a secretary, a director or an authorised person does the secretary's tasks (s 243(2)) | Companies Act 2015 s 243, checked 18 Nov 2026 |
| Financial statements audited unless the company is exempt | 1 | S3 | ALL | 4 | Slot: auditor's report, or the balance sheet carrying the directors' exemption statement above their signature (s 709(2)-(4)) | Companies Act 2015 s 709, checked 18 Nov 2026 |
| Small company audit exemption: small, turnover up to KES 50 million and net assets up to KES 20 million | 1 | S3 | ALL | — | Note for rule text: all three conditions (s 711(2)). Not available to a public company or a banking or insurance business (s 712); group companies have extra conditions (s 713) | Companies Act 2015 ss 711-713, checked 18 Nov 2026 |
| Members with 10% can require an audit | 1 | — | — | — | Note: notice by members holding at least 10% of nominal share capital, given during the financial year and no later than one month before its end (s 710) | Companies Act 2015 s 710, checked 18 Nov 2026 |
| Private company auditor appointment and term | 1 | S3 | ALL | 5 | Attestation. **[verify]**: ss 717-719 were seen by heading only; the appointment period and term were not read | **[verify]**: ss 717-719 not read |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Copyright in employees' work made in the course of employment passes to the employer | 2 | S2 | EMPLOYEES | 5 | Slot: employment contract IP clause. Deemed transferred to the employer, subject to any agreement excluding or limiting the transfer (s 31(1)(b)). Computer programs are protected works (s 2) | Copyright Act (Cap 130, Rev. 2022) ss 2, 31: https://copyright.go.ke/sites/default/files/downloads/CopyrightAct12of2001.pdf, checked 18 Nov 2026 |
| Commissioned works: copyright deemed transferred to the commissioner | 2 | — | — | — | Note: s 31(1)(a) applies where a work is commissioned by someone other than the author's employer, subject to any agreement excluding or limiting the transfer | Copyright Act s 31(1)(a), checked 18 Nov 2026 |
| Contractors and founders assign IP in writing | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Slot: IP assignment agreement. Whether s 31(1)(a) covers a contractor's code, and that nothing passes from a founder without a written assignment, is our reading **[verify]**. Assignment formalities in the Copyright Act were not read **[verify]** | Copyright Act s 31, checked 18 Nov 2026 |
| Employee inventions under the Industrial Property Act 2001 | 2 | S2 | EMPLOYEES | 5 | Slot: employment contract IP clause. Who owns an employee's invention (s 32 per our brief) is **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 (Kenya Law and kipi.go.ke) |
| Trade mark registered with KIPI | 2 | S2 | ALL | 4 | Slot: registration certificate. The 10-year term and renewal period under the Trade Marks Act (Cap 506) are **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 (kipi.go.ke) |
| Copyright reform bill is a consultation draft | 2 | — | — | — | Note: KECOBO lists a "Copyright and Related Rights Bill 2026" for public comment. The 2001 Act (Revised Edition 2022) is the law in force on that page | https://copyright.go.ke/downloads/copyright-act, checked 18 Nov 2026 |

### Section 6 — Data protection and cookies

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Registered with the ODPC before acting as data controller or processor | 3 | S2 | PERSONAL_DATA, ODPC_REGISTRATION | 4 | Slot: ODPC certificate of registration. Register as controller, processor or both (reg 4). Apply online with establishment documents, purposes and categories of data (reg 5, reg 17). No engine fact | Data Protection Act 2019 s 18(1): https://www.odpc.go.ke/wp-content/uploads/2024/02/TheDataProtectionAct__No24of2019.pdf, checked 18 Nov 2026; Registration Regulations 2021 regs 4, 5, 17: https://www.odpc.go.ke/wp-content/uploads/2024/03/THE-DATA-PROTECTION-REGISTRATION-OF-DATA-CONTROLLERS-AND-DATA-PROCESSORS-REGULATIONS-2021.pdf, checked 18 Nov 2026 |
| Exempt from registration only below KES 5 million turnover and under 10 employees | 3 | — | PERSONAL_DATA | — | Note for rule text: both conditions are needed (reg 13(2)). Exempt entities must still comply with Parts IV and VI of the Act (reg 13(3)). The registration form asks for employee and turnover bands | Registration Regulations 2021 reg 13, First Schedule, checked 18 Nov 2026 |
| Third Schedule purposes need registration whatever the size | 3 | S2 | PERSONAL_DATA | — | Note for the trigger: political canvassing; crime prevention including CCTV; gambling; educational institutions; health; hospitality; property management; financial services; telecoms network or service providers; businesses wholly or mainly in direct marketing; transport including ride-hailing apps; genetic data | Registration Regulations 2021 reg 13(4), Third Schedule, checked 18 Nov 2026 |
| ODPC certificate valid for 24 months, then renewed | 3 | S2 | ODPC_REGISTRATION | 4 | Slot: current certificate with issue date. Valid 24 months from issue (reg 9); renewal on Form DPR 2 after expiry (reg 11, Act s 20). Continuing to process after expiry without renewal is an offence (reg 18(c)) | Registration Regulations 2021 regs 9, 11, 18, checked 18 Nov 2026; Data Protection Act s 20, checked 18 Nov 2026 |
| ODPC fees by size band | 3 | — | — | — | Note: registration once and renewal every 2 years. Micro and small (1-50 employees, up to KES 5 million): KES 4,000 and 2,000. Medium (51-99, KES 5,000,001 to 50 million): KES 16,000 and 9,000. Large (over 99, over KES 50 million): KES 40,000 and 25,000 | Registration Regulations 2021, Second Schedule, checked 18 Nov 2026 |
| Changes to registered particulars notified to the ODPC within 14 days | 3 | event-driven | ODPC_REGISTRATION | 5 | Attestation | Registration Regulations 2021 reg 15; Data Protection Act s 19(5), checked 18 Nov 2026 |
| ODPC register is a public document, list published every 30 days | 3 | — | — | — | Note: open to inspection by any person (s 21(3)); the ODPC publishes a list of registered controllers and processors on its website every 30 days (reg 14(2)) | Data Protection Act s 21; Registration Regulations 2021 reg 14, checked 18 Nov 2026 |
| ODPC published list of registered data handlers as an import | 3 | S2 | ODPC_REGISTRATION | 3 | Candidate official list import. Format, fields and search are **[verify]**: the page returned a bot check. The registration portal needs a login | **[verify]**: https://www.odpc.go.ke/registered-data-handlers/: official page not readable by our tool on 18 Nov 2026; https://dataportal.odpc.go.ke/, checked 18 Nov 2026 (login only) |
| Privacy notice tells people what section 29 requires before collection | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `transfers_section`, `retention_statement`. Section 29 lists the data subject's rights, the purpose, third-party recipients and safeguards, contacts, security measures, whether supply is voluntary or mandatory, and consequences of not supplying | Data Protection Act s 29, checked 18 Nov 2026 |
| Privacy notice names the ODPC as the complaint route | 3 | S2 | WEBSITE / APP | 1 | `web.policy.dpa_named`. A data subject may complain to the Data Commissioner (s 56). That the notice must name the ODPC is **[verify]**: s 29 does not list it | Data Protection Act ss 29, 56, checked 18 Nov 2026 |
| Consent provable and withdrawable at any time | 3 | S2 | PERSONAL_DATA | 5 | Attestation. The controller or processor bears the burden of proof; withdrawal does not undo earlier lawful processing; consent is not free if a contract is made conditional on unnecessary processing | Data Protection Act s 32, checked 18 Nov 2026 |
| Children's data: parent or guardian consent and age verification | 3 | S2 | CONSUMER (services used by children) | 1 / 5 | `web.policy.children_section` shows a children section exists; adequacy needs review. Processing must protect the child's best interests (s 33(1)(b)) | Data Protection Act s 33, checked 18 Nov 2026 |
| Data protection officer is optional; contact published if one is designated | 3 | S2 | PERSONAL_DATA | 1 + 5 | `web.policy.dpo_contact`; Attestation. Section 24(1) says a controller or processor "may" designate one in the listed cases (public or private body, systematic monitoring, sensitive data). If designated, publish contact details on the website and give them to the Data Commissioner (s 24(6)) | Data Protection Act s 24, checked 18 Nov 2026 |
| Impact assessment before high-risk processing, report 60 days ahead | 3 / 6 | S2 | PERSONAL_DATA | 5 | Attestation. High-risk cases include automated decisions with legal effect, large-scale processing, biometric or genetic data, children, combining datasets and innovative technology (General Regulations reg 49). Consult the Data Commissioner if high risk remains (s 31(3)) | Data Protection Act s 31; General Regulations 2021 regs 49-51: https://www.odpc.go.ke/wp-content/uploads/2024/03/THE-DATA-PROTECTION-GENERAL-REGULATIONS-2021-1.pdf, checked 18 Nov 2026 |
| Breach reported to the Data Commissioner within 72 hours | 3 | S2 | PERSONAL_DATA | 5 | Attestation. Where there is a real risk of harm; reasons needed if late; tell affected people in writing within a reasonably practical period; a processor tells the controller within 48 hours where practicable | Data Protection Act s 43, checked 18 Nov 2026 |
| Transfers out of Kenya need proof of safeguards or a listed necessity | 3 | S2 | PERSONAL_DATA | 1 / 5 | `web.policy.transfers_section`; Attestation for the proof given to the Data Commissioner (s 48). Sensitive data needs the data subject's consent and confirmed safeguards (s 49) | Data Protection Act ss 48, 49, checked 18 Nov 2026 |
| Local server or data centre for prescribed kinds of processing | 3 | — | PERSONAL_DATA | — | Note: the Cabinet Secretary may prescribe processing that must run on a server or data centre in Kenya (s 50). What has been prescribed is **[verify]** | Data Protection Act s 50, checked 18 Nov 2026 |
| Commercial use and direct marketing need consent and an opt-out | 3 / 4 | S3 | PERSONAL_DATA | 5 | Attestation. Commercial use needs express consent or a written-law basis (s 37). Each direct marketing message offers a free way to opt out (General Regulations regs 15-17) | Data Protection Act s 37; General Regulations 2021 regs 14-17, checked 18 Nov 2026 |
| No Kenyan cookie-specific consent rule found | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count`, `cookie_policy_found` as signals only. Absence of a cookie rule, and how the Data Protection Act consent rules apply to cookies, are **[verify]** | **[verify]**: no official page states this |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Company KRA PIN registered on iTax | 3 | S2 | ALL | 4 | Slot: KRA PIN certificate. A person who has or expects an income tax liability must register. Companies apply on iTax with business registration details and directors' PINs and ID numbers | https://www.kra.go.ke/business/companies-partnerships/companies-partnerships-pin-taxes/companies-partnerships-pin-registration, checked 18 Nov 2026 |
| VAT registration within 30 days once taxable supplies reach KES 5 million in 12 months | 3 | S3 | ALL | 4 | Slot: VAT registration certificate (displayed at the business, s 35). Applies to supplies made or expected; capital assets and supplies on selling or closing the business are excluded (s 34(2)); voluntary registration possible (s 34(3)). Turnover is not public, so "not registered" is a gap only if the company says it passed the threshold | VAT Act 2013 s 34 (Rev. 2021): https://www.kra.go.ke/images/publications/VAT-Act--2013-Revised-2021.pdf, checked 18 Nov 2026; https://www.kra.go.ke/individual/filing-paying/types-of-taxes/value-added-tax, checked 18 Nov 2026 |
| VAT return and payment by the 20th of the following month | 3 | S3 | ALL (VAT registered) | 5 | Attestation. Filed on iTax | https://www.kra.go.ke/individual/filing-paying/types-of-taxes/value-added-tax, checked 18 Nov 2026 |
| eTIMS onboarding and electronic tax invoices | 3 | S3 | ALL | 5 | Attestation. KRA says all persons in business must onboard eTIMS and issue electronic tax invoices, VAT registered or not. Where the seller is a small business with turnover up to KES 5 million, the buyer may issue the invoice for it | https://www.kra.go.ke/helping-tax-payers/faqs/learn-about-etims, checked 18 Nov 2026 |
| eTIMS legal basis in the Tax Procedures Act | 3 | — | — | — | Note: the KRA page does not name the section. Section 23A of the Tax Procedures Act and the 2024 Electronic Tax Invoice Regulations are **[verify]** | **[verify]**: official text not read |
| Company income tax return within 6 months of year end | 3 | S3 | ALL | 5 | Attestation. IT2C on iTax; 30 June for a calendar year; resident rate 30% | https://www.kra.go.ke/business/companies-partnerships/companies-partnerships-pin-taxes/companies-partnerships-file-pay, checked 18 Nov 2026 |
| Instalment tax on the 20th of months 4, 6, 9 and 12 | 3 | S3 | ALL (expected liability over KES 40,000) | 5 | Attestation. 25% each; balance due by the last day of the 4th month after year end | Same KRA page, checked 18 Nov 2026 |
| PAYE employer registration and monthly return by the 9th | 3 | S2 | EMPLOYEES | 5 | Attestation. Anyone paying emoluments registers for PAYE; remit and file by the 9th of the following month, nil return if none | https://www.kra.go.ke/individual/filing-paying/types-of-taxes/paye, checked 18 Nov 2026 |
| Affordable Housing Levy: 1.5% employee plus 1.5% employer | 3 | S2 | EMPLOYEES | 5 | Attestation. Declared on sheet M of the PAYE return; due by the 9th working day after the month end; KRA collects from 19 March 2024 under the Affordable Housing Act 2024 | https://www.kra.go.ke/news-center/public-notices/2099-collection-of-the-affordable-housing-levy-by-kenya-revenue-authority-2, checked 18 Nov 2026 |
| SHIF contributions deducted and remitted by the 9th | 3 | S2 | EMPLOYEES | 5 | Attestation. Under the Social Health Insurance Act No. 16 of 2023; SHA cites the SHIF Regulations 2024 clause 16(1) for the date and a 2% monthly penalty on late amounts. Employer portal: employers.sha.go.ke | SHA public notice: https://new.sha.go.ke/wp-content/uploads/2025/07/PUBLIC_NOTICE_ON_EMPLOYER_REMITTENCES.pdf, checked 18 Nov 2026 |
| SHIF contribution rate 2.75% | 3 | — | — | — | Note: rate and whether an employer share exists are **[verify]**; not read on an official page | **[verify]**: not read |
| NSSF employer and employee registration, contributions by the 9th | 3 | S2 | EMPLOYEES | 5 | Attestation. All employees, casual or permanent, registered with NSSF; monthly contributions by the 9th of the following month; late payment penalised | https://www.nssf.or.ke/employers, checked 18 Nov 2026 |
| NSSF 2026 contribution rates and earnings limits | 3 | — | — | — | Note: a "Year 4 (2026)" rates notice was posted 18 Feb 2026 as an image our tool could not read. Rates, lower and upper earnings limits are **[verify]** | **[verify]**: https://www.nssf.or.ke/notice-to-employers-year-4-2026-nssf-contribution-rates: notice image not readable by our tool on 18 Nov 2026 |
| NITA industrial training levy | 3 | S2 | EMPLOYEES | 5 | Attestation. Whether it applies and the amount are **[verify]** | **[verify]**: not read |
| Written employment contract for work of 3 months or more | 3 | S2 | EMPLOYEES | 4 | Slot: employment contracts. Employment Act 2007 s 9 per our brief **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 (labour.go.ke and Kenya Law) |
| Statement of employment particulars | 3 | S2 | EMPLOYEES | 4 | Slot: employment contracts. Employment Act 2007 s 10 per our brief **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 |
| Minimum wage orders | 3 | S2 | EMPLOYEES | — | Trigger only. Which order applies and current rates are **[verify]** | **[verify]**: not read |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Payment service provider authorisation from CBK | 3 | S2 | SECTOR.PAYMENTS | 4 | Slot: CBK authorisation. Under the National Payment System Act 2011 and Regulations 2014 (e-money issuer, small money issuer, electronic retail transfers). CBK publishes a directory of authorised PSPs (dated 10 Aug 2026); an import is not built | https://www.centralbank.go.ke/national-payments-system/, checked 18 Nov 2026 |
| Digital credit provider licence from CBK | 3 | S2 | SECTOR.CREDIT | 4 | Slot: CBK licence. CBK licenses digital credit providers under s 59(2) of the Central Bank of Kenya Act and publishes a directory; an import is not built | https://www.centralbank.go.ke/2023/01/30/licensing-of-digital-credit-providers-january-2023/, checked 18 Nov 2026 |
| Virtual asset service provider licence from CBK or CMA | 3 | S2 | SECTOR.CRYPTO | 4 | Slot: licence. Virtual Asset Service Providers Act No. 20 of 2025 in force from 4 Nov 2025; CBK and CMA license by the services in its First Schedule. On 18 Nov 2025 neither had licensed any VASP, pending regulations | CBK public notice of 18 Nov 2025: https://www.centralbank.go.ke/uploads/press_releases/665231223_Public%20Notice%20on%20the%20Virtual%20Assets%20Service%20Providers%20Act%202025.pdf, checked 18 Nov 2026 |
| VASP Regulations 2026 and current licensing status | 3 | — | SECTOR.CRYPTO | — | Note: regulations made in 2026, the split between CBK and CMA, and any transition deadline for existing providers are **[verify]** | **[verify]**: not read on an official page |
| Communications Authority licence for telecoms or ICT services | 3 | S2 | SECTOR.TELECOMS | 4 | Slot: CA licence. Which services need one under the Kenya Information and Communications Act is **[verify]** | **[verify]**: not read |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Company name and prescribed information displayed and stated in communications | 4 | S2 | WEBSITE | 1 / 5 | `web.policy.legal_notice_present`, `registration_number_shown`, `names_company` as presence signals; Attestation for the rest. Fine up to KES 500,000 and a civil claim for loss (s 67(4)-(5)) | Companies Act 2015 s 67: https://brs.go.ke/wp-content/uploads/2023/03/CompaniesAct17of2015.pdf, checked 18 Nov 2026 |
| Which information section 67 prescribes for websites | 4 | — | — | — | Note: set by regulations (s 67(2)). Whether the Companies (General) Regulations 2015 require the registration number and registered office on a website is **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 (Kenya Law) |
| Internet agreement disclosure before the consumer contracts | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.terms_found`; content checked in review. Consumer Protection Act 2012 internet-agreement sections and their numbers are **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 (Kenya Law) |
| Consumer right to cancel an internet agreement | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.refund_policy_found`. Cancellation periods and sections under the Consumer Protection Act 2012 are **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 |
| No false or misleading representations to consumers | 4 | S3 | CONSUMER | 5 | Attestation. Competition Act s 55 as explained by the Competition Authority, including online advertising and statements | CAK Consumer Protection Guidelines (rev. Dec 2017): https://cak.go.ke/arch/sites/default/files/guidelines/consumer-protection/Consumer%20Protection%20Guidelines.pdf, checked 18 Nov 2026 |
| No unconscionable conduct towards consumers | 4 | S3 | CONSUMER | 5 | Attestation. Competition Act ss 56 and 57 as explained in the same guidelines | Same CAK guidelines, checked 18 Nov 2026 |
| Complaints page and accessibility statement | 4 | S3 | WEBSITE / APP | 1 | `web.policy.complaints_policy_found`, `accessibility_found`. Presence only; a Kenyan duty to publish either is **[verify]** | **[verify]**: not read |
| Electronic transactions and cybercrime laws | 4 | S2 | WEBSITE / APP | — | Trigger only. Kenya Information and Communications Act (electronic transactions) and Computer Misuse and Cybercrimes Act 2018 duties are **[verify]** | **[verify]**: not read |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Directors' authority to allot shares | 5 | S4 | INVESTED | 4 | Slot: board resolution, plus the authorising company resolution where needed. With only one class of shares, directors may allot unless the articles prohibit it (s 328); otherwise they need authorisation by resolution (s 329) | Companies Act 2015 ss 327-329: https://brs.go.ke/wp-content/uploads/2023/03/CompaniesAct17of2015.pdf, checked 18 Nov 2026 |
| Allotment registered within two months | 5 | S4 | INVESTED | 5 | Attestation. Fine up to KES 500,000 | Companies Act 2015 s 332, checked 18 Nov 2026 |
| Return of allotment with a statement of capital within one month | 5 | S4 | INVESTED | 4 | Slot: lodged return of allotment. The statement of capital gives total shares, nominal value, class rights and amounts paid and unpaid | Companies Act 2015 s 333, checked 18 Nov 2026 |
| Shares have a fixed nominal value in shillings | 5 | S4 | INVESTED | 5 | Attestation. An allotment that breaks this is void (s 324(3)) | Companies Act 2015 s 324, checked 18 Nov 2026 |
| Members register updated and lodged within 14 days after the issue | 5 | S4 | INVESTED | 5 | Attestation (see Section 2) | Companies Act 2015 s 93(9), checked 18 Nov 2026 |
| Private company may not offer its securities to the public | 5 | S4 | INVESTED | 5 | Attestation that the round was not a public offer | Companies Act 2015 s 511(1), checked 18 Nov 2026 |
| Public offer and prospectus under the Capital Markets Act | 5 | S4 | INVESTED (offer to the public) | — | Trigger only. Thresholds and exemptions are **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 (cma.or.ke) |
| Investment-based crowdfunding regulations 2022 | 5 | S4 | INVESTED (crowdfunding) | — | Trigger only. Eligibility, caps and platform licensing are **[verify]** | **[verify]**: official page not readable by our tool on 18 Nov 2026 (cma.or.ke) |

### Section 11 — AI

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| No Kenyan AI act in force found | 6 | — | AI | — | Note: our searches found no AI statute in force on 18 Nov 2026. Absence is **[verify]** | **[verify]**: no official page states this |
| Kenya National AI Strategy 2025 is policy, not law | 6 | — | AI | — | Note: status and content **[verify]**; not read on an official page | **[verify]**: not read |
| ODPC guidance note on AI (July 2026) | 6 | — | AI, PERSONAL_DATA | — | Note: a guidance note is listed on odpc.go.ke but the file returned HTTP 404. Content and status **[verify]** | **[verify]**: https://www.odpc.go.ke/wp-content/uploads/2026/07/AI-Guidance-Note.July-2026.pdf: official page not readable by our tool on 18 Nov 2026 |
| Right not to be subject to solely automated decisions with significant effect | 6 | S3 | AI, PERSONAL_DATA | 5 | Attestation. Exceptions: necessary for a contract, authorised by law with safeguards, or based on consent (s 35(2)) | Data Protection Act s 35: https://www.odpc.go.ke/wp-content/uploads/2024/02/TheDataProtectionAct__No24of2019.pdf, checked 18 Nov 2026 |
| Profiling or new-technology processing triggers an impact assessment | 6 | S3 | AI, PERSONAL_DATA | 5 | Attestation (see Section 6). Listed high-risk cases include automated decision-making with profiling or algorithmic means and innovative use of new technology | General Regulations 2021 reg 49(1)(a), (i), checked 18 Nov 2026 |
| AI Act obligations when selling AI into the EU | 6 | S3 | AI, EU_MARKET | 5 | Attestation. Refer to "EU Section 7 — AI Act". Reaches a Kenyan company only through the EU market | EU common map |
| AI use disclosed on the website | 6 | S3 | AI, WEBSITE | 1 | `web.policy.ai_disclosure_found`. Presence only; a Kenyan legal duty to disclose AI use is **[verify]** | EU common map (scan behaviour) |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above.

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Annual return | Section 3 | Within 28 days after each anniversary of incorporation | Attestation; filing receipt upload |
| Financial statements to the Registrar | Section 3 | 9 months after the accounting reference period ends | Attestation; filing receipt upload |
| Beneficial-owner and members register changes | Section 2 | Within 14 days of amending the register | Attestation |
| ODPC certificate renewal | Section 6 | Every 24 months from issue | Attestation; certificate date |
| ODPC change of particulars | Section 6 | Within 14 days of a change | Attestation |
| PAYE, NSSF and SHIF | Section 7 | Monthly, by the 9th of the following month | Attestation |
| Affordable Housing Levy | Section 7 | Monthly, by the 9th working day after month end | Attestation |
| VAT return | Section 7 | Monthly, by the 20th of the following month | Attestation |
| Instalment tax | Section 7 | 20th of months 4, 6, 9 and 12 of the accounting period | Attestation |
| Company income tax return | Section 7 | 6 months after year end | Attestation |
| Return of allotment | Section 10 | Within one month of each allotment | Attestation; return upload |
| Trademark renewal | Section 5 | Period **[verify]** | Attestation; certificate date |

---

## 4. Counts by tier

| Tier | Items | What this means |
|---|---|---|
| 1 Official live or URL scan | 12 (6 pure; 6 mixed 1 / 5 or 1 + 5) | Website scan only: privacy notice and its sections, ODPC named, children, DPO contact, transfers, cookies, imprint, terms, refunds, complaints, accessibility, AI disclosure, plus the LEI record. No Kenyan register is wired |
| 2 Licensed vendor | 0 | Not used: commercial BRS resellers exist but are not official |
| 3 Official list import | 2 | Sanctions lists; the ODPC published list as a candidate (bot-protected today) |
| 4 Document-verified | 26 (1 mixed 4 / 5) | Certificate of incorporation, CR12, articles, register filings, annual return, accounts, auditor's report, ODPC certificate, KRA PIN and VAT certificates, employment contracts, licences, allotment returns |
| 5 Attested | 34 | Registered office, registers, consent, impact assessments, breaches, tax and payroll filings, consumer conduct, IP, fundraising formalities |
| Notes and trigger-only lines (no tier) | 27 | Context lines a rule can quote, not checks |

Total in Sections 1–11: 101 lines (74 checkable items, 27 notes and trigger-only lines). 32 of them carry **[verify]**, plus 1 calendar line in Section 12.

Rows per section: S1 7 · S2 8 · S3 6 · S4 10 · S5 6 · S6 19 · S7 17 · S8 5 · S9 8 · S10 8 · S11 7 (Section 12: 12 calendar lines).

---

## 5. The core set every Kenyan tech company must show at Stage 2

1. Incorporated by the Registrar through BRS, name ending "limited" or "ltd." (Tier 4: certificate of incorporation).
2. At least one director, at least one of them a natural person, all at least 18 (Tier 4: CR12; Tier 5).
3. A company secretary if paid-up capital is KES 5 million or more (Tier 4 / 5).
4. Register of members and register of beneficial owners kept, and copies lodged with the Registrar within 30 days (Tier 4 / 5).
5. Annual return lodged within 28 days after each return date (Tier 4).
6. ODPC registration unless both below KES 5 million turnover and under 10 employees and outside the Third Schedule; certificate renewed every 24 months (Tier 4).
7. Privacy notice giving the section 29 information on the website (Tier 1, WEBSITE).
8. Company KRA PIN; PAYE, NSSF, SHIF and Housing Levy set up once there are employees (Tier 4 / 5).
9. Founders' and contractors' IP assigned in writing (Tier 5).

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

- Amendments to the Companies Act 2015, the Data Protection Act 2019 and the 2021 Registration Regulations made after the editions read (Rev. 2021, 2019 Gazette text, 2021 Legal Notice).
- Beneficial owner thresholds (10% of shares and votes) in the 2020 principal Regulations (L.N. 12 of 2020).
- Whether a private company must hold an AGM (s 310 covers public companies only), and the private-company auditor appointment rules (ss 717-719).
- That no director residency or nationality rule applies.
- What Companies Act s 67 and the Companies (General) Regulations 2015 require a website to show.
- Employment Act 2007 ss 9 and 10 (written contract, particulars), minimum wage orders and the NITA levy.
- SHIF rate (2.75%) and any employer share; NSSF 2026 rates and earnings limits.
- eTIMS legal basis (Tax Procedures Act s 23A and the 2024 regulations).
- Industrial Property Act 2001 employee-invention rule; Trade Marks Act term and renewal.
- Whether Copyright Act s 31(1)(a) covers contractors' software, and the assignment formalities.
- Consumer Protection Act 2012 internet-agreement disclosure and cancellation sections.
- Whether naming the ODPC in a privacy notice is required; whether any processing has been prescribed for local servers (s 50); how consent rules apply to cookies.
- Capital Markets Act public-offer thresholds; crowdfunding regulations 2022; VASP Regulations 2026 and licensing status; Communications Authority licensing triggers.
- Kenya's AI position: no AI act, the National AI Strategy 2025 status, and the ODPC AI guidance note (July 2026).
- The ODPC published list: format, fields and whether it can be read without a bot check; the eCitizen API reference (HTTP 503 on 18 Nov 2026).
- Kenya's national sanctions regime, if a Kenya-specific list is wanted.

---

## Not encoded (18 Nov 2026)

Rule pack `packages/rules/src/packs/ke.ts`, version 0.1.0 (draft): 40 Kenyan rules, with the International pack after them. No Kenyan register is connected, so no rule reads a register fact and none is "critical". No rule rests on a [verify] line. ODPC registration is proved by its certificate (`ke_odpc_certificate`), because the ODPC's public list returned a bot check. Website rules fail only when `web.policy.language_supported` is true.

| Item | Section | Why |
|---|---|---|
| Official search (CR12) | Section 1 | An evidence route, used as the `ke_cr12` slot, not a duty |
| Sanctions screening; LEI | Section 1 | Covered by the International pack; sanctions is [verify] |
| BO test; BO not published | Section 2 | Notes; the 10% test is [verify] |
| Annual return contents; small company test; AGM for public companies | Section 3 | Notes; the AGM line is [verify] |
| No residency rule; members' 10% audit right; auditor appointment and term | Section 4 | Notes, or [verify] |
| Commissioned works; copyright reform bill | Section 5 | Notes |
| Contractors and founders assign IP; employee inventions; KIPI trade marks | Section 5 | [verify]; assignments are covered by `INTL.IP.OWNER_ASSIGNMENT` and `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| Fees; public register every 30 days; ODPC list as an import | Section 6 | Notes; the import is [verify] (bot check) and not built |
| Privacy notice names the ODPC | Section 6 | [verify]: s 29 does not say so |
| DPO optional | Section 6 | Optional, so nothing can fail |
| Local server rule; cookies | Section 6 | [verify] |
| eTIMS legal basis; SHIF rate; NSSF 2026 rates; NITA levy | Section 7 | [verify]; `KE.TAX.ETIMS` rests on the clean KRA line and states no section |
| Written contract; particulars; minimum wage | Section 7 | [verify]: the Employment Act was not readable |
| VASP Regulations 2026; Communications Authority licence | Section 8 | [verify] |
| Section 67 website details; internet agreements; cancellation; complaints and accessibility; cybercrime law | Section 9 | [verify] |
| Shares with a fixed nominal value | Section 10 | A detail of the allotment rules, left for the lawyer to choose |
| Capital Markets Act; crowdfunding | Section 10 | [verify] |
| AI act, strategy and ODPC AI note | Section 11 | Notes, [verify] |
| AI Act through the EU market; AI use disclosed | Section 11 | No fact says the company sells into the EU; the disclosure duty is [verify] (`INTL.AI.TRANSPARENCY` covers it) |
| Compliance calendar | Section 12 | Not items. Statements (9 months), income tax (6 months) and the ODPC certificate (24 months) are on their rules |
