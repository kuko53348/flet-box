# Themes

## Overview
FletBox ships a built-in color system: `colors` is the palette of the current theme, `palettes` holds all named palettes, and the theme functions switch between light and dark, subscribe to changes, and follow the system preference. On top of that sit the accent presets — selectable hue families that paint `colors.primary`, its ink and its wash over whichever palette is active — and the theme functions carry them too. A `ThemeProvider` and the `useTheme()` hook wrap all of it for component-based apps.

## When to use
- Style widgets with semantic tokens (`colors.surface`, `colors.primary`, `colors.error`) instead of hard-coded hex values.
- Add a light/dark toggle that re-colors the whole app instantly.
- Follow the OS dark/light setting automatically.
- Let the reader pick the app's color — buttons, icons and plates and all — with [`ThemePicker`](../widget/ThemePicker.md) and `setAccent`.

## Import

```javascript
import {
  colors,
  setTheme,
  registerPalette,
  toggleTheme,
  subscribeTheme,
  ThemeProvider,
  registerAccent,
  setAccent,
  applyAccentPreference,
  getAccent,
  listAccents,
} from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `setTheme` | `setTheme('light' \| 'dark')` | `Record<string, string>` | Switch the active palette. |
| `registerPalette` | `registerPalette(themeName, palette)` | `Record<string, string>` | Merge brand tokens into a named palette and repaint the page. |
| `registerAccent` | `registerAccent({ id, label?, light, dark })` | `Accent \| null` | Add or replace one selectable accent. Each end of the pair is a hex or a five-stop ramp; `null` means the argument was unusable. |
| `setAccent` | `setAccent(id \| null)` | `Record<string, string>` | Lay an accent over the live palette and store the choice. `null`, or an id nothing registered, takes it back off. |
| `applyAccentPreference` | `applyAccentPreference(id)` | `string \| null` | Paint the app's own brand at boot, and only when the reader has never picked one. Never stores anything. |
| `getAccent` | `getAccent()` | `string \| null` | The accent id on screen, or `null` while the palette's own `primary` shows. |
| `listAccents` | `listAccents()` | `Accent[]` | Every selectable family, in registration order — `{ id, label, light, dark }`. |
| `listAccentRamps` | `listAccentRamps()` | `Array` | The same families with all five stops of each theme beside them, for a swatch that shows the whole ramp. |
| `getTheme` | `getTheme()` | `string` | The active theme name. |
| `toggleTheme` | `toggleTheme()` | `string` | Flip light/dark and return the new name. |
| `getColor` | `getColor(name, opacity?)` | `string` | Resolve a token (optionally with alpha). |
| `subscribeTheme` | `subscribeTheme(callback)` | `() => void` | Subscribe to theme changes; returns an unsubscribe function. |
| `applySystemTheme` | `applySystemTheme()` | `string` | Apply light/dark from the OS preference. |
| `watchSystemTheme` | `watchSystemTheme()` | `() => void` | Follow the OS preference live; returns an unsubscribe function. |
| `ThemeProvider` | `ThemeProvider({ children, theme? })` | `Widget` | Provide a theme (defaults to system) for a subtree. |
| `useTheme` | `useTheme()` | object | `{ colors, setTheme, getTheme, toggleTheme, getColor, applySystemTheme, setAccent, getAccent, listAccents }`. |

Plus the constants: `colors` (current palette) and `palettes` (all named palettes, keyed by name).

## Color tokens

Every token is available on `colors`:

- **Brand:** `primary`, `secondary`, `info`, `success`, `warning`, `danger`, `error`.
- **On a fill:** `onPrimary` — the ink the theme puts on a `primary` plate. Ask the theme for it; a literal `#ffffff` is a bug the moment the reader picks a pale accent.
- **Surfaces:** `background`, `surface`, `card`, `overlay`.
- **Text:** `text`, `textSecondary`, `textDisabled`, `divider`, `border`, `shadow`.
- **Tints:** `gray50` … `gray900`, plus the soft backgrounds `primaryBg`, `errorBg`, `successBg`, `warningBg`, `infoBg`.
- **Glass:** `glass` (the translucent surface) and `glassBorder` (its rim), meant to pair with `backdropFilter`. Light is white glass, dark is a slate pane with a light rim.

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

