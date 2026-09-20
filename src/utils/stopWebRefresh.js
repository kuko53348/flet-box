// utils/stopWebRefresh.js

/**
 * Disables common browser refresh gestures so that the FletBox app behaves
 * more like a native application.
 *
 * Three mechanisms are blocked:
 * 1. **Keyboard shortcuts** — F5, Ctrl+R, and Cmd+R are intercepted via a
 *    `keydown` listener and their default action is prevented.
 * 2. **Context menu** — Right-click is suppressed on `document.body` to
 *    prevent the browser's "Reload" option from appearing.
 * 3. **Pull-to-refresh** (mobile) — A `touchmove` listener prevents the
 *    native pull-to-refresh gesture when the page is scrolled to the top and
 *    the touch is not inside a scrollable child element.
 *
 * All listeners are attached permanently for the lifetime of the page.
 * Call this function once, typically at app startup.
 */
export const stopWebRefresh = () => {
  // 1. Block refresh keys (F5, Ctrl+R, Cmd+R)
  window.addEventListener("keydown", (e) => {
    if (
      e.key === "F5" ||
      (e.ctrlKey && (e.key === "r" || e.key === "R")) ||
      (e.metaKey && (e.key === "r" || e.key === "R"))
    ) {
      e.preventDefault();
      console.log("🚫 Refresh disabled (keyboard)");
    }
  });

  // 2. Block right-click (context menu)
  document.body.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // 3. Block pull-to-refresh on mobile selectively
  let touchStartY = 0;
  let isAtTop = false;

  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
      // Check if we are at the top of the document
      isAtTop =
        window.scrollY === 0 && document.documentElement.scrollTop === 0;
    },
    { passive: true },
  ); // passive: true improves performance

  window.addEventListener(
    "touchmove",
    (e) => {
      const deltaY = e.touches[0].clientY - touchStartY;
      // Only prevent if: we are at the top, the movement is downward (deltaY > 0),
      // and the event does not occur inside an element with its own scroll.
      if (isAtTop && deltaY > 0) {
        // Try to block only if the target is not a scrolling element
        let target = e.target;
        while (target && target !== document.body) {
          const overflowY = window.getComputedStyle(target).overflowY;
          if (overflowY === "auto" || overflowY === "scroll") {
            // The touch is inside a scrolling container, allow movement
            return;
          }
          target = target.parentElement;
        }
        // If we get here, there's no internal scroll in the way → block pull-to-refresh
        e.preventDefault();
      }
    },
    { passive: false },
  );
};

export default stopWebRefresh;
