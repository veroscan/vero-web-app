# Review: Finland (FI) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** FI, version 0.2.0, 66 rules (4 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `8dbac5f351e0107e4316bdb692872654f833622a56adb9c88ef833a70786b801`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (17)

### FI.CORP.COMPANY_PARTICULARS — Company details on letters, forms and website

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

### FI.CORP.UBO_ANNUAL_CHECK — Yearly check of beneficial-owner details

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

### FI.CORP.STATUS — Company status in the Finnish business register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 1 —: “Company active, not in bankruptcy, liquidation or reorganisation”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Registered in the Trade Register, active, a private Oy”
- **Applies when:** yes
- **Passes when:** all of: (`registry.fi.prh.status` is “active”) and (not (`registry.fi.prh.situations` includes “bankruptcy”)) and (not (`registry.fi.prh.situations` includes “liquidation”)) and (not (`registry.fi.prh.situations` includes “reorganisation”))
- **A problem (defect) when:** all of: (`registry.fi.prh.identified` is yes) and (any of: (`registry.fi.prh.status` is one of “ceased”, “invalidated”) or (`registry.fi.prh.situations` includes “bankruptcy”) or (`registry.fi.prh.situations` includes “liquidation”))
- **“To check” when:** `registry.fi.prh.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Finnish business register (PRH) record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} shows as ceased, bankrupt or in liquidation in the Finnish business register**
> We read {company}'s record in the Finnish business register (PRH), and it shows the company as ceased, its Business ID as invalidated, or a bankruptcy or liquidation.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* A company in this state can have trouble with its bank, its contracts and any fundraising.
> *What to do:* Check the record on ytj.fi. If it is wrong, ask PRH to correct it; if not, get qualified advice today.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.TRADE_REGISTER — Entered in the Trade Register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 1 —: “Registration with the Trade Register within 3 months of signing the memorandum”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Registered in the Trade Register, active, a private Oy”
- **Applies when:** yes
- **Passes when:** `registry.fi.prh.trade_register_status` is “registered”
- **“To check” when:** `registry.fi.prh.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_to_notify_incorporation = 3
- **Evidence:** Finnish business register (PRH) record · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company} as entered in the Finnish Trade Register**
> We read {company}'s record in the Finnish business register (PRH), and it doesn't show the company as entered in the Trade Register.
> *Why it matters:* A new Oy is notified to the Trade Register within 3 months of signing the memorandum of association, or the incorporation lapses.
> *If left:* Until it is registered, the company is not fully formed, and banks and investors will hold back.
> *What to do:* Check the record on ytj.fi. If the company was never notified, get advice on whether it has to be set up again.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.COMPANY_FORM — Company form: private limited company (Oy)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 1 —: “Company form is a private limited company (Oy)”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Registered in the Trade Register, active, a private Oy”
- **Applies when:** yes
- **Passes when:** `registry.fi.prh.company_form_code` is “OY”
- **“To check” when:** `registry.fi.prh.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Finnish business register (PRH) record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} isn't recorded as a private limited company (Oy)**
> We read {company}'s record in the Finnish business register (PRH), and its company form is not a private limited company.
> *Why it matters:* Our Finnish checks are written for a private limited company. Other forms, such as a public company (Oyj), have duties we do not cover yet.
> *If left:* Some results may not fit the company, and some duties may be missing from them.
> *What to do:* Check the company form on ytj.fi. If it is not an Oy, read these results as a starting point only.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.REGISTER_EXTRACT — Trade Register extract showing your office and board

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 1 —: “Registered office and address on record”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 4 —: “Board of 1 to 5 members; a deputy member if fewer than 3”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Board on record”
- **Applies when:** yes
- **Passes when:** `vault.fi_trade_register_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** board_members_min = 1; board_members_max = 5; deputy_needed_below = 3
- **Evidence:** Trade Register extract (kaupparekisteriote) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Trade Register extract on file**
> You haven't added your Trade Register extract to your documents yet.
> *Why it matters:* The Trade Register holds your registered office and your board. A board has 1 to 5 members unless your articles say otherwise, and a deputy member if it has fewer than 3.
> *If left:* PRH can charge a fee when an address or a board is missing after it asks, and banks check both.
> *What to do:* Order a Trade Register extract from PRH and add it here. If your address or board is out of date, file the change with PRH.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.ANNUAL_REVIEW — Yearly review of your Trade Register details

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 1 —: “Annual review of Trade Register information”
- **Applies when:** yes
- **Passes when:** `attest.fi_trade_register_review` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every year on 31 December (reminder only)
- **In force:** 2027-01-01 to no end date
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} reviewed its Trade Register details this year**
> We don't have your confirmation that you checked {company}'s Trade Register details this year and confirmed them to PRH.
> *Why it matters:* From 2027, PRH asks every company to review its Trade Register details once a year, by the end of the year.
> *If left:* PRH can charge a fee if the review is not done after it asks.
> *What to do:* Check your details in the PRH online service, confirm or correct them, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.ARTICLES — Articles of association (yhtiöjärjestys)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 2 —: “Memorandum of association and articles of association (yhtiöjärjestys)”
- **Applies when:** yes
- **Passes when:** `vault.fi_articles.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Articles of association (certified copy from PRH, or the signed memorandum) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your articles of association on file**
> You haven't added your articles of association to your documents yet.
> *Why it matters:* The articles set out how the company is run. A change takes effect only once PRH registers it.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add the current articles as registered with PRH, or the signed memorandum of association with the articles attached.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.SHAREHOLDER_REGISTER — Shareholder register (osakasluettelo)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 2 —: “Shareholder register (osakasluettelo) kept by the board”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Shareholder register kept”
- **Applies when:** yes
- **Passes when:** `vault.fi_shareholder_register.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Shareholder register (osakasluettelo) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your shareholder register on file**
> You haven't added your shareholder register to your documents yet.
> *Why it matters:* The board sets up the shareholder register without delay after incorporation, keeps it reliably, and lets anyone see it at the head office.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Bring the register up to date with every shareholder and every share, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.SHARE_TRANSFERS — Share transfers entered in the shareholder register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 2 —: “Share transfers entered in the register; sole shareholder notified within 2 months”
- **Applies when:** yes
- **Passes when:** `attest.fi_share_transfers_entered` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** sole_shareholder_months = 2
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s share transfers are in its shareholder register**
> We don't have your confirmation that each share transfer was entered in the shareholder register without delay.
> *Why it matters:* Transfers are entered without delay. A sole shareholder's holding is entered no later than two months after the shares were acquired.
> *If left:* A transfer missing from the register is hard to prove, and investors check the register in due diligence.
> *What to do:* Enter every transfer since the company was set up, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.UBO — Beneficial owner notification to PRH

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 2 —: “Beneficial owner notification filed with PRH”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Beneficial owner notification filed”
- **Applies when:** yes
- **Passes when:** `vault.fi_ubo_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Beneficial owner extract from PRH · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your beneficial owner extract on file**
> You haven't added your beneficial owner extract to your documents yet.
> *Why it matters:* Every Oy tells PRH who its beneficial owners are, even when it has none, and files any change without delay.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Download the beneficial owner extract from PRH and add it here. If no notification was ever made, file it with PRH now.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.MINUTES — Board and shareholder decisions minuted

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 2 —: “Board and shareholder decisions minuted”
- **Applies when:** yes
- **Passes when:** any of: (`vault.fi_minutes.present` is yes) or (`attest.fi_minutes_kept` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Minutes of board and shareholder decisions; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s board and shareholder minutes**
> You haven't added the minutes of board and shareholder decisions, or confirmed that you keep them.
> *Why it matters:* Board meetings and shareholder decisions are recorded in minutes that are signed and kept.
> *If left:* A decision with no minutes is hard to prove, and investors and banks ask for them.
> *What to do:* Keep signed minutes of every decision, and add them here or confirm you keep them.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.GENERAL_MEETING — Annual general meeting within 6 months of the year end

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 3 —: “Ordinary general meeting within 6 months of financial year end”
- **Applies when:** yes
- **Passes when:** `attest.fi_general_meeting` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":6} (reminder only)
- **Evidence:** Your confirmation; Minutes of the general meeting · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} held its annual general meeting**
> We don't have your confirmation that the ordinary general meeting was held within 6 months of the end of the financial year.
> *Why it matters:* The ordinary general meeting adopts the financial statements and decides how the profit is used, within 6 months of the year end.
> *If left:* Accounts that were never adopted cannot be filed with PRH on time.
> *What to do:* Hold the meeting, keep the minutes, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.ACCOUNTS_FILING — Financial statements filed with PRH

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 3 —: “Financial statements filed with the Trade Register within 8 months of year end”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 3 —: “Documents filed with the accounts”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Financial statements filed within 8 months of each year end”
- **Applies when:** yes
- **Passes when:** `vault.fi_accounts_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":8} (reminder only)
- **Numbers for you to confirm:** months_after_year_end = 8; months_after_adoption = 2
- **Evidence:** PRH filing receipt for the financial statements, or a Trade Register extract showing them · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We don't have your financial statements filing receipt on file**
> You haven't added your financial statements filing receipt to your documents yet.
> *Why it matters:* Financial statements reach PRH within 8 months of the year end, even for a company that did not trade. PRH open data has no accounts, so we need the receipt.
> *If left:* PRH charges a late filing fee that grows with the delay and doubles after two missed years, and it can later remove the company from the register.
> *What to do:* File the adopted financial statements with PRH, signed and with any audit report, and add the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.EEA_RESIDENCY — Board and managing director meet the EEA residency rule — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 4 —: “At least one board member resident in the EEA, or a PRH exemption”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 4 —: “Managing director (if appointed) resident in the EEA, or a PRH exemption”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Board on record, with at least one EEA-resident member or a PRH exemption”
- **Applies when:** yes
- **Passes when:** `attest.fi_eea_residency` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; PRH exemption decision, if any · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s board meets the EEA residency rule**
> We don't have your confirmation that the board, and the managing director if you have one, meet the rule on living in the EEA. Where people live is not published.
> *Why it matters:* Finnish company law asks that the managing director, and a set part of the board, live in the EEA, unless PRH grants an exemption.
> *If left:* Registrations and bank checks can be held up until it is sorted out.
> *What to do:* Check where each board member and the managing director live. If someone lives outside the EEA, ask PRH for an exemption. Then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.BOARD_ELIGIBILITY — Board members who can lawfully serve

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 4 —: “Board members are natural persons, adult, not bankrupt or under business prohibition”
- **Applies when:** yes
- **Passes when:** `attest.fi_board_eligible` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s board members can serve**
> We don't have your confirmation that each board member is a person rather than a company, an adult, not bankrupt and not banned from business.
> *Why it matters:* Only people can sit on the board of an Oy, and each must be an adult who is not bankrupt or under a business prohibition.
> *If left:* An appointment that breaks this rule is not valid, which can put board decisions in doubt.
> *What to do:* Check each board member against these points, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.CORP.AUDITOR — Auditor appointed when the company passes the size limits — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 4 —: “Auditor appointed when two of three thresholds are exceeded”
- **Applies when:** yes
- **Passes when:** `attest.fi_auditor_checked` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Audit report filed with the accounts · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed whether {company} needs an auditor**
> We don't have your confirmation that you checked whether the company has passed the size limits that call for an auditor, or whether your articles ask for one.
> *Why it matters:* A company that passes two of three size limits (balance sheet, net sales and staff) in both of its last two financial years must appoint an auditor.
> *If left:* Accounts filed without a required audit report are incomplete, and investors and banks look for it.
> *What to do:* Check your last two years against the limits. If you need an auditor, appoint one and file the audit report with your accounts. Then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (3)

