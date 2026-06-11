// src/core/index.js
export { runApp, createApp, insertBy, prependBy, insertBefore, insertAfter, replaceBy, mountAll } from './runApp.js';
export { App } from './App.js';
export { initHMR, getHMR } from './hmr-client.js';
export { installPWA, updatePWA, removePWA, isPWAInstalled } from './pwa.js';
