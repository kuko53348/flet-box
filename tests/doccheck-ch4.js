// Chapter 4 doc-verification probe fragment.
// Asserts the documented behavior of: AlertDialog, Modal, BottomSheet, SnackBar, Tooltip, ProgressBar, CircularBar, Skeleton, FloatingActionButton, Pagination.
export default function run(ctx) {
  const { t, eq, cs, mount, W } = ctx;
  // W = widget namespace; t(name, fn); eq(actual, expected, msg?); cs(el)=getComputedStyle; mount(el) appends to off-screen host & returns el

  // ---------------- AlertDialog ----------------
  t("AlertDialog: returns controller {open, close, modal}, starts closed", () => {
    const a = W.AlertDialog({ title: "T", message: "M" });
    eq(typeof a.open, "function");
    eq(typeof a.close, "function");
    eq(typeof a.modal.toggle, "function");
    eq(typeof a.modal.destroy, "function");
    eq(a.modal.isOpen, false);
    a.modal.destroy();
  });
  t("AlertDialog: open() flips isOpen and reveals overlay; panel is 320px wide", () => {
    const a = W.AlertDialog({ title: "T", message: "M" });
    const overlay = document.body.lastElementChild; // portal-to-body on creation
    eq(overlay.style.visibility, "hidden");
    a.open();
    eq(a.modal.isOpen, true);
    eq(overlay.style.visibility, "visible");
    eq(overlay.firstElementChild.style.width, "320px"); // documented dialog width
    a.close();
    eq(a.modal.isOpen, false);
    a.modal.destroy();
    eq(overlay.parentNode, null);
  });
  t("AlertDialog: confirm click fires onConfirm and closes", () => {
    let fired = 0;
    const a = W.AlertDialog({ title: "T", message: "M", onConfirm: () => fired++ });
    const overlay = document.body.lastElementChild;
    a.open();
    const buttons = overlay.querySelectorAll("button"); // [Cancel, Accept]
    eq(buttons.length, 2);
    eq(buttons[buttons.length - 1].textContent.trim(), "Accept"); // confirmText default
    buttons[buttons.length - 1].click();
    eq(fired, 1);
    eq(a.modal.isOpen, false);
    a.modal.destroy();
  });

  // ---------------- Modal ----------------
  t("Modal: controller API surface", () => {
    const m = W.Modal({ title: "x" });
    eq(typeof m.open, "function");
    eq(typeof m.close, "function");
    eq(typeof m.toggle, "function");
    eq(typeof m.destroy, "function");
    eq(typeof m.updateContent, "function");
    eq(typeof m.updateTitle, "function");
    eq(typeof m.updatePadding, "function");
    eq(typeof m.setLoading, "function");
    eq(m.isOpen, false);
    m.destroy();
  });
  t("Modal: overlay portals to body, hidden, fixed, z-index 9998", () => {
    const m = W.Modal({ title: "x" });
    const overlay = document.body.lastElementChild;
    eq(overlay.parentNode, document.body);
    eq(cs(overlay).position, "fixed");
    eq(cs(overlay).visibility, "hidden");
    eq(cs(overlay).zIndex, "9998");
    m.destroy();
  });
  t("Modal: open()/close() synchronous state; default panel width 480px", () => {
    const m = W.Modal({ title: "x" });
    const overlay = document.body.lastElementChild;
    m.open();
    eq(m.isOpen, true);
    eq(overlay.style.visibility, "visible");
    eq(overlay.style.opacity, "1");
    eq(overlay.firstElementChild.style.width, "480px");
    m.close();
    eq(m.isOpen, false);
    eq(overlay.style.opacity, "0");
    m.destroy();
  });
  t("Modal: destroy() removes the overlay from the DOM", () => {
    const m = W.Modal({ title: "x" });
    const overlay = document.body.lastElementChild;
    m.destroy();
    eq(overlay.parentNode, null);
  });

  // ---------------- BottomSheet ----------------
  t("BottomSheet: controller API surface", () => {
    const s = W.BottomSheet({ title: "x" });
    eq(typeof s.open, "function");
    eq(typeof s.close, "function");
    eq(typeof s.toggle, "function");
    eq(typeof s.destroy, "function");
    s.destroy();
  });
  t("BottomSheet: overlay portals to body; sheet starts off-screen at translateY(100%)", () => {
    const s = W.BottomSheet({ title: "x" });
    const overlay = document.body.lastElementChild;
    const sheet = overlay.firstElementChild;
    eq(overlay.parentNode, document.body);
    eq(overlay.style.visibility, "hidden");
    eq(cs(sheet).position, "fixed");
    eq(sheet.style.transform, "translateY(100%)");
    eq(cs(sheet).zIndex, "9999");
    s.destroy();
  });
  t("BottomSheet: open() slides sheet to translateY(0); close() resets; destroy() removes", () => {
    const s = W.BottomSheet({ title: "x" });
    const overlay = document.body.lastElementChild;
    const sheet = overlay.firstElementChild;
    s.open();
    eq(overlay.style.visibility, "visible");
    eq(overlay.style.opacity, "1");
    eq(sheet.style.transform, "translateY(0)");
    s.close();
    eq(sheet.style.transform, "translateY(100%)");
    eq(overlay.style.opacity, "0");
    s.destroy();
    eq(overlay.parentNode, null);
  });

  // ---------------- SnackBar ----------------
  t("SnackBar: shows immediately — fixed bar appended to document.body", () => {
    const sb = W.SnackBar({ message: "Saved" });
    eq(typeof sb.close, "function");
    eq(typeof sb.show, "function");
    eq(typeof sb.getElement, "function");
    const el = sb.getElement();
    eq(el.tagName, "DIV");
    eq(el.parentNode, document.body);
    eq(cs(el).position, "fixed");
    eq(cs(el).zIndex, "10000");
    eq(el.style.bottom, "16px"); // position 'bottom' + margin 16
    if (!el.textContent.includes("Saved")) throw new Error("message missing");
    sb.close();
  });
  t("SnackBar: action renders a button labeled with `action`", () => {
    const sb = W.SnackBar({ message: "Deleted", action: "Undo" });
    const btn = sb.getElement().querySelector("button");
    if (!btn) throw new Error("no action button");
    eq(btn.textContent.trim(), "Undo");
    sb.close();
  });
  t("SnackBar: position 'top' anchors the bar to the top edge", () => {
    const sb = W.SnackBar({ message: "Hi", position: "top" });
    eq(sb.getElement().style.top, "16px");
    sb.close();
  });
  t("SnackBar: dismissible without action renders the close (x) button", () => {
    const sb = W.SnackBar({ message: "Hi", dismissible: true });
    const btn = sb.getElement().querySelector("button");
    if (!btn) throw new Error("no close button");
    eq(btn.textContent.trim(), "\u2715");
    sb.close();
  });

  // ---------------- Tooltip ----------------
  t("Tooltip: returns the child element itself, augmented", () => {
    const child = W.Icon({ name: "help" });
    const tip = W.Tooltip({ text: "Help!", child });
    eq(tip, child);
    eq(tip.tagName, "SPAN");
    if (typeof tip._cleanup === "function") tip._cleanup();
  });
  t("Tooltip: instance methods attached to the child", () => {
    const tip = W.Tooltip({ text: "Help!", child: W.Text({ text: "x" }) });
    eq(typeof tip.showTooltip, "function");
    eq(typeof tip.hideTooltip, "function");
    eq(typeof tip.updateContent, "function");
    eq(typeof tip.updatePosition, "function");
    tip._cleanup();
  });
  t("Tooltip: returns null without a child", () => {
    eq(W.Tooltip({ text: "orphan" }), null);
  });
  t("Tooltip: disabled showTooltip creates nothing; hide cancels a pending show", () => {
    const before = document.body.children.length;
    const off = W.Tooltip({ text: "no", child: W.Text({ text: "x" }), disabled: true });
    off.showTooltip();
    eq(document.body.children.length, before);
    const on = W.Tooltip({ text: "yes", child: W.Text({ text: "x" }) });
    on.showTooltip();
    on.hideTooltip(); // cancels the delayed creation synchronously
    eq(document.body.children.length, before);
    off._cleanup();
    on._cleanup();
  });

  // ---------------- ProgressBar ----------------
  t("ProgressBar: flex container > track > fill; default height 8px, radius 4px", () => {
    const e = mount(W.ProgressBar({ value: 50 }));
    eq(e.tagName, "DIV");
    eq(cs(e).display, "flex");
    eq(cs(e).flexDirection, "row");
    const track = e.firstElementChild;
    const fill = track.firstElementChild;
    eq(track.style.height, "8px");
    eq(track.style.borderRadius, "4px"); // height / 2
    eq(cs(track).backgroundColor, "rgb(226, 232, 240)"); // colors.border
    eq(cs(fill).backgroundColor, "rgb(99, 102, 241)"); // colors.primary
  });
  t("ProgressBar: value 50 / max 100 -> fill width 50%", () => {
    const e = mount(W.ProgressBar({ value: 50 }));
    eq(e.firstElementChild.firstElementChild.style.width, "50%");
  });
  t("ProgressBar: value clamped to [0, max]; getValue/setValue/value property", () => {
    eq(W.ProgressBar({ value: 150 }).getValue(), 100);
    eq(W.ProgressBar({ value: -5 }).getValue(), 0);
    const e = mount(W.ProgressBar({ value: 10 }));
    eq(typeof e.updateProgress, "function");
    e.setValue(25);
    eq(e.getValue(), 25);
    eq(e.firstElementChild.firstElementChild.style.width, "25%");
    e.value = 30;
    eq(e.getValue(), 30);
  });
  t("ProgressBar: indeterminate -> 50% sliding fill, value updates ignored", () => {
    const e = mount(W.ProgressBar({ indeterminate: true }));
    const fill = e.firstElementChild.firstElementChild;
    eq(fill.style.width, "50%");
    if (!fill.style.animation.includes("indeterminate-progress")) throw new Error("no indeterminate animation");
    if (!document.querySelector("#indeterminate-progress-style")) throw new Error("keyframes not injected");
    e.setValue(80);
    eq(e.getValue(), 0); // ignored while indeterminate
  });
  t("ProgressBar: showValue renders the rounded percentage", () => {
    const e = mount(W.ProgressBar({ value: 25, showValue: true }));
    if (!e.textContent.includes("25%")) throw new Error("percentage missing");
  });

  // ---------------- CircularBar ----------------
  t("CircularBar: DIV container wrapping a CANVAS; fixed size 120", () => {
    const e = mount(W.CircularBar({ value: 40, size: 120, animate: false }));
    eq(e.tagName, "DIV");
    eq(e.style.display, "inline-block");
    eq(e.style.width, "120px");
    const canvas = e.querySelector("canvas");
    if (!canvas) throw new Error("no canvas");
    eq(canvas.tagName, "CANVAS");
    eq(canvas.width, 120);
  });
  t("CircularBar: responsive by default (block, width 100%, 200px canvas fallback)", () => {
    const e = W.CircularBar({ value: 10, animate: false });
    eq(e.style.display, "block");
    eq(e.style.width, "100%");
    eq(e.querySelector("canvas").width, 200); // detached: rect width 0 -> fallback
    e._cleanup();
  });
  t("CircularBar: ref receives the canvas element", () => {
    let c = null;
    const e = W.CircularBar({ size: 64, animate: false, ref: (el) => { c = el; } });
    if (!c) throw new Error("ref not called");
    eq(c.tagName, "CANVAS");
    e._cleanup();
  });
  t("CircularBar: updateValue is exposed and runs", () => {
    const e = W.CircularBar({ size: 80, animate: false });
    eq(typeof e.updateValue, "function");
    e.updateValue(55);
    e.updateValue(120, 200); // new max
    e._cleanup();
  });

  // ---------------- Skeleton ----------------
  t("Skeleton: full-width flex column container; default text variant 100% x 16px r4", () => {
    const e = mount(W.Skeleton({}));
    eq(e.tagName, "DIV");
    eq(cs(e).display, "flex");
    eq(cs(e).flexDirection, "column");
    eq(cs(e).gap, "8px");
    eq(e.children.length, 1);
    const block = e.firstElementChild;
    eq(block.style.width, "100%");
    eq(block.style.height, "16px");
    eq(block.style.borderRadius, "4px");
    eq(cs(block).backgroundColor, "rgb(226, 232, 240)"); // colors.gray200
  });
  t("Skeleton: default pulse animation + injected keyframes", () => {
    const e = mount(W.Skeleton({}));
    if (!e.firstElementChild.style.animation.includes("skeleton-pulse")) throw new Error("no pulse animation");
    if (!document.querySelector("#skeleton-styles")) throw new Error("keyframes not injected");
  });
  t("Skeleton: count repeats blocks; animation 'none' is static; 'wave' uses a gradient", () => {
    const many = mount(W.Skeleton({ count: 3 }));
    eq(many.children.length, 3);
    const none = mount(W.Skeleton({ animation: "none" }));
    eq(none.firstElementChild.style.animation, "");
    const wave = mount(W.Skeleton({ animation: "wave" }));
    if (!wave.firstElementChild.style.backgroundImage.includes("linear-gradient")) throw new Error("no wave gradient");
  });
  t("Skeleton: avatar variant is 40x40 and round; button variant is 120x36 r24", () => {
    const av = mount(W.Skeleton({ variant: "avatar" })).firstElementChild;
    eq(av.style.width, "40px");
    eq(av.style.height, "40px");
    eq(av.style.borderRadius, "50%");
    const btn = mount(W.Skeleton({ variant: "button" })).firstElementChild;
    eq(btn.style.width, "120px");
    eq(btn.style.height, "36px");
    eq(btn.style.borderRadius, "24px");
  });

  // ---------------- FloatingActionButton ----------------
  t("FloatingActionButton: 56px round DIV with a Material Icon (default 'add')", () => {
    const e = mount(W.FloatingActionButton({ onPress: () => {} }));
    eq(e.tagName, "DIV");
    eq(cs(e).width, "56px");
    eq(cs(e).height, "56px");
    eq(e.style.borderRadius, "50%");
    const icon = e.querySelector(".material-icons");
    if (!icon) throw new Error("no icon");
    eq(icon.textContent.trim(), "add");
    eq(cs(icon).fontSize, "24px");
    if (!cs(e).boxShadow.includes("3px 6px")) throw new Error("elevation 6 shadow missing");
  });
  t("FloatingActionButton: onPress fires on click", () => {
    let n = 0;
    const e = mount(W.FloatingActionButton({ onPress: () => n++ }));
    e.click();
    eq(n, 1);
  });
  t("FloatingActionButton: mini is 40px with a 20px icon", () => {
    const e = mount(W.FloatingActionButton({ mini: true }));
    eq(cs(e).width, "40px");
    eq(cs(e).height, "40px");
    eq(cs(e.querySelector(".material-icons")).fontSize, "20px");
  });
  t("FloatingActionButton: extended pill shows the label and auto width", () => {
    const e = mount(W.FloatingActionButton({ extended: true, label: "Create" }));
    if (!e.textContent.includes("Create")) throw new Error("label missing");
    eq(e.style.width, "auto");
    eq(e.style.borderRadius, "24px");
  });
  t("FloatingActionButton: disabled dims and ignores onPress", () => {
    let n = 0;
    const e = mount(W.FloatingActionButton({ disabled: true, onPress: () => n++ }));
    eq(cs(e).opacity, "0.6");
    eq(cs(e).cursor, "not-allowed");
    e.click();
    eq(n, 0);
  });

  // ---------------- Pagination ----------------
  t("Pagination: returns null when there is only one page", () => {
    eq(W.Pagination({ totalItems: 5, pageSize: 10 }), null);
    eq(W.Pagination({ totalItems: 0 }), null);
  });
  t("Pagination: 95 items / 10 per page -> row with 6 numeric buttons + summary text", () => {
    const e = mount(W.Pagination({ totalItems: 95, pageSize: 10 }));
    eq(e.tagName, "DIV");
    eq(cs(e).display, "flex");
    const numeric = Array.from(e.querySelectorAll("button")).filter((b) => /^\d+$/.test(b.textContent.trim()));
    eq(numeric.length, 6); // window 1..5 + last page 10
    if (!e.textContent.includes("Page 1 of 10 (1-10 of 95)")) throw new Error("summary missing");
  });
  t("Pagination: clicking page 2 fires onPageChange(2)", () => {
    let got = null;
    const e = mount(W.Pagination({ totalItems: 95, pageSize: 10, onPageChange: (p) => { got = p; } }));
    const two = Array.from(e.querySelectorAll("button")).find((b) => b.textContent.trim() === "2");
    if (!two) throw new Error("no page-2 button");
    two.click();
    eq(got, 2);
  });
  t("Pagination: clicking the active page does not fire onPageChange", () => {
    let got = null;
    const e = mount(W.Pagination({ totalItems: 95, pageSize: 10, onPageChange: (p) => { got = p; } }));
    const one = Array.from(e.querySelectorAll("button")).find((b) => b.textContent.trim() === "1");
    one.click();
    eq(got, null);
  });
  t("Pagination: currentPage is clamped to the last page", () => {
    const e = mount(W.Pagination({ totalItems: 95, pageSize: 10, currentPage: 99 }));
    if (!e.textContent.includes("Page 10 of 10")) throw new Error("clamped page missing");
  });
}
