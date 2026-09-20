// tools/color.js

/**
 * Fluent color manipulation utility.
 *
 * Parses any common CSS color format (hex, rgb/rgba, hsl/hsla, or a small set of
 * named colors), stores the result as normalized RGBA components, and exposes a
 * chainable API for common transformations.
 *
 * Usage pattern: `color(value)` returns a `Color` instance. Chain methods as needed,
 * then call `.hex()`, `.rgb()`, or `.rgba()` to get a CSS string.
 *
 * @example
 * color('#3498db').lighten(20).rgba()
 * // "rgba(91, 174, 226, 1)"
 *
 * color('hsl(200, 60%, 50%)').darken(10).hex()
 * // "#2980b9" (approximately)
 */

/**
 * @class Color
 * @description Internal color model. Prefer the `color()` factory export over
 * instantiating this class directly.
 */
class Color {
  /**
   * @param {string} color - Any CSS color string: hex (`#rgb`, `#rrggbb`),
   *   `rgb(r,g,b)`, `rgba(r,g,b,a)`, `hsl(h,s%,l%)`, `hsla(h,s%,l%,a)`,
   *   or a named color (see `parseNamed`).
   */
  constructor(color) {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 1;
    this.parse(color);
  }

  /**
   * Detect the format of `color` and dispatch to the appropriate parser.
   *
   * @param {string} color - CSS color string
   * @returns {Color} `this` for chaining
   */
  parse(color) {
    if (color.startsWith("#")) {
      this.parseHex(color);
    } else if (color.startsWith("rgb")) {
      this.parseRgb(color);
    } else if (color.startsWith("hsl")) {
      this.parseHsl(color);
    } else {
      this.parseNamed(color);
    }
    return this;
  }

  /**
   * Parse a hex color string into RGB components.
   *
   * Handles both shorthand (`#rgb`) and full (`#rrggbb`) formats.
   * Alpha channel is not parsed from hex (use rgba/hsla for that).
   *
   * @param {string} hex - Hex color string including the leading `#`
   */
  parseHex(hex) {
    hex = hex.slice(1);
    if (hex.length === 3) {
      // Expand shorthand: #abc → #aabbcc
      this.r = parseInt(hex[0] + hex[0], 16);
      this.g = parseInt(hex[1] + hex[1], 16);
      this.b = parseInt(hex[2] + hex[2], 16);
    } else {
      this.r = parseInt(hex.slice(0, 2), 16);
      this.g = parseInt(hex.slice(2, 4), 16);
      this.b = parseInt(hex.slice(4, 6), 16);
    }
  }

