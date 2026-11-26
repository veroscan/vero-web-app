'use client';

import '@/app/styles/pages/records.css';
import type { Company, CompanyRecordsResponse, IssueSummary, VaultResponse } from '@vero/shared';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Empty, ErrorState, Loading, PlanLink, SampleNote, SourcesDownNote } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero, Plain } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { CERTIFICATE_SLOT, isInPlace } from '@/lib/documents';
import { entitlementsOf, roleCan } from '@/lib/entitlements';
import { agoWords, plural } from '@/lib/format';
import { CAC_STATUS_SLOT, changedWhenWords, changeValueWords, checkedWords, countryLong, recordRows, splitStatusNote, type FactRow } from '@/lib/records';
import { useResource } from '@/lib/useResource';
import { registerFor, sourceStatus, type Tone } from '@/lib/words';

/** How long "Check again" waits with the screen open. The check carries on either way. */
const CHECK_WAIT_MS = 120_000;

const TONE_COLOUR: Readonly<Record<Tone, string | undefined>> = { good: 'var(--good)', watch: 'var(--warn)', risk: 'var(--urgent)', none: undefined };
const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const countWord = (count: number) => COUNT_WORDS[count] ?? String(count);

interface Loaded {
  records: CompanyRecordsResponse;
  issues: IssueSummary[];
  vault: VaultResponse | null;
}

interface Standing {
  word: string;
  tone: 'ok' | 'warn' | 'none';
  active: boolean;
  late: number;
  idLine: string | null;
}

/** One company's headline from its own facts: the register's status, and any filing it shows late. */
function standingOf(records: CompanyRecordsResponse): Standing {
  const rows = recordRows(records);
  const late = rows.filter((row) => row.key.endsWith('_next_due') && row.tone === 'risk').length;
  const number = rows.find((row) => row.numeric);
  const idLine = number ? `${number.label} ${number.value}` : null;
  const standing = rows.find((row) => row.key === 'good_standing');
  const status = rows.find((row) => row.key.endsWith('.status'));
  const directors = rows.find((row) => row.key.endsWith('directors_count') || row.key.endsWith('directors_active_count'));
  if (standing) {
    const good = standing.tone === 'good';
    return { word: good ? 'In good standing' : 'Needs your certificate', tone: good ? 'ok' : 'warn', active: good, late, idLine };
  }
  if (!status) return { word: rows.length > 0 ? 'No status yet' : 'Not checked yet', tone: 'none', active: false, late, idLine };
  const active = status.tone === 'good';
  let word = status.value;
  if (active && late > 0) word = `${status.value}, ${late === 1 ? 'one filing' : `${countWord(late)} filings`} late`;
  else if (active && directors) word = `${status.value}, ${plural(Number(directors.value.split(' ')[0]) || 0, 'director', 'directors')}`;
  return { word, tone: active && late === 0 ? 'ok' : 'warn', active, late, idLine };
}

function verdictOf(standings: Standing[]): string {
  const total = standings.length;
  const active = standings.filter((item) => item.active).length;
  const late = standings.reduce((sum, item) => sum + item.late, 0);
  const first =
    total === 1 ? (active === 1 ? 'The company is active.' : "The register doesn't show the company as active yet.") : active === total ? `All ${countWord(total)} companies are active.` : `${active} of ${total} companies show as active.`;
  if (late === 0) return first;
  return `${first} ${late === 1 ? 'One filing is late.' : `${countWord(late).replace(/^./, (c) => c.toUpperCase())} filings are late.`}`;
}

