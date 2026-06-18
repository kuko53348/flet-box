// src/core/hmr-client.js
let ws = null;
let modules = new Map();

export const initHMR = () => {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${protocol}//${location.host}`);

  ws.onopen = () => {
    console.log("🔥 HMR connected");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "request-modules") {
      // Send registered modules to server
      const moduleUrls = Array.from(modules.keys());
      ws.send(
        JSON.stringify({ type: "register-modules", modules: moduleUrls }),
      );
    }

    if (data.type === "hmr") {
      handleHMR(data);
    }

    if (data.type === "reload") {
      console.log("🔄 Full reload triggered");
      window.location.reload();
    }
  };

  ws.onclose = () => {
    console.log("🔄 HMR disconnected, reloading...");
    setTimeout(() => window.location.reload(), 500);
  };
};

const handleHMR = (data) => {
  const { file, changeType } = data;

  if (changeType === "css") {
    // Reload CSS without page refresh
    const links = document.querySelectorAll(
      `link[href*="${file.replace(/\\/g, "/")}"]`,
    );
    links.forEach((link) => {
      const newLink = link.cloneNode();
      newLink.href = link.href.split("?")[0] + "?t=" + Date.now();
      link.parentNode.replaceChild(newLink, link);
    });
    console.log(`🎨 Hot reloaded CSS: ${file}`);
    return;
  }

  if (changeType === "exports-changed") {
    console.log(`📦 Exports changed in ${file}, reloading...`);
    window.location.reload();
    return;
  }

  // Code change - attempt hot reload
  console.log(`🔥 Hot reloading: ${file}`);
  const url = `/${file}?t=${Date.now()}`;
  import(url)
    .then((module) => {
      // Trigger custom event for components to update
      window.dispatchEvent(
        new CustomEvent("hmr:update", { detail: { file, module } }),
      );
    })
    .catch((err) => {
      console.error("HMR import failed:", err);
      window.location.reload();
    });
};

export const registerModule = (url, module) => {
  modules.set(url, module);
};

// ✅ Añadida la función getHMR para que coincida con la exportación de index.js
export const getHMR = () => ws;

export default { initHMR, registerModule, getHMR };
