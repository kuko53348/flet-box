# Modal

## Overview
`Modal` builds a centered dialog window: a fixed full-screen overlay (`colors.overlay`, `z-index: 9998`) attached to `document.body`, containing a surface panel with an optional header (title + close icon), a scrollable content area, and an optional footer row of action buttons. Like the other overlays, it does **not** return an element — it returns a controller object with `open()`, `close()`, `toggle()`, `destroy()`, and live-update helpers. The panel starts hidden (`opacity: 0`, `visibility: hidden`) and animates in with a scale/fade transition.

## When to use
- Focus the user on a self-contained task: a form, a preview, or a detail view.
- Show content too large for a [SnackBar](SnackBar.md) or [Tooltip](Tooltip.md) but not worth a new page.
- Drive a multi-step flow with `updateContent()` and `setLoading()` on the same instance.

## Import

```javascript
import { Modal } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Modal } from "flet-box";

const modal = Modal({
  title: "Hello",
  content: "This is a modal built with FletBox.",
});

modal.open();
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Header title (18px). The header only renders when `title` or `showCloseButton` is set. |
| `content` | HTMLElement, string, or array of those | — | Body content. Strings are wrapped in a 14px `Text`. |
| `actions` | array of elements | `[]` | Footer buttons, right-aligned with an 8px gap. No footer when empty. |
| `closeOnOverlayClick` | boolean | `true` | Accepted for API compatibility; the overlay click handler is currently disabled in the implementation, so clicking outside does not close the modal. |
| `closeOnEsc` | boolean | `true` | Close when `Escape` is pressed while open. |
| `width` | number or string | `480` | Panel width (numbers are pixels). |
| `minWidth` | number or string | `320` | Panel minimum width. |
| `maxWidth` | string | `'90%'` | Panel maximum width. |
| `maxHeight` | string | `'80vh'` | Panel maximum height; the content area scrolls past it. |
| `backgroundColor` | Color | `colors.surface` | Panel background. |
| `borderRadius` | number or string | `20` | Panel corner radius (numbers are pixels). |
| `border` | string | `null` | Full CSS border for the panel; takes precedence over `borderWidth`/`borderColor`. |
| `borderColor` / `borderWidth` | Color / number | `colors.border` / `1` | Combined into a border when `border` is not set. |
| `shadow` | string | `null` | Custom CSS box-shadow for the panel. |
| `elevation` | number `0`–`5` | `3` | Preset panel shadow, used when `shadow` is not set. |
| `padding` | number or string | `'20px'` | Content-area padding. |
| `contentBgColor` | Color | `colors.surface` | Content-area background. |
| `contentElevation` | number | `0` | Optional inset shadow on the content area. |
| `showCloseButton` | boolean | `true` | Renders the `close` icon in the header (hover-highlighted). |
| `headerBgColor` | Color | `colors.surface` | Header background. |
| `headerTextColor` | Color | `null` | Header title and close-icon color; falls back to `colors.text` / `colors.textSecondary`. |
| `headerBorder` | string or `false` | `null` | Custom header bottom border; `false` removes it. Default is `1px solid colors.border`. |
| `headerPadding` | string | `null` | Custom header padding (default `'16px 20px'`). |
| `headerElevation` | number | `0` | Adds a subtle drop shadow under the header. |
| `footerBgColor` | Color | `colors.surface` | Footer background. |
| `footerBorder` | string or `false` | `null` | Custom footer top border; `false` removes it. |
| `footerPadding` | string | `null` | Custom footer padding (default `'12px 20px'`). |
| `footerElevation` | number | `0` | Adds a subtle shadow above the footer. |
| `overlayColor` | Color | `colors.overlay` | Backdrop color (`rgba(0,0,0,0.4)` by default). |
| `zIndex` | number | `9998` | Overlay stacking order. |
| `onOpen` | function | — | Fires when the modal opens. |
| `onClose` | function | — | Fires when the modal closes (any cause). |

This widget returns a controller object, not an element, so [common props](COMMON_PROPS.md) do not apply to it; unrecognized props are ignored.

## Instance methods

The returned controller exposes:

- `open()` — fades/scales the modal in and calls `onOpen`. No-op if already open.
- `close()` — animates out, calls `onClose`, and sets `visibility: hidden` after 300ms. No-op if already closed.
- `toggle()` — opens if closed, closes if open.
- `destroy()` — removes the overlay from `document.body` and detaches the Escape listener. The instance is unusable afterwards.
- `isOpen` — getter for the current state.
- `updateContent(newContent)` — replaces the body with an element or string (strings become a 14px `Text`).
- `updateTitle(newTitle)` — replaces the header title text.
- `updatePadding(newPadding)` — sets content padding (numbers are pixels).
- `setLoading(loading = true, loadingText = 'Loading...')` — swaps the body for a spinner + text; `setLoading(false)` restores the original `content`.

## Examples

### Everyday example

```javascript
import { Button, Modal, Text } from "flet-box";

const modal = Modal({
  title: "Save changes?",
  content: Text({ text: "Your edits will be visible to the whole team." }),
  actions: [
    Button({ text: "Cancel", variant: "outlined", onPress: () => modal.close() }),
    Button({ text: "Save", onPress: () => { console.log("saved"); modal.close(); } }),
  ],
  onClose: () => console.log("modal closed"),
});

Button({ text: "Open modal", onPress: () => modal.open() });
```

### Full example

```javascript
import { Button, Column, Input, Modal, Text } from "flet-box";

const email = Input({ label: "Email", placeholder: "you@example.com" });

const modal = Modal({
  title: "Subscribe",
  width: 520,
  borderRadius: 24,
  elevation: 5,
  overlayColor: "rgba(15, 23, 42, 0.6)",
  headerBgColor: "#f1f5f9",
  footerBorder: false,
  content: Column({
    gap: 12,
    children: [
      Text({ text: "Get the weekly changelog in your inbox.", size: 15 }),
      email,
    ],
  }),
  actions: [
    Button({ text: "Not now", variant: "text", onPress: () => modal.close() }),
    Button({
      text: "Subscribe",
      onPress: () => {
        modal.setLoading(true, "Subscribing...");
        setTimeout(() => {
          modal.updateContent(Text({ text: "You're subscribed!", size: 16 }));
        }, 1200);
      },
    }),
  ],
  onOpen: () => console.log("open"),
  onClose: () => console.log("closed"),
});

modal.open();
```

## Notes

- The overlay is appended to `document.body` at creation time, hidden. Every `Modal(...)` call adds one overlay div — call `destroy()` when you're done with an instance to avoid leaking them.
- Opening animates the panel from `scale(0.9)`/`opacity 0` to `scale(1)`/`opacity 1` (0.3s); the overlay fades in with a 0.1s delay. Closing flips `isOpen` to `false` immediately and hides the overlay after a 300ms timeout, once the fade-out finishes.
- `Escape` closing works via a `document` keydown listener that is added on `open()` and removed on `close()`/`destroy()`.
- Header and footer only render when they have something to show (`title`/`showCloseButton`, non-empty `actions`).
- The panel is a flex column: header and footer stay put while the content area (`flex: 1`, `overflow: auto`) scrolls.

## Related widgets
- [AlertDialog](AlertDialog.md)
- [BottomSheet](BottomSheet.md)
- [SnackBar](SnackBar.md)
- [Button](Button.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [AlertDialog](AlertDialog.md)
- **Next:** [BottomSheet](BottomSheet.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (2 of 10).
