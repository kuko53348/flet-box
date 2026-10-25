/**
 * @file BottomSheet.js
 * @description Bottom sheet controller returned to callers (`open`/`close`/`toggle`/`destroy`).
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { Container } from "./Container.js";
import { toREM } from "../utils/units.js";
import { PILL } from "../tools/index.js";
import { trapFocus } from "../utils/focusScope.js";

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
    borderRadius = 16,
    shadow = "0 -4px 12px rgba(0,0,0,0.1)",

    // Spacing. These are CSS shorthands the widget writes by hand, so each
    // number goes through `toREM` — a literal "16px" here would leave the sheet
    // frozen at one text size while its own type grew.
    headerPadding = `0 ${toREM(16)} ${toREM(8)} ${toREM(16)}`,
    contentPadding = `0 ${toREM(16)}`,
    actionPadding = `${toREM(12)} ${toREM(16)}`,
    dragHandlePadding = `${toREM(16)} 0 ${toREM(8)} 0`,
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
  } = props;

  let isOpen = false;
  let overlay = null;
  // Pending "hide after the close animation" timer, so it can be cancelled.
  let closeTimer = null;
  let sheetContainer = null;
  // What `trapFocus` hands back while the sheet is open (see Modal.js for the
  // whole argument): Tab stays inside the panel and focus goes home on close.
  // The release is idempotent, so close and unmount can both call it.
  let releaseFocusScope = () => {};

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
    // The scrim closes the sheet for a pointer and is nothing for a keyboard —
    // left to the engine, its `click` would become a full-viewport tab stop.
    role: "presentation",
    tabIndex: -1,
    opacity: 0,
    visibility: "hidden",
    transition: `opacity ${animationDuration}ms ease, visibility ${animationDuration}ms ease`,
    onclick: (e) => {
      // Only close if the click was directly on the overlay, not on the sheet.
      if (e.target === e.currentTarget && closeOnOverlayClick) close();
    },
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
          borderRadius: PILL,
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
    // Both the name and the handler are props, not post-hoc assignments: `Icon`
    // decides whether it is decoration from the props it is handed, and the engine
    // only makes a control keyboard-operable when it can see the press while the
    // widget is built. Set after the fact, this close button was a mouse-only "×"
    // that a reader could not even find.
    const closeBtn = Icon({
      name: "close",
      size: 24,
      // 24 + 2 x 8 = 40 framework units: the same target floor every other
      // pressable control answers to, and it scales with the reader's font.
      paddingVertical: 8,
      paddingHorizontal: 8,
      color: colors.textSecondary,
      cursor: "pointer",
      onclick: () => close(),
      "aria-label": "Close sheet",
    });
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
    borderRadius: `${toREM(borderRadius)} ${toREM(borderRadius)} 0 0`,
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

  sheetContainer.setAttribute("role", "dialog");
  sheetContainer.setAttribute("aria-modal", "true");
  if (typeof title === "string" && title) {
    sheetContainer.setAttribute("aria-label", title);
  }

  sheetContainer.appendChild(sheetBody);
  overlay.appendChild(sheetContainer);
  document.body.appendChild(overlay);

  // The overlay lives in `document.body` and can be removed without `close()`
  // ever running (state rebuild, route change, plain removeChild of the host).
  // `_cleanup` is not called on that path, so release the document listener and
  // any pending animation timer through the lifecycle hook too.
  overlay.onUnmount(() => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    document.removeEventListener("keydown", handleKeyDown);
    releaseFocusScope();
  });

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
    // Cancel any pending hide from a close that is still animating out.
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    overlay.style.visibility = "visible";
    overlay.style.opacity = "1";
    sheetContainer.style.transform = "translateY(0)";
    if (onOpen) onOpen();
    document.addEventListener("keydown", handleKeyDown);
    releaseFocusScope = trapFocus(sheetContainer);

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
    // Keep the id: `open()` clears it, otherwise reopening within the animation
    // window lets a stale timer hide an OPEN sheet (invisible but isOpen true).
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      closeTimer = null;
      overlay.style.visibility = "hidden";
    }, animationDuration);
    releaseFocusScope();
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
    releaseFocusScope();
    document.removeEventListener("keydown", handleKeyDown);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && isOpen) close();
  };

  const bottomSheet = { open, close, toggle, destroy };
  return bottomSheet;
};

export default BottomSheet;
