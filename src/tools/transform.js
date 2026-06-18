// tools/transform.js

/**
 * Generate CSS transform string
 * @param {Object} options - Transform options
 * @returns {string} CSS transform value
 *
 * @example
 * transform({ translate: [10, 20], rotate: 45, scale: 1.5 })
 * // "translate(10px, 20px) rotate(45deg) scale(1.5)"
 *
 * @example
 * transform({ translateX: 10, translateY: 20, rotate: 45 })
 * // "translateX(10px) translateY(20px) rotate(45deg)"
 */
export const transform = (options = {}) => {
  const parts = [];

  // Translate
  if (options.translate) {
    const [x, y] = options.translate;
    parts.push(
      `translate(${typeof x === "number" ? x + "px" : x}, ${typeof y === "number" ? y + "px" : y})`,
    );
  }
  if (options.translateX)
    parts.push(
      `translateX(${typeof options.translateX === "number" ? options.translateX + "px" : options.translateX})`,
    );
  if (options.translateY)
    parts.push(
      `translateY(${typeof options.translateY === "number" ? options.translateY + "px" : options.translateY})`,
    );
  if (options.translateZ)
    parts.push(
      `translateZ(${typeof options.translateZ === "number" ? options.translateZ + "px" : options.translateZ})`,
    );

  // Rotate
  if (options.rotate) parts.push(`rotate(${options.rotate}deg)`);
  if (options.rotateX) parts.push(`rotateX(${options.rotateX}deg)`);
  if (options.rotateY) parts.push(`rotateY(${options.rotateY}deg)`);
  if (options.rotateZ) parts.push(`rotateZ(${options.rotateZ}deg)`);

  // Scale
  if (options.scale) parts.push(`scale(${options.scale})`);
  if (options.scaleX) parts.push(`scaleX(${options.scaleX})`);
  if (options.scaleY) parts.push(`scaleY(${options.scaleY})`);

  // Skew
  if (options.skew) parts.push(`skew(${options.skew}deg)`);
  if (options.skewX) parts.push(`skewX(${options.skewX}deg)`);
  if (options.skewY) parts.push(`skewY(${options.skewY}deg)`);

  // Matrix
  if (options.matrix) parts.push(`matrix(${options.matrix.join(", ")})`);
  if (options.matrix3d) parts.push(`matrix3d(${options.matrix3d.join(", ")})`);

  // Perspective
  if (options.perspective)
    parts.push(
      `perspective(${typeof options.perspective === "number" ? options.perspective + "px" : options.perspective})`,
    );

  return parts.join(" ");
};

export default transform;
