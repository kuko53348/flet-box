# Environment and detector traps (FletBox audit work)

Verified in the flet-box checkout on macOS/zsh.

## Shell

- `timeout` does **not** exist on macOS/zsh: `(eval):1: command not found: timeout`. Bound a
  probe with an in-process `Promise.race` + `setTimeout` instead (`lib.mjs` → `withTimeout`),
  and give the Bash tool a generous `timeout` parameter rather than a shell command.
- `grep --include=*.js` breaks under zsh before reaching grep:
  `no matches found: --include=*.js`. Use the Grep tool (`glob: "**/*.js"`), or quote the
  pattern. This error looks like "no results" and can be mistaken for a negative finding.
- Absolute path assumptions: navigations are in `src/navigations/` (`AppBar.js`,
  `BottomNavigation.js`, `Scaffold.js`, `Router.js`), not `src/widgets/`; `clipboard` and the
  other utilities live in `src/tools/`, not `src/utils/`. Grep the wrong directory and you get
  `No such file or directory`, which is easy to misread as "the prop is unimplemented".

## JavaScript inside template literals

- A template literal **cannot contain an unescaped backtick**. Building a regex that matches
  `` ` `` inside a `` `...` `` literal throws `SyntaxError` at load time, pointing at a line
  that looks innocent. Build such patterns by **string concatenation** with the backtick in a
  single-quoted string — this is why `readInSource()` in `scripts/check-snippets.mjs` and in
  `doc-table-audit.mjs` uses `QUOTE_CHARS + id + QUOTE_CHARS` instead of interpolation.
- Same rule applies to nested `${`: escape it (`\\${`) when the generated file must contain it.

## Probes

- Test pages cannot open over `file://` (ESM + CORS). Serve the repo through a static server
  and load a blank `/__probe__` page from it, so `await import("/src/index.js")` resolves
  against the served origin. `about:blank` has no base URL — the dynamic import just fails.
- Puppeteer is not a dependency of this repo. Resolve it exactly like
  `scripts/run-browser-tests.mjs`: `$FLETBOX_PUPPETEER`, `./node_modules/puppeteer`,
  `../flet-box-server/node_modules/puppeteer`; browser via `$FLETBOX_CHROME` then the usual
  install paths. When either is missing, **skip with exit 0** and say so; never fail the audit
  because a probe could not run.
- Import puppeteer through its ESM entry:
  `import(join(pkgDir, "lib", "esm", "puppeteer", "puppeteer.js"))` (`default` export).
- Widgets mount overlays (SnackBar, Modal, BottomSheet) onto `document.body`. Clear
  `document.body.innerHTML` after every snippet body, otherwise one widget's DOM changes the
  measurements attributed to the next one.
- Neutralize `setInterval` and `fetch` inside the probe page — otherwise animated widgets spin
  forever and networked examples (AdMob) turn an audit into real requests.
- Batch the evaluation and race each batch against a timer, falling back to
  `"timeout / infinite loop"` for the batch. One looping widget must not hang the run.

## Detector blind spots (why 0 is not a result)

- `check-prop-registry.mjs` only sees props its own fixtures pass. A prop declared in
  `index.d.ts` and read by nothing produces `UNKNOWN=0 DROPPED=0` while being a phantom in
  every docs page. Confirm the detector bites (negative control) before reporting 0.
- `check-snippets.mjs --dir <scratch>` reads `FletBox.json` and the three category files from
  that directory. Scrub a symbol from **one** category file and `AGGREGATE_DRIFT` fires while
  `UNCOVERED_*` stays 0; scrub all four and the coverage level bites. An absent finding after a
  partial scrub is masking, not health.
- `UNCOVERED_EXPORT` matches the symbol against **all** snippet bodies, so an export named in
  prose inside some other example counts as covered. `UNCOVERED_PROP` requires that the prop be
  "live" first (typed, or read as `.p`, `p =`, `["p"]`), so registry `DEAD` props are skipped by
  design — cross-check the two lists instead of assuming coverage.
- A prop read as an object **key** (`language:`) is a write, not a read; the strict read
  patterns exist precisely because of that false positive.
