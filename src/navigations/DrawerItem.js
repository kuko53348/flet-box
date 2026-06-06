// src/navigations/DrawerItem.js
import { Container } from '../widgets/Container.js';
import { Row } from '../widgets/Row.js';
import { Text } from '../widgets/Text.js';
import { Icon } from '../widgets/Icon.js';
import { colors } from '../utils/themes.js';
import { goTo, isActive } from './Router.js';
import { closeDrawer } from './Drawer.js';

export const DrawerItem = (props) => {
    const {
        icon,
        label,
        route,
        onPress,
        trailingIcon = 'chevron_right',
        selected = false,
        
        // ========== COLORES ==========
        hintColor = colors.gray100,
        selectedColor = colors.primary,
        unselectedColor = colors.text,
        iconColor,                    // si no se especifica, hereda
        trailingIconColor,            // si no se especifica, hereda
        
        closeOnPress = true,
        ...rest
    } = props;

    const isSelected = selected || (route ? isActive(route, false) : false);
    
    // Colores finales (con herencia lógica)
    const finalTextColor = isSelected ? selectedColor : unselectedColor;
    const finalIconColor = iconColor || finalTextColor;
    const finalTrailingIconColor = trailingIconColor || finalTextColor;

    const handlePress = () => {
        onPress?.();
        if (!onPress && route) goTo(route);
        if (closeOnPress) closeDrawer();
    };

    return Container({
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: isSelected ? `${selectedColor}15` : 'transparent',
        transition: 'background-color 0.2s ease',
        borderRadius: '8px',
        margin: '4px 8px',
        style: rest.style,
        child: Row({
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            children: [
                icon && Icon({ name: icon, size: 22, color: finalIconColor }),
                Text({ 
                    text: label, 
                    size: 15, 
                    color: finalTextColor,
                    fontWeight: isSelected ? '600' : '400',
                    flex: 1
                }),
                trailingIcon && Icon({ name: trailingIcon, size: 18, color: finalTrailingIconColor })
            ].filter(Boolean)
        }),
        onclick: handlePress,
        onmouseenter: (e) => {
            if (!isSelected) {
                e.currentTarget.style.backgroundColor = hintColor;
            }
        },
        onmouseleave: (e) => {
            if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent';
            }
        }
    });
};

export default DrawerItem;
