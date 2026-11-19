# Vero Scan — Switzerland Rule-Pack Map

**Status: Draft from official sources, for lawyer review. Not legal advice.**

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Company type:** Private technology company limited by shares: Aktiengesellschaft (AG / SA) or Gesellschaft mit beschränkter Haftung (GmbH / Sàrl).
**Source:** No lawyer-supplied source document exists for Switzerland. Every line below cites an official federal source (fedlex.admin.ch, admin.ch, kmu.admin.ch, estv.admin.ch, edoeb.admin.ch, transpareg.admin.ch, bakom.admin.ch, bj.admin.ch) listed in section 7, with the date it was checked.
**Stage and trigger assignments are proposals.** A lawyer approves, edits or strikes each line before it is encoded or affects a score.

> Technical mapping, not legal advice. Nothing here has been reviewed by a Swiss lawyer.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every Swiss AG or GmbH at that stage |
| AG / GMBH | Only that legal form (read from `registry.ch.zefix.legal_form_code`) |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data (the revFADP has no size threshold) |
| EMPLOYEES | Has employees in Switzerland |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | B2C product |
| MARKETING | Sends marketing emails or messages (new trigger, not in the UK list) |
| AI | Uses or builds AI in the product |
| SECTOR.PAYMENTS, .CRYPTO, .BANKING | Sector packs (FINMA); only as triggers here |
| INVESTED | Has raised or is raising equity |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified · 5 attested (vault). Routes refer to the *Verification Solutions Matrix*, section 5.

**Verification route.** Each item names one of: an engine **fact** (exact key from `packages/connectors/src/fact-keys.ts`), a **slot** (document upload, tier 4) or an **attestation** (tier 5). Slot and attestation ids (`ch_…`) are proposals; they do not exist in code yet.

**Item ids.** `CH-<layer>.<nn>`. A rule cites the map and the id, for example "Switzerland map §3, CH-1.09".

**Sources and "checked".** Each line cites a key (`[CH-S4]`) from section 7. Section 7 gives the URL, the date (16 Nov 2026 for all) and how the page was read:
- **R**: the page was opened and read.
- **S**: the official page was read through its indexed text, in a search limited to that official domain.
- **N**: the official source is named but was not opened. Every line resting on an N source carries **[verify]**.

**[verify]** means the line could not be confirmed from an official source on 16 Nov 2026, or a figure, article number or date needs a lawyer's check. The text says what is uncertain. No obligation, deadline or threshold has been invented: where none was confirmed, the line says so.

**What the engine can see in Switzerland.** Only Zefix (`ch.zefix`), which needs credentials and has not been tried against a real reply (`docs/NATIONAL-REGISTERS.md`). Zefix gives status, legal form, seat, canton, capital, number of audit firms, branch count and the date of the last SOGC publication. It keeps no people, so nothing about a director's or signatory's residence can be read. Swiss companies file no annual return and private companies do not publish accounts, so most Layer 1 duties are tier 4 or 5.

---

## 2. Notes for the owner and the reviewing lawyer

1. **The transparency register is new law.** The Federal Act on the Transparency of Legal Entities (TJPG) and the Transparency Register came into force on **1 October 2026** [CH-S5]. Every AG and GmbH must report its beneficial owners, with transitional deadlines from 1 January 2027 to 1 October 2028 [CH-S4]. The register is not public, so Vero cannot read it: only an upload or an attestation can show the report was made. This is the most time-critical Swiss item (CH-1.09).
2. **No annual return.** Unlike the UK, Singapore, New Zealand or Canada, a Swiss company files nothing annual with the commercial register. The annual duties are internal: accounts, the annual shareholders' meeting and the audit (or opting-out). Zefix's `last_sogc_publication_on` only shows that *something* changed recently; it is a freshness signal, never proof of compliance.
3. **Zefix has not been read live.** Every fact below depends on Zefix credentials being granted and on the first real reply being recorded and checked (`docs/NATIONAL-REGISTERS.md`). Until then, Switzerland stays at `registry` coverage at best (`docs/GLOBAL-COVERAGE.md`).
4. **Engine gaps (not built; proposals only).** (a) A "resident signatory present" boolean derived inside the Zefix parser without keeping names would make CH-1.06 tier 1. (b) The federal UID register shows whether a UID is VAT-registered; a connector would make CH-3.08 tier 1. (c) Swissreg trademark lookup for CH-2.05. None exists today.
5. **Federal law only.** Cantonal rules (cantonal commercial register practice, cantonal taxes, cantonal data protection for public bodies) are out of scope.
6. **Language.** Swiss federal law is authentic in German, French and Italian. Article numbers below are to the Code of Obligations (OR / CO) unless stated.

