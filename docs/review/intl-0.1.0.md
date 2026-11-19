# Review: International (INTL) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** INTL, version 0.1.0, 26 rules (0 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `4ba01a68cfcdd2897e73ffa2484cd614790959cc3198545fcda7b322b536fc1b`
- **Also applies:** nothing else.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (3)

### INTL.CORP.CONSTITUTION — The company's constitution

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Corporate Bylaws (corporations) / Operating Agreement (LLCs)”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Memorandum of Association; Articles of Association”
- **Applies when:** yes
- **Passes when:** `vault.intl_constitution.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Company constitution (articles, bylaws or statutes) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your company's constitution on file**
> You haven't added your company's constitution to your documents yet.
> *Why it matters:* It sets out how the company is run and what its shares carry. Banks and investors ask for it.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add the current version of your constitution, with any changes made since the company was set up.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.CORP.OWNERS_AGREEMENT — Agreement between the company's first owners

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Founders' Agreement; Founder Vesting Agreement”
- **Applies when:** yes
- **Passes when:** `vault.intl_owners_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Agreement between the company's first owners, with vesting · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your agreement between the company's first owners on file**
> You haven't added your agreement between the company's first owners to your documents yet.
> *Why it matters:* It settles who owns what, and what happens to their shares if one of the people who started the company leaves.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Agree it in writing, have everyone who holds shares from the start sign it, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.CORP.RESOLUTIONS — Board and shareholder decisions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Initial Board of Directors appointment; Initial Board Resolutions; Initial Shareholder Resolutions”
- **Applies when:** yes
- **Passes when:** `vault.intl_resolutions.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Board and shareholder decisions (resolutions or minutes) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your board and shareholder decisions on file**
> You haven't added your board and shareholder decisions to your documents yet.
> *Why it matters:* They record the big decisions: who runs the company, and every time shares were issued.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Gather the signed decisions, starting with the ones that appointed your directors and issued your first shares, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (5)

### INTL.IP.OWNER_ASSIGNMENT — IP assignment from the people who started the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 10 —: “Copyright ownership documentation; assignment agreements; licensing agreements”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “PIIA signed by every founder, employee and contractor”
- **Applies when:** yes
- **Passes when:** `vault.intl_owner_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all founders signed an IP assignment?”
- **Evidence:** Signed IP assignment from each person who started the company · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **The people who started {company} haven't signed their work over to it**
> You don't have a signed IP assignment from each person who started the company.
> *Why it matters:* In many countries, the person who wrote the code or made the work owns it until they sign it over. The company may not own the technology it sells.
> *If left:* Investors check this early, and it usually has to be fixed before money can come in.
> *What to do:* Have each of them sign a short IP assignment to the company, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.IP.STAFF_ASSIGNMENT — IP assignment from employees

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Employee Confidentiality Agreements; IP Assignment Agreements; Employee Invention Assignment Agreements”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.intl_staff_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all employees?”
- **Evidence:** Employment contracts or agreements with an IP clause · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see that {company}'s employees have signed their work over**
> You haven't added employment contracts or agreements that give the company what employees make at work.
> *Why it matters:* Who owns an employee's work depends on the country. A written clause settles it everywhere.
> *If left:* Investors and buyers ask for it, and gaps are slower to fix once people have left.
> *What to do:* Make sure each employment contract has an IP and confidentiality clause, and add the signed versions here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.IP.CONTRACTOR_ASSIGNMENT — IP assignment from contractors

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 10 —: “Work-for-hire agreements”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.intl_contractor_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all contractors?”
- **Evidence:** Signed IP assignment from each contractor · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your contractors may still own what they built for {company}**
> You don't have a signed IP assignment from each contractor who has worked on your product.
> *Why it matters:* In many countries a contractor's work stays theirs unless they sign it over in writing. Paying for it doesn't move it.
> *If left:* Investors check this early, and it usually has to be fixed before money can come in.
> *What to do:* Have each contractor sign an IP assignment to the company, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.IP.NDA — NDA template

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | confidentiality | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “NDA; Confidentiality Agreement”
- **Applies when:** yes
- **Passes when:** `vault.intl_nda.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NDA template · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your NDA template on file**
> You haven't added your NDA template to your documents yet.
> *Why it matters:* You need one before you share anything sensitive with partners, investors or new hires.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add the NDA you use. If you don't have one yet, put a standard mutual NDA in place before your next sensitive conversation.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.IP.OPEN_SOURCE — Open source policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | open_source | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Open Source Software Compliance Policy”
- **Applies when:** yes
- **Passes when:** `vault.intl_open_source.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Open source policy or licence list · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your open source policy on file**
> You haven't added your open source policy to your documents yet.
> *Why it matters:* Investors want to know your code has no licence problems hiding in it.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Write down which open source licences you allow, list what your product uses, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (5)

