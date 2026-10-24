// src/components/flet-box/utils/themes.js

// ========== DEFAULT COLORS (static, safe) ==========
const DEFAULT_COLORS = {
  // #6366f1 put white on 4.47:1 — a hair under AA for a button label. Two units
  // darker measures 4.55:1, the same indigo, and every brand button passes.
  primary: "#6165ef",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  // The readable greens and ambers, same rule as the red below: #10b981 and
  // #f59e0b carry white at 2.54:1 and 2.15:1, so they are dots and borders. These
  // are the ones a person can read or press — 5.48:1 and 5.02:1, both directions.
  successStrong: "#047857",
  warningStrong: "#b45309",
  // #ef4444 is the error *signal*: a badge, an icon, a border. As words on a
  // white page it measures 3.76:1, which is not AA, and white on it is 3.76 too.
  danger: "#ef4444",
  // The red a person can read and press: 6.47:1 against white in both directions,
  // so it is legal as the label of a delete and as the plate under white words.
  dangerStrong: "#b91c1c",
  // `*Strong` answers "what may I write words in?" and its answer moves with the
  // theme; `*Plate` answers "what may I fill, with white words on it?" and stays
  // deep everywhere. On a light page the two are the same red — #b91c1c reads at
  // 6.47:1 and carries white at 6.47:1 — so the light values below coincide with
  // the Strong ones on purpose. On a dark page they part: the readable red is
  // light, the plate behind white has to be dark.
  successPlate: "#047857",
  warningPlate: "#b45309",
  dangerPlate: "#b91c1c",
  // `info` had no readable sibling and it showed: a filled chip, a selected page
  // or a tooltip that asks for `colors.info` paints white on #3b82f6, which is
  // 3.68:1. This is the blue that carries the label — 6.70:1 in both directions.
  infoStrong: "#1d4ed8",
  infoPlate: "#1d4ed8",
  info: "#3b82f6",
  background: "#ffffff",
  surface: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  textSecondary: "#64748b",
  textDisabled: "#94a3b8",
  // What to write on a `primary` fill. White measures 4.55:1 on #6165ef.
  onPrimary: "#ffffff",
  // What to write on a `secondary` fill (badges, tooltips). Neutral secondary is
  // a dark plate in both themes, so its ink is white as well.
  onSecondary: "#ffffff",
  // The soft brand tint a card or icon chip uses instead of `primary + '15'`.
  primaryBg: "#eef2ff",
  // Glass is a translucent surface meant to sit over content with
  // `backdropFilter`. It is a token and not an `rgba()` in the app for the same
  // reason as every other color: the theme has to be able to move it, and the
  // app's clean-UI gate rejects a hand-written literal (`RAW_COLOR`).
  glass: "rgba(255, 255, 255, 0.66)",
  glassBorder: "rgba(255, 255, 255, 0.75)",
  border: "#e2e8f0",
  gray50: "#f8fafc",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
  gray300: "#cbd5e1",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1e293b",
  gray900: "#0f172a",
  overlay: "rgba(0, 0, 0, 0.4)",
  shadow: "rgba(0, 0, 0, 0.1)",
  divider: "#eeeeee",
  error: "#ff3b30",
  errorBg: "#ffe5e5",
  successBg: "#e5f5e5",
  warningBg: "#fff5e5",
  infoBg: "#e5f5ff",
};

// ========== EXPORT colors (always defined) ==========
export let colors = { ...DEFAULT_COLORS };

