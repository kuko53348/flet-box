---
name: fletbox-snippet-library-audit
description: Playbook for completing and repairing the FletBox VSCode snippet library so every exported API and every live prop has a paste-ready example. Use when the user asks to make the snippets contain everything the framework has ("que los snippets tengan todas las props / todo lo que tiene el framework"), after adding or renaming a public export or prop, or when check-snippets reports SYNTAX, BROKEN_IMPORT, DEAD_SNIPPET, UNKNOWN_PROP, POSITIONAL_ARG, DUPLICATE_PREFIX, AGGREGATE_DRIFT, UNCOVERED_EXPORT, UNCOVERED_PROP or UNPARSABLE. Edit only the three Python dictionaries and regenerate the JSON with build_snippets.py — never hand-edit the JSON. Use fletbox-api-coherence-audit instead when the task is only to diagnose whether docs/props are coherent (read-only).
---

# FletBox snippet library audit

## Overview

Bring `tools/snippets-creator-flet-box/` to full coverage of the public API: every
export of `src/index.js` and every *live* prop of the registry must appear in at least
one snippet, and every snippet must paste into working code. Close with `npm test` reporting
zero on every failing tier.

Division of labour: `fletbox-api-coherence-audit` **measures** and reports; this skill
**writes** the missing examples and repairs the detectors. Do not re-do the browser probes
here — the checker is the contract.

## Invariant: source vs build output

The ONLY editable files are the three dictionaries:

- `tools/snippets-creator-flet-box/FletBox_snippets_creator/FletBox_create_widgets.py`
- `.../FletBox_create_attributes_widgets.py`
- `.../FletBox_create_modules_widgets.py`

The four JSONs beside them (`FletBox_widgets.json`, `FletBox_attribute_widgets.json`,
`FletBox_modules_widgets.json`, and the aggregate `FletBox.json` that the editor actually
loads) are **build output**. Never hand-edit, never fix a finding in JSON — fix the
dictionary and rebuild:

```bash
python3 tools/snippets-creator-flet-box/build_snippets.py        # write the JSONs
python3 tools/snippets-creator-flet-box/build_snippets.py --check # verify they are current
```

## Pipeline

1. Measure the gap before writing anything:
   `node scripts/check-snippets.mjs --full` (the default output truncates; `--json`
   gives a machine-readable report). Re-run per tier, not per headline.
2. For every uncovered export or prop, read its **real signature** in `src/index.d.ts`
   and the widget source before inventing an example. A snippet must pass props the
   target actually reads, with the right types.
3. Add entries to the matching dictionary. Prefixes must stay unique across all three
   dictionaries: one prefix, one snippet — a duplicate makes `FletBox.json` silently
   keep the first file's version (`DUPLICATE_PREFIX` + `AGGREGATE_DRIFT`).
4. Rebuild, then re-check with `--full` until every failing tier is 0.
5. Close with the whole suite: `npm test` (it runs `build_snippets.py --check` and
   `check-snippets.mjs` among the other checkers).

## The eleven tiers

From the header of `scripts/check-snippets.mjs` — read it before interpreting a count, and
re-read it after any edit to the checker (this suite grew while this skill was being
written: `BROKEN_CALL` and `UNPARSABLE` were added, so treat the table as a snapshot):

| Tier | Means | Fails the build |
| --- | --- | --- |
| SYNTAX | body is not valid JavaScript | yes |
| BROKEN_IMPORT | imports a name the package does not export | yes |
| DEAD_SNIPPET | builds a widget that does not exist | yes |
| UNKNOWN_PROP | registry never heard it and the widget source never mentions it | yes |
| POSITIONAL_ARG | config-object API (`Text`, `SnackBar`) called with a positional string → empty widget | yes |
| BROKEN_CALL | free call neither exported nor declared locally — mostly example-local placeholders (`fetchMore()`), informs only | no |
| DUPLICATE_PREFIX | two category files claim the same prefix | yes |
| AGGREGATE_DRIFT | `FletBox.json` differs from the union of the category files | yes |
| UNPARSABLE | a snippet file is not valid JSON | yes |
| UNCOVERED_EXPORT | the package exports a name no snippet shows | yes |
| UNCOVERED_PROP | a live prop that no snippet uses | yes |

## What counts as a "live" prop

`UNCOVERED_PROP` only requires coverage for props something actually consumes. A prop is
live when its registry type is one the engine routes (`style`, `attribute`, `event`, `text`),
`src/index.d.ts` declares it, **or** code *reads* it: `.prop`, `prop =`, `["prop"]`
(`readInSource`, `scripts/check-snippets.mjs:493-501`). Props typed `special` get no credit
from the first branch — see `references/pitfalls.md` §6.

Writing `language:` as a key of some internal object does **not** make it live — that was
the false positive here.

The tier is satisfied by `writtenKeys` — the prop keys the bodies actually spell
(`check-snippets.mjs:353`, filled at 385, consumed at 510). To see whether the tier should be
quiet, grep the **built** JSON, not the `.py` — they can disagree while a rebuild is pending:

```bash
for f in tools/snippets-creator-flet-box/*.json; do printf '%s: ' "$(basename $f)"; LC_ALL=C grep -c '<prop>' "$f"; done
```

The registry entries the engine never routes and no widget reads (`downloadable`,
`downloadFileName`, `searchable`, `searchPlaceholder`) stay uncovered **on purpose**; do not
fabricate examples to silence them, and do not "fix" the checker to count them.

## Negative control before trusting a 0

A detector that always returns 0 is indistinguishable from a broken one. Prove it bites on
a scratch copy — never on the repo:

```bash
mkdir -p /tmp/scratch && cp tools/snippets-creator-flet-box/*.json /tmp/scratch/
# delete one RamStore example and one letterSpace usage from the copies
node scripts/check-snippets.mjs --dir /tmp/scratch
```

Expected: the tiers move by **exactly** the number you removed (1 each) over the repo's
current baseline — run the check on the untouched library first and subtract, because a
work-in-progress tree may already be non-zero. Two traps that mask the signal:

- Removing a symbol from only one category file fires `AGGREGATE_DRIFT` while coverage
  stays 0. Scrub **all** category files *and* the aggregate.
- `UNCOVERED_EXPORT` matches the name against **all** bodies, so a name still mentioned in
  some unrelated example will not be reported. Absence of the finding is not proof of death.

## Environment traps

See [references/pitfalls.md](references/pitfalls.md) for the detector bugs and shell/JS
traps that cost time in this repo (backticks in template-literal regexes, `mask()` eating
import names, positional-arg false positives on `WidgetFactory("div", …)`).

## Resources

- `references/pitfalls.md` — measured traps and their fixes, with the code pattern to copy.
