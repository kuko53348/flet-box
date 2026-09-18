# DraggBox

## Overview
`DraggBox` wraps a `child` in a draggable `<div>` (`display: inline-block`, `cursor: grab`, `user-select: none`) so it can be picked up with the native HTML5 drag-and-drop API. On `dragstart` it publishes a payload — `{ data, group, dragId }` — to `window.__dragData` and writes the `dragId` into `dataTransfer`; a matching `DroppBox` reads that payload on drop. It returns `null` when no `child` is given.

## When to use
- Make a card, chip, or list item draggable in a drag-and-drop UI.
- Pair with `DroppBox` to move items between drop targets.
- Carry an arbitrary `data` payload and a `group` tag that decides which targets accept the drag.

## Import

```javascript
import { DraggBox } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { DraggBox, Text } from "flet-box";

DraggBox({ child: Text({ text: "Drag me" }) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `child` | Widget | — | Content to make draggable. Required — `DraggBox` returns `null` without it. |
| `data` | any | — | Payload passed to `onDragStart`/`onDragEnd` and to a `DroppBox`'s `onDrop`. |
| `group` | string | `"default"` | Tag matched against a `DroppBox`'s `acceptGroups` to decide drop validity. |
| `disabled` | boolean | `false` | Turns dragging off: `draggable` becomes false, `cursor` becomes `default`, and `dragstart` is cancelled. |
| `cloneOnDrag` | boolean | `true` | Drag a styled clone of the box as the drag image. Ignored when `dragImage` is set. |
| `dragImage` | HTMLElement | — | Custom element used as the drag image instead of the clone. |
| `opacity` | number | `0.5` | Opacity applied to the source box **while dragging** (not at rest). |
| `dragOverlayColor` | Color | `${colors.primary}20` | Background color of the drag clone. |
| `dragBorderColor` | Color | `colors.primary` | Dashed border color of the drag clone. |
| `onDragStart` | `(event, data) => void` | — | Fires on `dragstart`, after the payload is published. |
| `onDragEnd` | `(event, data) => void` | — | Fires on `dragend`. |

These are the props specific to `DraggBox`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Card, DraggBox, Text } from "flet-box";

DraggBox({
  child: Card({ child: Text({ text: "Move this card" }) }),
  group: "cards",
  data: { id: 1 },
  onDragEnd: (event, data) => console.log("drag finished", data),
});
```

### Full example

```javascript
import { Column, DraggBox, DroppBox, Text } from "flet-box";

Column({
  gap: 16,
  children: [
    DraggBox({
      group: "tasks",
      data: { id: "task-1", title: "Write documentation" },
      cloneOnDrag: true,
      opacity: 0.6,
      onDragStart: (event, data) => console.log("start", data),
      onDragEnd: (event, data) => console.log("end", data),
      child: Text({ text: "Write documentation" }),
    }),
    DroppBox({
      acceptGroups: ["tasks"],
      onDrop: (data, group) => console.log("dropped into", group, data),
      child: Text({ text: "Drop here" }),
    }),
  ],
});
```

## Notes

- Renders an inline-block `<div>`; the widget returns that wrapper element.
- Pairing: on `dragstart` the payload `{ data, group, dragId }` is stored on `window.__dragData`. A `DroppBox` accepts the drop only when this `group` is listed in its `acceptGroups`. The default `group: "default"` matches a default `DroppBox`.
- `dataTransfer` carries the `dragId` as `text/plain`; `effectAllowed` and the target's `dropEffect` are `"copy"`.
- `opacity` applies only during the drag; at rest the box is fully opaque.
- `cloneOnDrag` (default) builds a rotated, dashed-border clone as the drag image using `dragOverlayColor`/`dragBorderColor`. Pass `dragImage` to use your own element, or set `cloneOnDrag: false` with no `dragImage` for a transparent drag image.
- `disabled` sets `draggable="false"`, `cursor: default`, and cancels the `dragstart`.

## Related widgets
- [DroppBox](DroppBox.md)
- [Card](Card.md)
- [Container](Container.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Video](Video.md)
- **Next:** [DroppBox](DroppBox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (3 of 4).
