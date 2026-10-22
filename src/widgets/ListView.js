/**
 * @file ListView.js
 * @description Virtualized list/grid with scroll RAF throttling and pull-to-refresh.
 */
import { WidgetFactory } from "../widget-factory/index.js";
import { injectKeyframes } from "../utils/styleInjector.js";
import { toREM, getBaseFontSize } from "../utils/units.js";

/**
 * @typedef {Object} ListViewProps
 * @property {Array} [data=[]] - Array of data items to render.
 * @property {Function} renderItem - Called with `(item, index)` and must return an `HTMLElement`.
 * @property {number|string} [height=400] - Height of the scroll container. Overridden when `expand` is true.
 * @property {number|string} [width="100%"] - Width of the widget.
 * @property {number} [itemSize=60] - Fixed height of each row in framework units, i.e. it grows with the base font (required for virtualization math).
 * @property {number} [gap=0] - Vertical gap between rows in framework units.
 * @property {number} [bufferSize=5] - Number of extra rows to render above and below the visible viewport.
 *   Larger values reduce the chance of blank flashes during fast scrolling at the cost of more DOM nodes.
 * @property {boolean} [showsScrollIndicator=true] - Whether to show the native scrollbar.
 * @property {boolean} [wrapItems=false] - When true, items are laid out in a grid (see `crossAxisCount`).
 * @property {number} [crossAxisCount=2] - Number of grid columns when `wrapItems` is true.
 * @property {Function} [onEndReached] - Called when the user scrolls within `onEndReachedThreshold` of the bottom.
 * @property {number} [onEndReachedThreshold=0.5] - Fraction (0–1) of the viewport height used as the trigger distance.
 * @property {Function} [onRefresh] - Enables pull-to-refresh. Called with a `done` callback to end the refresh.
 * @property {boolean} [expand=true] - When true the widget takes `flex: 1` and fills its parent instead of using `height`.
 * @property {Function|HTMLElement} [ListHeaderComponent] - Rendered above the list, outside the virtual window.
 * @property {Function|HTMLElement} [ListFooterComponent] - Rendered below the list, outside the virtual window.
 * @property {Function|HTMLElement} [ListEmptyComponent] - Rendered when `data` is empty.
 */

/**
 * A virtualized, scrollable list widget optimized for large datasets.
 *
 * Only the rows currently visible (plus a configurable buffer) are present in the DOM.
 * Items are absolutely positioned inside an inner container whose height equals the
 * total logical height of the list, so the scrollbar behaves as if every row existed.
 *
 * Rendered items are cached by index in a `Map` (capped at 200 entries) so that
 * scrolling back up reuses already-created elements rather than calling `renderItem` again.
 *
 * Optional features:
 * - Grid layout (`wrapItems` + `crossAxisCount`)
 * - Pull-to-refresh (`onRefresh`)
 * - Infinite scroll (`onEndReached`)
 * - Header / footer / empty-state slots
 *
 * Public API (attached to the returned element):
 * - `updateData(newData)` — replaces the dataset and re-renders
 * - `scrollToIndex(index, animated?)` — scrolls to a specific row
 * - `scrollToStart(animated?)` — scrolls to the top
 * - `scrollToEnd(animated?)` — scrolls to the bottom
 * - `data` (property) — reactive getter/setter for the dataset
 * - `refreshing` (property) — getter/setter to control the refresh indicator programmatically
 *
 * @param {ListViewProps} props
 * @returns {HTMLElement} The list container element.
 */
