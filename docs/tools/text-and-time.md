# Text & time

## Overview
Small pure helpers for strings, dates, waiting and repeating. They take a value
and return a formatted one — no side effects, except the four that hand back a
timer id or a promise.

## When to use
- Normalize user names or titles before display (`capitalize`, `truncate`).
- Show friendly dates, weekday names and "2 minutes ago" labels.
- Step a date by a calendar day, or measure the gap between two.
- Wait for a condition or an element without writing the poll loop twice.
- Format audio/video positions in player UIs.

## Import

```javascript
import {
  capitalize,
  truncate,
  formatDate,
  formatDateLong,
  addDays,
  dateDiff,
  relativeTime,
  seconds,
  sleep,
  everySecond,
} from "flet-box";
```

## Functions

### Text

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `startsWith` | `startsWith(str, prefix)` | `boolean` | Whether `str` begins with `prefix`. |
| `endsWith` | `endsWith(str, suffix)` | `boolean` | Whether `str` ends with `suffix`. |
| `includes` | `includes(str, substr)` | `boolean` | Whether `str` contains `substr`. |
| `split` | `split(str, separator)` | `string[]` | Text into parts. |
| `join` | `join(arr, separator?)` | `string` | Parts back into text. |
| `trim` | `trim(str)` | `string` | Leading and trailing whitespace removed. |
| `capitalize` | `capitalize(str)` | `string` | First letter uppercase. |
| `capitalizeWords` | `capitalizeWords(str)` | `string` | First letter of every word uppercase. |
| `lowerCase` | `lowerCase(str)` | `string` | All lowercase. |
| `upperCase` | `upperCase(str)` | `string` | All uppercase. |
| `reverseString` | `reverseString(str)` | `string` | Reversed text. |
| `truncate` | `truncate(str, length?, suffix?)` | `string` | Cut to `length` characters and append `suffix` (default `"..."`). |

### Units

Every one of these takes a count and returns **milliseconds**, so it reads as a
sentence at the call site: `waitFor(seconds(30))`, `now() - days(2)`.

| Function | Signature | Returns |
| --- | --- | --- |
| `seconds` | `seconds(n)` | `n * 1000` |
| `minutes` | `minutes(n)` | `n * 60 * 1000` |
| `hours` | `hours(n)` | `n * 60 * 60 * 1000` |
| `days` | `days(n)` | `n * 24 * 60 * 60 * 1000` |
| `weeks` | `weeks(n)` | `7 * days(n)` |
| `months` | `months(n)` | `30 * days(n)` — an approximation, on purpose |
| `years` | `years(n)` | `365 * days(n)` — an approximation, on purpose |

`months()` and `years()` are calendar lies told for arithmetic: use them for a
cache window or a retry backoff, never for an age or a birthday.

