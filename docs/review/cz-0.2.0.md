# Review: Czechia (CZ) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** CZ, version 0.2.0, 69 rules (4 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `bd7eeec2d330ce949f47cc0a5bfe94e8b0d01e36d9cc217cb075e99fa8a8ed23`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (18)

### CZ.CORP.COMPANY_PARTICULARS — Company details on letters, forms and website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive (EU) 2017/1132, Art 26
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Company particulars on letters, order forms and website”
- **Applies when:** yes
- **Passes when:** `attest.eu_company_particulars` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_company_particulars` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s letters and website carry its company details**
> We don't have your confirmation that your letters, order forms and website show the register, company number, legal form and registered office.
> *Why it matters:* Company law asks every company to show these details on its paperwork and website.
> *If left:* Missing details can be fined, and they make the company look less established.
> *What to do:* Add the details to your letter and invoice templates and your website footer, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.UBO_ANNUAL_CHECK — Yearly check of beneficial-owner details

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1624, Art 63
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 6 —: “Annual check that the information is current (from 10 Jul 2027)”
- **Applies when:** yes
- **Passes when:** `attest.eu_ubo_annual_check` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2027-07-10 to no end date
- **Same obligation as other packs:** `eu_ubo_annual_check` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} checked its beneficial-owner details this year**
> We don't have your confirmation that you checked this year that the beneficial-owner details you filed are still right.
> *Why it matters:* From 10 July 2027, companies check every year that their beneficial-owner information is current.
> *If left:* Out-of-date details can be fined, and banks rely on them when they onboard you.
> *What to do:* Check the details on the register against your cap table, update any change, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.STATUS — Company status in ARES

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | ARES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 1 —: “Company active, not ceased”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Company found in ARES, active, in the public register, no active insolvency record”
- **Applies when:** yes
- **Passes when:** `registry.cz.ares.status` is “active”
- **A problem (defect) when:** all of: (`registry.cz.ares.identified` is yes) and (`registry.cz.ares.status` is “ceased”)
- **“To check” when:** all of: (`registry.cz.ares.identified` is yes) and (not (`registry.cz.ares.status` is one of “active”, “ceased”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ARES record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} shows as ceased in ARES**
> We read {company}'s record in ARES, the Czech register of economic subjects, and it shows the company as ceased.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* A company recorded as ceased can have trouble with its bank, its contracts and any fundraising.
> *What to do:* Check the record on ares.gov.cz and in the commercial register at or.justice.cz. If it is wrong, ask the registry court to correct it; if not, get advice today.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.PUBLIC_REGISTER — Entered in the commercial register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | ARES |

- **Law cited:** Act 304/2013 Sb., § 48
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 1 —: “Company registered in the commercial register”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Company found in ARES, active, in the public register, no active insolvency record”
- **Applies when:** yes
- **Passes when:** `registry.cz.ares.in_public_register` is yes
- **“To check” when:** `registry.cz.ares.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ARES record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company} is in the Czech commercial register**
> ARES does not show an active record for {company} in the public registers.
> *Why it matters:* Every company is entered in the commercial register, and banks, customers and investors rely on that entry.
> *If left:* Without a current entry, others may doubt the company can act and sign in its own name.
> *What to do:* Look the company up at or.justice.cz. If the entry is missing or out of date, ask the registry court to correct it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.INSOLVENCY_RECORD — No active record in the insolvency register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | ARES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 1 —: “No active insolvency record”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Company found in ARES, active, in the public register, no active insolvency record”
- **Applies when:** yes
- **Passes when:** `registry.cz.ares.insolvency_record_active` is no
- **“To check” when:** `registry.cz.ares.insolvency_record_active` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ARES record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **ARES shows an active insolvency register record for {company}**
> ARES shows {company} with an active record in the insolvency register. That is not by itself a finding that the company is insolvent.
> *Why it matters:* The insolvency register is public, and banks, investors and suppliers check it before they deal with a company.
> *If left:* An open matter there can hold up a bank account, a contract or a round until it is explained.
> *What to do:* Look up the matter in the insolvency register (insolvenční rejstřík), find out what it is about and where it stands, and get advice on it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.REGISTER_CURRENT — Changes filed with the commercial register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 304/2013 Sb., § 11
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 1 —: “Register entries kept current”
- **Applies when:** yes
- **Passes when:** `attest.cz_register_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s entry in the commercial register is up to date**
> We don't have your confirmation that every change, such as a new director, a new seat or new members, has been filed with the commercial register.
> *Why it matters:* Changes are filed without undue delay after they happen. After 15 days, anyone with a legal interest can file them instead.
> *If left:* Banks, customers and investors rely on the register, and an old entry can show people who no longer act for the company.
> *What to do:* Compare your entry at or.justice.cz with how the company is run today, file anything missing, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.REGISTERED_OFFICE — Registered office (sídlo) on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | ARES |

- **Law cited:** Act 304/2013 Sb., § 25
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 1 —: “Registered office (sídlo)”
- **Applies when:** yes
- **Passes when:** `registry.cz.ares.region` is yes (or present)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ARES record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s registered office in ARES**
> We read {company}'s record in ARES and found no seat for the company.
> *Why it matters:* Every company has a registered office (sídlo), recorded in the commercial register, at an address where post reaches it.
> *If left:* Official letters and court papers go there, and banks check it matches.
> *What to do:* Check the seat in your entry at or.justice.cz, and file a correction with the registry court if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.REGISTER_EXTRACT — Commercial register extract (výpis z obchodního rejstříku)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), § 194
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 1 —: “Commercial-register extract (výpis)”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 4 —: “At least one jednatel”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Commercial-register extract showing at least one jednatel”
- **Applies when:** yes
- **Passes when:** `vault.cz_register_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Commercial register extract (výpis z obchodního rejstříku) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your commercial register extract on file**
> You haven't added your commercial register extract to your documents yet.
> *Why it matters:* ARES does not list directors, so the extract is how we see who runs the company. An s.r.o. is run by one or more jednatelé.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Download a current extract from or.justice.cz and add it here. Check it shows at least one director.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.FOUNDING_CONTRACT — Founding contract as a notarial deed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), § 8; Act 304/2013 Sb., § 66(a)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 2 —: “Founding contract filed in the sbírka listin”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Founding contract as a notarial deed, filed in the sbírka listin”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 10 —: “Updated founding contract and list of members”
- **Applies when:** yes
- **Passes when:** `vault.cz_founding_contract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Founding contract (společenská smlouva): notarial deed and full current text · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your founding contract on file**
> You haven't added your founding contract to your documents yet.
> *Why it matters:* A capital company is founded by a notarial deed. The deed and each change, with a full updated text, are filed in the collection of documents (sbírka listin).
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add the notarial deed of your founding contract and the latest full text filed in the sbírka listin. Filed copies can be downloaded from or.justice.cz.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.CONTRIBUTIONS — Members' contributions meet the founding contract

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), § 142
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 2 —: “Minimum contribution”
- **Applies when:** the answer to “What kind of company is it?” is one of “sro”
- **Passes when:** `attest.cz_contributions` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** minimum_contribution_czk = 1
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s members' contributions meet its founding contract**
> We don't have your confirmation that each member's contribution is at least what the founding contract sets.
> *Why it matters:* In an s.r.o. the minimum contribution is CZK 1, unless the founding contract sets more.
> *If left:* Investors check that the capital on the register matches what members actually put in.
> *What to do:* Check each contribution against the founding contract, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.MEMBERS_LIST — List of members (seznam společníků)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), § 139
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 2 —: “List of members (seznam společníků) kept”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “list of members kept”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 10 —: “Updated founding contract and list of members”
- **Applies when:** the answer to “What kind of company is it?” is one of “sro”
- **Passes when:** `vault.cz_members_list.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** List of members (seznam společníků) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your list of members on file**
> You haven't added your list of members to your documents yet.
> *Why it matters:* An s.r.o. keeps its own list of members and their shares. It should match the commercial register and every transfer.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Bring the list of members up to date with every transfer and new share, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.UBO — Beneficial owner registered (evidence skutečných majitelů)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 37/2021 Sb., §§ 8-9
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 2 —: “| Beneficial owner registered |”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Beneficial owner registered (Tier 4”
- **Applies when:** yes
- **Passes when:** `vault.cz_ubo_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Full extract from the register of beneficial owners (evidence skutečných majitelů) · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We don't have your beneficial-owner register extract on file**
> You haven't added your beneficial-owner register extract to your documents yet.
> *Why it matters:* Every company registers the people who ultimately own or control it, without undue delay. The register closed to the public on 17 December 2025, so we need your own extract.
> *If left:* An owner who is not registered gets no share of profit and cannot vote, and the company can be fined up to CZK 500,000.
> *What to do:* Download your full extract from esm.justice.cz and add it here. If the owner was never registered, register them there now.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.UBO_CURRENT — Beneficial-owner details updated after a change

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 37/2021 Sb., § 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 2 —: “Beneficial owner data kept current”
- **Applies when:** yes
- **Passes when:** `attest.cz_ubo_current` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s beneficial-owner details are up to date**
> We don't have your confirmation that the register of beneficial owners was updated after the last change in who owns or controls the company.
> *Why it matters:* A change in beneficial owners is registered without undue delay, and the new extract replaces the old one.
> *If left:* An owner left off the register loses profit shares and votes, and the company can be fined.
> *What to do:* After each change, update the register, add the new extract here, and confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.ANNUAL_MEETING — General meeting reviews the accounts within 6 months

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), § 181
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 3 —: “Annual general meeting approves the accounts”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “general meeting within 6 months and accounts filed”
- **Applies when:** the answer to “What kind of company is it?” is one of “sro”
- **Passes when:** any of: (`vault.cz_agm_minutes.present` is yes) or (`attest.cz_accounts_approved` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":6} (reminder only)
- **Evidence:** Minutes of the general meeting; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see that {company}'s general meeting reviewed last year's accounts**
> You haven't added the minutes, or confirmed that the general meeting reviewed the accounts within 6 months of the year end.
> *Why it matters:* An s.r.o. holds a general meeting at least once each accounting period, and it reviews the regular accounts within 6 months of the year end.
> *If left:* Accounts that were never approved hold up the filing, and investors and banks ask for the minutes.
> *What to do:* Hold the meeting, keep the minutes, and add them here or confirm it took place.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.ACCOUNTS_FILING — Annual accounts filed in the collection of documents (sbírka listin)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 563/1991 Sb., § 21a; Act 304/2013 Sb., § 66(c)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 3 —: “Annual accounts filed in the sbírka listin”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “general meeting within 6 months and accounts filed”
- **Applies when:** yes
- **Passes when:** `vault.cz_accounts_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Annual accounts (účetní závěrka), with proof of filing in the sbírka listin · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We don't have your filed annual accounts on file**
> You haven't added your filed annual accounts to your documents yet.
> *Why it matters:* Companies in the commercial register publish their accounts by filing them in the collection of documents. ARES does not show the filing, so we need your copy.
> *If left:* If two years in a row go unfiled, the court orders the filing, and a company that still does not file can be dissolved.
> *What to do:* File the approved accounts in the sbírka listin through the registry court, and add them here with the proof of filing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.DIRECTOR_VACANCY — A vacant director post filled within a month

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), § 198(1)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 4 —: “Vacant jednatel replaced within 1 month”
- **Applies when:** the answer to “What kind of company is it?” is one of “sro”
- **Passes when:** `attest.cz_director_vacancy` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_to_replace = 1
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} fills a vacant director post in time**
> We don't have your confirmation that, whenever a director (jednatel) left with no successor, the general meeting elected a new one within a month.
> *Why it matters:* If a director's office ends without a successor, the general meeting elects a new one within 1 month.
> *If left:* Without a director, nobody can sign for the company, and banks and courts will notice.
> *What to do:* If a post is empty, hold the general meeting and elect a new director, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.DIRECTORS_ELIGIBLE — Directors free to serve

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), § 46
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 4 —: “Directors not disqualified”
- **Applies when:** yes
- **Passes when:** `attest.cz_directors_eligible` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s directors are free to serve**
> We don't have your confirmation that none of the company's directors is barred from office, for example by a disqualification order.
> *Why it matters:* Czech company law sets out who cannot serve as a director, such as a person disqualified by a court.
> *If left:* A director who is barred can put the company's decisions in doubt.
> *What to do:* Check each director against the rules on who may serve, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CORP.DIRECTOR_DECISIONS — Director appointment decisions filed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 304/2013 Sb., § 66(b)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 4 —: “Director appointment decisions filed”
- **Applies when:** yes
- **Passes when:** `vault.cz_director_decisions.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Decisions appointing and removing directors, as filed in the sbírka listin · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your filed director appointment decisions on file**
> You haven't added your filed director appointment decisions to your documents yet.
> *Why it matters:* Each decision that appoints or removes a director goes into the collection of documents of the commercial register.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add the decisions that appointed your current directors, and check each one is filed in the sbírka listin.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (4)

### CZ.IP.EMPLOYEE_WORKS — Employees' work made within their duties

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 121/2000 Sb., § 58(1)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 5 —: “Employee works: employer exercises the rights”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.cz_employee_works` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s staff create their work as part of their job**
> We don't have your confirmation that the code, designs and other work your employees create is made within their duties, so the company can use it.
> *Why it matters:* The employer exercises the economic rights to work an employee creates within their duties, in its own name, unless agreed otherwise. The employee keeps the moral rights.
> *If left:* Work made outside the job, or under a contract that says otherwise, may not be the company's to use, and investors check this.
> *What to do:* Check your employment contracts and job descriptions cover the work people do, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.IP.CONTRACTOR_WORKS — Rights to work made by contractors

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Act 121/2000 Sb., § 58(7), § 61
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 5 —: “Commissioned software treated as employee work”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 5 —: “Other commissioned works: licence only”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “contractors' IP position”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** any of: (`vault.cz_contractor_ip.present` is yes) or (`attest.cz_contractor_ip` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all contractors?”
- **Evidence:** Contractor agreements; Your confirmation · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see that {company} has the rights to what its contractors made**
> You haven't added your contractor agreements, or confirmed they give the company the work it paid for.
> *Why it matters:* Software and databases made to order are treated as employee work, so the company exercises the rights. For designs, text and other work, the author is presumed to grant a licence only for the purpose of the contract.
> *If left:* Without a written assignment or a broad licence, the company may not be free to reuse or sell that work, and investors check this.
> *What to do:* Add a written assignment or broad licence to each contractor agreement, and add the agreements here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.IP.EMPLOYEE_INVENTIONS — Employee inventions reported and claimed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | ip_ownership | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Act 527/1990 Sb., § 9
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 5 —: “Employee inventions: notice and 3-month claim”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.cz_employee_inventions` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** claim_months = 3
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company} has a process for employee inventions**
> We don't have your confirmation that employees report inventions in writing and that the company claims them in time.
> *Why it matters:* The right to a patent for an employee's invention passes to the employer unless agreed otherwise. The employee reports it in writing, and if the employer does not claim it within 3 months the right goes back. The employee is owed reasonable pay for it.
> *If left:* An invention the company failed to claim in time can stay with the employee.
> *What to do:* Set up a simple written invention report and a claim step within 3 months, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.IP.TRADEMARK — Trade mark (Czech or EU)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | ÚPV |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 5 —: “| Czech trade mark |”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Brand protected by an EU trade mark or a national mark in each operating market”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Renewal every 10 years from filing”
- **Applies when:** yes
- **Passes when:** `vault.cz_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.cz_trademark.dated","years":10} (reminder only)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a trade mark for {company}**
> You haven't added a Czech or EU trade mark certificate, and we can't look marks up at the Industrial Property Office (ÚPV) yet.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand at the ÚPV, or as an EU trade mark, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (19)

