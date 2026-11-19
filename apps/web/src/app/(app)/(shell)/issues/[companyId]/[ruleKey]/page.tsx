'use client';

import '@/app/styles/pages/finding.css';
import '@/app/styles/pages/docflow.css';
import type { IssueSummary, VaultResponse } from '@vero/shared';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ErrorState, Loading, PlanLink, Redline, SampleNote } from '@/components/Bits';
import { DeclareMissing } from '@/components/DeclareMissing';
import { DocumentFlow } from '@/components/DocumentFlow';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { isInPlace, midSentence, slotColour } from '@/lib/documents';
import { countryShort, plural, POINTS_HELD_WORDS, shortDate } from '@/lib/format';
import { FINDING_WORDS, findingSource, findingStatus, issueKey, issuePath, withoutReferrals } from '@/lib/issues';
import { useResource } from '@/lib/useResource';

/** The urgent cap: an open urgent finding holds the overall score at this (owner's rule, 6 Nov 2026). */
const URGENT_CAP = 74;

const KICK_CLASS = { urgent: 'su', attention: 'sw', cleared: 'sg', unseen: 'sn', na: 'sn' } as const;

const SLOT_WORDS: Record<string, string> = {
  missing: 'Not shared yet',
  declared_missing: "You told us you don't have it",
  reading: 'Being read now',
  needs_confirmation: 'Read, waiting for you to confirm',
  read: 'On file and read',
  not_accepted: 'A copy is on file but does not count yet',
};

