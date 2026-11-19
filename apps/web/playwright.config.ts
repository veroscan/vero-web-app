import { defineConfig, devices } from '@playwright/test';
import { WEB_URL } from './e2e/support/env';

/**
 * End-to-end against the real thing: real Postgres, the real API in fixture mode, and a real
 * production build of the web app. global-setup starts them all and global-teardown stops them.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.out/results',
  globalSetup: './e2e/support/global-setup.ts',
  globalTeardown: './e2e/support/global-teardown.ts',
  timeout: 180_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  // One at a time: a run also holds Postgres, the API and a Next.js server on one machine.
  workers: 1,
  forbidOnly: true,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: WEB_URL,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'app', testIgnore: ['**/compare.spec.ts'] },
    // Only when asked for: npm run e2e -- --project=compare
    { name: 'compare', testMatch: ['**/compare.spec.ts'] },
  ],
});
