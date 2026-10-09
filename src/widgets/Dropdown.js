/**
 * @file Dropdown.js
 * @description Select dropdown with portal menu, unified textColor/borderRadius/bgColor.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { Container } from "./Container.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";

/**
 * Props owned by the Dropdown's closure state. Routed to the widget's `update`
 * and never to the factory's (see `composeUpdate`).
 */
const DROPDOWN_PROP_KEYS = [
  "options", "value", "onChange", "onPress", "placeholder", "disabled",
  "label", "error", "variant", "size", "borderRadius",
  "color", "bgColor", "textColor", "optionHoverColor", "clearable",
  "width", "portal",
];

export const Dropdown = (props) => {
  const {
    options = [],
    value = null,
    onChange,
    /** @deprecated Use onPress instead */
    onPress: onPressProp,
    placeholder = "Select...",
    disabled = false,
    label,
    error = false,
    variant = "outlined",
    size = "medium",
    borderRadius = 8,
    color = colors.primary,
    bgColor = colors.surface,
    textColor = colors.text, // ← NEW: general text color
    optionHoverColor = colors.border, // ← hover background on option
    clearable = false,
    width = "100%",
    portal = true,
    ...rest
  } = props;

  // onPress is the canonical callback name; onChange is kept as a deprecated alias
  const effectiveOnChange = onPressProp || onChange;

  // Internal state
  let isOpen = false;
  let selectedValue = value;
  let currentOptions = [...options];
  let currentDisabled = disabled;
  let currentError = error;
  let currentVariant = variant;
  let currentPlaceholder = placeholder;
  let currentLabel = label;
  let currentClearable = clearable;
  let currentColor = color;
  let currentBgColor = bgColor;
  let currentTextColor = textColor; // ← store textColor
  let currentBorderRadius = borderRadius;
  let currentOptionHoverColor = optionHoverColor;

  let menuElement = null;
  let outsideClickListener = null;
  let resizeListener = null;
  let scrollListener = null;

  const sizes = {
    small: { padding: "6px 12px", fontSize: 12 },
    medium: { padding: "8px 14px", fontSize: 14 },
    large: { padding: "12px 16px", fontSize: 16 },
  };
  let currentSize = sizes[size] || sizes.medium;

  const getLabel = (opt) =>
    typeof opt === "object" ? opt.label || String(opt.value) : String(opt);
  const getValue = (opt) => (typeof opt === "object" ? opt.value : opt);
  const getIcon = (opt) => (typeof opt === "object" ? opt.icon || null : null);
  const findSelected = () =>
    currentOptions.find((opt) => getValue(opt) === selectedValue);

  // Update selector display
  const updateDisplay = () => {
    if (!selector) return;
    const selected = findSelected();
    const displayText = selected ? getLabel(selected) : "";
    const displayIcon = selected ? getIcon(selected) : null;

    const leftRow = selector.children[0];
    if (!leftRow) return;
    while (leftRow.firstChild) leftRow.removeChild(leftRow.firstChild);

    if (displayIcon) leftRow.appendChild(Text({ text: displayIcon, size: 16 }));
    leftRow.appendChild(
      Text({
        text: displayText || currentPlaceholder,
        size: currentSize.fontSize,
        color: displayText ? currentTextColor : colors.textSecondary,
        flex: 1,
      }),
    );

    if (selector.style) {
      if (currentVariant === "outlined") {
        selector.style.border = `1px solid ${currentError ? colors.danger : colors.border}`;
      }
      selector.style.opacity = currentDisabled ? "0.5" : "1";
      selector.style.cursor = currentDisabled ? "not-allowed" : "pointer";
    }
  };

  // Build selector
  const selectedOption = findSelected();
  const displayText = selectedOption ? getLabel(selectedOption) : "";
  const displayIcon = selectedOption ? getIcon(selectedOption) : null;

  const leftContent = [];
  if (displayIcon) {
    leftContent.push(
      Text({ text: displayIcon, size: 16, flexShrink: 0 }),
    );
  }
  leftContent.push(
    Text({
      text: displayText || currentPlaceholder,
      size: currentSize.fontSize,
      color: displayText ? currentTextColor : colors.textSecondary,
      // minWidth 0 + overflow hidden: un nombre de entidad largo se recorta con
      // puntos suspensivos en vez de empujar la flecha fuera del selector.
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
  );

  const rightContent = [];
  if (currentClearable && selectedValue && !currentDisabled) {
    const clearIcon = Icon({
      name: "close",
      size: 16,
      cursor: "pointer",
      onclick: (e) => {
        e.stopPropagation();
        if (!currentDisabled) {
          selectedValue = null;
          if (effectiveOnChange) effectiveOnChange(null);
          updateDisplay();
          closeMenu();
        }
      },
    });
    rightContent.push(clearIcon);
  }

  const arrowIcon = Icon({
    name: "expand_more",
    size: 20,
    transition: "transform 0.2s",
  });
  rightContent.push(arrowIcon);

  const selector = Row({
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: currentSize.padding,
    backgroundColor:
      currentVariant === "filled" ? `${currentBgColor}CC` : "transparent",
    border:
      currentVariant === "outlined"
        ? `1px solid ${currentError ? colors.danger : colors.border}`
        : "none",
    borderRadius: `${currentBorderRadius}px`,
    cursor: currentDisabled ? "not-allowed" : "pointer",
    opacity: currentDisabled ? 0.5 : 1,
    boxSizing: "border-box",
    color: currentTextColor, // inherit text color
    children: [
      Row({
        alignItems: "center",
        gap: 8,
        // minWidth: 0 para que un texto largo ENCOJA y no empuje al icono: sin
        // él, el span no puede bajar de su ancho de contenido y el
        // expand_more sale del selector.
        flex: 1,
        minWidth: 0,
        children: leftContent,
      }),
      // El Row de la derecha TIENE que medir lo que su contenido. Row() trae
      // width "100%" por defecto, y con eso este bloque se apropiaba de casi
      // todo el ancho del selector: al no llevar justifyContent, el glifo
      // quedaba anclado a su borde izquierdo, pegado al texto, en vez de
      // apartado a la derecha. flexShrink 0 evita además que se apriete cuando
      // el texto es largo.
      Row({
        alignItems: "center",
        gap: 4,
        width: "auto",
        flexShrink: 0,
        children: rightContent,
      }),
    ],
  });

  // Main container
  const container = Container({
    widgetName: "Dropdown",
    position: "relative",
    width: width,
    ...rest,
  });

  if (currentLabel) {
    const labelEl = WidgetFactory({
      tag: "label",
      textContent: currentLabel,
      fontSize: "12px",
      color: currentError ? colors.danger : colors.textSecondary,
      marginBottom: "4px",
      display: "block",
    });
    container.appendChild(labelEl);
  }
  container.appendChild(selector);

  // Menu functions (portal)
  const closeMenu = () => {
    if (!isOpen) return;
    if (menuElement && menuElement.parentNode) {
      menuElement.parentNode.removeChild(menuElement);
    }
    menuElement = null;
    arrowIcon.style.transform = "rotate(0deg)";
    isOpen = false;

    if (outsideClickListener)
      document.removeEventListener("click", outsideClickListener);
    if (resizeListener) window.removeEventListener("resize", resizeListener);
    if (scrollListener) window.removeEventListener("scroll", scrollListener);
    outsideClickListener = resizeListener = scrollListener = null;
  };

  const updateMenuPosition = () => {
    if (!menuElement) return;
    const selectorRect = selector.getBoundingClientRect();
    const menuHeight = menuElement.offsetHeight;
    const viewportHeight = window.innerHeight;

    let left = selectorRect.left;
    if (left + selectorRect.width > window.innerWidth) {
      left = window.innerWidth - selectorRect.width;
    }
    left = Math.max(8, left);

    let top = selectorRect.bottom + 4;
    let bottom = "auto";
    if (top + menuHeight > viewportHeight) {
      top = "auto";
      bottom = viewportHeight - selectorRect.top + 4;
    }

    menuElement.style.position = "fixed";
    menuElement.style.left = `${left}px`;
    menuElement.style.width = `${selectorRect.width}px`;
    if (top !== "auto") {
      menuElement.style.top = `${top}px`;
      menuElement.style.bottom = "auto";
    } else {
      menuElement.style.top = "auto";
      menuElement.style.bottom = `${bottom}px`;
    }
  };

  const openMenu = () => {
    if (currentDisabled || isOpen) return;
    closeMenu();
    isOpen = true;

    menuElement = Column({
      zIndex: 10000,
      border: `1px solid ${colors.border}`,
      backgroundColor: currentBgColor,
      borderRadius: `${currentBorderRadius}px`, // same borderRadius
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      maxHeight: "250px",
      overflowY: "auto",
      margin: 0,
      padding: 0,
      color: currentTextColor, // inherit textColor
    });

    currentOptions.forEach((opt) => {
      const optValue = getValue(opt);
      const optLabel = getLabel(opt);
      const optIcon = getIcon(opt);
      const isSelected = optValue === selectedValue;

      const leftOption = [];
      if (optIcon)
        leftOption.push(
          Text({ text: optIcon, size: 16, color: currentTextColor }),
        );
      leftOption.push(
        Text({
          text: optLabel,
          size: currentSize.fontSize,
          flex: 1,
          color: currentTextColor,
        }),
      );

      const optionItem = Row({
        padding: "10px 16px",
        cursor: "pointer",
        backgroundColor: isSelected ? currentColor + "15" : "transparent",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        children: [
          Row({
            alignItems: "center",
            gap: 8,
            flex: 1,
            children: leftOption,
          }),
          isSelected
            ? Icon({ name: "check", size: 16, color: currentColor })
            : null,
        ].filter(Boolean),
      });

      optionItem.onmouseenter = () => {
        if (!isSelected)
          optionItem.style.backgroundColor = currentOptionHoverColor;
      };
      optionItem.onmouseleave = () => {
        optionItem.style.backgroundColor = isSelected
          ? currentColor + "15"
          : "transparent";
      };
      optionItem.onclick = (e) => {
        e.stopPropagation();
        if (!currentDisabled) {
          selectedValue = optValue;
          if (effectiveOnChange) effectiveOnChange(optValue);
          updateDisplay();
          closeMenu();
        }
      };
      menuElement.appendChild(optionItem);
    });

    if (portal) {
      document.body.appendChild(menuElement);
      updateMenuPosition();
      resizeListener = () => updateMenuPosition();
      scrollListener = () => updateMenuPosition();
      window.addEventListener("resize", resizeListener);
      window.addEventListener("scroll", scrollListener, true);
    } else {
      container.appendChild(menuElement);
      menuElement.style.position = "absolute";
      menuElement.style.left = "0";
      menuElement.style.top = "100%";
      menuElement.style.width = "100%";
    }

    arrowIcon.style.transform = "rotate(180deg)";

    outsideClickListener = (e) => {
      if (
        !container.contains(e.target) &&
        (!menuElement || !menuElement.contains(e.target))
      ) {
        closeMenu();
      }
    };
    document.addEventListener("click", outsideClickListener);
  };

  selector.onclick = (e) => {
    e.stopPropagation();
    if (currentDisabled) return;
    isOpen ? closeMenu() : openMenu();
  };

  // Public API and reactivity
  const update = (newProps) => {
    let needsDisplayUpdate = false;
    if (newProps.options !== undefined) {
      currentOptions = [...newProps.options];
      needsDisplayUpdate = true;
    }
    if (newProps.value !== undefined && newProps.value !== selectedValue) {
      selectedValue = newProps.value;
      needsDisplayUpdate = true;
      if (effectiveOnChange) effectiveOnChange(selectedValue);
    }
    if (newProps.disabled !== undefined) {
      currentDisabled = newProps.disabled;
      needsDisplayUpdate = true;
      if (currentDisabled && isOpen) closeMenu();
    }
    if (newProps.error !== undefined) {
      currentError = newProps.error;
      needsDisplayUpdate = true;
    }
    if (newProps.variant !== undefined) {
      currentVariant = newProps.variant;
      needsDisplayUpdate = true;
    }
    if (newProps.placeholder !== undefined) {
      currentPlaceholder = newProps.placeholder;
      needsDisplayUpdate = true;
    }
    if (newProps.label !== undefined) {
      currentLabel = newProps.label;
      const existingLabel = container.querySelector("label");
      if (existingLabel) existingLabel.textContent = currentLabel;
      else if (currentLabel) {
        const labelEl = WidgetFactory({
          tag: "label",
          textContent: currentLabel,
          fontSize: "12px",
          color: currentError ? colors.danger : colors.textSecondary,
          marginBottom: "4px",
          display: "block",
        });
        container.insertBefore(labelEl, container.firstChild);
      }
    }
    if (newProps.clearable !== undefined) {
      currentClearable = newProps.clearable;
      needsDisplayUpdate = true;
    }
    if (newProps.color !== undefined) {
      currentColor = newProps.color;
      needsDisplayUpdate = true;
    }
    if (newProps.bgColor !== undefined) {
      currentBgColor = newProps.bgColor;
      needsDisplayUpdate = true;
    }
    if (newProps.textColor !== undefined) {
      currentTextColor = newProps.textColor;
      needsDisplayUpdate = true;
    }
    if (newProps.borderRadius !== undefined) {
      currentBorderRadius = newProps.borderRadius;
      needsDisplayUpdate = true;
    }
    if (newProps.optionHoverColor !== undefined) {
      currentOptionHoverColor = newProps.optionHoverColor;
    }
    if (newProps.size !== undefined && sizes[newProps.size]) {
      currentSize = sizes[newProps.size];
      needsDisplayUpdate = true;
    }
    if (needsDisplayUpdate) {
      updateDisplay();
      selector.style.padding = currentSize.padding;
      selector.style.borderRadius = `${currentBorderRadius}px`;
      if (currentVariant === "outlined")
        selector.style.border = `1px solid ${currentError ? colors.danger : colors.border}`;
      else selector.style.border = "none";
      selector.style.backgroundColor =
        currentVariant === "filled" ? `${currentBgColor}CC` : "transparent";
    }
  };

  Object.defineProperty(container, "value", {
    get: () => selectedValue,
    set: (v) => update({ value: v }),
  });
  Object.defineProperty(container, "options", {
    get: () => currentOptions,
    set: (opts) => update({ options: opts }),
  });
  Object.defineProperty(container, "disabled", {
    get: () => currentDisabled,
    set: (d) => update({ disabled: d }),
  });
  Object.defineProperty(container, "error", {
    get: () => currentError,
    set: (e) => update({ error: e }),
  });
  container.open = openMenu;
  container.close = closeMenu;
  composeUpdate(container, DROPDOWN_PROP_KEYS, update);

  container.onUnmount(() => {
    closeMenu();
  });

  return container;
};

export default Dropdown;
