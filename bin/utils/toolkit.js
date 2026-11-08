/**
 * @file bin/utils/toolkit.js
 * @description The diagnosis toolkit, as data — one entry per question an agent
 * may ask, and the command that answers it.
 *
 * The problem this file solves is not "there are no checkers". There are ten,
 * and each one is right about its own slice. The problem is that an agent does
 * not know which one to run for the question in front of it, so it runs the one
 * it remembers and reports a number that answers something else.
 *
 * So the tools are listed here with the question each one answers, in the
 * language a person uses when they are stuck, and every entry names the exact
 * command. The CLI prints this list (`flet-box tools`), the report links every
 * finding back to the tool that proves it, and the MCP server (`flet-box mcp`)
 * exposes the same entries to an assistant that has no shell. One source, three
 * mouths.
 *
 * The rule for membership: a tool in this catalogue **reads**. No entry may
 * repair, rename, delete, build or write — those are decisions, and the assistant
 * asks a human before taking one. `writes` is therefore empty on every entry;
 * the field exists so a future write tool cannot be added silently.
 *
 * Pure data: this module imports nothing. Renderers live in
 * `bin/commands/tools.js` and `bin/mcp.js`.
 */

/** Bumped only when an entry's shape changes, so a cached copy can be noticed. */
export const CATALOG_VERSION = 2;

/**
 * Every read-only tool, ordered from "where do I start" to "one narrow check".
 *
 * `params` is the JSON-Schema source used by the MCP server:
 * `{ name, type: "string"|"boolean", required?, description }`.
 */
