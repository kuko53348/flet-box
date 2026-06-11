// children.js
export const addChildren = (parent, props) => {
    const children = props.children || props.child;
    if (children) {
        const items = Array.isArray(children) ? children : [children];
        
        // Inicializar _children si no existe
        if (!parent._children) parent._children = [];
        
        items.forEach(child => {
            let node = child;
            if (typeof child === 'string') {
                node = document.createTextNode(child);
            }
            if (node instanceof HTMLElement) {
                if (node.parent !== undefined) node.parent = parent;
                // Añadir al array de hijos
                if (!parent._children.includes(node)) parent._children.push(node);
            } else if (node instanceof Text) {
                // Para nodos de texto, también los guardamos (opcional)
                if (!parent._textChildren) parent._textChildren = [];
                parent._textChildren.push(node);
            }
            parent.append(node);
        });
    }
    return parent;
};
