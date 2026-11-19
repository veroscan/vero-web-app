import { createConnectors, type Connector } from '@vero/connectors';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { recoverScans, retryDownSources, runScan } from '../src/modules/scans/pipeline';
import { errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, fileDocument, GB_ANSWERS, MISSING_ID, overview, scanNow, scannedCompany, setPlan, type ScanBody } from './support/product';

const CH = 'uk.companies_house';
const ICO = 'uk.ico_register';
const WEB = 'web.policy_scan';
/**
 * The UK's own sources, plus every source that covers every country ('*'), such as GLEIF. Not a
 * backup register (OpenCorporates): the UK's own register is on, so it isn't asked.
 */
const GLOBAL_CONNECTORS = createConnectors({ env: { CONNECTOR_MODE: 'fixture', NODE_ENV: 'test' } })
  .filter((connector) => connector.jurisdictions.includes('*') && !connector.fallbackRegister)
  .map((connector) => connector.id);
const GB_CONNECTORS = [...new Set([CH, ICO, 'uk.hmrc_vat', 'sanctions.lists', WEB, ...GLOBAL_CONNECTORS])];

/** Lets one test make one source misbehave, with the others untouched. */
function controllable(fixtures: Connector[], behaviour: Map<string, 'unavailable' | 'error' | 'throw' | 'hang'>): Connector[] {
  return fixtures.map((connector) => ({
    ...connector,
    lookup: async (ref) => {
      const how = behaviour.get(connector.id);
      if (how === 'throw') throw new Error('boom, with a secret in it');
      if (how === 'hang') return new Promise(() => undefined);
      if (how) return connector.lookup({ ...ref, scenario: how });
      return connector.lookup(ref);
    },
  }));
}

