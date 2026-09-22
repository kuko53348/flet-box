# Tools: FletBox helper functions

This directory is the reference index for the helper functions that ship with FletBox — the pre-built code that lets you solve common problems **inside the framework**, without reaching for a third-party library or a search engine.

Tools are plain JavaScript functions. You import them from `flet-box` exactly like widgets:

```javascript
import { rgba, uuid, sort, formatDate } from "flet-box";
```

> **Tools vs. Services.** *Tools* are pure helpers — they take input and give you back a value (a color string, a sorted array, a formatted date, a new id). *Services* talk to the outside world — browser storage and the network. Find services in the [services index](../services/README.md).

For a task-oriented walkthrough of the most common helpers, read the [Utilities guide](../guides/utilities.md). This index lists everything the framework actually exports today, grouped by category, and **each category has its own reference page** with full signatures, returns, and examples. Every name below is present in `src/index.js`; the implementation lives in `src/tools/` and `src/utils/` (plus `src/animations/` for the animation helpers).

## The tourist's map

Each category is the next chapter of the reading path:

| Page | What you find there |
| --- | --- |
| [Styling helpers](styling.md) | CSS-in-JS strings: `border`, `margin`, `gradient`, `color`, `transform`, … |
| [Lists, arrays & data](lists.md) | `mapList`, `repeat`, `sort`, `unique`, `createList`, `dict`, `random` |
| [Text & time](text-and-time.md) | `capitalize`, `truncate`, `formatDate`, media-time helpers |
| [State, memo & refs](state.md) | `useState`, `memo`, `ref` |
| [Reactivity in FletBox](reactivity.md) | Every way a widget updates: state, setters, theme, router, and more |
| [Async, ids & logging](async-ids-log.md) | `delay`, `retry`, `uuid`, `shortId`, `print` |
| [Device & environment](device.md) | `device`, `os`, `dimensions`, `clipboard` |
| [Themes](theme.md) | `colors`, `setTheme`, `ThemeProvider`, `useTheme` |
| [Markdown, code & HTML](markdown.md) | markdown → HTML/widgets, syntax highlighting, `escapeHtml` |
| [Visual effects](visual-effects.md) | `applyShimmer`, `applyGlow`, `applyPulse`, `injectKeyframes` |
| [Widget introspection](introspection.md) | `getWidgetProps`, `getWidgetProp`, `stringifyWidgetProps` |
| [Input validation](validation.md) | `TextInputValidator` rules |
| [Animation helpers](animation.md) | `animate`, `fadeIn`, `pulse` + `AnimatedBox` and friends |

## Styling helpers (CSS in JS)

Small functions that return CSS values, so you can style widgets without writing raw CSS strings.

- `animation(value)` — build a CSS `animation` shorthand string.
- `border(width, style, color)` — build a `border` shorthand string.
- `gradient(type, colors, angle)` — build linear, radial, and conic gradients.
- `margin(...)` / `padding(...)` — turn numbers or CSS shorthand into a spacing value.
- `rgba(r, g, b, a)` — build an `rgba()` string from parts.
- `shadow(value)` — build a `box-shadow` string.
- `transform(value)` / `transition(value)` — build CSS `transform`/`transition` strings.
- `filter(value)` — build a CSS `filter` string.
- `flex(...)` — build a `flex` shorthand string.
- `grid(...)` — build grid template and area strings.
- `color(value)` — create a chainable Color object: `hex()`, `rgb()`, `rgba()`, `lighten(n)`, `darken(n)`, `alpha(a)`, `complement()`, plus `isDark()`/`isLight()` and `contrast()`.
- `stackPosition(...)` — apply absolute stacking position + centering.
- `toREM(value)`, `toPX(value)`, `setBaseFontSize(px)`, `getBaseFontSize()` — unit conversion helpers.

## Lists, arrays & data

Helpers for shaping collections and generating data.

- `mapList(list, fn)` — map a list; `repeat(n, fn)` and `range(a, b)` generate lists.
- `shuffle(list)`, `reverse(list)`, `sort(list)`, `unique(list)`, `chunk(list, size)` — collection transforms.
- `dict(...)` / `emptyDict()` — a Python-like dictionary with chainable methods.
- `fromJSON(text)` / `fromEntries(entries)` — object building helpers.
- `createList(schema, count)` — generate mock/structured data.
- `random(...)` — random numbers, ids, colors, and fake data.

