/**
 * @file AdSense.js
 * @description Google AdSense display unit for the web. Loads the official
 * `adsbygoogle.js` SDK exactly once per publisher client and asks it to fill a
 * `<ins class="adsbygoogle">` slot. Use this widget in browser / PWA / webview
 * targets; for native Android/iOS banners use the `AdMob` widget instead.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { injectScript } from "../utils/scriptInjector.js";
import { toREM } from "../utils/units.js";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

// Widget-owned props: routed to the widget's own updater, never to the factory.
const WIDGET_PROP_KEYS = ["client", "slot", "format", "responsive", "label", "placeholder", "test", "height"];

// Formats that size themselves from content (Google grows the slot after fill).
const SELF_SIZING_FORMATS = new Set(["autorelaxed", "fluid"]);

const DEFAULT_COLOR = "#9ca3af";
const DEFAULT_BORDER_COLOR = "#d1d5db";

/** Builds the per-publisher SDK URL so each client loads the script once. */
const adsenseScriptUrl = (client) =>
  `${ADSENSE_SRC}?client=${encodeURIComponent(client)}`;

/** Hands one unit to the shared `adsbygoogle` command queue. */
const pushAd = () => {
  if (typeof window === "undefined") return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (error) {
    console.warn("[FletBox AdSense] could not request an ad:", error);
  }
};

/**
 * Creates a Google AdSense display unit.
 *
 * The widget is inert until both `client` (publisher id) and `slot` (ad unit id)
 * are set. Once configured and mounted it injects the AdSense SDK (shared with
 * every other `AdSense` on the page) and pushes the unit to be filled. A dashed
 * placeholder is shown while the widget is unconfigured unless
 * `placeholder={false}`.
 *
 * @param {Object}  props
 * @param {string}  [props.client=""] - Publisher id, e.g. `"ca-pub-1234567890123456"`.
 * @param {string}  [props.slot=""] - Ad unit id (numeric string).
 * @param {string}  [props.format="auto"] - `data-ad-format` keyword ("auto", "horizontal", "rectangle", "vertical", "fluid", "autorelaxed").
 * @param {boolean} [props.responsive=true] - Emit `data-full-width-responsive="true"`.
 * @param {boolean} [props.test=false] - Emit `data-adtest="on"` so Google serves
 *   sample test ads from its test pool (ignores domain approval). Never ship
 *   with `test` enabled.
 * @param {number|string} [props.width="100%"] - Slot width.
 * @param {number|string} [props.height=280] - Reserved slot height.
 * @param {boolean} [props.placeholder=true] - Show the dashed placeholder while unconfigured.
 * @param {string}  [props.label="Advertisement"] - Placeholder text.
 * @param {string}  [props.bgColor] - Slot background color.
 * @param {string}  [props.color=#9ca3af] - Placeholder label color.
 * @param {string}  [props.borderColor=#d1d5db] - Placeholder dashed border color.
 * @param {(widget: HTMLElement) => void} [props.onLoad] - Called once the SDK is ready and the unit pushed.
 * @param {(error: Error, widget: HTMLElement) => void} [props.onError] - Called when the SDK fails to load.
 * @param {Widget[]} [props.children] - Extra host markup placed inside the slot.
 * @returns {HTMLElement} The slot container, stamped `widgetName: "AdSense"`.
 */
