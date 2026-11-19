# Review: Denmark (DK) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** DK, version 0.2.0, 69 rules (3 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `6a1d449830dac3d3edb2d802f3b5279b338254ebb67e1d27ac662d1daeb09aea`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (17)

### DK.CORP.COMPANY_PARTICULARS — Company details on letters, forms and website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive (EU) 2017/1132, Art 26
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Company particulars on letters, order forms and website”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 9 —: “Website and e-mails show name, registered office (hjemsted) and CVR number”
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

### DK.CORP.STATUS — Company status in the Danish company register (CVR)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 1 —: “Registered with Erhvervsstyrelsen within 2 weeks of signing the founding document”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 1 —: “| Company active |”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “In CVR as ApS or A/S, active”
- **Applies when:** yes
- **Passes when:** `registry.dk.cvr.status` is one of “normal”, “aktiv”
- **“To check” when:** `registry.dk.cvr.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** weeks_to_register = 2
- **Evidence:** Danish company register (CVR) record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company} is active in the Danish company register**
> We read {company}'s record in the Danish company register (CVR), and its status is not one we can read as active yet.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* If the company is no longer active, it can have trouble with its bank, its contracts and any fundraising.
> *What to do:* Check the record on datacvr.virk.dk. If the status is wrong, contact Erhvervsstyrelsen; if not, get qualified advice.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.LEGAL_FORM — Company form: ApS or A/S

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 1 —: “Company form is ApS or A/S, and the name says so”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “In CVR as ApS or A/S, active”
- **Applies when:** yes
- **Passes when:** `registry.dk.cvr.legal_form_code` is one of “60”, “80”
- **“To check” when:** `registry.dk.cvr.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Danish company register (CVR) record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} isn't recorded as an ApS or an A/S**
> We read {company}'s record in the Danish company register (CVR), and its company form is not one we read as an ApS or an A/S.
> *Why it matters:* Our Danish checks are written for an anpartsselskab (ApS) or an aktieselskab (A/S), and the name has to show which one it is.
> *If left:* Some results may not fit the company, and some duties may be missing from them.
> *What to do:* Check the company form and name on datacvr.virk.dk. If it is not an ApS or A/S, read these results as a starting point only.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.CHANGES_FILED — Changes registered within 2 weeks

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 1 —: “Registrable changes filed within 2 weeks”
- **Applies when:** yes
- **Passes when:** `attest.dk_changes_filed` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** weeks_to_file = 2
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} registers its changes on time**
> We don't have your confirmation that each change the law asks you to register, such as new management or new articles, went to Erhvervsstyrelsen within 2 weeks of the decision.
> *Why it matters:* Changes that have to be registered are filed within 2 weeks of the decision.
> *If left:* An out-of-date register misleads banks, customers and investors who rely on it.
> *What to do:* Check the register against your decisions since the company was set up, file anything missing, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.ARTICLES — Articles of association (vedtægter)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “Articles (vedtægter) state name, object, capital”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Articles, owner register, significant owners and beneficial owners registered”
- **Applies when:** yes
- **Passes when:** `vault.dk_articles.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Articles of association (vedtægter), current version · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your articles of association on file**
> You haven't added your articles of association to your documents yet.
> *Why it matters:* The articles state the name, object, share capital and share rights, and are part of the signed founding document.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Add the current articles, with every change made since the company was set up.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.SHARE_CAPITAL — Minimum share capital, paid in

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “Share capital at least DKK 20,000 (ApS) or DKK 400,000 (A/S)”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “At least 25% of capital, and at least DKK 20,000, paid in at registration”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Capital at least DKK 20,000 (ApS) or 400,000 (A/S), at least 25% paid”
- **Applies when:** yes
- **Passes when:** any of: (`vault.dk_capital_payment.present` is yes) or (`attest.dk_share_capital` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** aps_minimum_dkk = 20000; as_minimum_dkk = 400000; paid_in_share = 0.25; paid_in_minimum_dkk = 20000
- **Evidence:** Proof the capital was paid in; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see that {company}'s share capital meets the minimum**
> You haven't added proof the share capital was paid in, or confirmed it meets the minimum. CVR's capital figures aren't read yet.
> *Why it matters:* An ApS has at least DKK 20,000 of share capital and an A/S at least DKK 400,000. At least 25% of it, and at least DKK 20,000, is paid in at registration and stays paid.
> *If left:* Capital below the minimum, or not paid in, can stop the company being registered, and banks and investors check it.
> *What to do:* Add proof of payment here, or confirm the capital meets the minimum and is paid in as required.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.OWNER_REGISTER — Owner register (ejerbog)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “Owner register (ejerbog) set up as soon as possible, kept in the EU/EEA”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Articles, owner register, significant owners and beneficial owners registered”
- **Applies when:** yes
- **Passes when:** `attest.dk_owner_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its owner register**
> We don't have your confirmation that the company set up its owner register (ejerbog), keeps it in the EU or EEA, and keeps it up to date.
> *Why it matters:* Every company keeps a register of its shareholders as soon as possible after it is set up. It can be kept in Erhvervsstyrelsen's IT system, and public authorities may ask to see it.
> *If left:* Without it, who owns which shares is hard to prove, and investors check it in due diligence.
> *What to do:* Set up the register with every shareholder and share, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.MAJOR_HOLDINGS — Holders of 5% or more tell the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “Holders of 5% or more notify the company within 2 weeks”
- **Applies when:** yes
- **Passes when:** `attest.dk_holdings_notified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** weeks_to_notify = 2; thresholds_percent = [5,10,15,20,25,50,90,100]; thresholds_fraction = ["1/3","2/3"]
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has the notices from its larger shareholders**
> We don't have your confirmation that each shareholder with 5% or more told the company within 2 weeks, and again at each further threshold.
> *Why it matters:* Shareholders tell the company within 2 weeks when they reach 5%, and when they cross 10, 15, 20, 25, 50, 90 or 100%, or a third or two thirds.
> *If left:* The company relies on these notices to keep its owner records right.
> *What to do:* Check you have a notice for each larger shareholder and each change, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.SIGNIFICANT_OWNERS — Significant owners in the public owner register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “Significant owners (or "none") registered”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Articles, owner register, significant owners and beneficial owners registered”
- **Applies when:** yes
- **Passes when:** `attest.dk_significant_owners_registered` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s significant owners are registered**
> We don't have your confirmation that the company's significant owners, or the fact that it has none, are in Erhvervsstyrelsen's public owner register.
> *Why it matters:* Significant owners are registered when the company is set up, and each change as soon as possible.
> *If left:* Banks and investors read the public owner register, and a gap there raises questions.
> *What to do:* Check the register on datacvr.virk.dk, update it on virk.dk if needed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.UBO — Beneficial owners identified and registered

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “Beneficial owners identified and registered as soon as possible”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “Beneficial-owner evidence kept 5 years”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Articles, owner register, significant owners and beneficial owners registered”
- **Applies when:** yes
- **Passes when:** `attest.dk_beneficial_owners_registered` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** evidence_kept_years = 5
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has registered its beneficial owners**
> We don't have your confirmation that the company identified its beneficial owners, registered them with Erhvervsstyrelsen, and keeps the evidence. The register is not public.
> *Why it matters:* Every company registers its beneficial owners as soon as possible. If none can be identified, the executive managers are registered instead. The evidence is kept for 5 years.
> *If left:* Banks and other businesses that must check their customers ask for it when they onboard you.
> *What to do:* Identify who ultimately owns or controls the company, register them on virk.dk, keep your notes, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.UBO_ANNUAL_CHECK — Yearly review of beneficial owners

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Selskabsloven, §58a(4); Regulation (EU) 2024/1624, Art 63
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 2 —: “Beneficial owners reviewed at least once a year”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 6 —: “Annual check that the information is current (from 10 Jul 2027)”
- **Applies when:** yes
- **Passes when:** any of: (`vault.dk_ubo_review_minutes.present` is yes) or (`attest.eu_ubo_annual_check` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_ubo_annual_check` (counted once per company)
- **Evidence:** Minutes of the annual meeting; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} reviewed its beneficial owners this year**
> We don't have your confirmation that the beneficial owners were reviewed this year and the result presented at the meeting that approved the annual report.
> *Why it matters:* Danish companies review their beneficial-owner information at least once a year, and present the result at the annual general meeting.
> *If left:* Out-of-date details mislead the banks and authorities that rely on them.
> *What to do:* Check the registered details, update any change, record the review in the minutes, and add them here or confirm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.ANNUAL_REPORT — Annual report filed with Erhvervsstyrelsen

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 3 —: “Annual report filed with Erhvervsstyrelsen without undue delay after approval”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Annual report filed within 6 months”
- **Applies when:** yes
- **Passes when:** `vault.dk_annual_report.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** after year end: {"months":6} (reminder only)
- **Numbers for you to confirm:** months_after_year_end = 6; months_after_year_end_class_d = 4
- **Evidence:** Approved annual report, or the CVR filing receipt · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your annual report on file**
> You haven't added your annual report to your documents yet.
> *Why it matters:* The approved annual report reaches Erhvervsstyrelsen within 6 months of the year end, with no extension. Filed reports are not read yet, so we need yours.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* File the approved annual report with Erhvervsstyrelsen and add it, or the filing receipt, here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.GENERAL_MEETING — Annual general meeting minutes

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 3 —: “Ordinary general meeting in time to file the approved report”
- **Applies when:** yes
- **Passes when:** `vault.dk_agm_minutes.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Minutes of the ordinary general meeting · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your annual general meeting minutes on file**
> You haven't added your annual general meeting minutes to your documents yet.
> *Why it matters:* The ordinary general meeting approves the annual report and decides on profit or loss, in time for the report to be filed.
> *If left:* You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.
> *What to do:* Hold the meeting in time to file the report, and add the signed minutes here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.MANAGEMENT — Executive management on record

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 4 —: “A recognised management structure”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 1 —: “Management and auditor registered”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Management registered; an A/S board of at least 3”
- **Applies when:** yes
- **Passes when:** `registry.dk.cvr.executive_members_count` is at least 1
- **“To check” when:** `registry.dk.cvr.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Danish company register (CVR) record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s management in the Danish company register**
> We read {company}'s record in the Danish company register (CVR) and found no member of the executive management (direktion).
> *Why it matters:* Every ApS and A/S has an executive management, alone or with a board, and its members are registered with Erhvervsstyrelsen.
> *If left:* Nobody shows as able to run and sign for the company, which holds up banks and investors.
> *What to do:* Check the record on datacvr.virk.dk, and register the management with Erhvervsstyrelsen if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.AS_BOARD — A/S board of at least 3 members — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | officers | tier 1, official source, read live | S2 incorporated, pre-revenue | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 4 —: “A/S board or supervisory board has at least 3 members”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Management registered; an A/S board of at least 3”
- **Applies when:** the answer to “What kind of company is it?” is one of “as”
- **Passes when:** `registry.dk.cvr.board_members_count` is at least 3
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** min_members = 3
- **Evidence:** Danish company register (CVR) record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see a board of at least 3 for {company} in the Danish company register**
> We read {company}'s record in the Danish company register (CVR) and found fewer than 3 board members.
> *Why it matters:* An A/S has a board, or a supervisory board, of at least 3 members.
> *If left:* Decisions made by a board that is too small can be challenged, and investors check it.
> *What to do:* Check the record on datacvr.virk.dk, and appoint and register the missing members if the board is too small.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.AS_BOARD_INDEPENDENCE — A/S board: most members are not executives

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 4 —: “A/S: majority of the board are not executives; an executive cannot chair”
- **Applies when:** the answer to “What kind of company is it?” is one of “as”
- **Passes when:** `attest.dk_as_board_majority` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s board is mostly people who are not executives**
> We don't have your confirmation that most of the board are not executives, and that the chair is not an executive. The register shows counts, not who holds both roles.
> *Why it matters:* In an A/S with a board and an executive management, most of the board must not be executives, and an executive cannot chair the board.
> *If left:* A board set up the wrong way can have its decisions questioned.
> *What to do:* Check who sits on both bodies, change the board if needed, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CORP.AUDIT — Audit, or a valid audit opt-out

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 4 —: “Audit, unless a valid opt-out”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 1 —: “Management and auditor registered”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Annual report filed within 6 months, with audit or a valid opt-out”
- **Applies when:** yes
- **Passes when:** `vault.dk_audit.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** opt_out_balance_dkk = 4000000; opt_out_revenue_dkk = 8000000; opt_out_staff = 12; opt_out_consecutive_years = 2; no_opt_out_balance_dkk = 50000000
- **Evidence:** Auditor's report, or the opt-out statement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s audit report or audit opt-out on file**
> You haven't added an auditor's report, or the statement in your annual report that the company opted out of audit.
> *Why it matters:* A class B company may opt out of audit if, two years running, it stays under two of these: DKK 4m balance sheet, DKK 8m net revenue, 12 full-time staff. Above DKK 50m balance sheet two years running, it cannot.
> *If left:* An annual report without a required audit is incomplete, and banks and investors ask for it.
> *What to do:* Add the auditor's report, or the page of your annual report with the opt-out statement. If you have an auditor, check they are registered.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (3)

