# BottomSheet

## Overview
`BottomSheet` renders a panel anchored to the bottom edge of the viewport — the mobile-style cousin of [Modal](Modal.md). It composes a fixed dimming overlay (`z-index: 9998`) plus a sheet (`z-index: 9999`) containing an optional drag handle, an optional header (title + close icon), a scrollable content area, and an optional actions row. Both are appended to `document.body` at creation time; the sheet starts off-screen (`translateY(100%)`) and slides up when opened. Like `Modal`, it returns a controller object — `{ open, close, toggle, destroy }` — not an element.

## When to use
- Present a short menu of choices, filters, or share actions on mobile-first layouts.
- Show supplemental content that shouldn't cover the whole screen like a `Modal` does.
- Give touch users a swipe-down-to-dismiss surface via the drag handle.

## Import

```javascript
import { BottomSheet } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { BottomSheet, Text } from "flet-box";

const sheet = BottomSheet({
  title: "Options",
  content: Text({ text: "Sheet content goes here." }),
});

sheet.open();
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | element | — | Body of the sheet, wrapped in a scrollable area (`flex: 1`, `overflow: auto`). |
| `title` | string | — | Header title (18px bold). Also enables the header's bottom border. |
| `actions` | array of elements | `[]` | Footer row, right-aligned with an 8px gap and a top border. |
| `height` | `'auto'` or CSS size | `'auto'` | Sheet height. |
| `maxHeight` | string | `'80%'` | Sheet maximum height. |
| `showDragHandle` | boolean | `true` | Renders the grab-handle bar (40×4px) above the header. |
| `closeOnOverlayClick` | boolean | `true` | Accepted for API compatibility; the overlay click handler is currently disabled in the implementation, so tapping outside does not close the sheet. |
| `closeOnDragDown` | boolean | `true` | Dragging the handle down more than 100px closes the sheet. |
| `showCloseButton` | boolean | `true` | Renders the `close` icon in the header. |
| `backgroundColor` | Color | `colors.surface` | Sheet background. |
| `overlayColor` | Color | `'rgba(0, 0, 0, 0.5)'` | Dimming backdrop color. |
| `dragHandleColor` | Color | `colors.border` | Handle bar color. |
| `headerTextColor` | Color | `colors.text` | Title color. |
| `headerBorderColor` | Color | `colors.border` | Header bottom border color. |
| `actionBorderColor` | Color | `colors.border` | Actions row top border color. |
| `borderRadius` | number | `24` | Top corner radius in pixels (bottom corners stay square). |
| `shadow` | string | `'0 -4px 12px rgba(0,0,0,0.1)'` | CSS box-shadow for the sheet. |
| `headerPadding` | string | `'0 16px 8px 16px'` | Header padding. |
| `contentPadding` | string | `'0 16px'` | Content area padding. |
| `actionPadding` | string | `'12px 16px'` | Actions row padding. |
| `dragHandlePadding` | string | `'14px 0 8px 0'` | Padding around the handle bar. |
| `dragHandleWidth` / `dragHandleHeight` | number | `40` / `4` | Handle bar size in pixels. |
| `animationDuration` | number | `300` | Slide/fade duration in milliseconds. |
| `zIndex` | number | `9999` | Sheet stacking order. |
| `overlayZIndex` | number | `9998` | Overlay stacking order. |
| `onOpen` | function | — | Fires when the sheet opens. |
| `onClose` | function | — | Fires when the sheet closes. |

This widget returns a controller object, not an element, so [common props](COMMON_PROPS.md) do not apply to it; unrecognized props are ignored.

## Instance methods

The returned controller exposes:

- `open()` — makes the overlay visible and slides the sheet to `translateY(0)`; wires the drag and Escape listeners. No-op if already open.
- `close()` — slides the sheet back to `translateY(100%)`, fades the overlay, hides it after `animationDuration` ms, and unwires listeners. No-op if already closed.
- `toggle()` — opens if closed, closes if open.
- `destroy()` — removes the overlay (and the sheet with it) from `document.body`.

## Examples

### Everyday example

```javascript
import { BottomSheet, Button, Column } from "flet-box";

const sheet = BottomSheet({
  title: "Sort by",
  content: Column({
    gap: 8,
    children: [
      Button({ text: "Newest", variant: "text", onPress: () => sheet.close() }),
      Button({ text: "Oldest", variant: "text", onPress: () => sheet.close() }),
      Button({ text: "Name A–Z", variant: "text", onPress: () => sheet.close() }),
    ],
  }),
  onClose: () => console.log("sheet closed"),
});

Button({ text: "Sort", icon: "sort", onPress: () => sheet.open() });
```

### Full example

```javascript
import { BottomSheet, Button, Column, Row, Text, colors } from "flet-box";

const sheet = BottomSheet({
  title: "Share document",
  maxHeight: "60%",
  borderRadius: 28,
  backgroundColor: colors.card,
  overlayColor: "rgba(15, 23, 42, 0.55)",
  dragHandleColor: colors.gray300,
  animationDuration: 250,
  content: Column({
    gap: 12,
    children: [
      Text({ text: "Choose a channel", size: 14, color: colors.textSecondary }),
      Row({ gap: 8, children: [Button({ text: "Email" }), Button({ text: "Link" })] }),
    ],
  }),
  actions: [
    Button({ text: "Cancel", variant: "outlined", onPress: () => sheet.close() }),
    Button({ text: "Share", onPress: () => { console.log("shared"); sheet.close(); } }),
  ],
  onOpen: () => console.log("open"),
  onClose: () => console.log("closed"),
});

sheet.open();
```

## Notes

- The overlay + sheet are appended to `document.body` at creation, hidden. Call `destroy()` to remove them from the DOM permanently; each `BottomSheet(...)` call adds another overlay div.
- Swipe-down-to-close only works **through the drag handle** (`showDragHandle: true` and `closeOnDragDown: true`); mouse and touch events on the handle are tracked while the sheet is open.
- `Escape` closes the sheet while it is open (a `document` keydown listener is added on `open()` and removed on `close()`/`destroy()`).
- The header only renders when `title` or `showCloseButton` is set; its bottom border only appears when `title` is set.
- `borderRadius` is applied as `Npx Npx 0 0` — only the top corners round.

## Related widgets
- [Modal](Modal.md)
- [AlertDialog](AlertDialog.md)
- [SnackBar](SnackBar.md)
- [Button](Button.md)
- [ListView](ListView.md)

---

## Continue reading

- **Previous:** [Modal](Modal.md)
- **Next:** [SnackBar](SnackBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (3 of 10).
