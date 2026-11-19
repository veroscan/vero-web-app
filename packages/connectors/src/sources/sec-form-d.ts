import { XMLParser } from 'fast-xml-parser';
import { defineConnector, type Http } from '../runtime.js';
import { asArray, asRecord, asString, normaliseName } from '../text.js';
import type { CompanyRef, Connector, ConnectorDeps, Fact } from '../types.js';

/**
 * us.sec_form_d: Form D filings from SEC EDGAR.
 *
 * Confirmed on 5 Nov 2026: data.sec.gov/submissions/CIK##########.json from the
 * SEC's API page. 10 requests a second and a declared User-Agent ("Company Name
 * admin@company.example") from its Accessing EDGAR Data page. The primary_doc.xml
 * element names come from a real filing fetched that day (schema X0708).
 *
 * Finding the CIK by name. Checked again on 12 Nov 2026: neither the SEC's
 * "Accessing EDGAR Data" page nor its Company Search page documents a programmatic
 * name search or its response shape. The documented routes are company_tickers.json
 * (listed companies only, so almost no Form D filers) and cik-lookup-data.txt (a
 * 13 MB file of every name and CIK, whose line format that page doesn't describe).
 * So we use the Company Search form's own query (browse-edgar, action=getcompany,
 * type=D, output=atom), whose response shape we COULD NOT CONFIRM from official
 * documentation. It matches by prefix, so we confirm every candidate's name against
 * its submissions file (a documented API) and never take a CIK on the search alone.
 * A CIK we confirmed is published as `cik`, so the next scan skips the search. Its title and name attributes were garbled when we called it,
 * so we only read the CIKs from it. We filter out pooled funds, which are SPVs and
 * feeder funds. People named on the form aren't read at all.
 */

const P = 'registry.us.sec_form_d';
const SEARCH = 'https://www.sec.gov/cgi-bin/browse-edgar';
const MAX_CANDIDATES = 8;

const xml = new XMLParser({ ignoreAttributes: true, parseTagValue: false, trimValues: true, processEntities: true });

export function parseSearchAtom(text: string): string[] {
  const doc = asRecord(xml.parse(text));
  const feed = asRecord(doc['feed']);
  const found = new Set<string>();
  // One match gives a company-info block on the feed. Several give one per entry.
  const direct = asString(asRecord(feed['company-info'])['cik']);
  if (direct) found.add(direct);
  for (const entry of asArray(feed['entry'])) {
    const record = asRecord(entry);
    const fromContent = asString(asRecord(asRecord(record['content'])['company-info'])['cik']);
    if (fromContent) found.add(fromContent);
    const fromFiling = /CIK=(\d{10})/.exec(asString(asRecord(record['link'])['href']) ?? '');
    if (fromFiling && !fromContent) found.add(fromFiling[1] as string);
  }
  return [...found];
}

export interface FormDFiling { accession: string; filedOn: string; primaryDocument: string; form: string }

export function parseSubmissions(raw: unknown): { name: string; filings: FormDFiling[] } {
  const record = asRecord(raw);
  const recent = asRecord(asRecord(record['filings'])['recent']);
  const forms = asArray(recent['form']);
  const filings: FormDFiling[] = [];
  forms.forEach((form, i) => {
    if (form !== 'D' && form !== 'D/A') return;
    filings.push({
      form: String(form),
      accession: asString(asArray(recent['accessionNumber'])[i]) ?? '',
      filedOn: asString(asArray(recent['filingDate'])[i]) ?? '',
      primaryDocument: asString(asArray(recent['primaryDocument'])[i]) ?? 'primary_doc.xml',
    });
  });
  filings.sort((a, b) => b.filedOn.localeCompare(a.filedOn));
  return { name: asString(record['name']) ?? '', filings };
}

export interface FormDDocument {
  entityName: string | undefined;
  entityType: string | undefined;
  jurisdictionOfInc: string | undefined;
  pooledFund: boolean;
  totalOfferingAmount: string | undefined;
  totalAmountSold: string | undefined;
  firstSaleOn: string | undefined;
  revenueRange: string | undefined;
}

export function parseFormD(text: string): FormDDocument {
  const submission = asRecord(asRecord(xml.parse(text))['edgarSubmission']);
  const issuer = asRecord(submission['primaryIssuer']);
  const offering = asRecord(submission['offeringData']);
  const amounts = asRecord(offering['offeringSalesAmounts']);
  const securities = asRecord(offering['typesOfSecuritiesOffered']);
  const industry = asRecord(asRecord(offering['industryGroup'])['investmentFundInfo']);
  return {
    entityName: asString(issuer['entityName']),
    entityType: asString(issuer['entityType']),
    jurisdictionOfInc: asString(issuer['jurisdictionOfInc']),
    pooledFund: asString(securities['isPooledInvestmentFundType']) === 'true' || asString(industry['investmentFundType']) !== undefined,
    totalOfferingAmount: asString(amounts['totalOfferingAmount']),
    totalAmountSold: asString(amounts['totalAmountSold']),
    firstSaleOn: asString(asRecord(asRecord(offering['typeOfFiling'])['dateOfFirstSale'])['value']),
    revenueRange: asString(asRecord(offering['issuerSize'])['revenueRange']),
  };
}

