import { randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../src/config';
import type { Database } from '../src/db';
import {
  BullMQQueue,
  DevOutboxMailer,
  InProcessQueue,
  LocalEncryptedFileStore,
  MAX_SIGNED_URL_SECONDS,
  ResendMailer,
  S3FileStore,
  createFileStore,
  createJobQueue,
  createMailer,
} from '../src/infra';
import { Secrets, hashToken, randomToken } from '../src/lib/crypto';
import { errorOf, startHarness, testEnv, uniqueEmail, type Harness } from './support/harness';

const secretsFor = () => new Secrets(randomBytes(32).toString('base64'));
const message = (to: string) => ({ to, subject: 'Subject', text: 'Body with https://x/?token=abc', template: 't', link: 'https://x/?token=abc' });

describe('crypto', () => {
  it('tokens are long, random and URL-safe', () => {
    const token = randomToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomToken()).not.toBe(token);
    expect(hashToken(token)).toHaveLength(64);
  });

  it('round-trips, and a tampered, mis-keyed or mis-purposed ciphertext fails', () => {
    const secrets = secretsFor();
    const sealed = secrets.encryptString('totp', 'hello');
    expect(secrets.decryptString('totp', sealed)).toBe('hello');
    expect(sealed).not.toContain('hello');
    expect(secrets.encryptString('totp', 'hello')).not.toBe(sealed);

    const tampered = Buffer.from(sealed, 'base64');
    tampered[tampered.length - 1] = (tampered[tampered.length - 1] as number) ^ 1;
    expect(() => secrets.decryptString('totp', tampered.toString('base64'))).toThrow();
    expect(() => secretsFor().decryptString('totp', sealed)).toThrow();
    expect(() => secrets.decryptString('file', sealed)).toThrow();
  });

  it('refuses a key of the wrong size', () => {
    expect(() => new Secrets(Buffer.alloc(16).toString('base64'))).toThrow();
  });
});

describe('config', () => {
  const production = () =>
    testEnv({
      NODE_ENV: 'production',
      API_BASE_URL: 'https://api.vero.test',
      DATABASE_URL: 'postgres://vero_app:real@db.vero.test/vero',
      RESEND_API_KEY: 're_test',
      VALKEY_URL: 'redis://valkey.vero.test:6379',
      SPACES_ENDPOINT: 'https://x.test',
      SPACES_REGION: 'lon1',
      SPACES_BUCKET: 'b',
      SPACES_KEY: 'k',
      SPACES_SECRET: 's',
    });

  it('accepts a complete production setup', () => {
    expect(loadConfig(production()).nodeEnv).toBe('production');
  });

  it.each([
    ['no email key', { RESEND_API_KEY: '' }, /RESEND_API_KEY/],
    ['no queue', { VALKEY_URL: '' }, /VALKEY_URL/],
    ['insecure cookies', { COOKIE_SECURE: 'false' }, /COOKIE_SECURE/],
    ['fixture connectors', { CONNECTOR_MODE: 'fixture' }, /fixture/],
    ['recording provider responses', { CONNECTOR_RECORD_DIR: '/tmp/recordings' }, /CONNECTOR_RECORD_DIR/],
    ['dev database password', { DATABASE_URL: 'postgres://vero_app:dev-only-app-password@db/vero' }, /development password/],
    ['dev encryption key', { APP_ENCRYPTION_KEY: Buffer.from('dev-only-key-not-for-production!').toString('base64') }, /development key/],
    ['plain http origin', { ALLOWED_ORIGINS: 'http://app.vero.test' }, /https/],
  ])('refuses to start in production with %s', (_label, change, pattern) => {
    expect(() => loadConfig({ ...production(), ...change })).toThrow(pattern);
  });

  it('reuses a paid vendor answer for 30 days unless told otherwise', () => {
    expect(loadConfig(testEnv({})).vendorCacheDays).toBe(30);
    expect(loadConfig(testEnv({ VENDOR_CACHE_DAYS: '7' })).vendorCacheDays).toBe(7);
    expect(() => loadConfig(testEnv({ VENDOR_CACHE_DAYS: '0' }))).toThrow(/VENDOR_CACHE_DAYS/);
  });

  it('refuses half-configured file storage', () => {
    expect(() => loadConfig(testEnv({ SPACES_ENDPOINT: 'https://x.test' }))).toThrow(/SPACES/);
  });

  it('refuses a bad encryption key, without printing it', () => {
    expect(() => loadConfig(testEnv({ APP_ENCRYPTION_KEY: 'c2hvcnQ=' }))).toThrow(/APP_ENCRYPTION_KEY/);
    expect(() => loadConfig(testEnv({ APP_ENCRYPTION_KEY: 'c2hvcnQ=' }))).not.toThrow(/c2hvcnQ/);
  });

  it('the .env.example file is a valid development configuration', () => {
    const text = readFileSync(join(import.meta.dirname, '..', '..', '..', '.env.example'), 'utf8');
    const env: NodeJS.ProcessEnv = {};
    for (const line of text.split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
      if (match?.[1]) env[match[1]] = match[2];
    }
    const config = loadConfig(env);
    expect(config.nodeEnv).toBe('development');
    expect(config.resendApiKey).toBeUndefined();
    // No Google sign-in settings. The Google Drive connection's own settings (GOOGLE_DRIVE_*, GOOGLE_PICKER_*, GOOGLE_CLOUD_*) are allowed.
    expect(text).not.toMatch(/GOOGLE_(CLIENT|OAUTH|SIGN|SSO|LOGIN)/);
  });
});

