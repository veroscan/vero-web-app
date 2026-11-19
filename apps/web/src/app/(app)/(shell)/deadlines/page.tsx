'use client';

import '@/app/styles/pages/deadlines.css';
import type { Deadline, DeadlineListResponse } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, type CSSProperties } from 'react';
import { Empty, ErrorState, Loading, PlanLink, SampleNote, SourcesDownNote } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero, Plain } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { basisWords, buildLanes, calendarFile, daysTo, groupDeadlines, leadOverdue, monthsBefore, nextDue, rowDate, trackingWords, type Lanes } from '@/lib/deadlines';
import { entitlementsOf, planNameOf, roleCan } from '@/lib/entitlements';
import { longDate, plural, shortDate } from '@/lib/format';
import { isWatched, watchingNote } from '@/lib/plan-words';
import { countryLong, dayWords } from '@/lib/records';
import { useResource } from '@/lib/useResource';

interface CompanyCheck {
  checkedAt: string | null;
  sampleData: boolean;
  down: string[];
}

interface Loaded {
  list: DeadlineListResponse;
  checks: Map<string, CompanyCheck>;
}

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

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
      toast(undo ? 'Moved back to your deadlines.' : 'Marked as done. You can undo it under Done.');
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <button className="btn btn-sm btn-g" type="button" disabled={busy} onClick={() => void change()}>
        {undo ? null : <Icon name="check" />}
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

function statusOf(deadline: Deadline): { word: string; tone: string } {
  if (deadline.state === 'overdue') {
    const late = -deadline.daysUntil;
    return { word: `Late, ${plural(late, 'day', 'days')}`, tone: 'var(--urgent)' };
  }
  if (deadline.state === 'due_soon') return { word: 'Due soon', tone: 'var(--warn)' };
  if (deadline.state === 'done') return { word: 'Done', tone: 'var(--good)' };
  return { word: 'On track', tone: 'var(--good)' };
}

function DeadlineRow({ deadline, watching, checkedAt, canMark, onDone, index }: { deadline: Deadline; watching: boolean; checkedAt: string | null; canMark: boolean; onDone: () => void; index: number }) {
  const late = deadline.state === 'overdue';
  const showFix = late && deadline.ruleKey !== null;
  const showDone = canMark && deadline.monitoring === 'reminder';
  const basis = basisWords(deadline.basis);
  const fromRegister = deadline.basis === 'source_date' && checkedAt;
  const status = statusOf(deadline);
  return (
    <tr id={`d-${deadline.id}`} data-testid="deadline-row" data-state={deadline.state} data-rule={deadline.ruleKey ?? ''} style={{ '--r': index } as CSSProperties}>
      <td className="dt">{rowDate(deadline.dueOn)}</td>
      <td>
        <div className="ft2">
          <b>{deadline.title}</b>
          <small>{deadline.companyName}</small>
        </div>
        {basis ? (
          <span className="why" data-testid="deadline-basis">
            {basis}
            {fromRegister ? `, last checked ${dayWords(checkedAt)}` : ''}.
          </span>
        ) : null}
        {deadline.needsReview ? (
          <span className="why" data-testid="deadline-needs-review">
            This date rests on a rule that hasn&apos;t been reviewed yet, so treat it as a guide.
          </span>
        ) : null}
      </td>
      <td className="how">{trackingWords(deadline, watching)}</td>
      <td>
        <span className="st2" style={{ color: status.tone }}>
          {status.word}
        </span>
      </td>
      <td>
        {showFix || showDone ? (
          <div className="dl-acts">
            {showFix ? (
              <TLink className="btn btn-sm btn-p" href={`/issues/${deadline.companyId}/${encodeURIComponent(deadline.ruleKey ?? '')}`}>
                Fix this
              </TLink>
            ) : null}
            {showDone ? <DoneToggle deadline={deadline} undo={false} onChanged={onDone} /> : null}
          </div>
        ) : null}
      </td>
    </tr>
  );
}