### DK.IP.EMPLOYEE_INVENTIONS — Employee inventions: your right to claim them

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 5 —: “Employee inventions: employer's right to claim”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.dk_employee_ip_clause.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** months_to_claim = 4; months_after_leaving_presumed = 6
- **Evidence:** Employment contract clause on inventions and IP · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your employment contract clause on inventions on file**
> You haven't added your employment contract clause on inventions to your documents yet.
> *Why it matters:* An employee tells you about an invention made in their work without undue delay. You can claim it within 4 months of the notice, and reasonable pay is due to them even if you agreed otherwise.
> *If left:* It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.
> *What to do:* Add a clause on inventions and IP to your employment contracts, with a way for employees to report inventions, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.IP.EMPLOYEE_SOFTWARE — Code written by employees at work

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 5 —: “Software written by employees belongs to the employer”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.dk_employee_code_at_work` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s code is written by employees at work**
> We don't have your confirmation that the software your employees write is made as part of their work or on your instructions.
> *Why it matters:* Danish law passes to the employer the copyright in a program an employee makes at work or on its instructions. It does not cover other kinds of work, or contractors.
> *If left:* Code written outside that may stay with the person who wrote it, and investors check who owns the product.
> *What to do:* Make sure contracts cover the code each employee writes, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.IP.TRADEMARK — Trade mark (Danish or EU) — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | DKPTO |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 5 —: “Trademark registered with DKPTO, or an EU trade mark”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Brand protected by an EU trade mark or a national mark in each operating market”
- **Applies when:** yes
- **Passes when:** `vault.dk_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a trade mark for {company}**
> You haven't added a Danish or EU trade mark certificate, and we can't look marks up at DKPTO yet.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand with DKPTO, or as an EU trade mark, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (17)