describe('Mailer', () => {
  let db: Database;
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
    db = h.deps.db;
  });
  afterAll(() => h.close());

  const outbox = async (email: string) =>
    (await h.admin.query<Record<string, unknown>>('SELECT * FROM outbox WHERE to_email = $1', [email])).rows;

  it('the dev mailer writes to the outbox and prints the link only when asked', async () => {
    const email = uniqueEmail();
    const lines: string[] = [];
    await new DevOutboxMailer(db, (line) => lines.push(line)).send(message(email));
    const rows = await outbox(email);
    expect(rows[0]).toMatchObject({ status: 'captured', provider: 'dev-outbox', subject: 'Subject' });
    expect(rows[0]?.body_text).toContain('token=abc');
    expect(lines[0]).toContain('https://x/?token=abc');
  });

  it('createMailer only passes the link printer through in development', async () => {
    const email = uniqueEmail();
    const printer = vi.fn();
    const testConfig = loadConfig(testEnv());
    await createMailer(testConfig, db, printer).send(message(email));
    expect(printer).not.toHaveBeenCalled();
    await createMailer({ ...testConfig, nodeEnv: 'development' }, db, printer).send(message(email));
    expect(printer).toHaveBeenCalledTimes(1);
  });

  it('createMailer switches to Resend when the key is set', () => {
    const config = loadConfig(testEnv({ RESEND_API_KEY: 're_test' }));
    expect(createMailer(config, db)).toBeInstanceOf(ResendMailer);
    expect(createMailer(loadConfig(testEnv()), db)).toBeInstanceOf(DevOutboxMailer);
  });

  it('Resend: sends the right request, and keeps a record without the body', async () => {
    const email = uniqueEmail();
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(new Response(JSON.stringify({ id: 'msg_1' }), { status: 200 })));
    await new ResendMailer(db, 're_key', 'Vero <a@b.test>', fetchFn).send(message(email));

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer re_key');
    expect(JSON.parse(init.body as string)).toEqual({ from: 'Vero <a@b.test>', to: [email], subject: 'Subject', text: message(email).text });

    const rows = await outbox(email);
    expect(rows[0]).toMatchObject({ status: 'sent', provider: 'resend', provider_id: 'msg_1', body_text: null });
  });

  it('Resend: a refusal raises an error without the content, and is recorded', async () => {
    const email = uniqueEmail();
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(new Response('echo token=abc', { status: 422 })));
    const error = await new ResendMailer(db, 'k', 'f', fetchFn).send(message(email)).catch((reason: Error) => reason);
    expect((error as Error).message).toContain('422');
    expect((error as Error).message).not.toContain('token');
    expect((await outbox(email))[0]).toMatchObject({ status: 'failed', body_text: null });
  });

  it('Resend: a network failure is recorded too', async () => {
    const email = uniqueEmail();
    const fetchFn = vi.fn<typeof fetch>(() => Promise.reject(new Error('down')));
    await expect(new ResendMailer(db, 'k', 'f', fetchFn).send(message(email))).rejects.toThrow(/reach/);
    expect((await outbox(email))[0]).toMatchObject({ status: 'failed' });
  });

  it('a mail failure during sign-in gives a plain error, with nothing leaked', async () => {
    const failing = await startHarness({}, { mailer: () => ({ send: () => Promise.reject(new Error('token=leak')) }) });
    try {
      const response = await failing.request('POST', '/v1/auth/magic-link/request', { body: { email: uniqueEmail() } });
      expect(response.statusCode).toBe(500);
      expect(errorOf(response).code).toBe('internal_error');
      expect(response.body).not.toContain('leak');
    } finally {
      await failing.close();
    }
  });
});

