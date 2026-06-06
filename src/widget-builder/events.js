// widget-builder/events.js
export const setupEvents = (widget, props) => {
    const eventMap = {
        onPress: 'click',
        onLongPress: 'mousedown',   // simplificado; puedes usar timer si quieres
        onHover: 'mouseenter',
        onHoverEnd: 'mouseleave',
        onChange: 'change',
        onInput: 'input',
        onFocus: 'focus',
        onBlur: 'blur'
    };
    
    for (const [propName, eventName] of Object.entries(eventMap)) {
        const handler = props[propName];
        if (typeof handler === 'function') {
            widget.addEventListener(eventName, (e) => handler(widget, e));
        }
    }
};