---

## 3. Item map

### 3.1 Layer 1 — Corporate foundation

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CH-1.01 | Company entered in the commercial register and active (not "being cancelled" or cancelled) | 1 | S2 | ALL | 1 | Facts `registry.ch.zefix.identified`, `registry.ch.zefix.status`, `registry.ch.zefix.deleted_on`, `registry.ch.zefix.uid` | [CH-S1] |
| CH-1.02 | Legal form is AG or GmbH (a sole proprietorship is never kept by the engine) | 1 | S2 | ALL | 1 | Facts `registry.ch.zefix.legal_form_code`, `registry.ch.zefix.legal_form` | [CH-S1] |
| CH-1.03 | Articles of association (Statuten) adopted by public deed and filed with the register | 1 | S2 | ALL | 4 | Slot `ch_articles` (certified copy or register extract with articles). [verify] the article numbers (AG Art. 626 OR, GmbH Art. 776 OR) and that a public deed is required: not read in the statute | [CH-S2], [CH-S10] |
| CH-1.04 | Minimum share capital: AG CHF 100,000 (at least 20%, and at least CHF 50,000, paid in); GmbH CHF 20,000 fully paid | 1 | S2 | AG / GMBH | 1 | Facts `registry.ch.zefix.capital_nominal`, `registry.ch.zefix.capital_currency`. **[verify]** all figures and articles (Art. 621, 632, 773, 777c OR); not read in the statute on 16 Nov 2026. [verify] how a foreign-currency capital (allowed since 2023) should be compared | [CH-S10] |
| CH-1.05 | Registered seat (legal domicile) in Switzerland | 1 | S2 | ALL | 1 | Facts `registry.ch.zefix.legal_seat`, `registry.ch.zefix.canton` | [CH-S1] |
| CH-1.06 | At least one person resident in Switzerland can represent the company. AG: a board member or a director (Art. 718(4) OR, since 1 Jul 2015), with access to the share register and the beneficial-owner list | 1 | S2 | AG | 5 | Attestation `ch_resident_representative`. The engine keeps no people, so Zefix cannot answer this (engine gap 4a) | [CH-S2] |
| CH-1.07 | Same residency rule for a GmbH (a managing director or director resident in Switzerland) | 1 | S2 | GMBH | 5 | Attestation `ch_resident_representative`. **[verify]** Art. 814(3) OR: the GmbH rule was not found in the official pages read | [CH-S10] |
| CH-1.08 | Share register kept by the company (AG Aktienbuch; GmbH share register) | 1 | S2 | ALL | 5 | Attestation `ch_share_register`, optional upload. [verify] articles (Art. 686 OR for the AG, Art. 790 OR for the GmbH) | [CH-S2], [CH-S10] |
| CH-1.09 | Beneficial owners reported to the federal Transparency Register (TJPG, in force 1 Oct 2026). Filed electronically via EasyGov by the highest member of the management body (may be delegated). Transitional deadlines from 1 Oct 2026: AG with ordinary audit 3 months; GmbH with ordinary audit 4 months; AG with limited audit 5 months (to 1 Mar 2027); GmbH with limited audit 6 months (to 1 Apr 2027); up to 2 years (1 Oct 2028) where every beneficial owner is already in the commercial register as a shareholder or officer. The first commercial-register change after 1 Oct 2026 starts a 1-month period from SOGC publication | 1 | S2 | ALL | 4 / 5 | Slot `ch_transparency_register_confirmation` (EasyGov filing confirmation); attestation fallback. The register is not public. **[verify]** the deadline for companies formed after 1 Oct 2026 (the FAQ does not address it); the FAQ itself calls the wording of Art. 51(3)(d) TJPG imprecise and derives some dates; the simplified procedure (GmbH with natural-person shareholders; single-shareholder AG) still needs a report | [CH-S4], [CH-S5] |
| CH-1.10 | Company's own list of beneficial owners notified to it by shareholders (Art. 697j and 697l OR; shareholders report when they reach 25%) | 1 | S2 | ALL | 5 | Attestation `ch_beneficial_owner_list`. [verify] article numbers and whether the TJPG changed the company-level list: the transparency FAQ says only that companies must already hold the information and shareholders must report it to the company | [CH-S2], [CH-S4] |
| CH-1.11 | Annual accounts and annual report approved by the shareholders' meeting within 6 months of the financial year end | 1 | S3 (annual) | ALL | 5 | Attestation `ch_annual_meeting`; vault for minutes. **[verify]** the 6-month rule and articles (Art. 699(2) OR for the AG, Art. 805 OR for the GmbH); not read in the statute. Private companies do not publish accounts, so no fact exists | [CH-S10] |
| CH-1.12 | Audit: ordinary audit if, in two consecutive years, two of three are exceeded: total assets CHF 20m, revenue CHF 40m, 250 full-time posts on annual average (also always for public companies and companies preparing group accounts); otherwise limited audit | 1 | S3 (annual) | ALL | 1 / 5 | Fact `registry.ch.zefix.auditors_count` (0 means no audit firm on the register); attestation `ch_audit_type` for which audit applies | [CH-S3] |
| CH-1.13 | Opting-out of the limited audit: only with all shareholders' consent and no more than 10 full-time posts on annual average (Art. 727a OR); partial opting-down also needs unanimity | 1 | S2 | ALL (no audit firm) | 1 / 4 | Fact `registry.ch.zefix.auditors_count` = 0 flags that an opting-out must exist; slot `ch_opting_out` (shareholders' consent and the declaration to the register) | [CH-S3] |
| CH-1.14 | Changes (board, signatories, seat, articles, capital) registered and published in the SOGC | 1 | event-driven | ALL | 1 | Fact `registry.ch.zefix.last_sogc_publication_on` (freshness signal only; the publication text is never read because it names people) | [CH-S1] |
| CH-1.15 | Board and shareholders' resolutions and minutes kept | 1 | S2 | ALL | 5 | Vault slot `ch_resolutions`. [verify] statutory basis and retention period (accounting records 10 years, Art. 958f OR, not read) | [CH-S10] |
| CH-1.16 | Branch offices registered where the company has them | 1 | S3 | ALL (has branches) | 1 | Fact `registry.ch.zefix.branch_offices_count` (information only) | [CH-S1] |

