# Vero Scan — Poland Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company form covered:** spółka z ograniczoną odpowiedzialnością (sp. z o.o.), a private limited company, in technology.
**Sources:** official legislation, government and regulator pages only, each with its URL and the date checked. Secondary sources (law firm notes, news) were used only to find official pages, and are never cited.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. Rules common to every EU country are in `vero-scan-eu-common-rule-pack-map.md`; this map adds only what is Polish.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Polish sp. z o.o. at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants (including B2B contracts with individuals) |
| CONSUMER | B2C product |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| AI | Uses or builds AI in the product |
| INVESTED | Has raised or is raising |
| SECTOR.PAYMENTS, .CREDIT, .CRYPTO, .BANKING, .TELECOMS, .HEALTHTECH | Sector packs: trigger only, no licence content in this map |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (a document slot) · 5 attested (the customer confirms, optionally with evidence).

**[verify]** means the item, threshold or deadline could not be confirmed from an official source on 16 Nov 2026, or was read only in part. The note says exactly what is uncertain. Nothing marked [verify] should be encoded as a hard rule until a lawyer confirms it.

**How Polish law was read.** ISAP (`isap.sejm.gov.pl`) showed our reader a human-check page and pointed to the Sejm's own ELI API. Every statute below was read in its latest consolidated text (tekst jednolity) from that API (`api.sejm.gov.pl/eli/acts/DU/<year>/<position>/text.pdf`), which serves the Dziennik Ustaw PDF. Where the consolidated text is older than later amendments, the row says so.

### Engine facts available for this country

| Fact key | What it can show | What it cannot show |
|---|---|---|
| `registry.pl.krs.identified` | The KRS number was found in the register of entrepreneurs (P) or of associations (S). There is no name search: the KRS number is required | A miss is unknown (null), never "does not exist" |
| `registry.pl.krs.krs_number`, `.register`, `.registered_name`, `.legal_form` | Identity of the entity | — |
| `registry.pl.krs.status` | `registered` or `deleted` | Good standing; whether filings are up to date |
| `registry.pl.krs.registered_on`, `.last_entry_on` | First registration and the date of the last entry | Whether a required change was filed on time |
| `registry.pl.krs.nip_present`, `.nip`, `.regon_present`, `.regon` | The company's tax (NIP) and statistics (REGON) numbers | VAT registration (NIP is not VAT status) |
| `registry.pl.krs.seat_voivodeship`, `.seat_town` | Registered seat | The full address |
| `registry.pl.krs.main_activity_code` | Main PKD code | — |
| `registry.pl.krs.share_capital`, `.share_capital_currency` | Registered share capital | Whether it was paid up |
| `registry.pl.krs.management_bodies`, `.management_members_count` | Name of the management body and how many sit on it (people never named) | Who they are |
| `registry.pl.krs.supervisory_bodies`, `.supervisory_members_count` | Supervisory board or audit committee, if any | — |
| `registry.pl.krs.proxies_count` | Number of commercial proxies (prokurenci) | — |
| `registry.pl.krs.under_liquidation`, `.insolvency_marker` | Liquidation or insolvency/restructuring sections present. **Unconfirmed** against a real record that has them (`docs/NATIONAL-REGISTERS.md`) | Treat true as "a person must look", never a finding |
| `registry.eu.vies_vat.valid`, `.request_date`, `.name_matches` | EU VAT number valid in VIES today (active VAT EU registration) | Domestic-only VAT registration; filing compliance |
| `registry.global.gleif.*` | LEI record and its status, if any | Polish filings |
| `registry.sanctions.match`, `.possible_match`, `.lists_checked` | Company name screened against the configured lists | Officers or owners |
| `web.policy.*` | Website scan: privacy notice and its sections, DPO contact, cookie banner and trackers before consent, terms, refund and complaints pages, AI disclosure | Legal adequacy under Polish law; there is no fact for the KSH art. 206 company particulars, and no Polish complaint-route fact |

The KRS extract the engine reads does **not** include annual accounts filed, the shareholder list or beneficial owners. Those need the KRS financial documents repository (Repozytorium Dokumentów Finansowych), the CRBR, or a document slot.

---

## 2. Notes for the reviewing lawyer

