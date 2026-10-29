# Traps measured in this repo

Each item was hit while completing the snippet library. Re-check the current code before
"fixing" one — several are already fixed in `scripts/check-snippets.mjs`; copy the pattern
rather than re-introducing the bug.

## 1. Regexes containing quote/backtick characters: build them by string concatenation

The liveness test scans a corpus of widget sources for three usages of an identifier.
Writing it as a template literal is a trap: the character-class alternatives for `"` and
`'` need a backtick-delimited class, and an unescaped backtick inside a template literal
throws `SyntaxError` before the checker runs at all.

The working form is `QUOTE_CHARS` plus an array `join` — the whole pattern is assembled
from single-quoted strings, never from a template literal. Real code, verbatim from
`scripts/check-snippets.mjs:486-502`:

```js
const QUOTE_CHARS = '["\'`]';
const readInSource = (name) => {
  const id = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const source = [
    "\\.\\s*" + id + "\\b",
    "\\b" + id + "\\s*=\\s*[^=]",
    QUOTE_CHARS + id + QUOTE_CHARS,
  ].join("|");
  return new RegExp(source).test(corpus);
};
```

Note `QUOTE_CHARS` contains a backtick, so the assignment must stay single-quoted. The
`declaredInTypes` test beside it (line 502) is safe as a template literal only because it
holds no backtick of its own — copy that split, do not merge the two into one literal.

Verify with `node --check scripts/check-snippets.mjs` after editing — the failure mode is
the whole tier silently not existing, not a wrong count.

## 2. A detector that returns 0 forever looks like a pass

`BROKEN_IMPORT` never fired for a long stretch: `mask()` (the comment/string stripper used
before parsing) deleted the imported **module name** from the line, so the import symbol
the tier was supposed to check no longer existed in the masked source.

Consequences to keep in mind:
- Always run the negative control (SKILL.md) after touching `mask()` or any tier.
- When a tier's count is 0, prove the tier can be made non-zero on a scratch copy before
  reporting the library as clean.

## 3. POSITIONAL_ARG must be driven by the real signature

The naive rule "any capitalized call with a string literal as first argument is wrong"
produces false positives: `WidgetFactory("div", …)` legitimately takes a positional tag
name. The refined detector consults `src/index.d.ts` and only flags APIs whose parameter
is a props object (`Text`, `SnackBar`). Keep that signature lookup when editing the tier —
and keep the negative control that a real `Text("Hola")` still bites.

## 4. Call detection: two shapes that produced false positives

The free-call scanner had to be fixed for **destructuring** (`const { x } = f()`) and
**`async`** calls; both were parsed as calls to names that do not exist. Any new call-site
scanner in this checker should special-case them from the start.

## 5. Aggregate is what the editor loads

`FletBox.json` is the union the editor actually reads. `AGGREGATE_DRIFT` fires when it
differs from the category files, so a partial edit (only one JSON, or only one category
file in a scratch copy) produces a drift error and **masks** the coverage signal you were
testing for. Always rebuild through `build_snippets.py` and re-check.

## 6. `special` props are judged only by the other two liveness tests

`engineTypes` is `new Set(["style", "attribute", "event", "text"])`
(`scripts/check-snippets.mjs:482`), so a registry entry typed `special` — the ones the engine
itself handles in `applySpecial` / `assignProps` (`value`, `variant`, `visible`) — gets **no**
credit from that branch. It is live only via `declaredInTypes` or `readInSource`, and since
those helpers scan the widget corpus, grepping `src/widgets/` for such a prop returns nothing
while the prop is very much implemented (`src/widget-factory/assignProps.js:62`).

Consequence: "no widget reads it, so it is exempt" is the wrong conclusion for `special`.
Check `index.d.ts` and the engine switch before adding or suppressing a tier entry — that
`special` gap is exactly what made `visible` flip from exempt to `UNCOVERED_PROP=1`.

## 7. `UNCOVERED_PROP` is about the built bodies, not the `.py`

The tier only skips a prop listed in `writtenKeys`, which is parsed from the **snippet bodies
in the four JSON files** (`check-snippets.mjs:353`, filled at 385, consumed at 510). So the
`.py` and the JSON can disagree — a pending rebuild, or a prop line that lands in a body whose
key the regex cannot see (the pattern needs `{`, `(`, `,` or whitespace before the identifier,
so a key that begins a line flush-left is missed).

Grep the built JSON before theorising, and re-read the actual gate at
`check-snippets.mjs:509-513`:

```bash
for f in tools/snippets-creator-flet-box/*.json; do printf '%s: ' "$(basename $f)"; LC_ALL=C grep -c '<prop>' "$f"; done
```

Do not "fix" this by adding a second dictionary entry — rebuild first, then re-measure.

## 8. Intentionally uncovered registry entries

`downloadable`, `downloadFileName`, `searchable`, `searchPlaceholder` are in
the prop database but no widget reads them, so `UNCOVERED_PROP` correctly stays quiet about
them. If a future change makes one readable, it must gain an example; if it does not, do
not add a fake usage just to see the name covered.
