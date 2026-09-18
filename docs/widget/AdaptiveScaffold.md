# AdaptiveScaffold

## Overview
`AdaptiveScaffold` is the same application shell as [Scaffold](Scaffold.md), but it **adapts the left navigation to the screen**: on phones (or any viewport under `768px`) the `leftNavBar` becomes a slide-in [Drawer](Drawer.md), and on desktop it becomes a [CollapsibleSideBar](CollapsibleSideBar.md) pinned to the left. Everything else — `appBar`, `body`, `bottomBar`, `fab`, `drawer`, `routes` — is passed through to `Scaffold` unchanged.

## When to use
- Build one app shell that feels native on both phone and desktop without writing media queries.
- Keep the router config in one place and let the shell decide how the menu is presented per device.

## Import

```javascript
import { AdaptiveScaffold, AppBar, DrawerItem, Text } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { AdaptiveScaffold, AppBar, Text } from "flet-box";

const app = AdaptiveScaffold({
  appBar: AppBar({ title: "My App" }),
  body: Text({ text: "Hello", size: 24, padding: 24 }),
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `appBar` | Widget | — | Top bar, forwarded to `Scaffold`. |
| `body` | Widget or route map | — | The main content or a `{ path: route }` map (router mode). |
| `bottomBar` | Widget | — | Bottom bar, forwarded to `Scaffold`. |
| `fab` | Widget | — | Floating action button, forwarded to `Scaffold`. |
| `drawer` | Widget | — | Explicit drawer to keep on every device, forwarded to `Scaffold`. |
| `leftNavBar` | Widget or function | — | Side menu content. Mobile → `Drawer`, desktop → `CollapsibleSideBar`. |
| `leftNavBarWidth` | number | `260` | Side menu width (drawer on mobile, collapsed sidebar uses `widthCollapsed` sized to its own defaults). |
| `rightNavBar` | Widget or function | — | Right side content; shown only on desktop as a `CollapsibleSideBar`. |
| `rightNavBarWidth` | number | `260` | Right column width on desktop. |
| `routes` | object | — | Route map, forwarded to `Scaffold`. |
| `backgroundColor` | Color | `colors.background` | Shell background. |
| `forceMobile` | boolean | `false` | Force the mobile layout (drawer), even on a wide screen. |
| `forceDesktop` | boolean | `false` | Force the desktop layout (side bar), even on a small screen. |

These are the props specific to `AdaptiveScaffold`. It also accepts every [common prop](COMMON_PROPS.md); extra props are forwarded to the inner `Scaffold`.

## Examples

### Everyday example

```javascript
import { AdaptiveScaffold, AppBar, DrawerItem, Text } from "flet-box";

const app = AdaptiveScaffold({
  appBar: AppBar({ title: "Portal" }),
  leftNavBar: [
    DrawerItem({ icon: "home", label: "Home", route: "/" }),
    DrawerItem({ icon: "settings", label: "Settings", route: "/settings" }),
  ],
  body: Text({ text: "Content" }),
});
```

### Full example

```javascript
import { runApp, AdaptiveScaffold, AppBar, DrawerItem, Text } from "flet-box";

const app = AdaptiveScaffold({
  appBar: AppBar({ title: "Dashboard" }),
  leftNavBar: () => [
    DrawerItem({ icon: "dashboard", label: "Overview", route: "/" }),
    DrawerItem({ icon: "bar_chart", label: "Reports", route: "/reports" }),
  ],
  body: Text({ text: "Data shown here" }),
  forceDesktop: true,
});

runApp(app, "root");
```

## Notes

- This is a **wrapper**: `AdaptiveScaffold` builds its decision once and returns a `Scaffold`. Every [Scaffold](Scaffold.md) prop and instance method applies to what you get back.
- Which layout wins: `forceMobile` beats `forceDesktop`; otherwise the screen is mobile when `device.isMobile()` returns true **or** `window.innerWidth < 768`.
- On mobile, the left menu drawer is created with `closeOnOverlayClick: true` and `closeOnEsc: true`, so the user can dismiss it like any drawer.
- The sidebar content can be a function `() => [...]` so navigation items are rebuilt fresh for each layout; the sidebar receives the resolved element(s).

## Related widgets
- [Scaffold](Scaffold.md)
- [AppBar](AppBar.md)
- [Drawer](Drawer.md)
- [CollapsibleSideBar](CollapsibleSideBar.md)

---

## Continue reading

- **Previous:** [Scaffold](Scaffold.md)
- **Next:** [AppBar](AppBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 8 · App navigation** (2 of 8).