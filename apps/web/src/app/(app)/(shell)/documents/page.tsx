'use client';

import '@/app/styles/pages/documents.css';
import type { IssueSummary, ProjectionResponse, VaultDocument, VaultResponse, VaultSlotView } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Fragment, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ErrorState, Loading, PlanLink } from '@/components/Bits';
import { DeclareMissing } from '@/components/DeclareMissing';
import { PaperArt } from '@/components/documents/Paper';
import { arrowKeys } from '@/components/findings/tabKeys';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api, asApiError } from '@/lib/api';
import { CERTIFICATE_SLOT, isInPlace, midSentence, slotColour, slotKind, type SlotKind } from '@/lib/documents';
import { longDate, plural, shortDate, whenWords } from '@/lib/format';
import { isOpenIssue, issuePath } from '@/lib/issues';
import { softly } from '@/lib/motion';
import { useResource } from '@/lib/useResource';

type Tab = 'all' | 'ok' | 'problem' | 'missing';
const PAGE = 40;
const KIND_ORDER: Record<SlotKind, number> = { problem: 0, missing: 1, reading: 2, ok: 3 };
const SHELF_WORD: Record<SlotKind, string> = { ok: 's-ok', problem: 's-pr', missing: 's-mi', reading: 's-rd' };

function addHref(companyId: string, slotKey?: string): string {
  return `/documents/add?company=${companyId}${slotKey ? `&slot=${slotKey}` : ''}`;
}

