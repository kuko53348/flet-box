# DroppBox

## Overview
`DroppBox` renders a styled `<div>` drop target — `position: relative`, a `2px` solid border, `12px` radius, and `16px` padding by default — that receives items dragged from a `DraggBox`. While a drag hovers over it, the box highlights green (valid) or red (invalid) depending on whether the dragged `group` is listed in `acceptGroups`. On a valid `drop` it calls `onDrop(data, group, event)`.

## When to use
- Create a target that accepts draggable items from a `DraggBox`.
- Build kanban columns, trash zones, or "drop cards here" areas.
- Show accept/reject feedback driven by `acceptGroups`.

## Import

```javascript
import { DroppBox } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { DroppBox, Text } from "flet-box";

DroppBox({ child: Text({ text: "Drop here" }) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `child` | Widget | — | Content inside the target. May be an element, a string, or an array of either. |
| `acceptGroups` | string[] | `["default"]` | Drag `group`s this target accepts. A drop from any other group is ignored. |
| `disabled` | boolean | `false` | Ignore all drag events. |
| `onDrop` | `(data, group, event) => void` | — | Fires on a valid drop with the dragged payload. |
| `onDragEnter` | `(event) => void` | — | Fires when a valid drag first enters. |
| `onDragLeave` | `(event) => void` | — | Fires when the active drag leaves. |
| `onDragOver` | `(event) => void` | — | Fires continuously while a drag is over the target. |
| `bgColor` | Color | `colors.surface` | Resting background color. |
| `borderRadius` | number or string | `12` | Corner radius (a number becomes pixels). |
| `borderWidth` | number | `2` | Resting border width in pixels. |
| `borderStyle` | string | `"solid"` | Resting border style. |
| `borderColor` | Color | `colors.border` | Resting border color. |
| `shadow` | string | `"none"` | Resting box-shadow. |
| `padding` | number or string | `16` | Inner padding (a number becomes pixels). |
| `validBgColor` | Color | `${colors.success}20` | Background while a **valid** drag hovers. |
| `validBorderColor` | Color | `colors.success` | Border color while a valid drag hovers. |
| `invalidBgColor` | Color | `${colors.danger}20` | Background while an **invalid** drag hovers. |
| `invalidBorderColor` | Color | `colors.danger` | Border color while an invalid drag hovers. |
| `activeBgColor` | Color | `${colors.primary}20` | Accepted but currently has no effect — see Notes. |
| `activeBorderColor` | Color | `colors.primary` | Accepted but currently has no effect — see Notes. |
| `activeBorderStyle` | string | `"dashed"` | Border style while any drag hovers. |
| `activeBorderWidth` | number | `2` | Border width (pixels) while a drag hovers. |
| `activeShadow` | string | `0 4px 12px ${colors.primary}40` | Box-shadow while a drag hovers. |
| `transitionDuration` | string | `"0.2s"` | CSS transition duration for style changes. |
| `transitionTiming` | string | `"ease"` | CSS transition timing function. |
| `showFeedback` | boolean | `true` | Whether to apply the hover highlight at all. |

These are the props specific to `DroppBox`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { DroppBox, Text } from "flet-box";

DroppBox({
  acceptGroups: ["cards"],
  onDrop: (data, group) => console.log("dropped", data, "in", group),
  child: Text({ text: "Drop a card here" }),
});
```

### Full example

```javascript
import { Column, Container, DroppBox, Text, colors } from "flet-box";

Column({
  gap: 12,
  children: [
    Text({ text: "Tasks", type: "h3" }),
    DroppBox({
      acceptGroups: ["tasks"],
      showFeedback: true,
      padding: 24,
      borderRadius: 16,
      validBgColor: `${colors.success}20`,
      invalidBgColor: `${colors.danger}20`,
      onDragEnter: () => console.log("drag over the column"),
      onDrop: (data, group) => console.log("added to", group, data),
      child: Container({ padding: 16, child: Text({ text: "Drop tasks here" }) }),
    }),
  ],
});
```

## Notes

- Renders a `<div>`; the widget returns that wrapper element.
- Pairing: a `DraggBox` writes `{ data, group }` to `window.__dragData` on dragstart. `DroppBox` accepts the drop only when that `group` is in `acceptGroups` (default `["default"]`, which matches a default `DraggBox`).
- `onDrop(data, group, event)` receives the dragged `data` and its `group`; the shared payload is cleared after a successful drop.
- Hover feedback (when `showFeedback` is true): a valid drag uses `validBgColor`/`validBorderColor`, an invalid drag uses `invalidBgColor`/`invalidBorderColor`; both switch the border to `activeBorderStyle`/`activeBorderWidth` and apply `activeShadow`.
- `dragover` always calls `preventDefault()` and sets `dropEffect = "copy"` so the browser permits the drop.
- `disabled` short-circuits every drag handler.
- `activeBgColor` and `activeBorderColor` are accepted but currently have no effect — the hover background and border come from the valid/invalid colors.

## Related widgets
- [DraggBox](DraggBox.md)
- [Card](Card.md)
- [Container](Container.md)
- [Column](Column.md)

---

## Continue reading

- **Previous:** [DraggBox](DraggBox.md)
- **Next:** [Scaffold](Scaffold.md) — Chapter 8 · App navigation
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (4 of 4).
