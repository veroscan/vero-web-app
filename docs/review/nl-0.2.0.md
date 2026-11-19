# Review: Netherlands (NL) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** NL, version 0.2.0, 63 rules (4 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `89ca184c8584e6faf16c7c1d28f82e8d5bc34bc434b3f8902e1e893ee76021cb`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (15)

### NL.CORP.COMPANY_PARTICULARS — Company details on letters, forms and website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive (EU) 2017/1132, Art 26
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Company particulars on letters, order forms and website”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 1 —: “KVK number on letters, orders, invoices and quotes”
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

### NL.CORP.UBO_ANNUAL_CHECK — Yearly check of beneficial-owner details

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

### NL.CORP.STATUS — Company registration active in the Business Register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | KVK Business Register |

- **Law cited:** Handelsregisterwet 2007, art 20
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 1 —: “Registered in the Handelsregister within one week”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “Registered in the Handelsregister as an active BV”
- **Applies when:** yes
- **Passes when:** `registry.nl.kvk.active` is yes
- **“To check” when:** all of: (`registry.nl.kvk.identified` is yes) and (`registry.nl.kvk.active` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** KVK Business Register record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company} is active in the Dutch Business Register**
> We couldn't confirm from {company}'s KVK record that its registration is active. The record may show an end date, or we may not have found the company yet.
> *Why it matters:* Every BV is registered in the Handelsregister, and anyone who looks the company up, banks and investors included, sees whether the registration is still running.
> *If left:* A registration shown as ended can hold up your bank, your contracts and any fundraising.
> *What to do:* Check the record on kvk.nl. If it shows an end date by mistake, ask KVK to correct it. If it is right, get advice today.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.LEGAL_FORM — Legal form: BV

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | KVK Business Register |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 1 —: “Legal form is a BV”
- **Applies when:** yes
- **Passes when:** any of: (`registry.nl.kvk.legal_form` includes “Besloten Vennootschap”) or (`registry.nl.kvk.legal_form` includes “besloten vennootschap”)
- **“To check” when:** `registry.nl.kvk.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** KVK Business Register record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We couldn't confirm {company} is a BV**
> {company}'s KVK record doesn't show the legal form as a private limited company (besloten vennootschap, BV).
> *Why it matters:* The Dutch checks here are written for a BV. Other legal forms have different duties.
> *If left:* Some of the checks we show may not fit your company.
> *What to do:* Check the legal form on your KVK record. A person will look at which checks apply.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.DEED_OF_INCORPORATION — Deed of incorporation (akte van oprichting)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 175(2)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 1 —: “BV incorporated by notarial deed”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “Deed of incorporation and current articles”
- **Applies when:** yes
- **Passes when:** `vault.nl_deed_of_incorporation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Deed of incorporation (akte van oprichting) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your deed of incorporation on file**
> You haven't added your deed of incorporation to your documents yet.
> *Why it matters:* A BV is set up by a notarial deed signed by everyone who set it up. It is the proof the company was formed properly.
> *If left:* You'll be asked for it in due diligence, and banks and investors want to see how the company was formed.
> *What to do:* Ask the notary who set up the company for a copy of the deed of incorporation, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.ARTICLES — Articles of association (statuten)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 234
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 2 —: “Articles of association (statuten) in the deed”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “Deed of incorporation and current articles”
- **Applies when:** yes
- **Passes when:** `vault.nl_articles.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Current articles of association (statuten) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your articles of association on file**
> You haven't added your articles of association to your documents yet.
> *Why it matters:* The articles set out how the company is run and what its shares carry. Each change needs a new notarial deed in Dutch.
> *If left:* You'll be asked for them in due diligence, and a change made without a notarial deed is not valid.
> *What to do:* Add the current articles, as last changed by notarial deed. Your notary can give you the latest consolidated version.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.VOTING_SHARE — A voting share held by someone other than the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 175(1)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 2 —: “At least one voting share held by someone other than the company”
- **Applies when:** yes
- **Passes when:** `attest.nl_voting_share` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has a voting share held by someone else**
> We don't have your confirmation that at least one share with voting rights is held by someone other than the company itself.
> *Why it matters:* A BV must always have at least one voting share held by a person or company other than itself.
> *If left:* If only the company holds voting shares, nobody outside it can vote at the general meeting.
> *What to do:* Check your shareholder register, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.SHAREHOLDER_REGISTER — Shareholder register (aandeelhoudersregister)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 194
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 2 —: “Shareholder register (aandeelhoudersregister) kept by the board”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “Shareholder register kept”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 10 —: “Shareholder register updated after the issue”
- **Applies when:** yes
- **Passes when:** `vault.nl_shareholder_register.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Shareholder register (aandeelhoudersregister) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your shareholder register on file**
> You haven't added your shareholder register to your documents yet.
> *Why it matters:* The board keeps a register of every shareholder, their shares and what was paid, kept up to date after each issue or transfer.
> *If left:* Investors will not move without it, and the register is the first place a dispute over who owns what is settled.
> *What to do:* Bring the register up to date with every issue, transfer and pledge, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.SHARE_TRANSFERS — Share transfers made by notarial deed

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 196(1)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 2 —: “Share transfers by notarial deed”
- **Applies when:** yes
- **Passes when:** any of: (`vault.nl_transfer_deeds.present` is yes) or (`attest.nl_share_transfers_by_deed` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Deeds of transfer; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see that {company}'s share transfers were made by notarial deed**
> You haven't added the deeds for share transfers, or confirmed that every transfer was made by deed or that none has happened.
> *Why it matters:* A transfer of BV shares needs a deed signed before a notary in the Netherlands.
> *If left:* A transfer made without a deed has not taken place, so the register and the real owners can differ.
> *What to do:* Add the deed for each transfer, or confirm here that every transfer had one or that none has happened.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.UBO — Beneficial owners registered (UBO extract)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | KVK Business Register |

- **Law cited:** Handelsregisterwet 2007, art 15a
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “UBOs registered”
- **Applies when:** yes
- **Passes when:** `vault.nl_ubo_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** KVK extract of your own UBO registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your UBO register extract on file**
> You haven't added your UBO register extract to your documents yet.
> *Why it matters:* Every BV registers the people who ultimately own or control it with KVK. The register is not open to the public, so we need your copy.
> *If left:* Banks ask for it when they open or review an account, and a missing registration holds that up.
> *What to do:* Order the certified extract of your own UBO data from KVK and add it here. If the UBOs were never registered, register them with KVK now.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.ACCOUNTS_PREPARED — Annual accounts prepared within 5 months

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 210(1)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 3 —: “Board prepares the annual accounts within 5 months of year end”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 12 —: “| Annual accounts prepared |”
- **Applies when:** yes
- **Passes when:** `attest.nl_accounts_prepared` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":5} (reminder only)
- **Numbers for you to confirm:** months_after_year_end = 5; extension_months = 5
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s board prepared last year's accounts**
> We don't have your confirmation that the board prepared the annual accounts within 5 months of the year end.
> *Why it matters:* The board prepares the accounts within 5 months of the year end. The general meeting can extend this by up to 5 months for special reasons.
> *If left:* Late accounts push back adoption and the deposit at KVK, and banks and investors ask for them.
> *What to do:* Have the accounts prepared, or record the extension, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.ACCOUNTS_ADOPTED — Annual accounts adopted by the general meeting

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 210(3), (5)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 3 —: “General meeting adopts the accounts”
- **Applies when:** yes
- **Passes when:** `attest.nl_accounts_adopted` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Shareholder resolution adopting the accounts · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s shareholders adopted last year's accounts**
> We don't have your confirmation that the general meeting adopted the annual accounts.
> *Why it matters:* The general meeting adopts the accounts. Where every shareholder is also a director, all directors signing can count as adoption, under set conditions.
> *If left:* Accounts that were never adopted are deposited marked "not yet adopted", which banks and investors notice.
> *What to do:* Hold the meeting or pass a written resolution adopting the accounts, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.GENERAL_MEETING — A general meeting each financial year

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 218
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 3 —: “At least one general meeting (or written resolution) each financial year”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 12 —: “| General meeting |”
- **Applies when:** yes
- **Passes when:** `attest.nl_general_meeting` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Minutes or written resolution · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} held its general meeting this year**
> We don't have your confirmation that the company held at least one general meeting, or passed a written resolution instead, in the last financial year.
> *Why it matters:* A BV holds at least one general meeting each financial year, or its shareholders decide in writing.
> *If left:* Without it, decisions such as adopting the accounts are harder to prove.
> *What to do:* Hold the meeting or pass the written resolution, keep the record, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.ACCOUNTS_DEPOSIT — Annual accounts deposited at KVK

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | KVK Business Register |

- **Law cited:** Burgerlijk Wetboek Book 2, arts 394, 396(8)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 3 —: “Accounts deposited at KVK within 8 days of adoption”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 3 —: “Accounts in Dutch, or in French, German or English”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “Accounts deposited at KVK each year”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 12 —: “| Accounts deposited at KVK |”
- **Applies when:** yes
- **Passes when:** `vault.nl_accounts_deposit.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":12} (reminder only)
- **Numbers for you to confirm:** days_after_adoption = 8; latest_months_after_year_end = 12
- **Evidence:** KVK confirmation that the annual accounts were deposited · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your KVK accounts deposit confirmation on file**
> You haven't added your KVK accounts deposit confirmation to your documents yet.
> *Why it matters:* Accounts are deposited at KVK within 8 days of adoption, and no later than 12 months after the year end. We cannot read deposited accounts yet, so we need the confirmation.
> *If left:* Anyone can look up deposited accounts at KVK, so a missing deposit shows, and banks and investors ask for the accounts.
> *What to do:* Deposit the adopted accounts at KVK (a small company files a short balance sheet and notes), in Dutch, English, French or German, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.CORP.DIRECTORS — Directors registered in the Business Register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | KVK Business Register |

- **Law cited:** Handelsregisterwet 2007, art 20
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 4 —: “Directors (bestuurders) registered in the Handelsregister”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 12 —: “| Handelsregister and UBO changes |”
- **Applies when:** yes
- **Passes when:** `vault.nl_kvk_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Recent KVK extract (uittreksel) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your KVK extract showing your directors on file**
> You haven't added your KVK extract showing your directors to your documents yet.
> *Why it matters:* Directors are recorded in the Handelsregister, and changes are filed within a week. We cannot read directors from KVK yet, so we need a recent extract.
> *If left:* Banks and partners check who can sign for the company, and an out-of-date record holds that up.
> *What to do:* Download a recent extract from kvk.nl, check the directors are right, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (3)

### NL.IP.EMPLOYEE_WORKS — Employees' work owned by the company — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Auteurswet, art 7
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 5 —: “Works made by employees: the employer is the author by law”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.nl_employee_works` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company} owns what its employees make**
> We don't have your confirmation that your employees' work, code included, is made in the course of their job and that no contract gives it back to them.
> *Why it matters:* Where making the work is part of the job, the employer counts as its maker by law, unless agreed otherwise.
> *If left:* Investors check who owns the code, and any doubt has to be settled before a round can close.
> *What to do:* Check your employment contracts describe the work and keep it with the company, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.IP.EMPLOYEE_INVENTIONS — Employee inventions and fair pay

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Octrooiwet 1995, art 12
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 5 —: “Employee inventions: patent belongs to the employer where the job is to invent”
- **Applies when:** all of: (`derived.employees` is yes) and (the answer to “Do you have technology you might want to patent?” is yes)
- **Passes when:** any of: (`vault.nl_invention_policy.present` is yes) or (`attest.nl_employee_inventions` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Employment contracts or invention policy; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see how {company} deals with employee inventions**
> You told us you have technology that could be patented, and you haven't added an invention clause or policy, or confirmed how inventions are handled.
> *Why it matters:* Where the job is to invent, the employer is entitled to the patent. The inventor is still owed a fair amount if their salary does not cover it, and that cannot be excluded.
> *If left:* Unclear ownership of an invention comes up in due diligence, and an inventor can claim pay for up to 3 years after the patent is granted.
> *What to do:* Add an invention clause to your employment contracts, or a short policy, and add it here or confirm you have one.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.IP.TRADEMARK — Trade mark (Benelux or EU)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | BOIP |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 5 —: “Benelux trademark registered with BOIP”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 12 —: “| Trademark renewal |”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Brand protected by an EU trade mark or a national mark in each operating market”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Renewal every 10 years from filing”
- **Applies when:** yes
- **Passes when:** `vault.nl_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.nl_trademark.dated","years":10} (reminder only)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a trade mark for {company}**
> You haven't added a Benelux or EU trade mark certificate, and we can't look marks up at BOIP yet.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand with BOIP, or as an EU trade mark, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (18)

### NL.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent that meet the GDPR and art 11.7a”
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

### NL.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 6 —: “Supervisory authority is the Autoriteit Persoonsgegevens”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to the Autoriteit Persoonsgegevens.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming the Autoriteit Persoonsgegevens and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

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

### NL.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

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

### NL.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.nl_ropa.present` is yes
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

### NL.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.nl_dpa.present` is yes
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

### NL.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

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

### NL.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

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
> *If left:* If you need one and haven't named one, the Autoriteit Persoonsgegevens can act on it.
> *What to do:* Check whether the tests apply to you. If they do, name your officer, publish the contact, tell the Autoriteit Persoonsgegevens, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.nl_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to the Autoriteit Persoonsgegevens within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.nl_transfers.present` is yes
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

### NL.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent that meet the GDPR and art 11.7a”
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

### NL.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
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

### NL.TAX.VAT_VIES — VAT number valid for EU trade

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | VIES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 5 —: “VAT number valid in VIES”
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

### NL.DP.EU_REPRESENTATIVE — EU representative for a company outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

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

### NL.EMP.PAYROLL_TAX_REGISTRATION — Registered as an employer for payroll taxes

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment_tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Belastingdienst |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 7 —: “Employer registration (loonheffingennummer) by the first employee”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.nl_payroll_tax_number.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Belastingdienst letter with your loonheffingennummer · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payroll tax registration letter on file**
> You haven't added your payroll tax registration letter to your documents yet.
> *Why it matters:* An employer registers with the Belastingdienst no later than the day its first employee starts. The number is not public, so we need the letter.
> *If left:* Paying staff without a payroll tax number leaves tax and contributions unpaid, and the Belastingdienst can add penalties.
> *What to do:* Register with the form "Melding Loonheffingen Aanmelding werkgever" if you have not, and add the letter with your loonheffingennummer here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.EMP.CONTRACTOR_STATUS — Contractors who are truly self-employed — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Belastingdienst |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 7 —: “Contractor status (no hidden employment)”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `attest.nl_contractor_status` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s contractors are really self-employed**
> We don't have your confirmation that the people you hire as contractors (zzp'ers) work as independent businesses and not as hidden employees.
> *Why it matters:* Someone who works like an employee can be treated as one, whatever the contract calls them.
> *If left:* The company can then owe payroll taxes and contributions for past work, with penalties.
> *What to do:* Check how each contractor works with you (their own clients, tools and hours), then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.FIN.PAYMENT_LICENCE — DNB licence for payment or e-money services

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 4, a document the company uploads | S2 incorporated, pre-revenue | DNB |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 8 —: “DNB licence or registration for payment or e-money services”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** `vault.nl_payment_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** DNB payment or e-money licence, or your licensed partner agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payment or e-money licence on file**
> You haven't added your payment or e-money licence to your documents yet.
> *Why it matters:* Holding or moving customers' money needs a DNB licence or registration, or a licensed partner that covers you.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your DNB licence or registration, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.FIN.AFM_LICENCE — AFM licence for investment, crypto or credit services — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | financial_regulation | tier 4, a document the company uploads | S2 incorporated, pre-revenue | AFM |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 8 —: “AFM licence (investment services, crypto-asset services)”
- **Applies when:** any of: (`derived.sector.securities` is yes) or (`derived.sector.crypto` is yes) or (`derived.sector.lending` is yes)
- **Passes when:** `vault.nl_afm_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** AFM licence or notification · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AFM licence on file**
> You haven't added your AFM licence to your documents yet.
> *Why it matters:* Investment services, crypto-asset services and consumer credit need a licence from the AFM, or a licensed partner.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your AFM licence or notification, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (15)

### NL.COM.WEBSITE_IDENTITY — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Trade register and registration number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “VAT number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 9 —: “Website identity details (BW 3:15d)”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, 5. The core set: “Website identity details under BW 3:15d”
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

### NL.COM.REGULATOR_NAMED — Your licensing authority, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | website_information | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)(e)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Supervisory authority named”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 9 —: “Website identity details (BW 3:15d)”
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

### NL.CONSUMER.PRICES — Clear prices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2000/31/EC, Art 5(2)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Prices clear, with tax and delivery stated”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 9 —: “Website identity details (BW 3:15d)”
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

### NL.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

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

### NL.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

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

### NL.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 6(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Consumer terms with the pre-contract information”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 9 —: “Pre-contract information for distance contracts (BW 6:230m)”
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

### NL.CONSUMER.ORDER_BUTTON — Order button wording

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

### NL.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 9 —: “14-day withdrawal right (BW 6:230o)”
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

### NL.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

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

### NL.CONSUMER.COMPLAINTS — How consumers can complain

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

### NL.CONSUMER.ACCESSIBILITY — Accessibility statement

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

### NL.COM.DSA_CONTACT — Contact point and content rules for your platform

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

### NL.COM.DSA_REPRESENTATIVE — EU legal representative for a platform outside the EU

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

### NL.COM.DSA_POINTS_OF_CONTACT — Published points of contact under the Digital Services Act

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

### NL.CONSUMER.WITHDRAWAL_FUNCTION — Online withdrawal button — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive (EU) 2023/2673, Art 11a of Directive 2011/83/EU
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 9 —: “Withdrawal function for online contracts”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Online withdrawal function ("withdraw from contract here"), from 19 Jun 2026”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.has_website_or_app` is yes)
- **Passes when:** `attest.eu_withdrawal_function` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_withdrawal_function` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has an online withdrawal button**
> We don't have your confirmation that consumers who signed up online can withdraw online, with a clear button and a confirmation step.
> *Why it matters:* EU law asks for a clear way to withdraw from contracts made online. We have not yet confirmed where and from when Dutch law puts this in place.
> *If left:* Once it applies, consumer authorities can act on it, and consumers can complain that withdrawing was made hard.
> *What to do:* Add a clearly labelled withdrawal button with a confirm step and an emailed acknowledgement, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (3)

### NL.FUND.PROSPECTUS_EXEMPTION — Share offers within a no-prospectus exemption

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

### NL.FUND.ISSUE_RESOLUTION — Resolution behind each share issue

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 206
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 10 —: “Share issue decided by the general meeting”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.nl_issue_resolution.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Resolutions to issue shares or grant rights to shares · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your share issue resolutions on file**
> You haven't added your share issue resolutions to your documents yet.
> *Why it matters:* Each share issue, and each grant of a right to take shares, is decided by the general meeting or the body the articles name.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the resolution behind each share issue and each grant of rights to shares.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NL.FUND.DEED_OF_ISSUE — Notarial deed for each share issue

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** Burgerlijk Wetboek Book 2, art 196(1)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 10 —: “New shares issued by notarial deed”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.nl_deed_of_issue.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Deeds of issue (akte van uitgifte) · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your deeds of issue on file**
> You haven't added your deeds of issue to your documents yet.
> *Why it matters:* New BV shares are issued only by a deed signed before a notary established in the Netherlands.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Ask your notary for the deed of issue for each round, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (9)

### NL.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | the Autoriteit Persoonsgegevens |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.nl_dpia.present` is yes
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

