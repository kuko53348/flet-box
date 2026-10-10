# Modal

A centered dialog over a dimmed overlay that holds a title, content and a row of actions.

## When to use it

Use Modal when the user must focus on a task or read something without leaving the page.

## Quick start

```javascript
import { Modal } from "flet-box";

const dialog = Modal({
  title: "Welcome",
  content: "Thanks for signing up.",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | Title text shown in the header. |
| `content` | `Widget \| string` | Main content of the overlay. |
| `actions` | `Widget[]` | Widgets rendered in the overlay footer. |
| `closeOnOverlayClick` | `boolean` | Closes the overlay when the backdrop is clicked. |
| `closeOnEsc` | `boolean` | Closes the overlay when Escape is pressed. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `minWidth` | `number` | Minimum width the widget may shrink to. |
| `maxWidth` | `number \| string` | Maximum width the widget may grow to. |
| `maxHeight` | `number \| string` | Maximum height the widget may grow to. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `border` | `string` | The `border` value for the widget. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `contentBgColor` | `Color` | Background color for the content. |
| `contentElevation` | `number` | Elevation (shadow depth) of the content. |
| `headerBgColor` | `Color` | Background color of the header row. |
| `headerTextColor` | `Color` | Text color of the header row. |
| `headerBorder` | `string \| false` | The `headerBorder` value for the widget. |
| `headerPadding` | `Padding` | Padding for the header. |
| `headerElevation` | `number` | Elevation (shadow depth) of the header. |
| `footerBgColor` | `Color` | Background color for the footer. |
| `footerBorder` | `string \| false` | The `footerBorder` value for the widget. |
| `footerPadding` | `Padding` | Padding for the footer. |
| `footerElevation` | `number` | Elevation (shadow depth) of the footer. |
| `overlayColor` | `Color` | Color of the dimmed backdrop behind the overlay. |
| `showCloseButton` | `boolean` | Shows a close button in the header. |
| `zIndex` | `number` | Index used for the z. |
| `onOpen` | `() => void` | Fired when the overlay opens. |
| `onClose` | `() => void` | Fired when the overlay closes. |

## Examples

### Everyday

```javascript
import { Modal } from "flet-box";

const profile = Modal({
  title: "Profile",
  content: "Update your account details.",
  closeOnOverlayClick: true,
  onClose: () => console.log("closed"),
});
```

### Full

```javascript
import { Button, Column, Modal, Switch, rgba } from "flet-box";

const settings = Modal({
  title: "Settings",
  content: Column({
    gap: 12,
    children: [Switch({ label: "Dark mode" }), Switch({ label: "Compact" })],
  }),
  actions: [
    Button({ text: "Cancel", variant: "text" }),
    Button({ text: "Save", onPress: () => settings.close() }),
  ],
  closeOnOverlayClick: false,
  closeOnEsc: true,
  width: 480,
  borderRadius: 16,
  elevation: 8,
  overlayColor: "rgba(15, 23, 42, 0.5)",
  onOpen: () => console.log("opened"),
  onClose: () => console.log("closed"),
});
```

## Tips

- Modal manages its own overlay and appends it to document.body; call the returned open() and close() to control visibility.
- Use closeOnOverlayClick: false for destructive or data-entry dialogs that should not be dismissed by a stray click.

## Accessibility

- Modal does not move focus automatically; focus the first control or a close button when it opens.

## Behavior

- Returns a controller with open, close, toggle, destroy and an isOpen getter, plus updateContent, updateTitle and setLoading helpers.
- onOpen and onClose fire on state changes, and closeOnEsc installs an Escape listener that destroy() removes.

## Related widgets

- [BottomSheet](BottomSheet.md)
- [AlertDialog](AlertDialog.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [AlertDialog](AlertDialog.md)
- **Next:** [BottomSheet](BottomSheet.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (2 of 10).
