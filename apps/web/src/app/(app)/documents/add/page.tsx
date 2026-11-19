'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { DocumentFlow } from '@/components/DocumentFlow';
import { FlowBar } from '@/components/FlowBar';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { midSentence } from '@/lib/documents';
import { useResource } from '@/lib/useResource';

function AddDocument() {
  const session = useSession();
  const search = useSearchParams();
  const companyId = search.get('company') ?? session.root?.id ?? '';
  const ruleKey = search.get('rule');
  const slotParam = search.get('slot');
  const documentId = search.get('document');

  const resource = useResource(async () => {
    const [vault, connections, waiting] = await Promise.all([
      api.vault.get({ params: { companyId } }),
      // Only tells people what isn't connected yet, so the page works without it.
      api.vault.connections().catch(() => null),
      documentId ? api.vault.document({ params: { documentId } }) : Promise.resolve(null),
    ]);
    return { vault, connections: connections?.connections ?? [], waiting };
  }, [companyId, documentId]);

  const issueHref = ruleKey ? `/issues/${companyId}/${encodeURIComponent(ruleKey)}` : null;
  const closeHref = issueHref ?? '/documents';
  const data = resource.data;

  if (resource.loading && !data) {
    return (
      <div className="vs">
        <FlowBar closeHref={closeHref} closeRight />
        <main style={{ display: 'contents' }}>
          <Loading what="Getting this ready" />
        </main>
      </div>
    );
  }
  if (resource.error || !data) {
    return (
      <div className="vs">
        <FlowBar closeHref={closeHref} closeRight />
        <main style={{ display: 'contents' }}>{resource.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> : null}</main>
      </div>
    );
  }

  const { vault, connections, waiting } = data;
  if (!vault.canUpload) {
    return (
      <div className="vs">
        <FlowBar closeHref={closeHref} closeRight />
        <main className="wrap narrow" style={{ paddingBlock: 'clamp(24px,4vw,48px) 64px' }}>
          <div className="stack g20" data-testid="add-locked">
            <h1 className="t-1">Add a document</h1>
            <p className="lead">Adding documents is part of a paid plan. Your first read comes from public records and your answers, so you don&apos;t need any to see it.</p>
            <div className="btns">
              <TLink className="btn btn-ink" href="/plan">
                See the plans
              </TLink>
              <TLink className="btn btn-line" href={closeHref}>
                Not now
              </TLink>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const slot = vault.slots.find((item) => item.key === slotParam) ?? (ruleKey ? vault.slots.find((item) => item.ruleKeys.includes(ruleKey)) : undefined);
  const resume = waiting?.status === 'needs_confirmation' ? waiting : null;
  return (
    <div className="vs">
      <FlowBar closeHref={closeHref} closeRight />
      <main className="wrap narrow" style={{ paddingBlock: 'clamp(24px,4vw,48px) 64px' }}>
        <div className="stack g32 flow">
          <div className="stack g8">
            <h1 className="t-1">{resume ? 'Where does this belong?' : slot ? `Add your ${midSentence(slot.label)}` : 'Add a document'}</h1>
            <p className="lead">{slot && !resume ? slot.reason : "We'll read it and suggest where it belongs. Nothing counts until you confirm it."}</p>
          </div>

          <DocumentFlow companyId={companyId} slots={vault.slots} wantedSlot={slot?.key ?? null} resume={resume} backHref={issueHref} />

          {connections.length > 0 ? (
            <div className="stack g12">
              <h2 className="t-3">Add another way</h2>
              <div className="rows">
                {connections.map((connection) => (
                  <div className="row r-act" key={connection.provider} data-testid="connection-row">
                    <span className="stack g4">
                      <span className="row-t">From {connection.name}</span>
                      <span className="row-s">{connection.message}</span>
                    </span>
                    <span className="st none">Not connected</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <p className="small">Your documents are encrypted. Only your team can open them, and we never use them to train AI.</p>
        </div>
      </main>
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
