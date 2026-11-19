# Vero Scan — Germany Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 18 November 2026
**Sources:** Official legislation, government and regulator pages only (gesetze-im-internet.de, recht.bund.de, EUR-Lex, transparenzregister.de, Bundesverwaltungsamt, BfDI, ELSTER, DPMA). Each line gives its URL and the date checked. Secondary sources (law-firm notes, vendor blogs, search-engine summaries) were used only to find the official page and are never cited.
**Company form covered:** Gesellschaft mit beschränkter Haftung (GmbH), and its variant the Unternehmergesellschaft (haftungsbeschränkt) (UG) where the rules differ. AGs are out of scope.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Lines marked **[verify]** must not be encoded as a pass/fail rule until the uncertainty named on the line is resolved. Rules common to every EU country (GDPR, ePrivacy, e-commerce, consumer, VAT, beneficial ownership, AI Act, accessibility, accounts, prospectus, EU trade mark) are in `vero-scan-eu-common-rule-pack-map.md`; this map adds only what is German and points to the EU map as "EU Section N".

**Germany is an EU member state.** EU regulations (GDPR, AI Act, AMLR from 10 Jul 2027, Prospectus Regulation, EUTM Regulation) apply directly; directives reach a German company through the German act named on each line. Unlike the Norway map, no line needs an EEA incorporation check.

**How sources were read.** Statutes were read on gesetze-im-internet.de on 18 Nov 2026 in the version the site showed that day. Our reader returns a summary of each page with short quotes, not the full text; where a figure or date on a line rests on that reading it is from the section named. The site did not show a "Stand" (last amendment) line to our reader, so the version date of each act is not recorded. handelsregister.de could not be read by our tool on 18 Nov 2026.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every German GmbH (and UG) at that stage |
| ALL (GmbH) / ALL (UG) | Only the full GmbH, or only the UG (haftungsbeschränkt) |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or freelancers |
| CONSUMER | Sells to consumers (B2C) |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| INVESTED | Has raised or is raising |
| SECTOR.PAYMENTS, .EMONEY, .CRYPTO, .CREDIT, .INVESTMENT | Sector packs (BaFin licences), triggers only |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a document slot) · 5 attested (vault). Routes follow the *Verification Solutions Matrix* (`docs/knowledge/vero-scan-verification-solutions.md`).

**[verify]** means: not confirmed from an official source on 18 Nov 2026. The line says exactly what is uncertain. A threshold, deadline or section number marked [verify] is a lead, not a fact.

**Source column.** "checked 18 Nov 2026" appears only where the page was read on that day. A page our tool could not read is marked **[verify]: official page not readable by our tool on 18 Nov 2026**.

### Engine facts available for Germany

**No free official German register fact exists.** The engine cannot read the Handelsregister, the Unternehmensregister or the Transparenzregister itself (lawyer note 1). Since 18 Nov 2026 it can read the Handelsregister through OpenRegister, a paid licensed provider (Tier 2, lawyer note 2): source `de.openregister`, off until `OPENREGISTER_API_KEY` is set, built from the public docs and not yet tried against a real reply. A miss (`identified` = null) means "not found through this provider", never "does not exist". Every other register item stays a document slot (Tier 4) or an attestation (Tier 5).