### 3.2 Layer 2 — IP and technology

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CH-2.01 | Inventions and designs an employee makes while performing work duties belong to the employer (Art. 332 OR); other inventions only by written agreement and with compensation | 2 | S2 | EMPLOYEES | 5 | Vault slot `ch_employment_contracts` (IP clause). **[verify]** the article and its scope: statute not read | [CH-S10] |
| CH-2.02 | Software an employee creates in the course of duties: the employer alone may exercise the exclusive use rights (Art. 17 Copyright Act, URG) | 2 | S2 | EMPLOYEES | 5 | Same slot. **[verify]** article and scope: statute not read | [CH-S11] |
| CH-2.03 | Contractors and freelancers keep their rights unless they assign them in writing: written IP assignment needed | 2 | S2 | CONTRACTORS | 5 | Vault slot `ch_contractor_ip`; supporting facts `github.contributor_count`, `github.contributor_logins` (who touched the code) and `docusign.envelopes_completed` (signed assignments). **[verify]** that Swiss law has no default transfer for commissioned software | [CH-S11] |
| CH-2.04 | Founders' pre-incorporation IP assigned to the company | 2 | S1 | ALL | 5 | Vault slot `ch_founder_ip_assignment` (same as the International pack's founder assignment) | [CH-S11] |
| CH-2.05 | Trademark filed with the Swiss Federal Institute of Intellectual Property (IPI) | 2 | S2 / S3 | ALL | 4 | Slot `ch_trademark_certificate`. **[verify]** IPI process and Swissreg lookup; not opened (engine gap 4c) | [CH-S12] |

