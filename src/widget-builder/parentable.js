/**
 * PARENTABLE - Adds parent navigation
 * @module widget-builder/parentable
 */
// parentable.js - Asegurar que parent es asignable
export const makeParentable = (widget) => {
    let _parent = null;
    
    Object.defineProperty(widget, 'parent', {
        get: () => _parent,
        set: (p) => { _parent = p; },
        enumerable: true,
        configurable: true
    });
    
    return widget;
};

export default makeParentable;
