# Review: Australia (AU) 0.1.0

**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.

- **Pack:** AU, version 0.1.0, 15 rules (3 can only say “to check”).
- **Fingerprint (SHA-256 of the rules):** `ff129a3c6479b39335fa01c93e0fef119a1643120af233b308476b8c06eb9b88`
- **Also applies:** nothing else; the International pack (INTL) runs after it, and a country rule asking the same thing wins.
- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.

## Layer 1: Corporate (9)

### AU.CORP.ASIC_REGISTRATION — Company registered with ASIC

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | standing | tier 4, a document the company uploads | S2 incorporated, pre-revenue | ASIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.01”
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 5. Core set: “Registered with ASIC”
- **Applies when:** yes
- **Passes when:** `vault.au_asic_extract.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ASIC company extract · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s ASIC registration**
> You haven't added a current ASIC company extract, and ABN Lookup can't tell us whether the company is registered with ASIC.
> *Why it matters:* The extract is the record of the company itself: its status, registered office, directors and members.
> *If left:* It's the first thing a bank, investor or buyer asks for.
> *What to do:* Download a current company extract from ASIC Connect and add it here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.TAX.ABN — ABN active

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | tax | tier 1, official source, read live | S2 incorporated, pre-revenue | Australian Business Register |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.02”
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 5. Core set: “ABN active”
- **Applies when:** yes
- **Passes when:** `registry.au.abr.abn_status` is “active”
- **A problem (defect) when:** all of: (`registry.au.abr.identified` is yes) and (`registry.au.abr.abn_status` is “cancelled”)
- **“To check” when:** all of: (`registry.au.abr.identified` is yes) and (not (`registry.au.abr.abn_status` is one of “active”, “cancelled”))
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Abroad:** never follows the company into another country
- **Evidence:** ABN Lookup record · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s ABN doesn't show as active**
> ABN Lookup shows {company}'s Australian Business Number as cancelled. This is the tax registration, not the company's registration with ASIC.
> *Why it matters:* Customers, banks and the tax office use the ABN to deal with the business, and GST registration needs one.
> *If left:* Without an active ABN, the company cannot be registered for GST.
> *What to do:* Check the ABN on ABN Lookup and apply to reactivate it, or for a new one, through the Australian Business Register.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.CORP.REGISTERED_OFFICE — Registered office in Australia

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | ASIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.04”
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 5. Core set: “Registered office in Australia and a resident director”
- **Applies when:** yes
- **Passes when:** any of: (`vault.au_asic_extract.present` is yes) or (`attest.au_office_consent` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ASIC company extract; Your confirmation · **Fix type:** upload · **Penalty if left:** none

**What the company reads when it fails:**

> **We can't see {company}'s registered office**
> You haven't added an ASIC extract or confirmed the registered office. ABN Lookup only shows where the business trades, for tax.
> *Why it matters:* The registered office is a street address in Australia, not a PO box. If it is someone else's address, they have to agree to it.
> *If left:* Official notices and legal papers are sent there.
> *What to do:* Add a current ASIC extract, or confirm the registered office is a street address in Australia used with the occupier's consent.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.CORP.RESIDENT_DIRECTOR — A director living in Australia

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | ASIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.05”
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 5. Core set: “Registered office in Australia and a resident director”
- **Applies when:** yes
- **Passes when:** `attest.au_resident_director` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; ASIC company extract · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company} has a director living in Australia**
> We don't have your confirmation that at least one director ordinarily lives in Australia. We don't keep people's details, so we can't check.
> *Why it matters:* A proprietary company needs at least one director who ordinarily lives in Australia.
> *If left:* Without one, the company is not set up the way ASIC requires.
> *What to do:* Check your directors on your ASIC extract, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.CORP.SECRETARY — Company secretary, if appointed, living in Australia

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| low | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | ASIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.06”
- **Applies when:** yes
- **Passes when:** `attest.au_secretary` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't told us about {company}'s company secretary**
> We don't have your confirmation that the company has no secretary, or that at least one secretary ordinarily lives in Australia.
> *Why it matters:* A proprietary company doesn't have to appoint a secretary. If it does, at least one must ordinarily live in Australia.
> *If left:* A secretary who lives abroad on their own does not meet the rule.
> *What to do:* Check your officeholders on your ASIC extract, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.CORP.DIRECTOR_IDS — Director identification numbers

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | officers | tier 5, the company tells us | S2 incorporated, pre-revenue | Australian Business Registry Services |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.07”
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 5. Core set: “Director IDs held by every director”
- **Applies when:** yes
- **Passes when:** `attest.au_director_ids` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed each of {company}'s directors has a director ID**
> We don't have your confirmation that every director holds a director identification number. The numbers aren't public, and we don't need to see them.
> *Why it matters:* Every director needs a director ID, applied for before they are appointed. Only the director can apply.
> *If left:* Applying late is a criminal offence for the director.
> *What to do:* Ask each director to check they have their director ID through ABRS, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.CORP.ANNUAL_REVIEW — Annual review with ASIC

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | filings | tier 4, a document the company uploads | S2 incorporated, pre-revenue | ASIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.10”
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 5. Core set: “Annual statement reviewed, fee paid and solvency resolution passed”
- **Applies when:** yes
- **Passes when:** `vault.au_annual_statement.present` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** ASIC annual statement and fee receipt · **Fix type:** pay · **Penalty if left:** moderate

**What the company reads when it fails:**

> **We can't see {company}'s latest annual review**
> You haven't added the latest ASIC annual statement and the receipt for the review fee.
> *Why it matters:* Each year at its review date ASIC sends the company a statement. The company checks and corrects its details and pays the annual review fee.
> *If left:* Late fees apply, and investors check the company is up to date with ASIC.
> *What to do:* Find your latest annual statement in ASIC Connect, pay the fee if it is due, and add both here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.CORP.SOLVENCY_RESOLUTION — Yearly solvency resolution

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 1 Corporate | governance | tier 5, the company tells us | S2 incorporated, pre-revenue | ASIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.11”
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 5. Core set: “Annual statement reviewed, fee paid and solvency resolution passed”
- **Applies when:** yes
- **Passes when:** `attest.au_solvency_resolution` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation; The directors' minute · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s directors passed their solvency resolution**
> We don't have your confirmation that the directors resolved whether the company can pay its debts, within 2 months after its review date.
> *Why it matters:* Unless a financial report was lodged with ASIC in the past 12 months, the directors pass this resolution each year. If it is negative, or not passed in time, ASIC is told within 7 days.
> *If left:* Directors are responsible for knowing the company can pay its debts.
> *What to do:* Pass the resolution at your next directors' meeting, keep the minute, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.CORP.ASIC_CHANGES — Changes to officeholders and addresses notified to ASIC — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 1 Corporate | filings | tier 5, the company tells us | S2 incorporated, pre-revenue | ASIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.1 Layer 1: “AU-1.13”
- **Applies when:** yes
- **Passes when:** `attest.au_asic_changes` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s changes are notified to ASIC**
> We don't have your confirmation that every change to directors, secretaries and addresses has been notified to ASIC.
> *Why it matters:* ASIC's record is what banks and investors rely on to see who runs the company.
> *If left:* A person who left can still appear to act for the company.
> *What to do:* Compare your ASIC extract with how the company is run today, notify anything missing, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 3: Compliance and regulatory (3)

### AU.DP.PRIVACY_ACT_COVERAGE — Whether the Privacy Act covers the company

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | privacy | tier 5, the company tells us | S2 incorporated, pre-revenue | OAIC |

- **Law cited:** Privacy Act 1988
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.3 Layer 3: “AU-3.01”
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 5. Core set: “Privacy Act coverage decided”
- **Applies when:** `derived.personal_data` is yes
- **Passes when:** any of: (`derived.au.privacy_act` is yes) or (`derived.au.privacy_act` is no)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your answer · **Fix type:** answer · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't told us whether Australia's Privacy Act covers {company}**
> We don't know yet whether the Privacy Act applies to the company.
> *Why it matters:* Most small businesses with annual turnover of A$3 million or less are outside it, unless an exception applies, such as a health service, trading in personal information, or being related to a covered business.
> *If left:* If it does apply, you have duties you may not know about, such as a privacy policy and reporting data breaches.
> *What to do:* Check the OAIC's small business guidance, then answer the question about the Privacy Act in your answers.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.DP.AUTOMATED_DECISIONS — Automated decisions explained in the privacy policy — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | ai_governance | tier 1, official source, read live | S3 revenue, pre-raise | OAIC |

- **Law cited:** Privacy Act 1988, APP 1.7 to 1.9
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.3 Layer 3: “AU-3.03”
- **Applies when:** all of: (`derived.au.privacy_act` is yes) and (any of: (`derived.uses_ai` is yes) or (`derived.automated_decisions` is yes))
- **Passes when:** any of: (`web.policy.ai_disclosure_found` is yes) or (`attest.au_adm_transparency` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **In force:** 2026-12-10 to no end date
- **Evidence:** Your privacy policy; Your confirmation · **Fix type:** fix_website · **Penalty if left:** none

**What the company reads when it fails:**

> **{company}'s privacy policy may not say where software makes decisions about people**
> We couldn't find where your privacy policy says that a computer program makes, or helps make, decisions that affect people.
> *Why it matters:* From 10 December 2026, a covered business whose software makes decisions that significantly affect people, using their personal information, says so in its privacy policy.
> *If left:* People and the regulator will read your privacy policy for it.
> *What to do:* Add a section to your privacy policy on the decisions your software makes, or confirm here that none of them significantly affect people.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.TAX.GST — GST registration

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 3 Compliance and regulatory | tax | tier 1, official source, read live | S3 revenue, pre-raise | Australian Taxation Office |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.3 Layer 3: “AU-3.05”
- **Applies when:** yes
- **Passes when:** any of: (`registry.au.abr.gst_registered` is yes) or (`attest.au_gst_below_threshold` is yes)
- **“To check” when:** `registry.au.abr.gst_registered` is no
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Numbers for you to confirm:** threshold_aud = 75000; days_to_register = 21
- **Abroad:** never follows the company into another country
- **Evidence:** ABN Lookup record; Your confirmation · **Fix type:** register · **Penalty if left:** none

**What the company reads when it fails:**

> **{company} isn't registered for GST**
> ABN Lookup shows no GST registration for {company}, and you haven't confirmed its GST turnover is below the threshold.
> *Why it matters:* A business registers for GST within 21 days of its GST turnover reaching A$75,000, now or projected.
> *If left:* Registering late can mean paying GST you never charged your customers.
> *What to do:* If your turnover is below A$75,000, confirm that here. If not, register for GST through the Australian Business Register.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 4: Commercial (1)

### AU.COM.SPAM — Consent and unsubscribe for marketing messages

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 4 Commercial | marketing | tier 5, the company tells us | S3 revenue, pre-raise | ACMA |

- **Law cited:** Spam Act 2003
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.4 Layer 4: “AU-4.03”
- **Applies when:** `derived.sends_marketing` is yes
- **Passes when:** `attest.au_spam_act` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none

**What the company reads when it fails:**

> **You haven't confirmed {company}'s marketing messages meet the spam rules**
> We don't have your confirmation that every marketing email and SMS has consent, names the sender and has a working unsubscribe.
> *Why it matters:* Each commercial email or SMS needs consent you can show, clear sender details and a free unsubscribe that works for at least 30 days and is honoured within 5 business days.
> *If left:* People who didn't agree to your messages can complain to the ACMA.
> *What to do:* Check how you collect consent and how unsubscribes are handled, keep records, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Layer 5: Fundraising (2)

### AU.EQUITY.SHARE_ISSUE_NOTICE — Share issues notified to ASIC

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| high | 5 Fundraising | shareholders | tier 4, a document the company uploads | S4 raising | ASIC |

- **Law cited:** none (the rule cites only its map line)
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.5 Layer 5: “AU-5.01”
- **Applies when:** `derived.invested` is yes
- **Passes when:** any of: (`vault.au_form_484.present` is yes) or (`vault.au_asic_extract.present` is yes)
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Form 484 lodgement receipt; ASIC company extract · **Fix type:** file · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **We can't see that {company}'s new shares were notified to ASIC**
> You haven't added the Form 484 receipt for your share issue, or an ASIC extract showing the shares after the round.
> *Why it matters:* Every share issue is notified to ASIC within 28 days on Form 484. Late notice costs a fee.
> *If left:* Investors check ASIC's record matches the shares they paid for.
> *What to do:* Lodge Form 484 through ASIC Connect if you haven't, and add the receipt or a new extract here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

### AU.FUND.OFFER_EXEMPTION — Exemption relied on when raising without a prospectus — **can only say “to check”** (built on an unconfirmed map line)

| Severity | Layer | Area | Checked by | Applies from | Regulator |
|---|---|---|---|---|---|
| medium | 5 Fundraising | fundraising | tier 5, the company tells us | S4 raising | — |

- **Law cited:** Corporations Act 2001, s 708
- **Encoded from:** `docs/knowledge/vero-scan-australia-rule-pack-map.md`, 3.5 Layer 5: “AU-5.02”
- **Applies when:** `derived.invested` is yes
- **Passes when:** `attest.au_s708_exemption` is yes
- **Otherwise:** a gap. A fact we don't have makes the rule “to check”, never a gap.
- **Evidence:** Your confirmation · **Fix type:** attest · **Penalty if left:** none, matters for fundraising

**What the company reads when it fails:**

> **You haven't told us which exemption {company} relied on to raise money**
> We don't have your confirmation of the exemption that let the company raise money without a prospectus.
> *Why it matters:* Raising money from investors needs a disclosure document unless an exemption applies, such as small personal offers or offers to sophisticated or professional investors.
> *If left:* Investors and their advisers will ask which exemption each round relied on.
> *What to do:* Write down which exemption each round used, with the number of investors and the amount, then confirm here.

Decision (record it in `decisions.csv`): Approve · Amend · Strike

## Documents this pack asks for (3)

| Slot | What | Why we ask | Checked by | Expires | Rules |
|---|---|---|---|---|---|
| `au_asic_extract` | Current ASIC company extract | ABN Lookup is the tax register, not ASIC's. A recent ASIC extract shows the company's status, office, officeholders and members. | tier 4 | no | AU.CORP.ASIC_REGISTRATION, AU.CORP.REGISTERED_OFFICE, AU.EQUITY.SHARE_ISSUE_NOTICE |
| `au_annual_statement` | ASIC annual statement and review fee receipt | It shows the company checked its details at its review date and paid the yearly fee. | tier 4 | no | AU.CORP.ANNUAL_REVIEW |
| `au_form_484` | Form 484 lodgement receipt | It shows each new share issue was notified to ASIC. | tier 4 | no | AU.EQUITY.SHARE_ISSUE_NOTICE |
