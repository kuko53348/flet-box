# Inspector

## Overview
`Inspector` is a **developer tool, not a widget**: it takes an element and returns a string of FletBox-looking source code describing that element's subtree. It creates no DOM, mounts nothing, and has no visual output — you `console.log` it or feed it to [CodeViewer](CodeViewer.md). Names come from the element's `_widgetName` (set by the widget factory from the underlying tag, with tag-based fallbacks for raw DOM nodes), children come from the real DOM, and prop values come from `getWidgetProps()`. The same module also exports `printWidgetCode(widget)` (logs the string in green) and `inspectWidget(widget)` (logs a grouped report and returns the widget).

## When to use
- Debug a screen: print the widget tree you actually built instead of crawling the DOM by hand.
- Log a subtree from a click or a keyboard shortcut while developing.
- Paste a live structure into a `CodeViewer` panel for an in-app debug drawer.

## Import

```javascript
import { Inspector } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Inspector, Text } from "flet-box";

const label = Text({ text: "Hello" });

console.log(Inspector(label)); // "Span()"
```

## Props

`Inspector` takes positional arguments, not a props object.

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `widget` | Element | — | The element to describe. Anything that is not an element node (`nodeType !== 1`) is returned as `String(widget)`, so `Inspector(null)` gives `"null"`. |
| `indent` | number | `0` | Nesting depth in two-space steps. Used for recursive children and for indenting the closing brace; you normally leave it at `0`. |

`Inspector` returns a `string`. It is not a widget, so it accepts **no** [common props](COMMON_PROPS.md) and produces no element.

## Examples

### Everyday example

```javascript
import { Column, Inspector, Text } from "flet-box";

const screen = Column({
  gap: 8,
  children: [Text({ text: "Title" }), Text({ text: "Subtitle" })],
});

console.log(Inspector(screen));
// Div({
//
//   children: [
//     Span(),
//     Span()
//   ]
// })
```

### Full example

```javascript
import { Button, CodeViewer, Column, Inspector, Row, Text } from "flet-box";

// The tree you want to be able to inspect at runtime.
const card = Column({
  gap: 8,
  children: [
    Text({ text: "Order #1024", type: "h2", size: 20 }),
    Row({ gap: 8, children: [Text({ text: "Total" }), Text({ text: "$42.00" })] }),
    Button({ text: "Pay", onPress: () => console.log("pay") }),
  ],
});

// A dev-only panel that prints the current tree into a CodeViewer.
const output = CodeViewer({ code: "// press Inspect", title: "Inspector", maxHeight: 260 });

const devPanel = Column({
  gap: 12,
  children: [
    card,
    Button({
      text: "Inspect",
      onPress: () => output.updateCode(Inspector(card)),
    }),
    output,
  ],
});

// Console helpers from the same module, re-exported from the package entry:
// import { printWidgetCode, inspectWidget } from "flet-box";
// printWidgetCode(card);   // logs the code string in green
// inspectWidget(card);     // grouped log: props, code, children count
```

## Notes

- **Dev-only.** Ship without it: it walks the whole subtree and builds a big string, and its output is meant for a console, not for users.
- Widget names are derived from the element's tag, not from the function you called. A `Text` prints as `Span`, a `Column`/`Container` as `Div`, an `Image` as `Img`; a `<button>` prints as `Button` and an `<input>` as `Input`.
- Because it walks the real DOM, a widget's internal scaffolding shows up too: `Button({ text: "Save" })` prints as `Button({ children: [ Div({ children: [ Span() ] }) ] })`.
- Raw DOM nodes with no `_widgetName` use tag heuristics: a `material-icons` element → `Icon`, a flex row div → `Row`, a flex column div → `Column`, another div → `Container`, a span → `Text`, and anything else → its lowercase tag name (so a `DataTable` cell prints as `td()`).
- **Prop values are not recovered.** `getWidgetProps()` reads `widget._props`, which the widget factory does not currently populate, so the printout shows widget names and the `children` tree rather than your original props. For the props a widget was built with, call its own `getProps()` (the factory attaches it to every element it creates).
- Children are collected from the live DOM (`element.children`) plus any `widget._children` the factory recorded, so the output reflects what is mounted right now.
- The recursive output puts a blank line after each opening `Name({`, as shown in the example — that is the current formatter, not a copy/paste error.
- `printWidgetCode` and `inspectWidget` are re-exported from the package entry (`flet-box`) together with `Inspector`.

## Related widgets
- [CodeViewer](CodeViewer.md)
- [Text](Text.md)
- [Button](Button.md)
- [Column](Column.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [QRCode](QRCode.md)
- **Next:** [Audio](Audio.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data and rich content** (7 of 7).
