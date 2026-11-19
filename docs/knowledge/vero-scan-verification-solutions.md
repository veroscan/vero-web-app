# Vero Scan — Verification Solutions Matrix

**Project:** Vero Scan (Code and Clause LTD)
**Prepared by:** Emmanuel Edet, Independent Contractor
**Date:** 4 November 2026
**Status:** Research deliverable supporting Milestone 1 (architecture and API integration map). Answers the Client's brief of 4 November 2026: the three intelligence layers (Registry, Company, Legal Gap) and the Stage 1–5 checklists. Every item the Client marked "publicly verifiable" has a route below. Items marked **[verify]** still need a live test or a written quote.
**Basis:** Four research tracks run on 4 November 2026 (Nigeria; UK and US; Germany, France, Kenya, Ghana, South Africa; Company Intelligence and URL scan). Endpoints marked **(called)** were invoked live during research and returned data.

> Technical planning, not legal advice. Rule content must be approved by a Code & Clause lawyer before it affects a score.

---

## Contents

1. Summary: what can and cannot be automated
2. The five verification tiers
3. The three intelligence layers (A, B, C)
4. Nigeria
5. United Kingdom
6. United States (Delaware, federal, California)
7. Germany
8. France
9. Kenya
10. Ghana
11. South Africa
12. Cross-border sources (EU, sanctions, identity)
13. Layer B: company intelligence stack
14. URL scan: legal pages and cookie behaviour
15. Layer C: turning the stage checklists into rule packs
16. Vendor shortlist and costs
17. Applications and contracts to start now
18. Do-not-scrape list (terms that bind us)
19. Build order for Milestone 2
20. Items not yet verified

---

## 1. Summary: what can and cannot be automated

**Fully automatic from official or licensed sources (Tier 1–3):**
- UK: everything the Client listed (status, confirmation statement and accounts overdue, officers, PSC with identity-verification fields, charges, insolvency, share allotments) from the free Companies House API; ICO fee register (daily file); FCA register (API); Gazette insolvency notices (API); sanctions lists.
- France: entity, officers, accounts filed, insolvency judgments, payment and e-money licences, trademarks, court decisions, all from free official APIs with no key or a free account.
- Nigeria: CAC registration, status, directors, shareholders, PSC and TIN through licensed CAC data partners (Mono, QoreID, Smile ID, Dojah); NDPC register (official JSON feed, 8,981 entries, called); CBN, SEC and FCCPC lists (official pages).
- US: Form D fundraising filings (SEC, called); trademarks and patents (USPTO APIs with a free key); FinCEN MSB list (weekly export, called); California data-broker registry (CSV, called); federal court parties (PACER API, paid per page).
- Kenya: company record, directors, shareholders, charges via licensed vendors; gazette strike-off and insolvency notices (Kenya Law, free).
- South Africa: company status including annual-return deregistration stages, directors, via the official CIPC developer portal (apply) or Didit / Know Your Customer today.
- Germany: entity, officers, shareholders, insolvency, accounts via licensed resellers (OpenRegister, handelsregister.ai); DPMA trademarks via DPMAconnectPlus (official, €200 one-off); EBA and ESMA licence registers (official files).

**Automatic only with a document (Tier 4):**
- Delaware good standing and franchise tax: the state bans automated access and sells status for $10–$20 per lookup. Route: Certificate of Good Standing (vendor-ordered or user-uploaded) validated against the Division's authentication-number checker, and the $20 "Tax & History" printout uploaded and parsed.
- Nigerian annual returns by year: no vendor or official API exposes filing years. Route: the ACTIVE/INACTIVE status as a proxy, plus the CAC Status Report PDF (Mono endpoint, or ordered by a CAC Accredited Agent) parsed for standing.
- Nigerian, Kenyan and Ghanaian trademarks: no online search API. Route: certificate upload with field extraction, then an agent search by Code & Clause to confirm.
- EIN and 83(b): never public. Route: IRS CP575/147C letter and 83(b) with certified-mail receipt, parsed and cross-checked (USPS tracking API, free).
- Ghana company record: the ORC portal was suspended in March 2026. Route: vendor (Youverify/Dojah) where it returns data, certificate upload with extraction, and paid ORC search (GHS 30) as a spot check.

**Attestation only (Tier 5):** most Stage 3–5 items (MSA, SLA, ESOP rules, intercompany agreements, incident response plan). These are private documents by nature. The vault and lawyer review cover them; the public scan never claims to verify them.

The product rule that follows: **every finding shows its tier.** A "verified" badge is only earned by Tier 1–3 facts or Tier 4 documents that passed an authenticity check. Nothing scraped from a site whose terms forbid it is ever used.

---

## 2. The five verification tiers

| Tier | Name | Source type | Example | Score weight |
|---|---|---|---|---|
| 1 | Official live | Government API or open-data feed | Companies House API; recherche-entreprises; NDPC JSON feed; SEC EDGAR | Full |
| 2 | Licensed vendor | Vendor that is an official data partner or licensed reseller | Mono / QoreID (CAC); Dojah (BRS Kenya); OpenRegister (Handelsregister); Didit (CIPC) | Full, with provenance shown |
| 3 | Official list import | Regulator-published list imported on a schedule and name-matched | CBN PSP page; FCCPC lenders; ICO register file; EBA PSD2 register; FinCEN MSB export | Full when match confidence is high; otherwise "probable" |
| 4 | Document-verified | User uploads an official document; we extract fields and check authenticity | Delaware Certificate of Good Standing + validator; CAC Status Report; IRS CP575; trademark certificate | Full once checked; "documented, unconfirmed" until then |
| 5 | Attested | User confirms, optionally with evidence | NDA template exists; board resolutions adopted | Partial; flagged for lawyer review on paid plans |

Match confidence (name to record) is always shown: High (80 and above), Medium (55–79), Low (below 55: the user picks from candidates).

---

## 3. The three intelligence layers

### Layer A: Registry Intelligence
Input: company name (plus country, or we infer it). Output: existence, status, filing compliance, officers, shareholders/PSC, charges, insolvency, licences, trademarks, litigation signals, sanctions.
Design: one **connector per source** behind a common interface that returns normalised **facts** with provenance (source URL, retrieval time, raw hash, tier, match confidence). Connectors never feed rules directly; rules read facts. Sections 4–12 list the connectors.

### Layer B: Company Intelligence
Input: company name or domain. Output: what it builds, sector, markets, stage, headcount band, apps, hiring, funding signals, tech and payment stack, consent-management platform, website legal pages.
Design: free-first stack (section 13) with the website as the anchor for entity resolution; LinkedIn only through the official API when the customer connects their own page; paid enrichment (People Data Labs or Coresignal) as an add-on.

