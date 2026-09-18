# Dropdown

## Overview
`Dropdown` renders a custom select control: a selector row plus a popup menu of options. Options can be plain strings or objects `{ value, label, icon }`. The menu is portaled to `document.body` by default so it escapes parent overflow, and the returned element exposes `value`/`options`/`open`/`close`.

## When to use
- Choose one value from a list of options.
- Present labeled or iconed options in a popup menu.

## Import

```javascript
import { Dropdown } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Dropdown } from "flet-box";

Dropdown({
  options: ["Apple", "Banana", "Cherry"],
  onChange: (value) => console.log(value),
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | array | `[]` | Option strings, or objects `{ value, label, icon }`. |
| `value` | any | `null` | Selected value. |
| `onChange` | `(value) => void` | — | Fires with the selected value (or `null` when cleared). |
| `placeholder` | string | `'Select...'` | Text shown when nothing is selected. |
| `label` | string | — | Label rendered above the control. |
| `disabled` | boolean | `false` | Disables interaction. |
| `error` | boolean | `false` | Shows the error (red) border. |
| `variant` | `'outlined'`, `'filled'` | `'outlined'` | Visual style. |
| `size` | `'small'`, `'medium'`, `'large'` | `'medium'` | Preset padding and font size. |
| `borderRadius` | number | `8` | Corner radius in pixels. |
| `color` | Color | `colors.primary` | Accent (selected option) color. |
| `bgColor` | Color | `colors.surface` | Menu background. |
| `textColor` | Color | `colors.text` | Text color. |
| `optionHoverColor` | Color | `colors.border` | Option hover background. |
| `clearable` | boolean | `false` | Show a clear (✕) button when a value is selected. |
| `width` | Size | `'100%'` | Control width. |
| `portal` | boolean | `true` | Render the menu in `document.body` (escapes parent overflow). |

These are the props specific to `Dropdown`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `value / options / disabled / error` — get or set as properties.
- `open() / close()` — opens or closes the menu.
- `update(props)` — updates multiple props at once.

## Examples

### Everyday example

```javascript
import { Dropdown } from "flet-box";

Dropdown({
  label: "Country",
  placeholder: "Select a country",
  options: [
    { value: "es", label: "Spain" },
    { value: "mx", label: "Mexico" },
    { value: "ar", label: "Argentina" },
  ],
  clearable: true,
  onChange: (v) => console.log(v),
});
```

### Full example

```javascript
import { Dropdown } from "flet-box";

const dd = Dropdown({
  label: "Priority",
  options: [
    { value: "low", label: "Low", icon: "arrow_downward" },
    { value: "med", label: "Medium", icon: "remove" },
    { value: "high", label: "High", icon: "arrow_upward" },
  ],
  value: "med",
  variant: "outlined",
  size: "large",
  clearable: true,
  onChange: (v) => console.log("priority:", v),
});

// dd.value = "high";  dd.open();  dd.close();
```

## Notes

- Custom-drawn, not a native `<select>`; the arrow, check, and close glyphs use Material Icons.
- With `portal: true` the menu is positioned `fixed` and follows scroll and resize.

## Related widgets
- [Input](Input.md)
- [Radio](Radio.md)
- [Checkbox](Checkbox.md)
- [ListView](ListView.md)

---

## Continue reading

- **Previous:** [Slider](Slider.md)
- **Next:** [Rating](Rating.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (7 of 8).