  /**
   * Parse an `rgb()` or `rgba()` CSS color string.
   *
   * @param {string} rgb - e.g. `"rgb(255, 128, 0)"` or `"rgba(255, 128, 0, 0.5)"`
   */
  parseRgb(rgb) {
    const match = rgb.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
    );
    if (match) {
      this.r = parseInt(match[1]);
      this.g = parseInt(match[2]);
      this.b = parseInt(match[3]);
      this.a = match[4] ? parseFloat(match[4]) : 1;
    }
  }

  /**
   * Parse an `hsl()` or `hsla()` CSS color string, converting to RGB.
   *
   * Uses the standard hue-to-RGB algorithm. Hue is normalized to [0, 1],
   * saturation and lightness to [0, 1].
   *
   * @param {string} hsl - e.g. `"hsl(200, 60%, 40%)"` or `"hsla(200, 60%, 40%, 0.8)"`
   */
  parseHsl(hsl) {
    const match = hsl.match(
      /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/,
    );
    if (match) {
      const h = parseInt(match[1]) / 360;
      const s = parseInt(match[2]) / 100;
      const l = parseInt(match[3]) / 100;
      this.a = match[4] ? parseFloat(match[4]) : 1;

      let r, g, b;
      if (s === 0) {
        // Achromatic: all channels are equal to lightness
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      this.r = Math.round(r * 255);
      this.g = Math.round(g * 255);
      this.b = Math.round(b * 255);
    }
  }

  /**
   * Parse a named CSS color by mapping it to its hex equivalent.
   *
   * Only a small subset of common names is supported. Unknown names are silently
   * ignored (the instance keeps its previous RGB values).
   *
   * @param {string} name - Lowercase color name (e.g. `"red"`, `"white"`, `"gray"`)
   */
  parseNamed(name) {
    const colors = {
      black: "#000000",
      white: "#ffffff",
      red: "#ff0000",
      green: "#00ff00",
      blue: "#0000ff",
      yellow: "#ffff00",
      cyan: "#00ffff",
      magenta: "#ff00ff",
      gray: "#808080",
      darkgray: "#a9a9a9",
      lightgray: "#d3d3d3",
    };
    if (colors[name]) {
      this.parseHex(colors[name]);
    }
  }

  /**
   * Serialize the color as a hex string.
   *
   * Alpha is not included — use `.rgba()` when you need transparency.
   *
   * @returns {string} Lowercase hex color (e.g. `"#3498db"`)
   */
  hex() {
    const toHex = (n) => {
      const hex = n.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
  }

  /**
   * Serialize the color as an `rgb()` CSS string.
   *
   * Alpha is not included. Use `.rgba()` for translucent colors.
   *
   * @returns {string} e.g. `"rgb(52, 152, 219)"`
   */
  rgb() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  /**
   * Serialize the color as an `rgba()` CSS string including the alpha channel.
   *
   * @returns {string} e.g. `"rgba(52, 152, 219, 1)"`
   */
  rgba() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  /**
   * Lighten the color by blending it toward white.
   *
   * Each channel is moved toward 255 by `percent`% of the remaining distance.
   * Mutates this instance and returns `this` for chaining.
   *
   * @param {number} percent - Lightening amount as a percentage (0–100)
   * @returns {Color} `this` for chaining
   * @example color('#336699').lighten(30).hex() // lighter blue
   */
  lighten(percent) {
    const amount = percent / 100;
    this.r = Math.min(255, Math.round(this.r + (255 - this.r) * amount));
    this.g = Math.min(255, Math.round(this.g + (255 - this.g) * amount));
    this.b = Math.min(255, Math.round(this.b + (255 - this.b) * amount));
    return this;
  }

  /**
   * Darken the color by scaling each channel toward zero.
   *
   * Each channel is multiplied by `(1 - percent/100)`.
   * Mutates this instance and returns `this` for chaining.
   *
   * @param {number} percent - Darkening amount as a percentage (0–100)
   * @returns {Color} `this` for chaining
   * @example color('#3498db').darken(20).hex() // darker blue
   */
  darken(percent) {
    const amount = percent / 100;
    this.r = Math.max(0, Math.round(this.r * (1 - amount)));
    this.g = Math.max(0, Math.round(this.g * (1 - amount)));
    this.b = Math.max(0, Math.round(this.b * (1 - amount)));
    return this;
  }

  /**
   * Set the alpha (opacity) channel.
   *
   * Clamps `value` to the [0, 1] range.
   * Mutates this instance and returns `this` for chaining.
   *
   * @param {number} value - Alpha value between 0 (fully transparent) and 1 (fully opaque)
   * @returns {Color} `this` for chaining
   * @example color('#000').alpha(0.5).rgba() // "rgba(0, 0, 0, 0.5)"
   */
  alpha(value) {
    this.a = Math.min(1, Math.max(0, value));
    return this;
  }

  /**
   * Determine whether the color is perceptually dark.
   *
   * Uses the ITU-R BT.601 luma formula (weighted RGB) which is a standard
   * way to approximate human-perceived brightness. A brightness below 128
   * is considered dark.
   *
   * @returns {boolean} `true` if the color is perceptually dark
   */
  isDark() {
    const brightness = (this.r * 299 + this.g * 587 + this.b * 114) / 1000;
    return brightness < 128;
  }

  /**
   * Determine whether the color is perceptually light.
   *
   * The inverse of `isDark()`.
   *
   * @returns {boolean} `true` if the color is perceptually light
   */
  isLight() {
    return !this.isDark();
  }

  /**
   * Get a high-contrast text color suitable for overlay on this background.
   *
   * Returns black on light backgrounds and white on dark backgrounds — useful
   * for automatically picking readable label colors.
   *
   * @returns {"#ffffff"|"#000000"} High-contrast color string
   * @example
   * const bg = color('#3498db');
   * element.style.color = bg.contrast(); // "#ffffff" (white on this mid-blue)
   */
  contrast() {
    return this.isDark() ? "#ffffff" : "#000000";
  }

  /**
   * Invert the color by complementing each RGB channel.
   *
   * Each channel is replaced with `255 - channel`. The alpha value is unchanged.
   * Mutates this instance and returns `this` for chaining.
   *
   * @returns {Color} `this` for chaining
   * @example color('#ff0000').complement().hex() // "#00ffff" (cyan)
   */
  complement() {
    this.r = 255 - this.r;
    this.g = 255 - this.g;
    this.b = 255 - this.b;
    return this;
  }
}

/**
 * Create a new `Color` instance from any CSS color string.
 *
 * This is the primary entry point for the color API. The returned object
 * exposes a fluent, chainable interface for parsing, transforming, and
 * serializing colors.
 *
 * @param {string} value - Any CSS color: hex, rgb/rgba, hsl/hsla, or a named color
 * @returns {Color} Chainable color instance
 *
 * @example
 * color('#e74c3c').darken(10).alpha(0.9).rgba()
 * // "rgba(195, 58, 44, 0.9)"
 *
 * color('hsl(200, 60%, 50%)').complement().hex()
 */
export const color = (value) => new Color(value);

export default color;
