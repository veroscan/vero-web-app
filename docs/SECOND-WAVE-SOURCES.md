# Second-wave countries: which official data sources exist

Written 15 Nov 2026, for Germany, South Africa, Kenya and Ghana (France is in `docs/FRANCE.md`). This is research, done by reading documentation and official web pages only. **No request was made to any data source's API, and no list or file was downloaded from a source.** Where an official page could not be read or didn't say, the item is marked **NOT CONFIRMED**.

None of these countries is offered to customers. There is no rule pack for any of them, no company can be created in them, and nothing here changes a score.

## Short answer

| Country | Company registry (identity and status) | Data-protection register | Sanctions or asset-freeze list | What we built |
|---|---|---|---|---|
| Germany | No free official API (the Handelsregister portal is free to read by hand, with a limit of 60 retrievals an hour) | None exists: Germany has no national register of data protection officers | The EU consolidated financial sanctions list (official, free, XML) | **The EU list, as `eu` in `SANCTIONS_LISTS`.** Nothing else. |
| South Africa | CIPC has an API, but access needs an application and approval; cost NOT CONFIRMED | The Information Regulator's portal is login-only; no public register found | The FIC's list is a copy of the UN list, which `un` already covers | Nothing |
| Kenya | No API found; official search through eCitizen, KSh 650 a search | The ODPC publishes a web page of registered data handlers, behind bot protection; no file or API | A domestic list (UNSCR 1373) exists on the FRC website; format and address NOT CONFIRMED; the UN list is covered by `un` | Nothing |
| Ghana | No API found; ORC searches are paid (GHS 30) | The Data Protection Commission has a web search by name or TIN; no file or API | No published domestic list confirmed; the UN list is covered by `un` | Nothing |

So the only source that is official, free, machine-readable and documented well enough to build is the **EU consolidated financial sanctions list**. It is relevant to Germany (and to every EU country, including France).

## The EU consolidated financial sanctions list (built)

