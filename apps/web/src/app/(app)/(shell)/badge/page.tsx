'use client';

import '@/app/styles/pages/share.css';
import type { BadgeStatusResponse, OverviewResponse, ShareLink } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ErrorState, Loading, PlanLink } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero, Plain } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { entitlementsOf, roleCan } from '@/lib/entitlements';
import { coverageWords, longDate, plural, scoreWords, shortDate } from '@/lib/format';
import { badgeRows, earnedBadge, shareUrl, verifiedUrl } from '@/lib/trust';
import { useResource } from '@/lib/useResource';

const LINK_DAYS = [7, 30, 90] as const;
const TONE_COLOUR: Readonly<Record<string, string>> = { good: 'var(--good)', watch: 'var(--warn)', risk: 'var(--urgent)', none: 'var(--ink-3)' };

const ENDED_SHOWN = 5;

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function leftWords(iso: string): string {
  const days = daysLeft(iso);
  if (days <= 1) return days === 0 ? 'ends today' : 'ends tomorrow';
  return `in ${plural(days, 'day', 'days')}`;
}

/** Something to copy and keep. The button itself says it worked, and the text stays selectable if the browser refuses. */
function CopyRow({ text, note, testId, what = 'link' }: { text: string; note: ReactNode; testId?: string; what?: string }) {
  const toast = useToast();
  const id = useId();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );
  const copy = async () => {
    let worked = true;
    try {
      await navigator.clipboard.writeText(text);
      toast(what === 'link' ? 'Link copied.' : 'Copied.');
    } catch {
      worked = false;
    }
    setState(worked ? 'copied' : 'failed');
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), worked ? 2400 : 6000);
  };
  return (
    <div className="copylink" data-testid={testId}>
      <label htmlFor={id}>{note}</label>
      <div className="copyrow">
        <input className="input" id={id} type="text" readOnly value={text} onFocus={(event) => event.target.select()} />
        <button className={`btn btn-sm cp${state === 'copied' ? ' ok' : ''}`} type="button" onClick={() => void copy()}>
          <Icon name={state === 'copied' ? 'check' : 'copy'} />
          {state === 'copied' ? 'Copied' : 'Copy'}
        </button>
      </div>
      {state === 'failed' ? (
        <span className="cpsay" role="alert">
          We couldn&apos;t copy it. Select the {what} and copy it yourself.
        </span>
      ) : null}
    </div>
  );
}

/**
 * A button that asks before it does something that can't be taken back. The question opens in place,
 * focus lands on the safe answer, Escape backs out, and focus returns to the button that asked.
 */
function Confirm({ label, question, yes, no, busy, onYes, triggerClass, yesClass, noClass, testId, yesTestId }: { label: string; question: string; yes: string; no: string; busy: boolean; onYes: () => void; triggerClass: string; yesClass: string; noClass?: string; testId?: string; yesTestId?: string }) {
  const [asking, setAsking] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const safe = useRef<HTMLButtonElement>(null);
  const was = useRef(false);
  useEffect(() => {
    if (asking) safe.current?.focus();
    else if (was.current) trigger.current?.focus();
    was.current = asking;
  }, [asking]);
  if (!asking) {
    return (
      <button ref={trigger} className={triggerClass} type="button" data-testid={testId} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <span
      className="cf"
      role="group"
      aria-label={question}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) {
          event.stopPropagation();
          setAsking(false);
        }
      }}
    >
      <span className="cfq">{question}</span>
      <button className={yesClass} type="button" disabled={busy} data-testid={yesTestId} onClick={onYes}>
        {busy ? 'Withdrawing' : yes}
      </button>
      <button ref={safe} className={noClass} type="button" disabled={busy} onClick={() => setAsking(false)}>
        {no}
      </button>
    </span>
  );
}

/** What a viewer of the public page gets. Fixed by the API: a summary and counts, never documents. */
const SECTIONS = [
  { title: 'Score and coverage', note: 'The score, and how many checks it rests on', shared: true },
  { title: 'Open issues, as counts', note: 'How many are urgent, important or worth doing', shared: true },
  { title: 'Areas', note: 'A score for each area that has one', shared: true },
  { title: 'What was checked', note: 'Which countries and registers, and how we know', shared: true },
  { title: 'Issue details and your documents', note: 'Viewers never see what an issue says, or open a file', shared: false },
];

