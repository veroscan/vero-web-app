# Vero Scan engine: accounts, keys and costs

What the scan engine needs before it reads real registers, in the order to get it. Prices are estimates from `docs/knowledge/vero-scan-milestone-1-plan.md`, `vero-scan-verification-solutions.md` and the meeting brief. They are not quotes and some are out of date within months, so confirm each one before paying. Every account should be in the Client's name, with a named person who approves each cost.

Until a key is set, its source returns "unavailable" and never counts for or against a score. Nothing breaks.

## 1. Free, get these first

| Provider | What it unlocks | Setting | How |
|---|---|---|---|
| Companies House (UK) | The UK company record: status, officers, people with significant control, charges, insolvency, filing dates | `COMPANIES_HOUSE_API_KEY` | Register at developer.company-information.service.gov.uk, create an application, add a REST key. Limit: 600 requests per 5 minutes. |
| USPTO | US trademark status, by application serial number | `USPTO_TSDR_API_KEY`, `USPTO_ODP_API_KEY` | Create the keys on the USPTO developer portals. Identity verification may be needed. |
| HMRC VAT check | Whether a VAT number is valid and registered | `HMRC_CLIENT_ID`, `HMRC_CLIENT_SECRET`, `HMRC_BASE_URL` | Create an application on the HMRC Developer Hub. Sandbox is quick. Production approval can take weeks, so start now. |
| SEC EDGAR | Form D filings (US fundraising) | `SEC_USER_AGENT` | No key, but the SEC requires a contact email in the request header. Pick a company mailbox and tell Claude which to use. Don't use a personal address. |
| ICO register (UK data protection fee) | Whether a company has paid the ICO fee | `ICO_REGISTER_URL` for the refresh job (or `ICO_REGISTER_FILE`) | Public daily file. A check on 5 Nov got a 403 from the download page, so this may need a request header change or a note to the ICO. |
| Sanctions lists (OFAC, UK, UN, France's asset-freeze register, and the EU consolidated financial sanctions list) | A possible-match check on the company name | `SANCTIONS_LISTS` (any of `ofac,uk,un,fr,eu`) | Public downloads, no key. The French register (DG Trésor) needs a User-Agent header, which we send (`REFERENCE_USER_AGENT`, a plain name). The EU list uses the address the EU data catalogue publishes, with its public token; if the Commission ever asks for a per-user token, create a free EU Login account in a company mailbox's name (`docs/SECOND-WAVE-SOURCES.md`). |
| NDPC register (Nigeria data protection) | Whether a company is on the NDPC list | `NDPC_REGISTER_URL` | Public JSON feed, about 9,000 rows. |
| Web policy scan | Reads a company's public privacy and terms pages | `WEB_SCAN_USER_AGENT` | Our own bot name. Publish a short page saying what it is. |
| GLEIF (any country) | The company's LEI record: LEI status (issued, lapsed), legal form, the national company number, renewal date, whether a parent is reported | `PUBLIC_API_USER_AGENT` | No key, no account, free (LEI data is CC0). A plain name for us as the User-Agent, for example `VeroScan company checks`. Limit: 60 requests a minute. |
| EU VIES VAT check (EU countries and Northern Ireland) | Whether the company's EU VAT number is valid today | `PUBLIC_API_USER_AGENT` (the same setting) | No key, free. Needs the VAT number from the company. **Read the terms note in section 5 first**: setting this switches VIES on together with GLEIF. |
| National registers that need no key: Norway (Brønnøysundregistrene), Finland (PRH / YTJ), Czechia (ARES), Poland (KRS), Singapore (ACRA on data.gov.sg) | Each country's own company record, looked up by its national number or exact name (`docs/NATIONAL-REGISTERS.md`) | `PUBLIC_API_USER_AGENT` (the same setting) | No key, no account, free. Setting it switches these five on, together with GLEIF and VIES. Singapore: an optional free data.gov.sg key would raise its limit (4 requests per 10 seconds without one). It is not built: the keyless limit is enough for now. |
| Switzerland Zefix (Federal Registry of Commerce) | The Swiss company record: status, legal form, seat, capital, audit firms (`docs/NATIONAL-REGISTERS.md`) | `ZEFIX_USERNAME`, `ZEFIX_PASSWORD` | Free, but the REST API needs a username and password, given on request by the Federal Office of Justice (its OpenAPI says HTTP Basic). We couldn't find an official page naming where to ask. Owner step: ask the Zefix team through zefix.admin.ch's contact details. |
| Denmark CVR (Erhvervsstyrelsen) | The Danish company record: name, company form, status, founding date, industry code, how many executive and board members (`docs/NATIONAL-REGISTERS.md`) | `DK_CVR_USERNAME`, `DK_CVR_PASSWORD` | Free. Email Erhvervsstyrelsen (cvrselvbetjening@erst.dk) asking for "system-til-system" access to CVR data: the organisation's name and CVR or company number, a contact mailbox, and that we don't need beneficial-owner data. A user id and password come back, reported to take up to about 3 weeks. Ask at the same time whether `https://` works on distribution.virk.dk (the guide shows plain `http://`). |
| Australia ABN Lookup (Australian Business Register) | An Australian business's ABN status, entity type, GST registration and state | `AU_ABR_GUID` | Free. Accept the web services agreement at abr.business.gov.au/Tools/WebServicesAgreement and fill in the form with a company mailbox. A GUID arrives by email. No published limit; we send at most 2 a second. ASIC's own company register has no public API: see `docs/NATIONAL-REGISTERS.md`. |
| New Zealand NZBN API (Companies Office register) | The New Zealand company record: status, type, incorporation date, annual return month and last filing, director counts | `NZ_NZBN_API_KEY` | Free. Create an account on portal.api.business.govt.nz, subscribe to the NZBN API (the simple key subscription is enough for public data) and copy the primary key. A separate sandbox key exists for testing. |
| Corporations Canada (federal corporations) | A federal corporation's record: status, Act, incorporation date, last annual return year, director count. Federal only, never provincial companies | `CA_CORPORATIONS_API_KEY` | No price shown. Sign in to the ISED API Store (api.ised-isde.canada.ca) with a My ISED account (2-step verification is required), subscribe to "Federal Corporation API" on the Public Plan, and copy the key. Limit: 60 calls a minute. Needs the corporation number: the API has no name search. |
| Ireland CRO Open Services | The Irish company record: status, type, registration date, annual return dates | `IE_CRO_EMAIL`, `IE_CRO_API_KEY` | Free for searches. Sign up for CRO Open Services on services.cro.ie, then sign the Open Services terms and email the signed copy to the CRO, which issues the key. `IE_CRO_EMAIL` is the exact email the key is registered to. A paid CRO customer account is only for buying documents, which we never do. |
| EUIPO Trademark Search API (added 18 Nov 2026) | EU trade marks by the number the company gives (`eu_trademark_numbers`): registered, pending or ended, the word mark, the next expiry date. Never the applicant | `EUIPO_CLIENT_ID`, `EUIPO_CLIENT_SECRET` (`EUIPO_BASE_URL`, `EUIPO_TOKEN_URL` only for the sandbox) | Free (reported). Create an account on the EUIPO API portal, https://dev.euipo.europa.eu, register an application to get a client id and secret, and subscribe it to the "Trademark search" product; the EUIPO approves the subscription by hand, reported to take a week or more. Support: apiplatform@euipo.europa.eu. Reported limit 25,000 calls a day. **Not confirmed:** the portal did not open from here on 18 Nov 2026, so the route, token address and field names come from an open-source client of the published spec; check the first real reply. Try the sandbox first. |
| ESMA prospectus register (added 18 Nov 2026) | Whether ESMA's register lists a prospectus for the company's LEI: how many, the latest and first approval dates, the approving countries | `PUBLIC_API_USER_AGENT` (the same setting as GLEIF) | No key, no account, free. Documented machine access (Solr, https://registers.esma.europa.eu/publication/helpApp); the register's legal notice allows reproduction with the source acknowledged. Only big offers need a prospectus, so most startups are not in it. |

## 2. Paid or needing a decision

| Provider | What it unlocks | Setting | Cost (estimate) | Decision or action |
|---|---|---|---|---|
| Mono (Nigeria) | CAC company record, directors, status | `MONO_SECRET_KEY` | ₦60 to ₦600 per lookup | Confirm Mono as primary. Alternatives: QoreID, Smile ID, Dojah, about $0.04 to $0.06 per lookup. Needs a business account and KYC. |
| CAC direct | Official status reports, bulk data | none (manual, or via an agent) | Status report ₦5,000 (historical ₦20,000 to ₦30,000); agent accreditation ₦10,000 once; bulk licence ₦1M once or ₦10M a year | Ask CAC for the data dictionary before paying for the bulk licence. Go-ahead needed for the CAC, NIBSS and Delaware Division letters. |
| Middesk or Cobalt (Delaware) | Delaware entity record, file number, formation date, registered agent | `DELAWARE_VENDOR`, `MIDDESK_API_KEY`, `MIDDESK_BASE_URL` or `COBALT_API_KEY` | Quote based, roughly $15 to $20 a lookup | Ask each for a written answer on whether they are formally authorised to hold Delaware data. Delaware bans automated access to its own site. |
| Delaware certificate of good standing | Good standing, from the company itself | none (the company uploads it) | About $50 a certificate, or a $20 status printout | The client buys it. We only say "Certified on {date}", never "live". |
| Anthropic (Claude) | Reads and sorts uploaded documents, always with a person confirming | `ANTHROPIC_API_KEY`, `AI_DOCUMENT_HELPER_ENABLED` | Usage based | Apply for zero data retention. Decide whether documents must stay in the UK or EU (the alternative is Claude through AWS Bedrock or Google Vertex in an EU region). See section 6 before switching it on. |
| Resend | Email, and later inbound email forwarding | `RESEND_API_KEY` | Free to about $20 a month at launch | Verify the sending domain. |
| DigitalOcean | Hosting, file storage, queue | `SPACES_*` (five settings), `VALKEY_URL`, database | About $66 a month staging, $125 to $150 production | Needs the domain and GitHub organisation in the Client's name. |
| OpenCorporates (any country without its own source) | A backup company record: status, dates, company type, branch flag, how many officers and their roles | `OPENCORPORATES_API_TOKEN` | Not checked: paid plans with daily and monthly allowances (the free allowance is 50 a day, 200 a month, for open-data projects only). Ask for a quote. | **Licence decision.** OpenCorporates data is under the Open Database Licence (share-alike: anything built from it must be shared under the same terms, with attribution) unless the account is a paid commercial one, which removes share-alike. Vero is commercial, so buy a commercial licence or don't switch it on. It is used only for countries with no register source of their own. |
| KVK (Netherlands business register) | The Dutch company record: legal form, registration date, active or not, SBI activity codes, number of establishments | `NL_KVK_API_KEY` | EUR 6.40 a month per key, plus EUR 0.02 for each company profile read (searches are free); a lookup may cost EUR 0.04 if the establishments list is charged separately (not confirmed). Limits: 300,000 calls a month, 100 a second. | **Who can subscribe:** only a business registered in the Dutch Handelsregister, signed by someone authorised to sign. Decide whether to subscribe (or through which Dutch entity). Apply on developers.kvk.nl; setup takes a few working days after the signed agreement is returned. KVK's public test environment (published test key) can be tried first. |
| OpenRegister (Germany, licensed provider for the Handelsregister) | The German company record: status (active, inactive, liquidation), legal form, register number and court, capital, incorporation date, open insolvency, count of managing directors | `OPENREGISTER_API_KEY` | Free plan 500 credits a month (no card), Pro 5,000 and Business 30,000 credits, extra credits €0.01; about 11 credits a lookup. Plan fees not shown on the pages we could read. | Decide whether to use a paid licensed provider for Germany. Sign up at https://openregister.de, create a key at https://openregister.de/keys. Read its terms on reuse of register data before production. Built and off until set. |

## 3. Later: more countries and document connections

| Item | Cost (estimate) | Note |
|---|---|---|
| France | Free official sources; built at the data level only (`docs/FRANCE.md`) | **No key or account is needed** for the Annuaire des Entreprises (`FR_RECHERCHE_ENTREPRISES_USER_AGENT`, a plain name) or the CNIL DPO list (`FR_CNIL_DPO_URL`); both are off until set. The French asset-freeze register is `fr` in `SANCTIONS_LISTS`. Optional later upgrades that do need accounts: **INPI's RNE API** (the official company register: filings, statuts, beneficial owners for authorised users) and **INSEE's Sirene API** (the full Sirene directory, with more establishment detail); both are free but need an account on their portals. DG Trésor has a contact for questions about the register (on gels-avoirs.dgtresor.gouv.fr). France still can't be offered: the legal rules must come from a lawyer first. |
| Germany | OpenRegister: free plan 500 credits a month, then €0.01 a credit (a lookup is about 11 credits: 1 search + 10 company); trademark feed €200 once | **Built 18 Nov 2026:** `de.openregister`, off until `OPENREGISTER_API_KEY` is set. Sign up at https://openregister.de and create a key at https://openregister.de/keys (no card for the free plan; Pro and Business plan fees were not shown on the pages we could read). Docs: https://docs.openregister.de. Built from the public docs only, never called: record one real reply (`npm run connectors:record`) after the key is set. There is no free official company API (the Handelsregister is free by hand, its terms limit retrievals, and it is never automated), and no DPO or beneficial-owner register we may read. The German rule pack (`de.ts`, draft) works without the key, from uploaded register extracts. |
| South Africa | CIPC API cost not published | CIPC's developer portal (https://developer.cipc.co.za/) offers a Companies API behind sign-in and a subscription; its guide (guide.cipc.co.za) did not resolve on 18 Nov 2026, so its documentation is not public to us, and its terms page is a placeholder. **Owner action:** ask CIPC for the API terms, price and documentation; we build once they are readable. CIPC eServices terms forbid automated searching without written permission. The Information Regulator has no public list of Information Officers, so the rule pack (`za.ts`, draft) asks for the registration certificate. Nothing built. |
| Kenya | Official search (CR12) KSh 650 | BRS publishes no company-search API (eCitizen's API reference returned an error on 18 Nov 2026). The ODPC's list of registered data handlers is behind a bot check. The rule pack (`ke.ts`, draft) asks for the CR12, the filing receipts and the ODPC certificate. Nothing built. |
| Ghana | Formal request to the ORC | No documented ORC API; since 30 Mar 2026 detailed company information needs a formal request. The Data Protection Commission's register (app.dpc.gov.gh/register-of-controllers) is a public HTML table with no file or API, so it is not imported. The rule pack (`gh.ts`, draft) asks for the certificates. Nothing built. |
| Other trademark offices (checked 18 Nov 2026, not built) | Mostly free, all need an account | **IP Australia** Trade Mark Search API: free OAuth (portal.api.ipaustralia.gov.au), but its reply fields are only shown after sign-up, so nothing was built; sign up and we can build it from the real reply. **IPONZ** (New Zealand) API: free for registered IPONZ users (RealMe login), on portal.api.business.govt.nz; its address and key header could not be confirmed. **INPI** (France, free DATA INPI account), **Swissreg** (Swiss user account), **JPO** (Japan, application by email), **KIPRIS Plus** (Korea), **DPMAconnectPlus** (Germany, €200 once and a signed paper agreement): keyed, not built. **No public API:** UKIPO (sells its data under licence), CIPO Canada (weekly bulk files only), WIPO Global Brand Database and TMview (consultation only), BOIP (paid FTP feed). |
| Other fundraising registers (checked 18 Nov 2026) | — | **UK share allotments (SH01)** are now read from Companies House with the existing key (counts and dates only). FCA National Storage Mechanism and Canada's SEDAR+ (exempt distribution reports) have no documented API; ESMA's crowdfunding register lists platforms, not raises. Not built. |
| GitHub connection | Free | A GitHub App, read-only. Built and off until registered: see section 7. |
| DocuSign | Developer account is free; production needs a review and a paid plan | Check the current plan price before committing. |
| Google Drive | Picker with the `drive.file` scope. Google classes it as non-sensitive, so no security assessment (CASA, which is for restricted scopes) is needed, only brand verification: see section 10 | Only if Drive import is wanted. |
| SharePoint | Free app registration in Microsoft Entra | |
| Third-party security test | Needs a quote | Recommended before launch. |

## 4. Questions only you can answer

1. Which company mailbox goes in the SEC request header?
2. Is Mono the Nigeria provider, or should I compare the others first?
3. Middesk or Cobalt for Delaware, once each gives a written answer?
4. Must customer documents stay in the UK or EU?
5. Who is the named person who approves each cost?
6. Do I have the go-ahead to draft the letters to CAC, NIBSS and the Delaware Division?
7. Which lawyer reviews the 60 rules waiting for approval, and who writes the legal content for each new country?
8. OpenCorporates: buy a commercial licence (no share-alike), or leave it off? And may we use VIES under its terms as described in section 5?
9. World Bank debarment list: shall we ask the World Bank for a feed and reuse terms, or look at the IDB's combined dataset (`docs/GLOBAL-COVERAGE.md`)?
10. Israel's Registry of Databases (data.gov.il, about 14 MB CSV): shall we ask the Privacy Protection Authority or data.gov.il for its reuse terms (the dataset shows no licence), and, if they allow it, may we build it as a stored list (owner IDs of companies only, status and date) and download it monthly (`docs/GLOBAL-COVERAGE.md`)?
11. EUIPO: create the API portal account and apply for the "Trademark search" subscription (section 1)? IP Australia likewise, so its trade mark source can be built from a real reply?

## 5. Switches waiting for your go-ahead

Both are built and off. Nothing downloads and nothing re-scans until you say so.

| Setting | What it does when on | Decision needed |
|---|---|---|
| `REFERENCE_REFRESH_ENABLED` | Downloads the ICO register, the NDPC list and the OFAC, UK and UN sanctions lists into the database: daily, sanctions every 6 hours. Sends the User-Agent `REFERENCE_USER_AGENT` (a plain name, no contact details). | Go-ahead to switch it on. The UK sanctions list is about 50 MB, downloaded only when it has changed. |
| `eu` in `SANCTIONS_LISTS` | Screens company names against the EU consolidated financial sanctions list too (stored copy, every 6 hours, entity names only). No key. | Whether to switch it on. Unlike the French sources, it feeds the existing sanctions rules for every customer, so an EU match would show as a sanctions finding to check. |
| `FR_RECHERCHE_ENTREPRISES_USER_AGENT`, `FR_CNIL_DPO_URL`, `fr` in `SANCTIONS_LISTS` | The French data sources (`docs/FRANCE.md`). No key. France is not offered to customers and no score uses them. | Whether to switch them on to collect French facts before French rules exist. Leave `FR_CNIL_DPO_URL` empty until a person has checked the CSV's columns on the first download (they aren't documented). |
| `ICO_REGISTER_URL` | The address the ICO file is downloaded from. Empty, so the ICO list is not refreshed. | Which address to use. The ICO download page refused automated fetches on 5 Nov; it may need a note to the ICO first. |
| `PUBLIC_API_USER_AGENT` | Switches on GLEIF and the EU VIES VAT check for every company (`docs/GLOBAL-COVERAGE.md`), and the no-key national registers for Norway, Finland, Czechia, Poland and Singapore (`docs/NATIONAL-REGISTERS.md`). No rule reads their facts yet. | Go-ahead. **VIES terms:** its disclaimer limits use to confirming VAT numbers for "a legitimate user" and forbids retransmitting its content. We check only the company's own number, at its request, and keep only valid or not, the date and at most whether the name roughly matches: never the name or address. Confirm you are content with that reading (ideally with the lawyer) before switching it on. |
| `MONITORING_ENABLED` | Re-scans the companies of Scale organisations weekly. Paid vendors are re-paid only after their kept answer expires (`VENDOR_CACHE_DAYS`). Capped by `MONITORING_MAX_SCANS_PER_ORG_PER_DAY` (20) and `MONITORING_MAX_SCANS_PER_DAY` (500). | Go-ahead, and whether weekly is right (Scale's promise names no interval). Once on, the web app's `SCALE_EXTRAS.deadlineWatching.live` should be set to true so the plan page stops calling it "planned"; that is a screen change, not done here. |

## 6. Claude document helper: keep it off for real customer documents

Built and off (`AI_DOCUMENT_HELPER_ENABLED=false`). It has never been run against the real API. Even when on, a document is sent only for an organisation that has switched it on for itself (`organisation_setting`, off by default, no screen yet).

**It must stay OFF for real customer documents until both of these are done:**

1. **Zero data retention.** No ZDR arrangement exists with Anthropic yet. Apply for it, or choose the EU route instead (Claude through AWS Bedrock or Google Vertex in an EU region; that would need a different client, not built here).
2. **The AI disclosure** (milestone plan, clause 1.6) is sent and signed.

Until then, only fictional samples (such as the Kestrel Pay set) may be used to try it, on a non-production key.

| Setting | Default | Decision needed |
|---|---|---|
| `AI_DOCUMENT_HELPER_ENABLED` | `false` | Go-ahead, once ZDR (or the EU route) and the AI disclosure are in place. |
| `ANTHROPIC_API_KEY` | empty | A key from the Client's Anthropic account. Read by the SDK only, never logged. |
| `CLAUDE_MODEL` | `claude-opus-5-5` | **Owner cost decision.** A cheaper tier is just this setting: `claude-sonnet-5-5` or `claude-haiku-5-5`. Not changed by us. |
| `DOCUMENT_HELPER_EFFORT` | `medium` | Lower (`low`) is cheaper and faster; measure quality first. |
| `DOCUMENT_HELPER_MAX_PER_ORG_PER_DAY` | `100` | The daily cap per organisation. |
| `DOCUMENT_HELPER_MAX_PAGES` | `50` | Longer PDFs are not sent. |
| `ANTHROPIC_INFERENCE_GEO` | not set | Whether documents must stay in a region (question 4 above). Not defaulted. |

Each call records its token counts (input, output, cache) in the audit log as `document.helper_used`, so the cost per organisation can be added up. Every answer is a suggestion a person confirms, and it never says a document is genuine, executed or legally sufficient.

## 7. GitHub App: how to register it (owner steps)

Built and off. Until these steps are done, every GitHub screen and route says "GitHub isn't connected yet" and nothing is read. What customers are told is in `docs/CONNECT-GITHUB.md`.

**Who does this:** the owner, signed in to GitHub as an owner of the Client's own GitHub organisation (the dedicated Vero Scan organisation from the milestone plan, clause 4.1). Register the app *in that organisation*, not in a personal account, so the app belongs to the Client.

1. On GitHub, open the Client's organisation, then **Settings**, **Developer settings**, **GitHub Apps**, **New GitHub App**.
2. Fill in:
   - **GitHub App name:** `Vero Scan` (if GitHub says it is taken, add a word, for example `Vero Scan Evidence`). The name in the app's address, shown after saving as `github.com/apps/<name>`, is the **slug**.
   - **Homepage URL:** the web address of the product (the same as `WEB_BASE_URL`).
   - **Callback URL:** leave empty, and leave **Request user authorization (OAuth) during installation** unticked. We never sign anyone in through GitHub.
   - **Setup URL:** `<API_BASE_URL>/v1/connections/github/setup`, for example `https://api.<your domain>/v1/connections/github/setup`. Tick **Redirect on update**.
   - **Webhook:** tick **Active**. **Webhook URL:** `<API_BASE_URL>/v1/webhooks/github`. **Webhook secret:** make a long random password (40 characters or more, from a password manager) and keep it for step 4.
   - **Permissions, Repository permissions:** **Contents: Read-only** and **Metadata: Read-only**. Nothing else. Leave every Organization and Account permission at "No access".
   - **Subscribe to events:** tick nothing. GitHub always sends the two events we use (installation, and repositories added or removed).
   - **Where can this GitHub App be installed?** For the first release choose **Only on this account**: only the Client's own organisation can install it, which is what you want while trying it on a test repository. Before real customers connect, change it to **Any account** (Settings of the app, **Advanced**, **Make public**). That switch is an owner decision; nothing in the code changes.
3. Save. On the app's page, note the **App ID** (a number). Then under **Private keys**, choose **Generate a private key**. GitHub downloads a `.pem` file once. Keep it like a password: never email it, never put it in the repository or a chat.
4. Put the settings into the API's environment (on DigitalOcean: the app's encrypted environment variables), for both the API and the worker:

| Setting | What goes in it |
|---|---|
| `GITHUB_APP_ID` | The App ID number from step 3. |
| `GITHUB_APP_SLUG` | The slug from step 2 (the app's address without `github.com/apps/`). |
| `GITHUB_APP_PRIVATE_KEY_FILE` | Preferred: the path on the server where the `.pem` file is kept, outside the code folder. |
| `GITHUB_APP_PRIVATE_KEY` | Only if a file can't be used (DigitalOcean App Platform): the whole `.pem` text on one line with each line break written as `
`. Set this or the file, not both. |
| `GITHUB_WEBHOOK_SECRET` | The webhook secret from step 2. |
| `GITHUB_API_URL` | Leave as `https://api.github.com` (change only for GitHub Enterprise). |
| `GITHUB_MAX_REPOS_PER_ORG` | Default 25: how many repositories one customer can include. |
| `GITHUB_MAX_FILES_PER_SYNC` | Default 800 file requests per sync. |

5. Restart the API and the worker. The connection is on once all four of the ID, slug, key and secret are set. A key that can't be read stops the API from starting, with a message that never shows the key.

**To replace a leaked key:** generate a new private key on the app's page, put it in place, restart, then delete the old key on GitHub. **To replace the webhook secret:** change it on GitHub and in `GITHUB_WEBHOOK_SECRET` together.

**What it costs:** nothing. GitHub Apps are free.

**Not verified yet:** nothing has been sent to the real GitHub. Every test uses a mocked GitHub and a key made for that test run only. The first real check should be one test repository in the Client's own organisation, with the app set to "Only on this account".

## 8. DocuSign: how to set it up (owner steps)

Built and off. Until these steps are done, every DocuSign route says "DocuSign isn't connected yet" and nothing is read. What customers are told is in `docs/CONNECT-DOCUSIGN.md`.

1. **Developer account.** Create a free DocuSign developer account (developers.docusign.com) in the Client's name, with a company mailbox.
2. **Integration key.** In the developer account, open **Settings**, then **Apps and Keys**, then **Add App and Integration Key**. Name it `Vero Scan`. Choose **Authorization Code Grant**, as a confidential integration (one with a secret).
3. **Secret key.** Under **Authentication**, choose **Add Secret Key**. DocuSign shows it once: keep it like a password.
4. **Redirect URI.** Add exactly `<API_BASE_URL>/v1/connections/docusign/callback`, for example `https://api.<your domain>/v1/connections/docusign/callback`. Nothing else.
5. **Settings**, in the API's and the worker's environment:

| Setting | What goes in it |
|---|---|
| `DOCUSIGN_INTEGRATION_KEY` | The integration key (a GUID) from step 2. |
| `DOCUSIGN_SECRET_KEY` | The secret key from step 3. Never logged. |
| `DOCUSIGN_ENV` | `demo` until the go-live review passes, then `production`. |
| `DOCUSIGN_MAX_ENVELOPES_PER_PULL`, `DOCUSIGN_MAX_ENVELOPES_PER_ORG_PER_DAY` | Defaults 10 and 50. |

6. **Try it in demo** with a test DocuSign account and fictional envelopes only.
7. **Go-live for production.** DocuSign must review the integration key before it works in production (the review looks at successful API calls made in demo), and production use needs a paid DocuSign plan on the Client's account. Check the current price before committing. After go-live, add the same redirect URI to the production key, set `DOCUSIGN_ENV=production` and restart.

**To replace a leaked secret:** add a new secret key on DocuSign, put it in place, restart, then delete the old one.

**Not verified yet:** nothing has been sent to the real DocuSign. Every test uses a mocked DocuSign.

## 9. Forwarding by email: how to set it up (owner steps)

Built and off. What customers are told is in `docs/FORWARD-BY-EMAIL.md`. It uses Resend, which is already the mailer.

1. **Pick a sub-domain** used only for this, for example `in.<your domain>`. Don't use the main domain: its mail would then go to Resend.
2. **In Resend,** add that domain for **receiving** and add the **MX record** Resend shows to the domain's DNS (at the DNS provider). Wait for Resend to show it as verified.
3. **Webhook.** In Resend, create a webhook for the **`email.received`** event with the URL `<API_BASE_URL>/v1/webhooks/inbound-email`. Copy its **signing secret** (it starts with `whsec_`).
4. **API key.** Reading received attachments needs a Resend key that may read emails. If `RESEND_API_KEY` has "sending access" only, create a second key and put it in `INBOUND_EMAIL_RESEND_API_KEY`.
5. **Settings:**

| Setting | What goes in it |
|---|---|
| `INBOUND_EMAIL_DOMAIN` | The sub-domain from step 1. |
| `INBOUND_EMAIL_WEBHOOK_SECRET` | The signing secret from step 3. Never logged. |
| `INBOUND_EMAIL_RESEND_API_KEY` | Only if needed (step 4). |
| `INBOUND_EMAIL_MAX_ATTACHMENTS`, `INBOUND_EMAIL_MAX_DOCUMENTS_PER_ORG_PER_DAY`, `INBOUND_EMAIL_MAX_TOTAL_MB` | Defaults 10, 50 and 50. |

6. Restart the API and the worker. Try it with a test organisation and fictional files only.

**Cost:** receiving is part of Resend's plans; check the current inbound limits before launch.

**Not verified yet:** no real email has been received. Every test uses a mocked Resend.

## 10. Google Drive: how to set it up (owner steps)

Built and off. What customers are told is in `docs/CONNECT-GOOGLE-DRIVE.md`; how it works is in `docs/ENGINE-STATUS.md`.

**What it costs, and how long it takes (read this first).** Vero asks for one Google permission, `drive.file` ("only the files you pick"). Google's Drive documentation classes it as **non-sensitive**. Google's help pages say apps that use only non-sensitive scopes **do not have to complete OAuth app verification** and **need no security assessment** (the CASA assessment is for restricted scopes only, such as full Drive access). What every public app does need is **brand verification**: a home page on a domain you own, a privacy policy linked from it and from the consent screen, the domain verified in Google Search Console, and current contact details. Google says its automated brand check "usually completes in a few minutes" once those are in place. We found no fee for any of this in Google's documentation, but Google doesn't state a price or a review time for every case, so treat "free, days not months" as our reading, not a promise. **Correction to section 3:** the "$540 to $4,500 a year" CASA cost there applies to restricted scopes, not to `drive.file`.

1. **Google Cloud project** in the Client's name (console.cloud.google.com). Note its **project number** (digits, on the dashboard), not the project id.
2. **Enable two APIs:** Google Drive API and Google Picker API.
3. **OAuth consent screen** (Google Auth Platform, Branding and Audience): app name Vero, support email, the home page, privacy policy and terms links, and the authorised domain. User type **External**. While it says **Testing**, only test users you list can connect, and their access expires after a while (believed to be 7 days, not confirmed); switch to **In production** for customers.
4. **Data access (scopes):** add only `https://www.googleapis.com/auth/drive.file`. Don't add any other Drive scope: that would turn this into a sensitive or restricted app and bring the full verification and, for restricted ones, the yearly paid assessment.
5. **OAuth client:** create credentials, type **Web application**. Authorised redirect URI, exactly: `<API_BASE_URL>/v1/connections/google-drive/callback`. Authorised JavaScript origin: the web app's address (the Picker runs there). Copy the client id and secret.
6. **API key for the Picker:** create an API key, restrict it to the **Google Picker API** and to the web app's address (HTTP referrer). Google treats it as public; the restriction is what protects it.
7. **Brand verification:** verify the domain in Google Search Console with the same Google account, then submit the branding in the console.
8. **Settings:**

| Setting | What goes in it |
|---|---|
| `GOOGLE_DRIVE_CLIENT_ID` | The client id from step 5 (ends `.apps.googleusercontent.com`). |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Its secret. Never logged. |
| `GOOGLE_PICKER_API_KEY` | The key from step 6. Sent to the browser for the Picker. |
| `GOOGLE_CLOUD_PROJECT_NUMBER` | The project number from step 1 (the Picker's app id). |
| `GOOGLE_DRIVE_MAX_FILES_PER_PULL`, `GOOGLE_DRIVE_MAX_FILES_PER_ORG_PER_DAY` | Defaults 10 and 50. |

All four of the first settings, or none. Restart the API and the worker. Try it with a test Google account and fictional files only.

**Not verified yet:** nothing has been sent to the real Google. Every test uses a mocked Google. The web screen that runs the Picker isn't built.

## 11. SharePoint and OneDrive: how to set it up (owner steps)

Built and off. What customers are told is in `docs/CONNECT-SHAREPOINT.md`.

**What it costs, and who must approve.** An app registration in Microsoft Entra is free. Vero asks for `Files.Read` (the signed-in person's files), `offline_access` and `openid`. Microsoft's permissions reference lists none of them as needing admin consent, so in most organisations the person can allow Vero themselves. **But** many companies switch user consent off, and then a **tenant admin** must approve Vero once for the organisation. If customers need files from SharePoint *sites* (team libraries) rather than their own OneDrive, `Files.Read` may not be enough and `Files.Read.All` would be needed (not confirmed; listed as not needing admin consent either). The truly per-file permission, `Files.SelectedOperations.Selected`, always needs admin consent plus a per-file grant by someone with full control of the site, so it doesn't fit picking. Microsoft may also require **publisher verification** (a Microsoft AI Cloud Partner Program account) before people in other organisations can consent; check this before launch.

1. **Register the app** in the Microsoft Entra admin center (App registrations, New registration), in the Client's own tenant. Supported account types: **Accounts in any organizational directory** (multi-tenant), or also personal Microsoft accounts if OneDrive personal is wanted (then set `MICROSOFT_TENANT=common`).
2. **Redirect URIs:** platform **Web**: `<API_BASE_URL>/v1/connections/sharepoint/callback`. For the file picker in the browser, the web team also adds a **Single-page application** redirect URI on the web app's address (the picker gets its own SharePoint token there with MSAL; Microsoft's picker guide adds the SharePoint delegated permission `MyFiles.Read` for that).
3. **Certificates and secrets:** create a client secret and note when it expires (someone must renew it). Microsoft recommends a certificate instead; only a secret is built today.
4. **API permissions** (delegated, Microsoft Graph): `Files.Read`, `offline_access`, `openid`. Add `Files.Read.All` only if you decide SharePoint site files are needed (and set `MICROSOFT_FILES_SCOPE=Files.Read.All`). Add the SharePoint `MyFiles.Read` permission for the picker. An admin can press **Grant admin consent** for the Client's own tenant; customers' admins do the same in theirs if their users can't consent.
5. **Settings:**

| Setting | What goes in it |
|---|---|
| `MICROSOFT_CLIENT_ID` | The Application (client) ID. |
| `MICROSOFT_CLIENT_SECRET` | The secret's value. Never logged. |
| `MICROSOFT_TENANT` | `organizations` (default, work and school only), `common`, `consumers` or one tenant id. |
| `MICROSOFT_FILES_SCOPE` | `Files.Read` (default) or `Files.Read.All`. |
| `SHAREPOINT_MAX_FILES_PER_PULL`, `SHAREPOINT_MAX_FILES_PER_ORG_PER_DAY` | Defaults 10 and 50. |

6. Restart the API and the worker. Try it with a test tenant and fictional files only.

**Removing access:** Microsoft has no simple call for an app to withdraw one person's consent. Disconnecting in Vero deletes our copy of the access; the person removes Vero in My Apps (work or school) or their Microsoft account's privacy settings (personal), or an admin removes it for everyone under Enterprise applications in Entra.

**Not verified yet:** nothing has been sent to the real Microsoft. Every test uses a mocked Microsoft. The web screen that runs the file picker isn't built.
