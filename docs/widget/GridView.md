# GridView

Grid layout built on ListView's virtualization. It lays items out in a fixed number of columns and gives every cell the same height.

## When to use it

Use GridView for image galleries, product catalogs, and dashboards of equal-sized tiles.

## Quick start

```javascript
import { GridView, Text, grid } from "flet-box";

const grid = GridView({
  data: ["A", "B", "C", "D"],
  renderItem: (item) => Text({ text: item }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `expand` | `boolean` | Lets a flex child grow to fill available space. |
| `bufferSize` | `number` | How many extra items to render beyond the viewport. |
| `showsScrollIndicator` | `boolean` | Shows the native scrollbar. |
| `ListEmptyComponent` | `(() => Widget) \| Widget` | Widget or builder shown when there is no data. |
| `ListFooterComponent` | `(() => Widget) \| Widget` | Widget or builder rendered below the list content. |
| `ListHeaderComponent` | `(() => Widget) \| Widget` | Widget or builder rendered above the list content. |
| `onRefresh` | `(done: () => void) => void` | Pull-to-refresh handler; call the provided `done()` when finished. |
| `onEndReachedThreshold` | `number` | How close to the end (in items or px) triggers `onEndReached`. |
| `onEndReached` | `() => void` | Fired when the list scrolls near its end, for infinite loading. |
| `crossAxisCount` | `number` | Number of items per row when wrapping. |
| `wrapItems` | `boolean` | Enables grid wrapping of list items. |
| `gap` | `number` | Space between children along the layout axis. |
| `itemSize` | `number` | Height of each list item. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `number \| string` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `renderItem` | `(item: any, index: number) => Widget` | Builds one child from an item: `(item, index) => Widget`. |
| `data` | `any[]` | Array of values or `{ label, value }` slices. |
| `columns` | `number` | Number of grid columns. |
| `spacing` | `number` | Space between grid items. |
| `itemHeight` | `number` | Height of each grid cell. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `id` | `string` | DOM `id` for the rendered element. |
| `className` | `string` | CSS class names applied to the rendered element. |
| `ref` | `(widget: Widget) => void` | Callback that receives the underlying DOM node. |
| `disableTransform` | `boolean` | Disables the default press/scale transform animation. |

## Examples

### Everyday

```javascript
import { Card, GridView, Text, grid } from "flet-box";

const grid = GridView({
  data: products,
  columns: 3,
  spacing: 12,
  itemHeight: 160,
  renderItem: (item) => Card({ child: Text({ text: item.name }) }),
});
```

### Full

```javascript
import { Container, GridView, Text, grid } from "flet-box";

const grid = GridView({
  data: products,
  columns: 2,
  spacing: 16,
  itemHeight: 180,
  gap: 16,
  height: 480,
  showsScrollIndicator: true,
  onEndReached: () => loadMore(),
  ListEmptyComponent: () => Text({ text: "No products" }),
  renderItem: (item) => Container({
    bgColor: "#ffffff",
    borderRadius: 12,
    child: Text({ text: item.name }),
  }),
});
```

## Tips

- `columns` sets the number of columns and `spacing` sets the gap between cells.
- `itemHeight` fixes each cell's height, which is what makes virtualization possible.
- It accepts the same `data` and `renderItem` contract as ListView.

## Accessibility

- Announce the grid's purpose with a heading and keep each tile's tap target large enough to hit.

## Behavior

- GridView is implemented as ListView with grid wrapping enabled, so it shares the same scrolling and update APIs.
- Rows outside the viewport are removed, so keep per-tile state out of the DOM and in widget state when needed.

## Related widgets

- [ListView](ListView.md)
- [Container](Container.md)
- [Card](Card.md)
- [Image](Image.md)

---

## Continue reading

- **Previous:** [ListView](ListView.md)
- **Next:** [Avatar](Avatar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (5 of 8).
