import type { Database } from './client';
import { enterOrg } from './client';
import * as schema from './schema';

/** Fictional demo data. `.example` is reserved and can never receive real mail. */
export const DEMO_ORGANISATION_ID = '00000000-0000-4000-8000-00000000a001';
export const DEMO_USER_ID = '00000000-0000-4000-8000-00000000b001';
export const DEMO_EMAIL = 'amara@kestrelpay.example';

const DEMO_COMPANIES = [
  {
    id: '00000000-0000-4000-8000-00000000c001',
    legalName: 'Kestrel Pay Inc.',
    incorporationCountry: 'US-DE',
    registrationNumber: 'DEMO-DE-0001',
    entityType: 'Corporation',
  },
  {
    id: '00000000-0000-4000-8000-00000000c002',
    legalName: 'Kestrel Pay UK Ltd',
    incorporationCountry: 'GB',
    registrationNumber: 'DEMO-GB-0002',
    entityType: 'Private company limited by shares',
  },
  {
    id: '00000000-0000-4000-8000-00000000c003',
    legalName: 'Kestrel Pay Nigeria Ltd',
    incorporationCountry: 'NG',
    registrationNumber: 'DEMO-NG-0003',
    entityType: 'Private company limited by shares',
  },
] as const;

/** Throws unless this is plainly a development database. Runs before any connection opens. */
export function assertSeedAllowed(nodeEnv: string | undefined, databaseUrl: string | undefined): void {
  if (nodeEnv === 'production') {
    throw new Error('Refusing to seed: NODE_ENV is production. Demo data must never reach a real database.');
  }
  if (nodeEnv !== undefined && nodeEnv !== 'development' && nodeEnv !== 'test') {
    throw new Error(`Refusing to seed: unknown NODE_ENV "${nodeEnv}".`);
  }
  if (!databaseUrl) throw new Error('Refusing to seed: DATABASE_URL is not set.');
  const host = new URL(databaseUrl).hostname;
  if (host !== 'localhost' && host !== '127.0.0.1' && host !== '[::1]') {
    throw new Error('Refusing to seed: the database is not on this machine.');
  }
}

/** Safe to run repeatedly. Existing demo rows are left as they are. */
export async function seedDemoData(db: Database): Promise<void> {
  await db.withSystem(async (tx) => {
    await tx
      .insert(schema.user)
      .values({ id: DEMO_USER_ID, email: DEMO_EMAIL, name: 'Amara Okafor' })
      .onConflictDoNothing();

    await enterOrg(tx, DEMO_ORGANISATION_ID);
    await tx
      .insert(schema.organisation)
      .values({ id: DEMO_ORGANISATION_ID, name: 'Kestrel Pay (demo)', isDemo: true })
      .onConflictDoNothing();
    await tx
      .insert(schema.membership)
      .values({ organisationId: DEMO_ORGANISATION_ID, userId: DEMO_USER_ID, role: 'owner' })
      .onConflictDoNothing();

    for (const demo of DEMO_COMPANIES) {
      await tx
        .insert(schema.company)
        .values({ ...demo, organisationId: DEMO_ORGANISATION_ID, stage: 'seed', sector: ['fintech'], createdBy: DEMO_USER_ID })
        .onConflictDoNothing();
      await tx
        .insert(schema.companyMarket)
        .values({
          organisationId: DEMO_ORGANISATION_ID,
          companyId: demo.id,
          country: demo.incorporationCountry,
          kind: 'operates',
        })
        .onConflictDoNothing();
    }
  });
}
