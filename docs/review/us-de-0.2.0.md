# Review: United States: Delaware (US-DE) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** US-DE, version 0.2.0, 83 rules (11 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `e1363b183ed34e0c7f02bad54124fb0d5b963733692a09c9f5c1f7dc5826b6b8`
- **Also applies:** US; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (19)

### US-DE.CORP.NAME_RESERVATION — Company name reservation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | formation | tier 5, the company tells us | S1 pre-incorporation | Delaware Division of Corporations |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Company name availability search; name reservation”
- **Applies when:** the answer to “Has it been registered yet?” is no
- **Passes when:** `vault.de_name_reservation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Name reservation receipt · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your company name reservation on file**
> You haven't added your company name reservation to your documents yet.
> *Why it matters:* Before you incorporate, this shows the name you want is held for you.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your company name reservation to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.ENTITY_ON_RECORD — Delaware company record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | formation | tier 2, licensed vendor | S2 incorporated, pre-revenue | Delaware Division of Corporations |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Certificate of Incorporation (corporations) / Certificate of Formation (LLCs)”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “Entity exists with a registered agent”
- **Applies when:** yes
- **Passes when:** any of: (`registry.us.delaware_vendor.found` is yes) or (`vault.de_certificate_of_incorporation.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Licensed data provider record; Certificate of Incorporation or Formation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find {company}'s Delaware record**
> Our licensed data provider didn't return a record for {company}, and you haven't uploaded your certificate. That doesn't mean the company doesn't exist.
> *Why it matters:* Everything else in this scan rests on knowing the company is who it says it is.
> *If left:* Banks and investors will ask for it first, and we can't check your other Delaware items without it.
> *What to do:* Upload your Certificate of Incorporation or Formation. We read the file number and date from it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.REGISTERED_AGENT — Registered agent in Delaware

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | formation | tier 2, licensed vendor | S2 incorporated, pre-revenue | Delaware Division of Corporations |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Registered Agent appointment; Registered Office in Delaware”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “Entity exists with a registered agent”
- **Applies when:** yes
- **Passes when:** any of: (`registry.us.delaware_vendor.registered_agent_present` is yes) or (`vault.de_certificate_of_incorporation.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Licensed data provider record; Certificate of Incorporation or Formation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company}'s registered agent**
> We couldn't confirm a registered agent and Delaware registered office for {company}.
> *Why it matters:* Every Delaware company has to keep an agent in the state to receive legal papers.
> *If left:* If nobody receives legal papers for you, a claim or a tax notice can go unanswered.
> *What to do:* Upload your certificate or a letter from your agent, or appoint one if you no longer have one.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.INCORPORATOR — Incorporator details

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | formation | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Division of Corporations |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Incorporator details”
- **Applies when:** yes
- **Passes when:** `vault.de_certificate_of_incorporation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Certificate of Incorporation or Formation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your incorporator details on file**
> You haven't added your incorporator details to your documents yet.
> *Why it matters:* It's the document that created your company. If our data provider can't find you, it settles the question.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your incorporator details to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.GOOD_STANDING — Certificate of Good Standing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Division of Corporations |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “| Certificate of Good Standing |”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “Certificate of Good Standing on file and validated”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 1. How to read the map: “The Delaware constraint”
- **Applies when:** yes
- **Passes when:** `derived.us.good_standing_current` is yes
- **“To check” when:** all of: (`vault.de_good_standing.present` is yes) and (`vault.de_good_standing.validated` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"vault.de_good_standing.dated","years":1} (reminder only)
- **Evidence:** Certificate of Good Standing, confirmed on Delaware's validator · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have a current Certificate of Good Standing for {company}**
> You don't have a Certificate of Good Standing from the last 12 months on file.
> *Why it matters:* Delaware doesn't allow automatic status checks, so this certificate is the proof that your company is in good standing.
> *If left:* Investors and banks will ask for a recent one, and you'll need one before every financing.
> *What to do:* Order one from Delaware and upload it. We'll confirm its number on Delaware's own website, then show it as certified on that date.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.CERTIFIED_COPIES — Certified copies of incorporation documents

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | formation | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Division of Corporations |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Certified copies of incorporation documents”
- **Applies when:** yes
- **Passes when:** `vault.de_certified_copies.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Certified copies of incorporation documents · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your certified incorporation documents on file**
> You haven't added your certified incorporation documents to your documents yet.
> *Why it matters:* Banks and investors often ask for certified copies rather than plain ones.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your certified incorporation documents to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.BYLAWS — Corporate bylaws

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Corporate Bylaws (corporations) / Operating Agreement (LLCs)”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “Bylaws, organisational resolutions, stock ledger”
- **Applies when:** `derived.is_corp` is yes
- **Passes when:** `vault.de_bylaws.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Corporate bylaws · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your corporate bylaws on file**
> You haven't added your corporate bylaws to your documents yet.
> *Why it matters:* They're the rules for how your corporation is run, and investors read them.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your corporate bylaws to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.OPERATING_AGREEMENT — LLC operating agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Corporate Bylaws (corporations) / Operating Agreement (LLCs)”
- **Applies when:** `derived.is_llc` is yes
- **Passes when:** `vault.de_operating_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** LLC operating agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your LLC operating agreement on file**
> You haven't added your LLC operating agreement to your documents yet.
> *Why it matters:* It sets out who owns the LLC and how decisions are made.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your LLC operating agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.ORGANISATIONAL_RESOLUTIONS — Organisational board and shareholder resolutions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Initial Board of Directors appointment; Initial Board Resolutions; Initial Shareholder Resolutions”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “Bylaws, organisational resolutions, stock ledger”
- **Applies when:** `derived.is_corp` is yes
- **Passes when:** `vault.de_organisational_resolutions.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Organisational resolutions · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your organisational resolutions on file**
> You haven't added your organisational resolutions to your documents yet.
> *Why it matters:* These are the first decisions that appointed your board and officers and issued your shares.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your organisational resolutions to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.OFFICER_RECORDS — Director and officer records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Director and officer records”
- **Applies when:** yes
- **Passes when:** `vault.de_officer_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Director and officer records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your director and officer records on file**
> You haven't added your director and officer records to your documents yet.
> *Why it matters:* Delaware doesn't publish directors except on the annual report, so we rely on your records.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your director and officer records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.FRANCHISE_TAX — Delaware annual report and franchise tax

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Division of Corporations |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Annual Franchise Tax Report (corporations)”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Annual Franchise Tax payment”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 24 —: “Delaware Corporation Annual Report; Franchise Tax by 1 March”
- **Applies when:** `derived.is_corp` is yes
- **Passes when:** `vault.de_franchise_tax.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every year on 1 March (reminder only)
- **Numbers for you to confirm:** due = "1 March"; report_fee_usd = 50; minimum_tax_usd = [175,400]; late_penalty_usd = 200; monthly_interest_percent = 1.5
- **Evidence:** Filed report or "Tax & History" lookup · **Fix type:** pay · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't see proof that {company}'s franchise tax is paid**
> You haven't uploaded a receipt or Delaware's Tax & History lookup for your annual report and franchise tax.
> *Why it matters:* It's due on 1 March every year. Delaware keeps this behind a paid lookup, so we can't check it ourselves.
> *If left:* Paying late costs a $200 penalty plus 1.5% interest a month, and an unpaid company loses its good standing.
> *What to do:* Upload the receipt from your last payment and this clears. The next payment is due 1 March.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.LLC_TAX — Delaware LLC annual tax

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Division of Corporations |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Annual LLC tax payment”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 24 —: “Delaware LLC tax by 1 June”
- **Applies when:** `derived.is_llc` is yes
- **Passes when:** `vault.de_llc_tax.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every year on 1 June (reminder only)
- **Numbers for you to confirm:** due = "1 June"; amount_usd = 300
- **Evidence:** LLC tax receipt · **Fix type:** pay · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't see proof that {company}'s LLC tax is paid**
> You haven't uploaded a receipt for your Delaware LLC tax.
> *Why it matters:* Delaware LLCs pay $300 by 1 June every year.
> *If left:* It affects your standing with the state, and you'll be asked for proof in due diligence.
> *What to do:* Upload your receipt and this clears. The next payment is due 1 June.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.STATE.FOREIGN_QUALIFICATION — Registration in other states

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | state_registration | tier 2, licensed vendor | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 15 —: “Foreign qualification in each state; Certificate of Authority”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 15 —: “Registered agent in each state”
- **Applies when:** `derived.us.multi_state` is yes
- **Passes when:** any of: (`registry.us.delaware_vendor.other_state_registration_count` is at least 1) or (`vault.state_foreign_qualification.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Licensed data provider record; Certificate of Authority · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company} registered in the other states you work in**
> You told us you do business outside Delaware, and we can't see a registration in those states.
> *Why it matters:* Doing business in a state usually means registering there and keeping a registered agent in that state.
> *If left:* A state can suspend your rights to do business there, which can surface when you try to enforce a contract.
> *What to do:* Register in each state where you do business, then upload the certificates.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.STATE.ANNUAL_REPORTS — State annual reports

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | state_registration | tier 2, licensed vendor | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 15 —: “State annual reports; state franchise tax returns”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 24 —: “State foreign qualification renewals; state annual reports; state franchise tax”
- **Applies when:** `derived.us.multi_state` is yes
- **Passes when:** `vault.state_annual_reports.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** registry date: {"fact":"registry.us.delaware_vendor.next_report_due"} (checked automatically with our licensed data provider)
- **Abroad:** never follows the company into another country
- **Evidence:** Filed state reports · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s state annual reports on file**
> You don't have annual reports on file for the other states you work in.
> *Why it matters:* States where you are registered usually ask for their own annual filing.
> *If left:* A missed filing can suspend your registration in that state.
> *What to do:* Add your latest filings. Where our data provider gives a date, we'll track the next one.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.FOUNDERS_AGREEMENT — Founders' agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | founders | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Founders' Agreement; Founder Vesting Agreement”
- **Applies when:** yes
- **Passes when:** `vault.de_founders_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Founders' agreement and vesting · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your founders' agreement on file**
> You haven't added your founders' agreement to your documents yet.
> *Why it matters:* It settles who owns what and what happens if a founder leaves.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your founders' agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.DIRECTOR_SERVICE — Director service agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Director Service Agreements”
- **Applies when:** yes
- **Passes when:** `vault.de_director_service.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Director service agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your director service agreements on file**
> You haven't added your director service agreements to your documents yet.
> *Why it matters:* As the board grows, these set out what each director is there to do.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your director service agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.BANK_ACCOUNT — Corporate bank account

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | banking | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 23 —: “Corporate bank account; bank account authorisation; wire transfer authorisation”
- **Applies when:** yes
- **Passes when:** `attest.corporate_bank_account` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has its own bank account**
> We don't have your confirmation that a bank account is open in the company's name.
> *Why it matters:* A separate account keeps company and personal money apart.
> *If left:* Investors will expect one, and they send money to the company, not to a founder.
> *What to do:* Open an account in the company name, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.BANK_RESOLUTION — Board resolution for the bank account

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | banking | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 23 —: “Board resolution authorising the bank account”
- **Applies when:** `derived.is_corp` is yes
- **Passes when:** `vault.de_bank_resolution.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Board resolution for the bank account · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your board resolution for the bank account on file**
> You haven't added your board resolution for the bank account to your documents yet.
> *Why it matters:* Banks ask for it, and it shows who can sign for the company.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your board resolution for the bank account to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.CORP.FINANCIAL_RECORDS — Corporate financial records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | finance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 23 —: “Business credit documentation; corporate financial records”
- **Applies when:** yes
- **Passes when:** `vault.de_financial_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":12} (reminder only)
- **Evidence:** Annual financial statements and records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your financial records on file**
> You haven't added your financial records to your documents yet.
> *Why it matters:* Investors will want to see these.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your financial records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (8)

### US-DE.IP.FOUNDER_ASSIGNMENT — Founders' IP assignment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 2 IP and technology | ip_ownership | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** 17 U.S.C., s204(a)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 10 —: “Copyright ownership documentation; assignment agreements; licensing agreements”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Employee Confidentiality Agreements; IP Assignment Agreements”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “PIIA signed by every founder, employee and contractor”
- **Applies when:** yes
- **Passes when:** `vault.de_founder_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all founders signed an IP assignment?”
- **Evidence:** Signed IP assignment from each founder · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your founders haven't signed their work over to {company}**
> You don't have a signed IP assignment from each founder for what they built, including anything from before the company existed.
> *Why it matters:* Without it, the founder may still own the code. Your company may not legally own the technology it is selling.
> *If left:* It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.
> *What to do:* Put a short assignment in writing, have each founder sign it, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.IP.PIIA — IP and confidentiality agreements with your team

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** California Labor Code, s2870
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Employee Confidentiality Agreements; IP Assignment Agreements; Employee Invention Assignment Agreements”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “PIIA signed by every founder, employee and contractor”
- **Applies when:** `derived.team_or_contractors` is yes
- **Passes when:** `vault.de_piia.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all employees?”
- **Evidence:** Signed agreement from each employee and contractor · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your team hasn't all signed their work over to {company}**
> You don't have a signed invention assignment from everyone who has worked on your product.
> *Why it matters:* Without a signed agreement, the person who did the work may still own it.
> *If left:* It will be flagged in due diligence, and getting signatures gets harder once someone has moved on.
> *What to do:* Use one standard agreement, have everyone sign it, and add the copies here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.IP.WORK_FOR_HIRE — Written assignment from contractors

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** 17 U.S.C., s204(a); California Labor Code, s3351.5(c)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 10 —: “Work-for-hire agreements”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.de_contractor_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all contractors?”
- **Evidence:** Contractor agreements with a written IP assignment · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your contractors may still own what they built for {company}**
> You don't have contractor agreements with a written IP assignment on file.
> *Why it matters:* Software from a contractor usually isn't work-for-hire, so without a written assignment the contractor may still own it. A work-for-hire clause with a California contractor can also make them an employee.
> *If left:* It will be flagged in your next due diligence, and it can hold up a round.
> *What to do:* Check that each contractor agreement assigns the IP in writing, get any missing assignments signed, and add them here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.IP.SOFTWARE_DEVELOPMENT — Software development agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “Software Development Agreement”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.de_software_dev_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Software development agreements · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your software development agreements on file**
> You haven't added your software development agreements to your documents yet.
> *Why it matters:* If an outside developer builds your product, this sets out what you own.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your software development agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.IP.TECH_TRANSFER — Software IP assignment and technology transfer agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “Software IP Assignment Agreement; Technology Transfer Agreement”
- **Applies when:** `derived.foreign_tech` is yes
- **Passes when:** `vault.de_tech_transfer.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Technology transfer agreements · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your technology transfer agreements on file**
> You haven't added your technology transfer agreements to your documents yet.
> *Why it matters:* If IP moved across borders, such as from a Nigerian company to a Delaware parent, this is the record of it.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your technology transfer agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.IP.NDA — NDA template

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | confidentiality | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “NDA; Confidentiality Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “NDA template”
- **Applies when:** yes
- **Passes when:** `vault.de_nda.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NDA template · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your NDA template on file**
> You haven't added your NDA template to your documents yet.
> *Why it matters:* You need one before you share anything sensitive with partners, investors or hires.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your NDA template to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.IP.OPEN_SOURCE — Open source policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | open_source | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Open Source Software Compliance Policy”
- **Applies when:** yes
- **Passes when:** `vault.de_open_source_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Open source policy or audit report · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your open source policy on file**
> You haven't added your open source policy to your documents yet.
> *Why it matters:* Investors want to know your code has no licence problems hiding in it.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your open source policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.IP.ESCROW — Source code escrow agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | enterprise | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “Source Code Escrow Agreement”
- **Applies when:** all of: (`derived.enterprise` is yes) and (the answer to “Has a customer asked for source code escrow?” is yes)
- **Passes when:** `vault.de_escrow.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Source code escrow agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your source code escrow agreement on file**
> You haven't added your source code escrow agreement to your documents yet.
> *Why it matters:* Some enterprise customers ask for this.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your source code escrow agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (33)

### US-DE.TAX.BUSINESS_LICENSE — Delaware business licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | state_licence | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Division of Revenue |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 3 —: “Delaware Business License”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 2. Consolidation notes: “a Delaware business licence depends on doing business in Delaware”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “Delaware business licence search”
- **Applies when:** `derived.us.de_operations` is yes
- **Passes when:** `vault.de_business_license.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** expiry: {"fact":"vault.de_business_license.expires_on"} (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** Delaware business licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your delaware business licence on file**
> You haven't added your delaware business licence to your documents yet.
> *Why it matters:* You need one if you do business in Delaware, not just because you are incorporated there.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your delaware business licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.TAX.REGISTRATIONS — Delaware tax registrations

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | state_tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Division of Revenue |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 3 —: “Business tax registration; Gross Receipts Tax registration”
- **Applies when:** `derived.us.de_operations` is yes
- **Passes when:** `vault.de_tax_registrations.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Delaware tax registrations (One Stop confirmation) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Delaware tax registrations on file**
> You haven't added your Delaware tax registrations to your documents yet.
> *Why it matters:* Doing business in Delaware brings in gross receipts and corporate income tax registrations.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Delaware tax registrations to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.TAX.RETURNS — Delaware tax returns

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | state_tax | tier 5, the company tells us | S3 revenue, pre-raise | Delaware Division of Revenue |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 3 —: “Delaware tax returns; Gross Receipts Tax returns”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 24 —: “Delaware business licence renewal; Gross Receipts and corporate income tax returns”
- **Applies when:** `derived.us.de_operations` is yes
- **Passes when:** `vault.de_tax_returns.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every 3 months (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** Delaware tax returns and payment records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Delaware tax returns on file**
> You haven't added your Delaware tax returns to your documents yet.
> *Why it matters:* Once you operate in Delaware, you file these regularly.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Delaware tax returns to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EMP.UI_REGISTRATION — Delaware employer and unemployment insurance registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Department of Labor |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 5 —: “Employer registration; unemployment insurance registration and account number”
- **Applies when:** `derived.us.de_employees` is yes
- **Passes when:** `vault.de_employer_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Delaware employer and unemployment insurance registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Delaware employer registration on file**
> You haven't added your Delaware employer registration to your documents yet.
> *Why it matters:* You need this if you have employees in Delaware.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Delaware employer registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EMP.WORKERS_COMP — Workers' compensation insurance — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Department of Labor |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 5 —: “Workers' compensation registration; insurance policy”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “Delaware workers”
- **Applies when:** `derived.us.de_employees` is yes
- **Passes when:** `vault.de_workers_comp.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** expiry: {"fact":"vault.de_workers_comp.expires_on"} (reminder only)
- **Abroad:** follows the company only where it employs people
- **Evidence:** Workers' compensation policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your workers' compensation insurance on file**
> You haven't added your workers' compensation insurance to your documents yet.
> *Why it matters:* Employers with Delaware staff need this cover.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your workers' compensation insurance to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EMP.NEW_HIRE_REPORTING — New hire reporting

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Delaware Department of Labor |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 5 —: “New hire reporting”
- **Applies when:** `derived.us.de_employees` is yes
- **Passes when:** `attest.de_new_hires_reported` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after event: {"event_fact":"answers.last_hire_on","days":20} (reminder only)
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed your Delaware new hires are reported**
> We don't have your confirmation that new Delaware hires are reported.
> *Why it matters:* Each new hire is reported within 20 days of starting.
> *If left:* It's a simple step that's easy to forget as you hire.
> *What to do:* Report any missing hires, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EMP.PAYROLL_RECORDS — Delaware payroll and wage records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Delaware Department of Labor |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 5 —: “Payroll records; employee wage records; UI contribution returns”
- **Applies when:** `derived.us.de_employees` is yes
- **Passes when:** `vault.de_payroll_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every 3 months (reminder only)
- **Abroad:** follows the company only where it employs people
- **Evidence:** Payroll, wage and unemployment contribution records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Delaware payroll and wage records on file**
> You haven't added your Delaware payroll and wage records to your documents yet.
> *Why it matters:* Employers keep these and file contribution returns.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Delaware payroll and wage records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EMP.COMPLIANCE_DOCS — Employment and workplace safety records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Delaware Department of Labor |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 5 —: “Employment compliance documentation; workplace safety documentation”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.de_employment_compliance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employment and workplace safety records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employment and workplace safety records on file**
> You haven't added your employment and workplace safety records to your documents yet.
> *Why it matters:* Any employer should be able to show how they look after their team.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your employment and workplace safety records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SECTOR.INSURANCE_LICENCE — Insurance producer, broker or agency licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | insurtech | tier 3, official list | S2 incorporated, pre-revenue | Delaware Department of Insurance |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 6 —: “Insurance producer, broker, agency licences”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “DOI and NIPR access”
- **Applies when:** `derived.sector.insurtech` is yes
- **Passes when:** `vault.de_insurance_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Insurance licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your insurance licence on file**
> You haven't added your insurance licence to your documents yet.
> *Why it matters:* Selling or arranging insurance needs a licence.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your insurance licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SECTOR.INSURTECH_APPROVALS — Insurtech approvals and partnership approvals

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | insurtech | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Department of Insurance |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 6 —: “Insurtech approvals; partnership approvals; insurance compliance documentation”
- **Applies when:** `derived.sector.insurtech` is yes
- **Passes when:** `vault.de_insurtech_approvals.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Insurtech and partnership approvals · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your insurtech approvals on file**
> You haven't added your insurtech approvals to your documents yet.
> *Why it matters:* These show that your insurance arrangements have been approved.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your insurtech approvals to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SECTOR.PROFESSIONAL_LICENCE — Professional business licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | professional | tier 3, official list | S2 incorporated, pre-revenue | Delaware Division of Professional Regulation |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 8 —: “Professional business licence; provider registration; practice approvals; certifications”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “DELPROS export”
- **Applies when:** `derived.sector.professional` is yes
- **Passes when:** `vault.de_professional_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Professional licence and approvals · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your professional business licence on file**
> You haven't added your professional business licence to your documents yet.
> *Why it matters:* Regulated professions such as telehealth, accounting and engineering need these.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your professional business licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SECTOR.PROFESSIONAL_INSURANCE — Professional liability insurance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | professional | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Delaware Division of Professional Regulation |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 8 —: “Professional liability insurance”
- **Applies when:** `derived.sector.professional` is yes
- **Passes when:** `vault.de_professional_insurance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** expiry: {"fact":"vault.de_professional_insurance.expires_on"} (reminder only)
- **Evidence:** Professional liability insurance certificate · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your professional liability insurance on file**
> You haven't added your professional liability insurance to your documents yet.
> *Why it matters:* Regulated professions are expected to hold this cover.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your professional liability insurance to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.DPDPA — Delaware Personal Data Privacy Act compliance — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S3 revenue, pre-raise | Delaware Department of Justice |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “Delaware Personal Data Privacy Act compliance”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “DPDPA applicability thresholds”
- **Applies when:** `derived.us.dpdpa_in_scope` is yes
- **Passes when:** `vault.dpdpa_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** proposed_thresholds = {"consumers":35000,"consumers_with_sales":10000,"sales_revenue_percent":20}
- **In force:** 2025-01-01 to no end date
- **Evidence:** Delaware privacy law compliance records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Delaware privacy law records on file**
> You haven't added your Delaware privacy law records to your documents yet.
> *Why it matters:* It applies once you hold data on enough Delaware consumers.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Delaware privacy law records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | privacy | tier 1, official source, read live | S2 incorporated, pre-revenue | Delaware Department of Justice |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “| Privacy Notice |”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie behaviour compliant”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.privacy_notice_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a privacy notice on {company}'s website**
> We looked for a privacy notice on your website and couldn't find one.
> *Why it matters:* If you have users, you need to tell them what you do with their data. This is the first thing a regulator or partner looks at.
> *If left:* Enterprise customers and investors will ask for it, and it is public, so anyone can see it is missing.
> *What to do:* Publish a privacy notice and link it from every page.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.CCPA_CHOICES — California privacy choices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | privacy | tier 1, official source, read live | S3 revenue, pre-raise | California Privacy Protection Agency |

- **Law cited:** California Consumer Privacy Act
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “| Privacy Notice |”
- **Applies when:** `derived.us.is_ccpa_business` is yes
- **Passes when:** `web.policy.ccpa_links` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Links on your published website · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find the California privacy links on your website**
> You appear to be above the California privacy law's thresholds, and we couldn't find the privacy links it expects on your site.
> *Why it matters:* Businesses in scope offer California users clear privacy choices on their website.
> *If left:* It is visible to anyone who checks your site, regulators included.
> *What to do:* Add the links and the California details to your notice, then run the scan again.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.CONSUMER_RIGHTS — Consumer data rights procedures

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S3 revenue, pre-raise | Delaware Department of Justice |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “Consumer data rights procedures; access, deletion and correction procedures”
- **Applies when:** `derived.us.dpdpa_in_scope` is yes
- **Passes when:** all of: (`attest.de_consumer_rights_procedure` is yes) and (`web.policy.rights_section` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Rights section in your notice · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm how {company} handles data requests**
> We don't have your confirmation of how you handle requests, or your notice doesn't explain people's rights.
> *Why it matters:* Consumers can ask to see, correct or delete their data, and you need a way to answer them.
> *If left:* When the first request arrives you'll be working it out under a deadline.
> *What to do:* Write down your process, explain the rights in your notice, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.OPT_OUT — Opt-out for targeted advertising and sales — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 1, official source, read live | S3 revenue, pre-raise | Delaware Department of Justice |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “Opt-out mechanisms for targeted advertising and sales”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “universal opt-out effective date”
- **Applies when:** `derived.us.dpdpa_in_scope` is yes
- **Passes when:** `web.policy.opt_out_link` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Opt-out link on your site · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find an opt-out link on {company}'s website**
> We couldn't find a way for consumers to opt out of targeted advertising or sales of their data.
> *Why it matters:* Companies in scope have to offer an opt-out and honour browser opt-out signals.
> *If left:* It is easy to see from outside, so it is an easy thing for a regulator to find.
> *What to do:* Add an opt-out link and make sure your tags respect browser signals.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.SENSITIVE_CONSENT — Consent for sensitive data

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S3 revenue, pre-raise | Delaware Department of Justice |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “Sensitive data processing consent”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.sensitive_data` is yes)
- **Passes when:** `attest.sensitive_data_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed you get consent for sensitive data**
> You told us you handle sensitive data, and we don't have your confirmation that users consent to it.
> *Why it matters:* Sensitive categories need consent before you process them.
> *If left:* Data collected without consent can be hard to keep using, and that can reach into your product.
> *What to do:* Check your sign-up flows ask for consent, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.COMPLAINTS — Privacy complaint handling procedures

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S3 revenue, pre-raise | Delaware Department of Justice |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “Consumer complaint handling procedures; privacy compliance documentation”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.de_privacy_complaints.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Privacy complaint procedures · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your privacy complaint procedures on file**
> You haven't added your privacy complaint procedures to your documents yet.
> *Why it matters:* It helps to know who answers a privacy complaint before one arrives.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your privacy complaint procedures to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.COOKIE_POLICY — Cookie policy and behaviour

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Privacy Policy; Cookie Policy; Terms of Service; Acceptable Use Policy”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie behaviour compliant”
- **Applies when:** `derived.has_website` is yes
- **Passes when:** `web.policy.cookie_policy_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published cookie policy · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a cookie policy on {company}'s website**
> We couldn't find a cookie policy on your website.
> *Why it matters:* People should be able to see which cookies you use and why.
> *If left:* It's public, so it's one of the first things someone checks.
> *What to do:* Publish a cookie policy and link it from your footer. Check it matches the cookies you actually set.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.DP.PROCESSING_AGREEMENT — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Data Processing Agreement”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.de_dpa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data processing agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data processing agreements on file**
> You haven't added your data processing agreements to your documents yet.
> *Why it matters:* If vendors handle personal data for you, or you handle it for customers, this agreement sets the rules.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data processing agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.STATE.LICENCES_AND_TAX — State business licences and tax registrations

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | state_tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 15 —: “State business licence; state tax registration; state income tax registration”
- **Applies when:** `derived.us.multi_state` is yes
- **Passes when:** `vault.state_tax_registrations.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** State business licences and tax registrations · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your state licences and tax registrations on file**
> You haven't added your state licences and tax registrations to your documents yet.
> *Why it matters:* Each state where you operate has its own.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your state licences and tax registrations to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.STATE.SALES_TAX — Sales and use tax registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | state_tax | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 15 —: “Sales and Use Tax registration”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “Economic-nexus thresholds for sales tax”
- **Applies when:** `derived.us.multi_state` is yes
- **Passes when:** `vault.state_sales_tax.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every 3 months (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** Sales tax permits · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your sales tax permits on file**
> You haven't added your sales tax permits to your documents yet.
> *Why it matters:* SaaS is taxable in some states once your sales there pass a threshold.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your sales tax permits to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.STATE.EMPLOYER — State employer registrations

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 15 —: “State employer registration; state unemployment insurance”
- **Applies when:** all of: (`derived.employees` is yes) and (`derived.us.multi_state` is yes)
- **Passes when:** `vault.state_employer.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** State employer, unemployment and workers' compensation registrations · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your state employer registrations on file**
> You haven't added your state employer registrations to your documents yet.
> *Why it matters:* Every state where you employ someone has its own registrations.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your state employer registrations to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SEC.POLICIES — Information security policies

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Cybersecurity Policy; Information Security Policy; Access Control Policy”
- **Applies when:** yes
- **Passes when:** `vault.de_security_policies.present` is yes
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

### US-DE.SEC.INCIDENT_RESPONSE — Incident response plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Incident Response Plan; Data Breach Response Policy”
- **Applies when:** yes
- **Passes when:** `vault.de_incident_response.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Incident response and data breach plan · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your incident response plan on file**
> You haven't added your incident response plan to your documents yet.
> *Why it matters:* State breach-notification laws apply in all 50 states, so you need a plan before something happens.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your incident response plan to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SEC.CONTINUITY — Business continuity and disaster recovery plans

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Business Continuity Plan; Disaster Recovery Plan”
- **Applies when:** yes
- **Passes when:** `vault.de_continuity.present` is yes
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

### US-DE.SEC.VULNERABILITY_DISCLOSURE — Vulnerability disclosure policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Vulnerability Disclosure Policy”
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

### US-DE.SEC.PEN_TESTS — Penetration test and security audit reports

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Penetration Testing Reports; Security Audit Reports; Vendor Security Assessment”
- **Applies when:** yes
- **Passes when:** `vault.de_pen_tests.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Penetration test and security audit reports · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your penetration test and security audit reports on file**
> You haven't added your penetration test and security audit reports to your documents yet.
> *Why it matters:* Investors and enterprise customers expect to see these.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your penetration test and security audit reports to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SEC.SOC2 — SOC 2 report

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 4, a document the company uploads | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “SOC 2 Type I / Type II reports”
- **Applies when:** `derived.enterprise` is yes
- **Passes when:** `vault.de_soc2.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** SOC 2 report · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your SOC 2 report on file**
> You haven't added your SOC 2 report to your documents yet.
> *Why it matters:* Enterprise customers often ask for one. It's confidential, so we keep it private.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your SOC 2 report to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SEC.ISO27001 — ISO 27001 or 27701 certificate — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 4, a document the company uploads | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “ISO/IEC 27001; ISO/IEC 27701 certification”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “IAF CertSearch”
- **Applies when:** `derived.enterprise` is yes
- **Passes when:** `vault.de_iso27001.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** ISO 27001 or 27701 certificate · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your ISO 27001 or 27701 certificate on file**
> You haven't added your ISO 27001 or 27701 certificate to your documents yet.
> *Why it matters:* Some enterprise customers ask for it.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your ISO 27001 or 27701 certificate to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SEC.PCI — PCI DSS attestation — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | security | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “PCI DSS compliance”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “card-network PCI service-provider lists”
- **Applies when:** `derived.sector.payments` is yes
- **Passes when:** `vault.de_pci.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** PCI DSS Attestation of Compliance · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your PCI DSS attestation on file**
> You haven't added your PCI DSS attestation to your documents yet.
> *Why it matters:* If you handle or store card data, card networks expect this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your PCI DSS attestation to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.SEC.TRAINING — Security awareness training records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 19 —: “Security Awareness Training”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.de_security_training.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Security training records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your security training records on file**
> You haven't added your security training records to your documents yet.
> *Why it matters:* Enterprise questionnaires ask whether your team is trained.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your security training records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (10)

### US-DE.EMP.AGREEMENTS — Employment agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “| Employment agreements |”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.de_employment_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employment agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employment agreements on file**
> You haven't added your employment agreements to your documents yet.
> *Why it matters:* Each employee should have one, with IP assignment in the offer letter.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your employment agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EMP.CONTRACTOR_AGREEMENTS — Independent contractor agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Independent Contractor Agreements”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.de_contractor_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Independent contractor agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your contractor agreements on file**
> You haven't added your contractor agreements to your documents yet.
> *Why it matters:* Each contractor should have one, with IP assignment and clear terms.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your contractor agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EMP.HANDBOOK — Employee handbook

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | employment_contracts | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Employee Handbook”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.de_handbook.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employee handbook · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employee handbook on file**
> You haven't added your employee handbook to your documents yet.
> *Why it matters:* As you grow, it keeps your policies in one place.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your employee handbook to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EMP.ONBOARDING — Employee onboarding records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Employee onboarding documentation”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.de_onboarding.present` is yes
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

### US-DE.COM.TERMS — Terms of service

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | terms | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “SaaS Agreement; Product Terms and Conditions; Website Terms of Service”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.terms_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published terms · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find terms of service on {company}'s website**
> We couldn't find published terms of service.
> *Why it matters:* Your terms set the limits of what you owe your customers. Without them, you may have no limit on liability.
> *If left:* Customers and investors will ask for them, and it's public, so it's easy to spot.
> *What to do:* Publish your terms and link them from your site footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.COM.API_LICENCE — API licence agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | terms | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “API Licence Agreement”
- **Applies when:** `derived.has_api` is yes
- **Passes when:** `vault.de_api_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** API terms · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s API terms on file**
> You offer an API, and you don't have API licence terms on file.
> *Why it matters:* These say what developers can do with your API, and what you are responsible for.
> *If left:* It tends to come up when a larger partner reads your paperwork.
> *What to do:* Add your API terms here. If you publish them, tell us where.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.COM.EULA — End user licence agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | terms | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “End User Licence Agreement”
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

### US-DE.COM.ENTERPRISE_CONTRACTS — Software licence, cloud services and service level agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “Software Licence Agreement; Cloud Services Agreement; Service Level Agreement”
- **Applies when:** `derived.enterprise` is yes
- **Passes when:** `vault.de_enterprise_contracts.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Software licence, cloud and service level agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your software licence and service level agreements on file**
> You haven't added your software licence and service level agreements to your documents yet.
> *Why it matters:* Enterprise customers will want these before they sign.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your software licence and service level agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.COM.COMMERCIAL_AGREEMENTS — Commercial agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Consultancy Agreement; Supplier Agreement; Commercial Partnership Agreement”
- **Applies when:** yes
- **Passes when:** `vault.de_commercial_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Supplier, partner and reseller agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your commercial agreements on file**
> You haven't added your commercial agreements to your documents yet.
> *Why it matters:* Investors want to see what you have agreed with your main partners.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your commercial agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.COM.MERCHANT — Merchant and payment processor agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | payments | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 23 —: “Merchant account; payment processor agreements; Stripe or gateway onboarding documentation”
- **Applies when:** `derived.takes_payments` is yes
- **Passes when:** `vault.de_merchant.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Merchant and payment processor agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payment processor agreements on file**
> You haven't added your payment processor agreements to your documents yet.
> *Why it matters:* These are what lets you take payments, and they can end quickly if you breach them.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your payment processor agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (6)

### US-DE.EQUITY.STOCK_ISSUANCE — Stock issuance records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | cap_table | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Stock issuance documentation; stock certificates or electronic share records”
- **Applies when:** `derived.is_corp` is yes
- **Passes when:** `vault.de_stock_issuance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Stock issuance records · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your stock issuance records on file**
> You haven't added your stock issuance records to your documents yet.
> *Why it matters:* These show that your shares were properly issued, which every investor will check.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your stock issuance records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EQUITY.STOCK_LEDGER — Stock ledger and cap table

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | cap_table | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Stock ledger; register of shareholders”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “Bylaws, organisational resolutions, stock ledger”
- **Applies when:** `derived.is_corp` is yes
- **Passes when:** `vault.de_stock_ledger.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Stock ledger or cap table · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your stock ledger and cap table on file**
> You haven't added your stock ledger and cap table to your documents yet.
> *Why it matters:* It is the record of who owns what. Investors will not move without it.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your stock ledger and cap table to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EQUITY.SHAREHOLDER_AGREEMENT — Shareholder agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 1 —: “Shareholder Agreement”
- **Applies when:** `derived.is_corp` is yes
- **Passes when:** `vault.de_shareholder_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Shareholder agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your shareholder agreement on file**
> You haven't added your shareholder agreement to your documents yet.
> *Why it matters:* It sets out what happens when a shareholder leaves or wants to sell.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your shareholder agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EQUITY.STOCK_PURCHASE — Founder stock purchase agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | founder_equity | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Stock Purchase Agreement; Restricted Stock Purchase Agreement”
- **Applies when:** `derived.is_corp` is yes
- **Passes when:** `vault.de_stock_purchase.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Founder stock purchase agreements · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your founder stock purchase agreements on file**
> You haven't added your founder stock purchase agreements to your documents yet.
> *Why it matters:* These show how founders got their shares, and any vesting.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your founder stock purchase agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EQUITY.OPTION_PLAN — Stock option plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | employee_equity | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Stock Option Plan; Equity Incentive Plan; Stock Option Grant Agreements”
- **Applies when:** all of: (`derived.is_corp` is yes) and (`derived.equity_incentives` is yes)
- **Passes when:** `vault.de_option_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Stock option plan and grants · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your stock option plan on file**
> You haven't added your stock option plan to your documents yet.
> *Why it matters:* Investors will check every option has a plan and a board approval behind it.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your stock option plan to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.EQUITY.INVESTOR_AGREEMENTS — Investor rights, voting and co-sale agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “Investor Rights Agreement; Voting Agreement; ROFR and Co-Sale Agreement”
- **Applies when:** `derived.priced_round` is yes
- **Passes when:** `vault.de_investor_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Investor rights, voting and co-sale agreements · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your priced round agreements on file**
> You haven't added your priced round agreements to your documents yet.
> *Why it matters:* These set out the rights your investors hold.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your priced round agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (7)

### US-DE.DP.RISK_ASSESSMENTS — Data protection risk assessments

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | Delaware Department of Justice |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 7 —: “Data protection risk assessments”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.de_dp_risk_assessment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data protection risk assessment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data protection risk assessments on file**
> You haven't added your data protection risk assessments to your documents yet.
> *Why it matters:* Targeted advertising, sales, profiling and sensitive data call for a written risk assessment.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your data protection risk assessments to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.AI.ACCEPTABLE_USE — AI acceptable use policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Acceptable Use Policy”
- **Applies when:** `derived.ai_or_staff_ai` is yes
- **Passes when:** `vault.de_ai_aup.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_use_policy` (counted once per company)
- **Evidence:** AI acceptable use policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI acceptable use policy on file**
> You haven't added your AI acceptable use policy to your documents yet.
> *Why it matters:* It tells your team what they can and cannot put into AI tools.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your AI acceptable use policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.AI.RISK_ASSESSMENT — AI risk assessment — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Risk Assessment”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “Colorado SB 26-189 effective date”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.de_ai_risk.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_risk_assessment` (counted once per company)
- **Evidence:** AI risk assessment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI risk assessment on file**
> You haven't added your AI risk assessment to your documents yet.
> *Why it matters:* It records what could go wrong with your AI and what you do about it.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your AI risk assessment to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.AI.MODEL_DOCS — AI model and training data records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Model Documentation; AI Training Data Documentation; AI Copyright and Licensing Records”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.de_ai_model_docs.present` is yes
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

### US-DE.AI.TRANSPARENCY — AI transparency — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Transparency Documentation”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “California AI Transparency Act timing”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.de_ai_transparency.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_transparency` (counted once per company)
- **Evidence:** Published AI disclosures · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find AI disclosures for {company}**
> You told us you use AI, and we couldn't find anything on your website that tells users about it.
> *Why it matters:* People should know when and how AI is being used in your product.
> *If left:* Enterprise customers and investors are starting to ask for this.
> *What to do:* Add a short AI section to your site, or add the record here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.AI.VENDOR_AGREEMENTS — AI vendor agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Vendor Agreements; AI Supplier Agreements”
- **Applies when:** `derived.ai_third_party_models` is yes
- **Passes when:** `vault.de_ai_vendors.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_vendors` (counted once per company)
- **Evidence:** AI vendor agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI vendor agreements on file**
> You haven't added your AI vendor agreements to your documents yet.
> *Why it matters:* If you use third-party models, these say what happens to your data and who owns the output.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your AI vendor agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US-DE.AI.GOVERNANCE — AI governance policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 21 —: “AI Governance Policy; AI Safety and Security Policy”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.de_ai_governance.present` is yes
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

## Documents this pack asks for (70)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `de_name_reservation` | Name reservation receipt | Before you incorporate, this shows the name you want is held for you. | tier 5 | no | US-DE.CORP.NAME_RESERVATION |
| `de_certificate_of_incorporation` | Certificate of Incorporation or Formation | It's the document that created your company. If our data provider can't find you, it settles the question. | tier 4 | no | US-DE.CORP.ENTITY_ON_RECORD, US-DE.CORP.INCORPORATOR |
| `de_good_standing` | Certificate of Good Standing | Delaware doesn't allow automatic status checks, so your certificate is how we know. Send a new one each year. | tier 4 | yes | US-DE.CORP.GOOD_STANDING |
| `de_certified_copies` | Certified copies of incorporation documents | Banks and investors often ask for certified copies rather than plain ones. | tier 4 | no | US-DE.CORP.CERTIFIED_COPIES |
| `de_bylaws` | Corporate bylaws | They're the rules for how your corporation is run, and investors read them. | tier 5 | no | US-DE.CORP.BYLAWS |
| `de_operating_agreement` | LLC operating agreement | It sets out who owns the LLC and how decisions are made. | tier 5 | no | US-DE.CORP.OPERATING_AGREEMENT |
| `de_organisational_resolutions` | Organisational resolutions | These are the first decisions that appointed your board and officers and issued your shares. | tier 5 | no | US-DE.CORP.ORGANISATIONAL_RESOLUTIONS |
| `de_stock_issuance` | Stock issuance records | These show that your shares were properly issued, which every investor will check. | tier 5 | no | US-DE.EQUITY.STOCK_ISSUANCE |
| `de_stock_ledger` | Stock ledger or cap table | It is the record of who owns what. Investors will not move without it. | tier 5 | no | US-DE.EQUITY.STOCK_LEDGER |
| `de_officer_records` | Director and officer records | Delaware doesn't publish directors except on the annual report, so we rely on your records. | tier 5 | no | US-DE.CORP.OFFICER_RECORDS |
| `de_shareholder_agreement` | Shareholder agreement | It sets out what happens when a shareholder leaves or wants to sell. | tier 5 | no | US-DE.EQUITY.SHAREHOLDER_AGREEMENT |
| `de_franchise_tax` | Franchise tax receipt or Tax & History lookup | Delaware keeps this behind a paid lookup, so we can't check it ourselves. Your receipt clears it. | tier 4 | no | US-DE.CORP.FRANCHISE_TAX |
| `de_llc_tax` | LLC tax receipt | Delaware doesn't publish this, so your receipt is the proof. | tier 4 | no | US-DE.CORP.LLC_TAX |
| `de_business_license` | Delaware business licence | You need one if you do business in Delaware, not just because you are incorporated there. | tier 4 | yes | US-DE.TAX.BUSINESS_LICENSE |
| `de_tax_registrations` | Delaware tax registrations (One Stop confirmation) | Doing business in Delaware brings in gross receipts and corporate income tax registrations. | tier 4 | no | US-DE.TAX.REGISTRATIONS |
| `de_tax_returns` | Delaware tax returns and payment records | Once you operate in Delaware, you file these regularly. | tier 5 | no | US-DE.TAX.RETURNS |
| `de_employer_registration` | Delaware employer and unemployment insurance registration | You need this if you have employees in Delaware. | tier 4 | no | US-DE.EMP.UI_REGISTRATION |
| `de_workers_comp` | Workers' compensation policy | Employers with Delaware staff need this cover. | tier 4 | yes | US-DE.EMP.WORKERS_COMP |
| `de_payroll_records` | Payroll, wage and unemployment contribution records | Employers keep these and file contribution returns. | tier 5 | no | US-DE.EMP.PAYROLL_RECORDS |
| `de_employment_compliance` | Employment and workplace safety records | Any employer should be able to show how they look after their team. | tier 5 | no | US-DE.EMP.COMPLIANCE_DOCS |
| `de_insurance_licence` | Insurance licence | Selling or arranging insurance needs a licence. | tier 4 | no | US-DE.SECTOR.INSURANCE_LICENCE |
| `de_insurtech_approvals` | Insurtech and partnership approvals | These show that your insurance arrangements have been approved. | tier 4 | no | US-DE.SECTOR.INSURTECH_APPROVALS |
| `de_professional_licence` | Professional licence and approvals | Regulated professions such as telehealth, accounting and engineering need these. | tier 4 | no | US-DE.SECTOR.PROFESSIONAL_LICENCE |
| `de_professional_insurance` | Professional liability insurance certificate | Regulated professions are expected to hold this cover. | tier 4 | yes | US-DE.SECTOR.PROFESSIONAL_INSURANCE |
| `dpdpa_records` | Delaware privacy law compliance records | It applies once you hold data on enough Delaware consumers. | tier 5 | no | US-DE.DP.DPDPA |
| `de_dp_risk_assessment` | Data protection risk assessment | Targeted advertising, sales, profiling and sensitive data call for a written risk assessment. | tier 5 | no | US-DE.DP.RISK_ASSESSMENTS |
| `de_privacy_complaints` | Privacy complaint procedures | It helps to know who answers a privacy complaint before one arrives. | tier 5 | no | US-DE.DP.COMPLAINTS |
| `de_dpa` | Data processing agreements | If vendors handle personal data for you, or you handle it for customers, this agreement sets the rules. | tier 5 | no | US-DE.DP.PROCESSING_AGREEMENT |
| `de_founder_ip_assignment` | Founders' IP assignments | A transfer of copyright has to be in writing, so this is what makes the company the owner of what founders built. | tier 5 | no | US-DE.IP.FOUNDER_ASSIGNMENT |
| `de_piia` | Signed invention assignment agreements (PIIA or CIIAA) | Everyone who writes code or creates work for you should have signed it over to the company. | tier 5 | no | US-DE.IP.PIIA |
| `de_contractor_ip_assignment` | Contractor agreements with written IP assignment | Contractor software usually isn't work-for-hire, so a written assignment is what moves ownership to you. | tier 5 | no | US-DE.IP.WORK_FOR_HIRE |
| `de_software_dev_agreement` | Software development agreements | If an outside developer builds your product, this sets out what you own. | tier 5 | no | US-DE.IP.SOFTWARE_DEVELOPMENT |
| `de_tech_transfer` | Technology transfer agreements | If IP moved across borders, such as from a Nigerian company to a Delaware parent, this is the record of it. | tier 5 | no | US-DE.IP.TECH_TRANSFER |
| `de_nda` | NDA template | You need one before you share anything sensitive with partners, investors or hires. | tier 5 | no | US-DE.IP.NDA |
| `de_open_source_policy` | Open source policy or audit report | Investors want to know your code has no licence problems hiding in it. | tier 5 | no | US-DE.IP.OPEN_SOURCE |
| `de_escrow` | Source code escrow agreement | Some enterprise customers ask for this. | tier 5 | no | US-DE.IP.ESCROW |
| `state_foreign_qualification` | Certificates of Authority from other states | If you do business in other states, you register there too. Our data provider may not cover every state. | tier 4 | no | US-DE.STATE.FOREIGN_QUALIFICATION |
| `state_tax_registrations` | State business licences and tax registrations | Each state where you operate has its own. | tier 4 | no | US-DE.STATE.LICENCES_AND_TAX |
| `state_sales_tax` | Sales tax permits | SaaS is taxable in some states once your sales there pass a threshold. | tier 4 | no | US-DE.STATE.SALES_TAX |
| `state_employer` | State employer, unemployment and workers' compensation registrations | Every state where you employ someone has its own registrations. | tier 4 | no | US-DE.STATE.EMPLOYER |
| `state_annual_reports` | State annual reports and franchise tax returns | Each state has its own annual filing, and missing one can suspend you there. | tier 4 | no | US-DE.STATE.ANNUAL_REPORTS |
| `de_employment_agreements` | Employment agreements | Each employee should have one, with IP assignment in the offer letter. | tier 5 | no | US-DE.EMP.AGREEMENTS |
| `de_contractor_agreements` | Independent contractor agreements | Each contractor should have one, with IP assignment and clear terms. | tier 5 | no | US-DE.EMP.CONTRACTOR_AGREEMENTS |
| `de_handbook` | Employee handbook | As you grow, it keeps your policies in one place. | tier 5 | no | US-DE.EMP.HANDBOOK |
| `de_onboarding` | Employee onboarding records | A simple checklist means no new hire misses a signature. | tier 5 | no | US-DE.EMP.ONBOARDING |
| `de_security_policies` | Information security policies | Enterprise customers and investors expect these in writing. | tier 5 | no | US-DE.SEC.POLICIES |
| `de_incident_response` | Incident response and data breach plan | State breach-notification laws apply in all 50 states, so you need a plan before something happens. | tier 5 | no | US-DE.SEC.INCIDENT_RESPONSE |
| `de_continuity` | Business continuity and disaster recovery plans | Larger customers ask what happens if your systems go down. | tier 5 | no | US-DE.SEC.CONTINUITY |
| `de_pen_tests` | Penetration test and security audit reports | Investors and enterprise customers expect to see these. | tier 5 | no | US-DE.SEC.PEN_TESTS |
| `de_soc2` | SOC 2 report | Enterprise customers often ask for one. It's confidential, so we keep it private. | tier 4 | yes | US-DE.SEC.SOC2 |
| `de_iso27001` | ISO 27001 or 27701 certificate | Some enterprise customers ask for it. | tier 4 | yes | US-DE.SEC.ISO27001 |
| `de_pci` | PCI DSS Attestation of Compliance | If you handle or store card data, card networks expect this. | tier 4 | yes | US-DE.SEC.PCI |
| `de_security_training` | Security training records | Enterprise questionnaires ask whether your team is trained. | tier 5 | no | US-DE.SEC.TRAINING |
| `de_ai_aup` | AI acceptable use policy | It tells your team what they can and cannot put into AI tools. | tier 5 | no | US-DE.AI.ACCEPTABLE_USE |
| `de_ai_risk` | AI risk assessment | It records what could go wrong with your AI and what you do about it. | tier 5 | no | US-DE.AI.RISK_ASSESSMENT |
| `de_ai_model_docs` | AI model, training data and licensing records | These show you have the rights to what your models were trained on. | tier 5 | no | US-DE.AI.MODEL_DOCS |
| `de_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | US-DE.AI.TRANSPARENCY |
| `de_ai_vendors` | AI vendor agreements | If you use third-party models, these say what happens to your data and who owns the output. | tier 5 | no | US-DE.AI.VENDOR_AGREEMENTS |
| `de_ai_governance` | AI governance policy | As you scale, this shows who is responsible for your AI decisions. | tier 5 | no | US-DE.AI.GOVERNANCE |
| `de_api_licence` | API licence agreement | If others build on your API, this sets the rules. | tier 5 | no | US-DE.COM.API_LICENCE |
| `de_enterprise_contracts` | Software licence, cloud and service level agreements | Enterprise customers will want these before they sign. | tier 5 | no | US-DE.COM.ENTERPRISE_CONTRACTS |
| `de_commercial_agreements` | Supplier, partner and reseller agreements | Investors want to see what you have agreed with your main partners. | tier 5 | no | US-DE.COM.COMMERCIAL_AGREEMENTS |
| `de_merchant` | Merchant and payment processor agreements | These are what lets you take payments, and they can end quickly if you breach them. | tier 5 | no | US-DE.COM.MERCHANT |
| `de_founders_agreement` | Founders' agreement and vesting | It settles who owns what and what happens if a founder leaves. | tier 5 | no | US-DE.CORP.FOUNDERS_AGREEMENT |
| `de_stock_purchase` | Founder stock purchase agreements | These show how founders got their shares, and any vesting. | tier 5 | no | US-DE.EQUITY.STOCK_PURCHASE |
| `de_option_plan` | Stock option plan and grants | Investors will check every option has a plan and a board approval behind it. | tier 5 | no | US-DE.EQUITY.OPTION_PLAN |
| `de_investor_agreements` | Investor rights, voting and co-sale agreements | These set out the rights your investors hold. | tier 5 | no | US-DE.EQUITY.INVESTOR_AGREEMENTS |
| `de_director_service` | Director service agreements | As the board grows, these set out what each director is there to do. | tier 5 | no | US-DE.CORP.DIRECTOR_SERVICE |
| `de_bank_resolution` | Board resolution for the bank account | Banks ask for it, and it shows who can sign for the company. | tier 5 | no | US-DE.CORP.BANK_RESOLUTION |
| `de_financial_records` | Annual financial statements and records | Investors will want to see these. | tier 5 | no | US-DE.CORP.FINANCIAL_RECORDS |
