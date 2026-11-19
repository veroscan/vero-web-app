# Vero Scan — Nigeria Rule-Pack Map

**Project:** Vero Scan (Code and Clause LTD)
**Prepared by:** Emmanuel Edet, Independent Contractor
**Date:** 4 November 2026
**Source:** "Nigeria Tech Company: Incorporation and Operational Legal Requirements" (29 sections, received 4 November 2026), mapped against the Client's Stage 1–5 checklists and the *Verification Solutions Matrix*.
**Status:** Draft mapping for lawyer review. Stage and trigger assignments are proposals; thresholds marked **[verify]** must be confirmed before they are encoded.

> Technical mapping, not legal advice. A Code & Clause lawyer approves each rule before it affects a score.

---

## 1. How to read the map

**Layer** (the six-layer scan): 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger** (what switches the item on, from Layer A/B facts or questionnaire answers):

| Trigger | Meaning |
|---|---|
| ALL | Every Nigerian company at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data; DCPMI tiers from the number of data subjects |
| EMPLOYEES | Has employees (statutory thresholds noted per item) |
| CONTRACTORS | Uses contractors or outsourced developers |
| FOREIGN | Foreign shareholders, directors or expatriate staff |
| FOREIGN_TECH | Pays a foreign party for technology, software, technical or management services |
| CONSUMER | B2C product |
| ENTERPRISE | Sells to enterprise clients |
| API | Offers API access to third parties |
| AI | Uses or builds AI in the product |
| SECTOR.PAYMENTS, .BANKING, .DIGITAL_ASSETS, .INVESTMENT, .LENDING, .TELECOMS, .INSURTECH, .HEALTHTECH, .PLATFORM | Sector packs (section 29 of the source document) |
| GOV_SUPPLIER | Supplies IT services to government bodies |

**Tier** (how Vero Scan verifies it): 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (upload plus authenticity check) · 5 attested (vault item, lawyer review on paid plans). Routes refer to the *Verification Solutions Matrix*, section 4.

**Duplicates.** The source lists several items twice (privacy policy, DPA, DPIA, ROPA, retention policy, breach policy, board resolutions, share certificates, statutory registers, software licence agreement, technology transfer agreement, employment agreements, NDA). Each is encoded once; the second mention is marked "dup".

---

## 2. Consolidation notes for the Client

1. **Sections 2 and 3 overlap.** The Nigeria Revenue Service replaced the Federal Inland Revenue Service under the 2025 tax reform acts; merge into one "Tax" section.
2. **Sections 8 and 18 both list the Startup Label.** The Startup Act is administered through NITDA; merge into one section.
3. **Stray lines.** "Corporate Affairs Commission +1" and "Nigerian Investment Promotion Commission +1" (three occurrences) look like leftover citation markers and are not items.
4. **Flat list.** No stage, trigger or verifiability is given. This map supplies them.

---

## 3. Section-by-section map

