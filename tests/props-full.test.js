// Full-prop mount pass: every widget and navigation component is built with its
// COMPLETE documented prop set. A prop that the registry does not know about
// makes the engine log "unknown prop" and write junk inline CSS, so this file is
// the runtime counterpart of scripts/check-prop-registry.mjs: if the database
// and the declared API ever drift apart, the mount below produces a warning and
// tests/propscan.html fails.
import * as W from "../src/widgets/index.js";
import * as N from "../src/navigations/index.js";
import * as A from "../src/animations/index.js";

const T = (text, props = {}) => W.Text({ text, ...props });
const list = (n) => Array.from({ length: n }, (_, i) => T(`i${i}`));

// Deliberate typo used as the positive control for the warning capture.
const PROBE_PROP = "__fletboxProbeProp";

// One config per component, holding every prop its public interface declares.
// Values are chosen so the widget renders instead of throwing; timers and
// animations are switched off to keep the harness deterministic.
const widgetConfigs = {
  Container: () => ({
    direction: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    selfAlign: "center",
    wrap: true,
    expand: false,
    flex: 1,
    minHeight: 10,
    maxHeight: 200,
    minWidth: 10,
    maxWidth: 300,
    overflow: "hidden",
    child: T("one"),
    children: list(2),
    bgColor: "#f4f4f8",
    borderRadius: 8,
    padding: 6,
  }),
  Row: () => ({
    gap: 6,
    justifyContent: "space-between",
    alignItems: "center",
    wrap: true,
    children: list(2),
    onPress: () => {},
  }),
  Column: () => ({
    gap: 6,
    justifyContent: "start",
    alignItems: "stretch",
    children: list(2),
    onPress: () => {},
  }),
  Stack: () => ({
    children: list(2),
    alignment: "top-left",
    width: 120,
    height: 80,
  }),
  ListView: () => ({
    data: [1, 2, 3],
    renderItem: (item) => T(`row ${item}`),
    height: 120,
    itemSize: 32,
    gap: 4,
    wrapItems: false,
    crossAxisCount: 1,
    onEndReached: () => {},
    onEndReachedThreshold: 40,
    onRefresh: () => {},
    ListHeaderComponent: () => T("head"),
    ListFooterComponent: () => T("foot"),
    ListEmptyComponent: () => T("empty"),
    showsScrollIndicator: false,
    bufferSize: 4,
  }),
  GridView: () => ({ children: list(4), crossAxisCount: 2, gap: 6 }),
  Text: () => ({
    text: "text",
    size: 14,
    color: "#222",
    weight: "600",
    align: "left",
    italic: true,
    decoration: "underline",
    lineHeight: 1.4,
    letterSpacing: 0.4,
  }),
  Button: () => ({
    text: "btn",
    onPress: () => {},
    variant: "filled",
    bgColor: "#3366ff",
    color: "#fff",
    size: "medium",
    fullWidth: false,
    borderRadius: 10,
    elevation: 2,
    icon: "home",
    iconPosition: "left",
    padding: 8,
    margin: 2,
  }),
  Icon: () => ({ name: "home", size: 20, color: "#333", onPress: () => {} }),
  Image: () => ({
    src: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    alt: "px",
    width: 24,
    height: 24,
    fit: "cover",
    circular: true,
    downloadable: true,
    downloadFileName: "pixel.png",
    onLoad: () => {},
    onError: () => {},
    onPress: () => {},
  }),
  Avatar: () => ({
    src: "",
    name: "Ada Lovelace",
    size: 40,
    bgColor: "#3366ff",
    textColor: "#fff",
    shape: "circle",
    online: true,
    badgeColor: "#22c55e",
    onPress: () => {},
  }),
  Card: () => ({
    child: T("card"),
    elevation: 3,
    padding: 12,
    borderRadius: 12,
    showBorder: true,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ddd",
    onPress: () => {},
  }),
  ListTile: () => ({
    leftItem: W.Icon({ name: "home" }),
    title: "title",
    subtitle: "subtitle",
    description: "description",
    titleProps: { size: 15, weight: "700" },
    subtitleProps: { size: 13, color: "#666" },
    descriptionProps: { size: 12, italic: true },
    rightItem: W.Icon({ name: "chevron_right" }),
    onPress: () => {},
    selected: false,
    disabled: false,
    divider: true,
    paddingHorizontal: 12,
    paddingVertical: 8,
    bgColor: "#fff",
    selectedBgColor: "#eef",
    hoverColor: "#f6f6f6",
    elevation: 1,
    borderRadius: 8,
  }),
  ProgressBar: () => ({
    value: 40,
    max: 100,
    height: 8,
    width: 200,
    color: "#3366ff",
    backgroundColor: "#eee",
    borderRadius: 4,
    label: "loading",
    showValue: true,
    valuePosition: "right",
    indeterminate: false,
    striped: false,
    animatedStripes: false,
  }),
  Rating: () => ({
    value: 3,
    max: 5,
    size: 18,
    allowHalf: true,
    activeColor: "#f5a623",
    inactiveColor: "#ddd",
    showValue: true,
    valueColor: "#666",
    valueSize: 12,
    readOnly: false,
    gap: 2,
    iconActive: "star",
    iconInactive: "star_border",
    iconHalf: "star_half",
    onChange: () => {},
  }),
  Chip: () => ({
    label: "chip",
    icon: "tag",
    onPress: () => {},
    onDelete: () => {},
    variant: "filled",
    color: "#3366ff",
    size: "medium",
    borderRadius: 999,
    elevation: 1,
    gap: 4,
  }),
  Badge: () => ({
    value: 5,
    child: T("b"),
    bgColor: "#e53935",
    color: "#fff",
    size: "medium",
    position: "top-right",
    offset: 2,
    borderWidth: 2,
    borderColor: "#fff",
    showZero: true,
    max: 99,
  }),
  Divider: () => ({
    color: "#ddd",
    thickness: 1,
    margin: 6,
    orientation: "horizontal",
  }),
  Accordion: () => ({
    title: "acc",
    children: [T("body")],
    expanded: true,
    onToggle: () => {},
    variant: "outlined",
    borderRadius: 10,
    bgColor: "#fff",
    titleColor: "#222",
    titleSize: 15,
    titleWeight: "600",
    titlePadding: 10,
    contentPadding: 10,
    iconCollapsed: "chevron_right",
    iconExpanded: "expand_more",
    iconColor: "#555",
    iconSize: 20,
    divider: true,
    disabled: false,
    animate: false,
    elevation: 1,
  }),
  AdSense: () => ({
    client: "ca-test",
    slot: "1234",
    format: "auto",
    responsive: true,
    test: true,
    width: 200,
    height: 60,
    placeholder: true,
    label: "ads",
    bgColor: "#fafafa",
    borderColor: "#eee",
    children: [T("ad slot")],
  }),
  AdMob: () => ({
    adId: "ca-app-pub-test",
    isTesting: true,
    position: "bottom",
    size: "BANNER",
    margin: 0,
    interstitialId: "ca-app-pub-int",
    rewardedId: "ca-app-pub-rew",
    autoShow: false,
    autoInitialize: false,
    width: 320,
    height: 50,
    placeholder: true,
    label: "banner",
    bgColor: "#000",
    borderColor: "#333",
    plugin: {
      initialize: () => Promise.resolve(),
      showBanner: () => Promise.resolve(),
      removeBanner: () => Promise.resolve(),
    },
    onLoaded: () => {},
    onFailed: () => {},
    onDismissed: () => {},
  }),
  Input: () => ({
    value: "abc",
    placeholder: "type",
    type: "text",
    label: "label",
    error: false,
    disabled: false,
    readonly: false,
    required: true,
    size: "medium",
    variant: "outlined",
    fullWidth: true,
    borderRadius: 8,
    validation: "letters",
    maxLength: 20,
    iconLeft: "search",
    iconColor: "#888",
    iconSize: 18,
    onIconPress: () => {},
    clearable: true,
    showValidationMessage: true,
    showValidationIcon: true,
    onValidated: () => {},
    onChange: () => {},
    onInput: () => {},
    onFocus: () => {},
    onBlur: () => {},
  }),
  Radio: () => ({
    name: "r",
    value: "1",
    selected: true,
    onSelect: () => {},
    disabled: false,
    size: 18,
    activeColor: "#3366ff",
    label: "one",
  }),
  Switch: () => ({
    value: true,
    onToggle: () => {},
    disabled: false,
    size: "medium",
    activeColor: "#3366ff",
    label: "on",
  }),
  Checkbox: () => ({
    checked: true,
    onCheck: () => {},
    disabled: false,
    size: 18,
    activeColor: "#3366ff",
    label: "yes",
  }),
  Dropdown: () => ({
    options: [
      { label: "one", value: "1" },
      { label: "two", value: "2" },
    ],
    value: "1",
    placeholder: "pick",
    disabled: false,
    label: "l",
    error: false,
    variant: "outlined",
    size: "medium",
    borderRadius: 8,
    color: "#222",
    bgColor: "#fff",
    textColor: "#222",
    optionHoverColor: "#f0f0f0",
    clearable: true,
    width: 180,
    onChange: () => {},
  }),
  SnackBar: () => ({
    message: "saved",
    duration: 1200,
    bgColor: "#333",
    color: "#fff",
    action: { label: "undo", onPress: () => {} },
    onClose: () => {},
  }),
  Modal: () => ({
    title: "modal",
    content: T("body"),
    actions: [W.Button({ text: "ok" })],
    closeOnOverlayClick: true,
    closeOnEsc: true,
    width: 320,
    borderRadius: 12,
    showCloseButton: true,
    onOpen: () => {},
    onClose: () => {},
  }),
  BottomSheet: () => ({
    title: "sheet",
    content: T("body"),
    actions: [W.Button({ text: "ok" })],
    height: 200,
    showDragHandle: true,
    closeOnOverlayClick: true,
    showCloseButton: true,
    onOpen: () => {},
    onClose: () => {},
  }),
  AlertDialog: () => ({
    title: "dialog",
    message: "are you sure?",
    confirmText: "yes",
    cancelText: "no",
    onConfirm: () => {},
    onCancel: () => {},
    onClose: () => {},
    variant: "danger",
    showCancel: true,
    width: 300,
    borderRadius: 12,
  }),
  FloatingActionButton: () => ({
    icon: "add",
    label: "create",
    onPress: () => {},
    backgroundColor: "#3366ff",
    foregroundColor: "#fff",
    elevation: 6,
    borderRadius: 48,
    padding: 12,
    mini: false,
    extended: false,
    disabled: false,
    margin: 16,
  }),
  CodeViewer: () => ({
    code: "let a = 1;",
    title: "code",
    maxHeight: 160,
    fontSize: 13,
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 8,
    showHeader: true,
    showLineNumbers: true,
    startingLineNumber: 1,
    lineNumberWidth: 32,
    lineNumberColor: "#777",
  }),
  DraggBox: () => ({
    child: T("drag"),
    data: { id: 1 },
    group: "g",
    disabled: false,
    onDragStart: () => {},
    onDragEnd: () => {},
    cloneOnDrag: true,
    opacity: 0.5,
    dragOverlayColor: "rgba(51,102,255,0.12)",
    dragBorderColor: "#3366ff",
  }),
  DroppBox: () => ({
    child: T("drop"),
    onDrop: () => {},
    onDragEnter: () => {},
    onDragLeave: () => {},
    onDragOver: () => {},
    acceptGroups: ["g"],
    disabled: false,
    bgColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ddd",
    shadow: "none",
    padding: 16,
    activeBgColor: "rgba(51,102,255,0.12)",
    activeBorderColor: "#3366ff",
    activeBorderWidth: 2,
    activeBorderStyle: "dashed",
    activeShadow: "none",
    validBgColor: "rgba(76,175,80,0.12)",
    validBorderColor: "#4caf50",
    invalidBgColor: "rgba(229,57,53,0.12)",
    invalidBorderColor: "#e53935",
    transitionDuration: "0s",
    transitionTiming: "ease",
    showFeedback: true,
  }),
  DataTable: () => ({
    columns: ["a", "b"],
    rows: [
      ["1", "2"],
      ["3", "4"],
    ],
    striped: true,
    hoverable: true,
    bordered: true,
    onRowClick: () => {},
    headerBgColor: "#f2f2f2",
    headerTextColor: "#222",
    headerFontWeight: "700",
    headerFontSize: 13,
    rowBgColor: "#fff",
    rowTextColor: "#444",
    rowFontSize: 13,
    stripedRowBgColor: "#fafafa",
    hoverRowBgColor: "#f0f6ff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    cellPadding: 8,
    headerCellPadding: 10,
  }),
  Carousel: () => ({
    items: [T("s1"), T("s2")],
    autoPlay: false,
    interval: 3000,
    showArrows: true,
    showDots: true,
    infinite: true,
    height: 120,
    width: 300,
    borderRadius: 12,
    dotColor: "#ccc",
    dotActiveColor: "#3366ff",
    dotSize: 6,
    dotActiveSize: 10,
    buttonBgColor: "#fff",
    buttonIconColor: "#333",
    buttonSize: 32,
    buttonIconSize: 18,
    buttonTop: 50,
    onIndexChange: () => {},
  }),
  Tooltip: () => ({
    text: "tip",
    child: T("hover me"),
    position: "top",
    delay: 0,
    tooltipDelay: 0,
    bgColor: "#222",
    textColor: "#fff",
    fontSize: 12,
    padding: 6,
    borderRadius: 6,
    offset: 6,
    showArrow: true,
    disabled: false,
    maxWidth: 180,
    textAlign: "center",
    animationDuration: 0,
    arrowSize: 6,
    borderColor: "#000",
    borderWidth: 0,
    shadow: true,
  }),
  Pagination: () => ({
    totalItems: 57,
    pageSize: 10,
    currentPage: 2,
    onPageChange: () => {},
    showFirstLast: true,
    showPrevNext: true,
    maxButtons: 5,
    variant: "outlined",
    color: "#3366ff",
    size: "medium",
    disabled: false,
    showTotal: true,
    label: "Page",
  }),
  TreeView: () => ({
    nodes: [
      {
        id: "root",
        label: "root",
        icon: "folder",
        iconColor: "#f5a623",
        badge: 2,
        children: [
          { id: "leaf", label: "leaf", icon: "description" },
          { id: "leaf2", label: "leaf 2" },
        ],
      },
      { id: "solo", label: "solo" },
    ],
    onSelect: () => {},
    onToggle: () => {},
    expandedNodes: ["root"],
    indent: 16,
    showIcons: true,
    folderIcon: "folder",
    folderOpenIcon: "folder_open",
    fileIcon: "description",
    expandIcon: "chevron_right",
    collapseIcon: "expand_more",
    defaultExpanded: true,
    selectable: true,
    selectedNodeId: "leaf",
    bgColor: "#fff",
    hoverBgColor: "#f5f5f5",
    selectedBgColor: "#e8f0fe",
    textColor: "#333",
    selectedTextColor: "#1a73e8",
    iconColor: "#777",
    folderIconColor: "#f5a623",
    borderColor: "#eee",
    nodePadding: 6,
    nodeGap: 6,
    childrenGap: 2,
    borderRadius: 6,
    fontSize: 14,
    iconSize: 18,
    transitionDuration: "0s",
  }),
  Stepper: () => ({
    steps: [
      { label: "one", description: "d1" },
      { label: "two", description: "d2" },
    ],
    activeStep: 0,
    onStepChange: () => {},
    orientation: "horizontal",
    variant: "circular",
    showLabels: true,
    showNavigation: true,
    nextLabel: "next",
    backLabel: "back",
    finishLabel: "done",
    onFinish: () => {},
    bgColor: "#fff",
    borderRadius: 10,
    border: false,
    borderColor: "#eee",
    borderWidth: 1,
    shadow: false,
    padding: 10,
    margin: 0,
    width: 320,
  }),
  Skeleton: () => ({
    variant: "rect",
    width: 120,
    height: 24,
    borderRadius: 6,
    animation: "pulse",
    count: 2,
    gap: 6,
    bgColor: "#eee",
    highlightColor: "#ddd",
    shimmerColor: "#fff",
    pulseDuration: "1s",
    waveDuration: "1s",
  }),
  Chart: () => ({
    type: "bar",
    data: [1, 2, 3],
    labels: ["a", "b", "c"],
    width: 280,
    height: 140,
    bgColor: "#fff",
    padding: 8,
    barColor: "#3366ff",
    lineColor: "#3366ff",
    areaColor: "#cfe0ff",
    smooth: true,
    axisColor: "#ccc",
    textColor: "#333",
    showGrid: true,
    showLabels: true,
    showValues: true,
    borderRadius: 4,
  }),
  QRCode: () => ({
    value: "https://flet-box.dev",
    size: 120,
    bgColor: "#fff",
    fgColor: "#000",
    errorCorrection: "M",
    margin: 4,
  }),
  Slider: () => ({
    value: 3,
    min: 0,
    max: 10,
    step: 1,
    disabled: false,
    width: 200,
    thumbSize: 16,
    color: "#3366ff",
    trackColor: "#e0e0e0",
    orientation: "horizontal",
    inverted: false,
    showValue: true,
    valuePrefix: "",
    valueSuffix: "",
    showMarks: true,
    marks: [0, 5, 10],
    striped: false,
    onPress: () => {},
    onChanged: () => {},
    onChangeEnd: () => {},
  }),
  InstallButton: () => ({
    text: "install",
    variant: "filled",
    size: "medium",
    borderRadius: 8,
    padding: 8,
    bottom: 16,
    onInstalled: () => {},
  }),
  Video: () => ({
    src: "",
    width: 240,
    height: 140,
    autoplay: false,
    controls: true,
    loop: false,
    muted: true,
    poster: "",
  }),
  Audio: () => ({
    src: "",
    autoplay: false,
    controls: true,
    loop: false,
    muted: true,
    volume: 0.5,
    onPlay: () => {},
    onPause: () => {},
    onEnd: () => {},
    onLoad: () => {},
  }),
  CircularBar: () => ({
    value: 40,
    max: 100,
    size: 96,
    strokeWidth: 8,
    color: "#3366ff",
    backgroundColor: "#eee",
    showValue: true,
    valueColor: "#222",
    valueSize: 16,
    label: "done",
    labelColor: "#666",
    labelSize: 12,
    lineCap: "round",
    animate: false,
    animationDuration: 0,
    onComplete: () => {},
    valueFormat: "custom",
    valueSuffix: "%",
    valuePrefix: "",
    valueDecimals: 1,
    customValueFormatter: (v) => `${v}`,
    gradient: ["#3366ff", "#00d4ff"],
    gradientAngle: 135,
    shadowBlur: 0,
    glow: false,
    innerStrokeWidth: 0,
    innerColor: "#fff",
    onClick: () => {},
    onHover: () => {},
    subtitle: "sub",
    tooltip: "tip",
  }),
  CircularChart: () => ({
    data: [
      { value: 30, label: "a", color: "#3366ff" },
      { value: 70, label: "b", color: "#ff6b6b" },
    ],
    size: 120,
    strokeWidth: 18,
    innerRadius: 40,
    rounded: true,
    cornerRadius: 4,
    startAngle: 0,
    endAngle: 360,
    animate: false,
    animationDuration: 0,
    onComplete: () => {},
    centerContent: "100%",
    showLabels: true,
    labelSize: 11,
    labelColor: "#333",
    onClick: () => {},
    onHover: () => {},
    defaultColors: ["#3366ff", "#ff6b6b"],
    shadowBlur: 0,
    glow: false,
    semiCircle: null,
    sliceBorderWidth: 2,
    sliceBorderColor: "#fff",
  }),
  Markdown: () => ({
    text: "# Title\n\n- a\n- b\n\n| x | y |\n|---|---|\n| 1 | 2 |\n\n> quote\n\n```js\nlet a = 1;\n```\n\n![img](x.png)",
    fontSize: 14,
    fontFamily: "sans-serif",
    lineHeight: 1.5,
    color: "#222",
    linkColor: "#3366ff",
    linkHoverColor: "#1a3fbf",
    linkUnderline: true,
    codeBgColor: "#f5f5f5",
    codeColor: "#c7254e",
    codeFontSize: 13,
    codeFontFamily: "monospace",
    codeBorderRadius: 4,
    codePadding: 4,
    preBgColor: "#111",
    preBorderRadius: 6,
    prePadding: 8,
    preMargin: 6,
    blockquoteBorderColor: "#ddd",
    blockquoteBorderWidth: 3,
    blockquoteColor: "#666",
    blockquotePadding: 8,
    blockquoteMargin: 6,
    tableBorderColor: "#ddd",
    tableHeaderBgColor: "#f2f2f2",
    tableCellPadding: 6,
    headingColor: "#111",
    headingMargin: 8,
    listMargin: 6,
    listPadding: 8,
    listItemMargin: 2,
    imageMaxWidth: "100%",
    imageBorderRadius: 8,
    padding: 8,
    maxHeight: 400,
    overflow: "auto",
    backgroundColor: "#fff",
    borderRadius: 8,
    allowDangerousHtml: false,
  }),
};

