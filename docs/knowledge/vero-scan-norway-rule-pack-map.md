# Vero Scan — Norway Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Sources:** Official legislation, government and regulator pages only (Lovdata, Brønnøysundregistrene, Skatteetaten, Datatilsynet, Patentstyret, Finanstilsynet, regjeringen.no, EUR-Lex). Each line gives its URL and the date checked. Secondary sources (law-firm notes, vendor blogs) were used only to find the official page and are never cited.
**Company form covered:** aksjeselskap (AS), a private limited company.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Lines marked **[verify]** must not be encoded as a pass/fail rule until the uncertainty named on the line is resolved.

**Norway is in the EEA, not the EU.** An EU rule reaches Norway only once it is taken into the EEA Agreement and made Norwegian law. Every line below that points to `docs/knowledge/vero-scan-eu-common-rule-pack-map.md` says how that rule reaches Norway, or that it does not yet.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Norwegian AS at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Sells to consumers (B2C) |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| EU_MARKET | Places products or services on the EU market (matters for EU rules not yet in EEA law) |
| SECTOR.PAYMENTS, .EMONEY, .CRYPTO, .CREDIT | Sector packs (Finanstilsynet licences), triggers only |
| INVESTED | Has raised or is raising |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a document slot) · 5 attested (vault). Routes follow the *Verification Solutions Matrix* (`docs/knowledge/vero-scan-verification-solutions.md`).

**[verify]** means: not confirmed from an official source on 16 Nov 2026. The line says exactly what is uncertain. A threshold, deadline or section number marked [verify] is a lead, not a fact.

**Source column.** "checked 16 Nov 2026" appears only where the page was read on that day. A page our tool could not read is marked **[verify]: official page not readable by our tool on 16 Nov 2026**.

### Engine facts available for Norway

All Norwegian register facts are off until `PUBLIC_API_USER_AGENT` is set (`docs/NATIONAL-REGISTERS.md`). No rule reads them yet. A miss (`identified` = null) means "not found in this register", never "does not exist".

| Fact key(s) | What it can show | What it cannot show |
|---|---|---|
| `registry.no.brreg.identified`, `org_number`, `registered_name`, `organisation_form_code` | The unit is in Enhetsregisteret, its number, name and form (AS) | That the company is in good standing beyond the flags below |
| `registry.no.brreg.status`, `bankrupt`, `under_liquidation`, `under_compulsory_dissolution`, `deleted_on` | Active, bankrupt, in liquidation, under compulsory dissolution, deleted | Why; whether a dissolution notice has been answered |
| `registry.no.brreg.in_business_register` | Registered in Foretaksregisteret (the Register of Business Enterprises) | When the 3-month registration window started |
| `registry.no.brreg.founded_on`, `registered_on` | Founding date and Enhetsregisteret registration date | The date the founding document was signed |
| `registry.no.brreg.in_vat_register` | Registered in the VAT register (Merverdiavgiftsregisteret) | Whether the company should be registered (turnover is not public) |
| `registry.no.brreg.nace_code` | Main activity code, a sector signal | That the company holds a licence |
| `registry.no.brreg.employees_band` | Head-count band (0, 1-4, 5-9, 10-49, 50-249, 250+) | Full-time equivalents (årsverk); the audit test uses årsverk |
| `registry.no.brreg.municipality`, `municipality_number` | Municipality of the business address | The full address (not kept) |
| `registry.no.brreg.share_capital`, `share_capital_currency` | Registered share capital | That it is paid in |
| `registry.no.brreg.part_of_group` | Part of a group | Who the parent is |
| `registry.no.brreg.last_accounts_year` | The year of the last annual accounts submitted to Regnskapsregisteret | That they were filed on time, or audited |
| `registry.no.brreg.roles_count`, `roles_entity_count`, `role_titles` | How many role holders, how many are organisations, and their titles (e.g. board chair, board member, daily manager, auditor) | Names, residency, age (never kept) |
| `registry.global.gleif.*` | The LEI record, if any | Anything about Norwegian law |
| `registry.sanctions.match`, `possible_match`, `lists_checked` | Company name screened against the stored sanctions lists | That the company is or is not sanctioned (a person must check) |
| `web.policy.*` | Website scan: privacy notice, its sections, cookie behaviour, terms, refund and complaints pages, AI disclosure | Legal adequacy under Norwegian law; there is no Norway-specific complaint-route or imprint fact yet |
| `github.*` | Repository licence files and dependency manifests, if GitHub is connected | Who owns the code |