### Layer C: Legal Gap Intelligence
Input: facts from A and B plus questionnaire answers. Output: the company-specific checklist (stage × incorporation country × operating countries × sector), each item with its verification tier, status (pass / gap / defect / verify / n.a.), evidence, consequence text and remediation.
Design: the Client's Stage 1–5 lists become **rule packs** (section 15). Each item carries `verifiable_by` (which connector or document) so the engine knows whether to look it up, ask for a document, or ask for an attestation.

---

## 4. Nigeria

| Client item | Tier | Primary route | Fallback | Cost | Notes |
|---|---|---|---|---|---|
| CAC registration exists, status, RC/BN, date, type | 2 | Mono `GET /v3/lookup/cac` then `/company/{id}`; QoreID `cac-premium`; Smile ID `business_verification`; Dojah `cac/basic` | Upload e-certificate or e-status report, extract, cross-check vendor | Mono ₦60–₦500 per call; Dojah from about $0.04–0.06 per call [verify] | Status ACTIVE/INACTIVE, type, registration date, address |
| CAC annual returns current / overdue | 4 | `status` ACTIVE/INACTIVE as proxy (CAC marks non-filers inactive) plus Mono `GET /v3/lookup/cac/company/{id}/status-report` (CAC-generated PDF, parsed) | **CAC Accredited Agent** (a Code & Clause lawyer registers; ₦10,000 one-off) orders a Status Report (₦5,000) or Historical "All information" report (₦20k–₦30k) on client mandate; user uploads annual-return acknowledgement | ₦5,000–₦30,000 per report | No API exposes filing by year. Say "standing: active", not "returns filed for 2025", unless a report confirms it. [verify whether the Status Report PDF lists returns filed] |
| Share allotment, directors, shareholders, PSC | 2 | Mono `/directors`, `/secretary`, `/psc`; QoreID `affiliatesPscInformation` (% held, voting rights); Smile ID `directors[]`, `beneficial_owners[]` | Official Beneficial Ownership Register (bor.cac.gov.ng) bulk BODS-JSON for authorised organisations; its search endpoint was broken on 4 Nov 2026 | Mono Lookup+ from ₦600 per call | Store names and roles only; drop phone, email, home address and DOB (NDPA minimisation; CAC restricts these even for super agents) |
| Nigerian trademark registration | 4 | None online. IPO Nigeria portal is login-only and used by accredited agents | Upload Acceptance Letter or Registration Certificate, extract TM number, class, applicant and date; a Code & Clause accredited agent runs a registry search; status becomes "registry-confirmed" | Agent search fee [verify] | Nigeria is not in the Madrid system and not in WIPO's Global Brand Database |
| NDPC registration (DCMI) | 1 | Official register at services.ndpc.gov.ng/repo/?flp=dcmi, backed by a JSON feed **(called: 8,981 rows; fields Name, Category UHL/EHL/OHL, Year)** | Licensed DPCO register (368 rows); upload NDPC certificate | Free | GAID 2025 Art 9(7) requires the NDPC to publish the register, so import is appropriate. Re-read the page daily because the feed link hash may rotate |
| NOTAP registration | 5 | No public register; NOTAP portal is login-only | Upload NOTAP Certificate of Registration plus attestation | — | Trigger only when a foreign technology agreement is declared |
| CBN licence (PSP / MMO / switch / super-agent) | 3 | cbn.gov.ng PaymentsSystem/PSPs.html **(called: 9 categories, e.g. 17 MMOs, 124 PSSPs, 61 super-agents)** | Upload licence letter | Free | Plain HTML, names only, no dates. Import weekly and fuzzy-match |
| SEC Nigeria registered operator / digital-asset provider | 3 | sec.gov.ng "Find a registered operator" **(called: 65 pages of cards with name, function, CAC number, file number, directors, account status)** | ARIP VASP list via press until SEC publishes | Free | The CAC number on the card gives an exact join key |
| FCCPC digital lender approval | 3 | fccpc.gov.ng approvals tables **(called: 525 approved, 35 conditional, 112 watch-list, 54 delisted)** | — | Free | Columns: company, app names, remark |
| TIN | 2 | Mono `POST /v3/lookup/tin`; Dojah `cac/tin`; QoreID `tin`; Youverify | Official NRS portal apps.firs.gov.ng/tinverification (form POST, no key) **(called)** | Vendor per call | Fields: FIRS TIN, JTB TIN, tax office |
| Litigation | 5 | No national API. Supreme Court portal (party search, free); Lagos State Judiciary search; NigeriaLII; judy.legal (subscription) | Attestation plus paralegal search; the score shows "partial coverage" | judy.legal Plus [verify] | Never present "no case found" as proof |
| Privacy and cookie policy (URL scan) | 1 | Scanner rules from GAID 2025: Art 7(1)(l) notices on the homepage, cookie notice must obstruct the middle, left or right of the page (a bottom bar is non-compliant); Art 19 explicit accept and reject, purpose stated, withdrawal explained; Art 11(2) DPO contact published; Art 27 plain-language information; Art 45 cross-border basis | — | Compute | Section 14 has the full checklist |

**Nigeria terms that bind us.** The CAC iCRP Terms of Use grant content only for personal use and forbid incorporation into "any information retrieval system" and transfer of portal rights. So: no scraping of icrp or search.cac.gov.ng, and no customer-credential login flows. Licensed vendors and the accredited-agent and super-agent channels are the lawful routes.

**Nigeria applications to start:** CAC Accredited Agent registration for a Code & Clause lawyer (icrp.cac.gov.ng, register accredited agent; fast, ₦10,000); written application to the CAC Registrar-General's office and NIBSS for the CAC–NIBSS Super Agent API (no public form; CAC said it targets "legal and tech-based firms"); DPCO licence or partnership with one of the 368 licensed DPCOs (fee reported at ₦1m–₦2m [verify]).

---

## 5. United Kingdom

