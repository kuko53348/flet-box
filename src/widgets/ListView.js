// src/widgets/ListView.js
import { WidgetFactory } from '../widget-factory/index.js';
// import { createWidget } from '../widget-builder/index.js';

export const ListView = (props) => {
    const {
        data = [],
        renderItem,
        height = 400,
        width = '100%',
        itemSize = 60,
        gap = 0,
        bufferSize = 5,
        showsScrollIndicator = true,
        wrapItems = false,
        crossAxisCount = 2,
        onEndReached,
        onEndReachedThreshold = 0.5,
        onRefresh,
        expand = true,
        ListHeaderComponent,
        ListFooterComponent,
        ListEmptyComponent,
        ...rest
    } = props;

    // Calcular altura final
    let finalHeight = height;
    if (expand) {
        finalHeight = '100%';
    }

    // Elemento base
    const element = WidgetFactory({
        tag: 'div',
        style: {
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            display: 'flex',
            flex: expand ? 1 : undefined,
            flexDirection: 'column',
            overflow: 'hidden',
            ...rest.style
        },
        ...rest
    });

    // Estructura interna
    const scrollContainer = document.createElement('div');
    scrollContainer.style.flex = '1';
    scrollContainer.style.overflowY = 'auto';
    scrollContainer.style.overflowX = 'hidden';
    if (!showsScrollIndicator) {
        scrollContainer.style.scrollbarWidth = 'none';
        scrollContainer.style.msOverflowStyle = 'none';
    }

    const innerContainer = document.createElement('div');
    innerContainer.style.position = 'relative';
    innerContainer.style.width = '100%';

    const visibleContainer = document.createElement('div');
    visibleContainer.style.position = 'relative';
    visibleContainer.style.width = '100%';
    visibleContainer.style.minHeight = '100%';

    innerContainer.appendChild(visibleContainer);
    scrollContainer.appendChild(innerContainer);
    element.appendChild(scrollContainer);

    // Estado interno
    let _data = [...data];
    let _refreshing = false;
    let itemCache = new Map();
    let visibleStart = 0, visibleEnd = 0;
    let ticking = false;
    let headerElement = null, footerElement = null, emptyElement = null;
    let refreshIndicator = null;
    let isGridMode = wrapItems;
    let cols = isGridMode ? Math.max(1, crossAxisCount) : 1;

    // Funciones auxiliares
    const getTotalRows = () => Math.ceil(_data.length / cols);
    
    const getItemTop = (index) => {
        const row = Math.floor(index / cols);
        const headerHeight = headerElement?.offsetHeight || 0;
        return headerHeight + (row * (itemSize + gap));
    };
    
    const getTotalHeight = () => {
        const rows = getTotalRows();
        const headerH = headerElement?.offsetHeight || 0;
        const footerH = footerElement?.offsetHeight || 0;
        return headerH + (rows * (itemSize + gap) - gap) + footerH;
    };
    
    const updateInnerHeight = () => {
        innerContainer.style.height = `${getTotalHeight()}px`;
    };

    // Renderizado virtual optimizado
    const renderVisibleItems = () => {
        if (!scrollContainer) return;

        const scrollTop = scrollContainer.scrollTop;
        const viewportH = scrollContainer.clientHeight;
        const itemTotalH = itemSize + gap;

        let startRow = Math.max(0, Math.floor(scrollTop / itemTotalH) - bufferSize);
        let endRow = Math.min(getTotalRows(), Math.ceil((scrollTop + viewportH) / itemTotalH) + bufferSize);

        let start = startRow * cols;
        let end = Math.min(_data.length, endRow * cols);

        if (start === visibleStart && end === visibleEnd) return;
        visibleStart = start;
        visibleEnd = end;

        // Usar fragment para minimizar reflows
        const fragment = document.createDocumentFragment();

        for (let i = start; i < end; i++) {
            let itemEl = itemCache.get(i);
            if (!itemEl) {
                try {
                    itemEl = renderItem(_data[i], i);
                    if (itemCache.size > 200) {
                        const firstKey = itemCache.keys().next().value;
                        itemCache.delete(firstKey);
                    }
                    itemCache.set(i, itemEl);
                } catch (err) {
                    console.error('Error en renderItem:', err);
                    itemEl = document.createElement('div');
                    itemEl.textContent = 'Error';
                    itemEl.style.padding = '8px';
                }
            }
            if (!itemEl) continue;

            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.top = `${getItemTop(i)}px`;
            if (isGridMode) {
                const col = i % cols;
                wrapper.style.left = `${(col / cols) * 100}%`;
                wrapper.style.width = `${100 / cols}%`;
                wrapper.style.padding = `0 ${gap / 2}px`;
                wrapper.style.boxSizing = 'border-box';
            } else {
                wrapper.style.left = '0';
                wrapper.style.right = '0';
                wrapper.style.padding = `0 ${gap}px`;
            }
            wrapper.appendChild(itemEl);
            fragment.appendChild(wrapper);
        }

        // Limpiar y agregar nuevo contenido
        visibleContainer.innerHTML = '';
        visibleContainer.appendChild(fragment);
    };

    // Scroll handler con throttle
    const handleScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                renderVisibleItems();
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                if (onEndReached && _data.length && 
                    scrollHeight - (scrollTop + clientHeight) <= clientHeight * onEndReachedThreshold) {
                    onEndReached();
                }
                ticking = false;
            });
            ticking = true;
        }
    };

    // Header, footer, empty
    const renderHeader = () => {
        if (headerElement) headerElement.remove();
        if (ListHeaderComponent) {
            headerElement = typeof ListHeaderComponent === 'function' ? ListHeaderComponent() : ListHeaderComponent;
            if (headerElement) {
                headerElement.style.position = 'relative';
                scrollContainer.insertBefore(headerElement, scrollContainer.firstChild);
            }
        }
    };
    
    const renderFooter = () => {
        if (footerElement) footerElement.remove();
        if (ListFooterComponent) {
            footerElement = typeof ListFooterComponent === 'function' ? ListFooterComponent() : ListFooterComponent;
            if (footerElement) {
                footerElement.style.position = 'relative';
                scrollContainer.appendChild(footerElement);
            }
        }
    };
    
    const renderEmpty = () => {
        if (emptyElement) emptyElement.remove();
        if (_data.length === 0 && ListEmptyComponent) {
            emptyElement = typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent;
            if (emptyElement) {
                emptyElement.style.position = 'relative';
                scrollContainer.appendChild(emptyElement);
            }
        }
    };
    
    const refreshUI = () => {
        updateInnerHeight();
        renderVisibleItems();
        renderEmpty();
    };

    // Pull to refresh
    const setupPullToRefresh = () => {
        if (!onRefresh) return;
        refreshIndicator = document.createElement('div');
        refreshIndicator.style.display = 'flex';
        refreshIndicator.style.justifyContent = 'center';
        refreshIndicator.style.alignItems = 'center';
        refreshIndicator.style.height = '0';
        refreshIndicator.style.overflow = 'hidden';
        refreshIndicator.style.transition = 'height 0.2s';
        
        const spinner = document.createElement('div');
        spinner.style.width = '24px';
        spinner.style.height = '24px';
        spinner.style.border = '2px solid #e0e0e0';
        spinner.style.borderTop = '2px solid #007aff';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 0.8s linear infinite';
        refreshIndicator.appendChild(spinner);
        scrollContainer.insertBefore(refreshIndicator, scrollContainer.firstChild);

        let startY = 0, pulling = false;
        const onTouchStart = (e) => {
            if (scrollContainer.scrollTop === 0 && !_refreshing) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        };
        const onTouchMove = (e) => {
            if (pulling && !_refreshing && scrollContainer.scrollTop === 0) {
                const delta = e.touches[0].clientY - startY;
                if (delta > 0) {
                    refreshIndicator.style.height = `${Math.min(delta, 80)}px`;
                    e.preventDefault();
                }
            }
        };
        const onTouchEnd = () => {
            if (pulling && !_refreshing) {
                const h = refreshIndicator?.offsetHeight || 0;
                if (h >= 60) {
                    _refreshing = true;
                    refreshIndicator.style.height = '60px';
                    onRefresh(() => {
                        _refreshing = false;
                        refreshIndicator.style.height = '0';
                        if (element.refreshing !== undefined) element.refreshing = false;
                        refreshUI();
                    });
                } else {
                    refreshIndicator.style.height = '0';
                }
            }
            pulling = false;
        };
        scrollContainer.addEventListener('touchstart', onTouchStart);
        scrollContainer.addEventListener('touchmove', onTouchMove);
        scrollContainer.addEventListener('touchend', onTouchEnd);
        
        element.onUnmount(() => {
            scrollContainer.removeEventListener('touchstart', onTouchStart);
            scrollContainer.removeEventListener('touchmove', onTouchMove);
            scrollContainer.removeEventListener('touchend', onTouchEnd);
        });
    };

    // Métodos públicos
    const updateData = (newData) => {
        _data = [...newData];
        itemCache.clear();
        refreshUI();
        element.data = _data;
    };
    
    const scrollToIndex = (index, animated = true) => {
        if (index < 0 || index >= _data.length) return;
        const top = getItemTop(index);
        scrollContainer.scrollTo({ top, behavior: animated ? 'smooth' : 'auto' });
    };
    
    const scrollToTop = (animated = true) => {
        scrollContainer.scrollTo({ top: 0, behavior: animated ? 'smooth' : 'auto' });
    };
    
    const scrollToBottom = (animated = true) => {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: animated ? 'smooth' : 'auto' });
    };

    element.updateData = updateData;
    element.scrollToIndex = scrollToIndex;
    element.scrollToStart = scrollToTop;
    element.scrollToEnd = scrollToBottom;

    // Reactividad
    Object.defineProperty(element, 'data', {
        get: () => _data,
        set: (newVal) => updateData(newVal),
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(element, 'refreshing', {
        get: () => _refreshing,
        set: (val) => {
            _refreshing = val;
            if (refreshIndicator) refreshIndicator.style.height = _refreshing ? '60px' : '0';
        },
        enumerable: true
    });

    // Ciclo de vida (CORREGIDO: render inicial después de layout)
    element.onMount(() => {
        renderHeader();
        renderFooter();
        updateInnerHeight();
        
        // Forzar un segundo render después de que el DOM esté completamente calculado
        requestAnimationFrame(() => {
            updateInnerHeight();     // Recalcular altura total (header/footer ya están en el DOM)
            renderVisibleItems();    // Renderizar los elementos visibles inicialmente
        });
        
        renderEmpty();
        scrollContainer.addEventListener('scroll', handleScroll);
        if (onRefresh) setupPullToRefresh();

        // Añadir keyframes del spinner si no existen
        if (!document.querySelector('#listview-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'listview-spinner-style';
            style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
    });

    element.onUnmount(() => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        itemCache.clear();
    });

    return element;
};

export default ListView;
