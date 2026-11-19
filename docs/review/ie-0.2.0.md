# Review: Ireland (IE) 0.2.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** IE, version 0.2.0, 62 rules (4 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `a2ef2a0f699e4a8a5b561c55a841140fc661a97e7157447f305d40d3da7d031e`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (13)

### IE.CORP.UBO_ANNUAL_CHECK — Yearly check of beneficial-owner details

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

### IE.CORP.STATUS — Company status on the CRO register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Companies Registration Office (CRO) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “On the CRO register with normal status”
- **Applies when:** yes
- **Passes when:** `registry.ie.cro.status` is “normal”
- **“To check” when:** all of: (`registry.ie.cro.identified` is yes) and (not (`registry.ie.cro.status` is “normal”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** CRO company record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't confirm {company} has a normal status at the CRO**
> We couldn't confirm from {company}'s record at the Companies Registration Office that its status is normal. It may show another status, or we may not have found the company yet.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees its CRO status first.
> *If left:* A company listed for strike-off, or struck off, can lose the right to trade and to hold assets in its own name.
> *What to do:* Check the record on cro.ie today. If the status is not normal, find out why and get advice on putting it right.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.CONSTITUTION — Constitution

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 4, a document the company uploads | S2 incorporated, pre-revenue | — |

- **Law cited:** Companies Act 2014, s.19
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 2 —: “Constitution (single document)”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “Constitution uploaded”
- **Applies when:** yes
- **Passes when:** `vault.ie_constitution.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Constitution (current version) · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your constitution on file**
> You haven't added your constitution to your documents yet.
> *Why it matters:* An LTD has a single-document constitution stating its name, its limited liability, its share capital and each subscriber's shares.
> *If left:* You'll be asked for it in due diligence, and banks and investors read it to see how the company is run.
> *What to do:* Add the current constitution, with every change made since the company was set up.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.REGISTER_OF_MEMBERS — Register of members

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Companies Act 2014, s.169
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 2 —: “Register of members kept”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “Constitution uploaded; register of members kept”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 10 —: “Register of members updated after the issue”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 12 —: “| Register of members |”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ie_register_of_members.present` is yes) or (`attest.ie_register_of_members` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_to_enter_change = 28
- **Evidence:** Register of members; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s register of members**
> You haven't added the register of members, or confirmed that you keep it up to date.
> *Why it matters:* Every company keeps a register of its members. New members and leavers are entered within 28 days.
> *If left:* It is the record of who owns the company, so investors and banks ask for it.
> *What to do:* Bring the register up to date with every issue and transfer, and add it here or confirm you keep it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.UBO_REGISTER — The company's own beneficial-ownership register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** S.I. 110/2019, reg 5
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 2 —: “Internal beneficial-ownership register kept”
- **Applies when:** yes
- **Passes when:** `attest.ie_ubo_register` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps its own register of beneficial owners**
> We don't have your confirmation that the company keeps its own register of the people who ultimately own or control it.
> *Why it matters:* Every company takes reasonable steps to identify its beneficial owners and keeps its own register of them.
> *If left:* The central filing is made from this register, and banks ask for it when they onboard you.
> *What to do:* Set up the register from your shareholder records, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.RBO_FILING — Beneficial owners filed with the RBO

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Register of Beneficial Ownership (RBO) |

- **Law cited:** S.I. 110/2019, reg 20(2)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “Beneficial owners filed with the RBO”
- **Applies when:** yes
- **Passes when:** `vault.ie_rbo_filing.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** RBO filing confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your RBO filing confirmation on file**
> You haven't added your RBO filing confirmation to your documents yet.
> *Why it matters:* Beneficial owners are filed with the central register (the RBO) within 5 months of incorporation. We cannot read the register, so we need the confirmation.
> *If left:* Banks check the RBO before they open or review an account, and a missing filing holds that up.
> *What to do:* File your beneficial owners with the RBO online if you have not, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.UBO_CHANGES — Beneficial-owner update after a change

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | beneficial_ownership | tier 4, a document the company uploads | S4 raising | Register of Beneficial Ownership (RBO) |

- **Law cited:** S.I. 110/2019, reg 23
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 10 —: “Beneficial-owner update after the round”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 12 —: “| Beneficial-owner updates |”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.ie_rbo_update.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** RBO update confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your RBO update confirmation on file**
> You haven't added your RBO update confirmation to your documents yet.
> *Why it matters:* A change in who owns or controls the company, such as after a round, is reflected in the central register too.
> *If left:* An out-of-date filing shows the wrong owners to the banks that rely on it.
> *What to do:* After each change in ownership, update your filing with the RBO and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.ANNUAL_RETURN — Annual return with financial statements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | Companies Registration Office (CRO) |

- **Law cited:** Companies Act 2014, ss.343, 345, 347
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 3 —: “First annual return date 6 months after incorporation”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 3 —: “Financial statements annexed to the annual return”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 12 —: “| Annual return (B1) |”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 12 —: “| Financial statements |”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “annual return not overdue”
- **Applies when:** yes
- **Passes when:** `attest.ie_annual_return_filed` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** registry date: {"fact":"registry.ie.cro.next_annual_return_due"} (checked automatically with the CRO)
- **Numbers for you to confirm:** first_return_date_months_after_incorporation = 6; days_after_return_date = 56; accounts_made_up_within_months = 9
- **Evidence:** Your confirmation; CRO annual return dates · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} delivered its last annual return on time**
> We don't have your confirmation that the last annual return reached the CRO within 56 days of its annual return date, with the financial statements attached.
> *Why it matters:* Every company delivers an annual return each year. The first annual return date is 6 months after incorporation, and the return is due within 56 days of each one.
> *If left:* A late return is an offence, and it can cost the company its audit exemption.
> *What to do:* Check your next annual return date with the CRO, deliver the return with the statements on time, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.AGM — Annual general meeting, or a written resolution instead

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Companies Act 2014, s.175
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 3 —: “Annual general meeting held, or dispensed with in writing”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 12 —: “| AGM |”
- **Applies when:** yes
- **Passes when:** `attest.ie_agm` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** max_months_between_meetings = 15; first_meeting_within_months = 18
- **Evidence:** Your confirmation; Minutes or written resolution · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} held its annual general meeting**
> We don't have your confirmation that the company held its AGM this year, or that all voting members signed a written resolution instead.
> *Why it matters:* An AGM is held each year, no more than 15 months after the last, and the first within 18 months of incorporation. All voting members can agree in writing to skip it.
> *If left:* Without it, approving the accounts and keeping the auditor are harder to show.
> *What to do:* Hold the AGM, or have every voting member sign the written resolution, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.AUDIT — Audit, or an audit exemption you qualify for

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S3 revenue, pre-raise | — |

- **Law cited:** Companies Act 2014, ss.347, 358
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 3 —: “Audit exemption claimed only when qualifying”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 4 —: “Statutory auditor appointed unless exempt”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ie_audit_report.present` is yes) or (`attest.ie_audit_exemption_qualifies` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Auditor's report; Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see an audit report, or a confirmed exemption, for {company}**
> You haven't added an auditor's report, or confirmed that the company qualifies for the small-company audit exemption it claims.
> *Why it matters:* Financial statements are audited unless the company is small and claims the exemption. A company in a group qualifies only if the group is small too.
> *If left:* Claiming the exemption without qualifying leaves the company without the audit the law asks for, and the annual return incomplete.
> *What to do:* Add your auditor's report, or check the company meets the small-company tests and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.DIRECTORS — At least one director, and a secretary who is not the sole director

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Companies Registration Office (CRO) |

- **Law cited:** Companies Act 2014, ss.128, 129
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 4 —: “At least one director”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 4 —: “A company secretary, not the sole director”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “At least one director, a secretary who is not the sole director”
- **Applies when:** yes
- **Passes when:** `vault.ie_officers_register.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Register of directors and secretaries, or a CRO company printout · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your register of directors and secretaries on file**
> You haven't added your register of directors and secretaries to your documents yet.
> *Why it matters:* An LTD has at least one director and a company secretary. A sole director cannot also be the secretary, and the secretary needs the skills or support to do the job.
> *If left:* Going 28 days without a director is an offence, and banks and investors check who can sign for the company.
> *What to do:* Add your register of directors and secretaries, or a CRO company printout. If you have no secretary, or your sole director is also the secretary, appoint one and notify the CRO.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.EEA_DIRECTOR — An EEA-resident director, a bond, or a CRO certificate

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Companies Registration Office (CRO) |

- **Law cited:** Companies Act 2014, ss.137, 140
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 4 —: “At least one EEA-resident director”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 4 —: “Bond of €25,000 in place instead”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 4 —: “Or a CRO certificate of a real and continuous economic link with Ireland”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “an EEA-resident director or a bond or s.140 certificate”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ie_officers_register.present` is yes) or (`vault.ie_director_bond.present` is yes) or (`vault.ie_economic_link_certificate.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Register of directors showing residence; Bond; CRO certificate of economic link · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see that {company} has a director living in the EEA, or a bond or certificate instead**
> You haven't added a register showing a director who lives in the EEA, a €25,000 bond, or a CRO certificate of a real economic link with Ireland.
> *Why it matters:* At least one director must live in the EEA. Alternate directors do not count. Otherwise the company needs the bond or the certificate.
> *If left:* It is an offence, and a company without one of the three is not set up the way Irish law asks.
> *What to do:* Add your register of directors, or put the bond in place or apply to the CRO for the certificate, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.CORP.COMPANY_PARTICULARS — Company details on the website, letters and order forms

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Companies Act 2014, s.151
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 9 —: “Company particulars on the website”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 9 —: “Company particulars and directors on letters and order forms”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “Website shows the Companies Act particulars and e-commerce information”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Company particulars on letters, order forms and website”
- **Applies when:** yes
- **Passes when:** `attest.eu_company_particulars` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_company_particulars` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s website and letters carry its company details**
> We don't have your confirmation that your website, letters and order forms show the company's name, legal form, place of registration, number and registered office, and that letters name the directors. We can't check this yet.
> *Why it matters:* The details must be shown prominently on the website. Letters also name the directors, with their nationality if not Irish. Any share capital shown must be the paid-up capital.
> *If left:* Leaving them out is an offence, and it makes the company look less established.
> *What to do:* Add the details to your website footer and your letter and order templates, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 2: IP and technology (2)

### IE.IP.EMPLOYEE_WORKS — Employees' work, code included, owned by the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 2 IP and technology | ip_ownership | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Copyright and Related Rights Act 2000, s.23(1)(a)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 5 —: “Employee works (including code) owned by the company”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.ie_employee_works` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company} owns what its employees make**
> We don't have your confirmation that your employees' work, code included, is made in the course of their job and that no agreement gives it to them.
> *Why it matters:* The employer owns the copyright in work an employee makes in the course of the job, computer programs included, unless agreed otherwise.
> *If left:* Investors check who owns the code, and any agreement that says otherwise has to be found before a round.
> *What to do:* Check your employment contracts keep this default in place, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.IP.TRADEMARK — Trade mark (Irish or EU)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 2 IP and technology | trademarks | tier 4, a document the company uploads | S2 incorporated, pre-revenue | IPOI |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “trademark filed”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 11 —: “Brand protected by an EU trade mark or a national mark in each operating market”
- **Applies when:** yes
- **Passes when:** `vault.ie_trademark.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Trade mark certificate · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see a trade mark for {company}**
> You haven't added an Irish or EU trade mark certificate, and we can't look marks up at the IPOI yet.
> *Why it matters:* Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.
> *If left:* It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.
> *What to do:* File your brand at the IPOI, or as an EU trade mark, or add your certificate here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (18)

### IE.DP.PRIVACY_NOTICE — Privacy notice

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Arts 12-13
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Privacy notice with the Article 13 information”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 6 —: “| Privacy notice published |”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent”
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

### IE.DP.NOTICE_AUTHORITY — Privacy notice names the data protection authority

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Art 13(2)(d)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Notice names the national supervisory authority”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 6 —: “| Privacy notice published |”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.personal_data` is yes)
- **Passes when:** any of: (`web.policy.dpa_named` is yes) or (`attest.eu_notice_names_authority` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_notice_authority` (counted once per company)
- **Evidence:** Your published privacy notice; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s privacy notice says where people can complain**
> We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to the Data Protection Commission.
> *Why it matters:* People must be told they can complain to a data protection authority.
> *If left:* A notice without it is incomplete, and anyone who reads it can see that.
> *What to do:* Add a line naming the Data Protection Commission and how to reach it, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.DP.RIGHT_TO_OBJECT — Right to object shown clearly

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

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

### IE.DP.CHILD_CONSENT — Children's consent online

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Art 8(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Age of digital consent for online services to children”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 6 —: “Age of digital consent is 16”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Are any of your users under 18?” is yes)
- **Passes when:** `attest.eu_child_consent` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** age_of_digital_consent = 16
- **Same obligation as other packs:** `eu_child_consent` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed how {company} gets consent for children**
> We don't have your confirmation of how you handle consent from children who use your service.
> *Why it matters:* Below 16, consent for an online service has to come from a parent as well, where you rely on consent.
> *If left:* Data collected without valid consent has no legal basis, and children's data is watched closely.
> *What to do:* Set up an age check and a parent consent step where you need one, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.DP.ROPA — Records of processing activities

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Art 30
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “| Records of processing activities |”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.ie_ropa.present` is yes
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

### IE.DP.PROCESSING_AGREEMENTS — Data processing agreements

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Art 28(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Processor agreements (DPAs)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.has_processors` is yes)
- **Passes when:** `vault.ie_dpa.present` is yes
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

### IE.DP.BY_DESIGN — Data protection by design and by default

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

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

### IE.DP.DPO — Data protection officer

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Art 37
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPO designated where required”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 6 —: “DPO details notified to the DPC”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.sensitive_data` is yes)
- **Passes when:** `attest.eu_dpo` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_dpo` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed whether {company} needs a data protection officer**
> You told us you handle sensitive data, and we don't have your confirmation that you checked whether you need a data protection officer.
> *Why it matters:* Companies whose core work is monitoring people at scale, or handling sensitive data at scale, must name one and publish the contact.
> *If left:* If you need one and haven't named one, the Data Protection Commission can act on it.
> *What to do:* Check whether the tests apply to you. If they do, name your officer, publish the contact, tell the Data Protection Commission, and confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.DP.BREACH — Data breach plan and log

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Art 33
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “Breach notification within 72 hours; breach log”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.ie_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_breach` (counted once per company)
- **Evidence:** Data breach response plan and breach log · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your data breach plan and log on file**
> You haven't added your data breach plan and log to your documents yet.
> *Why it matters:* A breach can have to be reported to the Data Protection Commission within 72 hours, so you need to know who does what first, and keep a log.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.DP.TRANSFERS — Safeguards for data leaving the EEA

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Arts 44, 46
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “International transfer safeguards (SCCs or other Art 46 tool)”
- **Applies when:** all of: (`derived.personal_data` is yes) and (the answer to “Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?” is yes)
- **Passes when:** `vault.ie_transfers.present` is yes
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

### IE.DP.COOKIE_CONSENT — Cookie consent

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Consent before non-essential cookies or similar storage”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, 5. The EU core set: “No non-essential cookies or trackers before consent; consent tool present”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 6 —: “Consent before non-essential cookies”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “Privacy notice and cookie consent”
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

### IE.DP.COOKIE_POLICY — Cookie information

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | cookies | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** Directive 2002/58/EC, Art 5(3)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 2 —: “Cookie information (purposes, who sets them)”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 6 —: “| Cookie policy |”
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

### IE.TAX.VAT_VIES — VAT number valid for EU trade

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | VIES |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 5 —: “VAT number valid in VIES”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 7 —: “VAT registration once over the threshold”
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

### IE.DP.EU_REPRESENTATIVE — EU representative for a company outside the EU

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | data_protection | tier 1, official source, read live | S2 incorporated, pre-revenue | the Data Protection Commission |

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

### IE.COM.MARKETING_OPT_OUT — Marketing opt-out shown where contact details are collected

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 3 Compliance and regulatory | marketing | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** S.I. 68/2003, reg 7(1)(d)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 6 —: “Opt-out choice shown where personal data is collected for marketing”
- **Applies when:** all of: (`derived.has_website_or_app` is yes) and (`derived.sends_marketing` is yes)
- **Passes when:** `attest.ie_marketing_opt_out` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} shows a marketing opt-out wherever it collects details**
> You told us you send marketing, and we don't have your confirmation that every sign-up or contact form tells people how to opt out of it.
> *Why it matters:* Wherever personal data is collected, people must be told how to register their choice about receiving marketing.
> *If left:* Marketing sent without that choice leads to complaints, and the rules on unsolicited messages are enforced.
> *What to do:* Add a clear opt-out choice to each form that collects contact details, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.EMP.EMPLOYER_REGISTRATION — Registered with Revenue as an employer — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment_tax | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Revenue |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 7 —: “Registered as an employer before paying staff”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `vault.ie_employer_registration.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** follows the company only where it employs people
- **Evidence:** Revenue employer registration confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Revenue employer registration confirmation on file**
> You haven't added your Revenue employer registration confirmation to your documents yet.
> *Why it matters:* A company registers with Revenue as an employer before it pays staff. The registration is not public, so we need the confirmation.
> *If left:* Paying staff without registering leaves tax unpaid, and Revenue can add interest and penalties.
> *What to do:* Register as an employer through Revenue Online Service if you have not, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.EMP.PAYROLL_REPORTING — Pay reported to Revenue on or before each payday

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | employment | tier 5, the company tells us | S2 incorporated, pre-revenue | Revenue |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 7 —: “Pay reported to Revenue on or before each payday”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 12 —: “| Payroll |”
- **Applies when:** `derived.employees` is yes
- **Passes when:** `attest.ie_payroll_reported` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Recurs:** every month (reminder only)
- **Abroad:** follows the company only where it employs people
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} reports pay to Revenue each payday**
> We don't have your confirmation that each payment to staff is reported to Revenue on or before the payday, with income tax, PRSI and USC deducted.
> *Why it matters:* Employers report each employee's pay and deductions to Revenue on or before every payday, and register each employment.
> *If left:* Late or missing reports bring penalties and interest, and staff records with Revenue go wrong.
> *What to do:* Check with your payroll provider that each payday is reported, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.FIN.CENTRAL_BANK_AUTHORISATION — Central Bank authorisation for payments, e-money or crypto — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 3 Compliance and regulatory | payments | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Central Bank of Ireland |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 8 —: “Central Bank authorisation for payment, e-money or crypto-asset services”
- **Applies when:** any of: (`derived.moves_money` is yes) or (`derived.sector.crypto` is yes)
- **Passes when:** `vault.ie_central_bank_authorisation.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Central Bank of Ireland authorisation, or your licensed partner agreement · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have your Central Bank authorisation on file**
> You haven't added your Central Bank authorisation to your documents yet.
> *Why it matters:* Holding or moving customers' money, or offering crypto-asset services, needs Central Bank authorisation or a licensed partner.
> *If left:* If a regulator or a customer asks for it, you won't have anything to show them.
> *What to do:* Add your Central Bank authorisation, or the agreement with the licensed partner that covers you.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (15)

### IE.COM.WEBSITE_IDENTITY — Who you are, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | website_information | tier 1, official source, read live | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Provider identity on the website: name, geographic address, email”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Trade register and registration number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “VAT number on the website”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 9 —: “E-commerce service-provider information”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, 5. The core set: “Website shows the Companies Act particulars and e-commerce information”
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

### IE.COM.REGULATOR_NAMED — Your licensing authority, on your website

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | website_information | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Directive 2000/31/EC, Art 5(1)(e)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Supervisory authority named”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 8 —: “Activity authorisation shown on the website”
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

### IE.CONSUMER.PRICES — Clear prices

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2000/31/EC, Art 5(2)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 3 —: “Prices clear, with tax and delivery stated”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 9 —: “E-commerce service-provider information”
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

### IE.CONSUMER.ADS_IDENTIFIABLE — Marketing you can recognise as marketing

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

### IE.CONSUMER.ORDERING_STEPS — Ordering steps shown before an order

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

### IE.CONSUMER.PRE_CONTRACT_INFO — Information before a consumer buys

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

### IE.CONSUMER.ORDER_BUTTON — Order button wording

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

### IE.CONSUMER.WITHDRAWAL — 14-day right to withdraw

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** Directive 2011/83/EU, Art 9(1)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “14-day withdrawal right explained; refund policy”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 9 —: “Refund, cancellation and complaints pages”
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

### IE.CONSUMER.DIGITAL_CONTENT — Consent before supplying digital content at once

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

### IE.CONSUMER.COMPLAINTS — How consumers can complain

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 4 Commercial | consumer_protection | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Complaints route for consumers”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 9 —: “Refund, cancellation and complaints pages”
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

### IE.CONSUMER.ACCESSIBILITY — Accessibility statement

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

### IE.COM.DSA_CONTACT — Contact point and content rules for your platform

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

### IE.COM.DSA_REPRESENTATIVE — EU legal representative for a platform outside the EU

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

### IE.COM.DSA_POINTS_OF_CONTACT — Published points of contact under the Digital Services Act

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

### IE.CONSUMER.WITHDRAWAL_FUNCTION — Online withdrawal button — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | consumer_protection | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Directive (EU) 2023/2673, Art 11a of Directive 2011/83/EU
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 9 —: “| Withdrawal function |”
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 4 —: “Online withdrawal function ("withdraw from contract here"), from 19 Jun 2026”
- **Applies when:** all of: (`derived.consumer` is yes) and (`derived.has_website_or_app` is yes)
- **Passes when:** `attest.eu_withdrawal_function` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `eu_withdrawal_function` (counted once per company)
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has an online withdrawal button**
> We don't have your confirmation that consumers who signed up online can withdraw online, with a clear button and a confirmation step.
> *Why it matters:* EU law asks for a clear way to withdraw from contracts made online. We have not yet confirmed where and from when Irish law puts this in place.
> *If left:* Once it applies, consumer authorities can act on it, and consumers can complain that withdrawing was made hard.
> *What to do:* Add a clearly labelled withdrawal button with a confirm step and an emailed acknowledgement, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (5)

### IE.FUND.PROSPECTUS_EXEMPTION — Share offers within a no-prospectus exemption

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

### IE.FUND.ALLOTMENT_AUTHORITY — Directors authorised to allot shares

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** Companies Act 2014, s.69(1)-(5)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 10 —: “Directors authorised to allot shares”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.ie_allotment_authority.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Ordinary resolution or constitution clause authorising the directors to allot shares · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your authority to allot shares on file**
> You haven't added your authority to allot shares to your documents yet.
> *Why it matters:* Directors may allot shares only with authority from the members or the constitution, and within any authorised capital.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the resolution or the constitution clause that gave the directors authority for each allotment.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.FUND.PRE_EMPTION — Pre-emption offer made, or disapplied

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** Companies Act 2014, s.69(6), (12)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 10 —: “Pre-emption offer made or disapplied”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.ie_pre_emption.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Pre-emption offer, or the special resolution or constitution clause disapplying it · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your pre-emption records on file**
> You haven't added your pre-emption records to your documents yet.
> *Why it matters:* Shares issued for cash are first offered to existing holders for at least 14 days, unless the constitution or a special resolution disapplies it.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Add the pre-emption offer for each cash issue, or the resolution or constitution clause that disapplied it.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.FUND.RETURN_OF_ALLOTMENTS — Return of allotments delivered to the CRO — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 4, a document the company uploads | S4 raising | Companies Registration Office (CRO) |

- **Law cited:** Companies Act 2014, s.70(7)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 10 —: “Return of allotments delivered within 30 days”
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 12 —: “| Return of allotments |”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `vault.ie_return_of_allotments.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** days_after_allotment = 30
- **Evidence:** CRO receipt for the return of allotments · **Fix type:** upload · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We don't have your return of allotments receipt on file**
> You haven't added your return of allotments receipt to your documents yet.
> *Why it matters:* Each allotment of shares is reported to the CRO within 30 days.
> *If left:* It will come up in your next round, and investors will want it sorted before they sign.
> *What to do:* Deliver the return of allotments to the CRO for each allotment, and add the receipt here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### IE.FUND.NO_PUBLIC_OFFER — No public offer of shares by an LTD

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** Companies Act 2014, s.68
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 10 —: “No public offer of shares outside the exemptions”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.ie_no_public_offer` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s share offers stayed private**
> We don't have your confirmation that the company has not offered its shares to the public outside the allowed exemptions.
> *Why it matters:* An LTD may not offer shares to the public. Offers to qualified investors, or to 149 or fewer other people, are allowed.
> *If left:* An offer outside the exemptions is an offence, and it can unsettle the round.
> *What to do:* Check each offer, including any crowdfunding or wide investor outreach, fits an exemption, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 6: AI and data (9)

### IE.AI.DPIA — Data protection impact assessment

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | data_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | the Data Protection Commission |

- **Law cited:** GDPR, Art 35
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 1 —: “DPIA for high-risk processing”
- **Applies when:** all of: (`derived.personal_data` is yes) and (`derived.high_risk_processing` is yes)
- **Passes when:** `vault.ie_dpia.present` is yes
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

### IE.AI.AUTOMATED_DECISIONS — Automated decisions about people

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 6 AI and data | data_governance | tier 5, the company tells us | S3 revenue, pre-raise | the Data Protection Commission |

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

### IE.AI.ROLES — AI systems list with your role for each

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Regulation (EU) 2024/1689
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “Role identified: provider, deployer, importer or distributor of each AI system”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** `vault.ie_ai_inventory.present` is yes
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

### IE.AI.PROHIBITED_PRACTICES — No banned AI practices

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

### IE.AI.PROHIBITED_GENERATIVE — No AI that makes abusive images of real people

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

### IE.AI.LITERACY — AI literacy for your team

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

### IE.AI.HIGH_RISK — High-risk AI documentation

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Chapter III, as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI (Annex III uses: employment, credit scoring, education”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (any of: (the answer to “What for?” includes “hiring”) or (the answer to “What for?” includes “credit”) or (the answer to “What for?” includes “education”) or (the answer to “What for?” includes “insurance”) or (the answer to “What for?” includes “biometrics”))
- **Passes when:** `vault.ie_ai_high_risk.present` is yes
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

### IE.AI.HIGH_RISK_PRODUCTS — High-risk AI in regulated products

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 6 AI and data | ai_governance | tier 5, the company tells us | S3 revenue, pre-raise | — |

- **Law cited:** Regulation (EU) 2024/1689, Art 6(1), as amended by Regulation (EU) 2026/1744
- **Encoded from:** `docs/knowledge/vero-scan-eu-common-rule-pack-map.md`, EU Section 7 —: “High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)”
- **Applies when:** all of: (`derived.uses_ai` is yes) and (`derived.sector.healthtech` is yes)
- **Passes when:** `vault.ie_ai_annex_i.present` is yes
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

### IE.AI.TRANSPARENCY — AI use disclosed to users

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 6 AI and data | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-ireland-rule-pack-map.md`, Section 11 —: “AI use disclosed to users”
- **Applies when:** `derived.uses_ai` is yes
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`vault.ie_ai_transparency.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Same obligation as other packs:** `ai_transparency` (counted once per company)
- **Evidence:** Published AI disclosures; Transparency records · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see where {company} tells people it uses AI**
> We couldn't find an AI disclosure on your website, and you haven't added transparency records.
> *Why it matters:* People must be told when they are dealing with an AI system, and AI-made content has to be marked.
> *If left:* Enterprise customers and investors are starting to ask, and you would have no answer ready.
> *What to do:* Say on your website where your product uses AI, or add your transparency records here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (23)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `ie_ropa` | Records of processing activities | It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one. | tier 5 | no | IE.DP.ROPA |
| `ie_dpa` | Data processing agreements | Each vendor that handles personal data for you needs a written agreement saying what it may do with it. | tier 5 | no | IE.DP.PROCESSING_AGREEMENTS |
| `ie_dpia` | Data protection impact assessment | Profiling, AI, sensitive data and monitoring people call for a written assessment before you start. | tier 5 | no | IE.AI.DPIA |
| `ie_breach_plan` | Data breach response plan and breach log | A breach can have to be reported to the Data Protection Commission within 72 hours, so you need to know who does what first, and keep a log. | tier 5 | no | IE.DP.BREACH |
| `ie_transfers` | Data transfer safeguards (standard contractual clauses or similar) | Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses. | tier 5 | no | IE.DP.TRANSFERS |
| `ie_ai_inventory` | List of AI systems, with your role for each | What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system. | tier 5 | no | IE.AI.ROLES |
| `ie_ai_high_risk` | High-risk AI documentation (risk management, technical file, conformity, registration) | AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration. | tier 5 | no | IE.AI.HIGH_RISK |
| `ie_ai_annex_i` | AI documentation for regulated products (such as medical devices) | AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval. | tier 5 | no | IE.AI.HIGH_RISK_PRODUCTS |
| `ie_constitution` | Constitution (current version) | An LTD has a single-document constitution stating its name, its limited liability, its share capital and each subscriber's shares. | tier 4 | no | IE.CORP.CONSTITUTION |
| `ie_register_of_members` | Register of members | The company keeps a register of its members: names, addresses, shares, amounts paid, and the dates each joined and left. | tier 5 | no | IE.CORP.REGISTER_OF_MEMBERS |
| `ie_rbo_filing` | RBO filing confirmation | Beneficial owners are filed with the central register (the RBO) within 5 months of incorporation. We cannot read the register, so we need the confirmation. | tier 4 | no | IE.CORP.RBO_FILING |
| `ie_rbo_update` | RBO update confirmation | A change in who owns or controls the company, such as after a round, is reflected in the central register too. | tier 4 | no | IE.CORP.UBO_CHANGES |
| `ie_audit_report` | Auditor's report on the financial statements | Financial statements are audited, and the report annexed to the annual return, unless a small company claims the audit exemption. | tier 4 | no | IE.CORP.AUDIT |
| `ie_officers_register` | Register of directors and secretaries, or a CRO company printout | It shows who the directors and the secretary are, and where each director lives. We cannot read officers from the CRO yet. | tier 4 | no | IE.CORP.DIRECTORS, IE.CORP.EEA_DIRECTOR |
| `ie_director_bond` | Bond of €25,000 in the prescribed form | A company with no director living in the EEA can hold a bond of €25,000 instead. | tier 4 | no | IE.CORP.EEA_DIRECTOR |
| `ie_economic_link_certificate` | CRO certificate of a real and continuous economic link with Ireland | A company with no director living in the EEA can instead hold a CRO certificate that it has a real economic link with Ireland. | tier 4 | no | IE.CORP.EEA_DIRECTOR |
| `ie_trademark` | IPOI or EU trade mark certificate | There is no IPOI lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed. | tier 4 | no | IE.IP.TRADEMARK |
| `ie_employer_registration` | Revenue employer registration confirmation | A company registers with Revenue as an employer before it pays staff. The registration is not public, so we need the confirmation. | tier 4 | no | IE.EMP.EMPLOYER_REGISTRATION |
| `ie_central_bank_authorisation` | Central Bank of Ireland authorisation, or your licensed partner agreement | Holding or moving customers' money, or offering crypto-asset services, needs Central Bank authorisation or a licensed partner. | tier 4 | no | IE.FIN.CENTRAL_BANK_AUTHORISATION |
| `ie_allotment_authority` | Ordinary resolution or constitution clause authorising the directors to allot shares | Directors may allot shares only with authority from the members or the constitution, and within any authorised capital. | tier 5 | no | IE.FUND.ALLOTMENT_AUTHORITY |
| `ie_pre_emption` | Pre-emption offer, or the special resolution or constitution clause disapplying it | Shares issued for cash are first offered to existing holders for at least 14 days, unless the constitution or a special resolution disapplies it. | tier 5 | no | IE.FUND.PRE_EMPTION |
| `ie_return_of_allotments` | CRO receipt for the return of allotments | Each allotment of shares is reported to the CRO within 30 days. | tier 4 | no | IE.FUND.RETURN_OF_ALLOTMENTS |
| `ie_ai_transparency` | AI transparency records | People should know when they are dealing with AI, and AI-made content has to be marked. | tier 5 | no | IE.AI.TRANSPARENCY |