1. **VAT exemption limit is PLN 240,000, and it is closed to advisory services.** The consolidated VAT Act of 2026 (poz. 1263) sets PLN 240,000 (art. 113(1)). The exemption is not available to businesses providing legal or advisory (doradztwo) services (art. 113(13)(2)). Whether a software or IT consultancy is "doradztwo" needs a lawyer's view.
2. **Audit thresholds are now in euro.** The 2026 consolidated Accounting Act (poz. 522) sets the two-of-three test at 50 FTE, EUR 3,125,000 total assets, EUR 6,250,000 net revenue (art. 64(1)(4)). How the euro amounts are converted to złoty is not stated in the line we read.
3. **Accounts go to the KRS only.** Companies that file accounts in the KRS do not also send them to the Head of KAS (CIT Act art. 27(2)).
4. **CRBR deadline is 14 days**, both for the first filing after KRS registration and for changes (AML Act art. 60), with a penalty up to PLN 1,000,000 (art. 153(1)).
5. **Cookies: consent may be given through browser settings** (Electronic Communications Law art. 399(2)). This is narrower than some EU regulators' guidance; please confirm how far it can be relied on.
6. **Polish AI act in force.** Act on AI systems of 3 July 2026 (Dz.U. 2026 poz. 1003), published 27 Jul 2026: KRiBSI is the market surveillance authority and single point of contact.
7. **Meeting notices change from 3 Dec 2026.** Notices of a shareholders' meeting may go by e-delivery address or e-mail if the shareholder agreed in documentary form (KSH art. 238(1) as amended by Dz.U. 2026 poz. 1440).
8. **Software by employees belongs to the employer** (Copyright Act art. 74(3)); for **contractors** a written assignment listing the fields of exploitation is required (arts. 41(2), 53). Inventions made under "another contract" go to the commissioning party unless agreed otherwise (Industrial Property Law art. 11(3)): broader than many countries.

---

## 3. Section-by-section map

### Section 1 — Company register and status

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Company registered in the KRS | 1 | S2 | ALL | 1 | `registry.pl.krs.identified`, `registry.pl.krs.register` = P, `registry.pl.krs.legal_form` | KRS open API (see `docs/NATIONAL-REGISTERS.md`); KRS Act, Dz.U. 2025 poz. 869: https://api.sejm.gov.pl/eli/acts/DU/2025/869/text.pdf |
| Company not deleted | 1 | S2 | ALL | 1 | `registry.pl.krs.status` = registered | KRS open API |
| Not in liquidation or insolvency | 1 | S2 | ALL | 1 | `registry.pl.krs.under_liquidation`, `registry.pl.krs.insolvency_marker` = false. True means a person must look. **[verify]** markers against a real record | KRS open API |
| Register changes filed within 7 days | 1 | event-driven | ALL | 5 | Attestation. A request for an entry must be filed within 7 days of the event, unless a special rule says otherwise (art. 22); the court can set a further 7-day deadline (art. 24(1)). `registry.pl.krs.last_entry_on` shows when the register last changed, not whether a change is missing | KRS Act arts. 22, 24: https://api.sejm.gov.pl/eli/acts/DU/2025/869/text.pdf |
| NIP and REGON assigned | 3 | S2 | ALL | 1 | `registry.pl.krs.nip_present`, `registry.pl.krs.regon_present` | KRS open API |
| Registered seat | 1 | S2 | ALL | 1 | `registry.pl.krs.seat_town`, `registry.pl.krs.seat_voivodeship` | KRS open API |

### Section 2 — Constitution, share register and beneficial owners

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Articles (umowa spółki) by notarial deed or S24 template | 1 | S2 | ALL | 4 | Slot: Umowa spółki. Must be a notarial deed (art. 157 § 2), or concluded online on the S24 template with a qualified, trusted or personal e-signature (art. 157¹) | KSH, Dz.U. 2024 poz. 18: https://api.sejm.gov.pl/eli/acts/DU/2024/18/text.pdf (later amendments: Dz.U. 2026 poz. 176, 644, 1440) |
| Articles contain the required terms | 1 | S2 | ALL | 4 | Same slot: name and seat, objects, share capital, whether a shareholder may hold more than one share, number and value of each shareholder's shares, duration if fixed (art. 157 § 1) | KSH art. 157: as above |
| Share capital at least PLN 5,000 | 1 | S2 | ALL | 1 | `registry.pl.krs.share_capital` ≥ 5000 and `registry.pl.krs.share_capital_currency` = PLN. Each share at least PLN 50 (art. 154 § 2) is not in the facts | KSH art. 154: as above |
| Share book (księga udziałów) kept | 1 | S2 | ALL | 4 | Slot: Księga udziałów. Kept by the management board; every change recorded; each shareholder may inspect (art. 188 §§ 1–2) | KSH art. 188: as above |
| New shareholder list filed after each change | 1 | event-driven | ALL | 4 | Slot: Lista wspólników, as filed with the registry court, signed by all board members (art. 188 § 3); S24 template where the change came through S24 (art. 188 § 4) | KSH art. 188 §§ 3–4: as above |
| Beneficial owners reported to the CRBR within 14 days | 1 | S2 | ALL | 4 | Slot: CRBR confirmation (potwierdzenie zgłoszenia). Within 14 days of KRS registration (art. 60(1)(1)) | AML Act, Dz.U. 2025 poz. 644: https://api.sejm.gov.pl/eli/acts/DU/2025/644/text.pdf (amended since by Dz.U. 2025 poz. 1669, 2026 poz. 875 and 1206 [verify no change to arts. 60, 153]) |
| CRBR updated within 14 days of a change | 1 | event-driven | ALL | 4 / 5 | Same slot re-uploaded; attestation between uploads. Within 14 days of the KRS change, or of the change itself where no KRS entry is needed (art. 60(2)) | AML Act art. 60: as above |
| Penalty for no or wrong CRBR data | 1 | S2 | ALL | — | Severity note: up to PLN 1,000,000 for the company (art. 153(1)); up to PLN 50,000 for a beneficial owner who withheld information (art. 153(3)) | AML Act art. 153: as above |
| CRBR public search | 1 | — | — | — | Not an item yet. Whether the CRBR is still publicly searchable after the 2022 CJEU ruling, and on what terms, not read **[verify]** | https://www.gov.pl/web/crbr **[verify]**: not read on 16 Nov 2026 |

