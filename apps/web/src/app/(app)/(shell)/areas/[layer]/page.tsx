'use client';

/* One area (the Area board): the area's score on the navy light with one slot per kind of check,
   the fix that matters most here, every check in the area, how it is scored, and what Vero reads. */

import type { AreaResponse, Company, IssueSummary, VaultResponse } from '@vero/shared';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, Suspense, useMemo, useState, type CSSProperties } from 'react';
import { ErrorState, Loading, PlanLink, SampleNote } from '@/components/Bits';
import { DeclareMissing } from '@/components/DeclareMissing';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { TONE_COLOUR } from '@/components/overview/OverviewBody';
import { NextCard, PixelScore, scanWhen, URGENT_CAP, useFixProjection } from '@/components/overview/parts';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { isToDo, slotTone } from '@/lib/documents';
import { plural, POINTS_HELD_WORDS } from '@/lib/format';
import { FINDING_COLOUR, FINDING_WORDS, findingSource, findingStatus, issueKey, issuePath, pointsLabel } from '@/lib/issues';
import { useResource } from '@/lib/useResource';
import { statusTone } from '@/lib/words';
import '@/app/styles/pages/area.css';

const HERO_TONE = { good: '#5EEAD4', watch: '#FCD34D', risk: '#FF8A8E', none: 'rgba(255,255,255,.6)' } as const;

interface Slot {
  key: string;
  kind: 'urg' | 'fix' | 'ok' | 'emp';
  name: string;
  word: string;
}

/** Five slots at most: each open finding on its own (up to three), then the passed and unseen checks together. */
function slotsFor(area: AreaResponse): Slot[] {
  const out: Slot[] = area.toFix.slice(0, area.toFix.length > 3 ? 2 : 3).map((issue) => ({
    key: issueKey(issue),
    kind: issue.severity === 'critical' ? 'urg' : 'fix',
    name: issue.title ?? issue.headline,
    word: issue.severityWord,
  }));
  if (area.toFix.length > 3) out.push({ key: 'more-fix', kind: 'fix', name: `${area.toFix.length - 2} more`, word: 'To fix' });
  if (area.inGoodShape.length > 0) out.push({ key: 'ok', kind: 'ok', name: plural(area.inGoodShape.length, 'check', 'checks'), word: 'In good shape' });
  if (area.toCheck.length > 0) out.push({ key: 'emp', kind: 'emp', name: plural(area.toCheck.length, 'check', 'checks'), word: 'Not seen yet' });
  return out;
}

