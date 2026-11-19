# Review: Kenya (KE) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** KE, version 0.1.0, 40 rules (0 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `5031408d42c3a7b91e16a1830cfd178478249d48de16078110be8f3b667479d0`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (15)

### KE.CORP.INCORPORATION — Certificate of incorporation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 1 —: “Incorporated by the Registrar of Companies through BRS eCitizen”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 1 —: “Private limited company name ends with "limited" or "ltd."”
- **Applies when:** yes
- **Passes when:** `vault.ke_incorporation_certificate.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Certificate of incorporation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your certificate of incorporation on file**
> You haven't added your certificate of incorporation to your documents yet.
> *Why it matters:* It shows the company was registered by the Registrar of Companies, under a name ending in "Limited".
> *If left:* It's the first thing a bank, investor or buyer asks for.
> *What to do:* Download the certificate from your BRS account on eCitizen and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.REGISTERED_OFFICE — Registered office kept

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 1 —: “Registered office kept at all times for communications and notices”
- **Applies when:** yes
- **Passes when:** `attest.ke_registered_office` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its registered office up to date**
> We don't have your confirmation that the company has a registered office for notices, and that the Registrar has the current address.
> *Why it matters:* Every company keeps a registered office at all times. A new address takes effect only once the Registrar registers it.
> *If left:* Official notices and legal papers go there, and a stale address means you miss them.
> *What to do:* Check the address on your CR12, file a change through BRS if needed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.OPERATING_LIST — Not on the Registrar's list of companies that may not be operating

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 5, the company tells us | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 1 —: “Not named on the Registrar's list of companies that may not be operating”
- **Applies when:** yes
- **Passes when:** `attest.ke_not_on_operating_list` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} is not on the Registrar's notice of companies that may not be operating**
> We don't have your confirmation that the company is not named on the Registrar's notice. We don't search the BRS site ourselves.
> *Why it matters:* The Registrar publishes companies that may not be operating, for example for missing filings, and can strike them off.
> *If left:* A company struck off loses its legal existence and its assets.
> *What to do:* Check the company's name on the BRS Compliance Check search, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.ARTICLES — Articles of association

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 2 —: “Memorandum and articles lodged with the registration application”
- **Applies when:** yes
- **Passes when:** `vault.ke_articles.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Memorandum and articles of association, current version · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your articles of association on file**
> You haven't added your articles of association to your documents yet.
> *Why it matters:* The articles lodged with the registration are the company's constitution. The model articles fill any gap.
> *If left:* Banks and investors ask for them, and a gap in your company records can hold up a round.
> *What to do:* Add the current memorandum and articles, with every change lodged since.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.MEMBERS_REGISTER — Register of members, lodged with the Registrar

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 2 —: “Register of members kept with names, addresses, dates and shareholdings”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 2 —: “Copy of the register of members lodged with the Registrar within 30 days”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ke_members_register.present` is yes) or (`attest.ke_members_register` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_lodge = 30; days_to_lodge_amendment = 14
- **Evidence:** Register of members and lodgement; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s register of members**
> You haven't added the register of members, or confirmed it is kept and lodged with the Registrar.
> *Why it matters:* A company keeps a register of every member and their shares, lodges a copy with the Registrar within 30 days, and lodges each change within 14 days.
> *If left:* It is the proof of who owns the company, and late lodging is fined.
> *What to do:* Bring the register up to date, lodge it through BRS, and add it here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.BO_REGISTER — Register of beneficial owners kept

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 2 —: “Register of beneficial owners kept by the company”
- **Applies when:** yes
- **Passes when:** `attest.ke_bo_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps a register of beneficial owners**
> We don't have your confirmation that the company keeps a register of the people who ultimately own or control it.
> *Why it matters:* Every company keeps a register of its beneficial owners with the details the regulations set.
> *If left:* Banks check it when they onboard you, and the Registrar can act on a missing register.
> *What to do:* Identify your beneficial owners, record them, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.BO_FILING — Beneficial owners lodged with the Registrar

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 2 —: “Beneficial owners register lodged with the Registrar within 30 days of preparation”
- **Applies when:** yes
- **Passes when:** `vault.ke_bo_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_lodge = 30
- **Evidence:** BRS acknowledgement of the beneficial ownership filing · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your beneficial ownership lodgement acknowledgement on file**
> You haven't added your beneficial ownership lodgement acknowledgement to your documents yet.
> *Why it matters:* A copy of the beneficial owners register goes to the Registrar within 30 days of preparing it. It is not public, so we need your acknowledgement.
> *If left:* The Registrar lists companies with missing beneficial ownership filings, and banks ask for it.
> *What to do:* Lodge your beneficial owners through BRS on eCitizen, and add the acknowledgement here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.BO_CHANGES — Beneficial-owner changes lodged within 14 days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 2 —: “Beneficial-owner changes lodged within 14 days of amending the register”
- **Applies when:** yes
- **Passes when:** `attest.ke_bo_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_lodge = 14
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s beneficial-owner changes reach the Registrar**
> We don't have your confirmation that each change to the beneficial owners register was lodged with the Registrar.
> *Why it matters:* The company lodges each amendment within 14 days, and owners and directors tell the company of changes in time.
> *If left:* Out-of-date details mislead banks and can be fined.
> *What to do:* Lodge any change through BRS after each change in ownership, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.ANNUAL_RETURN — Annual return lodged

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 3 —: “Annual return lodged within 28 days after its return date”
- **Applies when:** yes
- **Passes when:** `vault.ke_annual_return.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_return_date = 28
- **Evidence:** Latest annual return filing receipt from eCitizen · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We don't have your latest annual return filing receipt on file**
> You haven't added your latest annual return filing receipt to your documents yet.
> *Why it matters:* Every company lodges an annual return within 28 days after its return date, the anniversary of incorporation.
> *If left:* Late returns are fined, and a company that stops filing can be struck off.
> *What to do:* File the annual return through BRS on eCitizen, and add the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.FINANCIAL_STATEMENTS — Financial statements lodged within 9 months

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 3 —: “Financial statements lodged within 9 months of the accounting reference period (private company)”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 3 —: “Small company lodges at least its balance sheet”
- **Applies when:** yes
- **Passes when:** `vault.ke_financial_statements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":9} (reminder only)
- **Numbers for you to confirm:** months_after_year_end = 9
- **Evidence:** Lodged financial statements (or balance sheet, for a small company), with the filing receipt · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your lodged financial statements on file**
> You haven't added your lodged financial statements to your documents yet.
> *Why it matters:* A private company lodges its financial statements within 9 months of its year end. A small company may lodge just the balance sheet.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Lodge the statements through BRS, and add them and the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.DIRECTORS — At least one director, a natural person

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 4 —: “Private company has at least one director”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 4 —: “At least one director is a natural person”
- **Applies when:** yes
- **Passes when:** `vault.ke_cr12.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Official search (CR12) from BRS, recent · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your recent CR12 official search on file**
> You haven't added your recent CR12 official search to your documents yet.
> *Why it matters:* A private company has at least one director, and at least one director is a natural person.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Get a recent CR12 from BRS, check the directors are right, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.DIRECTORS_OF_AGE — Directors are adults

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 4 —: “Directors are at least 18 years old”
- **Applies when:** yes
- **Passes when:** `attest.ke_directors_of_age` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s directors are adults**
> We don't have your confirmation that every director is at least 18. We don't keep birth dates, so we can't check.
> *Why it matters:* A director must be at least 18. Appointing someone younger is void.
> *If left:* A void appointment can call board decisions into question.
> *What to do:* Check each director is at least 18, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.DIRECTOR_REGISTERS — Registers of directors kept

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 4 —: “Register of directors and register of directors' residential addresses”
- **Applies when:** yes
- **Passes when:** `attest.ke_director_registers` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its registers of directors**
> We don't have your confirmation that the company keeps a register of directors and a separate register of their home addresses.
> *Why it matters:* A company keeps both registers, and the register of directors is open for inspection.
> *If left:* Missing registers can be fined and slow down due diligence.
> *What to do:* Set up both registers, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.SECRETARY — Company secretary, once paid-up capital reaches KES 5 million

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 4 —: “Company secretary required once paid-up capital is KES 5 million or more”
- **Applies when:** yes
- **Passes when:** any of: (`attest.ke_secretary_appointed` is yes) or (`attest.ke_capital_below_secretary_threshold` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** paid_up_capital_kes = 5000000
- **Evidence:** CR12 official search; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't told us about {company}'s company secretary**
> We don't have your confirmation that the company has a secretary, or that its paid-up capital is below KES 5 million.
> *Why it matters:* A private company with paid-up capital of KES 5 million or more has a company secretary.
> *If left:* Without one, filings and minutes have nobody responsible for them, and investors ask.
> *What to do:* Appoint a secretary if you are over the limit, or confirm here that you are below it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CORP.AUDIT — Audit, unless the company is exempt

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 4 —: “Financial statements audited unless the company is exempt”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 4 —: “Small company audit exemption: small, turnover up to KES 50 million and net assets up to KES 20 million”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ke_audit_report.present` is yes) or (`attest.ke_audit_exempt` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** turnover_kes = 50000000; net_assets_kes = 20000000
- **Evidence:** Auditor's report; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s audit report or exemption**
> You haven't added an auditor's report, or confirmed that the company is exempt from audit.
> *Why it matters:* A company is audited unless it is small and its turnover is no more than KES 50 million and net assets no more than KES 20 million. The exemption is stated on the balance sheet.
> *If left:* Statements that needed an audit are incomplete, and banks and investors ask for it.
> *What to do:* Add the auditor's report, or confirm here that the company is exempt.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (1)

### KE.IP.EMPLOYEE_WORKS — Work made by employees belongs to the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 5 —: “Copyright in employees' work made in the course of employment passes to the employer”
- **Applies when:** `derived.employees` is yes
- **Passes when:** any of: (`vault.ke_employee_ip_clause.present` is yes) or (`attest.ke_employee_ip_clause` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Employment contract IP clause; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see how {company}'s employment contracts handle IP**
> You haven't added an employment contract IP clause, or confirmed that your contracts leave the work with the company.
> *Why it matters:* Copyright in work made in the course of employment, software included, passes to the employer unless an agreement limits it.
> *If left:* A contract that limits it leaves the product with the employee, and investors check this.
> *What to do:* Check your contracts keep IP with the company. Add the clause here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (17)

### KE.DP.ODPC_REGISTRATION — Registered with the Data Protection Commissioner

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** Data Protection Act 2019, s 18; Data Protection (Registration of Data Controllers and Data Processors) Regulations 2021, regs 9, 13
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Registered with the ODPC before acting as data controller or processor”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Exempt from registration only below KES 5 million turnover and under 10 employees”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Third Schedule purposes need registration whatever the size”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “ODPC certificate valid for 24 months, then renewed”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** any of: (`vault.ke_odpc_certificate.present` is yes) or (`attest.ke_odpc_exempt` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.ke_odpc_certificate.dated","years":2} (reminder only)
- **Numbers for you to confirm:** exempt_below_turnover_kes = 5000000; exempt_below_employees = 10; certificate_months = 24
- **Evidence:** ODPC certificate of registration; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s registration with the Data Protection Commissioner**
> You haven't added a current ODPC certificate, or confirmed the company is exempt.
> *Why it matters:* A company that handles personal data registers with the ODPC, unless its turnover is below KES 5 million and it has fewer than 10 employees. Some purposes, such as health, education, financial services and direct marketing, always need registration. The certificate lasts 24 months.
> *If left:* Handling personal data without a needed registration is an offence, and customers ask for the certificate.
> *What to do:* Register on the ODPC portal, renew before the 24 months run out, and add the certificate here, or confirm the exemption.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.DP.ODPC_CHANGES — Changes notified to the ODPC within 14 days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Changes to registered particulars notified to the ODPC within 14 days”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** any of: (`attest.ke_odpc_changes` is yes) or (`attest.ke_odpc_exempt` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_notify = 14
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s ODPC details are current**
> We don't have your confirmation that every change to your registered details, such as new purposes or data, was notified to the ODPC.
> *Why it matters:* Changes to the particulars you registered are notified to the ODPC within 14 days.
> *If left:* An out-of-date registration may not cover what you do with data.
> *What to do:* Check your registration against what you do today, notify any change, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.DP.PRIVACY_NOTICE — Privacy notice (Data Protection Act)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** Data Protection Act 2019, s 29
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Privacy notice tells people what section 29 requires before collection”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.privacy_notice_found` is yes
- **“To check” when:** all of: (`web.policy.privacy_notice_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a privacy notice on {company}'s website**
> We looked at your website and couldn't find a privacy notice.
> *Why it matters:* Before collecting personal data, people are told their rights, that it is being collected, why, who gets it, how to contact you, and any transfer abroad.
> *If left:* It's public, so customers, partners and the ODPC can all see the gap.
> *What to do:* Publish a notice with those details and link it from every page.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.DP.CONSENT — Consent you can prove and people can withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Consent provable and withdrawable at any time”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.ke_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} can prove consent and lets people withdraw it**
> We don't have your confirmation that, where you rely on consent, you keep a record of it and people can withdraw it at any time.
> *Why it matters:* Where consent is the basis, the company must be able to prove it, and people may withdraw it at any time.
> *If left:* Data used without consent you can prove has no legal basis.
> *What to do:* Record how and when each consent was given, offer a simple way to withdraw, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.DP.CHILDREN — Parent consent for children's data

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** Data Protection Act 2019, s 33
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Children's data: parent or guardian consent and age verification”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Are any of your users under 18?” is yes)
- **Passes when:** `attest.ke_children_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} handles children's data**
> We don't have your confirmation that a parent or guardian consents, and that you check ages, before using children's data.
> *Why it matters:* Children's data needs a parent's or guardian's consent, an age check, and processing in the child's best interests.
> *If left:* Children's data is watched closely, and the ODPC can act on it.
> *What to do:* Set up an age check and a parent consent step, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.DP.BREACH — Data breach plan (72 hours)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** Data Protection Act 2019, s 43
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Breach reported to the Data Commissioner within 72 hours”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.ke_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** hours_to_report = 72
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach with a real risk of harm is reported to the Data Commissioner within 72 hours, so you need to know who does what first.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the ODPC and the people affected, and how fast, keep a log, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.DP.TRANSFERS — Safeguards for data sent out of Kenya

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** Data Protection Act 2019, s 48
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Transfers out of Kenya need proof of safeguards or a listed necessity”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.data_outside_home` is yes)
- **Passes when:** `attest.ke_transfers` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s safeguards for data sent out of Kenya**
> You told us personal data is held outside Kenya, and we have no confirmation of the safeguards for it.
> *Why it matters:* Personal data leaves Kenya only with proof of appropriate safeguards given to the Data Commissioner, or on a listed necessity. Sensitive data also needs consent.
> *If left:* Transfers without safeguards are a breach of the Act, and customers ask about them.
> *What to do:* Check each provider abroad has a contract with data protection terms, keep the proof, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.DP.DIRECT_MARKETING — Consent and opt-out for marketing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | marketing | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** Data Protection Act 2019, s 37
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Commercial use and direct marketing need consent and an opt-out”
- **Applies when:** `derived.sends_marketing` is yes
- **Passes when:** `attest.ke_direct_marketing` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s marketing meets the consent rules**
> We don't have your confirmation that your marketing has consent and that every message offers a free way to opt out.
> *Why it matters:* Using personal data for commercial purposes needs express consent, and each direct marketing message offers a simple, free opt-out.
> *If left:* People who did not agree can complain to the ODPC.
> *What to do:* Check how you collect consent and handle opt-outs, keep records, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.TAX.KRA_PIN — Company KRA PIN

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Kenya Revenue Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “Company KRA PIN registered on iTax”
- **Applies when:** yes
- **Passes when:** `vault.ke_kra_pin.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** KRA PIN certificate for the company · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your KRA PIN certificate on file**
> You haven't added your KRA PIN certificate to your documents yet.
> *Why it matters:* A company with, or expecting, an income tax liability registers for a PIN on iTax.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Register the company on iTax, and add the PIN certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.TAX.VAT_REGISTRATION — VAT registration at KES 5 million

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S3 revenue, pre-raise | Kenya Revenue Authority |

- **Law cited:** VAT Act 2013, s 34
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “VAT registration within 30 days once taxable supplies reach KES 5 million in 12 months”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ke_vat_certificate.present` is yes) or (`attest.ke_vat_below_threshold` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** threshold_kes_12_months = 5000000; days_to_apply = 30
- **Abroad:** never follows the company into another country
- **Evidence:** VAT registration certificate; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s VAT registration**
> You haven't added a VAT registration certificate, or confirmed your taxable sales are below KES 5 million in 12 months.
> *Why it matters:* A company applies for VAT registration within 30 days once its taxable supplies reach, or are expected to reach, KES 5 million in 12 months.
> *If left:* VAT not charged is still owed, with penalties and interest.
> *What to do:* Register on iTax if you are over the limit and add the certificate, or confirm here that you are below it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.TAX.VAT_RETURNS — VAT returns by the 20th

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | Kenya Revenue Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “VAT return and payment by the 20th of the following month”
- **Applies when:** yes
- **Passes when:** any of: (`attest.ke_vat_returns` is yes) or (`attest.ke_vat_below_threshold` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} files its VAT returns**
> We don't have your confirmation that VAT returns are filed and paid on iTax by the 20th of each following month, or that you are not registered.
> *Why it matters:* A VAT-registered company files and pays by the 20th of the month after each period.
> *If left:* Late returns bring penalties and interest.
> *What to do:* Check with your accountant that every month is filed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.TAX.ETIMS — Electronic tax invoices (eTIMS)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S2 incorporated, pre-revenue | Kenya Revenue Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “eTIMS onboarding and electronic tax invoices”
- **Applies when:** yes
- **Passes when:** `attest.ke_etims` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} issues invoices through eTIMS**
> We don't have your confirmation that the company is onboarded on eTIMS and issues electronic tax invoices.
> *Why it matters:* KRA requires every business to onboard eTIMS and issue electronic tax invoices, whether or not it is VAT registered.
> *If left:* Expenses without eTIMS invoices may not be deductible, and customers ask for them.
> *What to do:* Onboard on eTIMS, issue invoices through it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.TAX.INCOME_TAX_RETURN — Company income tax return within 6 months

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | Kenya Revenue Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “Company income tax return within 6 months of year end”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “Instalment tax on the 20th of months 4, 6, 9 and 12”
- **Applies when:** yes
- **Passes when:** `attest.ke_income_tax_return` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":6} (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} files its income tax return and instalments**
> We don't have your confirmation that the company return is filed within 6 months of the year end, with instalment tax paid during the year.
> *Why it matters:* Companies file their income tax return on iTax within 6 months of the year end, and pay instalment tax in the 4th, 6th, 9th and 12th months.
> *If left:* Late returns and short instalments bring penalties and interest.
> *What to do:* Check with your accountant that the return and instalments are up to date, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.EMP.MONTHLY_PAYROLL — PAYE, Housing Levy, SHIF and NSSF paid by the 9th

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Kenya Revenue Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “PAYE employer registration and monthly return by the 9th”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “Affordable Housing Levy: 1.5% employee plus 1.5% employer”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “SHIF contributions deducted and remitted by the 9th”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 7 —: “NSSF employer and employee registration, contributions by the 9th”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.ke_monthly_payroll` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} pays its monthly payroll deductions**
> We don't have your confirmation that PAYE, the Housing Levy, SHIF and NSSF are deducted, filed and paid each month.
> *Why it matters:* Employers register for PAYE and NSSF, and pay PAYE, SHIF and NSSF by the 9th of the next month, with the Housing Levy of 1.5% from each side by the 9th working day.
> *If left:* Late payments bring penalties, and staff lose health and pension cover.
> *What to do:* Check with your payroll provider that every month is filed and paid, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.FIN.PAYMENT_AUTHORISATION — Payment service authorisation (CBK)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Central Bank of Kenya |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 8 —: “Payment service provider authorisation from CBK”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** `vault.ke_payment_authorisation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CBK payment service provider authorisation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CBK payment service authorisation on file**
> You haven't added your CBK payment service authorisation to your documents yet.
> *Why it matters:* Holding or moving customers' money needs an authorisation from the Central Bank of Kenya, or a licensed partner.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your CBK authorisation, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.FIN.DIGITAL_CREDIT_LICENCE — Digital credit provider licence (CBK)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | lending | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Central Bank of Kenya |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 8 —: “Digital credit provider licence from CBK”
- **Applies when:** `derived.sector.lending` is yes
- **Passes when:** `vault.ke_digital_credit_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CBK digital credit provider licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your digital credit provider licence on file**
> You haven't added your digital credit provider licence to your documents yet.
> *Why it matters:* Lending through digital channels needs a licence from the Central Bank of Kenya.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your CBK licence, or the agreement with the licensed lender that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.FIN.VASP_LICENCE — Virtual asset service provider licence

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | crypto | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Central Bank of Kenya or Capital Markets Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 8 —: “Virtual asset service provider licence from CBK or CMA”
- **Applies when:** `derived.sector.crypto` is yes
- **Passes when:** `vault.ke_vasp_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Virtual asset service provider licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your virtual asset service provider licence on file**
> You haven't added your virtual asset service provider licence to your documents yet.
> *Why it matters:* Since 4 November 2025, virtual asset services need a licence from the Central Bank of Kenya or the Capital Markets Authority.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your licence, or the agreement with the licensed provider that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (2)

### KE.COM.COMPANY_DETAILS — Company name and details in communications

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | website_information | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 9 —: “Company name and prescribed information displayed and stated in communications”
- **Applies when:** yes
- **Passes when:** `attest.ke_company_details` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} shows its name and details where it should**
> We don't have your confirmation that the company's name is shown at its offices and in its letters, invoices and other communications, with the details the regulations require.
> *Why it matters:* A company displays its name and states it, with the prescribed details, in its communications.
> *If left:* Leaving them off can be fined, and it makes the company look less established.
> *What to do:* Add the name and details to your templates and website, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.CONSUMER.FAIR_DEALING — No misleading claims or unfair conduct towards consumers

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | Competition Authority of Kenya |

