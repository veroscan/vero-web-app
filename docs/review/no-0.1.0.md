# Review: Norway (NO) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** NO, version 0.1.0, 51 rules (1 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `f5dc3c1a0743d24fc932c80c7bc7b1951f95a04493264fac2447a09dc7464856`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (16)

### NO.CORP.COMPANY_PARTICULARS — Company details on letters, forms and website

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

### NO.CORP.STATUS — Company status in Enhetsregisteret

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, 5. The core set: “Registered in Foretaksregisteret, form AS, active with no bankruptcy, liquidation or dissolution flag”
- **Applies when:** yes
- **Passes when:** `registry.no.brreg.status` is “active”
- **A problem (defect) when:** all of: (`registry.no.brreg.identified` is yes) and (`registry.no.brreg.status` is one of “deleted”, “bankrupt”, “under_liquidation”, “under_compulsory_dissolution”)
- **“To check” when:** all of: (`registry.no.brreg.identified` is yes) and (not (`registry.no.brreg.status` is one of “active”, “deleted”, “bankrupt”, “under_liquidation”, “under_compulsory_dissolution”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Brønnøysundregistrene record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} doesn't show as active in the Norwegian register**
> We read {company}'s record from Brønnøysundregistrene, and it shows the company as bankrupt, in liquidation, under compulsory dissolution, or deleted.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* A company in this state can lose control of its assets and contracts, and may stop existing.
> *What to do:* Check the record at brreg.no today and get advice on what can still be done.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.BUSINESS_REGISTER — Registered in the Register of Business Enterprises

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 1 —: “Registered in Foretaksregisteret within 3 months of signing the founding document”
- **Applies when:** yes
- **Passes when:** `registry.no.brreg.in_business_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Brønnøysundregistrene record · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} isn't showing in the Register of Business Enterprises**
> We read {company}'s record from Brønnøysundregistrene, and it isn't in Foretaksregisteret.
> *Why it matters:* An AS is registered there within 3 months of signing its founding document. If that window is missed, it cannot be registered.
> *If left:* Until it is registered, the company is not properly formed, and banks and investors will stop there.
> *What to do:* Check the record at brreg.no and file the registration through Altinn if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.LEGAL_FORM — Company form: AS

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 1 —: “Company form is AS”
- **Applies when:** yes
- **Passes when:** `registry.no.brreg.organisation_form_code` is “AS”
- **“To check” when:** `registry.no.brreg.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Brønnøysundregistrene record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We couldn't confirm {company} is an AS**
> Brønnøysundregistrene doesn't show {company} as an aksjeselskap (AS).
> *Why it matters:* The Norwegian checks here are written for an AS. Other forms have different duties.
> *If left:* Some of the checks we show may not fit your company.
> *What to do:* Check the company form on your record. A person will look at which checks apply.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.ARTICLES — Articles of association (vedtekter)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 2 —: “Articles (vedtekter) state name, business activity, share capital and nominal value per share”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, 5. The core set: “Articles and share register in place”
- **Applies when:** yes
- **Passes when:** `vault.no_articles.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Articles of association (vedtekter) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your articles of association (vedtekter) on file**
> You haven't added your articles of association (vedtekter) to your documents yet.
> *Why it matters:* They state the name, business activity, share capital and the nominal value of each share.
> *If left:* Banks and investors ask for them, and a gap in your company records can hold up a round.
> *What to do:* Add the current vedtekter, with every change made since the company was set up.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.SHARE_CAPITAL — Share capital of at least NOK 30,000

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 2 —: “Share capital at least NOK 30,000”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, 5. The core set: “Share capital at least NOK 30,000”
- **Applies when:** yes
- **Passes when:** all of: (`registry.no.brreg.share_capital` is at least 30000) and (`registry.no.brreg.share_capital_currency` is “NOK”)
- **“To check” when:** all of: (`registry.no.brreg.identified` is yes) and (not (`registry.no.brreg.share_capital_currency` is “NOK”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** minimum_nok = 30000
- **Evidence:** Brønnøysundregistrene record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s registered share capital is below NOK 30,000**
> Brønnøysundregistrene shows {company}'s share capital as less than NOK 30,000.
> *Why it matters:* An AS must have a share capital of at least NOK 30,000.
> *If left:* A company below the minimum can be ordered to fix it, and investors will ask why.
> *What to do:* Raise the share capital to at least NOK 30,000 and register the change.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.SHARE_REGISTER — Share register (aksjeeierbok)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 2 —: “Share register (aksjeeierbok) set up promptly after incorporation”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, 5. The core set: “Articles and share register in place”
- **Applies when:** yes
- **Passes when:** any of: (`vault.no_share_register.present` is yes) or (`attest.no_share_register` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Share register; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s share register**
> You haven't added the share register (aksjeeierbok), or confirmed that the board keeps one.
> *Why it matters:* The board sets it up right after incorporation and keeps it reliable: each shareholder, their shares and share numbers.
> *If left:* It is the proof of who owns the company, and investors check it against every share issue.
> *What to do:* Bring the register up to date, and add it here or confirm the board keeps it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.UBO — Beneficial owners registered

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 2 —: “Beneficial owners registered with Brønnøysund within 14 days”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, 5. The core set: “Beneficial owners registered within 14 days, even if none”
- **Applies when:** yes
- **Passes when:** `vault.no_ubo_receipt.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_registration = 14
- **Evidence:** Receipt from the register of beneficial owners · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your beneficial-owner registration receipt on file**
> You haven't added your beneficial-owner registration receipt to your documents yet.
> *Why it matters:* Every AS registers its beneficial owners within 14 days of being registered, even if it has none. The register is not public.
> *If left:* Banks ask for it when they onboard you, and daily fines are possible for a missing registration.
> *What to do:* Register your beneficial owners through Altinn, or that there are none, and add the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.UBO_CHANGES — Beneficial-owner changes registered

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 2 —: “Beneficial-owner changes registered within 14 days”
- **Applies when:** yes
- **Passes when:** `attest.no_ubo_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_change = 14
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s beneficial-owner details are current**
> We don't have your confirmation that every change in who owns or controls the company was registered.
> *Why it matters:* A change is registered without delay, and within 14 days at the latest.
> *If left:* Daily fines are possible, and banks rely on these details.
> *What to do:* Check the registered details after each change in ownership, update them, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.ACCOUNTS_ADOPTED — Annual accounts adopted within 6 months

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 3 —: “Annual accounts adopted within 6 months of year end”
- **Applies when:** yes
- **Passes when:** `attest.no_accounts_adopted` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":6} (reminder only)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} adopted last year's accounts**
> We don't have your confirmation that the accounts were adopted within 6 months of the year end.
> *Why it matters:* Annual accounts are adopted within 6 months of the year end: by 30 June for a calendar year.
> *If left:* The filing deadline runs from adoption, and late accounts are fined.
> *What to do:* Adopt the accounts at the general meeting, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.GENERAL_MEETING — Minutes of the ordinary general meeting

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 3 —: “Ordinary general meeting within 6 months of year end”
- **Applies when:** yes
- **Passes when:** `vault.no_general_meeting.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Minutes of the ordinary general meeting (generalforsamlingsprotokoll) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your general meeting minutes on file**
> You haven't added your general meeting minutes to your documents yet.
> *Why it matters:* The meeting is held within 6 months of the year end and approves the accounts and any dividend.
> *If left:* A dividend paid without an approved meeting can be challenged, and investors ask for the minutes.
> *What to do:* Hold the meeting, sign the minutes, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.ACCOUNTS_FILED — Annual accounts sent to Regnskapsregisteret

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 1, official source, read live | S3 revenue, pre-raise | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 3 —: “Annual accounts sent to Regnskapsregisteret within 1 month of adoption”
- **Applies when:** yes
- **Passes when:** `derived.no.accounts_filed_recently` is yes
- **“To check” when:** `derived.no.accounts_filed_recently` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every year on 31 July (checked automatically with Brønnøysundregistrene)
- **Evidence:** Brønnøysundregistrene record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s latest annual accounts may not have reached Regnskapsregisteret**
> The last accounts Brønnøysundregistrene shows for {company} are older than we would expect for a company with a calendar year.
> *Why it matters:* Accounts go to Regnskapsregisteret within a month of adoption: by 31 July for a calendar year.
> *If left:* Late accounts are fined, and filed accounts are public, so investors notice a gap.
> *What to do:* Check the filing at brreg.no and send the accounts through Altinn if they are missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.BOARD — Board on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, 5. The core set: “Board and, where required, a daily manager on record”
- **Applies when:** yes
- **Passes when:** any of: (`registry.no.brreg.role_titles` includes “Styrets leder”) or (`registry.no.brreg.role_titles` includes “Styremedlem”)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Brønnøysundregistrene roles · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see a board for {company} in the Norwegian register**
> We read {company}'s roles from Brønnøysundregistrene and found no board chair or board member.
> *Why it matters:* An AS has a board, and its members are registered.
> *If left:* Nobody shows as able to act for the company, which holds up banks and investors.
> *What to do:* Register the board through Altinn.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.RESIDENCY — Daily manager and half the board resident in the EEA, UK or Switzerland

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 4 —: “Daily manager and at least half the board resident in the EEA, UK or Switzerland”
- **Applies when:** yes
- **Passes when:** any of: (`attest.no_residency_rule_met` is yes) or (`vault.no_residency_exemption.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Exemption decision · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} meets the residency rule for its management**
> We don't have your confirmation that the daily manager and at least half the board live in the EEA, the UK or Switzerland. We don't keep people's addresses, so we can't check.
> *Why it matters:* Norwegian law sets this rule for every AS, unless the ministry grants an exemption.
> *If left:* Registration of new board members can be refused, and the company can be ordered to fix it.
> *What to do:* Check where your daily manager and board members live, then confirm here, or add your exemption.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.BOARD_OF_AGE — Board members are adults

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 4 —: “Board members are of age”
- **Applies when:** yes
- **Passes when:** `attest.no_board_of_age` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s board members are adults**
> We don't have your confirmation that every board member is of age. We don't keep birth dates, so we can't check.
> *Why it matters:* Board members of an AS must be of age.
> *If left:* An invalid appointment can call board decisions into question.
> *What to do:* Check each board member is of age, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.CORP.AUDITOR — Auditor appointed, or audit validly opted out

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 4 —: “Auditor appointed, unless audit validly opted out”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, 5. The core set: “Auditor on record, or a valid opt-out”
- **Applies when:** yes
- **Passes when:** any of: (`registry.no.brreg.role_titles` includes “Revisor”) or (`vault.no_audit_opt_out.present` is yes)
- **“To check” when:** all of: (`registry.no.brreg.identified` is yes) and (not (`registry.no.brreg.role_titles` includes “Revisor”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Brønnøysundregistrene roles; General meeting decision to opt out · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see an auditor for {company}, or a decision to opt out**
> Brønnøysundregistrene shows no auditor for {company}, and you haven't added a decision to opt out of audit.
> *Why it matters:* An AS has an auditor unless the general meeting validly decided to opt out, which only small companies can do.
> *If left:* Accounts that should have been audited are a problem for banks, investors and the tax office.
> *What to do:* Add the opt-out decision here, or appoint an auditor and register it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (2)

### NO.IP.EMPLOYEE_WORKS — Employee inventions and software

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 5 —: “Employee inventions: employer's right to claim”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 5 —: “Software written by employees belongs to the employer”
- **Applies when:** `derived.employees` is yes
- **Passes when:** any of: (`vault.no_employee_ip_clause.present` is yes) or (`attest.no_employee_ip_clause` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Employment contract IP clause; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see how {company}'s employment contracts handle IP**
> You haven't added an employment contract IP clause, or confirmed that your contracts deal with inventions and other work.
> *Why it matters:* Software employees write at work belongs to the company. Inventions must be claimed in writing within 4 months of notice, and earn fair pay.
> *If left:* A missed claim leaves the invention with the employee, and investors check this.
> *What to do:* Add an IP clause covering inventions and all other work to your contracts. Add it here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.IP.TRADEMARK — Norwegian trade mark

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Patentstyret |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 5 —: “Trademark registered with Patentstyret”
- **Applies when:** yes
- **Passes when:** `vault.no_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.no_trademark.dated","years":10} (reminder only)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a Norwegian trade mark for {company}**
> You haven't added a trade mark certificate from Patentstyret.
> *Why it matters:* Without one, someone else could register a name close to yours in Norway, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand with Patentstyret, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (17)

### NO.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 6 —: “| Privacy notice published |”
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

### NO.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to Datatilsynet.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming Datatilsynet and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

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

### NO.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 8(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Age of digital consent for online services to children”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 6 —: “Children's consent: age 13 for online services”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Are any of your users under 18?” is yes)
- **Passes when:** `attest.eu_child_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** age_of_digital_consent = 13
- **Same obligation as other packs:** `eu_child_consent` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} gets consent for children**
> We don't have your confirmation of how you handle consent from children who use your service.
> *Why it matters:* Below 13, consent for an online service has to come from a parent as well, where you rely on consent.
> *If left:* Data collected without valid consent has no legal basis, and children's data is watched closely.
> *What to do:* Set up an age check and a parent consent step where you need one, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 6 —: “Records, DPIA, processor agreements, breach notification”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.no_ropa.present` is yes
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

### NO.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 6 —: “Records, DPIA, processor agreements, breach notification”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.no_dpa.present` is yes
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

### NO.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

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

### NO.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 37
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPO designated where required”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.sensitive_data` is yes)
- **Passes when:** `attest.eu_dpo` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_dpo` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed whether {company} needs a data protection officer**
> You told us you handle sensitive data, and we don't have your confirmation that you checked whether you need a data protection officer.
> *Why it matters:* Companies whose core work is monitoring people at scale, or handling sensitive data at scale, must name one and publish the contact.
> *If left:* If you need one and haven't named one, Datatilsynet can act on it.
> *What to do:* Check whether the tests apply to you. If they do, name your officer, publish the contact, tell Datatilsynet, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 6 —: “Records, DPIA, processor agreements, breach notification”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.no_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to Datatilsynet within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.no_transfers.present` is yes
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

### NO.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 6 —: “Cookie consent to the GDPR standard before non-essential storage”
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

### NO.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 6 —: “Cookie consent to the GDPR standard before non-essential storage”
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

### NO.TAX.VAT_REGISTRATION — VAT registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | Skatteetaten |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 7 —: “VAT registration once taxable turnover passes NOK 50,000 in 12 months”
- **Applies when:** yes
- **Passes when:** any of: (`registry.no.brreg.in_vat_register` is yes) or (`attest.no_vat_below_threshold` is yes)
- **“To check” when:** `registry.no.brreg.in_vat_register` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** threshold_nok_12_months = 50000
- **Abroad:** never follows the company into another country
- **Evidence:** Brønnøysundregistrene record; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} isn't on the Norwegian VAT register**
> Brønnøysundregistrene doesn't show {company} in the VAT register, and you haven't confirmed your sales are below the limit.
> *Why it matters:* A company registers for VAT once its taxable sales pass NOK 50,000 in 12 months.
> *If left:* VAT not charged is still owed, with interest and penalties.
> *What to do:* Register for VAT through Altinn if you are over the limit, or confirm here that you are below it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.EMP.A_MELDING — Monthly a-melding — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Skatteetaten |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 7 —: “Monthly a-melding to Nav, SSB and Skatteetaten”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.no_a_melding` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} files its monthly a-melding**
> We don't have your confirmation that the a-melding is filed every month.
> *Why it matters:* Employers report pay, tax deductions and employment details each month in the a-melding.
> *If left:* Missing reports bring fines and can affect your staff's benefits.
> *What to do:* Check with your payroll provider that each month is filed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.EMP.PENSION — Mandatory occupational pension (OTP)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 7 —: “Mandatory occupational pension (OTP) scheme”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.no_otp_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Occupational pension scheme agreement (OTP) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your pension scheme agreement on file**
> You haven't added your pension scheme agreement to your documents yet.
> *Why it matters:* Most employers must have a pension scheme for their staff, for example once two people work 75% or more of a full position.
> *If left:* Missing pension savings have to be paid back, and the tax office can fine the company.
> *What to do:* Set up an OTP scheme with a pension provider and add the agreement here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.FIN.PAYMENT_LICENCE — Payment or e-money licence (Finanstilsynet)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Finanstilsynet |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 8 —: “Payment institution licence (betalingsforetak)”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 8 —: “E-money institution licence (e-pengeforetak)”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** `vault.no_payment_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Finanstilsynet payment or e-money licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payment or e-money licence on file**
> You haven't added your payment or e-money licence to your documents yet.
> *Why it matters:* Holding or moving customers' money needs a licence from Finanstilsynet, or a licensed partner.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Finanstilsynet licence, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.FIN.LENDING_LICENCE — Lending licence (Finanstilsynet)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | lending | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Finanstilsynet |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 8 —: “Lending and lending intermediation”
- **Applies when:** `derived.sector.lending` is yes
- **Passes when:** `vault.no_lending_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Finanstilsynet lending licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your lending licence on file**
> You haven't added your lending licence to your documents yet.
> *Why it matters:* Lending, or arranging loans, needs a licence from Finanstilsynet.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your licence, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (10)

### NO.COM.WEBSITE_IDENTITY — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Trade register and registration number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “VAT number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 9 —: “Website shows name, address, email, business register, organisation number and VAT status”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, 5. The core set: “Website shows ehandelsloven §8 information”
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

### NO.COM.REGULATOR_NAMED — Your licensing authority, on your website

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

### NO.CONSUMER.PRICES — Clear prices

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

### NO.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | marketing | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2000/31/EC, Art 6
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Commercial communications identifiable as such”
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

### NO.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

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

### NO.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 6(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Consumer terms with the pre-contract information”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 9 —: “Pre-contract information for distance sales”
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

### NO.CONSUMER.ORDER_BUTTON — Order button wording

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

### NO.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 9 —: “14-day right of withdrawal explained”
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

### NO.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

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

### NO.CONSUMER.COMPLAINTS — How consumers can complain

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

## Layer 5: Fundraising (3)

### NO.FUND.CAPITAL_INCREASE — General meeting decision on each capital increase

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 10 —: “Share capital increase decided by the general meeting”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.no_capital_increase.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** General meeting minutes for each capital increase · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your capital increase minutes on file**
> You haven't added your capital increase minutes to your documents yet.
> *Why it matters:* Each capital increase is decided by the general meeting, with the amount, price, who may subscribe and the deadline.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the signed minutes of the general meeting behind each capital increase.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.FUND.CAPITAL_INCREASE_REGISTERED — Capital increase registered in time

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | Brønnøysundregistrene |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 10 —: “Capital increase registered within 3 months after the subscription deadline”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.no_capital_increase_registered` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_after_subscription_deadline = 3
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s capital increases were registered in time**
> We don't have your confirmation that each capital increase was registered within 3 months of the subscription deadline.
> *Why it matters:* If it is registered late, it cannot be registered at all and the subscriptions lapse.
> *If left:* Investors could find their shares were never validly issued.
> *What to do:* Check each increase shows in the register, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NO.FUND.SHARE_REGISTER_UPDATED — Share register updated after each issue

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 10 —: “Share register updated after the issue”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.no_share_register_updated` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s share register shows its new shareholders**
> We don't have your confirmation that the share register was updated after each share issue.
> *Why it matters:* New shares and their holders go into the share register after each issue.
> *If left:* Investors check the register against every share issue, and gaps hold up a round.
> *What to do:* Update the register after each issue, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (3)

### NO.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 6 —: “Records, DPIA, processor agreements, breach notification”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.no_dpia.present` is yes
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

### NO.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | Datatilsynet |

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

### NO.AI.TRANSPARENCY — AI use disclosed on the website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-norway-rule-pack-map.md`, Section 11 —: “AI use disclosed on the website”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.has_website` is yes)
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.no_ai_transparency.present` is yes)
- **“To check” when:** `web.policy.ai_disclosure_found` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_transparency` (counted once per company)
- **Evidence:** Published AI disclosures; Transparency records · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see where {company} tells people it uses AI**
> We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.
> *Why it matters:* Customers increasingly expect to be told when they are dealing with AI, and EU customers will ask under the EU rules.
> *If left:* Enterprise customers and investors are starting to ask, and you would have no answer ready.
> *What to do:* Say on your website where your product uses AI, or add your transparency records here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (18)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `no_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | NO.DP.ROPA |
| `no_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | NO.DP.PROCESSING_AGREEMENTS |
| `no_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | NO.AI.DPIA |
| `no_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to Datatilsynet within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | NO.DP.BREACH |
| `no_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | NO.DP.TRANSFERS |
| `no_articles` | Articles of association (vedtekter) | They state the name, business activity, share capital and the nominal value of each share. | tier 4 | no | NO.CORP.ARTICLES |
| `no_share_register` | Share register (aksjeeierbok) | The board keeps a reliable record of every shareholder and their shares. It is not public, so we need yours. | tier 5 | no | NO.CORP.SHARE_REGISTER |
| `no_ubo_receipt` | Receipt from the register of beneficial owners | Every AS registers its beneficial owners, even if it has none. The register is not public, so we need your receipt. | tier 4 | no | NO.CORP.UBO |
| `no_general_meeting` | Minutes of the ordinary general meeting (generalforsamlingsprotokoll) | The meeting is held within 6 months of the year end and approves the accounts and any dividend. | tier 4 | no | NO.CORP.GENERAL_MEETING |
| `no_residency_exemption` | Ministry exemption from the residency rule | If your daily manager or board doesn't meet the residency rule, an exemption from the ministry is the proof you may rely on it. | tier 4 | no | NO.CORP.RESIDENCY |
| `no_audit_opt_out` | General meeting decision to opt out of audit | A small AS can choose not to have an auditor, by a general meeting decision. Without an auditor on record, this decision is the proof. | tier 4 | no | NO.CORP.AUDITOR |
| `no_employee_ip_clause` | Employment contract IP clause | Employee software goes to the company by law, but inventions have to be claimed in writing in time, and other work needs a clause. | tier 5 | no | NO.IP.EMPLOYEE_WORKS |
| `no_trademark` | Patentstyret trade mark certificate | A Norwegian mark covers Norway only and lasts 10 years. We read your certificate for its dates. | tier 4 | no | NO.IP.TRADEMARK |
| `no_otp_agreement` | Occupational pension scheme agreement (OTP) | Most employers must have a pension scheme for their staff, for example once two people work 75% or more of a full position. | tier 4 | no | NO.EMP.PENSION |
| `no_payment_licence` | Finanstilsynet payment or e-money licence | Holding or moving customers' money needs a licence from Finanstilsynet, or a licensed partner. | tier 4 | no | NO.FIN.PAYMENT_LICENCE |
| `no_lending_licence` | Finanstilsynet lending licence | Lending, or arranging loans, needs a licence from Finanstilsynet. | tier 4 | no | NO.FIN.LENDING_LICENCE |
| `no_capital_increase` | General meeting minutes for each capital increase | Each capital increase is decided by the general meeting, with the amount, price, who may subscribe and the deadline. | tier 4 | no | NO.FUND.CAPITAL_INCREASE |
| `no_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | NO.AI.TRANSPARENCY |