**Not available for Norway:** `registry.eu.vies_vat.*` (VIES covers EU member states only, not Norway) and any EU trade mark or EU register fact.

---

## 2. Notes for the reviewing lawyer

1. **Residency rule wording differs from our brief.** Aksjeloven §6-11(1) as read on 16 Nov 2026 requires the daily manager and at least half the board to be *resident in an EEA state, the UK or Switzerland*. It does not mention nationality. The ministry may grant exemptions.
2. **The beneficial-owner register is not public** (lov om register over reelle rettighetshavere §11). The engine cannot check it; it stays a document or attestation item.
3. **VAT threshold confirmed:** NOK 50,000 in a 12-month period (merverdiavgiftsloven §2-1(1)). This replaces the [verify] in our brief.
4. **Audit thresholds:** §7-6 sets the 10-årsverk limit itself but leaves the revenue and balance thresholds to a regulation we did not read. The NOK 7 million / NOK 27 million figures are unconfirmed.
5. **AI Act:** our searches found no Norwegian AI act in force on 16 Nov 2026. A draft KI-lov went to consultation on 30 June 2025, but regjeringen.no refused our tool, so the status is [verify]. A Norwegian AS that places AI systems on the EU market is reached by the EU AI Act through that market whatever Norway does: lawyer to confirm how to word this.
6. **Cookies:** the 2024 Electronic Communications Act (ekomloven 2024, in force 1 Jan 2025) moved the cookie rule to §3-15 and raised consent to the GDPR standard. Old references to §2-7b (2003 act) are stale.
7. **Missing engine facts** that would raise several Tier 5 lines to Tier 1: a Norwegian complaint route (Datatilsynet) in the privacy notice; an ehandelsloven §8 imprint check (name, address, email, org number, VAT status); the Regnskapsregisteret filing date (not only the year).

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Registered in Foretaksregisteret within 3 months of signing the founding document | 1 | S2 | ALL | 1 | `registry.no.brreg.in_business_register`, `registered_on`, `founded_on`. If not notified within 3 months, registration cannot take place. Cannot show the signing date | Aksjeloven §2-18(1), (3): https://lovdata.no/dokument/NL/lov/1997-06-13-44/§2-18, checked 16 Nov 2026 |
| Company form is AS | 1 | S2 | ALL | 1 | `registry.no.brreg.organisation_form_code` = `AS` | Aksjeloven: https://lovdata.no/dokument/NL/lov/1997-06-13-44, checked 16 Nov 2026 |
| Company active, not bankrupt, in liquidation or under compulsory dissolution | 1 | S2 | ALL | 1 | `registry.no.brreg.status`, `bankrupt`, `under_liquidation`, `under_compulsory_dissolution`, `deleted_on`. The flags are register states; the legal grounds for compulsory dissolution are not mapped here [verify: aksjeloven chapter 16 not read] | Enhetsregisteret API documentation, read for the engine build on 16 Nov 2026 (`docs/NATIONAL-REGISTERS.md`): https://data.brreg.no/enhetsregisteret/api/dokumentasjon/en/index.html |
| Business address municipality on record | 1 | S2 | ALL | 1 | `registry.no.brreg.municipality`, `municipality_number`. The statutory basis for the address duty is not mapped [verify: enhetsregisterloven not read] | As above |
| Activity code on record | 1 | S2 | ALL | 1 | `registry.no.brreg.nace_code`. A sector signal used to switch on Section 8 triggers, not an obligation | As above |
| Company name screened against sanctions lists | 3 | S2 | ALL | 3 | `registry.sanctions.match`, `possible_match`, `lists_checked`. International pack item; Norway's own sanctions regime is not mapped here [verify] | `docs/FRANCE.md`, `docs/GLOBAL-COVERAGE.md` (engine behaviour, not law) |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Articles (vedtekter) state name, business activity, share capital and nominal value per share | 1 | S2 | ALL | 4 | Slot: vedtekter. A company not meant to give shareholders a return must also set rules on surplus on dissolution | Aksjeloven §2-2: https://lovdata.no/dokument/NL/lov/1997-06-13-44/§2-2, checked 16 Nov 2026 |
| Share capital at least NOK 30,000 | 1 | S2 | ALL | 1 | `registry.no.brreg.share_capital` ≥ 30000 and `share_capital_currency` = NOK. Cannot show the capital is paid in | Aksjeloven §3-1(1): https://lovdata.no/dokument/NL/lov/1997-06-13-44/§3-1, checked 16 Nov 2026 |
| Share register (aksjeeierbok) set up promptly after incorporation | 1 | S2 | ALL | 5 | Attestation, or Slot: aksjeeierbok. The board must keep it reliably (may be electronic): name, birth date or org number, digital and postal address, number of shares and share numbers, class. Not public; no engine fact | Aksjeloven §4-5: https://lovdata.no/dokument/NL/lov/1997-06-13-44/§4-5, checked 16 Nov 2026 |
| Annual shareholder register report (aksjonærregisteroppgaven) to Skatteetaten | 1 | S3 | ALL | 5 | Attestation. Deadline 31 January each year and the form number (RF-1086) come from secondary sources only **[verify]** | **[verify]**: no official Skatteetaten page found or readable on 16 Nov 2026 |
| Beneficial owners registered with Brønnøysund within 14 days | 1 | S2 | ALL | 4 | Slot: registration receipt from the beneficial-owner register. First registration no later than 14 days after the company is entered in a public register (§9(3)); an AS must register even if it has no beneficial owner (Brønnøysund page). No engine fact: the register is not public | Lov om register over reelle rettighetshavere §9(3): https://lovdata.no/dokument/NL/lov/2019-03-01-2, checked 16 Nov 2026; https://www.brreg.no/reelle-rettighetshavere/reelle-rettighetshavere-i-aksjeselskap/, checked 16 Nov 2026 |
| Beneficial-owner changes registered within 14 days | 1 | event-driven | ALL | 5 | Attestation. "Without delay and at the latest within 14 days" (§9(4)). Daily fines possible from 31 July 2025 (forskrift §5-1, §5-2) | Same act §9(4), checked 16 Nov 2026; forskrift 2021-06-21-2056 §§5-1, 5-2: https://lovdata.no/dokument/SF/forskrift/2021-06-21-2056, checked 16 Nov 2026 |
| Who counts as a beneficial owner | 1 | S2 | ALL | — | Note for rule text: more than 25% of shares or votes, right to appoint or remove more than half the board, or control by other means; direct, indirect or by agreement | https://www.brreg.no/reelle-rettighetshavere/reelle-rettighetshavere-i-aksjeselskap/, checked 16 Nov 2026 |
| Beneficial-owner data is not open to the public | 1 | — | — | — | Note: access is for obliged entities, authorities, media, civil society and higher education (§11(1)). Explains why this stays Tier 4/5 | Lov om register over reelle rettighetshavere §11: https://lovdata.no/dokument/NL/lov/2019-03-01-2, checked 16 Nov 2026 |
| EU UBO rules | 1 | — | — | — | Refer to "EU Section 6 — Beneficial ownership (AML)". Reaches Norway through the EEA Agreement and the Norwegian act above; whether the 2024 EU AML package (AMLR/AMLD6) is in EEA law is **[verify]** | EU common map |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| AS keeps accounts under the Accounting Act | 1 | S2 | ALL | — | Note: aksjeselskaper are listed first in §1-2(1) | Regnskapsloven §1-2: https://lovdata.no/dokument/NL/lov/1998-07-17-56, checked 16 Nov 2026 |
| Annual accounts adopted within 6 months of year end | 1 | S3 | ALL | 5 | Attestation. For a calendar year: by 30 June | Regnskapsloven §3-1(2): https://lovdata.no/dokument/NL/lov/1998-07-17-56, checked 16 Nov 2026 |
| Ordinary general meeting within 6 months of year end, approving the accounts and any dividend | 1 | S3 | ALL | 4 | Slot: generalforsamlingsprotokoll (minutes) | Aksjeloven §5-5: https://lovdata.no/dokument/NL/lov/1997-06-13-44/§5-5, checked 16 Nov 2026 |
| Annual accounts sent to Regnskapsregisteret within 1 month of adoption | 1 | S3 | ALL | 1 | `registry.no.brreg.last_accounts_year`: after 31 July, a value older than the previous calendar year suggests a late filing (for a calendar-year company). Cannot show the filing date, the content or whether it was audited. Annual report and auditor's report go with it | Regnskapsloven §8-2: https://lovdata.no/dokument/NL/lov/1998-07-17-56, checked 16 Nov 2026 |
| Filed accounts are public | 1 | — | — | — | Note: anyone may read them at Regnskapsregisteret (§8-1) | Regnskapsloven §8-1, checked 16 Nov 2026 |
| EU accounts and company-law directives | 1 | — | — | — | Refer to "EU Section 9 — Company law and accounts". Reach Norway through the EEA Agreement as implemented in regnskapsloven and aksjeloven | EU common map |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Board registered | 1 | S2 | ALL | 1 | `registry.no.brreg.roles_count` > 0 and `role_titles` includes a board role. Statutory board-size rule (aksjeloven §6-1) not read **[verify]** | Enhetsregisteret API documentation (engine build, 16 Nov 2026) |
| Daily manager and at least half the board resident in the EEA, UK or Switzerland | 1 | S2 | ALL | 5 | Attestation per role holder. The engine keeps no names or addresses, so it cannot check this. The ministry may grant an individual exemption: Slot for the exemption decision if relied on | Aksjeloven §6-11(1): https://lovdata.no/dokument/NL/lov/1997-06-13-44/§6-11, checked 16 Nov 2026 (last amended by law of 16 June 2023 no. 67, in force 1 July 2023) |
| Board members are of age | 1 | S2 | ALL | 5 | Attestation | Aksjeloven §6-11(2), checked 16 Nov 2026 |
| Daily manager (daglig leder) appointed | 1 | S2 | ALL | 1 | `registry.no.brreg.role_titles` includes daily manager. Whether a daily manager is mandatory for every AS (aksjeloven §6-2) **[verify]**: section not read | **[verify]**: aksjeloven §6-2 not read |
| Auditor appointed, unless audit validly opted out | 1 | S2 | ALL | 1 / 4 | `registry.no.brreg.role_titles` includes auditor (revisor). If none: Slot for the general-meeting decision to opt out. Opt-out allowed only if revenue and balance are below thresholds set by regulation and average årsverk do not exceed 10; decided by the majority needed to amend the articles. `employees_band` is a head count, not årsverk: a hint only | Aksjeloven §7-6(1): https://lovdata.no/dokument/NL/lov/1997-06-13-44/§7-6, checked 16 Nov 2026 |
| Audit opt-out thresholds: revenue under NOK 7 million, balance under NOK 27 million | 1 | S2 | ALL | — | **[verify]**: the figures are in a regulation under §7-6 that we did not read; NOK 7m / 27m come from secondary sources. Whether an opt-out must reach Foretaksregisteret by 15 January to apply is also **[verify]** | **[verify]**: regulation under aksjeloven §7-6 not read |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Employee inventions: employer's right to claim | 2 | S2 | EMPLOYEES | 5 | Slot: employment contract IP clause. The employer may claim an invention made within the employee's research or assigned duties and within the business's field (§4); the employee must notify in writing without undue delay (§5); the employer must claim in writing within 4 months of the notice (§6); the employee is entitled to reasonable compensation unless the value is covered by pay (§7) | Arbeidstakeroppfinnelsesloven §§4-7: https://lovdata.no/dokument/NL/lov/1970-04-17-21, checked 16 Nov 2026 |
| Software written by employees belongs to the employer | 2 | S2 | EMPLOYEES | 5 | Attestation. Copyright in a program made by an employee in the course of work or on the employer's instructions passes to the employer, unless agreed otherwise | Åndsverkloven §71: https://lovdata.no/dokument/NL/lov/2018-06-15-40, checked 16 Nov 2026 |
| Contractors and founders assign IP in writing | 2 | S1 | ALL (founders), CONTRACTORS | 5 | Slot: IP assignment agreement. Neither act above names contractors: the inventions act covers "arbeidstakere" and §71 covers employees. That no statutory transfer applies to contractors and founders is our reading **[verify]** | Same two acts, checked 16 Nov 2026 |
| Trademark registered with Patentstyret | 2 | S2 | ALL | 4 | Slot: registration certificate. 10 years from application date; renewable every 10 years. A Norwegian application covers Norway only | https://www.patentstyret.no/varemerke/, checked 16 Nov 2026 |
| EU trade mark does not cover Norway | 2 | — | — | — | Note: refer to "EU Section 11 — EU trade mark". The Patentstyret page says a Norwegian filing covers only Norway but does not mention the EU mark; that an EU mark gives no protection in Norway is **[verify]** | https://www.patentstyret.no/varemerke/, checked 16 Nov 2026 |

