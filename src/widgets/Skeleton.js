// widgets/Skeleton.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const Skeleton = (props) => {
    const {
        variant = 'text',      // 'text', 'circular', 'avatar', 'image', 'card', 'listTile', 'button'
        width,
        height,
        borderRadius,
        animation = 'pulse',    // 'pulse', 'wave', 'none'
        count = 1,
        gap = 8,
        
        // Color props for consistency
        bgColor = colors.gray200,
        highlightColor = colors.gray100,
        shimmerColor = colors.gray300,
        
        // Animation timing
        pulseDuration = '1.5s',
        waveDuration = '1.5s',
        
        ...rest
    } = props;

    // Default dimensions based on variant
    const getDefaultDimensions = () => {
        switch (variant) {
            case 'text':
                return { width: '100%', height: 16, borderRadius: 4 };
            case 'circular':
                return { width: 48, height: 48, borderRadius: '50%' };
            case 'avatar':
                return { width: 40, height: 40, borderRadius: '50%' };
            case 'image':
                return { width: '100%', height: 150, borderRadius: 8 };
            case 'card':
                return { width: '100%', height: 120, borderRadius: 12 };
            case 'listTile':
                return { width: '100%', height: 56, borderRadius: 8 };
            case 'button':
                return { width: 120, height: 36, borderRadius: 24 };
            default:
                return { width: '100%', height: 20, borderRadius: 4 };
        }
    };

    const defaults = getDefaultDimensions();
    const finalWidth = width !== undefined ? width : defaults.width;
    const finalHeight = height !== undefined ? height : defaults.height;
    const finalBorderRadius = borderRadius !== undefined ? borderRadius : defaults.borderRadius;

    // Animation styles
    const getAnimationStyle = () => {
        if (animation === 'pulse') {
            return {
                animation: `skeleton-pulse ${pulseDuration} ease-in-out infinite`,
            };
        }
        if (animation === 'wave') {
            return {
                background: `linear-gradient(90deg, ${bgColor} 25%, ${highlightColor} 50%, ${bgColor} 75%)`,
                backgroundSize: '200% 100%',
                animation: `skeleton-wave ${waveDuration} ease-in-out infinite`,
            };
        }
        return {};
    };

    // Build specific variant structure using WidgetFactory
    const buildVariant = () => {
        // Button variant
        if (variant === 'button') {
            return WidgetFactory({
                tag: 'div',
                width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
                height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
                backgroundColor: bgColor,
                borderRadius: typeof finalBorderRadius === 'number' ? `${finalBorderRadius}px` : finalBorderRadius,
                ...getAnimationStyle()
            });
        }

        // ListTile variant
        if (variant === 'listTile') {
            const container = WidgetFactory({
                tag: 'div',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%'
            });

            const avatar = WidgetFactory({
                tag: 'div',
                width: '40px',
                height: '40px',
                backgroundColor: bgColor,
                borderRadius: '50%',
                flexShrink: 0,
                ...getAnimationStyle()
            });
            container.appendChild(avatar);

            const textContainer = WidgetFactory({
                tag: 'div',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            });

            const line1 = WidgetFactory({
                tag: 'div',
                width: '80%',
                height: '14px',
                backgroundColor: bgColor,
                borderRadius: '4px',
                ...getAnimationStyle()
            });
            
            const line2 = WidgetFactory({
                tag: 'div',
                width: '60%',
                height: '12px',
                backgroundColor: bgColor,
                borderRadius: '4px',
                ...getAnimationStyle()
            });

            textContainer.appendChild(line1);
            textContainer.appendChild(line2);
            container.appendChild(textContainer);

            return container;
        }

        // Card variant
        if (variant === 'card') {
            const container = WidgetFactory({
                tag: 'div',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%'
            });

            const imageArea = WidgetFactory({
                tag: 'div',
                width: '100%',
                height: '120px',
                backgroundColor: bgColor,
                borderRadius: '8px',
                ...getAnimationStyle()
            });
            container.appendChild(imageArea);

            const textLines = WidgetFactory({
                tag: 'div',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '0 8px'
            });

            const line1 = WidgetFactory({
                tag: 'div',
                width: '90%',
                height: '16px',
                backgroundColor: bgColor,
                borderRadius: '4px',
                ...getAnimationStyle()
            });
            
            const line2 = WidgetFactory({
                tag: 'div',
                width: '70%',
                height: '12px',
                backgroundColor: bgColor,
                borderRadius: '4px',
                ...getAnimationStyle()
            });

            textLines.appendChild(line1);
            textLines.appendChild(line2);
            container.appendChild(textLines);

            return container;
        }

        // Simple variants (text, circular, avatar, image)
        return WidgetFactory({
            tag: 'div',
            width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
            height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
            backgroundColor: bgColor,
            borderRadius: typeof finalBorderRadius === 'number' ? `${finalBorderRadius}px` : finalBorderRadius,
            ...getAnimationStyle()
        });
    };

    // Create multiple items container using WidgetFactory
    const container = WidgetFactory({
        tag: 'div',
        display: 'flex',
        flexDirection: 'column',
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        width: '100%'
    });

    for (let i = 0; i < count; i++) {
        container.appendChild(buildVariant());
    }

    // Add keyframe animations if not already added
    if (!document.querySelector('#skeleton-styles')) {
        const style = document.createElement('style');
        style.id = 'skeleton-styles';
        style.textContent = `
            @keyframes skeleton-pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            @keyframes skeleton-wave {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
    }

    return container;
};

export default Skeleton;
