# National company registers

Each country's own official company register, read one company at a time. They follow the contract in `docs/GLOBAL-COVERAGE.md`: the national number goes in `registry_number`, facts are `registry.<cc>.<source>.*`, a miss is "not found in this register" (never "doesn't exist"), sole traders and other people are never kept, and directors become counts. No rule reads these facts yet: they are evidence only and change no score.

Two groups: registers that need no key (built separately), and the registers below, which need a key or account. Each of the second group is built and tested on samples made from its official documentation, and stays off (`unavailable`, "isn't connected yet") until its settings are set. A refused key is also `unavailable`, with words that say it is a setup problem on our side, never a problem with the company.

## Registers that need no key (built 16 Nov 2026)

These are free and official, and need no key or account. Each stays off until `PUBLIC_API_USER_AGENT` is set: that is the plain name we send as the User-Agent (for example `VeroScan company checks`), never a person's details. Switzerland is the exception: Zefix is free, but it needs a username and password.

**Five of the six were checked against one real reply each on 16 Nov 2026.** Each was asked about one large, well-known listed company, by its number, with the User-Agent `VeroScan-engine-check/1.0`, inside the published limits. The reply was recorded with the record harness (people redacted) and replays correctly (`packages/connectors/test/recorded/data/`). A few extra real calls confirmed the shape of a name search and that the fictional numbers in the tests are unused. Name searches and misses are not recorded: they are tested on samples built from the documentation. No bulk file was downloaded.

| Country | Source id | Register | Setting | Number we take (`registry_number`) | Rate we keep to |
|---|---|---|---|---|---|
| Norway | `no.brreg` | Brønnøysundregistrene, Enhetsregisteret | `PUBLIC_API_USER_AGENT` | Organisation number, 9 digits, mod-11 check | 5 a second (none published) |
| Finland | `fi.prh` | PRH / YTJ open data API v3 | `PUBLIC_API_USER_AGENT` | Business ID (Y-tunnus), 1234567-8, mod-11 check | 2 a second (none published; 429 documented) |
| Czechia | `cz.ares` | ARES, Ministry of Finance | `PUBLIC_API_USER_AGENT` | IČO, 8 digits, mod-11 check | 4 a second (over 500 a minute counts as abuse) |
| Poland | `pl.krs` | KRS open API, Ministry of Justice | `PUBLIC_API_USER_AGENT` | KRS number, up to 10 digits (no check digit) | 2 a second (none published) |
| Singapore | `sg.acra` | ACRA's "Entities Registered with ACRA" on data.gov.sg | `PUBLIC_API_USER_AGENT` | UEN (format only: ACRA publishes no check rule) | 3 per 10 seconds (4 per 10 published without a key) |
| Switzerland | `ch.zefix` | Zefix PublicREST, Federal Registry of Commerce | `ZEFIX_USERNAME`, `ZEFIX_PASSWORD` | UID, CHE-123.456.789, mod-11 check | 2 a second (none published) |

Shared rules, all six:

- **A number that fails its format or check digit** is refused before anyone is asked: `unsupported`, "That … doesn't look right: it should be …".
- **By name:** exactly one company with the same name (legal-form words such as AS, Oy, s.r.o., Pte. Ltd. or AG ignored) is a match, at 0.95. Several, or only close names, are `ambiguous` with up to 5 candidates. When the register has more results than it returned and none matches exactly, we ask for the number rather than saying "not found".
- **A miss** is `not_found` with `identified` = null (unknown, never false). The words are "We didn't find this … in … That doesn't mean the company doesn't exist", and they say to add or check the number.
- **People are never kept.** Directors and other role holders become counts and role or body titles. A sole trader or any person-like record is refused (`unsupported`: "This … belongs to a business run by one person, not a company. We don't keep records about people") and is never offered as a candidate. A record is kept only when it positively looks like a company: it has a name and a known company form. This is the lesson from the first French reply.
- **Source down, or slow down:** 429 and 5xx are retried, waiting as long as Retry-After says. If the source stays down, the result is an `error` in plain words ("… asked us to slow down." / "… had a problem on its side."), never a miss.
- **No rule reads these facts yet.** They are evidence only. Each country is "registry" level at most (`docs/GLOBAL-COVERAGE.md`).

### Norway: Brønnøysundregistrene (`no.brreg`)