### FI.IP.EMPLOYEE_SOFTWARE — Code written by employees as part of their job

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 5 —: “Software written by employees belongs to the employer by law”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.fi_employee_code_in_duties` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s code is written as part of employees' jobs**
> We don't have your confirmation that the software your employees write is part of their job duties.
> *Why it matters:* Finnish law gives the employer the copyright in programs, related works and databases that employees make as part of their duties. It does not cover contractors or anyone who is not an employee.
> *If left:* Code written outside someone's duties may stay theirs, and investors check who owns the product.
> *What to do:* Make sure job descriptions or contracts cover the code each employee writes, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.IP.EMPLOYEE_INVENTIONS — Employee inventions reported and claimed in time

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 5 —: “Employee inventions: notice to employer; employer claims within 4 months; reasonable compensation”
- **Applies when:** all of: (`derived.employees` is yes) and (the answer to “Do you have technology you might want to patent?” is yes)
- **Passes when:** any of: (`vault.fi_invention_policy.present` is yes) or (`attest.fi_invention_policy` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_to_claim = 4
- **Evidence:** Invention policy and notices; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see how {company} handles employee inventions**
> You haven't added an invention policy, or confirmed how employees report inventions and how you claim them.
> *Why it matters:* An employee who makes an invention must tell the employer in writing without delay. The employer has 4 months from the notice to claim it, and owes reasonable pay for it.
> *If left:* An invention not claimed in time stays with the employee, and investors check this for patentable technology.
> *What to do:* Set up a short invention policy with a notice form and a claim step, and add it here or confirm you have one.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.IP.TRADEMARK — Trade mark (Finnish or EU)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 5 —: “Finnish trademark registered with PRH”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Brand protected by an EU trade mark or a national mark in each operating market”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Renewal every 10 years from filing”
- **Applies when:** yes
- **Passes when:** `vault.fi_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.fi_trademark.dated","years":10} (reminder only)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a trade mark for {company}**
> You haven't added a Finnish or EU trade mark certificate, and we can't look marks up at PRH yet.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand with PRH, or as an EU trade mark, or add your certificate here. Renew it every 10 years.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (18)

