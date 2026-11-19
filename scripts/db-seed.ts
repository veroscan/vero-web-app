/**
 * Adds the fictional Kestrel Pay demo organisation, then takes it through the real pipeline in
 * fixture mode. Refuses to run in production.
 */
import { composeDeps } from '../apps/api/src/compose';
import { loadConfig, loadLocalEnv } from '../apps/api/src/config';
import { assertSeedAllowed, DEMO_EMAIL } from '../apps/api/src/db/seed';
import { DEMO_ADMIN_EMAIL, DEMO_FREE_EMAIL, DEMO_LAWYER_EMAIL, seedDemoJourney } from '../apps/api/src/seed/journey';

loadLocalEnv();

// Before any connection is opened.
assertSeedAllowed(process.env.NODE_ENV, process.env.DATABASE_URL);

// The demo is fictional, so it only ever reads fixture data, whatever the local setting is.
process.env.CONNECTOR_MODE = 'fixture';
const deps = composeDeps(loadConfig());
try {
  const report = await seedDemoJourney(deps);
  console.log(report.ran ? 'Demo data ready, through the real scan pipeline.' : 'Demo data was already there, so nothing changed.');
  if (report.ran) console.log(JSON.stringify(report, null, 2));
  console.log(`Sign in as ${DEMO_EMAIL} (Growth) or ${DEMO_FREE_EMAIL} (Free). The review desk: ${DEMO_LAWYER_EMAIL} and ${DEMO_ADMIN_EMAIL}. The link appears in the API log.`);
} finally {
  await deps.queue.close();
  await deps.db.close();
}
