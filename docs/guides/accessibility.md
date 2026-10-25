# Accessibility: the engine's half and your screen's half

A FletBox control is a `div` that the framework teaches to behave like a
`button`. That is what makes the syntax pleasant — `Container({ onPress })`
instead of a stylesheet and three event listeners — and it is also where
accessibility is won or lost. Three things have to be true for someone with no
pointer: the control must be **reachable** (Tab), **operable** (Enter and
Space), **announced** (a role and a name), and the person must be able to see
**where they are** (a focus ring). An overlay owes a fourth: hold the keyboard
while it is open, and give it back when it closes.

The engine already does all four. This chapter is about the half it cannot do
for you, and about the two ways an app destroys the half it was given.

## 1. The focus ring is a stylesheet, not a paint

A focus ring is not a decoration — it is a *state*, and a state can only live in
a stylesheet. `src/utils/focusRing.js` appends one `<style id="fletbox-focus-ring">`
to `<head>` the first time any widget is created, and never appends a second:

```css
:where(a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])):focus-visible {
  outline: 2px solid var(--color-focusRing, #1d4ed8);
  outline-offset: 2px;
}
```

Three deliberate choices, each worth knowing when you want something different:

- **`:focus-visible`, not `:focus`.** A click with a mouse does not ring; the
  keyboard does. That is the browser's own distinction, not the framework's.
- **`:where(…)` keeps specificity at zero.** One class of yours overrides it,
  and no `!important` is needed anywhere.
- **The color is a token.** `--color-focusRing` is written by `applyPalette` for
  every theme, so the ring moves with the theme instead of being a literal that
  only suits one background. The light palette's `#1d4ed8` is 6.4:1 on the page,
  the dark one's `#93c5fd` is 11:1, and the literal after the comma in the rule
  is the boot value a page shows before the first `setTheme`.

The widths are pixels on purpose, next to `SHADOW_LEVELS` and the hairline
`borderWidth`: a 1px ring is invisible and a 6px one is a blob, whatever the
reader's font size is.

### The one thing an app must never do

```javascript
// Never. An inline declaration outranks every stylesheet rule, including the
// engine's, so this is what "the focus ring does not work" looks like in code.
element.style.outline = "none";

// Never, for the same reason, anywhere in a global stylesheet:
// *:focus { outline: none; }
```

If you do not like the ring's colour, change the token — or override the rule
with one class of your own, which `:where()` makes possible:

```javascript
import { registerPalette } from "flet-box";

// The token is part of the palette, so both themes move it and nothing is
// overridden behind the framework's back. A registered palette repaints only
// when it is the one on screen.
registerPalette("light", { focusRing: "#0f766e" });
registerPalette("dark", { focusRing: "#5eead4" });
```

```css
/* or, for one component only: a class beats :where(...) whatever the order */
.chart:focus-visible { outline-color: var(--color-primary); }
```

### A field rings as a whole control

`Input` is a wrapper with a border, an icon and sometimes a reveal button, and
the native `<input>` inside it is only part of the control. A ring around the
text box alone draws a box *inside* the thing it is supposed to mark. So the
rule has a second pair:

```css
:where([data-fb-field]):has(> input:focus-visible) {
  outline: 2px solid var(--color-focusRing, #1d4ed8);
  outline-offset: 2px;
}
:where([data-fb-field]) > input:focus-visible {
  outline: none;
}
```

The `outline: none` there is a *rule*, at zero specificity, which any app can
still override — that is the whole difference between silencing the inner box
and killing the ring. The marker (`data-fb-field`) is written by `Input`; if you
build your own composite field (a text box with a button inside), put the same
marker on the wrapper and the ring lands where the control is.

And keep the two jobs apart: **the border is validation, the ring is focus.**
A field that paints focus by recolouring its rim, or by adding a `box-shadow`,
puts two indicators where one belongs and loses the validation state the moment
someone types.

## 2. A press is a press, however it arrives

Give any widget a click handler as a prop and the engine runs a keyboard pass
over it — `src/widget-factory/effects.js`:

