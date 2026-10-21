/**
 * FletBox OTA loader — runs BEFORE the app inside a production bundle (www/).
 *
 * createBundle copies this file verbatim to www/loader.js and rewrites
 * www/index.html so the module entry is ./loader.js instead of ./src/app.js.
 * It is a real, self-contained ES module (no build step, no imports) so it can
 * be syntax-checked with `node --check` and shipped as-is.
 *
 * Boot sequence:
 *   1. Read the SHIPPED ./config.json (describes the bundle baked into this
 *      build + where updates live: `update.url`).
 *   2. Work out which bundle is currently active — a previously installed OTA
 *      bundle (tracked in localStorage + Cache Storage) or the shipped one —
 *      and remember its hash.
 *   3. Fetch the REMOTE config.json from `update.url` (no-store, short timeout).
 *      If its hash differs from the active one, an update is available.
 *   4. Depending on policy, either download silently (mode:"auto"/mandatory) or
 *      show an Accept/Cancel dialog. On accept: download the bundle, verify its
 *      sha256, store it in Cache Storage, and run it.
 *   5. Whatever happens, an app always launches — network failures, offline,
 *      hash mismatches, or a missing update URL simply fall back to the current
 *      bundle. OTA never bricks the app.
 *
 * SECURITY: the downloaded bundle is only run if its sha256 matches the hash in
 * the remote config.json. If Web Crypto is unavailable (non-secure context) OTA
 * is skipped rather than running unverified code.
 *
 * Extra release files (`config.json` → `assets`) are served to the app through
 * `globalThis.__FLETBOX_OTA_ASSET__(path)`: cached copy, then the published one
 * (verified against its manifest hash), then the copy baked into this build.
 */

const SHIPPED_BUNDLE = "./src/app.js";
const OTA_CACHE = "fletbox-ota";
const LS_KEY = "fletbox.ota.installed";
const FETCH_TIMEOUT_MS = 6000;

const log = (...a) => console.log("[fletbox-ota]", ...a);
const warn = (...a) => console.warn("[fletbox-ota]", ...a);

const readInstalled = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null;
  } catch {
    return null;
  }
};

const writeInstalled = (value) => {
  try {
    if (value) localStorage.setItem(LS_KEY, JSON.stringify(value));
    else localStorage.removeItem(LS_KEY);
  } catch {
    /* storage disabled (private mode) — OTA just won't persist */
  }
};

