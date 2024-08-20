// @ts-nocheck
// This script starts both the Next.js app and the Bun artefact server

import { $ } from "bun";

await Promise.all([
  $`bun run dev`,
  $`cd bun-artefact-server && bun run src/server.ts`,
]);
