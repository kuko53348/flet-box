// widgets/Modal.js - With improved default colors
import { WidgetFactory } from "../widget-factory/index.js";
import { transition } from "../tools/index.js";
import { colors } from "../utils/themes.js";
import { Container } from "./Container.js";
import { Column } from "./Column.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";

// ========== INTERNAL COMPONENTS ==========

const ModalOverlay = ({
  closeOnOverlayClick,
  onClose,
  zIndex = 9998,
  overlayColor,
}) => {
  // main modal transparent
  return WidgetFactory({
    tag: "div",
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: overlayColor || colors.overlay,
    zIndex: zIndex,
    // blur: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: "0",
    visibility: "hidden",
    transition: transition({
      property: "opacity",
      duration: 0.3,
      timing: "ease",
      delay: 0.1,
    }),
    // transition: "opacity 0.3s ease, visibility 0.3s ease",
    // onclick: () => {
    //   if (closeOnOverlayClick) onClose();
    // },
  });
};

const ModalHeader = ({
  title,
  showCloseButton,
  onClose,
  headerBgColor,
  headerTextColor,
  headerBorder,
  headerPadding,
  headerElevation,
}) => {
  const children = [];
  if (title) {
    children.push(
      Text({
        text: title,
        size: 18,
        weight: "80%",
        color: headerTextColor || colors.text,
        flex: 1,
      }),
    );
  }
  if (showCloseButton) {
    const closeIcon = Icon({
      name: "close",
      size: 22,
      color: headerTextColor || colors.textSecondary,
      cursor: "pointer",
      onclick: onClose,
      transition: transition({
        property: "opacity",
        duration: 0.2,
        timing: "ease",
        delay: 0.1,
      }),
      // transition: "opacity 0.2s ease",
      borderRadius: "50%",
      padding: 4,
    });
    // Hover effect for close button
    closeIcon.addEventListener("mouseenter", () => {
      closeIcon.style.backgroundColor = colors.gray100;
    });
    closeIcon.addEventListener("mouseleave", () => {
      closeIcon.style.backgroundColor = "transparent";
    });
    children.push(closeIcon);
  }

  // Default border: subtle divider
  const defaultBorder = `1px solid ${colors.border}`;
  const finalBorder =
    headerBorder === false ? "none" : headerBorder || defaultBorder;

  // Optional elevation shadow for header
  const headerShadow = headerElevation
    ? `0 ${headerElevation}px ${headerElevation * 2}px rgba(0,0,0,0.05)`
    : "none";

  return children.length
    ? Row({
        alignItems: "center",
        justifyContent: "space-between",
        padding: headerPadding || "16px 20px",
        backgroundColor: headerBgColor || "transparent",
        borderBottom: finalBorder,
        flexShrink: 0,
        boxShadow: headerShadow,
        position: "relative",
        zIndex: 1,
        children,
      })
    : null;
};

const ModalContent = ({
  content,
  padding,
  contentBgColor,
  contentElevation,
}) => {
  const wrapper = Container({
    flex: 1,
    overflow: "auto",
    padding: padding,
    backgroundColor: contentBgColor || "transparent",
    boxShadow: contentElevation
      ? `inset 0 ${contentElevation}px ${contentElevation * 2}px rgba(0,0,0,0.02)`
      : "none",
  });

  if (content) {
    if (content instanceof HTMLElement) {
      wrapper.appendChild(content);
    } else if (typeof content === "string") {
      wrapper.appendChild(
        Text({ text: content, size: 14, color: colors.text }),
      );
    } else if (Array.isArray(content)) {
      content.forEach((item) => {
        if (item instanceof HTMLElement) wrapper.appendChild(item);
        else if (typeof item === "string")
          wrapper.appendChild(
            Text({ text: item, size: 14, color: colors.text }),
          );
      });
    }
  }
  return wrapper;
};

