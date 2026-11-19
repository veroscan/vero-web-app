import type { Logic } from '../logic.js';
import { all, any, eq, held, MAPS, no, not, packBuilder, told, yes } from './helper.js';

/**
 * Australia (proprietary company limited by shares). Draft, version 0.1.0: every rule waits for
 * an Australian lawyer. Encoded from docs/knowledge/vero-scan-australia-rule-pack-map.md; the
 * items left out, and why, are listed at the end of that map ("Not encoded"). A rule citing a
 * [verify] line is needs_review, so it can only ever say "a person needs to check this".
 *
 * ABN Lookup is the tax register, not ASIC's company register: an ABN's status is never read as
 * the company's status. ASIC registration is shown by a current company extract.
 */
const b = packBuilder('AU', MAPS.australia, { name: 'Australia', version: '0.1.0' });

const R = 'registry.au.abr';
const ASIC = 'ASIC';
const PD = yes('derived.personal_data');
const PRIVACY_ACT = yes('derived.au.privacy_act');
const INVESTED = yes('derived.invested');
const MARKETING = yes('derived.sends_marketing');
const L1 = '3.1 Layer 1';
const L3 = '3.3 Layer 3';
const L4 = '3.4 Layer 4';
const L5 = '3.5 Layer 5';
const CORE = '5. Core set';

const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
const ABN_STATUS = `${R}.abn_status`;

const EXTRACT = {
  id: 'au_asic_extract', label: 'Current ASIC company extract', tier: 4 as const,
  reason: "ABN Lookup is the tax register, not ASIC's. A recent ASIC extract shows the company's status, office, officeholders and members.",
};

// --- Layer 1: company foundations -------------------------------------------------------------