// Navigation components: mounted both expanded and collapsed where the layout
// branches, because a prop the widget only reads in one branch is invisible to
// a single mount.
const navigationConfigs = {
  AppBar: () => ({
    title: "App",
    leading: W.Icon({ name: "menu" }),
    actions: [W.Icon({ name: "search" }), W.Icon({ name: "more_vert" })],
    actionsGap: 10,
    backgroundColor: "#ffffff",
    titleColor: "#222",
    iconColor: "#555",
    elevation: 2,
    centerTitle: false,
    titleSize: 20,
    titleWeight: "600",
    showBackButton: true,
    onBackPress: () => {},
    margin: 0,
    padding: 8,
    borderRadius: 0,
    shadow: true,
    sticky: false,
    hideOnScroll: false,
    scrollThreshold: 100,
  }),
  DrawerLeft: () => ({
    header: T("head"),
    body: [T("row 1"), N.DrawerItem({ label: "home", route: "/" })],
    footer: T("foot"),
    position: "left",
    width: 260,
    onClose: () => {},
    onOpen: () => {},
    blur: true,
    blurIntensity: 4,
    bgColor: "#fff",
    elevation: 4,
    closeOnOverlayClick: true,
    closeOnEsc: true,
    borderRadius: 24,
    margin: 0,
  }),
  DrawerRight: () => ({
    header: T("head"),
    body: [T("row 2")],
    footer: T("foot"),
    position: "right",
    width: 240,
    borderRadius: 18,
    elevation: 2,
    blur: false,
  }),
  BottomNavigation: () => ({
    items: [
      { icon: "home", label: "Home", route: "/" },
      { icon: "person", label: "Me", route: "/me" },
    ],
    currentIndex: 0,
    onTabChange: () => {},
    backgroundColor: "#fff",
    selectedColor: "#3366ff",
    unselectedColor: "#888",
    showLabels: true,
    iconSize: 24,
    height: 65,
    margin: 0,
    borderRadius: 0,
    padding: 0,
    shadow: true,
    elevation: 2,
    useRouter: false,
  }),
  Tabs: () => ({
    tabs: [
      { label: "one", icon: "home", badge: 3 },
      { label: "two" },
    ],
    children: [T("p1"), T("p2")],
    activeIndex: 0,
    onChange: () => {},
    variant: "underline",
    size: "medium",
    color: "#3366ff",
    textColor: "#444",
    activeTextColor: "#fff",
    bgColor: "#f2f2f2",
    buttonColor: "#3366ff",
    fullWidth: true,
    showDivider: true,
    dividerColor: "#e0e0e0",
    showIcon: true,
    iconPosition: "left",
    iconSize: 18,
    badges: [1, null],
    alignment: "left",
  }),
  CollapsibleSideBarExpanded: () => ({
    children: T("side"),
    expanded: true,
    id: "side-a",
    widthExpanded: 260,
    widthCollapsed: 70,
    iconSize: 24,
    onToggle: () => {},
    bgColor: "#fff",
    borderRight: "1px solid #eee",
  }),
  CollapsibleSideBarCollapsed: () => ({
    children: T("side"),
    expanded: false,
    id: "side-b",
    widthExpanded: 220,
    widthCollapsed: 50,
    borderRight: "none",
  }),
  Scaffold: () => ({
    appBar: W.Text({ text: "bar" }),
    body: T("body"),
    bottomBar: W.Text({ text: "bottom" }),
    fab: W.Icon({ name: "add" }),
    leftNavBar: T("left"),
    leftNavBarWidth: 240,
    rightNavBar: T("right"),
    rightNavBarWidth: 220,
    basePath: "/",
    backgroundColor: "#fafafa",
    closeDrawerOnNavigate: true,
  }),
  AdaptiveScaffoldMobile: () => ({
    appBar: T("bar"),
    body: T("body"),
    bottomBar: T("bottom"),
    fab: W.Icon({ name: "add" }),
    leftNavBar: [T("nav")],
    leftNavBarWidth: 260,
    rightNavBar: T("right"),
    rightNavBarWidth: 200,
    forceMobile: true,
    backgroundColor: "#fff",
  }),
  AdaptiveScaffoldDesktop: () => ({
    appBar: T("bar"),
    body: T("body"),
    leftNavBar: [T("nav")],
    rightNavBar: T("right"),
    forceDesktop: true,
    backgroundColor: "#fff",
  }),
};