### Section 6 — Data protection and cookies

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| GDPR applies as Norwegian law; national authority is Datatilsynet | 3 | S2 | PERSONAL_DATA | — | Refer to "EU Section 1 — GDPR". Reaches Norway through the EEA Agreement and personopplysningsloven; the GDPR prevails over conflicting Norwegian law | https://www.datatilsynet.no/regelverk-og-verktoy/lover-og-regler/om-personopplysningsloven-og-nar-den-gjelder/, checked 16 Nov 2026 |
| Privacy notice published | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `names_company`, `rights_section`, `retention_statement`, `transfers_section`, `dpo_contact` (EU Section 1). A complaint route naming Datatilsynet cannot be checked: no such fact yet | EU common map; Datatilsynet page above |
| Children's consent: age 13 for online services | 3 | S2 | CONSUMER (services offered to children) | 1 / 5 | `web.policy.children_section` shows a children section exists; adequacy needs review | Personopplysningsloven §5: https://lovdata.no/dokument/NL/lov/2018-06-15-38/§5, checked 16 Nov 2026 |
| DPO designated where GDPR Art 37 applies | 3 | S2 | PERSONAL_DATA (Art 37 tests) | 5 + 1 | Attestation; `web.policy.dpo_contact`. No public Norwegian DPO list is known to us **[verify]** | EU common map, EU Section 1 |
| No general registration or fee duty with Datatilsynet | 3 | — | — | — | Note: we found no Norwegian equivalent of the UK ICO fee. Absence is **[verify]** | **[verify]**: no official page states this |
| Records, DPIA, processor agreements, breach notification | 3 / 6 | S2 | PERSONAL_DATA | 5 | Attestation; refer to EU Section 1 (same rules via EEA) | EU common map |
| Cookie consent to the GDPR standard before non-essential storage | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `cookies_before_consent_count`, `trackers_before_consent_count` = 0, `cookie_policy_found`. Exceptions: storage solely to transmit communication, or strictly necessary for a service the user asked for. Refer also to "EU Section 2 — ePrivacy and cookies" | Ekomloven 2024 §3-15: https://lovdata.no/dokument/NL/lov/2024-12-13-76/§3-15, checked 16 Nov 2026 (act in force 1 Jan 2025) |
| Who supervises cookie consent | 3 | — | — | — | Note: §3-15 names no authority. Split between Nkom and Datatilsynet is **[verify]** | Ekomloven 2024 §3-15, §1-4, checked 16 Nov 2026 |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| VAT registration once taxable turnover passes NOK 50,000 in 12 months | 3 | S3 | ALL | 1 | `registry.no.brreg.in_vat_register`. Cannot show turnover, so "not registered" is a gap only if the company says it passed the threshold. The EU VAT Directive does not apply to Norway; `registry.eu.vies_vat.*` is not used | Merverdiavgiftsloven §2-1(1): https://lovdata.no/dokument/NL/lov/2009-06-19-58/§2-1, checked 16 Nov 2026 |
| Monthly a-melding to Nav, SSB and Skatteetaten | 3 | S2 | EMPLOYEES | 5 | Attestation. `registry.no.brreg.employees_band` above 0 switches the trigger on. Who must file and the monthly deadline are **[verify]** (on a linked page not read) | https://www.skatteetaten.no/bedrift-og-organisasjon/arbeidsgiver/a-meldingen/, checked 16 Nov 2026 |
| Mandatory occupational pension (OTP) scheme | 3 | S2 | EMPLOYEES | 4 | Slot: pension scheme agreement. Applies if any of: two people (owners included) each at 75% or more of a full position; one non-owner employee at 75% or more; or several people at 20% or more together making two årsverk | OTP-loven §1(1), §2-1: https://lovdata.no/dokument/NL/lov/2005-12-21-124/§2-1, checked 16 Nov 2026 |
| Occupational injury insurance (yrkesskadeforsikring) | 3 | S2 | EMPLOYEES | 4 | Slot: insurance certificate. **[verify]**: yrkesskadeforsikringsloven not read | **[verify]**: not read |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Payment institution licence (betalingsforetak) | 3 | S2 | SECTOR.PAYMENTS | 4 | Slot: Finanstilsynet licence. A register import is not built | https://www.finanstilsynet.no/tillatelser/, checked 16 Nov 2026 |
| E-money institution licence (e-pengeforetak) | 3 | S2 | SECTOR.EMONEY | 4 | Slot: Finanstilsynet licence | Same page, checked 16 Nov 2026 |
| Crypto-asset services (MiCA) | 3 | S2 | SECTOR.CRYPTO | 4 | Slot: authorisation. Finanstilsynet lists MiCA as a topic; MiCA's status in EEA/Norwegian law is **[verify]** | Same page, checked 16 Nov 2026 |
| Lending and lending intermediation | 3 | S2 | SECTOR.CREDIT | 4 | Slot: licence (finansieringsforetak licence; låneformidling rules) | Same page, checked 16 Nov 2026 |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Website shows name, address, email, business register, organisation number and VAT status | 4 | S2 | WEBSITE | 5 | Attestation until an imprint fact exists. Also any required approvals and the approving authority. Information must be easy and direct to reach. Refer to "EU Section 3 — E-commerce information duties" (reaches Norway through ehandelsloven) | Ehandelsloven §8: https://lovdata.no/dokument/NL/lov/2003-05-23-35/§8, checked 16 Nov 2026 |
| Pre-contract information for distance sales | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.terms_found`; content checked in review. List in §8(1) letters a–r, including the withdrawal right (letter h) | Angrerettloven §8: https://lovdata.no/dokument/NL/lov/2014-06-20-27, checked 16 Nov 2026 |
| 14-day right of withdrawal explained | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.refund_policy_found`. 14 days from contract (services) or receipt (goods); extended up to 12 months if the withdrawal information is missing (§21). Exceptions in §22. Refer to "EU Section 4 — Consumer law" | Angrerettloven §§20-22, checked 16 Nov 2026 |
| Consumer purchase terms do not undercut forbrukerkjøpsloven | 4 | S3 | CONSUMER (goods) | 5 | Attestation. **[verify]**: forbrukerkjøpsloven not read | **[verify]**: not read |
| Website and app accessibility (universal design) | 4 | S3 | WEBSITE / APP | 1 / 5 | `web.policy.accessibility_found`. Refer to "EU Section 8 — Accessibility". Whether Norwegian universal-design rules for ICT bind a private tech company, and EEA status of the European Accessibility Act, are **[verify]** | **[verify]**: not read |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Share capital increase decided by the general meeting | 5 | S4 | INVESTED | 4 | Slot: general-meeting minutes. The decision states amount, nominal value, price, who may subscribe and the deadline; subscription period at most 3 months | Aksjeloven §10-1: https://lovdata.no/dokument/NL/lov/1997-06-13-44/§10-1, checked 16 Nov 2026 |
| Capital increase registered within 3 months after the subscription deadline | 5 | S4 | INVESTED | 1 | `registry.no.brreg.share_capital` rises between scans. Contributions must be paid and confirmed (auditor, or for cash a bank, lawyer or state-authorised accountant). If late, registration cannot take place and subscriptions lapse | Aksjeloven §10-9: https://lovdata.no/dokument/NL/lov/1997-06-13-44/§10-9, checked 16 Nov 2026 |
| Share register updated after the issue | 5 | S4 | INVESTED | 5 | Attestation (see Section 2) | Aksjeloven §4-5, checked 16 Nov 2026 |
| Public offer may need a prospectus | 5 | S4 | INVESTED (offer to the public) | — | Trigger only. Refer to "EU Section 10 — Fundraising and prospectus"; the Norwegian thresholds under verdipapirhandelloven are **[verify]** | **[verify]**: not read |

