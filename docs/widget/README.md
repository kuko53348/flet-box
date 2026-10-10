# Widgets: the FletBox book

This directory is a book. Read it in order to go from your first widget to complete, data-rich compositions. Every page links to the previous and next page, so you can follow it like a tutorial — or jump straight to a widget from the alphabetical index below.

If you have never used FletBox, begin with [Start here](START_HERE.md), then follow the reading path.

## How to read this book

- Chapters go from **basic to advanced**. Read them top to bottom the first time.
- Every widget page ends with a **Continue reading** block: previous page, next page, and a link back here.
- Every widget also accepts the [common props](COMMON_PROPS.md) — layout, spacing, color, typography, borders, events and aliases.
- Related widgets at the bottom of each page are clickable, so you can branch off whenever you are curious.

Related guides: [Build your first FletBox app](../guides/app-templates.md) · [Routing with FletBox](../guides/router.md) · [FletBox CLI](../cli/README.md).

## The reading path

### Chapter 1 · First steps: the core mental model

_layout and the core mental model_

1. [Text](Text.md) — Renders a string as inline text or as a heading, with control over size, weight, color, alignment, and inline styles.
2. [Container](Container.md) — General-purpose surface box
3. [Row](Row.md) — Horizontal flex layout that places its children side by side
4. [Column](Column.md) — Vertical flex layout that stacks its children one below another
5. [Stack](Stack.md) — Overlay container that lets children occupy the same box
6. [Icon](Icon.md) — Material icon glyph rendered as a span
7. [Image](Image.md) — Renders an image element from a URL or path

### Chapter 2 · Interaction basics

_the widgets users click and type into_

8. [Button](Button.md) — Interactive button with filled, outlined, and text variants, size presets, optional icons, and press feedback.
9. [Input](Input.md) — A text field that handles labels, placeholder text, input types, icons, validation, and change events in one widget.
10. [Checkbox](Checkbox.md) — A square checkbox with a check mark that represents an independent true/false choice.
11. [Radio](Radio.md) — A single-selection control that renders a circular radio button
12. [Switch](Switch.md) — An iOS-style toggle switch with a sliding knob that represents an on/off state.
13. [Slider](Slider.md) — A draggable range input that selects a numeric value along a track between min and max.
14. [Dropdown](Dropdown.md) — A select control that shows the current choice and opens a menu of options when clicked.
15. [Rating](Rating.md) — A row of star icons that captures or displays a score up to max

### Chapter 3 · Layout, cards and lists

_cards, lists, grids and content rows_

16. [Card](Card.md) — A rounded, optionally elevated surface that groups related content into a single tappable unit.
17. [Divider](Divider.md) — A thin horizontal or vertical line that separates sections of content
18. [ListTile](ListTile.md) — A single row with leading, title, subtitle, and trailing slots
19. [ListView](ListView.md) — Virtualized scrollable list that keeps only the visible rows plus a buffer in the DOM, so large datasets stay responsive.
20. [GridView](GridView.md) — Grid layout built on ListView's virtualization
21. [Avatar](Avatar.md) — A compact identity chip that shows a profile image, the person's initials, or a fallback icon
22. [Badge](Badge.md) — Wraps a child widget and overlays a small count or status marker at one of its corners
23. [Chip](Chip.md) — A compact, pill-shaped label for tags, filters, and selections

### Chapter 4 · Feedback and overlays

_dialogs, sheets, notifications and progress_

24. [AlertDialog](AlertDialog.md) — A pre-styled confirmation dialog built on Modal, with a variant icon, message and confirm/cancel buttons.
25. [Modal](Modal.md) — A centered dialog over a dimmed overlay that holds a title, content and a row of actions.
26. [BottomSheet](BottomSheet.md) — A panel that slides up from the bottom of the screen over a dimmed overlay.
27. [SnackBar](SnackBar.md) — A transient toast that appears at the edge of the screen, reports a short message, and dismisses itself.
28. [Tooltip](Tooltip.md) — Wraps a child widget and shows a labeled overlay bubble on hover or focus
29. [ProgressBar](ProgressBar.md) — A horizontal bar that visualizes completion from zero to max
30. [CircularBar](CircularBar.md) — A circular or radial progress indicator drawn on canvas
31. [Skeleton](Skeleton.md) — Renders animated placeholder blocks that stand in for content while it loads
32. [FloatingActionButton](FloatingActionButton.md) — A circular, elevated button that floats over content and can expand into a labeled pill.
33. [Pagination](Pagination.md) — Renders page controls derived from totalItems and pageSize, with optional first/last and prev/next buttons

### Chapter 5 · Navigation and flows

_multi-step flows, trees and rotating content_

34. [Stepper](Stepper.md) — A multi-step progress indicator that shows each step as a circle, number or icon and reveals the active step's content.
35. [Accordion](Accordion.md) — A collapsible panel that hides a title bar with expandable content beneath it
36. [TreeView](TreeView.md) — Renders a collapsible hierarchy from nodes, each with an id, label, optional icon, badge and children
37. [Carousel](Carousel.md) — Cycles through items one at a time with optional arrows, dots and autoplay
38. [InstallButton](InstallButton.md) — A floating button that appears only when the browser is ready to install the app as a PWA

### Chapter 6 · Data, rich content & effects

_tables, charts, rich text, ads and motion_

