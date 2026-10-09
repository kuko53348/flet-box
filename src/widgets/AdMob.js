/**
 * @file AdMob.js
 * @description Google AdMob for native Capacitor targets (Android/iOS). This is
 * the mobile counterpart of `AdSense`: instead of a web SDK it drives the native
 * `@capacitor-community/admob` plugin. The widget renders a DOM placeholder that
 * reserves space and, on mount, shows the banner / prepares full-screen ads over
 * the native layer. On the web (no Capacitor) it degrades to the placeholder and
 * logs a single warning.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { composeUpdate } from "../utils/composeUpdate.js";

// Google's public sample unit ids — safe to use while developing. Replace them
// with your own real ids before shipping (keep isTesting once you go live only
// if you actually want test ads).
const TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";
const TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917";

const DEFAULT_COLOR = "#9ca3af";
const DEFAULT_BORDER_COLOR = "#d1d5db";

const WIDGET_PROP_KEYS = [
  "adId",
  "isTesting",
  "position",
  "size",
  "margin",
  "label",
  "placeholder",
  "interstitialId",
  "rewardedId",
];

// Initialisation is app-wide, so it only needs to happen once per plugin.
let initPromise = null;
let warnedMissingPlugin = false;

/**
 * Resolves the native AdMob plugin from an explicit prop or the Capacitor
 * bridge. `@capacitor-community/admob` registers itself as
 * `Capacitor.Plugins.AdMob`, which keeps FletBox dependency-free.
 *
 * @param {Object|null} [explicit] - Plugin instance passed by the caller.
 * @returns {Object|null}
 */
const resolvePlugin = (explicit) => {
  if (explicit) return explicit;
  const capacitor = globalThis.Capacitor;
  return (capacitor && capacitor.Plugins && capacitor.Plugins.AdMob) || null;
};

const ensureInitialized = (plugin) => {
  if (!plugin || typeof plugin.initialize !== "function") return Promise.resolve();
  if (!initPromise) {
    initPromise = Promise.resolve(plugin.initialize({})).catch((error) => {
      console.warn("[FletBox AdMob] initialize failed:", error);
    });
  }
  return initPromise;
};

/**
 * Creates a Google AdMob widget for native Capacitor builds.
 *
 * On a real device it shows a banner (top/bottom) and exposes methods for
 * interstitial and rewarded ads. In the browser it returns the same element but
 * does nothing beyond a one-time warning, so the app keeps working during web
 * development.
 *
 * @param {Object}  props
 * @param {string}  [props.adId=""] - Banner ad unit id. Defaults to Google's test unit.
 * @param {boolean} [props.isTesting=false] - Force Google test ads (recommended before release).
 * @param {"top"|"bottom"} [props.position="bottom"] - Native banner position.
 * @param {string}  [props.size="ADAPTIVE_BANNER"] - Banner size keyword ("ADAPTIVE_BANNER", "BANNER", "LARGE_BANNER", "MEDIUM_RECTANGLE", "FULL_BANNER", "LEADERBOARD", "SMART_BANNER").
 * @param {number}  [props.margin=0] - Distance in pixels from the chosen edge.
 * @param {string}  [props.interstitialId=""] - Ad unit id for `showInterstitial()`.
 * @param {string}  [props.rewardedId=""] - Ad unit id for `showRewarded()`.
 * @param {boolean} [props.autoShow=true] - Show the banner automatically on mount.
 * @param {number|string} [props.width="100%"] - Placeholder width.
 * @param {number|string} [props.height=50] - Placeholder height (reserve banner space).
 * @param {boolean} [props.placeholder=true] - Show the dashed placeholder.
 * @param {string}  [props.label="AdMob banner"] - Placeholder text.
 * @param {string}  [props.bgColor] - Placeholder background color.
 * @param {string}  [props.color=#9ca3af] - Placeholder label color.
 * @param {string}  [props.borderColor=#d1d5db] - Placeholder dashed border color.
 * @param {Object}  [props.plugin] - Explicit plugin instance (defaults to `Capacitor.Plugins.AdMob`).
 * @param {(widget: HTMLElement) => void} [props.onLoaded] - Called after the banner is shown.
 * @param {(error: Error, widget: HTMLElement) => void} [props.onFailed] - Called when a native call fails.
 * @param {() => void} [props.onDismissed] - Called after a full-screen ad is dismissed.
 * @returns {HTMLElement} The placeholder container, stamped `widgetName: "AdMob"`.
 */