| Client item | Tier | Primary route | Fallback | Cost | Notes |
|---|---|---|---|---|---|
| Entity status, type, incorporation date, SIC, registered office | 1 | Companies House `GET /company/{number}`: `company_status`, `company_status_detail` (e.g. active-proposal-to-strike-off), `date_of_creation`, `sic_codes[]`, `registered_office_is_in_dispute` | Monthly Free Company Data Product (bulk CSV) | Free; 600 requests per 5 minutes | Key from the Developer Hub; HTTP Basic with the key as username |
| Confirmation statement and accounts overdue | 1 | Same endpoint: `confirmation_statement.{next_due, overdue, last_made_up_to}`; `accounts.next_accounts.{due_on, overdue}`; `accounts.last_accounts.type` | — | Free | Direct "annual returns compliance" signal |
| Officers | 1 | `GET /company/{n}/officers`: active and resigned counts, `appointed_on`, `resigned_on`, `identity_verification_details` | — | Free | |
| PSC register and identity verification | 1 | `GET /company/{n}/persons-with-significant-control`: `natures_of_control[]`, `is_sanctioned`, `identity_verification_details{identity_verified_on, appointment_verification_statement_due_on, …}` | — | Free | Mandatory IDV from 18 Nov 2025 with a 12-month transition; a missing `identity_verified_on` after the deadline is a gap |
| Charges | 1 | `GET /company/{n}/charges`: `status` outstanding / satisfied, `persons_entitled[]`, floating and fixed flags | — | Free | |
| Insolvency | 1 | `GET /company/{n}/insolvency`: cases, practitioners, dates; plus the Gazette feed `all-notices/notice/data.feed?text="Company Number X"&categorycode=24` **(called)** with per-notice JSON-LD | — | Free; Gazette fair use 5 requests per 10 seconds | |
| Share allotments (funding signal) | 1 | `GET /company/{n}/filing-history?category=capital`: SH01 items ("Statement of capital following an allotment of shares") | — | Free | Group SH01s within about 90 days to infer a round |
| Monitoring | 1 | Streaming API (companies, filings, officers, PSC, charges, insolvency) with a stream key | Polling | Free | For the Scale plan |
| ICO data protection fee registration | 3 | Daily register file (ZIP/CSV, OGL) matched on normalised name plus postcode; entry pages `/ESDWebPages/Entry/{Z-ref}` | User supplies the Z-reference, single lookup | Free | The site is Cloudflare-gated; download from a normal runner. The file has no company number, so require a postcode match [verify file header] |
| UK trade marks | 4 | IPO case page `trademarks.ipo.gov.uk/ipo-tmcase/page/Results/1/{UK00…}` for a known number; owner search at low volume through a browser session; EUIPO API for UK009 comparable marks | Upload certificate, regex `UK00[0-9]{10}`, verify on the case page; Apify/TMview scrapers only as a last resort | Free | No API; paid bulk data from the IPO (price unpublished). New IPO trade-mark service not before 2027 |
| FCA authorisation | 1 | FS Register API (free key via the FS Developer portal) `Firm/{FRN}`, `/Permissions`, `/Individuals`, `/AR` | User supplies the FRN | Free | Docs and T&Cs are behind the portal login [verify limits] |
| CCJs and judgments | 3 | Find Case Law Atom feed `caselaw.nationalarchives.gov.uk/atom.xml?party=` **(called)** under a free computational-analysis licence | Registry Trust / TrustOnline (£6–£10 manual; bulk by quote); Creditsafe feed | Free, then quote | BAILII forbids automation |
| Sanctions | 3 | UK Sanctions List XML/CSV (includes business registration number), UN consolidated XML **(called)**, OFAC SDN exports **(called)**, EU FSF (free account) | OpenSanctions API (commercial licence) | Free | Daily ingest |
| Privacy and cookie policy | 1 | PECR as amended by DUAA (in force 5 Feb 2026): no non-essential cookies before consent; reject as easy as accept; no pre-ticked boxes; cookie policy link; consent cookie written | — | Compute | Section 14 |

**The UK build is the cheapest and most complete.** Start the Companies House key on day one.

---

## 6. United States (Delaware, federal, California)

| Client item | Tier | Primary route | Fallback | Cost | Notes |
|---|---|---|---|---|---|
| Delaware entity exists, file number, formation date, agent | 2 | KYB vendor: Middesk `registrations[]` (`status`, `sub_status` GOOD_STANDING / NOT_GOOD_STANDING / DISSOLVED), Enigma `domestic_registration` | Delaware free name search by hand (name, file number, date, agent only) | Vendor quote | Middesk's own docs show Delaware `status` often "unknown" |
| Delaware status active/void **and** franchise tax current/delinquent | 4 | Certificate of Good Standing: Middesk Documents product orders it from the state, or the user orders it ($50 short form); validate the authentication number at `icis.corp.delaware.gov/Ecorp/ValidateCert/authver.aspx` (official validator, valid 1 year) | User uploads the $20 "Tax & History" Online Status (status, last filings, franchise tax due) for extraction; registered-agent letter; attestation | $20–$50 per company plus vendor | **The Division "strictly prohibits mining data" and says automated tools may lead to suspension.** No vendor documents a franchise-tax field. Customer consent does not change the state's terms |
| USPTO trademark (by number) | 1 | TSDR `tsdrapi.uspto.gov/ts/cd/casestatus/sn{serial}/info.json` with `USPTO-API-KEY` (MyUSPTO account) | Marker API (1k per month free) | Free | 60 requests per minute per key |
| USPTO trademark (by owner name) | 3 | Bulk TRCFECO2 CSV plus daily XML via the Bulk Data API, indexed locally by owner | Marker API owner search | Free | No ODP trademark REST route exists (404/403 confirmed) |
| USPTO patents by assignee | 1 | ODP `GET api.uspto.gov/api/v1/patent/applications/search?q=applicationMetaData.firstApplicantName:"X"` with `X-Api-Key` **(called: route exists, 401 without key)** | ODP bulk patent-assignment dataset | Free | PatentsView and assignment-api are retired |
| Fundraising (Form D) | 1 | `browse-edgar?action=getcompany&company=X&type=D&output=atom`, then `data.sec.gov/submissions/CIK##########.json`, then `primary_doc.xml` **(called: totalOfferingAmount, totalAmountSold, dateOfFirstSale, revenueRange, jurisdictionOfInc)** | Quarterly Form D data sets | Free; 10 requests per second; declared User-Agent | Filter out SPVs and feeder funds: `isPooledInvestmentFundType=false`, `entityType=Corporation`, exact name |
| California status, Statement of Information due | 2 | Cobalt Intelligence `GET /v1/search?searchQuery=X&state=CA&liveData=true`: `status`, `nextReportDueDate`, officers; Middesk `status_details` ("FTB/SOS Suspended") | FTB Entity Status Letter page (headless, low volume); upload Certificate of Status | Vendor | bizfile Online is Imperva-blocked and undocumented |
| California data broker registration | 3 | `cppa.ca.gov/data_broker_registry/registry.csv` **(called)** | — | Free | Annual |
| FinCEN MSB registration | 3 | `POST msb.fincen.gov/retrieve.msb.list.php` body `site=AA`, tab-delimited **(called: 34,615 rows, weekly)** | — | Free | FinCEN publishes this explicitly for data-processing integration |
| State money-transmitter / DFPI / NMLS | 5 | User supplies the NMLS ID or DFPI licence number; DFPI lists once reachable | — | — | NMLS terms forbid scraping |
| Federal litigation | 1 | PACER Case Locator API `parties/find` `{"lastName":"X","exactMatches":true}` ($0.10 per page, waived at or under $30 per quarter); CourtListener v4 `search/?type=r&q=party:("X")` under a commercial agreement | Docket Alarm API | $0.10 per page; CourtListener $10–100 per month or agreement | Delaware Chancery is only on File & ServeXpress (no API) |
| EIN | 4 | Upload IRS CP575 or 147C, extract EIN `^\d{2}-\d{7}$`, name and address, cross-check the registry | SEC `ein` field (public filers only) | Free | Never public |
| 83(b) election | 4 | Upload 83(b) plus Form 15620 plus certified-mail receipt; postmark within 30 days of grant; confirm the acceptance scan via the USPS Tracking API (free OAuth) | Attestation | Free | Mail-only filing |
| Privacy and cookie policy (CCPA) | 1 | Threshold check (revenue at or above $26,625,000, or 100k consumers, or 50% of revenue from selling or sharing); "Do Not Sell or Share" and "Limit the Use of My Sensitive PI" links or "Your Privacy Choices" with the icon; §7011 policy elements; **GPC test** (replay with `Sec-GPC: 1`; trackers must not fire); ADMT pre-use notice from 1 Jan 2027 | — | Compute | Section 14 |

