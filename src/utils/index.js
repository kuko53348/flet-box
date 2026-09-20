// src/utils/index.js
/**
 * @module utils
 * @description
 * Central barrel file — re-exports every public utility from the `utils/`
 * directory so consumers can import from a single entry point:
 *
 * ```js
 * import { colors, toREM, addNavigation, TextInputValidator } from './utils';
 * ```
 *
 * Included utilities:
 * - **themes**         — color palette, theme switching, CSS variable sync
 * - **getWidgetProps** — read widget `_props` safely
 * - **syntaxHighlight** — JavaScript/FletBox tokenizer and HTML highlighter
 * - **markdownParser** — markdown → FletBox widget tree converter
 * - **visualEffects**  — CSS animations (stripes, shimmer, glow, pulse)
 * - **stackPosition**  — dataset-based absolute positioning for Stack children
 * - **units**          — px ↔ rem conversion helpers
 * - **navigation**     — tree-navigation mixin for widget objects
 * - **stopWebRefresh** — disables browser refresh gestures
 * - **TextInputValidator** — input filtering and XSS sanitization
 * - **mediaTime**      — time formatting for media players
 */
export {
  colors,
  setTheme,
  getTheme,
  toggleTheme,
  subscribeTheme,
  applySystemTheme,
  watchSystemTheme,
  getColor,
  palettes,
  ThemeProvider,
  useTheme,
} from "./themes.js";
export {
  getWidgetProps,
  getWidgetProp,
  stringifyWidgetProps,
} from "./getWidgetProps.js";
export {
  tokenize,
  generateHighlightedHtml,
  highlightColors,
} from "./syntaxHighlight.js";
export {
  markdownToWidgets,
  parseMarkdownToWidgets,
  parseInlineToWidgets,
  parseMarkdown,
  parseInlineMarkdown,
  escapeHtml,
} from "./markdownParser.js";
export {
  applyStripes,
  removeStripes,
  applyShimmer,
  applyGlow,
  applyIndeterminate,
  applyPulse,
  injectKeyframes,
} from "./visualEffects.js";
export { default as stackPosition } from "./stackPosition.js";
export { toREM, setBaseFontSize, toPX, getBaseFontSize } from "./units.js";
export { addNavigation } from "./navigation.js";
export { stopWebRefresh } from "./stopWebRefresh.js";
export { TextInputValidator } from "./TextInputValidator.js";
export {
  formatMediaTime,
  formatMediaTimeLong,
  getProgressPercent,
  percentToSeconds,
  formatMediaProgress,
} from "./mediaTime.js";
