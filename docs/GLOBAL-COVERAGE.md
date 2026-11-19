# Global coverage: any country, with honest levels

Decided 16 Nov 2026 by the owner: "don't limit it anymore. Just go with everything." Delaware, the UK and Nigeria stop being the only countries. A company can be in any country, and the scan says plainly how much it can check there.

## Coverage levels

Every country gets one of three levels. The level is data (`packages/shared/src/countries.ts`), shown to the user beside the score, and never hidden.

| Level | What a scan checks | Countries today |
|---|---|---|
| **full** | The country's own rule pack, its official company registry and its other official sources | US-DE, GB, NG |
| **registry** | The international rules, plus the country's official company registry, plus a draft country pack where one exists | FR, and each country whose registry source is built |
| **international** | The international rules only: sanctions lists, GLEIF (LEI), EU VAT where it applies, the website scan, and the uploaded documents | Every other country |

A country never moves up a level because of a draft. Rule content stays draft until a lawyer approves it, exactly as today, and the score says "Based on N of M checks" as before.

## Contract every builder keeps (set 16 Nov 2026)

- **Country codes.** ISO 3166-1 alpha-2 (`FR`, `NO`), or a subdivision such as `US-DE`. `CompanyRefSchema.jurisdiction` accepts any code matching `JURISDICTION_CODE` (`packages/connectors/src/types.ts`).
- **Global sources.** A connector whose `jurisdictions` holds `'*'` (`ANY_JURISDICTION`) is asked for every company.
- **Identifiers.** `CompanyRef.registry_number` is the national company number for countries without a field of their own (Norway organisasjonsnummer, Finland Y-tunnus, Czech IČO, Poland KRS, Denmark CVR, Australia ACN, New Zealand NZBN, Singapore UEN, Canada corporation number). `CompanyRef.lei` is the Legal Entity Identifier. The existing fields (`company_number`, `rc_number`, `file_number`, `siren`, `vat_number`) keep their meaning.
- **Fact prefixes.** A country's registry facts are `registry.<cc>.<source>.*` (lower-case country code), global ones `registry.global.<source>.*`, sanctions stay `sanctions.*`.
- **Same discipline as France** (`docs/FRANCE.md`). A miss is "not found in this register", never "doesn't exist". No person's name, birth date, address or nationality is kept: directors become counts and role titles. Sole traders and other person-like records are never kept. Fictional fixtures use numbers checked to be unused. A source needing a key or a contact string stays off (`requiredEnv`) until it is set.
- **Real calls.** Keyless official APIs may be asked a handful of times during building to confirm the real reply, only about a large, well-known public company, recorded with the record harness (redacted), within the published rate limits, with a plain User-Agent naming Vero and no personal details. No bulk file downloads without the owner's go-ahead.

## Where each piece lives

| Piece | Files |
|---|---|
| The country list and levels | `packages/shared/src/countries.ts` |
| International rule pack (draft) | `packages/rules/src/packs/intl.ts` |
| Country rule packs (draft) | `packages/rules/src/packs/<cc>.ts` |
| Country registry sources | `packages/connectors/src/sources/<cc>-*.ts` |
| Global sources | `packages/connectors/src/sources/global-*.ts` |
| Database | migration `0020_any_country.sql` |

## Status

Filled in as each part lands. See `docs/ENGINE-STATUS.md` for what has been checked against real data.

### France: VAT number as a candidate for VIES (17 Nov 2026)

- A French company that gave no VAT number has one worked out from its SIREN (official formula, checked against two published pairs) and put to VIES as a candidate. A VIES "not valid" stays "not valid for this derived number". The directory's own listed number is kept as "listed", never "registered". Details in `docs/ENGINE-STATUS.md`, `eu.vies_vat`.
- Regulator-naming and legal-notice rules outside the EU packs: not added, because no map (GB, NG, US-DE, CH, SG, AU, NZ, CA) confirms the duty. Each map says so at its end.

### Engine and API: any country (built 16 Nov 2026)

