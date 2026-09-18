# Themes

## Overview
FletBox ships a built-in color system: `colors` is the palette of the current theme, `palettes` holds all named palettes, and the theme functions switch between light and dark, subscribe to changes, and follow the system preference. A `ThemeProvider` and the `useTheme()` hook wrap them for component-based apps.

## When to use
- Style widgets with semantic tokens (`colors.surface`, `colors.primary`, `colors.error`) instead of hard-coded hex values.
- Add a light/dark toggle that re-colors the whole app instantly.
- Follow the OS dark/light setting automatically.

## Import

```javascript
import { colors, setTheme, toggleTheme, subscribeTheme, ThemeProvider } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `setTheme` | `setTheme('light' \| 'dark')` | `Record<string, string>` | Switch the active palette. |
| `getTheme` | `getTheme()` | `string` | The active theme name. |
| `toggleTheme` | `toggleTheme()` | `string` | Flip light/dark and return the new name. |
| `getColor` | `getColor(name, opacity?)` | `string` | Resolve a token (optionally with alpha). |
| `subscribeTheme` | `subscribeTheme(callback)` | `() => void` | Subscribe to theme changes; returns an unsubscribe function. |
| `applySystemTheme` | `applySystemTheme()` | `string` | Apply light/dark from the OS preference. |
| `watchSystemTheme` | `watchSystemTheme()` | `() => void` | Follow the OS preference live; returns an unsubscribe function. |
| `ThemeProvider` | `ThemeProvider({ children, theme? })` | `Widget` | Provide a theme (defaults to system) for a subtree. |
| `useTheme` | `useTheme()` | object | `{ colors, setTheme, getTheme, toggleTheme, getColor, applySystemTheme }`. |

Plus the constants: `colors` (current palette) and `palettes` (all named palettes, keyed by name).

## Color tokens

Every token is available on `colors`:

- **Brand:** `primary`, `secondary`, `info`, `success`, `warning`, `danger`, `error`.
- **Surfaces:** `background`, `surface`, `card`, `overlay`.
- **Text:** `text`, `textSecondary`, `textDisabled`, `divider`, `border`, `shadow`.
- **Tints:** `gray50` … `gray900`, plus the soft backgrounds `errorBg`, `successBg`, `warningBg`, `infoBg`.

The `dark` palette overrides the surface/text tokens; `gray*` and brand colors also shift to keep contrast. Read [the palette walkthrough](../guides/utilities.md) for usage patterns.

## Examples

### Everyday example

```javascript
import { Button, colors, toggleTheme } from "flet-box";

Button({
  text: "Switch theme",
  onPress: () => toggleTheme(),
});

const card = { backgroundColor: colors.surface, color: colors.text };
```

### Full example

```javascript
import { runApp, Container, Column, Button, Text, useTheme } from "flet-box";

const ThemedApp = () => {
  const theme = useTheme();

  return Container({
    backgroundColor: theme.colors.background,
    padding: 24,
    child: Column({
      gap: 12,
      children: [
        Text({ text: `Theme: ${theme.getTheme()}`, color: theme.colors.text }),
        Button({ text: "Toggle", onPress: () => theme.toggleTheme() }),
      ],
    }),
  });
};

runApp(ThemeProvider({ children: ThemedApp() }), "root");
```

## Notes

- The shared palette tokens are updated across all widgets when you switch themes; widgets referencing `colors.*` at build time pick up the active palette.
- `watchSystemTheme()` and `applySystemTheme()` read `prefers-color-scheme`; both return/need cleanup to release listeners.
- `subscribeTheme(callback)` fires with the new palette object — remember to unsubscribe when a feature is destroyed.

## Related pages
- [Device & environment](device.md) — previous chapter.
- [Markdown, code & HTML](markdown.md) — next chapter.
- [Colors and utilities guide](../guides/utilities.md) — palette walkthrough.

---

## Continue reading

- **Previous:** [Device & environment](device.md)
- **Next:** [Markdown, code & HTML](markdown.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (7 of 12).