---

## 7. Germany

| Client item | Tier | Primary route | Fallback | Cost | Notes |
|---|---|---|---|---|---|
| Entity, status, legal form, HRB number, date | 2 | OpenRegister API (company details 10 credits; `realtime` adds 10 and pulls live from the register) or handelsregister.ai `fetch-organization` | Upload Handelsregisterauszug, extract, cross-check | OpenRegister: free 500 credits per month, then €0.01 per credit (about €0.10–0.20 per live lookup); handelsregister.ai from €69 per month | Both resell register data; ask each for its licensing basis in writing [verify] |
| Annual accounts filed / overdue | 1 | Unternehmensregister (all accounts from FY 2022 disclosed there; free search): latest FY against the 12-month §325 HGB deadline | OpenRegister `financials` / `documents`; handelsregister.ai `annual_financial_statements` | Free, or credits | No official API; no stated prohibition on automated search |
| Officers and shareholders | 2 | OpenRegister `owners` (Gesellschafterliste); handelsregister.ai `related_persons`, `shareholders` | — | Credits | |
| Beneficial owners (Transparenzregister) | 4 | The customer stores its **own** Transparenzregister credentials; OpenRegister (certified by Bundesanzeiger Verlag) orders the official extract | The customer orders and uploads its extract | 25 credits plus the official fee [verify] | Public access has been closed since the CJEU ruling of Nov 2022; Vero Scan is unlikely to qualify as an obliged entity, so use the customer-permissioned model |
| Insolvency | 2 | insolvenzbekanntmachungen.de (official) via the OpenRegister insolvency source or handelsregister.ai `insolvency_publications` | — | Credits | Unrestricted search only for 2 weeks after publication on the official portal |
| Trade marks | 1 | **DPMAconnectPlus**: REST, daily data, €200 one-off connection fee, retrieval free; paper contract to DPMA Ref. 2.1.2 (datenabgabe@dpma.de) | EUIPO API for EUTMs | €200 once | Official and cheap |
| Data-protection registration | n/a | None exists in Germany. Signals: a named DPO and privacy notice on the website; a DPO is required at 20 or more staff (§38 BDSG) | Attestation | — | |
| Payment, e-money and crypto licences | 3 | EBA PSD2 register bulk JSON `euclid.eba.europa.eu/register/pir/registerDownload`; ESMA interim MiCA CSVs (CASPS.csv and others, weekly) | BaFin company database (web) | Free | Covers all EU states |
| Court records | 5 | No entity-keyed public register | Insolvency portal plus Unternehmensregister notices; attestation | — | |
| Imprint, cookies, privacy | 1 | §5 DDG imprint fields; §25 TDDDG consent; GDPR Arts 13/14 notice in German; "TMG" or "TTDSG" citations flagged as stale | — | Compute | |

**Germany is not an "easy API" country.** The Handelsregister caps lookups at 60 per hour and its operators cite criminal law for mass queries. Germany has not yet met the EU high-value-dataset obligation to publish company data by API (no official feed found as of Nov 2026). Licensed resellers are the route.

---

## 8. France

| Client item | Tier | Primary route | Fallback | Cost | Notes |
|---|---|---|---|---|---|
| Entity, status, legal form, SIREN, date, officers, finances | 1 | `GET recherche-entreprises.api.gouv.fr/search?q=` **(called: etat_administratif, nature_juridique, date_creation, dirigeants[], finances, complements flags, date_mise_a_jour_rne)** | INSEE Sirene 3.11 (free key, 30 requests per minute); INPI RNE `GET /api/companies/{siren}` (free account) | Free | No key needed for the primary |
| Accounts filed / overdue | 1 | INPI RNE `GET /api/companies/{siren}/attachments` (annual accounts since 2017, daily); BODACC `familleavis=dpc` **(called)** | Infogreffe (per document) | Free | Confidentiality declarations still show that accounts were filed |
| Beneficial owners | 4 | Restricted to legitimate interest since 2024 | The customer downloads its own declaration from INPI and uploads it; extract and cross-check with dirigeants | Free | |
| Insolvency and judgments | 1 | BODACC open-data API `familleavis=collective` **(called: 3.37M records; fields jugement, tribunal, registre)** filtered by SIREN | Infogreffe état d'endettement (charges, about €3–4.50 per document) | Free | |
| Trade marks | 1 | INPI API Marques (data.inpi.fr account): French marks since 1976 plus EU and international marks in force | EUIPO API | Free | |
| Payment, e-money and crypto licences | 1 | REGAFI open-data API `regafi.fr/api/explore/v2.1/catalog/datasets/prd-banque-autorisations/records` **(called: 30,939 rows; situation, categorie, services_paiement_json and more)**; AMF PSAN/CASP CSV on data.gouv.fr (daily) | EBA and ESMA registers | Free | |
| Court decisions | 1 | Judilibre API (PISTE account; Cour de cassation and appeal courts) | BODACC for commercial-court judgments | Free | |
| Legal notice, cookies, privacy | 1 | LCEN mentions légales; CNIL cookie rules (refuse as easy as accept, first layer); GDPR notice in French; Loi Toubon for consumer-facing text | — | Compute | |

