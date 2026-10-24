# FletBox utilities

FletBox includes small helpers for common UI and application tasks. Import only the helpers you need from `flet-box`.

These 123 helpers are the **short form** of code you would otherwise write by hand —
a shadow, a gradient, a mock list, a retry, a relative date. The rule that goes with
them is a comparison, not a prohibition: reach for a helper when the code it replaces
is longer or less clear, which for the examples below it is.

The one trap: **a routed prop is already the short form**. `Container({ padding: 16 })`
is shorter and more correct than `padding: padding(16)`, because the number reaches the
rem contract and the helper returns a pixel string. Use the string builders for a CSS
value a prop cannot express, not instead of a number.

Two names that read as something else: `filter({ blur: 5 })` builds a CSS filter, it
does not filter a list (that is `mapList`, `sort`, `unique`), and `color(x).lighten(20)`
is a chain that only becomes a color at `.hex()`, `.rgb()` or `.rgba()`.

## Layout helpers

Use direct props for the simplest code:

```javascript
Container({
  padding: 16,
  margin: "8px 0",
  gap: 12,
});
```

Use helpers when spacing or layout becomes more descriptive:

```javascript
import { border, flex, grid, margin, padding, shadow } from "flet-box";

Container({
  padding: padding({ horizontal: 20, vertical: 12 }),
  margin: margin({ top: 8, bottom: 16 }),
  border: border(1, "solid", "#e5e7eb"),
  shadow: shadow(0, 4, 12, 0, "rgba(0,0,0,0.12)"),
});

const columns = grid({ columns: 3, gap: 16 });
const flexible = flex(1, 0, "auto");
```

## Colors and effects

```javascript
import { color, gradient, rgba } from "flet-box";

const transparentBlue = rgba(37, 99, 235, 0.2);
const background = gradient("linear", ["#6366f1", "#8b5cf6"], 135);
const lighter = color("#6366f1").lighten(20);
```

Color helpers can lighten, darken, adjust alpha, inspect contrast, and create related colors.

Effects such as transforms and transitions return values that can be used by supported direct props:

```javascript
import { transform, transition } from "flet-box";

Container({
  transform: transform({ translateY: -4, scale: 1.02 }),
  transition: transition({ property: "all", duration: 0.3, timing: "ease" }),
});
```

## Lists and mapping

```javascript
import { createList, mapList, range, repeat } from "flet-box";

const numbers = range(0, 10, 2);
const repeated = repeat(3, (index) => Text({ text: `Item ${index}` }));
const widgets = mapList(users, (user) => Text({ text: user.name }));
```

`createList` provides data helpers:

```javascript
const page = createList.paginate(users, 2, 20);
const matches = createList.search(users, "ada", ["name", "email"]);
const grouped = createList.groupBy(users, "role");
const sorted = createList.sort(users, "name", "asc");
```

Array helpers include `shuffle`, `reverse`, `sort`, `unique`, and `chunk`.

## Random values and ids

```javascript
import { random, shortId, uuid } from "flet-box";

const userId = uuid();
const short = shortId();
const name = random.fullName();
const email = random.email();
const colorValue = random.hexColor();
```

Use random helpers for demos and sample data. Do not use generated demo values as security credentials.

## Strings and dates

The short form of the text and calendar code you would otherwise write by hand.

```javascript
import {
  addDays,
  capitalizeWords,
  dateDiff,
  dayOfWeek,
  formatDate,
  formatDateLong,
  isWeekend,
  parseDate,
  relativeTime,
  seconds,
  timeAgoLocale,
  today,
  trim,
  truncate,
} from "flet-box";

capitalizeWords("flet box");          // "Flet Box"
truncate("A very long sentence", 10); // "A very lon..."
trim("   flet-box   ");               // "flet-box"

formatDate(today(), "YYYY-MM-DD");    // today(), read back as itself
formatDateLong(addDays(new Date(), 7));
dayOfWeek("2024-01-15");              // "Monday"
isWeekend("2024-01-15");              // false
dateDiff(parseDate("15/01/2024", "DD/MM/YYYY"), new Date(), "days");
relativeTime(Date.now() - seconds(90)); // "1 minute ago"
timeAgoLocale(Date.now() - seconds(90), "es"); // "hace 1 minuto"
```

Two things the helpers get right that hand-rolled `new Date(...)` chains usually
don't. A bare `"YYYY-MM-DD"` is read as a **calendar day in the reader's zone**,
so `isToday(today())` is true on a machine in any timezone; and `addDays` counts
days on the calendar rather than adding `86400000` milliseconds, so it does not
slip a day across a DST transition. `months(n)` and `years(n)` are the honest
exceptions — they approximate 30 and 365 days, which is fine for a cache window
and wrong for a birthday. For the repeating half of the same module — `every()`,
`everySecond()`, `timer()`, `waitUntil()` — see
[Text & time](../tools/text-and-time.md); whatever registers an interval releases
it in `onUnmount`.

## Delays and retries

```javascript
import { delay, retry, withMinDelay } from "flet-box";

await delay(500);
await retry(fetchData, 3, 1000);
await withMinDelay(fetchData(), 800);
```

Use these helpers for loading states, demos, and recoverable network operations.
`waitUntil(condition, timeout, interval)` and `waitForElement(selector, …)` cover
the polling loop, and both **throw** at their timeout — await them inside a
`try`, or answer them with a `.catch`.

