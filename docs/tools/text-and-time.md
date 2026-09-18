# Text & time

## Overview
Small pure helpers for strings, dates, and media time. They take a value and return a formatted one — no side effects.

## When to use
- Normalize user names or titles before display (`capitalize`, `truncate`).
- Show friendly dates and "2 minutes ago" labels.
- Format audio/video positions in player UIs.

## Import

```javascript
import { capitalize, truncate, formatDate, relativeTime } from "flet-box";
```

## Functions

### Text

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `capitalize` | `capitalize(str)` | `string` | First letter uppercase. |
| `capitalizeWords` | `capitalizeWords(str)` | `string` | First letter of every word uppercase. |
| `lowerCase` | `lowerCase(str)` | `string` | All lowercase. |
| `upperCase` | `upperCase(str)` | `string` | All uppercase. |
| `reverseString` | `reverseString(str)` | `string` | Reversed text. |
| `truncate` | `truncate(str, length?, suffix?)` | `string` | Cut to `length` characters and append `suffix` (default `"..."`). |

### Dates & time

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `formatDate` | `formatDate(date, format?)` | `string` | Format a date/string/number as text. |
| `relativeTime` | `relativeTime(date)` | `string` | A human label, e.g. `"2 minutes ago"`. |
| `now` | `now()` | `number` | Timestamp in milliseconds. |

### Media time

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `formatMediaTime` | `formatMediaTime(seconds)` | `string` | Compact `m:ss` (or `h:mm:ss`). |
| `formatMediaTimeLong` | `formatMediaTimeLong(seconds)` | `string` | Long form with units. |
| `getProgressPercent` | `getProgressPercent(current, total)` | `number` | `current/total` as a `0–100` percent. |
| `percentToSeconds` | `percentToSeconds(percent, total)` | `number` | Inverse of `getProgressPercent`. |
| `formatMediaProgress` | `formatMediaProgress(current, total)` | `string` | `"current / total"` formatted for a player. |

## Examples

### Everyday example

```javascript
import { Text, capitalizeWords, relativeTime } from "flet-box";

Text({
  text: `${capitalizeWords("hello fletbox")} — ${relativeTime(Date.now() - 120000)}`,
});
// "Hello Fletbox — 2 minutes ago"
```

### Full example

```javascript
import { formatMediaProgress, getProgressPercent } from "flet-box";

const pct = getProgressPercent(90, 300); // 30
const label = formatMediaProgress(90, 300); // "1:30 / 5:00"
```

## Notes

- `formatDate(date, format?)` accepts a `Date`, a timestamp, or a date string; `format` is optional and platform-specific tokens apply.
- The media-time helpers are used by the [Audio](../widget/Audio.md) and [Video](../widget/Video.md) widgets.
- All functions return new values — inputs are never modified.

## Related pages
- [Lists, arrays & data](lists.md) — previous chapter.
- [State, memo & refs](state.md) — next chapter.
- [Input validation](validation.md) — more string rules.

---

## Continue reading

- **Previous:** [Lists, arrays & data](lists.md)
- **Next:** [State, memo & refs](state.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (3 of 12).