# Pagination

## Overview
`Pagination` renders a page navigator as a centered, wrapping `Row` of [Button](Button.md) widgets: optional first/prev icons, a sliding window of up to `maxButtons` numbered pages (active one filled in `color` and disabled), `...` ellipses plus jump buttons for the edges, optional next/last icons, and an optional summary like `Page 1 of 10 (1-10 of 95)`. It is computed from `totalItems / pageSize`; when there is only one page (or none) it returns `null`. Clicking a page fires `onPageChange(page)`.

## When to use
- Split a long list, table, or search result into pages.
- Give users direct jumps (first/last, numbered pages) instead of infinite scroll.
- Pair with [DataTable](DataTable.md) or [ListView](ListView.md) slices of a larger dataset.

## Import

```javascript
import { Pagination } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Pagination } from "flet-box";

Pagination({ totalItems: 100, onPageChange: (page) => console.log("page", page) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `totalItems` | number | `0` | Total number of records. `totalPages = ceil(totalItems / pageSize)`; with 1 page or fewer the widget returns `null`. |
| `pageSize` | number | `10` | Records per page. |
| `currentPage` | number | `1` | Initial active page, clamped to `1`–`totalPages`. |
| `onPageChange` | `(page: number) => void` | — | Fires with the new page number on every valid navigation click. |
| `showFirstLast` | boolean | `true` | Adds `first_page` / `last_page` icon buttons. |
| `showPrevNext` | boolean | `true` | Adds `chevron_left` / `chevron_right` icon buttons. |
| `maxButtons` | number | `5` | Size of the sliding window of numbered page buttons. |
| `variant` | `'filled'`, `'outlined'`, `'text'` | `'outlined'` | Button variant for non-active buttons. |
| `color` | Color | `colors.primary` | Background of the active page button. |
| `size` | `'small'`, `'medium'`, `'large'` | `'medium'` | Preset for button box (32/36/42px), font (12/14/16px), icon (16/20/24px), and gap (4/6/8px). |
| `disabled` | boolean | `false` | Ignores all page changes and disables every button. |
| `showTotal` | boolean | `true` | Appends the summary text (only when `totalItems > 0`). |
| `label` | string | `'Page'` | First word of the summary text. |

These are the props specific to `Pagination`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style` — applied to the outer `Row`.

## Examples

### Everyday example

```javascript
import { Column, Pagination, Text } from "flet-box";

let page = 1;

Column({
  gap: 12,
  children: [
    Text({ text: `Showing page ${page}` }),
    Pagination({
      totalItems: 240,
      pageSize: 24,
      currentPage: page,
      onPageChange: (p) => { page = p; console.log("load page", p); },
    }),
  ],
});
```

### Full example

```javascript
import { Column, Pagination, colors } from "flet-box";

const items = Array.from({ length: 487 }, (_, i) => `Item ${i + 1}`);
let currentPage = 3;

const render = () => {
  const start = (currentPage - 1) * 50;
  return Column({
    gap: 16,
    children: [
      // ...your list/table for items.slice(start, start + 50)...
      Pagination({
        totalItems: items.length,
        pageSize: 50,
        currentPage,
        maxButtons: 7,
        variant: "outlined",
        color: colors.primary,
        size: "large",
        showFirstLast: true,
        showPrevNext: true,
        showTotal: true,
        label: "Page",
        onPageChange: (p) => { currentPage = p; render(); },
      }),
    ],
  });
};

render();
```

## Notes

- The widget is a **snapshot**: clicking updates its internal `current` (so repeat clicks on the same page are ignored) and fires `onPageChange`, but it does not re-render itself. Rebuild `Pagination` with the new `currentPage` in your handler to move the highlight — see the full example.
- Returns `null` when `ceil(totalItems / pageSize) <= 1`, so guard layouts that expect an element.
- The active page button is rendered `filled` in `color` and is disabled; all other buttons use `variant` with a transparent background.
- Edge behavior: when the window doesn't include page 1 (or the last page), an extra button for it is added, separated by a `...` `Text` when there's a gap.
- Prev/first buttons disable on page 1; next/last disable on the last page. Icon buttons use the Material Icons font (see [Icon](Icon.md)).
- Summary format is exactly: `` `${label} ${current} of ${totalPages} (${start}-${end} of ${totalItems})` ``.

## Related widgets
- [Button](Button.md)
- [Row](Row.md)
- [DataTable](DataTable.md)
- [ListView](ListView.md)
- [Stepper](Stepper.md)

---

## Continue reading

- **Previous:** [FloatingActionButton](FloatingActionButton.md)
- **Next:** [Stepper](Stepper.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (10 of 10).