39. [DataTable](DataTable.md) — Renders tabular rows using a columns definition, with optional striping, hover and borders
40. [Chart](Chart.md) — Draws bar, line, area or candlestick data onto a canvas, with optional labels, grid and value annotations
41. [CircularChart](CircularChart.md) — A pie or donut chart drawn on canvas with per-slice value, label, and color
42. [Markdown](Markdown.md) — Renders markdown source as styled HTML with scoped CSS, syntax-highlighted code blocks, copy buttons, tables, and blockquotes inside a scrollable surface.
43. [CodeViewer](CodeViewer.md) — Shows a read-only code block with an optional header, line numbers and scrolling for long files
44. [QRCode](QRCode.md) — Renders a scannable QR image for a string value
45. [Inspector](Inspector.md) — Renders a read-only tree that drills into a widget's props, children and element structure
46. [AdSense](AdSense.md) — Google AdSense display unit for the web
47. [AdMob](AdMob.md) — Google AdMob banner and full-screen ads for native Capacitor builds
48. [AnimatedBox](AnimatedBox.md) — Wraps a single child and plays a sequence of CSS animations described by effect/from/to steps
49. [AnimatedText](AnimatedText.md) — Splits a Text widget into individual characters and animates each one, optionally staggering the start of every letter for a cascade effect.
50. [MatrixRain](MatrixRain.md) — A canvas-based Matrix-style effect where random characters cascade down the screen
51. [ParallaxBox](ParallaxBox.md) — A container that shifts its child in response to scroll, mouse position, or hover entry

### Chapter 7 · Media and drag & drop

_audio, video and drag-and-drop_

52. [Audio](Audio.md) — A thin wrapper around the native <audio> element with reliable duration detection, progress callbacks, and an imperative playback API
53. [Video](Video.md) — Renders a native <video> element with proper media attributes and a convenient playback API
54. [DraggBox](DraggBox.md) — Wraps a child so it can be dragged with the native drag-and-drop API
55. [DroppBox](DroppBox.md) — A drop target for DraggBox items

### Chapter 8 · App navigation

_Build the shell of a real application and wire it to the router._

56. [Scaffold](Scaffold.md) — the app shell: app bar, body, drawer, side bars
57. [AdaptiveScaffold](AdaptiveScaffold.md) — the same shell, adapted to phone and desktop
58. [AppBar](AppBar.md) — a top bar for titles, actions, and back navigation
59. [Drawer](Drawer.md) — a panel that slides in from the side
60. [DrawerItem](DrawerItem.md) — a router-aware row for a drawer or side bar
61. [BottomNavigation](BottomNavigation.md) — a bottom tab bar synced with the router
62. [Tabs](Tabs.md) — switch panes inside a screen
63. [CollapsibleSideBar](CollapsibleSideBar.md) — a side panel that collapses to icons

Then continue with [State, Router & Services](../guides/state.md) — Chapter 9.

## Alphabetical index

- [Accordion](Accordion.md)
- [AdMob](AdMob.md)
- [AdSense](AdSense.md)
- [AdaptiveScaffold](AdaptiveScaffold.md)
- [AlertDialog](AlertDialog.md)
- [AnimatedBox](AnimatedBox.md)
- [AnimatedText](AnimatedText.md)
- [AppBar](AppBar.md)
- [Audio](Audio.md)
- [Avatar](Avatar.md)
- [Badge](Badge.md)
- [BottomNavigation](BottomNavigation.md)
- [BottomSheet](BottomSheet.md)
- [Button](Button.md)
- [Card](Card.md)
- [Carousel](Carousel.md)
- [Chart](Chart.md)
- [Checkbox](Checkbox.md)
- [Chip](Chip.md)
- [CircularBar](CircularBar.md)
- [CircularChart](CircularChart.md)
- [CodeViewer](CodeViewer.md)
- [CollapsibleSideBar](CollapsibleSideBar.md)
- [Column](Column.md)
- [Container](Container.md)
- [DataTable](DataTable.md)
- [Divider](Divider.md)
- [DraggBox](DraggBox.md)
- [Drawer](Drawer.md)
- [DrawerItem](DrawerItem.md)
- [Dropdown](Dropdown.md)
- [DroppBox](DroppBox.md)
- [FloatingActionButton](FloatingActionButton.md)
- [GridView](GridView.md)
- [Icon](Icon.md)
- [Image](Image.md)
- [Input](Input.md)
- [Inspector](Inspector.md)
- [InstallButton](InstallButton.md)
- [ListTile](ListTile.md)
- [ListView](ListView.md)
- [Markdown](Markdown.md)
- [MatrixRain](MatrixRain.md)
- [Modal](Modal.md)
- [Pagination](Pagination.md)
- [ParallaxBox](ParallaxBox.md)
- [ProgressBar](ProgressBar.md)
- [QRCode](QRCode.md)
- [Radio](Radio.md)
- [Rating](Rating.md)
- [Row](Row.md)
- [Scaffold](Scaffold.md)
- [Skeleton](Skeleton.md)
- [Slider](Slider.md)
- [SnackBar](SnackBar.md)
- [Stack](Stack.md)
- [Stepper](Stepper.md)
- [Switch](Switch.md)
- [Tabs](Tabs.md)
- [Text](Text.md)
- [Tooltip](Tooltip.md)
- [TreeView](TreeView.md)
- [Video](Video.md)

