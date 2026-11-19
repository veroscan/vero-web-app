# Vero Scan — Ireland Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Sources:** official legislation, government and regulator pages only (Law Reform Commission revised Acts, Irish Statute Book, Revenue, Data Protection Commission, Department of Enterprise, Tourism and Employment, EUR-Lex), each with its URL and the date checked. Secondary sources were used only to find official pages and are never cited.
**Company form covered:** private company limited by shares (LTD) under Part 2 of the Companies Act 2014, running a technology business.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Rules shared by every EU country (GDPR, ePrivacy, e-commerce, consumer, VAT, beneficial ownership, AI Act, accessibility, accounts, prospectus, EU trade mark) are in `vero-scan-eu-common-rule-pack-map.md`; this map adds only what is Irish.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Irish LTD at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has at least one employee |
| CONTRACTORS | Uses contractors, freelancers or consultants |
| NO_EEA_DIRECTOR | No director is resident in an EEA state |
| CONSUMER | Sells to consumers (B2C) |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| INVESTED | Has raised or is raising equity |
| AUDIT_EXEMPT | Claims the small-company audit exemption |
| SECTOR.PAYMENTS, .CRYPTO, .CREDIT, .HEALTHTECH | Sector packs (triggers only in this map) |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a slot the customer uploads) · 5 attested (the customer confirms, optionally with evidence in the vault).

**[verify]** marks a threshold, deadline, form name or reading that we could not confirm from an official page on 16 Nov 2026, with what is uncertain. Nothing marked [verify] should be encoded until a lawyer confirms it.

**Source cell.** "checked 16 Nov 2026" means we read that official page on that date. The CRO's site (cro.ie) and the RBO's site (rbo.gov.ie) refused our tool on 16 Nov 2026 (HTTP 403), so their guidance pages are marked "[verify]: official page not readable by our tool"; the statutory text was read on the Law Reform Commission's revised Acts and the Irish Statute Book instead. Revised Acts were read in the version the Law Reform Commission published (the Companies Act 2014 PDF is marked "updated to 15 July 2025"); later amendments may not be shown.

### Engine facts available for Ireland

| Fact keys | Source | What they can show | What they cannot show |
|---|---|---|---|
| `registry.ie.cro.identified`, `.company_number`, `.registered_name`, `.status`, `.status_code`, `.status_since`, `.company_type`, `.company_type_code`, `.registered_on`, `.last_annual_return_on`, `.next_annual_return_due`, `.last_accounts_on` | CRO Open Services, Tier 1 (needs `IE_CRO_EMAIL` and `IE_CRO_API_KEY`; off until set; not yet tried against a real reply) | The company is on the company register, its status and type, registration date, last and next annual return dates, last accounts date | A miss is not a "no" (`identified` stays null). No officers, secretary, EEA-director status, members, charges or beneficial owners. Status words not yet confirmed |
| `registry.global.opencorporates.*` | OpenCorporates (paid fallback), used for Ireland only while the CRO key is not set | Registered, status, incorporation date, officer count and titles | Second-hand copy of the register; lower weight |
| `registry.eu.vies_vat.valid`, `.request_date`, `.name_matches` | EU VIES, Tier 1 | An Irish VAT number given by the customer is valid today | Whether the company should be VAT-registered |
| `registry.global.gleif.*` | GLEIF, Tier 1 | LEI record, if any | Nothing about Irish law |
| `registry.sanctions.match`, `.possible_match`, `.lists_checked` | Sanctions lists, Tier 3 | Company name close to or matching a listed entity | Never "sanctioned"; officers are not screened |
| `web.policy.*` | Website scan, Tier 1 | Privacy notice and its sections, DPO contact, cookie banner and trackers before consent, terms, refund, complaints, accessibility, AI disclosure links | No fact for the Companies Act website particulars; no fact for a complaint route to the DPC (`complaint_route_ico` and `complaint_route_ndpc` are for other countries) |

---

## 2. Notes for the reviewing lawyer

