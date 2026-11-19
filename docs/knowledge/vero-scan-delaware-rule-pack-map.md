# Vero Scan — Delaware (US) Rule-Pack Map

**Project:** Vero Scan (Code and Clause LTD)
**Prepared by:** Emmanuel Edet, Independent Contractor
**Date:** 4 November 2026
**Source:** "Delaware Tech Company: Incorporation and Operational Legal Requirements" (24 sections, received 4 November 2026), mapped against the Client's Stage 1–5 checklists (Delaware list) and the *Verification Solutions Matrix* (section 6).
**Status:** Draft mapping for lawyer review. Stage and trigger assignments are proposals; thresholds marked **[verify]** must be confirmed before they are encoded.

> Technical mapping, not legal advice. A Code & Clause lawyer approves each rule before it affects a score.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Delaware entity at that stage |
| CORP / LLC | Entity type (C-corporation or LLC); S-corporation where noted |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data; state-law thresholds noted per item (Delaware DPDPA, California CCPA) |
| EMPLOYEES | Has employees; DE_EMPLOYEES where the duty is Delaware-specific |
| CONTRACTORS | Uses independent contractors |
| FOREIGN_OWNED | 25% or more foreign ownership, or a foreign-owned single-member LLC (Form 5472) |
| FOREIGN_WORKERS | Sponsors non-US workers |
| DE_OPERATIONS | Conducts business in Delaware (office, staff, sales there), not merely incorporated there |
| MULTI_STATE | Does business in states other than Delaware (foreign qualification, sales tax, payroll) |
| CONSUMER | B2C product |
| CHILDREN | Users under 13 (COPPA) |
| ENTERPRISE | Sells to enterprise clients |
| API | Offers API access to third parties |
| AI | Uses or builds AI in the product |
| EXPORTS | Distributes encryption or controlled technology outside the US, or to restricted parties |
| INVESTED | Has raised or is raising |
| SECTOR.PAYMENTS, .SECURITIES, .BANKING, .LENDING, .DERIVATIVES, .INSURTECH, .TELECOMS, .HEALTHTECH, .PROFESSIONAL | Sector packs (sections 6, 8, 12, 13, 14, 20 of the source) |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault). Routes refer to the *Verification Solutions Matrix*, section 6.

**The Delaware constraint.** The Division of Corporations prohibits data mining and automated tools. Entity existence comes from a licensed KYB vendor (Middesk, Enigma); good standing comes from a Certificate of Good Standing validated on the Division's own authentication page; franchise-tax status comes from an uploaded "Tax & History" lookup. No item below is scraped from the state site.

