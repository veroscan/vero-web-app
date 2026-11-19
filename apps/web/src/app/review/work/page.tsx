'use client';

import { useState } from 'react';
import { Empty, ErrorState, Loading } from '@/components/Bits';
import { isRefused, StaffBar, StaffRefused } from '@/components/StaffBar';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { WORK_KIND_WORDS, WORK_STATUSES } from '@/lib/desk';
import { longDate } from '@/lib/format';
import { useResource } from '@/lib/useResource';

type WorkStatus = NonNullable<(typeof WORK_STATUSES)[string]>[number]['value'];

function WorkRow({ item, onChanged }: { item: { id: string; kind: string; title: string; body: string | null; read: boolean; createdAt: string }; onChanged: () => void }) {
  const toast = useToast();
  const [status, setStatus] = useState<WorkStatus | ''>('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const update = async () => {
    if (!status) return;
    setBusy(true);
    setProblem(null);
    try {
      const trimmed = note.trim();
      await api.review.updateWork({ params: { workId: item.id }, body: { status, ...(trimmed ? { note: trimmed } : {}) } });
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
    <div className="row workrow" data-testid="work-row" data-work={item.id}>
      <span className="stack g4">
        <span className="small">
          {WORK_KIND_WORDS[item.kind] ?? item.kind} · {longDate(item.createdAt)}
        </span>
        <span className="row-t">{item.title}</span>
        {item.body ? <span className="row-s">{item.body}</span> : null}
      </span>
      <span className={`st ${item.read ? 'none' : 'watch'}`}>{item.read ? 'Updated before' : 'New'}</span>
      <div className="workform">
        <div className="field">
          <label htmlFor={`status-${item.id}`}>Set it to</label>
          <select className="input" id={`status-${item.id}`} value={status} onChange={(event) => setStatus(event.target.value as WorkStatus)}>
            <option value="">Choose one</option>
            {(WORK_STATUSES[item.kind] ?? []).map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`worknote-${item.id}`}>Note for the record (optional)</label>
          <input className="input" id={`worknote-${item.id}`} type="text" maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        <button className="btn btn-sm btn-line" type="button" disabled={busy || !status} onClick={() => void update()}>
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
      <div className="vs">
        <main style={{ display: 'contents' }}>
          <ErrorState error={resource.error} onRetry={resource.reload} />
        </main>
      </div>
    );
  }
  if (!items) {
    return (
      <div className="vs">
        <main style={{ display: 'contents' }}>
          <Loading what="Getting company look-ups" />
        </main>
      </div>
    );
  }

  return (
    <div className="vs">
      <StaffBar />
      <main className="wrap mid">
        <section className="sec stack g32" data-testid="staff-work">
          <div className="stack g12">
            <h1 className="t-1">Company look-ups</h1>
            <p className="lead">Companies people asked us to look up by hand. The newest 100 come first.</p>
          </div>
          <p className="note" data-testid="audit-note">
            <span className="b">Updates are audited.</span>
            <span>Each one goes in that client&apos;s audit log under your account, and they get a notification.</span>
          </p>
          {items.length === 0 ? (
            <div data-testid="work-empty">
              <Empty title="Nothing has been asked for yet">Company look-ups come here.</Empty>
            </div>
          ) : (
            <div className="rows">
              {items.map((item) => (
                <WorkRow key={item.id} item={item} onChanged={resource.reload} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
