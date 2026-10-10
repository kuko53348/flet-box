# DraggBox

DraggBox wraps a child so it can be dragged with the native drag-and-drop API. It tags the payload with data and an optional group so matching DroppBox targets can accept it.

## When to use it

Use it to build kanban boards, sortable lists or any drag-to-rearrange interface.

## Quick start

```javascript
import { DraggBox, Text } from "flet-box";

const item = DraggBox({
  child: Text({ text: "Drag me" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `data` | `any` | Array of values or `{ label, value }` slices. |
| `group` | `string` | Drag group name; only matching targets accept the item. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onDragStart` | `(event: DragEvent, data: any) => void` | Fired when dragging starts. |
| `onDragEnd` | `(event: DragEvent, data: any) => void` | Fired when dragging ends. |
| `dragImage` | `HTMLElement` | Custom image shown while dragging. |
| `cloneOnDrag` | `boolean` | Keeps the original element while dragging a clone. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `dragOverlayColor` | `Color` | Color used for the drag overlay. |
| `dragBorderColor` | `Color` | Border color for the drag. |

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
import { Card, DraggBox, Text } from "flet-box";

const task = DraggBox({
  child: Card({ padding: 12, child: Text({ text: "Write docs" }) }),
  group: "tasks",
  data: { id: 1 },
  onDragEnd: (event, data) => console.log(data),
});
```

### Full

```javascript
import { Card, DraggBox, Text } from "flet-box";

const task = DraggBox({
  child: Card({
    padding: 16,
    child: Text({ text: "Ship the release" }),
  }),
  group: "kanban",
  data: { id: "task-42", title: "Ship the release" },
  cloneOnDrag: true,
  opacity: 0.6,
  dragOverlayColor: "#eff6ff",
  dragBorderColor: "#2563eb",
  onDragStart: (event, data) => console.log("start", data),
  onDragEnd: (event, data) => console.log("end", data),
});
```

## Tips

- Give draggable items a group and have targets list it in acceptGroups to control what can be dropped.
- Use cloneOnDrag when the original should remain in place while a copy is dragged.
- Set data to the payload the drop target needs, not just the visual content.

## Accessibility

- Provide a non-drag alternative such as buttons or a menu so keyboard users can move items.
- Ensure onDragStart and onDragEnd give feedback so changes are perceivable.

## Behavior

- Drag events surface the original payload via the data argument in onDragStart and onDragEnd.
- Setting disabled turns the child back into a non-draggable element.

## Related widgets

- [DroppBox](DroppBox.md)
- [Card](Card.md)
- [ListView](ListView.md)

---

## Continue reading

- **Previous:** [Video](Video.md)
- **Next:** [DroppBox](DroppBox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (3 of 4).
