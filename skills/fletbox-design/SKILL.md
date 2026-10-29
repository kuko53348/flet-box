---
name: fletbox-design
description: The design contract for a FletBox app - tokens only, one scale, three-tier hierarchy, a state for every interaction, measured contrast, composition that starts as a sentence, the dated visual tells that give away a template, destructive actions designed last, and Part II, the visual atlas: six style archetypes with their surface ramps, accent budget, number-as-hero typography, nested radii, photo-and-sheet composition, control shapes, data widgets and per-genre recipes. Use when creating, editing or reviewing any screen, form, list, dialog, hero or action control, or when choosing how a screen should look.
---

# Design — the system rules for a FletBox screen

You are not decorating screens. You are extending a system that every later
screen will copy. A decision that cannot be restated as a rule is a defect, not
a style.

When two goals conflict, take them in this order:

1 Consistency · 2 Clarity · 3 Accessibility · 4 Usability · 5 Scalability
· 6 Maintainability · 7 Conversion

Never optimize for aesthetics alone. Beauty is what is left when the system is
correct; it is an outcome, never a target you can hit directly.

## 00 The two gates

```bash
npm run check      # the API is real: widgets, props, imports
npm run ui         # the screen follows these rules (codes map to rule numbers)
npm run ui -- --tokens   # measured contrast of every token, on both surfaces
npm run dev        # then look at it: the checker has no eyes
```

A finding you keep needs one sentence of justification, in the commit or in
`.fletbox/memory/`. If that sentence is "the design wants it", the design is
what needs writing down, because the next screen will copy it.

A file the gate cannot parse comes back `UNREADABLE` and nothing else in it is
judged — the screen is not clean, it is unmeasured. Fix the syntax before
reading the rest of the list.

Sources, cited as `NBG p.N` (No bullshit guide to UX) and `Playbook p.N`
(The UI/UX Playbook; the PDF page — the printed folio is one lower). Every
number below is either stated by one of them or measured on this palette.
Every prop in every call below exists in `.fletbox/api/api.json`.

## 01 System before component

Define the token, then the component, then the screen. In that order, always.
Components are outputs; the system is the source of truth.

- A screen that needs a value the system does not have adds a token to
  `src/database/themes.js`. It does not write the value inline.
- A component that needs a special exception: challenge the exception first, and
  if it survives, change its siblings too. Two components solving one problem
  differently get unified, not documented.
- If you cannot say which rule a decision follows, do not make it.

## 02 Consistency is sacred

No arbitrary differences. If a person learns one pattern here, they must not
relearn it anywhere else (Playbook p.038).

- One button scheme for the whole app: the primary is `variant: "filled"`, the
  secondary `variant: "outlined"`, the tertiary `variant: "text"`. Never a
  per-card button color chosen to match the picture — people then wonder whether
  each button does something different (p.040-041).
  A filled `Button` defaults to `bgColor: colors.surface` with `colors.text` on
  it, so the primary action must name the brand pair: `bgColor: colors.primary`
  and `color: colors.onPrimary`. An outlined one must name its border (`color:`),
  or it inherits the surface it sits on and disappears.
- One radius language per screen. A rounded picture next to a square button reads
  as two products (p.039).
- One icon family, one weight, one size per screen. The one allowed mix is state:
  a selected tab filled, unselected tabs outlined (p.045-046).
- Cards in the same row share a height. When the copy is uncontrollable, fix the
  height and bottom-align the action; the empty space goes in the middle
  (p.043-044).
- Same purpose, same shape: identical inputs get the same `height`,
  `borderRadius`, states and validation behavior (rule 13).
- Images inside a repeated card sit in the same slot, same size, same crop
  (`fit`, `shape`), whatever the picture is (p.042).

## 03 Design tokens only

No arbitrary values, no hex, no `px` strings. Every value comes from the scale.

```
space    4 · 8 · 12 · 16 · 18 · 24 · 32 · 40 · 48 · 64 · 96
radius   4 · 8 · 12 · 16 · 20 · 24 · 999 (pill)
type     12 caption · 14 body-small · 16 body · 18 subtitle · 24 title
         32 headline · 40 display-sm · 48 display
weight   400 body · 500 label · 600 title · 700 headline
line     1.5-1.6 body · 1.2-1.3 heading
depth    elevation 0 · 1 · 2 · 3 · 4 · 5
```

- The base unit is 4 and everything is a multiple of it (Playbook p.028). A value
  like 13, 19, 21 or 31 is not a design decision, it is drift. A radius between
  two steps — the 15 beside the 16, the 18 beside a 24 — is the same drift on the
  corner (`OFF_SCALE_RADIUS`), and it is what makes a rounded picture sit next to a
  square button like two products. The scale reaches 24 because `Drawer`,
  `DrawerItem` and the `Tabs` slider already default there: an app matching its own
  widgets cannot be off-scale.
- Never type a hex or `rgb()` outside `src/database/themes.js`
  (`RAW_COLOR`). If a token is missing, add it there.
- Never build a color by appending alpha to a token — `colors.primary + "15"` is
  a one-off shade the rest of the app cannot reuse (`HAND_MIXED_COLOR`). The
  tints exist: `colors.primaryBg`, `colors.errorBg`, `colors.successBg`,
  `colors.warningBg`, `colors.infoBg`.
- A frosted surface is `colors.glass` with `colors.glassBorder` and a
  `backdropFilter`; it is translucent on purpose, so put it over imagery,
  not over body text. A hand-written `rgba()` is a `RAW_COLOR` like any other.
- Text on a brand fill is `colors.onPrimary`, never a literal white.
- Tap targets are at least 40 on a side (`SMALL_TAP_TARGET`). Reach it with
  `height`, not with padding. The books argue this qualitatively (Fitts, p.099);
  40 is the floor this system enforces and 44 is what a phone primary action
  gets.
- `size: "small"` on a `Button` is for dense secondary actions, never for the one
  thing a phone screen asks for — a preset that lands under the 40 floor is
  reported as `SMALL_PRESET` even though no number was typed: the preset is the
  decision, and it was made by the framework, so it has to be overridden with a
  `height`.

## 04 Hierarchy must be obvious in three seconds

A person must answer three questions without reading: what is this, what
matters, what happens next. There are exactly four levers — size, color, weight,
position (Playbook p.007). If everything is emphasized, nothing is.

- One primary action per screen. One secondary. Everything else is tertiary.
  Never two filled buttons on one view (`MULTIPLE_PRIMARY_ACTIONS`).
- Actions rank by emphasis, information ranks by size: the secondary button keeps
  the same `height` as the primary and loses color (p.008); the data gets the
  size ladder (p.088). That is how p.008 and p.088 stop contradicting each other.
- In a stat card the value is the largest and darkest text and the label is
  smaller and muted. Never the inverse (p.010).
- Darkness means importance: heading darker than body, body muted. Never let a
  thumbnail outsize the price (p.009, p.011).
- Never render a detail panel as uniform label:value rows — it has no hierarchy
  and cannot be scanned. Promote the one value that matters, demote the rest,
  add an icon per row (p.012).
