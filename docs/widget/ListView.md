# ListView

## Overview
`ListView` renders a `<div>` (a flex column with `overflow: hidden`) that virtualizes a scrollable list. You give it `data` plus a `renderItem(item, index)` factory, and it renders only the rows near the viewport (plus a `bufferSize`), so long lists stay fast. It supports a header, footer, empty state, infinite scroll (`onEndReached`), and touch pull-to-refresh (`onRefresh`). `GridView` is this same widget in grid mode.

## When to use
- Render a long, scrollable list of rows efficiently (virtualized).
- Add infinite scroll, pull-to-refresh, or a header/footer/empty state to a list.

## Import

```javascript
import { ListView } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { ListView, Text } from "flet-box";

ListView({
  data: ["A", "B", "C"],
  renderItem: (item) => Text({ text: item }),
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | array | `[]` | The items to render. |
| `renderItem` | `(item, index) => Widget` | — | Factory that builds the element for each item. Required to show rows. |
| `itemSize` | number | `60` | Row height in pixels, used for the virtualization math. |
| `height` | number | `400` | Height of the list viewport in pixels. |
| `width` | Size | `'100%'` | Width of the list. |
| `gap` | number | `0` | Space between rows in pixels. |
| `bufferSize` | number | `5` | Extra rows rendered above and below the viewport. |
| `showsScrollIndicator` | boolean | `true` | When `false`, hides the scrollbar. |
| `expand` | boolean | `true` | Sets `flex: 1` on the list. See Notes — it does not change `height`. |
| `wrapItems` | boolean | `false` | Grid mode (lays rows out in columns). `GridView` sets this for you. |
| `crossAxisCount` | number | `2` | Number of columns when `wrapItems` is true. |
| `onEndReached` | `() => void` | — | Fires when scrolled within `onEndReachedThreshold` of the end. |
| `onEndReachedThreshold` | number | `0.5` | Fraction of a viewport from the end that triggers `onEndReached`. |
| `onRefresh` | `(done) => void` | — | Enables touch pull-to-refresh; call `done()` to finish. |
| `ListHeaderComponent` | Widget or `() => Widget` | — | Rendered above the rows. |
| `ListFooterComponent` | Widget or `() => Widget` | — | Rendered below the rows. |
| `ListEmptyComponent` | Widget or `() => Widget` | — | Rendered when `data` is empty. |

These are the props specific to `ListView`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `updateData(newData)` — intended to replace the dataset, clear the row cache, and re-render. Currently broken — see Notes.
- `scrollToIndex(index, animated = true)` — scrolls so the row at `index` is visible.
- `scrollToStart(animated = true)` — scrolls to the top.
- `scrollToEnd(animated = true)` — scrolls to the bottom.
- `data` — property. The getter returns the current items (safe). The setter is currently broken — see Notes.
- `refreshing` — property. Gets/sets the pull-to-refresh spinner state (safe).

## Examples

### Everyday example

```javascript
import { ListTile, ListView } from "flet-box";

const users = [
  { name: "Jane", email: "jane@example.com" },
  { name: "Alex", email: "alex@example.com" },
];

ListView({
  data: users,
  itemSize: 64,
  renderItem: (user) => ListTile({ title: user.name, subtitle: user.email }),
});
```

### Full example

```javascript
import { Card, ListView, Text } from "flet-box";

const products = [{ name: "Keyboard" }, { name: "Mouse" }, { name: "Monitor" }];

const list = ListView({
  data: products,
  height: 400,
  itemSize: 80,
  gap: 8,
  bufferSize: 8,
  renderItem: (item, index) =>
    Card({ child: Text({ text: `${index + 1}. ${item.name}` }) }),
  ListHeaderComponent: () => Text({ text: "Products", type: "h2" }),
  ListEmptyComponent: () => Text({ text: "No products" }),
  onEndReached: () => console.log("load more"),
  onEndReachedThreshold: 0.3,
});

list.scrollToEnd();
```

## Notes

- Virtualized: only rows near the viewport (plus `bufferSize`) are in the DOM at once. Each row is absolutely positioned inside a spacer sized to the full list height.
- `renderItem` is required — without it nothing renders. Rows are built on mount (inside a `requestAnimationFrame`), not synchronously at construction time.
- `expand` defaults to `true` and sets `flex: 1` on the outer element, but it does **not** change `height`; the viewport height is always the `height` prop (default `400`). The source computes a `finalHeight` of `100%` for `expand` but never applies it.
- `itemSize` should match your real row height (including `gap`), or the scroll math and absolute positioning will drift.
- `onRefresh` enables touch pull-to-refresh and injects a spinner plus a global `@keyframes spin` style. It is touch-only (`touchstart`/`touchmove`/`touchend`).
- `showsScrollIndicator: false` hides the scrollbar via `scrollbar-width: none`.
- `wrapItems: true` switches to grid mode using `crossAxisCount` columns — this is exactly what `GridView` does.
- Row elements are cached (up to about 200) and reused; `updateData` clears the cache.
- Known bug: `updateData()` and the `data` setter recurse infinitely — `updateData` finishes by assigning `element.data`, whose setter calls `updateData` again — so calling either throws a stack-overflow `RangeError`. The `data` getter, the `refreshing` property, and the scroll methods are all safe. To change the dataset today, recreate the `ListView` with a new `data` array.

## Related widgets
- [GridView](GridView.md)
- [ListTile](ListTile.md)
- [Card](Card.md)
- [Column](Column.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [ListTile](ListTile.md)
- **Next:** [GridView](GridView.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (4 of 8).