b.rule({
  id: 'AU.CORP.ASIC_REGISTRATION', layer: 1, area: 'standing', stage: 2, title: 'Company registered with ASIC', sev: 'high', tier: 4, regulator: ASIC,
  src: [[L1, 'AU-1.01'], [CORE, 'Registered with ASIC']],
  sat: held(EXTRACT.id), evidence: ['ASIC company extract'], action: 'upload', slot: EXTRACT,
  text: [
    "We can't see {company}'s ASIC registration",
    "You haven't added a current ASIC company extract, and ABN Lookup can't tell us whether the company is registered with ASIC.",
    'The extract is the record of the company itself: its status, registered office, directors and members.',
    "It's the first thing a bank, investor or buyer asks for.",
    'Download a current company extract from ASIC Connect and add it here.',
  ],
});
b.rule({
  id: 'AU.TAX.ABN', layer: 1, area: 'tax', stage: 2, title: 'ABN active', sev: 'high', tier: 1, regulator: 'Australian Business Register',
  src: [[L1, 'AU-1.02'], [CORE, 'ABN active']],
  sat: eq(ABN_STATUS, 'active'),
  // ABN Lookup's own word for a cancelled ABN. This is the tax registration, not the company.
  defect: all(yes(`${R}.identified`), eq(ABN_STATUS, 'cancelled')),
  verify: all(yes(`${R}.identified`), not(oneOf(ABN_STATUS, ['active', 'cancelled']))),
  evidence: ['ABN Lookup record'], action: 'register',
  text: [
    "{company}'s ABN doesn't show as active",
    "ABN Lookup shows {company}'s Australian Business Number as cancelled. This is the tax registration, not the company's registration with ASIC.",
    'Customers, banks and the tax office use the ABN to deal with the business, and GST registration needs one.',
    'Without an active ABN, the company cannot be registered for GST.',
    'Check the ABN on ABN Lookup and apply to reactivate it, or for a new one, through the Australian Business Register.',
  ],
});
b.rule({
  id: 'AU.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office in Australia', sev: 'medium', tier: 4, regulator: ASIC,
  src: [[L1, 'AU-1.04'], [CORE, 'Registered office in Australia and a resident director']],
  sat: any(held(EXTRACT.id), told('au_office_consent')), evidence: ['ASIC company extract', 'Your confirmation'], action: 'upload', slot: EXTRACT,
  text: [
    "We can't see {company}'s registered office",
    "You haven't added an ASIC extract or confirmed the registered office. ABN Lookup only shows where the business trades, for tax.",
    "The registered office is a street address in Australia, not a PO box. If it is someone else's address, they have to agree to it.",
    'Official notices and legal papers are sent there.',
    'Add a current ASIC extract, or confirm the registered office is a street address in Australia used with the occupier\'s consent.',
  ],
});
b.rule({
  id: 'AU.CORP.RESIDENT_DIRECTOR', layer: 1, area: 'officers', stage: 2, title: 'A director living in Australia', sev: 'high', tier: 5, regulator: ASIC,
  src: [[L1, 'AU-1.05'], [CORE, 'Registered office in Australia and a resident director']],
  sat: told('au_resident_director'), evidence: ['Your confirmation', 'ASIC company extract'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a director living in Australia",
    "We don't have your confirmation that at least one director ordinarily lives in Australia. We don't keep people's details, so we can't check.",
    'A proprietary company needs at least one director who ordinarily lives in Australia.',
    'Without one, the company is not set up the way ASIC requires.',
    'Check your directors on your ASIC extract, then confirm here.',
  ],
});
b.rule({
  id: 'AU.CORP.SECRETARY', layer: 1, area: 'officers', stage: 2, title: 'Company secretary, if appointed, living in Australia', sev: 'low', tier: 5, regulator: ASIC,
  src: [[L1, 'AU-1.06']],
  sat: told('au_secretary'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't told us about {company}'s company secretary",
    "We don't have your confirmation that the company has no secretary, or that at least one secretary ordinarily lives in Australia.",
    "A proprietary company doesn't have to appoint a secretary. If it does, at least one must ordinarily live in Australia.",
    'A secretary who lives abroad on their own does not meet the rule.',
    'Check your officeholders on your ASIC extract, then confirm here.',
  ],
});
b.rule({
  id: 'AU.CORP.DIRECTOR_IDS', layer: 1, area: 'officers', stage: 2, title: 'Director identification numbers', sev: 'high', tier: 5, regulator: 'Australian Business Registry Services',
  src: [[L1, 'AU-1.07'], [CORE, 'Director IDs held by every director']],
  sat: told('au_director_ids'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed each of {company}'s directors has a director ID",
    "We don't have your confirmation that every director holds a director identification number. The numbers aren't public, and we don't need to see them.",
    'Every director needs a director ID, applied for before they are appointed. Only the director can apply.',
    'Applying late is a criminal offence for the director.',
    'Ask each director to check they have their director ID through ABRS, then confirm here.',
  ],
});
b.rule({
  id: 'AU.CORP.ANNUAL_REVIEW', layer: 1, area: 'filings', stage: 2, title: 'Annual review with ASIC', sev: 'high', tier: 4, regulator: ASIC, penalty: 'moderate',
  src: [[L1, 'AU-1.10'], [CORE, 'Annual statement reviewed, fee paid and solvency resolution passed']],
  sat: held('au_annual_statement'), evidence: ['ASIC annual statement and fee receipt'], action: 'pay',
  slot: { id: 'au_annual_statement', label: 'ASIC annual statement and review fee receipt', reason: 'It shows the company checked its details at its review date and paid the yearly fee.', tier: 4 },
  text: [
    "We can't see {company}'s latest annual review",
    "You haven't added the latest ASIC annual statement and the receipt for the review fee.",
    'Each year at its review date ASIC sends the company a statement. The company checks and corrects its details and pays the annual review fee.',
    'Late fees apply, and investors check the company is up to date with ASIC.',
    'Find your latest annual statement in ASIC Connect, pay the fee if it is due, and add both here.',
  ],
});
b.rule({
  id: 'AU.CORP.SOLVENCY_RESOLUTION', layer: 1, area: 'governance', stage: 2, title: 'Yearly solvency resolution', sev: 'high', tier: 5, regulator: ASIC,
  src: [[L1, 'AU-1.11'], [CORE, 'Annual statement reviewed, fee paid and solvency resolution passed']],
  sat: told('au_solvency_resolution'), evidence: ['Your confirmation', 'The directors\' minute'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s directors passed their solvency resolution",
    "We don't have your confirmation that the directors resolved whether the company can pay its debts, within 2 months after its review date.",
    'Unless a financial report was lodged with ASIC in the past 12 months, the directors pass this resolution each year. If it is negative, or not passed in time, ASIC is told within 7 days.',
    'Directors are responsible for knowing the company can pay its debts.',
    'Pass the resolution at your next directors\' meeting, keep the minute, then confirm here.',
  ],
});
b.rule({
  id: 'AU.CORP.ASIC_CHANGES', layer: 1, area: 'filings', stage: 2, title: 'Changes to officeholders and addresses notified to ASIC', sev: 'medium', tier: 5, regulator: ASIC, review: true,
  src: [[L1, 'AU-1.13']],
  sat: told('au_asic_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s changes are notified to ASIC",
    "We don't have your confirmation that every change to directors, secretaries and addresses has been notified to ASIC.",
    "ASIC's record is what banks and investors rely on to see who runs the company.",
    'A person who left can still appear to act for the company.',
    'Compare your ASIC extract with how the company is run today, notify anything missing, then confirm here.',
  ],
});