// ========== PALETTES ==========
export const palettes = {
  light: {
    // Chakra's neutral scale: a white page, #09090B ink, #E4E4E7 hairlines,
    // #FAFAFA panels and a near-black solid for everything selected or primary.
    // `primary` is the plate under a checked box, an active page, a filled chip
    // and the slider fill, so it has to be dark enough to carry its label:
    // #18181B measures 17.3:1 with white, and reads as ink on the page too.
    primary: "#18181b",
    secondary: "#52525b",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    dangerStrong: "#b91c1c",
    successStrong: "#047857",
    warningStrong: "#b45309",
    // On a white page the readable red and the plate under white words are the
    // same red, so the plates repeat the Strong values rather than inventing a
    // fourth tone that no one would notice the difference from.
    dangerPlate: "#b91c1c",
    successPlate: "#047857",
    warningPlate: "#b45309",
    infoStrong: "#1d4ed8",
    infoPlate: "#1d4ed8",
    info: "#3b82f6",
    background: "#ffffff",
    surface: "#fafafa",
    card: "#ffffff",
    text: "#09090b",
    // What to write on a `primary` fill. This is the theme's answer, not the
    // widget's: `#18181B` is dark, so its ink is white.
    onPrimary: "#ffffff",
    // Badges and tooltips sit on `secondary` (#52525B), dark enough for white.
    onSecondary: "#ffffff",
    // The soft neutral tint a card or icon chip uses instead of `primary + '15'`.
    primaryBg: "#f4f4f5",
    glass: "rgba(255, 255, 255, 0.78)",
    glassBorder: "rgba(9, 9, 11, 0.10)",
    textSecondary: "#52525b",
    textDisabled: "#a1a1aa",
    border: "#e4e4e7",
    gray50: "#fafafa",
    gray100: "#f4f4f5",
    gray200: "#e4e4e7",
    gray300: "#d4d4d8",
    gray400: "#a1a1aa",
    gray500: "#71717a",
    gray600: "#52525b",
    gray700: "#3f3f46",
    gray800: "#27272a",
    gray900: "#18181b",
    divider: "#e4e4e7",
    overlay: "rgba(0, 0, 0, 0.5)",
    shadow: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    // The same zinc ladder read from the other end: #09090B page, #18181B cards
    // and bars, #27272A hairlines, #A1A1AA secondary words. Every surface token
    // is a true grey, so any widget that paints `surface`, `card`, `gray*` or
    // `border` lands on the same black/grey/white hierarchy; only the semantic
    // signals below keep a hue.
    //
    // `primary` is the inverse of the light theme: a near-white solid whose
    // labels are the page ink (#09090B on #FAFAFA = 17.4:1). That is the same
    // solid Chakra paints in dark mode, and it only works because a widget that
    // writes on a primary fill asks the theme — `colors.onPrimary` — instead of
    // assuming white.
    primary: "#fafafa",
    secondary: "#71717a",
    success: "#10b981",
    warning: "#fbbf24",
    danger: "#f87171",
    // On this page "the tone a person can read" is the light one, because the
    // page is dark: #fca5a5 measures 9.33:1 on a card, 10.48:1 on the page, and
    // the base signal #f87171 is already readable at 6.40:1. `*Strong` keeps its
    // promise here — the red you may write words in — it just points the other
    // way down the ladder than it does on a white page.
    dangerStrong: "#fca5a5",
    successStrong: "#34d399",
    warningStrong: "#fcd34d",
    // The deep plates are the tokens that used to hide inside `*Strong`. A badge
    // or a completed step is a fill carrying white words, which on this page means
    // going dark: white on #7f1d1d is 10.02:1, on #14532d 9.11:1, on #78350f 9.07:1.
    dangerPlate: "#7f1d1d",
    successPlate: "#14532d",
    warningPlate: "#78350f",
    // The same pair for the blue: #93c5fd is the word a person reads on this page
    // (11.03:1), #1e40af is the plate a white label sits on (8.72:1).
    infoStrong: "#93c5fd",
    infoPlate: "#1e40af",
    // The alert tints are a *fill*, and a pale pink fill is the wrong answer on a
    // black page: `#fafafa` on `#ffe5e5` measures 1.14:1, so an error card that
    // used to be painted from the boot value went unreadable in dark mode. These
    // are the same deep tints a generated app's own palette declares, so an app
    // that themes its alert the framework way and one that themes it by hand land
    // on one number: the Strong ink of that hue sits on them at 6.04–10.51:1.
    error: "#f87171",
    errorBg: "#3b1113",
    successBg: "#0c2f22",
    warningBg: "#33230a",
    infoBg: "#12263c",
    info: "#60a5fa",
    background: "#09090b",
    surface: "#18181b",
    card: "#18181b",
    text: "#fafafa",
    onPrimary: "#09090b",
    // `secondary` stays a mid grey so badges and tooltips can carry white
    // (4.6:1 on #71717A) while it still reads as ink on the surface.
    onSecondary: "#ffffff",
    primaryBg: "#27272a",
    // A dark pane with a light rim, at the same alpha as the light token.
    glass: "rgba(24, 24, 27, 0.72)",
    glassBorder: "rgba(250, 250, 250, 0.12)",
    textSecondary: "#a1a1aa",
    textDisabled: "#52525b",
    border: "#27272a",
    gray50: "#111111",
    gray100: "#1f1f1f",
    gray200: "#27272a",
    gray300: "#3f3f46",
    gray400: "#52525b",
    gray500: "#71717a",
    gray600: "#a1a1aa",
    gray700: "#d4d4d8",
    gray800: "#e4e4e7",
    gray900: "#fafafa",
    divider: "#27272a",
    overlay: "rgba(0, 0, 0, 0.72)",
    shadow: "rgba(0, 0, 0, 0.6)",
  },
};

