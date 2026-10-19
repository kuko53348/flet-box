/**
 * @file Maps.js
 * @description
 * Interactive slippy map — Web Mercator projection, raster tile grid, pan, zoom,
 * markers and polylines, all implemented in this file.
 *
 * There is no map SDK on purpose. A Google/Mapbox dependency would need an API
 * key, a CDN and network access at import time, and `flet-box check-api` could
 * not verify any of it. Here a tile is a plain `<img>`, so any server that
 * answers the `{z}/{x}/{y}` scheme works; the default is OpenStreetMap, and its
 * attribution renders by default because their usage policy requires it. Pass
 * `tileUrl` + `attribution` for another provider.
 *
 * Every layer is appended with `appendChild`, never through `child`/`children`:
 * the factory re-creates those on any update that re-passes them, which would
 * throw away the tile pool on every pan-driven `update()`.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";
import { composeUpdate } from "../utils/composeUpdate.js";
import { isReactive, reactiveKeyOf, resolveReactive } from "../widget-factory/reactiveValue.js";
import { registerWidget } from "../tools/useState.js";

// ---------------------------------------------------------------------------
// Projection constants and pure helpers (no DOM, no side effects)
// ---------------------------------------------------------------------------

/** Edge of one raster tile in pixels — fixed by the XYZ tiling scheme. */
const TILE_SIZE = 256;

/** Web Mercator is undefined at the poles; this is the usual clamp (~85.0511°). */
const MAX_LATITUDE = 85.0511287798;

const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION = "© OpenStreetMap contributors";
const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";

/**
 * How far the pointer has to leave the point it went down on before the press
 * becomes a pan. Measuring distance from the origin — not the length of the
 * path walked — is what keeps a shaky click a click: a finger or a trackpad
 * trembles a pixel or two per event, which adds up past any total a press can
 * honestly make, and a gesture promoted to a pan takes the `click` with it.
 */
const PAN_START_SLOP = 4;

/**
 * The teardrop is a 20 px square with `border-radius: 50% 50% 50% 0` turned
 * -45°: its one sharp corner — the point that has to sit on the coordinate —
 * ends up half a side right and `side/2 · (1 + √2)` down from the box. Every
 * offset that positions a pin is derived from these two numbers, so the drop
 * cannot drift off its own location again.
 */
const PIN_WIDTH = 20;
const PIN_TIP_X = PIN_WIDTH / 2;
const PIN_TIP_Y = PIN_WIDTH / 2 + (PIN_WIDTH / 2) * Math.SQRT2;

/** Tiles kept around the viewport so a small pan does not flash empty grid. */
const TILE_BUFFER = 1;

const KEY_PAN_STEP = 64;

/** Wheel deltas smaller than this are noise (a trackpad tick, a nudge). */
const WHEEL_THRESHOLD = 40;

/** One wheel zoom per this many ms, so a flick does not jump ten levels. */
const WHEEL_COOLDOWN = 120;

/** `onMoveEnd` waits for the view to stop changing for this long. */
const SETTLE_DELAY = 140;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** Width of the whole world in pixels at zoom `z`. */
const worldSizePx = (z) => TILE_SIZE * 2 ** z;

/** Longitude → world X (px) at zoom `z`. */
const lngToWorldX = (lng, z) => ((lng + 180) / 360) * worldSizePx(z);

/** Latitude → world Y (px) at zoom `z` (Mercator, clamped to ±85.0511°). */
const latToWorldY = (lat, z) => {
  const sin = Math.sin(clamp(lat, -MAX_LATITUDE, MAX_LATITUDE) * (Math.PI / 180));
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * worldSizePx(z);
};

const worldXToLng = (x, z) => (x / worldSizePx(z)) * 360 - 180;

const worldYToLat = (y, z) => {
  const n = Math.PI * (1 - (2 * y) / worldSizePx(z));
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

/**
 * Keep a longitude inside [-180, 180) so `getCenter()` never reports 380°.
 *
 * The in-range case returns the value untouched: the modulo round trip is not
 * exact in binary floating point, so `setCenter([48.8566, 2.3522])` would
 * otherwise report `2.352200000000039` back — same point, broken equality.
 */
const wrapLng = (lng) =>
  lng >= -180 && lng < 180 ? lng : ((((lng + 180) % 360) + 360) % 360) - 180;

/**
 * Accepts every position shape the API documents and returns `{lat, lng}`.
 * `[lat, lng]`, `{lat, lng}` and `{latitude, longitude}` mean the same point.
 *
 * @param {*} value
 * @returns {{lat: number, lng: number}|null} Null when nothing usable was given.
 */
const normalizePosition = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [lat, lng] = value;
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return { lat: clamp(lat, -MAX_LATITUDE, MAX_LATITUDE), lng };
  }
  if (typeof value !== "object") return null;
  const lat = value.lat ?? value.latitude;
  const lng = value.lng ?? value.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return { lat: clamp(lat, -MAX_LATITUDE, MAX_LATITUDE), lng };
};

/** A bare position (array or `{lat, lng}`) instead of a `{position, …}` record. */
const isBarePosition = (value) => {
  if (Array.isArray(value)) return true;
  if (!value || typeof value !== "object") return false;
  return value.lat !== undefined || value.latitude !== undefined;
};

/**
 * A marker is either a bare position or
 * `{position, label, color, id, rotation, data}`.
 *
 * @param {*} raw
 * @param {string} fallbackColor Colour for markers that do not set their own.
 * @param {function(): string} nextId Supplies ids to unlabelled markers.
 * @returns {Object|null}
 */
const normalizeMarker = (raw, fallbackColor, nextId) => {
  const bare = isBarePosition(raw);
  const position = normalizePosition(bare ? raw : raw && raw.position);
  if (!position) return null;
  const base = bare ? {} : raw;
  const ownColor = base.color || base.markerColor;
  return {
    id: base.id !== undefined && base.id !== null ? String(base.id) : nextId(),
    position,
    label: typeof base.label === "string" ? base.label : "",
    color: ownColor || fallbackColor,
    // Without this flag a later `markerColor` update would recolour pins that
    // asked for a colour of their own.
    hasOwnColor: Boolean(ownColor),
    // Degrees clockwise from north, the compass convention a GPS fix reports.
    // Kept as given: normalising 390° to 30° here would make `getMarkers()`
    // disagree with the app on every frame of a turning vehicle.
    rotation: typeof base.rotation === "number" && Number.isFinite(base.rotation) ? base.rotation : 0,
    data: base.data,
  };
};

/** Stroke width for a line that does not ask for one. */
const DEFAULT_LINE_WIDTH = 4;

