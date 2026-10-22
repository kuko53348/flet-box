/**
 * @file Input.js
 * @description Text input with label, validation and controlled/uncontrolled value.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { toREM } from "../utils/units.js";
import { TAP_MINIMUM } from "../tools/index.js";
import { Icon } from "./Icon.js";
import { TextInputValidator } from "../utils/TextInputValidator.js";
import { composeUpdate } from "../utils/composeUpdate.js";

/**
 * @typedef {Object} InputProps
 * @property {string} [value=""] - Initial value of the input field.
 * @property {string} [placeholder=""] - Placeholder text shown when the field is empty.
 * @property {string} [type="text"] - HTML input type (e.g. "text", "password", "email").
 * @property {string} [label] - Label text rendered above the input.
 * @property {boolean|string} [error=false] - If truthy, renders the input in error state. A string value is used as the error message.
 * @property {boolean} [disabled=false] - Disables interaction with the input.
 * @property {boolean} [readonly=false] - Makes the input read-only (focusable but not editable).
 * @property {"small"|"medium"|"large"} [size="medium"] - Controls padding and font size.
 * @property {"outlined"|"filled"|"underlined"} [variant="outlined"] - Visual style of the input border.
 * @property {boolean} [fullWidth=false] - When true, the input stretches to fill its container.
 * @property {number} [borderRadius=24] - Border radius of the input wrapper in pixels.
 * @property {string} [iconLeft] - Material icon name to show on the left side.
 * @property {string} [iconRight] - Material icon name to show on the right side.
 * @property {string} [iconColor] - Color of the icons.
 * @property {number} [iconSize=20] - Size of the icons in pixels.
 * @property {Function} [onIconPress] - Called when either icon is pressed.
 * @property {boolean} [clearable=false] - Shows a trailing button that empties the field.
 * @property {boolean} [passwordToggle=false] - Shows a trailing button that reveals or hides the value.
 * @property {Function} [onEnter] - Called with (value, event) when the user presses Enter in the field.
 * @property {"none"|"letters"|"numbers"|"email"|"alphanumeric"|"safe"|"custom"} [validation="none"] - Validation mode applied on each keystroke and on blur.
 * @property {number} [maxLength] - Maximum number of characters allowed.
 * @property {boolean} [required=false] - Marks the field as required; validation fails on empty values.
 * @property {string} [customPattern] - RegExp string used when validation is "custom".
 * @property {Function} [onValidated] - Called with (isValid, message) after every validation run.
 * @property {boolean} [showValidationMessage=true] - Whether to display the inline validation message below the input.
 * @property {boolean} [showValidationIcon=true] - Whether to show the ✓/✗ icon inside the input.
 * @property {Function} [onInput] - Called with (value, event) on every keystroke.
 * @property {Function} [onChange] - Called with (value, event) after filtering/validation.
 * @property {Function} [onFocus] - Called when the input receives focus.
 * @property {Function} [onBlur] - Called when the input loses focus and final validation runs.
 */

/** Suffix for generated field ids, so two Inputs never share one. */
let inputIdSeed = 0;

