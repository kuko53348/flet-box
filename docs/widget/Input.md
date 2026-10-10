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

## Accessibility

- Always give a label or placeholder so the field has an accessible name.
- error text is announced alongside the field when validation fails.

## Behavior

- onChange fires on every keystroke; onEnter fires when the user presses Enter.
- clearable and passwordToggle add trailing controls that manage the value for you.

## Related widgets

- [Dropdown](Dropdown.md)
- [Switch](Switch.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [Button](Button.md)
- **Next:** [Checkbox](Checkbox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (2 of 8).
