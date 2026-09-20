// navigations/Router.js
/**
 * Router Module — client-side routing for the flet-box framework.
 *
 * Provides a simple, push-state-based router with support for:
 * - Static routes: `/about`, `/settings/profile`
 * - Dynamic segments: `/user/:id`, `/post/:slug/comments`
 * - Wildcard / 404 routes: `*` or `/404`
 * - Query string parameters
 * - Browser history integration (pushState / popstate)
 * - Observer pattern (subscribe/notify) so layout shells like Scaffold can
 *   re-render when the route changes.
 *
 * All state is module-level, making the router a singleton. Initialize it
 * once (typically inside Scaffold) via `initRouter` before using any
 * navigation helpers.
 */

/** @type {Object.<string, *>} Registered route map (pattern → component). */
let routes = {};

/** @type {string} The currently active path (without query string). */
let currentPath = "/";

/**
 * Navigation history stack used by goBack().
 * Each entry captures the path, params, and query at the time of navigation.
 *
 * @type {Array<{path: string, params: Object, query: Object}>}
 */
let history = [];

/** @type {Function[]} Registered route-change listener callbacks. */
let listeners = [];

/** @type {Object.<string, string>} Dynamic path params for the current route. */
let currentParams = {};

/** @type {Object.<string, string>} Query string params for the current URL. */
let currentQuery = {};

/** @type {Function|null} Removes the popstate event listener; set during initRouter. */
let removePopStateListener = null;

// ========== UTILITIES ==========

/**
 * Match a route pattern containing `:param` segments against a concrete path.
 * Returns the extracted param map, or an empty object if the path does not match.
 *
 * @param {string} pattern - Route pattern, e.g. "/user/:id/post/:slug".
 * @param {string} path - Concrete path, e.g. "/user/42/post/hello-world".
 * @returns {Object.<string, string>} Extracted param values keyed by param name.
 */
const extractParams = (pattern, path) => {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  const params = {};

  if (patternParts.length !== pathParts.length) return params;

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      // Segment mismatch — this pattern does not match the path.
      return {};
    }
  }
  return params;
};

/**
 * Parse query string parameters from a URL or query string.
 *
 * @param {string} url - Full URL or query string (with or without leading "?").
 * @returns {Object.<string, string>} Key/value pairs decoded from the query string.
 */
const extractQueryParams = (url) => {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return {};

  const queryString = url.slice(queryIndex + 1);
  const params = {};

  queryString.split("&").forEach((param) => {
    const [key, value] = param.split("=");
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : "";
    }
  });
  return params;
};

/**
 * Strip the query string from a path, returning only the path component.
 *
 * @param {string} path - Path, possibly with a "?query" suffix.
 * @returns {string} Path without the query string.
 */
const cleanPath = (path) => {
  const queryIndex = path.indexOf("?");
  return queryIndex === -1 ? path : path.slice(0, queryIndex);
};

/**
 * Find the registered route that matches a given path.
 * Tries an exact match first, then scans for patterns with dynamic segments.
 *
 * @param {string} path - Concrete path to resolve.
 * @returns {{route: *, params: Object, pattern: string}|null}
 *   Matched route entry and extracted params, or null if no match found.
 */
const findMatchingRoute = (path) => {
  const cleanPathStr = cleanPath(path);

  // Fast path: exact match.
  if (routes[cleanPathStr]) {
    return { route: routes[cleanPathStr], params: {}, pattern: cleanPathStr };
  }

  // Slow path: scan patterns for dynamic segments.
  for (const [pattern, route] of Object.entries(routes)) {
    if (pattern.includes(":")) {
      const params = extractParams(pattern, cleanPathStr);
      if (Object.keys(params).length > 0) {
        return { route, params, pattern };
      }
    }
  }
  return null;
};

// ========== INITIALIZATION ==========

/**
 * Bootstrap the router with a route map and an optional starting path.
 *
 * Reads the current browser URL when no `initialPath` is provided, so
 * deep-links work correctly on first page load. Also attaches a `popstate`
 * listener so the browser's back/forward buttons trigger re-renders.
 *
 * Call this once — typically inside the Scaffold component — before
 * navigating or subscribing.
 *
 * @param {Object.<string, *>} routesConfig - Map of path patterns to components/config.
 * @param {string|null} [initialPath=null] - Override the starting path; defaults to window.location.pathname.
 */