- **Law cited:** Competition Act, ss 55-57
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 9 —: “No false or misleading representations to consumers”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 9 —: “No unconscionable conduct towards consumers”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `attest.ke_fair_dealing` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s marketing and dealings with consumers are fair**
> We don't have your confirmation that your advertising and online statements are accurate, and that you deal fairly with consumers.
> *Why it matters:* False or misleading claims to consumers, online ones included, and unconscionable conduct are banned.
> *If left:* The Competition Authority can fine the company and order it to correct what it said.
> *What to do:* Review your website and adverts for claims you cannot back up, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (3)

### KE.FUND.ALLOTMENT — Share allotment authorised and returned to the Registrar

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | Business Registration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 10 —: “Directors' authority to allot shares”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 10 —: “Return of allotment with a statement of capital within one month”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.ke_allotment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_to_return = 1
- **Evidence:** Board resolution and lodged return of allotment for each share issue · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your allotment resolution and return of allotment on file**
> You haven't added your allotment resolution and return of allotment to your documents yet.
> *Why it matters:* Directors allot shares with the authority the articles or a resolution give, and lodge a return of allotment with a statement of capital within one month.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the resolution behind each allotment and the lodged return of allotment.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.FUND.ALLOTMENT_REGISTERED — Allotments registered and the members register updated

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 10 —: “Allotment registered within two months”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 10 —: “Members register updated and lodged within 14 days after the issue”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.ke_allotment_registered` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s new shares are registered**
> We don't have your confirmation that each allotment was registered within two months, and the register of members updated and lodged after the issue.
> *Why it matters:* An allotment is registered within two months, and the change to the members register is lodged within 14 days.
> *If left:* Investors could find their shares are not on record.
> *What to do:* Update the register after each issue, lodge it through BRS, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.FUND.NO_PUBLIC_OFFER — No offer of shares to the public

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 10 —: “Private company may not offer its securities to the public”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.ke_no_public_offer` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation, with your investor list · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s rounds were not public offers**
> We don't have your confirmation that each round went only to people you approached privately, not to the public.
> *Why it matters:* A private company may not offer its shares or other securities to the public.
> *If left:* An offer to the public can be stopped, and investors can ask for their money back.
> *What to do:* Keep a list of who each offer went to, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (2)

