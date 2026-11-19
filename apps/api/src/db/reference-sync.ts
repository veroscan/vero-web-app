import { createHash } from 'node:crypto';
import { JURISDICTIONS, loadPack, QUESTIONNAIRE, QUESTIONNAIRE_VERSION, vaultSlotsFor, type Pack } from '@vero/rules';
import pg from 'pg';

// Every pack in @vero/rules, the International pack included. Each needs its row in `jurisdiction`.

/**
 * A pack's fingerprint: what an approval is given for. The lawyer review pack
 * (`npm run rules:review`) prints the same value, so a reviewer approves exactly what runs.
 */
export function packContentHash(pack: Pick<Pack, 'rules'>): string {
  return createHash('sha256').update(JSON.stringify(pack.rules)).digest('hex');
}

export interface ReferenceSyncResult {
  rulePacks: number;
  rules: number;
  vaultSlots: number;
  questions: number;
}

/**
 * Copies the rule packs, vault slots and questionnaire from @vero/rules into their reference
 * tables, so findings, documents and answers can point at them. Runs as the migrator right
 * after migrations, because the API role can't write reference data. Safe to run repeatedly.
 *
 * It never touches a pack's status: a new pack is always draft, and only the admin route can
 * approve one. An approved pack whose content changed stops the run, because that pack's
 * approval no longer covers what would be running. Bump the version instead.
 */
export async function syncReferenceData(migratorUrl: string): Promise<ReferenceSyncResult> {
  const client = new pg.Client({ connectionString: migratorUrl });
  await client.connect();
  const result: ReferenceSyncResult = { rulePacks: 0, rules: 0, vaultSlots: 0, questions: 0 };
  try {
    await client.query('BEGIN');

    for (const jurisdiction of JURISDICTIONS) {
      const pack = loadPack(jurisdiction);
      const contentHash = packContentHash(pack);
      const existing = await client.query<{ id: string; status: string; content_hash: string | null }>(
        'SELECT id, status, content_hash FROM rule_pack WHERE jurisdiction_code = $1 AND version = $2',
        [jurisdiction, pack.version],
      );
      const found = existing.rows[0];
      if (found && found.status === 'approved' && found.content_hash !== contentHash) {
        throw new Error(`Rule pack ${jurisdiction} ${pack.version} is approved, but its content changed. Bump its version.`);
      }
      const packId = found
        ? found.id
        : (
            await client.query<{ id: string }>(
              'INSERT INTO rule_pack (jurisdiction_code, version, content_hash) VALUES ($1, $2, $3) RETURNING id',
              [jurisdiction, pack.version, contentHash],
            )
          ).rows[0]?.id;
      if (!packId) throw new Error('Could not record the rule pack');
      await client.query('UPDATE rule_pack SET content_hash = $2 WHERE id = $1', [packId, contentHash]);
      result.rulePacks += 1;

      for (const rule of pack.rules) {
        await client.query(
          `INSERT INTO rule (rule_pack_id, rule_key, layer, area, definition, severity, confidence, effective_from, effective_to)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (rule_pack_id, rule_key) DO UPDATE
             SET layer = EXCLUDED.layer, area = EXCLUDED.area, definition = EXCLUDED.definition,
                 severity = EXCLUDED.severity, confidence = EXCLUDED.confidence,
                 effective_from = EXCLUDED.effective_from, effective_to = EXCLUDED.effective_to`,
          [packId, rule.id, rule.layer, rule.area, JSON.stringify(rule), rule.severity, rule.confidence, rule.effective_from, rule.effective_to],
        );
        result.rules += 1;
      }

      for (const slot of vaultSlotsFor(jurisdiction)) {
        if (slot.jurisdiction !== jurisdiction) continue;
        await client.query(
          `INSERT INTO vault_slot (layer, key, title, description, required_when)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (key) DO UPDATE
             SET layer = EXCLUDED.layer, title = EXCLUDED.title, description = EXCLUDED.description,
                 required_when = EXCLUDED.required_when`,
          [slot.layer, slot.id, slot.label, slot.reason, JSON.stringify({ rule_ids: slot.rule_ids, jurisdiction: slot.jurisdiction, expires: slot.expires })],
        );
        result.vaultSlots += 1;
      }
    }

    const set = await client.query<{ id: string }>(
      `INSERT INTO question_set (version) VALUES ($1)
       ON CONFLICT (version) DO UPDATE SET version = EXCLUDED.version RETURNING id`,
      [QUESTIONNAIRE_VERSION],
    );
    const setId = set.rows[0]?.id;
    for (const question of QUESTIONNAIRE) {
      for (const field of question.fields) {
        // One row per field, because a field is what holds an answer.
        await client.query(
          `INSERT INTO question (question_set_id, key, type, options, show_if)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (question_set_id, key) DO UPDATE
             SET type = EXCLUDED.type, options = EXCLUDED.options, show_if = EXCLUDED.show_if`,
          [setId, field.id, field.type, field.options ? JSON.stringify(field.options) : null, field.show_when === undefined ? null : JSON.stringify(field.show_when)],
        );
        result.questions += 1;
      }
    }

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
