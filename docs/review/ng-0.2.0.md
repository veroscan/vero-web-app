# Review: Nigeria (NG) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** NG, version 0.2.0, 109 rules (18 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `cd98885ac2565925455125c6b3e03de778505e742a52a8df7e969a086f05e2bf`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (21)

### NG.CORP.NAME_RESERVATION — Name reservation approval

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | formation | tier 5, the company tells us | S1 pre-incorporation | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Name availability search and reservation”
- **Applies when:** the answer to “Has it been registered yet?” is no
- **Passes when:** `vault.ng_name_reservation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Name reservation approval · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your name reservation approval on file**
> You haven't added your name reservation approval to your documents yet.
> *Why it matters:* Before you incorporate, this shows the name you want is held for you.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your name reservation approval to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.CAC_REGISTRATION — CAC registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 2, licensed vendor | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Company incorporation; Certificate of Incorporation”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “CAC registration active, with directors, shareholders and PSC on record”
- **Applies when:** yes
- **Passes when:** any of: (`registry.ng.cac.status` is “active”) or (`vault.ng_certificate_of_incorporation.present` is yes)
- **A problem (defect) when:** `registry.ng.cac.status` is “inactive”
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CAC record through our licensed data provider; Certificate of Incorporation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} doesn't show as active at the CAC**
> Our licensed data provider returned {company} as inactive, or couldn't find it, and you haven't uploaded your certificate. A company not filing its annual returns can be marked inactive.
> *Why it matters:* Anyone checking your company, banks and investors included, looks at this status first.
> *If left:* You can run into trouble opening accounts, signing contracts and raising money.
> *What to do:* Upload your certificate, and check your annual returns with the CAC. An accredited agent can sort it out.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.MEMART — Memorandum and Articles (MEMART)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Memorandum and Articles (MEMART)”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “MEMART, statutory registers, board resolutions”
- **Applies when:** yes
- **Passes when:** `vault.ng_memart.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Memorandum and Articles (MEMART) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your MEMART on file**
> You haven't added your MEMART to your documents yet.
> *Why it matters:* These are the rules for how your company is run. A certified copy can be ordered through an accredited agent.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your MEMART to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.DIRECTORS — Directors on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 2, licensed vendor | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Particulars of directors”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “CAC registration active, with directors, shareholders and PSC on record”
- **Applies when:** yes
- **Passes when:** `registry.ng.cac.directors_count` is at least 1
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CAC record through our licensed data provider · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s directors at the CAC**
> Our licensed data provider didn't return any directors for {company}.
> *Why it matters:* Your directors are the people legally responsible for the company, and banks and investors will check them.
> *If left:* Missing details can hold up onboarding and due diligence.
> *What to do:* Check your record with the CAC and file any changes.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.SHAREHOLDERS — Shareholders on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | shareholders | tier 2, licensed vendor | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Particulars of shareholders”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “CAC registration active, with directors, shareholders and PSC on record”
- **Applies when:** yes
- **Passes when:** `registry.ng.cac.shareholders_count` is at least 1
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CAC record through our licensed data provider · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s shareholders at the CAC**
> Our licensed data provider didn't return any shareholders for {company}.
> *Why it matters:* Investors need the CAC record to match your cap table.
> *If left:* A mismatch has to be fixed before a round can close, and that can take time.
> *What to do:* Check your record with the CAC and file what is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.SECRETARY — Company secretary

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 2, licensed vendor | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Particulars of company secretary”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 26 —: “Company Secretary documentation”
- **Applies when:** the answer to “Is it a small company under CAC rules?” is no
- **Passes when:** any of: (`registry.ng.cac.secretary_on_record` is yes) or (`vault.ng_company_secretary.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Company secretary details · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your company secretary on file**
> You haven't added your company secretary to your documents yet.
> *Why it matters:* Small companies are exempt, but others need to appoint one.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your company secretary to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.REGISTERED_OFFICE — Registered office address

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 2, licensed vendor | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Registered office address”
- **Applies when:** yes
- **Passes when:** `registry.ng.cac.registered_address_present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CAC record through our licensed data provider · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s registered address at the CAC**
> Our licensed data provider didn't return a registered address for {company}.
> *Why it matters:* This is where official post and legal papers go.
> *If left:* You can miss official letters, and it can hold up onboarding.
> *What to do:* Check your record with the CAC and update the address.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.SHARE_CAPITAL — Statement of share capital

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 2, licensed vendor | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Statement of share capital”
- **Applies when:** yes
- **Passes when:** `registry.ng.cac.share_capital_on_record` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CAC record through our licensed data provider · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s share capital at the CAC**
> Our licensed data provider didn't return share capital for {company}.
> *Why it matters:* It needs to match the shares on your cap table.
> *If left:* A mismatch will come up in due diligence.
> *What to do:* Check your record with the CAC and file any changes.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.CERTIFIED_DOCS — Certified incorporation documents

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | formation | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Certified incorporation documents”
- **Applies when:** yes
- **Passes when:** `vault.ng_certified_docs.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Certified incorporation documents · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your certified incorporation documents on file**
> You haven't added your certified incorporation documents to your documents yet.
> *Why it matters:* Banks and investors often ask for certified copies rather than plain ones.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your certified incorporation documents to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.PSC — People with significant control

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 2, licensed vendor | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “PSC registration and disclosure”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “CAC registration active, with directors, shareholders and PSC on record”
- **Applies when:** yes
- **Passes when:** `registry.ng.cac.psc_count` is at least 1
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CAC record through our licensed data provider · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see a person with significant control for {company}**
> Our licensed data provider didn't return a person with significant control for {company}.
> *Why it matters:* Companies have to disclose who controls them.
> *If left:* Banks and investors will ask, and they can stop until it is on record.
> *What to do:* File your person with significant control with the CAC.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.STATUTORY_REGISTERS — Statutory registers

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Register of Members”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Register of Directors”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Register of PSCs”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “MEMART, statutory registers, board resolutions”
- **Applies when:** yes
- **Passes when:** `vault.ng_statutory_registers.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Statutory registers · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your statutory registers on file**
> You haven't added your statutory registers to your documents yet.
> *Why it matters:* Every company keeps these. They are the record of who owns and runs it.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your statutory registers to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.SHARE_CERTIFICATES — Share certificates

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Share certificates”
- **Applies when:** yes
- **Passes when:** `vault.ng_share_certificates.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Share certificates · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your share certificates on file**
> You haven't added your share certificates to your documents yet.
> *Why it matters:* They are what shareholders hold to show what they own.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your share certificates to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.RESOLUTIONS — Board and shareholder resolutions

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Board resolutions”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 26 —: “Board resolutions; shareholder resolutions”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “MEMART, statutory registers, board resolutions”
- **Applies when:** yes
- **Passes when:** `vault.ng_resolutions.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Board and shareholder resolutions · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your board and shareholder resolutions on file**
> You haven't added your board and shareholder resolutions to your documents yet.
> *Why it matters:* These are the record of the big decisions your company has made.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your board and shareholder resolutions to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.ANNUAL_RETURNS — CAC annual returns — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Corporate Affairs Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 1 —: “Annual returns”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “CAC standing (annual returns)”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “first annual-return due date”
- **Applies when:** yes
- **Passes when:** `vault.ng_cac_status_report.present` is yes
- **A problem (defect) when:** `registry.ng.cac.status` is “inactive”
- **“To check” when:** `registry.ng.cac.status` is “active”
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every years: {"from_fact":"answers.last_annual_return_on","years":1} (reminder only)
- **Evidence:** CAC status report · **Fix type:** upload · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't confirm {company}'s annual returns are filed**
> The register shows your company as active, but only a CAC status report confirms your annual returns are filed.
> *Why it matters:* The CAC marks non-filers as inactive, and no public source shows filings by year, so we say "active" and not "filed".
> *If left:* Investors will ask for a status report. If returns are behind, the company can be marked inactive.
> *What to do:* Request a status report from the CAC and upload it. If it shows your returns are filed, this clears.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.FOREIGN.NIPC — NIPC registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | foreign_investment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Nigerian Investment Promotion Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 4 —: “NIPC registration; certificate; application”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “NIPC and the Startup Portal”
- **Applies when:** `derived.foreign_any` is yes
- **Passes when:** `vault.ng_nipc.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** NIPC certificate · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NIPC registration on file**
> You haven't added your NIPC registration to your documents yet.
> *Why it matters:* Foreign shareholders usually mean registering with the NIPC.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your NIPC registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.FOREIGN.BUSINESS_PERMIT — Business Permit

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | foreign_investment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Federal Ministry of Interior |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 5 —: “Business Permit; application”
- **Applies when:** the answer to “Does the company have foreign shareholders or directors?” is yes
- **Passes when:** `vault.ng_business_permit.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Business Permit · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your business Permit on file**
> You haven't added your business Permit to your documents yet.
> *Why it matters:* Foreign-owned companies need this from the Ministry of Interior.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your business Permit to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.FOUNDERS_AGREEMENT — Founders' agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | founders | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Founders' Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “Founders' agreement, founders' IP assignment, NDA template”
- **Applies when:** yes
- **Passes when:** `vault.ng_founders_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Founders' agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your founders' agreement on file**
> You haven't added your founders' agreement to your documents yet.
> *Why it matters:* It settles who owns what and what happens if a founder leaves.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your founders' agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.GOVERNANCE_POLICY — Corporate governance policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 26 —: “Corporate governance policy”
- **Applies when:** yes
- **Passes when:** `vault.ng_governance_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Corporate governance policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your corporate governance policy on file**
> You haven't added your corporate governance policy to your documents yet.
> *Why it matters:* As you scale, this shows how decisions get made.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your corporate governance policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.DELEGATION — Delegation of authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 26 —: “Delegation of Authority”
- **Applies when:** yes
- **Passes when:** `vault.ng_delegation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Delegation of authority · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your delegation of authority on file**
> You haven't added your delegation of authority to your documents yet.
> *Why it matters:* It says who can sign and approve what.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your delegation of authority to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.CONFLICTS — Conflict of interest policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 26 —: “Conflict of Interest Policy”
- **Applies when:** yes
- **Passes when:** `vault.ng_conflicts.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Conflict of interest policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your conflict of interest policy on file**
> You haven't added your conflict of interest policy to your documents yet.
> *Why it matters:* Investors ask for this when they raise.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your conflict of interest policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CORP.DIRECTOR_SERVICE — Directors' service agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 26 —: “Directors' service agreements”
- **Applies when:** yes
- **Passes when:** `vault.ng_director_service.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Directors' service agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your directors' service agreements on file**
> You haven't added your directors' service agreements to your documents yet.
> *Why it matters:* As the board grows, these set out what each director is there to do.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add your directors' service agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (12)

### NG.IP.COPYRIGHT_RECORDS — Copyright ownership records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | copyright | tier 5, the company tells us | S2 incorporated, pre-revenue | Nigerian Copyright Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 9 —: “Copyright ownership documentation; software copyright records”
- **Applies when:** yes
- **Passes when:** `vault.ng_copyright_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Copyright ownership records · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your copyright ownership records on file**
> You haven't added your copyright ownership records to your documents yet.
> *Why it matters:* Copyright arises automatically, so records of who made what are your proof.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your copyright ownership records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.FOUNDER_ASSIGNMENT — Founders' IP assignment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 2 IP and technology | ip_ownership | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** Copyright Act 2022
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “IP Assignment Agreement (founders; pre-incorporation IP)”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 9 —: “Copyright assignment agreements”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “Founders' agreement, founders' IP assignment, NDA template”
- **Applies when:** yes
- **Passes when:** `vault.ng_founder_ip_assignment.present` is yes
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

### NG.IP.TEAM_ASSIGNMENT — Invention and IP assignment from your team

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Copyright Act 2022
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Invention Assignment Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Software Development Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 9 —: “Copyright assignment agreements”
- **Applies when:** `derived.team_or_contractors` is yes
- **Passes when:** `vault.ng_team_ip_assignment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Have all employees?”; the answer to “Have all contractors?”
- **Evidence:** Signed assignment from each employee and contractor · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **Your team hasn't all signed their work over to {company}**
> You don't have a signed IP assignment from everyone who has worked on your product.
> *Why it matters:* Without it, the person who did the work may still own it. Your company may not legally own what it is selling.
> *If left:* It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.
> *What to do:* Add a standard IP clause to every contract, have everyone sign it, and add the copies here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.TRADEMARK_SEARCH — Trade mark search report

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | trademarks | tier 5, the company tells us | S2 incorporated, pre-revenue | Trademarks Registry |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 10 —: “Trademark search”
- **Applies when:** yes
- **Passes when:** `vault.ng_trademark_search.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Trade mark search report · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your trade mark search report on file**
> You haven't added your trade mark search report to your documents yet.
> *Why it matters:* An accredited agent can show whether someone already has a mark close to yours.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your trade mark search report to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.TRADEMARK — Nigerian trade mark

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Trademarks Registry |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 10 —: “Trademark application”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 10 —: “Trademark registration certificate”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “Trademark filed for the brand”
- **Applies when:** yes
- **Passes when:** `vault.ng_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Acknowledgement, acceptance letter or certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a Nigerian trade mark for {company}**
> You haven't added a trade mark application or certificate. Nigeria has no online register we can check, so we need it from you.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand later costs far more than a filing today.
> *What to do:* File through an accredited agent, or upload what you have.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.TRADEMARK_LICENCE — Trade mark licences

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | trademarks | tier 5, the company tells us | S3 revenue, pre-raise | Trademarks Registry |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 10 —: “Trademark licence documentation”
- **Applies when:** `attest.ng_licenses_marks` is yes
- **Passes when:** `vault.ng_trademark_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Trade mark licences · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your trade mark licences on file**
> You haven't added your trade mark licences to your documents yet.
> *Why it matters:* If others use your brand, or you use theirs, there should be a licence.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your trade mark licences to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.FOREIGN_TECH_AGREEMENTS — Technology transfer and foreign services agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | technology_transfer | tier 5, the company tells us | S2 incorporated, pre-revenue | NOTAP |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 11 —: “Technology Transfer, Software Licence, Technical Services, Management Services, Royalty agreements”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Technology Transfer Agreement”
- **Applies when:** `derived.foreign_tech` is yes
- **Passes when:** `vault.ng_foreign_tech_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Technology transfer and foreign services agreements · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your technology and foreign services agreements on file**
> You haven't added your technology and foreign services agreements to your documents yet.
> *Why it matters:* If you pay a foreign party for technology, these have to be registered with NOTAP.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your technology and foreign services agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.NOTAP — NOTAP registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 2 IP and technology | technology_transfer | tier 4, a document the company uploads | S2 incorporated, pre-revenue | NOTAP |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 11 —: “NOTAP registration application; certificate”
- **Applies when:** `derived.foreign_tech` is yes
- **Passes when:** `vault.ng_notap.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after event: {"event_fact":"answers.foreign_tech_agreement_on","days":30} (reminder only)
- **Evidence:** NOTAP certificate · **Fix type:** register · **Penalty if left:** moderate, matters for fundraising

**What the company reads when it fails:**

> **We can't see a NOTAP certificate for {company}**
> You told us you pay a foreign party for technology or services, and you haven't added a NOTAP certificate.
> *Why it matters:* These agreements are registered with NOTAP within 30 days of being signed.
> *If left:* It often comes up when you pay your foreign parent or a foreign supplier, and in due diligence.
> *What to do:* Register the agreement with NOTAP and upload the certificate.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.SOFTWARE_LICENCE — Software licence agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Software Licence Agreement”
- **Applies when:** yes
- **Passes when:** `vault.ng_software_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Software licence agreements · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your software licence agreements on file**
> You haven't added your software licence agreements to your documents yet.
> *Why it matters:* Investors want to see what you license in and out.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your software licence agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.SOURCE_CODE_LICENCE — Source code licence agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | enterprise | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Source Code Licence Agreement”
- **Applies when:** `derived.enterprise` is yes
- **Passes when:** `vault.ng_source_code_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Source code licence agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your source code licence agreement on file**
> You haven't added your source code licence agreement to your documents yet.
> *Why it matters:* Enterprise customers sometimes need rights to your source code.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your source code licence agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.ESCROW — Source code escrow agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | enterprise | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Source Code Escrow Agreement”
- **Applies when:** all of: (`derived.enterprise` is yes) and (the answer to “Has a customer asked for source code escrow?” is yes)
- **Passes when:** `vault.ng_escrow.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Source code escrow agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your source code escrow agreement on file**
> You haven't added your source code escrow agreement to your documents yet.
> *Why it matters:* Some enterprise customers ask for this.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your source code escrow agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.IP.NDA — NDA template

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | confidentiality | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Non-Disclosure Agreement”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “Founders' agreement, founders' IP assignment, NDA template”
- **Applies when:** yes
- **Passes when:** `vault.ng_nda.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NDA template · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your NDA template on file**
> You haven't added your NDA template to your documents yet.
> *Why it matters:* You need one before you share anything sensitive with partners, investors or hires.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add your NDA template to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (57)

### NG.TAX.TIN — Tax number (TIN)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 2, licensed vendor | S2 incorporated, pre-revenue | Nigeria Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 2 and 3: “Tax Identification Number (TIN)”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “TIN issued”
- **Applies when:** yes
- **Passes when:** any of: (`registry.ng.cac.tin_issued` is yes) or (`vault.ng_tin_evidence.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** TIN lookup through our licensed data provider; Tax registration evidence · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a tax number for {company}**
> Our licensed data provider didn't return a TIN for {company}, and you haven't added one.
> *Why it matters:* Your TIN is issued when you incorporate, and you need it for banking and tax.
> *If left:* You'll run into it the first time a bank, client or investor asks.
> *What to do:* Add your TIN evidence, or ask the Nigeria Revenue Service.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.TAX.TAXPRO_ACTIVATION — Tax registration and activation (TaxPro Max)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Nigeria Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 2 and 3: “Tax registration and activation (TaxPro Max)”
- **Applies when:** yes
- **Passes when:** `vault.ng_taxpro.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** TaxPro Max registration evidence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your tax registration evidence on file**
> You haven't added your tax registration evidence to your documents yet.
> *Why it matters:* A TIN alone does not mean the tax account is active.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your tax registration evidence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.TAX.CIT — Company Income Tax registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Nigeria Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 2 and 3: “Company Income Tax registration”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “small-company reliefs and the VAT registration threshold”
- **Applies when:** yes
- **Passes when:** `vault.ng_cit.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Company Income Tax registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your company Income Tax registration on file**
> You haven't added your company Income Tax registration to your documents yet.
> *Why it matters:* Small companies may have reliefs, but registration is still expected.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your company Income Tax registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.TAX.VAT — VAT registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Nigeria Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 2 and 3: “VAT registration”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “small-company reliefs and the VAT registration threshold”
- **Applies when:** yes
- **Passes when:** `vault.ng_vat.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** VAT registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your VAT registration on file**
> You haven't added your VAT registration to your documents yet.
> *Why it matters:* A registration threshold applies under the 2025 tax acts.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your VAT registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.TAX.PAYE — PAYE registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment_tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | State Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 2 and 3: “PAYE registration (federal and state)”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 20–24: “State IRS PAYE registration”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ng_paye.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** State PAYE registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your PAYE registration on file**
> You haven't added your PAYE registration to your documents yet.
> *Why it matters:* Employers register with the state where staff work.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your PAYE registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.TAX.PAYE_RETURNS — PAYE returns and remittance receipts

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment_tax | tier 5, the company tells us | S2 incorporated, pre-revenue | State Internal Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 20–24: “State IRS PAYE registration; employee tax registration; PAYE returns; remittance receipts”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ng_paye_returns.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every month (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** PAYE returns and remittance receipts · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your PAYE returns and receipts on file**
> You haven't added your PAYE returns and receipts to your documents yet.
> *Why it matters:* These show you have paid over what you deducted from staff.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your PAYE returns and receipts to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.TAX.WITHHOLDING — Withholding tax

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | Nigeria Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 2 and 3: “Withholding tax registration and compliance”
- **Applies when:** `derived.team_or_contractors` is yes
- **Passes when:** `attest.ng_withholding_tax` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation; Remittance evidence · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} handles withholding tax**
> We don't have your confirmation that you deduct and remit withholding tax when you pay vendors or contractors.
> *Why it matters:* It applies when you pay vendors or contractors.
> *If left:* It often comes up in a tax review or in due diligence, going back several years.
> *What to do:* Check with your accountant, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.TAX.CLEARANCE — Tax Clearance Certificate — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S3 revenue, pre-raise | Nigeria Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 2 and 3: “Tax Clearance Certificate”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “whether TCCs can be verified online”
- **Applies when:** yes
- **Passes when:** `vault.ng_tcc.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** expiry: {"fact":"vault.ng_tcc.expires_on"} (reminder only)
- **Abroad:** never follows the company into another country
- **Evidence:** Tax Clearance Certificate · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your tax Clearance Certificate on file**
> You haven't added your tax Clearance Certificate to your documents yet.
> *Why it matters:* Clients, banks and investors often ask for a current one.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your tax Clearance Certificate to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.TAX.RETURNS — Tax returns and payment receipts

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | tax | tier 5, the company tells us | S3 revenue, pre-raise | Nigeria Revenue Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 2 and 3: “Tax returns; assessment records; payment receipts”
- **Applies when:** yes
- **Passes when:** `vault.ng_tax_returns.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Tax returns and payment receipts · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your tax returns and receipts on file**
> You haven't added your tax returns and receipts to your documents yet.
> *Why it matters:* Investors check these. They show you have filed each year.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your tax returns and receipts to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.FOREIGN.EXPATRIATE_QUOTA — Expatriate Quota approval

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | immigration | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Federal Ministry of Interior |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 5 —: “Expatriate Quota approval; application”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 4 —: “Expatriate Quota approval”
- **Applies when:** `derived.foreign_workers` is yes
- **Passes when:** `vault.ng_expatriate_quota.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Expatriate Quota approval · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your expatriate Quota approval on file**
> You haven't added your expatriate Quota approval to your documents yet.
> *Why it matters:* You need this to employ expatriate staff.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your expatriate Quota approval to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.FOREIGN.IMMIGRATION_DOCS — Expatriate immigration documents

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | immigration | tier 5, the company tells us | S2 incorporated, pre-revenue | Nigeria Immigration Service |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 19 —: “Business visa; STR visa; CERPAC; residence permit; work authorisation; expatriate immigration documentation”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 5 —: “Immigration and employment authorisation documentation”
- **Applies when:** `derived.foreign_any` is yes
- **Passes when:** `attest.ng_immigration_docs_held` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Held or not held, per role · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed your foreign staff and directors have their documents**
> You told us you have foreign directors or staff, and we don't have your confirmation that they hold their visas and permits.
> *Why it matters:* These are personal documents, so we only ask whether they're held, not for copies.
> *If left:* Gaps can affect the person concerned and your standing as an employer.
> *What to do:* Check each role, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.FIN.CBN_LICENCE — CBN payments licence

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | payments | tier 3, official list | S2 incorporated, pre-revenue | Central Bank of Nigeria |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 6 —: “PSP / PSSP / Switching / MMO / PTSP licences”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 6 —: “"CBN Fintech licence"”
- **Applies when:** any of: (`derived.sector.payments` is yes) or (`derived.payments_via_partner_only` is yes)
- **Passes when:** any of: (`vault.ng_cbn_licence.present` is yes) or (`vault.ng_licensed_partner_agreement.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **The company can answer it directly:** the answer to “Do you have a signed agreement with them? You can upload it under Documents.”
- **Evidence:** CBN licence letter; Agreement with a licensed partner · **Fix type:** register · **Penalty if left:** severe

**What the company reads when it fails:**

> **We can't see how {company} is covered to handle payments**
> We don't have a CBN licence letter or an agreement with a licensed partner. If you use a partner, you've told us, but we haven't seen the agreement.
> *Why it matters:* You must hold the right licence before you go live. There is no single "fintech licence": it depends on what you do.
> *If left:* Operating without cover can stop your business, and investors will not close until it is clear.
> *What to do:* Add your licence letter, or your agreement with a licensed partner, so we can confirm you're covered.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.FIN.BANKING_LICENCE — Microfinance or Payment Service Bank licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | banking | tier 3, official list | S2 incorporated, pre-revenue | Central Bank of Nigeria |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 6 —: “Microfinance Bank licence; Payment Service Bank licence”
- **Applies when:** `derived.sector.banking` is yes
- **Passes when:** `vault.ng_bank_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Microfinance or Payment Service Bank licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your bank licence on file**
> You haven't added your bank licence to your documents yet.
> *Why it matters:* Only applies if the company itself takes deposits or operates as a bank.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your bank licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.FIN.CBN_COMPLIANCE — CBN compliance records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 5, the company tells us | S3 revenue, pre-raise | Central Bank of Nigeria |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 6 —: “CBN-approved compliance documentation”
- **Applies when:** `derived.sector.payments` is yes
- **Passes when:** `vault.ng_cbn_compliance.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CBN compliance records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your CBN compliance records on file**
> You haven't added your CBN compliance records to your documents yet.
> *Why it matters:* Licensed firms have to keep these up to date.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your CBN compliance records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.DCPMI_REGISTRATION — NDPC registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Nigeria Data Protection Commission |

- **Law cited:** Nigeria Data Protection Act 2023; GAID 2025
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Registration as DCPMI”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “NDPC DCPMI registration if above the data-subject threshold”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “EHL and UHL thresholds and fees”
- **Applies when:** `derived.ng.dcpmi_in_scope` is yes
- **Passes when:** any of: (`registry.ng.ndpc.listed` is yes) or (`vault.ng_ndpc_certificate.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** ohl_from_data_subjects_in_6_months = 200
- **Evidence:** NDPC register; NDPC certificate · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find {company} on the NDPC's list**
> We can't find {company} on the Nigeria Data Protection Commission's list. We match on name, so it may be listed differently.
> *Why it matters:* Companies that handle data on 200 or more people in 6 months have to register.
> *If left:* The list is public, so anyone can see you are not on it.
> *What to do:* Register with the Commission. Once you're listed, we'll see it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Nigeria Data Protection Commission |

- **Law cited:** GAID 2025, Art 11(2)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “DPO appointment”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.ng.dcpmi_in_scope` is yes)
- **Passes when:** all of: (`attest.ng_dpo_appointed` is yes) and (`web.policy.dpo_contact` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; DPO contact in your notice · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company}'s data protection officer**
> We don't have your confirmation of a data protection officer, or we couldn't find their contact in your notice.
> *Why it matters:* Controllers of major importance need a DPO, and their contact has to be published.
> *If left:* It is one of the first things the Commission looks for.
> *What to do:* Appoint a DPO, publish their contact, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.AUDIT_RETURN — Data protection audit return

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Nigeria Data Protection Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Data Protection Compliance Audit; Audit Report; Compliance Certificate”
- **Applies when:** `derived.ng.audit_through_dpco` is yes
- **Passes when:** `vault.ng_car_receipt.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every year on 31 March (reminder only)
- **Evidence:** Audit return filing receipt · **Fix type:** file · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't see {company}'s data protection audit return**
> You haven't added a filing receipt for your annual audit return.
> *Why it matters:* Larger firms file this through a licensed data protection compliance organisation by 31 March each year.
> *If left:* It's a regular check, and the Commission can see who hasn't filed.
> *What to do:* Engage a licensed organisation, file the return, and upload the receipt. The next one is due 31 March.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.DPCO — Licensed data protection compliance organisation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 3, official list | S2 incorporated, pre-revenue | Nigeria Data Protection Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “DPCO engagement”
- **Applies when:** `derived.ng.audit_through_dpco` is yes
- **Passes when:** `vault.ng_dpco.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** DPCO engagement letter · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your DPCO engagement letter on file**
> You haven't added your DPCO engagement letter to your documents yet.
> *Why it matters:* Give us the name and we can check it against the licensed list.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your DPCO engagement letter to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.PRIVACY_POLICY — Privacy policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Nigeria Data Protection Commission |

- **Law cited:** Nigeria Data Protection Act 2023, s27; GAID 2025, Art 7
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “| Privacy Policy |”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “Privacy policy and cookie notice compliant with GAID”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.privacy_notice_found` is yes
- **A problem (defect) when:** `web.policy.stale_citation` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published privacy policy · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s privacy policy is missing or out of date**
> We couldn't find a privacy policy on your website, or it cites an old law such as the NDPR.
> *Why it matters:* If you have users, you need to tell them what you do with their data, in plain language.
> *If left:* It's public, so regulators, customers and investors can all see the gap.
> *What to do:* Publish a policy written for the Nigeria Data Protection Act and GAID.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.PROCESSING_AGREEMENT — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Data Processing Agreement”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.ng_dpa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data processing agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data processing agreements on file**
> You haven't added your data processing agreements to your documents yet.
> *Why it matters:* If vendors handle personal data for you, this agreement sets the rules.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data processing agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Records of Processing Activities”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.ng_ropa.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Records of processing activities · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your records of processing on file**
> You haven't added your records of processing to your documents yet.
> *Why it matters:* It is the list of what personal data you hold and why.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your records of processing to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.BREACH — Data breach response policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Data breach response policy”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Data breach notification documentation”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.ng_breach_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data breach response policy and records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach response policy on file**
> You haven't added your data breach response policy to your documents yet.
> *Why it matters:* You need to know who does what before something goes wrong.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data breach response policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.RIGHTS — Data subject rights procedures

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Data subject rights procedures”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** all of: (`attest.ng_rights_procedure` is yes) and (`web.policy.rights_section` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Rights section in your policy · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm how {company} handles people's data requests**
> We don't have your confirmation of a process, or your policy doesn't explain people's rights.
> *Why it matters:* People can ask to see or delete their data, and you have to answer them.
> *If left:* When the first request arrives you'll be working it out under a deadline.
> *What to do:* Write down your process, explain the rights in your policy, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.TRANSFERS — Cross-border data transfer records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** GAID 2025, Art 45
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Cross-border data transfer documentation”
- **Applies when:** `derived.data_outside_home` is yes
- **Passes when:** `vault.ng_transfers.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Cross-border data transfer records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your cross-border data transfer records on file**
> You haven't added your cross-border data transfer records to your documents yet.
> *Why it matters:* If your data is hosted outside Nigeria, you need a basis for the transfer.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your cross-border data transfer records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.CONSENT_COOKIES — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | Nigeria Data Protection Commission |

- **Law cited:** GAID 2025, Art 19
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Consent records”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “Privacy policy and cookie notice compliant with GAID”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `derived.web.trackers_before_consent` is no
- **A problem (defect) when:** `derived.web.trackers_before_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** What your site set before anyone agreed · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s website sets cookies before anyone has agreed**
> We loaded your site and it set non-essential cookies or loaded trackers before anyone agreed.
> *Why it matters:* GAID expects a clear choice to accept or reject, with the purpose stated.
> *If left:* Anyone can see this from outside, regulators included.
> *What to do:* Set up your consent banner to hold those tags back until someone agrees.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.COOKIE_POLICY — Cookie policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** GAID 2025, Arts 7, 19
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “Cookie Policy”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 5. The core set: “Privacy policy and cookie notice compliant with GAID”
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

### NG.DP.RETENTION — Data retention policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Data retention policy”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** all of: (`attest.ng_retention_policy` is yes) and (`web.policy.retention_statement` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Retention statement in your policy · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm how long {company} keeps people's data**
> We don't have your confirmation of a retention policy, or your policy doesn't say how long you keep data.
> *Why it matters:* You shouldn't keep personal data for longer than you need it.
> *If left:* The more you keep, the more you have to answer for if something goes wrong.
> *What to do:* Set your retention periods, add them to your policy, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.DP.TRAINING — Data protection training records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “Data protection training records”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.ng_dp_training.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data protection training records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data protection training records on file**
> You haven't added your data protection training records to your documents yet.
> *Why it matters:* It shows your team knows what to do.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your data protection training records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.NITDA_PROVIDER — NITDA IT service provider registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | government_supply | tier 4, a document the company uploads | S3 revenue, pre-raise | NITDA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 8 and 18: “NITDA IT service provider registration”
- **Applies when:** `derived.gov_supplier` is yes
- **Passes when:** `vault.ng_nitda_provider.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NITDA registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NITDA registration on file**
> You haven't added your NITDA registration to your documents yet.
> *Why it matters:* You need this to supply IT services to government bodies.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NITDA registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.NITDA_CODE — NITDA Code of Practice records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | platform | tier 5, the company tells us | S3 revenue, pre-raise | NITDA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 8 and 18: “NITDA Code of Practice compliance documentation”
- **Applies when:** `derived.sector.platform` is yes
- **Passes when:** `vault.ng_nitda_code.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NITDA Code of Practice records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NITDA Code of Practice records on file**
> You haven't added your NITDA Code of Practice records to your documents yet.
> *Why it matters:* Platforms with user content have duties under the Code.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NITDA Code of Practice records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.LOCAL_LIAISON — Local liaison appointment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | platform | tier 5, the company tells us | S3 revenue, pre-raise | NITDA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 8 and 18: “Local liaison appointment”
- **Applies when:** all of: (`derived.sector.platform` is yes) and (`derived.foreign_any` is yes)
- **Passes when:** `attest.ng_local_liaison` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has a local liaison**
> You run a platform with foreign links, and we don't have your confirmation of a local liaison.
> *Why it matters:* The Code expects a local point of contact.
> *If left:* Regulators want someone in the country they can reach.
> *What to do:* Appoint your liaison, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.TAKEDOWN — Content moderation and takedown policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | platform | tier 1, official source, read live | S3 revenue, pre-raise | NITDA |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 8 and 18: “Content moderation and takedown policy”
- **Applies when:** `derived.sector.platform` is yes
- **Passes when:** any of: (`web.policy.takedown_policy_found` is yes) or (`attest.ng_takedown_policy` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published policy; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a takedown policy for {company}**
> You host user content, and we couldn't find a moderation and takedown policy.
> *Why it matters:* People need a way to report content, and you need a process to deal with it.
> *If left:* Without one, complaints can turn into regulator attention.
> *What to do:* Publish a policy and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.NCC_LICENCE — NCC licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | telecoms | tier 3, official list | S2 incorporated, pre-revenue | Nigerian Communications Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 12 —: “Telecommunications operating licence; ISP; VAS; Unified Access Service”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “NCC, NAICOM, NAFDAC, NHIA, MDCN”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `vault.ng_ncc_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NCC licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NCC licence on file**
> You haven't added your NCC licence to your documents yet.
> *Why it matters:* Telecoms, internet and value-added services need this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NCC licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.NCC_APPROVALS — NCC infrastructure sharing and spectrum approvals

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | telecoms | tier 4, a document the company uploads | S3 revenue, pre-raise | Nigerian Communications Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 12 —: “Infrastructure sharing approval; spectrum licence”
- **Applies when:** `derived.sector.telecoms` is yes
- **Passes when:** `vault.ng_ncc_approvals.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NCC approvals · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NCC approvals on file**
> You haven't added your NCC approvals to your documents yet.
> *Why it matters:* Only applies if you share infrastructure or use spectrum.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NCC approvals to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.SEC_DIGITAL_ASSETS — SEC digital asset licence

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | crypto | tier 3, official list | S2 incorporated, pre-revenue | Securities and Exchange Commission (Nigeria) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 13 —: “Digital Asset Operator, Exchange, Custodian licences; issuance approval; registration”
- **Applies when:** `derived.sector.crypto` is yes
- **Passes when:** `vault.ng_sec_digital_assets.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** SEC digital asset licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your SEC digital asset licence on file**
> You haven't added your SEC digital asset licence to your documents yet.
> *Why it matters:* Crypto businesses need this. The SEC publishes registered operators.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your SEC digital asset licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.SEC_INVESTMENT — SEC capital market or crowdfunding registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | securities | tier 3, official list | S2 incorporated, pre-revenue | Securities and Exchange Commission (Nigeria) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 13 —: “Capital Market Operator; Investment Adviser registration”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 13 —: “Crowdfunding Intermediary registration”
- **Applies when:** `derived.sector.securities` is yes
- **Passes when:** `vault.ng_sec_investment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** SEC registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your SEC registration on file**
> You haven't added your SEC registration to your documents yet.
> *Why it matters:* Investment and crowdfunding businesses need this. The SEC publishes registered operators.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your SEC registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.FCCPC_LENDING — FCCPC digital lending approval

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | lending | tier 3, official list | S2 incorporated, pre-revenue | FCCPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 14 —: “Digital lending registration; approval”
- **Applies when:** `derived.sector.lending` is yes
- **Passes when:** `vault.ng_fccpc.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** FCCPC lending approval · **Fix type:** upload · **Penalty if left:** severe

**What the company reads when it fails:**

> **We don't have your FCCPC lending approval on file**
> You haven't added your FCCPC lending approval to your documents yet.
> *Why it matters:* Digital lenders need this before they launch. The FCCPC publishes who is approved, on a watch list or delisted.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your FCCPC lending approval to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.NAICOM_LICENCE — Insurance broker or agent licence — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | insurtech | tier 3, official list | S2 incorporated, pre-revenue | NAICOM |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 15 —: “Insurance Broker licence; Insurance Agent registration”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “NCC, NAICOM, NAFDAC, NHIA, MDCN”
- **Applies when:** `derived.sector.insurtech` is yes
- **Passes when:** `vault.ng_naicom.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NAICOM licence · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NAICOM licence on file**
> You haven't added your NAICOM licence to your documents yet.
> *Why it matters:* Selling or arranging insurance needs this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NAICOM licence to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SECTOR.INSURTECH_APPROVAL — Insurtech and partnership approval

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | insurtech | tier 4, a document the company uploads | S2 incorporated, pre-revenue | NAICOM |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 15 —: “Insurtech approval; partnership approval”
- **Applies when:** `derived.sector.insurtech` is yes
- **Passes when:** `vault.ng_insurtech_approval.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Insurtech and partnership approval · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your insurtech approval on file**
> You haven't added your insurtech approval to your documents yet.
> *Why it matters:* These show your insurance arrangements have been approved.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your insurtech approval to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.HEALTH.NAFDAC_PRODUCT — NAFDAC product registration — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | healthtech | tier 3, official list | S3 revenue, pre-raise | NAFDAC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 16 —: “Product registration; approval”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “NCC, NAICOM, NAFDAC, NHIA, MDCN”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.ng_nafdac_product.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NAFDAC product registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NAFDAC product registration on file**
> You haven't added your NAFDAC product registration to your documents yet.
> *Why it matters:* Regulated health products need this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NAFDAC product registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.HEALTH.NAFDAC_ESTABLISHMENT — NAFDAC establishment registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S2 incorporated, pre-revenue | NAFDAC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 16 —: “Establishment registration”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.ng_nafdac_establishment.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NAFDAC establishment registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NAFDAC establishment registration on file**
> You haven't added your NAFDAC establishment registration to your documents yet.
> *Why it matters:* Health businesses dealing in regulated products need this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NAFDAC establishment registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.HEALTH.DEVICE_APPROVAL — Software or medical device approval

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S3 revenue, pre-raise | NAFDAC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 16 —: “Software or medical device approvals”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.ng_device_approval.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Software or medical device approval · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your device approval on file**
> You haven't added your device approval to your documents yet.
> *Why it matters:* Software that works as a medical device needs approval.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your device approval to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.HEALTH.MDCN — MDCN registration or approvals — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Medical and Dental Council of Nigeria |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 17 —: “MDCN registration or approvals”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “NCC, NAICOM, NAFDAC, NHIA, MDCN”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.ng_mdcn.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** MDCN approval · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your MDCN approval on file**
> You haven't added your MDCN approval to your documents yet.
> *Why it matters:* Clinical services need this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your MDCN approval to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.HEALTH.NHIA — NHIA registration or approvals — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S2 incorporated, pre-revenue | National Health Insurance Authority |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 17 —: “NHIA registration or approvals”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “NCC, NAICOM, NAFDAC, NHIA, MDCN”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.ng_nhia.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** NHIA approval · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NHIA approval on file**
> You haven't added your NHIA approval to your documents yet.
> *Why it matters:* Health insurance businesses need this.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NHIA approval to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.HEALTH.FACILITY — Health facility registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | healthtech | tier 4, a document the company uploads | S2 incorporated, pre-revenue | State health regulators |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 17 —: “Health facility registration”
- **Applies when:** `derived.sector.healthtech` is yes
- **Passes when:** `vault.ng_health_facility.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Health facility registration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your health facility registration on file**
> You haven't added your health facility registration to your documents yet.
> *Why it matters:* Only applies if you run a health facility.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your health facility registration to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EMP.NSITF — NSITF Employee Compensation Scheme — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | NSITF |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 20–24: “NSITF employer registration; Employee Compensation Scheme registration”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “NSITF and NHF: any online compliance verification”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ng_nsitf.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** ECS compliance certificate · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s NSITF certificate**
> You have employees, and you haven't added your NSITF compliance certificate.
> *Why it matters:* Employers register for the Employee Compensation Scheme from their first employee.
> *If left:* Government clients and bigger customers often ask to see this certificate.
> *What to do:* Register with NSITF and upload your certificate.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EMP.PENCOM — Pension Clearance Certificate — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | PenCom |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 20–24: “PenCom pension registration; PFA engagement”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “PenCom and ITF: statutory headcount”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ng_pencom.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Pension Clearance Certificate · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your pension Clearance Certificate on file**
> You haven't added your pension Clearance Certificate to your documents yet.
> *Why it matters:* A headcount threshold applies, and this certificate is the usual proof.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your pension Clearance Certificate to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EMP.ITF — ITF compliance certificate — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Industrial Training Fund |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 20–24: “ITF employer registration; compliance documentation; contribution records”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “PenCom and ITF: statutory headcount”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ng_itf.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** ITF compliance certificate · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your ITF compliance certificate on file**
> You haven't added your ITF compliance certificate to your documents yet.
> *Why it matters:* A headcount or turnover threshold applies.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your ITF compliance certificate to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EMP.NHF — NHF compliance certificate — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | National Housing Fund |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Sections 20–24: “NHF registration; contribution records; employer compliance documentation”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “NSITF and NHF: any online compliance verification”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ng_nhf.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** NHF compliance certificate · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your NHF compliance certificate on file**
> You haven't added your NHF compliance certificate to your documents yet.
> *Why it matters:* Employers register for the National Housing Fund.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your NHF compliance certificate to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SEC.POLICIES — Information security and cybersecurity policies

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “Information Security Policy”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “Cybersecurity Policy”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 28 —: “Cybersecurity compliance documentation; Cybercrime compliance documentation”
- **Applies when:** yes
- **Passes when:** `vault.ng_security_policies.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Information security and cybersecurity policies · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your security policies on file**
> You haven't added your security policies to your documents yet.
> *Why it matters:* Enterprise customers and investors expect these in writing.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your security policies to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SEC.INCIDENT_RESPONSE — Incident response policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “Incident Response Policy”
- **Applies when:** yes
- **Passes when:** `vault.ng_incident_response.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Incident response policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your incident response policy on file**
> You haven't added your incident response policy to your documents yet.
> *Why it matters:* You need to know who does what before something goes wrong.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your incident response policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SEC.INCIDENT_REPORTING — Cyber incident reporting procedures — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 28 —: “Cybersecurity incident reporting procedures”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “incident-reporting duty”
- **Applies when:** yes
- **Passes when:** `vault.ng_incident_reporting.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Cyber incident reporting procedures · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your incident reporting procedures on file**
> You haven't added your incident reporting procedures to your documents yet.
> *Why it matters:* There's a duty to report incidents to the national CERT.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your incident reporting procedures to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SEC.RISK_ASSESSMENT — Cybersecurity risk assessment and audit records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 28 —: “Cybersecurity risk assessment; information security audit documentation; vulnerability management policy”
- **Applies when:** yes
- **Passes when:** `vault.ng_cyber_risk.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Cybersecurity risk assessment and audit records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your cybersecurity risk assessment on file**
> You haven't added your cybersecurity risk assessment to your documents yet.
> *Why it matters:* It shows you know where your weak spots are.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your cybersecurity risk assessment to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SEC.PEN_TESTS — Penetration test records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 28 —: “Penetration testing documentation”
- **Applies when:** yes
- **Passes when:** `vault.ng_pen_tests.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Penetration test records · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your penetration test records on file**
> You haven't added your penetration test records to your documents yet.
> *Why it matters:* Investors and enterprise customers expect to see these.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your penetration test records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SEC.INCIDENT_REGISTER — Security incident register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 28 —: “Security incident register”
- **Applies when:** yes
- **Passes when:** `vault.ng_incident_register.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Security incident register · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your security incident register on file**
> You haven't added your security incident register to your documents yet.
> *Why it matters:* A simple log of what happened and what you did about it.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your security incident register to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.SEC.CONTINUITY — Business continuity and disaster recovery plans

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | security | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “Business Continuity Plan; Disaster Recovery Plan”
- **Applies when:** yes
- **Passes when:** `vault.ng_continuity.present` is yes
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

### NG.SEC.CYBERCRIMES_LEVY — Cybercrimes Act levy — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | security | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 28 —: “Cybercrimes Act levy compliance”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, 6. Thresholds: “the schedule of businesses subject to the levy”
- **Applies when:** `derived.sector.ng_levy` is yes
- **Passes when:** `attest.ng_cybercrimes_levy` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation; Remittance evidence · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s Cybercrimes Act levy position**
> We don't have your confirmation on the levy, and your sector may be named in the Act's schedule.
> *Why it matters:* Businesses named in the schedule remit a levy.
> *If left:* It tends to come up with your bank or partners.
> *What to do:* Check whether it applies with your accountant, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (11)

### NG.CONSUMER.COMPLIANCE — Consumer protection records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | FCCPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 14 —: “Consumer protection compliance documentation”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 14 —: “Product and service disclosure documentation”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `vault.ng_consumer_records.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Consumer protection and product disclosure records · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your consumer protection records on file**
> You haven't added your consumer protection records to your documents yet.
> *Why it matters:* If you sell to consumers, you should be able to show what you told them.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your consumer protection records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CONSUMER.COMPLAINTS — Consumer complaints policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_terms | tier 1, official source, read live | S3 revenue, pre-raise | FCCPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 14 —: “Consumer complaints handling policy”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** any of: (`web.policy.complaints_policy_found` is yes) or (`attest.ng_complaints_policy` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published policy; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a complaints policy for {company}**
> We couldn't find a complaints policy on your website.
> *Why it matters:* Consumers need to know how to complain.
> *If left:* Without one, complaints tend to go straight to the regulator.
> *What to do:* Publish the policy and link it from your site footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.CONSUMER.REFUNDS — Refund and cancellation policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_terms | tier 1, official source, read live | S3 revenue, pre-raise | FCCPC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 14 —: “Refund and cancellation policy”
- **Applies when:** `derived.consumer` is yes
- **Passes when:** `web.policy.refund_policy_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published policy · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find a refund and cancellation policy for {company}**
> We couldn't find a refund and cancellation policy on your website.
> *Why it matters:* Consumers need to know how to get their money back.
> *If left:* Disputes get harder to settle without one.
> *What to do:* Publish the policy and link it from your site footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.COM.SAAS — SaaS agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | contracts | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “SaaS Agreement”
- **Applies when:** `derived.takes_payments` is yes
- **Passes when:** `vault.ng_saas.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** SaaS agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your saaS agreement on file**
> You haven't added your saaS agreement to your documents yet.
> *Why it matters:* It is the contract your customers sign, so investors read it.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your saaS agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.COM.API_LICENCE — API licence agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | terms | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “API Licence Agreement”
- **Applies when:** `derived.has_api` is yes
- **Passes when:** `vault.ng_api_licence.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** API licence agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your API licence agreement on file**
> You haven't added your API licence agreement to your documents yet.
> *Why it matters:* If others build on your API, this sets the rules.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your API licence agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EMP.CONTRACTOR_AGREEMENTS — Contractor agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Contractor Agreement”
- **Applies when:** `derived.contractors` is yes
- **Passes when:** `vault.ng_contractor_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Contractor agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your contractor agreements on file**
> You haven't added your contractor agreements to your documents yet.
> *Why it matters:* Each should cover classification, IP and payment terms.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your contractor agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EMP.AGREEMENTS — Employment agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | employment_contracts | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Employment Agreement”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ng_employment_agreements.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employment agreements · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employment agreements on file**
> You haven't added your employment agreements to your documents yet.
> *Why it matters:* Each employee should have one, with an IP clause.
> *If left:* It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.
> *What to do:* Add your employment agreements to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EMP.HANDBOOK — Staff handbook

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | employment_contracts | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 26 —: “Staff handbook”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ng_handbook.present` is yes
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

### NG.COM.TERMS — Terms of service

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 4 Commercial | terms | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “Terms of Service”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `web.policy.terms_found` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Published terms · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't find terms of service on {company}'s website**
> We couldn't find published terms of service.
> *Why it matters:* Your terms set the limits of what you owe your customers.
> *If left:* Customers and investors will ask for them, and it's public, so it's easy to spot.
> *What to do:* Publish your terms and link them from your site footer.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.COM.EULA — End user licence agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | terms | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “End User Licence Agreement”
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

### NG.COM.ACCEPTABLE_USE — Acceptable use policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | terms | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “Acceptable Use Policy”
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

## Layer 5: Fundraising (4)

### NG.FOREIGN.CCI — Certificate of Capital Importation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | foreign_investment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Central Bank of Nigeria |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 4 —: “Evidence of foreign investment; Certificate of Capital Importation”
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 6 —: “Certificate of Capital Importation”
- **Applies when:** `derived.foreign_any` is yes
- **Passes when:** `vault.ng_cci.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Bank-issued Certificate of Capital Importation · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a Certificate of Capital Importation for {company}**
> You told us you have foreign investors or directors, and we don't have a Certificate of Capital Importation.
> *Why it matters:* It is the bank-issued record that foreign money came into Nigeria.
> *If left:* Foreign investors will ask for it. It's hard to obtain long after the money came in.
> *What to do:* Ask the bank that received the funds to issue it, then upload it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EQUITY.SHAREHOLDERS_AGREEMENT — Shareholders' agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Shareholders' Agreement”
- **Applies when:** yes
- **Passes when:** `vault.ng_shareholders_agreement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Shareholders' agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your shareholders' agreement on file**
> You haven't added your shareholders' agreement to your documents yet.
> *Why it matters:* It sets out what happens when a shareholder leaves or wants to sell.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your shareholders' agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EQUITY.VESTING — Founders' vesting agreement

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | founder_equity | tier 5, the company tells us | S1 pre-incorporation | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 25 —: “Founders' Vesting Agreement”
- **Applies when:** yes
- **Passes when:** `vault.ng_vesting.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Founders' vesting agreement · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your founders' vesting agreement on file**
> You haven't added your founders' vesting agreement to your documents yet.
> *Why it matters:* Investors want to know a founder who leaves early does not keep all their shares.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your founders' vesting agreement to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.EQUITY.ALLOTMENTS — Share allotment records

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | cap_table | tier 2, licensed vendor | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 26 —: “Share allotment documentation”
- **Applies when:** yes
- **Passes when:** `vault.ng_allotments.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Share allotment records · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your share allotment records on file**
> You haven't added your share allotment records to your documents yet.
> *Why it matters:* These should match what the CAC shows, and investors will compare the two.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add your share allotment records to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (4)

### NG.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | Nigeria Data Protection Commission |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 7 —: “| DPIA |”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.ng_dpia.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data protection impact assessment · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data protection impact assessment on file**
> You haven't added your data protection impact assessment to your documents yet.
> *Why it matters:* High-risk processing, AI and cross-border transfers call for this in writing.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your data protection impact assessment to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.AI.USE_POLICY — AI use policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “AI Use Policy (internal)”
- **Applies when:** `derived.ai_or_staff_ai` is yes
- **Passes when:** `vault.ng_ai_use_policy.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_use_policy` (counted once per company)
- **Evidence:** AI use policy · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your AI use policy on file**
> You haven't added your AI use policy to your documents yet.
> *Why it matters:* It tells your team what they can and cannot put into AI tools.
> *If left:* Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.
> *What to do:* Add your AI use policy to your documents. If you don't have one yet, put one in place and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NG.AI.GOVERNANCE — AI governance policy

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 5, the company tells us | S5 post-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “AI Governance Policy”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.ng_ai_governance.present` is yes
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

### NG.AI.TRANSPARENCY — AI transparency

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-nigeria-rule-pack-map.md`, Section 27 —: “AI Transparency and Disclosure Documentation”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.ng_ai_transparency.present` is yes)
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

## Documents this pack asks for (89)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `ng_name_reservation` | Name reservation approval | Before you incorporate, this shows the name you want is held for you. | tier 5 | no | NG.CORP.NAME_RESERVATION |
| `ng_certificate_of_incorporation` | Certificate of Incorporation | It's the document that created your company. If our data provider can't find you, it settles the question. | tier 4 | no | NG.CORP.CAC_REGISTRATION |
| `ng_memart` | Memorandum and Articles (MEMART) | These are the rules for how your company is run. A certified copy can be ordered through an accredited agent. | tier 4 | no | NG.CORP.MEMART |
| `ng_company_secretary` | Company secretary details | Small companies are exempt, but others need to appoint one. | tier 5 | no | NG.CORP.SECRETARY |
| `ng_certified_docs` | Certified incorporation documents | Banks and investors often ask for certified copies rather than plain ones. | tier 4 | no | NG.CORP.CERTIFIED_DOCS |
| `ng_statutory_registers` | Statutory registers | Every company keeps these. They are the record of who owns and runs it. | tier 5 | no | NG.CORP.STATUTORY_REGISTERS |
| `ng_share_certificates` | Share certificates | They are what shareholders hold to show what they own. | tier 5 | no | NG.CORP.SHARE_CERTIFICATES |
| `ng_resolutions` | Board and shareholder resolutions | These are the record of the big decisions your company has made. | tier 5 | no | NG.CORP.RESOLUTIONS |
| `ng_cac_status_report` | CAC status report | "Active" doesn't always mean up to date. Only a status report confirms your annual returns are filed. | tier 4 | no | NG.CORP.ANNUAL_RETURNS |
| `ng_tin_evidence` | TIN evidence | If our provider has no record, this shows your tax number. | tier 4 | no | NG.TAX.TIN |
| `ng_taxpro` | TaxPro Max registration evidence | A TIN alone does not mean the tax account is active. | tier 4 | no | NG.TAX.TAXPRO_ACTIVATION |
| `ng_cit` | Company Income Tax registration | Small companies may have reliefs, but registration is still expected. | tier 4 | no | NG.TAX.CIT |
| `ng_vat` | VAT registration | A registration threshold applies under the 2025 tax acts. | tier 4 | no | NG.TAX.VAT |
| `ng_paye` | State PAYE registration | Employers register with the state where staff work. | tier 4 | no | NG.TAX.PAYE |
| `ng_paye_returns` | PAYE returns and remittance receipts | These show you have paid over what you deducted from staff. | tier 5 | no | NG.TAX.PAYE_RETURNS |
| `ng_tcc` | Tax Clearance Certificate | Clients, banks and investors often ask for a current one. | tier 4 | yes | NG.TAX.CLEARANCE |
| `ng_tax_returns` | Tax returns and payment receipts | Investors check these. They show you have filed each year. | tier 5 | no | NG.TAX.RETURNS |
| `ng_nipc` | NIPC certificate | Foreign shareholders usually mean registering with the NIPC. | tier 4 | no | NG.FOREIGN.NIPC |
| `ng_cci` | Certificate of Capital Importation | Your bank issues this when foreign investment comes in. It is the record of that money. | tier 4 | no | NG.FOREIGN.CCI |
| `ng_expatriate_quota` | Expatriate Quota approval | You need this to employ expatriate staff. | tier 4 | no | NG.FOREIGN.EXPATRIATE_QUOTA |
| `ng_business_permit` | Business Permit | Foreign-owned companies need this from the Ministry of Interior. | tier 4 | no | NG.FOREIGN.BUSINESS_PERMIT |
| `ng_cbn_licence` | CBN licence letter | Must be held before go-live. There is no single "fintech licence": it depends on what you do. | tier 4 | no | NG.FIN.CBN_LICENCE |
| `ng_licensed_partner_agreement` | Agreement with your licensed payments partner | If a licensed partner moves the money, this shows you are covered. You told us about it, and we need to see it. | tier 5 | no | NG.FIN.CBN_LICENCE |
| `ng_bank_licence` | Microfinance or Payment Service Bank licence | Only applies if the company itself takes deposits or operates as a bank. | tier 4 | no | NG.FIN.BANKING_LICENCE |
| `ng_cbn_compliance` | CBN compliance records | Licensed firms have to keep these up to date. | tier 5 | no | NG.FIN.CBN_COMPLIANCE |
| `ng_ndpc_certificate` | NDPC registration certificate | If you are newly registered and not on the list yet, your certificate shows it. | tier 4 | no | NG.DP.DCPMI_REGISTRATION |
| `ng_dpia` | Data protection impact assessment | High-risk processing, AI and cross-border transfers call for this in writing. | tier 5 | no | NG.AI.DPIA |
| `ng_car_receipt` | Audit return filing receipt | The NDPC's published list of audited firms was empty when we checked, so your receipt is the proof. | tier 4 | no | NG.DP.AUDIT_RETURN |
| `ng_dpco` | DPCO engagement letter | Give us the name and we can check it against the licensed list. | tier 5 | no | NG.DP.DPCO |
| `ng_dpa` | Data processing agreements | If vendors handle personal data for you, this agreement sets the rules. | tier 5 | no | NG.DP.PROCESSING_AGREEMENT |
| `ng_ropa` | Records of processing activities | It is the list of what personal data you hold and why. | tier 5 | no | NG.DP.ROPA |
| `ng_breach_policy` | Data breach response policy and records | You need to know who does what before something goes wrong. | tier 5 | no | NG.DP.BREACH |
| `ng_transfers` | Cross-border data transfer records | If your data is hosted outside Nigeria, you need a basis for the transfer. | tier 5 | no | NG.DP.TRANSFERS |
| `ng_dp_training` | Data protection training records | It shows your team knows what to do. | tier 5 | no | NG.DP.TRAINING |
| `ng_nitda_provider` | NITDA registration | You need this to supply IT services to government bodies. | tier 4 | no | NG.SECTOR.NITDA_PROVIDER |
| `ng_nitda_code` | NITDA Code of Practice records | Platforms with user content have duties under the Code. | tier 5 | no | NG.SECTOR.NITDA_CODE |
| `ng_copyright_records` | Copyright ownership records | Copyright arises automatically, so records of who made what are your proof. | tier 5 | no | NG.IP.COPYRIGHT_RECORDS |
| `ng_founder_ip_assignment` | Founders' IP assignments | This is what makes the company the owner of what founders built, including before incorporation. | tier 5 | no | NG.IP.FOUNDER_ASSIGNMENT |
| `ng_team_ip_assignment` | IP assignments from employees and contractors | Everyone who builds your product should have signed it over to the company. It can be a clause in their contract. | tier 5 | no | NG.IP.TEAM_ASSIGNMENT |
| `ng_trademark_search` | Trade mark search report | An accredited agent can show whether someone already has a mark close to yours. | tier 5 | no | NG.IP.TRADEMARK_SEARCH |
| `ng_trademark` | Trade mark acknowledgement or certificate | Nigeria has no online trade mark search we can use, so we rely on your document. An accredited agent can confirm it at the registry. | tier 4 | no | NG.IP.TRADEMARK |
| `ng_trademark_licence` | Trade mark licences | If others use your brand, or you use theirs, there should be a licence. | tier 5 | no | NG.IP.TRADEMARK_LICENCE |
| `ng_foreign_tech_agreements` | Technology transfer and foreign services agreements | If you pay a foreign party for technology, these have to be registered with NOTAP. | tier 5 | no | NG.IP.FOREIGN_TECH_AGREEMENTS |
| `ng_notap` | NOTAP certificate | NOTAP has no public register, so your certificate is the proof. Register within 30 days of the agreement. | tier 4 | no | NG.IP.NOTAP |
| `ng_ncc_licence` | NCC licence | Telecoms, internet and value-added services need this. | tier 4 | no | NG.SECTOR.NCC_LICENCE |
| `ng_ncc_approvals` | NCC approvals | Only applies if you share infrastructure or use spectrum. | tier 4 | no | NG.SECTOR.NCC_APPROVALS |
| `ng_sec_digital_assets` | SEC digital asset licence | Crypto businesses need this. The SEC publishes registered operators. | tier 4 | no | NG.SECTOR.SEC_DIGITAL_ASSETS |
| `ng_sec_investment` | SEC registration | Investment and crowdfunding businesses need this. The SEC publishes registered operators. | tier 4 | no | NG.SECTOR.SEC_INVESTMENT |
| `ng_fccpc` | FCCPC lending approval | Digital lenders need this before they launch. The FCCPC publishes who is approved, on a watch list or delisted. | tier 4 | no | NG.SECTOR.FCCPC_LENDING |
| `ng_consumer_records` | Consumer protection and product disclosure records | If you sell to consumers, you should be able to show what you told them. | tier 5 | no | NG.CONSUMER.COMPLIANCE |
| `ng_naicom` | NAICOM licence | Selling or arranging insurance needs this. | tier 4 | no | NG.SECTOR.NAICOM_LICENCE |
| `ng_insurtech_approval` | Insurtech and partnership approval | These show your insurance arrangements have been approved. | tier 4 | no | NG.SECTOR.INSURTECH_APPROVAL |
| `ng_nafdac_product` | NAFDAC product registration | Regulated health products need this. | tier 4 | no | NG.HEALTH.NAFDAC_PRODUCT |
| `ng_nafdac_establishment` | NAFDAC establishment registration | Health businesses dealing in regulated products need this. | tier 4 | no | NG.HEALTH.NAFDAC_ESTABLISHMENT |
| `ng_device_approval` | Software or medical device approval | Software that works as a medical device needs approval. | tier 4 | no | NG.HEALTH.DEVICE_APPROVAL |
| `ng_mdcn` | MDCN approval | Clinical services need this. | tier 4 | no | NG.HEALTH.MDCN |
| `ng_nhia` | NHIA approval | Health insurance businesses need this. | tier 4 | no | NG.HEALTH.NHIA |
| `ng_health_facility` | Health facility registration | Only applies if you run a health facility. | tier 4 | no | NG.HEALTH.FACILITY |
| `ng_nsitf` | NSITF compliance certificate | From your first employee, you register for the Employee Compensation Scheme. | tier 4 | yes | NG.EMP.NSITF |
| `ng_pencom` | Pension Clearance Certificate | A headcount threshold applies, and this certificate is the usual proof. | tier 4 | yes | NG.EMP.PENCOM |
| `ng_itf` | ITF compliance certificate | A headcount or turnover threshold applies. | tier 4 | yes | NG.EMP.ITF |
| `ng_nhf` | NHF compliance certificate | Employers register for the National Housing Fund. | tier 4 | yes | NG.EMP.NHF |
| `ng_founders_agreement` | Founders' agreement | It settles who owns what and what happens if a founder leaves. | tier 5 | no | NG.CORP.FOUNDERS_AGREEMENT |
| `ng_shareholders_agreement` | Shareholders' agreement | It sets out what happens when a shareholder leaves or wants to sell. | tier 5 | no | NG.EQUITY.SHAREHOLDERS_AGREEMENT |
| `ng_vesting` | Founders' vesting agreement | Investors want to know a founder who leaves early does not keep all their shares. | tier 5 | no | NG.EQUITY.VESTING |
| `ng_allotments` | Share allotment records | These should match what the CAC shows, and investors will compare the two. | tier 5 | no | NG.EQUITY.ALLOTMENTS |
| `ng_software_licence` | Software licence agreements | Investors want to see what you license in and out. | tier 5 | no | NG.IP.SOFTWARE_LICENCE |
| `ng_source_code_licence` | Source code licence agreement | Enterprise customers sometimes need rights to your source code. | tier 5 | no | NG.IP.SOURCE_CODE_LICENCE |
| `ng_escrow` | Source code escrow agreement | Some enterprise customers ask for this. | tier 5 | no | NG.IP.ESCROW |
| `ng_nda` | NDA template | You need one before you share anything sensitive with partners, investors or hires. | tier 5 | no | NG.IP.NDA |
| `ng_saas` | SaaS agreement | It is the contract your customers sign, so investors read it. | tier 5 | no | NG.COM.SAAS |
| `ng_api_licence` | API licence agreement | If others build on your API, this sets the rules. | tier 5 | no | NG.COM.API_LICENCE |
| `ng_contractor_agreements` | Contractor agreements | Each should cover classification, IP and payment terms. | tier 5 | no | NG.EMP.CONTRACTOR_AGREEMENTS |
| `ng_employment_agreements` | Employment agreements | Each employee should have one, with an IP clause. | tier 5 | no | NG.EMP.AGREEMENTS |
| `ng_handbook` | Staff handbook | As you grow, it keeps your policies in one place. | tier 5 | no | NG.EMP.HANDBOOK |
| `ng_governance_policy` | Corporate governance policy | As you scale, this shows how decisions get made. | tier 5 | no | NG.CORP.GOVERNANCE_POLICY |
| `ng_delegation` | Delegation of authority | It says who can sign and approve what. | tier 5 | no | NG.CORP.DELEGATION |
| `ng_conflicts` | Conflict of interest policy | Investors ask for this when they raise. | tier 5 | no | NG.CORP.CONFLICTS |
| `ng_director_service` | Directors' service agreements | As the board grows, these set out what each director is there to do. | tier 5 | no | NG.CORP.DIRECTOR_SERVICE |
| `ng_ai_use_policy` | AI use policy | It tells your team what they can and cannot put into AI tools. | tier 5 | no | NG.AI.USE_POLICY |
| `ng_ai_governance` | AI governance policy | As you scale, this shows who is responsible for your AI decisions. | tier 5 | no | NG.AI.GOVERNANCE |
| `ng_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | NG.AI.TRANSPARENCY |
| `ng_security_policies` | Information security and cybersecurity policies | Enterprise customers and investors expect these in writing. | tier 5 | no | NG.SEC.POLICIES |
| `ng_incident_response` | Incident response policy | You need to know who does what before something goes wrong. | tier 5 | no | NG.SEC.INCIDENT_RESPONSE |
| `ng_incident_reporting` | Cyber incident reporting procedures | There's a duty to report incidents to the national CERT. | tier 5 | no | NG.SEC.INCIDENT_REPORTING |
| `ng_cyber_risk` | Cybersecurity risk assessment and audit records | It shows you know where your weak spots are. | tier 5 | no | NG.SEC.RISK_ASSESSMENT |
| `ng_pen_tests` | Penetration test records | Investors and enterprise customers expect to see these. | tier 5 | no | NG.SEC.PEN_TESTS |
| `ng_incident_register` | Security incident register | A simple log of what happened and what you did about it. | tier 5 | no | NG.SEC.INCIDENT_REGISTER |
| `ng_continuity` | Business continuity and disaster recovery plans | Larger customers ask what happens if your systems go down. | tier 5 | no | NG.SEC.CONTINUITY |
