// Chapter 7 doc-verification probe fragment.
// Asserts the documented behavior of: Audio, Video, Maps, DraggBox, DroppBox.
import { useState } from "../src/tools/useState.js";

export default function run(ctx) {
  const { t, eq, cs, mount, W } = ctx;
  // W = widget namespace; t(name, fn); eq(actual, expected, msg?); cs(el)=getComputedStyle; mount(el) appends off-screen & returns el

  // ---------------- Audio ----------------
  t("Audio: renders a native <audio> element", () => {
    const e = mount(W.Audio({ src: "" }));
    eq(e.tagName, "AUDIO");
  });

  t("Audio: src is forwarded to the element attribute", () => {
    const e = mount(W.Audio({ src: "clip.mp3" }));
    eq(e.getAttribute("src"), "clip.mp3");
  });

  t("Audio: controls defaults false, honors true", () => {
    eq(W.Audio({ src: "" }).controls, false);
    eq(W.Audio({ src: "", controls: true }).controls, true);
  });

  t("Audio: preload is always metadata; volume defaults 1 and forwards", () => {
    eq(W.Audio({ src: "" }).preload, "metadata");
    eq(W.Audio({ src: "" }).volume, 1);
    eq(W.Audio({ src: "", volume: 0.5 }).volume, 0.5);
  });

  t("Audio: muted/loop/autoplay applied as element properties", () => {
    const e = W.Audio({ src: "", muted: true, loop: true, autoplay: true });
    eq(e.muted, true);
    eq(e.loop, true);
    eq(e.autoplay, true);
  });

  t("Audio: exposes instance methods and idle state", () => {
    const e = mount(W.Audio({ src: "" }));
    eq(typeof e.playAudio, "function");
    eq(typeof e.seekTo, "function");
    eq(e.isPlaying(), false);
    eq(e.getCurrentTime(), 0);
  });

  // ---------------- Video ----------------
  t("Video: renders a native <video> element", () => {
    const e = mount(W.Video({ src: "" }));
    eq(e.tagName, "VIDEO");
  });

  t("Video: src is forwarded to the element attribute", () => {
    const e = mount(W.Video({ src: "clip.mp4" }));
    eq(e.getAttribute("src"), "clip.mp4");
  });

  t("Video: controls defaults true, honors false", () => {
    eq(W.Video({ src: "" }).controls, true);
    eq(W.Video({ src: "", controls: false }).controls, false);
  });

  t("Video: width defaults 100% and height auto", () => {
    const e = mount(W.Video({ src: "" }));
    eq(e.style.width, "100%");
    eq(e.style.height, "auto");
  });

  t("Video: poster forwarded; muted/loop applied as properties", () => {
    const e = W.Video({ src: "", poster: "thumb.jpg", muted: true, loop: true });
    eq(e.getAttribute("poster"), "thumb.jpg");
    eq(e.muted, true);
    eq(e.loop, true);
  });

  t("Video: exposes playback instance methods", () => {
    const e = mount(W.Video({ src: "" }));
    eq(typeof e.playVideo, "function");
    eq(typeof e.restart, "function");
    eq(typeof e.muteVideo, "function");
  });

  // ---------------- DraggBox ----------------
  t("DraggBox: renders a <div> that wraps its child", () => {
    const child = W.Text({ text: "Drag" });
    const e = mount(W.DraggBox({ child }));
    eq(e.tagName, "DIV");
    eq(e.contains(child), true);
  });

  t("DraggBox: defaults to inline-block with a grab cursor", () => {
    const e = mount(W.DraggBox({ child: W.Text({ text: "x" }) }));
    eq(e.style.display, "inline-block");
    eq(e.style.cursor, "grab");
  });

  t("DraggBox: draggable by default, disabled turns it off", () => {
    const on = mount(W.DraggBox({ child: W.Text({ text: "x" }) }));
    eq(on.draggable, true);
    const off = mount(W.DraggBox({ child: W.Text({ text: "x" }), disabled: true }));
    eq(off.draggable, false);
    eq(off.style.cursor, "default");
  });

  t("DraggBox: returns null without a child", () => {
    eq(W.DraggBox({}), null);
  });

  t("DraggBox: accepts drag payload/handlers without throwing", () => {
    const e = mount(
      W.DraggBox({
        child: W.Text({ text: "x" }),
        data: { id: 1 },
        group: "tasks",
        onDragStart: () => {},
        onDragEnd: () => {},
      })
    );
    eq(e.tagName, "DIV");
  });

  // ---------------- DroppBox ----------------
  t("DroppBox: renders a <div> that wraps its child", () => {
    const child = W.Text({ text: "Drop" });
    const e = mount(W.DroppBox({ child }));
    eq(e.tagName, "DIV");
    eq(e.contains(child), true);
  });

  t("DroppBox: default box styles (relative, 12px radius, 16px padding, 2px solid border)", () => {
    const e = mount(W.DroppBox({ child: W.Text({ text: "x" }) }));
    eq(cs(e).position, "relative");
    eq(cs(e).borderTopLeftRadius, "12px");
    eq(cs(e).paddingTop, "16px");
    eq(cs(e).borderTopWidth, "2px");
    eq(cs(e).borderTopStyle, "solid");
  });

  t("DroppBox: bgColor overrides the resting background", () => {
    const e = mount(W.DroppBox({ child: W.Text({ text: "x" }), bgColor: "#ff0000" }));
    eq(cs(e).backgroundColor, "rgb(255, 0, 0)");
  });

  t("DroppBox: renders a string child as text", () => {
    const e = mount(W.DroppBox({ child: "plain text" }));
    eq(e.textContent, "plain text");
  });

  t("DroppBox: accepts groups and drag/drop handlers without throwing", () => {
    const e = mount(
      W.DroppBox({
        child: W.Text({ text: "x" }),
        acceptGroups: ["tasks"],
        onDrop: () => {},
        onDragEnter: () => {},
        onDragLeave: () => {},
        onDragOver: () => {},
      })
    );
    eq(e.tagName, "DIV");
  });

  // ---------------- Maps ----------------
  // No tile requests here: the map paints on the frame after mount, so every
  // assertion below reads the view state, which is network-independent.

  t("Maps: renders an element that reports its real widget name", () => {
    const e = mount(W.Maps({ center: [40.4168, -3.7038], zoom: 12 }));
    eq(e.tagName, "DIV");
    eq(e._widgetName, "Maps");
  });

  t("Maps: center accepts [lat,lng], {lat,lng} and {latitude,longitude}", () => {
    eq(W.Maps({ center: [10, 20] }).getCenter().lat, 10);
    eq(W.Maps({ center: { lat: 10, lng: 20 } }).getCenter().lng, 20);
    const e = W.Maps({ center: { latitude: 12, longitude: -30 } });
    eq(e.getCenter().lat, 12);
    eq(e.getCenter().lng, -30);
  });

  t("Maps: latitude is clamped to the Web Mercator limit", () => {
    eq(W.Maps({ center: [90, 0] }).getCenter().lat, 85.0511287798);
    eq(W.Maps({ center: [-90, 0] }).getCenter().lat, -85.0511287798);
  });

  t("Maps: getCenter reports the longitude it was given and wraps the rest", () => {
    eq(W.Maps({ center: [0, 2.3522] }).getCenter().lng, 2.3522);
    eq(W.Maps({ center: [0, 200] }).getCenter().lng, -160);
    eq(W.Maps({ center: [0, -200] }).getCenter().lng, 160);
  });

  t("Maps: zoom is clamped between minZoom and maxZoom", () => {
    eq(W.Maps({ zoom: 40, maxZoom: 18 }).getZoom(), 18);
    eq(W.Maps({ zoom: 1, minZoom: 5, maxZoom: 18 }).getZoom(), 5);
  });

  t("Maps: markers normalize bare positions and records", () => {
    const e = W.Maps({ markers: [[1, 2], { position: [3, 4], label: "x", color: "#ff0000" }] });
    const found = e.getMarkers();
    eq(found.length, 2);
    eq(found[1].label, "x");
    eq(found[1].color, "#ff0000");
    if (!found[0].id) throw new Error("marker without an id");
  });

  t("Maps: markerColor colors only the pins that did not ask for one", () => {
    const found = W.Maps({
      markerColor: "#00ff00",
      markers: [[1, 2], { position: [3, 4], color: "#ff0000" }],
    }).getMarkers();
    eq(found[0].color, "#00ff00");
    eq(found[1].color, "#ff0000");
  });

  t("Maps: addMarker, removeMarker and clearMarkers", () => {
    const e = mount(W.Maps({}));
    const added = e.addMarker({ position: [5, 5], label: "new" });
    eq(e.getMarkers().length, 1);
    e.removeMarker(added.id);
    eq(e.getMarkers().length, 0);
    e.addMarker([6, 6]);
    e.clearMarkers();
    eq(e.getMarkers().length, 0);
  });

  t("Maps: setCenter and zoomTo drive the view", () => {
    const e = W.Maps({ zoom: 3 });
    e.setCenter([8, 9]);
    eq(e.getCenter().lng, 9);
    e.zoomTo(10);
    eq(e.getZoom(), 10);
  });

  t("Maps: fitBounds lowers the zoom until the box fits", () => {
    const e = mount(W.Maps({ zoom: 18 }));
    e.fitBounds([[40.4, -3.74], [40.45, -3.68]]);
    if (e.getZoom() >= 18) throw new Error(`zoom stayed at ${e.getZoom()}`);
    eq(Math.round(e.getCenter().lat * 1000) / 1000, 40.425);
  });

  t("Maps: update() routes its own props to the map, never to CSS", () => {
    const e = mount(W.Maps({ center: [1, 1], zoom: 4 }));
    e.update({ center: [20, 30], zoom: 9 });
    eq(e.getCenter().lat, 20);
    eq(e.getZoom(), 9);
    if (e.style.center) throw new Error("center leaked into the inline style");
  });

  t("Maps: update() keeps its layers and still applies factory props", () => {
    const e = mount(W.Maps({ markers: [[1, 2]] }));
    const layers = e.children.length;
    e.update({ markers: [[3, 4], [5, 6]] });
    eq(e.children.length, layers);
    eq(e.getMarkers().length, 2);
    e.update({ opacity: 0.5 });
    eq(cs(e).opacity, "0.5");
  });

  t("Maps: onMapClick and friends never become lowercased DOM listeners", () => {
    const e = mount(W.Maps({ onMapClick: () => {}, onMarkerClick: () => {}, onMoveEnd: () => {} }));
    const names = (e._events || []).map((entry) => entry.event);
    if (names.includes("mapclick") || names.includes("markerclick") || names.includes("moveend")) {
      throw new Error(`bogus listeners: ${names.join(", ")}`);
    }
  });

  t("Maps: the credit line renders by default and showAttribution hides it", () => {
    const shown = mount(W.Maps({}));
    if (!shown.textContent.includes("OpenStreetMap")) throw new Error("no credit line");
    const hidden = mount(W.Maps({ showAttribution: false }));
    eq(cs(hidden.lastElementChild).display, "none");
  });

  t("Maps: interactive: false is a read-only view that the API still moves", () => {
    const e = mount(W.Maps({ interactive: false }));
    eq(cs(e).cursor, "default");
    e.setCenter([1, 1]);
    eq(e.getCenter().lat, 1);
  });

  t("Maps: the arrow keys pan the view the way they point", () => {
    const e = mount(W.Maps({ center: [40, 0], zoom: 5 }));
    const press = (key) =>
      e.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    const start = e.getCenter();
    press("ArrowRight");
    if (!(e.getCenter().lng > start.lng)) throw new Error("ArrowRight moved the view west");
    press("ArrowLeft");
    press("ArrowLeft");
    if (!(e.getCenter().lng < start.lng)) throw new Error("ArrowLeft moved the view east");
    press("ArrowUp");
    if (!(e.getCenter().lat > start.lat)) throw new Error("ArrowUp moved the view south");
    press("ArrowDown");
    press("ArrowDown");
    if (!(e.getCenter().lat < start.lat)) throw new Error("ArrowDown moved the view north");
  });

  t("Maps: a useState-bound center repaints the view when the state changes", () => {
    const [at, setAt] = useState("doccheck.maps.center", [40.4168, -3.7038]);
    // The key lives in global RAM, so pin the starting value before binding.
    setAt([40.4168, -3.7038]);
    const e = mount(W.Maps({ center: at }));
    eq(e.getCenter().lat, 40.4168);
    setAt([48.8566, 2.3522]);
    eq(e.getCenter().lng, 2.3522);
  });

  t("Maps: a useState-bound zoom follows the state", () => {
    const [z, setZ] = useState("doccheck.maps.zoom", 10);
    setZ(10);
    const e = mount(W.Maps({ zoom: z, minZoom: 3, maxZoom: 18 }));
    eq(e.getZoom(), 10);
    setZ(15);
    eq(e.getZoom(), 15);
  });

  t("Maps: a useState-bound marker list redraws the pins", () => {
    const [stops, setStops] = useState("doccheck.maps.markers", [[1, 2]]);
    setStops([[1, 2]]);
    const e = mount(W.Maps({ markers: stops }));
    eq(e.getMarkers().length, 1);
    setStops([[1, 2], [3, 4], { position: [5, 6], label: "third" }]);
    eq(e.getMarkers().length, 3);
    eq(e.getMarkers()[2].label, "third");
  });
}
