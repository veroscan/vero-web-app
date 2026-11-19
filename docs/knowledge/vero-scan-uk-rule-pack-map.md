# Vero Scan — UK Rule-Pack Map

**Project:** Vero Scan (Code and Clause LTD)
**Prepared by:** Emmanuel Edet, Independent Contractor
**Date:** 4 November 2026
**Source:** "UK Tech Company: Incorporation and Operational Legal Requirements" (18 sections, received 4 November 2026), mapped against the Client's Stage 1–5 checklists and the *Verification Solutions Matrix* (section 5).
**Status:** Draft mapping for lawyer review. Stage and trigger assignments are proposals; thresholds marked **[verify]** must be confirmed before they are encoded.

> Technical mapping, not legal advice. A Code & Clause lawyer approves each rule before it affects a score.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every UK company at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data (ICO fee applies unless exempt) |
| EMPLOYEES | Has employees (PAYE, auto-enrolment, employers' liability insurance from the first employee) |
| CONTRACTORS | Uses contractors or consultants |
| FOREIGN_WORKERS | Sponsors workers from outside the UK |
| PREMISES | Occupies business premises (not home-based) |
| CONSUMER | B2C product |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| API | Offers API access to third parties |
| AI | Uses or builds AI in the product |
| EXPORTS | Exports controlled or dual-use technology |
| SECTOR.PAYMENTS, .CREDIT, .CRYPTO, .BANKING, .TELECOMS, .HEALTHTECH, .GAMBLING, .ENERGY, .PAYMENT_SYSTEM | Sector packs (section 14 of the source document) |
| INVESTED | Has raised or is raising (EIS/SEIS, SAFE, convertibles) |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault). Routes refer to the *Verification Solutions Matrix*, section 5. Companies House items use the free API (`GET /company/{number}` and sub-resources).

