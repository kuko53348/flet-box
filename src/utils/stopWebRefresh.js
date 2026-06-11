// utils/stopWebRefresh.js
export const stopWebRefresh = () => {
    // 1. Bloquear teclas de refresco (F5, Ctrl+R, Cmd+R)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F5' || 
            (e.ctrlKey && (e.key === 'r' || e.key === 'R')) || 
            (e.metaKey && (e.key === 'r' || e.key === 'R'))) {
            e.preventDefault();
            console.log('🚫 Refresco deshabilitado (teclado)');
        }
    });

    // 2. Bloquear clic derecho (menú contextual)
    document.body.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 3. Bloquear pull-to-refresh en móviles de forma selectiva
    let touchStartY = 0;
    let isAtTop = false;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        // Comprobar si estamos en el tope del documento
        isAtTop = (window.scrollY === 0 && document.documentElement.scrollTop === 0);
    }, { passive: true }); // passive: true mejora rendimiento

    window.addEventListener('touchmove', (e) => {
        const deltaY = e.touches[0].clientY - touchStartY;
        // Solo prevenir si: estamos en el tope, el movimiento es hacia abajo (deltaY > 0),
        // y además el evento no ocurre dentro de un elemento con scroll propio.
        if (isAtTop && deltaY > 0) {
            // Intentar bloquear solo si el destino no es un elemento con scroll
            let target = e.target;
            while (target && target !== document.body) {
                const overflowY = window.getComputedStyle(target).overflowY;
                if (overflowY === 'auto' || overflowY === 'scroll') {
                    // El toque está dentro de un contenedor con scroll, permitir movimiento
                    return;
                }
                target = target.parentElement;
            }
            // Si llegamos aquí, no hay scroll interno en el camino → bloquear pull-to-refresh
            e.preventDefault();
        }
    }, { passive: false });
};

export default stopWebRefresh;
