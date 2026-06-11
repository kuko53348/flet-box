// src/tools/ref.js
// const display = ref();
// Text({ ref: display });
// display.update({ text: 'Goodbye' });

// src/tools/ref.js
// src/tools/ref.js - Versión sin .get()
export const ref = () => {
    let _widget = null;
    
    const refFn = (widget) => {
        _widget = widget;
        // Copiar métodos del widget a la función (para acceso directo)
        if (widget) {
            Object.keys(widget).forEach(key => {
                if (typeof widget[key] === 'function') {
                    refFn[key] = widget[key].bind(widget);
                } else {
                    Object.defineProperty(refFn, key, {
                        get: () => widget[key],
                        set: (v) => { widget[key] = v; }
                    });
                }
            });
        }
        return widget;
    };
    
    refFn.update = (props) => {
        if (_widget && _widget.update) _widget.update(props);
    };
    
    return refFn;
};
