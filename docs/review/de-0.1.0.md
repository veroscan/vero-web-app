# Review: Germany (DE) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** DE, version 0.1.0, 72 rules (0 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `e0528576af83342ecded526d7ce11e155690000ebde7c81c106ab4708929c85a`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (15)

### DE.CORP.COMPANY_PARTICULARS — Company details on letters, forms and website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive (EU) 2017/1132, Art 26
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Company particulars on letters, order forms and website”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 1 —: “Company particulars on business letters and order forms”
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

### DE.CORP.UBO_ANNUAL_CHECK — Yearly check of beneficial-owner details

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

### DE.CORP.STATUS — Company status in the Handelsregister

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 2, licensed vendor | S2 incorporated, pre-revenue | Registergericht (Handelsregister) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Entered in the Handelsregister, active, not in liquidation or insolvency”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 1 —: “Register status read through OpenRegister (licensed vendor)”
- **Applies when:** yes
- **Passes when:** any of: (all of: (`registry.de.openregister.status` is “active”) and (`registry.de.openregister.insolvency_open` is no)) or (`vault.de_register_extract.present` is yes)
- **“To check” when:** `registry.de.openregister.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Handelsregister record (through OpenRegister); Handelsregister extract · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company} is active in the German commercial register**
> We read {company}'s Handelsregister record through OpenRegister, and it doesn't show the company as active with no insolvency proceedings, or you haven't added a current extract.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* A company in liquidation or insolvency can lose control of its assets and contracts.
> *What to do:* Check the record at handelsregister.de and add a current extract here. If the status is wrong, contact the register court.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.NAME_SUFFIX — Legal form in the company name

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 1 —: “Legal-form suffix "Gesellschaft mit beschränkter Haftung" or a recognisable abbreviation in the name”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 1 —: “UG name "Unternehmergesellschaft (haftungsbeschränkt)" or "UG (haftungsbeschränkt)"”
- **Applies when:** yes
- **Passes when:** `attest.de_name_suffix` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s name shows its legal form**
> We don't have your confirmation that the company's name carries "GmbH", or "UG (haftungsbeschränkt)" for a UG, wherever it is used.
> *Why it matters:* A GmbH carries the words or a clear short form of them. A UG with less than EUR 25,000 of capital must call itself "UG (haftungsbeschränkt)".
> *If left:* Using the name without the legal form can make the people acting for the company personally liable.
> *What to do:* Check the name on your website, contracts and invoices, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.ARTICLES — Notarised articles of association (Gesellschaftsvertrag)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 2 —: “Articles of association (Gesellschaftsvertrag) in notarial form, signed by all shareholders”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 2 —: “Amendments to the articles by three-quarters of votes cast, notarised”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Notarised articles”
- **Applies when:** yes
- **Passes when:** `vault.de_articles.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Articles of association (Gesellschaftsvertrag) or model protocol, current version · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your notarised articles of association on file**
> You haven't added your notarised articles of association to your documents yet.
> *Why it matters:* The articles are signed by every shareholder before a notary, and each change needs a notarised resolution.
> *If left:* Banks and investors ask for them, and a gap in your company records can hold up a round.
> *What to do:* Add the current notarised articles, or the model protocol, with every change made since.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.SHARE_CAPITAL — Share capital of at least EUR 25,000, or a UG

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 2, licensed vendor | S2 incorporated, pre-revenue | Registergericht (Handelsregister) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 2 —: “Stammkapital of at least EUR 25,000”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 2 —: “Paid in before filing: a quarter of each share, and EUR 12,500 in total”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “GmbH capital at least EUR 25,000 with the minimum paid in”
- **Applies when:** yes
- **Passes when:** any of: (all of: (`registry.de.openregister.legal_form` is “gmbh”) and (`registry.de.openregister.capital_amount` is at least 25000) and (`registry.de.openregister.capital_currency` is “EUR”)) or (`registry.de.openregister.legal_form` is “ug”) or (`attest.de_share_capital` is yes)
- **“To check” when:** `registry.de.openregister.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** minimum_eur = 25000; paid_in_minimum_eur = 12500; paid_in_share = 0.25
- **Evidence:** Handelsregister record (through OpenRegister); Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company}'s share capital meets the GmbH minimum**
> The register record we read doesn't show a GmbH with at least EUR 25,000 of capital, or a UG, and you haven't confirmed the capital and how much was paid in.
> *Why it matters:* A GmbH has at least EUR 25,000 of share capital. Before registration a quarter of each share, and at least EUR 12,500 in total, is paid in. A UG may have less, but pays it in full.
> *If left:* Capital below the minimum, or not paid in, can make shareholders liable for the difference, and investors check it.
> *What to do:* Check the capital on your register extract and your payment records, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.SHAREHOLDER_LIST — Shareholder list (Gesellschafterliste) on the register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Registergericht (Handelsregister) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 2 —: “Shareholder list (Gesellschafterliste) filed after every change”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Current shareholder list on the register”
- **Applies when:** yes
- **Passes when:** `vault.de_shareholder_list.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Latest shareholder list (Gesellschafterliste) from the Handelsregister · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your current shareholder list on file**
> You haven't added your current shareholder list to your documents yet.
> *Why it matters:* The managing directors, or the notary, file a new list after every change in shareholders or stakes. Only shareholders on the list count against the company.
> *If left:* Investors rely on the list to see who owns the company, and directors are liable for an out-of-date one.
> *What to do:* Download the latest list from the Handelsregister, check it against your cap table, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.UBO — Beneficial owners reported to the Transparenzregister

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Bundesverwaltungsamt |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 2 —: “Beneficial owners reported to the Transparenzregister without undue delay”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Beneficial owners reported to the Transparenzregister”
- **Applies when:** yes
- **Passes when:** `vault.de_transparency_register.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Confirmation of your Transparenzregister entry · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Transparenzregister confirmation on file**
> You haven't added your Transparenzregister confirmation to your documents yet.
> *Why it matters:* Every GmbH and UG reports its beneficial owners to the Transparenzregister without undue delay, and keeps the entry current. It is not open to the public.
> *If left:* Banks ask for it when they onboard you, and a missing entry can be fined.
> *What to do:* Report your beneficial owners at transparenzregister.de, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.BOOKS — Proper books kept

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 3 —: “Managing directors keep proper books”
- **Applies when:** yes
- **Passes when:** `attest.de_books` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps proper books**
> We don't have your confirmation that the managing directors keep the company's books.
> *Why it matters:* The managing directors are responsible for keeping the company's accounting records properly.
> *If left:* Without them the accounts, the tax returns and any due diligence fall apart.
> *What to do:* Check your bookkeeping is up to date, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.ACCOUNTS_ADOPTED — Annual accounts adopted by the shareholders

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 3 —: “Shareholders adopt the accounts within 8 months (small company: 11 months)”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 3 —: “Accounts and management report prepared within 3 months (small company: 6 months)”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Accounts adopted and submitted to the Unternehmensregister each year”
- **Applies when:** yes
- **Passes when:** `vault.de_accounts_resolution.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_after_year_end = 8; months_after_year_end_small = 11
- **Evidence:** Shareholders' resolution adopting the annual accounts · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your shareholder resolution adopting the accounts on file**
> You haven't added your shareholder resolution adopting the accounts to your documents yet.
> *Why it matters:* The shareholders adopt the accounts and decide on the profit within 8 months of the year end, or 11 for a small company.
> *If left:* A profit paid out without adopted accounts can be challenged, and banks and investors ask for the resolution.
> *What to do:* Hold the shareholder vote on the accounts in time, and add the signed resolution here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.ACCOUNTS_FILED — Accounts sent to the Unternehmensregister

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | Unternehmensregister |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 3 —: “Accounts submitted to the Unternehmensregister within 12 months of year end”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Accounts adopted and submitted to the Unternehmensregister each year”
- **Applies when:** yes
- **Passes when:** `vault.de_accounts_submission.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":12} (reminder only)
- **Numbers for you to confirm:** months_after_year_end = 12
- **Evidence:** Unternehmensregister submission confirmation for the latest accounts · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Unternehmensregister submission confirmation on file**
> You haven't added your Unternehmensregister submission confirmation to your documents yet.
> *Why it matters:* Accounts are submitted electronically, in German, at the latest one year after the balance sheet date. Small and micro companies file less. Filed accounts are not read yet, so we need yours.
> *If left:* Late accounts bring fines, and filed accounts are public, so investors and customers notice a gap.
> *What to do:* Submit the accounts to the Unternehmensregister and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.AUDIT — Audit, unless the company is small

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 3 —: “Statutory audit for companies that are not small”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 3 —: “Size classes: small up to EUR 7.5m balance sheet, EUR 15m turnover, 50 employees”
- **Applies when:** yes
- **Passes when:** any of: (`vault.de_audit_report.present` is yes) or (`attest.de_small_company` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** small_balance_sheet_eur = 7500000; small_turnover_eur = 15000000; small_employees = 50
- **Evidence:** Auditor's report; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s audit report, or your confirmation that the company is small**
> You haven't added an auditor's report, or confirmed the company is small enough not to need one.
> *Why it matters:* A company is small if it stays under two of these: EUR 7.5m balance sheet, EUR 15m turnover, 50 employees. Larger companies are audited.
> *If left:* Accounts that needed an audit cannot be adopted without one, and banks and investors ask for it.
> *What to do:* Add the auditor's report, or confirm here that the company is small.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.MANAGING_DIRECTOR — Managing director on the register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 2, licensed vendor | S2 incorporated, pre-revenue | Registergericht (Handelsregister) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 4 —: “One or more managing directors (Geschäftsführer), each a natural person with full capacity”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “At least one eligible managing director on the register”
- **Applies when:** yes
- **Passes when:** any of: (`registry.de.openregister.directors_count` is at least 1) or (`vault.de_register_extract.present` is yes)
- **“To check” when:** `registry.de.openregister.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Handelsregister record (through OpenRegister); Handelsregister extract · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see a managing director for {company} on the register**
> The register record we read shows no current managing director (Geschäftsführer), and you haven't added a current extract.
> *Why it matters:* Every GmbH has at least one managing director, a person with full legal capacity, and each one is registered.
> *If left:* Nobody shows as able to act for the company, which holds up banks and investors.
> *What to do:* Check the record at handelsregister.de, file any missing appointment through a notary, and add a current extract here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.DIRECTOR_ELIGIBLE — Managing directors not disqualified

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 4 —: “Disqualification of managing directors (convictions, professional bans)”
- **Applies when:** yes
- **Passes when:** `attest.de_directors_eligible` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s managing directors may hold the role**
> We don't have your confirmation that no managing director is barred by a conviction, a professional ban or a court-ordered consent requirement. We don't keep people's records, so we can't check.
> *Why it matters:* Some convictions and bans rule a person out as managing director for five years, and each director declares this when registered.
> *If left:* An appointment that breaks the rule is void, and a false declaration is an offence.
> *What to do:* Ask each managing director to check, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.CORP.DIRECTOR_CHANGES — Managing director changes registered

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Registergericht (Handelsregister) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 4 —: “Director changes filed for the Handelsregister”
- **Applies when:** yes
- **Passes when:** `vault.de_register_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Current Handelsregister extract (aktueller Ausdruck) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your register extract showing the current managing directors on file**
> You haven't added your register extract showing the current managing directors to your documents yet.
> *Why it matters:* Every appointment and every end of a managing director's power to represent the company is filed with the register.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Compare the register with who runs the company today, file any change through a notary, and add a current extract here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (3)

### DE.IP.EMPLOYEE_INVENTIONS — Employee inventions reported and claimed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 5 —: “Employee must report a service invention separately, in text form”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 5 —: “Service invention deemed claimed 4 months after a proper report”
- **Applies when:** `derived.employees` is yes
- **Passes when:** any of: (`vault.de_invention_policy.present` is yes) or (`attest.de_employee_inventions` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_deemed_claimed = 4
- **Evidence:** Invention reporting policy; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see how {company} handles employee inventions**
> You haven't added an invention reporting policy, or confirmed how employees report inventions and how you handle them.
> *Why it matters:* Employees report each service invention separately in text form. It counts as claimed by the company unless it is released in text form within 4 months, and the employee is paid for it.
> *If left:* An invention released by mistake stays with the employee, and investors check this.
> *What to do:* Set up a simple way to report inventions and track the 4 months. Add the policy here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.IP.EMPLOYEE_SOFTWARE — Code written by employees at work

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 5 —: “Software written by employees: the employer holds all economic rights”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.de_employee_code_at_work` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s code is written by employees as part of their work**
> We don't have your confirmation that the software your employees write is made in their duties or on your instructions.
> *Why it matters:* German law gives the employer all economic rights in a program an employee writes in their duties, unless agreed otherwise. It does not cover freelancers.
> *If left:* Code written outside that may stay with the person who wrote it, and investors check who owns the product.
> *What to do:* Make sure contracts cover the code each employee writes, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.IP.TRADEMARK — German trade mark

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | DPMA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 5 —: “German trade mark at the DPMA: 10 years from filing, renewable”
- **Applies when:** yes
- **Passes when:** `vault.de_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.de_trademark.dated","years":10} (reminder only)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a German trade mark for {company}**
> You haven't added a trade mark certificate from the DPMA.
> *Why it matters:* Without one, someone else could register a name close to yours in Germany, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand with the DPMA, or as an EU trade mark, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (25)

### DE.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 6 —: “Privacy notice published, read in German”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Impressum under DDG §5, privacy notice naming the competent authority”
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

### DE.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 6 —: “Notice names the competent German supervisory authority”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to the data protection authority of your Land.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming the data protection authority of your Land and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

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

### DE.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** GDPR, Art 8(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Age of digital consent for online services to children”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 6 —: “Children's consent: age 16 for information society services”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Are any of your users under 18?” is yes)
- **Passes when:** `attest.eu_child_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** age_of_digital_consent = 16
- **Same obligation as other packs:** `eu_child_consent` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} gets consent for children**
> We don't have your confirmation of how you handle consent from children who use your service.
> *Why it matters:* Below 16, consent for an online service has to come from a parent as well, where you rely on consent.
> *If left:* Data collected without valid consent has no legal basis, and children's data is watched closely.
> *What to do:* Set up an age check and a parent consent step where you need one, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.de_ropa.present` is yes
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

### DE.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.de_dpa.present` is yes
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

