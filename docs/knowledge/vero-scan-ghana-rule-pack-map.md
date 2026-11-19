# Vero Scan — Ghana Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 18 November 2026
**Sources:** Official legislation, government and regulator pages only (Office of the Registrar of Companies, Data Protection Commission, Ghana Revenue Authority, SSNIT, Cyber Security Authority, Bank of Ghana, Securities and Exchange Commission, the Parliament of Ghana repository, the Information Services Department). Act texts were read from PDFs hosted by a government body (ORC, CSA, Parliament). Each line gives its URL and the date checked. Secondary sources (law-firm notes, news sites, vendor blogs) were used only to find the official page and are never cited.
**Company form covered:** private company limited by shares under the Companies Act, 2019 (Act 992).
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Lines marked **[verify]** must not be encoded as a pass/fail rule until the uncertainty named on the line is resolved.

**Ghana is not in the EU or the EEA.** No line in this map points to `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, except the AI line in Section 11, which reaches a Ghanaian company only when it sells AI into the EU market.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Ghanaian private company limited by shares at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Sells to consumers (B2C) |
| ONLINE_SALES | Sells goods or services through an electronic transaction (Electronic Transactions Act, Part on consumer protection) |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| EU_MARKET | Places products or services on the EU market (matters only for EU rules such as the AI Act) |
| SECTOR.PAYMENTS, .EMONEY, .CRYPTO, .CYBERSECURITY, .CROWDFUNDING | Sector packs (Bank of Ghana, SEC, Cyber Security Authority licences), triggers only |
| INVESTED | Has raised or is raising |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a document slot) · 5 attested (vault). Routes follow the *Verification Solutions Matrix* (`docs/knowledge/vero-scan-verification-solutions.md`).

**[verify]** means: not confirmed from an official source on 18 Nov 2026. The line says exactly what is uncertain. A threshold, deadline or section number marked [verify] is a lead, not a fact.

**Source column.** "checked 18 Nov 2026" appears only where the page was read on that day. A page our tool could not read is marked **[verify]: official page not readable by our tool on 18 Nov 2026**.

### Engine facts available for Ghana

**No Ghanaian register fact exists today.** The engine has no ORC, DPC, GRA or SSNIT connector, so every corporate, tax and registration item below is a document slot or an attestation until one is built. A future DPC register import is possible (see note 2 below); it is not built.

| Fact key(s) | What it can show | What it cannot show |
|---|---|---|
| `registry.global.gleif.*` | The LEI record, if any | Anything about Ghanaian law, or that the company is registered with the ORC |
| `registry.sanctions.match`, `possible_match`, `lists_checked` | Company name screened against the stored sanctions lists | That the company is or is not sanctioned (a person must check) |
| `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `retention_statement`, `transfers_section`, `dpo_contact`, `children_section` | Privacy notice and its main sections | Legal adequacy under Act 843 |
| `web.policy.dpa_named` | The privacy notice names the data protection authority. The scan recognises dataprotection.org.gh | The DPC moved to dpc.gov.gh (see note 3); a notice naming only the new domain may be missed |
| `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count`, `cookie_policy_found` | Cookie banner and cookie behaviour before consent | That Ghanaian law requires a banner (no cookie rule found) |
| `web.policy.terms_found`, `refund_policy_found`, `complaints_policy_found` | Terms, refund and complaints pages exist | That their content meets the Electronic Transactions Act |
| `web.policy.legal_notice_present`, `registration_number_shown` | A legal-notice block and a registration number appear on the site | That the number is the company's real ORC number |
| `web.policy.accessibility_found`, `ai_disclosure_found` | Accessibility statement and AI disclosure exist | That Ghanaian law requires them |
| `web.policy.language_supported` | The scan could read the site's language (English is read) | Anything about the law |
| `github.*` | Repository licence files and dependency manifests, if GitHub is connected | Who owns the code |

**Not available for Ghana:** `registry.eu.vies_vat.*` (VIES covers EU member states only) and any Ghanaian register fact (ORC, DPC, GRA, SSNIT).

---

## 2. Notes for the reviewing lawyer

