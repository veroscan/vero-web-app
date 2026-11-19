# Review: Poland (PL) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** PL, version 0.2.0, 67 rules (4 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `50a37001382ee190d6a48fd7bdbb842655c412cec500be922f99aa37050dc1be`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (17)

### PL.CORP.UBO_ANNUAL_CHECK — Yearly check of beneficial-owner details

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

### PL.CORP.STATUS — Company status in the KRS

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | KRS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 1 —: “Company registered in the KRS”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 1 —: “Company not deleted”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Company found in the KRS, registered (not deleted), no liquidation or insolvency marker”
- **Applies when:** yes
- **Passes when:** all of: (`registry.pl.krs.status` is “registered”) and (`registry.pl.krs.under_liquidation` is no) and (`registry.pl.krs.insolvency_marker` is no)
- **“To check” when:** `registry.pl.krs.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** KRS extract · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company} is registered and trading normally in the KRS**
> We read {company}'s extract from the KRS, the Polish National Court Register, and it shows the company as deleted, or with a liquidation or insolvency section. We read these from section names, so a person checks them.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this first.
> *If left:* A company that is deleted, or in liquidation or insolvency, can have trouble with its bank, its contracts and any fundraising.
> *What to do:* Check your extract on the Court Registers Portal (prs.ms.gov.pl). If it is wrong, ask the registry court to correct it; if not, get advice today.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.REGISTER_CHANGES — Changes filed with the KRS within 7 days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** KRS Act, arts. 22, 24
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 1 —: “Register changes filed within 7 days”
- **Applies when:** yes
- **Passes when:** `attest.pl_register_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_event = 7
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s changes are filed with the KRS**
> We don't have your confirmation that every change, such as a new board member, a new seat or new articles, was filed with the registry court.
> *Why it matters:* A change to a KRS entry is filed within 7 days of the event, unless a special rule says otherwise. The court can call for it with a further 7 days.
> *If left:* Banks, customers and investors rely on the KRS, and an old entry can show people who no longer act for the company.
> *What to do:* Compare your KRS extract with how the company is run today, file anything missing, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.REGISTERED_SEAT — Registered seat on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | KRS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 1 —: “| Registered seat |”
- **Applies when:** yes
- **Passes when:** `registry.pl.krs.seat_town` is yes (or present)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** KRS extract · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s registered seat in the KRS**
> We read {company}'s KRS extract and found no seat for the company.
> *Why it matters:* Every company has a registered seat, stated in its articles and recorded in the KRS.
> *If left:* Official letters and court papers go there, and banks check it matches.
> *What to do:* Check the seat on your KRS extract, and file a correction with the registry court if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.ARTICLES — Articles of association (umowa spółki)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Commercial Companies Code (KSH), arts. 157, 157¹
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 2 —: “Articles (umowa spółki) by notarial deed or S24 template”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 2 —: “Articles contain the required terms”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Articles by notarial deed or S24; share book kept”
- **Applies when:** yes
- **Passes when:** `vault.pl_articles.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Articles of association (umowa spółki), notarial deed or S24 record · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your articles of association on file**
> You haven't added your articles of association to your documents yet.
> *Why it matters:* The articles are made as a notarial deed, or online on the S24 template, and set out the name, seat, objects, share capital and each shareholder's shares.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add the current articles, with every amendment made since the company was set up.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.SHARE_CAPITAL — Share capital of at least PLN 5,000

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 1, official source, read live | S2 incorporated, pre-revenue | KRS |

- **Law cited:** Commercial Companies Code (KSH), art. 154
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 2 —: “Share capital at least PLN 5,000”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Share capital at least PLN 5,000”
- **Applies when:** the answer to “What kind of company is it?” is one of “sp_zoo”
- **Passes when:** all of: (`registry.pl.krs.share_capital` is at least 5000) and (`registry.pl.krs.share_capital_currency` is “PLN”)
- **“To check” when:** all of: (`registry.pl.krs.identified` is yes) and (not (`registry.pl.krs.share_capital_currency` is “PLN”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** minimum_pln = 5000; minimum_per_share_pln = 50
- **Evidence:** KRS extract · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s share capital in the KRS is below PLN 5,000**
> The KRS shows {company}'s share capital below PLN 5,000, the minimum for an sp. z o.o.
> *Why it matters:* An sp. z o.o. has share capital of at least PLN 5,000, and each share is worth at least PLN 50.
> *If left:* A capital below the minimum suggests the record, or the company form we have, is wrong, and investors will ask.
> *What to do:* Check the capital on your KRS extract and in your articles, and tell us if the company is not an sp. z o.o.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.SHARE_BOOK — Share book (księga udziałów)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Commercial Companies Code (KSH), art. 188 §§ 1-2
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 2 —: “Share book (księga udziałów) kept”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “share book kept”
- **Applies when:** the answer to “What kind of company is it?” is one of “sp_zoo”
- **Passes when:** `vault.pl_share_book.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Share book (księga udziałów) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your share book on file**
> You haven't added your share book to your documents yet.
> *Why it matters:* The management board keeps a share book recording every shareholder, their shares and every change. Each shareholder may inspect it.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Bring the share book up to date with every transfer and new share, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.SHAREHOLDER_LIST — Latest shareholder list filed with the registry court

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Commercial Companies Code (KSH), art. 188 §§ 3-4
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 2 —: “New shareholder list filed after each change”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 10 —: “New shareholder list after the round”
- **Applies when:** the answer to “What kind of company is it?” is one of “sp_zoo”
- **Passes when:** `vault.pl_shareholder_list.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Shareholder list (lista wspólników), as filed with the registry court · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your latest shareholder list on file**
> You haven't added your latest shareholder list to your documents yet.
> *Why it matters:* After each change in shareholders, the board files a new list, signed by every board member, with the registry court.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add the latest list as filed. If a change was never filed, file a new list with the registry court now.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.UBO — Beneficial owners reported to the CRBR

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** AML Act, art. 60
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Beneficial owners in the CRBR within 14 days of registration”
- **Applies when:** yes
- **Passes when:** `vault.pl_crbr_confirmation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CRBR filing confirmation (potwierdzenie zgłoszenia) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CRBR filing confirmation on file**
> You haven't added your CRBR filing confirmation to your documents yet.
> *Why it matters:* Every company reports the people who ultimately own or control it to the CRBR, within 14 days of its KRS registration.
> *If left:* Missing or wrong CRBR data can be fined heavily, and banks check it when you open an account.
> *What to do:* File the report on the CRBR website and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.UBO_CURRENT — CRBR updated after a change

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** AML Act, art. 60(2)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 2 —: “CRBR updated within 14 days of a change”
- **Applies when:** yes
- **Passes when:** `attest.pl_crbr_current` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s CRBR entry is up to date**
> We don't have your confirmation that the CRBR was updated after the last change in who owns or controls the company.
> *Why it matters:* A change in beneficial owners is reported to the CRBR within 14 days of the KRS change, or of the change itself where no KRS entry is needed.
> *If left:* Out-of-date details can be fined, and banks rely on them when they onboard you.
> *What to do:* After each change, update the CRBR, add the new confirmation here, and confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.ACCOUNTS_PREPARED — Accounts prepared within 3 months

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Accounting Act, art. 52
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 3 —: “Accounts prepared within 3 months”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “accounts within 3 months”
- **Applies when:** yes
- **Passes when:** `attest.pl_accounts_prepared` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":3} (reminder only)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s accounts were prepared within 3 months**
> We don't have your confirmation that last year's accounts were prepared within 3 months of the year end and signed by the bookkeeper and the management board.
> *Why it matters:* Accounts are prepared within 3 months of the balance-sheet date, in the electronic structured format, and signed by the person keeping the books and the management board.
> *If left:* Late accounts push back the meeting and the KRS filing that follow.
> *What to do:* Check with your accountant that the accounts were prepared and signed in time, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.ANNUAL_MEETING — Annual shareholders' meeting within 6 months

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Commercial Companies Code (KSH), art. 231; Accounting Act, art. 53(1)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 3 —: “Annual shareholders' meeting within 6 months”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “meeting within 6 months”
- **Applies when:** yes
- **Passes when:** `vault.pl_agm_resolution.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":6} (reminder only)
- **Evidence:** Resolution of the annual shareholders' meeting approving the accounts · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your resolution of the annual shareholders' meeting on file**
> You haven't added your resolution of the annual shareholders' meeting to your documents yet.
> *Why it matters:* The annual meeting is held within 6 months of the year end to approve the accounts and the board's report, decide on profit or loss and grant discharge.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Hold the meeting, adopt the resolutions, and add the resolution approving the accounts here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.ACCOUNTS_FILING — Annual accounts filed with the KRS

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Accounting Act, art. 69(1)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 3 —: “Accounts filed with the KRS within 15 days of approval”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “KRS filing within 15 days of approval”
- **Applies when:** yes
- **Passes when:** `vault.pl_accounts_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_approval = 15
- **Evidence:** Annual accounts with the KRS filing confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your KRS accounts filing confirmation on file**
> You haven't added your KRS accounts filing confirmation to your documents yet.
> *Why it matters:* The accounts, the approving resolution, the board report and any audit report are filed with the KRS within 15 days of approval. The KRS extract does not show this, so we need the confirmation.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* File the documents in the KRS financial documents repository (Repozytorium Dokumentów Finansowych) and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.MEETING_NOTICES — Shareholders' meetings called properly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Commercial Companies Code (KSH), art. 238 § 1
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 3 —: “Shareholders' meeting notices”
- **Applies when:** the answer to “What kind of company is it?” is one of “sp_zoo”
- **Passes when:** `attest.pl_meeting_notices` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** notice_weeks = 2
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} calls its shareholders' meetings properly**
> We don't have your confirmation that shareholders get notice of each meeting at least two weeks before, in a form the law allows.
> *Why it matters:* Notice goes by registered letter or courier at least two weeks before the meeting. From 3 December 2026 it can also go to an e-delivery address or by e-mail, where the shareholder agreed in documentary form.
> *If left:* Resolutions passed at a meeting called the wrong way can be challenged.
> *What to do:* Check how you send notices, collect consents where you use e-mail, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.MANAGEMENT — A management board on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | KRS |