- **Source and licence.** The Enhetsregisteret open API (`data.brreg.no/enhetsregisteret/api`), NLOD 2.0. We read `GET /enheter/{orgnr}` and `/enheter/{orgnr}/roller`, and `GET /enheter?navn=` to search by name.
- **Checked** against the OpenAPI description embedded in the official documentation page (`/api/dokumentasjon/en/index.html`), 16 Nov 2026. No rate limit is published.
- **Facts.** Identified; organisation number; name; status (active, bankrupt, under liquidation, under compulsory dissolution, deleted); the bankruptcy, liquidation and compulsory-dissolution flags; deletion date; organisation form code; whether it is in the Register of Business Enterprises (Foretaksregisteret) and the VAT register (MVA); founding and registration dates; NACE code; an employees band (0, 1-4, 5-9, 10-49, 50-249, 250+); the municipality of the business address; share capital and currency; part of a group; the year of the last annual accounts filed; and the roles: how many, how many held by organisations, and their titles.
- **What a miss means.** 404 means not in the register under that number. 410 means the record was "removed for legal reasons". Both are `not_found`. A deleted unit is found, with status `deleted` and its deletion date.
- **Privacy.** A sole proprietorship (ENK) is never kept. Role holders' names and birth dates never leave the parser. The unit's phone and email are not read.
- **Real reply (16 Nov 2026, Equinor ASA, 923609016).** It matched the documentation. Two details changed what we keep: `antallAnsatte` is an exact head count, so we keep a band; and the unit includes `telefon`, which the recorder now redacts. If the roles call fails, the unit's facts still stand and no role fact is given.

### Finland: PRH / YTJ (`fi.prh`)

- **Source and licence.** The YTJ open data API v3 (`avoindata.prh.fi/opendata-ytj-api/v3`), CC BY 4.0. We read `GET /companies?businessId=` and `?name=`.
- **Checked** against the official OpenAPI description (`/v3/schema`) and its code lists (company forms, registers, register states, Business ID states, situations), 16 Nov 2026. 429 is documented, but no number is given.
- **Facts.** Identified; Business ID; name; status (active, pending, ceased, invalidated); situations (bankruptcy, liquidation, reorganisation); company form code and its English name; registration and end dates; the Business ID's state; trade register status; whether it is on the VAT, prepayment and employer registers; and the main industry code and its English name.
- **What a miss means.** The register isn't complete for every business: sole traders (toiminimi) are not in this open data at all.
- **Privacy.** The open data names no people. A record without a known company form is never kept.
- **Real reply (16 Nov 2026, Nokia Oyj, 0112038-9).** The company form comes as the number from the code list (`"17"`), not as the letter code the search filter takes (`"OYJ"`). The parser reads both.

### Czechia: ARES (`cz.ares`)

- **Source and licence.** ARES REST API (`ares.gov.cz/ekonomicke-subjekty-v-be/rest`), the Ministry of Finance's public data. We read `GET /ekonomicke-subjekty/{ico}` and `POST /ekonomicke-subjekty/vyhledat` (name, up to 100 results).
- **Checked** against the official OpenAPI description (`/rest/v3/api-docs`, version 1.4) and ARES's own legal-form code list, 16 Nov 2026. The Ministry treats more than 500 requests a minute as abuse.
- **Facts.** Identified; IČO; name; status (active, ceased); legal form code; dates of establishment and ending; VAT payer; whether it has a VAT number; whether it is in the public registers, with its file number there; whether it has an active insolvency register record; region; and its NACE codes.
- **Privacy.** A natural-person entrepreneur (legal forms 101 to 108, 424, 425), or a record with no legal form, is never kept.
- **Real reply (16 Nov 2026, ČEZ, a. s., 45274649), plus one name search.** It matched the documentation. The source states are AKTIVNI, HISTORICKY, ZANIKLY and NEEXISTUJICI. The name search returns every name containing the words, ordered by IČO, so the exact match can be beyond the first page. That is why we ask for 100 results, and ask for the IČO when there are more than that.

### Poland: KRS (`pl.krs`)