/**
 * A fully-featured text input widget with built-in validation, icons, and theme support.
 *
 * Supports multiple visual variants (outlined, filled, underlined), configurable sizes,
 * optional left/right icons, and a rich validation system driven by `TextInputValidator`.
 * The public API exposed on the returned element allows programmatic control of the value,
 * validation state, focus, and blur.
 *
 * @param {InputProps} props
 * @returns {HTMLElement} A `<div>` acting as the input container, augmented with public methods:
 *   - `getValue()` → current string value
 *   - `setValue(newValue)` → updates value and reruns validation
 *   - `isValid()` → returns whether the current value passes validation
 *   - `validate()` → runs validation and updates the UI, returns `{ valid, message }`
 *   - `reset()` → clears the value
 *   - `focus()` / `blur()` → delegate to the native `<input>`
 *   - `_input` → reference to the underlying native `<input>` element
 */
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
    borderRadius = 16,

    iconLeft,
    iconRight,
    iconColor = colors.textSecondary,
    iconSize = 20,
    onIconPress,

    clearable = false,
    passwordToggle = false,

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
    onEnter,
    ...rest
  } = props;

  // ========== INTERNAL STATE ==========
  let currentValue = value;
  let isValid = true;
  let validationMessage = "";

  // The `<label>` needs a `for` that matches the native input's `id`, otherwise
  // assistive tech never hears the field's name — the click-to-focus handler is
  // not an association. Deriving it from the caller's `id` keeps the generated
  // DOM predictable when the field is inside a form.
  const fieldId =
    typeof rest.id === "string" && rest.id
      ? `${rest.id}-input`
      : `fletbox-input-${++inputIdSeed}`;

  // DOM element references — populated during the build phase below
  let inputElement = null;
  let validationIcon = null;
  let errorMessageElement = null;
  let inputWrapper = null;
  let container = null;
  let clearButton = null;

  // Whether the native input currently holds focus. Used to keep the focus
  // ring (a box-shadow) in sync with validation colors without ever changing
  // the border width — changing the width would resize the box and shift layout.
  const isFocused = () => document.activeElement === inputElement;

  // ========== SIZES ==========
  /**
   * Framework units, not CSS strings: this widget builds a real `<input>` and
   * writes `style.*` by hand, so every length here goes through `toREM` at the
   * point of use. Written as `"10px 14px"` the field froze at 16px base and the
   * reader who raises their font got small text inside a control that should have
   * grown with it. `minHeight` is the Fitts floor — a text field is a target.
   */
  const sizes = {
    small: { padding: [4, 12], fontSize: 12, iconSize: 16, minHeight: 32 },
    medium: { padding: [8, 12], fontSize: 14, iconSize: 20, minHeight: TAP_MINIMUM },
    large: { padding: [12, 16], fontSize: 16, iconSize: 24, minHeight: 48 },
  };
  const sz = sizes[size] || sizes.medium;

  // ========== VALIDATION ==========

  /**
   * Validates a value against the current validation rules.
   * Does NOT mutate state — just returns the result so it can be used
   * both inline (on input) and on blur.
   *
   * @param {string} val - The value to validate.
   * @returns {{ valid: boolean, message: string }}
   */
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

  /**
   * Strips disallowed characters from a raw input value based on the active
   * validation mode. This is a live filter applied on every keystroke so the
   * user cannot type invalid characters in the first place.
   *
   * @param {string} val - Raw value from the input event.
   * @returns {string} Filtered value safe to store and display.
   */
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

  // ========== UPDATE VALIDATION UI ==========

  /**
   * Syncs the visible validation state (border color, icon, error message) with
   * the current `isValid` / `validationMessage` / `error` prop values.
   * Should be called after every state change that could affect the UI.
   *
   * @param {boolean} valid - Whether the current value passes validation.
   */
  const updateValidationUI = (valid) => {
    if (!inputWrapper) return;

    // Border color logic:
    // - error prop takes precedence over internal validation
    // - green border when valid and a non-trivial validation mode is active
    let borderColorValue = colors.border;
    if (error) {
      borderColorValue = colors.danger;
    } else if (!valid && currentValue) {
      borderColorValue = colors.danger;
    } else if (currentValue && valid && validation !== "none") {
      borderColorValue = colors.success;
    }

    // The border keeps a fixed 1px width in every state; focus thickness is
    // drawn as a 1px box-shadow ring instead. This changes the look on focus
    // without altering the element's box size, so nothing gets pushed around.
    if (variant === "outlined") {
      inputWrapper.style.borderColor = borderColorValue;
      inputWrapper.style.boxShadow = isFocused()
        ? `0 0 0 1px ${borderColorValue}`
        : "none";
    } else if (variant === "underlined") {
      inputWrapper.style.borderBottomColor = borderColorValue;
      inputWrapper.style.boxShadow = isFocused()
        ? `inset 0 -1px 0 0 ${borderColorValue}`
        : "none";
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

  /**
   * Central handler for every input event. Filters the raw value, enforces
   * `maxLength`, runs validation, updates the UI, and fires all relevant
   * callbacks in the correct order.
   *
   * @param {string} val - The raw value from the native input event.
   * @param {Event} event - The originating DOM event (passed through to callbacks).
   */
  const handleInput = (val, event) => {
    let filtered = filterValue(val);
    if (maxLength) filtered = filtered.slice(0, maxLength);

    currentValue = filtered;
    if (inputElement) {
      inputElement.value = filtered;
    }
    if (clearButton) clearButton.style.display = filtered ? "flex" : "none";

    const result = validateValue(filtered);
    isValid = result.valid;
    validationMessage = result.message;

    updateValidationUI(isValid);

    if (onInput) onInput(filtered, event);
    if (onValidated) onValidated(isValid, validationMessage);
    if (onChange) onChange(filtered, event);
  };

  // ========== BUILD UI ==========

  // --- Main container — uses WidgetFactory so it inherits layout helpers ---
  container = WidgetFactory({
    tag: "div",
    widgetName: "Input",
    display: "inline-flex",
    flexDirection: "column",
    gap: 4,
    width: fullWidth ? "100%" : "auto",
    disableTransform: true,
    pointerEvents: "auto",
    touchAction: "manipulation",
    ...rest,
  });

  // --- Optional label rendered above the input ---
  let labelEl = null;
  const renderLabel = (text) => {
    if (labelEl) {
      labelEl.textContent = text;
      return;
    }
    if (!text) return;
    labelEl = WidgetFactory({
      tag: "label",
      for: fieldId,
      text,
      fontSize: 12,
      fontWeight: 500,
      color: error ? colors.danger : colors.textSecondary,
      marginBottom: 4,
      cursor: "text",
    });
    // Clicking the label focuses the native input — mirrors native <label for> behavior
    labelEl.addEventListener("click", () => {
      inputElement?.focus();
    });
    container.insertBefore(labelEl, container.firstChild);
  };

  if (label) renderLabel(label + (required ? " *" : ""));

  // `label` is registered as a REACTIVE_PROP that maps to `textContent`, so if the
  // factory ever sees it, `container.textContent = "…"` replaces this whole
  // composite widget (label + wrapper + native <input> + icons) with a bare text
  // node. Own the key and update the label element instead.
  composeUpdate(container, ["label"], (props) => {
    if (props.label === undefined) return;
    renderLabel(props.label ? String(props.label) + (required ? " *" : "") : "");
    // `makeReactive` writes the value back into `_originalProps` on every setter
    // call; leaving it there means the next factory update merges it, maps it to
    // `textContent` and wipes the widget anyway.
    delete container._originalProps.label;
  });

  // --- Wrapper — contains icons + native input, owns the border/fill style ---
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
    wrapperStyles.borderRadius = toREM(borderRadius);
    wrapperStyles.border = "none";
  } else if (variant === "underlined") {
    wrapperStyles.backgroundColor = "transparent";
    wrapperStyles.borderBottom = `1px solid ${error ? colors.danger : colors.border}`;
    wrapperStyles.borderRadius = "0";
  } else {
    // Default: outlined
    wrapperStyles.backgroundColor = "transparent";
    wrapperStyles.borderRadius = toREM(borderRadius);
    wrapperStyles.border = `1px solid ${error ? colors.danger : colors.border}`;
  }

  inputWrapper = WidgetFactory({
    tag: "div",
    disableTransform: true,
    ...wrapperStyles,
  });

  // --- Optional left icon ---
  if (iconLeft) {
    const iconEl = Icon({
      name: iconLeft,
      size: iconSize || sz.iconSize,
      color: iconColor,
      marginLeft: 12,
      flexShrink: 0,
      pointerEvents: "auto",
    });
    if (onIconPress) iconEl.onclick = onIconPress;
    inputWrapper.appendChild(iconEl);
  }

  // --- Native <input> element ---
  // Using a real <input> (not a div) is critical for:
  //   - Mobile keyboard triggering
  //   - Accessibility (label association, screen readers)
  //   - Browser autofill support
  inputElement = document.createElement("input");
  inputElement.id = fieldId;
  inputElement.type = type;
  inputElement.placeholder = placeholder || "";
  inputElement.disabled = disabled || false;
  inputElement.readOnly = readonly || false;
  inputElement.value = currentValue;

  inputElement.style.flex = "1";
  inputElement.style.padding = `${toREM(sz.padding[0])} ${toREM(sz.padding[1])}`;
  inputElement.style.fontSize = toREM(sz.fontSize);
  inputElement.style.minHeight = toREM(sz.minHeight);
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

  // tabIndex ensures the element participates in keyboard navigation
  inputElement.tabIndex = 0;

  // --- Input events ---
  inputElement.addEventListener("input", (e) => {
    handleInput(e.target.value, e);
  });

  inputElement.addEventListener("focus", (e) => {
    // Highlight the border on focus to signal the active field.
    // The border width stays at 1px; the thicker focus look comes from a
    // 1px box-shadow ring so focusing never resizes the box or shifts layout.
    if (variant === "outlined") {
      inputWrapper.style.borderColor = colors.primary;
      inputWrapper.style.boxShadow = `0 0 0 1px ${colors.primary}`;
    } else if (variant === "underlined") {
      inputWrapper.style.borderBottomColor = colors.primary;
      inputWrapper.style.boxShadow = `inset 0 -1px 0 0 ${colors.primary}`;
    }
    if (onFocus) onFocus(e);
  });

  inputElement.addEventListener("blur", (e) => {
    // Restore normal border and run final validation when the user leaves the field
    if (variant === "outlined") {
      inputWrapper.style.borderColor = error ? colors.danger : colors.border;
      inputWrapper.style.boxShadow = "none";
    } else if (variant === "underlined") {
      inputWrapper.style.borderBottomColor = error
        ? colors.danger
        : colors.border;
      inputWrapper.style.boxShadow = "none";
    }
    const result = validateValue(currentValue);
    isValid = result.valid;
    validationMessage = result.message;
    updateValidationUI(isValid);
    if (onBlur) onBlur(e);
  });

  inputWrapper.appendChild(inputElement);

  inputElement.addEventListener("keydown", (e) => {
    // Enter is not a DOM event of its own: the callback receives the value the
    // user just confirmed, after the same filtering `onChange` applies.
    if (e.key === "Enter" && onEnter) onEnter(currentValue, e);
  });

  // --- Trailing controls (clear / reveal) ---
  // Real `<button type="button">` elements: they are keyboard-reachable, and the
  // `type` keeps them from submitting a form the input happens to live in.
  const makeTrailingButton = (glyph, label, onPress) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = glyph;
    btn.setAttribute("aria-label", label);
    btn.style.width = toREM(32);
    btn.style.height = toREM(32);
    btn.style.flexShrink = "0";
    btn.style.marginRight = toREM(4);
    btn.style.padding = "0";
    btn.style.border = "none";
    btn.style.background = "transparent";
    btn.style.color = colors.textSecondary;
    btn.style.fontSize = toREM(16);
    btn.style.lineHeight = "1";
    btn.style.cursor = disabled ? "not-allowed" : "pointer";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.addEventListener("click", (e) => {
      // The wrapper focuses the input on any click; a trailing control must not
      // steal that, and it must stay out of the form's submit path.
      e.preventDefault();
      e.stopPropagation();
      if (disabled || readonly) return;
      onPress(e);
    });
    inputWrapper.appendChild(btn);
    return btn;
  };

  if (clearable) {
    clearButton = makeTrailingButton("✕", "Clear", () => {
      handleInput("", null);
      inputElement.focus();
    });
    clearButton.style.display = currentValue ? "flex" : "none";
  }

  if (passwordToggle) {
    let revealed = type !== "password";
    const paint = (btn) => {
      btn.textContent = revealed ? "🙈" : "👁";
      btn.setAttribute("aria-label", revealed ? "Hide value" : "Show value");
    };
    const btn = makeTrailingButton("👁", "Show value", () => {
      revealed = !revealed;
      inputElement.type = revealed ? "text" : "password";
      paint(btn);
      // Keep the caret where the user left it: swapping the type recreates the
      // native field's rendering, so refocusing without restoring the selection
      // would jump the cursor to the end.
      const end = inputElement.value.length;
      inputElement.setSelectionRange?.(end, end);
      inputElement.focus();
    });
    paint(btn);
    // `inputElement.type` was already set from `type`; the button only mirrors it.
  }

  // --- Inline validation icon (✓ / ✗) shown inside the input on the right ---
  if (showValidationIcon && validation !== "none") {
    validationIcon = document.createElement("span");
    validationIcon.textContent = "";
    validationIcon.style.width = toREM(24);
    validationIcon.style.fontSize = toREM(16);
    validationIcon.style.display = "none";
    validationIcon.style.alignItems = "center";
    validationIcon.style.justifyContent = "center";
    validationIcon.style.marginRight = toREM(8);
    validationIcon.style.flexShrink = "0";
    inputWrapper.appendChild(validationIcon);
  }

  // --- Optional right icon ---
  if (iconRight) {
    const iconEl = Icon({
      name: iconRight,
      size: iconSize || sz.iconSize,
      color: iconColor,
      marginRight: 12,
      flexShrink: 0,
      pointerEvents: "auto",
    });
    if (onIconPress) iconEl.onclick = onIconPress;
    inputWrapper.appendChild(iconEl);
  }

  container.appendChild(inputWrapper);

  // --- Error message element rendered below the input ---
  errorMessageElement = document.createElement("span");
  errorMessageElement.textContent = "";
  errorMessageElement.style.fontSize = toREM(12);
  errorMessageElement.style.color = colors.danger;
  errorMessageElement.style.marginTop = toREM(4);
  errorMessageElement.style.display = "none";
  container.appendChild(errorMessageElement);

  // ========== FORCE FOCUS (mobile and desktop) ==========
  // Clicking anywhere in the wrapper (not just on the <input>) should focus it.
  // This matters most on mobile where touch targets need to be larger.
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

  // ========== PUBLIC API ==========
  // These methods are attached directly to the container DOM node so callers
  // can interact with the input without holding a separate reference.

  /** @returns {string} The current value of the input. */
  container.getValue = () => inputElement?.value || "";

  /**
   * Programmatically sets the input value and reruns validation.
   * @param {string} newValue - The value to set.
   */
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

  /** @returns {boolean} Whether the current value passes all validation rules. */
  container.isValid = () => validateValue(currentValue).valid;

  /**
   * Runs validation against the current value and updates the UI.
   * Useful for triggering validation on form submit without waiting for blur.
   * @returns {{ valid: boolean, message: string }}
   */
  container.validate = () => {
    const result = validateValue(currentValue);
    updateValidationUI(result.valid);
    return result;
  };

  /** Clears the input value (equivalent to `setValue("")`). */
  container.reset = () => container.setValue("");

  /** Focuses the native input element. */
  container.focus = () => inputElement?.focus();

  /** Removes focus from the native input element. */
  container.blur = () => inputElement?.blur();

  // Direct reference to the native <input> for advanced use cases
  container._input = inputElement;

  return container;
};

export default Input;
