# Device & environment

## Overview
Detect what your app is running on: screen, orientation, operating system, and clipboard access. These helpers read the browser and stay in sync when the window changes.

## When to use
- Layout that changes between phone and desktop (`device`, `dimensions`).
- Show platform-specific UI (`os`).
- Copy and paste text with one call (`clipboard`).
- Walk the widget tree (`addNavigation`).

## Import

```javascript
import { device, os, dimensions, width, height, clipboard } from "flet-box";
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

- `dimensions` subscribes to window resize internally; `addListener` returns an **unsubscribe function** — call it when the feature is destroyed to avoid leaks. Same for `device.onResize`/`onOrientationChange`.
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