**France is the most complete free stack of all eight countries.** Build it second, after the UK.

---

## 9. Kenya

| Client item | Tier | Primary route | Fallback | Cost | Notes |
|---|---|---|---|---|---|
| Entity, status, registration number, date, KRA PIN | 2 | Dojah `GET /api/v1/ke/kyb/business?registration_type=pvt|bn|llp|bo&registration_number=`: status, registration_date, kra_pin, partners[], shares[], encumbrances[]; QoreID `POST /v1/ke/identities/brs`; Smile ID `BUSINESS_REGISTRATION` (needs postal code and address) | Official CR12 on eCitizen (KES 650, instant for verified companies); upload CR12 and extract | Vendor per call (KYB lookups typically $0.65–2) [verify]; KES 650 official | BRS v2 launched early 2026; no public API; the BRS privacy notice allows data-sharing MOUs, so apply |
| Annual returns | 3 | Kenya Gazette strike-off notices (Companies Act s.894, issued for non-filing) via new.kenyalaw.org/gazettes (free, full text) | The customer's eCitizen dashboard (permissioned) or upload of the annual-return receipt | Free | Vendor CR12 does not carry annual-return status |
| Directors, shareholders | 2 | CR12 via vendors (ID numbers masked) | — | — | The beneficial-ownership register is not public |
| Charges, insolvency | 2 | Dojah `encumbrances[]`; Kenya Gazette insolvency notices | Gazettes.Africa | Free | |
| Trade marks | 4 | KIPI online platform launched 24 Nov 2025 for filing; public search still via KIPI or an agent | Upload certificate; Strathmore CIPIT free database (older marks) | KIPI search fee | [verify whether the new platform has public search] |
| ODPC registration | 3 | ODPC "Registered Data Handlers" register (name, registration number, controller or processor, status); the site is behind bot protection, so import by scheduled manual export or by an ODPC data request | Upload the ODPC certificate; certificate-number check | Free | [verify access terms] |
| CBK PSP / digital credit provider licence | 3 | CBK lists (PSPs; Digital Credit Providers directory, about 280 by Sep 2026) imported periodically | — | Free | The CBK site blocked automated fetch during research; import from a normal runner |
| Tax compliance | 2 | KRA GavaConnect (developer.go.ke; PIN checker; sandbox sbx.kra.go.ke) | Upload the Tax Compliance Certificate | Free | Official government API platform |
| Court records | 3 | new.kenyalaw.org judgments (306k, free, party-name search) | Attestation | Free | No documented API; respect the site |

**Kenya applications to start:** write to BRS for a data-sharing MOU; KRA GavaConnect developer account; ODPC export request.

---

## 10. Ghana

| Client item | Tier | Primary route | Fallback | Cost | Notes |
|---|---|---|---|---|---|
| Entity, status, directors, TIN | 2/4 | Youverify Ghana KYB (ORC registry; inputs registration number and name) [verify fields]; Dojah "Ghana Business Lookup" [verify fields] | **Upload the certificate of incorporation or ORC search report, extract, GRA TIN check (Dojah `ghana/lookup-tin`)**; paid ORC search (GHS 30 general, GHS 150 with charges and insolvency) as a spot check | Vendor per call; GHS 30–150 | The ORC online portal was **suspended in March 2026** after a security audit; restoration "in progress". Plan for Tier 4 as the default until it is back |
| Annual returns | 4 | ORC paid file search (manual, 1–3 days) | Upload the annual-return receipt; attestation | GHS 30 | |
| Beneficial ownership | 4 | Filing is mandatory (fines from 12 Jan 2026); the public BO search page returns 404 | Upload the BO filing acknowledgement | — | |
| Trade marks | 4 | ORC trademark search (online or in person; no API) | Upload certificate; WIPO GBD for Madrid designations (Ghana is a Madrid member) [verify coverage] | About US$135 agent name search | |
| Data Protection Commission registration | 1 | **app.dpc.gov.gh/check-register**: public search by organisation name or reference; certificate verification by DPC reference; "browse the full register" | Request a bulk export (info@dpc.gov.gh); upload certificate | Free | 2,575 controllers registered in 2026; 2-year renewal |
| Bank of Ghana PSP / EMI licence | 3 | BoG "List of approved EMIs and PSPs" plus the Payment Systems Oversight Annual Report (Aug 2026) | Manual quarterly import | Free | The list page's file path is dated 2021 [verify current list] |
| Cyber Security Authority licence | 3 | CSA licensed CSP/CE/CP lists | — | Free | |
| Court records | 5 | GhaLII judgments (no API) | Attestation | Free | |

Ghana is the weakest of the eight for automation. The honest product position: Tier 2 where a vendor returns data, Tier 4 otherwise, with the DPC register as the one strong Tier 1 signal.

---

## 11. South Africa

| Client item | Tier | Primary route | Fallback | Cost | Notes |
|---|---|---|---|---|---|
| Entity, status (including annual-return deregistration stages), type, date, directors | 1/2 | **Official CIPC developer portal** (developer.cipc.co.za): OAuth 2.0; Companies product `POST /enterprise/v1/companyprofile {enterprise_number}` with `Ocp-Apim-Subscription-Key`; BO product; sandbox on apim.cipc.co.za | Didit `POST verification.didit.me/v3/database-validation/` `services=zaf_company_registry` (**US$0.75 per successful query**, live CIPC); Know Your Customer (live CIPC; free sandbox); pbVerify; upload CoR14.3 | CIPC pricing not published [verify]; Didit $0.75 | Status values include "AR Deregistration Process", "Final AR Deregistration" and "In Liquidation", a direct annual-return compliance signal |
| Beneficial owners | 2/4 | CIPC BO API (subscribe; access policy not public) | Upload the CoR46 BO filing | — | Shareholders are not published by CIPC |
| Charges, insolvency | 3 | CIPC status (liquidation, business rescue); Government Gazette liquidation notices | Credit bureau (XDS, TransUnion, Experian; contract) | — | |
| Trade marks | 4 | CIPC IP Online (login; comprehensive searches are fee-based); the CIPC IPS API is "coming soon" | Upload certificate | Fee per search | |
| Information Regulator registration | 3 | No public register of Information Officers found. **Public signal: the PAIA manual must be on the company website (PAIA s.51)**, so crawl for the PAIA manual and the Information Officer contact | Upload the IR registration confirmation | Free | |
| FSCA FSP licence (including crypto-asset providers) | 3 | FSCA FSP search (by FSP number or name; status, categories) | Periodic scripted import | Free | No export or API; low-volume lookups |
| SARB / PASA | 3 | SARB registered-banks page; PASA members page | — | Free | |
| Tax compliance | 4 | SARS Tax Compliance Status PIN (the customer gives the PIN; verify on SARS eFiling) [verify] | Upload | Free | |
| Court records | 5 | SAFLII's terms allow blocking of automated agents, so no automation | Attestation | — | |

