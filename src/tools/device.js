// tools/device.js

export const device = {
  // Detect device type
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  },

  isTablet: () => {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  },

  isDesktop: () => {
    return !device.isMobile() && !device.isTablet();
  },

  // Orientation
  orientation: () => {
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  },

  // Touch support
  isTouch: () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  },

  // Gesture support
  hasGesture: () => {
    return "ongesturestart" in window;
  },

  // Listen for orientation changes
  onOrientationChange: (callback) => {
    const handler = () => callback(device.orientation());
    window.addEventListener("orientationchange", handler);
    return () => window.removeEventListener("orientationchange", handler);
  },

  // Listen for resize events
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
