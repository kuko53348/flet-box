# FloatingActionButton

## Overview
`FloatingActionButton` (FAB) renders a circular, elevated action button as a `Container` `<div>` — not a native `<button>` — holding a Material `Icon` (default `add`). With `extended: true` and a `label` it becomes a pill-shaped button with text. Despite the name it does **not** float by itself: it is an ordinary element you position yourself, typically absolutely inside a [Stack](Stack.md) or with the common `position`/`bottom`/`right` props. `onPress` is the click handler; hover scales the button to 1.05 when a handler is set.

## When to use
- The screen's primary action: create, compose, add.
- A persistent call-to-action anchored to a corner of the layout.
- An icon-only action that needs more emphasis than a plain [Button](Button.md).

## Import

```javascript
import { FloatingActionButton } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { FloatingActionButton } from "flet-box";

FloatingActionButton({ icon: "add", onPress: () => console.log("add") });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | string | `'add'` | Material Icon name rendered inside the button. |
| `label` | string | — | Text label; only rendered when `extended: true`. |
| `onPress` | function | — | Click handler. Also enables the hover scale effect. Ignored when `disabled`. |
| `backgroundColor` | Color | `colors.primary` | Button background. |
| `foregroundColor` | Color | `'#ffffff'` | Icon and label color. |
| `elevation` | number | `6` | Shadow depth, mapped to `0 e/2px epx rgba(0,0,0,0.3)` (not a CSS value). |
| `borderRadius` | number | `48` | Radius applied to the inner icon surface (the button itself is `50%` round, or 24px when extended). |
| `padding` | number | `12` | Padding of the inner icon, in pixels. |
| `mini` | boolean | `false` | Shrinks the button from 56px to 40px (icon 24px → 20px). |
| `extended` | boolean | `false` | Pill mode: auto width, `0 20px` padding, 24px radius, icon + `label` in a row. |
| `disabled` | boolean | `false` | Opacity 0.6, `not-allowed` cursor, and no click/hover listeners. |

These are the props specific to `FloatingActionButton`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style` — applied to the button container (use them, e.g. `position: "absolute"`, `bottom`, `right`, to make it float).

## Examples

### Everyday example

```javascript
import { FloatingActionButton, Stack, Text } from "flet-box";

Stack({
  width: "100%",
  height: 300,
  children: [
    Text({ text: "Screen content", padding: 16 }),
    FloatingActionButton({
      icon: "edit",
      position: "absolute",
      bottom: 16,
      right: 16,
      onPress: () => console.log("edit"),
    }),
  ],
});
```

### Full example

```javascript
import { Column, FloatingActionButton, colors } from "flet-box";

Column({
  gap: 16,
  alignItems: "flex-start",
  children: [
    // Standard 56px round FAB
    FloatingActionButton({
      icon: "add",
      backgroundColor: colors.primary,
      elevation: 8,
      onPress: () => console.log("create"),
    }),

    // Mini FAB
    FloatingActionButton({
      icon: "favorite",
      mini: true,
      backgroundColor: colors.danger,
      onPress: () => console.log("like"),
    }),

    // Extended pill with label
    FloatingActionButton({
      icon: "navigate_next",
      label: "Continue",
      extended: true,
      backgroundColor: "#111827",
      foregroundColor: "#ffffff",
      onPress: () => console.log("next step"),
    }),

    // Disabled state
    FloatingActionButton({ icon: "delete", disabled: true }),
  ],
});
```

## Notes

- The element is a `div` styled as a button; there is no native `<button>` semantics — add `aria-label` via common props for accessibility, especially in icon-only mode.
- The hover scale(1.05) and the click listener are only attached when `onPress` is provided and `disabled` is false.
- `extended: true` without `label` renders the pill shape with just the icon.
- `elevation` is a shadow preset multiplier (`box-shadow: 0 elevation/2 px elevation px rgba(0,0,0,0.3)`), not the `0–5` scale used by [Button](Button.md).
- Icons require the Material Icons font (see [Icon](Icon.md)).

## Related widgets
- [Button](Button.md)
- [Icon](Icon.md)
- [Stack](Stack.md)
- [Container](Container.md)
- [Tooltip](Tooltip.md)

---

## Continue reading

- **Previous:** [Skeleton](Skeleton.md)
- **Next:** [Pagination](Pagination.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (9 of 10).
