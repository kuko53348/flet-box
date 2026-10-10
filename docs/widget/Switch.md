# Switch

An iOS-style toggle switch with a sliding knob that represents an on/off state.

## When to use it

Use Switch for settings that take effect immediately, such as dark mode or notifications.

## Quick start

```javascript
import { Switch } from "flet-box";

const darkMode = Switch({
  label: "Dark mode",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `boolean` | Current value controlled by the widget. |
| `onToggle` | `(value: boolean) => void` | Fired with the new toggled state. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `size` | `'small' \| 'medium' \| 'large'` | Overall size preset or pixel value, depending on the widget. |
| `activeColor` | `Color` | Color used in the active state. |
| `label` | `string` | Label or caption shown near the control. |

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
import { Switch } from "flet-box";

const notifications = Switch({
  value: true,
  label: "Notifications",
  activeColor: "#16a34a",
  onToggle: (value) => console.log("notifications:", value),
});
```

### Full

```javascript
import { Switch } from "flet-box";

const wifi = Switch({
  value: false,
  label: "Wi-Fi",
  size: "large",
  activeColor: "#2563eb",
  disabled: false,
  onToggle: (value) => {
    console.log("wifi toggled:", value);
  },
});
```

## Tips

- Reserve Switch for immediate settings and use Checkbox when the choice is part of a form you submit.
- onToggle receives the new boolean, so you can store it directly in your state.

## Accessibility

- Pair the switch with a nearby text label and expose the boolean state; do not encode on/off with color only.

## Behavior

- Switch works uncontrolled when value is omitted: clicking toggles the internal state and fires onToggle.
- The returned element exposes getValue() and updateValue(v) to read or set the state without a click.

## Related widgets

- [Checkbox](Checkbox.md)
- [Radio](Radio.md)
- [ListTile](ListTile.md)

---

## Continue reading

- **Previous:** [Radio](Radio.md)
- **Next:** [Slider](Slider.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (5 of 8).
