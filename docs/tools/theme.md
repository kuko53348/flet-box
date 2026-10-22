# Themes

## Overview
FletBox ships a built-in color system: `colors` is the palette of the current theme, `palettes` holds all named palettes, and the theme functions switch between light and dark, subscribe to changes, and follow the system preference. A `ThemeProvider` and the `useTheme()` hook wrap them for component-based apps.

## When to use
- Style widgets with semantic tokens (`colors.surface`, `colors.primary`, `colors.error`) instead of hard-coded hex values.
- Add a light/dark toggle that re-colors the whole app instantly.
- Follow the OS dark/light setting automatically.

## Import

```javascript
import { colors, setTheme, registerPalette, toggleTheme, subscribeTheme, ThemeProvider } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `setTheme` | `setTheme('light' \| 'dark')` | `Record<string, string>` | Switch the active palette. |
| `registerPalette` | `registerPalette(themeName, palette)` | `Record<string, string>` | Merge brand tokens into a named palette and repaint the page. |
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

## Brand colors: `registerPalette`

A generated app ships a `src/database/themes.js` with its own `lightColors` and
`darkColors` objects. Assigning onto `colors` from that file changes nothing:
every widget reads the framework's live `colors`, and the next theme switch
re-applies a registered palette over whatever you wrote there. The call that
reaches the page is `registerPalette`:

```javascript
import { registerPalette } from "flet-box";
import { lightColors, darkColors } from "./database/themes.js";

registerPalette("light", lightColors);
registerPalette("dark", darkColors);
```

What it does:

- **Merges**, it does not replace. Tokens you leave out keep the framework's
  value, so a palette that only carries `primary` and `surface` stays legal.
- **Repaints when that palette is on screen.** If the name matches the active
  theme the tokens are applied, the `--color-*` custom properties are rewritten,
  and theme subscribers are notified. Registering the other theme only stores it
  for the next `setTheme`.
- **Never writes the theme preference.** Supplying your brand is not the user
  choosing light or dark; that is the one difference from `setTheme`.
- **A token the framework has never heard of is added to `colors`**, so
  `colors.brandSand` resolves in your own code. Widgets will still not use it —
  they read the tokens they know — and because the built-in palettes do not
  carry it, a custom key keeps its registered value across a theme switch unless
  you register it in both palettes.

Run it once, at startup, before the first screen renders. The generated app does
it at the bottom of `src/database/themes.js` — the same file that declares
`lightColors` and `darkColors` — so a project that edits its brand colors is
already correct without touching `src/app.js`.

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