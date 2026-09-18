// core/lifecycle.js
const registeredWidgets = new Set();
let globalObserver = null;

const checkAllStates = () => {
  registeredWidgets.forEach((widget) => {
    const isConnected = document.body.contains(widget);
    if (isConnected && !widget._mounted) {
      widget._mounted = true;
      widget._mountFns.forEach((fn) => fn(widget));
    } else if (!isConnected && widget._mounted) {
      widget._mounted = false;
      widget._unmountFns.forEach((fn) => fn(widget));
    }
  });
};

const ensureObserver = () => {
  if (!globalObserver && typeof MutationObserver !== "undefined" && document.body) {
    globalObserver = new MutationObserver(checkAllStates);
    globalObserver.observe(document.body, { childList: true, subtree: true });
  }
};

export const addLifecycle = (widget) => {
  widget._mountFns = [];
  widget._unmountFns = [];
  widget._mounted = false;

  widget.onMount = (fn) => typeof fn === "function" && widget._mountFns.push(fn);
  widget.onUnmount = (fn) => typeof fn === "function" && widget._unmountFns.push(fn);

  ensureObserver();
  registeredWidgets.add(widget);
  queueMicrotask(checkAllStates);

  widget._cleanup = () => {
    registeredWidgets.delete(widget);
    if (registeredWidgets.size === 0 && globalObserver) {
      globalObserver.disconnect();
      globalObserver = null;
    }
    widget._mountFns = [];
    widget._unmountFns = [];
  };

  return widget;
};