function ScoreImpact({ from, to, capped }: { from: number; to: number; capped: boolean }) {
  const lo = Math.max(0, Math.min(Math.floor((Math.min(from, capped ? URGENT_CAP : from) - 25) / 10) * 10, 60));
  const step = 100 - lo > 60 ? 20 : 10;
  const ticks: number[] = [];
  for (let value = lo; value <= 100; value += step) ticks.push(value);
  const at = (value: number) => `${((Math.max(lo, Math.min(100, value)) - lo) / (100 - lo)) * 100}%`;
  const moves = to > from;
  return (
    <div className="trk" role="img" aria-label={`Score ${from} now${capped ? `, capped at ${URGENT_CAP}` : ''}${moves ? `, about ${to} once cleared` : ''}`}>
      <i className="now grow" style={{ width: at(from) }} />
      {moves ? <i className="gain2" style={{ left: at(from), width: `calc(${at(to)} - ${at(from)})` }} /> : null}
      {capped ? <span className="cap" style={{ left: at(URGENT_CAP) }} /> : null}
      <span className="lb n" style={{ left: at(from) }}>
        Now {from}
      </span>
      {capped ? (
        <span className="lb c" style={{ left: at(URGENT_CAP) }}>
          Urgent cap {URGENT_CAP}
        </span>
      ) : null}
      {moves ? (
        <span className="lb t" style={{ left: at(to) }}>
          About {to}
        </span>
      ) : null}
      <div className="tk" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

export default function IssuePage() {
  const params = useParams<{ companyId: string; ruleKey: string }>();
  const session = useSession();
  const toast = useToast();
  const companyId = params.companyId;
  const ruleKey = decodeURIComponent(params.ruleKey);
  const resource = useResource(() => api.results.issue({ params: { companyId, ruleKey } }), [companyId, ruleKey]);
  const issue = resource.data;
  const company = session.companies.find((item) => item.id === companyId);
  const following = company?.relationship === 'follow';
  const canUpload = issue !== undefined && issue.canAddEvidence && !following && issue.proof.length > 0 && issue.outcome !== 'pass';

  const [vault, setVault] = useState<VaultResponse | null>(null);
  const [related, setRelated] = useState<IssueSummary[]>([]);
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    setVault(null);
    if (!canUpload) return;
    let live = true;
    api.vault.get({ params: { companyId } }).then(
      (value) => live && setVault(value),
      () => undefined, // Without the list, the upload still asks where the file belongs on the next page.
    );
    return () => {
      live = false;
    };
  }, [companyId, canUpload]);

  const layer = issue?.layer;
  useEffect(() => {
    if (!layer) return;
    let live = true;
    api.results.issues({ params: { companyId }, query: { scope: 'company', outcome: 'open', layer } }).then(
      (value) => live && setRelated(value.issues.filter((item) => item.ruleKey !== ruleKey).slice(0, 3)),
      () => undefined, // Related findings are a convenience; the page stands without them.
    );
    return () => {
      live = false;
    };
  }, [companyId, ruleKey, layer]);

  const proofKey = issue?.proof.map((proof) => proof.slotKey).join(',') ?? '';
  useEffect(() => {
    const first = issue?.proof.find((proof) => !isInPlace(proof.state)) ?? issue?.proof[0];
    setChoice(first?.slotKey ?? null);
  }, [proofKey]);

  const fix = useMemo(() => withoutReferrals(issue?.fix), [issue?.fix]);

  if (resource.loading && !issue) {
    return (
      <div style={{ display: 'contents' }}>
        <Loading what="Getting this finding" />
      </div>
    );
  }
  if (resource.error || !issue) {
    return <div style={{ display: 'contents' }}>{resource.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> : null}</div>;
  }

  const status = findingStatus(issue);
  const isOpen = status === 'urgent' || status === 'attention';
  const isVerify = status === 'unseen';
  const isPass = status === 'cleared';
  const source = findingSource(issue);
  const projection = issue.projection;
  const capped = (isOpen && issue.severity === 'critical') || issue.pointsHeldByUrgent === true;
  const area = session.overview?.areas.find((item) => item.layer === issue.layer);
  const chosen = issue.proof.find((proof) => proof.slotKey === choice) ?? issue.proof[0];
  const coverage = company?.countryCoverage;
  const back = issuePath(issue);

  const copy = () => {
    const done = () => toast('Link copied');
    try {
      void navigator.clipboard.writeText(window.location.href).then(done, () => toast("Couldn't copy the link. Copy it from the address bar."));
    } catch {
      toast("Couldn't copy the link. Copy it from the address bar.");
    }
  };

  return (
    <div className="pg-finding" style={{ display: 'contents' }}>
      <Hero
        crumb={
          <TLink href="/issues">
            Findings
          </TLink>
        }
      >
        <div className="pagehead">
          <div>
            <div className="kick mono">
              <span className={KICK_CLASS[status]} data-testid="issue-chip">
                <Scramble text={isOpen ? issue.severityWord : FINDING_WORDS[status]} />
              </span>
              <span aria-hidden="true">·</span>
              <TLink href={`/areas/${issue.layer}`}>{issue.layerName}</TLink>
              <span aria-hidden="true">·</span>
              <span>{issue.companyName}</span>
            </div>
            <h1 className="disp">
              <Words text={isPass ? (issue.title ?? issue.headline) : issue.headline} />
            </h1>
            <p className="lead">{isPass ? 'Vero checked this and it is in order. It counts in the score, and Vero checks it again on every scan.' : isVerify ? (issue.reasonWords ?? issue.missing) : issue.missing}</p>
          </div>
          <div className="acts">
            <button className="btn btn-g" type="button" onClick={copy}>
              <Icon name="link" />
              Copy link
            </button>
            {canUpload ? (
              <a className="btn btn-p" href="#clear">
                <Icon name="upload" />
                Upload proof
              </a>
            ) : null}
          </div>
        </div>

        <section className="mod health impp">
          <div className="l">
            <h2>Score impact</h2>
            {isPass ? (
              <div className="nums">
                <p>
                  Counted in the score
                  <small>Clearing checks like this is what the score is made of.</small>
                </p>
              </div>
            ) : projection ? (
              <>
                <div className="nums">
                  <CountUp className="pixel from" value={projection.from} />
                  <Icon name="chev" />
                  <CountUp className="pixel to" value={projection.to} ms={1600} />
                  {projection.to > projection.from ? (
                    <p data-testid="fix-projection">
                      {capped && issue.severity === 'critical' ? 'Lifts the urgent cap' : `Adds ${plural(projection.to - projection.from, 'point', 'points')}`}
                      <small>{capped && issue.severity === 'critical' ? `and adds ${plural(projection.to - projection.from, 'point', 'points')} once cleared` : `takes ${issue.companyName} to about ${projection.to}`}</small>
                    </p>
                  ) : issue.pointsHeldByUrgent ? (
                    <p data-testid="points-held">
                      Held by the urgent cap
                      <small>{POINTS_HELD_WORDS}</small>
                    </p>
                  ) : (
                    <p>
                      No change on its own
                      <small>This won&apos;t noticeably move the score.</small>
                    </p>
                  )}
                </div>
                <ScoreImpact from={projection.from} to={projection.to} capped={capped} />
              </>
            ) : (
              <div className="nums">
                <p className="plan">
                  What clearing this does to the score is part of a paid plan. <PlanLink />
                </p>
              </div>
            )}
          </div>
          <div className="facts">
            <div>
              <span>Status</span>
              <b>{isOpen ? issue.outcomeWord : FINDING_WORDS[status]}</b>
            </div>
            <div>
              <span>Area</span>
              <b>
                <TLink href={`/areas/${issue.layer}`}>
                  {issue.layerName}
                  {area?.score !== null && area?.score !== undefined ? <span className="pixel">{area.score}</span> : null}
                </TLink>
              </b>
            </div>
            <div>
              <span>Source</span>
              <b>{source.label}</b>
            </div>
            <div>
              <span>Company</span>
              <b>
                {issue.companyName} · {countryShort(issue.country)}
              </b>
            </div>
            {issue.dueOn ? (
              <div>
                <span>Due</span>
                <b>{shortDate(issue.dueOn)}</b>
              </div>
            ) : coverage ? (
              <div title={coverage.sentence}>
                <span>Coverage</span>
                <b>{coverage.level === 'full' ? 'Full' : coverage.level === 'registry' ? 'Registry' : 'International'}</b>
              </div>
            ) : null}
          </div>
        </section>
      </Hero>

      <After>
        {session.overview?.sampleData ? (
          <div className="notes">
            <SampleNote />
          </div>
        ) : null}
        <div className="fg">
          <div className="col">
            <Reveal as="section" className="mod" i={0}>
              <div className="mh">
                <h2>{isPass ? 'What Vero checked' : 'What we found'}</h2>
              </div>
              {isVerify ? (
                <p className="note notseen" data-testid="not-seen">
                  <b>Vero hasn&apos;t seen this yet.</b>
                  {/* The API's reason can open with the same words as this heading. */}
                  {issue.reasonWords ? <span>{issue.reasonWords.replace(/^We haven't seen this yet\.\s*/, '')}</span> : <span>It doesn&apos;t count for or against the score until it can be checked.</span>}
                </p>
              ) : null}
              <div className="txt">
                <p>{isPass ? `${issue.title ?? issue.layerName}: in order for ${issue.companyName}.` : issue.missing}</p>
                {!isPass && issue.ifLeft ? <p className="if">If it&apos;s left: {issue.ifLeft}</p> : null}
                <div className="kv">
                  <div>
                    <span>Company</span>
                    <b>{issue.companyName}</b>
                  </div>
                  <div>
                    <span>Applies because</span>
                    <b>{issue.appliesBecause === 'incorporated' ? `Registered in ${issue.countryLabel}` : `Operates in ${issue.countryLabel}`}</b>
                  </div>
                  <div>
                    <span>Found by</span>
                    <b>{source.label}</b>
                  </div>
                </div>
              </div>
              {!isPass && issue.why ? (
                <>
                  <div className="sep" />
                  <div className="mh">
                    <h2>Why it matters</h2>
                  </div>
                  <div className="txt">
                    <p>{issue.why}</p>
                  </div>
                </>
              ) : null}
            </Reveal>

            {!isPass && fix ? (
              <Reveal as="section" className="mod" i={1}>
                <div className="mh">
                  <h2>How it clears</h2>
                  <span className="sub">{issue.regulator ? `With ${issue.regulator}` : 'What has to change'}</span>
                </div>
                <div className="redl">
                  <Redline fixLabel="What to do" fix={fix} />
                </div>
              </Reveal>
            ) : null}

            {!isPass ? (
              <Reveal as="section" className="mod" i={2} id="clear">
                <div className="mh">
                  <h2>What clears it</h2>
                  <span className="sub">{issue.proof.length > 1 ? 'Any of these works. Upload it and Vero checks again.' : issue.proof.length === 1 ? 'Upload it and Vero checks again.' : 'Nothing to upload for this one.'}</span>
                </div>
                {issue.proof.length > 0 ? (
                  <div className="opts" role="radiogroup" aria-label="The document that clears it" data-testid="proof">
                    {issue.proof.map((proof) => (
                      <button key={proof.slotKey} type="button" role="radio" aria-checked={chosen?.slotKey === proof.slotKey} className={`opt${chosen?.slotKey === proof.slotKey ? ' on' : ''}`} onClick={() => setChoice(proof.slotKey)}>
                        <span className="rd" />
                        <span>
                          <b>{proof.label}</b>
                          <small style={{ color: slotColour(proof.state) }}>{SLOT_WORDS[proof.state] ?? ''}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {issue.evidence.length > 0 && issue.proof.length > 0 ? (
                  <div className="will">
                    <h3>What Vero checks in the document</h3>
                    <ul>
                      {issue.evidence.map((line) => (
                        <li key={line} className={chosen && isInPlace(chosen.state) ? 'ok' : undefined}>
                          <span className="ck">
                            <Icon name="check" />
                          </span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {canUpload && chosen ? (
                  <div className="upwrap">
                    <DocumentFlow key={chosen.slotKey} companyId={companyId} slots={vault?.slots ?? []} wantedSlot={chosen.slotKey} backHref={back} compact dropTitle={`Upload the ${midSentence(chosen.label)}`} onChanged={resource.reload} />
                  </div>
                ) : following ? (
                  <p className="dnote">You follow {issue.companyName}, so you can read its findings. Only its own team can add proof.</p>
                ) : issue.proof.length > 0 && !issue.canAddEvidence ? (
                  <p className="dnote">
                    Only the team that owns this company, on a plan with documents, can add the proof. <PlanLink />
                  </p>
                ) : issue.proof.length === 0 ? (
                  <p className="dnote">
                    <b>Nothing to upload.</b> {source.kind === 'reg' ? `Vero reads ${source.label} on every scan, so this clears on its own once the register shows it.` : 'Vero checks this again on every scan, so it clears on its own once the change is made.'}
                  </p>
                ) : null}
                {!following && (issue.canDeclareMissing || issue.declaredMissing) ? (
                  <div className="declare">
                    <DeclareMissing key={`${issue.ruleKey}-${String(issue.declaredMissing)}`} item={issue} onChanged={resource.reload} />
                  </div>
                ) : null}
              </Reveal>
            ) : null}
          </div>

          <div className="col">
            <Reveal as="section" className="mod" i={1}>
              <div className="mh">
                <h2>Where we looked</h2>
              </div>
              <div className="lst" data-testid="how-we-know">
                {issue.howWeKnow.length > 0 ? (
                  issue.howWeKnow.map((line) => (
                    <div className="it" key={line}>
                      <b>{line.replace(/\s*\(sample data, not a real record\)/i, '')}</b>
                      <small>
                        {/sample data/i.test(line) ? 'Sample data, not a real record' : source.label}
                        {line.startsWith('You told us') && !issue.declaredMissing && !following ? (
                          <>
                            {' · '}
                            <TLink className="link" href={`/onboarding/questions?company=${issue.companyId}`}>
                              Change your answer
                            </TLink>
                          </>
                        ) : null}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="it">
                    <b>Nothing seen yet</b>
                    <small>Vero checks again on every scan.</small>
                  </div>
                )}
              </div>
            </Reveal>

            {issue.law.length > 0 || issue.regulator ? (
              <Reveal as="section" className="mod" i={2}>
                <div className="mh">
                  <h2>Sources</h2>
                </div>
                <div className="lst">
                  {issue.law.map((item) => (
                    <div className="it" key={`${item.law}-${item.cite ?? ''}`}>
                      <b>{item.law}</b>
                      <small>{item.cite ? `Section ${item.cite.replace(/^s(?=\d)/, '')}` : 'The law behind this check'}</small>
                    </div>
                  ))}
                  {issue.regulator ? (
                    <div className="it">
                      <b>{issue.regulator}</b>
                      <small>Regulator</small>
                    </div>
                  ) : null}
                </div>
                <p className="fine">{issue.notLegalAdvice}</p>
              </Reveal>
            ) : (
              <p className="fine" style={{ padding: 0 }}>
                {issue.notLegalAdvice}
              </p>
            )}

            <Reveal as="section" className="mod" i={3}>
              <div className="mh">
                <h2>Related</h2>
              </div>
              <div className="rel">
                <TLink href={`/areas/${issue.layer}`}>
                  <div>
                    <b>{issue.layerName}</b>
                    <small className="muted">{area?.coverage ? `Area score, ${plural(area.coverage.total, 'check', 'checks')}` : 'See the whole area'}</small>
                  </div>
                  {area?.score !== null && area?.score !== undefined ? <span className="pixel">{area.score}</span> : null}
                  <Icon name="chev" />
                </TLink>
                {related.map((item) => {
                  const itemStatus = findingStatus(item);
                  return (
                    <TLink key={issueKey(item)} href={issuePath(item)}>
                      <div>
                        <b>{item.headline}</b>
                        <small style={{ color: itemStatus === 'urgent' ? 'var(--urgent)' : 'var(--warn)' }}>{FINDING_WORDS[itemStatus]}</small>
                      </div>
                      <Icon name="chev" />
                    </TLink>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </After>
    </div>
  );
}