### INTL.SANCT.SCREENING — Sanctions lists

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | sanctions | tier 3, official list | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “No sanctions or restricted-party matches”
- **Applies when:** yes
- **Passes when:** `registry.sanctions.match` is no
- **A problem (defect) when:** `registry.sanctions.match` is yes
- **“To check” when:** `registry.sanctions.possible_match` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Screening against official sanctions lists · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s name matches an entry on a sanctions list**
> Your company name matched an entry on an official sanctions list. It may be another business with a similar name.
> *Why it matters:* Banks, investors and payment providers in most countries will not work with a party on these lists, so this needs a clear answer quickly.
> *If left:* If it stays unresolved, it can stop your bank account, your payments and any fundraising.
> *What to do:* Get qualified advice today. If it is a false match, keep a note of why, so you have the answer when a bank asks.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “| Privacy Notice |”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.privacy_notice_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a privacy notice on {company}'s website**
> We looked at your website and couldn't find a privacy notice.
> *Why it matters:* Most countries expect a business to tell people what it does with their data. Customers and app stores look for one too.
> *If left:* It's public, so customers, partners and investors can all see the gap.
> *What to do:* Publish a notice that says what data you collect, why, who you share it with and how people can reach you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Data Processing Agreement”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.intl_dpa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data processing agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data processing agreements on file**
> You haven't added your data processing agreements to your documents yet.
> *Why it matters:* If vendors handle personal data for you, this agreement says what they may do with it.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Collect the data processing terms from each vendor that handles personal data for you, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.SEC.INCIDENT_RESPONSE — Incident and data breach plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Incident Response Plan; Data Breach Response Policy”
- **Applies when:** yes
- **Passes when:** `vault.intl_incident_response.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Incident and data breach plan · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your incident and data breach plan on file**
> You haven't added your incident and data breach plan to your documents yet.
> *Why it matters:* Many countries set short deadlines to report a breach, so you need to know who does what first.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who you tell and how fast, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.SEC.POLICIES — Information security policies

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Cybersecurity Policy; Information Security Policy; Access Control Policy”
- **Applies when:** yes
- **Passes when:** `vault.intl_security_policies.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Information security policies · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your information security policies on file**
> You haven't added your information security policies to your documents yet.
> *Why it matters:* Enterprise customers and investors expect these in writing.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write down how you control access, protect data and handle devices, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (5)

### INTL.COM.TERMS — Terms of service

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | terms | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “SaaS Agreement; Product Terms and Conditions; Website Terms of Service”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.terms_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published terms · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find terms of service on {company}'s website**
> We looked at your website and couldn't find terms of service.
> *Why it matters:* Terms set the rules for using your product and limit what you can be blamed for.
> *If left:* Without them, a dispute with a customer is decided without the limits you would have chosen.
> *What to do:* Publish terms of service on your website and link to them where people sign up.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.COM.CUSTOMER_CONTRACTS — Customer contract

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “Software Licence Agreement; Cloud Services Agreement; Service Level Agreement”
- **Applies when:** any of: (`derived.enterprise` is yes) or (`derived.takes_payments` is yes)
- **Passes when:** `vault.intl_customer_contracts.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Customer contract (SaaS, licence or service agreement) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your customer contract on file**
> You haven't added your customer contract to your documents yet.
> *Why it matters:* It is what your customers sign, so investors and buyers read it.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add the standard contract your customers sign, and any version a large customer changed.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.COM.SUPPLIERS — Supplier and partner agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Consultancy Agreement; Supplier Agreement; Commercial Partnership Agreement”
- **Applies when:** yes
- **Passes when:** `vault.intl_suppliers.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Supplier, partner and reseller agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your supplier and partner agreements on file**
> You haven't added your supplier and partner agreements to your documents yet.
> *Why it matters:* Investors want to see what you have agreed with your main partners.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add the agreements with the suppliers and partners your business depends on.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.EMP.CONTRACTS — Employment contracts

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “| Employment agreements |”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.intl_employment_contracts.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employment contracts · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employment contracts on file**
> You haven't added your employment contracts to your documents yet.
> *Why it matters:* Each employee should have written terms, including pay, notice and who owns their work.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Give each employee signed written terms, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.EMP.CONTRACTOR_AGREEMENTS — Contractor agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Independent Contractor Agreements”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.intl_contractor_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Contractor agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your contractor agreements on file**
> You haven't added your contractor agreements to your documents yet.
> *Why it matters:* Each contractor should have one, with clear terms and an IP assignment.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Put a signed agreement in place with each contractor, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (4)