- **Source and licence.** The KRS open API (`api-krs.ms.gov.pl/api/krs/OdpisAktualny/{krs}?rejestr=P|S&format=json`), public data under the Polish open-data act. We try the register of entrepreneurs (P) first, then associations and foundations (S).
- **Checked** against the official description on the Court Registers Portal (`prs.ms.gov.pl/krs/openApi`, read from the portal's own page code), 16 Nov 2026. It gives the route, the parameters, 200, 404 and 5xx. It says the reply is "semantic JSON for the legal form", with no schema, and that people's names and PESEL numbers are published partly masked.
- **There is no name search.** A company given only by name is `unsupported`, asking for the KRS number. Nobody is called.
- **Facts.** Identified; KRS number; register; name; legal form; registration and last-entry dates; whether it has a NIP and a REGON, and the company's own numbers; seat (voivodeship and town); main PKD code; share capital and currency; the management and supervisory bodies' names and how many people sit on each; the number of proxies; status (registered or deleted); and liquidation and insolvency markers.
- **Privacy.** Nothing about a person is kept: no name, no initial, no PESEL digit.
- **Real reply (16 Nov 2026, ORLEN S.A., KRS 0000028860).** It confirmed the section and field names. **It also showed a privacy trap: the free text of a proxy's type (`rodzajProkury`) named other proxies in full, with their unmasked PESEL numbers.** The first recording kept that text, so it was deleted at once. The recorder now keeps a KRS extract by allowlist only: only the fields the parser reads stay, and every other text becomes `[text]`. The extract was recorded again and checked, with no name and no PESEL left. The parser never reads free text.
- **Not confirmed.** The markers for deletion, liquidation and insolvency were not in that reply. They are read from the section names the register uses (wykreślenie, likwidacja, upadłość, restrukturyzacja), and a real record that has them should be checked.

### Singapore: ACRA on data.gov.sg (`sg.acra`)

- **Source and licence.** ACRA's dataset "Entities Registered with ACRA" (`d_3f960c10fed6145404ca7b821f263b87`, in the collection "Registered Entities with Unique Entity Number", updated monthly), read with data.gov.sg's `datastore_search`. It is under the Singapore Open Data Licence. A data.gov.sg key is optional and only raises the rate limit. It is not built, because the keyless limit is enough for one company at a time.
- **Checked** against the dataset's own metadata and the data.gov.sg developer guide's rate-limit page, 16 Nov 2026.
- **Facts.** Identified; UEN; name; UEN status (registered, deregistered, …); entity type; UEN issue date; issuing agency; and the registered office postcode.
- **What a miss means.** It is a monthly copy, so a company registered this month may be missing, and the name must match exactly. It has no officers or filings: those are in ACRA's paid BizFile service, which was not built.
- **Privacy.** A sole proprietorship or partnership ("Sole Proprietorship/ Partnership") is never kept: its name is often its owner's, and its address can be a home.
- **Real reply (16 Nov 2026, Singapore Airlines Limited, 197200078R).** It matched the metadata. We also found that the full-text `q` search is useless for names: it returned 166,169 unrelated rows. So names are matched exactly, in upper case, with `filters`.

### Switzerland: Zefix (`ch.zefix`)

- **Source and licence.** Zefix PublicREST (`www.zefix.admin.ch/ZefixPublicREST`), from the Federal Registry of Commerce at the Federal Office of Justice. Its terms are "OGD Open use. Must provide the source." It needs HTTP Basic credentials, which are given on request.
- **Checked** against the official OpenAPI description (`/v3/api-docs`, version 2.7.2.4), 16 Nov 2026. We read `GET /api/v1/company/uid/{CHE…}` and `POST /api/v1/company/search`. A 404 means nothing was found. A 400 `RESULTLIST_TO_LARGE` means too many results: we ask for the UID.
- **Facts.** Identified; UID; name; status (active, being cancelled, cancelled); legal form code (eCH-0097) and short name; legal seat; canton; deletion date; the date of the last SOGC publication; nominal capital and currency; and the number of audit firms and branch offices.
- **Privacy.** A sole proprietorship (Einzelunternehmen, code 0101) carries its owner's name: it is never kept. SOGC publication texts name board members and signatories: they are never read, and the recorder drops them whole.
- **Not checked against a real reply.** We have no credentials, so the fictional UID in the tests could not be confirmed as unused either. We could not find an official page saying where to ask for credentials: owner decision below.

### Fictional numbers (no-key registers)

`KESTREL_KEYLESS_NUMBERS` in `packages/connectors/src/fixtures.ts`. Each passes its country's check. A real lookup on 16 Nov 2026 found nothing for each: Norway 812345672 and 812345680 (404), Finland 1234567-1 and 9999998-4 (0 results), Czechia 87654326 and 87654334 (404 NENALEZENO), Poland 0009999999 (404 in P and S), and Singapore 202499999K, T99LL9999Z, T99LL9998Z and 99999999Z (0 rows). Two numbers tried first were in use, so they were dropped: Norway 923456783 and Czechia 12345679. Switzerland's CHE-123.456.788 and CHE-987.654.326 are not confirmed.

### Skipped, and why

- **Estonia (e-Business Register).** The company-data API (ariregister.rik.ee) needs a contract and credentials. Its open data is bulk files, and bulk downloads need the owner's go-ahead. Not built.
- **Latvia (Ur.gov.lv).** Its open data is published as files on data.gov.lv. A keyless per-company query was not checked for lack of time. Not built.
- **Belgium (KBO / BCE public search).** It is an HTML search page, not an API, and we don't scrape. Its open data is a bulk file behind a sign-up. Not built.

### What the owner must still decide (no-key registers)

1. Whether to set `PUBLIC_API_USER_AGENT`. It also switches on GLEIF and VIES, built by another builder.
2. Switzerland: whether to ask the Federal Office of Justice for Zefix credentials. We found no official page naming the address to write to.
3. Singapore: whether to get a free data.gov.sg key, for higher limits once there are many Singapore scans.
4. Per country, which facts a future rule may read, and how a miss should count. For example: Singapore is a monthly copy; Finland leaves out sole traders; Poland's liquidation and insolvency markers are unconfirmed.

## Registers that need a key or account (built 16 Nov 2026)

**Nothing in this group has been tried against a real reply.** No call can be made without the key, so the reply bodies, some field values and the reply to a wrong key are read from the documentation only. The first real lookup for each should be recorded with the record harness (`docs/RECORDING-REAL-RESPONSES.md`) and checked by a person.

| Country | Source id | Register | Key | Cost | Number we take |
|---|---|---|---|---|---|
| Denmark | `dk.cvr` | Erhvervsstyrelsen's CVR, "system-til-system" access | `DK_CVR_USERNAME`, `DK_CVR_PASSWORD` | Free | CVR number, 8 digits, modulus-11 check |
| Australia | `au.abr` | ABN Lookup (Australian Business Register) | `AU_ABR_GUID` | Free | ABN (11 digits) or ACN (9 digits), both with the published checks |
| New Zealand | `nz.companies` | Companies Office register, through the NZBN API v5 | `NZ_NZBN_API_KEY` | Free | NZBN (13 digits, GS1 check) or company number |
| Canada | `ca.corporations` | Corporations Canada, Federal Corporation API | `CA_CORPORATIONS_API_KEY` | No price shown (Public Plan) | Federal corporation number, e.g. 1234567-8 |
| Netherlands | `nl.kvk` | KVK Handelsregister (Zoeken and Basisprofiel APIs) | `NL_KVK_API_KEY` | EUR 6.40 a month, plus EUR 0.02 a Basisprofiel call | KVK number, 8 digits (no published check) |
| Ireland | `ie.cro` | Companies Registration Office, CRO Open Services | `IE_CRO_EMAIL`, `IE_CRO_API_KEY` | Free for searches | CRO number, up to 7 digits (no published check) |
| Germany (18 Nov 2026) | `de.openregister` | Handelsregister, through OpenRegister (a paid licensed provider, not the court) | `OPENREGISTER_API_KEY` | Free plan 500 credits a month, then EUR 0.01 a credit; about 11 credits a lookup | OpenRegister company id (DE-HRB-F1103-267645), or a register number such as "HRB 12345" matched through a name search |

How to get each key is in `docs/ENGINE-ACCOUNTS-AND-KEYS.md`.

### Denmark: CVR (`dk.cvr`)

- **What it reads.** Erhvervsstyrelsen's Elasticsearch endpoint (`http://distribution.virk.dk/cvr-permanent/virksomhed/_search`, HTTP Basic). By CVR number, a `term` query; by name, a `match_phrase` query (a name is never read as search syntax). At most 2 requests a second: no limit is published, but Erhvervsstyrelsen may block heavy users.
- **Facts.** identified, CVR number, registered name, company-form code and short name, status (as given, lower-cased), founding date, main industry code, postcode and municipality of the company's address, number of production units, and how many current members the executive board (direktion) and the board (bestyrelse) have.
- **Privacy.** A sole proprietorship (Enkeltmandsvirksomhed, company-form code 10, "ENK") is a person's business: nothing about it is kept, it is never offered as a candidate, and a CVR number that belongs to one says so. A record with no company form at all is treated the same way. Participants' names are never read: only counts.
- **Checked** against "Kom godt i gang med ElasticSearch" (Erhvervsstyrelsen, version 1, 3 Nov 2025), the CVR index data catalogue, and Danmarks Statistik's company-form list.
- **Not confirmed:** real replies; the status words ("NORMAL", "Aktiv", "Ophørt"...); whether management roles sit in `hovedtype` or in the organisation's name (both are read); the reply to a wrong password (401 or 403 assumed). The check-digit weights (2,7,6,5,4,3,2,1) come from the HL7 Denmark guide: Danmarks Statistik confirms the modulus-11 check but doesn't print the weights.
- **Owner decision.** The official guide uses plain `http://`, so the password travels unencrypted. Ask Erhvervsstyrelsen whether `https://` works before turning this on.
- **Not built.** Beneficial owners (not public since 1 Sep 2025), financial statements, and the participant register.

### Australia: ABN Lookup (`au.abr`)

- **What it reads.** `AbnDetails.aspx` (by ABN), `AcnDetails.aspx` (by ACN) and `MatchingNames.aspx` (by name) on `abr.business.gov.au/json/`. The reply is JSONP; a message in the reply, with HTTP 200, is the error signal ("No records found", or an unrecognised GUID, which we treat as a refused key). The GUID is a query parameter: it is kept out of every evidence link and out of recordings.
- **Facts.** identified, ABN, ACN, registered name, ABN status and the date it took effect, entity type code and name, whether registered for GST and from when, and the state and postcode of the main business location.
- **Privacy.** ABN Lookup includes individuals ("Individual/Sole Trader", type IND). An individual is never kept and never offered as a candidate. A name search doesn't say what kind of entity each name is, so each candidate's own record is read first (at most 5), and individuals are dropped before anything is shown.
- **Checked** against abr.business.gov.au's JSON, response, exceptions, reference data and ABN format pages. The ACN check is from ASIC's EDGE message specification (Appendix D).
- **Not confirmed:** a real reply with data (while researching, one keyless request was answered with every field empty, which confirmed the field names and the JSONP wrapper); the date format of the status date and GST date (ISO assumed); the exact status words; the name-search item fields (from a community example, not an official schema).
- **What it isn't.** ABN Lookup is the tax register of businesses, not ASIC's company register. It doesn't say whether a company is registered or deregistered with ASIC.
- **ASIC itself.** ASIC's APIs are for approved digital service providers lodging forms, and ASIC isn't taking new applications until 2027. Company status is otherwise available through paid information brokers (search fee plus the broker's charge) or ASIC's free weekly company dataset on data.gov.au (a bulk file; not built, because bulk downloads need the owner's go-ahead). Not built.

### New Zealand: Companies Office through the NZBN API (`nz.companies`)

- **What it reads.** The NZBN API v5 (`api.business.govt.nz/gateway/nzbn/v5`, header `Ocp-Apim-Subscription-Key`): `GET /entities?search-term=` and `GET /entities/{nzbn}`. The Companies Office's own Companies API is for filings, and its documentation points readers to the NZBN API. A company number is looked up through the search, and taken only when a result carries that exact number.
- **Facts.** identified, NZBN, company number, registered name, status code and words (50 Registered, 80 Removed, and the liquidation and receivership codes), entity type code and words, incorporation date, the annual return filing month and the date the last one was filed (for a later filing rule), and how many current directors there are and how many of those are companies.
- **Privacy.** Sole traders (`Sole_Trader`) are never kept and never offered. Directors' names and addresses never leave the parser.
- **Checked** against the MBIE API portal's published OpenAPI for the NZBN API, the official Postman guides (Aug 2024) and the NZBN reference data workbook (Mar 2023). The NZBN check digit was verified against two documented NZBNs.
- **Not confirmed:** real replies; the date-time format; the role words beyond "Director"; whether the search term matches company numbers; the reply to a wrong key.

### Canada: Corporations Canada (`ca.corporations`)

- **Federal only.** The register holds corporations under federal law (Canada Business Corporations Act, Not-for-profit Act, Cooperatives Act, Boards of Trade Act...). A company incorporated under a province's or territory's law isn't in it, and every miss says so: "That doesn't mean the company doesn't exist: companies incorporated under a province's or territory's law aren't in this register."
- **What it reads.** `GET /v1/corporations/{number}.json?lang=eng` and `GET /v2/corporations/{number}/directors`, header `user-key`. The API has **no name search**: with a name alone the source answers "unsupported" and asks for the corporation number. A miss is HTTP 200 with a list of messages.
- **Facts.** identified, corporation number, current name, status (as given, lower-cased), the Act it is under, incorporation date (from the "Incorporation", amalgamation or continuance activity), the latest annual return year, the minimum and maximum number of directors in its articles, and how many directors it has (never their names).
- **Checked** against the published OpenAPI spec (version 2.0.0) and the API Store pages. The Public Plan allows 60 calls a minute; we stay at 50.
- **Not confirmed:** real replies; the casing of the wrapper keys inside lists; the status words; the cost (no price is shown anywhere, and the Public Plan is described as for every user). No check-digit rule is published, so only the shape of the number is checked.
- **Not built.** Provincial registers (each province has its own, mostly paid, often through a broker).

### Netherlands: KVK (`nl.kvk`)

- **What it reads.** By KVK number, the Basisprofiel (`/api/v1/basisprofielen/{kvk}`) and its establishments list (`/vestigingen`). By name, the free Zoeken search (`/api/v2/zoeken?naam=`), then the Basisprofiel of the one company picked. Header `apikey`. Error codes are read: IPD0005 and IPD5200 are a miss, IPD1002 and IPD1003 ("being processed", "try again in 5 minutes") are a source problem, IPD0004 is a bad number.
- **Facts.** identified, KVK number, statutory name, legal form and extended legal form, formal registration date, start and end date, active or not, main SBI activity code and all SBI codes, and the number of establishments.
- **Cost.** EUR 6.40 a month for the key, EUR 0.02 for each Basisprofiel. The establishments list may be charged as a second call (not confirmed), so a lookup may cost EUR 0.04. Searches are free. A good answer is kept for a day so the same company isn't paid for twice in a scan.
- **Privacy.** An Eenmanszaak (sole proprietorship) is a person's business: nothing about it is kept, and a KVK number that belongs to one says so. A search row without an RSIN may be a person's business (only legal entities and partnerships get an RSIN), so it is never offered as a candidate. Owners and officers are not read.
- **Checked** against developers.kvk.nl (documentation, testing, pricing, FAQ) and the published OpenAPI specs (Zoeken 2.1.0, Basisprofiel 1.5.0).
- **Not confirmed:** real replies (the specs carry no examples); the legal-form words, including "Eenmanszaak"; the date format (yyyymmdd assumed); whether newer API versions replaced these after a deprecation date shown in the spec's example warning. KVK has a public test environment with a published test key and test numbers (for example 69599084, an Eenmanszaak), which is the safest first check.
- **Who can subscribe.** Only a business registered in the Handelsregister, signed by someone authorised to sign: an owner decision.

### Ireland: CRO (`ie.cro`)

- **What it reads.** CRO Open Services (`services.cro.ie/cws`), HTTP Basic with the registered email and the key. By number, `company/{number}/C`; by name, `companies?company_name=...&company_bus_ind=C&searchType=2` ("starts with", on the name without its legal form). `C` is the company register: the business-names register (`B`), which holds sole traders, is never asked.
- **Facts.** identified, CRO number, registered name, status, status code and date, company type and type code, registration date, last annual return date, next annual return due date, and last accounts date.
- **Checked** against the CRO's public API help pages (operations "companies" and "company") and its sample code. The CRO's overview pages refused our documentation reader, so the sign-up steps come from its "Access to CRO Data" page as shown by a search engine.
- **Not confirmed:** real replies; the date format (ISO, dd/mm/yyyy and "/Date(...)/" are all read); the status words; any rate limit (none published; we stay at 2 a second); the reply to a wrong key.
- **Also available, not built.** The CRO's open data portal (opendata.cro.ie) publishes a free daily company file and a keyless search API with the same kind of fields. It could make Ireland keyless, but its terms and limits weren't read in full: an owner decision.

### Germany: Handelsregister through OpenRegister (`de.openregister`) (built 18 Nov 2026)

- **Why a vendor.** There is no free official German register API. HGB §9(1) opens the Handelsregister "durch einzelne Abrufe" through the Länder portal, and the portal's terms (seen only in search extracts; the page refused our reader) cap retrievals and forbid systematic ones. The portal is never automated. OpenRegister is a paid provider with public API documentation (https://docs.openregister.de), so it is the one source built.
- **What it reads.** `GET https://api.openregister.de/v1/autocomplete/company?query=` (1 credit), then `GET /v1/company/{company_id}` (10 credits), with `Authorization: Bearer <key>`. Never `realtime=true` (20 credits). A register number is taken only when one search result carries it, because a number is unique only with its court.
- **Facts** (`registry.de.openregister.*`): identified, company id, registered name, status (`active`, `inactive`, `liquidation`), legal form (`gmbh`, `ug`, ...), register type, number and court, capital amount and currency, city, incorporation and termination dates, `insolvency_open`, and counts of current managing directors and of those that are organisations.
- **Personal data.** An eingetragener Kaufmann (legal form `ek`) is a sole trader: never kept, never offered as a candidate. Managing directors are counted, never named; birth dates and street addresses are never kept.
- **Not confirmed:** real replies (the samples are built from the documented schema); whether the search also matches a register number; the reply to a used-up plan (402 assumed); plan prices beyond the free plan. Rules read it only to pass: anything else it says is "to check" (`de.ts`).
- **Also checked, not available:** the Transparenzregister (GwG §23: closed to the public; automated access only for authorities and certain obliged entities) and any list of German DPOs (none found).

### Researched 18 Nov 2026, not built: South Africa, Kenya, Ghana

| Country | Company register | Data-protection register | Why not built |
|---|---|---|---|
| South Africa | CIPC developer portal (https://developer.cipc.co.za/): a Companies API behind sign-in and a subscription; its guide (guide.cipc.co.za) did not resolve, the terms link is a placeholder, no price | Information Regulator: no public list of registered Information Officers (eServices is login-only) | API documentation not public to us; CIPC eServices terms (cl. 3(1)(c)) forbid automated searching without written permission. Owner: ask CIPC for API terms and docs |
| Kenya | BRS: no company-search API found; the official search (CR12) needs an eCitizen login and KSh 650; eCitizen's API reference returned 503 | ODPC "registered data handlers" pages sit behind a Radware bot check; the data portal needs a login | No usable API; bot protection on the ODPC list |
| Ghana | ORC: no API; the online search shows names only, and since 30 Mar 2026 detailed information needs a formal request | DPC register (https://app.dpc.gov.gh/register-of-controllers): public, no login, paginated HTML table (name, status, expiry), no file or API | No company API. The DPC list is not machine-readable (HTML only) and its reuse terms are silent, so it stays a certificate upload. A future official-list import is possible if the DPC publishes a file |

In all three, the draft rule packs (`za.ts`, `ke.ts`, `gh.ts`) ask for the registration certificates, filings and the data-protection certificate instead. A miss on any register would never mean "doesn't exist".

### Fictional numbers used in tests and fixtures

Each passes its country's check where there is one. Checked on 16 Nov 2026 by a single look at each register's free public web page where a program could read one:

- Australia ABN 99 987 654 320: ABN Lookup's public search says "No record found". Its ACN 987 654 320 is far above the ACNs issued so far.
- Canada 9876543-2: Corporations Canada's public search shows no corporation. (9999990 was tried first and is a real numbered company, so it was not used.)
- Germany DE-HRB-X9999-999999 (18 Nov 2026): court code X9999 is not a German register court code, so it cannot be a real company. Not looked up (no key).
- Denmark 31415926, New Zealand 9429999999996, Netherlands 99912345, Ireland 999990: the public searches refused a program or are built in the browser, so these are **not confirmed unused**. They were picked to look artificial, and the New Zealand and Irish ones are far above the numbers issued so far.

### What a lawyer or the owner must still decide

1. Whether to get each key (all free except KVK, which needs a Dutch-registered business to subscribe).
2. Denmark: plain `http://` for the password (above).
3. Which facts a future rule may read and how a miss should be treated, per country. Australia's facts are about tax registration, not company registration; Canada's cover federal corporations only.
4. Whether to add ASIC company status through a paid broker, and Canadian provincial registers.
5. Resolved 16 Nov 2026: OpenCorporates (the paid fallback register) now skips a country only while that country's own source has its settings set. While a key here is missing, OpenCorporates answers for that country, if its own key is set.
