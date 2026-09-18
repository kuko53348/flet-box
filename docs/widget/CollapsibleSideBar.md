# CollapsibleSideBar

## Overview
`CollapsibleSideBar` is a vertical side panel that can expand and collapse with a 300 ms width transition. The expanded width is `widthExpanded` (default `260px`), the collapsed width is `widthCollapsed` (default `60px`), and a chevron button at the top toggles between them. The expanded/collapsed state is persisted through `useState` under a key (use `id` to give each sidebar its own stored state), so the choice survives route changes and re-renders.

## When to use
- Provide a compact-to-full side navigation on desktop without a full drawer.
- Let users reclaim screen space when they do not need the menu.

## Import

```javascript
import { CollapsibleSideBar, DrawerItem } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { CollapsibleSideBar, DrawerItem } from "flet-box";

CollapsibleSideBar({
  children: [
    DrawerItem({ icon: "home", label: "Home", route: "/" }),
    DrawerItem({ icon: "settings", label: "Settings", route: "/settings" }),
  ],
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | Widget | — | The sidebar content. |
| `expanded` | boolean | `true` | Initial expanded state. |
| `id` | string | `"collapsible-sidebar"` | State key — give each sidebar its own `id` so they keep separate collapsed states. |
| `widthExpanded` | number | `260` | Width in px when expanded. |
| `widthCollapsed` | number | `60` | Width in px when collapsed. |
| `iconSize` | number | `24` | Size of the chevron toggle button. |
| `onToggle` | function | — | Fired with the new boolean state after toggling. |
| `bgColor` | Color | `colors.surface` | Background. |
| `borderRight` | string | `1px solid colors.border` | Right border CSS. |

These are the props specific to `CollapsibleSideBar`. It also accepts every [common prop](COMMON_PROPS.md); extra props and `style` are applied to the container.

## Instance methods

- `updateWidth(width)` — resize the panel directly (a number is treated as pixels; a string is passed through).

## Examples

### Everyday example

```javascript
import { CollapsibleSideBar, DrawerItem } from "flet-box";

CollapsibleSideBar({
  id: "main-sidebar",
  children: [
    DrawerItem({ icon: "dashboard", label: "Dashboard", route: "/" }),
    DrawerItem({ icon: "report", label: "Reports", route: "/reports" }),
  ],
});
```

### Full example

```javascript
import { runApp, Scaffold, CollapsibleSideBar, DrawerItem, Text } from "flet-box";

const sidebar = CollapsibleSideBar({
  id: "admin-sidebar",
  widthExpanded: 280,
  widthCollapsed: 64,
  children: [
    DrawerItem({ icon: "admin_panel_settings", label: "Admin", route: "/admin" }),
    DrawerItem({ icon: "group", label: "Users", route: "/users" }),
  ],
  onToggle: (expanded) => console.log("sidebar", expanded ? "open" : "closed"),
});

const app = Scaffold({
  leftNavBar: sidebar,
  body: Text({ text: "Admin area" }),
});

runApp(app, "root");
```

## Notes

- When collapsed, the content fades to `opacity: 0` and `pointer-events: none`; the chevron flips direction (`chevron_left` ↔ `chevron_right`).
- The collapsed/expanded state is stored via `useState` under the `id` key, so it is shared by every sidebar with the same `id`. Give unique `id`s to separate sidebars.
- It is the desktop-side layout that [AdaptiveScaffold](AdaptiveScaffold.md) produces automatically from a `leftNavBar`.
- Place it in a fix-width flex column (like `Scaffold`'s `leftNavBar` or a `Row`) — its `flex-shrink: 0` keeps the rest of the layout from squishing.

## Related widgets
- [AdaptiveScaffold](AdaptiveScaffold.md)
- [Scaffold](Scaffold.md)
- [DrawerItem](DrawerItem.md)
- [Drawer](Drawer.md)

---

## Continue reading

- **Previous:** [Tabs](Tabs.md)
- **Next:** [State with `useState`](../guides/state.md) — Chapter 9 · State, Router & Services
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 8 · App navigation** (8 of 8).