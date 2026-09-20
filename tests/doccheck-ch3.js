// Chapter 3 doc-verification probe fragment.
// Asserts the documented behavior of: Card, Divider, ListTile, ListView, GridView, Avatar, Badge, Chip.
//
// Grounding notes (derived from src/, do not guess):
// - Numeric spacing/size props go through the factory's rem/16 system: N -> `${N/16}rem`,
//   which computes to `${N}px` at the default 16px root font size.
// - Theme tokens (src/utils/themes.js): surface #f8fafc = rgb(248,250,252);
//   border #e2e8f0 = rgb(226,232,240); primary #6366f1 = rgb(99,102,241);
//   secondary #8b5cf6; danger #ef4444.
// - Card forwards raw `elevation` to the factory (elevation -> boxShadow, unit "none"),
//   which yields an invalid "Npx" box-shadow that the browser drops -> computed "none".
//   ListTile and Chip build their own real box-shadow strings from `elevation`.
export default function run(ctx) {
  const { t, eq, cs, mount, W } = ctx;

  // ---------------- Card ----------------
  // NOTE on colors: themes.js applies a light/dark palette at load time, so the
  // exact rgb of theme tokens (surface/primary/...) is environment-dependent.
  // Default-color checks therefore assert "an opaque background is applied", and
  // exact rgb values are only asserted for explicit color props (theme-independent).
  t("Card: renders a DIV and applies a default opaque surface background", () => {
    const e = mount(W.Card({}));
    eq(e.tagName, "DIV");
    eq(cs(e).backgroundColor !== "rgba(0, 0, 0, 0)", true);
  });
  t("Card: default borderRadius 12 and padding 16 compute to px", () => {
    const e = mount(W.Card({}));
    eq(cs(e).borderTopLeftRadius, "12px");
    eq(cs(e).paddingTop, "16px");
  });
  t("Card: showBorder true draws a 1px solid border, false removes it", () => {
    const on = mount(W.Card({}));
    eq(cs(on).borderTopStyle, "solid");
    eq(cs(on).borderTopWidth, "1px");
    const off = mount(W.Card({ showBorder: false }));
    eq(cs(off).borderTopStyle, "none");
  });
  t("Card: elevation is forwarded raw and renders no box-shadow (documented caveat)", () => {
    const e = mount(W.Card({ elevation: 4 }));
    eq(cs(e).boxShadow, "none");
  });
  t("Card: bgColor overrides the surface default", () => {
    const e = mount(W.Card({ bgColor: "#ff0000" }));
    eq(cs(e).backgroundColor, "rgb(255, 0, 0)");
  });
  t("Card: renders child content", () => {
    const e = W.Card({ child: W.Text({ text: "Body" }) });
    eq(e.textContent.includes("Body"), true);
  });

  // ---------------- Divider ----------------
  t("Divider: renders a DIV", () => {
    eq(W.Divider({}).tagName, "DIV");
  });
  t("Divider: horizontal default is full width and 1px thick", () => {
    const e = mount(W.Divider({}));
    eq(e.style.width, "100%");
    eq(cs(e).height, "1px");
  });
  t("Divider: applies a default opaque color", () => {
    const e = mount(W.Divider({}));
    eq(cs(e).backgroundColor !== "rgba(0, 0, 0, 0)", true);
  });
  t("Divider: color prop sets the line color", () => {
    const e = mount(W.Divider({ color: "#ff0000" }));
    eq(cs(e).backgroundColor, "rgb(255, 0, 0)");
  });
  t("Divider: thickness controls the cross-axis size", () => {
    const e = mount(W.Divider({ thickness: 4 }));
    eq(cs(e).height, "4px");
  });
  t("Divider: vertical orientation swaps width/height", () => {
    const e = mount(W.Divider({ orientation: "vertical" }));
    eq(e.style.height, "100%");
    eq(cs(e).width, "1px");
  });

  // ---------------- ListTile ----------------
  t("ListTile: renders a DIV and shows title + subtitle", () => {
    const e = W.ListTile({ title: "Home", subtitle: "Sub" });
    eq(e.tagName, "DIV");
    eq(e.textContent.includes("Home"), true);
    eq(e.textContent.includes("Sub"), true);
  });
  t("ListTile: onPress makes it clickable with a pointer cursor", () => {
    let n = 0;
    const e = mount(W.ListTile({ title: "x", onPress: () => n++ }));
    eq(cs(e).cursor, "pointer");
    e.click();
    eq(n, 1);
  });
  t("ListTile: disabled dims to 0.6 and ignores onPress", () => {
    let n = 0;
    const e = mount(W.ListTile({ title: "x", disabled: true, onPress: () => n++ }));
    e.click();
    eq(n, 0);
    eq(cs(e).opacity, "0.6");
  });
  t("ListTile: elevation > 0 builds a real box-shadow", () => {
    const e = mount(W.ListTile({ title: "x", elevation: 2 }));
    eq(cs(e).boxShadow.includes("rgba"), true);
  });
  t("ListTile: leftItem/rightItem slots are rendered", () => {
    const e = W.ListTile({
      title: "x",
      leftItem: W.Icon({ name: "star" }),
      rightItem: W.Icon({ name: "chevron_right" }),
    });
    eq(e.textContent.includes("star"), true);
    eq(e.textContent.includes("chevron_right"), true);
  });
  t("ListTile: default (non-interactive) cursor is default", () => {
    const e = mount(W.ListTile({ title: "x" }));
    eq(cs(e).cursor, "default");
  });

  // ---------------- ListView ----------------
  t("ListView: renders a DIV as a hidden-overflow flex column that expands", () => {
    const e = W.ListView({});
    eq(e.tagName, "DIV");
    eq(e.style.display, "flex");
    eq(e.style.flexDirection, "column");
    eq(e.style.overflow, "hidden");
    // Chromium normalizes the `flex: 1` shorthand to the full form when read back.
    eq(e.style.flex, "1 1 0%");
  });
  t("ListView: default height is 400px", () => {
    const e = mount(W.ListView({}));
    eq(cs(e).height, "400px");
  });
  t("ListView: builds an internal scroll container with overflowY auto", () => {
    const e = W.ListView({});
    eq(e.firstElementChild.style.overflowY, "auto");
  });
  t("ListView: exposes the documented instance methods", () => {
    const e = W.ListView({});
    eq(typeof e.updateData, "function");
    eq(typeof e.scrollToIndex, "function");
    eq(typeof e.scrollToStart, "function");
    eq(typeof e.scrollToEnd, "function");
  });
  // NOTE: updateData() and the `data` setter are intentionally NOT invoked here.
  // In the current source updateData() assigns element.data, whose setter calls
  // updateData() again -> infinite recursion (stack overflow). Documented in
  // ListView.md Notes. Only the safe getter is exercised below.
  t("ListView: data getter reflects the dataset (getter is safe)", () => {
    const e = W.ListView({ data: [1, 2, 3], renderItem: (x) => W.Text({ text: String(x) }) });
    eq(e.data.length, 3);
    eq(e.data[0], 1);
    eq(W.ListView({}).data.length, 0);
  });
  t("ListView: refreshing getter/setter is safe and non-recursive", () => {
    const e = W.ListView({});
    eq(e.refreshing, false);
    e.refreshing = true;
    eq(e.refreshing, true);
  });

  // ---------------- GridView ----------------
  t("GridView: renders a DIV backed by the ListView structure", () => {
    const e = W.GridView({});
    eq(e.tagName, "DIV");
    eq(e.style.flexDirection, "column");
    eq(e.firstElementChild.style.overflowY, "auto");
  });
  t("GridView: exposes the full ListView method set", () => {
    const e = W.GridView({});
    eq(typeof e.updateData, "function");
    eq(typeof e.scrollToIndex, "function");
    eq(typeof e.scrollToStart, "function");
    eq(typeof e.scrollToEnd, "function");
  });
  // NOTE: updateData()/data setter are not invoked (same recursion bug as ListView).
  t("GridView: data getter reflects the dataset (getter is safe)", () => {
    const e = W.GridView({ data: ["a", "b"], renderItem: (x) => W.Text({ text: x }) });
    eq(e.data.length, 2);
    eq(W.GridView({}).data.length, 0);
  });
  t("GridView: inherits the ListView default viewport height of 400px", () => {
    const e = mount(W.GridView({}));
    eq(cs(e).height, "400px");
  });
  t("GridView: accepts columns/itemHeight/spacing and still renders a DIV", () => {
    const e = W.GridView({ columns: 3, itemHeight: 120, spacing: 12, data: [], renderItem: () => W.Text({ text: "x" }) });
    eq(e.tagName, "DIV");
  });

  // ---------------- Avatar ----------------
  t("Avatar: renders an inline-flex DIV with a default opaque background", () => {
    const e = mount(W.Avatar({}));
    eq(e.tagName, "DIV");
    eq(cs(e).backgroundColor !== "rgba(0, 0, 0, 0)", true);
    const red = mount(W.Avatar({ bgColor: "#ff0000" }));
    eq(cs(red).backgroundColor, "rgb(255, 0, 0)");
  });
  t("Avatar: shape controls border-radius (circle/rounded/square)", () => {
    eq(W.Avatar({ shape: "circle" }).style.borderRadius, "50%");
    eq(W.Avatar({ shape: "rounded", size: 40 }).style.borderRadius, "8px");
    // Zero serializes with units in Chromium: setting borderRadius "0" reads back "0px".
    eq(W.Avatar({ shape: "square" }).style.borderRadius, "0px");
  });
  t("Avatar: size sets width/height in px", () => {
    const e = mount(W.Avatar({ size: 64 }));
    eq(cs(e).width, "64px");
    eq(cs(e).height, "64px");
  });
  t("Avatar: name renders initials; empty renders the person icon", () => {
    eq(W.Avatar({ name: "John Doe" }).textContent.includes("JD"), true);
    eq(W.Avatar({}).textContent.includes("person"), true);
  });
  t("Avatar: src renders an IMG element", () => {
    const e = W.Avatar({ src: "/a.png" });
    const img = e.querySelector("img");
    eq(img.tagName, "IMG");
  });
  t("Avatar: onPress is clickable and updateContent swaps the content", () => {
    let n = 0;
    const e = mount(W.Avatar({ name: "John Doe", onPress: () => n++ }));
    eq(cs(e).cursor, "pointer");
    e.click();
    eq(n, 1);
    e.updateContent({ name: "Alice Smith" });
    eq(e.textContent.includes("AS"), true);
  });

  // ---------------- Badge ----------------
  t("Badge: with a value it wraps the child in an inline-block Stack showing the count", () => {
    const child = W.Icon({ name: "notifications" });
    const e = mount(W.Badge({ value: 3, child }));
    eq(e.tagName, "DIV");
    eq(e.style.display, "inline-block");
    eq(e.contains(child), true);
    eq(e.textContent.includes("3"), true);
  });
  t("Badge: value 0 with showZero false returns the child unchanged", () => {
    const child = W.Icon({ name: "notifications" });
    const e = W.Badge({ value: 0, child });
    eq(e, child);
  });
  t("Badge: showZero true renders the zero pill", () => {
    const e = mount(W.Badge({ value: 0, showZero: true, child: W.Icon({ name: "x" }) }));
    eq(e.style.display, "inline-block");
    eq(e.textContent.includes("0"), true);
  });
  t("Badge: numeric value above max renders as max+", () => {
    const e = mount(W.Badge({ value: 120, max: 99, child: W.Icon({ name: "x" }) }));
    eq(e.textContent.includes("99+"), true);
  });
  t("Badge: updateValue changes the pill text", () => {
    const e = mount(W.Badge({ value: 3, child: W.Icon({ name: "x" }) }));
    e.updateValue(7);
    eq(e.textContent.includes("7"), true);
  });
  t("Badge: the pill is an absolutely-positioned overlay", () => {
    const e = mount(W.Badge({ value: 1, child: W.Icon({ name: "x" }) }));
    eq(e.lastElementChild.style.position, "absolute");
  });

  // ---------------- Chip ----------------
  t("Chip: renders an inline-block DIV carrying the label", () => {
    const e = W.Chip({ label: "Tag" });
    eq(e.tagName, "DIV");
    eq(e.style.display, "inline-block");
    eq(e.textContent.includes("Tag"), true);
  });
  t("Chip: onPress makes it clickable with a pointer cursor", () => {
    let n = 0;
    const e = mount(W.Chip({ label: "x", onPress: () => n++ }));
    eq(cs(e).cursor, "pointer");
    e.click();
    eq(n, 1);
  });
  t("Chip: onDelete adds a close icon; clicking it fires onDelete and not onPress", () => {
    let d = 0, p = 0;
    const e = mount(W.Chip({ label: "x", onDelete: () => d++, onPress: () => p++ }));
    const close = e.querySelector(".material-icons");
    eq(close.textContent, "close");
    close.click();
    eq(d, 1);
    eq(p, 0);
  });
  t("Chip: filled variant colors the pill; outlined variant gives it a solid border", () => {
    const filled = mount(W.Chip({ label: "x", color: "#ff0000" }));
    eq(cs(filled.firstElementChild).backgroundColor, "rgb(255, 0, 0)");
    const outlined = mount(W.Chip({ label: "x", variant: "outlined", color: "#00ff00" }));
    eq(cs(outlined.firstElementChild).borderTopStyle, "solid");
    eq(cs(outlined.firstElementChild).borderTopColor, "rgb(0, 255, 0)");
  });
  t("Chip: elevation > 0 builds a real box-shadow on the pill", () => {
    const e = mount(W.Chip({ label: "x", elevation: 2 }));
    eq(cs(e.firstElementChild).boxShadow.includes("rgba"), true);
  });
  t("Chip: icon prop renders a leading material icon", () => {
    const e = W.Chip({ label: "x", icon: "star" });
    eq(e.textContent.includes("star"), true);
  });
}
