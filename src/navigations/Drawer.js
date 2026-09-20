// src/navigations/Drawer.js
import { Container } from "../widgets/Container.js";
import { Column } from "../widgets/Column.js";
import { dimensions } from "../tools/dimensions.js";
import { colors } from "../utils/themes.js";

/**
 * Module-level singleton reference to the most recently created Drawer.
 * The global helpers (openDrawer, closeDrawer, toggleDrawer, destroyDrawer)
 * operate on this instance, which means only one drawer is reachable via the
 * global API at a time. Use the returned instance object directly when you
 * need to manage multiple drawers.
 *
 * @type {{open: Function, close: Function, toggle: Function, destroy: Function, element: HTMLElement}|null}
 */
let drawerInstance = null;

/**
 * @typedef {Object} DrawerProps
 * @property {HTMLElement|null} [header] - Widget rendered at the top of the drawer panel.
 * @property {HTMLElement[]} [body=[]] - Array of widgets filling the scrollable middle section.
 * @property {HTMLElement|null} [footer] - Widget rendered at the bottom of the drawer panel.
 * @property {"left"|"right"} [position="left"] - Which edge the drawer slides in from.
 * @property {number|string} [width=280] - Width of the drawer panel (number = pixels).
 * @property {Function} [onClose] - Callback fired after the close animation completes.
 * @property {Function} [onOpen] - Callback fired immediately when the drawer opens.
 * @property {boolean} [blur=true] - Whether to apply a backdrop blur behind the overlay.
 * @property {number} [blurIntensity=4] - Blur radius in pixels (used when blur is true).
 * @property {string} [bgColor] - Background color of the drawer panel.
 * @property {number} [elevation=4] - Box-shadow depth for the panel edge.
 * @property {boolean} [closeOnOverlayClick=true] - Whether a tap on the backdrop closes the drawer.
 * @property {boolean} [closeOnEsc=true] - Whether the Escape key closes the drawer.
 * @property {number} [borderRadius=24] - Corner radius applied to the panel's outer corners.
 * @property {number} [margin=0] - Offset from the screen edge (pushes panel inward).
 */

/**
 * @typedef {Object} DrawerInstance
 * @property {Function} open - Slide the drawer into view.
 * @property {Function} close - Slide the drawer out of view.
 * @property {Function} toggle - Toggle between open and closed states.
 * @property {Function} destroy - Remove the drawer from the DOM and clean up all listeners.
 * @property {HTMLElement} element - The outer wrapper element appended to document.body.
 */

/**
 * Drawer creates a slide-in panel anchored to the left or right edge of the
 * screen. It is appended directly to `document.body` and uses a full-screen
 * wrapper so the overlay backdrop can cover the entire viewport.
 *
 * Corner radius is applied only to the outer corners of the panel (i.e. the
 * two corners that face away from the screen edge) to maintain a flush
 * attachment at the edge side.
 *
 * The module keeps a singleton reference so the standalone helper functions
 * (openDrawer, closeDrawer, etc.) can be called without passing an instance.
 *
 * @param {DrawerProps} [props={}]
 * @returns {DrawerInstance}
 */