## Text & time

- `capitalize(text)`, `capitalizeWords(text)`, `lowerCase(text)`, `upperCase(text)`, `reverseString(text)`, `truncate(text, len)` — text transforms.
- `formatDate(date)`, `relativeTime(date)`, `now()` — date helpers; `sleep(ms)` — async delay.
- Media-time helpers: `formatMediaTime(sec)`, `formatMediaTimeLong(sec)`, `getProgressPercent(current, total)`, `percentToSeconds(pct, total)`, `formatMediaProgress(current, total)`.

## State, memo & refs

- `useState(key, initial, widget?, propName?)` — reactive state that re-renders widgets.
- `useWatchState(key, callback)` — subscribe to state changes; returns an unsubscribe function.
- `memo(fn)`, `memoWithKey(fn, keyFn)`, `clearMemo(memoizedFn)` — cache expensive results.
- `ref(...)` — hold a live reference to a widget and update it.
- See [Reactivity in FletBox](reactivity.md) for the full catalogue of update mechanisms.

## Async, ids & logging

- `delay(ms)` — async sleep; `withMinDelay(promise, ms)` — enforce a minimum delay; `retry(call, retries, delayMs)` — retry an async call.
- `uuid()`, `shortId()`, `numericId()`, `timestampId()` — id generators.
- `print(...)` — a small logging helper.

## Device & environment

- `device` — detect device type, touch, and orientation.
- `os` — detect the operating system and browser.
- `dimensions` — live viewport dimensions; `width` and `height` — viewport helpers.
- `clipboard` — copy and read text from the clipboard.
- `addNavigation(...)` — navigation helper.

## Themes

- `colors` and `palettes` — theme color tokens.
- `setTheme(theme)`, `getTheme()`, `toggleTheme()`, `subscribeTheme(callback)`, `applySystemTheme()`, `watchSystemTheme()`, `getColor(name)` — theme control.

## Markdown, code & HTML helpers

- `parseMarkdown(md)`, `parseInlineMarkdown(md)` — reserved placeholders that pass text through unchanged (real rendering is `markdownToWidgets`/`parseInlineToWidgets`).
- `markdownToWidgets(md)` / `parseMarkdownToWidgets(md)` — markdown string → widgets (alias names for the same function).
- `tokenize(code)`, `generateHighlightedHtml(code)`, `highlightColors` — syntax highlighting.
- `escapeHtml(text)` — escape untrusted text before inserting it as HTML.

## Visual effects

- `applyStripes(el)`, `removeStripes(el)`, `applyShimmer(el)`, `applyGlow(el)` — static visual effects.
- `applyIndeterminate(el)`, `applyPulse(el)`, `injectKeyframes(name, keyframes)` — animation-driven effects.

## Widget introspection

- `getWidgetProps(widget)`, `getWidgetProp(widget, name)`, `stringifyWidgetProps(widget)` — inspect a widget's props.

## Input validation

- `TextInputValidator` — rules (`isEmail`, `onlyNumbers`, `onlyLetters`, `limitLength`, `sanitize`, `filter`, …) used by the `Input` widget's `validation` prop.

## Animation helpers

- `animate(el, ...)`, `animateAsync(el, ...)`, `fadeIn(el, ...)`, `fadeOut(el, ...)`, `pulse(el, ...)` and their `*Async` variants.
- Widgets: `AnimatedBox`, `AnimatedText`, `MatrixRain`, `ParallaxBox`.

## Where to go next

- [Utilities guide](../guides/utilities.md) — the practical walkthrough for the most-used helpers.
- [Frontend services guide](../guides/frontend-services.md) — storage and network services.
- [Guides index](../guides/README.md) — every FletBox guide in reading order.
- [Services index](../services/README.md) — the storage and HTTP service reference.
- [Widgets](../widget/README.md) — the widget book.

---

## Continue reading

- **Previous:** [HTTP client](../services/http.md)
- **Next:** [Styling helpers](styling.md)
- **Index:** [Services index](../services/README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (chapter opener).