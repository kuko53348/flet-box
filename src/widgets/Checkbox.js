/**
 * @file Checkbox.js
 * @description Checkbox input with controlled/uncontrolled state.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Checkbox = (props) => {
  const {
    checked = false,
    onCheck,
    onPress: onPressProp,
    disabled = false,
    size = 20,
    activeColor = colors.primary,
    ...rest
  } = props;

  /** @deprecated Use onPress instead */
  // onCheck kept as alias for backward compatibility
  const onPress = onPressProp || onCheck;

  let internalChecked = checked;
  let checkboxRef = null;
  let checkMarkRef = null;

  const updateUI = (newChecked) => {
    if (checkboxRef) {
      checkboxRef.style.backgroundColor = newChecked ? activeColor : "transparent";
      checkboxRef.style.border = `2px solid ${newChecked ? activeColor : colors.border}`;
    }
    if (checkMarkRef) {
      checkMarkRef.style.display = newChecked ? "inline-block" : "none";
    }
  };

  // Createste checkmark
  const checkMark = WidgetFactory({
    tag: "span",
    textContent: "✓",
    color: "#fff",
    fontSize: size * 0.7,
    fontWeight: "bold",
    display: internalChecked ? "inline-block" : "none",
  });
  checkMarkRef = checkMark;

  // Createste main checkbox container
  const checkbox = WidgetFactory({
    widgetName: "Checkbox",
    width: size,
    height: size,
    border: `2px solid ${disabled ? colors.border : internalChecked ? activeColor : colors.border}`,
    borderRadius: 6,
    backgroundColor: internalChecked ? activeColor : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    child: checkMark,
    ...rest,
  });
  checkboxRef = checkbox;

  // Handle click
  if (!disabled) {
    const handleClick = (e) => {
      e.stopPropagation();
      const newChecked = !internalChecked;
      internalChecked = newChecked;
      updateUI(newChecked);
      if (onPress) onPress(newChecked);
    };
    // Route the handler through the factory's props instead of assigning
    // `onclick` directly. `assignProps` clears `onclick` on every update and only
    // re-applies handlers it can see in the merged props, so a direct assignment
    // died on the first `update()` — and every reactive setter (opacity, bgColor,
    // padding…) calls update — leaving the control unable to toggle ever again.
    checkbox.update({ onPress: handleClick });

    // Hover effect
    checkbox.addEventListener("mouseenter", () => {
      if (!disabled && !internalChecked) {
        // `color-mix` rather than `activeColor + "20"`: that string concat only
        // produced a valid color for `#rrggbb` hexes and silently broke on
        // `rgba()`, named colors and 3-digit hex `activeColor` values.
        checkbox.style.backgroundColor = `color-mix(in srgb, ${activeColor} 12%, transparent)`;
      }
    });

    checkbox.addEventListener("mouseleave", () => {
      if (!disabled && !internalChecked) {
        checkbox.style.backgroundColor = "transparent";
      }
    });
  }

  // Public methods
  checkbox.setChecked = (newChecked, triggerCallback = true) => {
    if (internalChecked !== newChecked) {
      internalChecked = newChecked;
      updateUI(newChecked);
      if (triggerCallback && onPress) onPress(newChecked);
    }
  };

  checkbox.getChecked = () => internalChecked;

  return checkbox;
};

export default Checkbox;
