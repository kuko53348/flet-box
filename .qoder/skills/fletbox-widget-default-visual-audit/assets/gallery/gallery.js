// FletBox all-widget gallery — one page, every widget, both themes.
// Colors are the framework defaults: no widget here overrides a color token.
import * as FB from "./src/index.js";

const { colors } = FB;
// probe.mjs measures widgets from the page; it needs the same module instance,
// so the tokens it reads are the ones on screen.
window.__FB = FB;
const T = (text, props = {}) => FB.Text({ text, ...props });

const IMG_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
     <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/>
     </linearGradient></defs>
     <rect width="320" height="180" fill="url(#g)"/>
     <circle cx="160" cy="90" r="42" fill="rgba(255,255,255,0.85)"/>
   </svg>`,
)}`;

const CODE = `import { Column, Text } from "flet-box";

export const Screen = () =>
  Column({
    gap: 12,
    children: [
      Text({ text: "Hello", color: colors.primary }),
    ],
  });`;

const cleanups = [];
let renderedNames = [];
let failures = [];

function overlayNode() {
  const node = document.body.lastElementChild;
  if (node) node.style.zIndex = "1";
  return node;
}

const sections = [
  {
    title: "Layout",
    items: [
      {
        name: "Container",
        note: "columna por defecto, pinta surface",
        height: 120,
        build: () =>
          FB.Container({
            padding: 16,
            gap: 6,
            child: [T("Container surface"), T("second line", { color: colors.textSecondary })],
          }),
      },
      {
        name: "Row",
        build: () =>
          FB.Row({ gap: 10, children: [T("Row"), FB.Chip({ label: "chip" }), T("end")] }),
      },
      {
        name: "Column",
        build: () => FB.Column({ gap: 6, children: [T("Column one"), T("Column two")] }),
      },
      {
        name: "Stack",
        height: 110,
        build: () =>
          FB.Stack({
            width: 220,
            height: 100,
            children: [
              FB.Container({ width: 140, height: 70, child: T("back") }),
              FB.Text({ text: "front" }),
            ],
          }),
      },
      {
        name: "GridView",
        height: 200,
        build: () =>
          FB.GridView({
            data: Array.from({ length: 6 }, (_, i) => i + 1),
            columns: 3,
            spacing: 8,
            itemHeight: 60,
            height: 190,
            renderItem: (n) => T(`g${n}`),
          }),
      },
      {
        name: "ListView",
        height: 200,
        build: () =>
          FB.ListView({
            data: Array.from({ length: 10 }, (_, i) => `fila ${i + 1}`),
            height: 190,
            itemSize: 32,
            renderItem: (item) => T(item),
          }),
      },
    ],
  },
  {
    title: "Contenido",
    items: [
      {
        name: "Text",
        build: () =>
          FB.Column({
            gap: 4,
            children: [
              T("Texto por defecto"),
              T("Secundario", { color: colors.textSecondary }),
              T("Énfasis", { weight: "700" }),
            ],
          }),
      },
      { name: "Icon", build: () => FB.Icon({ name: "favorite", size: 28 }) },
      {
        name: "Image",
        build: () =>
          FB.Image({ src: IMG_SRC, alt: "placeholder", width: 180, height: 100, fit: "cover" }),
      },
      {
        name: "Avatar",
        build: () => FB.Avatar({ name: "Ada Lovelace", size: 48, online: true }),
      },
      {
        name: "Card",
        build: () => FB.Card({ child: T("Card surface with elevation") }),
      },
      {
        name: "ListTile",
        build: () =>
          FB.ListTile({
            leftItem: FB.Icon({ name: "folder" }),
            title: "ListTile title",
            subtitle: "Subtitle in secondary ink",
          }),
      },
      {
        name: "Divider",
        build: () => FB.Column({ gap: 8, children: [T("above"), FB.Divider(), T("below")] }),
      },
      {
        name: "Accordion",
        wide: true,
        build: () =>
          FB.Accordion({ title: "Accordion title", children: [T("Hidden content")] }),
      },
      {
        name: "Markdown",
        wide: true,
        build: () =>
          FB.Markdown({
            text: "## Markdown\n\n**Bold**, *italic*, `code` and a [link](https://flet-box.dev).\n\n- one\n- two",
          }),
      },
      {
        name: "CodeViewer",
        wide: true,
        build: () =>
          FB.CodeViewer({ code: CODE, title: "src/app.js", showLineNumbers: true }),
      },
    ],
  },
  {
    title: "Formularios",
    items: [
      { name: "Button", build: () => FB.Button({ text: "Button" }) },
      {
        name: "Input",
        build: () => FB.Input({ label: "Email", placeholder: "you@example.com", type: "email" }),
      },
      {
        name: "Dropdown",
        build: () =>
          FB.Dropdown({
            label: "Country",
            value: "cl",
            options: [
              { label: "Chile", value: "cl" },
              { label: "Perú", value: "pe" },
              { label: "Argentina", value: "ar" },
            ],
          }),
      },
      {
        name: "Checkbox",
        build: () =>
          FB.Row({
            gap: 10,
            children: [FB.Checkbox({ checked: true }), T("Checkbox label")],
          }),
      },
      {
        name: "Radio",
        build: () =>
          FB.Column({
            gap: 8,
            children: [
              FB.Row({ gap: 10, children: [FB.Radio({ name: "g", value: "a", selected: true }), T("Option A")] }),
              FB.Row({ gap: 10, children: [FB.Radio({ name: "g", value: "b" }), T("Option B")] }),
            ],
          }),
      },
      { name: "Switch", build: () => FB.Switch({ label: "Notifications", value: true }) },
      { name: "Slider", build: () => FB.Slider({ value: 62, showValue: true }) },
      { name: "Rating", build: () => FB.Rating({ value: 4, showValue: true }) },
      {
        name: "Chip",
        build: () =>
          FB.Row({ gap: 8, children: [FB.Chip({ label: "filled" }), FB.Chip({ label: "outlined", variant: "outlined" })] }),
      },
      {
        name: "Badge",
        build: () => FB.Badge({ value: 3, child: T("Badge target") }),
      },
      {
        name: "Pagination",
        build: () =>
          FB.Pagination({ totalItems: 57, pageSize: 10, currentPage: 3, onPageChange: () => {} }),
      },
      {
        name: "Stepper",
        wide: true,
        build: () =>
          FB.Stepper({
            steps: [{ label: "Account" }, { label: "Profile" }, { label: "Done" }],
            activeStep: 1,
          }),
      },
      {
        name: "FloatingActionButton",
        build: () => FB.FloatingActionButton({}),
      },
      {
        name: "InstallButton",
        note: "oculto hasta beforeinstallprompt; forzado visible aquí",
        build: () => {
          const btn = FB.InstallButton({});
          btn.style.position = "relative";
          btn.style.left = "auto";
          btn.style.bottom = "auto";
          btn.style.transform = "none";
          btn.style.display = "flex";
          btn.style.visibility = "visible";
          btn.style.opacity = "1";
          return btn;
        },
      },
    ],
  },
  {
    title: "Feedback y estados",
    items: [
      { name: "ProgressBar", build: () => FB.ProgressBar({ value: 62, showValue: true }) },
      { name: "CircularBar", build: () => FB.CircularBar({ value: 72, label: "Done" }) },
      {
        name: "CircularChart",
        build: () =>
          FB.CircularChart({
            data: [
              { label: "A", value: 40 },
              { label: "B", value: 25 },
              { label: "C", value: 35 },
            ],
            showLabels: true,
          }),
      },
      {
        name: "Skeleton",
        build: () => FB.Skeleton({ variant: "text", count: 3 }),
      },
      {
        name: "Tooltip",
        note: "aparece al pasar el cursor",
        build: () => FB.Tooltip({ text: "Tooltip text", child: FB.Button({ text: "Hover me" }) }),
      },
      {
        name: "SnackBar",
        wide: true,
        note: "cinco presets (normal, success, error, warning, info)",
        build: () => {
          const col = document.createElement("div");
          col.className = "snack-col";
          const types = ["normal", "success", "error", "warning", "info"];
          const labels = {
            normal: "SnackBar normal",
            success: "SnackBar success",
            error: "SnackBar error",
            warning: "SnackBar warning",
            info: "SnackBar info",
          };
          for (const type of types) {
            const snack = FB.SnackBar({ message: labels[type], type, duration: 0, action: "Undo" });
            const node = snack.getElement();
            node.style.position = "relative";
            node.style.left = "auto";
            node.style.right = "auto";
            node.style.top = "auto";
            node.style.bottom = "auto";
            node.style.margin = "0";
            node.style.opacity = "1";
            node.style.transform = "none";
            node.style.zIndex = "0";
            col.appendChild(node);
            cleanups.push(() => snack.close());
          }
          return col;
        },
      },
    ],
  },
  {
    title: "Datos y medios",
    items: [
      {
        name: "Chart",
        wide: true,
        height: 260,
        build: () =>
          FB.Chart({
            type: "bar",
            data: [12, 19, 7, 15],
            labels: ["Q1", "Q2", "Q3", "Q4"],
            height: 240,
          }),
      },
      {
        name: "DataTable",
        wide: true,
        build: () =>
          FB.DataTable({
            columns: ["Name", "Role", "Status"],
            rows: [
              { Name: "Ada", Role: "Engineer", Status: "Active" },
              { Name: "Linus", Role: "Maintainer", Status: "Active" },
              { Name: "Grace", Role: "Admiral", Status: "Retired" },
            ],
          }),
      },
      {
        name: "TreeView",
        build: () =>
          FB.TreeView({
            defaultExpanded: true,
            nodes: [
              {
                id: "src",
                label: "src",
                children: [
                  { id: "index", label: "index.js" },
                  { id: "app", label: "app.js", children: [{ id: "deep", label: "deep.js" }] },
                ],
              },
            ],
          }),
      },
      {
        name: "Carousel",
        build: () =>
          FB.Carousel({
            height: 160,
            items: [1, 2, 3].map((n) =>
              FB.Container({ padding: 24, child: T(`Slide ${n}`) }),
            ),
          }),
      },
      {
        name: "QRCode",
        build: () => FB.QRCode({ value: "https://flet-box.dev", size: 140 }),
      },
      {
        name: "Maps",
        note: "los tiles necesitan red",
        height: 230,
        build: () =>
          FB.Maps({ center: [-33.45, -70.66], zoom: 4, height: 210, width: "100%" }),
      },
      {
        name: "DraggBox / DroppBox",
        covers: ["DraggBox", "DroppBox"],
        wide: true,
        build: () =>
          FB.Row({
            gap: 14,
            children: [
              FB.DraggBox({ child: T("Drag me") }),
              FB.DroppBox({ child: T("Drop here") }),
            ],
          }),
      },
      {
        name: "Video",
        note: "sin archivo: solo el chrome nativo",
        build: () => FB.Video({ src: "", height: 160 }),
      },
      {
        name: "Audio",
        note: "sin archivo: solo el chrome nativo",
        build: () => FB.Audio({ src: "", controls: true }),
      },
      {
        name: "Inspector",
        wide: true,
        build: () =>
          FB.CodeViewer({
            code: FB.Inspector(FB.Button({ text: "Inspect me" })),
            title: "Inspector output",
            maxHeight: 160,
          }),
      },
      { name: "AdSense", note: "placeholder (necesita client/slot)", build: () => FB.AdSense({}) },
      { name: "AdMob", note: "placeholder (plugin nativo)", build: () => FB.AdMob({}) },
    ],
  },
  {
    title: "Overlays",
    items: [
      {
        name: "Modal",
        wide: true,
        height: 300,
        build: () => {
          const modal = FB.Modal({
            title: "Modal title",
            content: T("Modal content painted on the theme surface."),
            actions: [
              FB.Button({ text: "Cancel", variant: "outlined" }),
              FB.Button({ text: "Accept" }),
            ],
          });
          const node = overlayNode();
          modal.open();
          cleanups.push(() => modal.destroy());
          return node;
        },
      },
      {
        name: "AlertDialog",
        wide: true,
        height: 300,
        build: () => {
          const dialog = FB.AlertDialog({
            title: "Delete file?",
            message: "This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel",
          });
          const node = overlayNode();
          dialog.open();
          cleanups.push(() => dialog.close());
          return node;
        },
      },
      {
        name: "BottomSheet",
        wide: true,
        height: 300,
        build: () => {
          const sheet = FB.BottomSheet({
            title: "BottomSheet title",
            content: T("Sheet content in the default surface."),
            actions: [FB.Button({ text: "Action" })],
          });
          const node = overlayNode();
          sheet.open();
          cleanups.push(() => sheet.destroy());
          return node;
        },
      },
    ],
  },
  {
    title: "Navegación",
    items: [
      {
        name: "AppBar",
        wide: true,
        build: () =>
          FB.AppBar({
            title: "AppBar",
            leading: FB.Icon({ name: "menu" }),
            actions: [FB.Icon({ name: "search" }), FB.Icon({ name: "more_vert" })],
            sticky: false,
          }),
      },
      {
        name: "Tabs",
        wide: true,
        build: () =>
          FB.Tabs({
            tabs: [{ label: "Overview" }, { label: "Details" }],
            children: [T("Overview pane"), T("Details pane")],
          }),
      },
      {
        name: "BottomNavigation",
        wide: true,
        build: () =>
          FB.BottomNavigation({
            items: [
              { icon: "home", label: "Home", route: "/" },
              { icon: "person", label: "Profile", route: "/me" },
              { icon: "settings", label: "Settings", route: "/settings" },
            ],
            currentIndex: 0,
            useRouter: false,
          }),
      },
      {
        name: "CollapsibleSideBar",
        build: () =>
          FB.CollapsibleSideBar({
            expanded: true,
            id: "gallery-sidebar",
            children: FB.Column({ gap: 8, children: [T("Sidebar"), T("Item one"), T("Item two")] }),
          }),
      },
      {
        name: "Drawer",
        covers: ["Drawer", "DrawerItem"],
        height: 300,
        build: () => {
          const drawer = FB.Drawer({
            header: T("Drawer header"),
            body: [
              FB.DrawerItem({ label: "Home", route: "/" }),
              FB.DrawerItem({ label: "Profile", route: "/me" }),
            ],
            footer: T("Drawer footer"),
          });
          const stage = drawer.element;
          stage.style.width = "100%";
          stage.style.height = "100%";
          drawer.open();
          cleanups.push(() => drawer.destroy());
          return stage;
        },
      },
      {
        name: "Scaffold",
        wide: true,
        height: 420,
        note: "modo estático: appBar + body + bottomBar + FAB",
        build: () => {
          const scaffold = FB.Scaffold({
            appBar: FB.AppBar({
              title: "Scaffold",
              sticky: false,
              leading: FB.Icon({ name: "menu" }),
            }),
            body: FB.Column({ gap: 8, children: [T("Scaffold body"), T("Second line")] }),
            bottomBar: FB.BottomNavigation({
              items: [
                { icon: "home", label: "Home", route: "/" },
                { icon: "person", label: "Profile", route: "/me" },
              ],
              currentIndex: 0,
              useRouter: false,
            }),
            fab: FB.FloatingActionButton({}),
          });
          scaffold.style.height = "100%";
          return scaffold;
        },
      },
      {
        name: "AdaptiveScaffold",
        wide: true,
        height: 420,
        note: "modo estático: AppBar + leftNavBar (desktop)",
        build: () => {
          const adaptive = FB.AdaptiveScaffold({
            appBar: FB.AppBar({ title: "Adaptive (desktop)", sticky: false }),
            body: T("AdaptiveScaffold body"),
            leftNavBar: [T("Nav item")],
            forceDesktop: true,
          });
          adaptive.style.height = "100%";
          return adaptive;
        },
      },
    ],
  },
  {
    title: "Animaciones",
    items: [
      {
        name: "AnimatedBox",
        note: "scale en bucle (loop: true)",
        build: () =>
          FB.AnimatedBox({
            child: T("Pulse"),
            animations: [{ effect: "scale", from: 1, to: 1.12, duration: 900, loop: true, reverse: true }],
          }),
      },
      {
        name: "AnimatedText",
        note: "entrada letra a letra desde abajo",
        build: () =>
          FB.AnimatedText({
            child: T("Animated letters"),
            animations: [{ effect: "translateY", from: 14, to: 0, duration: 700 }],
            delayBetween: 0.06,
          }),
      },
      {
        name: "ParallaxBox",
        note: "type: hover — mueve el mouse dentro del recuadro",
        // The one card in this file that passes a color. ParallaxBox has no paint of its
        // own, so without a gradient there is nothing to parallax — and the audit's 1:1
        // reading of this card is a gallery artifact, never a framework default.
        build: () =>
          FB.ParallaxBox({
            type: "hover",
            speed: 0.3,
            maxOffset: 16,
            child: FB.Container({
              width: 240,
              height: 120,
              borderRadius: 12,
              padding: 0,
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              child: T("Mueve el mouse", { color: "#ffffff" }),
            }),
          }),
      },
      {
        name: "MatrixRain",
        note: "position: absolute dentro de la tarjeta",
        height: 160,
        build: () =>
          FB.MatrixRain({ position: "absolute", zIndex: 0, fontSize: 12, speed: 0.6 }),
      },
    ],
  },
];

