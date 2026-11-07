# The AI toolkit

A FletBox project ships with ten checkers, and each one is right about its own
slice: the API gate knows the prop is invented, the design gate knows the
spacing is off-scale, the type gate knows the editor is unhappy. What an
assistant lacks is not another checker — it is a **map from the question in front
of it to the command that answers it**, and one report that puts every answer on
the same page.

This chapter is that map. Three commands share one catalogue:

| Command | What it is for |
| --- | --- |
| `flet-box tools` | the map: every tool, the question it answers, the exact command |
| `flet-box report` | the diagnosis: every file of *this* project, its verdict, and what to do next |
| `flet-box mcp` | the same catalogue over MCP stdio, for an assistant with no shell |

All three are **read-only**. None of them edits a source, renames a prop, runs a
repair, builds or publishes. The single file they can produce is the report's
own HTML page, and only when `--html` asks for it.

## The map: `flet-box tools`

```bash
flet-box tools            # the catalogue, printed as a map
flet-box tools --json     # the same catalogue on stdout, for a script
flet-box tools --emit     # write .fletbox/api/tools.json into the project
```

Each entry carries the question in the words a person uses when they are stuck,
the command, its arguments, its output formats, whether it writes anything, and
the moments it applies. The nine tools are:

| id | Question it answers |
| --- | --- |
| `report` | Where is the work? Which file is wrong, how wrong, what is missing? |
| `widget_props` | Which props does this widget really accept, with types and deprecations? |
| `widget_contract` | Do declaration, engine and docs agree — and which props are dead? |
| `list_widgets` | What exists in this version of the framework? |
| `check` | Is any widget, prop or import invented? |
| `design` | Are the tokens, the scale, tap targets, labels and contrast legal? |
| `syntax` | Does every module parse? |
| `types` | What does the editor complain about? |
| `metrics` | Which mistakes keep coming back, and does a rule own each one? |

The catalogue is one file of pure data (`bin/utils/toolkit.js`). The CLI prints
it, the report links every finding back to the tool that proves it, and the MCP
server exposes the same entries — one source, three mouths. A tool that is
missing from that file does not exist for any of them, which is what keeps the
three from drifting apart.

## The diagnosis: `flet-box report`

`flet-box verify` answers a yes/no question — *may I say this is done* — gate by
gate, because that is what an exit code needs. An assistant that is **lost**
needs the other reading of the same facts: not which gate failed, but which file
is wrong, how wrong, and which one thing to do next.

```bash
flet-box report                      # text, in the terminal
flet-box report --json               # the whole report as data
flet-box report --md                 # Markdown, to paste or commit
flet-box report --html               # .fletbox/reports/report.html
flet-box report --html --out /tmp/report.html
flet-box report --tests              # also run the project's own suites
```

The command runs the six static gates once — `syntax`, `api`, `types`, `ui`,
`structure`, `surface` — and then **re-groups their findings by file**, because
the file is what the reader opens. Three decisions make it a tool rather than
another number:

1. **Every file is named**, clean ones included, with its line count, its
   verdict, and the widgets it imports. A report that lists only the failures
   cannot tell "this file is fine" from "this file was not read".
2. **Every finding carries a next step and a rule.** A code with no suggestion
   is printed with the tool that proves it instead — "something is wrong
   somewhere" is not a finding.
3. **It writes no metrics row.** A diagnostic must not change the record it is
   diagnosing; only `verify` owns
   `.fletbox/metrics/generations.md`.

The text report reads in this order:

```
🩺 FletBox report · my-app · flet-box@1.1.2 · read-only

  files: 12 clean · 0 with findings
  0 error(s), 0 warning(s) · 24 widgets, 0 with contract gaps

  ✓ syntax    clean
  ✓ api       clean
  ✓ types     clean
  ✓ ui        clean
  ✓ structure clean
  ✓ surface   clean
```

When something is wrong, a ranked **next** list follows, one line per finding:
the file at `line:column`, the code, the message, the fix, and the rule that
owns it. Then the files that are not clean (with their widgets), any findings
that name the installed package rather than your code — the framework's own
debt, kept separate on purpose — the widget contract ledger, and the metrics
line.

The HTML page carries the same report in one self-contained file: inline CSS,
no `<script>`, no network request. It opens offline, in any browser, and every
value is escaped, so a report about code is safe to open even when that code
contains markup.

The exit code is `1` when the report has errors, so `flet-box report` can stand
in for `flet-box verify` in a script that only needs the verdict.

## The server: `flet-box mcp`

An assistant with no shell cannot run `flet-box report`. `flet-box mcp` serves
the same catalogue over MCP stdio — newline-delimited JSON-RPC 2.0 on stdin and
stdout — so the same nine tools are callable without a terminal:

```bash
flet-box mcp
```

It answers `initialize`, `ping`, `tools/list` and `tools/call`. Two request
lines are enough to see it work:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"report","arguments":{"root":"."}}}
```

Every tool result is text (the same text the CLI prints), so an editor or an
agent reads exactly what a person would read. A missing required argument or a
directory that does not exist comes back as a result with `isError: true`; an
unknown tool name is a JSON-RPC error (`-32602`). Neither is a crash, and
neither can be mistaken for an answer. When stdin closes behind a slow request,
the server finishes it before exiting — a one-shot client gets its answer.

The server **never** calls the logging path: it runs the gates, not `verify`, so
asking a question through MCP cannot add a row to the metrics log either.

## Where to plug it in

- In an app's `package.json`, keep the catalogue current next to the API files:
  `flet-box tools --emit` beside `flet-box unpack --all --md`.
- Commit `.fletbox/api/tools.json`: it is the map an assistant reads when it
  cannot run a command.
- Treat `.fletbox/reports/` as generated output — a page you open, not a file
  you review. Recreate it with `flet-box report --html`.
- Register `flet-box mcp` as an MCP server if your editor supports one; the
  project path is the only argument it needs.

The loop stays the one the other chapters teach: `flet-box report` to find the
work, the named command to understand it, `npm run verify` to prove the fix.
The toolkit only removes the guess about **which** command answers the question
you have.

---

## Continue reading

- **Previous:** [Migrate an app to a newer FletBox](migration.md) — Chapter 14
- **Next:** [Minify and protect a FletBox build](minification-and-protection.md) — Appendix A
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 15 · The AI toolkit**.