### DK.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 6 —: “| Privacy notice published |”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Privacy notice and prior cookie consent on the website”
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

### DK.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to Datatilsynet.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming Datatilsynet and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

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

### DK.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 8(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Age of digital consent for online services to children”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 6 —: “Children's consent: age 13 for online services offered directly to children”
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

### DK.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.dk_ropa.present` is yes
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

### DK.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.dk_dpa.present` is yes
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

### DK.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

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

### DK.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

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
> *If left:* If you need one and haven't named one, Datatilsynet can act on it.
> *What to do:* Check whether the tests apply to you. If they do, name your officer, publish the contact, tell Datatilsynet, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.dk_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to Datatilsynet within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.dk_transfers.present` is yes
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

### DK.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 6 —: “Cookie consent after full information, before non-essential storage”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Privacy notice and prior cookie consent on the website”
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

### DK.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 6 —: “Cookie consent after full information, before non-essential storage”
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

### DK.TAX.VAT_VIES — VAT number valid for EU trade

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

### DK.DP.EU_REPRESENTATIVE — EU representative for a company outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | Datatilsynet |

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

### DK.DP.CPR_NUMBERS — CPR numbers used only where the law allows

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 6 —: “CPR numbers processed only on a listed ground”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `attest.dk_cpr_numbers` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} uses CPR numbers only where allowed**
> We don't have your confirmation that, if you handle Danish personal ID numbers (CPR numbers), you do so only where the law allows.
> *Why it matters:* A private company may process CPR numbers only where the law requires it, with the person's consent, or on another ground the Danish Data Protection Act lists.
> *If left:* Using them without a ground breaks the Danish Data Protection Act, and Datatilsynet can act on it.
> *What to do:* Check where you collect CPR numbers and on what ground. Stop where there is none, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.EMP.EMPLOYER_REGISTRATION — Registered as an employer before the first payroll

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Skattestyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 7 —: “Registered as employer on virk.dk before the first payroll”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.dk_employer_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Employer registration receipt from virk.dk · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your employer registration receipt on file**
> You haven't added your employer registration receipt to your documents yet.
> *Why it matters:* A company registers as an employer on virk.dk before it first pays wages, which opens its access to eIndkomst.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Register as an employer on virk.dk before the first payday, and add the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.EMP.EINDKOMST — Monthly payroll reporting (eIndkomst) — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Skattestyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 7 —: “Monthly eIndkomst reporting, A-skat and AM-bidrag paid”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.dk_eindkomst` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} reports its payroll each month**
> We don't have your confirmation that pay is reported to eIndkomst each month, with A-skat and AM-bidrag paid.
> *Why it matters:* Employers report pay to eIndkomst every month, and report zero in a month with no pay.
> *If left:* Missed reports leave your staff's tax records wrong, and Skattestyrelsen follows them up.
> *What to do:* Check with your payroll provider that every month is reported and paid, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (18)