### Section 1 — Corporate Affairs Commission (CAC)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Name availability search and reservation | 1 | S1 | ALL | 5 | Reservation approval as evidence; registry "not found" confirms pre-incorporation |
| Company incorporation; Certificate of Incorporation | 1 | S2 | ALL | 2 | Vendor CAC lookup: status, RC number, date, type. Fallback: certificate upload (4) |
| Memorandum and Articles (MEMART) | 1 | S2 | ALL | 4 | Upload; CTC orderable by an accredited agent (₦5,000) |
| CAC Form 1.1 / incorporation application | 1 | S2 | ALL | 4 | Replaced by the e-Status Report at registration; upload |
| Particulars of directors | 1 | S2 | ALL | 2 | Vendor directors endpoint |
| Particulars of shareholders | 1 | S2 | ALL | 2 | Vendor shareholders / share details |
| Particulars of company secretary | 1 | S2 | ALL (small companies exempt from appointing one) | 2 | Vendor secretary endpoint |
| Registered office address | 1 | S2 | ALL | 2 | Vendor address field |
| Statement of share capital | 1 | S2 | ALL | 2 | Vendor share capital field |
| Evidence of incorporation fees and stamp duty | 1 | S2 | ALL | 5 | Informational; receipts |
| Certified incorporation documents | 1 | S2 | ALL | 4 | Upload |
| CAC Status Report | 1 | S2 | ALL | 4 | Mono status-report PDF, or ordered by an accredited agent |
| PSC registration and disclosure | 1 | S2 | ALL | 2 | Vendor PSC endpoint; official BO register when its search works |
| Register of Members | 1 | S2 | ALL | 5 | Statutory book; attestation |
| Register of Directors | 1 | S2 | ALL | 5 | Statutory book |
| Register of Secretaries | 1 | S2 | ALL (if a secretary is appointed) | 5 | Statutory book |
| Register of PSCs | 1 | S2 | ALL | 5 | Statutory book |
| Share certificates | 1 | S2 | ALL | 5 | Vault |
| Board resolutions | 1 | S2 | ALL | 5 | Vault |
| Annual returns | 1 | S2 (first return timing follows the first AGM window [verify]) | ALL | 4 | Status ACTIVE/INACTIVE as proxy; status report or accredited-agent historical report confirms; never claim "filed for year X" without it |

### Sections 2 and 3 — Tax (Nigeria Revenue Service, Joint Revenue Board, state tax authorities)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Tax Identification Number (TIN) | 3 | S2 | ALL | 2 | Vendor TIN lookup (FIRS TIN, JTB TIN, tax office); official NRS verification page as fallback. TIN is issued through the CAC–tax integration at incorporation |
| Tax registration and activation (TaxPro Max) | 3 | S2 | ALL | 4 | Upload registration evidence |
| Company Income Tax registration | 3 | S2 | ALL (small-company reliefs under the 2025 acts [verify thresholds]) | 4 | Upload |
| VAT registration | 3 | S2 | ALL (registration threshold [verify]) | 4 | Upload |
| PAYE registration (federal and state) | 3 | S2 | EMPLOYEES | 4 | Upload state IRS registration |
| Withholding tax registration and compliance | 3 | S3 | ALL (when paying vendors or contractors) | 5 | Attestation; remittance evidence |
| Tax Clearance Certificate | 3 | S3 | ALL | 4 | Upload; online TCC verification [verify availability] |
| Tax returns; assessment records; payment receipts | 3 | S3 | ALL | 5 | Vault; annual |
| Tax exemption or incentive approvals (e.g. pioneer status) | 3 | S3 | ALL (optional) | 4 | Upload approval |
| Section 3 items | — | — | — | — | dup of section 2 after the NRS merger |

### Section 4 — Nigerian Investment Promotion Commission (NIPC)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| NIPC registration; certificate; application | 1 | S2 | FOREIGN | 4 | Upload certificate; NIPC public lookup [verify] |
| Supporting documents (incorporation certificate, MEMART, status report, shareholding) | 1 | S2 | FOREIGN | — | Already covered under section 1 |
| Evidence of foreign investment; Certificate of Capital Importation | 5 | S2 | FOREIGN | 4 | Bank-issued CCI; upload |
| Expatriate Quota approval | 3 | S2 | FOREIGN (expatriate staff) | 4 | Upload; see section 5 |
| Sector-specific regulatory licences | 3 | — | SECTOR.* | — | Covered under sections 6, 12–17 |

### Section 5 — Federal Ministry of Interior

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Business Permit; application | 1 | S2 | FOREIGN (foreign-owned company) | 4 | Upload permit |
| Expatriate Quota approval; application | 3 | S2 | FOREIGN (expatriate staff) | 4 | Upload approval |
| Immigration and employment authorisation documentation | 3 | S2 | FOREIGN | 5 | Attestation; see section 19 |

