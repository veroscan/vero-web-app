# Vero Scan — Czechia Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company form covered:** společnost s ručením omezeným (s.r.o.), a private limited company, in technology.
**Sources:** official legislation, government and regulator pages only, each with its URL and the date checked. Secondary sources (law firm notes, news) were used only to find official pages, and are never cited.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Rules common to every EU country are in `vero-scan-eu-common-rule-pack-map.md`; this map adds only what is Czech.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Czech s.r.o. at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | B2C product |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| INVESTED | Has raised or is raising |
| SECTOR.PAYMENTS, .CREDIT, .CRYPTO, .BANKING, .TELECOMS, .HEALTHTECH | Sector packs: trigger only, no licence content in this map |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a document slot) · 5 attested (the customer confirms, optionally with evidence).

**[verify]** means the item, threshold or deadline could not be confirmed from an official source on 16 Nov 2026, or was read only in part. The note says exactly what is uncertain. Nothing marked [verify] should be encoded as a hard rule until a lawyer confirms it.

**How Czech law was read.** The official collection, e-Sbírka (`https://e-sbirka.gov.cz`), is built in the browser and gave our reader no text on 16 Nov 2026. The statute texts below were therefore read on `zakonyprolidi.cz`, a private publisher of the official texts, and each row links the official e-Sbírka address next to it. Each citation should be confirmed against e-Sbírka before encoding. This is the main reason for many [verify] marks.

### Engine facts available for this country

| Fact key | What it can show | What it cannot show |
|---|---|---|
| `registry.cz.ares.identified` | The IČO or name was found in ARES (Ministry of Finance) | A miss is unknown (null), never "does not exist" |
| `registry.cz.ares.ico` | The company's IČO | — |
| `registry.cz.ares.registered_name` | Registered business name | — |
| `registry.cz.ares.status` | `active`, `ceased` or `unknown` | Good standing; whether filings are up to date |
| `registry.cz.ares.legal_form_code` | ARES legal-form code (s.r.o. is 112 [verify code against ARES code list]) | — |
| `registry.cz.ares.established_on`, `registry.cz.ares.ceased_on` | Dates of establishment and ending | — |
| `registry.cz.ares.in_public_register` | Active record in the public registers (veřejný rejstřík) source | Which documents are in the sbírka listin |
| `registry.cz.ares.public_register_file` | File number (spisová značka) in the commercial register | — |
| `registry.cz.ares.vat_payer` | Active in the VAT payer source | Whether it should be registered (turnover is not public) |
| `registry.cz.ares.vat_number_present` | Has a DIČ on record | A DIČ alone is a tax ID, not VAT registration |
| `registry.cz.ares.insolvency_record_active` | Active record in the insolvency register source | The kind or stage of the insolvency matter |
| `registry.cz.ares.nace_codes`, `registry.cz.ares.region` | Activity codes; region of the seat | — |
| `registry.eu.vies_vat.valid`, `.request_date`, `.name_matches` | EU VAT number valid in VIES today | Past registration; filing compliance |
| `registry.global.gleif.*` | LEI record and its status, if the company has one | Anything about Czech filings |
| `registry.sanctions.match`, `.possible_match`, `.lists_checked` | Company name screened against the configured lists | Officers or owners (not screened) |
| `web.policy.*` | Website scan: privacy notice and its sections, DPO contact, cookie banner and trackers before consent, terms, refund and complaints pages, AI disclosure | Legal adequacy under Czech law; there is no Czech complaint-route fact (the `complaint_route_ico` and `complaint_route_ndpc` facts are UK and Nigeria only) |

ARES does **not** give directors, shareholders, beneficial owners, accounts filed or their dates. Those need the commercial register (`or.justice.cz`), for which the engine has no connector yet, or a document slot.

---

## 2. Notes for the reviewing lawyer

