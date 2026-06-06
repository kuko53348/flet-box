// widget-builder/lifecycle.js
export const addLifecycle = (widget) => {
    widget._mountFns = [];
    widget._unmountFns = [];
    
    widget.onMount = (fn) => {
        if (typeof fn === 'function') widget._mountFns.push(fn);
    };
    widget.onUnmount = (fn) => {
        if (typeof fn === 'function') widget._unmountFns.push(fn);
    };
    
    // Detectar inserción en el DOM
    const observer = new MutationObserver(() => {
        if (document.body.contains(widget)) {
            widget._mountFns.forEach(fn => fn(widget));
            observer.disconnect();
            widget._mountObserver = null;
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    widget._mountObserver = observer;
    
    // Método de limpieza manual
    widget._cleanup = () => {
        widget._unmountFns.forEach(fn => fn(widget));
        if (widget._mountObserver) widget._mountObserver.disconnect();
    };
    
    return widget;
};
