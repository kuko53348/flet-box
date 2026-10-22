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
  info: "#3b82f6",
  background: "#ffffff",
  surface: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  textSecondary: "#64748b",
  textDisabled: "#94a3b8",
  // What to write on a `primary` fill. White measures 4.55:1 on #6165ef.
  onPrimary: "#ffffff",
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
    primary: "#00A5FF",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    dangerStrong: "#b91c1c",
    successStrong: "#047857",
    warningStrong: "#b45309",
    info: "#3b82f6",
    background: "#ffffff",
    surface: "#f8fafc",
    card: "#ffffff",
    text: "#0f172a",
    // #00A5FF is a light fill: white on it measures 2.68:1 and fails even the
    // large-text line, so text on this brand color is the dark ink (6.65:1).
    onPrimary: "#0f172a",
    primaryBg: "#e6f9ff",
    glass: "rgba(255, 255, 255, 0.66)",
    glassBorder: "rgba(255, 255, 255, 0.75)",
    textSecondary: "#64748b",
    textDisabled: "#94a3b8",
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
  },
  dark: {
    primary: "#00AFBC",
    secondary: "#a78bfa",
    success: "#10b981",
    warning: "#fbbf24",
    danger: "#f87171",
    // On this page a light red is the readable one (6.45:1 as words); the plate a
    // person presses goes the other way, dark enough for the page's own ink:
    // #f1f5f9 on #7f1d1d measures 9.15:1.
    dangerStrong: "#7f1d1d",
    // Same convention in the dark theme: the light tone is the readable word, the
    // deep one is the plate the page's own ink sits on (8.32:1 and 8.28:1).
    successStrong: "#14532d",
    warningStrong: "#78350f",
    info: "#60a5fa",
    background: "#0f172a",
    surface: "#1e293b",
    card: "#1e293b",
    text: "#f1f5f9",
    // #00AFBC is a light fill too: white on it is 2.67:1. Dark ink reads 6.68:1.
    onPrimary: "#0f172a",
    primaryBg: "#0b3b41",
    // Slate at the same alpha as the light token: on this page the frost is a
    // dark pane with a light rim, not a white one.
    glass: "rgba(30, 41, 59, 0.66)",
    glassBorder: "rgba(226, 232, 240, 0.22)",
    textSecondary: "#94a3b8",
    textDisabled: "#64748b",
    border: "#334155",
    gray50: "#1e293b",
    gray100: "#334155",
    gray200: "#475569",
    gray300: "#64748b",
    gray400: "#94a3b8",
    gray500: "#cbd5e1",
    gray600: "#e2e8f0",
    gray700: "#f1f5f9",
    gray800: "#f8fafc",
    gray900: "#ffffff",
    overlay: "rgba(0, 0, 0, 0.6)",
    shadow: "rgba(0, 0, 0, 0.3)",
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
  applyPalette(themeName);

  // Save preference
  try {
    localStorage.setItem("fletbox-theme", themeName);
  } catch (e) {
    // Silently fail
  }

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
