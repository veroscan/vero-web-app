'use client';

import type { IssueSummary } from '@vero/shared';
import { Chevron } from './Bits';
import { DeclareMissing } from './DeclareMissing';
import { TLink } from './TLink';
import { issuePath } from '@/lib/issues';

/** One check that isn't open: passed, or not seen yet. Expands to say how we know. */
export function CheckRow({ issue, name, word, tone, fallback, onChanged }: { issue: IssueSummary; name: string; word: string; tone: string; fallback: string; onChanged?: () => void }) {
  return (
    <details className="more" data-testid="area-check">
      <summary className="row r-open">
        <span className="row-t">{name}</span>
        <span className={`st ${tone}`}>{word}</span>
        <Chevron />
      </summary>
      <div className="more-body">
        <p className="quiet">
          <span className="howlabel">How we know:</span> {issue.howWeKnow.length > 0 ? issue.howWeKnow.join(' ') : fallback}
        </p>
        {issue.canDeclareMissing ? <DeclareMissing item={issue} {...(onChanged ? { onChanged } : {})} /> : null}
        <p className="morelinks">
          <TLink className="link" href={issuePath(issue)}>
            See the details
          </TLink>
        </p>
      </div>
    </details>
  );
}
