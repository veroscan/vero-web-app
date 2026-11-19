# Recording real responses from our data sources

When a provider key arrives, this is how to make the first real check of our code against that provider. It takes a few minutes per provider and costs at most one lookup each.

## Why

Our code that reads each provider's answers was written from their documentation and from samples we made ourselves. We have never seen a real answer from most of them. A recording saves one real answer to your computer, with secrets and personal details removed, so our tests can check the code against it from then on.

## Before you start

- Use your own computer, not a server. Recording is switched off in production and refuses to run there.
- Have the key for the provider you want to record. The names of the settings are in `docs/ENGINE-ACCOUNTS-AND-KEYS.md`.
- Pick a company to look up. Your own company, or a well-known public one, is best. Don't use a client's company unless they have agreed.
- For Middesk and Mono, each lookup is paid. Record once, then reuse the recording.

## Steps

1. In the `vero-scan` folder, copy `.env.example` to `.env` if you haven't already.
2. Open `.env` and fill in the key for the one provider you're recording, for example `COMPANIES_HOUSE_API_KEY=...`. Leave `CONNECTOR_MODE=live`.
3. Run one command, choosing the source and the company:

   ```
   npm run connectors:record -- --source uk.companies_house --name "Your Company Ltd" --jurisdiction GB --number 01234567
   ```

   The sources you can record are: `uk.companies_house`, `uk.hmrc_vat`, `us.uspto`, `us.sec_form_d`, `us.delaware_vendor`, `ng.cac_vendor`, `ng.ndpc_list`, `sanctions.lists`, `fr.recherche_entreprises`, `global.gleif`, `eu.vies_vat`, `global.opencorporates`.

   Extra details some sources need:

   | Source | Add |
   |---|---|
   | HMRC VAT | `--vat 123456789` |
   | USPTO trademarks | `--serials 97123456,97123457` |
   | SEC | nothing, or `--cik 0001234567` if you know it |
   | Delaware vendor | `--jurisdiction US-DE`. If you already have a Middesk business id, add `--business <id>` so no new business is created and paid for. |
   | CAC (Nigeria) | `--jurisdiction NG --number <RC number>` |
| Annuaire des Entreprises (France) | `--jurisdiction FR`, and `--siren <9 digits>` for a direct lookup. Needs `FR_RECHERCHE_ENTREPRISES_USER_AGENT` set (a plain name, no key). Use a well-known public French company. |
| National registers without a key (Norway `no.brreg`, Finland `fi.prh`, Czechia `cz.ares`, Poland `pl.krs`, Singapore `sg.acra`) | `--jurisdiction NO` (or `FI`, `CZ`, `PL`, `SG`) and `--registry-number <the national number>`. Needs `PUBLIC_API_USER_AGENT` set (a plain name, no key). Use a well-known listed company. A KRS extract is saved by allowlist (only the fields our code reads), because its free text can name people with their PESEL numbers. |
| French asset-freeze register | `--source sanctions.lists` with `SANCTIONS_LISTS=fr`. The whole register is large, so only its size is saved unless you raise `CONNECTOR_RECORD_MAX_BYTES`. |
| EU sanctions list | `--source sanctions.lists` with `SANCTIONS_LISTS=eu`. About 25 MB, so only its size is saved unless you raise `CONNECTOR_RECORD_MAX_BYTES`. If you do, every entry about a person is replaced whole by `[person]`. The token in its address is replaced by `[secret]` in the saved address. |
| GLEIF (`global.gleif`) | The company's LEI (`lei` in the company details). Needs `PUBLIC_API_USER_AGENT` (a plain name, no key). Any country. Use a large listed company. **The record command doesn't take `--lei` or countries outside its list yet**; until it does, a developer records with `recordOneLookup` directly (that is how the 16 Nov 2026 recording was made). |
| EU VIES VAT check (`eu.vies_vat`) | `--vat <number>` with its country letters, and the company's EU country. Needs `PUBLIC_API_USER_AGENT`. The trader's name and address are replaced by `[redacted]`. Same note on countries as GLEIF. |
| National registers with a key: `dk.cvr`, `au.abr`, `nz.companies`, `ca.corporations`, `nl.kvk`, `ie.cro` | `--jurisdiction DK`, `AU`, `NZ`, `CA`, `NL` or `IE`, and `--registry-number` (CVR, ABN or ACN, NZBN, federal corporation number, KVK number, CRO number). Each needs its own settings (`docs/NATIONAL-REGISTERS.md`). Canada needs the number: its API has no name search. Each KVK profile read is paid. Use a large, well-known company. **Not yet usable from the command:** its country list (`RECORD_JURISDICTIONS` in `scripts/connectors-record.ts`) doesn't include these six countries yet; `recordOneLookup` itself accepts them. |
| OpenCorporates (`global.opencorporates`) | A country with no register source of its own, and `--registry-number` if known. Needs `OPENCORPORATES_API_TOKEN` (paid: each call counts against the allowance). The key is replaced by `[secret]` in the saved address. |

