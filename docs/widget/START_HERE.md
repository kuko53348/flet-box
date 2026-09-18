# Start here

Welcome to FletBox. This guide is for anyone who has never used FletBox before.

## The simple idea

A FletBox app is made from widgets. A widget is a small piece of the screen:

- `Text` writes words.
- `Button` gives the user something to press.
- `Container` creates a box for grouping and styling.
- `Row` places things from left to right.
- `Column` places things from top to bottom.
- `Image` displays a picture.
- `Input` lets the user type.

You combine these pieces to make a complete screen.

## Your first widget

Every widget is called like a JavaScript function. The object inside `({ ... })` contains its props.

```javascript
import { Text } from "flet-box";

const title = Text({
  text: "Hello FletBox",
  size: 28,
  color: "#111827",
});
```

Read this as: create a text widget, write these words, make them this size, and use this color.

## Put widgets inside widgets

Use `child` for one child and `children` for a list of children.

```javascript
import { Column, Text } from "flet-box";

const page = Column({
  gap: 12,
  children: [
    Text({ text: "First line" }),
    Text({ text: "Second line" }),
  ],
});
```

The `Column` places the two text widgets one below the other. A `Row` would place them next to each other.

## Make a styled box

```javascript
import { Container, Text } from "flet-box";

const card = Container({
  width: 320,
  padding: 20,
  margin: "16px auto",
  bgColor: "#eff6ff",
  borderRadius: 12,
  child: Text({ text: "A comfortable blue card" }),
});
```

Common values:

- A number such as `20` means pixels: `20px`.
- A string such as `"100%"` uses a CSS size.
- `padding` is space inside the widget.
- `margin` is space outside the widget.
- `bgColor` is the background color.
- `color` is usually the text or foreground color.
- `gap` is the space between children.

## Add an action

```javascript
import { Button } from "flet-box";

const saveButton = Button({
  text: "Save",
  bgColor: "#2563eb",
  color: "#ffffff",
  padding: "10px 18px",
  onPress: () => {
    console.log("The user pressed Save");
  },
});
```

The function after `onPress` runs when the user presses the button.

## Build a small screen

```javascript
import { Button, Column, Container, Text } from "flet-box";

const screen = Container({
  width: "100%",
  padding: 24,
  bgColor: "#f8fafc",
  child: Column({
    gap: 16,
    children: [
      Text({ text: "Profile", type: "h1", size: 32, weight: "bold" }),
      Text({ text: "Update your information below." }),
      Button({
        text: "Continue",
        onPress: () => console.log("continue"),
      }),
    ],
  }),
});
```

This is the main FletBox pattern: create a parent, place children inside it, and describe each part with props.

## What to read next

The widget docs are organized as a book that goes from basic to advanced. Start at
page 1 and follow the **Continue reading** links at the bottom of each page:

1. Begin with [Text](Text.md), the first page of [Chapter 1](README.md#the-reading-path).
2. Read its small example first, then its full prop list.
3. Copy the example and change one value.
4. Follow **Next** to [Container](Container.md), then combine it with `Row` or `Column`.
5. Use the [widget index](README.md) to jump anywhere in the book.

Every widget page uses the same structure, so learning one page helps you understand the others.

FletBox intentionally supports friendly aliases for developers coming from Flet, Flutter, React, or vanilla JavaScript. Read the [syntax philosophy](../guides/syntax-philosophy.md) to see why equivalent styles such as `bgColor` / `backgroundColor`, `onPress` / `onClick`, and `child` / `children` can coexist.

When you are ready to build a real application, continue with [State](../guides/state.md), [Routing](../guides/router.md), and [Utilities](../guides/utilities.md).
