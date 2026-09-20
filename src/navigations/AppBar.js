// navigations/AppBar.js
import { WidgetFactory } from "../widget-factory/index.js";
import { Container } from "../widgets/Container.js";
import { Row } from "../widgets/Row.js";
import { Text } from "../widgets/Text.js";
import { Icon } from "../widgets/Icon.js";
import { colors } from "../utils/themes.js";
import { goBack, goTo } from "./Router.js";

/**
 * @typedef {Object} AppBarProps
 * @property {string|HTMLElement} [title] - Page title shown in the center or left of the bar.
 * @property {HTMLElement|null} [leading=null] - Widget placed at the leading (left) edge, e.g. a menu or nav icon.
 * @property {HTMLElement[]} [actions=[]] - Action widgets placed at the trailing (right) edge.
 * @property {number} [actionsGap=12] - Gap in pixels between action widgets.
 * @property {string} [backgroundColor] - Background fill color.
 * @property {string|null} [gradient=null] - CSS gradient string; overrides backgroundColor when set.
 * @property {string} [titleColor] - Color of the title text.
 * @property {string} [iconColor] - Color of icons; defaults to titleColor.
 * @property {number} [elevation=2] - Shadow depth (0–5).
 * @property {boolean} [centerTitle=false] - Whether to center the title horizontally.
 * @property {number} [titleSize=20] - Font size of the title in pixels.
 * @property {string} [titleWeight="500"] - Font weight of the title.
 * @property {boolean} [showBackButton=false] - Auto-inject a back-navigation arrow as the leading widget.
 * @property {string|null} [backButtonRoute=null] - Route to push when the back button is pressed; falls back to goBack().
 * @property {Function|null} [onBackPress=null] - Custom handler for back-button press; takes priority over backButtonRoute.
 * @property {number} [margin=0] - Uniform outer margin.
 * @property {number} [marginTop=0] - Top outer margin (overrides margin).
 * @property {number} [marginBottom=0] - Bottom outer margin (overrides margin).
 * @property {number} [marginLeft=0] - Left outer margin (overrides margin).
 * @property {number} [marginRight=0] - Right outer margin (overrides margin).
 * @property {number} [padding=0] - Uniform inner padding.
 * @property {number} [paddingTop=0] - Top inner padding (overrides padding).
 * @property {number} [paddingBottom=0] - Bottom inner padding (overrides padding).
 * @property {number} [paddingLeft=4] - Left inner padding (overrides padding).
 * @property {number} [paddingRight=24] - Right inner padding (overrides padding).
 * @property {number|string} [borderRadius=0] - Border radius (number = pixels, string = CSS value).
 * @property {boolean|string} [shadow=true] - Whether to apply a shadow; pass a CSS string to use a custom shadow.
 * @property {boolean} [sticky=true] - Whether the bar sticks to the top of the viewport on scroll.
 * @property {boolean} [hideOnScroll=false] - Whether to animate the bar out of view when scrolling down.
 * @property {number} [scrollThreshold=100] - Scroll distance in pixels before the hide animation triggers.
 */

/**
 * AppBar renders a top navigation bar with a leading zone, a title, and
 * an optional set of action widgets on the right.
 *
 * The bar can stick to the top of the viewport (`sticky`), hide when
 * the user scrolls down (`hideOnScroll`), and auto-inject a back button
 * (`showBackButton`) wired to the router or a custom handler.
 *
 * Non-HTMLElement entries in `actions` are silently filtered out to prevent
 * "[object Object]" from being rendered.
 *
 * @param {AppBarProps} props
 * @returns {HTMLElement} The `<header>` element representing the app bar,
 *   augmented with the following methods:
 *   - `setTitle(newTitle: string)` — update the title text in place.
 *   - `setBackgroundColor(color: string)` — swap the background color or gradient.
 *   - `show()` / `hide()` — toggle bar visibility.
 */
