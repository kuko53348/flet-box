// tools/filter.js

/**
 * Generate CSS filter string
 * @param {Object} options - Filter options
 * @returns {string} CSS filter value
 *
 * @example
 * filter({ blur: 5, brightness: 0.8, contrast: 1.2 })
 * // "blur(5px) brightness(0.8) contrast(1.2)"
 *
 * @example
 * filter({ grayscale: 1, sepia: 0.5, hueRotate: 90 })
 * // "grayscale(1) sepia(0.5) hue-rotate(90deg)"
 */
export const filter = (options = {}) => {
  const parts = [];

  if (options.blur)
    parts.push(
      `blur(${typeof options.blur === "number" ? options.blur + "px" : options.blur})`,
    );
  if (options.brightness) parts.push(`brightness(${options.brightness})`);
  if (options.contrast) parts.push(`contrast(${options.contrast})`);
  if (options.dropShadow) {
    const [x, y, blur, color] = options.dropShadow;
    parts.push(`drop-shadow(${x}px ${y}px ${blur}px ${color})`);
  }
  if (options.grayscale) parts.push(`grayscale(${options.grayscale})`);
  if (options.hueRotate) parts.push(`hue-rotate(${options.hueRotate}deg)`);
  if (options.invert) parts.push(`invert(${options.invert})`);
  if (options.opacity) parts.push(`opacity(${options.opacity})`);
  if (options.saturate) parts.push(`saturate(${options.saturate})`);
  if (options.sepia) parts.push(`sepia(${options.sepia})`);
  if (options.backdrop)
    parts.push(`backdrop-filter(${filter(options.backdrop)})`);

  return parts.join(" ");
};

export default filter;
