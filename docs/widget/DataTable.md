# DataTable

DataTable renders tabular rows using a columns definition, with optional striping, hover and borders. Column entries can be plain strings or DataTableColumn objects.

## When to use it

Use it to present structured, comparable data such as reports, lists or admin grids.

## Quick start

```javascript
import { DataTable } from "flet-box";

const table = DataTable({
  columns: ["Name", "Role"],
  rows: [{ Name: "Ada", Role: "Engineer" }],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `columns` | `(string \| DataTableColumn)[]` | Number of grid columns. |
| `rows` | `Record<string, any>[]` | Data rows rendered by the table. |
| `striped` | `boolean` | Draws diagonal stripes across the bar. |
| `hoverable` | `boolean` | Highlights rows on hover. |
| `bordered` | `boolean` | Draws borders around cells. |
| `onRowClick` | `(row: any, index: number) => void` | Fired with the clicked row. |
| `headerBgColor` | `Color` | Background color of the header row. |
| `headerTextColor` | `Color` | Text color of the header row. |
| `headerFontWeight` | `string` | The `headerFontWeight` value for the widget. |
| `headerFontSize` | `number` | Size of the header font. |
| `rowBgColor` | `Color` | Background color for the row. |
| `rowTextColor` | `Color` | Color used for the row text. |
| `rowFontSize` | `number` | Size of the row font. |
| `stripedRowBgColor` | `Color` | Background color for alternating rows. |
| `hoverRowBgColor` | `Color` | Background color for the hover row. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `cellPadding` | `Padding` | Padding inside each cell. |
| `headerCellPadding` | `Padding` | Padding for the header cell. |

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
import { DataTable } from "flet-box";

const table = DataTable({
  columns: ["Name", "Role", "Status"],
  rows: [
    { Name: "Ada", Role: "Engineer", Status: "Active" },
    { Name: "Linus", Role: "Maintainer", Status: "Away" },
  ],
  striped: true,
  hoverable: true,
  onRowClick: (row) => console.log(row),
});
```

### Full

```javascript
import { DataTable } from "flet-box";

const table = DataTable({
  columns: ["Name", "Role", "Status"],
  rows: [
    { Name: "Ada", Role: "Engineer", Status: "Active" },
    { Name: "Linus", Role: "Maintainer", Status: "Away" },
  ],
  striped: true,
  hoverable: true,
  bordered: true,
  headerBgColor: "#f1f5f9",
  headerTextColor: "#0f172a",
  headerFontWeight: "600",
  headerFontSize: 14,
  rowFontSize: 13,
  stripedRowBgColor: "#f8fafc",
  hoverRowBgColor: "#eff6ff",
  borderColor: "#e2e8f0",
  borderWidth: 1,
  cellPadding: 12,
  headerCellPadding: 14,
  onRowClick: (row, index) => console.log(row, index),
});
```

## Tips

- Use string column keys that match your row objects, or pass column objects for explicit headers.
- Turn on striped and hoverable on wide tables to keep rows readable.
- Attach onRowClick when rows should open details or a drill-down view.

## Accessibility

- Keep header text descriptive so the table has a clear structure for assistive technology.
- Do not encode meaning in color alone, such as striping, and keep text contrast sufficient.

## Behavior

- Rows render from rows in order and re-render when rows or columns change.
- onRowClick receives the row object and its index.

## Related widgets

- [ListView](ListView.md)
- [Card](Card.md)
- [Pagination](Pagination.md)

---

## Continue reading

- **Previous:** [InstallButton](InstallButton.md)
- **Next:** [Chart](Chart.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (1 of 13).
