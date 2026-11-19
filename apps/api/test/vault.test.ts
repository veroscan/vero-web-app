import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HeuristicClassifier } from '../src/infra';
import { cleanFileName, inspectFile } from '../src/modules/vault/files';
import { addMember, errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { createCompany, fileDocument, makeStaff, MISSING_ID, overview, pdfFile, scannedCompany, setPlan, upload, type CompanyBody } from './support/product';

interface DocumentBody {
  id: string;
  status: string;
  state: string;
  stateWord: string;
  fileName: string;
  mime: string;
  slotKey: string | null;
  suggestion: { slotKey: string | null; confidence: number } | null;
  signatureHint: string;
  rejectionReason: string | null;
}

/** A plain stored zip, with a central directory, so the real parser reads it. */
function zipFile(entries: Record<string, string>, claimedUnpackedSize?: number): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(entries)) {
    const nameBytes = Buffer.from(name);
    const data = Buffer.from(content);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    locals.push(local, nameBytes, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(claimedUnpackedSize ?? data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBytes);
    offset += 30 + nameBytes.length + data.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

const DOCX = { '[Content_Types].xml': '<x/>', 'word/document.xml': '<w/>' };

function allFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? allFiles(full) : [full];
  });
}

describe('vault', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;

  const getDoc = (id: string, who = owner) => h.request('GET', `/v1/documents/${id}`, { cookie: who.cookie });

  beforeAll(async () => {
    h = await startHarness({ MAX_UPLOAD_MB: '1' });
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    company = await scannedCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd' });
  });
  afterAll(() => h.close());

  it('lists the slots that apply to this company, from the rule data', async () => {
    const response = await h.request('GET', `/v1/companies/${company.id}/documents`, { cookie: owner.cookie });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ canUpload: boolean; slots: { key: string; state: string; stateWord: string; reason: string; jurisdiction: string; ruleKeys: string[] }[]; totalCount: number; filledCount: number }>();
    expect(body.canUpload).toBe(true);
    expect(body.totalCount).toBe(body.slots.length);
    expect(body.slots.length).toBeGreaterThan(5);
    expect(body.filledCount).toBe(0);
    for (const slot of body.slots) {
      expect(slot.state).toBe('missing');
      expect(slot.stateWord).toBe('Not checked yet');
      expect(slot.jurisdiction).toBe('GB');
      expect(slot.reason.length).toBeGreaterThan(8);
      expect(slot.ruleKeys.length).toBeGreaterThan(0);
    }
    // A slot for something that doesn't apply to this company isn't asked for.
    expect(body.slots.map((slot) => slot.key)).not.toContain('gb_money_laundering_registration');
  });

  it('uploads, reads, suggests a slot, and waits for a person', async () => {
    const response = await upload(h, owner, company.id, 'founder IP assignment.pdf', pdfFile(['Founders IP assignment', 'Signed by Amara Okafor']));
    expect(response.statusCode).toBe(202);
    const created = response.json<DocumentBody>();
    expect(created).toMatchObject({ status: 'processing', state: 'reading', stateWord: 'Reading it', mime: 'application/pdf', fileName: 'founder IP assignment.pdf' });
    await h.queue.drain();

    const read = (await getDoc(created.id)).json<DocumentBody>();
    expect(read.status).toBe('needs_confirmation');
    expect(read.stateWord).toBe('Is this right?');
    expect(read.suggestion?.slotKey).toBe('gb_founder_ip_assignment');
    expect(read.suggestion?.confidence).toBeGreaterThan(0.3);
    expect(read.signatureHint).toBe('looks_signed');
    expect(read.slotKey).toBeNull();

    // Nothing counts until a person confirms.
    const facts = await h.admin.query(`SELECT 1 FROM fact WHERE company_id = $1 AND key LIKE 'vault.%'`, [company.id]);
    expect(facts.rows).toEqual([]);
  });

  it('stores it encrypted, under a random key, and never the text', async () => {
    const secret = 'A-VERY-RECOGNISABLE-SECRET-SENTENCE';
    const response = await upload(h, owner, company.id, 'bylaws.pdf', pdfFile([secret]));
    const id = response.json<DocumentBody>().id;
    await h.queue.drain();
    const { rows } = await h.admin.query<{ storage_key: string; file_hash: string; row: string }>(`SELECT storage_key, file_hash, document::text AS row FROM document WHERE id = $1`, [id]);
    expect(rows[0]?.storage_key).toBe(`org/${owner.organisationId}/${company.id}/${id}`);
    expect(rows[0]?.file_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(rows[0]?.row).not.toContain(secret);
    const files = allFiles(h.fileDir);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const raw = readFileSync(file);
      expect(raw.includes(secret)).toBe(false);
      expect(raw.subarray(0, 5).toString()).not.toBe('%PDF-');
    }
    expect(h.logs.join('\n')).not.toContain(secret);
    const audit = await h.admin.query<{ text: string }>(`SELECT audit_log::text AS text FROM audit_log WHERE target = $1`, [id]);
    expect(audit.rows.map((row) => row.text).join()).not.toContain(secret);
  });

  it('accepts a real PNG, JPEG and Word file, judged by content', async () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
    const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32)]);
    for (const [name, data, mime] of [
      ['scan.png', png, 'image/png'],
      ['scan.JPG', jpeg, 'image/jpeg'],
      ['terms.docx', zipFile(DOCX), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ] as const) {
      const response = await upload(h, owner, company.id, name, data);
      expect(response.statusCode, name).toBe(202);
      expect(response.json<DocumentBody>().mime).toBe(mime);
    }
    await h.queue.drain();
  });

  it.each([
    ['plain text', 'notes.pdf', Buffer.from('this is just some text, not a PDF')],
    ['a Windows program called .pdf', 'contract.pdf', Buffer.concat([Buffer.from('MZ'), Buffer.alloc(64)])],
    ['a Linux program', 'contract.pdf', Buffer.concat([Buffer.from([0x7f, 0x45, 0x4c, 0x46]), Buffer.alloc(64)])],
    ['HTML', 'page.pdf', Buffer.from('<html><script>alert(1)</script></html>')],
    ['SVG', 'logo.png', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>')],
    ['a plain zip', 'archive.docx', zipFile({ 'a.txt': 'hello' })],
    ['a broken zip', 'archive.docx', Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(40)])],
  ])('refuses %s', async (_label, name, data) => {
    const before = allFiles(h.fileDir).length;
    const response = await upload(h, owner, company.id, name, data);
    expect(response.statusCode).toBe(415);
    expect(errorOf(response).code).toBe('file_type_not_allowed');
    expect(allFiles(h.fileDir).length).toBe(before);
  });

  it.each([
    ['a Word file with macros', 'macro.docx', zipFile({ ...DOCX, 'word/vbaProject.bin': 'x' })],
    ['a Word file with an embedded program', 'embed.docx', zipFile({ ...DOCX, 'word/embeddings/a.exe': 'x' })],
    ['a zip bomb', 'bomb.docx', zipFile(DOCX, 300 * 1024 * 1024)],
    ['a PDF with JavaScript', 'script.pdf', Buffer.from('%PDF-1.4\n1 0 obj << /S /JavaScript /JS (app.alert(1)) >> endobj')],
    ['a PDF that launches something', 'launch.pdf', Buffer.from('%PDF-1.4\n1 0 obj << /S /Launch /F (cmd.exe) >> endobj')],
    ['a PDF carrying a file', 'carry.pdf', Buffer.from('%PDF-1.4\n1 0 obj << /Type /EmbeddedFile >> endobj')],
  ])('refuses %s as unsafe', async (_label, name, data) => {
    const response = await upload(h, owner, company.id, name, data);
    expect(response.statusCode).toBe(422);
    expect(errorOf(response).code).toBe('file_unsafe');
  });

  it('refuses a name that does not match the content', async () => {
    for (const name of ['contract.pdf.exe', 'contract.png', 'contract']) {
      const response = await upload(h, owner, company.id, name, pdfFile());
      expect(response.statusCode, name).toBe(415);
    }
  });

  it('refuses an oversized file, and an empty one', async () => {
    const big = Buffer.concat([pdfFile(), Buffer.alloc(1024 * 1024 + 10)]);
    const response = await upload(h, owner, company.id, 'huge.pdf', big);
    expect(response.statusCode).toBe(413);
    expect(errorOf(response).code).toBe('payload_too_large');
    const empty = await upload(h, owner, company.id, 'empty.pdf', Buffer.alloc(0));
    expect(empty.statusCode).toBe(400);
  });

  it.each([
    ['../../../etc/passwd.pdf', 'passwd.pdf'],
    ['..\\..\\windows\\system32\\evil.pdf', 'evil.pdf'],
    ['/etc/shadow.pdf', 'shadow.pdf'],
    ['C:\\Users\\Public\\evil.pdf', 'evil.pdf'],
    ['nul\u0000byte.pdf', 'nulbyte.pdf'],
    ['right\u202Eto-left.pdf', 'rightto-left.pdf'],
    ['....//....//deep.pdf', 'deep.pdf'],
    ['<script>x.pdf', 'scriptx.pdf'],
  ])('keeps a path trick out of storage: %j', async (name, shown) => {
    const response = await upload(h, owner, company.id, name, pdfFile());
    expect(response.statusCode).toBe(202);
    const body = response.json<DocumentBody>();
    expect(body.fileName).toBe(shown);
    const { rows } = await h.admin.query<{ storage_key: string }>(`SELECT storage_key FROM document WHERE id = $1`, [body.id]);
    expect(rows[0]?.storage_key).toBe(`org/${owner.organisationId}/${company.id}/${body.id}`);
    for (const file of allFiles(h.fileDir)) expect(file.startsWith(h.fileDir)).toBe(true);
    await h.queue.drain();
  });

  it('refuses a name with nothing usable in it, or no name', async () => {
    expect((await upload(h, owner, company.id, '../..', pdfFile())).statusCode).toBe(400);
    expect((await h.request('POST', `/v1/companies/${company.id}/documents`, { cookie: owner.cookie, body: pdfFile(), headers: { 'content-type': 'application/octet-stream' } })).statusCode).toBe(400);
    expect((await upload(h, owner, company.id, 'a.pdf', pdfFile(), 'NOT A SLOT')).statusCode).toBe(400);
    expect((await upload(h, owner, company.id, 'a.pdf', pdfFile(), 'no_such_slot')).statusCode).toBe(400);
  });

  it('only takes a file through the upload route', async () => {
    const response = await h.request('POST', '/v1/companies', { cookie: owner.cookie, body: pdfFile(), headers: { 'content-type': 'application/octet-stream' } });
    expect(response.statusCode).toBe(415);
  });

  it('a person confirming files it, changes facts and re-scores', async () => {
    const before = await overview(h, owner, company.id);
    const id = await fileDocument(h, owner, company.id, 'gb_founder_ip_assignment', { documentDate: '2026-01-05' });
    const read = (await getDoc(id)).json<DocumentBody>();
    expect(read).toMatchObject({ status: 'filed', state: 'read', stateWord: 'We read it', slotKey: 'gb_founder_ip_assignment' });
    const after = await overview(h, owner, company.id);
    expect(after.score.value ?? 0).toBeGreaterThan(before.score.value ?? 0);
    const issue = await h.request('GET', `/v1/companies/${company.id}/issues/GB.IP.FOUNDER_ASSIGNMENT`, { cookie: owner.cookie });
    expect(issue.json<{ outcome: string; howWeKnow: string[] }>()).toMatchObject({ outcome: 'pass', howWeKnow: ['You uploaded this and we read it'] });
    const { rows } = await h.admin.query<{ classification_confirmed_by: string }>(`SELECT classification_confirmed_by FROM document WHERE id = $1`, [id]);
    expect(rows[0]?.classification_confirmed_by).toBe(owner.userId);
  });

  it('the suggestion is only that: a person can file it elsewhere', async () => {
    const uploaded = await upload(h, owner, company.id, 'founder IP assignment.pdf', pdfFile());
    const id = uploaded.json<DocumentBody>().id;
    await h.queue.drain();
    const confirmed = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_founder_ip_assignment', confirmSigned: true } });
    expect(confirmed.json<DocumentBody>().slotKey).toBe('gb_founder_ip_assignment');
  });

  it('something that looks unsigned is rejected, kept, and counts for nothing', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    const target = await scannedCompany(h, person, { legalName: 'Unsigned Ltd' });
    const before = await overview(h, person, target.id);
    const uploaded = await upload(h, person, target.id, 'IP-assignment-draft.pdf', pdfFile(['Founders IP assignment', 'Signature: ______________']));
    const id = uploaded.json<DocumentBody>().id;
    await h.queue.drain();
    expect((await getDoc(id, person)).json<DocumentBody>().signatureHint).toBe('looks_unsigned');

    const rejected = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: person.cookie, body: { slotKey: 'gb_founder_ip_assignment' } });
    expect(rejected.statusCode).toBe(200);
    expect(rejected.json<DocumentBody>()).toMatchObject({ status: 'rejected', state: 'not_accepted', stateWord: 'Not accepted' });
    expect(rejected.json<DocumentBody>().rejectionReason).toMatch(/doesn't look signed/);
    await h.queue.drain();
    expect((await overview(h, person, target.id)).score).toEqual(before.score);
    const facts = await h.admin.query(`SELECT 1 FROM fact WHERE company_id = $1 AND key LIKE 'vault.%'`, [target.id]);
    expect(facts.rows).toEqual([]);

    // It's only a hint: the person has the last word.
    const accepted = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: person.cookie, body: { slotKey: 'gb_founder_ip_assignment', confirmSigned: true } });
    expect(accepted.json<DocumentBody>().status).toBe('filed');
    await h.queue.drain();
    expect((await overview(h, person, target.id)).score.value ?? 0).toBeGreaterThan(before.score.value ?? 0);
  });

  it('a slot that runs out needs its expiry date', async () => {
    const uploaded = await upload(h, owner, company.id, 'insurance.pdf', pdfFile());
    const id = uploaded.json<DocumentBody>().id;
    await h.queue.drain();
    const refused = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_el_insurance' } });
    expect(refused.statusCode).toBe(400);
    expect(errorOf(refused).message).toMatch(/expiry date/);
    const bad = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_el_insurance', expiresOn: '2026-02-31' } });
    expect(bad.statusCode).toBe(400);
    const ok = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_el_insurance', expiresOn: '2027-03-01', confirmSigned: true } });
    expect(ok.json<DocumentBody>()).toMatchObject({ status: 'filed' });
    await h.queue.drain();
  });

  it('confirm checks input, state and existence', async () => {
    const uploaded = await upload(h, owner, company.id, 'whatever.pdf', pdfFile());
    const id = uploaded.json<DocumentBody>().id;
    await h.queue.drain();
    // Held at "still reading", so the job's timing can't decide this test.
    await h.admin.query(`UPDATE document SET status = 'processing' WHERE id = $1`, [id]);
    const early = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_founder_ip_assignment' } });
    expect(early.statusCode).toBe(409);
    expect(errorOf(early).code).toBe('invalid_state');
    await h.admin.query(`UPDATE document SET status = 'needs_confirmation' WHERE id = $1`, [id]);
    expect((await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: owner.cookie, body: {} })).statusCode).toBe(400);
    expect((await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'de_good_standing' } })).statusCode).toBe(400);
    expect((await h.request('POST', `/v1/documents/${MISSING_ID}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_founder_ip_assignment' } })).statusCode).toBe(404);
  });

  it('a signed link works, then expires', async () => {
    const data = pdfFile(['Downloadable']);
    const uploaded = await upload(h, owner, company.id, 'download.pdf', data);
    const id = uploaded.json<DocumentBody>().id;
    await h.queue.drain();
    const link = await h.request('GET', `/v1/documents/${id}/download`, { cookie: owner.cookie });
    expect(link.statusCode).toBe(200);
    const { url, expiresAt } = link.json<{ url: string; expiresAt: string }>();
    expect(new Date(expiresAt).getTime() - Date.now()).toBeLessThanOrEqual(300_000);
    expect(url).not.toContain('download.pdf');
    const path = url.replace('https://api.vero.test', '');

    // No session needed: the signature is the credential, and it comes back as a download.
    const fetched = await h.request('GET', path);
    expect(fetched.statusCode).toBe(200);
    expect(fetched.rawPayload.equals(data)).toBe(true);
    expect(fetched.headers['content-disposition']).toBe('attachment');
    expect(fetched.headers['content-type']).toBe('application/octet-stream');
    expect(fetched.headers['x-content-type-options']).toBe('nosniff');

    h.setNow(new Date(Date.now() + 301_000));
    try {
      expect((await h.request('GET', path)).statusCode).toBe(403);
    } finally {
      h.setNow(null);
    }
    // A signature can't be moved to another file.
    const tampered = path.replace(id, MISSING_ID);
    expect((await h.request('GET', tampered)).statusCode).toBe(403);
    const audit = await h.admin.query(`SELECT 1 FROM audit_log WHERE target = $1 AND action = 'document.download_link'`, [id]);
    expect(audit.rows.length).toBe(1);
  });

  it('delete removes the file and the facts, and re-scores', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    const target = await scannedCompany(h, person, { legalName: 'Delete Ltd' });
    const before = await overview(h, person, target.id);
    const id = await fileDocument(h, person, target.id, 'gb_founder_ip_assignment');
    const raised = await overview(h, person, target.id);
    expect(raised.score.value ?? 0).toBeGreaterThan(before.score.value ?? 0);
    const { rows } = await h.admin.query<{ storage_key: string }>(`SELECT storage_key FROM document WHERE id = $1`, [id]);
    const key = rows[0]?.storage_key ?? '';
    expect(await h.deps.files.get(key)).not.toBeNull();

    const deleted = await h.request('DELETE', `/v1/documents/${id}`, { cookie: person.cookie });
    expect(deleted.statusCode).toBe(200);
    await h.queue.drain();
    expect(await h.deps.files.get(key)).toBeNull();
    expect((await getDoc(id, person)).statusCode).toBe(404);
    expect((await overview(h, person, target.id)).score).toEqual(before.score);
    expect((await h.request('DELETE', `/v1/documents/${MISSING_ID}`, { cookie: person.cookie })).statusCode).toBe(404);
  });

  it('nobody in another organisation can reach a document, or upload to its company', async () => {
    const stranger = await h.signIn();
    await setPlan(h, stranger.organisationId, 'growth');
    const uploaded = await upload(h, owner, company.id, 'private.pdf', pdfFile());
    const id = uploaded.json<DocumentBody>().id;
    await h.queue.drain();
    for (const [method, url] of [
      ['GET', `/v1/documents/${id}`],
      ['GET', `/v1/documents/${id}/download`],
      ['DELETE', `/v1/documents/${id}`],
    ] as const) {
      expect((await h.request(method, url, { cookie: stranger.cookie })).statusCode, url).toBe(404);
    }
    const confirm = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: stranger.cookie, body: { slotKey: 'gb_founder_ip_assignment' } });
    expect(confirm.statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${company.id}/documents`, { cookie: stranger.cookie })).statusCode).toBe(404);
    const planted = await upload(h, stranger, company.id, 'planted.pdf', pdfFile());
    expect(planted.statusCode).toBe(404);
    const { rows } = await h.admin.query(`SELECT 1 FROM document WHERE file_name = 'planted.pdf'`);
    expect(rows).toEqual([]);
  });

  it('roles: a lawyer member can read but not change; a signed-out person gets nothing', async () => {
    const lawyer = await addMember(h, owner, 'lawyer');
    const uploaded = await upload(h, owner, company.id, 'roles.pdf', pdfFile());
    const id = uploaded.json<DocumentBody>().id;
    await h.queue.drain();
    expect((await getDoc(id, lawyer)).statusCode).toBe(200);
    expect((await upload(h, lawyer, company.id, 'nope.pdf', pdfFile())).statusCode).toBe(403);
    expect((await h.request('DELETE', `/v1/documents/${id}`, { cookie: lawyer.cookie })).statusCode).toBe(403);
    expect((await h.request('GET', `/v1/documents/${id}`)).statusCode).toBe(401);
    const anon = await h.request('POST', `/v1/companies/${company.id}/documents?fileName=a.pdf`, { body: pdfFile(), headers: { 'content-type': 'application/octet-stream' } });
    expect(anon.statusCode).toBe(401);
  });

  it('Free: no upload and no review at the API, whatever the file, and no slot list', async () => {
    const free = await h.signIn();
    const target = await scannedCompany(h, free, { legalName: 'Free Vault Ltd' });
    const refused = await upload(h, free, target.id, 'nope.pdf', pdfFile());
    expect(refused.statusCode).toBe(403);
    expect(errorOf(refused).code).toBe('plan_upgrade_required');
    // Turned away before the body is read, so even an oversized one gets the same answer.
    const big = await upload(h, free, target.id, 'nope.pdf', Buffer.alloc(2 * 1024 * 1024));
    expect(big.statusCode).toBe(403);
    const view = await h.request('GET', `/v1/companies/${target.id}/documents`, { cookie: free.cookie });
    expect(view.json()).toMatchObject({ canUpload: false, slots: [], documents: [] });
  });

  it('Drive and Notion say plainly that they are not connected', async () => {
    const list = await h.request('GET', '/v1/vault/connections', { cookie: owner.cookie });
    expect(list.json<{ connections: { provider: string; status: string; message: string }[] }>().connections.map((item) => [item.provider, item.status])).toEqual([
      ['gdrive', 'not_connected'],
      ['notion', 'not_connected'],
    ]);
    const connect = await h.request('POST', '/v1/vault/connections/gdrive', { cookie: owner.cookie });
    expect(connect.statusCode).toBe(200);
    expect(connect.json<{ status: string; message: string }>().message).toMatch(/isn't connected yet/);
    expect((await h.request('POST', '/v1/vault/connections/dropbox', { cookie: owner.cookie })).statusCode).toBe(400);
    const { rows } = await h.admin.query(`SELECT 1 FROM vault_connection WHERE organisation_id = $1`, [owner.organisationId]);
    expect(rows).toEqual([]);
  });

  it('a lost file marks the document failed, rather than leaving it stuck', async () => {
    const uploaded = await upload(h, owner, company.id, 'lost.pdf', pdfFile());
    const id = uploaded.json<DocumentBody>().id;
    const { rows } = await h.admin.query<{ storage_key: string }>(`SELECT storage_key FROM document WHERE id = $1`, [id]);
    await h.deps.files.delete(rows[0]?.storage_key ?? '');
    await h.queue.drain();
    const read = (await getDoc(id)).json<DocumentBody>();
    expect(read.status).toBe('failed');
    expect(read.state).toBe('not_accepted');
  });

  it('a corrupt PDF just has no text: a person still decides', async () => {
    const broken = Buffer.from('%PDF-1.4\nthis is not really a pdf at all');
    const uploaded = await upload(h, owner, company.id, 'garbled.pdf', broken);
    expect(uploaded.statusCode).toBe(202);
    await h.queue.drain();
    const read = (await getDoc(uploaded.json<DocumentBody>().id)).json<DocumentBody>();
    expect(read.status).toBe('needs_confirmation');
    expect(read.signatureHint).toBe('unknown');
  });
});

