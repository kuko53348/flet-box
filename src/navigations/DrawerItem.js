// src/navigations/DrawerItem.js
import { Container } from "../widgets/Container.js";
import { Row } from "../widgets/Row.js";
import { Text } from "../widgets/Text.js";
import { Icon } from "../widgets/Icon.js";
import { colors } from "../utils/themes.js";
import { goTo, subscribe, getCurrentPath } from "./Router.js";
import { closeDrawer } from "./Drawer.js";

const selectionEvent = new EventTarget();
let globalCurrentPath = getCurrentPath();

subscribe(() => {
  globalCurrentPath = getCurrentPath();
  selectionEvent.dispatchEvent(
    new CustomEvent("route-changed", { detail: { path: globalCurrentPath } }),
  );
});

export const DrawerItem = (props) => {
  const {
    icon,
    label,
    route,
    onPress,
    onSelect,
    borderRadius = 24,
    gap = 12,
    disableTransform = true,
    trailingIcon = "chevron_right",
    hintColor = colors.gray100,
    selectedColor = colors.primary,
    unselectedColor = colors.text,
    iconColor,
    trailingIconColor,
    closeOnPress = true,
    ...rest
  } = props;

  let containerRef = null;
  let textRef = null;
  let iconRef = null;
  let trailingIconRef = null;
  let isSelected = false;
  let unsubscribeRouter = null;
  let unsubscribeGlobal = null;

  const updateUI = () => {
    const finalTextColor = isSelected ? selectedColor : unselectedColor;
    const finalIconColor = iconColor || finalTextColor;
    const finalTrailingIconColor = trailingIconColor || finalTextColor;
    
    if (containerRef) {
      containerRef.style.backgroundColor = isSelected
        ? `${selectedColor}15`
        : "transparent";
      // --- NUEVO: Reflejar estado para lectores de pantalla ---
      containerRef.setAttribute("aria-selected", isSelected.toString());
    }
    if (textRef) {
      textRef.style.color = finalTextColor;
      textRef.style.fontWeight = isSelected ? "600" : "400";
    }
    if (iconRef) iconRef.style.color = finalIconColor;
    if (trailingIconRef) trailingIconRef.style.color = finalTrailingIconColor;
  };

  const checkActive = () => {
    const currentPath = getCurrentPath();
    const shouldBeSelected =
      route === currentPath || (route === "/" && currentPath === "");
    if (shouldBeSelected !== isSelected) {
      isSelected = shouldBeSelected;
      updateUI();
    }
  };

  const handleClick = () => {
    if (!isSelected) {
      isSelected = true;
      updateUI();
      selectionEvent.dispatchEvent(
        new CustomEvent("drawer-item-selected", { detail: { id: label } }),
      );
    }
    if (onSelect) onSelect();
    if (onPress) onPress();
    if (route) goTo(route);
    if (closeOnPress) closeDrawer();
  };

  unsubscribeRouter = subscribe(() => checkActive());
  const handleGlobalSelection = (e) => {
    if (isSelected && e.detail.id !== label) {
      isSelected = false;
      updateUI();
    }
  };
  selectionEvent.addEventListener("drawer-item-selected", handleGlobalSelection);
  unsubscribeGlobal = () =>
    selectionEvent.removeEventListener(
      "drawer-item-selected",
      handleGlobalSelection,
    );

  checkActive(); 

  const container = Container({
    padding: "12px 16px",
    cursor: "pointer",
    borderRadius: borderRadius,
    margin: "4px 8px",
    disableTransform: disableTransform,
    // --- NUEVO: Accesibilidad por teclado ---
    role: "button",
    tabIndex: 0,
    "aria-selected": isSelected.toString(),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); 
        handleClick();
      }
    },
    // ----------------------------------------
    onclick: handleClick,
    onHover: (e) => {
      if (!isSelected) e.currentTarget.style.backgroundColor = hintColor;
    },
    onHoverEnd: (e) => {
      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
    },
    ...rest,
  });

  const rowChildren = [];
  if (icon) {
    const iconWidget = Icon({ name: icon, size: 22, color: unselectedColor });
    rowChildren.push(iconWidget);
    iconRef = iconWidget;
  }
  
  const textWidget = Text({
    text: label,
    size: 15,
    color: unselectedColor,
    fontWeight: "400",
    flex: 1,
  });
  rowChildren.push(textWidget);
  textRef = textWidget;
  
  if (trailingIcon) {
    const trailWidget = Icon({
      name: trailingIcon,
      size: 18,
      color: unselectedColor,
    });
    rowChildren.push(trailWidget);
    trailingIconRef = trailWidget;
  }
  
  const row = Row({
    alignItems: "center",
    justifyContent: "space-between",
    gap: gap,
    children: rowChildren,
  });
  
  container.appendChild(row);
  containerRef = container;
  updateUI();

  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    if (unsubscribeRouter) unsubscribeRouter();
    if (unsubscribeGlobal) unsubscribeGlobal();
    if (originalCleanup) originalCleanup();
  };

  return container;
};

export default DrawerItem;