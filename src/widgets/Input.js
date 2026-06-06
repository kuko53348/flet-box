// widgets/Input.js
import { createWidget } from '../widget-builder/index.js';
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';
import { Icon } from './Icon.js';
import { TextInputValidator } from '../utils/TextInputValidator.js';

export const Input = (props) => {
    const {
        value = '',
        placeholder = '',
        type = 'text',
        label,
        disabled = false,
        readonly = false,
        size = 'medium',
        variant = 'outlined',
        fullWidth = false,
        borderRadius = 24,
        iconLeft,
        iconRight,
        iconColor = colors.textSecondary,
        iconSize = 20,
        onIconPress,
        validation = 'none',
        maxLength,
        required = false,
        customPattern,
        onValidated,
        showValidationMessage = true,
        showValidationIcon = true,
        onInput,
        onChange,
        onFocus,
        onBlur,
        ...rest
    } = props;

    let currentValue = value;
    let isValid = true;
    let validationMessage = '';
    let inputElement = null;
    let validationIcon = null;
    let errorMessageElement = null;
    let inputWrapper = null;

    const sizes = {
        small: { padding: '6px 12px', fontSize: '12px', iconSize: 16 },
        medium: { padding: '10px 14px', fontSize: '14px', iconSize: 20 },
        large: { padding: '14px 18px', fontSize: '16px', iconSize: 24 }
    };
    const sz = sizes[size] || sizes.medium;

    const getInputMode = (t) => {
        switch (t) {
            case 'email': return 'email';
            case 'number': return 'numeric';
            case 'tel': return 'tel';
            case 'url': return 'url';
            case 'search': return 'search';
            default: return 'text';
        }
    };

    const getAutoComplete = (t) => {
        if (t === 'email') return 'email';
        if (t === 'tel') return 'tel';
        if (t === 'url') return 'url';
        return 'off';
    };

    const validateValue = (val) => {
        let valid = true;
        let message = '';

        if (required && !val) {
            valid = false;
            message = 'This field is required';
        } else if (val && valid) {
            switch (validation) {
                case 'letters':
                    if (!TextInputValidator.isOnlyLetters(val)) {
                        valid = false;
                        message = 'Only letters allowed';
                    }
                    break;
                case 'numbers':
                    if (!TextInputValidator.isOnlyNumbers(val)) {
                        valid = false;
                        message = 'Only numbers allowed';
                    }
                    break;
                case 'email':
                    if (!TextInputValidator.isEmail(val)) {
                        valid = false;
                        message = 'Invalid email address';
                    }
                    break;
                case 'alphanumeric':
                    if (!/^[a-zA-Z0-9\s]+$/.test(val)) {
                        valid = false;
                        message = 'Only letters and numbers allowed';
                    }
                    break;
                case 'safe':
                    if (!TextInputValidator.isSafe(val)) {
                        valid = false;
                        message = 'Contains unsafe characters';
                    }
                    break;
                case 'custom':
                    if (customPattern && !new RegExp(customPattern).test(val)) {
                        valid = false;
                        message = 'Invalid format';
                    }
                    break;
            }
        }
        return { valid, message };
    };

    const filterValue = (val) => {
        if (!val) return val;
        switch (validation) {
            case 'letters': return TextInputValidator.onlyLetters(val);
            case 'numbers': return TextInputValidator.onlyNumbers(val);
            case 'email': return TextInputValidator.filterEmail(val);
            case 'alphanumeric': return TextInputValidator.onlyAlphanumeric(val);
            case 'safe': return TextInputValidator.safeText(val);
            default: return val;
        }
    };

    const updateUI = () => {
        if (!inputWrapper) return;

        let borderColor = colors.border;
        if (!isValid && currentValue) borderColor = colors.danger;
        else if (currentValue && isValid && validation !== 'none') borderColor = colors.success;

        if (variant === 'outlined') {
            inputWrapper.style.borderColor = borderColor;
        } else if (variant === 'underlined') {
            inputWrapper.style.borderBottomColor = borderColor;
        }

        if (showValidationIcon && validationIcon) {
            if (currentValue && validation !== 'none') {
                validationIcon.textContent = isValid ? '✓' : '✗';
                validationIcon.style.color = isValid ? colors.success : colors.danger;
                validationIcon.style.display = 'inline-flex';
            } else {
                validationIcon.style.display = 'none';
            }
        }

        if (errorMessageElement) {
            if (validationMessage && showValidationMessage && !isValid) {
                errorMessageElement.textContent = validationMessage;
                errorMessageElement.style.display = 'block';
            } else {
                errorMessageElement.style.display = 'none';
            }
        }
    };

    const handleInput = (val, event) => {
        let filtered = filterValue(val);
        if (maxLength && filtered.length > maxLength) {
            filtered = filtered.slice(0, maxLength);
        }

        currentValue = filtered;
        if (inputElement) inputElement.value = filtered;

        const result = validateValue(filtered);
        isValid = result.valid;
        validationMessage = result.message;

        updateUI();

        if (onInput) onInput(filtered, event);
        if (onValidated) onValidated(isValid, validationMessage);
        if (onChange) onChange(filtered, event);
    };

    // Construcción del DOM...
    const container = WidgetFactory({
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '4px',
        width: fullWidth ? '100%' : 'auto',
        ...rest
    });

    if (label) {
        const requiredMark = required ? ' *' : '';
        const labelEl = WidgetFactory({
            tag: 'label',
            textContent: label + requiredMark,
            fontSize: '12px',
            fontWeight: '500',
            color: colors.textSecondary,
            marginBottom: '2px'
        });
        container.appendChild(labelEl);
    }

    let wrapperStyles = {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        transition: 'all 0.2s ease',
        position: 'relative'
    };
    if (variant === 'filled') {
        wrapperStyles.backgroundColor = colors.gray100;
        wrapperStyles.borderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
        wrapperStyles.border = 'none';
    } else if (variant === 'underlined') {
        wrapperStyles.backgroundColor = 'transparent';
        wrapperStyles.borderBottom = `1px solid ${colors.border}`;
        wrapperStyles.borderRadius = '0';
    } else {
        wrapperStyles.backgroundColor = 'transparent';
        wrapperStyles.borderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
        wrapperStyles.border = `1px solid ${colors.border}`;
    }
    inputWrapper = WidgetFactory({ style: wrapperStyles });

    if (iconLeft) {
        const iconEl = Icon({ name: iconLeft, size: iconSize || sz.iconSize, color: iconColor, marginLeft: '12px' });
        if (onIconPress) iconEl.onclick = onIconPress;
        inputWrapper.appendChild(iconEl);
    }

    const finalType = type === 'number' ? 'text' : type;
    inputElement = createWidget('input')({
        type: finalType,
        inputmode: getInputMode(type),
        autocomplete: getAutoComplete(type),
        value: currentValue,
        placeholder: placeholder,
        disabled: disabled,
        readOnly: readonly,
        maxlength: maxLength,  // ← Para limitar caracteres
        style: {
            flex: 1,
            padding: sz.padding,
            fontSize: sz.fontSize,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontFamily: 'inherit',
            width: '100%',
            color: disabled ? colors.textDisabled : colors.text
        }
    });

    inputElement.oninput = (e) => handleInput(e.target.value, e);
    inputElement.onfocus = (e) => {
        if (variant === 'outlined') {
            inputWrapper.style.borderColor = colors.primary;
            inputWrapper.style.borderWidth = '2px';
        }
        if (onFocus) onFocus(e);
    };
    inputElement.onblur = (e) => {
        if (variant === 'outlined') {
            inputWrapper.style.borderColor = !isValid && currentValue ? colors.danger : colors.border;
            inputWrapper.style.borderWidth = '1px';
        }
        if (onBlur) onBlur(e);
    };
    inputWrapper.appendChild(inputElement);

    if (showValidationIcon && validation !== 'none') {
        validationIcon = createWidget('span')({
            textContent: '',
            style: {
                width: '24px',
                fontSize: '16px',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px'
            }
        });
        inputWrapper.appendChild(validationIcon);
    }

    if (iconRight) {
        const iconEl = Icon({ name: iconRight, size: iconSize || sz.iconSize, color: iconColor, style: { marginRight: '12px' } });
        if (onIconPress) iconEl.onclick = onIconPress;
        inputWrapper.appendChild(iconEl);
    }

    container.appendChild(inputWrapper);

    errorMessageElement = createWidget('span')({
        textContent: '',
        style: {
            fontSize: '11px',
            color: colors.danger,
            marginTop: '2px',
            display: 'none'
        }
    });
    container.appendChild(errorMessageElement);

    // Inicializar
    if (currentValue) {
        const result = validateValue(currentValue);
        isValid = result.valid;
        validationMessage = result.message;
        updateUI();
    }

    container.getValue = () => currentValue;
    container.setValue = (newValue) => {
        currentValue = newValue;
        if (inputElement) inputElement.value = newValue;
        const result = validateValue(newValue);
        isValid = result.valid;
        validationMessage = result.message;
        updateUI();
    };
    container.isValid = () => validateValue(currentValue).valid;
    container.validate = () => {
        const result = validateValue(currentValue);
        isValid = result.valid;
        validationMessage = result.message;
        updateUI();
        return result;
    };
    container.reset = () => container.setValue('');
    container.focus = () => inputElement?.focus();
    container.blur = () => inputElement?.blur();

    return container;
};

export default Input;
