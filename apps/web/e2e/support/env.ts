import { resolve } from 'node:path';

export const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');
export const WEB_DIR = resolve(REPO_ROOT, 'apps', 'web');
export const API_DIR = resolve(REPO_ROOT, 'apps', 'api');

/** Its own database and ports, so a run never touches `npm run db:start` or a dev server. */
export const PG_PORT = 54339;
export const API_PORT = 4174;
export const WEB_PORT = 3100;
export const WEB_URL = `http://localhost:${WEB_PORT}`;
export const API_URL = `http://127.0.0.1:${API_PORT}`;
export const PG_DIR = resolve(REPO_ROOT, '.data', 'e2e', 'pg');
export const PIDS_FILE = resolve(WEB_DIR, 'e2e', '.out', 'pids.json');

const SUPER_PASSWORD = 'e2e-only-superuser-password';
const APP_PASSWORD = 'e2e-only-app-password';
const MIGRATOR_PASSWORD = 'e2e-only-migrator-password';

export const SUPERUSER_BOOTSTRAP_URL = `postgres://postgres:${SUPER_PASSWORD}@localhost:${PG_PORT}/postgres`;
export const SUPERUSER_URL = `postgres://postgres:${SUPER_PASSWORD}@localhost:${PG_PORT}/vero`;
export const APP_URL = `postgres://vero_app:${APP_PASSWORD}@localhost:${PG_PORT}/vero`;
export const MIGRATOR_URL = `postgres://vero_migrator:${MIGRATOR_PASSWORD}@localhost:${PG_PORT}/vero`;
export { SUPER_PASSWORD };

/** What the API runs with during end-to-end tests. Limits are lifted: many sign-ins come from one address. */
export function apiEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: 'development',
    CONNECTOR_MODE: 'fixture',
    LOG_LEVEL: 'warn',
    API_HOST: '127.0.0.1',
    API_PORT: String(API_PORT),
    API_BASE_URL: API_URL,
    WEB_BASE_URL: WEB_URL,
    ALLOWED_ORIGINS: WEB_URL,
    DATABASE_URL: APP_URL,
    DATABASE_MIGRATOR_URL: MIGRATOR_URL,
    EMBEDDED_PG_PORT: String(PG_PORT),
    EMBEDDED_PG_SUPERUSER_PASSWORD: SUPER_PASSWORD,
    LOCAL_FILE_DIR: '.data/e2e/files',
    PLAN_OVERRIDE: '',
    RATE_LIMIT_GLOBAL_PER_MINUTE: '100000',
    RATE_LIMIT_MAGIC_LINK_PER_EMAIL_PER_HOUR: '1000',
    RATE_LIMIT_MAGIC_LINK_PER_IP_PER_HOUR: '100000',
    RATE_LIMIT_VERIFY_PER_IP_PER_15_MIN: '100000',
    RATE_LIMIT_TOTP_PER_USER_PER_15_MIN: '1000',
    RATE_LIMIT_REGISTRY_SEARCH_PER_ORG_PER_HOUR: '100000',
    RATE_LIMIT_CHECK_AGAIN_PER_COMPANY_PER_HOUR: '1000',
    RATE_LIMIT_PUBLIC_PER_IP_PER_MINUTE: '100000',
  };
}

export function webEnv(): NodeJS.ProcessEnv {
  return { ...process.env, NODE_ENV: 'production', API_INTERNAL_URL: API_URL };
}
