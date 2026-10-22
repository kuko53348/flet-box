/**
 * @file Radio.js
 * @description Radio input with controlled/uncontrolled selection state.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { TAP_MINIMUM } from "../tools/index.js";

export const Radio = (props) => {
  const {
    selected = false,
    onSelect,
    onPress: onPressProp,
    disabled = false,
    size = 20,
    name,
    activeColor = colors.primary,
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
      radioRef.style.backgroundColor = newSelected ? activeColor : "transparent";
      radioRef.style.border = `2px solid ${newSelected ? activeColor : colors.border}`;
    }
    if (dotRef) {
      dotRef.style.display = newSelected ? "block" : "none";
    }
  };

  // Createste dot
  const dot = WidgetFactory({
    width: Math.max(8, Math.round(size * 0.4)),
    height: Math.max(8, Math.round(size * 0.4)),
    backgroundColor: "#fff",
    borderRadius: "50%",
    display: internalSelected ? "block" : "none",
  });
  dotRef = dot;

  // The visual circle: a 2-unit ring and the fill, nothing else.
  const circle = WidgetFactory({
    width: size,
    height: size,
    border: `2px solid ${disabled ? colors.border : internalSelected ? activeColor : colors.border}`,
    borderRadius: "50%",
    backgroundColor: internalSelected ? activeColor : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    child: dot,
  });
  radioRef = circle;

  // Createste main radio container — the finger's box, larger than the ring it
  // centres, because radios are chosen with a thumb and a 20-unit circle is not
  // something a thumb hits reliably.
  const radio = WidgetFactory({
    widgetName: "Radio",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: TAP_MINIMUM,
    minHeight: TAP_MINIMUM,
    flexShrink: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    child: circle,
    ...rest,
  });

  // Handle click
  if (!disabled) {
    const handleClick = (e) => {
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
    // Routed through the factory props: `assignProps` clears `onclick` on every
    // update and only re-applies handlers present in the merged props, so a
    // direct assignment died on the first `update()` or reactive setter.
    radio.update({ onPress: handleClick });

    // Hover effect — on the drawn ring, not the hit box around it.
    radio.addEventListener("mouseenter", () => {
      if (!disabled && !internalSelected) {
        circle.style.backgroundColor = `color-mix(in srgb, ${activeColor} 12%, transparent)`;
      }
    });

    radio.addEventListener("mouseleave", () => {
      if (!disabled && !internalSelected) {
        circle.style.backgroundColor = "transparent";
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