function RegisterArt({ tone }: { tone: Standing['tone'] }) {
  return (
    <svg viewBox="0 0 58 70" aria-hidden="true">
      <rect x="0" y="0" width="50" height="64" rx="6" fill="#fff" />
      <rect x="8" y="9" width="20" height="4" rx="2" fill="#0182FA" />
      <g fill="#C9E4F7">
        <rect x="8" y="20" width="34" height="3" rx="1.5" />
        <rect x="8" y="27" width="34" height="3" rx="1.5" />
        {tone === 'warn' ? null : <rect x="8" y="34" width="26" height="3" rx="1.5" />}
      </g>
      {tone === 'warn' ? (
        <>
          <rect x="5" y="33" width="40" height="10" rx="2" fill="#FDEFD2" />
          <rect x="8" y="36.5" width="22" height="3" rx="1.5" fill="#E89B16" />
        </>
      ) : null}
      <circle cx="15" cy="51" r="6" fill="none" stroke="#9DDAF7" strokeWidth="1.5" />
      <circle cx="15" cy="51" r="2.5" fill="#9DDAF7" />
      {tone === 'ok' ? (
        <g className="seal">
          <circle cx="48" cy="60" r="9" fill="#0E9F78" stroke="#00004A" strokeWidth="2.5" />
          <path d="M44 60.5l2.8 2.8 5.2-5.6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : tone === 'warn' ? (
        <g className="seal">
          <circle cx="48" cy="60" r="9" fill="#E89B16" stroke="#00004A" strokeWidth="2.5" />
          <path d="M48 55.5v5.5M48 64.3v.4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      ) : null}
    </svg>
  );
}

/** Where to read the record yourself. Only for registers with a public search we can point at. */
function sourceLink(records: CompanyRecordsResponse, rows: FactRow[]): string | null {
  const number = rows.find((row) => row.numeric)?.value.trim();
  if (records.country === 'GB' && number && !records.sampleData) return `https://find-and-update.company-information.service.gov.uk/company/${encodeURIComponent(number)}`;
  if (records.country === 'US-DE') return 'https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx';
  if (records.country === 'NG') return 'https://search.cac.gov.ng/';
  return null;
}

function FactLine({ row, index }: { row: FactRow; index: number }) {
  const colour = TONE_COLOUR[row.tone];
  return (
    <div className={row.needsYou ? 'needs' : undefined} data-testid="fact-row" data-key={row.key} style={{ '--r': index } as CSSProperties}>
      <dt>{row.label}</dt>
      <dd>
        <span className={row.numeric ? 'num' : undefined} style={colour ? { color: colour, fontWeight: 700 } : undefined}>
          {row.value}
        </span>
        <small data-testid="fact-source">{row.source}</small>
        {row.body ? <p className="body">{row.body}</p> : null}
        {row.links.length > 0 ? (
          <p className="links">
            {row.links.map((link) => (
              <TLink className="go" href={link.href} key={link.href}>
                {link.label}
                <Icon name="arrow" />
              </TLink>
            ))}
          </p>
        ) : null}
      </dd>
    </div>
  );
}

function CheckAgain({ companyId, onChecked }: { companyId: string; onChecked: () => Promise<void> }) {
  const toast = useToast();
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const run = async () => {
    setChecking(true);
    setProblem(null);
    try {
      let scan = await api.records.checkAgain({ params: { companyId } });
      const giveUpAt = Date.now() + CHECK_WAIT_MS;
      while ((scan.status === 'queued' || scan.status === 'running') && alive.current) {
        if (Date.now() > giveUpAt) {
          setProblem("It's still checking. Come back in a few minutes and this will have updated.");
          setChecking(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, Math.max(500, scan.pollAfterMs)));
        scan = await api.scans.get({ params: { scanId: scan.id } });
      }
      if (!alive.current) return;
      await onChecked();
      if (scan.status === 'failed') setProblem("That check didn't finish. What's below is from the last one that did.");
      else toast('Checked again just now.');
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    if (alive.current) setChecking(false);
  };

  return (
    <div className="againbox">
      <button className="btn btn-g" type="button" disabled={checking} data-testid="check-again" onClick={() => void run()}>
        <Icon name={checking ? 'refresh' : 'scan'} className={checking ? 'spin' : undefined} />
        {checking ? 'Checking' : 'Check again'}
      </button>
      {problem ? (
        <p className="againerr" role="alert" data-testid="check-again-problem">
          {problem}
        </p>
      ) : null}
    </div>
  );
}

function Band({ title, body, testId, action }: { title: string; body: string; testId: string; action: { href: string; label: string } | null }) {
  return (
    <div className="xn band" data-testid={testId}>
      <b>{title}</b>
      <span>{body}</span>
      {action ? (
        <TLink className="btn btn-p btn-sm" href={action.href}>
          <Icon name="upload" />
          {action.label}
        </TLink>
      ) : (
        <span className="locked" data-testid="records-upload-locked">
          Uploading documents is part of a paid plan. <PlanLink />
        </span>
      )}
    </div>
  );
}

function CountryBand({ records, statusReportFiled, canUpload, rows }: { records: CompanyRecordsResponse; statusReportFiled: boolean; canUpload: boolean; rows: FactRow[] }) {
  if (records.country === 'US-DE' && records.statusNote) {
    const standing = rows.find((row) => row.key === 'good_standing');
    const { title, body } = splitStatusNote(records.statusNote);
    return (
      <Band
        testId="records-delaware-note"
        title={title}
        body={body}
        action={canUpload ? { href: `/documents/add?company=${records.companyId}&slot=${CERTIFICATE_SLOT}`, label: standing?.needsYou === false ? 'Upload a new certificate' : 'Upload your certificate' } : null}
      />
    );
  }
  const status = rows.find((row) => row.key === 'registry.ng.cac.status');
  if (records.country === 'NG' && status?.value === 'Active' && !statusReportFiled) {
    return (
      <Band
        testId="records-nigeria-note"
        title={'"Active" doesn\'t always mean up to date'}
        body="The register shows your company as active, but only a CAC status report confirms your annual returns are filed. Upload yours to settle it."
        action={canUpload ? { href: `/documents/add?company=${records.companyId}&slot=${CAC_STATUS_SLOT}`, label: 'Upload a status report' } : null}
      />
    );
  }
  return null;
}

/** A row of companies in a narrow box: fades at the edge while there is more to the side. */
function useMoreToTheSide() {
  // Kept in state, not a ref: the row only exists once the records have loaded.
  const [element, box] = useState<HTMLDivElement | null>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    if (!element) return;
    const read = () => setMore(element.scrollWidth - element.clientWidth - element.scrollLeft > 8);
    read();
    element.addEventListener('scroll', read, { passive: true });
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', read);
      observer.disconnect();
    };
  }, [element]);
  return { box, more };
}

