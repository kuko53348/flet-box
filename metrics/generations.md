# Generations

The log of every `flet-box verify` run in this repository, newest last. One row
per run: when it happened, which project, whether the gates were green, which
gates failed and which codes they reported.

A **generation** is a run of consecutive failing rows that ends at the first
green one — the rows before it are the corrections that were needed. A green
row that follows a green row is a generation that needed none.

**The north metric** is the share of generations whose *first* run was green:
the code that passed the gate with no correction at all. It is measured by
`npm run metrics`, which also prints the three failures that recurred most
often and the rule each one should belong to. That list is the loop: a code
that keeps coming back and has no rule behind it is a rule that has not been
written yet.

| When | Project | Result | Gates | Codes |
| --- | --- | --- | --- | --- |
| 2026-10-27T15:49:32.175Z | flet-box | ✓ | — | — |
| 2026-10-27T21:55:27.702Z | flet-box | ✓ | — | — |
| 2026-10-27T22:12:49.121Z | flet-box | ✓ | — | — |
| 2026-10-28T15:35:31.629Z | flet-box | ✓ | — | — |
| 2026-10-28T15:41:09.081Z | flet-box | ✓ | — | — |
| 2026-10-28T15:46:58.710Z | flet-box | ✓ | — | — |
