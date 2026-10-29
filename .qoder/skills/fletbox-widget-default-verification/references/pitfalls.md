# Measured pitfalls

Each entry was hit and measured during the FletBox default audit
(Radio / Checkbox / Switch / Button hover). Trust the numbers, not the memory.

## 1. Computed styles are serialised — compare geometry, not literals

The scale writes `0 3px 6px rgba(0,0,0,0.16)`. `getComputedStyle(el).boxShadow`
answers `rgba(0, 0, 0, 0.16) 0px 3px 6px 0px`: colour first, `px` on every
number, and a fourth (spread) number.

So `css.includes("0 3px 6px")` is **always false** on a live element, and a probe
that "compares the shadow to the level table" silently reports `off-scale` for
every level. Strip the colour, split on whitespace, `parseFloat` the first three:

```js
const shadowGeometry = (v) => {
  const n = String(v ?? "").replace(/rgba?\([^)]*\)/g, "").trim().split(/\s+/).map(parseFloat);
  return n.length >= 3 && n.every(Number.isFinite) ? n.slice(0, 3) : null;
};
```

This is exactly why `shadowGeometry()` exists in `src/widget-factory/effects.js`
and why `nextElevation()` matches by numbers. The first draft of that helper
parsed by position and could not find the level.

## 2. The transition is 0.2s — reading early returns an interpolating value

`await wait(60)` after `mouseenter` measured
`rgba(0, 0, 0, 0.176) 0px 4.22556px 8.45113px 0px` — between L2 and L3 — and the
guard failed against a correct fix. Wait **320ms** after every state change
(`mouseenter`, `mouseleave`, `update()`) before reading. Screenshots need the same
wait, otherwise the image shows a mid-flight shadow.

## 3. `update()` re-applies props and cancels an active hover

`widget.update(...)` re-runs the prop pass and `applyEffects`, which writes the
prop's own shadow and clears `translate`. Two distinct bugs came from this:

- The lift disappeared while the pointer was still over the widget.
- `applyEffects` re-captured the *hover* shadow as `_originalShadow`, so each
  update climbed one more elevation step.

The contract now in `effects.js`: capture the base only when the pointer is not
over the widget (`if (!widget._hovering)`), and re-assert `translate` + the one
step lift after re-applying. A probe must therefore test
`hover → update() → read`, not only `hover → read`; `--update-during-hover` does
it. Expect `L3` to stay `L3`.

## 4. Interaction effects need a real click handler

`applyEffects` returns early unless `widget.onclick` is a function. Effects
attach only to clickable widgets, and `Button({ disabled: true })` sets
`onclick: null`.

So "hover does nothing" is often the probe's fault: mount with
`onPress: () => {}` before concluding anything. (Press uses `scale`, hover uses
the independent `translate` property — check `scale`/`translate`/`transform`
separately; `transform` belongs to `stackPosition` and must stay untouched.)

## 5. A probe needs a served page and the right mount node

- `file://` cannot load the ESM modules (CORS). Serve the repo — the bundled
  `scripts/` start their own static server on an ephemeral port.
- The demo `index.html` mounts into **`#root`**, not `#app`. Waiting for
  `#app` times out after 15s and looks like a broken app. `#root` is a static
  node, so its presence means "the page is served"; then import
  `/src/index.js` and build your own fixed-position host.

## 6. Off-screen harness hosts break hit-testing

`tests/regression.test.js` mounts at `left:-9999px`. `document.elementFromPoint`
returns nothing useful there. Lift the element under test into the viewport for
the assertion (and move it back), or measure with `getBoundingClientRect` +
computed styles, which work off-screen.

## 7. The 40-unit hit box must not stretch the row

`TAP_MINIMUM = 40` around a 20-unit ring made the `Row` measure 40, pushed the
label to the top of the box (the ring sat ~10 units below the text) and ate the
requested `gap`.

Fix shape, applied identically to Radio, Checkbox and Switch:

```js
const overhang = Math.max(0, (TAP_MINIMUM - size) / 2);
// on the control root: margin: -overhang, plus verticalAlign = "middle" for inline use
```

After it, the measured row is `rowHeight 20`, `centreDelta 0`, `gap 10` — keep
those three as the assertion, and keep the 40-unit target itself.

That `20` is the **bare** control. A labelled one is deliberately 40 tall: the
wrapper carries the touch target and `margin` stays `0`
(`margin: isLabelled ? 0 : -overhang`, `src/widgets/Radio.js:98`). Re-measured
2026-10-24 with `measure-defaults.mjs --widget Radio --props
'{"label":"Option A","value":true}' --row "Option B"`: both themes give root
`89.67x40`, row `40`, text contrast 19.9:1 light / 19.06:1 dark. Do not "fix" a
40-tall labelled row back to 20 — the touch target is the point.

The guard at `tests/regression.test.js:464` is the bare case: it mounts
`Row({ gap: 10, children: [Radio({}), Text({ text: "Option A" })] })` and asserts
three numbers — `|rowBox.height − ring.height| < 1` (the row is not stretched),
the ring's centre against the label's centre, and `label.left − ring.right ≈ 10`
(the requested gap is the visible gap).

## 8. `colors.border` is not a control rim

Measured contrast of the unselected rim: `colors.border` was **1.27:1 light /
1.16–1.19:1 dark** against the card, so an empty radio/checkbox looked invisible.
`colors.gray500` measures **4.83:1 light / 3.67:1 dark**. WCAG needs 3:1 for a
non-text control. The dot inside the ring is `colors.onPrimary`, not `"#fff"`,
so the light/dark/`applyPalette` themes stay consistent.

Also check the *fill* under a glyph: the tick is centred in a bordered square —
verify the mark's own box (`dx/dy` from the box centre, both ≈ 0) rather than
assuming `text-align: center` did it.

## 9. Hover elevation is one scale step

The default `Button` carries L2 (`0 3px 6px`). Hover used to write a literal
`0 8px 16px` — two steps up and not even a level, which is what read as
"se eleva demasiado". `nextElevation()` returns `SHADOW_LEVELS[level + 1]`, and
returns `null` for a shadow that is not on the scale, so an app's custom shadow is
left alone rather than "improved".

## 10. Look at the pixels after the numbers

`deviceScaleFactor: 2–4` and read the PNG: alignment and contrast math can both
pass while the visual weight is still wrong. Measure per theme — call
`setTheme("light")` / `setTheme("dark")` (it writes `localStorage` and repaints
synchronously) and rebuild the widget for each theme, because a widget captures
`colors.*` at build time as its default arguments.

## 11. Do not fix the demo instead of the widget

The gallery/demo pages mount widgets with explicit props. Changing the demo hides
the defect; the framework default is the product. If a screen in an installed app
looks different from the framework, suspect a version mismatch first, then fix
upstream and prove it with a guard that failed before the change.