// ========== SUBSCRIBERS ==========
const themeSubscribers = [];

/**
 * Subscribes a callback to theme change events.
 * @param {function(Object): void} callback - Function called with the new colors object on every theme change.
 * @returns {function(): void} Unsubscribe function — call it to remove the listener.
 * @example
 * const unsub = subscribeTheme((colors) => console.log(colors.primary));
 * unsub(); // stop listening
 */
export const subscribeTheme = (callback) => {
  if (typeof callback === "function") {
    themeSubscribers.push(callback);
  }
  return () => {
    const index = themeSubscribers.indexOf(callback);
    if (index > -1) themeSubscribers.splice(index, 1);
  };
};

/**
 * Notifies all registered theme subscribers of a color change.
 * Errors thrown by individual subscribers are caught and warned.
 * @private
 */
const notifyThemeChange = () => {
  themeSubscribers.forEach((cb) => {
    try {
      cb(colors);
    } catch (e) {
      console.warn("Theme subscriber error:", e);
    }
  });
};

// ========== THEME FUNCTIONS ==========
/**
 * Copies a registered palette onto the live `colors` object and refreshes the
 * CSS custom properties. Shared by `setTheme` and `registerPalette`; it does not
 * persist anything, because "this is the palette now" and "the user picked this
 * theme" are two different sentences.
 * @param {string} themeName
 * @returns {Object} the updated `colors` object
 */
const applyPalette = (themeName) => {
  const palette = palettes[themeName];
  if (palette) {
    Object.keys(palette).forEach((key) => {
      if (colors.hasOwnProperty(key)) {
        colors[key] = palette[key];
      }
    });
  }

  // Update CSS variables
  try {
    const root = document.documentElement;
    Object.keys(colors).forEach((key) => {
      root.style.setProperty(`--color-${key}`, colors[key]);
    });
  } catch (e) {
    // Silently fail in non-browser environments
  }

  notifyThemeChange();
  return colors;
};

/**
 * Applies a named theme palette to the global `colors` object, updates all
 * CSS custom properties on `:root`, persists the choice to `localStorage`,
 * and notifies all subscribers.
 * @param {string} themeName - Name of the palette to apply (e.g. `"light"` or `"dark"`).
 * @returns {Object} The updated `colors` object after the theme is applied.
 */
export const setTheme = (themeName) => {
  // Persist before repainting: applyPalette notifies subscribers synchronously,
  // and a subscriber that reads `getTheme()` while it rebuilds (a toggle button
  // labelling itself, a theme-aware screen) has to see the theme it is being
  // rebuilt for, not the one being replaced.
  try {
    localStorage.setItem("fletbox-theme", themeName);
  } catch (e) {
    // Silently fail
  }

  applyPalette(themeName);
  return colors;
};

/**
 * Merges an app's own tokens into a named palette and, when that palette is the
 * one currently on screen, repaints with it. An app that only declares a
 * `colors` object changes nothing: every widget reads the framework's live
 * `colors`, so the tokens have to be registered to reach the page.
 *
 * Unlike `setTheme` this never writes the theme preference — an app supplying
 * its brand colors is not the user choosing light or dark.
 *
 * @param {string} themeName - Palette to extend, usually `"light"` or `"dark"`.
 * @param {Object} palette - Token names to override; unknown keys are ignored.
 * @returns {Object} The registered palette.
 */
export const registerPalette = (themeName, palette) => {
  if (!themeName || !palette || typeof palette !== "object") return palettes;
  // A token the framework never heard of is seeded onto `colors` first:
  // applyPalette only copies keys that already exist — that filter is what stops
  // a palette which leaves one out (both built-ins do) from blanking it.
  Object.keys(palette).forEach((key) => {
    if (!colors.hasOwnProperty(key)) colors[key] = palette[key];
  });
  palettes[themeName] = { ...(palettes[themeName] || {}), ...palette };
  if (getTheme() === themeName) applyPalette(themeName);
  return palettes[themeName];
};

