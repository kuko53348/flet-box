// navigations/AppBar.js - Con soporte completo para gradientes y colores sólidos
import { createWidget } from '../widget-builder/index.js';
import { Container } from '../widgets/Container.js';
import { Row } from '../widgets/Row.js';
import { Text } from '../widgets/Text.js';
import { Icon } from '../widgets/Icon.js';
import { colors } from '../utils/themes.js';
import { goBack, goTo } from './Router.js';

export const AppBar = (props) => {
    const {
        title,
        leading = null,
        actions = [],
        backgroundColor = colors.surface,
        gradient = null,                     // ← Nueva prop para gradientes
        titleColor = colors.text,
        iconColor = titleColor,
        elevation = 2,
        centerTitle = false,
        titleSize = 20,
        titleWeight = '500',
        
        // Navegación
        showBackButton = false,
        backButtonRoute = null,
        onBackPress = null,
        
        // Props de estilo
        margin = 0,
        marginTop = 0,
        marginBottom = 0,
        marginLeft = 0,
        marginRight = 0,

        padding = 0,
        paddingTop = 0,
        paddingBottom = 0,
        paddingLeft = 14,
        paddingRight = 14,
        borderRadius = 0,
        shadow = true,
        
        // Nuevas props
        sticky = true,
        hideOnScroll = false,
        scrollThreshold = 100,
        ...rest
    } = props;

    const finalMarginTop = marginTop || margin;
    const finalMarginBottom = marginBottom || margin;
    const finalMarginLeft = marginLeft || margin;
    const finalMarginRight = marginRight || margin;

    const finalPaddingTop = paddingTop || padding;
    const finalPaddingBottom = paddingBottom || padding;
    const finalPaddingLeft = paddingLeft || padding;
    const finalPaddingRight = paddingRight || padding;

    const finalBorderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

    const shadows = {
        0: 'none',
        1: '0 1px 3px rgba(0,0,0,0.12)',
        2: '0 3px 6px rgba(0,0,0,0.16)',
        3: '0 6px 12px rgba(0,0,0,0.2)',
        4: '0 10px 20px rgba(0,0,0,0.25)',
        5: '0 15px 30px rgba(0,0,0,0.3)'
    };
    const boxShadow = shadow === true ? shadows[elevation] : (shadow || 'none');

    // ========== DETERMINAR LEADING ==========
    let finalLeading = leading;
    
    // Si showBackButton está activado, crear botón de retroceso automático
    if (showBackButton && !finalLeading) {
        const backButton = Icon({
            name: 'arrow_back',
            size: 24,
            color: iconColor,
            cursor: 'pointer'
        });
        
        backButton.onclick = () => {
            if (onBackPress) {
                onBackPress();
            } else if (backButtonRoute) {
                goTo(backButtonRoute);
            } else {
                goBack();
            }
        };
        
        finalLeading = backButton;
    }

    // ========== CONSTRUIR ESTILO DE FONDO ==========
    let backgroundStyle = {};
    if (gradient) {
        // Los gradientes se aplican como imagen de fondo
        backgroundStyle = { backgroundImage: gradient };
    } else if (backgroundColor) {
        // Colores sólidos se aplican como color de fondo
        backgroundStyle = { backgroundColor: backgroundColor };
    }

    // ========== CREAR APPBAR ==========
    const appBar = createWidget('header')({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: `calc(100% - ${finalMarginLeft}px - ${finalMarginRight}px)`,
        minHeight: 56,
        ...backgroundStyle,                     // ← Fondo (color o gradiente)
        borderRadius: finalBorderRadius,

        marginTop: `${finalMarginTop}px`,
        marginBottom: `${finalMarginBottom}px`,
        marginLeft: `${finalMarginLeft}px`,
        marginRight: `${finalMarginRight}px`,

        paddingTop: `${finalPaddingTop}px`,
        paddingBottom: `${finalPaddingBottom}px`,
        paddingLeft: `${finalPaddingLeft}px`,
        paddingRight: `${finalPaddingRight}px`,

        boxShadow: boxShadow,
        flexShrink: 0,
        
        // Posición sticky
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 0 : 'auto',
        zIndex: sticky ? 100 : 'auto',
        
        style: {
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            ...rest.style
        },
        ...rest
    });

    // ========== LEFT SECTION (transparente para mostrar el fondo) ==========
    const leftSection = Container({
        display: 'flex',
        alignItems: 'center',
        bgColor: 'transparent',
        justifyContent: 'flex-start',
        minWidth: 48,
        flexShrink: 0,
        child: finalLeading
    });

    // ========== TITLE SECTION ==========
    let titleElement;
    if (typeof title === 'string') {
        titleElement = Text({
            value: title,
            size: titleSize,
            fontWeight: titleWeight,
            color: titleColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.15px'
        });
    } else if (title) {
        titleElement = title;
    }

    const centerSection = Container({
        flex: centerTitle ? 1 : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: centerTitle ? 'center' : 'flex-start',
        padding: '0 8px',
        bgColor: 'transparent',
        overflow: 'hidden',
        minWidth: 0,
        child: titleElement
    });

    // ========== RIGHT SECTION ==========
    const rightSection = Row({
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        minWidth: 48,
        flexShrink: 0,
        style: { backgroundColor: 'transparent' },
        children: actions
    });

    appBar.appendChild(leftSection);
    appBar.appendChild(centerSection);
    appBar.appendChild(rightSection);

    // ========== HIDE ON SCROLL (opcional) ==========
    if (hideOnScroll) {
        let lastScrollY = 0;
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
                // Scrolling down - ocultar
                appBar.style.transform = 'translateY(-100%)';
                appBar.style.opacity = '0';
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up - mostrar
                appBar.style.transform = 'translateY(0)';
                appBar.style.opacity = '1';
            }
            
            lastScrollY = currentScrollY;
        };
        
        window.addEventListener('scroll', handleScroll);
        
        // Limpiar al destruir
        appBar._cleanupScroll = () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }

    // ========== MÉTODOS PÚBLICOS ==========
    appBar.setTitle = (newTitle) => {
        if (typeof newTitle === 'string') {
            const titleText = centerSection.querySelector('span:not(.material-icons)');
            if (titleText) titleText.textContent = newTitle;
        }
    };
    
    appBar.setBackgroundColor = (color) => {
        // Si se pasa un gradiente, aplicar como imagen; si no, como color sólido
        if (color && color.includes('gradient')) {
            appBar.style.backgroundImage = color;
            appBar.style.backgroundColor = '';
        } else {
            appBar.style.backgroundColor = color;
            appBar.style.backgroundImage = '';
        }
    };
    
    appBar.show = () => {
        appBar.style.display = 'flex';
    };
    
    appBar.hide = () => {
        appBar.style.display = 'none';
    };
    
    // ========== CLEANUP ==========
    const originalCleanup = appBar._cleanup;
    appBar._cleanup = () => {
        if (originalCleanup) originalCleanup();
        if (appBar._cleanupScroll) appBar._cleanupScroll();
    };

    return appBar;
};

export default AppBar;
