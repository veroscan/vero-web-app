# Review: France (FR) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** FR, version 0.2.0, 72 rules (4 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `da9491b0052235b7813e692920206192a7df44c82b8780cf450b9be4df4ddedb`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (15)

### FR.CORP.COMPANY_PARTICULARS — Company details on letters, forms and website

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

### FR.CORP.UBO_ANNUAL_CHECK — Yearly check of beneficial-owner details

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

### FR.CORP.STATUS — Company status in the national register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Annuaire des Entreprises |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 1 —: “Registered in the national register of companies (RNE)”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 1 —: “Company active, not ceased”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, 5. The core set: “In the RNE and active”
- **Applies when:** yes
- **Passes when:** `registry.fr.recherche_entreprises.status` is “active”
- **A problem (defect) when:** all of: (`registry.fr.recherche_entreprises.identified` is yes) and (`registry.fr.recherche_entreprises.status` is “ceased”)
- **“To check” when:** all of: (`registry.fr.recherche_entreprises.identified` is yes) and (not (`registry.fr.recherche_entreprises.status` is one of “active”, “ceased”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** French business directory record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} shows as ceased in the French business directory**
> We read {company}'s record in the Annuaire des Entreprises, and it shows the company as ceased.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* A company recorded as ceased can have trouble with its bank, its contracts and any fundraising.
> *What to do:* Check the record on annuaire-entreprises.data.gouv.fr. If it is wrong, ask the registry to correct it; if not, get advice today.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.PROOF_OF_REGISTRATION — Proof of registration (RNE attestation or Kbis)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | standing | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 1 —: “Proof of registration (RNE attestation or Kbis extract)”
- **Applies when:** yes
- **Passes when:** `vault.fr_registration_proof.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** RNE registration attestation or Kbis extract · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your proof of registration on file**
> You haven't added your proof of registration to your documents yet.
> *Why it matters:* Banks, investors and large customers ask for an official extract showing the company is registered.
> *If left:* Banks and investors ask for it, and a gap in your company records can hold up a round or a new bank account.
> *What to do:* Download the free registration attestation from INPI, or order a Kbis extract from the greffe, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.REGISTERED_OFFICE — Registered office on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | Annuaire des Entreprises |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 1 —: “Registered office (siège social) stated in the statuts”
- **Applies when:** yes
- **Passes when:** `registry.fr.recherche_entreprises.hq_commune` is yes (or present)
- **“To check” when:** `registry.fr.recherche_entreprises.partially_published` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** French business directory record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s registered office in the French business directory**
> We read {company}'s record in the Annuaire des Entreprises and found no head office town.
> *Why it matters:* Every company has a registered office, stated in its statuts and on the register.
> *If left:* Official letters and legal papers go there, and banks check it matches.
> *What to do:* Check the record and update the registered office on the Guichet unique if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.STATUTS — Statuts

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 2 —: “Statuts adopted and up to date”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, 5. The core set: “Statuts and proof of registration uploaded”
- **Applies when:** yes
- **Passes when:** `vault.fr_statuts.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Statuts (current, certified copy) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your statuts on file**
> You haven't added your statuts to your documents yet.
> *Why it matters:* The statuts set out how the company is run, who decides what, and how shares can be transferred.
> *If left:* Banks and investors ask for it, and a gap in your company records can hold up a round or a new bank account.
> *What to do:* Add the current statuts, with every change made since the company was set up.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.SHARE_MOVEMENTS_REGISTER — Register of share movements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 2 —: “Register of share movements (registre des mouvements de titres)”
- **Applies when:** the answer to “What kind of company is it?” is one of “sas”, “sasu”
- **Passes when:** `attest.fr_share_movements_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its register of share movements**
> We don't have your confirmation that {company} keeps a register recording each share transfer, with its date, holders and number of shares.
> *Why it matters:* In a SAS, a share transfer binds the company only once it is entered in this register.
> *If left:* A transfer that was never entered can be disputed, and investors check the register in due diligence.
> *What to do:* Bring the register up to date with every transfer since the company was set up, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.DECISIONS_REGISTER — Register of shareholder decisions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 2 —: “Register of shareholder decisions (procès-verbaux)”
- **Applies when:** yes
- **Passes when:** any of: (`vault.fr_decisions_register.present` is yes) or (`attest.fr_decisions_register` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Register of decisions; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s register of shareholder decisions**
> You haven't added the register of shareholder decisions, or confirmed that you keep one.
> *Why it matters:* Shareholder decisions are recorded in minutes kept on numbered sheets or in a time-stamped electronic form.
> *If left:* A decision with no minutes is hard to prove, and investors and banks ask for them.
> *What to do:* Keep the minutes of every decision in the register, and add it here or confirm you keep it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.UBO — Beneficial-owner declaration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 2 —: “Beneficial owners declared at registration”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, 5. The core set: “Beneficial-owner declaration uploaded”
- **Applies when:** yes
- **Passes when:** `vault.fr_ubo_declaration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Beneficial-owner declaration (from the Guichet unique) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your beneficial-owner declaration on file**
> You haven't added your beneficial-owner declaration to your documents yet.
> *Why it matters:* Every company declares the people who own more than 25% of it, or control it. The register is not public, so we need your copy.
> *If left:* Banks and investors ask for it, and a gap in your company records can hold up a round or a new bank account.
> *What to do:* Download your declaration from the Guichet unique and add it here. If it was never filed, file it there now.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.UBO_CHANGES — Beneficial-owner update after a change

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 2 —: “Beneficial-owner changes filed within 30 days”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 10 —: “Beneficial-owner update after a round”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.fr_ubo_update.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_change = 30
- **Evidence:** Beneficial-owner update filing receipt · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your beneficial-owner update on file**
> You haven't added your beneficial-owner update to your documents yet.
> *Why it matters:* A change in who owns or controls the company, such as after a round, is filed within 30 days.
> *If left:* Late or missing updates can be fined, and the company can be struck off after formal notice.
> *What to do:* After each change in ownership, file the update on the Guichet unique and add the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.ACCOUNTS_APPROVAL_SARL — Accounts approved within 6 months (SARL)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 3 —: “Accounts approved within 6 months of year end”
- **Applies when:** the answer to “What kind of company is it?” is one of “sarl”, “eurl”
- **Passes when:** `attest.fr_accounts_approved` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":6} (reminder only)
- **Evidence:** Your confirmation; Minutes of the annual meeting · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s partners approved last year's accounts**
> We don't have your confirmation that the partners approved the accounts within 6 months of the year end.
> *Why it matters:* A SARL holds its annual meeting to approve the accounts within 6 months of the year end, unless the court extends it.
> *If left:* Not putting the accounts to the partners can be fined, and the filing deadline runs from the approval.
> *What to do:* Hold the meeting, keep the minutes, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.ACCOUNTS_APPROVAL_SAS — Accounts approved within the period in the statuts (SAS)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 3 —: “Accounts approved within the period set by the statuts”
- **Applies when:** the answer to “What kind of company is it?” is one of “sas”, “sasu”
- **Passes when:** `attest.fr_accounts_approved` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Record of the shareholder decision · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s shareholders approved last year's accounts**
> We don't have your confirmation that the shareholders approved the accounts within the period your statuts set.
> *Why it matters:* In a SAS, the statuts set when the accounts are approved. Dividends have to be paid within 9 months of the year end.
> *If left:* Late approval delays the filing at the greffe, and investors look for approved accounts.
> *What to do:* Approve the accounts by the date in your statuts, record the decision, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.ACCOUNTS_FILING — Annual accounts filed with the greffe

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 3 —: “Annual accounts filed with the greffe”
- **Applies when:** yes
- **Passes when:** `vault.fr_accounts_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_after_approval = 1; months_after_approval_online = 2
- **Evidence:** Accounts filing receipt (récépissé de dépôt) · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We don't have your accounts filing receipt on file**
> You haven't added your accounts filing receipt to your documents yet.
> *Why it matters:* Accounts are filed with the greffe within a month of approval, two if filed online. We cannot read the filing yet, so we need the receipt.
> *If left:* A late filing can be fined, and the court can order it with a daily penalty.
> *What to do:* File the approved accounts with the greffe, online or on paper, and add the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.BOOKS — Accounting books kept

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 3 —: “Books kept (livre-journal, grand livre, annual inventory)”
- **Applies when:** yes
- **Passes when:** `attest.fr_books_kept` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its accounting books**
> We don't have your confirmation that the company keeps a journal, a general ledger and a yearly inventory.
> *Why it matters:* Every company keeps these books, and keeps them for 10 years after the year end.
> *If left:* Without them, accounts and tax returns are hard to back up if anyone asks.
> *What to do:* Check your accountant keeps them for you, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CORP.MANAGEMENT — A président or gérant on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Annuaire des Entreprises |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, 5. The core set: “A président (SAS) or natural-person gérant (SARL) on record”
- **Applies when:** yes
- **Passes when:** `registry.fr.recherche_entreprises.directors_count` is at least 1
- **“To check” when:** `registry.fr.recherche_entreprises.partially_published` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** French business directory record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see who runs {company} in the French business directory**
> We read {company}'s record in the Annuaire des Entreprises and found no director on it.
> *Why it matters:* A SAS is run by a président, and a SARL by one or more gérants. They are recorded on the register.
> *If left:* Nobody shows as able to sign for the company, which holds up banks and investors.
> *What to do:* Check the record and file the appointment on the Guichet unique if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (2)

### FR.IP.EMPLOYEE_WORKS — What French law gives you of employees' work

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 5 —: “Employee-written software belongs to the company”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 5 —: “| Employee inventions |”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.fr_employee_ip_clauses` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s employment contracts cover IP beyond software**
> We don't have your confirmation that your employment contracts give the company employees' designs, text and other work, and deal with inventions.
> *Why it matters:* Software written by employees in their job belongs to the company, but other work needs a clause in the contract. Employees who invent get extra pay.
> *If left:* Without the clause, the company may not own its designs and content, and investors check this.
> *What to do:* Add an IP clause covering all work, and the invention pay rules, to your employment contracts. Then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.IP.TRADEMARK — Trade mark (French or EU)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | INPI |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 5 —: “Trademark filed at INPI (or as an EU trade mark)”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Brand protected by an EU trade mark or a national mark in each operating market”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Renewal every 10 years from filing”
- **Applies when:** yes
- **Passes when:** `vault.fr_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.fr_trademark.dated","years":10} (reminder only)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a trade mark for {company}**
> You haven't added a French or EU trade mark certificate, and we can't look marks up at INPI yet.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand at INPI, or as an EU trade mark, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (24)

### FR.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 6 —: “| Privacy notice published |”
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

### FR.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to the CNIL.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming the CNIL and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

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

### FR.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Art 8(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Age of digital consent for online services to children”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 6 —: “Age of digital consent is 15”
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

### FR.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 6 —: “| Record of processing activities |”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.fr_ropa.present` is yes
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

### FR.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.fr_dpa.present` is yes
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

### FR.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

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

### FR.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.fr_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to the CNIL within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.fr_transfers.present` is yes
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

### FR.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 6 —: “Cookie consent per CNIL rules”
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

### FR.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 6 —: “| Cookie policy |”
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

### FR.TAX.VAT_VIES — VAT number valid for EU trade

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | VIES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 5 —: “VAT number valid in VIES”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 7 —: “VAT: registered once above the franchise thresholds”
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

### FR.DP.EU_REPRESENTATIVE — EU representative for a company outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the CNIL |

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

### FR.DP.DPO — Data protection officer declared to the CNIL

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 3, official list | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Art 37
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 6 —: “DPO designated and declared to the CNIL online”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPO designated where required”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.sensitive_data` is yes)
- **Passes when:** any of: (`registry.fr.cnil_dpo.listed` is yes) or (`attest.eu_dpo` is yes)
- **“To check” when:** `registry.fr.cnil_dpo.listed` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_dpo` (counted once per company)
- **Abroad:** never follows the company into another country
- **Evidence:** CNIL list of designated DPOs; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm whether {company} has declared a data protection officer**
> You told us you handle sensitive data. We didn't find the company's SIREN on the CNIL's list of designated officers, and you haven't confirmed whether you need one.
> *Why it matters:* Companies whose core work is monitoring people at scale, or handling sensitive data at scale, must name an officer and declare them to the CNIL online.
> *If left:* If you need one and haven't declared one, the CNIL can act on it.
> *What to do:* Check whether the tests apply. If they do, declare your officer on the CNIL website. If you already have, confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.DP.DPO_CONTACT — Officer contact in the privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 6 —: “DPO contact in the privacy notice”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_website_or_app` is yes) and (`registry.fr.cnil_dpo.listed` is yes)
- **Passes when:** `web.policy.dpo_contact` is yes
- **“To check” when:** `web.policy.dpo_contact` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see your data protection officer's contact in {company}'s privacy notice**
> Your officer is on the CNIL's list, and we couldn't find their contact in your privacy notice. Our scan may not recognise every wording, so a person will check.
> *Why it matters:* The notice has to give a way to contact your data protection officer.
> *If left:* People with questions about their data have no direct way to reach the right person.
> *What to do:* Add the officer's contact (an email address is enough) to your privacy notice.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.DP.AUDIENCE_MEASUREMENT — Analytics cookies without consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | cookies | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 6 —: “Audience-measurement cookies without consent only if exempt”
- **Applies when:** all of: (`derived.has_website` is yes) and (the answer to “Which of these do you use?” includes “analytics”)
- **Passes when:** `attest.fr_audience_measurement_exempt` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s analytics can run without consent**
> You told us you use analytics, and we don't have your confirmation that it is set up so it can run before people agree.
> *Why it matters:* Analytics can skip consent only if it is used just for your own anonymous statistics, isn't shared and doesn't follow people across sites.
> *If left:* Otherwise it needs consent like any other tracker, and the CNIL checks this.
> *What to do:* Set your analytics up to meet those conditions, or put it behind your consent banner. Then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.TAX.E_INVOICE_RECEIVE — Ready to receive e-invoices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S2 incorporated, pre-revenue | DGFiP |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 7 —: “Able to receive e-invoices through an approved platform”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, 5. The core set: “Able to receive e-invoices”
- **Applies when:** yes
- **Passes when:** `attest.fr_e_invoice_platform` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-09-01 to no end date
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation, with the name of your platform · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} can receive e-invoices**
> We don't have your confirmation that the company has chosen an approved platform to receive electronic invoices.
> *Why it matters:* Since 1 September 2026, every company that pays VAT in France must be able to receive e-invoices through an approved platform.
> *If left:* Suppliers will start sending invoices you have no way to receive.
> *What to do:* Choose an approved platform (plateforme agréée), connect it, then confirm here with its name.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.TAX.E_INVOICE_ISSUE — Sending e-invoices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S2 incorporated, pre-revenue | DGFiP |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 7 —: “Able to receive e-invoices through an approved platform”
- **Applies when:** yes
- **Passes when:** `attest.fr_e_invoice_issue` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2027-09-01 to no end date
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} sends its invoices electronically**
> We don't have your confirmation that the company issues e-invoices and reports through its approved platform.
> *Why it matters:* From 1 September 2027, small and mid-sized companies must also send e-invoices and report transactions.
> *If left:* Paper or PDF invoices stop being accepted, and penalties apply per invoice.
> *What to do:* Switch your invoicing to your approved platform, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.EMP.DPAE — Pre-hiring declaration for each hire — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | URSSAF |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 7 —: “Pre-hiring declaration (DPAE) for each hire”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.fr_dpae` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} declares each hire before they start**
> We don't have your confirmation that a pre-hiring declaration (DPAE) went to URSSAF before each employee started.
> *Why it matters:* Each hire is declared to URSSAF before the first day. The first one opens your employer account.
> *If left:* Missing declarations can be fined per employee and count as undeclared work.
> *What to do:* Check a DPAE was sent for every employee, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.EMP.DSN — Monthly social declaration and pension affiliation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | URSSAF |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 7 —: “Monthly social declaration (DSN) and supplementary pension affiliation”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.fr_dsn` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every month (reminder only)
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} files its monthly social declaration**
> We don't have your confirmation that the monthly social declaration (DSN) is filed, with your supplementary pension affiliation.
> *Why it matters:* Employers file the DSN every month. It reports pay and contributions, and handles pension affiliation.
> *If left:* Late or missing declarations bring penalties and can leave staff without pension rights.
> *What to do:* Check with your payroll provider that each month is filed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.EMP.STAFF_REGISTER — Single staff register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 7 —: “Single staff register (registre unique du personnel)”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.fr_staff_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps a staff register**
> We don't have your confirmation that the company keeps a single staff register.
> *Why it matters:* Every employer keeps one from the first employee or intern, and keeps each entry 5 years after the person leaves.
> *If left:* It is one of the first things a labour inspector asks for.
> *What to do:* Set up the register with everyone who has worked for you, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.EMP.RISK_ASSESSMENT — Workplace risk assessment (DUERP)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 7 —: “Occupational risk assessment (DUERP)”
- **Applies when:** `derived.employees` is yes
- **Passes when:** any of: (`vault.fr_duerp.present` is yes) or (`attest.fr_duerp` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your risk assessment; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s workplace risk assessment**
> You haven't added your workplace risk assessment (DUERP), or confirmed that you have one.
> *Why it matters:* Every employer writes down the risks to staff and how it reduces them.
> *If left:* Not having one can be fined, and it counts against you after any workplace accident.
> *What to do:* Write the assessment, even a short one for office work, and add it here or confirm you have it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.EMP.HEALTH_VISIT — Health visit for each new hire

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 7 —: “Occupational health visit for each hire”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.fr_health_visits` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s new hires had their health visit**
> We don't have your confirmation that each new hire had an occupational health visit.
> *Why it matters:* Each new employee sees the occupational health service after hiring.
> *If left:* Missed visits come up in labour inspections and after accidents.
> *What to do:* Join an occupational health service and book a visit for each hire, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.FIN.PAYMENT_AUTHORISATION — Payment or e-money authorisation (ACPR) — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 4, a document the company uploads | S2 incorporated, pre-revenue | ACPR |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 8 —: “Payment or e-money institution authorisation (ACPR)”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** `vault.fr_payment_authorisation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ACPR payment or e-money authorisation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payment or e-money authorisation on file**
> You haven't added your payment or e-money authorisation to your documents yet.
> *Why it matters:* Holding or moving customers' money needs an authorisation from the ACPR, or a licensed partner.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your ACPR authorisation, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (16)

### FR.COM.REGULATOR_NAMED — Your licensing authority, on your website

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

### FR.CONSUMER.PRICES — Clear prices

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

### FR.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

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

### FR.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

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

### FR.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 6(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Consumer terms with the pre-contract information”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 9 —: “Consumer pre-contract information (CGV)”
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

### FR.CONSUMER.ORDER_BUTTON — Order button wording

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

### FR.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 9 —: “Refund, cancellation and complaints pages”
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

### FR.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

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

### FR.CONSUMER.WITHDRAWAL_FUNCTION — Online withdrawal button

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

### FR.CONSUMER.COMPLAINTS — How consumers can complain

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Complaints route for consumers”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 9 —: “Refund, cancellation and complaints pages”
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

### FR.CONSUMER.ACCESSIBILITY — Accessibility statement

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

### FR.COM.DSA_CONTACT — Contact point and content rules for your platform

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

### FR.COM.DSA_REPRESENTATIVE — EU legal representative for a platform outside the EU

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

### FR.COM.DSA_POINTS_OF_CONTACT — Published points of contact under the Digital Services Act

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

### FR.COM.LEGAL_NOTICE — Legal notice on your website (mentions légales)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** LCEN, Art 1-1
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 9 —: “Website legal notice (mentions légales)”
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, 5. The core set: “Website legal notice (mentions légales) published”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** any of: (all of: (`web.policy.legal_notice_present` is yes) and (`web.policy.registration_number_shown` is yes)) or (`attest.eu_website_identity` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_website_identity` (counted once per company)
- **Evidence:** Your website legal notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s legal notice (mentions légales)**
> We couldn't find a legal notice (mentions légales) with your company number on your website, and you haven't confirmed you have one.
> *Why it matters:* It must show the company's name, registered office, phone, register number, share capital, the person responsible for publication, and the host's name, address and phone.
> *If left:* A missing or incomplete legal notice can be fined, and customers look for it.
> *What to do:* Add a "Mentions légales" page with those details, link it from every page, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.CONSUMER.TERMINATION_FUNCTION — Online cancellation button — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 9 —: “Online termination function ("résilier votre contrat")”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.subscriptions` is yes)
- **Passes when:** `attest.fr_termination_function` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} lets consumers cancel online**
> We don't have your confirmation that consumers who can sign up online can also cancel online, free, with an acknowledgement.
> *Why it matters:* Contracts that can be made online must be easy to end online, through a free and clearly labelled function.
> *If left:* Consumer authorities check this, and making cancelling hard leads to complaints.
> *What to do:* Add a clearly labelled cancel function with an emailed acknowledgement, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (5)

### FR.FUND.PROSPECTUS_EXEMPTION — Share offers within a no-prospectus exemption

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

### FR.FUND.CAPITAL_INCREASE — Shareholder decision on each capital increase

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 10 —: “Capital increase decided by the shareholders”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.fr_capital_increase.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Minutes of each capital increase decision · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your capital increase decisions on file**
> You haven't added your capital increase decisions to your documents yet.
> *Why it matters:* Each capital increase is decided by the shareholders, by the majority the statuts or the law set.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the minutes of the shareholder decision behind each capital increase.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.FUND.PREFERENTIAL_RIGHTS — Shareholders' right to subscribe first (SAS)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 10 —: “Preferential subscription right respected (SAS)”
- **Applies when:** all of: (`derived.invested` is yes) and (the answer to “What kind of company is it?” is one of “sas”, “sasu”)
- **Passes when:** `vault.fr_preferential_rights.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Waivers or exercise records of the preferential subscription right · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your records of the right to subscribe first on file**
> You haven't added your records of the right to subscribe first to your documents yet.
> *Why it matters:* A cash capital increase that ignores the shareholders' right to subscribe first is not valid.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add each shareholder's waiver, or the record of how the right was used, for each capital increase.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.FUND.CAPITAL_INCREASE_FILING — Capital increase published and filed — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 10 —: “Legal notice published and change filed on the Guichet unique”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.fr_capital_increase_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Legal notice and Guichet unique filing receipt for the capital increase · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your capital increase filing on file**
> You haven't added your capital increase filing to your documents yet.
> *Why it matters:* A capital increase is published in a legal notice and filed with the updated statuts.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the legal notice certificate and the filing receipt for each capital increase.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.FUND.SAS_NO_PUBLIC_OFFER — No public offer of shares by a SAS

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 10 —: “SAS makes no public offer outside the allowed exemptions”
- **Applies when:** all of: (`derived.invested` is yes) and (the answer to “What kind of company is it?” is one of “sas”, “sasu”)
- **Passes when:** `attest.fr_sas_no_public_offer` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s share offers stayed private**
> We don't have your confirmation that the company has made no public offer of its shares outside the allowed exemptions.
> *Why it matters:* A SAS may not offer its shares to the public, except under the narrow exemptions the law allows.
> *If left:* An offer outside them can be cancelled, and the people behind it can be fined.
> *What to do:* Check each offer, including any crowdfunding, fits an allowed exemption, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (10)

