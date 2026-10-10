# Dropdown

A select control that shows the current choice and opens a menu of options when clicked.

## When to use it

Use Dropdown when the option list is long enough that radios would crowd the page.

## Quick start

```javascript
import { Dropdown } from "flet-box";

const city = Dropdown({
  options: ["Berlin", "Paris", "Tokyo"],
  placeholder: "Choose a city",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `options` | `(string \| DropdownOption)[]` | Available options for a selection widget. |
| `value` | `any` | Current value controlled by the widget. |
| `placeholder` | `string` | Fallback text shown while the ad is unavailable. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `label` | `string` | Label or caption shown near the control. |
| `error` | `boolean` | Error flag or message shown under the field. |
| `variant` | `'outlined' \| 'filled'` | Visual variation or style preset. |
| `size` | `'small' \| 'medium' \| 'large'` | Overall size preset or pixel value, depending on the widget. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `textColor` | `Color` | Color of the button label. |
| `optionHoverColor` | `Color` | Background color of an option while hovered. |
| `clearable` | `boolean` | Shows a button that clears the field. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `portal` | `boolean` | Renders the dropdown menu in a portal above the page. |
| `onChange` | `(value: any, label: string) => void` | Fired when the value changes. |

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
import { Dropdown } from "flet-box";

const role = Dropdown({
  label: "Role",
  options: ["Admin", "Editor", "Viewer"],
  value: "Editor",
  onChange: (value) => console.log("role:", value),
});
```

### Full

```javascript
import { Dropdown } from "flet-box";

const country = Dropdown({
  label: "Country",
  variant: "outlined",
  size: "medium",
  options: [
    { value: "us", label: "United States" },
    { value: "de", label: "Germany" },
    { value: "jp", label: "Japan" },
  ],
  value: "de",
  clearable: true,
  portal: true,
  borderRadius: 10,
  bgColor: "#ffffff",
  textColor: "#0f172a",
  onChange: (value, label) => {
    console.log("selected:", value, label);
  },
});
```

## Tips

- Pass objects with value/label when the value sent to onChange must differ from the text shown, such as an id versus a name.
- Set clearable: true to give users an explicit way back to no selection.

## Accessibility

- Supply the label prop so the trigger has a visible field name, and ensure the menu can be opened without a mouse.

## Behavior

- The option menu is portaled to document.body by default and repositions on scroll/resize; set portal: false to keep it inline.
- The returned element exposes value, open(), close() and update(), and removes its listeners on unmount.

## Related widgets

- [Radio](Radio.md)
- [Checkbox](Checkbox.md)
- [Input](Input.md)

---

## Continue reading

- **Previous:** [Slider](Slider.md)
- **Next:** [Rating](Rating.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (7 of 8).