describe('scan pipeline', () => {
  let h: Harness;
  let owner: SignedIn;
  const behaviour = new Map<string, 'unavailable' | 'error' | 'throw' | 'hang'>();

  const scansOf = async (companyId: string) =>
    (await h.admin.query<{ id: string; kind: string; status: string; trigger: string }>(`SELECT id, kind, status, trigger FROM scan WHERE company_id = $1 ORDER BY created_at`, [companyId])).rows;
  const count = async (table: string, column: string, id: string) =>
    Number((await h.admin.query<{ n: string }>(`SELECT count(*) AS n FROM ${table} WHERE ${column} = $1`, [id])).rows[0]?.n);

  beforeAll(async () => {
    h = await startHarness({ CONNECTOR_TIMEOUT_MS: '200' }, { connectors: (fixtures) => controllable(fixtures, behaviour) });
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());

  it('runs a whole scan from company to score, with provenance on every fact', async () => {
    const company = await createCompany(h, owner);
    await answer(h, owner, company.id);
    const scan = await scanNow(h, owner, company.id);

    expect(scan.status).toBe('completed');
    expect(scan.checksDone).toBe(scan.checksTotal);
    expect(scan.sources.map((source) => source.connectorId).sort()).toEqual([...GB_CONNECTORS].sort());
    expect(scan.pollAfterMs).toBe(0);
    for (const source of scan.sources) expect(source.sampleData).toBe(true);

    const facts = await h.admin.query<{ key: string; source: string; retrieved_at: Date; verification_tier: number; is_fixture: boolean; origin: string }>(
      `SELECT key, source, retrieved_at, verification_tier, is_fixture, origin FROM fact WHERE company_id = $1`,
      [company.id],
    );
    expect(facts.rows.find((row) => row.key === 'registry.uk.companies_house.status')).toMatchObject({ source: CH, verification_tier: 1, is_fixture: true, origin: 'connector' });
    expect(facts.rows.find((row) => row.key === 'answers.has_employees')).toMatchObject({ verification_tier: 5, origin: 'answer' });
    for (const row of facts.rows) {
      expect(row.source.length).toBeGreaterThan(0);
      expect(row.retrieved_at).toBeInstanceOf(Date);
    }

    const findings = await h.admin.query<{ rule_key: string; outcome: string; scored: boolean; rule_id: string | null; rule_pack_version: string }>(
      `SELECT rule_key, outcome, scored, rule_id, rule_pack_version FROM finding WHERE scan_id = $1`,
      [scan.id],
    );
    expect(findings.rows.length).toBe(127);
    expect(findings.rows.find((row) => row.rule_key === 'GB.CORP.CONFIRMATION_STATEMENT')?.outcome).toBe('defect');
    expect(findings.rows.every((row) => row.rule_id !== null)).toBe(true);

    const overviewBody = await overview(h, owner, company.id);
    expect(overviewBody.score.kind).toBe('exact');
    expect(overviewBody.areas).toHaveLength(6);
    expect(overviewBody.sampleData).toBe(true);
    expect(overviewBody.hasResult).toBe(true);
  });

  it('records the method and rule pack versions on the snapshot, and never approves a pack', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Versions Ltd' });
    const { rows } = await h.admin.query<{ method_version: string; rule_pack_versions: Record<string, string>; overall: string }>(
      `SELECT method_version, rule_pack_versions, overall FROM score_snapshot WHERE company_id = $1`,
      [company.id],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.method_version).toBe('2026.11-draft.7');
    expect(rows[0]?.rule_pack_versions).toEqual({ GB: expect.stringMatching(/^\d+\.\d+\.\d+$/) as string });
    const packs = await h.admin.query<{ status: string; approved_by: string | null }>(`SELECT status, approved_by FROM rule_pack`);
    expect(packs.rows.length).toBeGreaterThanOrEqual(4);
    for (const pack of packs.rows) expect(pack).toEqual({ status: 'draft', approved_by: null });
  });

  it('the snapshot and the overview agree, because nothing is hard-coded', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Agree Ltd' });
    const { rows } = await h.admin.query<{ overall: string }>(`SELECT overall FROM score_snapshot WHERE company_id = $1`, [company.id]);
    const body = await overview(h, owner, company.id);
    expect(body.score.value).toBe(Math.round(Number(rows[0]?.overall)));
  });

  describe.each([
    ['unavailable', CH],
    ['error', CH],
    ['throw', CH],
    ['hang', CH],
    ['unavailable', ICO],
    ['error', ICO],
    ['unavailable', WEB],
    ['error', 'uk.hmrc_vat'],
    ['error', 'sanctions.lists'],
  ] as const)('when a source is %s (%s)', (how, connectorId) => {
    it('gives a partial result that keeps the others and neither rewards nor punishes it', async () => {
      const company = await createCompany(h, owner, { legalName: `Down ${how} ${connectorId} Ltd` });
      await answer(h, owner, company.id);
      behaviour.set(connectorId, how);
      let scan: ScanBody;
      try {
        scan = await scanNow(h, owner, company.id);
      } finally {
        behaviour.delete(connectorId);
      }

      expect(scan.status).toBe('partial');
      const down = scan.sources.find((source) => source.connectorId === connectorId);
      expect(down?.down).toBe(true);
      expect(down?.summary).toMatch(/won't count for or against your score/);
      expect(scan.sources.filter((source) => source.connectorId !== connectorId).every((source) => !source.down)).toBe(true);

      // No rule that reads this source was scored, one way or the other.
      const prefix = { [CH]: 'registry.uk.companies_house', [ICO]: 'registry.uk.ico', [WEB]: 'web.policy', 'uk.hmrc_vat': 'registry.uk.hmrc_vat', 'sanctions.lists': 'registry.sanctions' }[connectorId];
      const findings = await h.admin.query<{ rule_key: string; outcome: string; detail: { reason: string | null; facts_used: { key: string }[] } }>(
        `SELECT rule_key, outcome, detail FROM finding WHERE scan_id = $1`,
        [scan.id],
      );
      const reading = findings.rows.filter((row) => row.detail.facts_used.some((used) => used.key === prefix || used.key.startsWith(`${prefix}.`)));
      for (const row of reading) {
        if (row.outcome === 'gap' || row.outcome === 'defect') {
          // Only a rule that also has another way to fail may stay open, never from this source.
          expect(row.detail.facts_used.some((used) => !used.key.startsWith(`${prefix}.`))).toBe(true);
        }
      }
      expect(await count('source_result', 'scan_id', scan.id)).toBe(GB_CONNECTORS.length);

      const body = await overview(h, owner, company.id);
      expect(body.sourcesDown.length).toBe(1);
      expect(body.score.kind).toBe('exact');
    });
  });

  it('an unavailable source moves no rule to a failure, compared to the same company with it up', async () => {
    // This name is the one the fixture register says is not on the ICO list.
    const up = await scannedCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd' });
    const down = await createCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd' });
    await answer(h, owner, down.id);
    behaviour.set(ICO, 'unavailable');
    const downScan = await scanNow(h, owner, down.id).finally(() => behaviour.delete(ICO));
    const outcomes = async (companyId: string) =>
      new Map(
        (
          await h.admin.query<{ rule_key: string; outcome: string }>(
            `SELECT f.rule_key, f.outcome FROM finding f JOIN scan s ON s.id = f.scan_id
             WHERE f.company_id = $1 AND s.finalised_seq = (SELECT max(finalised_seq) FROM scan WHERE company_id = $1)`,
            [companyId],
          )
        ).rows.map((row) => [row.rule_key, row.outcome]),
      );
    const withIco = await outcomes(up.id);
    const withoutIco = await outcomes(down.id);
    expect(downScan.status).toBe('partial');
    // The ICO rule fails when the register says not listed, and is "verify" when we couldn't look.
    expect(withIco.get('GB.DP.ICO_FEE')).toBe('gap');
    expect(withoutIco.get('GB.DP.ICO_FEE')).toBe('verify');
    for (const [rule, outcome] of withoutIco) {
      if (outcome === 'gap' || outcome === 'defect') expect(withIco.get(rule), rule).toBe(outcome);
    }
  });

  it('never leaks a broken source’s error text to the client or the logs', async () => {
    const company = await createCompany(h, owner, { legalName: 'Leak Ltd' });
    behaviour.set(CH, 'throw');
    const scan = await scanNow(h, owner, company.id).finally(() => behaviour.delete(CH));
    expect(JSON.stringify(scan)).not.toContain('boom');
    const { rows } = await h.admin.query<{ message: string }>(`SELECT message FROM source_result WHERE scan_id = $1 AND connector_id = $2`, [scan.id, CH]);
    expect(rows[0]?.message).not.toContain('boom');
    expect(h.logs.join('\n')).not.toContain('boom');
  });

  it('retries a source that was down, and only a recovery changes the score', async () => {
    const company = await createCompany(h, owner, { legalName: 'Retry Ltd' });
    await answer(h, owner, company.id);
    behaviour.set(ICO, 'error');
    const scan = await scanNow(h, owner, company.id);
    expect(scan.status).toBe('partial');
    const before = await h.admin.query<{ next_source_retry_at: Date }>(`SELECT next_source_retry_at FROM company_sweep WHERE company_id = $1`, [company.id]);
    expect(before.rows[0]?.next_source_retry_at).toBeInstanceOf(Date);

    // Not due yet: nothing happens.
    expect(await count('scan', 'company_id', company.id)).toBe(1);
    const later = new Date(Date.now() + 16 * 60_000);
    h.setNow(later);
    try {
      // Still down: the attempt is recorded, but no new score.
      await retryDownSources(h.deps);
      await h.queue.drain();
      expect(await count('scan', 'company_id', company.id)).toBe(1);
      const row = await h.admin.query<{ attempts: number; status: string }>(`SELECT attempts, status FROM source_result WHERE scan_id = $1 AND connector_id = $2`, [scan.id, ICO]);
      expect(row.rows[0]).toEqual({ attempts: 2, status: 'error' });
      const backedOff = await h.admin.query<{ next_source_retry_at: Date }>(`SELECT next_source_retry_at FROM company_sweep WHERE company_id = $1`, [company.id]);
      expect(backedOff.rows[0]?.next_source_retry_at.getTime()).toBeGreaterThan(later.getTime() + 15 * 60_000);

      // It comes back: the fact arrives, and a re-score follows.
      behaviour.delete(ICO);
      h.setNow(new Date(later.getTime() + 2 * 86_400_000));
      await retryDownSources(h.deps);
      await h.queue.drain();
    } finally {
      h.setNow(null);
      behaviour.delete(ICO);
    }
    const scans = await scansOf(company.id);
    expect(scans.map((row) => [row.kind, row.status, row.trigger])).toEqual([
      ['full', 'partial', 'user'],
      ['rescore', 'completed', 'source_recovered'],
    ]);
    const ico = await h.admin.query<{ value: unknown }>(`SELECT value FROM fact WHERE company_id = $1 AND key = 'registry.uk.ico.listed'`, [company.id]);
    expect(ico.rows).toHaveLength(1);
    const sweep = await h.admin.query<{ next_source_retry_at: Date | null }>(`SELECT next_source_retry_at FROM company_sweep WHERE company_id = $1`, [company.id]);
    expect(sweep.rows[0]?.next_source_retry_at).toBeNull();
  });

  it('a duplicate job does nothing, even when both run at once', async () => {
    const company = await createCompany(h, owner, { legalName: 'Duplicate Ltd' });
    await answer(h, owner, company.id);
    const started = await h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie });
    const scanId = started.json<ScanBody>().id;
    const payload = { organisationId: owner.organisationId, scanId };
    await Promise.all([runScan(h.deps, payload), runScan(h.deps, payload), h.deps.queue.enqueue('scan.run', payload)]);
    await h.queue.drain();
    // And once more after it finished.
    await runScan(h.deps, payload);

    expect(await count('score_snapshot', 'scan_id', scanId)).toBe(1);
    expect(await count('finding', 'scan_id', scanId)).toBe(127);
    expect(await count('source_result', 'scan_id', scanId)).toBe(GB_CONNECTORS.length);
    const actions = await h.admin.query<{ n: string; d: string }>(`SELECT count(*) AS n, count(DISTINCT finding_id) AS d FROM action_item WHERE scan_id = $1`, [scanId]);
    expect(actions.rows[0]?.n).toBe(actions.rows[0]?.d);
    expect(Number(actions.rows[0]?.n)).toBeGreaterThan(0);
  });

  it('asking twice while a scan is moving gives the same scan', async () => {
    const company = await createCompany(h, owner, { legalName: 'Twice Ltd' });
    const [first, second] = await Promise.all([
      h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie }),
      h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie }),
    ]);
    expect(first.json<ScanBody>().id).toBe(second.json<ScanBody>().id);
    await h.queue.drain();
    expect(await count('scan', 'company_id', company.id)).toBe(1);
  });

  it('survives a crash in the middle of writing the result: nothing half-written, then it finishes', async () => {
    const company = await createCompany(h, owner, { legalName: 'Crash Ltd' });
    await answer(h, owner, company.id);
    const name = `crash_${company.id.replaceAll('-', '')}`;
    // A database fault right at the last step, for this company only.
    await h.admin.query(`
      CREATE FUNCTION ${name}() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.company_id = '${company.id}' THEN RAISE EXCEPTION 'simulated crash'; END IF;
        RETURN NEW;
      END; $$`);
    await h.admin.query(`CREATE TRIGGER ${name} BEFORE INSERT ON score_snapshot FOR EACH ROW EXECUTE FUNCTION ${name}()`);

    const started = await h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie });
    const scanId = started.json<ScanBody>().id;
    await h.queue.drain();
    expect(await count('finding', 'scan_id', scanId)).toBe(0);
    expect(await count('score_snapshot', 'scan_id', scanId)).toBe(0);
    const stuck = await h.admin.query<{ status: string; attempts: number }>(`SELECT status, attempts FROM scan WHERE id = $1`, [scanId]);
    expect(stuck.rows[0]?.status).toBe('running');
    expect(stuck.rows[0]?.attempts).toBeGreaterThan(1);
    // Sources already asked aren't asked again.
    expect(await count('source_result', 'scan_id', scanId)).toBe(GB_CONNECTORS.length);

    await h.admin.query(`DROP TRIGGER ${name} ON score_snapshot`);
    await h.admin.query(`DROP FUNCTION ${name}()`);

    // The sweep finds it once the lease has passed.
    await h.admin.query(`UPDATE company_sweep SET scan_in_flight_until = now() - interval '1 minute' WHERE company_id = $1`, [company.id]);
    expect(await recoverScans(h.deps)).toBeGreaterThanOrEqual(1);
    await h.queue.drain();
    const done = await h.admin.query<{ status: string }>(`SELECT status FROM scan WHERE id = $1`, [scanId]);
    expect(done.rows[0]?.status).toBe('completed');
    expect(await count('finding', 'scan_id', scanId)).toBe(127);
    expect(await count('score_snapshot', 'scan_id', scanId)).toBe(1);
  });

  it('a scan whose worker died is picked up again', async () => {
    const company = await createCompany(h, owner, { legalName: 'Dead Worker Ltd' });
    const inserted = await h.admin.query<{ id: string }>(
      `INSERT INTO scan (organisation_id, company_id, status, connectors, lease_until, attempts, started_at)
       VALUES ($1, $2, 'running', $3, now() - interval '1 hour', 1, now() - interval '1 hour') RETURNING id`,
      [owner.organisationId, company.id, GB_CONNECTORS],
    );
    const scanId = inserted.rows[0]?.id;
    await h.admin.query(
      `INSERT INTO company_sweep (company_id, tenant_id, scan_in_flight_id, scan_in_flight_until) VALUES ($1, $2, $3, now() - interval '1 minute')`,
      [company.id, owner.organisationId, scanId],
    );
    await recoverScans(h.deps);
    await h.queue.drain();
    const row = await h.admin.query<{ status: string }>(`SELECT status FROM scan WHERE id = $1`, [scanId]);
    expect(row.rows[0]?.status).toBe('completed');
    const sweep = await h.admin.query<{ scan_in_flight_id: string | null }>(`SELECT scan_in_flight_id FROM company_sweep WHERE company_id = $1`, [company.id]);
    expect(sweep.rows[0]?.scan_in_flight_id).toBeNull();
  });

  it('gives up cleanly after too many attempts, rather than looping for ever', async () => {
    const company = await createCompany(h, owner, { legalName: 'Too Many Ltd' });
    const inserted = await h.admin.query<{ id: string }>(
      `INSERT INTO scan (organisation_id, company_id, status, attempts, lease_until) VALUES ($1, $2, 'running', 5, now() - interval '1 minute') RETURNING id`,
      [owner.organisationId, company.id],
    );
    const scanId = inserted.rows[0]?.id ?? '';
    await runScan(h.deps, { organisationId: owner.organisationId, scanId });
    const row = await h.admin.query<{ status: string }>(`SELECT status FROM scan WHERE id = $1`, [scanId]);
    expect(row.rows[0]?.status).toBe('failed');
  });

  it('re-scores after an answer changes, without asking the sources again', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Rescore Answer Ltd' });
    const first = await overview(h, owner, company.id);
    const sourcesBefore = await count('source_result', 'company_id', company.id);

    const changed = await h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, {
      cookie: owner.cookie,
      body: { answers: { ip_founders_signed: true, has_contractors: false } },
    });
    expect(changed.json<{ rescoreQueued: boolean }>().rescoreQueued).toBe(true);
    await h.queue.drain();

    const scans = await scansOf(company.id);
    expect(scans.at(-1)).toMatchObject({ kind: 'rescore', status: 'completed', trigger: 'answers' });
    expect(await count('source_result', 'company_id', company.id)).toBe(sourcesBefore);
    const second = await overview(h, owner, company.id);
    expect(second.hasResult).toBe(true);
    expect(first.score.kind).toBe('exact');
    const contractorRule = await h.admin.query<{ outcome: string }>(
      `SELECT f.outcome FROM finding f JOIN scan s ON s.id = f.scan_id
       WHERE f.company_id = $1 AND f.rule_key = 'GB.IP.CONTRACTOR_ASSIGNMENT' AND s.kind = 'rescore'`,
      [company.id],
    );
    expect(contractorRule.rows.every((row) => row.outcome === 'not_applicable')).toBe(true);
  });

  it('re-scores after a document, and the score goes up when it closes a gap', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Rescore Doc Ltd' });
    const before = await overview(h, owner, company.id);
    await fileDocument(h, owner, company.id, 'gb_founder_ip_assignment');
    const scans = await scansOf(company.id);
    expect(scans.at(-1)).toMatchObject({ kind: 'rescore', trigger: 'document', status: 'completed' });
    const after = await overview(h, owner, company.id);
    expect(after.score.value ?? 0).toBeGreaterThan(before.score.value ?? 0);
    const fact = await h.admin.query<{ value: unknown; verification_tier: number; origin: string }>(
      `SELECT value, verification_tier, origin FROM fact WHERE company_id = $1 AND key = 'vault.gb_founder_ip_assignment.present'`,
      [company.id],
    );
    expect(fact.rows[0]).toEqual({ value: true, verification_tier: 4, origin: 'document' });
  });

  it('several changes in a row share one waiting re-score', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Burst Ltd' });
    await Promise.all([
      h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: owner.cookie, body: { answers: { has_app: true } } }),
      h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: owner.cookie, body: { answers: { has_website: false } } }),
    ]);
    await h.queue.drain();
    const rescores = (await scansOf(company.id)).filter((row) => row.kind === 'rescore');
    expect(rescores.length).toBeGreaterThanOrEqual(1);
    expect(rescores.length).toBeLessThanOrEqual(2);
    expect(rescores.every((row) => row.status === 'completed')).toBe(true);
    // Whatever the order, the newest result has both answers.
    const facts = await h.admin.query<{ key: string; value: unknown }>(`SELECT key, value FROM fact WHERE company_id = $1 AND key IN ('answers.has_app', 'answers.has_website')`, [company.id]);
    expect(Object.fromEntries(facts.rows.map((row) => [row.key, row.value]))).toEqual({ 'answers.has_app': true, 'answers.has_website': false });
  });

  it('editing answers before any scan queues nothing', async () => {
    const company = await createCompany(h, owner, { legalName: 'Early Ltd' });
    const response = await h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: owner.cookie, body: { answers: GB_ANSWERS } });
    expect(response.json<{ rescoreQueued: boolean }>().rescoreQueued).toBe(false);
    expect(await count('scan', 'company_id', company.id)).toBe(0);
  });

  it('covers a Delaware company with both its packs, and a Nigerian one with its own', async () => {
    const delaware = await createCompany(h, owner, { legalName: 'Heron Inc.', incorporationCountry: 'US-DE' });
    const scan = await scanNow(h, owner, delaware.id);
    expect(Object.keys(scan.rulePackVersions).sort()).toEqual(['US', 'US-DE']);
    expect(await count('finding', 'scan_id', scan.id)).toBe(140);
    expect(scan.sources.map((source) => source.connectorId)).toContain('us.delaware_vendor');

    const nigeria = await createCompany(h, owner, { legalName: 'Heron Nigeria Ltd', incorporationCountry: 'NG' });
    const ngScan = await scanNow(h, owner, nigeria.id);
    expect(Object.keys(ngScan.rulePackVersions)).toEqual(['NG']);
    expect(await count('finding', 'scan_id', ngScan.id)).toBe(109);
  });

  it('shows per-source progress while running, for the scanning screen', async () => {
    const company = await createCompany(h, owner, { legalName: 'Progress Ltd' });
    const started = await h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie });
    const body = started.json<ScanBody>();
    expect(started.statusCode).toBe(202);
    expect(body.checksTotal).toBe(GB_CONNECTORS.length);
    expect(body.sources.every((source) => ['waiting', 'found', 'not_found'].includes(source.state))).toBe(true);
    expect(body.pollAfterMs).toBeGreaterThan(0);
    await h.queue.drain();
    const list = await h.request('GET', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie });
    expect(list.json<{ scans: ScanBody[] }>().scans[0]?.status).toBe('completed');
  });

  it('checks input, existence, permissions and tenancy', async () => {
    const company = await createCompany(h, owner, { legalName: 'Guarded Ltd' });
    expect((await h.request('POST', `/v1/companies/not-an-id/scans`, { cookie: owner.cookie })).statusCode).toBe(400);
    const missing = await h.request('POST', `/v1/companies/${MISSING_ID}/scans`, { cookie: owner.cookie });
    expect(missing.statusCode).toBe(404);
    expect(errorOf(missing).code).toBe('not_found');
    expect((await h.request('GET', `/v1/scans/${MISSING_ID}`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${company.id}/scans`)).statusCode).toBe(401);

    const stranger = await h.signIn();
    const scan = await scanNow(h, owner, company.id);
    expect((await h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/scans/${scan.id}`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${company.id}/scans`, { cookie: stranger.cookie })).statusCode).toBe(404);
  });

  it('a lawyer member of an organisation can read but not start a scan', async () => {
    const { addMember } = await import('./support/harness');
    const lawyer = await addMember(h, owner, 'lawyer');
    const company = await createCompany(h, owner, { legalName: 'Reader Ltd' });
    expect((await h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: lawyer.cookie })).statusCode).toBe(403);
    expect((await h.request('GET', `/v1/companies/${company.id}/scans`, { cookie: lawyer.cookie })).statusCode).toBe(200);
  });
});

describe('connectors in production', () => {
  it('fixture mode is refused, and a live connector with no key is unavailable', async () => {
    const { createConnectors, FixtureModeRefusedError } = await import('@vero/connectors');
    expect(() => createConnectors({ env: { CONNECTOR_MODE: 'fixture', NODE_ENV: 'production' } })).toThrow(FixtureModeRefusedError);
    const live = createConnectors({ env: { NODE_ENV: 'production' } });
    const result = await live[0]?.lookup({ name: 'Anything Ltd', jurisdiction: 'GB' });
    expect(result?.status).toBe('unavailable');
  });

  it('with no keys at all, a scan is partial and counts no source against the company', async () => {
    const { createConnectors } = await import('@vero/connectors');
    const h = await startHarness({}, { connectors: () => createConnectors({ env: { NODE_ENV: 'test' } }) });
    try {
      const owner = await h.signIn();
      await setPlan(h, owner.organisationId, 'growth');
      const company = await createCompany(h, owner);
      await answer(h, owner, company.id);
      const scan = await scanNow(h, owner, company.id);
      expect(scan.status).toBe('partial');
      expect(scan.sources.every((source) => source.down && source.state === 'unavailable' && !source.sampleData)).toBe(true);
      const facts = await h.admin.query(`SELECT 1 FROM fact WHERE company_id = $1 AND origin = 'connector'`, [company.id]);
      expect(facts.rows).toEqual([]);
      // A rule can only fail on something the company itself hasn't given us. One that rests
      // on a register alone waits, shown as "verify".
      const failed = await h.admin.query<{ rule_key: string; detail: { facts_used: { key: string }[] } }>(
        `SELECT rule_key, detail FROM finding WHERE scan_id = $1 AND outcome IN ('gap', 'defect')`,
        [scan.id],
      );
      for (const row of failed.rows) {
        expect(row.detail.facts_used.some((used) => !used.key.startsWith('registry.') && !used.key.startsWith('web.')), row.rule_key).toBe(true);
      }
      const body = await overview(h, owner, company.id);
      expect(body.sampleData).toBe(false);
      // With no keys the UK's own register is off, so the backup register (OpenCorporates) is asked too.
      const covering = h.deps.connectors.filter((connector) => connector.jurisdictions.includes('GB') || connector.jurisdictions.includes('*'));
      expect(body.sourcesDown.length).toBe(covering.length);
    } finally {
      await h.close();
    }
  });
});
