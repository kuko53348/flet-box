// widgets/Checkbox.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Checkbox = (props) => {
  const {
    checked = false,
    onCheck,
    disabled = false,
    size = 20,
    ...rest
  } = props;

  let internalChecked = checked;
  let checkboxRef = null;
  let checkMarkRef = null;

  const updateUI = (newChecked) => {
    if (checkboxRef) {
      checkboxRef.style.backgroundColor = newChecked
        ? colors.primary
        : "transparent";
      checkboxRef.style.border = `2px solid ${newChecked ? colors.primary : colors.border}`;
    }
    if (checkMarkRef) {
      checkMarkRef.style.display = newChecked ? "inline-block" : "none";
    }
  };

  // Create checkmark
  const checkMark = WidgetFactory({
    tag: "span",
    textContent: "✓",
    color: "#fff",
    fontSize: size * 0.7,
    fontWeight: "bold",
    display: internalChecked ? "inline-block" : "none",
  });
  checkMarkRef = checkMark;

  // Create main checkbox container
  const checkbox = WidgetFactory({
    width: size,
    height: size,
    border: `2px solid ${disabled ? colors.border : internalChecked ? colors.primary : colors.border}`,
    borderRadius: 6,
    backgroundColor: internalChecked ? colors.primary : "transparent",
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
    checkbox.onclick = (e) => {
      e.stopPropagation();
      const newChecked = !internalChecked;
      internalChecked = newChecked;
      updateUI(newChecked);
      if (onCheck) onCheck(newChecked);
    };

    // Hover effect
    checkbox.addEventListener("mouseenter", () => {
      if (!disabled && !internalChecked) {
        checkbox.style.backgroundColor = colors.primary + "20";
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
      if (triggerCallback && onCheck) onCheck(newChecked);
    }
  };

  checkbox.getChecked = () => internalChecked;

  return checkbox;
};

export default Checkbox;
