---
name: fletbox-shared-helper-extraction
description: Playbook for finding and extracting genuinely duplicated helpers in the flet-box framework and landing the rule that keeps them extracted. Use when the user asks to separate repeated functions so widgets reuse them ("separar las funciones repetitivas", "todo lo reutilizable a una carpeta helpers", "no hacer las mismas funciones individuales", "crealo como regla", "nada de codigo duplicado"), after a code-quality review reports copy-paste, or when `check-shared-helpers` fails. Measures with an AST scan before touching code (line similarity is not duplication), moves the one implementation to a leaf module in `src/helpers/` (or the engine service that owns the behaviour), proves old-vs-new equivalence, then adds a one-home gate rule plus a delegate receipt and proves each rule bites by mutation. For prop/doc/snippet coherence use fletbox-api-coherence-audit; for a single widget's visual default use fletbox-widget-default-verification.
---

# FletBox shared-helper extraction

## Overview

Turn "these functions are repeated" into a measured list, one implementation per
behaviour, an equivalence proof, and a gate that fails when a second copy
appears. The output is not a refactor by feel: every extraction has a scan hit
behind it, every removed line has a verified replacement, and the gate is proven
to bite before the work is called done.

The framework's own contract is already written: **R14 "The second copy is a
module"** and **R15 "Essential code only"** in `skills/fletbox-rules/SKILL.md`.
Read them first. This skill is the procedure behind those rules.

## Hard rules

1. **A duplicate is an identical normalised body, not a similar shape.** Never
   extract from line overlap alone. In this repo `Checkbox` and `Radio` share
   25% of their lines (row, label, 40px tap zone, overhang) and **zero** identical
   functions; they were deliberately left alone. Extracting them would design a
   new abstraction, not remove a copy.
2. **Scan before editing, and scan twice.** First pass at `--min-lines 5`, then at
   `--min-lines 3` before declaring the tree clean. The second pass is what found
   a 5-line focus-release wrapper pasted into three overlays after the first pass
   reported only three groups.
3. **One implementation, one home.** A pure helper goes in `src/helpers/` and
   imports **nothing** — that leaf property is what lets a widget use it without
   dragging the Markdown parser's six widgets into its graph. If it needs another
   module, it is a service: `src/utils/`. Name the file for the behaviour
   (`html.js`, `boxEdges.js`), not for the function (`htmlEscape.js`).
4. **The public API does not change.** Keep the old exported name as an alias
   (`export const margin = boxEdges;`), keep the default export, and leave
   `src/index.d.ts` alone unless a public name actually changes. If a new export
   is needed, update all three surfaces and run `check-api-surface`.
5. **Document-level state has one owner.** Keyframes, injected `<style>` tags and
   module-level caches are global: a second injector is a second dedupe set that
   cannot see the first. When two modules build the same animation from their own
   options, the name must come from the body (`animationName(prefix, frames)`),
   never a constant.
6. **No wrapper with one caller.** If a function only forwards its arguments,
   delete it and call the target — after checking that the target is idempotent.
   The three overlays' `leaveFocusScope` wrapper existed because releasing twice
   used to matter; `trapFocus`'s release is idempotent, so 15 lines went away with
   no call site changing meaning.

## The loop

### 0. Scope and rule

Read `skills/fletbox-rules/SKILL.md` R14/R15 and `AGENTS.md` "Widget structure
contract". State the scope in the answer: exact duplicates only; "looks similar"
candidates are reported separately and not touched. If the user asked for a rule,
the rule text and the gate are part of the deliverable, not a follow-up.

### 1. Scan

```bash
node <skill>/scripts/find-duplicate-functions.mjs --root <flet-box checkout> --min-lines 5 --min-chars 80
node <skill>/scripts/find-duplicate-functions.mjs --root <flet-box checkout> --min-lines 3 --min-chars 60
```

- The scanner imports TypeScript for the AST. **flet-box's devDependency is
  TypeScript 7, which ships `lib/tsc.js` and no compiler API**, so the script
  looks for a TypeScript 5-or-older `lib/typescript.js` beside the checkout (a
  sibling install — the machine's accident, not this skill's dependency). For a
  scratch copy, or when no sibling has one, pass it explicitly:
  `--ts <path>/typescript/lib/typescript.js` or set `FLETBOX_TS`. A missing
  compiler exits 2 with that instruction; it is a toolchain gap, not a clean tree.
- It reports nested functions too, so a copy declared inside a widget factory is
  still a hit.
- Zero hits is a valid answer. Prove the scanner works by copying one helper file
  into a second file in a scratch tree and seeing two groups; do not "find"
  duplicates to justify an edit.

### 2. Classify each hit

For every group, read both bodies and their callers, and answer:

| Question | If no |
| --- | --- |
| Same contract (same escaping set, same fallback, same error path)? | Do not merge. Report it. |
| Is either copy imported by anything? | An unimported helper is dead code: delete it, do not extract it. |
| Is it function-body identical after stripping comments? | A comment-only difference is still a duplicate; a one-token difference is a near-duplicate and needs its own decision. |

Verified false positives: `TextInputValidator.escapeHtml` escapes eight
characters (`/`, backtick, `=` included) while `helpers/html.js` escapes five —
same name, different security contract. `Checkbox`/`Radio` above.

### 3. Choose the home