### DE.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

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

### DE.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.de_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to the data protection authority of your Land within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.de_transfers.present` is yes
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

### DE.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 6 —: “Cookie consent under TDDDG §25”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “TDDDG §25 cookie consent on the website”
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

### DE.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 6 —: “Cookie consent under TDDDG §25”
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

### DE.TAX.VAT_VIES — VAT number valid for EU trade

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | VIES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 5 —: “VAT number valid in VIES”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “VAT ID (USt-IdNr) issued by the BZSt on application”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “a USt-IdNr valid in VIES once VAT-registered”
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

### DE.DP.EU_REPRESENTATIVE — EU representative for a company outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the data protection authority of your Land |

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

### DE.DP.DPO — Data protection officer (BDSG threshold)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** BDSG, §38(1); GDPR, Art 37
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 6 —: “DPO where 20 or more persons regularly process personal data by automated means”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPO designated where required”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** any of: (`attest.eu_dpo` is yes) or (`web.policy.dpo_contact` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** persons_regularly_processing = 20
- **Same obligation as other packs:** `eu_dpo` (counted once per company)
- **Evidence:** Your confirmation; Your published privacy notice · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed whether {company} needs a data protection officer**
> We don't have your confirmation that you checked whether you need a data protection officer, and we couldn't find a DPO contact in your privacy notice.
> *Why it matters:* In Germany a company names a data protection officer once 20 or more people regularly handle personal data by computer, and whatever its size if it needs impact assessments or trades in data.
> *If left:* If you need one and have not named one, the data protection authority of your Land can act on it.
> *What to do:* Count the people who handle personal data. If the test is met, name your officer, publish the contact, tell your Land authority, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.DP.EMPLOYEE_DATA — Employee data used only as employment needs

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 6 —: “Processing employee data for employment purposes (BDSG §26)”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.de_employee_data` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} handles its staff's personal data**
> We don't have your confirmation that you use employees' data only as hiring, running or ending their employment needs, and that any consent is in writing with the right to withdraw.
> *Why it matters:* Employers may use staff data as the job needs it. Consent counts only if it is truly free, given the employee's position.
> *If left:* Staff data is one of the first things a works council or authority asks about.
> *What to do:* Check what you collect about staff and why, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.TAX.REGISTRATION — Registered with the tax office

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Finanzamt |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “Tax registration questionnaire within one month of starting business”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Tax registration within one month”
- **Applies when:** yes
- **Passes when:** `vault.de_tax_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_to_register = 1
- **Abroad:** never follows the company into another country
- **Evidence:** Tax office letter giving your tax number (Steuernummer) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your tax office letter with your tax number on file**
> You haven't added your tax office letter with your tax number to your documents yet.
> *Why it matters:* A new company tells the tax office within one month of starting business, through the ELSTER registration form, and gets its tax number.
> *If left:* Without a tax number you cannot invoice properly or file returns, and late registration can be fined.
> *What to do:* File the registration form for a new company on ELSTER, and add the letter with your tax number here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.TAX.VAT_RETURNS — VAT returns filed, or small-business exemption used

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | Finanzamt |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “VAT advance returns by the 10th day; quarterly by default, monthly above EUR 9,000”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “Small-business VAT exemption (Kleinunternehmer): EUR 25,000 prior year and EUR 100,000 current year”
- **Applies when:** yes
- **Passes when:** any of: (`attest.de_vat_returns` is yes) or (`attest.de_small_business_vat` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** small_business_prior_year_eur = 25000; small_business_current_year_eur = 100000
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} files its VAT returns**
> We don't have your confirmation that VAT advance returns are filed on time, or that the company uses the small-business exemption.
> *Why it matters:* VAT advance returns are filed electronically by the 10th day after each month or quarter. Below EUR 25,000 of turnover last year and EUR 100,000 this year, a company may choose not to charge VAT.
> *If left:* Late returns bring surcharges and interest, and VAT not charged is still owed.
> *What to do:* Check with your tax adviser that every period is filed, or that you use the exemption, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.EMP.BETRIEBSNUMMER — Employer number (Betriebsnummer)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Bundesagentur für Arbeit |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “Betriebsnummer from the Bundesagentur für Arbeit”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.de_betriebsnummer.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Betriebsnummer letter from the Bundesagentur für Arbeit · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Betriebsnummer letter on file**
> You haven't added your Betriebsnummer letter to your documents yet.
> *Why it matters:* An employer applies for a Betriebsnummer for each establishment before reporting staff to social insurance.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Apply for your Betriebsnummer with the Bundesagentur für Arbeit, and add the letter here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.EMP.SOCIAL_INSURANCE — Staff reported to social insurance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “Social insurance reports to the collection agency (Krankenkasse)”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.de_social_insurance` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} reports its staff to social insurance**
> We don't have your confirmation that each start and end of employment is reported electronically to the employee's health insurer.
> *Why it matters:* Employers report every employee to the collecting health insurer, with their Betriebsnummer, when employment starts, ends or changes.
> *If left:* Unreported employment brings back payments and fines, and can leave staff uninsured.
> *What to do:* Check with your payroll provider that every employee is reported, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.EMP.WAGE_TAX — Wage tax returns (Lohnsteuer-Anmeldung)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Finanzamt |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “Wage tax return (Lohnsteuer-Anmeldung) by the 10th day after each period”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.de_wage_tax` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} files its wage tax returns**
> We don't have your confirmation that wage tax is reported and paid by the 10th day after each period.
> *Why it matters:* Employers file the wage tax return electronically, monthly by default, and pay the tax withheld from wages.
> *If left:* Late returns bring surcharges, and the managing directors can be liable for unpaid wage tax.
> *What to do:* Check with your payroll provider that every period is filed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.EMP.WRITTEN_TERMS — Written record of employment terms

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “Written record of essential terms (Nachweisgesetz)”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.de_written_terms` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} gives staff their terms in writing**
> We don't have your confirmation that each employee gets their essential terms in writing on time.
> *Why it matters:* Pay, working time and the parties are recorded by the first working day, the start date, place and duties within 7 days, and the rest within a month.
> *If left:* Missing records can be fined and weaken your position in any dispute.
> *What to do:* Check every employee has a signed contract or written statement covering these points, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.EMP.MINIMUM_WAGE — Minimum wage paid

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “Minimum wage EUR 13.90 an hour from 1 Jan 2026”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.de_minimum_wage` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** eur_per_hour_2026 = 13.9; eur_per_hour_from_2027 = 14.6
- **In force:** 2026-01-01 to no end date
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} pays at least the minimum wage**
> We don't have your confirmation that every employee is paid at least the statutory minimum wage.
> *Why it matters:* The minimum wage is EUR 13.90 an hour from 1 January 2026, and EUR 14.60 from 1 January 2027.
> *If left:* Underpayment is fined and the difference has to be paid back.
> *What to do:* Check the hourly pay of everyone on payroll, interns and part-time staff included, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.EMP.OVERTIME_RECORDS — Overtime recorded and kept

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 7 —: “Overtime records beyond the ArbZG §3 daily limit, kept 2 years”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.de_overtime_records` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** years_kept = 2
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} records overtime**
> We don't have your confirmation that time worked beyond the daily limit is recorded and the records kept for 2 years.
> *Why it matters:* Employers record working time beyond the daily limit and keep those records for 2 years.
> *If left:* Missing records are fined, and labour inspectors ask for them.
> *What to do:* Set up time records for your staff, keep them 2 years, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.FIN.PAYMENT_LICENCE — Payment or e-money licence (BaFin)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 4, a document the company uploads | S2 incorporated, pre-revenue | BaFin |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 8 —: “Payment services licence from BaFin”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 8 —: “E-money business licence from BaFin”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** `vault.de_payment_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** BaFin payment or e-money licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payment or e-money licence on file**
> You haven't added your payment or e-money licence to your documents yet.
> *Why it matters:* Holding or moving customers' money needs a licence from BaFin, or a licensed partner.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your BaFin licence, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.FIN.LENDING_LICENCE — Banking or financial services permission (BaFin)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | lending | tier 4, a document the company uploads | S2 incorporated, pre-revenue | BaFin |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 8 —: “Banking business or financial services permission from BaFin (including lending)”
- **Applies when:** `derived.sector.lending` is yes
- **Passes when:** `vault.de_lending_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** BaFin banking or financial services permission · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your BaFin permission on file**
> You haven't added your BaFin permission to your documents yet.
> *Why it matters:* Lending as a business, and many financial services, need written permission from BaFin.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your BaFin permission, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (16)

### DE.COM.WEBSITE_IDENTITY — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Trade register and registration number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “VAT number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 9 —: “Impressum under DDG §5 (name, address, legal form, representative, email, register number, USt-IdNr)”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, 5. The core set: “Impressum under DDG §5”
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

### DE.COM.REGULATOR_NAMED — Your licensing authority, on your website

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

### DE.CONSUMER.PRICES — Clear prices

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

### DE.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

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

### DE.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

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

### DE.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

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

### DE.CONSUMER.ORDER_BUTTON — Order button wording

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 8(2)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Order button says "order with obligation to pay"”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 9 —: “Order button labelled "zahlungspflichtig bestellen"”
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

### DE.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 9 —: “14-day withdrawal period; sending in time is enough”
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

### DE.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 16(m)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Digital content: consent and acknowledgement before immediate supply”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 9 —: “Withdrawal start, the 12 months and 14 days cap, early expiry for digital content”
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

### DE.CONSUMER.WITHDRAWAL_FUNCTION — Online withdrawal button

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

### DE.CONSUMER.COMPLAINTS — How consumers can complain

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

### DE.CONSUMER.ACCESSIBILITY — Accessibility statement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | accessibility | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive (EU) 2019/882
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 8 —: “Accessible e-commerce service and accessibility information (from 28 Jun 2025)”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 8 —: “Microenterprise exemption for services”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 9 —: “Accessibility of consumer e-commerce services (BFSG)”
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

### DE.COM.DSA_CONTACT — Contact point and content rules for your platform

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

### DE.COM.DSA_REPRESENTATIVE — EU legal representative for a platform outside the EU

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

### DE.COM.DSA_POINTS_OF_CONTACT — Published points of contact under the Digital Services Act

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

### DE.CONSUMER.DISPUTE_STATEMENT — Statement on consumer dispute resolution

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 9 —: “Consumer dispute resolution statement on the website and in the terms (VSBG §36)”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.has_website_or_app` is yes)
- **Passes when:** `attest.de_dispute_statement` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** exempt_up_to_employees = 10
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} says whether it takes part in consumer arbitration**
> We don't have your confirmation that your website and terms say whether you will take part in consumer dispute resolution, or that you are exempt.
> *Why it matters:* A company selling to consumers states on its website and in its terms whether it will use a consumer arbitration body, and names it if it does. Companies with 10 or fewer employees are exempt.
> *If left:* Missing statements draw warning letters from competitors and consumer groups.
> *What to do:* Add a short statement to your website and terms, or confirm here that you are exempt.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (4)

