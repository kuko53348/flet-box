// widgets/ParallaxBox.js
import { createWidget } from '../widget-builder/index.js';
import { AnimatedBox } from '../animations/AnimatedBox.js';
import { colors } from '../utils/themes.js';

export const ParallaxBox = (props) => {
    let {
        type = 'scroll',        // 'scroll', 'mouse', 'hover'
        speed = 0.5,            // 0.2 = lento, 2 = rápido
        direction = 'vertical', // 'vertical', 'horizontal', 'both'
        maxOffset = 100,        // desplazamiento máximo en píxeles
        reverse = false,        // invertir dirección
        child,
        disabled = false,
        onParallaxMove,
        duration = 300,
        easing = 'easeOut',
        ...rest
    } = props;

    if (!child) return null;

    let containerRef = null;
    let animationFrame = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    // Apply parallax transform using AnimatedBox
    const applyTransform = (x, y, animate = true) => {
        if (disabled) return;

        let moveX = x;
        let moveY = y;

        // Apply direction
        if (direction === 'vertical') moveX = 0;
        if (direction === 'horizontal') moveY = 0;

        // Apply reverse
        if (reverse) {
            moveX = -moveX;
            moveY = -moveY;
        }

        // Clamp to maxOffset
        moveX = Math.max(-maxOffset, Math.min(maxOffset, moveX));
        moveY = Math.max(-maxOffset, Math.min(maxOffset, moveY));

        targetX = moveX;
        targetY = moveY;

        if (onParallaxMove) onParallaxMove({ x: moveX, y: moveY });
        
        // Update animated content
        if (animatedContent && animatedContent.updatePosition) {
            animatedContent.updatePosition(moveX, moveY);
        }
    };

    // Reset transform
    const resetTransform = (animate = true) => {
        targetX = 0;
        targetY = 0;
        if (animatedContent && animatedContent.updatePosition) {
            animatedContent.updatePosition(0, 0, animate);
        }
        if (onParallaxMove) onParallaxMove({ x: 0, y: 0 });
    };

    // Scroll parallax handler
    const handleScroll = () => {
        if (disabled || type !== 'scroll') return;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        
        animationFrame = requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;
            let moveY = scrollY * speed;
            let moveX = scrollX * speed;
            
            applyTransform(moveX, moveY, true);
        });
    };

    // Mouse move handler
    const handleMouseMove = (e) => {
        if (disabled || (type !== 'mouse' && type !== 'hover')) return;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        
        animationFrame = requestAnimationFrame(() => {
            const rect = containerRef.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let moveX = (e.clientX - centerX) / (rect.width / 2);
            let moveY = (e.clientY - centerY) / (rect.height / 2);
            
            moveX = moveX * maxOffset;
            moveY = moveY * maxOffset;
            
            applyTransform(moveX, moveY, true);
        });
    };

    // Hover handler
    const handleMouseEnter = (e) => {
        if (disabled || type !== 'hover') return;
        const rect = containerRef.getBoundingClientRect();
        const percentX = (e.clientX - rect.left) / rect.width;
        const percentY = (e.clientY - rect.top) / rect.height;
        
        let moveX = (percentX - 0.5) * maxOffset * 2;
        let moveY = (percentY - 0.5) * maxOffset * 2;
        
        applyTransform(moveX, moveY, true);
    };

    const handleMouseLeave = () => {
        if (disabled || (type !== 'mouse' && type !== 'hover')) return;
        resetTransform(true);
    };

    // Create AnimatedBox wrapper
    const createAnimatedContent = () => {
        // Create the base content
        const content = child;
        
        // Wrap in AnimatedBox for smooth transitions
        const animations = [];
        
        if (direction === 'vertical' || direction === 'both') {
            animations.push({
                effect: 'translateY',
                from: 0,
                to: 0,
                duration: duration,
                reverse: false
            });
        }
        if (direction === 'horizontal' || direction === 'both') {
            animations.push({
                effect: 'translateX',
                from: 0,
                to: 0,
                duration: duration,
                reverse: false
            });
        }
        
        const animatedBox = AnimatedBox({
            animations: animations,
            timing: easing,
            child: content,
            style: {
                willChange: 'transform'
            }
        });
        
        // Add method to update position dynamically
        animatedBox.updatePosition = (x, y, animate = true) => {
            const newAnimations = [];
            
            if (direction === 'vertical' || direction === 'both') {
                newAnimations.push({
                    effect: 'translateY',
                    from: currentY,
                    to: y,
                    duration: animate ? duration : 0,
                    reverse: false
                });
            }
            if (direction === 'horizontal' || direction === 'both') {
                newAnimations.push({
                    effect: 'translateX',
                    from: currentX,
                    to: x,
                    duration: animate ? duration : 0,
                    reverse: false
                });
            }
            
            currentX = x;
            currentY = y;
            
            // Recreate animated box with new animations
            // For simplicity, we update the style directly
            const transformParts = [];
            if (direction === 'horizontal' || direction === 'both') {
                transformParts.push(`translateX(${x}px)`);
            }
            if (direction === 'vertical' || direction === 'both') {
                transformParts.push(`translateY(${y}px)`);
            }
            
            animatedBox.style.transform = transformParts.join(' ');
            if (animate) {
                animatedBox.style.transition = `transform ${duration}ms ${easing}`;
            } else {
                animatedBox.style.transition = 'none';
            }
            
            // Remove transition after animation
            if (animate) {
                setTimeout(() => {
                    if (animatedBox) animatedBox.style.transition = '';
                }, duration);
            }
        };
        
        return animatedBox;
    };

    // ========== BUILD WIDGET ==========

    // Create animated content
    const animatedContent = createAnimatedContent();

    // Main container
    const container = createWidget('div')({
        style: {
            position: 'relative',
            overflow: 'hidden',
            ...rest.style
        },
        ...rest
    });

    containerRef = container;
    container.appendChild(animatedContent);

    // Attach event listeners
    if (type === 'scroll') {
        window.addEventListener('scroll', handleScroll);
        setTimeout(() => handleScroll(), 100);
    } else if (type === 'mouse' || type === 'hover') {
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        if (type === 'hover') {
            container.addEventListener('mouseenter', handleMouseEnter);
        }
    }

    // ========== PUBLIC METHODS ==========
    container.updateSpeed = (newSpeed) => {
        speed = newSpeed;
        if (type === 'scroll') handleScroll();
    };

    container.updateDirection = (newDirection) => {
        direction = newDirection;
        if (type === 'scroll') handleScroll();
        else resetTransform(true);
    };

    container.setPosition = (x, y, animate = true) => {
        applyTransform(x, y, animate);
    };

    container.reset = (animate = true) => {
        resetTransform(animate);
    };

    // Cleanup
    const originalCleanup = container._cleanup;
    container._cleanup = () => {
        if (type === 'scroll') {
            window.removeEventListener('scroll', handleScroll);
        } else {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (type === 'hover') {
                container.removeEventListener('mouseenter', handleMouseEnter);
            }
        }
        if (animationFrame) cancelAnimationFrame(animationFrame);
        if (originalCleanup) originalCleanup();
    };

    return container;
};

export default ParallaxBox;