### DK.COM.WEBSITE_IDENTITY — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Trade register and registration number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “VAT number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 9 —: “Website and e-mails show name, registered office (hjemsted) and CVR number”
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, 5. The core set: “Name, hjemsted, CVR number, address and e-mail on the website”
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

### DK.COM.REGULATOR_NAMED — Your licensing authority, on your website

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

### DK.CONSUMER.PRICES — Clear prices

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

### DK.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

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

### DK.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

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

### DK.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

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

### DK.CONSUMER.ORDER_BUTTON — Order button wording

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

### DK.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
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

### DK.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

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

### DK.CONSUMER.WITHDRAWAL_FUNCTION — Online withdrawal button

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

### DK.CONSUMER.COMPLAINTS — How consumers can complain

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

### DK.CONSUMER.ACCESSIBILITY — Accessibility statement

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

### DK.COM.DSA_CONTACT — Contact point and content rules for your platform

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

### DK.COM.DSA_REPRESENTATIVE — EU legal representative for a platform outside the EU

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

### DK.COM.DSA_POINTS_OF_CONTACT — Published points of contact under the Digital Services Act

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

### DK.COM.CAPITAL_SHOWN — Share capital shown in full where you show it

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | website_information | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 9 —: “If share capital is shown, both subscribed and paid-up capital are shown”
- **Applies when:** `derived.has_website_or_app` is yes
- **Passes when:** `attest.dk_capital_display` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} shows its share capital**
> We don't have your confirmation that, where your website or papers show the share capital, they show both the subscribed and the paid-up amount.
> *Why it matters:* If a company shows its share capital, it must show both what was subscribed and what has been paid up.
> *If left:* A figure that suggests more capital than was paid in misleads customers and lenders.
> *What to do:* Show both figures, or neither, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CONSUMER.ORDER_CONFIRMATION — Online orders confirmed at once

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 9 —: “Order confirmed electronically at once”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.has_website_or_app` is yes) and (`derived.takes_payments` is yes)
- **Passes when:** `attest.dk_order_confirmation` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} confirms each order straight away**
> We don't have your confirmation that consumers get an electronic confirmation as soon as they place an order.
> *Why it matters:* Consumers who order online must get an electronic confirmation of the order at once.
> *If left:* Without it, orders are disputed more often, and consumer authorities check it.
> *What to do:* Send an automatic order confirmation by email, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.CONSUMER.TERMS_DOWNLOAD — Consumer terms that can be downloaded

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 9 —: “Terms available to download”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.has_website_or_app` is yes)
- **Passes when:** all of: (`web.policy.terms_found` is yes) and (`attest.dk_terms_downloadable` is yes)
- **“To check” when:** `web.policy.terms_found` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your published terms; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed consumers can download {company}'s terms**
> We haven't seen terms on your website, or you haven't confirmed consumers can download them. Our scan may not recognise every wording, so a person will check.
> *Why it matters:* Consumers must be able to save your terms, so they are offered in a form that can be downloaded and kept.
> *If left:* Without a copy, consumers can dispute what they agreed to, and consumer authorities check it.
> *What to do:* Publish your terms in a form people can download, such as a PDF, link them from checkout, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (5)