function AreaHero({ area, companyId, scope, rank, heldByUrgent }: { area: AreaResponse; companyId: string; scope: 'company' | 'group'; rank: string | null; heldByUrgent: boolean }) {
  const tone = statusTone(area.statusWord);
  const first = area.toFix[0] ?? null;
  const projection = useFixProjection(companyId, scope, first ? { companyId: first.companyId, ruleKey: first.ruleKey } : null, heldByUrgent, true);
  const slots = slotsFor(area);
  return (
    <section className="r1">
      <div className="mod health ap">
        <div className="l">
          <div className="mh" style={{ padding: 0 }}>
            <h2>Area score</h2>
            {area.statusWord ? (
              <span className="st2" style={{ color: HERO_TONE[tone], marginLeft: 'auto' }}>
                {area.statusWord}
              </span>
            ) : null}
          </div>
          <div className="big">
            <PixelScore score={area.score !== null ? { kind: 'exact', value: area.score } : { kind: 'none' }} testId="area-score" />
            <small>/ 100</small>
          </div>
          <div className="verdict">
            {rank ? `${rank} ` : ''}
            {area.toFix.length === 0 ? 'Nothing to fix here right now.' : area.toFix.length === 1 ? 'One thing to fix here.' : `${area.toFix.length} things to fix here.`}
          </div>
          <div className="cmp" data-testid="score-basis">
            {area.coverage.total > 0 ? (
              <>
                Scored on{' '}
                <b>
                  {area.coverage.counted} of {area.coverage.total}
                </b>{' '}
                checks.
              </>
            ) : (
              'Nothing here applies yet, so there is nothing to score.'
            )}
            {area.capped ? ` An urgent gap holds this area at ${URGENT_CAP} or below.` : ''}
          </div>
        </div>
        <div className="r">
          <h2>What this area covers</h2>
          <p>{area.description}.</p>
          {area.cappedExplanation ? (
            <p className="ar-capped" data-testid="area-capped">
              {area.cappedExplanation}
            </p>
          ) : null}
          {slots.length > 0 ? (
            <div className="slots" role="group" aria-label={slots.map((slot) => `${slot.name}: ${slot.word}`).join(', ')}>
              {slots.map((slot, index) => (
                <div key={slot.key} className={`slot ${slot.kind}`} style={{ '--k': index } as CSSProperties}>
                  <div className="pg" />
                  <div>
                    <b title={slot.name}>{slot.name}</b>
                    <small>{slot.word}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {first ? (
        <NextCard
          title={first.headline}
          body={`${first.severityWord}, ${first.companyName}.${first.declaredMissing ? " You told us you don't have this." : ''}`}
          href={issuePath(first)}
          projection={projection}
          note={first.pointsHeldByUrgent && !projection ? <span data-testid="points-held">{POINTS_HELD_WORDS}</span> : null}
        />
      ) : (
        <NextCard title="Nothing to fix in this area" body="Every check Vero could run here passed, or is waiting on a document." href="/" action="Back to overview" />
      )}
    </section>
  );
}

type Row = { issue: IssueSummary; kind: 'fix' | 'ok' | 'check' };

function Checks({ area, group, readOnly, onChanged }: { area: AreaResponse; group: boolean; readOnly: boolean; onChanged: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [allGood, setAllGood] = useState(false);
  const good = allGood ? area.inGoodShape : area.inGoodShape.slice(0, 6);
  const rows: Row[] = [...area.toFix.map((issue) => ({ issue, kind: 'fix' as const })), ...area.toCheck.map((issue) => ({ issue, kind: 'check' as const })), ...good.map((issue) => ({ issue, kind: 'ok' as const }))];
  return (
    <Reveal as="section" className="mod" i={0}>
      <div className="mh">
        <h2>Checks in this area</h2>
        <span className="sub">Open findings first, then what Vero hasn&apos;t seen, then what passed</span>
      </div>
      {rows.length === 0 ? (
        <p className="vempty">
          <b>No checks apply here yet</b>
          They show up as soon as one applies to {group ? 'one of your companies' : 'the company'}.
        </p>
      ) : (
        <table className="ar-t vtable">
          <thead>
            <tr>
              <th style={{ width: '46%' }}>Check</th>
              <th className="opt">Source</th>
              <th>Status</th>
              <th className="opt">Impact</th>
              <th className="opt" aria-label="Open" />
            </tr>
          </thead>
          <tbody className="rows-in">
            {rows.map(({ issue, kind }, index) => {
              const status = findingStatus(issue);
              const key = issueKey(issue);
              const expanded = open === key;
              const points = pointsLabel(issue);
              const name = kind === 'fix' ? issue.headline : (issue.title ?? issue.headline);
              const go = () => (kind === 'check' ? setOpen(expanded ? null : key) : router.push(issuePath(issue)));
              return (
                <Fragment key={key}>
                  <tr className={`f${kind === 'ok' ? ' dim' : ''}`} style={{ '--r': Math.min(index, 14) } as CSSProperties} onClick={go} data-testid={kind === 'fix' ? 'area-fix' : 'area-check'}>
                    <td>
                      <div className="ft2">
                        <b>
                          {kind === 'check' ? (
                            <button type="button" className="rowlink ar-toggle" aria-expanded={expanded} onClick={(event) => (event.stopPropagation(), go())}>
                              {name}
                            </button>
                          ) : (
                            <TLink className="rowlink" href={issuePath(issue)} onClick={(event) => event.stopPropagation()}>
                              {name}
                            </TLink>
                          )}
                        </b>
                        <small>
                          {kind === 'fix' && issue.declaredMissing ? "You told us you don't have this. " : ''}
                          {group ? issue.companyName : issue.countryLabel}
                        </small>
                      </div>
                    </td>
                    <td className="src2 opt">{kind === 'check' && findingSource(issue).kind === 'none' ? 'No source yet' : findingSource(issue).label}</td>
                    <td>
                      <span className="st2" style={{ color: kind === 'ok' ? 'var(--good)' : FINDING_COLOUR[status] }}>
                        {kind === 'ok' ? 'In good shape' : kind === 'check' ? 'Not seen yet' : FINDING_WORDS[status]}
                      </span>
                    </td>
                    <td className="opt">{points ? <span className="gain">{points.replace(/ points?$/, '')}</span> : kind === 'fix' && issue.pointsHeldByUrgent ? (
                        <span className="muted" title={POINTS_HELD_WORDS} data-testid="points-held">
                          Held
                        </span>
                      ) : (
                        <span className="muted">{kind === 'check' ? 'Not counted' : '-'}</span>
                      )}</td>
                    <td className="opt" style={{ width: 40, color: 'var(--ink-4)' }}>
                      <Icon name={kind === 'check' ? 'chevd' : 'chev'} className={expanded ? 'ar-up' : undefined} />
                    </td>
                  </tr>
                  {kind === 'check' && expanded ? (
                    <tr className="ar-more">
                      <td colSpan={5}>
                        <p>
                          <b>How Vero knows:</b> {issue.howWeKnow.length > 0 ? issue.howWeKnow.join(' ') : "Vero hasn't seen anything on this yet."} It doesn&apos;t count for or against the score until Vero can check it.
                        </p>
                        {!readOnly && issue.canDeclareMissing ? <DeclareMissing item={issue} onChanged={onChanged} /> : null}
                        <TLink className="link" href={issuePath(issue)}>
                          See the details
                        </TLink>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
      {area.inGoodShape.length > good.length || allGood ? (
        <div className="vmore">
          <span className="muted">{plural(area.inGoodShape.length, 'check', 'checks')} in good shape.</span>
          <button type="button" className="link" onClick={() => setAllGood((value) => !value)}>
            {allGood ? 'Show fewer' : 'Show them all'}
          </button>
        </div>
      ) : null}
    </Reveal>
  );
}

function HowScored({ area }: { area: AreaResponse }) {
  const thin = area.coverage.total > 0 && area.coverage.counted < area.coverage.total / 2;
  return (
    <Reveal className="mod" i={0}>
      <div className="mh">
        <h2>How this area is scored</h2>
      </div>
      <div className="how">
        <div className="rw">
          <b>Urgent gaps</b>
          <p>An urgent gap anywhere holds the overall score at {URGENT_CAP}, however strong the other areas are.{area.capped ? ' One is doing that here.' : ''}</p>
        </div>
        <div className="rw">
          <b>Not seen yet</b>
          <p>
            Checks waiting on a document never lower the score.{' '}
            {area.toCheck.length > 0 ? `${plural(area.toCheck.length, 'check', 'checks')} here count once Vero sees the document.` : 'None are waiting here.'}
          </p>
        </div>
        <div className="rw">
          <b>Thin areas</b>
          <p>{thin ? 'This area is scored on less than half of its checks, so it reads as early. Adding documents helps.' : 'An area scored on only a few checks reads as early, so adding documents helps.'}</p>
        </div>
      </div>
    </Reveal>
  );
}

function Reads({ companies, layer }: { companies: readonly Company[]; layer: number }) {
  const ids = companies.map((company) => company.id).join(',');
  const vaults = useResource(() => Promise.all(companies.map((company) => api.vault.get({ params: { companyId: company.id } }).catch(() => null))), [ids]);
  const slots = (vaults.data ?? [])
    .filter((vault): vault is VaultResponse => vault !== null)
    .flatMap((vault) => vault.slots.filter((slot) => slot.layer === layer).map((slot) => ({ slot, company: companies.find((company) => company.id === vault.companyId)?.legalName ?? '' })))
    .sort((a, b) => Number(isToDo(b.slot.state)) - Number(isToDo(a.slot.state)));
  const shown = slots.slice(0, 6);
  return (
    <Reveal className="mod" i={1}>
      <div className="mh">
        <h2>What Vero reads here</h2>
      </div>
      {vaults.loading && !vaults.data ? (
        <p className="vempty">Getting your documents</p>
      ) : shown.length === 0 ? (
        <p className="vempty">No documents are read for this area. Vero checks it from the registers.</p>
      ) : (
        <div className="reads rows-in">
          {shown.map(({ slot, company }, index) => (
            <div className="rw" key={`${company}-${slot.key}`} style={{ '--r': index } as CSSProperties}>
              <div>
                <b>{slot.label}</b>
                <small>{companies.length > 1 ? company : slot.reason}</small>
              </div>
              <span className="s" style={{ color: TONE_COLOUR[slotTone(slot.state)] }}>
                {slot.stateWord}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="vmore">
        <span className="muted">{slots.length > shown.length ? `${shown.length} of ${plural(slots.length, 'document', 'documents')}` : ' '}</span>
        <TLink className="link" href="/documents">
          Documents
        </TLink>
      </div>
    </Reveal>
  );
}

function AreaScreen() {
  const params = useParams<{ layer: string }>();
  const search = useSearchParams();
  const session = useSession();
  const layer = Number(params.layer);
  const validLayer = Number.isInteger(layer) && layer >= 1 && layer <= 6;
  const followedId = search.get('company');
  const followed = useResource(() => (followedId ? api.companies.get({ params: { companyId: followedId } }) : Promise.resolve(null)), [followedId]);
  const company = followedId ? (followed.data ?? null) : session.root;
  const readOnly = company?.relationship === 'follow';
  const companies = useMemo(() => (company ? (followedId ? [company] : [company, ...session.related]) : []), [company, followedId, session.related]);
  const scope = followedId ? 'company' : session.scope;
  const companyId = company?.id ?? '';
  const summary = session.overview?.areas.find((item) => item.layer === layer);
  // The API refuses this for a plan without area reports, so it isn't asked.
  const locked = summary?.locked ?? false;

  const resource = useResource<AreaResponse | null>(async () => {
    if (!validLayer || locked || !companyId) return null;
    return api.results.area({ params: { companyId, layer }, query: { scope } });
  }, [companyId, layer, locked, validLayer, scope]);
  const area = resource.data;

  // "Your lowest area" when it is: the overview lists every area's score.
  const rank = useMemo(() => {
    if (followedId || !area || area.score === null) return null;
    const scored = (session.overview?.areas ?? []).filter((item) => item.score !== null);
    if (scored.length < 2) return null;
    const lowest = Math.min(...scored.map((item) => item.score ?? 101));
    const highest = Math.max(...scored.map((item) => item.score ?? -1));
    if (area.score === lowest) return 'Your lowest area.';
    if (area.score === highest) return 'Your strongest area.';
    return null;
  }, [area, session.overview, followedId]);

  const back = followedId ? `/watchlist/${followedId}` : '/';
  const name = area?.name ?? summary?.name ?? 'Area';
  const crumb = (
    <>
      <TLink href={back}>{followedId && company ? company.legalName : 'Overview'}</TLink>
      <Icon name="chev" />
      <b>{name}</b>
    </>
  );
  const checks = area ? area.toFix.length + area.inGoodShape.length + area.toCheck.length : 0;

  return (
    <div className="pg-area">
      <Hero crumb={crumb}>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="One area" /> · <b><Scramble text="Checks / Findings / Proof" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text={validLayer ? name : "That area doesn't exist"} />
            </h1>
            {validLayer && company ? (
              <div className="meta">
                <span>{companies.length > 1 ? `${company.legalName} and ${plural(companies.length - 1, 'related company', 'related companies')}` : company.legalName}</span>
                {area ? <span>{plural(checks, 'check', 'checks')} in this area</span> : null}
                {!followedId && session.overview?.scannedAt ? <span>Last scan {scanWhen(session.overview.scannedAt).replace(/^(Today|Yesterday)/, (word) => word.toLowerCase())}</span> : null}
              </div>
            ) : null}
          </div>
          {validLayer && !readOnly ? (
            <div className="acts">
              <TLink className="btn btn-g" href="/documents">
                <Icon name="plus" />
                Add documents
              </TLink>
            </div>
          ) : null}
        </div>
        {!validLayer ? (
          <p className="ar-note">
            <TLink className="link" href="/">
              Back to the overview
            </TLink>
          </p>
        ) : locked ? (
          <div className="mod health ap ar-locked" data-testid="area-locked">
            <div className="l">
              <div className="mh" style={{ padding: 0 }}>
                <h2>Area score</h2>
              </div>
              <div className="verdict">The report on each area is part of a paid plan.</div>
              <div className="cmp">
                <PlanLink />
              </div>
            </div>
            <div className="r">
              <h2>What this area covers</h2>
              <p>{summary?.description}.</p>
            </div>
          </div>
        ) : (resource.loading && !area) || (followedId && followed.loading && !company) ? (
          <Loading what="Getting this area" />
        ) : resource.error ? (
          <ErrorState error={resource.error} onRetry={resource.reload} />
        ) : area ? (
          <AreaHero area={area} companyId={companyId} scope={scope} rank={rank} heldByUrgent={followedId ? false : (session.overview?.heldByUrgent ?? false)} />
        ) : null}
      </Hero>
      {area ? (
        <After>
          {session.overview?.sampleData && !followedId ? (
            <div style={{ marginBottom: 16 }}>
              <SampleNote />
            </div>
          ) : null}
          <Checks area={area} group={companies.length > 1} readOnly={readOnly} onChanged={resource.reload} />
          <section className="r3b">
            <HowScored area={area} />
            {readOnly ? null : <Reads companies={companies} layer={layer} />}
          </section>
        </After>
      ) : null}
    </div>
  );
}

export default function AreaPage() {
  return (
    <Suspense fallback={<Loading what="Getting this area" />}>
      <AreaScreen />
    </Suspense>
  );
}
