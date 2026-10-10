# Checkbox

A square checkbox with a check mark that represents an independent true/false choice.

## When to use it

Use Checkbox when several options can be selected at once, or when confirming a single item in a form.

## Quick start

```javascript
import { Checkbox } from "flet-box";

const terms = Checkbox({
  label: "Accept terms",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `checked` | `boolean` | Current checked state. |
| `onCheck` | `(checked: boolean) => void` | Fired with the new checked state. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
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
import { Checkbox } from "flet-box";

const remember = Checkbox({
  checked: true,
  label: "Remember me",
  activeColor: "#2563eb",
  onCheck: (checked) => console.log("remember:", checked),
});
```

### Full

```javascript
import { Checkbox } from "flet-box";

const updates = Checkbox({
  checked: false,
  label: "Email me product updates",
  size: 24,
  activeColor: "#7c3aed",
  disabled: false,
  onCheck: (checked) => {
    console.log("updates:", checked);
  },
});
```

## Tips

- Use Checkbox inside forms where several options may be true together; use Switch for one immediate on/off setting.
- onCheck fires with the new boolean, so write it straight into your state.

## Accessibility

- The check box needs an adjacent visible label; assistive tech cannot infer meaning from the tick glyph alone.

## Behavior

- Uncontrolled when checked is omitted; the widget tracks its own state and reports changes through onCheck.
- The returned element exposes setChecked(value) and getChecked() for programmatic control.

## Related widgets

- [Switch](Switch.md)
- [Radio](Radio.md)
- [ListTile](ListTile.md)

---

## Continue reading

- **Previous:** [Input](Input.md)
- **Next:** [Radio](Radio.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (3 of 8).