export const AdMob = (props) => {
  const {
    adId = "",
    isTesting = false,
    position = "bottom",
    size = "ADAPTIVE_BANNER",
    margin = 0,
    interstitialId = "",
    rewardedId = "",
    autoShow = true,
    width = "100%",
    height = 50,
    placeholder = true,
    label = "AdMob banner",
    bgColor,
    color = DEFAULT_COLOR,
    borderColor = DEFAULT_BORDER_COLOR,
    plugin: pluginProp = null,
    onLoaded,
    onFailed,
    onDismissed,
    ...rest
  } = props;

  let currentAdId = adId;
  let currentIsTesting = isTesting;
  let currentPosition = position;
  let currentSize = size;
  let currentMargin = margin;
  let currentLabel = label;
  let currentPlaceholder = placeholder;
  let bannerVisible = false;
  let disposed = false;
  let labelElement = null;

  const bannerId = () => currentAdId || TEST_BANNER_ID;

  const withPlugin = (run) => {
    const plugin = resolvePlugin(pluginProp);
    if (!plugin) {
      if (!warnedMissingPlugin) {
        warnedMissingPlugin = true;
        console.warn(
          "[FletBox AdMob] native plugin not found. Install @capacitor-community/admob and run `npx cap sync` in your Capacitor project.",
        );
      }
      return Promise.resolve(null);
    }
    return ensureInitialized(plugin).then(() => run(plugin));
  };

  const container = WidgetFactory({
    widgetName: "AdMob",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width,
    height,
    backgroundColor: bgColor,
    borderStyle: "dashed",
    borderWidth: currentPlaceholder ? 1 : 0,
    borderColor,
    ...rest,
  });

  const refreshPlaceholder = () => {
    container.style.borderWidth = currentPlaceholder ? "1px" : "0px";
    if (!labelElement) return;
    labelElement.style.display = currentPlaceholder ? "" : "none";
    if (currentPlaceholder) labelElement.textContent = currentLabel.toUpperCase();
  };

  if (currentPlaceholder) {
    labelElement = WidgetFactory({
      widgetName: "Text",
      tag: "span",
      text: currentLabel.toUpperCase(),
      color,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 2,
      userSelect: "none",
      pointerEvents: "none",
    });
    container.appendChild(labelElement);
  }

  const showBanner = () => {
    if (disposed || !autoShow || bannerVisible) return Promise.resolve(null);
    return withPlugin((plugin) =>
      Promise.resolve(
        plugin.showBanner({
          adId: bannerId(),
          adSize: currentSize,
          position: currentPosition === "top" ? "TOP_CENTER" : "BOTTOM_CENTER",
          margin: currentMargin,
          isTesting: currentIsTesting,
        }),
      ).then(() => {
        bannerVisible = true;
        if (typeof onLoaded === "function") onLoaded(container);
      }),
    ).catch((error) => {
      if (disposed) return null;
      console.warn("[FletBox AdMob] showBanner failed:", error);
      if (typeof onFailed === "function") onFailed(error, container);
      return null;
    });
  };

  const hideBanner = () => {
    bannerVisible = false;
    return withPlugin((plugin) => {
      const remove = plugin.removeBanner || plugin.hideBanner;
      return typeof remove === "function" ? Promise.resolve(remove.call(plugin)) : null;
    }).catch(() => null);
  };

  const showFullScreen = (prepareProps, prepareName, showName) =>
    withPlugin((plugin) => {
      const prepare = plugin[prepareName];
      if (typeof prepare !== "function") {
        console.warn(`[FletBox AdMob] plugin has no ${prepareName}()`);
        return null;
      }
      return Promise.resolve(prepare.call(plugin, prepareProps))
        .then(() => plugin[showName]())
        .then((result) => {
          if (typeof onDismissed === "function") onDismissed();
          return result;
        });
    }).catch((error) => {
      console.warn(`[FletBox AdMob] ${showName} failed:`, error);
      if (typeof onFailed === "function") onFailed(error, container);
      return null;
    });

  /** Shows or re-shows the banner. */
  container.show = showBanner;

  /** Hides the banner (keeps it prepared). */
  container.hide = hideBanner;

  /** Prepares and shows an interstitial ad. */
  container.showInterstitial = () =>
    showFullScreen(
      {
        adId: interstitialId || TEST_INTERSTITIAL_ID,
        isTesting: currentIsTesting,
      },
      "prepareInterstitial",
      "showInterstitial",
    );

  /** Prepares and shows a rewarded video ad. */
  container.showRewarded = () =>
    showFullScreen(
      { adId: rewardedId || TEST_REWARDED_ID, isTesting: currentIsTesting },
      "prepareRewardVideoAd",
      "showRewardVideoAd",
    );

  /** @returns {Object|null} The resolved native plugin, if any. */
  container.getPlugin = () => resolvePlugin(pluginProp);

  composeUpdate(container, WIDGET_PROP_KEYS, (widgetProps) => {
    if ("adId" in widgetProps) currentAdId = widgetProps.adId;
    if ("isTesting" in widgetProps) currentIsTesting = widgetProps.isTesting;
    if ("position" in widgetProps) currentPosition = widgetProps.position;
    if ("size" in widgetProps) currentSize = widgetProps.size;
    if ("margin" in widgetProps) currentMargin = widgetProps.margin;
    if ("label" in widgetProps) currentLabel = widgetProps.label;
    if ("placeholder" in widgetProps) currentPlaceholder = widgetProps.placeholder;
    refreshPlaceholder();
  });

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    const plugin = resolvePlugin(pluginProp);
    if (plugin && typeof plugin.removeBanner === "function") {
      Promise.resolve(plugin.removeBanner()).catch(() => {});
    }
  };
  container.onUnmount(dispose);

  container.onMount(showBanner);

  refreshPlaceholder();

  return container;
};

export default AdMob;
