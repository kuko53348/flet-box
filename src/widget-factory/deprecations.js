// The names FletBox still honours but no longer recommends.
//
// Every row is a promise to an app written against the old spelling: the prop
// keeps working, and the migration guide says what to write instead. This
// table is the single source — the guide (`docs/guides/migration.md`), the
// codemod in `audit-fix` and the contract test (`scripts/check-migrations.mjs`)
// all read it, so a rename cannot be documented in one place and forgotten in
// another.
//
// A row names a widget, because the same spelling means different things in
// different widgets: `onToggle` is the old name of `onPress` on `Switch` and
// on `Accordion`, and the *current* name on `TreeView`, so a flat list of
// names would send a `TreeView` to rename a prop that is already right.

/**
 * @typedef {object} Deprecation
 * @property {string} widget   The widget whose prop is the old spelling.
 * @property {string} from     The old prop name.
 * @property {string|null} to  The prop to write instead, or `null` when the old
 *   prop is read by nobody and the key is simply removed.
 * @property {string} since    The release that renamed it.
 * @property {{ prop: string, value: string, to: string }} [alternate]
 *   The other target, when the call itself says which one applies.
 * @property {string[]} [guard]
 *   Props whose presence means the old prop is already inert, so the codemod
 *   leaves the call alone instead of changing what the screen shows.
 */

/** @type {Deprecation[]} */
export const DEPRECATED_PROPS = [
  { widget: "Accordion", from: "onToggle", to: "onPress", since: "1.2.0" },
  { widget: "Checkbox", from: "onCheck", to: "onPress", since: "1.2.0" },
  { widget: "Dropdown", from: "onChange", to: "onPress", since: "1.2.0" },
  { widget: "Radio", from: "onSelect", to: "onPress", since: "1.2.0" },
  { widget: "Slider", from: "onChanged", to: "onPress", since: "1.2.0" },
  { widget: "Switch", from: "onToggle", to: "onPress", since: "1.2.0" },
  { widget: "Tooltip", from: "tooltipDelay", to: "delay", since: "1.2.0" },
  {
    widget: "Scaffold",
    from: "navSideBar",
    to: "leftNavBar",
    since: "1.2.0",
    // The legacy prop could sit on either side, and the legacy position prop
    // is what said which. The codemod follows it instead of guessing a side.
    alternate: { prop: "navSideBarPosition", value: "right", to: "rightNavBar" },
    // `Scaffold` ignores the legacy sidebar once a new one is present, so a
    // call that already has one must be left exactly as it is.
    guard: ["leftNavBar", "rightNavBar"],
  },
  {
    widget: "Scaffold",
    from: "navSideBarWidth",
    to: "leftNavBarWidth",
    since: "1.2.0",
    alternate: { prop: "navSideBarPosition", value: "right", to: "rightNavBarWidth" },
    guard: ["leftNavBarWidth", "rightNavBarWidth"],
  },
  {
    widget: "Scaffold",
    from: "navSideBarPosition",
    to: null,
    since: "1.2.0",
    // The position only ever said which side the *legacy* sidebar was on. Once
    // the sidebar itself carries the side in its name, this prop is read by
    // nobody and the key goes with it.
  },
];

/**
 * The deprecation of one prop on one widget, or null.
 *
 * @param {string} widget
 * @param {string} prop
 * @returns {Deprecation|null}
 */
export const deprecationFor = (widget, prop) =>
  DEPRECATED_PROPS.find((entry) => entry.widget === widget && entry.from === prop) || null;
