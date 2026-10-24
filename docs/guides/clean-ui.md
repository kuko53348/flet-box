# Clean UI — the system contract

A FletBox screen is not decorated, it is extended: every app copies the widget
defaults, and every later screen copies the screen before it. This page is the
contract that makes the copy look like one product — the numbers, the tokens,
and the two commands that prove a screen obeys them.

It is the published version of the `fletbox-design` skill — one of four files in
the framework's `skills/` folder that `flet-box create` copies into every app — so
the app's agent and the framework's documentation cannot disagree.

## The two gates

A generated project has two checks, and they answer different questions:

```bash
npm run check      # is the API real? widgets, props, imports
npm run ui         # does the screen follow these rules?
npm run ui -- --tokens   # measured contrast of every token, on both surfaces
npm run dev        # then look at it: the checker has no eyes
```

`npm run check` (`flet-box check-api`) is about correctness — an invented prop
fails the build. `npm run ui` (`flet-box check-ui`) is about the system — a
`padding: 21` is valid JavaScript and a design defect at the same time. Neither
one replaces opening the page.

## Where the rules live

A generated app is handed four skills — one file per subject, in a visible
`skills/` folder at its root, mirrored byte for byte to `.claude/skills/` and
`.qoder/skills/` because that is where those assistants load a skill from, and
pointed at from one `.cursor/rules/<name>.mdc` each:

| Skill | What it owns |
| --- | --- |
| `fletbox-rules` | The working contract: FletBox syntax only, never invent an API and the four ways to look one up, the rem rule, aliases, cleanup, the two gates, the memory duty. |
| `fletbox-design` | The 25 numbered rules below — tokens, the scale, hierarchy, the four states, measured contrast, composition, the framework traps, the dated tells, density. |
| `fletbox-motion` | Whether a thing may move at all, and through which of `AnimatedBox`, `AnimatedText`, `ParallaxBox` or `animate`. |
| `fletbox-memory` | The `.fletbox/memory/` journal that hands progress from one AI to the next. |

| Home | What it holds |
| --- | --- |
| `skills/fletbox-design/SKILL.md` (framework) → `skills/…`, `.claude/skills/…`, `.qoder/skills/…` (app) | The rules as the agent reads them, in 25 numbered sections. The app's copies are generated; edit the framework file and regenerate, never the mirror. |
| `AGENTS.md` §4 of the app | The short version: one brand color per screen, no hex literals, spacing and radius only from the scale. |
| `src/tools/scale.js` in the framework | The tables themselves — `SPACING_SCALE`, `RADIUS_SCALE`, `TYPE_SCALE`, `TAP_MINIMUM`, `PILL`, `LABEL_TEXT`. |
| `bin/commands/checkUi.js` | The gate. It re-exports those same tables instead of keeping its own copy, and `scripts/check-skills.mjs` fails when a skill and the gate stop naming the same codes. |

That last line matters more than it looks. A gate that carries its own numbers
drifts from the widgets, and the app then gets told to be clean by values the
components it uses do not follow. The defaults and the checker read one table.

## The scale

| Dimension | Allowed values |
| --- | --- |
| Spacing | `0 · 4 · 8 · 12 · 16 · 18 · 24 · 32 · 40 · 48 · 64 · 96` |
| Radius | `0 · 4 · 8 · 12 · 16 · 999` — `999` is a pill, `0` a flush edge; both are decisions |
| Type | `12 · 14 · 16 · 18 · 24 · 32 · 40 · 48` |
| Tap minimum | `40` — Fitts: the smallest pressable box a finger reliably hits |
| Label text | `14` — the reading size a control's own label may not fall under |

Type steps are two apart on purpose: a 15 next to a 16 reads as a mistake, not
as hierarchy. The same logic gives the scale its gaps — a value between two
steps is a shape no other element in the app has.

## Every number is a framework unit

A number on a size prop is not a CSS pixel. It goes through `toREM`
(`src/utils/units.js`) and reaches the page as `value / 16` rem, so `40` is 40px
at the default base and 60px for a reader who raised their browser font to 24.
That is what makes one build fit a phone, a tablet and a desktop, and it is why
the Fitts floor here is 40 rem-units rather than the 44px the guidelines quote:
a target written in rem obeys the accessibility setting, a fixed pixel shrinks
in relative terms the moment the type grows.

`toREM` also rewrites a length someone spelled out in pixels — `"8px 12px"`
becomes `"0.5rem 0.75rem"` — while anything that is not made only of pixel
tokens (`"50%"`, `"calc(100% - 8px)"`, `"2px solid red"`) passes through
untouched.

