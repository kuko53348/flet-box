# Tabs

## Overview
`Tabs` renders an in-page tab switcher: a row of tab buttons (`role="tab"`), one mounted `child` pane per tab, and several visual `variant`s — `underline`, `filled`, `slider` (a floating indicator that slides behind the active tab), and `pills`. Tabs accept plain strings or objects (`{ label, icon?, badge? }`), and `badges` can also be supplied as a separate array. Clicking (or pressing `Enter`/`Space`) switches the pane and fires `onChange(index)`.

## When to use
- Switch between panes inside one screen without leaving the page.
- Segmented control / pill navigation for a settings page.

## Import

```javascript
import { Tabs, Text } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Tabs, Text } from "flet-box";

Tabs({
  tabs: ["Info", "Activity"],
  children: [
    Text({ text: "Account info" }),
    Text({ text: "Recent activity" }),
  ],
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tabs` | array | `[]` | Labels: strings or `{ label, icon?, badge? }` objects. |
| `children` | array | `[]` | One pane per tab; the active pane is mounted at `children[activeIndex]`. |
| `activeIndex` | number | `0` | The active tab (initial value; also the settable live value). |
| `onChange` | function | — | Fired with the new index when the tab changes. |
| `variant` | `'underline'`/`'filled'`/`'slider'`/`'pills'` | `'underline'` | Visual treatment of the tab bar. |
| `size` | `'small'`/`'medium'`/`'large'` | `'medium'` | Font, padding, icon, and height presets. |
| `textColor` | Color | `colors.text` | Inactive label/icon color. |
| `activeTextColor` | Color | `colors.white` | Active label/icon color. |
| `bgColor` | Color | `colors.gray100` | Bar background for `slider`/`filled` variants. |
| `buttonColor` | Color | `colors.secondary` | Background of the `slider` indicator and `pills`. |
| `dividerColor` | Color | `colors.border` | Bottom border for the `underline` variant (when `showDivider`). |
| `fullWidth` | boolean | `true` | Tabs share the full width; otherwise they hug their content. |
| `showDivider` | boolean | `true` | Bottom divider under an `underline` bar. |
| `showIcon` | boolean | `false` | Show the per-tab `icon`. |
| `iconPosition` | `'left'`/`'right'`/`'top'`/`'bottom'` | `'left'` | Where the icon sits: `'left'` places it before the label; any other value places it after. |
| `iconSize` | number | `18` | Icon size in pixels. |
| `badges` | array | `[]` | Badge values per tab (`badges[i]`), or set them inline via `{ badge }`. |
| `alignment` | `'left'`/`'center'`/`'right'` | `'left'` | Accepted for API compatibility; currently has no visual effect. |
| `color` | Color | `colors.primary` | Accepted for API compatibility; active styling uses `activeTextColor`/`buttonColor` instead. |

These are the props specific to `Tabs`. It also accepts every [common prop](COMMON_PROPS.md).

## Instance methods

- `activeIndex` — getter/setter property: assign a new index to switch tabs and fire `onChange`.
- `setActiveTab(index)` — same as writing `activeIndex`.

## Examples

### Everyday example

```javascript
import { Tabs, Text } from "flet-box";

Tabs({
  variant: "pills",
  tabs: ["All", "Active", "Done"],
  children: [
    Text({ text: "Everything" }),
    Text({ text: "In progress" }),
    Text({ text: "Completed" }),
  ],
});
```

### Full example

```javascript
import { Tabs, Text } from "flet-box";

const tabs = Tabs({
  variant: "slider",
  tabs: [
    { label: "Inbox", icon: "mail", badge: 3 },
    { label: "Archive", icon: "archive" },
  ],
  children: [Text({ text: "Inbox pane" }), Text({ text: "Archive pane" })],
  showIcon: true,
  bgColor: "#f8fafc",
  buttonColor: "#2563eb",
  activeTextColor: "#ffffff",
  onChange: (index) => console.log("tab", index),
});

tabs.setActiveTab(1); // switch to the second tab
```

## Notes

- Only the active pane is mounted in the DOM at a time — switching replaces the pane content.
- The `slider` indicator animates its width/position (`transform`), and a `ResizeObserver` + window `resize` listener keep it aligned. All listeners and the indicator timer are released by `_cleanup`.
- `badge` renders a small red pill after the label (from `colors.danger`, white text). Badges take the inline `{ badge }` value first, then the `badges` array.
- Each tab is a real accessibility target: `role="tab"`, `aria-selected`, `tabIndex: 0`, keyboard activation with `Enter`/`Space`.
- `children`/`tabs` length mismatch: panes are mounted by index; if there is no pane for the active index, the pane area stays empty.

## Related widgets
- [BottomNavigation](BottomNavigation.md)
- [Badge](Badge.md)
- [Icon](Icon.md)

---

## Continue reading

- **Previous:** [BottomNavigation](BottomNavigation.md)
- **Next:** [CollapsibleSideBar](CollapsibleSideBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 8 · App navigation** (7 of 8).