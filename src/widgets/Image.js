/**
 * @file Image.js
 * @description Thin `<img>` wrapper that forwards all props to the factory.
 * Three props are handled here because they are not CSS the engine can apply:
 * `circular` picks a shape, and `downloadable` decides what a click does.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import {
  isReactive,
  reactiveKeyOf,
  resolveReactive,
} from "../widget-factory/reactiveValue.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { registerWidget } from "../tools/useState.js";

/**
 * The name the browser offers when saving an image with no `downloadFileName`:
 * the last path segment of the URL, with the query string and fragment removed.
 * A `data:` URL has no path — its base64 tail is not a file name — so it gets a
 * neutral one.
 *
 * @param {string} src - Value of the `src` attribute.
 * @returns {string} A file name.
 */
const nameFromSrc = (src) => {
  const raw = String(src || "");
  if (!raw || raw.startsWith("data:")) return "image";
  const tail = raw.split("?")[0].split("#")[0].split("/").pop();
  return tail || "image";
};

/**
 * Saves the image under `name`.
 *
 * The `download` attribute is only honoured for a same-origin (or CORS-served)
 * image; for anything else the click would turn into a navigation, which is why
 * the anchor opens in a tab instead of replacing the app.
 *
 * @param {HTMLImageElement} img - The rendered image.
 * @param {string} name - File name to suggest.
 */
const saveImage = (img, name) => {
  const link = document.createElement("a");
  link.href = img.src;
  link.download = name;
  link.target = "_blank";
  link.rel = "noopener";
  link.click();
};

export const Image = (props) => {
  const inputProps = props || {};
  // `fit` is now a proper style prop in translateProps (→ object-fit), so it
  // flows through the factory like any other CSS property. Only `circular`
  // needs special handling — it maps to borderRadius 50%.
  const { circular, downloadable, downloadFileName, ...rest } = inputProps;

  // Both download props are `special`: nothing routes them, so the factory
  // never sees them and cannot re-apply or re-subscribe them. They are read
  // here instead — resolved once (a live `useState` value is a *function*,
  // which is truthy, so an image bound to `false` would download without this),
  // kept in `boundKeys`, and re-applied through `composeUpdate` when a later
  // patch or store change arrives.
  const boundKeys = new Map();
  let canDownload = Boolean(resolveReactive(downloadable));
  let fileName = resolveReactive(downloadFileName);
  for (const key of ["downloadable", "downloadFileName"]) {
    const value = inputProps[key];
    if (!isReactive(value)) continue;
    const stateKey = reactiveKeyOf(value);
    if (stateKey) boundKeys.set(key, stateKey);
  }

  const img = WidgetFactory({
    tag: "img",
    widgetName: "Image",
    ...(circular ? { borderRadius: "50%" } : null),
    ...rest,
  });

  // A caller who set `cursor` themselves keeps their own value; this widget
  // only borrows the property while it is offering a save.
  const paintsCursor = rest.cursor == null;

  const offerSave = () => {
    saveImage(img, fileName ? String(fileName) : nameFromSrc(img.src));
  };

  let attached = false;
  const applyDownloadProps = () => {
    if (canDownload && !attached) {
      img.addEventListener("click", offerSave);
      attached = true;
    } else if (!canDownload && attached) {
      img.removeEventListener("click", offerSave);
      attached = false;
    }
    if (paintsCursor) img.style.cursor = canDownload ? "pointer" : "";
  };

  applyDownloadProps();

  composeUpdate(img, ["downloadable", "downloadFileName"], (next = {}) => {
    if ("downloadable" in next) canDownload = Boolean(resolveReactive(next.downloadable));
    if ("downloadFileName" in next) fileName = resolveReactive(next.downloadFileName);
    applyDownloadProps();
  });

  // After composing: `registerWidget` pushes the current store value through
  // `update`, which must be the composed one that routes these keys here. It
  // releases the subscription again on unmount.
  for (const [propName, stateKey] of boundKeys) {
    registerWidget(stateKey, img, propName);
  }

  return img;
};

export default Image;