- **Law cited:** Commercial Companies Code (KSH), art. 201
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 4 —: “Management board in place”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “management board with at least one member”
- **Applies when:** yes
- **Passes when:** `registry.pl.krs.management_members_count` is at least 1
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** KRS extract · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see a management board for {company} in the KRS**
> We read {company}'s KRS extract and found nobody on the management board.
> *Why it matters:* A company has a management board of one or more members, appointed by the shareholders unless the articles say otherwise.
> *If left:* Nobody shows as able to sign for the company, which holds up banks and investors.
> *What to do:* Check the extract and file the board appointment with the registry court if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.BOARD_ELIGIBLE — Board members free to serve

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Commercial Companies Code (KSH), art. 18
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 4 —: “Board members are natural persons with full capacity”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 4 —: “Board members not disqualified”
- **Applies when:** yes
- **Passes when:** `attest.pl_board_eligible` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s board members are free to serve**
> We don't have your confirmation that each board member is a person with full legal capacity who has not been convicted of an offence that bars office.
> *Why it matters:* Only a natural person with full legal capacity can sit on the board, and people convicted of certain offences cannot.
> *If left:* A board member who is barred can put the company's decisions in doubt.
> *What to do:* Check each board member against these rules, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.CORP.COMPANY_PARTICULARS — Company details on website, letters and order forms

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Commercial Companies Code (KSH), art. 206 § 1; Directive (EU) 2017/1132, Art 26
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 9 —: “Company particulars on the website”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Company particulars and e-services information on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Company particulars on letters, order forms and website”
- **Applies when:** yes
- **Passes when:** `attest.eu_company_particulars` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_company_particulars` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s website and paperwork carry its company details**
> We don't have your confirmation that your website, letters and order forms show the company's name, seat and address, registry court and KRS number, NIP and share capital.
> *Why it matters:* Polish company law lists the details a company shows, including group membership where there is one. A company set up on S24 also says if contributions are not yet made.
> *If left:* Customers and partners look for these details, and missing ones make the company look less established.
> *What to do:* Add the details to your website footer and your letter and invoice templates, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (5)

### PL.IP.EMPLOYEE_SOFTWARE — Software written by employees in their job

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Copyright Act, art. 74(3)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 5 —: “Employee software belongs to the employer”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.pl_employee_software` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s employees write its software as part of their job**
> We don't have your confirmation that the software your employees write is made in performing their employment duties.
> *Why it matters:* The economic rights in a program an employee writes in performing their duties belong to the employer, unless agreed otherwise.
> *If left:* Code written outside the job, or under a contract that says otherwise, may not be the company's, and investors check this.
> *What to do:* Check your employment contracts cover the software people write for you, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.IP.EMPLOYEE_WORKS — Employees' other work accepted by the company — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Copyright Act, art. 12(1)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 5 —: “Employee works: employer acquires rights”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.pl_employee_works` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company} acquires its employees' other work**
> We don't have your confirmation that designs, text and other work your employees create is accepted by the company within the purpose of their contracts.
> *Why it matters:* For work other than software, the employer acquires the economic rights when it accepts the work, within the purpose of the employment contract, unless the law or the contract says otherwise.
> *If left:* Work outside that purpose may not be the company's to use, and investors check this.
> *What to do:* Add an IP clause covering all work to your employment contracts, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.IP.CONTRACTOR_ASSIGNMENT — Written IP transfer from contractors

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Copyright Act, arts. 41, 53
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Contractor IP assigned in writing with fields of exploitation”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** any of: (`vault.pl_contractor_ip.present` is yes) or (`attest.pl_contractor_ip` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all contractors?”
- **Evidence:** Contractor agreements; Your confirmation · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your contractors may still own what they built for {company}**
> You haven't added your contractor agreements, or confirmed they transfer the rights in writing.
> *Why it matters:* There is no default rule for contractors, including on B2B contracts. A transfer of rights must be in writing or it is void, and it covers only the fields of exploitation it names.
> *If left:* Without it, the company may not own its code or designs, and investors check this before a round.
> *What to do:* Add a written transfer listing the fields of exploitation to each contractor agreement, and add them here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.IP.INVENTIONS — Inventions made by staff and contractors

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | ip_ownership | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Industrial Property Law, arts. 11(3), 12(2)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 5 —: “Inventions go to the employer or commissioning party”
- **Applies when:** `derived.team_or_contractors` is yes
- **Passes when:** `attest.pl_inventions` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed who owns {company}'s inventions**
> We don't have your confirmation that inventions made by your staff and contractors belong to the company, and that any transfer is in writing.
> *Why it matters:* The right to a patent for an invention made in performing employment duties or another contract belongs to the employer or the party that commissioned it, unless agreed otherwise. A transfer of that right needs written form.
> *If left:* A contract that agrees otherwise can leave an invention outside the company.
> *What to do:* Check what your employment and contractor agreements say about inventions, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.IP.TRADEMARK — Trade mark (Polish or EU) — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | UPRP |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 5 —: “Polish trade mark (UPRP)”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Brand protected by an EU trade mark or a national mark in each operating market”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Renewal every 10 years from filing”
- **Applies when:** yes
- **Passes when:** `vault.pl_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.pl_trademark.dated","years":10} (reminder only)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a trade mark for {company}**
> You haven't added a Polish or EU trade mark certificate, and we can't look marks up at the Polish Patent Office (UPRP) yet.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand at the UPRP, or as an EU trade mark, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (18)

### PL.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 6 —: “| Privacy notice |”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Privacy notice; cookie consent before non-essential storage”
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

### PL.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 6 —: “| Privacy notice |”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to UODO.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming UODO and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | UODO |

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

### PL.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Art 8(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Age of digital consent for online services to children”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Are any of your users under 18?” is yes)
- **Passes when:** `attest.eu_child_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_child_consent` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} gets consent for children**
> We don't have your confirmation of how you handle consent from children who use your service.
> *Why it matters:* Below a national age, consent for an online service has to come from a parent, where you rely on consent.
> *If left:* Data collected without valid consent has no legal basis, and children's data is watched closely.
> *What to do:* Set up an age check and a parent consent step where you need one, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.pl_ropa.present` is yes
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

### PL.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.pl_dpa.present` is yes
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

### PL.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | UODO |

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

### PL.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.pl_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to UODO within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.pl_transfers.present` is yes
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

### PL.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | UODO |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Privacy notice; cookie consent before non-essential storage”
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

### PL.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | UODO |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 6 —: “| Cookie policy published |”
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

### PL.TAX.VAT_VIES — VAT number valid for EU trade

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | VIES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 5 —: “VAT number valid in VIES”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 7 —: “VAT registration before the first taxable sale”
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

### PL.DP.EU_REPRESENTATIVE — EU representative for a company outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | UODO |

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

### PL.TAX.NIP_REGON — Tax number (NIP) and statistics number (REGON)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S2 incorporated, pre-revenue | KRS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 1 —: “NIP and REGON assigned”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “NIP and REGON assigned”
- **Applies when:** yes
- **Passes when:** all of: (`registry.pl.krs.nip_present` is yes) and (`registry.pl.krs.regon_present` is yes)
- **“To check” when:** `registry.pl.krs.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** KRS extract · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s NIP or REGON in the KRS**
> The KRS extract for {company} doesn't show a tax number (NIP), or a statistics number (REGON).
> *Why it matters:* A company has a NIP for tax and a REGON for statistics, and both are on its KRS record.
> *If left:* Banks, customers and tax forms ask for both numbers.
> *What to do:* Check your KRS extract. If a number is missing, ask the tax office or the statistics office, then have the record corrected.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.DP.DPO — Data protection officer notified to UODO

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 4, a document the company uploads | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Art 37; Personal Data Protection Act 2018, arts. 10-11
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 6 —: “DPO notified to UODO within 14 days”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 6 —: “DPO contact published on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPO designated where required”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.sensitive_data` is yes)
- **Passes when:** any of: (`vault.pl_dpo_notification.present` is yes) or (`attest.eu_dpo` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_designation = 14
- **Same obligation as other packs:** `eu_dpo` (counted once per company)
- **Evidence:** UODO notification confirmation; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed whether {company} needs a data protection officer**
> You told us you handle sensitive data. We don't have a UODO confirmation for an officer, or your confirmation that you checked whether you need one.
> *Why it matters:* Companies whose core work is monitoring people at scale, or handling sensitive data at scale, must name an officer, notify UODO within 14 days and publish the contact on their website.
> *If left:* If you need one and haven't notified UODO, it can act on it.
> *What to do:* Check whether the tests apply. If they do, notify UODO, publish the contact, and add the confirmation here. If you need none, confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.TAX.VAT_REGISTRATION — VAT registration (VAT-R)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S3 revenue, pre-raise | the tax office |

- **Law cited:** VAT Act, art. 96(1)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 7 —: “VAT registration before the first taxable sale”
- **Applies when:** yes
- **Passes when:** any of: (`vault.pl_vat_registration.present` is yes) or (`registry.eu.vies_vat.valid` is yes)
- **“To check” when:** `attest.pl_vat_exempt` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** VAT-R confirmation; VIES check of your VAT number · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s Polish VAT registration**
> You haven't added the VAT-R confirmation, and VIES doesn't show your number as valid for EU trade.
> *Why it matters:* A company registers for VAT with the tax office before its first taxable sale, unless it is exempt. VIES shows only EU registration, not domestic VAT status.
> *If left:* Registering late can mean paying VAT you never charged your customers.
> *What to do:* Add your VAT-R confirmation here. If you rely on the small-business exemption, confirm that, and a person will check it fits your business.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.EMP.ZUS_PAYER — Registered with ZUS as a contribution payer — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | ZUS |

- **Law cited:** Social Insurance System Act, art. 43
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 7 —: “Registered as contribution payer with ZUS within 7 days”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.pl_zus_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** ZUS confirmation of registration as a contribution payer · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your ZUS payer registration on file**
> You haven't added your ZUS payer registration to your documents yet.
> *Why it matters:* An employer registers with ZUS, the social insurance institution, as a contribution payer within 7 days of employing its first employee.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Register with ZUS through its online service, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.EMP.ZUS_EMPLOYEES — Each employee reported to ZUS within 7 days

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | ZUS |

- **Law cited:** Social Insurance System Act, art. 36(4)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 7 —: “Each employee reported to ZUS within 7 days”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.pl_zus_employees` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_insurance_starts = 7
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} reports each employee to ZUS**
> We don't have your confirmation that each employee was reported to ZUS within 7 days of their insurance starting.
> *Why it matters:* Each employee is reported to ZUS for social insurance within 7 days of the duty arising.
> *If left:* Late reporting comes up in ZUS checks and can leave staff without cover.
> *What to do:* Check with your payroll provider that every employee was reported in time, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (15)

### PL.COM.WEBSITE_IDENTITY — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Trade register and registration number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “VAT number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 9 —: “E-services information (art. 5)”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, 5. The core set: “Company particulars and e-services information on the website”
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

### PL.COM.REGULATOR_NAMED — Your licensing authority, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | website_information | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)(e)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Supervisory authority named”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 9 —: “E-services information (art. 5)”
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

### PL.CONSUMER.PRICES — Clear prices

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

### PL.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

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

### PL.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

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

### PL.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 6(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Consumer terms with the pre-contract information”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 9 —: “Pre-contract information for distance contracts”
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

### PL.CONSUMER.ORDER_BUTTON — Order button wording

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

### PL.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 9 —: “14-day withdrawal right”
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

### PL.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

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

### PL.CONSUMER.WITHDRAWAL_FUNCTION — Online withdrawal button

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

### PL.CONSUMER.COMPLAINTS — How consumers can complain

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Complaints route for consumers”
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 9 —: “| Complaints route |”
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

### PL.CONSUMER.ACCESSIBILITY — Accessibility statement

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

### PL.COM.DSA_CONTACT — Contact point and content rules for your platform

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

### PL.COM.DSA_REPRESENTATIVE — EU legal representative for a platform outside the EU

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

### PL.COM.DSA_POINTS_OF_CONTACT — Published points of contact under the Digital Services Act

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

## Layer 5: Fundraising (3)

### PL.FUND.PROSPECTUS_EXEMPTION — Share offers within a no-prospectus exemption

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

### PL.FUND.CAPITAL_INCREASE — Shareholder resolution on each capital increase

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** Commercial Companies Code (KSH), arts. 255, 257
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 10 —: “Capital increase by amending the articles”
- **Applies when:** all of: (`derived.invested` is yes) and (the answer to “What kind of company is it?” is one of “sp_zoo”)
- **Passes when:** `vault.pl_capital_increase.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Notarial protocol of each capital increase resolution (or the S24 resolution) · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your capital increase resolutions on file**
> You haven't added your capital increase resolutions to your documents yet.
> *Why it matters:* Unless the articles already allow it, a capital increase amends the articles, and the resolution is recorded by a notary, or on S24 for an S24 company.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the notarial protocol, or the S24 resolution, behind each capital increase.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### PL.FUND.CAPITAL_INCREASE_FILED — Capital increase entered in the KRS — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** Commercial Companies Code (KSH), art. 262; KRS Act, art. 22
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 10 —: “Increase filed with the registry court”
- **Applies when:** all of: (`derived.invested` is yes) and (the answer to “What kind of company is it?” is one of “sp_zoo”)
- **Passes when:** `vault.pl_capital_increase_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Registry court filing for the capital increase, with the board statement on contributions · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your capital increase filing on file**
> You haven't added your capital increase filing to your documents yet.
> *Why it matters:* The board files the increase with the resolution, the subscription statements and its statement that contributions are paid. The increase takes effect only once registered.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* File the increase with the registry court, add the filing here, and check the new capital shows on your KRS extract.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (9)

### PL.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | UODO |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.pl_dpia.present` is yes
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

### PL.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | UODO |

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

### PL.AI.ROLES — AI systems list with your role for each

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “Role identified: provider, deployer, importer or distributor of each AI system”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.pl_ai_inventory.present` is yes
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

### PL.AI.PROHIBITED_PRACTICES — No banned AI practices

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

### PL.AI.PROHIBITED_GENERATIVE — No AI that makes abusive images of real people

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

### PL.AI.LITERACY — AI literacy for your team

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

### PL.AI.HIGH_RISK — High-risk AI documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Chapter III, as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI (Annex III uses: employment, credit scoring, education”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (any of: (the answer to “What for?” includes “hiring”) or (the answer to “What for?” includes “credit”) or (the answer to “What for?” includes “education”) or (the answer to “What for?” includes “insurance”) or (the answer to “What for?” includes “biometrics”))
- **Passes when:** `vault.pl_ai_high_risk.present` is yes
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

### PL.AI.HIGH_RISK_PRODUCTS — High-risk AI in regulated products

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 6(1), as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.sector.healthtech` is yes)
- **Passes when:** `vault.pl_ai_annex_i.present` is yes
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

