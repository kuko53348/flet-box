# FletBox utilities

FletBox includes small helpers for common UI and application tasks. Import only the helpers you need from `flet-box`.

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

```javascript
import {
  capitalizeWords,
  formatDate,
  relativeTime,
  truncate,
} from "flet-box";

capitalizeWords("flet box");
truncate("A very long sentence", 10, "...");
formatDate(new Date(), "YYYY-MM-DD");
relativeTime("2026-01-01");
```

## Delays and retries

```javascript
import { delay, retry, withMinDelay } from "flet-box";

await delay(500);
await retry(fetchData, 3, 1000);
await withMinDelay(fetchData(), 800);
```

Use these helpers for loading states, demos, and recoverable network operations.

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

---

## Continue reading

- **Previous:** [Animation helpers](../tools/animation.md) — end of the tools chapter.
- **Next:** [The FletBox CLI](../cli/README.md) — Chapter 11
- **Index:** [Guides index](README.md) · [The FletBox Book](../README.md)
