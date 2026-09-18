# Drawer

## Overview
`Drawer` slides a panel in from the left or right edge, over a dimmed, blurred backdrop. Calling it is the action: `Drawer({ ... })` builds a fixed overlay (covering the viewport), **appends it to `document.body`**, and returns a controller object `{ open, close, toggle, destroy, element }` — not an element you place in your tree. The first open animates the panel out; `Escape` and clicking the backdrop close it when enabled. A module-level singleton also exposes `openDrawer()`, `closeDrawer()`, `toggleDrawer()`, and `destroyDrawer()` that act on the most recently created drawer.

## When to use
- Slide out primary navigation (a hamburger menu) from the side of the screen.
- Offer a panel with filters, profile actions, or a mini-menu without leaving the page.

## Import

```javascript
import { Drawer, Text } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Drawer, Text } from "flet-box";

const drawer = Drawer({
  body: [Text({ text: "Menu" })],
});

drawer.open();
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `header` | Widget | — | Fixed top section of the panel. |
| `body` | Widget[] | `[]` | Scrollable middle section. |
| `footer` | Widget | — | Fixed bottom section of the panel. |
| `position` | `'left'`/`'right'` | `'left'` | Which edge the panel slides from. |
| `width` | number | `280` | Panel width in pixels (or a CSS size). |
| `onClose` | function | — | Fired when the panel finishes closing. |
| `onOpen` | function | — | Fired when the panel finishes opening. |
| `blur` | boolean | `true` | Blur the backdrop with `backdropFilter`. |
| `blurIntensity` | number | `4` | Backdrop blur radius in px. |
| `bgColor` | Color | `colors.surface` | Panel background. |
| `elevation` | number | `4` | Side shadow strength. |
| `closeOnOverlayClick` | boolean | `true` | Close when the backdrop is clicked. |
| `closeOnEsc` | boolean | `true` | Close when `Escape` is pressed. |
| `borderRadius` | number | `24` | Corner radius on the panel's inner edge. |
| `margin` | number | `0` | Inset the panel from the top/bottom edges. |

These are the props specific to `Drawer`. The panel is built from `Container`/`Column`/`Text` under the hood.

## Instance methods

The object returned by `Drawer`:

- `open()` — show the panel (slide-in + fade the backdrop).
- `close()` — hide it (slide-out, then `display: none` after 300 ms).
- `toggle()` — invert the current state.
- `destroy()` — remove the element from `document.body` and release listeners.
- `element` — the overlay `HTMLElement`, if you need direct access.

Also `document.body` receives the overlay immediately: no placement step needed.

## Global helpers

The last drawer created is remembered, so you can drive it from anywhere:

- `openDrawer()` · `closeDrawer()` · `toggleDrawer()` · `destroyDrawer()`

If no drawer exists yet these log a warning and do nothing.

## Examples

### Everyday example

```javascript
import { Drawer, Text, DrawerItem } from "flet-box";

const drawer = Drawer({
  header: Text({ text: "Menu", size: 18, weight: "bold", padding: 16 }),
  body: [
    DrawerItem({ icon: "home", label: "Home" }),
    DrawerItem({ icon: "person", label: "Profile" }),
  ],
});

document.querySelector("#open").addEventListener("click", () => drawer.open());
```

### Full example

```javascript
import { Drawer, openDrawer, Text, Button } from "flet-box";

Drawer({
  position: "right",
  width: 320,
  header: Text({ text: "Filters", size: 18, weight: "bold", padding: 16 }),
  body: [
    Button({ text: "Reset", onPress: () => console.log("reset filters") }),
  ],
  footer: Text({ text: "Applied", padding: 16 }),
  closeOnEsc: true,
  borderRadius: 20,
});

// somewhere else in your app:
openDrawer();
```

## Notes

- `Drawer` builds a fixed overlay `100vw × 100vh` at `z-index: 10000` and appends it to `document.body` during the call. Re-mount it once (e.g. in a `Scaffold`'s `drawer` prop) and drive it with the controller or the global helpers.
- `onOpen` fires immediately on open (before the animation ends) and `onClose` fires after the 300 ms close animation, right when the element is hidden.
- While open, the panel is `transform: translateX(0)`; corner rounding applies to the edge facing the screen center (`top/bottomRight` for left panels and the mirror for right ones).
- The drawer keeps itself sized to the viewport on resize (`dimensions.addListener`), and `destroy()` removes that listener and the `keydown` handler.
- When you pass `drawer` to a [Scaffold](Scaffold.md), a `menu` icon in the [AppBar](AppBar.md) opens it, `closeDrawerOnNavigate` can close it on route change, and the shell tears it down with its `_cleanup`.
- Keydown (`Escape`) and resize listeners are only active while the drawer exists or is open — no leaks on the normal lifecycle.

## Related widgets
- [DrawerItem](DrawerItem.md)
- [Scaffold](Scaffold.md)
- [AppBar](AppBar.md)
- [BottomSheet](BottomSheet.md)
- [Modal](Modal.md)

---

## Continue reading

- **Previous:** [AppBar](AppBar.md)
- **Next:** [DrawerItem](DrawerItem.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 8 · App navigation** (4 of 8).