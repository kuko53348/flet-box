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

## Gate defects

A code listed here was reported by the gate, not by the code it checked. The
window is the first and the last day it accounts for, so the runs inside it are
left out of the metric; a run after `Fixed` counts again.

| Code | Seen | Fixed | Where |
| --- | --- | --- | --- |

| When | Project | Result | Gates | Codes |
| --- | --- | --- | --- | --- |
| 2026-10-27T15:49:32.175Z | flet-box | ✓ | — | — |
| 2026-10-27T21:55:27.702Z | flet-box | ✓ | — | — |
| 2026-10-27T22:12:49.121Z | flet-box | ✓ | — | — |
| 2026-10-28T15:35:31.629Z | flet-box | ✓ | — | — |
| 2026-10-28T15:41:09.081Z | flet-box | ✓ | — | — |
| 2026-10-28T15:46:58.710Z | flet-box | ✓ | — | — |
| 2026-10-28T15:50:24.615Z | flet-box | ✓ | — | — |
| 2026-10-28T15:56:05.833Z | flet-box | ✓ | — | — |
| 2026-10-28T20:28:53.581Z | flet-box | ✓ | — | — |
| 2026-10-28T20:32:23.954Z | flet-box | ✗ | tests | TEST_SUITE_FAILED |
| 2026-10-28T20:33:43.106Z | flet-box | ✓ | — | — |
| 2026-10-28T20:35:07.726Z | flet-box | ✓ | — | — |
| 2026-10-28T20:36:03.103Z | flet-box | ✓ | — | — |
| 2026-10-28T20:37:36.016Z | flet-box | ✓ | — | — |
| 2026-10-28T20:45:19.844Z | flet-box | ✓ | — | — |
| 2026-10-28T20:49:26.647Z | flet-box | ✗ | tests | TEST_SUITE_FAILED |
| 2026-10-28T20:50:33.958Z | flet-box | ✓ | — | — |
| 2026-10-28T21:03:50.952Z | flet-box | ✓ | — | — |
| 2026-10-28T21:50:02.201Z | flet-box | ✓ | — | — |
| 2026-10-28T21:51:59.988Z | flet-box | ✓ | — | — |
| 2026-10-28T21:52:10.409Z | flet-box | ✓ | — | — |
| 2026-10-28T22:49:43.929Z | flet-box | ✓ | — | — |
| 2026-10-28T22:50:57.852Z | flet-box | ✓ | — | — |
| 2026-10-28T22:55:34.736Z | flet-box | ✓ | — | — |
| 2026-10-28T23:03:32.570Z | flet-box | ✓ | — | — |
| 2026-10-28T23:03:38.049Z | flet-box | ✓ | — | — |
| 2026-10-28T23:30:47.997Z | flet-box | ✓ | — | — |
| 2026-10-29T00:20:58.114Z | flet-box | ✓ | — | — |
| 2026-10-29T00:36:14.384Z | flet-box | ✓ | — | — |
| 2026-10-29T00:38:14.075Z | flet-box | ✓ | — | — |
| 2026-10-29T00:38:19.885Z | flet-box | ✓ | — | — |
| 2026-10-29T00:38:40.602Z | flet-box | ✓ | — | — |
| 2026-10-29T00:41:29.194Z | flet-box | ✗ | syntax | SYNTAX_ERROR |
| 2026-10-29T00:41:30.506Z | flet-box | ✓ | — | — |
| 2026-10-29T00:41:48.270Z | flet-box | ✓ | — | — |
| 2026-11-07T17:34:53.704Z | flet-box | ✗ | tests | TEST_SUITE_FAILED |
| 2026-11-07T17:59:49.604Z | flet-box | ✗ | tests | TEST_SUITE_FAILED |
| 2026-11-11T15:52:09.501Z | kuko53348-refactored-umbrella | ✓ | — | — |
| 2026-11-11T15:53:45.415Z | kuko53348-refactored-umbrella | ✓ | — | — |
| 2026-11-11T15:55:12.521Z | kuko53348-refactored-umbrella | ✓ | — | — |