### INTL.EQUITY.CAP_TABLE — Shareholder register and cap table

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | cap_table | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Stock ledger; register of shareholders”
- **Applies when:** yes
- **Passes when:** `vault.intl_cap_table.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Shareholder register or cap table · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your shareholder register and cap table on file**
> You haven't added your shareholder register and cap table to your documents yet.
> *Why it matters:* It is the record of who owns what. It should match every share issue, and investors will not move without it.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Bring your cap table up to date, check it against every share issue, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.EQUITY.SHAREHOLDER_AGREEMENT — Shareholder agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Shareholder Agreement”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.intl_shareholder_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Shareholder agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your shareholder agreement on file**
> You haven't added your shareholder agreement to your documents yet.
> *Why it matters:* It sets out what happens when a shareholder leaves or wants to sell.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your signed shareholder agreement. If you have outside shareholders and no agreement, agree one before the next round.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.FUND.ROUND_DOCUMENTS — Investment documents

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “SAFE Agreement; Convertible Note Agreement; Subscription Agreement”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.intl_round_documents.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** SAFEs, notes and subscription agreements · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your investment documents on file**
> You haven't added your investment documents to your documents yet.
> *Why it matters:* These are the agreements that gave investors their rights.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add every signed investment agreement, and check each one appears in your cap table.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.EQUITY.OPTION_PLAN — Share option plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | employee_equity | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Stock Option Plan; Equity Incentive Plan; Stock Option Grant Agreements”
- **Applies when:** `derived.equity_incentives` is yes
- **Passes when:** `vault.intl_option_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Share option plan and grants · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your share option plan on file**
> You haven't added your share option plan to your documents yet.
> *Why it matters:* Investors will check every option has a plan and an approval behind it.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the plan and each signed grant, with the decision that approved them.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (4)