### Section 3 — Annual accounts, general meeting and annual return

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Accounts prepared within 3 months | 1 | S2 (annual) | ALL | 5 | Attestation. Prepared within 3 months of the balance-sheet date and signed by the bookkeeper and the management board (art. 52(1)–(2)); electronic structured format (art. 45(1g)) | Accounting Act, Dz.U. 2026 poz. 522: https://api.sejm.gov.pl/eli/acts/DU/2026/522/text.pdf |
| Annual shareholders' meeting within 6 months | 1 | S2 (annual) | ALL | 4 | Slot: approving resolution. Within six months of each financial year end, to approve the board report and accounts, decide on profit or loss and grant discharge (KSH art. 231 §§ 1–2; Accounting Act art. 53(1)) | KSH art. 231: https://api.sejm.gov.pl/eli/acts/DU/2024/18/text.pdf; Accounting Act art. 53 |
| Accounts filed with the KRS within 15 days of approval | 1 | S2 (annual) | ALL | 4 | Slot: accounts with the KRS filing confirmation. File the accounts, audit report if audited, approving resolution and board report within 15 days of approval (art. 69(1)). No engine fact yet: the KRS extract does not show accounts | Accounting Act art. 69: as above |
| No separate filing with KAS | 3 | — | — | — | Not an item: companies filing in the KRS need not also send accounts to the Head of KAS (CIT Act art. 27(2)) | CIT Act, Dz.U. 2026 poz. 554: https://api.sejm.gov.pl/eli/acts/DU/2026/554/text.pdf |
| Shareholders' meeting notices | 1 | event-driven | ALL | 5 | Attestation. Registered letter or courier at least two weeks before; from 3 Dec 2026 also to an e-delivery address or e-mail with the shareholder's documentary consent (art. 238 § 1) | KSH art. 238 as amended: https://api.sejm.gov.pl/eli/acts/DU/2026/1440/text.pdf |
| Court action for missing filings | 1 | S2 | ALL | — | Severity note: the registry court calls for missing documents with a 7-day deadline (KRS Act art. 24(1)) and can start dissolution of a non-operating entity (arts. 25a–25b) **[verify]** grounds | KRS Act arts. 24–25b: https://api.sejm.gov.pl/eli/acts/DU/2025/869/text.pdf |

### Section 4 — Directors, managers and auditor

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Management board in place | 1 | S2 | ALL | 1 | `registry.pl.krs.management_members_count` ≥ 1, `registry.pl.krs.management_bodies`. One or more members (art. 201 § 2), appointed by shareholders' resolution unless the articles say otherwise (art. 201 § 4) | KSH art. 201: https://api.sejm.gov.pl/eli/acts/DU/2024/18/text.pdf |
| Board members are natural persons with full capacity | 1 | S2 | ALL | 5 | Attestation (art. 18 § 1) | KSH art. 18: as above |
| Board members not disqualified | 1 | S2 | ALL | 5 | Attestation. No one convicted of the listed offences (art. 18 § 2) | KSH art. 18 § 2: as above |
| Director residency | 1 | — | — | — | No residency or nationality rule found in KSH art. 18 or 201 **[verify]**: confirm none applies | KSH: as above |
| Supervisory board or audit committee | 1 | S5 | ALL (where the articles or the law require one) | 1 | `registry.pl.krs.supervisory_bodies`, `registry.pl.krs.supervisory_members_count`. When one is mandatory for an sp. z o.o. was not read **[verify]** | KSH: as above |
| Statutory audit above two of three thresholds | 1 | S3 (annual) | ALL | 4 | Slot: Sprawozdanie z badania. Audit if in the previous year at least two of: 50 average FTE, total assets EUR 3,125,000, net revenue EUR 6,250,000 (art. 64(1)(4)). Złoty conversion rule **[verify]** | Accounting Act art. 64: https://api.sejm.gov.pl/eli/acts/DU/2026/522/text.pdf |

