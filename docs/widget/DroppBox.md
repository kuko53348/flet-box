# DroppBox

## Overview
`DroppBox` is a ready-to-use building block. Think of it like a LEGO piece: give it some props, place it inside another widget, and FletBox creates the browser element for you.

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
Use `DroppBox` when you need this kind of interface element. Start with the smallest example, then add one prop at a time. You can copy the example, change the text or color, and see the result immediately.

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
| `width` | `Size` | - | Property used by the DroppBox component. |
| `height` | `Size` | - | Property used by the DroppBox component. |
| `size` | `number` | - | Component size or preset. |
| `padding` | `Padding` | - | Internal spacing around the component. |
| `margin` | `Margin` | - | External spacing around the component. |
| `bgColor` | `Color` | - | Background color applied to the element. |
| `color` | `Color` | - | Color value or theme token. |
| `borderRadius` | `number \| string` | - | Property used by the DroppBox component. |
| `elevation` | `number` | - | Property used by the DroppBox component. |
| `shadow` | `string` | - | Property used by the DroppBox component. |
| `opacity` | `number` | - | Property used by the DroppBox component. |
| `visible` | `boolean` | false | Property used by the DroppBox component. |
| `disabled` | `boolean` | false | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | - | Callback fired when the widget is pressed. |
| `onClick` | `(widget: Widget) => void` | - | Property used by the DroppBox component. |
| `id` | `string` | - | Property used by the DroppBox component. |
| `className` | `string` | - | Property used by the DroppBox component. |
| `ref` | `(widget: Widget) => void` | - | Property used by the DroppBox component. |
| `disableTransform` | `boolean` | - | Property used by the DroppBox component. |
| `child` | `Widget` | - | Property used by the DroppBox component. |
| `onDrop` | `(data: any, group: string, event: DragEvent) => void` | - | Property used by the DroppBox component. |
| `onDragEnter` | `(event: DragEvent) => void` | - | Property used by the DroppBox component. |
| `onDragLeave` | `(event: DragEvent) => void` | - | Property used by the DroppBox component. |
| `onDragOver` | `(event: DragEvent) => void` | - | Property used by the DroppBox component. |
| `acceptGroups` | `string[]` | [] | Property used by the DroppBox component. |
| `borderWidth` | `number` | - | Property used by the DroppBox component. |
| `borderStyle` | `string` | - | Property used by the DroppBox component. |
| `borderColor` | `Color` | - | Property used by the DroppBox component. |
| `activeBgColor` | `Color` | - | Property used by the DroppBox component. |
| `activeBorderColor` | `Color` | - | Property used by the DroppBox component. |
| `activeBorderWidth` | `number` | - | Property used by the DroppBox component. |
| `activeBorderStyle` | `string` | - | Property used by the DroppBox component. |
| `activeShadow` | `string` | - | Property used by the DroppBox component. |
| `validBgColor` | `Color` | - | Property used by the DroppBox component. |
| `validBorderColor` | `Color` | - | Property used by the DroppBox component. |
| `invalidBgColor` | `Color` | - | Property used by the DroppBox component. |
| `invalidBorderColor` | `Color` | - | Property used by the DroppBox component. |
| `transitionDuration` | `string` | - | Property used by the DroppBox component. |
| `transitionTiming` | `string` | - | Property used by the DroppBox component. |
| `showFeedback` | `boolean` | false | Property used by the DroppBox component. |

## How props work

A prop is simply an instruction inside the object passed to the widget. The name tells FletBox what to change, and the value tells it how to change it.

```javascript
DroppBox({
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
import { DroppBox, Text } from "flet-box";

const example = DroppBox({
  child: Text({ text: "Example" })
});
```

## Examples from the FletBox snippet library

The examples below come from the FletBox snippet library. The prop table is based on `src/index.d.ts`. When an example and the type declaration use different names, prefer the type declaration and verify the implementation.

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
DroppBox({ child: Text({ text: "Drop here" }) })
```

## Everyday example

A practical version with the props most applications usually need.

```javascript
DroppBox({
    child: Text({ text: "Drop a card here" }),
    acceptGroups: ["cards"],
    onDrop: (data) => console.log("dropped", data),
})
```

## Full example

A larger example showing advanced styling, layout, events, and customization.

```javascript
DroppBox({
    child: Container({
        padding: 32,
        borderRadius: 12,
        child: Text({ text: "Drop files or tasks here" }),
    }),
    acceptGroups: ["kanban"],
    showFeedback: true,
    activeBgColor: "#eff6ff",
    activeBorderColor: colors.primary,
    validBgColor: "#f0fdf4",
    validBorderColor: colors.success,
    invalidBgColor: "#fef2f2",
    invalidBorderColor: colors.danger,
    onDrop: (data, group, event) => console.log(data, group),
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
- [Container](Container.md)
- [Row](Row.md)
- [Column](Column.md)
- [Stack](Stack.md)
- [Text](Text.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [DraggBox](DraggBox.md)
- **Next:** [Widget index](README.md) — you reached the end of the book
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (4 of 4).