### DK.FUND.PROSPECTUS_EXEMPTION — Share offers within a no-prospectus exemption

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

### DK.FUND.CAPITAL_INCREASE — Capital increase decided and registered

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | Erhvervsstyrelsen |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 10 —: “Capital increase decision registered within 2 weeks”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.dk_capital_increase.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** weeks_to_register = 2
- **Evidence:** General meeting minutes and CVR registration for each capital increase · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your capital increase records on file**
> You haven't added your capital increase records to your documents yet.
> *Why it matters:* A capital increase decision is registered within 2 weeks, and the increase is registered as done only once the capital is paid.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the minutes of each capital increase and its registration with Erhvervsstyrelsen, with proof of payment for cash.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.FUND.PRE_EMPTION — Shareholders' right to subscribe first

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 10 —: “Pre-emption rights respected or validly waived”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.dk_pre_emption` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company} respected its shareholders' right to subscribe first**
> We don't have your confirmation that, in each cash capital increase, existing shareholders could subscribe in proportion to their holdings, or that the right was validly waived.
> *Why it matters:* Existing owners have a right to their share of a cash increase, unless it is waived by the majority needed to change the articles.
> *If left:* An increase that ignored the right can be challenged by the shareholders who lost out.
> *What to do:* Check each capital increase, record the waiver where there was one, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.FUND.DEBT_CONVERSION — Debt turned into shares, decided properly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 10 —: “Debt conversion: decision and board statement”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.dk_debt_conversion` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed how {company} turned any debt into shares**
> We don't have your confirmation that, where a loan or note became shares, there was a proper decision with a statement from the board.
> *Why it matters:* A capital increase paid by turning debt into shares needs its own decision and a board statement on the debt.
> *If left:* A conversion done without them can be challenged, and investors check how each share was paid for.
> *What to do:* If you converted debt, check the decision and statement are in place. Then confirm here, or confirm you have not converted any.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### DK.FUND.WARRANT_REGISTRATION — Shares from warrants and convertibles registered each year

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 10 —: “Warrant or convertible increases registered within 4 weeks after year end”
- **Applies when:** any of: (`derived.invested` is yes) or (`derived.equity_incentives` is yes)
- **Passes when:** `attest.dk_warrant_registration` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** weeks_after_year_end = 4; subscription_period_over_months = 12
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company} registers shares issued under warrants or convertibles**
> We don't have your confirmation that shares issued under warrants or convertible loans were registered within 4 weeks after the year end.
> *Why it matters:* Where the subscription period runs over 12 months, the capital increases from warrants and convertibles are registered within 4 weeks after each year end.
> *If left:* Unregistered increases leave the register and your cap table out of step.
> *What to do:* Check what was exercised or converted last year, register it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (9)

