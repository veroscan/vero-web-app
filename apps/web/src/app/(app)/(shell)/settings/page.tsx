'use client';

import '@/app/styles/pages/settings.css';
import { type EmailNotificationTopic, type Invitation, type Member, type NotificationPreferences, type Role, type SessionInfo, type TotpEnrolResponse } from '@vero/shared';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { Select } from '@/components/Select';
import { After, Hero, useWatchlist } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { entitlementsOf, planNameOf, roleCan } from '@/lib/entitlements';
import { longDate } from '@/lib/format';
import { softly } from '@/lib/motion';
import { countryLong } from '@/lib/records';
import { ROLE_WORDS, sinceWords } from '@/lib/trust';
import { useResource } from '@/lib/useResource';

function FormProblem({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="formerror" role="alert">
      {message}
    </p>
  );
}

/**
 * A button that asks before it does something that can't be taken back. The question opens in place,
 * focus lands on the safe answer, Escape backs out, and focus returns to the button that asked.
 */
function Confirm({ label, question, yes, no, busyWord, busy, onYes, triggerClass, yesClass, noClass, testId, yesTestId }: { label: string; question: string; yes: string; no: string; busyWord: string; busy: boolean; onYes: () => void; triggerClass?: string; yesClass?: string; noClass?: string; testId?: string; yesTestId?: string }) {
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
        {busy ? busyWord : yes}
      </button>
      <button ref={safe} className={noClass} type="button" disabled={busy} onClick={() => setAsking(false)}>
        {no}
      </button>
    </span>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function Companies() {
  const { companies } = useSession();
  return (
    <Reveal as="section" className="mod" id="companies">
      <div className="mh">
        <h2>Companies</h2>
        <span className="sub2">The companies in this workspace</span>
      </div>
      {companies.length === 0 ? (
        <p className="bd quiet" data-testid="settings-no-companies">
          You haven&apos;t added a company yet.{' '}
          <TLink className="link" href="/onboarding/company">
            Find your company
          </TLink>
        </p>
      ) : (
        <>
          <div className="rws rows-in">
            {companies.map((company, index) => (
              <TLink className="rw lnk" href={`/company/${company.id}`} key={company.id} data-testid="settings-company" style={{ '--r': index } as CSSProperties}>
                <div>
                  <b>{company.legalName}</b>
                  <small>
                    {countryLong(company.incorporationCountry)}
                    {company.relationship === 'follow' ? ', followed' : ''}
                  </small>
                </div>
                <div className="r">
                  <span className="stx muted">Registry records</span>
                  <Icon name="chev" />
                </div>
              </TLink>
            ))}
          </div>
          <div className="sv start">
            <TLink className="btn btn-g" href="/onboarding/company?add=1" data-testid="settings-add-company">
              <Icon name="plus" />
              Add another company
            </TLink>
          </div>
        </>
      )}
    </Reveal>
  );
}

/** What each role can do, in a line. From the permissions the API enforces. */
const ROLE_HINTS: Record<Role, string> = {
  owner: 'Everything, including billing and other owners',
  admin: 'Manages the team, sharing and scans',
  member: 'Uploads documents and runs scans',
  lawyer: 'Sees findings and reports, changes nothing',
};

function roleChoices(canOwn: boolean): Role[] {
  return canOwn ? ['owner', 'admin', 'member', 'lawyer'] : ['admin', 'member', 'lawyer'];
}

function MemberRow({ member, isYou, soleOwner, canManage, canOwn, onChanged }: { member: Member; isYou: boolean; soleOwner: boolean; canManage: boolean; canOwn: boolean; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const name = member.name ?? member.email;
  const touchable = canManage && !isYou && (member.role !== 'owner' || canOwn);

  const change = async (role: Role) => {
    setBusy(true);
    setProblem(null);
    try {
      await api.members.update({
        params: { userId: member.userId },
        body: { role },
      });
      toast(`${name} is now ${ROLE_WORDS[role].toLowerCase()}.`);
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.members.remove({ params: { userId: member.userId } });
      if (isYou) {
        window.location.assign('/');
        return;
      }
      toast(`${name} no longer has access.`);
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <tr data-testid="member-row" data-email={member.email}>
      <td className="who3">
        <div className="mbr">
          <span className="av3" aria-hidden="true">
            {initialsOf(name)}
          </span>
          <div className="nm">
            <b>
              {name}
              {isYou ? ' (you)' : ''}
            </b>
            {member.name ? <small>{member.email}</small> : null}
          </div>
        </div>
      </td>
      <td className="rl">
        {touchable ? (
          <>
            <label className="sr-only" htmlFor={`role-${member.userId}`}>
              Role for {name}
            </label>
            <Select
              className="roleselect"
              id={`role-${member.userId}`}
              ariaLabel={`Role for ${name}`}
              value={member.role}
              disabled={busy}
              onChange={(next) => void change(next as Role)}
              options={roleChoices(canOwn).map((role) => ({
                value: role,
                label: ROLE_WORDS[role],
                hint: ROLE_HINTS[role],
              }))}
            />
          </>
        ) : (
          ROLE_WORDS[member.role]
        )}
      </td>
      <td className="muted since">Joined {longDate(member.joinedAt)}</td>
      <td className="ac">
        {soleOwner ? (
          <span className="note2" data-testid="sole-owner-note">
            To leave, make someone else an owner first.
          </span>
        ) : touchable || isYou ? (
          <Confirm
            label={isYou ? 'Leave' : 'Remove'}
            question={isYou ? 'Leave this workspace? You lose access straight away.' : `Remove ${name}? They lose access straight away.`}
            yes={isYou ? 'Yes, leave' : 'Yes, remove'}
            no={isYou ? 'Stay' : 'Keep'}
            busyWord={isYou ? 'Leaving' : 'Removing'}
            busy={busy}
            onYes={() => void remove()}
            yesClass="danger2"
          />
        ) : null}
        <FormProblem message={problem} />
      </td>
    </tr>
  );
}

function InviteForm({ canOwn, onSent, onClose }: { canOwn: boolean; onSent: () => void; onClose: () => void }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api.invitations.create({ body: { email: email.trim(), role } });
      toast("Invite sent. They'll get an email from us.");
      onSent();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <form className="inv" id="invite" data-testid="invite-form" onSubmit={(event) => void submit(event)}>
      <div className="field">
        <label htmlFor="invite-mail">Their work email</label>
        <input className="input" id="invite-mail" type="email" required autoComplete="off" autoFocus placeholder="name@company.example" value={email} onChange={(event) => setEmail(event.target.value)} />
        <small>We&apos;ll email them a link to join. It lasts 7 days.</small>
      </div>
      <div className="field">
        <label htmlFor="invite-role">What they can do</label>
        <Select
          id="invite-role"
          value={role}
          onChange={(next) => setRole(next as Role)}
          options={roleChoices(canOwn).map((choice) => ({
            value: choice,
            label: ROLE_WORDS[choice],
            hint: ROLE_HINTS[choice],
          }))}
        />
      </div>
      <div className="invbtns">
        <button className="btn btn-p" type="submit" disabled={busy || email.trim().length === 0}>
          {busy ? 'Sending' : 'Send invite'}
        </button>
        <button className="btn btn-g" type="button" disabled={busy} onClick={onClose}>
          Cancel
        </button>
      </div>
      <FormProblem message={problem} />
    </form>
  );
}

function PendingRow({ invitation, onChanged }: { invitation: Invitation; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const revoke = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.invitations.revoke({ params: { invitationId: invitation.id } });
      toast('Invite withdrawn.');
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };
  return (
    <tr data-testid="pending-row" data-email={invitation.email}>
      <td className="who3">
        <div className="mbr">
          <span className="av3" aria-hidden="true">
            <Icon name="mail" />
          </span>
          <div className="nm">
            <b>{invitation.email}</b>
            <small>We&apos;ve emailed them. The invite lasts until {longDate(invitation.expiresAt)}.</small>
          </div>
        </div>
      </td>
      <td className="rl">{ROLE_WORDS[invitation.role]}</td>
      <td className="since">
        <span className="st2" style={{ color: 'var(--warn)' }}>
          Invite sent
        </span>
      </td>
      <td className="ac">
        <Confirm label="Withdraw" question="Withdraw this invite? Its link stops working." yes="Yes, withdraw" no="Keep" busyWord="Withdrawing" busy={busy} onYes={() => void revoke()} yesClass="danger2" />
        <FormProblem message={problem} />
      </td>
    </tr>
  );
}

function Team() {
  const session = useSession();
  const { me } = session;
  const canManage = roleCan(me, 'members.manage');
  const canOwn = roleCan(me, 'members.manageOwners');
  const canInvite = roleCan(me, 'invitations.manage');
  const canSeeInvites = roleCan(me, 'invitations.read');
  const [inviting, setInviting] = useState(false);
  const resource = useResource(async () => {
    const [members, invitations] = await Promise.all([api.members.list(), canSeeInvites ? api.invitations.list() : Promise.resolve({ invitations: [] })]);
    return { members: members.members, invitations: invitations.invitations };
  }, [canSeeInvites]);
  const count = resource.data?.members.length ?? 0;

  return (
    <Reveal as="section" className="mod" id="team" data-testid="team">
      <div className="mh">
        <h2>Team members</h2>
        <span className="sub2">{resource.data ? `${count} ${count === 1 ? 'person' : 'people'} in this workspace` : 'Who can see and change this workspace'}</span>
      </div>
      {resource.error && !resource.data ? (
        <div className="bd" data-testid="team-error">
          <FormProblem message={resource.error.message} />
          <button className="btn btn-g btn-sm" type="button" onClick={resource.reload} style={{ marginTop: 10 }}>
            Try again
          </button>
        </div>
      ) : resource.data ? (
        <div className="tmwrap">
          <table className="tm">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Since</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="rows-in">
              {resource.data.members.map((member) => (
                <MemberRow
                  key={member.userId}
                  member={member}
                  isYou={member.userId === me.user.id}
                  soleOwner={member.userId === me.user.id && member.role === 'owner' && resource.data?.members.filter((item) => item.role === 'owner').length === 1}
                  canManage={canManage}
                  canOwn={canOwn}
                  onChanged={resource.reload}
                />
              ))}
              {resource.data.invitations.map((invitation) => (
                <PendingRow key={invitation.id} invitation={invitation} onChanged={resource.reload} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tmload" role="status" aria-label="Getting your team">
          <span />
          <span />
        </div>
      )}
      {canInvite ? (
        inviting ? (
          <InviteForm
            canOwn={canOwn}
            onClose={() => setInviting(false)}
            onSent={() => {
              setInviting(false);
              resource.reload();
            }}
          />
        ) : (
          <div className="sv start">
            <button className="btn btn-p" type="button" onClick={() => setInviting(true)}>
              <Icon name="plus" />
              Invite someone
            </button>
            <span className="hint2">Members can upload documents and run scans. Read only can see findings and reports.</span>
          </div>
        )
      ) : (
        <p className="bd small2" data-testid="team-no-permission">
          Only an owner or admin can invite people or change roles.
        </p>
      )}
    </Reveal>
  );
}

const UPDATE_KINDS: ReadonlyArray<{ key: EmailNotificationTopic; title: string; note: string }> = [
  { key: 'deadline', title: 'Deadlines approaching', note: 'Before a date, on the days you choose under Deadlines, and when one passes' },
  { key: 'score', title: 'Score changes', note: 'When a re-check finds something new, or a score or status moves' },
  { key: 'team', title: 'Team news', note: 'People joining, and changes to roles' },
  { key: 'lookup', title: 'Company lookups', note: 'Updates on a company we looked up by hand for you' },
  { key: 'system', title: 'From Vero', note: 'Anything about your account itself' },
];

function Notifications() {
  const resource = useResource(() => api.notifications.preferences(), []);
  const [saved, setSaved] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState<EmailNotificationTopic | null>(null);
  const [status, setStatus] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const prefs = saved ?? resource.data ?? null;

  const choose = async (key: EmailNotificationTopic, on: boolean) => {
    setSaving(key);
    setStatus(null);
    try {
      const next = await api.notifications.updatePreferences({ body: { email: { [key]: on } } });
      setSaved(next);
      const title = UPDATE_KINDS.find((kind) => kind.key === key)?.title ?? 'That';
      setStatus({ tone: 'ok', text: on ? `Saved. ${title} will be emailed to you.` : `Saved. ${title} won't be emailed to you.` });
    } catch (error) {
      setStatus({ tone: 'bad', text: `${asApiError(error).message} Your choice wasn't saved.` });
    }
    setSaving(null);
  };

  return (
    <Reveal as="section" className="mod" id="notifications">
      <div className="mh">
        <h2>Notifications</h2>
        <span className="sub2">What reaches you, and where</span>
      </div>
      <div className="sub3" id="email-me-about">
        Email me about
      </div>
      {resource.error && !prefs ? (
        <div className="bd" role="alert" data-testid="settings-email-error">
          <FormProblem message={resource.error.message} />
          <button className="btn btn-g btn-sm" type="button" onClick={resource.reload}>
            Try again
          </button>
        </div>
      ) : (
        <table className="nm2" aria-labelledby="email-me-about" aria-busy={!prefs}>
          <thead>
            <tr>
              <th>Update</th>
              <th>In Vero</th>
              <th>By email</th>
            </tr>
          </thead>
          <tbody className="rows-in">
            {UPDATE_KINDS.map((kind, index) => {
              const on = prefs?.email[kind.key] ?? false;
              return (
                <tr key={kind.key} style={{ '--r': index } as CSSProperties}>
                  <td>
                    <b>{kind.title}</b>
                    <small>{kind.note}</small>
                  </td>
                  <td>
                    <span className="stx" style={{ color: 'var(--good)' }}>
                      On
                    </span>
                  </td>
                  <td>
                    <button
                      className="switch"
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={`Email me about ${kind.title.toLowerCase()}`}
                      disabled={!prefs || saving !== null}
                      data-testid={`email-pref-${kind.key}`}
                      onClick={() => void choose(kind.key, !on)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className={`foot4${status?.tone === 'bad' ? ' bad' : ''}`} role="status" data-testid="settings-notifications">
        {saving ? 'Saving' : status ? status.text : !prefs && !resource.error ? 'Getting your choices' : 'Switch one on and it is emailed to you as well as shown in What’s new. Changes save as you make them.'}
      </p>
      <p className="foot4 plain">
        Everything also comes to{' '}
        <TLink className="link" href="/notifications">
          What&apos;s new
        </TLink>
        , for owners and admins. Sign-in links and invitations are always emailed.
      </p>
    </Reveal>
  );
}

function Display() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  useEffect(() => {
    // The switch in the side menu changes the same attribute, so this follows it.
    const read = () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  const pick = (next: 'light' | 'dark') => {
    if (next === theme) return;
    softly(() => document.documentElement.setAttribute('data-theme', next));
    setTheme(next);
    try {
      window.localStorage.setItem('vero-theme', next);
    } catch {
      // A private window can refuse. The choice still lasts for this page.
    }
    window.dispatchEvent(new Event('vero:theme'));
  };
  return (
    <Reveal as="section" className="mod" id="display">
      <div className="mh">
        <h2 id="theme-label">Display</h2>
        <span className="sub2">Light or dark, on this device</span>
      </div>
      <div className="themepick2" role="group" aria-labelledby="theme-label">
        {(['light', 'dark'] as const).map((choice) => (
          <button key={choice} className={`opt2${theme === choice ? ' on' : ''}`} type="button" data-theme-choice={choice} aria-pressed={theme === choice} onClick={() => pick(choice)}>
            <span className={`sw3 ${choice}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="lb2">
              <Icon name={choice === 'light' ? 'sun' : 'moon'} />
              {choice === 'light' ? 'Light' : 'Dark'}
              {theme === choice ? (
                <span className="onw">
                  <Icon name="check" />
                  In use
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </Reveal>
  );
}

function Profile() {
  const session = useSession();
  const toast = useToast();
  const { user } = session.me;
  const [name, setName] = useState(user.name ?? '');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const changed = name.trim() !== (user.name ?? '') && name.trim().length > 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api.me.update({ body: { name: name.trim() } });
      await session.refresh();
      toast('Saved.');
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  return (
    <form className="bd" data-testid="profile" onSubmit={(event) => void submit(event)}>
      <div className="grid2">
        <div className="field">
          <label htmlFor="profile-name">Your name</label>
          <input className="input" id="profile-name" type="text" autoComplete="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
          <small>How your team sees you</small>
        </div>
        <div className="field">
          <label htmlFor="profile-email">Email</label>
          <input className="input" id="profile-email" type="email" value={user.email} readOnly />
          <small>You sign in with this. It can&apos;t be changed here yet.</small>
        </div>
      </div>
      <FormProblem message={problem} />
      <div className="sv">
        <button className="btn btn-g" type="button" disabled={busy || !changed} onClick={() => setName(user.name ?? '')}>
          Cancel
        </button>
        <button className="btn btn-p" type="submit" disabled={busy || !changed}>
          Save your name
        </button>
      </div>
    </form>
  );
}

function TwoStep() {
  const session = useSession();
  const toast = useToast();
  const enabled = session.me.user.mfaEnabled;
  const [setup, setSetup] = useState<TotpEnrolResponse | null>(null);
  const [turningOff, setTurningOff] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyKey = async (secret: string) => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      toast("We couldn't copy it. Select the key and copy it yourself.");
    }
  };

  const start = async () => {
    setBusy(true);
    setProblem(null);
    try {
      setSetup(await api.auth.totpEnrol());
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const finish = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      if (enabled) await api.auth.totpDisable({ body: { code } });
      else await api.auth.totpVerify({ body: { code } });
      await session.refresh();
      toast(enabled ? 'Two-step sign-in is off.' : 'Two-step sign-in is on.');
      setSetup(null);
      setTurningOff(false);
      setCode('');
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const codeForm = (label: string, submitLabel: string, onCancel: () => void) => (
    <form className="codeform" onSubmit={(event) => void finish(event)}>
      <div className="field">
        <label htmlFor="totp-code">{label}</label>
        <input
          className="input codebox"
          id="totp-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="000000"
          aria-describedby={problem ? 'totp-problem' : undefined}
          aria-invalid={problem ? true : undefined}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !busy) onCancel();
          }}
        />
        {problem ? (
          <p className="formerror" id="totp-problem" role="alert">
            {problem}
          </p>
        ) : null}
      </div>
      <div className="invbtns">
        <button className="btn btn-p" type="submit" disabled={busy || code.length !== 6}>
          {busy ? 'Checking the code' : submitLabel}
        </button>
        <button className="btn btn-g" type="button" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div data-testid="two-step">
      <div className="rw">
        <div>
          <b>Two-step sign-in</b>
          <small>A code from an authenticator app, as well as your email link</small>
        </div>
        <div className="r">
          <span className="stx" style={{ color: enabled ? 'var(--good)' : 'var(--warn)' }} data-testid="two-step-state">
            {enabled ? 'On' : 'Off'}
          </span>
          {!setup && !turningOff ? (
            enabled ? (
              <button className="btn btn-g" type="button" onClick={() => setTurningOff(true)}>
                Turn off two-step sign-in
              </button>
            ) : (
              <button className="btn btn-g" type="button" disabled={busy} onClick={() => void start()}>
                {busy ? 'Getting a key' : 'Set up two-step sign-in'}
              </button>
            )
          ) : null}
        </div>
      </div>
      {setup ? (
        <div className="panel2" data-testid="two-step-setup">
          <p>
            <b>1.</b> Add this key to your authenticator app. Two-step sign-in isn&apos;t on until you enter a code from the app.
          </p>
          <div className="keyrow">
            <p className="totpkey num" data-testid="two-step-secret">
              {setup.secret}
            </p>
            <button className={`btn btn-g btn-sm cp${copied ? ' ok' : ''}`} type="button" onClick={() => void copyKey(setup.secret)}>
              <Icon name={copied ? 'check' : 'copy'} />
              {copied ? 'Copied' : 'Copy key'}
            </button>
          </div>
          <p>
            <a className="link" href={setup.otpauthUri}>
              Open it in an authenticator app on this device
            </a>
          </p>
          <p>
            <b>2.</b> Enter the code the app shows.
          </p>
          {codeForm('The 6-digit code from your app', 'Turn it on', () => {
            setSetup(null);
            setCode('');
            setProblem(null);
          })}
        </div>
      ) : null}
      {turningOff ? (
        <div className="panel2" data-testid="two-step-off">
          <p>Turning this off means your email link alone signs you in. Enter a code from your app to confirm it&apos;s you.</p>
          {codeForm('The 6-digit code from your app', 'Turn it off', () => {
            setTurningOff(false);
            setCode('');
            setProblem(null);
          })}
        </div>
      ) : null}
      {!setup && !turningOff ? <FormProblem message={problem} /> : null}
    </div>
  );
}

function DeleteAccount() {
  const session = useSession();
  const { user } = session.me;
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const matches = email.trim().toLowerCase() === user.email.toLowerCase();
  const ready = matches && (!user.mfaEnabled || code.length === 6);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setProblem(null);
    try {
      await api.me.deleteAccount({
        body: {
          confirmEmail: email.trim(),
          ...(user.mfaEnabled ? { totpCode: code } : {}),
        },
      });
      window.location.assign('/sign-in');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <details className="del" data-testid="delete-account">
      <summary className="rw">
        <div>
          <b className="red">Delete your account</b>
          <small>For good. This can&apos;t be undone.</small>
        </div>
        <div className="r">
          <Icon name="chevd" />
        </div>
      </summary>
      <div className="panel2">
        <p>
          This deletes your account for good, and you can&apos;t undo it. On any team where you&apos;re the only person, it also deletes that team&apos;s companies, documents, scores and share links. On a team with other people, you just
          leave, and they keep everything. If you&apos;re the only owner of a team with other people, make someone else an owner first.
        </p>
        <form className="codeform" onSubmit={(event) => void submit(event)}>
          <div className="field">
            <label htmlFor="delete-email">Type your email to confirm: {user.email}</label>
            <input className="input" id="delete-email" type="email" autoComplete="off" spellCheck={false} value={email} onChange={(event) => setEmail(event.target.value)} />
            {email.trim().length > 0 && !matches ? <small>That doesn&apos;t match your email yet.</small> : null}
          </div>
          {user.mfaEnabled ? (
            <div className="field">
              <label htmlFor="delete-code">The 6-digit code from your app</label>
              <input className="input codebox" id="delete-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
            </div>
          ) : null}
          <FormProblem message={problem} />
          <div className="invbtns">
            <button className="btn btn-g danger" type="submit" disabled={busy || !ready} data-testid="delete-confirm">
              {busy ? 'Deleting' : 'Yes, delete my account for good'}
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}

function Organisations() {
  const { me } = useSession();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  if (me.organisations.length < 2) return null;
  const change = async (organisationId: string) => {
    setBusy(true);
    setProblem(null);
    try {
      await api.organisations.switch({ body: { organisationId } });
      window.location.assign('/');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };
  return (
    <Reveal as="section" className="mod" id="workspaces" data-testid="organisations">
      <div className="mh">
        <h2>Your workspaces</h2>
        <span className="sub2">Switch to another team you belong to</span>
      </div>
      <div className="rws">
        {me.organisations.map((org) => (
          <div className="rw" key={org.id} data-testid="organisation-row">
            <div>
              <b>{org.name}</b>
              <small>{ROLE_WORDS[org.role]}</small>
            </div>
            <div className="r">
              {org.id === me.activeOrganisationId ? (
                <span className="stx" style={{ color: 'var(--good)' }}>
                  You&apos;re here
                </span>
              ) : (
                <button className="btn btn-g" type="button" disabled={busy} onClick={() => void change(org.id)}>
                  Switch
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bd" style={{ paddingTop: 0 }}>
        <FormProblem message={problem} />
      </div>
    </Reveal>
  );
}

const SESSIONS_SHOWN = 5;

function SessionRow({ session, onChanged, onSignOut, leaving, disabled }: { session: SessionInfo; onChanged: () => void; onSignOut: () => void; leaving: boolean; disabled: boolean }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const end = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.me.revokeSession({ params: { sessionId: session.id } });
      toast('Signed out on that device.');
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };
  return (
    <div className="rw sess" data-testid={session.current ? 'session-current' : 'session-other'}>
      <div>
        <b>
          {session.device ?? 'A device we can’t name'}
          {session.current ? <span className="stx here">This device</span> : null}
        </b>
        <small>
          Signed in {longDate(session.createdAt)}. Last used {sinceWords(session.lastUsedAt)}.
        </small>
        {problem ? <FormProblem message={problem} /> : null}
      </div>
      <div className="r">
        {session.current ? (
          <button className="btn btn-g" type="button" disabled={leaving || disabled} onClick={onSignOut}>
            <Icon name="out" />
            {leaving ? 'Signing out' : 'Sign out'}
          </button>
        ) : (
          <Confirm
            label="Sign out"
            question="Sign out on that device?"
            yes="Yes, sign out"
            no="Keep it"
            busyWord="Signing out"
            busy={busy}
            onYes={() => void end()}
            triggerClass="btn btn-g"
            yesClass="btn btn-g danger"
            noClass="btn btn-g"
            testId="session-sign-out"
            yesTestId="session-sign-out-yes"
          />
        )}
      </div>
    </div>
  );
}

function Security() {
  const session = useSession();
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const sessions = useResource(() => api.me.sessions(), []);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const signOut = () => {
    setLeaving(true);
    setProblem(null);
    session.signOut().catch(() => {
      setProblem("We couldn't sign you out. Check your connection and try again.");
      setLeaving(false);
    });
  };
  const everywhere = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.auth.logoutEverywhere();
      window.location.assign('/sign-in');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };
  return (
    <Reveal as="section" className="mod" id="account">
      <div className="mh">
        <h2>Security</h2>
        <span className="sub2">How you sign in, and signing out</span>
      </div>
      <div className="sub3">Sign-in methods</div>
      <div className="rws">
        <div className="rw">
          <div>
            <b>Email link</b>
            <small>A one-time link sent to {session.me.user.email}. No password to remember.</small>
          </div>
          <div className="r">
            <span className="stx" style={{ color: 'var(--good)' }}>
              On
            </span>
          </div>
        </div>
        <TwoStep />
      </div>
      <div className="sub3 ruled" id="signed-in">
        Where you&apos;re signed in
      </div>
      <div className="rws" role="group" aria-labelledby="signed-in" data-testid="sessions">
        {sessions.error && !sessions.data ? (
          <div className="rw">
            <div>
              <b>We couldn&apos;t load your sessions</b>
              <small>{sessions.error.message}</small>
            </div>
            <div className="r">
              <button className="btn btn-g" type="button" onClick={sessions.reload}>
                Try again
              </button>
            </div>
          </div>
        ) : !sessions.data ? (
          <div className="rw" role="status">
            <div>
              <small>Getting your sessions</small>
            </div>
          </div>
        ) : (
          (showAllSessions ? sessions.data.sessions : sessions.data.sessions.slice(0, SESSIONS_SHOWN)).map((item) => <SessionRow key={item.id} session={item} onChanged={sessions.reload} onSignOut={signOut} leaving={leaving} disabled={busy} />)
        )}
        {sessions.data && sessions.data.sessions.length > SESSIONS_SHOWN ? (
          <button className="link more-sessions" type="button" aria-expanded={showAllSessions} onClick={() => setShowAllSessions((value) => !value)} data-testid="sessions-more">
            {showAllSessions ? 'Show fewer' : `Show ${sessions.data.sessions.length - SESSIONS_SHOWN} more`}
          </button>
        ) : null}
        {sessions.data ? (
          <p className="foot5">
            A device is named from the browser it signed in with, never by address or place. &ldquo;Last used&rdquo; updates about once an hour, and a session that isn&apos;t used for a while ends by itself.
          </p>
        ) : null}
        <div className="rw">
          <div>
            <b>Sign out everywhere</b>
            <small>Ends every session on every device, this one too.</small>
          </div>
          <div className="r">
            <Confirm
              label="Sign out everywhere"
              question="Sign out on every device, this one too?"
              yes="Yes, sign out everywhere"
              no="Stay signed in"
              busyWord="Signing out"
              busy={busy}
              onYes={() => void everywhere()}
              triggerClass="btn btn-g"
              yesClass="btn btn-g danger"
              noClass="btn btn-g"
              testId="sign-out-everywhere"
              yesTestId="sign-out-everywhere-yes"
            />
          </div>
        </div>
        <DeleteAccount />
      </div>
      <div className="bd" style={{ paddingTop: 0 }}>
        <FormProblem message={problem} />
      </div>
    </Reveal>
  );
}

const SECTIONS = [
  { href: '#profile', label: 'Profile' },
  { href: '#companies', label: 'Companies' },
  { href: '#team', label: 'Team members' },
  { href: '#notifications', label: 'Notifications' },
  { href: '#display', label: 'Display' },
  { href: '#account', label: 'Security' },
];
const SECTION_IDS = SECTIONS.map((section) => section.href.slice(1));

/** Marks the section on screen in the side list, as the board does. */
function useCurrentSection(ids: string[]): string {
  const [current, setCurrent] = useState(ids[0] ?? '');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (seen) setCurrent(seen.target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);
  return current;
}

export default function SettingsPage() {
  const session = useSession();
  const watchlist = useWatchlist();
  const { me } = session;
  const current = useCurrentSection(SECTION_IDS);
  const org = me.organisations.find((item) => item.id === me.activeOrganisationId);
  const plan = session.overview?.plan;
  const followLimit = entitlementsOf(plan).followLimit;
  const name = me.user.name ?? me.user.email;
  const own = session.companies.filter((company) => company.relationship !== 'follow').length;

  return (
    <div className="pg-settings" data-testid="settings">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Account" /> ·{' '}
              <b>
                <Scramble text="Profile, team, alerts" delay={120} />
              </b>
            </div>
            <h1 className="disp">
              <Words text="Settings" />
            </h1>
            <div className="meta">
              <span>Your account and the {org?.name ?? 'current'} workspace</span>
            </div>
          </div>
        </div>
        <section className="r1">
          <div className="mod gl acct">
            <div className="who">
              <span className="av2" aria-hidden="true">
                {initialsOf(name)}
              </span>
              <div>
                <b>{name}</b>
                <small>{me.user.email}</small>
              </div>
            </div>
            <div className="facts">
              <div>
                <span>Workspace</span>
                <b>{org?.name ?? 'None yet'}</b>
              </div>
              <div>
                <span>Your role</span>
                <b>{org ? ROLE_WORDS[org.role] : 'None'}</b>
              </div>
              <div>
                <span>Companies</span>
                <b>{own}</b>
              </div>
              <div>
                <span>Sign-in</span>
                <b>{me.user.mfaEnabled ? 'Email link and a code' : 'Email link'}</b>
              </div>
            </div>
          </div>
          <div className="mod next">
            <div className="k">Your plan</div>
            <h3>{plan ? planNameOf(plan) : 'Free'}</h3>
            <div className="push">
              <div className="row2">
                <span>Member since</span>
                <b>{longDate(me.user.createdAt)}</b>
              </div>
              <div className="row2">
                <span>Followed companies</span>
                <b>
                  {watchlist?.used ?? watchlist?.companies.length ?? 0} of {followLimit}
                </b>
              </div>
            </div>
            <TLink className="btn" href="/plan" data-testid="settings-plan">
              Plan and billing
            </TLink>
          </div>
        </section>
      </Hero>

      <After>
        <div className="sg">
          <nav className="mod snav" aria-label="Settings sections">
            {SECTIONS.map((section) => (
              <a key={section.href} href={section.href} className={current === section.href.slice(1) ? 'on' : undefined}>
                {section.label}
              </a>
            ))}
            <hr />
            <TLink href="/plan">Plan and billing</TLink>
          </nav>
          <div className="secs">
            <Reveal as="section" className="mod" id="profile">
              <div className="mh">
                <h2>Profile</h2>
                <span className="sub2">How you appear to your team</span>
              </div>
              <Profile />
            </Reveal>
            <Organisations />
            <Companies />
            <Team />
            <Notifications />
            <Display />
            <Security />
          </div>
        </div>
      </After>
    </div>
  );
}
