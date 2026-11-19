# Review: New Zealand (NZ) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** NZ, version 0.1.0, 11 rules (2 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `9f38d1d90741184f42e9b7a6df4146094d7396b1b30c964cf9ff91a69e0b3af1`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (5)

### NZ.CORP.STATUS — Company registered with the Companies Office

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | New Zealand Companies Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.1 Layer 1: “NZ-1.01”
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 5. Core set: “Registered, a limited company, not removed or in liquidation”
- **Applies when:** yes
- **Passes when:** `registry.nz.companies.status_code` is “50”
- **A problem (defect) when:** all of: (`registry.nz.companies.identified` is yes) and (`registry.nz.companies.status_code` is “80”)
- **“To check” when:** all of: (`registry.nz.companies.identified` is yes) and (not (`registry.nz.companies.status_code` is one of “50”, “80”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies Office register · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} shows as removed from the Companies Register**
> We read {company}'s entry in the New Zealand Companies Office register, and it shows the company as removed.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* A removed company can lose its assets and can no longer trade in its own name.
> *What to do:* Check the entry on the Companies Office website today and get qualified advice on restoring the company.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NZ.CORP.ENTITY_TYPE — Limited company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | New Zealand Companies Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.1 Layer 1: “NZ-1.02”
- **Applies when:** yes
- **Passes when:** `registry.nz.companies.entity_type_code` is “LTD”
- **“To check” when:** `registry.nz.companies.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies Office register · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We couldn't confirm {company} is a limited company**
> The Companies Office register doesn't show {company} as a New Zealand limited company.
> *Why it matters:* The New Zealand checks here are written for limited companies.
> *If left:* Some of the checks we show may not fit your company.
> *What to do:* Check the entity type on the register. A person will look at which checks apply.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NZ.CORP.RESIDENT_DIRECTOR — A director living in New Zealand, or in Australia

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | New Zealand Companies Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.1 Layer 1: “NZ-1.05”
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 5. Core set: “A director living in New Zealand or Australia”
- **Applies when:** yes
- **Passes when:** `attest.nz_resident_director` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Companies Office register · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has a director living in New Zealand**
> We don't have your confirmation that at least one director lives in New Zealand, or lives in Australia and is a director of an Australian company. We don't keep people's details, so we can't check.
> *Why it matters:* Every New Zealand company needs such a director. More than 183 days in New Zealand in 12 months is generally treated as living there.
> *If left:* A sole director who meets the rule cannot leave until a new one who meets it is appointed.
> *What to do:* Check where your directors live, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NZ.CORP.ANNUAL_RETURN — Annual return

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 1, official source, read live | S3 revenue, pre-raise | New Zealand Companies Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.1 Layer 1: “NZ-1.08”
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 5. Core set: “Annual return filed in its filing month”
- **Applies when:** yes
- **Passes when:** `derived.nz.annual_return_overdue` is no
- **A problem (defect) when:** `derived.nz.annual_return_overdue` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies Office register · **Fix type:** file · **Penalty if left:** moderate

**What the company reads when it fails:**

> **{company}'s annual return looks overdue**
> The Companies Office register shows no annual return filed since {company}'s last filing month.
> *Why it matters:* A New Zealand company files an annual return each year during its filing month, starting the calendar year after it was incorporated.
> *If left:* The Registrar can remove a company that does not file.
> *What to do:* File the annual return on the Companies Office website now. If you were given more time, a person will check.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NZ.CORP.SHARE_REGISTER — Share register kept in New Zealand

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.1 Layer 1: “NZ-1.09”
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 5. Core set: “Share register kept and share issues notified”
- **Applies when:** yes
- **Passes when:** `attest.nz_share_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its share register**
> We don't have your confirmation that the company keeps a share register, with every share issue recorded.
> *Why it matters:* A New Zealand company keeps its share register in New Zealand, at its registered office unless its constitution allows otherwise.
> *If left:* It is the record of who owns the company. Investors check it against every share issue.
> *What to do:* Bring the share register up to date, keep it at the registered office, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (4)

### NZ.DP.PRIVACY_OFFICER — Privacy officer — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Privacy Commissioner |

- **Law cited:** Privacy Act 2020
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.3 Layer 3: “NZ-3.02”
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 5. Core set: “Privacy officer and privacy statement”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.nz_privacy_officer` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Contact details on your website · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has a privacy officer**
> We don't have your confirmation that someone is the company's privacy officer.
> *Why it matters:* New Zealand organisations that handle personal information have a privacy officer who looks after it and answers requests.
> *If left:* People who ask about their information need someone to answer them.
> *What to do:* Name a privacy officer, publish how to reach them, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NZ.DP.INDIRECT_COLLECTION — Telling people when you collect their information from someone else

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Privacy Commissioner |

- **Law cited:** Privacy Act 2020, IPP 3A
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.3 Layer 3: “NZ-3.04”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.nz_ipp3a` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-05-01 to no end date
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} tells people about information it gets from others**
> We don't have your confirmation that people are told when the company collects their personal information from someone else.
> *Why it matters:* From 1 May 2026, when you collect personal information from someone other than the person it is about, you tell that person who you are and how to reach you, among other things, unless an exception applies.
> *If left:* It applies to information collected from 1 May 2026, so new data sources need it now.
> *What to do:* Check where you get personal information from other sources, add a notice where it is needed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NZ.DP.BREACH — Privacy breach plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | Office of the Privacy Commissioner |