Pixels stay pixels where a pixel is the honest unit:

- canvas backing stores (`QRCode`, `Chart`, `CircularBar`, `CircularChart`),
- Maps' projected tile and pin space,
- anything measured from the DOM (`offsetWidth`, `getBoundingClientRect`, scroll offsets),
- the hairline `borderWidth`, and shadow depth (`SHADOW_LEVELS`), because a
  shadow that scales with the font stops matching the surface it lifts,
- a virtualised row's scroll math — `ListView` converts `itemSize + gap` through
  the live root font size so the slot a row gets and the row's own box agree.

The framework keeps this honest with its own gate, `scripts/check-widget-scale.mjs`
(part of `npm test`): a length written straight to `el.style.*` that is neither
`toREM(...)` nor measured geometry fails the build.

## The 25 rules

When two of them conflict, take them in this order: **consistency · clarity ·
accessibility · usability · scalability · maintainability · conversion**.

| # | Rule | What it forbids |
| --- | --- | --- |
| 00 | The two gates | Shipping a screen neither `check` nor `ui` has run against. |
| 01 | System before component | Deciding a value case by case; define the token, then the component, then the screen. |
| 02 | Consistency is sacred | An arbitrary difference — a second card radius, a second button height. |
| 03 | Design tokens only | A hex literal, a `px` string, a value off the scale. |
| 04 | Hierarchy in three seconds | More than one primary action competing on a screen. |
| 05 | One purpose per screen | A screen that needs "and" to describe it. |
| 06 | Reduce cognitive load | Choices with no default, fields that could be inferred, copy that explains the interface. |
| 07 | Spacing communicates relationship | Related things sitting farther apart than unrelated ones. |
| 08 | Typography is structure | More than one size per element, body copy centered, a line that runs past ~75 characters. |
| 09 | Color carries meaning | Brand color used for decoration, or a destructive action in the same fill as a safe one. |
| 10 | Depth is a scale | An `elevation` number on a widget that never reads it, or a hand-typed `boxShadow`. |
| 11 | Accessibility is a floor | Text under WCAG AA contrast, a tap target under 40, an image with no `alt` decision. |
| 12 | Every interaction has four states | A control or list with no loading, empty, error or success path. |
| 13 | Forms prevent the error | Validation that only reports after a failed submit; an unlabeled field or toggle. |
| 14 | Destructive actions designed last | A delete that is the closest, fastest, most colorful thing on the screen. |
| 15 | Reduce interaction cost | Taps, scrolls and keystrokes that carry no information. |
| 16 | Respect the platform | Fighting the browser's own conventions — back, scroll, text selection. |
| 17 | Composition starts as a sentence | A screen that begins as "a hero, then three cards, then a footer" instead of a decision the page carries. |
| 18 | The framework traps | `Container` assumed invisible, a `flex: 1` with no sibling, `alignItems: "center"` mistaken for centered text, absolute coordinates where a `Stack` belongs. |
| 19 | The dated tells | An eyebrow label, `01 · 02 · 03`, glass everywhere, resting shadows, a hairline `Divider` under every row, copy that says "seamless". |
| 20 | Density is one dial | Two rhythms in one screen — a gap, a padding and a body size chosen three different times. |
| 21 | The review | Shipping before reading your own diff as the user. |
| 22 | Where these books are wrong | Following a guideline that measurement disagrees with. |
| 23 | What no checker can see | Taste, hierarchy in the wild, whether the screen solves the problem. |
| 24 | The loop | Fixing the checker instead of the code, or leaving a rule you had to break undocumented. |

## What `flet-box check-ui` proves

The gate reads your `src/` and reports what a static pass can prove. Prop names
come from the installed package's own registry, so it cannot invent an API while
judging yours. Each finding carries a code, and the code maps to a rule above.

### Errors (exit 1)

| Code | Rule | What it catches |
| --- | --- | --- |
| `RAW_COLOR` | 03 | A color literal on a widget outside `src/database/themes.js`. |
| `OFF_SCALE_SPACING` | 07 | A padding, margin, gap or size off the spacing scale — including inside a `"12px 20px"` shorthand. |
| `OFF_SCALE_RADIUS` | 03 | A corner radius that is not a scale step. |
| `OFF_SCALE_TYPE` | 08 | A font size off the type scale. |
| `SMALL_TAP_TARGET` | 03 | A pressable widget under the Fitts floor, including a bare `Icon` with `onPress`. The floor is a scale value, so rule 03 owns it. |
| `LOW_CONTRAST` | 11 | Text measured below AA against the fill it actually sits on. |
| `UNLABELED_FIELD` | 13 | An `Input` or `Dropdown` with neither a `label` nor a `placeholder`. |
| `UNLABELED_TOGGLE` | 11 | A `Switch`, `Checkbox` or `Radio` with nothing to say what it toggles. |
| `DESTRUCTIVE_COLOR` | 14 | A delete/remove verb rendered in the brand fill instead of the danger one. |
| `UNREADABLE` | 00 | A file the scanner could not parse, reported rather than skipped — and nothing else in that file was judged. |

