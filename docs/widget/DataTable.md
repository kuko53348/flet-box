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