- **Country list.** `packages/shared/src/countries.ts`: all 249 ISO 3166-1 alpha-2 countries plus the 50 US states and DC (`US-XX`), 300 codes. `countryCodeSchema` (and `countrySchema` in `product.ts`) accepts any of them and refuses anything else with "We don't recognise that country code." The level of each country is one map, `COVERAGE_LEVELS`: today `US-DE`, `GB`, `NG` are `full`, `FR` is `registry`, every other code is `international`. **To raise a country, add one line there.** `MVP_COUNTRIES`, `MvpCountry` and `COUNTRY_LABELS` are kept, marked deprecated.
- **Coverage shown.** Company, overview, records and public report responses carry `countryCoverage: { level, sentence }`, built by `countryCoverage(code)`. It is named `countryCoverage` because `coverage` already means "Based on N of M checks" in those shapes. It says what a scan *can* check, never that a check happened, for example "We can check international rules and sanctions for companies in Tanzania, but not yet Tanzania's own company register or laws."
- **Database.** `0020_any_country.sql` adds every code (and `INTL`, the International pack) to `jurisdiction`, drops the three-country CHECKs on `company`, `company_market` and `lookup_request`, keeps the foreign keys and adds one to `lookup_request`, and makes `incorporation_state` the state of any US company (`CA` for `US-CA`; `DE` as before). RLS is unchanged. Tested on a database holding data from before 0020 (`apps/api/test/any-country.test.ts`).
- **Rules.** `packages/rules/src/packs/intl.ts`, the International pack (draft, 26 rules, 23 document slots): sanctions screening, privacy notice and terms on the website, IP assignments, constitution, owners' agreement, board decisions, cap table, shareholder and investment documents, customer, supplier, staff and contractor contracts, security and breach plans, AI use. Each is taken from a rule already in the Delaware, UK or Nigeria pack and cites that map line; none cites a statute or names a regulator, none is "Urgent", and where something is law only in some places it says "many countries" at a lower severity. `INTL_EQUIVALENTS` names the country rules each one stands for.
- **Which packs a company gets** (`packsFor`, `selectPacks`): `US-DE`, `GB`, `NG` exactly as before, and never the International pack (their packs already hold its checks, so scores there don't move). Any other US state, or `US`: the federal pack plus the International pack. Any other country: the International pack, plus the country's own pack once one exists. **Adding a country pack is one line in `RAW` in `packages/rules/src/packs/index.ts`**; it then applies at home (with the International pack) and as a market overlay. The International pack is evaluated last: a rule gives way when a country rule in the selection asks for the same thing, so nobody is asked twice. Scoring config is untouched.
- **Questionnaire.** The country question takes any code from the company record. Questions that aren't about one country show for everyone; country questions show only where a pack exists (US federal ones now for every US state). New optional LEI question (`lei`, 20 characters). The VAT question is now "What is the company's VAT number?" and shows for the UK and the 27 EU members, accepting a UK or an EU format.
- **Pipeline routing.** A source runs for a company when its `jurisdictions` holds the country, `'*'`, or the country a subdivision belongs to (`US` covers `US-CA`): `coversCountry` in `apps/api/src/modules/scans/facts.ts`. The company's own number goes to every source covering its country, in `company_number` (GB), `rc_number` (NG), `file_number` (US-DE), `siren` (FR) or `registry_number` (everywhere else); the LEI answer to global sources; the VAT number to tax registers (capability `tax_registration`). Answer numbers now reach first-stage sources too. `sanctions.lists` and `web.policy_scan` are `'*'`.
- **Register search.** `/v1/registry/search` uses the country's own entity-lookup source only (never a global one). With none, it answers `outcome: 'not_available'`: "We can't search the company register in Tanzania yet. Enter the company's details yourself. We'll still check international rules and sanctions."
- **Fact keys.** `REGISTRY_FACT_KEYS` (`packages/rules/src/facts.ts`) was copied from `CONNECTOR_FACT_KEYS` on 16 Nov 2026. `packages/rules/test/connector-contract.test.ts` now checks that every key in the mirror, and every `registry.`/`web.` key any rule reads, is published by a connector. A new source's keys no longer have to be copied by hand; copy the list again when a rule starts reading them.
- **A source's null fact** ("we can't tell") is stored as no fact, which the rules read as unknown (the `fact.value` column refuses SQL null, so a null crashed the scan).
- **Not done here.** The web app's country pickers (onboarding, review desk) still offer only US-DE, GB and NG: **the product screens need the wider picker**, built on `COUNTRIES` and showing `countryCoverage`. The web only got what it needed to compile (`countryLong` in `apps/web/src/lib/records.ts`). France has no rule pack, so it is `registry` level with the International rules only.

### Global sources (built 16 Nov 2026, all off until set)

| Source | Countries | Setting | Checked against a real reply |
|---|---|---|---|
| `global.gleif` (LEI records) | Every country (`'*'`) | `PUBLIC_API_USER_AGENT` | Yes, 16 Nov 2026: one LEI lookup recorded and replayed (Siemens AG); one name search tried, not recorded |
| `eu.vies_vat` (EU VAT check) | The 27 EU member states, plus Northern Ireland as `GB-NIR` (VIES code `XI`). Not `GB`: HMRC covers it | `PUBLIC_API_USER_AGENT`, and the company's `vat_number` | Yes, 16 Nov 2026: one check recorded and replayed (Siemens AG) |
| `global.opencorporates` (fallback register) | Every country with no register source of its own | `OPENCORPORATES_API_TOKEN` (paid) | No: no key yet |

- **How a country with no registry source is covered.** GLEIF and, inside the EU, VIES run for every company. OpenCorporates fills the gap where we have no official register: it skips a country only while that country's own entity-lookup source is switched on (its key or contact setting is set). `createConnectors` works that list out each time from the sources it builds (`Connector.configured`), so a Danish company with no CVR login set still gets OpenCorporates instead of no register check, and setting the login switches OpenCorporates off for Denmark with no further change (changed 16 Nov 2026). This is decided in the connector, not left to the pipeline (`packages/connectors/src/sources/global-opencorporates.ts`).
- **`connectorsFor`** now returns connectors whose `jurisdictions` holds `'*'` too. The API picks them too: `coversCountry` in `apps/api/src/modules/scans/facts.ts` accepts `'*'`.
- **Facts:** `registry.global.gleif.*`, `registry.eu.vies_vat.*`, `registry.global.opencorporates.*`, listed in `packages/connectors/src/fact-keys.ts`. No rule reads them yet. The rules package's mirror list (`REGISTRY_FACT_KEYS` in `packages/rules/src/facts.ts`) must get the same keys, or `packages/rules/test/connector-contract.test.ts` fails.
- **Privacy:** no addresses, no people. GLEIF sole traders (category `SOLE_PROPRIETOR`) and OpenCorporates records whose company type says sole trader are never kept or offered as candidates. VIES names and addresses are never stored; the name is compared only when it carries a legal-form word. Officers are a count and role titles. Recordings follow rules 7 to 9 in `packages/connectors/src/record.ts`.

### National registers that need a key (built 16 Nov 2026, all off until set)

| Source | Country | Setting | Number in `registry_number` | Checked against a real reply |
|---|---|---|---|---|
| `dk.cvr` (CVR, Erhvervsstyrelsen) | `DK` | `DK_CVR_USERNAME`, `DK_CVR_PASSWORD` (free) | CVR number | No: no credentials |
| `au.abr` (ABN Lookup) | `AU` | `AU_ABR_GUID` (free) | ABN or ACN | No: no key |
| `nz.companies` (Companies Office, via the NZBN API) | `NZ` | `NZ_NZBN_API_KEY` (free) | NZBN or company number | No: no key |
| `ca.corporations` (Corporations Canada, federal only) | `CA` | `CA_CORPORATIONS_API_KEY` (no price shown) | Federal corporation number (required: no name search) | No: no key |
| `nl.kvk` (KVK Handelsregister) | `NL` | `NL_KVK_API_KEY` (paid) | KVK number | No: no key |
| `ie.cro` (CRO Open Services) | `IE` | `IE_CRO_EMAIL`, `IE_CRO_API_KEY` (free) | CRO number | No: no key |

- **Facts:** `registry.dk.cvr.*`, `registry.au.abr.*`, `registry.nz.companies.*`, `registry.ca.corporations.*`, `registry.nl.kvk.*`, `registry.ie.cro.*` in `packages/connectors/src/fact-keys.ts`. No rule reads them yet; the rules package's mirror list needs the same keys.
- **Privacy:** sole traders and individuals (DK Enkeltmandsvirksomhed, AU "Individual/Sole Trader", NZ `Sole_Trader`, NL Eenmanszaak) are never kept or offered as candidates; Ireland's business-names register is never asked. Directors and board members are counts only.
- **These six count as official entity-lookup sources once their key is set.** Until then OpenCorporates (if its key is set) answers for DK, AU, NZ, CA, NL and IE, so those countries are never left with no register check when one is available.
- Details, what is not confirmed, and the fictional numbers: `docs/NATIONAL-REGISTERS.md`.

### National registers that need no key (built 16 Nov 2026, all off until set)

| Source | Country | Setting | Number in `registry_number` | Checked against a real reply |
|---|---|---|---|---|
| `no.brreg` (Brønnøysundregistrene) | `NO` | `PUBLIC_API_USER_AGENT` | Organisation number (mod-11) | Yes, 16 Nov 2026: Equinor ASA, unit and roles, recorded and replayed |
| `fi.prh` (PRH / YTJ open data) | `FI` | `PUBLIC_API_USER_AGENT` | Business ID (mod-11) | Yes, 16 Nov 2026: Nokia Oyj, recorded and replayed |
| `cz.ares` (ARES, Ministry of Finance) | `CZ` | `PUBLIC_API_USER_AGENT` | IČO (mod-11) | Yes, 16 Nov 2026: ČEZ, a. s., recorded and replayed; one name search tried, not recorded |
| `pl.krs` (KRS open API) | `PL` | `PUBLIC_API_USER_AGENT` | KRS number (required: no name search) | Yes, 16 Nov 2026: ORLEN S.A., recorded and replayed. The first recording was deleted: free text held people's names and PESEL numbers |
| `sg.acra` (ACRA entities on data.gov.sg) | `SG` | `PUBLIC_API_USER_AGENT` | UEN (format only) | Yes, 16 Nov 2026: Singapore Airlines Limited, recorded and replayed |
| `ch.zefix` (Zefix PublicREST) | `CH` | `ZEFIX_USERNAME`, `ZEFIX_PASSWORD` (free, on request) | UID (mod-11) | No: no credentials |

- **Facts:** `registry.no.brreg.*`, `registry.fi.prh.*`, `registry.cz.ares.*`, `registry.pl.krs.*`, `registry.sg.acra.*` and `registry.ch.zefix.*`, in `packages/connectors/src/fact-keys.ts`. No rule reads them yet. The rules package's mirror list needs the same keys.
- **Privacy:** sole traders and person-like records (NO ENK, a PRH record with no company form, CZ legal forms 101 to 108, 424 and 425, SG "Sole Proprietorship/ Partnership", CH Einzelunternehmen) are never kept or offered as candidates. Role holders and board members are counts and titles only. KRS free text and Zefix SOGC texts are never read. Recordings follow rules 11 and 12 in `packages/connectors/src/record.ts`.
- **These six count as official entity-lookup sources,** so OpenCorporates skips NO, FI, CZ, PL, SG and CH.
- **Skipped:** Estonia (its API needs a contract; its open data is bulk files), Latvia (not checked for lack of time) and Belgium (an HTML search, which we don't scrape). Details: `docs/NATIONAL-REGISTERS.md`.

### Website scan in any language (built 16 Nov 2026)

- **Languages.** `web.policy_scan` reads English, French, German, Spanish, Italian, Portuguese, Dutch, Danish, Norwegian, Swedish, Finnish, Polish, Czech, Slovak, Hungarian and Romanian. The words are data in `packages/connectors/src/sources/policy-vocabulary.ts`.
- **Other languages.** A site in any other language (Japanese, Arabic, Greek and so on) is still read: whatever is found counts, but nothing is ever reported missing. The source's message says the language can't be read yet. `web.policy.language` and `web.policy.language_supported` say which.
- **New facts for country packs.** `web.policy.dpa_named` and `web.policy.dpa_countries` (the notice names a data protection authority, and which country's), `web.policy.legal_notice_present` and `web.policy.legal_notice_url` (mentions légales, Impressum and equivalents), `web.policy.registration_number_shown` and `web.policy.registration_number_matches` (the company's own number on the site), and `web.policy.footer_links_found`. All are in `CONNECTOR_FACT_KEYS` and the rules mirror. No rule reads them yet. A rule should treat a missing fact as "verify", never as a gap.
- Details and the real-page check: `docs/ENGINE-STATUS.md`, "Website scan in any language".

### World Bank debarment list: not built (checked 16 Nov 2026)

The task was to add it to `sanctions.lists` only if there is an official machine-readable feed and terms that allow our use. Neither is clear, so nothing was built.

- **No official feed.** The official page (worldbank.org/en/projects-operations/procurement/debarred-firms, "World Bank Listing of Ineligible Firms and Individuals", updated every 3 hours) offers only an on-page search: no download, no documented API.
- **What others use is undocumented.** OpenSanctions takes the data from `apigwext.worldbank.org/dvsvc/v1.0/json/APPLICATION/ADOBE_EXPRNCE_MGR/FIRM/SANCTIONED_FIRM`, the website's own back end. It is not documented by the World Bank and its terms are unknown, so we don't call it.
- **No reuse terms found** for the list on the page. OpenSanctions republishes it under CC BY-NC 4.0, which needs a paid licence for business use.
- **Possible routes, for the owner:** ask the World Bank's Integrity Vice Presidency whether a feed and reuse terms exist; or look at the Inter-American Development Bank's open "Dataset of Sanctioned firms and individuals" (data.iadb.org, DOI 10.60966/7pfpgt0f), which combines the World Bank, IDB, ADB, EBRD and AfDB lists, and check its licence and update frequency; or license OpenSanctions.

### Draft packs for Switzerland, Singapore, Australia, New Zealand and Canada (built 16 Nov 2026)

- **Packs.** `packages/rules/src/packs/ch.ts` (13 rules), `sg.ts` (20), `au.ts` (15), `nz.ts` (11), `ca.ts` (12, federal CBCA only), each draft 0.1.0 and registered in `RAW`, so each country gets its own pack plus the International pack. Encoded from the five maps in `docs/knowledge/`; each map now ends with a "Not encoded" section listing every item left out and why (129 items in all).
- **[verify] lines.** A rule citing one is `needs_review`, so it can only give "verify". No uncertain deadline or threshold is stored or enforced. Where the International pack already asks the same thing and the country line is [verify], the country rule was left out rather than replace a check that can pass.
- **Status from the registers, in their own words only.** Zefix "being cancelled"/"cancelled", ACRA "deregistered"/"struck off", NZ status code 80 (Removed) and a Canadian status containing "dissolved" are defects; "active", "registered" or code 50 pass; any other word, a miss, or a source that is off gives "verify". ABN Lookup is never read as company status: `AU.TAX.ABN` is the tax registration, and ASIC registration needs an ASIC extract.
- **Computed annual returns.** `derived.nz.annual_return_overdue` (filing month and last filing date) and `derived.ca.annual_return_overdue` (anniversary plus 60 days and the latest return year). Both are unknown, so "verify", until the register's dates are read.
- **One check each.** `CH.DP.BREACH` and `NZ.DP.BREACH` stand in for `INTL.SEC.INCIDENT_RESPONSE`, `SG.DP.PROCESSING_AGREEMENTS` for `INTL.DP.PROCESSING_AGREEMENTS`, `NZ.CORP.SHARE_REGISTER` for `INTL.EQUITY.CAP_TABLE` (`INTL_EQUIVALENTS`).
- **Questions.** `entity_type_ch` (AG, GmbH), `sg_nominees`, `sg_cpf_employees`, `au_privacy_act` (yes, no, not sure), shown only for that country. New derived facts: `derived.ch.is_ag`, `derived.au.privacy_act`, `derived.sg.cpf_employees`, `derived.sg.nominees`, `derived.sends_marketing`, `derived.automated_decisions`.
- **Coverage level is now worked out, not only listed.** `coverageFor(country, connectors)` in `apps/api/src/modules/scans/facts.ts` takes the connectors the API built: a country is `registry` only while its own entity-lookup source is switched on (`Connector.configured`, read on every call), whether or not it has a pack; otherwise `international`. `full` (US-DE, GB, NG) never changes. Company, records, overview and public report responses pass `deps.connectors`. Without connectors (the web app), `COVERAGE_LEVELS` stays the default. So AU, NZ, CA, DK, NL, IE and CH are `international` until their key is set; NO, FI, CZ, PL and SG are `registry` once `PUBLIC_API_USER_AGENT` is set; FR once its user agent is set. Where a draft pack applies, the sentence says its rules are "not yet reviewed". Tests: `apps/api/test/country-coverage.test.ts`, `packages/rules/test/country-packs.test.ts`.

### EU common rules and draft packs for France, Norway, Finland, Denmark, the Netherlands, Ireland, Czechia and Poland (built 16 Nov 2026)

- **EU common rules, written once.** `packages/rules/src/packs/eu-common.ts` holds 37 rules from `docs/knowledge/vero-scan-eu-common-rule-pack-map.md` (GDPR beyond the International pack, cookies, e-commerce and consumer information, VIES, the AMLR yearly check, the AI Act, accessibility, prospectus exemptions, the DSA). `addEuCommon` adds them to each country pack with the country's prefix (`FR.DP.ROPA`) and a shared obligation (`eu_ropa`), so a company is asked each one once: the home country's rule counts, and the same rule in another EU pack, brought in by users there, gives way (`selectPacks`). A country can leave one out and write its own with the same obligation (France's DPO rule reads the CNIL list). Norway gets the 25 that reach it through the EEA: no AI Act (not Norwegian law yet), no VIES, AMLR, accessibility, prospectus, DSA or online withdrawal button.
- **Packs** (all draft, 0.1.0, each with the International pack): FR 69 rules, NO 51, FI 63, DK 66, NL 60, IE 59, CZ 66, PL 64. Each map now ends with a "Not encoded" section listing what was left out and why. A rule resting on a [verify] line is `needs_review`, so it can only say "to check" (four or fewer per pack). Registered in `RAW` (`packs/index.ts`); `INTL_EQUIVALENTS` there now merges intl.ts's list with each EU pack's own (`FR_INTL_EQUIVALENTS` and so on).
- **Status from the registers.** A defect (and "critical") only where the register says so in its own words and was checked against a real reply: France ceased; Norway deleted, bankrupt, in liquidation or compulsory dissolution; Finland ceased, invalidated, bankruptcy or liquidation; Czechia ceased. Denmark, the Netherlands and Ireland (not checked against a real reply) and Poland (end markers unconfirmed) give "to check" for anything not clearly active. A miss, a source switched off or a source not asked is always "to check". France: a miss in the business directory is "not in the public directory", and not being on the CNIL DPO list is never "no DPO".
- **Website pages.** The scan now reads the main EU languages (above), so a page it reports missing is a gap; on a site in a language it can't read (`web.policy.language_supported` false) it is "to check". Two EU rules read the new facts: the notice names a data protection authority (`web.policy.dpa_named`), and the website shows a legal notice with the company number (`legal_notice_present`, `registration_number_shown`).
- **Questions.** `data_outside_eea` (EU and EEA companies with data abroad), and the company form for France (`entity_type_fr`), Denmark, Czechia and Poland. New derived fact `derived.no.accounts_filed_recently` (Norway's last accounts year; a hint, so a "no" is "to check").
- **Not done (then).** No EU representative or DSA representative rule for companies outside the EU (no reliable "established outside the EU" fact). Added 18 Nov 2026: see the section at the end of this page. Scoring is unchanged. Coverage levels (`packages/shared/src/countries.ts`) are not touched here.

### For the lawyer: AI Act dates to check

The EU map (Section 7, read 16 Nov 2026) says Regulation (EU) 2026/1744 moved the Annex III high-risk duties to 2 Dec 2027 and Annex I to 2 Aug 2028, with new art 5 bans from 2 Dec 2026. The new EU rules use those dates (`<CC>.AI.HIGH_RISK` from 2027-12-02, `<CC>.AI.HIGH_RISK_PRODUCTS` from 2028-08-02, `<CC>.AI.PROHIBITED_GENERATIVE` from 2026-12-02, `<CC>.AI.PROHIBITED_PRACTICES` from 2025-02-02). The art 50 transparency date (2 Aug 2026) is [verify] in the map, so no rule uses it.

Existing packs searched on 16 Nov 2026 (`intl.ts`, `gb.ts`, `us-federal.ts`, `us-de.ts`, `ng.ts`, the questionnaire, and the CH, SG, AU, NZ and CA drafts): **no rule states an EU AI Act date or deadline, so none contradicts the map.** The rules that touch EU-style AI duties without a date, for the lawyer to read against the new timetable when they are reviewed:

| File | Rule | What it asks |
|---|---|---|
| `packages/rules/src/packs/intl.ts` | `INTL.AI.TRANSPARENCY` | An AI disclosure ("some countries already require it"); no date |
| `packages/rules/src/packs/gb.ts` | `GB.AI.TRANSPARENCY`, `GB.AI.RISK_ASSESSMENT` | UK rules; no EU date |
| `packages/rules/src/packs/us-de.ts` | `US-DE.AI.TRANSPARENCY`, `US-DE.AI.RISK_ASSESSMENT` | US state AI laws ([verify] on their own dates); no EU date |
| `packages/rules/src/packs/ng.ts` | `NG.AI.TRANSPARENCY` | No date |
| `packages/rules/src/questionnaire.ts` | question 12 (`ai_use`) | Says AI "can bring in risk assessments and disclosures"; no date |

### EU and UK representatives, data-protection registers, EU trade marks and fundraising signals (built 18 Nov 2026)

- **Representatives and points of contact.** The website scan now looks, in all 16 languages, for an EU representative (GDPR art 27), a UK representative (UK GDPR art 27), a DSA single point of contact (arts 11 and 12) and a DSA legal representative (art 13): `web.policy.eu_representative_named`, `.uk_representative_named`, `.dsa_contact_point_named`, `.dsa_legal_representative_named`. It reads the privacy notice, the legal notice, a "Digital Services Act" page if the footer links one, else the terms page. A miss is reported only when the footer is in the page, the notice and every side page found were read, and the language is one of the 16. Words are in `policy-vocabulary.ts` (`REPRESENTATIVE_VOCABULARY`, `DSA_PAGE_LINK`).
- **Rules (draft).** `<CC>.DP.EU_REPRESENTATIVE`, `<CC>.COM.DSA_REPRESENTATIVE` and `<CC>.COM.DSA_POINTS_OF_CONTACT` in every EU member's pack (not Norway), and `GB.DP.UK_REPRESENTATIVE`. The representative rules follow a company registered outside the EU or UK into those markets, once. "Established" is `derived.eu_established` / `derived.uk_established`: registered there, or the new answers `eu_establishment` / `uk_establishment`. New questions: `eu_offers_services`, `eu_establishment`, `uk_establishment` (question 2) and `eu_trademark_numbers` (question 23). Maps: EU map Section 1 and 12, UK map Section 3, each re-read from EUR-Lex and legislation.gov.uk on 18 Nov 2026. Packs FR, FI, DK, NL, IE, CZ, PL are now 0.2.0 and GB 0.3.0; Norway stays 0.1.0.
- **EU trade marks.** `eu.euipo` (`EUIPO_CLIENT_ID`, `EUIPO_CLIENT_SECRET`, off until set), by the numbers the company gives, for a company in any country. Not confirmed against the official portal (unreachable from here). Other offices: see `docs/ENGINE-ACCOUNTS-AND-KEYS.md`, section 3.
- **Fundraising signals.** `eu.esma_prospectus` (ESMA's prospectus register, keyless, by LEI, any country; off until `PUBLIC_API_USER_AGENT` is set), checked against two real replies on 18 Nov 2026. Companies House now also gives `allotment_filings_count` and `first_allotment_on` (SH01 returns, counts and dates only). A miss never means "has not raised". No rule reads these facts.

#### Data-protection registers outside the UK, Nigeria and France (researched 18 Nov 2026)

The test: an official, free, machine-readable register of controllers or DPOs, with no login and no bot protection, and terms that allow reuse. Kenya, South Africa and Ghana belong to another builder and were skipped. **No new register source was built**, because none fully passed:

| Country | Register | Why not built |
|---|---|---|
| Israel | Registry of Databases (Privacy Protection Authority), data.gov.il dataset `pinkas`: CSV of about 14 MB, about 32,000 rows, monthly, also a CKAN datastore API. Keyed by the owner's ID (company numbers start 51 or 52) | Closest to qualifying, but the dataset states no licence and the portal's terms page could not be read (404). The owner can be a sole trader, so only corporate IDs could be kept. Waits on the reuse terms and the owner's go-ahead for a monthly download (`docs/ENGINE-ACCOUNTS-AND-KEYS.md`, question 10). Israel has no rule pack, so it would be informational only |
| Uruguay | URCDP list of registered database owners (catalogodatos.gub.uy, CSV of 183 KB, open licence) | Name only (no tax number), last updated Feb 2025, and it includes individuals |
| Spain (Andalusia) | CTPDA list of DPOs (CSV of 294 KB, CC BY 4.0, quarterly, with CIF) | Regional public bodies only, not companies. The national AEPD list is a per-search web form with no file |
| Turkey | VERBIS | One controller at a time on a web page; no file or API |
| Philippines | NPC registration | Login portal; no public list |
| Malaysia | Register of data users (PDPA s.20) | No public search or file found |
| Italy | Garante DPO communications | Not published as data |
| Belgium, Luxembourg, Ireland, Portugal, Bulgaria, Catalonia | DPO notifications | No public list or file found |
| Colombia (RNBD), Peru (RNPDP), Argentina (RNBD) | Database registers | Per-company web lookups or answers by letter; no dataset |
| Estonia | e-Business Register open data | Bulk files full of people's names; that DPOs are in them is unproven; licence not confirmed |
| Guernsey, Jersey, DIFC, Morocco | Controller registers | No longer published, inspection only, or per-entity web pages |
| Singapore, Japan, South Korea, Hong Kong, Taiwan, Thailand, Brazil, Mexico | — | No general public register of controllers or DPOs |

### Draft packs for Germany, South Africa, Kenya and Ghana, and a German register through OpenRegister (built 18 Nov 2026)

- **Research maps** (official sources only, checked 18 Nov 2026, each with a "Not encoded" section): `docs/knowledge/vero-scan-germany-rule-pack-map.md`, `vero-scan-south-africa-rule-pack-map.md`, `vero-scan-kenya-rule-pack-map.md`, `vero-scan-ghana-rule-pack-map.md`.
- **Packs (draft, 0.1.0).** `de.ts` (33 German rules plus the EU common rules, with BDSG §38 in place of the EU DPO rule and the age of consent at 16), `za.ts` (43), `ke.ts` (40) and `gh.ts` (39), each with the International pack after it. Germany's own Impressum duty (DDG §5) rides on the EU website-identity rule. Only `ZA.TAX.VAT_REGISTRATION` rests on a [verify] line (the R2.3 million threshold is not yet promulgated), so it only ever says "to check". Nothing in the four packs is "critical". Website rules fail only where `web.policy.language_supported` is true.
- **Data-protection registration.** Kenya (ODPC), South Africa (Information Officer with the Information Regulator) and Ghana (DPC) are proved by the certificate upload: the ODPC list is behind a bot check, the Regulator has no public list, and the DPC's public register is an HTML table with no file or API.
- **Registers.** Germany: `de.openregister`, a paid licensed provider with public docs, off until `OPENREGISTER_API_KEY` is set; its facts only ever pass a rule, never fail one, until a real reply is checked. With the key set, Germany counts as `registry`. South Africa (CIPC API behind sign-in, docs not readable), Kenya (no BRS API) and Ghana (no ORC API): nothing built (`docs/NATIONAL-REGISTERS.md`). These three stay `international`, with the sentence naming their draft rules.
- **Tests.** `packages/rules/test/africa-germany-packs.test.ts`, Germany added to `packages/rules/test/eu-packs.test.ts`, `packages/connectors/test/germany-register.test.ts`. The tests that used Kenya as "a country with no pack" now use Tanzania (`packages/rules/test/international.test.ts`, `apps/api/test/any-country.test.ts`).