### CZ.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent before non-essential cookies”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.privacy_notice_found` is yes
- **“To check” when:** all of: (`web.policy.privacy_notice_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_privacy_notice` (counted once per company)
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a privacy notice on {company}'s website**
> We looked at your website and couldn't find a privacy notice.
> *Why it matters:* People have to be told who you are, what data you use and why, who gets it, how long you keep it, and what their rights are.
> *If left:* It's public, so customers, partners and the data protection authority can all see the gap.
> *What to do:* Publish a notice with those details and link it from every page. If you have one, check it is linked from your footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 6 —: “Supervisory authority named in the notice”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to the ÚOOÚ.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming the ÚOOÚ and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 21(4)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Right to object shown explicitly”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.eu_right_to_object` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_right_to_object` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} tells people they can object**
> We don't have your confirmation that people are told, clearly and apart from other information, that they can object.
> *Why it matters:* If you rely on legitimate interests or send direct marketing, people can object, and they must be told so plainly.
> *If left:* People who never saw the choice can complain, and marketing sent after an objection is a breach.
> *What to do:* Show the right to object clearly in your notice and in your marketing, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 8(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Age of digital consent for online services to children”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 6 —: “Child's consent age 15”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Are any of your users under 18?” is yes)
- **Passes when:** `attest.eu_child_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** age_of_digital_consent = 15
- **Same obligation as other packs:** `eu_child_consent` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} gets consent for children**
> We don't have your confirmation of how you handle consent from children who use your service.
> *Why it matters:* Below 15, consent for an online service has to come from a parent as well, where you rely on consent.
> *If left:* Data collected without valid consent has no legal basis, and children's data is watched closely.
> *What to do:* Set up an age check and a parent consent step where you need one, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.cz_ropa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_ropa` (counted once per company)
- **Evidence:** Records of processing activities · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your records of processing on file**
> You haven't added your records of processing to your documents yet.
> *Why it matters:* It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write down each kind of personal data you use, why, who gets it and how long you keep it, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.cz_dpa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_processing_agreements` (counted once per company)
- **Evidence:** Data processing agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data processing agreements on file**
> You haven't added your data processing agreements to your documents yet.
> *Why it matters:* Each vendor that handles personal data for you needs a written agreement saying what it may do with it.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Collect the data processing terms from each vendor that handles personal data for you, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 25
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Data protection by design and by default”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.eu_privacy_by_design` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_by_design` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} builds privacy into its product**
> We don't have your confirmation that your product collects only what it needs and starts from the most private settings.
> *Why it matters:* Privacy has to be part of how the product is built, not added afterwards.
> *If left:* It is hard to show after the fact, and it comes up whenever something goes wrong.
> *What to do:* Check your product collects the least data it needs, with private defaults, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 37
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPO designated where required”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 6 —: “| DPO designation |”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.sensitive_data` is yes)
- **Passes when:** `attest.eu_dpo` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_dpo` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed whether {company} needs a data protection officer**
> You told us you handle sensitive data, and we don't have your confirmation that you checked whether you need a data protection officer.
> *Why it matters:* Companies whose core work is monitoring people at scale, or handling sensitive data at scale, must name one and publish the contact.
> *If left:* If you need one and haven't named one, the ÚOOÚ can act on it.
> *What to do:* Check whether the tests apply to you. If they do, name your officer, publish the contact, tell the ÚOOÚ, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 6 —: “Breach notified to ÚOOÚ”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.cz_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to the ÚOOÚ within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.cz_transfers.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_transfers` (counted once per company)
- **Evidence:** Data transfer safeguards (standard contractual clauses or similar) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your safeguards for data leaving the EEA on file**
> You haven't added your safeguards for data leaving the EEA to your documents yet.
> *Why it matters:* Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Put standard contractual clauses or another approved safeguard in place with each recipient outside the EEA, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent before non-essential cookies”
- **Applies when:** `derived.has_website` is yes
- **Passes when:** `derived.web.trackers_before_consent` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_cookie_consent` (counted once per company)
- **Evidence:** What your site set before anyone agreed · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s website sets cookies before anyone has agreed**
> We loaded your site and it set non-essential cookies or loaded trackers before anyone agreed.
> *Why it matters:* Cookies and trackers that are not strictly needed have to wait until the person agrees.
> *If left:* Anyone can see this from outside, and it is one of the first things a data protection authority checks.
> *What to do:* Set up your consent banner to hold those tags back until someone agrees.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
- **Applies when:** `derived.has_website` is yes
- **Passes when:** `web.policy.cookie_policy_found` is yes
- **“To check” when:** all of: (`web.policy.cookie_policy_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_cookie_policy` (counted once per company)
- **Evidence:** Your published cookie policy · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find cookie information on {company}'s website**
> We couldn't find a cookie policy on your website.
> *Why it matters:* People must get clear information on what each cookie is for and who sets it.
> *If left:* It's public, so it's one of the first things someone checks.
> *What to do:* Publish a cookie policy and link it from your footer and your consent banner.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.TAX.VAT_VIES — VAT number valid for EU trade

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | VIES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 5 —: “VAT number valid in VIES”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 7 —: “VAT payer once turnover exceeds CZK 2m”
- **Applies when:** yes
- **Passes when:** `registry.eu.vies_vat.valid` is yes
- **“To check” when:** `registry.eu.vies_vat.valid` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_vat_vies` (counted once per company)
- **Abroad:** never follows the company into another country
- **Evidence:** VIES check of your VAT number · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **VIES doesn't show {company}'s VAT number as valid**
> We checked your VAT number with VIES, the EU VAT number service, and it did not come back as valid for EU trade today.
> *Why it matters:* Customers and suppliers in other EU countries check this number before they invoice you without VAT.
> *If left:* Business customers may refuse to deal with you without VAT, or ask for your registration papers.
> *What to do:* Check the number in your answers. If it is right, ask your tax office to switch it on for EU trade.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.DP.EU_REPRESENTATIVE — EU representative for a company outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Arts 3(2), 13(1)(a), 27
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “EU representative appointed”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.eu_established` is no) and (the answer to “Do you offer goods or services to people in the EU, or track how they use your website or app?” is yes)
- **Passes when:** any of: (`web.policy.eu_representative_named` is yes) or (`attest.eu_gdpr_representative` is yes)
- **“To check” when:** all of: (`web.policy.eu_representative_named` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_eu_representative` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s EU representative**
> You told us you offer services to people in the EU without an office there, and we couldn't find an EU representative named in your privacy notice or legal pages. You haven't confirmed you have one.
> *Why it matters:* A company outside the EU that offers goods or services to people in the EU, or tracks their behaviour there, must name a representative in an EU country in writing, and give its contact details in the privacy notice. Occasional, low-risk processing is exempt.
> *If left:* EU data protection authorities and people in the EU have nobody to contact, and authorities can act on it.
> *What to do:* Appoint an EU representative in a country where your users are, add its name and contact details to your privacy notice, then confirm here. If the exemption applies, confirm that instead.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.TAX.REGISTRATION — Registered with the tax office (DIČ) — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S2 incorporated, pre-revenue | ARES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 7 —: “Registered with the tax office (DIČ)”
- **Applies when:** yes
- **Passes when:** `registry.cz.ares.vat_number_present` is yes
- **“To check” when:** `registry.cz.ares.vat_number_present` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** ARES record · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see a tax number (DIČ) for {company} in ARES**
> ARES shows no DIČ, the tax identification number, for {company}.
> *Why it matters:* A company registers with its tax office, which gives it a tax number (DIČ).
> *If left:* Without it, tax returns and business invoicing run into trouble.
> *What to do:* Check with your tax office (finanční úřad) that the company is registered, and keep the registration letter.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.TAX.VAT_PAYER — VAT payer once turnover passes CZK 2 million

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | ARES |

