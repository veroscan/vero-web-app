# Review: Switzerland (CH) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** CH, version 0.1.0, 13 rules (4 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `4ae496186bab354a6d0ee0446986b5c927e384d66f5ec5232acf7d590900e180`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (8)

### CH.CORP.STATUS — Company status in the commercial register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| critical | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Swiss commercial register (Zefix) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.01”
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 5. Core set: “Registered and active; AG or GmbH; seat in Switzerland”
- **Applies when:** yes
- **Passes when:** `registry.ch.zefix.status` is “active”
- **A problem (defect) when:** all of: (`registry.ch.zefix.identified` is yes) and (`registry.ch.zefix.status` is one of “being_cancelled”, “cancelled”)
- **“To check” when:** all of: (`registry.ch.zefix.identified` is yes) and (not (`registry.ch.zefix.status` is one of “active”, “being_cancelled”, “cancelled”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Zefix record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} doesn't show as active in the Swiss commercial register**
> We read {company}'s entry in Zefix, and it shows the company as being removed from the register, or already removed.
> *Why it matters:* Anyone who looks the company up, banks and investors included, sees this status first.
> *If left:* A company removed from the register can lose the right to act, sign contracts and hold assets in its own name.
> *What to do:* Check the entry on zefix.ch today and get qualified advice on what can still be done.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.CORP.LEGAL_FORM — Legal form: AG or GmbH

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | standing | tier 1, official source, read live | S2 incorporated, pre-revenue | Swiss commercial register (Zefix) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.02”
- **Applies when:** yes
- **Passes when:** `registry.ch.zefix.legal_form_code` is one of “0106”, “0107”
- **“To check” when:** `registry.ch.zefix.identified` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Zefix record · **Fix type:** review · **Penalty if left:** none

**What the company reads when it fails:**

> **We couldn't confirm {company} is an AG or a GmbH**
> Zefix doesn't show {company} as a company limited by shares (AG) or a limited liability company (GmbH).
> *Why it matters:* The Swiss checks here are written for those two kinds of company. Other forms have different duties.
> *If left:* Some of the checks we show may not fit your company.
> *What to do:* Check the legal form on your Zefix entry. A person will look at which checks apply.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.CORP.SEAT — Registered seat in Switzerland

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | Swiss commercial register (Zefix) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.05”
- **Applies when:** yes
- **Passes when:** `registry.ch.zefix.legal_seat` is yes (or present)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Zefix record · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see a registered seat for {company}**
> {company}'s Zefix entry doesn't show a registered seat.
> *Why it matters:* A Swiss company has its legal seat in a Swiss municipality. It decides which register and court it belongs to.
> *If left:* Official letters and legal papers may not reach you.
> *What to do:* Check the seat in your entry and ask the commercial register to correct it if it is missing.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.CORP.RESIDENT_REPRESENTATIVE — A person living in Switzerland who can represent the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** Code of Obligations, Art. 718(4)
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.06”
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 5. Core set: “A person resident in Switzerland who can represent the company”
- **Applies when:** `derived.ch.is_ag` is yes
- **Passes when:** `attest.ch_resident_representative` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed someone living in Switzerland can represent {company}**
> We don't have your confirmation that a board member or director who lives in Switzerland can represent the company. Zefix doesn't show where people live, so we can't check.
> *Why it matters:* An AG must always have at least one person living in Switzerland who can act for it, with access to the share register and the list of beneficial owners.
> *If left:* If nobody living in Switzerland can act for the company, it is not set up the way Swiss law asks.
> *What to do:* Check who signs for the company and where they live, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.CORP.TRANSPARENCY_REGISTER — Beneficial owners reported to the Transparency Register — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 4, a document the company uploads | S2 incorporated, pre-revenue | Swiss Transparency Register |

- **Law cited:** Federal Act on the Transparency of Legal Entities
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.09”
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 5. Core set: “Transparency Register report made”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ch_transparency_register_confirmation.present` is yes) or (`attest.ch_transparency_register_reported` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-10-01 to no end date
- **Evidence:** EasyGov filing confirmation; Your confirmation · **Fix type:** file · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see that {company} has reported its beneficial owners**
> You haven't added the confirmation that the company reported its beneficial owners to the Swiss Transparency Register.
> *Why it matters:* Since 1 October 2026 every AG and GmbH must report the people who ultimately own or control it, online through EasyGov. Deadlines are staggered by company type.
> *If left:* The register is new, so banks and investors will start asking for proof soon.
> *What to do:* Check your deadline on transpareg.admin.ch, make the report through EasyGov, and add the confirmation here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.CORP.BENEFICIAL_OWNER_LIST — The company's own list of beneficial owners — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | shareholders | tier 5, the company tells us | S2 incorporated, pre-revenue | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.10”
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 5. Core set: “Share register and beneficial-owner list kept”
- **Applies when:** yes
- **Passes when:** `attest.ch_beneficial_owner_list` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} keeps a list of its beneficial owners**
> We don't have your confirmation that the company keeps a list of the people its shareholders have reported as beneficial owners.
> *Why it matters:* Shareholders with a large stake tell the company who really owns their shares, and the company keeps that list.
> *If left:* It's asked for when a bank opens an account or an investor checks ownership.
> *What to do:* Keep the list with your share register, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.CORP.AUDIT — Audit firm, or a valid opting-out

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 1, official source, read live | S2 incorporated, pre-revenue | Swiss commercial register (Zefix) |

- **Law cited:** Code of Obligations, Art. 727a
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.12”
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.13”
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 5. Core set: “Audit firm on the register, or a valid opting-out”
- **Applies when:** yes
- **Passes when:** any of: (`registry.ch.zefix.auditors_count` is at least 1) or (`vault.ch_opting_out.present` is yes)
- **“To check” when:** `registry.ch.zefix.auditors_count` is 0
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Zefix record; Opting-out consent and declaration · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see an audit firm or an opting-out for {company}**
> Zefix shows no audit firm for {company}, and you haven't added the shareholders' consent to opt out of the audit.
> *Why it matters:* A Swiss company has its accounts audited, unless every shareholder agrees to opt out and it has no more than 10 full-time posts on average.
> *If left:* Investors and banks ask for audited accounts, or for proof of the opting-out.
> *What to do:* If you opted out, add the shareholders' consent and the declaration here. If not, appoint an audit firm.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.CORP.CHANGES_REGISTERED — Changes entered in the commercial register

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | Swiss commercial register (Zefix) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.1 Layer 1: “CH-1.14”
- **Applies when:** yes
- **Passes when:** `attest.ch_changes_registered` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; Zefix record · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s changes are on the register**
> We don't have your confirmation that every change to the board, signatories, seat, articles or capital has been entered in the commercial register.
> *Why it matters:* Banks, customers and investors rely on the register to show who runs the company.
> *If left:* A person who left can still appear to sign for the company, and a bank may refuse a new signatory.
> *What to do:* Compare your Zefix entry with how the company is run today, register anything missing, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (3)

### CH.DP.ROPA — Record of processing activities — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | FDPIC |

- **Law cited:** Federal Act on Data Protection
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.3 Layer 3: “CH-3.03”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** any of: (`vault.ch_ropa.present` is yes) or (`attest.ch_ropa_exemption` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Record of processing activities; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s record of processing activities**
> You haven't added a record of processing activities, or confirmed the company doesn't need one.
> *Why it matters:* Swiss data protection law expects a written record of how you handle personal data. Small companies with low-risk processing may not need one.
> *If left:* If the regulator asks, you would have nothing to show.
> *What to do:* Write a short record of what data you handle and why, and add it here. If you think you are exempt, confirm that instead.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.DP.BREACH — Data breach plan

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | FDPIC |

- **Law cited:** Federal Act on Data Protection, Art. 24
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.3 Layer 3: “CH-3.04”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** `vault.ch_breach_plan.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Data breach plan · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We don't have {company}'s data breach plan**
> You haven't added a plan for what happens when personal data is lost or exposed.
> *Why it matters:* A breach likely to cause a high risk to people must be reported to the FDPIC as soon as possible, through its online portal, and people told where needed.
> *If left:* Working it out during a breach costs time you won't have.
> *What to do:* Write a short plan saying who decides, who reports to the FDPIC and how fast, and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.TAX.VAT — VAT registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 4, a document the company uploads | S3 revenue, pre-raise | Federal Tax Administration (ESTV) |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.3 Layer 3: “CH-3.08”
- **Applies when:** yes
- **Passes when:** any of: (`vault.ch_vat_registration.present` is yes) or (`attest.ch_vat_below_threshold` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** threshold_chf = 100000
- **Abroad:** never follows the company into another country
- **Evidence:** ESTV registration confirmation; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s Swiss VAT registration**
> You haven't added the ESTV confirmation of VAT registration, or confirmed the company is below the threshold.
> *Why it matters:* A company registers for VAT once its worldwide turnover reaches CHF 100,000 a year. A new business is exempt while it expects to stay below that for the next 12 months.
> *If left:* Registering late can mean paying VAT you never charged your customers.
> *What to do:* If you are registered, add the ESTV confirmation. If you are below the threshold, confirm that here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (2)

### CH.FUND.PROSPECTUS_EXEMPTION — Exemption relied on when offering shares — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** Financial Services Act, Art. 36
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.5 Layer 5: “CH-5.02”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.ch_prospectus_exemption` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't told us which exemption {company} relies on to offer shares**
> We don't have your confirmation of the exemption that lets the company offer shares without a prospectus.
> *Why it matters:* Offering shares to the public needs a prospectus unless an exemption applies, for example a small number of investors or professional investors only.
> *If left:* Investors and their advisers will ask which exemption the round relied on.
> *What to do:* Write down which exemption each round relied on, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### CH.EQUITY.REGISTERS_AFTER_ROUND — Registers updated after a round

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | shareholders | tier 5, the company tells us | S4 raising | — |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-switzerland-rule-pack-map.md`, 3.5 Layer 5: “CH-5.03”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.ch_registers_updated_after_round` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't confirmed {company}'s registers were updated after the round**
> We don't have your confirmation that the share register, the list of beneficial owners and the Transparency Register were updated after new shares were issued.
> *Why it matters:* A round changes who owns the company, and each of these records has to show it.
> *If left:* The next investor or bank will check them against your round documents.
> *What to do:* Update each one after every round, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (5)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `ch_transparency_register_confirmation` | Transparency Register filing confirmation (EasyGov) | The register is not public, so the EasyGov confirmation is the only way to show the report was made. | tier 4 | no | CH.CORP.TRANSPARENCY_REGISTER |
| `ch_opting_out` | Opting-out of the limited audit (shareholder consent and declaration) | With no audit firm on the register, this shows every shareholder agreed to opt out. | tier 4 | no | CH.CORP.AUDIT |
| `ch_ropa` | Record of processing activities | It lists what personal data you handle, why, and where it goes. | tier 5 | no | CH.DP.ROPA |
| `ch_breach_plan` | Data breach plan | A serious breach has to be reported to the FDPIC as soon as possible, so you need to know who does what. | tier 5 | no | CH.DP.BREACH |
| `ch_vat_registration` | VAT registration confirmation (ESTV) | It shows the company is registered for Swiss VAT, with its CHE number ending in MWST. | tier 4 | no | CH.TAX.VAT |
