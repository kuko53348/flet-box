/**
 * @file Dropdown.js
 * @description Select dropdown with portal menu, unified textColor/borderRadius/bgColor.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { isReactive, reactiveKeyOf, resolveReactive } from "../widget-factory/reactiveValue.js";
import { registerWidget } from "../tools/useState.js";
import { Container } from "./Container.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { toREM } from "../utils/units.js";
import { TAP_MINIMUM } from "../tools/index.js";

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

/**
 * The owned keys `update()` can actually apply, so they are also the ones worth
 * subscribing. A callback is never bound: `onChange` has no branch in `update()`.
 */
const BINDABLE_KEYS = [
  "options", "value", "placeholder", "disabled", "label", "error", "variant",
  "size", "borderRadius", "color", "bgColor", "textColor", "optionHoverColor",
  "clearable",
];

/** The menu is mounted into a portal on `document.body`, so the combobox has to
 *  point at it by id (`aria-controls`, then `aria-activedescendant` for the
 *  highlighted row). Same seed pattern as `Input`. */
let dropdownIdSeed = 0;

export const Dropdown = (inputProps = {}) => {
  // The factory never receives these keys, so it can neither resolve a `useState`
  // value for them (a live reactive is a *function*, and `findSelected()` would
  // compare it against the option list and never match) nor subscribe this widget
  // to the key. Both happen here instead: read once, keep the keys, bind after
  // `composeUpdate` has routed a later patch into `update()`.
  const boundKeys = new Map();
  const props = { ...inputProps };
  for (const key of BINDABLE_KEYS) {
    const value = inputProps[key];
    if (!isReactive(value)) continue;
    props[key] = resolveReactive(value);
    const stateKey = reactiveKeyOf(value);
    if (stateKey) boundKeys.set(key, stateKey);
  }

  const {
    options = [],
    value = null,
    /** @deprecated Use `onPress` instead — it receives the same value. */
    onChange,
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

  // A keyboard user never moves focus into the menu: the combobox keeps it and
  // points at the highlighted row through `aria-activedescendant`. So the open
  // menu needs its option nodes in build order, and one index into them.
  let optionNodes = [];
  let activeIndex = -1;

  const baseId =
    typeof rest.id === "string" && rest.id
      ? rest.id
      : `fletbox-dropdown-${++dropdownIdSeed}`;
  const listboxId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;
  const optionId = (index) => `${listboxId}-option-${index}`;

  /** [vertical, horizontal] in framework units — see `Input`: a `"8px 14px"`
   *  string is raw CSS and stops the field growing with the reader's font. */
  const sizes = {
    small: { padding: [4, 12], fontSize: 12, minHeight: 32 },
    medium: { padding: [8, 12], fontSize: 14, minHeight: TAP_MINIMUM },
    large: { padding: [12, 16], fontSize: 16, minHeight: 48 },
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
      // 16 of glyph plus 12 of padding on each side is the 40-unit target. The
      // negative vertical margin keeps that box from stretching the field: the
      // padding is paid to the thumb, not to the header.
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginVertical: -12,
      cursor: "pointer",
      "aria-label": "Clear selection",
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

  // The engine decides whether a control is keyboard-operable by reading
  // `widget.onclick` while the factory runs, so the press path belongs in these
  // props and not in an assignment made after `Row()` has returned — assigned
  // late, the selector stayed a plain `div` no keyboard could ever reach.
  //
  // `disableTransform` because this row is the full width of the field: it must
  // not shrink or lift on press, and the arrow already rotates for that.
  const pressSelector = (event) => {
    if (event) event.stopPropagation();
    if (currentDisabled) return;
    if (!isOpen) {
      openMenu();
      return;
    }
    // Open: Enter and Space take the highlighted row, the way a native select
    // does. With nothing highlighted they only close it.
    if (activeIndex >= 0) chooseOption(activeIndex);
    else closeMenu();
  };

  const selector = Row({
    role: "combobox",
    "aria-haspopup": "listbox",
    "aria-expanded": "false",
    // The label is a sibling `<label>` that describes nothing of its own; naming
    // the combobox from it is what makes the field read as "Country, collapsed"
    // instead of an unnamed box.
    "aria-labelledby": currentLabel ? labelId : undefined,
    tabIndex: currentDisabled ? -1 : 0,
    onclick: pressSelector,
    disableTransform: true,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: currentSize.padding[0],
    paddingHorizontal: currentSize.padding[1],
    minHeight: currentSize.minHeight,
    backgroundColor:
      currentVariant === "filled" ? `${currentBgColor}CC` : "transparent",
    border:
      currentVariant === "outlined"
        ? `1px solid ${currentError ? colors.danger : colors.border}`
        : "none",
    borderRadius: currentBorderRadius,
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

  // The root must not paint a surface: only the selector does, and an
  // `outlined` selector is deliberately transparent. Container's default
  // background otherwise showed through behind the label as a full-width
  // block, and painted the outlined field as if it were filled.
  const container = Container({
    widgetName: "Dropdown",
    position: "relative",
    width: width,
    bgColor: "transparent",
    ...rest,
  });

  if (currentLabel) {
    const labelEl = WidgetFactory({
      tag: "label",
      id: labelId,
      textContent: currentLabel,
      fontSize: 12,
      color: currentError ? colors.danger : colors.textSecondary,
      marginBottom: 4,
      display: "block",
    });
    container.appendChild(labelEl);
  }
  container.appendChild(selector);

  // The states that follow these props are set here instead of in the props
  // object, because `update()` patches this child directly and the factory never
  // re-runs for it — a prop could only be read once, at build.
  const syncControlState = () => {
    selector.setAttribute("aria-disabled", String(Boolean(currentDisabled)));
    selector.tabIndex = currentDisabled ? -1 : 0;
    if (currentError) selector.setAttribute("aria-invalid", "true");
    else selector.removeAttribute("aria-invalid");
    if (currentLabel) selector.setAttribute("aria-labelledby", labelId);
    else selector.removeAttribute("aria-labelledby");
  };
  syncControlState();

  // Menu functions (portal)
  const closeMenu = () => {
    if (!isOpen) return;
    if (menuElement && menuElement.parentNode) {
      menuElement.parentNode.removeChild(menuElement);
    }
    menuElement = null;
    optionNodes = [];
    activeIndex = -1;
    arrowIcon.style.transform = "rotate(0deg)";
    isOpen = false;
    // The listbox is gone from the DOM: leaving `aria-controls` or
    // `aria-activedescendant` pointing at it is a broken reference a screen
    // reader reads as an announcement that never arrives.
    selector.setAttribute("aria-expanded", "false");
    selector.removeAttribute("aria-controls");
    selector.removeAttribute("aria-activedescendant");

    if (outsideClickListener)
      document.removeEventListener("click", outsideClickListener);
    if (resizeListener) window.removeEventListener("resize", resizeListener);
    // The capture flag MUST match the one used when adding (see the `scroll`
    // registration below), otherwise the listener is never removed: every
    // open/close cycle leaked one window listener holding the whole closure.
    if (scrollListener)
      window.removeEventListener("scroll", scrollListener, true);
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

  /** A row's background comes from its state, not from the last pointer event:
   *  one question — highlighted, selected, or neither — so the keyboard and the
   *  mouse cannot paint two different answers. */
  const optionBackground = (index) => {
    if (index === activeIndex) return currentOptionHoverColor;
    const opt = currentOptions[index];
    return opt !== undefined && getValue(opt) === selectedValue
      ? currentColor + "15"
      : "transparent";
  };

  const paintOption = (index) => {
    const node = optionNodes[index];
    if (node) node.style.backgroundColor = optionBackground(index);
  };

  /** Focus never moves into the menu: the combobox keeps it and points at the
   *  highlighted row, which is what lets a 200-item list stay one tab stop. */
  const setActive = (next) => {
    if (!optionNodes.length) return;
    const clamped = Math.max(0, Math.min(next, optionNodes.length - 1));
    if (clamped === activeIndex) return;
    const previous = activeIndex;
    activeIndex = clamped;
    paintOption(previous);
    const node = optionNodes[activeIndex];
    paintOption(activeIndex);
    node.scrollIntoView({ block: "nearest" });
    selector.setAttribute("aria-activedescendant", node.id);
  };

  /** The single path that commits a value — the click on a row and Enter on the
   *  highlighted row both come through here, so `onPress` fires exactly once. */
  const chooseOption = (index) => {
    const opt = currentOptions[index];
    if (opt === undefined) return;
    const optValue = getValue(opt);
    selectedValue = optValue;
    if (effectiveOnChange) effectiveOnChange(optValue);
    updateDisplay();
    closeMenu();
  };

  const openMenu = () => {
    if (currentDisabled || isOpen) return;
    closeMenu();
    isOpen = true;

    menuElement = Column({
      id: listboxId,
      role: "listbox",
      zIndex: 10000,
      border: `1px solid ${colors.border}`,
      backgroundColor: currentBgColor,
      borderRadius: currentBorderRadius, // same borderRadius
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      maxHeight: "250px",
      overflowY: "auto",
      margin: 0,
      padding: 0,
      color: currentTextColor, // inherit textColor
    });

    currentOptions.forEach((opt, index) => {
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
        id: optionId(index),
        // `option`, not `button`: a screen reader in listbox mode reads the rows
        // as choices and stays in browse mode, so the arrow keys keep meaning
        // "next choice" instead of "next focus stop". `tabIndex -1` for the same
        // reason — a long list must not become a hundred tab stops; the highlight
        // moves instead of the focus.
        role: "option",
        "aria-selected": String(isSelected),
        tabIndex: -1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        minHeight: TAP_MINIMUM,
        cursor: "pointer",
        backgroundColor: isSelected ? currentColor + "15" : "transparent",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
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

      // Hover moves the highlight, so the row under the pointer is the row Enter
      // would take. Leaving repaints from state instead of wiping to
      // "transparent": that is what dropped the keyboard highlight as soon as the
      // mouse crossed an option on its way past it.
      optionItem.onmouseenter = () => setActive(index);
      optionItem.onmouseleave = () => paintOption(index);
      optionItem.onclick = (e) => {
        e.stopPropagation();
        if (!currentDisabled) chooseOption(index);
      };
      menuElement.appendChild(optionItem);
      optionNodes.push(optionItem);
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

    // Only once the listbox is in the DOM: while it is detached these are
    // references to nothing.
    selector.setAttribute("aria-expanded", "true");
    selector.setAttribute("aria-controls", listboxId);
    const selectedIndex = currentOptions.findIndex(
      (entry) => getValue(entry) === selectedValue,
    );
    if (selectedIndex >= 0) setActive(selectedIndex);

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

  // Enter and Space are deliberately absent: the engine's own key handler calls
  // `onclick` for those, and `pressSelector` already opens while closed and takes
  // the highlighted row while open. Handling them again here would run the press
  // twice — open, then immediately choose.
  //
  // `event.target !== selector` leaves a keystroke to whatever control inside the
  // field actually holds it.
  const onSelectorKeyDown = (e) => {
    if (e.target !== selector || currentDisabled) return;
    const total = optionNodes.length;

    if (!isOpen) {
      // Opening with an arrow lands on the current value, or the first choice
      // when nothing is selected yet — the same place a native select puts it.
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openMenu();
        const start = currentOptions.findIndex(
          (entry) => getValue(entry) === selectedValue,
        );
        setActive(start >= 0 ? start : 0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive(activeIndex <= 0 ? total - 1 : activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(total - 1);
        break;
      case "Escape":
        // Discard, the way a native select does: closing on Escape must not
        // commit the row the arrows happened to rest on.
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        break;
      case "Tab":
        // Leaving the control closes the menu; a detached listbox behind the tab
        // order is a region of the page no key can reach again.
        closeMenu();
        break;
      default:
        if (e.key.length === 1) {
          const typed = e.key.toLowerCase();
          const found = currentOptions.findIndex((entry) =>
            getLabel(entry).toLowerCase().startsWith(typed),
          );
          if (found >= 0) {
            e.preventDefault();
            setActive(found);
          }
        }
    }
  };

  selector.addEventListener("keydown", onSelectorKeyDown);
  container.onUnmount(() =>
    selector.removeEventListener("keydown", onSelectorKeyDown),
  );

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
          id: labelId,
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
      syncControlState();
      updateDisplay();
      selector.style.padding = `${toREM(currentSize.padding[0])} ${toREM(currentSize.padding[1])}`;
      selector.style.minHeight = toREM(currentSize.minHeight);
      selector.style.borderRadius = toREM(currentBorderRadius);
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

  // Bind after composing: `registerWidget` pushes the current store value through
  // `update`, which must be the composed one that routes owned keys into this
  // widget's closure. It also releases the subscription on unmount by itself.
  for (const [propName, stateKey] of boundKeys) registerWidget(stateKey, container, propName);

  container.onUnmount(() => {
    closeMenu();
  });

  return container;
};

export default Dropdown;
