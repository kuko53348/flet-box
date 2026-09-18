# Tools: the FletBox utility book

This directory is a book, just like the [widget book](../widget/README.md). It documents every helper function that ships with FletBox — the pre-built code that lets you solve common problems **inside the framework**, without reaching for a third-party library or a search engine.

Tools are plain JavaScript functions. You import them from `flet-box` exactly like widgets:

```javascript
import { rgba, uuid, sort, formatDate } from "flet-box";
```

Read this book in order to go from visual styling helpers to state, async, and device utilities, or jump straight to a tool from the index below.

## How to read this book

- Chapters go from **most used to most specialized**. Read them top to bottom the first time.
- At the end of every page there is a **Continue reading** block with the previous page, the next page, and a link back to this index.
- Each page has the same shape: a one-minute overview, when to use it, the full function API with parameters and return values, and copy-paste examples.
- Every example is self-contained and runs as-is.

Related books and guides: [Widgets](../widget/README.md) · [Services](../services/README.md) · [Frontend services guide](../guides/frontend-services.md) · [Architecture](../arquitectura.md).

> **Tools vs. Services.** *Tools* are pure helpers — they take input and give you back a value (a color string, a sorted array, a formatted date, a new id). *Services* talk to the outside world — browser storage and the network. Find services in the [services book](../services/README.md).

## The reading path

### Chapter 1 · Styling helpers (CSS in JS)

Small functions that return CSS values, so you can style widgets without writing raw CSS strings.

1. [color](color.md) — parse, convert, and manipulate colors
2. [rgba](rgba.md) — build an `rgba()` string from parts
3. [gradient](gradient.md) — build linear, radial, and conic gradients
4. [border](border.md) — build a `border` shorthand string
5. [shadow](shadow.md) — build a `box-shadow` string
6. [padding](padding.md) — turn numbers or shorthand into padding CSS
7. [margin](margin.md) — turn numbers or shorthand into margin CSS
8. [flex](flex.md) — build a `flex` shorthand string
9. [grid](grid.md) — build grid template and area strings
10. [filter](filter.md) — build a CSS `filter` string
11. [transform](transform.md) — build a CSS `transform` string
12. [transition](transition.md) — build a CSS `transition` string
13. [animation](animation.md) — build a CSS `animation` shorthand string

### Chapter 2 · Lists, arrays & data

Helpers for shaping collections and generating data.

14. [array](array.md) — shuffle, reverse, sort, unique, chunk
15. [mapList](mapList.md) — map a list to widgets, repeat, and range
16. [dict](dict.md) — a Python-like dictionary with chainable methods
17. [createList](createList.md) — generate mock data from a schema
18. [random](random.md) — random numbers, ids, colors, and fake data

### Chapter 3 · Text & time

19. [string](string.md) — capitalize, case conversion, truncate
20. [time](time.md) — format dates, relative time, sleep, and now

### Chapter 4 · State, memo & refs

21. [useState](useState.md) — reactive state that re-renders widgets
22. [memo](memo.md) — cache expensive function results
23. [ref](ref.md) — hold a live reference to a widget and update it

### Chapter 5 · Async, ids & logging

24. [delay](delay.md) — delay, minimum-delay, and retry helpers
25. [uuid](uuid.md) — generate unique and numeric ids
26. [print](print.md) — a small, elegant logging helper

### Chapter 6 · Device & environment

27. [device](device.md) — detect device type, touch, and orientation
28. [os](os.md) — detect the operating system and browser
29. [dimensions](dimensions.md) — live viewport width and height
30. [clipboard](clipboard.md) — copy and read text from the clipboard

## Alphabetical index

- [animation](animation.md)
- [array](array.md)
- [border](border.md)
- [clipboard](clipboard.md)
- [color](color.md)
- [createList](createList.md)
- [delay](delay.md)
- [device](device.md)
- [dict](dict.md)
- [dimensions](dimensions.md)
- [filter](filter.md)
- [flex](flex.md)
- [gradient](gradient.md)
- [grid](grid.md)
- [mapList](mapList.md)
- [margin](margin.md)
- [memo](memo.md)
- [os](os.md)
- [padding](padding.md)
- [print](print.md)
- [random](random.md)
- [ref](ref.md)
- [rgba](rgba.md)
- [shadow](shadow.md)
- [string](string.md)
- [time](time.md)
- [transform](transform.md)
- [transition](transition.md)
- [useState](useState.md)
- [uuid](uuid.md)
