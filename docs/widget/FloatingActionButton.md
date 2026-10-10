# FloatingActionButton

A circular, elevated button that floats over content and can expand into a labeled pill.

## When to use it

Use FloatingActionButton for the single most important action on a screen, such as compose or create.

## Quick start

```javascript
import { FloatingActionButton } from "flet-box";

const add = FloatingActionButton({
  icon: "add",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `icon` | `string \| Widget` | Name of the icon to render. |
| `label` | `string` | Label or caption shown near the control. |
| `onPress` | `() => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `foregroundColor` | `Color` | Color of the icon and label. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `mini` | `boolean` | Renders the small variant of the floating action button. |
| `extended` | `boolean` | Extends the FAB to show a label next to the icon. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `margin` | `number` | Space outside the widget, between it and its neighbors. |

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
import { FloatingActionButton } from "flet-box";

const compose = FloatingActionButton({
  icon: "edit",
  onPress: () => console.log("compose"),
});
```

### Full

```javascript
import { FloatingActionButton } from "flet-box";

const create = FloatingActionButton({
  icon: "add",
  label: "New project",
  extended: true,
  backgroundColor: "#2563eb",
  foregroundColor: "#ffffff",
  elevation: 8,
  margin: 24,
  onPress: () => console.log("create"),
});
```

## Tips

- Keep one FloatingActionButton per screen; extended: true with a label makes the action explicit.
- mini: true shrinks the button for secondary floating actions.

## Accessibility

- A bare icon button needs a label; prefer extended: true with a visible label, or wrap it in a Tooltip so the action is discoverable.

## Behavior

- When onPress is set the button gains a click listener and a hover scale; both the scale and pointer style are disabled when disabled is true.
- The icon prop accepts either an icon name or an already-built Icon widget.

## Related widgets

- [Button](Button.md)
- [Icon](Icon.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [Skeleton](Skeleton.md)
- **Next:** [Pagination](Pagination.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (9 of 10).
