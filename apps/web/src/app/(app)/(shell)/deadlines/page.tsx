'use client';

import type { Deadline, DeadlineListResponse } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { Empty, ErrorState, Loading, PlanLink, SampleNote, SourcesDownNote } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { basisWords, buildTimeline, groupDeadlines, rowDate, trackingWords } from '@/lib/deadlines';
import { entitlementsOf, planNameOf, roleCan } from '@/lib/entitlements';
import { longDate } from '@/lib/format';
import { isWatched, watchingNote } from '@/lib/plan-words';
import { dayWords } from '@/lib/records';
import { useResource } from '@/lib/useResource';

const COMPANY_COUNT_WORDS: Readonly<Record<number, string>> = { 2: 'two', 3: 'three', 4: 'four', 5: 'five' };

interface CompanyCheck {
  checkedAt: string | null;
  sampleData: boolean;
  down: string[];
}

interface Loaded {
  list: DeadlineListResponse;
  checks: Map<string, CompanyCheck>;
}

/** Marks a date done, or takes that back. It's easy to undo, so it doesn't ask first. */
function DoneToggle({ deadline, undo, onChanged }: { deadline: Deadline; undo: boolean; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const change = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const params = { params: { deadlineId: deadline.id } };
      await (undo ? api.deadlines.undone(params) : api.deadlines.done(params));
      toast(undo ? 'Moved back to your deadlines.' : 'Marked as done.');
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <button className="btn btn-sm btn-line" type="button" disabled={busy} onClick={() => void change()}>
        {busy ? 'Saving' : undo ? 'Undo' : 'Mark as done'}
      </button>
      {problem ? (
        <span className="formerror" role="alert">
          {problem}
        </span>
      ) : null}
    </>
  );
}

function DeadlineRow({ deadline, watching, checkedAt, canMark, onDone }: { deadline: Deadline; watching: boolean; checkedAt: string | null; canMark: boolean; onDone: () => void }) {
  const late = deadline.state === 'overdue';
  const showFix = late && deadline.ruleKey !== null;
  const showDone = canMark && deadline.monitoring === 'reminder';
  const basis = basisWords(deadline.basis);
  const fromRegister = deadline.basis === 'source_date' && checkedAt;
  return (
    <div className={`row r-time${showFix || showDone ? ' r-fix' : ''}`} id={`d-${deadline.id}`} data-testid="deadline-row" data-state={deadline.state} data-rule={deadline.ruleKey ?? ''}>
      <span className={`st num${late ? ' risk' : deadline.state === 'due_soon' ? ' watch' : ''}`}>{rowDate(deadline.dueOn)}</span>
      <span className="stack g4">
        <span className="row-t">{deadline.title}</span>
        <span className="row-s">
          {deadline.companyName} · {trackingWords(deadline, watching)}
        </span>
        {basis ? (
          <span className="row-s" data-testid="deadline-basis">
            {basis}
            {fromRegister ? `, last checked ${dayWords(checkedAt)}` : ''}.
          </span>
        ) : null}
        {deadline.needsReview ? (
          <span className="row-s" data-testid="deadline-needs-review">
            This date rests on a rule that hasn&apos;t been reviewed yet, so treat it as a guide.
          </span>
        ) : null}
      </span>
      {showFix || showDone ? (
        <span className="dl-acts">
          {showFix ? (
            <TLink className="btn btn-sm btn-ink" href={`/issues/${deadline.companyId}/${encodeURIComponent(deadline.ruleKey ?? '')}`}>
              Fix this
            </TLink>
          ) : null}
          {showDone ? <DoneToggle deadline={deadline} undo={false} onChanged={onDone} /> : null}
        </span>
      ) : null}
    </div>
  );
}

