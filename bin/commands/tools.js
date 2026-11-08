/**
 * @file bin/commands/tools.js
 * @description `flet-box tools` — the diagnosis toolkit, printed as a map.
 *
 * The catalogue lives in `bin/utils/toolkit.js` and is pure data. This file is
 * its human mouth: the question each tool answers, the exact command, and what
 * it reads or writes. `--emit` writes the same list to `.fletbox/api/tools.json`
 * so an assistant that cannot run a shell can still discover it, and `--json`
 * prints it for a script.
 *
 * Node core only: this file ships inside every app `flet-box create` builds.
 */

import fs from "node:fs";
import path from "node:path";
import { TOOLS, catalogJson, CATALOG_VERSION } from "../utils/toolkit.js";
import { c, banner, section } from "../utils/colors.js";

/**
 * The `flet-box tools` command.
 *
 * @param {string[]} argv Flags after the command name.
 * @param {{print?: (line: string) => void, root?: string}} [io]
 * @returns {Promise<{exitCode: number}>}
 */
export const tools = async(argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const rootIndex = argv.indexOf("--root");
  const root = path.resolve(
    rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : io.root || process.cwd(),
  );

  if (argv.includes("--emit")) {
    const dir = path.join(root, ".fletbox", "api");
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, "tools.json");
    fs.writeFileSync(target, `${JSON.stringify(catalogJson(), null, 2)}\n`, "utf8");
    print(`${c("green", "✅")} Wrote ${path.relative(root, target)} — ${TOOLS.length} read-only tool(s)`);
    return { exitCode: 0 };
  }

  if (argv.includes("--json")) {
    print(JSON.stringify(catalogJson(), null, 2));
    return { exitCode: 0 };
  }

  print(banner("🧰 FletBox toolkit", `${TOOLS.length} read-only tool(s) · catalogue v${CATALOG_VERSION}`));
  print(
    c(
      "gray",
      "  Pick the question you have; the command under it is the answer. Nothing here edits, deletes or publishes.",
    ),
  );

  for (const tool of TOOLS) {
    print("");
    print(`  ${c("brightCyan", tool.id.padEnd(16))} ${c("bold", tool.question)}`);
    print(`  ${c("gray", " ".repeat(16))} ${c("brightWhite", tool.usage)}`);
    print(
      `  ${c("gray", " ".repeat(16))} output: ${tool.output.join(", ")}` +
        (tool.writes.length ? ` · writes: ${tool.writes.join("; ")}` : ` · ${c("green", "writes nothing")}`),
    );
    for (const when of tool.when) print(`  ${c("gray", " ".repeat(16))} · ${c("gray", when)}`);
  }

  print("");
  print(section("•", "as data", "#67e8f9"));
  print(`  ${c("gray", "flet-box tools --emit          →")} .fletbox/api/tools.json`);
  print(`  ${c("gray", "flet-box tools --json          →")} the same catalogue on stdout`);
  print(
    `  ${c("gray", "flet-box mcp                   →")} the same tools over MCP stdio, for an assistant without a shell`,
  );
  return { exitCode: 0 };
};

export default tools;
