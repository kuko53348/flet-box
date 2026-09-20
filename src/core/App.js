// src/core/App.js
// FletBox Kids - Ultra simple: only receives ONE widget

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
