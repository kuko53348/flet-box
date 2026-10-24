# Device & environment

## Overview
Detect what your app is running on: screen, orientation, operating system, and clipboard access. These helpers read the browser and stay in sync when the window changes. The same page carries the two halves a responsive screen needs — the **breakpoint** vocabulary (`BREAKPOINTS`, `currentBreakpoint`, `atLeast`, `pick`, `onBreakpointChange`), which says *which layout this viewport wants*, and `loadFont`, which makes a `fontFamily` prop real.

## When to use
- Layout that changes between phone and desktop (`device`, `dimensions`).
- One value per viewport (`pick({ xs: 8, md: 16 })`), or a decision that has to agree with `AdaptiveScaffold` (`atLeast("md")`).
- Rebuild a screen when the viewport *crosses a step*, not when it moves a pixel (`onBreakpointChange`).
- Show platform-specific UI (`os`).
- Copy and paste text with one call (`clipboard`).
- Walk the widget tree (`addNavigation`).
- Load a webfont before you name it in `fontFamily` (`loadFont`, `fontsReady`).

## Import

```javascript
import {
  device, os, dimensions, width, height, clipboard,
  BREAKPOINTS, BREAKPOINT_NAMES, breakpointForWidth,
  currentBreakpoint, atLeast, pick, onBreakpointChange,
  loadFont, fontsReady,
} from "flet-box";
```

## Objects

### `device`

| Method | Returns | Description |
| --- | --- | --- |
| `isMobile()` | `boolean` | Is it a phone? |
| `isTablet()` | `boolean` | Is it a tablet? |
| `isDesktop()` | `boolean` | Is it a desktop/laptop? |
| `orientation()` | `'portrait' \| 'landscape'` | Current orientation. |
| `isTouch()` | `boolean` | Does the device support touch? |
| `hasGesture()` | `boolean` | Gesture events available? |
| `onOrientationChange(cb)` | `() => void` | Run `cb(orientation)` on change; returns an unsubscribe function. |
| `onResize(cb)` | `() => void` | Run `cb({ width, height, orientation })` on resize; returns an unsubscribe function. |

### `dimensions` (plus `width` / `height`)

| Member | Returns | Description |
| --- | --- | --- |
| `width` / `height` | `number` | Live viewport dimensions. |
| `get()` | `{ width, height }` | Both at once. |
| `getWidth()` / `getHeight()` | `number` | Each dimension. |
| `addListener(cb)` | `() => void` | Subscribe to size changes; returns an unsubscribe function. |
| `removeListener(cb)` | `void` | Remove a subscription. |

`width` and `height` are also exported directly as numbers.

### Breakpoints

`dimensions` answers "how wide is the window"; a screen almost always wants the
next question, "which layout does that width ask for". One table answers it, and
`md` is 768 — the same line `AdaptiveScaffold` draws between a drawer and a
permanent sidebar, so a screen and its shell cannot disagree.

