# Review: Canada (federal) (CA) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** CA, version 0.1.0, 12 rules (3 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `a818d6319813a74b6adf7489d1ade0cbec20211c36932febaadde114de5eae98`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (8)

### CA.CORP.STATUS — Federal corporation active

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Corporations Canada |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.1 Layer 1: “CA-1.01”
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 5. Core set: “Active CBCA corporation”
- **Applies when:** yes
- **Passes when:** `registry.ca.corporations.status` is “active”
- **A problem (defect) when:** all of: (`registry.ca.corporations.identified` is yes) and (`registry.ca.corporations.status` includes “dissolved”)
- **“To check” when:** all of: (`registry.ca.corporations.identified` is yes) and (not (any of: (`registry.ca.corporations.status` is “active”) or (`registry.ca.corporations.status` includes “dissolved”)))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Corporations Canada's federal register · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} shows as dissolved in Corporations Canada's register**
> We read {company}'s record from Corporations Canada, and it shows the corporation as dissolved.
> *Why it matters:* Anyone who looks the corporation up, banks and investors included, sees this status first.
> *If left:* A dissolved corporation can lose its property and can no longer carry on business.
> *What to do:* Check the record on the Corporations Canada website today and get qualified advice on reviving the corporation.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CA.CORP.ACT — Incorporated under the CBCA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Corporations Canada |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.1 Layer 1: “CA-1.02”
- **Applies when:** yes
- **Passes when:** any of: (`registry.ca.corporations.act` is “Canada Business Corporations Act”) or (`registry.ca.corporations.act` is “CBCA”)
- **“To check” when:** `registry.ca.corporations.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Corporations Canada's federal register · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We couldn't confirm {company} is a CBCA corporation**
> Corporations Canada's record doesn't show {company} under the Canada Business Corporations Act.
> *Why it matters:* The Canadian checks here are written for business corporations under that Act.
> *If left:* Some of the checks we show may not fit your corporation.
> *What to do:* Check the Act on your certificate of incorporation. A person will look at which checks apply.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CA.CORP.BOARD_SIZE — Number of directors within the articles — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Corporations Canada |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.1 Layer 1: “CA-1.03”
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 5. Core set: “Board size within the articles”
- **Applies when:** yes
- **Passes when:** all of: (`registry.ca.corporations.directors_count` is at least `registry.ca.corporations.directors_minimum`) and (`registry.ca.corporations.directors_count` is at most `registry.ca.corporations.directors_maximum`)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Corporations Canada's federal register · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s number of directors doesn't match its articles**
> Corporations Canada's record shows a number of directors outside the minimum or maximum set in {company}'s articles.
> *Why it matters:* The articles set how many directors the corporation has. The board has to stay within that range.
> *If left:* Investors check the board matches the articles before they sign.
> *What to do:* Appoint or remove directors so the board is within the range, and notify Corporations Canada.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CA.CORP.RESIDENT_DIRECTORS — Resident Canadian directors

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | Corporations Canada |

- **Law cited:** Canada Business Corporations Act, s 105(3)
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.1 Layer 1: “CA-1.04”
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 5. Core set: “resident Canadian directors”
- **Applies when:** yes
- **Passes when:** `attest.ca_resident_directors` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has enough resident Canadian directors**
> We don't have your confirmation that at least a quarter of the directors are resident Canadians. We don't keep people's details, so we can't check.
> *Why it matters:* At least 25% of the directors of a CBCA corporation must be resident Canadians, or at least one if there are fewer than four. Some sectors need a majority.
> *If left:* A board without enough resident Canadians is not set up the way the Act requires.
> *What to do:* Check where your directors live, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CA.CORP.SIGNIFICANT_CONTROL_REGISTER — Register of individuals with significant control

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | Corporations Canada |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.1 Layer 1: “CA-1.08”
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 5. Core set: “ISC register kept and ISC information filed”
- **Applies when:** yes
- **Passes when:** `attest.ca_isc_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its register of individuals with significant control**
> We don't have your confirmation that the corporation keeps a register of the people with significant control over it. It isn't public, so we can't check.
> *Why it matters:* A CBCA corporation keeps this register, updates it at least once a year, and within 15 days of learning of a change.
> *If left:* Banks and investors ask who really controls a corporation before they work with it.
> *What to do:* Bring the register up to date, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CA.CORP.SIGNIFICANT_CONTROL_FILING — Individuals with significant control filed with Corporations Canada — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Corporations Canada |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.1 Layer 1: “CA-1.09”
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 5. Core set: “ISC register kept and ISC information filed”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ca_isc_filing_confirmation.present` is yes) or (`attest.ca_isc_filed` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2024-01-22 to no end date
- **Evidence:** Corporations Canada filing confirmation; Your confirmation · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see that {company} filed its individuals with significant control**
> You haven't added the confirmation that the corporation filed its significant control information with Corporations Canada.
> *Why it matters:* Since 22 January 2024 this information is filed at incorporation, with every annual return, and after each change in the register.
> *If left:* Corporations Canada can refuse a certificate of compliance, or dissolve a corporation that does not file.
> *What to do:* File it through Corporations Canada Online Filing, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CA.CORP.ANNUAL_RETURN — Annual return

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 1, official source, read live | S3 revenue, pre-raise | Corporations Canada |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.1 Layer 1: “CA-1.10”
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 5. Core set: “Annual return filed within 60 days of the anniversary”
- **Applies when:** yes
- **Passes when:** `derived.ca.annual_return_overdue` is no
- **A problem (defect) when:** `derived.ca.annual_return_overdue` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_anniversary = 60; fee_cad = 12
- **Evidence:** Corporations Canada's federal register · **Fix type:** file · **Penalty if left:** moderate

**What the company reads when it fails:**

> **{company}'s annual return looks overdue**
> Corporations Canada's record shows no annual return for {company}'s latest anniversary, and the 60 days to file it have passed.
> *Why it matters:* A CBCA corporation files an annual return within 60 days after each anniversary of its incorporation. It costs C$12 online.
> *If left:* Corporations Canada dissolves corporations that stop filing, after a final notice.
> *What to do:* File the annual return through Corporations Canada Online Filing now. It is filed together with your significant control information.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CA.CORP.AUDITOR — Auditor, or a resolution not to appoint one

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Canada Business Corporations Act, s 163
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.1 Layer 1: “CA-1.13”
- **Applies when:** yes
- **Passes when:** any of: (`attest.ca_auditor_appointed` is yes) or (`attest.ca_audit_exemption` is yes) or (`vault.ca_audit_exemption_resolution.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Shareholder resolution · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has an auditor, or agreed not to appoint one**
> We don't have your confirmation that the corporation appointed an auditor, or that its shareholders resolved not to.
> *Why it matters:* A corporation that does not offer shares to the public can skip the auditor only if every shareholder agrees, including those without a vote. The decision lasts until the next annual meeting.
> *If left:* Investors and banks ask for audited statements, or proof that every shareholder agreed to skip the audit.
> *What to do:* Confirm your auditor, or add this year's signed shareholder resolution.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (2)