### 3.3 Layer 3 — Compliance and regulatory

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CH-3.01 | Revised Federal Act on Data Protection (revFADP, in force 1 Sep 2023) applies; FDPIC is the regulator | 3 | S2 | PERSONAL_DATA | 5 | Attestation `ch_fadp_applies` (scope) | [CH-S7] |
| CH-3.02 | Privacy notice when collecting personal data: controller identity and contact, purposes, recipients, and the countries data goes to | 3 | S2 | WEBSITE / APP | 1 | Facts `web.policy.privacy_notice_found`, `web.policy.names_company`, `web.policy.transfers_section`, `web.policy.rights_section`, `web.policy.last_updated`. **[verify]** the exact content list (Art. 19 FADP; not read). No fact exists for a complaint route to the FDPIC (`web.policy.complaint_route_*` covers only the ICO and NDPC) | [CH-S7], [CH-S13] |
| CH-3.03 | Record of processing activities (Art. 12 FADP). Exemption for companies with fewer than 250 employees whose processing carries only a low risk (Art. 24 of the Data Protection Ordinance). No longer reported to the FDPIC | 3 | S2 | PERSONAL_DATA | 5 | Vault slot `ch_ropa`; attestation `ch_ropa_exemption`. [verify] the exemption's exact conditions in the Ordinance text (FDPIC material read, ordinance not) | [CH-S7] |
| CH-3.04 | Data security breach likely to cause a high risk: report to the FDPIC "as soon as possible", through the FDPIC DataBreach portal; inform affected people where needed (Art. 24 FADP) | 3 | S2 / event-driven | PERSONAL_DATA | 5 | Vault slot `ch_breach_plan` | [CH-S7] |
| CH-3.05 | Data protection impact assessment for processing likely to be high-risk | 3 / 6 | S2 | PERSONAL_DATA (high-risk, profiling, AI) | 5 | Vault slot `ch_dpia`. **[verify]** Art. 22 FADP and its thresholds: not read | [CH-S13] |
| CH-3.06 | Data protection advisor: optional, not required for private companies | 3 | S2 | PERSONAL_DATA | 5 | Attestation `ch_dp_advisor`; fact `web.policy.dpo_contact` shown as information only. **[verify]** that no private-sector duty exists (Art. 10 FADP: not read) | [CH-S13] |
| CH-3.07 | Website informs users about cookies and similar processing and how to refuse it | 3 | S2 | WEBSITE | 1 | Facts `web.policy.cookie_policy_found`, `web.policy.cmp_detected`. **[verify]** the legal basis (Art. 45c Telecommunications Act) and that Swiss law requires information and a way to refuse rather than prior consent; not read. `web.policy.cookies_before_consent_count` is shown but must not be scored as a breach until a lawyer confirms | [CH-S14] |
| CH-3.08 | VAT registration with the Federal Tax Administration (ESTV) once worldwide turnover from taxable and exempt supplies reaches CHF 100,000 a year; a new business is exempt while it expects to stay below that in the next 12 months | 3 | S3 | ALL | 4 | Slot `ch_vat_registration` (ESTV confirmation, CHE-…-MWST number). Engine gap 4b | [CH-S6] |
| CH-3.09 | Employer registered with an AHV/AVS compensation fund; occupational pension (BVG/LPP) for employees above the entry threshold; compulsory accident insurance (UVG/LAA) | 3 | S2 (first employee) | EMPLOYEES | 4 | Slots `ch_ahv_affiliation`, `ch_bvg_affiliation`, `ch_uvg_policy`. **[verify]** all of it: the official pages were not opened, and the BVG entry threshold changes yearly | [CH-S15] |
| CH-3.10 | Sector licence or self-regulatory-organisation membership for financial activities | 3 | S2 | SECTOR.PAYMENTS, .CRYPTO, .BANKING | 3 | FINMA list of authorised institutions. **[verify]** the list's format and whether it can be imported; not opened. Trigger only | [CH-S16] |

### 3.4 Layer 4 — Commercial

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CH-4.01 | E-commerce identity: a business offering goods or services online gives clear and complete information about its identity and contact address | 4 | S2 | WEBSITE | 1 | Fact `web.policy.names_company` (partial: an imprint check is not built). **[verify]** Art. 3(1)(s) Unfair Competition Act (UWG): not read | [CH-S17] |
| CH-4.02 | Marketing emails and messages: prior consent, correct sender, and an easy free way to refuse; existing-customer exception for similar products | 4 | S3 | MARKETING | 5 | Attestation `ch_marketing_consent`. **[verify]** Art. 3(1)(o) UWG and the existing-customer exception: not read | [CH-S17] |
| CH-4.03 | Standard terms: terms that cause a significant, unjustified imbalance to consumers' detriment are unfair | 4 | S3 | CONSUMER | 1 / 5 | Fact `web.policy.terms_found`; vault slot `ch_terms_review` for lawyer review. **[verify]** Art. 8 UWG: not read | [CH-S17] |
| CH-4.04 | Consumer prices shown as actual prices including VAT | 4 | S3 | CONSUMER | 5 | Attestation `ch_price_display`. **[verify]** the Price Indication Ordinance (PBV): not opened | [CH-S18] |