### Dates & time

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `now` | `now()` | `number` | Timestamp in milliseconds. |
| `today` | `today()` | `string` | This day as `"YYYY-MM-DD"`. |
| `yesterday` | `yesterday()` | `string` | Yesterday as `"YYYY-MM-DD"`. |
| `tomorrow` | `tomorrow()` | `string` | Tomorrow as `"YYYY-MM-DD"`. |
| `dayOfWeek` | `dayOfWeek(date)` | `string` | Full weekday name, e.g. `"Monday"`. |
| `monthName` | `monthName(date)` | `string` | Full month name, e.g. `"January"`. |
| `isToday` | `isToday(date)` | `boolean` | Same calendar day as now. |
| `isYesterday` | `isYesterday(date)` | `boolean` | The day before now. |
| `isTomorrow` | `isTomorrow(date)` | `boolean` | The day after now. |
| `isWeekend` | `isWeekend(date)` | `boolean` | Saturday or Sunday. |
| `isLeapYear` | `isLeapYear(year)` | `boolean` | Whether a four-digit year has a February 29. |
| `formatDate` | `formatDate(date, format?)` | `string` | Tokens `YYYY MM DD HH mm ss`; anything else passes through. |
| `formatDateLong` | `formatDateLong(date, locale?)` | `string` | `"Monday, January 15, 2024"`. |
| `formatDateShort` | `formatDateShort(date, locale?)` | `string` | `"Jan 15, 2024"`. |
| `formatTime` | `formatTime(date)` | `string` | 24-hour `"14:05:30"`. |
| `formatTimeAmPm` | `formatTimeAmPm(date)` | `string` | 12-hour `"02:05:30 PM"`. |
| `parseDate` | `parseDate(str, format?)` | `Date` | Reads `"15/01/2024"` with `"DD/MM/YYYY"`. |
| `dateDiff` | `dateDiff(a, b, unit?)` | `number` | Absolute difference; `unit` is one of the names above. |
| `addDays` | `addDays(date, n)` | `Date` | `n` calendar days along (negative goes back). |
| `addHours` / `addMinutes` / `addSeconds` | `addHours(date, n)` | `Date` | Elapsed time, not calendar time. |
| `subtractDays` / `subtractHours` / `subtractMinutes` / `subtractSeconds` | `subtractDays(date, n)` | `Date` | The same steps backwards. |
| `timeAgo` | `timeAgo(date)` | `string` | `"5 minutes ago"`, `"just now"` under a second. |
| `relativeTime` | `relativeTime(date)` | `string` | Alias of `timeAgo`. |
| `timeAgoLocale` | `timeAgoLocale(date, locale?)` | `string` | The same label in `"en"` or `"es"` — `"hace 1 hora"`. |
| `waitFor` | `waitFor(ms)` | `Promise<void>` | Resolves after `ms`. |
| `wait` / `sleep` | `sleep(ms)` | `Promise<void>` | Aliases of `waitFor`. |
| `waitUntil` | `waitUntil(condition, timeout?, interval?)` | `Promise<true>` | Polls `condition`; **throws** at the timeout (default 30s, 1s apart). |
| `waitForElement` | `waitForElement(selector, timeout?, interval?)` | `Promise<Element>` | Polls the DOM; needs a document, so call it from a screen (default 10s, 0.5s apart). |
| `timer` | `timer(label)` | `{ stop, elapsed }` | `stop()` logs and returns the milliseconds; `elapsed()` reads without logging. |
| `every` | `every(ms, callback)` | `number` | `setInterval` with the duration first. Release the id it returns. |
| `everySecond` / `everyMinute` / `everyHour` / `everyDay` | `everySecond(callback)` | `number` | The same, at a named period. |

`date` is a `Date`, a timestamp, or a string. A bare `"YYYY-MM-DD"` is read as a
**calendar day in the reader's own zone**, so `isToday(today())` is true on every
machine; a string with an offset or a `Z` is read as an instant, and a formatter
then prints it in local time. `addDays` counts days on the calendar, which is why
it survives a DST night, while `addHours` counts real elapsed time — the right
choice for a countdown and the wrong one for "this time next week".

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

### A due date, read as a day

```javascript
import { addDays, dateDiff, dayOfWeek, formatDate, isWeekend, timeAgoLocale } from "flet-box";

const due = addDays(new Date(), 7);
const label = `${dayOfWeek(due)}, ${formatDate(due, "DD MMM")} · in ${dateDiff(new Date(), due, "days")} days`;
const note = isWeekend(due) ? " (it lands on a weekend)" : "";

Text({ text: label + note });
Text({ text: timeAgoLocale(Date.now() - seconds(90), "es") }); // "hace 1 minuto"
```

### Waiting, and releasing what repeats

```javascript
import { Column, Text, everySecond, formatTime, now, seconds, useState, waitUntil } from "flet-box";

export const ClockScreen = () => {
  const [clock, setClock] = useState("clock", formatTime(now()));
  const root = Column({ children: [Text({ text: clock })] });

  const tick = everySecond(() => setClock(formatTime(now())));
  // R6: a repeating helper hands back an id, and the screen releases it.
  root.onUnmount(() => clearInterval(tick));

  waitUntil(() => navigator.onLine, seconds(30), seconds(1))
    .then(() => setClock("back online"))
    .catch(() => setClock("still offline")); // waitUntil throws at its timeout

  return root;
};
```

### Full example

```javascript
import { formatMediaProgress, getProgressPercent } from "flet-box";

const pct = getProgressPercent(90, 300); // 30
const label = formatMediaProgress(90, 300); // "1:30 / 5:00"
```

## Notes

- `formatDate(date, format?)` accepts a `Date`, a timestamp, or a date string. The tokens it reads are `YYYY MM DD HH mm ss`; it has no `ddd`, so build a weekday name with `dayOfWeek()`.
- `waitUntil()` and `waitForElement()` **throw** on their timeout — await them inside a `try`, or attach a `.catch`.
- `every()`, `everySecond()` and friends return a `setInterval` id. Per the working contract, whatever a screen registers it also releases in `onUnmount`.
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