describe('JobQueue', () => {
  it('runs a job with its payload', async () => {
    const queue = new InProcessQueue();
    const seen: unknown[] = [];
    queue.register('scan.run', (payload) => {
      seen.push(payload);
      return Promise.resolve();
    });
    const { id } = await queue.enqueue('scan.run', { organisationId: 'o', scanId: 's' });
    await queue.drain();
    expect(id).toBeTruthy();
    expect(seen).toEqual([{ organisationId: 'o', scanId: 's' }]);
  });

  it('holds jobs until a worker registers', async () => {
    const queue = new InProcessQueue();
    const seen: string[] = [];
    await queue.enqueue('document.process', { organisationId: 'o', documentId: 'd' });
    await queue.drain();
    expect(seen).toEqual([]);
    queue.register('document.process', (payload) => {
      seen.push(payload.documentId);
      return Promise.resolve();
    });
    await queue.drain();
    expect(seen).toEqual(['d']);
  });

  it('retries, then succeeds', async () => {
    const queue = new InProcessQueue({ attempts: 3, backoffMs: 1 });
    let calls = 0;
    queue.register('scan.run', () => {
      calls += 1;
      return calls < 3 ? Promise.reject(new Error('try again')) : Promise.resolve();
    });
    await queue.enqueue('scan.run', { organisationId: 'o', scanId: 's' });
    await queue.drain();
    expect(calls).toBe(3);
  });

  it('reports a job that keeps failing, by name and id only', async () => {
    const failed = vi.fn();
    const queue = new InProcessQueue({ attempts: 2, backoffMs: 1, onFailed: failed });
    queue.register('scan.run', () => Promise.reject(new Error('always')));
    const { id } = await queue.enqueue('scan.run', { organisationId: 'o', scanId: 's' });
    await queue.drain();
    expect(failed).toHaveBeenCalledWith('scan.run', id);
  });

  it('runs the same job id only once', async () => {
    const queue = new InProcessQueue();
    let calls = 0;
    queue.register('scan.run', () => {
      calls += 1;
      return Promise.resolve();
    });
    await queue.enqueue('scan.run', { organisationId: 'o', scanId: 's' }, { jobId: 'same' });
    await queue.enqueue('scan.run', { organisationId: 'o', scanId: 's' }, { jobId: 'same' });
    await queue.drain();
    expect(calls).toBe(1);
  });

  it('honours a delay, and refuses work after closing', async () => {
    const queue = new InProcessQueue();
    const started = Date.now();
    let ranAt = 0;
    queue.register('scan.run', () => {
      ranAt = Date.now();
      return Promise.resolve();
    });
    await queue.enqueue('scan.run', { organisationId: 'o', scanId: 's' }, { delayMs: 40 });
    await queue.close();
    expect(ranAt - started).toBeGreaterThanOrEqual(35);
    await expect(queue.enqueue('scan.run', { organisationId: 'o', scanId: 's' })).rejects.toThrow(/closed/);
  });

  it('switches to BullMQ when VALKEY_URL is set, without opening a connection', async () => {
    const queue = createJobQueue({ valkeyUrl: 'redis://127.0.0.1:1' });
    expect(queue).toBeInstanceOf(BullMQQueue);
    expect(createJobQueue({})).toBeInstanceOf(InProcessQueue);
    await queue.close();
  });
});

