# Vero Scan — Netherlands Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company form covered:** private limited company, *besloten vennootschap met beperkte aansprakelijkheid* (BV). NVs are out of scope.
**Sources:** official legislation, government and regulator pages only, each with its URL and the date checked. Secondary sources were used only to find official pages and are never cited.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Rules common to every EU/EEA country are in `vero-scan-eu-common-rule-pack-map.md`; this map adds only what is Dutch.

**How sources were read.** Statutes are cited from wetten.overheid.nl, read on 16 Nov 2026 in the version the site showed as in force that day (Book 2 BW: "geldend van 01-07-2026"; Book 3 BW: 01-07-2025; Book 6 BW: 16-07-2026; Handelsregisterwet 2007: 16-07-2025; Telecommunicatiewet: 15-08-2026; Octrooiwet 1995: 01-06-2023; Auteurswet: 01-01-2026; UAVG: 01-09-2026). Book 2 shows "several future amendments, the first on 1 Jan 2027": those were not read. The Autoriteit Persoonsgegevens site refused our reader (HTTP 403); items resting on its guidance are marked.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Dutch BV at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants (zzp'ers) |
| CONSUMER | B2C product |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| INVESTED | Has raised or is raising |
| SECTOR.PAYMENTS, .EMONEY, .CRYPTO, .INVESTMENT, .CREDIT, .HEALTHTECH | Sector licence triggers (section 8) |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault).

**[verify]** means the item, threshold or deadline could not be confirmed from an official source on 16 Nov 2026. The note says exactly what is uncertain. A [verify] line must not affect a score until a lawyer confirms it.

### Engine facts available for the Netherlands

Read from `packages/connectors/src/fact-keys.ts` and `packages/connectors/src/sources/nl-kvk.ts`. The KVK source is paid and **off until `NL_KVK_API_KEY` is set**; while it is off, OpenCorporates answers for the Netherlands if its own key is set. A KVK miss is "not found" (`identified` = null), never "doesn't exist". None of the KVK facts has been checked against a real reply.

| Fact key | What it can show | What it cannot show |
|---|---|---|
| `registry.nl.kvk.identified` | KVK holds a company under that number or name | Anything about compliance. Null on a miss or for an eenmanszaak |
| `registry.nl.kvk.kvk_number` | The 8-digit KVK number | — |
| `registry.nl.kvk.registered_name` | Statutory name (statutaire naam) | Trade names |
| `registry.nl.kvk.legal_form`, `.legal_form_detail` | Legal form, e.g. "Besloten Vennootschap" (exact words not confirmed) | — |
| `registry.nl.kvk.registered_on` | Formal registration date | When the notarial deed was signed |
| `registry.nl.kvk.started_on`, `.ended_on`, `.active` | Start and end of registration; active if no end date | Insolvency (not read) |
| `registry.nl.kvk.sbi_code`, `.sbi_codes` | Main and other SBI activity codes | Real activity; use for sector inference only |
| `registry.nl.kvk.establishments_count` | Number of establishments | — |
| `registry.global.opencorporates.*` | Fallback register record (status, incorporation date, officers count) while KVK is off | Not official; Tier 2 at most |
| `registry.eu.vies_vat.valid`, `.request_date`, `.name_matches` | Dutch VAT number valid in VIES | Domestic VAT compliance |
| `registry.global.gleif.*` | LEI record, if any | Most startups have none; a miss means nothing |
| `registry.sanctions.match`, `.possible_match`, `.lists_checked` | Company name screened against sanctions lists | People are not screened |
| `web.policy.*` | Website scan: privacy notice, cookie behaviour, terms, AI disclosure | Legal adequacy; a person reviews |

**Not available in the engine today:** accounts deposited at KVK, directors (bestuurders), UBO registration, the shareholder register, BOIP trademarks, AFM/DNB registers. These items use a document slot (Tier 4) or an attestation (Tier 5) until a source is built.

