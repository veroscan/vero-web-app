/**
 * A real end-to-end run over HTTP against `npm run dev:api`, with real Postgres in fixture mode.
 * Signs in by the magic link in the outbox, creates a company, answers, scans, reads the results,
 * uploads a document and sees the score change. Leaves no server running.
 *
 *   npm run e2e:http
 */
import { execSync, spawn, type ChildProcess } from 'node:child_process';
import { resolve } from 'node:path';
import pg from 'pg';
import { isClusterRunning } from '../apps/api/src/db/embedded';
import { samplePdf } from '../apps/api/src/seed/sample-pdf';

const ROOT = resolve(import.meta.dirname, '..');
const PORT = 4173;
const ORIGIN = 'http://localhost:3000';
const BASE = `http://127.0.0.1:${PORT}`;

process.loadEnvFile(resolve(ROOT, '.env.example'));
const superuserUrl = `postgres://postgres:${process.env.EMBEDDED_PG_SUPERUSER_PASSWORD}@localhost:${process.env.EMBEDDED_PG_PORT}/vero`;

let passed = 0;
function check(label: string, ok: boolean, detail = ''): void {
  if (!ok) throw new Error(`FAILED: ${label} ${detail}`);
  passed += 1;
  console.log(`  ok  ${label}`);
}

function run(command: string): void {
  execSync(command, { cwd: ROOT, stdio: 'pipe', env: process.env });
}

function stopTree(child: ChildProcess): void {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } catch {
      // Already gone.
    }
  } else {
    process.kill(-child.pid, 'SIGTERM');
  }
}

async function waitFor(what: string, test: () => Promise<boolean>, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await test().catch(() => false)) return;
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error(`Timed out waiting for ${what}`);
}

let cookie = '';

interface Reply<T> {
  status: number;
  body: T;
}