- Pure function, no imports → `src/helpers/<behaviour>.js`.
- Needs another module, the DOM, or owns a document-level resource → the existing
  service in `src/utils/` (`styleInjector.js`, `focusScope.js`).
- Move an existing implementation with `git mv` instead of retyping it, so the
  history follows the behaviour.

### 4. Extract without changing the API

- Put the single implementation in the home; make every old name an alias,
  re-export or thin caller.
- Rewire every caller to the home's own path. Importing a helper through a barrel
  only to re-export it is not the goal, and copying the body "to avoid a
  dependency" is forbidden.
- Delete forwarding wrappers when the target already has the property the wrapper
  adds (usually idempotency).
- When unifying a document-level injector, stop and check the naming. In this
  repo the two `injectKeyframes` copies hid a real bug: `visualEffects` named
  animations with constants (`glow-pulse`) but built the body from options, so a
  second glow in another colour reused the first animation. Body-derived names
  fixed it; identical bodies still share one `<style>`.

### 5. Prove behaviour

Write a throwaway harness in `/tmp` (never in the repo):

```js
// /tmp/equiv.mjs — absolute paths; a relative import from /tmp resolves to /tmp/src
import { margin } from "/abs/path/flet-box/src/tools/margin.js";
import { padding } from "/abs/path/flet-box/src/tools/padding.js";
import { oldImpl } from "/tmp/old-impl.mjs"; // `git show <ref>:<path>` into this file

const cases = [20, "10px 20px", "1px 2px 3px 4px", { all: 8 },
  { vertical: 10, horizontal: 20 }, { top: 1, left: 2 }, { all: 8, top: 0 }, {}, undefined];
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let failures = 0;
for (const input of cases) {
  if (!eq(oldImpl(input), margin(input))) failures++;
  if (!eq(oldImpl(input), padding(input))) failures++;
}
console.log(failures ? `${failures} differences` : `ok ${cases.length * 2} calls identical`);
process.exit(failures ? 1 : 0);
```

Cover the component's real edge cases, not just a happy value: number vs string,
two/three/four-value shorthands, object keys that conflict (`all` plus a side),
empty object, `undefined`. The verified extraction compared **40 calls, 0
differences**, and asserted `margin === padding`. Then run the browser harnesses
that exercise the behaviour (`npm run test:browser`, or open `/tests/motion.html`,
`/tests/regression.html`, `/tests/smoke.html`, `/tests/a11y.html` on `npm run dev`).

### 6. Gate the rule and prove it bites

Add the helper to `scripts/check-shared-helpers.mjs`:

- A `SINGLE_HOME` entry with a pattern that matches a **definition**, not a
  mention. A bare `@keyframes` regex reported three JSDoc comments as duplicates;
  the rule now requires the shape `@keyframes <name> {`. Prefer stripping
  comments before matching when the shape can appear in prose.
- A `DELEGATES` receipt for every module that used to carry the copy, so it
  cannot quietly stop importing the home.
- The leaf rule already applies to every file in `src/helpers/`; a helper that
  grows an import fails it.

Prove each new rule with a mutation, on a scratch copy, never on the working
tree:

```bash
mkdir -p /tmp/mut && cp -R src scripts /tmp/mut/
# paste a second definition / a stray injector / an import in helpers/ into /tmp/mut/src
node scripts/check-shared-helpers.mjs --root /tmp/mut   # expect exit 1 and the right rule name
```

One mutation per rule. A mutation only counts if it changes what that rule
detects; deleting the pattern and watching everything pass proves nothing. In
this repo 6 rules were each proven by mutation. Keep the mutation script in
`/tmp` as a JS file or a single-quoted heredoc: a `${...}` inside a bash heredoc
produced `bad substitution` and silently blanked a test case.

### 7. Write it down and verify

- `skills/fletbox-rules/SKILL.md`: R14 names `src/helpers/` and the no-imports
  property; R15 covers dead options, single-caller abstractions and
  argument-forwarding wrappers.
- `AGENTS.md` and `docs/guides/widget-structure.md`: the same rules with the home
  table, and the gate in the `npm test` list.
- `package.json`: `node scripts/check-shared-helpers.mjs` is part of `npm test`
  (18 node gates at the time of writing).

## Verification matrix

| Check | Command | Expected |
| --- | --- | --- |
| Syntax of every touched file | `node --check <file>` | clean |
| Duplication after the work | scanner at `--min-lines 3` | 0 groups (or the ones you reported) |
| Equivalence | `/tmp` harness | N calls, 0 differences |
| Static gates | `npm test` | exit 0, including `check-shared-helpers` |
| Runtime | `/tests/motion.html`, `/tests/regression.html`, `/tests/smoke.html` | all pass; a11y too if focus/overlays moved |
| Gate bites | `check-shared-helpers --root /tmp/mut` per rule | exit 1 with the rule's name |

## Report

Close with: the before/after table (files and line counts), what each new home
owns, the equivalence numbers, the gate rules added and their mutations, and a
short "not extracted, and why" list (structural similarity, different contract,
dead code). The last section is what stops the next agent from re-litigating
`Checkbox`/`Radio`.

## Resources

- `scripts/find-duplicate-functions.mjs` — cross-file AST report with the
  TypeScript 7 fallback and `--min-lines/--min-chars/--ts`.
- `references/pitfalls.md` — every failure and false positive observed while
  doing this extraction, with the fix.
