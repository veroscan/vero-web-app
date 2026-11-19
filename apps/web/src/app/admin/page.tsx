'use client';

import type { AdminUsersResponse, PlanCode, RulePack, StaffRole } from '@vero/shared';
import { PLAN_NAMES } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { Chevron, ErrorState, Loading } from '@/components/Bits';
import { isRefused, StaffBar, StaffRefused } from '@/components/StaffBar';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { connectorWords, packWords } from '@/lib/desk';
import { sentence } from '@/lib/format';
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
        <button className="btn btn-line btn-sm" type="button" onClick={() => setAsking(true)}>
          Approve this pack
        </button>
      </div>
    );
  }
  return (
    <form className="next stack g12" data-testid="approve-form" onSubmit={(event) => void submit(event)}>
      <p className="b">What approving {label} does</p>
      <ul className="changes">
        <li>It&apos;s a professional sign-off by Code &amp; Clause, under the name you enter here.</li>
        <li>This pack&apos;s {pack.ruleCount} rules stop being labelled as drafts for every client it applies to.</li>
        {pack.needsReviewCount > 0 ? <li data-testid="approve-needs-review">{pack.needsReviewCount} of them are still marked for a lawyer to check. Approving covers those as well.</li> : null}
        <li>It goes in the audit log, and it can&apos;t be undone from this screen.</li>
      </ul>
      <div className="field">
        <label htmlFor={`approver-${safe}`}>The name of the Code &amp; Clause lawyer approving this</label>
        <input className="input" id={`approver-${safe}`} type="text" autoComplete="off" minLength={2} maxLength={200} required value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <label className="checkline" htmlFor={`sure-${safe}`}>
        <input className="tick" id={`sure-${safe}`} type="checkbox" checked={sure} onChange={(event) => setSure(event.target.checked)} />
        <span>I&apos;m approving this for Code &amp; Clause, and I understand what it does.</span>
      </label>
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
      <div className="btns">
        <button className="btn btn-ink btn-sm" type="submit" disabled={busy || !sure || name.trim().length < 2} data-testid="approve-confirm">
          {busy ? 'Approving' : `Approve ${label}`}
        </button>
        <button className="btn btn-line btn-sm" type="button" disabled={busy} onClick={() => setAsking(false)}>
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
      <span className="stack g4">
        <span className="row-t">
          {org.name}
          {org.isDemo ? ' (demo, with made-up data)' : ''}
        </span>
        <span className="row-s">Their role: {org.role}</span>
      </span>
      <span className="orgplan">
        <label className="sr-only" htmlFor={`plan-${org.id}`}>
          Plan for {org.name}
        </label>
        <select className="input roleselect" id={`plan-${org.id}`} value={plan} onChange={(event) => setPlan(event.target.value as PlanCode | '')}>
          <option value="">Move to a plan</option>
          {PLAN_CODES.map((code) => (
            <option key={code} value={code}>
              {PLAN_NAMES[code]}
            </option>
          ))}
        </select>
        <button className="btn btn-sm btn-line" type="button" disabled={busy || !plan} onClick={() => void save()}>
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
    <details className="more" data-testid="admin-user" data-email={person.email}>
      <summary className="row r-open">
        <span className="stack g4">
          <span className="row-t">{person.name ?? person.email}</span>
          <span className="row-s">{person.name ? person.email : person.organisations.map((org) => org.name).join(', ') || 'No team'}</span>
        </span>
        <span className={person.staffRole ? 'b' : 'quiet'} data-testid="admin-staff-role">
          {person.staffRole === 'admin' ? 'Staff: admin' : person.staffRole === 'lawyer' ? 'Staff: lawyer' : 'Not staff'}
        </span>
        <Chevron />
      </summary>
      <div className="more-body stack g16">
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
          <div className="stack g12">
            <p className="b">Teams</p>
            <p className="small">We can&apos;t show the plan each is on now. Setting one tells the team, and goes in their audit log.</p>
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
      <div className="vs">
        <main style={{ display: 'contents' }}>
          <ErrorState error={resource.error} onRetry={resource.reload} />
        </main>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="vs">
        <main style={{ display: 'contents' }}>
          <Loading what="Getting rule packs and data" />
        </main>
      </div>
    );
  }

  return (
    <div className="vs">
      <StaffBar />
      <main className="wrap mid">
        <section className="sec stack g48" data-testid="admin">
          <div className="stack g12">
            <h1 className="t-1">Rule packs and data</h1>
            <p className="lead">What the software checks against, and where its facts come from.</p>
          </div>

          <p className="note" data-testid="audit-note">
            <span className="b">Everything here is audited.</span>
            <span>Viewing the list of people, approving a pack, changing a plan and changing staff access each go in the audit log under your account.</span>
          </p>

          <div className="stack g16" data-testid="admin-packs">
            <div className="stack g4">
              <h2 className="t-2">Rule packs</h2>
              <p className="quiet">Only Code &amp; Clause can approve a pack. Until then, its rules are drafts.</p>
            </div>
            {data.packs.length === 0 ? (
              <p className="quiet" data-testid="packs-empty">
                No rule packs are loaded.
              </p>
            ) : (
              <div className="rows">
                {data.packs.map((pack) => {
                  const words = packWords(pack);
                  return (
                    <details className="more" key={`${pack.jurisdiction}-${pack.version}`} data-testid="admin-pack" data-pack={`${pack.jurisdiction}@${pack.version}`} data-status={pack.status}>
                      <summary className="row pack">
                        <span className="stack g4">
                          <span className="row-t">{pack.name ?? pack.jurisdiction}</span>
                          <span className="row-s">{words.line}</span>
                        </span>
                        <span className="stack g4 packstate">
                          <span className={`st ${words.tone}`} data-testid="pack-status">
                            {words.word}
                          </span>
                          <span className="quiet num">Version {pack.version}</span>
                        </span>
                        <Chevron />
                      </summary>
                      <div className="more-body stack g16">
                        <p className="quiet">
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

          <div className="stack g16" data-testid="admin-sources">
            <div className="stack g4">
              <h2 className="t-2">Data sources</h2>
              {data.connectors.mode === 'fixture' ? (
                <p className="note" data-testid="sample-note">
                  <span className="b">Sample data.</span>
                  <span>These sources are running on made-up records, not real registers. Production refuses this.</span>
                </p>
              ) : null}
            </div>
            {data.connectors.connectors.length === 0 ? (
              <p className="quiet">No sources are set up.</p>
            ) : (
              <div className="rows">
                {data.connectors.connectors.map((connector) => {
                  const words = connectorWords(connector, data.connectors.mode);
                  return (
                    <div className="row r-act" key={connector.id} data-testid="admin-source" data-connector={connector.id}>
                      <span className="stack g4">
                        <span className="row-t">{sentence(connector.sourceName)}</span>
                        <span className="row-s">{words.line}</span>
                      </span>
                      <span className={`st ${words.tone}`}>{words.word}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="stack g16" data-testid="admin-users">
            <div className="stack g4">
              <h2 className="t-2">People and plans</h2>
              <p className="quiet">Everyone with an account. There are no sign-in details or two-step secrets here. Moving a team&apos;s plan is the only way a plan changes today.</p>
            </div>
            {data.users.users.length === 0 ? (
              <p className="quiet" data-testid="users-empty">
                Nobody is on this page.
              </p>
            ) : (
              <div className="rows">
                {data.users.users.map((person) => (
                  <UserRow key={person.id} person={person} onDone={resource.reload} />
                ))}
              </div>
            )}
            <div className="btns">
              {from > 0 ? (
                <TLink className="btn btn-line btn-sm" href={`/admin?from=${Math.max(0, from - PAGE_SIZE)}`}>
                  Earlier people
                </TLink>
              ) : null}
              {data.users.hasMore ? (
                <TLink className="btn btn-line btn-sm" href={`/admin?from=${from + PAGE_SIZE}`}>
                  More people
                </TLink>
              ) : null}
            </div>
          </div>
        </section>
      </main>
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
