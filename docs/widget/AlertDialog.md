# AlertDialog

A pre-styled confirmation dialog built on Modal, with a variant icon, message and confirm/cancel buttons.

## When to use it

Use AlertDialog when you need an explicit confirm or cancel decision from the user.

## Quick start

```javascript
import { AlertDialog } from "flet-box";

const alert = AlertDialog({
  title: "Delete file?",
  message: "This action cannot be undone.",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | Title text shown in the header. |
| `message` | `string` | Body text or notification content. |
| `confirmText` | `string` | Label of the confirm button. |
| `cancelText` | `string` | Label of the cancel button. |
| `onConfirm` | `() => void` | Fired when the confirm action is pressed. |
| `onCancel` | `() => void` | Fired when the cancel action is pressed. |
| `onClose` | `() => void` | Fired when the overlay closes. |
| `variant` | `'normal' \| 'danger' \| 'warning' \| 'success'` | Visual variation or style preset. |
| `showCancel` | `boolean` | Shows the cancel button. |
| `width` | `number` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `borderRadius` | `number` | Rounds the corners of the widget. |

## Examples

### Everyday

```javascript
import { AlertDialog } from "flet-box";

const alert = AlertDialog({
  title: "Remove item",
  message: "The item will be moved to trash.",
  confirmText: "Remove",
  cancelText: "Keep",
  onConfirm: () => console.log("removed"),
  onCancel: () => console.log("kept"),
});
```

### Full

```javascript
import { AlertDialog } from "flet-box";

const alert = AlertDialog({
  title: "Delete account",
  message: "All data will be permanently erased.",
  variant: "danger",
  confirmText: "Delete",
  cancelText: "Cancel",
  showCancel: true,
  width: 360,
  borderRadius: 20,
  onConfirm: () => console.log("confirmed"),
  onCancel: () => console.log("cancelled"),
  onClose: () => console.log("closed"),
});
```

## Tips

- Pick the variant that matches intent: danger for destructive actions, success for confirmations, warning when the user should pause.
- Set showCancel: false only for acknowledgements; most confirmations should let the user back out.

## Accessibility

- State the consequence in message and name the buttons by action such as Delete and Cancel instead of a generic OK.

## Behavior

- AlertDialog is a preset Modal: it returns { open, close, modal } and must be shown by calling open().
- onConfirm and onCancel run before the dialog closes; onClose fires for every dismissal, including Escape or overlay click.

## Related widgets

- [Modal](Modal.md)
- [SnackBar](SnackBar.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [Chip](Chip.md)
- **Next:** [Modal](Modal.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (1 of 10).