const ModalFooter = ({
  actions,
  footerBgColor,
  footerBorder,
  footerPadding,
  footerElevation,
}) => {
  if (!actions || !actions.length) return null;

  const defaultBorder = `1px solid ${colors.border}`;
  const finalBorder =
    footerBorder === false ? "none" : footerBorder || defaultBorder;
  const footerShadow = footerElevation
    ? `0 -${footerElevation}px ${footerElevation * 2}px rgba(0,0,0,0.05)`
    : "none";

  return Row({
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    padding: footerPadding || "12px 20px",
    backgroundColor: footerBgColor || "transparent",
    borderTop: finalBorder,
    flexShrink: 0,
    boxShadow: footerShadow,
    position: "relative",
    zIndex: 1,
    children: actions,
  });
};

const ModalContainer = ({
  width,
  minWidth,
  maxWidth,
  maxHeight,
  backgroundColor,
  borderRadius,
  border,
  borderColor,
  borderWidth,
  shadow,
  elevation,
  children,
}) => {
  // Elevation to shadow mapping
  const elevationShadows = {
    0: "none",
    1: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    2: "0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)",
    3: "0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)",
    4: "0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)",
    5: "0 20px 40px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.1)",
  };

  const finalShadow =
    shadow || (elevation ? elevationShadows[elevation] : elevationShadows[3]);

  let containerStyle = {
    display: "flex",
    flexDirection: "column",
    backgroundColor: backgroundColor || colors.surface,
    borderRadius:
      typeof borderRadius === "number"
        ? `${borderRadius}px`
        : borderRadius || "16px",
    width: typeof width === "number" ? `${width}px` : width,
    minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth,
    maxWidth: maxWidth || "90%",
    maxHeight: maxHeight || "80vh",
    overflow: "hidden",
    boxShadow: finalShadow,
    transform: "scale(0.9)",
    opacity: 0,

    transition:
      "transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1), opacity 0.3s ease",
  };

  // Apply custom border
  if (border) {
    containerStyle.border = border;
  } else if (borderWidth !== undefined && borderColor) {
    containerStyle.border = `${borderWidth}px solid ${borderColor}`;
  }

  return WidgetFactory({
    tag: "div",
    children,
    ...containerStyle,
  });
};

