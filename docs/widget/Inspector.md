# Inspector

Inspector renders a read-only tree that drills into a widget's props, children and element structure. It is a debugging aid for understanding how a composition is built.

## When to use it

Use it during development to inspect the live structure and props of a widget tree.

## Quick start

```javascript
import { Button, Inspector } from "flet-box";

const debug = Inspector({
  widget: Button({ text: "Save" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `widget` | `Widget` | The DOM node or widget to inspect. |
| `indent` | `number` | Indentation depth used when printing nested structures. |

## Examples

### Everyday

```javascript
import { Card, Inspector, Text } from "flet-box";

const debug = Inspector({
  widget: Card({
    padding: 16,
    child: Text({ text: "Profile" }),
  }),
  indent: 16,
});
```

### Full

```javascript
import { Button, Container, Inspector, Text } from "flet-box";

const debug = Inspector({
  widget: Container({
    padding: 16,
    direction: "column",
    gap: 8,
    children: [
      Text({ text: "Header" }),
      Button({ text: "Save" }),
    ],
  }),
  indent: 24,
});
```

## Tips

- Pass the widget instance you want to examine to widget; the tree follows its current children.
- Increase indent to make deep nesting easier to scan.
- Remove Inspector from production screens since it is a diagnostic tool.

## Accessibility

- The tree is text-based and readable; keep surrounding labels so users know what is being inspected.

## Behavior

- Inspector walks the widget's props and children at render time and does not modify the inspected widget.
- Re-rendering the parent refreshes the inspected values.

## Related widgets

- [CodeViewer](CodeViewer.md)
- [TreeView](TreeView.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [QRCode](QRCode.md)
- **Next:** [AdSense](AdSense.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (7 of 13).
