# Vero Scan — EU Common Rule-Pack Map

**Project:** Vero Scan
**Prepared by:** Vero Scan research (draft)
**Date:** 16 November 2026
**Sources:** EU legislation on EUR-Lex (and the Court of Justice's own site), each with its URL and the date checked. Secondary sources were used only to find the official texts, never as the citation.
**Status:** Draft from official sources, for lawyer review. Not legal advice.

> Technical mapping, not legal advice. A lawyer approves or strikes each line before it affects a score. This map holds what is the same in every EU member state, and in the EEA where noted. Each country map (France, Ireland, Netherlands, Finland, Denmark, Czechia, Poland, and Norway for the EEA) points here and adds only the national act, authority, deadline, threshold or register.

---

## 1. How to read the map

**Layer:** 1 Corporate Foundation · 2 IP and Technology · 3 Compliance and Regulatory · 4 Commercial · 5 Fundraising · 6 AI and Data.

**Stage** (earliest stage the item applies from): S1 Pre-incorporation · S2 Incorporated, pre-revenue · S3 Revenue, pre-raise · S4 Raising · S5 Post-raise, scaling.

**Trigger:**

| Trigger | Meaning |
|---|---|
| ALL | Every company at that stage |
| WEBSITE / APP | Has a public website or a published app |
| PERSONAL_DATA | Processes personal data |
| EMPLOYEES | Has employees |
| CONTRACTORS | Uses contractors or consultants |
| CONSUMER | Sells to consumers (B2C) |
| ENTERPRISE | Sells to enterprise or public-sector clients |
| CROSS_BORDER_B2C | Sells digital services to consumers in other EU states |
| NON_EU | Company established outside the EU that offers goods or services to people in the EU |
| PLATFORM | Hosts content for users or runs an online platform or marketplace |
| CONNECTED_PRODUCT | Makes connected products or offers cloud / data-processing services |
| AI | Uses or builds AI in the product |
| INVESTED | Has raised or is raising |
| SECTOR.* | Sector packs (payments, credit, crypto, healthtech, telecoms, …); triggers only here |

**Tier:** 1 official live source or URL scan · 2 licensed vendor · 3 official list import · 4 document-verified (Slot) · 5 attested (vault). Routes follow the *Verification Solutions Matrix*, sections 2 and 14.

**[verify]** means the item could not be confirmed from the official text on 16 Nov 2026, or the article was cited by number but its text was not re-read that day. The note says what is uncertain. Nothing marked [verify] may be encoded as a firm threshold or deadline until a lawyer confirms it.

**"checked 16 Nov 2026"** is written only for pages actually read that day. EUR-Lex pages are long, and our reader sees them in parts: where an article sits in a part we could not read, the line says so.

### Engine facts used by this map

These are the facts that exist today (`packages/connectors/src/fact-keys.ts`) and work in every EU/EEA country. Country registry facts (`registry.fr.*`, `registry.ie.cro.*`, `registry.nl.kvk.*`, `registry.fi.prh.*`, `registry.dk.cvr.*`, `registry.no.brreg.*`, `registry.cz.ares.*`, `registry.pl.krs.*`) are in the country maps.

| Fact | What it can show | What it cannot show |
|---|---|---|
| `web.policy.privacy_notice_found`, `.privacy_notice_url`, `.word_count`, `.last_updated`, `.names_company` | A privacy notice is published and reachable; it names the company | That it is accurate or lawful |
| `web.policy.rights_section`, `.retention_statement`, `.transfers_section`, `.dpo_contact`, `.children_section` | The notice has the matching section | Whether the content is correct. The patterns are English: a notice only in French, Dutch, Polish, etc. can read as missing, so a miss must count as "to check", not a fail |
| `web.policy.complaint_route_ico`, `.complaint_route_ndpc` | Not usable here: they look for the UK ICO and Nigeria's NDPC | There is **no fact yet** for "names the national EU supervisory authority" (engine gap) |
| `web.policy.cookie_policy_found`, `.cmp_detected`, `.cookies_before_consent_count`, `.trackers_before_consent_count` | A cookie policy exists; a consent tool is present; how many non-essential cookies / trackers load before any choice | Whether "reject" is on the first layer, whether consent is stored and can be withdrawn |
| `web.policy.terms_found`, `.refund_policy_found`, `.complaints_policy_found`, `.acceptable_use_found`, `.eula_found`, `.takedown_policy_found` | The page exists | That its terms are fair or complete |
| `web.policy.accessibility_found` | An accessibility statement exists | That the site meets the standard |
| `web.policy.ai_disclosure_found` | A published AI disclosure exists | That the AI Act's transparency duties are met |
| `web.policy.security_txt_found` | A `security.txt` file exists | Any NIS2 compliance |
| `web.policy.eu_representative_named`, `.uk_representative_named`, `.dsa_contact_point_named`, `.dsa_legal_representative_named` (added 18 Nov 2026) | The notice, legal notice, DSA page or terms names an EU or UK representative, a DSA single point of contact or a DSA legal representative, in any of the 16 languages the scan reads | That the representative was appointed in writing, notified, or is reachable. A miss counts only when every page found was read in a supported language |
| `registry.eu.vies_vat.valid`, `.request_date`, `.name_matches` | The company's VAT number is valid in VIES on that date, and (only where the name carries a legal-form word) whether the name matches | That returns are filed or VAT is paid. Needs the company's VAT number. Not Norway (not in VIES) |
| `registry.global.gleif.*` | The company's LEI record, status, legal form, registration authority, parents as LEIs | Anything about compliance. Most startups have no LEI: a miss means nothing |
| `registry.sanctions.match`, `.possible_match`, `.lists_checked` | The company name is close to or matches an entry on the lists checked (EU, UN, OFAC, UK, France) | That the company is sanctioned. Directors and owners are not screened |

---

## 2. Notes for the reviewing lawyer

1. **What "common" means.** A regulation (GDPR, AI Act, AMLR, Data Act, DSA, Prospectus Regulation, EUTM Regulation) applies directly in every member state, so the obligation sits here and the country map adds the national authority and any national option used. A directive (ePrivacy, e-commerce, consumer rights, VAT, accounting, company law, accessibility, NIS2) applies only as transposed. The rule is shown here; the national provision that carries it is in each country map.
2. **Norway is EEA, not EU.** EU acts reach Norway only once taken into the EEA Agreement and made Norwegian law. The GDPR applies in Norway through personopplysningsloven. The VAT Directive and the EU trade mark do not cover Norway, and VIES does not hold Norwegian numbers. The AI Act had not been made Norwegian law on 16 Nov 2026 as far as we could find (draft "KI-lov", consultation 30 Jun 2025, **[verify]**). The "EEA" column below says how each section reaches Norway; the Norway map has the detail.
3. **The AI Act timetable changed on 27 Jul 2026.** The Digital Omnibus on AI, Regulation (EU) 2026/1744, moved the high-risk obligations. The dates in Section 7 are from the amended Article 113 as read on 16 Nov 2026. Any rule written from older notes (high-risk from 2 Aug 2026) is now wrong.
4. **Beneficial ownership is mid-change.** The 2015 directive (as amended in 2018) still governs today; the AML Regulation (EU) 2024/1624 applies from 10 Jul 2027. Public access to national UBO registers was struck down by the Court of Justice on 22 Nov 2022, and several countries closed public access, so in most countries the engine cannot check a UBO filing itself: it stays a document slot.
5. **Biggest engine gaps for the EU:** no fact for the national supervisory authority named in a privacy notice; no fact for the website company particulars (register, number, legal form, seat) that Article 26 of Directive 2017/1132 and Article 5 of Directive 2000/31 require; no fact for the order button or withdrawal button; and English-only text patterns in the website scan.

---

## 3. Section-by-section map

Table columns: Item · Layer · Stage · Trigger · Tier · Route / note · Source. "EEA" notes say how the rule reaches Norway.

### EU Section 1 — GDPR

Regulation (EU) 2016/679. Directly applicable. **EEA:** applies in Norway through the EEA Agreement and personopplysningsloven (see Norway map). The country map adds the national act, the national authority, the age of digital consent and any national DPO or registration duty.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Privacy notice with the Article 13 information | 3 | S2 | WEBSITE / APP, PERSONAL_DATA | 1 | `web.policy.privacy_notice_found`, `.names_company`, `.rights_section`, `.retention_statement`, `.transfers_section`. Art 13 requires: controller identity and contact; DPO contact where there is one; purposes and legal basis; recipients; transfers to third countries; retention period; the rights; the right to complain to a supervisory authority; automated decision-making. A miss in a non-English notice is "to check" | GDPR arts 12(1), 13(1)–(2): https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng, checked 16 Nov 2026 |
| Notice names the national supervisory authority | 3 | S2 | WEBSITE / APP, PERSONAL_DATA | 5 | Attestation. No engine fact yet (`complaint_route_ico` is UK only). Authority per country map | GDPR art 13(2)(d), as above |
| Right to object shown explicitly | 3 | S2 | PERSONAL_DATA (relies on legitimate interests or does direct marketing) | 5 | Attestation; vault | GDPR art 21(4), as above |
| Age of digital consent for online services to children | 3 | S2 | PERSONAL_DATA (service offered to children) | 1 / 5 | `web.policy.children_section` shows the notice covers children; attestation for the consent flow. Default 16; a member state may set 13 to 15: national age in each country map | GDPR art 8(1), as above |
| Records of processing activities | 3 | S2 | PERSONAL_DATA | 5 | Vault. Exemption under 250 employees only if processing is occasional, low-risk and has no special-category or criminal data, so most tech companies that process customer data keep records | GDPR art 30(5), as above |
| Processor agreements (DPAs) | 3 | S2 | PERSONAL_DATA (uses processors) | 5 | Vault; Slot for the signed DPA where an enterprise customer asks | GDPR art 28(3), as above |
| Data protection by design and by default | 3 | S2 | PERSONAL_DATA | 5 | Attestation | GDPR art 25, as above |
| DPIA for high-risk processing | 6 | S2 | PERSONAL_DATA (high risk: profiling with significant effects, large-scale special-category data, systematic monitoring), AI | 5 | Vault. National authorities publish lists of processing that needs a DPIA: country map | GDPR art 35(1), (3), as above |
| Automated decisions: safeguards and notice | 6 | S3 | AI, PERSONAL_DATA (solely automated decisions with legal or similarly significant effect) | 5 | Attestation; links to EU Section 7 | GDPR art 22(1), art 13(2)(f), as above |
| DPO designated where required | 3 | S2 | PERSONAL_DATA (core activity is large-scale regular and systematic monitoring, or large-scale special-category data) | 5 + 1 | Attestation; `web.policy.dpo_contact` checks the notice publishes the DPO contact. Art 37(7): publish the contact and communicate it to the supervisory authority. How it is communicated is national: France has a list fact (`registry.fr.cnil_dpo.listed`) | GDPR art 37(1)(b)–(c), 37(7), as above |
| Breach notification within 72 hours; breach log | 3 | S2 / event-driven | PERSONAL_DATA | 5 | Vault (breach response plan, breach register) | GDPR art 33(1), as above |
| International transfer safeguards (SCCs or other Art 46 tool) | 3 | S2 | PERSONAL_DATA (data leaves the EEA) | 5 | Vault; `web.policy.transfers_section` checks the notice mentions transfers | GDPR arts 44, 46(2)(c), as above |
| Lead supervisory authority (one-stop shop) | 3 | S2 | PERSONAL_DATA (cross-border processing) | — | Note for rules: the lead authority is the one where the main establishment is. A company in one country but with users across the EU deals mainly with its home authority | GDPR art 56, as above |
| EU representative appointed | 3 | S2 | NON_EU (no establishment in the EU; offers goods or services to people in the EU, or monitors their behaviour there), PERSONAL_DATA | 1 / 5 | `web.policy.eu_representative_named` (the notice, legal notice or home page names an EU representative); attestation otherwise. Art 13(1)(a): the notice gives the representative's identity and contact details "where applicable". Exempt for occasional processing that does not include large-scale special-category or criminal-offence data and is unlikely to result in a risk, and for public authorities. The representative is established in one of the member states where the data subjects are. Applies to companies outside the EU (for example a UK or Delaware company with EU users), so it belongs as a market overlay | GDPR art 3(2), art 13(1)(a), art 27(1)–(3): https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng, re-read 18 Nov 2026 |
| Fine ceilings | 3 | — | — | — | Note for consequence text only: up to EUR 20m or 4% of worldwide turnover for the most serious breaches **[verify]**: art 83 was in a part of the page our reader did not reach | GDPR art 83(4)–(5), **[verify]** |

### EU Section 2 — ePrivacy and cookies

Directive 2002/58/EC as amended by Directive 2009/136/EC. Transposed nationally; each national authority issues its own guidance (CNIL, DPC, AP/ACM, Traficom, Datatilsynet, Nkom, ÚOOÚ, UODO/UKE: see country maps). **EEA:** applies in Norway through ekomloven (Norway map).

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Consent before non-essential cookies or similar storage | 3 | S2 | WEBSITE / APP | 1 | `web.policy.cookies_before_consent_count`, `.trackers_before_consent_count` (non-zero is a gap). Exempt only where storage is strictly necessary for a service the user asked for, or for transmission | Directive 2002/58/EC art 5(3), consolidated to 19 Dec 2009: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02002L0058-20091219, checked 16 Nov 2026 |
| Consent tool present | 3 | S2 | WEBSITE | 1 | `web.policy.cmp_detected`. The consent standard is the GDPR one (freely given, specific, informed, unambiguous; as easy to withdraw). The "reject at the first layer" test is national guidance: country map | Art 5(3) as above; GDPR art 4(11) and 7 **[verify]**: articles cited by number, text not re-read |
| Cookie information (purposes, who sets them) | 3 | S2 | WEBSITE | 1 | `web.policy.cookie_policy_found` | Art 5(3) as above ("clear and comprehensive information … about the purposes") |

### EU Section 3 — E-commerce information duties

Directive 2000/31/EC, plus the website particulars required by company law (Directive (EU) 2017/1132 art 26). Transposed nationally: France LCEN, Ireland S.I. 68/2003, Netherlands BW 3:15d, etc. **EEA:** applies in Norway through ehandelsloven.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Provider identity on the website: name, geographic address, email | 4 | S2 | WEBSITE / APP | 5 | Attestation. No engine fact yet for an imprint / legal-notice page (engine gap) | Directive 2000/31/EC art 5(1)(a)–(c): https://eur-lex.europa.eu/eli/dir/2000/31/oj/eng, checked 16 Nov 2026 |
| Trade register and registration number on the website | 4 | S2 | WEBSITE / APP | 5 | Attestation. A future fact could compare the number shown with the registry fact (`registry.<cc>.*`) | Art 5(1)(d), as above |
| VAT number on the website | 4 | S3 | WEBSITE / APP (VAT-registered) | 5 | Attestation; the number itself can be checked with `registry.eu.vies_vat.valid` | Art 5(1)(g), as above |
| Supervisory authority named | 4 | S2 | WEBSITE / APP, SECTOR.* (authorised activity) | 5 | Attestation | Art 5(1)(e), as above |
| Prices clear, with tax and delivery stated | 4 | S3 | CONSUMER | 5 | Attestation | Art 5(2), as above |
| Commercial communications identifiable as such | 4 | S3 | WEBSITE / APP (marketing) | 5 | Attestation | Art 6, as above |
| Ordering steps, error correction and contract languages shown before an order | 4 | S3 | WEBSITE / APP (online ordering) | 5 | Attestation. Business customers may agree otherwise; not for contracts made only by email | Art 10(1), as above |
| Company particulars on letters, order forms and website (register, number, legal form, seat; capital if stated must be subscribed and paid up) | 1 | S2 | ALL (website: WEBSITE) | 5 | Attestation. National provisions in each country map | Directive (EU) 2017/1132 art 26: https://eur-lex.europa.eu/eli/dir/2017/1132/oj/eng, checked 16 Nov 2026 |

### EU Section 4 — Consumer law

Directive 2011/83/EU (Consumer Rights Directive) as amended, including the withdrawal function added by Directive (EU) 2023/2673. Transposed nationally. **EEA:** applies in Norway through angrerettloven (Norway map); whether the 2023/2673 withdrawal function is in Norwegian law is in the Norway map.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Consumer terms with the pre-contract information (trader identity, address, total price with taxes, withdrawal right, …) | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.terms_found` shows terms exist; content is attestation | Directive 2011/83/EU art 6(1), consolidated to 28 May 2022: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02011L0083-20220528, checked 16 Nov 2026 |
| Order button says "order with obligation to pay" (or equivalent) | 4 | S3 | CONSUMER (online ordering) | 5 | Attestation. If missing, the consumer is not bound | Art 8(2), as above |
| 14-day withdrawal right explained; refund policy | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.refund_policy_found`; content attestation | Art 9(1), as above |
| Digital content: consent and acknowledgement before immediate supply | 4 | S3 | CONSUMER (digital content or SaaS sold to consumers) | 5 | Attestation. The withdrawal right is lost only with prior express consent, acknowledgement and confirmation | Art 16(m), as above |
| Online withdrawal function ("withdraw from contract here"), from 19 Jun 2026 | 4 | S3 | CONSUMER (contracts concluded through an online interface) | 5 | Attestation; future URL-scan check. Must be prominent, available throughout the withdrawal period, with a "confirm withdrawal" step and an acknowledgement on a durable medium. National implementation per country map (some were late) | Directive (EU) 2023/2673 (new art 11a of 2011/83/EU): https://eur-lex.europa.eu/eli/dir/2023/2673/oj/eng, checked 16 Nov 2026 (apply from 19 Jun 2026) |
| Complaints route for consumers | 4 | S3 | CONSUMER | 1 / 5 | `web.policy.complaints_policy_found` | National law: country maps |
| Unfair contract terms rules | 4 | S3 | CONSUMER | 5 | Attestation; lawyer review of terms | Directive 93/13/EEC **[verify]**: cited by number, text not read |
| Digital content and services conformity and remedies | 4 | S3 | CONSUMER (digital content or SaaS sold to consumers) | 5 | Attestation | Directive (EU) 2019/770 **[verify]**: cited by number, text not read |

### EU Section 5 — VAT

Council Directive 2006/112/EC as amended, including the SME scheme in Directive (EU) 2020/285. Registration is national: the country map gives the national threshold and office. **EEA:** does **not** apply to Norway (own merverdiavgiftsloven; not in VIES).

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| VAT number valid in VIES | 3 | S3 | ALL (VAT-registered) | 1 | `registry.eu.vies_vat.valid`, `.request_date`, `.name_matches`. Needs the VAT number from the questionnaire. A valid number does not show returns are filed | VIES is the EU's VAT number check (engine source `eu.vies_vat`; docs/GLOBAL-COVERAGE.md) |
| National small-business exemption threshold | 3 | S3 | ALL | — | Note: a member state's threshold may not exceed EUR 85,000 (or the national-currency equivalent). National figure in each country map | Directive (EU) 2020/285, new art 284(1): https://eur-lex.europa.eu/eli/dir/2020/285/oj/eng, checked 16 Nov 2026 (applies from 1 Jan 2025) |
| Exemption in another member state (EU turnover up to EUR 100,000) | 3 | S3 | CROSS_BORDER_B2C (opts for another state's SME exemption) | 5 | Attestation; prior notification to the home state **[verify]**: notification procedure (art 284(3)) not quoted | Directive (EU) 2020/285, new art 284(2)(a), as above |
| Registration under the SME scheme | 3 | S3 | ALL | — | Note: a member state may release exempt small businesses from registering; otherwise identification within 15 working days. So "below the threshold" does not always mean "no registration": country map | Directive (EU) 2020/285, new art 292b, as above |
| Cross-border B2C digital services: EUR 10,000 EU-wide threshold, then VAT where the customer is (OSS) | 3 | S3 | CROSS_BORDER_B2C | 5 | Attestation. Above EUR 10,000 a year (current or previous year), VAT is due in the customer's state, usually through the One-Stop Shop **[verify]**: OSS articles (369a ff.) not read | Directive 2006/112/EC art 59c, consolidated to 1 Jan 2025: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02006L0112-20250101, checked 16 Nov 2026 |
| B2B services to other member states: reverse charge, EC Sales List | 3 | S3 | ENTERPRISE (customers in other EU states) | 5 | Attestation **[verify]**: art 196 and recapitulative-statement articles not read | Directive 2006/112/EC art 196, **[verify]** |

### EU Section 6 — Beneficial ownership (AML)

Directive (EU) 2015/849 art 30, as amended by Directive (EU) 2018/843, governs today; Regulation (EU) 2024/1624 (AMLR) applies from 10 Jul 2027. Each country runs its own central register: country maps give the register, deadline, penalty and whether anyone can search it. **EEA:** applies in Norway through its own register act; whether the 2024 package is in EEA law is **[verify]** (Norway map).

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Company holds adequate, accurate and current beneficial-owner information and files it with the national central register | 1 | S2 | ALL | 4 | Slot: register extract or filing confirmation. No engine fact reads any national UBO register (most are closed to the public) | Directive (EU) 2015/849 art 30(1), (3) **[verify]**: cited by number, text not re-read |
| Ownership threshold: 25% of shares or voting rights (direct or indirect) | 1 | — | — | — | Note for the cap-table cross-check. AMLR keeps 25%; the Commission reviews by 10 Jul 2029 whether a lower threshold (at most 15%) is needed for higher-risk entities | Regulation (EU) 2024/1624 art 52(1)–(2): https://eur-lex.europa.eu/eli/reg/2024/1624/oj/eng, checked 16 Nov 2026 |
| Changes reported within 28 calendar days (from 10 Jul 2027) | 1 | S2 / event-driven | ALL | 4 | Slot: updated filing. Until 10 Jul 2027 national deadlines apply (country maps). AMLR: initial filing "without undue delay" after creation **[verify]**: whether a fixed day limit applies to the first filing | Regulation (EU) 2024/1624 art 63 and art 90 (applies from 10 Jul 2027): https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1624, checked 16 Nov 2026 |
| Annual check that the information is current (from 10 Jul 2027) | 1 | S2 (annual) | ALL | 5 | Attestation | Regulation (EU) 2024/1624 art 63, as above |
| Public access to UBO registers | 1 | — | — | — | Note: the Court of Justice held public access invalid on 22 Nov 2022 (Joined Cases C-37/20 and C-601/20, WM and Sovim). Why the engine treats UBO as a document slot | Court of Justice: https://curia.europa.eu/juris/liste.jsf?num=C-37/20 **[verify]**: official page not readable by our tool on 16 Nov 2026 |

### EU Section 7 — AI Act

Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744 (Digital Omnibus on AI, in force 27 Jul 2026). Directly applicable. National market surveillance authorities and national guidance are in each country map. **EEA:** not yet Norwegian law as far as we could find; a Norwegian company placing AI on the EU market is reached through that market (Norway map) **[verify]**.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Role identified: provider, deployer, importer or distributor of each AI system | 6 | S2 | AI | 5 | Attestation; vault (AI inventory). Every other line depends on this | Regulation (EU) 2024/1689: https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng, checked 16 Nov 2026 (page read in part) |
| No prohibited AI practices (since 2 Feb 2025) | 6 | S2 | AI | 5 | Attestation. Chapters I and II apply from 2 Feb 2025 | Amended art 113: https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng, checked 16 Nov 2026 |
| New prohibitions: AI that generates non-consensual intimate imagery of identifiable people or child sexual abuse material (from 2 Dec 2026) | 6 | S2 | AI (generative image, video or audio) | 5 | Attestation | Regulation (EU) 2026/1744, new art 5(1)(ba)–(bb); amended art 113 (from 2 Dec 2026), as above |
| AI literacy measures for staff and others operating AI for the company | 6 | S2 | AI | 5 | Attestation; vault (training record). Art 4 replaced by 2026/1744: providers and deployers take measures to support AI literacy; no specific level guaranteed per person | Regulation (EU) 2026/1744, new art 4, as above |
| Transparency: people told they are interacting with an AI system; synthetic content marked; deepfakes disclosed (from 2 Aug 2026) | 6 | S3 | AI (chatbots, generative AI, emotion recognition, deepfakes) | 1 / 5 | `web.policy.ai_disclosure_found` shows a published disclosure; in-product notices and machine-readable marking are attestation. Generative systems placed on the market before 2 Aug 2026 must meet the marking duty (art 50(2)) by 2 Dec 2026 | Art 50; Regulation (EU) 2026/1744 art 111(4) and recital 38, as above. The 2 Aug 2026 date for art 50 is the general application date (recital 40) **[verify]**: art 113 of the base text was in a part our reader did not reach |
| High-risk AI (Annex III uses: employment, credit scoring, education, essential services, …): risk management, data governance, documentation, logging, human oversight, conformity, registration (from 2 Dec 2027) | 6 | S3 | AI (Annex III use case) | 5 | Vault (technical documentation, conformity declaration, EU database registration) | Amended art 113: Chapter III Sections 1–3 for art 6(2) / Annex III systems from 2 Dec 2027, as above |
| High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028) | 6 | S3 | AI, SECTOR.HEALTHTECH or other Annex I product | 5 | Vault | Amended art 113: art 6(1) / Annex I systems from 2 Aug 2028, as above |
| High-risk systems already on the market | 6 | — | AI (Annex III use case) | — | Note: covered only if significantly changed after the application date; systems used by public authorities by 2 Aug 2030 | Regulation (EU) 2026/1744 art 111(2), as above |
| General-purpose AI model obligations (providers of GPAI models only) | 6 | S3 | AI (trains and releases a general-purpose model) | 5 | Vault. Models placed on the market before 2 Aug 2025 comply by 2 Aug 2027 (art 111(3)); new models from 2 Aug 2025 **[verify]**: art 113 of the base text not read; date inferred from art 111(3) | Art 111(3): https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689, checked 16 Nov 2026 |
| Fine ceilings and the SME rule | 6 | — | — | — | Note for consequence text: prohibited practices up to EUR 35m or 7%; most other duties including art 50 up to EUR 15m or 3%; wrong information up to EUR 7.5m or 1%; for SMEs and start-ups the lower of the two. 2026/1744 adds the same rule for small mid-caps | Art 99(3)–(6), as above; Regulation (EU) 2026/1744 art 99(6a), as above |
| SME priority access to regulatory sandboxes | 6 | S3 | AI (optional) | 5 | Attestation. 2026/1744 gives SMEs, start-ups and small mid-caps priority access; each state was to have a sandbox by 2 Aug 2026 | Regulation (EU) 2026/1744 art 57; base text art 57(1), as above |

### EU Section 8 — Accessibility

Directive (EU) 2019/882 (European Accessibility Act). Transposed nationally. **EEA:** status in Norway **[verify]** (Norway map).

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Accessible e-commerce service and accessibility information (from 28 Jun 2025) | 4 | S3 | CONSUMER (e-commerce, consumer banking, e-books, electronic communications) | 1 / 5 | `web.policy.accessibility_found` shows a statement exists; conformance is attestation. Covers services provided to consumers after 28 Jun 2025 | Directive (EU) 2019/882 art 2(2): https://eur-lex.europa.eu/eli/dir/2019/882/oj/eng, checked 16 Nov 2026 |
| Microenterprise exemption for services (under 10 staff and turnover or balance sheet up to EUR 2m) | 4 | — | CONSUMER | — | Note: service-providing microenterprises are exempt. A rule should ask for size before flagging | Art 3(23), 4(5), as above |
| Business-to-business SaaS | 4 | — | ENTERPRISE | — | Note: the Act covers services to consumers; pure B2B SaaS is generally outside it **[verify]**: lawyer to confirm the scope wording | Art 2(2), as above |

### EU Section 9 — Company law and accounts

Directive (EU) 2017/1132 (company law, disclosure) and Directive 2013/34/EU (accounting) as amended by Delegated Directive (EU) 2023/2775. National company acts carry the rules: deadlines, audit thresholds and register are in each country map. **EEA:** both apply in Norway through the EEA Agreement (regnskapsloven, aksjeloven).

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Disclosure in the national register: instrument of incorporation and statutes, amendments, directors and representatives, annual accounts, registered office changes, winding-up | 1 | S2 | ALL | 1 | Country registry facts (`registry.<cc>.*`) | Directive (EU) 2017/1132 art 14: https://eur-lex.europa.eu/eli/dir/2017/1132/oj/eng, checked 16 Nov 2026 |
| Company size class for accounts (micro / small / medium) | 1 | S2 (annual) | ALL | 5 | Attestation of balance sheet, turnover, staff. EU ceilings after 2023/2775: micro EUR 450,000 balance / EUR 900,000 turnover; small EUR 5m / EUR 10m, which a state may raise to at most EUR 7.5m / EUR 15m; medium EUR 25m / EUR 50m. Employee limits unchanged by 2023/2775 **[verify]**: base art 3 staff figures (10 / 50 / 250) not re-read | Delegated Directive (EU) 2023/2775: https://eur-lex.europa.eu/eli/dir/2023/2775/oj/eng, checked 16 Nov 2026 (transpose by 24 Dec 2024; financial years from 1 Jan 2024, optionally 1 Jan 2023) |
| Statutory audit required only for medium and large companies under EU law; small-company audit is a national choice | 1 | S3 (annual) | ALL | — | Note: the national audit thresholds in each country map decide. Many are **[verify]** because states were still moving to the 2023/2775 figures | Directive 2013/34/EU art 34 **[verify]**: cited by number, text not re-read |

### EU Section 10 — Fundraising and prospectus

Regulation (EU) 2017/1129 (Prospectus Regulation) as amended by Regulation (EU) 2024/2809 (Listing Act). Directly applicable. Here only as triggers: a private share issue to a few investors normally needs no prospectus, and the share issue formalities are national (country maps). **EEA:** applies in Norway through the EEA Agreement **[verify]** for the 2024 amendments.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Offer only to qualified investors: no prospectus | 5 | S4 | INVESTED | 5 | Attestation (investor list) | Regulation (EU) 2017/1129 art 1(4)(a): https://eur-lex.europa.eu/eli/reg/2017/1129/oj/eng, checked 16 Nov 2026 |
| Offer to fewer than 150 non-qualified investors per member state: no prospectus | 5 | S4 | INVESTED | 5 | Attestation (investor count per state) | Art 1(4)(b), as above |
| Offer below EUR 12m in the EU over 12 months (a state may set EUR 5m): no prospectus | 5 | S4 | INVESTED (wider offer, e.g. crowd round) | 5 | Attestation; the state may require a shorter information document. Date these thresholds apply from **[verify]**: the Listing Act's application article was read in part and the point carrying art 3(2) was not identified | Regulation (EU) 2024/2809, amended art 3(2)(b) and new art 3(2a): https://eur-lex.europa.eu/eli/reg/2024/2809/oj/eng, checked 16 Nov 2026 |
| Crowdfunding through a licensed platform | 5 | S4 | INVESTED (crowdfunding) | 5 | Attestation; platform must be authorised under Regulation (EU) 2020/1503 **[verify]**: its offer ceiling not read | Regulation (EU) 2020/1503 **[verify]** |

### EU Section 11 — EU trade mark

Regulation (EU) 2017/1001. One registration at EUIPO covers all EU states. National marks are in each country map. **EEA:** does **not** cover Norway (Norwegian mark at Patentstyret).

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Brand protected by an EU trade mark or a national mark in each operating market | 2 | S2 (application) / S3 (registration) | ALL | 4 | Slot: EUIPO registration certificate. No EUIPO fact in the engine yet (the matrix names the EUIPO API as a future route) | Regulation (EU) 2017/1001: https://eur-lex.europa.eu/eli/reg/2017/1001/oj/eng, checked 16 Nov 2026 |
| Renewal every 10 years from filing | 2 | every 10 years | ALL | 4 | Expiry date from the uploaded certificate | Art 52, as above |

### EU Section 12 — Other EU digital rules (triggers)

Triggers only. Each switches on a small set of attestations; none applies to every startup.

| Item | Layer | Stage | Trigger | Tier | Route / note | Source (checked 16 Nov 2026) |
|---|---|---|---|---|---|---|
| Digital Services Act: point of contact for authorities and users; clear terms on content restrictions | 4 | S3 | PLATFORM (any intermediary service: hosting, caching, platform) | 1 / 5 | `web.policy.terms_found`, `.takedown_policy_found`; content is attestation | Regulation (EU) 2022/2065 arts 11, 12, 14: https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng, checked 16 Nov 2026 |
| DSA single points of contact for authorities (art 11) and for users (art 12), made public | 4 | S3 | PLATFORM (any intermediary service) | 1 / 5 | `web.policy.dsa_contact_point_named` shows a published point of contact; the art 11(3) languages and the art 14 terms are attestation. Art 11(2) and 12(2): the provider "shall make public" the information needed to identify and reach them | Regulation (EU) 2022/2065 arts 11(1)–(3), 12(1)–(2): https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng, re-read 18 Nov 2026 |
| DSA legal representative in the EU | 4 | S3 | PLATFORM and NON_EU (no establishment in the EU; offers services in the EU) | 1 / 5 | `web.policy.dsa_legal_representative_named`; attestation otherwise. Art 13(1): designate in writing a legal or natural person in one of the member states where it offers services. Art 13(4): notify the representative's name, postal address, email and telephone to the Digital Services Coordinator there, and keep that information "publicly available, easily accessible, accurate and kept up to date". Art 13(5): the designation is not an establishment in the EU. A market overlay, like the GDPR representative | Art 13(1)–(5), as above, re-read 18 Nov 2026 |
| DSA online-platform duties (Section 3) do not apply to micro and small enterprises | 4 | — | PLATFORM | — | Note: ask for size before applying platform duties (does not apply to very large platforms) | Art 19(1), as above |
| Data Act: data access for connected products; cloud switching (from 12 Sep 2025) | 6 | S3 | CONNECTED_PRODUCT | 5 | Attestation. Chapter II data-access duties do not apply to products made by micro or small enterprises without larger partner or linked enterprises; cloud providers must enable switching (Chapter VI) | Regulation (EU) 2023/2854 recital 117, arts 7(1), 23–24: https://eur-lex.europa.eu/eli/reg/2023/2854/oj/eng, checked 16 Nov 2026. Application article (art 50) not reached **[verify]** |
| NIS2: cybersecurity measures and incident reporting | 3 | S3 | SECTOR (medium-sized or larger in an Annex I/II sector, e.g. cloud, managed ICT services, online marketplaces); some (DNS, TLD, trust services, public networks) regardless of size | 5 | Attestation; `web.policy.security_txt_found` as a weak signal only. National act and authority per country. Early warning within 24 hours of a significant incident | Directive (EU) 2022/2555 art 2(1)–(2); recital 102: https://eur-lex.europa.eu/eli/dir/2022/2555/oj/eng, checked 16 Nov 2026. Annexes and art 23 not reached **[verify]** |

---

## 4. Counts by tier

| Tier | Items (approx.) | What this means |
|---|---|---|
| 1 Official live or URL scan | 14 (6 Tier 1 only; 8 shared with Tier 5) | Website scan facts and VIES; the only EU-wide automated checks |
| 2 Licensed vendor | 0 | — |
| 3 Official list import | 0 | National lists (for example the CNIL DPO list) are in country maps |
| 4 Document-verified | 4 | UBO filing and changes, EU trade mark |
| 5 Attested (vault) only | 43 | Most GDPR, consumer, AI Act and VAT items |
| Notes (no score) | 12 | Thresholds, exemptions and consequence text for rules |

74 lines in total (62 items, 12 notes); 19 carry **[verify]**. (One line added 18 Nov 2026: the DSA points of contact, split from the DSA contact line.)

---

## 5. The EU core set every EU tech company must show at Stage 2

Each country map adds its national items to these:

1. Privacy notice with the Article 13 information, naming the national supervisory authority (Tier 1 + 5, WEBSITE)
2. No non-essential cookies or trackers before consent; consent tool present (Tier 1, WEBSITE)
3. Website identity information: name, address, email, register and number (Tier 5, WEBSITE)
4. Records of processing and processor agreements (Tier 5, PERSONAL_DATA)
5. Beneficial owners filed with the national register (Tier 4)
6. AI literacy measures and no prohibited practices (Tier 5, AI)
7. VAT number valid in VIES once registered (Tier 1, from S3)

---

## 6. Thresholds and facts to confirm before encoding

- GDPR art 83 fine ceilings (consequence text only) and arts 4(11) / 7 consent standard: not re-read.
- ePrivacy: none open at EU level; the national "reject at the first layer" tests are in the country maps.
- Consumer: Directives 93/13/EEC and 2019/770 cited by number only.
- VAT: the notification procedure for the cross-border SME exemption (art 284(3)); the OSS articles; art 196 reverse charge and the EC Sales List.
- UBO: Directive 2015/849 art 30 text; whether AMLR fixes a day limit for the first filing; the Court of Justice page (C-37/20 and C-601/20) could not be read.
- AI Act: art 113 of the base text (the 2 Aug 2025 GPAI date and the 2 Aug 2026 art 50 date are inferred from arts 111(3) and 111(4) and recital 40 of 2026/1744); Norway's adoption.
- Accessibility: whether pure B2B SaaS is outside the Act; Norway status.
- Accounts: base art 3 staff limits; art 34 audit scope.
- Prospectus: the date the Listing Act's EUR 12m / EUR 5m thresholds apply from; the crowdfunding ceiling; EEA status of the 2024 amendments.
- Data Act application article; NIS2 annexes and art 23 reporting deadlines.
- Engine gaps to raise with the build team (not legal points): a "national supervisory authority named" fact; a website company-particulars / legal-notice fact; order-button and withdrawal-button checks; non-English text patterns in the website scan.

---

## Not encoded (16 Nov 2026)

The EU common rules live in `packages/rules/src/packs/eu-common.ts` and are added to each EU and EEA country pack (FR, FI, DK, NL, IE, CZ, PL, NO, all version 0.1.0, draft) by `addEuCommon`. There are 37 of them. Each carries the country's prefix (`FR.DP.ROPA`) and a shared obligation (`eu_ropa`), so a company is asked each one once: its home country's rule counts, and the same rule from another EU country's pack, brought in by users there, gives way. Norway gets the 25 that reach it through the EEA (GDPR, cookies, e-commerce, consumer, company particulars); not VIES, the AI Act, the AMLR annual check, accessibility, prospectus, the DSA or the 2023/2673 withdrawal function. A page the website scan didn't find, on a site that is probably not in English, is "to check", never a gap (Ireland is the one English-language pack).

| Item | Section | Why |
|---|---|---|
| Lead supervisory authority (one-stop shop) | EU Section 1 | Note for rules, not a check |
| Fine ceilings | EU Section 1 | Note for consequence text, and [verify] |
| Consent tool present | EU Section 2 | [verify] on the consent articles. Folded into the cookie consent rule (`<CC>.DP.COOKIE_CONSENT`, which cites the core-set line): with no non-essential cookies before consent, no tool is needed |
| Unfair contract terms rules | EU Section 4 | [verify]: cited by number only |
| Digital content and services conformity and remedies | EU Section 4 | [verify]: cited by number only |
| National small-business exemption threshold | EU Section 5 | Note: national figure in each country map |
| Exemption in another member state | EU Section 5 | [verify]: notification procedure not read |
| Registration under the SME scheme | EU Section 5 | Note |
| Cross-border B2C digital services (EUR 10,000, OSS) | EU Section 5 | [verify]: the OSS articles were not read, and the threshold would decide |
| B2B services to other member states: reverse charge, EC Sales List | EU Section 5 | [verify] |
| Beneficial owners held and filed with the national register | EU Section 6 | [verify] on the directive text. Each country pack has its own beneficial-owner rule from its own map |
| Ownership threshold 25% | EU Section 6 | Note for the cap-table cross-check |
| Changes reported within 28 days (from 10 Jul 2027) | EU Section 6 | [verify] on the first filing; national deadlines in the country packs apply until then |
| Public access to UBO registers | EU Section 6 | Note, [verify] |
| Transparency (art 50) | EU Section 7 | [verify]: the 2 Aug 2026 date is inferred. `INTL.AI.TRANSPARENCY` still asks for a disclosure; FR and NO have their own disclosure rule, "to check" on a miss |
| High-risk systems already on the market | EU Section 7 | Note |
| General-purpose AI model obligations | EU Section 7 | [verify]: dates inferred, and no fact says the company releases a general-purpose model |
| Fine ceilings and the SME rule (AI Act) | EU Section 7 | Note for consequence text |
| SME priority access to regulatory sandboxes | EU Section 7 | Optional, not a duty |
| Microenterprise exemption for services | EU Section 8 | Not a rule: it is the size test in `<CC>.CONSUMER.ACCESSIBILITY` (more than 10 people, or revenue over $26m; a company of 1 to 10 people with lower revenue is taken as exempt) |
| Business-to-business SaaS | EU Section 8 | [verify] note |
| Disclosure in the national register | EU Section 9 | Covered by each country's status and register rules |
| Company size class for accounts | EU Section 9 | [verify]: staff limits not re-read |
| Statutory audit only for medium and large companies | EU Section 9 | [verify] note; national thresholds decide |
| Offer below EUR 12m (or EUR 5m) | EU Section 10 | [verify]: the date the thresholds apply from |
| Crowdfunding through a licensed platform | EU Section 10 | [verify] |
| Brand protected by an EU or national trade mark; renewal | EU Section 11 | Not a separate EU rule: the country trade mark rules take a national or EU certificate, with a 10-year renewal reminder |
| DSA platform duties don't apply to micro and small enterprises | EU Section 12 | Note |
| Data Act | EU Section 12 | [verify]: application article not reached; no fact for connected products |
| NIS2 | EU Section 12 | [verify]: annexes and art 23 not reached; no sector-size fact |

### Encoded 18 Nov 2026: representatives and points of contact

Three rules added to `eu-common.ts` (EU members only, not Norway): `<CC>.DP.EU_REPRESENTATIVE` (GDPR art 27, layer 3), `<CC>.COM.DSA_REPRESENTATIVE` (DSA art 13, layer 4, set to follow the company into EU markets) and `<CC>.COM.DSA_POINTS_OF_CONTACT` (DSA arts 11 and 12, layer 4, read from the website). "Established in the EU" is `derived.eu_established`: true for a company registered in an EU member state (the API always passes `company.jurisdiction`), otherwise the answer to the new question `eu_establishment`; offering services in the EU is the new answer `eu_offers_services`; an intermediary service is `derived.sector.platform`. A rule fails only when the answers show it applies and the website was read in a language the scan supports (`web.policy.language_supported`); a missing fact is "to check". The art 27(2) exemption (occasional, low-risk processing) is the company's to confirm: the rule's attestation says so. `<CC>.COM.DSA_CONTACT` keeps asking for the confirmation, because it also covers the art 14 content terms, which the scan cannot read.

AI Act dates encoded from the amended art 113 (Regulation (EU) 2026/1744): bans since 2 Feb 2025 (`<CC>.AI.PROHIBITED_PRACTICES`), the new art 5(1)(ba)-(bb) bans from 2 Dec 2026 (`<CC>.AI.PROHIBITED_GENERATIVE`), Annex III high-risk from 2 Dec 2027 (`<CC>.AI.HIGH_RISK`), Annex I from 2 Aug 2028 (`<CC>.AI.HIGH_RISK_PRODUCTS`). Each is "not in force" before its date.
