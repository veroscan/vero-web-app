// Runs after `npm install`. Next.js lists `sharp` (image optimisation) as an optional dependency. This site exports
// its images unoptimised, so sharp is never loaded, and its prebuilt libvips binaries are LGPL-3.0, which the project
// does not allow. Removing them keeps the installed tree to MIT/Apache/ISC-style licences.
import { rmSync } from "node:fs";

for (const dir of ["node_modules/sharp", "node_modules/@img"]) {
  rmSync(dir, { recursive: true, force: true });
}
