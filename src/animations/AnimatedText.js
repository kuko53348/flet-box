// AnimatedText.js - Mismo patrón que AnimatedBox
import { Container } from '../widgets/Container.js';
import { AnimatedBox } from './AnimatedBox.js';

export const AnimatedText = ({ 
    child,           // widget Text con sus propiedades
    animations,      // mismas animaciones que AnimatedBox
    sameTime = false,
    delayBetween = 0.1
}) => {
    if (!child) return null;
    if (!animations || animations.length === 0) return child;

    // Obtener el texto del hijo
    const text = child.textContent || '';
    
    const container = Container({
        display: 'inline-flex',
        flexWrap: 'wrap'
    });

    const letters = text.split('');
    
    letters.forEach((letter, index) => {
        if (letter === ' ') {
            const space = Container({
                textContent: ' ',
                style: { display: 'inline-block', width: '0.3em' }
            });
            container.appendChild(space);
            return;
        }

        const baseDelay = sameTime ? 0 : index * delayBetween;
        
        // Aplicar delay a cada animación
        const letterAnimations = animations.map(anim => ({
            ...anim,
            delay: `${baseDelay}s`
        }));

        // Clonar el child para cada letra (conserva todas sus propiedades)
        const letterWidget = child.cloneNode(false);
        letterWidget.textContent = letter;
        letterWidget.style.display = 'inline-block';

        const animatedLetter = AnimatedBox({
            animations: letterAnimations,
            child: letterWidget
        });
        
        container.appendChild(animatedLetter);
    });

    return container;
};

export default AnimatedText;