- it sets `role="button"` **if you have not set a role**;
- it sets `tabIndex = 0` **if you have not set one** (an explicit `-1` is your
  decision to keep the element off the Tab path, and it is respected);
- Enter and Space fire the same handler a pointer fires, with Space's default
  (scrolling the page) cancelled and a held key counted as one press;
- a nested control keeps its own keys — Enter on a `Button` inside a pressable
  `Card` presses the button and the card, not twice the card;
- native `button`/`a[href]` are left alone, and disabled controls are not made
  Tab stops.

```javascript
Container({ onPress: openDetails, children: [Text({ text: "Details" })] });
// role="button", tabIndex=0, Enter and Space → openDetails
```

The one way an app defeats this is to attach the handler to the element after
the widget was built. The pass runs during construction; a handler assigned
afterwards leaves a control with a click, no role, no Tab stop and no keyboard:

```javascript
const card = Container({ children: [Text({ text: "Details" })] });
card.onclick = openDetails; // mouse-only: the engine already ran
```

Express the control with a prop instead — `onPress` (or `onClick`) on any
widget — and the engine sees it.

### An icon is decoration until it is a control

`Icon` has two lives, and it picks one by itself:

- `Icon({ name: "search" })` — no name for a reader, so it is marked
  `aria-hidden="true"` and kept off the Tab path. Correct inside a `Button`
  that already has text.
- `Icon({ name: "search", onPress: focusSearch, "aria-label": "Search" })` — a
  named, pressable icon keeps `role="button"` and is read as "Search, button".

An icon-only control with no `aria-label` is read as "button", which is the
worst of both worlds: reachable, operable, and anonymous. The places where the
framework wires a glyph up for you already name it — the `AppBar` back arrow,
`Input`'s `onIconPress` and reveal button, and the menu icon a `Scaffold`
connects to its drawer.

## 3. Names, roles and states the widgets already declare

You can pass `role` and `tabIndex` as ordinary props, and any `aria-*`
attribute reaches the element verbatim (`"aria-label": "…"`). Everything below
is already in place; the table exists so you know what not to duplicate.

| Widget | Role | States it keeps in sync |
| --- | --- | --- |
| `Button`, `Container` with `onPress` | `button` | — (engine pass) |
| `Switch` | `switch` | `aria-checked` |
| `Checkbox` | `checkbox` | `aria-checked` |
| `Radio` / `Rating` | `radio` / `radiogroup` | `aria-checked` |
| `Slider` | `slider` | `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-orientation` |
| `ProgressBar`, `CircularBar` | `progressbar` | `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-busy` while indeterminate |
| `Dropdown` | `combobox` | `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-invalid`, `aria-labelledby` |
| `Dropdown` list | `listbox` / `option` | `aria-selected` |
| `Tabs` | `tablist` / `tab` / `tabpanel` | `aria-selected`, roving `tabIndex`, `aria-controls` |
| `Accordion` | `button` / `region` | `aria-expanded`, `aria-controls` |
| `Pagination` | `navigation` | `aria-current="page"` |
| `Stepper` | — | `aria-current="step"` |
| `BottomNavigation` | — | `aria-current="page"` |
| `Modal`, `BottomSheet`, `Drawer` | `dialog` | `aria-modal="true"` |
| `SnackBar` | live region | `aria-live="polite"`, `"assertive"` for error and warning |
| `Tooltip` | `tooltip` | `aria-describedby` on the trigger while shown |
| `Maps` | `application` | — |
| `CircularChart` | `img` | give it an `aria-label`; it is a picture of data |

Composite widgets answer the keyboard the way their ARIA pattern says: `Tabs`,
`Dropdown`, `Rating` and `Slider` move with the arrow keys, take `Home` and
`End`, and keep a single Tab stop per group. The Dropdown's options are
deliberately *not* Tab stops — the selector holds focus, the arrows move the
highlight and `aria-activedescendant` names the row.

What is left for you is **naming**: a visible `label` where the widget has one
(`Input`, `Dropdown`), `text` for a button (`"Save"` is a name; `"OK"` is not —
see the clean-UI rule about generic action labels), `alt` on images, and
`aria-label` for anything that has no visible words of its own.

## 4. An invalid field says so in two places

