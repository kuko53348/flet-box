---
name: fletbox-memory
description: The project journal that lets any AI pick up where the last one stopped - read .fletbox/memory/MEMORY.md before working, write an entry the moment something is learned, keep a running status note so a screen, a fix or a half-finished flow survives a change of model. Use at the start and the end of every session, before a risky change, and whenever the user says "continue" or "what is the state".
---

# Memory — the handover between sessions

An app is built across many sessions and, more often than not, by different
models. None of them remembers the last one. The only thing that carries over is
what is written down, so writing it is part of the work, not a courtesy at the end.

A session that learned something and did not write it is a session that will have
to be repeated.

## MEM1 Read before writing code

At the start of a session, in this order:

1. `AGENTS.md` — the contract.
2. `.fletbox/memory/MEMORY.md` — one line per entry, with what it is about.
3. The entries the task touches: the current status note, and any entry naming the
   screen, widget or flow you are about to change.

If the index points at a file that is not there, that is itself a finding: fix the
index before you trust it, and say so.

## MEM2 One entry per fact, never one entry per day

`.fletbox/memory/notes/<slug>.md`, kebab-case, named after the **fact**, not the
session: `checkout-form.md`, `listview-itemsize.md`, `dark-contrast.md`. Ten files
about real things beat one `notes/2026-10-24.md` nobody can search.

Every entry has the same shape, and the last two lines are what make it usable a
month from now:

```markdown
---
name: listview-itemsize
description: ListView virtualises — itemSize must match the row it renders
metadata:
  type: project
---

A `ListView` row taller than its `itemSize` is clipped, and the scroll math drifts
with it. Set `itemSize` to the real row height, or leave the list unvirtualised by
passing `children` instead of `data`.

**Why:** the row looked fine at the top of the list; only after 30 items did the
bottom of each one disappear. Nothing in `npm run ui` can see it.

**How to apply:** whenever a `ListView({ data, renderItem })` is added or a row's
content changes, re-measure the row and update `itemSize`.
```

`type` is `project` (what this app is and where it is going), `decision` (a choice
with a reason behind it), `finding` (something the framework or a screen does that
surprised you), or `task` (open work someone has to finish).

Then add the pointer to `MEMORY.md` — one line, under 150 characters, with a hook:

```markdown
- [ListView itemSize](notes/listview-itemsize.md) — a row taller than itemSize is clipped; re-measure after any row change
```

## MEM3 Keep one status note, and update it as you work

`notes/current-status.md` is the handover document: the next model reads it and
knows where it is standing. Keep four sections, short, and rewrite them instead of
appending to them.

```markdown
# Status

**Doing:** the checkout form — step 2 (payment) is built, step 3 is stubbed.
**Done and verified:** `npm run check` clean, `npm run ui` clean, 375px and 1440px
looked at in both themes.
**Not done / half-done:** the "Apply coupon" action has no loading state; the empty
cart is a blank panel.
**Next:** add the two missing states (rule 12), then wire `onEndReached` on the
product list.
**Blocked:** the coupon endpoint is not decided — ask, do not guess.
**Last touched:** src/screens/Checkout.js, 2026-10-24.
```

Honesty here is the whole value of the file. A note that says "done" when the empty
state is missing is worse than no note: the next session builds on top of it.

## MEM4 What belongs in memory, and what does not

Write it when it passes one of these tests:

- **You would get it wrong again.** A prop that silently does nothing, a widget that
  ignores `elevation`, a default that surprises — re-deriving these costs a session.
- **It explains a rule you broke.** The one-sentence justification for a kept
  `npm run ui` finding belongs next to the finding.
- **It is a decision with a reason.** "The list is unvirtualised because rows have
  variable height" tells the next session not to "optimise" it back.
- **It is user preference.** Tone, language, what they call the feature, what they
  refused. This is the most valuable kind and the first thing a new model loses.

Do not write:

- Anything the code or `.fletbox/api/api.json` already says. Memory that restates
  the API goes stale the next release; the generated files do not.
- A log of what you edited. `git log` knows; a journal of diffs is noise that pushes
  the useful entries out of view.
- The scratch plan for a task you are about to finish. Delete it when the work lands,
  or keep the decision and drop the plan.

## MEM5 Correct the record instead of arguing with it

Memory is a claim about a point in time, not a law. Before acting on an entry that
names a file, a prop or a behavior, check that it is still true:

- Still accurate → use it.
- Contradicted by the code, by `npm run check` or by what the screen does → **the
  code wins.** Fix the entry, or delete it, in the same change that fixes the screen.
- About work that is now finished → remove the `task` entry and fold whatever was
  learned into a `finding` or `decision` entry.

Never leave a wrong entry because deleting it feels like losing history. A stale
entry is the mechanism by which one model's mistake becomes the next model's
"existing pattern".

## MEM6 Write before the session ends, not after

Update the status note at each natural boundary — a screen that passes both gates, a
fix confirmed in the browser, a decision taken, a blocker found. Do not plan to write
it "at the end": the end of a session is the one moment that reliably does not
happen.

One line in `MEMORY.md`, one file in `notes/`, and the status note rewritten is the
whole cost. If the change is big enough to commit, the memory change goes in the same
commit — the code and the reason for it should not be able to drift apart.
