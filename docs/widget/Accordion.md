# Accordion

A collapsible panel that hides a title bar with expandable content beneath it. It animates open and closed and can report its state.

## When to use it

Use it for FAQs, advanced settings, or any content you want to tuck away by default.

## Quick start

```javascript
import { Accordion, Text } from "flet-box";

const faq = Accordion({
  title: "What is FletBox?",
  children: Text({ text: "A declarative UI framework." }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string \| Widget` | Title text shown in the header. |
| `children` | `Widget` | An array of child widgets. Alias: `child` for a single child. |
| `expanded` | `boolean` | The `expanded` value for the widget. |
| `onToggle` | `(expanded: boolean) => void` | Fired with the new toggled state. |
| `variant` | `'contained' \| 'outlined' \| 'ghost'` | Visual variation or style preset. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `expandedColor` | `Color` | Color used for the expanded. |
| `titleColor` | `Color` | Color used for the title. |
| `titleSize` | `number` | Size of the title. |
| `titleWeight` | `string` | The `titleWeight` value for the widget. |
| `titlePadding` | `string` | Padding for the title. |
| `contentPadding` | `string` | Padding for the content. |
| `iconCollapsed` | `string` | The `iconCollapsed` value for the widget. |
| `iconExpanded` | `string` | The `iconExpanded` value for the widget. |
| `iconColor` | `Color` | Color of the field icons. |
| `iconSize` | `number` | Size of the field icons. |
| `divider` | `boolean` | The `divider` value for the widget. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `animate` | `boolean` | The `animate` value for the widget. |
| `animationDuration` | `number` | Duration for the animation, in milliseconds. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |

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
import { Accordion, Text } from "flet-box";

const faq = Accordion({
  title: "Shipping options",
  expanded: false,
  onToggle: (expanded) => console.log(expanded),
  children: Text({ text: "Free shipping over $50." }),
});
```

### Full

```javascript
import { Accordion, Text } from "flet-box";

const faq = Accordion({
  title: "Payment methods",
  variant: "outlined",
  borderRadius: 12,
  bgColor: "#ffffff",
  expandedColor: "#f8fafc",
  titleColor: "#0f172a",
  titleSize: 16,
  titleWeight: "bold",
  titlePadding: "16px",
  contentPadding: "0 16px 16px",
  iconColor: "#64748b",
  iconSize: 22,
  divider: true,
  animate: true,
  animationDuration: 250,
  onToggle: (expanded) => console.log(expanded),
  children: Text({ text: "We accept cards, PayPal, and bank transfer." }),
});
```

## Tips

- Vary variant: "outlined", "contained", or "ghost" to match the surrounding surface.
- Set expanded to control the initial state when the panel mounts.

## Accessibility

- The title becomes the toggle label, so write it as a clear question or section name.

## Behavior

- onToggle receives the new expanded boolean whenever the header is activated.
- disabled blocks toggling, and animate: false skips the open/close transition.

## Related widgets

- [Card](Card.md)
- [ListTile](ListTile.md)
- [Divider](Divider.md)

---

## Continue reading

- **Previous:** [Stepper](Stepper.md)
- **Next:** [TreeView](TreeView.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (2 of 5).
