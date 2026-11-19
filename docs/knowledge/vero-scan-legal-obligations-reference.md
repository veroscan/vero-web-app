# Vero Scan: Phase 1 legal-obligation reference map (as of 4 Nov 2026)

*This is reference material for designing a rules engine. It is not legal advice.*

**How to read the confidence tags** (useful when seeding rules):
- **[V]** I confirmed this in this session against the linked source. Most sources are regulators or law firms.
- **[K]** This comes from my background knowledge and was not re-checked this session. Check it before seeding.
- **[?]** Sources conflict, or I could not confirm it.

---

## 0. Changes since 2024 that affect the rules engine

1. **EU AI Act "Digital Omnibus on AI" has been adopted.** The Council and Parliament reached a provisional deal in May 2026. Parliament voted on 16 Jun 2026, the Council adopted it on 29 Jun 2026, and it was published in the Official Journal on 24 Jul 2026. Secondary sources number it Regulation (EU) 2026/1744 [?], so confirm the number on EUR-Lex. [V] Sources: [FPF](https://fpf.org/blog/the-ai-act-implementation-timeline-what-changes-under-the-ai-omnibus/), [Sidley](https://datamatters.sidley.com/2026/06/22/eu-lawmakers-reach-provisional-agreement-to-delay-key-eu-ai-act-obligations/).
   - **2 Feb 2025:** Art 5 prohibitions and Art 4 AI literacy apply. Art 4 is now softened to "support the development of" AI literacy.
   - **2 Aug 2025:** general-purpose AI (GPAI) obligations and penalties apply.
   - **2 Aug 2026:** the Act applies generally, including Art 50 transparency.
   - **2 Dec 2026:** Art 50(2) marking of synthetic content applies, along with a new prohibition on AI that generates CSAM or non-consensual intimate imagery.
   - **2 Aug 2027:** GPAI models placed on the market before Aug 2025 must comply.
   - **2 Dec 2027:** Annex III high-risk obligations apply (previously 2 Aug 2026).
   - **2 Aug 2028:** Annex I high-risk obligations apply (previously 2 Aug 2027).
   - SME relief is extended to small mid-caps.
2. **The GDPR, ePrivacy and cookie part of the Digital Omnibus is still being negotiated.** It is not law. The proposed GDPR Art 88a, which would move cookie rules into the GDPR, has reportedly been dropped in the Council text. The Council mandate is reported for Oct 2026, and Parliament's position is unclear. [?] Sources: [PPC Land](https://ppc.land/eu-council-agrees-4-month-cookie-re-ask-wait-for-digital-omnibus-talks/), [Heuking](https://www.heuking.de/en/news-events/newsletter-articles/detail/cookie-consent-under-the-digital-omnibus-planned-changes-and-technical-implementation.html). **Engine rule:** keep cookie rules keyed to ePrivacy Art 5(3) and national implementing laws.
3. **"§13 TMG" in the product doc is outdated.** The Telemediengesetz (TMG) was repealed on 14 May 2024. [V] Source: [IHK](https://www.ihk.de/bayreuth/hauptnavigation/service/recht/allgemeine-rechtsthemen/telemediengesetz-tmg-ist-jetzt-digitale-dienste-gesetz-ddg--6204406), [it-recht-kanzlei](https://www.it-recht-kanzlei.de/tmg-ttdsg-ausser-kraft-impressum-datenschutz.html).
   - The imprint (Impressum) rule is now **§5 DDG** (Digitale-Dienste-Gesetz).
   - Cookie and device-access consent is now **§25 TDDDG** (formerly TTDSG).
   - Privacy-notice duties now come from **GDPR Arts 13/14**. The old §13 TMG privacy duties had already been displaced by the GDPR in 2018.
   - Any notice that cites TMG or TTDSG should be flagged as **stale**.
4. **UK Data (Use and Access) Act 2025 (DUAA):** most data-protection and PECR changes commenced on **5 Feb 2026**. [V] Source: [Kennedys](https://www.kennedyslaw.com/en/thought-leadership/article/2026/the-data-use-and-access-act-2025-commencement-dates-and-planned-guidance-for-2026), [A&O Shearman](https://www.aoshearman.com/en/insights/ao-shearman-on-data/key-data-protection-changes-under-the-data-use-and-access-act-2025-comes-into-force).
   - New cookie exemptions cover analytics, functionality, security and software updates, provided users are informed and can opt out. Advertising cookies still need consent.
   - PECR fines are raised to UK GDPR levels [K].
   - New automated decision-making rules in Art 22A–D [K].
   - A complaints-handling duty applies from 19 Jun 2026, and the ICO becomes the Information Commission [?].
5. **US Corporate Transparency Act beneficial-ownership (BOI) reporting no longer applies to US companies.** The FinCEN interim rule of Mar 2025 was made permanent by a final rule effective about 14 Aug 2026. Only foreign reporting companies still file. [V] Source: [Davis Polk](https://www.davispolk.com/insights/client-update/fincen-eliminates-beneficial-ownership-reporting-requirements-u-s-companies), [BDO](https://www.bdo.com/insights/tax/fincen-final-rule-permanently-relieves-us-companies-of-beneficial-ownership-reporting-obligations). **Engine rule:** a Delaware or Wyoming company has no BOI filing.
6. **Nigeria's GAID 2025** (the NDPA General Application and Implementation Directive) was issued on 20 Mar 2025 and took effect on 19 Sep 2025. Compliance Audit Returns (CARs) are due 31 Mar each year. The deadline for 2025 CARs was extended to 30 May 2026. [V] Source: [DLA Piper](https://privacymatters.dlapiper.com/2025/06/nigeria-ndpc-issues-gaid-key-compliance-insights/), [OAL](https://oal.law/ndpc-extends-2025-data-protection-audit-return-deadline-to-30-may-2026/), [GAID PDF](https://ndpc.gov.ng/wp-content/uploads/2026/01/NDP-ACT-GAID-2025-MARCH-20-1.pdf).
7. **Colorado AI Act was repealed and replaced.** SB 26-189 was signed on 14 May 2026, with an effective date of about 1 Jan 2027 [?], and the approach is now lighter and transparency-based. [V/?] Source: [Illinois Lawyer Now](https://www.illinoislawyernow.com/2026/06/the-colorado-ai-act-everyone-was-preparing-for-no-longer-exists-here-is-what-actually-takes-effect-and-why-illinois-businesses-should-still-pay-attention/), [Squire Patton Boggs](https://www.privacyworld.blog/2026/05/the-colorado-ai-act-hits-a-wall-litigation-legislative-uncertainty-and-an-enforcement-standstill/).
8. **California Digital Financial Assets Law (DFAL):** crypto businesses needed a licence, a filed application or an exemption by **1 Jul 2026**. [V] Source: [Goodwin](https://www.goodwinlaw.com/en/insights/publications/2026/04/alerts-finance-dcb-california-dfal-license-application-open).
9. **UK Companies House:**
   - Identity verification for directors and persons with significant control (PSCs) has been mandatory since 18 Nov 2025, with a 12-month transition for existing officers that ends about Nov 2026 [V]. Source: [Hawsons](https://www.hawsons.co.uk/companies-house-verification-requirements-for-new-and-existing-directors/).
   - Since 1 Feb 2026 the confirmation statement fee is £50 and digital incorporation is £100 [V]. Source: [GOV.UK](https://www.gov.uk/government/news/companies-house-fees-are-changing-from-1-february-2026).
10. **New fintech licensing laws in Africa:**
    - **Kenya:** the Virtual Asset Service Providers (VASP) Act 2025 has been in force since 4 Nov 2025. Licensing waits on Treasury regulations, and existing firms have 12 months to comply. [V] Source: [CBK notice](https://www.centralbank.go.ke/uploads/press_releases/665231223_Public%20Notice%20on%20the%20Virtual%20Assets%20Service%20Providers%20Act%202025.pdf).
    - **Ghana:** Parliament passed the VASP Act in Dec 2025. I could not confirm a commencement date. [?] Source: [CoinGeek](https://coingeek.com/ghana-legalizes-crypto-trading-under-new-digital-asset-law/).
    - **Nigeria:** the Investments and Securities Act (ISA) 2025, s.357, treats digital assets as securities, so the SEC must register providers. [V] Source: [PwC](https://www.pwc.com/ng/en/assets/pdf/summary-key-changes-to-the-investments-securities-act-2025.pdf).
    - **South Africa:** FSCA transitional exemptions for crypto-asset service providers (CASPs) under FAIS ended on 30 Jun 2025. [V] Source: [DLA Piper Africa](https://www.dlapiperafrica.com/en/south-africa/insights/2026/FSCA_Update_on_Licensing_and_Supervision_of_Crypto_Asset_Service_Providers).
11. **South Africa amended its POPIA Regulations** (17 Apr 2025, GG 52523). Electronic direct marketing now needs written opt-in consent, and an opt-out no longer counts as consent. The Information Officer's duty to develop a PAIA manual was removed from the POPIA Regulations, but PAIA s51 itself still applies. [V] Source: [Bowmans](https://bowmanslaw.com/insights/south-africa-popia-regulations-get-a-makeover-what-you-need-to-know/).
12. **South Africa's Copyright Amendment Bill is not law.** In a judgment of 26 Jun 2026, the Constitutional Court sent it back to Parliament. [V] Source: [Afriwise](https://www.afriwise.com/blog/copyright-amendment-bill-constitutional-court-clarifies-the-future-of-south-africas-copyright-reform).

---

## 1. EU level (applies to Germany and France, and to any non-EU company with EU users)

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Data protection | Applies extraterritorially to anyone offering goods or services to, or monitoring, people in the EU | GDPR Art 3(2) | National data protection authorities (DPAs) | users_in_EU, or company in EU, and processes_personal_data | Data map / record of processing (ROPA) | Art 83: up to €20m or 4% of turnover |
| Data protection | EU representative for non-EU controllers | GDPR Art 27 | DPAs | users_in_EU and no EU establishment | Representative appointment letter; named in privacy notice | Up to €10m or 2% |
| Privacy notice | Transparent notice in "clear and plain language" | GDPR Arts 12–14 | DPAs | processes_personal_data | Privacy notice in the users' language | Up to €20m or 4% |
| Records | Record of processing activities. The under-250-staff exemption is narrow. | GDPR Art 30 | DPAs | processes_personal_data | ROPA | Up to €10m or 2% |
| DPO | DPO needed if core activities involve large-scale regular and systematic monitoring or large-scale special-category data | GDPR Art 37 | DPAs | large-scale monitoring, special-category data, or a German national trigger | DPO appointment; contact details published and notified to DPA | Up to €10m or 2% |
| DPIA | Data protection impact assessment for high-risk processing | GDPR Art 35 | DPAs | uses_AI, profiling, special-category data, large-scale processing | DPIA document | Up to €10m or 2% |
| Breach | Notify the DPA within 72 hours | GDPR Art 33–34 | DPAs | processes_personal_data | Incident response plan; breach log | Up to €10m or 2% |
| Automated decisions | Right not to be subject to solely automated decisions with legal or similarly significant effect | GDPR Art 22 | DPAs | uses_AI for decisions on individuals | Human-review process; Art 13(2)(f) disclosure | Up to €20m or 4% |
| Transfers | Transfers outside the EEA need an adequacy decision, standard contractual clauses (SCCs) with a transfer impact assessment, or binding corporate rules | GDPR Arts 44–49. The EU–US Data Privacy Framework stands; the General Court upheld it in Latombe, Sep 2025, appeal pending [K] | DPAs | data stored or processed outside the EEA | SCCs, DPF certification of US vendors, transfer impact assessment | Up to €20m or 4% |
| Cookies | Prior consent for non-essential storage or access on a device | ePrivacy Directive Art 5(3), implemented nationally (DE §25 TDDDG; FR Art 82 Loi Informatique et Libertés) | DPAs / CNIL | website or app with non-essential trackers | Consent management platform (CMP) logs; cookie policy | National penalties |
| AI | Classify every AI system by risk: prohibited (Art 5), high-risk (Annex I/III), transparency (Art 50), or minimal | AI Act, Reg (EU) 2024/1689, as amended by the AI Omnibus | National market surveillance authorities; EU AI Office for GPAI | uses_AI and EU users | AI inventory and risk classification | Art 99: up to €35m/7% (prohibited practices), €15m/3% (other breaches), €7.5m/1% (incorrect information). For SMEs, the lower of the two amounts [K] |
| AI | AI literacy measures for staff | AI Act Art 4 (softened) | Same | uses_AI | Training record | Not fined directly [K] |
| AI | Transparency: tell users they are dealing with a chatbot; label deepfakes; machine-readable marking of synthetic output (Art 50(2) from 2 Dec 2026) | AI Act Art 50 | Same | chatbot or generative AI feature | UI disclosures; watermarking or metadata | €15m/3% |
| AI | High-risk systems need a risk-management system, technical documentation, conformity assessment and EU database registration, from 2 Dec 2027 (Annex III) or 2 Aug 2028 (Annex I) | AI Act Ch. III | Same | AI used in hiring, credit scoring, education, biometrics, critical infrastructure, etc. | Technical file; quality management system | €15m/3% |
| AI | GPAI model providers need technical documentation, a copyright policy and a training-data summary | AI Act Arts 53–55 | AI Office | trains or fine-tunes a GPAI model and places it on the EU market | Model documentation; Code of Practice adherence | Commission fines from Aug 2026 [K] |
| Platforms | Hosting providers need notice-and-action and statements of reasons. Online platforms need complaint handling and must avoid dark patterns. Micro and small online platforms are exempt from most of Section 3, but Art 24(3) still applies. | DSA Reg 2022/2065: Arts 11–17, 19, 20, 24(3), 25 | National Digital Services Coordinators (DSCs) | hosts_user_content and EU users | Points of contact; T&Cs; notice form; transparency report (micro/small exempt) | Up to 6% of turnover |
| Platforms | EU legal representative for non-EU intermediaries. I believe there is no size exemption [?] | DSA Art 13 | DSCs | hosts_user_content, EU users, no EU establishment | Representative mandate | Up to 6% |
| Data access | Data-sharing duties for connected products and cloud-switching rules, applicable from 12 Sep 2025 [K] | Data Act Reg 2023/2854 | National authorities | IoT/connected product, or cloud/SaaS provider | Switching terms; data-access mechanism | National penalties |
| Accessibility | Accessibility for e-commerce, banking and e-book services, from 28 Jun 2025. Micro-enterprises providing services are exempt [K] | European Accessibility Act, Dir 2019/882 (DE: BFSG; FR: Law 2023-171) | Market surveillance authorities | B2C e-commerce or consumer banking, 10 or more staff | Accessibility statement; WCAG conformance | National penalties |
| Payments | Authorisation as a payment institution or e-money institution; passporting across the EU | PSD2 (Dir 2015/2366); EMD2 (Dir 2009/110). PSD3/PSR not yet in force [?] | National competent authorities (BaFin, ACPR) | processes_payments and holds or moves client funds | Licence or agent registration; or a partner-licensed model with a written agreement | Criminal offence (unlicensed) |
| Crypto | CASP authorisation. MiCA transitional periods ended on 30 Dec 2025 (DE) and 1 Jul 2026 (FR) [K] | MiCA Reg 2023/1114 | BaFin / AMF | crypto services | CASP authorisation | Criminal or administrative |
| Cyber | NIS2 registration, risk management and incident reporting for in-scope sectors, usually 50+ staff or €10m+ turnover. Some digital services (DNS, cloud, data centres, managed services) are in scope regardless of size [K] | NIS2 Dir 2022/2555 (DE: NIS2UmsuCG; FR: transposition pending [?]) | BSI / ANSSI | sector is digital infrastructure or ICT service management, plus size | Registration; incident runbook | Up to €10m or 2% (essential entities) |
| Consumer | EU Online Dispute Resolution (ODR) platform closed on 20 Jul 2025, so the ODR link duty no longer applies [K] | Reg (EU) 2024/3228 repealing Reg 524/2013 | n/a | B2C | Remove ODR link | n/a |

---

## 2. Nigeria

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Data protection | General NDPA compliance: lawful basis, notice, data-subject rights | Nigeria Data Protection Act (NDPA) 2023 Parts V–VI; GAID 2025 [V] | NDPC | processes_personal_data of people in Nigeria. Applies extraterritorially [K] | Privacy policy; ROPA | s48: for major-importance controllers, the higher of ₦10m or 2% of turnover; otherwise the higher of ₦2m or 2% [K] |
| Registration | Register with the NDPC as a Data Controller/Processor of Major Importance (DCPMI) | NDPA s44; NDPC Guidance Notice of 14 Feb 2024 [V]. Tiers: UHL, EHL and OHL. OHL is more than 200 data subjects in 6 months, fee ₦10,000 [V]. EHL (about 1,000+ subjects, ₦100k) and UHL (about 5,000+, ₦250k) and annual renewal are [K]/[?]. Certain sectors (finance, telecoms, health, etc.) qualify regardless of volume. | NDPC | Nigerian data subjects over threshold, or regulated sector | NDPC registration certificate | Fine; enforcement notice |
| Audit | Annual compliance audit and Compliance Audit Return (CAR), filed through a licensed Data Protection Compliance Organisation (DPCO) for UHL/EHL. Due 31 Mar; the 2025 cycle was extended to 30 May 2026. New CAR fees from the 2026 cycle under GAID Schedule 7(6). | GAID 2025 [V] | NDPC | DCPMI tier UHL or EHL | CAR filing receipt; DPCO audit report | Fine; NDPC compliance notices (1,368 issued Aug 2025) [V] |
| DPO | Data Protection Officer required for DCPMIs | NDPA s32; GAID [V] (secondary source) | NDPC | DCPMI | DPO appointment letter; training record | Fine |
| Privacy notice | Notice must meet NDPA s27. GAID also covers cookie consent and default privacy settings [K] | NDPA s27; GAID | NDPC | website or app | Privacy and cookie policy; CMP | Fine |
| Transfers | Transfers abroad need adequacy, appropriate safeguards (SCCs or binding corporate rules approved by NDPC) or a derogation. GAID treats cross-border transfer as high-risk, so a DPIA is needed. No adequacy list has been published [V] (secondary source) | NDPA ss41–43; GAID | NDPC | data hosted outside Nigeria | Transfer impact assessment; NDPC-approved clauses | Fine |
| Payments | CBN licence. Categories under the 2021 framework [V]: switching and processing (₦2bn), mobile money operator (₦2bn; only MMOs may hold customer funds), payment solution service provider (₦250m), payment terminal service provider (₦100m), super-agent (₦50m), and sandbox. 2025–26 capital updates not confirmed [?] | CBN Act 2007; BOFIA 2020; CBN licensing circular (2021) | CBN | processes_payments with Nigerian users | CBN licence, or partner-bank or licensed-PSP agreement | Criminal (BOFIA); shutdown |
| Lending | Digital lenders must register with the FCCPC (new entrants before launch), renew every 36 months and file annual returns. Effective 21 Jul 2025 (some sources say 3 Sep); full-compliance deadline 5 Jan 2026 | FCCPC DEON Regulations 2025 [V] | FCCPC | offers consumer credit online | FCCPC approval letter | Up to ₦100m or 1% of turnover [V] |
| Crypto | SEC registration for digital-asset service providers | ISA 2025 s357 [V] | SEC Nigeria | crypto or digital-asset services | SEC registration | Illegal operation |
| Consumer | Consumer rights: disclosure, fair terms, no misleading advertising | FCCPA 2018 Part XV (ss114–131) [K] | FCCPC | B2C | T&Cs; refund policy | Fines; for companies up to ₦100m [K] |
| AI | No binding AI law. National AI Strategy (2024/25) is policy. Bills pending: National Digital Economy and E-Governance Bill (risk-based, NITDA-led), SB 731 (National AI Commission), HB 942. NDPA s37 covers automated decisions [K] | Policy only [V] | NITDA / NDPC | uses_AI | AI-use register; DPIA | None AI-specific yet |
| IP | First ownership vests in the author. Employee works generally go to the employer unless the contract says otherwise. Section number unverified: Copyright Act 2022 s28 [K] vs s10(2) per [OAL](https://oal.law/who-owns-intellectual-property-created-by-employees-in-nigeria/) [?] | Copyright Act 2022; Patents and Designs Act | NCC | has_employees or has_contractors | IP assignment clauses; contractor assignment deeds | Ownership dispute |
| Tech transfer | Register foreign technology-transfer agreements (licences, software, technical services, management) with NOTAP within 30 days. Without registration, fees and royalties cannot be remitted through CBN-regulated channels | NOTAP Act Cap N62; 2024 updated requirements [V] | NOTAP | Nigerian entity pays a foreign affiliate or parent for IP, software or services (common in Delaware-flip structures) | NOTAP certificate | Late-filing penalty; FX remittance blocked |
| Corporate | Annual returns to the CAC. Deadline wording conflicts: within 42 days of the AGM, or by 30 Jun for exempt companies [?]. Late penalties per company size [?] | CAMA 2020 s417 et seq. [K] | CAC | incorporated in Nigeria (or a Nigerian subsidiary) | CAC annual return filing | Daily penalties; strike-off |
| Corporate | Register and disclose persons with significant control | CAMA 2020 s119; PSC Regulations 2022 [K] | CAC | incorporated in Nigeria | PSC filing | Penalties |

---

## 3. United Kingdom

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Data protection | UK GDPR compliance as amended by the DUAA (in force 5 Feb 2026) | UK GDPR; DPA 2018; DUAA 2025 [V] | ICO | processes personal data of people in the UK | ROPA; privacy notice | £17.5m or 4% |
| Fee | Annual data protection fee. Since 17 Feb 2025: Tier 1 £52 (turnover ≤£632k or ≤10 staff), Tier 2 £78 (≤£36m or ≤250 staff), Tier 3 £3,763. £5 off for direct debit [V] | Data Protection (Charges and Information) Regulations 2018 as amended. Source: [GOV.UK](https://www.gov.uk/government/consultations/data-protection-fee-regime-proposed-changes/outcome/data-protection-fee-regime-government-response) | ICO | UK-established controller (exemptions are narrow) | ICO registration number | Fixed penalty up to about £4,350 [K] |
| Representative | UK representative for non-UK controllers | UK GDPR Art 27 | ICO | UK users, no UK establishment | Representative appointment | Fine |
| Cookies | Consent for non-essential cookies. New exemptions (analytics, functionality, security, software updates) apply with notice and opt-out. Advertising still needs consent. Final ICO guidance pending [?] | PECR reg 6 as amended by DUAA s112 [V] | ICO | website or app | CMP configuration; cookie policy | Up to £17.5m or 4% after DUAA [K] |
| Automated decisions | Solely automated significant decisions are allowed with safeguards (information, human intervention, ability to contest). Stricter rules for special-category data | UK GDPR Art 22A–D (DUAA) [K] | ICO | uses_AI for decisions on individuals | Safeguards documentation | £17.5m or 4% |
| Transfers | UK International Data Transfer Agreement (IDTA) or EU SCC Addendum, plus UK adequacy regulations (including the UK–US Data Bridge). DUAA adds a new "data protection test" [K] | UK GDPR Ch V | ICO | data outside the UK | IDTA or Addendum; transfer risk assessment | £17.5m or 4% |
| DPO | Same tests as EU GDPR Art 37 | UK GDPR Art 37 | ICO | large-scale monitoring or special-category data | DPO appointment | £8.7m or 2% |
| Payments | FCA authorisation or registration as an authorised or small payment institution (PSRs 2017) or e-money institution (EMRs 2011) | PSRs 2017; EMRs 2011; FSMA 2000 s19 | FCA | processes_payments, holds or moves funds | FCA authorisation, or agent/partner agreement | Criminal offence |
| Safeguarding | New CASS 15 safeguarding regime from 7 May 2026: reconciliations, monthly return, annual audit when safeguarded funds exceed £100k, resolution pack (CASS 10A). Some trust elements may be deferred to 2027 [?] | FCA PS25/12 [V]. Source: [Linklaters](https://financialregulation.linklaters.com/post/102mef0/payments-in-2026-1-safeguarding) | FCA | authorised PI or EMI | Safeguarding audit; monthly return | Supervisory action |
| Crypto | Money Laundering Regulations (MLRs) registration and crypto financial-promotion rules. Full authorisation regime planned for about Oct 2027 [K] | MLRs 2017 reg 56; FSMA (Financial Promotion) Order | FCA | crypto services | MLR registration | Criminal |
| Consumer | CMA can directly impose fines up to 10% of global turnover (since 6 Apr 2025). Bans on fake reviews and drip pricing. Subscription-contract regime commencement not confirmed [?] | DMCC Act 2024 Part 4 [K] | CMA | B2C | Pricing audit; reviews policy; cancellation flow | Up to 10% of global turnover |
| Online safety | Illegal-harms and children's risk assessments; user reporting tools | Online Safety Act 2023 (duties live 2025) [K] | Ofcom | hosts_user_content and UK users | Risk assessments | £18m or 10% |
| AI | No AI Act. Sector regulators apply principles. No dedicated AI bill in the May 2026 King's Speech [V]. Source: [Lewis Silkin](https://www.lewissilkin.com/insights/2026/09/14/ai-judgment-day-on-the-horizon-while-uk-lawmakers-play-catch-up) | Principles approach; UK GDPR Art 22A–D | ICO; CMA; FCA | uses_AI | AI register; DPIA | Via existing laws |
| IP | Employer owns works made by employees in the course of employment. Contractors keep ownership unless they sign a written assignment | CDPA 1988 s11(2), s90(3); Patents Act 1977 s39 [K] | IPO / courts | has_contractors | Signed IP assignment | Ownership gap at due diligence |
| Corporate | Confirmation statement at least every 12 months, filed within 14 days of the review period end. Fee £50 since 1 Feb 2026 [V] | CA 2006 s853A | Companies House | UK company | Filing receipt | Offence; strike-off |
| Corporate | PSC register; identity verification for directors and PSCs (new appointments since 18 Nov 2025; existing officers by their next confirmation statement) [V] | CA 2006 Part 21A; ECCTA 2023 | Companies House | UK company | PSC register; identity verification codes | Offence |
| Corporate | Annual accounts within 9 months of year end (private companies) | CA 2006 s442 [K] | Companies House | UK company | Filed accounts | Late-filing penalties |

---

## 4. United States: federal, Delaware, Wyoming, California

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Corporate (DE) | Annual report and franchise tax due **1 Mar**. Minimum tax $175 (authorized shares method) or $400 (assumed par value capital method), maximum $200k ($250k for large corporate filers). Report fee $50 [V]. Source: [Delaware](https://corp.delaware.gov/paytaxes/) | 8 Del. C. §§502–503 | DE Division of Corporations | incorporated_in = Delaware corporation | Paid annual report | $200 penalty plus 1.5% a month; loss of good standing |
| Corporate (DE LLC) | $300 annual tax due 1 Jun [K] | 6 Del. C. §18-1107 | Same | Delaware LLC | Receipt | $200 penalty [K] |
| Corporate (DE) | Registered agent in Delaware | 8 Del. C. §132 [K] | Same | Delaware entity | Agent contract | Void status |
| Corporate (WY) | Annual report due the first day of the formation anniversary month. License tax is the greater of $60 or $0.0002 × assets located in Wyoming [V] | W.S. 17-16-1630 (corporations) / 17-29-209 (LLCs) [K]. Source: [WY SOS FAQ](https://sos.wyo.gov/faqs.aspx?root=BUS) | WY Secretary of State | incorporated_in = Wyoming | Filed report | Administrative dissolution [K] |
| Corporate (fed) | No BOI report for US entities (final rule Aug 2026) [V] | CTA; 31 CFR 1010.380 | FinCEN | foreign entity registered in a US state | n/a | n/a |
| Corporate (CA) | Foreign qualification, Statement of Information and $800 minimum franchise tax if "doing business" in California [K] | Cal. Corp. Code §2105; R&TC §23153 | CA SOS / FTB | team or operations in California | Qualification certificate | Penalties |
| Privacy (CA) | CCPA/CPRA applies if gross revenue exceeds **$26,625,000** (from 1 Jan 2025; next adjustment 2027), or the business buys, sells or shares data of 100k+ consumers, or earns 50%+ of revenue from selling or sharing [V]. Source: [CPPA](https://www.cppa.ca.gov/regulations/cpi_adjustment.html) | Cal. Civ. Code §1798.100 et seq.; §1798.140(d) | CPPA; Attorney General | users_in = California, plus a threshold met | Privacy policy, "Do Not Sell or Share" link, honouring Global Privacy Control signals, service-provider contracts | About $2,663 per violation, $7,988 if intentional (2025 figures) [K] |
| Privacy (CA) | New CPPA regulations, effective 1 Jan 2026: risk assessments now (pre-2026 processing by 31 Dec 2027; submissions by 1 Apr 2028); automated decision-making (ADMT) rules from 1 Jan 2027; cybersecurity audits due 2028–2030 by revenue tier [V]. Source: [CPPA](https://www.cppa.ca.gov/announcements/2025/20250923.html), [Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/newly-approved-ccpa-regulations-have-staggered-deadlines-for-compliance) | CCPA Regulations, Cal. Code Regs. tit. 11 | CPPA | CCPA business, and uses_AI for significant decisions or high-risk processing | Risk assessment; ADMT pre-use notice; audit certification | Same as above |
| Privacy (CA) | Data broker registration and the Delete Request and Opt-out Platform (DROP): processing started 1 Aug 2026 [V] | Delete Act SB 362 | CPPA | sells data of consumers it has no direct relationship with | Registration | Daily fines |
| Cookies (US) | No opt-in requirement. Opt-out of "sharing" (cross-context ads) and honouring Global Privacy Control under CCPA | CCPA regs §7025 [K] | CPPA | ad-tech pixels | CMP with GPC handling | As above |
| Payments (fed) | Register as a money services business (MSB) with FinCEN within 180 days; run an anti-money-laundering (AML) programme | 31 CFR 1022.380 [K] | FinCEN | transmits money or convertible virtual currency | MSB registration; AML policy | Civil and criminal |
| Payments (state) | State money transmitter licences (via NMLS). Model Money Transmission Modernization Act fully adopted by about 13 states, partly by about 9 (Jul 2026) [V/?]. Source: [CSBS](https://www.csbs.org/mtma-legislative-update-august-2026) | State money-transmission laws | State regulators (CA DFPI) | holds or moves funds for others | Licences, or a sponsor bank / agent-of-payee structure | Criminal (18 USC 1960) |
| Crypto (CA) | DFAL licence or application by 1 Jul 2026 [V] | Cal. Fin. Code §3101 et seq. | DFPI | crypto business with California residents | DFAL licence | Fines; cease-and-desist |
| Consumer | FTC Act s5 (unfair or deceptive practices). The FTC "click-to-cancel" rule was vacated by the 8th Circuit in Jul 2025 [K]. California Automatic Renewal Law (amended by AB 2863, effective 1 Jul 2025) [K]. COPPA rule amendments, compliance by Apr 2026 [K] | 15 USC 45; Cal. B&P §17600 | FTC; CA Attorney General | B2C subscriptions; users under 13 | Cancellation flow; renewal disclosures | Civil penalties |
| AI (fed) | No federal AI statute. A Dec 2025 executive order set up a DOJ AI Litigation Task Force (Jan 2026) to challenge state AI laws, but state laws remain enforceable [V]. Source: [BakerHostetler](https://www.bakerlaw.com/insights/navigating-the-emerging-federal-state-ai-showdown-doj-establishes-ai-litigation-task-force/) | EO of 11 Dec 2025 | DOJ / FTC | uses_AI | n/a | n/a |
| AI (state) | California SB 53 for frontier developers (from 1 Jan 2026) [K]. California AI Transparency Act SB 942, delayed by AB 853 [?]. Colorado SB 26-189 (about Jan 2027) [?]. CCPA ADMT rules (2027) | State laws | CA AG / CPPA; CO AG | uses_AI; trains frontier models; offers generative AI with 1M+ users | AI disclosures | State fines |
| IP | Employee work within the scope of employment is a work made for hire. Contractor work is only work for hire in 9 statutory categories and with a signed writing, and software usually does not qualify, so an assignment is needed (§204(a)). Patents need an express assignment. California: Labor Code §2870 notice; a work-for-hire clause with a California contractor can make them an employee (Lab. Code §3351.5(c)) [K] | 17 USC §§101, 201(b), 204(a); Cal. Lab. Code §§2870–2872, 3351.5(c); DTSA 18 USC 1833(b) whistleblower notice | Courts | has_employees, has_contractors | Proprietary Information and Inventions Assignment Agreement (PIIA/CIIAA); contractor IP assignment; founder IP assignment to the company | Title defects at financing |

---

## 5. Germany

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Imprint | Impressum with name, address, email, register number, VAT ID and managing directors; easily recognisable and always available. **Not §5 TMG, and not §13 TMG** [V] | **§5 DDG** | Competitors (cease-and-desist letters under UWG); authorities | website or app offered in Germany (commercial) | Impressum page | Fine up to €50k (§33 DDG) [K]; cease-and-desist letters |
| Cookies | Consent for non-essential device access. The exception for strictly necessary access is §25(2). An ordinance on recognised consent-management services (EinwV) is in force [K] | **§25 TDDDG** (formerly TTDSG) [V] | State DPAs; BfDI | non-essential trackers | CMP logs; cookie notice citing TDDDG | Up to €300k (§28 TDDDG) [K] |
| Privacy notice | GDPR Arts 13/14 notice. No statute requires German, but Art 12 clarity in practice means German for German consumers. Flag citations to TMG or TTDSG as stale | GDPR Art 12–14; BDSG | DPAs | German users | German-language privacy notice | GDPR fines; cease-and-desist letters |
| DPO | DPO required if **20 or more people** regularly process personal data by automated means, or in DPIA or commercial data-transfer cases [K] | BDSG §38 | State DPAs | Germany-established, staff of 20+ | DPO appointment notified to the DPA | GDPR Art 83(4) |
| Employee data | Employee-data rules (§26 BDSG partly invalidated by the CJEU, C-34/21) [K] | BDSG §26 | DPAs | has German employees | Works-council agreements | GDPR fines |
| Payments | Licence as a payment institution (§10) or e-money institution (§11), or a banking licence | ZAG §§10–11; KWG §32 [K] | BaFin | processes_payments, holds or moves funds | BaFin licence or EU passport | Criminal (§63 ZAG) |
| Crypto | MiCA CASP authorisation | MiCA; KMAG [K] | BaFin | crypto services | Authorisation | Criminal |
| Cyber | NIS2 registration with the BSI and risk management, in force **6 Dec 2025**. Registration deadline 6 Mar 2026, grace period to 31 Jul 2026 [V] | NIS2UmsuCG / BSIG. Source: [ADVANT Beiten](https://www.advant-beiten.com/aktuelles/nis-2-umsetzungsgesetz-in-kraft-neue-cybersicherheitspflichten-fuer-unternehmen) | BSI | in-scope sector and size | BSI registration | Up to €10m or 2% |
| Consumer | "Button solution": order button must read "zahlungspflichtig bestellen" or equivalent. Cancellation button (Kündigungsbutton). Consumer dispute-resolution information if 10+ staff | BGB §312j, §312k; VSBG §36 [K] | Consumer associations; courts | B2C subscriptions | Checkout and cancellation flows | Contract void; cease-and-desist letters |
| Accessibility | BFSG (implements the European Accessibility Act) from 28 Jun 2025; micro-enterprises providing services exempt [K] | BFSG | Market surveillance authorities | B2C e-commerce, 10+ staff | Accessibility statement | Up to €100k [K] |
| IP | Employees: rights pass under the employment purpose (§43). For software, the employer gets exclusive economic rights (§69b). Inventions: the employer is deemed to claim them 4 months after notice (ArbnErfG). Contractors: under the purpose-of-transfer rule (§31(5)), an explicit grant of usage rights is needed [K] | UrhG §§31(5), 43, 69b; ArbnErfG §§5–7 | Courts | has_employees, has_contractors | Employment IP clause; contractor usage-rights grant | Rights gap; inventor compensation |
| Corporate | Report beneficial owners to the Transparenzregister. The old rule treating other register entries as sufficient was abolished in 2021. Report again only when something changes (no annual filing) [V/?] | GwG §§19–20 | BVA (fines); Bundesanzeiger Verlag (operator) | German entity (GmbH/UG) | Transparenzregister confirmation | GwG §56: fines from €100k up to €1m–5m [?] |
| Corporate | Publish annual accounts in the company register (Unternehmensregister) within 12 months [K] | HGB §325 | Bundesamt für Justiz | German entity | Filing receipt | Administrative fine (Ordnungsgeld) |

---

## 6. France

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Legal notice | Website legal notice (mentions légales): publisher identity, director of publication, host. The SREN law (2024-449) renumbered LCEN, and the rule now appears to sit in **LCEN art 1-1** (formerly art 6-III) [?] — confirm on Légifrance | LCEN (Loi 2004-575) | Courts / DGCCRF | website offered in France | Mentions légales page | 1 year and €75k (individuals; ×5 for legal entities) [K] |
| Cookies | Prior consent for trackers. "Refuse" must be as easy as "Accept" (refuse button on the first layer). The CNIL fines heavily: cookies were a leading sanction theme in 2025 [V] | Loi Informatique et Libertés (78-17) art 82; CNIL guidelines and recommendation of 17 Sep 2020 | CNIL | trackers on a French-facing site | CMP with symmetric choices | GDPR-level; CNIL simplified sanctions |
| Privacy | GDPR plus French specifics: minors' consent at 15, post-mortem data instructions [K] | GDPR; Loi 78-17 | CNIL | French users | Privacy notice in French | Up to €20m or 4% |
| Language | Consumer-facing descriptions, offers, terms and instructions must be in French (translations may sit alongside). Software terms of use are not explicitly addressed [?] | Loi Toubon 94-665 art 2 | DGCCRF | B2C users in France | French T&Cs and UI copy | €750 per offence (natural persons, ×5 for companies) [K] |
| DPO | GDPR Art 37 tests | GDPR | CNIL | large-scale monitoring or special-category data | DPO registered with the CNIL | GDPR fines |
| Payments | Licence as a payment institution or e-money institution | Code monétaire et financier (CMF) L522-6, L526-7 [K] | ACPR | processes_payments | Licence or passport | Criminal |
| Crypto | MiCA CASP authorisation (transition ended 1 Jul 2026 [K]) | MiCA | AMF / ACPR | crypto | Authorisation | Criminal |
| Consumer | Pre-contract information; withdrawal right of 14 days; subscriptions must be cancellable in "3 clicks" (since Jun 2023) [K] | Code de la consommation L221-5, L215-1-1 | DGCCRF | B2C subscriptions | Cancellation function | Fines up to €15k (companies €75k) per breach [K] |
| AI | AI Act plus CNIL AI recommendations | AI Act; GDPR | CNIL; DGCCRF (market surveillance) [?] | uses_AI | AI register | As EU |
| IP | Employee-created software vests in the employer. For other works the employee-author keeps rights unless they are assigned. Assignments must meet formal requirements (each right listed; scope, territory, duration). Employee "mission" inventions belong to the employer [K] | Code de la propriété intellectuelle (CPI) L113-9, L111-1, L131-3, L611-7 | Courts | has_employees, has_contractors | Assignment compliant with L131-3 | Assignment void |
| Corporate | Beneficial-owner (RBE) filing at the commercial court registry at registration; changes within 30 days. Public access restricted since 31 Jul 2024 [V/?] | CMF L561-45-1 et seq.; sanctions L561-49 [K] | Registry (greffe) / INPI | French entity | RBE filing | 6 months' imprisonment and €7,500 [K]; possible ex officio strike-off [?] |
| Corporate | File annual accounts within 1 month of approval (2 months online). Micro and small companies may opt for confidentiality [K] | Code de commerce L232-21–23 | Registry | French entity | Filing receipt | Injunction; fine |

---

## 7. Kenya

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Data protection | DPA compliance: principles, notice, rights | Data Protection Act 2019 | ODPC | processes data of people in Kenya | Privacy notice | Up to KES 5m or 1% of turnover, whichever is lower (s63). A 2025 amendment bill would change this to "whichever is higher" [V/?] |
| Registration | Register as data controller or processor (separately for each role). Exempt if turnover is under KES 5m **and** fewer than 10 staff (the wording on whether tests are cumulative is disputed [?]), unless in a mandatory sector (Third Schedule: e.g. health, education, finance, telecoms, digital marketing, ride-hailing). Certificate valid **24 months**; renew 30 days before expiry. Fees in the Second Schedule are about KES 4,000 (micro/small), 16,000 (medium) and 40,000 (large) [K] | DPA s18; Registration Regulations 2021 (LN 265/2021). Source: [ODPC PDF](https://www.odpc.go.ke/wp-content/uploads/2024/03/THE-DATA-PROTECTION-REGISTRATION-OF-DATA-CONTROLLERS-AND-DATA-PROCESSORS-REGULATIONS-2021.pdf) | ODPC | Kenyan entity, or processing Kenyan data, over threshold | ODPC certificate | Enforcement notice; fine |
| DPO | Optional unless core activities involve large-scale monitoring or sensitive data [K] | DPA s24 | ODPC | as GDPR | DPO appointment | Fine |
| DPIA / breach | DPIA for high-risk processing; notify the ODPC of breaches within 72 hours [K] | DPA ss31, 43 | ODPC | high-risk processing | DPIA filing | Fine |
| Transfers | Transfers abroad need proof of safeguards or consent; data localisation applies to some strategic processing [K] | DPA ss48–50; General Regulations 2021 | ODPC | data outside Kenya | Transfer safeguards | Fine |
| Payments | Payment service provider (PSP) authorisation. A National Payment System Bill 2026 (10 licence categories) is at consultation, not law [V] | NPS Act 2011 ss12–15; NPS Regulations 2014. Source: [Bowmans](https://bowmanslaw.com/insights/kenya-national-payment-system-bill-2026-proposes-comprehensive-overhaul-of-the-payments-regulatory-framework/) | CBK | processes_payments | CBK authorisation | Criminal; revocation |
| Lending | Digital or non-deposit-taking credit provider licence [K] | CBK Act (2021 amendment); DCP Regulations 2022 | CBK | consumer lending | CBK licence | Fines |
| Crypto | VASP licence (Act in force 4 Nov 2025; licensing awaits regulations; 12-month transition) [V] | VASP Act 2025 | CBK / CMA | crypto | Licence application | Criminal |
| Consumer | Consumer rights and unconscionable-terms rules [K] | Consumer Protection Act 2012; Competition Act (Part VI) | Competition Authority of Kenya | B2C | T&Cs | Fines |
| AI | National AI Strategy 2025–2030 (launched 27 Mar 2025). No binding AI law [V] | Policy | Ministry of ICT / ODPC | uses_AI | DPIA (DPA s35 automated decisions) | Via DPA |
| IP | Employer or commissioner ownership rules [?] | Copyright Act 2001 (Cap 130) s31 [K] | KECOBO | has_employees, has_contractors | Assignment | Ownership dispute |
| Corporate | Annual returns on the incorporation anniversary [V] | Companies Act 2015 s705 | Business Registration Service (BRS) | Kenyan entity | Annual-return receipt (eCitizen) | Up to KES 200k per company and officer [V] |
| Corporate | Beneficial-ownership register lodged with the Registrar within 30 days of changes. eCitizen blocks other filings until it is submitted [V] | Companies Act s93A; BO Regulations 2020 | BRS | Kenyan entity | BO filing | Strike-off risk |

---

## 8. Ghana

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Data protection | Act 843 principles | Data Protection Act 2012 (Act 843) | Data Protection Commission (DPC) | processes data in Ghana | Privacy notice | Fines / imprisonment |
| Registration | **Register before processing.** Unregistered controllers may not process (s53). Renewal every 2 years [?]: apply 3 months to 6 weeks before expiry, with a compliance report. Fees tiered by size and sector [V]. Nationwide enforcement from Jan 2026; DPC Privacy Seal launched Dec 2025. A new Data Protection Bill 2025 was consulted on in Oct 2025 and is not enacted [V] | Act 843 ss27, 46–53. Sources: [DPC](https://dataprotection.org.gh/registration/), [trade.gov](https://www.trade.gov/market-intelligence/ghana-information-technologies-data-protection) | DPC | any controller processing data of people in Ghana | DPC certificate | Prosecution; licence risk |
| DPO | Optional "data protection supervisor" [K] | Act 843 s58 | DPC | n/a | Appointment | n/a |
| Transfers | Limited express rules. Rely on Act 843 principles and the registration disclosure [?] | Act 843 | DPC | data outside Ghana | Transfer disclosure in registration | n/a |
| Payments | Payment service provider licence. Categories include dedicated e-money issuer (GHS 20m capital), enhanced PSP, medium PSP and standard PSP (startup tier with low or no capital). 2025 capital levels not confirmed [?] | Payment Systems and Services Act 2019 (Act 987) | Bank of Ghana | processes_payments | BoG licence | Criminal |
| Crypto | VASP licensing (Act passed Dec 2025; commencement and directives pending) [?] | VASP Act 2025 | BoG / SEC Ghana | crypto | Licence | Criminal |
| Cyber | Cybersecurity service providers need a licence (since 2023). Enforcement was reported for 31 Jan 2026, but the year is unconfirmed [?] | Cybersecurity Act 2020 (Act 1038) ss49, 57–59 [V]. Source: [CSA](https://www.csa.gov.gh/licensing_and_accreditation) | Cyber Security Authority | sells security services | CSA licence | Penalty based on damage and gain |
| Consumer | No general consumer act. E-commerce consumer provisions apply; a consumer protection bill is pending [K] | Electronic Transactions Act 2008 (Act 772) | Ministry / NCA | B2C online | Website disclosures | Fines |
| AI | No binding AI law. A national AI strategy exists in draft or policy form [?] | — | — | uses_AI | — | — |
| IP | Works made in employment generally vest in the employer [?] | Copyright Act 2005 (Act 690), section unverified (s7 cited by some) [?] | Copyright Office | has_employees | Assignment | Dispute |
| Corporate | Annual returns to the Office of the Registrar of Companies. Late penalty GH¢500 since 2022; some 2026 reports mention GH¢2,000 [?] | Companies Act 2019 (Act 992) | ORC | Ghanaian entity | Annual-return receipt | Penalty |
| Corporate | Beneficial-ownership filing. Deadline for existing companies was 30 Oct 2025; daily penalty of 25 penalty units [V] | Act 992 (BO provisions) | ORC | Ghanaian entity | BO filing | Daily penalty; false information up to 2 years' imprisonment |

---

## 9. South Africa

| Area | Obligation | Instrument | Regulator | Trigger | Evidence | Penalty |
|---|---|---|---|---|---|---|
| Data protection | POPIA conditions for lawful processing | POPIA 4 of 2013 | Information Regulator | processes data in South Africa | Privacy notice | Up to R10m; imprisonment |
| Information Officer | Register the Information Officer (and deputies) on the Regulator's eServices portal before they take up duties. Registration is free. Each group company registers separately. Foreign entities need a South Africa-based deputy or representative [V] | POPIA ss55–56. Source: [eServices](https://eservices.inforegulator.org.za) | Information Regulator | South African entity, or processing South African data | Registration confirmation | Enforcement notice |
| Access to information | PAIA s51 manual. Annual PAIA s32/s83(4) report, 1 Apr to 30 Jun window, filed via the portal [V] | PAIA 2 of 2000 | Information Regulator | South African private body | PAIA manual; annual report | Fine or offence |
| Direct marketing | Written opt-in consent for unsolicited electronic marketing; opt-out is not consent (amended Regulations, 17 Apr 2025) [V] | POPIA s69; Regulations GG 52523 | Information Regulator | sends marketing email or SMS | Consent records (Form 4) | Up to R10m |
| Breach | Notify the Regulator and data subjects of security compromises. Use of the eServices portal is reportedly mandatory since 2025 [?] | POPIA s22 | Information Regulator | processes data | Incident log | Fine |
| Automated decisions | Restriction on solely automated decisions | POPIA s71 [K] | Information Regulator | uses_AI for decisions on individuals | Human-review process | Fine |
| Transfers | Transfers abroad need adequate protection, consent or contract necessity | POPIA s72 [K] | Information Regulator | data outside South Africa | Transfer agreement | Fine |
| Payments | Payment activity is regulated through SARB directives and PASA. Holding client funds may need a bank or deposit-taking arrangement | National Payment System Act 78 of 1998; SARB Directives 1 and 2 of 2007 [K] | SARB / PASA | processes_payments | Sponsor bank; PASA participation | Criminal |
| Crypto | CASP licence under FAIS. Exemptions ended 30 Jun 2025. Exchange-control treatment of crypto is changing (Circular 3/2026; draft Capital Flow Management Regulations 2026) [V] | FAIS Act; FIC Act | FSCA; FIC; SARB FinSurv | crypto | FSP licence | Regulatory action |
| Exchange control | Exporting IP offshore (for example, flipping into a Delaware parent) needs SARB/FinSurv approval. "Loop" structures have been liberalised but are reportable [K] | Exchange Control Regulations reg 10(1)(c) | SARB FinSurv | South African founders with foreign holding company or IP transfer | SARB approval / authorised-dealer letter | Criminal; forfeiture |
| Consumer | Plain-language duty, cooling-off and website disclosures (7-day cooling-off for e-commerce) [K] | Consumer Protection Act 68 of 2008 s22; ECTA ss43–44 | National Consumer Commission | B2C | T&Cs; site disclosures | Up to R1m or 10% of turnover |
| AI | Draft National AI Policy (Cabinet approval 25 Mar 2026; comments closed 10 Jun 2026; final expected about Mar 2027). Sector-regulator model; no binding law [V]. Source: [Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/2026/02/south-african-ai-policy-moves-towards-approval) | Policy | DCDT | uses_AI | AI register | n/a |
| IP | Employer owns works made under a contract of service. Assignments must be written and signed. Copyright Amendment Bill not law (Constitutional Court, Jun 2026) [V/K] | Copyright Act 98 of 1978 s21(1)(d), s22(3) | CIPC / courts | has_employees, has_contractors | Assignment | Dispute |
| Corporate | Annual return within 30 business days after the incorporation anniversary [K/?] | Companies Act 71 of 2008 s33 | CIPC | South African entity | Annual-return receipt | Penalty; deregistration |
| Corporate | Beneficial-ownership filing (enforced alongside annual returns since 1 Jul 2024). CIPC blocks annual returns without a current BO filing [V] | Companies Act s56; Regulation 32A. Source: [CMS](https://cms.law/en/zaf/legal-updates/compliance-alert-beneficial-ownership-filings-and-securities-registers) | CIPC | South African entity | BO declaration | Penalty; deregistration |

---

## (a) Draft questionnaire (22 questions)

| # | Question | Answer type | Triggers rules |
|---|---|---|---|
| Q1 | Country (and US state) of incorporation of each entity | multi-select entity list: {country, state, entity_type: corp/LLC/GmbH/SAS/Ltd/PLC/Pty} | Corporate filings (DE/WY/CAC/CH/Transparenzregister/RBE/BRS/ORC/CIPC); local data-protection registration; IP local law |
| Q2 | Countries where you have users or customers | multi-select countries + "EU-wide" | GDPR Art 3(2) and Art 27; UK Art 27; NDPA, ODPC, DPC, POPIA extraterritorial reach; DSA; Toubon (FR); §5 DDG (DE) |
| Q3 | US states with users (California, Colorado, others) | multi-select | CCPA thresholds; Colorado AI; state money transmitter licences; DFAL |
| Q4 | Countries of your investors / parent company | multi-select | NOTAP (Nigerian subsidiary paying a foreign parent); SARB exchange control (IP flip); foreign BOI (non-US entity registered in the US) |
| Q5 | Where are team members based? Employees vs contractors per country | matrix {country: employees_n, contractors_n} | IP ownership rules; German BDSG §38 (20+ staff); California Labor Code §2870/§3351.5; employee-data rules |
| Q6 | Annual revenue (band) and headcount (band) | enum bands | ICO fee tier; CCPA revenue threshold; Kenya ODPC exemption/fee tier; DSA, EAA and NIS2 size tests; CPPA audit tier |
| Q7 | Do you process personal data? Approximate number of data subjects per country in the last 6 / 12 months | bool + number per country | NDPC DCPMI tiers (200 / 1k / 5k [?]); CCPA 100k; GDPR large-scale; DPO |
| Q8 | Do you process sensitive data (health, biometrics, financial, children, location)? | multi-select | DPIA; DPO; Kenya mandatory sectors; COPPA; AI Act biometrics |
| Q9 | Where is data hosted or processed? List vendors and countries | multi-select countries + vendor list | Transfer rules (GDPR Ch V, UK IDTA, NDPA ss41–43, DPA KE ss48–50, POPIA s72) |
| Q10 | Do you use cookies, pixels, SDKs or analytics? Which kinds? | multi-select {strictly necessary, analytics, functionality, advertising, session replay} | ePrivacy/TDDDG §25/Art 82; PECR (DUAA exemptions); CCPA "sharing" and GPC; GAID cookie rules |
| Q11 | Do you send marketing email or SMS? Opt-in or opt-out? | enum | POPIA s69 (opt-in); PECR reg 22; GDPR |
| Q12 | Do you use AI? Pick roles and use-cases | multi-select roles {provider, deployer, GPAI trainer}; use-cases {chatbot, generative content, hiring, credit, biometrics, education, insurance pricing, content moderation} | AI Act risk classes and dates; Art 50; GDPR Art 22; UK Art 22A; CCPA ADMT; Colorado; POPIA s71; NDPA s37 |
| Q13 | Do AI or automated systems make decisions with legal or similarly significant effects on individuals without human review? | bool | GDPR Art 22 / UK 22A–D / CCPA ADMT / POPIA s71 |
| Q14 | Do you process payments, hold customer funds, issue wallets, lend money, or handle crypto? | multi-select {payments via third-party PSP only, hold funds, e-money/wallet, lending, crypto/digital assets, FX} | CBN/FCA/BaFin/ACPR/CBK/BoG/SARB; FinCEN MSB and state licences; DFAL; MiCA; ISA 2025; Kenya and Ghana VASP Acts; FCCPC DEON; CASS 15 |
| Q15 | If you use a licensed partner (Stripe, Paystack, sponsor bank), upload the agreement | file upload | Evidence for the "licence not needed" branch |
| Q16 | Is your sector regulated? | multi-select {fintech, health, edtech, insurtech, telecoms, gaming, mobility, gov} | Sector licences; Kenya mandatory registration; NDPC sector-based DCPMI; AI Act Annex III |
| Q17 | B2C, B2B or both? Do you sell subscriptions or auto-renewals? | enum + bool | FCCPA; DMCC; BGB §312j/k; FR L215-1-1; CA Automatic Renewal Law; CPA/ECTA SA; Toubon |
| Q18 | Do you host user-generated content or run a marketplace? | bool | DSA; Online Safety Act (UK); hosting liability |
| Q19 | Are your users under 18 (under 13)? | bool | COPPA; AADC/OSA children duties; GDPR Art 8; FR minors' consent at 15 |
| Q20 | Do all founders, employees and contractors have signed IP assignment agreements? Did founders assign pre-incorporation IP to the company? | per-person bool + upload | UK CDPA s90(3); 17 USC 204; UrhG §31(5)/§69b; CPI L131-3; SA s22(3); Nigeria CA 2022 |
| Q21 | Does a local entity pay a foreign affiliate for IP, software or services? Was IP moved offshore? | bool + countries | NOTAP; SARB reg 10(1)(c); transfer pricing (out of scope) |
| Q22 | Last filing dates: annual return / confirmation statement / franchise tax / BO filing / data-protection registration / CAR | date per obligation | Deadline engine: overdue / due-soon scoring |

---

## (b) Suggested rule data structure (each country is a module)

```yaml
# rule pack = jurisdiction module; rules are data, evaluated against questionnaire answers
module:
  id: "NG"                        # ISO 3166 / "EU" / "US-DE" / "US-CA"
  version: "2026.11.0"
  parent: null                    # e.g. "DE" -> parent "EU" (inherits EU rules)
  last_reviewed: "2026-11-04"
  reviewer: "..."
rule:
  id: "NG.DP.DCPMI_REGISTRATION"  # {juris}.{area}.{slug}, stable
  jurisdiction: "NG"
  area: "data_protection"         # enum: data_protection|cookies|dpo|transfers|payments|crypto|consumer|ai|ip|corporate|cyber|platform|accessibility
  title: "Register as Data Controller/Processor of Major Importance"
  obligation_text: "..."          # plain-English, short
  instrument:
    - {law: "Nigeria Data Protection Act 2023", cite: "s44", url: "...", status: "in_force"}
    - {law: "NDPC Guidance Notice (14 Feb 2024)", cite: "tiers UHL/EHL/OHL", url: "..."}
  regulator: {name: "NDPC", url: "https://ndpc.gov.ng"}
  applies_when:                   # JSONLogic / CEL expression over answers
    all:
      - {in: ["NG", "answers.user_countries"]}
      - {">": ["answers.data_subjects.NG.6m", 200]}
  exemptions: []                  # expressions that switch it off
  parameters:                     # tiered values, versioned, so fees and thresholds update without code changes
    tiers:
      - {id: OHL, min_subjects_6m: 200, fee_ngn: 10000, confidence: V}
      - {id: EHL, min_subjects_6m: 1000, fee_ngn: 100000, confidence: "?"}
      - {id: UHL, min_subjects_6m: 5000, fee_ngn: 250000, confidence: "?"}
  recurrence:                     # drives the deadline engine
    type: "annual"                # once|annual|biennial|event_driven|continuous
    due: {rule: "fixed_date", month: 3, day: 31}      # or anniversary_month / days_after_event / within_n_business_days
    lead_time_days: 45
  evidence:
    - {type: "certificate", label: "NDPC registration certificate", accepts: ["pdf", "url"], validity_months: 12}
  severity: "high"                # weighting for the score
  penalty: {summary: "Higher of NGN10m or 2% of turnover (DCPMI)", max_amount: null, criminal: false}
  depends_on: ["NG.DP.NDPA_APPLIES"]
  conflicts_or_supersedes: []     # e.g. "DE.IMPRINT.TMG_S5" superseded_by "DE.IMPRINT.DDG_S5"
  effective_from: "2024-02-14"
  effective_to: null              # supports sunset dates, e.g. US BOI ended for domestic companies 2025-03
  phase_in: []                    # e.g. AI Act: [{scope: "annex_iii", from: "2027-12-02"}]
  confidence: "V"                 # V|K|? ; "?" rules shown as "verify" not scored
  sources: ["https://..."]
  stale_citation_patterns: ["§ ?5 TMG", "TTDSG"]   # for document scanning in later phases
  questions_used: ["Q2", "Q7"]
  remediation: {template_ids: ["ndpc_registration_guide"], est_effort: "1-2 weeks"}
```

**Design notes:**
1. **Inheritance.** Use `parent` so that DE and FR inherit EU rules, and US-DE and US-CA inherit US federal rules.
2. **Versioned parameters.** Keep fees and thresholds in `parameters` with their own `confidence` tag, so the CCPA revenue threshold, ICO tiers and Companies House fees can be updated without changing rule logic.
3. **Effective dates.** Use `effective_from`, `effective_to` and `phase_in`. These handle the AI Omnibus delays, the US BOI repeal for domestic companies, and the TMG-to-DDG change.
4. **Unverified rules.** Rules tagged `confidence: "?"` should show as "verify" and not count toward the score.
5. **Supersession and stale citations.** Use `conflicts_or_supersedes` together with `stale_citation_patterns` so a Phase 2 document scan can flag outdated citations such as "§13 TMG".
6. **Separate facts from conclusions.** Keep a `derived_facts` layer between answers and rules, for example `is_ccpa_business`, `ndpc_tier`, `eu_targeting` and `ai_risk_class`. Each derived fact is its own unit-tested rule, which keeps country modules small.

---

## Not verified in this session (check before seeding)

- **Nigeria:** NDPC EHL/UHL thresholds and fees, and whether registration renews annually; GAID CAR fee amounts; the section numbers for CAC annual-return timing and late penalties; the Copyright Act 2022 section for employee works (s28 vs s10(2)); any 2025–26 changes to CBN payment capital levels; status of the National Digital Economy and E-Governance Bill.
- **Kenya:** ODPC fee amounts; whether the exemption tests are cumulative.
- **Ghana:** DPC renewal cycle and fees; VASP Act commencement; CSA enforcement date; Copyright Act section number; current ORC penalty schedule.
- **South Africa:** whether security-compromise reporting via the eServices portal is mandatory; status of the PAIA small-body exemption; the exact s33 annual-return window.
- **France:** that LCEN art 1-1 now holds the mentions légales duty after SREN; any 2025 RBE strike-off power.
- **Germany:** GwG fine ceilings; §33 DDG and §28 TDDDG fine amounts.
- **UK:** whether the DMCC subscription-contract rules have commenced; final ICO cookie guidance; when the ICO becomes the Information Commission.
- **US:** CCPA penalty amounts for 2026; the effective date of California SB 942 (delayed by AB 853); Colorado SB 26-189's exact effective date.
- **EU:** the AI Omnibus regulation number; when the CJEU will decide the DPF appeal; PSD3/PSR status; the European Accessibility Act micro-enterprise exemption; whether DSA Art 13 has any size exemption.
