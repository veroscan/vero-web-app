'use client';

import type { IssueSummary, VaultDocument, VaultResponse, VaultSlotView } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { Chevron, Empty, ErrorState, Loading } from '@/components/Bits';
import { DeclareMissing } from '@/components/DeclareMissing';
import { DocumentFlow } from '@/components/DocumentFlow';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { api, asApiError } from '@/lib/api';
import { CERTIFICATE_SLOT, groupSlots, isInPlace, isToDo, slotTone } from '@/lib/documents';
import { longDate } from '@/lib/format';
import { softly } from '@/lib/motion';
import { useResource } from '@/lib/useResource';

type Filter = 'all' | 'todo' | 'in_place';

function addHref(companyId: string, slotKey?: string): string {
  return `/documents/add?company=${companyId}${slotKey ? `&slot=${slotKey}` : ''}`;
}

/** Links are short-lived and always download, so they're asked for only when needed. */
function DownloadButton({ documentId, label = 'Download' }: { documentId: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const download = async (event: React.MouseEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      const { url } = await api.vault.download({ params: { documentId } });
      window.location.assign(url);
    } catch (error) {
      setProblem(asApiError(error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button className="link small plainbtn act" type="button" disabled={busy} onClick={(event) => void download(event)}>
        {label}
      </button>
      {problem ? (
        <span className="formerror" role="alert">
          {problem}
        </span>
      ) : null}
    </>
  );
}

function RemoveDocument({ documentId, filed, onRemoved }: { documentId: string; filed: boolean; onRemoved: () => void }) {
  const session = useSession();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const remove = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.vault.remove({ params: { documentId } });
      await session.refresh().catch(() => undefined);
      onRemoved();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };
  if (!asking) {
    return (
      <button className="link small plainbtn" type="button" onClick={() => setAsking(true)}>
        Remove this document
      </button>
    );
  }
  return (
    <div className="stack g8" data-testid="remove-confirm">
      <p className="quiet">This deletes the file for good.{filed ? ' It will stop counting towards your score.' : ''}</p>
      <div className="btns">
        <button className="btn btn-line btn-sm" type="button" disabled={busy} onClick={() => void remove()}>
          {busy ? 'Removing' : 'Yes, remove it'}
        </button>
        <button className="btn btn-line btn-sm" type="button" disabled={busy} onClick={() => setAsking(false)}>
          Keep it
        </button>
      </div>
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
    </div>
  );
}

interface RowProps {
  slot: VaultSlotView;
  document: VaultDocument | undefined;
  issue: IssueSummary | undefined;
  companyId: string;
  onChanged: () => void;
}

function SlotAction({ slot, companyId }: Pick<RowProps, 'slot' | 'companyId'>) {
  if (slot.state === 'missing' || slot.state === 'declared_missing') {
    return (
      <TLink className="btn btn-sm btn-line act" href={addHref(companyId, slot.key)}>
        Add
      </TLink>
    );
  }
  if (slot.state === 'needs_confirmation' && slot.documentId) {
    return (
      <TLink className="link small act" href={`/documents/add?company=${companyId}&document=${slot.documentId}`}>
        Confirm
      </TLink>
    );
  }
  if (slot.state === 'not_accepted' && slot.documentId) {
    return (
      <TLink className="link small act" href={`/documents/${slot.documentId}/rejected`}>
        See why
      </TLink>
    );
  }
  if (isInPlace(slot.state) && slot.documentId) return <DownloadButton documentId={slot.documentId} />;
  return <span className="act" />;
}

function SlotRow({ slot, document, issue, companyId, onChanged }: RowProps) {
  const certificate = slot.key === CERTIFICATE_SLOT;
  const ruleKey = slot.ruleKeys[0];
  const [open, setOpen] = useState(false);
  const bodyId = `slot-${slot.key}`;
  return (
    <div className={`slot${open ? ' open' : ''}`} data-testid="slot-row" data-slot={slot.key}>
      {/* Not a <summary>: the row holds its own Add or Download control, and a control can't sit inside another. */}
      <div
        className="row r-doc"
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest('a,button')) setOpen((value) => !value);
        }}
      >
        <span className="stack g4">
          <span className="row-t">{slot.label}</span>
          <span className="row-s">{slot.reason}</span>
        </span>
        <span className={`st ${slotTone(slot.state)}`}>{slot.stateWord}</span>
        <SlotAction slot={slot} companyId={companyId} />
        <button className="chevbtn" type="button" aria-expanded={open} aria-controls={bodyId} aria-label={`More about ${slot.label}`} data-testid="slot-toggle" onClick={() => setOpen((value) => !value)}>
          <Chevron />
        </button>
      </div>
      <div className="more-body" id={bodyId} hidden={!open}>
        {slot.state === 'missing' ? <p className="quiet">Nothing on file yet. It doesn&apos;t count for or against your score until you add it or tell us you don&apos;t have it.</p> : null}
        {slot.state === 'reading' ? <p className="quiet">We&apos;re reading this now. It doesn&apos;t count until you&apos;ve confirmed where it belongs.</p> : null}
        {slot.state === 'needs_confirmation' ? <p className="quiet">We&apos;ve read this. It doesn&apos;t count until you confirm where it belongs.</p> : null}
        {slot.state === 'not_accepted' ? <p className="quiet">{document?.rejectionReason ?? "This copy doesn't count yet."}</p> : null}
        {document && isInPlace(slot.state) ? (
          <>
            {document.fileName ? <p className="quiet">{document.fileName}</p> : null}
            {/* Delaware is never shown as live: only what the certificate says, and when. */}
            {certificate && document.documentDate ? <p className="quiet">Certified {longDate(document.documentDate)}. {document.validated ? 'You told us you checked it with Delaware.' : "You uploaded this and we read it."}</p> : null}
            {document.expiresOn ? <p className="quiet">Runs out on {longDate(document.expiresOn)}.</p> : null}
            <p className="quiet">You uploaded this and we read it.</p>
          </>
        ) : null}
        {issue && (issue.canDeclareMissing || issue.declaredMissing) ? <DeclareMissing key={`${issue.ruleKey}-${String(issue.declaredMissing)}`} item={issue} onChanged={onChanged} /> : null}
        <p className="morelinks">
          {ruleKey && (slot.state === 'declared_missing' || issue) ? (
            <TLink className="link" href={`/issues/${companyId}/${encodeURIComponent(ruleKey)}`}>
              See the issue
            </TLink>
          ) : null}
          {slot.documentId && document ? <RemoveDocument documentId={slot.documentId} filed={document.status === 'filed'} onRemoved={onChanged} /> : null}
        </p>
      </div>
    </div>
  );
}