function useAllRecords(companies: Company[]) {
  return useResource(async () => {
    const answers = await Promise.all(companies.map((company) => api.records.get({ params: { companyId: company.id } }).catch(() => null)));
    return answers.filter((item): item is CompanyRecordsResponse => item !== null);
  }, [companies.map((company) => company.id).join()]);
}

/** What scans found different on the register, newest first. */
function RegisterChanges({ companyId }: { companyId: string }) {
  const resource = useResource(() => api.records.changes({ params: { companyId } }), [companyId]);
  const data = resource.data && resource.data.companyId === companyId ? resource.data : undefined;
  return (
    <Reveal as="section" className="mod" i={1} data-testid="records-changes">
      <div className="mh">
        <h2>What changed</h2>
        <span className="sub">Differences Vero found on the register, newest first</span>
      </div>
      {resource.error && !data ? (
        <ErrorState error={resource.error} onRetry={resource.reload} title="We couldn't load the changes" />
      ) : !data ? (
        <div className="chg-wrap" role="status" aria-label="Getting the changes">
          <span className="sk ln3" />
        </div>
      ) : data.changes.length === 0 ? (
        <div className="chg-empty" data-testid="records-changes-empty">
          <b>No changes since Vero started watching</b>A change shows up here when a check finds the register says something different from the check before.
        </div>
      ) : (
        <div className="chg-wrap">
          {data.sampleData ? <SampleNote /> : null}
          <ol className="chg rows-in" data-testid="records-changes-list">
            {data.changes.map((change, index) => (
              <li key={change.id} data-testid="record-change" style={{ '--r': index } as CSSProperties}>
                <div className="fld">{change.label}</div>
                <div className="mv">
                  {change.detailWithheld ? (
                    <span className="withheld">Changed. Vero records that names changed, not the names themselves.</span>
                  ) : (
                    <>
                      <span className="was">
                        <span className="sr-only">Before: </span>
                        {changeValueWords(change.oldValue, 'before')}
                      </span>
                      <Icon name="arrow" />
                      <span className="now">
                        <span className="sr-only">Now: </span>
                        {changeValueWords(change.newValue, 'after')}
                      </span>
                    </>
                  )}
                </div>
                <div className="when">
                  <time dateTime={change.changedAt} title={checkedWords(change.changedAt)}>
                    {changedWhenWords(change.changedAt)}
                  </time>
                  <small>{change.source ? `From ${change.source}` : 'Source not recorded'}</small>
                  {change.sampleData ? <small>Sample data</small> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Reveal>
  );
}

export default function CompanyRecordsPage() {
  const { id } = useParams<{ id?: string[] }>();
  if (id && id.length > 1) notFound();
  const session = useSession();
  const companyId = id?.[0] ?? session.root?.id ?? null;
  const entitlements = entitlementsOf(session.overview?.plan);
  const own = useMemo(() => session.companies.filter((company) => company.relationship !== 'follow'), [session.companies]);

  const resource = useResource<Loaded | null>(async () => {
    if (!companyId) return null;
    const records = await api.records.get({ params: { companyId } });
    // Both only add to the page: links to real issues, and whether a status report is on file.
    const [issues, vault] = await Promise.all([
      api.results.issues({ params: { companyId }, query: { scope: 'company', outcome: 'open' } }).catch(() => null),
      records.country === 'NG' ? api.vault.get({ params: { companyId } }).catch(() => null) : Promise.resolve(null),
    ]);
    return { records, issues: issues?.issues ?? [], vault };
  }, [companyId]);
  const everyone = useAllRecords(own);
  const side = useMoreToTheSide();

  const data = resource.data;
  const stale = data && data.records.companyId !== companyId;
  const rows = useMemo(() => (data ? recordRows(data.records, { issues: data.issues, canUpload: entitlements.vault }) : []), [data, entitlements.vault]);
  const all = useMemo(() => {
    // If the other companies' records can't be had, the open company still gets its headline.
    const list = everyone.data && everyone.data.length > 0 ? everyone.data : data && !stale && !everyone.loading ? [data.records] : [];
    // The open company's records are the freshest copy; the hero uses them too.
    return data && !stale ? list.map((item) => (item.companyId === data.records.companyId ? data.records : item)) : list;
  }, [everyone.data, data, stale]);

  if (resource.error && (!data || stale)) {
    return (
      <Plain>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </Plain>
    );
  }
  if (!data || stale) {
    return (
      <Plain>
        <Loading what="Getting your company records" />
      </Plain>
    );
  }

  const { records } = data;
  const canCheck = roleCan(session.me, 'scans.write') && session.companies.find((company) => company.id === records.companyId)?.relationship !== 'follow';
  const down = records.sources.filter((source) => source.down);
  const sample = records.sampleData || records.sources.some((source) => source.sampleData);
  const needYou = rows.filter((row) => row.needsYou).length;
  const companiesHouse = records.sources.find((source) => source.connectorId === 'uk.companies_house');
  const readFrom = records.country === 'GB' && companiesHouse?.state === 'found' && !companiesHouse.sampleData ? 'We read this from Companies House. ' : '';
  const statusReportFiled = data.vault?.slots.some((slot) => slot.key === CAC_STATUS_SLOT && isInPlace(slot.state)) ?? false;
  const register = registerFor(records.country).register;
  const registerName = register.replace(/^the /, '').replace(/^./, (c) => c.toUpperCase());
  const link = sourceLink(records, rows);
  const standings = all.map((item) => ({ records: item, standing: standingOf(item) }));
  const activeCount = standings.filter((item) => item.standing.active).length;
  const lastChecked = all.map((item) => item.checkedAt).filter((value): value is string => value !== null).sort().pop() ?? records.checkedAt;
  const countries = [...new Set(all.map((item) => countryLong(item.country)))];
  const asked = records.sources.filter((source) => source.state !== 'waiting' || source.down);
  const waiting = records.sources.length - asked.length;

  const refreshAfterCheck = async () => {
    resource.reload();
    everyone.reload();
    await session.refresh().catch(() => undefined);
  };

  return (
    <div className="pg-records" data-testid="company-records" data-country={records.country}>
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Official registries" /> · <b><Scramble text="What each one says" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text="Registry records" />
            </h1>
            <div className="meta">
              <span>
                <span className="live" />
                {plural(Math.max(all.length, 1), 'official register', 'official registers')}
              </span>
              <span>{lastChecked ? `Pulled ${checkedWords(lastChecked).replace(/^Checked /, '').replace(/\.$/, '')}` : 'Not checked yet'}</span>
              {countries.length > 0 ? <span>{countries.join(', ').replace(/, ([^,]*)$/, ' and $1')}</span> : null}
            </div>
          </div>
          {canCheck ? (
            <div className="acts">
              <CheckAgain companyId={records.companyId} onChecked={refreshAfterCheck} />
            </div>
          ) : null}
        </div>

        {standings.length > 0 ? (
          <section className="mod health rs2" style={{ '--n': Math.min(standings.length, 3) } as CSSProperties}>
            <div className="l">
              <div className="mh" style={{ padding: 0 }}>
                <h2>Registry status</h2>
              </div>
              <div className="big">
                <CountUp className="pixel" value={activeCount} />
                <small>/ {standings.length} active</small>
              </div>
              <div className="verdict">{verdictOf(standings.map((item) => item.standing))}</div>
              <div className="lm">What each register says, word for word.</div>
            </div>
            <div className={`cos${side.more ? ' more' : ''}`} ref={side.box} data-lenis-prevent-horizontal="">
              {standings.map(({ records: item, standing }) => (
                <TLink key={item.companyId} href={`/company/${item.companyId}`} className={item.companyId === records.companyId ? 'on' : undefined} aria-current={item.companyId === records.companyId ? 'page' : undefined}>
                  <RegisterArt tone={standing.tone} />
                  <div className="rg2">{registerFor(item.country).register.replace(/^the /, '').replace(/^./, (c) => c.toUpperCase())}</div>
                  <b>{item.legalName}</b>
                  <div className={`sw2 ${standing.tone === 'ok' ? 'g-ok' : standing.tone === 'warn' ? 'g-wa' : 'g-no'}`}>{standing.word}</div>
                  <div className="fx">
                    {standing.idLine ? (
                      <>
                        {standing.idLine}
                        <br />
                      </>
                    ) : null}
                    {item.checkedAt ? `Checked ${agoWords(item.checkedAt)}` : 'Not checked yet'}
                  </div>
                </TLink>
              ))}
            </div>
          </section>
        ) : (
          <section className="mod health rs2 wait" role="status" aria-label="Getting each register's status">
            <div className="l">
              <div className="mh" style={{ padding: 0 }}>
                <h2>Registry status</h2>
              </div>
              <span className="sk big3" />
              <span className="sk ln3" />
            </div>
            <div className="cos">
              <span className="sk col3" />
            </div>
          </section>
        )}
      </Hero>

      <After>
        {sample || down.length > 0 ? (
          <div className="notes">
            {sample ? <SampleNote /> : null}
            <SourcesDownNote sources={down} />
          </div>
        ) : null}

        <Reveal as="section" className="mod">
          <div className="mh">
            <h2>The record</h2>
            <span className="sub">As the register holds it</span>
          </div>
          {session.companies.length > 1 ? (
            <nav className="tabs" aria-label="Companies">
              {session.companies.map((company) => (
                <TLink key={company.id} className={`tab${company.id === records.companyId ? ' on' : ''}`} href={`/company/${company.id}`} aria-current={company.id === records.companyId ? 'page' : undefined}>
                  <span className="tn" title={company.legalName}>
                    {company.legalName}
                  </span>{' '}
                  <small>{countryLong(company.incorporationCountry)}</small>
                </TLink>
              ))}
            </nav>
          ) : null}
          <div className="rec">
            <div className="facts">
              <p className="checked" data-testid="records-checked">
                {readFrom}
                {checkedWords(records.checkedAt)}
                {needYou > 0 ? <b> {plural(needYou, 'thing needs', 'things need')} you.</b> : null}
              </p>
              {rows.length === 0 ? (
                <div data-testid="records-empty">
                  <Empty title="We haven't got any records for this company yet">No check has answered so far. That says nothing either way about the company.</Empty>
                </div>
              ) : (
                <dl className="rows-in" data-testid="records-list">
                  {rows.map((row, index) => (
                    <FactLine key={row.key} row={row} index={index} />
                  ))}
                </dl>
              )}
            </div>
            <aside className="side2">
              <div className="src3">
                <b>{registerName}</b>
                <small>{records.checkedAt ? `Last checked ${checkedWords(records.checkedAt).replace(/^Checked /, '').replace(/ at /, ', ').replace(/\.$/, '')}` : 'Not checked yet'}</small>
                {link ? (
                  <a className="btn btn-g" href={link} target="_blank" rel="noopener noreferrer">
                    View at source
                    <Icon name="link" />
                  </a>
                ) : null}
              </div>

              <CountryBand records={records} statusReportFiled={statusReportFiled} canUpload={entitlements.vault} rows={rows} />

              {asked.length > 0 ? (
                <div className="lg">
                  <h3>What we asked</h3>
                  <ol className="rows-in">
                    {asked.map((source, index) => {
                      const status = sourceStatus(source);
                      const clean = source.connectorId === 'sanctions.lists' && source.state === 'not_found';
                      return (
                        <li key={source.connectorId} style={{ '--r': index } as CSSProperties}>
                          <div>
                            <b>{source.title}</b>
                            <small>{source.lastTriedAt ? `Tried ${agoWords(source.lastTriedAt)}` : source.summary}</small>
                          </div>
                          <span style={{ color: clean ? 'var(--good)' : TONE_COLOUR[status.tone] }}>{clean ? 'No matches' : status.word}</span>
                        </li>
                      );
                    })}
                  </ol>
                  {waiting > 0 ? <p className="waitnote">{plural(waiting, 'more source is', 'more sources are')} still to answer. They count neither way until they do.</p> : null}
                </div>
              ) : null}

              {records.countryCoverage ? (
                <div className="xn cov">
                  <b>Coverage in {countryLong(records.country)}</b>
                  <span>{records.countryCoverage.sentence}</span>
                </div>
              ) : null}
            </aside>
          </div>
        </Reveal>

        <RegisterChanges companyId={records.companyId} />
      </After>
    </div>
  );
}
