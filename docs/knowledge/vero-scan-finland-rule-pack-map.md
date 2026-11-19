# Vero Scan — Finland Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company form covered:** private limited company, *osakeyhtiö* (Oy). Public companies (Oyj) are out of scope.
**Sources:** official legislation, government and regulator pages only, each with its URL and the date checked. Secondary sources were used only to find official pages and are never cited.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Rules common to every EU/EEA country are in `vero-scan-eu-common-rule-pack-map.md`; this map adds only what is Finnish.

**How sources were read.** "Checked 16 Nov 2026" means the page was read on that day. Finlex's consolidated Finnish text could not be read by our tool (the site builds its pages in the browser), so Finnish statutes are cited from the **Ministry of Justice's English translations hosted on Finlex**. Each says "Legally binding only in Finnish and Swedish" and names the last amendment it includes. A translation can lag behind the law: every item that rests only on a translation carries a note, and the lawyer should check the Finnish text at `https://www.finlex.fi/fi/lainsaadanto/<year>/<number>`.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Finnish Oy at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | B2C product |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| INVESTED | Has raised or is raising |
| SECTOR.PAYMENTS, .CREDIT, .CRYPTO, .INVESTMENT, .INSURANCE, .HEALTHTECH | Sector licence triggers (section 8) |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault).

**[verify]** means the item, threshold or deadline could not be confirmed from an official source on 16 Nov 2026. The note says exactly what is uncertain. A [verify] line must not affect a score until a lawyer confirms it.

### Engine facts available for Finland

Read from `packages/connectors/src/fact-keys.ts` and `packages/connectors/src/sources/fi-prh.ts`. A miss in PRH open data is "not in this open data" (`identified` = null), never "doesn't exist".

| Fact key | What it can show | What it cannot show |
|---|---|---|
| `registry.fi.prh.identified` | PRH/YTJ open data holds a company under that Business ID or name | Anything about compliance. Null on a miss |
| `registry.fi.prh.business_id` | The Business ID (Y-tunnus) | — |
| `registry.fi.prh.status` | `active`, `pending`, `ceased`, `invalidated` (derived from the ID state, end date and trade register state) | Why a company ceased |
| `registry.fi.prh.situations` | Current bankruptcy, liquidation or reorganisation | Court detail |
| `registry.fi.prh.registered_name` | Current registered name | Trade names (aputoiminimet) |
| `registry.fi.prh.company_form_code`, `.company_form` | Company form, e.g. `OY` (private) or `OYJ` (public) | — |
| `registry.fi.prh.registered_on`, `.ended_on` | Registration and end dates | — |
| `registry.fi.prh.business_id_status` | Business ID state (pending, valid, invalidated) | — |
| `registry.fi.prh.trade_register_status` | `registered`, `unregistered`, `removed`, `start_up_not_registered`, `ceased` | Whether filings are up to date |
| `registry.fi.prh.in_vat_register` | On the VAT register now | Whether VAT returns are filed or VAT is paid |
| `registry.fi.prh.in_prepayment_register` | On the prepayment register now | Tax compliance in general (registration is voluntary) |
| `registry.fi.prh.in_employer_register` | On the employer register now | Whether payroll reporting is done; casual employers need not register |
| `registry.fi.prh.main_industry_code`, `.main_industry` | Main line of business (TOL code) | Real activity; use for sector inference only |
| `registry.eu.vies_vat.valid`, `.request_date`, `.name_matches` | EU VAT number is valid for intra-EU trade (VIES) | Domestic VAT compliance |
| `registry.global.gleif.*` | LEI record, if the company has one | Most startups have no LEI; a miss means nothing |
| `registry.sanctions.match`, `.possible_match`, `.lists_checked` | Company name screened against the sanctions lists | People are not screened |
| `web.policy.*` | Website scan: privacy notice, its contents, cookie behaviour, terms, AI disclosure | Whether the text is legally adequate; a person reviews |

