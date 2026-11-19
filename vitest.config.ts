import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

/**
 * One Vitest project per workspace package that has a vitest.config.ts. New packages are
 * picked up automatically; empty folders such as apps/web are skipped.
 */
function workspaceProjects(): string[] {
  const projects: string[] = ['scripts'];
  for (const parent of ['apps', 'packages']) {
    for (const name of readdirSync(parent)) {
      const dir = `${parent}/${name}`;
      if (existsSync(`${dir}/package.json`) && existsSync(`${dir}/vitest.config.ts`)) {
        projects.push(dir);
      }
    }
  }
  return projects;
}

export default defineConfig({
  test: { projects: workspaceProjects() },
});