interface Loaded {
  vault: VaultResponse;
  issues: IssueSummary[];
}

function Documents() {
  const session = useSession();
  const params = useSearchParams();
  const companies = session.root ? [session.root, ...session.related] : [];
  const companyId = params.get('company') ?? session.root?.id ?? '';
  const [filter, setFilter] = useState<Filter>('all');

  const resource = useResource<Loaded | null>(async () => {
    if (!companyId) return null;
    const vault = await api.vault.get({ params: { companyId } });
    if (!vault.canUpload) return { vault, issues: [] };
    // Which slots can take "we don't have this" comes from the issues. Without it, the list still shows.
    const list = await api.results.issues({ params: { companyId }, query: { scope: 'company', outcome: 'all' } }).catch(() => null);
    return { vault, issues: list?.issues ?? [] };
  }, [companyId]);

  const vault = resource.data?.vault;
  const issues = useMemo(() => resource.data?.issues ?? [], [resource.data]);
  const shown = useMemo(() => {
    const slots = vault?.slots ?? [];
    return filter === 'all' ? slots : slots.filter((slot) => (filter === 'todo' ? isToDo(slot.state) : isInPlace(slot.state)));
  }, [vault, filter]);
  const groups = useMemo(() => groupSlots(shown), [shown]);

  if (resource.loading && !vault) {
    return (
      <main style={{ display: 'contents' }}>
        <Loading what="Getting your documents" />
      </main>
    );
  }
  if (resource.error) {
    return (
      <main style={{ display: 'contents' }}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </main>
    );
  }
  if (!vault) return null;

  if (!vault.canUpload) {
    return (
      <main className="wrap mid docs">
        <section className="sec stack g20" data-testid="documents-locked">
          <h1 className="t-1">Your documents</h1>
          <p className="lead">Adding documents, and the full list of what a company should have, are part of a paid plan.</p>
          <p className="quiet">Your first read comes from public records and your answers, so you don&apos;t need any documents to see it.</p>
          <div className="btns">
            <TLink className="btn btn-ink" href="/plan">
              See the plans
            </TLink>
            <TLink className="btn btn-line" href="/">
              Back to home
            </TLink>
          </div>
        </section>
      </main>
    );
  }

  const waiting = vault.documents.filter((document) => document.status === 'needs_confirmation' || document.status === 'pending' || document.status === 'processing' || document.status === 'failed');
  const percent = vault.totalCount === 0 ? 0 : (vault.filledCount / vault.totalCount) * 100;
  const documentFor = (slot: VaultSlotView) => vault.documents.find((document) => document.id === slot.documentId);
  const issueFor = (slot: VaultSlotView) => {
    const related = issues.filter((issue) => slot.ruleKeys.includes(issue.ruleKey));
    return related.find((issue) => issue.declaredMissing) ?? related.find((issue) => issue.canDeclareMissing) ?? related[0];
  };
  const rowsOf = (slots: VaultSlotView[]) => (
    <div className="rows">
      {slots.map((slot) => (
        <SlotRow key={slot.key} slot={slot} document={documentFor(slot)} issue={issueFor(slot)} companyId={companyId} onChanged={resource.reload} />
      ))}
    </div>
  );

  return (
    <main className="wrap mid docs">
      <section className="sec stack g48">
        <div className="stack g20">
          <div className="stack g12">
            <h1 className="t-1" data-testid="documents-count">
              <span className="num">{vault.filledCount}</span> of {vault.totalCount} documents in place
            </h1>
            <p className="lead">You don&apos;t need to know what a company should have. This is the list. An empty slot doesn&apos;t count against you unless you tell us you don&apos;t have it.</p>
          </div>
          <div className="meter grow" style={{ height: 8, borderRadius: 4 }} role="progressbar" aria-valuenow={vault.filledCount} aria-valuemin={0} aria-valuemax={vault.totalCount} aria-label={`${vault.filledCount} of ${vault.totalCount} documents in place`}>
            <i style={{ width: `${percent}%` }} />
          </div>
        </div>

        {companies.length > 1 ? (
          <div className="filters" role="group" aria-label="Choose a company">
            {companies.map((company) => (
              <TLink key={company.id} className={`fbtn${company.id === companyId ? ' on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center' }} href={`/documents?company=${company.id}`} aria-current={company.id === companyId ? 'true' : undefined}>
                {company.legalName}
              </TLink>
            ))}
          </div>
        ) : null}

        <div className="stack g16">
          <DocumentFlow key={companyId} companyId={companyId} slots={vault.slots} compact onChanged={resource.reload} />
          <div className="btns">
            <TLink className="btn btn-ink" href={addHref(companyId)}>
              Add a document
            </TLink>
          </div>
        </div>

        {waiting.length > 0 ? (
          <div className="stack g16" data-testid="documents-waiting">
            <h2 className="t-2">Waiting for you</h2>
            <div className="rows">
              {waiting.map((document) => (
                <div className="row r-act" key={document.id}>
                  <span className="stack g4">
                    <span className="row-t">{document.fileName ?? 'A document'}</span>
                    <span className="row-s">{document.status === 'failed' ? (document.rejectionReason ?? "We couldn't read this file.") : document.status === 'needs_confirmation' ? "We've read this. It doesn't count until you confirm where it belongs." : "We're reading this now."}</span>
                  </span>
                  {document.status === 'needs_confirmation' ? (
                    <TLink className="link small" href={`/documents/add?company=${companyId}&document=${document.id}`}>
                      Confirm
                    </TLink>
                  ) : document.status === 'failed' ? (
                    <TLink className="link small" href={`/documents/${document.id}/rejected`}>
                      See why
                    </TLink>
                  ) : (
                    <span className="st none">{document.stateWord}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="stack g32">
          <div className="filters" role="group" aria-label="Filter documents">
            {(
              [
                ['all', 'All'],
                ['todo', 'To do'],
                ['in_place', 'In place'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} className={`fbtn${filter === id ? ' on' : ''}`} type="button" aria-pressed={filter === id} onClick={() => softly(() => setFilter(id))}>
                {label}
              </button>
            ))}
          </div>

          {vault.totalCount === 0 ? (
            <Empty title="Nothing to add yet">We&apos;ll list what this company should have once we know more about it.</Empty>
          ) : groups.length === 0 ? (
            <Empty title={filter === 'todo' ? 'Nothing left to do' : 'Nothing in place yet'}>{filter === 'todo' ? 'Everything on the list has a document.' : "Documents show here once you've added and confirmed them."}</Empty>
          ) : (
            <div className="stack g48">
              {groups.slice(0, 2).map((group) => (
                <div className="stack g16" key={group.layer} data-testid="slot-group">
                  <h2 className="t-2">{group.name}</h2>
                  {rowsOf(group.slots)}
                </div>
              ))}
              {groups.length > 2 ? (
                <div className="rows">
                  {groups.slice(2).map((group) => (
                    <details className="more" key={group.layer} data-testid="slot-group-more">
                      <summary className="row r-sum">
                        <span className="row-t">{group.name}</span>
                        <span className="quiet num">
                          {group.inPlace} of {group.slots.length}
                        </span>
                        <Chevron />
                      </summary>
                      <div className="more-body">{rowsOf(group.slots)}</div>
                    </details>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Documents />
    </Suspense>
  );
}
