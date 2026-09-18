# Scaffold

## Overview
`Scaffold` is the application shell: a full-viewport flex column (`height: 100vh`, `overflow: hidden`) that mounts an optional `appBar` on top, a main content area in the middle, and a `bottomBar` at the bottom. It can also host a `fab` (absolutely positioned bottom-right), a `drawer` (slide-in panel), and fixed `leftNavBar`/`rightNavBar` side columns. When you pass `routes` — or put a route map in `body` — `Scaffold` turns into a **router shell**: it initializes the router, re-renders the body on navigation, and lets each route override the surrounding bars.

Because it is an `HTMLElement`, you mount the whole app with `runApp(Scaffold({ ... }), "root")`.

## When to use
- Build the skeleton of a real application: top bar, content, bottom bar, and side navigation in one element.
- Use its router mode to render the right screen per URL **and** swap the bars per route.
- Give the app a fixed background and wrap a full-height layout without managing `height: 100vh` yourself.

## Import

```javascript
import { Scaffold, AppBar, Text, colors } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Scaffold, AppBar, Text } from "flet-box";

const app = Scaffold({
  appBar: AppBar({ title: "My App" }),
  body: Text({ text: "Welcome", size: 24, padding: 24 }),
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `appBar` | Widget or boolean | — | Top bar. Pass `AppBar(...)`. `false` hides the top slot and any per-route top bar. |
| `body` | Widget or route map | — | The main content. Pass a widget, **or** a `{ path: route }` map to enable router mode. |
| `bottomBar` | Widget or boolean | — | Bottom bar (e.g. `BottomNavigation`). `false` hides it. |
| `fab` | Widget or boolean | — | Floating action button slot, positioned `16px` from the bottom-right. |
| `drawer` | Widget | — | A `Drawer` instance to embed; also auto-wired to a `menu` icon in the app bar. |
| `leftNavBar` | Widget | — | Fixed left side column; the main area is narrowed by `leftNavBarWidth`. |
| `leftNavBarWidth` | number | `260` | Width in pixels of the left column. |
| `rightNavBar` | Widget | — | Fixed right side column, narrowed by `rightNavBarWidth`. |
| `rightNavBarWidth` | number | `260` | Width in pixels of the right column. |
| `navSideBar` | Widget | — | Legacy alias: routes to `leftNavBar` (or `rightNavBar` when `navSideBarPosition` is `"right"`). |
| `navSideBarWidth` | number | `260` | Legacy width for `navSideBar`. |
| `navSideBarPosition` | `'left'`/`'right'` | `'left'` | Legacy side for `navSideBar`. |
| `routes` | object | — | `{ path: route }` map. Enables router mode (same as passing the map as `body`). |
| `backgroundColor` | Color | `colors.background` | Background of the shell. |
| `closeDrawerOnNavigate` | boolean | `false` | When router mode navigates, close the drawer automatically. |

These are the props specific to `Scaffold`. It also accepts every [common prop](COMMON_PROPS.md); extra props are applied to the root container.

## Router mode

If you pass a **route map** (via `routes` or as `body`), each route config is an object:

```javascript
import { Scaffold, AppBar, Text } from "flet-box";

Scaffold({
  routes: {
    "/": { body: Text({ text: "Home" }), appBar: AppBar({ title: "Home" }) },
    "/settings": {
      body: Text({ text: "Settings" }),
      appBar: false, // no top bar on this route
    },
  },
});
```

Per-route keys the shell understands: `body` (the screen), `appBar`, `bottomBar`, `fab`, `leftNavBar`, `rightNavBar` — each can be a widget or `false`. Omitted keys fall back to the top-level props, and `undefined` values inherit the shell defaults.

> Router mode calls `initRouter(routes, currentUrl)` once and subscribes the shell to router changes, so the body re-renders on `goTo`/back/forward. Read the [Routing guide](../guides/router.md) for the navigation helpers.

## Instance methods

- `updateLeftNavBar(cfg)` — show (`cfg` truthy), hide (`false`), or swap (`widget`) the left column.
- `updateRightNavBar(cfg)` — same for the right column.
- `setLeftNavBarWidth(width)` — resize the left column (pixels or CSS).
- `setRightNavBarWidth(width)` — resize the right column.
- `openDrawer()` / `closeDrawer()` — control the embedded drawer (when one was passed via `drawer`).

## Examples

### Everyday example

```javascript
import { runApp, Scaffold, AppBar, BottomNavigation, Text } from "flet-box";

const app = Scaffold({
  appBar: AppBar({ title: "Store" }),
  body: Text({ text: "Catalog" }),
  bottomBar: BottomNavigation({
    items: [
      { icon: "home", label: "Home" },
      { icon: "shopping_cart", label: "Cart" },
    ],
    useRouter: false,
  }),
});

runApp(app, "root");
```

### Full example

```javascript
import { runApp, Scaffold, AppBar, DrawerItem, Drawer, Text, Icon } from "flet-box";

const app = Scaffold({
  appBar: AppBar({
    title: "Menu",
    leading: Icon({ name: "menu" }), // tapping it opens the drawer
  }),
  drawer: Drawer({
    header: Text({ text: "Account", size: 18, weight: "bold", padding: 16 }),
    body: [DrawerItem({ icon: "home", label: "Home", route: "/" })],
  }),
  leftNavBar: Icon({ name: "dashboard" }),
  body: Text({ text: "Main content" }),
});

runApp(app, "root");
```

## Notes

- The shell is a `<div>` with `display: flex; flex-direction: column; width: 100%; height: 100vh; position: relative; overflow: hidden` — mount it inside a container that fills the screen.
- Side columns and the bottom bar are separate flex slots, not overlays; the content area is `overflow: auto` and expands to the remaining height.
- A `menu` icon in the app bar closes the loop with the drawer: `Scaffold` finds the menu icon (`.material-icons` with text `menu`) and opens the drawer on click, after running any existing handler.
- Route config objects with `body` only (no route keys) work too — the config itself is treated as the screen.
- When a route is missing or a `goTo` targets an unknown path, the router console-logs an error (see the [Routing guide](../guides/router.md) for `*`/`/404` fallbacks).
- `Scaffold` registers a `MutationObserver` on itself and wires `_cleanup` to disconnect it, unsubscribe from the router, and tear down every slot — listeners and observers do not leak when the shell is removed.

## Related widgets
- [AdaptiveScaffold](AdaptiveScaffold.md)
- [AppBar](AppBar.md)
- [Drawer](Drawer.md)
- [BottomNavigation](BottomNavigation.md)
- [CollapsibleSideBar](CollapsibleSideBar.md)

---

## Continue reading

- **Previous:** [DroppBox](DroppBox.md) — end of Chapter 7
- **Next:** [AdaptiveScaffold](AdaptiveScaffold.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 8 · App navigation** (1 of 8).