async function call<T>(method: string, path: string, body?: unknown, raw?: Buffer): Promise<Reply<T>> {
  const headers: Record<string, string> = { origin: ORIGIN };
  if (cookie) headers.cookie = cookie;
  if (raw) headers['content-type'] = 'application/octet-stream';
  else if (body !== undefined) headers['content-type'] = 'application/json';
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(raw ? { body: new Uint8Array(raw) } : body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const setCookie = response.headers.getSetCookie().find((value) => value.startsWith('vero_session='));
  if (setCookie) cookie = setCookie.split(';')[0] ?? '';
  const text = await response.text();
  return { status: response.status, body: (text ? JSON.parse(text) : undefined) as T };
}

async function main(): Promise<void> {
  console.log('Starting the local database and applying migrations.');
  // If someone else had it running, it stays running afterwards.
  const databaseWasRunning = await isClusterRunning(resolve(ROOT, '.data', 'pg'));
  run('npm run db:start');
  run('npm run db:migrate');

  console.log(`Starting npm run dev:api on port ${PORT}, in fixture mode.`);
  const server = spawn('npm', ['run', 'dev:api'], {
    cwd: ROOT,
    shell: process.platform === 'win32',
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, CONNECTOR_MODE: 'fixture', API_PORT: String(PORT), API_BASE_URL: BASE, ALLOWED_ORIGINS: ORIGIN, LOG_LEVEL: 'warn' },
  });
  server.stdout?.resume();
  let serverErrors = '';
  server.stderr?.on('data', (chunk: Buffer) => {
    serverErrors += chunk.toString();
  });

  const database = new pg.Client({ connectionString: superuserUrl });
  await database.connect();

  try {
    await waitFor('the API', async () => (await fetch(`${BASE}/healthz`)).ok);
    check('dev:api answers on /healthz', true);

    // Sign in by magic link, reading the token from the outbox.
    const email = `e2e-${Date.now()}@example.test`;
    const requested = await call('POST', '/v1/auth/magic-link/request', { email });
    check('a sign-in link can be requested', requested.status === 202, String(requested.status));
    const outbox = await database.query<{ body_text: string }>('SELECT body_text FROM outbox WHERE to_email = $1 ORDER BY created_at DESC LIMIT 1', [email]);
    const token = /token=([^\s]+)/.exec(outbox.rows[0]?.body_text ?? '')?.[1];
    check('the link is in the outbox', Boolean(token));
    const signedIn = await call<{ user: { id: string }; activeOrganisationId: string }>('POST', '/v1/auth/magic-link/verify', { token: decodeURIComponent(token ?? '') });
    check('the link signs in and sets a cookie', signedIn.status === 200 && cookie.startsWith('vero_session='));
    const organisationId = signedIn.body.activeOrganisationId;

    // Register search, then the company.
    const found = await call<{ outcome: string; sampleData: boolean; candidates: { name: string; registrationNumber: string }[] }>('GET', '/v1/registry/search?country=GB&q=Kestrel%20Pay%20UK%20Ltd');
    check('the register search finds it, and marks it as a sample', found.body.outcome === 'found' && found.body.sampleData);
    const company = await call<{ id: string }>('POST', '/v1/companies', {
      legalName: 'Kestrel Pay UK Ltd',
      incorporationCountry: 'GB',
      registrationNumber: found.body.candidates[0]?.registrationNumber,
      yearEnd: { month: 3, day: 31 },
    });
    check('a company can be created', company.status === 201);
    const companyId = company.body.id;

    // Answers.
    const questionnaire = await call<{ questions: unknown[] }>('GET', `/v1/companies/${companyId}/questionnaire`);
    check('the questionnaire is served', questionnaire.status === 200 && questionnaire.body.questions.length > 5);
    const answered = await call<{ answeredFields: number }>('PATCH', `/v1/companies/${companyId}/questionnaire`, {
      answers: {
        entity_type_gb: 'ltd', user_countries: ['GB', 'NG'], investor_countries: ['none'], has_raised_or_raising: true, raised_priced_round: false,
        has_employees: true, employee_countries: ['GB'], has_contractors: true, contractor_countries: ['GB'], has_foreign_workers: false,
        revenue_band: 'under_1m', headcount_band: '1_10', processes_personal_data: true, data_subjects_gb_12m: 500, sensitive_data: ['none'],
        data_hosted_abroad: true, uses_processors: true, has_website: true, has_app: false, ai_roles: ['deployer'], ai_uses_third_party_models: true,
        staff_use_ai: true, automated_decisions: false, payments_mode: ['psp_only'], sectors: ['none'], customer_type: 'b2b', has_subscriptions: true,
        sells_to_enterprise: true, offers_api: true, user_generated_content: false,
      },
    });
    check('answers are saved', answered.status === 200 && answered.body.answeredFields > 20);

    // Scan, polling the way the scanning screen does.
    const started = await call<{ id: string; status: string; checksTotal: number }>('POST', `/v1/companies/${companyId}/scans`);
    // The UK's five sources, GLEIF (asked for every country), and Nigeria's data protection list,
    // because it has users there, plus the two EU sources asked for every country (ESMA prospectuses,
    // EUIPO trade marks). Not OpenCorporates: the UK's own register is on.
    check('a scan starts, asking the home sources and the market register', started.status === 202 && started.body.checksTotal === 9, String(started.body.checksTotal));
    interface ScanView { status: string; checksDone: number; checksTotal: number; pollAfterMs: number; sources: { sampleData: boolean }[]; rulePackVersions: Record<string, string> }
    let scan: ScanView | undefined;
    await waitFor('the scan to finish', async () => {
      scan = (await call<ScanView>('GET', `/v1/scans/${started.body.id}`)).body;
      return scan.status === 'completed' || scan.status === 'partial';
    });
    check('the scan finishes, with every source answered', scan?.status === 'completed' && scan.checksDone === scan.checksTotal, JSON.stringify(scan?.status));
    check('the scan records its rule pack version', Boolean(scan?.rulePackVersions.GB));

    // Free plan: a range only.
    interface Overview { plan: string; score: { kind: string; value?: number; low?: number; high?: number }; statusWord: string; areas: { score: number | null }[]; sampleData: boolean; nextAction: { title: string } | null }
    const free = await call<Overview>('GET', `/v1/companies/${companyId}/overview`);
    check('Free gets a range, no exact score and no area scores', free.body.score.kind === 'approximate' && free.body.areas.every((area) => area.score === null));
    const freeIssues = await call<{ issues: unknown[]; lockedCount: number }>('GET', `/v1/companies/${companyId}/issues`);
    check('Free gets three gaps and a count of the rest', freeIssues.body.issues.length === 3 && freeIssues.body.lockedCount > 0);
    const refused = await call<{ error: { code: string } }>('POST', `/v1/companies/${companyId}/documents?fileName=a.pdf`, undefined, samplePdf(['x']));
    check('Free cannot upload', refused.status === 403 && refused.body.error.code === 'plan_upgrade_required');

    // A platform admin moves the organisation to Growth, through the real route. The superuser
    // only makes the first admin, as nothing else can.
    const clientCookie = cookie;
    cookie = '';
    const adminEmail = `e2e-admin-${Date.now()}@example.test`;
    await call('POST', '/v1/auth/magic-link/request', { email: adminEmail });
    const adminMail = await database.query<{ body_text: string }>('SELECT body_text FROM outbox WHERE to_email = $1 ORDER BY created_at DESC LIMIT 1', [adminEmail]);
    const adminToken = /token=([^\s]+)/.exec(adminMail.rows[0]?.body_text ?? '')?.[1];
    const adminUser = await call<{ user: { id: string } }>('POST', '/v1/auth/magic-link/verify', { token: decodeURIComponent(adminToken ?? '') });
    await database.query(`INSERT INTO platform_staff (user_id, role) VALUES ($1, 'admin')`, [adminUser.body.user.id]);
    const upgrade = await call('PATCH', `/v1/admin/organisations/${organisationId}/plan`, { plan: 'growth' });
    check('an admin moves the plan', upgrade.status === 200, String(upgrade.status));
    cookie = clientCookie;
    const paid = await call<Overview>('GET', `/v1/companies/${companyId}/overview`);
    check('Growth gets the exact score, six areas and a next action', paid.body.score.kind === 'exact' && paid.body.areas.length === 6 && paid.body.nextAction !== null);
    check('the result is marked as sample data', paid.body.sampleData);
    const before = paid.body.score.value ?? -1;
    console.log(`      score before the document: ${before} (${paid.body.statusWord})`);

    const issues = await call<{ issues: { ruleKey: string; points: number }[] }>('GET', `/v1/companies/${companyId}/issues`);
    const issue = await call<{ headline: string; fix: string; howWeKnow: string[]; points: number }>('GET', `/v1/companies/${companyId}/issues/GB.DP.ICO_FEE`);
    check('one issue reads in plain words, with how we know', issue.status === 200 && issue.body.howWeKnow.some((line) => line.includes('ICO register')), JSON.stringify(issue.body.howWeKnow));
    check('the issue list has calculated points', issues.body.issues.some((item) => item.points > 0));

    // Upload, confirm, re-score.
    const uploaded = await call<{ id: string; status: string }>(
      'POST',
      `/v1/companies/${companyId}/documents?fileName=founder-ip-assignment.pdf`,
      undefined,
      samplePdf(["Founders' IP assignment", 'Signed by Amara Okafor']),
    );
    check('a PDF uploads', uploaded.status === 202, JSON.stringify(uploaded.body));
    interface DocumentView { status: string; suggestion: { slotKey: string } | null; signatureHint: string }
    let doc: DocumentView | undefined;
    await waitFor('the document to be read', async () => {
      doc = (await call<DocumentView>('GET', `/v1/documents/${uploaded.body.id}`)).body;
      return doc.status === 'needs_confirmation';
    });
    check('the real PDF text was read, and a slot suggested', doc?.suggestion?.slotKey === 'gb_founder_ip_assignment' && doc?.signatureHint === 'looks_signed', JSON.stringify(doc));
    const confirmed = await call<{ status: string }>('POST', `/v1/documents/${uploaded.body.id}/confirm`, { slotKey: 'gb_founder_ip_assignment' });
    check('a person confirms and it is filed', confirmed.body.status === 'filed');

    let after = before;
    await waitFor('the re-score', async () => {
      after = (await call<Overview>('GET', `/v1/companies/${companyId}/overview`)).body.score.value ?? before;
      return after !== before;
    });
    check('the document changed the score', after > before, `${before} to ${after}`);
    console.log(`      score after the document: ${after}`);

    const download = await call<{ url: string }>('GET', `/v1/documents/${uploaded.body.id}/download`);
    const file = await fetch(download.body.url);
    check('the signed link downloads the same file, as an attachment', file.ok && (await file.arrayBuffer()).byteLength > 100 && file.headers.get('content-disposition') === 'attachment');

    const records = await call<{ items: { howWeKnow: string }[] }>('GET', `/v1/companies/${companyId}/records`);
    check('records say how we know', records.body.items.some((item) => item.howWeKnow.startsWith('Checked with Companies House')));
    const deadlines = await call<{ deadlines: unknown[] }>('GET', `/v1/deadlines?companyId=${companyId}`);
    check('deadlines are dated', deadlines.body.deadlines.length > 0);
    const feed = await call<{ notifications: { title: string }[] }>('GET', '/v1/notifications');
    check('the feed says the score moved', feed.body.notifications.some((item) => /Your score went up/.test(item.title)));
    const search = await call<{ documents: unknown[] }>('GET', '/v1/search?q=founder-ip');
    check('search finds the document', search.body.documents.length === 1);
    const share = await call<{ token: string }>('POST', `/v1/companies/${companyId}/shares`, {});
    const signedInCookie = cookie;
    cookie = '';
    const shared = await call<{ score: number; companyName: string }>('GET', `/v1/public/reports/${encodeURIComponent(share.body.token)}`);
    cookie = signedInCookie;
    check('the public link works with no sign-in', shared.status === 200 && shared.body.score === after);

    console.log(`\nHTTP end-to-end passed: ${passed} checks.`);
  } finally {
    await database.end();
    stopTree(server);
    if (!databaseWasRunning) run('npm run db:stop');
    if (serverErrors.trim()) console.log(`Server stderr:\n${serverErrors.slice(0, 2000)}`);
  }
}

await main();
