import { describe, expect, it, vi } from 'vitest';
import {
  createApiClient,
  createShareBodySchema,
  issueListQuerySchema,
  PERMISSIONS,
  PLAN_CODES,
  PLAN_ENTITLEMENTS,
  publicReportResponseSchema,
  ruleKeySchema,
  SLOT_STATE_WORDS,
  SLOT_STATES,
  updateAnswersBodySchema,
  uploadBodySchema,
} from '../src';

describe('plans', () => {
  it('has one entry for each plan, and the free plan shows no exact score', () => {
    expect(Object.keys(PLAN_ENTITLEMENTS).sort()).toEqual([...PLAN_CODES].sort());
    expect(PLAN_ENTITLEMENTS.free).toMatchObject({ exactScore: false, gapLimit: 3, vault: false });
    for (const plan of PLAN_CODES) expect(PLAN_ENTITLEMENTS[plan]).not.toHaveProperty('lawyerReviewsPerQuarter');
  });
});

describe('product schemas', () => {
  it('a rule key is the stable id of an issue', () => {
    expect(ruleKeySchema.safeParse('GB.CORP.CONFIRMATION_STATEMENT').success).toBe(true);
    expect(ruleKeySchema.safeParse('US-DE.TAX.FRANCHISE').success).toBe(true);
    for (const bad of ['gb.corp', 'GB', '../etc/passwd', 'GB.CORP;DROP', '']) expect(ruleKeySchema.safeParse(bad).success, bad).toBe(false);
  });

  it('answers need at least one value', () => {
    expect(updateAnswersBodySchema.safeParse({ answers: {} }).success).toBe(false);
    expect(updateAnswersBodySchema.safeParse({ answers: { has_app: true } }).success).toBe(true);
    expect(updateAnswersBodySchema.safeParse({ answers: { has_app: null } }).success).toBe(true);
    expect(updateAnswersBodySchema.safeParse({ answers: { 'BAD KEY': true } }).success).toBe(false);
  });

  it('issue filters default to what is open, and refuse the unknown', () => {
    expect(issueListQuerySchema.parse({})).toEqual({ scope: 'company', outcome: 'open' });
    expect(issueListQuerySchema.safeParse({ layer: '7' }).success).toBe(false);
    expect(issueListQuerySchema.safeParse({ outcome: 'hidden' }).success).toBe(false);
  });

  it('a share link lasts 1 to 90 days, 30 by default', () => {
    expect(createShareBodySchema.parse({}).expiresInDays).toBe(30);
    expect(createShareBodySchema.safeParse({ expiresInDays: 91 }).success).toBe(false);
  });

  it('the public report keeps nothing it does not declare', () => {
    const parsed = publicReportResponseSchema.parse({
      companyName: 'A',
      score: 1,
      statusWord: 'At risk',
      reportDate: '2026-11-05T00:00:00.000Z',
      expiresAt: '2026-12-05T00:00:00.000Z',
      openIssues: { total: 0, urgent: 0, important: 0, worthDoing: 0 },
      areas: [],
      checked: [],
      lawyerRead: { read: 0, total: 0 },
      sampleData: false,
      notLegalAdvice: 'x',
      documents: ['secret.pdf'],
      issues: [{ headline: 'secret' }],
    });
    expect(JSON.stringify(parsed)).not.toContain('secret');
    // Links made before 19 Nov 2026 stored a lawyer count. It is never sent now.
    expect(JSON.stringify(parsed)).not.toContain('lawyer');
  });

  it('every slot state has its words', () => {
    for (const state of SLOT_STATES) expect(SLOT_STATE_WORDS[state].length).toBeGreaterThan(2);
  });

  it('a lawyer member reads, and never changes, the core product', () => {
    for (const permission of ['answers.write', 'scans.write', 'vault.write', 'deadlines.write', 'orders.write', 'sharing.manage'] as const) {
      expect(PERMISSIONS[permission] as readonly string[]).not.toContain('lawyer');
    }
    for (const permission of ['results.read', 'vault.read'] as const) expect(PERMISSIONS[permission]).toContain('lawyer');
  });
});

describe('the typed client and files', () => {
  it('sends a file as raw bytes, not JSON', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.body).toBeInstanceOf(Uint8Array);
      expect((init?.headers as Record<string, string>)['content-type']).toBe('application/octet-stream');
      return new Response(JSON.stringify({ error: { code: 'plan_upgrade_required', message: 'Uploading documents is part of a paid plan.' } }), { status: 403 });
    });
    const client = createApiClient({ baseUrl: 'https://api.test', fetch: fetchMock as unknown as typeof fetch });
    await expect(
      client.vault.upload({
        params: { companyId: '11111111-1111-4111-8111-111111111111' },
        query: { fileName: 'a.pdf' },
        body: new Uint8Array([1, 2, 3]),
      }),
    ).rejects.toMatchObject({ code: 'plan_upgrade_required', status: 403 });
    const url = fetchMock.mock.calls[0]?.[0];
    expect(url).toContain('fileName=a.pdf');
    expect(uploadBodySchema.safeParse('text').success).toBe(false);
  });
});
