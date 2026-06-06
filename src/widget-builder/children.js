// children.js - MODIFICADO para asignar parent
export const addChildren = (parent, props) => {
    const children = props.children || props.child;
    if (children) {
        const items = Array.isArray(children) ? children : [children];
        items.forEach(child => {
            if (child instanceof HTMLElement) {
                // ✅ ASIGNAR EL PARENT AL HIJO
                if (child.parent !== undefined) {
                    child.parent = parent;  // ← esto es clave
                }
                parent.append(child);
            }
        });
    }
    return parent;
};
