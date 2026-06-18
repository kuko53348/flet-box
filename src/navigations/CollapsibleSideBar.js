// navigations/CollapsibleSideBar.js
import { WidgetFactory } from "../widget-factory/index.js";
import { Container } from "../widgets/Container.js";
import { Column } from "../widgets/Column.js";
import { Icon } from "../widgets/Icon.js";
import { useState } from "../tools/useState.js";
import { colors } from "../utils/themes.js";

export const CollapsibleSideBar = ({
  children,
  expanded = true,
  widthExpanded = 260,
  widthCollapsed = 60,
  iconSize = 24,
  onToggle,
  bgColor = colors.surface,
  borderRight = `1px solid ${colors.border}`,
  ...rest
}) => {
  const [isExpanded, setIsExpanded] = useState("collapsible-sidebar", expanded);

  const toggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) onToggle(newState);
  };

  const currentWidth = isExpanded ? widthExpanded : widthCollapsed;

  // Usar WidgetFactory para el contenedor principal
  const container = WidgetFactory({
    tag: "div",
    style: {
      width:
        typeof currentWidth === "number" ? `${currentWidth}px` : currentWidth,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: bgColor,
      borderRight: borderRight,
      transition: "width 0.3s ease",
      overflow: "hidden",
      flexShrink: 0,
      ...rest.style,
    },
    ...rest,
  });

  // Botón colapsar/expandir (usando Container e Icon)
  const toggleButton = Container({
    padding: 16,
    cursor: "pointer",
    onclick: toggle,
    child: Icon({
      name: isExpanded ? "chevron_left" : "chevron_right",
      size: iconSize,
      color: colors.textSecondary,
    }),
  });
  container.appendChild(toggleButton);

  // Contenido principal
  const contentWrapper = Container({
    flex: 1,
    width: "100%",
    opacity: isExpanded ? 1 : 0,
    transition: "opacity 0.2s ease",
    pointerEvents: isExpanded ? "auto" : "none",
    overflow: "auto",
    child: children,
  });
  container.appendChild(contentWrapper);

  // Método para actualizar el ancho dinámicamente (si es necesario)
  container.updateWidth = (newWidth) => {
    container.style.width =
      typeof newWidth === "number" ? `${newWidth}px` : newWidth;
  };

  return container;
};

export default CollapsibleSideBar;
