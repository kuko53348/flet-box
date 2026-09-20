// widgets/BottomSheet.js - Fixed version (with stopPropagation)
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { Container } from "./Container.js";

export const BottomSheet = (props) => {
  const {
    content,
    title,
    actions = [],
    height = "auto",
    maxHeight = "80%",
    showDragHandle = true,
    closeOnOverlayClick = true,
    closeOnDragDown = true,
    showCloseButton = true,

    // Colors
    backgroundColor = colors.surface,
    overlayColor = "rgba(0, 0, 0, 0.5)",
    dragHandleColor = colors.border,
    headerTextColor = colors.text,
    headerBorderColor = colors.border,
    actionBorderColor = colors.border,

    // Borders and shadows
    borderRadius = 24,
    shadow = "0 -4px 12px rgba(0,0,0,0.1)",

    // Spacing
    headerPadding = "0 16px 8px 16px",
    contentPadding = "0 16px",
    actionPadding = "12px 16px",
    dragHandlePadding = "14px 0 8px 0",
    dragHandleWidth = 40,
    dragHandleHeight = 4,

    // Animation
    animationDuration = 300,

    // Z-index
    zIndex = 9999,
    overlayZIndex = 9998,

    // Callbacks
    onOpen,
    onClose,

    ...rest
  } = props;

  let isOpen = false;
  let overlay = null;
  let sheetContainer = null;
  let startY = 0;
  let currentY = 0;

  // ✅ Overlay with onclick
  overlay = WidgetFactory({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: overlayColor,
    zIndex: overlayZIndex,
    opacity: 0,
    visibility: "hidden",
    transition: `opacity ${animationDuration}ms ease, visibility ${animationDuration}ms ease`,
    // onclick: (e) => {
    //   // ✅ Only close if the click was directly on the overlay (not on the sheet)
    //   if (e.target === overlay && closeOnOverlayClick) {
    //     close();
    //   }
    // },
  });

  // ✅ Drag handle with stopPropagation
  const dragHandle = showDragHandle
    ? WidgetFactory({
        display: "flex",
        justifyContent: "center",
        padding: dragHandlePadding,
        cursor: "grab",
onclick: (e) => e.stopPropagation(), // ✅ Prevents the click from reaching the overlay
        child: WidgetFactory({
          width: dragHandleWidth,
          height: dragHandleHeight,
          backgroundColor: dragHandleColor,
          borderRadius: dragHandleHeight / 2,
        }),
      })
    : null;

  // Header
  const headerChildren = [];
  if (title) {
    headerChildren.push(
      Text({
        text: title,
        size: 18,
        weight: "bold",
        color: headerTextColor,
        flex: 1,
      }),
    );
  }
  if (showCloseButton) {
    const closeBtn = Icon({
      name: "close",
      size: 22,
      color: colors.textSecondary,
      cursor: "pointer",
    });
    closeBtn.onclick = () => close();
    headerChildren.push(closeBtn);
  }

  const header =
    title || showCloseButton
      ? Row({
          alignItems: "center",
          justifyContent: "space-between",
          padding: headerPadding,
          borderBottom: title ? `1px solid ${headerBorderColor}` : "none",
          children: headerChildren,
        })
      : null;

  // Actions footer
  const actionsElement =
    actions.length > 0
      ? Row({
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
          padding: actionPadding,
          borderTop: `1px solid ${actionBorderColor}`,
          marginTop: "auto",
          children: actions,
        })
      : null;

  // Content wrapper
  const contentWrapper = Container({
    flex: 1,
    overflow: "auto",
    padding: contentPadding,
    child: content,
  });

  // ✅ SheetContainer with stopPropagation
  sheetContainer = WidgetFactory({
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    backgroundColor: backgroundColor,
    borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
    boxShadow: shadow,
    transform: "translateY(100%)",
    transition: `transform ${animationDuration}ms ease`,
    maxHeight: maxHeight,
    height: height === "auto" ? "auto" : height,
    display: "flex",
    flexDirection: "column",
    zIndex: zIndex,
    overflow: "hidden",
    // onclick: (e) => e.stopPropagation(), // ✅ Prevents the click from reaching the overlay
  });

  // Body
  const sheetBody = Column({
    height: "100%",
    gap: 12,
    children: [dragHandle, header, contentWrapper, actionsElement].filter(
      Boolean,
    ),
  });

  sheetContainer.appendChild(sheetBody);
  overlay.appendChild(sheetContainer);
  document.body.appendChild(overlay);

  // Drag handlers
  const onTouchStart = (e) => {
    // ✅ Prevent the drag event from propagating to the overlay
    e.stopPropagation();
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    currentY = startY;
    sheetContainer.style.transition = "none";
  };

  const onTouchMove = (e) => {
    if (!closeOnDragDown) return;
    e.preventDefault();
    const moveY = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = moveY - startY;
    if (delta > 0) {
      currentY = moveY;
      sheetContainer.style.transform = `translateY(${delta}px)`;
      const opacity = 1 - delta / sheetContainer.offsetHeight;
      overlay.style.opacity = Math.max(0, Math.min(1, opacity));
    }
  };

  const onTouchEnd = (e) => {
    e.stopPropagation();
    sheetContainer.style.transition = `transform ${animationDuration}ms ease`;
    const delta = currentY - startY;
    if (delta > 100) {
      close();
    } else {
      sheetContainer.style.transform = "translateY(0)";
      overlay.style.opacity = "1";
    }
    startY = 0;
    currentY = 0;
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    overlay.style.visibility = "visible";
    overlay.style.opacity = "1";
    sheetContainer.style.transform = "translateY(0)";
    if (onOpen) onOpen();
    document.addEventListener("keydown", handleKeyDown);

    if (closeOnDragDown && dragHandle) {
      dragHandle.addEventListener("mousedown", onTouchStart);
      // dragHandle.addEventListener("mousemove", onTouchMove);
      dragHandle.addEventListener("mouseup", onTouchEnd);
      dragHandle.addEventListener("touchstart", onTouchStart);
      dragHandle.addEventListener("touchmove", onTouchMove);
      dragHandle.addEventListener("touchend", onTouchEnd);
    }
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    sheetContainer.style.transform = "translateY(100%)";
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.style.visibility = "hidden";
    }, animationDuration);
    if (onClose) onClose();
    document.removeEventListener("keydown", handleKeyDown);

    if (closeOnDragDown && dragHandle) {
      dragHandle.removeEventListener("mousedown", onTouchStart);
      // dragHandle.removeEventListener("mousemove", onTouchMove);
      dragHandle.removeEventListener("mouseup", onTouchEnd);
      dragHandle.removeEventListener("touchstart", onTouchStart);
      dragHandle.removeEventListener("touchmove", onTouchMove);
      dragHandle.removeEventListener("touchend", onTouchEnd);
    }
  };

  const toggle = () => {
    if (isOpen) close();
    else open();
  };

  const destroy = () => {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener("keydown", handleKeyDown);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && isOpen) close();
  };

  const bottomSheet = { open, close, toggle, destroy };
  return bottomSheet;
};

export default BottomSheet;
