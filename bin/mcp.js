#!/usr/bin/env node

/**
 * @file bin/mcp.js
 * @description `flet-box mcp` — the read-only toolkit over the Model Context
 * Protocol, stdio transport.
 *
 * An assistant that can run a shell already has every tool in this package. An
 * assistant that cannot — a chat panel with no terminal, a hosted agent, an
 * editor extension — has none of them, so it guesses about the framework. This
 * server is the same catalogue with a different mouth: the nine read-only
 * entries from `bin/utils/toolkit.js`, each answered by the same function the
 * CLI calls, so the two can never disagree about what the code says.
 *
 * Read-only is not a promise in a comment; it is the shape of the code:
 *
 *   • `report` runs `buildReport`, which never writes (the HTML artifact is a
 *     CLI flag, not an MCP argument).
 *   • the gates run through `runGates`, not `verify` — `verify` appends a
 *     metrics row, and a diagnosis must not change what it measures.
 *   • `check-api`, `check-ui` and `unpack` are called without `--emit-api`,
 *     without `--fix` and without `--all` (the one `unpack` form that writes).
 *   • no executor edits, deletes, builds or publishes. `scripts/check-report.mjs`
 *     hashes the tree around every tool call to prove it.
 *
 * The transport is newline-delimited JSON-RPC 2.0 (the MCP stdio framing). Logs
 * go to stderr; stdout carries protocol messages only.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { createRequire } from "node:module";
import { TOOLS, toolById } from "./utils/toolkit.js";
import { buildReport, renderText } from "./commands/report.js";
import { runGates, formatReport } from "./commands/verify.js";
import { checkApi } from "./commands/checkApi.js";
import { checkUi } from "./commands/checkUi.js";
import { metrics } from "./commands/metrics.js";
import { unpack } from "./commands/unpack.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

/** A terminal's colours must not leak into a protocol string. */
const ANSI = /\x1b\[[0-9;]*m/g;

/**
 * Run a CLI function with its output captured.
 *
 * @param {(argv: string[], io: object) => Promise<{exitCode?: number}>} fn
 * @param {string[]} argv
 * @returns {Promise<{text: string, exitCode: number}>}
 */
const capture = async (fn, argv) => {
  const lines = [];
  const result = (await fn(argv, { print: (line) => lines.push(String(line)) })) || {};
  return {
    text: lines.join("\n").replace(ANSI, "").trim(),
    exitCode: Number(result.exitCode) || 0,
  };
};

const rootArg = (root) => ["--root", root];

/**
 * Parse JSON that a command printed, so the protocol can carry it as data too.
 *
 * @param {string} text
 * @returns {object|null}
 */
const asData = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * The executor for every catalogue entry. Each one returns the text a person
 * would read and, where the command has a JSON form, the same facts as data.
 */
const RUN = {
  report: async ({ root, tests }) => {
    const built = await buildReport({ root, tests: Boolean(tests) });
    return { text: renderText(built).join("\n"), data: built };
  },

  widget_props: async ({ root, widget }) => {
    const out = await capture(checkApi, ["--props", widget, ...rootArg(root)]);
    const missing = /is not a FletBox widget/.test(out.text);
    return { ...out, error: missing ? `no widget named "${widget}"` : null };
  },

  widget_contract: async ({ root, widget }) => {
    const out = await capture(unpack, [widget, "--json", ...rootArg(root)]);
    return { ...out, data: asData(out.text) };
  },

  list_widgets: async ({ root }) => capture(checkApi, ["--list", ...rootArg(root)]),

  check: async ({ root, full }) => {
    const out = await capture(checkApi, ["--json", ...(full ? ["--full"] : []), ...rootArg(root)]);
    return { ...out, data: asData(out.text) };
  },

  design: async ({ root, tokens, strict }) => {
    const out = await capture(checkUi, [
      "--json",
      ...(tokens ? ["--tokens"] : []),
      ...(strict ? ["--strict"] : []),
      ...rootArg(root),
    ]);
    return { ...out, data: asData(out.text) };
  },

  syntax: async ({ root }) => {
    // `runGates`, not `verify`: verify appends a metrics row, and a diagnosis
    // that changes the history it reports on is not read-only.
    const result = await runGates(root, ["syntax"]);
    return { text: formatReport(result).join("\n").replace(ANSI, ""), data: result };
  },

  types: async ({ root }) => {
    const result = await runGates(root, ["types"]);
    return { text: formatReport(result).join("\n").replace(ANSI, ""), data: result };
  },

  metrics: async ({ root }) => capture(metrics, rootArg(root)),
};

/**
 * The MCP tool descriptor for one catalogue entry.
 *
 * @param {object} tool
 * @returns {object}
 */
const descriptor = (tool) => {
  const properties = {};
  const required = [];
  for (const param of tool.params) {
    properties[param.name] = { type: param.type, description: param.description };
    if (param.required) required.push(param.name);
  }
  return {
    name: tool.id,
    title: tool.title,
    description:
      `${tool.question} Read-only: ${tool.writes.length ? `only writes on the CLI (${tool.writes.join("; ")}), never here.` : "writes nothing."}`,
    inputSchema: {
      type: "object",
      properties,
      ...(required.length ? { required } : {}),
      additionalProperties: false,
    },
  };
};

/**
 * Answer one JSON-RPC message.
 *
 * Exported so `scripts/check-report.mjs` can drive the protocol without a
 * child process; the stdio loop below is a thin wrapper over it.
 *
 * @param {object} request
 * @param {{cwd?: string}} [context]
 * @returns {Promise<object|null>} null for a notification (no reply)
 */
export const handleRequest = async (request, { cwd = process.cwd() } = {}) => {
  const { id = null, method, params = {} } = request || {};
  const reply = (result) => ({ jsonrpc: "2.0", id, result });
  const fail = (code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

  if (method === "initialize") {
    return reply({
      protocolVersion:
        typeof params.protocolVersion === "string" ? params.protocolVersion : "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "flet-box", version },
      instructions:
        "Read-only diagnosis for a FletBox project. Start with `report` when you do not know which file is wrong; `widget_props` before writing a widget call; `metrics` when the same finding keeps returning.",
    });
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled") return null;
  if (method === "ping") return reply({});
  if (method === "tools/list") return reply({ tools: TOOLS.map(descriptor) });

  if (method !== "tools/call") return fail(-32601, `unknown method: ${method}`);

  const tool = toolById(params.name);
  if (!tool) return fail(-32602, `unknown tool: ${params.name}`);
  const args = params.arguments && typeof params.arguments === "object" ? params.arguments : {};

  const missing = tool.params.filter((param) => param.required && !args[param.name]);
  if (missing.length) {
    return reply({
      content: [
        { type: "text", text: `Missing argument(s): ${missing.map((param) => param.name).join(", ")}` },
      ],
      isError: true,
    });
  }

  let root;
  try {
    root = args.root ? path.resolve(cwd, String(args.root)) : cwd;
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
      throw new Error(`no such directory: ${root}`);
    }
  } catch (error) {
    return reply({ content: [{ type: "text", text: error.message }], isError: true });
  }

  try {
    const result = await RUN[tool.id]({ ...args, root });
    if (result.error) {
      return reply({ content: [{ type: "text", text: result.text || result.error }], isError: true });
    }
    return reply({
      content: [{ type: "text", text: result.text || "(no output)" }],
      ...(result.data ? { structuredContent: result.data } : {}),
    });
  } catch (error) {
    return reply({ content: [{ type: "text", text: `${tool.id} failed: ${error.message}` }], isError: true });
  }
};

/**
 * Serve the toolkit on stdin/stdout until the client closes the pipe.
 *
 * @returns {void}
 */
export const serveStdio = () => {
  process.stderr.write(
    `flet-box mcp v${version} — ${TOOLS.length} read-only tool(s) over stdio (JSON-RPC 2.0)\n`,
  );
  const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  const write = (message) => {
    if (message) process.stdout.write(`${JSON.stringify(message)}\n`);
  };

  // stdin can close while a request is still running — `report` takes about a
  // second — and exiting on "close" would drop the answer the client is waiting
  // for. Count the work in flight and leave only when the queue is empty.
  let pending = 0;
  let closed = false;
  const finish = () => {
    if (closed && pending === 0) process.exit(0);
  };

  input.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let request;
    try {
      request = JSON.parse(trimmed);
    } catch {
      write({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } });
      return;
    }
    pending += 1;
    handleRequest(request)
      .then((message) => write(message))
      .catch((error) => {
        write({ jsonrpc: "2.0", id: request?.id ?? null, error: { code: -32603, message: error.message } });
      })
      .finally(() => {
        pending -= 1;
        finish();
      });
  });

  input.on("close", () => {
    closed = true;
    finish();
  });
};

export default serveStdio;
