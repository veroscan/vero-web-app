'use client';

import '@/app/styles/pages/add-document.css';
import '@/app/styles/pages/docflow.css';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { DocumentFlow, type FlowStageName } from '@/components/DocumentFlow';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { midSentence } from '@/lib/documents';
import { isOpenIssue } from '@/lib/issues';
import { useResource } from '@/lib/useResource';

function AddDocument() {
  const session = useSession();
  const search = useSearchParams();
  const companyId = search.get('company') ?? session.root?.id ?? '';
  const ruleKey = search.get('rule');
  const slotParam = search.get('slot');
  const documentId = search.get('document');
  const company = session.companies.find((item) => item.id === companyId);
  const following = company?.relationship === 'follow';
  const [picked, setPicked] = useState<string | null>(null);
  const [stage, setStage] = useState<FlowStageName>('idle');

  const resource = useResource(async () => {
    const [vault, connections, waiting, list] = await Promise.all([
      api.vault.get({ params: { companyId } }),
      // Only tells people what isn't connected yet, so the page works without it.
      api.vault.connections().catch(() => null),
      documentId ? api.vault.document({ params: { documentId } }) : Promise.resolve(null),
      // What each document is worth comes from the findings. Without them, the list still shows.
      api.results.issues({ params: { companyId }, query: { scope: 'company', outcome: 'all' } }).catch(() => null),
    ]);
    return { vault, connections: connections?.connections ?? [], waiting, issues: list?.issues ?? [] };
  }, [companyId, documentId]);

  const data = resource.data;
  const wanted = useMemo(() => {
    if (!data) return [];
    return data.vault.slots
      .filter((slot) => slot.state === 'missing' || slot.state === 'declared_missing' || slot.state === 'not_accepted')
      .map((slot) => {
        const open = data.issues.filter((issue) => slot.ruleKeys.includes(issue.ruleKey) && isOpenIssue(issue));
        return { slot, open, points: Math.max(0, ...open.map((issue) => issue.points ?? 0)), urgent: open.some((issue) => issue.severity === 'critical') };
      })
      .sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.points - a.points || b.open.length - a.open.length)
      .slice(0, 5);
  }, [data]);
  const filedElsewhere = data?.issues.find((issue) => isOpenIssue(issue) && issue.actionType === 'file');

  const issueHref = ruleKey ? `/issues/${companyId}/${encodeURIComponent(ruleKey)}` : null;
  const backHref = issueHref ?? `/documents${companyId && companyId !== session.root?.id ? `?company=${companyId}` : ''}`;

  const head = (title: string, lead: string) => (
    <div className="pagehead">
      <div>
        <div className="mono kick">
          <Scramble text="Upload" /> · <b><Scramble text="Vero reads it / Re-checks" delay={140} /></b>
        </div>
        <h1 className="disp">
          <Words text={title} />
        </h1>
        <p className="lead">{lead}</p>
      </div>
      <div className="acts">
        <TLink className="btn btn-g" href={backHref}>
          {issueHref ? 'Back to the finding' : 'Back to documents'}
        </TLink>
      </div>
    </div>
  );

  if (resource.loading && !data) {
    return (
      <div style={{ display: 'contents' }}>
        <Loading what="Getting this ready" />
      </div>
    );
  }
  if (resource.error || !data) {
    return <div style={{ display: 'contents' }}>{resource.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> : null}</div>;
  }

  const { vault, connections, waiting } = data;
  const fromUrl = vault.slots.find((item) => item.key === slotParam) ?? (ruleKey ? vault.slots.find((item) => item.ruleKeys.includes(ruleKey)) : undefined);
  const slot = picked === '' ? undefined : picked ? vault.slots.find((item) => item.key === picked) : fromUrl;
  const resume = waiting?.status === 'needs_confirmation' ? waiting : null;
  const name = company?.legalName ?? session.root?.legalName ?? 'your company';
  const title = resume ? 'Where does this belong?' : fromUrl ? `Add the ${midSentence(fromUrl.label)}` : 'Add a document';
  const lead = fromUrl && !resume ? fromUrl.reason : 'Vero reads it, matches it to the checks it can clear, and never shares it.';

  if (!vault.canUpload || following) {
    return (
      <div className="pg-add" style={{ display: 'contents' }}>
        <Hero>{head('Add a document', lead)}</Hero>
        <After>
          <Reveal as="section" className="mod" data-testid="add-locked">
            <div className="lockb">
              <h3>{following ? 'Only its own team can add documents' : 'Adding documents is part of a paid plan'}</h3>
              <p>{following ? `You follow ${name}, so you can read what Vero found. Uploading proof is for the team that owns it.` : "The first read comes from public records and your answers, so you don't need any documents to see it."}</p>
              {following ? (
                <TLink className="btn btn-g" href="/issues">
                  See the findings
                </TLink>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <TLink className="btn btn-p" href="/plan">
                    See the plans
                  </TLink>
                  <TLink className="btn btn-g" href={backHref}>
                    Not now
                  </TLink>
                </div>
              )}
            </div>
          </Reveal>
        </After>
      </div>
    );
  }

  const idle = stage === 'idle';
  return (
    <div className="pg-add" style={{ display: 'contents' }}>
      <Hero>{head(title, lead)}</Hero>
      <After>
        <section className="add">
          <div>
            <Reveal as="div" className="mod">
              <div className="mh">
                <h2>Upload</h2>
                <span className="sub">For {name}</span>
              </div>
              <div className="stage">
                <DocumentFlow
                  key={slot?.key ?? 'any'}
                  companyId={companyId}
                  slots={vault.slots}
                  wantedSlot={slot?.key ?? null}
                  resume={resume}
                  backHref={issueHref}
                  expectLine={slot ? `Vero will check it as the ${midSentence(slot.label)}.` : null}
                  onChanged={resource.reload}
                  onStage={setStage}
                />
              </div>
            </Reveal>
          </div>
          <div>
            <Reveal as="div" className="mod" i={1}>
              <div className="mh">
                <h2>Documents that would raise the score</h2>
              </div>
              {wanted.length > 0 ? (
                <div className="rs" role="radiogroup" aria-label="Choose what you are uploading">
                  {wanted.map((item) => {
                    const on = slot?.key === item.slot.key;
                    return (
                      <button key={item.slot.key} type="button" role="radio" aria-checked={on} className={`rr${on ? ' sel' : ''}`} disabled={!idle} onClick={() => setPicked(on ? '' : item.slot.key)}>
                        <span>
                          <b>{item.slot.label}</b>
                          <small>{item.urgent ? 'Clears an urgent finding and lifts the cap' : item.open.length > 0 ? `Clears ${item.open.length === 1 ? 'a finding' : `${item.open.length} findings`} in ${item.slot.layerName}` : 'Fills an empty slot in the company file'}</small>
                        </span>
                        {item.points > 0 ? <span className="gain">+{item.points}</span> : item.urgent ? <span className="ur">Urgent</span> : <span className="nc">{item.open.length > 0 ? 'Held by cap' : 'No change'}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rempty">Every document Vero expects is on file. Anything new is matched to the checks it can clear.</p>
              )}
              {filedElsewhere ? (
                <div className="rnote">
                  <b>{filedElsewhere.title ?? filedElsewhere.headline}</b> is filed with the register, not uploaded here. Vero sees it on the next scan.
                </div>
              ) : null}
            </Reveal>
            <Reveal as="div" className="mod" i={2}>
              <div className="mh">
                <h2>What happens to your file</h2>
              </div>
              <div className="priv">
                <div>
                  <Icon name="doc" />
                  Vero reads every page and keeps the text it needs to check.
                </div>
                <div>
                  <Icon name="check" />
                  It is matched to the checks it can clear, then scored again.
                </div>
                <div>
                  <Icon name="lock" />
                  It is encrypted and never shared. People who see your report see findings, not files, and it is never used to train AI.
                </div>
              </div>
            </Reveal>
            {connections.length > 0 ? (
              <Reveal as="div" className="mod" i={3}>
                <div className="mh">
                  <h2>Add another way</h2>
                </div>
                <div className="conn">
                  {connections.map((connection) => (
                    <div className="ci" key={connection.provider} data-testid="connection-row">
                      <div>
                        <b>From {connection.name}</b>
                        <small>{connection.message}</small>
                      </div>
                      <span className="st2" style={{ color: connection.status === 'active' ? 'var(--good)' : 'var(--ink-3)' }}>
                        {connection.status === 'active' ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>
        </section>
      </After>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <AddDocument />
    </Suspense>
  );
}
