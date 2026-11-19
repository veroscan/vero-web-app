# How to review the Vero rule packs

For the reviewing lawyers at Code & Clause. Prepared 16 Nov 2026. **These rules are drafts. Nothing here is legal advice, and no rule counts as approved until a named lawyer approves its pack.**

## What you are approving

Vero scans a company and checks it against rules: "Is the company active on its register?", "Is there a privacy notice?", "Did the company file its annual accounts?". Each rule decides one of five outcomes from facts. The facts come from official registers, from the company's website, from documents it uploads, and from its own answers.

| Outcome | Meaning |
|---|---|
| Pass | The facts show the duty is met |
| Gap | The duty applies and the facts show it isn't met |
| Defect | Something exists but is wrong (for example, dissolved or overdue) |
| To check | We can't tell. A fact is missing, a source is down, or the rule is built on an unconfirmed point. It never lowers a score. |
| Not applicable | The rule doesn't apply to this company |

A missing fact always gives "to check", never a gap. A company is never marked down because a register was unavailable.

## What is in this folder

- **`README.md`**: the 22 packs (1186 rules), with their versions and fingerprints.
- **One file per pack** (for example `fr-0.2.0.md`): every rule, grouped by layer. Each rule shows:
  - its severity and how it is checked;
  - the law it cites;
  - the exact research line it was built from;
  - when it applies, passes, is a defect, or is "to check", in plain words;
  - any numbers for you to confirm;
  - the words the company reads when it fails.
- **`decisions.csv`**: one row per rule. It opens in Excel or Google Sheets. Mark each rule **approve**, **amend** (say how) or **strike**, add your name and the date, and send the file back.
- **`facts-and-thresholds.md`**: the derived facts the rules read and every threshold behind them. Please confirm each threshold.
- **The research maps** in `docs/knowledge/vero-scan-<country>-rule-pack-map.md` (in the folder we send you: `research-maps/`): what each rule was built from, with its official source and the date it was checked. The same folder holds the engine documents named below (`GLOBAL-COVERAGE`, `ENGINE-STATUS`, `NATIONAL-REGISTERS`, `FRANCE`).

These files are generated from the rule code (`npm run rules:review`), so what you read is exactly what the scan runs. A test fails if the files and the code ever disagree.

## How approval works

You approve a whole pack at one version. In the admin tool, a named person approves, for example, "FR 0.1.0" with fingerprint `2995dffd4c67…`. The fingerprint is a SHA-256 of that pack's rules.

- **If you amend or strike any rule,** we change the code, raise the pack's version and send you that pack again with its new fingerprint. An approval never covers rules that changed after it was given: the system refuses to run an approved pack whose content changed.
- **Until a pack is approved,** its rules run as drafts, and the product says the rules are not yet reviewed.

## Suggested order

| Order | Packs | Rules | Why first |
|---|---|---|---|
| 1 | International (`INTL`) | 26 | Applies to every company in every country |
| 2 | United Kingdom, Nigeria, Delaware with US federal | 376 | The first three countries, written from the source documents supplied for this project |
| 3 | France, Ireland, Netherlands, Denmark, Finland, Norway, Czechia, Poland, Germany | 591 | EU and EEA. They share the EU common rules, so read `vero-scan-eu-common-rule-pack-map.md` once first |
| 4 | Switzerland, Singapore, Australia, New Zealand, Canada | 71 | Smaller drafts |
| 5 | South Africa, Kenya, Ghana | 122 | Added 18 Nov 2026. No company register is connected in any of them, so most rules ask for documents |

## The new countries were researched, not supplied

The UK, Nigeria and Delaware maps were made from source documents supplied to us for this project. The 17 new countries had no such document. Their maps were written from official sources only: France, Norway, Finland, Denmark, the Netherlands, Ireland, Czechia, Poland, Switzerland, Singapore, Australia, New Zealand and Canada on 16 Nov 2026, and Germany, South Africa, Kenya and Ghana on 18 Nov 2026 (legislation portals, registries and regulators). Each item cites its URL and the date it was checked.

- **Unconfirmed items.** Anything the research could not confirm from an official source is marked **[verify]** in the map, and about 800 lines across the new maps carry it.
- **How the code treats them.** A [verify] item is either left out of the code, or encoded so that it can only say "to check". No unconfirmed deadline or threshold can fail a company.
- **Items left out.** Each map ends with a **"Not encoded"** section listing what was left out and why. Please read those sections too: some may be duties you want added.
- **Rules flagged "to check" only.** In the pack files these are marked **can only say "to check"**: 109 rules across all packs. For each, please either confirm the point, so the rule can pass or fail, or leave it as it is.

