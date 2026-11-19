import pg from 'pg';

export const APP_ROLE = 'vero_app';

export interface BootstrapOptions {
  /** Superuser connection to the maintenance database. */
  superuserUrl: string;
  /** Holds the migrator's role name, password and the database name. */
  migratorUrl: string;
  /** Holds the API role's name and password. The role must be called vero_app. */
  appUrl: string;
}

/**
 * Creates the two roles and the database. Safe to run repeatedly.
 *
 * Neither role is a superuser and neither can bypass row-level security. The migrator owns
 * the schema. The API role owns nothing, which is what keeps it from disabling a policy.
 */
export async function bootstrapDatabase(options: BootstrapOptions): Promise<void> {
  const migrator = new URL(options.migratorUrl);
  const app = new URL(options.appUrl);
  const databaseName = migrator.pathname.slice(1);
  const migratorRole = decodeURIComponent(migrator.username);
  const appRole = decodeURIComponent(app.username);
  if (appRole !== APP_ROLE) {
    throw new Error(`The API role must be named ${APP_ROLE}, because migrations grant to it. Got: ${appRole}`);
  }

  const client = new pg.Client({ connectionString: options.superuserUrl });
  await client.connect();
  try {
    const ensureRole = async (role: string, password: string, extra: string): Promise<void> => {
      const exists = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [role]);
      const verb = exists.rowCount ? 'ALTER' : 'CREATE';
      await client.query(
        `${verb} ROLE ${client.escapeIdentifier(role)} LOGIN NOSUPERUSER NOBYPASSRLS NOREPLICATION ${extra} PASSWORD ${client.escapeLiteral(password)}`,
      );
    };
    await ensureRole(migratorRole, decodeURIComponent(migrator.password), 'NOCREATEROLE NOCREATEDB');
    await ensureRole(appRole, decodeURIComponent(app.password), 'NOCREATEROLE NOCREATEDB');

    const hasDatabase = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (!hasDatabase.rowCount) {
      await client.query(
        `CREATE DATABASE ${client.escapeIdentifier(databaseName)} OWNER ${client.escapeIdentifier(migratorRole)}`,
      );
    }
    await client.query(`REVOKE ALL ON DATABASE ${client.escapeIdentifier(databaseName)} FROM PUBLIC`);
    await client.query(
      `GRANT CONNECT ON DATABASE ${client.escapeIdentifier(databaseName)} TO ${client.escapeIdentifier(appRole)}`,
    );
  } finally {
    await client.end();
  }
}
