'use client';

import type { AdminUsersResponse, PlanCode, RulePack, StaffRole } from '@vero/shared';
import { PLAN_NAMES } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { Chevron, ErrorState, Loading } from '@/components/Bits';
import { isRefused, StaffPage, StaffRefused } from '@/components/StaffBar';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { connectorWords, packWords } from '@/lib/desk';
import { longDate, plural, sentence } from '@/lib/format';
import { useResource } from '@/lib/useResource';

const PAGE_SIZE = 50;
const PLAN_CODES = Object.keys(PLAN_NAMES) as PlanCode[];

function ApprovePack({ pack, onDone }: { pack: RulePack; onDone: () => void }) {
  const toast = useToast();
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState('');
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const label = `${pack.name ?? pack.jurisdiction} ${pack.version}`;
  const safe = `${pack.jurisdiction}-${pack.version.replaceAll('.', '-')}`;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      const updated = await api.admin.approveRulePack({
        params: { jurisdiction: pack.jurisdiction, version: pack.version },
        body: { approverName: name.trim() },
      });
      toast(updated.status === 'approved' ? `${label} is approved.` : `${label} wasn't approved.`);
      onDone();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  if (!asking) {
    return (
      <div className="btns">
        <button className="btn btn-g btn-sm" type="button" onClick={() => setAsking(true)}>
          Approve this pack
        </button>
      </div>
    );
  }
  return (
    <form className="approve" data-testid="approve-form" onSubmit={(event) => void submit(event)}>
      <p className="b">What approving {label} does</p>
      <ul>
        <li>It&apos;s a professional sign-off, under the name of the lawyer you enter here.</li>
        <li>This pack&apos;s {pack.ruleCount} rules stop being labelled as drafts for every client it applies to.</li>
        {pack.needsReviewCount > 0 ? <li data-testid="approve-needs-review">{pack.needsReviewCount} of them are still marked for a lawyer to check. Approving covers those as well.</li> : null}
        <li>It goes in the audit log, and it can&apos;t be undone from this screen.</li>
      </ul>
      <div className="field">
        <label htmlFor={`approver-${safe}`}>The name of the lawyer approving this</label>
        <input className="input" id={`approver-${safe}`} type="text" autoComplete="off" minLength={2} maxLength={200} required value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <label className="check" htmlFor={`sure-${safe}`}>
        <input id={`sure-${safe}`} type="checkbox" checked={sure} onChange={(event) => setSure(event.target.checked)} />
        <span>I&apos;m approving this for Vero, and I understand what it does.</span>
      </label>
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
      <div className="btns">
        <button className="btn btn-p btn-sm" type="submit" disabled={busy || !sure || name.trim().length < 2} data-testid="approve-confirm">
          {busy ? 'Approving' : `Approve ${label}`}
        </button>
        <button className="btn btn-g btn-sm" type="button" disabled={busy} onClick={() => setAsking(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

type AdminUser = AdminUsersResponse['users'][number];

function PlanSetter({ org, onDone }: { org: AdminUser['organisations'][number]; onDone: () => void }) {
  const toast = useToast();
  const [plan, setPlan] = useState<PlanCode | ''>('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const save = async () => {
    if (!plan) return;
    setBusy(true);
    setProblem(null);
    try {
      await api.admin.setPlan({ params: { organisationId: org.id }, body: { plan } });
      toast(`${org.name} is now on ${PLAN_NAMES[plan]}. They've been told.`);
      setPlan('');
      onDone();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };
  return (
    <div className="orgrow" data-testid="admin-org" data-org={org.id}>
      <span>
        <b>
          {org.name}
          {org.isDemo ? ' (demo, with made-up data)' : ''}
        </b>
        <small className="muted">Their role: {org.role}</small>
      </span>
      <span className="orgplan">
        <label className="sr-only" htmlFor={`plan-${org.id}`}>
          Plan for {org.name}
        </label>
        <select className="input" id={`plan-${org.id}`} value={plan} onChange={(event) => setPlan(event.target.value as PlanCode | '')}>
          <option value="">Move to a plan</option>
          {PLAN_CODES.map((code) => (
            <option key={code} value={code}>
              {PLAN_NAMES[code]}
            </option>
          ))}
        </select>
        <button className="btn btn-g btn-sm" type="button" disabled={busy || !plan} onClick={() => void save()}>
          Set plan
        </button>
      </span>
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
    </div>
  );
}

function UserRow({ person, onDone }: { person: AdminUser; onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const change = async (role: StaffRole | 'none') => {
    setBusy(true);
    setProblem(null);
    try {
      if (role === 'none') await api.admin.revokeStaff({ params: { userId: person.id } });
      else await api.admin.grantStaff({ body: { userId: person.id, role } });
      toast(role === 'none' ? 'Staff access removed.' : `Staff access set to ${role}.`);
      onDone();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };
  return (
    <details data-testid="admin-user" data-email={person.email}>
      <summary className="srow">
        <span>
          <b>{person.name ?? person.email}</b>
          <small>{person.name ? person.email : person.organisations.map((org) => org.name).join(', ') || 'No team'}</small>
        </span>
        <span className={`st ${person.staffRole ? 'good' : 'none'}`} data-testid="admin-staff-role">
          {person.staffRole === 'admin' ? 'Staff: admin' : person.staffRole === 'lawyer' ? 'Staff: lawyer' : 'Not staff'}
        </span>
        <Chevron />
      </summary>
      <div className="sbody">
        <div className="field staffpick">
          <label htmlFor={`staff-${person.id}`}>Staff access</label>
          <select className="input" id={`staff-${person.id}`} value={person.staffRole ?? 'none'} disabled={busy} onChange={(event) => void change(event.target.value as StaffRole | 'none')}>
            <option value="none">Not staff</option>
            <option value="lawyer">Lawyer: reads and decides reviews</option>
            <option value="admin">Admin: all of this screen as well</option>
          </select>
        </div>
        {problem ? (
          <p className="formerror" role="alert">
            {problem}
          </p>
        ) : null}
        {person.organisations.length > 0 ? (
          <div>
            <p className="b">Teams</p>
            <p>We can&apos;t show the plan each is on now. Setting one tells the team, and goes in their audit log.</p>
            {person.organisations.map((org) => (
              <PlanSetter key={org.id} org={org} onDone={onDone} />
            ))}
          </div>
        ) : null}
      </div>
    </details>
  );
}

function AdminBody() {
  const search = useSearchParams();
  const from = Math.max(0, Number.parseInt(search.get('from') ?? '0', 10) || 0);
  const resource = useResource(async () => {
    const [packs, connectors, users] = await Promise.all([api.admin.rulePacks(), api.admin.connectors(), api.admin.users({ query: { limit: PAGE_SIZE, offset: from } })]);
    return { packs: packs.packs, connectors, users };
  }, [from]);
  const data = resource.data;

  if (isRefused(resource.error)) return <StaffRefused adminOnly />;
  if (resource.error && !data) {
    return (
      <div className="pg-staff">
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="pg-staff">
        <Loading what="Getting rule packs and data" />
      </div>
    );
  }

  const approved = data.packs.filter((pack) => pack.status === 'approved').length;
  return (
    <StaffPage>
      <section className="stack" data-testid="admin">
        <div className="pagehead">
          <div>
            <h1>Rule packs and data</h1>
            <p>What the software checks against, where its facts come from, who has an account, and who joined the waitlist.</p>
          </div>
        </div>

        <p className="note" data-testid="audit-note">
          <span className="b">Everything here is audited.</span>
          <span>Viewing the list of people or the waitlist, approving a pack, changing a plan and changing staff access each go in the audit log under your account.</span>
        </p>

        <div className="mod" data-testid="admin-packs">
          <div className="mh">
            <div className="t">
              <h2>Rule packs</h2>
              <p>A lawyer has to approve a pack. Until then, its rules are drafts.</p>
            </div>
            <span className="r muted">{data.packs.length === 0 ? '' : `${approved} of ${data.packs.length} approved`}</span>
          </div>
          {data.packs.length === 0 ? (
            <p className="empty" data-testid="packs-empty">
              No rule packs are loaded.
            </p>
          ) : (
            <div className="list">
              {data.packs.map((pack) => {
                const words = packWords(pack);
                return (
                  <details key={`${pack.jurisdiction}-${pack.version}`} data-testid="admin-pack" data-pack={`${pack.jurisdiction}@${pack.version}`} data-status={pack.status}>
                    <summary className="srow">
                      <span>
                        <b>{pack.name ?? pack.jurisdiction}</b>
                        <small>{words.line}</small>
                      </span>
                      <span className="r">
                        <span className={`st ${words.tone}`} data-testid="pack-status">
                          {words.word}
                        </span>
                        <small className="num">Version {pack.version}</small>
                      </span>
                      <Chevron />
                    </summary>
                    <div className="sbody">
                      <p>
                        {pack.ruleCount} {pack.ruleCount === 1 ? 'rule' : 'rules'}. {pack.needsReviewCount > 0 ? `${pack.needsReviewCount} still marked for a lawyer to check.` : 'None marked for a lawyer to check.'}
                      </p>
                      {pack.status === 'draft' ? <ApprovePack pack={pack} onDone={resource.reload} /> : null}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>

        <div className="mod" data-testid="admin-sources">
          <div className="mh">
            <div className="t">
              <h2>Data sources</h2>
              <p>The registers Vero reads, and whether each one is answering.</p>
            </div>
          </div>
          {data.connectors.mode === 'fixture' ? (
            <p className="note modnote" data-testid="sample-note">
              <span className="b">Sample data.</span>
              <span>These sources are running on made-up records, not real registers. Production refuses this.</span>
            </p>
          ) : null}
          {data.connectors.connectors.length === 0 ? (
            <p className="empty">No sources are set up.</p>
          ) : (
            <div className="list">
              {data.connectors.connectors.map((connector) => {
                const words = connectorWords(connector, data.connectors.mode);
                return (
                  <div className="srow plain" key={connector.id} data-testid="admin-source" data-connector={connector.id}>
                    <span>
                      <b>{sentence(connector.sourceName)}</b>
                      <small>{words.line}</small>
                    </span>
                    <span className={`st ${words.tone}`}>{words.word}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Waitlist />

        <div className="mod" data-testid="admin-users">
          <div className="mh">
            <div className="t">
              <h2>People and plans</h2>
              <p>Everyone with an account. There are no sign-in details or two-step secrets here. Moving a team&apos;s plan is the only way a plan changes today.</p>
            </div>
          </div>
          {data.users.users.length === 0 ? (
            <p className="empty" data-testid="users-empty">
              Nobody is on this page.
            </p>
          ) : (
            <div className="list">
              {data.users.users.map((person) => (
                <UserRow key={person.id} person={person} onDone={resource.reload} />
              ))}
            </div>
          )}
          {from > 0 || data.users.hasMore ? (
            <div className="pager">
              <span className="muted">
                Showing {from + 1} to {from + data.users.users.length}
              </span>
              {from > 0 ? (
                <TLink className="btn btn-g btn-sm" href={`/admin?from=${Math.max(0, from - PAGE_SIZE)}`}>
                  Earlier people
                </TLink>
              ) : null}
              {data.users.hasMore ? (
                <TLink className="btn btn-g btn-sm" href={`/admin?from=${from + PAGE_SIZE}`}>
                  More people
                </TLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </StaffPage>
  );
}

const WAITLIST_PAGE = 25;

/** Who joined the website's waitlist, newest first. Its own panel, so a failure here leaves the rest standing. */
function Waitlist() {
  const [offset, setOffset] = useState(0);
  const resource = useResource(() => api.admin.waitlist({ query: { limit: WAITLIST_PAGE, offset } }), [offset]);
  const list = resource.data;
  return (
    <div className="mod" data-testid="admin-waitlist">
      <div className="mh">
        <div className="t">
          <h2>Waitlist</h2>
          <p>People who asked to join from the website. Nobody is let in from here: invite them when it&apos;s their turn.</p>
        </div>
        {list ? <span className="r muted">{plural(list.total, 'person', 'people')}</span> : null}
      </div>
      {resource.error && !list ? (
        <div className="sbody">
          <p className="formerror" role="alert">
            {resource.error.message}
          </p>
          <div className="btns">
            <button className="btn btn-g btn-sm" type="button" onClick={resource.reload}>
              Try again
            </button>
          </div>
        </div>
      ) : !list ? (
        <div className="sbody">
          <div className="skel" style={{ height: 44 }} />
          <div className="skel" style={{ height: 44 }} />
        </div>
      ) : list.entries.length === 0 ? (
        <p className="empty" data-testid="waitlist-empty">
          Nobody has joined the waitlist yet.
        </p>
      ) : (
        <>
          <table className="wl-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Person</th>
                <th>Company</th>
                <th>What they said</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {list.entries.map((entry) => (
                <tr key={entry.id} data-testid="waitlist-entry">
                  <td>
                    <b>{entry.name}</b>
                    <small>{entry.email}</small>
                  </td>
                  <td>
                    {entry.company ?? <span className="muted">Not given</span>}
                    {entry.need || entry.budget ? <small>{[entry.need, entry.budget].filter(Boolean).join(' · ')}</small> : null}
                  </td>
                  <td className="msg">{entry.message ?? <span className="muted">Nothing</span>}</td>
                  <td className="when">
                    {longDate(entry.createdAt)}
                    {entry.submissions > 1 ? <small>Asked {entry.submissions} times</small> : null}
                    {entry.invitedAt ? <small className="good">Invited {longDate(entry.invitedAt)}</small> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {offset > 0 || list.hasMore ? (
            <div className="pager">
              <span className="muted">
                Showing {offset + 1} to {offset + list.entries.length} of {list.total}
              </span>
              {offset > 0 ? (
                <button className="btn btn-g btn-sm" type="button" onClick={() => setOffset(Math.max(0, offset - WAITLIST_PAGE))}>
                  Newer
                </button>
              ) : null}
              {list.hasMore ? (
                <button className="btn btn-g btn-sm" type="button" onClick={() => setOffset(offset + WAITLIST_PAGE)}>
                  Older
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading what="Getting rule packs and data" />}>
      <AdminBody />
    </Suspense>
  );
}
