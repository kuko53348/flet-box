# DroppBox

A drop target for DraggBox items. It validates incoming payloads against acceptGroups and reports successful drops through onDrop.

## When to use it

Use it as a container that receives dragged items, such as a column on a kanban board.

## Quick start

```javascript
import { DroppBox, Text } from "flet-box";

const zone = DroppBox({
  child: Text({ text: "Drop here" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `onDrop` | `(data: any, group: string, event: DragEvent) => void` | Fired when an item is dropped on the target. |
| `onDragEnter` | `(event: DragEvent) => void` | Fired when a dragged item enters the target. |
| `onDragLeave` | `(event: DragEvent) => void` | Fired when a dragged item leaves the target. |
| `onDragOver` | `(event: DragEvent) => void` | Fired continuously while an item is dragged over the target. |
| `acceptGroups` | `string[]` | Drag groups this target accepts. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `borderWidth` | `number` | Width of the border. |
| `borderStyle` | `string` | The `borderStyle` value for the widget. |
| `borderColor` | `Color` | Color used for the border. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `activeBgColor` | `Color` | Background color for the active. |
| `activeBorderColor` | `Color` | Border color for the active. |
| `activeBorderWidth` | `number` | Border width for the active. |
| `activeBorderStyle` | `string` | Border style for the active. |
| `activeShadow` | `string` | The `activeShadow` value for the widget. |
| `validBgColor` | `Color` | Background color for the valid. |
| `validBorderColor` | `Color` | Border color for the valid. |
| `invalidBgColor` | `Color` | Background color for the invalid. |
| `invalidBorderColor` | `Color` | Border color for the invalid. |
| `transitionDuration` | `string` | Duration for the transition, in milliseconds. |
| `transitionTiming` | `string` | The `transitionTiming` value for the widget. |
| `showFeedback` | `boolean` | Shows valid/invalid feedback during a drag. |

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
import { DroppBox, Text } from "flet-box";

const zone = DroppBox({
  child: Text({ text: "Drop a task here" }),
  acceptGroups: ["tasks"],
  onDrop: (data, group) => console.log(data, group),
});
```

### Full

```javascript
import { Container, DroppBox, Text } from "flet-box";

const zone = DroppBox({
  child: Container({
    padding: 24,
    child: Text({ text: "Drop tasks here" }),
  }),
  acceptGroups: ["kanban"],
  showFeedback: true,
  bgColor: "#f8fafc",
  borderWidth: 2,
  borderStyle: "dashed",
  borderColor: "#cbd5e1",
  borderRadius: 12,
  padding: 16,
  activeBgColor: "#eff6ff",
  activeBorderColor: "#2563eb",
  validBgColor: "#f0fdf4",
  validBorderColor: "#16a34a",
  invalidBgColor: "#fef2f2",
  invalidBorderColor: "#dc2626",
  transitionDuration: "150ms",
  onDrop: (data, group, event) => console.log(data, group),
  onDragEnter: () => console.log("enter"),
});
```

## Tips

- List the drag group values you allow in acceptGroups; unlisted groups are rejected.
- Style activeBgColor and activeBorderColor so users see the target highlight during a drag.
- Use validBgColor and invalidBgColor with showFeedback to signal whether a drop is allowed.

## Accessibility

- Pair drop zones with an alternative control, such as a move menu, for keyboard and touch users.
- Make the target's purpose clear with visible text, not just a highlighted border.

## Behavior

- onDrop fires with the data, group and event when an accepted item is released.
- onDragEnter, onDragOver and onDragLeave fire as the pointer passes over the target.

## Related widgets

- [DraggBox](DraggBox.md)
- [Container](Container.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [DraggBox](DraggBox.md)
- **Next:** [Scaffold](Scaffold.md) — Chapter 8 · App navigation
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (4 of 4).
