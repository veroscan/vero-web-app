# Review: United Kingdom (GB) 0.3.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** GB, version 0.3.0, 127 rules (18 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `092df1f358e363f02ef153db7cf0ff9e2666fb9e9be8691e059e1db92c07d2af`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (19)

### GB.CORP.STATUS — Company status

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Incorporation application; Certificate of Incorporation; company registration number”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Company active; confirmation statement and accounts not overdue”
- **Applies when:** yes
- **Passes when:** `registry.uk.companies_house.status` is “active”
- **A problem (defect) when:** all of: (`registry.uk.companies_house.found` is yes) and (not (`registry.uk.companies_house.status` is “active”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies House record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} doesn't show as active at Companies House**
> We read {company}'s record from Companies House, and it doesn't show as active.
> *Why it matters:* Anyone who looks up the company, investors and banks included, sees this status first.
> *If left:* If it's being struck off or wound up, the company can lose its assets and contracts along with its status.
> *What to do:* Check the record on Companies House today and deal with what it shows, starting with anything overdue.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.ARTICLES — Memorandum and articles of association

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Memorandum of Association; Articles of Association”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Articles, statutory registers, board resolutions”
- **Applies when:** yes
- **Passes when:** any of: (`registry.uk.companies_house.incorporation_filing_on_record` is yes) or (`vault.gb_articles.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies House filing history; Your articles · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find {company}'s articles of association**
> We couldn't find your incorporation documents in the Companies House filing history, and you haven't added your articles.
> *Why it matters:* Your articles are the rules for how the company is run, and investors will read them.
> *If left:* It'll come up in due diligence, and investors usually ask for changes to them.
> *What to do:* Add your current articles here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.STATEMENT_OF_CAPITAL — Statement of capital

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Statement of Capital”
- **Applies when:** yes
- **Passes when:** `registry.uk.companies_house.capital_filing_on_record` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies House filing history · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a statement of capital for {company}**
> We couldn't find a capital filing in {company}'s Companies House history.
> *Why it matters:* It is the public record of the shares your company has issued.
> *If left:* If it doesn't match your own records, you'll have to explain why in due diligence.
> *What to do:* Check your filing history at Companies House and file anything missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.REGISTERED_OFFICE — Registered office address

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Registered office address”
- **Applies when:** yes
- **Passes when:** all of: (`registry.uk.companies_house.registered_office_present` is yes) and (`registry.uk.companies_house.registered_office_in_dispute` is no) and (`registry.uk.companies_house.undeliverable_registered_office` is no)
- **A problem (defect) when:** any of: (`registry.uk.companies_house.registered_office_in_dispute` is yes) or (`registry.uk.companies_house.undeliverable_registered_office` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies House record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **There's a problem with {company}'s registered office address**
> Companies House shows your registered office as disputed or undeliverable, or has no address for you.
> *Why it matters:* This is where official post and legal papers go.
> *If left:* You can miss official letters, and investors who look up the company will see it's flagged.
> *What to do:* Update your registered office with Companies House.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.REGISTERED_EMAIL — Registered email address

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Registered email address”
- **Applies when:** yes
- **Passes when:** `attest.gb_registered_email` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s registered email address**
> We don't have your confirmation that a registered email is set. Companies House doesn't publish it, so we can't check.
> *Why it matters:* Companies House uses this address to contact you.
> *If left:* Official messages can go unread if it is out of date.
> *What to do:* Check it in your Companies House account, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.SIC_CODE — SIC code

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “SIC code”
- **Applies when:** yes
- **Passes when:** `registry.uk.companies_house.sic_codes` is yes (or present)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies House record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} has no SIC code at Companies House**
> We couldn't find a SIC code on {company}'s Companies House record.
> *Why it matters:* It tells people what your company does.
> *If left:* Banks and investors use it as a first check of what kind of business you are.
> *What to do:* Add the right code with your next confirmation statement.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.DIRECTORS — Directors on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Director appointment documentation”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Directors and PSCs on record”
- **Applies when:** yes
- **Passes when:** `registry.uk.companies_house.directors_active_count` is at least 1
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies House officers record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} has no active director at Companies House**
> We read your officers from Companies House, and none shows as an active director.
> *Why it matters:* A UK company needs a director on record to act and to file.
> *If left:* Nobody can sign for the company, and you may not be able to file on time.
> *What to do:* Appoint a director and file it with Companies House.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.SHAREHOLDERS — Shareholder details — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Shareholder details”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “Whether shareholder details can be reliably parsed”
- **Applies when:** yes
- **Passes when:** `vault.gb_register_of_members.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Register of members · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm who owns {company}**
> You haven't added your register of members, and we can't reliably read shareholders from filings yet.
> *Why it matters:* Investors need to know exactly who owns the company.
> *If left:* A mismatch between your register and your filings can hold up a round.
> *What to do:* Add your register of members.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.PSC — People with significant control

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “PSC registration”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Directors and PSCs on record”
- **Applies when:** yes
- **Passes when:** `registry.uk.companies_house.psc_active_count` is at least 1
- **A problem (defect) when:** `registry.uk.companies_house.psc_sanctioned` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies House PSC record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} has no person with significant control on record**
> We read your record from Companies House and found no active person with significant control.
> *Why it matters:* Companies have to tell Companies House who controls them. Investors and banks look at this.
> *If left:* Banks can stop onboarding, and investors will ask why it is empty.
> *What to do:* File your person with significant control with Companies House.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.DIRECTOR_IDV — Director identity checks

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Director identity verification”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “with identity verification complete after the transition deadline”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “Confirmation Statement”
- **Applies when:** yes
- **Passes when:** `derived.uk.directors_idv_complete` is yes
- **“To check” when:** all of: (`derived.uk.directors_idv_complete` is no) and (`derived.uk.directors_idv_past_due` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** registry date: {"fact":"registry.uk.companies_house.directors_idv_next_due"} (checked automatically with Companies House)
- **In force:** 2025-11-18 to no end date
- **Evidence:** Companies House officers record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **One of {company}'s directors isn't showing as verified**
> Companies House doesn't show a completed identity check for at least one of your directors, and their date has passed.
> *Why it matters:* Directors have to verify their identity with Companies House. They do it themselves, online.
> *If left:* Investors who look up the company can see it. Companies House can also take action against the director and the company.
> *What to do:* Ask your director to verify on GOV.UK. We'll see it here once it's done. If they already have, it may not be showing yet.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.PSC_IDV — PSC identity checks

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “PSC identity verification”
- **Applies when:** yes
- **Passes when:** `derived.uk.psc_idv_complete` is yes
- **“To check” when:** all of: (`derived.uk.psc_idv_complete` is no) and (`derived.uk.psc_idv_past_due` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** registry date: {"fact":"registry.uk.companies_house.psc_idv_next_due"} (checked automatically with Companies House)
- **In force:** 2025-11-18 to no end date
- **Evidence:** Companies House PSC record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **One of {company}'s people with significant control isn't showing as verified**
> Companies House doesn't show a completed identity check for someone with significant control, and their date has passed.
> *Why it matters:* People with significant control have to verify their identity, just as directors do.
> *If left:* It's visible to anyone who looks up the company.
> *What to do:* Ask them to verify on GOV.UK. We'll see it here once it's done.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.PERSONAL_CODES — Companies House personal codes

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Companies House personal codes”
- **Applies when:** yes
- **Passes when:** `attest.gb_personal_codes_held` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed your directors have their personal codes**
> We don't have your confirmation that each director has their Companies House personal code. They're not published, and we don't need to see them.
> *Why it matters:* Directors use this code for filings.
> *If left:* A filing can get held up if a director has lost theirs.
> *What to do:* Ask each director to check they have it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.CONFIRMATION_STATEMENT — Confirmation statement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Confirmation Statement”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “Confirmation Statement”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Company active; confirmation statement and accounts not overdue”
- **Applies when:** yes
- **Passes when:** `registry.uk.companies_house.confirmation_overdue` is no
- **A problem (defect) when:** `registry.uk.companies_house.confirmation_overdue` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** registry date: {"fact":"registry.uk.companies_house.confirmation_next_due"} (checked automatically with Companies House)
- **Numbers for you to confirm:** fee_gbp = 50; fee_from = "2026-02-01"
- **Evidence:** Companies House record · **Fix type:** file · **Penalty if left:** moderate

**What the company reads when it fails:**

> **{company}'s confirmation statement is overdue**
> Companies House shows your confirmation statement as overdue.
> *Why it matters:* You file this every year to confirm your company details are right.
> *If left:* Until you do, anyone who looks up the company, investors included, sees it as overdue.
> *What to do:* File it on the Companies House website. It costs £50.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.ACCOUNTS — Annual accounts

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Annual accounts”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “Annual accounts”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Company active; confirmation statement and accounts not overdue”
- **Applies when:** yes
- **Passes when:** `registry.uk.companies_house.accounts_overdue` is no
- **A problem (defect) when:** `registry.uk.companies_house.accounts_overdue` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** registry date: {"fact":"registry.uk.companies_house.accounts_next_due"} (checked automatically with Companies House)
- **Numbers for you to confirm:** first_accounts_months_after_incorporation = 21; then_months_after_year_end = 9
- **Evidence:** Companies House record · **Fix type:** file · **Penalty if left:** moderate

**What the company reads when it fails:**

> **{company}'s annual accounts are overdue**
> Companies House shows your annual accounts as overdue.
> *Why it matters:* First accounts are due 21 months after incorporation, then 9 months after each year end.
> *If left:* It's public. Lenders, investors and customers can all see it, and it gets worse the longer it's left.
> *What to do:* File your accounts with Companies House. Your accountant can do it for you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.STATUTORY_REGISTERS — Statutory registers — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Register of Members; Register of Directors; Register of PSCs”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Articles, statutory registers, board resolutions”
- **Applies when:** yes
- **Passes when:** `vault.gb_statutory_registers.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Statutory registers · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your statutory registers on file**
> You haven't added your statutory registers to your documents yet.
> *Why it matters:* Every company keeps these, unless they are held on the central register at Companies House.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your statutory registers to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.CHARGES_INSOLVENCY — Charges and insolvency

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies House |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Register of Charges”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “No outstanding charges or insolvency events”
- **Applies when:** yes
- **Passes when:** all of: (`registry.uk.companies_house.charges_outstanding_count` is 0) and (`registry.uk.companies_house.insolvency_case_count` is 0)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies House charges and insolvency records · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} has an outstanding charge or an insolvency record**
> Companies House shows an outstanding charge or an insolvency case for {company}.
> *Why it matters:* A charge means a lender has a claim over company assets. That can be normal, but investors will want to understand it.
> *If left:* It will come up in due diligence, and an old charge that has been paid off and never cleared can hold things up.
> *What to do:* If the charge has been paid off, file to have it marked as satisfied. For an insolvency record, check the case details on Companies House and in The Gazette.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.RESOLUTIONS — Board and shareholder resolutions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Board resolutions; shareholder resolutions”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Articles, statutory registers, board resolutions”
- **Applies when:** yes
- **Passes when:** `vault.gb_resolutions.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Board and shareholder resolutions · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your board and shareholder resolutions on file**
> You haven't added your board and shareholder resolutions to your documents yet.
> *Why it matters:* These are the record of the big decisions your company has made.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your board and shareholder resolutions to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.FOUNDERS_AGREEMENT — Founders' agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | founders | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Founders' Agreement; Founders' Vesting Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Founders' agreement, founders' IP assignment, NDA template”
- **Applies when:** yes
- **Passes when:** `vault.gb_founders_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Founders' agreement and vesting · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your founders' agreement on file**
> You haven't added your founders' agreement to your documents yet.
> *Why it matters:* It settles who owns what and what happens if a founder leaves.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your founders' agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CORP.DIRECTOR_SERVICE — Director service agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Director Service Agreements”
- **Applies when:** yes
- **Passes when:** `vault.gb_director_service.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Director service agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your director service agreements on file**
> You haven't added your director service agreements to your documents yet.
> *Why it matters:* As the board grows, these set out what each director is there to do.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your director service agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (10)

### GB.IP.TRADEMARK_SEARCH — Trade mark search report

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | trademarks | tier 5, the company tells us | S2 incorporated, pre-revenue | UK Intellectual Property Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 9 —: “Trademark search”
- **Applies when:** yes
- **Passes when:** `vault.gb_trademark_search.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Trade mark search report · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your trade mark search report on file**
> You haven't added your trade mark search report to your documents yet.
> *Why it matters:* A search shows whether someone else already has a mark close to yours.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your trade mark search report to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.TRADEMARK — UK trade mark

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | UK Intellectual Property Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 9 —: “Trademark application; registration certificate”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Trademark filed for the brand”
- **Applies when:** yes
- **Passes when:** `vault.gb_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.gb_trademark.dated","years":10} (checked automatically with the UK IPO)
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a UK trade mark for {company}**
> You haven't added a UK trade mark application or certificate. The UK IPO has no public lookup we can use, so we need it from you.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File for your brand with the UK IPO, or upload your certificate. We'll check its number on the IPO's page.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.PATENTS — Patent filings — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | patents | tier 4, a document the company uploads | S3 revenue, pre-raise | UK Intellectual Property Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 9 —: “Patent application; patent grant; assignment documentation”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “Espacenet / EPO OPS terms”
- **Applies when:** the answer to “Do you have technology you might want to patent?” is yes
- **Passes when:** `vault.gb_patents.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Patent filing or grant · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your patent filings on file**
> You haven't added your patent filings to your documents yet.
> *Why it matters:* You told us you have technology you might patent. Unpublished applications need an upload.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your patent filings to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.FOUNDER_ASSIGNMENT — Founders' IP assignment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 2 IP and technology | ip_ownership | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 9 —: “Copyright ownership records; copyright assignment agreements; IP ownership and transfer documentation”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Intellectual Property Assignment Agreement; Invention Assignment Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Founders' agreement, founders' IP assignment, NDA template”
- **Applies when:** yes
- **Passes when:** `vault.gb_founder_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all founders signed an IP assignment?”
- **Evidence:** Signed IP assignment from each founder · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your founders haven't signed their work over to {company}**
> You don't have a signed IP assignment from each founder.
> *Why it matters:* Without it, the founder may still own the code. Your company may not legally own the technology it is selling.
> *If left:* It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.
> *What to do:* Put a short assignment in writing, have each founder sign it, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.CONTRACTOR_ASSIGNMENT — IP assignment from contractors

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Copyright, Designs and Patents Act 1988, s90(3)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “| Contractor agreements |”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Intellectual Property Assignment Agreement; Invention Assignment Agreement”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.gb_contractor_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all contractors?”
- **Evidence:** Signed IP assignment from each contractor · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your contractors may still own what they built for {company}**
> You don't have a signed IP assignment from each contractor who has worked on your product.
> *Why it matters:* A contractor's work stays theirs unless they assign it to you in writing. A payment doesn't do it.
> *If left:* It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.
> *What to do:* Put an assignment in writing, have each contractor sign it, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.NDA — NDA template

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | confidentiality | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Non-Disclosure Agreement; Confidentiality Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Founders' agreement, founders' IP assignment, NDA template”
- **Applies when:** yes
- **Passes when:** `vault.gb_nda.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NDA template · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your NDA template on file**
> You haven't added your NDA template to your documents yet.
> *Why it matters:* You need one before you share anything sensitive with partners, investors or hires.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your NDA template to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.SOFTWARE_DEVELOPMENT — Software development agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Software Development Agreement”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.gb_software_dev.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Software development agreements · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your software development agreements on file**
> You haven't added your software development agreements to your documents yet.
> *Why it matters:* If an outside developer builds your product, this sets out what you own.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your software development agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.SOFTWARE_LICENSING — Software licences

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 9 —: “Software licensing documentation”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Software Licence Agreement”
- **Applies when:** yes
- **Passes when:** `vault.gb_software_licences.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Software licences · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your software licences on file**
> You haven't added your software licences to your documents yet.
> *Why it matters:* Investors want to see what you license in and out.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your software licences to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.OPEN_SOURCE — Open source policy and licence register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | open_source | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Open Source Software Policy; Open Source Software Licence Register”
- **Applies when:** yes
- **Passes when:** `vault.gb_open_source.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Open source policy and licence register · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your open source policy on file**
> You haven't added your open source policy to your documents yet.
> *Why it matters:* Investors want to know your code has no licence problems hiding in it.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your open source policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.IP.ESCROW — Software escrow agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | enterprise | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Software Escrow Agreement”
- **Applies when:** all of: (`derived.enterprise` is yes) and (the answer to “Has a customer asked for source code escrow?” is yes)
- **Passes when:** `vault.gb_escrow.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Software escrow agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your software escrow agreement on file**
> You haven't added your software escrow agreement to your documents yet.
> *Why it matters:* Some enterprise customers ask for this.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your software escrow agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (68)

### GB.TAX.CT_REGISTRATION — Corporation Tax registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | HMRC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 2 —: “Corporation Tax registration; UTR”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “Corporation Tax registration window”
- **Applies when:** yes
- **Passes when:** `vault.gb_ct_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** HMRC letter with your UTR · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your corporation Tax registration on file**
> You haven't added your corporation Tax registration to your documents yet.
> *Why it matters:* Your tax reference isn't public, so this letter is how we confirm it.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your corporation Tax registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.TAX.CT_RETURNS — Corporation Tax returns

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | HMRC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 2 —: “Corporation Tax payment records; returns”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “Corporation Tax returns and payments”
- **Applies when:** yes
- **Passes when:** `vault.gb_ct_returns.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":12} (reminder only)
- **Numbers for you to confirm:** return_months_after_year_end = 12; payment = "9 months and 1 day after year end"
- **Abroad:** never follows the company into another country
- **Evidence:** Corporation Tax returns and payment records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Corporation Tax returns on file**
> You haven't added your Corporation Tax returns to your documents yet.
> *Why it matters:* Investors check these, and they show you are up to date with HMRC.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Corporation Tax returns to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.TAX.VAT — VAT registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | HMRC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 2 —: “VAT registration; VAT certificate”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “VAT registration threshold”
- **Applies when:** yes
- **Passes when:** any of: (`registry.uk.hmrc_vat.registered` is yes) or (`vault.gb_vat_certificate.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** HMRC VAT check; VAT certificate · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company}'s VAT registration**
> We don't have a VAT number for {company} that we could check with HMRC.
> *Why it matters:* You register once your taxable turnover passes the threshold.
> *If left:* Late registration can mean paying VAT you never charged your customers.
> *What to do:* Give us your VAT number, or talk to your accountant about whether you need to register.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.TAX.VAT_RETURNS — VAT returns

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | HMRC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 2 —: “| VAT returns |”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “VAT returns”
- **Applies when:** `registry.uk.hmrc_vat.registered` is yes
- **Passes when:** `vault.gb_vat_returns.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every 3 months (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** VAT returns · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your VAT returns on file**
> You haven't added your VAT returns to your documents yet.
> *Why it matters:* VAT-registered companies file these quarterly.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your VAT returns to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.TAX.MTD — Making Tax Digital

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | HMRC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 2 —: “Making Tax Digital compliance”
- **Applies when:** `registry.uk.hmrc_vat.registered` is yes
- **Passes when:** `attest.gb_mtd_software` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} uses Making Tax Digital software**
> We don't have your confirmation that you use compatible software for your VAT.
> *Why it matters:* VAT-registered companies keep digital records and file through compatible software.
> *If left:* A question you can answer in a minute now can be a nuisance when HMRC asks.
> *What to do:* Check with your accountant, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.TAX.PAYE — PAYE registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment_tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | HMRC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 2 —: “PAYE registration; PAYE reference; Accounts Office reference”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_paye.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** HMRC PAYE letter · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your PAYE registration on file**
> You haven't added your PAYE registration to your documents yet.
> *Why it matters:* You register before your first payday, and the reference isn't public.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your PAYE registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.TAX.PAYROLL_RECORDS — Payroll records and employer National Insurance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment_tax | tier 5, the company tells us | S2 incorporated, pre-revenue | HMRC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 2 —: “PAYE payroll records; employer National Insurance”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “PAYE returns and remittances; employer NI”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_payroll_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every month (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** Payroll records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payroll records on file**
> You haven't added your payroll records to your documents yet.
> *Why it matters:* These returns and payments are due monthly.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your payroll records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.ICO_FEE — ICO data protection fee

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 3, official list | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “ICO data protection fee registration; registration confirmation; fee renewal”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “ICO fee renewal”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “ICO fee registration current”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** any of: (`derived.uk.ico_current` is yes) or (`vault.gb_ico_receipt.present` is yes)
- **A problem (defect) when:** `derived.uk.ico_lapsed` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** registry date: {"fact":"registry.uk.ico.expires_on"} (checked automatically with the ICO register)
- **Numbers for you to confirm:** tiers_gbp = [52,78,3763]
- **Evidence:** ICO register; Fee receipt · **Fix type:** pay · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't find {company} on the ICO register**
> We can't find {company} on the ICO register. That may not mean you haven't paid: we match on name and postcode.
> *Why it matters:* Companies that process personal data pay the ICO a fee every year, unless they're exempt. It starts at £52.
> *If left:* It's a public register, so anyone can check, and it's one of the first things a regulator looks at.
> *What to do:* Pay the fee on the ICO website. If you paid recently, give it a week to appear, or upload your receipt.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.COMPLIANCE_DOCS — Data protection records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Data protection compliance documentation”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.gb_dp_docs.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data protection records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data protection records on file**
> You haven't added your data protection records to your documents yet.
> *Why it matters:* You have to be able to show how you comply, not just comply.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data protection records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** UK GDPR, Art 37
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “DPO appointment”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.sensitive_data` is yes)
- **Passes when:** all of: (`attest.gb_dpo_appointed` is yes) and (`web.policy.dpo_contact` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; DPO contact in your notice · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm whether {company} needs a data protection officer**
> You handle sensitive data, and we don't have your confirmation of a data protection officer, or a contact in your notice.
> *Why it matters:* Large-scale monitoring or special-category data can mean you need one.
> *If left:* If you need one and don't have one, you'd be exposed the first time the ICO looks.
> *What to do:* Decide whether you need one, keep a note of why, and add the contact to your notice.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** UK GDPR, Arts 13/14
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Privacy Policy / Privacy Notice”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent compliant”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** all of: (`web.policy.privacy_notice_found` is yes) and (`web.policy.complaint_route_ico` is yes)
- **A problem (defect) when:** all of: (`web.policy.privacy_notice_found` is yes) and (`web.policy.complaint_route_ico` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s privacy notice is missing or doesn't mention the ICO**
> We looked at your website and either couldn't find a privacy notice, or it doesn't tell people they can complain to the ICO.
> *Why it matters:* People have to be told what you do with their data, and where to complain.
> *If left:* It's public, so regulators, customers and investors can all see the gap.
> *What to do:* Publish a notice with the required details.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.UK_REPRESENTATIVE — UK representative for a company outside the UK

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** UK GDPR, Arts 3(2), 13(1)(a), 27
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “UK representative appointed (added 18 Nov 2026)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.uk_established` is no) and (the answer to “Choose all that apply” includes “GB”)
- **Passes when:** any of: (`web.policy.uk_representative_named` is yes) or (`attest.gb_uk_representative` is yes)
- **“To check” when:** all of: (`web.policy.uk_representative_named` is no) and (`web.policy.language_supported` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s UK representative**
> You told us you have users in the UK and no office there, and we couldn't find a UK representative named in your privacy notice or legal pages. You haven't confirmed you have one.
> *Why it matters:* A company outside the UK that offers goods or services to people in the UK, or tracks their behaviour there, must name a representative in the UK in writing, and give its contact details in the privacy notice. Occasional, low-risk processing is exempt.
> *If left:* The ICO and people in the UK have nobody to contact, and the ICO can act on it.
> *What to do:* Appoint a UK representative, add its name and contact details to your privacy notice, then confirm here. If the exemption applies, confirm that instead.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.PROCESSING_AGREEMENT — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Data Processing Agreement”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.gb_dpa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data processing agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data processing agreements on file**
> You haven't added your data processing agreements to your documents yet.
> *Why it matters:* If vendors handle personal data for you, this agreement sets the rules.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data processing agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Records of Processing Activities”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.gb_ropa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Records of processing activities · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your records of processing on file**
> You haven't added your records of processing to your documents yet.
> *Why it matters:* It is the list of what personal data you hold and why.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your records of processing to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.BREACH — Data breach response policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Data breach response policy; breach notification records”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.gb_breach_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data breach response policy and records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach response policy on file**
> You haven't added your data breach response policy to your documents yet.
> *Why it matters:* Breaches can have to be reported to the ICO within 72 hours, so you need a plan first.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data breach response policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.RIGHTS — Data subject rights procedures

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Data subject access request procedures; data subject rights procedures”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** all of: (`attest.gb_rights_procedure` is yes) and (`web.policy.rights_section` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Rights section in your notice · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm how {company} handles people's data requests**
> We don't have your confirmation of a process, or your notice doesn't explain people's rights.
> *Why it matters:* People can ask to see or delete their data, and you have to answer them.
> *If left:* When the first request arrives you'll be working it out under a deadline.
> *What to do:* Write down your process, explain the rights in your notice, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.RETENTION — Data retention policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Data retention policy; data deletion policy”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** all of: (`attest.gb_retention_policy` is yes) and (`web.policy.retention_statement` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Retention statement in your notice · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm how long {company} keeps people's data**
> We don't have your confirmation of a retention policy, or your notice doesn't say how long you keep data.
> *Why it matters:* You shouldn't keep personal data for longer than you need it.
> *If left:* The more you keep, the more you have to answer for if something goes wrong.
> *What to do:* Set your retention periods, add them to your notice, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.COOKIE_POLICY — Cookie policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “| Cookie Policy |”
- **Applies when:** `derived.has_website` is yes
- **Passes when:** `web.policy.cookie_policy_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published cookie policy · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a cookie policy on {company}'s website**
> We couldn't find a cookie policy on your website.
> *Why it matters:* People should be able to see which cookies you use and why.
> *If left:* It's public, so it's one of the first things someone checks.
> *What to do:* Publish a cookie policy and link it from your footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** PECR, as amended by the Data (Use and Access) Act 2025
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Cookie consent mechanism”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent compliant”
- **Applies when:** `derived.has_website` is yes
- **Passes when:** `derived.web.trackers_before_consent` is no
- **A problem (defect) when:** `derived.web.trackers_before_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-02-05 to no end date
- **Evidence:** What your site set before anyone agreed · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s website sets cookies before anyone has agreed**
> We loaded your site and it set non-essential cookies or loaded trackers before anyone agreed.
> *Why it matters:* Non-essential cookies have to wait for consent, and rejecting has to be as easy as accepting.
> *If left:* Anyone can see this from outside, and it's one of the things the ICO checks.
> *What to do:* Set up your consent banner to hold those tags back until someone agrees.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.TRANSFERS — International data transfer records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “International data transfer documentation; IDTA; UK Addendum to EU SCCs”
- **Applies when:** `derived.data_outside_home` is yes
- **Passes when:** `vault.gb_transfers.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** International data transfer records (IDTA or UK Addendum) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your international data transfer records on file**
> You haven't added your international data transfer records to your documents yet.
> *Why it matters:* If data leaves the UK, you need one of these in place.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your international data transfer records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.AUDIT_TRAINING — Data protection audit and training records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Data protection audit documentation; training records”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.gb_dp_training.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data protection audit and training records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data protection audit and training records on file**
> You haven't added your data protection audit and training records to your documents yet.
> *Why it matters:* It shows your team knows what to do.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data protection audit and training records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.DP.COMPLAINTS — Data protection complaints procedure — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “Data protection complaint handling procedures”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “complaints-handling duty commencement”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.gb_dp_complaints` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-06-19 to no end date
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} handles data protection complaints**
> We don't have your confirmation of a complaints route for data protection.
> *Why it matters:* People should be able to complain to you directly about how you use their data.
> *If left:* Without one, complaints go straight to the regulator.
> *What to do:* Add a complaints route to your notice, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.FCA_AUTHORISATION — FCA authorisation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | financial_regulation | tier 1, official source, read live | S2 incorporated, pre-revenue | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “FCA authorisation; registration; confirmation; permissions; Financial Services Register entry”
- **Applies when:** `derived.sector.uk_financial` is yes
- **Passes when:** any of: (`vault.gb_fca_authorisation.present` is yes) or (`vault.gb_licensed_partner_agreement.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Do you have a signed agreement with them? You can upload it under Documents.”
- **Evidence:** Financial Services Register entry; Agreement with authorised partner · **Fix type:** register · **Penalty if left:** severe

**What the company reads when it fails:**

> **We can't see how {company} is authorised for regulated financial services**
> You told us you work in financial services, and we don't have an FCA firm number or an agreement with an authorised partner.
> *Why it matters:* You need this before you carry out any regulated activity.
> *If left:* Operating without it is a serious matter, and no investor will close until it is clear.
> *What to do:* Give us your FRN, or add the agreement with your authorised partner. If you're not sure you need it, check the FCA's guidance on regulated activities before you go on.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.PAYMENT_INSTITUTION — Payment or e-money institution authorisation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | payments | tier 1, official source, read live | S2 incorporated, pre-revenue | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Payment Institution authorisation; Small PI registration; EMI authorisation; Small EMI registration”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** any of: (`vault.gb_payment_institution.present` is yes) or (`vault.gb_licensed_partner_agreement.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Payment or e-money institution authorisation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payment or e-money authorisation on file**
> You haven't added your payment or e-money authorisation to your documents yet.
> *Why it matters:* If you move money yourself, you need one of these.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your payment or e-money authorisation to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.AISP — Account information service registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 1, official source, read live | S2 incorporated, pre-revenue | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “AISP registration; Open Banking registration”
- **Applies when:** the answer to “Do you read customers' bank account data?” is yes
- **Passes when:** `vault.gb_aisp.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Account information or Open Banking registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your account information or Open Banking registration on file**
> You haven't added your account information or Open Banking registration to your documents yet.
> *Why it matters:* You need this to read customers' bank data.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your account information or Open Banking registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.CONSUMER_CREDIT — Consumer credit permissions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | lending | tier 1, official source, read live | S2 incorporated, pre-revenue | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Consumer Credit permissions”
- **Applies when:** `derived.sector.lending` is yes
- **Passes when:** `vault.gb_consumer_credit.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Consumer credit permissions · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your consumer credit permissions on file**
> You haven't added your consumer credit permissions to your documents yet.
> *Why it matters:* Lending to consumers needs FCA permission.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your consumer credit permissions to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.CRYPTO — Cryptoasset business registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | crypto | tier 1, official source, read live | S2 incorporated, pre-revenue | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Cryptoasset business registration”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “cryptoasset authorisation regime timing”
- **Applies when:** `derived.sector.crypto` is yes
- **Passes when:** `vault.gb_crypto_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Cryptoasset business registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your cryptoasset business registration on file**
> You haven't added your cryptoasset business registration to your documents yet.
> *Why it matters:* Crypto businesses register with the FCA, and a fuller regime is expected.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your cryptoasset business registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.AML_REGISTRATION — AML registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | financial_crime | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “AML registration”
- **Applies when:** `derived.sector.crypto` is yes
- **Passes when:** `vault.gb_aml_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** AML registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AML registration on file**
> You haven't added your AML registration to your documents yet.
> *Why it matters:* Businesses under the money laundering rules have to register with a supervisor.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your AML registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.APPROVED_PERSONS — Approved persons and senior management functions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | financial_regulation | tier 1, official source, read live | S2 incorporated, pre-revenue | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Approved Person / Senior Management Function approvals”
- **Applies when:** `derived.sector.uk_financial` is yes
- **Passes when:** `vault.gb_approved_persons.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Senior manager approvals · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your senior manager approvals on file**
> You haven't added your senior manager approvals to your documents yet.
> *Why it matters:* Authorised firms have named, approved senior people.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your senior manager approvals to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.COMPLIANCE_MANUAL — Compliance manual and AML policies

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | financial_crime | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Compliance Manual; AML Policy; CDD and KYC procedures; sanctions screening policy; financial crime risk assessment”
- **Applies when:** `derived.sector.uk_financial` is yes
- **Passes when:** `vault.gb_compliance_manual.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Compliance manual and AML policies · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your compliance manual and AML policies on file**
> You haven't added your compliance manual and AML policies to your documents yet.
> *Why it matters:* Financial businesses need written procedures for financial crime.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your compliance manual and AML policies to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.CONSUMER_DUTY — Consumer Duty records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | financial_regulation | tier 5, the company tells us | S3 revenue, pre-raise | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Consumer Duty compliance documentation”
- **Applies when:** all of: (`derived.sector.uk_financial` is yes) and (`derived.consumer` is yes)
- **Passes when:** `vault.gb_consumer_duty.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Consumer Duty records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Consumer Duty records on file**
> You haven't added your Consumer Duty records to your documents yet.
> *Why it matters:* Firms with retail customers have to show they get good outcomes.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Consumer Duty records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.REPORTING — Regulatory reporting records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | financial_regulation | tier 5, the company tells us | S3 revenue, pre-raise | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Regulatory reporting documentation”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “FCA regulatory returns and annual fees”
- **Applies when:** `derived.sector.uk_financial` is yes
- **Passes when:** `vault.gb_fin_reporting.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Regulatory reporting records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your regulatory reporting records on file**
> You haven't added your regulatory reporting records to your documents yet.
> *Why it matters:* Returns and fees vary by firm type, so keep a record of what you file.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your regulatory reporting records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.SAFEGUARDING — Safeguarding records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 5, the company tells us | S3 revenue, pre-raise | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Safeguarding documentation”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** `vault.gb_safeguarding.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** audit_threshold_gbp = 100000
- **In force:** 2026-05-07 to no end date
- **Evidence:** Safeguarding records and audit · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your safeguarding records on file**
> You haven't added your safeguarding records to your documents yet.
> *Why it matters:* If you hold customers' money, it has to be kept safe and, above £100k, audited each year.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your safeguarding records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FIN.WIND_DOWN — Wind-down plan and capital records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | financial_regulation | tier 5, the company tells us | S3 revenue, pre-raise | Financial Conduct Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Wind-down plan; regulatory capital documentation”
- **Applies when:** `derived.sector.uk_financial` is yes
- **Passes when:** `vault.gb_wind_down.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Wind-down plan and capital records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your wind-down plan and capital records on file**
> You haven't added your wind-down plan and capital records to your documents yet.
> *Why it matters:* Authorised firms should show they could close safely.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your wind-down plan and capital records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SECTOR.PSR — Payment system regulator records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | payments | tier 5, the company tells us | S3 revenue, pre-raise | Payment Systems Regulator |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 5 —: “Payment system regulatory compliance documentation; PSR notifications”
- **Applies when:** `derived.sector.payment_system` is yes
- **Passes when:** `vault.gb_psr.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Payment system regulator records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payment system regulator records on file**
> You haven't added your payment system regulator records to your documents yet.
> *Why it matters:* Only applies if you run a designated payment system.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your payment system regulator records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SECTOR.OFCOM_CONDITIONS — Ofcom General Conditions — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | telecoms | tier 5, the company tells us | S2 incorporated, pre-revenue | Ofcom |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 6 —: “General Conditions of Entitlement compliance”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 2. Consolidation notes: “"Ofcom telecommunications licence" is not a licence”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `attest.gb_ofcom_general_conditions` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} meets Ofcom's General Conditions**
> You told us you are in telecoms, and we don't have your confirmation you meet the General Conditions.
> *Why it matters:* There's no general telecoms licence. Providers operate under these conditions instead.
> *If left:* Ofcom expects you to meet them from your first day, even though there's nothing to apply for.
> *What to do:* Check the conditions against how you operate, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SECTOR.TELECOMS_DOCS — Emergency call and equipment records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | telecoms | tier 5, the company tells us | S3 revenue, pre-raise | Ofcom |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 6 —: “Emergency communications compliance; telecommunications equipment compliance”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `vault.gb_telecoms_docs.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Emergency call and equipment records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your emergency call and equipment records on file**
> You haven't added your emergency call and equipment records to your documents yet.
> *Why it matters:* Telecoms providers keep these on file.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your emergency call and equipment records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SECTOR.OFCOM_REPORTING — Ofcom regulatory reporting

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | telecoms | tier 5, the company tells us | S3 revenue, pre-raise | Ofcom |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 6 —: “Ofcom regulatory reporting”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `vault.gb_ofcom_reporting.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Ofcom returns · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Ofcom returns on file**
> You haven't added your Ofcom returns to your documents yet.
> *Why it matters:* These are filed annually.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Ofcom returns to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.PENSION — Workplace pension and auto-enrolment — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | The Pensions Regulator |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Workplace pension scheme; scheme registration”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “Pensions: declaration-of-compliance deadline”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_pension_declaration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every month (reminder only)
- **Abroad:** follows the company only where it employs people
- **Evidence:** Declaration of compliance · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't see {company}'s pension declaration**
> You have employees, and you haven't added your declaration of compliance.
> *Why it matters:* Pension duties start on your first employee's start date, and a declaration of compliance is due within 5 months.
> *If left:* It's an easy thing to miss when you are busy hiring.
> *What to do:* Complete the declaration with The Pensions Regulator and upload it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.RIGHT_TO_WORK — Right to work checks

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Home Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Right to Work verification records; checks”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.gb_right_to_work_checks` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation for each hire · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed right to work checks for your team**
> We don't have your confirmation that every employee has had a right to work check.
> *Why it matters:* Employers check and keep a record of this for each hire.
> *If left:* It's a common question in due diligence, and it's hard to fix late.
> *What to do:* Check your records, complete anything missing, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.MIN_WAGE — National Minimum Wage records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “National Minimum Wage compliance documentation”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_min_wage.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** National Minimum Wage records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your National Minimum Wage records on file**
> You haven't added your National Minimum Wage records to your documents yet.
> *Why it matters:* Employers keep a record that they pay at least the minimum.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your National Minimum Wage records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.WORKING_TIME — Holiday and working time records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Holiday and working time records”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_working_time.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Holiday and working time records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your holiday and working time records on file**
> You haven't added your holiday and working time records to your documents yet.
> *Why it matters:* Employers keep these for their staff.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your holiday and working time records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.LIABILITY_INSURANCE — Employers' liability insurance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Employers' Liability Insurance certificate”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 18 —: “Licence renewals; insurance renewals”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_el_insurance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** expiry: {"fact":"vault.gb_el_insurance.expires_on"} (reminder only)
- **Numbers for you to confirm:** minimum_cover_gbp = 5000000
- **Abroad:** follows the company only where it employs people
- **Evidence:** Insurance certificate · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't see {company}'s employers' liability insurance**
> You have employees, and you haven't added an employers' liability certificate.
> *Why it matters:* It's compulsory for most employers, with at least £5m of cover, and it has to be available to your staff.
> *If left:* If someone is hurt at work, the company could be left paying without cover.
> *What to do:* Buy the cover if you need to, and upload the certificate. We read the expiry date from it and remind you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.SPONSOR_LICENCE — Sponsor licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | immigration | tier 3, official list | S3 revenue, pre-raise | Home Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “| Sponsor licence |”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “Home Office sponsor register”
- **Applies when:** `derived.foreign_workers` is yes
- **Passes when:** `vault.gb_sponsor_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Sponsor licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your sponsor licence on file**
> You haven't added your sponsor licence to your documents yet.
> *Why it matters:* If you sponsor workers from outside the UK, you need a licence. It's on a public register.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your sponsor licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.VISA_RECORDS — Certificates of sponsorship and visa records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | immigration | tier 5, the company tells us | S3 revenue, pre-raise | Home Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Certificate of Sponsorship; Skilled Worker visa documentation; immigration compliance records”
- **Applies when:** `derived.foreign_workers` is yes
- **Passes when:** `attest.gb_visa_records_held` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Held or not held, per role · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed you hold visa records for sponsored staff**
> You told us you sponsor workers, and we don't have your confirmation that records are held for each role.
> *Why it matters:* These are personal documents, so we only ask whether you hold them, not for copies.
> *If left:* Missing records can put your sponsor licence at risk.
> *What to do:* Check your records for each sponsored role, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EXPORT.LICENCE — Export licence

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | export_control | tier 4, a document the company uploads | S3 revenue, pre-raise | Department for Business and Trade |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 8 —: “Export licence; strategic export control licence; dual-use technology export authorisation”
- **Applies when:** `derived.exports` is yes
- **Passes when:** `vault.gb_export_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Export licence or OGEL registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your export licence on file**
> You haven't added your export licence to your documents yet.
> *Why it matters:* Encryption, AI or other controlled technology sold abroad can need a licence, and these aren't public.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your export licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EXPORT.IMPORT_LICENCE — Import licence

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | export_control | tier 4, a document the company uploads | S3 revenue, pre-raise | Department for Business and Trade |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 8 —: “Import licence”
- **Applies when:** `derived.exports` is yes
- **Passes when:** `vault.gb_import_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Import licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your import licence on file**
> You haven't added your import licence to your documents yet.
> *Why it matters:* Controlled goods coming into the UK can need one.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your import licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SANCT.SCREENING — Sanctions and export control records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | sanctions | tier 5, the company tells us | S3 revenue, pre-raise | Department for Business and Trade |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 8 —: “UK trade sanctions compliance documentation; export control compliance documentation”
- **Applies when:** `derived.sanctions_exposure` is yes
- **Passes when:** all of: (`vault.gb_sanctions_docs.present` is yes) and (`registry.sanctions.match` is no)
- **A problem (defect) when:** `registry.sanctions.match` is yes
- **“To check” when:** `registry.sanctions.possible_match` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Sanctions records; Screening against the UK Sanctions List · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm how {company} handles sanctions**
> We don't have your sanctions records, or your name matched an entry on a sanctions list. A match may be another business with a similar name.
> *Why it matters:* If you export or move money, you should check who you are dealing with.
> *If left:* Banks and payment partners will ask, and an unresolved match can stop your payments.
> *What to do:* Add your policy and records. If there is a match, compare the entry with your details before you go on.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SEC.CYBER_ESSENTIALS — Cyber Essentials — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 3, official list | S3 revenue, pre-raise | NCSC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 10 —: “Cyber Essentials certification; Cyber Essentials Plus”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “IASME Cyber Essentials register”
- **Applies when:** `derived.enterprise` is yes
- **Passes when:** `vault.gb_cyber_essentials.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Cyber Essentials certificate · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Cyber Essentials certificate on file**
> You haven't added your Cyber Essentials certificate to your documents yet.
> *Why it matters:* Many public-sector contracts require it, and it renews every year.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Cyber Essentials certificate to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SEC.POLICIES — Information security policies

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 10 —: “Cybersecurity compliance documentation; risk assessment; Information Security Policy”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Cybersecurity Policy; Software Security Documentation”
- **Applies when:** yes
- **Passes when:** `vault.gb_security_policies.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Information security policies · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your information security policies on file**
> You haven't added your information security policies to your documents yet.
> *Why it matters:* Enterprise customers and investors expect these in writing.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your information security policies to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SEC.INCIDENT_RESPONSE — Incident response plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 10 —: “Incident Response Plan”
- **Applies when:** yes
- **Passes when:** `vault.gb_incident_response.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Incident response plan · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your incident response plan on file**
> You haven't added your incident response plan to your documents yet.
> *Why it matters:* You need to know who does what before something goes wrong.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your incident response plan to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SEC.CONTINUITY — Business continuity and disaster recovery plans

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 10 —: “Business Continuity Plan; Disaster Recovery Plan”
- **Applies when:** yes
- **Passes when:** `vault.gb_continuity.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Business continuity and disaster recovery plans · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your continuity and disaster recovery plans on file**
> You haven't added your continuity and disaster recovery plans to your documents yet.
> *Why it matters:* Larger customers ask what happens if your systems go down.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your continuity and disaster recovery plans to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SEC.PEN_TESTS — Penetration test reports

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 10 —: “Penetration testing reports”
- **Applies when:** yes
- **Passes when:** `vault.gb_pen_tests.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Penetration test reports · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your penetration test reports on file**
> You haven't added your penetration test reports to your documents yet.
> *Why it matters:* Investors and enterprise customers expect to see these.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your penetration test reports to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SEC.VULNERABILITY_DISCLOSURE — Vulnerability disclosure policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Vulnerability Disclosure Policy”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.security_txt_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** /.well-known/security.txt or a published policy · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a way to report security issues to {company}**
> We couldn't find a security.txt file or a published vulnerability policy on your site.
> *Why it matters:* It gives people who find a security problem a clear way to tell you.
> *If left:* If they have no way to reach you, a problem can stay open or end up public.
> *What to do:* Publish a short policy and add a security.txt file to your site.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.PREMISES.PERMISSIONS — Business premises permissions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | premises | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Local authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 11 —: “Business premises registration; planning permission; change of use approval”
- **Applies when:** `derived.premises` is yes
- **Passes when:** `vault.gb_premises.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Business premises permissions · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your premises permissions on file**
> You haven't added your premises permissions to your documents yet.
> *Why it matters:* What you need varies by council. Add what applies to your premises.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your premises permissions to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.PREMISES.SAFETY — Fire safety and premises safety records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | premises | tier 5, the company tells us | S2 incorporated, pre-revenue | Local authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 11 —: “Fire safety documentation; health and safety compliance documentation; waste management documentation”
- **Applies when:** `derived.premises` is yes
- **Passes when:** `vault.gb_premises_safety.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Fire and premises safety records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your fire and premises safety records on file**
> You haven't added your fire and premises safety records to your documents yet.
> *Why it matters:* If you occupy premises, you keep these on file.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your fire and premises safety records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.HS_POLICY — Health and safety policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | health_safety | tier 5, the company tells us | S2 incorporated, pre-revenue | Health and Safety Executive |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 12 —: “Health and Safety Policy”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_hs_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Health and safety policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your health and safety policy on file**
> You haven't added your health and safety policy to your documents yet.
> *Why it matters:* A written policy is required at 5 or more employees.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your health and safety policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.RISK_ASSESSMENT — Workplace risk assessments

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | health_safety | tier 5, the company tells us | S2 incorporated, pre-revenue | Health and Safety Executive |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 12 —: “Workplace risk assessment; DSE assessment; fire risk assessment”
- **Applies when:** any of: (`derived.employees` is yes) or (`derived.premises` is yes)
- **Passes when:** `vault.gb_risk_assessments.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Workplace risk assessments · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your workplace risk assessments on file**
> You haven't added your workplace risk assessments to your documents yet.
> *Why it matters:* Screen work and fire risks count, even in an office.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your workplace risk assessments to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.ACCIDENT_RECORDS — Accident and incident records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | health_safety | tier 5, the company tells us | S2 incorporated, pre-revenue | Health and Safety Executive |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 12 —: “Accident and incident records; RIDDOR reporting”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_accident_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Accident and incident records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your accident records on file**
> You haven't added your accident records to your documents yet.
> *Why it matters:* Employers keep these, and some incidents have to be reported.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your accident records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.SAFETY_TRAINING — Workplace safety training records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | health_safety | tier 5, the company tells us | S3 revenue, pre-raise | Health and Safety Executive |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 12 —: “Workplace safety training records”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_safety_training.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Safety training records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your safety training records on file**
> You haven't added your safety training records to your documents yet.
> *Why it matters:* Employers keep a record of what their team was shown.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your safety training records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.HEALTH.MHRA — MHRA medical device registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | healthtech | tier 3, official list | S3 revenue, pre-raise | MHRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 15 and 14: “MHRA medical device registration”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “MHRA PARD export”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.gb_mhra.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** MHRA registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your MHRA registration on file**
> You haven't added your MHRA registration to your documents yet.
> *Why it matters:* Devices and software as a medical device are registered before going on the market.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your MHRA registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.HEALTH.CONFORMITY — Conformity assessment and marking

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | healthtech | tier 5, the company tells us | S3 revenue, pre-raise | MHRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 15 and 14: “Conformity assessment; UKCA marking; CE marking”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.gb_conformity.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Declaration of Conformity and technical documents · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your conformity assessment and marking records on file**
> You haven't added your conformity assessment and marking records to your documents yet.
> *Why it matters:* These are what lets a medical device carry its mark.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your conformity assessment and marking records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.HEALTH.CLINICAL_INVESTIGATION — Clinical investigation approval

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S3 revenue, pre-raise | MHRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 15 and 14: “Clinical investigation approval”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.gb_clinical_investigation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Clinical investigation approval · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your clinical investigation approval on file**
> You haven't added your clinical investigation approval to your documents yet.
> *Why it matters:* Only applies if you run clinical investigations.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your clinical investigation approval to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.HEALTH.CQC — CQC registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | healthtech | tier 1, official source, read live | S2 incorporated, pre-revenue | Care Quality Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 15 and 14: “CQC registration”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “CQC API status”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.gb_cqc.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CQC registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CQC registration on file**
> You haven't added your CQC registration to your documents yet.
> *Why it matters:* Regulated health activities need this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your CQC registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.HEALTH.NHS — NHS compliance records — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S3 revenue, pre-raise | NHS England |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 15 and 14: “NHS England compliance documentation; DSPT; DTAC; DCB0129; DCB0160”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “DSPT published status”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.gb_nhs.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NHS compliance records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NHS compliance records (DSPT, DTAC, DCB0129) on file**
> You haven't added your NHS compliance records (DSPT, DTAC, DCB0129) to your documents yet.
> *Why it matters:* NHS customers ask for these before they buy.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NHS compliance records (DSPT, DTAC, DCB0129) to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SECTOR.PRA — PRA authorisation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | banking | tier 1, official source, read live | S2 incorporated, pre-revenue | Prudential Regulation Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 14 —: “PRA authorisation”
- **Applies when:** `derived.sector.banking` is yes
- **Passes when:** `vault.gb_pra.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** PRA authorisation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your PRA authorisation on file**
> You haven't added your PRA authorisation to your documents yet.
> *Why it matters:* Only applies if the company itself is a bank.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your PRA authorisation to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SECTOR.GAMBLING — Gambling operating licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | gambling | tier 3, official list | S2 incorporated, pre-revenue | Gambling Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 14 —: “Gambling operating licence”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “Gambling Commission and Ofgem register exports”
- **Applies when:** `derived.sector.gambling` is yes
- **Passes when:** `vault.gb_gambling.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Gambling operating licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your gambling operating licence on file**
> You haven't added your gambling operating licence to your documents yet.
> *Why it matters:* Gambling products need this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your gambling operating licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.SECTOR.OFGEM — Ofgem energy licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | energy | tier 3, official list | S2 incorporated, pre-revenue | Ofgem |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 14 —: “Ofgem energy licence”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “Gambling Commission and Ofgem register exports”
- **Applies when:** `derived.sector.energy` is yes
- **Passes when:** `vault.gb_ofgem.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Ofgem energy licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your ofgem energy licence on file**
> You haven't added your ofgem energy licence to your documents yet.
> *Why it matters:* Energy supply needs this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your ofgem energy licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (20)

### GB.FIN.COMPLAINTS — Complaints handling policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | financial_regulation | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 4 —: “Complaints handling policy”
- **Applies when:** `derived.sector.uk_financial` is yes
- **Passes when:** `vault.gb_fin_complaints.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Complaints handling policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your complaints handling policy on file**
> You haven't added your complaints handling policy to your documents yet.
> *Why it matters:* Regulated firms need one.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your complaints handling policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.CONTRACTS — Employment contracts

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “| Employment contracts |”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_employment_contracts.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employment contracts · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employment contracts on file**
> You haven't added your employment contracts to your documents yet.
> *Why it matters:* Written statements are due by day one, and they should cover IP.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your employment contracts to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.HANDBOOK — Staff handbook

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | employment_contracts | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Employee handbook / staff handbook”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_handbook.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Staff handbook · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your staff handbook on file**
> You haven't added your staff handbook to your documents yet.
> *Why it matters:* As you grow, it keeps your policies in one place.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your staff handbook to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.CONTRACTOR_AGREEMENTS — Contractor agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “| Contractor agreements |”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Consultancy Agreement”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.gb_contractor_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Contractor and consultancy agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your contractor agreements on file**
> You haven't added your contractor agreements to your documents yet.
> *Why it matters:* Each should have a written IP assignment, and a note on IR35 status.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your contractor agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.ONBOARDING — Employee onboarding records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Employee onboarding documentation”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_onboarding.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employee onboarding records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employee onboarding records on file**
> You haven't added your employee onboarding records to your documents yet.
> *Why it matters:* A simple checklist means no new hire misses a signature.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your employee onboarding records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.POLICIES — Equality and grievance policies

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | employment_contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Equality and diversity policy; disciplinary and grievance procedures”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_hr_policies.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Equality, disciplinary and grievance policies · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your equality, disciplinary and grievance policies on file**
> You haven't added your equality, disciplinary and grievance policies to your documents yet.
> *Why it matters:* These help you handle people problems fairly when they come up.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your equality, disciplinary and grievance policies to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EMP.WHISTLEBLOWING — Whistleblowing policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | employment_contracts | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Sections 7 and 13: “Whistleblowing policy”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.gb_whistleblowing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Whistleblowing policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your whistleblowing policy on file**
> You haven't added your whistleblowing policy to your documents yet.
> *Why it matters:* It gives staff a safe way to raise concerns.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your whistleblowing policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CONSUMER.ASA — Advertising code compliance — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | marketing | tier 5, the company tells us | S3 revenue, pre-raise | Advertising Standards Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 14 —: “ASA Advertising Code compliance”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `vault.gb_asa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Advertising compliance records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your advertising compliance records on file**
> You haven't added your advertising compliance records to your documents yet.
> *Why it matters:* If you sell to consumers, your marketing should meet the Advertising Code.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your advertising compliance records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CONSUMER.CMA — Consumer law compliance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | Competition and Markets Authority |

- **Law cited:** Digital Markets, Competition and Consumers Act 2024
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 14 —: “CMA competition and consumer law compliance”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `vault.gb_cma.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Consumer law records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your consumer law records on file**
> You haven't added your consumer law records to your documents yet.
> *Why it matters:* Consumer law covers things like drip pricing and fake reviews.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your consumer law records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CONSUMER.TRADING_STANDARDS — Product and consumer compliance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | Trading Standards |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 14 —: “Trading Standards product and consumer compliance”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.physical_products` is yes)
- **Passes when:** `vault.gb_trading_standards.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Product compliance records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your product compliance records on file**
> You haven't added your product compliance records to your documents yet.
> *Why it matters:* Physical products sold to consumers have their own safety rules.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your product compliance records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.TERMS — Website terms

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | terms | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Website Terms and Conditions”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “| Terms of Service |”
- **Applies when:** `derived.has_website` is yes
- **Passes when:** `web.policy.terms_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published terms · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find terms on {company}'s website**
> We couldn't find published terms on your website.
> *Why it matters:* Your terms set the limits of what you owe your customers.
> *If left:* Customers and investors will ask for them, and it's public, so it's easy to spot.
> *What to do:* Publish your terms and link them from your site footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.SAAS — SaaS agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “SaaS Agreement”
- **Applies when:** `derived.takes_payments` is yes
- **Passes when:** `vault.gb_saas.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** SaaS agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your saaS agreement on file**
> You haven't added your saaS agreement to your documents yet.
> *Why it matters:* It is the contract your customers sign, so investors read it.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your saaS agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.API_TERMS — API terms

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | terms | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “API Terms and Conditions”
- **Applies when:** `derived.has_api` is yes
- **Passes when:** `vault.gb_api_terms.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** API terms · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your API terms on file**
> You haven't added your API terms to your documents yet.
> *Why it matters:* If others build on your API, this sets the rules.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your API terms to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.EULA — End user licence agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | terms | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “End User Licence Agreement”
- **Applies when:** `derived.has_app` is yes
- **Passes when:** `web.policy.eula_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published EULA or App Store listing · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find an end user licence for {company}'s app**
> You told us you have an app, and we couldn't find a published licence for it.
> *Why it matters:* It sets the terms on which people can use your app.
> *If left:* App stores and larger customers can ask for it.
> *What to do:* Publish your licence and link it from your site and your App Store listing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.ACCEPTABLE_USE — Acceptable use policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | terms | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Acceptable Use Policy”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.acceptable_use_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published policy · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find an acceptable use policy on {company}'s website**
> We couldn't find a published acceptable use policy.
> *Why it matters:* It says what users can and cannot do with your product.
> *If left:* Without it, it is harder to act when someone misuses your service.
> *What to do:* Publish a short policy and link it from your terms.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.SLA — Service level agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Service Level Agreement”
- **Applies when:** `derived.enterprise` is yes
- **Passes when:** `vault.gb_sla.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Service level agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your service level agreement on file**
> You haven't added your service level agreement to your documents yet.
> *Why it matters:* Enterprise customers will want this before they sign.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your service level agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.PRODUCT_LIABILITY — Product liability and consumer records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “Product Liability and Consumer Compliance Documentation”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `vault.gb_product_liability.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Product liability records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your product liability records on file**
> You haven't added your product liability records to your documents yet.
> *Why it matters:* If you sell to consumers, it helps to know where you stand.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your product liability records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.SUPPLIER — Commercial services and supplier agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Commercial Services Agreement; Supplier Agreement”
- **Applies when:** yes
- **Passes when:** `vault.gb_supplier.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Commercial and supplier agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your supplier agreements on file**
> You haven't added your supplier agreements to your documents yet.
> *Why it matters:* Investors want to see what you have agreed with your main partners.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your supplier agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.CONSUMER.TERMS — Consumer terms, refunds and complaints — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_terms | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Consumer Rights Act 2015; Digital Markets, Competition and Consumers Act 2024
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Consumer Terms and Conditions; Refund and Cancellation Policy; Complaints Policy”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, 6. Thresholds: “DMCC Act subscription-contract rules commencement”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** all of: (`web.policy.terms_found` is yes) and (`web.policy.refund_policy_found` is yes) and (`web.policy.complaints_policy_found` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published consumer terms and policies · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find all of {company}'s consumer terms**
> We couldn't find all of your consumer terms, refund policy and complaints policy on your website.
> *Why it matters:* Consumers need to see their rights, how to get a refund and how to complain.
> *If left:* Disputes get harder to settle without them.
> *What to do:* Publish all three and link them from your site footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.COM.ACCESSIBILITY — Accessibility statement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | accessibility | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Website Accessibility Statement”
- **Applies when:** `derived.has_website` is yes
- **Passes when:** `web.policy.accessibility_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published statement · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find an accessibility statement on {company}'s website**
> We couldn't find an accessibility statement.
> *Why it matters:* Public-sector bodies must have one, and others may need one by contract or as good practice.
> *If left:* Public-sector and larger customers can ask for it.
> *What to do:* Publish a statement giving the WCAG version, conformance level, contact and date.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (4)

### GB.EQUITY.EIS_SEIS — EIS or SEIS advance assurance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | HMRC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 2 —: “EIS advance assurance; SEIS advance assurance”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.gb_eis_seis.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** EIS or SEIS advance assurance letter · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your EIS or SEIS advance assurance on file**
> You haven't added your EIS or SEIS advance assurance to your documents yet.
> *Why it matters:* UK angels and VCs often ask for it. It's not public, so we need your letter.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your EIS or SEIS advance assurance to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EQUITY.SHAREHOLDERS_AGREEMENT — Shareholders' agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Shareholders' Agreement”
- **Applies when:** yes
- **Passes when:** `vault.gb_shareholders_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Shareholders' agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your shareholders' agreement on file**
> You haven't added your shareholders' agreement to your documents yet.
> *Why it matters:* It sets out what happens when a shareholder leaves or wants to sell.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your shareholders' agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.EQUITY.OPTION_SCHEME — Share option scheme

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | employee_equity | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Share Option Plan; EMI Share Option Scheme documentation”
- **Applies when:** `derived.equity_incentives` is yes
- **Passes when:** `vault.gb_option_scheme.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Share option plan and EMI records · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your share option scheme on file**
> You haven't added your share option scheme to your documents yet.
> *Why it matters:* Investors will check every option has a plan behind it, and EMI options have to be notified to HMRC.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your share option scheme to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.FUND.ROUND_DOCUMENTS — Round documents

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 17 —: “Investment Agreement; SAFE Agreement; Convertible Loan Note Agreement; Subscription Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 1 —: “Share allotment filings (SH01)”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.gb_round_documents.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Investment agreements; SH01 filings · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have the documents from {company}'s earlier rounds**
> You told us you have raised or are raising, and you haven't added your investment documents.
> *Why it matters:* These show what investors were promised, and they should match the share allotments filed at Companies House.
> *If left:* Investors in your next round will want the paper trail for every earlier one.
> *What to do:* Add your investment agreements, SAFEs or loan notes.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (6)

### GB.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | Information Commissioner's Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 3 —: “| DPIA |”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.gb_dpia.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data protection impact assessment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data protection impact assessment on file**
> You haven't added your data protection impact assessment to your documents yet.
> *Why it matters:* High-risk processing, AI and profiling call for this in writing.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your data protection impact assessment to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.AI.GOVERNANCE — AI governance policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “AI Governance Policy”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.gb_ai_governance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_governance` (counted once per company)
- **Evidence:** AI governance policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI governance policy on file**
> You haven't added your AI governance policy to your documents yet.
> *Why it matters:* As you scale, this shows who is responsible for your AI decisions.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your AI governance policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.AI.RISK_ASSESSMENT — AI risk and impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** UK GDPR, Art 22A-D
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “AI Risk Assessment; AI Impact Assessment”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.gb_ai_risk.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_risk_assessment` (counted once per company)
- **Evidence:** AI risk and impact assessment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI risk and impact assessment on file**
> You haven't added your AI risk and impact assessment to your documents yet.
> *Why it matters:* It records what could go wrong with your AI, and links to your DPIA.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your AI risk and impact assessment to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.AI.TRANSPARENCY — AI transparency

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “AI Transparency Documentation”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.gb_ai_transparency.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_transparency` (counted once per company)
- **Evidence:** Published AI disclosures; Transparency records · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find AI disclosures for {company}**
> You told us you use AI, and we couldn't find anything on your website that tells users about it.
> *Why it matters:* People should know when and how AI is being used in your product.
> *If left:* Enterprise customers and investors are starting to ask for this.
> *What to do:* Add a short AI section to your site, or add the record here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.AI.MODEL_DOCS — AI model and training data records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “AI Model Documentation; AI Training Data Documentation; AI Copyright and Licensing Records”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.gb_ai_model_docs.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_model_docs` (counted once per company)
- **Evidence:** AI model, training data and licensing records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI model and training data records on file**
> You haven't added your AI model and training data records to your documents yet.
> *Why it matters:* These show you have the rights to what your models were trained on.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your AI model and training data records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### GB.AI.VENDORS — AI supplier agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-uk-rule-pack-map.md`, Section 16 —: “AI Supplier and Vendor Agreements”
- **Applies when:** `derived.ai_third_party_models` is yes
- **Passes when:** `vault.gb_ai_vendors.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_vendors` (counted once per company)
- **Evidence:** AI supplier agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI supplier agreements on file**
> You haven't added your AI supplier agreements to your documents yet.
> *Why it matters:* If you use third-party models, these say what happens to your data and who owns the output.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your AI supplier agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (97)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `gb_articles` | Articles of association | If yours were amended and not filed, we need the current version. | tier 4 | no | GB.CORP.ARTICLES |
| `gb_register_of_members` | Register of members | Shareholders appear on the confirmation statement, but your register is the reliable record of who owns what. | tier 5 | no | GB.CORP.SHAREHOLDERS |
| `gb_statutory_registers` | Statutory registers | Every company keeps these, unless they are held on the central register at Companies House. | tier 5 | no | GB.CORP.STATUTORY_REGISTERS |
| `gb_resolutions` | Board and shareholder resolutions | These are the record of the big decisions your company has made. | tier 5 | no | GB.CORP.RESOLUTIONS |
| `gb_founders_agreement` | Founders' agreement and vesting | It settles who owns what and what happens if a founder leaves. | tier 5 | no | GB.CORP.FOUNDERS_AGREEMENT |
| `gb_director_service` | Director service agreements | As the board grows, these set out what each director is there to do. | tier 5 | no | GB.CORP.DIRECTOR_SERVICE |
| `gb_ct_registration` | HMRC letter with your UTR | Your tax reference isn't public, so this letter is how we confirm it. | tier 4 | no | GB.TAX.CT_REGISTRATION |
| `gb_ct_returns` | Corporation Tax returns and payment records | Investors check these, and they show you are up to date with HMRC. | tier 5 | no | GB.TAX.CT_RETURNS |
| `gb_vat_certificate` | VAT certificate | If you're registered, give us your VAT number and we'll check it with HMRC. | tier 4 | no | GB.TAX.VAT |
| `gb_vat_returns` | VAT returns | VAT-registered companies file these quarterly. | tier 5 | no | GB.TAX.VAT_RETURNS |
| `gb_paye` | HMRC PAYE letter | You register before your first payday, and the reference isn't public. | tier 4 | no | GB.TAX.PAYE |
| `gb_payroll_records` | Payroll records | These returns and payments are due monthly. | tier 5 | no | GB.TAX.PAYROLL_RECORDS |
| `gb_eis_seis` | EIS or SEIS advance assurance letter | UK angels and VCs often ask for it. It's not public, so we need your letter. | tier 4 | no | GB.EQUITY.EIS_SEIS |
| `gb_ico_receipt` | ICO fee receipt | If you've just paid, it can take a week to show on the register. | tier 4 | no | GB.DP.ICO_FEE |
| `gb_dp_docs` | Data protection records | You have to be able to show how you comply, not just comply. | tier 5 | no | GB.DP.COMPLIANCE_DOCS |
| `gb_dpa` | Data processing agreements | If vendors handle personal data for you, this agreement sets the rules. | tier 5 | no | GB.DP.PROCESSING_AGREEMENT |
| `gb_ropa` | Records of processing activities | It is the list of what personal data you hold and why. | tier 5 | no | GB.DP.ROPA |
| `gb_dpia` | Data protection impact assessment | High-risk processing, AI and profiling call for this in writing. | tier 5 | no | GB.AI.DPIA |
| `gb_breach_policy` | Data breach response policy and records | Breaches can have to be reported to the ICO within 72 hours, so you need a plan first. | tier 5 | no | GB.DP.BREACH |
| `gb_transfers` | International data transfer records (IDTA or UK Addendum) | If data leaves the UK, you need one of these in place. | tier 5 | no | GB.DP.TRANSFERS |
| `gb_dp_training` | Data protection audit and training records | It shows your team knows what to do. | tier 5 | no | GB.DP.AUDIT_TRAINING |
| `gb_fca_authorisation` | FCA authorisation (give us your FRN) | You must have this before any regulated activity. We check your firm number on the register. | tier 4 | no | GB.FIN.FCA_AUTHORISATION |
| `gb_licensed_partner_agreement` | Agreement with your authorised partner | If an authorised firm does the regulated part, this shows you are covered. | tier 5 | no | GB.FIN.FCA_AUTHORISATION |
| `gb_payment_institution` | Payment or e-money institution authorisation | If you move money yourself, you need one of these. | tier 4 | no | GB.FIN.PAYMENT_INSTITUTION |
| `gb_aisp` | Account information or Open Banking registration | You need this to read customers' bank data. | tier 4 | no | GB.FIN.AISP |
| `gb_consumer_credit` | Consumer credit permissions | Lending to consumers needs FCA permission. | tier 4 | no | GB.FIN.CONSUMER_CREDIT |
| `gb_crypto_registration` | Cryptoasset business registration | Crypto businesses register with the FCA, and a fuller regime is expected. | tier 4 | no | GB.FIN.CRYPTO |
| `gb_aml_registration` | AML registration | Businesses under the money laundering rules have to register with a supervisor. | tier 4 | no | GB.FIN.AML_REGISTRATION |
| `gb_approved_persons` | Senior manager approvals | Authorised firms have named, approved senior people. | tier 4 | no | GB.FIN.APPROVED_PERSONS |
| `gb_compliance_manual` | Compliance manual and AML policies | Financial businesses need written procedures for financial crime. | tier 5 | no | GB.FIN.COMPLIANCE_MANUAL |
| `gb_fin_complaints` | Complaints handling policy | Regulated firms need one. | tier 5 | no | GB.FIN.COMPLAINTS |
| `gb_consumer_duty` | Consumer Duty records | Firms with retail customers have to show they get good outcomes. | tier 5 | no | GB.FIN.CONSUMER_DUTY |
| `gb_fin_reporting` | Regulatory reporting records | Returns and fees vary by firm type, so keep a record of what you file. | tier 5 | no | GB.FIN.REPORTING |
| `gb_safeguarding` | Safeguarding records and audit | If you hold customers' money, it has to be kept safe and, above £100k, audited each year. | tier 5 | no | GB.FIN.SAFEGUARDING |
| `gb_wind_down` | Wind-down plan and capital records | Authorised firms should show they could close safely. | tier 5 | no | GB.FIN.WIND_DOWN |
| `gb_psr` | Payment system regulator records | Only applies if you run a designated payment system. | tier 5 | no | GB.SECTOR.PSR |
| `gb_telecoms_docs` | Emergency call and equipment records | Telecoms providers keep these on file. | tier 5 | no | GB.SECTOR.TELECOMS_DOCS |
| `gb_ofcom_reporting` | Ofcom returns | These are filed annually. | tier 5 | no | GB.SECTOR.OFCOM_REPORTING |
| `gb_pension_declaration` | Pension declaration of compliance | The Pensions Regulator doesn't publish it, so your declaration is the proof. | tier 4 | no | GB.EMP.PENSION |
| `gb_employment_contracts` | Employment contracts | Written statements are due by day one, and they should cover IP. | tier 5 | no | GB.EMP.CONTRACTS |
| `gb_handbook` | Staff handbook | As you grow, it keeps your policies in one place. | tier 5 | no | GB.EMP.HANDBOOK |
| `gb_min_wage` | National Minimum Wage records | Employers keep a record that they pay at least the minimum. | tier 5 | no | GB.EMP.MIN_WAGE |
| `gb_working_time` | Holiday and working time records | Employers keep these for their staff. | tier 5 | no | GB.EMP.WORKING_TIME |
| `gb_el_insurance` | Employers' liability insurance certificate | It's compulsory for most employers, with at least £5m of cover. | tier 4 | yes | GB.EMP.LIABILITY_INSURANCE |
| `gb_contractor_agreements` | Contractor and consultancy agreements | Each should have a written IP assignment, and a note on IR35 status. | tier 5 | no | GB.EMP.CONTRACTOR_AGREEMENTS |
| `gb_onboarding` | Employee onboarding records | A simple checklist means no new hire misses a signature. | tier 5 | no | GB.EMP.ONBOARDING |
| `gb_sponsor_licence` | Sponsor licence | If you sponsor workers from outside the UK, you need a licence. It's on a public register. | tier 4 | yes | GB.EMP.SPONSOR_LICENCE |
| `gb_hr_policies` | Equality, disciplinary and grievance policies | These help you handle people problems fairly when they come up. | tier 5 | no | GB.EMP.POLICIES |
| `gb_whistleblowing` | Whistleblowing policy | It gives staff a safe way to raise concerns. | tier 5 | no | GB.EMP.WHISTLEBLOWING |
| `gb_export_licence` | Export licence or OGEL registration | Encryption, AI or other controlled technology sold abroad can need a licence, and these aren't public. | tier 4 | no | GB.EXPORT.LICENCE |
| `gb_import_licence` | Import licence | Controlled goods coming into the UK can need one. | tier 4 | no | GB.EXPORT.IMPORT_LICENCE |
| `gb_sanctions_docs` | Sanctions and export control records | If you export or move money, you should screen who you deal with. | tier 5 | no | GB.SANCT.SCREENING |
| `gb_trademark_search` | Trade mark search report | A search shows whether someone else already has a mark close to yours. | tier 5 | no | GB.IP.TRADEMARK_SEARCH |
| `gb_trademark` | UK trade mark application or certificate | The IPO has no public API, so we read your certificate and check its number on the IPO's page. | tier 4 | no | GB.IP.TRADEMARK |
| `gb_patents` | Patent filing or grant | You told us you have technology you might patent. Unpublished applications need an upload. | tier 4 | no | GB.IP.PATENTS |
| `gb_founder_ip_assignment` | Founders' IP assignments | This is what makes the company the owner of what founders built, including before incorporation. | tier 5 | no | GB.IP.FOUNDER_ASSIGNMENT |
| `gb_contractor_ip_assignment` | Contractor IP assignments | Copyright stays with a contractor unless it's assigned in writing. | tier 5 | no | GB.IP.CONTRACTOR_ASSIGNMENT |
| `gb_nda` | NDA template | You need one before you share anything sensitive with partners, investors or hires. | tier 5 | no | GB.IP.NDA |
| `gb_software_dev` | Software development agreements | If an outside developer builds your product, this sets out what you own. | tier 5 | no | GB.IP.SOFTWARE_DEVELOPMENT |
| `gb_software_licences` | Software licences | Investors want to see what you license in and out. | tier 5 | no | GB.IP.SOFTWARE_LICENSING |
| `gb_open_source` | Open source policy and licence register | Investors want to know your code has no licence problems hiding in it. | tier 5 | no | GB.IP.OPEN_SOURCE |
| `gb_escrow` | Software escrow agreement | Some enterprise customers ask for this. | tier 5 | no | GB.IP.ESCROW |
| `gb_cyber_essentials` | Cyber Essentials certificate | Many public-sector contracts require it, and it renews every year. | tier 4 | yes | GB.SEC.CYBER_ESSENTIALS |
| `gb_security_policies` | Information security policies | Enterprise customers and investors expect these in writing. | tier 5 | no | GB.SEC.POLICIES |
| `gb_incident_response` | Incident response plan | You need to know who does what before something goes wrong. | tier 5 | no | GB.SEC.INCIDENT_RESPONSE |
| `gb_continuity` | Business continuity and disaster recovery plans | Larger customers ask what happens if your systems go down. | tier 5 | no | GB.SEC.CONTINUITY |
| `gb_pen_tests` | Penetration test reports | Investors and enterprise customers expect to see these. | tier 5 | no | GB.SEC.PEN_TESTS |
| `gb_premises` | Business premises permissions | What you need varies by council. Add what applies to your premises. | tier 4 | no | GB.PREMISES.PERMISSIONS |
| `gb_premises_safety` | Fire and premises safety records | If you occupy premises, you keep these on file. | tier 5 | no | GB.PREMISES.SAFETY |
| `gb_hs_policy` | Health and safety policy | A written policy is required at 5 or more employees. | tier 5 | no | GB.EMP.HS_POLICY |
| `gb_risk_assessments` | Workplace risk assessments | Screen work and fire risks count, even in an office. | tier 5 | no | GB.EMP.RISK_ASSESSMENT |
| `gb_accident_records` | Accident and incident records | Employers keep these, and some incidents have to be reported. | tier 5 | no | GB.EMP.ACCIDENT_RECORDS |
| `gb_safety_training` | Safety training records | Employers keep a record of what their team was shown. | tier 5 | no | GB.EMP.SAFETY_TRAINING |
| `gb_mhra` | MHRA registration | Devices and software as a medical device are registered before going on the market. | tier 4 | no | GB.HEALTH.MHRA |
| `gb_conformity` | Declaration of Conformity and technical documents | These are what lets a medical device carry its mark. | tier 5 | no | GB.HEALTH.CONFORMITY |
| `gb_clinical_investigation` | Clinical investigation approval | Only applies if you run clinical investigations. | tier 4 | no | GB.HEALTH.CLINICAL_INVESTIGATION |
| `gb_cqc` | CQC registration | Regulated health activities need this. | tier 4 | no | GB.HEALTH.CQC |
| `gb_nhs` | NHS compliance records | NHS customers ask for these before they buy. | tier 5 | no | GB.HEALTH.NHS |
| `gb_pra` | PRA authorisation | Only applies if the company itself is a bank. | tier 4 | no | GB.SECTOR.PRA |
| `gb_gambling` | Gambling operating licence | Gambling products need this. | tier 4 | no | GB.SECTOR.GAMBLING |
| `gb_ofgem` | Ofgem energy licence | Energy supply needs this. | tier 4 | no | GB.SECTOR.OFGEM |
| `gb_asa` | Advertising compliance records | If you sell to consumers, your marketing should meet the Advertising Code. | tier 5 | no | GB.CONSUMER.ASA |
| `gb_cma` | Consumer law records | Consumer law covers things like drip pricing and fake reviews. | tier 5 | no | GB.CONSUMER.CMA |
| `gb_trading_standards` | Product compliance records | Physical products sold to consumers have their own safety rules. | tier 5 | no | GB.CONSUMER.TRADING_STANDARDS |
| `gb_ai_governance` | AI governance policy | As you scale, this shows who is responsible for your AI decisions. | tier 5 | no | GB.AI.GOVERNANCE |
| `gb_ai_risk` | AI risk and impact assessment | It records what could go wrong with your AI, and links to your DPIA. | tier 5 | no | GB.AI.RISK_ASSESSMENT |
| `gb_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | GB.AI.TRANSPARENCY |
| `gb_ai_model_docs` | AI model, training data and licensing records | These show you have the rights to what your models were trained on. | tier 5 | no | GB.AI.MODEL_DOCS |
| `gb_ai_vendors` | AI supplier agreements | If you use third-party models, these say what happens to your data and who owns the output. | tier 5 | no | GB.AI.VENDORS |
| `gb_saas` | SaaS agreement | It is the contract your customers sign, so investors read it. | tier 5 | no | GB.COM.SAAS |
| `gb_api_terms` | API terms | If others build on your API, this sets the rules. | tier 5 | no | GB.COM.API_TERMS |
| `gb_sla` | Service level agreement | Enterprise customers will want this before they sign. | tier 5 | no | GB.COM.SLA |
| `gb_product_liability` | Product liability records | If you sell to consumers, it helps to know where you stand. | tier 5 | no | GB.COM.PRODUCT_LIABILITY |
| `gb_supplier` | Commercial and supplier agreements | Investors want to see what you have agreed with your main partners. | tier 5 | no | GB.COM.SUPPLIER |
| `gb_shareholders_agreement` | Shareholders' agreement | It sets out what happens when a shareholder leaves or wants to sell. | tier 5 | no | GB.EQUITY.SHAREHOLDERS_AGREEMENT |
| `gb_option_scheme` | Share option plan and EMI records | Investors will check every option has a plan behind it, and EMI options have to be notified to HMRC. | tier 5 | no | GB.EQUITY.OPTION_SCHEME |
| `gb_round_documents` | Investment, SAFE and loan note agreements | These gave investors their rights. SH01 filings can back them up. | tier 5 | no | GB.FUND.ROUND_DOCUMENTS |