Not an item: Swiss law is not understood to give a general statutory right to withdraw from online contracts. **[verify]** before telling users anything about refunds; `web.policy.refund_policy_found` should be information only for Switzerland.

### 3.5 Layer 5 — Fundraising

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CH-5.01 | Capital increase: shareholders' resolution, public deed and entry in the commercial register | 5 | event-driven | INVESTED | 1 / 4 | Facts `registry.ch.zefix.capital_nominal` (change between scans) and `registry.ch.zefix.last_sogc_publication_on`; slot `ch_capital_increase_deed`. **[verify]** the procedure and articles (Art. 650 ff. OR) and the capital band introduced in 2023: not read | [CH-S10] |
| CH-5.02 | Prospectus exemption for a public offer of shares (FinSA Art. 36): offer to fewer than 500 investors; or total value not above CHF 8m over 12 months; or professional clients only; or a minimum of CHF 100,000 per investor | 5 | S4 | INVESTED | 5 | Attestation `ch_prospectus_exemption` (which exemption is relied on). **[verify]** against the current consolidated FinSA: the 500-investor and CHF 8m figures were read in the 2020 and 2021 consolidations, not the current one | [CH-S9] |
| CH-5.03 | Share register, beneficial-owner list and Transparency Register updated after the round | 5 | S4 | INVESTED | 5 | Re-uses CH-1.08, CH-1.09, CH-1.10 | [CH-S4] |
| CH-5.04 | Federal stamp duty on the issue of equity above an exempt amount | 5 | S4 | INVESTED | 5 | Attestation `ch_issuance_stamp_duty`. **[verify]** the rate and the exempt amount: ESTV page not opened | [CH-S6] |
| CH-5.05 | Shareholders' agreement and investment documents | 5 | S4 | INVESTED | 5 | Vault (International pack slots) | — (contractual, no statute) |

### 3.6 Layer 6 — AI and data

| ID | Item | Layer | Stage | Trigger | Tier | Verification route | Source |
|---|---|---|---|---|---|---|---|
| CH-6.01 | **Status, not an obligation.** No AI-specific statute is in force. On 12 Feb 2025 the Federal Council decided to ratify the Council of Europe AI Convention and adapt Swiss law sector by sector; on 28 Oct 2026 it took note of progress and a guidance paper for voluntary self-commitments; the consultation is planned for spring 2027. Shown to users as policy status, never scored | 6 | — | AI | — | Information only | [CH-S8] |
| CH-6.02 | **Binding law.** Decisions based solely on automated processing that have a legal effect or significantly affect a person: inform the person and, on request, let them state their view | 6 | S3 | AI | 1 / 5 | Fact `web.policy.ai_disclosure_found`; attestation `ch_automated_decisions`. **[verify]** Art. 21 FADP and its exceptions: not read | [CH-S13] |
| CH-6.03 | **Guidance.** FADP applies to AI processing of personal data (FDPIC position) | 6 | S3 | AI, PERSONAL_DATA | 5 | Vault slot `ch_ai_governance` (International pack AI rule). **[verify]** the FDPIC statement: not opened | [CH-S7] |

---

## 4. Counts

| | Items |
|---|---|
| Total items (CH-1.01 to CH-6.03) | 43 |
| Carrying **[verify]** | 28 |
| Tier 1 possible (Zefix or URL scan, alone or with another route) | 14 |
| Tier 3 | 1 |
| Tier 4 (alone or with tier 1/5) | 7 |
| Tier 5 only | 22 |
| Information only | 1 |

Tier rows overlap where an item has two routes (for example "1 / 4").

Fewer Swiss items are verifiable without a document than in the UK, because there is no annual filing and Zefix keeps no people.

---

## 5. Core set every Swiss AG or GmbH must show at Stage 2

1. Registered and active; AG or GmbH; seat in Switzerland (CH-1.01, 1.02, 1.05; tier 1).
2. A person resident in Switzerland who can represent the company (CH-1.06 / 1.07; tier 5).
3. Share register and beneficial-owner list kept (CH-1.08, 1.10; tier 5).
4. Transparency Register report made, or the transitional deadline not yet passed (CH-1.09; tier 4/5). **Time-critical from 1 Jan 2027.**
5. Audit firm on the register, or a valid opting-out (CH-1.12, 1.13; tier 1 + 4).
6. Privacy notice on the website (CH-3.02; tier 1).
7. Founders' and contractors' IP assigned (CH-2.03, 2.04; tier 5).

