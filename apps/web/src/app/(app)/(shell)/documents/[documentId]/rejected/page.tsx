'use client';

import '@/app/styles/pages/add-document.css';
import '@/app/styles/pages/docflow.css';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { ProblemPaper } from '@/components/DocumentFlow';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { longDate, plural } from '@/lib/format';
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
      <div style={{ display: 'contents' }}>
        <Loading what="Getting this document" />
      </div>
    );
  }
  if (resource.error || !document) {
    return <div style={{ display: 'contents' }}>{resource.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> : null}</div>;
  }

  const rejected = document.status === 'rejected';
  const failed = document.status === 'failed';
  const company = session.companies.find((item) => item.id === document.companyId);
  const following = company?.relationship === 'follow';
  const addHref = `/documents/add?company=${document.companyId}${document.slotKey ? `&slot=${document.slotKey}` : ''}`;
  const facts = [document.pages ? plural(document.pages, 'page', 'pages') : null, `shared ${longDate(document.uploadedAt)}`].filter(Boolean).join(', ');

  /** A person has the last word on a signature. The hint is only ever a hint. */
  const itIsSigned = async () => {
    if (!document.slotKey) return;
    setBusy(true);
    setProblem(null);
    try {
      await api.vault.confirm({ params: { documentId: document.id }, body: { slotKey: document.slotKey, confirmSigned: true } });
      toast('Filed. Vero is scoring it again.');
      await session.refresh().catch(() => undefined);
      router.push('/documents');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  const title = failed ? "Vero can't read this file" : rejected ? "This copy doesn't count yet" : 'This document was not turned away';
  return (
    <div className="pg-add" style={{ display: 'contents' }}>
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Upload" /> · <b><Scramble text="Read / Not usable yet" delay={140} /></b>
            </div>
            <h1 className="disp">
              <Words text={title} />
            </h1>
            <p className="lead">{rejected || failed ? 'Your score has not changed. Here is what Vero saw, and what to upload instead.' : `${document.fileName ?? 'It'}: ${document.stateWord}.`}</p>
          </div>
          <div className="acts">
            <TLink className="btn btn-g" href="/documents">
              Back to documents
            </TLink>
          </div>
        </div>
      </Hero>
      <After>
        {!rejected && !failed ? (
          <Reveal as="section" className="mod" data-testid="not-rejected">
            <div className="lockb">
              <h3>Nothing to fix here</h3>
              <p>
                {document.fileName ?? 'This document'} is {document.stateWord.charAt(0).toLowerCase() + document.stateWord.slice(1)}.
              </p>
              <TLink className="btn btn-p" href="/documents">
                See your documents
              </TLink>
            </div>
          </Reveal>
        ) : (
          <section className="add">
            <div>
              <Reveal as="div" className="mod" data-testid="document-rejected">
                <div className="mh">
                  <h2>{failed ? 'Not readable' : 'Kept, not counted'}</h2>
                  <span className="sub">{company?.legalName ?? ''}</span>
                </div>
                <div className="rej">
                  <div className="pg-docflow">
                    <div className="st-v">
                      <div className="res">
                        <ProblemPaper kind={failed ? 'blurry' : 'wrong'} />
                        <div>
                          <div className="fn">
                            <span className="nm">{document.fileName ?? 'Your document'}</span>
                            <small>{facts}</small>
                            <span className="st2" style={{ color: 'var(--warn)' }}>
                              {document.stateWord}
                            </span>
                          </div>
                          <h3>{failed ? 'Vero could not read enough of it' : 'Vero needs a signed copy'}</h3>
                          <p className="why">{document.rejectionReason ?? 'It needs another look before it can count.'}</p>
                          <div className="seen2">
                            <div>
                              <span>Where it was going</span>
                              <b>{document.slotLabel ?? 'Not in a slot yet'}</b>
                            </div>
                            {document.signatureHintWords ? (
                              <div>
                                <span>What Vero saw</span>
                                <b>{document.signatureHintWords}</b>
                              </div>
                            ) : null}
                          </div>
                          <div className="lbl2">Upload this instead</div>
                          <div className="inst">
                            <div>
                              <span>1</span>
                              {failed ? 'The original PDF, if there is one.' : 'The signed copy, with every signature page.'}
                            </div>
                            <div>
                              <span>2</span>Or a flat scan of every page, including the signature page, at 300 dpi or more.
                            </div>
                          </div>
                          {problem ? (
                            <p className="formerror" role="alert" style={{ marginTop: 14 }}>
                              {problem}
                            </p>
                          ) : null}
                          {following ? (
                            <p className="kept">You follow this company, so only its own team can upload a new copy.</p>
                          ) : (
                            <div className="acts2">
                              <TLink className="btn btn-p" href={addHref}>
                                <Icon name="upload" />
                                {failed ? 'Upload it again' : 'Upload the signed copy'}
                              </TLink>
                              {rejected && document.slotKey ? (
                                <button className="btn btn-g" type="button" disabled={busy} onClick={() => void itIsSigned()}>
                                  {busy ? 'Filing it' : 'It is signed, file it'}
                                </button>
                              ) : null}
                            </div>
                          )}
                          <div className="kept">{rejected ? "Vero kept this copy in your documents, so you don't need to upload it again if it is signed." : 'Your score has not changed.'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
            <div>
              <Reveal as="div" className="mod" i={1}>
                <div className="mh">
                  <h2>Why a copy can be turned away</h2>
                </div>
                <div className="priv">
                  <div>
                    <Icon name="doc" />
                    Vero needs to read every word to check who signed it and what it says.
                  </div>
                  <div>
                    <Icon name="check" />A signature hint is only a hint. If the copy is signed, you have the last word.
                  </div>
                  <div>
                    <Icon name="lock" />
                    Nothing you upload is shared. People who see your report see findings, not files.
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        )}
      </After>
    </div>
  );
}
