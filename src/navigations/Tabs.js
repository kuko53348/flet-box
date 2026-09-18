// navigations/Tabs.js 
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Container } from "../widgets/Container.js";
import { Row } from "../widgets/Row.js";
import { Text } from "../widgets/Text.js";
import { Icon } from "../widgets/Icon.js";

export const Tabs = (props) => {
  const {
    tabs = [],
    children = [],
    activeIndex = 0,
    onChange,
    variant = "underline",
    size = "medium",
    color = colors.primary,
    textColor = colors.text,
    activeTextColor = colors.white,
    bgColor = colors.gray100,
    buttonColor = colors.secondary,
    alignment = "left",
    fullWidth = true,
    showDivider = true,
    dividerColor = colors.border,
    showIcon = false,
    iconPosition = "left",
    iconSize = 18,
    badges = [],
    ...rest
  } = props;

  let currentIndex = activeIndex;
  let sliderIndicator = null;
  let tabsWrapperRef = null;
  let tabButtonsRef = [];

  const sizes = {
    small: { p: "6px 12px", f: 12, g: 4, i: 14, cp: 12, h: 32 },
    medium: { p: "8px 16px", f: 14, g: 8, i: 18, cp: 16, h: 40 },
    large: { p: "12px 20px", f: 16, g: 10, i: 22, cp: 20, h: 48 },
  };
  const sz = sizes[size] || sizes.medium;

  const getLabel = (t) =>
    typeof t === "object" ? t.label || t.title : String(t);
  const getIcon = (t) => (typeof t === "object" ? t.icon || null : null);
  const getBadge = (i) => badges[i] || tabs[i]?.badge || null;

  const container = Container({
    width: "100%",
    display: "flex",
    flexDirection: "column",
    style: { ...rest.style },
    ...rest,
  });

  const tabBar = Container({
    position: "relative",
    backgroundColor:
      variant === "slider"
        ? bgColor
        : variant === "filled"
          ? bgColor
          : "transparent",
    borderBottom:
      variant === "underline" && showDivider
        ? `1px solid ${dividerColor}`
        : "none",
    borderRadius: variant === "slider" ? 24 : variant === "pills" ? 20 : 0,
    padding: variant === "slider" ? "4px" : 0,
    flexShrink: 0,
  });

  const tabsWrapper = Row({
    alignItems: "center",
    justifyContent: fullWidth ? "space-between" : "flex-start",
    gap: variant === "pills" ? 4 : 0,
    position: "relative",
    flexWrap: "nowrap",
    width: fullWidth ? "100%" : "auto",
    backgroundColor: variant === "slider" ? bgColor : "transparent",
    borderRadius: variant === "slider" ? 24 : 0,
    padding: variant === "slider" ? "4px" : 0,
  });
  tabsWrapperRef = tabsWrapper;

  const tabButtons = [];

  tabs.forEach((tab, idx) => {
    const label = getLabel(tab);
    const icon = getIcon(tab);
    const badge = getBadge(idx);
    const isActive = currentIndex === idx;

    const content = [];
    if (showIcon && icon && iconPosition === "left") {
      content.push(
        Icon({
          name: icon,
          size: iconSize || sz.i,
          color: isActive ? activeTextColor : textColor,
        }),
      );
    }
    if (label) {
      content.push(
        Text({
          text: label,
          size: sz.f,
          color: isActive ? activeTextColor : textColor,
          weight: isActive ? "500" : "400",
        }),
      );
    }
    if (badge) {
      content.push(
        Container({
          backgroundColor: colors.danger,
          borderRadius: 10,
          padding: "2px 6px",
          marginLeft: 4,
          child: Text({ text: String(badge), size: 10, color: "#fff" }),
        }),
      );
    }

    const btn = Container({
      borderRadius: variant === "slider" ? 20 : variant === "pills" ? 20 : 0,
      backgroundColor: "transparent",
      color: isActive ? activeTextColor : textColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: sz.g,
      padding: sz.p,
      cursor: "pointer",
      transition: "all 0.2s",
      flex: fullWidth ? 1 : "0 0 auto",
      whiteSpace: "nowrap",
      minHeight: sz.h - (variant === "slider" ? 8 : 0),
      style: { zIndex: 2 },
      // --- NUEVO: Accesibilidad ---
      role: "tab",
      tabIndex: 0,
      "aria-selected": isActive.toString(),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (currentIndex !== idx) {
            currentIndex = idx;
            updateActiveTab(idx);
            onChange?.(idx);
          }
        }
      },
      // ----------------------------
      child: Row({
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        children: content,
      }),
    });

    btn.onclick = () => {
      if (currentIndex !== idx) {
        currentIndex = idx;
        updateActiveTab(idx);
        onChange?.(idx);
      }
    };

    tabButtons.push(btn);
    tabsWrapper.appendChild(btn);
  });
  tabButtonsRef = tabButtons;

  if (variant === "slider") {
    sliderIndicator = WidgetFactory({
      tag: "div",
      position: "absolute",
      top: "4px",
      left: "4px",
      height: "calc(100% - 8px)",
      backgroundColor: buttonColor,
      borderRadius: 20,
      transition: "transform 0.3s ease, width 0.3s ease",
      style: { zIndex: 1 },
    });
    tabsWrapper.appendChild(sliderIndicator);
  }

  tabBar.appendChild(tabsWrapper);
  container.appendChild(tabBar);

  const contentContainer = Container({
    display: "flex",
    padding: `${sz.cp}px 0`,
    width: "100%",
    overflow: "auto",
  });
  container.appendChild(contentContainer);

  const updateContent = () => {
    while (contentContainer.firstChild)
      contentContainer.removeChild(contentContainer.firstChild);
    const active = children[currentIndex];
    if (active instanceof HTMLElement) contentContainer.appendChild(active);
  };

  const updateSliderPosition = () => {
    if (!sliderIndicator || !tabButtonsRef[currentIndex]) return;
    const btn = tabButtonsRef[currentIndex];
    const wrapperRect = tabsWrapperRef.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const left = btnRect.left - wrapperRect.left;
    sliderIndicator.style.width = `${btnRect.width}px`;
    sliderIndicator.style.transform = `translateX(${left}px)`;
  };

  const updateActiveTab = (idx) => {
    tabButtonsRef.forEach((btn, i) => {
      const isActive = i === idx;
      
      // --- NUEVO: Reflejar estado A11y ---
      btn.setAttribute("aria-selected", isActive.toString());

      const textSpan = btn.querySelector("span:not(.material-icons)");
      if (textSpan) {
        textSpan.style.color = isActive ? activeTextColor : textColor;
        textSpan.style.fontWeight = isActive ? "500" : "400";
      }
      const iconEl = btn.querySelector(".material-icons");
      if (iconEl) {
        iconEl.style.color = isActive ? activeTextColor : textColor;
      }
      btn.style.color = isActive ? activeTextColor : textColor;
    });

    updateSliderPosition();
    updateContent();
  };

  let initialPositionTimer = setTimeout(() => {
    initialPositionTimer = null;
    updateSliderPosition();
  }, 16);

  let resizeTimeout = null;
  let resizeObserver = null;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (sliderIndicator && tabButtonsRef[currentIndex]) {
        updateSliderPosition();
      }
    }, 100);
  };
  window.addEventListener("resize", handleResize);

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => updateSliderPosition());
    if (tabsWrapperRef) resizeObserver.observe(tabsWrapperRef);
  }

  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    if (initialPositionTimer) clearTimeout(initialPositionTimer);
    if (resizeTimeout) clearTimeout(resizeTimeout);
    window.removeEventListener("resize", handleResize);
    if (resizeObserver) resizeObserver.disconnect();
    if (originalCleanup) originalCleanup();
  };

  Object.defineProperty(container, "activeIndex", {
    get: () => currentIndex,
    set: (idx) => {
      if (idx >= 0 && idx < tabs.length && currentIndex !== idx) {
        currentIndex = idx;
        updateActiveTab(idx);
        onChange?.(idx);
      }
    },
  });
  container.setActiveTab = (idx) => {
    container.activeIndex = idx;
  };

  return container;
};

export default Tabs;