/**
 * Returns the currently active theme name.
 * Reads from `localStorage` first; falls back to the OS
 * `prefers-color-scheme` media query; defaults to `"light"`.
 * @returns {"light"|"dark"} The active theme name.
 */
export const getTheme = () => {
  try {
    const savedTheme = localStorage.getItem("fletbox-theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch (e) {
    return "light";
  }
};

/**
 * Switches between `"light"` and `"dark"` themes.
 * @returns {"light"|"dark"} The new theme name after toggling.
 */
export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
  return newTheme;
};

/**
 * Applies the OS-level color scheme preference only when no theme has been
 * explicitly saved to `localStorage`.
 * @returns {"light"|"dark"} The theme that was applied or already saved.
 */
export const applySystemTheme = () => {
  try {
    const savedTheme = localStorage.getItem("fletbox-theme");
    if (!savedTheme) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      // applyPalette, not setTheme: painting what the OS asked for is not the
      // reader choosing a theme. Persisting here would pin the first answer and
      // make watchSystemTheme's own savedTheme check bail forever.
      applyPalette(systemTheme);
      return systemTheme;
    }
    return savedTheme;
  } catch (e) {
    return "light";
  }
};

/**
 * Registers a listener on the OS `prefers-color-scheme` media query and
 * automatically calls {@link setTheme} whenever the system preference changes,
 * but only when no theme has been explicitly saved to `localStorage`.
 * @returns {function(): void} Cleanup function that removes the media-query listener.
 */
export const watchSystemTheme = () => {
  try {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const savedTheme = localStorage.getItem("fletbox-theme");
      if (!savedTheme) {
        // Same rule as applySystemTheme: the OS changing its mind is not the
        // reader choosing a theme, so it must not be written down as one.
        applyPalette(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  } catch (e) {
    return () => {};
  }
};

/**
 * Resolves a color by name from the active palette and optionally applies an
 * alpha channel to hex values.
 * @param {string} colorName - Key in the `colors` map (e.g. `"primary"`, `"border"`) or a raw CSS color string.
 * @param {number} [opacity=1] - Alpha value between 0 and 1. Ignored for non-hex values.
 * @returns {string} CSS color string (hex or `rgba(...)`).
 * @example
 * getColor("primary")       // "#6366f1"
 * getColor("primary", 0.5)  // "rgba(99, 102, 241, 0.5)"
 */
export const getColor = (colorName, opacity = 1) => {
  const color = colors[colorName] || colorName;
  if (opacity === 1) return color;

  if (typeof color === "string" && color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// ========== COMPONENTS ==========
/**
 * Thin wrapper component that applies a theme on render.
 * Pass `theme` to force a specific palette; omit it to leave the active theme unchanged.
 * @param {Object} props
 * @param {*} props.children - Child content to render.
 * @param {string|null} [props.theme=null] - Theme name to apply (`"light"` or `"dark"`).
 * @returns {*} The `children` value, unchanged.
 */
export const ThemeProvider = ({ children, theme = null }) => {
  if (theme) setTheme(theme);
  return children;
};

/**
 * Returns a hook-like object containing the full theme API.
 * Useful for accessing the active colors and theme utilities from any component.
 * @returns {{
 *   colors: Object,
 *   setTheme: function,
 *   getTheme: function,
 *   toggleTheme: function,
 *   getColor: function,
 *   applySystemTheme: function
 * }}
 */
export const useTheme = () => {
  return {
    colors,
    setTheme,
    getTheme,
    toggleTheme,
    getColor,
    applySystemTheme,
  };
};

// ========== INITIALIZATION (safe) ==========
const initTheme = () => {
  try {
    const savedTheme = localStorage.getItem("fletbox-theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      applyPalette(savedTheme);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      // applyPalette, not setTheme: this runs the first time the module is
      // imported, so persisting here wrote the OS answer down as a reader
      // choice — and every later watcher then refused to follow the OS.
      applyPalette(systemTheme);
    }
    watchSystemTheme();
  } catch (e) {
    // If it fails, use default values
    console.warn("Theme initialization failed, using defaults");
  }
};

// Initialize only in browser environment
if (typeof window !== "undefined" && typeof document !== "undefined") {
  initTheme();
}

export default {
  colors,
  palettes,
  setTheme,
  getTheme,
  toggleTheme,
  getColor,
  subscribeTheme,
  applySystemTheme,
  watchSystemTheme,
  ThemeProvider,
  useTheme,
};
