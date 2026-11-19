# France: what the engine can check, and what it can't yet

> **Update, 16 Nov 2026 (docs/GLOBAL-COVERAGE.md):** a company can now be created in France, as in any country. France is at `registry` level: a scan runs the three French sources below and the International rule pack. There is still no French rule pack, so no French law is checked and the text below on what a lawyer must supply still stands.
>
> **Later on 16 Nov 2026:** there is now a draft French rule pack (`packages/rules/src/packs/fr.ts`, 0.1.0, plus the EU common rules), encoded from `docs/knowledge/vero-scan-france-rule-pack-map.md` and waiting for a lawyer like every pack. It reads the directory and CNIL facts as this page says: a directory miss is "to check", and not being on the CNIL list is never "no DPO".

Written 14 Nov 2026. France is a **second-wave country at the data level only**. The engine can read three official French sources, but France is **not offered to customers**: no one can create a French company, there is no French rule pack, and no score uses French facts. Before France can be offered, a lawyer must supply the legal content (see "What a lawyer must still supply" below).

**Nothing here has been tested against a real response.** Every test uses made-up samples (the fictional "Kestrel Pay SAS", SIREN 123456808, an artificial number that passes the SIREN check). No call was made to any of the three sources: only their documentation was read.

## The three sources

| Source | What it is | How we read it | Setting (all empty, so off, by default) | Tier |
|---|---|---|---|---|
| `fr.recherche_entreprises` | The API Recherche d'entreprises behind the Annuaire des Entreprises (data.gouv / DINUM). Free, no key. | Live, one company at a time, at most 6 requests a second (the published limit is 7 per IP). Waits as long as a 429's Retry-After says. | `FR_RECHERCHE_ENTREPRISES_USER_AGENT`: a plain name for us, such as `VeroScan company checks`. Never a person's details. | 1: "Checked with Annuaire des Entreprises today" |
| `sanctions.lists`, list `fr` | DG Trésor's Registre national des gels: French national, UN and EU asset freezes (people, entities and vessels). | Stored copy, refreshed every 6 hours by `reference.refresh`, like the OFAC, UK and UN lists. | Add `fr` to `SANCTIONS_LISTS`. | 3: an official list |
| `fr.cnil_dpo` | The CNIL's open dataset of organisations that designated a data protection officer (data.gouv.fr, Licence Ouverte 2.0, CSV of about 32 MB, monthly). | Stored copy, refreshed daily by `reference.refresh`. Never downloaded during a scan. | `FR_CNIL_DPO_URL` | 3: "Found on the CNIL DPO list" |

`REFERENCE_REFRESH_ENABLED` works exactly as before: while it is false, neither list is downloaded.

## What each one tells us

**The business directory** (facts under `registry.fr.recherche_entreprises.`): whether we identified the company, its SIREN, registered name, active or ceased, creation and closing dates, legal-form code (INSEE "catégorie juridique"), NAF activity code, company category, staff size band, the head office's postcode and town, how many establishments it has and how many are open, how many directors it has, how many of those are companies, the directors' role titles, and whether the company is only partly published.

- **A miss is not a "no".** Companies that asked not to be listed publicly ("non-diffusibles") and companies whose RCS registration was refused are not in this API. So a miss says "We didn't find this … in the public French business directory. That doesn't mean the company doesn't exist", and the `identified` fact is left unknown (null), never false. Any future rule reading it would come out as "to check".
- **Personal data is dropped before anything is stored.** Directors' names, birth dates and nationalities never leave the parser: we keep only counts and role titles. A sole trader ("entrepreneur individuel", legal category 1000) is a person, so their name and postcode are not kept, and they are never offered as a candidate in a name search.
- A SIREN that fails the check digit is refused without asking anyone ("unsupported", with a plain reason).

**The asset-freeze register**: screened in the same way as the other sanctions lists, on the company name only. Only entities ("Personne morale") and their aliases are kept: people and vessels are skipped, as with OFAC, UK and UN. The stored copy holds entity names and the publication date, nothing about a person. A close name gives "This name is close to an entry on a sanctions list. A person needs to check it." An exact name gives "This name matches an entry on a sanctions list. It may be another business with the same name." Neither ever says "sanctioned". A copy older than `REFERENCE_SANCTIONS_MAX_AGE_HOURS` makes the whole sanctions check unavailable, never "no match".

