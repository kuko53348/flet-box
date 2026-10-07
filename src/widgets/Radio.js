// widgets/Radio.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const Radio = (props) => {
  const {
    selected = false,
    onSelect,
    onPress: onPressProp,
    disabled = false,
    size = 20,
    name,
    ...rest
  } = props;

  /** @deprecated Use onPress instead */
  // onSelect kept as alias for backward compatibility
  const onPress = onPressProp || onSelect;

  let internalSelected = selected;
  let radioRef = null;
  let dotRef = null;

  const updateUI = (newSelected) => {
    if (radioRef) {
      radioRef.style.backgroundColor = newSelected
        ? colors.primary
        : "transparent";
      radioRef.style.border = `2px solid ${newSelected ? colors.primary : colors.border}`;
    }
    if (dotRef) {
      dotRef.style.display = newSelected ? "block" : "none";
    }
  };

  // Createste dot
  const dot = WidgetFactory({
    width: size / 2,
    height: size / 2,
    backgroundColor: "#fff",
    borderRadius: "50%",
    display: internalSelected ? "block" : "none",
  });
  dotRef = dot;

  // Createste main radio container
  const radio = WidgetFactory({
    width: size,
    height: size,
    border: `2px solid ${disabled ? colors.border : internalSelected ? colors.primary : colors.border}`,
    borderRadius: "50%",
    backgroundColor: internalSelected ? colors.primary : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    child: dot,
    ...rest,
  });
  radioRef = radio;

  // Handle click
  if (!disabled) {
    radio.onclick = (e) => {
      e.stopPropagation();
      if (internalSelected) return;

      const newSelected = true;
      internalSelected = newSelected;
      updateUI(newSelected);

      if (name) {
        const allRadios = document.querySelectorAll(
          `[data-radio-group="${name}"]`,
        );
        allRadios.forEach((otherRadio) => {
          if (otherRadio !== radio && otherRadio.unselect) {
            otherRadio.unselect();
          }
        });
      }

      if (onPress) onPress(true);
    };

    // Hover effect
    radio.addEventListener("mouseenter", () => {
      if (!disabled && !internalSelected) {
        radio.style.backgroundColor = colors.primary + "20";
      }
    });

    radio.addEventListener("mouseleave", () => {
      if (!disabled && !internalSelected) {
        radio.style.backgroundColor = "transparent";
      }
    });
  }

  // Public methods
  radio.select = () => {
    if (!disabled && !internalSelected) {
      internalSelected = true;
      updateUI(true);
      if (onPress) onPress(true);
    }
  };

  radio.unselect = () => {
    if (!disabled && internalSelected) {
      internalSelected = false;
      updateUI(false);
      if (onPress) onPress(false);
    }
  };

  radio.isSelected = () => internalSelected;

  if (name) {
    radio.setAttribute("data-radio-group", name);
  }

  return radio;
};

export default Radio;
