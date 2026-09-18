# TreeView

## Overview
`TreeView` renders a hierarchical, expandable list from a `nodes` array. Each node becomes a row holding a toggle chevron (only when the node has `children`), a Material icon, a label, and an optional red `badge` pill; nested nodes are indented by `indent` pixels per level. Expansion and selection are tracked by node `id`, and the whole tree is rebuilt into the same container on every change. The returned element exposes `expandAll`, `collapseAll`, `expandTo`, `collapseTo`, `updateNodes`, `getExpanded`, `getSelected`, and `setSelected`.

## When to use
- File explorers, org charts, category trees, and nested navigation menus.
- Any data set where parents hold children and users should expand only the branch they care about.
- Read-only hierarchical displays: pass `selectable: false` to drop the click-to-select behavior.

## Import

```javascript
import { TreeView } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { TreeView } from "flet-box";

TreeView({
  nodes: [
    { id: "docs", label: "Docs", children: [{ id: "intro", label: "Intro" }] },
    { id: "src", label: "Source" },
  ],
  onSelect: (node) => console.log(node.id),
});
```

## Node shape

`nodes` is an array of plain objects. Each object may hold:

| Field | Type | Description |
| --- | --- | --- |
| `id` | string or number | Required and unique. Expansion and selection are both keyed by `id`. |
| `label` | string | Row text. |
| `children` | array of nodes | Makes the node a parent: it gets a toggle chevron and can be expanded. |
| `icon` | string | Material Icon name; overrides the folder/file default for this node. |
| `iconColor` | Color | Per-node icon color; overrides `folderIconColor`/`iconColor`. |
| `badge` | string or number | Renders a `colors.danger` pill at the end of the row. |

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nodes` | array of nodes | `[]` | The tree data. See the node shape above. |
| `onSelect` | `(node) => void` | — | Fires when a row is clicked (only while `selectable`). Also required for click-to-select highlighting — see Notes. |
| `onToggle` | `(nodeId, expanded: boolean) => void` | — | Fires when a chevron is clicked, with the new state. |
| `expandedNodes` | array of ids | `[]` | Ids that start expanded. |
| `defaultExpanded` | boolean | `false` | Expands every node at build time. Only applies when `expandedNodes` is empty. |
| `indent` | number | `20` | Left margin added per nesting level, in pixels. |
| `showIcons` | boolean | `true` | Renders the node icon. |
| `folderIcon` | string | `'folder'` | Icon for a collapsed parent. |
| `folderOpenIcon` | string | `'folder_open'` | Icon for an expanded parent. |
| `fileIcon` | string | `'insert_drive_file'` | Icon for a leaf node. |
| `expandIcon` | string | `'chevron_right'` | Chevron glyph while collapsed. |
| `collapseIcon` | string | `'expand_more'` | Chevron glyph while expanded. |
| `selectable` | boolean | `true` | Rows are clickable and show a pointer cursor. |
| `selectedNodeId` | string, number, or `null` | `null` | Id that starts selected. |
| `bgColor` | Color | `'transparent'` | Row background. |
| `hoverBgColor` | Color | `colors.gray100` | Row background on mouse over. |
| `selectedBgColor` | Color | `colors.primary` + `20` alpha | Row background when selected. Pass a 6-digit hex base. |
| `textColor` | Color | `colors.text` | Label color. |
| `selectedTextColor` | Color | `colors.primary` | Label color when selected; the label also turns bold. |
| `iconColor` | Color | `colors.textSecondary` | Leaf icon and chevron color. |
| `folderIconColor` | Color | `colors.warning` | Parent icon color. |
| `borderColor` | Color | `colors.border` | Accepted but currently unused. |
| `nodePadding` | string | `'6px 4px'` | CSS padding of each row. |
| `nodeGap` | number | `4` | Gap in pixels between the chevron, icon, label, and badge. |
| `childrenGap` | number | `2` | Gap in pixels between sibling nodes. |
| `borderRadius` | number | `6` | Row corner radius in pixels. |
| `fontSize` | number | `14` | Label font size in pixels. |
| `iconSize` | number | `18` | Chevron size in pixels; the node icon renders 2px larger. |
| `transitionDuration` | string | `'0.2s'` | CSS duration of the row background transition. |

These are the props specific to `TreeView`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `expandAll()` — expands every node at every level.
- `collapseAll()` — clears the expanded set and collapses everything.
- `expandTo(nodeId)` — expands the chain of ancestors needed to reveal `nodeId`.
- `collapseTo(nodeId)` — keeps only the ancestors of `nodeId` expanded and collapses the rest.
- `updateNodes(newNodes, selectedId = null)` — replaces the tree data and re-renders.
- `getExpanded()` — returns an array of the currently expanded ids.
- `getSelected()` — returns the currently selected id, or `null`.
- `setSelected(nodeId)` — selects a node, re-renders, and fires `onSelect` with the matching node.

## Examples

### Everyday example

```javascript
import { Column, Text, TreeView } from "flet-box";