---

## 6. To confirm before encoding

- Every **[verify]** line where the statute was not read: OR Arts. 621, 626, 632, 686, 697j, 697l, 699, 718(4), 727, 727a, 773, 776, 777c, 790, 805, 814(3), 958f; FADP Arts. 10, 12, 19, 21, 22, 24; URG Art. 17; UWG Arts. 3(1)(o), 3(1)(s), 8.
- TJPG: deadline for companies formed after 1 Oct 2026; exact transitional dates; whether Art. 697l OR's company-level list survives unchanged.
- Cookies: whether Swiss law requires prior consent for any cookie category.
- FinSA Art. 36 thresholds in the current consolidation; issuance stamp duty rate and exempt amount.
- Social insurance: AHV, BVG entry threshold for 2026 and 2027, UVG.
- Zefix: first real reply, and whether residency of signatories can be read without keeping people.

---

## 7. Sources (all checked 16 Nov 2026)

| Key | Source | URL | How read |
|---|---|---|---|
| CH-S1 | Zefix PublicREST, Federal Registry of Commerce (as documented for the engine) | https://www.zefix.admin.ch/ZefixPublicREST/ ; `docs/NATIONAL-REGISTERS.md` | Engine documentation checked against the official OpenAPI on 16 Nov 2026; not re-read by this researcher |
| CH-S2 | KMU portal (SECO), "Rechtsform: Aktiengesellschaft AG" | https://www.kmu.admin.ch/de/rechtsform-aktiengesellschaft-ag | S |
| CH-S3 | KMU portal, "Wer ist zur ordentlichen Revision verpflichtet?" and "Kriterien für die Revisionsstelle und Revisionsart"; SECO opting-out service | https://www.kmu.admin.ch/de/wer-ist-zur-ordentlichen-revision-verpflichtet ; https://www.kmu.admin.ch/de/kriterien-fuer-die-revisionsstelle-und-revisionsart ; https://online-services.admin.ch/service/opting-out-fuer-kmu-10 | S |
| CH-S4 | Swiss Transparency Register, "Fragen und Antworten" | https://www.transpareg.admin.ch/de/fragen-antworten | R |
| CH-S5 | Federal Council press release on entry into force; Federal Office of Justice, "Schweizerisches Transparenzregister" | https://www.admin.ch/de/newnsb/x3sKLxCJ6S3dQJtfvy0Tb ; https://www.bj.admin.ch/de/schweizerisches-transparenzregister | S |
| CH-S6 | ESTV, "Mehrwertsteuerpflicht von ausländischen Unternehmen" and "Grundsätze der Mehrwertsteuer" | https://www.estv.admin.ch/de/mwst-steuerpflicht-auslaendische-unternehmen | S (stamp duty: N) |
| CH-S7 | FDPIC, DataBreach portal and breach guide v1.2 (Apr 2025); "Das neue Datenschutzgesetz aus Sicht des EDÖB" | https://www.edoeb.admin.ch/de/databreach ; https://www.edoeb.admin.ch/de/das-neue-datenschutzgesetz-aus-sicht-des-edob | S |
| CH-S8 | OFCOM (BAKOM), "Künstliche Intelligenz"; Federal Office of Justice, "Künstliche Intelligenz" | https://www.bakom.admin.ch/de/kuenstliche-intelligenz ; https://www.bj.admin.ch/de/kuenstliche-intelligenz | S |
| CH-S9 | Financial Services Act (FinSA / FIDLEG), SR 950.1 | https://www.fedlex.admin.ch/eli/cc/2019/758/de | S (2020 and 2021 consolidations only) |
| CH-S10 | Code of Obligations (OR / CO), SR 220 | https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de | N |
| CH-S11 | Copyright Act (URG / LDA), SR 231.1 | https://www.fedlex.admin.ch/eli/cc/1993/1798_1798_1798/de | N |
| CH-S12 | Swiss Federal Institute of Intellectual Property (IPI) | https://www.ige.ch | N |
| CH-S13 | Federal Act on Data Protection (FADP / DSG), SR 235.1 | https://www.fedlex.admin.ch/eli/cc/2022/491/de | N |
| CH-S14 | Telecommunications Act (FMG / LTC), SR 784.10 | https://www.fedlex.admin.ch/eli/cc/1997/2187_2187_2187/de | N |
| CH-S15 | Federal social insurance information (AHV/IV information centre) | https://www.ahv-iv.ch | N |
| CH-S16 | FINMA, authorised institutions | https://www.finma.ch | N |
| CH-S17 | Unfair Competition Act (UWG / LCD), SR 241 | https://www.fedlex.admin.ch/eli/cc/1988/223_223_223/de | N |
| CH-S18 | Price Indication Ordinance (PBV / OIP), SR 942.211 | https://www.fedlex.admin.ch/eli/cc/1978/2081_2081_2081/de | N |

