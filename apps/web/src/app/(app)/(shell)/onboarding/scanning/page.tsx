'use client';

import '@/app/styles/pages/scan.css';
import type { Company, Scan, ScanSource } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ErrorState, Loading, SampleNote } from '@/components/Bits';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api, asApiError, isRedirecting, type ApiError } from '@/lib/api';
import { agoWords, plural, sentence } from '@/lib/format';
import { prefersCalm } from '@/lib/motion';
import { sourceStatus, sourceWorking, type Tone } from '@/lib/words';

const FINISHED = new Set<Scan['status']>(['partial', 'completed', 'failed']);
/** How long a check stays on the paper before its result lands, and how long the result shows. */
const READ_MS = 900;
const LAND_MS = 520;

/** "the USPTO" and "your website" read well in a sentence. On their own they take a capital. */
function sourceLabel(name: string): string {
  return sentence(name.replace(/^the /, ''));
}

interface Row extends ScanSource {
  key: string;
  companyName: string;
}

const TICK = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const MARK = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 6v8M12 18v.5" />
  </svg>
);

/**
 * Uses the newest full scan for each company, and starts one only if there isn't any. A followed
 * company (?company=&scan=) uses the scan its follow started.
 */
function useScans(only: string | null, scanId: string | null) {
  const session = useSession();
  const [single, setSingle] = useState<Company | null>(null);
  const group = useMemo(() => (session.root ? [session.root, ...session.related] : []), [session.root, session.related]);
  const companies = only ? (single ? [single] : []) : group;
  const [scans, setScans] = useState<Record<string, Scan>>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [polls, setPolls] = useState(0);
  const started = useRef<string | null>(null);

  useEffect(() => {
    if (!only) return;
    let live = true;
    api.companies.get({ params: { companyId: only } }).then(
      (company) => live && setSingle(company),
      (failure: unknown) => {
        if (live && !isRedirecting(failure)) setError(asApiError(failure));
      },
    );
    return () => {
      live = false;
    };
  }, [only]);

  useEffect(() => {
    const key = `${companies.map((item) => item.id).join(',')}:${attempt}`;
    if (companies.length === 0 || started.current === key) return;
    started.current = key;
    setError(null);
    void Promise.all(
      companies.map(async (company) => {
        if (scanId && attempt === 0 && company.id === only) return api.scans.get({ params: { scanId } });
        const { scans: list } = await api.scans.list({ params: { companyId: company.id } });
        const latest = list.find((scan) => scan.kind === 'full');
        const usable = latest && latest.status !== 'failed' ? latest : null;
        return usable ?? api.scans.create({ params: { companyId: company.id } });
      }),
    ).then(
      (loaded) => setScans(Object.fromEntries(loaded.map((scan) => [scan.id, scan]))),
      (failure: unknown) => {
        if (!isRedirecting(failure)) setError(asApiError(failure));
      },
    );
  }, [companies.map((item) => item.id).join(','), attempt]);

  const list = Object.values(scans);
  const moving = list.filter((scan) => !FINISHED.has(scan.status));
  const movingKey = moving.map((scan) => `${scan.id}:${scan.checksDone}:${scan.status}`).join(',');
  useEffect(() => {
    if (moving.length === 0) return;
    const wait = Math.max(500, ...moving.map((scan) => scan.pollAfterMs));
    const timer = setTimeout(() => {
      void Promise.all(moving.map((scan) => api.scans.get({ params: { scanId: scan.id } }))).then(
        (fresh) => {
          setScans((current) => ({ ...current, ...Object.fromEntries(fresh.map((scan) => [scan.id, scan])) }));
          // Ask again even when nothing moved: a source that never answers changes no count.
          setPolls((value) => value + 1);
        },
        (failure: unknown) => {
          if (!isRedirecting(failure)) setError(asApiError(failure));
        },
      );
    }, wait);
    return () => clearTimeout(timer);
  }, [movingKey, list.length, polls]);

  const retry = () => {
    setScans({});
    setAttempt((value) => value + 1);
  };
  return { scans: list, error, retry, companies };
}

function Sheet({ row, landed }: { row: Row; landed: boolean }) {
  const tone = sourceStatus(row).tone;
  return (
    <div className="sheet" key={row.key}>
      <div className="ph">{sourceLabel(row.sourceName)}</div>
      <div className="pt">{row.title}</div>
      <div className="ln f" style={{ width: '88%' }} />
      <div className="ln" style={{ width: '72%' }} />
      <div className="ln" style={{ width: '80%' }} />
      <div className={`hl${landed ? ` ${tone}` : ''}`}>{landed ? row.summary : sourceWorking(row)}</div>
      <div className="ln f" style={{ width: '84%' }} />
      <div className="ln" style={{ width: '64%' }} />
      <div className="ln" style={{ width: '76%' }} />
      <div className="ln" style={{ width: '42%' }} />
      {landed ? <div className={`stamp ${tone}`}>{tone === 'good' ? TICK : MARK}</div> : null}
      {!landed && !prefersCalm() ? <span className="beam" /> : null}
    </div>
  );
}