export const AdSense = (props) => {
  let {
    client = "",
    slot = "",
    format = "auto",
    responsive = true,
    test = false,
    width = "100%",
    height = 280,
    placeholder = true,
    label = "Advertisement",
    bgColor,
    color = DEFAULT_COLOR,
    borderColor = DEFAULT_BORDER_COLOR,
    onLoad,
    onError,
    ...rest
  } = props;

  let currentClient = client;
  let currentSlot = slot;
  let currentFormat = format;
  let currentResponsive = responsive;
  let currentTest = test;
  let insElement = null;
  let labelElement = null;
  let disposed = false;
  let mounted = false;
  let configured = !!client && !!slot;

  const isConfigured = () => !!currentClient && !!currentSlot;

  const isSelfSizing = () => SELF_SIZING_FORMATS.has(currentFormat);

  const container = WidgetFactory({
    widgetName: "AdSense",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width,
    height,
    backgroundColor: bgColor,
    borderStyle: "dashed",
    borderWidth: isConfigured() ? 0 : 1,
    borderColor,
    ...rest,
  });

  // Display/auto units reserve a fixed slot height; self-sizing formats
  // (autorelaxed, fluid) must grow with the content Google injects.
  const syncSizing = () => {
    if (isSelfSizing()) {
      container.style.height = "auto";
      container.style.overflow = "visible";
    } else {
      container.style.height = toREM(height);
      container.style.overflow = "hidden";
    }
    if (insElement) insElement.style.height = isSelfSizing() ? "auto" : "100%";
  };

  // If the initial format is self-sizing, drop the reserved height immediately.
  syncSizing();

  const applyAttrs = () => {
    if (!insElement) return;
    insElement.setAttribute("data-ad-client", currentClient);
    insElement.setAttribute("data-ad-slot", currentSlot);
    if (currentFormat) insElement.setAttribute("data-ad-format", currentFormat);
    else insElement.removeAttribute("data-ad-format");
    if (currentResponsive) {
      insElement.setAttribute("data-full-width-responsive", "true");
    } else {
      insElement.removeAttribute("data-full-width-responsive");
    }
    if (currentTest) {
      insElement.setAttribute("data-adtest", "on");
    } else {
      insElement.removeAttribute("data-adtest");
    }
  };

  const ensureIns = () => {
    if (insElement) return insElement;
    insElement = document.createElement("ins");
    insElement.className = "adsbygoogle";
    insElement.style.display = "block";
    insElement.style.width = "100%";
    container.appendChild(insElement);
    applyAttrs();
    syncSizing();
    return insElement;
  };

  const syncPlaceholder = () => {
    const show = placeholder && !isConfigured();
    container.style.borderWidth = show ? "1px" : "0px";
    if (!show) {
      if (labelElement) labelElement.style.display = "none";
      return;
    }
    if (!labelElement) {
      labelElement = WidgetFactory({
        widgetName: "Text",
        tag: "span",
        text: label.toUpperCase(),
        color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 2,
        userSelect: "none",
        pointerEvents: "none",
        position: "absolute",
      });
      container.appendChild(labelElement);
    }
    labelElement.style.display = "";
    labelElement.textContent = label.toUpperCase();
  };

  const load = () => {
    if (disposed) return;
    if (!isConfigured()) {
      syncPlaceholder();
      return;
    }
    syncPlaceholder();
    ensureIns();
    injectScript(adsenseScriptUrl(currentClient), {
      async: true,
      crossOrigin: "anonymous",
    })
      .then(() => {
        if (disposed) return;
        pushAd();
        if (typeof onLoad === "function") onLoad(container);
      })
      .catch((error) => {
        if (disposed) return;
        console.warn("[FletBox AdSense] SDK failed to load:", error);
        if (typeof onError === "function") onError(error, container);
      });
  };

  /** Requests another ad for the same unit (e.g. after a route change). */
  container.refresh = () => {
    if (isConfigured()) {
      ensureIns();
      pushAd();
    }
    return container;
  };

  /** Starts (or restarts) the SDK load + fill cycle. */
  container.load = load;

  /** @returns {HTMLElement} The `<ins>` unit when live, otherwise the container. */
  container.getElement = () => insElement || container;

  composeUpdate(container, WIDGET_PROP_KEYS, (widgetProps) => {
    if ("client" in widgetProps) currentClient = widgetProps.client;
    if ("slot" in widgetProps) currentSlot = widgetProps.slot;
    if ("format" in widgetProps) currentFormat = widgetProps.format;
    if ("responsive" in widgetProps) currentResponsive = widgetProps.responsive;
    if ("test" in widgetProps) currentTest = widgetProps.test;
    if ("height" in widgetProps) height = widgetProps.height;
    if ("label" in widgetProps) label = widgetProps.label;
    if ("placeholder" in widgetProps) placeholder = widgetProps.placeholder;
    applyAttrs();
    syncSizing();
    syncPlaceholder();

    // Going from unconfigured to configured after mount should actually start
    // serving; before mount the `onMount` hook handles it.
    const nowConfigured = isConfigured();
    if (nowConfigured && !configured && mounted) load();
    configured = nowConfigured;
  });

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    mounted = false;
  };
  container.onUnmount(dispose);

  container.onMount(() => {
    mounted = true;
    load();
  });

  syncPlaceholder();

  return container;
};

export default AdSense;
