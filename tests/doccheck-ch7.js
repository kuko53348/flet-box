// Chapter 7 doc-verification probe fragment.
// Asserts the documented behavior of: Audio, Video, DraggBox, DroppBox.
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
}