/**
 * A line is either a bare list of positions or
 * `{points, color, width, opacity, dashed, id}`.
 *
 * Two usable points is the minimum. A one-point line is dropped rather than
 * painted as a dot: a route that silently turns into a speck is harder to
 * debug than a call that returns `null`.
 *
 * @param {*} raw
 * @param {string} fallbackColor Stroke for lines that do not set their own.
 * @param {function(): string} nextId Supplies ids to unlabelled lines.
 * @returns {Object|null}
 */
const normalizeLine = (raw, fallbackColor, nextId) => {
  const bare = Array.isArray(raw);
  const base = bare ? {} : raw;
  const source = bare ? raw : base && (base.points ?? base.positions);
  const points = (Array.isArray(source) ? source : [])
    .map((point) => normalizePosition(point))
    .filter(Boolean);
  if (points.length < 2) return null;
  const ownColor = base.color || base.strokeColor;
  return {
    id: base.id !== undefined && base.id !== null ? String(base.id) : nextId(),
    points,
    color: ownColor || fallbackColor,
    // Without this flag a later `polylineColor` update would recolour lines
    // that asked for a stroke of their own.
    hasOwnColor: Boolean(ownColor),
    width: typeof base.width === "number" && base.width > 0 ? base.width : DEFAULT_LINE_WIDTH,
    opacity: typeof base.opacity === "number" ? clamp(base.opacity, 0, 1) : 1,
    dashed: Boolean(base.dashed),
  };
};

/**
 * Bounds accept `[[south, west], [north, east]]`, `{south, west, north, east}`
 * or a list of positions.
 *
 * @param {*} value
 * @returns {{south:number, west:number, north:number, east:number}|null}
 */
const normalizeBounds = (value) => {
  if (!value || typeof value !== "object") return null;
  if (!Array.isArray(value)) {
    const south = value.south ?? value.minLat;
    const north = value.north ?? value.maxLat;
    const west = value.west ?? value.minLng;
    const east = value.east ?? value.maxLng;
    if ([south, north, west, east].some((n) => typeof n !== "number")) return null;
    return { south, west, north, east };
  }
  const points = value.map((entry) => normalizePosition(entry)).filter(Boolean);
  if (points.length === 0) return null;
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  return {
    south: Math.min(...lats),
    north: Math.max(...lats),
    west: Math.min(...lngs),
    east: Math.max(...lngs),
  };
};

/** Some providers shard their tiles over `{s}`; fill it only when asked. */
const SUBDOMAINS = "abc";

/**
 * Expand an XYZ tile template.
 * @param {string} template
 * @param {number} z
 * @param {number} x already wrapped into [0, 2^z)
 * @param {number} y
 * @returns {string}
 */
const buildTileUrl = (template, z, x, y) =>
  template
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y))
    .replace("{s}", SUBDOMAINS[(x + y) % SUBDOMAINS.length]);

/** Write a batch of declarations onto a raw element, bypassing the factory. */
const paint = (el, text) => {
  el.style.cssText = text;
  return el;
};

/**
 * Props owned by the Maps closure. They are routed to `applyWidgetProps` and must
 * never reach the factory: `center`/`markers` would be written as invalid CSS and
 * `onMapClick` would be sliced into a `mapclick` listener that never fires.
 */
const MAPS_PROPS = [
  "center", "zoom", "minZoom", "maxZoom", "markers", "markerColor",
  "polylines", "polylineColor",
  "tileUrl", "attribution", "showAttribution",
  "interactive", "scrollZoom", "doubleClickZoom", "showZoomControl",
  "showUserLocation", "followUser",
  "onMapClick", "onMarkerClick", "onMoveEnd", "onUserUpdate",
];

// ---------------------------------------------------------------------------
// Widget
// ---------------------------------------------------------------------------

/**
 * Creates a Maps widget: a pannable, zoomable raster map with markers.
 *
 * @param {Object} [props]
 * @param {Array|Object} [props.center] - View centre, `[lat, lng]` or `{lat, lng}`.
 * @param {number} [props.zoom=2] - Initial integer zoom level.
 * @param {number} [props.minZoom=0] - Lowest zoom the user can reach.
 * @param {number} [props.maxZoom=19] - Highest zoom the user can reach.
 * @param {Array} [props.markers=[]] - Positions, or `{position, label, color, id, data}`.
 * @param {string} [props.markerColor] - Colour of markers without their own one.
 * @param {Array} [props.polylines=[]] - Position lists, or `{points, color, width, opacity, dashed, id}`.
 * @param {string} [props.polylineColor] - Stroke for lines without their own one.
 * @param {string} [props.tileUrl] - `{z}/{x}/{y}` tile template.
 * @param {string} [props.attribution] - Credit line; most providers require it.
 * @param {boolean} [props.showAttribution=true] - Render the credit line.
 * @param {boolean} [props.showZoomControl=true] - Render the ± buttons.
 * @param {boolean} [props.interactive=true] - Allow pan, zoom and keyboard.
 * @param {boolean} [props.scrollZoom=true] - Allow wheel zoom.
 * @param {boolean} [props.doubleClickZoom=true] - Allow double-click zoom.
 * @param {boolean} [props.showUserLocation=false] - Draw the browser position.
 * @param {boolean} [props.followUser=false] - Keep the view centred on it.
 * @param {function} [props.onMapClick] - `(point, event)` on a stationary click.
 * @param {function} [props.onMarkerClick] - `(marker, event)` on a pin.
 * @param {function} [props.onMoveEnd] - `(state)` once the view settles.
 * @param {function} [props.onUserUpdate] - `(fix)` on each watched position.
 * @returns {HTMLElement} The map element, extended with the imperative map API.
 */
