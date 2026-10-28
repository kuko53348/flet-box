# TreeView

TreeView renders a collapsible hierarchy from nodes, each with an id, label, optional icon, badge and children. It supports expand/collapse, selection and nested navigation.

## When to use it

Use it for file explorers, category menus or any nested set of items the user drills into.

## Quick start

```javascript
import { TreeView } from "flet-box";

const tree = TreeView({
  nodes: [
    { id: "src", label: "src" },
  ],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `nodes` | `TreeViewNode[]` | Tree nodes, each with `id`, `label`, and optional `children`. |
| `onSelect` | `(node: TreeViewNode) => void` | Fired when the widget or an option is selected. |
| `onPress` | `(node: TreeViewNode) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onToggle` | `(nodeId: string, expanded: boolean) => void` | Fired with the new toggled state. |
| `expandedNodes` | `string[]` | Ids of nodes that start expanded. |
| `indent` | `number` | Indentation depth used when printing nested structures. |
| `showIcons` | `boolean` | Controls whether the icons is shown. |
| `folderIcon` | `string` | Icon for the folder. |
| `folderOpenIcon` | `string` | Icon for the folder open. |
| `fileIcon` | `string` | Icon for the file. |
| `expandIcon` | `string` | Icon for the expand. |
| `collapseIcon` | `string` | Icon for the collapse. |
| `defaultExpanded` | `boolean` | Expands top-level nodes by default. |
| `selectable` | `boolean` | Lets the user select a tree node. |
| `selectedNodeId` | `string \| null` | Id of the currently selected node. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `hoverBgColor` | `Color` | Background color for the hover. |
| `selectedBgColor` | `Color` | Background color for the selected. |
| `textColor` | `Color` | Color of the button label. |
| `selectedTextColor` | `Color` | Color used for the selected text. |
| `iconColor` | `Color` | Color of the field icons. |
| `folderIconColor` | `Color` | Color used for the folder icon. |
| `borderColor` | `Color` | Color used for the border. |
| `nodePadding` | `Padding` | Padding for the node. |
| `nodeGap` | `number` | Space for the node. |
| `childrenGap` | `number` | Space for the children. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `fontSize` | `number` | Size of the font. |
| `iconSize` | `number` | Size of the field icons. |
| `transitionDuration` | `string` | Duration for the transition, in milliseconds. |

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
import { TreeView } from "flet-box";

const tree = TreeView({
  nodes: [
    {
      id: "src",
      label: "src",
      children: [
        { id: "app", label: "app.js" },
        { id: "router", label: "Router.js" },
      ],
    },
  ],
  showIcons: true,
  onSelect: (node) => console.log(node.id),
});
```

### Full

```javascript
import { TreeView } from "flet-box";

const tree = TreeView({
  nodes: [
    {
      id: "src",
      label: "src",
      icon: "folder",
      children: [
        { id: "app", label: "app.js", icon: "description" },
        { id: "router", label: "Router.js", badge: 2 },
      ],
    },
  ],
  expandedNodes: ["src"],
  defaultExpanded: true,
  selectable: true,
  showIcons: true,
  selectedNodeId: "app",
  indent: 20,
  nodeGap: 4,
  childrenGap: 4,
  fontSize: 14,
  transitionDuration: "200ms",
  hoverBgColor: "#f1f5f9",
  selectedBgColor: "#dbeafe",
  onToggle: (nodeId, expanded) => console.log(nodeId, expanded),
  onSelect: (node) => console.log(node.id),
});
```

## Tips

- Give every node a stable unique id; expandedNodes and selectedNodeId reference those ids.
- Set selectable to false for navigation trees where tapping should only toggle groups.
- Use defaultExpanded to open first-level groups on first render.

## Accessibility

- Expose meaningful label text and do not rely only on icons to describe a node.
- Keep onSelect behavior predictable so keyboard users understand what activation does.

## Behavior

- Nodes toggle locally and report expansion through onToggle with the nodeId and expanded flag.
- Selection is reported through onSelect as the node object and can be controlled with selectedNodeId.

## Related widgets

- [ListView](ListView.md)
- [ListTile](ListTile.md)
- [Accordion](Accordion.md)

---

## Continue reading

- **Previous:** [Accordion](Accordion.md)
- **Next:** [Carousel](Carousel.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (3 of 5).
