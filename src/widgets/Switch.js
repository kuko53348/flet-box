// widgets/Switch.js (iOS style)
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Switch = (props) => {
  const {
    value = false,
    onToggle,
    disabled = false,
    size = "medium",
    ...rest
  } = props;

  // Sizes
  const sizes = {
    small: { width: 40, height: 24, knob: 20 },
    medium: { width: 51, height: 31, knob: 27 },
    large: { width: 60, height: 36, knob: 32 },
  };
  const sz = sizes[size] || sizes.medium;

  let internalValue = value;
  let switchRef = null;
  let knobRef = null;

  const updateUI = (newValue) => {
    if (switchRef) {
      switchRef.style.backgroundColor = newValue
        ? colors.success
        : colors.gray300;
    }
    if (knobRef) {
      knobRef.style.transform = newValue
        ? `translateX(${sz.width - sz.knob - 4}px)`
        : "translateX(0)";
    }
  };

  // Create knob
  const knob = WidgetFactory({
    width: sz.knob,
    height: sz.knob,
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    transform: internalValue
      ? `translateX(${sz.width - sz.knob - 4}px)`
      : "translateX(0)",
    transition: "transform 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  });
  knobRef = knob;

  // Create main switch container
  const switchContainer = WidgetFactory({
    width: sz.width,
    height: sz.height,
    backgroundColor: internalValue ? colors.success : colors.gray300,
    borderRadius: sz.height / 2,
    display: "flex",
    alignItems: "center",
    padding: "2px",
    transition: "all 0.2s ease",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
    child: knob,
    ...rest,
  });
  switchRef = switchContainer;

  // Handle click
  if (!disabled) {
    switchContainer.onclick = (e) => {
      e.stopPropagation();
      const newValue = !internalValue;
      internalValue = newValue;
      updateUI(newValue);
      if (onToggle) onToggle(newValue);
    };
  }

  // Public methods
  switchContainer.updateValue = (newValue) => {
    internalValue = newValue;
    updateUI(newValue);
  };

  switchContainer.getValue = () => internalValue;

  return switchContainer;
};

export default Switch;