1. **Audit thresholds changed.** The consolidated Accounting Act in force from 1 Jan 2026 (version 40) requires an audit only for medium and large entities (§ 20(1)), and the small-entity ceiling is now CZK 120m assets / CZK 240m net turnover / 50 employees (§ 1b(2)). The earlier rule that a small s.r.o. above CZK 40m / 80m / 50 needed an audit is not in that text. Please confirm, because this removes the audit duty for most startups.
2. **Beneficial-owner register no longer public.** The Ministry of Justice portal says it closed public access to the register (evidence skutečných majitelů) on 17 Dec 2025. The engine cannot read it; the route is a document slot (the company's own extract).
3. **Accounts deadline for unaudited companies.** § 21a(2) sets "within 30 days of audit and approval, and at the latest 12 months after the balance-sheet date" for audited entities. For unaudited ones, § 21a(4) points back to that period. We read it as "at the latest 12 months after the balance-sheet date" but marked it [verify].
4. **Software made by contractors.** Under the Copyright Act § 58, a computer program made on commission is treated as an employee work, and the commissioning party exercises the economic rights. This is a Czech default that favours the company. It does not cover inventions made by contractors (§ 9 of the Patent Act is about employees only).
5. **New employer reporting from 1 Jul 2026.** ČSSZ now requires the employer to register at least 2 working days before the first employee starts, and every employee to be registered before they start work. This is new and should be checked against the implementing law, which we did not read.
6. **Czech AI Act law not confirmed adopted.** We found no official text of a Czech act designating AI Act authorities. Secondary sources name ČTÚ as the proposed main authority.

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Company registered in the commercial register | 1 | S2 | ALL | 1 | `registry.cz.ares.identified`, `registry.cz.ares.in_public_register`, `registry.cz.ares.public_register_file`; a miss is unknown, not "not registered" | ARES OpenAPI (see `docs/NATIONAL-REGISTERS.md`); Act 304/2013 Sb. § 48: https://e-sbirka.gov.cz/sb/2013/304 (text read at https://www.zakonyprolidi.cz/cs/2013-304) |
| Company active, not ceased | 1 | S2 | ALL | 1 | `registry.cz.ares.status`, `registry.cz.ares.ceased_on` | ARES (as above) |
| No active insolvency record | 1 | S2 | ALL | 1 | `registry.cz.ares.insolvency_record_active` = false; true means a person must look, it is not a finding of insolvency | ARES (as above) |
| Register entries kept current | 1 | event-driven | ALL | 5 | Attestation. File changes "without undue delay" after the event (§ 11(2)); after 15 days anyone with a legal interest may file (§ 11(3)) | Act 304/2013 Sb. § 11: https://www.zakonyprolidi.cz/cs/2013-304 |
| Registered office (sídlo) | 1 | S2 | ALL | 1 / 5 | `registry.cz.ares.region` shows a seat exists; that the address is real and usable is an attestation | Act 304/2013 Sb. § 25: https://www.zakonyprolidi.cz/cs/2013-304 |
| Commercial-register extract (výpis) | 1 | S2 | ALL | 4 | Slot: Výpis z obchodního rejstříku; extract fields and cross-check with ARES | Public register portal: https://or.justice.cz/ias/ui/rejstrik (read 16 Nov 2026; it also says a new portal is in trial operation) |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Founding contract as a notarial deed | 1 | S2 | ALL | 4 | Slot: Společenská smlouva (notarial deed). A founding contract of a capital company must be a public deed (§ 8) | Act 90/2012 Sb. (ZOK) § 8: https://e-sbirka.gov.cz/sb/2012/90 (text read at https://www.zakonyprolidi.cz/cs/2012-90, version of 19 Jul 2024 [verify later amendments]) |
| Founding contract filed in the sbírka listin | 1 | S2 | ALL | 4 | Slot: same document; the founding act and each amendment with a full updated text go into the collection of documents (§ 66(a)) | Act 304/2013 Sb. § 66: https://www.zakonyprolidi.cz/cs/2013-304 |
| Minimum contribution | 1 | S2 | ALL | 5 | Attestation. Default minimum contribution is CZK 1 unless the contract sets more (§ 142) | ZOK § 142: https://www.zakonyprolidi.cz/cs/2012-90 |
| List of members (seznam společníků) kept | 1 | S2 | ALL | 4 | Slot: Seznam společníků. The company keeps it (§ 139); members and their shares are also written in the register (304/2013 § 48(1)(j)) | ZOK § 139: https://www.zakonyprolidi.cz/cs/2012-90 |
| Beneficial owner registered | 1 | S2 | ALL | 4 | Slot: Výpis z evidence skutečných majitelů (the company's own full extract). Register "without undue delay" after the relevant event (§ 9(1)) | Act 37/2021 Sb. §§ 8–9: https://e-sbirka.gov.cz/sb/2021/37 (text read at https://www.zakonyprolidi.cz/cs/2021-37, version valid 1 Jan 2025 – 31 Dec 2026) |
| Beneficial owner data kept current | 1 | event-driven | ALL | 4 / 5 | Slot as above, re-uploaded after a change in owners; attestation between uploads | Act 37/2021 Sb. § 9(1): https://www.zakonyprolidi.cz/cs/2021-37 |
| Consequences of no registered owner | 1 | S2 | ALL | — | Not a separate check: explains severity. No profit share to an unregistered owner (§ 53); no voting rights at the general meeting (§ 54); offence with a fine up to CZK 500,000 (§ 55) | Act 37/2021 Sb. §§ 53–55: https://www.zakonyprolidi.cz/cs/2021-37 |
| Beneficial-owner register not public | 1 | — | — | — | Not an item: the engine cannot look the owner up. Public access closed 17 Dec 2025 | ESM portal: https://esm.justice.cz/ (read 16 Nov 2026) |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Annual general meeting approves the accounts | 1 | S2 (annual) | ALL | 5 | Attestation; slot for the minutes. The meeting must review the regular accounts within 6 months of the end of the previous accounting period (§ 181(2)), and be called at least once per period (§ 181(1)) | ZOK § 181: https://www.zakonyprolidi.cz/cs/2012-90 |
| Annual accounts filed in the sbírka listin | 1 | S2 (annual) | ALL | 4 | Slot: Účetní závěrka (with proof of filing). Companies in the register must publish by filing in the collection of documents (§ 21a(1), (4); 304/2013 § 66(c)) | Act 563/1991 Sb. § 21a: https://e-sbirka.gov.cz/sb/1991/563 (text read at https://www.zakonyprolidi.cz/cs/1991-563, version 1 Jan 2026 – 9 Jan 2028) |
| Filing deadline | 1 | S2 (annual) | ALL | 4 | Audited: within 30 days of audit and approval, at the latest 12 months after the balance-sheet date (§ 21a(2)). Unaudited: we read "at the latest 12 months after the balance-sheet date" via § 21a(4) **[verify]** | Act 563/1991 Sb. § 21a(2), (4): https://www.zakonyprolidi.cz/cs/1991-563 |
| Small or micro: income statement need not be published | 1 | S2 | ALL | — | Not an item: explains what may be missing from the filed accounts (§ 21a(9)) | Act 563/1991 Sb. § 21a(9): https://www.zakonyprolidi.cz/cs/1991-563 |
| Court action for accounts missing two years | 1 | S2 | ALL | — | Severity note: after two consecutive periods unfiled, the court orders filing within 1 month; failure can lead to dissolution (§ 105a); procedural fine up to CZK 100,000 (§ 104) | Act 304/2013 Sb. §§ 104–105a: https://www.zakonyprolidi.cz/cs/2013-304 |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| At least one jednatel | 1 | S2 | ALL | 4 | Slot: Výpis z obchodního rejstříku (ARES has no officers). The statutory body is one or more jednatelé (§ 194(1)) | ZOK § 194: https://www.zakonyprolidi.cz/cs/2012-90 |
| Vacant jednatel replaced within 1 month | 1 | event-driven | ALL | 5 | Attestation. If a director's office ends without a successor, the general meeting elects a new one within 1 month (§ 198(1)) | ZOK § 198: https://www.zakonyprolidi.cz/cs/2012-90 |
| Directors not disqualified | 1 | S2 | ALL | 5 | Attestation (§ 46: impediments such as disqualification orders) | ZOK § 46: https://www.zakonyprolidi.cz/cs/2012-90 |
| Director residency | 1 | — | — | — | No residency or nationality rule found in ZOK for a jednatel **[verify]**: confirm none applies | ZOK: https://www.zakonyprolidi.cz/cs/2012-90 |
| Director appointment decisions filed | 1 | event-driven | ALL | 4 | Slot: appointment and removal decisions go into the sbírka listin (§ 66(b)) | Act 304/2013 Sb. § 66(b): https://www.zakonyprolidi.cz/cs/2013-304 |
| Statutory audit | 1 | S3 (annual) | ALL (medium and large entities only) | 4 | Slot: Zpráva auditora. Medium and large entities must be audited (§ 20(1)). Medium = above two of CZK 120m assets, CZK 240m net turnover, 50 employees (§ 1b(2)–(3)). **[verify]** that no other audit duty applies to a small s.r.o. (see note 1) | Act 563/1991 Sb. §§ 1b, 20: https://www.zakonyprolidi.cz/cs/1991-563 |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Employee works: employer exercises the rights | 2 | S2 | EMPLOYEES | 5 | Attestation that work is done within employment duties. The employer exercises the economic rights to an employee work in its own name, unless agreed otherwise (§ 58(1)). Personal (moral) rights stay with the author | Act 121/2000 Sb. § 58(1): https://e-sbirka.gov.cz/sb/2000/121 (text read at https://www.zakonyprolidi.cz/cs/2000-121) |
| Commissioned software treated as employee work | 2 | S2 | CONTRACTORS | 5 | Attestation plus contract in the vault. Computer programs and databases made on commission count as employee works; the commissioning party is treated as the employer (§ 58(7)) | Act 121/2000 Sb. § 58(7): https://www.zakonyprolidi.cz/cs/2000-121 |
| Other commissioned works: licence only | 2 | S2 | CONTRACTORS | 5 | Attestation. For other commissioned works (designs, text) the author is presumed to grant a licence only for the contract's purpose (§ 61(1)); a written assignment or broad licence is needed | Act 121/2000 Sb. § 61: https://www.zakonyprolidi.cz/cs/2000-121 |
| Employee inventions: notice and 3-month claim | 2 | S3 | EMPLOYEES | 5 | Attestation. The right to the patent passes to the employer unless agreed otherwise; the employee must notify in writing; if the employer does not claim within 3 months the right returns; the employee is owed reasonable remuneration (§ 9) | Act 527/1990 Sb. § 9: https://e-sbirka.gov.cz/sb/1990/527 (text read at https://www.zakonyprolidi.cz/cs/1990-527) |
| Contractor inventions assigned in writing | 2 | S3 | CONTRACTORS | 5 | Attestation. § 9 covers employees only; for contractors a written assignment is needed **[verify]** | Act 527/1990 Sb. § 9: https://www.zakonyprolidi.cz/cs/1990-527 |
| Czech trade mark | 2 | S2 / S3 | ALL | 4 | Slot: ÚPV registration certificate; number checkable in the ÚPV trade mark database. No engine fact yet. For EU marks see EU Section 11 — EU trade mark | ÚPV: https://upv.gov.cz/ (read 16 Nov 2026); database https://isdv.upv.cz/webapp/!resdb.oza.frm |

### Section 6 — Data protection and cookies

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| GDPR duties | 3 | S2 | PERSONAL_DATA | — | See EU Section 1 — GDPR. National act: Act 110/2019 Sb. | Act 110/2019 Sb.: https://e-sbirka.gov.cz/sb/2019/110 (text read at https://www.zakonyprolidi.cz/cs/2019-110, version current at 1 Nov 2026) |
| Supervisory authority named in the notice | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `web.policy.rights_section`. The authority is the Úřad pro ochranu osobních údajů (§§ 50–52). No engine fact yet checks that ÚOOÚ is named | Act 110/2019 Sb. §§ 50–52: https://www.zakonyprolidi.cz/cs/2019-110 |
| No national controller registration | 3 | — | — | — | Not an item: the act has no general registration or notification duty for controllers | Act 110/2019 Sb.: https://www.zakonyprolidi.cz/cs/2019-110 |
| Child's consent age 15 | 3 | S2 | CONSUMER, PERSONAL_DATA (online services offered to children) | 1 / 5 | `web.policy.children_section`; attestation for the age check. A child can consent alone from 15 for information society services (§ 7) | Act 110/2019 Sb. § 7: https://www.zakonyprolidi.cz/cs/2019-110 |
| DPO designation | 3 | S2 | PERSONAL_DATA (GDPR Art 37 tests) | 5 + 1 | Attestation; `web.policy.dpo_contact`. National act adds DPO duties only for public bodies (§ 14); private companies follow GDPR Art 37 (EU Section 1 — GDPR) | Act 110/2019 Sb. § 14: https://www.zakonyprolidi.cz/cs/2019-110 |
| Breach notified to ÚOOÚ | 3 | event-driven | PERSONAL_DATA | 5 | Attestation; GDPR Art 33 (EU Section 1 — GDPR) | Act 110/2019 Sb.: https://www.zakonyprolidi.cz/cs/2019-110 |
| Cookie consent before non-essential cookies | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `web.policy.cookies_before_consent_count`, `web.policy.trackers_before_consent_count`. Prior, demonstrable consent to scope and purpose; exemptions only for transmission or a service the user expressly asked for (§ 89(3)). Opt-in since 1 Jan 2022 **[verify date of the change]**. See EU Section 2 — ePrivacy and cookies | Act 127/2005 Sb. § 89(3): https://e-sbirka.gov.cz/sb/2005/127 (text read at https://www.zakonyprolidi.cz/cs/2005-127) |
| Cookie policy published | 3 | S2 | WEBSITE | 1 | `web.policy.cookie_policy_found`. ÚOOÚ cookie guidance not read **[verify]** | https://uoou.gov.cz **[verify]**: guidance page not read on 16 Nov 2026 |
| Marketing e-mail: opt-out for own customers | 4 | S3 | CONSUMER | 5 | Attestation. Own customers' e-mail may be used for similar own products if refusal is offered simply and free, at collection and in every message (§ 7(3)); messages must be labelled as commercial and show the sender (§ 7(4)) | Act 480/2004 Sb. § 7: https://e-sbirka.gov.cz/sb/2004/480 (text read at https://www.zakonyprolidi.cz/cs/2004-480, version of 23 Mar 2023) |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Registered with the tax office (DIČ) | 3 | S2 | ALL | 1 | `registry.cz.ares.vat_number_present`. Registration deadline under the Tax Code not read **[verify]** | Tax Code 280/2009 Sb. **[verify]**: not read on 16 Nov 2026 |
| VAT payer once turnover exceeds CZK 2m | 3 | S3 | ALL | 1 | `registry.cz.ares.vat_payer`, `registry.eu.vies_vat.valid`. Payer from 1 January after a calendar year with domestic turnover over CZK 2,000,000 (§ 6(1)); from the next day once turnover in the current year exceeds CZK 2,536,500 (§ 6(2)(b)). Turnover is not public, so the engine can show registration, not the duty | Act 235/2004 Sb. § 6: https://e-sbirka.gov.cz/sb/2004/235 (text read at https://www.zakonyprolidi.cz/cs/2004-235, version 1 Jan 2026 – 31 Dec 2026) |
| VAT registration application deadline | 3 | S3 | ALL | 5 | Attestation. § 94 deadline not read **[verify]** | Act 235/2004 Sb. § 94: https://www.zakonyprolidi.cz/cs/2004-235 **[verify]** |
| EU VAT rules | 3 | S3 | ALL | — | See EU Section 5 — VAT | — |
| Employer registered with ČSSZ before the first employee starts | 3 | S2 | EMPLOYEES | 4 | Slot: ČSSZ registration confirmation. From 1 Jul 2026: register at least 2 working days, and no more than 15 days, before the first employee starts; electronic e-podání only. Changes and deregistration within 8 days | ČSSZ: https://www.cssz.gov.cz/web/cz/evidence-zamestnavatelu-prihlaseni-zmena-odhlaseni- |
| Each employee registered before starting | 3 | S2 | EMPLOYEES | 5 | Attestation. From 1 Jul 2026 every employee is registered before work starts, no earlier than 8 calendar days before; pre-registration completed within 8 days of start | ČSSZ: https://www.cssz.gov.cz/web/cz/-/nova-povinnost-evidovat-zamestnance-jeste-pred-nastupem-do-pra-1 |
| Employer registered with health insurers | 3 | S2 | EMPLOYEES | 5 | Attestation. Duty under Act 48/1997 Sb. not read **[verify]** deadline | Act 48/1997 Sb. **[verify]**: not read on 16 Nov 2026 |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| ČNB authorisation or registration (payments, e-money, credit, banking) | 3 | S2 | SECTOR.PAYMENTS, .CREDIT, .BANKING | 3 | Trigger only. ČNB list of regulated entities as a future official list import **[verify]**: list address and format not confirmed | ČNB: https://www.cnb.cz **[verify]**: list page refused our connection on 16 Nov 2026 |
| Crypto-asset service provider (MiCA) | 3 | S2 | SECTOR.CRYPTO | 3 | Trigger only. See EU Section 12 — Other EU digital rules (triggers); Czech competent authority ČNB **[verify]** | — |
| Electronic communications notification | 3 | S2 | SECTOR.TELECOMS | 3 | Trigger only. ČTÚ register **[verify]** | https://ctu.gov.cz **[verify]**: not read |
| Medical device software | 3 | S3 | SECTOR.HEALTHTECH | 5 | Trigger only. See EU Section 12 — Other EU digital rules (triggers) | — |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Name and seat shown on the website | 4 | S2 | WEBSITE | 1 | `web.policy.names_company` (partial: it checks the privacy notice names the company). Every business must show its name and seat on business documents and in information made public by remote access (§ 435(1)). Identification number and register entry: § 435(2) not read **[verify]** | Act 89/2012 Sb. (Civil Code) § 435: https://e-sbirka.gov.cz/sb/2012/89 (text read at https://www.zakonyprolidi.cz/cs/2012-89, version 1 Jan 2026 – 31 Dec 2026) |
| E-commerce information duties | 4 | S2 | WEBSITE | 1 | See EU Section 3 — E-commerce information duties. Czech implementing provision not located **[verify]** | — |
| Consumer terms for distance contracts | 4 | S3 | CONSUMER | 1 | `web.policy.terms_found`, `web.policy.refund_policy_found`, `web.policy.complaints_policy_found`. Civil Code §§ 1811, 1820, 1829 (pre-contract information, distance contracts, 14-day withdrawal) **[verify]**: our reader could not reach those sections. See EU Section 4 — Consumer law | Civil Code: https://e-sbirka.gov.cz/sb/2012/89 **[verify]** |
| Out-of-court consumer disputes (ČOI) named | 4 | S3 | CONSUMER | 1 | No engine fact yet. ČOI as the ADR body under the Consumer Protection Act **[verify]** | https://coi.gov.cz **[verify]**: not read |
| Accessibility | 4 | S3 | CONSUMER (in-scope e-commerce services) | 1 | `web.policy.accessibility_found`. See EU Section 8 — Accessibility; Czech act not read **[verify]** | — |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Capital increase resolved by the general meeting | 5 | S4 | INVESTED | 4 | Slot: notarial record of the resolution. Increase by new contributions, from own resources or both (§ 216); resolutions that change the founding contract are certified by a public deed (§ 172(1) with § 171(1)(b)) **[verify]**: read as an inference, confirm | ZOK §§ 171–172, 216: https://www.zakonyprolidi.cz/cs/2012-90 |
| Increase filed with the register within 2 months | 5 | S4 | INVESTED | 4 | Slot: register extract after the increase. If the filing is not made within 2 months of the resolution, the resolution lapses (§ 218(1)(a)) **[verify]** exact wording | ZOK § 218: https://www.zakonyprolidi.cz/cs/2012-90 |
| Updated founding contract and list of members | 5 | S4 | INVESTED | 4 | Slots: Společenská smlouva (full updated text, filed per 304/2013 § 66(a)) and Seznam společníků (§ 139) | As in Section 2 |
| Investment and shareholders' agreements | 5 | S4 | INVESTED | 5 | Attestation; vault | — |
| Prospectus or crowdfunding exemption | 5 | S4 | INVESTED (offer to the public) | 5 | Trigger only. See EU Section 10 — Fundraising and prospectus | — |

### Section 11 — AI

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| AI Act duties and dates | 6 | S2 | AI | — | See EU Section 7 — AI Act (Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744: Annex III high-risk from 2 Dec 2027, Annex I from 2 Aug 2028, new Art 5(1)(ba)/(bb) prohibitions from 2 Dec 2026) | https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng |
| Czech AI supervisory authority | 6 | S3 | AI | — | Not an item until a law is adopted. No official Czech act found; ČTÚ is reported as the proposed main authority **[verify]** | No official source read **[verify]** |
| AI transparency notice on the site | 6 | S3 | AI | 1 | `web.policy.ai_disclosure_found` (presence only) | EU Section 7 — AI Act |

### Section 12 — Compliance calendar (recurrence, not new items)

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| General meeting approves accounts | Section 3 | Within 6 months of year end | Attestation |
| Accounts filed in the sbírka listin | Section 3 | At the latest 12 months after year end [verify for unaudited] | Document slot; no engine fact yet |
| Audit (medium and large only) | Section 4 | Annual | Document slot |
| Beneficial-owner data | Section 2 | On each change, without undue delay | Attestation; slot |
| Register changes | Section 1 | On each change, without undue delay | Attestation |
| VAT threshold | Section 7 | Each calendar year | `registry.cz.ares.vat_payer` |
| Employer and employee registration | Section 7 | Before first employee; before each new employee | Attestation |
| ARES status and insolvency | Section 1 | Each scan | `registry.cz.ares.status`, `registry.cz.ares.insolvency_record_active` |

---

## 4. Counts by tier

| Tier | Items (approx.) | What this means |
|---|---|---|
| 1 Official live or URL scan | 16 | ARES (status, register, insolvency, VAT), VIES and the website scan |
| 2 Licensed vendor | 0 | Not needed: ARES is free and official |
| 3 Official list import | 3 | Sector lists (ČNB, ČTÚ), all [verify] |
| 4 Document-verified | 16 | Register extract, founding contract, list of members, beneficial-owner extract, accounts, audit report, ČSSZ confirmation, trade mark, capital increase |
| 5 Attested | 19 | IP defaults, director duties, registrations with no public record |

54 items in all, 19 of them carrying a [verify] mark. A further 10 rows marked "—" are explanations or pointers, not items. Rows marked 1 / 5 or 4 / 5 are counted once, under the first tier.

---

## 5. The core set every Czech tech company must show at Stage 2

1. Company found in ARES, active, in the public register, no active insolvency record (Tier 1).
2. Commercial-register extract showing at least one jednatel (Tier 4).
3. Founding contract as a notarial deed, filed in the sbírka listin; list of members kept (Tier 4).
4. Beneficial owner registered (Tier 4, the company's own extract: the register is no longer public).
5. Privacy notice and cookie consent before non-essential cookies (Tier 1, WEBSITE).
6. Name and seat shown on the website (Tier 1, partial).
7. Founders' and contractors' IP position (Tier 5), noting the Czech default for commissioned software.

From the first accounting year end: general meeting within 6 months and accounts filed (Tier 4/5).

---

## 6. Thresholds and facts to confirm before encoding

- Every Czech citation against e-Sbírka (texts were read on zakonyprolidi.cz).
- ZOK amendments after 19 Jul 2024 (the version our reader showed).
- Accounting Act § 20: no audit duty for a small s.r.o. after the 2026 version; and the 2026 thresholds in § 1b.
- Accounting Act § 21a: filing deadline for unaudited companies.
- ARES legal-form code for s.r.o. (112).
- Act 304/2013 Sb.: whether the list of members must also be filed.
- Director residency: confirm none.
- Patent Act: inventions by contractors.
- Act 127/2005 Sb. § 89(3): date of the change to opt-in (1 Jan 2022), and ÚOOÚ cookie guidance.
- Civil Code § 435(2), §§ 1811, 1820, 1829.
- Czech implementation of the e-commerce directive's information duties and of the Digital Services Act (Act 480/2004 Sb. was last shown as amended 23 Mar 2023).
- Consumer ADR body (ČOI) and Czech accessibility act.
- Tax Code registration deadline; VAT Act § 94 deadline.
- Health-insurance employer registration (Act 48/1997 Sb.).
- New ČSSZ employer and employee registration rules from 1 Jul 2026: the implementing law.
- ZOK §§ 172 and 218: notarial-deed requirement and the 2-month filing rule for a capital increase.
- ČNB and ČTÚ lists: address, format and terms.
- Czech AI Act implementing law and authority.

---

## Not encoded (16 Nov 2026)

The draft pack `packages/rules/src/packs/cz.ts` (Czechia, version 0.1.0) encodes every other item in this map; the items below are left out, or are asked for by another rule.

| Item | Section | Why |
|---|---|---|
| Registered office: that the address is real and usable | Section 1 | Not a separate attestation: `CZ.CORP.REGISTERED_OFFICE` reads the seat from ARES, and its text asks for an address where post reaches the company |
| Consequences of no registered owner | Section 2 | Severity note only; used in the text of `CZ.CORP.UBO` and `CZ.CORP.UBO_CURRENT` |
| Beneficial-owner register not public | Section 2 | Not an item; it is why `CZ.CORP.UBO` is a document slot |
| Founding contract as a notarial deed (its own line) | Section 2 | Encoded as `CZ.CORP.FOUNDING_CONTRACT`, which cites the core-set line instead: the line's [verify] is about later ZOK amendments, not the deed requirement |
| Filing deadline | Section 3 | [verify]: the deadline for unaudited companies would decide, so `CZ.CORP.ACCOUNTS_FILING` asks for the filing with no deadline |
| Small or micro: income statement need not be published | Section 3 | Not an item |
| Court action for accounts missing two years | Section 3 | Severity note only; used in the text of `CZ.CORP.ACCOUNTS_FILING` |
| Director residency | Section 4 | [verify] note: no rule found |
| Statutory audit | Section 4 | [verify]: the 2026 thresholds and the small-company position would decide, and no fact gives assets or turnover in CZK |
| Contractor inventions assigned in writing | Section 5 | [verify]: whether a written assignment is needed is what the rule would decide |
| GDPR duties | Section 6 | Pointer; covered by the EU common rules (`CZ.DP.*`, `CZ.AI.DPIA`, `CZ.AI.AUTOMATED_DECISIONS`) |
| Supervisory authority named in the notice | Section 6 | Covered by EU common rule `CZ.DP.NOTICE_AUTHORITY`, which cites this line |
| No national controller registration | Section 6 | Not an item |
| Child's consent age 15 | Section 6 | Covered by EU common rule `CZ.DP.CHILD_CONSENT` (age 15), which cites this line |
| DPO designation | Section 6 | Covered by EU common rule `CZ.DP.DPO`, which cites this line |
| Breach notified to ÚOOÚ | Section 6 | Covered by EU common rule `CZ.DP.BREACH`, which cites this line |
| Cookie consent before non-essential cookies | Section 6 | Covered by EU common rule `CZ.DP.COOKIE_CONSENT`; the line is not cited because of its [verify] on the opt-in date, so the rule cites the core-set line |
| Cookie policy published | Section 6 | Covered by EU common rule `CZ.DP.COOKIE_POLICY`; not cited, [verify] (ÚOOÚ guidance not read) |
| VAT registration application deadline | Section 7 | [verify]: the § 94 deadline would decide |
| EU VAT rules | Section 7 | Pointer; covered by EU common rule `CZ.TAX.VAT_VIES` |
| ČNB authorisation or registration | Section 8 | Trigger only; [verify] list address and format |
| Crypto-asset service provider (MiCA) | Section 8 | Trigger only; [verify] authority |
| Electronic communications notification | Section 8 | Trigger only; [verify] register |
| Medical device software | Section 8 | Trigger only, no licence content; AI in such products is `CZ.AI.HIGH_RISK_PRODUCTS` |
| Name and seat shown on the website | Section 9 | Covered by EU common rule `CZ.COM.WEBSITE_IDENTITY`, which cites the core-set line; the line itself carries a [verify] on § 435(2) |
| E-commerce information duties | Section 9 | Covered by EU common rules (`CZ.COM.WEBSITE_IDENTITY`, `CZ.COM.REGULATOR_NAMED`, `CZ.CONSUMER.PRICES`, `CZ.CONSUMER.ORDERING_STEPS`); [verify], not cited |
| Consumer terms for distance contracts | Section 9 | Covered by EU common rules `CZ.CONSUMER.PRE_CONTRACT_INFO`, `CZ.CONSUMER.WITHDRAWAL`, `CZ.CONSUMER.COMPLAINTS`; [verify], not cited |
| Out-of-court consumer disputes (ČOI) named | Section 9 | [verify] and no fact |
| Accessibility | Section 9 | Covered by EU common rule `CZ.CONSUMER.ACCESSIBILITY`; [verify], not cited |
| Updated founding contract and list of members | Section 10 | Covered by `CZ.CORP.FOUNDING_CONTRACT` and `CZ.CORP.MEMBERS_LIST`, which cite this line |
| Investment and shareholders' agreements | Section 10 | Covered by INTL rules `INTL.FUND.ROUND_DOCUMENTS` and `INTL.EQUITY.SHAREHOLDER_AGREEMENT` |
| Prospectus or crowdfunding exemption | Section 10 | Trigger only; covered by EU common rule `CZ.FUND.PROSPECTUS_EXEMPTION` |
| AI Act duties and dates | Section 11 | Pointer; covered by the EU common AI rules (`CZ.AI.*`) |
| Czech AI supervisory authority | Section 11 | Not an item until a law is adopted; [verify] |
| Founders' IP position (core set, item 7) | Section 5 (core set) | Covered by INTL rule `INTL.IP.OWNER_ASSIGNMENT`; the contractors' half is `CZ.IP.CONTRACTOR_WORKS` |
| Compliance calendar | Section 12 | Recurrence only, not new items; the 6-month meeting and the 10-year trade mark renewal are on their rules |
