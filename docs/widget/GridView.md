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
| `expand` | `boolean \| number` | Lets a flex child grow to fill available space. |
| `bufferSize` | `number` | How many extra items to render beyond the viewport. |
| `showsScrollIndicator` | `boolean` | Shows the native scrollbar. |
| `ListEmptyComponent` | `(() => Widget) \| Widget` | Widget or builder shown when there is no data. |
| `ListFooterComponent` | `(() => Widget) \| Widget` | Widget or builder rendered below the list content. |
| `ListHeaderComponent` | `(() => Widget) \| Widget` | Widget or builder rendered above the list content. |
| `onRefresh` | `(done: () => void) => void` | Pull-to-refresh handler; call the provided `done()` when finished. |
| `onEndReachedThreshold` | `number` | How close to the end (in items or px) triggers `onEndReached`. |
| `onEndReached` | `() => void` | Fired when the list scrolls near its end, for infinite loading. |
| `gap` | `number` | Space between children along the layout axis. |
| `itemSize` | `number` | Height of each list item. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `number \| string` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `renderItem` | `(item: any, index: number) => Widget` | Builds one child from an item: `(item, index) => Widget`. |
| `data` | `any[]` | Array of values or `{ label, value }` slices. |
| `columns` | `number` | Number of grid columns. |
| `spacing` | `number` | Space between grid items. |
| `itemHeight` | `number` | Height of each grid cell. |
| `children` | `Widget[] \| Widget` | The cells themselves, laid out `columns` per row. The same contract as `data` + `renderItem` read the other way round: pass built widgets here, or the items plus a builder. `data` wins when both are given. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `full` | `boolean` | Stretches the widget to fill its parent on both axes in stack mode. |
| `fullHeight` | `boolean` | Stretches the widget to the full height of its parent in stack mode. |
| `fullWidth` | `boolean` | Stretches the widget to the full width of its parent. |
| `center` | `boolean` | Centres the widget on both axes in stack mode. |
| `centerY` | `boolean` | Centres the widget vertically in stack mode. |
| `centerX` | `boolean` | Centres the widget horizontally in stack mode. |
| `zIndex` | `number` | Stacking order: a widget with a higher value paints above lower ones. |
| `z` | `number` | Alias of `zIndex`. |
| `end` | `Size` | Logical alias of `right`, used by the stack placement shorthands. |
| `start` | `Size` | Logical alias of `left`, used by the stack placement shorthands. |
| `inset` | `Size` | Shorthand for the four edge offsets (`top`/`right`/`bottom`/`left`). |
| `left` | `Size` | Offset from the left edge. A number is pixels; a string uses any CSS unit. |
| `bottom` | `Size` | Offset from the bottom edge. A number is pixels; a string uses any CSS unit. |
| `right` | `Size` | Offset from the right edge. A number is pixels; a string uses any CSS unit. |
| `top` | `Size` | Offset from the top edge. A number is pixels; a string uses any CSS unit. |
| `pos` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | Alias of `position`. |
| `position` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | CSS `position` value, or `stack` for centered stacking. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `flex` | `number` | Flex grow/shrink/basis shorthand for a flex child. |
| `minWidth` | `Size` | Minimum width the widget may shrink to. |
| `maxWidth` | `Size` | Maximum width the widget may grow to. |
| `minHeight` | `Size` | Minimum height the widget may shrink to. |
| `maxHeight` | `Size` | Maximum height the widget may grow to. |
| `border` | `string` | CSS `border` shorthand for all four edges: width, style and color in one string. |
| `borderTop` | `string` | The top edge of the border alone, for a widget whose rim differs per side. |
| `borderBottom` | `string` | The bottom edge of the border alone, for a widget whose rim differs per side. |
| `borderLeft` | `string` | The left edge of the border alone, for a widget whose rim differs per side. |
| `borderRight` | `string` | The right edge of the border alone, for a widget whose rim differs per side. |
| `cursor` | `string` | CSS `cursor` value: what the pointer becomes over the widget (`pointer`, `grab`, `not-allowed`). |
| `display` | `string` | CSS `display` value for the container. |
| `boxSizing` | `'border-box' \| 'content-box'` | Which box `width` and `height` measure: `border-box` keeps the size you asked for and pushes padding inward. |
| `flexDirection` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | Main axis of a flex container: `row` places children side by side, `column` stacks them. |
| `flexGrow` | `number` | Share of the leftover space this child takes, relative to its siblings. |
| `flexShrink` | `number` | How readily the child gives space back when the row overflows; `0` keeps its size. |
| `gap` | `number \| string` | Space between children along the layout axis. |
| `fontSize` | `number` | Size of the font. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `paddingTop` | `Size` | Space inside the widget, on the top edge only. |
| `paddingRight` | `Size` | Space inside the widget, on the right edge only. |
| `paddingBottom` | `Size` | Space inside the widget, on the bottom edge only. |
| `paddingLeft` | `Size` | Space inside the widget, on the left edge only. |
| `pt` | `Size` | Alias of `paddingTop`. |
| `pr` | `Size` | Alias of `paddingRight`. |
| `pb` | `Size` | Alias of `paddingBottom`. |
| `pl` | `Size` | Alias of `paddingLeft`. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | Space outside the widget, on the top edge only. |
| `marginRight` | `Size` | Space outside the widget, on the right edge only. |
| `marginBottom` | `Size` | Space outside the widget, on the bottom edge only. |
| `marginLeft` | `Size` | Space outside the widget, on the left edge only. |
| `mt` | `Size` | Alias of `marginTop`. |
| `mr` | `Size` | Alias of `marginRight`. |
| `mb` | `Size` | Alias of `marginBottom`. |
| `ml` | `Size` | Alias of `marginLeft`. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `bgImage` | `string` | Image painted behind the widget's content (CSS `background-image`), placed with `bgSize` and `bgPosition`. |
| `bgSize` | `string` | How the background image fills its box (`cover`, `contain`, or a length). |
| `bgPosition` | `string` | Where the background image is anchored (`center`, `top`, `50% 20%`). |
| `bgRepeat` | `string` | Whether the background image tiles; `no-repeat` for a single cover. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(event?: Event) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(event?: Event) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(event?: Event) => void` | Lowercase alias of `onClick`, kept because the shipped templates and the HTML habit write it. |
| `alignSelf` | `AlignSelf` | Overrides the parent's `alignItems` for this child alone (CSS `align-self`). Alias: `selfAlign`. |
| `selfAlign` | `AlignSelf` | Alias of `alignSelf`. |
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
- Give it `data` + `renderItem` when the cells are built from values, and `children` when you already have the widgets: the two are the same contract read from either end.

## Accessibility

- Announce the grid's purpose with a heading and keep each tile's tap target large enough to hit.

## Behavior

- GridView is implemented as ListView with grid wrapping enabled, so it shares the same scrolling and update APIs.
- Each cell is stretched to fill its slot: `itemHeight` tall, with half of `spacing` on every side so two neighbours meet at exactly one gutter. A cell that asks for its own height keeps it.
- The number of columns is fixed, not a breakpoint: cells are percentages of the container, so the grid adapts to the width it is given.
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
