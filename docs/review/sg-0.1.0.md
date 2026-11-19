# Review: Singapore (SG) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** SG, version 0.1.0, 20 rules (8 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `3758af2946bab2f57521113e23101f8746deb8e96466dc77113ea785826dd782`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (13)

### SG.CORP.STATUS — Company registered with ACRA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | ACRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.01”
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 5. Core set: “Registered with ACRA, UEN live, local private company”
- **Applies when:** yes
- **Passes when:** any of: (`registry.sg.acra.status` is one of “registered”, “live”, “live_company”) or (`vault.sg_business_profile.present` is yes)
- **A problem (defect) when:** all of: (`registry.sg.acra.identified` is yes) and (`registry.sg.acra.status` is one of “deregistered”, “de-registered”, “struck_off”, “struck-off”)
- **“To check” when:** all of: (`registry.sg.acra.identified` is yes) and (not (`registry.sg.acra.status` is one of “registered”, “live”, “live_company”, “deregistered”, “de-registered”, “struck_off”, “struck-off”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ACRA's register of entities; ACRA business profile · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s UEN doesn't show as live with ACRA**
> ACRA's register of entities shows {company}'s UEN as deregistered or struck off.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* A company that has been struck off can lose its assets and its right to trade.
> *What to do:* Check the company on ACRA's BizFile today and get qualified advice on what can still be done. If the record is out of date, add a recent business profile.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.ENTITY_TYPE — Local private company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | ACRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.02”
- **Applies when:** yes
- **Passes when:** all of: (`registry.sg.acra.entity_type` is “Local Company”) and (`registry.sg.acra.registered_name` includes “PTE”)
- **“To check” when:** `registry.sg.acra.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ACRA's register of entities · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We couldn't confirm {company} is a local private company**
> ACRA's register doesn't show {company} as a local company with Pte. Ltd. in its name.
> *Why it matters:* The Singapore checks here are written for private companies limited by shares.
> *If left:* Some of the checks we show may not fit your company.
> *What to do:* Check the entity type on BizFile. A person will look at which checks apply.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.REGISTERED_OFFICE — Registered office in Singapore — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | ACRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.04”
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 5. Core set: “Registered office present”
- **Applies when:** yes
- **Passes when:** any of: (`registry.sg.acra.registered_postcode` is yes (or present)) or (`vault.sg_business_profile.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ACRA's register of entities; ACRA business profile · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see a registered office for {company}**
> ACRA's register shows no registered office postcode for {company}, and you haven't added a business profile.
> *Why it matters:* A Singapore company has a registered office in Singapore, and keeps registers such as its register of controllers there.
> *If left:* Official letters and legal papers may not reach you.
> *What to do:* Check the registered office on BizFile and update it if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.RESIDENT_DIRECTOR — A director living in Singapore — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.05”
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 5. Core set: “Resident director, secretary within 6 months, auditor within 3 months unless exempt”
- **Applies when:** yes
- **Passes when:** `attest.sg_resident_director` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; ACRA business profile · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has a director living in Singapore**
> We don't have your confirmation that at least one director ordinarily lives in Singapore. We don't keep people's details, so we can't check.
> *Why it matters:* Every Singapore company needs at least one director who ordinarily lives in Singapore.
> *If left:* Without one, the company is not set up the way ACRA requires, and banks will ask.
> *What to do:* Check your directors on BizFile, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.SECRETARY — Company secretary — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.06”
- **Applies when:** yes
- **Passes when:** `attest.sg_secretary` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; ACRA business profile · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has a company secretary**
> We don't have your confirmation that the company has appointed a secretary.
> *Why it matters:* A Singapore company appoints a secretary within 6 months of incorporation. The secretary is a person, and not the sole director.
> *If left:* The post cannot stay empty for more than 6 months.
> *What to do:* Check the secretary on BizFile, appoint one if needed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.AUDITOR — Auditor, or an audit exemption

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.07”
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 5. Core set: “Resident director, secretary within 6 months, auditor within 3 months unless exempt”
- **Applies when:** yes
- **Passes when:** any of: (`attest.sg_auditor` is yes) or (`attest.sg_small_company` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; ACRA business profile · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has an auditor, or is exempt**
> We don't have your confirmation that the company appointed an auditor, or that it is exempt from audit.
> *Why it matters:* A Singapore company appoints an auditor within 3 months of incorporation, unless it qualifies as exempt from audit.
> *If left:* If you are not exempt, your accounts will not meet ACRA's rules without an audit.
> *What to do:* Confirm the auditor you appointed, or confirm the company is exempt. A person will check the exemption applies.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.ELECTRONIC_REGISTERS — ACRA's registers of members and officers kept up to date

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | ACRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.08”
- **Applies when:** yes
- **Passes when:** `vault.sg_business_profile.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ACRA business profile · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s members and officers as ACRA holds them**
> You haven't added a recent ACRA business profile, so we can't see the registers ACRA keeps for the company.
> *Why it matters:* ACRA keeps the registers of members, directors, secretaries and auditors. Changes are filed through BizFile within 14 days.
> *If left:* If these registers are out of date, they don't match who really owns and runs the company.
> *What to do:* Buy a current business profile on BizFile, check it, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.CONTROLLERS_REGISTER — Register of registrable controllers

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.09”
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 5. Core set: “RORC kept and filed with the central register”
- **Applies when:** yes
- **Passes when:** `attest.sg_rorc` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps a register of its controllers**
> We don't have your confirmation that the company keeps its register of registrable controllers. It isn't public, so we can't check.
> *Why it matters:* A Singapore company keeps a register of the people who control it, from the day it is registered, and updates it within 7 days of a confirmed change.
> *If left:* Banks and investors ask about the people who control a company before they work with it.
> *What to do:* Set up or update the register at your registered office, send the yearly notices to each controller, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.CENTRAL_CONTROLLERS — Controllers filed with ACRA's central register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | ACRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.10”
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 5. Core set: “RORC kept and filed with the central register”
- **Applies when:** yes
- **Passes when:** `attest.sg_central_rorc` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s controllers are filed with ACRA**
> We don't have your confirmation that the company's controller information is filed with ACRA's central register.
> *Why it matters:* Each update to the company's own register is filed with ACRA within 2 business days. There is no extension.
> *If left:* Without it, ACRA's record of who controls the company is out of date.
> *What to do:* File any update through BizFile, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.NOMINEE_REGISTERS — Registers of nominee directors and shareholders

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.11”
- **Applies when:** `derived.sg.nominees` is yes
- **Passes when:** `attest.sg_nominee_registers` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its nominee registers**
> You told us the company has a nominee director or shareholder, and we don't have your confirmation that the nominee registers are kept and filed.
> *Why it matters:* Nominee directors and shareholders are recorded in registers updated within 7 days, and filed with ACRA within 2 business days.
> *If left:* Who really stands behind a nominee is one of the first things a bank checks.
> *What to do:* Update the registers and file them through BizFile, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.AGM — Annual general meeting — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.12”
- **Applies when:** yes
- **Passes when:** `attest.sg_agm` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; ACRA business profile · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} held its annual general meeting**
> We don't have your confirmation that the company held its annual general meeting, or did what replaces it.
> *Why it matters:* A Singapore company holds an annual general meeting after each financial year end, unless it is allowed to do without one.
> *If left:* Investors check that the company keeps up with its yearly meetings.
> *What to do:* Check the date of your last meeting, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.ANNUAL_RETURN — Annual return — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | ACRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.13”
- **Applies when:** yes
- **Passes when:** `vault.sg_business_profile.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ACRA business profile · **Fix type:** file · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't see {company}'s last annual return**
> ACRA's open data has no filings, and you haven't added a business profile showing the last annual return.
> *Why it matters:* A Singapore company files an annual return with ACRA each year after its financial year end.
> *If left:* Late filing is fined, and investors check that filings are up to date.
> *What to do:* Buy a current business profile on BizFile, check the last annual return date, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.CORP.FINANCIAL_STATEMENTS — Financial statements filed — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | ACRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.1 Layer 1: “SG-1.14”
- **Applies when:** yes
- **Passes when:** `vault.sg_financial_statements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Financial statements · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s financial statements**
> You haven't added the financial statements filed with your last annual return.
> *Why it matters:* A Singapore company prepares financial statements each year and files them with its annual return.
> *If left:* Investors and banks ask for them before anything else.
> *What to do:* Add the statements you filed with ACRA.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (5)

### SG.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | PDPC |

- **Law cited:** Personal Data Protection Act 2012
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.3 Layer 3: “SG-3.01”
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 5. Core set: “DPO designated with public contact details”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.sg_dpo` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Contact details on your website · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has a data protection officer**
> We don't have your confirmation that the company designated a data protection officer and registered them with the PDPC.
> *Why it matters:* A Singapore organisation that handles personal data designates at least one data protection officer, publishes how to reach them, and keeps their registration with the PDPC active.
> *If left:* Without one, people have nobody to ask about their data, and anyone can see that.
> *What to do:* Name a data protection officer, register them through BizFile or the PDPC form, publish a contact address, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.DP.PROCESSING_AGREEMENTS — Data protection terms with data intermediaries

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | PDPC |

- **Law cited:** Personal Data Protection Act 2012
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.3 Layer 3: “SG-3.05”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.sg_dpa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data protection terms with each vendor · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s data protection terms with its vendors**
> You haven't added the contract terms that cover how vendors handle personal data for you.
> *Why it matters:* Singapore's data protection rules expect your contract with each vendor to cover how they protect personal data.
> *If left:* If a vendor loses your customers' data, you would have no terms to point to.
> *What to do:* Collect the data protection terms from each vendor that handles personal data for you, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.DP.DO_NOT_CALL — Do Not Call Register checks — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | marketing | tier 5, the company tells us | S3 revenue, pre-raise | PDPC |

- **Law cited:** Personal Data Protection Act 2012
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.3 Layer 3: “SG-3.06”
- **Applies when:** `derived.sends_marketing` is yes
- **Passes when:** `attest.sg_dnc_checks` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} checks the Do Not Call Register**
> We don't have your confirmation that numbers are checked against the Do Not Call Register before marketing messages or calls.
> *Why it matters:* Before a marketing message or call to a Singapore number, the number is checked against the register, unless the person clearly agreed in a form you can show.
> *If left:* A message to a number on the register breaks the rules unless the person clearly agreed.
> *What to do:* Check numbers before each campaign, keep the results, honour opt-outs, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.TAX.GST — GST registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S3 revenue, pre-raise | IRAS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.3 Layer 3: “SG-3.07”
- **Applies when:** yes
- **Passes when:** any of: (`vault.sg_gst_registration.present` is yes) or (`attest.sg_gst_below_threshold` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** threshold_sgd = 1000000
- **Abroad:** never follows the company into another country
- **Evidence:** IRAS GST registration; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s GST registration**
> You haven't added the IRAS GST registration, or confirmed the company is below the threshold.
> *Why it matters:* A company registers for GST when its taxable turnover goes over S$1 million, looking back over the calendar year or ahead over the next 12 months.
> *If left:* Registering late can mean paying GST you never charged your customers.
> *What to do:* If you are registered, add the IRAS letter. If you are below the threshold, confirm that here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.EMP.CPF — CPF contributions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | CPF Board |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.3 Layer 3: “SG-3.08”
- **Applies when:** `derived.sg.cpf_employees` is yes
- **Passes when:** `vault.sg_cpf_csn.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** CPF letter with your CPF Submission Number · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s CPF Submission Number**
> You told us you employ Singapore citizens or permanent residents, and you haven't added the CPF letter with the company's CPF Submission Number.
> *Why it matters:* Employers pay CPF contributions for Singapore citizen and permanent resident employees earning more than S$50 a month, by the last day of each month.
> *If left:* Staff see missing contributions in their own CPF accounts.
> *What to do:* Get your CPF Submission Number from the CPF Board if you need one, and add the letter here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (2)

### SG.EQUITY.ALLOTMENT_RECORDED — New shares recorded with ACRA — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | shareholders | tier 4, a document the company uploads | S4 raising | ACRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.5 Layer 5: “SG-5.01”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.sg_business_profile.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ACRA business profile · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see {company}'s new shares in ACRA's register**
> You haven't added a business profile showing the members and share capital after your round.
> *Why it matters:* For a private company, new shares only take effect when ACRA updates its register of members, and the date can't be backdated.
> *If left:* Until then, your new investors may not legally hold their shares.
> *What to do:* File the allotment through BizFile, buy a business profile once it shows, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### SG.EQUITY.REGISTERS_AFTER_ROUND — Registers updated after a round

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | shareholders | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-singapore-rule-pack-map.md`, 3.5 Layer 5: “SG-5.03”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.sg_registers_updated_after_round` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s registers were updated after the round**
> We don't have your confirmation that the register of controllers, the nominee registers and ACRA's register of members were updated after new shares were issued.
> *Why it matters:* A round can change who controls the company, and each register has to show it.
> *If left:* The next investor or bank will check them against your round documents.
> *What to do:* Update each one after every round, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (5)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `sg_business_profile` | ACRA business profile (BizFile) | ACRA's open data has no officers, members or filings. One recent business profile shows them all. | tier 4 | no | SG.CORP.STATUS, SG.CORP.REGISTERED_OFFICE, SG.CORP.ELECTRONIC_REGISTERS, SG.CORP.ANNUAL_RETURN, SG.EQUITY.ALLOTMENT_RECORDED |
| `sg_financial_statements` | Financial statements filed with ACRA | They are filed with the annual return, and investors read them first. | tier 4 | no | SG.CORP.FINANCIAL_STATEMENTS |
| `sg_dpa` | Data protection terms with vendors (data intermediaries) | Vendors that handle personal data for you need contract terms that protect it. | tier 5 | no | SG.DP.PROCESSING_AGREEMENTS |
| `sg_gst_registration` | GST registration letter (IRAS) | It shows the company is registered for GST with IRAS. | tier 4 | no | SG.TAX.GST |
| `sg_cpf_csn` | CPF Submission Number letter | You need a CPF Submission Number before you can pay contributions for your staff. | tier 4 | no | SG.EMP.CPF |
