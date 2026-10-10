# Radio

A single-selection control that renders a circular radio button. Radios sharing the same name form a group where only one can stay selected.

## When to use it

Use Radio when the user must pick exactly one option from a short, always-visible list.

## Quick start

```javascript
import { Radio } from "flet-box";

const plan = Radio({
  label: "Monthly",
  name: "billing",
  onSelect: (value) => console.log(value),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `selected` | `boolean` | Current selected state. |
| `onSelect` | `(selected: boolean) => void` | Fired when the widget or an option is selected. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `activeColor` | `Color` | Color used in the active state. |
| `label` | `string` | Label or caption shown near the control. |
| `name` | `string` | The `name` value for the widget. |

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
import { Radio } from "flet-box";

const monthly = Radio({
  label: "Monthly plan",
  name: "billing",
  selected: true,
  activeColor: "#2563eb",
  onSelect: (value) => console.log("billing:", value),
});
```

### Full

```javascript
import { Radio } from "flet-box";

const option = Radio({
  label: "Express shipping",
  name: "shipping",
  selected: false,
  disabled: false,
  activeColor: "#16a34a",
  size: 24,
  onSelect: (value) => {
    console.log("shipping changed:", value);
  },
});
```

## Tips

- Give Radios that answer the same question the same name; selecting one clears the others in that group.
- Set selected for the initial choice and let onSelect write the change back into your own state.

## Accessibility

- The circle carries no visible label on its own; render a Text beside it and never rely on color alone.

## Behavior

- Clicking an already-selected Radio is a no-op, so onSelect only fires when the selection actually changes.
- The returned element exposes select(), unselect() and isSelected() for programmatic control.

## Related widgets

- [Switch](Switch.md)
- [Checkbox](Checkbox.md)
- [Dropdown](Dropdown.md)

---

## Continue reading

- **Previous:** [Checkbox](Checkbox.md)
- **Next:** [Switch](Switch.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (4 of 8).