### Section 6 — Central Bank of Nigeria (CBN)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Certificate of Capital Importation | 5 | S2 | FOREIGN | 4 | dup of section 4 |
| PSP / PSSP / Switching / MMO / PTSP licences | 3 | S2 (must hold before go-live) | SECTOR.PAYMENTS | 3 | CBN PSP page import (9 categories, called); fuzzy name match; upload licence letter as fallback |
| Microfinance Bank licence; Payment Service Bank licence | 3 | S2 | SECTOR.BANKING | 3 | CBN licensed-institution lists [verify URL]; upload |
| Regulatory sandbox approval | 3 | S2 | SECTOR.PAYMENTS (optional) | 4 | Upload approval letter |
| CBN-approved compliance documentation | 3 | S3 | SECTOR.PAYMENTS | 5 | Vault |
| "CBN Fintech licence" | 3 | — | SECTOR.PAYMENTS | — | Not a licence category; maps to the categories above |

### Section 7 — Nigeria Data Protection Commission (NDPC)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Registration as DCPMI | 3 | S2 | PERSONAL_DATA (OHL from 200 data subjects in 6 months; EHL and UHL thresholds [verify]) | 1 | NDPC register JSON feed (8,981 rows, called) |
| DPO appointment | 3 | S2 | PERSONAL_DATA (DCPMI) | 5 + 1 | Attestation; URL scan checks the DPO contact is published (GAID Art 11(2)) |
| DPIA | 6 | S2 | PERSONAL_DATA (high-risk processing, AI, cross-border) | 5 | Vault |
| Data Protection Compliance Audit; Audit Report; Compliance Certificate | 3 | S2 (annual; CAR due 31 March) | PERSONAL_DATA (UHL and EHL file through a licensed DPCO) | 4 | Upload CAR filing receipt; NDPC "audited firms" feed was empty when called |
| DPCO engagement | 3 | S2 | PERSONAL_DATA (UHL, EHL) | 3 | Check the named DPCO against the NDPC licensed-DPCO feed (368 rows) |
| Privacy Policy | 3 | S2 | WEBSITE / APP | 1 | URL scan (NDPA s.27, GAID Art 7) |
| Data Processing Agreement | 3 | S2 | PERSONAL_DATA (uses vendors) | 5 | Vault |
| Records of Processing Activities | 3 | S2 | PERSONAL_DATA | 5 | Vault |
| Data breach response policy | 3 | S2 | PERSONAL_DATA | 5 | Vault |
| Data breach notification documentation | 3 | event-driven | PERSONAL_DATA | 5 | Vault |
| Data subject rights procedures | 3 | S2 | PERSONAL_DATA | 5 + 1 | Attestation; URL scan checks the rights section of the policy |
| Cross-border data transfer documentation | 3 | S2 | PERSONAL_DATA (data hosted outside Nigeria) | 5 | Vault; GAID Art 45 |
| Consent records | 3 | S2 | WEBSITE / APP | 5 + 1 | Attestation; URL scan tests cookie consent behaviour (GAID Art 19) |
| Data retention policy | 3 | S2 | PERSONAL_DATA | 5 + 1 | Attestation; URL scan checks a retention statement in the policy |
| Data protection training records | 3 | S3 | PERSONAL_DATA | 5 | Vault |

### Sections 8 and 18 — NITDA and the Nigeria Startup Act

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Startup Label application; certificate; registration records | 1 | S2 | ALL (optional incentive, eligibility-based) | 4 | Upload certificate; public list of labelled startups [verify] |
| Startup incentive and tax incentive applications; documentation | 3 | S3 | ALL (labelled startups) | 5 | Vault |
| Regulatory sandbox application | 3 | S2 | SECTOR.* (optional) | 4 | Upload |
| Startup investment documentation | 5 | S4 | ALL (labelled startups) | 5 | Vault |
| NITDA IT service provider registration | 3 | S3 | GOV_SUPPLIER | 4 | Upload registration |
| NITDA Code of Practice compliance documentation | 3 | S3 | SECTOR.PLATFORM | 5 | Vault |
| Local liaison appointment | 3 | S3 | SECTOR.PLATFORM and FOREIGN | 5 | Attestation |
| Content moderation and takedown policy | 3 | S3 | SECTOR.PLATFORM | 1 | URL scan if published; else attestation |

