# Vero Scan — France Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Sources:** official legislation, government and regulator pages only (Légifrance, Entreprendre Service Public, impots.gouv.fr, CNIL, INPI, AMF, ACPR, entreprises.gouv.fr, EUR-Lex), each with its URL and the date checked. Secondary sources were used only to find official pages and are never cited.
**Company forms covered:** société par actions simplifiée (SAS, and SASU with one shareholder) and société à responsabilité limitée (SARL, and EURL with one partner), running a technology business.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Rules shared by every EU country (GDPR, ePrivacy, e-commerce, consumer, VAT, beneficial ownership, AI Act, accessibility, accounts, prospectus, EU trade mark) are in `vero-scan-eu-common-rule-pack-map.md`; this map adds only what is French.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every French SAS or SARL at that stage |
| SAS / SARL | Only that company form (SAS includes SASU; SARL includes EURL) |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has at least one employee |
| CONTRACTORS | Uses contractors, freelancers or consultants |
| CONSUMER | Sells to consumers (B2C) |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| INVESTED | Has raised or is raising equity |
| SIZE | Exceeds the size thresholds stated in the item |
| SECTOR.PAYMENTS, .CRYPTO, .CREDIT, .HEALTHTECH | Sector packs (triggers only in this map) |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a slot the customer uploads) · 5 attested (the customer confirms, optionally with evidence in the vault).

**[verify]** marks a threshold, deadline, code or reading that we could not confirm from an official page on 16 Nov 2026, with what is uncertain. Nothing marked [verify] should be encoded until a lawyer confirms it.

**Source cell.** "checked 16 Nov 2026" means we read that official page on that date. A page we could not read is marked "[verify]: official page not readable by our tool on 16 Nov 2026".

### Engine facts available for France

