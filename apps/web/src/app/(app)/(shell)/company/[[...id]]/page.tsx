'use client';

import type { Company, CompanyRecordsResponse } from '@vero/shared';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chevron, Empty, ErrorState, Loading, PlanLink, SampleNote, SourcesDownNote } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { CERTIFICATE_SLOT, isInPlace } from '@/lib/documents';
import { entitlementsOf, roleCan } from '@/lib/entitlements';
import { plural } from '@/lib/format';
import { CAC_STATUS_SLOT, checkedWords, countryLong, recordRows, splitStatusNote, type FactRow } from '@/lib/records';
import { useResource } from '@/lib/useResource';

/** How long "Check again" waits with the screen open. The check carries on either way. */
const CHECK_WAIT_MS = 120_000;

function FactValue({ row }: { row: FactRow }) {
  const tone = row.tone === 'none' ? '' : ` ${row.tone}`;
  return <span className={`b${tone}${row.numeric ? ' num' : ''}`}>{row.value}</span>;
}

function FactLine({ row }: { row: FactRow }) {
  const expands = row.body !== null || row.links.length > 0;
  if (!expands) {
    return (
      <div className="row fact" data-testid="fact-row" data-key={row.key}>
        <span className="quiet">{row.label}</span>
        <FactValue row={row} />
        <span className="small" data-testid="fact-source">
          {row.source}
        </span>
      </div>
    );
  }
  return (
    <details className="more" open={row.needsYou} data-testid="fact-row" data-key={row.key}>
      <summary className="row fact">
        <span className="quiet">{row.label}</span>
        <FactValue row={row} />
        <span className="small" data-testid="fact-source">
          {row.source}
        </span>
        <Chevron />
      </summary>
      <div className="more-body factbody">
        {row.body ? <p className="quiet">{row.body}</p> : null}
        {row.links.length > 0 ? (
          <p className="morelinks">
            {row.links.map((link) => (
              <TLink className="link" href={link.href} key={link.href}>
                {link.label}
              </TLink>
            ))}
          </p>
        ) : null}
      </div>
    </details>
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
        const wait = Math.max(500, scan.pollAfterMs);
        await new Promise((resolve) => setTimeout(resolve, wait));
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
    <div className="stack g8 againbox">
      <button className="btn btn-line btn-sm again" type="button" disabled={checking} data-testid="check-again" onClick={() => void run()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6" />
        </svg>
        {checking ? 'Checking' : 'Check again'}
      </button>
      {problem ? (
        <p className="formerror" role="alert" data-testid="check-again-problem">
          {problem}
        </p>
      ) : null}
    </div>
  );
}

function Band({ title, body, testId, action }: { title: string; body: string; testId: string; action: { href: string; label: string } | null }) {
  return (
    <div className="next band" data-testid={testId}>
      <div className="stack g4">
        <p className="t-3">{title}</p>
        <p className="quiet">{body}</p>
      </div>
      {action ? (
        <TLink className="btn btn-ink" href={action.href}>
          {action.label}
        </TLink>
      ) : (
        <span className="stack g4" data-testid="records-upload-locked">
          <span className="small">Uploading documents is part of a paid plan.</span>
          <PlanLink />
        </span>
      )}
    </div>
  );
}

/** A tab is the country, unless two companies share one. Then it's the company's name. */
function tabLabels(companies: Company[]): Map<string, string> {
  const counts = new Map<string, number>();
  for (const company of companies) counts.set(company.incorporationCountry, (counts.get(company.incorporationCountry) ?? 0) + 1);
  return new Map(
    companies.map((company) => {
      const country = company.incorporationCountry;
      return [company.id, counts.get(country) === 1 ? countryLong(country) : company.legalName];
    }),
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

export default function CompanyRecordsPage() {
  const { id } = useParams<{ id?: string[] }>();
  if (id && id.length > 1) notFound();
  const session = useSession();
  const companyId = id?.[0] ?? session.root?.id ?? null;
  const entitlements = entitlementsOf(session.overview?.plan);

  const resource = useResource(async () => {
    if (!companyId) return null;
    const records = await api.records.get({ params: { companyId } });
    // Both only add to the page: links to real issues, and whether a status report is on file.
    const [issues, vault] = await Promise.all([
      api.results.issues({ params: { companyId }, query: { scope: 'company', outcome: 'open' } }).catch(() => null),
      records.country === 'NG' ? api.vault.get({ params: { companyId } }).catch(() => null) : Promise.resolve(null),
    ]);
    return { records, issues: issues?.issues ?? [], vault };
  }, [companyId]);

  const labels = useMemo(() => tabLabels(session.companies), [session.companies]);
  const data = resource.data;
  const stale = data && data.records.companyId !== companyId;
  const rows = useMemo(() => (data ? recordRows(data.records, { issues: data.issues, canUpload: entitlements.vault }) : []), [data, entitlements.vault]);

  if (resource.error && (!data || stale)) {
    return (
      <main style={{ display: 'contents' }}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </main>
    );
  }
  if (!data || stale) {
    return (
      <main style={{ display: 'contents' }}>
        <Loading what="Getting your company records" />
      </main>
    );
  }

  const { records } = data;
  const canCheck = roleCan(session.me, 'scans.write');
  const down = records.sources.filter((source) => source.down);
  const sample = records.sampleData || records.sources.some((source) => source.sampleData);
  const needYou = rows.filter((row) => row.needsYou).length;
  const companiesHouse = records.sources.find((source) => source.connectorId === 'uk.companies_house');
  const readFrom = records.country === 'GB' && companiesHouse?.state === 'found' && !companiesHouse.sampleData ? 'We read this from Companies House. ' : '';
  const statusReportFiled = data.vault?.slots.some((slot) => slot.key === CAC_STATUS_SLOT && isInPlace(slot.state)) ?? false;

  const refreshAfterCheck = async () => {
    resource.reload();
    await session.refresh().catch(() => undefined);
  };

  return (
    <main className="wrap">
      <section className="sec stack g32" data-testid="company-records" data-country={records.country}>
        <div className="stack g20">
          <h1 className="t-1 coname">{records.legalName}</h1>
          {session.companies.length > 1 ? (
            <nav className="tabs cotabs" aria-label="Companies">
              {session.companies.map((company) => (
                <TLink key={company.id} className={company.id === records.companyId ? 'on' : undefined} href={`/company/${company.id}`} aria-current={company.id === records.companyId ? 'page' : undefined}>
                  {labels.get(company.id)}
                </TLink>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="checkedline">
          <p className="quiet" data-testid="records-checked">
            {readFrom}
            {checkedWords(records.checkedAt)}
            {needYou > 0 ? <span className="b"> {plural(needYou, 'thing needs', 'things need')} you.</span> : null}
          </p>
          {canCheck ? <CheckAgain companyId={records.companyId} onChecked={refreshAfterCheck} /> : null}
        </div>

        {sample || down.length > 0 ? (
          <div className="stack g8">
            {sample ? <SampleNote /> : null}
            <SourcesDownNote sources={down} />
          </div>
        ) : null}

        <CountryBand records={records} statusReportFiled={statusReportFiled} canUpload={entitlements.vault} rows={rows} />

        {rows.length === 0 ? (
          <div data-testid="records-empty">
            <Empty title="We haven't got any records for this company yet">No check has answered so far. That says nothing either way about the company.</Empty>
          </div>
        ) : (
          <div className="rows" data-testid="records-list">
            {rows.map((row) => (
              <FactLine key={row.key} row={row} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