- Before building, list the elements and rank them by user importance; then map
  size, color, weight and position onto that ranking (p.010).

## 05 One purpose per screen

Write the sentence first: "this screen lets <who> do <what>". If it needs an
"and", split the screen (NBG pp.40-43).

- Conflicting goals reduce usability. A task screen carries nothing that does not
  serve the task: no promo panel, no second call to action (Playbook p.127).
- Decorative imagery next to a form is allowed only when it is action-free — no
  text overlay, no button — and it still has to be about this product, not merely
  pretty (p.128).
- Navigation exposes what the job needs and nothing else. Every extra link is a
  decision taken before the user made theirs.

## 06 Reduce cognitive load

People recognize; they must never memorize, guess or interpret.

- Chunk to about four items per group and cap a visible group at 7; past that,
  truncate and expose one action — "Show all 21 amenities" (Playbook p.101).
  The 7±2 figure is a myth in its loosest form; plan on four and the group still
  holds when someone adds a fifth.
- Recognition over recall: common icons, common words, state visible on screen
  rather than in memory (p.104). "Continue watching" beats "remember where you
  stopped".
- Do not hide choices behind a control that must be opened to be seen: variants
  as swatches, quantity as a stepper, not a nested menu (p.107-108).
- Never oversimplify into vagueness either: a switch with an icon and no words is
  not clean, it is unreadable (p.014).
- If no user has shown they need a feature, remove it rather than park it behind
  a toggle (NBG p.136).
- A file that builds a dozen fields at once is a wall, not a step. The gate counts
  them (`CROWDED_FORM`); the fix is grouping or splitting the task (rule 13), not
  smaller text.

## 07 Spacing communicates the relationship

Whitespace is functional, not decorative. Related things sit closer than
unrelated things, and that difference is the whole message (Playbook p.013, p.029).

- Field pattern: label to its own input `12`, that field to the next label `32`.
  Equal spacing at both levels makes label ownership ambiguous (p.013). A number
  between two steps of the spacing scale is the same mistake written smaller, and
  the gate names it (`OFF_SCALE_SPACING`) wherever it appears — including inside a
  `"12px 20px"` shorthand, because a shorthand is four decisions in one string.
- Card padding is `16`; the rhythm between cards is `16` or `24`; sections
  separate at `24` or `32`; page blocks at `48`. Never mix two rhythms in one list.
- Start a layout with more room than you think you need and tighten it; clutter
  is easier to see than cramp is to undo (p.025-027).
- Do not stretch a form or a checkout to the viewport. 1440 is a canvas size, not
  a target; give the card the width it needs and let the margin carry the rest
  (p.129-130). `Container({ maxWidth: 480 })` around a form, `fullWidth: true`
  only on the button inside it.
- Layout is `useState` bindings, `flex`, `gap` and `wrap`. An absolute offset is
  for overlays, and then through `stackPosition`, not raw coordinates.

## 08 Typography is structure

- Body is `size: 16` (Playbook p.090). Nothing that must be read goes below 12;
  the book contradicts itself between 12 (p.090) and 10 (p.096) — 12 is the floor
  here. A size between two steps of the type scale is reported as
  `OFF_SCALE_TYPE`: the 15 beside the 16 does not read as hierarchy, it reads as
  a mistake — two steps per jump, one role per size.
- Heading: bigger, heavier, darker, tighter. Body: smaller, regular, muted,
  looser. Never the same weight for both, never extra-light for body (p.084-087).
- Line-height: 1.5-1.6 on body, 1.2-1.3 on headings; a 32px heading sits at about
  1.25 (p.091-092). A heading never gets more air than a paragraph.
- Measure: 45-75 characters per line on desktop, 30-40 on mobile. A paragraph
  that runs the full width is unreadable at 1440 (p.076-078).
- One typeface; two at the absolute maximum, and then headings against body
  (p.075-076). Declare it once — `loadFont("Inter", { weights: [400, 600] })` and
  one `fontFamily` on the screen's root — never per `Text`. There is no font on
  the theme: `fontFamily` is a routed prop, and the loader is what puts the bytes
  behind the name.
- `align: "left"` for every run of text and every list. `right` for numbers and
  prices, so magnitudes compare. `center` only for a short title or a lone CTA,
  never for a paragraph (p.018, p.094) — a centered paragraph is reported as
  `CENTERED_BODY_TEXT`, because an eye that has to find the left edge again on
  every line is doing the layout's work for it.
- Long copy becomes scannable copy: a short lead, a heading, then one item per
  feature with an icon, a bold name and two lines of body; four or more items go
  in a two-column grid (p.123-125).

## 09 Color carries meaning

- One brand color per screen, and it is the color of the one action the screen
  asks for. A second accent on the same view means one of them is wrong.
- Reserve the brand for things you can click. Headers, labels and icons stay
  neutral — brand color on a decorative surface teaches people that color means
  nothing (Playbook p.066-067).
- Backgrounds are neutral (`colors.background`, `colors.surface`, `colors.card`);
  color belongs in the action, not the wall (p.067-068). A dark theme is equally
  valid; offer both, because dark mode is expected, not a bonus (p.070).
- Feedback colors are fixed and never redefined: `colors.success`,
  `colors.warning`, `colors.danger`, `colors.info`. Red is error, green is
  success, amber is warning; never pink for success, never green for delete.
