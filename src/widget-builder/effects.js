// effects.js - Corregido
// effects.js - Solo hover si realmente hay un callback
export const applyEffects = (widget) => {
    widget.style.webkitTapHighlightColor = 'transparent';
    widget.style.outline = 'none';
    widget.style.transition = 'transform 0.15s ease, box-shadow 0.2s ease';
    
    // Verificar si realmente hay un callback (no solo una función vacía)
    const hasRealCallback = widget.onclick && typeof widget.onclick === 'function';
    
    if (hasRealCallback) {
        const originalCallback = widget.onclick;
        const originalShadow = widget.style.boxShadow;
        widget._originalShadow = originalShadow;
        
        let isPressed = false;
        
        // Press
        widget.onclick = (event) => {
            isPressed = true;
            widget.style.transform = 'scale(0.97)';
            widget.style.boxShadow = 'none';
            
            setTimeout(() => {
                originalCallback(widget, event);
                
                setTimeout(() => {
                    widget.style.transform = '';
                    widget.style.boxShadow = originalShadow;
                    isPressed = false;
                }, 150);
            }, 50);
        };
        
        // Hover - solo si NO está presionado
        widget.addEventListener('mouseenter', () => {
            if (isPressed) return;
            widget.style.transform = 'translateY(-4px)';
            if (originalShadow && originalShadow !== 'none') {
                widget.style.boxShadow = originalShadow.replace(/0 \d+px \d+px/, '0 8px 16px');
            }
        });
        
        widget.addEventListener('mouseleave', () => {
            if (isPressed) return;
            widget.style.transform = '';
            widget.style.boxShadow = originalShadow;
        });
        
        widget.style.cursor = 'pointer';
    }
    
    return widget;
};
