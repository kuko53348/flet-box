// widgets/Slider.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

// Keyframes for animations
const keyframes = new Set();
const addKeyframes = (name, css) => {
    if (keyframes.has(name)) return;
    const style = document.createElement('style');
    style.textContent = `@keyframes ${name} { ${css} }`;
    document.head.appendChild(style);
    keyframes.add(name);
};

addKeyframes('slider-stripes', `0% { background-position: 0 0; } 100% { background-position: 20px 0; }`);
addKeyframes('slider-glow', `0% { filter: brightness(1); } 50% { filter: brightness(1.2); box-shadow: 0 0 8px currentColor; } 100% { filter: brightness(1); }`);
addKeyframes('slider-pulse', `0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); }`);

export const Slider = (props) => {
    const {
        value = 0,
        min = 0,
        max = 100,
        step = 1,
        disabled = false,
        width = '100%',
        height = 4,
        thumbSize = 20,
        color = colors.primary,
        trackColor = colors.border,
        thumbColor = '#ffffff',
        orientation = 'horizontal',
        inverted = false,
        showValue = false,
        showMarks = false,
        marks = [],
        valuePrefix = '',
        valueSuffix = '',
        striped = false,
        animatedStripes = false,
        stripeColor = 'rgba(255,255,255,0.25)',
        glow = false,
        pulse = false,
        onChanged,
        onChangeEnd,
        
        // Additional styling props
        borderRadius = 'full',
        thumbBorderColor = 'transparent',
        thumbBorderWidth = 0,
        thumbShadow = '0 2px 8px rgba(0,0,0,0.2)',
        thumbHoverScale = 1.1,
        trackBorderRadius = 'full',
        focusRing = true,
        focusRingColor = `${colors.primary}40`,
        
        // Value display props
        valueFontSize = 14,
        valueColor = colors.textSecondary,
        
        // Mark props
        markSize = 4,
        markColor = colors.border,
        markActiveColor = colors.primary,
        
        // Animation
        transitionDuration = '0.1s',
        animationDuration = '0.2s',
        
        ...rest
    } = props;

    let currentValue = Math.min(Math.max(value, min), max);
    let percentage = ((currentValue - min) / (max - min)) * 100;
    if (inverted) percentage = 100 - percentage;

    const isHorizontal = orientation === 'horizontal';
    const trackHeight = typeof height === 'number' ? `${height}px` : height;
    const thumbSizeNum = typeof thumbSize === 'number' ? thumbSize : 20;
    const finalBorderRadius = borderRadius === 'full' 
        ? (isHorizontal ? trackHeight : trackHeight)
        : (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius);
    const finalTrackBorderRadius = trackBorderRadius === 'full'
        ? (isHorizontal ? trackHeight : trackHeight)
        : (typeof trackBorderRadius === 'number' ? `${trackBorderRadius}px` : trackBorderRadius);

    // Main container using WidgetFactory
    const container = WidgetFactory({
        tag: 'div',
        width: isHorizontal ? width : 'auto',
        height: !isHorizontal ? width : 'auto',
        opacity: disabled ? 0.5 : 1,
        ...rest
    });

    // Value display
    const valueDisplay = showValue ? WidgetFactory({
        tag: 'div',
        textContent: `${valuePrefix}${currentValue}${valueSuffix}`,
        fontSize: typeof valueFontSize === 'number' ? `${valueFontSize}px` : valueFontSize,
        color: valueColor,
        textAlign: 'center',
        marginBottom: isHorizontal ? '4px' : '0',
        marginRight: !isHorizontal ? '4px' : '0'
    }) : null;
    if (valueDisplay) container.appendChild(valueDisplay);

    // Wrapper for slider
    const wrapper = WidgetFactory({
        tag: 'div',
        position: 'relative',
        ...(isHorizontal ? { width: '100%' } : { 
            height: '150px', 
            display: 'flex', 
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center'
        })
    });
    container.appendChild(wrapper);

    // Track
    const track = WidgetFactory({
        tag: 'div',
        position: 'relative',
        ...(isHorizontal ? { width: '100%', height: trackHeight } : { width: trackHeight, height: '100%' }),
        backgroundColor: trackColor,
        borderRadius: finalTrackBorderRadius,
        cursor: disabled ? 'not-allowed' : 'pointer'
    });
    wrapper.appendChild(track);

    // Fill
    const fill = WidgetFactory({
        tag: 'div',
        position: 'absolute',
        backgroundColor: color,
        borderRadius: finalBorderRadius,
        transition: disabled ? 'none' : `width ${transitionDuration}s ease, height ${transitionDuration}s ease`,
        ...(isHorizontal ? { 
            width: `${percentage}%`, 
            height: '100%', 
            left: 0, 
            top: 0 
        } : { 
            height: `${percentage}%`, 
            width: '100%', 
            bottom: 0, 
            left: 0 
        })
    });

    // Striped effect
    if (striped) {
        fill.style.backgroundImage = `repeating-linear-gradient(45deg, ${stripeColor} 0px, ${stripeColor} 8px, transparent 8px, transparent 16px)`;
        fill.style.backgroundSize = '16px 16px';
        if (animatedStripes) fill.style.animation = `slider-stripes 0.5s linear infinite`;
    }
    
    // Glow effect
    if (glow) fill.style.animation = `slider-glow 1.5s ease-in-out infinite`;
    
    track.appendChild(fill);

    // Thumb
    const thumb = WidgetFactory({
        tag: 'div',
        position: 'absolute',
        width: `${thumbSizeNum}px`,
        height: `${thumbSizeNum}px`,
        backgroundColor: thumbColor,
        borderRadius: '50%',
        boxShadow: thumbShadow,
        cursor: disabled ? 'not-allowed' : 'grab',
        zIndex: 2,
        boxSizing: 'border-box',
        border: thumbBorderWidth > 0 ? `${thumbBorderWidth}px solid ${thumbBorderColor}` : 'none',
        transition: `transform ${animationDuration}s ease, ${isHorizontal ? 'left' : 'bottom'} ${transitionDuration}s ease`,
        ...(isHorizontal ? { 
            top: '50%', 
            transform: 'translateY(-50%)' 
        } : { 
            left: '50%', 
            transform: 'translateX(-50%)' 
        })
    });
    
    // Pulse effect on change
    if (pulse) {
        thumb.style.transition = `transform ${animationDuration}s ease, ${isHorizontal ? 'left' : 'bottom'} ${transitionDuration}s ease`;
    }
    
    wrapper.appendChild(thumb);

    // Marks
    if (showMarks && marks.length === 0) {
        // Generate marks based on step
        const stepCount = (max - min) / step;
        for (let i = 0; i <= stepCount; i++) {
            const markValue = min + (i * step);
            marks.push(markValue);
        }
    }

    if (showMarks && marks.length > 0) {
        const marksContainer = WidgetFactory({
            tag: 'div',
            position: 'relative',
            ...(isHorizontal ? { width: '100%', height: `${markSize + 4}px`, marginTop: '4px' } : { 
                height: '100%', 
                width: `${markSize + 4}px`, 
                marginLeft: '4px',
                position: 'absolute',
                left: '100%',
                top: 0
            })
        });

        marks.forEach(markValue => {
            const markPercent = ((markValue - min) / (max - min)) * 100;
            const isActive = markValue <= currentValue;
            
            const mark = WidgetFactory({
                tag: 'div',
                position: 'absolute',
                ...(isHorizontal ? {
                    left: `${markPercent}%`,
                    bottom: 0,
                    width: `${markSize}px`,
                    height: `${markSize}px`
                } : {
                    bottom: `${markPercent}%`,
                    left: 0,
                    width: `${markSize}px`,
                    height: `${markSize}px`
                }),
                backgroundColor: isActive ? markActiveColor : markColor,
                borderRadius: '50%',
                transform: isHorizontal ? 'translateX(-50%)' : 'translateY(50%)'
            });
            marksContainer.appendChild(mark);
        });
        
        wrapper.appendChild(marksContainer);
    }

    // Focus ring styles
    if (focusRing && !disabled) {
        thumb.addEventListener('focus', () => {
            thumb.style.boxShadow = `0 0 0 3px ${focusRingColor}, ${thumbShadow}`;
        });
        thumb.addEventListener('blur', () => {
            thumb.style.boxShadow = thumbShadow;
        });
        thumb.setAttribute('tabindex', '0');
        thumb.setAttribute('role', 'slider');
        thumb.setAttribute('aria-valuemin', min);
        thumb.setAttribute('aria-valuemax', max);
        thumb.setAttribute('aria-valuenow', currentValue);
    }

    const updateThumbPosition = () => {
        if (!track || !thumb) return;
        const trackRect = track.getBoundingClientRect();
        if (isHorizontal) {
            const left = (percentage / 100) * trackRect.width;
            thumb.style.left = `${left - thumbSizeNum / 2}px`;
        } else {
            const bottom = (percentage / 100) * trackRect.height;
            thumb.style.bottom = `${bottom - thumbSizeNum / 2}px`;
        }
    };

    const calcValue = (clientX, clientY) => {
        const rect = track.getBoundingClientRect();
        let percent;
        if (isHorizontal) {
            let x = clientX - rect.left;
            percent = Math.min(Math.max(x / rect.width, 0), 1);
        } else {
            let y = rect.bottom - clientY;
            percent = Math.min(Math.max(y / rect.height, 0), 1);
        }
        if (inverted) percent = 1 - percent;
        let raw = min + percent * (max - min);
        let stepped = Math.round(raw / step) * step;
        return Math.min(Math.max(stepped, min), max);
    };

    const updateValue = (newVal, trigger = true, pulseEffect = false) => {
        if (disabled) return;
        currentValue = newVal;
        percentage = ((currentValue - min) / (max - min)) * 100;
        if (inverted) percentage = 100 - percentage;
        
        if (isHorizontal) {
            fill.style.width = `${percentage}%`;
        } else {
            fill.style.height = `${percentage}%`;
        }
        updateThumbPosition();
        
        if (valueDisplay) {
            valueDisplay.textContent = `${valuePrefix}${currentValue}${valueSuffix}`;
        }
        
        if (pulseEffect && pulse) {
            thumb.style.transform = isHorizontal 
                ? `translateY(-50%) scale(${thumbHoverScale})`
                : `translateX(-50%) scale(${thumbHoverScale})`;
            setTimeout(() => {
                thumb.style.transform = isHorizontal ? 'translateY(-50%)' : 'translateX(-50%)';
            }, 150);
        }
        
        if (trigger && onChanged) onChanged(currentValue);
        
        // Update ARIA attributes
        if (thumb.getAttribute) {
            thumb.setAttribute('aria-valuenow', currentValue);
        }
    };

    let dragging = false;
    
    const onMove = (e) => {
        if (!dragging) return;
        e.preventDefault();
        const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
        if (clientX !== undefined) {
            const val = calcValue(clientX, clientY);
            updateValue(val);
        }
    };
    
    const onEnd = () => {
        if (!dragging) return;
        dragging = false;
        if (onChangeEnd) onChangeEnd(currentValue);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        
        // Reset cursor
        thumb.style.cursor = 'grab';
        document.body.style.userSelect = '';
    };
    
    const onStart = (e) => {
        if (disabled) return;
        e.preventDefault();
        dragging = true;
        thumb.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        
        const clientX = e.clientX !== undefined ? e.clientX : e.touches?.[0]?.clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.touches?.[0]?.clientY;
        if (clientX !== undefined) {
            const val = calcValue(clientX, clientY);
            updateValue(val, true, true);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', onEnd);
    };

    // Hover effect on thumb
    if (!disabled) {
        thumb.addEventListener('mouseenter', () => {
            if (!dragging) {
                thumb.style.transform = isHorizontal 
                    ? `translateY(-50%) scale(${thumbHoverScale})`
                    : `translateX(-50%) scale(${thumbHoverScale})`;
            }
        });
        thumb.addEventListener('mouseleave', () => {
            if (!dragging) {
                thumb.style.transform = isHorizontal ? 'translateY(-50%)' : 'translateX(-50%)';
            }
        });
    }

    track.addEventListener('mousedown', onStart);
    track.addEventListener('touchstart', onStart);
    thumb.addEventListener('mousedown', onStart);
    thumb.addEventListener('touchstart', onStart);

    // Initialize thumb position
    setTimeout(() => {
        updateThumbPosition();
    }, 0);

    // Handle window resize
    const handleResize = () => {
        setTimeout(updateThumbPosition, 50);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    const cleanup = () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
    };
    
    if (container.onUnmount) container.onUnmount(cleanup);

    // Public methods
    Object.defineProperty(container, 'value', {
        get: () => currentValue,
        set: (v) => updateValue(v, true, true),
        enumerable: true
    });

    container.setValue = (v, trigger = true) => updateValue(v, trigger, true);
    container.getValue = () => currentValue;
    container.updateThumbPosition = updateThumbPosition;

    return container;
};

export default Slider;
