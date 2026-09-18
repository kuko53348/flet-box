# BottomNavigation

## Overview
`BottomNavigation` renders a bottom tab bar as a `<nav>` flex row. Each `item` shows an `icon` (and an optional `label` below it). With `useRouter: true` (the default) tapping a tab calls `goTo(route)` and the active state follows the URL; with `useRouter: false` the bar keeps its own `currentIndex` and reports changes through `onTabChange`. It is sticky-sized for the bottom of a [Scaffold](Scaffold.md)'s `bottomBar` slot.

## When to use
- Give a phone-style app its primary navigation at the bottom.
- Keep the active tab in sync with the router so deep links highlight the right tab.

## Import

```javascript
import { BottomNavigation } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { BottomNavigation } from "flet-box";

BottomNavigation({
  items: [
    { icon: "home", label: "Home" },
    { icon: "shopping_cart", label: "Cart" },
  ],
  useRouter: false,
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | array | `[]` | Tab descriptors: `{ icon, label?, route?, onPress? }`. Only `icon` is required. |
| `currentIndex` | number | `0` | Initial active tab (used only when `useRouter` is false). |
| `onTabChange` | function | — | Called with the active index after a change (and, in router mode, with the synced index). |
| `useRouter` | boolean | `true` | When true, taps call `goTo(route)` and selection follows the current path. |
| `backgroundColor` | Color | `colors.surface` | Bar background. |
| `selectedColor` | Color | `colors.primary` | Icon/label color of the active tab. |
| `unselectedColor` | Color | `colors.textSecondary` | Color of inactive tabs. |
| `showLabels` | boolean | `true` | Show the label under each icon. |
| `iconSize` | number | `24` | Icon size in pixels. |
| `height` | number | `65` | Bar height in pixels. |
| `margin`/`marginTop`/… | number or string | `0` | Outer spacing (the bar shrinks to `calc(100% - margins)`). |
| `padding` | number or string | `0` | Inner padding. |
| `borderRadius` | number or string | `0` | Corner radius. |
| `shadow` | boolean or string | `true` | `true` uses the shadow map for `elevation`; a CSS string is applied directly; `false` removes it. |
| `elevation` | number (0-5) | `2` | Shadow level used when `shadow` is `true`. |

These are the props specific to `BottomNavigation`. Item routes default to `/${label?.toLowerCase()}`, so `{ icon: "home", label: "Home" }` targets `/home`.

## Instance methods

- `setActiveIndex(index)` — select a tab programmatically. In router mode it navigates to the item's route; otherwise it switches and fires `onTabChange`/`onPress`.
- `getActiveIndex()` — the current index.
- `getCurrentRoute()` — the current router path (always `null` when `useRouter` is false).

## Examples

### Everyday example

```javascript
import { BottomNavigation } from "flet-box";

BottomNavigation({
  items: [
    { icon: "home", label: "Home" },
    { icon: "search", label: "Search" },
    { icon: "person", label: "Profile" },
  ],
  useRouter: false,
  onTabChange: (index) => console.log("tab", index),
});
```

### Full example

```javascript
import { runApp, Scaffold, Text, BottomNavigation } from "flet-box";

const app = Scaffold({
  body: Text({ text: "Main screen" }),
  bottomBar: BottomNavigation({
    items: [
      { icon: "home", label: "Home", route: "/", onPress: () => console.log("tap home") },
      { icon: "settings", label: "Settings", route: "/settings" },
    ],
  }),
});

runApp(app, "root");
```

## Notes

- In router mode the bar subscribes to router changes and re-highlights on `goTo`, back, and forward navigation — one source of truth for the active tab.
- The active item gets `font-weight: 500` on its label and the selected/unselected colors on both icon and label.
- Item `onPress` fires after navigation (router mode) or after the local switch (non-router mode).
- `_cleanup` unsubscribes from the router, so removing the bar never leaves stale listeners.

## Related widgets
- [Scaffold](Scaffold.md)
- [Tabs](Tabs.md)
- [Drawer](Drawer.md)

---

## Continue reading

- **Previous:** [DrawerItem](DrawerItem.md)
- **Next:** [Tabs](Tabs.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 8 · App navigation** (6 of 8).