### PL.AI.TRANSPARENCY — AI use disclosed to users

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-poland-rule-pack-map.md`, Section 11 —: “AI transparency notice on the site”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.pl_ai_transparency.present` is yes)
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
| `pl_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | PL.DP.ROPA |
| `pl_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | PL.DP.PROCESSING_AGREEMENTS |
| `pl_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | PL.AI.DPIA |
| `pl_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to UODO within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | PL.DP.BREACH |
| `pl_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | PL.DP.TRANSFERS |
| `pl_ai_inventory` | List of AI systems, with your role for each | What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system. | tier 5 | no | PL.AI.ROLES |
| `pl_ai_high_risk` | High-risk AI documentation (risk management, technical file, conformity, registration) | AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration. | tier 5 | no | PL.AI.HIGH_RISK |
| `pl_ai_annex_i` | AI documentation for regulated products (such as medical devices) | AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval. | tier 5 | no | PL.AI.HIGH_RISK_PRODUCTS |
| `pl_articles` | Articles of association (umowa spółki), notarial deed or S24 record | The articles are made as a notarial deed, or online on the S24 template, and set out the name, seat, objects, share capital and each shareholder's shares. | tier 4 | no | PL.CORP.ARTICLES |
| `pl_share_book` | Share book (księga udziałów) | The management board keeps a share book recording every shareholder, their shares and every change. Each shareholder may inspect it. | tier 4 | no | PL.CORP.SHARE_BOOK |
| `pl_shareholder_list` | Shareholder list (lista wspólników), as filed with the registry court | After each change in shareholders, the board files a new list, signed by every board member, with the registry court. | tier 4 | no | PL.CORP.SHAREHOLDER_LIST |
| `pl_crbr_confirmation` | CRBR filing confirmation (potwierdzenie zgłoszenia) | Every company reports its beneficial owners to the Central Register of Beneficial Owners (CRBR) soon after it is entered in the KRS. | tier 4 | no | PL.CORP.UBO |
| `pl_agm_resolution` | Resolution of the annual shareholders' meeting approving the accounts | The annual meeting is held within 6 months of the year end to approve the accounts and the board's report, decide on profit or loss and grant discharge. | tier 4 | no | PL.CORP.ANNUAL_MEETING |
| `pl_accounts_filing` | Annual accounts with the KRS filing confirmation | The accounts, the approving resolution, the board report and any audit report are filed with the KRS within 15 days of approval. The KRS extract does not show this, so we need the confirmation. | tier 4 | no | PL.CORP.ACCOUNTS_FILING |
| `pl_contractor_ip` | Contractor agreements with a written IP transfer naming the fields of exploitation | There is no default rule for contractors: a transfer of rights must be in writing and covers only the fields of exploitation it names. | tier 5 | no | PL.IP.CONTRACTOR_ASSIGNMENT |
| `pl_trademark` | UPRP or EU trade mark registration certificate | There is no UPRP lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed. | tier 4 | no | PL.IP.TRADEMARK |
| `pl_dpo_notification` | UODO confirmation of the data protection officer notification | A company that designates a data protection officer notifies the President of UODO within 14 days, with the officer's name and e-mail or phone. | tier 5 | no | PL.DP.DPO |
| `pl_vat_registration` | VAT registration confirmation (VAT-R) | A company files its VAT registration with the tax office before its first taxable sale. The domestic VAT list has no lookup we can use yet, so we need the confirmation. | tier 4 | no | PL.TAX.VAT_REGISTRATION |
| `pl_zus_registration` | ZUS confirmation of registration as a contribution payer | An employer registers with ZUS, the social insurance institution, as a contribution payer within 7 days of employing its first employee. | tier 4 | no | PL.EMP.ZUS_PAYER |
| `pl_capital_increase` | Notarial protocol of each capital increase resolution (or the S24 resolution) | Unless the articles already allow it, a capital increase amends the articles, and the resolution is recorded by a notary, or on S24 for an S24 company. | tier 4 | no | PL.FUND.CAPITAL_INCREASE |
| `pl_capital_increase_filing` | Registry court filing for the capital increase, with the board statement on contributions | The board files the increase with the resolution, the subscription statements and its statement that contributions are paid. The increase takes effect only once registered. | tier 4 | no | PL.FUND.CAPITAL_INCREASE_FILED |
| `pl_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | PL.AI.TRANSPARENCY |