| Fact keys | Source | What they can show | What they cannot show |
|---|---|---|---|
| `registry.fr.recherche_entreprises.identified`, `.siren`, `.registered_name`, `.status`, `.created_on`, `.ceased_on`, `.legal_form_code`, `.naf_code`, `.company_category`, `.size_band`, `.hq_postcode`, `.hq_commune`, `.establishments_count`, `.establishments_open_count`, `.directors_count`, `.directors_entity_count`, `.directors_role_titles`, `.partially_published` | Annuaire des Entreprises (API Recherche d'entreprises, DINUM), Tier 1 | The company is in the public directory, active or ceased, its legal form code, activity code, staff band, head-office town, how many directors and their role titles | A miss is not a "no" (non-public companies are left out; `identified` stays null). No filings, accounts, beneficial owners, share capital or insolvency. Directors are counts and titles only, never names |
| `registry.fr.cnil_dpo.listed`, `.designated_on` | CNIL open dataset of organisations that designated a DPO, Tier 3 | The SIREN appears on the CNIL list, and the newest designation date | Not proof either way: a designation made without a SIREN can't be matched |
| `registry.eu.vies_vat.valid`, `.request_date`, `.name_matches` | EU VIES, Tier 1 | A French VAT number given by the customer is valid today | Whether the company should be VAT-registered; needs the number |
| `registry.global.gleif.*` | GLEIF, Tier 1 | LEI record, if any | Nothing about French law; most startups have no LEI |
| `registry.global.opencorporates.*` | OpenCorporates (paid fallback) | Not used while the French directory source is on | — |
| `registry.sanctions.match`, `.possible_match`, `.lists_checked` | Sanctions lists including DG Trésor's registre des gels (`fr`), Tier 3 | Company name close to or matching a listed entity | Never "sanctioned"; officers are not screened |
| `web.policy.*` | Website scan, Tier 1 | Privacy notice, cookie banner (consent manager detected, trackers before consent), terms, cookie policy, AI disclosure links | The text checks are English patterns (see note 4 below); there is no fact yet for the French legal notice (mentions légales) |

---

## 2. Notes for the reviewing lawyer

1. **Scope.** A French SAS or SARL in technology. Sector regimes appear only as triggers (section 8). Rules that are the same across the EU are in the EU common map and are referred to here as "EU Section N".
2. **SAS and SARL differ in two places that matter for scoring.** The SAS is run by a président set by the statuts (Code de commerce L227-6) and its shareholders decide much by statuts; the SARL is run by one or more natural-person gérants (L223-18) and must approve its accounts within 6 months of year end. Rules should carry the SAS / SARL trigger where they differ.
3. **Beneficial owners cannot be checked from a public source.** Since the register is no longer public (Entreprendre Service Public F36703), the only route is the customer's own copy of the declaration (Tier 4).
4. **Engine limit, French websites.** The website scan's text patterns are English (`dpo_contact` looks for "data protection officer" or "DPO"; `rights_section` for "your rights"; `refund_policy_found` for "refund"; the privacy-notice finder looks for "privacy"). A French notice ("politique de confidentialité", "délégué à la protection des données", "droit de rétractation") may be reported as missing. Until French patterns exist, rules reading these facts for France should treat a miss as "to check", not a gap.
5. **No fact yet for accounts filing, BODACC or INPI marks.** The Verification Solutions Matrix (section 8) lists INPI RNE, BODACC and INPI Marques APIs as possible Tier 1 routes; none is built. Items that would use them are Tier 4 for now.
6. **Biggest open points:** the statutory-auditor thresholds (two official pages disagree on figures, see Section 4); whether the French AI Act authority bill has been passed (Section 11); and the INSEE legal-form codes the rules would read (Section 1).

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Registered in the national register of companies (RNE) | 1 | S2 | ALL | 1 | `registry.fr.recherche_entreprises.identified`, `.siren`, `.created_on`. Since 1 Jan 2023 every business with a commercial activity in France must be in the RNE, kept by INPI and fed by the Guichet unique. A miss is "to check", never "not registered" (non-public companies are not in the directory) | https://www.inpi.fr/ressources/formalites-dentreprises/registre-national-entreprises, checked 16 Nov 2026 |
| Company active, not ceased | 1 | S2 | ALL | 1 | `registry.fr.recherche_entreprises.status` = `active`; `.ceased_on` absent. Does not show insolvency proceedings (BODACC not read) | Same page as above |
| Legal form is SAS, SASU, SARL or EURL | 1 | S2 | ALL | 1 | `registry.fr.recherche_entreprises.legal_form_code` (INSEE catégorie juridique). **[verify]** the codes to read (believed 5710 SAS, 5720 SASU, 5499 SARL, 5498 EURL): the INSEE code list was not read | INSEE nomenclature of legal categories, **[verify]**: not read on 16 Nov 2026 |
| Proof of registration (RNE attestation or Kbis extract) | 1 | S2 | ALL | 4 | Slot: Attestation d'immatriculation au RNE (free from INPI) or Extrait Kbis (from the greffe). The Guichet unique does not issue the Kbis | https://www.inpi.fr/realiser-demarches/formalites-dentreprises/documents-justifiant-lexistence-dune-entreprise, checked 16 Nov 2026 |
| Registered office (siège social) stated in the statuts | 1 | S2 | ALL | 1 | `registry.fr.recherche_entreprises.hq_postcode`, `.hq_commune` show an office is on record. Cannot prove a lease or domiciliation contract | Code de commerce L210-2 (statuts state form, duration ≤ 99 years, name, registered office, purpose, capital): https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006222349, checked 16 Nov 2026 |
| Company publicly listed in the directory | 1 | S2 | ALL | 1 | `registry.fr.recherche_entreprises.partially_published`. Information only: a company may ask not to be published; never a gap | FRANCE.md (engine note); no legal duty |
| Company name not on the asset-freeze register | 3 | S2 | ALL | 3 | `registry.sanctions.match`, `.possible_match`, `.lists_checked` (includes `fr`). Never "sanctioned"; a person checks any match | DG Trésor registre national des gels, https://gels-avoirs.dgtresor.gouv.fr/, **[verify]**: not read on 16 Nov 2026 (the engine's source note is in docs/FRANCE.md) |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Statuts adopted and up to date | 1 | S2 | ALL | 4 | Slot: Statuts à jour (certified copy). In a SAS the statuts set decision rules, management bodies and transfer clauses; a collective decision needs at least a majority of votes cast | Code de commerce L210-2, link above; SAS overview https://entreprendre.service-public.gouv.fr/vosdroits/F37366, checked 16 Nov 2026 |
| Register of share movements (registre des mouvements de titres) | 1 | S2 | SAS | 5 | Attestation. Records date, holders and number of shares of each transfer. Service Public says no penalty for not keeping it, but a transfer binds the company only once entered | Code de commerce R228-8; https://entreprendre.service-public.gouv.fr/vosdroits/F37373, checked 16 Nov 2026 |
| Register of shareholder decisions (procès-verbaux) | 1 | S2 | ALL | 5 | Attestation. Numbered sheets or time-stamped electronic form | SAS: L227-1 to L227-20; SARL: R223-24; same page F37373, checked 16 Nov 2026 |
| Beneficial owners declared at registration | 1 | S2 | ALL | 4 | Slot: Déclaration des bénéficiaires effectifs (copy from the Guichet unique). Owner = natural person with more than 25% of capital or votes, or control by other means; if none, the legal representative. No public source: the register is open only to authorities and to people showing a legitimate anti-money-laundering interest | https://entreprendre.service-public.gouv.fr/vosdroits/F36703 (verified by DILA 10 Nov 2026), checked 16 Nov 2026; https://www.inpi.fr/ressources/formalites-dentreprises/beneficiaires-effectifs-dune-societe, checked 16 Nov 2026. See EU Section 6 |
| Beneficial-owner changes filed within 30 days | 1 | event-driven | ALL | 4 | Slot: the modification filing receipt. Penalties for the legal representative up to €200,000 and for the company up to €1,000,000; strike-off after 3 months' formal notice | F36703, as above (Code monétaire et financier L561-46, L561-48, R561-55 ff.) |

### Section 3 — Annual accounts, general meeting and annual return

France has no annual return separate from the accounts filing.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Accounts approved within 6 months of year end | 1 | S2 (annual) | SARL | 5 | Attestation; PV of the annual meeting. The gérant can ask the commercial court to extend. A late meeting stays valid; not submitting the accounts to partners risks a €9,000 fine | https://entreprendre.service-public.gouv.fr/vosdroits/F36714, checked 16 Nov 2026 |
| Accounts approved within the period set by the statuts | 1 | S2 (annual) | SAS | 5 | Attestation. For a SAS the statuts set the deadline; 6 months is common practice because dividends must be paid within 9 months | https://entreprendre.service-public.gouv.fr/vosdroits/F31214 (verified 11 Jun 2025), checked 16 Nov 2026 |
| Annual accounts filed with the greffe | 1 | S2 (annual) | ALL | 4 | Slot: filing receipt (récépissé de dépôt). Within 1 month of approval, 2 months if filed electronically. Penalty €1,500 (€3,000 repeat); court can order filing with a daily penalty. No engine fact yet (INPI RNE accounts not built) | F31214, as above (Code de commerce L232-21 to L232-26, R123-111) |
| Confidentiality declaration for accounts | 1 | S2 (annual) | ALL (optional) | 4 | Slot: confidentiality declaration. Micro (2 of 3: balance sheet ≤ €450,000, turnover ≤ €900,000, ≤ 10 staff) may keep all accounts unpublished; small (2 of 3: ≤ €7.5m, ≤ €15m, ≤ 50 staff) may keep the income statement unpublished. Information, not a gap | F31214, as above (R123-111-1, A123-61 to A123-62) |
| Books kept (livre-journal, grand livre, annual inventory) | 1 | S2 | ALL | 5 | Attestation. Kept 10 years after year end | F37373, as above (R123-172 to R123-177) |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| SAS has a président | 1 | S2 | SAS | 1 | `registry.fr.recherche_entreprises.directors_count` ≥ 1 and `.directors_role_titles` includes a président title. **[verify]** the exact title text the directory returns ("Président" or "Président de SAS") | Code de commerce L227-6: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006227034, checked 16 Nov 2026 |
| Président that is a company | 1 | S2 | SAS | 1 | `registry.fr.recherche_entreprises.directors_entity_count`. Information only. **[verify]** whether a rule should ask who represents the corporate président (rule not read in an official text) | L227-6, as above |
| SARL managed by natural-person gérant(s) | 1 | S2 | SARL | 1 | `.directors_role_titles` includes a gérant title and `.directors_entity_count` = 0. A company cannot be gérant | Code de commerce L223-18: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031013015, checked 16 Nov 2026 |
| No residency rule for président or gérant | 1 | S2 | ALL | — | Not an item: we found no residency or nationality rule for these roles. **[verify]** that none applies (for example to non-EU nationals acting as président) | None found |
| Statutory auditor (commissaire aux comptes) above thresholds | 1 | S3 | SIZE (2 of 3: balance sheet €5m, turnover €10m excl. VAT, 50 staff) | 4 | Slot: decision appointing the auditor. Applies from the year after the thresholds are exceeded. `registry.fr.recherche_entreprises.size_band` hints at staff only. **[verify]** the figures: the Service Public page gives €5m / €10m / 50 citing décret 2019-514, while an earlier economie.gouv.fr page gave €4m / €8m and décret 2024-152 adjusted size criteria; confirm the figures in force | https://entreprendre.service-public.gouv.fr/vosdroits/F31440 (verified 10 Apr 2025), checked 16 Nov 2026 (SAS L227-9-1, SARL L223-35) |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Employee-written software belongs to the company | 2 | S2 | EMPLOYEES | 5 | Attestation. The economic rights in software and its documentation written by employees in their duties or on instructions go to the employer, unless agreed otherwise. Covers software only: other works (designs, text) need a contract clause | CPI L113-9: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039279818, checked 16 Nov 2026 |
| Employee inventions | 2 | S2 | EMPLOYEES | 5 | Attestation. "Mission" inventions belong to the employer, with extra pay set by collective agreement or contract; other inventions linked to the job or company data can be claimed by the employer for a fair price | CPI L611-7: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039279789, checked 16 Nov 2026 |
| Founders' and contractors' IP assigned in writing | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Attestation; vault. L113-9 and L611-7 cover employees only, so code written by founders before incorporation or by freelancers stays with them unless assigned. **[verify]** the form required for a valid copyright assignment (CPI L131-3, not read) | Inference from L113-9 and L611-7 above; L131-3 **[verify]**: not read |
| Trademark filed at INPI (or as an EU trade mark) | 2 | S2 | ALL | 4 | Slot: INPI registration certificate. No INPI fact yet. 10-year term, renewable in the year before expiry, plus 6 months' grace with a 50% surcharge. EU route: EU Section 11 | https://www.inpi.fr/realiser-demarches/propriete-intellectuelle/prolonger-validite-de-sa-marque, checked 16 Nov 2026 |

### Section 6 — Data protection and cookies

GDPR rules are in EU Section 1; cookie consent is in EU Section 2. France adds the following.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Privacy notice published | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `.names_company`, `.rights_section`, `.retention_statement`, `.transfers_section`. Supervisory authority to name: the CNIL. See note 4 (English patterns) | EU Section 1; national act: loi n° 78-17 (Informatique et Libertés) |
| Age of digital consent is 15 | 3 | S2 | PERSONAL_DATA (service offered to minors) | 5 | Attestation. Below 15, consent-based processing for an online service needs both the minor's and a parent's consent | Loi 78-17 art. 45: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037823135, checked 16 Nov 2026 |
| DPO designated and declared to the CNIL online | 3 | S2 | PERSONAL_DATA (GDPR art. 37 tests met) | 3 | `registry.fr.cnil_dpo.listed`, `.designated_on`. Designations, changes and ends go only through the CNIL online service; updates need the DPO-xxx number and SIREN. A miss is not proof there is no DPO | https://www.cnil.fr/fr/designation-dpo (dated 3 Apr 2026), checked 16 Nov 2026 |
| DPO contact in the privacy notice | 3 | S2 | PERSONAL_DATA (DPO designated) | 1 | `web.policy.dpo_contact`. English pattern only: "délégué à la protection des données" alone is not matched | EU Section 1 |
| Record of processing activities | 3 | S2 | PERSONAL_DATA | 5 | Attestation. CNIL provides templates | F37373, as above; EU Section 1 |
| Cookie consent per CNIL rules | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `.cookies_before_consent_count`, `.trackers_before_consent_count`. CNIL: continuing to browse means refusal; a "refuse all" at the same level and look as "accept all" is the recommended clear way; refusal only at a second layer is not accepted; withdrawing as easy as giving. The scan cannot yet see whether reject is on the first layer | Loi 78-17 art. 82; CNIL guidelines and recommendation n° 2020-091 of 17 Sep 2020: https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/FAQ (dated 29 Apr 2026), checked 16 Nov 2026 |
| Consent choice kept and asked again at a sensible interval | 3 | S2 | WEBSITE | 5 | Attestation. CNIL presents 6 months as good practice, case by case: a recommendation, not a rule | CNIL FAQ, as above |
| Audience-measurement cookies without consent only if exempt | 3 | S2 | WEBSITE | 5 | Attestation. Exempt only if used solely for the publisher's own anonymous statistics, not cross-site, not shared; the publisher must be able to show it | CNIL FAQ, as above |
| Cookie policy | 3 | S2 | WEBSITE | 1 | `web.policy.cookie_policy_found` | EU Section 2 |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| VAT: registered once above the franchise thresholds | 3 | S3 | ALL | 1 | `registry.eu.vies_vat.valid` (needs the VAT number). Franchise en base thresholds from 1 Jan 2025: prior-year turnover €85,000 (goods) / €37,500 (services); ends in the year once €93,500 / €41,250 is passed, VAT due from that date. VIES cannot show whether the company should be registered | https://www.impots.gouv.fr/professionnel/les-regimes-dimposition-la-tva (modified 21 May 2026), checked 16 Nov 2026 (CGI art. 293 B). See EU Section 5 |
| Able to receive e-invoices through an approved platform | 3 | S2 | ALL (VAT-liable in France, including franchise) | 5 | Attestation: name of the plateforme agréée. All companies must be able to receive from 1 Sep 2026; SMEs and micro-companies must issue e-invoices and e-report from 1 Sep 2027 | https://www.impots.gouv.fr/professionnel/je-decouvre-la-facturation-electronique (modified 26 May 2026), checked 16 Nov 2026 |
| Pre-hiring declaration (DPAE) for each hire | 3 | S2 | EMPLOYEES | 5 | Attestation. To URSSAF before the employee starts, no earlier than 8 days before; the first one opens the employer account. Penalty €1,305 per employee plus criminal penalties | https://entreprendre.service-public.gouv.fr/vosdroits/F23107 (verified 1 Jun 2026), checked 16 Nov 2026 (Code du travail L1221-10 ff.). URSSAF pages **[verify]**: not readable by our tool on 16 Nov 2026 |
| Monthly social declaration (DSN) and supplementary pension affiliation | 3 | S2 | EMPLOYEES | 5 | Attestation. Agirc-Arrco affiliation is done through the DSN | F23107, as above |
| Single staff register (registre unique du personnel) | 3 | S2 | EMPLOYEES | 5 | Attestation. From the first employee or intern; kept 5 years after departure | F37373 and F23107, as above (Code du travail L1221-13) |
| Occupational risk assessment (DUERP) | 3 | S2 | EMPLOYEES | 5 | Attestation; vault. Annual update from 11 staff | F37373, as above (R4121-1 to R4121-4) |
| Occupational health visit for each hire | 3 | S2 | EMPLOYEES | 5 | Attestation | F23107, as above (R4624-10 ff.) |
| Staff size band | 3 | S2 | EMPLOYEES | 1 | `registry.fr.recherche_entreprises.size_band`: a hint for the EMPLOYEES trigger only, never a finding | Engine fact |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| MiCA authorisation for crypto-asset services | 3 | S2 | SECTOR.CRYPTO | 3 | Since 2 Jul 2026 only MiCA-authorised providers may serve clients; the French transitional period ran until 1 Jul 2026. Route: AMF list of authorised providers **[verify]** importable format | https://www.amf-france.org/en/news-publications/news-releases/crypto-assets-end-pacte-law-and-european-mica-regulation-transitional-period-establishes-new-role (dated 6 Jul 2026), checked 16 Nov 2026 |
| Payment or e-money institution authorisation (ACPR) | 3 | S2 | SECTOR.PAYMENTS | 1 | REGAFI register (Verification Solutions Matrix section 8). A crypto provider holding e-money tokens for clients also needs payment-institution authorisation | https://acpr.banque-france.fr/fr/professionnels/lacpr-vous-accompagne/parcours-fintech/contenus-pedagogiques/de-quel-statut-releve-mon-activite/je-propose-des-services-sur-crypto-actifs, checked 16 Nov 2026 (no date shown); REGAFI https://www.regafi.fr **[verify]**: not read on 16 Nov 2026 |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Website legal notice (mentions légales) | 4 | S2 | WEBSITE / APP | 5 | Attestation until a URL check exists (no `web.policy` fact covers it). A company publishing online must show: name, registered office, phone, RCS/RNE number, share capital, director of publication, and the host's name, address and phone. Since loi SREN of 21 May 2024 this sits in LCEN art. 1-1 (in force 23 May 2024), not art. 6 III | LCEN art. 1-1: https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000049568614, checked 16 Nov 2026 |
| E-commerce identification details | 4 | S3 | WEBSITE (selling online) | 5 | Attestation. Easy, direct, permanent access to: name, address, email, phone, register number, share capital, registered office, VAT number if any, licensing authority if any; prices clear, saying whether taxes and delivery are included. Penalty 1 year and €75,000. **[verify]** whether a new version applies from 1 Jan 2027 (ordonnance 2025-1247 was reported; not shown on the page read) | LCEN art. 19: https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000032236011, checked 16 Nov 2026. See EU Section 3 |
| Consumer pre-contract information (CGV) | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.terms_found` (matches "conditions", so "CGV/CGU" links are usually found); content attested. L221-5 lists 11 items, including the consumer mediator, withdrawal terms and the location of the withdrawal function, and whether personalised pricing is used. Trader bears the burden of proof | Code de la consommation L221-5 to L221-7 (L221-5 in force since 19 Jun 2026, ordonnance 2026-2): https://www.legifrance.gouv.fr/codes/id/LEGISCTA000032226878/, checked 16 Nov 2026. See EU Section 4 |
| Withdrawal function shown | 4 | S3 | CONSUMER | 5 | Attestation. L221-5 7° requires telling the consumer where the withdrawal function is. **[verify]** what L221-21 requires of the function itself (not read) | L221-5, as above |
| Online termination function ("résilier votre contrat") | 4 | S3 | CONSUMER (contracts that can be concluded online) | 5 | Attestation (future URL check). A free electronic function to give notice and complete termination, with acknowledgment on a durable medium. **[verify]** the label and placement rules in décret 2023-417 (not read) | Code de la consommation L215-1-1 (in force since 1 Jun 2023): https://www.legifrance.gouv.fr/codes/id/LEGISCTA000046194160, checked 16 Nov 2026 |
| Refund, cancellation and complaints pages | 4 | S3 | CONSUMER | 1 | `web.policy.refund_policy_found`, `.complaints_policy_found`. English patterns only (see note 4) | L221-5, as above |
| Accessibility statement | 4 | S3 | CONSUMER | 1 | `web.policy.accessibility_found`. **[verify]** the French transposition of the European Accessibility Act, its micro-enterprise exemption and dates | EU Section 8; French text not read |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Capital increase decided by the shareholders | 5 | S4 | INVESTED | 5 | Vault: PV. SAS: collective decision under the statuts' majority; SARL: extraordinary meeting, 2/3 of parts for SARLs formed after 4 Aug 2005. Raising nominal value needs unanimity | https://entreprendre.service-public.gouv.fr/vosdroits/F36607 (verified 1 Jan 2024), checked 16 Nov 2026 |
| Preferential subscription right respected (SAS) | 5 | S4 | INVESTED, SAS | 5 | Vault: waiver or exercise records. A cash increase ignoring shareholders' preference is not valid; at least 5 trading days to exercise. In a SARL only if the statuts grant it | F36607, as above (L225-127 to L225-150 applied to SAS; L223-32 for SARL) |
| Legal notice published and change filed on the Guichet unique | 5 | S4 | INVESTED | 4 | Slot: attestation de parution and filing receipt with PV, updated statuts, deposit certificate. Legal notice within 1 month of the decision. **[verify]** the deadline for the Guichet unique filing (the page gives none) | F36607, as above |
| Beneficial-owner update after a round | 5 | S4 | INVESTED | 4 | dup of Section 2 (changes within 30 days) | F36703 |
| SAS makes no public offer outside the allowed exemptions | 5 | S4 | INVESTED (public offer or crowdfunding) | 5 | Attestation. A SAS cannot make a public offer of securities or list on a regulated market, except offers under Regulation 2017/1129 art. 1(4)(i), CMF L411-2 and L411-2-1 2° and 3°. Trigger for lawyer review | Code de commerce L227-2: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039260228, checked 16 Nov 2026. See EU Section 10 |

### Section 11 — AI

The AI Act obligations and dates are in EU Section 7 (as amended by Regulation (EU) 2026/1744: Annex III high-risk from 2 Dec 2027, Annex I from 2 Aug 2028, new art. 5 prohibitions from 2 Dec 2026, art. 50(2) marking for systems already on the market by 2 Dec 2026; https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng, checked 16 Nov 2026).

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| French AI Act authorities | 6 | S3 | AI | — | Not an item: names who enforces. Planned scheme: DGCCRF coordinates market surveillance and is the single point of contact; DGE represents France on the AI Board; CNIL covers several prohibited practices, many Annex III areas and art. 50(3); Arcom and DGCCRF the other transparency duties; ACPR credit scoring and some insurance. **[verify]**: the page says the scheme needs a bill passed by Parliament; enactment not confirmed | https://www.entreprises.gouv.fr/priorites-et-actions/transition-numerique/soutenir-le-developpement-de-lia-au-service-de-0 (dated 9 Sep 2025), checked 16 Nov 2026 |
| AI built on personal data follows CNIL AI guidance | 6 | S3 | AI, PERSONAL_DATA | 5 | Vault: legal basis, DPIA where needed, information to people, rights handling, web-scraping safeguards, model status analysis. CNIL guidance, not law | https://www.cnil.fr/fr/les-fiches-pratiques-ia (13 practical sheets and a checklist), checked 16 Nov 2026 |
| AI use disclosed to users | 6 | S3 | AI | 1 / 5 | `web.policy.ai_disclosure_found` (link containing "AI"; French "IA" alone is not matched). Duty itself: EU Section 7 (art. 50) | EU Section 7 |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above.

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Approval of accounts | Section 3 | SARL within 6 months of year end; SAS per statuts | Attestation |
| Accounts filing | Section 3 | 1 month after approval (2 months electronic) | Upload receipt; auto once INPI RNE accounts are read |
| Beneficial-owner update | Section 2 | Within 30 days of any change | Upload |
| VAT franchise test | Section 7 | Each calendar year, and on crossing the in-year limit | VIES once registered |
| E-invoicing | Section 7 | Receive from 1 Sep 2026; issue from 1 Sep 2027 (SMEs) | Attestation |
| DSN | Section 7 | Monthly | Attestation |
| Trademark renewal | Section 5 | Every 10 years | Upload; auto once INPI marks are read |
| DPO designation updates | Section 6 | On any change of DPO | Auto: CNIL list (`registry.fr.cnil_dpo.designated_on`) |
| Statutory auditor test | Section 4 | Each year end | Attestation |
| AI Act milestones | Section 11 | 2 Dec 2026; 2 Dec 2027; 2 Aug 2028 | Calendar |

---

## 4. Counts by tier

| Tier | Items | What this means |
|---|---|---|
| 1 Official live or URL scan | 19 (2 of them "1 / 5") | The directory covers registration, status, form, office and managers; VIES covers VAT; REGAFI for payment firms; the website scan covers privacy, cookies, terms and consumer pages (English patterns only) |
| 2 Licensed vendor | 0 | Not needed: France's directory is free |
| 3 Official list import | 3 | CNIL DPO list, asset-freeze register, AMF authorised providers |
| 4 Document-verified | 10 | RNE attestation or Kbis, statuts, beneficial-owner declaration and changes, accounts filing, confidentiality declaration, auditor appointment, INPI certificate, capital-increase filing, beneficial-owner update after a round (dup) |
| 5 Attested | 26 | Registers, employer formalities, IP ownership, consumer and website content not yet scanned |

60 rows: 58 items (one a dup) and 2 "not an item" rows (residency rule, AI authorities).

---

## 5. The core set every French tech company must show at Stage 2

1. In the RNE and active; legal form SAS or SARL (Tier 1)
2. A président (SAS) or natural-person gérant (SARL) on record (Tier 1)
3. Statuts and proof of registration uploaded (Tier 4)
4. Beneficial-owner declaration uploaded (Tier 4)
5. Website legal notice (mentions légales) published (Tier 5 until scanned)
6. Privacy notice and CNIL-compliant cookie consent (Tier 1, WEBSITE)
7. Able to receive e-invoices (Tier 5)
8. Founders' and contractors' IP assigned; trademark filed at INPI (Tier 5 / 4)

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

1. Statutory-auditor thresholds: €5m / €10m / 50 (Service Public, citing décret 2019-514) against décret 2024-152 and the older €4m / €8m figures.
2. INSEE legal-form codes for SAS, SASU, SARL, EURL.
3. The exact director role titles the Annuaire des Entreprises returns.
4. Whether any residency or nationality rule applies to a président or gérant (none found).
5. Whether a corporate président must name a natural-person representative (case law only; not read).
6. Form required for a valid copyright assignment (CPI L131-3).
7. LCEN art. 19: whether a new version applies from 1 Jan 2027.
8. Code de la consommation L221-21 (withdrawal function) and décret 2023-417 (termination function wording).
9. Deadline for the Guichet unique filing after a capital increase.
10. French transposition of the European Accessibility Act.
11. Whether the French AI Act authorities bill has been passed.
12. AMF list of authorised crypto providers: importable format. REGAFI page not read.
13. DG Trésor asset-freeze register page and URSSAF pages: not read by our tool.
14. Engine: French text patterns for the website scan (privacy, DPO, rights, refund, AI), and a new fact for the mentions légales; INPI RNE accounts, BODACC and INPI marks sources.

---

## Not encoded (16 Nov 2026)

Rule pack `packages/rules/src/packs/fr.ts`, version 0.1.0 (draft): 34 French rules plus 35 EU common rules (`eu-common.ts`; France writes its own DPO rule, `FR.DP.DPO`, reading the CNIL list, and its own `FR.COM.LEGAL_NOTICE` in place of the EU website-identity rule). A miss in the business directory or on the CNIL list is "to check", never a gap. Four rules rest on a [verify] line and can only say "to check": `FR.EMP.DPAE`, `FR.FIN.PAYMENT_AUTHORISATION`, `FR.CONSUMER.TERMINATION_FUNCTION`, `FR.FUND.CAPITAL_INCREASE_FILING`.

| Item | Section | Why |
|---|---|---|
| Legal form is SAS, SASU, SARL or EURL | Section 1 | [verify]: the INSEE codes. The form is asked in the questionnaire instead (`entity_type_fr`) |
| Company publicly listed in the directory | Section 1 | Information only, never a gap. Used only to make the office and director checks "to check" for a partly published company |
| Company name not on the asset-freeze register | Section 1 | [verify]; covered by `INTL.SANCT.SCREENING` |
| Président that is a company | Section 4 | Information only |
| SARL managed by natural-person gérant(s) | Section 4 | The directory's director list also holds auditors, which can be companies, so a company among them doesn't prove a corporate gérant; the role titles are unconfirmed |
| No residency rule for président or gérant | Section 4 | Not an item |
| Statutory auditor above thresholds | Section 4 | [verify]: the thresholds would decide |
| Founders' and contractors' IP assigned in writing | Section 5 | [verify]; covered by `INTL.IP.OWNER_ASSIGNMENT` and `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| Confidentiality declaration for accounts | Section 3 | Optional: information, not a gap |
| Privacy notice published | Section 6 | Covered by `FR.DP.PRIVACY_NOTICE` (EU common), which cites this line |
| Record of processing activities | Section 6 | Covered by `FR.DP.ROPA` (EU common) |
| Cookie consent per CNIL rules; cookie policy | Section 6 | Covered by `FR.DP.COOKIE_CONSENT` and `FR.DP.COOKIE_POLICY` (EU common). The scan can't yet see whether "refuse" is on the first layer |
| Consent choice kept and asked again | Section 6 | A CNIL recommendation, not a rule |
| VAT registered above the franchise thresholds | Section 7 | Covered by `FR.TAX.VAT_VIES` (EU common), which can't tell whether the company should be registered |
| Staff size band | Section 7 | A hint, never a finding |
| MiCA authorisation | Section 8 | [verify] |
| E-commerce identification details | Section 9 | [verify] on a 2027 version; today's duty is covered by `FR.COM.LEGAL_NOTICE` and `FR.CONSUMER.PRICES` |
| Withdrawal function shown | Section 9 | [verify]; the EU duty is `FR.CONSUMER.WITHDRAWAL_FUNCTION` |
| Refund, cancellation and complaints pages | Section 9 | Covered by `FR.CONSUMER.WITHDRAWAL` and `FR.CONSUMER.COMPLAINTS` (EU common) |
| Accessibility statement | Section 9 | [verify] on the French text; the EU duty is `FR.CONSUMER.ACCESSIBILITY` |
| Beneficial-owner update after a round | Section 10 | Duplicate; covered by `FR.CORP.UBO_CHANGES` |
| French AI Act authorities | Section 11 | Not an item, [verify] |
| Compliance calendar | Section 12 | Not items. SARL accounts (6 months), DSN (monthly) and trade mark renewal (10 years) are reminders on their rules; the rest need a date we have no fact for |
