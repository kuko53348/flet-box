// tools/os.js

/**
 * Operating system detection utilities.
 *
 * Parses `navigator.userAgent` to identify the host OS and its version.
 * All methods are synchronous reads — no side effects, no caching.
 *
 * Note: UA-string detection is a best-effort heuristic. Browsers, WebViews,
 * and some privacy settings can spoof or omit UA data. Use these results for
 * progressive enhancement, not security decisions.
 *
 * @namespace os
 */
export const os = {
  /**
   * Get the name of the host operating system.
   *
   * Detection order matters: Android is checked before Linux because Android
   * UAs also contain "Linux". ChromeOS (CrOS) is checked last as a subset
   * of Linux-like UAs.
   *
   * @returns {"Windows"|"macOS"|"Android"|"iOS"|"Linux"|"ChromeOS"|"Unknown"}
   *   Normalized OS name, or `"Unknown"` when no known pattern matches
   *
   * @example
   * os.name() // "macOS" on a Mac, "Android" on an Android phone
   */
  name: () => {
    const ua = navigator.userAgent;

    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac OS|MacIntel|MacPPC|Mac68K/i.test(ua)) return "macOS";
    if (/Android/i.test(ua)) return "Android";
    if (/iOS|iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Linux/i.test(ua)) return "Linux";
    if (/CrOS/i.test(ua)) return "ChromeOS";

    return "Unknown";
  },

  /**
   * Get the version string of the host operating system.
   *
   * Extracts the version from the UA string using OS-specific regex patterns.
   * On macOS, underscore separators in the UA are normalized to dots
   * (e.g. `"10_15_7"` → `"10.15.7"`).
   *
   * @returns {string} Version string (e.g. `"10.0"`, `"14_2"` normalized to `"14.2"`)
   *   or `"Unknown"` when the pattern does not match
   *
   * @example
   * os.version() // "14.1" on macOS Sonoma, "13.0" on Windows 11
   */
  version: () => {
    const ua = navigator.userAgent;
    const osName = os.name();

    if (osName === "Windows") {
      const match = ua.match(/Windows NT (\d+\.\d+)/);
      if (match) return match[1];
    }
    if (osName === "macOS") {
      const match = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
      if (match) return match[1].replace(/_/g, ".");
    }
    if (osName === "Android") {
      const match = ua.match(/Android (\d+\.\d+)/);
      if (match) return match[1];
    }
    if (osName === "iOS") {
      const match = ua.match(/OS (\d+[._]\d+[._]?\d*)/);
      if (match) return match[1].replace(/_/g, ".");
    }

    return "Unknown";
  },

  /**
   * Detect whether the host OS is a mobile operating system.
   *
   * Returns `true` for Android and iOS. Use this when you need OS-level
   * behavior differences rather than viewport-size differences (prefer
   * `device.isMobile()` for viewport-based branching).
   *
   * @returns {boolean} `true` if the OS is Android or iOS
   */
  isMobile: () => {
    return os.name() === "Android" || os.name() === "iOS";
  },

  /**
   * Detect whether the host OS is a desktop operating system.
   *
   * The inverse of `os.isMobile()`.
   *
   * @returns {boolean} `true` if the OS is not Android or iOS
   */
  isDesktop: () => {
    return !os.isMobile();
  },
};

export default os;
