# InstallButton

## Overview
`InstallButton` renders a `Button` wired to the browser's PWA install flow. It listens on `window` for `beforeinstallprompt`, keeps the deferred prompt, and reveals itself; pressing the button calls `prompt()` and awaits `userChoice`. If the user accepts — or the browser fires `appinstalled` — it calls `onInstalled` and hides itself again. The widget returns the underlying `<button>` element, so anything you can do to a `Button` you can do here.

## When to use
- Offering "Add to Home Screen" or desktop install for a progressive web app.
- You want the install affordance to appear only when the browser says installation is actually possible.
- Placing a floating install pill at the bottom of the screen without writing the prompt plumbing yourself.

## Import

```javascript
import { InstallButton } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { InstallButton } from "flet-box";

InstallButton({ onInstalled: () => console.log("installed") });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | string | `'📲 Install'` | Button label; forwarded to `Button`. |
| `variant` | `'filled'`, `'outlined'`, `'text'` | `'filled'` | Forwarded to `Button`. |
| `size` | `'small'`, `'medium'`, `'large'` | `'medium'` | Forwarded to `Button`. |
| `borderRadius` | number | `28` | Corner radius in pixels; forwarded to `Button`. |
| `padding` | number, `[v, h]`, or string | `'12px 24px'` | Forwarded to `Button`, overriding its size preset. |
| `bottom` | number | `20` | Pixel offset from the viewport bottom used in the button's fixed-position style block. |
| `backgroundColor` | Color | — | Maps to `Button`'s `bgColor`. |
| `color` | Color | — | Label and icon color. |
| `onInstalled` | `() => void` | — | Fires when the user accepts the prompt, and again when the browser reports `appinstalled`. |
| `onClick` | `() => void` | — | Fires on every press, after the install attempt (accepted, dismissed, or no prompt available). |

Every other prop is forwarded to [Button](Button.md).

These are the props specific to `InstallButton`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { InstallButton } from "flet-box";

InstallButton({
  text: "Install app",
  onInstalled: () => console.log("thanks for installing"),
  onClick: () => console.log("install button pressed"),
});
```

### Full example

```javascript
import { InstallButton, SnackBar, colors } from "flet-box";

InstallButton({
  text: "Get the app",
  variant: "filled",
  size: "large",
  backgroundColor: colors.primary,
  color: "#ffffff",
  borderRadius: 32,
  padding: "14px 28px",
  bottom: 24,
  onInstalled: () => SnackBar({ message: "Installed. Enjoy!", type: "success" }),
  onClick: () => console.log("install_click"),
});
```

## Notes

- Nothing is shown until the browser fires `beforeinstallprompt`. In browsers that never fire it — or once the app is already installed — the button stays out of sight.
- The handler calls `event.preventDefault()` on `beforeinstallprompt`, which suppresses the browser's own install banner so this button is the only affordance.
- The button is built with an inline style block: `position: fixed`, `bottom: {bottom}px`, centered with `left: 50%` plus `translateX(-50%)`, `z-index: 10000`, a drop shadow, and `opacity: 0` / `visibility: hidden` / `display: none`. Reveal and hide write those three properties directly on the element.
- The deferred prompt is consumed: it is set to `null` after the first `prompt()`, so a second press only runs `onClick`.
- `onInstalled` can fire twice for one install — once from the accepted `userChoice` and once from the `appinstalled` event.
- `onClick` runs regardless of whether an install prompt was available, so it is safe for analytics.
- Do not pass `onPress`. The remaining props are spread onto `Button` **after** the internal `onPress` handler, so your own `onPress` replaces it and the install prompt never fires. Use `onClick`.
- For the same reason, passing your own `style` prop replaces the internal style block wholesale and loses the fixed positioning and hidden state. Use the explicit props (`bottom`, `backgroundColor`, `borderRadius`, `padding`) instead.
- `_cleanup()` removes both window listeners and the button; the framework calls it when the widget is torn down.
- The browser only fires `beforeinstallprompt` for a served page (not `file://`) with a valid manifest and service worker.

## Related widgets
- [Button](Button.md)
- [FloatingActionButton](FloatingActionButton.md)
- [SnackBar](SnackBar.md)
- [AlertDialog](AlertDialog.md)
- [Icon](Icon.md)

---

## Continue reading

- **Previous:** [Carousel](Carousel.md)
- **Next:** [DataTable](DataTable.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 5 · Navigation and flows** (5 of 5).