**The CNIL list** (`registry.fr.cnil_dpo.listed`, `registry.fr.cnil_dpo.designated_on`): whether the company's SIREN is on the list and, where the list gives one, the newest designation date. It is not proof either way. A miss is "We didn't find this SIREN on the CNIL list … That isn't proof there is no DPO", because organisations that didn't enter a SIREN when designating can't be matched. It needs the SIREN, which the business directory provides in the second stage of a scan. The DPOs' names, emails and phone numbers are thrown away while the file is read in pieces: only SIRENs and dates are stored (a few MB at most, not 32 MB). A download over 150 MB or 3 million rows is refused.

## What is not checked

- Nothing about whether a French company complies with anything. There are no French rules, so French facts are evidence only and change no score.
- Not the RCS itself, INPI's Registre national des entreprises (RNE), filings, accounts, beneficial owners (RBE) or the BODACC. Those need the INPI RNE API or the INSEE Sirene API, which need accounts (`docs/ENGINE-ACCOUNTS-AND-KEYS.md`).
- Not the directors themselves: they are counted, never named or screened. Entity directors' names are not screened against sanctions lists either (the existing sanctions check screens only the company name; screening officers would be a new decision).
- Not companies that are not publicly listed.

## What we touched outside the French sources, and what we didn't

- `packages/connectors`: `FR` was added to the countries the sources understand (`ENGINE_JURISDICTIONS`), and a `siren` field to a source request. These are not countries a customer can choose.
- `packages/rules`: only the shared list of fact names (`REGISTRY_FACT_KEYS`), which must match the connectors' list. No rule, pack, weight or score changed.
- `apps/api`: migration `0015_france_reference_lists.sql` lets `reference_data` hold the two new lists; `FR_CNIL_DPO_URL` in the config; the scan pipeline passes a SIREN to the CNIL source in the second stage, only for a company registered in France (which can't exist yet).
- **Not touched:** `MVP_COUNTRIES` and the country pickers, the web app, the company and market tables' country checks (still only US-DE, GB and NG), the questionnaire, the rule packs and the registry search box. Adding France to the search box (`/v1/registry/search`) would mean changing the shared country list the pickers use, so it was left out (see open points).

## What a lawyer must still supply before France can be offered

1. **A French rule pack**: the requirements, in French law, for each layer (company foundations, intellectual property, compliance, contracts, fundraising, AI and data), with the citations, severities and when each applies, approved by the reviewing lawyer. Nothing in the code may say what French law requires until then.
2. **The plain French legal content** for each finding: what is missing, why it matters, what happens if left, and the fix.
3. **Document slots** for France (for example statuts, Kbis extract, registre des bénéficiaires effectifs, DPO designation, CGV/CGU).
4. **Deadlines** (for example annual accounts filing, beneficial-owner updates, any CNIL obligations) and how each is tracked.
5. **Which facts the rules may read** and how a miss should be treated, especially the CNIL list (not proof either way) and the directory (some companies are not public).
6. The questionnaire questions France needs, including asking for the SIREN.

Then, as a separate product step: add `FR` to the database's country checks, the shared country list and the pickers, and write French rules against these facts.

## Open points

1. **CNIL file format not confirmed.** The dataset page doesn't publish the CSV's column names, separator or encoding, and we were not allowed to download it. The reader looks for a column with "siren" in its name that isn't about the DPO, and a date column with "désignation" or "effet", detects `;` or `,`, and refuses the file loudly if it can't tell. The first real download must be checked by a person, and `FR_CNIL_DPO_URL` stays empty until then. The stable data.gouv.fr link (it always points to the latest file) is `https://www.data.gouv.fr/api/1/datasets/r/c5d02b42-1008-4406-83f5-3a81c8b936a3`.
2. **Asset-freeze register.** The address `https://gels-avoirs.dgtresor.gouv.fr/ApiPublic/api/v1/publication/derniere-publication-fichier-json` and the mandatory User-Agent are confirmed by the official structure page and the API's swagger. The JSON shape follows the official JSON schema published with the register (the data.gouv.fr documentation file, served from the DG Trésor API's `schema-json` route, which we read as documentation). No real file has been read. Questions can go to DG Trésor's sanctions team (contact on the register's site).
3. **Name search.** The directory's search is fuzzy. We take a result only when exactly one company has the same name (ignoring SAS, SARL and the like); otherwise we ask for the SIREN. Real results may need tuning.
4. **Registry search box.** France is not in `/v1/registry/search`. That route is uncached; when France is added, cache this free source lightly in memory and keep the 6-a-second limit.
5. **SIREN 123456808** is chosen to look artificial. We could not confirm it is unassigned without querying the register, which we didn't do.
