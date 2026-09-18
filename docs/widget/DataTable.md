# DataTable

## Overview
`DataTable` renders a real HTML `<table>` — `<thead>` with one `<th>` per column and `<tbody>` with one `<tr>` per row — wrapped in a `<div>` that scrolls horizontally (`width: 100%; overflow-x: auto`). Columns come from `columns` and data from `rows`: each cell is read as `row[key]`, so rows are **objects keyed by the column key**, not arrays. Cell text is written with `textContent`, striping, hover, borders, per-column alignment, and per-column formatters are all built in.

## When to use
- Show a list of records (users, invoices, logs) with labelled, aligned columns.
- Format values per column with `format(value, row)` — currency, dates, uppercasing.
- React to a row being clicked with `onRowClick(row, index)`.

## Import

```javascript
import { DataTable } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { DataTable } from "flet-box";

DataTable({
  columns: ["name", "age"],
  rows: [{ name: "Ada", age: 36 }],
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | array of `string` or `{ key, label, align?, format? }` | — (required) | Column definitions. A plain string is used as both the header label and the row key. An object uses `label` for the header and `key` to read the cell; `align` sets `text-align`, `format(value, row)` returns the cell text. |
| `rows` | array of objects | — (required) | Row records. Cells are read as `row[key]`; a missing key renders an empty cell. Values are stringified with `String(value)`. |
| `striped` | boolean | `true` | Paints odd rows (index 1, 3, …) with `stripedRowBgColor`. |
| `hoverable` | boolean | `true` | Adds a `background-color 0.2s` transition and swaps the row to `hoverRowBgColor` on `mouseenter`. |
| `bordered` | boolean | `true` | Draws a `borderWidth` solid `borderColor` outline around the `<table>`. Header and cell bottom borders are always drawn. |
| `onRowClick` | `(row, index) => void` | — | Click handler per row; also sets `cursor: pointer` on every `<tr>`. |
| `headerBgColor` | Color | `colors.gray100` | `<th>` background. |
| `headerTextColor` | Color | `colors.text` | `<th>` color. |
| `headerFontWeight` | string | `'bold'` | `<th>` font weight. |
| `headerFontSize` | number or string | `14` | `<th>` font size; a number becomes px. |
| `rowBgColor` | Color | `'transparent'` | Background of even rows. |
| `rowTextColor` | Color | `colors.text` | `<td>` color. |
| `rowFontSize` | number or string | `13` | `<td>` font size; a number becomes px. |
| `stripedRowBgColor` | Color | `colors.gray50` | Background of odd rows when `striped`. |
| `hoverRowBgColor` | Color | `` `${colors.primary}10` `` | Row background while hovered (8-digit hex: primary at ~6% alpha). |
| `borderColor` | Color | `colors.border` | Table outline, header underline (2px), and cell bottom borders. |
| `borderWidth` | number | `1` | Outline and cell border thickness in pixels. |
| `cellPadding` | string | `'10px 12px'` | CSS padding shorthand applied to every `<td>`. |
| `headerCellPadding` | string | `'12px'` | CSS padding applied to every `<th>`. |

These are the props specific to `DataTable`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`. Common props land on the scroll wrapper, not on the `<table>`.

## Instance methods

The returned wrapper element exposes:

- `updateData(newRows)` — replaces the rows and rebuilds `<tbody>` in place (header untouched).
- `updateColumns(newColumns)` — replaces the columns, rebuilds `<thead>`, then re-renders the body with the current rows.

## Examples

### Everyday example

```javascript
import { DataTable, colors } from "flet-box";

DataTable({
  columns: [
    { key: "id", label: "#", align: "center" },
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
  ],
  rows: [
    { id: 1, name: "Ada Lovelace", role: "Engineer" },
    { id: 2, name: "Alan Turing", role: "Researcher" },
  ],
  onRowClick: (row, index) => console.log("clicked", index, row.name),
  headerBgColor: colors.gray100,
  rowFontSize: 14,
});
```

### Full example

```javascript
import { Column, DataTable, Text, colors } from "flet-box";

const users = [
  { id: 1, name: "ada", amount: 1200, active: true },
  { id: 2, name: "alan", amount: 850.5, active: false },
  { id: 3, name: "grace", amount: 2400, active: true },
];

const table = DataTable({
  columns: [
    { key: "id", label: "#", align: "center" },
    { key: "name", label: "Name", format: (value) => value.toUpperCase() },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      format: (value) => `$${value.toFixed(2)}`,
    },
    { key: "active", label: "Active", align: "center", format: (v) => (v ? "yes" : "no") },
  ],
  rows: users,
  striped: true,
  hoverable: true,
  bordered: true,
  onRowClick: (row) => console.log("selected", row.id),
  headerBgColor: colors.gray100,
  headerTextColor: colors.text,
  headerFontWeight: "bold",
  headerFontSize: 14,
  rowTextColor: colors.text,
  rowFontSize: 13,
  stripedRowBgColor: colors.gray50,
  borderColor: colors.border,
  borderWidth: 1,
  cellPadding: "8px 12px",
  headerCellPadding: "12px",
});

// Later, swap in fresh data without recreating the widget:
// table.updateData([...users, { id: 4, name: "edsger", amount: 10, active: true }]);

Column({
  gap: 8,
  children: [Text({ text: "Users", type: "h2", size: 20 }), table],
});
```

## Notes

- `columns` and `rows` have **no defaults**: omitting either throws, because the source iterates them directly.
- Rows are keyed objects. `rows: [["Ada", 36]]` renders empty cells unless your columns use numeric keys (`{ key: 0, label: "Name" }`).
- Cells are text-only. Both the raw value and whatever `format` returns go through `textContent`, so HTML in your data is escaped and you cannot put widgets in a cell.
- `updateData`/`updateColumns` mutate the arrays you passed in (`rows.length = 0; rows.push(...)`), so keep your own copy if you need the original.
- The header underline is always `2px solid borderColor`; `bordered` only controls the outer table outline.
- The wrapper is `overflow-x: auto`, so a table wider than its parent scrolls instead of breaking the layout.

## Related widgets
- [Chart](Chart.md)
- [CircularChart](CircularChart.md)
- [ListView](ListView.md)
- [ListTile](ListTile.md)
- [TreeView](TreeView.md)
- [CodeViewer](CodeViewer.md)

---

## Continue reading

- **Previous:** [InstallButton](InstallButton.md)
- **Next:** [Chart](Chart.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data and rich content** (1 of 7).
