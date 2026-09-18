const registeredWidgets = new Set();
let globalObserver = null;

// Hook interno de diagnóstico (no forma parte del API pública): permite a los
// tests afirmar que el registro se poda y no hay fugas.
export const _debugRegistrySize = () => registeredWidgets.size;

const stopObserverIfIdle = () => {
  if (registeredWidgets.size === 0 && globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
  }
};

const checkAllStates = () => {
  registeredWidgets.forEach((widget) => {
    const isConnected = document.body.contains(widget);
    if (isConnected && !widget._mounted) {
      widget._mounted = true;
      widget._orphanScheduled = false;
      widget._mountFns.forEach((fn) => fn(widget));
    } else if (!isConnected && widget._mounted) {
      widget._mounted = false;
      widget._unmountFns.forEach((fn) => fn(widget));

      // ✅ Poda: si el widget sigue desconectado tras este tick, terminó su ciclo
      // y se libera del registro (evita fuga y el barrido O(n) por mutación).
      // El setTimeout deja pasar el reparenting síncrono (drag & drop) sin perderlo.
      setTimeout(() => {
        if (!document.body.contains(widget)) {
          registeredWidgets.delete(widget);
          widget._mountFns = [];
          widget._unmountFns = [];
          stopObserverIfIdle();
        }
      }, 0);
    } else if (!isConnected && !widget._mounted && !widget._orphanScheduled) {
      // ✅ Poda de huérfanos: creado pero nunca montado y sigue desconectado.
      // Se libera del registro sin borrar handlers, para que un anexado tardío
      // (vía appendChild → reregister) pueda montarlo después.
      widget._orphanScheduled = true;
      setTimeout(() => {
        widget._orphanScheduled = false;
        if (!widget._mounted && !document.body.contains(widget)) {
          registeredWidgets.delete(widget);
          stopObserverIfIdle();
        }
      }, 0);
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

  // ✅ Dispara los callbacks de mount de forma síncrona si el widget ya está
  // en el DOM (runApp/insertBy lo llaman justo después de anexar). El observer
  // no lo duplica porque _mounted queda en true.
  widget.triggerMount = () => {
    if (!widget._mounted && document.body.contains(widget)) {
      widget._mounted = true;
      widget._mountFns.forEach((fn) => fn(widget));
    }
    return widget;
  };

  ensureObserver();
  registeredWidgets.add(widget);
  queueMicrotask(checkAllStates);

  widget._cleanup = () => {
    registeredWidgets.delete(widget);
    stopObserverIfIdle();
    widget._mountFns = [];
    widget._unmountFns = [];
  };

  return widget;
};

// ✅ Re-registra un widget huérfano (podado por nunca-montado) cuando se anexa
// a un padre, preservando el patrón "pre-construir y anexar después".
export const reregister = (widget) => {
  if (!widget || widget._mounted) return;
  if (registeredWidgets.has(widget)) return;
  widget._orphanScheduled = false;
  ensureObserver();
  registeredWidgets.add(widget);
  queueMicrotask(checkAllStates);
};
