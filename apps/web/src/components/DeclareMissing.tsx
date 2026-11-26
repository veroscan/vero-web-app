'use client';

import type { IssueSummary } from '@vero/shared';
import { useState } from 'react';
import { api, asApiError } from '@/lib/api';
import { useSession } from './Session';
import { TLink } from './TLink';

type Item = Pick<IssueSummary, 'companyId' | 'ruleKey' | 'canDeclareMissing' | 'declaredMissing'>;

const CHECK_EVERY_MS = 700;
const CHECKS = 40;

/**
 * The two plain choices for a document we haven't seen. Saying "we don't have it" is what
 * turns it into a gap, so the screen says that before it's pressed, and it can be undone.
 */
export function DeclareMissing({ item, onChanged, addLink = true }: { item: Item; onChanged?: () => void; /** Off where the upload sits right above, as on a finding's page. */ addLink?: boolean }) {
  const session = useSession();
  const [stage, setStage] = useState<'idle' | 'saving' | 'scoring'>('idle');
  const [declared, setDeclared] = useState(item.declaredMissing === true);
  const [problem, setProblem] = useState<string | null>(null);
  const params = { companyId: item.companyId, ruleKey: item.ruleKey };

  const change = async (target: boolean) => {
    setStage('saving');
    setProblem(null);
    try {
      const result = target ? await api.results.declareMissing({ params }) : await api.results.undeclareMissing({ params });
      setStage('scoring');
      // The new score comes from a re-score that runs on its own, so wait until it shows.
      let settled = !result.rescoreQueued;
      for (let check = 0; check < CHECKS && !settled; check += 1) {
        await new Promise((done) => setTimeout(done, CHECK_EVERY_MS));
        const current = await api.results.issue({ params });
        settled = (current.declaredMissing === true) === target;
      }
      setDeclared(target);
      await session.refresh();
      if (!settled) setProblem("We've saved that, but your score is still being worked out. Check back in a moment.");
      onChanged?.();
    } catch (error) {
      setProblem(asApiError(error).message);
    } finally {
      setStage('idle');
    }
  };

  const busy = stage !== 'idle';
  const status = stage === 'saving' ? 'Saving that.' : stage === 'scoring' ? 'Working out your score again.' : null;
  const footer = (
    <>
      {status ? (
        <p className="muted" style={{ fontSize: 13 }} role="status" data-testid="missing-status">
          {status}
        </p>
      ) : null}
      {problem ? (
        <p className="formerror" role="alert" data-testid="missing-problem">
          {problem}
        </p>
      ) : null}
    </>
  );

  if (declared) {
    return (
      <div className="declm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="declared-missing" aria-busy={busy}>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, fontWeight: 600 }}>
          <b style={{ color: 'var(--ink)' }}>You told us you don&apos;t have this.</b> It counts as a gap in your score until you add it or undo this.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-g btn-sm" type="button" disabled={busy} onClick={() => void change(false)}>
            {busy ? 'Undoing' : 'Undo this'}
          </button>
        </div>
        {footer}
      </div>
    );
  }
  if (!item.canDeclareMissing) return null;
  return (
    <div className="declm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="declare-missing" aria-busy={busy}>
      <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, fontWeight: 600 }}>
        {addLink ? "Add it and we'll read it. " : ''}If you don&apos;t have it, tell us and it becomes a gap, which may lower your score. You can undo that.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {addLink ? (
          <TLink className="btn btn-p btn-sm" href={`/documents/add?company=${item.companyId}&rule=${encodeURIComponent(item.ruleKey)}`}>
            Add the document
          </TLink>
        ) : null}
        <button className="btn btn-g btn-sm" type="button" disabled={busy} onClick={() => void change(true)}>
          {busy ? 'Saving' : "We don't have it"}
        </button>
      </div>
      {footer}
    </div>
  );
}