4. The command prints what happened: the result, how many responses it saved, the folder they're in, and the names of the facts it read. It doesn't print the values.

   If the key isn't set, it says so and calls nothing.

5. Check it worked against the saved answer:

   ```
   npm run connectors:replay
   ```

   Every recording should show as passed. If one fails, our code reads that provider's real answer differently from what we expected. Tell the developer, and share the failure message, not the files, until you have checked them (next section).

## What gets saved, and what is safe to share

Recordings go to `packages/connectors/test/recorded/data/<source>/<date and time>/`. To save them somewhere else, set `CONNECTOR_RECORD_DIR` in `.env`. Each folder has one file per response (`001.json`, `002.json`, ...) and a `manifest.json` saying what was asked.

**Never saved:** your keys, tokens and passwords; anything we sent in request headers (that's where keys and the SEC contact address go); what we sent in request bodies; cookies.

**Removed before saving** (the redaction rule):

- anything that looks like a key, token, secret or password, in the answer or in the web address;
- email addresses, phone numbers, fax numbers, dates and places of birth, nationality, residence, BVN, NIN, SSN and passport numbers, street address lines, premises and PO boxes;
- the names of people, where the answer marks a record as a person (for example a director);
- for the French sources, everything inside a record about a person: a director marked "personne physique" (name, first names, birth year and month, nationality), a sole trader, or a person on the asset-freeze register. Only the labels saying what kind of record it is stay;
- for the EU sanctions list, every entry whose subject type is "person", whole (names, birth dates, citizenship, addresses, identity documents);
- for GLEIF, everything inside a sole trader's record (category `SOLE_PROPRIETOR`); for VIES, the trader's name and address; for OpenCorporates, each officer's name and address, and every company's full registered address;
- for the national registers with a key (Denmark CVR, ABN Lookup, NZBN, Corporations Canada, KVK), everything inside a record about a person: a CVR participant or sole proprietorship, an ABN individual, an NZBN sole trader, a KVK eenmanszaak, or a KVK search row with no RSIN; directors' name and address blocks (`rolePerson`, `roleAddress`, `serviceAddress`); and the ABN Lookup GUID in the web address;
- very large answers, such as whole sanctions lists, are not saved at all, only their size.

**Kept, because our code needs them and they are public records about companies:** company names and numbers, registered office postcodes, statuses, filing dates, and the company details you typed into the command.

**Before you share a recording, open every file in its folder and read it.** The redaction is careful, but it can't know every way a provider might include a person's details. If you see a person's name, email, phone number or home address, delete that folder and tell the developer which source it came from, so the rule can be tightened. Don't paste recordings into chat tools or tickets: put them in the repository, where the developer can review them.

**Once checked, they are safe to share with the development team** through the repository. The manifest names the settings you used (for example `COMPANIES_HOUSE_API_KEY`), never their values.

## Afterwards

- Remove the key from `.env` if this computer shouldn't keep it.
- Recording only happens when you run `npm run connectors:record`, or when `CONNECTOR_RECORD_DIR` is set while the API runs locally. Leave `CONNECTOR_RECORD_DIR` empty the rest of the time.
- Update the "Tested against a real recorded response" column in `docs/ENGINE-STATUS.md` for that source.

## For developers

- Code: `packages/connectors/src/record.ts` (recording, the redaction rule, sessions, replay fetch) and `record-run.ts` (one lookup with a manifest). The rule is also written at the top of `record.ts`, and the two must stay the same.
- `createConnectors` wraps each provider's fetch when `CONNECTOR_RECORD_DIR` is set, and throws `RecordModeRefusedError` under `NODE_ENV=production`. The API config also refuses to start in production with it set.
- The ICO register (a local file) and the website scan (the company's own site, through its own SSRF-safe transport) aren't recorded. Nor is `fr.cnil_dpo`: it reads only the copy the refresh job stores (SIRENs and dates, no DPO contact details), so there is no provider response to record. To check its parser, a person should download the CSV once by hand, read its header line and compare it with `cnilColumns` in `packages/connectors/src/sources/fr-cnil-dpo.ts`; don't commit the file, it holds DPOs' contact details.
- The harness is `packages/connectors/test/recorded/replay.test.ts`. For each session it serves the saved responses to the connector, with dummy keys, and checks the same status, the same fact names, only published fact names, and no request that wasn't recorded. It is skipped, with a message, when there are no recordings.
