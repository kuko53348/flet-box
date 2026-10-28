// scripts/verify.mjs
//
// The repo-root entry for `npm run verify`.
//
// The runner lives in `bin/commands/verify.js` because it ships inside every
// app `flet-box create` builds — the same command has to answer "may I say
// this is done?" in a generated app and in this checkout. This file only
// points it at the repository root.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { verify } from "../bin/commands/verify.js";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const { exitCode } = await verify(process.argv.slice(2), { root: repoRoot });
process.exit(exitCode);
