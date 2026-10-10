# ListView

Virtualized scrollable list that keeps only the visible rows plus a buffer in the DOM, so large datasets stay responsive.

## When to use it

Use ListView for long or infinite feeds, search results, and chat logs where rendering every row would be wasteful.

## Quick start

```javascript
import { ListView, Text } from "flet-box";

const list = ListView({
  data: ["One", "Two", "Three"],
  renderItem: (item, index) => Text({ text: `${index + 1}. ${item}` }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `any[]` | Array of values or `{ label, value }` slices. |
| `renderItem` | `(item: any, index: number) => Widget` | Builds one child from an item: `(item, index) => Widget`. |
| `height` | `number \| string` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `itemSize` | `number` | Height of each list item. |
| `gap` | `number` | Space between children along the layout axis. |
| `wrapItems` | `boolean` | Enables grid wrapping of list items. |
| `crossAxisCount` | `number` | Number of items per row when wrapping. |
| `onEndReached` | `() => void` | Fired when the list scrolls near its end, for infinite loading. |
| `onEndReachedThreshold` | `number` | How close to the end (in items or px) triggers `onEndReached`. |
| `onRefresh` | `(done: () => void) => void` | Pull-to-refresh handler; call the provided `done()` when finished. |
| `ListHeaderComponent` | `(() => Widget) \| Widget` | Widget or builder rendered above the list content. |
| `ListFooterComponent` | `(() => Widget) \| Widget` | Widget or builder rendered below the list content. |
| `ListEmptyComponent` | `(() => Widget) \| Widget` | Widget or builder shown when there is no data. |
| `showsScrollIndicator` | `boolean` | Shows the native scrollbar. |
| `bufferSize` | `number` | How many extra items to render beyond the viewport. |
| `expand` | `boolean` | Lets a flex child grow to fill available space. |

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
import { ListView, Text } from "flet-box";

const list = ListView({
  data: ["One", "Two", "Three"],
  itemSize: 56,
  gap: 8,
  height: 320,
  showsScrollIndicator: true,
  renderItem: (item) => Text({ text: item }),
});
```

### Full

```javascript
import { ListTile, ListView, Text } from "flet-box";

const list = ListView({
  data: items,
  itemSize: 64,
  gap: 8,
  expand: true,
  bufferSize: 8,
  onEndReached: () => loadMore(),
  onEndReachedThreshold: 0.4,
  onRefresh: (done) => refreshData(done),
  ListHeaderComponent: () => Text({ text: "Inbox", type: "h3" }),
  ListEmptyComponent: () => Text({ text: "Nothing here yet" }),
  ListFooterComponent: () => Text({ text: "End of list" }),
  renderItem: (item) => ListTile({ title: item.title, subtitle: item.subtitle }),
});
```

## Tips

- `renderItem` must return a widget and is called with `(item, index)`.
- Set `itemSize` to the real row height so the virtual scroll math stays accurate.
- Provide `onEndReached` to load more data and `onRefresh` to enable pull-to-refresh.

## Accessibility

- Give the list an accessible heading, since offscreen rows are intentionally absent from the DOM.

## Behavior

- The element exposes `updateData()`, `scrollToIndex()`, `scrollToStart()`, `scrollToEnd()`, and reactive `data` and `refreshing` properties.
- Rendered rows are cached by index (capped) and offscreen ones are removed; unmount clears listeners and the cache.

## Related widgets

- [GridView](GridView.md)
- [Column](Column.md)
- [Container](Container.md)
- [ListTile](ListTile.md)

---

## Continue reading

- **Previous:** [ListTile](ListTile.md)
- **Next:** [GridView](GridView.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (4 of 8).
