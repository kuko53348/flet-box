// bin/utils/contract.js
//
// `AGENTS_FOR_CODE_GEN.md` at the package root is the ONLY source for the
// code-generation contract. `flet-box create` copies it into every app it
// builds, the same way it copies the skills: one copy of the text, so an
// editor, a diff and the app's own agent all read the same bytes.
//
// Node core only: `bin/` may not import a devDependency at module scope.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** The file name the contract carries inside a generated app. */
export const CONTRACT_FILE = "AGENTS_FOR_CODE_GEN.md";

/** Absolute path of the shipped contract. */
export const contractPath = () => path.join(packageDir, CONTRACT_FILE);

/**
 * The contract text.
 * @throws when the file is missing — a missing contract is a build error, not a
 * silent skip, or the app ships with half the rules and nobody notices.
 */
export const readContract = () => fs.readFileSync(contractPath(), "utf8");