function DeadlinesBody() {
  const session = useSession();
  const params = useSearchParams();
  const asked = params.get('company');
  const companies = session.companies;
  const [filter, setFilter] = useState<string>(() => (asked && companies.some((company) => company.id === asked) ? asked : 'all'));
  const resource = useResource<Loaded>(async () => {
    const list = await api.deadlines.list({ query: {} });
    // A deadline has no retrieval date of its own, so "last checked" comes from the company's records.
    const results = await Promise.all(companies.map((company) => api.records.get({ params: { companyId: company.id } }).catch(() => null)));
    const checks = new Map<string, CompanyCheck>();
    for (const records of results) {
      if (records) {
        checks.set(records.companyId, {
          checkedAt: records.checkedAt,
          sampleData: records.sampleData || records.sources.some((source) => source.sampleData),
          down: records.sources.filter((source) => source.down).map((source) => source.sourceName),
        });
      }
    }
    return { list, checks };
  }, [companies.map((company) => company.id).join()]);

  const plan = session.overview?.plan;
  const entitlements = entitlementsOf(plan);
  const watched = isWatched(entitlements);
  const note = watchingNote(entitlements, planNameOf(plan));
  const canMark = roleCan(session.me, 'deadlines.write');
  const list = resource.data?.list;
  const shown = useMemo(() => (list?.deadlines ?? []).filter((item) => filter === 'all' || item.companyId === filter), [list, filter]);
  const undated = useMemo(() => (list?.undated ?? []).filter((item) => filter === 'all' || item.companyId === filter), [list, filter]);
  const groups = useMemo(() => groupDeadlines(shown), [shown]);
  const timeline = useMemo(() => buildTimeline(shown), [shown]);
  const done = useMemo(() => shown.filter((item) => item.state === 'done'), [shown]);

  if (resource.loading && !list) {
    return (
      <main style={{ display: 'contents' }}>
        <Loading what="Getting your deadlines" />
      </main>
    );
  }
  if (resource.error && !list) {
    return (
      <main style={{ display: 'contents' }}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </main>
    );
  }
  if (!list) return null;

  const checks = resource.data?.checks ?? new Map<string, CompanyCheck>();
  const here = [...checks.entries()].filter(([id]) => filter === 'all' || id === filter).map(([, check]) => check);
  const sample = here.some((check) => check.sampleData);
  const down = here.flatMap((check) => check.down).map((sourceName) => ({ sourceName }));
  const nameOf = (companyId: string) => companies.find((company) => company.id === companyId)?.legalName ?? '';
  const nothingAtAll = list.deadlines.length === 0 && list.undated.length === 0;
  const lead =
    companies.length > 1
      ? `Every date your ${COMPANY_COUNT_WORDS[companies.length] ?? companies.length} companies have to meet. Some we can check for you. For the rest, we'll remind you and ask for proof.`
      : "Every date your company has to meet. Some we can check for you. For the rest, we'll remind you and ask for proof.";

  return (
    <main className="wrap mid">
      <section className="sec stack g32">
        <div className="stack g12">
          <h1 className="t-1">Deadlines</h1>
          <p className="lead">{lead}</p>
        </div>

        {sample || down.length > 0 ? (
          <div className="stack g8">
            {sample ? <SampleNote /> : null}
            <SourcesDownNote sources={down} />
          </div>
        ) : null}

        {note && !nothingAtAll ? (
          <p className="note" data-testid="deadlines-plan">
            <span className="b">{note.title}</span>
            <span>{note.body}</span>
            {note.planLink ? <PlanLink /> : null}
          </p>
        ) : null}

        {companies.length > 1 ? (
          <div className="filters" role="group" aria-label="Filter by company">
            <button className={`fbtn${filter === 'all' ? ' on' : ''}`} type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
              All
            </button>
            {companies.map((company) => (
              <button key={company.id} className={`fbtn${filter === company.id ? ' on' : ''}`} type="button" aria-pressed={filter === company.id} onClick={() => setFilter(company.id)}>
                {company.legalName}
              </button>
            ))}
          </div>
        ) : null}

        {nothingAtAll ? (
          <div className="stack g16" data-testid="deadlines-empty">
            <Empty title="We don't have any dates yet">That doesn&apos;t mean nothing is due. It means no check has given us a date so far.</Empty>
            <div className="btns">
              <TLink className="btn btn-line btn-sm" href="/company">
                See your company records
              </TLink>
            </div>
          </div>
        ) : (
          <div className="stack g48" data-testid="deadlines-list">
            {timeline.dots.length > 0 ? (
              <div className="tl" role="group" aria-label={timeline.label} data-testid="deadline-timeline">
                {timeline.months.map((month) => (
                  <span key={month.key}>{month.word}</span>
                ))}
                {timeline.dots.map((dot) => (
                  <a key={dot.id} className={[dot.late ? 'late' : '', dot.side ? `tip-${dot.side}` : ''].filter(Boolean).join(' ') || undefined} href={`#d-${dot.id}`} data-tip={dot.tip} aria-label={dot.label} style={{ left: `${dot.left}%` }} />
                ))}
              </div>
            ) : null}

            {groups.map((group) => (
              <div className="stack g16" key={group.id} data-testid="deadline-group">
                <h2 className={`t-3${group.late ? ' risk' : ''}`}>{group.title}</h2>
                <div className="rows">
                  {group.rows.map((deadline) => (
                    <DeadlineRow key={deadline.id} deadline={deadline} watching={watched} checkedAt={checks.get(deadline.companyId)?.checkedAt ?? null} canMark={canMark} onDone={resource.reload} />
                  ))}
                </div>
              </div>
            ))}

            {undated.length > 0 ? (
              <div className="stack g16" data-testid="deadlines-undated">
                <div className="stack g4">
                  <h2 className="t-3">No date yet</h2>
                  <p className="quiet">{undated.length === 1 ? 'This one applies' : 'These apply'}, but we won&apos;t guess a date.</p>
                </div>
                <div className="rows">
                  {undated.map((item) => (
                    <div className="row r-time" key={`${item.companyId}-${item.ruleKey}`} data-testid="undated-row">
                      <span className="st">No date</span>
                      <span className="stack g4">
                        <span className="row-t">{item.title}</span>
                        <span className="row-s">
                          {nameOf(item.companyId)} · We need {item.waitingOn}. {trackingWords(item, watched)}.
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {done.length > 0 ? (
              <div className="stack g16" data-testid="deadlines-done">
                <h2 className="t-3">Done</h2>
                <div className="rows">
                  {done.map((item) => (
                    <div className="row r-time" key={item.id} data-testid="done-row">
                      <span className="st good">Done</span>
                      <span className="stack g4">
                        <span className="row-t">{item.title}</span>
                        <span className="row-s">
                          {item.companyName} · Was due {longDate(item.dueOn)}. You told us this is done.
                        </span>
                      </span>
                      {canMark ? <DoneToggle deadline={item} undo onChanged={resource.reload} /> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {shown.length === 0 && undated.length === 0 ? (
              <p className="quiet" data-testid="deadlines-filter-empty">
                We don&apos;t have any dates for this company yet. That doesn&apos;t mean nothing is due.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

export default function DeadlinesPage() {
  return (
    <Suspense fallback={<Loading what="Getting your deadlines" />}>
      <DeadlinesBody />
    </Suspense>
  );
}
