// tests/a11y.test.js
// The accessibility contract: a keyboard can see, reach and press what the
// pointer can, and an overlay cannot lose the person inside it.
//
// Every assertion below FAILED before its fix, which is the house rule for this
// file:
//   - `applyEffects` wrote `outline: none` onto every widget, so no focus ring
//     existed anywhere in a FletBox app;
//   - `onPress` is a `click`, and a `click` on a `div` is not something a
//     keyboard produces — a pressable Container was unreachable, nameless and
//     dead on Enter;
//   - the overlays closed on Escape but let Tab walk out behind the panel;
//   - `Input` wrote `outline: none` onto the native field, so the one control a
//     person must see is focused wore the platform ring or, in the `filled`
//     variant, nothing at all;
//   - a failed validation was a red rim and a line of text: nothing told a
//     reader the field was invalid, or the reason.
//
// It publishes `window.__A11Y = { pass, fail, results }`.
import {
  Accordion,
  Button,
  CircularChart,
  Checkbox,
  Container,
  Dropdown,
  Icon,
  Input,
  Modal,
  Radio,
  Rating,
  Row,
  SnackBar,
  Stepper,
  Switch,
  Text,
} from "../src/widgets/index.js";
import {
  AppBar,
  BottomNavigation,
  Drawer,
  Scaffold,
  Tabs,
} from "../src/navigations/index.js";
import { colors, palettes } from "../src/utils/themes.js";

const results = [];
const record = (name, ok, detail) => results.push({ name, ok, detail });

/** Builds a KeyboardEvent the way a real one arrives: bubbling and cancelable. */
const key = (name, options = {}) =>
  new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...options });

/** Mounts a widget for a real Tab order — a detached element answers differently. */
const mount = (widget) => {
  document.body.appendChild(widget);
  return widget;
};

