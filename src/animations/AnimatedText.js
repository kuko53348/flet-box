// AnimatedText.js - Corregido (tamaño respetado, sin parpadeo de fondo)
import { Container } from '../widgets/Container.js';
import { AnimatedBox } from './AnimatedBox.js';
import { Text } from '../widgets/Text.js';

export const AnimatedText = ({ 
    child,           // widget Text
    animations,      // array de animaciones (opcional)
    sameTime = false,
    delayBetween = 0.1,
    orientation = 'row'
}) => {
    if (!child) return null;
    if (!animations || animations.length === 0) return child;

    // Extraer propiedades del Text original
    const originalText = child._props?.text || child.textContent || '';
    const originalProps = { ...(child._props || {}) };
    // Asegurar que no se herede ninguna animación de fondo no deseada
    delete originalProps.animations;
    
    const container = Container({
        display: 'flex',
        flexDirection: orientation === 'row' ? 'row' : 'column',
        flexWrap: orientation === 'row' ? 'wrap' : 'nowrap',
        alignItems: orientation === 'row' ? 'center' : 'flex-start'
    });

    const letters = originalText.split('');
    
    letters.forEach((letter, index) => {
        if (letter === ' ') {
            const space = Container({
                textContent: ' ',
                display: 'inline-block', 
                width: orientation === 'row' ? '0.3em' : '100%',
                height: orientation === 'column' ? '0.3em' : 'auto'
            });
            container.appendChild(space);
            return;
        }

        const baseDelay = sameTime ? 0 : index * delayBetween;
        
        const letterAnimations = animations.map(anim => ({
            ...anim,
            delay: `${baseDelay}s`
        }));

        // Crear un nuevo widget Text para esta letra, copiando todas las props originales
        // y forzando el texto a una sola letra.
        const letterWidget = Text({
            text: letter,
            size: originalProps.size,
            color: originalProps.color,
            weight: originalProps.weight,
            style: originalProps.style
        });
        
        // Ajustar display según orientación
        letterWidget.style.display = orientation === 'row' ? 'inline-block' : 'block';
        if (orientation === 'column') {
            letterWidget.style.textAlign = 'center';
        }

        const animatedLetter = AnimatedBox({
            animations: letterAnimations,
            child: letterWidget
        });
        
        container.appendChild(animatedLetter);
    });

    return container;
};

export default AnimatedText;