**South Africa application to start:** CIPC developer portal sign-in and subscription request for the Companies and BO products (longest lead time; bridge with Didit). BizPortal and eServices terms contain a "spiders and crawlers" clause, so never scrape them.

---

## 12. Cross-border sources

| Source | What it gives | Access | Cost |
|---|---|---|---|
| EBA PSD2 register | All EU/EEA payment and e-money institutions, passports | Bulk JSON download, updated by national authorities | Free |
| ESMA interim MiCA register | Crypto-asset service providers, ART and EMT issuers (CASPS.csv and others) | Weekly CSV | Free |
| VIES | EU VAT number validity (name and address where the state supplies them) | REST and SOAP, no key | Free |
| GLEIF LEI API | Legal name, address, status, parent and child links; wildcard name filter **(called)** | REST, no key | Free (CC0) |
| UK Sanctions List, UN consolidated list, OFAC SDN, EU FSF | Sanctions screening; the UK list includes business registration numbers | Daily files **(UN and OFAC called)** | Free |
| EUIPO API | EU trade marks | OAuth2; sandbox, then production approval | Free [verify quota] |
| Wikidata, Google Knowledge Graph | Company facts and identifiers (LEI, Companies House number, Crunchbase, LinkedIn vanity) | Free **(Wikidata called)** | Free |

---

## 13. Layer B: company intelligence stack

**Tier 0, free, always on (called live during research unless noted):**

| Step | Source | Signal | Access |
|---|---|---|---|
| Discovery | Brave Search API (`"{name}"`, `"{name} careers"`, `"{name} linkedin"`) | Candidate domains, and the LinkedIn company URL from the company's own site footer | $5 per 1,000 queries; $5 free monthly credit |
| Identity | Wikidata (search and entity data), Google Knowledge Graph (100k calls per day free), GLEIF, registries (sections 4–11) | Legal entity, inception, HQ, identifiers | Free |
| Domain | RDAP (registration date, registrar), DNS MX/TXT (email provider; SaaS verification records reveal the CMP, support and marketing tools), TLS SANs | Age, stack, consent-management platform | Free |
| Website | Playwright plus Crawlee crawl of the homepage, /about, /pricing, /customers and /careers; readability extraction; LLM classification | What it builds, sector, markets, B2B or B2C, AI product, payments, health data, marketplace, revenue signals (pricing page, checkout scripts) | Compute plus LLM (about $0.05–0.20 per scan) |
| Apps | Apple iTunes Search and Lookup (`entity=software`; seller, category, release date, ratings, sellerUrl); Google Play details page only (robots.txt allows `/store/apps/details` and forbids `/store/apps/datasafety*`) | App presence, age, maturity | Free |
| Jobs | Public ATS feeds keyed by the careers-page slug: Greenhouse `boards-api.greenhouse.io/v1/boards/{slug}/jobs|departments|offices`, Lever `api.lever.co/v0/postings/{slug}`, Ashby, Workable, SmartRecruiters, Recruitee | Open roles, departments, offices, remote policy, which feed stage and headcount | Free |
| Funding | SEC Form D (US); Companies House SH01 filings (UK); CAC share allotments (NG); GDELT press API (free, 1 request per 5 seconds) with "raises" and "Series A" patterns | Raising or raised | Free |
| Code | GitHub org (created date, public repos) | Technical footprint | Free |
| LinkedIn (own customers only) | Official Community Management API, 3-legged OAuth by the customer's page admin: staffCountRange, industries, foundedOn, specialties, description | Headcount band, industry | Free |

**Tier 1 paid add-ons:** People Data Labs Company Enrichment (headcount, LinkedIn ID, inferred revenue, funding stage; about $100–300 per month at 1k matches [verify]) or Coresignal ($49–499 per month); Diffbot Knowledge Graph (free 10k credits per month, about 400 organisations, then $299 per month); BuiltWith (about $295 per month) or an in-house 30-pattern fingerprint set; SerpAPI ($25 per month) for Google Jobs; the "Africa: The Big Deal" dataset ($219–1,500 per year) as a lookup table for African funding.