function resultWords(tone: Tone): string {
  if (tone === 'good') return 'In order: ';
  if (tone === 'none') return 'Noted: ';
  return 'To look at: ';
}

function Scanning() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const only = params.get('company');
  const { scans, error, retry, companies } = useScans(only, params.get('scan'));
  const [revealed, setRevealed] = useState(0);
  const [landed, setLanded] = useState(false);
  const followed = only !== null && companies[0]?.relationship === 'follow';

  useEffect(() => {
    if (!session.root && !only) router.replace('/onboarding/company');
  }, [session.root, only, router]);

  const names = useMemo(() => new Map(companies.map((company) => [company.id, company.legalName])), [companies]);
  const several = companies.length > 1;
  const rows = useMemo<Row[]>(
    () => scans.flatMap((scan) => scan.sources.map((source) => ({ ...source, key: `${scan.id}-${source.connectorId}`, companyName: names.get(scan.companyId) ?? '' }))),
    [scans, names],
  );
  // Answered rows first, so the list fills from the top as they come in.
  const ordered = useMemo(() => [...rows.filter((row) => row.state !== 'waiting'), ...rows.filter((row) => row.state === 'waiting')], [rows]);
  const answered = rows.filter((row) => row.state !== 'waiting').length;

  // Sources can answer faster than anyone can read, so each one is read, then lands, one at a time.
  useEffect(() => {
    if (revealed >= answered) return;
    const calm = prefersCalm();
    const timer = setTimeout(
      () => {
        if (!landed) setLanded(true);
        else {
          setLanded(false);
          setRevealed((value) => Math.min(answered, value + 1));
        }
      },
      calm ? 0 : landed ? LAND_MS : READ_MS,
    );
    return () => clearTimeout(timer);
  }, [revealed, answered, landed]);

  const allFinished = scans.length > 0 && scans.every((scan) => FINISHED.has(scan.status));
  const showDone = allFinished && revealed >= answered;
  const anyFailed = scans.some((scan) => scan.status === 'failed');
  const anyPartial = scans.some((scan) => scan.status === 'partial');
  const sample = rows.some((row) => row.sampleData);
  const name = companies[0]?.legalName ?? session.root?.legalName ?? 'the company';
  // The API emails the owners and admins of an organisation when a scan finishes.
  const role = session.me.organisations.find((org) => org.id === session.me.activeOrganisationId)?.role;
  const emailed = role === 'owner' || role === 'admin';
  const resultHref = only ? `/watchlist/${only}` : '/first-result';

  useEffect(() => {
    if (allFinished) session.refresh().catch(() => undefined);
    // Once, when the scan ends, so the result is there for the next screen.
  }, [allFinished]);

  if (error) {
    return (
      <div className="pg-scan">
        <Hero>
          <ErrorState error={error} onRetry={retry} title="We couldn't run the scan" />
        </Hero>
      </div>
    );
  }
  if (scans.length === 0) {
    return (
      <div className="pg-scan">
        <Hero>
          <Loading what="Starting the scan" />
        </Hero>
      </div>
    );
  }
  if (showDone && anyFailed) {
    return (
      <div className="pg-scan" data-testid="scan-failed">
        <Hero>
          <div className="pagehead">
            <div>
              <div className="mono kick">
                <Scramble text="Live scan" /> · <b>Stopped</b>
              </div>
              <h1 className="disp">
                <Words text="The scan stopped before it finished" />
              </h1>
              <div className="meta">
                <span>Nothing has been scored from it. You can run it again now.</span>
              </div>
            </div>
            <div className="acts">
              <button className="btn btn-p" type="button" onClick={retry}>
                Run it again
              </button>
            </div>
          </div>
        </Hero>
      </div>
    );
  }

  const shown = ordered.slice(0, revealed);
  const focus = showDone ? null : (ordered[revealed] ?? null);
  const focusLanded = landed && focus !== null && focus.state !== 'waiting';
  const tones = shown.map((row) => sourceStatus(row).tone);
  const good = tones.filter((tone) => tone === 'good').length;
  const look = shown.filter((row) => sourceStatus(row).tone === 'watch');
  const down = rows.filter((row) => row.down);
  const done = scans.reduce((sum, scan) => sum + scan.checksDone, 0);
  const total = scans.reduce((sum, scan) => sum + scan.checksTotal, 0);
  const partial = showDone && anyPartial;
  const upNext = ordered.slice(revealed + 1, revealed + 3);
  const left = Math.max(0, rows.length - revealed);
  const sources = new Set(rows.map((row) => row.sourceName)).size;
  const heading = partial ? `${done} of ${total} ${total === 1 ? 'check is' : 'checks are'} done` : showDone ? `${name} is scanned` : `Scanning ${name}`;

  return (
    <div className="pg-scan" data-testid={partial ? 'scan-partial' : undefined}>
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text={followed ? 'Follow a company' : 'Step 3 of 4'} /> · <b><Scramble text="Live scan" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words key={heading} text={heading} />
            </h1>
            <div className="meta">
              <span>
                {showDone ? null : <span className="live" />}
                {showDone ? 'Finished' : 'Reading live registries'}
              </span>
              <span>{plural(companies.length, 'company', 'companies')}</span>
              <span>{plural(sources, 'source', 'sources')}</span>
            </div>
          </div>
        </div>
        {sample ? <SampleNote /> : null}

        <section className="r1">
          <div className="mod gl reader">
            <div className="tx" role="status">
              {!focus && !showDone ? (
                <>
                  <div className="mh">
                    <h2>Putting it together</h2>
                  </div>
                  <div className="src">{plural(sources, 'source', 'sources')} read</div>
                  <div className="what">Scoring {name}</div>
                  <div className="co">{plural(rows.length, 'check', 'checks')} in</div>
                  <div className="ask">Every source has answered or been marked as not connected. Vero is turning what it found into a score.</div>
                  <div className="res none" />
                  <div className="nx">
                    <div className="h">Up next</div>
                    <div>Your first result</div>
                  </div>
                </>
              ) : focus ? (
                <>
                  <div className="mh">
                    <h2>Now reading</h2>
                  </div>
                  <div className="src">{sourceLabel(focus.sourceName) !== focus.title ? sourceLabel(focus.sourceName) : 'Official source'}</div>
                  <div className="what">{focus.title}</div>
                  <div className="co">{focus.companyName}</div>
                  <div className="ask">{sourceWorking(focus)}</div>
                  {focusLanded ? (
                    <div className={`res ${sourceStatus(focus).tone}`} key={`r-${focus.key}`}>
                      {resultWords(sourceStatus(focus).tone)}
                      {focus.summary}
                    </div>
                  ) : (
                    <div className="res none" />
                  )}
                  <div className="nx">
                    <div className="h">Up next</div>
                    {upNext.length > 0 ? (
                      upNext.map((row) => (
                        <div key={row.key}>
                          {row.title}
                          {sourceLabel(row.sourceName) !== row.title ? <span> · {sourceLabel(row.sourceName)}</span> : null}
                        </div>
                      ))
                    ) : (
                      <div>Putting the result together</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mh">
                    <h2>{partial ? 'Mostly done' : 'Scan complete'}</h2>
                  </div>
                  <div className="src">{plural(sources, 'source', 'sources')} read</div>
                  <div className="what">{partial ? `${done} of ${total} answered` : `${plural(rows.length, 'check', 'checks')} done`}</div>
                  <div className="co">{several ? `${companies[0]?.legalName ?? ''} and ${plural(companies.length - 1, 'linked company', 'linked companies')}` : name}</div>
                  <div className="ask">
                    {good === 0 && look.length === 0
                      ? 'No source could answer this time, so the result rests on your answers and the rules that apply.'
                      : `${good} ${good === 1 ? 'is' : 'are'} in order. ${look.length > 0 ? `${look.length} ${look.length === 1 ? 'needs' : 'need'} a look.` : 'Nothing from the sources needs a look.'}`}
                  </div>
                  <div className="res good">{partial ? 'Your result is ready. Vero keeps trying the rest.' : 'The first result is ready.'}</div>
                  <div className="nx">
                    <div className="h">Coverage</div>
                    <div>
                      {done} of {plural(total, 'check', 'checks')} {down.length > 0 ? <span>· {plural(down.length, 'source is', 'sources are')} not answering</span> : null}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="desk" aria-hidden="true">
              <div className="pstack">
                <i className="bk a" />
                <i className="bk b" />
                {focus ? <Sheet key={focus.key} row={focus} landed={focusLanded} /> : shown.length > 0 ? <Sheet key="last" row={shown[shown.length - 1] as Row} landed /> : null}
              </div>
            </div>
          </div>

          <div className="mod next">
            <div className="k">Checks</div>
            <div className="cnt" data-testid="scan-count">
              <span className="pixel">{showDone ? rows.length : revealed}</span>
              <span>
                of <span className="pixel">{rows.length}</span> {rows.length === 1 ? 'source' : 'sources'} read
              </span>
            </div>
            <div className="pb" aria-hidden="true">
              {ordered.map((row, at) => (
                <i key={row.key} className={at < revealed ? sourceStatus(row).tone : at === revealed && !showDone ? 'now' : ''} />
              ))}
            </div>
            <div className="tally">
              <span>
                <b>{good}</b> in order
              </span>
              <span>
                <b>{look.length}</b> to look at
              </span>
            </div>
            <div className="fl">
              <div className="h">{showDone ? 'To look at' : 'To look at so far'}</div>
              {look.length === 0 ? (
                <div className="none">Nothing yet</div>
              ) : (
                look.map((row) => (
                  <div className="it" key={row.key}>
                    {row.title}
                    <span className="tone-watch">{sourceStatus(row).word}</span>
                  </div>
                ))
              )}
            </div>
            <div className="eta">
              {showDone
                ? partial
                  ? `${down.length === 1 ? 'One source isn’t' : `${down.length} sources aren’t`} answering. It won't count for or against the score.`
                  : 'Finished. Vero reads these again on a schedule.'
                : left === 0
                  ? 'Every check is in. Putting the result together.'
                  : emailed
                  ? `${plural(left, 'check', 'checks')} left. You can leave this page. Vero emails you when it's done.`
                  : `${plural(left, 'check', 'checks')} left. You can leave this page. The result shows under What's new.`}
            </div>
            {showDone ? (
              <TLink className="btn ready" href={resultHref}>
                See your result
              </TLink>
            ) : (
              <span className="btn" aria-disabled="true" role="link">
                See your result
              </span>
            )}
          </div>
        </section>
      </Hero>

      <After>
        {partial ? (
          <Reveal as="section" className="mod lv" style={{ marginBottom: 20 }}>
            <div className="mh">
              <h2>Not answering just now</h2>
              <span className="sub">Vero keeps trying in the background. There&apos;s nothing you need to do.</span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0 4px' }}>
              {down.map((row) => (
                <li key={row.key} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 22px', borderTop: '1px solid var(--line-2)' }}>
                  <span style={{ flex: 1 }}>
                    <b style={{ display: 'block', fontSize: 14 }}>{row.title}</b>
                    <small className="muted" style={{ fontSize: 12.5 }}>
                      {row.state === 'error' ? `Not responding. Vero last tried ${agoWords(row.lastTriedAt)}.` : row.summary}
                    </small>
                  </span>
                  <span className={`st2 tone-${sourceStatus(row).tone}`}>{sourceStatus(row).word}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
        <Reveal as="section" className="mod lv" hidden={partial && down.length === rows.length}>
          <div className="mh">
            <h2>{partial ? 'Answered' : 'Checks'}</h2>
            <span className="sub">{showDone ? `All ${rows.length} read · ${good} in order · ${look.length} to look at` : 'Results land here as Vero reads each source'}</span>
          </div>
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Check</th>
                <th>Source</th>
                <th>What Vero found</th>
                <th style={{ width: 150 }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {[...shown, ...(focus ? [focus] : [])].filter((row) => !(partial && row.down)).map((row, at) => {
                const now = focus !== null && row.key === focus.key && !focusLanded;
                const status = sourceStatus(row);
                return (
                  <tr key={row.key} className={now ? 'now' : undefined} data-testid="scan-row" style={{ '--r': at } as CSSProperties}>
                    <td>
                      <b>{row.title}</b>
                      <small>{row.companyName}</small>
                      <span className="fdm">{now ? 'Reading…' : row.summary}</span>
                    </td>
                    <td className="src2">{sourceLabel(row.sourceName)}</td>
                    <td className="fd">{now ? 'Reading…' : row.summary}</td>
                    <td>
                      <span className={`st2 ${now ? '' : `tone-${status.tone}`}`}>{now ? 'Reading' : status.word}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="foot">
            {showDone
              ? down.length > 0
                ? `${plural(down.length, 'source', 'sources')} didn't answer. Until ${down.length === 1 ? 'it does' : 'they do'}, ${down.length === 1 ? 'it doesn' : 'they don'}'t count for or against the score.`
                : 'Every source answered. Documents you haven’t shared yet never lower the score.'
              : left > 1
                ? `${plural(left - 1, 'more check', 'more checks')} waiting.`
                : 'Putting the result together.'}
          </div>
        </Reveal>
      </After>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Scanning />
    </Suspense>
  );
}

