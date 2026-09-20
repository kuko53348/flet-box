// widgets/InstallButton.js
import { Button } from "./Button.js";
import { colors } from "../utils/themes.js";

export const InstallButton = (props) => {
  const {
    text = "📲 Install",
    variant = "filled",
    size = "medium",
    borderRadius = 28,
    padding = "12px 24px",
    bottom = 20,
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
        console.log("App installed");
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

  // Create button using the flet-box Button component
  button = Button({
    text: text,
    variant: variant,
    size: size,
    bgColor: backgroundColor,
    color: color,
    borderRadius: borderRadius,
    padding: padding,
    style: {
      position: "fixed",
      bottom: `${bottom}px`,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 10000,
      opacity: "0",
      visibility: "hidden",
      display: "none",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      ...rest.style,
    },
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

  const originalCleanup = button._cleanup;
  button._cleanup = () => {
    cleanup();
    if (originalCleanup) originalCleanup();
  };

  return button;
};

export default InstallButton;
