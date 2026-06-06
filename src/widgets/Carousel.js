// widgets/Carousel.js
import { WidgetFactory } from '../widget-factory/index.js';
import { Icon } from './Icon.js';
import { colors } from '../utils/themes.js';

export const Carousel = (props) => {
    const {
        items = [],
        autoPlay = false,
        interval = 3000,
        showArrows = true,
        showDots = true,
        infinite = true,
        height = 300,
        width = '100%',
        borderRadius = 12,
        onIndexChange,
        
        // Dot customization
        dotColor = colors.gray300,
        dotActiveColor = colors.primary,
        dotSize = 8,
        dotActiveSize = 20,
        
        // Button customization
        buttonBgColor = colors.surface,
        buttonIconColor = colors.secondary,
        buttonSize = 36,
        buttonIconSize = 24,
        buttonTop = '46%',
        
        ...rest
    } = props;

    if (!items.length) return null;

    let currentIndex = 0;
    let autoPlayInterval = null;
    let isTransitioning = false;
    let trackRef = null;
    let dotsContainerRef = null;

    const updatePosition = (animate = true) => {
        if (!trackRef) return;
        trackRef.style.transition = animate ? 'transform 0.3s ease-in-out' : 'none';
        trackRef.style.transform = `translateX(-${currentIndex * (100 / items.length)}%)`;
    };

    const updateDots = () => {
        if (!dotsContainerRef) return;
        const dots = dotsContainerRef.children;
        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            if (i === currentIndex) {
                dot.style.backgroundColor = dotActiveColor;
                dot.style.width = typeof dotActiveSize === 'number' ? `${dotActiveSize}px` : dotActiveSize;
            } else {
                dot.style.backgroundColor = dotColor;
                dot.style.width = typeof dotSize === 'number' ? `${dotSize}px` : dotSize;
            }
        }
    };

    const next = () => {
        if (isTransitioning) return;
        isTransitioning = true;

        let newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
            if (infinite) newIndex = 0;
            else {
                isTransitioning = false;
                return;
            }
        }

        currentIndex = newIndex;
        updatePosition(true);
        updateDots();

        setTimeout(() => { isTransitioning = false; }, 350);
        if (onIndexChange) onIndexChange(currentIndex);
    };

    const prev = () => {
        if (isTransitioning) return;
        isTransitioning = true;

        let newIndex = currentIndex - 1;
        if (newIndex < 0) {
            if (infinite) newIndex = items.length - 1;
            else {
                isTransitioning = false;
                return;
            }
        }

        currentIndex = newIndex;
        updatePosition(true);
        updateDots();

        setTimeout(() => { isTransitioning = false; }, 350);
        if (onIndexChange) onIndexChange(currentIndex);
    };

    const goTo = (index) => {
        if (isTransitioning) return;
        if (index < 0 || index >= items.length) return;
        isTransitioning = true;
        currentIndex = index;
        updatePosition(true);
        updateDots();
        setTimeout(() => { isTransitioning = false; }, 350);
        if (onIndexChange) onIndexChange(currentIndex);
    };

    const startAutoPlay = () => {
        if (!autoPlay || items.length <= 1) return;
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(next, interval);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    };

    const createArrow = (position, iconName, onClick) => {
        const isLeft = position === 'left';
        return WidgetFactory({
            position: 'absolute',
            left: isLeft ? '10px' : 'auto',
            right: isLeft ? 'auto' : '10px',
            top: buttonTop,
            cursor: 'pointer',
            backgroundColor: buttonBgColor,
            borderRadius: '50%',
            width: typeof buttonSize === 'number' ? `${buttonSize}px` : buttonSize,
            height: typeof buttonSize === 'number' ? `${buttonSize}px` : buttonSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            child: Icon({ name: iconName, size: buttonIconSize, color: buttonIconColor }),
            onclick: onClick
        });
    };

    // Main container
    const container = WidgetFactory({
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'hidden',
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        ...rest
    });

    // Track container
    const track = WidgetFactory({
        display: 'flex',
        transition: 'transform 0.3s ease-in-out',
        height: '100%',
        width: `${items.length * 100}%`
    });
    trackRef = track;

    // Create slides
    items.forEach((item) => {
        const slide = WidgetFactory({
            width: `${100 / items.length}%`,
            height: '100%',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        });

        if (item instanceof HTMLElement) {
            slide.appendChild(item);
        } else if (typeof item === 'string') {
            const img = document.createElement('img');
            img.src = item;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.onerror = () => {
                console.error('Image not loaded:', item);
            };
            slide.appendChild(img);
        } else if (item && typeof item === 'object' && item.src) {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt || '';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            slide.appendChild(img);
        }

        track.appendChild(slide);
    });

    container.appendChild(track);

    // Navigation arrows
    if (showArrows && items.length > 1) {
        const prevArrow = createArrow('left', 'chevron_left', prev);
        const nextArrow = createArrow('right', 'chevron_right', next);
        container.appendChild(prevArrow);
        container.appendChild(nextArrow);
    }

    // Dots indicators
    if (showDots && items.length > 1) {
        const dotsContainer = WidgetFactory({
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10
        });
        dotsContainerRef = dotsContainer;

        items.forEach((_, index) => {
            const dot = WidgetFactory({
                width: index === currentIndex ? (typeof dotActiveSize === 'number' ? `${dotActiveSize}px` : dotActiveSize) : (typeof dotSize === 'number' ? `${dotSize}px` : dotSize),
                height: typeof dotSize === 'number' ? `${dotSize}px` : dotSize,
                borderRadius: '4px',
                backgroundColor: index === currentIndex ? dotActiveColor : dotColor,
                cursor: 'pointer',
                transition: 'all 0.2s',
                onclick: () => goTo(index)
            });
            dotsContainer.appendChild(dot);
        });

        container.appendChild(dotsContainer);
    }

    // Initialize position
    updatePosition(false);
    updateDots();

    // Autoplay setup
    if (autoPlay) {
        startAutoPlay();
        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);
    }

    // Public methods
    container.next = next;
    container.prev = prev;
    container.goTo = goTo;
    container.getCurrentIndex = () => currentIndex;

    // Cleanup
    const originalCleanup = container._cleanup;
    container._cleanup = () => {
        stopAutoPlay();
        if (originalCleanup) originalCleanup();
    };

    return container;
};

export default Carousel;
