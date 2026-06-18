// navigations/Router.js
/**
 * Router Module - Sistema de enrutamiento completo
 * CORREGIDO: Ahora lee la URL actual del navegador al iniciar
 */

let routes = {};
let currentPath = "/";
let history = [];
let listeners = [];
let currentParams = {};
let currentQuery = {};

// ========== UTILIDADES ==========

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
      return {};
    }
  }
  return params;
};

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

const cleanPath = (path) => {
  const queryIndex = path.indexOf("?");
  return queryIndex === -1 ? path : path.slice(0, queryIndex);
};

const findMatchingRoute = (path) => {
  const cleanPathStr = cleanPath(path);

  if (routes[cleanPathStr]) {
    return { route: routes[cleanPathStr], params: {}, pattern: cleanPathStr };
  }

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

// ========== FUNCIÓN PRINCIPAL CORREGIDA ==========

export const initRouter = (routesConfig, initialPath = null) => {
  routes = routesConfig;

  // 🔥 IMPORTANTE: Leer la URL actual del navegador si no se pasó initialPath
  let urlPath = initialPath;
  if (!urlPath && typeof window !== "undefined") {
    urlPath = window.location.pathname;
  }

  // Si aún no hay path, usar la primera ruta o '/'
  if (!urlPath) {
    urlPath = Object.keys(routes)[0] || "/";
  }

  currentPath = urlPath;

  // Buscar si la ruta actual tiene parámetros dinámicos
  const match = findMatchingRoute(currentPath);
  if (match) {
    currentParams = match.params;
  } else if (!routes[currentPath]) {
    // La ruta no existe, redirigir a la primera ruta
    currentPath = Object.keys(routes)[0] || "/";
    currentParams = {};
  } else {
    currentParams = {};
  }

  // Extraer query params de la URL actual
  currentQuery = extractQueryParams(window.location.search);

  // Actualizar la URL en el navegador SOLO si es necesario
  if (
    typeof window !== "undefined" &&
    window.location.pathname !== currentPath
  ) {
    window.history.replaceState({ path: currentPath }, "", currentPath);
  }

  // Escuchar eventos de navegación del navegador (popstate)
  window.addEventListener("popstate", (event) => {
    const path = event.state?.path || window.location.pathname;
    if (path !== currentPath) {
      currentPath = path;
      const match = findMatchingRoute(currentPath);
      currentParams = match?.params || {};
      currentQuery = extractQueryParams(window.location.search);
      notify();
    }
  });

  notify();
};

// ========== NAVEGACIÓN ==========

export const goTo = (path, params = {}) => {
  const queryParams = extractQueryParams(path);
  const cleanPathStr = cleanPath(path);
  const match = findMatchingRoute(cleanPathStr);

  if (match || routes[cleanPathStr]) {
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
    if (routes["*"] || routes["/404"]) {
      const notFoundRoute = routes["*"] || routes["/404"];
      currentPath = "*";
      currentParams = {};
      currentQuery = {};
      notify({ notFound: true, originalPath: cleanPathStr });
    }
  }
};

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

export const goForward = () => {
  if (typeof window !== "undefined") window.history.forward();
};

// ========== LECTURA DE ESTADO ==========

export const getCurrentPath = () => currentPath;
export const useParams = () => ({ ...currentParams });
export const useQueryParams = () => ({ ...currentQuery });

export const getCurrentRoute = () => {
  const match = findMatchingRoute(currentPath);
  return match?.route || routes[currentPath];
};

export const getCurrentRouteConfig = () => {
  const match = findMatchingRoute(currentPath);
  return {
    route: match?.route || routes[currentPath],
    params: currentParams,
    query: currentQuery,
    path: currentPath,
  };
};

export const getRoute = (path) => {
  const cleanPathStr = cleanPath(path);
  const match = findMatchingRoute(cleanPathStr);
  return match?.route || routes[cleanPathStr];
};

export const isActive = (path, exact = true) => {
  if (exact) return currentPath === path;
  return currentPath.startsWith(path);
};

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

// ========== SUSCRIPCIÓN ==========

export const subscribe = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

const notify = (extraParams = {}) => {
  const route = getCurrentRoute();
  listeners.forEach((cb) =>
    cb(route, currentParams, currentQuery, extraParams),
  );
};

export const clearRouter = () => {
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
