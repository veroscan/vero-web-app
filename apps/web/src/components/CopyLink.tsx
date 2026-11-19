'use client';

import { useId } from 'react';
import { useToast } from './Toast';

/** A link someone needs to keep. It stays selectable if the browser won't let us copy it. */
export function CopyLink({ url, note, testId }: { url: string; note: string; testId?: string }) {
  const toast = useToast();
  const id = useId();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied.');
    } catch {
      toast("We couldn't copy it. Select the link and copy it yourself.");
    }
  };
  return (
    <div className="copylink stack g8" data-testid={testId}>
      <label htmlFor={id} className="small">
        {note}
      </label>
      <div className="copyrow">
        <input className="input" id={id} type="text" readOnly value={url} onFocus={(event) => event.target.select()} />
        <button className="btn btn-sm btn-line" type="button" onClick={() => void copy()}>
          Copy
        </button>
      </div>
    </div>
  );
}
