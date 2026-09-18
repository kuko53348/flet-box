# SnackBar

## Overview
`SnackBar` shows a temporary notification bar fixed to the top or bottom edge of the viewport. Calling it is the action: it immediately builds a `<div>` bar (message + optional action button + optional close button), appends it to `document.body`, animates it in, and schedules auto-dismiss after `duration` ms. It returns a controller object `{ close, show, getElement }` — not an element you place in your tree.

## When to use
- Confirm a completed action without interrupting the user ("Item saved").
- Report a transient error, optionally with an `action` button like Retry or Undo.
- Any short, self-dismissing message that doesn't need a decision.

## Import

```javascript
import { SnackBar } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { SnackBar } from "flet-box";

SnackBar({ message: "Item saved" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | string | — | Notification text. |
| `action` | string | — | Action button label. Clicking it fires `onAction`, then closes the bar. |
| `onAction` | function | — | Action button handler. |
| `duration` | number (ms) | `3000` | Auto-dismiss delay. `0` (or negative) keeps the bar until `close()`. |
| `type` | `'normal'`, `'success'`, `'error'`, `'warning'`, `'info'` | `'normal'` | Color preset from the theme: `normal` → `colors.surface`, `success` → `colors.success`, `error` → `colors.danger`, `warning` → `colors.warning`, `info` → `colors.info`. |
| `position` | `'bottom'`, `'top'` | `'bottom'` | Screen edge the bar slides in from. |
| `backgroundColor` | Color | preset | Overrides the `type` background. |
| `textColor` | Color | `colors.text` | Message color. |
| `actionColor` | Color | preset | Action button color. |
| `dismissible` | boolean | `false` | Adds a `✕` close button — only when `action` is not set. |
| `borderRadius` | number or string | `16` | Corner radius in pixels. |
| `padding` | string | `'12px 16px'` | Inner padding. |
| `margin` | number | `16` | Distance from the screen edges in pixels (left, right, and top/bottom). |
| `elevation` | number | `2` | Shadow depth: `0 e px 2·e px rgba(0,0,0,0.15)`; `0` removes the shadow. |
| `animationDuration` | number (ms) | `300` | Slide/fade duration, also the delay before the element is removed on close. |
| `zIndex` | number | `10000` | Stacking order — above `Modal` (9998) and `BottomSheet` (9999). |
| `onShow` | function | — | Fires right after the bar starts showing. |
| `onClose` | function | — | Fires when the bar finishes closing (after the animation). |

This widget returns a controller object, not an element, so [common props](COMMON_PROPS.md) do not apply to it; unrecognized options are ignored.

## Instance methods

The returned controller exposes:

- `close()` — cancels the auto-dismiss timer, animates the bar out, and removes it from `document.body` after `animationDuration` ms (then fires `onClose`).
- `show()` — replays the slide/fade-in animation (and fires `onShow`).
- `getElement()` — returns the bar's `<div>` so you can style or inspect it directly.

## Examples

### Everyday example

```javascript
import { Button, SnackBar } from "flet-box";

Button({
  text: "Save",
  onPress: () => SnackBar({ message: "Changes saved", type: "success", duration: 2000 }),
});
```

### Full example

```javascript
import { SnackBar, colors } from "flet-box";

const bar = SnackBar({
  message: "Connection lost. Reconnecting...",
  type: "error",
  position: "top",
  action: "Retry",
  onAction: () => console.log("retrying"),
  duration: 5000,
  backgroundColor: "#1e293b",
  textColor: "#ffffff",
  actionColor: colors.warning,
  borderRadius: 12,
  margin: 24,
  elevation: 4,
  onShow: () => console.log("visible"),
  onClose: () => console.log("dismissed"),
});

// bar.close();            // dismiss early
// bar.getElement();       // the fixed-position <div>
```

## Notes

- There is no "create then open" step — the bar shows as soon as you call `SnackBar(...)` and each call creates a brand-new element. There is no queue: several calls stack on top of each other at the same edge.
- The bar spans nearly the full width (`left`/`right` set to `margin`), Material-style.
- `dismissible` only adds the `✕` button when no `action` is present; the action button already closes the bar.
- The slide-in runs inside a `requestAnimationFrame`, so computed `opacity`/`transform` reach their final values one frame after creation — the DOM insertion itself is synchronous.
- `close()` removes the element from the DOM only after `animationDuration` ms; `onClose` fires at that point.

## Related widgets
- [Tooltip](Tooltip.md)
- [Modal](Modal.md)
- [AlertDialog](AlertDialog.md)
- [Button](Button.md)
- [Badge](Badge.md)

---

## Continue reading

- **Previous:** [BottomSheet](BottomSheet.md)
- **Next:** [Tooltip](Tooltip.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (4 of 10).
