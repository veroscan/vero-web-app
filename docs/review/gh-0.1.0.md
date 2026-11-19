# Review: Ghana (GH) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** GH, version 0.1.0, 39 rules (0 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `b2d54a76b2051d885eefa7665dc1ee3cd6384dfc5494b2ec6ef3cb97d5db7572`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (18)

### GH.CORP.INCORPORATION — Certificate of incorporation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 1 —: “Incorporated by the Registrar of Companies under Act 992”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 1 —: “Name ends with "Limited Company" or "LTD"”
- **Applies when:** yes
- **Passes when:** `vault.gh_incorporation_certificate.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Certificate of incorporation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your certificate of incorporation on file**
> You haven't added your certificate of incorporation to your documents yet.
> *Why it matters:* The ORC register is not connected, so the certificate shows the company is registered, under a name ending in "Limited Company" or "LTD".
> *If left:* It's the first thing a bank, investor or buyer asks for.
> *What to do:* Add the certificate of incorporation from the ORC.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.REGISTERED_OFFICE — Registered office and contact details notified

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 1 —: “Registered office, phone and postal or digital address within 28 days of incorporation”
- **Applies when:** yes
- **Passes when:** `attest.gh_registered_office` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_notify = 28
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s registered office details are with the Registrar**
> We don't have your confirmation that the Registrar has the company's registered office, phone, postal or digital address, email and website.
> *Why it matters:* These are notified within 28 days of incorporation, and each change within 28 days.
> *If left:* Notices go there, and default brings a daily penalty.
> *What to do:* Check your details with the ORC, notify any change, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.NAME_SHOWN — Company name on offices, letters and invoices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 1 —: “Name painted at offices and printed on letters, invoices and receipts”
- **Applies when:** yes
- **Passes when:** `attest.gh_name_shown` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s name appears where it should**
> We don't have your confirmation that the company's name is shown at its offices and on its letters, invoices, receipts and other publications.
> *Why it matters:* A company shows its name outside its offices and on its letters, invoices, receipts, cheques, orders and publications.
> *If left:* Leaving it off can be fined, and it makes the company look less established.
> *What to do:* Add the full name to your templates and signs, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.NOT_STRUCK_OFF — Not struck off as a non-operating company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 1 —: “Not struck off by the Registrar as a non-operating company”
- **Applies when:** yes
- **Passes when:** `attest.gh_not_struck_off` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has not been struck off**
> We don't have your confirmation that the company is still on the register and has had no strike-off letters from the Registrar. The ORC register isn't connected, so we can't check.
> *Why it matters:* The Registrar can strike off a company it believes is not operating, after two letters and a notice in the Companies Bulletin.
> *If left:* A company struck off loses its legal existence and its assets.
> *What to do:* Answer any letter from the Registrar, keep your filings current, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.CONSTITUTION — Constitution, or the standard one

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 2 —: “Registered constitution is optional; otherwise the Second Schedule applies”
- **Applies when:** yes
- **Passes when:** any of: (`vault.gh_constitution.present` is yes) or (`attest.gh_standard_constitution` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Registered constitution; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s constitution**
> You haven't added the company's registered constitution, or confirmed that it uses the standard one in the Act.
> *Why it matters:* A company may register its own constitution. If it doesn't, the Second Schedule of the Companies Act is its constitution.
> *If left:* Banks and investors ask which rules govern the company.
> *What to do:* Add the registered constitution, or confirm here that the standard one applies.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.MEMBERS_REGISTER — Register of members kept in Ghana

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 2 —: “Register of members kept in Ghana, entries within 28 days”
- **Applies when:** yes
- **Passes when:** any of: (`vault.gh_members_register.present` is yes) or (`attest.gh_members_register` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_enter = 28
- **Evidence:** Register of members; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s register of members**
> You haven't added the register of members, or confirmed it is kept in Ghana and up to date.
> *Why it matters:* A company keeps a register of members in Ghana: names, addresses, shares held and paid, and dates, with each entry made within 28 days.
> *If left:* It is the proof of who owns the company, and investors check it against every share issue.
> *What to do:* Bring the register up to date, and add it here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.BO_PARTICULARS — Beneficial owners recorded in the register of members

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 2 —: “Beneficial-owner particulars held in the register of members”
- **Applies when:** yes
- **Passes when:** `attest.gh_bo_particulars` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} records its beneficial owners**
> We don't have your confirmation that the register of members holds the details of each beneficial owner.
> *Why it matters:* The register of members records each beneficial owner, the nature of their interest, and whether they are a politically exposed person.
> *If left:* The same details go to the Registrar, and banks check them.
> *What to do:* Add the beneficial owners to the register, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.BO_FILING — Beneficial owners filed with the Registrar

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 2 —: “Beneficial owners filed with the Registrar at incorporation”
- **Applies when:** yes
- **Passes when:** `vault.gh_bo_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ORC beneficial ownership filing · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your ORC beneficial ownership filing on file**
> You haven't added your ORC beneficial ownership filing to your documents yet.
> *Why it matters:* New companies give their beneficial owners during registration, and the Registrar keeps them in the central register. It is not public online, so we need your filing.
> *If left:* Banks ask for it when they onboard you, and missing filings are penalised.
> *What to do:* Add the beneficial ownership filing from your ORC registration.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.BO_CHANGES — Beneficial-owner changes filed in time

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 2 —: “Beneficial-owner changes reach the Registrar in 28-day steps”
- **Applies when:** yes
- **Passes when:** `attest.gh_bo_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_per_step = 28
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s beneficial-owner changes reach the Registrar**
> We don't have your confirmation that each change in who owns or controls the company was entered and sent to the Registrar.
> *Why it matters:* A member tells the company of a change within 28 days, the company enters it within 28 days, and then notifies the Registrar.
> *If left:* Out-of-date details mislead banks and are penalised.
> *What to do:* Notify the ORC after each change in ownership, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.ACCOUNTING_RECORDS — Proper accounting records kept

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 3 —: “Proper accounting records kept”
- **Applies when:** yes
- **Passes when:** `attest.gh_accounting_records` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps proper accounting records**
> We don't have your confirmation that the company keeps proper accounting records.
> *Why it matters:* Every company keeps proper accounting records.
> *If left:* Without them the accounts, the audit and any due diligence fall apart.
> *What to do:* Check your bookkeeping is up to date, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.FINANCIAL_STATEMENTS — Audited financial statements sent to members

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 3 —: “Audited financial statements sent to members within 18 months, then yearly”
- **Applies when:** yes
- **Passes when:** any of: (`vault.gh_financial_statements.present` is yes) or (`attest.gh_financial_statements_sent` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** first_months = 18; max_months_apart = 15
- **Evidence:** Audited financial statements; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s latest audited financial statements**
> You haven't added the latest audited financial statements, or confirmed they were sent to members on time.
> *Why it matters:* A company sends members its financial statements, with the auditor's report, within 18 months of incorporation and then every year, no more than 15 months apart.
> *If left:* They go with the annual return, and banks and investors ask for them.
> *What to do:* Have the statements audited and sent to members, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.AGM — Annual general meeting held

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 3 —: “Annual general meeting each year, no more than 15 months apart”
- **Applies when:** yes
- **Passes when:** `vault.gh_agm_minutes.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** AGM minutes, or the written agreement to do without the meeting · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AGM minutes on file**
> You haven't added your AGM minutes to your documents yet.
> *Why it matters:* A company holds an AGM each year, no more than 15 months apart, unless members and auditors agree in writing to do without it.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Hold the meeting, or record the written agreement to skip it, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.ANNUAL_RETURN — Annual return filed with the Registrar

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 3 —: “Annual return to the Registrar every year, within 36 days of sending the accounts”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 3 —: “Private company return carries the accounts and two certifications”
- **Applies when:** yes
- **Passes when:** `vault.gh_annual_return.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_accounts_sent = 36
- **Evidence:** Latest annual return filed with the ORC, or its receipt · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We don't have your latest filed annual return on file**
> You haven't added your latest filed annual return to your documents yet.
> *Why it matters:* Every year a company files an annual return with the Registrar within 36 days of sending its financial statements to members. A private company attaches the statements and certifies it made no public offer.
> *If left:* Late returns are penalised, and a company that stops filing can be struck off.
> *What to do:* File the annual return with the ORC, and add it or the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.DIRECTORS — Two directors, one living in Ghana

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 4 —: “At least two directors, one ordinarily resident in Ghana”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 4 —: “One director resident in the Republic at all times”
- **Applies when:** yes
- **Passes when:** `attest.gh_directors` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** min_directors = 2; min_resident = 1
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has two directors, one living in Ghana**
> We don't have your confirmation that the company has at least two directors, and that at least one lives in Ghana at all times. We don't keep people's addresses, so we can't check.
> *Why it matters:* A company has at least two directors, and at least one of them is ordinarily resident in Ghana at all times.
> *If left:* While no director lives in Ghana, the company cannot enforce the contracts it makes, and fewer than two directors brings a daily penalty.
> *What to do:* Check your directors and where they live, appoint another if needed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.DIRECTOR_DECLARATIONS — Directors' statutory declarations

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 4 —: “Statutory declaration by each director before appointment”
- **Applies when:** yes
- **Passes when:** `vault.gh_director_declarations.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Each director's statutory declaration and consent · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your directors' statutory declarations on file**
> You haven't added your directors' statutory declarations to your documents yet.
> *Why it matters:* Each director makes a statutory declaration before appointment, for example that they have no fraud or dishonesty conviction in the past five years.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add each director's signed declaration, as filed with the ORC.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.OFFICER_CHANGES — Director and secretary changes notified within 28 days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 4 —: “Director and secretary changes notified within 28 days”
- **Applies when:** yes
- **Passes when:** `attest.gh_officer_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_notify = 28
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s director changes reach the Registrar**
> We don't have your confirmation that every change of director or secretary was notified to the Registrar within 28 days.
> *Why it matters:* Each change of director or secretary is notified to the Registrar within 28 days.
> *If left:* Default brings a daily penalty, and a person who left can still appear to act for the company.
> *What to do:* Compare the ORC record with who runs the company today, notify anything missing, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.SECRETARY — Qualified company secretary

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 4 —: “Company Secretary appointed with a qualification listed in s 211”
- **Applies when:** yes
- **Passes when:** `vault.gh_secretary.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Company secretary's written consent and proof of qualification · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your company secretary's consent and qualification on file**
> You haven't added your company secretary's consent and qualification to your documents yet.
> *Why it matters:* Every company has a secretary, a person or firm holding one of the qualifications the Act lists.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Appoint a qualified secretary if you have none, and add their consent and qualification here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CORP.AUDITOR — Auditor appointed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 4 —: “Auditor appointed with written consent”
- **Applies when:** yes
- **Passes when:** `vault.gh_auditor.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Auditor's written consent and appointment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your auditor's consent and appointment on file**
> You haven't added your auditor's consent and appointment to your documents yet.
> *Why it matters:* The directors may appoint the first auditor; after that the members appoint by ordinary resolution. The auditor consents in writing.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Appoint an auditor, and add their written consent and the appointment here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (1)

### GH.IP.EMPLOYEE_WORKS — Work made by employees belongs to the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 5 —: “Copyright in employee and commissioned works vests in the employer or commissioner”
- **Applies when:** `derived.employees` is yes
- **Passes when:** any of: (`vault.gh_employee_ip_clause.present` is yes) or (`attest.gh_employee_ip_clause` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Employment contract IP clause; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see how {company}'s employment contracts handle IP**
> You haven't added an employment contract IP clause, or confirmed that your contracts leave the work with the company.
> *Why it matters:* Economic rights in work made in the course of employment vest in the employer, unless the contract says otherwise.
> *If left:* A contract that says otherwise leaves the product with the employee, and investors check this.
> *What to do:* Check your contracts keep IP with the company. Add the clause here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (12)

### GH.DP.DPC_REGISTRATION — Registered with the Data Protection Commission

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Data Protection Commission |

- **Law cited:** Data Protection Act 2012 (Act 843), ss 27, 50, 53, 56
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 6 —: “Data controller registered with the Data Protection Commission before processing”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 6 —: “DPC registration renewed every two years”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.gh_dpc_certificate.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.gh_dpc_certificate.dated","years":2} (reminder only)
- **Evidence:** DPC registration certificate · **Fix type:** register · **Penalty if left:** severe

**What the company reads when it fails:**

> **We can't see {company}'s registration with the Data Protection Commission**
> You haven't added a current registration certificate from the Data Protection Commission.
> *Why it matters:* A company registers with the Data Protection Commission before processing personal data, and renews every two years. Processing without registration is an offence.
> *If left:* The DPC publishes who is registered, and customers and partners check it.
> *What to do:* Register or renew with the DPC, and add the certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.DP.DPC_CHANGES — Changes notified to the DPC within 14 days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Data Protection Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 6 —: “Changes to registered particulars notified within 14 days”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.gh_dpc_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_notify = 14
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s DPC registration is current**
> We don't have your confirmation that every change to your registered details was notified to the Data Protection Commission.
> *Why it matters:* Changes to the particulars you registered are notified to the DPC within 14 days.
> *If left:* An out-of-date registration may not cover what you do with data.
> *What to do:* Check your registration against what you do today, notify any change, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.DP.PRIVACY_NOTICE — Privacy notice (Data Protection Act)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Data Protection Commission |

- **Law cited:** Data Protection Act 2012 (Act 843), s 27(2)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 6 —: “Privacy notice covers the s 27(2) collection points”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.privacy_notice_found` is yes
- **“To check” when:** all of: (`web.policy.privacy_notice_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a privacy notice on {company}'s website**
> We looked at your website and couldn't find a privacy notice.
> *Why it matters:* People are told what data you collect, who you are, why you collect it, who gets it and their rights.
> *If left:* It's public, so customers, partners and the DPC can all see the gap.
> *What to do:* Publish a notice with those details and link it from every page.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.DP.RETENTION — Personal data kept no longer than needed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Data Protection Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 6 —: “Personal data kept no longer than necessary”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.gh_retention` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} deletes personal data it no longer needs**
> We don't have your confirmation that personal data is kept only as long as needed, unless a law or contract requires longer.
> *Why it matters:* Personal data is not kept longer than the purpose needs, with exceptions for law, contract and similar reasons.
> *If left:* Old data you no longer need is a liability in a breach.
> *What to do:* Set retention periods for each kind of data and delete on schedule, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.DP.BREACH — Security compromise plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Data Protection Commission |