### Section 11 — AI

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| EU AI Act not yet Norwegian law | 6 | — | AI | — | Note: we found no Norwegian AI act in force on 16 Nov 2026. A draft "KI-lov" to implement the AI Act went to consultation on 30 June 2025. EEA incorporation and adoption status **[verify]** | **[verify]**: https://www.regjeringen.no/id3112327/: official page not readable by our tool on 16 Nov 2026 |
| Nkom as coordinating AI supervisor | 6 | — | AI | — | Note: proposed, not confirmed as in force **[verify]** | **[verify]**: same page |
| AI Act obligations when selling AI into the EU | 6 | S3 | AI, EU_MARKET | 5 | Attestation. Refer to "EU Section 7 — AI Act". Dates as amended by Regulation (EU) 2026/1744: new Art 5(1)(ba)/(bb) prohibitions from 2 Dec 2026; Art 50(2) marking for systems placed on the market before 2 Aug 2026 by 2 Dec 2026; Annex III high-risk from 2 Dec 2027; Annex I from 2 Aug 2028 | https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng, checked 16 Nov 2026 |
| AI use disclosed on the website | 6 | S3 | AI, WEBSITE | 1 | `web.policy.ai_disclosure_found`. Presence only | EU common map, EU Section 7 |

### Section 12 — Compliance calendar