export const Maps = (inputProps = {}) => {
  // The factory never receives the owned keys, so it can neither resolve a
  // `useState` value for them (a live reactive is a function, and
  // `normalizePosition` would reject it) nor subscribe the widget to the key.
  // Both happen here instead: read the values once, keep the keys, bind later.
  const boundKeys = new Map();
  const props = { ...inputProps };
  for (const key of MAPS_PROPS) {
    const value = inputProps[key];
    if (!isReactive(value)) continue;
    props[key] = resolveReactive(value);
    const stateKey = reactiveKeyOf(value);
    if (stateKey) boundKeys.set(key, stateKey);
  }

  const {
    center: centerProp = [20, 0],
    zoom: zoomProp = 2,
    minZoom = 0,
    maxZoom = 19,
    markers: markersProp = [],
    markerColor = colors.primary,
    polylines: polylinesProp = [],
    polylineColor = colors.primary,
    tileUrl = DEFAULT_TILE_URL,
    attribution = DEFAULT_ATTRIBUTION,
    showAttribution = true,
    showZoomControl = true,
    interactive = true,
    scrollZoom = true,
    doubleClickZoom = true,
    showUserLocation = false,
    followUser = false,
    onMapClick,
    onMarkerClick,
    onMoveEnd,
    onUserUpdate,
    ...rest
  } = props;

  // -------------------------------------------------------------------------
  // 1. Closure state (private, mutable)
  // -------------------------------------------------------------------------

  let center = normalizePosition(centerProp) || { lat: 0, lng: 0 };
  let lowerZoom = Math.max(0, Math.floor(minZoom));
  let upperZoom = Math.max(lowerZoom, Math.floor(maxZoom));
  let zoom = clamp(Math.round(zoomProp), lowerZoom, upperZoom);
  let markers = [];
  let lines = [];
  let tileTemplate = tileUrl;
  let pinColor = markerColor;
  let lineColor = polylineColor;
  let credit = attribution;
  let showsCredit = showAttribution;
  let letsPan = interactive;
  let wheelZooms = scrollZoom;
  let dblClickZooms = doubleClickZoom;
  let showsUser = showUserLocation;
  let followsUser = followUser;
  let clickHandler = onMapClick;
  let pinClickHandler = onMarkerClick;
  let moveEndHandler = onMoveEnd;
  let userUpdateHandler = onUserUpdate;

  let idSeq = 0;
  const nextId = () => `m${++idSeq}`;
  // A separate counter: a polyline and a pin must never share an id, since the
  // two layers are removed from independently.
  let lineIdSeq = 0;
  const nextLineId = () => `l${++lineIdSeq}`;

  /** @type {Map<string, {el: HTMLImageElement, settled: boolean, failed: boolean}>} */
  const tiles = new Map();
  /** @type {Map<string, HTMLElement>} */
  const pinEls = new Map();

  let viewport = { width: 0, height: 0 };
  let frame = 0;
  let settleTimer = 0;
  let observer = null;
  let watcherId = null;
  let userPosition = null;
  // "watch" while the background watcher owns the dot, "app" once something
  // called setUserPosition()/locate() explicitly.
  let userPositionOwner = null;
  let running = false;
  let disposed = false;
  let drag = null;
  let wheelAccum = 0;
  let wheelLockUntil = 0;

  // -------------------------------------------------------------------------
  // 2. One factory root + the raw layers it never manages
  // -------------------------------------------------------------------------

  const container = WidgetFactory({
    widgetName: "Maps",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: 400,
    backgroundColor: colors.surface,
    cursor: letsPan ? "grab" : "default",
    ...rest,
  });

  container.tabIndex = 0;
  container.setAttribute("role", "application");
  container.setAttribute(
    "aria-label",
    "Interactive map. Arrow keys pan, plus and minus zoom.",
  );

  // `pointer-events: none` on the tile layer: a tile that swallowed the pointer
  // would break panning the moment the cursor crossed one.
  const tileLayer = paint(
    document.createElement("div"),
    "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;",
  );
  const lineCanvas = document.createElement("canvas");
  paint(
    lineCanvas,
    "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;",
  );
  const pinLayer = paint(
    document.createElement("div"),
    "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2;",
  );
  const userDot = paint(
    document.createElement("div"),
    "position:absolute;left:0;top:0;width:14px;height:14px;border-radius:50%;display:none;" +
      "background:" + colors.primary + ";border:2px solid #fff;" +
      "box-shadow:0 0 0 4px rgba(99,102,241,0.28);z-index:3;pointer-events:none;",
  );
  const notice = paint(
    document.createElement("div"),
    "position:absolute;left:8px;top:8px;max-width:calc(100% - 16px);padding:8px 12px;" +
      "border-radius:8px;background:rgba(15,23,42,0.86);color:#fff;font-size:12px;" +
      "line-height:1.4;display:none;z-index:5;pointer-events:none;",
  );
  notice.textContent =
    "Map tiles could not be loaded. Check the connection, the tile server, or pass another tileUrl.";

  const zoomControl = paint(
    document.createElement("div"),
    "position:absolute;right:8px;top:8px;display:" +
      (showZoomControl ? "flex" : "none") +
      ";flex-direction:column;gap:8px;z-index:4;",
  );
  const makeZoomButton = (glyph, label, action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = glyph;
    button.setAttribute("aria-label", label);
    paint(
      button,
      "width:32px;height:32px;padding:0;border-radius:8px;border:1px solid " +
        colors.border + ";background:" + colors.card + ";color:" + colors.text +
        ";font-size:18px;line-height:1;cursor:pointer;display:flex;" +
        "align-items:center;justify-content:center;",
    );
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!disposed) action();
    });
    return button;
  };
  zoomControl.appendChild(makeZoomButton("+", "Zoom in", () => zoomAt(zoom + 1)));
  zoomControl.appendChild(makeZoomButton("−", "Zoom out", () => zoomAt(zoom - 1)));

  // Sits over the tiles, not over the app surface, so its ink is fixed rather
  // than `colors.text`: in the dark theme that token is near-white and the
  // credit line vanished into its own light chip.
  const creditBox = paint(
    document.createElement("div"),
    "position:absolute;right:0;bottom:0;padding:4px 8px;border-radius:8px 0 0 0;" +
      "background:rgba(15,23,42,0.72);color:#fff;" +
      ";font-size:12px;z-index:4;",
  );

  container.appendChild(tileLayer);
  // Same z-index as the tiles, so DOM order decides: this paints over the
  // basemap and under the pins. Adding a layer never renumbers the existing ones.
  container.appendChild(lineCanvas);
  container.appendChild(pinLayer);
  container.appendChild(userDot);
  container.appendChild(notice);
  container.appendChild(zoomControl);
  container.appendChild(creditBox);

  const rebuildCredit = () => {
    creditBox.textContent = "";
    creditBox.style.display = showsCredit && credit ? "block" : "none";
    if (!showsCredit || !credit) return;
    creditBox.appendChild(document.createTextNode(String(credit)));
    // OSM's policy asks for a link to the copyright page, not just a name.
    if (tileTemplate.includes("openstreetmap.org")) {
      creditBox.appendChild(document.createTextNode(" · "));
      const link = document.createElement("a");
      link.href = OSM_COPYRIGHT_URL;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = "copyright";
      link.style.color = colors.primary;
      creditBox.appendChild(link);
    }
  };

  // -------------------------------------------------------------------------
  // 3. Geometry — world pixels, container-relative screen pixels
  // -------------------------------------------------------------------------

  const measure = () => {
    const rect = container.getBoundingClientRect();
    viewport = {
      width: Math.max(1, Math.round(rect.width)),
      height: Math.max(1, Math.round(rect.height)),
    };
    return rect;
  };

  /** World pixel of the viewport's top-left corner. */
  const originX = () => lngToWorldX(center.lng, zoom) - viewport.width / 2;
  const originY = () => latToWorldY(center.lat, zoom) - viewport.height / 2;

  /** Container-relative screen point → geographic point at the current zoom. */
  const screenToGeo = (sx, sy) => ({
    lat: worldYToLat(originY() + sy, zoom),
    lng: worldXToLng(originX() + sx, zoom),
  });

  /** Geographic point → container-relative screen point. */
  const geoToScreen = (lat, lng) => ({
    x: lngToWorldX(lng, zoom) - originX(),
    y: latToWorldY(lat, zoom) - originY(),
  });

  /** Client (page) coordinates → container-relative ones. */
  const localFromClient = (clientX, clientY) => {
    const rect = container.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const viewState = () => ({
    center: { lat: center.lat, lng: wrapLng(center.lng) },
    zoom,
    bounds: {
      north: screenToGeo(0, 0).lat,
      south: screenToGeo(0, viewport.height).lat,
      west: screenToGeo(0, 0).lng,
      east: screenToGeo(viewport.width, 0).lng,
    },
  });

  // -------------------------------------------------------------------------
  // 4. Tiles
  // -------------------------------------------------------------------------

  const dropTile = (key) => {
    const record = tiles.get(key);
    if (!record) return;
    record.el.remove();
    tiles.delete(key);
  };

  const createTile = (key, x, y) => {
    const image = document.createElement("img");
    image.alt = "";
    image.decoding = "async";
    paint(
      image,
      `position:absolute;left:0;top:0;width:${TILE_SIZE}px;height:${TILE_SIZE}px;` +
        "max-width:none;opacity:0;transition:opacity 150ms linear;will-change:transform;" +
        "user-select:none;-webkit-user-drag:none;",
    );
    const record = { el: image, settled: false, failed: false };
    image.addEventListener("load", () => {
      record.settled = true;
      image.style.opacity = "1";
      // A tile landing late can complete the layer, which is what releases the
      // tiles held from the previous zoom.
      scheduleRender();
    });
    image.addEventListener("error", () => {
      record.settled = true;
      record.failed = true;
      scheduleRender();
    });
    image.src = buildTileUrl(tileTemplate, zoom, x, y);
    tileLayer.appendChild(image);
    tiles.set(key, record);
    return record;
  };

  const clearTiles = () => {
    for (const key of Array.from(tiles.keys())) dropTile(key);
    notice.style.display = "none";
  };

  const renderTiles = () => {
    if (viewport.width < 2 || viewport.height < 2) return;
    const ox = originX();
    const oy = originY();
    const columns = 2 ** zoom;
    const first = Math.floor(ox / TILE_SIZE) - TILE_BUFFER;
    const last = Math.floor((ox + viewport.width) / TILE_SIZE) + TILE_BUFFER;
    // Rows never wrap: outside 0..2^z-1 there is no world, only the surface colour.
    const firstRow = clamp(Math.floor(oy / TILE_SIZE) - TILE_BUFFER, 0, columns - 1);
    const lastRow = clamp(Math.floor((oy + viewport.height) / TILE_SIZE) + TILE_BUFFER, 0, columns - 1);

    const wanted = new Set();
    let needed = 0;
    let settledCount = 0;
    let failedCount = 0;

    for (let y = firstRow; y <= lastRow; y++) {
      for (let x = first; x <= last; x++) {
        // `x` may fall outside the world when the map is zoomed out and panned
        // sideways: the URL wraps, the placement does not, so the copies line up
        // side by side instead of stacking on top of each other.
        const key = `${zoom}/${x}/${y}`;
        wanted.add(key);
        let record = tiles.get(key);
        if (!record) record = createTile(key, ((x % columns) + columns) % columns, y);
        record.el.style.transform = `translate(${x * TILE_SIZE - ox}px, ${y * TILE_SIZE - oy}px)`;
        needed++;
        if (record.settled) settledCount++;
        if (record.failed) failedCount++;
      }
    }

    const layerIsUp = needed > 0 && settledCount === needed;
    for (const key of Array.from(tiles.keys())) {
      if (wanted.has(key)) continue;
      // Hold the previous zoom until this one is on screen, then drop it.
      if (Number(key.slice(0, key.indexOf("/"))) === zoom || layerIsUp) dropTile(key);
    }

    notice.style.display = needed > 0 && failedCount === needed ? "block" : "none";
  };

  // -------------------------------------------------------------------------
  // 5. Markers
  // -------------------------------------------------------------------------

  const buildCaption = (label) => {
    const el = paint(
      document.createElement("span"),
      `position:absolute;left:${PIN_TIP_X}px;top:${Math.ceil(PIN_TIP_Y) + 2}px;` +
        "transform:translateX(-50%);" +
        "padding:2px 6px;border-radius:4px;background:rgba(15,23,42,0.82);" +
        "color:#fff;font-size:12px;line-height:1.3;white-space:nowrap;",
    );
    el.textContent = label;
    return el;
  };

  const buildPin = (marker) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", marker.label || "Map marker");
    if (marker.label) button.title = marker.label;
    // The box is exactly the drop, never the text under it: a button that sizes
    // itself to its label centres the teardrop on the *label*, which slides it
    // tens of pixels away from the point it marks — and steals every map click
    // that lands on the caption.
    paint(
      button,
      `position:absolute;left:0;top:0;width:${PIN_WIDTH}px;height:${Math.ceil(PIN_TIP_Y)}px;` +
        "padding:0;border:none;background:transparent;cursor:pointer;" +
        "pointer-events:auto;will-change:transform;",
    );

    // Teardrop: `border-radius` leaves the bottom-left corner sharp, and
    // rotate(-45deg) swings that corner to the bottom centre — the anchor point.
    // The head carries the marker's own bearing, and its origin is the tip: any
    // other origin would swing the drop off the point it marks as it turns.
    const head = paint(
      document.createElement("span"),
      `position:relative;display:block;width:${PIN_WIDTH}px;height:${Math.ceil(PIN_TIP_Y)}px;` +
        `transform-origin:${PIN_TIP_X}px ${PIN_TIP_Y}px;`,
    );
    const pin = paint(
      document.createElement("span"),
      `display:block;width:${PIN_WIDTH}px;height:${PIN_WIDTH}px;box-sizing:border-box;` +
        "border-radius:50% 50% 50% 0;" +
        `background:${marker.color};border:2px solid #fff;` +
        "box-shadow:0 1px 4px rgba(0,0,0,0.4);transform:rotate(-45deg);",
    );
    const dot = paint(
      document.createElement("span"),
      `position:absolute;left:${PIN_TIP_X - 2}px;top:${PIN_TIP_X - 2}px;width:4px;height:4px;` +
        "border-radius:50%;background:rgba(255,255,255,0.92);",
    );
    head.appendChild(pin);
    head.appendChild(dot);
    button.appendChild(head);
    button._pin = pin;
    button._head = head;

    if (marker.label) {
      // Absolute and centred on the tip, so the caption can be any length without
      // moving the drop or widening the hit box.
      button._caption = buildCaption(marker.label);
      button.appendChild(button._caption);
    }

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (disposed || typeof pinClickHandler !== "function") return;
      // The pooled node outlives every update of its marker, so report the one
      // it is showing now rather than the one it was built from.
      pinClickHandler(button._marker, event);
    });
    return button;
  };

  const renderPins = () => {
    const live = new Set();
    for (const marker of markers) {
      const { x, y } = geoToScreen(marker.position.lat, marker.position.lng);
      const id = marker.id;
      const el = pinEls.get(id);
      const offscreen =
        x < -80 || y < -120 || x > viewport.width + 80 || y > viewport.height + 120;
      if (offscreen) {
        if (el) {
          el.remove();
          pinEls.delete(id);
        }
        continue;
      }
      live.add(id);
      let node = el;
      if (!node) {
        node = buildPin(marker);
        pinEls.set(id, node);
        pinLayer.appendChild(node);
      }
      // A pooled node is reused across frames, so only touch what changed.
      node._marker = marker;
      if (node._color !== marker.color) {
        node._pin.style.background = marker.color;
        node._color = marker.color;
      }
      if (node._rotation !== marker.rotation) {
        node._head.style.transform = marker.rotation ? `rotate(${marker.rotation}deg)` : "";
        node._rotation = marker.rotation;
      }
      // A moving pin usually changes its caption too — "Coche · 90°" is not the
      // label it was built with. The node is pooled, so the text has to follow.
      if (node._label !== marker.label) {
        node._label = marker.label;
        node.setAttribute("aria-label", marker.label || "Map marker");
        node.title = marker.label || "";
        if (!marker.label) {
          if (node._caption) {
            node._caption.remove();
            node._caption = null;
          }
        } else if (node._caption) {
          node._caption.textContent = marker.label;
        } else {
          node._caption = buildCaption(marker.label);
          node.appendChild(node._caption);
        }
      }
      // Subtracting the tip's offset — not half the box — puts the point of the
      // teardrop on the coordinate, whatever the label next to it measures.
      node.style.transform = `translate(${x - PIN_TIP_X}px, ${y - PIN_TIP_Y}px)`;
    }
    for (const [id, el] of Array.from(pinEls)) {
      if (live.has(id)) continue;
      el.remove();
      pinEls.delete(id);
    }
  };

  const renderLines = () => {
    const ctx = lineCanvas.getContext("2d");
    if (!ctx) return;
    // A canvas is drawn in device pixels, so a CSS-sized element left at its
    // default backing store strokes every line at half the intended width on a
    // Retina screen. Reset the transform each frame: the ratio changes when a
    // window moves between displays.
    const dpr = Math.max(1, Math.round((window.devicePixelRatio || 1) * 100) / 100);
    const pw = Math.round(viewport.width * dpr);
    const ph = Math.round(viewport.height * dpr);
    if (lineCanvas.width !== pw) lineCanvas.width = pw;
    if (lineCanvas.height !== ph) lineCanvas.height = ph;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    if (viewport.width < 2 || viewport.height < 2 || lines.length === 0) return;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const visible = viewState().bounds;
    for (const line of lines) {
      // Cull on the geographic box: a walk route is thousands of coordinates,
      // and the ones two cities away cost the same frame time as the visible ones.
      let minLat = line.points[0].lat, maxLat = minLat;
      let minLng = line.points[0].lng, maxLng = minLng;
      for (const point of line.points) {
        if (point.lat < minLat) minLat = point.lat;
        else if (point.lat > maxLat) maxLat = point.lat;
        if (point.lng < minLng) minLng = point.lng;
        else if (point.lng > maxLng) maxLng = point.lng;
      }
      if (
        maxLat < visible.south || minLat > visible.north ||
        maxLng < visible.west || minLng > visible.east
      ) continue;

      ctx.beginPath();
      for (let i = 0; i < line.points.length; i++) {
        const { x, y } = geoToScreen(line.points[i].lat, line.points[i].lng);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.globalAlpha = line.opacity;
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.setLineDash(line.dashed ? [line.width * 3, line.width * 2] : []);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const renderUserDot = () => {
    // Either flag needs the position on screen: `showUserLocation` draws the dot,
    // `followUser` is pointless without it.
    if (!(showsUser || followsUser) || !userPosition) {
      userDot.style.display = "none";
      return;
    }
    const { x, y } = geoToScreen(userPosition.lat, userPosition.lng);
    userDot.style.display = "block";
    userDot.style.transform = `translate(${x - 7}px, ${y - 7}px)`;
  };

  // -------------------------------------------------------------------------
  // 6. Render loop
  // -------------------------------------------------------------------------

  const paintFrame = () => {
    frame = 0;
    if (disposed || !running) return;
    measure();
    renderTiles();
    renderLines();
    renderPins();
    renderUserDot();
  };

  const scheduleRender = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(paintFrame);
  };

  /** Every view change funnels through here: repaint now, report once it settles. */
  const invalidate = () => {
    scheduleRender();
    if (typeof moveEndHandler !== "function") return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (!disposed) moveEndHandler(viewState());
    }, SETTLE_DELAY);
  };

  // -------------------------------------------------------------------------
  // 7. View mutations
  // -------------------------------------------------------------------------

  /**
   * Change the zoom, keeping the geographic point under `(sx, sy)` — when given —
   * fixed on screen. That is what makes wheel zoom follow the cursor.
   * @param {number} next
   * @param {{x:number, y:number}} [anchor] container-relative pixels
   * @returns {boolean} whether the zoom actually changed
   */
  const applyZoom = (next, anchor) => {
    if (typeof next !== "number" || !Number.isFinite(next)) return false;
    const target = clamp(Math.round(next), lowerZoom, upperZoom);
    if (target === zoom) return false;
    const geo = anchor ? screenToGeo(anchor.x, anchor.y) : null;
    zoom = target;
    if (geo) {
      center = {
        lat: clamp(
          worldYToLat(latToWorldY(geo.lat, target) - (anchor.y - viewport.height / 2), target),
          -MAX_LATITUDE,
          MAX_LATITUDE,
        ),
        lng: wrapLng(
          worldXToLng(lngToWorldX(geo.lng, target) - (anchor.x - viewport.width / 2), target),
        ),
      };
    }
    return true;
  };

  const zoomAt = (next, clientPoint) => {
    let anchor;
    if (clientPoint) {
      measure();
      const local = localFromClient(clientPoint.x, clientPoint.y);
      anchor = { x: local.x, y: local.y };
    }
    if (applyZoom(next, anchor)) invalidate();
    return container;
  };

  const panByPixels = (dx, dy) => {
    const next = {
      lng: worldXToLng(lngToWorldX(center.lng, zoom) - dx, zoom),
      lat: worldYToLat(latToWorldY(center.lat, zoom) - dy, zoom),
    };
    center = { lat: clamp(next.lat, -MAX_LATITUDE, MAX_LATITUDE), lng: wrapLng(next.lng) };
    invalidate();
  };

  const goTo = (position, nextZoom) => {
    const point = normalizePosition(position);
    if (point) center = point;
    if (nextZoom !== undefined) applyZoom(nextZoom);
    invalidate();
    return container;
  };

  // -------------------------------------------------------------------------
  // 8. Interaction
  // -------------------------------------------------------------------------

  /**
   * Did this pointer land on the map itself?
   *
   * Every layer that only *shows* something — tiles, the line canvas, the user
   * dot, the notice — is `pointer-events: none`, so the container is the target
   * of any press on the map surface. Anything else is the widget's own chrome
   * (the ± buttons, the credit link, a pin) and has its own behaviour: the
   * bottom-right of the view is not the place the user meant when they pressed
   * `+`, and reporting it anyway moves the app's pin there on every zoom step.
   * @param {Event} event
   * @returns {boolean}
   */
  const isMapSurface = (event) => event.target === container;

  container.addEventListener("pointerdown", (event) => {
    if (!letsPan || disposed || event.button !== 0) return;
    // `x`/`y` stay at the pointerdown point until the slop breaks, so the pan
    // measures distance from the press and not the length of the path walked.
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panning: false,
      captured: false,
    };
  });

  container.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    // Until the press is a pan, the gesture is a click in progress: the view
    // stays put and the anchor keeps the pointerdown point, so the first real
    // drag step moves the map by the whole displacement and stays glued to it.
    if (!drag.panning) {
      const offX = event.clientX - drag.x;
      const offY = event.clientY - drag.y;
      if (Math.abs(offX) <= PAN_START_SLOP && Math.abs(offY) <= PAN_START_SLOP) return;
      drag.panning = true;
      drag.captured = true;
      container.style.cursor = "grabbing";
      // Capturing re-targets every later pointer *and* mouse event to the map,
      // so a pin under this press stops reporting clicks — which is exactly what
      // a pan wants, and the reason the capture waits for the slop to break.
      try {
        container.setPointerCapture(event.pointerId);
      } catch (_) {}
    }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (dx || dy) panByPixels(dx, dy);
  });

  const endDrag = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const gesture = drag;
    drag = null;
    container.style.cursor = letsPan ? "grab" : "default";
    if (gesture.captured) {
      try {
        container.releasePointerCapture(event.pointerId);
      } catch (_) {}
    }
    if (gesture.panning) return;
    if (!clickHandler || !isMapSurface(event)) return;
    measure();
    const local = localFromClient(event.clientX, event.clientY);
    const geo = screenToGeo(local.x, local.y);
    clickHandler({ lat: geo.lat, lng: wrapLng(geo.lng), zoom }, event);
  };

  container.addEventListener("pointerup", endDrag);
  container.addEventListener("pointercancel", (event) => {
    if (drag && event.pointerId === drag.id) {
      drag = null;
      container.style.cursor = letsPan ? "grab" : "default";
    }
  });

  container.addEventListener(
    "wheel",
    (event) => {
      if (!letsPan || !wheelZooms) return;
      // Not scrolling the page behind the map is the whole point of wheel zoom.
      event.preventDefault();
      const now = Date.now();
      if (now < wheelLockUntil) return;
      wheelAccum += event.deltaY;
      if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;
      const direction = wheelAccum > 0 ? -1 : 1;
      wheelAccum = 0;
      wheelLockUntil = now + WHEEL_COOLDOWN;
      measure();
      const local = localFromClient(event.clientX, event.clientY);
      if (applyZoom(zoom + direction, local)) invalidate();
    },
    { passive: false },
  );

  container.addEventListener("dblclick", (event) => {
    if (!letsPan || !dblClickZooms || !isMapSurface(event)) return;
    event.preventDefault();
    zoomAt(zoom + (event.shiftKey ? -1 : 1), { x: event.clientX, y: event.clientY });
  });

  container.addEventListener("keydown", (event) => {
    if (!letsPan) return;
    const moves = {
      // `panByPixels(dx, dy)` moves the CONTENT like a dragged pointer would, so
      // pointing the view east means pushing it west: the signs are inverted.
      ArrowUp: () => panByPixels(0, KEY_PAN_STEP),
      ArrowDown: () => panByPixels(0, -KEY_PAN_STEP),
      ArrowLeft: () => panByPixels(KEY_PAN_STEP, 0),
      ArrowRight: () => panByPixels(-KEY_PAN_STEP, 0),
      "+": () => zoomAt(zoom + 1),
      "=": () => zoomAt(zoom + 1),
      "-": () => zoomAt(zoom - 1),
      _: () => zoomAt(zoom - 1),
    };
    const move = moves[event.key];
    if (!move) return;
    // The map owns the arrows while it has focus, otherwise the page would
    // scroll underneath and the widget would report a pan that never happened.
    event.preventDefault();
    move();
  });

  // -------------------------------------------------------------------------
  // 9. Geolocation
  // -------------------------------------------------------------------------

  const startLocation = () => {
    if (watcherId !== null || typeof navigator === "undefined" || !navigator.geolocation) return;
    watcherId = navigator.geolocation.watchPosition(
      (position) => {
        userPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        userPositionOwner = "watch";
        // Following means the view chases every fix, so the frame must be painted
        // through the view-change path, not just a repaint.
        if (followsUser) goTo(userPosition);
        else scheduleRender();
        if (typeof userUpdateHandler === "function") {
          userUpdateHandler({
            lat: userPosition.lat,
            lng: userPosition.lng,
            accuracy: typeof position.coords.accuracy === "number" ? position.coords.accuracy : null,
            // A phone gives the direction of travel for free and a fleet view is
            // meaningless without it. Devices that do not report it — and a
            // standing still car — answer null rather than a bearing to guess.
            heading:
              typeof position.coords.heading === "number" && Number.isFinite(position.coords.heading)
                ? position.coords.heading
                : null,
          });
        }
      },
      () => {
        // Denied or unavailable: the dot stays hidden, the map keeps working.
        // A position the app set on purpose outlives the watcher, which keeps
        // reporting its old failure on every retry.
        if (userPositionOwner !== "watch") return;
        userPosition = null;
        userDot.style.display = "none";
      },
      {
        // While following, a cached fix is the difference between a smooth chase
        // and a dot that lags two minutes behind; the trade is battery.
        enableHighAccuracy: followsUser,
        maximumAge: followsUser ? 0 : 60000,
        timeout: 15000,
      },
    );
  };

  const stopLocation = () => {
    if (watcherId === null || typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.clearWatch(watcherId);
    watcherId = null;
  };

  /** Either flag needs the position stream; only when both are off, release it. */
  const syncLocation = () => {
    if (showsUser || followsUser) startLocation();
    else stopLocation();
  };

  /**
   * Chase the live position (`true`) or leave the view alone (`false`). Turning
   * it on re-opens the watcher with fresh, high-accuracy fixes.
   * @param {boolean} next
   * @returns {Object} The widget, for chaining.
   */
  const setFollowUser = (next) => {
    const on = Boolean(next);
    if (on === followsUser) return container;
    followsUser = on;
    if (watcherId !== null) {
      stopLocation();
      startLocation();
    } else syncLocation();
    if (on && userPosition) goTo(userPosition);
    else scheduleRender();
    return container;
  };

  // -------------------------------------------------------------------------
  // 10. Lifecycle: the map only paints while it is in the DOM
  // -------------------------------------------------------------------------

  const start = () => {
    if (disposed || running) return;
    running = true;
    scheduleRender();
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => scheduleRender());
      observer.observe(container);
    } else if (typeof window !== "undefined") {
      window.addEventListener("resize", scheduleRender);
    }
    syncLocation();
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    clearTimeout(settleTimer);
    if (observer) observer.disconnect();
    observer = null;
    if (typeof window !== "undefined") window.removeEventListener("resize", scheduleRender);
    stopLocation();
  };

  container.onMount(start);
  container.onUnmount(dispose);

  // -------------------------------------------------------------------------
  // 11. Public surface
  // -------------------------------------------------------------------------

  markers = (Array.isArray(markersProp) ? markersProp : [])
    .map((raw) => normalizeMarker(raw, pinColor, nextId))
    .filter(Boolean);

  lines = (Array.isArray(polylinesProp) ? polylinesProp : [])
    .map((raw) => normalizeLine(raw, lineColor, nextLineId))
    .filter(Boolean);

  rebuildCredit();

  /**
   * Applies the widget-owned keys of an `update()`. Everything else went to the
   * factory, so `map.update({ opacity: .5 })` keeps working.
   * @param {Object} next
   * @returns {void}
   */
  const applyProps = (next) => {
    let viewChanged = false;
    let needsCredit = false;

    if ("center" in next) {
      const point = normalizePosition(next.center);
      // Only a different centre is a view change. An app that feeds `onMoveEnd`
      // back into the key it binds — the usual controlled-map pattern — would
      // otherwise re-invalidate on every settle tick and never stop reporting.
      const moved = point && (
        Math.abs(point.lat - center.lat) > 1e-9 ||
        Math.abs(wrapLng(point.lng - center.lng)) > 1e-9
      );
      if (moved) {
        center = point;
        viewChanged = true;
      }
    }
    if ("zoom" in next) viewChanged = applyZoom(next.zoom) || viewChanged;
    if ("minZoom" in next && typeof next.minZoom === "number") {
      lowerZoom = Math.max(0, Math.floor(next.minZoom));
      if (upperZoom < lowerZoom) upperZoom = lowerZoom;
      const fitted = clamp(zoom, lowerZoom, upperZoom);
      if (fitted !== zoom) {
        zoom = fitted;
        viewChanged = true;
      }
    }
    if ("maxZoom" in next && typeof next.maxZoom === "number") {
      upperZoom = Math.max(lowerZoom, Math.floor(next.maxZoom));
      const fitted = clamp(zoom, lowerZoom, upperZoom);
      if (fitted !== zoom) {
        zoom = fitted;
        viewChanged = true;
      }
    }
    if ("markers" in next) {
      markers = (Array.isArray(next.markers) ? next.markers : [])
        .map((raw) => normalizeMarker(raw, pinColor, nextId))
        .filter(Boolean);
    }
    if ("markerColor" in next && next.markerColor) {
      pinColor = String(next.markerColor);
      // Only the pins that never asked for a colour follow the default.
      markers = markers.map((marker) =>
        marker.hasOwnColor ? marker : Object.assign({}, marker, { color: pinColor }),
      );
    }
    if ("polylines" in next) {
      lines = (Array.isArray(next.polylines) ? next.polylines : [])
        .map((raw) => normalizeLine(raw, lineColor, nextLineId))
        .filter(Boolean);
    }
    if ("polylineColor" in next && next.polylineColor) {
      lineColor = String(next.polylineColor);
      lines = lines.map((line) =>
        line.hasOwnColor ? line : Object.assign({}, line, { color: lineColor }),
      );
    }
    if ("tileUrl" in next && next.tileUrl) {
      tileTemplate = String(next.tileUrl);
      clearTiles();
      viewChanged = true;
      needsCredit = true;
    }
    if ("attribution" in next) credit = next.attribution;
    if ("showAttribution" in next) showsCredit = Boolean(next.showAttribution);
    if ("interactive" in next) {
      letsPan = Boolean(next.interactive);
      container.style.cursor = letsPan ? "grab" : "default";
    }
    if ("scrollZoom" in next) wheelZooms = Boolean(next.scrollZoom);
    if ("doubleClickZoom" in next) dblClickZooms = Boolean(next.doubleClickZoom);
    if ("showZoomControl" in next) {
      zoomControl.style.display = next.showZoomControl ? "flex" : "none";
    }
    if ("showUserLocation" in next) {
      showsUser = Boolean(next.showUserLocation);
      syncLocation();
    }
    if ("followUser" in next) setFollowUser(next.followUser);
    if ("onMapClick" in next) clickHandler = next.onMapClick;
    if ("onMarkerClick" in next) pinClickHandler = next.onMarkerClick;
    if ("onMoveEnd" in next) moveEndHandler = next.onMoveEnd;
    if ("onUserUpdate" in next) userUpdateHandler = next.onUserUpdate;

    if (needsCredit || "attribution" in next || "showAttribution" in next) rebuildCredit();

    if (viewChanged) invalidate();
    else scheduleRender();
  };

  composeUpdate(container, MAPS_PROPS, applyProps);

  // Bind after composing: `registerWidget` pushes the current store value through
  // `update`, which must be the composed one that routes owned keys here. It also
  // releases the subscription itself on unmount, so `dispose()` stays local.
  for (const [propName, stateKey] of boundKeys) registerWidget(stateKey, container, propName);

  /** Point the map at `position` (`[lat, lng]` or `{lat, lng}`), at an optional zoom. */
  container.setCenter = (position, nextZoom) => goTo(position, nextZoom);
  container.getCenter = () => ({ lat: center.lat, lng: wrapLng(center.lng) });
  container.getZoom = () => zoom;
  container.zoomTo = (nextZoom) => zoomAt(nextZoom);
  container.panBy = (dx, dy) => {
    measure();
    panByPixels(dx, dy);
    return container;
  };
  container.getState = () => {
    measure();
    return viewState();
  };

  /**
   * Zoom and centre to fit `bounds` — `[[south, west], [north, east]]`,
   * `{south, west, north, east}` or a list of positions. Antimeridian boxes are
   * not supported: the west/east span is read as-is.
   */
  container.fitBounds = (bounds, padding = 16) => {
    const box = normalizeBounds(bounds);
    if (!box) return container;
    const rect = measure();
    const usableWidth = Math.max(1, rect.width - padding * 2);
    const usableHeight = Math.max(1, rect.height - padding * 2);
    let target = upperZoom;
    while (target > lowerZoom) {
      const w = Math.abs(lngToWorldX(box.east, target) - lngToWorldX(box.west, target));
      const h = Math.abs(latToWorldY(box.south, target) - latToWorldY(box.north, target));
      if (w <= usableWidth && h <= usableHeight) break;
      target--;
    }
    zoom = target;
    center = {
      lat: clamp((box.south + box.north) / 2, -MAX_LATITUDE, MAX_LATITUDE),
      lng: wrapLng((box.west + box.east) / 2),
    };
    invalidate();
    return container;
  };

  /** Append one marker (position or `{position, label, color}`) and repaint. */
  container.addMarker = (raw) => {
    const marker = normalizeMarker(raw, pinColor, nextId);
    if (!marker) return null;
    markers = markers.concat([marker]);
    scheduleRender();
    return marker;
  };

  /**
   * Replace the marker with the same id, or append it when that id is new.
   *
   * A vehicle reports its position and bearing many times a second, and
   * `addMarker` would stack a pin per fix: the pooled node is keyed by id, so
   * the last one wins on screen while the list grows without bound.
   * @returns {Object|null} The stored marker, or null when it had no usable position.
   */
  container.setMarker = (raw) => {
    const marker = normalizeMarker(raw, pinColor, nextId);
    if (!marker) return null;
    const at = markers.findIndex((current) => current.id === marker.id);
    if (at < 0) markers = markers.concat([marker]);
    else {
      markers = markers.slice();
      markers[at] = marker;
    }
    scheduleRender();
    return marker;
  };

  /** Remove a marker by id or by the object `addMarker` returned. */
  container.removeMarker = (idOrMarker) => {
    const id =
      idOrMarker && typeof idOrMarker === "object" ? idOrMarker.id : String(idOrMarker);
    const before = markers.length;
    markers = markers.filter((marker) => marker.id !== id);
    if (markers.length === before) return container;
    const node = pinEls.get(id);
    if (node) {
      node.remove();
      pinEls.delete(id);
    }
    scheduleRender();
    return container;
  };

  container.clearMarkers = () => {
    markers = [];
    for (const node of Array.from(pinEls.values())) node.remove();
    pinEls.clear();
    scheduleRender();
    return container;
  };

  container.getMarkers = () => markers.slice();

  /**
   * Draw a line — a list of positions or `{points, color, width, opacity, dashed, id}`.
   * @returns {Object|null} The stored line, or null when it had no usable points.
   */
  container.addPolyline = (raw) => {
    const line = normalizeLine(raw, lineColor, nextLineId);
    if (!line) return null;
    lines = lines.concat([line]);
    scheduleRender();
    return line;
  };

  /** Remove a line by id or by the object `addPolyline` returned. */
  container.removePolyline = (idOrLine) => {
    const id =
      idOrLine && typeof idOrLine === "object" ? idOrLine.id : String(idOrLine);
    const before = lines.length;
    lines = lines.filter((line) => line.id !== id);
    if (lines.length === before) return container;
    scheduleRender();
    return container;
  };

  container.clearPolylines = () => {
    lines = [];
    scheduleRender();
    return container;
  };

  container.getPolylines = () => lines.slice();

  /** @see setFollowUser */
  container.setFollowUser = (next) => setFollowUser(next);

  /**
   * Draw a position the app already holds, without asking the browser for
   * permission: a native Capacitor fix, an IP lookup or a test fixture.
   * Pass `null` to hide the dot, and `{ setCenter: false }` to only move the dot.
   * @param {{lat:number, lng:number}|number[]|null} position
   * @param {{setCenter?: boolean, zoom?: number}} [settings]
   * @returns {Object} The widget, for chaining.
   */
  container.setUserPosition = (position, settings = {}) => {
    const point = normalizePosition(position);
    userPosition = point;
    userPositionOwner = point ? "app" : null;
    if (!point || settings.setCenter === false) scheduleRender();
    else goTo(point, settings.zoom);
    return container;
  };

  /**
   * Ask the browser for the current position once and centre on it.
   * Pass `{ setCenter: false }` to only draw the dot, and `{ timeout }` /
   * `{ maximumAge }` / `{ highAccuracy: false }` to tune the underlying
   * `getCurrentPosition` call (defaults 10 s, 0 ms, high accuracy on).
   * @returns {Promise<{lat:number, lng:number}>|null} Null when geolocation is absent.
   */
  container.locate = (settings = {}) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return null;
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = { lat: position.coords.latitude, lng: position.coords.longitude };
          container.setUserPosition(point, settings);
          resolve(point);
        },
        reject,
        {
          enableHighAccuracy: settings.highAccuracy !== false,
          timeout: typeof settings.timeout === "number" ? settings.timeout : 10000,
          maximumAge: typeof settings.maximumAge === "number" ? settings.maximumAge : 0,
        },
      );
    });
  };

  /** Request a repaint, e.g. after the container was resized from outside. */
  container.render = () => {
    scheduleRender();
    return container;
  };

  return container;
};

export default Maps;
