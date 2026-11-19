# Review: South Africa (ZA) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** ZA, version 0.1.0, 43 rules (1 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `bc050f55382047087faa967ab1e3c6fe45d36ea587049a602e56d83d71695123`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (13)

### ZA.CORP.CIPC_REGISTRATION — Company registered with CIPC

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 4, a document the company uploads | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 1 —: “Company registered with CIPC and gives its name or registration number on demand”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 1 —: “Private company name ends with "Proprietary Limited" or "(Pty) Ltd."”
- **Applies when:** yes
- **Passes when:** `vault.za_cipc_certificate.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CIPC registration certificate (and latest company disclosure) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CIPC registration certificate on file**
> You haven't added your CIPC registration certificate to your documents yet.
> *Why it matters:* The certificate shows the company is registered with CIPC under a name ending in "(Pty) Ltd", with its registration number.
> *If left:* It's the first thing a bank, investor or buyer asks for.
> *What to do:* Download the registration certificate and a current company disclosure from CIPC, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.REGISTERED_OFFICE — Registered office in South Africa

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 1 —: “Registered office continuously maintained in South Africa”
- **Applies when:** yes
- **Passes when:** `attest.za_registered_office` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps a registered office in South Africa**
> We don't have your confirmation that the company keeps a registered office in South Africa, and that CIPC has the current address.
> *Why it matters:* Every company keeps a registered office in South Africa. A change is filed with CIPC and takes effect at the earliest 5 business days after filing.
> *If left:* Official notices and legal papers go there, and a stale address means you miss them.
> *What to do:* Check the address on your CIPC record, file a change if it is out of date, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.STANDING — Not in business rescue or liquidation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 5, the company tells us | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 1 —: “Business rescue begun by board resolution”
- **Applies when:** yes
- **Passes when:** `attest.za_not_in_rescue` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} is not in business rescue or liquidation**
> We don't have your confirmation that the company is not in business rescue or being wound up. The CIPC register isn't connected, so we can't check.
> *Why it matters:* A board can start business rescue by filing a resolution when the company is in financial distress.
> *If left:* Banks, investors and customers will ask, and contracts often end on rescue or liquidation.
> *What to do:* Check your status on the CIPC record, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.MOI — Memorandum of Incorporation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 2 —: “Memorandum of Incorporation consistent with the Act”
- **Applies when:** yes
- **Passes when:** `vault.za_moi.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Memorandum of Incorporation (MOI), current version · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Memorandum of Incorporation on file**
> You haven't added your Memorandum of Incorporation to your documents yet.
> *Why it matters:* The MOI is the company's constitution. Any part of it that breaks the Companies Act is void.
> *If left:* Banks and investors ask for it, and a gap in your company records can hold up a round.
> *What to do:* Add the current MOI, with every amendment filed with CIPC.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.SECURITIES_REGISTER — Securities register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 2 —: “Securities register established in the prescribed form”
- **Applies when:** yes
- **Passes when:** `vault.za_securities_register.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Securities register (share register) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your securities register on file**
> You haven't added your securities register to your documents yet.
> *Why it matters:* It records every shareholder and the shares issued to each, as soon as practicable after an issue. It is not public, so we need yours.
> *If left:* It is the proof of who owns the company, and investors check it against every share issue.
> *What to do:* Bring the register up to date with every issue and transfer, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.BO_IN_REGISTER — Beneficial owners recorded in the securities register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 2 —: “Natural-person beneficial owners recorded in the securities register”
- **Applies when:** yes
- **Passes when:** `attest.za_bo_in_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} records its beneficial owners**
> We don't have your confirmation that the securities register records the people who ultimately own or control the company, and is updated after each change.
> *Why it matters:* A private company records the prescribed details of its beneficial owners in its securities register, and keeps them current.
> *If left:* The same details go to CIPC, and a mismatch stops your annual return.
> *What to do:* Add the beneficial owners to the register, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.BO_FILING — Beneficial ownership filed with CIPC

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 2 —: “Beneficial ownership filed with CIPC within 10 business days of incorporation”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 3 —: “BO declaration must be current before the annual return can be filed”
- **Applies when:** yes
- **Passes when:** `vault.za_bo_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** business_days_after_incorporation = 10
- **Evidence:** CIPC beneficial ownership filing confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CIPC beneficial ownership filing confirmation on file**
> You haven't added your CIPC beneficial ownership filing confirmation to your documents yet.
> *Why it matters:* Companies file their beneficial owners with CIPC, within 10 business days for companies set up since 24 May 2023. CIPC blocks the annual return until it is current.
> *If left:* CIPC will not accept your annual return without it, and banks ask for it when they onboard you.
> *What to do:* File your beneficial ownership on the CIPC portal, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.BO_CHANGES — Beneficial-owner changes filed within 10 business days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 2 —: “Amended BO declaration within 10 business days of a change”
- **Applies when:** yes
- **Passes when:** `attest.za_bo_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** business_days_after_change = 10
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s beneficial-owner changes reach CIPC**
> We don't have your confirmation that every change in who owns or controls the company was filed with CIPC.
> *Why it matters:* An amended beneficial ownership declaration goes to CIPC within 10 business days of a change.
> *If left:* An out-of-date declaration blocks your annual return and misleads banks.
> *What to do:* File any change on the CIPC portal after each change in ownership, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.AFS — Annual financial statements within 6 months

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 3 —: “Annual financial statements prepared within 6 months of year end”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 3 —: “Board approval and director signature on the AFS”
- **Applies when:** yes
- **Passes when:** any of: (`vault.za_signed_afs.present` is yes) or (`attest.za_afs_prepared` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":6} (reminder only)
- **Evidence:** Signed annual financial statements; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s latest annual financial statements**
> You haven't added last year's signed financial statements, or confirmed they were prepared within 6 months of the year end.
> *Why it matters:* Every company prepares annual financial statements, with a directors' report, within 6 months of its year end. The board approves them and a director signs.
> *If left:* They go with your CIPC annual return, and banks and investors ask for them.
> *What to do:* Prepare and sign the statements, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.ANNUAL_RETURN — CIPC annual return filed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 3 —: “CIPC annual return within 30 business days after the incorporation anniversary”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 3 —: “Financial accountability supplement or AFS filed with the annual return”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 1 —: “Deregistration risk after two years of missing annual returns”
- **Applies when:** yes
- **Passes when:** `vault.za_annual_return.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** business_days_after_anniversary = 30
- **Evidence:** Latest CIPC annual return filing certificate · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We don't have your latest CIPC annual return filing certificate on file**
> You haven't added your latest CIPC annual return filing certificate to your documents yet.
> *Why it matters:* Every company files an annual return with CIPC within 30 business days after its incorporation anniversary. Two or more years missed and CIPC can deregister the company.
> *If left:* Late returns cost penalties, and a deregistered company loses its legal existence.
> *What to do:* File the annual return on the CIPC portal, and add the filing certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.COMPLIANCE_PERSON — Person responsible for Companies Act compliance named

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 3 —: “Compliance person designated in each annual return”
- **Applies when:** yes
- **Passes when:** `attest.za_compliance_person` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed who is responsible for {company}'s Companies Act compliance**
> We don't have your confirmation that each annual return names a director, employee or other person responsible for the company's compliance.
> *Why it matters:* Each annual return designates the person responsible for compliance with the filing duties.
> *If left:* Without a named person, filings slip and nobody is accountable for them.
> *What to do:* Name the person on your next annual return, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.DIRECTORS — At least one director on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 4 —: “Board of at least one director”
- **Applies when:** yes
- **Passes when:** `vault.za_cipc_certificate.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CIPC registration certificate (and latest company disclosure) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CIPC company disclosure showing the directors on file**
> You haven't added your CIPC company disclosure showing the directors to your documents yet.
> *Why it matters:* A private company has at least one director, or more if its MOI says so, and CIPC records them.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Download a current company disclosure from CIPC, check the directors are right, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CORP.AUDIT_OR_REVIEW — Audit or independent review, unless owner-managed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 4 —: “Audit or independent review of the AFS, unless owner-managed”
- **Applies when:** yes
- **Passes when:** any of: (`vault.za_audit_or_review.present` is yes) or (`attest.za_owner_managed` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Auditor's or independent reviewer's report; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s audit or independent review report**
> You haven't added an audit or independent review report, or confirmed that every shareholder is also a director.
> *Why it matters:* A private company has its financial statements audited, or independently reviewed, unless every shareholder is also a director and no rule requires an audit.
> *If left:* Statements without the report they need are incomplete, and banks and investors ask for it.
> *What to do:* Add the report, or confirm here that every shareholder is a director.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (3)

### ZA.IP.EMPLOYEE_WORKS — Work made by employees belongs to the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 5 —: “Works made by employees in the course of employment belong to the employer”
- **Applies when:** `derived.employees` is yes
- **Passes when:** any of: (`vault.za_employee_ip_clause.present` is yes) or (`attest.za_employee_ip_clause` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Employment contract IP clause; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see how {company}'s employment contracts handle IP**
> You haven't added an employment contract IP clause, or confirmed that your contracts leave the work with the company.
> *Why it matters:* Copyright in work made in the course of employment belongs to the employer, unless the contract excludes it.
> *If left:* A contract that gives it back leaves the product with the employee, and investors check this.
> *What to do:* Check your contracts keep IP with the company. Add the clause here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.IP.ASSIGNMENT — IP assigned to the company in writing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 4, a document the company uploads | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 5 —: “Copyright assignment only valid in writing, signed by the assignor”
- **Applies when:** yes
- **Passes when:** `vault.za_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Signed IP assignment agreements (from the people who started the company and contractors) · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your signed IP assignments on file**
> You haven't added your signed IP assignments to your documents yet.
> *Why it matters:* Work by the people who started the company, or by contractors, passes to the company only by a written assignment they sign.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Have each person who wrote code or content for the company sign an IP assignment, and add the signed copies here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.IP.TRADEMARK — South African trade mark

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | CIPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 5 —: “Trade mark registration lasts 10 years, renewable for 10-year periods”
- **Applies when:** yes
- **Passes when:** `vault.za_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.za_trademark.dated","years":10} (reminder only)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a South African trade mark for {company}**
> You haven't added a South African trade mark certificate.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand at the trade marks office, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (16)

### ZA.DP.PRIVACY_NOTICE — Privacy notice (POPIA)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** POPIA, s 18
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Privacy notice given when collecting personal information”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.privacy_notice_found` is yes
- **“To check” when:** all of: (`web.policy.privacy_notice_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a privacy notice on {company}'s website**
> We looked at your website and couldn't find a privacy notice.
> *Why it matters:* People must be told who you are, what you collect and why, who gets it, whether it leaves South Africa, and their rights.
> *If left:* It's public, so customers, partners and the Information Regulator can all see the gap.
> *What to do:* Publish a notice with those details and link it from every page.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.DP.REGULATOR_NAMED — Privacy notice names the Information Regulator

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** POPIA, s 18(1)(h)(v)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Complaint route to the Information Regulator named in the notice”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.za_notice_names_regulator` is yes)
- **“To check” when:** all of: (`web.policy.dpa_named` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s privacy notice doesn't say people can complain to the Information Regulator**
> We couldn't find the Information Regulator named in your privacy notice, and you haven't confirmed it is there.
> *Why it matters:* People must be told they can complain to the Information Regulator, with its contact details.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming the Information Regulator and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.DP.INFORMATION_OFFICER — Information Officer registered with the Regulator

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** POPIA, s 55(2)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Information Officer registered with the Regulator before taking up duties”
- **Applies when:** yes
- **Passes when:** `vault.za_information_officer.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Information Regulator registration certificate for your Information Officer · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Information Officer registration certificate on file**
> You haven't added your Information Officer registration certificate to your documents yet.
> *Why it matters:* Every company has an Information Officer, normally its head, who may take up the role only once registered with the Information Regulator. Registration is not optional.
> *If left:* The Regulator asks for it first in any complaint, and customers ask for it in due diligence.
> *What to do:* Register your Information Officer on the Regulator's eServices portal, and add the certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.DP.PAIA_MANUAL — PAIA manual published

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “PAIA manual compiled, kept updated and published on the website”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Small private companies no longer exempt from the PAIA manual since 1 January 2022”
- **Applies when:** yes
- **Passes when:** `vault.za_paia_manual.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** PAIA manual · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your PAIA manual on file**
> You haven't added your PAIA manual to your documents yet.
> *Why it matters:* Every private body has had to keep a PAIA manual since 1 January 2022, with its contact details and how it processes personal information, published on its website.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write the manual from the Regulator's template, publish it on your website, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.DP.OPERATOR_AGREEMENTS — Written contracts with operators

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** POPIA, ss 19, 21
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Security safeguards, with a written contract for every operator”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.za_operator_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Operator agreements (data processing terms) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your operator agreements on file**
> You haven't added your operator agreements to your documents yet.
> *Why it matters:* Each vendor that handles personal information for you (an operator) is bound by a written contract to keep it secure.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Collect the data processing terms from each vendor that handles personal information for you, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.DP.BREACH — Security compromise plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** POPIA, s 22
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Breach (security compromise) notified to the Regulator and data subjects”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.za_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Security compromise response plan and log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your security compromise plan on file**
> You haven't added your security compromise plan to your documents yet.
> *Why it matters:* A compromise is reported to the Regulator and the people affected as soon as reasonably possible, so you need to know who does what first.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the Regulator and the people affected, and how fast, keep a log, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.DP.CHILDREN — Consent for children's information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** POPIA, ss 34, 35
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Children's information needs prior consent of a competent person”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Are any of your users under 18?” is yes)
- **Passes when:** `attest.za_children_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} gets consent for children's information**
> We don't have your confirmation of how you get a parent's or guardian's consent before using information about children.
> *Why it matters:* Information about anyone under 18 needs the prior consent of a parent or guardian, unless another ground in the Act applies.
> *If left:* Children's information is watched closely, and the Regulator can act on it.
> *What to do:* Set up an age check and a parent consent step, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.DP.DIRECT_MARKETING — Consent and opt-out for electronic marketing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | marketing | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** POPIA, s 69; ECTA, s 45; Consumer Protection Act, s 11
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Electronic direct marketing only with consent or to existing customers”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 9 —: “Unsolicited commercial email offers an unsubscribe and the data source”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 9 —: “Procedure to stop direct marketing on demand”
- **Applies when:** `derived.sends_marketing` is yes
- **Passes when:** `attest.za_direct_marketing` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s marketing messages meet the consent rules**
> We don't have your confirmation that every marketing email or SMS has consent, or goes to an existing customer about similar products, and carries a working opt-out.
> *Why it matters:* Electronic marketing needs consent, asked for once, or an existing customer relationship. Each message names the sender and gives a way to opt out, and opt-outs are honoured.
> *If left:* People who did not agree can complain to the Regulator, and sending after an opt-out is an offence.
> *What to do:* Check how you collect consent and handle opt-outs, keep records, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.DP.TRANSFERS — Lawful basis for information sent abroad

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Regulator |

- **Law cited:** POPIA, s 72
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 6 —: “Transfers outside South Africa on a lawful basis”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.data_outside_home` is yes)
- **Passes when:** `attest.za_transfers` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s basis for sending personal information abroad**
> You told us personal information is held outside South Africa, and we have no confirmation of the basis for sending it there.
> *Why it matters:* Personal information may leave South Africa only to a place with adequate protection, under binding rules or an agreement, with consent, or on another listed ground.
> *If left:* Transfers without a basis are a breach of POPIA, and customers ask about them.
> *What to do:* Check each provider abroad has a contract with data protection terms, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.TAX.INCOME_TAX — Income tax reference number

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S2 incorporated, pre-revenue | SARS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “Income tax registration happens automatically through CIPC”
- **Applies when:** yes
- **Passes when:** `attest.za_income_tax_number` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has its income tax reference number**
> We don't have your confirmation that the company has its SARS income tax reference number.
> *Why it matters:* Companies registered with CIPC are registered for income tax through a link between CIPC and SARS, with no separate application.
> *If left:* Without the number you cannot file returns or get a tax clearance, which banks and customers ask for.
> *What to do:* Check the number on SARS eFiling, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.TAX.PROVISIONAL — Provisional tax twice a year

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | SARS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “Provisional tax returns twice a year”
- **Applies when:** yes
- **Passes when:** `attest.za_provisional_tax` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} files its provisional tax**
> We don't have your confirmation that provisional tax returns are filed and paid on time.
> *Why it matters:* A company files a provisional tax return six months into its year and another at year end, with payment.
> *If left:* Late or low payments bring penalties and interest.
> *What to do:* Check with your accountant that both returns were filed and paid, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.TAX.VAT_REGISTRATION — VAT registration over the compulsory threshold — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | SARS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “VAT registration once taxable supplies pass R2.3 million a year”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “Legal basis of the R2.3 million VAT figure”
- **Applies when:** yes
- **Passes when:** any of: (`attest.za_vat_registered` is yes) or (`attest.za_vat_below_threshold` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed whether {company} must register for VAT**
> We don't have your confirmation that the company is registered for VAT, or that its taxable sales are below the compulsory threshold.
> *Why it matters:* A company registers for VAT once its taxable sales in 12 months pass the compulsory threshold SARS applies.
> *If left:* VAT not charged is still owed, with penalties and interest.
> *What to do:* Check your taxable sales against the current SARS threshold, register on eFiling if you are over it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.EMP.EMPLOYER_REGISTRATION — Registered as an employer with SARS

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | SARS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “Employer registration for employees' tax within 21 business days”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.za_employer_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** business_days_to_register = 21
- **Abroad:** follows the company only where it employs people
- **Evidence:** SARS employer registration (PAYE reference) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your SARS employer registration on file**
> You haven't added your SARS employer registration to your documents yet.
> *Why it matters:* A company registers as an employer with SARS within 21 business days of taking on staff, unless none of them pays tax.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Register for PAYE on SARS eFiling, and add the registration here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.EMP.MONTHLY_PAYROLL — Monthly PAYE, SDL and UIF paid (EMP201)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | SARS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “Monthly EMP201 payment within 7 days after month end”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “UIF contributions registered with SARS or the UI Commissioner”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “Skills Development Levy registration above R500,000 payroll”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.za_emp201` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_month_end = 7
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} pays its monthly payroll taxes**
> We don't have your confirmation that employees' tax, the skills levy where it applies, and UIF are declared and paid each month.
> *Why it matters:* Employers file the EMP201 and pay within 7 days after each month end. The skills levy applies once payroll is expected to pass R500,000 a year.
> *If left:* Late payments bring penalties and interest, and staff lose UIF cover.
> *What to do:* Check with your payroll provider that every month is filed and paid, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.EMP.WRITTEN_PARTICULARS — Written particulars of employment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Basic Conditions of Employment Act, s 29
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “Written particulars of employment given at the start”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.za_employment_particulars.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employment contracts or written particulars · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employment contracts with written particulars on file**
> You haven't added your employment contracts with written particulars to your documents yet.
> *Why it matters:* Each employee gets written particulars of their job when they start, revised when they change, and kept for 3 years after they leave.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Give every employee written particulars, keep them, and add a sample here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.EMP.MINIMUM_WAGE — National minimum wage paid

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 7 —: “National minimum wage of R30.23 per ordinary hour from 1 March 2026”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.za_minimum_wage` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** zar_per_hour = 30.23
- **In force:** 2026-03-01 to no end date
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} pays at least the national minimum wage**
> We don't have your confirmation that every employee is paid at least the national minimum wage.
> *Why it matters:* The national minimum wage is R30.23 for each ordinary hour worked from 1 March 2026.
> *If left:* Underpayment has to be paid back, and labour inspectors can act on it.
> *What to do:* Check the hourly pay of everyone on payroll, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (5)

### ZA.COM.SUPPLIER_DETAILS — Who you are, on your website (ECTA)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** ECTA, s 43(1)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 9 —: “Supplier details on the website where goods or services are sold”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes)
- **Passes when:** any of: (all of: (`web.policy.legal_notice_present` is yes) and (`web.policy.registration_number_shown` is yes)) or (`attest.za_supplier_details` is yes)
- **“To check” when:** any of: (`web.policy.legal_notice_present` is no) or (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your website; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s supplier details on its website**
> We found a legal page on your website but no company registration number, and you haven't confirmed the details are there.
> *Why it matters:* A business selling online shows its full name and legal status, physical address, phone, email, registration number and where it is registered.
> *If left:* Customers can cancel within 14 days if the details are missing.
> *What to do:* Add the details to a legal or about page linked from every page, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CONSUMER.SALE_INFORMATION — Price, terms and returns policy on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** ECTA, s 43(1)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 9 —: “Price, payment, delivery and policy information on the website”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes)
- **Passes when:** any of: (all of: (`web.policy.terms_found` is yes) and (`web.policy.refund_policy_found` is yes)) or (`attest.za_sale_information` is yes)
- **“To check” when:** `web.policy.language_supported` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published terms and returns policy; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find {company}'s terms and returns policy on its website**
> We couldn't find both terms and a returns or refund policy on your website, and you haven't confirmed where customers see them.
> *Why it matters:* Before an online sale, customers see the full price, how to pay, delivery times, the terms, the returns policy and their cooling-off rights.
> *If left:* Customers can cancel within 14 days if the information is missing.
> *What to do:* Publish your terms and returns policy and link them from checkout, or confirm here where customers see them.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CONSUMER.COOLING_OFF — Seven-day cooling-off for online sales

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** ECTA, s 44
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 9 —: “Seven-day cooling-off for online sales”
- **Applies when:** all of: (`derived.consumer` is yes) and (all of: (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes))
- **Passes when:** any of: (`web.policy.refund_policy_found` is yes) or (`attest.za_cooling_off` is yes)
- **“To check” when:** all of: (`web.policy.refund_policy_found` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days = 7; refund_days = 30
- **Evidence:** Your published refund or cancellation page; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see where {company} explains the cooling-off right**
> We couldn't find a refund or cancellation page on your website, and you haven't confirmed how customers are told about cooling off.
> *Why it matters:* Consumers buying online can cancel without reason within 7 days, paying only the direct cost of return, and are refunded within 30 days.
> *If left:* Refusing a valid cancellation leads to complaints and disputes.
> *What to do:* Publish your cancellation and refund terms and link them from checkout, or confirm here how you tell people.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.CONSUMER.PLAIN_LANGUAGE — Consumer documents in plain language

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Consumer Protection Act, s 22
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 9 —: “Consumer documents in plain language”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `attest.za_plain_language` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s consumer documents are in plain language**
> We don't have your confirmation that your terms and notices for consumers are written in plain language.
> *Why it matters:* Documents for consumers must be in plain language that an ordinary consumer can understand.
> *If left:* Unclear terms can be read against you in a dispute.
> *What to do:* Read your consumer terms as a customer would, simplify them, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.COM.NUMBER_ON_INVOICES — Name and registration number on invoices and notices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | website_information | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Companies Act, s 32(4)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 9 —: “Name and registration number on electronic notices and invoices”
- **Applies when:** yes
- **Passes when:** `attest.za_number_on_invoices` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s invoices show its name and registration number**
> We don't have your confirmation that your invoices, receipts, letters and electronic notices show the company's name and registration number.
> *Why it matters:* Every notice and official publication, electronic ones included, and every letter, invoice and receipt, carries the name and registration number.
> *If left:* Leaving them off is an offence, and it makes the company look less established.
> *What to do:* Add both to your invoice, email and letter templates, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (4)

### ZA.FUND.SHARE_ISSUE — Board resolution for each share issue

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** Companies Act, s 38
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 10 —: “Share issue resolved by the board within MOI-authorised shares”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.za_share_issue_resolution.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Board resolution for each share issue · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your board resolution for the share issue on file**
> You haven't added your board resolution for the share issue to your documents yet.
> *Why it matters:* The board issues shares only within the number the MOI authorises. Shares issued beyond it are void unless authorised in time.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the board resolution behind each share issue, and check the MOI authorised enough shares.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.FUND.REGISTER_UPDATED — Securities register updated after each issue

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 10 —: “Register of securities updated after the issue”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.za_register_updated` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s securities register shows its new shareholders**
> We don't have your confirmation that the securities register was updated after each share issue.
> *Why it matters:* New shares and their holders are entered in the securities register as soon as practicable after each issue.
> *If left:* Investors check the register against every share issue, and gaps hold up a round.
> *What to do:* Update the register after each issue, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.FUND.FINANCIAL_ASSISTANCE — Special resolution for financial assistance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 10 —: “Financial assistance for subscribing securities needs a special resolution”
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 10 —: “Loans and other assistance to directors and related parties (s 45)”
- **Applies when:** `derived.invested` is yes
- **Passes when:** any of: (`vault.za_financial_assistance.present` is yes) or (`attest.za_no_financial_assistance` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Special resolution; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed how {company} approved any financial assistance**
> We don't have the special resolution for any loan or guarantee given to people buying shares, directors or related companies, or your confirmation that there was none.
> *Why it matters:* Financial assistance for buying shares, and to directors and related companies, needs a special resolution and a board finding on solvency and fair terms.
> *If left:* Assistance given without them can be void, and directors can be liable.
> *What to do:* Add the special resolution, or confirm here that the company gave no such assistance.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.FUND.NO_PUBLIC_OFFER — Share offers within the exemptions from a prospectus

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** Companies Act, ss 96, 99
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 10 —: “Offer of unlisted securities to the public needs a registered prospectus”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.za_no_public_offer` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation, with your investor list · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s share offers needed no prospectus**
> We don't have your confirmation that each offer of shares went only to people the Act excludes from a public offer, such as professional investors or existing shareholders.
> *Why it matters:* An offer of unlisted shares to the public needs a registered prospectus. Offers to the groups the Act lists are not offers to the public.
> *If left:* An offer made without one can be stopped, and investors can ask for their money back.
> *What to do:* Keep a list of who each offer went to, check it fits an exclusion, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (2)

### ZA.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | Information Regulator |

- **Law cited:** POPIA, s 71
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 11 —: “Automated decisions with legal or substantial effect”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.personal_data` is yes) and (the answer to “For example, approving credit or rejecting a job applicant” is yes)
- **Passes when:** `attest.za_automated_decisions` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s safeguards for automated decisions**
> You told us software makes big decisions about people by itself, and we have no confirmation of your safeguards.
> *Why it matters:* A decision with legal or substantial effect based only on automated profiling needs a contract, a law or code, and a chance for the person to make representations.
> *If left:* A decision made without those safeguards can be challenged, and the Regulator can act on it.
> *What to do:* Explain these decisions in your notice, let people make representations, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### ZA.AI.TRANSPARENCY — AI use disclosed on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-south-africa-rule-pack-map.md`, Section 11 —: “AI use disclosed on the website”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.has_website` is yes)
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.za_ai_transparency.present` is yes)
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

## Documents this pack asks for (19)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `za_cipc_certificate` | CIPC registration certificate (and latest company disclosure) | The CIPC register isn't connected, so the certificate shows the company is registered, its name and number, and the disclosure shows its directors. | tier 4 | no | ZA.CORP.CIPC_REGISTRATION, ZA.CORP.DIRECTORS |
| `za_moi` | Memorandum of Incorporation (MOI), current version | The MOI is the company's constitution. Any part of it that breaks the Companies Act is void. | tier 4 | no | ZA.CORP.MOI |
| `za_securities_register` | Securities register (share register) | It records every shareholder and the shares issued to each, as soon as practicable after an issue. It is not public, so we need yours. | tier 4 | no | ZA.CORP.SECURITIES_REGISTER |
| `za_bo_filing` | CIPC beneficial ownership filing confirmation | Companies file their beneficial owners with CIPC, within 10 business days for companies set up since 24 May 2023. CIPC blocks the annual return until it is current. | tier 4 | no | ZA.CORP.BO_FILING |
| `za_signed_afs` | Signed annual financial statements, with the directors' report | The statements are prepared within 6 months of the year end; the board approves them and a director signs. | tier 4 | no | ZA.CORP.AFS |
| `za_annual_return` | Latest CIPC annual return filing certificate | The annual return is filed within 30 business days after each anniversary of incorporation, with the financial statements or the financial accountability supplement. | tier 4 | no | ZA.CORP.ANNUAL_RETURN |
| `za_audit_or_review` | Auditor's report or independent review report | Most private companies have their statements audited or independently reviewed. Where every shareholder is also a director, neither may be needed. | tier 4 | no | ZA.CORP.AUDIT_OR_REVIEW |
| `za_employee_ip_clause` | Employment contract IP clause | Work made in the course of employment belongs to the employer, unless a contract says otherwise. A clause makes it clear. | tier 5 | no | ZA.IP.EMPLOYEE_WORKS |
| `za_ip_assignment` | Signed IP assignment agreements (from the people who started the company and contractors) | A copyright assignment is valid only in writing, signed by the person assigning it. | tier 4 | no | ZA.IP.ASSIGNMENT |
| `za_trademark` | South African trade mark registration certificate | A registration lasts 10 years and is renewed for 10 more. We read your certificate for its dates. | tier 4 | no | ZA.IP.TRADEMARK |
| `za_information_officer` | Information Regulator registration certificate for your Information Officer | The head of the company is its Information Officer, and may act only once registered with the Information Regulator. There is no public list to check, so we need your certificate. | tier 4 | no | ZA.DP.INFORMATION_OFFICER |
| `za_paia_manual` | PAIA manual | Every private body has had to keep a PAIA manual since 1 January 2022, with its contact details and how it processes personal information, published on its website. | tier 4 | no | ZA.DP.PAIA_MANUAL |
| `za_operator_agreements` | Operator agreements (data processing terms) | Each vendor that handles personal information for you (an operator) is bound by a written contract to keep it secure. | tier 5 | no | ZA.DP.OPERATOR_AGREEMENTS |
| `za_breach_plan` | Security compromise response plan and log | A compromise is reported to the Regulator and the people affected as soon as reasonably possible, so you need to know who does what first. | tier 5 | no | ZA.DP.BREACH |
| `za_employer_registration` | SARS employer registration (PAYE reference) | A company registers as an employer with SARS within 21 business days of taking on staff, unless none of them pays tax. | tier 4 | no | ZA.EMP.EMPLOYER_REGISTRATION |
| `za_employment_particulars` | Employment contracts or written particulars | Each employee gets written particulars of their job when they start, revised when they change, and kept for 3 years after they leave. | tier 4 | no | ZA.EMP.WRITTEN_PARTICULARS |
| `za_share_issue_resolution` | Board resolution for each share issue | The board issues shares only within the number the MOI authorises. Shares issued beyond it are void unless authorised in time. | tier 4 | no | ZA.FUND.SHARE_ISSUE |
| `za_financial_assistance` | Special resolution approving financial assistance | Lending to, or guaranteeing, people buying shares, or directors and related companies, needs a special resolution and a solvency test by the board. | tier 4 | no | ZA.FUND.FINANCIAL_ASSISTANCE |
| `za_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | ZA.AI.TRANSPARENCY |