Column({
  gap: 8,
  children: [
    Text({ text: "Project files", weight: "bold" }),
    TreeView({
      nodes: [
        {
          id: "src",
          label: "src",
          children: [
            { id: "index", label: "index.js" },
            { id: "app", label: "app.js", badge: 2 },
          ],
        },
        { id: "readme", label: "README.md" },
      ],
      expandedNodes: ["src"],
      indent: 16,
      onSelect: (node) => console.log("open file:", node.id),
    }),
  ],
});
```

### Full example

```javascript
import { Button, Row, TreeView, colors } from "flet-box";

const tree = TreeView({
  nodes: [
    {
      id: "team",
      label: "Team",
      icon: "groups",
      iconColor: colors.primary,
      children: [
        { id: "ana", label: "Ana", badge: 3 },
        { id: "lio", label: "Lio" },
      ],
    },
    {
      id: "billing",
      label: "Billing",
      children: [{ id: "invoices", label: "Invoices" }],
    },
  ],
  selectedNodeId: "ana",
  expandedNodes: ["team"],
  selectable: true,
  showIcons: true,
  folderIcon: "folder",
  folderOpenIcon: "folder_open",
  fileIcon: "description",
  expandIcon: "chevron_right",
  collapseIcon: "expand_more",
  indent: 20,
  nodePadding: "8px 6px",
  nodeGap: 6,
  childrenGap: 4,
  borderRadius: 8,
  fontSize: 14,
  iconSize: 18,
  bgColor: "transparent",
  hoverBgColor: colors.gray100,
  selectedBgColor: "#6366f120",
  selectedTextColor: colors.primary,
  folderIconColor: colors.warning,
  transitionDuration: "0.15s",
  onSelect: (node) => console.log("selected", node.id, node.label),
  onToggle: (id, expanded) => console.log(id, expanded ? "opened" : "closed"),
});

Row({
  gap: 8,
  children: [
    Button({ text: "Expand all", variant: "outlined", onPress: () => tree.expandAll() }),
    Button({ text: "Collapse all", variant: "outlined", onPress: () => tree.collapseAll() }),
    Button({ text: "Reveal invoices", variant: "text", onPress: () => tree.expandTo("invoices") }),
  ],
});
```

## Notes

- Every node needs a unique `id`. Without one, expansion matches on `undefined` and a single click can select every id-less node at once.
- Click-to-select only records the new selection when `onSelect` is provided. Without a handler, clicking a row does not move the highlight — use `setSelected(id)` instead.
- `updateNodes` mutates the array you passed as `nodes` (it empties and refills it in place) and resets the selection to `null` unless you pass a second argument.
- `ref` is invoked twice — once by the widget factory and once by `TreeView` itself.
- The container holds a single wrapper element. Each node is a wrapper whose first child is the row and whose second child (only while the node is expanded) holds its children.
- Hover is implemented with `mouseenter`/`mouseleave` listeners rather than CSS `:hover`, and is only attached to selectable rows that are not currently selected.
- Leaf nodes reserve a 24px spacer where a chevron would be, so labels line up across levels.
- `defaultExpanded` is ignored as soon as you pass a non-empty `expandedNodes`.
- `nodePadding` is a CSS string; `nodeGap`, `childrenGap`, `indent`, `fontSize`, and `iconSize` are numbers in pixels.
- Icons and chevrons need the Material Icons font (see [Icon](Icon.md)).
- `nodes: []` renders an empty wrapper without throwing.

## Related widgets
- [Accordion](Accordion.md)
- [ListView](ListView.md)
- [ListTile](ListTile.md)
- [GridView](GridView.md)
- [Stepper](Stepper.md)

---

## Continue reading

- **Previous:** [Accordion](Accordion.md)
- **Next:** [Carousel](Carousel.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (3 of 5).
