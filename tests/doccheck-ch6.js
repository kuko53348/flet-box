// Chapter 6 doc-verification probe fragment.
// Asserts the documented behavior of: DataTable, Chart, CircularChart, Markdown, CodeViewer, QRCode, Inspector.
export default function run(ctx) {
  const { t, eq, cs, mount, W } = ctx;
  // W = widget namespace; t(name, fn); eq(actual, expected, msg?); cs(el)=getComputedStyle; mount(el) appends off-screen & returns el

  // ---------------- DataTable ----------------
  t("DataTable: renders a DIV wrapper around a real TABLE", () => {
    const e = mount(W.DataTable({ columns: ["name"], rows: [{ name: "Ada" }] }));
    eq(e.tagName, "DIV");
    const table = e.querySelector("table");
    if (!table) throw new Error("no <table> inside the wrapper");
    eq(table.tagName, "TABLE");
    eq(cs(table).borderCollapse, "collapse");
  });

  t("DataTable: one TH per column, one TR per row, cells read row[key]", () => {
    const e = mount(
      W.DataTable({
        columns: ["name", "age"],
        rows: [
          { name: "Ada", age: 36 },
          { name: "Alan", age: 41 },
        ],
      }),
    );
    eq(e.querySelectorAll("thead th").length, 2);
    eq(e.querySelectorAll("tbody tr").length, 2);
    eq(e.querySelectorAll("tbody td").length, 4);
    eq(e.querySelectorAll("thead th")[0].textContent, "name");
    const cells = e.querySelectorAll("tbody tr")[1].querySelectorAll("td");
    eq(cells[0].textContent, "Alan");
    eq(cells[1].textContent, "41");
  });

  t("DataTable: column objects use label/key/align/format", () => {
    const e = mount(
      W.DataTable({
        columns: [
          { key: "name", label: "Name", format: (v) => String(v).toUpperCase() },
          { key: "amount", label: "Amount", align: "right" },
        ],
        rows: [{ name: "ada", amount: 10 }],
      }),
    );
    const ths = e.querySelectorAll("thead th");
    eq(ths[0].textContent, "Name");
    eq(ths[1].textContent, "Amount");
    const tds = e.querySelectorAll("tbody td");
    eq(tds[0].textContent, "ADA");
    eq(tds[1].textContent, "10");
    eq(cs(tds[1]).textAlign, "right");
  });

  t("DataTable: striped/hoverable/bordered default to true", () => {
    const e = mount(
      W.DataTable({ columns: ["a"], rows: [{ a: "1" }, { a: "2" }] }),
    );
    const trs = e.querySelectorAll("tbody tr");
    if (trs[0].style.backgroundColor === trs[1].style.backgroundColor) {
      throw new Error("striped rows should differ by default");
    }
    eq(cs(trs[0]).transitionProperty, "background-color");
    eq(cs(e.querySelector("table")).borderTopStyle, "solid");

    const plain = mount(
      W.DataTable({
        columns: ["a"],
        rows: [{ a: "1" }, { a: "2" }],
        striped: false,
        hoverable: false,
        bordered: false,
      }),
    );
    const plainTrs = plain.querySelectorAll("tbody tr");
    eq(plainTrs[0].style.backgroundColor, "transparent");
    eq(plainTrs[1].style.backgroundColor, "transparent");
    eq(plainTrs[0].style.transition, "");
    eq(cs(plain.querySelector("table")).borderTopStyle, "none");
  });

  t("DataTable: onRowClick(row, index) and updateData rebuild the body", () => {
    let seen = null;
    const e = mount(
      W.DataTable({
        columns: ["a"],
        rows: [{ a: "1" }, { a: "2" }],
        onRowClick: (row, index) => {
          seen = [row.a, index];
        },
      }),
    );
    const trs = e.querySelectorAll("tbody tr");
    eq(cs(trs[0]).cursor, "pointer");
    trs[1].click();
    eq(seen[0], "2");
    eq(seen[1], 1);

    e.updateData([{ a: "x" }]);
    eq(e.querySelectorAll("tbody tr").length, 1);
    eq(e.querySelector("tbody td").textContent, "x");
    eq(e.querySelectorAll("thead th").length, 1);
  });

  // ---------------- Chart ----------------
  t("Chart: empty data returns null", () => {
    eq(W.Chart({ data: [] }), null);
    eq(W.Chart({}), null);
  });

  t("Chart: DIV container > scroll DIV > CANVAS", () => {
    const e = mount(W.Chart({ type: "line", data: [1, 2, 3] }));
    eq(e.tagName, "DIV");
    eq(e.children.length, 1);
    const scroll = e.children[0];
    eq(scroll.tagName, "DIV");
    eq(cs(scroll).position, "relative");
    const canvas = e.querySelector("canvas");
    if (!canvas) throw new Error("no <canvas> in the chart");
    eq(canvas.tagName, "CANVAS");
    eq(canvas.parentElement, scroll);
  });

  t("Chart: defaults are height 400px, width 100%, borderRadius 8px", () => {
    const e = mount(W.Chart({ type: "bar", data: [4, 5, 6] }));
    eq(e.style.height, "400px");
    eq(e.style.width, "100%");
    eq(cs(e).borderRadius, "8px");
    eq(cs(e).overflow, "hidden");
  });

  t("Chart: height/width/borderRadius props override the defaults", () => {
    const e = mount(
      W.Chart({ type: "area", data: [1, 2, 3], height: 220, width: 480, borderRadius: 0 }),
    );
    eq(e.style.height, "220px");
    eq(e.style.width, "480px");
    eq(cs(e).borderRadius, "0px");
  });

  t("Chart: candle data accepts OHLC objects and 4-element arrays", () => {
    const e = mount(
      W.Chart({
        data: [
          { open: 10, high: 12, low: 9, close: 11 },
          [11, 13, 10, 12],
        ],
      }),
    );
    eq(e.tagName, "DIV");
    eq(e.querySelectorAll("canvas").length, 1);
    eq(typeof e.updateData, "function");
    eq(typeof e.redraw, "function");
    e.updateData([{ open: 1, high: 2, low: 0, close: 1.5 }], ["D1"]);
    e.redraw();
  });

  // ---------------- CircularChart ----------------
  t("CircularChart: DIV container holding a CANVAS", () => {
    const e = mount(W.CircularChart({ data: [{ value: 1 }], size: 120, animate: false }));
    eq(e.tagName, "DIV");
    const canvas = e.querySelector("canvas");
    if (!canvas) throw new Error("no <canvas> in the chart");
    eq(canvas.tagName, "CANVAS");
    eq(cs(e).position, "relative");
  });

  t("CircularChart: size fixes the box and the canvas backing store", () => {
    const e = mount(W.CircularChart({ data: [{ value: 60 }, { value: 40 }], size: 160, animate: false }));
    eq(e.style.display, "inline-block");
    eq(e.style.width, "160px");
    eq(e.style.height, "160px");
    eq(e.querySelector("canvas").width, 160);
  });

  t("CircularChart: without size it is a block that fills its container", () => {
    const e = mount(W.CircularChart({ data: [{ value: 1 }], animate: false }));
    eq(e.style.display, "block");
    eq(e.style.width, "100%");
    eq(e.style.height, "auto");
  });

  t("CircularChart: semiCircle halves the canvas on that axis", () => {
    const e = mount(W.CircularChart({ data: [{ value: 1 }], size: 200, semiCircle: "bottom", animate: false }));
    eq(e.style.height, "100px");
    eq(e.querySelector("canvas").height, 100);
    eq(e.querySelector("canvas").width, 200);
  });

  t("CircularChart: ref receives the canvas; instance methods exist", () => {
    let got = null;
    const e = mount(
      W.CircularChart({ data: [{ value: 1 }], size: 100, animate: false, ref: (c) => { got = c; } }),
    );
    if (!got) throw new Error("ref was not called");
    eq(got.tagName, "CANVAS");
    eq(got, e.querySelector("canvas"));
    eq(typeof e.updateData, "function");
    eq(typeof e.redraw, "function");
    eq(typeof e.setCornerRadius, "function");
    e.updateData([{ value: 3 }, { value: 1 }], false);
    e.setCornerRadius(4);
    e.redraw();
  });

  // ---------------- Markdown ----------------
  // NOTE: src/widgets/index.js currently has `export { Markdown }` commented out, so the
  // widget may be missing from the namespace. Both branches are documented on Markdown.md.
  if (typeof W.Markdown === "function") {
    t("Markdown: DIV wrapper with a .markdown-content child", () => {
      const e = mount(W.Markdown({ text: "# hi" }));
      eq(e.tagName, "DIV");
      eq(e.children.length, 1);
      const content = e.children[0];
      if (!content.classList.contains("markdown-content")) throw new Error("no .markdown-content div");
      eq(typeof e.getContent, "function");
      eq(typeof e.getSource, "function");
      eq(typeof e.updateContent, "function");
    });

    t("Markdown: headings, bold and inline code are parsed to HTML", () => {
      const e = mount(W.Markdown({ text: "# Title\nThis is **bold** and `x = 1`." }));
      eq(e.querySelector("h1").textContent, "Title");
      eq(e.querySelector("strong").textContent, "bold");
      eq(e.querySelector("code").textContent, "x = 1");
    });

    t("Markdown: source/content are aliases of text", () => {
      const viaSource = mount(W.Markdown({ source: "## from source" }));
      eq(viaSource.querySelector("h2").textContent, "from source");
      const viaContent = mount(W.Markdown({ content: "### from content" }));
      eq(viaContent.querySelector("h3").textContent, "from content");
    });

    t("Markdown: links open in a new tab and lists become <li>", () => {
      const e = mount(W.Markdown({ text: "[docs](https://example.com)\n- one\n- two" }));
      const a = e.querySelector("a");
      eq(a.getAttribute("href"), "https://example.com");
      eq(a.getAttribute("target"), "_blank");
      eq(a.getAttribute("rel"), "noopener");
      eq(e.querySelectorAll("li").length, 2);
    });

    t("Markdown: getSource/getContent/updateContent and HTML sanitizing", () => {
      const e = mount(W.Markdown({ text: "# one" }));
      eq(e.getSource(), "# one");
      if (!e.getContent().includes("<h1>one</h1>")) throw new Error("getContent did not return the html");
      e.updateContent("## two");
      eq(e.querySelector("h2").textContent, "two");
      eq(e.querySelector("h1"), null);

      const dirty = mount(W.Markdown({ text: "<script>window.__pwned = 1;</script>safe" }));
      eq(dirty.querySelector("script"), null);
      if (!dirty.textContent.includes("safe")) throw new Error("text was dropped by the sanitizer");
    });
  } else {
    t("Markdown: not re-exported from the widget namespace (documented in Notes)", () => {
      eq(W.Markdown, undefined);
    });
  }

  // ---------------- CodeViewer ----------------
  t("CodeViewer: DIV container with a single scroll panel when there is no title", () => {
    const e = mount(W.CodeViewer({ code: "let a = 1;" }));
    eq(e.tagName, "DIV");
    eq(e.children.length, 1);
    eq(cs(e).display, "flex");
    eq(cs(e).flexDirection, "column");
    const panel = e.children[0];
    eq(cs(panel).maxHeight, "400px");
    eq(cs(panel).overflowY, "auto");
  });

  t("CodeViewer: code is escaped and syntax highlighted into spans", () => {
    const e = mount(W.CodeViewer({ code: 'const s = "hi"; // note' }));
    if (!e.textContent.includes('const s = "hi";')) throw new Error("code text missing");
    if (e.querySelectorAll("span").length === 0) throw new Error("no highlight spans");
    const wrap = e.lastElementChild.firstElementChild;
    eq(cs(wrap).fontFamily, "monospace");
    eq(cs(wrap).fontSize, "12px");
    eq(cs(wrap).whiteSpace, "pre");
  });

  t("CodeViewer: title + showHeader render a header bar above the panel", () => {
    const e = mount(W.CodeViewer({ code: "a", title: "app.js" }));
    eq(e.children.length, 2);
    eq(e.children[0].textContent, "app.js");
    const hidden = mount(W.CodeViewer({ code: "a", title: "app.js", showHeader: false }));
    eq(hidden.children.length, 1);
  });

  t("CodeViewer: showLineNumbers builds a gutter div per line", () => {
    const e = mount(
      W.CodeViewer({ code: "a\nb\nc", showLineNumbers: true, startingLineNumber: 5 }),
    );
    const flex = e.lastElementChild.firstElementChild;
    const gutter = flex.children[0];
    const codeCol = flex.children[1];
    eq(gutter.children.length, 3);
    eq(codeCol.children.length, 3);
    eq(gutter.children[0].textContent, "5");
    eq(gutter.children[2].textContent, "7");
    eq(cs(gutter).width, "40px");
  });

  t("CodeViewer: non-string code is JSON-stringified; updateCode re-renders", () => {
    const e = mount(W.CodeViewer({ code: { a: 1 } }));
    if (!e.textContent.includes('"a": 1')) throw new Error("object code was not JSON printed");
    eq(typeof e.updateCode, "function");
    eq(typeof e.updateTitle, "function");
    eq(typeof e.scrollTo, "function");
    eq(typeof e.scrollToStart, "function");
    eq(typeof e.scrollToEnd, "function");
    e.updateCode("let b = 2;");
    if (!e.textContent.includes("let b = 2;")) throw new Error("updateCode did not re-render");
    e.scrollToStart();
    e.scrollToEnd();
  });

  // ---------------- QRCode ----------------
  t("QRCode: empty value returns null", () => {
    eq(W.QRCode({ value: "" }), null);
    eq(W.QRCode({}), null);
  });

  t("QRCode: inline-block DIV wrapper holding one CANVAS", () => {
    const e = mount(W.QRCode({ value: "https://flet-box.dev" }));
    eq(e.tagName, "DIV");
    eq(cs(e).display, "inline-block");
    eq(e.children.length, 1);
    const canvas = e.children[0];
    eq(canvas.tagName, "CANVAS");
    eq(canvas.style.width, "200px");
    eq(canvas.style.height, "200px");
  });

  t("QRCode: size sets the canvas box in pixels", () => {
    const e = mount(W.QRCode({ value: "abc", size: 128 }));
    const canvas = e.querySelector("canvas");
    eq(canvas.style.width, "128px");
    eq(canvas.style.height, "128px");
  });

  t("QRCode: margin is the quiet zone, not a CSS margin", () => {
    const e = mount(W.QRCode({ value: "abc", margin: 4 }));
    eq(cs(e).marginTop, "0px");
    eq(cs(e).marginLeft, "0px");
  });

  t("QRCode: getValue/updateValue/getCanvas/getDataURL/download", () => {
    const e = mount(W.QRCode({ value: "first" }));
    eq(e.getValue(), "first");
    eq(typeof e.getDataURL, "function");
    eq(typeof e.download, "function");
    eq(e.getCanvas(), e.querySelector("canvas"));
    e.updateValue("second");
    eq(e.getValue(), "second");
  });

  // ---------------- Inspector ----------------
  t("Inspector: is a function that returns a string and creates no DOM", () => {
    eq(typeof W.Inspector, "function");
    const label = W.Text({ text: "Hello" });
    const out = W.Inspector(label);
    eq(typeof out, "string");
    eq(out, "Span()");
    eq(label.children.length, 0);
  });

  t("Inspector: walks the mounted child tree", () => {
    const tree = W.Column({ children: [W.Text({ text: "a" }), W.Text({ text: "b" })] });
    const out = W.Inspector(tree);
    eq(out.startsWith("Div({"), true);
    eq(out.includes("children: ["), true);
    eq(out.includes("Span()"), true);
    eq(out.endsWith("\n})"), true);
  });

  t("Inspector: names come from the underlying tag (Button keeps its wrapper div)", () => {
    const out = W.Inspector(W.Button({ text: "Save" }));
    eq(out.startsWith("Button({"), true);
    eq(out.includes("Div({"), true);
    eq(out.includes("Span()"), true);
  });

  t("Inspector: indent shifts the closing brace", () => {
    const tree = W.Column({ children: [W.Text({ text: "a" })] });
    eq(W.Inspector(tree, 0).endsWith("\n})"), true);
    eq(W.Inspector(tree, 1).endsWith("\n  })"), true);
    eq(W.Inspector(tree, 2).endsWith("\n    })"), true);
  });

  t("Inspector: non-element input is stringified", () => {
    eq(W.Inspector(null), "null");
    eq(W.Inspector(undefined), "undefined");
    eq(W.Inspector("oops"), "oops");
  });
}