const run = () => {
  // ============================================================
  // 1. THE RING EXISTS, AND NOTHING TAKES IT AWAY
  // ============================================================
  const pressCount = { n: 0 };
  const card = mount(
    Container({ padding: 16, onPress: () => (pressCount.n += 1), child: Text({ text: "Card" }) }),
  );

  record(
    "building a widget injects the focus rule once",
    document.querySelectorAll("#fletbox-focus-ring").length === 1,
    `found ${document.querySelectorAll("#fletbox-focus-ring").length} tags after several widgets`,
  );

  const rule = document.getElementById("fletbox-focus-ring")?.textContent || "";
  record(
    "the rule is a :focus-visible rule keyed to the theme token",
    rule.includes(":focus-visible") && rule.includes("var(--color-focusRing,"),
    rule.slice(0, 60),
  );

  record(
    "both palettes answer the token, so the ring moves with the theme",
    [palettes.light, palettes.dark].every((p) => /^#[0-9a-f]{6}$/i.test(p.focusRing || "")) &&
      /^#[0-9a-f]{6}$/i.test(colors.focusRing || ""),
    `light=${palettes.light.focusRing} dark=${palettes.dark.focusRing} live=${colors.focusRing}`,
  );

  // ============================================================
  // 2. A PRESSABLE IS REACHABLE AND HAS A NAME
  // ============================================================
  record(
    "a pressable div is put on the Tab path",
    card.getAttribute("role") === "button" && card.tabIndex === 0,
    `role=${card.getAttribute("role")} tabindex=${card.getAttribute("tabindex")}`,
  );

  const enter = key("Enter");
  card.dispatchEvent(enter);
  record("Enter presses it", pressCount.n === 1, `presses=${pressCount.n}`);

  const space = key(" ");
  card.dispatchEvent(space);
  record(
    "Space presses it and stops the page from scrolling",
    pressCount.n === 2 && space.defaultPrevented,
    `presses=${pressCount.n} defaultPrevented=${space.defaultPrevented}`,
  );

  card.dispatchEvent(key("Enter", { repeat: true }));
  record(
    "holding the key is one press, not one per frame",
    pressCount.n === 2,
    `presses=${pressCount.n}`,
  );

  const nested = card.firstElementChild;
  nested.dispatchEvent(key("Enter"));
  record(
    "a key on a nested control is not the wrapper's press",
    pressCount.n === 2,
    `presses=${pressCount.n} — the wrapper answered a key aimed at its child`,
  );

  const named = mount(
    Container({ role: "link", tabIndex: -1, onPress: () => {}, child: Text({ text: "Deep link" }) }),
  );
  record(
    "an explicit role and tabindex are a decision the engine keeps",
    named.getAttribute("role") === "link" && named.getAttribute("tabindex") === "-1",
    `role=${named.getAttribute("role")} tabindex=${named.getAttribute("tabindex")}`,
  );

  const off = mount(Container({ disabled: true, onPress: () => {}, child: Text({ text: "Off" }) }));
  record(
    "a disabled pressable is not a stop",
    !off.hasAttribute("tabindex") && !off.hasAttribute("role"),
    `tabindex=${off.getAttribute("tabindex")} role=${off.getAttribute("role")}`,
  );

  // ============================================================
  // 3. HTML THAT ALREADY WORKS IS LEFT ALONE
  // ============================================================
  let buttonPresses = 0;
  const real = mount(Button({ text: "Save", onPress: () => (buttonPresses += 1) }));
  record(
    "a native button gets no second role",
    !real.hasAttribute("role"),
    `role=${real.getAttribute("role")} on a <${real.tagName.toLowerCase()}>`,
  );
  // A synthetic key never activates a real `<button>` — the browser does that on
  // its own, and only for a real one. So the engine's share of the press is what
  // this measures: a second handler stacked on HTML's would answer this event.
  real.dispatchEvent(key("Enter"));
  record(
    "a native button is not double-wired",
    buttonPresses === 0,
    `presses=${buttonPresses} — the engine added a key handler to a native button`,
  );

  const still = mount(Row({ child: Text({ text: "not pressable" }) }));
  record(
    "a plain layout is not suddenly a button",
    !still.hasAttribute("role") && !still.hasAttribute("tabindex"),
    `role=${still.getAttribute("role")}`,
  );

  // ============================================================
  // 4. AN UPDATE DOES NOT DOUBLE-WIRE THE KEY
  // ============================================================
  let updated = 0;
  const live = mount(Container({ onPress: () => (updated += 1), child: Text({ text: "v1" }) }));
  live.update({ onPress: () => (updated += 1) });
  live.dispatchEvent(key("Enter"));
  record(
    "after an update one key is one press",
    updated === 1,
    `presses=${updated} — the key handler was registered twice`,
  );

  // ============================================================
  // 5. A FIELD IS STILL A FIELD
  // ============================================================
  const field = mount(Input({ label: "Email", placeholder: "you@example.com" }));
  const inputElement = field.querySelector("input");
  record(
    "an Input's field is reachable and labelled",
    !!inputElement && inputElement.tabIndex >= 0,
    inputElement ? `tabindex=${inputElement.tabIndex}` : "no input found",
  );

  // ============================================================
  // 6. THE CONTROLS THAT ARE NOT HTML SAY WHAT THEY ARE
  // ============================================================
  // A box, a ring and a pill are three `div`s wearing different borders. Without a
  // role a screen reader reads all three as "button" and the person cannot tell a
  // checkbox from a switch before activating it.
  let boxToggled = 0;
  const box = mount(Checkbox({ label: "Accept", onPress: () => (boxToggled += 1) }));
  box.dispatchEvent(key("Enter"));
  record(
    "a Checkbox is a checkbox and Enter checks it",
    box.getAttribute("role") === "checkbox" &&
      box.getAttribute("aria-checked") === "true" &&
      boxToggled === 1,
    `role=${box.getAttribute("role")} aria-checked=${box.getAttribute("aria-checked")} presses=${boxToggled}`,
  );

  const ring = mount(Radio({ label: "First", selected: true }));
  record(
    "a Radio is a radio and reports its state",
    ring.getAttribute("role") === "radio" && ring.getAttribute("aria-checked") === "true",
    `role=${ring.getAttribute("role")} aria-checked=${ring.getAttribute("aria-checked")}`,
  );

  let pillOn = null;
  const pill = mount(Switch({ label: "Alerts", onPress: (v) => (pillOn = v) }));
  pill.dispatchEvent(key(" "));
  record(
    "a Switch is a switch and its state follows the press",
    pill.getAttribute("role") === "switch" && pill.getAttribute("aria-checked") === "true" && pillOn === true,
    `role=${pill.getAttribute("role")} aria-checked=${pill.getAttribute("aria-checked")} onPress=${pillOn}`,
  );

  // ============================================================
  // 7. A SELECT BUILT FROM DIVS STILL BEHAVES LIKE A SELECT
  // ============================================================
  const chosen = [];
  const picker = mount(
    Dropdown({
      label: "Country",
      options: ["Chile", "Peru", "Brazil"],
      onPress: (v) => chosen.push(v),
    }),
  );
  const combo = picker.querySelector('[role="combobox"]');
  record(
    "the field is a combobox, collapsed and reachable",
    !!combo &&
      combo.getAttribute("aria-expanded") === "false" &&
      combo.getAttribute("aria-haspopup") === "listbox" &&
      combo.tabIndex === 0,
    combo
      ? `expanded=${combo.getAttribute("aria-expanded")} tabindex=${combo.getAttribute("tabindex")}`
      : "no [role=combobox] in the field",
  );

  record(
    "the label names the field",
    !!combo &&
      combo.getAttribute("aria-labelledby") ===
        picker.querySelector("label")?.id &&
      !!combo.getAttribute("aria-labelledby"),
    `aria-labelledby=${combo?.getAttribute("aria-labelledby")} label id=${picker.querySelector("label")?.id}`,
  );

  if (combo) {
    combo.focus();
    combo.dispatchEvent(key("ArrowDown"));
    const list = document.querySelector('[role="listbox"]');
    const options = list ? [...list.querySelectorAll('[role="option"]')] : [];
    record(
      "ArrowDown opens a listbox of options, none of them a tab stop",
      !!list &&
        combo.getAttribute("aria-expanded") === "true" &&
        combo.getAttribute("aria-controls") === list.id &&
        options.length === 3 &&
        options.every((o) => o.getAttribute("tabindex") === "-1"),
      `list=${!!list} options=${options.length} tabindexes=${options.map((o) => o.getAttribute("tabindex")).join(",")}`,
    );

    record(
      "the highlighted row is announced, not focused",
      combo.getAttribute("aria-activedescendant") === options[0]?.id &&
        document.activeElement === combo,
      `activedescendant=${combo.getAttribute("aria-activedescendant")} first option=${options[0]?.id}`,
    );

    const before = combo.getAttribute("aria-activedescendant");
    combo.dispatchEvent(key("ArrowDown"));
    record(
      "a second ArrowDown moves to the next row",
      combo.getAttribute("aria-activedescendant") !== before,
      `still ${combo.getAttribute("aria-activedescendant")}`,
    );

    combo.dispatchEvent(key("End"));
    record(
      "End jumps to the last row",
      combo.getAttribute("aria-activedescendant") === options[options.length - 1]?.id,
      combo.getAttribute("aria-activedescendant"),
    );

    combo.dispatchEvent(key("Escape"));
    record(
      "Escape closes without committing the highlighted row",
      chosen.length === 0 &&
        combo.getAttribute("aria-expanded") === "false" &&
        !combo.hasAttribute("aria-controls") &&
        !combo.hasAttribute("aria-activedescendant"),
      `chosen=${JSON.stringify(chosen)} expanded=${combo.getAttribute("aria-expanded")} stale controls=${combo.hasAttribute("aria-controls")}/${combo.hasAttribute("aria-activedescendant")}`,
    );

    // Re-opened with nothing selected, so the arrows start on the first row again.
    combo.dispatchEvent(key("ArrowDown"));
    combo.dispatchEvent(key("Enter"));
    record(
      "Enter takes the row the arrows rest on — once",
      chosen.length === 1 && chosen[0] === "Chile" && combo.getAttribute("aria-expanded") === "false",
      `chosen=${JSON.stringify(chosen)}`,
    );

    // The value came from a key, so the field has to show it.
    record(
      "the chosen value is the text a reader hears",
      (combo.textContent || "").includes("Chile"),
      `field reads "${combo.textContent}"`,
    );

    picker.update({ disabled: true });
    record(
      "a disabled combobox says so and leaves the Tab path",
      combo.getAttribute("aria-disabled") === "true" && combo.tabIndex === -1,
      `aria-disabled=${combo.getAttribute("aria-disabled")} tabindex=${combo.getAttribute("tabindex")}`,
    );
    const openKeys = ["ArrowDown", "Enter"];
    openKeys.forEach((k) => combo.dispatchEvent(key(k)));
    record(
      "and no key opens it",
      !document.querySelector('[role="listbox"]'),
      "a disabled field still opened a menu",
    );
    picker.remove();
  }

  // ============================================================
  // 8. A DISCLOSURE AND A TAB BAR SAY WHAT THEY ARE
  // ============================================================
  const acc = mount(Accordion({ title: "Shipping", children: Text({ text: "Free over 50" }) }));
  const hinge = acc.querySelector('[aria-expanded]');
  const pane = acc.querySelector('[role="region"]');
  record(
    "an Accordion header is a button that says which way it opens",
    !!hinge &&
      hinge.getAttribute("role") === "button" &&
      hinge.getAttribute("aria-expanded") === "false" &&
      hinge.tabIndex === 0,
    hinge
      ? `role=${hinge.getAttribute("role")} expanded=${hinge.getAttribute("aria-expanded")} tabindex=${hinge.getAttribute("tabindex")}`
      : "no [aria-expanded] in the header",
  );

  record(
    "and points at the region it reveals",
    !!pane && pane.id === hinge?.getAttribute("aria-controls") && pane.getAttribute("aria-labelledby") === hinge?.id,
    `aria-controls=${hinge?.getAttribute("aria-controls")} region id=${pane?.id} labelled by=${pane?.getAttribute("aria-labelledby")}`,
  );

  hinge?.dispatchEvent(key("Enter"));
  record(
    "Enter answers the disclosure at the press, not when the height lands",
    hinge?.getAttribute("aria-expanded") === "true",
    `aria-expanded=${hinge?.getAttribute("aria-expanded")}`,
  );

  acc.update({ disabled: true });
  record(
    "a disabled Accordion leaves the Tab path",
    hinge?.getAttribute("aria-disabled") === "true" && hinge.tabIndex === -1,
    `aria-disabled=${hinge?.getAttribute("aria-disabled")} tabindex=${hinge.getAttribute("tabindex")}`,
  );
  acc.remove();

  const views = mount(
    Tabs({
      tabs: ["One", "Two", "Three"],
      children: [Text({ text: "first pane" }), Text({ text: "second pane" }), Text({ text: "third pane" })],
    }),
  );
  const stops = [...views.querySelectorAll('[role="tab"]')];
  const tablist = views.querySelector('[role="tablist"]');
  const panel2 = views.querySelector('[role="tabpanel"]');
  record(
    "Tabs is a tablist of tabs over a tabpanel",
    !!tablist && stops.length === 3 && !!panel2,
    `tablist=${!!tablist} tabs=${stops.length} panel=${!!panel2}`,
  );

  record(
    "the bar is one stop on the Tab path, not three",
    stops.map((s) => s.getAttribute("tabindex")).join(",") === "0,-1,-1",
    `tabindexes=${stops.map((s) => s.getAttribute("tabindex")).join(",")}`,
  );

  record(
    "every tab names the pane it controls",
    stops.every((s) => s.getAttribute("aria-controls") === panel2?.id) &&
      panel2?.getAttribute("aria-labelledby") === stops[0].id,
    `controls=${stops.map((s) => s.getAttribute("aria-controls")).join(",")} panel named by=${panel2?.getAttribute("aria-labelledby")}`,
  );

  stops[0].focus();
  stops[0].dispatchEvent(key("ArrowRight"));
  record(
    "ArrowRight activates the next tab and carries the keyboard with it",
    stops[1].getAttribute("aria-selected") === "true" &&
      document.activeElement === stops[1] &&
      stops[0].getAttribute("tabindex") === "-1",
    `selected=${stops.map((s) => s.getAttribute("aria-selected")).join(",")} activeElement=${document.activeElement?.textContent || document.activeElement?.tagName}`,
  );

  record(
    "and the pane follows, still named by the tab that opened it",
    (panel2?.textContent || "").includes("second pane") &&
      panel2?.getAttribute("aria-labelledby") === stops[1].id,
    `pane reads "${panel2?.textContent}" named by=${panel2?.getAttribute("aria-labelledby")}`
  );

  stops[1].dispatchEvent(key("End"));
  record(
    "End jumps to the last tab",
    stops[2].getAttribute("aria-selected") === "true" && document.activeElement === stops[2],
    `selected=${stops.map((s) => s.getAttribute("aria-selected")).join(",")}`,
  );

  stops[2].dispatchEvent(key("ArrowRight"));
  record(
    "the bar wraps instead of going dead at the ends",
    stops[0].getAttribute("aria-selected") === "true",
    `selected=${stops.map((s) => s.getAttribute("aria-selected")).join(",")}`,
  );
  views.remove();

  // ============================================================
  // 9. THE SCORE, THE STEP AND THE SLICE ARE SAID, NOT ONLY DRAWN
  // ============================================================
  const stars = mount(Rating({ value: 3 }));
  const group = stars.querySelector('[role="radiogroup"]');
  const radios = [...stars.querySelectorAll('[role="radio"]')];
  record(
    "a Rating is one stop whose name is the score",
    group?.getAttribute("aria-label") === "3 out of 5" &&
      radios.length === 5 &&
      radios.map((r) => r.getAttribute("tabindex")).join(",") === "-1,-1,0,-1,-1" &&
      radios[2].getAttribute("aria-checked") === "true",
    `label="${group?.getAttribute("aria-label")}"> tabindexes=${radios.map((r) => r.getAttribute("tabindex")).join(",")}`,
  );

  radios[2].focus();
  radios[2].dispatchEvent(key("ArrowRight"));
  record(
    "the arrows pick a star and carry the keyboard with them",
    radios[3].getAttribute("aria-checked") === "true" &&
      radios[2].getAttribute("aria-checked") === "false" &&
      group?.getAttribute("aria-label") === "4 out of 5" &&
      document.activeElement === radios[3],
    `label="${group?.getAttribute("aria-label")}" checked=${radios.map((r) => r.getAttribute("aria-checked")).join(",")}`,
  );
  stars.remove();

  const steps = mount(
    Stepper({ steps: [{ label: "Cart" }, { label: "Pay" }, { label: "Done" }], activeStep: 1 }),
  );
  const stepNames = [...steps.querySelectorAll('[aria-label]')].map((el) => el.getAttribute("aria-label"));
  record(
    "a Stepper says which step is current and that the last one is not there yet",
    stepNames.some((n) => n === "Pay (current)") &&
      stepNames.some((n) => n === "Cart (completed)") &&
      stepNames.some((n) => n === "Done (upcoming)") &&
      steps.querySelectorAll('[aria-current="step"]').length === 1,
    `names=${JSON.stringify(stepNames)}`,
  );
  steps.remove();

  const bar = mount(
    BottomNavigation({
      items: [{ icon: "home", label: "Home" }, { icon: "person", label: "Profile" }],
      useRouter: false,
      currentIndex: 1,
    }),
  );
  const tabs2 = [...bar.querySelectorAll("div[role]")].filter((el) => el.getAttribute("role") === "button");
  record(
    "a bottom bar names itself and marks the page you are on",
    bar.tagName === "NAV" &&
      bar.getAttribute("aria-label") === "Main navigation" &&
      tabs2.length === 2 &&
      tabs2[1].getAttribute("aria-current") === "page" &&
      !tabs2[0].hasAttribute("aria-current"),
    `tag=${bar.tagName} buttons=${tabs2.length} current=${tabs2.map((b) => b.getAttribute("aria-current") || "—").join(",")}`,
  );
  bar.remove();

  const donut = mount(
    CircularChart({ data: [{ label: "Rent", value: 40 }, { label: "Food", value: 25 }], size: 120 }),
  );
  const picture = donut.querySelector("canvas");
  record(
    "a chart drawn on canvas is a named picture, not an empty rectangle",
    picture?.getAttribute("role") === "img" &&
      (picture?.getAttribute("aria-label") || "").includes("Rent 40"),
    `role=${picture?.getAttribute("role")} label="${picture?.getAttribute("aria-label")}"`,
  );
  donut.remove();

  // ============================================================
  // 10. A TOAST IS SAID, NOT ONLY SHOWN
  // ============================================================
  const news = SnackBar({ message: "Saved", type: "success", duration: 0 });
  const newsBar = news.getElement();
  const newsRegion = newsBar.nextElementSibling;
  record(
    "a confirmation waits its turn and the bar still holds its words",
    newsRegion?.getAttribute("role") === "status" &&
      newsRegion?.getAttribute("aria-live") === "polite" &&
      newsBar.textContent.includes("Saved") &&
      newsRegion.textContent === "",
    `region=${newsRegion?.getAttribute("role")}/${newsRegion?.getAttribute("aria-live")} bar="${newsBar.textContent}" region text="${newsRegion?.textContent}"`,
  );
  news.close();

  const alarm = SnackBar({ message: "Disk full", type: "error", duration: 0 });
  const alarmRegion = alarm.getElement().nextElementSibling;
  record(
    "an error interrupts instead of queueing",
    alarmRegion?.getAttribute("role") === "alert" &&
      alarmRegion?.getAttribute("aria-live") === "assertive",
    `region=${alarmRegion?.getAttribute("role")}/${alarmRegion?.getAttribute("aria-live")}`,
  );
  alarm.close();

  // ============================================================
  // 11. AN OPEN OVERLAY HOLDS THE KEYBOARD
  // ============================================================
  const opener = mount(Button({ text: "Open", onPress: () => {} }));
  opener.focus();

  const modal = Modal({
    title: "Delete item",
    showCloseButton: true,
    content: Row({
      children: [Button({ text: "Cancel" }), Button({ text: "Delete" })],
    }),
  });
  modal.open();

  const panel = document.querySelector('[role="dialog"][aria-modal="true"]');
  record(
    "an open Modal announces itself as a modal dialog",
    !!panel,
    panel ? "" : "no [role=dialog][aria-modal=true] in the document",
  );

  record(
    "opening it moves the keyboard inside the panel",
    !!panel && panel.contains(document.activeElement),
    `activeElement=${document.activeElement?.tagName?.toLowerCase()}`,
  );

  if (panel) {
    const stops = [...panel.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')];
    const first = stops[0];
    const last = stops[stops.length - 1];

    last.focus();
    last.dispatchEvent(key("Tab"));
    record(
      "Tab on the last control wraps to the first",
      document.activeElement === first,
      `activeElement is ${document.activeElement === last ? "still the last stop — Tab escaped behind the scrim" : "not the first"}`,
    );

    first.focus();
    first.dispatchEvent(key("Tab", { shiftKey: true }));
    record(
      "Shift+Tab on the first wraps to the last",
      document.activeElement === last,
      "the trap does not run backwards",
    );

    record(
      "the scrim is not a stop on the Tab path",
      panel.parentElement.getAttribute("tabindex") === "-1",
      `tabindex=${panel.parentElement.getAttribute("tabindex")}`,
    );
  }

  modal.close();
  record(
    "closing hands the keyboard back to what opened it",
    document.activeElement === opener,
    `activeElement=${document.activeElement?.textContent || document.activeElement?.tagName}`,
  );
  modal.destroy();

  const drawer = Drawer({ body: [Button({ text: "Home" })] });
  drawer.open();
  const drawerPanel = document.querySelector('div[role="dialog"]');
  record(
    "an open Drawer holds the keyboard too",
    !!drawerPanel && drawerPanel.contains(document.activeElement),
    drawerPanel
      ? `activeElement inside=${drawerPanel.contains(document.activeElement)}`
      : "no dialog panel found",
  );
  drawer.close();
  drawer.destroy();

  // ============================================================
  // 12. THE FIELD RINGS AS A WHOLE CONTROL
  // ============================================================
  // A text field is the one control that is not a `div` the engine decorates: it
  // is a real `<input>` built by hand, and it used to write `outline: none` onto
  // itself. An inline declaration outranks every stylesheet rule, so the engine's
  // ring never reached the field — and the `filled` variant, which has no border
  // to highlight, showed no focus signal at all.
  //
  // Where the ring lands matters as much as that it lands: the text box is only
  // part of the field, so a ring around it cuts through the control whenever an
  // icon or a trailing button sits beside it. `data-fb-field` marks the wrapper
  // the ring belongs on.
  //
  // The sentinel colour is the other half of the point: it proves the ring is the
  // TOKEN, so an app that re-registers its palette moves the ring with the theme.
  document.documentElement.style.setProperty("--color-focusRing", "#00ff00");

  const ringOf = (el) => {
    const cs = getComputedStyle(el);
    return `${cs.outlineStyle}|${cs.outlineWidth}|${cs.outlineColor}|${cs.outlineOffset}`;
  };

  const fields = [
    ["outlined", { variant: "outlined" }, false],
    ["filled", { variant: "filled" }, false],
    ["underlined", { variant: "underlined" }, false],
    // The case the ring's position is really for: an icon and a reveal button
    // live in the field beside the text box, so a ring around the text box alone
    // is a box drawn inside the control it is supposed to mark.
    ["with icons", { variant: "outlined", type: "password", iconLeft: "search", passwordToggle: true }, true],
  ];

  for (const [name, props, widerThanField] of fields) {
    const el = mount(Input({ label: `Field ${name}`, ...props }));
    const field = el.querySelector("input");
    const wrapper = field.parentElement;
    // The wrapper animates `all 0.2s`, so the ring is mid-flight the instant
    // focus lands. The contract is the settled value; measure that.
    wrapper.style.transition = "none";
    const borderBefore = `${wrapper.style.borderColor}|${wrapper.style.borderBottomColor}|${wrapper.style.boxShadow}`;
    field.focus();

    const ringed = [wrapper, field].filter(
      (n) => getComputedStyle(n).outlineStyle === "solid" && getComputedStyle(n).outlineWidth === "2px",
    );
    const boxWide = wrapper.offsetWidth > field.offsetWidth + 16;
    record(
      `a focused ${name} field rings the whole control, once`,
      ringOf(wrapper) === "solid|2px|rgb(0, 255, 0)|2px" &&
        ringOf(field) !== "solid|2px|rgb(0, 255, 0)|2px" &&
        ringed.length === 1 &&
        field.style.outline === "" &&
        (!widerThanField || boxWide),
      `wrapper=${ringOf(wrapper)} (${wrapper.offsetWidth}px) field=${ringOf(field)} (${field.offsetWidth}px) inline="${field.style.outline}" rings=${ringed.length} — a ring the engine paints is 2px at 2px offset; the platform one is 3px at 0`,
    );

    const borderAfter = `${wrapper.style.borderColor}|${wrapper.style.borderBottomColor}|${wrapper.style.boxShadow}`;
    record(
      `focusing a ${name} field leaves the validation border alone`,
      borderBefore === borderAfter,
      `before=${borderBefore} after=${borderAfter}`,
    );
    field.blur();
    wrapper.style.transition = "";
  }

  document.documentElement.style.removeProperty("--color-focusRing");

  // ============================================================
  // 13. AN ICON THE FRAMEWORK WIRES UP IS STILL A CONTROL
  // ============================================================
  // Three places hand a clickable glyph its handler after the factory returned:
  // the AppBar's back arrow, the Input's `onIconPress`, and the menu icon a
  // Scaffold auto-wires to its drawer. A `click` on a `span` is not something a
  // keyboard produces, and an unnamed `Icon` is `aria-hidden` decoration — so all
  // three were mouse-only, and the moment they did something they were still
  // invisible to a reader.
  let backPresses = 0;
  const barWithBack = mount(
    AppBar({ showBackButton: true, onBackPress: () => (backPresses += 1) }),
  );
  const back = barWithBack.querySelector('[aria-label="Go back"]');
  record(
    "the AppBar back arrow is named, reachable and not hidden",
    !!back &&
      back.getAttribute("role") === "button" &&
      back.tabIndex === 0 &&
      back.getAttribute("aria-hidden") === null,
    back
      ? `role=${back.getAttribute("role")} tabindex=${back.getAttribute("tabindex")} aria-hidden=${back.getAttribute("aria-hidden")}`
      : "no [aria-label='Go back'] inside the AppBar",
  );
  if (back) {
    back.dispatchEvent(key("Enter"));
    record("Enter on the back arrow goes back", backPresses === 1, `presses=${backPresses}`);
  }

  let iconPresses = 0;
  const searchField = mount(
    Input({ label: "Query", iconLeft: "search", onIconPress: () => (iconPresses += 1) }),
  );
  const search = searchField.querySelector('[aria-label="search"]');
  record(
    "an Input icon with onIconPress is a control named after its glyph",
    !!search &&
      search.getAttribute("role") === "button" &&
      search.tabIndex === 0 &&
      search.getAttribute("aria-hidden") === null,
    search
      ? `role=${search.getAttribute("role")} tabindex=${search.getAttribute("tabindex")}`
      : "no [aria-label='search'] inside the field",
  );
  if (search) {
    search.dispatchEvent(key(" "));
    record(
      "Space presses the field's icon",
      iconPresses === 1 && search === searchField.querySelector('[aria-label="search"]'),
      `presses=${iconPresses}`,
    );
  }
  record(
    "a decorative icon keeps its aria-hidden and stays off the Tab path",
    (() => {
      const plain = mount(Input({ label: "Plain", iconLeft: "email" }));
      const glyph = plain.querySelector(".material-icons");
      return (
        !!glyph &&
        glyph.getAttribute("aria-hidden") === "true" &&
        glyph.tabIndex === -1 &&
        glyph.getAttribute("role") === null
      );
    })(),
    "an icon nobody can press became a stop anyway",
  );

  const scaffoldDrawer = Drawer({ body: [Button({ text: "In the drawer" })] });
  const scaffold = mount(
    Scaffold({
      appBar: AppBar({ leading: Icon({ name: "menu" }) }),
      drawer: scaffoldDrawer,
      body: Text({ text: "Body" }),
    }),
  );
  const menu = [...scaffold.querySelectorAll(".material-icons")].find(
    (el) => el.textContent.trim() === "menu",
  );
  record(
    "the menu icon a Scaffold auto-wires is a control, not hidden decoration",
    !!menu &&
      menu.getAttribute("role") === "button" &&
      menu.getAttribute("aria-label") === "Open menu" &&
      menu.getAttribute("aria-hidden") === null &&
      menu.tabIndex === 0,
    menu
      ? `role=${menu.getAttribute("role")} label=${menu.getAttribute("aria-label")} aria-hidden=${menu.getAttribute("aria-hidden")} tabindex=${menu.getAttribute("tabindex")}`
      : "no menu glyph found in the Scaffold's app bar",
  );
  if (menu) {
    menu.dispatchEvent(key("Enter"));
    const drawerPanel = document.querySelector('div[role="dialog"]');
    record(
      "Enter on that icon opens the drawer and takes the keyboard with it",
      !!drawerPanel && drawerPanel.contains(document.activeElement),
      `activeElement=${document.activeElement?.tagName?.toLowerCase()}`,
    );
    scaffoldDrawer.close();
    scaffoldDrawer.destroy?.();
  }

  // An app that already names the menu in its own language must keep that name.
  // The shell's "Open menu" is a fallback for an unnamed icon, not a rename: an
  // app cannot fix the overwrite from outside, because the shell owns the glyph
  // after it wires the drawer to it.
  const localizedDrawer = Drawer({ body: [Button({ text: "Dentro" })] });
  const localizedScaffold = mount(
    Scaffold({
      appBar: AppBar({
        leading: Icon({
          name: "menu",
          "aria-label": "Abrir el menú",
          onclick: () => {},
        }),
      }),
      drawer: localizedDrawer,
      body: Text({ text: "Body" }),
    }),
  );
  const localizedMenu = [
    ...localizedScaffold.querySelectorAll(".material-icons"),
  ].find((el) => el.textContent.trim() === "menu");
  record(
    "an app's own aria-label on the menu icon survives Scaffold's drawer wiring",
    !!localizedMenu &&
      localizedMenu.getAttribute("aria-label") === "Abrir el menú" &&
      localizedMenu.getAttribute("role") === "button" &&
      localizedMenu.tabIndex === 0,
    localizedMenu
      ? `label=${localizedMenu.getAttribute("aria-label")} role=${localizedMenu.getAttribute("role")} tabindex=${localizedMenu.getAttribute("tabindex")}`
      : "no menu glyph found in the Scaffold's app bar",
  );
  localizedDrawer.destroy?.();

  // ============================================================
  // 14. AN INVALID FIELD SAYS SO OUT LOUD
  // ============================================================
  // The red rim is the visual half of "this is wrong". The other half is the
  // state (`aria-invalid`) and the reason (`aria-describedby`), and they have to
  // appear with the message and leave with it — a described-by pointing at a
  // `display: none` node is a control claiming a description it does not have.
  const validated = mount(Input({ label: "Email", validation: "email" }));
  const emailInput = validated.querySelector("input");
  validated.setValue("nope");
  const describedBy = emailInput.getAttribute("aria-describedby");
  const messageNode = describedBy ? document.getElementById(describedBy) : null;
  record(
    "an invalid field is aria-invalid and describes itself with the message",
    emailInput.getAttribute("aria-invalid") === "true" &&
      !!messageNode &&
      messageNode.textContent === "Invalid email address" &&
      getComputedStyle(messageNode).display !== "none",
    `aria-invalid=${emailInput.getAttribute("aria-invalid")} describedby=${describedBy} text=${JSON.stringify(messageNode?.textContent ?? null)}`,
  );
  record(
    "the validation message is a polite live region",
    messageNode?.getAttribute("aria-live") === "polite",
    `aria-live=${messageNode?.getAttribute("aria-live") ?? "missing"}`,
  );
  validated.setValue("person@example.com");
  record(
    "a field that becomes valid drops the state and the description",
    emailInput.getAttribute("aria-invalid") === null &&
      emailInput.getAttribute("aria-describedby") === null &&
      !!messageNode &&
      getComputedStyle(messageNode).display === "none",
    `aria-invalid=${emailInput.getAttribute("aria-invalid")} describedby=${emailInput.getAttribute("aria-describedby")} display=${messageNode ? getComputedStyle(messageNode).display : "no node"}`,
  );

  // The sweep, run where every widget in this file is in the document.
  const hidden = [...document.querySelectorAll("body *")].filter(
    (el) => el.style.outline === "none",
  );
  record(
    "no widget in the document carries an inline outline",
    hidden.length === 0,
    `${hidden.length} element(s) hide the ring inline, which outranks the stylesheet: ${hidden
      .map((el) => `${el.tagName.toLowerCase()}${el.tagName === "INPUT" ? "[type=" + el.type + "]" : ""}[role=${el.getAttribute("role") || "-"}]`)
      .join(", ")}`,
  );

  window.__A11Y = {
    pass: results.filter((r) => r.ok).length,
    fail: results.filter((r) => !r.ok).length,
    total: results.length,
    results,
  };

  const summary = document.getElementById("summary");
  if (summary) {
    summary.textContent = `A11Y: ${window.__A11Y.pass}/${window.__A11Y.total} OK${
      window.__A11Y.fail ? ` — ${window.__A11Y.fail} FAILED` : ""
    }`;
    summary.style.color = window.__A11Y.fail ? "#ff6b6b" : "#4ec9b0";
  }
  const out = document.getElementById("out");
  if (out) {
    for (const r of results) {
      const li = document.createElement("li");
      li.style.color = r.ok ? "#4ec9b0" : "#ff6b6b";
      li.textContent = `${r.ok ? "PASS" : "FAIL"} ${r.name}${r.detail ? " — " + r.detail : ""}`;
      out.appendChild(li);
    }
  }
  console.log("[flet-box a11y]", window.__A11Y);
};

run();