- **Law cited:** Data Protection Act 2012 (Act 843), s 31
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 6 —: “Security compromise notified to the DPC and the data subject”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.gh_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Security compromise response plan and log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your security compromise plan on file**
> You haven't added your security compromise plan to your documents yet.
> *Why it matters:* A compromise is reported to the DPC and the people affected as soon as reasonably practicable, so you need to know who does what first.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the DPC and the people affected, and how fast, keep a log, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.DP.DIRECT_MARKETING — Prior consent and opt-out for marketing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | marketing | tier 5, the company tells us | S2 incorporated, pre-revenue | Data Protection Commission |

- **Law cited:** Data Protection Act 2012 (Act 843), s 40; Electronic Transactions Act 2008 (Act 772), s 50
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 6 —: “Prior written consent for direct marketing”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 9 —: “Unsolicited commercial messages need prior consent and an opt-out”
- **Applies when:** `derived.sends_marketing` is yes
- **Passes when:** `attest.gh_direct_marketing` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s marketing meets the consent rules**
> We don't have your confirmation that your marketing has prior consent and that every message offers a way to unsubscribe.
> *Why it matters:* Direct marketing needs the person's prior written consent, and they can stop it at any time. Commercial messages offer an unsubscribe and, on request, where you got their details.
> *If left:* People who did not agree can complain to the DPC.
> *What to do:* Check how you collect consent and handle unsubscribes, keep records, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.TAX.GRA_REGISTRATION — Registered with the GRA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Ghana Revenue Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 7 —: “Company registered with the GRA for tax”
- **Applies when:** yes
- **Passes when:** `vault.gh_gra_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** GRA registration or company TIN evidence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your GRA registration or TIN evidence on file**
> You haven't added your GRA registration or TIN evidence to your documents yet.
> *Why it matters:* A company registers with the Ghana Revenue Authority for its taxes.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your GRA registration or the document showing the company TIN.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.TAX.VAT_REGISTRATION — VAT registration for goods above GHS 750,000

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S3 revenue, pre-raise | Ghana Revenue Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 7 —: “VAT registration for goods suppliers above GHS 750,000”
- **Applies when:** yes
- **Passes when:** any of: (`vault.gh_vat_certificate.present` is yes) or (`attest.gh_vat_below_threshold` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** goods_threshold_ghs = 750000
- **Abroad:** never follows the company into another country
- **Evidence:** VAT registration certificate; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s VAT registration**
> You haven't added a VAT registration certificate, or confirmed the company is not over the registration threshold.
> *Why it matters:* From 1 January 2026, a company supplying goods registers for VAT once its turnover passes GHS 750,000.
> *If left:* VAT not charged is still owed, with penalties and interest.
> *What to do:* Register with the GRA if you are over the limit and add the certificate, or confirm here that you are not.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.EMP.MONTHLY_PAYROLL — PAYE and SSNIT paid each month

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Ghana Revenue Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 7 —: “PAYE return and payment by the 15th of the following month”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 7 —: “Social security at 18.5% of basic salary, 13.5% to SSNIT within 14 days”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.gh_monthly_payroll` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** paye_day = 15; ssnit_days = 14; total_percent = 18.5; employee_percent = 5.5; employer_percent = 13
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} pays PAYE and social security each month**
> We don't have your confirmation that PAYE is filed and paid by the 15th, and social security paid to SSNIT within 14 days of each following month.
> *Why it matters:* Employers pay PAYE by the 15th of the next month. Social security is 18.5% of basic salary, 5.5% from the employee and 13% from the employer, with 13.5% to SSNIT within 14 days.
> *If left:* Late payments bring penalties, and staff lose pension cover.
> *What to do:* Check with your payroll provider that every month is filed and paid, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.EMP.TIER_TWO_PENSION — Second-tier pension scheme

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 7 —: “Second-tier 5% paid to a corporate trustee scheme”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gh_tier_two_scheme.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Second-tier pension trustee scheme agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your second-tier pension scheme agreement on file**
> You haven't added your second-tier pension scheme agreement to your documents yet.
> *Why it matters:* 5% of basic salary goes to a second-tier scheme run by a corporate trustee.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Join a licensed corporate trustee scheme, and add the agreement here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.EMP.WRITTEN_TERMS — Written contracts and statements of terms

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 7 —: “Written contract for employment of six months or more”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 7 —: “Written statement of main terms within two months of starting”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gh_employment_terms.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employment contracts, or signed statements of main terms · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employment contracts and statements of terms on file**
> You haven't added your employment contracts and statements of terms to your documents yet.
> *Why it matters:* Employment of six months or more is in a written contract, and each worker gets a signed statement of the main terms within two months of starting.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Give every worker a written contract or signed statement, keep them, and add a sample here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.FIN.PAYMENT_LICENCE — Payment service licence (Bank of Ghana)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Bank of Ghana |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 8 —: “Payment service provider licence under Act 987”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 8 —: “Dedicated electronic money issuer (DEMI) licence”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** `vault.gh_payment_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Bank of Ghana payment service provider or electronic money issuer licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Bank of Ghana payment licence on file**
> You haven't added your Bank of Ghana payment licence to your documents yet.
> *Why it matters:* Holding or moving customers' money needs a licence from the Bank of Ghana, or a licensed partner.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Bank of Ghana licence, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (4)

### GH.COM.SUPPLIER_DETAILS — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Electronic Transactions Act 2008 (Act 772), s 47(1)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 9 —: “Online supplier shows full name, legal status, address, phone, email and registration number”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes)
- **Passes when:** any of: (all of: (`web.policy.legal_notice_present` is yes) and (`web.policy.registration_number_shown` is yes)) or (`attest.gh_supplier_details` is yes)
- **“To check” when:** any of: (`web.policy.legal_notice_present` is no) or (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your website; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s supplier details on its website**
> We found a legal page on your website but no company registration number, and you haven't confirmed the details are there.
> *Why it matters:* A business selling online shows its full name, legal status, physical address, phone, email and registration number.
> *If left:* Customers can cancel within 14 days if the details are missing.
> *What to do:* Add the details to a legal or about page linked from every page, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CONSUMER.SALE_INFORMATION — Price, terms and refund policy on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 9 —: “Online supplier shows price, payment, delivery time, terms and refund policy”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 9 —: “Missing s 47 information lets the consumer cancel within 14 days”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes)
- **Passes when:** any of: (all of: (`web.policy.terms_found` is yes) and (`web.policy.refund_policy_found` is yes)) or (`attest.gh_sale_information` is yes)
- **“To check” when:** `web.policy.language_supported` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published terms and refund policy; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find {company}'s terms and refund policy on its website**
> We couldn't find both terms and a refund policy on your website, and you haven't confirmed where customers see them.
> *Why it matters:* Before an online sale, customers see the full price, how to pay, the delivery time, the terms and the refund policy.
> *If left:* Customers can cancel within 14 days if the information is missing.
> *What to do:* Publish your terms and refund policy and link them from checkout, or confirm here where customers see them.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CONSUMER.GRACE_PERIOD — Grace period: 14 days for goods, 7 for services

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Electronic Transactions Act 2008 (Act 772), s 49
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 9 —: “Grace period of 14 days for goods and 7 days for services”
- **Applies when:** all of: (`derived.consumer` is yes) and (all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes))
- **Passes when:** any of: (`web.policy.refund_policy_found` is yes) or (`attest.gh_grace_period` is yes)
- **“To check” when:** all of: (`web.policy.refund_policy_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** goods_days = 14; services_days = 7
- **Evidence:** Your published refund or cancellation page; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see where {company} explains the right to cancel**
> We couldn't find a refund or cancellation page on your website, and you haven't confirmed how customers are told about cancelling.
> *Why it matters:* Consumers buying online can cancel without reason within 14 days for goods and 7 days for services, paying only the direct cost of return.
> *If left:* Refusing a valid cancellation leads to complaints and disputes.
> *What to do:* Publish your cancellation and refund terms and link them from checkout, or confirm here how you tell people.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.CONSUMER.ORDERING — Orders reviewed before purchase and delivered in 14 days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 9 —: “Consumer can review terms, correct errors and withdraw before contracting”
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 9 —: “Orders executed within 14 days unless agreed otherwise”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes)
- **Passes when:** `attest.gh_ordering` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} handles online orders**
> We don't have your confirmation that customers can review and correct an order before it is placed, and that orders are delivered within 14 days unless agreed otherwise.
> *Why it matters:* Customers can review the terms, fix mistakes and withdraw before contracting. Orders are executed within 14 days, and if something is unavailable the customer is told at once and refunded within 7 days.
> *If left:* Mistaken and late orders lead to disputes and refunds.
> *What to do:* Add a review step to checkout and track delivery times, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (3)