### Section 5 — Intellectual property

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Employee works: employer acquires rights | 2 | S2 | EMPLOYEES | 5 | Attestation. The employer acquires the economic rights on accepting the work, within the purpose of the employment contract, unless the law or contract says otherwise (art. 12(1)) | Copyright Act, Dz.U. 2025 poz. 24: https://api.sejm.gov.pl/eli/acts/DU/2025/24/text.pdf (amended since by Dz.U. 2026 poz. 1296 and 1477 [verify no change to arts. 12, 41, 53, 74]) |
| Employee software belongs to the employer | 2 | S2 | EMPLOYEES | 5 | Attestation. Economic rights in a computer program made by an employee in performing employment duties belong to the employer unless agreed otherwise (art. 74(3)) | Copyright Act art. 74(3): as above |
| Contractor IP assigned in writing, with fields of exploitation | 2 | S2 | CONTRACTORS | 5 | Attestation plus contract in the vault. No statutory default for contractors: transfer must be in writing or it is void (art. 53) and covers only the fields of exploitation named (art. 41(2) **[verify]** exact wording; only art. 41(1) was quoted) | Copyright Act arts. 41, 53: as above |
| Inventions go to the employer or commissioning party | 2 | S3 | EMPLOYEES, CONTRACTORS | 5 | Attestation. The right to a patent for an invention made in performing employment duties "or another contract" belongs to the employer or the commissioning party, unless agreed otherwise (art. 11(3)); transfer of the right needs written form (art. 12(2)) | Industrial Property Law, Dz.U. 2023 poz. 1170: https://api.sejm.gov.pl/eli/acts/DU/2023/1170/text.pdf |
| Polish trade mark (UPRP) | 2 | S2 / S3 | ALL | 4 | Slot: UPRP registration decision or certificate. No engine fact yet. For EU marks see EU Section 11 — EU trade mark | https://uprp.gov.pl **[verify]**: not read on 16 Nov 2026 |

