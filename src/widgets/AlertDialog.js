// widgets/AlertDialog.js - Basado en Modal
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { Text } from './Text.js';
import { Column } from './Column.js';
import { Row } from './Row.js';
import { Icon } from './Icon.js';
import { colors } from '../utils/themes.js';

export const AlertDialog = (props) => {
    const {
        title,
        message,
        confirmText = 'Aceptar',
        cancelText = 'Cancelar',
        onConfirm,
        onCancel,
        onClose,
        variant = 'normal', // 'normal', 'danger', 'warning', 'success'
        showCancel = true,
        ...rest
    } = props;

    // Colores según variante
    const variantColors = {
        normal: { confirm: colors.primary, icon: 'info', iconColor: colors.info },
        danger: { confirm: colors.danger, icon: 'warning', iconColor: colors.danger },
        warning: { confirm: colors.warning, icon: 'error', iconColor: colors.warning },
        success: { confirm: colors.success, icon: 'check_circle', iconColor: colors.success }
    };
    const variantStyle = variantColors[variant] || variantColors.normal;

    // Icono según variante
    const icon = Icon({
        name: variantStyle.icon,
        size: 40,
        color: variantStyle.iconColor,
        marginBottom: 8 
    });

    // Contenido del modal
    const content = Column({
        alignItems: 'center',
        style: { textAlign: 'center' },
        children: [
            icon,
            Text({ value: title, size: 24, fontWeight: 'bold', color: colors.text, textAlign: 'center' }),
            Text({ value: message, size: 18,fontWeight: 'bold', color: colors.textSecondary, textAlign: 'center', style: { marginTop: 8 } })
        ]
    });

    // Acciones
    const actions = [];
    
    if (showCancel) {
        actions.push(
            Button({
                text: cancelText,
                variant: 'outlined',
                color: colors.textSecondary,
                onPress: () => {
                    if (onCancel) onCancel();
                    closeModal();
                }
            })
        );
    }
    
    actions.push(
        Button({
            text: confirmText,
            variant: 'filled',
            color: variantStyle.confirm,
            onPress: () => {
                if (onConfirm) onConfirm();
                closeModal();
            }
        })
    );

    let modal = null;
    let closeModal = () => {};

    // Crear modal
    modal = Modal({
        content: content,
        actions: actions,
        showCloseButton: false,
        width: 320,
        borderRadius: 24,
        onClose: () => {
            if (onClose) onClose();
        },
        ...rest
    });

    closeModal = () => modal.close();

    // Métodos públicos
    const open = () => modal.open();
    const close = () => modal.close();

    return { open, close, modal };
};

export default AlertDialog;