function cikPath(cik: string): string {
  return `CIK${cik.replace(/\D/g, '').padStart(10, '0')}`;
}

async function candidateCiks(ref: CompanyRef, http: Http, headers: Record<string, string>): Promise<{ ciks: string[]; raw: string }> {
  if (ref.cik) return { ciks: [ref.cik], raw: '' };
  const url = `${SEARCH}?action=getcompany&company=${encodeURIComponent(ref.name)}&type=D&output=atom&count=40`;
  const response = await http(url, { headers });
  if (response.status === 404) return { ciks: [], raw: response.text };
  return { ciks: parseSearchAtom(response.text).slice(0, MAX_CANDIDATES), raw: response.text };
}

export function createSecFormDConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'us.sec_form_d',
    jurisdictions: ['US', 'US-DE'],
    capabilities: ['fundraising'],
    factPrefix: P,
    sourceName: 'SEC EDGAR',
    method: 'official_live',
    homeUrl: 'https://www.sec.gov/edgar',
    requiredEnv: ['SEC_USER_AGENT'],
    rateLimit: { requests: 10, perMs: 1000 },
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { 'User-Agent': env['SEC_USER_AGENT'] as string, Accept: 'application/json, application/atom+xml, application/xml' };
      const notFound = { status: 'not_found' as const, sourceUrl: SEARCH, facts: [{ key: `${P}.filed`, value: false }, { key: `${P}.filing_count`, value: 0 }], message: "We didn't find a Form D under this name. Not every round needs one, and the filing may be under another name." };

      const { ciks, raw: searchRaw } = await candidateCiks(ref, http, headers);
      if (ciks.length === 0) return { ...notFound, raw: searchRaw };

      const wanted = normaliseName(ref.name);
      const matches: { cik: string; name: string; filings: FormDFiling[]; raw: string; url: string }[] = [];
      for (const cik of ciks) {
        const url = `https://data.sec.gov/submissions/${cikPath(cik)}.json`;
        const response = await http(url, { headers });
        if (response.status === 404) continue;
        const parsed = parseSubmissions(response.json());
        if (ref.cik || normaliseName(parsed.name) === wanted) matches.push({ cik, ...parsed, raw: response.text, url });
      }
      if (matches.length === 0) return { ...notFound, raw: searchRaw };
      if (matches.length > 1) {
        return { status: 'ambiguous', sourceUrl: SEARCH, matchConfidence: 0.5, message: 'More than one SEC filer has this name.', candidates: matches.map((m) => ({ name: m.name, identifier: m.cik })) };
      }

      const match = matches[0] as (typeof matches)[number];
      const documents: { filing: FormDFiling; doc: FormDDocument; raw: string; url: string }[] = [];
      for (const filing of match.filings) {
        const accession = filing.accession.replace(/-/g, '');
        const cikNumber = match.cik.replace(/\D/g, '').replace(/^0+/, '');
        const file = filing.primaryDocument.endsWith('.xml') ? filing.primaryDocument.split('/').pop() : 'primary_doc.xml';
        const url = `https://www.sec.gov/Archives/edgar/data/${cikNumber}/${accession}/${file}`;
        const response = await http(url, { headers });
        if (response.status === 404) continue;
        documents.push({ filing, doc: parseFormD(response.text), raw: response.text, url });
        // Filings are newest first, and the amounts we show come from the newest one.
        if (documents.length === 3) break;
      }

      const issuerFilings = documents.filter((d) => !d.doc.pooledFund);
      const latest = issuerFilings[0];
      if (!latest) return { ...notFound, sourceUrl: match.url, raw: match.raw };
      const facts: Fact[] = [
        { key: `${P}.filed`, value: true },
        { key: `${P}.cik`, value: match.cik.replace(/\D/g, '').padStart(10, '0') },
        { key: `${P}.filing_count`, value: match.filings.length },
        { key: `${P}.latest_filed_on`, value: latest.filing.filedOn },
      ];
      const optional: [string, string | undefined][] = [
        ['total_offering_amount', latest.doc.totalOfferingAmount],
        ['total_amount_sold', latest.doc.totalAmountSold],
        ['first_sale_on', latest.doc.firstSaleOn],
        ['revenue_range', latest.doc.revenueRange],
      ];
      for (const [key, value] of optional) if (value !== undefined) facts.push({ key: `${P}.${key}`, value });
      return { status: 'found', sourceUrl: latest.url, raw: [match.raw, ...documents.map((d) => d.raw)].join('\n'), facts, matchConfidence: ref.cik ? 1 : 0.9 };
    },
  }, deps);
}
