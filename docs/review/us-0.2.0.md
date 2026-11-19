# Review: United States (federal) (US) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** US, version 0.2.0, 57 rules (13 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `d11da47fc58dacc83b19a11e8d339a6c032e81285b52a09dcb9ac118e26f415c`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (1)

### US.CORP.BOI_FOREIGN_ENTITY — Beneficial ownership report

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | FinCEN |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 4 —: “Beneficial ownership reporting”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 2. Consolidation notes: “Section 4 (FinCEN BOI) is now a non-item for US entities”
- **Applies when:** `derived.us.foreign_entity_us_registered` is yes
- **Passes when:** `attest.boi_report_filed` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation that the report is filed · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't told us the beneficial ownership report is filed**
> {company} is a non-US company registered to do business in a US state, and you haven't confirmed its beneficial ownership report is filed.
> *Why it matters:* US-formed companies no longer file this, but foreign companies registered in a state still do. FinCEN doesn't publish reports, so we can't check it ourselves.
> *If left:* If you're asked, you won't have anything on record to show you've dealt with it.
> *What to do:* File the report with FinCEN if you need to, then confirm it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (7)

### US.IP.TRADEMARK_SEARCH — Trademark search report

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | trademarks | tier 5, the company tells us | S2 incorporated, pre-revenue | USPTO |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 9 —: “Trademark search”
- **Applies when:** yes
- **Passes when:** `vault.us_trademark_search.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Trademark search report · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your trademark search report on file**
> You haven't added your trademark search report to your documents yet.
> *Why it matters:* A search shows whether someone else already has a mark close to yours.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your trademark search report to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.IP.TRADEMARK — US trademark filing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | trademarks | tier 1, official source, read live | S2 incorporated, pre-revenue | USPTO |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 9 —: “Federal trademark application; registration certificate”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “USPTO trademark filed”
- **Applies when:** yes
- **Passes when:** any of: (`registry.us.uspto.trademark_filed` is yes) or (`vault.us_trademark_certificate.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** USPTO record; Registration certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't find a US trademark filing for {company}**
> We couldn't find a USPTO filing for your brand, and you haven't added one. That doesn't prove there isn't one: give us the serial number if you've filed.
> *Why it matters:* Without a filing, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing does today.
> *What to do:* File for your brand name with the USPTO, or give us the serial number if you already have.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.IP.TRADEMARK_RENEWAL — US trademark renewal

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 1, official source, read live | S3 revenue, pre-raise | USPTO |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 9 —: “Trademark renewal”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 24 —: “Intellectual property renewals”
- **Applies when:** `registry.us.uspto.trademark_registered` is yes
- **Passes when:** `registry.us.uspto.trademark_status` is “live”
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"registry.us.uspto.trademark_registered_on","years":10} (checked automatically with the USPTO)
- **Numbers for you to confirm:** section_8_window_years = [5,6]; renewal_every_years = 10
- **Evidence:** USPTO status and maintenance events · **Fix type:** renew · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your US trademark doesn't show as live**
> The USPTO record for your trademark doesn't show it as live.
> *Why it matters:* Registered marks need a filing between years 5 and 6, and a renewal every 10 years, or they lapse.
> *If left:* If it has lapsed, you lose the protection of the registration and may have to file again.
> *What to do:* Check the record on the USPTO site and make the maintenance filing. If the deadline has passed, the USPTO explains whether the mark can still be revived.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.IP.PATENTS — US patent filings

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | patents | tier 1, official source, read live | S3 revenue, pre-raise | USPTO |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 9 —: “Patent application; utility patent; design patent”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “patents where relevant”
- **Applies when:** the answer to “Do you have technology you might want to patent?” is yes
- **Passes when:** any of: (`registry.us.uspto.patent_application_count` is more than 0) or (`vault.us_patent_filing.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** USPTO record; Patent filing receipt · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't find a US patent filing for {company}**
> You told us you have technology you might patent, and we couldn't find an application in {company}'s name. Recent applications may not show yet.
> *Why it matters:* Patents are optional, but if your edge is a technical invention, a filing is what protects it.
> *If left:* Public disclosure can affect whether you can still file, so it is worth deciding early.
> *What to do:* Decide whether to file before you show the invention in public. If you already have, upload the receipt.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.IP.ASSIGNMENT_RECORDS — Recorded patent and trademark assignments — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 3, official list | S3 revenue, pre-raise | USPTO |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 9 —: “Patent assignment documentation; trademark assignment documentation”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “USPTO assignment data in the Open Data Portal”
- **Applies when:** any of: (`registry.us.uspto.trademark_filed` is yes) or (the answer to “Do you have technology you might want to patent?” is yes)
- **Passes when:** `vault.us_ip_assignment_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Recorded patent or trademark assignments · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your recorded IP assignments on file**
> You haven't added your recorded IP assignments to your documents yet.
> *Why it matters:* If IP started out in a founder's name, the transfer to the company should be recorded.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your recorded IP assignments to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.IP.OWNERSHIP_LICENCES — IP ownership records and licences

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 9 —: “IP ownership records; patent and trademark licensing agreements”
- **Applies when:** yes
- **Passes when:** `vault.ip_ownership_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** IP ownership records and licences · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your IP ownership records and licences on file**
> You haven't added your IP ownership records and licences to your documents yet.
> *Why it matters:* A short record of what the company owns and licenses answers the first question investors ask about IP.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your IP ownership records and licences to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.IP.COPYRIGHT_REGISTRATION — Copyright registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | copyright | tier 3, official list | S3 revenue, pre-raise | US Copyright Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 10 —: “Copyright registration; software registration; website and content registration”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “Copyright Office records API”
- **Applies when:** yes
- **Passes when:** `vault.us_copyright_certificate.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Copyright registration certificate · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your copyright registration on file**
> You haven't added your copyright registration to your documents yet.
> *Why it matters:* It's optional, but you need a registration before you can sue for infringement.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your copyright registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (41)

### US.TAX.EIN — Tax number (EIN)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 2 —: “Employer Identification Number; federal tax registration”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “EIN letter on file”
- **Applies when:** yes
- **Passes when:** `vault.ein_letter.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** IRS CP575 or 147C letter · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have the IRS letter showing {company}'s tax number**
> You haven't uploaded the IRS letter that gives your Employer Identification Number (EIN).
> *Why it matters:* Your EIN is never published, so this letter is the only proof. Banks, investors and your payroll provider all ask for it.
> *If left:* You'll be asked for it when you open accounts or go through due diligence, and getting a copy from the IRS takes time.
> *What to do:* Upload your CP575 or 147C letter. We read the number and check the company name matches.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TAX.INCOME_RETURNS — Federal income tax returns

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 2 —: “Form 1120 (C-corp) / 1120-S (S-corp) / 1065”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 2 —: “Federal income tax returns; estimated tax payments”
- **Applies when:** yes
- **Passes when:** `vault.federal_tax_returns.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":4,"day_of_month":15} (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** Federal tax returns (Form 1120, 1120-S or 1065) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your federal income tax returns on file**
> You haven't added your federal income tax returns to your documents yet.
> *Why it matters:* Investors check these first, and they show the company has filed every year.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your federal income tax returns to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TAX.PAYROLL_RETURNS — Payroll tax registration and returns

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment_tax | tier 5, the company tells us | S2 incorporated, pre-revenue | Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 2 —: “Payroll tax registration; federal employment tax returns; Form 941; Form 940”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.payroll_returns.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every 3 months (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** Payroll tax returns (Forms 941 and 940) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your payroll tax returns on file**
> You haven't added your payroll tax returns to your documents yet.
> *Why it matters:* Once you have employees you file Form 941 each quarter and Form 940 each year.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your payroll tax returns to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TAX.W2_W4 — Employee tax forms (W-2 and W-4)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment_tax | tier 5, the company tells us | S2 incorporated, pre-revenue | Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 2 —: “Form W-2; Form W-4”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.w2_w4_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** W-2 and W-4 records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your W-2 and W-4 records on file**
> You haven't added your W-2 and W-4 records to your documents yet.
> *Why it matters:* These are the tax forms every employee should have on record.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your W-2 and W-4 records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TAX.1099 — Contractor tax forms (1099) — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | contractor_tax | tier 5, the company tells us | S3 revenue, pre-raise | Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 2 —: “Form 1099-NEC; Form 1099-MISC”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “Form 1099-NEC reporting threshold”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.1099_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** proposed_threshold_usd = 600; note = "Map says changed by 2025 legislation; figure to be confirmed."
- **Abroad:** never follows the company into another country
- **Evidence:** Form 1099 records for US contractors · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your 1099 records on file**
> You haven't added your 1099 records to your documents yet.
> *Why it matters:* US contractors paid above the reporting threshold need a 1099 each year.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your 1099 records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TAX.FORM_5472 — Form 5472 for foreign owners

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | international_tax | tier 5, the company tells us | S3 revenue, pre-raise | Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 2 —: “Form 5472”
- **Applies when:** `derived.foreign_owned` is yes
- **Passes when:** `vault.form_5472.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":4,"day_of_month":15} (reminder only)
- **Numbers for you to confirm:** penalty_usd_per_form = 25000
- **Abroad:** never follows the company into another country
- **Evidence:** Filed Form 5472 · **Fix type:** upload · **Penalty if left:** severe

**What the company reads when it fails:**

> **We can't see a Form 5472 for {company}**
> You told us the company has foreign owners, and you haven't added a Form 5472 to your documents.
> *Why it matters:* A company with 25% or more foreign ownership files this form every year with its tax return. It is common for Nigerian-founded Delaware companies.
> *If left:* The penalty for missing it is $25,000 per form.
> *What to do:* Ask your accountant to file it with your next return, then add a copy here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TAX.TRANSFER_PRICING — Transfer pricing documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | international_tax | tier 5, the company tells us | S5 post-raise | Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 2 —: “International tax reporting documentation; transfer pricing documentation”
- **Applies when:** `derived.foreign_owned` is yes
- **Passes when:** `vault.transfer_pricing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Transfer pricing and international tax records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your transfer pricing documentation on file**
> You haven't added your transfer pricing documentation to your documents yet.
> *Why it matters:* Once money moves between related companies across borders, you need a record of how the prices were set.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your transfer pricing documentation to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.CONSUMER.PRIVACY_DISCLOSURES — End-user privacy disclosures

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | privacy | tier 1, official source, read live | S2 incorporated, pre-revenue | Federal Trade Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 11 —: “End-user privacy disclosures”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.privacy_notice_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy notice · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find privacy disclosures for {company}'s users**
> We couldn't find a privacy notice on your website.
> *Why it matters:* What you tell users about their data has to match what your product really does.
> *If left:* A missing or wrong notice is one of the first things a regulator, a partner or an app store notices.
> *What to do:* Publish a privacy notice that matches your real data flows and link it from every page.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.CONSUMER.COPPA — Children's privacy (COPPA) — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | children | tier 5, the company tells us | S3 revenue, pre-raise | Federal Trade Commission |

- **Law cited:** COPPA Rule
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 11 —: “COPPA compliance; COPPA Rule compliance”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “COPPA amended-rule compliance date”
- **Applies when:** `derived.children` is yes
- **Passes when:** all of: (`vault.coppa_records.present` is yes) and (`web.policy.children_section` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** COPPA records; Children's section in your privacy notice · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company} meets the children's privacy rules**
> You told us children under 13 use your product, and we don't have your parental consent records or a children's section in your privacy notice.
> *Why it matters:* Services used by children under 13 need verifiable parental consent before collecting their data.
> *If left:* Regulators pay close attention to this one, and it is hard to fix after the data is collected.
> *What to do:* Add a children's section to your notice, set up parental consent, and add the records here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.CONSUMER.DATA_SECURITY — Data security records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | Federal Trade Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 11 —: “Data security compliance documentation”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `vault.ftc_data_security.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data security records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data security records on file**
> You haven't added your data security records to your documents yet.
> *Why it matters:* If you hold consumer data, you should be able to show how you protect it.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data security records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TELECOMS.FRN — FCC registration (FRN) — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | telecoms | tier 3, official list | S2 incorporated, pre-revenue | Federal Communications Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 12 —: “FCC registration (FRN)”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “FCC CORES export”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `vault.fcc_frn.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** FCC registration number (FRN) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your FCC registration on file**
> You haven't added your FCC registration to your documents yet.
> *Why it matters:* Telecoms businesses need an FCC registration number.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your FCC registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TELECOMS.AUTHORITY — Telecoms operating authority — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | telecoms | tier 3, official list | S2 incorporated, pre-revenue | Federal Communications Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 12 —: “Telecommunications operating authority; International Section 214 authorisation”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `vault.fcc_214.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Telecoms operating authority or Section 214 authorisation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your telecoms operating authority on file**
> You haven't added your telecoms operating authority to your documents yet.
> *Why it matters:* Carriers and VoIP providers need this authority to operate.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your telecoms operating authority to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TELECOMS.DOCS — Telecoms compliance records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | telecoms | tier 5, the company tells us | S3 revenue, pre-raise | Federal Communications Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 12 —: “Telecommunications compliance documentation”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `vault.fcc_compliance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Telecoms compliance records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your telecoms compliance records on file**
> You haven't added your telecoms compliance records to your documents yet.
> *Why it matters:* These show how you meet your FCC duties.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your telecoms compliance records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.TELECOMS.USF — Universal Service Fund compliance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | telecoms | tier 3, official list | S3 revenue, pre-raise | Federal Communications Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 12 —: “Universal Service Fund compliance”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `vault.fcc_usf.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Universal Service Fund records (Form 499) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Universal Service Fund records on file**
> You haven't added your Universal Service Fund records to your documents yet.
> *Why it matters:* Telecoms providers file Form 499, and the FCC publishes who has.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Universal Service Fund records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.BROKER_DEALER — SEC broker-dealer registration and FINRA membership — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | securities | tier 3, official list | S2 incorporated, pre-revenue | SEC and FINRA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “SEC broker-dealer registration; FINRA membership”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “FINRA BrokerCheck”
- **Applies when:** `derived.sector.securities` is yes
- **Passes when:** `vault.sec_broker_dealer.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Broker-dealer registration and FINRA membership · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your broker-dealer registration on file**
> You haven't added your broker-dealer registration to your documents yet.
> *Why it matters:* Brokerage and crowdfunding portals need this registration.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your broker-dealer registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.INVESTMENT_ADVISER — SEC investment adviser registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | securities | tier 3, official list | S2 incorporated, pre-revenue | SEC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “SEC investment adviser registration”
- **Applies when:** `derived.sector.securities` is yes
- **Passes when:** `vault.sec_adviser.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Investment adviser registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your investment adviser registration on file**
> You haven't added your investment adviser registration to your documents yet.
> *Why it matters:* Advisory technology companies may need this. The SEC publishes the register.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your investment adviser registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.EXCHANGE_ATS — Exchange or ATS registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | securities | tier 3, official list | S2 incorporated, pre-revenue | SEC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “Exchange or ATS registration”
- **Applies when:** `derived.sector.securities` is yes
- **Passes when:** `vault.sec_ats.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Exchange or ATS registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your exchange or ATS registration on file**
> You haven't added your exchange or ATS registration to your documents yet.
> *Why it matters:* Trading platforms need this registration. The SEC publishes the lists.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your exchange or ATS registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.MSB — FinCEN Money Services Business registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | payments | tier 3, official list | S2 incorporated, pre-revenue | FinCEN |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “FinCEN Money Services Business registration”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** `vault.fincen_msb.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after event: {"event_fact":"answers.money_services_started_on","days":180} (reminder only)
- **Evidence:** FinCEN MSB registration · **Fix type:** register · **Penalty if left:** severe

**What the company reads when it fails:**

> **We can't see {company}'s FinCEN registration**
> You told us you hold or move money, and you haven't added a FinCEN Money Services Business registration.
> *Why it matters:* Businesses that transmit money or convertible virtual currency have to register within 180 days of starting.
> *If left:* Banks and partners check this. If you're operating without it, they can stop working with you.
> *What to do:* Register with FinCEN, or tell us how you are exempt, then add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.BANK_CHARTER — Bank charter and deposit insurance approvals

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | banking | tier 3, official list | S2 incorporated, pre-revenue | OCC, Federal Reserve and FDIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “OCC national bank charter; Federal Reserve approvals; FDIC deposit insurance”
- **Applies when:** `derived.sector.banking` is yes
- **Passes when:** `vault.us_bank_charter.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Bank charter and approvals · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your bank charter and approvals on file**
> You haven't added your bank charter and approvals to your documents yet.
> *Why it matters:* Only applies if the company itself is a bank. Most startups work through a partner bank.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your bank charter and approvals to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.CFPB — Consumer finance compliance (CFPB)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | lending | tier 5, the company tells us | S3 revenue, pre-raise | CFPB |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “CFPB consumer finance compliance”
- **Applies when:** `derived.sector.lending` is yes
- **Passes when:** `vault.cfpb_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Consumer finance compliance records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your consumer finance compliance records on file**
> You haven't added your consumer finance compliance records to your documents yet.
> *Why it matters:* Lending to consumers brings in federal consumer finance rules.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your consumer finance compliance records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.CFTC — CFTC registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | derivatives | tier 3, official list | S2 incorporated, pre-revenue | CFTC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “CFTC registration”
- **Applies when:** `derived.sector.derivatives` is yes
- **Passes when:** `vault.cftc_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CFTC registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CFTC registration on file**
> You haven't added your CFTC registration to your documents yet.
> *Why it matters:* Derivatives businesses need this. It can be checked on NFA BASIC.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your CFTC registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.SANCT.SCREENING — Sanctions lists

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | sanctions | tier 3, official list | S2 incorporated, pre-revenue | OFAC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “No sanctions or restricted-party matches”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “OFAC sanctions compliance; OFAC screening”
- **Applies when:** yes
- **Passes when:** `registry.sanctions.match` is no
- **A problem (defect) when:** `registry.sanctions.match` is yes
- **“To check” when:** `registry.sanctions.possible_match` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Screening against official sanctions lists · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s name matches an entry on a sanctions list**
> Your company name matched an entry on an official sanctions list. It may be another business with a similar name.
> *Why it matters:* Banks, investors and payment providers will not work with a sanctioned party, so this needs a clear answer quickly.
> *If left:* If it stays unresolved, it can stop your bank account, your payments and any fundraising.
> *What to do:* Compare the entry with your company's details today. If it is a false match, we'll record why, so you have the answer when you're asked.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.SANCT.POLICY — Sanctions screening policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | sanctions | tier 5, the company tells us | S3 revenue, pre-raise | OFAC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “OFAC sanctions compliance; OFAC screening”
- **Applies when:** `derived.sanctions_exposure` is yes
- **Passes when:** `vault.ofac_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Sanctions screening policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your sanctions screening policy on file**
> You haven't added your sanctions screening policy to your documents yet.
> *Why it matters:* If you move money, deal in securities or export, you should screen who you deal with.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your sanctions screening policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.MONEY_TRANSMITTER — State money transmitter licences

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | payments | tier 5, the company tells us | S2 incorporated, pre-revenue | State regulators (NMLS) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “Money Transmitter Licence; state-by-state licences; NMLS registration”
- **Applies when:** `derived.moves_money` is yes
- **Passes when:** any of: (`vault.state_mtl.present` is yes) or (`vault.licensed_partner_agreement.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Do you have a signed agreement with them? You can upload it under Documents.”
- **Evidence:** NMLS ID and state licences; Sponsor-bank or agent-of-payee agreement · **Fix type:** register · **Penalty if left:** severe

**What the company reads when it fails:**

> **We can't see how {company} is licensed to move money**
> You told us you hold or move funds for others, and we don't have your state licences or an agreement with a sponsor bank.
> *Why it matters:* Money transmission is licensed state by state. You must hold a licence, or use a sponsor bank or agent-of-payee structure, before you start.
> *If left:* Operating without cover can shut your payments down, and investors will not close until it is clear.
> *What to do:* Add your NMLS ID and licences, or the agreement with your licensed partner.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.AML — AML and KYC policies

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | financial_crime | tier 5, the company tells us | S2 incorporated, pre-revenue | FinCEN |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “BSA compliance; AML Policy; KYC Policy; CDD procedures; SAR procedures”
- **Applies when:** `derived.sector.us_aml` is yes
- **Passes when:** `vault.us_aml_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** AML and KYC policies · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AML and KYC policies on file**
> You haven't added your AML and KYC policies to your documents yet.
> *Why it matters:* Payments, securities and lending businesses need written anti-money-laundering procedures.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your AML and KYC policies to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.SAFEGUARDING — Safeguarding and custody records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “Consumer financial protection compliance; safeguarding and custody documentation”
- **Applies when:** `derived.sector.payments` is yes
- **Passes when:** `vault.us_safeguarding.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Safeguarding and custody records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your safeguarding and custody records on file**
> You haven't added your safeguarding and custody records to your documents yet.
> *Why it matters:* If you hold customers' money, you should show how it is kept safe.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your safeguarding and custody records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EMP.I9 — Employment eligibility (Form I-9)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | USCIS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Form I-9; employment eligibility verification; Form I-9 compliance”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.i9_for_every_hire` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after event: {"event_fact":"answers.last_hire_on","days":3} (reminder only)
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation for each hire · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed Form I-9s are done for your team**
> We don't have your confirmation that every US hire has a completed Form I-9.
> *Why it matters:* Each new hire needs one within 3 days of starting.
> *If left:* It's a common finding in due diligence, and it is easy to lose track of as you grow.
> *What to do:* Complete any missing forms, keep them with your HR records, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EMP.OSHA — Workplace safety compliance (OSHA)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | employment | tier 5, the company tells us | S3 revenue, pre-raise | OSHA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “OSHA compliance”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.osha_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Workplace safety records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your workplace safety records on file**
> You haven't added your workplace safety records to your documents yet.
> *Why it matters:* Employers should keep a record of how they meet workplace safety rules.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your workplace safety records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EMP.EEO — Equal employment records — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | employment | tier 5, the company tells us | S3 revenue, pre-raise | EEOC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “EEO compliance”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “ACA employer mandate, EEO-1 and FMLA headcount thresholds”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.eeo_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Equal employment records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your equal employment records on file**
> You haven't added your equal employment records to your documents yet.
> *Why it matters:* Employers have equal opportunity duties, and larger ones file an EEO-1 report.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your equal employment records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EMP.FMLA — Family and medical leave compliance — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | employment | tier 5, the company tells us | S5 post-raise | Department of Labor |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “FMLA compliance”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “ACA employer mandate, EEO-1 and FMLA headcount thresholds”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.fmla_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Family and medical leave records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your family and medical leave records on file**
> You haven't added your family and medical leave records to your documents yet.
> *Why it matters:* This applies at 50 or more employees.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your family and medical leave records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EMP.IMMIGRATION — Visa sponsorship records — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | immigration | tier 5, the company tells us | S3 revenue, pre-raise | USCIS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Immigration sponsorship documentation; H-1B, L-1, O-1, E-2 visa documentation”
- **Applies when:** `derived.foreign_workers` is yes
- **Passes when:** `attest.visa_records_held` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Held or not held, per role · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed you hold visa records for sponsored staff**
> You told us you sponsor workers, and we don't have your confirmation that visa records are held for each role.
> *Why it matters:* These are personal documents, so we only ask whether you hold them, not for copies.
> *If left:* Missing records can affect both the employee and your ability to sponsor others.
> *What to do:* Check your records for each sponsored role, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EMP.EVERIFY — E-Verify registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | immigration | tier 3, official list | S2 incorporated, pre-revenue | USCIS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “E-Verify registration”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “USCIS E-Verify employer list”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.everify.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** E-Verify registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your E-Verify registration on file**
> You haven't added your E-Verify registration to your documents yet.
> *Why it matters:* It is mandatory for federal contractors and in some states.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your E-Verify registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EXPORT.CLASSIFICATION — Encryption and export classification

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | export_control | tier 5, the company tells us | S3 revenue, pre-raise | Bureau of Industry and Security |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 18 —: “ECCN determination; encryption export classification”
- **Applies when:** `derived.exports` is yes
- **Passes when:** `vault.eccn_classification.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Export classification (ECCN) or self-classification report · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your export classification on file**
> You haven't added your export classification to your documents yet.
> *Why it matters:* Most software using encryption, including SaaS used abroad, needs a classification.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your export classification to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EXPORT.LICENCE — Export licence

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | export_control | tier 4, a document the company uploads | S3 revenue, pre-raise | Bureau of Industry and Security |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 18 —: “Export licence application; technology export authorisation”
- **Applies when:** `derived.exports` is yes
- **Passes when:** `vault.us_export_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Export licence or authorisation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your export licence on file**
> You haven't added your export licence to your documents yet.
> *Why it matters:* Controlled items or destinations need a licence, and these aren't public.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your export licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EXPORT.PROGRAMME — Export compliance programme

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | export_control | tier 5, the company tells us | S3 revenue, pre-raise | Bureau of Industry and Security |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 18 —: “Export compliance programme; export documentation; end-user verification records”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 18 —: “Restricted-party screening”
- **Applies when:** `derived.exports` is yes
- **Passes when:** `vault.us_export_programme.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Export compliance programme and screening records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your export compliance programme on file**
> You haven't added your export compliance programme to your documents yet.
> *Why it matters:* This shows who you checked and how you stop sales to restricted parties.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your export compliance programme to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.HEALTH.FDA_REGISTRATION — FDA registration and device listing

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | healthtech | tier 3, official list | S3 revenue, pre-raise | FDA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 20 —: “FDA establishment registration and device listing”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 24 —: “Regulatory licence renewals”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.fda_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** expiry: {"fact":"vault.fda_registration.expires_on"} (reminder only)
- **Evidence:** FDA registration and device listing · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your FDA registration and device listing on file**
> You haven't added your FDA registration and device listing to your documents yet.
> *Why it matters:* Device and software-as-a-medical-device makers register before marketing, and renew each year.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your FDA registration and device listing to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.HEALTH.FDA_CLEARANCE — FDA premarket clearance

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | healthtech | tier 3, official list | S3 revenue, pre-raise | FDA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 20 —: “510(k) premarket notification; PMA; De Novo classification”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.fda_clearance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** 510(k), PMA or De Novo decision · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your FDA premarket clearance on file**
> You haven't added your FDA premarket clearance to your documents yet.
> *Why it matters:* A regulated device needs one of these before it reaches the market.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your FDA premarket clearance to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.HEALTH.QMSR — Software as a medical device and quality records — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | healthtech | tier 5, the company tells us | S3 revenue, pre-raise | FDA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 20 —: “SaMD regulatory compliance; QMSR compliance”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “FDA QMSR effective date”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.fda_qms.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Medical device quality records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your medical device quality records on file**
> You haven't added your medical device quality records to your documents yet.
> *Why it matters:* Medical device software needs a quality management system.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your medical device quality records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.HEALTH.HIPAA — HIPAA compliance and business associate agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | healthtech | tier 5, the company tells us | S2 incorporated, pre-revenue | HHS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 20 —: “HIPAA compliance; Privacy Rule; Security Rule; Breach Notification Rule”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.hipaa_baa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** HIPAA records and business associate agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your HIPAA records and business associate agreements on file**
> You haven't added your HIPAA records and business associate agreements to your documents yet.
> *Why it matters:* If you handle health data for covered entities, you need a business associate agreement with each one.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your HIPAA records and business associate agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.HEALTH.CMS — CMS programme registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S3 revenue, pre-raise | CMS |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 20 —: “CMS programme registration”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.cms_enrolment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CMS enrolment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CMS programme registration on file**
> You haven't added your CMS programme registration to your documents yet.
> *Why it matters:* Only applies if you bill Medicare or Medicaid.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your CMS programme registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.HEALTH.FACILITY — State healthcare facility licence

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S2 incorporated, pre-revenue | State health regulators |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 20 —: “State healthcare facility licensing”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.us_health_facility.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** State healthcare facility licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your state healthcare facility licence on file**
> You haven't added your state healthcare facility licence to your documents yet.
> *Why it matters:* Only applies if you run a healthcare facility.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your state healthcare facility licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (6)

### US.CONSUMER.FTC — Marketing claims and consumer protection records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | Federal Trade Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 11 —: “FTC Act compliance; consumer protection; advertising compliance”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `vault.ftc_marketing_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Marketing claims and consumer protection records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your consumer protection and marketing records on file**
> You haven't added your consumer protection and marketing records to your documents yet.
> *Why it matters:* If you sell to consumers, you should be able to back up what your marketing says.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your consumer protection and marketing records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.CONSUMER.AUTO_RENEWAL — Subscription and auto-renewal terms

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_terms | tier 1, official source, read live | S3 revenue, pre-raise | Federal Trade Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 11 —: “Subscription and automatic renewal compliance”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.subscriptions` is yes)
- **Passes when:** `web.policy.terms_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published terms with renewal and cancellation details · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find your renewal and cancellation terms**
> You sell subscriptions to consumers, and we couldn't find published terms covering renewal and how to cancel.
> *Why it matters:* State auto-renewal laws such as California's expect clear renewal disclosures and an easy way to cancel.
> *If left:* Unclear renewals are a common source of complaints and refund disputes.
> *What to do:* Publish your renewal terms and a simple cancellation path, then run the scan again.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.CONSUMER.REFUNDS — Refund, cancellation and complaints policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_terms | tier 1, official source, read live | S3 revenue, pre-raise | Federal Trade Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 11 —: “Consumer complaint handling policy; refund and cancellation policy”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `web.policy.refund_policy_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published refund and cancellation policy · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a refund and cancellation policy on your website**
> We couldn't find a published refund and cancellation policy.
> *Why it matters:* Consumers need to know how to get their money back and how to complain.
> *If left:* Without one, disputes get harder to settle and tend to reach your payment provider or a regulator.
> *What to do:* Publish the policy and link it from your site footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.CONSUMER.TCPA — Text and call marketing compliance (TCPA)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | marketing | tier 5, the company tells us | S3 revenue, pre-raise | Federal Communications Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 12 —: “TCPA compliance; robocall and automated messaging compliance”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.sms_or_calls` is yes)
- **Passes when:** `vault.tcpa_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Text and call consent records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your text and call marketing records on file**
> You haven't added your text and call marketing records to your documents yet.
> *Why it matters:* If you text or call US consumers, you should keep a record of their consent.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your text and call marketing records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FIN.PAYMENT_AGREEMENTS — Bank partnership and payment processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | payments | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 13 and 14: “Bank partnership agreements; payment processing agreements; electronic payment compliance documentation”
- **Applies when:** `derived.sector.payments` is yes
- **Passes when:** `vault.us_payment_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Bank partner and payment processing agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your bank partner and payment agreements on file**
> You haven't added your bank partner and payment agreements to your documents yet.
> *Why it matters:* These are what your payments business runs on, and investors read them closely.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your bank partner and payment agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.EMP.BENEFITS — Employee benefits records — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | employment | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Sections 16 and 17: “Employee benefits documentation; health insurance arrangements”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 6. Thresholds: “ACA employer mandate, EEO-1 and FMLA headcount thresholds”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.us_benefits.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employee benefits and health insurance records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employee benefits records on file**
> You haven't added your employee benefits records to your documents yet.
> *Why it matters:* Larger employers have duties here, and investors will ask.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your employee benefits records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (2)

### US.EQUITY.ELECTION_83B — 83(b) elections

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | founder_equity | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “83(b) election”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 5. The core set: “83(b) elections for founders with restricted stock”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 2. Consolidation notes: “the 83(b) election”
- **Applies when:** `derived.founder_restricted_stock` is yes
- **Passes when:** `vault.election_83b.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after event: {"event_fact":"answers.founder_stock_granted_on","days":30} (reminder only)
- **Evidence:** 83(b) election; Form 15620; Certified-mail receipt · **Fix type:** upload · **Penalty if left:** severe, matters for fundraising

**What the company reads when it fails:**

> **We can't see the 83(b) elections for {company}'s founders**
> You told us founders received stock that vests, and we have no 83(b) election or mailing receipt on file.
> *Why it matters:* The election has to be postmarked within 30 days of the stock grant. After that, the window has closed.
> *If left:* Investors check for this in due diligence, and founders can face a tax bill as their shares vest if it was missed.
> *What to do:* Upload each election with its Form 15620 and certified-mail receipt. If it was never filed, get tax advice now.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### US.FUND.FORM_D — SEC Form D for your round

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 1, official source, read live | S4 raising | SEC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, Section 22 —: “SAFE Agreement; Convertible Note Agreement; Subscription Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-delaware-rule-pack-map.md`, 4. Counts by tier: “SEC Form D”
- **Applies when:** `derived.invested` is yes
- **Passes when:** any of: (`registry.us.sec_form_d.filed` is yes) or (`vault.investment_docs.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** SEC EDGAR Form D; Round documents · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't find a Form D or round documents for {company}**
> You told us you have raised or are raising, and we couldn't find a Form D on SEC EDGAR or your round documents here. Not every round needs one, so this may be fine.
> *Why it matters:* A Form D is the public record of a private round. Together with your SAFEs or notes, it shows investors what was sold.
> *If left:* Investors in your next round will want the paper trail for every earlier one.
> *What to do:* Add your SAFEs, notes or subscription agreements, and check whether a Form D was due.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (50)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `ein_letter` | IRS letter with your EIN (CP575 or 147C) | Your tax number is never public, so this letter is the only way we can confirm it. | tier 4 | no | US.TAX.EIN |
| `federal_tax_returns` | Federal tax returns (Form 1120, 1120-S or 1065) | Investors check these first, and they show the company has filed every year. | tier 5 | no | US.TAX.INCOME_RETURNS |
| `payroll_returns` | Payroll tax returns (Forms 941 and 940) | Once you have employees you file Form 941 each quarter and Form 940 each year. | tier 5 | no | US.TAX.PAYROLL_RETURNS |
| `w2_w4_records` | W-2 and W-4 records | These are the tax forms every employee should have on record. | tier 5 | no | US.TAX.W2_W4 |
| `1099_records` | Form 1099 records for US contractors | US contractors paid above the reporting threshold need a 1099 each year. | tier 5 | no | US.TAX.1099 |
| `form_5472` | Form 5472 | Companies with 25% or more foreign ownership file this with their tax return. | tier 5 | no | US.TAX.FORM_5472 |
| `transfer_pricing` | Transfer pricing and international tax records | Once money moves between related companies across borders, you need a record of how the prices were set. | tier 5 | no | US.TAX.TRANSFER_PRICING |
| `us_trademark_search` | Trademark search report | A search shows whether someone else already has a mark close to yours. | tier 5 | no | US.IP.TRADEMARK_SEARCH |
| `us_trademark_certificate` | US trademark application or registration | Give us the serial number or upload the certificate so we can check it on the USPTO register. | tier 4 | no | US.IP.TRADEMARK |
| `us_patent_filing` | US patent application or grant | You told us you have technology you might patent. Unpublished applications won't show on the register, so upload the receipt. | tier 4 | no | US.IP.PATENTS |
| `us_ip_assignment_records` | Recorded patent or trademark assignments | If IP started out in a founder's name, the transfer to the company should be recorded. | tier 5 | no | US.IP.ASSIGNMENT_RECORDS |
| `ip_ownership_records` | IP ownership records and licences | A short record of what the company owns and licenses answers the first question investors ask about IP. | tier 5 | no | US.IP.OWNERSHIP_LICENCES |
| `us_copyright_certificate` | Copyright registration certificate | It's optional, but you need a registration before you can sue for infringement. | tier 4 | no | US.IP.COPYRIGHT_REGISTRATION |
| `ftc_marketing_records` | Marketing claims and consumer protection records | If you sell to consumers, you should be able to back up what your marketing says. | tier 5 | no | US.CONSUMER.FTC |
| `coppa_records` | COPPA records, including parental consent | You told us children under 13 use your product, which brings in special consent rules. | tier 5 | no | US.CONSUMER.COPPA |
| `ftc_data_security` | Data security records | If you hold consumer data, you should be able to show how you protect it. | tier 5 | no | US.CONSUMER.DATA_SECURITY |
| `fcc_frn` | FCC registration number (FRN) | Telecoms businesses need an FCC registration number. | tier 4 | no | US.TELECOMS.FRN |
| `fcc_214` | Telecoms operating authority or Section 214 authorisation | Carriers and VoIP providers need this authority to operate. | tier 4 | no | US.TELECOMS.AUTHORITY |
| `fcc_compliance` | Telecoms compliance records | These show how you meet your FCC duties. | tier 5 | no | US.TELECOMS.DOCS |
| `fcc_usf` | Universal Service Fund records (Form 499) | Telecoms providers file Form 499, and the FCC publishes who has. | tier 5 | no | US.TELECOMS.USF |
| `tcpa_records` | Text and call consent records | If you text or call US consumers, you should keep a record of their consent. | tier 5 | no | US.CONSUMER.TCPA |
| `sec_broker_dealer` | Broker-dealer registration and FINRA membership | Brokerage and crowdfunding portals need this registration. | tier 4 | no | US.FIN.BROKER_DEALER |
| `sec_adviser` | Investment adviser registration | Advisory technology companies may need this. The SEC publishes the register. | tier 4 | no | US.FIN.INVESTMENT_ADVISER |
| `sec_ats` | Exchange or ATS registration | Trading platforms need this registration. The SEC publishes the lists. | tier 4 | no | US.FIN.EXCHANGE_ATS |
| `fincen_msb` | FinCEN MSB registration | Money transmission and convertible virtual currency businesses register within 180 days of starting. | tier 4 | no | US.FIN.MSB |
| `us_bank_charter` | Bank charter and approvals | Only applies if the company itself is a bank. Most startups work through a partner bank. | tier 4 | no | US.FIN.BANK_CHARTER |
| `cfpb_records` | Consumer finance compliance records | Lending to consumers brings in federal consumer finance rules. | tier 5 | no | US.FIN.CFPB |
| `cftc_registration` | CFTC registration | Derivatives businesses need this. It can be checked on NFA BASIC. | tier 4 | no | US.FIN.CFTC |
| `ofac_policy` | Sanctions screening policy | If you move money, deal in securities or export, you should screen who you deal with. | tier 5 | no | US.SANCT.POLICY |
| `state_mtl` | Money transmitter licences and NMLS ID | Money transmission is licensed state by state, and the NMLS register can only be checked with the ID you give us. | tier 4 | no | US.FIN.MONEY_TRANSMITTER |
| `licensed_partner_agreement` | Agreement with your licensed payments partner | If a licensed partner moves the money, this agreement shows you are covered. You told us about it, and we need to see it. | tier 5 | no | US.FIN.MONEY_TRANSMITTER |
| `us_payment_agreements` | Bank partner and payment processing agreements | These are what your payments business runs on, and investors read them closely. | tier 5 | no | US.FIN.PAYMENT_AGREEMENTS |
| `us_aml_policy` | AML and KYC policies | Payments, securities and lending businesses need written anti-money-laundering procedures. | tier 5 | no | US.FIN.AML |
| `us_safeguarding` | Safeguarding and custody records | If you hold customers' money, you should show how it is kept safe. | tier 5 | no | US.FIN.SAFEGUARDING |
| `us_benefits` | Employee benefits and health insurance records | Larger employers have duties here, and investors will ask. | tier 5 | no | US.EMP.BENEFITS |
| `osha_records` | Workplace safety records | Employers should keep a record of how they meet workplace safety rules. | tier 5 | no | US.EMP.OSHA |
| `eeo_records` | Equal employment records | Employers have equal opportunity duties, and larger ones file an EEO-1 report. | tier 5 | no | US.EMP.EEO |
| `fmla_records` | Family and medical leave records | This applies at 50 or more employees. | tier 5 | no | US.EMP.FMLA |
| `everify` | E-Verify registration | It is mandatory for federal contractors and in some states. | tier 4 | no | US.EMP.EVERIFY |
| `eccn_classification` | Export classification (ECCN) or self-classification report | Most software using encryption, including SaaS used abroad, needs a classification. | tier 5 | no | US.EXPORT.CLASSIFICATION |
| `us_export_licence` | Export licence or authorisation | Controlled items or destinations need a licence, and these aren't public. | tier 4 | no | US.EXPORT.LICENCE |
| `us_export_programme` | Export compliance programme and screening records | This shows who you checked and how you stop sales to restricted parties. | tier 5 | no | US.EXPORT.PROGRAMME |
| `fda_registration` | FDA registration and device listing | Device and software-as-a-medical-device makers register before marketing, and renew each year. | tier 4 | yes | US.HEALTH.FDA_REGISTRATION |
| `fda_clearance` | 510(k), PMA or De Novo decision | A regulated device needs one of these before it reaches the market. | tier 4 | no | US.HEALTH.FDA_CLEARANCE |
| `fda_qms` | Medical device quality records | Medical device software needs a quality management system. | tier 5 | no | US.HEALTH.QMSR |
| `hipaa_baa` | HIPAA records and business associate agreements | If you handle health data for covered entities, you need a business associate agreement with each one. | tier 5 | no | US.HEALTH.HIPAA |
| `cms_enrolment` | CMS enrolment | Only applies if you bill Medicare or Medicaid. | tier 4 | no | US.HEALTH.CMS |
| `us_health_facility` | State healthcare facility licence | Only applies if you run a healthcare facility. | tier 4 | no | US.HEALTH.FACILITY |
| `election_83b` | 83(b) election, Form 15620 and certified-mail receipt | It has to be mailed within 30 days of the stock grant, and it's never public, so the receipt is the proof. | tier 4 | no | US.EQUITY.ELECTION_83B |
| `investment_docs` | SAFEs, notes and subscription agreements | These are the agreements that gave investors their rights. Form D filings can back them up. | tier 5 | no | US.FUND.FORM_D |