describe('FileStore: local encrypted', () => {
  const root = mkdtempSync(join(tmpdir(), 'vero-store-'));
  const secrets = secretsFor();
  let now = new Date('2026-11-05T12:00:00Z');
  const store = new LocalEncryptedFileStore(root, secrets, 'https://api.vero.test', () => now);
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('round-trips, and the file on disk is encrypted', async () => {
    const plain = Buffer.from('PRIVATE SHAREHOLDER AGREEMENT');
    await store.put('org/company/doc.pdf', plain);
    expect(await store.get('org/company/doc.pdf')).toEqual(plain);
    const onDisk = readFileSync(join(root, 'org', 'company', 'doc.pdf'));
    expect(onDisk.toString('latin1')).not.toContain('SHAREHOLDER');
  });

  it('returns null for a missing file, and deleting twice is fine', async () => {
    expect(await store.get('org/none.pdf')).toBeNull();
    await store.put('org/gone.pdf', Buffer.from('x'));
    await store.delete('org/gone.pdf');
    await store.delete('org/gone.pdf');
    expect(await store.get('org/gone.pdf')).toBeNull();
  });

  it('a file changed on disk fails rather than returning bad data', async () => {
    const other = new LocalEncryptedFileStore(root, secretsFor(), 'https://api.vero.test');
    await store.put('org/keyed.pdf', Buffer.from('x'));
    await expect(other.get('org/keyed.pdf')).rejects.toThrow();
  });

  it.each(['../escape', 'a/../../b', '/etc/passwd', 'a\\b', 'C:\\x', '', '.hidden', 'a//b', `x${'y'.repeat(600)}`])(
    'refuses the key %j',
    async (key) => {
      await expect(store.put(key, Buffer.from('x'))).rejects.toThrow(/key/);
      await expect(store.get(key)).rejects.toThrow(/key/);
      await expect(store.delete(key)).rejects.toThrow(/key/);
    },
  );

  it('signed links expire, and cannot be altered', async () => {
    const url = new URL(await store.signedDownloadUrl('org/a.pdf', 60));
    const key = url.searchParams.get('key') as string;
    const exp = Number(url.searchParams.get('exp'));
    const sig = url.searchParams.get('sig') as string;

    expect(store.verifySignedUrl(key, exp, sig)).toBe(true);
    expect(store.verifySignedUrl('org/b.pdf', exp, sig)).toBe(false);
    expect(store.verifySignedUrl(key, exp + 1000, sig)).toBe(false);
    // Always a different last character: replacing it with a fixed one changes nothing when they match.
    const altered = `${sig.slice(0, -1)}${sig.endsWith('0') ? '1' : '0'}`;
    expect(store.verifySignedUrl(key, exp, altered)).toBe(false);

    now = new Date(now.getTime() + 61_000);
    expect(store.verifySignedUrl(key, exp, sig)).toBe(false);
  });

  it('never signs for longer than the maximum', async () => {
    const fixed = now.getTime();
    const url = new URL(await store.signedDownloadUrl('org/a.pdf', 999_999));
    expect(Number(url.searchParams.get('exp'))).toBe(Math.floor(fixed / 1000) + MAX_SIGNED_URL_SECONDS);
    await expect(store.signedDownloadUrl('org/a.pdf', 0)).rejects.toThrow();
  });
});

describe('local file route', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('serves a file for a valid link, as a download', async () => {
    await h.deps.files.put('org/route.pdf', Buffer.from('file body'));
    const url = new URL(await h.deps.files.signedDownloadUrl('org/route.pdf', 60));
    const response = await h.request('GET', url.pathname + url.search);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('file body');
    expect(response.headers['content-disposition']).toBe('attachment');
    expect(response.headers['content-type']).toBe('application/octet-stream');
  });

  it('refuses a forged link and a missing signature', async () => {
    const url = new URL(await h.deps.files.signedDownloadUrl('org/route.pdf', 60));
    url.searchParams.set('sig', 'f'.repeat(64));
    expect((await h.request('GET', url.pathname + url.search)).statusCode).toBe(403);
    expect((await h.request('GET', '/v1/files/local?key=org/route.pdf')).statusCode).toBe(403);
  });

  it('refuses an expired link', async () => {
    await h.deps.files.put('org/old.pdf', Buffer.from('x'));
    const url = new URL(await h.deps.files.signedDownloadUrl('org/old.pdf', 60));
    h.setNow(new Date(Date.now() + 120_000));
    try {
      expect((await h.request('GET', url.pathname + url.search)).statusCode).toBe(403);
    } finally {
      h.setNow(null);
    }
  });

  it('a 404 for a validly signed link to a missing file', async () => {
    const url = new URL(await h.deps.files.signedDownloadUrl('org/nothing.pdf', 60));
    expect((await h.request('GET', url.pathname + url.search)).statusCode).toBe(404);
  });
});

