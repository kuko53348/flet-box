# Probe traps measured in this repo

Each entry cost time at least once, and each one is a *false reading*, not a product bug.
Read this list before writing the word "defecto" in a report.

## Theme and rendering

- **Headless Chrome boots in the DARK scheme.** A page that hardcodes light surfaces then
  reads `colors.text` back as near-white makes every title look "washed out". Do not rely on
  `prefers-color-scheme` here: the framework theme is set with `setTheme()` and persisted in
  `localStorage`, so drive the gallery's own Light/Dark buttons and confirm
  `window.__GALLERY.theme === "dark"` before recording any ratio.
- **Edits do not hot-reload in a plain static gallery.** The page keeps the module graph it
  booted with, so a measurement taken right after an Edit still shows the old CSS. The scripts
  in `scripts/` set `Cache-Control: no-store`, pass `?v=<timestamp>` and use a fresh browser
  per run. When the user says a visual fix "no se ve", that is usually *their* cache: ask for a
  hard reload (`Cmd+Shift+R`) before re-editing.
- **A capture that says "404 - File Not Found" is not a crashed app** — the URL was not served.
  `curl` it first.
- **The image shown back in chat is downscaled (~2×).** Check the PNG dimensions before
  concluding a layout is broken; a real 1360 px layout reads as ~540 px and looks clipped.
- **`take_screenshot` from the in-app browser can fail** with
  `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE` while the DOM snapshot is fine. Fall back to headless
  Chrome capture, do not claim a visual check you did not do.

## Selecting the wrong element

- **`:last-of-type` matches nothing useful among divs.**
  `querySelector('#panel-Tabs [role="tab"]:last-of-type')` returned `null` — every tab is a
  `div`, so "last of type" is the last div in the parent, not the last tab. Select by index over
  `querySelectorAll('[role="tab"]')`, or by the rendered text.
- **A node cannot be selected by the numbers you passed.** `borderRadius: 999` reaches the DOM as
  `62.4375rem` (the rem contract divides by the live root font size). Match the rendered content —
  a Material ligature like `chevron_left` — and walk up to the first ancestor with the computed
  style you want.
- **Overlays grab the wrong layer.** A Dropdown-menu probe measured the Drawer's overlay instead.
  Filter candidates by `zIndex >= 9000` *and* the option text, and add `window.scrollY` to any
  clip coordinate you compute from `getBoundingClientRect`.
- **Measure the child that paints.** The Tabs `thumb.width` read `0` because the wrong absolute
  child was measured while the screenshot showed the thumb perfectly. When a number contradicts
  the image, the number is wrong.
- **A `position: fixed` stage with no background photographs the page behind it.** That produced a
  "variant screenshot" full of unrelated text; the values in it were still correct.
- **After a client-side navigation, previous-route elements are gone.** Re-query the target
  instead of reusing a stale handle (a cached `children[1]` threw mid-probe).
- **`elementsFromPoint` only answers inside the viewport.** The gallery is ~9000 px tall, so a
  hit-test at a card's own coordinates returns an **empty stack** and reads as "nothing is on top"
  or "the widget painted nothing". `el.scrollIntoView({ block: "center" })` before `h.stackAt()`.
- **`document.elementFromPoint` returns null inside `tests/regression.test.js`**, because that
  harness stacks every widget in one host parked at `left:-9999px`. On a *served* page it works
  normally: a stack dump from the gallery disproved a suspected paint-overlay bug in one call.
  Lift the element under test (`position:fixed; left:0; top:0; zIndex:99999`, restore in `finally`)
  rather than concluding hit-testing is broken.
- **A stretched flex child lies about its centre.** A Radio beside a `Text` reported
  "ring centre == label centre" in both the broken and the fixed layout, because the 40-unit hit
  box stretched the label while its line sat at the top. The assertion that bit was
  *row height == ring height*. Assert geometry, not centres.

## Timing

- **Read settled values.** Hover and press transitions run for `0.2s`; a 60 ms read returned
  `0px 4.22556px 8.45113px` mid-interpolation. `await wait(320)` after `mouseenter`, `mouseleave`
  and `update()`. `probe.mjs`'s `h.press()` already waits.
- **Canvas and webfonts settle after first paint.** The scripts wait 1200 ms after
  `window.__GALLERY` appears; a Chart or QRCode read earlier is blank.

## Defaults that masquerade as bugs

- **`Container` paints `bgColor = colors.surface` when you pass none**, and is
  `flex-direction: column` by default. Every "there is a stray grey box behind my label" report
  (Dropdown's root, Tabs' root, the Stepper section) started there, and the axis swap silently
  turns `alignItems` horizontal and `justifyContent` vertical.
- **A raw factory div is `content-box`.** `minHeight: TAP_MINIMUM` (40) plus 8+8 px padding made
  every TreeView row 56 px: the touch target was added on top of the padding instead of
  containing it. `boxSizing: "border-box"` brought rows to 40 px and the panel from 370 to 290.
- **`Column`/`Row` default to `width: '100%'`**, so a sibling with `flex: '0 0 auto'` and no
  `width: "auto"` squeezes text into a 70 px ribbon that *looks* truncated.
- **`alignItems: 'flex-start'` starves a `flex: 1` child** — a 2 px timeline connector measured
  `height: 0`. Invisible usually means starved, not unstyled.
- **A token can be correct and still unreadable.** `colors.border` is a hairline: ~1.27:1 on light
  and ~1.19:1 on dark surfaces. Radio's unselected rim was "there" and invisible until it moved to
  `colors.gray500` (4.83:1 / 3.67:1).
- **Bars are measured from zero.** If the scale starts at the smallest value, `getYPosition(0)`
  falls below the axis and every bar runs past the baseline — the bottom label then describes a
  number that is not where the bars start.

## What the contrast scanner cannot see

- **A gradient or animated background has no single ratio.** `audit.mjs` skips an element whose
  *own* `background-image` is set, but it resolves an ancestor's background from
  `backgroundColor` only — so a card painted with the `background` shorthand reads as white.
  That is the `ParallaxBox` `1:1` row in every run: the gallery hands that card a
  `linear-gradient` and white ink because the widget has no default paint of its own. It is a
  **gallery artifact, not a framework default** — the one place in `gallery.js` where a color prop
  is passed, and the reason the rule matters: *a card that passes a color measures the gallery.*
- **Anything the probe page styles is not a default.** Before reporting a row, open the card in
  `assets/gallery/gallery.js` and check its `build()` passes no color, no `bgColor`, no `border`.
- **Ligature text is not text.** Without `./src/fonts/icons.css` (which `build-gallery.mjs` wires
  through the `./src` symlink) an icon paints the words `star_border`, and its "contrast" is
  meaningless — that is a font-loading failure, not a palette defect.
- **Decorative placeholders read as failures.** AdSense/AdMob `ADVERTISEMENT` sits at 2.54:1 by
  design; a chart gridline or a disabled control is legitimately faint. Classify, then rank.
- **Non-text UI needs 3:1, not 4.5:1** — and the scanner only walks text nodes. Rims, star
  outlines and focus rings need a targeted `probe.mjs --fn '(el,h)=>h.ink(...)'`.
- **Re-measure the whole component after a fix.** The Stepper section was three stacked defaults
  (width squeeze, starved connector, stray surface panel); stopping at the first corrected number
  left two in place.