Not new items. These become `recurrence` fields on the rules above.

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Annual accounts adopted | Section 3 | 6 months after year end (30 June for a calendar year) | Attestation |
| Ordinary general meeting | Section 3 | 6 months after year end | Attestation; minutes upload |
| Accounts to Regnskapsregisteret | Section 3 | 1 month after adoption (31 July at the latest for a calendar year) | Auto: `registry.no.brreg.last_accounts_year` |
| Shareholder register report | Section 2 | 31 January **[verify]** | Attestation |
| Beneficial-owner changes | Section 2 | Within 14 days of a change | Attestation |
| A-melding | Section 7 | Monthly (deadline **[verify]**) | Attestation |
| VAT returns | Section 7 | Period **[verify]** | Attestation |
| Audit opt-out registration | Section 4 | By 15 January **[verify]** | Attestation |
| Trademark renewal | Section 5 | Every 10 years | Attestation; certificate date |

---

## 4. Counts by tier

| Tier | Items | What this means |
|---|---|---|
| 1 Official live or URL scan | 20 (14 pure; 6 mixed 1 / 4, 1 / 5 or 5 + 1) | Brønnøysund covers registration, status, capital, VAT registration, roles and the accounts year; the website scan covers privacy, cookies, terms and AI disclosure |
| 2 Licensed vendor | 0 | Not needed: the register is free and official |
| 3 Official list import | 1 | Sanctions lists |
| 4 Document-verified | 11 | Articles, beneficial-owner receipt, general-meeting minutes, pension agreement, insurance, licences, trademark certificate |
| 5 Attested | 15 | Share register, residency, IP, data-protection records, a-melding, consumer terms |
| Notes (no tier) | 14 | Context lines a rule can quote, not checks |

