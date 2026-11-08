/**
 * @file Menu.js
 * @description A trigger that opens an anchored menu of actions (kebab menu).
 */
import { colors } from "../utils/themes.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { Container } from "./Container.js";
import { Row } from "./Row.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { Button } from "./Button.js";
import { TAP_MINIMUM } from "../tools/index.js";
import { trapFocus } from "../utils/focusScope.js";

/**
 * Props owned by the closure. They are routed to `update()` and never to the
 * factory: `items` is an array of records, not something the DOM can receive.
 */
const MENU_PROP_KEYS = ["items", "disabled", "label"];

/** The panel is a portal on `document.body`, so the trigger points at it by id. */
let menuIdSeed = 0;

/**
 * A kebab (or any icon) trigger with a menu of actions. It is the widget a row
 * uses for "rename / delete" without spending two permanent buttons on it.
 *
 * The panel is a real menu, not a list of links: the trigger keeps the Tab stop
 * and the arrow keys move focus through `role="menuitem"` rows. `Escape` closes
 * and returns focus; `Tab` closes and lets the page continue. Every listener it
 * adds is released when the widget unmounts.
 */
export const Menu = (inputProps = {}) => {
  const {
    items = [],
    label = "Open menu",
    icon = "more_vert",
    width = 200,
    align = "end",
    disabled = false,
    portal = true,
    bgColor = colors.surface,
    borderRadius = 8,
    size = TAP_MINIMUM,
    ...rest
  } = inputProps;

  let currentItems = Array.isArray(items) ? [...items] : [];
  let currentLabel = String(label);
  let currentDisabled = Boolean(disabled);
  let isOpen = false;
  let panel = null;
  let itemNodes = [];
  let outsideClickListener = null;
  let positionListener = null;
  let releaseFocus = null;

  const baseId =
    typeof rest.id === "string" && rest.id ? rest.id : `fletbox-menu-${++menuIdSeed}`;
  const panelId = `${baseId}-panel`;

  const trigger = Button({
    icon,
    variant: "text",
    width: size,
    height: size,
    padding: 8,
    borderRadius,
    color: colors.textSecondary,
    bgColor: "transparent",
    "aria-label": currentLabel,
    "aria-haspopup": "menu",
    "aria-expanded": "false",
    onPress: () => {
      if (isOpen) closeMenu(true);
      else openMenu();
    },
  });

  const root = Container({
    widgetName: "Menu",
    position: "relative",
    width: "auto",
    display: "inline-flex",
    bgColor: "transparent",
    ...rest,
    children: [trigger],
  });

  const enabledNodes = () =>
    itemNodes.filter((node) => node.getAttribute("aria-disabled") !== "true");

  const focusNode = (node) => {
    if (node) node.focus();
  };

  /** Close first, then run the action: a modal opened by the action takes the
   *  focus after the trigger has already got it back. */
  const activate = (index) => {
    const item = currentItems[index];
    if (!item || item.disabled || currentDisabled) return;
    closeMenu(true);
    item.onPress?.();
  };

  const buildPanel = () => {
    const node = Column({
      id: panelId,
      role: "menu",
      "aria-label": currentLabel,
      zIndex: 10000,
      width,
      maxHeight: 320,
      padding: 4,
      gap: 4,
      overflow: "auto",
      bgColor,
      border: `1px solid ${colors.border}`,
      borderRadius,
      boxShadow: "0 12px 32px rgba(15,23,42,0.16)",
      boxSizing: "border-box",
    });

    currentItems.forEach((item, index) => {
      const danger = Boolean(item.danger);
      const itemDisabled = Boolean(item.disabled) || currentDisabled;
      const ink = danger ? colors.dangerStrong : colors.text;
      const row = Row({
        role: "menuitem",
        tabIndex: -1,
        // A menu item is reached with the arrows, never with Tab: the trigger is
        // the control, and the panel is a list of actions it owns.
        "aria-disabled": itemDisabled ? "true" : undefined,
        minHeight: TAP_MINIMUM,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 8,
        borderRadius: 4,
        alignItems: "center",
        cursor: itemDisabled ? "not-allowed" : "pointer",
        opacity: itemDisabled ? 0.5 : 1,
        disableTransform: true,
        bgColor: "transparent",
        onclick: itemDisabled ? undefined : () => activate(index),
        children: [
          item.icon
            ? Icon({
                name: item.icon,
                size: 18,
                color: danger ? colors.dangerStrong : colors.textSecondary,
              })
            : null,
          Text({
            text: item.text || "",
            size: 14,
            color: ink,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }),
        ].filter(Boolean),
      });
      row.onmouseenter = () => {
        if (!itemDisabled) row.style.backgroundColor = colors.border;
      };
      row.onmouseleave = () => {
        row.style.backgroundColor = "transparent";
      };
      node.appendChild(row);
      itemNodes.push(row);
    });

    return node;
  };

  /** The panel is measured in px because it is already laid out: this is the
   *  one place a pixel is the truth (viewport geometry), not a frozen size. */
  const positionPanel = () => {
    if (!panel) return;
    const rect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const left =
      align === "end" ? rect.right - panelRect.width : rect.left;
    const topCandidate = rect.bottom + 4;
    const fitsBelow = topCandidate + panelRect.height <= window.innerHeight - 8;
    const top = fitsBelow
      ? topCandidate
      : Math.max(8, rect.top - panelRect.height - 4);
    panel.style.position = "fixed";
    panel.style.left = `${Math.max(8, Math.min(left, window.innerWidth - panelRect.width - 8))}px`;
    panel.style.top = `${Math.max(8, Math.min(top, window.innerHeight - 8))}px`;
  };

  const onPanelKeyDown = (event) => {
    const nodes = enabledNodes();
    const index = nodes.indexOf(document.activeElement);

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu(true);
      return;
    }
    if (event.key === "Tab") {
      // Release before the trap's own listener reads the key: a menu closes on
      // Tab, it does not keep the reader inside a panel they asked to leave.
      if (releaseFocus) {
        releaseFocus();
        releaseFocus = null;
      }
      closeMenu(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!nodes.length) return;
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = index < 0
        ? (step > 0 ? 0 : nodes.length - 1)
        : (index + step + nodes.length) % nodes.length;
      focusNode(nodes[next]);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusNode(nodes[0]);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusNode(nodes[nodes.length - 1]);
    }
  };

  const openMenu = () => {
    if (currentDisabled || isOpen) return;
    isOpen = true;
    panel = buildPanel();
    if (portal) document.body.appendChild(panel);
    else root.appendChild(panel);
    positionPanel();
    // The panel holds Tab while it is open and gives focus back on close; this
    // is the same scope the three overlays use, not a second listener.
    releaseFocus = trapFocus(panel);
    // Capture: the Tab branch above has to release the trap before the trap's
    // own listener runs, or the browser swallows the key and the panel closes
    // without the focus moving on.
    panel.addEventListener("keydown", onPanelKeyDown, true);

    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-controls", panelId);
    focusNode(enabledNodes()[0]);

    outsideClickListener = (event) => {
      if (root.contains(event.target)) return;
      if (panel && panel.contains(event.target)) return;
      closeMenu(false);
    };
    positionListener = () => positionPanel();
    document.addEventListener("click", outsideClickListener);
    window.addEventListener("resize", positionListener);
    window.addEventListener("scroll", positionListener, true);
  };

  const closeMenu = (returnFocus) => {
    if (!isOpen) return;
    isOpen = false;
    if (panel) {
      panel.removeEventListener("keydown", onPanelKeyDown, true);
      panel.remove();
    }
    panel = null;
    itemNodes = [];
    if (releaseFocus) {
      releaseFocus();
      releaseFocus = null;
    }
    trigger.setAttribute("aria-expanded", "false");
    trigger.removeAttribute("aria-controls");
    if (outsideClickListener) {
      document.removeEventListener("click", outsideClickListener);
      outsideClickListener = null;
    }
    if (positionListener) {
      window.removeEventListener("resize", positionListener);
      window.removeEventListener("scroll", positionListener, true);
      positionListener = null;
    }
    if (returnFocus) trigger.focus();
  };

  // ArrowDown/ArrowUp open the menu from the trigger, the way a native menu
  // button does. Enter and Space are the engine's own press path.
  const onTriggerKeyDown = (event) => {
    if (event.target !== trigger || currentDisabled || isOpen) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu();
      const nodes = enabledNodes();
      focusNode(event.key === "ArrowDown" ? nodes[0] : nodes[nodes.length - 1]);
    }
  };
  trigger.addEventListener("keydown", onTriggerKeyDown);

  const update = (newProps) => {
    if (newProps.items !== undefined) {
      currentItems = Array.isArray(newProps.items) ? [...newProps.items] : [];
      if (isOpen) {
        closeMenu(false);
        openMenu();
      }
    }
    if (newProps.label !== undefined) {
      currentLabel = String(newProps.label);
      trigger.setAttribute("aria-label", currentLabel);
    }
    if (newProps.disabled !== undefined) {
      currentDisabled = Boolean(newProps.disabled);
      trigger.update({ disabled: currentDisabled });
      if (currentDisabled) closeMenu(false);
    }
  };

  composeUpdate(root, MENU_PROP_KEYS, update);

  root.open = openMenu;
  root.close = () => closeMenu(false);

  root.onUnmount(() => {
    closeMenu(false);
    trigger.removeEventListener("keydown", onTriggerKeyDown);
  });

  return root;
};

export default Menu;