### Section 9 — Nigerian Copyright Commission

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Copyright registration or notification for software | 2 | S2 | ALL (voluntary; copyright arises automatically) | 4 | Upload NCC notification certificate; public search [verify] |
| Copyright ownership documentation; software copyright records | 2 | S2 | ALL | 5 | Vault |
| Copyright assignment agreements | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Same evidence as the IP assignment agreements in section 25 |
| Copyright licence agreements | 2 | S3 | ALL (licensing in or out) | 5 | Vault |

### Section 10 — Trademarks Registry

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Trademark search | 2 | S2 | ALL | 5 | Search report from an accredited agent |
| Trademark application | 2 | S2 | ALL | 4 | Upload acknowledgement or acceptance letter |
| Trademark registration certificate | 2 | S3 | ALL (and in every operating market from S3) | 4 | Upload certificate; Code & Clause agent confirms at the registry; status "registry-confirmed" |
| Trademark assignment documentation | 2 | event-driven | ALL | 5 | Vault; recordal evidence |
| Trademark licence documentation | 2 | S3 | ALL | 5 | Vault |

### Section 11 — NOTAP

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Technology Transfer, Software Licence, Technical Services, Management Services, Royalty agreements | 2 | S2 | FOREIGN_TECH | 5 | Vault (software licence agreement is dup of section 25) |
| NOTAP registration application; certificate | 2 | S2 (within 30 days of the agreement) | FOREIGN_TECH | 4 | Upload certificate; no public register |

### Section 12 — Nigerian Communications Commission

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Telecommunications operating licence; ISP; VAS; Unified Access Service | 3 | S2 | SECTOR.TELECOMS | 3 | NCC licensee lists [verify URL and format]; upload licence as fallback |
| Infrastructure sharing approval; spectrum licence | 3 | S3 | SECTOR.TELECOMS | 4 | Upload |
| Type Approval Certificate | 3 | S3 | SECTOR.TELECOMS (equipment) | 3 | NCC type-approval list [verify] |

### Section 13 — Securities and Exchange Commission

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Digital Asset Operator, Exchange, Custodian licences; issuance approval; registration | 3 | S2 | SECTOR.DIGITAL_ASSETS | 3 | SEC registered-operator cards (called; CAC number join key); ARIP list via press until published |
| Crowdfunding Intermediary registration | 3 | S2 | SECTOR.INVESTMENT | 3 | SEC operator cards |
| Capital Market Operator; Investment Adviser registration | 3 | S2 | SECTOR.INVESTMENT | 3 | SEC operator cards |
| Regulatory sandbox approval | 3 | S2 | SECTOR.DIGITAL_ASSETS (optional) | 4 | Upload |

### Section 14 — FCCPC

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Digital lending registration; approval | 3 | S2 (before launch) | SECTOR.LENDING | 3 | FCCPC approvals tables (called: approved, conditional, watch-list, delisted) |
| Consumer protection compliance documentation | 4 | S3 | CONSUMER | 5 | Vault |
| Consumer complaints handling policy | 4 | S3 | CONSUMER | 1 | URL scan if published; else attestation |
| Refund and cancellation policy | 4 | S3 | CONSUMER | 1 | URL scan |
| Consumer terms and conditions | 4 | S3 | CONSUMER | 1 | URL scan (Terms of Service) |
| Product and service disclosure documentation | 4 | S3 | CONSUMER | 5 | Vault |

### Section 15 — NAICOM

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Insurance Broker licence; Insurance Agent registration | 3 | S2 | SECTOR.INSURTECH | 3 | NAICOM licensed-operator lists [verify]; upload as fallback |
| Insurtech approval; partnership approval | 3 | S2 | SECTOR.INSURTECH | 4 | Upload |

### Section 16 — NAFDAC

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Product registration; approval | 3 | S3 | SECTOR.HEALTHTECH (regulated products) | 3 | NAFDAC registered-products database [verify public search]; upload certificate |
| Establishment registration | 3 | S2 | SECTOR.HEALTHTECH | 4 | Upload |
| Software or medical device approvals | 3 | S3 | SECTOR.HEALTHTECH (device or SaMD) | 4 | Upload |