- The signal red and the readable red are different tokens. `colors.danger`
  (#ef4444) is for a badge, a border, an icon: as words on a white page it
  measures 3.76:1 and that is not AA. `colors.dangerStrong` (#b91c1c) is the red
  you may read and press — 6.47:1 as words on white, 6.47:1 with white written on
  it, 5.42:1 inside `colors.errorBg`. Same for the others: `colors.warning`
  (2.15:1 with white on it) and `colors.success` (2.54:1) are plates and dots,
  never a sentence — `colors.warningStrong` (5.02:1) and `colors.successStrong`
  (5.48:1) are the readable ones, in either direction. Measure any pair you are
  about to ship: `npm run ui -- --tokens`.
- Never carry meaning in color alone — a color-blind person and a phone in
  sunlight both lose it. Pair the color with an icon and a word (p.070): a status
  chip is `Badge` plus text, a field error is `error` plus `showValidationMessage`.
- Hierarchy inside a fill comes from opacity, not from a second hue.

## 10 Depth is a scale

- `elevation: 0-5` is the shadow scale the framework ships (`SHADOW_LEVELS`), and
  these widgets read it: `Accordion`, `AppBar`, `BottomNavigation`, `Button`,
  `Card`, `Chip`, `Drawer`, `FloatingActionButton`, `ListTile`, `Modal`, `SnackBar`.
  Elsewhere — `Container` and `ListView` included — the number reaches
  `style.boxShadow` as a bare number, CSS drops it, and the box stays flat
  without saying so: pass a `shadow: "0 12px 32px rgba(15,23,42,0.12)"` string
  there instead (`DEAD_ELEVATION`).
- Anything that floats gets depth: a dropdown, a menu, a modal, a card on a map.
  A shadowless layer merges with the page and the user cannot tell what is on top
  (p.050-051).
- Soft, not harsh: depth comes from a wide blur at low opacity, and the shadow
  is tinted toward the background hue, never pure grey or black (p.052-054).
- Do not put a white card on a white page — the interface goes flat. Page
  `colors.background`, card `colors.card` (p.056-057).
- Borders are thin and rare. Separation comes from space and surface, not from a
  rule under every row; a bordered list of everything reads as busy and dated
  (p.059-061).
- Glass and blur are a brand decision, and they never survive a light background:
  text on frosted glass over white loses the contrast war (p.063-065).

## 11 Accessibility is a floor, not a feature

When accessibility and aesthetics conflict, accessibility wins. Every time.

- Text needs 4.5:1 against what it sits on; large text (24px, or 18px bold) and
  meaningful graphics need 3:1. Disabled text is exempt. The book agrees: its
  passing examples measure 4.8-6.54:1 and its failures 1.81-2.84:1 (p.021), and
  #626262 is the lightest grey that survives on white (p.086).
- Measure instead of arguing: `npm run ui -- --tokens`. On this palette `text` is
  17.85:1, `textSecondary` 4.76:1, `textDisabled` 2.56:1 (decoration only), and
  the brand pair `onPrimary` on `primary` is 4.55:1 — which is why `primary` may
  carry a button label and not a paragraph. By hand:
  `color("#0f172a").contrastRatio("#ffffff")` answers 17.85.
- The gate's four contrast codes are four different sentences, and treating them
  as one noise is how a real one gets dismissed. `LOW_CONTRAST` is under 3:1 — no
  size, no weight and no theme rescues those words. `LOW_CONTRAST_SOFT` is
  between 3:1 and 4.5:1: legal as large text only (24px, or 18px bold), so either
  promote the run or darken the token. `LOW_CONTRAST_ON_SURFACE` is a run with no
  fill of its own measured against `background` and `surface` — the color you
  wrote is a plate, not an ink, or the words are sitting on a fill the call never
  named. `LOW_CONTRAST_UI` is a graphic that carries meaning under 3:1; an icon
  next to a label that already says the same thing is decoration and can be kept.
- Text over a photograph needs a scrim: a dark overlay or a blurred plate under
  the words. Light text over one dark photo proves nothing about the next photo
  (p.022).
- Every field has a visible `label`; a placeholder is a format hint, never a
  substitute (p.115). Every switch and checkbox has one too (`UNLABELED_TOGGLE`).
- Every control that is only an icon gets a name: `aria-label` on the control
  itself, or a visible label beside it (`ICON_ONLY_CONTROL`). A `Tooltip` is a
  description — it explains the control, it does not name it.
- Every `Image` that carries information has `alt`; `alt: ""` is the correct
  answer for a decoration (`IMAGE_NO_ALT`).
- Focus must be visible, keyboard must reach everything, and `Esc` must close
  whatever opened (`Modal({ closeOnEsc: true, showCloseButton: true })`).
- Motion is optional content: respect a reduced-motion preference; never
  auto-play a carousel or a banner. FletBox listens (`prefersReducedMotion()`,
  `setMotionMode('reduce')`) and the engine obeys it, so a hand-written
  `requestAnimationFrame` is the only way to ignore it — see `fletbox-motion`.

## 12 Every interaction has four states

A control that handles only the happy path is unfinished (NBG pp.94-97). Write
all four, in the same component, before the screen counts as done.

```js
Column({ gap: 16, children: [
  loading ? Skeleton({ width: "100%", height: 48, count: 3 }) : null,
  !loading && rows.length === 0
    ? Column({ gap: 16, alignItems: "center", children: [
        Icon({ name: "inbox", size: 48, color: colors.textSecondary }),
        Text({ text: "No projects yet", size: 18, weight: "bold" }),
        Text({ text: "Create one to see it here.", size: 14,
               color: colors.textSecondary, align: "center" }),
        Button({ text: "New project", onPress: create }),
      ]})                                  // headline + illustration + tip + CTA
    : null,
  failed
    ? SnackBar({ message: "Could not load the list.", action: "Retry", onAction: retry })
    : null,
  !loading && rows.length > 0 ? ListView({ children: rows }) : null,
]})
```

- Empty has four parts: a solution-oriented headline, an illustration, two
  concrete tips, one primary action. "You have no projects" is a dead end, not a
  state (Playbook p.135-136).
- Loading appears before the wait, not after it: a `Skeleton` at once beats a
  spinner two seconds later (NBG p.134, Doherty).
- Error does exactly three things: says what went wrong in the user's words,
  gives the way back, keeps the visual style of the app. Show the code, keep the
  navigation, offer links (p.137-138). Never an error code alone, never a shrug.
- Success confirms in place — a `SnackBar`, not a new screen — and offers the
  next step while it is there.
- Progress is honest. Show real progress or show a `Skeleton`; a bar that lies
  buys one visit and costs the next one (NBG defends inflating them; do not).
- The gate knows this rule: a file that renders a list and names none of the
  other three states is reported as `LIST_WITHOUT_STATE`. Silence is the bug it
  is looking for, so do not hush it with a comment — add the state.

## 13 Forms: prevent the error, do not report it

- Ask for 3 to 7 things at once. More than that is more than one step, and a step
  the user can see: `Stepper({ steps, activeStep, onFinish })` (NBG pp.40-43).
- Width fits the data: CVC is 3 or 4 characters, so the field is short; card
  number and name run full width; pair Expiry with CVC on one row (p.115-116).
- A column of three or more fields lives inside a cap — `Container({ maxWidth:
  480 })`. A field as wide as the window answers "type anything" and the eye
  loses the next line (`UNCONSTRAINED_FORM_WIDTH`).
- A fixed-length code gets one box per character in enlarged type, not one long
  field (p.114).
- `Input({ label, placeholder, required, maxLength, validation, type })`:
  placeholder carries the format ("MM/YY", "12345"), `maxLength` and `type`
  constrain the input, and validation runs inline as they type, not on submit
  (p.119). A field that has neither is `UNLABELED_FIELD`, and the label is also
  the name a screen reader says out loud.
- No "Confirm password" field. It adds cost, repeats the same typo twice, and
  buys a false sense of safety. One field, `passwordToggle: true`, and a strength
  line under it (p.117-119).
- Good defaults and autofill remove keystrokes: prefill the country, the saved
  address, the last card (p.105).
- Required fields are marked, and the label of the submit button names the
  outcome — "Pay $65", not "Submit" (p.115).
- Never clear a form because one field failed. Keep what they typed.

## 14 Destructive actions are designed last, and carefully

- The button carries the verb: "Delete 3 files", never "OK" or "Yes"
  (`GENERIC_ACTION_LABEL`) (Playbook p.121).
- Destructive is red — `colors.dangerStrong` for the words, `colors.danger` for
  the dot beside them — because green reads safe and a person presses it twice
  (`DESTRUCTIVE_COLOR`) (p.120). `colors.danger` alone is 3.76:1 as a label.
- Order in a two-button row: Cancel on the left, destructive on the right. Left
  is what a reading eye hits first (`CONFIRM_ORDER`) (p.121-122).
- The dialog states reversibility: "This action cannot be undone." Say it even
  when it can, and then offer the way back.
- `AlertDialog({ title, message, confirmText, cancelText, showCancel, onCancel, onConfirm, onClose })`
  always leaves an escape: a Cancel, and an X on any layer that can be opened.
- Undo is cheaper than a warning. If the action is reversible, let people undo it
  instead of interrupting them to confirm it (NBG pp.116-118).
- On a phone, a destructive action is not in the thumb zone; the thing you do
  often is (p.133-135).

## 15 Reduce interaction cost

Interaction cost is cognitive effort + physical effort + time (Playbook p.098).
Count it, then cut it: reading, scrolling, searching, deciding, clicking, typing,
waiting, remembering (p.099).

- Count the steps in the main flow and delete every one that does not change the
  outcome (p.105). Three is a target; one is better.
- Put the action next to the thing it acts on: the CTA beside the quantity
  stepper, the row action inside the row (p.108, Fitts).
- Keep the control that runs all the time in a fixed, reachable place — a player
  bar at the bottom, a primary tab at the thumb (p.100, p.133-135).
- Show the content instead of a door to the content: three real cards beat a
  banner that says "Explore now" (p.111-113).
- One click where a confirmation is not needed. Two where it is.

## 16 Respect the platform

- Use the words, icons and gestures people already brought with them (NBG p.131,
  Jakob's law). An invented gesture is a bug report waiting to be written.
- iOS, Android and web each have conventions; meet them instead of overriding
  them with a custom pattern. A back that lands where the user expects, a sheet
  that dismisses down, a form that advances on Enter.
- Break a convention only when the measurement says the convention is wrong here,
  and write that measurement down.

### The phone range is the test device — strict

"Fine on my phone" is not a measurement. Every phone is `xs` in the breakpoint
table, so nothing in the shell changes between 320 and 430; the layout has to.
Compose at 360 and prove the screen at each width below, in portrait:

| Width × height | Device | What that width judges |
| --- | --- | --- |
| 320 × 568 | iPhone SE 1 / small Android | **the floor** — nothing overflows or clips |
| 360 × 640 | Android baseline | **compose here first**, the cramped common case |
| 375 × 667 | iPhone SE 2/3 | narrow and tall |
| 390 × 844 | iPhone 12/13/14 | the modern default |
| 393 × 852 | iPhone 14 Pro / 15 / 16 | notch and home indicator |
| 412 × 915 | Pixel 7 | large Android |
| 430 × 932 | iPhone 14/15 Pro Max | **the ceiling** — no measure so wide it loses the eye |

- At 320 nothing overflows or clips: `scrollWidth <= clientWidth` on the page
  and on every bar, and no label ellipsized because its row ran out of room.
- A heading whose text the app does not control — a lesson name, a chapter, a
  user's title — is `24` on a phone and `32` only where the layout is wide
  (`atLeast("md")`). At 360 a 55-character name at `32` is four lines, and the
  tab strip under it leaves the first screen. The size steps down; the copy is
  never cut to fit it.
- Fixed chrome is inside the 320 budget, not outside it: an app bar title plus
  its actions, a tab strip, a labeled bottom bar. If a bar needs more than 320,
  shorten what it says — never let it scroll sideways.
- Verify by resizing the viewport at each width and reading the layout that
  results, not by scaling a 1440 composition down.

## 17 Composition starts as a sentence

Before the first widget, write four lines: what this screen decides for the
user, the three pieces of information that carry it, and the one action. Then
lay out those four things. A screen that starts as "a hero, then three cards,
then a footer" is a template, and it gets filled with whatever is handy.

- The type scale caps at 48, so a headline cannot buy all of its presence from
  size. Take the rest from the two levers that are free: `weight: "bold"` on the
  title against `weight: "normal"` on the body, and `colors.text` against
  `colors.textSecondary`. That one step is what makes a screen look designed at
  375px, where 48 is already the ceiling.
- At most five sizes per screen, and at most one role per size.
- The accent is under 5% of the pixels. If a first-glance photo shows it twice,
  one of the two is not an accent (rule 09).
- Squint at the screen. What you can still read is the hierarchy. If what
  survives is a badge or an accent, rule 04 is not done.

## 18 The framework traps

Real FletBox behaviors, not opinions. Each one has already produced a "the UI is
broken" report, and none of them is something `npm run ui` can see:

- **`Container` is a column and it paints a surface.** Children stack
  vertically unless you pass `direction: "row"`, and it has a background — a
  `Container` around your content is a visible plate, not an invisible wrapper.
- **Widths default to 100%.** A `Button` inside a `Column` fills the screen
  unless it sits in a `Row` or gets a `width`. Use `fullWidth: true`
  deliberately on the one action a phone screen asks for; let the rest be sized
  by their content.
- **`flex: 1` needs a sibling that wants the space.** One flexible child in a
  fixed-height parent stretches; `justifyContent: "flex-start"` starves the
  `flex` you meant on the other axis.
- **`alignItems: "center"` centers the block, not the text.** A paragraph that
  wraps inside a centered column becomes a ragged stripe: center the heading,
  left-align the copy (rule 08).
- **Fluid first, breakpoint second.** `flex`, `wrap: true`, `maxWidth` and the rem
  contract carry one screen from phone to desktop with no decision at all, and
  that is the default. There is no breakpoint *prop* — when a shape genuinely
  changes (one column into two, a rail into a drawer), the change is made in the
  code that builds the tree, with the one table: `atLeast("md")` for the boolean,
  `currentBreakpoint()` for the name, a per-step value function for a number that
  really wants to be different at 400px and 1400px. `md` is 768, the same line
  `AdaptiveScaffold` crosses, so a screen and its shell cannot disagree. Read the
  width, never the user agent: `device.isMobile()` answers a platform question
  (long-press, a native back gesture), not a layout one. A screen built from two
  hard-coded layouts is two screens to maintain; a screen with one per-step value
  where the shape truly changes is one.
- Overlays go in a `Stack` with `stackPosition`, not in absolute coordinates on
  `Container({ pos: "absolute", top, left })`. The first survives a content
  change; the second is a pixel bomb in any language longer than English.

## 19 The dated tells

Each of these says "assembled from a template". Banned outright, with the reason
once so an edge case can be judged instead of guessed:

- **An eyebrow label** — a small uppercase word above a heading ("OVERVIEW",
  "GET STARTED"). Hierarchy cosplay: it names a section nobody asked to have
  named.
- **Numbered markers** `01 · 02 · 03` — they imply an order a feature list does
  not have.
- **Monospace outside code.** `Text({ styles: ["code"] })` means code. Using it
  to look technical is a costume.
- **A gradient headline, or a gradient behind everything.** `gradient` exists on
  `Button` and `AppBar`: it is one element's surface, never a text treatment.
- **Glass everywhere.** `colors.glass` with `colors.glassBorder` is for the one
  layer that really floats above scrolling content. Frosted cards on a solid page
  are a texture, not a hierarchy (rule 10).
- **A row of identical cards** — three plates with an icon, a title, two lines.
  If the content has no shape a list would reveal, it does not need four cards.
- **Resting shadows.** Depth answers "what is above what", never "make it pop"
  (rule 10).
- **A wall of centered text** (rule 08), and a hairline `Divider` under every
  row: a line that separates nothing is the fastest way a page looks dated.
- **Copy clichés** — "unlock", "elevate", "seamless", "empower", "leverage", a
  sentence that starts with "Whether you're…". Say the specific thing the product
  does. If you cannot, that is a content gap, not a font gap.

Deleting a tell is not a design. Every ban above needs the element that carries
the job instead: hierarchy from rule 17, separation from rule 07 or 10, emphasis
from rule 09, grouping from a `ListView` or a `gap`.

## 20 Density is one dial

Pick one row and hold it for the whole screen. Three numbers set it: a `gap`, a
`padding`, and a body `size`.

| Screen | gap | padding | body |
| --- | --- | --- | --- |
| Reading / marketing | 32 | 32 | 16 |
| Form | 16 | 24 | 16 |
| Working list / dashboard | 8 | 16 | 14 |

A dense screen is not a cramped one: the 40 tap floor and the 14 label floor
(rule 03, rule 11) still apply, and they are why "compact" has a hard limit.

## 21 The review

When asked to review a screen, answer in this order, and say why every time:

1 Goal — what the screen is for, and whether it is one goal.
2 UX problems — cost, states, recall, flow.
3 UI problems — hierarchy, spacing, type, color, depth.
4 System violations — the values that are not tokens, the component that is an
  exception.
5 Accessibility violations — measured ratios, targets, labels, focus.
6 Consistency violations — what this screen does differently for no reason.
7 Scalability risk — what breaks when this screen has eleven siblings.
8 Fix — the call, not the mood. Then the rule it establishes.
9 Score — see below.

Score the seven axes 0-100, but only against evidence, never against taste:
an axis starts at 100 and loses 10 for every open finding of its own codes, so
the number is a count and not an opinion. Below 85 on any axis means the fix is
a rule change, not a pixel move. An axis with no findings and no evidence is
unmeasured, not perfect — say so.

| Axis | Its codes (from `npm run ui`) |
| --- | --- |
| Consistency | OFF_SCALE_SPACING · OFF_SCALE_RADIUS · OFF_SCALE_TYPE · RAW_COLOR · HAND_MIXED_COLOR · DEAD_ELEVATION |
| Accessibility | LOW_CONTRAST · LOW_CONTRAST_UI · SMALL_TAP_TARGET · UNLABELED_FIELD · UNLABELED_TOGGLE · ICON_ONLY_CONTROL · IMAGE_NO_ALT |
| Usability | CROWDED_FORM · LIST_WITHOUT_STATE · UNCONSTRAINED_FORM_WIDTH |
| Hierarchy | MULTIPLE_PRIMARY_ACTIONS · CENTERED_BODY_TEXT · GENERIC_ACTION_LABEL · DESTRUCTIVE_COLOR · CONFIRM_ORDER |
| Scalability | every token that had to be added to make the screen pass |
| Conversion | the label of the primary action, counted in words and in steps |
| Visual quality | measured only by the axes above; state what you looked at |

## 22 Where these books are wrong

Both are worth more read than copied. The parts that do not survive measurement:

- The Playbook bans pure black on white and pure white on dark (p.083). This
  system puts white text on deep brand fills, and the ratio is what decides —
  4.55:1 there, not the rule of thumb.
- p.008 says a secondary button keeps the primary's size; p.088 says size is
  the hierarchy lever. Both are right about different things: emphasis ranks
  actions, size ranks information.
- p.079 marks center-aligned body as good; p.094 says center is for titles only.
  The later rule is the readable one.
- p.103 bans pop-ups as distractions; p.120 requires one to confirm a deletion.
  Reconciled: never unsolicited, always on destructive.
- p.019 (gutter 70, margin 79, overlay 17%) and p.052-054 (Y:12, blur:48,
  #E9E9E9) are one designer's Figma fields in a screenshot, not a scale.
  Do not harvest them as thresholds.
- The Playbook's own sign-up example (p.127) is white on a pale blue fill that
  fails its own contrast chapter. Copy the rule, never the screenshot.
- "7 ± 2" (p.101) is Miller's number quoted loosely; chunk size is a design
  choice, and four is the one that survives a fifth item.
- NBG defends inflating progress bars (its "little lie"). Do not.
- Neither book states a tap-target size in px. Fitts gives the direction; 40 is
  this system's floor, and the number to defend if someone asks.

## 23 What no checker can see

`npm run ui` cannot tell you whether the screen is understood. For that:

- Ask one person to do one task and stay quiet while they do it. Their first three
  sentences are the specification.
- Watch where the pointer hesitates and where it misclicks: that is where the
  layout is lying about what is tappable.
- Five people find most of what is broken. Two rounds of five beat one round of
  ten.
- Write what you saw into `.fletbox/memory/`, or the next session designs this
  screen again from taste.

## 24 The loop

```bash
npm run check
npm run ui
npm run dev        # look at the screen at 320, 430 and 1440px
```

Fix the code, not the checker. Then make the rule reusable: if the fix was right
for this screen, it is a rule for every screen, and it belongs in this file.

---

# PART II — THE VISUAL ATLAS

Rules 01-24 say what is legal. They do not say what to choose, and a screen that
is merely legal looks like nothing. Part II is the menu: the looks that hold up
for their own reasons, each reduced to the calls that produce it in this
framework. It is read after the rules, never instead of them — every recipe below
still has to pass `npm run check`, `npm run ui` and rules 01-24.

Nothing here cites a trend, a screenshot or a mood board. Each rule states its
mechanism — what the eye is actually doing, or what the CSS engine will and will
not accept — so an edge case can be judged from the reason instead of from the
precedent. Where a number appears it is either arithmetic (30), a measured ratio
from this palette (03, 11, 35), or a size the framework ships.

## 25 Three laws

One accent, one surface family, one hero. These three hold across mobile and web,
dark and light, and every genre; a screen that breaks any of them is not
stylistically bold, it is unreadable in a new way.

1. **One accent.** A neutral base plus exactly one saturated hue, spent on the
   action and the selected state and nowhere else (26, 28). Two accents force the
   eye to rank them, and it has no basis to rank them with.
2. **One surface family.** Either a tinted dark ramp or a tinted paper; never a
   black page with white cards, never a grey page with white cards (27).
3. **One hero.** The screen has one element that is 3-5× the rest — usually a
   number, once an image, rarely a word. Everything else is at reading size (29).

Squint test for the three: if you can still tell which element is the hero, and
how many colored things there are, the screen obeys them.

## 26 Pick an archetype, then obey it

Name the archetype in the commit or in `.fletbox/memory/` before the first
widget. A screen that mixes two of them is what rule 02 calls an exception.

| Archetype | Use it when | The tell you must get right |
| --- | --- | --- |
| Acid-on-black | finance, media, fitness, tools, anything glanceable | the accent is on one element only (28) |
| Tinted paper | commerce, food, wellness, content | the page is a wash of the accent, not grey (27) |
| Photo-bleed + sheet | travel, product detail, real estate, recipes | the sheet overlaps the photo, it does not sit under it (31) |
| Bento dashboard | dashboards, smart-home, admin | one tile is double-size and it is the hero (33) |
| Editorial luxury | watches, perfume, hotel, long-read | one serif, used for the name of the thing only (29) |
| Single-hue field | a brand moment: splash, campaign, empty state | the whole page is one hue, the text is its darker plate (27) |

The six are exhaustive of what survives review here. The look they are usually
reached for instead — violet mesh gradient, glass on every card, a 3D blob behind
the phone — is not a seventh archetype; it is in 36 as a dated tell, and it is the
one most often mistaken for a style.

## 27 Surfaces are never the extremes

Pure black under pure white is the one pair that always loses: `#000000` against
`#ffffff` measures 21:1, and an eye moving across a list at that ratio keeps
catching on the edges of every glyph. A large bright surface glows for the same
reason. So the extremes get replaced by steps, and the steps are where the
hierarchy lives. The shipped dark palette already obeys this — `background`
`#09090b`, `card` and `surface` `#18181b`, `border` `#27272a` — a three-step ramp
of one near-black hue. Use the steps, do not invent a fourth.

- **Dark.** Depth is a lighter plate, not a shadow: a shadow on a dark page is
  invisible, so the only signal available is value. Two steps maximum between the
  page and the topmost card; a third step is a bug, because nobody can tell step
  three from step two. A hairline `colors.border` rim replaces the shadow on an
  elevated card (rule 10: `Container` ignores `elevation` — pass `shadow` or
  `borderColor` there, never a bare number).
- **Paper.** The page is a low-chroma wash of the accent (`colors.primaryBg`
  exists for exactly this), the card is `colors.card`, and the tile inside the
  card is one step back. Grey page under white card is the wrong version of this
  look and reads as a wireframe: grey is a neutral, so it separates the card from
  nothing.
- **Single-hue field.** One hue carries the screen and the text is a darker or
  lighter plate of the same hue — never a second hue for contrast, because a
  second hue is a second accent and 25 allows one. In this framework that means a
  new token in `src/database/themes.js` per theme, not an inline mix:
  `colors.primary + "22"` is `HAND_MIXED_COLOR` (rule 03).
- **Never** a pure-`#fff` page under pure-`#000` text with nothing between: that
  pair is the failure this section exists to prevent, and the shipped light page
  is `#ffffff` only because `surface` is `#f8fafc` and does the separating.

## 28 The accent budget

The accent is a budget, not a color. It may appear on, and only on:

1. the one primary action;
2. the selected state of whatever chose it (chip, tab, nav icon, swatch);
3. the hero number, when the number is the point.

Everything else — headers, labels, icons, dividers, decorative plates — stays
neutral. This is rule 09's "reserve the brand for things you can click" with the
count added: three placements, and a fourth means one of them is not an accent.
The mechanism is learning: a color that appears on non-clickable things stops
being a cue, and the user stops reading it — so the CTA loses the very property
that made it findable.

- Secondary is the same ink, hollow: `variant: "outlined"` naming its own
  `color:`, or `variant: "text"`. Never a second hue for the second button.
- A gradient on the primary is legal only as **two shades of one hue** — a violet
  button running `#9D70F6 → #5520FF`, both declared as tokens, is still one
  accent. Cap any gradient at two hues: three is no longer a surface, it is an
  event, and it competes with the CTA for the same attention (36).
- Glow is the accent's only other permitted spend, and only on dark, because a
  bloom over a light page is indistinguishable from a smudge:
  `CircularBar({ glow: true, glowColor: colors.primary })`, or a tinted `shadow`
  string on the CTA. One glowing element per screen.
- A reader's choice does not raise the budget. `ThemePicker` lets them pick the
  hue; the three placements stay the only places it is spent. The picker marks
  the chosen square with the page's ink and a tick, never with the accent — a
  swatch selected in its own color says nothing the square does not already say,
  and rule 28 forbids spending the accent on the control that hands it out.
- A hue may also be worn as a **theme**, which is a different thing from spending
  it: `ThemePicker({ surfaces: true })` and `setAccent("teal", { surfaces: true })`
  derive the page, the panels, the cards and the hairlines from the same ramp, so
  the screen is tinted teal while the accent itself stays on its three placements.
  Only those five surface tokens move — the ink scale, `primaryBg` and every
  semantic signal keep the palette's values, which is what lets a tinted theme
  still say "this failed" in red — and `getAccentSurfaces()` answers which of the
  two the reader is wearing. Offer it when 27's paper archetype is the app's look;
  offer brand-only when the page is meant to stay neutral.
- An app that ships a brand color sets it at boot with
  `applyAccentPreference("teal")`, never with `setAccent`: the first paints a
  default without writing a preference down, so a reader who has already chosen
  still opens on their own hue; the second answers for them and stores it, which
  is the app overwriting a person on every load. A created app ships `neutral` —
  no hue, the page's own ink — so the picker opens with that square ticked and
  the reader leaves it, rather than choosing between twelve colors on a first
  visit.

## 29 The number is the hero

The composition every genre that shows a quantity should reach for: one oversized
tabular numeral, its label above it in muted text, and nothing else on the screen
competing. A magnitude read as a shape is understood faster than the same
magnitude read digit by digit, which is why the number gets the size and not the
heading.

```js
Column({ gap: 4, children: [
  Text({ text: "Total balance", size: 12, weight: 500, color: colors.textSecondary, letterSpacing: 0.4 }),
  Row({ alignItems: "flex-end", gap: 8, children: [
    Text({ text: "26072", size: 40, weight: 700, color: colors.text, letterSpacing: -0.8, lineHeight: 1.1 }),
    Text({ text: ".00", size: 18, weight: 500, color: colors.textSecondary }),
    Text({ text: "+4.2%", size: 14, weight: 600, color: colors.successStrong }),
  ]}),
]})
```

- The jump is 3-5× the body size, and the numeral is the only element at that
  size on the screen. Two heroes is zero heroes (rule 04).
- Decimals and currency marks one step down and muted: the eye is meant to read
  the magnitude first. `letterSpacing` goes slightly negative on big digits and
  positive on small caps labels — never both the same.
- Delta text is `colors.successStrong` / `colors.dangerStrong`, never the plate
  tokens (rule 09: `colors.success` is 2.54:1 with white on it and is a dot).
- Serif is a brand voice, not a font choice: one serif for the name of the thing
  (product, hotel, edition), sans for everything readable, and never a serif
  paragraph. Declare it once with `loadFont` and one `fontFamily` on the root,
  not per `Text` (rule 08).
- Uppercase with wide tracking is for a two-word label, never for a sentence,
  and never for the body: tracking destroys the word shape that a reader
  recognizes, so it costs speed everywhere it is not a single glance (rule 19's
  eyebrow ban still applies to the label above a heading).

## 30 Radius, nesting and the pill

- Controls are pills: `borderRadius` = half the height. Cards are 16-24. Inner
  thumbnails and tiles are 12-16, one step below their card.
- **A pill is a one-line shape.** `borderRadius: 999` reads as a control only
  while its height is about one line of its label: a label that wraps turns the
  fill into an egg and the capsule's rounded ends cut into the words. `Button`
  holds its label on one line and ellipsizes what does not fit, so a CTA that
  needs three lines is a copy bug wearing a pill. Keep the label a verb and its
  object — "Seguir la misión 1" — and leave the lesson title to the heading
  (rule 04). If the action genuinely needs a sentence, the control is a card or
  a list tile, not a button (rule 32).
- **The nesting rule**, as arithmetic: `outer = inner + padding`. A 16-radius
  tile inside 8 of padding needs a 24-radius card. Equal radii at both levels is
  the failure — the inner corner and the outer corner curve on the same radius,
  so the gap between them reads as a second box rather than as one plate.
- A radius between two steps is `OFF_SCALE_RADIUS` (rule 03), and the reason is
  perceptual, not bookkeeping: the corner is what people match by eye, so a 15
  beside a 16 looks like a mistake even when nobody can say why. 20 and 24 are
  steps, not neighbours — they are where the nesting rule lands, and where the
  framework's own drawers and tab indicators sit.
- One radius language per screen (rule 02). A pill button inside a 16-radius card
  on a 24-radius sheet is three languages; pick the card radius and let the
  controls be pills, since a pill is the one shape that reads as a control at any
  card radius.

```js
Card({ borderRadius: 24, padding: 16, children:
  Row({ gap: 12, alignItems: "center", children: [
    Image({ src: thumb, width: 56, height: 56, borderRadius: 12, fit: "cover", alt: "" }),
    Column({ gap: 2, children: [
      Text({ text: title, size: 16, weight: 600, color: colors.text }),
      Text({ text: subtitle, size: 12, color: colors.textSecondary }),
    ]}),
    Button({ text: "Add", variant: "filled", height: 36, borderRadius: 999 }),
  ]}),
})
```

## 31 Photo, scrim, sheet

The composition of every photo-led genre — travel, product detail, real estate,
recipes — and the one place a `Stack` earns its keep:

```js
Stack({ alignment: "bottom-left", height: 420, children: [
  Image({ src: hero, fit: "cover", alt: "The room as booked", full: true,
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }),
  Card({ borderRadius: 24, padding: 20, margin: 16, child:
    Text({ text: "From $128 a night", size: 18, weight: 600, color: colors.text }) }),
]})
```

- The sheet **overlaps** the photograph's bottom edge; a card placed under a
  photo is a caption, and a caption says the photo is the subject of the screen.
- Words over a photograph need a scrim, and the scrim belongs on the image
  (`maskImage`) or as its own plate (`colors.overlay`) — light text over one
  unscrimmed photo is the finding rule 11 already names.
- **Color harvest**: the page tint comes from the photograph's dominant hue, so
  the image and the interface are the same color event instead of two arguments.
  It is a token decision, so it goes into `src/database/themes.js` as a named
  tint, not an inline hex.
- **Glass is for the layer that floats over scrolling content** — the nav over a
  feed, the sheet over a photo. `colors.glass` with `colors.glassBorder` and
  `backdropFilter` on a solid page is a texture, not a hierarchy (rules 10, 19):
  translucency only means anything when there is something moving behind it.
  Translucency only means something when there is something moving behind it: a
  glass panel over a photograph reads as a layer, the same panel over a gradient
  reads as a smudge.

## 32 The shape of each control

| Job | The shape | The call |
| --- | --- | --- |
| choose 1 of 3-6 | pill row, one filled, rest hollow | `Chip({ variant: "filled" \| "outlined" })` in a `Row({ gap: 8, wrap: true })` |
| switch 2 views of one object | segmented pill with a sliding plate | `Tabs({ variant: "pills", tabs, activeIndex, activeTextColor, buttonColor })` |
| choose 1 of N with a preview | selection **tile**, not a radio list | `ListTile({ selected, selectedBgColor })`, or a 2-up `Row` of `Card`s |
| pick a color/size | dot row, selected gets a ring | `Avatar({ shape: "circle", size: 28 })` row, ring via `borderColor` + `borderWidth` |
| pick the app's accent | two-tone square per hue family | `ThemePicker({ size: 48, showLabels: true })` — it repaints the screen and remembers the choice; hand-built swatches do neither |
| count then buy | stepper merged into the CTA | one `Row` of `Button`s inside the add-to-cart bar, not two actions |
| navigate the app | bottom bar, active = accent + label | `BottomNavigation({ items, currentIndex, selectedColor, unselectedColor, showLabels: true })` |
| a badge on an icon | dot, never a word | `Badge({ value, size, offset, borderColor: colors.background })` |

- Selected state is **inverted**, not tinted: on dark, the selected chip goes
  white-with-black-text among hollow dark chips. An inversion is seen before it
  is read, and it survives a color-blind user; a slightly lighter grey is the
  same hue at a value nobody can compare across a row.
- Disabled is a desaturated gray token, not the same color at 40% opacity,
  because opacity fades the text into whatever is behind it and changes its
  contrast per surface. `colors.textDisabled` is already a different hue rather
  than a fade for exactly that reason (rule 03).
- Quantity, variant and price live in the same row as the action that spends them
  (rule 15, Fitts). The same rule written as a label is cheaper still:
  `Button({ text: "Add to cart · $34.21" })` — the decision and its cost are one
  read instead of two.

## 33 Data: the dial, the bento, the axis-less chart

- **Dial as hero.** One KPI gets a ring, not a chart:
  `CircularBar({ value, max, size: 180, strokeWidth: 14, lineCap: "round", label, subtitle, valueSize: 32, showValue: true })`.
  The number sits inside the ring, so the gauge and the hero are one object and
  one read. One per screen; a second ring is a decoration.
- **Bento.** Two columns, mixed heights, uniform radius, one tile double-size and
  that tile is the hero: `GridView({ columns: 2, spacing: 12 })` with tiles of
  different `height`, or a `Row` + `Column` pair when the spans get awkward.
  Gaps stay on the 4-scale (rule 03); dense is not the same as tight.
- **Zero-label charts.** A sparkline with one number beats an axis:
  `Chart({ type: "area", data, smooth: true, areaGradient: true, showGrid: false, showLabels: false, lineColor: colors.primary })`.
  Gridlines ask the reader to measure; the delta text tells them the answer, and
  the shape of the line carries the trend.
- A chart's series color is the accent; its second series is a neutral, not a
  second hue (rule 09). `Chart({ barColor })` and `lineColor` take tokens.
- Skeletons, not spinners, and the shape of the skeleton is the shape of the
  thing: `Skeleton({ count: 3, height: 72, borderRadius: 16, gap: 12 })` under a
  list of 72-tall rows (rule 12).

## 34 Genre recipes

The moves each genre is made of. Each is a starting composition, not a
permission slip: rules 01-24 still decide what ships.

| Genre | The five moves |
| --- | --- |
| Onboarding | full-bleed image or one-hue field · one line at display size · dots or a ghost skip · one pill CTA at the bottom · nothing tappable else |
| Dashboard | greeting + avatar · one hero number or card · 2-up tinted stat tiles · one chart, no axes · `BottomNavigation` |
| Commerce list | pill search · horizontal `Chip` rail · 2-col `GridView` of image-first cards · price bold, strike-through muted · a circular add on the card |
| Product detail | photo top half · sheet overlapping it with 24 top radius · dot swatch + size pills · sticky bar with price inside the CTA |
| Wallet | dark ramp · card plate as the hero · signed rows, `+` in `successStrong`, `-` in `dangerStrong` · tabular amounts right-aligned |
| Media player | artwork blurred as the page tint · square art · thin `ProgressBar` · circular transport row · no other chrome |
| Social feed | story rail of `Avatar`s · full-bleed post cards · actions under the image, centered as a group · one accent for the like state only |
| Travel | destination photo with scrim · date/guest pill row · horizontal card carousel with a peek of the next · price chip on the image |
| Health | one or three rings · a 7-bar week strip · mint or lime accent on dark · the number inside the ring |
| Settings | grouped rows, `ListTile` · leading icon in a tinted plate · trailing chevron or `Switch` · one section cap per group, no hairline between rows |
| Web landing | transparent `AppBar` · display headline with one word in the accent · pill CTA + ghost pair · a three-number stat strip · card row below |

## 35 Deriving a palette

A theme is five roles, not five colors:

```
anchor   the darkest surface, never #000
primary  the one hue the screen spends
accent   a warm counter-hue, used at most once per screen
wash     the tinted paper the page sits on
ink      white or near-white, and its opacity tiers
```

- **Ramp, not swatch.** A family is 5-7 stops (base → tint → accent → shadow).
  Build it as a ramp so a card, a tile and a plate can be three steps of one hue
  instead of three hues — which is the only way 27's surface discipline is
  possible without breaking 25's one-accent law. The framework already does this
  arithmetic for a reader who asks for a colored app: `setAccent(id,
  { surfaces: true })` takes the five stops it ships and writes `background`,
  `surface`, `card`, `border` and `divider` off them (palest → wash → white card →
  wash darkened, light; the deep stop scaled toward black in four steps, dark), so
  a tinted theme is a call, not a hand-mixed set of hexes.
- **A preset beats a mid-tone.** An app that has no ramp of its own does not pick
  a blue and hope: it takes one of the twelve families the framework ships
  (`listAccents()`, `listAccentRamps()` to see the stops) and paints a **stop** of
  that ramp, so `colors.primary` and `colors.primaryBg` are two steps of one
  gradient and never a hue plus a guess. Each pair is bought with seven measured
  numbers per theme: the accent carries its own label at 4.5:1, reads as text on
  the page at 4.5:1 and as a glyph on a card at 3:1, its wash holds page ink,
  secondary ink and the accent at 4.5:1, and the wash lifts off the background by
  1.04-1.5. That is why `#3b82f6` is not a brand color — white words on it
  measure 3.15:1 — and why a hue the list lacks is registered instead of
  invented: `registerAccent` takes an `id`, a `label` and a `light`/`dark` pair —
  one hex each, or a five-stop ramp, whose stop 0 (light) and stop 1 (dark) are
  the ones painted and whose wash is a stop further along the same direction.
  Run a ramp the other way and the plate lands *under* the accent instead of just
  off the page. It belongs in `src/database/themes.js` beside the palette it
  feeds (rule 03), and a registered pair answers to the same veto as a hand-built
  one. What `flet-box create` boots is the `neutral` family — the accent is the
  page's own ink, so an unfinished app reads as paper and type rather than as
  somebody else's brand — and the first change a designer makes is that id.
- **The light/dark pair rule**: for the same hue in both palettes, lift the
  lightness and drop the saturation going dark. That is why this framework's dark
  `dangerStrong` is `#fca5a5` where the light one is `#b91c1c` — the readable red
  is the one that measures 4.5:1 *on that page*, which is rule 09's whole point.
- **Shadows are tinted, never grey.** A real shadow is the page's own hue darkened
  and made translucent, so the ambient shadow is a large blur at low alpha in that
  hue (`0 5px 50px rgba(0,67,101,0.08)`). In FletBox that is a
  `shadow: "0 20px 50px rgba(…)"` string on a `Container`/`Card` —
  `colors.shadow` is the neutral default and is the flat version of the same idea
  (rule 10).
- Add the tokens to `src/database/themes.js` in **both** palettes. The gate that
  checks the two palettes expose the same token names exists because a light-only
  tint once deleted `colors.errorBg` out from under a running app; a token added
  to one theme is a runtime `undefined` in the other.
- Contrast is still the veto: `npm run ui -- --tokens` measures every pair. A
  palette that looks right and measures 3.2:1 is a palette with a bug in it.

## 36 The dated visual tells

Rule 19 bans the template tells of copy and hierarchy. These are the *visual*
ones, and each is named with the mechanism that dates it, so an edge case can be
judged rather than obeyed.

- **Violet mesh gradient behind the phone**, and the blurred 3D blob or sphere
  floating in front of it. A decoration that carries no information reads as
  stock the moment the eye finishes with it. There is no gradient page surface in
  this framework anyway — `gradient` exists on `Button` and `AppBar`, which is the
  system saying it is one element's surface (rule 19).
- **Neumorphism**: extruded dials and pressed-in tiles. Its shadows are the only
  depth cue, so the moment the surface changes the affordance disappears —
  a control whose visibility depends on a light source is not a control.
- **Glass over a solid page**, or glass on every card. See 31: translucency needs
  something moving behind it, and a page of glass has no layer left to signal.
- **Gradient-filled headline text.** `Text` has no gradient, and color running
  across a word destroys the letter edges the reader is using. Emphasis comes
  from weight and ink (rule 17).
- **Hairline border + 6-8px radius + drop shadow on every card**, and a
  `Divider` under every row: the three-piece card that separates everything and
  therefore organizes nothing (rules 10, 19).
- **Skeuomorphic props** — a rendered credit card as the hero of a wallet, a
  photoreal watch bezel, isometric people, emoji as feature icons. They depict an
  object instead of the user's own data, which is the one thing the screen has
  that no stock art can supply.
- **Default-blue SaaS**: a blue→indigo button, a grey page, white cards, no
  accent discipline. It is not a color problem, it is a missing archetype
  decision (26) — the palette was never tied to anything this product does.
- **Three CTAs in a hero row**, and the floating-phone-on-a-plinth presentation:
  both are portfolio staging, not interface.

Deleting a tell is not a design: each one still owes its job to a rule —
atmosphere to 27, hierarchy to 29, separation to 30, depth to 31, emphasis to 28.

## 37 Choosing, in five questions

Answer them before the first widget, in the commit message or the memory note.
If two answers are "I don't mind", the screen is not being designed, it is being
filled.

1. Which archetype (26), and why does this product's genre point there?
2. Which surface family, and which three steps of its ramp does this screen use (27)?
3. Where is the accent spent — name the three placements (28)?
4. What is the hero, and is it 3-5× everything else (25, 29)?
5. Which tell from 36 is the one this screen is most likely to fall into, given
   its genre and its imagery?

Then run the loop in 24. Part II never overrides a rule from Part I: the atlas is
the menu, the rules are the contract, and the checker has the last word on
legality and the user has it on whether the screen is understood (23).
