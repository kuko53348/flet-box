# SnackBar

A transient toast that appears at the edge of the screen, reports a short message, and dismisses itself.

## When to use it

Use SnackBar to confirm a completed action or surface a brief, non-blocking notice.

## Quick start

```javascript
import { SnackBar } from "flet-box";

const toast = SnackBar({
  message: "Saved",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `message` | `string` | Body text or notification content. |
| `action` | `string` | The `action` value for the widget. |
| `onAction` | `() => void` | Event handler for the `onAction` event. |
| `duration` | `number` | How long the transient element stays visible, in milliseconds. |
| `type` | `'normal' \| 'success' \| 'error' \| 'warning' \| 'info'` | Kind or mode of the widget. |
| `position` | `'bottom' \| 'top'` | CSS `position` value, or `stack` for centered stacking. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `textColor` | `Color` | Color of the button label. |
| `actionColor` | `Color` | Color used for the action. |
| `dismissible` | `boolean` | The `dismissible` value for the widget. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `padding` | `number \| string` | Space inside the widget, between its content and its border. |
| `margin` | `number \| string` | Space outside the widget, between it and its neighbors. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `animationDuration` | `number` | Duration for the animation, in milliseconds. |
| `zIndex` | `number` | Index used for the z. |
| `onShow` | `() => void` | Event handler for the `onShow` event. |
| `onClose` | `() => void` | Fired when the overlay closes. |

## Examples

### Everyday

```javascript
import { SnackBar } from "flet-box";

const toast = SnackBar({
  message: "Changes saved",
  type: "success",
  duration: 3000,
});
```

### Full

```javascript
import { SnackBar } from "flet-box";

const toast = SnackBar({
  message: "Could not reach the server",
  type: "error",
  duration: 5000,
  bgColor: "#1e293b",
  color: "#ffffff",
  borderRadius: 12,
  elevation: 3,
});
```

## Tips

- Keep message short and use SnackBar for confirmations, not for information the user must act on.
- A duration of 0 keeps the toast open until you call close(); otherwise it auto-dismisses.

## Accessibility

- A SnackBar disappears on its own, so make sure the same information is available elsewhere and never required reading.

## Behavior

- The element is appended to document.body and auto-removed after duration; the returned controller has show(), close() and getElement().
- Calling close() early cancels the pending dismissal timer and slides the toast out.

## Related widgets

- [AlertDialog](AlertDialog.md)
- [Modal](Modal.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [BottomSheet](BottomSheet.md)
- **Next:** [Tooltip](Tooltip.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (4 of 10).