- **Law cited:** Act 235/2004 Sb., § 6
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 7 —: “VAT payer once turnover exceeds CZK 2m”
- **Applies when:** yes
- **Passes when:** any of: (`registry.cz.ares.vat_payer` is yes) or (`attest.cz_vat_below_threshold` is yes)
- **“To check” when:** `registry.cz.ares.vat_payer` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** threshold_czk = 2000000; current_year_limit_czk = 2536500
- **Abroad:** never follows the company into another country
- **Evidence:** ARES record; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company} as a VAT payer**
> ARES doesn't show {company} as a VAT payer, and you haven't confirmed your turnover is below the threshold.
> *Why it matters:* A company becomes a VAT payer from 1 January after a calendar year with Czech turnover over CZK 2,000,000, or from the day after its turnover in the current year passes CZK 2,536,500.
> *If left:* Becoming a VAT payer late can mean paying VAT you never charged your customers.
> *What to do:* If you are a VAT payer, check your registration. If your turnover is below the threshold, confirm that here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.EMP.CSSZ_EMPLOYER — Employer registration with the ČSSZ

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | ČSSZ |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 7 —: “Employer registered with ČSSZ before the first employee starts”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.cz_cssz_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** ČSSZ employer registration confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your ČSSZ employer registration on file**
> You haven't added your ČSSZ employer registration to your documents yet.
> *Why it matters:* An employer registers with the Czech Social Security Administration (ČSSZ) before its first employee starts. Since 1 July 2026 this is done online, at least 2 working days before.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Register through the ČSSZ e-podání service before the first employee starts, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.EMP.EMPLOYEE_REGISTRATION — Each employee registered before starting

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | ČSSZ |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 7 —: “Each employee registered before starting”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.cz_employees_registered` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} registers each employee before they start**
> We don't have your confirmation that each employee was registered with the ČSSZ before their first day.
> *Why it matters:* Since 1 July 2026 every employee is registered before work starts, no earlier than 8 days before, and the registration is completed within 8 days of the start.
> *If left:* An employee who starts unregistered is a gap a ČSSZ inspection will find.
> *What to do:* Register each new hire with the ČSSZ before they start, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.EMP.HEALTH_INSURANCE — Registered with employees' health insurers — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 7 —: “Employer registered with health insurers”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.cz_health_insurers` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} is registered with its employees' health insurers**
> We don't have your confirmation that the company is registered as an employer with each health insurance company its employees use.
> *Why it matters:* Employers register with their employees' health insurers and pay health insurance for them.
> *If left:* Missing registrations come up in insurer checks, and unpaid insurance builds up.
> *What to do:* Register with each employee's health insurer, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (16)

