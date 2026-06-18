// utils/border.js
export const border = (width = 1, style = "solid", color) => {
  const widthStr = typeof width === "number" ? `${width}px` : width;
  return `${widthStr} ${style} ${color}`;
};

export default border;
