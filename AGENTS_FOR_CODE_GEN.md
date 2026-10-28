# AGENTS_FOR_CODE_GEN.md

The contract for an agent that **writes FletBox code**. It holds in an app built
with `flet-box create` and in the framework's own source.

`AGENTS.md` is the contract for *maintaining the framework*. This one is for
*producing code with it*: what may be written, what may not, and how it is
proved.

---

## 0. The golden rule

> **If a widget or a prop is not in `.fletbox/api/cheatsheet.md`, it does not
> exist.**

An invented prop throws nothing. The engine ignores it, the layout breaks
quietly, and nobody finds it for weeks. If the cheatsheet does not hold what
the task needs, **ask** — do not invent.

| What I need | Where it lives | How it is produced |
| --- | --- | --- |
| Which widgets exist and which props each one takes | `.fletbox/api/cheatsheet.md` | `flet-box check-api --emit-api` — runs before `npm run dev` |
| The same surface as data: one entry per prop, with its engine target, default, aliases and a sample value | `.fletbox/api/api.json` | `flet-box unpack --all --md` |
| Everything one widget accepts, and whether each prop is really wired | `flet-box unpack <Widget>` | — |
| A call I can paste as-is | `flet-box unpack <Widget> --example` | — |
| The real props of one widget | `npm run check -- --props <Widget>` | — |

Both files are **generated output**: never hand-edit them, regenerate after
upgrading `flet-box`.

---

## 1. Five things you may never do

1. **No runtime dependency.** FletBox has zero runtime dependencies and the app
   is offline: no `react`, `vue`, `svelte`, `lit`, `jquery`, `tailwindcss`, no
   CDN `<script>`, no `.jsx`/`.tsx`. Plain ESM `.js`, with the `.js` extension
   in every import.
2. **No hardcoded color.** Every fill, ink and border is a `colors.*` token.
   A hex literal in a screen is reported as `RAW_COLOR`.
3. **No hand-written DOM.** Build with widgets and props — never with
   `innerHTML`, `createElement` or a template string. (The engine uses
   `innerHTML` internally for rich text; app code does not.)
4. **No widget or prop outside the cheatsheet**, and no positional arguments:
   `Text({ text: "Hi" })`, never `Text("Hi")`.
5. **No API change without deprecation.** Renaming or removing a prop is a
   breaking change: keep the old name working, mark it, and write the
   "from X to Y" line in the migration guide.

---

## 2. Ten rules that survive a review

Each cites the numbered rule in `skills/fletbox-design/SKILL.md`, which is
where the longer argument lives.

1. **Numbers, not pixels.** `padding: 16` is a framework unit and scales with
   the reader's font; `padding: "16px"` does not. (03, 07)
2. **Tokens, not colors.** `bgColor: colors.surface`. One brand color per
   screen; the accent is the reader's to choose, never a hex in a widget. (03, 28)
3. **Hierarchy in three seconds.** One type size per element, one weight per
   role. A label and its value that look alike mean the hierarchy is broken. (08)
4. **Space carries meaning.** 16 inside a card, 16 or 24 between cards, 24
   between sections. Never mix padding and gap on the same list. (07)
5. **Depth is a scale.** `elevation` picks the level; a hand-written shadow is
   noise. (10)
6. **Every control has a name.** An icon-only button needs `aria-label`, a
   field needs a label. The gate reports `ICON_ONLY_CONTROL` and
   `UNLABELED_FIELD`. (11)
7. **Tap targets are 40 or more**, reached with `height`, not with padding. (11)
8. **Every interaction has four states.** hover, focus, active and disabled
   come from the engine's props — do not re-implement them per widget. (12)
9. **The phone range is the test device.** From 320×568 to 430×932 nothing
   overflows, nothing is clipped, nothing scrolls sideways. (16)
10. **One screen per file, one component per file.** A file exporting two
    widgets is a file nobody finds later.