describe('FileStore: S3 adapter, against a local stand-in server', () => {
  // Not real Spaces: this proves the requests we send, not DigitalOcean's behaviour.
  let server: Server;
  let store: S3FileStore;
  const objects = new Map<string, Buffer>();
  const requests: { method: string; url: string; auth: string }[] = [];

  beforeAll(async () => {
    server = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        const path = (req.url ?? '').split('?')[0] as string;
        requests.push({ method: req.method ?? '', url: path, auth: req.headers.authorization ?? '' });
        if (req.method === 'PUT') {
          objects.set(path, Buffer.concat(chunks));
          res.writeHead(200, { etag: '"x"' }).end();
        } else if (req.method === 'GET') {
          const body = objects.get(path);
          if (body) res.writeHead(200).end(body);
          else
            res
              .writeHead(404, { 'content-type': 'application/xml' })
              .end('<?xml version="1.0"?><Error><Code>NoSuchKey</Code><Message>none</Message></Error>');
        } else {
          objects.delete(path);
          res.writeHead(204).end();
        }
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    store = new S3FileStore({
      endpoint: `http://127.0.0.1:${port}`,
      region: 'lon1',
      bucket: 'vero-test',
      accessKeyId: 'AKTEST',
      secretAccessKey: 'SECRETTEST',
      forcePathStyle: true,
    });
  });
  afterAll(() => new Promise((resolve) => server.close(resolve)));

  it('puts, gets and deletes with signed requests', async () => {
    await store.put('org/a.pdf', Buffer.from('s3 body'), { contentType: 'application/pdf' });
    expect(requests.at(-1)).toMatchObject({ method: 'PUT', url: '/vero-test/org/a.pdf' });
    expect(requests.at(-1)?.auth).toContain('AWS4-HMAC-SHA256');
    expect((await store.get('org/a.pdf'))?.toString()).toBe('s3 body');
    await store.delete('org/a.pdf');
    expect(await store.get('org/a.pdf')).toBeNull();
  });

  it('makes short-lived signed links, capped at the maximum', async () => {
    const short = new URL(await store.signedDownloadUrl('org/a.pdf', 120));
    expect(short.searchParams.get('X-Amz-Expires')).toBe('120');
    expect(short.searchParams.get('X-Amz-Signature')).toBeTruthy();
    expect(short.href).not.toContain('SECRETTEST');
    const long = new URL(await store.signedDownloadUrl('org/a.pdf', 999_999));
    expect(long.searchParams.get('X-Amz-Expires')).toBe(String(MAX_SIGNED_URL_SECONDS));
  });

  it('refuses bad keys', async () => {
    await expect(store.put('../x', Buffer.from('x'))).rejects.toThrow(/key/);
  });

  it('createFileStore switches on SPACES settings', () => {
    const secrets = secretsFor();
    const base = { localFileDir: join(tmpdir(), 'vero-unused'), apiBaseUrl: 'https://api.vero.test' };
    expect(createFileStore(base, secrets)).toBeInstanceOf(LocalEncryptedFileStore);
    expect(
      createFileStore(
        { ...base, spaces: { endpoint: 'https://x.test', region: 'r', bucket: 'b', accessKeyId: 'k', secretAccessKey: 's' } },
        secrets,
      ),
    ).toBeInstanceOf(S3FileStore);
  });
});

describe('maintenance', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('the purge job removes dead links, sessions and counters, and leaves live ones', async () => {
    const live = await h.signIn();
    const dead = await h.signIn();
    await h.admin.query(`UPDATE session SET expires_at = now() - interval '2 days' WHERE user_id = $1`, [dead.userId]);
    await h.admin.query(`UPDATE magic_link SET expires_at = now() - interval '2 days' WHERE email = $1`, [dead.email]);

    await h.deps.queue.enqueue('maintenance.purge-expired', {});
    await (h.deps.queue as InProcessQueue).drain();

    expect((await h.admin.query('SELECT 1 FROM session WHERE user_id = $1', [dead.userId])).rows).toHaveLength(0);
    expect((await h.admin.query('SELECT 1 FROM magic_link WHERE email = $1', [dead.email])).rows).toHaveLength(0);
    expect((await h.admin.query('SELECT 1 FROM session WHERE user_id = $1', [live.userId])).rows).toHaveLength(1);
  });
});