| Fact key(s) | What it can show | What it cannot show |
|---|---|---|
| `registry.de.openregister.identified`, `company_id`, `registered_name`, `register_type`, `register_number`, `register_court` | The company is in the Handelsregister, with its register (HRB), number and court, as OpenRegister reports it (Tier 2) | Anything the provider has not copied yet; the source is a vendor, not the court |
| `registry.de.openregister.status`, `terminated_on`, `insolvency_open` | OpenRegister's status word (active, inactive, liquidation), an end date, and open insolvency proceedings | Why; whether the provider's words match the register's own entries (unconfirmed until a real reply) |
| `registry.de.openregister.legal_form`, `capital_amount`, `capital_currency` | Legal form (gmbh, ug, ...) and registered capital | That the capital is paid in |
| `registry.de.openregister.directors_count`, `directors_entity_count` | How many current managing directors, and how many are organisations | Names, residence or eligibility (never kept) |
| `registry.de.openregister.incorporated_on`, `city` | Registration date and the city of the business address | The street address (not kept) |
| `registry.eu.vies_vat.valid` | The company's USt-IdNr is valid in VIES on that date (Germany is in VIES) | That returns are filed or VAT is paid. Needs the company's VAT number |
| `registry.global.gleif.*` | The LEI record, if any | Anything about German law. Most startups have no LEI: a miss means nothing |
| `registry.sanctions.match`, `possible_match`, `lists_checked` | Company name screened against the stored sanctions lists | That the company is or is not sanctioned (a person must check). Directors and owners are not screened |
| `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `retention_statement`, `transfers_section`, `dpo_contact`, `children_section` | Privacy notice published, names the company, has the matching sections | Legal adequacy under the GDPR and BDSG |
| `web.policy.dpa_named` | The notice names a data protection authority the scan knows (the 16 Länder DPAs and the BfDI) | That it is the competent authority for this company |
| `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count`, `cookie_policy_found` | Consent tool present; non-essential cookies or trackers before any choice; cookie policy exists | Whether "reject" is as easy as "accept"; whether consent is stored |
| `web.policy.terms_found`, `refund_policy_found`, `complaints_policy_found`, `accessibility_found`, `ai_disclosure_found` | The page exists | That its content is complete or lawful |
| `web.policy.legal_notice_present` | An Impressum / legal notice page was found | That it holds every DDG §5 item |
| `web.policy.registration_number_shown` | A register number is shown on the site | That it is the company's own number (no register fact to compare it with) |
| `web.policy.language_supported` | True when the scan reads the site's language; German is read | Nothing about compliance; when false, every text miss is "to check" |
| `github.*` | Repository licence files and dependency manifests, if GitHub is connected | Who owns the code |

**Not available for Germany:** filed accounts, the shareholder list and beneficial owners (no source reads them), DPMA trade mark facts and BaFin register facts.

---

## 2. Notes for the reviewing lawyer

1. **No free official register API.** HGB §9(1), read on 18 Nov 2026, lets anyone inspect the Handelsregister "durch einzelne Abrufe" (individual retrievals) through the portal the Länder run; the section mentions no bulk or API access. We found no public API documentation for handelsregister.de or unternehmensregister.de. handelsregister.de refused our reader on 18 Nov 2026, so the portal's terms of use could not be read: a search engine showed an extract of those terms saying more than 60 retrievals an hour are not allowed and a user ID may be disabled, and a portal FAQ extract saying automated mass queries can meet §§303a, 303b StGB. Both are **[verify]** until the official page is read. We did not automate or test the portal.
2. **OpenRegister (openregister.de) is a paid licensed vendor (Tier 2), with public docs.** Read on 18 Nov 2026 (vendor pages, not law): docs at https://docs.openregister.de (index https://docs.openregister.de/llms.txt, OpenAPI spec at /openapi.yml); base URL `https://api.openregister.de`; auth header `Authorization: Bearer <API key>`; company search `GET /v1/autocomplete/company?query=` (1 credit) and `POST /v1/search/company` (10 credits); company details `GET /v1/company/{company_id}` (10 credits, 20 with `realtime=true`, which fetches live from the Handelsregister), id format like `DE-HRB-F1103-267645`. Detail fields: `status` (active / inactive / liquidation), `register.register_number`, `register.register_type` (HRB etc.), `register.register_court`, `legal_form` (gmbh, ug, ...), `capital` (amount, currency, start_date), `address`, `representation[]` (name, role, start/end dates, authority: a managing-director count can be derived, names must not be stored), `incorporated_at`, `terminated_at`, `insolvencies`, `documents`. Pricing: Free 500 credits a month (no card), Pro 5,000, Business 30,000, extra credits EUR 0.01; monthly plan fees were not shown on the docs page and openregister.de/pricing refused our reader. Sign-up: https://openregister.de, keys at https://openregister.de/keys. We did not sign up or call the API. A `registry.de.*` source built on it would sit at Tier 2.
3. **Transparenzregister: no public machine-readable access.** GwG §23 limits access to authorities, obliged entities (case by case) and people who prove a legitimate interest; the register's help page says that right was restricted after the CJEU ruling of 22 Nov 2022 (C-37/20, C-601/20). The only automated route (the "Einsichtnahmeschnittstelle") is for authorities and certain obliged entities with accredited software. So beneficial ownership stays a document slot.
4. **Mitteilungsfiktion abolished.** The Bundesverwaltungsamt page (dated 18 Aug 2021) and the register's help page say the deemed-reporting rule in former GwG §20(2) fell away on 1 Aug 2021; the register is now a full register and every GmbH and UG must report its beneficial owners itself (former transition deadline for GmbHs: 30 Jun 2022).
5. **No official list of DPOs.** GDPR Art 37(7) notifications go to the competent Land authority; we found no official public or machine-readable list of designated DPOs in Germany **[verify]**: absence not stated on any official page we read.
6. **Thresholds confirmed from current text:** minimum capital EUR 25,000 (GmbHG §5(1)); a quarter of each share and in total half the minimum capital paid before registration (GmbHG §7(2)); UG paid in full (GmbHG §5a(2)); accounts submitted within one year of the balance-sheet date (HGB §325(1a)); small EUR 7.5m / 15m / 50 and micro EUR 450,000 / 900,000 / 10 (HGB §§267, 267a); DPO from 20 persons (BDSG §38(1)); Kleinunternehmer EUR 25,000 prior year / EUR 100,000 current year (UStG §19(1)); minimum wage EUR 13.90 from 1 Jan 2026 (MiLoV5 §1); VSBG statement exemption at 10 or fewer employees on 31 Dec of the previous year (VSBG §36).
7. **Employee data (BDSG §26).** The section is on gesetze-im-internet.de as current text. The CJEU held on 30 Mar 2023 (C-34/21) that national employment-data rules which fail GDPR Art 88(2) must be disapplied; whether that disapplies BDSG §26(1) sentence 1 (worded like the Hesse rule in that case) is our reading **[verify]**.
8. **Online dispute resolution.** Regulation (EU) 2024/3228 repealed the ODR Regulation (EU) No 524/2013 from 20 Jul 2025. That the trader's duty to link to the ODR platform ended with it is our reading **[verify]**: the old Art 14 was not read, nor whether any German provision still refers to it.
9. **AI.** The KI-MIG names the Bundesnetzagentur as the default AI Act market surveillance authority (§2(1)), with BaFin for regulated finance. Its date of entry into force (29 Jul 2026 per secondary sources) was not shown on the official page our reader saw **[verify]**.
10. **Missing engine facts** that would raise Tier 4/5 lines to Tier 1 or 2: a Handelsregister source (status, legal form, capital, managing directors, register number), a filed-accounts date from the Unternehmensregister, and a check of each DDG §5 item on the Impressum page.

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| GmbH entered in the Handelsregister of the court for its seat | 1 | S2 | ALL | 4 | Slot: current Handelsregister extract (aktueller Ausdruck). No German register fact exists. Registration is filed with the register court for the district of the company's seat | GmbHG §7(1): https://www.gesetze-im-internet.de/gmbhg/__7.html, checked 18 Nov 2026 |
| Registration filing with articles, director appointment and shareholder list | 1 | S2 | ALL | 4 | Slot: same extract. The filing attaches the articles, proof of the managing directors' appointment, a signed shareholder list (§40) and, for contributions in kind, the contracts and valuation evidence. Directors assure the capital is paid and at their free disposal, and declare they are not disqualified | GmbHG §8(1) to (3): https://www.gesetze-im-internet.de/gmbhg/__8.html, checked 18 Nov 2026 |
| Domestic business address (inländische Geschäftsanschrift) on the register | 1 | S2 | ALL | 4 | Slot: same extract. The filing must state a business address in Germany and the type and scope of the directors' power of representation | GmbHG §8(4), checked 18 Nov 2026 |
| Legal-form suffix "Gesellschaft mit beschränkter Haftung" or a recognisable abbreviation in the name | 1 | S2 | ALL (GmbH) | 5 | Attestation. No legal-form fact exists; `web.policy.names_company` shows only that the notice names the company | GmbHG §4: https://www.gesetze-im-internet.de/gmbhg/__4.html, checked 18 Nov 2026 |
| UG name "Unternehmergesellschaft (haftungsbeschränkt)" or "UG (haftungsbeschränkt)" | 1 | S2 | ALL (UG) | 5 | Attestation. Required where the capital is below the §5(1) minimum, in place of the GmbH suffix. A UG that raises its capital to EUR 25,000 may keep the name | GmbHG §5a(1), (5): https://www.gesetze-im-internet.de/gmbhg/__5a.html, checked 18 Nov 2026 |
| Company status: active, not dissolved, in liquidation or insolvent | 1 | S2 | ALL | 4 | Slot: current Handelsregister extract. No engine fact. The legal grounds for dissolution and the insolvency filing duty are not mapped **[verify]**: GmbHG §60 and the Insolvenzordnung not read | **[verify]**: GmbHG §60 and InsO not read |
| Company particulars on business letters and order forms | 1 | S2 | ALL | 5 | Attestation. Legal form, seat, register court, register number, all managing directors' names, supervisory board chair if any; share capital only if capital is mentioned, with any unpaid cash contributions. Order forms always count. Refer to "EU Section 3 — E-commerce information duties" (Directive 2017/1132 art 26) | GmbHG §35a(1) to (3): https://www.gesetze-im-internet.de/gmbhg/__35a.html, checked 18 Nov 2026 |
| Register status read through OpenRegister (licensed vendor) | 1 | S2 | ALL | 2 | `registry.de.openregister.status`, `terminated_on`, `insolvency_open`. Active passes. Any other status, an end date or open insolvency proceedings go to a person: the provider's words are unconfirmed until a real reply, so nothing it says is called a problem on its own. Off until its key is set | https://docs.openregister.de/endpoint/company.md, checked 18 Nov 2026 (vendor documentation, not law) |
| Company name screened against sanctions lists | 3 | S2 | ALL | 3 | `registry.sanctions.match`, `possible_match`, `lists_checked`. International pack item; Germany's own sanctions and export-control rules are not mapped here **[verify]** | `docs/GLOBAL-COVERAGE.md` (engine behaviour, not law) |
| Handelsregister open to anyone by individual retrievals | 1 | — | — | — | Note: anyone may inspect the register and filed documents "durch einzelne Abrufe" through the Länder portal. The section names no bulk or API access. Explains why there is no free German register fact | HGB §9(1): https://www.gesetze-im-internet.de/hgb/__9.html, checked 18 Nov 2026 |
| Portal terms cap retrievals (60 an hour reported) | 1 | — | — | — | Note: a 60-per-hour cap, a bar on systematic retrieval to build parallel registers and IP blocking were seen only in search-engine extracts of the portal's terms and FAQ. Do not automate the portal **[verify]** | **[verify]**: https://www.handelsregister.de/rp_web/nutzungsordnung.do: official page not readable by our tool on 18 Nov 2026 |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Articles of association (Gesellschaftsvertrag) in notarial form, signed by all shareholders | 1 | S2 | ALL | 4 | Slot: notarised articles. Simplified procedure with the model protocol (Musterprotokoll) for at most three shareholders and one managing director; the model protocol also serves as the shareholder list. Notarisation by video is allowed | GmbHG §2(1), (1a), (3): https://www.gesetze-im-internet.de/gmbhg/__2.html, checked 18 Nov 2026 |
| Amendments to the articles by three-quarters of votes cast, notarised | 1 | event-driven | ALL | 4 | Slot: notarised shareholder resolution. The articles may add requirements; increasing shareholders' obligations needs every affected shareholder's consent | GmbHG §53: https://www.gesetze-im-internet.de/gmbhg/__53.html, checked 18 Nov 2026 |
| Stammkapital of at least EUR 25,000 | 1 | S2 | ALL (GmbH) | 2 / 4 | `registry.de.openregister.capital_amount`, `capital_currency`, `legal_form` (Tier 2), or Slot: Handelsregister extract or articles. Share nominal amounts in whole euros; they may differ; their total equals the Stammkapital | GmbHG §5(1) to (3): https://www.gesetze-im-internet.de/gmbhg/__5.html, checked 18 Nov 2026 |
| Paid in before filing: a quarter of each share, and EUR 12,500 in total | 1 | S2 | ALL (GmbH) | 5 | Attestation; the directors' assurance in the filing (§8(2)) is the evidence. Cash paid plus shares for contributions in kind must reach half the §5(1) minimum. Contributions in kind are made in full before filing | GmbHG §7(2), (3), checked 18 Nov 2026 |
| UG capital paid in full, no contributions in kind, a quarter of annual surplus to a reserve | 1 | S2 | ALL (UG) | 5 | Attestation. The reserve takes a quarter of each year's surplus less any loss carried forward; shareholders' meeting called without delay if insolvency threatens; these rules end once capital reaches EUR 25,000 | GmbHG §5a(2) to (5), checked 18 Nov 2026 |
| Shareholder list (Gesellschafterliste) filed after every change | 1 | event-driven | ALL | 4 | Slot: latest shareholder list from the register. Managing directors file it without delay after each change in shareholders or stakes: identity, nominal amounts, share numbers, percentage. Where a notary took part, the notary files it. Directors are liable for breach | GmbHG §40(1) to (3): https://www.gesetze-im-internet.de/gmbhg/__40.html, checked 18 Nov 2026 |
| Share transfer and agreement to transfer in notarial form | 1 | event-driven | ALL | 4 | Slot: notarial deed. An informal agreement to transfer is cured by a notarised transfer | GmbHG §15(3), (4): https://www.gesetze-im-internet.de/gmbhg/__15.html, checked 18 Nov 2026 |
| Beneficial owners reported to the Transparenzregister without undue delay | 1 | S2 | ALL | 4 | Slot: confirmation of the company's own Transparenzregister entry. Obtain, keep, update and report electronically, "unverzüglich" (no fixed day count). The deemed reporting from other registers ended on 1 Aug 2021: every GmbH and UG reports itself. No engine fact: the register is not public. Refer to "EU Section 6 — Beneficial ownership (AML)" | GwG §20(1): https://www.gesetze-im-internet.de/gwg_2017/__20.html, checked 18 Nov 2026; BVA: https://www.bva.bund.de/DE/Das-BVA/Aufgaben/T/Transparenzregister/_documents/Allgem_transparenz_kachel.html, checked 18 Nov 2026; https://www.transparenzregister.de/treg/hilfe, checked 18 Nov 2026 |
| Data held on each beneficial owner | 1 | — | — | — | Note for rule text: first and last name, date of birth, place of residence, nature and extent of the economic interest, all nationalities | GwG §19(1): https://www.gesetze-im-internet.de/gwg_2017/__19.html, checked 18 Nov 2026 |
| Beneficial owner test: more than 25% of capital or votes, or control | 1 | — | — | — | Note: the register's help page says shareholders above 25% must give their details to the directors. The statutory definition (GwG §3) was not read **[verify]** | https://www.transparenzregister.de/treg/hilfe, checked 18 Nov 2026; **[verify]**: GwG §3 not read |
| Transparenzregister closed to the public | 1 | — | — | — | Note: access for authorities, obliged entities case by case, and people proving a legitimate interest (limited data). Restricted further after the CJEU ruling of 22 Nov 2022. Automated access only for authorities and certain obliged entities with accredited software. Explains why this stays Tier 4 | GwG §23: https://www.gesetze-im-internet.de/gwg_2017/__23.html, checked 18 Nov 2026; https://www.transparenzregister.de/treg/hilfe, checked 18 Nov 2026 |
| EU UBO rules | 1 | — | — | — | Refer to "EU Section 6 — Beneficial ownership (AML)". The AML Regulation applies directly in Germany from 10 Jul 2027 | EU common map |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Managing directors keep proper books | 1 | S2 | ALL | 5 | Attestation | GmbHG §41: https://www.gesetze-im-internet.de/gmbhg/__41.html, checked 18 Nov 2026 |
| Accounts and management report prepared within 3 months (small company: 6 months) | 1 | S2 (annual) | ALL | 5 | Attestation. Balance sheet, income statement and notes. Small companies need no management report and may prepare later in line with proper practice, at the latest within 6 months; micro companies may skip the notes if the details go below the balance sheet | HGB §264(1): https://www.gesetze-im-internet.de/hgb/__264.html, checked 18 Nov 2026 |
| Size classes: small up to EUR 7.5m balance sheet, EUR 15m turnover, 50 employees | 1 | — | ALL | — | Note for rule text: small if at or below two of the three; medium up to EUR 25m, EUR 50m, 250; large above. Applies once crossed on two consecutive balance-sheet dates, or on the first date after formation | HGB §267(1) to (4): https://www.gesetze-im-internet.de/hgb/__267.html, checked 18 Nov 2026 |
| Micro company (Kleinstkapitalgesellschaft): EUR 450,000 balance sheet, EUR 900,000 turnover, 10 employees | 1 | — | ALL | — | Note: at or below two of the three. Pure holding and investment companies excluded | HGB §267a(1), (3): https://www.gesetze-im-internet.de/hgb/__267a.html, checked 18 Nov 2026 |
| Shareholders adopt the accounts within 8 months (small company: 11 months) | 1 | S2 (annual) | ALL | 4 | Slot: shareholders' resolution adopting the accounts and the use of profit. Directors present the accounts without delay after preparation (or after the audit report). The articles cannot extend the deadline | GmbHG §42a(1), (2): https://www.gesetze-im-internet.de/gmbhg/__42a.html, checked 18 Nov 2026; GmbHG §46 no. 1: https://www.gesetze-im-internet.de/gmbhg/__46.html, checked 18 Nov 2026 |
| Accounts submitted to the Unternehmensregister within 12 months of year end | 1 | S2 (annual) | ALL | 4 | Slot: submission confirmation. Electronic, in German; at the latest one year after the balance-sheet date. No engine fact: filed accounts are not read | HGB §325(1), (1a): https://www.gesetze-im-internet.de/hgb/__325.html, checked 18 Nov 2026 |
| Small and micro filing relief: balance sheet (and notes) only, micro may deposit | 1 | S2 (annual) | ALL (small or micro) | — | Note: small companies file the balance sheet and notes only; micro companies file the balance sheet only and may choose permanent deposit (Hinterlegung) after notifying that they meet the micro test | HGB §326: https://www.gesetze-im-internet.de/hgb/__326.html, checked 18 Nov 2026 |
| Statutory audit for companies that are not small | 1 | S3 (annual) | ALL (medium or large) | 4 | Slot: auditor's report. Without the audit the accounts cannot be adopted | HGB §316(1): https://www.gesetze-im-internet.de/hgb/__316.html, checked 18 Nov 2026 |
| First financial year for the raised 2024 size thresholds | 1 | — | ALL | — | Note: the figures above are the current text. The transitional rule saying from which financial year they apply (EGHGB) was not read **[verify]** | **[verify]**: EGHGB not read |
| EU accounts and company-law directives | 1 | — | — | — | Refer to "EU Section 9 — Company law and accounts". Carried in Germany by the HGB and GmbHG | EU common map |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| One or more managing directors (Geschäftsführer), each a natural person with full capacity | 1 | S2 | ALL | 2 / 4 | `registry.de.openregister.directors_count` (Tier 2), or Slot: Handelsregister extract (directors are registered). Shareholders may be directors | GmbHG §6(1), (3): https://www.gesetze-im-internet.de/gmbhg/__6.html, checked 18 Nov 2026 |
| Disqualification of managing directors (convictions, professional bans) | 1 | S2 | ALL | 5 | Attestation per director. Barred: people under a court-ordered financial consent requirement, under a matching professional ban, or sentenced to at least one year for listed offences (five years from the judgment); comparable EU/EEA and foreign decisions count. Each director declares this in the filing | GmbHG §6(2): checked 18 Nov 2026; GmbHG §8(3), checked 18 Nov 2026 |
| Director changes filed for the Handelsregister | 1 | event-driven | ALL | 4 | Slot: updated extract. Every change and every end of power to represent is filed with the appointment or removal documents; new directors give the §6(2) declaration | GmbHG §39: https://www.gesetze-im-internet.de/gmbhg/__39.html, checked 18 Nov 2026 |
| Joint representation unless the articles say otherwise | 1 | — | ALL | — | Note: directors represent the company in and out of court; several directors act jointly by default; with no director the shareholders receive declarations | GmbHG §35(1), (2): https://www.gesetze-im-internet.de/gmbhg/__35.html, checked 18 Nov 2026 |
| No residency or nationality rule for managing directors | 1 | S2 | ALL | — | Note: none in §6 as read. That no other provision sets one is **[verify]**: rest of the GmbHG not read | GmbHG §6, checked 18 Nov 2026; **[verify]**: rest of act not read |
| One-third employee supervisory board above 500 employees | 1 | S5 | EMPLOYEES (usually more than 500) | 5 | Attestation; trigger only. Statutory exemptions in §1(2) not mapped | DrittelbG §1(1) no. 3: https://www.gesetze-im-internet.de/drittelbg/__1.html, checked 18 Nov 2026 |
| Parity co-determination above 2,000 employees | 1 | S5 | EMPLOYEES (usually more than 2,000) | — | Trigger only | MitbestG §1(1): https://www.gesetze-im-internet.de/mitbestg/__1.html, checked 18 Nov 2026 |
| Works council electable from 5 permanent employees | 3 | S3 | EMPLOYEES (5 or more) | — | Note: employees may elect a works council where at least 5 permanent voting employees work, 3 of them eligible. Not a duty on the company to create one | BetrVG §1(1): https://www.gesetze-im-internet.de/betrvg/__1.html, checked 18 Nov 2026 |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Employee must report a service invention separately, in text form | 2 | S2 | EMPLOYEES | 5 | Attestation; Slot for the invention policy if relied on. Report without undue delay; employer confirms receipt; an incomplete report counts as proper unless the employer objects within 2 months | ArbnErfG §5: https://www.gesetze-im-internet.de/arbnerfg/__5.html, checked 18 Nov 2026 |
| Service invention deemed claimed 4 months after a proper report | 2 | S2 | EMPLOYEES | 5 | Attestation. The claim is made by declaration, and is deemed made unless the employer releases the invention in text form within 4 months of the proper report | ArbnErfG §6: https://www.gesetze-im-internet.de/arbnerfg/__6.html, checked 18 Nov 2026 |
| Software written by employees: the employer holds all economic rights | 2 | S2 | EMPLOYEES | 5 | Attestation. Applies to programs made in performing duties or on the employer's instructions, unless agreed otherwise; also to service relationships | UrhG §69b: https://www.gesetze-im-internet.de/urhg/__69b.html, checked 18 Nov 2026 |
| Contractors and founders grant rights in writing | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Slot: IP assignment or exclusive licence agreement. ArbnErfG covers employees and §69b covers employment and service relationships; that no statutory transfer reaches freelancers and founders is our reading **[verify]** | Same acts, checked 18 Nov 2026 |
| German trade mark at the DPMA: 10 years from filing, renewable | 2 | S2 | ALL | 4 | Slot: DPMA registration certificate. Renewal by 10 years on payment of the fee; file in the 6 months before expiry, with 6 months' grace after; the DPMA reminds at least 6 months before. Online fee EUR 290 for up to 3 classes | MarkenG §47: https://www.gesetze-im-internet.de/markeng/__47.html, checked 18 Nov 2026; https://www.dpma.de/marken/index.html, checked 18 Nov 2026 |
| EU trade mark as the alternative | 2 | — | — | — | Note: refer to "EU Section 11 — EU trade mark" (covers Germany) | EU common map |