1. **Scope.** An Irish LTD in technology. Designated activity companies (DAC), PLCs and unlimited companies are out of scope. Sector regimes appear only as triggers (section 8). Rules that are the same across the EU are in the EU common map, referred to as "EU Section N".
2. **The CRO source is strong for filing deadlines.** `next_annual_return_due` and `last_annual_return_on` let the engine check the annual return the way Companies House facts do in the UK, once the key is set.
3. **Officers are not in the engine.** The EEA-resident director rule, the secretary rule and the sole-director rule are Tier 4 (a CRO printout or the constitution plus register) until a source exposes officers.
4. **Audit exemption rule is changing.** The revised text of s.363 shows a 2024 amendment (loss of exemption only after a second late return in five years) as not commenced at the revision date; CRO guidance we could not read reportedly applies it from 16 Jul 2025. Encode the rule only after a lawyer confirms the commencement.
5. **Beneficial-owner access.** The RBO filing duties are from S.I. 110/2019 as made. We did not confirm later amendments, including any change to public access after the CJEU judgment of 22 Nov 2022 [verify].
6. **Biggest open points:** RBO change deadline wording; audit-exemption commencement; the Irish AI Act authorities list; Irish transposition of the 2023 consumer withdrawal-function directive.

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Registered with the CRO as a private company limited by shares | 1 | S2 | ALL | 1 | `registry.ie.cro.identified`, `.company_number`, `.company_type`, `.registered_on`. A miss is "to check" | CRO, https://cro.ie/, **[verify]**: official page not readable by our tool on 16 Nov 2026. Engine source note: docs/NATIONAL-REGISTERS.md |
| Company status normal (not struck off, not in liquidation) | 1 | S2 | ALL | 1 | `registry.ie.cro.status`, `.status_code`, `.status_since`. **[verify]** the status words and codes the CRO returns (for example "normal", "strike off listed", "dissolved") | As above, **[verify]** |
| Company name not on a sanctions list | 3 | S2 | ALL | 3 | `registry.sanctions.match`, `.possible_match`, `.lists_checked`. Never "sanctioned" | EU sanctions lists (international pack) |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Constitution (single document) | 1 | S2 | ALL | 4 | Slot: Constitution. Must state the name, that it is a private company limited by shares, limited liability, share capital, and shares taken by each subscriber; Schedule 1 form; signed before a witness | Companies Act 2014 s.19: https://revisedacts.lawreform.ie/eli/2014/act/38/section/19/revised/en/html, checked 16 Nov 2026 |
| Register of members kept | 1 | S2 | ALL | 5 | Attestation; vault. Names, addresses, shares, amounts paid, dates joined and left. New members entered within 28 days; leavers within 28 days | s.169: https://revisedacts.lawreform.ie/eli/2014/act/38/section/169/revised/en/html, checked 16 Nov 2026 |
| Internal beneficial-ownership register kept | 1 | S2 | ALL | 5 | Attestation. The company must keep its own register of beneficial owners and take reasonable steps to identify them | S.I. 110/2019 reg 5: https://www.irishstatutebook.ie/eli/2019/si/110/made/en/print, checked 16 Nov 2026. See EU Section 6 |
| Beneficial owners filed with the RBO within 5 months of incorporation | 1 | S2 | ALL | 4 | Slot: RBO filing confirmation. No engine fact (the central register is not read) | S.I. 110/2019 reg 20(2), as above; RBO guidance https://rbo.gov.ie/ **[verify]**: not readable by our tool on 16 Nov 2026 |
| Beneficial-owner changes filed with the RBO | 1 | event-driven | ALL | 4 | Slot: RBO update confirmation. Reg 23 requires changes in the company's own register to be reflected in the central register; the follow-up filing is due within 14 days of the date the company's own register had to be updated. **[verify]** how that start date is set, and any later amendment | S.I. 110/2019 reg 23(5), as above |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| First annual return date 6 months after incorporation | 1 | S2 | ALL | 1 | `registry.ie.cro.registered_on`, `.next_annual_return_due`. Later ARDs are anniversaries of the first | s.345(3): https://revisedacts.lawreform.ie/eli/2014/act/38/section/345/revised/en/html, checked 16 Nov 2026 |
| Annual return (B1) delivered within 56 days of the ARD | 1 | S2 (annual) | ALL | 1 | `registry.ie.cro.next_annual_return_due`, `.last_annual_return_on`. Category 3 offence; a court may extend once. Late fees (reportedly €100 plus €3 a day, up to €1,200) **[verify]**: CRO fee page not readable | s.343(2): https://revisedacts.lawreform.ie/eli/2014/act/38/section/343/revised/en/html, checked 16 Nov 2026 |
| Financial statements annexed to the annual return | 1 | S2 (annual) | ALL | 1 | `registry.ie.cro.last_accounts_on` against `.last_annual_return_on`: statements made up to no more than 9 months before the return's made-up date; the first return covers the period from incorporation. Micro companies using the s.325(1A) exemption need not annex a directors' report | s.347: https://revisedacts.lawreform.ie/eli/2014/act/38/section/347/revised/en/html, checked 16 Nov 2026 |
| Annual general meeting held, or dispensed with in writing | 1 | S2 (annual) | ALL | 5 | Attestation. One each year, no more than 15 months apart; first within 18 months of incorporation. Can be skipped by a written resolution signed by all voting members that acknowledges the financial statements and confirms no change of auditor | s.175: https://revisedacts.lawreform.ie/eli/2014/act/38/section/175/revised/en/html, checked 16 Nov 2026 |
| Small company status (for exemptions) | 1 | S2 (annual) | ALL | 5 | Attestation. 2 of 3: turnover ≤ €15m, balance sheet ≤ €7.5m, ≤ 50 employees (monetary figures from S.I. 301/2024, from 1 Jul 2024). Information for the audit-exemption item | s.280A(3): https://revisedacts.lawreform.ie/eli/2014/act/38/section/280A/revised/en/html, checked 16 Nov 2026. See EU Section 9 |
| Audit exemption claimed only when qualifying | 1 | S2 (annual) | AUDIT_EXEMPT | 4 | Slot: financial statements as filed. A small company (not a group member unless the group is small) may claim it | s.358: https://revisedacts.lawreform.ie/eli/2014/act/38/section/358/revised/en/html, checked 16 Nov 2026 |
| Audit exemption not lost through a late annual return | 1 | S2 (annual) | AUDIT_EXEMPT | 1 | `registry.ie.cro.last_annual_return_on` against the due date. Current revised text: exemption lost for the next 2 years after a late return (first return excepted). The 2024 Act substitutes a rule needing a second late return in 5 years; **[verify]** its commencement (shown as not commenced at revision; CRO reportedly from 16 Jul 2025) | s.363: https://revisedacts.lawreform.ie/eli/2014/act/38/section/363/revised/en/html, checked 16 Nov 2026 |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| At least one director | 1 | S2 | ALL | 4 | Slot: CRO company printout or register of directors. No CRO officer fact. `registry.global.opencorporates.officers_count` can hint when that source answers. Breach for 28 days is a category 3 offence | s.128: https://revisedacts.lawreform.ie/eli/2014/act/38/section/128/revised/en/html, checked 16 Nov 2026 |
| A company secretary, not the sole director | 1 | S2 | ALL | 4 | Slot: as above. A sole director cannot also be secretary; directors must make sure the secretary has the skills or support needed | s.129: https://revisedacts.lawreform.ie/eli/2014/act/38/section/129/revised/en/html, checked 16 Nov 2026 |
| At least one EEA-resident director | 1 | S2 | ALL | 4 | Slot: register of directors with residence, or one of the two alternatives below. Alternate directors do not count. Category 4 offence | s.137(1), (7): https://revisedacts.lawreform.ie/eli/2014/act/38/section/137/revised/en/html, checked 16 Nov 2026 |
| Bond of €25,000 in place instead | 1 | S2 | NO_EEA_DIRECTOR | 4 | Slot: bond in the prescribed form (S.I. 215/2015) | s.137(2), as above |
| Or a CRO certificate of a real and continuous economic link with Ireland | 1 | S2 | NO_EEA_DIRECTOR | 4 | Slot: certificate under s.140. Granted on proof such as a Revenue statement issued within 2 months before applying; revoked if the link ends | s.140: https://revisedacts.lawreform.ie/eli/2014/act/38/section/140/revised/en/html, checked 16 Nov 2026 |
| Statutory auditor appointed unless exempt | 1 | S3 | ALL (not AUDIT_EXEMPT) | 4 | Slot: auditor's report annexed to the annual return (s.347). dup of Section 3 for the exemption test | s.347 and s.358, as above |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Employee works (including code) owned by the company | 2 | S2 | EMPLOYEES | 5 | Attestation. The employer is first owner of copyright in works made by an employee in the course of employment, unless agreed otherwise; computer programs are included | Copyright and Related Rights Act 2000 s.23(1)(a): https://revisedacts.lawreform.ie/eli/2000/act/28/section/23/revised/en/html, checked 16 Nov 2026 |
| Employee inventions | 2 | S2 | EMPLOYEES | 5 | Attestation; vault: invention clause in the employment contract. **[verify]**: we did not find a statutory employee-invention rule in the Patents Act 1992 (not read); ownership may turn on contract and case law | Patents Act 1992, **[verify]**: not read on 16 Nov 2026 |
| Founders' and contractors' IP assigned in writing | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Attestation; vault. s.23 covers employees only, so a contractor or pre-incorporation founder is first owner unless they assign. **[verify]** the formal requirements for a valid assignment (CRRA 2000 s.120, not read) | Inference from s.23 above |
| Trademark filed at the IPOI (or as an EU trade mark) | 2 | S2 | ALL | 4 | Slot: IPOI registration certificate. No IPOI fact. 10-year term, renewable for further 10 years. **[verify]** whether the term now runs from the filing date after the 2018 amendments (the text read is the Act as enacted) | Trade Marks Act 1996 s.47: https://www.irishstatutebook.ie/eli/1996/act/6/section/47/enacted/en/html, checked 16 Nov 2026; IPOI https://www.ipoi.gov.ie/, checked 16 Nov 2026. EU route: EU Section 11 |