export const initRouter = (routesConfig, initialPath = null) => {
  routes = routesConfig;

  // Prefer the explicit initialPath; fall back to the live browser URL so
  // that deep-links resolve to the correct route on first load.
  let urlPath = initialPath;
  if (!urlPath && typeof window !== "undefined") {
    urlPath = window.location.pathname;
  }

  // Last resort: use the first registered route or the root.
  if (!urlPath) {
    urlPath = Object.keys(routes)[0] || "/";
  }

  currentPath = urlPath;

  // Resolve dynamic params for the initial path.
  const match = findMatchingRoute(currentPath);
  if (match) {
    currentParams = match.params;
  } else if (!routes[currentPath]) {
    // Unknown route — redirect to the first registered route rather than
    // showing a blank screen.
    currentPath = Object.keys(routes)[0] || "/";
    currentParams = {};
  } else {
    currentParams = {};
  }

  // Parse any query params present in the current URL.
  currentQuery =
    typeof window !== "undefined"
      ? extractQueryParams(window.location.search)
      : extractQueryParams(urlPath);

  // Sync browser history so the address bar reflects the resolved path
  // (handles the case where the user lands on an unknown path that was
  // redirected to the first route above).
  if (
    typeof window !== "undefined" &&
    window.location.pathname !== currentPath
  ) {
    window.history.replaceState({ path: currentPath }, "", currentPath);
  }

  // Listen for browser-native back/forward navigation so the router state
  // stays in sync with the History API.
  if (typeof window !== "undefined") {
    if (removePopStateListener) removePopStateListener();
    const handlePopState = (event) => {
      const path = event.state?.path || window.location.pathname;
      if (path !== currentPath) {
        currentPath = path;
        const match = findMatchingRoute(currentPath);
        currentParams = match?.params || {};
        currentQuery = extractQueryParams(window.location.search);
        notify();
      }
    };
    window.addEventListener("popstate", handlePopState);
    removePopStateListener = () =>
      window.removeEventListener("popstate", handlePopState);
  }

  notify();
};

// ========== NAVIGATION ==========

/**
 * Navigate to a new route, pushing a new entry onto the history stack.
 *
 * If the target path does not match any registered route, the router tries
 * to render a wildcard (`*`) or `/404` route instead and logs an error.
 *
 * @param {string} path - Target path (may include a query string, e.g. "/users?page=2").
 * @param {Object.<string, string>} [params={}] - Additional query params merged into the URL's own query string.
 */
export const goTo = (path, params = {}) => {
  const queryParams = extractQueryParams(path);
  const cleanPathStr = cleanPath(path);
  const match = findMatchingRoute(cleanPathStr);

  if (match || routes[cleanPathStr]) {
    // Push the current location onto the history stack before navigating.
    history.push({
      path: currentPath,
      params: currentParams,
      query: currentQuery,
    });
    currentPath = cleanPathStr;
    currentParams = match?.params || {};
    currentQuery = { ...queryParams, ...params };

    if (typeof window !== "undefined") {
      window.history.pushState({ path: currentPath }, "", path);
    }
    notify();
  } else {
    console.error(`Route "${cleanPathStr}" does not exist`);
    // Graceful fallback to a wildcard or 404 route when defined.
    if (routes["*"] || routes["/404"]) {
      const notFoundRoute = routes["*"] || routes["/404"];
      currentPath = "*";
      currentParams = {};
      currentQuery = {};
      notify({ notFound: true, originalPath: cleanPathStr });
    }
  }
};

/**
 * Navigate to a path by replacing the current history entry rather than
 * pushing a new one. Useful for redirects that should not appear in the
 * back-button history (e.g. after a login redirect).
 *
 * @param {string} path - Target path (may include a query string).
 * @param {Object.<string, string>} [params={}] - Additional query params.
 */
export const replace = (path, params = {}) => {
  const queryParams = extractQueryParams(path);
  const cleanPathStr = cleanPath(path);
  const match = findMatchingRoute(cleanPathStr);

  if (match || routes[cleanPathStr]) {
    currentPath = cleanPathStr;
    currentParams = match?.params || {};
    currentQuery = { ...queryParams, ...params };

    if (typeof window !== "undefined") {
      window.history.replaceState({ path: currentPath }, "", path);
    }
    notify();
  }
};

/**
 * Navigate back to the previous entry in the router's internal history stack.
 * Also triggers `window.history.back()` to keep the browser history in sync.
 * If the internal stack is empty, this is a no-op.
 */
export const goBack = () => {
  if (history.length > 0) {
    const previous = history.pop();
    currentPath = previous.path;
    currentParams = previous.params || {};
    currentQuery = previous.query || {};
    if (typeof window !== "undefined") window.history.back();
    notify();
  }
};