A red rim is the visual half. The other half is the state and the reason, and
`Input` keeps them together: while a message is showing, the field carries
`aria-invalid="true"` and an `aria-describedby` pointing at the message, which
is a `polite` live region; when the value becomes valid, all three leave
together. A described-by pointing at a `display: none` node would be a control
claiming a description it does not have.

```javascript
const email = Input({ label: "Email", validation: "email", required: true });

// submit
const { valid, message } = email.validate(); // paints, links and announces
```

Use `validate()` (or `setValue()`, which validates) rather than colouring a rim
by hand: `showValidationMessage` decides whether the reason is on screen, and a
ring with no message tells a reader "wrong" and nothing else.

## 5. Overlays hold the keyboard, then give it back

`Modal`, `BottomSheet` and `Drawer` share one scope (`src/utils/focusScope.js`),
and one implementation on purpose:

- focus moves into the panel when it opens — the first control, or the panel
  itself (`tabIndex="-1"`) when it has none, so an alert with two lines of text
  still takes the keyboard;
- Tab and Shift+Tab cycle **inside** the panel instead of walking out behind
  the scrim into a page the person can no longer see;
- Escape closes it (each overlay already listens);
- closing hands focus back to whatever was focused before, and skips that if the
  element has left the page (a route change replaced it).

The trap and the ring read the same list of reachable elements — `a[href]`,
`button`, `input`, `select`, `textarea`, `summary` and anything on the Tab path
— so a stop you can Tab to is always a stop that shows a ring.

For an app, the contract is simply: open and close these through their props and
refs, and do not build a full-screen scrim by hand with its own Escape listener.

## 6. Verify it with the keyboard

Five minutes, no screen reader needed:

1. Press Tab from the top of the screen. Every control gets a ring; nothing is
   skipped and nothing rings twice.
2. Press Enter and Space on each control. The same thing happens as with a click.
3. Focus a field and type. The rim stays put until there is a verdict.
4. Submit an invalid form. The message is under the field, the field says
   `aria-invalid`, and the message disappears with the fix.
5. Open a modal. Tab to the last control and press Tab once more: focus is back
   at the first, not behind the scrim.
6. Press Escape. Focus is back on whatever opened it.
7. Repeat 1–6 with a screen reader (VoiceOver: `Cmd+F5`; TalkBack on Android) and
   listen for names: "Search, button", "Email, invalid entry, Invalid email
   address".

Then let the gates do what they do:

```bash
npm run check    # the API is real: widgets, props, imports
npm run ui       # names, labels, tap targets, contrast:
                 #   UNLABELED_FIELD, UNLABELED_TOGGLE, ICON_ONLY_CONTROL,
                 #   IMAGE_NO_ALT, SMALL_TAP_TARGET, LOW_CONTRAST*, UNREADABLE
npm run dev      # then Tab through it; the checker has no keyboard
```

In the framework repository itself, `node scripts/check-a11y.mjs` runs inside
`npm test` and holds the invariants of this chapter: nothing writes an inline
`outline`; the ring rule is injected and carries the token; both palettes define
`focusRing`; the pressable path sets role, Tab stop and Enter/Space and releases
its listener; every overlay that reads Escape also traps focus; the trap and the
ring agree on what is reachable; and no handler is attached after the factory
returned. Every one of those rules has been proven to fail on the bug it
forbids. The runtime half lives in `/tests/a11y.html`.

## See also

- [Clean UI](clean-ui.md) — the design rules this chapter's checklist comes from.
- [Themes](../tools/theme.md) — `registerPalette`, the call that moves the ring.
- [Input](../widget/Input.md) — the props used above.
- [Modal](../widget/Modal.md) · [BottomSheet](../widget/BottomSheet.md) ·
  [Drawer](../widget/Drawer.md) — the three overlays and what they return.
- [Widget structure](widget-structure.md) — where a widget's defaults and
  disposers live.

---

## Continue reading

- **Previous:** [Clean UI](clean-ui.md) — Chapter 12
- **Next:** [Minify and protect a FletBox build](minification-and-protection.md) — Appendix A
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 13 · Accessibility**.