### KE.DP.IMPACT_ASSESSMENT — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Data Protection Commissioner |

- **Law cited:** Data Protection Act 2019, s 31
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 6 —: “Impact assessment before high-risk processing, report 60 days ahead”
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 11 —: “Profiling or new-technology processing triggers an impact assessment”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.ke_dpia.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_before_processing = 60
- **Evidence:** Data protection impact assessment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data protection impact assessment on file**
> You haven't added your data protection impact assessment to your documents yet.
> *Why it matters:* Profiling, automated decisions, large-scale, biometric or children's data need an assessment, reported to the ODPC 60 days before you start.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Write the assessment for each high-risk use, send it to the ODPC in time, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### KE.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | Office of the Data Protection Commissioner |

- **Law cited:** Data Protection Act 2019, s 35
- **Encoded from:** `docs/knowledge/vero-scan-kenya-rule-pack-map.md`, Section 11 —: “Right not to be subject to solely automated decisions with significant effect”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.personal_data` is yes) and (the answer to “For example, approving credit or rejecting a job applicant” is yes)
- **Passes when:** `attest.ke_automated_decisions` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s basis for automated decisions**
> You told us software makes big decisions about people by itself, and we have no confirmation of the basis for it.
> *Why it matters:* People have a right not to be subject to decisions with significant effect made only by automated processing, unless it is needed for a contract, authorised by law with safeguards, or based on consent.
> *If left:* A decision without a basis can be challenged, and the ODPC can act on it.
> *What to do:* Check the basis for each automated decision, explain it in your notice, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (18)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `ke_incorporation_certificate` | Certificate of incorporation | It shows the company was registered by the Registrar of Companies, under a name ending in "Limited". | tier 4 | no | KE.CORP.INCORPORATION |
| `ke_articles` | Memorandum and articles of association, current version | The articles lodged with the registration are the company's constitution. The model articles fill any gap. | tier 4 | no | KE.CORP.ARTICLES |
| `ke_members_register` | Register of members, with the Registrar's lodgement acknowledgement | The company keeps a register of members and lodges a copy with the Registrar within 30 days, and each change within 14 days. | tier 4 | no | KE.CORP.MEMBERS_REGISTER |
| `ke_bo_filing` | BRS acknowledgement of the beneficial ownership filing | A copy of the beneficial owners register goes to the Registrar within 30 days of preparing it. It is not public, so we need your acknowledgement. | tier 4 | no | KE.CORP.BO_FILING |
| `ke_annual_return` | Latest annual return filing receipt from eCitizen | The annual return is lodged within 28 days after the return date, the anniversary of incorporation. | tier 4 | no | KE.CORP.ANNUAL_RETURN |
| `ke_financial_statements` | Lodged financial statements (or balance sheet, for a small company), with the filing receipt | A private company lodges its financial statements within 9 months of its year end. A small company may lodge just the balance sheet. | tier 4 | no | KE.CORP.FINANCIAL_STATEMENTS |
| `ke_cr12` | Official search (CR12) from BRS, recent | The BRS register is not connected. A recent CR12 shows the current directors, secretary and shareholders. | tier 4 | no | KE.CORP.DIRECTORS |
| `ke_audit_report` | Auditor's report, or the balance sheet with the directors' exemption statement | Financial statements are audited unless the company is small, with turnover up to KES 50 million and net assets up to KES 20 million. | tier 4 | no | KE.CORP.AUDIT |
| `ke_employee_ip_clause` | Employment contract IP clause | Copyright in work made in the course of employment passes to the employer, unless a contract limits it. A clause makes it clear. | tier 5 | no | KE.IP.EMPLOYEE_WORKS |
| `ke_odpc_certificate` | ODPC certificate of registration (current) | Controllers and processors register with the ODPC before handling personal data. The certificate lasts 24 months. The public list sits behind a bot check, so we read your certificate. | tier 4 | yes | KE.DP.ODPC_REGISTRATION |
| `ke_dpia` | Data protection impact assessment | Profiling, automated decisions, large-scale, biometric or children's data need an assessment, reported to the ODPC 60 days before you start. | tier 5 | no | KE.DP.IMPACT_ASSESSMENT |
| `ke_breach_plan` | Data breach response plan and breach log | A breach with a real risk of harm is reported to the Data Commissioner within 72 hours, so you need to know who does what first. | tier 5 | no | KE.DP.BREACH |
| `ke_kra_pin` | KRA PIN certificate for the company | A company with, or expecting, an income tax liability registers for a PIN on iTax. | tier 4 | no | KE.TAX.KRA_PIN |
| `ke_vat_certificate` | VAT registration certificate | A company registers for VAT within 30 days once its taxable supplies reach KES 5 million in 12 months. | tier 4 | no | KE.TAX.VAT_REGISTRATION |
| `ke_payment_authorisation` | CBK payment service provider authorisation | Holding or moving customers' money needs an authorisation from the Central Bank of Kenya, or a licensed partner. | tier 4 | no | KE.FIN.PAYMENT_AUTHORISATION |
| `ke_digital_credit_licence` | CBK digital credit provider licence | Lending through digital channels needs a licence from the Central Bank of Kenya. | tier 4 | no | KE.FIN.DIGITAL_CREDIT_LICENCE |
| `ke_vasp_licence` | Virtual asset service provider licence | Since 4 November 2025, virtual asset services need a licence from the Central Bank of Kenya or the Capital Markets Authority. | tier 4 | no | KE.FIN.VASP_LICENCE |
| `ke_allotment` | Board resolution and lodged return of allotment for each share issue | Directors allot shares with the authority the articles or a resolution give, and lodge a return of allotment with a statement of capital within one month. | tier 4 | no | KE.FUND.ALLOTMENT |
