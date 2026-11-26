'use client';

/* The finding preview that slides in from the right on the Findings page (board: Findings drawer).
   It reads the finding's full detail from the API and links to the full page. */

import type { IssueDetail, IssueSummary } from '@vero/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { midSentence } from '@/lib/documents';
import { FINDING_COLOUR, FINDING_WORDS, findingStatus, issuePath, knowWords, withoutReferrals } from '@/lib/issues';

export function FindingDrawer({ issue, onClose }: { issue: IssueSummary | null; onClose: () => void }) {
  const session = useSession();
  const [detail, setDetail] = useState<IssueDetail | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const panel = useRef<HTMLElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const open = issue !== null;

  // While it is open: the page behind holds still, Escape closes it, Tab stays inside it,
  // and closing hands the keyboard back to the row that opened it.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('open');
    closer.current?.focus({ preventScroll: true });
    // Only the drawer's own text scrolls: a wheel or a swipe anywhere else goes nowhere.
    const hold = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.closest('.drawer .db')) event.preventDefault();
    };
    document.addEventListener('wheel', hold, { passive: false });
    document.addEventListener('touchmove', hold, { passive: false });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const stops = [...panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((node) => node.offsetParent !== null);
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (!first || !last) return;
      const at = document.activeElement;
      if (!panel.current.contains(at)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && at === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && at === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('wheel', hold);
      document.removeEventListener('touchmove', hold);
      document.body.classList.remove('open');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
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
  }, [issue, attempt]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

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
      <aside ref={panel} className="drawer" role="dialog" aria-modal="true" aria-label="Finding detail" aria-hidden={!open} data-testid="finding-drawer" {...(open ? {} : { inert: true })}>
        <div className="dh">
          <span className="st2" style={{ color: FINDING_COLOUR[status] }}>
            {FINDING_WORDS[status]}
          </span>
          <span className="muted dar">{item ? `· ${item.layerName}` : ''}</span>
          <button ref={closer} className="ibtn dx" type="button" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="db" data-lenis-prevent="" key={item ? `${item.companyId}|${item.ruleKey}` : 'none'}>
          {item ? (
            <>
              <div className="co">
                {item.companyName} · {item.countryLabel}
              </div>
              <h3>{status === 'cleared' ? (item.title ?? item.headline) : item.headline}</h3>
              {problem ? (
                <div className="dprob" role="alert">
                  <b>We couldn&apos;t load the rest of this finding.</b>
                  <span>{problem}</span>
                  <button className="btn btn-g btn-sm" type="button" onClick={retry}>
                    Try again
                  </button>
                </div>
              ) : !detail ? (
                <div className="dload" role="status">
                  <span className="sr-only">Reading this finding</span>
                  <i className="skel" style={{ width: '92%' }} />
                  <i className="skel" style={{ width: '64%' }} />
                  <i className="skel b" />
                  <i className="skel" style={{ width: '80%' }} />
                  <i className="skel" style={{ width: '48%' }} />
                </div>
              ) : status === 'cleared' ? (
                <>
                  <p>Vero checked this and it is in order. It counts in the score.</p>
                  <div className="lbl">Where Vero checked</div>
                  <div className="dnote">{detail.howWeKnow.length > 0 ? `${detail.howWeKnow.map(knowWords).join('. ').replace(/\.$/, '')}.` : 'From the latest scan.'} Vero checks it again on every scan.</div>
                </>
              ) : (
                <>
                  <p>{status === 'unseen' ? (detail.reasonWords ?? detail.missing) : detail.missing}</p>
                  {detail.howWeKnow.length > 0 ? (
                    <>
                      <div className="lbl">Evidence</div>
                      <div className="seen">
                        {detail.howWeKnow.map((line) => (
                          <div key={line}>{knowWords(line)}</div>
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
            <span className="dfw">
              {isOpen && item.points !== null && item.points > 0 ? (
                <>
                  <span className="muted">Clearing this adds</span>
                  <span className="gain">+{item.points}</span>
                </>
              ) : isOpen && item.pointsHeldByUrgent ? (
                <span className="muted">Counts once the urgent findings are cleared</span>
              ) : status === 'cleared' ? (
                <span className="muted">In order and counted in the score</span>
              ) : status === 'unseen' ? (
                <span className="muted">Doesn&apos;t count for or against the score yet</span>
              ) : null}
            </span>
            <TLink className="btn btn-p" href={issuePath(item)}>
              Open full page
            </TLink>
          </div>
        ) : null}
      </aside>
    </>
  );
}