// Animation widgets: they forward `...rest` to their child, so an unregistered
// prop here reaches the engine too (this is how `willChange` was found).
const animationConfigs = {
  ParallaxBox: () => ({
    child: T("parallax"),
    type: "scroll",
    speed: 0.5,
    direction: "both",
    maxOffset: 40,
    reverse: false,
    disabled: false,
    onParallaxMove: () => {},
    duration: 300,
    easing: "ease-out",
  }),
  AnimatedBox: () => ({
    child: T("animated"),
    animations: [
      { effect: "opacity", from: 0, to: 1, duration: 200 },
      { effect: "translateY", from: 20, to: 0, duration: 200 },
    ],
    timing: "ease",
    delay: "0s",
    fillMode: "forwards",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
  AnimatedText: () => ({
    child: T("letters"),
    animations: [{ effect: "opacity", from: 0, to: 1, duration: 200 }],
    sameTime: false,
    delayBetween: 0.05,
    orientation: "row",
  }),
  MatrixRain: () => ({
    chars: "01",
    fontSize: 14,
    speed: 0.5,
    fadeAmount: 0.05,
    resetProbability: 0.975,
    useDynamicColor: false,
    position: "absolute",
    zIndex: 1,
  }),
};

const host = document.createElement("div");
host.style.cssText = "position:absolute;left:-9999px;top:0;width:800px;";
document.body.appendChild(host);

const mounted = [];
const errors = [];

// Components that render on demand: they return a controller object (or, for
// Drawer, an instance that already attached itself to `document.body`), so the
// element check below cannot apply to them.
const OBJECT_RETURNING = new Set([
  "SnackBar",
  "Modal",
  "BottomSheet",
  "AlertDialog",
  "Drawer",
]);

const baseName = (label) =>
  label.replace(/(Left|Right|Mobile|Desktop|Expanded|Collapsed)$/, "");

const mount = (label, el) => {
  try {
    if (el && el.nodeType === 1) {
      host.appendChild(el);
      mounted.push(label);
    } else if (el && el.element && el.element.nodeType === 1) {
      mounted.push(label);
    } else if (OBJECT_RETURNING.has(baseName(label))) {
      mounted.push(label);
    } else {
      errors.push({ name: label, detail: "did not return an element" });
    }
  } catch (err) {
    errors.push({ name: label, detail: String(err && err.message ? err.message : err) });
  }
};

for (const [name, build] of Object.entries(widgetConfigs)) {
  if (typeof W[name] !== "function") {
    errors.push({ name, detail: "not exported from widgets/index.js" });
    continue;
  }
  let el;
  try {
    el = W[name](build());
  } catch (err) {
    errors.push({ name, detail: String(err && err.message ? err.message : err) });
    continue;
  }
  mount(name, el);
}

for (const [label, build] of Object.entries(navigationConfigs)) {
  const name = baseName(label);
  const factory = N[name];
  if (typeof factory !== "function") {
    errors.push({ name: label, detail: "not exported from navigations/index.js" });
    continue;
  }
  let el;
  try {
    el = factory(build());
  } catch (err) {
    errors.push({ name: label, detail: String(err && err.message ? err.message : err) });
    continue;
  }
  mount(label, el);
}

for (const [name, build] of Object.entries(animationConfigs)) {
  const factory = A[name];
  if (typeof factory !== "function") {
    errors.push({ name, detail: "not exported from animations/index.js" });
    continue;
  }
  let el;
  try {
    el = factory(build());
  } catch (err) {
    errors.push({ name, detail: String(err && err.message ? err.message : err) });
    continue;
  }
  mount(name, el);
}

// `open()`-only controllers still need their full prop set to reach the DOM, so
// they are opened and closed again inside the off-screen host.
for (const [name, after] of [
  ["SnackBar", (el) => el?.open?.()],
  ["Modal", (el) => el?.open?.()],
  ["BottomSheet", (el) => el?.open?.()],
  ["AlertDialog", (el) => el?.open?.()],
]) {
  try {
    const el = W[name](widgetConfigs[name]());
    after(el);
    el?.close?.();
    mounted.push(`${name} (opened)`);
  } catch (err) {
    errors.push({
      name: `${name} (opened)`,
      detail: String(err && err.message ? err.message : err),
    });
  }
}

window.__FULLPROPS = { mounted, errors, probeProp: PROBE_PROP };

// Positive control. A silent "0 unknown props" result is only meaningful if the
// warning capture is actually armed, so one deliberate typo is mounted and the
// harness requires to see it reported. If this never fires, the capture is broken
// and the run fails instead of passing for the wrong reason.
try {
  const probe = W.Container({ [PROBE_PROP]: 1 });
  host.appendChild(probe);
  probe._cleanup?.();
  probe.remove();
} catch (e) {
  errors.push({ name: "probe", detail: String(e && e.message ? e.message : e) });
}

// Release everything: the harness must not leave timers or listeners behind for
// the next page in the suite.
setTimeout(() => {
  // A Drawer instance attaches itself to `document.body`, so it is outside
  // `host` and needs its own teardown.
  try {
    N.destroyDrawer?.();
  } catch (e) {
    /* nothing to destroy */
  }
  for (const node of Array.from(host.children)) {
    try {
      node._cleanup?.();
    } catch (e) {
      /* a widget without lifecycle hooks is not a failure here */
    }
    node.remove();
  }
  host.remove();
  window.__FULLPROPS_DONE = true;
}, 400);

export { host };
