/** Applies SQL migrations as the migrator role. */
import { loadLocalEnv } from '../apps/api/src/config';
import { runMigrations } from '../apps/api/src/db/migrate';
import { syncReferenceData } from '../apps/api/src/db/reference-sync';

loadLocalEnv();
const url = process.env.DATABASE_MIGRATOR_URL;
if (!url) throw new Error('DATABASE_MIGRATOR_URL is not set.');

const { applied, skipped } = await runMigrations(url);
for (const file of applied) console.log(`applied  ${file}`);
console.log(`${applied.length} applied, ${skipped.length} already in place.`);
const synced = await syncReferenceData(url);
console.log(`Reference data: ${synced.rulePacks} rule packs, ${synced.rules} rules, ${synced.vaultSlots} vault slots, ${synced.questions} questions.`);