export const ListView = (props) => {
  const {
    data = [],
    renderItem,
    height = 400,
    width = "100%",
    itemSize = 60,
    gap = 0,
    bufferSize = 5,
    showsScrollIndicator = true,
    wrapItems = false,
    crossAxisCount = 2,
    onEndReached,
    onEndReachedThreshold = 0.5,
    onRefresh,
    expand = true,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    ...rest
  } = props;

  // When expand is true the widget fills its flex parent, ignoring the fixed height prop
  let finalHeight = height;
  if (expand) {
    finalHeight = "100%";
  }

  // Outer element — owns the overall dimensions
  const element = WidgetFactory({
    tag: "div",
    widgetName: "ListView",
    width: width,
    height: height,
    display: "flex",
    flex: expand ? 1 : undefined,
    flexDirection: "column",
    overflow: "hidden",
    ...rest,
  });

  // Scrollable container — the only element that actually scrolls
  const scrollContainer = document.createElement("div");
  scrollContainer.style.flex = "1";
  scrollContainer.style.overflowY = "auto";
  scrollContainer.style.overflowX = "hidden";
  if (!showsScrollIndicator) {
    // Hide the scrollbar while keeping scroll functionality
    scrollContainer.style.scrollbarWidth = "none";
    scrollContainer.style.msOverflowStyle = "none";
  }

  // innerContainer has the full logical height so the scrollbar is proportionally sized
  const innerContainer = document.createElement("div");
  innerContainer.style.position = "relative";
  innerContainer.style.width = "100%";

  // visibleContainer holds only the currently rendered (visible + buffered) rows
  const visibleContainer = document.createElement("div");
  visibleContainer.style.position = "relative";
  visibleContainer.style.width = "100%";
  visibleContainer.style.minHeight = "100%";

  innerContainer.appendChild(visibleContainer);
  scrollContainer.appendChild(innerContainer);
  element.appendChild(scrollContainer);

  // ---- Internal state ----
  let _data = [...data];
  let _refreshing = false;
  let itemCache = new Map(); // index → rendered element, capped to avoid unbounded growth
  let visibleStart = 0,
    visibleEnd = 0; // current render window (avoids redundant re-renders when nothing changed)
  let ticking = false; // requestAnimationFrame guard for the scroll handler
  let scrollRaf = 0; // id of the frame the scroll handler queued, so unmount can cancel it
  let mountRaf = 0; // id of the first-render frame
  let disposed = false; // after unmount no queued frame may touch the DOM or call back
  let headerElement = null,
    footerElement = null,
    emptyElement = null;
  let refreshIndicator = null;
  let isGridMode = wrapItems;
  let cols = isGridMode ? Math.max(1, crossAxisCount) : 1;

  // ---- Helper functions ----

  /**
   * Rendered pixels per framework unit, read from the live root font size.
   *
   * `itemSize` and `gap` are framework units, so the row they reserve grows with
   * the reader's font like every other box. The virtualisation math compares
   * against `scrollTop` and `clientHeight`, which are always CSS pixels, so the
   * two spaces have to be joined here: a 60-unit row is 90px of scroll space for
   * a reader on a 24px base, and rows written straight from the unit overlap.
   */
  const unitPx = () => {
    if (typeof document === "undefined") return 1;
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return root > 0 ? root / getBaseFontSize() : 1;
  };
  const slotHeight = () => (itemSize + gap) * unitPx();
  const gapHeight = () => gap * unitPx();

  /** @returns {number} Total number of rows (accounting for grid columns). */
  const getTotalRows = () => Math.ceil(_data.length / cols);

  /** @returns {number} Height the header occupies inside the scroll container. */
  const getHeaderHeight = () => headerElement?.offsetHeight || 0;

  /**
   * Calculates the absolute top offset of an item inside `innerContainer`.
   *
   * The header is a SIBLING placed above `innerContainer`, so the browser already
   * pushes every row down by the header's height. Adding it here counted it twice:
   * rows sat one header below where the window math expected them, and
   * `scrollToIndex` overshot by the same amount.
   *
   * @param {number} index - Zero-based item index.
   * @returns {number} Top position in pixels.
   */
  const getItemTop = (index) => {
    const row = Math.floor(index / cols);
    return row * slotHeight();
  };

  /**
   * Calculates the logical height of the virtual item area. Header and footer are
   * siblings of `innerContainer` and contribute to the scrollbar through their own
   * layout boxes, so they must not be added here.
   * @returns {number} Total height in pixels.
   */
  const getTotalHeight = () => {
    const rows = getTotalRows();
    if (rows === 0) return 0;
    return Math.max(0, rows * slotHeight() - gapHeight());
  };

  /** Applies the correct logical height to the inner container. */
  const updateInnerHeight = () => {
    innerContainer.style.height = `${getTotalHeight()}px`;
  };

  /**
   * Core virtualization routine — determines which items should be in the DOM based
   * on the current scroll position plus the buffer, then replaces `visibleContainer`'s
   * content in one `DocumentFragment` batch to minimize reflows.
   *
   * Short-circuits when the visible window has not changed since the last call.
   */
  const renderVisibleItems = () => {
    if (!scrollContainer) return;

    const viewportH = scrollContainer.clientHeight;
    const itemTotalH = slotHeight();
    // Convert the scroll position into ITEM space: rows start below the header, so
    // the first rows are still on screen while `scrollTop` is inside the header.
    const itemsTop = Math.max(0, scrollContainer.scrollTop - getHeaderHeight());

    // Clamp start/end rows to valid range, including the buffer zone
    let startRow = Math.max(0, Math.floor(itemsTop / itemTotalH) - bufferSize);
    let endRow = Math.min(
      getTotalRows(),
      Math.ceil((itemsTop + viewportH) / itemTotalH) + bufferSize,
    );

    let start = startRow * cols;
    let end = Math.min(_data.length, endRow * cols);

    // Nothing changed — skip the DOM update entirely
    if (start === visibleStart && end === visibleEnd) return;
    visibleStart = start;
    visibleEnd = end;

    // Build all wrappers off-screen in a fragment to minimize layout thrashing
    const fragment = document.createDocumentFragment();

    for (let i = start; i < end; i++) {
      let itemEl = itemCache.get(i);
      if (!itemEl) {
        try {
          itemEl = renderItem(_data[i], i);
          // Evict the oldest cached item when the cache exceeds 200 entries
          if (itemCache.size > 200) {
            const firstKey = itemCache.keys().next().value;
            itemCache.delete(firstKey);
          }
          itemCache.set(i, itemEl);
        } catch (err) {
          console.error("Error in renderItem:", err);
          itemEl = document.createElement("div");
          itemEl.textContent = "Error";
          itemEl.style.padding = toREM(8);
        }
      }
      if (!itemEl) continue;

      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.top = `${getItemTop(i)}px`;
      if (isGridMode) {
        const col = i % cols;
        wrapper.style.left = `${(col / cols) * 100}%`;
        wrapper.style.width = `${100 / cols}%`;
        wrapper.style.padding = `0 ${toREM(gap / 2)}`;
        wrapper.style.boxSizing = "border-box";
      } else {
        wrapper.style.left = "0";
        wrapper.style.right = "0";
        wrapper.style.padding = `0 ${toREM(gap)}`;
      }
      wrapper.appendChild(itemEl);
      fragment.appendChild(wrapper);
    }

    // Replace visible content in one operation
    visibleContainer.innerHTML = "";
    visibleContainer.appendChild(fragment);
  };

  /**
   * Scroll event handler. Uses `requestAnimationFrame` throttling so the handler
   * runs at most once per frame even during rapid scroll events. Also checks
   * whether the user has scrolled close to the bottom and triggers `onEndReached`.
   *
   * The queued frame is tracked so unmounting can cancel it: an untracked frame
   * rendered into a detached DOM and called `onEndReached` on a widget nobody owns
   * anymore — which, for an infinite-scroll handler that appends data, is an
   * unbounded fetch loop.
   */
  const handleScroll = () => {
    if (ticking || disposed) return;
    ticking = true;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      ticking = false;
      if (disposed) return;
      renderVisibleItems();
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      if (
        onEndReached &&
        _data.length &&
        scrollHeight - (scrollTop + clientHeight) <=
          clientHeight * onEndReachedThreshold
      ) {
        onEndReached();
      }
    });
  };

  /**
   * Recomputes the render window when the viewport itself changes size (window
   * resize, a collapsing panel above the list). Without this, more rows becoming
   * visible never triggered a render because no scroll event fired.
   */
  const handleViewportResize = () => {
    if (!disposed) renderVisibleItems();
  };

  // ---- Header / footer / empty-state ----

  /** Removes any existing header and renders the new one if provided. */
  const renderHeader = () => {
    if (headerElement) headerElement.remove();
    if (ListHeaderComponent) {
      headerElement =
        typeof ListHeaderComponent === "function"
          ? ListHeaderComponent()
          : ListHeaderComponent;
      if (headerElement) {
        headerElement.style.position = "relative";
        scrollContainer.insertBefore(headerElement, scrollContainer.firstChild);
      }
    }
  };

  /** Removes any existing footer and renders the new one if provided. */
  const renderFooter = () => {
    if (footerElement) footerElement.remove();
    if (ListFooterComponent) {
      footerElement =
        typeof ListFooterComponent === "function"
          ? ListFooterComponent()
          : ListFooterComponent;
      if (footerElement) {
        footerElement.style.position = "relative";
        scrollContainer.appendChild(footerElement);
      }
    }
  };

  /** Renders the empty-state component when the dataset is empty. */
  const renderEmpty = () => {
    if (emptyElement) emptyElement.remove();
    if (_data.length === 0 && ListEmptyComponent) {
      emptyElement =
        typeof ListEmptyComponent === "function"
          ? ListEmptyComponent()
          : ListEmptyComponent;
      if (emptyElement) {
        emptyElement.style.position = "relative";
        scrollContainer.appendChild(emptyElement);
      }
    }
  };

  /** Recalculates dimensions and re-renders visible items and the empty state. */
  const refreshUI = () => {
    updateInnerHeight();
    renderVisibleItems();
    renderEmpty();
  };

  // ---- Pull-to-refresh ----

  /**
   * Attaches touch listeners to enable pull-to-refresh behavior.
   * A spinner indicator slides in when the user pulls down from the top.
   * The `onRefresh` callback receives a `done()` function to call when loading is complete.
   */
  const setupPullToRefresh = () => {
    if (!onRefresh) return;
    refreshIndicator = document.createElement("div");
    refreshIndicator.style.display = "flex";
    refreshIndicator.style.justifyContent = "center";
    refreshIndicator.style.alignItems = "center";
    refreshIndicator.style.height = "0";
    refreshIndicator.style.overflow = "hidden";
    refreshIndicator.style.transition = "height 0.2s";

    const spinner = document.createElement("div");
    spinner.style.width = toREM(24);
    spinner.style.height = toREM(24);
    spinner.style.border = "2px solid #e0e0e0";
    spinner.style.borderTop = "2px solid #007aff";
    spinner.style.borderRadius = "50%";
    spinner.style.animation = "flet-spin 0.8s linear infinite";
    refreshIndicator.appendChild(spinner);
    scrollContainer.insertBefore(refreshIndicator, scrollContainer.firstChild);

    let startY = 0,
      pulling = false;
    const onTouchStart = (e) => {
      // Only start a pull gesture when at the very top and not already refreshing
      if (scrollContainer.scrollTop === 0 && !_refreshing) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    };
    const onTouchMove = (e) => {
      if (pulling && !_refreshing && scrollContainer.scrollTop === 0) {
        const delta = e.touches[0].clientY - startY;
        if (delta > 0) {
          // Cap the indicator height at 80px to prevent excessive drag
          refreshIndicator.style.height = `${Math.min(delta, 80)}px`;
          e.preventDefault();
        }
      }
    };
    const onTouchEnd = () => {
      if (pulling && !_refreshing) {
        const h = refreshIndicator?.offsetHeight || 0;
        if (h >= 60) {
          // Threshold met — trigger the refresh
          _refreshing = true;
          refreshIndicator.style.height = toREM(60);
          onRefresh(() => {
            _refreshing = false;
            refreshIndicator.style.height = "0";
            if (element.refreshing !== undefined) element.refreshing = false;
            refreshUI();
          });
        } else {
          // Threshold not met — snap back without refreshing
          refreshIndicator.style.height = "0";
        }
      }
      pulling = false;
    };
    scrollContainer.addEventListener("touchstart", onTouchStart);
    scrollContainer.addEventListener("touchmove", onTouchMove);
    scrollContainer.addEventListener("touchend", onTouchEnd);

    element.onUnmount(() => {
      scrollContainer.removeEventListener("touchstart", onTouchStart);
      scrollContainer.removeEventListener("touchmove", onTouchMove);
      scrollContainer.removeEventListener("touchend", onTouchEnd);
    });
  };

  // ---- Public methods ----

  /**
   * Replaces the current dataset, clears the item cache, and triggers a full re-render.
   * @param {Array} newData - The new array of data items.
   */
  const updateData = (newData) => {
    _data = [...newData];
    itemCache.clear();
    // The dataset changed but the viewport did not, so the previous window
    // bounds would make `renderVisibleItems()` bail out and leave the OLD rows
    // on screen for same-length data.
    visibleStart = -1;
    visibleEnd = -1;
    refreshUI();
    // Do NOT write `element.data` here: `data` is an accessor whose setter calls
    // this very function, so assigning to it recursed until the stack overflowed.
  };

  /**
   * Scrolls to a specific item by its zero-based index.
   * @param {number} index - Target item index.
   * @param {boolean} [animated=true] - Whether to use smooth scrolling.
   */
  const scrollToIndex = (index, animated = true) => {
    if (index < 0 || index >= _data.length) return;
    // Back to SCROLL space: the header's height sits in front of the item area.
    const top = getItemTop(index) + getHeaderHeight();
    scrollContainer.scrollTo({ top, behavior: animated ? "smooth" : "auto" });
  };

  /**
   * Scrolls to the top of the list.
   * @param {boolean} [animated=true]
   */
  const scrollToTop = (animated = true) => {
    scrollContainer.scrollTo({
      top: 0,
      behavior: animated ? "smooth" : "auto",
    });
  };

  /**
   * Scrolls to the bottom of the list.
   * @param {boolean} [animated=true]
   */
  const scrollToBottom = (animated = true) => {
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: animated ? "smooth" : "auto",
    });
  };

  element.updateData = updateData;
  element.scrollToIndex = scrollToIndex;
  element.scrollToStart = scrollToTop;
  element.scrollToEnd = scrollToBottom;

  // Reactive `data` property — setting it is equivalent to calling `updateData`
  Object.defineProperty(element, "data", {
    get: () => _data,
    set: (newVal) => updateData(newVal),
    enumerable: true,
    configurable: true,
  });

  // Reactive `refreshing` property — lets the parent show/hide the spinner programmatically
  Object.defineProperty(element, "refreshing", {
    get: () => _refreshing,
    set: (val) => {
      _refreshing = val;
      if (refreshIndicator)
        refreshIndicator.style.height = _refreshing ? toREM(60) : "0";
    },
    enumerable: true,
  });

  // ---- Lifecycle hooks ----
  let resizeObserver = null;

  element.onMount(() => {
    renderHeader();
    renderFooter();
    updateInnerHeight();

    // Defer the first actual render to the next animation frame so the header/footer
    // have already been measured and their heights are available.
    mountRaf = requestAnimationFrame(() => {
      mountRaf = 0;
      if (disposed) return;
      updateInnerHeight(); // Recalculate total height now that header/footer are in the DOM
      renderVisibleItems(); // Render the initially visible rows
    });

    renderEmpty();
    scrollContainer.addEventListener("scroll", handleScroll);
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleViewportResize);
      resizeObserver.observe(scrollContainer);
    } else {
      window.addEventListener("resize", handleViewportResize);
    }
    if (onRefresh) setupPullToRefresh();

    // Inject the spinner keyframes once, globally, so pull-to-refresh has its animation
    injectKeyframes(
      "flet-spin",
      "0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }",
    );
  });

  element.onUnmount(() => {
    disposed = true;
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    if (mountRaf) cancelAnimationFrame(mountRaf);
    if (resizeObserver) resizeObserver.disconnect();
    else window.removeEventListener("resize", handleViewportResize);
    scrollContainer.removeEventListener("scroll", handleScroll);
    itemCache.clear();
  });

  return element;
};

export default ListView;
