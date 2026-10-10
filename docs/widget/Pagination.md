# Pagination

Pagination renders page controls derived from totalItems and pageSize, with optional first/last and prev/next buttons. It reports the chosen page through onPageChange.

## When to use it

Use it under long lists or tables so users can move through paged results.

## Quick start

```javascript
import { Pagination } from "flet-box";

const pages = Pagination({
  totalItems: 100,
  pageSize: 10,
  onPageChange: (page) => console.log(page),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `totalItems` | `number` | Total number of items to paginate. |
| `pageSize` | `number` | Number of items per page. |
| `currentPage` | `number` | Currently active page. |
| `onPageChange` | `(page: number) => void` | Fired with the new page number. |
| `showFirstLast` | `boolean` | Shows first and last page buttons. |
| `showPrevNext` | `boolean` | Shows previous and next page buttons. |
| `maxButtons` | `number` | Maximum number of page buttons before truncation. |
| `variant` | `'outlined' \| 'filled' \| 'text'` | Visual variation or style preset. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `size` | `'small' \| 'medium' \| 'large'` | Overall size preset or pixel value, depending on the widget. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `showTotal` | `boolean` | Controls whether the total is shown. |
| `label` | `string` | Label or caption shown near the control. |

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
import { Pagination } from "flet-box";

const pages = Pagination({
  totalItems: 248,
  pageSize: 20,
  currentPage: 1,
  showPrevNext: true,
  showFirstLast: true,
  onPageChange: (page) => loadPage(page),
});
```

### Full

```javascript
import { Pagination } from "flet-box";

const pages = Pagination({
  totalItems: 512,
  pageSize: 25,
  currentPage: 4,
  maxButtons: 7,
  variant: "filled",
  size: "medium",
  showFirstLast: true,
  showPrevNext: true,
  showTotal: true,
  label: "Rows",
  color: "#2563eb",
  onPageChange: (page) => loadPage(page),
});
```

## Tips

- Provide totalItems and pageSize; the number of pages is computed for you.
- Control the active page with currentPage and update it inside onPageChange.
- Use maxButtons to limit how many page buttons appear before they collapse.

## Accessibility

- Ensure the current page is distinguishable and that controls are reachable by keyboard.
- Pair pagination with a visible total by enabling showTotal so users know how much data exists.

## Behavior

- Pages are recalculated whenever totalItems, pageSize or currentPage change.
- onPageChange fires with the new page number when the user navigates.

## Related widgets

- [DataTable](DataTable.md)
- [ListView](ListView.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [FloatingActionButton](FloatingActionButton.md)
- **Next:** [Stepper](Stepper.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (10 of 10).
