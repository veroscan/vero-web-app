import type { Harness, SignedIn } from './harness';
import { samplePdf } from '../../src/seed/sample-pdf';

export interface CompanyBody {
  id: string;
  legalName: string;
  incorporationCountry: string;
}

export interface ScanBody {
  id: string;
  status: string;
  kind: string;
  checksDone: number;
  checksTotal: number;
  pollAfterMs: number;
  rulePackVersions: Record<string, string>;
  sources: { connectorId: string; state: string; down: boolean; sampleData: boolean; summary: string }[];
}

export const GB_ANSWERS = {
  entity_type_gb: 'ltd',
  user_countries: ['GB'],
  investor_countries: ['none'],
  has_raised_or_raising: true,
  raised_priced_round: false,
  has_employees: true,
  employee_countries: ['GB'],
  has_contractors: true,
  contractor_countries: ['GB'],
  has_foreign_workers: false,
  revenue_band: 'under_1m',
  headcount_band: '1_10',
  processes_personal_data: true,
  data_subjects_gb_12m: 500,
  sensitive_data: ['none'],
  data_hosted_abroad: true,
  uses_processors: true,
  has_website: true,
  has_app: false,
  ai_roles: ['deployer'],
  ai_uses_third_party_models: true,
  staff_use_ai: true,
  automated_decisions: false,
  payments_mode: ['psp_only'],
  sectors: ['none'],
  customer_type: 'b2b',
  has_subscriptions: true,
  sells_to_enterprise: true,
  offers_api: true,
  user_generated_content: false,
};

export async function setPlan(h: Harness, organisationId: string, plan: 'free' | 'growth' | 'scale'): Promise<void> {
  await h.admin.query(`UPDATE organisation SET plan_id = (SELECT id FROM plan WHERE code = $2) WHERE id = $1`, [organisationId, plan]);
}

/** A person on the platform's own staff list. */
export async function makeStaff(h: Harness, role: 'lawyer' | 'admin'): Promise<SignedIn> {
  const person = await h.signIn();
  await h.admin.query(`INSERT INTO platform_staff (user_id, role) VALUES ($1, $2)`, [person.userId, role]);
  return person;
}

export async function createCompany(h: Harness, who: SignedIn, overrides: Record<string, unknown> = {}): Promise<CompanyBody> {
  const response = await h.request('POST', '/v1/companies', {
    cookie: who.cookie,
    body: { legalName: 'Heron Pay Ltd', incorporationCountry: 'GB', ...overrides },
  });
  if (response.statusCode !== 201) throw new Error(`Create failed: ${response.statusCode} ${response.body}`);
  return response.json<CompanyBody>();
}

export async function answer(h: Harness, who: SignedIn, companyId: string, answers: Record<string, unknown> = GB_ANSWERS): Promise<void> {
  const response = await h.request('PATCH', `/v1/companies/${companyId}/questionnaire`, { cookie: who.cookie, body: { answers } });
  if (response.statusCode !== 200) throw new Error(`Answers failed: ${response.statusCode} ${response.body}`);
}

/** Starts a scan and waits for everything the queue has, so the result is in. */
export async function scanNow(h: Harness, who: SignedIn, companyId: string): Promise<ScanBody> {
  const started = await h.request('POST', `/v1/companies/${companyId}/scans`, { cookie: who.cookie });
  if (started.statusCode !== 202) throw new Error(`Scan failed: ${started.statusCode} ${started.body}`);
  await h.queue.drain();
  const read = await h.request('GET', `/v1/scans/${started.json<ScanBody>().id}`, { cookie: who.cookie });
  return read.json<ScanBody>();
}

/** A company with answers and a finished scan. */
export async function scannedCompany(h: Harness, who: SignedIn, overrides: Record<string, unknown> = {}): Promise<CompanyBody> {
  const company = await createCompany(h, who, overrides);
  await answer(h, who, company.id);
  await scanNow(h, who, company.id);
  return company;
}

export function pdfFile(lines: string[] = ['A test document']): Buffer {
  return samplePdf(lines);
}

export function upload(h: Harness, who: SignedIn, companyId: string, fileName: string, data: Buffer, slotKey?: string) {
  const query = new URLSearchParams({ fileName, ...(slotKey ? { slotKey } : {}) });
  return h.request('POST', `/v1/companies/${companyId}/documents?${query.toString()}`, {
    cookie: who.cookie,
    body: data,
    headers: { 'content-type': 'application/octet-stream' },
  });
}

/** Uploads, waits for it to be read, and files it in a slot. Returns the document id. */
export async function fileDocument(
  h: Harness,
  who: SignedIn,
  companyId: string,
  slotKey: string,
  extra: Record<string, unknown> = {},
  fileName = `${slotKey}.pdf`,
  lines: string[] = ['Signed by Amara Okafor'],
): Promise<string> {
  const uploaded = await upload(h, who, companyId, fileName, pdfFile(lines));
  if (uploaded.statusCode !== 202) throw new Error(`Upload failed: ${uploaded.statusCode} ${uploaded.body}`);
  const id = uploaded.json<{ id: string }>().id;
  await h.queue.drain();
  const confirmed = await h.request('POST', `/v1/documents/${id}/confirm`, { cookie: who.cookie, body: { slotKey, confirmSigned: true, ...extra } });
  if (confirmed.statusCode !== 200) throw new Error(`Confirm failed: ${confirmed.statusCode} ${confirmed.body}`);
  await h.queue.drain();
  return id;
}

export interface OverviewBody {
  score: { kind: string; value?: number; low?: number; high?: number };
  statusWord: string | null;
  areas: { layer: number; name: string; score: number | null; locked: boolean; topIssue: unknown }[];
  nextAction: { ruleKey: string; points: number | null } | null;
  sourcesDown: { sourceName: string }[];
  sampleData: boolean;
  plan: string;
  trend: { delta: number } | null;
  rulePacks: { jurisdiction: string; version: string; status: string }[];
  topDeadlines: { title: string; state: string }[];
  hasResult: boolean;
  methodVersion: string | null;
}

export async function overview(h: Harness, who: SignedIn, companyId: string): Promise<OverviewBody> {
  const response = await h.request('GET', `/v1/companies/${companyId}/overview`, { cookie: who.cookie });
  if (response.statusCode !== 200) throw new Error(`Overview failed: ${response.statusCode} ${response.body}`);
  return response.json<OverviewBody>();
}

export const MISSING_ID = '11111111-1111-4111-8111-111111111111';
