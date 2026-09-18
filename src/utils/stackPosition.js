// utils/stackPosition.js
export const stackPosition = (widget, props) => {
  const top = props.top;
  const right = props.right;
  const bottom = props.bottom;
  const left = props.left;

  // Guardar posición en dataset para que Stack lo use después
  if (top !== undefined) widget.dataset.top = top;
  if (right !== undefined) widget.dataset.right = right;
  if (bottom !== undefined) widget.dataset.bottom = bottom;
  if (left !== undefined) widget.dataset.left = left;

  return widget;
};

export default stackPosition;