### FR.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | the CNIL |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.fr_dpia.present` is yes
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

### FR.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | the CNIL |

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

### FR.AI.ROLES — AI systems list with your role for each

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “Role identified: provider, deployer, importer or distributor of each AI system”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.fr_ai_inventory.present` is yes
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

### FR.AI.PROHIBITED_PRACTICES — No banned AI practices

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

### FR.AI.PROHIBITED_GENERATIVE — No AI that makes abusive images of real people

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

### FR.AI.LITERACY — AI literacy for your team

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

### FR.AI.HIGH_RISK — High-risk AI documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Chapter III, as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI (Annex III uses: employment, credit scoring, education”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (any of: (the answer to “What for?” includes “hiring”) or (the answer to “What for?” includes “credit”) or (the answer to “What for?” includes “education”) or (the answer to “What for?” includes “insurance”) or (the answer to “What for?” includes “biometrics”))
- **Passes when:** `vault.fr_ai_high_risk.present` is yes
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

### FR.AI.HIGH_RISK_PRODUCTS — High-risk AI in regulated products

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 6(1), as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.sector.healthtech` is yes)
- **Passes when:** `vault.fr_ai_annex_i.present` is yes
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

### FR.AI.CNIL_GUIDANCE — AI built on personal data, following the CNIL guidance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | the CNIL |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 11 —: “AI built on personal data follows CNIL AI guidance”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.personal_data` is yes)
- **Passes when:** `vault.fr_ai_cnil_guidance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** AI and personal data record (legal basis, DPIA, information, rights) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your record of how your AI follows the CNIL guidance on file**
> You haven't added your record of how your AI follows the CNIL guidance to your documents yet.
> *Why it matters:* The CNIL has practical guidance on AI built with personal data. It is guidance, not law, but the CNIL reads your AI against it.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Write down the legal basis, your DPIA, how you inform people and handle their rights, and any scraping safeguards. Add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FR.AI.TRANSPARENCY — AI use disclosed to users

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-france-rule-pack-map.md`, Section 11 —: “AI use disclosed to users”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.fr_ai_transparency.present` is yes)
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

## Documents this pack asks for (22)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `fr_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | FR.DP.ROPA |
| `fr_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | FR.DP.PROCESSING_AGREEMENTS |
| `fr_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | FR.AI.DPIA |
| `fr_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to the CNIL within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | FR.DP.BREACH |
| `fr_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | FR.DP.TRANSFERS |
| `fr_ai_inventory` | List of AI systems, with your role for each | What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system. | tier 5 | no | FR.AI.ROLES |
| `fr_ai_high_risk` | High-risk AI documentation (risk management, technical file, conformity, registration) | AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration. | tier 5 | no | FR.AI.HIGH_RISK |
| `fr_ai_annex_i` | AI documentation for regulated products (such as medical devices) | AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval. | tier 5 | no | FR.AI.HIGH_RISK_PRODUCTS |
| `fr_registration_proof` | RNE registration attestation or Kbis extract | Banks, investors and large customers ask for an official extract showing the company is registered. | tier 4 | no | FR.CORP.PROOF_OF_REGISTRATION |
| `fr_statuts` | Statuts (current, certified copy) | The statuts set out how the company is run, who decides what, and how shares can be transferred. | tier 4 | no | FR.CORP.STATUTS |
| `fr_decisions_register` | Register of shareholder decisions (procès-verbaux) | It is the official record of every shareholder decision, kept on numbered sheets or in a time-stamped electronic form. | tier 5 | no | FR.CORP.DECISIONS_REGISTER |
| `fr_ubo_declaration` | Beneficial-owner declaration (from the Guichet unique) | The register of beneficial owners is not public, so your copy of the declaration is the only way to show it was made. | tier 4 | no | FR.CORP.UBO |
| `fr_ubo_update` | Beneficial-owner update filing receipt | A change in who owns or controls the company, such as after a round, is filed within 30 days. | tier 4 | no | FR.CORP.UBO_CHANGES |
| `fr_accounts_filing` | Accounts filing receipt (récépissé de dépôt) | Accounts are filed with the greffe within a month of approval, two if filed online. We cannot read the filing yet, so we need the receipt. | tier 4 | no | FR.CORP.ACCOUNTS_FILING |
| `fr_trademark` | INPI or EU trade mark certificate | There is no INPI lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed. | tier 4 | no | FR.IP.TRADEMARK |
| `fr_duerp` | Workplace risk assessment (DUERP) | Every employer writes down the risks to its staff and what it does about them, and updates it each year from 11 staff. | tier 5 | no | FR.EMP.RISK_ASSESSMENT |
| `fr_payment_authorisation` | ACPR payment or e-money authorisation | Holding or moving customers' money needs an authorisation from the ACPR, or a licensed partner. | tier 4 | no | FR.FIN.PAYMENT_AUTHORISATION |
| `fr_capital_increase` | Minutes of each capital increase decision | Each capital increase is decided by the shareholders, by the majority the statuts or the law set. | tier 5 | no | FR.FUND.CAPITAL_INCREASE |
| `fr_preferential_rights` | Waivers or exercise records of the preferential subscription right | A cash capital increase that ignores the shareholders' right to subscribe first is not valid. | tier 5 | no | FR.FUND.PREFERENTIAL_RIGHTS |
| `fr_capital_increase_filing` | Legal notice and Guichet unique filing receipt for the capital increase | A capital increase is published in a legal notice and filed with the updated statuts. | tier 4 | no | FR.FUND.CAPITAL_INCREASE_FILING |
| `fr_ai_cnil_guidance` | AI and personal data record (legal basis, DPIA, information, rights) | The CNIL has practical guidance on AI built with personal data. It is guidance, not law, but the CNIL reads your AI against it. | tier 5 | no | FR.AI.CNIL_GUIDANCE |
| `fr_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | FR.AI.TRANSPARENCY |
