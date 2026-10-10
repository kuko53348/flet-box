WIDGET_DOCS = {
    "Skeleton": {
        "summary": "Skeleton renders animated placeholder blocks that stand in for content while it loads. "
                   "It supports text, circular, avatar, image, card, listTile and button shapes.",
        "when": "Reach for it to keep layout stable and communicate loading instead of showing an empty screen or a spinner.",
        "related": ["ProgressBar", "CircularBar", "Card"],
        "tips": [
            "Match the skeleton variant and height to the real content so the layout does not jump when data arrives.",
            "Set count together with gap to mock a list of rows instead of nesting many Skeleton widgets.",
            'Use animation: "none" when many placeholders would otherwise distract or hurt performance.',
        ],
        "accessibility": [
            "Wrap the loading region with a status label so screen readers know content is still pending.",
            'Prefer animation: "none" when the user has requested reduced motion.',
        ],
        "behavior": [
            "The pulse/wave shimmer runs as a CSS animation and is cleaned up automatically when the widget unmounts.",
            "Changing variant, width or height through the reactive setter re-renders the placeholder in place.",
        ],
        "basic": '''const line = Skeleton({
  width: "100%",
  height: 16,
});''',
        "normal": '''const article = Skeleton({
  variant: "text",
  width: "80%",
  height: 14,
  count: 3,
  gap: 8,
  animation: "pulse",
});''',
        "full": '''const cardPlaceholder = Skeleton({
  variant: "card",
  width: 320,
  height: 180,
  borderRadius: 12,
  animation: "wave",
  bgColor: "#e5e7eb",
  highlightColor: "#f3f4f6",
  shimmerColor: "#ffffff",
  gap: 12,
});''',
    },
    "CodeViewer": {
        "summary": "CodeViewer shows a read-only code block with an optional header, line numbers and scrolling for long files. "
                   "It renders the code prop verbatim in a styled monospace container.",
        "when": "Use it to display snippets, config or logs in docs and developer tools without building your own pre/code styling.",
        "related": ["Markdown", "Text", "Card"],
        "tips": [
            "Pass the full source in code; use showLineNumbers and startingLineNumber to match an excerpt's original numbers.",
            "Cap tall blocks with maxHeight so the viewer scrolls instead of pushing the page layout.",
            "Set title to label the file or language shown in the header.",
        ],
        "accessibility": [
            "Keep the code text selectable and readable; do not rely on color alone to convey meaning.",
            "A descriptive title helps screen-reader users identify the snippet.",
        ],
        "behavior": [
            "The code is inserted as text content, so HTML in code is displayed rather than executed.",
            "Line numbers are derived from code and update when the reactive code prop changes.",
        ],
        "basic": '''const snippet = CodeViewer({
  code: "const total = price * qty;",
});''',
        "normal": '''const viewer = CodeViewer({
  code: "function add(a, b) {\\n  return a + b;\\n}",
  title: "math.js",
  showLineNumbers: true,
  maxHeight: 320,
});''',
        "full": '''const viewer = CodeViewer({
  code: "export function login(user) {\\n  return api.post('/auth', user);\\n}",
  title: "auth.js",
  showHeader: true,
  showLineNumbers: true,
  startingLineNumber: 10,
  lineNumberWidth: 40,
  fontSize: 13,
  maxHeight: 400,
  borderRadius: 8,
  backgroundColor: "#0f172a",
  lineNumberColor: "#64748b",
  padding: 16,
});''',
    },
    "Inspector": {
        "summary": "Inspector renders a read-only tree that drills into a widget's props, children and element structure. "
                   "It is a debugging aid for understanding how a composition is built.",
        "when": "Use it during development to inspect the live structure and props of a widget tree.",
        "related": ["CodeViewer", "TreeView", "Text"],
        "tips": [
            "Pass the widget instance you want to examine to widget; the tree follows its current children.",
            "Increase indent to make deep nesting easier to scan.",
            "Remove Inspector from production screens since it is a diagnostic tool.",
        ],
        "accessibility": [
            "The tree is text-based and readable; keep surrounding labels so users know what is being inspected.",
        ],
        "behavior": [
            "Inspector walks the widget's props and children at render time and does not modify the inspected widget.",
            "Re-rendering the parent refreshes the inspected values.",
        ],
        "basic": '''const debug = Inspector({
  widget: Button({ text: "Save" }),
});''',
        "normal": '''const debug = Inspector({
  widget: Card({
    padding: 16,
    child: Text({ text: "Profile" }),
  }),
  indent: 16,
});''',
        "full": '''const debug = Inspector({
  widget: Container({
    padding: 16,
    direction: "column",
    gap: 8,
    children: [
      Text({ text: "Header" }),
      Button({ text: "Save" }),
    ],
  }),
  indent: 24,
});''',
    },
    "Pagination": {
        "summary": "Pagination renders page controls derived from totalItems and pageSize, with optional first/last and prev/next buttons. "
                   "It reports the chosen page through onPageChange.",
        "when": "Use it under long lists or tables so users can move through paged results.",
        "related": ["DataTable", "ListView", "Button"],
        "tips": [
            "Provide totalItems and pageSize; the number of pages is computed for you.",
            "Control the active page with currentPage and update it inside onPageChange.",
            "Use maxButtons to limit how many page buttons appear before they collapse.",
        ],
        "accessibility": [
            "Ensure the current page is distinguishable and that controls are reachable by keyboard.",
            "Pair pagination with a visible total by enabling showTotal so users know how much data exists.",
        ],
        "behavior": [
            "Pages are recalculated whenever totalItems, pageSize or currentPage change.",
            "onPageChange fires with the new page number when the user navigates.",
        ],
        "basic": '''const pages = Pagination({
  totalItems: 100,
  pageSize: 10,
  onPageChange: (page) => console.log(page),
});''',
        "normal": '''const pages = Pagination({
  totalItems: 248,
  pageSize: 20,
  currentPage: 1,
  showPrevNext: true,
  showFirstLast: true,
  onPageChange: (page) => loadPage(page),
});''',
        "full": '''const pages = Pagination({
  totalItems: 512,
  pageSize: 25,
  currentPage: 4,
  maxButtons: 7,
  variant: "filled",
  size: "medium",
  showFirstLast: true,
  showPrevNext: true,
  showTotal: true,
  label: "Rows",
  color: "#2563eb",
  onPageChange: (page) => loadPage(page),
});''',
    },
    "TreeView": {
        "summary": "TreeView renders a collapsible hierarchy from nodes, each with an id, label, optional icon, badge and children. "
                   "It supports expand/collapse, selection and nested navigation.",
        "when": "Use it for file explorers, category menus or any nested set of items the user drills into.",
        "related": ["ListView", "ListTile", "Accordion"],
        "tips": [
            "Give every node a stable unique id; expandedNodes and selectedNodeId reference those ids.",
            "Set selectable to false for navigation trees where tapping should only toggle groups.",
            "Use defaultExpanded to open first-level groups on first render.",
        ],
        "accessibility": [
            "Expose meaningful label text and do not rely only on icons to describe a node.",
            "Keep onSelect behavior predictable so keyboard users understand what activation does.",
        ],
        "behavior": [
            "Nodes toggle locally and report expansion through onToggle with the nodeId and expanded flag.",
            "Selection is reported through onSelect as the node object and can be controlled with selectedNodeId.",
        ],
        "basic": '''const tree = TreeView({
  nodes: [
    { id: "src", label: "src" },
  ],
});''',
        "normal": '''const tree = TreeView({
  nodes: [
    {
      id: "src",
      label: "src",
      children: [
        { id: "app", label: "app.js" },
        { id: "router", label: "Router.js" },
      ],
    },
  ],
  showIcons: true,
  onSelect: (node) => console.log(node.id),
});''',
        "full": '''const tree = TreeView({
  nodes: [
    {
      id: "src",
      label: "src",
      icon: "folder",
      children: [
        { id: "app", label: "app.js", icon: "description" },
        { id: "router", label: "Router.js", badge: 2 },
      ],
    },
  ],
  expandedNodes: ["src"],
  defaultExpanded: true,
  selectable: true,
  showIcons: true,
  selectedNodeId: "app",
  indent: 20,
  nodeGap: 4,
  childrenGap: 4,
  fontSize: 14,
  transitionDuration: "200ms",
  hoverBgColor: "#f1f5f9",
  selectedBgColor: "#dbeafe",
  onToggle: (nodeId, expanded) => console.log(nodeId, expanded),
  onSelect: (node) => console.log(node.id),
});''',
    },
    "Chart": {
        "summary": "Chart draws bar, line, area or candlestick data onto a canvas, with optional labels, grid and value annotations. "
                   "Numeric arrays drive bar/line/area while OHLC objects drive candle charts.",
        "when": "Use it to visualize trends and comparisons inline without pulling in a charting library.",
        "related": ["CircularChart", "CircularBar", "Card"],
        "tips": [
            "Match data to type: pass numbers for bar/line/area and open/high/low/close objects for candle.",
            "Provide labels so the x-axis is meaningful to readers.",
            "Set an explicit height to reserve space and avoid layout shift while the chart initializes.",
        ],
        "accessibility": [
            "Add a text summary or table of the values near the chart since canvas content is not readable by screen readers.",
            "Use sufficient contrast between data, axis and background colors.",
        ],
        "behavior": [
            "The canvas redraws when data, labels, type or styling props change.",
            "Candle charts read open, high, low and close in that order from each data object.",
        ],
        "basic": '''const totals = Chart({
  type: "bar",
  data: [12, 19, 7, 15],
});''',
        "normal": '''const revenue = Chart({
  type: "line",
  data: [12, 19, 7, 15, 22],
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  height: 260,
  showGrid: true,
  showLabels: true,
});''',
        "full": '''const trend = Chart({
  type: "area",
  data: [8, 14, 10, 21, 18, 26],
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  width: "100%",
  height: 320,
  smooth: true,
  areaGradient: true,
  areaGradientColors: ["#3b82f6", "#bfdbfe"],
  lineColor: "#2563eb",
  areaColor: "#93c5fd",
  axisColor: "#94a3b8",
  textColor: "#475569",
  showGrid: true,
  showLabels: true,
  showValues: true,
  borderRadius: 12,
  bgColor: "#ffffff",
  padding: 16,
});''',
    },
    "QRCode": {
        "summary": "QRCode renders a scannable QR image for a string value. "
                   "It lets you tune size, colors and the error-correction level.",
        "when": "Use it to share URLs, pairing codes or contact data that a phone camera can scan.",
        "related": ["Image", "CodeViewer", "Card"],
        "tips": [
            "Keep size large enough to scan comfortably; very small codes fail on low-resolution cameras.",
            "Raise errorCorrection to H when the code may be printed small, dirty or partially covered.",
            "Keep fgColor dark and bgColor light for reliable contrast.",
        ],
        "accessibility": [
            "Also show the encoded value as text so users who cannot scan it can still read or type it.",
            "Maintain strong foreground and background contrast for camera and screen legibility.",
        ],
        "behavior": [
            "The QR image re-encodes whenever value or errorCorrection changes.",
            "margin adds a quiet-zone border around the code, which scanners expect.",
        ],
        "basic": '''const qr = QRCode({
  value: "https://fletbox.dev",
});''',
        "normal": '''const qr = QRCode({
  value: "https://fletbox.dev/download",
  size: 220,
  errorCorrection: "M",
});''',
        "full": '''const qr = QRCode({
  value: "https://fletbox.dev/invite?team=core",
  size: 320,
  bgColor: "#ffffff",
  fgColor: "#0f172a",
  margin: 8,
  errorCorrection: "H",
});''',
    },
    "DraggBox": {
        "summary": "DraggBox wraps a child so it can be dragged with the native drag-and-drop API. "
                   "It tags the payload with data and an optional group so matching DroppBox targets can accept it.",
        "when": "Use it to build kanban boards, sortable lists or any drag-to-rearrange interface.",
        "related": ["DroppBox", "Card", "ListView"],
        "tips": [
            "Give draggable items a group and have targets list it in acceptGroups to control what can be dropped.",
            "Use cloneOnDrag when the original should remain in place while a copy is dragged.",
            "Set data to the payload the drop target needs, not just the visual content.",
        ],
        "accessibility": [
            "Provide a non-drag alternative such as buttons or a menu so keyboard users can move items.",
            "Ensure onDragStart and onDragEnd give feedback so changes are perceivable.",
        ],
        "behavior": [
            "Drag events surface the original payload via the data argument in onDragStart and onDragEnd.",
            "Setting disabled turns the child back into a non-draggable element.",
        ],
        "basic": '''const item = DraggBox({
  child: Text({ text: "Drag me" }),
});''',
        "normal": '''const task = DraggBox({
  child: Card({ padding: 12, child: Text({ text: "Write docs" }) }),
  group: "tasks",
  data: { id: 1 },
  onDragEnd: (event, data) => console.log(data),
});''',
        "full": '''const task = DraggBox({
  child: Card({
    padding: 16,
    child: Text({ text: "Ship the release" }),
  }),
  group: "kanban",
  data: { id: "task-42", title: "Ship the release" },
  cloneOnDrag: true,
  opacity: 0.6,
  dragOverlayColor: "#eff6ff",
  dragBorderColor: "#2563eb",
  onDragStart: (event, data) => console.log("start", data),
  onDragEnd: (event, data) => console.log("end", data),
});''',
    },
    "DroppBox": {
        "summary": "A drop target for DraggBox items. "
                   "It validates incoming payloads against acceptGroups and reports successful drops through onDrop.",
        "when": "Use it as a container that receives dragged items, such as a column on a kanban board.",
        "related": ["DraggBox", "Container", "Card"],
        "tips": [
            "List the drag group values you allow in acceptGroups; unlisted groups are rejected.",
            "Style activeBgColor and activeBorderColor so users see the target highlight during a drag.",
            "Use validBgColor and invalidBgColor with showFeedback to signal whether a drop is allowed.",
        ],
        "accessibility": [
            "Pair drop zones with an alternative control, such as a move menu, for keyboard and touch users.",
            "Make the target's purpose clear with visible text, not just a highlighted border.",
        ],
        "behavior": [
            "onDrop fires with the data, group and event when an accepted item is released.",
            "onDragEnter, onDragOver and onDragLeave fire as the pointer passes over the target.",
        ],
        "basic": '''const zone = DroppBox({
  child: Text({ text: "Drop here" }),
});''',
        "normal": '''const zone = DroppBox({
  child: Text({ text: "Drop a task here" }),
  acceptGroups: ["tasks"],
  onDrop: (data, group) => console.log(data, group),
});''',
        "full": '''const zone = DroppBox({
  child: Container({
    padding: 24,
    child: Text({ text: "Drop tasks here" }),
  }),
  acceptGroups: ["kanban"],
  showFeedback: true,
  bgColor: "#f8fafc",
  borderWidth: 2,
  borderStyle: "dashed",
  borderColor: "#cbd5e1",
  borderRadius: 12,
  padding: 16,
  activeBgColor: "#eff6ff",
  activeBorderColor: "#2563eb",
  validBgColor: "#f0fdf4",
  validBorderColor: "#16a34a",
  invalidBgColor: "#fef2f2",
  invalidBorderColor: "#dc2626",
  transitionDuration: "150ms",
  onDrop: (data, group, event) => console.log(data, group),
  onDragEnter: () => console.log("enter"),
});''',
    },
    "DataTable": {
        "summary": "DataTable renders tabular rows using a columns definition, with optional striping, hover and borders. "
                   "Column entries can be plain strings or DataTableColumn objects.",
        "when": "Use it to present structured, comparable data such as reports, lists or admin grids.",
        "related": ["ListView", "Card", "Pagination"],
        "tips": [
            "Use string column keys that match your row objects, or pass column objects for explicit headers.",
            "Turn on striped and hoverable on wide tables to keep rows readable.",
            "Attach onRowClick when rows should open details or a drill-down view.",
        ],
        "accessibility": [
            "Keep header text descriptive so the table has a clear structure for assistive technology.",
            "Do not encode meaning in color alone, such as striping, and keep text contrast sufficient.",
        ],
        "behavior": [
            "Rows render from rows in order and re-render when rows or columns change.",
            "onRowClick receives the row object and its index.",
        ],
        "basic": '''const table = DataTable({
  columns: ["Name", "Role"],
  rows: [{ Name: "Ada", Role: "Engineer" }],
});''',
        "normal": '''const table = DataTable({
  columns: ["Name", "Role", "Status"],
  rows: [
    { Name: "Ada", Role: "Engineer", Status: "Active" },
    { Name: "Linus", Role: "Maintainer", Status: "Away" },
  ],
  striped: true,
  hoverable: true,
  onRowClick: (row) => console.log(row),
});''',
        "full": '''const table = DataTable({
  columns: ["Name", "Role", "Status"],
  rows: [
    { Name: "Ada", Role: "Engineer", Status: "Active" },
    { Name: "Linus", Role: "Maintainer", Status: "Away" },
  ],
  striped: true,
  hoverable: true,
  bordered: true,
  headerBgColor: "#f1f5f9",
  headerTextColor: "#0f172a",
  headerFontWeight: "600",
  headerFontSize: 14,
  rowFontSize: 13,
  stripedRowBgColor: "#f8fafc",
  hoverRowBgColor: "#eff6ff",
  borderColor: "#e2e8f0",
  borderWidth: 1,
  cellPadding: 12,
  headerCellPadding: 14,
  onRowClick: (row, index) => console.log(row, index),
});''',
    },
    "Carousel": {
        "summary": "Carousel cycles through items one at a time with optional arrows, dots and autoplay. "
                   "Items may be widgets, image URLs or src/alt objects.",
        "when": "Use it to showcase a small set of images, banners or promo slides in limited space.",
        "related": ["Image", "Stack", "Card"],
        "tips": [
            "Enable autoPlay with a sensible interval and keep showDots on so users can jump to a slide.",
            "Mix URL strings, src/alt objects and widgets in items to combine images with captions.",
            "Use infinite for looping banners but turn it off when the sequence has a clear first and last slide.",
        ],
        "accessibility": [
            "Give image items meaningful alt text so each slide is described.",
            "Provide pause and advance controls, and avoid autoplay for content that needs reading time.",
        ],
        "behavior": [
            "onIndexChange fires with the new slide index whenever the active item changes.",
            "Autoplay is cleared automatically when the widget unmounts.",
        ],
        "basic": '''const hero = Carousel({
  items: ["/banner-1.png", "/banner-2.png"],
});''',
        "normal": '''const hero = Carousel({
  items: [
    { src: "/sale.png", alt: "Summer sale" },
    { src: "/launch.png", alt: "New launch" },
  ],
  autoPlay: true,
  interval: 4000,
  showDots: true,
  showArrows: true,
});''',
        "full": '''const hero = Carousel({
  items: [
    { src: "/sale.png", alt: "Summer sale" },
    { src: "/launch.png", alt: "New launch" },
    Text({ text: "Featured story" }),
  ],
  autoPlay: true,
  interval: 5000,
  infinite: true,
  showArrows: true,
  showDots: true,
  height: 320,
  width: "100%",
  borderRadius: 16,
  dotColor: "#cbd5e1",
  dotActiveColor: "#2563eb",
  dotSize: 8,
  dotActiveSize: 10,
  buttonBgColor: "#ffffff",
  buttonIconColor: "#0f172a",
  buttonSize: 40,
  buttonIconSize: 20,
  onIndexChange: (index) => console.log(index),
});''',
    },
}