| Function | Signature | Description |
| --- | --- | --- |
| `BREAKPOINTS` | `{ xs, sm, md, lg, xl }` | The widths in **CSS pixels** (0 · 560 · 768 · 1024 · 1280). A viewport is not a framework unit: it does not scale with the reader's font, and pretending otherwise puts a phone layout on a desktop. |
| `BREAKPOINT_NAMES` | `['xs' … 'xl']` | The same names in width order. |
| `currentBreakpoint()` | `() => Breakpoint` | The step the live window is in. `"xs"` where there is no window, so a Node import never throws. |
| `breakpointForWidth(px)` | `(px: number) => Breakpoint` | The pure read behind it — a test, or a width that is not the viewport (an embed's container). |
| `atLeast(name)` | `(name: Breakpoint) => boolean` | `atLeast("md")` is the sentence a two-column layout needs. |
| `pick(values, fallback?)` | `(Record<Breakpoint, T>, T) => T` | A value per step. An unnamed step inherits the nearest smaller one: `pick({ xs: 8, md: 16 })` reads 8, 8, 16, 16, 16. |
| `onBreakpointChange(listener)` | `(cb) => () => void` | Fires when the *name* changes, not on every pixel of a resize. Returns the unsubscribe; hand it to the widget's `onUnmount` so the subscription dies with the screen. |

```javascript
// One screen, two shapes, no second codebase.
const gutter = pick({ xs: 16, md: 24, lg: 32 });

const items = atLeast("md")
  ? [listPane, detailPane]
  : [currentPane];

const [name, setName] = useState("bp", currentBreakpoint());
const header = Column({ padding: gutter, children: [Text({ text: name })] });
header.onUnmount(onBreakpointChange(setName));
```

A breakpoint is a *decision*, not a device. `device.isMobile()` reads a user
agent, which a desktop in a narrow window cannot change and a tablet on desktop
mode will not admit; `currentBreakpoint()` reads the width the app actually has.
Use the width for layout and the UA only for a genuinely platform question (touch
long-press, a native back gesture).

### Fonts

`fontFamily` is a name. If the bytes of that face are not on the machine, the
browser paints its fallback and the app ships a typeface nobody chose.

| Function | Signature | Description |
| --- | --- | --- |
| `loadFont(family, options?)` | `(string, { weights?, url?, display? }) => Promise<boolean>` | Ask for a family. `weights` is required for a Google family if you want anything but 400 — a heading needs its weight asked for by name. `url` loads your own stylesheet instead of a provider's, which is the same-origin answer an offline launch keeps. Resolves `false` when the face could not be had; the screen keeps its fallback instead of failing. |
| `fontsReady()` | `() => Promise<boolean>` | Wait for the faces already started. Use it before a canvas paint or an export, where text that reflows *after* the drawing is a visible bug. |

```javascript
import { Text, loadFont } from "flet-box";

const body = Text({ text: "Reading", fontFamily: "Georgia, serif" });

// One request per family, whoever asks first.
loadFont("Inter", { weights: [400, 600] }).then((ok) => {
  if (ok) body.style.fontFamily = "Inter, Georgia, serif";
});
```

> A webfont is a network request. A self-hosted `@font-face` in the app's own CSS
> is free of that and is the right answer for a product; a provider URL is fine
> for a demo and is what a tunnel, a firewall or an offline launch breaks on.

### `os`

| Method | Returns | Description |
| --- | --- | --- |
| `name()` | `string` | Operating system: `"Windows"`, `"macOS"`, `"Android"`, `"iOS"`, `"Linux"`, `"ChromeOS"`, or `"Unknown"`. |
| `version()` | `string` | OS version (or `"Unknown"`). |
| `isMobile()` / `isDesktop()` | `boolean` | Platform family helpers. |

### `clipboard`

| Method | Returns | Description |
| --- | --- | --- |
| `copy(text)` | `void` | Copy text to the clipboard. |
| `read()` | `Promise<string>` | Read the current clipboard text. |
| `copyWithFeedback(text, element)` | `void` | Copy and briefly show feedback near an element. |

### `addNavigation(widget)` — walk the widget tree

`addNavigation(widget)` attaches tree-walking members to a widget and returns it:

| Member | Type | Description |
| --- | --- | --- |
| `parent` | `Widget \| null` | The parent widget (when mounted). |
| `children` | `Widget[]` | Direct children. |
| `firstChild` / `lastChild` | `Widget \| null` | First/last direct child. |
| `siblings` | `Widget[]` | Siblings (excluding itself). |
| `nextSibling` / `prevSibling` | `Widget \| null` | Adjacent siblings. |
| `index` | `number` | Position among siblings (`-1` when root). |
| `root` | `Widget` | The root of the tree. |
| `path` | `object[]` | `{ name, id, index }` for each ancestor up to the root. |
| `depth` | `number` | Distance from the root. |
| `findById(id)` | `Widget \| null` | Search the subtree for a widget `id`. |
| `findAll(widgetName)` | `Widget[]` | Collect all widgets with a `_widgetName`. |
| `tree` | `string` | An ASCII tree dump for debugging. |

## Examples

### Everyday example

```javascript
import { Text, device } from "flet-box";

Text({
  text: device.isMobile() ? "Mobile layout" : "Desktop layout",
});
```

### Full example

```javascript
import { Column, Button, clipboard, dimensions } from "flet-box";

Column({
  gap: 8,
  children: [
    Button({
      text: "Copy invite link",
      onPress: () => clipboard.copy("https://myapp.app/invite"),
    }),
  ],
});

dimensions.addListener(({ width, height }) => {
  console.log(`viewport ${width}x${height}`);
});
```

## Notes

- `dimensions` subscribes to window resize internally; `addListener` returns an **unsubscribe function** — call it when the feature is destroyed to avoid leaks. Same for `device.onResize`/`onOrientationChange` and `onBreakpointChange`.
- `onBreakpointChange` keeps **one** window listener for the whole app and fires only when the step name changes. Subscribing per card would still be one listener, but each callback would run on every pixel — a `Row` that re-renders on a pixel can change the scrollbar and resize the window again.
- `BREAKPOINTS` are pixels by design. Everything else about a FletBox screen is a framework unit that grows with the reader's font; the viewport is the browser's own number and the layout switch has to be in the same currency as the window.
- `loadFont` is idempotent per family and never rejects: a blocked request resolves `false`, and the app keeps its fallback. It writes a `<link>` into `document.head`, so a page with a strict CSP needs that host allowed — a self-hosted `url` avoids the question entirely.
- `clipboard.read()` requires a user gesture in most browsers (it uses the same rules as `navigator.clipboard`).
- `addNavigation` is idempotent — calling it twice on a widget is safe, and widgets already expose these members when they are built by the factory.
- `os` also detects mobile/desktop families, which `device` derives for touch+screen decisions.

## Related pages
- [Async, ids & logging](async-ids-log.md) — previous chapter.
- [Themes](theme.md) — next chapter.
- [AdaptiveScaffold](../widget/AdaptiveScaffold.md) — a shell that adapts to the device.

---

## Continue reading

- **Previous:** [Async, ids & logging](async-ids-log.md)
- **Next:** [Themes](theme.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (6 of 12).