/** Links are short-lived and always download, so they're asked for only when needed. */
function DownloadButton({ documentId }: { documentId: string }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const download = async () => {
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
      <button className="lnk" type="button" disabled={busy} aria-busy={busy} onClick={() => void download()}>
        {busy ? 'Getting it' : 'Download'}
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
      <button className="lnk" type="button" onClick={() => setAsking(true)}>
        Remove this document
      </button>
    );
  }
  return (
    <div className="xb" data-testid="remove-confirm" style={{ gap: 10 }}>
      <p>This deletes the file for good.{filed ? ' It will stop counting towards the score.' : ''}</p>
      <div className="xl">
        <button className="btn btn-g btn-sm" type="button" disabled={busy} onClick={() => void remove()}>
          {busy ? 'Removing' : 'Yes, remove it'}
        </button>
        <button className="btn btn-g btn-sm" type="button" disabled={busy} onClick={() => setAsking(false)}>
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

interface SlotFacts {
  slot: VaultSlotView;
  kind: SlotKind;
  document: VaultDocument | undefined;
  open: IssueSummary[];
  issue: IssueSummary | undefined;
  points: number;
  urgent: boolean;
}

function found(facts: SlotFacts): string {
  const { slot, document, kind } = facts;
  if (kind === 'problem') {
    if (slot.state === 'declared_missing') return "You told us the company doesn't have this. It counts as a gap until you add it.";
    if (slot.state === 'needs_confirmation') return 'Vero has read it. It counts once you confirm where it belongs.';
    return document?.rejectionReason ?? "This copy doesn't count yet.";
  }
  if (kind === 'reading') return 'Vero is reading it now.';
  if (kind === 'missing') return slot.reason;
  if (document?.expiresOn) return `Read and in order. Runs out on ${longDate(document.expiresOn)}.`;
  if (slot.key === CERTIFICATE_SLOT && document?.documentDate) return `Certified ${longDate(document.documentDate)}.`;
  if (document?.documentDate) return `Read and in order, dated ${longDate(document.documentDate)}.`;
  return 'Read and in order.';
}

function Documents() {
  const session = useSession();
  const params = useSearchParams();
  const companies = session.root ? [session.root, ...session.related] : [];
  const companyId = params.get('company') ?? session.root?.id ?? '';
  const company = session.companies.find((item) => item.id === companyId);
  const following = company?.relationship === 'follow';
  const [tab, setTab] = useState<Tab>('all');
  const [limit, setLimit] = useState(PAGE);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [projection, setProjection] = useState<ProjectionResponse | null>(null);

  const resource = useResource<{ vault: VaultResponse; issues: IssueSummary[] } | null>(async () => {
    if (!companyId) return null;
    const vault = await api.vault.get({ params: { companyId } });
    // What each slot is worth comes from the findings. Without them, the list still shows.
    const list = await api.results.issues({ params: { companyId }, query: { scope: 'company', outcome: 'all' } }).catch(() => null);
    return { vault, issues: list?.issues ?? [] };
  }, [companyId]);

  const vault = resource.data?.vault;
  const issues = useMemo(() => resource.data?.issues ?? [], [resource.data]);
  const facts = useMemo<SlotFacts[]>(() => {
    if (!vault) return [];
    return vault.slots
      .map((slot) => {
        const mine = issues.filter((issue) => slot.ruleKeys.includes(issue.ruleKey));
        const open = mine.filter(isOpenIssue);
        return {
          slot,
          kind: slotKind(slot.state),
          document: vault.documents.find((document) => document.id === slot.documentId),
          open,
          issue: mine.find((issue) => issue.declaredMissing) ?? mine.find((issue) => issue.canDeclareMissing) ?? open[0] ?? mine[0],
          points: Math.max(0, ...open.map((issue) => issue.points ?? 0)),
          urgent: open.some((issue) => issue.severity === 'critical'),
        };
      })
      .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || Number(b.urgent) - Number(a.urgent) || b.points - a.points);
  }, [vault, issues]);

  const counts = useMemo(() => {
    const result = { ok: 0, problem: 0, missing: 0, reading: 0 };
    for (const item of facts) result[item.kind] += 1;
    return result;
  }, [facts]);

  // The slot to fill first: an empty one tied to an open finding, the urgent ones first.
  const best = facts.find((item) => (item.kind === 'missing' || item.slot.state === 'declared_missing') && item.open.length > 0) ?? facts.find((item) => item.kind === 'missing');
  const bestKey = best?.open.map((issue) => issue.ruleKey).join(',') ?? '';
  const urgentOpen = issues.filter((issue) => isOpenIssue(issue) && issue.severity === 'critical');
  useEffect(() => {
    setProjection(null);
    if (!best || best.open.length === 0 || !companyId) return;
    let live = true;
    // An urgent cap holds every single fix at +0, so the card shows what clearing the urgent ones does.
    const ruleKeys = best.urgent ? [...new Set([...best.open, ...urgentOpen].map((issue) => issue.ruleKey))] : best.open.map((issue) => issue.ruleKey);
    api.results.projection({ params: { companyId }, query: { scope: 'company' }, body: { ruleKeys } }).then(
      (value) => live && setProjection(value),
      () => undefined, // The card still offers the slot without the figure.
    );
    return () => {
      live = false;
    };
  }, [companyId, bestKey, urgentOpen.length]);

  if (resource.loading && !vault) {
    return (
      <div style={{ display: 'contents' }}>
        <Loading what="Getting your documents" />
      </div>
    );
  }
  if (resource.error) {
    return (
      <div style={{ display: 'contents' }}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </div>
    );
  }
  if (!vault) return null;

  const canAct = vault.canUpload && !following;
  // Facts are sorted with the slots that need something first, so the shelf shows those.
  const shelf = facts.slice(0, 8);
  const shown = facts.filter((item) => tab === 'all' || item.kind === tab);
  const lastRead = vault.documents.map((document) => document.uploadedAt).sort().at(-1);
  const waiting = vault.documents.filter((document) => document.status === 'failed' || ((document.status === 'pending' || document.status === 'processing' || document.status === 'needs_confirmation') && !vault.slots.some((slot) => slot.documentId === document.id)));
  const name = (company ?? session.root)?.legalName ?? 'this company';
  const moves = projection !== null && projection.projected > projection.current;

  return (
    <div className="pg-documents" style={{ display: 'contents' }}>
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Your documents" /> · <b><Scramble text="Shared / Read / Checked" delay={160} /></b>
            </div>
            <h1 className="disp">
              <Words text="Documents" />
            </h1>
            <div className="meta">
              <span>{name}</span>
              <span data-testid="documents-count">
                {vault.filledCount} of {plural(vault.totalCount, 'document', 'documents')} in place
              </span>
              {lastRead ? <span>Last shared {['Today', 'Yesterday'].includes(whenWords(lastRead)) ? whenWords(lastRead).toLowerCase() : whenWords(lastRead)}</span> : null}
            </div>
          </div>
          {canAct ? (
            <div className="acts">
              <TLink className="btn btn-g" href={addHref(companyId)}>
                <Icon name="upload" />
                Upload
              </TLink>
            </div>
          ) : null}
        </div>
        {companies.length > 1 ? (
          <div className="seg" role="group" aria-label="Choose a company">
            {companies.map((item) => (
              <TLink key={item.id} className={item.id === companyId ? 'on' : undefined} href={`/documents?company=${item.id}`} aria-current={item.id === companyId ? 'true' : undefined}>
                {item.legalName}
              </TLink>
            ))}
          </div>
        ) : null}

        <section className="r1">
          <div className="mod health file2">
            <div className="l">
              <div className="mh" style={{ padding: 0 }}>
                <h2>Company file</h2>
              </div>
              <p>
                The {plural(vault.totalCount, 'document', 'documents')} Vero reads or expects for {name.replace(/\.$/, '')}.
              </p>
              <div className="cnt">
                <div>
                  <CountUp className="pixel" value={counts.ok} />
                  <span>in order</span>
                </div>
                <div>
                  <CountUp className="pixel pr" value={counts.problem} />
                  <span>with a problem</span>
                </div>
                <div>
                  <CountUp className="pixel mi" value={counts.missing} />
                  <span>missing</span>
                </div>
                {counts.reading > 0 ? (
                  <div>
                    <CountUp className="pixel rd" value={counts.reading} />
                    <span>being read</span>
                  </div>
                ) : null}
              </div>
              <div className="fnote">Empty slots never lower the score. Filling them can raise it.</div>
            </div>
            <div className="shelfw">
              <div className="shelf" role="group" aria-label={`The company file, drawn as ${plural(shelf.length, 'paper', 'papers')}`}>
                {shelf.map((item, index) => {
                  const words = item.slot.state === 'missing' && item.urgent ? 'Not found' : item.slot.stateWord;
                  const tone = item.slot.state === 'missing' && item.urgent ? 's-ur' : SHELF_WORD[item.kind];
                  const body = (
                    <>
                      <PaperArt kind={item.kind} gain={item.kind === 'missing' ? item.points : null} />
                      <b>{item.slot.label}</b>
                      <small className={tone}>{words}</small>
                    </>
                  );
                  const style = { '--k': index } as CSSProperties;
                  return canAct && item.kind !== 'ok' && item.kind !== 'reading' ? (
                    <TLink key={item.slot.key} className="pap" style={style} href={item.slot.state === 'needs_confirmation' && item.slot.documentId ? `/documents/add?company=${companyId}&document=${item.slot.documentId}` : item.slot.state === 'not_accepted' && item.slot.documentId ? `/documents/${item.slot.documentId}/rejected` : addHref(companyId, item.slot.key)}>
                      {body}
                    </TLink>
                  ) : (
                    <div key={item.slot.key} className="pap" style={style}>
                      {body}
                    </div>
                  );
                })}
              </div>
              {facts.length > shelf.length ? <div className="more">and {plural(facts.length - shelf.length, 'more', 'more')}, listed below</div> : null}
            </div>
          </div>

          {!vault.canUpload ? (
            <div className="mod next" data-testid="documents-locked">
              <div className="k">Add documents</div>
              <h3>Adding documents is part of a paid plan</h3>
              <p>The first read comes from public records and your answers, so you don&apos;t need any documents to see it. Adding them lets Vero check what registries can&apos;t.</p>
              <TLink className="btn" href="/plan">
                See the plans
              </TLink>
            </div>
          ) : following ? (
            <div className="mod next">
              <div className="k">Followed company</div>
              <h3>Only its own team can add documents</h3>
              <p>You can see what Vero has read for {name}, not change it.</p>
              <TLink className="btn" href="/issues">
                See the findings
              </TLink>
            </div>
          ) : best ? (
            <div className="mod next">
              <svg className="art" viewBox="0 0 110 110" aria-hidden="true">
                <g transform="rotate(7 55 55)">
                  <rect className="a1" x="34" y="10" width="58" height="76" rx="8" />
                  <rect className="a2" x="22" y="20" width="58" height="76" rx="8" strokeWidth="2" strokeDasharray="6 5" />
                  <path className="a3" d="M51 46v24M39 58h24" strokeWidth="2.6" strokeLinecap="round" />
                </g>
              </svg>
              <div className="k">Fill an empty slot</div>
              <h3>Add the {midSentence(best.slot.label)}</h3>
              <p>{best.slot.reason}</p>
              {moves && projection ? (
                <div className="imp">
                  <CountUp className="pixel from" value={projection.current} />
                  <Icon name="chev" />
                  <CountUp className="pixel to" value={projection.projected} ms={1600} />
                  <span className="lab">{best.urgent ? (urgentOpen.length > 1 ? 'with every urgent finding cleared, lifting the cap' : 'lifts the urgent cap') : `adds ${plural(projection.gain, 'point', 'points')}`}</span>
                </div>
              ) : null}
              <TLink className="btn" href={addHref(companyId, best.slot.key)}>
                Add a document
              </TLink>
            </div>
          ) : (
            <div className="mod next">
              <div className="k">Company file</div>
              <h3>Everything Vero expects is on file</h3>
              <p>Vero reads each one again on every scan. Add anything new and it is matched to the checks it can clear.</p>
              <TLink className="btn" href={addHref(companyId)}>
                Add a document
              </TLink>
            </div>
          )}
        </section>
      </Hero>

      <After>
        {waiting.length > 0 ? (
          <Reveal as="section" className="mod wait" data-testid="documents-waiting">
            <div className="mh">
              <h2>Waiting for you</h2>
            </div>
            <div className="wl">
              {waiting.map((document) => (
                <div className="wi" key={document.id}>
                  <div>
                    <b>{document.fileName ?? 'A document'}</b>
                    <small>{document.status === 'failed' ? (document.rejectionReason ?? "Vero couldn't read this file.") : document.status === 'needs_confirmation' ? 'Vero has read it. It counts once you confirm where it belongs.' : 'Vero is reading it now.'}</small>
                  </div>
                  {document.status === 'needs_confirmation' && canAct ? (
                    <TLink className="lnk" href={`/documents/add?company=${companyId}&document=${document.id}`}>
                      Confirm
                    </TLink>
                  ) : document.status === 'failed' ? (
                    <TLink className="lnk" href={`/documents/${document.id}/rejected`}>
                      See why
                    </TLink>
                  ) : (
                    <span className="st2" style={{ color: 'var(--sky-2)' }}>
                      {document.stateWord}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        ) : null}

        <Reveal as="section" className="mod" i={1}>
          <div className="mh">
            <h2>All documents</h2>
            <span className="sub">{company?.countryCoverage ? company.countryCoverage.sentence : 'Shared by you, read by Vero'}</span>
          </div>
          <div className="tabsw">
            <div className="tabs" role="tablist" aria-label="Filter documents" onKeyDown={arrowKeys}>
              {(
                [
                  ['all', 'All', facts.length],
                  ['ok', 'In order', counts.ok],
                  ['problem', 'Problem', counts.problem],
                  ['missing', 'Missing', counts.missing],
                ] as const
              ).map(([id, label, count]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`documents-tab-${id}`}
                  aria-selected={tab === id}
                  aria-controls="documents-panel"
                  tabIndex={tab === id ? 0 : -1}
                  className={`tab${tab === id ? ' on' : ''}`}
                  onClick={() =>
                    softly(() => {
                      setTab(id);
                      setLimit(PAGE);
                    })
                  }
                >
                  {label} <span className="n2">{count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="tpanel" id="documents-panel" role="tabpanel" aria-labelledby={`documents-tab-${tab}`}>
            <table className="docs">
              <thead>
                <tr>
                  <th style={{ width: '27%' }}>Document</th>
                  <th className="hs">Where it came from</th>
                  <th className="hs">Shared</th>
                  <th className="hm" style={{ width: '30%' }}>
                    What Vero found
                  </th>
                  <th className="hm">Status</th>
                  <th aria-label="Action" />
                </tr>
              </thead>
              <tbody className="rows-in">
                {shown.slice(0, limit).map((item, index) => {
                  const { slot, document } = item;
                  const open = openRow === slot.key;
                  const toggle = () => setOpenRow(open ? null : slot.key);
                  const bodyId = `slot-${slot.key}`;
                  return (
                    <Fragment key={slot.key}>
                      <tr
                        className={`f${open ? ' open' : ''}`}
                        style={{ '--r': Math.min(index, 12) } as CSSProperties}
                        data-testid="slot-row"
                        data-slot={slot.key}
                        onClick={(event) => {
                          if (!(event.target as HTMLElement).closest('a,button')) toggle();
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape' && open) setOpenRow(null);
                        }}
                      >
                        <td>
                          <div className="ft2">
                            <b>{slot.label}</b>
                            <small>
                              {slot.layerName} · {slot.jurisdiction}
                            </small>
                            <span className="st2 mst" style={{ color: item.kind === 'missing' && item.urgent ? 'var(--urgent)' : slotColour(slot.state) }}>
                              {item.kind === 'missing' && item.urgent ? 'Not found' : slot.stateWord}
                            </span>
                          </div>
                        </td>
                        <td className="src2 hs">{document ? 'Shared by you' : 'Expected from you'}</td>
                        <td className="muted hs">{document ? shortDate(document.uploadedAt) : '-'}</td>
                        <td className="fd hm">{found(item)}</td>
                        <td className="hm">
                          <span className="st2" style={{ color: item.kind === 'missing' && item.urgent ? 'var(--urgent)' : slotColour(slot.state) }}>
                            {item.kind === 'missing' && item.urgent ? 'Not found' : slot.stateWord}
                          </span>
                        </td>
                        <td className="act">
                          {!canAct ? null : slot.state === 'missing' || slot.state === 'declared_missing' ? (
                            <TLink className={`btn ${item.urgent ? 'btn-p' : 'btn-g'} bsm`} href={addHref(companyId, slot.key)}>
                              Upload
                            </TLink>
                          ) : slot.state === 'needs_confirmation' && slot.documentId ? (
                            <TLink className="lnk" href={`/documents/add?company=${companyId}&document=${slot.documentId}`}>
                              Confirm
                            </TLink>
                          ) : slot.state === 'not_accepted' && slot.documentId ? (
                            <TLink className="lnk" href={`/documents/${slot.documentId}/rejected`}>
                              See why
                            </TLink>
                          ) : isInPlace(slot.state) && slot.documentId ? (
                            <DownloadButton documentId={slot.documentId} />
                          ) : null}
                          <button className="tog" type="button" aria-expanded={open} aria-controls={open ? bodyId : undefined} aria-label={`More about ${slot.label}`} data-testid="slot-toggle" onClick={toggle}>
                            <Icon name="chev" />
                          </button>
                        </td>
                      </tr>
                      {open ? (
                        <tr
                          className="xr"
                          id={bodyId}
                          onKeyDown={(event) => {
                            if (event.key !== 'Escape') return;
                            setOpenRow(null);
                            event.currentTarget.previousElementSibling?.querySelector<HTMLElement>('.tog')?.focus();
                          }}
                        >
                          <td colSpan={6}>
                            <div className="xb">
                              <p>{slot.reason}</p>
                              {document?.fileName ? (
                                <p>
                                  {document.fileName}
                                  {document.pages ? `, ${plural(document.pages, 'page', 'pages')}` : ''}. Shared {longDate(document.uploadedAt)}.{document.signatureHintWords ? ` ${document.signatureHintWords}` : ''}
                                </p>
                              ) : null}
                              {canAct && item.issue && (item.issue.canDeclareMissing || item.issue.declaredMissing) ? <DeclareMissing key={`${item.issue.ruleKey}-${String(item.issue.declaredMissing)}`} item={item.issue} onChanged={resource.reload} /> : null}
                              <div className="xl">
                                {item.open[0] ? (
                                  <TLink className="lnk" href={issuePath(item.open[0])}>
                                    See the finding
                                  </TLink>
                                ) : null}
                                {canAct && slot.documentId && document ? <RemoveDocument documentId={slot.documentId} filed={document.status === 'filed'} onRemoved={resource.reload} /> : null}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
                {shown.length === 0 ? (
                  <tr className="emptyrow" data-testid="empty-state">
                    <td colSpan={6}>
                      {facts.length === 0 ? (
                        <>
                          <b>Nothing to add yet</b>
                          <span>Vero lists what this company should have once it knows more about it. Answering the questions is the quickest way.</span>
                          {canAct ? (
                            <TLink className="btn btn-g btn-sm" href={`/onboarding/questions?company=${companyId}`}>
                              Answer the questions
                            </TLink>
                          ) : null}
                        </>
                      ) : tab === 'problem' ? (
                        <>
                          <b>Nothing with a problem</b>
                          <span>Every document Vero has read can count.</span>
                        </>
                      ) : tab === 'missing' ? (
                        <>
                          <b>Nothing missing</b>
                          <span>Every slot has a document.</span>
                        </>
                      ) : (
                        <>
                          <b>Nothing in order yet</b>
                          <span>Documents show here once you add one and confirm where it belongs.</span>
                          {canAct ? (
                            <TLink className="btn btn-p btn-sm" href={addHref(companyId)}>
                              Add a document
                            </TLink>
                          ) : null}
                        </>
                      )}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {shown.length > limit ? (
            <div className="moreb">
              <button className="btn btn-g btn-sm" type="button" onClick={() => setLimit((value) => value + PAGE)}>
                Show {Math.min(PAGE, shown.length - limit)} more of {shown.length}
              </button>
            </div>
          ) : null}
          <div className="foot2">
            <Icon name="lock" />
            Documents you share are read by Vero only. People you share a report with see findings, never your files.
            {!vault.canUpload ? (
              <>
                {' '}
                <PlanLink />
              </>
            ) : null}
          </div>
        </Reveal>
      </After>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Documents />
    </Suspense>
  );
}