export const TOOLS = [
  {
    id: "report",
    title: "Project report",
    question: "Where is the work? Which file is wrong, how wrong, and what is missing?",
    cli: "flet-box report",
    usage: "flet-box report [--json | --md | --html] [--tests]",
    output: ["text", "json", "md", "html"],
    writes: ["--html only: .fletbox/reports/report.html (or --out <file>)"],
    params: [
      { name: "tests", type: "boolean", description: "Also run the project's own test scripts (slow)." },
      { name: "root", type: "string", description: "Project folder; defaults to the current directory." },
    ],
    when: [
      "after any edit, before saying the work is done",
      "when a screen renders but is wrong and the file is not obvious",
      "when the user asks what is missing or what to do next",
    ],
  },
  {
    id: "widget_props",
    title: "Widget props",
    question: "Which props does this widget really accept, with types and deprecations?",
    cli: "flet-box check-api --props <Widget>",
    usage: "flet-box check-api --props Text",
    output: ["text"],
    writes: [],
    params: [
      { name: "widget", type: "string", required: true, description: "Widget name, e.g. Text or Container." },
      { name: "root", type: "string", description: "Project folder; defaults to the current directory." },
    ],
    when: ["before writing a call", "when a prop silently does nothing", "when the cheatsheet looks wrong"],
  },
  {
    id: "widget_contract",
    title: "Widget contract",
    question: "Do the declaration, the engine and the docs agree about this widget — and which props are dead?",
    cli: "flet-box unpack <Widget> --json",
    usage: "flet-box unpack Text --json",
    output: ["text", "json"],
    writes: [],
    params: [
      { name: "widget", type: "string", required: true, description: "Widget name, e.g. Text or Container." },
      { name: "root", type: "string", description: "Project folder; defaults to the current directory." },
    ],
    when: ["when a prop is typed but does nothing", "when reading the framework's own gaps"],
  },
  {
    id: "list_widgets",
    title: "List widgets",
    question: "What exists in this version of the framework?",
    cli: "flet-box check-api --list",
    usage: "flet-box check-api --list",
    output: ["text"],
    writes: [],
    params: [{ name: "root", type: "string", description: "Project folder; defaults to the current directory." }],
    when: ["before inventing a name", "when unsure whether a helper is real"],
  },
  {
    id: "check",
    title: "API check",
    question: "Is any widget, prop or import invented?",
    cli: "flet-box check-api",
    usage: "flet-box check-api [--json] [--full]",
    output: ["text", "json"],
    writes: [],
    params: [
      { name: "full", type: "boolean", description: "List every warning site instead of collapsing repeated ones." },
      { name: "root", type: "string", description: "Project folder; defaults to the current directory." },
    ],
    when: ["when a screen is blank or a widget renders nothing", "after copying code from another project"],
  },
  {
    id: "design",
    title: "Design check",
    question: "Are the tokens, the scale, the tap targets, the labels and the contrast legal?",
    cli: "flet-box check-ui",
    usage: "flet-box check-ui [--json] [--strict] [--tokens]",
    output: ["text", "json"],
    writes: [],
    params: [
      { name: "tokens", type: "boolean", description: "Print the measured contrast of every colour token and exit." },
      { name: "strict", type: "boolean", description: "Fail on contrast warnings too." },
      { name: "root", type: "string", description: "Project folder; defaults to the current directory." },
    ],
    when: ["after building or editing a screen", "when the user says it looks off"],
  },
  {
    id: "syntax",
    title: "Parse check",
    question: "Does every module parse?",
    cli: "flet-box verify --only syntax --no-tests",
    usage: "flet-box verify --only syntax --no-tests [--json]",
    output: ["text", "json"],
    writes: [],
    params: [{ name: "root", type: "string", description: "Project folder; defaults to the current directory." }],
    when: ["when the app is blank and the console says nothing", "before blaming the framework"],
  },
  {
    id: "types",
    title: "Type check",
    question: "What does the editor complain about?",
    cli: "flet-box verify --only types --no-tests",
    usage: "flet-box verify --only types --no-tests [--json]",
    output: ["text", "json"],
    writes: [],
    params: [{ name: "root", type: "string", description: "Project folder; defaults to the current directory." }],
    when: ["when a widget method or prop is flagged in the editor", "after upgrading the package"],
  },
  {
    id: "lint",
    title: "Lint rules",
    question: "Which mechanical style rules does this file break (tabs, trailing whitespace, CRLF, final newline)?",
    cli: "flet-box lint",
    usage: "flet-box lint [--json] [--root <dir>]",
    output: ["text", "json"],
    writes: [],
    params: [{ name: "root", type: "string", description: "Project folder; defaults to the current directory." }],
    when: ["when a diff shows whitespace-only churn", "when a file renders fine but CI is red on style"],
  },
  {
    id: "format",
    title: "Format check",
    question: "Which files are not in canonical form?",
    cli: "flet-box format",
    usage: "flet-box format [--json] [--root <dir>]",
    output: ["text", "json"],
    writes: [],
    params: [{ name: "root", type: "string", description: "Project folder; defaults to the current directory." }],
    when: ["when two people edit one file and diff against each other", "before running the full verify"],
  },
  {
    id: "metrics",
    title: "Recurring failures",
    question: "Which mistakes keep coming back, and does a rule own each one?",
    cli: "flet-box metrics",
    usage: "flet-box metrics [--log <file>]",
    output: ["text"],
    writes: [],
    params: [{ name: "root", type: "string", description: "Project folder; defaults to the current directory." }],
    when: ["when the same finding keeps returning", "when deciding which rule to write"],
  },
];

/**
 * One entry by id.
 *
 * @param {string} id
 * @returns {object|null}
 */
export const toolById = (id) => TOOLS.find((tool) => tool.id === id) || null;

/**
 * The catalogue as the JSON a tool reads: stable, relative to nothing, and with
 * the invariant stated in the payload so a consumer can assert it.
 *
 * @returns {object}
 */
export const catalogJson = () => ({
  tool: "flet-box tools",
  version: CATALOG_VERSION,
  // No entry edits a source, deletes, builds or publishes. The only file any of
  // them can produce is the report's own HTML, and only when `--html` asks.
  readOnly: true,
  tools: TOOLS.map((tool) => ({
    id: tool.id,
    title: tool.title,
    question: tool.question,
    cli: tool.cli,
    usage: tool.usage,
    output: tool.output,
    writes: tool.writes,
    // The arguments are part of the map: a reader that cannot ask the MCP
    // server still has to know that `widget_props` needs a widget name.
    params: tool.params,
    when: tool.when,
  })),
});