### Section 6 — Data protection and cookies

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| GDPR duties | 3 | S2 | PERSONAL_DATA | — | See EU Section 1 — GDPR. National act: Personal Data Protection Act 2018. Supervisory authority: Prezes Urzędu Ochrony Danych Osobowych (UODO) | Act of 10 May 2018, Dz.U. 2019 poz. 1781: https://api.sejm.gov.pl/eli/acts/DU/2019/1781/text.pdf (amended since by Dz.U. 2026 poz. 252, 548 and 1003 [verify no change to arts. 10–11]) |
| DPO notified to UODO within 14 days | 3 | S2 | PERSONAL_DATA (when a DPO is designated under GDPR Art 37) | 4 | Slot: UODO notification confirmation. Notify the President of UODO within 14 days of designation, with the DPO's name and e-mail or phone (art. 10(1)); a deputy DPO is notified the same way (art. 11a(3)) | Act of 10 May 2018 art. 10: as above |
| DPO contact published on the website | 3 | S2 | WEBSITE (when a DPO is designated) | 1 | `web.policy.dpo_contact`. The DPO's details must be published on the website without delay after designation (art. 11) | Act of 10 May 2018 art. 11: as above |
| Privacy notice | 3 | S2 | WEBSITE / APP | 1 | `web.policy.privacy_notice_found`, `web.policy.rights_section`, `web.policy.retention_statement`, `web.policy.transfers_section`. No fact yet checks that UODO is named as the complaint route | EU Section 1 — GDPR |
| Cookie consent before non-essential storage | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`, `web.policy.cookies_before_consent_count`, `web.policy.trackers_before_consent_count`. Prior clear information on purpose and on settings, then consent (art. 399(1)); consent may be given through browser or service settings (art. 399(2)); exemptions for transmission or a service the user asked for (art. 399(3)). See EU Section 2 — ePrivacy and cookies | Electronic Communications Law, Dz.U. 2024 poz. 1221: https://api.sejm.gov.pl/eli/acts/DU/2024/1221/text.pdf (date it took effect is set by the separate introductory act **[verify]**) |
| Cookie policy published | 3 | S2 | WEBSITE | 1 | `web.policy.cookie_policy_found` | Art. 399(1)(1): as above |
| Which authority enforces cookie rules | 3 | — | — | — | Not an item. UKE or UODO competence for art. 399 not read **[verify]** | — |

### Section 7 — Tax and employer registration

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| VAT registration before the first taxable sale | 3 | S2 / S3 | ALL (unless exempt) | 1 / 4 | `registry.eu.vies_vat.valid` shows VAT EU status only; domestic VAT status (Biała lista) has no engine fact. Slot: VAT-R confirmation. File the registration with the tax office before the first taxable activity (art. 96(1)) | VAT Act, Dz.U. 2026 poz. 1263: https://api.sejm.gov.pl/eli/acts/DU/2026/1263/text.pdf |
| Small-business VAT exemption up to PLN 240,000 | 3 | S3 | ALL | 5 | Attestation of turnover. Exempt if sales did not exceed PLN 240,000 in the previous or current tax year (art. 113(1)); not available to legal or advisory services, among others (art. 113(13)(2)) **[verify]** whether IT consulting is "doradztwo" | VAT Act art. 113: as above |
| EU VAT rules | 3 | S3 | ALL | — | See EU Section 5 — VAT | — |
| Structured e-invoicing (KSeF) | 3 | S3 | ALL (VAT-registered) | 5 | Attestation. Mandatory KSeF dates not read **[verify]**: do not encode until checked | VAT Act: as above **[verify]** |
| Registered as contribution payer with ZUS within 7 days | 3 | S2 | EMPLOYEES | 4 | Slot: ZUS confirmation. Within 7 days of employing the first employee (art. 43(1)(1)); for a KRS company, ZUS takes the KRS data and the company supplies the rest (art. 43(5b)) **[verify]** form used | Social Insurance System Act, Dz.U. 2026 poz. 1474: https://api.sejm.gov.pl/eli/acts/DU/2026/1474/text.pdf |
| Each employee reported to ZUS within 7 days | 3 | S2 | EMPLOYEES | 5 | Attestation. Within 7 days of the insurance duty arising (art. 36(4)) | Social Insurance System Act art. 36: as above |
| Employee capital plans (PPK) | 3 | S2 | EMPLOYEES | 5 | Attestation. Duty and deadlines not read **[verify]** | **[verify]**: not read on 16 Nov 2026 |

### Section 8 — Sector licences (triggers only)

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| KNF authorisation (payments, e-money, banking, investment) | 3 | S2 | SECTOR.PAYMENTS, .BANKING | 3 | Trigger only. KNF public registers as a future official list import **[verify]** address and format | https://www.knf.gov.pl **[verify]**: not read |
| Crypto-asset service provider (MiCA) | 3 | S2 | SECTOR.CRYPTO | 3 | Trigger only. See EU Section 12 — Other EU digital rules (triggers); Polish competent authority and national act **[verify]** | — |
| Telecom register entry (UKE) | 3 | S2 | SECTOR.TELECOMS | 3 | Trigger only. Register under the Electronic Communications Law **[verify]** article | https://uke.gov.pl **[verify]**: not read |
| Consumer credit | 3 | S2 | SECTOR.CREDIT | 3 | Trigger only **[verify]** | — |
| Medical device software | 3 | S3 | SECTOR.HEALTHTECH | 5 | Trigger only. See EU Section 12 — Other EU digital rules (triggers) | — |

### Section 9 — Consumer terms and website information

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Company particulars on the website | 4 | S2 | WEBSITE | 1 | `web.policy.names_company` (partial). Website information must show: name, seat and address; registry court and KRS number; NIP; share capital (and, for an S24 company until paid, that contributions are not yet made); group membership if any (art. 206 § 1). No fact yet checks the full list | KSH art. 206: https://api.sejm.gov.pl/eli/acts/DU/2024/18/text.pdf |
| E-services information (art. 5) | 4 | S2 | WEBSITE | 1 | No fact yet. E-mail addresses, name or company, seat and address, and any required permit and its authority, clearly and directly accessible (art. 5(1)–(3)). Art. 5 was not changed by the 2026 amendment (Dz.U. 2026 poz. 1296, in force 6 Nov 2026). See EU Section 3 — E-commerce information duties | Act on providing services by electronic means, Dz.U. 2024 poz. 1513: https://api.sejm.gov.pl/eli/acts/DU/2024/1513/text.pdf; amendment: https://api.sejm.gov.pl/eli/acts/DU/2026/1296/text.pdf |
| NIP in offers | 4 | S2 | WEBSITE | 1 | No fact yet. Entrepreneurs Law art. 20(3), referenced by art. 5(4) above, not read **[verify]** | — |
| Terms of service (regulamin) for e-services | 4 | S2 | WEBSITE / APP | 1 | `web.policy.terms_found`. Duty to publish terms under the same act (art. 8) not read **[verify]** | Act on providing services by electronic means: as above **[verify]** |
| Pre-contract information for distance contracts | 4 | S3 | CONSUMER | 1 | `web.policy.terms_found`. Clear information at the latest when the consumer agrees to be bound (art. 12(1)). See EU Section 4 — Consumer law | Consumer Rights Act, Dz.U. 2026 poz. 1244: https://api.sejm.gov.pl/eli/acts/DU/2026/1244/text.pdf |
| 14-day withdrawal right | 4 | S3 | CONSUMER | 1 | `web.policy.refund_policy_found`. 14 days without giving a reason (art. 27); exceptions (art. 38) | Consumer Rights Act arts. 27, 38: as above |
| Complaints route | 4 | S3 | CONSUMER | 1 | `web.policy.complaints_policy_found` | Consumer Rights Act: as above |
| Accessibility | 4 | S3 | CONSUMER (in-scope e-commerce services) | 1 | `web.policy.accessibility_found`. See EU Section 8 — Accessibility; Polish act not read **[verify]** | — |

### Section 10 — Fundraising

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Capital increase by amending the articles | 5 | S4 | INVESTED | 4 | Slot: notarial protocol of the resolution. Unless the articles already allow an increase up to a maximum by a date, an increase needs an amendment of the articles (art. 257 § 1); amendments need a shareholders' resolution in a notarial protocol (art. 255 §§ 1, 3), or the S24 template for an S24 company (art. 255 § 4) | KSH arts. 255, 257: https://api.sejm.gov.pl/eli/acts/DU/2024/18/text.pdf |
| Increase filed with the registry court | 5 | S4 | INVESTED | 1 / 4 | `registry.pl.krs.share_capital` and `registry.pl.krs.last_entry_on` after the round; slot for the filing. Filed by the board with the resolution, subscription statements and the board's statement that contributions are paid (art. 262 §§ 1–2). Effective only on registration (art. 262 § 4). Deadline: 7 days under KRS Act art. 22 unless a KSH rule applies **[verify]** | KSH art. 262; KRS Act art. 22 |
| New shareholder list after the round | 5 | S4 | INVESTED | 4 | Slot: Lista wspólników (art. 188 § 3) | KSH art. 188: as above |
| Investment and shareholders' agreements | 5 | S4 | INVESTED | 5 | Attestation; vault | — |
| Prospectus or crowdfunding exemption | 5 | S4 | INVESTED (offer to the public) | 5 | Trigger only. See EU Section 10 — Fundraising and prospectus; Polish public offering act thresholds **[verify]** | — |

### Section 11 — AI

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| AI Act duties and dates | 6 | S2 | AI | — | See EU Section 7 — AI Act (Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744: Annex III high-risk from 2 Dec 2027, Annex I from 2 Aug 2028, new Art 5(1)(ba)/(bb) prohibitions from 2 Dec 2026) | https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng |
| Polish AI authority: KRiBSI | 6 | S3 | AI | — | Not a check: tells the user who supervises. The Commission for the Development and Security of AI (KRiBSI) is the market surveillance authority and single point of contact (art. 5). The act took effect 14 days after publication (27 Jul 2026), with arts. 8–18 and chapters 3–5, 8 and 9 (control, proceedings, penalties) after 3 months (art. 127) | Act on AI systems, Dz.U. 2026 poz. 1003: https://api.sejm.gov.pl/eli/acts/DU/2026/1003/text.pdf |
| National AI regulatory sandbox | 6 | S3 | AI (optional) | 5 | Attestation if used. Innovation support measures (chapter 7) | Act on AI systems ch. 7: as above |
| AI transparency notice on the site | 6 | S3 | AI | 1 | `web.policy.ai_disclosure_found` (presence only) | EU Section 7 — AI Act |

### Section 12 — Compliance calendar (recurrence, not new items)

| Calendar item | Rule | Recurrence | Monitoring |
|---|---|---|---|
| Accounts prepared | Section 3 | Within 3 months of year end | Attestation |
| Shareholders' meeting approves accounts | Section 3 | Within 6 months of year end | Document slot |
| Accounts filed with the KRS | Section 3 | Within 15 days of approval | Document slot; no engine fact yet |
| Audit (above thresholds) | Section 4 | Annual | Document slot |
| CRBR | Section 2 | Within 14 days of KRS registration and of each change | Document slot |
| KRS changes | Section 1 | Within 7 days of each event | Attestation; `registry.pl.krs.last_entry_on` as a hint |
| Shareholder list | Section 2 | After each change in shareholders | Document slot |
| DPO notification | Section 6 | Within 14 days of each designation | Document slot |
| VAT exemption limit | Section 7 | Each tax year | Attestation |
| ZUS | Section 7 | 7 days after first employee; 7 days after each new employee | Attestation |
| KRS status and markers | Section 1 | Each scan | `registry.pl.krs.status`, `registry.pl.krs.under_liquidation`, `registry.pl.krs.insolvency_marker` |

---

## 4. Counts by tier

| Tier | Items (approx.) | What this means |
|---|---|---|
| 1 Official live or URL scan | 23 | KRS (registration, status, capital, board, NIP), VIES and the website scan |
| 2 Licensed vendor | 0 | Not needed: the KRS API is free and official |
| 3 Official list import | 4 | Sector lists (KNF, UKE and others), all [verify] |
| 4 Document-verified | 14 | Articles, share book and list, CRBR, accounts and resolution, audit report, DPO notification, ZUS, trade mark, capital increase |
| 5 Attested | 17 | IP defaults, director duties, filings with no public record |

58 items in all, 21 of them carrying a [verify] mark. A further 10 rows marked "—" are explanations or pointers, not items. Rows marked 1 / 4 or 4 / 5 are counted once, under the first tier.

---

## 5. The core set every Polish tech company must show at Stage 2

1. Company found in the KRS, registered (not deleted), no liquidation or insolvency marker (Tier 1).
2. Share capital at least PLN 5,000; management board with at least one member; NIP and REGON assigned (Tier 1).
3. Articles by notarial deed or S24; share book kept (Tier 4).
4. Beneficial owners in the CRBR within 14 days of registration (Tier 4).
5. Privacy notice; cookie consent before non-essential storage (Tier 1, WEBSITE).
6. Company particulars and e-services information on the website (Tier 1, partial today).
7. Contractor IP assigned in writing with fields of exploitation (Tier 5).

From the first year end: accounts within 3 months, meeting within 6 months, KRS filing within 15 days of approval (Tier 4/5).

---

## 6. Thresholds and facts to confirm before encoding

- KRS markers for deletion, liquidation and insolvency against a real record.
- AML Act arts. 60 and 153 unchanged by amendments after Dz.U. 2025 poz. 644; current CRBR public access.
- KSH: any later change to arts. 154, 157, 188, 201, 206, 231, 255–262 (consolidated text is from 2024; 2026 amendments checked only for poz. 176 and 1440).
- KSH: when a supervisory board or audit committee is mandatory for an sp. z o.o.
- Director residency: confirm none.
- Deadline to file a capital increase (KRS Act art. 22 default, or a KSH rule).
- Accounting Act art. 64: euro-to-złoty conversion; art. 25a–25b grounds for dissolution (KRS Act).
- Copyright Act art. 41(2) wording, and later amendments (Dz.U. 2026 poz. 1296, 1477).
- Personal Data Protection Act arts. 10–11 after 2026 amendments.
- Electronic Communications Law: date in force; whether UKE or UODO enforces art. 399.
- VAT: whether IT consulting falls under "doradztwo" (art. 113(13)(2)); KSeF mandatory dates.
- ZUS: form for a KRS company's supplementary payer data; PPK duties.
- Entrepreneurs Law art. 20(3) (NIP in offers); e-services act art. 8 (terms duty).
- Polish accessibility act; public offering thresholds; sector registers (KNF, UKE), Polish MiCA authority.
- UPRP trade mark pages.

---

## Not encoded (16 Nov 2026)

The draft pack `packages/rules/src/packs/pl.ts` (Poland, version 0.1.0) encodes every other item in this map; the items below are left out, or are asked for by another rule.

| Item | Section | Why |
|---|---|---|
| Not in liquidation or insolvency | Section 1 | Not a rule of its own: `PL.CORP.STATUS` cites the core-set line, passes only with no marker, and any marker is "to check", never a finding, because the markers are [verify] against a real record |
| Beneficial owners reported to the CRBR within 14 days (its own line) | Section 2 | Encoded as `PL.CORP.UBO`, which cites the core-set line instead: the line's [verify] is about later AML Act amendments, and the rule asks for the filing confirmation, not a deadline |
| Penalty for no or wrong CRBR data | Section 2 | Severity note only; used in the text of `PL.CORP.UBO` |
| CRBR public search | Section 2 | Not an item yet; [verify] |
| No separate filing with KAS | Section 3 | Not an item |
| Court action for missing filings | Section 3 | Severity note; [verify] grounds |
| Director residency | Section 4 | [verify] note: no rule found |
| Supervisory board or audit committee | Section 4 | [verify]: when one is mandatory is what the rule would decide |
| Statutory audit above two of three thresholds | Section 4 | [verify]: the złoty conversion would decide, and no fact gives assets or revenue in EUR or PLN |
| Contractor IP assigned in writing (its own line) | Section 5 | Encoded as `PL.IP.CONTRACTOR_ASSIGNMENT`, which cites the core-set line: the line's [verify] is the exact wording of art. 41(2), not the written-form rule |
| GDPR duties | Section 6 | Pointer; covered by the EU common rules (`PL.DP.*`, `PL.AI.DPIA`, `PL.AI.AUTOMATED_DECISIONS`) |
| DPO contact published on the website | Section 6 | No rule of its own: folded into `PL.DP.DPO`, which cites this line; there is no fact for "a DPO is designated" to trigger a website check |
| Privacy notice | Section 6 | Covered by EU common rules `PL.DP.PRIVACY_NOTICE` and `PL.DP.NOTICE_AUTHORITY`, which cite this line |
| Cookie consent before non-essential storage | Section 6 | Covered by EU common rule `PL.DP.COOKIE_CONSENT`, which cites the core-set line; this line is [verify] on its date in force, and consent through browser settings (art. 399(2), note 5) is not encoded |
| Cookie policy published | Section 6 | Covered by EU common rule `PL.DP.COOKIE_POLICY`, which cites this line |
| Which authority enforces cookie rules | Section 6 | Not an item; [verify] |
| Small-business VAT exemption up to PLN 240,000 | Section 7 | [verify]: whether IT consulting is "doradztwo" would decide; a company that says it is exempt comes out "to check" in `PL.TAX.VAT_REGISTRATION` |
| EU VAT rules | Section 7 | Pointer; covered by EU common rule `PL.TAX.VAT_VIES` |
| Structured e-invoicing (KSeF) | Section 7 | [verify]: the dates would decide |
| Employee capital plans (PPK) | Section 7 | [verify]: duty and deadlines not read |
| KNF authorisation | Section 8 | Trigger only; [verify] |
| Crypto-asset service provider (MiCA) | Section 8 | Trigger only; [verify] |
| Telecom register entry (UKE) | Section 8 | Trigger only; [verify] |
| Consumer credit | Section 8 | Trigger only; [verify] |
| Medical device software | Section 8 | Trigger only, no licence content; AI in such products is `PL.AI.HIGH_RISK_PRODUCTS` |
| E-services information (art. 5) | Section 9 | Covered by EU common rules `PL.COM.WEBSITE_IDENTITY` and `PL.COM.REGULATOR_NAMED`, which cite this line |
| NIP in offers | Section 9 | [verify]: Entrepreneurs Law art. 20(3) not read |
| Terms of service (regulamin) for e-services | Section 9 | [verify]: the duty was not read; terms are asked for by INTL rule `INTL.COM.TERMS` |
| Pre-contract information for distance contracts | Section 9 | Covered by EU common rule `PL.CONSUMER.PRE_CONTRACT_INFO`, which cites this line |
| 14-day withdrawal right | Section 9 | Covered by EU common rule `PL.CONSUMER.WITHDRAWAL`, which cites this line |
| Complaints route | Section 9 | Covered by EU common rule `PL.CONSUMER.COMPLAINTS`, which cites this line |
| Accessibility | Section 9 | Covered by EU common rule `PL.CONSUMER.ACCESSIBILITY`; [verify], not cited |
| New shareholder list after the round | Section 10 | Covered by `PL.CORP.SHAREHOLDER_LIST`, which cites this line |
| Investment and shareholders' agreements | Section 10 | Covered by INTL rules `INTL.FUND.ROUND_DOCUMENTS` and `INTL.EQUITY.SHAREHOLDER_AGREEMENT` |
| Prospectus or crowdfunding exemption | Section 10 | Trigger only; covered by EU common rule `PL.FUND.PROSPECTUS_EXEMPTION`; Polish thresholds [verify] |
| AI Act duties and dates | Section 11 | Pointer; covered by the EU common AI rules (`PL.AI.*`) |
| Polish AI authority: KRiBSI | Section 11 | Information only: says who supervises |
| National AI regulatory sandbox | Section 11 | Optional: nothing to check |
| Compliance calendar | Section 12 | Recurrence only, not new items; the 3- and 6-month deadlines and the 10-year trade mark renewal are on their rules |