### FI.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent that meet the GDPR and section 205”
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

### FI.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 6 —: “Supervisory authority is the Data Protection Ombudsman”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to the Data Protection Ombudsman.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming the Data Protection Ombudsman and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

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

### FI.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** GDPR, Art 8(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Age of digital consent for online services to children”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 6 —: “Children's consent age 13 for information society services”
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

### FI.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.fi_ropa.present` is yes
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

### FI.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.fi_dpa.present` is yes
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

### FI.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

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

### FI.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

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
> *If left:* If you need one and haven't named one, the Data Protection Ombudsman can act on it.
> *What to do:* Check whether the tests apply to you. If they do, name your officer, publish the contact, tell the Data Protection Ombudsman, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.fi_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to the Data Protection Ombudsman within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.fi_transfers.present` is yes
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

### FI.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 6 —: “Cookie consent under Act on Electronic Communications Services s 205”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent that meet the GDPR and section 205”
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

### FI.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 6 —: “Cookie consent under Act on Electronic Communications Services s 205”
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

### FI.TAX.VAT_VIES — VAT number valid for EU trade

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | VIES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 5 —: “VAT number valid in VIES”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 7 —: “VAT registration once turnover exceeds EUR 20,000 in a calendar year”
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

### FI.DP.EU_REPRESENTATIVE — EU representative for a company outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

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

### FI.TAX.VAT_REGISTER — On the VAT register once sales pass the threshold

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | the Finnish Tax Administration |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 7 —: “VAT registration once turnover exceeds EUR 20,000 in a calendar year”
- **Applies when:** yes
- **Passes when:** any of: (`registry.fi.prh.in_vat_register` is yes) or (`attest.fi_vat_below_threshold` is yes)
- **“To check” when:** `registry.fi.prh.in_vat_register` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** threshold_eur_per_calendar_year = 20000
- **Abroad:** never follows the company into another country
- **Evidence:** Finnish business register (PRH) record; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} isn't on the Finnish VAT register**
> We read {company}'s record in the Finnish business register, and it isn't on the VAT register. You haven't told us your sales are below the threshold.
> *Why it matters:* A company registers for VAT once its sales pass EUR 20,000 in a calendar year, from the day they pass it.
> *If left:* Late registration is backdated to that day, so VAT you didn't charge can still be due.
> *What to do:* Check your sales this year. If they are over EUR 20,000, register with the Tax Administration. If not, confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.EMP.EMPLOYER_REGISTER — On the employer register as a regular employer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 1, official source, read live | S2 incorporated, pre-revenue | the Finnish Tax Administration |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 7 —: “Employer register for regular employers”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, 5. The core set: “Employer register entry once a regular employer”
- **Applies when:** `derived.employees` is yes
- **Passes when:** any of: (`registry.fi.prh.in_employer_register` is yes) or (`attest.fi_occasional_employer` is yes)
- **“To check” when:** `registry.fi.prh.in_employer_register` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Finnish business register (PRH) record; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} isn't on the Finnish employer register**
> We read {company}'s record in the Finnish business register, and it isn't on the employer register. You haven't told us you only employ people now and then.
> *Why it matters:* A regular employer must be on the employer register: one that regularly pays 2 or more employees, or 1 plus temporary staff, or 6 or more at once.
> *If left:* The register is public, so partners and customers who check it won't find you there.
> *What to do:* If you are a regular employer, register with the Tax Administration. If you only employ people now and then, confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.EMP.INCOMES_REGISTER — Wages reported to the Incomes Register — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 7 —: “Wages and contributions reported to the Incomes Register”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.fi_incomes_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} reports wages to the Incomes Register**
> We don't have your confirmation that each wage payment, and the contributions on it, is reported to the Incomes Register.
> *Why it matters:* Employers in Finland report wages and contributions to the Incomes Register.
> *If left:* Gaps in reporting come up in tax audits and when staff claim benefits.
> *What to do:* Check with your payroll provider that every payment is reported, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.FIN.AUTHORISATION — FIN-FSA authorisation or notification — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 4, a document the company uploads | S2 incorporated, pre-revenue | FIN-FSA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 8 —: “FIN-FSA authorisation or notification before a regulated financial activity”
- **Applies when:** any of: (`derived.sector.payments` is yes) or (`derived.sector.lending` is yes) or (`derived.sector.crypto` is yes) or (`derived.sector.securities` is yes) or (`derived.sector.insurtech` is yes)
- **Passes when:** `vault.fi_fin_fsa_authorisation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** FIN-FSA authorisation or notification · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your FIN-FSA authorisation or notification on file**
> You haven't added your FIN-FSA authorisation or notification to your documents yet.
> *Why it matters:* Payments, credit, crypto, investment and insurance business needs an authorisation from FIN-FSA, or a notification to it, before it starts.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your FIN-FSA authorisation or notification, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (15)