// --- Layer 3: compliance ----------------------------------------------------------------------

b.rule({
  id: 'AU.DP.PRIVACY_ACT_COVERAGE', layer: 3, area: 'privacy', stage: 2, title: 'Whether the Privacy Act covers the company', sev: 'medium', tier: 5, when: PD,
  src: [[L3, 'AU-3.01'], [CORE, 'Privacy Act coverage decided']],
  law: [['Privacy Act 1988']], regulator: 'OAIC',
  // Decided either way is a pass: "not sure" stays unknown, so it is never marked down.
  sat: any(yes('derived.au.privacy_act'), no('derived.au.privacy_act')), evidence: ['Your answer'], action: 'answer',
  text: [
    "You haven't told us whether Australia's Privacy Act covers {company}",
    "We don't know yet whether the Privacy Act applies to the company.",
    'Most small businesses with annual turnover of A$3 million or less are outside it, unless an exception applies, such as a health service, trading in personal information, or being related to a covered business.',
    'If it does apply, you have duties you may not know about, such as a privacy policy and reporting data breaches.',
    'Check the OAIC\'s small business guidance, then answer the question about the Privacy Act in your answers.',
  ],
});
b.rule({
  id: 'AU.DP.AUTOMATED_DECISIONS', layer: 3, area: 'ai_governance', stage: 3, title: 'Automated decisions explained in the privacy policy', sev: 'medium', tier: 1, review: true,
  from: '2026-12-10', when: all(PRIVACY_ACT, any(yes('derived.uses_ai'), yes('derived.automated_decisions'))),
  src: [[L3, 'AU-3.03']],
  law: [['Privacy Act 1988', 'APP 1.7 to 1.9']], regulator: 'OAIC',
  sat: any(yes('web.policy.ai_disclosure_found'), told('au_adm_transparency')), evidence: ['Your privacy policy', 'Your confirmation'], action: 'fix_website',
  text: [
    "{company}'s privacy policy may not say where software makes decisions about people",
    "We couldn't find where your privacy policy says that a computer program makes, or helps make, decisions that affect people.",
    'From 10 December 2026, a covered business whose software makes decisions that significantly affect people, using their personal information, says so in its privacy policy.',
    'People and the regulator will read your privacy policy for it.',
    'Add a section to your privacy policy on the decisions your software makes, or confirm here that none of them significantly affect people.',
  ],
});

// --- Tax --------------------------------------------------------------------------------------

