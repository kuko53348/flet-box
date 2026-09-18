# AlertDialog

## Overview
`AlertDialog` is a pre-composed confirmation dialog built on top of [Modal](Modal.md): a centered 320px panel with a large variant icon, a bold title, a message, and a row of Cancel/Confirm buttons. It does **not** return an element — it returns a controller object `{ open, close, modal }`, and its hidden overlay is attached to `document.body` as soon as you create it. Call `open()` when you want the user to decide something.

## When to use
- Ask for confirmation before a destructive or irreversible action (`variant: "danger"`).
- Report a blocking result: success, warning, or an informational message.
- Any decision that needs explicit `onConfirm` / `onCancel` handling.

## Import

```javascript
import { AlertDialog } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { AlertDialog } from "flet-box";

const dialog = AlertDialog({
  title: "Delete item?",
  message: "This action cannot be undone.",
  onConfirm: () => console.log("confirmed"),
});

dialog.open();
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Heading text, rendered bold at 24px. |
| `message` | string | — | Body text, rendered at 18px in `colors.textSecondary`. |
| `onConfirm` | function | — | Fires when the confirm button is pressed, right before the dialog closes. |
| `onCancel` | function | — | Fires when the cancel button is pressed, right before the dialog closes. |
| `onClose` | function | — | Fires whenever the underlying modal closes. |
| `variant` | `'normal'`, `'danger'`, `'warning'`, `'success'` | `'normal'` | Picks the icon, icon color, and confirm-button color: `normal` → `info`/`colors.primary`, `danger` → `warning`/`colors.danger`, `warning` → `error`/`colors.warning`, `success` → `check_circle`/`colors.success`. |
| `showCancel` | boolean | `true` | Whether the cancel button is rendered. |
| `confirmText` | string | `'Accept'` | Confirm button label. |
| `cancelText` | string | `'Cancel'` | Cancel button label. |

Any extra props are forwarded to the underlying [Modal](Modal.md) (e.g. `width`, `borderRadius`, `zIndex`, `overlayColor`); the dialog itself defaults to `width: 320`, `borderRadius: 24`, and no header close button. This widget returns a controller object, not an element, so [common props](COMMON_PROPS.md) do not apply to it directly.

## Instance methods

The returned controller exposes:

- `open()` — shows the dialog (delegates to `modal.open()`).
- `close()` — hides the dialog.
- `modal` — the full [Modal](Modal.md) instance: `toggle()`, `destroy()`, `isOpen`, `updateContent()`, `setLoading()`, etc.

## Examples

### Everyday example

```javascript
import { AlertDialog, Button } from "flet-box";

const confirmDelete = AlertDialog({
  title: "Delete account?",
  message: "All of your data will be permanently removed.",
  variant: "danger",
  confirmText: "Delete",
  cancelText: "Keep it",
  onConfirm: () => console.log("account deleted"),
  onCancel: () => console.log("kept"),
});

Button({ text: "Delete account", onPress: () => confirmDelete.open() });
```

### Full example

```javascript
import { AlertDialog, Button, Column } from "flet-box";

const dialog = AlertDialog({
  title: "Upload complete",
  message: "3 files were uploaded successfully.",
  variant: "success",
  confirmText: "Done",
  showCancel: false,          // single-action dialog
  width: 360,                  // forwarded to Modal
  borderRadius: 28,            // forwarded to Modal
  onConfirm: () => console.log("closed with Done"),
  onClose: () => console.log("dialog closed"),
});

Column({
  gap: 12,
  children: [
    Button({ text: "Show success dialog", onPress: () => dialog.open() }),
    Button({ text: "Remove from DOM", variant: "outlined", onPress: () => dialog.modal.destroy() }),
  ],
});
```

## Notes

- Creating the dialog immediately appends its (hidden) overlay to `document.body`; it is not part of your widget tree. Call `modal.destroy()` to remove it from the DOM for good.
- Both buttons close the dialog automatically — your `onConfirm`/`onCancel` handlers don't need to.
- The variant icon uses the Material Icons font (see [Icon](Icon.md)).
- The cancel button is rendered with `colors.danger` text regardless of `variant`.
- Pressing `Escape` closes the dialog (inherited from `Modal`'s `closeOnEsc`).

## Related widgets
- [Modal](Modal.md)
- [BottomSheet](BottomSheet.md)
- [SnackBar](SnackBar.md)
- [Button](Button.md)
- [Icon](Icon.md)

---

## Continue reading

- **Previous:** [Chip](Chip.md)
- **Next:** [Modal](Modal.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (1 of 10).