// ========== MAIN MODAL ==========
export const Modal = (props = {}) => {
  const {
    // Content
    title,
    content,
    actions = [],

    // Behavior
    closeOnOverlayClick = true,
    closeOnEsc = true,

    // Dimensions
    width = 480,
    minWidth = 320,
    maxWidth = "90%",
    maxHeight = "80vh",

    // Main container styles
    backgroundColor = colors.surface,
    borderRadius = 20,
    border = null,
    borderColor = colors.border,
    borderWidth = 1,
    shadow = null,
    elevation = 3, // ← New: shadow by elevation

    // Content padding
    padding = "20px",
    contentBgColor = colors.surface,
    contentElevation = 0, // ← Optional inner shadow

    // Customizable header
    showCloseButton = true,
    headerBgColor = colors.surface,
    headerTextColor = null,
    headerBorder = null,
    headerPadding = null,
    headerElevation = 0,

    // Customizable footer
    footerBgColor = colors.surface,
    footerBorder = null,
    footerPadding = null,
    footerElevation = 0,

    // Overlay
    overlayColor = colors.overlay,
    zIndex = 9998,

    // Callbacks
    onOpen,
    onClose,

    ...rest
  } = props;

  let isOpen = false;
  let overlay = null;
  let modalBody = null;

  // Handlers
  const handleClose = () => {
    if (!isOpen) return;
    isOpen = false;
    if (modalBody) {
      modalBody.style.transform = "scale(0.9)";
      modalBody.style.opacity = "0";
    }
    if (overlay) overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay) overlay.style.visibility = "hidden";
    }, 300);
    if (closeOnEsc) document.removeEventListener("keydown", handleKeyDown);
    if (onClose) onClose();
  };

  const handleOpen = () => {
    if (isOpen) return;
    isOpen = true;
    if (overlay) {
      overlay.style.visibility = "visible";
      overlay.style.opacity = "1";
    }
    if (modalBody) {
      modalBody.style.transform = "scale(1)";
      modalBody.style.opacity = "1";
    }
    if (onOpen) onOpen();
    if (closeOnEsc) document.addEventListener("keydown", handleKeyDown);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && isOpen) handleClose();
  };

  // Build modal UI
  const headerElement = ModalHeader({
    title,
    showCloseButton,
    onClose: handleClose,
    headerBgColor,
    headerTextColor,
    headerBorder,
    headerPadding,
    headerElevation,
  });

  const contentElement = ModalContent({
    content,
    padding: typeof padding === "number" ? `${padding}px` : padding,
    contentBgColor,
    contentElevation,
  });

  const footerElement = ModalFooter({
    actions,
    footerBgColor,
    footerBorder,
    footerPadding,
    footerElevation,
  });

  // Filter out null elements
  const modalChildren = [headerElement, contentElement, footerElement].filter(
    Boolean,
  );

  modalBody = ModalContainer({
    width,
    minWidth,
    maxWidth,
    maxHeight,
    backgroundColor,
    borderRadius,
    border,
    borderColor,
    borderWidth,
    shadow,
    elevation,
    children: modalChildren,
  });

  overlay = ModalOverlay({
    closeOnOverlayClick,
    onClose: handleClose,
    zIndex,
    overlayColor,
  });
  overlay.appendChild(modalBody);
  document.body.appendChild(overlay);

  // Public API
  const instance = {
    open: handleOpen,
    close: handleClose,
    toggle: () => (isOpen ? handleClose() : handleOpen()),
    destroy: () => {
      if (overlay && overlay.parentNode)
        overlay.parentNode.removeChild(overlay);
      if (closeOnEsc) document.removeEventListener("keydown", handleKeyDown);
    },
    get isOpen() {
      return isOpen;
    },

    // Methods for dynamic updates
    updateContent: (newContent) => {
      if (contentElement) {
        while (contentElement.firstChild) {
          contentElement.removeChild(contentElement.firstChild);
        }
        if (newContent instanceof HTMLElement) {
          contentElement.appendChild(newContent);
        } else if (typeof newContent === "string") {
          contentElement.appendChild(
            Text({ text: newContent, size: 14, color: colors.text }),
          );
        }
      }
    },

    updateTitle: (newTitle) => {
      const titleText =
        modalBody?.querySelector(".modal-title") ||
        headerElement?.querySelector("span:first-child");
      if (titleText) titleText.textContent = newTitle;
    },

    updatePadding: (newPadding) => {
      if (contentElement) {
        contentElement.style.padding =
          typeof newPadding === "number" ? `${newPadding}px` : newPadding;
      }
    },

    setLoading: (loading = true, loadingText = "Loading...") => {
      if (loading) {
        const loadingEl = Container({
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 40,
          child: Column({
            alignItems: "center",
            gap: 12,
            children: [
              WidgetFactory({
                tag: "div",
                width: 32,
                height: 32,
                border: `2px solid ${colors.border}`,
                borderTop: `2px solid ${colors.primary}`,
                borderRadius: 32,
                animation: "modal-spin 0.8s linear infinite",
              }),
              Text({
                text: loadingText,
                size: 14,
                color: colors.textSecondary,
              }),
            ],
          }),
        });

        if (!document.querySelector("#modal-spinner-style")) {
          const style = document.createElement("style");
          style.id = "modal-spinner-style";
          style.textContent = `@keyframes modal-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
          document.head.appendChild(style);
        }

        instance.updateContent(loadingEl);
      } else {
        instance.updateContent(content);
      }
    },
  };

  return instance;
};

export default Modal;