---

## 2. Notes for the reviewing lawyer

1. **UBO register access.** KVK says part of the register was closed after the CJEU ruling (22 Nov 2022, cited by KVK without a date on the page read) and is being reopened sector by sector to "objectively identifiable" organisations. A company can order a certified extract of its own UBO data. The public cannot search it. Page last edited 26 Oct 2026.
2. **Withdrawal function (Directive (EU) 2023/2673).** We searched Book 6 BW (version in force from 16 Jul 2026) for a withdrawal-function ("ontbindingsfunctie") provision and found none. Whether and where the Netherlands has transposed it is **[verify]** (item 9.4).
3. **Cookie supervisor.** Article 11.7a Telecommunicatiewet is the cookie rule. We could not read a current official page confirming that the ACM (not the AP) supervises it, or the ACM–AP split [verify].
4. **AI Act implementation.** The Uitvoeringswet AI-verordening was put to consultation on 20 Apr 2026 (closed 1 Jun 2026). It is a bill, not law, on the pages read. AP and RDI are proposed as coordinating supervisors; the AP as default market surveillance authority where no sector supervisor exists.
5. **Audit exemption thresholds** in BW 2:396 (version 1 Jul 2026) are already the raised figures (assets EUR 7.5m, net turnover EUR 15m, under 50 employees). The application date of those figures to a given financial year is in transitional law we did not read [verify].

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Name check against the Business Register and BOIP | 1 | S1 | ALL | 1 / 5 | `registry.nl.kvk.identified` by name (free Zoeken search). BOIP and KVK offer a joint name checker (web only, not built) | BOIP, Trademarks, https://www.boip.int/en/entrepreneurs/trademarks |
| BV incorporated by notarial deed | 1 | S2 | ALL | 4 | Slot: deed of incorporation (akte van oprichting). BW 2:175(2): one or more persons, by notarial deed signed by every founder | BW Book 2, art 175, https://wetten.overheid.nl/BWBR0003045 |
| Registered in the Handelsregister within one week | 1 | S2 | ALL | 1 | `registry.nl.kvk.identified`, `registry.nl.kvk.registered_on`. First registration of a legal person within one week of the event that creates the duty; later changes within one week (HRW art 20). The fact shows registration, not that it was on time | Handelsregisterwet 2007, art 20, https://wetten.overheid.nl/BWBR0021777 |
| Company active (not ended) | 1 | S2 | ALL | 1 | `registry.nl.kvk.active` = true, `registry.nl.kvk.ended_on` absent. Insolvency is not read; **[verify]** whether the Basisprofiel carries it | KVK API docs (developers.kvk.nl), as recorded in `nl-kvk.ts` on 16 Nov 2026; not re-read for this map |
| Legal form is a BV | 1 | S2 | ALL | 1 | `registry.nl.kvk.legal_form` (exact wording not confirmed) | KVK API docs, as above |
| KVK number on letters, orders, invoices and quotes | 1 | S2 | ALL | 5 | Attestation; a website scan fact does not exist yet. HRW art 27 (advertising excepted) | Handelsregisterwet 2007, art 27, https://wetten.overheid.nl/BWBR0021777 |
| Registered seat (statutaire zetel) in the Netherlands | 1 | S2 | ALL | 4 | Slot: articles of association. **[verify]** the BW article that requires the seat to be in the Netherlands (not read) | — [verify] |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Articles of association (statuten) in the deed; amendments by notarial deed in Dutch | 1 | S2 | ALL | 4 | Slot: current articles. An amendment needs a notarial deed in Dutch, on pain of nullity (BW 2:234) | BW Book 2, art 234, https://wetten.overheid.nl/BWBR0003045 |
| No minimum share capital; shares have a nominal amount, possibly in a foreign currency | 1 | S2 | ALL | — | Information only. BW 2:178 requires the nominal amount of shares and the issued and paid-up capital in the deed; it sets no minimum. **[verify]** that no other article sets one | BW Book 2, art 178, https://wetten.overheid.nl/BWBR0003045 |
| At least one voting share held by someone other than the company | 1 | S2 | ALL | 5 | Attestation. BW 2:175(1) | BW Book 2, art 175 |
| Shareholder register (aandeelhoudersregister) kept by the board | 1 | S2 | ALL | 4 | Slot: shareholder register. Names, addresses, acquisition date, share class, paid-up amount; also pledges, usufruct and depositary-receipt holders with meeting rights; kept up to date; open to shareholders at the office (BW 2:194). The engine cannot see it | BW Book 2, art 194, https://wetten.overheid.nl/BWBR0003045 |
| Share transfers by notarial deed | 1 | event-driven | ALL | 4 | Slot: deed of transfer (akte van levering). BW 2:196(1): issue and transfer need a deed executed before a notary established in the Netherlands | BW Book 2, art 196 |
| UBOs registered in the Handelsregister | 1 | S2 | ALL | 4 | Slot: KVK UBO extract (the company can order its own certified extract). KVK says all BVs must register UBOs (Business Register Act, HRW art 15a). The register is not public; no engine fact. See **EU Section 6 — Beneficial ownership (AML)**. Deadline for new or changed UBOs: the one-week rule in HRW art 20 may apply **[verify]** (KVK's Form 30 page states no deadline) | KVK, Form 30, https://www.kvk.nl/en/about-the-business-register/download-form-30/ ; KVK, Who has access to UBO data, https://www.kvk.nl/en/ubo/who-has-access-to-ubo-data/ ; HRW art 15a |
| Central shareholders register (proposed) | 1 | — | ALL | — | **[verify]**: whether a central register of BV shareholders has been enacted. Not found in the texts read | — [verify] |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Board prepares the annual accounts within 5 months of year end | 1 | S2 (annual) | ALL | 5 | Attestation. Extendable by the general meeting by up to 5 months for special reasons (BW 2:210(1)) | BW Book 2, art 210, https://wetten.overheid.nl/BWBR0003045 |
| General meeting adopts the accounts | 1 | S2 (annual) | ALL | 5 | Attestation. If every shareholder is also a director, signing by all directors counts as adoption, with the conditions in BW 2:210(5) | BW Book 2, art 210(3), (5) |
| At least one general meeting (or written resolution) each financial year | 1 | S2 (annual) | ALL | 5 | Attestation. BW 2:218 | BW Book 2, art 218 |
| Accounts deposited at KVK within 8 days of adoption, and no later than 12 months after year end | 1 | S2 (annual) | ALL | 4 | Slot: KVK deposit confirmation. If not adopted within 2 months after the preparation period, the board deposits the prepared accounts, marked "not yet adopted" (BW 2:394(2)). Small companies deposit only a reduced balance sheet and notes (BW 2:396(8)). No engine fact: deposited accounts are not read | BW Book 2, art 394, art 396(8), https://wetten.overheid.nl/BWBR0003045 |
| Accounts in Dutch, or in French, German or English | 1 | S2 (annual) | ALL | 4 | Same slot. BW 2:394(1) | BW Book 2, art 394(1) |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Directors (bestuurders) registered in the Handelsregister | 1 | S2 | ALL | 4 | Slot: KVK extract (uittreksel). Directors are not read by the engine. Change within one week (HRW art 20) | Handelsregisterwet 2007, art 20 |
| No residency or nationality rule for directors | 1 | S2 | ALL | — | Information only. None found in the parts of Book 2 read **[verify]** | BW Book 2 [verify] |
| Supervisory board (raad van commissarissen) only if the articles provide or the structure regime applies | 1 | S5 | ALL | 5 | Attestation. **[verify]** the large-company (structuurregime) thresholds; not read | — [verify] |
| Statutory audit by a registered accountant, unless the small-company exemption applies | 1 | S3 | ALL (not small) | 4 | Slot: auditor's report. BW 2:393(1) requires an audit; BW 2:396(7) disapplies it for a small company: on two consecutive balance-sheet dates, two or three of assets not over EUR 7,500,000, net turnover not over EUR 15,000,000, fewer than 50 employees on average (BW 2:396(1)). **[verify]** the first financial year these figures apply to (lawyer note 5) | BW Book 2, arts 393, 396, https://wetten.overheid.nl/BWBR0003045 |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Works made by employees: the employer is the author by law | 2 | S2 | EMPLOYEES | 5 | Attestation that the work was made in the course of employment. Auteurswet art 7: where the work consists of making particular works, the employer counts as the maker unless agreed otherwise. Software is covered as a literary or scientific work **[verify]** that no separate software rule changes this | Auteurswet, art 7, https://wetten.overheid.nl/BWBR0001886 |
| Contractor and founder IP assignment by deed | 2 | S1 | CONTRACTORS, ALL (founders) | 5 | Vault: assignment agreements. Art 7 covers employment only; a contractor keeps copyright unless it is assigned. **[verify]** the formal requirement for assignment (a deed, Auteurswet art 2): not read | Auteurswet, arts 2 [verify], 7 |
| Employee inventions: patent belongs to the employer where the job is to invent | 2 | S3 | EMPLOYEES (patentable inventions) | 5 | Vault: employment contracts and invention policy. Octrooiwet art 12(1): the employer is entitled where the nature of the job is to use special knowledge to make such inventions; this can be varied in writing (art 12(5)); the inventor is owed a fair amount if the salary does not compensate, and that cannot be excluded (art 12(6), (7)); the claim lapses 3 years after grant | Octrooiwet 1995, art 12, https://wetten.overheid.nl/BWBR0007118 |
| Benelux trademark registered with BOIP | 2 | S2 (application) / S3 | ALL | 4 | Slot: BOIP registration. Valid in Belgium, the Netherlands and Luxembourg for 10 years, renewable; must be used within 5 years. An EU trade mark is the alternative: **EU Section 11 — EU trade mark** | BOIP, Trademarks, https://www.boip.int/en/entrepreneurs/trademarks |

### Section 6 — Data protection and cookies

GDPR duties are in **EU Section 1 — GDPR**; cookie consent in **EU Section 2 — ePrivacy and cookies**. Dutch specifics only:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Supervisory authority is the Autoriteit Persoonsgegevens | 3 | S2 | PERSONAL_DATA, WEBSITE | 1 | `web.policy.privacy_notice_found`, `web.policy.rights_section`. The notice should name the right to complain to the AP. **No Dutch complaint-route fact exists yet**; until one is built this is a person's check | UAVG, ch 2 (art 6: establishment and designation of the AP), https://wetten.overheid.nl/BWBR0040940 |
| Consent of a legal representative under 16 | 3 | S2 | CONSUMER, PERSONAL_DATA | 1 / 5 | `web.policy.children_section`; attestation. UAVG art 5 requires a legal representative's consent where the data subject is under 16 and GDPR Art 8 does not apply; for information society services the GDPR Art 8 default of 16 applies **[verify]** that the Netherlands set no lower age | UAVG, art 5, https://wetten.overheid.nl/BWBR0040940 |
| No general national registration or fee for controllers | 3 | S2 | PERSONAL_DATA | — | Information only. None found in the UAVG **[verify]** with the AP (site not readable by our tool on 16 Nov 2026) | UAVG [verify] |
| DPO (functionaris gegevensbescherming) where GDPR Art 37 applies; notified to the AP | 3 | S2 | PERSONAL_DATA (large-scale monitoring or special-category data) | 5 + 1 | Attestation; `web.policy.dpo_contact`. The AP's page on notifying an FG was not readable **[verify]**: https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/functionaris-gegevensbescherming-fg/wanneer-een-fg-aanstellen | GDPR Art 37 (EU Section 1); AP page [verify] |
| Cookie consent under Telecommunicatiewet art 11.7a | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `web.policy.cookies_before_consent_count`, `web.policy.trackers_before_consent_count`, `web.policy.cookie_policy_found`. Storing or reading information needs clear information and consent, except for transmission, strictly necessary storage, or measuring the quality or effectiveness of the service with no or minor privacy impact (art 11.7a(3)(b)). The scan cannot tell which analytics meet that exception: a person checks. Supervisor **[verify]** (lawyer note 3) | Telecommunicatiewet, art 11.7a, https://wetten.overheid.nl/BWBR0009950 |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| VAT number (btw-id) | 3 | S2 | ALL | 1 | `registry.eu.vies_vat.valid` (needs the company's VAT number). How a BV gets its VAT number after KVK registration **[verify]** (not read). See **EU Section 5 — VAT** | — [verify]; VIES via EU Section 5 |
| Small business scheme (KOR) is optional, up to EUR 20,000 turnover a calendar year | 3 | S3 | ALL (optional) | 5 | Attestation. Voluntary; BVs may join; established in the Netherlands; turnover not over EUR 20,000 per calendar year. Not joining is not a gap | Belastingdienst, Kleineondernemersregeling, https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/hoe_werkt_de_btw/nieuwe-kleineondernemersregeling/kleineondernemersregeling |
| Employer registration (loonheffingennummer) by the first employee's start date | 3 | S2 | EMPLOYEES | 4 | Slot: Belastingdienst letter with the loonheffingennummer (not public). Register with the form "Melding Loonheffingen Aanmelding werkgever" no later than the day the first employee starts | Belastingdienst, Aanmelden als werkgever, https://www.belastingdienst.nl/wps/wcm/connect/nl/personeel-en-loon/content/aanmelden-als-werkgever |
| Contractor status (no hidden employment) | 3 | S2 | CONTRACTORS | 5 | Attestation. **[verify]** current Belastingdienst enforcement rules for self-employed contractors; not read | — [verify] |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| DNB licence or registration for payment or e-money services | 3 | S2 | SECTOR.PAYMENTS, .EMONEY | 3 | DNB public register (searchable, XML/CSV daily, and an API): official list import, not built. Trigger only | DNB, Public register, https://www.dnb.nl/en/public-register/ |
| AFM licence (investment services, crypto-asset services) | 3 | S2 | SECTOR.INVESTMENT, .CRYPTO, .CREDIT | 3 | AFM licence and notification registers (searchable). Whether MiCA crypto-asset service providers are in the same register **[verify]**. Trigger only | AFM, Registers, https://www.afm.nl/en/sector/registers |
| Health or medical device rules | 3 | S3 | SECTOR.HEALTHTECH | 5 | Trigger only. See **EU Section 12 — Other EU digital rules (triggers)** | — |

### Section 9 — Consumer terms and website information

EU-wide duties are in **EU Section 3 — E-commerce information duties** and **EU Section 4 — Consumer law**. Dutch specifics:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Website identity details (BW 3:15d) | 4 | S2 | WEBSITE | 1 | `web.policy.names_company` (presence of the company name). Easily, directly and permanently available: identity and address; contact including email; the register and KVK number; supervisor if licensed; VAT number if VAT-liable; prices clear, saying whether tax and delivery are included. The scan checks the name only; a person checks the rest | BW Book 3, art 15d, https://wetten.overheid.nl/BWBR0005291 |
| Pre-contract information for distance contracts (BW 6:230m) | 4 | S3 | CONSUMER | 1 | `web.policy.terms_found`. Main characteristics, trader identity, geographic address, phone and email, and the other items in art 230m | BW Book 6, art 230m, https://wetten.overheid.nl/BWBR0005289 |
| 14-day withdrawal right (BW 6:230o) | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.refund_policy_found`; attestation. For services the period runs from the day the contract is concluded | BW Book 6, art 230o |
| Withdrawal function for online contracts | 4 | S3 | CONSUMER | 5 | **[verify]**: no Dutch provision found in Book 6 (lawyer note 2). Do not score | — [verify] |
| General terms (algemene voorwaarden) made available before or at contracting | 4 | S3 | ALL | 5 | Attestation. **[verify]** BW 6:233–234 (not read) | — [verify] |
| Accessibility of consumer e-commerce services | 4 | S3 | CONSUMER, WEBSITE | 1 | `web.policy.accessibility_found`. See **EU Section 8 — Accessibility**; Dutch implementing act and microenterprise exemption **[verify]** | — [verify] |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Share issue decided by the general meeting (or an organ named in the articles) | 5 | S4 | INVESTED | 5 | Vault: issue resolution. BW 2:206(1); also applies to granting rights to take shares (2:206(2)) | BW Book 2, art 206, https://wetten.overheid.nl/BWBR0003045 |
| New shares issued by notarial deed | 5 | S4 | INVESTED | 4 | Slot: deed of issue (akte van uitgifte). BW 2:196(1) | BW Book 2, art 196 |
| Shareholder register updated after the issue | 5 | S4 | INVESTED | 4 | Same slot as Section 2 register | BW Book 2, art 194 |
| Pre-emption rights respected or excluded | 5 | S4 | INVESTED | 5 | Attestation. **[verify]** BW 2:206a (not read) | — [verify] |
| Offer to the public may need a prospectus or an AFM-notified exemption | 5 | S4 | INVESTED (public offer) | 5 | Trigger only. National exemption threshold and any information-document duty **[verify]**. See **EU Section 10 — Fundraising and prospectus** | AFM, Registers, https://www.afm.nl/en/sector/registers |

### Section 11 — AI

The AI Act itself is in **EU Section 7 — AI Act** (as amended by Regulation (EU) 2026/1744: Annex III high-risk duties from 2 Dec 2027, Annex I from 2 Aug 2028; new Art 5(1)(ba)/(bb) prohibitions from 2 Dec 2026; Art 50(2) marking by 2 Dec 2026 for systems placed on the market before 2 Aug 2026; https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng, checked 16 Nov 2026). Dutch specifics:

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| AI transparency disclosure on the website or app | 6 | S3 | AI | 1 / 5 | `web.policy.ai_disclosure_found`; attestation for content labelling. The duty itself is EU law (EU Section 7) | EU Section 7 |
| National supervisors: AP and RDI coordinate; sector regulators supervise their sectors | 6 | S3 | AI | — | Information only. Proposed in the Uitvoeringswet AI-verordening (consultation 20 Apr – 1 Jun 2026). Not law on the pages read **[verify]** whether enacted | Rijksoverheid, Kabinet zet stap met toezicht op Europese AI-regels, https://www.rijksoverheid.nl/actueel/nieuws/2026/04/20/kabinet-zet-stap-met-toezicht-op-europese-ai-regels ; RDI, AI-verordening, https://www.rdi.nl/onderwerpen/technologische-ontwikkelingen/kunstmatige-intelligentie/ai-verordening |
| AI regulatory sandbox | 6 | S3 | AI (optional) | 5 | Information only; RDI to facilitate under the bill **[verify]** | Rijksoverheid, same page |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above:

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Annual accounts prepared | Section 3 | 5 months after year end (+ up to 5) | Attestation |
| Accounts deposited at KVK | Section 3 | 8 days after adoption; at the latest 12 months after year end | Document slot (no engine fact yet) |
| General meeting | Section 3 | Each financial year | Attestation |
| Handelsregister and UBO changes | Sections 1, 2, 4 | Within one week of the change (HRW art 20) | Document slot |
| Trademark renewal | Section 5 | Every 10 years | Document slot |

---

## 4. Counts by tier

| Tier | Items | Notes |
|---|---|---|
| 1 Official live or URL scan | 13 | KVK Basisprofiel (when the key is set), VIES and the website scan |
| 2 Licensed vendor | 0 | OpenCorporates is a fallback only, while KVK is off |
| 3 Official list import | 2 | DNB and AFM registers (not built) |
| 4 Document-verified | 14 | Notarial deeds, KVK extracts, UBO extract, accounts deposit, auditor's report, BOIP, payroll letter |
| 5 Attested (vault) | 19 | Decisions, registers, IP, KVK number on letters, contractor status |
| Information only | 5 | No minimum capital, no residency rule, central register, controller registration, AI supervisors |

Counts include items whose tier is shared (e.g. "1 / 5") under the first tier. 53 items in all, 24 of them carrying [verify].

---

## 5. The core set every Dutch tech company must show at Stage 2

1. Registered in the Handelsregister as an active BV (Tier 1: `registry.nl.kvk.identified`, `.active`, `.legal_form`, when the KVK key is set)
2. Deed of incorporation and current articles (Tier 4)
3. Shareholder register kept (Tier 4)
4. UBOs registered (Tier 4: the company's own UBO extract)
5. Accounts deposited at KVK each year (Tier 4 until an accounts source exists)
6. Privacy notice and cookie consent that meet the GDPR and art 11.7a (Tier 1, WEBSITE)
7. Website identity details under BW 3:15d (Tier 1 for the name; a person for the rest)
8. Founders' and contractors' IP assigned (Tier 5)

---

## 6. Thresholds and facts to confirm before encoding

- First financial year to which the BW 2:396 small-company figures (EUR 7.5m / EUR 15m / 50) apply.
- Book 2 amendments in force from 1 Jan 2027 (not read), including any central shareholders register.
- UBO registration deadline for new and changed UBOs.
- Whether the KVK Basisprofiel shows insolvency; the exact legal-form words.
- Which article requires the statutory seat in the Netherlands; confirm no minimum capital and no director residency rule.
- Auteurswet art 2 assignment formalities; software under art 7.
- AP: DPO notification; any registration duty (none found); children's consent age.
- Cookie supervisor (ACM or AP) and the analytics exception's practical scope.
- How a BV receives its VAT number; contractor-status rules.
- Withdrawal-function transposition (Directive (EU) 2023/2673); BW 6:233–234 on general terms.
- BW 2:206a pre-emption; prospectus national exemption threshold.
- Structure-regime thresholds.
- Uitvoeringswet AI-verordening: whether enacted, and the final list of supervisors.
- Accessibility: Dutch implementing act and microenterprise exemption.

---

## Not encoded (16 Nov 2026)

The draft pack `packages/rules/src/packs/nl.ts` (NL, version 0.1.0) holds 24 Dutch rules plus 36 EU common rules (`addEuCommon`; the EU withdrawal-function rule is replaced by the Dutch `NL.CONSUMER.WITHDRAWAL_FUNCTION`, which waits for review). These map items have no rule of their own:

| Item | Section | Why |
|---|---|---|
| Name check against the Business Register and BOIP | 1 | Pre-incorporation step; no fact answers it (the joint name checker isn't built). Being on the register is read by `NL.CORP.STATUS` |
| Company active (not ended) | 1 | Encoded as `NL.CORP.STATUS`, which cites the untagged core-set line instead. The [verify] is about insolvency, which the rule does not claim to read: it checks the registration end date only, and an ended registration is "to check", never a gap |
| KVK number on letters, orders, invoices and quotes | 1 | Covered by EU common rule `NL.CORP.COMPANY_PARTICULARS`, which cites this line |
| Registered seat (statutaire zetel) in the Netherlands | 1 | [verify] the article that requires it. The seat is in the articles, which `NL.CORP.ARTICLES` asks for |
| No minimum share capital | 2 | Information only; [verify] |
| UBOs registered in the Handelsregister | 2 | Encoded as `NL.CORP.UBO`, which cites the untagged core-set line. The [verify] is the deadline for new or changed UBOs, which the rule does not use |
| Central shareholders register (proposed) | 2 | [verify] whether it was enacted; nothing to check yet |
| No residency or nationality rule for directors | 4 | Information only; [verify] |
| Supervisory board (raad van commissarissen) | 4 | [verify] the structure-regime thresholds, which would decide who needs one |
| Statutory audit unless the small-company exemption applies | 4 | [verify] the first financial year the BW 2:396 figures apply to; the thresholds would decide who needs an audit |
| Contractor and founder IP assignment by deed | 5 | [verify] the formal requirement (Auteurswet art 2). Covered by `INTL.IP.OWNER_ASSIGNMENT` and `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| Supervisory authority is the Autoriteit Persoonsgegevens | 6 | Covered by EU common rule `NL.DP.NOTICE_AUTHORITY`, which cites this line. No Dutch complaint-route fact exists yet |
| Consent of a legal representative under 16 | 6 | Covered by EU common rule `NL.DP.CHILD_CONSENT`; no age is set, because the line carries [verify] |
| No general national registration or fee for controllers | 6 | Information only; [verify] |
| DPO notified to the AP | 6 | Covered by EU common rule `NL.DP.DPO`; the notification step is [verify] |
| Cookie consent under Telecommunicatiewet art 11.7a | 6 | Covered by EU common rules `NL.DP.COOKIE_CONSENT` and `NL.DP.COOKIE_POLICY`. The line carries [verify] on the supervisor, so those rules cite the core-set line instead. They name the AP as regulator; whether it is the ACM is open (lawyer note 3) |
| VAT number (btw-id) | 7 | Covered by EU common rule `NL.TAX.VAT_VIES`; the line carries [verify], so it isn't cited |
| Small business scheme (KOR) | 7 | Optional scheme; not joining is not a gap |
| Health or medical device rules | 8 | Trigger only, with no Dutch duty stated. AI in medical devices is covered by EU common rule `NL.AI.HIGH_RISK_PRODUCTS` |
| Website identity details (BW 3:15d) | 9 | Covered by EU common rules `NL.COM.WEBSITE_IDENTITY`, `NL.CONSUMER.PRICES` and `NL.COM.REGULATOR_NAMED`, which cite this line. The name-only scan fact (`web.policy.names_company`) is not used: it can't pass the rule on its own |
| Pre-contract information for distance contracts (BW 6:230m) | 9 | Covered by EU common rule `NL.CONSUMER.PRE_CONTRACT_INFO`, which cites this line; terms pages are checked by `INTL.COM.TERMS` |
| 14-day withdrawal right (BW 6:230o) | 9 | Covered by EU common rule `NL.CONSUMER.WITHDRAWAL`, which cites this line |
| General terms (algemene voorwaarden) | 9 | [verify] BW 6:233-234 not read; the duty itself is unconfirmed |
| Accessibility of consumer e-commerce services | 9 | Covered by EU common rule `NL.CONSUMER.ACCESSIBILITY`; the Dutch act and microenterprise exemption are [verify], so the line isn't cited |
| Pre-emption rights respected or excluded | 10 | [verify] BW 2:206a not read |
| Offer to the public may need a prospectus | 10 | Covered by EU common rule `NL.FUND.PROSPECTUS_EXEMPTION`; the national threshold is [verify] |
| National AI supervisors | 11 | Information only; [verify] whether the bill was enacted |
| AI regulatory sandbox | 11 | Information only; [verify] |

Section 12 rows are recurrences, not items: they are cited by the rules they schedule. Rules that cite a [verify] line and so wait for review: `NL.IP.EMPLOYEE_WORKS`, `NL.EMP.CONTRACTOR_STATUS`, `NL.FIN.AFM_LICENCE`, `NL.CONSUMER.WITHDRAWAL_FUNCTION`.
