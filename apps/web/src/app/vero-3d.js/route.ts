import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * Serves the approved 3D script from docs/design, so there is one copy of it. It isn't placed
 * in public/ because ESLint would then lint a 650 KB bundle. Only screens with a V load it.
 */
export async function GET(): Promise<Response> {
  const file = await readFile(resolve(process.cwd(), '..', '..', 'docs', 'design', 'vero-3d.js'));
  return new Response(file, {
    headers: {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