## Device and dimensions

```javascript
import { device, dimensions, height, width } from "flet-box";

if (device.isMobile()) {
  console.log("Mobile layout");
}

console.log(dimensions.getWidth(), dimensions.getHeight());
console.log(width, height);
```

Subscribe to changes:

```javascript
const removeListener = dimensions.addListener(({ width, height }) => {
  console.log(width, height);
});

removeListener();
```

`device` reads a user agent; the width is the fact a layout can trust. The full
reference — the breakpoint table, the subscription and font loading — is
[Device & environment](../tools/device.md).

## Breakpoints

One table, five steps, in CSS pixels: `xs` 0, `sm` 560, `md` 768, `lg` 1024,
`xl` 1280. `md` is the same line `AdaptiveScaffold` draws between a drawer and a
permanent sidebar, so a screen and its shell cannot disagree.

```javascript
import { atLeast, pick, currentBreakpoint } from "flet-box";

const twoColumns = atLeast("md");
const gutter = pick({ xs: 16, md: 24, lg: 32 });
const step = currentBreakpoint(); // "sm" at 600px, "md" at 800px

// A step that is not named inherits the nearest smaller one:
// pick({ xs: 8, md: 16 }) answers 8, 8, 16, 16, 16.
```

Rebuild only when the viewport *crosses* a step, not on every pixel of a resize.
`onBreakpointChange` returns the unsubscribe — hand it to the widget that owns the
subscription:

```javascript
const [isWide, setIsWide] = useState("isWide", atLeast("md"));

const screen = Column({
  padding: gutter,
  children: [Text({ text: String(isWide) })],
});

screen.onUnmount(onBreakpointChange(() => setIsWide(atLeast("md"))));
```

## Fonts

`fontFamily` is a name. If the bytes of that face are not on the machine, the
browser paints its own fallback and the app ships a typeface nobody chose.

```javascript
import { loadFont, fontsReady } from "flet-box";

// A webfont is a network request: ask, wait, then name it.
const loaded = await loadFont("Inter", { weights: [400, 600] });
if (loaded) Text({ text: "Hello", fontFamily: "Inter" });

// Before a canvas paint or an export, where reflowing text is a visible bug.
await fontsReady();
```

`loadFont` resolves `false` when the face could not be had — it never fails a
screen. Pass `url` to load your own same-origin stylesheet instead of a
provider's, which is the answer an offline launch keeps.

## Themes and colors

```javascript
import {
  colors,
  getColor,
  getTheme,
  setTheme,
  toggleTheme,
} from "flet-box";

const primary = colors.primary;
const text = getColor("text");
setTheme("dark");
const current = getTheme();
toggleTheme();
```

React to theme changes:

```javascript
import { subscribeTheme } from "flet-box";

const unsubscribe = subscribeTheme((nextColors) => {
  console.log(nextColors.primary);
});
```

## Clipboard

```javascript
import { clipboard } from "flet-box";

clipboard.copy("Copied text");
const text = await clipboard.read();
```

Browser permissions may be required for reading clipboard content.

## Text input validation

```javascript
import { TextInputValidator } from "flet-box";

TextInputValidator.isEmail("user@example.com");
TextInputValidator.onlyNumbers("abc123");
TextInputValidator.sanitize(userInput);
TextInputValidator.limitLength(userInput, 50);
```

The `Input` widget can use these rules through its `validation` prop.

## Markdown and code helpers

```javascript
import {
  escapeHtml,
  generateHighlightedHtml,
  markdownToWidgets,
} from "flet-box";

const content = markdownToWidgets("# Hello\n\nThis is **bold**");
const safe = escapeHtml(userText);
const highlighted = generateHighlightedHtml(code);
```

Escape untrusted text before displaying it as HTML.

## Media time helpers

```javascript
import {
  formatMediaProgress,
  formatMediaTime,
  getProgressPercent,
  percentToSeconds,
} from "flet-box";

formatMediaTime(125); // 02:05
getProgressPercent(30, 120);
percentToSeconds(50, 120);
formatMediaProgress(30, 120);
```

## Choosing a utility

- Need spacing? Start with direct `padding`, `margin`, and `gap` props.
- Need reusable data? Use `createList`, `mapList`, or `range`.
- Need shared UI state? Read [State with `useState`](state.md).
- Need URL changes? Read [Routing](router.md).
- Need colors that follow the app theme? Use `colors` and `getColor`.
- Need browser information? Use `device`, `os`, and `dimensions`.
- Need a layout that changes with the window? Use `atLeast` and `pick`, and
  subscribe with `onBreakpointChange` — never a user-agent guess.
- Need a typeface that is not on the machine? Load it with `loadFont` before you
  name it in `fontFamily`.
- Need a date moved, compared or labelled? Use `addDays`, `dateDiff`, `formatDate`
  and `timeAgo` — not a millisecond walk you have to re-derive each time.
- Need a period, a stopwatch or a poll loop? Use `seconds(30)` and `every(…)`,
  `timer(label)`, `waitUntil(…)`; the id `every` hands back is what `clearInterval`
  releases in `onUnmount`.

---

## Continue reading

- **Previous:** [Animation helpers](../tools/animation.md) — end of the tools chapter.
- **Next:** [The FletBox CLI](../cli/README.md) — Chapter 11
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
