// widgets/Dropdown.js - Con textColor, borderRadius y bgColor unificados
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Container } from "./Container.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";

export const Dropdown = (props) => {
  const {
    options = [],
    value = null,
    onChange,
    placeholder = "Select...",
    disabled = false,
    label,
    error = false,
    variant = "outlined",
    size = "medium",
    borderRadius = 8,
    color = colors.primary,
    bgColor = colors.surface,
    textColor = colors.text, // ← NUEVO: color del texto general
    optionHoverColor = colors.border, // ← fondo al hover sobre opción
    clearable = false,
    width = "100%",
    portal = true,
    ...rest
  } = props;

  // Estado interno
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
  let currentTextColor = textColor; // ← guardar textColor
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

  // Actualizar visualización del selector
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
        style: { flex: 1 },
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

  // Construir selector
  const selectedOption = findSelected();
  const displayText = selectedOption ? getLabel(selectedOption) : "";
  const displayIcon = selectedOption ? getIcon(selectedOption) : null;

  const leftContent = [];
  if (displayIcon) leftContent.push(Text({ text: displayIcon, size: 16 }));
  leftContent.push(
    Text({
      text: displayText || currentPlaceholder,
      size: currentSize.fontSize,
      color: displayText ? currentTextColor : colors.textSecondary,
      style: { flex: 1 },
    }),
  );

  const rightContent = [];
  if (currentClearable && selectedValue && !currentDisabled) {
    const clearIcon = Icon({
      name: "close",
      size: 16,
      style: { cursor: "pointer" },
      onclick: (e) => {
        e.stopPropagation();
        if (!currentDisabled) {
          selectedValue = null;
          if (onChange) onChange(null);
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
    style: { transition: "transform 0.2s" },
  });
  rightContent.push(arrowIcon);

  const selector = Row({
    alignItems: "center",
    justifyContent: "space-between",
    style: {
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
      color: currentTextColor, // heredar color de texto
    },
    children: [
      Row({
        alignItems: "center",
        gap: 8,
        style: { flex: 1 },
        children: leftContent,
      }),
      Row({ alignItems: "center", gap: 4, children: rightContent }),
    ],
  });

  // Contenedor principal
  const container = Container({
    style: { position: "relative", width: width },
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

  // Funciones de menú (portal)
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
      style: {
        zIndex: 10000,
        border: `1px solid ${colors.border}`,
        backgroundColor: currentBgColor,
        borderRadius: `${currentBorderRadius}px`, // mismo borderRadius
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        maxHeight: "250px",
        overflowY: "auto",
        margin: 0,
        padding: 0,
        color: currentTextColor, // heredar textColor
      },
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
          style: { flex: 1 },
          color: currentTextColor,
        }),
      );

      const optionItem = Row({
        style: {
          padding: "10px 16px",
          cursor: "pointer",
          backgroundColor: isSelected ? currentColor + "15" : "transparent",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        },
        children: [
          Row({
            alignItems: "center",
            gap: 8,
            style: { flex: 1 },
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
          if (onChange) onChange(optValue);
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

  // API pública y reactividad
  const update = (newProps) => {
    let needsDisplayUpdate = false;
    if (newProps.options !== undefined) {
      currentOptions = [...newProps.options];
      needsDisplayUpdate = true;
    }
    if (newProps.value !== undefined && newProps.value !== selectedValue) {
      selectedValue = newProps.value;
      needsDisplayUpdate = true;
      if (onChange) onChange(selectedValue);
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
  container.update = update;

  const cleanup = () => {
    closeMenu();
  };
  container._cleanup = cleanup;

  return container;
};

export default Dropdown;
