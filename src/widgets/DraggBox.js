// widgets/DraggBox.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const DraggBox = (props) => {
    const {
        child,
        data,
        group = 'default',
        disabled = false,
        onDragStart,
        onDragEnd,
        dragImage,
        cloneOnDrag = true,
        opacity = 0.5,
        
        // Color props for consistency
        dragOverlayColor = `${colors.primary}20`,
        dragBorderColor = colors.primary,
        
        ...rest
    } = props;

    if (!child) return null;

    const dragId = `drag-${Date.now()}-${Math.random()}`;
    let dragClone = null;

    const wrapper = WidgetFactory({
        tag: 'div',
        display: 'inline-block',
        cursor: disabled ? 'default' : 'grab',
        userSelect: 'none',
        draggable: !disabled,
        child: child,
        ...rest
    });

    const createDragClone = () => {
        const clone = wrapper.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = '-1000px';
        clone.style.left = '-1000px';
        clone.style.width = `${wrapper.offsetWidth}px`;
        clone.style.opacity = '0.8';
        clone.style.transform = 'rotate(5deg) scale(1.05)';
        clone.style.transition = 'none';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '99999';
        clone.style.backgroundColor = dragOverlayColor;
        clone.style.border = `2px dashed ${dragBorderColor}`;
        clone.style.borderRadius = '8px';
        document.body.appendChild(clone);
        return clone;
    };

    wrapper.addEventListener('dragstart', (e) => {
        if (disabled) {
            e.preventDefault();
            return false;
        }
        
        window.__dragData = {
            data: data,
            group: group,
            dragId: dragId
        };
        
        e.dataTransfer.setData('text/plain', dragId);
        e.dataTransfer.effectAllowed = 'copy';
        
        if (cloneOnDrag && !dragImage) {
            dragClone = createDragClone();
            e.dataTransfer.setDragImage(dragClone, 20, 20);
        } else if (dragImage) {
            e.dataTransfer.setDragImage(dragImage, 20, 20);
        } else {
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
        }
        
        wrapper.style.opacity = String(opacity);
        wrapper.style.cursor = 'grabbing';
        
        if (onDragStart) onDragStart(e, data);
    });

    wrapper.addEventListener('dragend', (e) => {
        wrapper.style.opacity = '';
        wrapper.style.cursor = 'grab';
        
        if (dragClone && dragClone.parentNode) {
            dragClone.parentNode.removeChild(dragClone);
            dragClone = null;
        }
        
        setTimeout(() => {
            if (window.__dragData?.dragId === dragId) {
                window.__dragData = null;
            }
        }, 100);
        
        if (onDragEnd) onDragEnd(e, data);
    });

    return wrapper;
};

export default DraggBox;