export const Drawer = (props = {}) => {
  const {
    header,
    body = [],
    footer,
    position = "left",
    width = 280,
    onClose,
    onOpen,
    blur = true,
    blurIntensity = 4,
    bgColor = colors?.surface || "#ffffff",
    elevation = 4,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    borderRadius = 24,
    margin = 0,
    ...rest
  } = props;

  const element = document.createElement("div");
  let isOpen = false;
  let closeTimer = null;

  // The outer wrapper covers the full screen so the backdrop sits above all
  // other content. It starts hidden and becomes visible on open().
  element.style.position = "fixed";
  element.style.top = "0";
  element.style.left = "0";
  element.style.width = `${dimensions.width}px`;
  element.style.height = `${dimensions.height}px`;
  element.style.zIndex = "10000";
  element.style.display = "none";

  // Overlay backdrop — semi-transparent with optional blur effect.
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backdropFilter = blur ? `blur(${blurIntensity}px)` : "none";
  overlay.style.backgroundColor = "rgba(0,0,0,0.3)";
  overlay.style.transition = "opacity 0.3s ease";
  overlay.style.opacity = "0";

  // Sliding drawer panel.
  const drawerPanel = document.createElement("div");
  drawerPanel.style.position = "absolute";
  drawerPanel.style.top = `${margin}px`;
  drawerPanel.style.bottom = `${margin}px`;
  drawerPanel.style.height = `calc(100% - ${margin * 2}px)`;
  drawerPanel.style.display = "flex";
  drawerPanel.style.flexDirection = "column";
  drawerPanel.style.backgroundColor = bgColor;
  drawerPanel.style.overflow = "hidden";

  // Apply border radius only to the corners that face away from the screen edge.
  // A left drawer gets rounded right corners; a right drawer gets rounded left corners.
  if (position === "left") {
    drawerPanel.style.left = `${margin}px`;
    drawerPanel.style.right = "auto";
    drawerPanel.style.borderTopRightRadius = `${borderRadius}px`;
    drawerPanel.style.borderBottomRightRadius = `${borderRadius}px`;
    drawerPanel.style.borderTopLeftRadius = "0";
    drawerPanel.style.borderBottomLeftRadius = "0";
  } else {
    drawerPanel.style.right = `${margin}px`;
    drawerPanel.style.left = "auto";
    drawerPanel.style.borderTopLeftRadius = `${borderRadius}px`;
    drawerPanel.style.borderBottomLeftRadius = `${borderRadius}px`;
    drawerPanel.style.borderTopRightRadius = "0";
    drawerPanel.style.borderBottomRightRadius = "0";
  }

  drawerPanel.style.width = typeof width === "number" ? `${width}px` : width;
  // Start the panel off-screen so the entrance animation slides it in.
  drawerPanel.style.transform =
    position === "left" ? "translateX(-100%)" : "translateX(100%)";
  drawerPanel.style.transition = "transform 0.3s ease-out";

  // Shadow faces inward, away from the attachment edge.
  if (elevation > 0) {
    if (position === "left") {
      drawerPanel.style.boxShadow = `${elevation}px 0 ${elevation * 2}px rgba(0,0,0,0.15)`;
    } else {
      drawerPanel.style.boxShadow = `-${elevation}px 0 ${elevation * 2}px rgba(0,0,0,0.15)`;
    }
  }

  // ========== BUILD PANEL CONTENT ==========
  // The header and footer containers intentionally only round the corners
  // that align with the panel's outer edge, so content fills flush at the
  // attachment side.
  const contentContainer = Column({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    children: [
      header &&
        Container({
          flexShrink: 0,
          borderTopLeftRadius: position === "right" ? `${borderRadius}px` : "0",
          borderTopRightRadius: position === "left" ? `${borderRadius}px` : "0",
          overflow: "hidden",
          child: header,
        }),

      body.length > 0 &&
        Column({
          flex: 1,
          paddingTop: 8,
          paddingBottom: 8,
          overflow: "auto",
          backgroundColor: bgColor,
          children: body,
        }),

      footer &&
        Container({
          flexShrink: 0,
          borderBottomLeftRadius:
            position === "right" ? `${borderRadius}px` : "0",
          borderBottomRightRadius:
            position === "left" ? `${borderRadius}px` : "0",
          overflow: "hidden",
          child: footer,
        }),
    ].filter(Boolean),
  });

  drawerPanel.appendChild(contentContainer);
  element.appendChild(overlay);
  element.appendChild(drawerPanel);

  // ========== KEYBOARD HANDLER ==========
  const handleKeyDown = (e) => {
    if (closeOnEsc && e.key === "Escape" && isOpen) {
      close();
    }
  };

  // ========== CLOSE ==========
  /**
   * Slide the drawer out of view with a CSS transition.
   * The outer wrapper is hidden after the transition completes (300ms) to
   * remove it from the accessibility tree. Re-entrant calls are ignored.
   */
  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    // Cancel any pending hide timer from a previous close call.
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    drawerPanel.style.transform =
      position === "left" ? "translateX(-100%)" : "translateX(100%)";
    overlay.style.opacity = "0";
    closeTimer = setTimeout(() => {
      element.style.display = "none";
      closeTimer = null;
      if (onClose) onClose();
    }, 300);
    if (closeOnEsc) document.removeEventListener("keydown", handleKeyDown);
  };

  // ========== OPEN ==========
  /**
   * Slide the drawer into view.
   * Forces a reflow (offsetHeight read) before applying the transition so
   * the animation plays even when the element was just made visible.
   * Re-entrant calls are ignored.
   */
  const open = () => {
    if (isOpen) return;
    isOpen = true;
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    element.style.display = "block";
    // Trigger a reflow so the browser registers the initial transform value
    // before the transition starts; without this the animation is skipped.
    void element.offsetHeight;
    overlay.style.opacity = "1";
    drawerPanel.style.transform = "translateX(0)";
    if (onOpen) onOpen();
    if (closeOnEsc) document.addEventListener("keydown", handleKeyDown);
  };

  /**
   * Toggle between open and closed states.
   */
  const toggle = () => {
    if (isOpen) close();
    else open();
  };

  /**
   * Remove the drawer element from the DOM and release all listeners.
   * After destroy() the instance is no longer usable.
   */
  const destroy = () => {
    if (closeTimer) clearTimeout(closeTimer);
    if (closeOnEsc) document.removeEventListener("keydown", handleKeyDown);
    removeResizeListener();
    if (element.parentNode) element.parentNode.removeChild(element);
  };

  if (closeOnOverlayClick) {
    overlay.addEventListener("click", close);
  }

  // Keep the wrapper dimensions in sync with the viewport when the window
  // is resized (e.g. orientation change on mobile).
  const handleResize = () => {
    element.style.width = `${dimensions.width}px`;
    element.style.height = `${dimensions.height}px`;
  };
  const removeResizeListener = dimensions.addListener(handleResize);

  const instance = { open, close, toggle, destroy, element };
  // Register as the module-level singleton so global helpers work.
  drawerInstance = instance;
  document.body.appendChild(element);

  return instance;
};

// ========== GLOBAL HELPER FUNCTIONS ==========
// These operate on the most recently created Drawer instance.
// Use the instance returned by Drawer() directly when managing multiple drawers.

/**
 * Open the most recently created Drawer.
 * Logs a warning if no Drawer has been initialised yet.
 */
export const openDrawer = () => {
  if (drawerInstance) drawerInstance.open();
  else console.warn("Drawer not initialized");
};

/**
 * Close the most recently created Drawer.
 * Logs a warning if no Drawer has been initialised yet.
 */
export const closeDrawer = () => {
  if (drawerInstance) drawerInstance.close();
  else console.warn("Drawer not initialized");
};

/**
 * Toggle the most recently created Drawer.
 * Logs a warning if no Drawer has been initialised yet.
 */
export const toggleDrawer = () => {
  if (drawerInstance) drawerInstance.toggle();
  else console.warn("Drawer not initialized");
};

/**
 * Destroy the most recently created Drawer and clear the singleton reference.
 * Safe to call even when no drawer exists.
 */
export const destroyDrawer = () => {
  if (drawerInstance) {
    drawerInstance.destroy();
    drawerInstance = null;
  }
};

export default Drawer;
