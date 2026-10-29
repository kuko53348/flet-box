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
| `border` | `string` | CSS `border` shorthand for all four edges: width, style and color in one string. |
| `borderTop` | `string` | The top edge of the border alone, for a widget whose rim differs per side. |
| `borderBottom` | `string` | The bottom edge of the border alone, for a widget whose rim differs per side. |
| `borderLeft` | `string` | The left edge of the border alone, for a widget whose rim differs per side. |
| `borderRight` | `string` | The right edge of the border alone, for a widget whose rim differs per side. |
| `cursor` | `string` | CSS `cursor` value: what the pointer becomes over the widget (`pointer`, `grab`, `not-allowed`). |
| `display` | `string` | CSS `display` value for the container. |
| `boxSizing` | `'border-box' \| 'content-box'` | Which box `width` and `height` measure: `border-box` keeps the size you asked for and pushes padding inward. |
| `flexDirection` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | Main axis of a flex container: `row` places children side by side, `column` stacks them. |
| `flexGrow` | `number` | Share of the leftover space this child takes, relative to its siblings. |
| `flexShrink` | `number` | How readily the child gives space back when the row overflows; `0` keeps its size. |
| `gap` | `number \| string` | Space between children along the layout axis. |
| `fontSize` | `number` | Size of the font. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `paddingTop` | `Size` | Space inside the widget, on the top edge only. |
| `paddingRight` | `Size` | Space inside the widget, on the right edge only. |
| `paddingBottom` | `Size` | Space inside the widget, on the bottom edge only. |
| `paddingLeft` | `Size` | Space inside the widget, on the left edge only. |
| `pt` | `Size` | Alias of `paddingTop`. |
| `pr` | `Size` | Alias of `paddingRight`. |
| `pb` | `Size` | Alias of `paddingBottom`. |
| `pl` | `Size` | Alias of `paddingLeft`. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | Space outside the widget, on the top edge only. |
| `marginRight` | `Size` | Space outside the widget, on the right edge only. |
| `marginBottom` | `Size` | Space outside the widget, on the bottom edge only. |
| `marginLeft` | `Size` | Space outside the widget, on the left edge only. |
| `mt` | `Size` | Alias of `marginTop`. |
| `mr` | `Size` | Alias of `marginRight`. |
| `mb` | `Size` | Alias of `marginBottom`. |
| `ml` | `Size` | Alias of `marginLeft`. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `bgImage` | `string` | Image painted behind the widget's content (CSS `background-image`), placed with `bgSize` and `bgPosition`. |
| `bgSize` | `string` | How the background image fills its box (`cover`, `contain`, or a length). |
| `bgPosition` | `string` | Where the background image is anchored (`center`, `top`, `50% 20%`). |
| `bgRepeat` | `string` | Whether the background image tiles; `no-repeat` for a single cover. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(event?: Event) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(event?: Event) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(event?: Event) => void` | Lowercase alias of `onClick`, kept because the shipped templates and the HTML habit write it. |
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
