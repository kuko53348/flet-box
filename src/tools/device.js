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
    window.addEventListener("orientationchange", () => {
      callback(device.orientation());
    });
  },

  // Listen for resize events
  onResize: (callback) => {
    window.addEventListener("resize", () => {
      callback({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: device.orientation(),
      });
    });
  },
};

export default device;