b.rule({
  id: 'AU.TAX.GST', layer: 3, area: 'tax', stage: 3, title: 'GST registration', sev: 'medium', tier: 1, regulator: 'Australian Taxation Office',
  src: [[L3, 'AU-3.05']], params: { threshold_aud: 75_000, days_to_register: 21 },
  sat: any(yes(`${R}.gst_registered`), told('au_gst_below_threshold')),
  // Not registered is fine below the threshold, which only the company knows.
  verify: no(`${R}.gst_registered`),
  evidence: ['ABN Lookup record', 'Your confirmation'], action: 'register',
  text: [
    "{company} isn't registered for GST",
    "ABN Lookup shows no GST registration for {company}, and you haven't confirmed its GST turnover is below the threshold.",
    'A business registers for GST within 21 days of its GST turnover reaching A$75,000, now or projected.',
    'Registering late can mean paying GST you never charged your customers.',
    'If your turnover is below A$75,000, confirm that here. If not, register for GST through the Australian Business Register.',
  ],
});

// --- Layer 4: commercial ----------------------------------------------------------------------

b.rule({
  id: 'AU.COM.SPAM', layer: 4, area: 'marketing', stage: 3, title: 'Consent and unsubscribe for marketing messages', sev: 'medium', tier: 5, when: MARKETING,
  src: [[L4, 'AU-4.03']],
  law: [['Spam Act 2003']], regulator: 'ACMA',
  sat: told('au_spam_act'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s marketing messages meet the spam rules",
    "We don't have your confirmation that every marketing email and SMS has consent, names the sender and has a working unsubscribe.",
    'Each commercial email or SMS needs consent you can show, clear sender details and a free unsubscribe that works for at least 30 days and is honoured within 5 business days.',
    "People who didn't agree to your messages can complain to the ACMA.",
    'Check how you collect consent and how unsubscribes are handled, keep records, then confirm here.',
  ],
});

// --- Layer 5: fundraising ---------------------------------------------------------------------

b.rule({
  id: 'AU.EQUITY.SHARE_ISSUE_NOTICE', layer: 5, area: 'shareholders', stage: 4, title: 'Share issues notified to ASIC', sev: 'high', tier: 4, regulator: ASIC, when: INVESTED,
  src: [[L5, 'AU-5.01']],
  sat: any(held('au_form_484'), held(EXTRACT.id)), evidence: ['Form 484 lodgement receipt', 'ASIC company extract'], action: 'file',
  slot: [{ id: 'au_form_484', label: 'Form 484 lodgement receipt', reason: 'It shows each new share issue was notified to ASIC.', tier: 4 }, EXTRACT],
  text: [
    "We can't see that {company}'s new shares were notified to ASIC",
    "You haven't added the Form 484 receipt for your share issue, or an ASIC extract showing the shares after the round.",
    'Every share issue is notified to ASIC within 28 days on Form 484. Late notice costs a fee.',
    "Investors check ASIC's record matches the shares they paid for.",
    'Lodge Form 484 through ASIC Connect if you haven\'t, and add the receipt or a new extract here.',
  ],
});
b.rule({
  id: 'AU.FUND.OFFER_EXEMPTION', layer: 5, area: 'fundraising', stage: 4, title: 'Exemption relied on when raising without a prospectus', sev: 'medium', tier: 5, review: true, when: INVESTED,
  src: [[L5, 'AU-5.02']],
  law: [['Corporations Act 2001', 's 708']],
  sat: told('au_s708_exemption'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't told us which exemption {company} relied on to raise money",
    "We don't have your confirmation of the exemption that let the company raise money without a prospectus.",
    'Raising money from investors needs a disclosure document unless an exemption applies, such as small personal offers or offers to sophisticated or professional investors.',
    'Investors and their advisers will ask which exemption each round relied on.',
    'Write down which exemption each round used, with the number of investors and the amount, then confirm here.',
  ],
});

export const au = b.build();