### DE.FUND.PROSPECTUS_EXEMPTION — Share offers within a no-prospectus exemption

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

### DE.FUND.CAPITAL_INCREASE — Capital increase notarised and registered

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | Registergericht (Handelsregister) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 10 —: “Capital increase resolution notarised, three-quarters majority”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 10 —: “Subscription declaration (Übernahmeerklärung) notarised or certified”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 10 —: “Registration of the capital increase once the shares are taken up”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.de_capital_increase.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Notarised resolution, subscription declarations and register entry for each capital increase · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your capital increase records on file**
> You haven't added your capital increase records to your documents yet.
> *Why it matters:* A capital increase is a notarised change to the articles. Each investor signs a notarised subscription, and the increase counts only once registered.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the notarised resolution, the subscription declarations and the register entry for each round.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.FUND.SHARE_TRANSFERS — Share transfers by notarial deed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 10 —: “Secondary share sales to investors by notarial deed”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 2 —: “Share transfer and agreement to transfer in notarial form”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.de_share_transfers_notarised` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s share transfers were notarised**
> We don't have your confirmation that every sale or transfer of shares, and every agreement to transfer, was made before a notary.
> *Why it matters:* GmbH shares pass only by notarial deed, and the new shareholder list is filed afterwards.
> *If left:* A transfer without a notary is void, so the buyer may not own the shares at all.
> *What to do:* Check each transfer since the company was set up was notarised, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DE.FUND.SHAREHOLDER_LIST_UPDATED — New shareholder list after each round

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 10 —: “New shareholder list after the round”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.de_shareholder_list.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Latest shareholder list (Gesellschafterliste) from the Handelsregister · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your shareholder list filed after the round on file**
> You haven't added your shareholder list filed after the round to your documents yet.
> *Why it matters:* The managing directors, or the notary, file a new list after every change in shareholders or stakes. Only shareholders on the list count against the company.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Download the list filed after your latest round and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (9)

### DE.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | the data protection authority of your Land |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 6 —: “DPIA required for operations on the DSK list”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.de_dpia.present` is yes
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