### FI.COM.WEBSITE_IDENTITY — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Trade register and registration number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “VAT number on the website”
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

### FI.COM.REGULATOR_NAMED — Your licensing authority, on your website

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

### FI.CONSUMER.PRICES — Clear prices

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

### FI.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

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

### FI.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

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

### FI.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 6(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Consumer terms with the pre-contract information”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 9 —: “Online store pre-contract information (Consumer Protection Act ch 6)”
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

### FI.CONSUMER.ORDER_BUTTON — Order button wording

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

### FI.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 9 —: “14-day withdrawal; extended to 12 months if the procedure is not explained”
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

### FI.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

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

### FI.CONSUMER.WITHDRAWAL_FUNCTION — Online withdrawal button

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive (EU) 2023/2673, Art 11a of Directive 2011/83/EU
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Online withdrawal function ("withdraw from contract here"), from 19 Jun 2026”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 9 —: “Withdrawal function on the same interface, from 19 June 2026”
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

### FI.CONSUMER.COMPLAINTS — How consumers can complain

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

### FI.CONSUMER.ACCESSIBILITY — Accessibility statement

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

### FI.COM.DSA_CONTACT — Contact point and content rules for your platform

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

### FI.COM.DSA_REPRESENTATIVE — EU legal representative for a platform outside the EU

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