- **Law cited:** Privacy Act 2020
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.3 Layer 3: “NZ-3.05”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.nz_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Privacy breach plan · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s privacy breach plan**
> You haven't added a plan for what happens when personal information is lost or exposed.
> *Why it matters:* A breach likely to cause serious harm is reported to the Privacy Commissioner, and the people affected, as soon as practicable. The Commissioner expects it within 72 hours.
> *If left:* Not reporting without a good reason is an offence.
> *What to do:* Write a short plan saying who decides, who reports and how fast, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NZ.TAX.GST — GST registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S3 revenue, pre-raise | Inland Revenue |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.3 Layer 3: “NZ-3.07”
- **Applies when:** yes
- **Passes when:** any of: (`vault.nz_gst_registration.present` is yes) or (`attest.nz_gst_below_threshold` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** threshold_nzd = 60000; days_to_register = 21
- **Abroad:** never follows the company into another country
- **Evidence:** Inland Revenue GST registration; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s GST registration**
> You haven't added the Inland Revenue GST registration, or confirmed the company is below the threshold.
> *Why it matters:* A business registers for GST within 21 days once its turnover was over NZ$60,000 in the last 12 months, or is expected to go over it in the next 12.
> *If left:* Registering late can mean paying GST you never charged your customers.
> *What to do:* If you are registered, add the confirmation. If you are below the threshold, confirm that here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (2)

### NZ.EQUITY.SHARE_ISSUE_NOTICE — Share issues notified to the Companies Office

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | shareholders | tier 4, a document the company uploads | S4 raising | New Zealand Companies Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.5 Layer 5: “NZ-5.01”
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 5. Core set: “Share register kept and share issues notified”
- **Applies when:** `derived.invested` is yes
- **Passes when:** any of: (`vault.nz_share_issue_notice.present` is yes) or (`attest.nz_share_issues_notified` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Companies Office confirmation; Your confirmation · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see that {company}'s share issues were notified**
> You haven't added the Companies Office confirmation for your share issue, or confirmed it was notified.
> *Why it matters:* Each share issue is notified to the Companies Office within 10 working days, new shareholders are registered at the same time, and the share register is updated.
> *If left:* Investors check the public register matches the shares they paid for.
> *What to do:* Notify the issue on the Companies Office website if you haven't, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### NZ.FUND.OFFER_EXCLUSION — Exclusion relied on when offering shares — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | Financial Markets Authority |

- **Law cited:** Financial Markets Conduct Act 2013, Schedule 1
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 3.5 Layer 5: “NZ-5.02”
- **Encoded from:** `docs/knowledge/vero-scan-new-zealand-rule-pack-map.md`, 7. Sources: “| NZ-S20 |”
- **Applies when:** `derived.invested` is yes
- **Passes when:** any of: (`attest.nz_small_offers` is yes) or (`vault.nz_fma_notice.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Notice to the FMA · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't told us which exclusion {company} relied on to offer shares**
> We don't have your confirmation of the exclusion that let the company offer shares without a disclosure document.
> *Why it matters:* Offering shares needs a disclosure document unless an exclusion applies, such as small personal offers, which also need a warning to investors and a notice to the FMA.
> *If left:* Investors and their advisers will ask which exclusion each round relied on.
> *What to do:* Write down which exclusion each round used, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (4)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `nz_breach_plan` | Privacy breach plan | A serious breach has to be reported to the Privacy Commissioner as soon as practicable, so you need to know who does what. | tier 5 | no | NZ.DP.BREACH |
| `nz_gst_registration` | GST registration (Inland Revenue) | It shows the company is registered for GST, with its GST number. | tier 4 | no | NZ.TAX.GST |
| `nz_share_issue_notice` | Companies Office confirmation of a share issue | It shows each share issue was notified to the Companies Office. | tier 4 | no | NZ.EQUITY.SHARE_ISSUE_NOTICE |
| `nz_fma_notice` | Notice to the FMA of a small offer | It shows the FMA was told about an offer made under the small offers exclusion. | tier 4 | no | NZ.FUND.OFFER_EXCLUSION |
