'use client';

/* The finding preview that slides in from the right on the Findings page (board: Findings drawer).
   It reads the finding's full detail from the API and links to the full page. */

import type { IssueDetail, IssueSummary } from '@vero/shared';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { midSentence } from '@/lib/documents';
import { FINDING_COLOUR, FINDING_WORDS, findingStatus, issuePath, withoutReferrals } from '@/lib/issues';

export function FindingDrawer({ issue, onClose }: { issue: IssueSummary | null; onClose: () => void }) {
  const session = useSession();
  const [detail, setDetail] = useState<IssueDetail | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const open = issue !== null;

  useEffect(() => {
    document.body.classList.toggle('open', open);
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('open');
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!issue) return;
    let live = true;
    setDetail(null);
    setProblem(null);
    api.results.issue({ params: { companyId: issue.companyId, ruleKey: issue.ruleKey } }).then(
      (value) => live && setDetail(value),
      (error: unknown) => {
        if (live && !isRedirecting(error)) setProblem(asApiError(error).message);
      },
    );
    return () => {
      live = false;
    };
  }, [issue]);

  // The last finding stays drawn while the drawer slides away.
  const [shown, setShown] = useState<IssueSummary | null>(issue);
  useEffect(() => {
    if (issue) setShown(issue);
  }, [issue]);
  const item = issue ?? shown;
  const status = item ? findingStatus(item) : 'unseen';
  const company = item ? session.companies.find((candidate) => candidate.id === item.companyId) : undefined;
  const following = company?.relationship === 'follow';
  const isOpen = status === 'urgent' || status === 'attention';
  const canUpload = detail !== null && detail.canAddEvidence && !following && detail.proof.length > 0;
  const fix = withoutReferrals(detail?.fix);
  const steps = detail ? (detail.proof.length > 0 ? detail.proof.map((proof) => proof.label) : detail.evidence) : [];

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" aria-label="Finding detail" aria-hidden={!open} data-testid="finding-drawer" {...(open ? {} : { inert: true })}>
        <div className="dh">
          <span className="st2" style={{ color: FINDING_COLOUR[status] }}>
            {FINDING_WORDS[status]}
          </span>
          <span className="muted">{item ? `· ${item.layerName}` : ''}</span>
          <button className="ibtn" type="button" style={{ marginLeft: 'auto', border: 0 }} onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="db" data-lenis-prevent="">
          {item ? (
            <>
              <div className="co">
                {item.companyName} · {item.countryLabel}
              </div>
              <h3>{status === 'cleared' ? (item.title ?? item.headline) : item.headline}</h3>
              {problem ? (
                <p className="formerror" role="alert">
                  {problem}
                </p>
              ) : !detail ? (
                <p className="dload" role="status">
                  Reading this finding
                </p>
              ) : status === 'cleared' ? (
                <>
                  <p>Vero checked this and it is in order. It counts in the score.</p>
                  <div className="lbl">Where Vero checked</div>
                  <div className="dnote">{detail.howWeKnow.length > 0 ? detail.howWeKnow.join('. ') : 'From the latest scan.'} Vero checks it again on every scan.</div>
                </>
              ) : (
                <>
                  <p>{status === 'unseen' ? (detail.reasonWords ?? detail.missing) : detail.missing}</p>
                  {detail.howWeKnow.length > 0 ? (
                    <>
                      <div className="lbl">Evidence</div>
                      <div className="seen">
                        {detail.howWeKnow.map((line) => (
                          <div key={line}>{line}</div>
                        ))}
                      </div>
                    </>
                  ) : null}
                  {detail.why ? (
                    <>
                      <div className="lbl">Why it matters</div>
                      <p>{detail.why}</p>
                    </>
                  ) : null}
                  {steps.length > 0 || fix ? (
                    <>
                      <div className="lbl">What clears it</div>
                      <div className="proof">
                        {steps.map((step, index) => (
                          <div key={step}>
                            <span>{index + 1}</span>
                            {step}
                          </div>
                        ))}
                        {steps.length === 0 && fix ? (
                          <div>
                            <span>1</span>
                            {fix}
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                  {canUpload ? (
                    <TLink className="up" href={`/documents/add?company=${item.companyId}&rule=${encodeURIComponent(item.ruleKey)}`}>
                      <Icon name="upload" />
                      <span>
                        <b>Upload {detail.proof.length === 1 ? `the ${midSentence(detail.proof[0]?.label ?? 'document')}` : 'the document'}</b>
                        <small>Vero reads it and checks this again</small>
                      </span>
                    </TLink>
                  ) : following ? (
                    <div className="dnote">You follow this company, so you can read its findings. Only its own team can add proof.</div>
                  ) : steps.length > 0 && fix ? (
                    <div className="dnote">{fix}</div>
                  ) : null}
                </>
              )}
            </>
          ) : null}
        </div>
        {item ? (
          <div className="df">
            {isOpen && item.points !== null && item.points > 0 ? (
              <>
                <span className="muted">Clearing this adds</span>
                <span className="gain">+{item.points}</span>
              </>
            ) : isOpen && item.pointsHeldByUrgent ? (
              <span className="muted">Counts once the urgent findings are cleared</span>
            ) : status === 'cleared' ? (
              <span className="muted">In order and counted in the score</span>
            ) : null}
            <TLink className="btn btn-p" href={issuePath(item)}>
              Open full page
            </TLink>
          </div>
        ) : null}
      </aside>
    </>
  );
}
