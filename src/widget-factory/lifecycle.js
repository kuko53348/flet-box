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

  // Observer
  let observer = null;
  const startObserver = () => {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      if (document.body.contains(widget)) {
        widget._mountFns.forEach((fn) => fn(widget));
        if (observer) observer.disconnect();
        observer = null;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  startObserver();

  // Cleanup
  widget._cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    widget._unmountFns.forEach((fn) => fn(widget));
    widget._mountFns = [];
    widget._unmountFns = [];
  };

  return widget;
};