### Section 17 — Medical and health regulators

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| MDCN registration or approvals | 3 | S2 | SECTOR.HEALTHTECH (clinical services) | 4 | Upload; MDCN practitioner verification [verify] |
| NHIA registration or approvals | 3 | S2 | SECTOR.HEALTHTECH (health insurance) | 4 | Upload; NHIA accreditation lists [verify] |
| Health facility registration | 3 | S2 | SECTOR.HEALTHTECH (facility) | 4 | Upload state registration |
| Medical device approval | 3 | S3 | SECTOR.HEALTHTECH | — | dup of section 16 |
| Health practitioner licensing documentation | 3 | S2 | SECTOR.HEALTHTECH | 5 | Attestation (personal data; minimise) |

### Section 19 — Nigeria Immigration Service

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Business visa; STR visa; CERPAC; residence permit; work authorisation; expatriate immigration documentation | 3 | S2 | FOREIGN (foreign directors or staff) | 5 | Attestation plus HR evidence; these are personal documents, so store only "held / not held" per role |

### Sections 20–24 — Employer schemes and PAYE

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| NSITF employer registration; Employee Compensation Scheme registration; compliance documentation; annual contribution records | 3 | S2 (first employee) | EMPLOYEES | 4 | Upload ECS compliance certificate; NSITF online verification [verify] |
| PenCom pension registration; PFA engagement; RSA documentation; contribution records; compliance documentation | 3 | S2 | EMPLOYEES (statutory headcount threshold [verify]) | 4 | Upload Pension Clearance Certificate; PenCom list of compliant employers [verify] could make this Tier 3 |
| ITF employer registration; compliance documentation; contribution records | 3 | S2 | EMPLOYEES (headcount or turnover threshold [verify]) | 4 | Upload ITF compliance certificate |
| NHF registration; contribution records; employer compliance documentation | 3 | S2 | EMPLOYEES | 4 | Upload NHF compliance certificate |
| State IRS PAYE registration; employee tax registration; PAYE returns; remittance receipts; tax compliance documentation | 3 | S2 | EMPLOYEES | 4 / 5 | Registration: upload (4); returns and receipts: vault (5). PAYE registration is dup of section 2 |

### Section 25 — IP and technology agreements

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Founders' Agreement | 1 | S1 | ALL | 5 | Vault; matches the Client's Stage 1 list |
| Shareholders' Agreement | 5 | S2 (full version at S4) | ALL | 5 | Vault |
| Founders' Vesting Agreement | 5 | S1 | ALL | 5 | Vault |
| IP Assignment Agreement (founders; pre-incorporation IP) | 2 | S1 | ALL | 5 | Vault; Client's Stage 1 and 2 lists |
| Software Development Agreement | 2 | S2 | CONTRACTORS | 5 | Vault; must contain IP assignment |
| Software Licence Agreement | 2 | S3 | ALL (per product or tier) | 5 | Vault; dup of section 11 when the licensor is foreign |
| Technology Transfer Agreement | 2 | S2 | FOREIGN_TECH | 5 | dup of section 11 |
| SaaS Agreement | 4 | S3 | ALL (SaaS product live) | 1 / 5 | URL scan if published as terms; vault for the enterprise version |
| API Licence Agreement | 4 | S3 | API | 5 | Vault |
| Source Code Licence Agreement | 2 | S3 | ENTERPRISE | 5 | Vault |
| Source Code Escrow Agreement | 2 | S5 | ENTERPRISE (where demanded) | 5 | Vault |
| Non-Disclosure Agreement | 2 | S1 | ALL | 5 | Vault; template plus signed copies |
| Confidentiality Agreement | 2 | S1 | ALL | — | dup of NDA |
| Contractor Agreement | 4 | S2 | CONTRACTORS | 5 | Vault; classification, IP, payment terms |
| Employment Agreement | 4 | S2 | EMPLOYEES | 5 | Vault; IP assignment clause |
| Invention Assignment Agreement | 2 | S2 | EMPLOYEES, CONTRACTORS | 5 | Vault; may be a clause in the agreements above |

