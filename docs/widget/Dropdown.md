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
| `full` | `boolean` | Stretches the widget to fill its parent on both axes in stack mode. |
| `fullHeight` | `boolean` | Stretches the widget to the full height of its parent in stack mode. |
| `fullWidth` | `boolean` | Stretches the widget to the full width of its parent. |
| `center` | `boolean` | Centres the widget on both axes in stack mode. |
| `centerY` | `boolean` | Centres the widget vertically in stack mode. |
| `centerX` | `boolean` | Centres the widget horizontally in stack mode. |
| `zIndex` | `number` | Stacking order: a widget with a higher value paints above lower ones. |
| `z` | `number` | Alias of `zIndex`. |
| `end` | `Size` | Logical alias of `right`, used by the stack placement shorthands. |
| `start` | `Size` | Logical alias of `left`, used by the stack placement shorthands. |
| `inset` | `Size` | Shorthand for the four edge offsets (`top`/`right`/`bottom`/`left`). |
| `left` | `Size` | Offset from the left edge. A number is pixels; a string uses any CSS unit. |
| `bottom` | `Size` | Offset from the bottom edge. A number is pixels; a string uses any CSS unit. |
| `right` | `Size` | Offset from the right edge. A number is pixels; a string uses any CSS unit. |
| `top` | `Size` | Offset from the top edge. A number is pixels; a string uses any CSS unit. |
| `pos` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | Alias of `position`. |
| `position` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | CSS `position` value, or `stack` for centered stacking. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `flex` | `number` | Flex grow/shrink/basis shorthand for a flex child. |
| `minWidth` | `Size` | Minimum width the widget may shrink to. |
| `maxWidth` | `Size` | Maximum width the widget may grow to. |
| `minHeight` | `Size` | Minimum height the widget may shrink to. |
| `maxHeight` | `Size` | Maximum height the widget may grow to. |
| `border` | `string` | The `border` value for the widget. |
| `borderTop` | `string` | The `borderTop` value for the widget. |
| `borderBottom` | `string` | The `borderBottom` value for the widget. |
| `borderLeft` | `string` | The `borderLeft` value for the widget. |
| `borderRight` | `string` | The `borderRight` value for the widget. |
| `cursor` | `string` | The `cursor` value for the widget. |
| `display` | `string` | CSS `display` value for the container. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | The `marginTop` value for the widget. |
| `marginRight` | `Size` | The `marginRight` value for the widget. |
| `marginBottom` | `Size` | The `marginBottom` value for the widget. |
| `marginLeft` | `Size` | The `marginLeft` value for the widget. |
| `mt` | `Size` | The `mt` value for the widget. |
| `mr` | `Size` | The `mr` value for the widget. |
| `mb` | `Size` | The `mb` value for the widget. |
| `ml` | `Size` | The `ml` value for the widget. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(widget: Widget) => void` | The `onclick` value for the widget. |
| `alignSelf` | `AlignSelf` | Overrides the parent's `alignItems` for this child alone (CSS `align-self`). Alias: `selfAlign`. |
| `selfAlign` | `AlignSelf` | Alias of `alignSelf`. |
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
- Bind a useState value to `value` to move the selection from code, such as auto-picking a default after a lookup; pass `''` to clear it back to the placeholder.

## Accessibility

- Supply the label prop so the trigger has a visible field name, and ensure the menu can be opened without a mouse.

## Behavior

- The option menu is portaled to document.body by default and repositions on scroll/resize; set portal: false to keep it inline.
- The returned element exposes value, open(), close() and update(), and removes its listeners on unmount.
- A value applied from outside — a bound state change or `dropdown.value = x` — re-fires onChange when it differs from the current selection, and is ignored when it is the same, so a state → value → onChange → state loop settles after one pass.

## Related widgets

- [Radio](Radio.md)
- [Checkbox](Checkbox.md)
- [Input](Input.md)

---

## Continue reading

- **Previous:** [Slider](Slider.md)
- **Next:** [Rating](Rating.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (7 of 9).