### INTL.AI.USE_POLICY — AI use policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Acceptable Use Policy”
- **Applies when:** `derived.ai_or_staff_ai` is yes
- **Passes when:** `vault.intl_ai_use_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_use_policy` (counted once per company)
- **Evidence:** AI use policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI use policy on file**
> You haven't added your AI use policy to your documents yet.
> *Why it matters:* It tells your team what they can and cannot put into AI tools.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Write a short policy on which AI tools your team may use and what they must never put into them, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.AI.GOVERNANCE — AI governance policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Governance Policy; AI Safety and Security Policy”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.intl_ai_governance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_governance` (counted once per company)
- **Evidence:** AI governance policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI governance policy on file**
> You haven't added your AI governance policy to your documents yet.
> *Why it matters:* As you grow, this shows who is responsible for your AI decisions.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Name who decides how AI is used in your product, write down how, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.AI.TRANSPARENCY — AI transparency

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “AI Transparency Documentation”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.intl_ai_transparency.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_transparency` (counted once per company)
- **Evidence:** Published AI disclosures; Transparency records · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see where {company} tells people it uses AI**
> We couldn't find an AI disclosure on your website, and you haven't added transparency records.
> *Why it matters:* Some countries already require it, and customers increasingly expect to be told when they are dealing with AI.
> *If left:* Enterprise customers and investors are starting to ask, and you would have no answer ready.
> *What to do:* Say on your website where your product uses AI, or add your transparency records here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### INTL.AI.VENDORS — AI supplier agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Vendor Agreements; AI Supplier Agreements”
- **Applies when:** `derived.ai_third_party_models` is yes
- **Passes when:** `vault.intl_ai_vendors.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_vendors` (counted once per company)
- **Evidence:** AI supplier agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI supplier agreements on file**
> You haven't added your AI supplier agreements to your documents yet.
> *Why it matters:* If you use models from another company, these say what happens to your data and who owns the output.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Save the terms of each AI model or API you use, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (23)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `intl_constitution` | Company constitution (articles, bylaws or statutes) | It sets out how the company is run and what its shares carry. Banks and investors ask for it. | tier 5 | no | INTL.CORP.CONSTITUTION |
| `intl_owners_agreement` | Agreement between the company's first owners, with vesting | It settles who owns what, and what happens to their shares if one of the people who started the company leaves. | tier 5 | no | INTL.CORP.OWNERS_AGREEMENT |
| `intl_resolutions` | Board and shareholder decisions (resolutions or minutes) | They record the big decisions: who runs the company, and every time shares were issued. | tier 5 | no | INTL.CORP.RESOLUTIONS |
| `intl_owner_ip_assignment` | IP assignments from the people who started the company | It makes the company the owner of what they built, including work done before it was set up. | tier 5 | no | INTL.IP.OWNER_ASSIGNMENT |
| `intl_staff_ip_assignment` | Employee IP and confidentiality agreements | A clear written clause removes any doubt about who owns what your team makes. | tier 5 | no | INTL.IP.STAFF_ASSIGNMENT |
| `intl_contractor_ip_assignment` | Contractor IP assignments | In many countries a contractor's work stays theirs unless they assign it in writing. | tier 5 | no | INTL.IP.CONTRACTOR_ASSIGNMENT |
| `intl_nda` | NDA template | You need one before you share anything sensitive with partners, investors or new hires. | tier 5 | no | INTL.IP.NDA |
| `intl_open_source` | Open source policy or licence list | Investors want to know your code has no licence problems hiding in it. | tier 5 | no | INTL.IP.OPEN_SOURCE |
| `intl_dpa` | Data processing agreements | If vendors handle personal data for you, this agreement says what they may do with it. | tier 5 | no | INTL.DP.PROCESSING_AGREEMENTS |
| `intl_incident_response` | Incident and data breach plan | Many countries set short deadlines to report a breach, so you need to know who does what first. | tier 5 | no | INTL.SEC.INCIDENT_RESPONSE |
| `intl_security_policies` | Information security policies | Enterprise customers and investors expect these in writing. | tier 5 | no | INTL.SEC.POLICIES |
| `intl_customer_contracts` | Customer contract (SaaS, licence or service agreement) | It is what your customers sign, so investors and buyers read it. | tier 5 | no | INTL.COM.CUSTOMER_CONTRACTS |
| `intl_suppliers` | Supplier, partner and reseller agreements | Investors want to see what you have agreed with your main partners. | tier 5 | no | INTL.COM.SUPPLIERS |
| `intl_employment_contracts` | Employment contracts | Each employee should have written terms, including pay, notice and who owns their work. | tier 5 | no | INTL.EMP.CONTRACTS |
| `intl_contractor_agreements` | Contractor agreements | Each contractor should have one, with clear terms and an IP assignment. | tier 5 | no | INTL.EMP.CONTRACTOR_AGREEMENTS |
| `intl_cap_table` | Shareholder register or cap table | It is the record of who owns what. It should match every share issue, and investors will not move without it. | tier 5 | no | INTL.EQUITY.CAP_TABLE |
| `intl_shareholder_agreement` | Shareholder agreement | It sets out what happens when a shareholder leaves or wants to sell. | tier 5 | no | INTL.EQUITY.SHAREHOLDER_AGREEMENT |
| `intl_round_documents` | SAFEs, notes and subscription agreements | These are the agreements that gave investors their rights. | tier 5 | no | INTL.FUND.ROUND_DOCUMENTS |
| `intl_option_plan` | Share option plan and grants | Investors will check every option has a plan and an approval behind it. | tier 5 | no | INTL.EQUITY.OPTION_PLAN |
| `intl_ai_use_policy` | AI use policy | It tells your team what they can and cannot put into AI tools. | tier 5 | no | INTL.AI.USE_POLICY |
| `intl_ai_governance` | AI governance policy | As you grow, this shows who is responsible for your AI decisions. | tier 5 | no | INTL.AI.GOVERNANCE |
| `intl_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | INTL.AI.TRANSPARENCY |
| `intl_ai_vendors` | AI supplier agreements | If you use models from another company, these say what happens to your data and who owns the output. | tier 5 | no | INTL.AI.VENDORS |
