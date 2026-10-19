# Maps

An interactive map — pan, zoom, markers and polylines — with no map library behind it. The Web Mercator projection and the XYZ tile grid are implemented inside the widget, so any provider that answers `{z}/{x}/{y}` works and nothing needs an API key, a CDN or a build step.

## When to use it

Use it to show a venue, plot delivery stops, draw a route, or let a picker return a coordinate.

## Quick start

```javascript
import { Maps } from "flet-box";

const place = Maps({
  center: [40.4168, -3.7038],
  zoom: 12,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `center` | `LatLng` | View centre as `[lat, lng]`, `{lat, lng}` or `{latitude, longitude}`. |
| `zoom` | `number` | Integer zoom level: `0` shows the whole world, each step doubles the scale. |
| `minZoom` | `number` | Lowest zoom level the user can reach. |
| `maxZoom` | `number` | Highest zoom level the user can reach, usually the provider's last tile level. |
| `markers` | `Array<MapMarker \| LatLng>` | Pins to draw: bare positions or `{position, label, color, id, data}` records. |
| `markerColor` | `Color` | Colour of the pins that do not set a `color` of their own. |
| `polylines` | `Array<MapPolyline \| LatLng[]>` | Stroked paths: bare position lists or `{points, color, width, opacity, dashed, id}` records. |
| `polylineColor` | `Color` | Stroke of the lines that do not set a `color` of their own. |
| `tileUrl` | `string` | `{z}/{x}/{y}` tile template of the provider. |
| `attribution` | `string` | Credit line shown in the corner; most tile providers require one. |
| `showAttribution` | `boolean` | Shows the credit line. |
| `showZoomControl` | `boolean` | Shows the ± zoom buttons in the top-right corner. |
| `interactive` | `boolean` | Lets the user pan and zoom. When false, only the imperative API moves the view. |
| `scrollZoom` | `boolean` | Zooms with the mouse wheel, centred on the cursor. |
| `doubleClickZoom` | `boolean` | Zooms on double-click; `Shift` + double-click zooms out. |
| `showUserLocation` | `boolean` | Draws the browser's position; asks for permission on the first paint. |
| `followUser` | `boolean` | Keeps the view centred on the browser's position, asking for fresh high-accuracy fixes. |
| `onMapClick` | `(point: MapClick, event: PointerEvent) => void` | Fired with `{ lat, lng, zoom }` when the map is clicked without panning. |
| `onMarkerClick` | `(marker: MapMarker, event: MouseEvent) => void` | Fired with the clicked marker. |
| `onMoveEnd` | `(state: MapState) => void` | Fired with `{ center, zoom, bounds }` once the view stops changing. |
| `onUserUpdate` | `(fix: MapFix) => void` | Fired with `{ lat, lng, accuracy }` on each position the watcher reports. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `id` | `string` | DOM `id` for the rendered element. |
| `className` | `string` | CSS class names applied to the rendered element. |
| `ref` | `(widget: Widget) => void` | Callback that receives the underlying DOM node. |
| `disableTransform` | `boolean` | Disables the default press/scale transform animation. |

## Examples

### Everyday

```javascript
import { Maps, colors } from "flet-box";

const stops = Maps({
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
});
```

### Full

```javascript
import { Maps, colors } from "flet-box";

const picker = Maps({
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
picker.addPolyline({ id: "leg", points: [picked, stop.at] });
picker.locate();
picker.setFollowUser(true);
```

## Tips

- The default tile server is OpenStreetMap and its credit line renders by default; when you change tileUrl, change attribution in the same breath.
- Match maxZoom to the provider. Asking level 20 from a server that stops at 18 shows the offline notice instead of a map.
- `locate()` takes `{ timeout, maximumAge, highAccuracy, setCenter, zoom }`. Desktop laptops can need more than the 10 s default for a first fix, and a slow fix (code 3) is not the same failure as a denied permission (code 1) — branch on `error.code` in the rejected handler instead of reporting one generic error.
- Give markers an id: the pin node is then reused across updates instead of rebuilt, which matters for a list that moves often.
- A polyline needs two usable points; `addPolyline()` returns null for one-point input rather than drawing a speck that looks like a broken route. Lines are stroked on a canvas above the tiles and below the pins, so a long route costs no DOM nodes — but it also means a line is not clickable; put an invisible marker on each stop you want tappable.
- `fitBounds(pointList)` frames a route in one call: pass the coordinates and it picks the zoom and centre. Feed it the geometry an OSRM or GraphHopper reply returns, and keep the distance and duration from that same reply for the readout.
- A track grows by re-passing `polylines` with the fixes collected so far, or by keeping one line with an id and calling `update()`. `onUserUpdate` is the source of those fixes: it fires for every watched position, following or not.
- `followUser` is a different promise from `showUserLocation`: it recentres the view on every fix and asks the browser for fresh high-accuracy ones, so it is the option that costs battery. Turn it off when the user pans away to look at something else.
- The widget defaults to 400 tall and full width. Any size you give it is fine — a ResizeObserver repaints the tiles when the box changes.
- Wheel zoom is one level per gesture and follows the cursor, so a long trackpad flick does not throw the view across the world.

## Accessibility

- The map is focusable and keyboard-driven: arrows pan, + and - zoom, and the ± buttons carry aria-labels.
- Each marker is a real button, so it is reachable with Tab and announced with its label.
- A map cannot be read by a screen reader, so keep the same places in a list next to it.

## Behavior

- Tiles are pooled per zoom level and the previous level is kept until the new one is on screen, so a zoom step never flashes an empty grid.
- onMoveEnd is debounced — it fires once the view settles, not on every pan frame.
- Lines are redrawn from their geographic points on every frame, so a polyline follows the pan and the zoom instead of being pinned to the screen. A line whose bounding box misses the viewport is skipped before any coordinate is projected.
- A press that moved the map more than a few pixels is a drag, so onMapClick stays quiet.
- A press on a pin answers onMarkerClick only; the map never reports the same press twice.
- A press on the widget's own chrome — the ± buttons or the credit link — is not a click on the map underneath, so onMapClick reports only the bare map surface.
- Props bound with useState patch this widget alone — the map subscribes to the key and redraws without re-rendering the app.
- Nothing is fetched until the widget enters the DOM; unmount cancels the frame, the observer and the geolocation watch.
- When every visible tile fails, a notice appears over the map instead of a blank panel.

## Related widgets

- [Card](Card.md)
- [Button](Button.md)
- [ListView](ListView.md)
- [Image](Image.md)

---

## Continue reading

- **Previous:** [Video](Video.md)
- **Next:** [DraggBox](DraggBox.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 7 · Media and drag & drop** (3 of 5).