### Section 26 — Corporate and commercial documents

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Board resolutions; shareholder resolutions | 1 | S2 | ALL | 5 | dup of section 1 (board); shareholder resolutions added |
| Statutory registers | 1 | S2 | ALL | — | dup of section 1 |
| Corporate governance policy | 1 | S5 | ALL | 5 | Vault |
| Delegation of Authority | 1 | S5 | ALL | 5 | Vault |
| Conflict of Interest Policy | 1 | S4 | ALL | 5 | Vault |
| Company Secretary documentation | 1 | S2 | ALL (if appointed) | 2 | Vendor secretary endpoint confirms the appointment |
| Share certificates | 1 | S2 | ALL | — | dup of section 1 |
| Share allotment documentation | 5 | S2 | ALL | 2 | Vendor share details reflect CAC filings (allotment return) |
| Share transfer documentation | 5 | event-driven | ALL | 2 / 5 | Vendor shareholder record after filing; vault for instruments |
| Directors' service agreements | 1 | S5 | ALL | 5 | Vault |
| Employment contracts | 4 | S2 | EMPLOYEES | — | dup of section 25 |
| Staff handbook | 4 | S5 | EMPLOYEES | 5 | Vault |

### Section 27 — Data protection and technology documents

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Privacy Policy | 3 | S2 | WEBSITE / APP | — | dup of section 7 |
| Terms of Service | 4 | S3 | WEBSITE / APP (product live) | 1 | URL scan |
| End User Licence Agreement | 4 | S3 | APP | 1 | URL scan; App Store listing link |
| Data Processing Agreement; DPIA; ROPA; Data Retention Policy; Data Breach Response Policy | 3 / 6 | — | — | — | dup of section 7 |
| Cookie Policy | 3 | S2 | WEBSITE | 1 | URL scan (GAID Art 7, 19) |
| Information Security Policy | 3 | S3 | ALL | 5 | Vault |
| Acceptable Use Policy | 4 | S3 | WEBSITE / APP | 1 / 5 | URL scan if published; vault |
| AI Use Policy (internal) | 6 | S2 | AI, or staff use AI tools | 5 | Vault; Client's Stage 2 "AI Acceptable Use Policy" |
| AI Governance Policy | 6 | S5 | AI | 5 | Vault; Client's Stage 5 "AI Governance Framework" |
| AI Transparency and Disclosure Documentation | 6 | S3 | AI | 1 / 5 | URL scan for published disclosures; vault |
| Cybersecurity Policy | 3 | S3 | ALL | 5 | Vault |
| Incident Response Policy | 3 | S3 | ALL | 5 | Vault; Client's Stage 5 item |
| Business Continuity Plan; Disaster Recovery Plan | 3 | S5 | ALL | 5 | Vault |