- **What it is:** the European Commission's consolidated list of persons, groups and entities subject to EU financial sanctions (asset freezes only). Publisher: Directorate-General for Financial Stability, Financial Services and Capital Markets Union (DG FISMA). Official.
- **Address:** the official EU open-data catalogue (data.europa.eu, dataset "Consolidated list of persons, groups and entities subject to EU financial sanctions", read through its catalogue API on 15 Nov 2026) lists the files on the Financial Sanctions Files (FSF) site. We use the XML 1.1 file exactly as the catalogue gives it: `https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw`. The same catalogue also lists CSV 1.1, XML 1.0, CSV 1.0 and PDF versions and an RSS feed (`https://webgate.ec.europa.eu/fsd/fsf/public/rss`).
- **Token:** the address carries a `token`. The catalogue publishes this one openly. The FSF user manual (on circabc.europa.eu) says the crawler addresses shown to a logged-in user carry "the User ID of the currently logged user", and that the files "can be accessed by robots, crawlers or individual users". So two readings exist: the catalogue's public token, or a token from a free EU Login account. **NOT CONFIRMED** which the Commission prefers for automated use; the FSF site itself redirected in a loop when we tried to read it. If the public token stops working, the owner can create a free EU Login account and give us that account's address (see owner decisions).
- **Cost and licence:** free. Reuse is under the Commission's reuse notice (Commission Decision 2011/833/EU), as the catalogue states for the XML file.
- **Update cadence:** the catalogue says "daily". The manual says an email and the RSS feed announce each new file. We ask every 6 hours, like the other sanctions lists, with a conditional GET.
- **Rate limits:** none published. We ask once every 6 hours at most.
- **Size:** about 25 MB of XML (from a third-party mirror's listing, NOT CONFIRMED). We store only the entity names, a small fraction of that.
- **Format:** **NOT CONFIRMED against an official schema.** The manual says the XML files come with their XSD, but the FSF site where it lives couldn't be read. The parser follows the file's widely used public structure (`export` > `sanctionEntity`, a `subjectType` with code `person` or `enterprise`, names in `nameAlias` `wholeName`). It refuses a file without `sanctionEntity` loudly, so a changed format is an error, never "no match".
- **Overlap:** the French register (`fr`) already contains the EU freezes as applied in France, and the UN list (`un`) covers UN designations, many of which the EU list repeats. Using `eu` as well is harmless: duplicates simply match twice.

How we use it: see "What was built" below.

## Germany

**(a) Company registry.**
- The **Handelsregister** (handelsregister.de, run by the German states' justice administrations) is free to read since August 2022, by hand, through its search pages. Its terms of use, as quoted by several sources (we could not read the terms page itself, so the wording is **NOT CONFIRMED**), make it misuse to make more than 60 retrievals an hour, with a formal application needed for more. There is **no official API**. Automated searching of the web pages would be scraping against those terms, so we did not build it.
- The **Unternehmensregister** (unternehmensregister.de, Bundesanzeiger Verlag) and the **Transparenzregister** (beneficial owners) are the other official registers. No free API found; the Transparenzregister charges per retrieval and needs a registered account.
- The EU high-value-datasets regulation (Implementing Regulation 2023/138) requires company basic data to be published free and machine-readable from 9 June 2024. Other countries publish theirs (Ireland's CRO, the Netherlands' KVK). **NOT CONFIRMED** that Germany has published one: we found no official German dataset or API for it. Worth checking again, because it could become the free official source.
- **Not free, realistic options:** licensed resellers of Handelsregister data with APIs, such as OpenRegister (about €0.01 a credit, from `docs/ENGINE-ACCOUNTS-AND-KEYS.md`), North Data or Kausate; or a pan-European provider. None is chosen here.

**(b) Data-protection register.** Germany has **no national register of data protection officers**. Companies must notify their DPO's contact details to the competent state supervisory authority (there are 16 state authorities plus the federal one), but those notifications are not published as a list. Nothing to read.

**(c) Sanctions.** Germany applies EU and UN sanctions; there is no separate German national list of asset freezes that we could find. The EU consolidated financial sanctions list (above) is the relevant official source and is now built. The UN list is already covered by `un`.

## South Africa

**(a) Company registry.** The **CIPC** (Companies and Intellectual Property Commission) publishes API documentation (guide.cipc.co.za), describing company information and company profile calls with an access token. Sources say access needs an application and approval, and pricing is not published; the free enterprise search was discontinued and the eServices search now needs a login. We could not open the CIPC guide itself (its security settings refused our reader), so the terms, cost and whether it is free are **NOT CONFIRMED**. Not built. **Options:** apply to CIPC for API access; or a reseller (for example Searchworks, or the providers mentioned in `docs/ENGINE-ACCOUNTS-AND-KEYS.md` at about $0.75 a lookup).

**(b) Data-protection register.** Under POPIA, bodies register their **information officers** with the **Information Regulator** through its eServices portal (eservices.inforegulator.org.za) or BizPortal. Both need a login. We found **no public register** of information officers, and no file or API. Not built.

**(c) Sanctions.** The **FIC** (Financial Intelligence Centre) publishes the Targeted Financial Sanctions list at tfs.fic.gov.za, in PDF, Excel and XML. The FIC's own page says it "is not a FIC or South African domestic sanctions list" but a replica of the UN Security Council consolidated list, updated within 24 hours of UN changes. Its direct XML address appears only on third-party sites (**NOT CONFIRMED** on an official page). Because the UN list itself is already one of our lists (`un`), we did not add a copy of it.

## Kenya

**(a) Company registry.** The **Business Registration Service** (BRS) offers official searches through eCitizen: KSh 650 for a company (the CR12), KSh 250 for a business name (sources agree; the official fee schedule page we found was for a different registry, so the exact fee is **NOT CONFIRMED** from BRS). No public API found. Not built. **Options:** a local agent, or an identity-verification provider that covers Kenya.

**(b) Data-protection register.** The **ODPC** (Office of the Data Protection Commissioner) must keep a register of data controllers and processors, and links to a "Register of Data Handlers" page on odpc.go.ke. That page sits behind a bot-protection check (it showed a browser verification page to our reader), and no download, file or API is offered. Reading it automatically would be against the site's protection. Not built. **Options:** ask the ODPC whether it can provide the register as a file, or ask the company for its registration certificate.

**(c) Sanctions.** Kenya keeps a **domestic list** of persons and entities designated under UNSCR 1373 (by the Counter Financing of Terrorism Inter-Ministerial Committee), published on the **FRC** (Financial Reporting Centre) website. A third-party mirror reads it as an Excel file. We could not open the FRC page (its certificate didn't verify), so its address and format are **NOT CONFIRMED**, and news reports suggest it is mostly individuals, whom we don't screen anyway. Not built. The UN lists Kenya applies are covered by `un`.

## Ghana

**(a) Company registry.** The **ORC** (Office of the Registrar of Companies) publishes a fee schedule: a search of the Companies Register costs GHS 30 (GHS 150 for charges and insolvency). No public API found. Not built. **Options:** a local agent per lookup (as `docs/ENGINE-ACCOUNTS-AND-KEYS.md` already says), or a provider covering Ghana.

**(b) Data-protection register.** The **Data Protection Commission** keeps a public register (Act 843, sections 46 and 47) with an online search by entity name or TIN, showing status and registration expiry. It is a web search, not a file or API, and the Commission also sells "due diligence search" requests. Automating the web search would be scraping. Not built. **Options:** ask the Commission for bulk or API access, or use its paid due diligence search.

**(c) Sanctions.** Ghana's E.I. 2 provides for a domestic list, but we found **no published domestic list** on the FIC Ghana site (it links to the UN list). Reports of a planned local list are not confirmed. The UN list is covered by `un`.

## What was built

Only the EU list. It is the list `eu` of the existing `sanctions.lists` source:

- **Off until set.** Nothing happens until `eu` is added to `SANCTIONS_LISTS`, and the refresh job downloads nothing while `REFERENCE_REFRESH_ENABLED` is false.
- **Stored list.** Kept in `reference_data` as `sanctions.eu` (migration `0017_eu_sanctions_list.sql`), refreshed every 6 hours by `reference.refresh`, shown on `GET /v1/admin/connectors`. A copy older than `REFERENCE_SANCTIONS_MAX_AGE_HOURS` makes the whole sanctions answer "unavailable", never "no match".
- **Data minimisation.** The EU file lists people with birth dates, places of birth, citizenship, addresses and identity documents. The refresh job keeps **only entity names** (subject type `enterprise`) and the file's generation date. People are skipped, as with every other list. A recording of the file replaces each person entry whole with `[person]` (rule 6 in `packages/connectors/src/record.ts`).
- **Same words as the other lists.** Exact name: "This name matches an entry on a sanctions list. It may be another business with the same name." Close name: "This name is close to an entry on a sanctions list. A person needs to check it." Never "sanctioned".
- **Tier 3**, an official list.
- **Facts.** It produces the existing `registry.sanctions.match`, `registry.sanctions.possible_match` and `registry.sanctions.lists_checked` facts; no new fact names were needed, and no `registry.de.`, `registry.za.`, `registry.ke.` or `registry.gh.` facts exist. **Unlike the French sources, these facts are read by existing rules** (for example the UK sanctions rule reads `registry.sanctions.match`). So switching `eu` on means a customer's name is also screened against the EU list, and an EU match would show as a sanctions finding to check. A test shows a clean name gives the same findings and score with or without `eu`. Whether to switch it on is an owner decision.
- **Jurisdictions unchanged.** `sanctions.lists` still runs for US, US-DE, GB, NG and FR companies. No country was added anywhere.
- **Never run against the real list.** Tests use a fictional sample (`packages/connectors/test/samples/eu-fsf.xml`).

## What a lawyer must still supply, per country

Before any of these countries can be offered, the same as France:

1. **Germany:** a German rule pack (GmbH and UG foundations, Handelsregister and Transparenzregister duties, the DPO duty under the BDSG and GDPR and when a DPO is required, filing of annual accounts in the Unternehmensregister, and so on), with citations and severities; the plain-language content per finding; document slots (Gesellschaftsvertrag, Handelsregisterauszug, Transparenzregister extract, DPO designation); deadlines; and how a sanctions match should be treated.
2. **South Africa:** a South African pack (Companies Act 2008, CIPC annual returns, beneficial ownership filing, POPIA including information officer registration, PAIA manual and annual reports, FICA where relevant); content, document slots and deadlines; whether a missing information officer registration can be checked at all without a public register.
3. **Kenya:** a Kenyan pack (Companies Act 2015, BRS annual returns and beneficial ownership register, the Data Protection Act 2019 and ODPC registration thresholds and renewal every 24 months); content, slots, deadlines; how to treat the ODPC register when it can't be read automatically.
4. **Ghana:** a Ghanaian pack (Companies Act 2019 (Act 992), ORC annual returns and beneficial ownership, the Data Protection Act 2012 (Act 843) registration and renewal); content, slots, deadlines.
5. For each country: which facts the rules may read, how a miss is treated, and the questions the questionnaire must ask (for example the registration number and the data-protection registration number, since none of the registers can be read automatically).

## Owner decisions

1. **Switch on the EU list?** Add `eu` to `SANCTIONS_LISTS` (and `REFERENCE_REFRESH_ENABLED`). It affects real customers' sanctions screening for every country we offer, not just Germany.
2. **Public token or our own EU Login token?** The address uses the token the EU catalogue publishes. If the Commission prefers per-user tokens, someone creates a free EU Login account for the Client (a company mailbox, not a person's) and we change the address. The token is not a secret in the catalogue's case, but treat an account token like a password.
3. **Paid company data per country.** Germany (a licensed Handelsregister reseller), South Africa (CIPC API application, or a reseller), Kenya and Ghana (an agent or provider per lookup). None is chosen.
4. **Letters to regulators.** Whether to ask the Kenyan ODPC and the Ghanaian Data Protection Commission for their registers as files, and CIPC about API terms and cost.
5. **Kenya's domestic list.** Whether someone should look at the FRC file by hand to see if it holds any entities worth screening (we screen entities only).

## Pages read (15 Nov 2026)

- EU catalogue entry, via the data.europa.eu catalogue API: `https://data.europa.eu/api/hub/search/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions`
- FSF stakeholders' user manual (PDF, circabc.europa.eu)
- South Africa FIC: `https://www.fic.gov.za/targeted-financial-sanctions/`
- Kenya ODPC: `https://www.odpc.go.ke/data-protection-compliance/` (the register page itself showed bot protection)
- Web searches for the Handelsregister terms, CIPC API, Information Regulator portal, BRS and ORC fees, Kenya FRC and Ghana FIC lists. Third-party pages were used only to find official ones, and everything that rests on them alone is marked NOT CONFIRMED.
