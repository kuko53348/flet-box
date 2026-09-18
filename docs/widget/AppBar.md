# AppBar

## Overview
`AppBar` renders a top bar as a `<header>` flex row (`min-height: 56px`). It has three zones: a left **leading** slot (icon), a **title** (string or widget), and a right **actions** slot (a row of widgets). `sticky` keeps it attached to the top of the viewport; `hideOnScroll` collapses it when you scroll down. When `showBackButton` is set, `AppBar` builds an automatic back arrow that goes back in history (or to `backButtonRoute`), and it can be wired to open a `Scaffold` drawer through a `menu` leading icon.

## When to use
- Give a screen a title and a place for commands (search, refresh, avatar).
- Show breadcrumb-style navigation with an automatic back arrow.
- Put a persistent header above scrollable content with `sticky: true`.

## Import

```javascript
import { AppBar, Text } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { AppBar } from "flet-box";

AppBar({ title: "Profile" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string or Widget | — | The title text, or a custom element to render. |
| `leading` | Widget | `null` | Left slot (e.g. a `menu` `Icon`). Must be an `HTMLElement` to be shown. |
| `actions` | Widget[] | `[]` | Right slot items; only elements pass the filter in. |
| `actionsGap` | number | `12` | Spacing between the action items. |
| `backgroundColor` | Color | `colors.surface` | Bar background. |
| `gradient` | string | `null` | A CSS `background` image (from the `gradient(...)` helper) — overrides `backgroundColor`. |
| `titleColor` | Color | `colors.text` | Title color. |
| `iconColor` | Color | `titleColor` | Color of the leading/back icon. |
| `titleSize` | number | `20` | Title font size. |
| `titleWeight` | string | `"500"` | Title font weight. |
| `centerTitle` | boolean | `false` | Center the title instead of left-aligning it. |
| `elevation` | number (0-5) | `2` | Shadow level used when `shadow` is `true`. |
| `shadow` | boolean or string | `true` | `true` uses the shadow map for `elevation`; a CSS string is applied directly; `false` removes it. |
| `showBackButton` | boolean | `false` | Add an automatic `arrow_back` leading icon that navigates back. |
| `backButtonRoute` | string | `null` | The back icon goes to this route instead of `goBack()`. |
| `onBackPress` | function | `null` | Custom handler for the back icon (wins over the route). |
| `sticky` | boolean | `true` | `position: sticky; top: 0` so the bar stays on top. |
| `hideOnScroll` | boolean | `false` | Slide the bar up and fade it when scrolling down past `scrollThreshold`. |
| `scrollThreshold` | number | `100` | Scroll distance (px) at which `hideOnScroll` kicks in. |
| `margin`/`marginTop`/… | number or string | `0` | Outer spacing. |
| `padding`/`paddingTop`/… | number or string | left `4`, right `24`, others `0` | Inner padding of the bar. |
| `borderRadius` | number or string | `0` | Corner radius. |

These are the props specific to `AppBar`. It also accepts every [common prop](COMMON_PROPS.md); extra props are applied to the `header` element.

## Instance methods

- `setTitle(text)` — replace the title string in place.
- `setBackgroundColor(color)` — set a solid color, or a `gradient` string (detected automatically).
- `show()` — make the bar visible again.
- `hide()` — hide the bar (`display: none`).

## Examples

### Everyday example

```javascript
import { AppBar, Button, Icon } from "flet-box";

AppBar({
  title: "Inbox",
  leading: Icon({ name: "menu", onPress: () => console.log("open menu") }),
  actions: [
    Icon({ name: "search", onPress: () => console.log("search") }),
    Icon({ name: "notifications" }),
  ],
});
```

### Full example

```javascript
import { AppBar, Icon } from "flet-box";

AppBar({
  title: "Articles",
  showBackButton: true,
  onBackPress: () => console.log("back"),
  actions: [Icon({ name: "star_border" })],
  centerTitle: true,
  backgroundColor: "#eff6ff",
  elevation: 4,
  sticky: true,
});
```

## Notes

- The bar renders a hidden spacer in the right zone when `actions` is empty, so the title center stays aligned.
- `leading` and `actions` items that are not `HTMLElement`s are dropped — build them with widgets in the same call so they mount.
- The automatic back arrow wiring: tap → `onBackPress` if set, else `goTo(backButtonRoute)` if a route is set, else `goBack()`.
- `hideOnScroll` adds a `window` scroll listener; `_cleanup` removes it, so the bar is safe to tear down.
- In a `Scaffold`, a leading icon named `menu` (`.material-icons` with text `menu`) opens the embedded drawer automatically.

## Related widgets
- [Scaffold](Scaffold.md)
- [Icon](Icon.md)
- [BottomNavigation](BottomNavigation.md)

---

## Continue reading

- **Previous:** [AdaptiveScaffold](AdaptiveScaffold.md)
- **Next:** [Drawer](Drawer.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 8 · App navigation** (3 of 8).