Total in Sections 1–11: 61 lines (47 checkable items, 14 notes). 21 of them carry **[verify]**, plus 4 calendar lines in Section 12.

---

## 5. The core set every Norwegian tech company must show at Stage 2

1. Registered in Foretaksregisteret, form AS, active with no bankruptcy, liquidation or dissolution flag (Tier 1).
2. Share capital at least NOK 30,000 (Tier 1).
3. Board and, where required, a daily manager on record (Tier 1); residency rule met (Tier 5).
4. Auditor on record, or a valid opt-out (Tier 1 / 4).
5. Beneficial owners registered within 14 days, even if none (Tier 4).
6. Articles and share register in place (Tier 4 / 5).
7. Privacy notice and GDPR-standard cookie consent on the website (Tier 1, WEBSITE).
8. Website shows ehandelsloven §8 information (Tier 5 until an imprint fact exists).
9. Founders' and contractors' IP assigned in writing (Tier 5).

Everything else switches on through a trigger.

---

## 6. Thresholds and facts to confirm before encoding

- Audit opt-out revenue and balance thresholds (NOK 7m / NOK 27m from secondary sources) and the 15 January registration rule.
- Whether every AS must have a daily manager (aksjeloven §6-2) and the board-size rule (§6-1).
- Aksjonærregisteroppgaven: deadline (31 January) and form number.
- A-melding monthly deadline; VAT return periods.
- Occupational injury insurance duty (yrkesskadeforsikringsloven).
- Forbrukerkjøpsloven content for B2C terms.
- Accessibility: Norwegian universal-design rules for private ICT, and EEA status of the European Accessibility Act.
- AI Act: EEA incorporation, the KI-lov's adoption and commencement, and Nkom's designation.
- MiCA and the 2024 EU AML package: EEA incorporation status.
- Prospectus thresholds under verdipapirhandelloven.
- Cookie supervision split between Nkom and Datatilsynet.
- That an EU trade mark gives no protection in Norway.
- That no statutory IP transfer applies to contractors and founders.
- That Datatilsynet runs no registration or fee scheme, and has no public DPO list.
- Compulsory-dissolution grounds (aksjeloven chapter 16) and the statutory basis for the business address.
- Norway's national sanctions regime, if a Norway-specific list is wanted.