/**
 * Navigate forward in the browser's built-in history (mirrors window.history.forward).
 */
export const goForward = () => {
  if (typeof window !== "undefined") window.history.forward();
};

// ========== STATE READERS ==========

/**
 * Returns the current active path (without query string).
 *
 * @returns {string}
 */
export const getCurrentPath = () => currentPath;

/**
 * Returns a shallow copy of the current dynamic route params.
 * Mutations to the returned object do not affect the router state.
 *
 * @returns {Object.<string, string>}
 */
export const useParams = () => ({ ...currentParams });

/**
 * Returns a shallow copy of the current query string params.
 *
 * @returns {Object.<string, string>}
 */
export const useQueryParams = () => ({ ...currentQuery });

/**
 * Returns the component/config registered for the current route.
 *
 * @returns {*} The route value, or undefined when the current path has no match.
 */
export const getCurrentRoute = () => {
  const match = findMatchingRoute(currentPath);
  return match?.route || routes[currentPath];
};

/**
 * Returns a full snapshot of the current route state.
 *
 * @returns {{route: *, params: Object, query: Object, path: string}}
 */
export const getCurrentRouteConfig = () => {
  const match = findMatchingRoute(currentPath);
  return {
    route: match?.route || routes[currentPath],
    params: currentParams,
    query: currentQuery,
    path: currentPath,
  };
};

/**
 * Look up the component/config registered for any arbitrary path.
 *
 * @param {string} path - Path to look up (exact or dynamic pattern match).
 * @returns {*} The route value, or undefined when not found.
 */
export const getRoute = (path) => {
  const cleanPathStr = cleanPath(path);
  const match = findMatchingRoute(cleanPathStr);
  return match?.route || routes[cleanPathStr];
};

/**
 * Check whether a given path is currently active.
 *
 * @param {string} path - Path to compare against the current route.
 * @param {boolean} [exact=true] - When false, matches any path that starts with `path`.
 * @returns {boolean}
 */
export const isActive = (path, exact = true) => {
  if (exact) return currentPath === path;
  return currentPath.startsWith(path);
};

/**
 * Build a URL from a pattern with dynamic segments, filling in params and
 * appending a query string.
 *
 * @param {string} pattern - Route pattern, e.g. "/user/:id".
 * @param {Object.<string, string>} [params={}] - Values for dynamic segments.
 * @param {Object.<string, string>} [query={}] - Query string params to append.
 * @returns {string} The resolved URL.
 */
export const buildUrl = (pattern, params = {}, query = {}) => {
  let url = pattern;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, encodeURIComponent(value));
  });
  const queryKeys = Object.keys(query);
  if (queryKeys.length > 0) {
    const queryString = queryKeys
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`,
      )
      .join("&");
    url += `?${queryString}`;
  }
  return url;
};

// ========== SUBSCRIPTIONS ==========

/**
 * Register a callback to be called whenever the current route changes.
 * The callback receives the new route value, params, query, and any extra
 * data passed to notify() (e.g. `{ notFound: true }`).
 *
 * @param {Function} callback - Called as `callback(route, params, query, extras)`.
 * @returns {Function} Unsubscribe function — call it to stop receiving updates.
 */
export const subscribe = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

/**
 * Dispatch the current route to all registered listeners.
 * Called internally after every navigation.
 *
 * @param {Object} [extraParams={}] - Extra context passed through to listeners.
 */
const notify = (extraParams = {}) => {
  const route = getCurrentRoute();
  listeners.forEach((cb) =>
    cb(route, currentParams, currentQuery, extraParams),
  );
};

/**
 * Tear down the router: remove the popstate listener, clear all state,
 * and unregister all listeners.
 *
 * Use this during hot-module replacement or when unmounting the root scaffold
 * to prevent stale listeners from persisting across reloads.
 */
export const clearRouter = () => {
  if (removePopStateListener) {
    removePopStateListener();
    removePopStateListener = null;
  }
  routes = {};
  currentPath = "/";
  history = [];
  listeners = [];
  currentParams = {};
  currentQuery = {};
};

export default {
  initRouter,
  goTo,
  replace,
  goBack,
  goForward,
  getCurrentPath,
  getCurrentRoute,
  getCurrentRouteConfig,
  getRoute,
  isActive,
  subscribe,
  clearRouter,
  useParams,
  useQueryParams,
  buildUrl,
};
