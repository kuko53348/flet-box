# BottomSheet

A panel that slides up from the bottom of the screen over a dimmed overlay.

## When to use it

Use BottomSheet for short, task-focused panels such as filters, share sheets or quick forms.

## Quick start

```javascript
import { BottomSheet, Text } from "flet-box";

const sheet = BottomSheet({
  content: Text({ text: "Choose an action" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `content` | `Widget` | Main content of the overlay. |
| `title` | `string` | Title text shown in the header. |
| `actions` | `Widget[]` | Widgets rendered in the overlay footer. |
| `height` | `number \| string` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `maxHeight` | `number \| string` | Maximum height the widget may grow to. |
| `showDragHandle` | `boolean` | Shows the drag handle above the sheet. |
| `closeOnOverlayClick` | `boolean` | Closes the overlay when the backdrop is clicked. |
| `closeOnDragDown` | `boolean` | Closes the sheet when dragged down. |
| `showCloseButton` | `boolean` | Shows a close button in the header. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `overlayColor` | `Color` | Color of the dimmed backdrop behind the overlay. |
| `dragHandleColor` | `Color` | Color used for the drag handle. |
| `headerTextColor` | `Color` | Text color of the header row. |
| `headerBorderColor` | `Color` | Border color for the header. |
| `actionBorderColor` | `Color` | Border color for the action. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `headerPadding` | `Padding` | Padding for the header. |
| `contentPadding` | `Padding` | Padding for the content. |
| `actionPadding` | `Padding` | Padding for the action. |
| `dragHandlePadding` | `Padding` | Padding for the drag handle. |
| `dragHandleWidth` | `number` | Width of the drag handle. |
| `dragHandleHeight` | `number` | Height of the drag handle. |
| `animationDuration` | `number` | Duration for the animation, in milliseconds. |
| `zIndex` | `number` | Index used for the z. |
| `overlayZIndex` | `number` | Index used for the overlay z. |
| `onOpen` | `() => void` | Fired when the overlay opens. |
| `onClose` | `() => void` | Fired when the overlay closes. |

## Examples

### Everyday

```javascript
import { BottomSheet, Text } from "flet-box";

const sheet = BottomSheet({
  title: "Share",
  content: Text({ text: "Share this document with your team." }),
  closeOnOverlayClick: true,
  onClose: () => console.log("closed"),
});
```

### Full

```javascript
import { BottomSheet, Button, Checkbox, Column, Switch, rgba } from "flet-box";

const filters = BottomSheet({
  title: "Filters",
  height: "60%",
  showDragHandle: true,
  closeOnDragDown: true,
  closeOnOverlayClick: true,
  showCloseButton: true,
  backgroundColor: "#ffffff",
  overlayColor: "rgba(15, 23, 42, 0.4)",
  borderRadius: 20,
  content: Column({
    gap: 12,
    children: [Switch({ label: "In stock" }), Checkbox({ label: "On sale" })],
  }),
  actions: [
    Button({ text: "Reset", variant: "text" }),
    Button({ text: "Apply", onPress: () => filters.close() }),
  ],
  onOpen: () => console.log("opened"),
  onClose: () => console.log("closed"),
});
```

## Tips

- Reach for BottomSheet for lightweight panels and Modal when the content needs the user's full attention.
- closeOnDragDown only works together with a drag handle, so keep showDragHandle: true when enabling it.

## Accessibility

- Give the sheet a title so the panel has an accessible name, and keep the close action reachable by keyboard.

## Behavior

- Returns a controller with open, close, toggle and destroy; the overlay stays hidden until open() is called.
- Overlay clicks and Escape close the sheet, onOpen/onClose fire as it animates, and destroy() releases the listeners.

## Related widgets

- [Modal](Modal.md)
- [AlertDialog](AlertDialog.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [Modal](Modal.md)
- **Next:** [SnackBar](SnackBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (3 of 10).