### CA.DP.PRIVACY_LAWS — Which privacy laws apply

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Privacy Commissioner of Canada |

- **Law cited:** Personal Information Protection and Electronic Documents Act
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.3 Layer 3: “CA-3.01”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.ca_privacy_laws` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed which privacy laws apply to {company}**
> We don't have your confirmation of which Canadian privacy laws cover the personal information the corporation handles.
> *Why it matters:* The federal privacy law covers personal information in commercial activity. In Alberta, British Columbia and Quebec a provincial law applies instead within the province, and the federal law still covers dealings across borders.
> *If left:* Each law has its own rules, and you need to know which ones you follow.
> *What to do:* Work out where you collect personal information and which laws apply, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CA.TAX.GST_HST — GST/HST registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S3 revenue, pre-raise | Canada Revenue Agency |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.3 Layer 3: “CA-3.05”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ca_gst_hst_registration.present` is yes) or (`attest.ca_small_supplier` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** small_supplier_cad = 30000; days_to_register = 29
- **Abroad:** never follows the company into another country
- **Evidence:** CRA GST/HST registration; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s GST/HST registration**
> You haven't added the CRA GST/HST registration, or confirmed the corporation is a small supplier.
> *Why it matters:* A business registers within 29 days once its taxable supplies go over C$30,000 in one calendar quarter, or over the last four quarters together.
> *If left:* Registering late can mean paying tax you never charged your customers.
> *What to do:* If you are registered, add the CRA confirmation. If you are a small supplier, confirm that here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (1)

### CA.COM.ANTI_SPAM — Consent and unsubscribe for marketing messages

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | marketing | tier 5, the company tells us | S3 revenue, pre-raise | CRTC |

- **Law cited:** Canada's Anti-Spam Legislation
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.4 Layer 4: “CA-4.01”
- **Applies when:** `derived.sends_marketing` is yes
- **Passes when:** `attest.ca_casl` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s marketing messages meet Canada's anti-spam law**
> We don't have your confirmation that every marketing email and message has consent, names the sender and has a working unsubscribe.
> *Why it matters:* Each commercial electronic message needs consent, clear sender details and a free, easy unsubscribe that works for at least 60 days and is honoured within 10 business days.
> *If left:* People who did not agree to your messages can complain to the CRTC.
> *What to do:* Check how you collect consent and handle unsubscribes, keep records, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (1)

### CA.FUND.PROSPECTUS_EXEMPTION — Exemption relied on when issuing shares — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** National Instrument 45-106
- **Encoded from:** `docs/knowledge/vero-scan-canada-rule-pack-map.md`, 3.5 Layer 5: “CA-5.02”
- **Applies when:** `derived.invested` is yes
- **Passes when:** any of: (`vault.ca_45106f1.present` is yes) or (`attest.ca_prospectus_exemption` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Report of exempt distribution; Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't told us which exemption {company} relied on to issue shares**
> We don't have your confirmation of the prospectus exemption the corporation relied on, or the report filed for it.
> *Why it matters:* Issuing shares needs a prospectus unless an exemption applies, such as the private issuer or accredited investor exemptions. Some need a report filed after the round.
> *If left:* Investors and their advisers will ask which exemption each round relied on.
> *What to do:* Write down the exemption each round used, add any report you filed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (4)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `ca_isc_filing_confirmation` | Corporations Canada confirmation of significant control filing | These filings are not public, so the confirmation is how you show it was made. | tier 4 | no | CA.CORP.SIGNIFICANT_CONTROL_FILING |
| `ca_audit_exemption_resolution` | Shareholder resolution not to appoint an auditor | It shows every shareholder agreed not to appoint an auditor until the next annual meeting. | tier 4 | no | CA.CORP.AUDITOR |
| `ca_gst_hst_registration` | GST/HST registration (CRA) | It shows the corporation is registered for GST/HST, with its account number. | tier 4 | no | CA.TAX.GST_HST |
| `ca_45106f1` | Report of exempt distribution (Form 45-106F1) | Most exemptions need this report filed after the round, in each province where investors are. | tier 4 | no | CA.FUND.PROSPECTUS_EXEMPTION |