---

## 3. Examples

### Good

```js
import { Button, Container, Row, Text, colors, useState } from "flet-box";

export const StatsScreen = () => {
  const [period, setPeriod] = useState("stats-period", "week");

  return Container({
    direction: "column",
    gap: 16,
    padding: 24,
    bgColor: colors.background,
    children: [
      Text({ text: "This week", size: 24, weight: 600, color: colors.text }),
      Row({
        gap: 12,
        children: [
          Button({ text: "Week", onPress: () => setPeriod("week"), variant: "outlined" }),
          Button({ text: "Month", onPress: () => setPeriod("month"), variant: "outlined" }),
        ],
      }),
      Button({
        icon: "refresh",
        "aria-label": "Refresh stats",
        onPress: refresh,
        bgColor: colors.primary,
        height: 40,
      }),
    ],
  });
};
```

Every widget and prop there is in the cheatsheet, every length is a number, and
every color is a token.

### Bad

```js
import { Card } from "react";                       // 1. foreign framework
```

```js
import { Button, Text } from "flet-box";

const el = document.createElement("div");           // 3. hand-written DOM
el.innerHTML = `<b>${name}</b>`;

Text({ text: "Total", color: "#4f46e5", size: 13 }); // 2. hex + off-scale size
Text("Total");                                       // 4. positional argument
Button({ icon: "save", onPress: save });             // 6. a control with no name
Button({ text: "Save", onPress: save, bgColor: "#4f46e5" }); // 2. hardcoded color
```

---

## 4. The verification protocol

```bash
npm run verify     # every gate, one report, one exit code
```

1. Run it after every edit, before saying the task is done.
2. Fix **only** the error the report names. Do not rewrite the file to make it
   pass — a check that fails on line 12 is a line 12 problem.
3. **At most two attempts.** If the same error survives the second attempt,
   revert the change and hand the report back with what you tried.
4. A warning may stay only when you can justify it in one sentence.

`npm run verify` is `flet-box verify`: it runs the anti-hallucination gate
(invented widgets, positional arguments, foreign imports, broken imports), the
design gate (tokens, the scale, tap targets, labels, contrast), the structural
gate (a cycle between two of the app's own modules, a module outside the
project's folders, markup written by hand) and the prop contract (a prop the
widget reads but nothing declares) **in parallel**, and prints one report with
one exit code. `flet-box verify --watch` re-runs it on every edit, and
`flet-box run --verify` does the same while the dev server runs.

A mistyped name is mechanical, not creative: `npm run fix` rewrites what it
can prove (`chilldren` → `children`, `bgColr` → `bgColor`, a relative path that
does not resolve) and leaves anything ambiguous for you to decide. Read the
diff.

Then look at it: `npm run dev` and use the screen. A green report proves the
code is legal, not that it is right.

---

## 5. The surgical protocol

The report names a line. The edit touches that line, and nothing else.

1. **Fix only what is named.** Every finding carries a file, a line and a code.
   Change that line. A file that fails on three lines gets three edits — not a
   rewrite of the file, and never a rewrite of the screen around it.
2. **Let the tool repair first.** A mistyped prop, a wrong relative path and a
   missing import are mechanical, and the repair is the tool's job:
   `npm run verify -- --fix` rewrites what it can prove and re-runs the gates
   on the result. Read the diff it prints before you write anything.
3. **Do not widen the blast radius.** No reformatting, no renaming, no
   "while I was here". A diff that touches a line the report did not name is a
   diff you have to justify — and usually it is one you should not make.
4. **A new finding is a decision, not noise.** If the fix makes a gate report
   somewhere else, that is the next thing to look at. Do not silence it by
   loosening the value that caused it.
5. **Two attempts, then revert.** The same error surviving the second attempt
   means the diagnosis was wrong, not that the third attempt will be luckier.
   Revert and hand back the report with what you tried.