---

## Not encoded (16 Nov 2026)

Rule pack `packages/rules/src/packs/no.ts`, version 0.1.0 (draft): 26 Norwegian rules plus the 25 EU common rules that reach Norway through the EEA (`eu-common.ts` with `eu: false`). No AI Act rule: it was not Norwegian law on 16 Nov 2026. The status and board rules cite the section 5 core-set lines, because their own lines carry a [verify] on something the rule doesn't decide (the dissolution grounds, the board size). One rule rests on a [verify] line and can only say "to check": `NO.EMP.A_MELDING`.

| Item | Section | Why |
|---|---|---|
| Company active, not bankrupt, in liquidation or under compulsory dissolution | Section 1 | Encoded as `NO.CORP.STATUS` through the core-set line (its own line is [verify] on the legal grounds) |
| Business address municipality on record | Section 1 | [verify]: statutory basis not mapped |
| Activity code on record | Section 1 | A sector signal, not an obligation |
| Company name screened against sanctions lists | Section 1 | [verify]; covered by `INTL.SANCT.SCREENING` |
| Annual shareholder register report | Section 2 | [verify]: deadline and form number |
| Who counts as a beneficial owner; data not public; EU UBO rules | Section 2 | Notes |
| AS keeps accounts; filed accounts are public; EU accounts directives | Section 3 | Notes |
| Board registered | Section 4 | Encoded as `NO.CORP.BOARD` through the core-set line ([verify] on the board size, which the rule doesn't decide) |
| Daily manager appointed | Section 4 | [verify]: whether every AS must have one |
| Audit opt-out thresholds | Section 4 | [verify]: the figures would decide, so no auditor on record is "to check" in `NO.CORP.AUDITOR` |
| Contractors and founders assign IP in writing | Section 5 | [verify]; covered by `INTL.IP.OWNER_ASSIGNMENT` and `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| EU trade mark does not cover Norway | Section 5 | Note, [verify] |
| GDPR applies as Norwegian law | Section 6 | Note: the EU common rules carry it |
| Privacy notice; records, DPIA, processor agreements, breaches; cookie consent | Section 6 | Covered by the EU common rules (`NO.DP.*`, `NO.AI.DPIA`), which cite these lines |
| DPO designated | Section 6 | [verify] on a Norwegian list; covered by `NO.DP.DPO` (EU common) |
| No registration or fee duty with Datatilsynet | Section 6 | Note, [verify] |
| Who supervises cookie consent | Section 6 | Note, [verify] |
| Occupational injury insurance | Section 7 | [verify]: act not read |
| Crypto-asset services (MiCA) | Section 8 | [verify]: EEA status |
| Website information; pre-contract information; 14-day withdrawal | Section 9 | Covered by the EU common rules (`NO.COM.WEBSITE_IDENTITY`, `NO.CONSUMER.PRE_CONTRACT_INFO`, `NO.CONSUMER.WITHDRAWAL`) |
| Consumer terms and forbrukerkjøpsloven | Section 9 | [verify] |
| Accessibility (universal design) | Section 9 | [verify] |
| Public offer may need a prospectus | Section 10 | [verify] |
| EU AI Act not yet Norwegian law; Nkom | Section 11 | Notes, [verify] |
| AI Act obligations when selling AI into the EU | Section 11 | No fact says the company sells into the EU. A Norwegian company with users in an EU country that has a pack gets that pack's AI Act rules as a market overlay |
| Compliance calendar | Section 12 | Not items. Accounts adoption (6 months) and filing (31 July) are on their rules; the [verify] dates are not encoded |