function Preview({ companyName, overview, expires }: { companyName: string; overview: OverviewResponse | null; expires: string }) {
  const score = overview?.score;
  const value = score?.kind === 'exact' ? score.value : null;
  const coverage = overview?.coverage ? coverageWords(overview.coverage) : null;
  const areas = (overview?.areas ?? []).filter((area) => area.score !== null).slice(0, 5);
  return (
    <div className="pvw">
      <div className="ph">Preview of the public page</div>
      <div className="pg" aria-hidden="true">
        <div className="top">
          <span className="bg" />
          <div className="tb">
            <span className="wm">Vero</span>
            <span>Expires {expires}</span>
          </div>
          <div className="co">{companyName}</div>
          {score && score.kind !== 'none' ? (
            <div className="sc">
              <span className="pixel">{value ?? scoreWords(score)}</span>
              <div>
                {overview?.statusWord ?? 'Scored'}
                <br />
                {coverage ?? ''}
              </div>
            </div>
          ) : (
            <div className="sc">
              <div>Not scored yet</div>
            </div>
          )}
        </div>
        <div className="bd">
          {areas.length > 0 ? (
            <div className="card">
              <h6>Areas</h6>
              {areas.map((area) => (
                <div className="ab" key={area.layer}>
                  <span>{area.name}</span>
                  <i>
                    <b style={{ width: `${area.score ?? 0}%`, background: (area.score ?? 0) < 50 ? 'var(--urgent)' : undefined }} />
                  </i>
                  <span>{area.score}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="card">
            <h6>Open issues</h6>
            <div className="ln">
              <span>Counted by how serious they are</span>
              <em>Counts only</em>
            </div>
          </div>
          <div className="card">
            <h6>What was checked</h6>
            <div className="ln">
              <span>Registers and how we know</span>
              <em style={{ color: 'var(--good)' }}>Dated</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewLink({ companyId, canMake, onMade }: { companyId: string; canMake: boolean; onMade: () => void }) {
  const [days, setDays] = useState<number>(30);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const until = shortDate(new Date(Date.now() + days * 86_400_000).toISOString());

  const create = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const made = await api.shares.create({ params: { companyId }, body: { expiresInDays: days } });
      setFresh(shareUrl(made.token, window.location.origin));
      onMade();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  return (
    <div className="mod next mk">
      <div className="k">New link</div>
      <h3>Make a link to your public page</h3>
      <div className="lbl3">Who can view</div>
      <p className="who2">Anyone with the link. It can&apos;t be limited to named people yet.</p>
      <div className="lbl3">
        Stays open for<span>Until {until}</span>
      </div>
      <div className="seg" role="group" aria-label="How long it stays open">
        {LINK_DAYS.map((value) => (
          <button key={value} type="button" className={days === value ? 'on' : undefined} aria-pressed={days === value} onClick={() => setDays(value)}>
            {value} days
          </button>
        ))}
      </div>
      {fresh ? <CopyRow testId="share-fresh" text={fresh} note="Your new link. Copy it now: we only show a link once, because we keep just a scrambled copy of it." /> : null}
      {problem ? (
        <p className="probl" role="alert">
          {problem}
        </p>
      ) : null}
      <div className="sum">Viewers can read the summary. They can&apos;t open your documents or see what an issue says.</div>
      {canMake ? (
        <button className="btn" type="button" disabled={busy} onClick={() => void create()}>
          <Icon name="link" />
          {busy ? 'Making the link' : fresh ? 'Make another link' : 'Make a public link'}
        </button>
      ) : (
        <p className="sum" data-testid="share-no-permission">
          Only an owner or admin can make a public link.
        </p>
      )}
    </div>
  );
}

function Links({ links, loading, error, canManage, onChanged }: { links: ShareLink[]; loading: boolean; error: string | null; canManage: boolean; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const live = links.filter((link) => link.active);
  const allEnded = links.filter((link) => !link.active);
  const ended = allEnded.slice(0, ENDED_SHOWN);

  const revoke = async (link: ShareLink) => {
    setBusy(true);
    setProblem(null);
    try {
      await api.shares.revoke({ params: { shareId: link.id } });
      toast('Link withdrawn. It no longer opens.');
      onChanged();
    } catch (failure) {
      setProblem(asApiError(failure).message);
    }
    setBusy(false);
  };

  return (
    <Reveal as="section" className="mod" data-testid="share-links">
      <div className="mh">
        <h2>Links</h2>
        <span className="sub">Withdraw a link and it stops opening straight away</span>
      </div>
      {error ? (
        <p className="probl pad" role="alert">
          {error}
        </p>
      ) : null}
      {problem ? (
        <p className="probl pad" role="alert">
          {problem}
        </p>
      ) : null}
      {live.length === 0 && ended.length === 0 ? (
        loading ? (
          <p className="none2" role="status">
            Getting your links
          </p>
        ) : error ? null : (
          <p className="none2" data-testid="share-none">
            No links are open. Make one above and it shows here, with the day it stops opening.
          </p>
        )
      ) : (
        <table className="lt">
          <thead>
            <tr>
              <th>Link</th>
              <th>Who can view</th>
              <th>Made</th>
              <th>Open until</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="rows-in">
            {[...live, ...ended].map((link, index) => (
              <tr key={link.id} className={link.active ? undefined : 'exp'} data-testid={link.active ? 'share-row' : 'share-ended'} style={{ '--r': index } as CSSProperties}>
                <td className="nm">
                  <b>Public page</b>
                  <small>Shown once when it was made</small>
                </td>
                <td className="who">Anyone with the link</td>
                <td className="muted made">
                  <span className="ph2">Made </span>
                  {longDate(link.createdAt)}
                </td>
                <td className="until">
                  {link.active ? (
                    <>
                      <span className="st2" style={{ color: 'var(--ink)' }}>
                        <span className="ph2">Open until </span>
                        {shortDate(link.expiresAt)}
                      </span>
                      <small className="muted in">{leftWords(link.expiresAt)}</small>
                    </>
                  ) : (
                    <span className="st2" style={{ color: 'var(--ink-3)' }}>
                      {link.revokedAt ? `Withdrawn ${shortDate(link.revokedAt)}` : `Ended ${shortDate(link.expiresAt)}`}
                    </span>
                  )}
                </td>
                <td className="acts3">
                  {link.active && canManage ? (
                    <div className="ac">
                      <Confirm label="Withdraw" question="Withdraw this link? It stops opening for everyone." yes="Yes, withdraw it" no="Keep it" busy={busy} onYes={() => void revoke(link)} triggerClass="wd" yesClass="wd" />
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="foot3">
        {allEnded.length > ENDED_SHOWN ? `Showing the ${ENDED_SHOWN} most recent of ${allEnded.length} ended links. ` : ''}
        Vero doesn&apos;t count views of a link yet, and keeps no record of who opened it.
      </p>
    </Reveal>
  );
}

function Seal({ earned }: { earned: boolean }) {
  return (
    <svg className={`seal2${earned ? ' on' : ''}`} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill={earned ? '#00004A' : '#F4F6FB'} stroke={earned ? '#0182FA' : '#E3E8F2'} strokeWidth="3" />
      <circle className="ring" cx="60" cy="60" r="44" fill="none" stroke={earned ? '#6CC6FF' : '#D5DBE8'} strokeWidth="2" strokeDasharray="4 5" />
      <path d="M38 44l22 38 22-38" fill="none" stroke={earned ? '#fff' : '#B7C0D4'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      {earned ? <path className="tick" d="M78 84l6 6 12-13" fill="none" stroke="#5EEAD4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
}

function BadgePanel({ status, companyName, companyId, canManage, publicSharing, onChanged }: { status: BadgeStatusResponse; companyName: string; companyId: string; canManage: boolean; publicSharing: boolean; onChanged: () => void }) {
  const toast = useToast();
  const session = useSession();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const earned = earnedBadge(status);
  const rows = badgeRows(status);
  const met = rows.filter((row) => row.tone === 'good').length;

  const issue = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const issued = await api.badge.issue({ params: { companyId } });
      setLink(verifiedUrl(issued.publicToken, window.location.origin));
      onChanged();
      await session.refresh().catch(() => undefined);
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const revoke = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.badge.revoke({ params: { companyId } });
      toast('Badge withdrawn. Its link no longer opens.');
      setLink(null);
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  return (
    <Reveal as="section" className="mod badge2" i={1} data-testid="badge-hero" data-earned={earned ? 'yes' : 'no'} aria-label="Your badge and what it takes">
      <div className="mh">
        <h2>Verified badge</h2>
        <span className="sub">A public sign of what Vero checked. It has to be earned, and paying doesn&apos;t earn it.</span>
      </div>
      <div className="bgrid">
        <figure className="bfig">
          <Seal earned={earned !== null} />
          <figcaption data-testid="badge-state">
            {earned ? (
              <>
                <b style={{ color: 'var(--good)' }}>Verified</b>
                <small>
                  {companyName}, until {longDate(earned.expiresAt)}
                </small>
              </>
            ) : (
              <>
                <b>Not earned yet</b>
                <small>{companyName}</small>
              </>
            )}
          </figcaption>
          <div className="met">
            <CountUp className="pixel" value={met} />
            <span>of {rows.length} met</span>
          </div>
        </figure>
        <div className="bcopy">
          <p className="lead3">
            {earned
              ? `Live for ${companyName}. It runs until ${longDate(earned.expiresAt)}.`
              : status.eligible
                ? "You've met everything it takes. It isn't live until it's issued."
                : `You need all ${rows.length === 4 ? 'four' : rows.length}. Fix what's left and it can be issued.`}
          </p>
          <div className="req rows-in">
            {rows.map((row, index) => (
              <div key={row.key} data-testid="badge-requirement" data-key={row.key} style={{ '--r': index } as CSSProperties}>
                <span className="mk2" style={{ background: TONE_COLOUR[row.tone] ?? 'var(--ink-4)' }} aria-hidden="true">
                  {row.tone === 'good' ? <Icon name="check" /> : null}
                </span>
                <span className="lb">{row.label}</span>
                <span className="stw" style={{ color: TONE_COLOUR[row.tone] }}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>

          {status.blockers.length > 0 ? (
            <div className="blk2" data-testid="badge-blockers">
              <b>What&apos;s in the way</b>
              <ul>
                {status.blockers.map((blocker) => (
                  <li key={blocker} data-testid="badge-blocker">
                    {blocker}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {status.badge && !earned ? (
            <p className="quiet2" data-testid="badge-ended">
              Your last badge ended. It isn&apos;t showing to anyone now.
            </p>
          ) : null}
          {link ? (
            <>
              <CopyRow testId="badge-link" text={link} note="Your badge's public page. Copy it now: we only show this link once, because we keep just a scrambled copy of it." />
              <CopyRow
                testId="badge-embed"
                what="code"
                text={`<a href="${link}" rel="noopener">${companyName ? `${companyName.replace(/[<>&"]/g, '')}: ` : ''}verified by Vero</a>`}
                note="To show it on your website, paste this where the badge should sit. It is a plain link to the page above: Vero doesn't host a badge image yet."
              />
            </>
          ) : null}
          {earned && !link ? (
            <p className="quiet2" data-testid="badge-link-gone">
              Its link was shown once, when it was issued. To get a new one, issue the badge again.
            </p>
          ) : null}
          {problem ? (
            <p className="probl" role="alert">
              {problem}
            </p>
          ) : null}

          <div className="btns2">
            {status.eligible && canManage ? (
              <button className={`btn ${earned ? 'btn-g' : 'btn-p'}`} type="button" disabled={busy} data-testid="badge-issue" onClick={() => void issue()}>
                {busy ? 'Working on it' : earned ? 'Issue it again, with a new link' : 'Issue your badge'}
              </button>
            ) : null}
            {!status.eligible && !earned && publicSharing ? (
              <TLink className="btn btn-p" href="/issues">
                See what to fix
              </TLink>
            ) : null}
            {!publicSharing ? (
              <TLink className="btn btn-p" href="/plan" data-testid="badge-plan">
                See the plans
              </TLink>
            ) : null}
            {earned && canManage ? (
              <Confirm
                label="Withdraw the badge"
                question="Withdraw the badge? Its public page stops opening."
                yes="Yes, withdraw it"
                no="Keep it"
                busy={busy}
                onYes={() => void revoke()}
                triggerClass="btn btn-g"
                yesClass="btn btn-g danger"
                noClass="btn btn-g"
                testId="badge-revoke"
                yesTestId="badge-revoke-yes"
              />
            ) : null}
          </div>
          {status.eligible && !canManage ? (
            <p className="quiet2" data-testid="badge-no-permission">
              Only an owner or admin can issue the badge.
            </p>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

function BadgeBody() {
  const session = useSession();
  const search = useSearchParams();
  const companies = session.companies.filter((company) => company.relationship !== 'follow');
  const asked = search.get('company');
  const companyId = asked && companies.some((company) => company.id === asked) ? asked : (session.root?.id ?? '');
  const company = companies.find((item) => item.id === companyId);
  const entitlements = entitlementsOf(session.overview?.plan);
  const canManage = roleCan(session.me, 'sharing.manage');
  const resource = useResource(() => api.badge.get({ params: { companyId } }), [companyId]);
  const shares = useResource(() => (entitlements.publicSharing && canManage ? api.shares.list({ params: { companyId } }) : Promise.resolve({ links: [] as ShareLink[] })), [companyId, entitlements.publicSharing, canManage]);
  // The public page is one company's own summary, so the preview reads that company alone.
  const preview = useResource(() => api.results.overview({ params: { companyId }, query: { scope: 'company' } }).catch(() => null), [companyId]);
  const status = resource.data;

  if (resource.error && (!status || status.companyId !== companyId)) {
    return (
      <Plain>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </Plain>
    );
  }
  if (!status || status.companyId !== companyId) {
    return (
      <Plain>
        <Loading what="Getting your badge" />
      </Plain>
    );
  }

  const companyName = company?.legalName ?? '';
  const links = shares.data?.links ?? [];
  const live = links.filter((link) => link.active).length;
  const overview = preview.data && preview.data.companyId === companyId ? preview.data : null;
  const earned = earnedBadge(status);

  return (
    <div className="pg-share">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Share" /> · <b><Scramble text="Report → Link → Reader" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text={companyName ? `Share ${companyName}` : 'Share and verify'} />
            </h1>
            <div className="meta">
              <span>Read-only for viewers</span>
              <span>Your documents are never shared</span>
              {entitlements.publicSharing ? <span>{live === 1 ? '1 open link' : `${live} open links`}</span> : null}
              <span>{earned ? 'Badge live' : 'Badge not earned yet'}</span>
            </div>
          </div>
          <div className="acts">
            <TLink className="btn btn-g" href="/report">
              <Icon name="download" />
              Printable report
            </TLink>
          </div>
        </div>

        {companies.length > 1 ? (
          <div className="cotabs2" role="group" aria-label="Choose a company">
            {companies.map((item) => (
              <TLink key={item.id} className={item.id === companyId ? 'on' : undefined} href={`/badge?company=${item.id}`} aria-current={item.id === companyId ? 'true' : undefined}>
                {item.legalName}
              </TLink>
            ))}
          </div>
        ) : null}

        <section className="r1">
          <div className="mod gl inc">
            <div className="l">
              <h2>What viewers see</h2>
              <div className="lead">The public page is the same for every link: a dated summary, never the detail.</div>
              <div className="tg">
                {SECTIONS.map((section) => (
                  <div className="row" key={section.title}>
                    <div>
                      <b>{section.title}</b>
                      <small>{section.note}</small>
                    </div>
                    <span className={`lk${section.shared ? ' on' : ''}`}>
                      <Icon name={section.shared ? 'eye' : 'lock'} />
                      {section.shared ? 'Shown' : 'Never shared'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Preview companyName={companyName} overview={overview} expires={shortDate(new Date(Date.now() + 30 * 86_400_000).toISOString())} />
          </div>

          {entitlements.publicSharing ? (
            <NewLink companyId={companyId} canMake={canManage} onMade={shares.reload} />
          ) : (
            <div className="mod next mk">
              <div className="k">New link</div>
              <h3>Public links are part of a paid plan</h3>
              <p data-testid="badge-paid-note">
                A paid plan lets you send a link to anyone, and earn the verified badge. <PlanLink />
              </p>
              <TLink className="btn" href="/plan">
                See the plans
              </TLink>
            </div>
          )}
        </section>
      </Hero>

      <After>
        {entitlements.publicSharing && canManage ? <Links links={links} loading={shares.loading} error={shares.error?.message ?? null} canManage={canManage} onChanged={shares.reload} /> : null}
        <BadgePanel status={status} companyName={companyName} companyId={companyId} canManage={canManage} publicSharing={entitlements.publicSharing} onChanged={resource.reload} />
      </After>
    </div>
  );
}

export default function BadgePage() {
  return (
    <Suspense
      fallback={
        <Plain>
          <Loading what="Getting your badge" />
        </Plain>
      }
    >
      <BadgeBody />
    </Suspense>
  );
}
