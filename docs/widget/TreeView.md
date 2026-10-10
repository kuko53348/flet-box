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
| `nodes` | `Array<{` | Tree nodes, each with `id`, `label`, and optional `children`. |
| `id` | `string` | DOM `id` for the rendered element. |
| `label` | `string` | Label or caption shown near the control. |
| `icon` | `string` | Name of the icon to render. |
| `iconColor` | `Color` | Color of the field icons. |
| `children` | `any[]` | An array of child widgets. Alias: `child` for a single child. |
| `badge` | `string \| number` | The `badge` value for the widget. |
| `onSelect` | `(node: any) => void` | Fired when the widget or an option is selected. |
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