1. **ORC register access (no API found).** The ORC website offers an online name search that its own notices describe as limited: it shows only names of registered companies, not owners or officers (ORC FAQ; ISD notice of 30 March 2026). A fuller "Entity Information Search" is listed as an ORC service (structure, status, ownership, addresses, financial statements, beneficial ownership, officers), but the page states no fee, no eligibility rule, no online route and no API; its "E-Portal" link has no target. On 30 March 2026 the ORC suspended parts of its online portal after an audit found unauthorised use of access points; the public was told to make formal written requests for detailed company information, answered within three working days. We found no publicly documented ORC API, developer page or bulk data offer on 18 Nov 2026. Act 992 s 373(3)(c) requires the Registrar to make an electronic format of the Central Register (beneficial ownership) available to the public "in line with open data best practices"; we found no such public service online. Several ORC pages returned "not found" to our tool on 18 Nov 2026 (fees, annual-returns service page, 2026 news items), so fees and current deadlines are [verify].
2. **DPC public register exists and is machine-readable in practice.** `https://app.dpc.gov.gh/register-of-controllers` is a public, paginated HTML table (company name, status, expiry date; 20 rows a page, `?page=N`, 1,036 results on 18 Nov 2026), with status filters and a search box. No login wall and no CAPTCHA were seen; no CSV, JSON or API is offered; the site terms say nothing about automated access or reuse. A verification hub (`https://app.dpc.gov.gh/check-register`) checks a DPC reference, an organisation name, a Privacy Seal, a Data Protection Supervisor ID and training institutions. Act 843 s 54 obliges the DPC to make the register available for public inspection. This could become a Tier 3 import with a `registry.gh.dpc.*` fact; it is not built, and we did not download it. A miss on this register should read "not found", never "not registered".
3. **The DPC changed domain.** `www.dataprotection.org.gh` now shows a maintenance notice pointing to `dpc.gov.gh`. The `web.policy.dpa_named` matcher recognises dataprotection.org.gh only; it should also accept dpc.gov.gh and the Commission's name.
4. **Two director residency rules.** Act 992 s 171(1) requires at least two directors, one "ordinarily resident in Ghana"; s 182(1) requires at least one director to be "resident in the Republic" at all times, and makes the company's contract rights unenforceable while that is not so (court relief possible). The brief cited s 172; s 172 is about appointment and the statutory declaration.
5. **Company name ending.** Act 992 s 21(1)(a) says a private company limited by shares ends its name with "Limited Company" or "LTD". The brief's "Limited/Ltd" is close but not the statutory wording; the lawyer should say whether "X Limited" passes.
6. **Beneficial-ownership timing differs between the Act and the ORC FAQ.** The Act works in 28-day steps (s 35(2)(b), (5), (6)); the ORC FAQ says "within 30 days" of a change. Encode the Act's 28 days only after the lawyer confirms.
7. **No audit exemption found.** Act 992 s 128(1)(c) requires an auditors' report with the yearly financial statements, and we found no small-company exemption in the Act's text. The Companies Regulations, 2023 were not read.
8. **Annual return timing is tied to the accounts, not an anniversary.** Act 992 s 126(3): within 36 days after the financial statements and reports are sent to members. The ORC publishes a yearly filing deadline by notice (reported as 30 April 2026, extended to 30 June 2026); we could not read those notices.
9. **Copyright Act s 7 covers commissioned works.** Economic rights in a work made in the course of employment *or commission* vest in the employer or commissioner, unless a contract says otherwise. This reaches contractors further than the Norwegian rule, but written assignments are still the safe route.
10. **VAT threshold.** GRA confirms GHS 750,000 for businesses dealing in goods under the VAT Act, 2025 (Act 1151), from 1 January 2026. The rule for service providers is not stated on the GRA page we read.
11. **AI:** no Ghanaian AI act found in force on 18 Nov 2026. Act 843 s 41 already gives individuals a right to object to decisions based solely on automated processing.

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Incorporated by the Registrar of Companies under Act 992 | 1 | S2 | ALL | 4 | Slot: certificate of incorporation. No Ghanaian register fact exists; the ORC online name search shows names only | Act 992 ss 13-14: https://orc.gov.gh/legislation/Act-992.pdf, checked 18 Nov 2026 |
| Name ends with "Limited Company" or "LTD" | 1 | S2 | ALL | 4 | Slot: certificate of incorporation shows the registered name. The Registrar may refuse misleading names and names of companies dissolved in the last five years | Act 992 s 21(1)(a), (2), (3), checked 18 Nov 2026 |
| Registered office, phone and postal or digital address within 28 days of incorporation | 1 | S2 | ALL | 5 | Attestation. Also an email address and the website if any (s 122(1)(b)). Changes notified within 28 days (s 123(2)). Daily penalty of 25 penalty units for default | Act 992 ss 122-123, checked 18 Nov 2026 |
| Name painted at offices and printed on letters, invoices and receipts | 1 | S2 | ALL | 5 | Attestation. Also on "any other publication of the company" and on cheques and orders | Act 992 s 125(1), checked 18 Nov 2026 |
| Company name on the website counts as a publication | 1 | S2 | WEBSITE | 1 | `web.policy.legal_notice_present`. That a website is a "publication" under s 125(1)(c) is our reading **[verify]** | Act 992 s 125(1)(c), checked 18 Nov 2026 |
| Not struck off by the Registrar as a non-operating company | 1 | S2 | ALL | 5 | Attestation. The Registrar writes twice (two months each), then gives three months' notice in the Companies Bulletin before striking off. No register fact can show this | Act 992 s 289(1)-(3), checked 18 Nov 2026 |
| Not in liquidation, administration or insolvency proceedings | 1 | S2 | ALL | 5 | Attestation. The grounds and register states under the Corporate Insolvency and Restructuring Act, 2020 (Act 1015) are not mapped **[verify]**: Act 1015 not read | **[verify]**: Act 1015 not read (listed at https://orc.gov.gh/legislations.php, checked 18 Nov 2026) |
| Company name checked against sanctions lists | 3 | S2 | ALL | 3 | `registry.sanctions.match`, `possible_match`, `lists_checked`. International pack item; Ghana's own sanctions regime is not mapped here **[verify]** | `docs/GLOBAL-COVERAGE.md` (engine behaviour, not law) |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Registered constitution is optional; otherwise the Second Schedule applies | 1 | S2 | ALL | 4 | Slot: registered constitution, if the company has one. Without one, the Second Schedule of Act 992 is deemed to be the constitution of a private company | Act 992 ss 23(1), 25(1): https://orc.gov.gh/legislation/Act-992.pdf, checked 18 Nov 2026 |
| Register of members kept in Ghana, entries within 28 days | 1 | S2 | ALL | 5 | Attestation, or Slot: register of members. Names, addresses, shares held and paid, date of entry, nature of interest, date of leaving. Entries within 28 days of the membership agreement or of leaving | Act 992 s 35(1)(a), (3), (4), checked 18 Nov 2026 |
| Beneficial-owner particulars held in the register of members | 1 | S2 | ALL | 5 | Attestation. Full name, birth date and place, phone, nationality and ID, addresses, workplace, nature of interest, and whether a politically exposed person. A member who is not the beneficial owner must give the particulars on joining | Act 992 s 35(1)(b), (2)(a), checked 18 Nov 2026 |
| Beneficial owners filed with the Registrar at incorporation | 1 | S2 | ALL | 4 | Slot: ORC beneficial-ownership filing. New companies give BO details during registration (ORC FAQ); the Registrar enters incorporation particulars in the Central Register (s 373(2)(b)(i)) | Act 992 s 373(2), checked 18 Nov 2026; https://orc.gov.gh/faq.php, checked 18 Nov 2026 |
| Beneficial-owner changes reach the Registrar in 28-day steps | 1 | event-driven | ALL | 5 | Attestation. The member updates the company within 28 days of a change (s 35(2)(b)); the company enters it within 28 days (s 35(5)); the company sends it to the Registrar within 28 days of the entry, flagging politically exposed persons (s 35(6)) | Act 992 s 35(2)(b), (5), (6), checked 18 Nov 2026 |
| ORC guidance gives 30 days for BO changes | 1 | event-driven | ALL | — | Note: the ORC FAQ says "within 30 days" of a change, against the Act's 28-day steps. Which figure to encode is **[verify]** | https://orc.gov.gh/faq.php, checked 18 Nov 2026 |
| Annual return includes beneficial-owner data | 1 | S3 | ALL | — | Note: the annual return covers every member and every beneficial owner (s 126(1)); the ORC FAQ says BO data has been required in annual returns since 31 March 2021 | Act 992 s 126(1), checked 18 Nov 2026; https://orc.gov.gh/faq.php, checked 18 Nov 2026 |
| Central Register of beneficial ownership kept by the Registrar | 1 | — | — | — | Note: the Registrar keeps it in manual and electronic form, shares it with authorities, and must make an electronic format public in line with open data best practice (s 373(3)(c)) | Act 992 s 373(1)-(3), checked 18 Nov 2026 |
| Public online BO register not found | 1 | — | — | — | Note: we found no public electronic BO register on the ORC site; whether one exists in practice is **[verify]**. Explains why BO stays Tier 4/5 | **[verify]**: no official page found on 18 Nov 2026 |
| Penalty for non-filing of beneficial ownership GHS 500 | 1 | — | — | — | Note: figure seen only in a search snippet of the ORC fee page **[verify]**: official page not readable by our tool on 18 Nov 2026 | **[verify]**: https://orc.gov.gh/fees.php: official page not readable by our tool on 18 Nov 2026 |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Proper accounting records kept | 1 | S2 | ALL | 5 | Attestation | Act 992 s 127(1): https://orc.gov.gh/legislation/Act-992.pdf, checked 18 Nov 2026 |
| Audited financial statements sent to members within 18 months, then yearly | 1 | S3 | ALL | 5 | Attestation. First set within 18 months of incorporation, then once every calendar year at intervals of no more than 15 months: financial statements, directors' report and auditors' report. The Registrar may extend the periods | Act 992 s 128(1), (4), checked 18 Nov 2026 |
| Annual general meeting each year, no more than 15 months apart | 1 | S3 | ALL | 4 | Slot: AGM minutes, or the written agreement to dispense with it. A first AGM within 18 months of incorporation covers the year of incorporation and the next. Held at least 21 days after the accounts are sent. Members and auditors may agree in writing to skip a year (s 157(5)) | Act 992 s 157(1)-(5), checked 18 Nov 2026 |
| Annual return to the Registrar every year, within 36 days of sending the accounts | 1 | S3 | ALL | 4 | Slot: filed annual return or ORC receipt. Not needed in the year of incorporation, or in a year ending less than 18 months after it if a return follows the first accounts. Signed by a director and the Company Secretary. No register fact can show the filing | Act 992 s 126(1)-(3), checked 18 Nov 2026 |
| Private company return carries the accounts and two certifications | 1 | S3 | ALL | 4 | Slot: same filing. Certifies no public invitation to buy shares or debentures or deposit money, and no more than 50 members and debenture holders (employees aside); attaches the financial statements and reports, or an auditors' statement that they were sent | Act 992 s 298(1)-(2), checked 18 Nov 2026 |
| Yearly ORC filing deadline, fee and late penalties | 1 | S3 | ALL | — | Note: reported 2026 deadline 30 April, extended to 30 June 2026; filing fee GHS 175; penalties GHS 1,000 (1-4 years in default) and GHS 2,000 (5+ years). All **[verify]**: the ORC notices and fee pages returned "not found" to our tool | **[verify]**: https://orc.gov.gh/service-filing-of-annual-returns.php and https://orc.gov.gh/fees.php: official pages not readable by our tool on 18 Nov 2026 |
| Registration of the return published in the Companies Bulletin | 1 | — | — | — | Note: the Registrar publishes a notice once the return is registered | Act 992 s 126(5), checked 18 Nov 2026 |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| At least two directors, one ordinarily resident in Ghana | 1 | S2 | ALL | 5 | Attestation per director (the engine keeps no names or addresses). Below two for more than four weeks: daily penalty, and directors and members who know are jointly liable for debts incurred | Act 992 s 171(1)-(3): https://orc.gov.gh/legislation/Act-992.pdf, checked 18 Nov 2026 |
| One director resident in the Republic at all times | 1 | S2 | ALL | 5 | Attestation. While no director is resident, the company cannot enforce contracts made in that time unless a court grants relief | Act 992 s 182(1)-(4), checked 18 Nov 2026 |
| Statutory declaration by each director before appointment | 1 | S2 | ALL | 4 | Slot: director's statutory declaration (no fraud or dishonesty charges or convictions in the previous five years, among other points), filed with the Registrar. First directors are named in the incorporation application | Act 992 s 172(1)-(2), checked 18 Nov 2026 |
| Director and secretary changes notified within 28 days | 1 | event-driven | ALL | 5 | Attestation. Daily penalty of 25 penalty units for default | Act 992 s 216(1)-(2), checked 18 Nov 2026 |
| Company Secretary appointed with a qualification listed in s 211 | 1 | S2 | ALL | 4 | Slot: secretary's written consent and qualification. Qualifications include a company-law professional or tertiary qualification, three years as a trainee, membership of ICSA or ICAG, a Ghanaian lawyer, or another qualification the directors judge adequate. May be a body corporate with a qualified person among its officers. Penalty after six months without one | Act 992 s 211(1)-(3), (6), (8), checked 18 Nov 2026 |
| Auditor appointed with written consent | 1 | S2 | ALL | 4 | Slot: auditor's consent and appointment. Directors may appoint the first auditor; afterwards by ordinary resolution. After three months with no auditor, the Registrar may appoint one | Act 992 s 139(1)-(4), checked 18 Nov 2026 |
| No small-company audit exemption in Act 992 | 1 | S2 | ALL | — | Note: we found no exemption in the Act's text, and s 128(1)(c) requires an auditors' report. Whether the Companies Regulations, 2023 or a later amendment add one is **[verify]** | Act 992 s 128, checked 18 Nov 2026; **[verify]**: Companies Regulations 2023 not read |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Copyright in employee and commissioned works vests in the employer or commissioner | 2 | S2 | EMPLOYEES, CONTRACTORS | 5 | Attestation. Economic rights vest in the employer or commissioner where the work was made in the course of employment or commission, unless a contract says otherwise. Computer programs are protected works | Copyright Act, 2005 (Act 690) s 7: https://repository.parliament.gh/handle/123456789/1785, checked 18 Nov 2026 |
| Founders and contractors still assign IP in writing | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Slot: IP assignment agreement. Whether s 7 "commission" covers a contractor writing software and founders' pre-incorporation work, and whether Act 690 was later amended, is our reading **[verify]** | Same act, checked 18 Nov 2026 |
| Employee inventions belong to the employer absent a contrary contract | 2 | S2 | EMPLOYEES | 5 | Slot: employment contract IP clause. Reported as Patents Act, 2003 (Act 657) s 4(5) **[verify]**: section and wording not read from an official Ghanaian text | **[verify]**: no official Ghanaian copy of Act 657 read on 18 Nov 2026 |
| Trademark registered with the Registrar-General's trade marks registry | 2 | S2 | ALL | 4 | Slot: registration certificate. Term of 10 years, renewable, under the Trade Marks Act, 2004 (Act 664) as amended in 2014 **[verify]**: the Parliament copy is a scanned image | **[verify]**: https://repository.parliament.gh/handle/123456789/2682: official page not readable by our tool on 18 Nov 2026 |

### Section 6 — Data protection and cookies

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Data controller registered with the Data Protection Commission before processing | 3 | S2 | PERSONAL_DATA | 4 | Slot: DPC registration certificate. An unregistered controller must not process personal data (s 53); processing without registration is an offence (fine up to 250 penalty units, prison up to two years, or both). Public register exists (note 2) but no engine fact yet | Data Protection Act, 2012 (Act 843) ss 27(1), 53, 56: https://orc.gov.gh/legislation/data-protection-act-2012-act-843.pdf, checked 18 Nov 2026; https://dpc.gov.gh/registration/, checked 18 Nov 2026 |
| DPC registration renewed every two years | 3 | S3 | PERSONAL_DATA | 4 | Slot: current certificate. The DPC public register shows an expiry date per entry; failure to renew can lead to removal from the register | Act 843 s 50, checked 18 Nov 2026; https://app.dpc.gov.gh/register-of-controllers, checked 18 Nov 2026 |
| DPC renewal window before expiry | 3 | S3 | PERSONAL_DATA | — | Note: the DPC page gives "three (3) months, six (6) weeks" before expiry and a close seven days after; the exact window is **[verify]** | https://dpc.gov.gh/registration/, checked 18 Nov 2026 |
| Changes to registered particulars notified within 14 days | 3 | event-driven | PERSONAL_DATA | 5 | Attestation | Act 843 s 55, checked 18 Nov 2026 |
| DPC fees by entity size | 3 | — | PERSONAL_DATA | — | Note: Small businesses and startups GHS 156; medium GHS 1,170; large GHS 2,340; specialised industries GHS 5,000 | https://dpc.gov.gh/help-faqs/, checked 18 Nov 2026 |
| Data processors also register with the DPC | 3 | S2 | PERSONAL_DATA (as processor) | 4 | Slot: DPC certificate. The DPC page says processors must register; Act 843 s 27 names data controllers only, so the legal basis for processors is **[verify]** | https://dpc.gov.gh/registration/, checked 18 Nov 2026 |
| Privacy notice covers the s 27(2) collection points | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `transfers_section`. The data subject must know the nature of the data, who collects it and their address, the purpose, whether it is mandatory and the consequences of refusal, recipients, and the right of access and correction | Act 843 s 27(2), checked 18 Nov 2026 |
| Privacy notice names the DPC as complaint route | 3 | S2 | WEBSITE / APP | 1 | `web.policy.dpa_named` (recognises dataprotection.org.gh; should also accept dpc.gov.gh). That Act 843 requires naming the DPC in the notice is **[verify]** | **[verify]**: no section found that requires it |
| Eight data protection principles applied | 3 | S2 | PERSONAL_DATA | — | Note for rule text: accountability, lawfulness, purpose specification, compatible further processing, quality of information, openness, security safeguards, data subject participation | Act 843 s 17, checked 18 Nov 2026 |
| Personal data kept no longer than necessary | 3 | S2 | PERSONAL_DATA | 1 / 5 | `web.policy.retention_statement` shows a statement exists; actual practice is attested. Exceptions: required by law, lawful purpose, contract, or consent | Act 843 s 24(1), checked 18 Nov 2026 |
| Technical and organisational security safeguards | 3 / 6 | S2 | PERSONAL_DATA | 5 | Attestation. Identify foreseeable risks, set safeguards, verify them regularly, keep them updated; processors must follow the same measures (s 30) | Act 843 ss 28, 30, checked 18 Nov 2026 |
| Security compromise notified to the DPC and the data subject | 3 / 6 | event-driven | PERSONAL_DATA | 5 | Attestation. As soon as reasonably practicable after discovery; by post, email, a prominent website notice or other listed means; delayed only if security agencies or the DPC ask | Act 843 s 31, checked 18 Nov 2026 |
| Prior written consent for direct marketing | 3 / 4 | S3 | PERSONAL_DATA, CONSUMER | 5 | Attestation. The data subject may also stop direct marketing at any time by written notice | Act 843 s 40, checked 18 Nov 2026 |
| Data protection supervisor is optional | 3 | S2 | PERSONAL_DATA | 5 + 1 | Attestation; `web.policy.dpo_contact`. A controller "may" appoint a certified and qualified supervisor. The DPC verifies supervisor IDs at app.dpc.gov.gh/verify-dps | Act 843 s 58(1)-(2), checked 18 Nov 2026; https://app.dpc.gov.gh/check-register, checked 18 Nov 2026 |
| Countries of transfer declared in the DPC application | 3 / 6 | S2 | PERSONAL_DATA | 1 / 4 | `web.policy.transfers_section`; Slot: DPC application. The application names any country the data may go to. Whether Act 843 restricts transfers beyond this is **[verify]** (not found in the text we read) | Act 843 s 47(1)(g), checked 18 Nov 2026 |
| No specific cookie rule in Ghanaian law | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count`, `cookie_policy_found` as good practice only. Whether Act 843 consent (s 20) reaches cookies is **[verify]** | **[verify]**: no official page found on 18 Nov 2026 |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Company registered with the GRA for tax | 3 | S2 | ALL | 4 | Slot: GRA registration or TIN evidence. GRA lists the certificate of incorporation, directors' Ghana Cards, location and financial statements as documents | https://gra.gov.gh/domestic-tax/tax-registration/, checked 18 Nov 2026 |
| Company TIN issued automatically through ORC registration | 3 | S2 | ALL | — | Note: whether the company TIN comes with ORC incorporation is **[verify]**; the GRA page does not say | **[verify]**: not stated on https://gra.gov.gh/domestic-tax/tax-registration/ |
| VAT registration for goods suppliers above GHS 750,000 | 3 | S3 | ALL (goods) | 4 | Slot: VAT registration certificate. Under the VAT Act, 2025 (Act 1151) from 1 January 2026; threshold raised from GHS 200,000. Turnover is not public, so a gap only if the company says it passed the threshold | https://gra.gov.gh/domestic-tax/tax-types/vat/, checked 18 Nov 2026 |
| VAT registration rule for service providers | 3 | S3 | ALL (services) | — | **[verify]**: the GRA page gives no services threshold; secondary sources conflict (no threshold vs GHS 750,000). The Act 1151 section and any quarterly test are also unconfirmed | **[verify]**: Act 1151 text not read; GRA guideline PDF is a scanned image |
| PAYE return and payment by the 15th of the following month | 3 | S2 | EMPLOYEES | 5 | Attestation. Employee TIN or Ghana Card number must be on the return | https://gra.gov.gh/domestic-tax/tax-types/paye/, checked 18 Nov 2026; https://gra.gov.gh/online-tools/tax-calendar/, checked 18 Nov 2026 |
| Social security at 18.5% of basic salary, 13.5% to SSNIT within 14 days | 3 | S2 | EMPLOYEES | 5 | Attestation. Employee 5.5% deducted plus employer 13%; 13.5% to SSNIT within 14 days of the following month | https://www.ssnit.org.gh/wp-content/uploads/2023/08/SSNIT-Omnibus.pdf, checked 18 Nov 2026 |
| Second-tier 5% paid to a corporate trustee scheme | 3 | S2 | EMPLOYEES | 4 | Slot: second-tier trustee scheme agreement | Same SSNIT document, checked 18 Nov 2026 |
| Employer registered with SSNIT | 3 | S2 | EMPLOYEES | 4 | Slot: SSNIT employer number. The statutory section and deadline under the National Pensions Act, 2008 (Act 766) are **[verify]**: Act 766 not read | **[verify]**: Act 766 not read |
| Written contract for employment of six months or more | 3 | S2 | EMPLOYEES | 5 | Attestation, or Slot: employment contract. Also for an equivalent number of working days within a year | Labour Act, 2003 (Act 651) s 12(1): https://repository.parliament.gh/handle/123456789/1874, checked 18 Nov 2026 |
| Written statement of main terms within two months of starting | 3 | S2 | EMPLOYEES | 4 | Slot: signed statement of particulars (form in Schedule I), signed by employer and worker | Labour Act s 13, checked 18 Nov 2026 |
| National daily minimum wage for 2026 | 3 | S2 | EMPLOYEES | — | Note: reported as GHS 21.77 from 1 January 2026 **[verify]**: no official ministry notice read | **[verify]**: no official page found on 18 Nov 2026 |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Payment service provider licence under Act 987 | 3 | S2 | SECTOR.PAYMENTS | 4 | Slot: Bank of Ghana licence (PSP Standard, Medium or Scheme). Board of at least three directors under Act 987. A register import is not built | https://www.bog.gov.gh/fintech-innovation/licence-requirements/, checked 18 Nov 2026 |
| Dedicated electronic money issuer (DEMI) licence | 3 | S2 | SECTOR.EMONEY | 4 | Slot: Bank of Ghana DEMI licence | Same page, checked 18 Nov 2026 |
| Virtual asset service provider licence | 3 | S2 | SECTOR.CRYPTO | 4 | Slot: licence or registration. Parliament passed the VASP Bill (Bank of Ghana release). Assent, commencement and the BoG/SEC split are **[verify]** | https://www.bog.gov.gh/news/press-release-passage-of-the-virtual-asset-service-providers-bill/, checked 18 Nov 2026 |
| Cybersecurity service provider licence from the CSA | 3 | S2 | SECTOR.CYBERSECURITY | 4 | Slot: CSA licence. Covers penetration testing, digital forensics, managed security services, governance-risk-compliance and training; establishments and professionals are accredited. CSA cites Act 1038 ss 4(k), 49, 50, 51, 57, 59 | https://www.csa.gov.gh/licensing_and_accreditation, checked 18 Nov 2026 |
| Crowdfunding intermediary or platform licence from the SEC | 5 | S2 | SECTOR.CROWDFUNDING | 4 | Slot: SEC licence. No person may run crowdfunding in Ghana without a licence | Securities Industry (Crowdfunding) Guidelines 2024: https://sec.gov.gh/wp-content/uploads/Final-Regulatory-Laws/Guidelines/SEC_Crowdfunding_Guidelines_2024.pdf, checked 18 Nov 2026 |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Online supplier shows full name, legal status, address, phone, email and registration number | 4 | S2 | ONLINE_SALES | 1 / 5 | `web.policy.legal_notice_present`, `registration_number_shown`. Also website address, self-regulatory memberships, code of conduct, names of office bearers and place of registration. Shown on the platform where goods or services are offered | Electronic Transactions Act, 2008 (Act 772) s 47(1)(a)-(f): https://csa.gov.gh/resources/Electronic%20Transactions%20Act.pdf, checked 18 Nov 2026 |
| Online supplier shows price, payment, delivery time, terms and refund policy | 4 | S3 | ONLINE_SALES | 1 / 5 | `web.policy.terms_found`, `refund_policy_found`, `privacy_notice_found`, `complaints_policy_found`. List in s 47(1)(g)-(q): description, full price with taxes and costs, payment, terms and guarantees, delivery time, transaction record, return and refund policy, ADR code, security and privacy policy, minimum duration, consumer rights | Act 772 s 47(1)(g)-(q), checked 18 Nov 2026 |
| Consumer can review terms, correct errors and withdraw before contracting | 4 | S3 | ONLINE_SALES | 5 | Attestation | Act 772 s 47(2), checked 18 Nov 2026 |
| Missing s 47 information lets the consumer cancel within 14 days | 4 | S3 | ONLINE_SALES | — | Note: the supplier then refunds within 30 days | Act 772 s 47(3)-(4), checked 18 Nov 2026 |
| Secure payment system used | 4 | S3 | ONLINE_SALES | 5 | Attestation. The supplier is liable for damage from an insecure payment system | Act 772 s 47(5)-(6), checked 18 Nov 2026 |
| Orders executed within 14 days unless agreed otherwise | 4 | S3 | ONLINE_SALES | 5 | Attestation. If unavailable, tell the consumer at once and refund within seven days | Act 772 s 48, checked 18 Nov 2026 |
| Grace period of 14 days for goods and 7 days for services | 4 | S3 | ONLINE_SALES, CONSUMER | 1 / 5 | `web.policy.refund_policy_found`; content in review. Cancel without reason or penalty; only the direct cost of return may be charged. Exceptions include financial services, auctions, services begun with consent within the seven days, custom goods, and unsealed software | Act 772 s 49, checked 18 Nov 2026 |
| Unsolicited commercial messages need prior consent and an opt-out | 4 | S3 | CONSUMER | 5 | Attestation. Give an unsubscribe option and, on request, the source of the consumer's data | Act 772 s 50(1)-(2), checked 18 Nov 2026 |
| Act 772 amendments not checked | 4 | — | — | — | Note: Act 772 was amended in 2012; the amendment was not read, so section numbers above follow the 2008 text **[verify]** | **[verify]**: amendment not read |
| No general consumer protection act in force | 4 | — | CONSUMER | — | Note: we found none; absence is **[verify]** | **[verify]**: no official page found on 18 Nov 2026 |
| Website accessibility statement | 4 | S3 | WEBSITE / APP | 1 | `web.policy.accessibility_found`, presence only. Whether any Ghanaian rule requires it for a private company is **[verify]** | **[verify]**: no official page found on 18 Nov 2026 |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Return of share issue to the Registrar within 28 days | 5 | S4 | INVESTED | 4 | Slot: return of issue filed with the ORC: stated capital, authorised and issued shares by class, amounts paid in cash and otherwise. Penalties in s 47 | Act 992 s 46: https://orc.gov.gh/legislation/Act-992.pdf, checked 18 Nov 2026 |
| New shareholders entered in the register within 28 days | 5 | S4 | INVESTED | 5 | Attestation (see Section 2) | Act 992 s 35(3), checked 18 Nov 2026 |
| Private company makes no public invitation and keeps 50 members or fewer | 5 | S4 | INVESTED | 5 | Attestation; certified with each annual return (employee holders aside) | Act 992 s 298(1), checked 18 Nov 2026 |
| Public offers under the Securities Industry Act, 2016 | 5 | S4 | INVESTED (offer to the public) | — | Trigger only. Act 929 requirements and thresholds are **[verify]**: Act 929 not read | **[verify]**: Act 929 not read (listed at https://orc.gov.gh/legislations.php, checked 18 Nov 2026) |
| Crowdfunding raise through an SEC-licensed intermediary | 5 | S4 | INVESTED (crowdfunding) | 4 | Slot: platform agreement. Issuers raise through a licensed crowdfunding intermediary or platform (see Section 8) | SEC Crowdfunding Guidelines 2024, checked 18 Nov 2026 |
| Crowdfunding caps per issuer | 5 | S4 | INVESTED (crowdfunding) | — | Note: GHS 6 million in 12 months, GHS 10 million overall, from secondary sources only **[verify]** | **[verify]**: cap clauses not located in the guidelines text we read |
| Capital duty on stated capital | 5 | S2 | ALL | — | Note: reported as 1% of stated capital at ORC registration **[verify]**: official page not readable by our tool on 18 Nov 2026 | **[verify]**: https://orc.gov.gh/fees.php: official page not readable by our tool on 18 Nov 2026 |

### Section 11 — AI

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| No Ghanaian AI act in force | 6 | — | AI | — | Note: we found no AI act in force on 18 Nov 2026. News reports mention an Emerging Technologies Bill and a new Data Protection Bill covering AI, and a National AI Strategy approved by Cabinet in 2026. Status **[verify]** | **[verify]**: no official page found on 18 Nov 2026 |
| Right to object to decisions based solely on automated processing | 6 | S3 | AI, PERSONAL_DATA | 5 | Attestation. An individual may require by written notice that a decision that significantly affects them is not based solely on automated processing of their personal data | Act 843 s 41(1): https://orc.gov.gh/legislation/data-protection-act-2012-act-843.pdf, checked 18 Nov 2026 |
| AI Act obligations when selling AI into the EU | 6 | S3 | AI, EU_MARKET | 5 | Attestation. Refer to "EU Section 7 — AI Act". Reaches a Ghanaian company only through the EU market. Dates (as amended by Regulation (EU) 2026/1744) are taken from the Norway map, not re-read today **[verify]** | **[verify]**: https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng not re-read on 18 Nov 2026 |
| AI use shown on the website | 6 | S3 | AI, WEBSITE | 1 | `web.policy.ai_disclosure_found`, presence only. No Ghanaian rule requiring it was found **[verify]** | **[verify]**: no official page found on 18 Nov 2026 |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above.

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Financial statements sent to members | Section 3 | Within 18 months of incorporation, then every calendar year, no more than 15 months apart | Attestation |
| Annual general meeting | Section 3 | Every calendar year, no more than 15 months apart, at least 21 days after the accounts are sent | Attestation; minutes upload |
| Annual return to the ORC | Section 3 | Within 36 days of sending the accounts; ORC yearly deadline by notice **[verify]** | Attestation; filing receipt |
| Beneficial-owner changes | Section 2 | 28-day steps (Act); ORC FAQ says 30 days **[verify]** | Attestation |
| Director or secretary changes | Section 4 | Within 28 days of the change | Attestation |
| Registered office or address changes | Section 1 | Within 28 days of the change | Attestation |
| Return of share issue | Section 10 | Within 28 days of the issue | Attestation; filing upload |
| DPC registration renewal | Section 6 | Every two years; window before expiry **[verify]** | Slot: certificate expiry date |
| DPC particulars changes | Section 6 | Within 14 days | Attestation |
| PAYE | Section 7 | 15th of the following month | Attestation |
| SSNIT first tier | Section 7 | Within 14 days of the following month | Attestation |
| VAT/NHIL returns | Section 7 | Monthly, at month end (period **[verify]**) | Attestation |
| Trademark renewal | Section 5 | Every 10 years **[verify]** | Attestation; certificate date |

---

## 4. Counts by tier

| Tier | Items | What this means |
|---|---|---|
| 1 Official live or URL scan | 12 (6 pure; 6 mixed 1 / 4, 1 / 5 or 5 + 1) | All from the website scan: legal notice and registration number, privacy notice, retention, transfers, supervisor contact, cookies, terms, refunds, accessibility, AI disclosure. No Ghanaian register fact exists |
| 2 Licensed vendor | 0 | No vendor route mapped for Ghana |
| 3 Official list import | 1 | Sanctions lists (the DPC register could become a second, not built) |
| 4 Document-verified | 26 | Incorporation certificate, constitution, BO filing, AGM minutes, annual return, director declarations, secretary and auditor consents, DPC certificate, GRA and VAT registration, SSNIT, employment particulars, licences, share-issue return |
| 5 Attested | 30 | Register of members, BO entries and changes, residency, office address, strike-off and insolvency status, accounts, data security, breaches, marketing consent, PAYE, SSNIT, employment, IP, consumer duties |
| Notes (no tier) | 21 | Context lines a rule can quote, not checks |

Total in Sections 1–11: 90 lines (69 checkable items, 21 notes). 30 of them carry **[verify]**, plus 5 calendar lines in Section 12.

---

## 5. The core set every Ghanaian tech company must show at Stage 2

1. Incorporated by the ORC, with a name ending "Limited Company" or "LTD" (Tier 4).
2. At least two directors, one ordinarily resident in Ghana, and one resident at all times (Tier 5).
3. A qualified Company Secretary in office (Tier 4).
4. Auditor appointed (Tier 4).
5. Register of members, with beneficial-owner particulars, kept in Ghana; beneficial owners filed with the Registrar (Tier 4 / 5).
6. Registered office, phone, postal or digital address and email notified (Tier 5).
7. Registered with the Data Protection Commission before processing personal data, and renewed every two years (Tier 4, PERSONAL_DATA).
8. Privacy notice covering the Act 843 s 27(2) points on the website (Tier 1, WEBSITE).
9. Registered with the GRA for tax (Tier 4).
10. If selling online: Electronic Transactions Act s 47 information on the site (Tier 1 / 5).
11. Founders' and contractors' IP assigned in writing (Tier 5).

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

- Beneficial-owner change deadline: the Act's 28-day steps (s 35) or the ORC FAQ's 30 days.
- ORC annual-return filing deadline for each year (reported 30 June 2026), filing fee (GHS 175) and late penalties (GHS 1,000 / GHS 2,000); BO non-filing penalty (GHS 500); 1% capital duty.
- Whether "X Limited" satisfies s 21(1)(a) ("Limited Company" or "LTD").
- Whether the Companies Regulations, 2023 or any amendment to Act 992 add an audit exemption or change the filing rules.
- Insolvency and liquidation states under Act 1015.
- Whether a public electronic Central Register of beneficial ownership exists (s 373(3)(c)).
- DPC renewal window (three months or six weeks before expiry) and the legal basis for processor registration.
- Whether Act 843 requires a complaint route naming the DPC, restricts cross-border transfers, or reaches cookies.
- VAT registration rule for service providers under Act 1151, the section number, and any quarterly test; VAT return period.
- Whether a company TIN is issued automatically with ORC incorporation.
- SSNIT employer registration duty and deadline (Act 766); confirm the 13% / 5.5% rates are current.
- 2026 national daily minimum wage (reported GHS 21.77).
- Patents Act s 4(5) employee inventions; Trade Marks Act term and renewal (10 years); whether Act 690 s 7 reaches contractors and founders.
- Act 772 as amended in 2012: section numbers and any changes to ss 47-50.
- That Ghana has no general consumer protection act and no accessibility rule for private websites.
- Securities Industry Act 2016 public-offer rules; crowdfunding caps.
- VASP Act: assent, commencement, and BoG/SEC split.
- AI: status of the Emerging Technologies Bill and the new Data Protection Bill; EU AI Act dates re-read on EUR-Lex.
- Ghana's national sanctions regime, if a Ghana-specific list is wanted.
- Engine change: `web.policy.dpa_named` should recognise dpc.gov.gh as well as dataprotection.org.gh.

---

## Not encoded (18 Nov 2026)

Rule pack `packages/rules/src/packs/gh.ts`, version 0.1.0 (draft): 39 Ghanaian rules, with the International pack after them. No Ghanaian register is connected, so no rule reads a register fact and none is "critical". No rule rests on a [verify] line. DPC registration is proved by its certificate (`gh_dpc_certificate`): the DPC's public register is an HTML table with no file or API, so it is not imported (note 2). Website rules fail only when `web.policy.language_supported` is true.

| Item | Section | Why |
|---|---|---|
| Company name on the website as a publication | Section 1 | [verify]; `GH.CORP.NAME_SHOWN` covers letters, invoices and publications by attestation |
| Not in liquidation or insolvency; sanctions | Section 1 | [verify]; sanctions is covered by `INTL.SANCT.SCREENING` |
| ORC 30-day guidance; annual return includes BO data; central register; public BO register; BO penalty | Section 2 | Notes, several [verify]. `GH.CORP.BO_CHANGES` uses the Act's 28-day steps |
| Yearly ORC deadline, fee and penalties; Companies Bulletin | Section 3 | Notes; the deadline is [verify] |
| No small-company audit exemption | Section 4 | [verify]; `GH.CORP.AUDITOR` and `GH.CORP.FINANCIAL_STATEMENTS` ask for the audit |
| Founders and contractors; employee inventions; trade marks | Section 5 | [verify]; assignments are covered by `INTL.IP.OWNER_ASSIGNMENT` and `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| Renewal window; processors registering; fees; eight principles | Section 6 | Notes, or [verify] |
| Notice names the DPC; security safeguards; supervisor; transfers; cookies | Section 6 | [verify] |
| Company TIN through the ORC; VAT for services; SSNIT registration; minimum wage | Section 7 | [verify]; `GH.TAX.VAT_REGISTRATION` states only the goods threshold |
| VASP licence | Section 8 | [verify] |
| Cybersecurity and crowdfunding licences | Section 8 | No questionnaire fact says the company offers cybersecurity services or runs a crowdfunding platform |
| Missing s 47 information; secure payment system | Section 9 | A note (quoted by `GH.CONSUMER.SALE_INFORMATION`); the payment duty is left for the lawyer to choose |
| Act 772 amendments; consumer act; accessibility | Section 9 | [verify] |
| Public offers; crowdfunding raise and caps; capital duty | Section 10 | [verify], or no trigger for a crowdfunding raise |
| AI act; EU AI Act through the EU market; AI use shown | Section 11 | [verify]; `INTL.AI.TRANSPARENCY` covers disclosure |
| Compliance calendar | Section 12 | Not items. The DPC certificate (2 years) is on its rule |
