'use client';

import { useState } from 'react';
import { Empty, ErrorState, Loading } from '@/components/Bits';
import { Select } from '@/components/Select';
import { isRefused, StaffPage, StaffRefused } from '@/components/StaffBar';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { WORK_KIND_WORDS, WORK_STATUSES } from '@/lib/desk';
import { longDate } from '@/lib/format';
import { useResource } from '@/lib/useResource';

type WorkStatus = NonNullable<(typeof WORK_STATUSES)[string]>[number]['value'];

function WorkRow({
  item,
  onChanged,
}: {
  item: {
    id: string;
    kind: string;
    title: string;
    body: string | null;
    read: boolean;
    createdAt: string;
  };
  onChanged: () => void;
}) {
  const toast = useToast();
  const [status, setStatus] = useState<WorkStatus | ''>('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const update = async () => {
    if (!status || busy) return;
    setBusy(true);
    setProblem(null);
    try {
      const trimmed = note.trim();
      await api.review.updateWork({
        params: { workId: item.id },
        body: { status, ...(trimmed ? { note: trimmed } : {}) },
      });
      toast('Updated. The client has been told.');
      setStatus('');
      setNote('');
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };
  return (
    <div className="workrow" data-testid="work-row" data-work={item.id}>
      <div>
        <span className="meta">
          {WORK_KIND_WORDS[item.kind] ?? item.kind} · {longDate(item.createdAt)}
        </span>
        <b>{item.title}</b>
        {item.body ? <small>{item.body}</small> : null}
      </div>
      <span className={`st ${item.read ? 'none' : 'watch'}`}>{item.read ? 'Updated before' : 'New'}</span>
      <div className="workform">
        <div className="field">
          <label htmlFor={`status-${item.id}`}>Set it to</label>
          <Select
            id={`status-${item.id}`}
            value={status}
            onChange={(next) => setStatus(next as WorkStatus)}
            placeholder="Choose one"
            options={(WORK_STATUSES[item.kind] ?? []).map((choice) => ({
              value: choice.value,
              label: choice.label,
            }))}
          />
        </div>
        <div className="field">
          <label htmlFor={`worknote-${item.id}`}>Note for the record (optional)</label>
          <input className="input" id={`worknote-${item.id}`} type="text" maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        <button className="btn btn-p" type="button" disabled={busy || !status} aria-busy={busy || undefined} onClick={() => void update()}>
          {busy ? <span className="spin" aria-hidden="true" /> : null}
          {busy ? 'Saving' : 'Update'}
        </button>
      </div>
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
    </div>
  );
}

export default function StaffWorkPage() {
  const resource = useResource(() => api.review.work(), []);
  const items = resource.data?.items;

  if (isRefused(resource.error)) return <StaffRefused />;
  if (resource.error && !items) {
    return (
      <div className="pg-staff wait">
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </div>
    );
  }
  if (!items) {
    return (
      <div className="pg-staff wait">
        <Loading what="Getting company look-ups" />
      </div>
    );
  }

  const fresh = items.filter((item) => !item.read).length;
  return (
    <StaffPage>
      <section className="stack" data-testid="staff-work">
        <div className="pagehead">
          <div>
            <h1>Company look-ups</h1>
            <p>Companies people asked Vero to look up by hand, because their register couldn&apos;t be searched. The newest 100 come first.</p>
          </div>
        </div>
        <p className="note" data-testid="audit-note">
          <span className="b">Updates are audited.</span>
          <span>Each one goes in that client&apos;s audit log under your account, and they get a notification.</span>
        </p>
        <div className="mod">
          <div className="mh">
            <h2>Asked for</h2>
            <span className="sub">{items.length === 0 ? 'None yet' : `${items.length} in all, ${fresh} new`}</span>
          </div>
          {items.length === 0 ? (
            <div data-testid="work-empty">
              <Empty title="Nothing has been asked for yet">Company look-ups come here.</Empty>
            </div>
          ) : (
            <div className="list">
              {items.map((item) => (
                <WorkRow key={item.id} item={item} onChanged={resource.reload} />
              ))}
              {items.length >= 100 ? <p className="listend">These are the newest 100. Older ones are not shown here.</p> : null}
            </div>
          )}
        </div>
      </section>
    </StaffPage>
  );
}