The Fedlex ELI paths for SR 220, 231.1, 235.1, 241, 784.10 and 942.211 were written from the SR numbers and were not opened: **[verify]** each link resolves before a rule cites it.

---

## 8. Not encoded (draft pack `packages/rules/src/packs/ch.ts`, 16 Nov 2026)

The draft pack `CH` 0.1.0 holds 13 rules from 14 items (CH-1.12 and CH-1.13 are one rule, `CH.CORP.AUDIT`). Rules that cite a **[verify]** line are `needs_review`: they can only say "a person needs to check this" until a lawyer clears the line. These 29 items were left out:

| Item | Why it is not a rule yet |
|---|---|
| CH-1.03 | [verify] articles and public deed; the International pack already asks for the constitution (`INTL.CORP.CONSTITUTION`) |
| CH-1.04 | [verify] every capital figure: a threshold the rule would have to enforce |
| CH-1.07 | [verify] the GmbH residency rule itself was not found |
| CH-1.08 | [verify] articles; the International pack already asks for the shareholder register (`INTL.EQUITY.CAP_TABLE`) |
| CH-1.11 | [verify] the 6-month rule and the duty rest on a statute not read |
| CH-1.15 | [verify]; covered by `INTL.CORP.RESOLUTIONS` |
| CH-1.16 | Information only |
| CH-2.01, CH-2.02 | [verify]; covered by `INTL.IP.STAFF_ASSIGNMENT` |
| CH-2.03 | [verify]; covered by `INTL.IP.CONTRACTOR_ASSIGNMENT` |
| CH-2.04 | Same as `INTL.IP.OWNER_ASSIGNMENT`; no Swiss duty added |
| CH-2.05 | [verify], source not opened; not a legal duty |
| CH-3.01 | A scope statement: the `PERSONAL_DATA` trigger is used instead |
| CH-3.02 | [verify] content list; `INTL.DP.PRIVACY_NOTICE` checks the website |
| CH-3.05 | [verify], the FADP was not read |
| CH-3.06 | No duty for private companies; [verify] |
| CH-3.07 | [verify] the legal basis; cookies set before consent must not be scored |
| CH-3.09 | [verify] all of it |
| CH-3.10 | [verify], the FINMA source was not opened |
| CH-4.01 to CH-4.04 | [verify], the UWG and PBV were not read |
| CH-5.01 | [verify] procedure and articles |
| CH-5.04 | [verify] rate and exempt amount |
| CH-5.05 | Covered by the International pack's fundraising slots |
| CH-6.01 | Information only |
| CH-6.02 | [verify], FADP Art. 21 not read |
| CH-6.03 | [verify]; covered by the International pack's AI rules |

Encoded with care: `CH.CORP.STATUS` is a defect only for Zefix's own words "being cancelled" and "cancelled"; any other word is "verify". `CH.CORP.AUDIT` gives "verify", not a gap, when Zefix shows no audit firm, because a valid opting-out can't be seen there. `CH.CORP.TRANSPARENCY_REGISTER` enforces no deadline. `CH.DP.BREACH` stands in for `INTL.SEC.INCIDENT_RESPONSE`.

### Website rules not encoded (17 Nov 2026): regulator named in the notice, and legal notice

The website scan can now read `web.policy.dpa_named`, `web.policy.dpa_countries`, `web.policy.legal_notice_present` and `web.policy.registration_number_shown`, and the EU packs use them. CH: CH-3.02 says the content list of Art. 19 FADP was not read, so whether the notice must name the FDPIC is unconfirmed, and a rule for it was not added (the scan could now check it with `web.policy.dpa_named`). CH-4.01 (identity on the website) is [verify], the UWG was not read; a rule on it could only say "to check", so none was added. If a Swiss lawyer confirms CH-4.01, a rule can read `web.policy.legal_notice_present`.