### FI.COM.DSA_POINTS_OF_CONTACT — Published points of contact under the Digital Services Act

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

## Layer 5: Fundraising (4)

### FI.FUND.PROSPECTUS_EXEMPTION — Share offers within a no-prospectus exemption

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

### FI.FUND.SHARE_ISSUE_DECISION — Decision behind each share issue

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 10 —: “Share issue decided by the general meeting, or by the board under an authorisation”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.fi_share_issue_decision.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_to_register_authorisation = 1
- **Evidence:** Share issue decisions (general meeting, or board under an authorisation) · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your share issue decisions on file**
> You haven't added your share issue decisions to your documents yet.
> *Why it matters:* Each share issue is decided by the general meeting, or by the board under an authorisation that is notified for registration within a month.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the decision behind each share issue, and the authorisation if the board made the decision.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.FUND.SHARE_ISSUE_REGISTERED — Share issues registered with PRH

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | PRH |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 10 —: “Share issue decision notified for registration within one month”
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 10 —: “New shares registered once paid, within 5 years of the decision or they lapse”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.fi_share_issue_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_to_notify = 1; years_to_register_shares = 5
- **Evidence:** Trade Register extract showing each share issue · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your Trade Register extract showing your share issues on file**
> You haven't added your Trade Register extract showing your share issues to your documents yet.
> *Why it matters:* A share issue decision is notified for registration within a month, and the new shares are registered once paid. Shares not registered in time lapse.
> *If left:* Shares that were never registered may not exist, and an investor will find that in due diligence.
> *What to do:* Order a Trade Register extract that shows each share issue, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### FI.FUND.REGISTER_UPDATED — Shareholder register updated after each share issue

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 10 —: “Shareholder register updated after the issue”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.fi_register_updated_after_issue` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s shareholder register shows its new shares**
> We don't have your confirmation that the shareholder register was updated after each share issue.
> *Why it matters:* The board keeps the shareholder register up to date, so each new shareholder and share is entered after an issue.
> *If left:* Investors compare the register with the share issues, and a mismatch holds up a round.
> *What to do:* Enter the shares from each issue in the register, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (9)

### FI.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Ombudsman |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.fi_dpia.present` is yes
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