### Section 6 — Data protection and cookies

GDPR rules are in EU Section 1; cookie consent is in EU Section 2. Ireland adds the following.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Privacy notice published | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `.names_company`, `.rights_section`, `.retention_statement`, `.transfers_section`. Authority to name: the Data Protection Commission. No fact yet checks the DPC complaint route | EU Section 1; national act: Data Protection Act 2018 |
| Age of digital consent is 16 | 3 | S2 | PERSONAL_DATA (service offered to children) | 5 | Attestation. Preventative and counselling services are excluded | Data Protection Act 2018 s.31: https://revisedacts.lawreform.ie/eli/2018/act/7/section/31/revised/en/html, checked 16 Nov 2026 |
| DPO details notified to the DPC | 3 | S2 | PERSONAL_DATA (GDPR art. 37 tests met) | 5 + 1 | Attestation (the DPC publishes no list we can import); `web.policy.dpo_contact` checks the notice. Notification by the DPC's online form | https://www.dataprotection.ie/en/organisations/know-your-obligations/data-protection-officers, checked 16 Nov 2026 |
| Consent before non-essential cookies | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `.cookies_before_consent_count`, `.trackers_before_consent_count`. Consent plus clear and comprehensive information, prominently displayed; no consent needed for transmission or strictly necessary storage | S.I. 336/2011 reg 5(3)-(5): https://www.irishstatutebook.ie/eli/2011/si/336/made/en/print, checked 16 Nov 2026; DPC: https://www.dataprotection.ie/en/dpc-guidance/guidance-cookies-and-other-tracking-technologies, checked 16 Nov 2026 |
| Reject as easy as accept; no implied consent; consent refreshed | 3 | S2 | WEBSITE | 5 | Attestation until the scan reads banner buttons. **[verify]**: these points are in the DPC's 2020 guidance note PDF, which our tool could not extract on 16 Nov 2026 (including any 6-month refresh recommendation) | DPC guidance note PDF, https://www.dataprotection.ie/sites/default/files/uploads/2020-04/Guidance%20note%20on%20cookies%20and%20other%20tracking%20technologies.pdf, **[verify]**: not readable |
| Cookie policy | 3 | S2 | WEBSITE | 1 | `web.policy.cookie_policy_found` | EU Section 2 |
| Opt-out choice shown where personal data is collected for marketing | 3 | S2 | WEBSITE (collects contact details) | 1 / 5 | `web.policy.opt_out_link` (partial); attestation. Irish e-commerce rules require details of how people can register their choice on unsolicited commercial communications, shown at every point data is collected | S.I. 68/2003 reg 7(1)(d): https://www.irishstatutebook.ie/eli/2003/si/68/made/en/print, checked 16 Nov 2026 |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| VAT registration once over the threshold | 3 | S3 | ALL | 1 | `registry.eu.vies_vat.valid` (needs the number). €42,500 for services; €85,000 for goods. Apply within 30 days of the transaction that takes turnover over the threshold; may register voluntarily (for example to reclaim start-up VAT) | https://www.revenue.ie/en/vat/vat-registration/who-should-register-for-vat/persons-required-register-goods-services-abroad.aspx and https://www.revenue.ie/en/vat/vat-registration/who-should-register-for-vat/index.aspx (published 27 Oct 2026), checked 16 Nov 2026. See EU Section 5 |
| Registered as an employer before paying staff | 3 | S2 | EMPLOYEES | 4 | Slot: Revenue employer registration confirmation. **[verify]** the exact registration deadline (the page read does not state it) | https://www.revenue.ie/en/starting-a-business/starting-a-business/employing-people.aspx (published 20 Oct 2025), checked 16 Nov 2026 |
| Pay reported to Revenue on or before each payday | 3 | S2 | EMPLOYEES | 5 | Attestation. Income tax, PRSI and USC deducted; each employee's employment registered | Same page, checked 16 Nov 2026 |
| Corporation tax registration | 3 | S2 | ALL | 4 | Slot: Revenue registration letter. **[verify]**: the registration duty and timing were not confirmed from a Revenue page | Revenue, **[verify]**: not read |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Central Bank authorisation for payment, e-money or crypto-asset services | 3 | S2 | SECTOR.PAYMENTS, .CRYPTO | 3 | Central Bank registers. **[verify]** the register pages and export format; the page fetched showed only navigation | https://www.centralbank.ie/regulation/industry-market-sectors/payment-institutions, **[verify]**: content not readable by our tool on 16 Nov 2026 |
| Activity authorisation shown on the website | 4 | S3 | SECTOR.* | 5 | Attestation. Where the activity needs authorisation, the supervisory authority's details must be given | S.I. 68/2003 reg 7(1)(f), as above |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Company particulars on the website | 4 | S2 | WEBSITE | 5 | Attestation until a URL check exists. Name, legal form, place of registration, registration number and registered office address, displayed prominently; any share capital shown must be the paid-up capital. Category 4 offence | Companies Act 2014 s.151(4): https://revisedacts.lawreform.ie/eli/2014/act/38/section/151/revised/en/html, checked 16 Nov 2026 |
| Company particulars and directors on letters and order forms | 4 | S2 | ALL | 5 | Attestation. Letters also name the directors (and nationality if not Irish) | s.151(1)-(2), as above |
| E-commerce service-provider information | 4 | S2 | WEBSITE | 5 | Attestation. Easily, directly and permanently accessible: name, geographic address, email, register and number, VAT number, licensing authority, professional rules where relevant; prices clear and unambiguous | S.I. 68/2003 reg 7(1), as above. See EU Section 3 |
| Distance-contract information before the consumer is bound | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.terms_found`; content attested. Schedule 3 information in plain language, plus the model cancellation form where a right to cancel exists. **[verify]** the cancellation period rules (s.113 and s.114 not read) | Consumer Rights Act 2022 s.106: https://www.irishstatutebook.ie/eli/2022/act/37/section/106/enacted/en/html, checked 16 Nov 2026. See EU Section 4 |
| Refund, cancellation and complaints pages | 4 | S3 | CONSUMER | 1 | `web.policy.refund_policy_found`, `.complaints_policy_found` | As above |
| Withdrawal function | 4 | S3 | CONSUMER | 5 | Attestation. **[verify]** Irish transposition of Directive (EU) 2023/2673 and its date | EU Section 4; Irish text not read |
| Accessibility statement | 4 | S3 | CONSUMER | 1 | `web.policy.accessibility_found`. **[verify]** the Irish transposition of the European Accessibility Act and its micro-enterprise exemption | EU Section 8; Irish text not read |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Directors authorised to allot shares | 5 | S4 | INVESTED | 5 | Vault: ordinary resolution or constitution clause. Within authorised capital where the constitution states one. Knowing breach is a category 3 offence | s.69(1)-(5): https://revisedacts.lawreform.ie/eli/2014/act/38/section/69/revised/en/html, checked 16 Nov 2026 |
| Pre-emption offer made or disapplied | 5 | S4 | INVESTED | 5 | Vault. Cash issues are first offered pro rata to existing holders, open at least 14 days, unless the constitution or a special resolution disapplies it (also not for non-cash issues, employee schemes, bonus shares) | s.69(6), (12), as above |
| Return of allotments delivered within 30 days | 5 | S4 | INVESTED | 4 | Slot: CRO receipt for the return of allotments (**[verify]** form name, believed B5). Category 4 offence | s.70(7): https://revisedacts.lawreform.ie/eli/2014/act/38/section/70/revised/en/html, checked 16 Nov 2026 |
| Register of members updated after the issue | 5 | S4 | INVESTED | 5 | dup of Section 2 (28 days) | s.169 |
| Beneficial-owner update after the round | 5 | S4 | INVESTED | 4 | dup of Section 2 | S.I. 110/2019 reg 23 |
| No public offer of shares outside the exemptions | 5 | S4 | INVESTED (wide investor outreach or crowdfunding) | 5 | Attestation. An LTD may not offer securities to the public or seek listing; share offers to qualified investors, to 149 or fewer others, or both, are allowed. Category 2 offence. Trigger for lawyer review | s.68: https://revisedacts.lawreform.ie/eli/2014/act/38/section/68/revised/en/html, checked 16 Nov 2026. See EU Section 10 |

### Section 11 — AI

The AI Act obligations and dates are in EU Section 7 (as amended by Regulation (EU) 2026/1744: Annex III high-risk from 2 Dec 2027, Annex I from 2 Aug 2028, new art. 5 prohibitions from 2 Dec 2026, art. 50(2) marking for systems already on the market by 2 Dec 2026; https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng, checked 16 Nov 2026).

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Irish AI Act authorities | 6 | S3 | AI | — | Not an item: names who enforces. The Regulation of Artificial Intelligence Act 2026 was signed on 21 Jul 2026; the AI Office of Ireland is the single point of contact and coordinator; sectoral regulators are the competent authorities. **[verify]** the list of market surveillance authorities (not named on the page read) | https://enterprise.gov.ie/en/news-and-events/department-news/2026/july/20260730.html (dated 30 Jul 2026), checked 16 Nov 2026 |
| AI use disclosed to users | 6 | S3 | AI | 1 / 5 | `web.policy.ai_disclosure_found`. Duty itself: EU Section 7 (art. 50) | EU Section 7 |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above.

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Annual return (B1) | Section 3 | 56 days after each ARD (first ARD 6 months after incorporation) | Auto: `registry.ie.cro.next_annual_return_due` |
| Financial statements | Section 3 | Made up to no more than 9 months before the return | Auto: `registry.ie.cro.last_accounts_on` |
| AGM | Section 3 | Yearly, no more than 15 months apart, unless dispensed with | Attestation |
| Beneficial-owner updates | Section 2 | After each change (reg 23) | Upload |
| Register of members | Section 2 | Within 28 days of a change | Attestation |
| Return of allotments | Section 10 | Within 30 days of an allotment | Upload |
| VAT threshold | Section 7 | Running test in each calendar year | VIES once registered |
| Payroll | Section 7 | On or before each payday | Attestation |
| Trademark renewal | Section 5 | Every 10 years | Upload |
| AI Act milestones | Section 11 | 2 Dec 2026; 2 Dec 2027; 2 Aug 2028 | Calendar |

---

## 4. Counts by tier

| Tier | Items | What this means |
|---|---|---|
| 1 Official live or URL scan | 16 (3 "1 / 5", 1 "5 + 1") | The CRO covers registration, status and the annual return cycle; VIES covers VAT; the website scan covers privacy, cookies, terms and consumer pages |
| 2 Licensed vendor | 0 | Not needed: the CRO is official |
| 3 Official list import | 2 | Sanctions lists; Central Bank registers |
| 4 Document-verified | 15 | Constitution, RBO filings, officers and EEA-director alternatives, audit exemption, IPOI certificate, employer and tax registration, return of allotments |
| 5 Attested | 19 | Registers, AGM, IP ownership, cookie banner details, website particulars, consumer content, fundraising decisions |

53 rows: 52 items (3 of them dups) and 1 "not an item" row (AI authorities).

---

## 5. The core set every Irish tech company must show at Stage 2

1. On the CRO register with normal status; annual return not overdue (Tier 1)
2. Constitution uploaded; register of members kept (Tier 4 / 5)
3. Beneficial owners filed with the RBO (Tier 4)
4. At least one director, a secretary who is not the sole director, and an EEA-resident director or a bond or s.140 certificate (Tier 4)
5. Website shows the Companies Act particulars and e-commerce information (Tier 5 until scanned)
6. Privacy notice and cookie consent (Tier 1, WEBSITE)
7. Founders' and contractors' IP assigned; trademark filed (Tier 5 / 4)

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

1. CRO status words and codes, and the first real CRO reply (no key yet).
2. CRO late-filing fees (€100 plus €3 a day, up to €1,200, reported but not read).
3. Commencement of the 2024 Act's substituted s.363 (audit exemption lost only on a second late return in 5 years); reportedly 16 Jul 2025.
4. RBO: start date of the 14-day follow-up filing under reg 23(5); any amendment to S.I. 110/2019 since it was made, including access after the CJEU judgment of 22 Nov 2022.
5. Employee inventions: whether any statutory rule applies (Patents Act 1992 not read).
6. Requirements for a valid copyright assignment (CRRA 2000 s.120 not read).
7. Trade mark term: from registration or from filing after the 2018 amendments.
8. DPC 2020 cookie guidance note details (equal prominence, implied consent, refresh period): PDF not extracted.
9. Revenue: employer registration deadline; corporation tax registration duty and timing.
10. Central Bank register pages and formats.
11. Consumer Rights Act 2022 cancellation periods (s.113, s.114) and the Irish transposition of Directive (EU) 2023/2673.
12. Irish transposition of the European Accessibility Act.
13. Irish AI Act market surveillance authorities list.
14. Return of allotments form name (believed B5).
15. Engine: an officers source (EEA director, secretary), an RBO route, a URL check for the s.151 website particulars, and a DPC complaint-route fact.

---

## Not encoded (16 Nov 2026)

The draft pack `packages/rules/src/packs/ie.ts` (IE, version 0.1.0) holds 24 Irish rules plus 35 EU common rules (`addEuCommon`; the EU company-particulars and withdrawal-function rules are replaced by the Irish `IE.CORP.COMPANY_PARTICULARS` and `IE.CONSUMER.WITHDRAWAL_FUNCTION`, the second waiting for review). These map items have no rule of their own:

| Item | Section | Why |
|---|---|---|
| Registered with the CRO as a private company limited by shares | 1 | [verify]. Being on the register is read by `IE.CORP.STATUS`; the company-type words the CRO returns are unconfirmed and would decide a pass |
| Company status normal (not struck off, not in liquidation) | 1 | Encoded as `IE.CORP.STATUS`, which cites the untagged core-set line. The [verify] is the status words: only "normal" passes, and any other status is "to check", never a gap |
| Company name not on a sanctions list | 1 | Covered by `INTL.SANCT.SCREENING` |
| Beneficial owners filed with the RBO within 5 months of incorporation | 2 | Encoded as `IE.CORP.RBO_FILING`, which cites the untagged core-set line; the [verify] is the RBO guidance page, not the statutory duty |
| Beneficial-owner changes filed with the RBO | 2 | [verify] how the 14-day start date is set. After a round, covered by `IE.CORP.UBO_CHANGES`, which cites the Section 10 line and sets no day count |
| Annual return (B1) delivered within 56 days of the ARD | 3 | Encoded as `IE.CORP.ANNUAL_RETURN`, which cites the core-set and Section 12 lines. The [verify] is the late-fee amounts, which the rule doesn't use. No fact says a return is overdue yet, so the rule is an attestation with the CRO date as its deadline |
| Small company status (for exemptions) | 3 | Information for the audit-exemption item (`IE.CORP.AUDIT`); the thresholds are not put into logic |
| Audit exemption not lost through a late annual return | 3 | [verify] the commencement of the substituted s.363, which decides when the exemption is lost |
| Employee inventions | 5 | [verify] whether any statutory rule applies. Covered by `INTL.IP.STAFF_ASSIGNMENT` (a written clause) |
| Founders' and contractors' IP assigned in writing | 5 | [verify] the formal requirements (CRRA 2000 s.120). Covered by `INTL.IP.OWNER_ASSIGNMENT` and `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| Trademark filed at the IPOI (or as an EU trade mark) | 5 | Encoded as `IE.IP.TRADEMARK`, which cites the untagged core-set line. The [verify] is when the 10-year term starts, so the rule sets no renewal date |
| Privacy notice published | 6 | Covered by EU common rules `IE.DP.PRIVACY_NOTICE` and `IE.DP.NOTICE_AUTHORITY`, which cite this line. No DPC complaint-route fact exists yet |
| Age of digital consent is 16 | 6 | Covered by EU common rule `IE.DP.CHILD_CONSENT`, with the age set to 16 |
| DPO details notified to the DPC | 6 | Covered by EU common rule `IE.DP.DPO`, which cites this line. No rule reads `web.policy.dpo_contact`: nothing tells us a DPO has been named |
| Consent before non-essential cookies | 6 | Covered by EU common rule `IE.DP.COOKIE_CONSENT`, which cites this line |
| Reject as easy as accept; no implied consent; consent refreshed | 6 | [verify] the DPC guidance note was not extracted |
| Cookie policy | 6 | Covered by EU common rule `IE.DP.COOKIE_POLICY`, which cites this line |
| VAT registration once over the threshold | 7 | Covered by EU common rule `IE.TAX.VAT_VIES`, which cites this line; the thresholds are not put into logic |
| Corporation tax registration | 7 | [verify] the duty and its timing were not confirmed |
| Activity authorisation shown on the website | 8 | Covered by EU common rule `IE.COM.REGULATOR_NAMED`, which cites this line |
| E-commerce service-provider information | 9 | Covered by EU common rules `IE.COM.WEBSITE_IDENTITY` and `IE.CONSUMER.PRICES`, which cite this line |
| Distance-contract information before the consumer is bound | 9 | Covered by EU common rule `IE.CONSUMER.PRE_CONTRACT_INFO`; the line carries [verify] on cancellation periods, so it isn't cited. Terms pages are checked by `INTL.COM.TERMS` |
| Refund, cancellation and complaints pages | 9 | Covered by EU common rules `IE.CONSUMER.WITHDRAWAL` and `IE.CONSUMER.COMPLAINTS`, which cite this line |
| Accessibility statement | 9 | Covered by EU common rule `IE.CONSUMER.ACCESSIBILITY`; the Irish transposition is [verify], so the line isn't cited |
| Irish AI Act authorities | 11 | Not an item: it names who enforces |

Section 12 rows are recurrences, not items: they are cited by the rules they schedule. Rules that cite a [verify] line and so wait for review: `IE.EMP.EMPLOYER_REGISTRATION`, `IE.FIN.CENTRAL_BANK_AUTHORISATION`, `IE.CONSUMER.WITHDRAWAL_FUNCTION`, `IE.FUND.RETURN_OF_ALLOTMENTS`.