export const AppBar = (props) => {
  const {
    title,
    leading = null,
    actions = [],
    actionsGap = 12,

    backgroundColor = colors.surface,
    gradient = null,
    titleColor = colors.text,
    iconColor = titleColor,
    elevation = 2,
    centerTitle = false,
    titleSize = 20,
    titleWeight = "500",

    showBackButton = false,
    backButtonRoute = null,
    onBackPress = null,

    margin = 0,
    marginTop = 0,
    marginBottom = 0,
    marginLeft = 0,
    marginRight = 0,

    padding = 0,
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft = 4,
    paddingRight = 24,
    borderRadius = 0,
    shadow = true,

    sticky = true,
    hideOnScroll = false,
    scrollThreshold = 100,
    ...rest
  } = props;

  // Guard: only HTMLElement instances are valid action widgets.
  // Filtering here prevents the common mistake of passing component results
  // that accidentally resolved to plain objects.
  const validActions = Array.isArray(actions)
    ? actions.filter((action) => action instanceof HTMLElement)
    : [];

  // Resolve shorthand margin/padding props — individual sides win over the
  // uniform shorthand when both are provided.
  const finalMarginTop = marginTop || margin;
  const finalMarginBottom = marginBottom || margin;
  const finalMarginLeft = marginLeft || margin;
  const finalMarginRight = marginRight || margin;

  const finalPaddingTop = paddingTop || padding;
  const finalPaddingBottom = paddingBottom || padding;
  const finalPaddingLeft = paddingLeft || padding;
  const finalPaddingRight = paddingRight || padding;

  const finalBorderRadius =
    typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;

  // Material Design elevation → box-shadow lookup table.
  const shadows = {
    0: "none",
    1: "0 1px 3px rgba(0,0,0,0.12)",
    2: "0 3px 6px rgba(0,0,0,0.16)",
    3: "0 6px 12px rgba(0,0,0,0.2)",
    4: "0 10px 20px rgba(0,0,0,0.25)",
    5: "0 15px 30px rgba(0,0,0,0.3)",
  };
  const boxShadow = shadow === true ? shadows[elevation] : shadow || "none";

  // ========== LEADING SECTION ==========
  // Auto-create a back button if requested and no custom leading was supplied.
  let finalLeading = leading;
  if (showBackButton && !finalLeading) {
    const backButton = Icon({
      name: "arrow_back",
      size: 24,
      color: iconColor,
      cursor: "pointer",
    });
    backButton.onclick = () => {
      if (onBackPress) onBackPress();
      else if (backButtonRoute) goTo(backButtonRoute);
      else goBack();
    };
    finalLeading = backButton;
  }

  // ========== BACKGROUND ==========
  // Gradient takes priority over a solid background color.
  let backgroundStyle = {};
  if (gradient) {
    backgroundStyle = { backgroundImage: gradient };
  } else if (backgroundColor) {
    backgroundStyle = { backgroundColor: backgroundColor };
  }

  // ========== MAIN APP BAR ELEMENT ==========
  const appBar = WidgetFactory({
    tag: "header",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    borderRadius: finalBorderRadius,
    marginTop: finalMarginTop,
    marginBottom: finalMarginBottom,
    marginLeft: finalMarginLeft,
    marginRight: finalMarginRight,
    paddingTop: finalPaddingTop,
    paddingBottom: finalPaddingBottom,
    paddingLeft: finalPaddingLeft,
    paddingRight: finalPaddingRight,
    boxShadow: boxShadow,
    flexShrink: 0,
    position: sticky ? "sticky" : "relative",
    top: sticky ? 0 : "auto",
    zIndex: sticky ? 100 : "auto",
    transition: "transform 0.3s ease, opacity 0.3s ease",
    ...rest.style,
    ...backgroundStyle,
    ...rest,
  });

  // ========== LEFT SECTION ==========
  // Fixed minimum width ensures the center title stays visually centered
  // even when no leading widget is present.
  const leftSection = Container({
    display: "flex",
    alignItems: "center",
    bgColor: "transparent",
    justifyContent: "flex-start",
    minWidth: 48,
    flexShrink: 0,
    child: finalLeading instanceof HTMLElement ? finalLeading : null,
  });
  appBar.appendChild(leftSection);

  // ========== TITLE ==========
  let titleElement;
  if (typeof title === "string") {
    titleElement = Text({
      text: title,
      size: titleSize,
      weight: titleWeight,
      color: titleColor,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      letterSpacing: "0.15px",
    });
  } else if (title instanceof HTMLElement) {
    titleElement = title;
  }

  const centerSection = Container({
    flex: centerTitle ? 1 : "none",
    display: "flex",
    alignItems: "center",
    justifyContent: centerTitle ? "center" : "flex-start",
    padding: "0 8px",
    bgColor: "transparent",
    overflow: "hidden",
    minWidth: 0,
    child: titleElement,
  });
  appBar.appendChild(centerSection);

  // ========== RIGHT SECTION (only rendered when there are valid actions) ==========
  if (validActions.length > 0) {
    const rightSection = Row({
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: paddingRight,
      gap: actionsGap,
      minWidth: 48,
      flexShrink: 0,
      backgroundColor: "transparent",
      children: validActions,
    });
    appBar.appendChild(rightSection);
  } else {
    // Invisible placeholder maintains three-zone layout balance when there
    // are no actions, keeping the title centered when centerTitle is true.
    const emptyRight = Container({
      minWidth: 48,
      flexShrink: 0,
      visibility: "hidden",
    });
    appBar.appendChild(emptyRight);
  }

  // ========== HIDE-ON-SCROLL BEHAVIOUR ==========
  // Attach a scroll listener that slides the bar off-screen when the user
  // scrolls down past the threshold, and restores it on scroll-up.
  if (hideOnScroll) {
    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        appBar.style.transform = "translateY(-100%)";
        appBar.style.opacity = "0";
      } else if (currentScrollY < lastScrollY) {
        appBar.style.transform = "translateY(0)";
        appBar.style.opacity = "1";
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    // Store the remover so _cleanup can deregister the listener.
    appBar._cleanupScroll = () =>
      window.removeEventListener("scroll", handleScroll);
  }

  // ========== PUBLIC API ==========

  /**
   * Update the title text in place without rebuilding the bar.
   *
   * @param {string} newTitle
   */
  appBar.setTitle = (newTitle) => {
    if (typeof newTitle === "string") {
      const titleText = centerSection.querySelector(
        "span:not(.material-icons)",
      );
      if (titleText) titleText.textContent = newTitle;
    }
  };

  /**
   * Swap the background color or gradient at runtime.
   * Passing a string that contains the word "gradient" sets backgroundImage;
   * otherwise it sets backgroundColor.
   *
   * @param {string} color - CSS color value or gradient string.
   */
  appBar.setBackgroundColor = (color) => {
    if (color && color.includes("gradient")) {
      appBar.style.backgroundImage = color;
      appBar.style.backgroundColor = "";
    } else {
      appBar.style.backgroundColor = color;
      appBar.style.backgroundImage = "";
    }
  };

  /** Make the app bar visible. */
  appBar.show = () => {
    appBar.style.display = "flex";
  };

  /** Hide the app bar (removes it from the layout flow). */
  appBar.hide = () => {
    appBar.style.display = "none";
  };

  // Cleanup: deregister the scroll listener added by hideOnScroll.
  const originalCleanup = appBar._cleanup;
  appBar._cleanup = () => {
    if (originalCleanup) originalCleanup();
    if (appBar._cleanupScroll) appBar._cleanupScroll();
  };

  return appBar;
};

export default AppBar;
