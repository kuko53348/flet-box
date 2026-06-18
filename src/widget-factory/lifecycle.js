// core/lifecycle.js
export const addLifecycle = (widget) => {
  widget._mountFns = [];
  widget._unmountFns = [];

  widget.onMount = (fn) => {
    if (typeof fn === "function") widget._mountFns.push(fn);
  };

  widget.onUnmount = (fn) => {
    if (typeof fn === "function") widget._unmountFns.push(fn);
  };

  // Detectar inserción en el DOM
  const observer = new MutationObserver(() => {
    if (document.body.contains(widget)) {
      widget._mountFns.forEach((fn) => fn(widget));
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return widget;
};