**Duplicates.** The source repeats items across sections 1, 7, 13, 16, 17 and 18 (PAYE registration, employment contracts, staff handbook, right-to-work checks, employers' liability insurance, workplace pension, DPA, privacy policy, terms of service, cookie policy, articles, board and shareholder resolutions, software licence and development agreements, NDA). Each is encoded once; later mentions are marked "dup".

---

## 2. Consolidation notes for the Client

1. **Section 7 ("Companies House and HMRC: Employer Registrations") and section 13 ("Employment and Immigration") overlap** on PAYE, pensions, contracts, handbook, right-to-work and insurance. Merge into one "Employer" section.
2. **Section 18 (compliance calendar) is not a list of new items.** It is the recurrence schedule for items already listed. In the engine it becomes `recurrence` fields on those rules, and Companies House, ICO, FCA and IPO renewals can be monitored automatically.
3. **"Ofcom telecommunications licence" is not a licence.** Providers operate under the General Conditions of Entitlement without a licence; only spectrum and Wireless Telegraphy Act licences are licences. The rows below reflect that.
4. **Stray lines.** "GOV.UK +2" (twice) and "FCA +1" are leftover citation markers, not items.
5. **Scotland and Northern Ireland.** Companies House, HMRC, ICO, FCA and UKIPO are UK-wide, so nothing in this map changes by nation. Local-authority items (section 11) vary by council.

---

## 3. Section-by-section map

### Section 1 — Companies House

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Company name availability search | 1 | S1 | ALL | 1 | Companies House search API; "not found" confirms pre-incorporation |
| Incorporation application; Certificate of Incorporation; company registration number | 1 | S2 | ALL | 1 | `company_status`, `company_number`, `date_of_creation` |
| Memorandum of Association; Articles of Association | 1 | S2 | ALL | 1 / 4 | Incorporation documents via the Document API (filing history, `incorporation` category); upload if the articles were later amended and not filed |
| Statement of Capital | 1 | S2 | ALL | 1 | Filing history (`capital` category) and confirmation statement |
| Registered office address | 1 | S2 | ALL | 1 | `registered_office_address`; flags `registered_office_is_in_dispute`, `undeliverable_registered_office_address` |
| Registered email address | 1 | S2 | ALL | 5 | Not published by Companies House; attestation |
| SIC code | 1 | S2 | ALL | 1 | `sic_codes[]`; cross-check against Layer B sector inference |
| Director appointment documentation | 1 | S2 | ALL | 1 | `GET /company/{n}/officers`: active and resigned, `appointed_on` |
| Shareholder details | 1 | S2 | ALL | 1 / 4 | Shareholders appear on the confirmation statement document (parse via Document API) [verify parse reliability]; upload register as fallback |
| PSC registration | 1 | S2 | ALL | 1 | `GET /company/{n}/persons-with-significant-control`: `natures_of_control[]`, `is_sanctioned` |
| Director identity verification | 1 | S2 (mandatory for new appointments since 18 Nov 2025; existing officers by their next confirmation statement) | ALL | 1 | `identity_verification_details.identity_verified_on` on officers |
| PSC identity verification | 1 | S2 | ALL | 1 | Same fields on PSC entries; `appointment_verification_statement_due_on` gives the deadline |
| Companies House personal codes | 1 | S2 | ALL | 5 | Personal to each director; not published; attestation |
| Confirmation Statement | 1 | S2 (annual) | ALL | 1 | `confirmation_statement.{next_due, overdue, last_made_up_to}`; fee £50 since 1 Feb 2026 |
| Annual accounts | 1 | S2 (first accounts due 21 months after incorporation; then 9 months after year end) | ALL | 1 | `accounts.next_accounts.{due_on, overdue}`, `accounts.last_accounts.type` |
| Change of director filings | 1 | event-driven | ALL | 1 | Filing history `officers` category |
| Change of registered office filings | 1 | event-driven | ALL | 1 | Filing history `address` category |
| Share allotment filings (SH01) | 5 | event-driven | ALL | 1 | Filing history `capital` category; grouped SH01s infer a funding round |
| Share transfer documentation | 5 | event-driven | ALL | 1 / 5 | Transfers show on the next confirmation statement; stock transfer forms in the vault |
| Register of Members; Register of Directors; Register of PSCs | 1 | S2 | ALL | 5 | Statutory books (unless kept on the central register at Companies House [verify]) |
| Register of Charges | 1 | S2 | ALL | 1 | `GET /company/{n}/charges`: outstanding, satisfied |
| Board resolutions; shareholder resolutions | 1 | S2 | ALL | 5 | Vault; special resolutions filed appear in filing history (`resolution` category) |

### Section 2 — HMRC

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Corporation Tax registration; UTR | 3 | S2 (within 3 months of starting to trade) | ALL | 4 | Upload HMRC letter (UTR not public) |
| Corporation Tax payment records; returns | 3 | S3 (annual) | ALL | 5 | Vault |
| VAT registration; VAT certificate | 3 | S3 (taxable turnover above the registration threshold [verify current figure]) | ALL | 1 | HMRC "Check a UK VAT number" API (official, free) confirms number, name and address; upload certificate as fallback |
| VAT returns | 3 | S3 (quarterly) | ALL (VAT-registered) | 5 | Vault |
| PAYE registration; PAYE reference; Accounts Office reference | 3 | S2 (before the first payday) | EMPLOYEES | 4 | Upload HMRC PAYE letter; references are not public |
| PAYE payroll records; employer National Insurance | 3 | S2 | EMPLOYEES | 5 | Vault |
| Construction Industry Scheme registration | 3 | — | n/a for most tech companies | 4 | Only if construction operations; upload |
| Making Tax Digital compliance | 3 | S3 | ALL (VAT-registered) | 5 | Attestation; software in use |
| Tax exemption and relief applications | 3 | S3 | ALL (optional) | 5 | Vault |
| R&D tax relief documentation | 3 | S3 | ALL (eligible) | 5 | Vault (claim notification and additional information form since 2023 [verify]) |
| Patent Box election | 2 | S3 | ALL (holds qualifying patents) | 5 | Vault |
| EIS advance assurance; SEIS advance assurance | 5 | S4 | INVESTED (UK angel or VC investors) | 4 | Upload HMRC advance assurance letter; not public |

### Section 3 — ICO

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| ICO data protection fee registration; registration confirmation; fee renewal | 3 | S2 (annual) | PERSONAL_DATA (unless exempt) | 3 | ICO register daily file matched on name and postcode; user-supplied Z-reference as fallback; tiers £52 / £78 / £3,763 |
| Data protection compliance documentation | 3 | S2 | PERSONAL_DATA | 5 | Vault |
| DPO appointment | 3 | S2 | PERSONAL_DATA (Art 37 tests: large-scale monitoring or special-category data) | 5 + 1 | Attestation; URL scan checks the DPO contact in the privacy notice |
| Privacy Policy / Privacy Notice | 3 | S2 | WEBSITE / APP | 1 | URL scan (UK GDPR Arts 13/14; complaint route to the ICO) |
| Data Processing Agreement | 3 | S2 | PERSONAL_DATA (uses processors) | 5 | Vault |
| Records of Processing Activities | 3 | S2 | PERSONAL_DATA | 5 | Vault |
| DPIA | 6 | S2 | PERSONAL_DATA (high-risk processing, AI, profiling) | 5 | Vault |
| Data breach response policy; breach notification records | 3 | S2 / event-driven | PERSONAL_DATA | 5 | Vault (72-hour ICO notification) |
| Data subject access request procedures; data subject rights procedures | 3 | S2 | PERSONAL_DATA | 5 + 1 | Attestation; URL scan checks the rights section |
| Data retention policy; data deletion policy | 3 | S2 | PERSONAL_DATA | 5 + 1 | Attestation; URL scan checks a retention statement |
| Cookie Policy | 3 | S2 | WEBSITE | 1 | URL scan |
| Cookie consent mechanism | 3 | S2 | WEBSITE | 1 | URL scan (PECR as amended by the DUAA 2025, in force 5 Feb 2026: no non-essential cookies before consent, reject as easy as accept, new analytics and functionality exemptions with notice and opt-out) |
| International data transfer documentation; IDTA; UK Addendum to EU SCCs | 3 | S2 | PERSONAL_DATA (data outside the UK) | 5 | Vault |
| Data protection audit documentation; training records | 3 | S3 | PERSONAL_DATA | 5 | Vault |
| Data protection complaint handling procedures | 3 | S2 (statutory duty from 19 Jun 2026 [verify]) | PERSONAL_DATA | 5 + 1 | Attestation; URL scan checks a complaints route in the notice |
| UK representative appointed (added 18 Nov 2026) | 3 | S2 | NON_UK (no establishment in the UK; offers goods or services to people in the UK, or monitors their behaviour there), PERSONAL_DATA | 1 / 5 | URL scan: `web.policy.uk_representative_named` (the notice names a UK representative; Art 13(1)(a) asks for the representative's identity and contact details "where applicable"); attestation otherwise. Exempt for occasional processing without large-scale special-category or criminal-offence data that is unlikely to result in a risk, and for public authorities (Art 27(2)). A market overlay: it reaches a company outside the UK with UK users. Source: UK GDPR arts 3(2), 13(1)(a), 27(1), (2), (4), (5), https://www.legislation.gov.uk/eur/2016/679/article/27 (latest revised version, changes to 30 Sep 2026; art 27(3) omitted), checked 18 Nov 2026 |

### Section 4 — FCA

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| FCA authorisation; registration; confirmation; permissions; Financial Services Register entry | 3 | S2 (before any regulated activity) | SECTOR.PAYMENTS, .CREDIT, .CRYPTO, .BANKING | 1 | FS Register API `Firm/{FRN}`, `/Permissions`, `/Individuals`, `/AR`; user-supplied FRN as fallback |
| FCA Connect application | 3 | S2 | SECTOR.* | 5 | Process evidence; the register entry is the outcome |
| Payment Institution authorisation; Small PI registration; EMI authorisation; Small EMI registration | 3 | S2 | SECTOR.PAYMENTS | 1 | FS Register (firm type and permissions) |
| AISP registration; Open Banking registration | 3 | S2 | SECTOR.PAYMENTS (account information services) | 1 / 4 | FS Register; Open Banking directory enrolment evidence |
| Consumer Credit permissions | 3 | S2 | SECTOR.CREDIT | 1 | FS Register permissions |
| Cryptoasset business registration | 3 | S2 | SECTOR.CRYPTO | 1 | FS Register (cryptoasset firms under the MLRs; full authorisation regime expected about Oct 2027 [verify]) |
| AML registration | 3 | S2 | SECTOR.CRYPTO or other MLR-supervised activity | 4 | HMRC-supervised businesses: upload registration; FCA-supervised: FS Register |
| Regulatory sandbox application | 3 | S2 | SECTOR.* (optional) | 4 | Upload |
| Approved Person / Senior Management Function approvals | 3 | S2 | SECTOR.* (authorised firms) | 1 | FS Register `/Individuals` |
| Compliance Manual; AML Policy; CDD and KYC procedures; sanctions screening policy; financial crime risk assessment | 3 | S2 | SECTOR.* | 5 | Vault |
| Complaints handling policy | 4 | S3 | SECTOR.* | 1 / 5 | URL scan if published; vault |
| Consumer Duty compliance documentation | 3 | S3 | SECTOR.* (retail customers) | 5 | Vault |
| Regulatory reporting documentation | 3 | S3 | SECTOR.* | 5 | Vault |
| Safeguarding documentation | 3 | S3 | SECTOR.PAYMENTS (authorised PI or EMI; CASS 15 from 7 May 2026) | 5 | Vault; annual safeguarding audit when safeguarded funds exceed £100k |
| Wind-down plan; regulatory capital documentation | 3 | S3 | SECTOR.* (authorised firms) | 5 | Vault |

### Section 5 — Payment Systems Regulator

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Payment system operator designation | 3 | S3 | SECTOR.PAYMENT_SYSTEM (operates a designated system) | 3 | PSR list of designated payment systems (public) |
| Payment system regulatory compliance documentation; PSR notifications | 3 | S3 | SECTOR.PAYMENT_SYSTEM | 5 | Vault; rarely applies to startups |

### Section 6 — Ofcom

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| "Ofcom telecommunications licence" | 3 | — | — | — | Not a licence; providers operate under the General Conditions. Encode as the row below |
| General Conditions of Entitlement compliance | 3 | S2 | SECTOR.TELECOMS | 5 | Attestation; Ofcom's register of notified providers where applicable [verify] |
| Electronic Communications Code powers | 3 | S3 | SECTOR.TELECOMS (network operators) | 3 | Ofcom register of Code operators (public) [verify format] |
| Telephone number allocation; numbering application | 3 | S3 | SECTOR.TELECOMS (allocates numbers) | 3 | Ofcom numbering data (public downloads) [verify] |
| Premium Rate Services registration; Phone-paid Services Authority registration | 3 | S3 | SECTOR.TELECOMS (premium-rate services) | 3 | PSA public register [verify] |
| Emergency communications compliance; telecommunications equipment compliance | 3 | S3 | SECTOR.TELECOMS | 5 | Vault |
| Ofcom regulatory reporting | 3 | S3 (annual) | SECTOR.TELECOMS | 5 | Vault |
| Spectrum licence; Wireless Telegraphy Act licence | 3 | S3 | SECTOR.TELECOMS (uses spectrum) | 3 | Ofcom Wireless Telegraphy Register (public) [verify] |

### Sections 7 and 13 — Employer obligations and immigration

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| PAYE employer registration; payroll scheme; employer NI | 3 | S2 | EMPLOYEES | — | dup of section 2 |
| Workplace pension scheme; scheme registration; Pensions Regulator compliance; automatic-enrolment documentation; contribution records | 3 | S2 (duties start on the first employee's start date; declaration of compliance within 5 months) | EMPLOYEES | 4 / 5 | Upload declaration of compliance; the Pensions Regulator does not publish it |
| Employment contracts | 4 | S2 (written statement due by day one) | EMPLOYEES | 5 | Vault; IP assignment clause (CDPA s11(2) covers employees, but confirm scope) |
| Employee handbook / staff handbook | 4 | S5 | EMPLOYEES | 5 | Vault |
| Right to Work verification records; checks | 3 | S2 | EMPLOYEES | 5 | Vault; attestation per hire |
| National Minimum Wage compliance documentation | 3 | S2 | EMPLOYEES | 5 | Vault |
| Holiday and working time records | 3 | S2 | EMPLOYEES | 5 | Vault |
| Health and safety documentation | 3 | S2 | EMPLOYEES | — | dup of section 12 |
| Employers' Liability Insurance certificate | 3 | S2 (compulsory for most employers; £5m minimum cover) | EMPLOYEES | 4 | Upload certificate (must be displayed or available to staff) |
| Contractor agreements | 4 | S2 | CONTRACTORS | 5 | Vault; written IP assignment required (CDPA s90(3)); IR35 status note |
| Employee onboarding documentation | 4 | S2 | EMPLOYEES | 5 | Vault |
| Sponsor licence | 3 | S3 | FOREIGN_WORKERS | 3 | Home Office register of licensed sponsors (published spreadsheet, updated regularly) |
| Certificate of Sponsorship; Skilled Worker visa documentation; immigration compliance records | 3 | S3 | FOREIGN_WORKERS | 5 | Attestation (personal documents; store "held / not held" per role) |
| Equality and diversity policy; disciplinary and grievance procedures | 4 | S3 | EMPLOYEES | 5 | Vault |
| Whistleblowing policy | 4 | S5 | EMPLOYEES (also FCA-regulated firms earlier) | 5 | Vault |

### Section 8 — Department for Business and Trade (export control)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Export licence; strategic export control licence; dual-use technology export authorisation | 3 | S3 | EXPORTS (encryption, AI or other controlled technology to non-UK customers) | 4 | Upload licence or OGEL registration; not public |
| Import licence | 3 | S3 | EXPORTS (controlled goods inbound) | 4 | Upload |
| UK trade sanctions compliance documentation; export control compliance documentation | 3 | S3 | EXPORTS, SECTOR.PAYMENTS, .CRYPTO | 5 | Vault; sanctions screening against the UK Sanctions List (Tier 3 for the counterparties) |

### Section 9 — UK Intellectual Property Office

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Trademark search | 2 | S2 | ALL | 5 | Search report |
| Trademark application; registration certificate | 2 | S2 (application) / S3 (registration; in every operating market from S3) | ALL | 4 | Upload; verify the number on the IPO case page (`UK00` + 10 digits); EUIPO API for UK009 comparable marks |
| Trademark renewal | 2 | every 10 years | ALL | 4 | Case page shows status and renewal date |
| Patent application; patent grant; assignment documentation | 2 | S3 | ALL (optional; relevant to deeptech) | 3 / 4 | Espacenet / EPO Open Patent Services for GB publications [verify API terms]; upload for unpublished applications |
| Registered design application; certificate | 2 | S3 | ALL (optional) | 4 | Upload; IPO design search (web) [verify] |
| Copyright ownership records; copyright assignment agreements; IP ownership and transfer documentation | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Vault; Client's Stage 1 and 2 lists |
| Software licensing documentation | 2 | S3 | ALL | 5 | Vault |

### Section 10 — NCSC and cybersecurity

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Cyber Essentials certification; Cyber Essentials Plus | 3 | S3 (required for many public-sector contracts) | ENTERPRISE (public sector or enterprise procurement) | 3 | IASME public register of certified organisations [verify search or export]; upload certificate |
| Cybersecurity compliance documentation; risk assessment; Information Security Policy; security audit documentation; vulnerability management policy; supplier security assessment | 3 | S3 | ALL | 5 | Vault |
| Incident Response Plan | 3 | S3 | ALL | 5 | Vault; Client's Stage 5 item |
| Business Continuity Plan; Disaster Recovery Plan | 3 | S5 | ALL | 5 | Vault |
| Penetration testing reports | 3 | S4 | ALL (expected by investors and enterprise clients) | 5 | Vault |
| Cybersecurity insurance documentation | 3 | S5 | ALL (optional) | 5 | Vault |

### Section 11 — Local authority

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Business rates registration | 3 | S2 | PREMISES | 3 / 4 | VOA rating list (public, by address) [verify]; upload bill |
| Business premises registration; planning permission; change of use approval; premises licence; advertisement consent; environmental permits; home business permission | 3 | S2 | PREMISES (as applicable) | 4 | Upload; council registers vary |
| Fire safety documentation; health and safety compliance documentation; waste management documentation | 3 | S2 | PREMISES | 5 | Vault |

### Section 12 — Health and Safety Executive

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Health and Safety Policy (written policy required at 5 or more employees) | 3 | S2 | EMPLOYEES | 5 | Vault |
| Workplace risk assessment; DSE assessment; fire risk assessment | 3 | S2 | EMPLOYEES, PREMISES | 5 | Vault |
| Accident and incident records; RIDDOR reporting | 3 | S2 / event-driven | EMPLOYEES | 5 | Vault |
| COSHH assessment; HSE registration or notification | 3 | — | Rarely applies to software companies | 5 | Vault |
| Workplace safety training records | 3 | S3 | EMPLOYEES | 5 | Vault |

### Sections 15 and 14 (healthtech rows) — Medical technology

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| MHRA medical device registration | 3 | S3 (before placing on the market) | SECTOR.HEALTHTECH (device or software as a medical device) | 3 | MHRA Public Access Registration Database (public search) [verify export]; upload confirmation |
| Conformity assessment; UKCA marking; CE marking; Declaration of Conformity; technical documentation; clinical evaluation | 3 | S3 | SECTOR.HEALTHTECH | 5 / 4 | Vault; Declaration of Conformity upload |
| Clinical investigation approval | 3 | S3 | SECTOR.HEALTHTECH (investigations) | 4 | Upload MHRA approval |
| CQC registration | 3 | S2 | SECTOR.HEALTHTECH (regulated activities) | 1 | CQC public register and open API [verify current API] |
| NHS England compliance documentation; DSPT; DTAC; DCB0129; DCB0160; Clinical Safety Officer appointment | 3 | S3 | SECTOR.HEALTHTECH (NHS customers) | 4 / 5 | DSPT status is published for registered organisations [verify]; others vault |

### Section 14 — Other sector regulators (table rows not covered above)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| PRA authorisation | 3 | S2 | SECTOR.BANKING | 1 | FS Register (dual-regulated firms) |
| Gambling operating licence | 3 | S2 | SECTOR.GAMBLING | 3 | Gambling Commission public register of licensees [verify export] |
| Ofgem energy licence | 3 | S2 | SECTOR.ENERGY | 3 | Ofgem licence register (public) |
| ASA Advertising Code compliance | 4 | S3 | CONSUMER | 5 | Vault; ASA rulings are public (adverse rulings as a signal) [verify] |
| CMA competition and consumer law compliance | 4 | S3 | CONSUMER | 5 + 1 | Vault; URL scan for drip pricing and fake-review controls (DMCC Act 2024) |
| Trading Standards product and consumer compliance | 4 | S3 | CONSUMER (physical products) | 5 | Vault |

### Section 16 — AI and software companies

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| AI Governance Policy | 6 | S5 | AI | 5 | Vault; Client's Stage 5 "AI Governance Framework" |
| AI Risk Assessment; AI Impact Assessment | 6 | S3 | AI | 5 | Vault; links to the DPIA and UK GDPR Art 22A–D safeguards |
| AI Transparency Documentation | 6 | S3 | AI | 1 / 5 | URL scan for published disclosures; vault |
| AI Model Documentation; AI Training Data Documentation; AI Copyright and Licensing Records | 6 | S3 | AI | 5 | Vault; Client's Stage 2 "Training Data Documentation" |
| AI Supplier and Vendor Agreements | 6 | S3 | AI (uses third-party models or APIs) | 5 | Vault; Client's Stage 3 "AI Model Usage Agreement" |
| Software Development Agreement | 2 | S2 | CONTRACTORS | 5 | Vault |
| Software Licence Agreement | 2 | S3 | ALL | 5 | Vault |
| SaaS Agreement | 4 | S3 | ALL (SaaS product live) | 1 / 5 | URL scan if published; vault for the enterprise version |
| API Terms and Conditions | 4 | S3 | API | 1 / 5 | URL scan if published |
| End User Licence Agreement | 4 | S3 | APP | 1 | URL scan; App Store listing |
| Terms of Service | 4 | S3 | WEBSITE / APP | 1 | URL scan |
| Acceptable Use Policy | 4 | S3 | WEBSITE / APP | 1 / 5 | URL scan if published |
| Service Level Agreement | 4 | S3 | ENTERPRISE | 5 | Vault |
| Data Processing Agreement | 3 | — | — | — | dup of section 3 |
| Software Escrow Agreement | 2 | S5 | ENTERPRISE (where demanded) | 5 | Vault |
| Open Source Software Policy; Open Source Software Licence Register | 2 | S3 | ALL | 5 / 1 | Vault; a repository scan (if the customer connects GitHub) can generate the register and flag copyleft licences (Client's Stage 3 "Open Source Audit Report") |
| Cybersecurity Policy; Software Security Documentation | 3 | S3 | ALL | 5 | Vault |
| Vulnerability Disclosure Policy | 3 | S3 | WEBSITE / APP | 1 | URL scan (`/.well-known/security.txt` and a published policy) |
| Bug Bounty Policy | 3 | S5 | ALL (optional) | 1 / 5 | URL scan if published |
| Product Liability and Consumer Compliance Documentation | 4 | S3 | CONSUMER | 5 | Vault |

### Section 17 — Corporate and commercial legal documents

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Founders' Agreement; Founders' Vesting Agreement | 1 / 5 | S1 | ALL | 5 | Vault; Client's Stage 1 list |
| Shareholders' Agreement | 5 | S2 (full version at S4) | ALL | 5 | Vault |
| Share Option Plan; EMI Share Option Scheme documentation | 5 | S4 | ALL (equity compensation planned); EMI if eligible | 5 / 4 | Vault; EMI notifications to HMRC (upload) |
| Articles of Association | 1 | — | — | — | dup of section 1 |
| Board Resolutions; Shareholder Resolutions | 1 | — | — | — | dup of section 1 |
| Director Service Agreements | 1 | S5 | ALL | 5 | Vault |
| Employment Agreements; Contractor Agreements | 4 | — | — | — | dup of sections 7 and 13 |
| Non-Disclosure Agreement; Confidentiality Agreement | 2 | S1 | ALL | 5 | Vault (one item) |
| Intellectual Property Assignment Agreement; Invention Assignment Agreement | 2 | S1 | ALL (founders), CONTRACTORS, EMPLOYEES | 5 | Vault; Client's Stage 1 and 2 lists |
| Consultancy Agreement | 4 | S2 | CONTRACTORS | 5 | Vault |
| Commercial Services Agreement; Supplier Agreement | 4 | S3 | ALL | 5 | Vault (Client's Stage 2 "Vendor Agreement template") |
| Partnership Agreement; Joint Venture Agreement | 4 | S5 | ALL (where entered into) | 5 | Vault |
| Investment Agreement; SAFE Agreement; Convertible Loan Note Agreement; Subscription Agreement | 5 | S4 | INVESTED | 5 | Vault; SH01 filings corroborate completed rounds (Tier 1) |
| Data Processing Agreement; Privacy Policy; Terms of Service; Cookie Policy | 3 / 4 | — | — | — | dup of sections 3 and 16 |
| Website Terms and Conditions | 4 | S2 | WEBSITE | 1 | URL scan |
| Consumer Terms and Conditions; Refund and Cancellation Policy; Complaints Policy | 4 | S3 | CONSUMER | 1 | URL scan (Consumer Rights Act 2015; DMCC Act 2024 subscription rules [verify commencement]) |
| Website Accessibility Statement | 4 | S3 | WEBSITE (public-sector bodies must; others by contract or good practice) | 1 | URL scan (WCAG version, conformance level, contact, date) |

### Section 18 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above, and the ones marked "auto" are monitored without any upload:

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Confirmation Statement | Section 1 | Annual (12-month review period + 14 days) | Auto: Companies House `next_due` / `overdue` |
| Annual accounts | Section 1 | 9 months after year end | Auto: Companies House |
| Corporation Tax returns and payments | Section 2 | 12 months after year end (return); 9 months + 1 day (payment) | Attestation |
| VAT returns | Section 2 | Quarterly | Attestation |
| PAYE returns and remittances; employer NI | Section 2 | Monthly | Attestation |
| Workplace pension contributions | Sections 7/13 | Monthly; re-enrolment every 3 years | Attestation |
| ICO fee renewal | Section 3 | Annual | Auto: ICO register file `end_date` |
| FCA regulatory returns and annual fees | Section 4 | Per firm type | Attestation; register status auto |
| Ofcom regulatory returns | Section 6 | Annual | Attestation |
| Annual cybersecurity assessments (Cyber Essentials) | Section 10 | Annual | Auto if the IASME register is importable [verify] |
| Employment law compliance reviews | Sections 7/13 | Annual | Attestation |
| Licence renewals; insurance renewals | Various | Per licence | Attestation; expiry dates from uploads |
| Sponsor licence compliance | Section 13 | Licence renewal every 4 years [verify current rule] | Auto: sponsor register presence |
| Intellectual property renewals | Section 9 | Trademarks every 10 years; patents annually from year 5 | Auto for trademarks via the IPO case page; EUIPO API |

---

## 4. Counts by tier (after de-duplication)

| Tier | Items (approx.) | What this means for the product |
|---|---|---|
| 1 Official live or URL scan | 36 | Companies House covers almost all of section 1; FS Register covers FCA items; HMRC VAT check; CQC; website-published documents |
| 2 Licensed vendor | 0 | Not needed in the UK: official sources cover the registry |
| 3 Official list import | 14 | ICO register, sponsor register, PSR, Ofcom and PSA registers, IASME, MHRA, Gambling Commission, Ofgem, VOA (several marked [verify]) |
| 4 Document-verified | 22 | HMRC letters, pension declaration, insurance certificate, export licences, IP certificates, local-authority permissions, EIS/SEIS assurance |
| 5 Attested (vault) | 110 | Agreements, policies, registers, records |

About 50 items are verifiable without a document (Tiers 1–3), roughly double Nigeria's count, because Companies House and the FS Register expose so much.

---

## 5. The core set every UK tech company must show at Stage 2

Encoded with trigger ALL (plus WEBSITE where noted), these are the items the free scan reports on without any upload:

1. Company active; confirmation statement and accounts not overdue (Tier 1)
2. Directors and PSCs on record, with identity verification complete after the transition deadline (Tier 1)
3. No outstanding charges or insolvency events; no Gazette notices (Tier 1)
4. ICO fee registration current, unless exempt (Tier 3)
5. Privacy notice and cookie consent compliant with UK GDPR and PECR (Tier 1, WEBSITE)
6. Trademark filed for the brand (Tier 4)
7. Founders' agreement, founders' IP assignment, NDA template (Tier 5)
8. Articles, statutory registers, board resolutions (Tier 1 / 5)

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

- VAT registration threshold (current figure) and the Corporation Tax registration window.
- Whether shareholder details can be reliably parsed from confirmation statement documents, or whether an upload is needed.
- ICO register file header and the new complaints-handling duty commencement (19 Jun 2026).
- FCA: register API documentation and limits (login-walled); cryptoasset authorisation regime timing.
- Ofcom: which registers (notified providers, Code operators, numbering, Wireless Telegraphy) are importable and their formats; PSA register.
- IASME Cyber Essentials register: public search or export.
- MHRA PARD export; CQC API status; DSPT published status.
- Gambling Commission and Ofgem register exports; VOA rating list access.
- Home Office sponsor register: update cadence and matching keys.
- Espacenet / EPO OPS terms for GB patent lookups; IPO design search.
- DMCC Act subscription-contract rules commencement; sponsor licence renewal rule.
- Pensions: declaration-of-compliance deadline and re-enrolment cycle (encoded as recurrence).

### Website rules not encoded (17 Nov 2026): regulator named in the notice, and legal notice

The website scan can now read `web.policy.dpa_named`, `web.policy.dpa_countries`, `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, and the EU packs use them. GB: the privacy notice naming the ICO as the place to complain is already encoded (`GB.DP.PRIVACY_NOTICE`, through `web.policy.complaint_route_ico`, UK GDPR Art 13(2)(d)). A rule for company particulars on the website (name, company number, registered office) was NOT added: nothing in this map lists that duty, and the Companies Act trading-disclosure rules for websites were not read. If the lawyers confirm the duty, a rule can read `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, failing only when the page was read in a language the scan supports.

### Encoded 18 Nov 2026: UK representative

`GB.DP.UK_REPRESENTATIVE` (draft, layer 3, so it follows a company outside the UK into the UK market). "Established in the UK" is `derived.uk_established`: true for a company registered in the UK, otherwise the answer to the new question `uk_establishment`; offering to people in the UK is `GB` in the answer `user_countries`. It fails only when those answers show it applies and the website scan read the notice in a language it supports and found no UK representative named; a missing fact, or a site in another language, is "to check". The Art 27(2) exemption is the company's to confirm.