## Accent presets: `setAccent`

`registerPalette` says what a theme is. An **accent** is what the reader picks
inside it: one hue family painted over the palette's `primary`, its ink and its
wash, so every button, icon and selected plate on the screen moves together.
Twelve families ship (`listAccents()`), and each is a *pair* — the stop that hue
wears on a light page and the stop it wears on a dark one — which is why a
[`ThemePicker`](../widget/ThemePicker.md) swatch is split down the middle.

```javascript
import { ThemePicker, applyAccentPreference, listAccents } from "flet-box";

// At boot: the app's own brand, and only if the reader has never chosen.
applyAccentPreference("teal");

// In a settings sheet: the reader's choice, which paints and persists.
ThemePicker({
  accents: listAccents().filter((a) => ["teal", "blue", "rose", "orange"].includes(a.id)),
  size: 48,
  onChange: (id) => console.log("accent:", id),
});
```

What it does:

- **It is a layer, not a second palette.** The one repaint funnel lays the
  accent's `primary`, `onPrimary` and `primaryBg` over the theme's own tokens, so
  a toggle, an OS flip or a `setTheme` from anywhere keeps the choice instead of
  writing the brand back over it. The `--color-*` properties and the PWA status
  bar move with it because they read the same tokens.
- **`setAccent` is the reader's verb, `applyAccentPreference` is the app's.** The
  first stores `"fletbox-accent"`, so the picker opens on the answer the reader
  gave; the second paints without storing, so a first visit shows nothing
  ticked. An unknown id changes nothing, and `setAccent(null)` gives the palette
  its own brand back.
- **A family is measured before it ships.** Each pair clears the numbers a
  hand-built palette has to as well: white or near-black words on the accent at
  4.5:1, the accent as text on the page at 4.5:1 and as a glyph on a card at 3:1,
  page ink, secondary ink and the accent itself on its wash at 4.5:1, and the
  wash lifting off the background by 1.04 to 1.5. `#3b82f6` fails the first one —
  white words measure 3.15:1 on it — which is why an accent is a stop on a ramp
  and never the middle of one.
- **A brand the list lacks is registered, not typed.**
  `registerAccent` takes an `id`, a `label` and a `light`/`dark` pair: one hex
  each, and the wash and `colors.onPrimary` are derived, or a five-stop ramp whose
  stop 0 (light) and stop 1 (dark) are the ones painted. The call belongs in
  `src/database/themes.js`, beside the palette it feeds.

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
- Switching a theme also repaints the browser's own chrome: the `<meta name="theme-color">` the installed PWA takes for its status and navigation bars, and the root `color-scheme` that decides how the OS draws scrollbars and form controls. Both read the live palette, so an app that changes `colors.surface` changes its system bars with it — see [Mobile and platforms](../guides/mobile-and-platforms.md#the-browser-chrome-follows-the-theme).
- `colors.glass` is genuinely see-through: its contrast depends on whatever is behind it, so use it over photography or gradients with a scrim, and keep body copy off the most colourful part of the backdrop. The dark token is a dark pane, not white glass.
- `watchSystemTheme()` and `applySystemTheme()` read `prefers-color-scheme`; both return/need cleanup to release listeners.
- `subscribeTheme(callback)` fires with the new palette object — remember to unsubscribe when a feature is destroyed.

## Related pages
- [Device & environment](device.md) — previous chapter.
- [Markdown, code & HTML](markdown.md) — next chapter.
- [Colors and utilities guide](../guides/utilities.md) — palette walkthrough.
- [ThemePicker](../widget/ThemePicker.md) — the swatch grid that calls `setAccent`.

---

## Continue reading

- **Previous:** [Device & environment](device.md)
- **Next:** [Markdown, code & HTML](markdown.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (7 of 12).