### DK.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | Datatilsynet |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.dk_dpia.present` is yes
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

### DK.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | Datatilsynet |

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

### DK.AI.ROLES — AI systems list with your role for each

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “Role identified: provider, deployer, importer or distributor of each AI system”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.dk_ai_inventory.present` is yes
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

### DK.AI.PROHIBITED_PRACTICES — No banned AI practices

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

### DK.AI.PROHIBITED_GENERATIVE — No AI that makes abusive images of real people

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

### DK.AI.LITERACY — AI literacy for your team

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

### DK.AI.HIGH_RISK — High-risk AI documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Chapter III, as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI (Annex III uses: employment, credit scoring, education”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (any of: (the answer to “What for?” includes “hiring”) or (the answer to “What for?” includes “credit”) or (the answer to “What for?” includes “education”) or (the answer to “What for?” includes “insurance”) or (the answer to “What for?” includes “biometrics”))
- **Passes when:** `vault.dk_ai_high_risk.present` is yes
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

### DK.AI.HIGH_RISK_PRODUCTS — High-risk AI in regulated products

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 6(1), as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.sector.healthtech` is yes)
- **Passes when:** `vault.dk_ai_annex_i.present` is yes
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

### DK.AI.TRANSPARENCY — AI use disclosed on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-denmark-rule-pack-map.md`, Section 11 —: “AI use disclosed on the website”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.has_website_or_app` is yes)
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.dk_ai_transparency.present` is yes)
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

## Documents this pack asks for (19)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `dk_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | DK.DP.ROPA |
| `dk_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | DK.DP.PROCESSING_AGREEMENTS |
| `dk_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | DK.AI.DPIA |
| `dk_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to Datatilsynet within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | DK.DP.BREACH |
| `dk_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | DK.DP.TRANSFERS |
| `dk_ai_inventory` | List of AI systems, with your role for each | What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system. | tier 5 | no | DK.AI.ROLES |
| `dk_ai_high_risk` | High-risk AI documentation (risk management, technical file, conformity, registration) | AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration. | tier 5 | no | DK.AI.HIGH_RISK |
| `dk_ai_annex_i` | AI documentation for regulated products (such as medical devices) | AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval. | tier 5 | no | DK.AI.HIGH_RISK_PRODUCTS |
| `dk_articles` | Articles of association (vedtægter), current version | The articles state the name, object, share capital and share rights, and are part of the signed founding document. | tier 4 | no | DK.CORP.ARTICLES |
| `dk_capital_payment` | Proof the share capital was paid in (bank statement or auditor statement) | At least a quarter of the capital, and at least DKK 20,000, is paid in when the company is registered, and must stay paid. | tier 4 | no | DK.CORP.SHARE_CAPITAL |
| `dk_ubo_review_minutes` | Minutes showing the yearly beneficial-owner review | The yearly review of beneficial owners is presented at the general meeting that approves the annual report. | tier 5 | no | DK.CORP.UBO_ANNUAL_CHECK |
| `dk_annual_report` | Approved annual report, or the CVR filing receipt | The approved annual report reaches Erhvervsstyrelsen within 6 months of the year end, with no extension. Filed reports are not read yet, so we need yours. | tier 4 | no | DK.CORP.ANNUAL_REPORT |
| `dk_agm_minutes` | Minutes of the ordinary general meeting | The ordinary general meeting approves the annual report and decides on profit or loss, in time for the report to be filed. | tier 4 | no | DK.CORP.GENERAL_MEETING |
| `dk_audit` | Auditor's report, or the audit opt-out statement in your annual report | A company is audited unless it may opt out, and the annual report says which. An auditor you appoint is registered with Erhvervsstyrelsen. | tier 4 | no | DK.CORP.AUDIT |
| `dk_employee_ip_clause` | Employment contract clause on inventions and IP | You can claim an invention an employee makes in their work, if you do it within 4 months of being told. A clear clause sets out how. | tier 5 | no | DK.IP.EMPLOYEE_INVENTIONS |
| `dk_trademark` | DKPTO or EU trade mark registration certificate | There is no DKPTO trade mark lookup we can use yet, so we read your certificate. | tier 4 | no | DK.IP.TRADEMARK |
| `dk_employer_registration` | Employer registration receipt from virk.dk | A company registers as an employer on virk.dk before it first pays wages, which opens its access to eIndkomst. | tier 4 | no | DK.EMP.EMPLOYER_REGISTRATION |
| `dk_capital_increase` | General meeting minutes and CVR registration for each capital increase | A capital increase decision is registered within 2 weeks, and the increase is registered as done only once the capital is paid. | tier 4 | no | DK.FUND.CAPITAL_INCREASE |
| `dk_ai_transparency` | AI transparency records | People should know when they are dealing with AI. | tier 5 | no | DK.AI.TRANSPARENCY |