## Points we most need you to confirm

1. **EU AI Act timetable.** The EU map records Regulation (EU) 2026/1744 as having moved:
   - the Annex III high-risk duties to 2 Dec 2027;
   - the Annex I duties to 2 Aug 2028;
   - new Article 5 prohibitions to 2 Dec 2026.

   The EU rules use these dates, and the Article 50 transparency date is unconfirmed. See "For the lawyer: AI Act dates to check" in `docs/GLOBAL-COVERAGE.md`. Norway: we found no AI Act in Norwegian law yet, so no AI Act rule applies there.
2. **Audit exemption thresholds.**
   - Czechia rewrote its audit duty in 2026.
   - The dates from which the new Irish and Dutch exemptions apply are unclear.
   - The French figures conflict between sources.
   - Norway's revenue and balance-sheet limits are unconfirmed.
3. **Beneficial-owner registers.** Most are not open to the public (Denmark, Czechia, Norway and others), so we ask for the filing as an upload. Please confirm the filing duties and the AMLR changes from 10 Jul 2027.
4. **Switzerland.** The transparency register came into force on 1 Oct 2026. The deadline for companies formed after that date is unconfirmed.
5. **Australia.** The privacy-policy duty for automated decisions starts on 10 Dec 2026. Privacy Act coverage turns on the A$3m turnover exemption, which we ask the company to tell us.
6. **New Zealand.** Is a director ID duty in force? Does the commissioning rule in Copyright Act s 21(3) still stand?
7. **Singapore.** Is the annual return due 7 or 8 months after year end? Did ACRA's review change the audit-exemption thresholds?
8. **Canada.** The resident Canadian director rule (CBCA s 105(3)) was read in force. All provincial triggers are unconfirmed, including Quebec Law 25, consumer protection and extra-provincial registration.
9. **Corrections the research found to earlier notes.** Please confirm each:
   - Denmark's accounts are due 6 months after year end, not 5.
   - Poland's VAT exemption limit is PLN 240,000.
   - Norway's board rule is about residence (EEA, UK or Switzerland), not nationality.
   - Finland needs one EEA-resident board member and an EEA-resident managing director.
10. **Severity.** "Critical" is used only where an official register proves the problem, such as a company that is dissolved, bankrupt or deleted. Please say if any severity is wrong for its country.
11. **Representatives (added 18 Nov 2026).** New draft rules for a company outside the EU or the UK: the GDPR art 27 EU representative (`<CC>.DP.EU_REPRESENTATIVE`), the UK GDPR art 27 UK representative (`GB.DP.UK_REPRESENTATIVE`), the DSA art 13 legal representative (`<CC>.COM.DSA_REPRESENTATIVE`), and the DSA arts 11 and 12 points of contact for any platform (`<CC>.COM.DSA_POINTS_OF_CONTACT`). Each fails only when the company's answers show it applies and the website was read in a language we support. Please confirm the triggers (no office, branch or staff there; offering services there; a platform for the DSA) and that the art 27(2) exemption may be left to the company to confirm. These are why FR, FI, DK, NL, IE, CZ and PL are now 0.2.0 and GB 0.3.0.

12. **Germany, South Africa, Kenya and Ghana (added 18 Nov 2026).** Germany: the BDSG §38 DPO threshold (20 people) replaces the EU DPO rule, the age of digital consent is 16, and the Impressum (DDG §5) rides on the EU website-identity rule; the Handelsregister is read through OpenRegister, a paid provider, only ever to pass a rule. South Africa: please confirm the VAT threshold SARS applies (R2.3 million, not yet promulgated: that rule can only say "to check"), the PAIA manual duty for every private body since 1 Jan 2022, and Information Officer registration. Kenya: ODPC registration and its exemption (below KES 5 million turnover and under 10 employees, except the listed sectors). Ghana: DPC registration before processing and renewal every two years, and two directors with one resident in Ghana.

## What we are not asking you to approve

- **The scoring method.** The weights, the cap at 74 while an urgent issue is open, and the "Based on N of M checks" wording are product decisions, set by the owner.
- **The data sources themselves.** What each register returns, and what a miss there means, are in `docs/ENGINE-STATUS.md` and `docs/NATIONAL-REGISTERS.md`. Please do tell us if a rule reads a source in a way that is legally wrong. For example, a miss in the French public directory must never mean "doesn't exist".

## Sending it back

Return `decisions.csv` with your decisions. For each pack you approve, also give the name of the approving lawyer. The approval is recorded in the admin tool against that pack's version and fingerprint, with your name, and it appears in the audit log.
