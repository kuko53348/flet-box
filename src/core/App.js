// src/core/App.js
// FletBox Kids - Ultra simple: only receives ONE widget

/**
 * Mounts a single widget into the application root element.
 *
 * Looks for an existing `#root` element in the document. If none is found, a
 * new `<div id="root">` is created and appended to `document.body` — the body
 * itself is never cleared so that host scripts and markup are preserved.
 *
 * The root is reset on every call (via `innerHTML = ""`), making this function
 * suitable for simple, single-widget apps that do not need the full lifecycle
 * management provided by `runApp`.
 *
 * @param {HTMLElement} widget - The widget element to render inside the root.
 *   Must be a valid DOM element (`nodeType === 1`). When provided, its width is
 *   stretched to fill the root container.
 * @returns {HTMLElement} The root container element.
 */
export const App = (widget) => {
  let root = document.getElementById("root");
  if (!root) {
    // Never clear document.body (it would wipe the host's scripts/markup);
    // create a dedicated root container instead.
    root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }
  root.innerHTML = "";
  root.style.margin = "0";
  root.style.padding = "0";

  root.style.width = "100%";
  root.style.minHeight = "100vh";

  if (widget && widget.nodeType === 1) {
    widget.style.width = "100%";
    root.appendChild(widget);
  }

  return root;
};

export default App;