### Section 28 — Cybersecurity and IT compliance

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Cybersecurity compliance documentation; Cybercrime compliance documentation | 3 | S3 | ALL | 5 | Vault (Cybercrimes Act 2015 as amended 2024) |
| Cybersecurity incident reporting procedures | 3 | S3 | ALL | 5 | Vault; statutory reporting duty to the national CERT [verify scope and timing] |
| Cybersecurity risk assessment; information security audit documentation; vulnerability management policy | 3 | S3 | ALL | 5 | Vault |
| Penetration testing documentation | 3 | S4 | ALL (expected by investors and enterprise clients) | 5 | Vault |
| Security incident register | 3 | S3 | ALL | 5 | Vault |
| Cybersecurity insurance documentation | 3 | S5 | ALL (optional) | 5 | Vault |
| Cybercrimes Act levy compliance | 3 | S3 | SECTOR.PAYMENTS, .BANKING, .TELECOMS, .INSURTECH (businesses named in the Act's schedule [verify]) | 5 | Attestation; remittance evidence |

### Section 29 — Sector-specific regulatory agencies

This table is the trigger map. Each row becomes a `SECTOR.*` trigger that switches on the corresponding section above: CBN → PAYMENTS/BANKING (section 6); SEC → DIGITAL_ASSETS/INVESTMENT (13); NCC → TELECOMS (12); FCCPC → CONSUMER/LENDING (14); NDPC → PERSONAL_DATA (7); NITDA → PLATFORM/GOV_SUPPLIER (8); NAICOM → INSURTECH (15); NAFDAC, NHIA, MDCN → HEALTHTECH (16–17); SON → regulated products and equipment (new trigger PRODUCTS; standards certification, Tier 4 upload); NOTAP → FOREIGN_TECH (11); Copyright Commission and Trademarks Registry → ALL (9–10); NIPC, Interior, Immigration → FOREIGN (4, 5, 19); NSITF, PenCom, ITF, State IRS → EMPLOYEES (20–24).

---

## 4. Counts by tier (after de-duplication)

| Tier | Items (approx.) | What this means for the product |
|---|---|---|
| 1 Official live or URL scan | 14 | NDPC register plus website-published documents (privacy, cookie, terms, EULA, refund, complaints, AUP, AI disclosures, takedown policy, DPO contact, rights and retention statements) |
| 2 Licensed vendor | 11 | CAC record, directors, shareholders, secretary, address, share capital, PSC, allotments, transfers, TIN |
| 3 Official list import | 13 | CBN, SEC, FCCPC, NDPC DPCO list, NCC, NAICOM, NAFDAC, PenCom (candidates marked [verify]) |
| 4 Document-verified | 45 | Certificates, approvals, status reports, compliance certificates, registrations with no public lookup |
| 5 Attested (vault) | 95 | Agreements, policies, registers, records |

About 40 items are verifiable without a document (Tiers 1–3). That is in line with the Client's own count for Stage 2 (7 of 24), once sector and employer registers are added.

---

## 5. The core set every Nigerian tech company must show at Stage 2

Encoded with trigger ALL (plus WEBSITE where noted), these are the items the free scan can report on without any upload:

1. CAC registration active, with directors, shareholders and PSC on record (Tier 2)
2. CAC standing (annual returns) — status proxy, with the status report to confirm (Tier 4)
3. TIN issued (Tier 2)
4. NDPC DCPMI registration if above the data-subject threshold (Tier 1)
5. Privacy policy and cookie notice compliant with GAID (Tier 1, WEBSITE)
6. Trademark filed for the brand (Tier 4)
7. Founders' agreement, founders' IP assignment, NDA template (Tier 5)
8. MEMART, statutory registers, board resolutions (Tier 4 / 5)

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

- CAC: first annual-return due date relative to incorporation and the first AGM; late-filing penalties by company size.
- Tax: small-company reliefs and the VAT registration threshold under the 2025 tax reform acts; whether TCCs can be verified online.
- NDPC: EHL and UHL thresholds and fees; whether the compliance certificate is published anywhere.
- PenCom and ITF: statutory headcount and turnover thresholds for mandatory participation; whether PenCom publishes a list of compliant employers.
- NSITF and NHF: any online compliance verification.
- NCC, NAICOM, NAFDAC, NHIA, MDCN: public licensee or product lists and their formats.
- NIPC and the Startup Portal: whether registered companies or labelled startups are publicly listed.
- Nigerian Copyright Commission: public search of notifications.
- Cybercrimes Act: the schedule of businesses subject to the levy, and the incident-reporting duty's scope.
- SON: which tech products need certification.

### Website rules not encoded (17 Nov 2026): regulator named in the notice, and legal notice

The website scan can now read `web.policy.dpa_named`, `web.policy.dpa_countries`, `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, and the EU packs use them. NG: the Privacy Policy line cites NDPA s.27 and GAID Art 7 and does not say the policy must name the NDPC as the place to complain, so no rule for that was added. The map lists no duty to show company particulars on a website either, so no legal-notice rule was added.
