# Pitfalls — observed, not hypothetical

Every entry below happened during the real extraction in this repo. The symptom
is what the terminal or the code showed; the fix is what made it pass.

## Toolchain

### `typescript/lib/typescript.js` does not exist in flet-box

**Symptom:** a `/tmp` scanner importing `flet-box/node_modules/typescript/lib/typescript.js`
throws `ERR_MODULE_NOT_FOUND`. The package has `lib/tsc.js`, `lib/getExePath.js`
and no `lib/typescript.js`.

**Cause:** the devDependency is TypeScript **7.0.2**, which ships the native
compiler only. The classic `createSourceFile` API lives in TypeScript 5 or older.

**Fix:** pass `--ts` (or set `FLETBOX_TS`) to any TypeScript 5-or-older
`lib/typescript.js` on the machine; the scanner also tries every sibling
checkout automatically. `ts.version` is printed in the report so the compiler in
use is never a guess.

### A scratch copy has no `node_modules`

**Symptom:** `find-duplicate-functions.mjs --root /tmp/copy` exits 2 with "no
TypeScript compiler API found".

**Cause:** the candidates are `<root>/node_modules/...` and a sibling checkout's
`node_modules/...`; `/tmp/copy` has neither.

**Fix:** pass `--ts /abs/path/to/node_modules/typescript/lib/typescript.js`.
Do not copy `node_modules` into the scratch tree.

## Reading the scan

### Line similarity is not duplication

**Symptom:** a pair report says `Checkbox.js ~ Radio.js` share 25% of their lines.

**Cause:** they share a layout (row, label, tap zone, overhang), not a function.

**Fix:** the AST scan found no identical body; they stay two widgets. Report the
pair as "similar structure, different code" so the next pass does not re-open it.

### One pass is not enough

**Symptom:** the first pass reported three groups; a second scan reported
`leaveFocusScope` ×3 (5 lines, ~110 characters) inside three overlay factories —
a fourth duplicate the first pass had not listed.

**Cause:** whatever filter the first pass applied, it did not include that
factory-local copy; the raw output is the only record, so it cannot be re-derived.

**Fix:** run `--min-lines 5` for the loud list, then `--min-lines 3` before saying
"clean", and use a scanner that walks nested functions — the second pass found a
copy declared inside each widget factory. Never declare a tree clean off one pass.

### Comment-only differences are still duplicates

**Symptom:** two bodies look different because one has a comment inside.

**Cause:** the scanner strips block and line comments before fingerprinting.

**Fix:** treat the group as a duplicate and carry the better comment into the
single home. Do not keep the copy "because it has more documentation".

### Expression-bodied arrows are one line

**Symptom:** `escapeHtml` written as `(text) => text.replace(...)` is not reported
even when copied.

**Cause:** its body is a single expression; `min-lines` counts physical body lines.

**Fix:** lower `--min-lines 1` for a one-liner sweep, or rely on the gate
(`check-shared-helpers` matches the definition shape, not a body size).

## The gate

### A bare `@keyframes` regex reports comments

**Symptom:** the first gate run failed on `AnimatedBox.js`, `focusRing.js` and
`scriptInjector.js` — all three matches were prose in JSDoc, not keyframe rules.

**Cause:** `/@keyframes/` matches documentation.

**Fix:** match the definition shape (`/@keyframes\s+\S+\s*\{/`). Where the shape
itself can appear in a comment, strip comments before matching.

### The gate needs its home to exist

**Symptom:** every rule reports a stray even after the copies are gone.

**Cause:** a `SINGLE_HOME` entry whose `home` file was moved or renamed.

**Fix:** the gate already fails with "`<home>` is missing"; move the entry with
`git mv` in the same commit, never a hand-typed path.

### A mutation that trips the wrong rule proves nothing

**Symptom:** a mutation "fails the gate" (exit 1), but the message names a rule
other than the one the mutation was meant to test.

**Cause:** the scratch copy was not green before the mutation, so any failure is
indistinguishable from the one under test. A mutation that changes nothing has
the same problem in reverse: it only looks like proof.

**Fix:** start from a clean `--root` copy (`check-shared-helpers` exits 0), apply
one mutation, and check the rule name in the output. One mutation per rule: paste
a second `escapeHtml`, a second `injectKeyframes` definition, a private four-side
resolver, a second FNV hash, a bare `@keyframes` rule in a widget, an `import`
inside `src/helpers/`.

### Bash heredoc ate the test case

**Symptom:** `/tmp/prove-shared.sh: line 27: anim-${hash(keyframes)}: bad substitution`.

**Cause:** `${...}` inside a double-quoted heredoc is expanded by the shell before
the mutation script sees it.

**Fix:** write the mutation as a `.mjs` file or use a single-quoted heredoc
(`<<'EOF'`). Prefer JS for anything that contains braces and dollar signs.

## Deciding the home

### A helper that imports is not a helper

**Symptom:** a widget importing the shared escaper pulls in six widgets.

**Cause:** the escaper lived beside `markdownParser.js`, which imports `Text`,
`DataTable`, `Container`, `Row`, `Icon`, `CodeViewer`.

**Fix:** the home imports nothing (`src/helpers/html.js`). If it needs another
module it is a service: `src/utils/`. The gate's `helpers-leaf` rule enforces
this for every file in the folder.

### A constant animation name with an option-dependent body

**Symptom:** after unifying the keyframe injector, a second glow in a different
colour played the first glow's animation.

**Cause:** `visualEffects` passed a constant name (`glow-pulse`) but built the
body from `color` and `intensity`; the document-level dedupe set kept the first
`<style>` and ignored the second body.

**Fix:** `animationName(prefix, frames)` hashes the body. Different options get
different names; identical bodies share one `<style>`. Any document-level
resource keyed by a constant needs this check.

### Deleting is an extraction when the wrapper adds nothing

**Symptom:** three overlays each carried an identical 5-line `leaveFocusScope`
wrapper around a returned release function.

**Cause:** the wrapper existed to release once; the callee's release is already
idempotent.

**Fix:** delete the wrapper and call the release directly (15 lines gone, no call
site changes meaning). Verify the callee's contract before keeping a guard that
one caller "might" need.

### Same name, different contract

**Symptom:** `TextInputValidator.escapeHtml` looks like the shared escaper.

**Cause:** it escapes eight characters (`/`, backtick, `=` in addition to the
five) for a different caller contract.

**Fix:** do not merge. Report it as a near-duplicate with the differing contract.
Same for dead helpers: `pixTool.js` and `stringTool.js` had no importers, so they
are deletion candidates, not extraction sources.

## Proving equivalence

### A relative import from `/tmp` resolves under `/tmp`

**Symptom:** `Cannot find module '/private/tmp/src/tools/margin.js'`.

**Cause:** the harness lived in `/tmp` and imported `./src/...`.

**Fix:** absolute paths for every repo module in the harness.

### Import the module that exports the name

**Symptom:** `does not provide an export named 'padding'` when importing both
from `margin.js`.

**Cause:** `padding.js` is its own module; `margin.js` exports only `margin`.

**Fix:** one import per module file, or use the barrel only when both names are
actually re-exported there. A failed named import is not a missing helper.

### A happy-path call proves nothing

**Symptom:** 1 call matches, the refactor still changes the output of
`{ vertical: 10, horizontal: 20 }`.

**Fix:** compare the full edge table — number, string with 2/3/4 values, `{}`,
`undefined`, `all` plus an individual side, conflicting axes. The verified run
covered 40 calls and 0 differences, and asserted `margin === padding`.