### Section 6 — Data protection and cookies

GDPR duties are in "EU Section 1 — GDPR"; cookie consent in "EU Section 2 — ePrivacy and cookies". German specifics:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| GDPR applies directly; the BDSG supplements it | 3 | S2 | PERSONAL_DATA | — | Refer to "EU Section 1 — GDPR". The BDSG uses GDPR openings (for example §38 on DPOs, §26 on employees) | BDSG: https://www.gesetze-im-internet.de/bdsg_2018/__38.html, checked 18 Nov 2026 |
| Privacy notice published, read in German | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `retention_statement`, `transfers_section`. `web.policy.language_supported` is true for German; if false, a miss is "to check" | EU common map, EU Section 1 |
| Notice names the competent German supervisory authority | 3 | S2 | WEBSITE / APP, PERSONAL_DATA | 1 | `web.policy.dpa_named`. For most private companies the competent authority is the Land authority; the BfDI supervises companies only for telecoms and postal services (and security-clearance data). A person checks the right Land is named | BfDI: https://www.bfdi.bund.de/DE/Buerger/Inhalte/Allgemein/Datenschutz/Zust%C3%A4ndigkeit-BfDI.html, checked 18 Nov 2026 |
| Children's consent: age 16 for information society services | 3 | S2 | CONSUMER (services offered to children) | 1 / 5 | `web.policy.children_section` shows a children section exists; the consent flow is attestation. Parents consent until the child's 16th birthday (GDPR Art 8 default kept) | BfDI: https://www.bfdi.bund.de/DE/Service/Inhalte/Flyer/Kinderschutz/7-Verantwortlichkeit.html, checked 18 Nov 2026 |
| DPO where 20 or more persons regularly process personal data by automated means | 3 | S2 | PERSONAL_DATA | 5 + 1 | Attestation; `web.policy.dpo_contact`. Regardless of head count also where a DPIA is required, or where data is processed commercially for transfer, anonymised transfer or market research. Supplements GDPR Art 37(1)(b), (c) | BDSG §38(1): https://www.gesetze-im-internet.de/bdsg_2018/__38.html, checked 18 Nov 2026 |
| No public list of designated DPOs | 3 | — | — | — | Note: Art 37(7) contact details go to the competent Land authority; no official public or machine-readable list found **[verify]** | **[verify]**: no official page states this |
| DPIA required for operations on the DSK list | 6 | S2 | PERSONAL_DATA (high risk), AI | 5 | Vault. The DSK (federal and Länder authorities) adopted one list for the non-public sector under GDPR Art 35(4), published on the BfDI site | BfDI: https://www.bfdi.bund.de/DE/Fachthemen/Inhalte/Technik/Datenschutz-Folgenabschaetzungen.html, checked 18 Nov 2026 |
| Records, processor agreements, breach notification | 3 / 6 | S2 | PERSONAL_DATA | 5 | Attestation; refer to EU Section 1 | EU common map |
| Cookie consent under TDDDG §25 | 3 | S2 | WEBSITE / APP | 1 | `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count` = 0, `cookie_policy_found`. Consent on clear and comprehensive information, to the GDPR standard. Exceptions: storage solely to transmit a message, or strictly necessary for a digital service the user expressly asked for. The act is now titled TDDDG (formerly TTDSG). Refer to EU Section 2 | TDDDG §25: https://www.gesetze-im-internet.de/ttdsg/__25.html, checked 18 Nov 2026 |
| Processing employee data for employment purposes (BDSG §26) | 3 | S2 | EMPLOYEES | 5 | Attestation. Processing as necessary for hiring, running or ending employment; consent judged against the employee's dependence, normally in writing or electronic form with notice of the right to withdraw; works council rights unaffected | BDSG §26: https://www.gesetze-im-internet.de/bdsg_2018/__26.html, checked 18 Nov 2026 |
| CJEU C-34/21 and the reach of BDSG §26(1) | 3 | — | EMPLOYEES | — | Note: on 30 Mar 2023 the Court held that national employment-data rules failing GDPR Art 88(2) are not "more specific rules" and must be disapplied unless they are a valid Art 6(3) legal basis. That this disapplies BDSG §26(1) sentence 1 is our reading **[verify]** | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62021CJ0034, checked 18 Nov 2026 |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Tax registration questionnaire within one month of starting business | 3 | S2 | ALL | 4 | Slot: tax office letter giving the Steuernummer. Notify the opening within one month; the further tax details go electronically in the official data set (paper only on application for hardship). ELSTER's "Fragebogen zur steuerlichen Erfassung: Gründung einer Kapitalgesellschaft" covers GmbH and UG | AO §138(1), (1b), (4): https://www.gesetze-im-internet.de/ao_1977/__138.html, checked 18 Nov 2026; https://www.elster.de/eportal/formulare-leistungen/alleformulare/fsekapg, checked 18 Nov 2026 |
| VAT ID (USt-IdNr) issued by the BZSt on application | 3 | S3 | ALL (VAT-registered) | 1 | `registry.eu.vies_vat.valid` (needs the number). The Bundeszentralamt für Steuern issues it on a written application giving name, address and tax number. Refer to "EU Section 5 — VAT" | UStG §27a(1): https://www.gesetze-im-internet.de/ustg_1980/__27a.html, checked 18 Nov 2026 |
| Small-business VAT exemption (Kleinunternehmer): EUR 25,000 prior year and EUR 100,000 current year | 3 | S3 | ALL (optional) | 5 | Attestation. Total turnover not above EUR 25,000 in the previous calendar year and not above EUR 100,000 in the current year. Not using it is not a gap | UStG §19(1): https://www.gesetze-im-internet.de/ustg_1980/__19.html, checked 18 Nov 2026 |
| VAT advance returns by the 10th day; quarterly by default, monthly above EUR 9,000 | 3 | S3 | ALL (VAT-registered) | 5 | Attestation. Electronic; the tax office may waive advance returns if the previous year's tax was not above EUR 2,000; annual return as well | UStG §18(1), (2): https://www.gesetze-im-internet.de/ustg_1980/__18.html, checked 18 Nov 2026 |
| Newly founded businesses: monthly VAT returns in the first years | 3 | S3 | ALL (VAT-registered) | — | Note: §18(2) carries a special rule for new businesses and a 2021 to 2026 variant; our reader's summary was unclear on which applies to a company founded in 2026 **[verify]** | UStG §18(2), checked 18 Nov 2026 **[verify]** |
| Betriebsnummer from the Bundesagentur für Arbeit | 3 | S2 | EMPLOYEES | 4 | Slot: Bundesagentur für Arbeit letter. The employer applies electronically for each establishment; needed for social insurance reporting; changes reported without delay | SGB IV §18i: https://www.gesetze-im-internet.de/sgb_4/__18i.html, checked 18 Nov 2026 |
| Social insurance reports to the collection agency (Krankenkasse) | 3 | S2 | EMPLOYEES | 5 | Attestation. Start and end of employment and other events; every report carries the Betriebsnummer; electronic, paper only on application | SGB IV §28a(1), (3): https://www.gesetze-im-internet.de/sgb_4/__28a.html, checked 18 Nov 2026 |
| Wage tax return (Lohnsteuer-Anmeldung) by the 10th day after each period | 3 | S2 | EMPLOYEES | 5 | Attestation. Electronic to the Betriebsstättenfinanzamt. Monthly by default; quarterly if last year's wage tax was above EUR 1,080 and not above EUR 5,000; yearly if EUR 1,080 or less | EStG §41a(1), (2): https://www.gesetze-im-internet.de/estg/__41a.html, checked 18 Nov 2026 |
| Written record of essential terms (Nachweisgesetz) | 3 | S2 | EMPLOYEES | 5 | Attestation. Pay, working time and the parties by the first working day; start, place, duties and others within 7 days; the rest within one month. Text form allowed if the employee can store and print it and the employer asks for a receipt; not for the sectors in SchwarzArbG §2a; electronic signed form excluded | NachwG §2(1): https://www.gesetze-im-internet.de/nachwg/__2.html, checked 18 Nov 2026 |
| Minimum wage EUR 13.90 an hour from 1 Jan 2026 | 3 | S2 | EMPLOYEES | 5 | Attestation. Rises to EUR 14.60 from 1 Jan 2027. Set by ordinance under the MiLoG | MiLoV5 §1: https://www.gesetze-im-internet.de/milov5/__1.html, checked 18 Nov 2026; MiLoG §1: https://www.gesetze-im-internet.de/milog/__1.html, checked 18 Nov 2026 |
| Overtime records beyond the ArbZG §3 daily limit, kept 2 years | 3 | S2 | EMPLOYEES | 5 | Attestation. Records of time worked beyond the §3 sentence 1 limit, and a list of employees who agreed to extended hours | ArbZG §16(2): https://www.gesetze-im-internet.de/arbzg/__16.html, checked 18 Nov 2026 |
| Recording all working time (BAG 2022 ruling) | 3 | S2 | EMPLOYEES | — | Note: a duty to record all working time, not only overtime, is reported from a 2022 Federal Labour Court decision; not on an official page we read and not in the ArbZG text **[verify]** | **[verify]**: no official page read |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Payment services licence from BaFin | 3 | S2 | SECTOR.PAYMENTS | 4 | Slot: BaFin licence. Needed when payment services are provided commercially or at a scale needing a commercial business | ZAG §10(1): https://www.gesetze-im-internet.de/zag_2018/__10.html, checked 18 Nov 2026 |
| E-money business licence from BaFin | 3 | S2 | SECTOR.EMONEY | 4 | Slot: BaFin licence. Covers payment services and related activities too | ZAG §11(1): https://www.gesetze-im-internet.de/zag_2018/__11.html, checked 18 Nov 2026 |
| Banking business or financial services permission from BaFin (including lending) | 3 | S2 | SECTOR.CREDIT, .INVESTMENT | 4 | Slot: BaFin permission. Needed when done commercially or at a commercial scale. Whether a given lending or brokerage model is banking business is for the lawyer | KWG §32(1): https://www.gesetze-im-internet.de/kredwg/__32.html, checked 18 Nov 2026 |
| Crypto-asset services under MiCA | 3 | S2 | SECTOR.CRYPTO | 4 | Slot: authorisation. MiCA applies directly; the German implementing act and BaFin's role were not read **[verify]** | **[verify]**: German MiCA implementing act not read |

