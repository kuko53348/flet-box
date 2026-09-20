// src/navigations/index.js
/**
 * Navigation module public API.
 *
 * Re-exports all navigation components and router utilities so consumers
 * can import from a single entry point:
 *
 * @example
 * import { Scaffold, AppBar, Tabs, goTo } from "../navigations/index.js";
 */

export { Scaffold } from "./Scaffold.js";
export { AdaptiveScaffold } from "./AdaptiveScaffold.js";
export { AppBar } from "./AppBar.js";
export { CollapsibleSideBar } from "./CollapsibleSideBar.js";
export {
  Drawer,
  openDrawer,
  closeDrawer,
  toggleDrawer,
  destroyDrawer,
} from "./Drawer.js";
export { BottomNavigation } from "./BottomNavigation.js";
export { Tabs } from "./Tabs.js";
export { DrawerItem } from "./DrawerItem.js";
export {
  /** Initialize the router with a route map and an optional starting path. */
  initRouter,
  /** Navigate to a path, pushing a new history entry. */
  goTo,
  /** Navigate back in the router's internal history stack. */
  goBack,
  /** Navigate forward using the browser's built-in history. */
  goForward,
  /** Navigate to a path by replacing the current history entry. */
  replace,
  /** Returns the currently active path. */
  getCurrentPath,
  /** Returns the component/config for the current route. */
  getCurrentRoute,
  /** Returns the full route state (route, params, query, path). */
  getCurrentRouteConfig,
  /** Look up the component/config for any path. */
  getRoute,
  /** Check whether a path matches the current route. */
  isActive,
  /** Subscribe to route change events; returns an unsubscribe function. */
  subscribe,
  /** Returns a copy of the current dynamic path params. */
  useParams,
  /** Returns a copy of the current query string params. */
  useQueryParams,
  /** Build a URL from a pattern, params, and query string. */
  buildUrl,
  /** Tear down the router and clear all state and listeners. */
  clearRouter,
} from "./Router.js";
