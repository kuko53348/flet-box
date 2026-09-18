// Chapter 5 doc-verification probe fragment.
// Asserts the documented behavior of: Stepper, Accordion, TreeView, Carousel, InstallButton.
export default function run(ctx) {
  const { t, eq, cs, mount, W } = ctx;
  // W = widget namespace; t(name, fn); eq(actual, expected, msg?); cs(el)=getComputedStyle; mount(el) appends off-screen & returns el

  // ---------------- Stepper ----------------
  t("Stepper: DIV panel with three sections (rail, content, nav) and default styling", () => {
    const e = mount(W.Stepper({ steps: [{ label: "s1" }] }));
    eq(e.tagName, "DIV");
    eq(e.children.length, 3);
    eq(cs(e).display, "flex");
    eq(cs(e).flexDirection, "column");
    eq(cs(e).gap, "24px");
    eq(cs(e).paddingTop, "20px");
    eq(cs(e).borderTopWidth, "1px");
    eq(cs(e).overflow, "hidden");
  });

  t("Stepper: bgColor prop paints the panel", () => {
    const e = mount(W.Stepper({ steps: [{ label: "s1" }], bgColor: "#ff0000" }));
    eq(cs(e).backgroundColor, "rgb(255, 0, 0)");
  });

  t("Stepper: horizontal rail renders 2N-1 nodes, vertical rail renders N", () => {
    const steps = [{ label: "a" }, { label: "b" }, { label: "c" }];
    const h = mount(W.Stepper({ steps }));
    const hRail = h.children[0].children[0];
    eq(cs(hRail).flexDirection, "row");
    eq(hRail.children.length, 5); // 3 steps + 2 connectors

    const v = mount(W.Stepper({ steps, orientation: "vertical" }));
    const vRail = v.children[0].children[0];
    eq(cs(vRail).flexDirection, "column");
    eq(vRail.children.length, 3);
  });

  t("Stepper: activeStep is clamped to 0..steps.length-1", () => {
    const steps = [{ label: "a" }, { label: "b" }];
    eq(W.Stepper({ steps, activeStep: 9 }).getActiveStep(), 1);
    eq(W.Stepper({ steps, activeStep: -4 }).getActiveStep(), 0);
  });

  t("Stepper: next()/back()/goTo() move the step and fire onStepChange", () => {
    const seen = [];
    const e = mount(
      W.Stepper({
        steps: [{ label: "a" }, { label: "b" }, { label: "c" }],
        onStepChange: (i) => seen.push(i),
      }),
    );
    eq(typeof e.next, "function");
    eq(typeof e.back, "function");
    eq(typeof e.goTo, "function");
    eq(e.getActiveStep(), 0);
    e.next();
    eq(e.getActiveStep(), 1);
    e.back();
    eq(e.getActiveStep(), 0);
    e.goTo(2);
    eq(e.getActiveStep(), 2);
    e.goTo(99); // out of range -> ignored
    eq(e.getActiveStep(), 2);
    eq(seen.join(","), "1,0,2");
  });

  t("Stepper: shows Next on the first step, Back+Finish on the last, and fires onFinish", () => {
    let finished = 0;
    const e = mount(
      W.Stepper({
        steps: [{ label: "a" }, { label: "b" }],
        onFinish: () => finished++,
      }),
    );
    eq(e.querySelectorAll("button").length, 1);
    e.next();
    const buttons = e.querySelectorAll("button");
    eq(buttons.length, 2);
    buttons[1].click(); // Finish
    eq(finished, 1);
  });

  t("Stepper: the active step's content is swapped into the content panel", () => {
    const c1 = W.Text({ text: "one" });
    const c2 = W.Text({ text: "two" });
    const e = mount(
      W.Stepper({
        steps: [
          { label: "a", content: c1 },
          { label: "b", content: c2 },
        ],
      }),
    );
    eq(e.children[1].contains(c1), true);
    e.goTo(1);
    eq(e.children[1].contains(c2), true);
    eq(e.children[1].contains(c1), false);
  });

  // ---------------- Accordion ----------------
  t("Accordion: DIV with a title bar (text + chevron) and a content wrapper", () => {
    const e = mount(W.Accordion({ title: "Shipping", children: [W.Text({ text: "x" })] }));
    eq(e.tagName, "DIV");
    eq(e.children.length, 2);
    eq(e.children[0].children.length, 2); // title Text + Icon
    eq(e.children[0].children[0].textContent, "Shipping");
    eq(e.children[0].children[1].textContent, "chevron_right");
  });

  t("Accordion: collapsed hides the content wrapper, expanded shows it", () => {
    const closed = mount(W.Accordion({ title: "a", children: [W.Text({ text: "x" })] }));
    eq(closed.expanded, false);
    eq(cs(closed.children[1]).display, "none");

    const open = mount(W.Accordion({ title: "a", expanded: true, children: [W.Text({ text: "x" })] }));
    eq(open.expanded, true);
    eq(cs(open.children[1]).display, "block");
    eq(open.children[1].children[0].textContent, "x");
  });

  t("Accordion: exposes toggle/setExpanded/update and an expanded accessor", () => {
    const e = mount(W.Accordion({ title: "a", children: [] }));
    eq(typeof e.toggle, "function");
    eq(typeof e.setExpanded, "function");
    eq(typeof e.update, "function");
    eq(e.expanded, false);
  });

  t("Accordion: setExpanded(true) flips expanded synchronously", () => {
    const e = mount(W.Accordion({ title: "a", children: [W.Text({ text: "x" })] }));
    eq(e.expanded, false);
    e.setExpanded(true);
    eq(e.expanded, true);
  });

  t("Accordion: clicking the title bar expands it", () => {
    const e = mount(W.Accordion({ title: "a", children: [W.Text({ text: "x" })] }));
    eq(cs(e.children[0]).cursor, "pointer");
    e.children[0].click();
    eq(e.expanded, true);
  });

  t("Accordion: disabled blocks toggling and shows a not-allowed cursor", () => {
    const e = mount(W.Accordion({ title: "a", disabled: true, children: [] }));
    eq(cs(e.children[0]).cursor, "not-allowed");
    e.toggle();
    eq(e.expanded, false);
  });

  // ---------------- TreeView ----------------
  t("TreeView: empty nodes renders a DIV holding one empty wrapper", () => {
    const e = mount(W.TreeView({ nodes: [] }));
    eq(e.tagName, "DIV");
    eq(e.style.width, "100%");
    eq(e.children.length, 1);
    eq(e.children[0].children.length, 0);
  });

  t("TreeView: one row per node with spacer/toggle, icon, and label", () => {
    const e = mount(W.TreeView({ nodes: [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }] }));
    eq(e.children[0].children.length, 2);
    const row = e.children[0].children[0].children[0];
    eq(row.children.length, 3);
    eq(row.children[2].textContent, "Alpha");
    eq(row.style.marginLeft, "0px");
  });

  t("TreeView: showIcons:false drops the icon cell", () => {
    const e = mount(W.TreeView({ nodes: [{ id: "a", label: "Alpha" }], showIcons: false }));
    const row = e.children[0].children[0].children[0];
    eq(row.children.length, 2);
    eq(row.children[1].textContent, "Alpha");
  });

  t("TreeView: children stay hidden until expanded; indent grows per level", () => {
    const e = mount(
      W.TreeView({ nodes: [{ id: "a", label: "A", children: [{ id: "a1", label: "A1" }] }] }),
    );
    eq(e.children[0].children[0].children.length, 1); // row only
    eq(e.getExpanded().length, 0);

    e.expandAll();
    eq(e.getExpanded().length, 2);
    eq(e.children[0].children[0].children.length, 2); // row + children container
    const childRow = e.children[0].children[0].children[1].children[0].children[0];
    eq(childRow.children[1].textContent, "A1");
    eq(childRow.style.marginLeft, "20px");

    e.collapseAll();
    eq(e.getExpanded().length, 0);
    eq(e.children[0].children[0].children.length, 1);
  });

  t("TreeView: setSelected/getSelected drive selection and fire onSelect", () => {
    let sel = null;
    const e = mount(
      W.TreeView({
        nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
        onSelect: (n) => (sel = n.id),
      }),
    );
    eq(e.getSelected(), null);
    e.setSelected("b");
    eq(e.getSelected(), "b");
    eq(sel, "b");
  });

  t("TreeView: clicking a row selects it, and ref is invoked twice", () => {
    let sel = null;
    const e = mount(W.TreeView({ nodes: [{ id: "a", label: "A" }], onSelect: (n) => (sel = n.id) }));
    e.children[0].children[0].children[0].click();
    eq(sel, "a");
    eq(e.getSelected(), "a");

    let refCalls = 0;
    W.TreeView({ nodes: [], ref: () => refCalls++ });
    eq(refCalls, 2);
  });

  // ---------------- Carousel ----------------
  t("Carousel: empty items returns null", () => {
    eq(W.Carousel({ items: [] }), null);
  });

  t("Carousel: a single item renders only the track, at the default 300px height", () => {
    const e = mount(W.Carousel({ items: [W.Text({ text: "1" })] }));
    eq(e.tagName, "DIV");
    eq(e.children.length, 1); // no arrows, no dots
    eq(cs(e).height, "300px");
    eq(cs(e).overflow, "hidden");
    eq(cs(e).position, "relative");
    eq(e.children[0].children.length, 1);
  });

  t("Carousel: arrows and dots render only with more than one item", () => {
    const on = mount(W.Carousel({ items: [W.Text({ text: "1" }), W.Text({ text: "2" })] }));
    eq(on.children.length, 4); // track, prev arrow, next arrow, dots
    eq(on.children[3].children.length, 2);

    const off = mount(
      W.Carousel({
        items: [W.Text({ text: "1" }), W.Text({ text: "2" })],
        showArrows: false,
        showDots: false,
      }),
    );
    eq(off.children.length, 1);
  });

  t("Carousel: track is items.length*100% wide and each slide is 100/n%", () => {
    const e = mount(
      W.Carousel({ items: [W.Text({ text: "1" }), W.Text({ text: "2" })], height: 200 }),
    );
    eq(e.children[0].style.width, "200%");
    eq(e.children[0].children[0].style.width, "50%");
    eq(cs(e).height, "200px");
  });

  t("Carousel: goTo moves the track, updates the index, and fires onIndexChange", () => {
    let seen = null;
    const e = mount(
      W.Carousel({
        items: [W.Text({ text: "1" }), W.Text({ text: "2" })],
        onIndexChange: (i) => (seen = i),
      }),
    );
    eq(typeof e.next, "function");
    eq(typeof e.prev, "function");
    eq(typeof e.goTo, "function");
    eq(typeof e._cleanup, "function");
    eq(e.getCurrentIndex(), 0);
    e.goTo(1);
    eq(e.getCurrentIndex(), 1);
    eq(seen, 1);
    eq(e.children[0].style.transform, "translateX(-50%)");
  });

  t("Carousel: {src, alt} items become cover-fit images", () => {
    const e = mount(W.Carousel({ items: [{ src: "/a.png", alt: "A" }] }));
    const img = e.children[0].children[0].firstChild;
    eq(img.tagName, "IMG");
    eq(img.getAttribute("src"), "/a.png");
    eq(img.getAttribute("alt"), "A");
    eq(cs(img).objectFit, "cover");
  });

  // ---------------- InstallButton ----------------
  t("InstallButton: renders a BUTTON with the default label", () => {
    const e = mount(W.InstallButton({}));
    eq(e.tagName, "BUTTON");
    eq(e.textContent.includes("Install"), true);
  });

  t("InstallButton: text, borderRadius, and padding are forwarded to Button", () => {
    const e = mount(W.InstallButton({ text: "Get the app", borderRadius: 32 }));
    eq(e.textContent.includes("Get the app"), true);
    eq(cs(e).borderTopLeftRadius, "32px");
    eq(cs(e).paddingTop, "12px");
    eq(cs(e).paddingLeft, "24px");
  });

  t("InstallButton: onClick fires on press even with no install prompt available", () => {
    let n = 0;
    const e = mount(W.InstallButton({ onClick: () => n++ }));
    e.click();
    eq(n, 1);
  });

  t("InstallButton: builds without beforeinstallprompt and exposes a cleanup hook", () => {
    const e = mount(W.InstallButton({ onInstalled: () => {} }));
    eq(typeof e._cleanup, "function");
    eq(e.tagName, "BUTTON");
  });
}