/** sha256 hex digest of a string, or null when Web Crypto is unavailable. */
async function sha256(text) {
  if (!(globalThis.crypto && crypto.subtle)) return null;
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** fetch JSON with a timeout + no-store so a stale cache never masks an update. */
async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Executes an ES module from source text via a Blob URL. */
function runModuleSource(text) {
  const blobUrl = URL.createObjectURL(
    new Blob([text], { type: "text/javascript" }),
  );
  return import(blobUrl);
}

/** Runs the installed OTA bundle if present, else the shipped one. */
async function runInstalledOrShipped() {
  const inst = readInstalled();
  if (inst && inst.url && "caches" in globalThis) {
    try {
      const cache = await caches.open(OTA_CACHE);
      const res = await cache.match(inst.url);
      if (res) {
        log("running installed bundle", inst.version || "");
        return runModuleSource(await res.text());
      }
      writeInstalled(null); // cache entry vanished — fall back to shipped
    } catch (e) {
      warn("could not read installed bundle, using shipped:", e.message);
      writeInstalled(null);
    }
  }
  return import(SHIPPED_BUNDLE);
}

/**
 * Plain-DOM "update available" dialog. Built by hand (no flet-box) because it
 * must render BEFORE the framework itself is loaded. Resolves true on Accept,
 * false on Cancel. `mandatory` hides the Cancel option.
 */
function showPrompt({ from, to, notes, sizeBytes, mandatory }) {
  return new Promise((resolve) => {
    const kb = sizeBytes ? (sizeBytes / 1024).toFixed(0) + " KB" : "";
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;" +
      "justify-content:center;background:rgba(10,10,20,.6);backdrop-filter:blur(4px);" +
      "font-family:system-ui,-apple-system,sans-serif;padding:20px;box-sizing:border-box;";

    const card = document.createElement("div");
    card.style.cssText =
      "width:100%;max-width:380px;background:#16162a;color:#eaeaf2;border-radius:18px;" +
      "padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.5);box-sizing:border-box;";

    const title = document.createElement("div");
    title.textContent = "Update available";
    title.style.cssText = "font-size:19px;font-weight:700;margin-bottom:6px;";

    const ver = document.createElement("div");
    ver.textContent = from && to ? from + "  →  " + to : "A new version is ready.";
    ver.style.cssText = "font-size:13px;color:#9a9ac0;margin-bottom:14px;";

    card.appendChild(title);
    card.appendChild(ver);

    if (notes) {
      const n = document.createElement("div");
      n.textContent = notes;
      n.style.cssText =
        "font-size:14px;line-height:1.5;color:#c7c7e0;margin-bottom:14px;" +
        "white-space:pre-wrap;max-height:160px;overflow:auto;";
      card.appendChild(n);
    }
    if (kb) {
      const s = document.createElement("div");
      s.textContent = "Download size: " + kb;
      s.style.cssText = "font-size:12px;color:#7a7aa0;margin-bottom:18px;";
      card.appendChild(s);
    }

    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;justify-content:flex-end;";

    const btnBase =
      "border:0;border-radius:10px;padding:11px 18px;font-size:14px;font-weight:600;" +
      "cursor:pointer;font-family:inherit;";

    if (!mandatory) {
      const later = document.createElement("button");
      later.textContent = "Later";
      later.style.cssText = btnBase + "background:#2a2a44;color:#c7c7e0;";
      later.onclick = () => {
        overlay.remove();
        resolve(false);
      };
      row.appendChild(later);
    }

    const update = document.createElement("button");
    update.textContent = mandatory ? "Update" : "Update now";
    update.style.cssText = btnBase + "background:#6366f1;color:#fff;";
    update.onclick = () => {
      update.disabled = true;
      update.textContent = "Downloading…";
      overlay.dataset.accepted = "1";
      resolve(true);
    };
    row.appendChild(update);

    card.appendChild(row);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Expose the overlay so the caller can update/close it during download.
    showPrompt._overlay = overlay;
    showPrompt._btn = update;
  });
}

const closePrompt = () => {
  if (showPrompt._overlay) {
    showPrompt._overlay.remove();
    showPrompt._overlay = null;
    showPrompt._btn = null;
  }
};

const setPromptStatus = (text) => {
  if (showPrompt._btn) showPrompt._btn.textContent = text;
};

/**
 * Numeric version compare for the minNativeVersion gate. Returns true when
 * `have` >= `want`. Missing parts are treated as 0. On web there is no native
 * version, so callers pass null and the gate is skipped.
 */
function versionAtLeast(have, want) {
  if (!want || want === "0.0.0") return true;
  if (!have) return true; // unknown native version (web) → don't block
  const a = String(have).split(".").map((n) => parseInt(n, 10) || 0);
  const b = String(want).split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x !== y) return x >= y;
  }
  return true;
}

/**
 * Checks the remote config and, if an update is accepted, downloads + verifies +
 * stores + runs it. Returns true when a NEW bundle was launched, false when the
 * caller should run the current one.
 */