### GH.FUND.RETURN_OF_ISSUE — Return of share issue filed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | Office of the Registrar of Companies |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 10 —: “Return of share issue to the Registrar within 28 days”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.gh_return_of_issue.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_file = 28
- **Evidence:** Return of share issue filed with the ORC · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your return of share issue on file**
> You haven't added your return of share issue to your documents yet.
> *Why it matters:* Each issue of shares is returned to the Registrar within 28 days, with the stated capital and the shares issued.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* File the return of issue with the ORC for each round, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.FUND.REGISTER_UPDATED — New shareholders entered within 28 days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 10 —: “New shareholders entered in the register within 28 days”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.gh_register_updated` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s register shows its new shareholders**
> We don't have your confirmation that new shareholders were entered in the register of members within 28 days.
> *Why it matters:* New shareholders are entered in the register of members within 28 days.
> *If left:* Investors check the register against every share issue, and gaps hold up a round.
> *What to do:* Update the register after each issue, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GH.FUND.PRIVATE_LIMITS — No public offer, and 50 members or fewer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 10 —: “Private company makes no public invitation and keeps 50 members or fewer”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.gh_private_limits` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** max_members = 50
- **Evidence:** Your confirmation, with your investor list · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s rounds kept within the private company limits**
> We don't have your confirmation that no round invited the public to buy shares, and that the company has 50 members or fewer.
> *Why it matters:* A private company makes no invitation to the public for its shares and keeps to 50 members, not counting employees, and certifies this with each annual return.
> *If left:* Breaking the limits puts the company outside its form and can unwind a round.
> *What to do:* Count your members and check how each round was offered, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (1)

