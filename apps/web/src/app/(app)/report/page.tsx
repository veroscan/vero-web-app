'use client';

import '@/app/styles/pages/report.css';
import type { Company, CompanyRecordsResponse, IssueSummary, OverviewResponse, ProjectionResponse } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, type CSSProperties, type ReactNode } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { Atmos, CountUp, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { PublicBar } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { reportPackWords } from '@/lib/desk';
import { entitlementsOf } from '@/lib/entitlements';
import { coverageWords, HELD_WORDS, longDate, scoreLevel, scoreWords, sentence } from '@/lib/format';
import { pointsLabel } from '@/lib/issues';
import { countryLong, sourceWords } from '@/lib/records';
import { useResource } from '@/lib/useResource';
import { scoreSentence, statusTone } from '@/lib/words';

const TOP_FIXES = 5;
const TONE_COLOUR: Readonly<Record<string, string>> = { good: 'var(--good)', watch: 'var(--warn)', risk: 'var(--urgent)', none: 'var(--ink-3)' };

interface Loaded {
  overview: OverviewResponse;
  issues: IssueSummary[];
  projection: ProjectionResponse | null;
  records: CompanyRecordsResponse[];
}

/** What the report says about how it knows each company's facts, in the API's own words. */
function companyFact(company: Company, records: CompanyRecordsResponse | undefined): string {
  if (!records) return "We couldn't load how we know this.";
  const first = records.items.find((item) => item.key === 'good_standing' || item.key.endsWith('.status'));
  if (first) {
    const when = first.retrievedAt ? `on ${longDate(first.retrievedAt)}` : '';
    const words = sourceWords(first, new Date(0)).replace(/\btoday\b/, when);
    return `${first.label}: ${sentence(first.value)}. ${words}.`;
  }
  const down = records.sources.find((source) => source.down);
  if (down) return `We couldn't reach ${down.sourceName}.`;
  return `No check has given us a record for ${company.legalName} yet.`;
}

function subtitle(root: Company, related: Company[]): string {
  if (related.length === 0) return `Company health report, ${countryLong(root.incorporationCountry)}`;
  const places = [...new Set(related.map((company) => countryLong(company.incorporationCountry)))];
  return `Company health report, with its companies in ${places.length === 1 ? places[0] : `${places.slice(0, -1).join(', ')} and ${places[places.length - 1]}`}`;
}

/** The screen around the paper: the navy head with the print button, as on the other pages. */
function Frame({ children, head }: { children: ReactNode; head?: ReactNode }) {
  return (
    <div className="pg-report">
      <div className="rp-hero">
        <Atmos />
        <PublicBar
          right={
            <TLink className="btn btn-g" href="/badge">
              <Icon name="back" />
              Back to sharing
            </TLink>
          }
        />
        {head}
      </div>
      {children}
    </div>
  );
}

function ReportBody() {
  const session = useSession();
  const search = useSearchParams();
  const asked = search.get('company');
  const company = session.companies.find((item) => item.id === asked) ?? session.root;
  const isRoot = company?.id === session.root?.id;
  const related = isRoot ? session.related : [];
  const scope = related.length > 0 ? 'group' : 'company';
  const companyId = company?.id ?? '';
  const included = entitlementsOf(session.overview?.plan).fullReport;

  const resource = useResource<Loaded | null>(async () => {
    if (!companyId || !included) return null;
    const [overview, list] = await Promise.all([api.results.overview({ params: { companyId }, query: { scope } }), api.results.issues({ params: { companyId }, query: { scope, outcome: 'open' } })]);
    const issues = list.issues.slice(0, TOP_FIXES);
    const projection = issues.length > 0 ? await api.results.projection({ params: { companyId }, query: { scope }, body: scope === 'group' ? { fixes: issues.map((issue) => ({ companyId: issue.companyId, ruleKey: issue.ruleKey })) } : { ruleKeys: issues.map((issue) => issue.ruleKey) } }).catch(() => null) : null;
    const records = (await Promise.all([company, ...related].flatMap((item) => (item ? [api.records.get({ params: { companyId: item.id } }).catch(() => null)] : [])))).flatMap((item) => (item ? [item] : []));
    return { overview, issues, projection, records };
  }, [companyId, scope, included]);

  if (!included) {
    return (
      <Frame
        head={
          <main className="rp-head" data-testid="report-locked">
            <div className="mono kick">
              <Scramble text="Report" /> · <b>Paid plans</b>
            </div>
            <h1 className="disp">
              <Words text="The full report is part of a paid plan" />
            </h1>
            <p className="lede">It covers all six areas, the order we&apos;d fix things in, and how we know each fact. On Free, your overview shows where you stand.</p>
            <div className="acts2">
              <TLink className="btn btn-w" href="/plan">
                See the plans
              </TLink>
            </div>
          </main>
        }
      >
        {null}
      </Frame>
    );
  }
  if (resource.error && !resource.data) {
    return (
      <Frame>
        <div className="rp-state">
          <ErrorState error={resource.error} onRetry={resource.reload} />
        </div>
      </Frame>
    );
  }
  if (!resource.data || !company) {
    return (
      <Frame>
        <div className="rp-state">
          <Loading what="Getting your report" />
        </div>
      </Frame>
    );
  }

  const { overview, issues, projection, records } = resource.data;
  const dated = overview.scannedAt ? longDate(overview.scannedAt) : null;
  const level = scoreLevel(overview.score);
  const exact = overview.score.kind === 'exact' ? overview.score.value : null;
  const coverage = coverageWords(overview.coverage);
  const showSum = projection !== null && projection.projected > projection.current && !projection.heldByUrgent;

  return (
    <Frame
      head={
        <div className="rp-head" data-testid="report-tools">
          <div>
            <div className="mono kick">
              <Scramble text="Report" /> · <b><Scramble text="Dated → Printable" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text={company.legalName} />
            </h1>
            <div className="meta">
              <span>{dated ? `Checked ${dated}` : 'Not scanned yet'}</span>
              <span>Two pages</span>
              <span>Evidence and documents are never included</span>
            </div>
          </div>
          <div className="acts2">
            <button className="btn btn-w" type="button" data-testid="report-print" onClick={() => window.print()}>
              <Icon name="download" />
              Print or save as PDF
            </button>
            <p>This opens your browser&apos;s print window. To keep a file, choose Save as PDF there.</p>
          </div>
        </div>
      }
    >
      <style>{'@page{size:A4;margin:0}'}</style>
      <main className="rp-sheets" data-testid="report">
        <article className="rp" data-theme="light" data-testid="report-page-1">
          <header className="rp-band">
            <img src="/brand/wordmark-light.svg" alt="Vero" />
            <span data-testid="report-date">{dated ?? 'Not scanned yet'}</span>
          </header>
          <div className="rp-title">
            <h2>{company.legalName}</h2>
            <p>{subtitle(company, related)}</p>
          </div>
          {overview.sampleData ? (
            <p className="rp-sample" data-testid="sample-note">
              <b>Sample data.</b> This uses made-up records for testing, not a real register.
            </p>
          ) : null}
          <div className="rp-score">
            <div className="num">
              {exact !== null ? <CountUp className="pixel" value={exact} /> : <span className="pixel">{scoreWords(overview.score)}</span>}
              <span>out of 100</span>
            </div>
            <div className="say">
              <b data-testid="report-score">{scoreWords(overview.score)}</b>
              <p>{scoreSentence(overview.statusWord)}</p>
              <div className="blk" aria-hidden="true">
                {Array.from({ length: 20 }, (_, index) => (
                  <i key={index} className={`grow${index < Math.round(level / 5) ? ' on' : ''}`} style={{ '--i': index } as CSSProperties} />
                ))}
              </div>
            </div>
          </div>
          {coverage ? (
            <p className="rp-basis" data-testid="report-coverage">
              {coverage}
              {overview.heldByUrgent ? ` ${HELD_WORDS}` : ''}
            </p>
          ) : null}

          <h3 className="rp-h">The six areas</h3>
          <table className="rp-t">
            <tbody>
              {overview.areas.map((area) => (
                <tr key={area.layer} data-testid="report-area">
                  <td>
                    <b>{area.name}</b>
                    <small>{area.description}</small>
                  </td>
                  <td className="w" style={{ color: TONE_COLOUR[statusTone(area.statusWord)] }}>
                    {area.statusWord ?? 'Not scored'}
                  </td>
                  <td className="n">{area.score ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="rp-note" data-testid="report-not-advice">
            {overview.notLegalAdvice}
          </p>
          <footer className="rp-foot">
            <span>Vero</span>
            <span>Page 1 of 2</span>
          </footer>
        </article>

        <article className="rp" data-theme="light" data-testid="report-page-2">
          <header className="rp-top">
            <b>{company.legalName}</b>
            <span>{dated ?? 'Not scanned yet'}</span>
          </header>

          <section className="rp-sec">
            <h3 className="rp-h big">{issues.length === 0 ? 'Nothing is open' : `The ${issues.length === 1 ? 'one thing' : `${issues.length} things`} to do first`}</h3>
            {issues.length > 0 ? (
              <ol className="rp-acts">
                {issues.map((issue) => (
                  <li key={`${issue.companyId}-${issue.ruleKey}`} data-testid="report-fix">
                    <div>
                      <b>{issue.headline}</b>
                      <span>
                        {scope === 'group' ? `${issue.companyName.replace(/\.$/, '')}. ` : ''}
                        {issue.severityWord}.{issue.dueOn ? ` Due ${longDate(issue.dueOn)}.` : ''}
                      </span>
                    </div>
                    <i>{pointsLabel(issue) ?? ''}</i>
                  </li>
                ))}
              </ol>
            ) : null}
            {showSum ? (
              <p className="rp-sum" data-testid="report-sum">
                {issues.length === 1 ? 'This would take' : 'Together, these would take'} the score from {projection.current} to about {projection.projected}.
              </p>
            ) : null}
          </section>

          <section className="rp-sec">
            <h3 className="rp-h big">How we know</h3>
            <p className="rp-lede">Where this report&apos;s facts and method came from.</p>
            <table className="rp-t how">
              <tbody>
                {[company, ...related].map((item) => (
                  <tr key={item.id} data-testid="report-how">
                    <th scope="row">{item.legalName}</th>
                    <td>{companyFact(item, records.find((record) => record.companyId === item.id))}</td>
                  </tr>
                ))}
                {overview.sourcesDown.length > 0 ? (
                  <tr data-testid="report-down">
                    <th scope="row">Sources that were down</th>
                    <td>{[...new Set(overview.sourcesDown.map((source) => source.sourceName))].join(', ')}. They don&apos;t count for or against the score.</td>
                  </tr>
                ) : null}
                <tr>
                  <th scope="row">Scoring method</th>
                  <td data-testid="report-method">{overview.methodVersion ? `Version ${overview.methodVersion}` : 'Not recorded'}</td>
                </tr>
                <tr>
                  <th scope="row">Rule packs</th>
                  <td data-testid="report-packs">{overview.rulePacks.length > 0 ? `${overview.rulePacks.map(reportPackWords).join('. ')}.` : 'Not recorded'}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <p className="rp-note">
            <b>{overview.notLegalAdvice}</b>
            {dated ? ` It shows only what had been checked on ${dated}.` : ''}
          </p>
          <footer className="rp-foot">
            <span>Vero</span>
            <span>Page 2 of 2</span>
          </footer>
        </article>
      </main>
    </Frame>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<Loading what="Getting your report" />}>
      <ReportBody />
    </Suspense>
  );
}
