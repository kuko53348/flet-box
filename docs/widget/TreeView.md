# TreeView

## Overview
`TreeView` is a ready-to-use building block. Think of it like a LEGO piece: give it some props, place it inside another widget, and FletBox creates the browser element for you.

You do not need to write HTML or manually change the DOM to use this widget. You call the widget as a JavaScript function and pass an object between `{` and `}`.

## Learn it in one minute

1. Import the widget from `flet-box`.
2. Call it with `WidgetName({ ... })`.
3. Add props to describe its content, size, color, spacing, and behavior.
4. Put it inside `Container`, `Row`, `Column`, or another widget.

```javascript
import { Column, Container, Text } from "flet-box";

const welcomeCard = Container({
    padding: 20,
    margin: 16,
    bgColor: "#ffffff",
    borderRadius: 12,
    child: Column({
        gap: 8,
        children: [
            Text({ text: "My first FletBox screen", size: 24, weight: "bold" }),
            Text({ text: "Widgets are small building blocks. Put them inside each other to build a screen." }),
        ],
    }),
});
```

## When to use
Use `TreeView` when you need this kind of interface element. Start with the smallest example, then add one prop at a time. You can copy the example, change the text or color, and see the result immediately.

## Common props

- `children` / `child`: content rendered inside the widget.
- `id`: DOM id for the element.
- `className`: CSS class names applied to the element.
- `ref`: callback that receives the underlying DOM node.
- `onClick` / event handlers: native browser event callbacks.
- `disabled`: disables interaction when supported.

## Full prop list

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `Size` | - | Property used by the TreeView component. |
| `height` | `Size` | - | Property used by the TreeView component. |
| `size` | `number` | - | Component size or preset. |
| `padding` | `Padding` | - | Internal spacing around the component. |
| `margin` | `Margin` | - | External spacing around the component. |
| `bgColor` | `Color` | - | Background color applied to the element. |
| `color` | `Color` | - | Color value or theme token. |
| `borderRadius` | `number \| string` | - | Property used by the TreeView component. |
| `elevation` | `number` | - | Property used by the TreeView component. |
| `shadow` | `string` | - | Property used by the TreeView component. |
| `opacity` | `number` | - | Property used by the TreeView component. |
| `visible` | `boolean` | false | Property used by the TreeView component. |
| `disabled` | `boolean` | false | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | - | Callback fired when the widget is pressed. |
| `onClick` | `(widget: Widget) => void` | - | Property used by the TreeView component. |
| `id` | `string` | - | Property used by the TreeView component. |
| `className` | `string` | - | Property used by the TreeView component. |
| `ref` | `(widget: Widget) => void` | - | Property used by the TreeView component. |
| `disableTransform` | `boolean` | - | Property used by the TreeView component. |
| `nodes` | `Array<{` | - | Property used by the TreeView component. |
| `label` | `string` | - | Label or caption shown near the control. |
| `icon` | `string` | - | Property used by the TreeView component. |
| `iconColor` | `Color` | - | Property used by the TreeView component. |
| `children` | `any[]` | - | Property used by the TreeView component. |
| `badge` | `string \| number` | - | Property used by the TreeView component. |
| `onSelect` | `(node: any) => void` | - | Callback fired when an option is selected. |
| `onToggle` | `(nodeId: string, expanded: boolean) => void` | - | Property used by the TreeView component. |
| `expandedNodes` | `string[]` | [] | Property used by the TreeView component. |
| `indent` | `number` | - | Property used by the TreeView component. |
| `showIcons` | `boolean` | false | Property used by the TreeView component. |
| `folderIcon` | `string` | - | Property used by the TreeView component. |
| `folderOpenIcon` | `string` | - | Property used by the TreeView component. |
| `fileIcon` | `string` | - | Property used by the TreeView component. |
| `expandIcon` | `string` | - | Property used by the TreeView component. |
| `collapseIcon` | `string` | - | Property used by the TreeView component. |
| `defaultExpanded` | `boolean` | false | Property used by the TreeView component. |
| `selectable` | `boolean` | false | Property used by the TreeView component. |
| `selectedNodeId` | `string \| null` | - | Property used by the TreeView component. |
| `hoverBgColor` | `Color` | - | Property used by the TreeView component. |
| `selectedBgColor` | `Color` | - | Property used by the TreeView component. |
| `textColor` | `Color` | - | Property used by the TreeView component. |
| `selectedTextColor` | `Color` | - | Property used by the TreeView component. |
| `folderIconColor` | `Color` | - | Property used by the TreeView component. |
| `borderColor` | `Color` | - | Property used by the TreeView component. |
| `nodePadding` | `Padding` | - | Property used by the TreeView component. |
| `nodeGap` | `number` | - | Property used by the TreeView component. |
| `childrenGap` | `number` | - | Property used by the TreeView component. |
| `fontSize` | `number` | - | Property used by the TreeView component. |
| `iconSize` | `number` | - | Property used by the TreeView component. |
| `transitionDuration` | `string` | - | Property used by the TreeView component. |

## How props work

A prop is simply an instruction inside the object passed to the widget. The name tells FletBox what to change, and the value tells it how to change it.

