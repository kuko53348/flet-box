# Input validation

## Overview
`TextInputValidator` is a rules object for cleaning and validating text as the user types. The `Input` widget's `validation` prop uses these very rules.

## When to use
- Restrict a field to letters, numbers, or alphanumerics.
- Validate an email address or a safe-string before submit.
- Sanitize text before storing it.

## Import

```javascript
import { TextInputValidator } from "flet-box";
```

## Methods

| Method | Signature | Returns | Description |
| --- | --- | --- | --- |
| `onlyLetters` | `onlyLetters(value)` | `string` | Remove anything that is not a letter. |
| `onlyNumbers` | `onlyNumbers(value)` | `string` | Remove anything that is not a digit. |
| `onlyAlphanumeric` | `onlyAlphanumeric(value)` | `string` | Keep letters and digits only. |
| `filter` | `filter(value, pattern)` | `string` | Remove matches of a regex `pattern`. |
| `filterEmail` | `filterEmail(value)` | `string` | Keep valid email characters. |
| `isEmail` | `isEmail(value)` | `boolean` | Is this a valid email? |
| `limitLength` | `limitLength(value, maxLength)` | `string` | Truncate to `maxLength`. |
| `isOnlyLetters` | `isOnlyLetters(value)` | `boolean` | Contains only letters? |
| `isOnlyNumbers` | `isOnlyNumbers(value)` | `boolean` | Contains only digits? |
| `sanitize` | `sanitize(value)` | `string` | Clean unsafe characters / control text. |
| `escapeHtml` | `escapeHtml(value)` | `string` | Escape HTML-significant characters. |
| `safeText` | `safeText(value)` | `string` | Escape unsafe text for insertion. |
| `isSafe` | `isSafe(value)` | `boolean` | Is the text safe as-is? |

## Examples

### Everyday example

```javascript
import { TextInputValidator } from "flet-box";

const phone = TextInputValidator.onlyNumbers("call 555-1234"); // "5551234"
const email = TextInputValidator.isEmail("ada@example.com");  // true
```

### Full example

```javascript
import { TextInputValidator } from "flet-box";

const name = TextInputValidator.onlyLetters("A1na 2");
const short = TextInputValidator.limitLength("description here", 8);
const safe = TextInputValidator.safeText("<script>alert(1)</script>");
```

## Notes

- The cleaning methods are safe to call on every keystroke — they are used live by the `Input` widget.
- Use `isEmail`/`isOnlyLetters`/`isOnlyNumbers`/`isSafe` for form validation before submit; use the cleaning methods to normalize while typing.
- `escapeHtml`/`safeText` exist both here and as standalone helpers — prefer the standalone `escapeHtml` when you are not inside an `Input` flow.

## Related pages
- [Widget introspection](introspection.md) — previous chapter.
- [Animation helpers](animation.md) — next chapter.
- [Input widget](../widget/Input.md) — where validation is applied.

---

## Continue reading

- **Previous:** [Widget introspection](introspection.md)
- **Next:** [Animation helpers](animation.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (11 of 12).