import { Scaffold } from "./Scaffold.js";
import { Drawer } from "./Drawer.js";
import { CollapsibleSideBar } from "./CollapsibleSideBar.js";
import { device } from "../tools/device.js";
import { colors } from "../utils/themes.js";

/**
 * @typedef {Object} AdaptiveScaffoldProps
 * @property {HTMLElement|Function} [appBar] - Top app bar widget or factory function.
 * @property {HTMLElement|Function|Object} [body] - Main content widget, factory, or route map.
 * @property {HTMLElement|Function} [bottomBar] - Bottom navigation bar.
 * @property {HTMLElement|Function} [fab] - Floating action button.
 * @property {Object} [drawer] - Explicit Drawer instance to use (any screen size).
 * @property {HTMLElement|Function} [leftNavBar] - Left navigation content.
 *   On mobile, this is wrapped in a Drawer; on desktop it becomes a CollapsibleSideBar.
 * @property {number} [leftNavBarWidth=260] - Width of the left nav in pixels.
 * @property {HTMLElement|Function} [rightNavBar] - Right navigation content (desktop only).
 * @property {number} [rightNavBarWidth=260] - Width of the right nav in pixels.
 * @property {Object} [routes] - Route map for router mode.
 * @property {string} [backgroundColor] - Background color of the scaffold.
 * @property {boolean} [forceMobile=false] - Force the mobile layout regardless of screen width.
 * @property {boolean} [forceDesktop=false] - Force the desktop layout regardless of screen width.
 */

/**
 * AdaptiveScaffold is a responsive wrapper around Scaffold that automatically
 * switches navigation patterns based on screen width and device type.
 *
 * Layout rules:
 * - **Mobile** (`window.innerWidth < 768` or `device.isMobile()` or `forceMobile`):
 *   - `leftNavBar` is placed inside a slide-over Drawer (hidden by default).
 *   - `rightNavBar` is hidden entirely.
 * - **Desktop** (all other cases):
 *   - `leftNavBar` becomes a CollapsibleSideBar pinned to the left.
 *   - `rightNavBar` becomes a CollapsibleSideBar pinned to the right.
 *
 * Use `forceMobile` / `forceDesktop` during development or testing to lock
 * the layout to a specific breakpoint without resizing the viewport.
 *
 * @param {AdaptiveScaffoldProps} props
 * @returns {HTMLElement} The Scaffold element configured for the detected layout.
 */
export const AdaptiveScaffold = (props) => {
  const {
    appBar,
    body,
    bottomBar,
    fab,
    drawer: originalDrawer,
    leftNavBar: originalLeftNavBar,
    leftNavBarWidth = 260,
    rightNavBar: originalRightNavBar,
    rightNavBarWidth = 260,
    routes,
    backgroundColor = colors.background,
    forceMobile = false,
    forceDesktop = false,
    ...rest
  } = props;

  // Determine the layout mode. forceMobile/forceDesktop props override the
  // automatic detection, which uses both the device API and the window width
  // so that resizing a desktop browser to a small width triggers mobile layout.
  const isMobile =
    forceMobile ||
    (!forceDesktop && (device.isMobile() || window.innerWidth < 768));

  let finalLeftNavBar = null;
  let drawerInstance = null;

  if (originalLeftNavBar) {
    // Resolve factory functions to elements before passing them into wrappers.
    const content =
      typeof originalLeftNavBar === "function"
        ? originalLeftNavBar()
        : originalLeftNavBar;

    if (isMobile) {
      // On mobile, wrap the left nav content in an off-canvas Drawer.
      // The Scaffold's menu-icon wiring will auto-connect the AppBar's menu
      // button to drawerInstance.open().
      drawerInstance = Drawer({
        header: null,
        body: [content],
        footer: null,
        position: "left",
        width: leftNavBarWidth,
        bgColor: colors.surface,
        borderRadius: 24,
        elevation: 4,
        closeOnOverlayClick: true,
        closeOnEsc: true,
      });
      // The Drawer appends itself to document.body internally, but guard
      // against double-appending when AdaptiveScaffold re-renders.
      if (
        drawerInstance?.element &&
        !document.body.contains(drawerInstance.element)
      ) {
        document.body.appendChild(drawerInstance.element);
      }
    } else {
      // On desktop, render the left nav as a persistent collapsible sidebar.
      finalLeftNavBar = CollapsibleSideBar({
        expanded: true,
        widthExpanded: leftNavBarWidth,
        widthCollapsed: 70,
        bgColor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        children: content,
      });
    }
  }

  let finalRightNavBar = null;
  if (!isMobile && originalRightNavBar) {
    // Right nav is only shown on desktop — there is no right-side drawer
    // equivalent because it would conflict with typical gesture navigation.
    const content =
      typeof originalRightNavBar === "function"
        ? originalRightNavBar()
        : originalRightNavBar;
    finalRightNavBar = CollapsibleSideBar({
      expanded: true,
      widthExpanded: rightNavBarWidth,
      widthCollapsed: 50,
      bgColor: colors.surface,
      borderLeft: `1px solid ${colors.border}`,
      children: content,
    });
  }

  // Delegate to the base Scaffold with the adaptive layout resolved.
  // On mobile, pass the drawer instance (the left nav drawer if we created one,
  // falling back to any explicitly provided drawer).
  return Scaffold({
    appBar,
    drawer: isMobile ? drawerInstance || originalDrawer : originalDrawer,
    leftNavBar: finalLeftNavBar,
    rightNavBar: finalRightNavBar,
    bottomBar,
    fab,
    body: routes || body,
    backgroundColor,
    ...rest,
  });
};

export default AdaptiveScaffold;
