# InstallButton

A floating button that appears only when the browser is ready to install the app as a PWA. It wraps a standard Button and stays hidden otherwise.

## When to use it

Use it on a landing page when you want to offer an install prompt without the browser's default install UI.

## Quick start

```javascript
import { InstallButton } from "flet-box";

const install = InstallButton({
  text: "Install app",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `text` | `string` | Visible text content. |
| `variant` | `'filled' \| 'outlined' \| 'text'` | Visual variation or style preset. |
| `size` | `'small' \| 'medium' \| 'large'` | Overall size preset or pixel value, depending on the widget. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `bottom` | `number` | The `bottom` value for the widget. |
| `onInstalled` | `() => void` | Fired when the PWA finishes installing. |
| `onClick` | `() => void` | Callback fired when the widget is clicked. Alias: `onPress`. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `id` | `string` | DOM `id` for the rendered element. |
| `className` | `string` | CSS class names applied to the rendered element. |
| `ref` | `(widget: Widget) => void` | Callback that receives the underlying DOM node. |
| `disableTransform` | `boolean` | Disables the default press/scale transform animation. |

## Examples

### Everyday

```javascript
import { InstallButton } from "flet-box";

const install = InstallButton({
  text: "Install app",
  variant: "filled",
  bottom: 24,
  onInstalled: () => console.log("installed"),
});
```

### Full

```javascript
import { InstallButton } from "flet-box";

const install = InstallButton({
  text: "Add to home screen",
  variant: "filled",
  size: "large",
  bottom: 32,
  borderRadius: 32,
  padding: "14px 28px",
  bgColor: "#2563eb",
  color: "#ffffff",
  onInstalled: () => console.log("installed"),
  onClick: () => console.log("clicked"),
});
```

## Tips

- The button listens for the browser's beforeinstallprompt event and stays hidden
- until an install is actually offered.
- It takes the same text, variant, and size vocabulary as Button, since it renders
- one internally.
- Raise bottom to float the fixed button above a bottom navigation or dock.

## Accessibility

- Give it descriptive text like "Install app" rather than relying on an icon-only
- label, since the widget is a small floating control.

## Behavior

- It hides itself permanently when the app is installed and removes its window
- listeners plus the underlying button on unmount.
- onInstalled fires when the user accepts the browser prompt; onClick fires for every
- click regardless of install availability.

## Related widgets

- [Button](Button.md)
- [SnackBar](SnackBar.md)
- [Modal](Modal.md)

---

## Continue reading

- **Previous:** [Carousel](Carousel.md)
- **Next:** [DataTable](DataTable.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (5 of 5).