**Duplicates.** The source repeats items across sections 1, 2, 16, 17, 22 and 23 (EIN, Certificate of Incorporation, bylaws, operating agreement, board and shareholder resolutions, employment and contractor agreements, IP assignment, NDA, W-4, W-2, I-9, workers' compensation, unemployment insurance, immigration sponsorship, privacy policy, terms of service). Each is encoded once; later mentions are marked "dup".

---

## 2. Consolidation notes for the Client

1. **Section 4 (FinCEN BOI) is now a non-item for US entities.** The source's own note is right: FinCEN's final rule (about Aug 2026) permanently removed the reporting duty for entities formed under US state law. Only foreign entities registered to do business in a US state still report. Encode as one rule with trigger FOREIGN_ENTITY_US_REGISTERED and `effective_to` for domestic entities.
2. **Sections 13 and 14 overlap** (FinCEN MSB registration, OFAC screening, BSA/AML). Merge into one "Financial regulation" section.
3. **Sections 16 and 17 overlap** on I-9, E-Verify and sponsorship. Merge into one "Employment and immigration" section.
4. **Section 23 ("Banking and Financial Documentation") is mostly a bank-onboarding pack**, not legal obligations. Only the EIN letter and the board resolution are rules; the rest become one attestation ("corporate bank account opened") plus vault items.
5. **Section 24 (compliance calendar) is not a list of new items.** It becomes `recurrence` fields on the rules above.
6. **Missing from the list but in the Client's Delaware stage checklist:** the 83(b) election (Stage 2, "filed within 30 days of incorporation if founders received restricted stock"). Added below under section 22.
7. **Stray lines.** "State of Delaware +2 / +3 / +1" and "U.S. Department of the Treasury +2" are leftover citation markers, not items.
8. **The closing note is correct and worth keeping as rule logic:** a Delaware business licence depends on doing business in Delaware (trigger DE_OPERATIONS), and financial licences depend on the services provided, with money transmission licensed state by state.

---

## 3. Section-by-section map

### Section 1 — Delaware Division of Corporations

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Company name availability search; name reservation | 1 | S1 | ALL | 5 | Reservation receipt; vendor "not found" confirms pre-incorporation |
| Entity structure selection (C-corp, S-corp, LLC) | 1 | S1 | ALL | 2 | Vendor registration record gives entity type; S-corp status is an IRS election (Form 2553, Tier 4) |
| Certificate of Incorporation (corporations) / Certificate of Formation (LLCs) | 1 | S2 | ALL | 2 | Vendor (Middesk `registrations[]`: file number, formation date); upload the certificate (4) as fallback |
| Registered Agent appointment; Registered Office in Delaware | 1 | S2 | ALL | 2 | Vendor record lists the agent; the state's free name search shows the agent too (manual only) |
| Incorporator details | 1 | S2 | ALL | 4 | On the filed certificate; upload |
| Certificate of Good Standing | 1 | S2 (and before every financing) | ALL | 4 | Middesk Documents orders it, or the user orders it ($50); validate the authentication number at the Division's certificate validator |
| Certified copies of incorporation documents | 1 | S2 | ALL | 4 | Upload |
| Corporate Bylaws (corporations) / Operating Agreement (LLCs) | 1 | S2 | CORP / LLC | 5 | Vault; Client's Stage 2 item |
| Initial Board of Directors appointment; Initial Board Resolutions; Initial Shareholder Resolutions | 1 | S2 | CORP | 5 | Vault (organisational resolutions: share issuance, officer appointments) |
| Stock issuance documentation; stock certificates or electronic share records | 5 | S2 | CORP | 5 | Vault |
| Stock ledger; register of shareholders | 5 | S2 | CORP | 5 | Vault; Client's Stage 2 "cap table in a dedicated tool" |
| Director and officer records | 1 | S2 | ALL | 5 | Vault; Delaware does not publish directors except on the annual report (Tier 4 upload) |
| Shareholder Agreement | 5 | S2 (full version at S4) | CORP | 5 | Vault |
| Annual Franchise Tax Report (corporations) | 1 | S2 (due 1 March each year; report fee $50) | CORP | 4 | Upload the filed report, or the $20 "Tax & History" lookup; no vendor exposes this |
| Annual Franchise Tax payment | 1 | S2 (1 March; minimum $175 or $400 by method; $200 penalty plus 1.5% monthly interest) | CORP | 4 | Same upload; loss of good standing is the public consequence |
| Annual LLC tax payment | 1 | S2 (1 June; $300) | LLC | 4 | Upload receipt |
| Certificate of Amendment; Certificate of Merger; Certificate of Dissolution | 1 | event-driven | ALL | 2 / 4 | Vendor record reflects status changes; upload the certificate |

### Section 2 — Internal Revenue Service

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Employer Identification Number; federal tax registration | 3 | S2 | ALL | 4 | Upload IRS CP575 or 147C; extract EIN (`NN-NNNNNNN`), name, address; cross-check the registry. Never public |
| Federal corporate income tax registration | 3 | S2 | ALL | — | Covered by the EIN |
| Form 1120 (C-corp) / 1120-S (S-corp) / 1065 (partnership-taxed LLC) / Schedule C | 3 | S3 (annual; 15 April or the 15th of the 4th month after year end) | ALL by entity type | 5 | Vault |
| Federal income tax returns; estimated tax payments | 3 | S3 | ALL | 5 | Vault |
| Payroll tax registration; federal employment tax returns; Form 941; Form 940 | 3 | S2 | EMPLOYEES | 5 | Vault (941 quarterly, 940 annual) |
| Form W-2; Form W-4 | 3 | S2 | EMPLOYEES | 5 | Vault |
| Form 1099-NEC; Form 1099-MISC | 3 | S3 | CONTRACTORS (US contractors paid $600 or more [verify current threshold]) | 5 | Vault |
| Form 5472 | 3 | S3 (annual, with Form 1120) | FOREIGN_OWNED | 5 | Vault; penalty $25,000 per form; common for Nigerian-founded Delaware companies |
| International tax reporting documentation; transfer pricing documentation | 3 | S5 | FOREIGN_OWNED or non-US subsidiaries | 5 | Vault; Client's Stage 5 item |

### Section 3 — Delaware Division of Revenue

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Delaware Business License | 3 | S2 | DE_OPERATIONS | 4 | Upload licence; Division of Revenue licence lookup [verify public search] |
| Business tax registration; Gross Receipts Tax registration; Delaware corporate income tax registration; withholding tax registration; unemployment insurance registration | 3 | S2 | DE_OPERATIONS (withholding and UI: DE_EMPLOYEES) | 4 | Upload registration confirmation (One Stop) |
| Delaware tax returns; Gross Receipts Tax returns; corporate income tax returns; withholding returns | 3 | S3 | DE_OPERATIONS | 5 | Vault |
| Business licence renewal | 3 | annual | DE_OPERATIONS | 4 | Upload |
| Tax payment records | 3 | S3 | DE_OPERATIONS | 5 | Vault |

### Section 4 — FinCEN beneficial ownership

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| CTA applicability assessment; BOI compliance assessment | 1 | S2 | ALL | n/a | Rule outcome "not applicable" for US-formed entities (FinCEN final rule, Aug 2026) |
| Beneficial ownership reporting | 1 | S2 | FOREIGN_ENTITY_US_REGISTERED (non-US entity registered to do business in a US state) | 5 | Attestation; FinCEN does not publish reports |

### Section 5 — Delaware Department of Labor

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Employer registration; unemployment insurance registration and account number | 3 | S2 | DE_EMPLOYEES | 4 | Upload registration |
| Workers' compensation registration; insurance policy | 3 | S2 | DE_EMPLOYEES | 4 | Upload policy; Delaware coverage verification [verify public lookup] |
| New hire reporting | 3 | event-driven (within 20 days of hire) | DE_EMPLOYEES | 5 | Attestation |
| Payroll records; employee wage records; UI contribution returns | 3 | S2 | DE_EMPLOYEES | 5 | Vault |
| Employment compliance documentation; workplace safety documentation | 3 | S2 | EMPLOYEES | 5 | Vault |

### Section 6 — Delaware Department of Insurance

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Insurance producer, broker, agency licences | 3 | S2 | SECTOR.INSURTECH | 3 | Delaware DOI licensee search and the NIPR producer database [verify access]; upload licence |
| Insurtech approvals; partnership approvals; insurance compliance documentation | 3 | S2 | SECTOR.INSURTECH | 4 / 5 | Upload; vault |

### Section 7 — Delaware Department of Justice (DPDPA)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Delaware Personal Data Privacy Act compliance | 3 | S3 | PERSONAL_DATA (controls data of 35,000 or more Delaware consumers, or 10,000 or more with over 20% of revenue from selling personal data [verify thresholds]) | 5 | Vault; in force since 1 Jan 2025 |
| Privacy Notice | 3 | S2 | WEBSITE / APP | 1 | URL scan (DPDPA elements where in scope; CCPA elements for California users) |
| Consumer data rights procedures; access, deletion and correction procedures | 3 | S3 | PERSONAL_DATA (in scope) | 5 + 1 | Attestation; URL scan checks the rights section and request methods |
| Opt-out mechanisms for targeted advertising and sales | 3 | S3 | PERSONAL_DATA (in scope) | 1 | URL scan: opt-out link present; universal opt-out signal honoured (Delaware requires recognition of universal opt-out mechanisms from 1 Jan 2026 [verify]; GPC test as for CCPA) |
| Sensitive data processing consent | 3 | S3 | PERSONAL_DATA (sensitive data) | 5 + 1 | Attestation; URL scan checks consent flows for sensitive categories |
| Data protection risk assessments | 6 | S3 | PERSONAL_DATA (targeted advertising, sales, profiling, sensitive data) | 5 | Vault |
| Consumer complaint handling procedures; privacy compliance documentation | 3 | S3 | PERSONAL_DATA | 5 | Vault |

### Section 8 — Delaware Division of Professional Regulation

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Professional business licence; provider registration; practice approvals; certifications | 3 | S2 | SECTOR.PROFESSIONAL (regulated professions, e.g. telehealth, accounting, engineering) | 3 | DELPROS public licence verification [verify export]; upload |
| Professional liability insurance | 3 | S2 | SECTOR.PROFESSIONAL | 4 | Upload certificate |

### Section 9 — USPTO

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Trademark search | 2 | S2 | ALL | 5 | Search report |
| Federal trademark application; registration certificate | 2 | S2 (application) / S3 (registration) | ALL | 1 | TSDR by serial number (`USPTO-API-KEY`); owner-name search from the bulk TRCFECO2 index (Tier 3); Client's Stage 2 "USPTO trademark filing, verifiable publicly" |
| Trademark renewal | 2 | years 5–6 (Section 8) and every 10 years | ALL | 1 | TSDR status and maintenance events |
| Patent application; utility patent; design patent | 2 | S3 | ALL (optional) | 1 | ODP patent search by applicant (`X-Api-Key`); Client's Stage 2 "USPTO patent filing, verifiable publicly" |
| Patent assignment documentation; trademark assignment documentation | 2 | event-driven | ALL | 3 | USPTO assignment bulk data (ODP) [verify]; upload recorded assignment |
| IP ownership records; patent and trademark licensing agreements | 2 | S3 | ALL | 5 | Vault |

### Section 10 — US Copyright Office

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Copyright registration; software registration; website and content registration | 2 | S3 | ALL (optional; required before suing for infringement) | 3 | Copyright Office public records search [verify API]; upload certificate |
| Copyright ownership documentation; assignment agreements; licensing agreements | 2 | S1 (founders) / S2 | ALL, CONTRACTORS | 5 | Vault |
| Work-for-hire agreements | 2 | S2 | EMPLOYEES, CONTRACTORS | 5 | Vault; for contractors, software usually is not work-for-hire, so a written assignment (17 USC 204(a)) is the control, and a work-for-hire clause with a California contractor can create employee status (Labor Code 3351.5(c)) |

### Section 11 — Federal Trade Commission

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| FTC Act compliance; consumer protection; advertising compliance; marketing claims substantiation; unfair and deceptive practices | 4 | S3 | CONSUMER | 5 | Vault |
| End-user privacy disclosures | 3 | S2 | WEBSITE / APP | 1 | URL scan (privacy notice matches actual data flows and app privacy labels) |
| COPPA compliance; COPPA Rule compliance | 3 | S3 | CHILDREN | 5 + 1 | Vault; URL scan checks a children's section and verifiable parental consent flow; amended rule compliance by Apr 2026 [verify] |
| Subscription and automatic renewal compliance | 4 | S3 | CONSUMER (subscriptions) | 1 | URL scan: cancellation path and renewal disclosures (state auto-renewal laws such as California's; the FTC click-to-cancel rule was vacated in 2025) |
| Consumer complaint handling policy; refund and cancellation policy | 4 | S3 | CONSUMER | 1 | URL scan |
| Data security compliance documentation | 3 | S3 | CONSUMER | 5 | Vault (FTC Safeguards Rule for non-bank financial institutions: SECTOR.LENDING) |

### Section 12 — Federal Communications Commission

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| FCC registration (FRN) | 3 | S2 | SECTOR.TELECOMS | 3 | FCC CORES FRN public search [verify export] |
| Telecommunications operating authority; International Section 214 authorisation | 3 | S2 | SECTOR.TELECOMS (carriers, VoIP) | 3 | FCC ICFS / 214 public records [verify] |
| Radio spectrum licence | 3 | S3 | SECTOR.TELECOMS (spectrum) | 3 | FCC Universal Licensing System (public) |
| Equipment authorisation; FCC equipment certification | 3 | S3 | SECTOR.TELECOMS (hardware) | 3 | FCC ID equipment authorisation database (public) |
| Telecommunications compliance documentation | 3 | S3 | SECTOR.TELECOMS | 5 | Vault |
| TCPA compliance; robocall and automated messaging compliance | 4 | S3 | CONSUMER (SMS or calls to US numbers) | 5 | Vault; Robocall Mitigation Database for voice providers (Tier 3) |
| Universal Service Fund compliance | 3 | S3 | SECTOR.TELECOMS | 3 | FCC Form 499 filer database (public) |

### Sections 13 and 14 — Financial regulation

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| SEC broker-dealer registration; FINRA membership | 3 | S2 | SECTOR.SECURITIES (brokerage, crowdfunding portals) | 3 | FINRA BrokerCheck (public) [verify export]; SEC EDGAR |
| SEC investment adviser registration | 3 | S2 | SECTOR.SECURITIES (advisory technology) | 3 | SEC IAPD (public) |
| Exchange or ATS registration | 3 | S2 | SECTOR.SECURITIES (trading platforms) | 3 | SEC lists of exchanges and ATSs (public) |
| FinCEN Money Services Business registration | 3 | S2 (within 180 days of starting) | SECTOR.PAYMENTS (money transmission, convertible virtual currency) | 3 | FinCEN MSB registrant export (weekly, called: 34,615 rows) |
| OCC national bank charter; Federal Reserve approvals; FDIC deposit insurance | 3 | S2 | SECTOR.BANKING | 3 | FDIC BankFind API (public); rarely applies to startups |
| CFPB consumer finance compliance | 3 | S3 | SECTOR.LENDING | 5 | Vault |
| CFTC registration | 3 | S2 | SECTOR.DERIVATIVES | 3 | NFA BASIC (public) |
| OFAC sanctions compliance; OFAC screening | 3 | S3 | SECTOR.PAYMENTS, .SECURITIES, EXPORTS | 3 + 5 | Counterparty screening against OFAC SDN exports (called); policy in the vault |
| Money Transmitter Licence; state-by-state licences; NMLS registration | 3 | S2 (before transmitting) | SECTOR.PAYMENTS (holds or moves funds for others) | 5 / 4 | User-supplied NMLS ID (NMLS forbids scraping); upload licences; or evidence of a sponsor-bank or agent-of-payee structure |
| Bank partnership agreements; payment processing agreements; electronic payment compliance documentation | 4 | S3 | SECTOR.PAYMENTS | 5 | Vault; Client's Stage 2 "upload licensed partner agreement" |
| BSA compliance; AML Policy; KYC Policy; CDD procedures; SAR procedures | 3 | S2 | SECTOR.PAYMENTS, .SECURITIES, .LENDING | 5 | Vault |
| Consumer financial protection compliance; safeguarding and custody documentation | 3 | S3 | SECTOR.PAYMENTS | 5 | Vault |

### Section 15 — State-level business registration

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Foreign qualification in each state; Certificate of Authority | 1 | S2 (when doing business in a state) | MULTI_STATE | 2 | Vendor per state (Middesk `registrations[]` by state; Cobalt live state pulls with `nextReportDueDate`); California example in the matrix |
| Certificate of Good Standing from Delaware | 1 | — | MULTI_STATE | — | dup of section 1 |
| Registered agent in each state | 1 | S2 | MULTI_STATE | 2 | Vendor registration record |
| State business licence; state tax registration; state income tax registration | 3 | S2 | MULTI_STATE | 4 | Upload |
| Sales and Use Tax registration | 3 | S3 (economic-nexus thresholds per state [verify]) | MULTI_STATE (SaaS taxable in some states) | 4 | Upload permits |
| State employer registration; state unemployment insurance; state workers' compensation | 3 | S2 | EMPLOYEES (per state of employment) | 4 | Upload |
| State annual reports; state franchise tax returns | 1 | annual | MULTI_STATE | 2 / 4 | Vendor `nextReportDueDate` and status ("FTB/SOS suspended" for California); upload returns |

### Sections 16 and 17 — Employment and immigration

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| EIN; federal payroll registration; state payroll registration | 3 | — | — | — | dup of sections 2, 3 and 15 |
| Employment agreements | 4 | S2 | EMPLOYEES | 5 | Vault; Client's Stage 2 "Employee PIIA in every offer letter" |
| Independent Contractor Agreements | 4 | S2 | CONTRACTORS | 5 | Vault; Client's Stage 2 "Contractor PIIA" |
| Employee Handbook | 4 | S5 | EMPLOYEES | 5 | Vault; Client's Stage 5 item |
| Employee Confidentiality Agreements; IP Assignment Agreements; Employee Invention Assignment Agreements | 2 | S2 | EMPLOYEES, CONTRACTORS | 5 | One rule: PIIA/CIIAA signed by every founder, employee and contractor; California Labor Code 2870 notice; DTSA whistleblower notice |
| Employee onboarding documentation | 4 | S2 | EMPLOYEES | 5 | Vault |
| Form I-9; employment eligibility verification; Form I-9 compliance | 3 | S2 (within 3 days of hire) | EMPLOYEES | 5 | Attestation per hire |
| Form W-4; Form W-2 | 3 | — | — | — | dup of section 2 |
| Employee benefits documentation; health insurance arrangements | 4 | S5 | EMPLOYEES (ACA employer mandate at 50 or more full-time staff [verify]) | 5 | Vault |
| Workers' compensation insurance; unemployment insurance registration | 3 | — | — | — | dup of sections 5 and 15 |
| OSHA compliance | 3 | S3 | EMPLOYEES | 5 | Vault |
| EEO compliance | 3 | S3 | EMPLOYEES (EEO-1 report at 100 or more employees [verify]) | 5 | Vault |
| FMLA compliance | 3 | S5 | EMPLOYEES (50 or more employees) | 5 | Vault |
| Immigration sponsorship documentation; H-1B, L-1, O-1, E-2 visa documentation | 3 | S3 | FOREIGN_WORKERS | 5 | Attestation per role (personal documents; store "held / not held"); H-1B Labor Condition Applications are published in DOL disclosure data (Tier 3 signal) [verify] |
| E-Verify registration | 3 | S2 | EMPLOYEES (mandatory for federal contractors and in some states) | 3 | USCIS list of E-Verify participating employers (public) [verify] |
| Export control compliance (DHS row) | 3 | — | — | — | dup of section 18 |

### Section 18 — Bureau of Industry and Security (export control)

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| ECCN determination; encryption export classification | 3 | S3 | EXPORTS (most software using encryption, including SaaS available abroad) | 5 / 4 | Vault; self-classification report or CCATS evidence (upload) |
| Export licence application; technology export authorisation | 3 | S3 | EXPORTS (controlled items or destinations) | 4 | Upload licence; not public |
| Restricted-party screening | 3 | S3 | EXPORTS, SECTOR.PAYMENTS | 3 | Consolidated Screening List API (trade.gov, free) for counterparties; policy in the vault |
| Export compliance programme; export documentation; end-user verification records | 3 | S3 | EXPORTS | 5 | Vault |

### Section 19 — Cybersecurity and technology compliance

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Cybersecurity Policy; Information Security Policy; Access Control Policy; Encryption Policy; Secure Software Development Policy | 3 | S3 | ALL | 5 | Vault |
| Incident Response Plan; Data Breach Response Policy | 3 | S3 | ALL | 5 | Vault; Client's Stage 5 item; state breach-notification laws apply in all 50 states |
| Business Continuity Plan; Disaster Recovery Plan | 3 | S5 | ALL | 5 | Vault |
| Vulnerability Disclosure Policy | 3 | S3 | WEBSITE / APP | 1 | URL scan (`/.well-known/security.txt` and a published policy) |
| Penetration Testing Reports; Security Audit Reports; Vendor Security Assessment | 3 | S4 | ALL (expected by investors and enterprise clients) | 5 | Vault |
| SOC 2 Type I / Type II reports | 3 | S4 | ENTERPRISE | 4 | Upload report (confidential; not public) |
| ISO/IEC 27001; ISO/IEC 27701 certification | 3 | S5 | ENTERPRISE | 4 / 3 | Upload certificate; IAF CertSearch public lookup [verify] |
| PCI DSS compliance | 3 | S3 | SECTOR.PAYMENTS or stores card data | 4 / 3 | Upload Attestation of Compliance; card-network service-provider lists for Level 1 [verify] |
| Cyber Liability Insurance | 3 | S5 | ALL (optional) | 4 | Upload certificate |
| Security Awareness Training | 3 | S3 | EMPLOYEES | 5 | Vault |
| Open Source Software Compliance Policy | 2 | S3 | ALL | 5 / 1 | Vault; repository scan if GitHub is connected (Client's Stage 3 "Open Source Audit Report"; Stage 4 "no GPL contamination") |

### Section 20 — Healthtech and medical technology

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| FDA establishment registration and device listing | 3 | S3 (before marketing) | SECTOR.HEALTHTECH (device or SaMD) | 3 | FDA registration and listing database (public, downloadable) |
| 510(k) premarket notification; PMA; De Novo classification | 3 | S3 | SECTOR.HEALTHTECH | 3 | FDA 510(k), PMA and De Novo databases (public) |
| SaMD regulatory compliance; QMSR compliance (effective 2 Feb 2026 [verify]) | 3 | S3 | SECTOR.HEALTHTECH | 5 | Vault |
| HIPAA compliance; Privacy Rule; Security Rule; Breach Notification Rule | 3 | S2 | SECTOR.HEALTHTECH (covered entity or business associate) | 5 | Vault; BAA with every covered-entity customer (Client's Stage 3 "HIPAA Business Associate Agreement"); OCR breach portal is a public adverse signal (Tier 3) |
| CMS programme registration | 3 | S3 | SECTOR.HEALTHTECH (Medicare/Medicaid billing) | 4 | Upload enrolment; NPPES NPI registry is public (Tier 3) |
| State healthcare facility licensing | 3 | S2 | SECTOR.HEALTHTECH (facilities) | 4 | Upload |

### Section 21 — AI and software companies

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| AI Governance Policy; AI Safety and Security Policy | 6 | S5 | AI | 5 | Vault; Client's Stage 5 "AI Governance Framework" |
| AI Risk Assessment | 6 | S3 | AI | 5 | Vault; CCPA ADMT rules from 1 Jan 2027 for California users; Colorado SB 26-189 from about 1 Jan 2027 [verify] |
| AI Model Documentation; AI Training Data Documentation; AI Copyright and Licensing Records | 6 | S3 | AI | 5 | Vault; Client's Stage 2 "Training Data Rights Documentation" and "DMCA compliance documentation" |
| AI Transparency Documentation | 6 | S3 | AI | 1 / 5 | URL scan for published disclosures (California AI Transparency Act timing [verify]); vault |
| AI Vendor Agreements; AI Supplier Agreements | 6 | S3 | AI (uses third-party models or APIs) | 5 | Vault; Client's Stage 3 "AI Model Usage Agreement" |
| AI Acceptable Use Policy | 6 | S2 | AI, or staff use AI tools | 5 | Vault; Client's Stage 2 item |
| Software Development Agreement | 2 | S2 | CONTRACTORS | 5 | Vault |
| SaaS Agreement; Product Terms and Conditions; Website Terms of Service | 4 | S3 | WEBSITE / APP (product live) | 1 / 5 | URL scan for published terms; vault for enterprise versions |
| API Licence Agreement | 4 | S3 | API | 1 / 5 | URL scan if published |
| End User Licence Agreement | 4 | S3 | APP | 1 | URL scan; App Store listing |
| Software Licence Agreement; Cloud Services Agreement; Service Level Agreement | 4 | S3 | ALL / ENTERPRISE | 5 | Vault |
| Source Code Escrow Agreement | 2 | S5 | ENTERPRISE (where demanded) | 5 | Vault |
| Open Source Software Policy | 2 | — | — | — | dup of section 19 |
| Software IP Assignment Agreement; Technology Transfer Agreement | 2 | S2 | CONTRACTORS; cross-border IP moves (e.g. Nigerian entity to Delaware parent; NOTAP on the Nigerian side) | 5 | Vault |

### Section 22 — Corporate and commercial legal documents

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| Certificate of Incorporation; Bylaws; Operating Agreement | 1 | — | — | — | dup of section 1 |
| Founders' Agreement; Founder Vesting Agreement | 1 / 5 | S1 | ALL | 5 | Vault; Client's Stage 1 list |
| Shareholders' Agreement | 5 | — | — | — | dup of section 1 |
| Stock Purchase Agreement; Restricted Stock Purchase Agreement | 5 | S2 | CORP (founder stock) | 5 | Vault |
| **83(b) election** (added; in the Client's Delaware Stage 2 list) | 5 | S2 (within 30 days of the stock grant) | CORP (restricted founder stock) | 4 | Upload the election plus Form 15620 and the certified-mail receipt; postmark within 30 days; USPS tracking confirms the acceptance scan |
| Stock Option Plan; Equity Incentive Plan; Stock Option Grant Agreements | 5 | S4 | CORP (equity compensation) | 5 | Vault; Client's Stage 2 "Option pool board resolution" and Stage 5 "Option Grant Agreements" |
| SAFE Agreement; Convertible Note Agreement; Subscription Agreement | 5 | S4 | INVESTED | 5 | Vault; Form D filings corroborate (Tier 1) |
| Investor Rights Agreement; Voting Agreement; ROFR and Co-Sale Agreement | 5 | S4 | INVESTED (priced round) | 5 | Vault; Client's Stage 4 list |
| Board Resolutions; Shareholder Resolutions | 1 | — | — | — | dup of section 1 |
| Director Service Agreements | 1 | S5 | ALL | 5 | Vault |
| NDA; Confidentiality Agreement | 2 | S1 | ALL | 5 | Vault (one item) |
| IP Assignment Agreement; Employment Agreement; Independent Contractor Agreement | 2 / 4 | — | — | — | dup of sections 16 and 17 |
| Consultancy Agreement; Supplier Agreement; Commercial Partnership Agreement; Joint Venture Agreement; Distribution Agreement; Reseller Agreement; Licensing Agreement | 4 | S3 / S5 | ALL (where entered into) | 5 | Vault |
| Data Processing Agreement | 3 | S2 | PERSONAL_DATA (vendors and enterprise customers) | 5 | Vault; Client's Stage 2 item |
| Privacy Policy; Cookie Policy; Terms of Service; Acceptable Use Policy | 3 / 4 | — | — | — | dup of sections 7, 11 and 21 (cookie policy: URL scan, Tier 1) |
| Consumer Terms and Conditions; Refund and Cancellation Policy | 4 | — | — | — | dup of section 11 |

### Section 23 — Banking and financial documentation

| Item | Layer | Stage | Trigger | Tier | Route / note |
|---|---|---|---|---|---|
| EIN confirmation letter (CP575) | 3 | — | — | — | dup of section 2 |
| Corporate bank account; bank account authorisation; wire transfer authorisation | 1 | S2 | ALL | 5 | One attestation: "corporate bank account opened in the company's name" |
| Board resolution authorising the bank account | 1 | S2 | CORP | 5 | Vault |
| Beneficial ownership information for bank KYC; director, officer and shareholder identification; registered agent details; business address verification | 1 | S2 | ALL | — | Bank onboarding inputs, not obligations; covered by section 1 |
| Business credit documentation; corporate financial records | 1 | S3 | ALL | 5 | Vault |
| Merchant account; payment processor agreements; Stripe or gateway onboarding documentation | 4 | S3 | ALL (takes payments) | 5 | Vault; Layer B detects the payment stack on the website (signal) |

### Section 24 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above; "auto" means Vero Scan can monitor it without an upload:

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Delaware Corporation Annual Report; Franchise Tax by 1 March | Section 1 | Annual, 1 March | Upload each year (no automatable source); loss of good standing shows on the next certificate |
| Delaware LLC tax by 1 June | Section 1 | Annual, 1 June | Upload |
| Federal corporate income tax returns | Section 2 | Annual | Attestation |
| Federal payroll tax returns; payroll remittances; unemployment contributions | Sections 2, 5, 15 | Quarterly / monthly | Attestation |
| Delaware business licence renewal; Gross Receipts and corporate income tax returns | Section 3 | Annual / monthly or quarterly | Attestation |
| State foreign qualification renewals; state annual reports; state franchise tax | Section 15 | Per state | Auto where the vendor returns `nextReportDueDate` and status |
| Sales tax returns | Section 15 | Per state | Attestation |
| Workers' compensation renewals; insurance renewals | Sections 5, 19 | Annual | Expiry dates from uploads |
| Annual financial statements | Section 23 | Annual | Attestation |
| Intellectual property renewals | Section 9 | Trademarks years 5–6 and every 10 years; patent maintenance fees at 3.5, 7.5 and 11.5 years | Auto via TSDR status and ODP |
| Regulatory licence renewals | Sections 6, 8, 12–14 | Per licence | Auto where a public register exists (FinCEN MSB every 2 years; FDA registration annually) |
| Data protection compliance reviews | Section 7 | Annual | Attestation |
| Corporate governance and stock ledger updates | Sections 1, 22 | Ongoing | Attestation |

---

## 4. Counts by tier (after de-duplication)

| Tier | Items (approx.) | What this means for the product |
|---|---|---|
| 1 Official live or URL scan | 16 | USPTO trademarks and patents, SEC Form D, and website-published documents (privacy notice, opt-out link and GPC behaviour, terms, EULA, refund and cancellation, vulnerability disclosure, AI disclosures) |
| 2 Licensed vendor | 8 | Delaware existence, agent, entity type, status changes; foreign qualifications and state annual-report dates via Middesk or Cobalt |
| 3 Official list import | 26 | FinCEN MSB, FDIC, FINRA, IAPD, NFA, FCC (FRN, 214, ULS, equipment, Form 499), FDA databases, OFAC and Consolidated Screening List, copyright records, E-Verify list, DOI and DELPROS lookups, IAF CertSearch (several marked [verify]) |
| 4 Document-verified | 40 | Good standing certificate (validated), franchise tax lookups, EIN letter, 83(b), state registrations, licences, SOC 2 and ISO reports, insurance |
| 5 Attested (vault) | 130 | Agreements, policies, tax forms, HR records |

About 50 items are verifiable without a document (Tiers 1–3). The three items the Client most wants automated for Delaware (entity status, good standing, franchise tax) are the ones the state keeps behind a paywall and an anti-automation rule, so they sit at Tier 2 and 4, and the product should say "good standing certified on {date}" rather than claim a live status.

---

## 5. The core set every Delaware tech company must show at Stage 2

Encoded with trigger ALL (plus CORP or WEBSITE where noted), these are the items the free scan reports on, with the two certificate uploads flagged as the first asks:

1. Entity exists with a registered agent (Tier 2)
2. Certificate of Good Standing on file and validated (Tier 4); franchise tax current (Tier 4)
3. EIN letter on file (Tier 4)
4. Bylaws, organisational resolutions, stock ledger (Tier 5, CORP)
5. 83(b) elections for founders with restricted stock (Tier 4, CORP)
6. PIIA signed by every founder, employee and contractor; NDA template (Tier 5)
7. USPTO trademark filed (Tier 1); patents where relevant (Tier 1)
8. Privacy notice and cookie behaviour compliant for the states where users are (Tier 1, WEBSITE)
9. No sanctions or restricted-party matches (Tier 3)

Everything else switches on through a trigger (MULTI_STATE, EMPLOYEES, FOREIGN_OWNED, sector packs).

---

## 6. Thresholds and facts to confirm before encoding

- DPDPA applicability thresholds and the universal opt-out effective date (1 Jan 2026).
- Form 1099-NEC reporting threshold (changed by 2025 legislation [verify figure]).
- ACA employer mandate, EEO-1 and FMLA headcount thresholds.
- Economic-nexus thresholds for sales tax by state, and which states tax SaaS.
- Public lookups: Delaware business licence search; Delaware workers' compensation coverage; DELPROS export; DOI and NIPR access; FCC CORES export; FINRA BrokerCheck and SEC IAPD exports; Copyright Office records API; USCIS E-Verify employer list; DOL H-1B disclosure data; IAF CertSearch; card-network PCI service-provider lists.
- USPTO assignment data in the Open Data Portal.
- FDA QMSR effective date; COPPA amended-rule compliance date; California AI Transparency Act timing; Colorado SB 26-189 effective date.
- Whether Middesk or Cobalt return Delaware status for the test companies, or only "unknown".

### Website rules not encoded (17 Nov 2026): regulator named in the notice, and legal notice

The website scan can now read `web.policy.dpa_named`, `web.policy.dpa_countries`, `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, and the EU packs use them. US-DE: no duty in this map asks a privacy notice to name a regulator or a website to show company particulars (the CCPA and DPDPA elements listed are about content, not naming a regulator), so none was added.
