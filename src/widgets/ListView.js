// src/widgets/ListView.js
import { WidgetFactory } from "../widget-factory/index.js";

/**
 * @typedef {Object} ListViewProps
 * @property {Array} [data=[]] - Array of data items to render.
 * @property {Function} renderItem - Called with `(item, index)` and must return an `HTMLElement`.
 * @property {number|string} [height=400] - Height of the scroll container. Overridden when `expand` is true.
 * @property {number|string} [width="100%"] - Width of the widget.
 * @property {number} [itemSize=60] - Fixed height of each row in pixels (required for virtualization math).
 * @property {number} [gap=0] - Vertical gap between rows in pixels.
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
  let headerElement = null,
    footerElement = null,
    emptyElement = null;
  let refreshIndicator = null;
  let isGridMode = wrapItems;
  let cols = isGridMode ? Math.max(1, crossAxisCount) : 1;

  // ---- Helper functions ----

  /** @returns {number} Total number of rows (accounting for grid columns). */
  const getTotalRows = () => Math.ceil(_data.length / cols);

  /**
   * Calculates the absolute top offset of an item, accounting for the header height.
   * @param {number} index - Zero-based item index.
   * @returns {number} Top position in pixels.
   */
  const getItemTop = (index) => {
    const row = Math.floor(index / cols);
    const headerHeight = headerElement?.offsetHeight || 0;
    return headerHeight + row * (itemSize + gap);
  };

  /**
   * Calculates the total logical height of the list including header and footer.
   * This value is set on `innerContainer` so the scrollbar reflects the full list size.
   * @returns {number} Total height in pixels.
   */
  const getTotalHeight = () => {
    const rows = getTotalRows();
    const headerH = headerElement?.offsetHeight || 0;
    const footerH = footerElement?.offsetHeight || 0;
    return headerH + (rows * (itemSize + gap) - gap) + footerH;
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

    const scrollTop = scrollContainer.scrollTop;
    const viewportH = scrollContainer.clientHeight;
    const itemTotalH = itemSize + gap;

    // Clamp start/end rows to valid range, including the buffer zone
    let startRow = Math.max(0, Math.floor(scrollTop / itemTotalH) - bufferSize);
    let endRow = Math.min(
      getTotalRows(),
      Math.ceil((scrollTop + viewportH) / itemTotalH) + bufferSize,
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
          itemEl.style.padding = "8px";
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
        wrapper.style.padding = `0 ${gap / 2}px`;
        wrapper.style.boxSizing = "border-box";
      } else {
        wrapper.style.left = "0";
        wrapper.style.right = "0";
        wrapper.style.padding = `0 ${gap}px`;
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
   */
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
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
        ticking = false;
      });
      ticking = true;
    }
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
    spinner.style.width = "24px";
    spinner.style.height = "24px";
    spinner.style.border = "2px solid #e0e0e0";
    spinner.style.borderTop = "2px solid #007aff";
    spinner.style.borderRadius = "50%";
    spinner.style.animation = "spin 0.8s linear infinite";
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
          refreshIndicator.style.height = "60px";
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
    refreshUI();
    element.data = _data;
  };

  /**
   * Scrolls to a specific item by its zero-based index.
   * @param {number} index - Target item index.
   * @param {boolean} [animated=true] - Whether to use smooth scrolling.
   */
  const scrollToIndex = (index, animated = true) => {
    if (index < 0 || index >= _data.length) return;
    const top = getItemTop(index);
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
        refreshIndicator.style.height = _refreshing ? "60px" : "0";
    },
    enumerable: true,
  });

  // ---- Lifecycle hooks ----
  element.onMount(() => {
    renderHeader();
    renderFooter();
    updateInnerHeight();

    // Defer the first actual render to the next animation frame so the header/footer
    // have already been measured and their heights are available.
    requestAnimationFrame(() => {
      updateInnerHeight(); // Recalculate total height now that header/footer are in the DOM
      renderVisibleItems(); // Render the initially visible rows
    });

    renderEmpty();
    scrollContainer.addEventListener("scroll", handleScroll);
    if (onRefresh) setupPullToRefresh();

    // Inject the spinner keyframes once, globally, so pull-to-refresh has its animation
    if (!document.querySelector("#listview-spinner-style")) {
      const style = document.createElement("style");
      style.id = "listview-spinner-style";
      style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
  });

  element.onUnmount(() => {
    scrollContainer.removeEventListener("scroll", handleScroll);
    itemCache.clear();
  });

  return element;
};

export default ListView;