const EXPECTED = [
  "AdSense", "AdMob", "Container", "Row", "Column", "Stack", "ListView", "GridView",
  "Text", "Button", "Icon", "Image", "Avatar", "Card", "ListTile", "ProgressBar",
  "Rating", "Chip", "Badge", "Divider", "Accordion", "Input", "Radio", "Switch",
  "Checkbox", "Dropdown", "SnackBar", "Modal", "BottomSheet", "AlertDialog",
  "FloatingActionButton", "CodeViewer", "Inspector", "DraggBox", "DroppBox",
  "DataTable", "Carousel", "Tooltip", "Pagination", "TreeView", "Stepper",
  "Skeleton", "Chart", "QRCode", "Maps", "Slider", "InstallButton", "Video",
  "Audio", "CircularBar", "CircularChart", "Markdown",
  "Scaffold", "AdaptiveScaffold", "AppBar", "CollapsibleSideBar", "Drawer",
  "BottomNavigation", "Tabs", "DrawerItem",
];

const app = document.getElementById("app");
const bar = document.getElementById("bar");
const meta = document.getElementById("meta");
const lightBtn = document.getElementById("light");
const darkBtn = document.getElementById("dark");

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

const paintChrome = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.background = colors.background;
  document.body.style.background = colors.background;
  document.body.style.color = colors.text;
  bar.style.background = colors.card;
  bar.style.borderBottomColor = colors.border;
  for (const [btn, name] of [[lightBtn, "light"], [darkBtn, "dark"]]) {
    const active = theme === name;
    btn.style.background = active ? colors.primary : colors.card;
    btn.style.color = active ? colors.onPrimary : colors.text;
    btn.style.borderColor = colors.border;
  }
};