### GH.AI.AUTOMATED_DECISIONS — Objections to automated decisions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | Data Protection Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ghana-rule-pack-map.md`, Section 11 —: “Right to object to decisions based solely on automated processing”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.personal_data` is yes) and (the answer to “For example, approving credit or rejecting a job applicant” is yes)
- **Passes when:** `attest.gh_automated_decisions` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} handles objections to automated decisions**
> You told us software makes big decisions about people by itself, and we have no confirmation of how you handle objections.
> *Why it matters:* A person can require, by written notice, that a decision that significantly affects them is not based only on automated processing.
> *If left:* Ignoring such a notice is a breach of the Act, and the DPC can act on it.
> *What to do:* Set up a way to receive these notices and have a person review the decision, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (19)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `gh_incorporation_certificate` | Certificate of incorporation | The ORC register is not connected, so the certificate shows the company is registered, under a name ending in "Limited Company" or "LTD". | tier 4 | no | GH.CORP.INCORPORATION |
| `gh_constitution` | Registered constitution | A company may register its own constitution. Without one, the Act's standard constitution applies. | tier 4 | no | GH.CORP.CONSTITUTION |
| `gh_members_register` | Register of members | The company keeps a register of its members in Ghana, with each entry made within 28 days. | tier 5 | no | GH.CORP.MEMBERS_REGISTER |
| `gh_bo_filing` | ORC beneficial ownership filing | New companies give their beneficial owners during registration, and the Registrar keeps them in the central register. It is not public online, so we need your filing. | tier 4 | no | GH.CORP.BO_FILING |
| `gh_financial_statements` | Audited financial statements, with the auditor's report | The first audited statements go to members within 18 months of incorporation, then every calendar year, no more than 15 months apart. | tier 4 | no | GH.CORP.FINANCIAL_STATEMENTS |
| `gh_agm_minutes` | AGM minutes, or the written agreement to do without the meeting | A company holds an AGM each year, no more than 15 months apart, unless members and auditors agree in writing to do without it. | tier 4 | no | GH.CORP.AGM |
| `gh_annual_return` | Latest annual return filed with the ORC, or its receipt | Every year the company files an annual return within 36 days of sending its financial statements to members, with the statements attached. | tier 4 | no | GH.CORP.ANNUAL_RETURN |
| `gh_director_declarations` | Each director's statutory declaration and consent | Each director makes a statutory declaration before appointment, for example that they have no fraud or dishonesty conviction in the past five years. | tier 4 | no | GH.CORP.DIRECTOR_DECLARATIONS |
| `gh_secretary` | Company secretary's written consent and proof of qualification | Every company has a secretary, a person or firm holding one of the qualifications the Act lists. | tier 4 | no | GH.CORP.SECRETARY |
| `gh_auditor` | Auditor's written consent and appointment | The directors may appoint the first auditor; after that the members appoint by ordinary resolution. The auditor consents in writing. | tier 4 | no | GH.CORP.AUDITOR |
| `gh_employee_ip_clause` | Employment contract IP clause | Rights in work made in the course of employment, or on commission, vest in the employer or commissioner unless a contract says otherwise. | tier 5 | no | GH.IP.EMPLOYEE_WORKS |
| `gh_dpc_certificate` | Data Protection Commission registration certificate (current) | A company registers with the DPC before it processes personal data, and renews every two years. We read your certificate for its dates. | tier 4 | yes | GH.DP.DPC_REGISTRATION |
| `gh_breach_plan` | Security compromise response plan and log | A compromise is reported to the DPC and the people affected as soon as reasonably practicable, so you need to know who does what first. | tier 5 | no | GH.DP.BREACH |
| `gh_gra_registration` | GRA registration or company TIN evidence | A company registers with the Ghana Revenue Authority for its taxes. | tier 4 | no | GH.TAX.GRA_REGISTRATION |
| `gh_vat_certificate` | VAT registration certificate | Under the VAT Act 2025, a company supplying goods registers for VAT once its turnover passes GHS 750,000. | tier 4 | no | GH.TAX.VAT_REGISTRATION |
| `gh_tier_two_scheme` | Second-tier pension trustee scheme agreement | 5% of basic salary goes to a second-tier scheme run by a corporate trustee. | tier 4 | no | GH.EMP.TIER_TWO_PENSION |
| `gh_employment_terms` | Employment contracts, or signed statements of main terms | Employment of six months or more is in a written contract, and each worker gets a signed statement of the main terms within two months of starting. | tier 4 | no | GH.EMP.WRITTEN_TERMS |
| `gh_payment_licence` | Bank of Ghana payment service provider or electronic money issuer licence | Holding or moving customers' money needs a licence from the Bank of Ghana, or a licensed partner. | tier 4 | no | GH.FIN.PAYMENT_LICENCE |
| `gh_return_of_issue` | Return of share issue filed with the ORC | Each issue of shares is returned to the Registrar within 28 days, with the stated capital and the shares issued. | tier 4 | no | GH.FUND.RETURN_OF_ISSUE |
