# Input

## Overview
`Input` renders a styled text field built on a native `<input>`, with an optional label, leading/trailing icons, three visual variants, and a built-in validation engine. It exposes an imperative API (`getValue`, `setValue`, `validate`, `focus`, …) on the returned element.

## When to use
- Collect text, email, numbers, or passwords from the user.
- Show inline validation: required, email, letters, numbers, alphanumeric, safe, or a custom pattern.
- Add a label, helper icons, or a clear error/success state.

## Import

```javascript
import { Input } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Input } from "flet-box";

Input({ placeholder: "Type something…" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string | `""` | Initial value. |
| `placeholder` | string | `""` | Placeholder text. |
| `type` | string | `'text'` | Native input type (`text`, `password`, `email`, `number`, …). |
| `label` | string | — | Label above the field; appends `*` when `required`. |
| `variant` | `'outlined'`, `'filled'`, `'underlined'` | `'outlined'` | Visual style. |
| `size` | `'small'`, `'medium'`, `'large'` | `'medium'` | Preset padding, font size, and icon size. |
| `fullWidth` | boolean | `false` | Stretch to 100% width. |
| `borderRadius` | number | `24` | Corner radius (outlined/filled). |
| `disabled` | boolean | `false` | Disables editing. |
| `readonly` | boolean | `false` | Read-only field. |
| `error` | boolean or string | `false` | Force the error state; a string is shown as the message. |
| `iconLeft / iconRight` | string | — | Material Icon names inside the field. |
| `iconColor` | Color | `colors.textSecondary` | Icon color. |
| `iconSize` | number | `20` | Icon size in pixels. |
| `onIconPress` | function | — | Click handler for either icon. |
| `validation` | `'none'`, `'letters'`, `'numbers'`, `'email'`, `'alphanumeric'`, `'safe'`, `'custom'` | `'none'` | Validation and input-filter mode. |
| `customPattern` | string | — | Regex source used when `validation: "custom"`. |
| `maxLength` | number | — | Maximum characters; input is truncated. |
| `required` | boolean | `false` | Marks the field required and shows `*` on the label. |
| `showValidationMessage` | boolean | `true` | Show the error message text. |
| `showValidationIcon` | boolean | `true` | Show the ✓/✗ icon. |
| `onInput` | `(value, event) => void` | — | Fires on each keystroke (after filtering). |
| `onChange` | `(value, event) => void` | — | Fires on change (after filtering). |
| `onValidated` | `(isValid, message) => void` | — | Fires with the validation result. |
| `onFocus / onBlur` | `(event) => void` | — | Focus handlers. |

These are the props specific to `Input`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `getValue()` — returns the current value (string).
- `setValue(v)` — sets the value and re-validates.
- `isValid()` — returns whether the current value is valid.
- `validate()` — validates, updates the UI, and returns `{ valid, message }`.
- `reset()` — clears the field.
- `focus() / blur()` — moves focus in or out of the field.

## Examples

### Everyday example

```javascript
import { Input } from "flet-box";

const email = Input({
  label: "Email",
  type: "email",
  validation: "email",
  required: true,
  fullWidth: true,
  onChange: (value) => console.log(value),
});
```

### Full example

```javascript
import { Input } from "flet-box";

const field = Input({
  label: "Username",
  placeholder: "e.g. ada_lovelace",
  iconLeft: "person",
  validation: "alphanumeric",
  maxLength: 20,
  required: true,
  size: "large",
  variant: "outlined",
  fullWidth: true,
  onValidated: (isValid, message) => console.log(isValid, message),
});

// Imperative API:
// field.getValue(); field.setValue("ada"); field.validate(); field.focus();
```

## Notes

- Built on a native `<input>`, so keyboard, mobile, and autofill behavior work normally.
- With a `validation` mode set, input is filtered as you type and the border turns green (valid) or red (invalid).
- Icons require the Material Icons font (see [Icon](Icon.md)).

## Related widgets
- [Button](Button.md)
- [Checkbox](Checkbox.md)
- [Radio](Radio.md)
- [Switch](Switch.md)
- [Dropdown](Dropdown.md)

---

## Continue reading

- **Previous:** [Button](Button.md)
- **Next:** [Checkbox](Checkbox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (2 of 8).
