WIDGET_DOCS = {
    "Tooltip": {
        "summary": "Wraps a child widget and shows a labeled overlay bubble on hover or focus. "
                   "The bubble is rendered as a portal on document.body so it is never clipped.",
        "when": "Use it to explain icons, buttons, or dense fields that cannot fit a visible label.",
        "related": ["Button", "Icon", "Text"],
        "tips": [
            "Attach it to any widget via child; the tooltip is a separate portal, so overflow hidden ancestors do not cut it off.",
            "delay controls how long the pointer must rest before the tooltip appears; lower it for dense toolbars, raise it for error-prone hints.",
            "The bubble keeps to the device's safe area, so a placement is a request: an edge with no room for it gets the opposite edge instead.",
        ],
        "accessibility": [
            "The wrapped child keeps its focus handlers, so keyboard users tabbing onto it get the same tooltip as mouse hover.",
            "On a device that cannot hover the bubble stays hidden. iOS answers the first tap with a synthetic mouseenter and never sends the matching mouseleave, so a tap-shown tooltip is a bubble nothing can dismiss. Anything a tooltip explains has to be explained by the control's own label too.",
        ],
        "behavior": [
            "The tooltip hides itself on window scroll or resize and removes its body portal plus listeners on unmount.",
            "The wrapped child gains showTooltip, hideTooltip, updateContent, and updatePosition helpers for imperative control.",
            "A pointer that leaves before the wait is over never shows the bubble: leaving clears the timer.",
            "tooltipDelay is the old name of delay and is deprecated: write delay. When both are given, delay wins.",
            "The requested position is a preference, not a promise: when the bubble would not fit between the trigger and the safe-area edge it is placed on the opposite side, and the arrow follows it.",
        ],
        "basic": '''const tip = Tooltip({
  text: "Copy to clipboard",
  child: Button({ text: "Copy" }),
});''',
        "normal": '''const tip = Tooltip({
  text: "Adds the item to your cart",
  position: "bottom",
  delay: 150,
  child: Icon({ name: "shopping_cart" }),
});''',
        "full": '''const tip = Tooltip({
  text: "Only visible to workspace admins",
  child: Button({ text: "Share", variant: "outlined" }),
  position: "right",
  delay: 300,
  offset: 12,
  maxWidth: 240,
  bgColor: "#111827",
  textColor: "#f9fafb",
  showArrow: true,
  textAlign: "left",
  borderRadius: 8,
  shadow: "0 4px 12px rgba(0,0,0,0.25)",
  animationDuration: 180,
});''',
    },
    "InstallButton": {
        "summary": "A floating button that appears only when the browser is ready to install "
                   "the app as a PWA. It wraps a standard Button and stays hidden otherwise.",
        "when": "Use it on a landing page when you want to offer an install prompt without the "
                "browser's default install UI.",
        "related": ["Button", "SnackBar", "Modal"],
        "tips": [
            "The button listens for the browser's beforeinstallprompt event and stays hidden until an install is actually offered.",
            "It takes the same text, variant, and size vocabulary as Button, since it renders one internally.",
            "Raise bottom to float the fixed button above a bottom navigation or dock.",
        ],
        "accessibility": [
            "Give it descriptive text like \"Install app\" rather than relying on an icon-only label, since the widget is a small floating control.",
        ],
        "behavior": [
            "It hides itself permanently when the app is installed and removes its window listeners plus the underlying button on unmount.",
            "onInstalled fires when the user accepts the browser prompt; onClick fires for every click regardless of install availability.",
        ],
        "basic": '''const install = InstallButton({
  text: "Install app",
});''',
        "normal": '''const install = InstallButton({
  text: "Install app",
  variant: "filled",
  bottom: 24,
  onInstalled: () => console.log("installed"),
});''',
        "full": '''const install = InstallButton({
  text: "Add to home screen",
  variant: "filled",
  size: "large",
  bottom: 32,
  borderRadius: 32,
  padding: "14px 28px",
  bgColor: "#2563eb",
  color: "#ffffff",
  onInstalled: () => console.log("installed"),
  onClick: () => console.log("clicked"),
});''',
    },
    "Video": {
        "summary": "Renders a native <video> element with proper media attributes and a "
                   "convenient playback API. Helpers for play, pause, stop, restart, and volume.",
        "when": "Use it to embed a clip, trailer, ambient background video, or lecture recording.",
        "related": ["Audio", "Image", "Card"],
        "tips": [
            "controls, loop, muted, and autoplay are set as element properties, not CSS, so they work even though they look like styling props.",
            "Browsers block autoplay with sound; pair autoplay: true with muted: true for a reliable ambient loop.",
            "The ref callback receives the element extended with playVideo, pauseVideo, stop, restart, volumeUp, and muteVideo helpers.",
        ],
        "accessibility": [
            "Keep controls: true so keyboard and screen-reader users can operate playback.",
        ],
        "behavior": [
            "playVideo swallows the browser's autoplay rejection instead of throwing, so it is safe to call from a click handler.",
        ],
        "basic": '''const clip = Video({
  src: "/media/intro.mp4",
});''',
        "normal": '''const clip = Video({
  src: "/media/intro.mp4",
  controls: true,
  width: "100%",
  height: 360,
  poster: "/media/intro-poster.jpg",
});''',
        "full": '''const clip = Video({
  src: "/media/demo.mp4",
  width: "100%",
  height: 480,
  controls: true,
  autoplay: false,
  loop: true,
  muted: true,
  poster: "/media/demo-poster.jpg",
  ref: (video) => video.playVideo(),
});''',
    },
    "Audio": {
        "summary": "A thin wrapper around the native <audio> element with reliable duration "
                   "detection, progress callbacks, and an imperative playback API. It can play "
                   "without visible controls.",
        "when": "Use it for background music, podcasts, or any audio player where you build your "
                "own transport controls.",
        "related": ["Video", "Slider", "Icon"],
        "tips": [
            "controls defaults to false, so set controls: true for the native player or build a custom one from the element's playback methods.",
            "onTimeUpdate receives (current, duration, percent) while onProgress receives only the percent, so pick the callback with the shape you need.",
            "Duration detection polls the element and can fall back to decoding the file with AudioContext when the browser reports an unknown duration.",
        ],
        "accessibility": [
            "When controls: false there is no visual affordance, so pair it with visible play/pause buttons for assistive technology users.",
        ],
        "behavior": [
            "onLoad fires exactly once, when the duration is first resolved, which can arrive after loadedmetadata for some formats.",
            "The duration polling interval is cleared on unmount, and the fetch-based duration fallback runs only if the duration is still unknown after two seconds.",
        ],
        "basic": '''const track = Audio({
  src: "/media/song.mp3",
});''',
        "normal": '''const track = Audio({
  src: "/media/song.mp3",
  controls: true,
  volume: 0.8,
  onEnd: () => console.log("finished"),
});''',
        "full": '''const track = Audio({
  src: "/media/podcast.mp3",
  autoplay: false,
  controls: false,
  loop: false,
  muted: false,
  volume: 0.7,
  onPlay: () => console.log("playing"),
  onPause: () => console.log("paused"),
  onTimeUpdate: (current, duration, percent) => console.log(percent),
  onLoad: (duration) => console.log(duration),
  ref: (audio) => audio.playAudio(),
});''',
    },
    "CircularBar": {
        "summary": "A circular or radial progress indicator drawn on canvas. It can show a "
                   "percentage or raw value, an optional label, gradients, glow, and markers.",
        "when": "Use it for scan-style progress, scores, budgets, or any gauge that benefits "
                "from a ring layout instead of a horizontal bar.",
        "related": ["CircularChart", "ProgressBar", "Rating"],
        "tips": [
            "Leave size unset to fill the parent width, or set size for a fixed square canvas.",
            "valueFormat accepts \"percent\", \"value\", or \"custom\"; customValueFormatter overrides how the number is rendered entirely.",
            "When valueFormat is \"value\", use valuePrefix and valueSuffix to render units like \"$\" or \"%\".",
        ],
        "accessibility": [
            "Canvas contents are invisible to assistive technology, so add a label or subtitle next to the bar to give the number context.",
        ],
        "behavior": [
            "With animate: true the sweep animates from zero and onComplete fires once it reaches the target value.",
            "Clicking the bar passes { value, max, percent } to onClick; hovering toggles the onHover boolean.",
            "When size is unset the canvas re-measures its container via ResizeObserver and releases the observer on unmount.",
        ],
        "basic": '''const progress = CircularBar({
  value: 72,
});''',
        "normal": '''const progress = CircularBar({
  value: 72,
  max: 100,
  size: 160,
  color: "#2563eb",
  backgroundColor: "#e5e7eb",
  showValue: true,
});''',
        "full": '''const progress = CircularBar({
  value: 820,
  max: 1000,
  size: 200,
  strokeWidth: 16,
  color: "#10b981",
  backgroundColor: "#e5e7eb",
  valueFormat: "value",
  valuePrefix: "$",
  valueDecimals: 0,
  label: "Revenue",
  subtitle: "this month",
  lineCap: "round",
  animate: true,
  animationDuration: 900,
  gradient: ["#34d399", "#059669"],
  onComplete: () => console.log("done"),
  onClick: (data) => console.log(data.percent),
});''',
    },
    "CircularChart": {
        "summary": "A pie or donut chart drawn on canvas with per-slice value, label, and color. "
                   "It supports rounded slices, semi-circles, center content, and entry animation.",
        "when": "Use it to show part-to-whole breakdowns such as traffic sources, spending, or "
                "task status distribution.",
        "related": ["CircularBar", "Chart", "Card"],
        "tips": [
            "Each slice is { value, label, color }; omit color to take colors from defaultColors in order.",
            "Set innerRadius for a donut, or widen strokeWidth relative to size to make a ring.",
            "semiCircle: \"top\" renders a half gauge and adjusts the canvas aspect to match.",
        ],
        "accessibility": [
            "Canvas slices are not read by screen readers; mirror the same data in text or a table legend beside the chart.",
        ],
        "behavior": [
            "centerContent accepts a string or a widget rendered in the donut hole.",
            "The hole is the page showing through, not a filled disc, so a donut reads as a ring on any surface.",
            "onHover receives (slice | null, index) as the pointer moves between slices, and onComplete fires when the entry sweep finishes.",
        ],
        "basic": '''const chart = CircularChart({
  data: [
    { value: 60, label: "Direct", color: "#2563eb" },
    { value: 40, label: "Referral", color: "#10b981" },
  ],
});''',
        "normal": '''const chart = CircularChart({
  data: [
    { value: 60, label: "Direct", color: "#2563eb" },
    { value: 25, label: "Search", color: "#f59e0b" },
    { value: 15, label: "Social", color: "#ef4444" },
  ],
  size: 200,
  strokeWidth: 24,
  showLabels: true,
});''',
        "full": '''const chart = CircularChart({
  data: [
    { value: 42, label: "Desktop", color: "#2563eb" },
    { value: 33, label: "Mobile", color: "#10b981" },
    { value: 25, label: "Tablet", color: "#f59e0b" },
  ],
  size: 240,
  strokeWidth: 28,
  innerRadius: 70,
  cornerRadius: 6,
  startAngle: -Math.PI / 2,
  animate: true,
  animationDuration: 800,
  showLabels: true,
  labelSize: 13,
  centerContent: "Traffic",
  sliceBorderWidth: 2,
  sliceBorderColor: "#ffffff",
  onHover: (slice, index) => console.log(slice?.label, index),
  onClick: (slice, index) => console.log(slice.label, index),
  onComplete: () => console.log("drawn"),
});''',
    },
    "Markdown": {
        "summary": "Renders markdown source as styled HTML with scoped CSS, syntax-highlighted "
                   "code blocks, copy buttons, tables, and blockquotes inside a scrollable surface.",
        "when": "Use it for documentation, changelogs, readmes, or any user-facing text authored "
                "in Markdown.",
        "related": ["Text", "CodeViewer", "Card"],
        "tips": [
            "text, source, and content are interchangeable aliases for the markdown source.",
            "Tune the palette with the per-instance props (codeBgColor, preBgColor, linkColor), and set maxHeight with overflow to keep long pages scrollable.",
            "Code blocks are syntax-highlighted and get a one-click copy action out of the box.",
        ],
        "accessibility": [
            "Keep link text descriptive; rendered links stay real anchors that the keyboard can tab to.",
            "Heading levels map to real h1-h6 elements, so keep the document hierarchy sensible.",
        ],
        "behavior": [
            "Generated styles are scoped to each instance, so several Markdown blocks never leak CSS into each other.",
            "Rendered HTML is sanitized before insert; allowDangerousHtml stays false by default for untrusted input.",
            "Inline code writes the palette's readable red, so 12px words clear 4.5:1 on the code plate in both themes.",
            "A link takes the palette's readable blue, because in light `primary` is the page's own ink and the link would vanish into the sentence.",
        ],
        "basic": '''const notes = Markdown({
  content: `# Hello

**FletBox** renders markdown.`,
});''',
        "normal": '''const readme = Markdown({
  content: `# Getting started

Edit the **props** and render.`,
  fontSize: 15,
  lineHeight: 1.7,
  linkColor: "#2563eb",
});''',
        "full": '''const guide = Markdown({
  content: `# Guide

- Install FletBox
- Write declarative UI`,
  fontSize: 16,
  lineHeight: 1.8,
  color: "#1f2937",
  linkColor: "#2563eb",
  codeBgColor: "#f3f4f6",
  preBgColor: "#111827",
  preBorderRadius: 8,
  blockquoteBorderColor: "#e5e7eb",
  tableHeaderBgColor: "#f9fafb",
  headingColor: "#111827",
  padding: 16,
  borderRadius: 12,
  backgroundColor: "#ffffff",
  maxHeight: 480,
  overflow: "auto",
});''',
    },
    "AnimatedBox": {
"summary": "Wraps a single child and plays a sequence of CSS animations described by "
           "effect/from/to steps. It handles keyframes, timing, and fill mode for you.",
        "when": "Use it to animate a widget's position, transform, color, or size without "
                "hand-writing CSS keyframes.",
        "related": ["AnimatedText", "Text", "Container"],
        "tips": [
            "A step is `{ effect, from, to }`, where the effect is one of `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skewX`, `skewY`, `translateX`, `translateY`, `translateZ`, `opacity`, `color`, `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`, `width`, `height`, `boxShadow`, `background` or `textGradient` (the margin and padding steps work as well). A name outside that list does nothing, silently.",
            "Each step's `duration`, `delay` and `loop` are read off **that step**: a 600 ms `scale` and a 400 ms `opacity` in one entrance run together for 600 ms, with the fade holding from 400 ms on. Times are milliseconds as a number (`duration: 400`) or a CSS time as a string (`delay: \"0.4s\"`); a bare number as a `delay` used to make the whole `animation` shorthand invalid, which read as the widget not animating at all.",
            "`reverse: true` makes a step swing back to `from` instead of holding `to`; with `loop: true` it breathes.",
            "A looping step and a one-shot step cannot share one `@keyframes` rule — repeating the rule repeats the entrance — so they are generated as two rules. Two rules cannot compose one `transform`, so keep every transform step in one group: mixing a looping `rotate` with a one-shot `translateY` moves only one of them, and the widget warns about it.",
            "A length is a framework unit, not a pixel: `translateY: 20` is `20 / base-font-size` rem, so the movement grows with the reader's font like the rest of the UI.",
            "`top`, `right`, `bottom` and `left` are forwarded to the child's dataset as positioning hints for layout systems.",
        ],
        "accessibility": [
            "Nothing to do here: the engine reads `prefers-reduced-motion` and the [motion mode](../tools/animation.md#reduced-motion), and a looping or entering step collapses to one frame that lands on its `to` values, so content is never held invisible behind an animation the reader refused.",
        ],
        "behavior": [
            "Every step's `from` is written on the element before its rule starts, including the ones that begin later — so there is no flash of the final state before the keyframes run, and no flash of the *first* step's end while a delayed step waits.",
            "Generated `@keyframes` are named by their content and injected once, so a sequence repeated — or one word staggered across `AnimatedText` letters — reuses one rule instead of adding a `<style>` per call.",
        ],
        "basic": '''const badge = AnimatedBox({
  child: Text({ text: "Hello" }),
  animations: [{ effect: "scale", from: 1, to: 1.2 }],
});''',
        "normal": '''const hero = AnimatedBox({
  child: Card({ child: Text({ text: "FletBox" }) }),
  animations: [
    { effect: "opacity", from: 0, to: 1 },
    { effect: "translateY", from: 20, to: 0 },
  ],
  timing: "ease-out",
});''',
        "full": '''const toast = AnimatedBox({
  child: Text({ text: "Saved" }),
  // Each step keeps its own clock: the fade is over while the lift is still moving.
  animations: [
    { effect: "opacity", from: 0, to: 1, duration: 200 },
    { effect: "translateY", from: 16, to: 0, duration: 400, delay: 120 },
    { effect: "backgroundColor", from: "#fef3c7", to: "#ffffff", duration: 600 },
  ],
  timing: "ease-out",
  delay: 200,
  fillMode: "forwards",
  top: 16,
  right: 16,
});''',
    },
    "AnimatedText": {
        "summary": "Splits a Text widget into individual characters and animates each one, "
                   "optionally staggering the start of every letter for a cascade effect.",
        "when": "Use it for headline entrances, logo reveals, or any place letter-by-letter motion "
                "adds polish.",
        "related": ["AnimatedBox", "Text", "Container"],
        "tips": [
            "`child` must be a Text widget, because its text is split into single-character widgets that inherit the original props.",
            "Set `sameTime: false` and control `delayBetween` to create a wave; use `sameTime: true` for a synchronized pop. `delayBetween` is in **seconds** — `0.05` staggers the letters 50 ms apart, while `5` is a five-second wait per character.",
            "The letters share one generated `@keyframes` rule and each carries its own delay, so a staggered headline costs one rule, not one per character.",
            "`orientation: \"column\"` stacks the letters vertically for vertical-word effects.",
            "Each step is [AnimatedBox's](AnimatedBox.md) step, so a per-letter `duration` belongs to the step, not to the widget.",
        ],
        "accessibility": [
            "The animated letters remain ordinary text, so screen readers still read the full word; avoid animating for longer than a moment.",
        ],
        "behavior": [
            "Spaces are rendered as fixed-width spacers rather than animated characters, keeping word breaks intact.",
            "If animations is empty the original child is returned unchanged, so you can branch cheaply.",
        ],
        "basic": '''const title = AnimatedText({
  child: Text({ text: "FletBox" }),
  animations: [{ effect: "translateY", from: 16, to: 0 }],
});''',
        "normal": '''const title = AnimatedText({
  child: Text({ text: "Hello world" }),
  animations: [{ effect: "opacity", from: 0, to: 1 }],
  sameTime: false,
  delayBetween: 0.08,
});''',
        "full": '''const title = AnimatedText({
  child: Text({ text: "Welcome" }),
  animations: [
    { effect: "scale", from: 0.5, to: 1 },
    { effect: "rotate", from: -8, to: 0 },
  ],
  sameTime: true,
  orientation: "column",
});''',
    },
    "MatrixRain": {
        "summary": "A canvas-based Matrix-style effect where random characters cascade down the "
                   "screen. It runs a continuous animation loop with configurable speed and fade.",
        "when": "Use it as a full-viewport backdrop or an ambient section background for a "
                "retro-tech aesthetic.",
        "related": ["Container", "Card", "AnimatedBox"],
        "tips": [
            "position: \"fixed\" fills the viewport; \"absolute\" fills a positioned parent instead.",
            "Set zIndex low (1 or negative) so the rain renders behind your regular UI.",
            "Tune resetProbability closer to 1 to make trails longer or drops rarer.",
        ],
        "accessibility": [
            "The rain is decorative canvas output; pair it with real content on top and make it pausable for motion-sensitive users.",
        ],
        "behavior": [
            "The returned canvas runs its animation loop immediately and exposes _cleanup() to stop drawing and disconnect the ResizeObserver.",
            "Changing speed or fadeAmount only affects future frames; update them before mount for a clean start.",
        ],
        "basic": '''const rain = MatrixRain({});''',
        "normal": '''const rain = MatrixRain({
  fontSize: 18,
  speed: 0.6,
  position: "fixed",
});''',
        "full": '''const rain = MatrixRain({
  chars: "01",
  fontSize: 20,
  speed: 0.8,
  fadeAmount: 0.08,
  resetProbability: 0.98,
  useDynamicColor: true,
  position: "fixed",
  zIndex: 1,
});''',
    },
    "ParallaxBox": {
        "summary": "A container that shifts its child in response to scroll, mouse position, or "
                   "hover entry. It clamps movement to a max offset and eases with a transition.",
        "when": "Use it to give hero sections or layered illustrations depth as the user scrolls "
                "or moves the pointer.",
        "related": ["AnimatedBox", "Image", "Container"],
        "tips": [
            "type: \"scroll\" follows the window scroll; \"mouse\" tracks the pointer relative to the widget center; \"hover\" snaps on entry and resets on leave.",
            "Raise speed for a more pronounced shift, and keep maxOffset small so content never strays far from its layout box.",
            "Use reverse: true to invert the direction when the natural movement feels wrong.",
        ],
        "accessibility": [
            "Parallax is decorative motion; make sure content stays readable without it and keep movement gentle.",
        ],
        "behavior": [
            "The exposed element provides updateSpeed, updateDirection, setPosition, and reset for runtime control.",
            "Transforms are clamped to maxOffset and cleaned up via _cleanup(), which removes all event listeners on destroy.",
        ],
        "basic": '''const scene = ParallaxBox({
  child: Text({ text: "Scroll me" }),
});''',
        "normal": '''const scene = ParallaxBox({
  child: Image({ src: "/artwork.jpg", alt: "Layer 1" }),
  type: "scroll",
  speed: 0.6,
});''',
        "full": '''const scene = ParallaxBox({
  child: Image({ src: "/team/hero.png", alt: "Hero layer" }),
  type: "mouse",
  speed: 0.4,
  direction: "both",
  maxOffset: 40,
  reverse: true,
  duration: 250,
  easing: "ease-out",
  onParallaxMove: (offset) => console.log(offset.x, offset.y),
});''',
    },
    "Maps": {
        "summary": "An interactive map — pan, zoom, markers and polylines — with no map library "
                   "behind it. The Web Mercator projection and the XYZ tile grid are implemented "
                   "inside the widget, so any provider that answers `{z}/{x}/{y}` works and nothing "
                   "needs an API key, a CDN or a build step.",
        "when": "Use it to show a venue, plot delivery stops, draw a route, or let a picker return a coordinate.",
        "related": ["Card", "Button", "ListView", "Image"],
        "tips": [
            "The default tile server is OpenStreetMap and its credit line renders by default; when "
            "you change tileUrl, change attribution in the same breath.",
            "Match maxZoom to the provider. Asking level 20 from a server that stops at 18 shows the "
            "offline notice instead of a map.",
            "`locate()` takes `{ timeout, maximumAge, highAccuracy, setCenter, zoom }`. Desktop "
            "laptops can need more than the 10 s default for a first fix, and a slow fix (code 3) "
            "is not the same failure as a denied permission (code 1) — branch on "
            "`error.code` in the rejected handler instead of reporting one generic error.",
            "Give markers an id: the pin node is then reused across updates instead of rebuilt, which "
            "matters for a list that moves often.",
            "`setMarker({id, ...})` replaces the pin with that id instead of stacking another under it "
            "— that is the call to make on every GPS fix, and `addMarker()` is the one that grows the "
            "list forever. The reused node restates what it shows, so a new `label`, `color` or "
            "`rotation` reaches the screen, the tooltip and the accessibility name.",
            "`rotation` is degrees clockwise from north, the compass convention `onUserUpdate` reports "
            "as `fix.heading`. The pin turns around its own tip, so the point it marks never moves, and "
            "its caption stays upright to read.",
            "`clickable: false` makes a pin transparent to the pointer: the tap reaches `onMapClick` "
            "with the coordinate under it. A vehicle drawn at the centre of the view would otherwise "
            "cover that whole spot, and every attempt to pick a pick-up point would answer with the car.",
            "A polyline needs two usable points; `addPolyline()` returns null for one-point input "
            "rather than drawing a speck that looks like a broken route. Lines are stroked on a canvas "
            "above the tiles and below the pins, so a long route costs no DOM nodes — but it also means "
            "a line is not clickable; put an invisible marker on each stop you want tappable.",
            "`fitBounds(pointList)` frames a route in one call: pass the coordinates and it picks the "
            "zoom and centre. Feed it the geometry an OSRM or GraphHopper reply returns, and keep the "
            "distance and duration from that same reply for the readout.",
            "A track grows by re-passing `polylines` with the fixes collected so far, or by keeping one "
            "line with an id and calling `update()`. `onUserUpdate` is the source of those fixes: it "
            "fires for every watched position, following or not.",
            "`followUser` is a different promise from `showUserLocation`: it recentres the view on every "
            "fix and asks the browser for fresh high-accuracy ones, so it is the option that costs "
            "battery. Turn it off when the user pans away to look at something else.",
            "The widget defaults to 400 tall and full width. Any size you give it is fine — a "
            "ResizeObserver repaints the tiles when the box changes.",
            "Wheel zoom is one level per gesture and follows the cursor, so a long trackpad flick "
            "does not throw the view across the world.",
        ],
        "accessibility": [
            "The map is focusable and keyboard-driven: arrows pan, + and - zoom, and the ± buttons "
            "carry aria-labels.",
            "Each marker is a real button, so it is reachable with Tab and announced with its label.",
            "A map cannot be read by a screen reader, so keep the same places in a list next to it.",
        ],
        "behavior": [
            "Tiles are pooled per zoom level and the previous level is kept until the new one is on "
            "screen, so a zoom step never flashes an empty grid.",
            "onMoveEnd is debounced — it fires once the view settles, not on every pan frame.",
            "Lines are redrawn from their geographic points on every frame, so a polyline follows the "
            "pan and the zoom instead of being pinned to the screen. A line whose bounding box misses "
            "the viewport is skipped before any coordinate is projected.",
            "Whether a press was a drag is judged by how far the pointer ended up from the point it went down on, not by the length of the path it walked: a trembling finger keeps its click and never nudges the view.",
            "A press on a pin answers onMarkerClick only; the map never reports the same press twice.",
            "A press on the widget's own chrome — the ± buttons or the credit link — is not a click on "
            "the map underneath, so onMapClick reports only the bare map surface.",
            "Props bound with useState patch this widget alone — the map subscribes to the key and "
            "redraws without re-rendering the app.",
            "Nothing is fetched until the widget enters the DOM; unmount cancels the frame, the "
            "observer and the geolocation watch.",
            "When every visible tile fails, a notice appears over the map instead of a blank panel.",
        ],
        "basic": '''const place = Maps({
  center: [40.4168, -3.7038],
  zoom: 12,
});''',
        "normal": '''const stops = Maps({
  center: [40.4168, -3.7038],
  zoom: 13,
  height: 420,
  markerColor: colors.primary,
  polylineColor: colors.primary,
  markers: [
    { position: [40.4168, -3.7038], label: "Sol" },
    { position: [40.4308, -3.693], label: "Chueca", color: "#0ea5e9" },
  ],
  polylines: [
    [[40.4168, -3.7038], [40.424, -3.698], [40.4308, -3.693]],
  ],
  onMarkerClick: (marker) => pick(marker),
});''',
        "full": '''const picker = Maps({
  center: [40.4168, -3.7038],
  zoom: 14,
  minZoom: 5,
  maxZoom: 18,
  height: 480,
  borderRadius: 12,
  tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap contributors",
  showAttribution: true,
  showZoomControl: true,
  interactive: true,
  scrollZoom: true,
  doubleClickZoom: true,
  showUserLocation: true,
  followUser: false,
  markers: stops.map((stop) => ({ id: stop.id, position: stop.at, label: stop.name })),
  polylines: [
    { id: "route", points: route.geometry, color: colors.primary, width: 5 },
    { id: "track", points: breadcrumbs, dashed: true, opacity: 0.7 },
  ],
  onMapClick: (point) => setPicked(point),
  onMarkerClick: (marker) => setPicked(marker.position),
  onMoveEnd: (view) => saveView(view),
  onUserUpdate: (fix) => breadcrumbs.push([fix.lat, fix.lng]),
});

picker.fitBounds(route.geometry);
picker.addMarker({ position: [40.42, -3.7], label: "Dropped" });
picker.setMarker({ id: "taxi", position: [40.42, -3.7], rotation: 128, clickable: false });
picker.addPolyline({ id: "leg", points: [picked, stop.at] });
picker.locate();
picker.setFollowUser(true);''',
    },
}