### CZ.COM.WEBSITE_IDENTITY — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Trade register and registration number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “VAT number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, 5. The core set: “Name and seat shown on the website”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** any of: (all of: (`web.policy.legal_notice_present` is yes) and (`web.policy.registration_number_shown` is yes)) or (`attest.eu_website_identity` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_website_identity` (counted once per company)
- **Evidence:** Your website legal notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see who runs {company} on its website**
> We don't have your confirmation that your website shows the company's name, address, email, register and company number, and VAT number if you have one. We couldn't find a legal notice with your company number on your site.
> *Why it matters:* Anyone using an online service must be able to find out, easily, who runs it.
> *If left:* Customers and partners look for it, and missing details can be fined in most EU countries.
> *What to do:* Add a legal notice page with those details, link it from every page, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.COM.REGULATOR_NAMED — Your licensing authority, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | website_information | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)(e)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Supervisory authority named”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (any of: (`derived.sector.payments` is yes) or (`derived.sector.lending` is yes) or (`derived.sector.crypto` is yes) or (`derived.sector.banking` is yes) or (`derived.sector.insurtech` is yes) or (`derived.sector.securities` is yes))
- **Passes when:** `attest.eu_regulator_named` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_regulator_named` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s website names the authority that licenses it**
> You told us you are in a regulated sector, and we don't have your confirmation that your website names the authority that supervises you.
> *Why it matters:* Where an activity needs a licence, the website has to say which authority supervises it.
> *If left:* Customers and partners check this before they trust you with money or data.
> *What to do:* Name your supervising authority and your licence on your legal notice page, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.PRICES — Clear prices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2000/31/EC, Art 5(2)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Prices clear, with tax and delivery stated”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.consumer` is yes)
- **Passes when:** `attest.eu_prices_clear` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_prices` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s prices are shown in full**
> We don't have your confirmation that your prices say clearly whether tax and delivery are included.
> *Why it matters:* Prices shown to consumers online have to be clear, including tax and any delivery costs.
> *If left:* Unclear prices lead to complaints and refunds, and consumer authorities act on them.
> *What to do:* Show the full price with tax, and any extra costs, before people buy. Then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | marketing | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2000/31/EC, Art 6
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Commercial communications identifiable as such”
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 6 —: “Marketing e-mail: opt-out for own customers”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (the answer to “How do people sign up?” is one of “opt_in”, “opt_out”)
- **Passes when:** `attest.eu_ads_identifiable` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_ads_identifiable` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s marketing is clearly marked**
> We don't have your confirmation that your marketing messages are clearly marked as marketing, and say who sends them.
> *Why it matters:* People must be able to tell an advert or offer from other content, and see who it comes from.
> *If left:* Hidden marketing is a consumer law breach and damages trust.
> *What to do:* Mark offers and adverts as such, with your company name, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2000/31/EC, Art 10(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Ordering steps, error correction and contract languages shown before an order”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes)
- **Passes when:** `attest.eu_ordering_steps` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_ordering_steps` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} explains how ordering works**
> We don't have your confirmation that your site explains the steps to order, how to fix a mistake, and which languages the contract comes in.
> *Why it matters:* Before an online order, people must be told the steps, how to correct errors, and the contract languages.
> *If left:* Mistaken orders are harder to resolve, and the information is a legal duty.
> *What to do:* Add this to your checkout or terms, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 6(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Consumer terms with the pre-contract information”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `attest.eu_consumer_info` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_consumer_info` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s consumer terms give the required information**
> We don't have your confirmation that consumers see who you are, the total price, and their right to withdraw, before they buy.
> *Why it matters:* Consumers buying at a distance must get a set list of information first.
> *If left:* Missing information can extend the withdrawal period and put the burden on you in a dispute.
> *What to do:* Check your consumer terms and checkout against the list, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.ORDER_BUTTON — Order button wording

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 8(2)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Order button says "order with obligation to pay"”
- **Applies when:** all of: (`derived.consumer` is yes) and (all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes))
- **Passes when:** `attest.eu_order_button` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_order_button` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s order button says it means paying**
> We don't have your confirmation that the button that places an order says plainly that it means paying.
> *Why it matters:* The final button must say the order comes with an obligation to pay, or words that mean the same.
> *If left:* If it does not, the consumer is not bound by the order.
> *What to do:* Label the button with words like "Order and pay", then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** any of: (`web.policy.refund_policy_found` is yes) or (`attest.eu_withdrawal_info` is yes)
- **“To check” when:** all of: (`web.policy.refund_policy_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_withdrawal` (counted once per company)
- **Evidence:** Your published refund or cancellation page; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see where {company} explains the right to withdraw**
> We couldn't find a refund or cancellation page on your website, and you haven't confirmed how consumers are told about withdrawal.
> *Why it matters:* Consumers buying online can usually withdraw within 14 days, and must be told how.
> *If left:* If they are not told, the withdrawal period can run on for up to a year.
> *What to do:* Publish your withdrawal and refund terms and link them from checkout, or confirm here how you tell people.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 16(m)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Digital content: consent and acknowledgement before immediate supply”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.has_website_or_app` is yes)
- **Passes when:** `attest.eu_digital_content_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_digital_content` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} asks before starting a digital service at once**
> We don't have your confirmation that consumers agree, and confirm they understand they lose the right to withdraw, before you supply digital content or a service straight away.
> *Why it matters:* Without that consent and confirmation, a consumer keeps the right to withdraw after using what you supplied.
> *If left:* Consumers can ask for their money back after using the product.
> *What to do:* Add a tick box and a confirmation step before access starts, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.WITHDRAWAL_FUNCTION — Online withdrawal button

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive (EU) 2023/2673, Art 11a of Directive 2011/83/EU
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Online withdrawal function ("withdraw from contract here"), from 19 Jun 2026”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.has_website_or_app` is yes)
- **Passes when:** `attest.eu_withdrawal_function` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-06-19 to no end date
- **Same obligation as other packs:** `eu_withdrawal_function` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has an online withdrawal button**
> We don't have your confirmation that consumers who signed up online can withdraw online, with a clear button and a confirmation step.
> *Why it matters:* Since 19 June 2026, contracts made online need a clear way to withdraw online, with an acknowledgement sent to the consumer.
> *If left:* Consumer authorities can act on it, and consumers can complain that withdrawing was made hard.
> *What to do:* Add a clearly labelled withdrawal button with a confirm step and an emailed acknowledgement, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.COMPLAINTS — How consumers can complain

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Complaints route for consumers”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** any of: (`web.policy.complaints_policy_found` is yes) or (`attest.eu_consumer_complaints` is yes)
- **“To check” when:** all of: (`web.policy.complaints_policy_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_consumer_complaints` (counted once per company)
- **Evidence:** Your published complaints page; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see how consumers can complain to {company}**
> We couldn't find a complaints page on your website, and you haven't confirmed how consumers can complain.
> *Why it matters:* Consumers should be able to find out how to complain, and who can help if you disagree.
> *If left:* Complaints with nowhere to go end up with consumer authorities.
> *What to do:* Publish how to complain and link it from your footer, or confirm here how you tell people.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.CONSUMER.ACCESSIBILITY — Accessibility statement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | accessibility | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive (EU) 2019/882
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 8 —: “Accessible e-commerce service and accessibility information (from 28 Jun 2025)”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 8 —: “Microenterprise exemption for services”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.has_website_or_app` is yes) and (any of: (the answer to “People on the team” is one of “11_50”, “51_100”, “over_100”) or (the answer to “Annual revenue, roughly” is “over_26m”))
- **Passes when:** any of: (`web.policy.accessibility_found` is yes) or (`attest.eu_accessibility` is yes)
- **“To check” when:** all of: (`web.policy.accessibility_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2025-06-28 to no end date
- **Same obligation as other packs:** `eu_accessibility` (counted once per company)
- **Evidence:** Your published accessibility statement; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find an accessibility statement on {company}'s website**
> We couldn't find an accessibility statement on your website, and you haven't confirmed your service meets the accessibility rules.
> *Why it matters:* Since 28 June 2025, online shops and similar services for consumers must be accessible and say how. Very small businesses are exempt.
> *If left:* Consumer authorities can act on it, and people who can't use your service go elsewhere.
> *What to do:* Publish an accessibility statement and fix the main barriers, or confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.COM.DSA_CONTACT — Contact point and content rules for your platform

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | platform | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2022/2065, Arts 11, 12, 14
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 12 —: “Digital Services Act: point of contact for authorities and users; clear terms on content restrictions”
- **Applies when:** `derived.sector.platform` is yes
- **Passes when:** `attest.eu_dsa_contact` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_dsa_contact` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s platform has a contact point and content rules**
> We don't have your confirmation that your platform names a contact point for authorities and users, and says in its terms what content you restrict and how.
> *Why it matters:* Services that host content for users must have a published contact point and clear rules on content.
> *If left:* The authority that supervises platforms can act on it, and users have nowhere to report illegal content.
> *What to do:* Publish a contact point and your content rules, link them from your terms, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.COM.DSA_REPRESENTATIVE — EU legal representative for a platform outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | platform | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2022/2065, Art 13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 12 —: “DSA legal representative in the EU”
- **Applies when:** all of: (`derived.sector.platform` is yes) and (`derived.eu_established` is no) and (the answer to “Do you offer goods or services to people in the EU, or track how they use your website or app?” is yes)
- **Passes when:** any of: (`web.policy.dsa_legal_representative_named` is yes) or (`attest.eu_dsa_representative` is yes)
- **“To check” when:** all of: (`web.policy.dsa_legal_representative_named` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_dsa_representative` (counted once per company)
- **Abroad:** follows the company into a country where it has users
- **Evidence:** Your published legal or Digital Services Act page; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s legal representative under the Digital Services Act**
> You told us you offer an online service with user content in the EU without an office there, and we couldn't find a legal representative under the Digital Services Act on your website. You haven't confirmed you have one.
> *Why it matters:* A service that hosts users' content, with no establishment in the EU but offering its service there, must name a legal representative in an EU country, tell that country's Digital Services Coordinator, and keep the representative's contact details public.
> *If left:* The representative can be held liable, and the authority can act against a service that has none.
> *What to do:* Appoint a legal representative in an EU country where you offer the service, notify the Digital Services Coordinator there, publish the details on your website, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.COM.DSA_POINTS_OF_CONTACT — Published points of contact under the Digital Services Act

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | platform | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2022/2065, Arts 11, 12
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 12 —: “DSA single points of contact for authorities (art 11) and for users (art 12), made public”
- **Applies when:** `derived.sector.platform` is yes
- **Passes when:** any of: (`web.policy.dsa_contact_point_named` is yes) or (`attest.eu_dsa_points_of_contact` is yes)
- **“To check” when:** all of: (`web.policy.dsa_contact_point_named` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_dsa_points_of_contact` (counted once per company)
- **Abroad:** follows the company into a country where it has users
- **Evidence:** Your published legal or Digital Services Act page; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s points of contact under the Digital Services Act**
> We couldn't find a single point of contact for authorities or for users on your website, and you haven't confirmed you publish one.
> *Why it matters:* Online services that host or pass on content must name a single point of contact for authorities and one for their users, and make the details public, with the languages they can be reached in.
> *If left:* Authorities and users have no clear way to reach you, and the authority that supervises platforms can act on it.
> *What to do:* Publish your points of contact (an email address or form, and the languages you answer in) on a legal or Digital Services Act page linked from your footer, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.COM.MARKETING_EMAIL — Marketing e-mails with a free way to refuse

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | marketing | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Act 480/2004 Sb., § 7
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 6 —: “Marketing e-mail: opt-out for own customers”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.sends_marketing` is yes)
- **Passes when:** `attest.cz_marketing_email_refusal` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s marketing e-mails offer a free way out**
> We don't have your confirmation that customers can refuse marketing e-mails simply and free, when you collect their address and in every message.
> *Why it matters:* You may e-mail your own customers about similar products of your own only if they can refuse simply and free, at collection and in every message.
> *If left:* Marketing sent without that choice breaks the rule, and people who get it can complain.
> *What to do:* Add a clear unsubscribe link to every message and a refusal option where you collect addresses, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (3)

### CZ.FUND.PROSPECTUS_EXEMPTION — Share offers within a no-prospectus exemption

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** Regulation (EU) 2017/1129, Art 1(4)(a)-(b)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 10 —: “Offer only to qualified investors: no prospectus”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 10 —: “Offer to fewer than 150 non-qualified investors per member state: no prospectus”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.eu_prospectus_exempt` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_prospectus` (counted once per company)
- **Evidence:** Your confirmation, with your investor list · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s share offers need no prospectus**
> We don't have your confirmation that each offer of shares went only to professional investors, or to fewer than 150 other people in each EU country.
> *Why it matters:* An offer of shares to the public needs an approved prospectus, unless an exemption applies.
> *If left:* An offer made without one can be stopped, and investors can ask for their money back.
> *What to do:* Keep a list of who each offer went to, check it fits an exemption, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.FUND.CAPITAL_INCREASE — General meeting resolution on each capital increase — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), §§ 171-172, 216
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 10 —: “Capital increase resolved by the general meeting”
- **Applies when:** all of: (`derived.invested` is yes) and (the answer to “What kind of company is it?” is one of “sro”)
- **Passes when:** `vault.cz_capital_increase.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Notarial record of the general meeting resolution on each capital increase · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your capital increase resolutions on file**
> You haven't added your capital increase resolutions to your documents yet.
> *Why it matters:* A capital increase is decided by the general meeting, and because it changes the founding contract, the resolution is recorded by a notary.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the notarial record of the general meeting resolution behind each capital increase.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.FUND.CAPITAL_INCREASE_FILED — Capital increase entered in the commercial register — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** Act 90/2012 Sb. (ZOK), § 218
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 10 —: “Increase filed with the register within 2 months”
- **Applies when:** all of: (`derived.invested` is yes) and (the answer to “What kind of company is it?” is one of “sro”)
- **Passes when:** `vault.cz_capital_increase_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Commercial register extract showing the increased capital · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your register extract after the capital increase on file**
> You haven't added your register extract after the capital increase to your documents yet.
> *Why it matters:* A capital increase is filed with the commercial register soon after the resolution. If it is not filed in time, the resolution can lapse.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* File the increase with the registry court, then download the new extract from or.justice.cz and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (9)

### CZ.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | the ÚOOÚ |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.cz_dpia.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_dpia` (counted once per company)
- **Evidence:** Data protection impact assessment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data protection impact assessment on file**
> You haven't added your data protection impact assessment to your documents yet.
> *Why it matters:* Profiling, AI, sensitive data and monitoring people call for a written assessment before you start.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Write the assessment for each high-risk use: what you do, the risks to people, and how you reduce them. Add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | the ÚOOÚ |

- **Law cited:** GDPR, Art 22(1), Art 13(2)(f)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Automated decisions: safeguards and notice”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.personal_data` is yes) and (the answer to “For example, approving credit or rejecting a job applicant” is yes)
- **Passes when:** `attest.eu_automated_decisions` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_automated_decisions` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s safeguards for automated decisions**
> You told us software makes big decisions about people by itself, and we have no confirmation of your safeguards.
> *Why it matters:* People must be told about these decisions, and be able to ask a person to look again and to challenge the result.
> *If left:* A decision made without those safeguards can be challenged, and the authority can stop the processing.
> *What to do:* Tell people in your notice, offer a human review, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.AI.ROLES — AI systems list with your role for each

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “Role identified: provider, deployer, importer or distributor of each AI system”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.cz_ai_inventory.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_ai_roles` (counted once per company)
- **Evidence:** List of AI systems, with your role for each · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your list of AI systems on file**
> You haven't added your list of AI systems to your documents yet.
> *Why it matters:* What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* List each AI system you build or use, say whether you provide it, use it, import it or sell it on, and add the list here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.AI.PROHIBITED_PRACTICES — No banned AI practices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 5
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “No prohibited AI practices (since 2 Feb 2025)”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “AI literacy measures and no prohibited practices”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `attest.eu_no_prohibited_ai` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2025-02-02 to no end date
- **Same obligation as other packs:** `eu_ai_prohibited` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} uses no banned AI practices**
> We don't have your confirmation that none of your AI does anything the EU AI Act bans.
> *Why it matters:* Since 2 February 2025, some uses of AI are banned outright, such as manipulating people, social scoring and some uses of facial recognition and emotion recognition.
> *If left:* These carry the highest fines in the AI Act.
> *What to do:* Check each AI system against the banned list, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.AI.PROHIBITED_GENERATIVE — No AI that makes abusive images of real people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2026/1744, Art 5(1)(ba)-(bb) of Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “New prohibitions: AI that generates non-consensual intimate imagery”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (the answer to “What for?” includes “generative”)
- **Passes when:** `attest.eu_no_prohibited_generative_ai` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-12-02 to no end date
- **Same obligation as other packs:** `eu_ai_prohibited_generative` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s AI can't make banned images**
> You told us your AI generates content, and we don't have your confirmation it can't make intimate images of real people without consent, or child abuse material.
> *Why it matters:* From 2 December 2026, AI systems that generate this content are banned in the EU.
> *If left:* These carry the highest fines in the AI Act.
> *What to do:* Check your safeguards block this content, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.AI.LITERACY — AI literacy for your team

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2026/1744, Art 4 of Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “AI literacy measures for staff and others operating AI for the company”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “AI literacy measures and no prohibited practices”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `attest.eu_ai_literacy` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_ai_literacy` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} trains its team on AI**
> We don't have your confirmation that you take steps to help the people who build or run your AI understand it.
> *Why it matters:* Companies that build or use AI must take measures to support AI literacy among the people who operate it for them.
> *If left:* It is one of the first things a customer or authority asks about your AI.
> *What to do:* Give your team short training on how your AI works and its limits, keep a record, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.AI.HIGH_RISK — High-risk AI documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Chapter III, as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI (Annex III uses: employment, credit scoring, education”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (any of: (the answer to “What for?” includes “hiring”) or (the answer to “What for?” includes “credit”) or (the answer to “What for?” includes “education”) or (the answer to “What for?” includes “insurance”) or (the answer to “What for?” includes “biometrics”))
- **Passes when:** `vault.cz_ai_high_risk.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2027-12-02 to no end date
- **Same obligation as other packs:** `eu_ai_high_risk` (counted once per company)
- **Evidence:** High-risk AI documentation (risk management, technical file, conformity, registration) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your high-risk AI documentation on file**
> You haven't added your high-risk AI documentation to your documents yet.
> *Why it matters:* AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Build the risk management file, technical documentation and conformity declaration for each high-risk system, register it, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.AI.HIGH_RISK_PRODUCTS — High-risk AI in regulated products

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 6(1), as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.sector.healthtech` is yes)
- **Passes when:** `vault.cz_ai_annex_i.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2028-08-02 to no end date
- **Same obligation as other packs:** `eu_ai_annex_i` (counted once per company)
- **Evidence:** AI documentation for regulated products (such as medical devices) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your documentation for AI in regulated products on file**
> You haven't added your documentation for AI in regulated products to your documents yet.
> *Why it matters:* AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add the AI to your product file: risk management, technical documentation and conformity, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CZ.AI.TRANSPARENCY — AI use disclosed to users

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-czechia-rule-pack-map.md`, Section 11 —: “AI transparency notice on the site”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.cz_ai_transparency.present` is yes)
- **“To check” when:** `web.policy.ai_disclosure_found` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_transparency` (counted once per company)
- **Evidence:** Published AI disclosures; Transparency records · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see where {company} tells people it uses AI**
> We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.
> *Why it matters:* People must be told when they are dealing with an AI system, and AI-made content has to be marked.
> *If left:* Enterprise customers and investors are starting to ask, and you would have no answer ready.
> *What to do:* Say on your website where your product uses AI, or add your transparency records here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (21)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `cz_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | CZ.DP.ROPA |
| `cz_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | CZ.DP.PROCESSING_AGREEMENTS |
| `cz_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | CZ.AI.DPIA |
| `cz_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to the ÚOOÚ within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | CZ.DP.BREACH |
| `cz_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | CZ.DP.TRANSFERS |
| `cz_ai_inventory` | List of AI systems, with your role for each | What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system. | tier 5 | no | CZ.AI.ROLES |
| `cz_ai_high_risk` | High-risk AI documentation (risk management, technical file, conformity, registration) | AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration. | tier 5 | no | CZ.AI.HIGH_RISK |
| `cz_ai_annex_i` | AI documentation for regulated products (such as medical devices) | AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval. | tier 5 | no | CZ.AI.HIGH_RISK_PRODUCTS |
| `cz_register_extract` | Commercial register extract (výpis z obchodního rejstříku) | ARES does not list who runs the company. The extract shows your directors and what the register holds, and banks and investors ask for it. | tier 4 | no | CZ.CORP.REGISTER_EXTRACT |
| `cz_founding_contract` | Founding contract (společenská smlouva): notarial deed and full current text | A capital company is founded by a notarial deed. The deed and each change, with a full updated text, are filed in the collection of documents (sbírka listin). | tier 4 | no | CZ.CORP.FOUNDING_CONTRACT |
| `cz_members_list` | List of members (seznam společníků) | An s.r.o. keeps its own list of members and their shares. It should match the commercial register and every transfer. | tier 4 | no | CZ.CORP.MEMBERS_LIST |
| `cz_ubo_extract` | Full extract from the register of beneficial owners (evidence skutečných majitelů) | The register of beneficial owners is no longer public, so your own full extract is the way to show the owner is registered. | tier 4 | no | CZ.CORP.UBO |
| `cz_agm_minutes` | Minutes of the general meeting that reviewed the accounts | The general meeting of an s.r.o. reviews the regular accounts within 6 months of the end of the accounting period. | tier 5 | no | CZ.CORP.ANNUAL_MEETING |
| `cz_accounts_filing` | Annual accounts (účetní závěrka), with proof of filing in the sbírka listin | Companies in the commercial register publish their accounts by filing them in the collection of documents. ARES does not show the filing, so we need your copy. | tier 4 | no | CZ.CORP.ACCOUNTS_FILING |
| `cz_director_decisions` | Decisions appointing and removing directors, as filed in the sbírka listin | Each decision that appoints or removes a director goes into the collection of documents of the commercial register. | tier 4 | no | CZ.CORP.DIRECTOR_DECISIONS |
| `cz_contractor_ip` | Contractor agreements with IP terms (assignment or broad licence) | Software made to order counts as the company's to use, but other work by contractors needs a written assignment or a broad licence. | tier 5 | no | CZ.IP.CONTRACTOR_WORKS |
| `cz_trademark` | ÚPV or EU trade mark certificate | There is no ÚPV lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed. | tier 4 | no | CZ.IP.TRADEMARK |
| `cz_cssz_registration` | ČSSZ employer registration confirmation | An employer registers with the Czech Social Security Administration (ČSSZ) before its first employee starts. Since 1 July 2026 this is done online, at least 2 working days before. | tier 4 | no | CZ.EMP.CSSZ_EMPLOYER |
| `cz_capital_increase` | Notarial record of the general meeting resolution on each capital increase | A capital increase is decided by the general meeting, and because it changes the founding contract, the resolution is recorded by a notary. | tier 4 | no | CZ.FUND.CAPITAL_INCREASE |
| `cz_capital_increase_extract` | Commercial register extract showing the increased capital | A capital increase is filed with the commercial register soon after the resolution. If it is not filed in time, the resolution can lapse. | tier 4 | no | CZ.FUND.CAPITAL_INCREASE_FILED |
| `cz_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | CZ.AI.TRANSPARENCY |
