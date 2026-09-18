# GridView

## Overview
`GridView` renders a virtualized, multi-column grid. It is a thin wrapper around `ListView` with `wrapItems: true`: it maps `columns` → `crossAxisCount`, `itemHeight` → `itemSize`, and `spacing` → `gap`, then forwards everything else. That means it shares `ListView`'s virtualization, header/footer/empty slots, infinite scroll, pull-to-refresh, and instance methods.

## When to use
- Show items in a multi-column grid (a gallery or product grid) while keeping virtualization.
- You want `ListView`'s infinite scroll or pull-to-refresh in a grid layout.

## Import

```javascript
import { GridView } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { GridView, Text } from "flet-box";

GridView({
  data: ["A", "B", "C", "D"],
  columns: 2,
  renderItem: (item) => Text({ text: item }),
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | number | `2` | Number of grid columns (maps to `ListView`'s `crossAxisCount`). |
| `itemHeight` | number | `150` | Cell height in pixels (maps to `itemSize`). |
| `spacing` | number | `8` | Space between cells in pixels (maps to `gap`). |

Every other prop is forwarded to `ListView` — `data`, `renderItem`, `height`, `bufferSize`, `onEndReached`, `onEndReachedThreshold`, `onRefresh`, `ListHeaderComponent`/`ListFooterComponent`/`ListEmptyComponent`, and the rest. See [ListView](ListView.md). It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

Because `GridView` returns a `ListView` element, it exposes the same members:

- `updateData(newData)` — intended to replace the dataset and re-render. Currently broken (see the `ListView` Notes).
- `scrollToIndex(index, animated = true)` — scrolls to a given cell index.
- `scrollToStart(animated = true)` / `scrollToEnd(animated = true)` — scroll to the top/bottom.
- `data` (getter is safe) and `refreshing` — reactive properties. The `data` setter shares the `ListView` recursion bug. See [ListView](ListView.md).

## Examples

### Everyday example

```javascript
import { Card, GridView, Text } from "flet-box";

const items = ["One", "Two", "Three", "Four"];

GridView({
  data: items,
  columns: 2,
  itemHeight: 80,
  spacing: 12,
  renderItem: (item) => Card({ child: Text({ text: item }) }),
});
```

### Full example

```javascript
import { Card, Column, GridView, Image, Text } from "flet-box";

const gallery = [
  { url: "/1.jpg", title: "One" },
  { url: "/2.jpg", title: "Two" },
];

const grid = GridView({
  data: gallery,
  columns: 4,
  itemHeight: 180,
  spacing: 12,
  height: 600,
  renderItem: (item) =>
    Card({
      padding: 0,
      child: Column({
        children: [
          Image({ src: item.url, height: 140, fit: "cover" }),
          Text({ text: item.title, padding: 8 }),
        ],
      }),
    }),
  ListHeaderComponent: () => Text({ text: "Gallery", type: "h2" }),
  onEndReached: () => console.log("load more"),
});

grid.scrollToIndex(8);
```

## Notes

- `GridView` is a wrapper: it calls `ListView` with `wrapItems: true` and translates `columns`/`itemHeight`/`spacing` into `crossAxisCount`/`itemSize`/`gap`. All other props pass straight through.
- It is virtualized exactly like `ListView` — only visible cells (plus `bufferSize`) are in the DOM, and cells render on mount, not synchronously at construction.
- `itemHeight` is the full cell height used for the scroll math; make sure it matches what your `renderItem` actually produces.
- All `ListView` behaviors and caveats apply (`renderItem` is required, `expand` does not change `height`, and so on). See [ListView](ListView.md).
- It inherits the `ListView` `updateData()`/`data`-setter recursion bug: read `data`, but do not assign it or call `updateData()` — recreate the grid to change the dataset. See [ListView](ListView.md).

## Related widgets
- [ListView](ListView.md)
- [Card](Card.md)
- [Image](Image.md)
- [ListTile](ListTile.md)
- [Column](Column.md)

---

## Continue reading

- **Previous:** [ListView](ListView.md)
- **Next:** [Avatar](Avatar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (5 of 8).