**Avoid:** Crunchbase, Dealroom, PitchBook and Tracxn (five-figure annual licences with redistribution limits); Proxycurl (shut down in July 2025 after LinkedIn's lawsuit); any LinkedIn scraping (User Agreement 8.2); Bing Search API (retired August 2025).

**Monthly cost at 1,000 scans:** Tier 0 about $120–250; Tier 0 plus Tier 1 about $600–1,200.

**Entity resolution (domain-anchored):** normalise the name (strip Ltd, Inc, GmbH, Technologies and similar); collect candidate domains from search, Wikidata, the Knowledge Graph, App Store sellerUrl, GitHub, ATS feeds and registry fields; score agreement between independent sources (domain agreed by two sources +40, name similarity +25, registry legal name matching the site +20, LinkedIn footer link +10, country and founding-year consistency ±5); High at 80 or above, Medium 55–79, Low below 55 (ask the user to pick from three candidates). Persist domain plus registry numbers, LEI, Wikidata ID, LinkedIn vanity and app bundle IDs.

**Stage inference:** points per stage from registry age and filings (no accounts yet suggests S1; an SH01 or Form D in the last 12 months suggests S3/S4), Form D amount sold against amount offered, press ("raises" within 9 months suggests S3/S4), revenue signals (pricing page, checkout scripts, app ratings), headcount band (1–10 S1/S2; 11–50 S2/S3; 51 or more S4) and open roles (5 or more across departments suggests S4). Show the top two stages with evidence and dates; the user can override.

---

## 14. URL scan: legal pages and cookie behaviour

Run with Playwright in a fresh profile, two passes (no interaction; after "reject all"), plus a GPC pass for the US. Permissive tooling only: Playwright and Crawlee (Apache-2.0), cheerio (MIT), Consent-O-Matic rules (MIT), DuckDuckGo autoconsent (MPL-2.0), gpc-web-crawler (MIT). **Do not embed** the EDPS Website Evidence Collector (EUPL-1.2 has a network copyleft clause), Blacklight or OpenWPM (GPL-3), or DuckDuckGo Tracker Radar (non-commercial licence).

**A. Discovery (all countries):** privacy policy (`<link rel="privacy-policy">`, footer anchors, `/privacy`, `/privacy-policy`, `/legal/privacy`, sitemap); cookie policy; terms; accessibility statement (WCAG version, conformance level, contact, date); reachability (HTTP 200, not a soft 404, more than 300 words, "last updated" parsed); the controller name in the policy equals the registry legal name; contact and DPO present.

**B. Consent behaviour:** inventory cookies, storage and third-party requests before any interaction; detect the CMP (`__tcfapi`, `__uspapi`, `__gpp`; OneTrust, Cookiebot, Usercentrics, Didomi, TrustArc, CookieYes, Termly, Iubenda, Osano, Axeptio, Klaro and Complianz fingerprints); banner visible on first paint with reject at the same layer as accept, no pre-ticked boxes, purposes listed, policy link; non-essential trackers set before consent is a fail; after reject, any new non-essential tracker is a fail; consent persisted and withdrawable.

**C. Jurisdiction adequacy (LLM extraction into a fixed schema, then deterministic presence checks):**
- EU and UK GDPR Arts 13/14: controller identity and contact; DPO; purposes with a lawful basis per purpose; legitimate interests; recipients; international transfers and safeguards; retention; the full rights list; withdrawal of consent; complaint to the supervisory authority (named); automated decision-making; representative if not established.
- Nigeria NDPA s.27 and GAID 2025: controller identity; lawful basis and purposes; recipients; Part VI rights; retention; complaint route to the NDPC; automated decisions and the right to object; notices on the homepage; cookie banner obstructing the middle, left or right (not a bottom bar) with accept and reject; DPO contact for controllers of major importance; cross-border transfer basis.
- Germany: §5 DDG imprint (name, address, email, register number, VAT ID, managing directors); §25 TDDDG consent; German-language notice; stale "TMG" and "TTDSG" citations flagged.
- France: mentions légales (publisher, director of publication, host); CNIL first-layer refuse button; French-language consumer text.
- California CCPA: threshold test; "Do Not Sell or Share" and "Limit the Use of My Sensitive Personal Information" links, or "Your Privacy Choices" with the icon; §7011 elements (categories collected, sold and shared; sources; purposes; rights; two request methods including a toll-free number where required; retention; date within 12 months); GPC honoured; ADMT pre-use notice from 1 Jan 2027.
- Apps: App Store privacy labels (embedded JSON on the app page) consistent with the policy; the Play "privacy policy" link resolves.

Scoring: each check is pass, fail or n.a. with evidence (selector, snippet, screenshot); the adequacy score per jurisdiction is a weighted pass ratio; critical failures (no policy, trackers before consent, no reject option, no "Do Not Sell" link where selling) cap the score.

---

## 15. Layer C: turning the stage checklists into rule packs

The Client's Stage 1–5 lists map directly onto the rules engine. Each checklist item becomes a rule with these extra fields:

```yaml
rule:
  id: "NG.S2.CORP.CAC_ANNUAL_RETURNS"
  stage_min: 2                      # applies from Stage 2 onward
  layer: 1                          # Corporate Foundation
  jurisdiction: "NG"                # or "ALL", or sector packs such as "SECTOR.FINTECH"
  verifiable_by:                    # how the engine resolves it
    - {tier: 4, connector: "ng.cac.status_report", fact: "cac.standing"}
    - {tier: 2, connector: "ng.cac.vendor", fact: "cac.status"}   # proxy
    - {tier: 5, attestation: "annual_returns_filed", evidence: "upload"}
  outcome_map:
    pass: "cac.status == ACTIVE and cac.standing.current == true"
    gap: "cac.status == INACTIVE"
    verify: "cac.status == ACTIVE and cac.standing == null"   # proxy only
  client_marker: "verifiable"       # as in the Client's checklist
```

**Counts from the Client's lists (for scoping):**

| Stage | Jurisdiction or pack | Items | Publicly verifiable (Client's count) | Our tier mix |
|---|---|---|---|---|
| 1 Pre-incorporation | All | 5 | 1 | Tier 1/2 registry "not found" plus 4 attestations |
| 2 Incorporated, pre-revenue | Nigeria | 24 | 7 | 5 at Tier 1–2 (registration, directors, NDPC, privacy, cookie); 2 at Tier 4 (annual returns, trademark) |
| 2 | Delaware | 26 | 8 | 4 at Tier 1–3 (USPTO trademark, USPTO patent, privacy, cookie); 2 at Tier 2/4 (entity status, good standing); 1 at Tier 4 (franchise tax); 1 inferred (entity exists) |
| 3 Revenue, pre-raise | All plus sector packs | +12, plus 3–4 per sector | 2–3 (sector licence lists; trademarks in operating markets; accessibility statement via the URL scan) | Mostly Tier 5 with document upload |
| 4 Raising | All | +12 fundraising, +3 IP clean-up | 1–2 (Form D or SH01 as evidence of a round; open-source audit via repository scan if the customer connects GitHub) | Tier 4/5 |
| 5 Post-raise, scaling | All | +8 people, +6 operations, +5 AI governance | 0–1 (EU AI Act conformity, if published) | Tier 5 |

The UK, Germany, France, Kenya, Ghana and South Africa need Stage 2 lists in the same format as the Nigeria and Delaware ones. Section 11.4 of the Milestone 1 plan already lists the obligations per country; the Client's lawyer should confirm the Stage 2 item lists for those six countries so they can be encoded.

---

## 16. Vendor shortlist and costs

| Country | Primary vendor | Second source | Indicative cost | Sandbox |
|---|---|---|---|---|
| Nigeria | Mono (CAC lookup, directors, PSC, status-report PDF, TIN) | QoreID cac-premium; Smile ID; Dojah | ₦60–₦600 per call | Mono test keys; Dojah sandbox RC 1261103; QoreID portal |
| Kenya | Dojah KE KYB | QoreID BRS; Smile ID | Per call [verify] | Dojah; QoreID |
| Ghana | Youverify Ghana KYB [verify fields] | Dojah Ghana lookup plus TIN | Per call [verify] | [verify] |
| South Africa | CIPC developer portal (official) | Didit ($0.75 per success); Know Your Customer | [verify CIPC pricing] | apim.cipc.co.za; Didit; KYC free sandbox |
| Germany | OpenRegister | handelsregister.ai | €0.10–0.30 per lookup; plans €69–499 per month | Both |
| France | Official APIs only | — | Free | — |
| UK | Official APIs only | Creditsafe (CCJs) later | Free | — |
| US | Middesk (existence, CA and DE registrations, Documents for good standing) | Enigma; Cobalt Intelligence (CA live status) | Quote [verify] | Middesk and Cobalt sandboxes |
| Layer B | People Data Labs | Coresignal; Diffbot | $100–500 per month | Free tiers |

Run the same 20 test companies per country through each candidate vendor and score field completeness, latency and price before choosing.

---

## 17. Applications and contracts to start now

| # | Action | Owner | Lead time | Why |
|---|---|---|---|---|
| 1 | Companies House API key and stream key | Developer | Same day | UK Layer A |
| 2 | USPTO MyUSPTO account and API keys (ODP, TSDR, Bulk Data) | Developer | Days | US trademarks and patents |
| 3 | INSEE, INPI (RNE and Marques) and PISTE (Judilibre) accounts | Developer | Days | France |
| 4 | **CIPC developer portal** sign-in; request Companies and BO subscriptions | Client (legal entity) plus Developer | Weeks [verify] | South Africa official route |
| 5 | **CAC Accredited Agent** registration for a Code & Clause lawyer | Client | About 1 week; ₦10,000 | Only near-term route to CAC filing history and status reports |
| 6 | **CAC–NIBSS Super Agent** application letter to the CAC Registrar-General's office and NIBSS | Client | Unknown; vetting | Official CAC data channel |
| 7 | **DPCO licence** (NDPC window) or partnership with a listed DPCO | Client | Window-dependent; ₦1m–₦2m reported [verify] | Audit-return filings for customers; register access |
| 8 | DPMAconnectPlus standard contract (paper, €200) | Client | Weeks | German trademarks |
| 9 | OpenRegister and/or handelsregister.ai account; written confirmation of their licensing basis | Developer | Days | Germany |
| 10 | Vendor sandboxes and quotes: Mono, QoreID, Smile ID, Dojah, Youverify, Didit, Know Your Customer, Middesk, Cobalt | Developer | 1–2 weeks | Africa and US |
| 11 | BRS Kenya data-sharing MOU request; KRA GavaConnect account; ODPC and Ghana DPC export requests | Client plus Developer | Weeks | Kenya and Ghana |
| 12 | FCA FS Developer account | Developer | Days | UK fintech |
| 13 | Find Case Law computational-analysis licence (free) | Developer | Days | UK judgments |
| 14 | PACER account; CourtListener commercial agreement | Client | Days to weeks | US litigation |
| 15 | LinkedIn developer application (Community Management API) | Client | Weeks | "Connect your LinkedIn Page" for customers |
| 16 | Brave Search API key; Google Knowledge Graph key; GitHub token | Developer | Same day | Layer B |

---

## 18. Do-not-scrape list (terms that bind us)

| Site | Term | Consequence for Vero Scan |
|---|---|---|
| CAC iCRP / search.cac.gov.ng | Content for personal use only; no retrieval systems; rights not transferable | No scraping; no customer-credential logins; vendors and agents only |
| Delaware Division of Corporations | "Strictly prohibits mining data"; automated tools may lead to suspension | Certificates and uploads only; no live pulls, even with customer consent |
| Handelsregister (DE) | Maximum 60 lookups per hour; mass queries may breach §§303a/b StGB | Licensed resellers only |
| CIPC BizPortal / eServices (ZA) | "Spiders and crawlers" clause | Official API or vendors only |
| NMLS Consumer Access (US) | No scraping programs | User-supplied NMLS ID only |
| WIPO Global Brand Database | No automated queries or bulk download | Not used |
| LinkedIn | User Agreement 8.2: no scraping or bots | Official API with the customer's own authorisation only |
| Google Play | robots.txt disallows `/store/apps/datasafety*` | Details page only |
| BAILII (UK), SAFLII (ZA) | No robots or bulk download | Not used |
| Kenya eCitizen | Automated bulk access not permitted (per guides; terms not read) [verify] | Vendors and MOU |
| TMview | No documented API; vendors scrape it | Not used |

---

## 19. Build order for Milestone 2

| Sprint | Connectors and features |
|---|---|
| S1 | Connector framework (facts, provenance, tiers, match confidence); UK Companies House (profile, officers, PSC, charges, insolvency, SH01); Gazette; sanctions ingest; SEC Form D; GLEIF; VIES |
| S2 | France (recherche-entreprises, RNE, BODACC, REGAFI, AMF, INPI marques); Layer B Tier 0 (discovery, domain, website crawl, LLM classification, apps, ATS feeds); entity resolution |
| S3 | Nigeria (Mono primary plus a second vendor; NDPC feed; CBN, SEC and FCCPC imports; status-report PDF parsing; certificate upload pipeline); URL scan (discovery, consent behaviour, GAID, GDPR and CCPA adequacy) |
| S4 | US (Middesk, Delaware certificate validator, USPTO TSDR and ODP plus the bulk owner index, FinCEN, CPPA, PACER); Kenya (Dojah or QoreID, Kenya Law gazette, GavaConnect); South Africa (CIPC API or Didit bridge, FSCA, PAIA-manual crawl) |
| S5 | Germany (OpenRegister, Unternehmensregister check, DPMAconnectPlus, EBA and ESMA); Ghana (vendor plus upload pipeline plus DPC register); document-verification pipeline for EIN, 83(b), good standing and trademark certificates; stage inference; Layer C rule packs for all eight countries |

---

## 20. Items not yet verified

- Nigeria: whether the Mono Status Report PDF lists annual returns by year; Dojah per-call price; CAC super-agent application procedure and fees; DPCO licence fee (₦1m vs ₦2m); IPO Nigeria search terms; CAC e-certificate QR verification.
- UK: ICO register file header and direct URL; FCA API documentation, headers and rate limits (login-walled); Companies House streaming paths; IPO bulk trade-mark data price.
- US: Middesk, Enigma and Cobalt pricing and Delaware field coverage; USPTO ODP rate limits and exact field names; CourtListener commercial pricing; SEC full-text search access from production egress.
- Germany: OpenRegister and handelsregister.ai licensing basis for reselling register data; Transparenzregister extract fee; insolvency portal automated-use terms.
- France: INSEE 3.11 base path on the new portal; INPI RNE daily quota; Infogreffe API pricing.
- Kenya: vendor prices; ODPC register access terms; KIPI public search on the new platform; BRS MOU process.
- Ghana: Youverify and Dojah Ghana response fields; ORC portal restoration date; ORC "Verify Document" mechanics; current BoG list.
- South Africa: CIPC API pricing, access process and annual-return fields; BO API policy; IP Online terms; FSCA export.
- Layer B: People Data Labs per-record price; Apple terms for reading App Store pages; Teamtailor feed path; Diffbot funding fields.
