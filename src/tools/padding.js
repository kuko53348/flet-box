// tools/padding.js

/**
 * Genera un string CSS para padding
 * @param {number|Object} value - Valor o objeto con opciones
 * @returns {string} Valor CSS de padding
 *
 * @example
 * padding(20)                    // "20px"
 * padding({ all: 20 })           // "20px"
 * padding({ horizontal: 20, vertical: 10 })  // "20px 10px"
 * padding({ top: 10, right: 20, bottom: 10, left: 20 })  // "10px 20px 10px 20px"
 * padding({ left: 20, right: 20 })  // "0px 20px 0px 20px"
 * padding({ top: 10, bottom: 10 })  // "10px 0px 10px 0px"
 */
export const padding = (value) => {
  // Si es número o string, aplicar a todos los lados
  if (typeof value === "number" || typeof value === "string") {
    const px = typeof value === "number" ? `${value}px` : value;
    return px;
  }

  // Si es objeto
  if (typeof value === "object") {
    const top =
      value.top !== undefined
        ? value.top
        : value.vertical !== undefined
          ? value.vertical
          : value.all !== undefined
            ? value.all
            : 0;
    const right =
      value.right !== undefined
        ? value.right
        : value.horizontal !== undefined
          ? value.horizontal
          : value.all !== undefined
            ? value.all
            : 0;
    const bottom =
      value.bottom !== undefined
        ? value.bottom
        : value.vertical !== undefined
          ? value.vertical
          : value.all !== undefined
            ? value.all
            : 0;
    const left =
      value.left !== undefined
        ? value.left
        : value.horizontal !== undefined
          ? value.horizontal
          : value.all !== undefined
            ? value.all
            : 0;

    const topPx = typeof top === "number" ? `${top}px` : top;
    const rightPx = typeof right === "number" ? `${right}px` : right;
    const bottomPx = typeof bottom === "number" ? `${bottom}px` : bottom;
    const leftPx = typeof left === "number" ? `${left}px` : left;

    // Si todos son iguales, retornar solo uno
    if (topPx === rightPx && rightPx === bottomPx && bottomPx === leftPx) {
      return topPx;
    }

    // Si solo horizontal y vertical son diferentes
    if (topPx === bottomPx && rightPx === leftPx) {
      return `${topPx} ${rightPx}`;
    }

    // Formato completo
    return `${topPx} ${rightPx} ${bottomPx} ${leftPx}`;
  }

  return "0px";
};

export default padding;
