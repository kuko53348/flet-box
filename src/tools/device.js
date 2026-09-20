// tools/device.js

/**
 * Device detection and responsive utilities.
 *
 * Uses `navigator.userAgent` and window geometry — not media queries — so results
 * are synchronous and available before the DOM is ready. All methods are pure reads
 * and never mutate global state; the listener helpers return cleanup functions so
 * callers can unsubscribe easily.
 *
 * @namespace device
 */
export const device = {
  /**
   * Detect whether the current device is a mobile phone.
   *
   * Matches common mobile UA strings including Android phones, iOS devices,
   * BlackBerry, Windows Phone (IEMobile), and Opera Mini.
   *
   * @returns {boolean} `true` if the UA string looks like a mobile phone
   */
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  },

  /**
   * Detect whether the current device is a tablet.
   *
   * Identifies iPads and Android tablets (Android UA without "Mobile" in the string).
   *
   * @returns {boolean} `true` if the UA string looks like a tablet
   */
  isTablet: () => {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  },

  /**
   * Detect whether the current device is a desktop/laptop.
   *
   * Returns `true` when neither `isMobile()` nor `isTablet()` match —
   * i.e. the catch-all for any device that is not a phone or tablet.
   *
   * @returns {boolean} `true` if the device is not mobile and not a tablet
   */
  isDesktop: () => {
    return !device.isMobile() && !device.isTablet();
  },

  /**
   * Get the current screen orientation.
   *
   * Compares `window.innerHeight` vs `window.innerWidth` rather than relying on
   * `screen.orientation`, which is less widely supported and may be locked by the OS.
   *
   * @returns {"portrait"|"landscape"} Current orientation string
   */
  orientation: () => {
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  },

  /**
   * Detect whether the device supports touch input.
   *
   * Checks both the `ontouchstart` event property and the `maxTouchPoints` API,
   * so it works across older and newer browsers consistently.
   *
   * @returns {boolean} `true` if the device supports touch events
   */
  isTouch: () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Detect whether the device supports multi-touch gestures (e.g. pinch-to-zoom).
   *
   * The `gesturestart` event is a non-standard WebKit extension primarily present
   * on iOS Safari. Use this to conditionally enable gesture-based interactions.
   *
   * @returns {boolean} `true` if gesture events are supported
   */
  hasGesture: () => {
    return "ongesturestart" in window;
  },

  /**
   * Subscribe to device orientation changes.
   *
   * Fires `callback` with the new orientation string (`"portrait"` or `"landscape"`)
   * whenever the device is rotated. Returns a cleanup function — call it to remove
   * the listener and avoid memory leaks.
   *
   * @param {function(orientation: "portrait"|"landscape"): void} callback - Called on each orientation change
   * @returns {function(): void} Cleanup function that removes the event listener
   *
   * @example
   * const unsub = device.onOrientationChange((o) => console.log('Now:', o));
   * // Later, when the component unmounts:
   * unsub();
   */
  onOrientationChange: (callback) => {
    const handler = () => callback(device.orientation());
    window.addEventListener("orientationchange", handler);
    return () => window.removeEventListener("orientationchange", handler);
  },

  /**
   * Subscribe to window resize events.
   *
   * Fires `callback` with the updated viewport dimensions and orientation on every
   * resize. Returns a cleanup function to unsubscribe. Prefer this over reading
   * `window.innerWidth` inline to avoid layout thrashing in tight loops.
   *
   * @param {function({ width: number, height: number, orientation: "portrait"|"landscape" }): void} callback
   *   Called with the new dimensions and orientation on each resize event
   * @returns {function(): void} Cleanup function that removes the event listener
   *
   * @example
   * const unsub = device.onResize(({ width, height, orientation }) => {
   *   console.log(`Viewport: ${width}×${height} (${orientation})`);
   * });
   * // Later:
   * unsub();
   */
  onResize: (callback) => {
    const handler = () =>
      callback({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: device.orientation(),
      });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  },
};

export default device;
