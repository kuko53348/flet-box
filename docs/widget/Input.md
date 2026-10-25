# Input

A text field that handles labels, placeholder text, input types, icons, validation, and change events in one widget.

## When to use it

Use it for any free-form text entry such as names, emails, passwords, or search.

## Quick start

```javascript
import { Input } from "flet-box";

const name = Input({
  placeholder: "Your name",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` | Current value controlled by the widget. |
| `placeholder` | `string` | Fallback text shown while the ad is unavailable. |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'search' \| 'url'` | Kind or mode of the widget. |
| `label` | `string` | Label or caption shown near the control. |
| `error` | `boolean \| string` | Error flag or message shown under the field. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `readonly` | `boolean` | Makes the field read-only while keeping it focusable. |
| `required` | `boolean` | Marks the field as required and validates it. |
| `size` | `'small' \| 'medium' \| 'large'` | Overall size preset or pixel value, depending on the widget. |
| `variant` | `'outlined' \| 'filled' \| 'underlined'` | Visual variation or style preset. |
| `fullWidth` | `boolean` | Stretches the widget to the full width of its parent. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `validation` | `'none' \| 'letters' \| 'numbers' \| 'email' \| 'alphanumeric' \| 'safe' \| 'custom'` | Built-in validation rule, such as `email` or `numbers`. |
| `maxLength` | `number` | Maximum number of characters accepted. |
| `iconLeft` | `string` | Icon shown to the left of the label. |
| `iconRight` | `string` | Icon shown to the right of the label. |
| `iconColor` | `Color` | Color of the field icons. |
| `iconSize` | `number` | Size of the field icons. |
| `onIconPress` | `() => void` | Fired when a field icon is pressed. |
| `clearable` | `boolean` | Shows a button that clears the field. |
| `passwordToggle` | `boolean` | Shows a button that reveals or hides a password. |
| `showValidationMessage` | `boolean` | Shows the validation message under the field. |
| `showValidationIcon` | `boolean` | Shows a valid/invalid icon inside the field. |
| `customPattern` | `string` | Regular expression used by `validation: "custom"`. |
| `onValidated` | `(isValid: boolean, message: string) => void` | Fired with `(isValid, message)` after validation. |
| `onChange` | `(value: string, event?: Event) => void` | Fired when the value changes. |
| `onInput` | `(value: string, event?: Event) => void` | Fired on every keystroke while typing. |
| `onFocus` | `(event: Event) => void` | Fired when the control gains focus. |
| `onBlur` | `(event: Event) => void` | Fired when the control loses focus. |
| `onEnter` | `(value: string, event: Event) => void` | Fired when Enter is pressed in the field. |

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
import { Input } from "flet-box";

const email = Input({
  label: "Email",
  type: "email",
  placeholder: "you@example.com",
  onChange: (value) => console.log(value),
});
```

### Full

```javascript
import { Input } from "flet-box";

const password = Input({
  label: "Password",
  type: "password",
  placeholder: "Enter a password",
  variant: "outlined",
  size: "medium",
  fullWidth: true,
  borderRadius: 8,
  required: true,
  clearable: true,
  passwordToggle: true,
  iconLeft: "lock",
  validation: "safe",
  maxLength: 32,
  showValidationMessage: true,
  onChange: (value) => console.log(value),
  onValidated: (isValid, message) => console.log(isValid, message),
});
```

## Tips

- Match type to the data (email, password, search) so mobile keyboards adapt.
- Set validation and showValidationMessage to get inline feedback without extra code.
- The trailing controls are Icon glyphs from the Material face the app links in its own index.html, drawn in the theme's secondary ink. An emoji in that slot ignores the colour, the font and the size the field sets.

## Accessibility

- Always give a label or placeholder so the field has an accessible name.
- error text is announced alongside the field when validation fails.

## Behavior

- onChange fires on every keystroke; onEnter fires when the user presses Enter.
- clearable and passwordToggle add trailing controls that manage the value for you.
- passwordToggle swaps visibility for visibility_off and moves the button's accessible name with the state.

## Related widgets

- [Dropdown](Dropdown.md)
- [Switch](Switch.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [Button](Button.md)
- **Next:** [Checkbox](Checkbox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (2 of 9).
