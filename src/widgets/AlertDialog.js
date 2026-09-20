/**
 * @file AlertDialog.js
 * @description A modal alert dialog built on top of the Modal widget.
 * Supports four semantic variants (normal, danger, warning, success), each
 * with its own icon and accent color. Exposes open/close methods and fires
 * optional callbacks on confirm, cancel, and close.
 */

import { Modal } from "./Modal.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { Column } from "./Column.js";
import { Icon } from "./Icon.js";
import { colors } from "../utils/themes.js";

/**
 * Creates an AlertDialog — a pre-styled modal with a title, message, icon,
 * and confirm/cancel buttons whose appearance adapts to the chosen variant.
 *
 * Returns a plain object (not an HTMLElement) with `open`, `close`, and
 * `modal` so the caller can programmatically control visibility while keeping
 * the underlying Modal instance accessible for advanced use.
 *
 * @param {Object} props - Configuration for the dialog.
 * @param {string} props.title - Heading text shown at the top of the dialog.
 * @param {string} props.message - Body text providing more detail to the user.
 * @param {Function} [props.onConfirm] - Called when the user clicks the confirm button, before the dialog closes.
 * @param {Function} [props.onCancel] - Called when the user clicks the cancel button, before the dialog closes.
 * @param {Function} [props.onClose] - Called whenever the dialog closes, regardless of how it was dismissed.
 * @param {'normal'|'danger'|'warning'|'success'} [props.variant='normal'] - Determines the icon and button accent color.
 * @param {boolean} [props.showCancel=true] - When false, the cancel button is omitted.
 * @param {string} [props.confirmText='Accept'] - Label for the confirm button.
 * @param {string} [props.cancelText='Cancel'] - Label for the cancel button.
 * @returns {{ open: Function, close: Function, modal: HTMLElement }} Controller object for the dialog.
 */
export const AlertDialog = (props) => {
  let {
    title,
    message,
    onConfirm,
    onCancel,
    onClose,
    variant = "normal", // 'normal', 'danger', 'warning', 'success'
    showCancel = true,
    confirmText = "Accept",
    cancelText = "Cancel",
    ...rest
  } = props;

  // Map each variant to its icon name, icon color, and confirm-button color
  const variantColors = {
    normal: { confirm: colors.primary, icon: "info", iconColor: colors.info },
    danger: {
      confirm: colors.danger,
      icon: "warning",
      iconColor: colors.danger,
    },
    warning: {
      confirm: colors.warning,
      icon: "error",
      iconColor: colors.warning,
    },
    success: {
      confirm: colors.success,
      icon: "check_circle",
      iconColor: colors.success,
    },
  };
  const variantStyle = variantColors[variant] || variantColors.normal;

  // Decorative icon at the top of the dialog body
  const icon = Icon({
    name: variantStyle.icon,
    size: 40,
    color: variantStyle.iconColor,
    marginBottom: 8,
  });

  // Centered column: icon → title → message
  const content = Column({
    alignItems: "center",
    style: { textAlign: "center" },
    children: [
      icon,
      Text({
        value: title,
        size: 24,
        fontWeight: "bold",
        color: colors.text,
        textAlign: "center",
      }),
      Text({
        value: message,
        size: 18,
        fontWeight: "bold",
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: 8,
      }),
    ],
  });

  // Build the action-button row — cancel first (if shown), then confirm
  const actions = [];

  if (showCancel) {
    actions.push(
      Button({
        text: cancelText,
        borderColor: colors.danger,
        variant: "filled",
        color: colors.danger,
        onPress: () => {
          if (onCancel) onCancel();
          closeModal();
        },
      }),
    );
  }

  actions.push(
    Button({
      text: confirmText,
      variant: "filled",
      bgColor: variantStyle.confirm,
      color: colors.text,
      borderColor: colors.surface,
      onPress: () => {
        if (onConfirm) onConfirm();
        closeModal();
      },
    }),
  );

  let modal = null;
  // Placeholder until the modal is created below — avoids a temporal dead-zone
  let closeModal = () => {};

  // Delegate to the base Modal widget, passing our content and actions
  modal = Modal({
    content: content,
    actions: actions,
    showCloseButton: false,
    width: 320,
    borderRadius: 24,
    onClose: () => {
      if (onClose) onClose();
    },
    ...rest,
  });

  // Now that modal exists, wire up the real close function
  closeModal = () => modal.close();

  // Public controller API
  const open = () => modal.open();
  const close = () => modal.close();

  return { open, close, modal };
};

export default AlertDialog;