### NL.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | the Autoriteit Persoonsgegevens |

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

### NL.AI.ROLES — AI systems list with your role for each

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “Role identified: provider, deployer, importer or distributor of each AI system”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.nl_ai_inventory.present` is yes
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

### NL.AI.PROHIBITED_PRACTICES — No banned AI practices

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

### NL.AI.PROHIBITED_GENERATIVE — No AI that makes abusive images of real people

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

### NL.AI.LITERACY — AI literacy for your team

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

### NL.AI.HIGH_RISK — High-risk AI documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Chapter III, as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI (Annex III uses: employment, credit scoring, education”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (any of: (the answer to “What for?” includes “hiring”) or (the answer to “What for?” includes “credit”) or (the answer to “What for?” includes “education”) or (the answer to “What for?” includes “insurance”) or (the answer to “What for?” includes “biometrics”))
- **Passes when:** `vault.nl_ai_high_risk.present` is yes
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

### NL.AI.HIGH_RISK_PRODUCTS — High-risk AI in regulated products

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 6(1), as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.sector.healthtech` is yes)
- **Passes when:** `vault.nl_ai_annex_i.present` is yes
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

### NL.AI.TRANSPARENCY — AI use disclosed to users

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-netherlands-rule-pack-map.md`, Section 11 —: “AI transparency disclosure on the website or app”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.nl_ai_transparency.present` is yes)
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
| `nl_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | NL.DP.ROPA |
| `nl_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | NL.DP.PROCESSING_AGREEMENTS |
| `nl_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | NL.AI.DPIA |
| `nl_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to the Autoriteit Persoonsgegevens within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | NL.DP.BREACH |
| `nl_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | NL.DP.TRANSFERS |
| `nl_ai_inventory` | List of AI systems, with your role for each | What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system. | tier 5 | no | NL.AI.ROLES |
| `nl_ai_high_risk` | High-risk AI documentation (risk management, technical file, conformity, registration) | AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration. | tier 5 | no | NL.AI.HIGH_RISK |
| `nl_ai_annex_i` | AI documentation for regulated products (such as medical devices) | AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval. | tier 5 | no | NL.AI.HIGH_RISK_PRODUCTS |
| `nl_deed_of_incorporation` | Deed of incorporation (akte van oprichting) | A BV is set up by a notarial deed signed by everyone who set it up. It is the proof the company was formed properly. | tier 4 | no | NL.CORP.DEED_OF_INCORPORATION |
| `nl_articles` | Current articles of association (statuten) | The articles set out how the company is run and what its shares carry. Each change needs a new notarial deed in Dutch. | tier 4 | no | NL.CORP.ARTICLES |
| `nl_shareholder_register` | Shareholder register (aandeelhoudersregister) | The board keeps a register of every shareholder, their shares and what was paid, kept up to date after each issue or transfer. | tier 4 | no | NL.CORP.SHAREHOLDER_REGISTER |
| `nl_transfer_deeds` | Deeds of transfer of shares (akte van levering) | Shares in a BV change hands only through a deed signed before a notary established in the Netherlands. | tier 4 | no | NL.CORP.SHARE_TRANSFERS |
| `nl_ubo_extract` | KVK extract of your own UBO registration | Every BV registers its ultimate beneficial owners with KVK. The register is not public, so your own certified extract is how to show it was done. | tier 4 | no | NL.CORP.UBO |
| `nl_accounts_deposit` | KVK confirmation that the annual accounts were deposited | Accounts are deposited at KVK within 8 days of adoption, and no later than 12 months after the year end. We cannot read deposited accounts yet, so we need the confirmation. | tier 4 | no | NL.CORP.ACCOUNTS_DEPOSIT |
| `nl_kvk_extract` | Recent KVK extract (uittreksel) | Directors are recorded in the Handelsregister, and changes are filed within a week. We cannot read directors from KVK yet, so we need a recent extract. | tier 4 | no | NL.CORP.DIRECTORS |
| `nl_invention_policy` | Invention clause or invention policy | The employer is entitled to a patent where the job is to invent, and the inventor is owed fair pay if their salary does not cover it. | tier 5 | no | NL.IP.EMPLOYEE_INVENTIONS |
| `nl_trademark` | BOIP or EU trade mark certificate | There is no BOIP lookup we can use yet, so we read your certificate. A Benelux mark lasts 10 years, can be renewed, and must be used within 5 years. | tier 4 | no | NL.IP.TRADEMARK |
| `nl_payroll_tax_number` | Belastingdienst letter with your loonheffingennummer | An employer registers with the Belastingdienst no later than the day its first employee starts. The number is not public, so we need the letter. | tier 4 | no | NL.EMP.PAYROLL_TAX_REGISTRATION |
| `nl_payment_licence` | DNB payment or e-money licence, or your licensed partner agreement | Holding or moving customers' money needs a DNB licence or registration, or a licensed partner that covers you. | tier 4 | no | NL.FIN.PAYMENT_LICENCE |
| `nl_afm_licence` | AFM licence or notification | Investment services, crypto-asset services and consumer credit need a licence from the AFM, or a licensed partner. | tier 4 | no | NL.FIN.AFM_LICENCE |
| `nl_issue_resolution` | Resolutions to issue shares or grant rights to shares | Each share issue, and each grant of a right to take shares, is decided by the general meeting or the body the articles name. | tier 5 | no | NL.FUND.ISSUE_RESOLUTION |
| `nl_deed_of_issue` | Deeds of issue (akte van uitgifte) | New BV shares are issued only by a deed signed before a notary established in the Netherlands. | tier 4 | no | NL.FUND.DEED_OF_ISSUE |
| `nl_ai_transparency` | AI transparency records | People should know when they are dealing with AI, and AI-made content has to be marked. | tier 5 | no | NL.AI.TRANSPARENCY |