### Warnings (fail with `--strict`)

| Code | Rule | What it catches |
| --- | --- | --- |
| `LOW_CONTRAST_SOFT` | 11 | Text that clears AA only because of its size. |
| `LOW_CONTRAST_UI` | 11 | A graphic that carries meaning below 3:1. |
| `LOW_CONTRAST_ON_SURFACE` | 11 | Text measured against `background` and `surface` at once, when the fill is inherited. |
| `HAND_MIXED_COLOR` | 03 | `colors.primary + "22"` — a one-off shade no other screen can reuse. |
| `DEAD_ELEVATION` | 10 | A numeric `elevation` on a widget that never reads it: CSS drops the bare number and the box stays flat in silence. |
| `IMAGE_NO_ALT` | 11 | An `Image` with no `alt` — `alt: ""` is a decision, a missing prop is an oversight. |
| `ICON_ONLY_CONTROL` | 11 | A pressable glyph with no name; wrap it in `Tooltip({ text, child })`. |
| `CENTERED_BODY_TEXT` | 08 | A paragraph centered; a paragraph needs a left edge to find the next line. |
| `GENERIC_ACTION_LABEL` | 14 | "OK", "Submit", "Click here" — a label that says nothing about what pressing it does. |
| `CONFIRM_ORDER` | 14 | A destructive button placed before Cancel in the same row. |
| `UNCONSTRAINED_FORM_WIDTH` | 13 | A form block whose fields run to the full width of a desktop window. |

### Informational

| Code | Rule | What it says |
| --- | --- | --- |
| `SMALL_PRESET` | 03 | `size: "small"` on a control that is the screen's main action (~30px). |
| `CROWDED_FORM` | 06 | Many fields in one file: group them, or split the task. |
| `LIST_WITHOUT_STATE` | 12 | A list with no loading, empty or failed state in this file. |
| `MULTIPLE_PRIMARY_ACTIONS` | 04 | Several filled buttons on one screen. |

## Running the gate

```bash
flet-box check-ui                 # scan ./src
flet-box check-ui --root ../my-app  # scan another project
flet-box check-ui --tokens        # print the measured token contrast table
flet-box check-ui --strict        # warnings fail too
flet-box check-ui --json          # machine-readable findings
```

Aliases: `flet-box ui`, `flet-box checkUi`. Exit code is `1` when an error is
present (or a warning, with `--strict`), so it fits in CI as the app's
`npm run ui`.

`--tokens` is the one worth reading before you pick colors. It prints the
measured ratio of every token against `background` and `surface` — for the
palette in use, so switch the theme and read it again if you ship both. A brand
color that looks fine and measures 2.15:1 (`colors.warning`, decoration only)
becomes a number instead of an argument, and the table already tells you which
tokens clear AA body text, which are large-text-or-UI only, and on which fill
writing text is a mistake.

## Fixing a finding

Fix the code, not the checker. A finding you keep needs one sentence of
justification — in the commit or in the file — because the next person, human or
agent, will otherwise copy the exception as if it were the rule.

And a rule you had to break is information about the rule: if the exception was
right twice, it is a defect in the scale, not in the app.

## What no checker can see

`check-ui` has no eyes. It cannot tell you that the screen is ugly, that the
hierarchy reads wrong at a glance, or that the flow does not solve the user's
problem. Those are rules 17, 19, 21 and 23 — composition, the tells, the review
and this section — and they are the ones that need a person.
Run the gate, then open the page.

## Related pages

- [FletBox utilities](utilities.md) — the theme and layout helpers the tokens come from.
- [Themes](../tools/theme.md) — `registerPalette`, the call that gets your brand onto the page.
- [The CLI](../cli/README.md) — every command, including `check-api` and `unpack`.
- [Widget structure](widget-structure.md) — how a widget is built, and where its defaults live.

---

## Continue reading

- **Previous:** [The CLI](../cli/README.md) — Chapter 11
- **Next:** [Minify and protect a FletBox build](minification-and-protection.md) — Appendix A
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 12 · Clean UI**.
