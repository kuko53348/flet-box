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

You are reading **Chapter 7 · Media and drag & drop** (5 of 5).