### FI.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | the Data Protection Ombudsman |

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

### FI.AI.ROLES — AI systems list with your role for each

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “Role identified: provider, deployer, importer or distributor of each AI system”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.fi_ai_inventory.present` is yes
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

### FI.AI.PROHIBITED_PRACTICES — No banned AI practices

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

### FI.AI.PROHIBITED_GENERATIVE — No AI that makes abusive images of real people

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

### FI.AI.LITERACY — AI literacy for your team

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

### FI.AI.HIGH_RISK — High-risk AI documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Chapter III, as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI (Annex III uses: employment, credit scoring, education”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (any of: (the answer to “What for?” includes “hiring”) or (the answer to “What for?” includes “credit”) or (the answer to “What for?” includes “education”) or (the answer to “What for?” includes “insurance”) or (the answer to “What for?” includes “biometrics”))
- **Passes when:** `vault.fi_ai_high_risk.present` is yes
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

### FI.AI.HIGH_RISK_PRODUCTS — High-risk AI in regulated products

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 6(1), as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.sector.healthtech` is yes)
- **Passes when:** `vault.fi_ai_annex_i.present` is yes
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

### FI.AI.TRANSPARENCY — AI use disclosed to users

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | Traficom |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-finland-rule-pack-map.md`, Section 11 —: “AI transparency duties supervised by Traficom”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.fi_ai_transparency.present` is yes)
- **“To check” when:** `web.policy.ai_disclosure_found` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-08-02 to no end date
- **Same obligation as other packs:** `ai_transparency` (counted once per company)
- **Evidence:** Published AI disclosures; Transparency records · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see where {company} tells people it uses AI**
> We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.
> *Why it matters:* Since 2 August 2026, people must be told when they deal with AI from the first contact, AI-made content is marked, and deep fakes are labelled. Traficom supervises this.
> *If left:* Enterprise customers and investors are starting to ask, and you would have no answer ready.
> *What to do:* Say on your website where your product uses AI, or add your transparency records here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (20)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `fi_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | FI.DP.ROPA |
| `fi_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | FI.DP.PROCESSING_AGREEMENTS |
| `fi_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | FI.AI.DPIA |
| `fi_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to the Data Protection Ombudsman within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | FI.DP.BREACH |
| `fi_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | FI.DP.TRANSFERS |
| `fi_ai_inventory` | List of AI systems, with your role for each | What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system. | tier 5 | no | FI.AI.ROLES |
| `fi_ai_high_risk` | High-risk AI documentation (risk management, technical file, conformity, registration) | AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration. | tier 5 | no | FI.AI.HIGH_RISK |
| `fi_ai_annex_i` | AI documentation for regulated products (such as medical devices) | AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval. | tier 5 | no | FI.AI.HIGH_RISK_PRODUCTS |
| `fi_trade_register_extract` | Trade Register extract (kaupparekisteriote) | PRH open data has no address and no board, so the extract is how we see your registered office and who sits on your board. | tier 4 | no | FI.CORP.REGISTER_EXTRACT |
| `fi_articles` | Articles of association (certified copy from PRH, or the signed memorandum) | The articles set out how the company is run. A change takes effect only once PRH registers it. | tier 4 | no | FI.CORP.ARTICLES |
| `fi_shareholder_register` | Shareholder register (osakasluettelo) | The board keeps a register of every shareholder and their shares, and anyone may see it at the head office. | tier 4 | no | FI.CORP.SHAREHOLDER_REGISTER |
| `fi_ubo_extract` | Beneficial owner extract from PRH | Only whether a notification exists is public, not the details, so we read your extract. Board members and the managing director can download it free. | tier 4 | no | FI.CORP.UBO |
| `fi_minutes` | Minutes of board meetings and shareholder decisions | Board and shareholder decisions are recorded in signed minutes, and banks and investors ask to see them. | tier 5 | no | FI.CORP.MINUTES |
| `fi_accounts_filing` | PRH filing receipt for the financial statements, or a Trade Register extract showing them | Financial statements reach PRH within 8 months of the year end, even for a company that did not trade. PRH open data has no accounts, so we need the receipt. | tier 4 | no | FI.CORP.ACCOUNTS_FILING |
| `fi_invention_policy` | Employee invention policy and invention notices | Employees report inventions in writing, and the company has 4 months from the notice to claim them. | tier 5 | no | FI.IP.EMPLOYEE_INVENTIONS |
| `fi_trademark` | PRH or EU trade mark registration certificate | There is no PRH trade mark lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed. | tier 4 | no | FI.IP.TRADEMARK |
| `fi_fin_fsa_authorisation` | FIN-FSA authorisation or notification | Payments, credit, crypto, investment and insurance business needs an authorisation from FIN-FSA, or a notification to it, before it starts. | tier 4 | no | FI.FIN.AUTHORISATION |
| `fi_share_issue_decision` | Share issue decisions (general meeting, or board under an authorisation) | Each share issue is decided by the general meeting, or by the board under an authorisation that is notified for registration within a month. | tier 5 | no | FI.FUND.SHARE_ISSUE_DECISION |
| `fi_share_issue_registration` | Trade Register extract showing each share issue | A share issue decision is notified for registration within a month, and the new shares are registered once paid. Shares not registered in time lapse. | tier 4 | no | FI.FUND.SHARE_ISSUE_REGISTERED |
| `fi_ai_transparency` | AI transparency records | People should know when they are dealing with AI, and AI-made content has to be marked. | tier 5 | no | FI.AI.TRANSPARENCY |
