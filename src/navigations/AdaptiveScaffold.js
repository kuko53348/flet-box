import { Scaffold } from "./Scaffold.js";
import { Drawer } from "./Drawer.js";
import { CollapsibleSideBar } from "./CollapsibleSideBar.js";
import { device } from "../tools/device.js";
import { colors } from "../utils/themes.js";

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

  const isMobile =
    forceMobile ||
    (!forceDesktop && (device.isMobile() || window.innerWidth < 768));

  let finalLeftNavBar = null;
  let drawerInstance = null;

  if (originalLeftNavBar) {
    const content =
      typeof originalLeftNavBar === "function"
        ? originalLeftNavBar()
        : originalLeftNavBar;

    if (isMobile) {
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
      if (
        drawerInstance?.element &&
        !document.body.contains(drawerInstance.element)
      ) {
        document.body.appendChild(drawerInstance.element);
      }
    } else {
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

  return Scaffold({
    appBar,
    drawer: originalDrawer,
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
