// widgets/Input.js - VERSIÓN COMPLETA Y FUNCIONAL
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Icon } from "./Icon.js";
import { TextInputValidator } from "../utils/TextInputValidator.js";

export const Input = (props) => {
  // ========== PROPS ==========
  const {
    value = "",
    placeholder = "",
    type = "text",
    label,
    error = false,
    disabled = false,
    readonly = false,
    size = "medium",
    variant = "outlined",
    fullWidth = false,
    borderRadius = 24,

    iconLeft,
    iconRight,
    iconColor = colors.textSecondary,
    iconSize = 20,
    onIconPress,

    validation = "none",
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

  // ========== ESTADO INTERNO ==========
  let currentValue = value;
  let isValid = true;
  let validationMessage = "";

  // Referencias
  let inputElement = null;
  let validationIcon = null;
  let errorMessageElement = null;
  let inputWrapper = null;
  let container = null;

  // ========== TAMAÑOS ==========
  const sizes = {
    small: { padding: "6px 12px", fontSize: "12px", iconSize: 16 },
    medium: { padding: "10px 14px", fontSize: "14px", iconSize: 20 },
    large: { padding: "14px 18px", fontSize: "16px", iconSize: 24 },
  };
  const sz = sizes[size] || sizes.medium;

  // ========== VALIDACIÓN ==========
  const validateValue = (val) => {
    let valid = true;
    let message = "";

    if (required && !val) {
      valid = false;
      message = "This field is required";
    } else if (val && valid) {
      switch (validation) {
        case "letters":
          if (!TextInputValidator.isOnlyLetters(val)) {
            valid = false;
            message = "Only letters allowed";
          }
          break;
        case "numbers":
          if (!TextInputValidator.isOnlyNumbers(val)) {
            valid = false;
            message = "Only numbers allowed";
          }
          break;
        case "email":
          if (!TextInputValidator.isEmail(val)) {
            valid = false;
            message = "Invalid email address";
          }
          break;
        case "alphanumeric":
          if (!/^[a-zA-Z0-9\s]+$/.test(val)) {
            valid = false;
            message = "Only letters and numbers allowed";
          }
          break;
        case "safe":
          if (!TextInputValidator.isSafe(val)) {
            valid = false;
            message = "Contains unsafe characters";
          }
          break;
        case "custom":
          if (customPattern && !new RegExp(customPattern).test(val)) {
            valid = false;
            message = "Invalid format";
          }
          break;
      }
    }
    return { valid, message };
  };

  const filterValue = (val) => {
    if (!val) return val;
    switch (validation) {
      case "letters":
        return TextInputValidator.onlyLetters(val);
      case "numbers":
        return TextInputValidator.onlyNumbers(val);
      case "email":
        return TextInputValidator.filterEmail(val);
      case "alphanumeric":
        return TextInputValidator.onlyAlphanumeric(val);
      case "safe":
        return TextInputValidator.safeText(val);
      default:
        return val;
    }
  };

  // ========== ACTUALIZAR UI DE VALIDACIÓN ==========
  const updateValidationUI = (valid) => {
    if (!inputWrapper) return;

    let borderColorValue = colors.border;
    if (error) {
      borderColorValue = colors.danger;
    } else if (!valid && currentValue) {
      borderColorValue = colors.danger;
    } else if (currentValue && valid && validation !== "none") {
      borderColorValue = colors.success;
    }

    if (variant === "outlined") {
      inputWrapper.style.borderColor = borderColorValue;
    } else if (variant === "underlined") {
      inputWrapper.style.borderBottomColor = borderColorValue;
    }

    if (showValidationIcon && validationIcon) {
      if (currentValue && validation !== "none") {
        validationIcon.textContent = isValid ? "✓" : "✗";
        validationIcon.style.color = isValid ? colors.success : colors.danger;
        validationIcon.style.display = "flex";
      } else {
        validationIcon.style.display = "none";
      }
    }

    if (errorMessageElement) {
      if (validationMessage && showValidationMessage && !isValid && !error) {
        errorMessageElement.textContent = validationMessage;
        errorMessageElement.style.color = colors.danger;
        errorMessageElement.style.display = "block";
      } else if (error) {
        errorMessageElement.textContent =
          error === true ? "Invalid value" : error;
        errorMessageElement.style.color = colors.danger;
        errorMessageElement.style.display = "block";
      } else {
        errorMessageElement.style.display = "none";
      }
    }
  };

  const handleInput = (val, event) => {
    let filtered = filterValue(val);
    if (maxLength) filtered = filtered.slice(0, maxLength);

    currentValue = filtered;
    if (inputElement) {
      inputElement.value = filtered;
    }

    const result = validateValue(filtered);
    isValid = result.valid;
    validationMessage = result.message;

    updateValidationUI(isValid);

    if (onInput) onInput(filtered, event);
    if (onValidated) onValidated(isValid, validationMessage);
    if (onChange) onChange(filtered, event);
  };

  // ========== CONSTRUIR UI ==========

  // --- Contenedor principal con WidgetFactory ---
  container = WidgetFactory({
    tag: "div",
    display: "inline-flex",
    flexDirection: "column",
    gap: 4,
    width: fullWidth ? "100%" : "auto",
    disableTransform: true,
    pointerEvents: "auto",
    touchAction: "manipulation",
    ...rest,
  });

  // --- Label ---
  if (label) {
    const requiredMark = required ? " *" : "";
    const labelEl = WidgetFactory({
      tag: "label",
      text: label + requiredMark,
      fontSize: 12,
      fontWeight: 500,
      color: error ? colors.danger : colors.textSecondary,
      marginBottom: 2,
      cursor: "text",
    });
    labelEl.addEventListener("click", () => {
      inputElement?.focus();
    });
    container.appendChild(labelEl);
  }

  // --- Wrapper (contiene iconos + input) ---
  let wrapperStyles = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    transition: "all 0.2s ease",
    pointerEvents: "auto",
    touchAction: "manipulation",
  };

  if (variant === "filled") {
    wrapperStyles.backgroundColor = colors.gray100;
    wrapperStyles.borderRadius =
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;
    wrapperStyles.border = "none";
  } else if (variant === "underlined") {
    wrapperStyles.backgroundColor = "transparent";
    wrapperStyles.borderBottom = `1px solid ${error ? colors.danger : colors.border}`;
    wrapperStyles.borderRadius = "0";
  } else {
    wrapperStyles.backgroundColor = "transparent";
    wrapperStyles.borderRadius =
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;
    wrapperStyles.border = `1px solid ${error ? colors.danger : colors.border}`;
  }

  inputWrapper = WidgetFactory({
    tag: "div",
    disableTransform: true,
    ...wrapperStyles,
  });

  // --- Icono izquierdo ---
  if (iconLeft) {
    const iconEl = Icon({
      name: iconLeft,
      size: iconSize || sz.iconSize,
      color: iconColor,
      marginLeft: "12px",
      flexShrink: 0,
      pointerEvents: "auto",
    });
    if (onIconPress) iconEl.onclick = onIconPress;
    inputWrapper.appendChild(iconEl);
  }

  // --- INPUT NATIVO (la clave del éxito) ---
  inputElement = document.createElement("input");
  inputElement.type = type;
  inputElement.placeholder = placeholder || "";
  inputElement.disabled = disabled || false;
  inputElement.readOnly = readonly || false;
  inputElement.value = currentValue;

  inputElement.style.flex = "1";
  inputElement.style.padding = sz.padding;
  inputElement.style.fontSize = sz.fontSize;
  inputElement.style.border = "none";
  inputElement.style.outline = "none";
  inputElement.style.backgroundColor = "transparent";
  inputElement.style.fontFamily = "inherit";
  inputElement.style.width = "100%";
  inputElement.style.boxSizing = "border-box";
  inputElement.style.touchAction = "manipulation";
  inputElement.style.userSelect = "text";
  inputElement.style.color = disabled ? colors.textDisabled : colors.text;
  inputElement.style.cursor = disabled ? "not-allowed" : "text";

  // Asignar tabIndex para que sea enfocable
  inputElement.tabIndex = 0;

  // --- Eventos del input ---
  inputElement.addEventListener("input", (e) => {
    handleInput(e.target.value, e);
  });

  inputElement.addEventListener("focus", (e) => {
    if (variant === "outlined") {
      inputWrapper.style.borderColor = colors.primary;
      inputWrapper.style.borderWidth = "2px";
    } else if (variant === "underlined") {
      inputWrapper.style.borderBottomColor = colors.primary;
      inputWrapper.style.borderBottomWidth = "2px";
    }
    if (onFocus) onFocus(e);
  });

  inputElement.addEventListener("blur", (e) => {
    if (variant === "outlined") {
      inputWrapper.style.borderColor = error ? colors.danger : colors.border;
      inputWrapper.style.borderWidth = "1px";
    } else if (variant === "underlined") {
      inputWrapper.style.borderBottomColor = error
        ? colors.danger
        : colors.border;
      inputWrapper.style.borderBottomWidth = "1px";
    }
    const result = validateValue(currentValue);
    isValid = result.valid;
    validationMessage = result.message;
    updateValidationUI(isValid);
    if (onBlur) onBlur(e);
  });

  inputWrapper.appendChild(inputElement);

  // --- Icono de validación ---
  if (showValidationIcon && validation !== "none") {
    validationIcon = document.createElement("span");
    validationIcon.textContent = "";
    validationIcon.style.width = "24px";
    validationIcon.style.fontSize = "16px";
    validationIcon.style.display = "none";
    validationIcon.style.alignItems = "center";
    validationIcon.style.justifyContent = "center";
    validationIcon.style.marginRight = "8px";
    validationIcon.style.flexShrink = "0";
    inputWrapper.appendChild(validationIcon);
  }

  // --- Icono derecho ---
  if (iconRight) {
    const iconEl = Icon({
      name: iconRight,
      size: iconSize || sz.iconSize,
      color: iconColor,
      marginRight: "12px",
      flexShrink: 0,
      pointerEvents: "auto",
    });
    if (onIconPress) iconEl.onclick = onIconPress;
    inputWrapper.appendChild(iconEl);
  }

  container.appendChild(inputWrapper);

  // --- Mensaje de error ---
  errorMessageElement = document.createElement("span");
  errorMessageElement.textContent = "";
  errorMessageElement.style.fontSize = "11px";
  errorMessageElement.style.color = colors.danger;
  errorMessageElement.style.marginTop = "2px";
  errorMessageElement.style.display = "none";
  container.appendChild(errorMessageElement);

  // ========== FORZAR FOCO (móvil y escritorio) ==========
  inputWrapper.addEventListener("click", (e) => {
    if (e.target !== inputElement) {
      inputElement.focus();
    }
  });

  inputWrapper.addEventListener(
    "touchstart",
    (e) => {
      if (e.target !== inputElement) {
        inputElement.focus();
      }
    },
    { passive: true },
  );

  container.addEventListener("click", (e) => {
    if (e.target === container || e.target === label) {
      inputElement.focus();
    }
  });

  // ========== API PÚBLICA ==========
  container.getValue = () => inputElement?.value || "";
  container.setValue = (newValue) => {
    currentValue = newValue;
    if (inputElement) {
      inputElement.value = newValue;
    }
    const result = validateValue(newValue);
    isValid = result.valid;
    validationMessage = result.message;
    updateValidationUI(isValid);
  };
  container.isValid = () => validateValue(currentValue).valid;
  container.validate = () => {
    const result = validateValue(currentValue);
    updateValidationUI(result.valid);
    return result;
  };
  container.reset = () => container.setValue("");
  container.focus = () => inputElement?.focus();
  container.blur = () => inputElement?.blur();

  // Exponer el input por si se necesita
  container._input = inputElement;

  return container;
};

export default Input;