const card = (item) => {
  const wrap = el("div", `card${item.wide ? " wide" : ""}`);
  wrap.style.background = colors.card;
  wrap.style.border = `1px solid ${colors.border}`;
  wrap.style.boxShadow = `0 1px 2px ${colors.shadow}`;

  const head = el("div");
  head.appendChild(el("div", "name", item.name));
  if (item.note) {
    const note = el("div", "note", item.note);
    note.style.color = colors.textSecondary;
    head.appendChild(note);
  }
  wrap.appendChild(head);

  const stage = el("div", "stage");
  if (item.height) stage.style.height = `${item.height}px`;
  try {
    const node = item.build();
    if (node) stage.appendChild(node);
    else throw new Error("build returned nothing");
    renderedNames.push(...(item.covers || [item.name]));
  } catch (err) {
    failures.push({ name: item.name, error: String(err && err.stack ? err.stack : err) });
    const box = el("div", "err", `${item.name}: ${err && err.message ? err.message : err}`);
    box.style.background = colors.errorBg;
    box.style.color = colors.text;
    stage.appendChild(box);
  }
  wrap.appendChild(stage);
  return wrap;
};

const render = (theme) => {
  FB.setTheme(theme);
  while (cleanups.length) {
    try {
      cleanups.pop()();
    } catch (e) {
      /* overlay already gone */
    }
  }
  renderedNames = [];
  failures = [];
  paintChrome(theme);
  app.replaceChildren();

  let count = 0;
  for (const section of sections) {
    const title = el("div", "group-title", section.title);
    title.style.color = colors.textSecondary;
    app.appendChild(title);

    const grid = el("div", "grid");
    for (const item of section.items) {
      grid.appendChild(card(item));
      count++;
    }
    app.appendChild(grid);
  }

  const missing = EXPECTED.filter((name) => !renderedNames.includes(name));
  meta.textContent = `${count} tarjetas · ${theme} · ${failures.length} errores`;
  meta.style.color = failures.length ? colors.danger : colors.textSecondary;
  window.__GALLERY = {
    theme,
    cards: count,
    rendered: renderedNames.length,
    failures,
    missing,
  };
  console.log("[gallery]", window.__GALLERY);
};

lightBtn.addEventListener("click", () => render("light"));
darkBtn.addEventListener("click", () => render("dark"));
render("light");