**Not available in the engine today:** PRH accounts filing status, board and managing director details, beneficial owner notification status, Virre extracts, the Finnish trademark register. PRH open data has no officers and no accounts. These items use a document slot (Tier 4) or an attestation (Tier 5) until a source is built.

---

## 2. Notes for the reviewing lawyer

1. **Translations.** The Limited Liability Companies Act translation read includes amendments up to 660/2022; the Copyright Act translation up to 263/2023; the Employee Inventions Act up to 102/2013; the Data Protection Act up to 29/2024. Later amendments, if any, are not reflected.
2. **The board-residency rule** in the translation (Chapter 6, section 10) requires **at least one board member** to be resident in the EEA, and Chapter 6, section 19 requires the **managing director** to be resident in the EEA, each unless PRH grants an exemption. The task brief described the rule as "one ordinary member and one deputy"; the translation does not say that. Please confirm against the Finnish text.
3. **New Trade Register Act.** PRH says the new Act took effect 1 June 2023, with changes from 1 January 2025 (late-filing fee, negligence fee), mandatory online filing from 2026 and an **annual review of Trade Register information from spring 2027**. PRH's page does not give the Act's number [verify].
4. **E-commerce information duties.** We could not confirm whether the service-provider information duty is still in the Act on Provision of Information Society Services (458/2002) or now in the Act on Electronic Communications Services (917/2014). The Finlex translation page of 458/2002 does not say whether it is in force. Item 9.3 is [verify].
5. **Finnish AI Act implementation.** Traficom's own page confirms Traficom supervises the transparency duties. We could not read an official page confirming the national act's number and date (a search result named Act 1377/2025 in force 1 Jan 2026, which we did not confirm) [verify].
6. **tietosuoja.fi** (the Data Protection Ombudsman) refused our reader (HTTP 403). Items resting on its guidance cite the Act itself and are marked where the guidance could not be read.

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Name availability check | 1 | S1 | ALL | 1 | `registry.fi.prh.identified` by name; a miss confirms only that open data has no exact match, not that the name is free (trademarks and trade names also matter) | PRH YTJ open data API, https://avoindata.prh.fi/en/ytj/swagger-ui (as recorded in `fi-prh.ts` on 16 Nov 2026; not re-read for this map) |
| Registration with the Trade Register within 3 months of signing the memorandum | 1 | S2 | ALL | 1 | `registry.fi.prh.trade_register_status` = `registered`, `registry.fi.prh.registered_on`. If not notified within 3 months the incorporation lapses (OYL 2:8). The fact cannot show the memorandum date | Limited Liability Companies Act 624/2006, ch 2 s 8 (translation, amendments to 660/2022), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| Company active, not in bankruptcy, liquidation or reorganisation | 1 | S2 | ALL | 1 | `registry.fi.prh.status` = `active`; `registry.fi.prh.situations` empty | PRH YTJ open data API (code lists KONK, SELTILA, SANE), https://avoindata.prh.fi/en/ytj/swagger-ui (as recorded in `fi-prh.ts`; not re-read for this map) |
| Company form is a private limited company (Oy) | 1 | S2 | ALL | 1 | `registry.fi.prh.company_form_code` = `OY` | PRH YTJ open data API, https://avoindata.prh.fi/en/ytj/swagger-ui (as recorded in `fi-prh.ts` on 16 Nov 2026; not re-read for this map) |
| Registered office and address on record | 1 | S2 | ALL | 4 | Slot: Trade Register extract (kaupparekisteriote). PRH says it may charge a negligence fee when an address is missing after a request. Open data in the engine does not carry the address | PRH, New Trade Register Act, https://www.prh.fi/en/companiesandorganisations/newtraderegisteract.html |
| Changes notified to the Trade Register | 1 | event-driven | ALL | 4 | Slot: Trade Register extract. Deadlines for each change are in the Trade Register Act **[verify]**: the Act's number and the per-change deadlines were not on the PRH page read | PRH, New Trade Register Act, https://www.prh.fi/en/companiesandorganisations/newtraderegisteract.html |
| Annual review of Trade Register information | 1 | S2 (first review spring 2027 to 31 Dec 2027; then by the end of each calendar year) | ALL | 5 | Attestation until PRH publishes the review state. PRH says a negligence fee may follow if not done after a request | PRH, Annual review of Trade Register information, https://www.prh.fi/en/companiesandorganisations/annual-review-of-trade-register-information.html |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Memorandum of association and articles of association (yhtiöjärjestys) | 1 | S2 | ALL | 4 | Slot: articles of association (certified copy from PRH, or the signed memorandum). An amendment is decided by the general meeting by qualified majority, must be notified for registration without delay, and takes effect only on registration (OYL 5:30) | OYL 624/2006, ch 2 s 8 and ch 5 s 30 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| No minimum share capital for a private company | 1 | S2 | ALL | — | Information only, not a check. OYL 1:3 sets a minimum (EUR 80,000) only for a public company (amended by 184/2019) | OYL 624/2006, ch 1 s 3 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| Shareholder register (osakasluettelo) kept by the board | 1 | S2 | ALL | 4 | Slot: shareholder register. Must be created without delay after incorporation, kept reliably, and be open to everyone at the head office (OYL 3:15, 3:17). The engine cannot see it | OYL 624/2006, ch 3 ss 15–17 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| Share transfers entered in the register; sole shareholder notified within 2 months | 1 | event-driven | ALL | 5 | Attestation. OYL 3:16: entries without delay; a sole shareholder's holding no later than two months after acquisition | OYL 624/2006, ch 3 s 16 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| Beneficial owner notification filed with PRH | 1 | S2 | ALL | 4 | Slot: beneficial owner extract (board members and the managing director can download it free). PRH says whether a notification exists is public (Virre), the details are not. Required even if there is no beneficial owner; file without delay when details change. No engine fact yet. See **EU Section 6 — Beneficial ownership (AML)** | PRH, Notification of beneficial owners, https://www.prh.fi/en/companiesandorganisations/beneficial_owner_details.html |
| Board and shareholder decisions minuted | 1 | S2 | ALL | 5 | Attestation; vault | OYL 624/2006, ch 5 and ch 6 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Ordinary general meeting within 6 months of financial year end | 1 | S2 (annual) | ALL | 5 | Attestation. Adopts the financial statements and decides on profit use (OYL 5:3) | OYL 624/2006, ch 5 s 3 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| Financial statements filed with the Trade Register within 8 months of year end | 1 | S2 (annual) | ALL (also when inactive) | 4 | Slot: PRH filing receipt or Trade Register extract. OYL 8:10 says within two months of adoption; PRH states the outer limit as 8 months of year end and that it cannot extend it. Late fee EUR 150 / 300 / 600 by length of delay, doubled after two missed periods (periods ending 1 Dec 2024 or later); PRH may later remove the company from the register. No engine fact: PRH open data carries no accounts | PRH, Fee for financial statements filed late, https://www.prh.fi/en/companiesandorganisations/financial_statements/filing_financial_statements_late/fee-for-late-submission.html ; OYL ch 8 s 10 (translation) |
| Documents filed with the accounts | 1 | S2 (annual) | ALL | 4 | Same slot. Income statement, balance sheet, notes, signatures; audit report if audited; management report where required | PRH, Financial statement documents, https://www.prh.fi/en/companiesandorganisations/financial_statements/financial_statement_documents.html |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Board of 1 to 5 members; a deputy member if fewer than 3 | 1 | S2 | ALL | 4 | Slot: Trade Register extract. The articles may set another number (OYL 6:8). No engine fact: PRH open data has no officers. PRH may charge a negligence fee for a missing board after a request | OYL 624/2006, ch 6 s 8 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 ; PRH, New Trade Register Act |
| At least one board member resident in the EEA, or a PRH exemption | 1 | S2 | ALL | 4 / 5 | Slot: Trade Register extract or PRH exemption decision; attestation of residency (residency is not published). **[verify]** the current Finnish wording of OYL 6:10 (the brief described a different rule) | OYL 624/2006, ch 6 s 10 (translation, amendments to 660/2022), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| Managing director (if appointed) resident in the EEA, or a PRH exemption | 1 | S2 | ALL (a managing director is optional in a private Oy [verify]) | 4 / 5 | Same as above (OYL 6:19). Whether a private company must have a managing director is not stated in the lines read **[verify]** | OYL 624/2006, ch 6 s 19 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| Board members are natural persons, adult, not bankrupt or under business prohibition | 1 | S2 | ALL | 5 | Attestation. Legal persons cannot be board members (OYL 6:10) | OYL 624/2006, ch 6 s 10 (translation) |
| Auditor appointed when two of three thresholds are exceeded in both of the last two financial periods | 1 | S3 | ALL (above thresholds, or articles require it) | 4 | Slot: audit report filed with the accounts. Thresholds: balance sheet total over EUR 100,000; net sales over EUR 200,000; average over 3 employees. **[verify]** current figures in Auditing Act 1141/2015 ch 2 s 2 (we read PRH's page, not the Act) | PRH, Financial statement documents, https://www.prh.fi/en/companiesandorganisations/financial_statements/financial_statement_documents.html |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Software written by employees belongs to the employer by law | 2 | S2 | EMPLOYEES | 5 | Attestation that code is written within employment duties. Copyright Act 40b: copyright in a computer program (and a directly associated work, and a database) made within the scope of duties in employment passes to the employer. Does not cover contractors or founders who are not employees | Copyright Act 404/1961, s 40b (translation, amendments to 263/2023), https://www.finlex.fi/en/legislation/translations/1961/eng/404 |
| Contractor and founder IP assignment in writing | 2 | S1 | CONTRACTORS, ALL (founders) | 5 | Vault: assignment agreements. The 40b default applies only to employment; outside it, the author keeps copyright unless it is transferred by agreement | Copyright Act 404/1961, ss 27–28, 40b (translation), https://www.finlex.fi/en/legislation/translations/1961/eng/404 |
| Employee inventions: notice to employer; employer claims within 4 months; reasonable compensation | 2 | S3 | EMPLOYEES (patentable inventions) | 5 | Vault: invention policy and notices. The employee must notify in writing without delay (s 5); the employer must claim within 4 months of the notice (s 6); the employee is entitled to reasonable compensation even if agreed otherwise beforehand (s 7) | Act on the Right in Employee Inventions 656/1967, ss 4–7 (translation, amendments to 102/2013), https://www.finlex.fi/en/legislation/translations/1967/eng/656 |
| Finnish trademark registered with PRH | 2 | S2 (application) / S3 | ALL | 4 | Slot: PRH registration certificate. Valid 10 years; renew from 1 year before to 6 months after expiry, or it is removed. An EU trade mark is the alternative: **EU Section 11 — EU trade mark** | PRH, Renew your trademark every 10 years, https://www.prh.fi/en/intellectualpropertyrights/trademarks/maintain_and_renew_your_trademark/renew_your_trademark_every_10_years.html |

### Section 6 — Data protection and cookies

GDPR duties are in **EU Section 1 — GDPR**; cookie consent in **EU Section 2 — ePrivacy and cookies**. Finnish specifics only:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Supervisory authority is the Data Protection Ombudsman | 3 | S2 | PERSONAL_DATA, WEBSITE | 1 | `web.policy.privacy_notice_found`, `web.policy.rights_section`. The notice should name the right to complain to the Ombudsman. **No Finnish complaint-route fact exists yet** (`web.policy.complaint_route_ico` and `_ndpc` are UK and Nigeria); until one is built this is a person's check | Data Protection Act 1050/2018, s 8 (translation, amendments to 29/2024), https://www.finlex.fi/en/legislation/translations/2018/eng/1050 |
| Children's consent age 13 for information society services | 3 | S2 | CONSUMER, PERSONAL_DATA (services offered to children) | 1 / 5 | `web.policy.children_section`; attestation of age gating. Finland uses 13, not the GDPR default of 16 | Data Protection Act 1050/2018, s 5 (translation) |
| No general national registration or fee for controllers | 3 | S2 | PERSONAL_DATA | — | Information only. We found no Finnish equivalent of the UK ICO fee in the Act read. **[verify]** with the Ombudsman (tietosuoja.fi not readable by our tool on 16 Nov 2026) | Data Protection Act 1050/2018 (translation) |
| DPO designated where GDPR Art 37 applies; contact details given to the Ombudsman | 3 | S2 | PERSONAL_DATA (large-scale monitoring or special-category data) | 5 + 1 | Attestation; `web.policy.dpo_contact`. How the Ombudsman wants the contact notified **[verify]**: https://tietosuoja.fi/en/designating-a-data-protection-officer not readable by our tool on 16 Nov 2026 | GDPR Art 37 (EU Section 1); tietosuoja.fi page [verify] |
| Employee data rules (Act on the Protection of Privacy in Working Life) | 3 | S2 | EMPLOYEES | 5 | Attestation. **[verify]**: the Act (759/2004) was named in search results only; we did not read it | — [verify] |
| Cookie consent under Act on Electronic Communications Services s 205 | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `web.policy.cookies_before_consent_count`, `web.policy.trackers_before_consent_count`, `web.policy.cookie_policy_found`. Traficom (NCSC-FI) guidance: no non-essential cookies before consent; refusing must be simple; no pre-ticked boxes; consent not from browser settings or "continuing means accepting"; legitimate interest is not a basis. Traficom supervises and can order a fix but cannot fine for cookie practices | NCSC-FI / Traficom, Cookies, https://www.kyberturvallisuuskeskus.fi/en/our-activities/regulation-and-supervision/cookies (page updated 23 Apr 2026; guideline valid from 13 Sep 2021) |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| VAT registration once turnover exceeds EUR 20,000 in a calendar year | 3 | S3 | ALL | 1 | `registry.fi.prh.in_vat_register`; `registry.eu.vies_vat.valid` for intra-EU trade. Register from the date the threshold is exceeded; late registration is backdated to that date. A company may register voluntarily below it. See **EU Section 5 — VAT** | Vero, VAT for small business, https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/vat/vat-for-small-business/ |
| Employer register for regular employers | 3 | S2 | EMPLOYEES | 1 | `registry.fi.prh.in_employer_register`. Regular employer: pays 2 or more employees regularly, or 1 regular plus temporary staff, or 6 or more at the same time. A casual employer need not register, so `false` is not a gap for a company with one employee | Vero, Employer Register, https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/being-an-employer/employer-register |
| Prepayment register (voluntary) | 3 | S2 | ALL (optional) | 1 | `registry.fi.prh.in_prepayment_register`. Not mandatory; without it customers withhold tax from payments. A signal, never a gap. Status is public | Vero, Prepayment register, https://www.vero.fi/en/businesses-and-corporations/business-operations/tax-administrations-registers--business/prepayment-register/ |
| Wages and contributions reported to the Incomes Register | 3 | S2 | EMPLOYEES | 5 | Attestation. **[verify]** deadlines (we did not read the Incomes Register page) | — [verify] |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| FIN-FSA authorisation or notification before a regulated financial activity | 3 | S2 | SECTOR.PAYMENTS, .CREDIT, .CRYPTO, .INVESTMENT, .INSURANCE | 3 | FIN-FSA lists of supervised entities and of notifications (official list import, not built). Which list covers payment institutions and crypto-asset service providers **[verify]** (the registers page does not say). Only a trigger here; the licence rules are not mapped | FIN-FSA, Registers, https://www.finanssivalvonta.fi/en/registers/ |
| Health or medical device rules | 3 | S3 | SECTOR.HEALTHTECH | 5 | Trigger only; not mapped. See **EU Section 12 — Other EU digital rules (triggers)** | — |

### Section 9 — Consumer terms and website information

EU-wide duties are in **EU Section 3 — E-commerce information duties** and **EU Section 4 — Consumer law**. Finnish specifics:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Online store pre-contract information (Consumer Protection Act ch 6) | 4 | S3 | CONSUMER | 1 | `web.policy.terms_found`, `web.policy.refund_policy_found`. KKV lists: registered company name, trade register and Business ID, head-office address, email and phone, total price with taxes and delivery, withdrawal conditions and form. Presence only; a person reviews content | KKV, Obligation to provide information in online stores, https://www.kkv.fi/en/consumer-affairs/online-stores/obligation-to-provide-information-in-online-stores/ |
| 14-day withdrawal; extended to 12 months if the procedure is not explained | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.refund_policy_found`; attestation | KKV, same page |
| Withdrawal function on the same interface, from 19 June 2026 | 4 | S3 | CONSUMER (contracts concluded online) | 5 | Attestation (the scan cannot yet detect a withdrawal button). Must be easy to find, let the consumer identify the contract, ask for confirmation, and send an acknowledgement on a durable medium | KKV, same page |
| Service provider identification on the website (e-commerce information duty) | 4 | S2 | WEBSITE | 1 | `web.policy.names_company`. **[verify]** which Finnish act now carries the e-commerce Directive Art 5 duty (458/2002 or 917/2014); see lawyer note 4 | Act on Provision of Information Society Services 458/2002, https://www.finlex.fi/en/legislation/translations/2002/eng/458 (page read; it does not show the section or say whether in force) |
| Accessibility of consumer e-commerce services | 4 | S3 | CONSUMER, WEBSITE | 1 | `web.policy.accessibility_found`. See **EU Section 8 — Accessibility**; national supervisor and exemptions **[verify]** | — [verify] |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Share issue decided by the general meeting, or by the board under an authorisation | 5 | S4 | INVESTED | 5 | Vault: share issue decision. A share issue authorisation must be notified for registration within one month (OYL 9:2) | OYL 624/2006, ch 9 s 2 (translation), https://www.finlex.fi/en/legislation/translations/2006/eng/624 |
| Share issue decision notified for registration within one month | 5 | S4 | INVESTED | 4 | Slot: Trade Register extract showing the share issue. OYL 9:7 | OYL 624/2006, ch 9 s 7 (translation) |
| New shares registered once paid, within 5 years of the decision or they lapse | 5 | S4 | INVESTED | 4 | Same slot. OYL 9:14 | OYL 624/2006, ch 9 s 14 (translation) |
| Shareholder register updated after the issue | 5 | S4 | INVESTED | 5 | Attestation; links to Section 2 item | OYL 624/2006, ch 3 s 15 (translation) |
| Offer to the public may need a prospectus | 5 | S4 | INVESTED (public offer) | 5 | Trigger only. FIN-FSA keeps the register of prospectuses. National exemption threshold **[verify]**. See **EU Section 10 — Fundraising and prospectus** | FIN-FSA, Registers, https://www.finanssivalvonta.fi/en/registers/ |

### Section 11 — AI

The AI Act itself is in **EU Section 7 — AI Act** (as amended by Regulation (EU) 2026/1744: Annex III high-risk duties from 2 Dec 2027, Annex I from 2 Aug 2028; new Art 5(1)(ba)/(bb) prohibitions from 2 Dec 2026; Art 50(2) marking by 2 Dec 2026 for systems placed on the market before 2 Aug 2026; https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng, checked 16 Nov 2026). Finnish specifics:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| AI transparency duties supervised by Traficom | 6 | S3 | AI | 1 / 5 | `web.policy.ai_disclosure_found` for a published disclosure; attestation for labelling. Traficom: users told they deal with AI at the first interaction; AI-generated content marked machine-readably (providers); deep fakes labelled (deployers); duties apply from 2 Aug 2026, no retroactive labelling | Traficom, When do you need to disclose the use of AI?, https://traficom.fi/en/ai-regulation/when-do-you-need-disclose-use-ai |
| High-risk AI supervised by sector authorities | 6 | S5 | AI (high-risk use) | 5 | Trigger only. Traficom says sector market surveillance authorities supervise high-risk systems | Traficom, same page |
| National act supplementing the AI Act | 6 | — | AI | — | **[verify]**: number and date not confirmed from an official page (lawyer note 5) | — [verify] |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above:

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Ordinary general meeting | Section 3 | Within 6 months of year end | Attestation |
| Financial statements to PRH | Section 3 | Within 8 months of year end | Document slot (no engine fact yet) |
| Annual review of Trade Register information | Section 1 | By 31 Dec each year, first by 31 Dec 2027 | Attestation |
| Beneficial owner details | Section 2 | On every change, without delay | Document slot |
| VAT threshold | Section 7 | Monitored per calendar year | Auto: `registry.fi.prh.in_vat_register` |
| Trademark renewal | Section 5 | Every 10 years | Document slot |

---

## 4. Counts by tier

| Tier | Items | Notes |
|---|---|---|
| 1 Official live or URL scan | 15 | PRH open data (status, form, registration, VAT, employer, prepayment registers) and the website scan |
| 2 Licensed vendor | 0 | Not needed: PRH open data is free |
| 3 Official list import | 1 | FIN-FSA lists (not built) |
| 4 Document-verified | 14 | Trade Register extract, beneficial owner extract, accounts filing receipt, articles, PRH trademark certificate |
| 5 Attested (vault) | 17 | Registers, decisions, residency, IP agreements, invention notices |
| Information only | 3 | No minimum capital; no controller registration; national AI act |

Counts include items whose tier is shared (e.g. "4 / 5") under the first tier. 50 items in all, 13 of them carrying [verify].

---

## 5. The core set every Finnish tech company must show at Stage 2

1. Registered in the Trade Register, active, a private Oy, not in bankruptcy, liquidation or reorganisation (Tier 1: `registry.fi.prh.status`, `.trade_register_status`, `.company_form_code`, `.situations`)
2. Financial statements filed within 8 months of each year end (Tier 4 until an accounts source exists)
3. Beneficial owner notification filed (Tier 4)
4. Board on record, with at least one EEA-resident member or a PRH exemption (Tier 4 / 5)
5. Shareholder register kept (Tier 4)
6. Privacy notice and cookie consent that meet the GDPR and section 205 (Tier 1, WEBSITE)
7. Founders' and contractors' IP assigned in writing (Tier 5)
8. Employer register entry once a regular employer (Tier 1, EMPLOYEES)

---

## 6. Thresholds and facts to confirm before encoding

- OYL 6:10 board-residency rule in the current Finnish text (one member, or one member and a deputy); whether a private Oy must have a managing director.
- Auditing Act 1141/2015 ch 2 s 2 thresholds (read only from PRH's page).
- Trade Register Act: its number, the deadline for notifying each change, and the exact start of the 2027 annual review.
- Which Act now holds the e-commerce service-provider information duty (458/2002 or 917/2014).
- Data Protection Ombudsman: how DPO contact details are notified; any national registration (none found).
- Act on the Protection of Privacy in Working Life: duties for an employer startup.
- Incomes Register reporting deadlines.
- FIN-FSA: which list covers payment institutions and crypto-asset service providers; national prospectus exemption threshold.
- National AI Act implementing law: number, date, authorities.
- Accessibility: national act, supervisor and microenterprise exemption.
- Whether the Finnish translations used are current (each names its last included amendment).

---

## Not encoded (16 Nov 2026)

The draft pack `packages/rules/src/packs/fi.ts` (version 0.1.0) encodes the rest of this map, together with the EU common rules it adds; the items below have no rule of their own.

| Item | Section | Why |
|---|---|---|
| Name availability check | Section 1 | Stage S1 only, and a miss in open data does not show a name is free: nothing a rule can decide |
| Changes notified to the Trade Register | Section 1 | [verify]: the Act and the deadline for each change would decide it. The extract itself is asked for by FI.CORP.REGISTER_EXTRACT |
| No minimum share capital for a private company | Section 2 | Information only |
| IP assignment in writing (contractors, and the people who set up the company) | Section 5 | Covered by INTL.IP.OWNER_ASSIGNMENT and INTL.IP.CONTRACTOR_ASSIGNMENT, which ask for the same signed assignments and read the questionnaire answers |
| Supervisory authority is the Data Protection Ombudsman | Section 6 | Covered by FI.DP.NOTICE_AUTHORITY, which cites this line |
| Children's consent age 13 | Section 6 | Covered by FI.DP.CHILD_CONSENT (age 13), which cites this line |
| No general national registration or fee for controllers | Section 6 | Information only, and [verify] |
| DPO designated; contact details given to the Ombudsman | Section 6 | Covered by FI.DP.DPO; how the contact is notified is [verify] |
| Employee data rules (Act on the Protection of Privacy in Working Life) | Section 6 | [verify]: the Act was not read, so its duties are unknown |
| Cookie consent under Act on Electronic Communications Services s 205 | Section 6 | Covered by FI.DP.COOKIE_CONSENT and FI.DP.COOKIE_POLICY, which cite this line |
| Prepayment register (voluntary) | Section 7 | Voluntary: a signal, never a gap |
| Health or medical device rules | Section 8 | Trigger only, not mapped. AI in medical products is FI.AI.HIGH_RISK_PRODUCTS |
| Online store pre-contract information | Section 9 | Covered by FI.CONSUMER.PRE_CONTRACT_INFO, which cites this line |
| 14-day withdrawal; 12 months if not explained | Section 9 | Covered by FI.CONSUMER.WITHDRAWAL, which cites this line |
| Withdrawal function, from 19 June 2026 | Section 9 | Covered by FI.CONSUMER.WITHDRAWAL_FUNCTION, which cites this line |
| Service provider identification on the website | Section 9 | [verify] which act carries the duty; covered by FI.COM.WEBSITE_IDENTITY |
| Accessibility of consumer e-commerce services | Section 9 | [verify] national supervisor and exemptions; covered by FI.CONSUMER.ACCESSIBILITY |
| Offer to the public may need a prospectus | Section 10 | [verify] national threshold; covered by FI.FUND.PROSPECTUS_EXEMPTION |
| High-risk AI supervised by sector authorities | Section 11 | Trigger only; covered by FI.AI.HIGH_RISK |
| National act supplementing the AI Act | Section 11 | [verify]: number and date not confirmed, and no duty of its own is mapped |
| Compliance calendar | Section 12 | Not items. The recurrences sit on FI.CORP.GENERAL_MEETING, FI.CORP.ACCOUNTS_FILING, FI.CORP.ANNUAL_REVIEW and FI.IP.TRADEMARK; VAT is FI.TAX.VAT_REGISTER and beneficial owners FI.CORP.UBO |

Encoded but always "to check" until a lawyer confirms the tagged line: FI.CORP.EEA_RESIDENCY, FI.CORP.AUDITOR, FI.EMP.INCOMES_REGISTER, FI.FIN.AUTHORISATION. No threshold or deadline from a [verify] line is used in their logic.