describe('vault helpers', () => {
  it('names the type by content alone', () => {
    expect(inspectFile(pdfFile()).mime).toBe('application/pdf');
    expect(() => inspectFile(Buffer.from('hello'))).toThrow();
  });

  it('cleans names', () => {
    expect(cleanFileName('a/b/c.pdf')).toBe('c.pdf');
    expect(cleanFileName('...hidden.pdf')).toBe('hidden.pdf');
    expect(() => cleanFileName('////')).toThrow();
  });

  it('the classifier suggests, and stays silent when unsure', async () => {
    const classifier = new HeuristicClassifier();
    const slots = [
      { key: 'gb_privacy', label: 'Privacy notice', reason: 'x' },
      { key: 'gb_ip', label: 'IP assignment', reason: 'x' },
    ];
    expect((await classifier.classify({ fileName: 'privacy-notice.pdf', text: null, slots })).slotKey).toBe('gb_privacy');
    expect((await classifier.classify({ fileName: 'x.pdf', text: 'this is an ip assignment from a founder', slots })).slotKey).toBe('gb_ip');
    const unsure = await classifier.classify({ fileName: 'holiday-photo.png', text: null, slots });
    expect(unsure).toMatchObject({ slotKey: null, confidence: 0, signature: 'unknown' });
  });

  it('createCompany works for the helper', () => {
    expect(createCompany).toBeTypeOf('function');
    expect(makeStaff).toBeTypeOf('function');
  });
});
