'use client';

import type { Scan, ScanSource } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorState, Loading, SampleNote } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { ThemeToggle } from '@/components/Theme';
import { TLink } from '@/components/TLink';
import { VFill } from '@/components/V3D';
import { api, asApiError, isRedirecting, type ApiError } from '@/lib/api';
import { agoWords, plural } from '@/lib/format';
import { prefersCalm } from '@/lib/motion';
import { sourceStatus, sourceWorking } from '@/lib/words';

const FINISHED = new Set<Scan['status']>(['partial', 'completed', 'failed']);

interface Row extends ScanSource {
  key: string;
  companyName: string;
}

/**
 * Uses the newest full scan for each company, and starts one only if there isn't any.
 * Sources can answer faster than anyone can read, so finished rows appear one at a time.
 */
function useScans() {
  const session = useSession();
  const companies = useMemo(() => (session.root ? [session.root, ...session.related] : []), [session.root, session.related]);
  const [scans, setScans] = useState<Record<string, Scan>>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const started = useRef<string | null>(null);

  useEffect(() => {
    const key = `${companies.map((item) => item.id).join(',')}:${attempt}`;
    if (companies.length === 0 || started.current === key) return;
    started.current = key;
    setError(null);
    void Promise.all(
      companies.map(async (company) => {
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
  }, [companies, attempt]);

  const list = Object.values(scans);
  const moving = list.filter((scan) => !FINISHED.has(scan.status));
  const movingKey = moving.map((scan) => `${scan.id}:${scan.checksDone}:${scan.status}`).join(',');
  useEffect(() => {
    if (moving.length === 0) return;
    const wait = Math.max(500, ...moving.map((scan) => scan.pollAfterMs));
    const timer = setTimeout(() => {
      void Promise.all(moving.map((scan) => api.scans.get({ params: { scanId: scan.id } }))).then(
        (fresh) => setScans((current) => ({ ...current, ...Object.fromEntries(fresh.map((scan) => [scan.id, scan])) })),
        (failure: unknown) => {
          if (!isRedirecting(failure)) setError(asApiError(failure));
        },
      );
    }, wait);
    return () => clearTimeout(timer);
  }, [movingKey, list.length]);

  const retry = () => {
    setScans({});
    setAttempt((value) => value + 1);
  };
  return { scans: list, error, retry, companies };
}

function SidePanel({ left, children }: { left?: string; children: React.ReactNode }) {
  return (
    <div className="sc-side">
      <header className="bar">
        <span className="small">{left}</span>
        <div className="tools">
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
}

function Partial({ rows, scans, name, sample, emailed }: { rows: Row[]; scans: Scan[]; name: string; sample: boolean; emailed: boolean }) {
  const down = rows.filter((row) => row.down);
  const done = scans.reduce((sum, scan) => sum + scan.checksDone, 0);
  const total = scans.reduce((sum, scan) => sum + scan.checksTotal, 0);
  const level = total === 0 ? 0 : Math.round((done / total) * 100);
  const names = [...new Set(down.map((row) => row.title))];
  return (
    <div className="vs">
      <div className="sp">
        <aside className="stage sp-stage">
          <img src="/vero-lockup-dark.svg" alt="Vero Scan" />
          <div className="sp-centre">
            <VFill value={level} className="gauge sp-gauge" back="var(--field)" label={`${done} of ${total} checks done`} />
          </div>
          <p className="sp-note">We&apos;ll keep trying in the background.</p>
        </aside>
        <div className="sp-side">
          <header className="bar">
            <div className="tools">
              <ThemeToggle />
            </div>
          </header>
          <main className="sp-main" data-testid="scan-partial">
            <div className="stack g12">
              <h1 className="t-1">
                {done} of {total} {total === 1 ? 'check is' : 'checks are'} done
              </h1>
              <p className="lead">
                {names.length === 1 ? `${names[0]} isn't answering just now.` : `${names.length} of our sources aren't answering just now.`} Your result for {name} is ready, and we&apos;ll keep trying in the background.
              </p>
              {sample ? <SampleNote /> : null}
            </div>
            <ul className="rows">
              {down.map((row) => (
                <li className="row r-act" key={row.key}>
                  <span className="stack g4">
                    <span className="row-t">{row.title}</span>
                    <span className="row-s">
                      {row.state === 'error' ? `Not responding. We last tried ${agoWords(row.lastTriedAt)}.` : row.summary}
                    </span>
                  </span>
                  <span className={`st ${sourceStatus(row).tone}${row.state === 'error' ? ' sp-retry' : ''}`}>{sourceStatus(row).word}</span>
                </li>
              ))}
            </ul>
            <p className="quiet">There&apos;s nothing you need to do. Until this comes back, it won&apos;t count for or against your score. {emailed ? 'We\'ll email you when it updates.' : 'We\'ll show any change under What\'s new.'}</p>
            <div>
              <TLink className="btn btn-ink" href="/first-result">
                See your result
              </TLink>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ScanningPage() {
  const session = useSession();
  const router = useRouter();
  const { scans, error, retry, companies } = useScans();
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!session.root) router.replace('/onboarding/company');
  }, [session.root, router]);

  const names = useMemo(() => new Map(companies.map((company) => [company.id, company.legalName])), [companies]);
  const several = companies.length > 1;
  const rows = useMemo<Row[]>(
    () =>
      scans.flatMap((scan) =>
        scan.sources.map((source) => ({
          ...source,
          key: `${scan.id}-${source.connectorId}`,
          companyName: names.get(scan.companyId) ?? '',
        })),
      ),
    [scans, names],
  );

  // Answered rows first, so the list fills from the top as they come in.
  const ordered = useMemo(() => [...rows.filter((row) => row.state !== 'waiting'), ...rows.filter((row) => row.state === 'waiting')], [rows]);
  const answered = rows.filter((row) => row.state !== 'waiting').length;

  useEffect(() => {
    if (revealed >= answered) return;
    const timer = setTimeout(() => setRevealed((value) => Math.min(answered, value + 1)), prefersCalm() ? 0 : 420);
    return () => clearTimeout(timer);
  }, [revealed, answered]);

  const allFinished = scans.length > 0 && scans.every((scan) => FINISHED.has(scan.status));
  const allRevealed = revealed >= answered;
  const showDone = allFinished && allRevealed;
  const anyFailed = scans.some((scan) => scan.status === 'failed');
  const anyPartial = scans.some((scan) => scan.status === 'partial');
  const sample = rows.some((row) => row.sampleData);
  const name = session.root?.legalName ?? 'your company';
  // The API emails the owners and admins of an organisation when a scan finishes.
  const role = session.me.organisations.find((org) => org.id === session.me.activeOrganisationId)?.role;
  const emailed = role === 'owner' || role === 'admin';

  useEffect(() => {
    if (allFinished) session.refresh().catch(() => undefined);
    // Once, when the scan ends, so the result is there for the next screen.
  }, [allFinished]);

  if (error) {
    return (
      <div className="vs">
        <main style={{ display: 'contents' }}>
          <ErrorState error={error} onRetry={retry} title="We couldn't run the scan" />
        </main>
      </div>
    );
  }
  if (scans.length === 0) {
    return (
      <div className="vs">
        <main style={{ display: 'contents' }}>
          <Loading what="Starting your scan" />
        </main>
      </div>
    );
  }
  if (showDone && anyFailed) {
    return (
      <div className="vs">
        <main className="state" data-testid="scan-failed">
          <h1 className="t-2">The scan stopped before it finished</h1>
          <p className="quiet">Nothing has been scored from it. You can run it again now.</p>
          <button className="btn btn-ink btn-sm" type="button" onClick={retry}>
            Run it again
          </button>
        </main>
      </div>
    );
  }
  if (showDone && anyPartial) return <Partial rows={rows} scans={scans} name={name} sample={sample} emailed={emailed} />;

  const level = rows.length === 0 ? 2 : Math.max(2, Math.round((revealed / rows.length) * 100));
  const checking = ordered[revealed];
  const line = showDone ? "That's everything. Your first read is ready." : checking ? sourceWorking(checking) : '';
  return (
    <div className="vs">
      <div className="sc">
        <aside className="stage sc-stage">
          <img src="/vero-lockup-dark.svg" alt="Vero Scan" />
          <div className="sc-centre">
            <VFill value={showDone ? 100 : level} className="gauge sc-gauge" back="var(--field)" label="The V fills up as checks finish" />
          </div>
          <p className="sc-now" role="status">
            <span key={line}>{line}</span>
          </p>
        </aside>
        <SidePanel left={showDone ? '' : emailed ? "You can leave this page. We'll email you when it's done." : "You can leave this page. We'll keep going, and tell you under What's new."}>
          <main className="sc-main">
            <div className="stack g8">
              <h1 className="t-1">{showDone ? 'Scan finished' : `Scanning ${name}`}</h1>
              <p className="lead num" data-testid="scan-count">
                {showDone ? rows.length : revealed} of {plural(rows.length, 'check', 'checks')} done
              </p>
              {sample ? <SampleNote /> : null}
            </div>
            <ul className="rows sc-rows plain">
              {ordered.map((row, index) => {
                const shownDone = index < revealed;
                const isChecking = !shownDone && index === revealed && !showDone;
                const status = sourceStatus(row);
                return (
                  <li key={row.key} className={`row r-act${shownDone ? '' : isChecking ? ' checking' : ' waiting'}`} data-testid="scan-row">
                    <span className="stack g4">
                      <span className="row-t">
                        {row.title}
                        {several ? `, ${row.companyName}` : ''}
                      </span>
                      <span className="row-s">{shownDone ? row.summary : isChecking ? 'Checking now' : 'Up next'}</span>
                    </span>
                    <span className={`st ${shownDone ? status.tone : 'none'}`}>{shownDone ? status.word : isChecking ? 'Checking' : 'Waiting'}</span>
                  </li>
                );
              })}
            </ul>
            <div>
              {showDone ? (
                <TLink className="btn btn-ink sc-end" href="/first-result">
                  See your result
                </TLink>
              ) : (
                <button className="btn btn-ink sc-end" type="button" disabled aria-disabled="true">
                  See your result
                </button>
              )}
            </div>
          </main>
        </SidePanel>
      </div>
    </div>
  );
}