```javascript
TreeView({
    padding: 16,              // space inside the widget
    margin: "8px 0",         // space outside the widget
    bgColor: "#eff6ff",      // background color
    width: "100%",           // CSS size or a number of pixels
    children: [],             // widgets placed inside it
    onPress: () => {         // what to do after a press
        console.log("Hello");
    },
});
```

You do not need to use every prop. Begin with the required props, then add optional props only when you need them.

## Example usage

```javascript
import { TreeView, Text } from "flet-box";

const example = TreeView({
  data: [],
  child: Text({ text: "Example" })
});
```

## Examples from the FletBox snippet library

The examples below come from the FletBox snippet library. The prop table is based on `src/index.d.ts`. When an example and the type declaration use different names, prefer the type declaration and verify the implementation.

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
TreeView({ nodes: [{ id: "1", label: "Root" }] })
```

## Everyday example

A practical version with the props most applications usually need.

```javascript
TreeView({ nodes: treeData, onSelect: (node) => console.log(node), selectable: true })
```

## Full example

A larger example showing advanced styling, layout, events, and customization.

```javascript
TreeView({
    nodes: [
        { id: "1", label: "Documents", icon: "folder", children: [
            { id: "2", label: "resume.pdf", icon: "description" },
            { id: "3", label: "photo.jpg", icon: "image" }
        ]},
        { id: "4", label: "Downloads", badge: 3, children: [] }
    ],
    onSelect: (node) => openFile(node),
    onToggle: (nodeId, expanded) => console.log(nodeId, expanded),
    expandedNodes: ["1"],
    indent: 24,
    showIcons: true,
    folderIcon: "folder",
    folderOpenIcon: "folder_open",
    fileIcon: "insert_drive_file",
    expandIcon: "chevron_right",
    collapseIcon: "expand_more",
    defaultExpanded: false,
    selectable: true,
    selectedNodeId: selected,
    bgColor: "transparent",
    hoverBgColor: colors.gray100,
    selectedBgColor: `${colors.primary}20`,
    textColor: colors.text,
    selectedTextColor: colors.primary,
    iconColor: colors.textSecondary,
    folderIconColor: colors.warning,
    nodePadding: "8px 12px",
    nodeGap: 8,
    borderRadius: 8,
    fontSize: 14,
    iconSize: 20
})
```


## Common layout and styling examples

The following example shows how common FletBox props work together. Numeric spacing values are interpreted as pixels, while strings can use CSS units and shorthand values.

```javascript
import { Button, Column, Container, Row, Text } from "flet-box";

const panel = Container({
    width: "100%",          // number values are pixels; strings accept CSS units
    padding: 24,            // 24px on every side
    margin: "16px auto",   // CSS shorthand: vertical and horizontal spacing
    bgColor: "#f8fafc",    // background color
    borderRadius: 12,
    elevation: 2,
    gap: 12,
    child: Column({
        children: [
            Text({ text: "Account settings", size: 24, weight: "bold" }),
            Row({
                gap: 8,
                justifyContent: "space-between",
                children: [
                    Text({ text: "Update your profile" }),
                    Button({
                        text: "Save",
                        bgColor: "#2563eb",
                        color: "#ffffff",
                        onPress: () => console.log("saved"),
                    }),
                ],
            }),
        ],
    }),
});
```

### Common prop quick reference

- `padding: 24` adds `24px` inside the widget on all sides.
- `padding: "8px 16px"` uses CSS shorthand for vertical and horizontal spacing.
- `margin: "16px auto"` adds outside spacing and can center a fixed-width element.
- `bgColor: "#f8fafc"` sets the background color. Color tokens and CSS colors can be used.
- `color: "#111827"` sets the foreground or text color when supported.
- `width: 320` means `320px`; `width: "100%"` uses a CSS percentage.
- `children` is an array of widgets; `child` is useful when a component accepts one child.
- `gap: 12` controls the space between children in layout widgets.
- `onPress` and `onClick` receive event callbacks for interactive behavior.

## Beginner tips

- Change one value at a time so you can see what each prop does.
- Use `Text` to check that your layout is in the place you expect.
- Use `Container` for a box, `Row` for items side by side, and `Column` for items one below another.
- Use `padding` when content needs breathing room inside a box.
- Use `margin` when you need space between this widget and its neighbors.
- Use `bgColor` to make the boundaries of a box easy to see while learning.
- If a prop is optional, leaving it out lets FletBox use its default behavior.

## Common mistakes

- Do not put plain text where a widget is expected unless the widget explicitly accepts strings.
- Use `children: [ ... ]` for several child widgets and `child: widget` for one child when the widget supports both.
- Check spelling carefully: `onPress`, `onClick`, and `onChange` are different events.
- If a helper such as `padding()` or `margin()` is not available in your import list, use a number or CSS string first.

## Behavior notes
- Integrates cleanly with FletBox runtime semantics and DOM rendering.
- Can be nested inside layout widgets and combined with other components.
- Uses the same direct prop and event conventions as the rest of the framework.
- Keeps the API simple and readable for composing interfaces fast.

## Accessibility
- Prefer clear labels and readable text for interactive controls.
- Respect the `disabled` state and keyboard behavior when available.
- Keep state changes understandable for screen readers and assistive technology.

## Related widgets
- `Container`
- `Row`
- `Column`
- `Stack`
- `Text`
- `Button`