### DE.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | the data protection authority of your Land |

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

### DE.AI.ROLES — AI systems list with your role for each

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “Role identified: provider, deployer, importer or distributor of each AI system”
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 11 —: “AI Act obligations apply directly in Germany”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.de_ai_inventory.present` is yes
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

### DE.AI.PROHIBITED_PRACTICES — No banned AI practices

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

### DE.AI.PROHIBITED_GENERATIVE — No AI that makes abusive images of real people

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

### DE.AI.LITERACY — AI literacy for your team

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

### DE.AI.HIGH_RISK — High-risk AI documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Chapter III, as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI (Annex III uses: employment, credit scoring, education”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (any of: (the answer to “What for?” includes “hiring”) or (the answer to “What for?” includes “credit”) or (the answer to “What for?” includes “education”) or (the answer to “What for?” includes “insurance”) or (the answer to “What for?” includes “biometrics”))
- **Passes when:** `vault.de_ai_high_risk.present` is yes
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

### DE.AI.HIGH_RISK_PRODUCTS — High-risk AI in regulated products

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 6(1), as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.sector.healthtech` is yes)
- **Passes when:** `vault.de_ai_annex_i.present` is yes
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

### DE.AI.TRANSPARENCY — AI use disclosed on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-germany-rule-pack-map.md`, Section 11 —: “AI use disclosed on the website”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.has_website` is yes)
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.de_ai_transparency.present` is yes)
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

## Documents this pack asks for (23)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `de_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | DE.DP.ROPA |
| `de_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | DE.DP.PROCESSING_AGREEMENTS |
| `de_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | DE.AI.DPIA |
| `de_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to the data protection authority of your Land within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | DE.DP.BREACH |
| `de_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | DE.DP.TRANSFERS |
| `de_ai_inventory` | List of AI systems, with your role for each | What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system. | tier 5 | no | DE.AI.ROLES |
| `de_ai_high_risk` | High-risk AI documentation (risk management, technical file, conformity, registration) | AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration. | tier 5 | no | DE.AI.HIGH_RISK |
| `de_ai_annex_i` | AI documentation for regulated products (such as medical devices) | AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval. | tier 5 | no | DE.AI.HIGH_RISK_PRODUCTS |
| `de_register_extract` | Current Handelsregister extract (aktueller Ausdruck) | It shows the company is registered, its status, its capital and its managing directors. We read it when the register source is off. | tier 4 | no | DE.CORP.STATUS, DE.CORP.MANAGING_DIRECTOR, DE.CORP.DIRECTOR_CHANGES |
| `de_articles` | Articles of association (Gesellschaftsvertrag) or model protocol, current version | The articles are signed by every shareholder before a notary, and each change needs a notarised resolution. | tier 4 | no | DE.CORP.ARTICLES |
| `de_shareholder_list` | Latest shareholder list (Gesellschafterliste) from the Handelsregister | The managing directors, or the notary, file a new list after every change in shareholders or stakes. Only shareholders on the list count against the company. | tier 4 | no | DE.CORP.SHAREHOLDER_LIST, DE.FUND.SHAREHOLDER_LIST_UPDATED |
| `de_transparency_register` | Confirmation of your Transparenzregister entry | Every GmbH and UG reports its beneficial owners itself, since the register stopped taking them from other registers in 2021. It is not public, so we need your confirmation. | tier 4 | no | DE.CORP.UBO |
| `de_accounts_resolution` | Shareholders' resolution adopting the annual accounts | The shareholders adopt the accounts and decide on the profit within 8 months of the year end, or 11 for a small company. | tier 4 | no | DE.CORP.ACCOUNTS_ADOPTED |
| `de_accounts_submission` | Unternehmensregister submission confirmation for the latest accounts | Accounts are submitted electronically, in German, at the latest one year after the balance sheet date. Small and micro companies file less. Filed accounts are not read yet, so we need yours. | tier 4 | no | DE.CORP.ACCOUNTS_FILED |
| `de_audit_report` | Auditor's report on the annual accounts | A company that is not small has its accounts audited, and they cannot be adopted without it. | tier 4 | no | DE.CORP.AUDIT |
| `de_invention_policy` | Employee invention reporting policy | Employees report service inventions in text form, and the company holds them unless it releases them within 4 months. | tier 5 | no | DE.IP.EMPLOYEE_INVENTIONS |
| `de_trademark` | DPMA trade mark registration certificate | A German mark lasts 10 years from filing and is renewed for 10 more. We read your certificate for its dates. | tier 4 | no | DE.IP.TRADEMARK |
| `de_tax_registration` | Tax office letter giving your tax number (Steuernummer) | A new company tells the tax office within one month of starting business, through the ELSTER registration form, and gets its tax number. | tier 4 | no | DE.TAX.REGISTRATION |
| `de_betriebsnummer` | Betriebsnummer letter from the Bundesagentur für Arbeit | An employer applies for a Betriebsnummer for each establishment before reporting staff to social insurance. | tier 4 | no | DE.EMP.BETRIEBSNUMMER |
| `de_payment_licence` | BaFin payment or e-money licence | Holding or moving customers' money needs a licence from BaFin, or a licensed partner. | tier 4 | no | DE.FIN.PAYMENT_LICENCE |
| `de_lending_licence` | BaFin banking or financial services permission | Lending as a business, and many financial services, need written permission from BaFin. | tier 4 | no | DE.FIN.LENDING_LICENCE |
| `de_capital_increase` | Notarised resolution, subscription declarations and register entry for each capital increase | A capital increase is a notarised change to the articles. Each investor signs a notarised subscription, and the increase counts only once registered. | tier 4 | no | DE.FUND.CAPITAL_INCREASE |
| `de_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | DE.AI.TRANSPARENCY |