### Section 9 — Consumer terms and website information

EU-wide duties are in "EU Section 3 — E-commerce information duties" and "EU Section 4 — Consumer law". German specifics:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Impressum under DDG §5 (name, address, legal form, representative, email, register number, USt-IdNr) | 4 | S2 | WEBSITE / APP | 1 / 5 | `web.policy.legal_notice_present`, `registration_number_shown`; the other items are a person's check. Easily recognisable, directly reachable, permanently available: name and address; for a GmbH the legal form and authorised representative; capital if stated, with unpaid cash contributions; quick electronic contact including email; supervisory authority if licensed; register and number; USt-IdNr or Wirtschafts-IdNr if held; liquidation if in liquidation | DDG §5(1): https://www.gesetze-im-internet.de/ddg/__5.html, checked 18 Nov 2026 |
| Digitale-Dienste-Gesetz replaced the Telemediengesetz | 4 | — | WEBSITE / APP | — | Note: the DDG is in BGBl. 2024 I No. 149 (enacted 6 May 2024, published 13 May 2024); the TMG is no longer on gesetze-im-internet.de. The in-force date of 14 May 2024 was not shown on an official page we read **[verify]** | https://www.recht.bund.de/bgbl/1/2024/149/VO.html, checked 18 Nov 2026 **[verify]** |
| Journalistic-editorial content: named responsible person (MStV §18) | 4 | S3 | WEBSITE (journalistic content) | — | Trigger only. The Medienstaatsvertrag is Länder law and was not read **[verify]** | **[verify]**: not read |
| Order button labelled "zahlungspflichtig bestellen" | 4 | S3 | CONSUMER (online ordering) | 5 | Attestation. Without it no contract is formed. Delivery restrictions and accepted payment methods shown at the latest at the start of ordering; key information shown just before the order. Refer to EU Section 4 | BGB §312j: https://www.gesetze-im-internet.de/bgb/__312j.html, checked 18 Nov 2026 |
| 14-day withdrawal period; sending in time is enough | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.refund_policy_found`; content is attestation. No reasons needed | BGB §355(1), (2): https://www.gesetze-im-internet.de/bgb/__355.html, checked 18 Nov 2026 |
| Withdrawal start, the 12 months and 14 days cap, early expiry for digital content | 4 | S3 | CONSUMER | 5 | Attestation. Goods: from receipt; the period does not start until the trader has informed the consumer; at the latest 12 months and 14 days. Services and digital content end early only with express consent and acknowledgement (and §312f confirmation for digital content) | BGB §356(2) to (6): https://www.gesetze-im-internet.de/bgb/__356.html, checked 18 Nov 2026 |
| Online withdrawal function (Directive 2023/2673) in German law | 4 | S3 | CONSUMER (online contracts) | 5 | Attestation. §356(1) as read lets the trader offer an online withdrawal form; we did not find the mandatory withdrawal function due from 19 Jun 2026 in the text read **[verify]**. Refer to EU Section 4 | BGB §356(1), checked 18 Nov 2026 **[verify]** |
| Consumer dispute resolution statement on the website and in the terms (VSBG §36) | 4 | S3 | CONSUMER, WEBSITE | 1 / 5 | `web.policy.complaints_policy_found` as a weak signal; attestation. State whether the company will take part in consumer arbitration; if committed or obliged, name the body (address, website). Exempt from the willingness statement with 10 or fewer employees on 31 Dec of the previous year | VSBG §36: https://www.gesetze-im-internet.de/vsbg/__36.html, checked 18 Nov 2026 |
| EU ODR platform link no longer required | 4 | — | CONSUMER | — | Note: Regulation (EU) 2024/3228 repealed the ODR Regulation from 20 Jul 2025; complaints closed 20 Mar 2025. That the link duty ended with it, and that no German rule still requires it, is our reading **[verify]** | https://eur-lex.europa.eu/eli/reg/2024/3228/oj/eng, checked 18 Nov 2026 **[verify]** |
| Accessibility of consumer e-commerce services (BFSG) | 4 | S3 | CONSUMER, WEBSITE / APP | 1 / 5 | `web.policy.accessibility_found`; conformance is attestation. Services to consumers concluded through websites or apps must be accessible. Microenterprises offering services are exempt: fewer than 10 staff and turnover or balance sheet not above EUR 2m. Refer to EU Section 8 | BFSG §3(1), (3): https://www.gesetze-im-internet.de/bfsg/__3.html, checked 18 Nov 2026; BFSG §2 nos. 17, 26: https://www.gesetze-im-internet.de/bfsg/__2.html, checked 18 Nov 2026 |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| Capital increase resolution notarised, three-quarters majority | 5 | S4 | INVESTED | 4 | Slot: notarised shareholder resolution (an amendment of the articles, §53) | GmbHG §53, checked 18 Nov 2026 |
| Subscription declaration (Übernahmeerklärung) notarised or certified | 5 | S4 | INVESTED | 4 | Slot: each investor's declaration. New joiners state the nominal amount and any extra obligations; video certification allowed | GmbHG §55(1), (2): https://www.gesetze-im-internet.de/gmbhg/__55.html, checked 18 Nov 2026 |
| Registration of the capital increase once the shares are taken up | 5 | S4 | INVESTED | 4 | Slot: updated extract. The filing assures the §7(2), (3) payments are made and attaches the subscription declarations and a signed list of subscribers | GmbHG §57: https://www.gesetze-im-internet.de/gmbhg/__57.html, checked 18 Nov 2026 |
| New shareholder list after the round | 5 | S4 | INVESTED | 4 | Slot: new shareholder list (the notary files it where involved) | GmbHG §40, checked 18 Nov 2026 |
| Secondary share sales to investors by notarial deed | 5 | S4 | INVESTED | 4 | Slot: notarial deed | GmbHG §15(3), checked 18 Nov 2026 |
| Public offer, prospectus or crowdfunding | 5 | S4 | INVESTED (offer to the public) | 5 | Trigger only. Refer to "EU Section 10 — Fundraising and prospectus". German national threshold and information-sheet rules (WpPG) not read **[verify]** | **[verify]**: WpPG not read |

### Section 11 — AI

The AI Act itself is in "EU Section 7 — AI Act" (as amended by Regulation (EU) 2026/1744; dates in the EU common map). German specifics:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 18 Nov 2026) |
|---|---|---|---|---|---|---|
| AI Act obligations apply directly in Germany | 6 | S2 | AI | 5 | Attestation. Refer to "EU Section 7 — AI Act" for roles, prohibitions, literacy, transparency and high-risk dates | EU common map, EU Section 7 |
| Bundesnetzagentur as default AI market surveillance authority | 6 | S3 | AI | — | Note: the KI-MIG makes the Bundesnetzagentur the market surveillance authority unless the act says otherwise; BaFin for AI tied to regulated financial activity of supervised firms; sector authorities for Annex I products; Länder media authorities for journalistic or advertising use by media providers; a chamber inside the Bundesnetzagentur for some Annex III uses | KI-MIG §2: https://www.gesetze-im-internet.de/ki-mig/__2.html, checked 18 Nov 2026 |
| KI-MIG date of entry into force | 6 | — | AI | — | Note: the act is on gesetze-im-internet.de; its BGBl. reference and in-force date (29 Jul 2026 per secondary sources) were not shown to our reader **[verify]** | https://www.gesetze-im-internet.de/ki-mig/index.html, checked 18 Nov 2026 **[verify]** |
| AI regulatory sandboxes (KI-Reallabore) and the central complaints office | 6 | S3 | AI (optional) | — | Note: KI-MIG §§8, 12, 13 exist (table of contents read); their content was not read **[verify]** | KI-MIG index, checked 18 Nov 2026 **[verify]** |
| AI use disclosed on the website | 6 | S3 | AI, WEBSITE | 1 | `web.policy.ai_disclosure_found`. Presence only; the duty is EU law (EU Section 7, art 50) | EU common map, EU Section 7 |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above.

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Accounts prepared | Section 3 | 3 months after year end (small: up to 6) | Attestation |
| Accounts adopted by the shareholders | Section 3 | 8 months after year end (small: 11) | Slot: resolution |
| Accounts to the Unternehmensregister | Section 3 | 12 months after year end | Slot: submission confirmation |
| Shareholder list | Sections 2, 10 | After each change | Slot: list from the register |
| Director changes | Section 4 | After each change | Slot: extract |
| Beneficial-owner changes | Section 2 | Without undue delay after a change | Slot |
| Tax registration | Section 7 | Once, within one month of starting business | Slot: tax office letter |
| VAT advance returns | Section 7 | By the 10th day after each month or quarter | Attestation |
| Wage tax return | Section 7 | By the 10th day after each month, quarter or year | Attestation |
| Minimum wage change | Section 7 | 1 Jan 2027 (EUR 14.60) | Attestation |
| Trademark renewal | Section 5 | Every 10 years; file in the last 6 months | Attestation; certificate date |

---

## 4. Counts by tier

| Tier | Items | What this means |
|---|---|---|
| 1 Official live or URL scan | 10 (5 pure; 5 mixed 1 / 5) | Website scan only: privacy notice, named authority, cookies, Impressum, withdrawal, dispute statement, accessibility, AI disclosure; VIES for the USt-IdNr |
| 2 Licensed vendor | 3 (1 pure; 2 mixed 2 / 4) | OpenRegister (`de.openregister`, built 18 Nov 2026, off until its key is set): status, capital, managing directors (lawyer note 2) |
| 3 Official list import | 1 | Sanctions lists |
| 4 Document-verified | 27 | Register extract, notarised articles and resolutions, shareholder list, Transparenzregister confirmation, accounts adoption and submission, auditor's report, tax letter, Betriebsnummer, DPMA certificate, BaFin licences |
| 5 Attested | 29 (one is 5 + 1) | Capital paid in, name suffix, business letters, books, director eligibility, IP, data-protection records, payroll and employment duties, consumer terms |
| Notes (no tier) | 27 | Context lines a rule can quote, not checks |

Total in Sections 1 to 11: 95 lines (68 checkable items, 27 notes). 19 of them carry **[verify]**. The Tier 4 count includes the two lines now mixed 2 / 4.

---

## 5. The core set every German tech company must show at Stage 2

1. Entered in the Handelsregister, active, not in liquidation or insolvency (Tier 2 through OpenRegister once its key is set, otherwise Tier 4: current extract).
2. Notarised articles; GmbH capital at least EUR 25,000 with the minimum paid in, or a UG with capital paid in full and the UG name (Tier 4 / 5).
3. At least one eligible managing director on the register (Tier 4 / 5).
4. Current shareholder list on the register (Tier 4).
5. Beneficial owners reported to the Transparenzregister (Tier 4).
6. Tax registration within one month, and a USt-IdNr valid in VIES once VAT-registered (Tier 4 / 1).
7. Accounts adopted and submitted to the Unternehmensregister each year (Tier 4).
8. Impressum under DDG §5, privacy notice naming the competent authority, and TDDDG §25 cookie consent on the website (Tier 1, WEBSITE).
9. Founders', employees' and contractors' IP secured in writing (Tier 5).

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

- handelsregister.de terms of use: the 60-retrievals-an-hour cap and the bar on automated retrieval (page not readable).
- GmbHG §60 and InsO: legal grounds for dissolution and the insolvency filing duty, for the status rule text.
- First financial year to which the raised HGB §267 / §267a figures apply (EGHGB transitional rule).
- GwG §3 beneficial-owner definition (25% threshold and control).
- That no GmbHG provision sets a residency rule for managing directors.
- That no statutory transfer gives a company its freelancers' or founders' IP.
- That Germany keeps no public list of DPOs.
- Effect of CJEU C-34/21 on BDSG §26(1) sentence 1, and any amendment to §26.
- UStG §19: what happens when the EUR 100,000 current-year limit is passed mid-year, and that the figures apply from 1 Jan 2025.
- UStG §18(2): monthly VAT returns for a company founded in 2026.
- NachwG: date the text-form option took effect.
- Whether all working time must be recorded (BAG 2022) and any ArbZG amendment.
- German MiCA implementing act and BaFin's role.
- DDG in-force date (14 May 2024) and the end of the TMG.
- MStV §18 for journalistic content.
- Mandatory withdrawal function (Directive 2023/2673): German transposition and section.
- End of the ODR link duty after 20 Jul 2025, and any German rule still referring to it.
- BFSG in-force date for services (28 Jun 2025 under the directive) as written in German law.
- WpPG national prospectus threshold and information-sheet rules.
- KI-MIG BGBl. reference, in-force date, and the content of §§8, 12, 13.
- German national sanctions and export-control rules, if a Germany-specific list is wanted.

---

## Not encoded (18 Nov 2026)

Rule pack `packages/rules/src/packs/de.ts`, version 0.1.0 (draft): 33 German rules plus the EU common rules (`eu-common.ts` with `eu: true`; the DPO rule is written in the German pack as `DE.DP.DPO`, on the BDSG §38 threshold, with the same shared obligation). No German rule rests on a [verify] line. The status rule cites the core-set line, because its own Section 1 line carries a [verify] on the dissolution grounds, which the rule doesn't decide. Rules reading `registry.de.openregister.*` never fail on what the provider says: an active status, a GmbH with EUR 25,000 or more, or a managing director on record passes, and anything else found is "to check".

| Item | Section | Why |
|---|---|---|
| Registration filing with articles, director appointment and shareholder list; domestic business address | Section 1 | Covered by the register extract slot in `DE.CORP.STATUS` and `DE.CORP.MANAGING_DIRECTOR`; no separate check |
| Company status (own line) | Section 1 | [verify] on the legal grounds; encoded as `DE.CORP.STATUS` through the core-set line |
| Company name screened against sanctions lists | Section 1 | [verify]; covered by `INTL.SANCT.SCREENING` |
| Handelsregister open by individual retrievals; portal terms cap | Section 1 | Notes; the second is [verify] |
| UG capital paid in full, no contributions in kind, reserve | Section 2 | No fact tells a UG apart without the register source, so a UG rule would be "to check" for every company. `DE.CORP.SHARE_CAPITAL` states the UG rule in its text |
| Data held on each beneficial owner; beneficial owner test; register closed; EU UBO rules | Section 2 | Notes; the 25% test is [verify] |
| Size classes, micro test, filing relief, 2024 thresholds, EU directives | Section 3 | Notes (the 2024 transition is [verify]); `DE.CORP.AUDIT` quotes the small-company test |
| Joint representation; no residency rule; co-determination; works council | Section 4 | Notes or triggers only; residency is [verify] |
| Contractors and founders grant rights in writing | Section 5 | [verify]; covered by `INTL.IP.OWNER_ASSIGNMENT` and `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| EU trade mark | Section 5 | Note |
| No public list of DPOs; CJEU C-34/21 | Section 6 | Notes, [verify] |
| Records, processor agreements, breach notification | Section 6 | Covered by the EU common rules (`DE.DP.ROPA`, `DE.DP.PROCESSING_AGREEMENTS`, `DE.DP.BREACH`) |
| VAT ID | Section 7 | Covered by `DE.TAX.VAT_VIES` (EU common), which cites this line |
| Monthly VAT returns for new businesses | Section 7 | [verify] |
| Recording all working time (BAG 2022) | Section 7 | [verify] |
| Crypto-asset services under MiCA | Section 8 | [verify]: German implementing act not read |
| DDG replaced the TMG; MStV §18; ODR link | Section 9 | Notes, [verify] |
| Online withdrawal function in German law | Section 9 | [verify]; the EU common rule `DE.CONSUMER.WITHDRAWAL_FUNCTION` asks for it from the EU map |
| Public offer, prospectus or crowdfunding (WpPG) | Section 10 | [verify]; `DE.FUND.PROSPECTUS_EXEMPTION` (EU common) covers the EU exemptions |
| Bundesnetzagentur; KI-MIG date; sandboxes | Section 11 | Notes; the date and sandboxes are [verify] |
| Compliance calendar | Section 12 | Not items. Accounts filing (12 months) and trade mark renewal (10 years) are on their rules |