async function checkAndUpdate(shippedConfig, activeHash) {
  const update = shippedConfig && shippedConfig.update;
  if (!update || !update.url) return false; // OTA disabled

  let remote;
  try {
    remote = await fetchJson(update.url + "config.json");
  } catch (e) {
    log("no remote config (offline or not deployed yet):", e.message);
    return false;
  }
  if (!remote || typeof remote.hash !== "string") return false;
  // Even when this release turns out to be the one already running, its asset
  // list is the newest truth about where the app's files live.
  rememberAssets(remote, update.url);
  if (remote.hash === activeHash) {
    log("up to date (" + (remote.version || activeHash.slice(0, 8)) + ")");
    return false;
  }

  // Native-shell compatibility gate (Phase 2 injects the real native version).
  const nativeVersion = globalThis.__FLETBOX_NATIVE_VERSION__ || null;
  if (!versionAtLeast(nativeVersion, remote.minNativeVersion)) {
    warn(
      "update requires native " +
        remote.minNativeVersion +
        " but shell is " +
        (nativeVersion || "unknown") +
        " — update the app from the store instead.",
    );
    return false;
  }

  const mandatory = !!(remote.update && remote.update.mandatory);
  const auto = update.mode === "auto";

  // mode:"auto" downloads silently. Otherwise show the dialog; a mandatory
  // update still shows it but without a "Later" button, so it can't be skipped.
  if (!auto) {
    const ok = await showPrompt({
      from: (readInstalled() || shippedConfig || {}).version,
      to: remote.version,
      notes: (remote.update && remote.update.notes) || "",
      sizeBytes: remote.size,
      mandatory,
    });
    if (!ok) {
      closePrompt();
      return false;
    }
  }

  // Download the bundle.
  const bundleUrl = update.url + (remote.bundle || "src/app.js");
  let text;
  try {
    if (!auto) setPromptStatus("Downloading…");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    const res = await fetch(bundleUrl, { cache: "no-store", signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("HTTP " + res.status);
    text = await res.text();
  } catch (e) {
    warn("download failed:", e.message);
    closePrompt();
    return false;
  }

  // Verify integrity before running anything.
  const digest = await sha256(text);
  if (digest === null) {
    warn("Web Crypto unavailable — refusing to run an unverified bundle.");
    closePrompt();
    return false;
  }
  if (digest !== remote.hash) {
    warn("hash mismatch (expected " + remote.hash.slice(0, 12) + ", got " + digest.slice(0, 12) + ") — aborting.");
    closePrompt();
    return false;
  }

  // Persist into Cache Storage so the next launch runs it offline.
  if ("caches" in globalThis) {
    try {
      const cache = await caches.open(OTA_CACHE);
      await cache.put(
        bundleUrl,
        new Response(text, {
          headers: { "Content-Type": "text/javascript" },
        }),
      );
      writeInstalled({
        url: bundleUrl,
        hash: remote.hash,
        version: remote.version,
      });
    } catch (e) {
      warn("could not cache bundle (running it once):", e.message);
    }
  }

  log("applying update → " + (remote.version || remote.hash.slice(0, 12)));
  await runModuleSource(text);
  closePrompt();
  return true;
}

// ---- Release assets -----------------------------------------------------
// config.json may name files a release serves beside the bundle (markdown docs,
// JSON data, images). OTA replaces the bundle and nothing else, so an app
// packaged two builds ago still has the old copy of those files on disk — the
// symptom is an updated catalog pointing at pages the device does not have.
// The app calls globalThis.__FLETBOX_OTA_ASSET__(path) and gets a Response, or
// null when the file exists in neither place.
const SHIPPED_BASE = new URL("./", import.meta.url).href;

let assetSource = null; // base URL of the newest release the loader has seen
let assetHashes = null; // Map "<path>" -> expected sha256

const rememberAssets = (config, base) => {
  if (!config || !Array.isArray(config.assets) || !config.assets.length) return;
  assetSource = base;
  assetHashes = new Map(
    config.assets
      .filter((a) => a && typeof a.path === "string" && typeof a.hash === "string")
      .map((a) => [a.path, a.hash]),
  );
};

const openAssetCache = async () =>
  "caches" in globalThis ? await caches.open(OTA_CACHE) : null;

globalThis.__FLETBOX_OTA_ASSET__ = async (relPath) => {
  const clean = String(relPath || "").replace(/^\.?\//, "");
  if (!clean) return null;
  const shippedUrl = new URL(clean, SHIPPED_BASE).href;
  const url = assetSource ? new URL(clean, assetSource).href : shippedUrl;

  try {
    const cache = await openAssetCache();
    const hit = cache && (await cache.match(url));
    if (hit) return hit;
  } catch (e) {
    log("asset cache unreadable:", e.message);
  }

  if (url !== shippedUrl) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        const type = res.headers.get("Content-Type") || "application/octet-stream";
        const expected = assetHashes && assetHashes.get(clean);
        const digest = expected ? await sha256(text) : null;
        if (digest && digest !== expected) {
          warn("asset hash mismatch for " + clean + " — using this build's copy");
        } else {
          try {
            const cache = await openAssetCache();
            if (cache) {
              await cache.put(
                url,
                new Response(text, { headers: { "Content-Type": type } }),
              );
            }
          } catch (e) {
            log("asset not cached:", e.message);
          }
          return new Response(text, { headers: { "Content-Type": type } });
        }
      }
    } catch (e) {
      log("asset fetch failed for " + clean + ":", e.message);
    }
  }

  // Offline, unpublished, or it failed verification: ship what this build holds.
  try {
    const res = await fetch(shippedUrl);
    return res.ok ? res : null;
  } catch (e) {
    log("asset missing from this build (" + clean + "):", e.message);
    return null;
  }
};

(async function main() {
  let shippedConfig = null;
  try {
    // Anchored to this script, not the document: on a static host with SPA
    // fallback (GitHub Pages) the app can boot from a deep URL, where a
    // document-relative "./config.json" would resolve to the wrong folder.
    shippedConfig = await fetchJson(
      new URL("./config.json", import.meta.url).href,
    );
  } catch (e) {
    warn("no shipped config.json:", e.message);
  }
  rememberAssets(shippedConfig, SHIPPED_BASE);

  const installed = readInstalled();
  const activeHash = installed
    ? installed.hash
    : shippedConfig && shippedConfig.hash;

  let updated = false;
  try {
    updated = await checkAndUpdate(shippedConfig, activeHash);
  } catch (e) {
    warn("update check failed:", e.message);
  }

  if (!updated) {
    try {
      await runInstalledOrShipped();
    } catch (e) {
      // Last resort: an installed bundle may be corrupt — clear it and ship.
      warn("could not run active bundle, falling back to shipped:", e.message);
      writeInstalled(null);
      await import(SHIPPED_BUNDLE);
    }
  }
})();