const TONE_COLOUR: Readonly<Record<string, string>> = { late: 'var(--urgent)', soon: 'var(--warn)', ok: 'var(--navy)' };

function Timeline({ lanes, where }: { lanes: Lanes; where: (companyId: string) => string }) {
  return (
    <div className="tln" role="group" aria-label={lanes.label} data-testid="deadline-timeline">
      <div className="tlw">
        <div className="hd">
          <span />
          <div className="months">
            {lanes.months.map((month) => (
              <span key={month.key} className={month.year ? 'y' : undefined}>
                {month.word}
              </span>
            ))}
          </div>
        </div>
        {lanes.lanes.map((lane, laneIndex) => (
          <div className="ln" key={lane.companyId}>
            <div className="co">
              <b>{lane.companyName}</b>
              <small>{where(lane.companyId)}</small>
            </div>
            <div className="trk">
              {laneIndex === 0 ? (
                <div className="today" style={{ left: `${lanes.today}%`, height: `calc(${lanes.lanes.length * 100}% + 28px)` }}>
                  <span>Today</span>
                </div>
              ) : null}
              {lane.events.map((event, index) => (
                <a
                  key={event.key}
                  className={`ev2 ${event.place === 'down' ? 'lo' : ''} ${event.align === 'l' ? 'al' : event.align === 'r' ? 'ar' : ''}`}
                  href={`#d-${event.ids[0]}`}
                  style={{ left: `${event.left}%`, animationDelay: `${0.25 + (laneIndex * 4 + index) * 0.07}s` }}
                >
                  <i style={{ background: TONE_COLOUR[event.tone] }} />
                  <div>
                    <b>{event.title}</b>
                    <small style={event.tone === 'late' ? { color: 'var(--urgent)' } : undefined}>{event.sub}</small>
                  </div>
                  {/* The full dates are read after the visible words: an aria-label that drops them fails axe's label-content-name-mismatch. */}
                  <span className="sr-only">. {event.label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarArt({ day }: { day: string }) {
  return (
    <svg className="art" viewBox="0 0 110 110" aria-hidden="true">
      <g transform="rotate(7 55 55)">
        <rect x="18" y="20" width="74" height="76" rx="10" fill="#fff" stroke="#E3E8F2" strokeWidth="2" />
        <path d="M18 30a10 10 0 0 1 10-10h54a10 10 0 0 1 10 10v8H18z" fill="#E3F4FD" />
        <path d="M36 14v12M74 14v12" stroke="#0182FA" strokeWidth="3" strokeLinecap="round" />
        <text x="55" y="76" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="800" fontSize="24" fill="#0B0E3A">
          {day}
        </text>
        <circle className="ring" cx="55" cy="68" r="19" fill="none" stroke="#E5484D" strokeWidth="2" strokeDasharray="5 4" />
      </g>
    </svg>
  );
}

function ClearArt() {
  return (
    <svg className="art" viewBox="0 0 110 110" aria-hidden="true">
      <g transform="rotate(-5 55 55)">
        <rect x="18" y="20" width="74" height="76" rx="10" fill="#fff" stroke="#E3E8F2" strokeWidth="2" />
        <path d="M18 30a10 10 0 0 1 10-10h54a10 10 0 0 1 10 10v8H18z" fill="#E3F4FD" />
        <path d="M36 14v12M74 14v12" stroke="#0182FA" strokeWidth="3" strokeLinecap="round" />
        <circle cx="55" cy="66" r="17" fill="#E3F8F1" />
        <path d="M47 66.5l5.5 5.5 11-12" stroke="#0E9F78" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const all = useMemo(() => list?.deadlines ?? [], [list]);
  const shown = useMemo(() => all.filter((item) => filter === 'all' || item.companyId === filter), [all, filter]);
  const undated = useMemo(() => (list?.undated ?? []).filter((item) => filter === 'all' || item.companyId === filter), [list, filter]);
  const groups = useMemo(() => groupDeadlines(shown), [shown]);
  const lanes = useMemo(() => buildLanes(all), [all]);
  const done = useMemo(() => shown.filter((item) => item.state === 'done'), [shown]);

  if (resource.loading && !list) {
    return (
      <Plain>
        <Loading what="Getting your deadlines" />
      </Plain>
    );
  }
  if (resource.error && !list) {
    return (
      <Plain>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </Plain>
    );
  }
  if (!list) return null;

  const checks = resource.data?.checks ?? new Map<string, CompanyCheck>();
  const here = [...checks.entries()].filter(([id]) => filter === 'all' || id === filter).map(([, check]) => check);
  const sample = here.some((check) => check.sampleData);
  const down = here.flatMap((check) => check.down).map((sourceName) => ({ sourceName }));
  const nameOf = (companyId: string) => companies.find((company) => company.id === companyId)?.legalName ?? '';
  const where = (companyId: string) => {
    const company = companies.find((item) => item.id === companyId);
    return company ? countryLong(company.incorporationCountry) : '';
  };
  const nothingAtAll = list.deadlines.length === 0 && list.undated.length === 0;
  const open = all.filter((item) => item.state !== 'done');
  const inYear = open.filter((item) => item.state === 'overdue' || daysTo(item.dueOn) <= 365).length;
  const withDates = new Set(open.map((item) => item.companyId)).size;
  const checkedTimes = [...checks.values()].map((check) => check.checkedAt).filter((value): value is string => value !== null).sort();
  const lastChecked = checkedTimes[checkedTimes.length - 1] ?? null;
  const next = nextDue(all);
  const late = leadOverdue(all);
  const lateCount = all.filter((item) => item.state === 'overdue').length;
  const counts = (id: string) => all.filter((item) => item.state !== 'done' && (id === 'all' || item.companyId === id)).length;

  return (
    <div className="pg-deadlines">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Coming up" /> · <b><Scramble text="Filings → Due dates" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text="Deadlines" />
            </h1>
            <div className="meta">
              <span>{nothingAtAll ? 'No dates yet' : `${plural(inYear, 'date', 'dates')} in the next 12 months`}</span>
              {withDates > 0 ? <span>{withDates === 1 ? '1 company' : `${withDates} companies`}</span> : null}
              <span>{lastChecked ? `Checked ${dayWords(lastChecked)}, ${TIME.format(new Date(lastChecked))}` : 'Not checked yet'}</span>
            </div>
          </div>
          {open.length > 0 ? (
            <div className="acts">
              <button className="btn btn-g" type="button" onClick={() => download(calendarFile(open), 'vero-deadlines.ics')} data-testid="deadlines-calendar">
                <Icon name="cal" />
                Add to calendar
              </button>
            </div>
          ) : null}
        </div>

        <section className="r1">
          <div className="mod health dl2">
            <div className="l">
              <div className="mh" style={{ padding: 0 }}>
                <h2>Next deadline</h2>
              </div>
              {next ? (
                <>
                  <div className="big">
                    <CountUp className="pixel" value={daysTo(next.dueOn)} />
                    <small>{daysTo(next.dueOn) === 1 ? 'day' : 'days'}</small>
                  </div>
                  <div className="what">until {/^[A-Z][a-z]/.test(next.title) ? next.title.charAt(0).toLowerCase() + next.title.slice(1) : next.title}</div>
                  <div className="due">Due {longDate(next.dueOn)}.</div>
                </>
              ) : (
                <>
                  <div className="big">
                    <span className="pixel">0</span>
                    <small>coming up</small>
                  </div>
                  <div className="what">No date ahead that we know of yet.</div>
                </>
              )}
            </div>
            <div className="r">
              {next ? (
                <>
                  <div className="who">
                    {next.companyName}, {where(next.companyId)}
                  </div>
                  <div className="rows">
                    <div>
                      <b>How Vero tracks it</b>
                      <span>{trackingWords(next, watched)}.</span>
                    </div>
                    <div>
                      <b>Where the date comes from</b>
                      <span>{basisWords(next.basis) ?? 'From the rules for this country'}.</span>
                    </div>
                  </div>
                  <YearBar dueOn={next.dueOn} />
                </>
              ) : (
                <div className="who">Vero adds a date as soon as a check gives one. It never guesses.</div>
              )}
            </div>
          </div>

          {late ? (
            <div className="mod next" data-testid="deadlines-overdue-card">
              <CalendarArt day={String(Number(late.dueOn.slice(8, 10)))} />
              <div className="k">Overdue</div>
              <h3>{late.title}</h3>
              <p>
                <span className="late">{plural(-late.daysUntil, 'day', 'days')} late.</span> {late.companyName} was due to do this by {longDate(late.dueOn)}.{' '}
                {late.monitoring === 'auto' ? 'Once it is filed, Vero sees it on the next check.' : 'Once it is done, mark it done here.'}
              </p>
              <div className="imp">
                <CountUp className="pixel to-late" value={lateCount} />
                <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>
                  {lateCount === 1 ? 'date is overdue' : 'dates are overdue'}
                  <br />
                  across your companies
                </span>
              </div>
              {late.ruleKey ? (
                <TLink className="btn" href={`/issues/${late.companyId}/${encodeURIComponent(late.ruleKey)}`}>
                  Open finding
                </TLink>
              ) : (
                <a className="btn" href={`#d-${late.id}`}>
                  See it below
                </a>
              )}
            </div>
          ) : (
            <div className="mod next">
              <ClearArt />
              <div className="k">Overdue</div>
              <h3>Nothing overdue</h3>
              <p>Every date Vero knows about is still ahead of you. Reminders arrive before each one.</p>
              <TLink className="btn" href="/company">
                See your registry records
              </TLink>
            </div>
          )}
        </section>
      </Hero>

      <After>
        {nothingAtAll ? (
          <Reveal as="section" className="mod" data-testid="deadlines-empty">
            <Empty title="We don't have any dates yet">That doesn&apos;t mean nothing is due. It means no check has given us a date so far.</Empty>
            <div className="emptyacts">
              <TLink className="btn btn-g btn-sm" href="/company">
                See your registry records
              </TLink>
            </div>
          </Reveal>
        ) : (
          <div data-testid="deadlines-list">
            {lanes.lanes.length > 0 ? (
              <Reveal as="section" className="mod">
                <div className="mh">
                  <h2>The next 12 months</h2>
                  <span className="sub">
                    {lanes.months[0]?.word} to {lanes.months[lanes.months.length - 1]?.word}
                  </span>
                  <div className="r">
                    <div className="tlleg">
                      <span>
                        <i style={{ background: 'var(--urgent)' }} />
                        Late
                      </span>
                      <span>
                        <i style={{ background: 'var(--warn)' }} />
                        Due soon
                      </span>
                      <span>
                        <i style={{ background: 'var(--navy)' }} />
                        On track
                      </span>
                    </div>
                  </div>
                </div>
                <div className="tlscroll" data-lenis-prevent-horizontal="">
                  <Timeline lanes={lanes} where={where} />
                </div>
              </Reveal>
            ) : null}

            {sample || down.length > 0 || (note && !nothingAtAll) ? (
              <div className="notes">
                {sample ? <SampleNote /> : null}
                <SourcesDownNote sources={down} />
                {note && !nothingAtAll ? (
                  <p className="note" data-testid="deadlines-plan">
                    <span className="b">{note.title}</span>
                    <span>{note.body}</span>
                    {note.planLink ? <PlanLink /> : null}
                  </p>
                ) : null}
              </div>
            ) : null}

            <Reveal as="section" className="mod" i={1} id="list">
              <div className="mh">
                <h2>By month</h2>
                <span className="sub">Every date Vero is watching</span>
              </div>
              {companies.length > 1 ? (
                <div className="tabs" role="group" aria-label="Filter by company">
                  <button className={`tab${filter === 'all' ? ' on' : ''}`} type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
                    All <span className="n2">{counts('all')}</span>
                  </button>
                  {companies.map((company) => (
                    <button key={company.id} className={`tab${filter === company.id ? ' on' : ''}`} type="button" aria-pressed={filter === company.id} onClick={() => setFilter(company.id)}>
                      {company.legalName} <span className="n2">{counts(company.id)}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {groups.length > 0 ? (
                <table className="dlt">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th style={{ width: '36%' }}>What&apos;s due</th>
                      <th>How Vero knows</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  {groups.map((group) => (
                    <tbody key={`${filter}-${group.id}`} className="rows-in" data-testid="deadline-group">
                      <tr className="gh">
                        <td colSpan={5} className={group.late ? 'late' : undefined}>
                          {group.title}
                        </td>
                      </tr>
                      {group.rows.map((deadline, index) => (
                        <DeadlineRow key={deadline.id} index={index + 1} deadline={deadline} watching={watched} checkedAt={checks.get(deadline.companyId)?.checkedAt ?? null} canMark={canMark} onDone={resource.reload} />
                      ))}
                    </tbody>
                  ))}
                </table>
              ) : null}

              {undated.length > 0 ? (
                <div className="sect" data-testid="deadlines-undated">
                  <h3>No date yet</h3>
                  <p className="muted">{undated.length === 1 ? 'This one applies' : 'These apply'}, but Vero won&apos;t guess a date.</p>
                  <ul className="plain rows-in">
                    {undated.map((item, index) => (
                      <li key={`${item.companyId}-${item.ruleKey}`} data-testid="undated-row" style={{ '--r': index } as CSSProperties}>
                        <div className="ft2">
                          <b>{item.title}</b>
                          <small>
                            {nameOf(item.companyId)}. We need {item.waitingOn}. {trackingWords(item, watched)}.
                          </small>
                        </div>
                        <span className="st2" style={{ color: 'var(--ink-3)' }}>
                          No date
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {done.length > 0 ? (
                <div className="sect" data-testid="deadlines-done">
                  <h3>Done</h3>
                  <p className="muted">Dates you told Vero are done. Undo one if it turns out it isn&apos;t.</p>
                  <ul className="plain rows-in">
                    {done.map((item, index) => (
                      <li key={item.id} data-testid="done-row" style={{ '--r': index } as CSSProperties}>
                        <div className="ft2">
                          <b>{item.title}</b>
                          <small>
                            {item.companyName}. Was due {longDate(item.dueOn)}.
                          </small>
                        </div>
                        <span className="end">
                          <span className="st2" style={{ color: 'var(--good)' }}>
                            Done
                          </span>
                          {canMark ? <DoneToggle deadline={item} undo onChanged={resource.reload} /> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {shown.length === 0 && undated.length === 0 ? (
                <p className="muted filterempty" data-testid="deadlines-filter-empty">
                  We don&apos;t have any dates for this company yet. That doesn&apos;t mean nothing is due.
                </p>
              ) : null}

              <div className="foot2">
                <Icon name="bell" />
                <span>
                  Reminders arrive in <b>What&apos;s new</b> for the owners and admins, 30, 7 and 1 day before each date. Where Vero can read the register, it checks after the date that the filing landed.
                </span>
              </div>
            </Reveal>
          </div>
        )}
      </After>
    </div>
  );
}

function YearBar({ dueOn }: { dueOn: string }) {
  const { words, gone } = monthsBefore(dueOn);
  return (
    <div className="yr">
      <div className="t">
        <span>
          Today <b>{shortDate(new Date().toISOString().slice(0, 10))}</b>
        </span>
        <span>
          Due <b>{rowDate(dueOn)}</b>
        </span>
      </div>
      <div className="blk" aria-hidden="true">
        {words.map((word, index) => (
          <i key={`${word}-${index}`} className={`grow ${index < gone ? '' : index === gone ? 'now' : 'o'}`} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>
      <div className="ms" aria-hidden="true">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className={index === gone ? 'now' : undefined}>
            {index === gone ? 'Now' : word}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DeadlinesPage() {
  return (
    <Suspense
      fallback={
        <Plain>
          <Loading what="Getting your deadlines" />
        </Plain>
      }
    >
      <DeadlinesBody />
    </Suspense>
  );
}
