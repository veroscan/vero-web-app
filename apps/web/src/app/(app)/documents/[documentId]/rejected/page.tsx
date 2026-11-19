'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { FlowBar } from '@/components/FlowBar';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { V_PATH } from '@/components/V3D';
import { api, asApiError } from '@/lib/api';
import { useResource } from '@/lib/useResource';

export default function DocumentRejectedPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const session = useSession();
  const router = useRouter();
  const toast = useToast();
  const resource = useResource(() => api.vault.document({ params: { documentId } }), [documentId]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const document = resource.data;

  if (resource.loading && !document) {
    return (
      <div className="vs">
        <FlowBar closeHref="/documents" />
        <main style={{ display: 'contents' }}>
          <Loading what="Getting this document" />
        </main>
      </div>
    );
  }
  if (resource.error || !document) {
    return (
      <div className="vs">
        <FlowBar closeHref="/documents" />
        <main style={{ display: 'contents' }}>{resource.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> : null}</main>
      </div>
    );
  }

  const rejected = document.status === 'rejected';
  const failed = document.status === 'failed';
  const addHref = `/documents/add?company=${document.companyId}${document.slotKey ? `&slot=${document.slotKey}` : ''}`;

  /** A person has the last word on a signature. The hint is only ever a hint. */
  const itIsSigned = async () => {
    if (!document.slotKey) return;
    setBusy(true);
    setProblem(null);
    try {
      await api.vault.confirm({ params: { documentId: document.id }, body: { slotKey: document.slotKey, confirmSigned: true } });
      toast('Filed. Your score is updating.');
      await session.refresh().catch(() => undefined);
      router.push('/documents');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  if (!rejected && !failed) {
    return (
      <div className="vs">
        <FlowBar closeHref="/documents" />
        <main className="state" data-testid="not-rejected">
          <h1 className="t-2">This document wasn&apos;t turned away</h1>
          <p className="quiet">
            {document.fileName ?? 'It'}: {document.stateWord}.
          </p>
          <TLink className="btn btn-ink btn-sm" href="/documents">
            See your documents
          </TLink>
        </main>
      </div>
    );
  }

  return (
    <div className="vs">
      <FlowBar closeHref="/documents" />
      <main className="wrap">
        <section className="dr">
          <div className="stack g32" data-testid="document-rejected">
            <div className="stack g12">
              <h1 className="t-1">{failed ? "We couldn't read this file" : "This copy doesn't count yet"}</h1>
              <p className="lead">{document.rejectionReason ?? 'It needs another look before it can count.'}</p>
            </div>
            <div className="rows">
              <div className="row r-act">
                <span className="stack g4">
                  <span className="row-t">{document.fileName ?? 'Your document'}</span>
                  <span className="row-s">{document.slotLabel ?? 'Not in a slot yet'}</span>
                </span>
                <span className="st risk">{document.stateWord}</span>
              </div>
              {/* On a rejected copy the headline already gives this reason. */}
              {document.signatureHintWords && !rejected ? (
                <div className="row r-act">
                  <span className="stack g4">
                    <span className="row-t">What we saw</span>
                    <span className="row-s">{document.signatureHintWords}</span>
                  </span>
                  <span className="st watch">Check it</span>
                </div>
              ) : null}
            </div>
            {problem ? (
              <p className="formerror" role="alert">
                {problem}
              </p>
            ) : null}
            <div className="btns">
              <TLink className="btn btn-ink" href={addHref}>
                {failed ? 'Upload it again' : 'Upload the signed copy'}
              </TLink>
              {rejected && document.slotKey ? (
                <button className="btn btn-line" type="button" disabled={busy} onClick={() => void itIsSigned()}>
                  {busy ? 'Filing it' : "It is signed, file it"}
                </button>
              ) : null}
            </div>
            {rejected ? <p className="small">We&apos;ve kept this copy in your documents, so you don&apos;t need to upload it again.</p> : null}
          </div>

          {rejected ? (
            <figure className="paper sheet" role="img" aria-label="An illustration, not your document: a signed line, and an empty line that stops a copy counting.">
              <p className="small pg">
                <span>What we look for</span>
                <span>An example</span>
              </p>
              <div className="sig">
                <svg className="ink" viewBox="0 0 260 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMinYMax meet" aria-hidden="true">
                  <path d="M8 48C20 26 32 10 38 12c7 3-9 36-5 38 5 2 14-20 20-20 5 0-4 16 1 17 6 1 11-14 17-14 4 0-1 12 4 12 7 0 11-12 18-12 6 0 0 12 6 12 9 0 22-14 38-16 10-1 3 10 12 10 12 0 30-8 52-10" />
                </svg>
                <div className="sigline" />
                <p className="small">A signed line</p>
              </div>
              <div className="sig">
                <div className="gap">
                  <svg className="dropin" viewBox="0 0 132 100" aria-hidden="true">
                    <path d={V_PATH} />
                  </svg>
                </div>
                <div className="emptyline" />
                <p className="small missing">An empty line stops it counting</p>
              </div>
            </figure>
          ) : null}
        </section>
      </main>
    </div>
  );
}