6. **Say what you did not touch.** The handoff names the files you changed and
   the ones the report named but you left alone, with one sentence of why.

---

## 6. What gets rejected, and why

A change comes back when it breaks one of these. Each row names who says so,
so "it was rejected" is never a matter of taste.

| It comes back when | Who says so | What to write instead |
| --- | --- | --- |
| A widget, a prop or an export that does not exist | `UNKNOWN_EXPORT`, `UNKNOWN_PROP` | look it up in the cheatsheet; if it is not there, ask |
| A positional call | `POSITIONAL_ARG` | `Text({ text: "Hi" })` |
| An import that does not resolve | `MODULE_NOT_FOUND`, `MISSING_EXPORT` | `npm run fix`, or the path the file really has |
| A prop the widget reads but no type declares | `INVENTED_PROP` | declare it, so an editor finds it |
| A prop that no type declares and nothing reads | `DEAD_PROP` | wire it in the widget, or drop the declaration |
| A hex where a token belongs | `RAW_COLOR` | `colors.primary` |
| A length that is not on the scale | `OFF_SCALE_SPACING`, `OFF_SCALE_RADIUS`, `OFF_SCALE_TYPE` | the number the scale holds |
| A control smaller than the tap target | `SMALL_TAP_TARGET` | `height: 40` |
| A control with no name | `UNLABELED_FIELD`, `ICON_ONLY_CONTROL` | a label, or an `aria-label` |
| A cycle, a file from outside the project, markup written by hand | `CIRCULAR_IMPORT`, `SOURCE_OUTSIDE_ROOT`, `HAND_WRITTEN_DOM` | import the file that owns it; build with widgets |
| A rename or a removal with no deprecation | a review | keep the old name working, mark it, write the "from X to Y" line |
| A diff that touches lines the report did not name | a review | revert the extra lines |
| A claim with no measurement | a review | measure it, or say that it is unmeasured |
| A baseline moved to quiet a gate | a review | a baseline moves when the framework moves |

The last four rows are not gates: no tool can prove them, and a reader has to.
A machine can say that a prop does not exist; only a person can say that a
diff does more than the task asked.

And two things are **not** a reason to send anything back: a warning you can
justify in one sentence, and a fix that lands exactly on the line the report
named. Both are in the two sections above.

---

## 7. The log of what keeps coming back

Every `npm run verify` run appends a row to `.fletbox/metrics/generations.md` —
when it happened, whether the gates were green, which gates failed, which codes
they reported. **Every** run, green or not: a log that keeps only the
successes cannot tell a correction from a first try.

```bash
npm run metrics      # the north metric and the failures that recur
```

A **generation** is a run of failing rows closed by the first green one, and the
**north metric** is the share of generations whose *first* run was green — the
share of code that passed the gate with no correction at all. That is the number
worth raising, and it moves only when the code changes, not when the report gets
softer.

The same command prints the three failures that recur most often and the rule
each one should belong to. **That list is the loop.** A code that keeps coming
back and has no rule behind it is a rule that has not been written yet — and the
command fails when it finds one, so the gap cannot be forgotten.

A code that keeps coming back *with* a rule behind it is a different problem,
and the command names it: the rule is not landing. That is a stronger rule, a
stronger place to put it, or an agent that did not read it.

So when you see the same code twice in the log, do not only fix the line it
names: write the rule that would have prevented it, where it belongs (the
design skill, the rules skill, or the gate itself), and prove it with a check
that fails without the fix.

---

## 8. If you are working on the framework itself

`AGENTS.md` in the framework root is the contract for engine work: one
rendering engine, the rem contract, the widget structure, the gates that guard
each of them. This file still applies to anything you write there: real APIs
only, tokens only, no new rendering system, and every rule you break gets a
guard that fails before the fix.

When you find a defect in the framework, fix it **upstream** and prove it with
a check that fails without the fix. Never patch `node_modules`.
