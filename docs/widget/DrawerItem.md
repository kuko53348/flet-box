# DrawerItem

## Overview
`DrawerItem` is a single tappable row for a [Drawer](Drawer.md): an optional `icon`, a `label`, and a trailing chevron. It is **router-aware** — when a `route` is set it calls `goTo(route)` on tap, highlights itself when its route matches the current path, dims to unselected when another item is chosen, and closes the drawer after navigation (`closeOnPress` defaults to `true`). Keyboard-friendly: `role="button"`, focusable, and activated with `Enter` or `Space`.

## When to use
- Build the body of a navigation drawer with auto-selection and routing built in.
- Reuse the same items in a fixed side bar: selection follows the URL.

## Import

```javascript
import { DrawerItem } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { DrawerItem } from "flet-box";

DrawerItem({ icon: "home", label: "Home" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | string | — | Material icon name shown before the label. |
| `label` | string | — | The row text (used as the selected marker id too). |
| `route` | string | — | Route to navigate to on tap via `goTo`. |
| `onPress` | function | — | Extra handler fired on tap. |
| `onSelect` | function | — | Fired when this item becomes selected. |
| `trailingIcon` | string | `"chevron_right"` | Icon at the right edge. |
| `trailingIconColor` | Color | follows selection | Color of the trailing icon. |
| `iconColor` | Color | follows selection | Color of the leading icon. |
| `selectedColor` | Color | `colors.primary` | Text/icon color while selected (background tint is this color at 15% alpha). |
| `unselectedColor` | Color | `colors.text` | Text/icon color while unselected. |
| `hintColor` | Color | `colors.gray100` | Hover background while unselected. |
| `closeOnPress` | boolean | `true` | Close the drawer (`closeDrawer()`) after navigating. |
| `disableTransform` | boolean | `true` | Keep the row from scaling/transforming on hover. |

These are the props specific to `DrawerItem`. It also accepts every [common prop](COMMON_PROPS.md) (including `gap` and `borderRadius`), applied to the row `Container`.

## Examples

### Everyday example

```javascript
import { Drawer, DrawerItem } from "flet-box";

Drawer({
  body: [
    DrawerItem({ icon: "home", label: "Home", route: "/" }),
    DrawerItem({ icon: "settings", label: "Settings", route: "/settings" }),
    DrawerItem({ icon: "logout", label: "Sign out", route: "/logout" }),
  ],
});
```

### Full example

```javascript
import { DrawerItem } from "flet-box";

DrawerItem({
  icon: "notifications",
  label: "Notifications (3)",
  route: "/notifications",
  trailingIcon: "chevron_right",
  selectedColor: "#2563eb",
  onSelect: () => console.log("opened notifications"),
});
```

## Notes

- Reads the router state (`getCurrentPath()` + `subscribe`) to track selection. Initialize the router first (see the [Routing guide](../guides/router.md)); the item matches when `route === currentPath`, and `route: "/"` also matches the empty path.
- Only one item stays selected: choosing an item tells the others to deselect (an internal event is shared across all instances).
- With no `route`, tapping still fires `onPress`/`onSelect` and the row follows manual selection, but it won't navigate.
- It works identically inside a [Drawer](Drawer.md) or pinned to a side of a [Scaffold](Scaffold.md)/[CollapsibleSideBar](CollapsibleSideBar.md) — the highlight always follows the URL.
- Cleanup unsubscribes both the router subscription and the selection event, so rows are safe to remove.

## Related widgets
- [Drawer](Drawer.md)
- [Scaffold](Scaffold.md)
- [Icon](Icon.md)

---

## Continue reading

- **Previous:** [Drawer](Drawer.md)
- **Next:** [BottomNavigation](BottomNavigation.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 8 · App navigation** (5 of 8).