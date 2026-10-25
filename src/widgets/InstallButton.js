/**
 * @file InstallButton.js
 * @description PWA install prompt button; hidden unless install is available.
 */
import { Button } from "./Button.js";

export const InstallButton = (props) => {
  const {
    // The glyph used to be the 📲 emoji inside the text. An emoji is a picture the
    // operating system draws, so the button rendered as a tofu box wherever that
    // font is missing (and the framework already stopped putting emoji in UI in
    // favour of the bundled Material vocabulary). `get_app` is in `icons.css` for
    // every platform and inherits `color`, so it themes with the button.
    text = "Install",
    icon = "get_app",
    variant = "filled",
    size = "medium",
    borderRadius = 16,
    // A number is the framework's own form: Button doubles it horizontally
    // (12 vertical, 24 horizontal) and the factory emits it as `rem`.
    padding = 12,
    bottom = 24,
    backgroundColor,
    color,
    onInstalled,
    onClick,
    ...rest
  } = props;

  let deferredPrompt = null;
  let button = null;
  let isInstalled = false;

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        if (onInstalled) onInstalled();
        hideButton();
      }
      deferredPrompt = null;
    }
    if (onClick) onClick();
  };

  const showButton = () => {
    if (button && !isInstalled) {
      button.style.opacity = "1";
      button.style.visibility = "visible";
      button.style.display = "flex";
    }
  };

  const hideButton = () => {
    if (button) {
      button.style.opacity = "0";
      button.style.visibility = "hidden";
      button.style.display = "none";
    }
  };

  // Createste button using the flet-box Button component
  button = Button({
    widgetName: "InstallButton",
    text: text,
    icon: icon,
    variant: variant,
    size: size,
    bgColor: backgroundColor,
    color: color,
    borderRadius: borderRadius,
    padding: padding,
    position: "fixed",
    bottom,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10000,
    opacity: "0",
    visibility: "hidden",
    display: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    onPress: handleClick,
    ...rest,
  });

  // Listen to events
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showButton();
  };

  const handleAppInstalled = () => {
    isInstalled = true;
    hideButton();
    if (onInstalled) onInstalled();
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  // Cleanup
  const cleanup = () => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    window.removeEventListener("appinstalled", handleAppInstalled);
    if (button && button.remove) button.remove();
  };

  button.onUnmount(cleanup);

  return button;
};

export default InstallButton;
