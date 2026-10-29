// scripts/check-clean-ui.mjs
// Contract for `flet-box check-ui`: every rule the clean-UI skill claims the
// checker can prove is proven here twice — once by breaking it, once by obeying
// it. Run with:
//
//   node scripts/check-clean-ui.mjs
//
// The baseline matters more than the mutations. `CLEAN` is the screen the skill
// tells an agent to write — tokens only, values on the scale, labelled controls,
// AA contrast, 40px to press, one filled action, a list with its states, a form
// inside a cap — and it must come back with an empty list. A detector that
// always reports is as useless as one that never does. Each mutation then breaks
// exactly one thing in that screen and must name exactly the code the skill
// cites; a mutation whose text no longer matches the fixture throws, so editing
// the screen cannot silently turn a tier into "stayed quiet".
//
// The fixture goes to a temp directory with no `node_modules`: `resolvePackage`
// falls back to this checkout, so the checker judges the app against the sources
// it is being tested with.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkUi } from "../bin/commands/checkUi.js";
import { formatReport, runGates } from "../bin/commands/verify.js";

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-clean-ui-"));
const target = path.join(scratch, "src", "screens");
fs.mkdirSync(target, { recursive: true });

const failures = [];

/**
 * Scan one source through the real CLI entry.
 *
 * @param {string} source
 * @returns {Promise<object[]>} findings
 */
const scan = async (source) => {
  fs.writeFileSync(path.join(target, "S.js"), source, "utf8");
  const { findings } = await checkUi(["--root", scratch], { print: () => {} });
  return findings;
};

/**
 * Break exactly one thing in the clean screen.
 *
 * @param {string} code
 * @param {Array<[string, string]>} pairs [before, after]
 * @returns {string} mutated source
 */
const mutate = (code, pairs) => {
  let text = CLEAN;
  for (const [from, to] of pairs) {
    assert.ok(text.includes(from), `${code}: the fixture no longer contains ${JSON.stringify(from)}`);
    text = text.split(from).join(to);
  }
  assert.notEqual(text, CLEAN, `${code}: this mutation changed nothing`);
  return text;
};

const check = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL ${name} — ${error.message}`);
  }
};

/**
 * @param {string} name what the mutation does
 * @param {string} code the tier that must answer
 * @param {Array<[string, string]>} pairs the break
 */
const bites = (name, code, pairs) =>
  check(`${name} → ${code}`, async () => {
    const findings = await scan(mutate(code, pairs));
    const hit = findings.find((item) => item.code === code);
    assert.ok(
      hit,
      `${code} did not fire — the run reported ${
        [...new Set(findings.map((item) => item.code))].join(", ") || "nothing"
      }`,
    );
    assert.ok(hit.detail.length > 40, `${code} carries no advice`);
    assert.ok(hit.line >= 1, `${code} has no line to point at`);
  });

/**
 * The screen the skill tells the agent to write. Every value in it is a legal
 * answer: a token, a step of the scale, a labelled control, 40px of target, one
 * filled action, and a destructive button that is both red and last.
 */
const CLEAN = `import {
  Button, Card, Column, Container, Icon, Image, Input, ListView, Row,
  Skeleton, SnackBar, Switch, Text, colors,
} from "flet-box";

const retry = () => {};

export const SettingsScreen = ({ loading, failed, rows }) => {
  const save = () => {};
  const leave = () => {};
  const remove = () => {};
  return Container({
    width: "100%",
    padding: 24,
    children: [
      Text({ text: "Account", size: 32, weight: "bold", color: colors.text }),
      Text({
        text: "Change the details your team sees. Nothing is sent until you save.",
        size: 16,
        color: colors.textSecondary,
        align: "left",
      }),
      Card({
        padding: 16,
        borderRadius: 12,
        shadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        children: [
          Container({
            maxWidth: 480,
            children: [
              Input({ label: "Full name", value: "", onChange: () => {} }),
              Input({ label: "Work email", placeholder: "you@company.com", value: "", onChange: () => {} }),
              Input({ label: "CVC", placeholder: "123", maxLength: 4, width: 96, value: "", onChange: () => {} }),
            ],
          }),
        ],
      }),
      Image({ src: "/assets/cover.webp", alt: "" }),
      loading ? Skeleton({ width: "100%", height: 48, count: 3 }) : null,
      failed ? SnackBar({ message: "Could not load the list.", action: "Retry", onAction: retry }) : null,
      !loading && rows.length === 0
        ? Text({ text: "No invitations yet. Send one below.", size: 16, color: colors.text })
        : null,
      !loading && rows.length > 0 ? ListView({ children: rows }) : null,
      Row({
        gap: 12,
        children: [
          Button({ text: "Cancel", onPress: leave, height: 40, variant: "text", color: colors.textSecondary }),
          Button({ text: "Save changes", onPress: save, height: 40 }),
        ],
      }),
      Row({
        gap: 12,
        children: [
          Button({ text: "Cancel", onPress: leave, height: 40, variant: "text", color: colors.textSecondary }),
          Button({ text: "Delete member", onPress: remove, height: 40, variant: "text", color: colors.dangerStrong }),
        ],
      }),
      Column({
        children: [Switch({ label: "Email me a copy", value: true, onToggle: () => {} })],
      }),
    ],
  });
};
`;

console.log("check-clean-ui: flet-box check-ui tiers\n");

// 1 — the baseline: the screen the skill recommends must produce nothing at all.
await check("the clean screen is clean", async () => {
  const findings = await scan(CLEAN);
  assert.deepEqual(
    findings.map((item) => `${item.code} L${item.line} ${item.message}`),
    [],
    "the recommended screen still fails its own checker",
  );
});

// 2 — every tier, one break each.
await bites("a typed hex", "RAW_COLOR", [
  ['weight: "bold", color: colors.text', 'weight: "bold", color: "#0f172a"'],
]);
await bites("a token mixed by hand", "HAND_MIXED_COLOR", [
  ['weight: "bold", color: colors.text', "weight: \"bold\", color: colors.primary + '15'"],
]);
await bites("padding off the scale", "OFF_SCALE_SPACING", [["padding: 24,", "padding: 26,"]]);
await bites("a gap off the scale", "OFF_SCALE_SPACING", [["gap: 12,", "gap: 14,"]]);
await bites("a radius off the scale", "OFF_SCALE_RADIUS", [["borderRadius: 12,", "borderRadius: 10,"]]);

// The radius scale reaches 24 for two reasons that are not taste: the nesting rule
// is arithmetic (`outer = inner + padding`, so a 16 tile inside 8 of padding needs a
// 24 card), and `Drawer`, `DrawerItem` and the `Tabs` slider indicator already
// default there. A screen that matches its own widgets cannot be off-scale — and a
// step in the middle of the scale is still policed.
await check("20 and 24 are steps, and 22 between them is not", async () => {
  const nested = (radius) =>
    `import { Card, Image } from "flet-box";\n` +
    `const screen = () => Card({\n` +
    `  borderRadius: ${radius},\n` +
    `  padding: 8,\n` +
    `  children: [Image({ src: "/assets/cover.webp", alt: "", borderRadius: 16, width: 96, height: 96 })],\n` +
    `});\n`;
  const legal = (await scan(nested(24))).filter((item) => item.code === "OFF_SCALE_RADIUS");
  assert.deepEqual(
    legal.map((item) => item.message),
    [],
    "the gate rejects the radius the nesting rule requires",
  );
  const roomy = (await scan(nested(20))).filter((item) => item.code === "OFF_SCALE_RADIUS");
  assert.deepEqual(roomy.map((item) => item.message), [], "20 is a step and the gate says otherwise");
  const drift = (await scan(nested(22))).filter((item) => item.code === "OFF_SCALE_RADIUS");
  assert.equal(drift.length, 1, "a corner between two steps slipped past the scale");
});
await bites("a type size off the scale", "OFF_SCALE_TYPE", [["size: 32,", "size: 30,"]]);

// The gate judges what a value yields, not the digits that happen to sit inside
// it. `base * 1.5` is 24 at runtime; reading the 1.5 as the size is a finding the
// screen never had. Arithmetic over literals is folded first, and a value that
// depends on an identifier, a call, a member access or a ternary is unmeasured —
// silence, which is neither a pass nor a finding.
await check("arithmetic on literals is folded before judging", async () => {
  const spacing = (findings) => findings.filter((item) => item.code === "OFF_SCALE_SPACING");
  assert.deepEqual(
    spacing(await scan(mutate("fold", [["padding: 24,", "padding: 8 * 3,"]]))),
    [],
    "an on-scale result was rejected because its operands were judged",
  );
  const drift = spacing(await scan(mutate("fold", [["padding: 24,", "padding: 8 + 2,"]])));
  assert.equal(drift.length, 1, "an off-scale result slipped past the scale");
  const type = (findings) => findings.filter((item) => item.code === "OFF_SCALE_TYPE");
  assert.deepEqual(
    type(await scan(mutate("fold", [["size: 32,", "size: 16 * 2,"]]))),
    [],
    "a computed type size on the scale was rejected",
  );
  assert.equal(
    type(await scan(mutate("fold", [["size: 32,", "size: 14 * 2,"]]))).length,
    1,
    "a computed type size off the scale slipped past",
  );
});

await check("a value the pass cannot resolve is unmeasured, not a finding", async () => {
  const withGutter = (source) =>
    source.replace("const retry = () => {};", "const gutter = 26;\nconst retry = () => {};");
  const spacing = (findings) => findings.filter((item) => item.code === "OFF_SCALE_SPACING");
  for (const value of ["gutter", "rows.length > 1 ? 26 : 24", '"calc(8px + 5px)"']) {
    const findings = await scan(withGutter(mutate("unmeasured", [["padding: 24,", `padding: ${value},`]])));
    assert.deepEqual(
      spacing(findings).map((item) => item.message),
      [],
      `${value} was judged instead of left unmeasured`,
    );
  }
  const tapped = await scan(
    mutate("unmeasured", [["onPress: save, height: 40", "onPress: save, height: Math.max(12, 30)"]]),
  );
  assert.deepEqual(
    tapped.filter((item) => item.code === "SMALL_TAP_TARGET").map((item) => item.message),
    [],
    "a call's result was read as a literal height",
  );
  const shorthand = await scan(mutate("shorthand", [["padding: 24,", 'padding: "12px 20px",']]));
  assert.equal(
    shorthand.filter((item) => item.code === "OFF_SCALE_SPACING").length,
    1,
    "a quoted shorthand stopped being measured",
  );
});
await bites("a tap target below 40", "SMALL_TAP_TARGET", [
  ["onPress: save, height: 40", "onPress: save, height: 28"],
]);

// A pressable glyph's target is its box, not its font size: 16 of glyph with 12
// of padding on each side is the 40 a thumb needs. Reading `size` alone would
// reject it; reading it as the target would accept 16 with no padding.
await check("a glyph's target is its box, not its font size", async () => {
  const icon = (padding) =>
    `import { Icon } from "flet-box";\nconst screen = () => Icon({ name: "share", size: 16${
      padding ? `, padding: ${padding}` : ""
    }, onPress: () => {} });\n`;
  const targets = (findings) => findings.filter((item) => item.code === "SMALL_TAP_TARGET");
  assert.deepEqual(
    targets(await scan(icon(12))),
    [],
    "a 16 glyph with 12 of padding is a 40 target and was rejected",
  );
  assert.equal(targets(await scan(icon(8))).length, 1, "a 16 glyph with 8 of padding is 32 and slipped through");
  assert.equal(targets(await scan(icon(null))).length, 1, "a bare 16 glyph slipped through");
});
await bites("text the same color as its fill", "LOW_CONTRAST", [
  ['weight: "bold", color: colors.text', 'weight: "bold", color: colors.warning, bgColor: colors.warning'],
]);
await bites("a field with no label", "UNLABELED_FIELD", [
  ['Input({ label: "CVC", placeholder: "123", ', "Input({ "],
]);
await bites("a switch with no words", "UNLABELED_TOGGLE", [
  ['Switch({ label: "Email me a copy", value: true', "Switch({ value: true"],
]);
await bites("an unnamed icon control", "ICON_ONLY_CONTROL", [
  [
    '[Switch({ label: "Email me a copy", value: true, onToggle: () => {} })]',
    '[Switch({ label: "Email me a copy", value: true, onToggle: () => {} }), Icon({ name: "trash", size: 44, onPress: () => {} })]',
  ],
]);
await bites("an image that says nothing", "IMAGE_NO_ALT", [
  ['Image({ src: "/assets/cover.webp", alt: "" })', 'Image({ src: "/assets/cover.webp" })'],
]);
await bites("a number that paints no shadow", "DEAD_ELEVATION", [
  ["ListView({ children: rows })", "ListView({ children: rows, elevation: 3 })"],
]);
await bites("a paragraph set centred", "CENTERED_BODY_TEXT", [
  ['align: "left"', 'align: "center"'],
]);
await bites("a button that says Submit", "GENERIC_ACTION_LABEL", [
  ['text: "Save changes"', 'text: "Submit"'],
]);
await bites("a delete in the brand color", "DESTRUCTIVE_COLOR", [
  ["variant: \"text\", color: colors.dangerStrong", 'variant: "text", color: colors.primary'],
]);
await bites("the destructive button first", "CONFIRM_ORDER", [
  [
    'Button({ text: "Cancel", onPress: leave, height: 40, variant: "text", color: colors.textSecondary }),\n          Button({ text: "Delete member", onPress: remove, height: 40, variant: "text", color: colors.dangerStrong })',
    'Button({ text: "Delete member", onPress: remove, height: 40, variant: "text", color: colors.dangerStrong }),\n          Button({ text: "Cancel", onPress: leave, height: 40, variant: "text", color: colors.textSecondary })',
  ],
]);
await bites("two filled buttons on one view", "MULTIPLE_PRIMARY_ACTIONS", [
  ['height: 40, variant: "text", color: colors.textSecondary', "height: 40, color: colors.textSecondary"],
]);

// A view is the component function, not the file. Two components that each ship
// one filled button are two screens, and a components module must not fail for
// exporting both. A `variant` the pass cannot resolve is unmeasured: the button
// may be outlined at runtime, so counting it as the primary would be a guess.
await check("the primary count is per view, not per file", async () => {
  const twoScreens = `import { Button, Column } from "flet-box";
const go = () => {};
export const SaveBar = () => {
  return Column({ children: [Button({ text: "Save", onPress: go })] });
};
export const DeleteBar = () => Column({ children: [Button({ text: "Delete", onPress: go })] });
`;
  assert.deepEqual(
    (await scan(twoScreens))
      .filter((item) => item.code === "MULTIPLE_PRIMARY_ACTIONS")
      .map((item) => item.message),
    [],
    "two components with one primary each were counted as one view",
  );
  const computed = mutate("computed variant", [
    [
      'Button({ text: "Cancel", onPress: leave, height: 40, variant: "text", color: colors.textSecondary }),\n          Button({ text: "Save changes", onPress: save, height: 40 })',
      'Button({ text: "Cancel", onPress: leave, height: 40, color: colors.textSecondary }),\n          Button({ text: "Save changes", onPress: save, height: 40, variant: mode })',
    ],
  ]);
  assert.deepEqual(
    (await scan(computed))
      .filter((item) => item.code === "MULTIPLE_PRIMARY_ACTIONS")
      .map((item) => item.message),
    [],
    "a computed variant was counted as a filled button",
  );
});
await bites("a form across the whole window", "UNCONSTRAINED_FORM_WIDTH", [
  ["maxWidth: 480,", 'width: "100%",'],
]);
await bites("a list with no states", "LIST_WITHOUT_STATE", [
  [
    'Skeleton({ width: "100%", height: 48, count: 3 })',
    'Text({ text: "Loading", size: 16, color: colors.text })',
  ],
  [
    'SnackBar({ message: "Could not load the list.", action: "Retry", onAction: retry })',
    'Text({ text: "Could not load the list.", size: 16, color: colors.text })',
  ],
]);
await bites("eight fields in one ask", "CROWDED_FORM", [
  [
    'Input({ label: "CVC"',
    [
      'Input({ label: "Phone", value: "", onChange: () => {} }),',
      'Input({ label: "City", value: "", onChange: () => {} }),',
      'Input({ label: "Postcode", value: "", onChange: () => {} }),',
      'Input({ label: "Country", value: "", onChange: () => {} }),',
      'Input({ label: "Tax id", value: "", onChange: () => {} }),',
      'Input({ label: "CVC"',
    ].join("\n              "),
  ],
]);
await bites("a small preset used as a target", "SMALL_PRESET", [
  [
    'Button({ text: "Save changes", onPress: save, height: 40 })',
    'Button({ text: "Save changes", onPress: save, size: "small" })',
  ],
]);

// 3 — the depth list is read off the package, not invented here. It must name the
// widgets that really turn a number into a shadow — Card is one of them since it
// started reading the shared scale — and never a widget with no scale at all.
await check("the depth advice comes from the installed package", async () => {
  const findings = await scan(
    mutate("DEAD_ELEVATION", [
      ["ListView({ children: rows })", "ListView({ children: rows, elevation: 3 })"],
    ]),
  );
  const dead = findings.find((item) => item.code === "DEAD_ELEVATION");
  assert.ok(dead, "no DEAD_ELEVATION finding to read");
  const names = dead.detail.slice(0, dead.detail.indexOf("turn a number"));
  assert.match(names, /\bButton\b/, "the list names no widget that really reads elevation");
  assert.match(names, /\bCard\b/, "Card reads the depth scale and the advice hides it");
  assert.ok(!/\bListView\b/.test(names), "a widget with no depth is listed as if it had one");
});

// 4 — the contrast numbers come from the palettes a person actually sees.
// `colors` is what the module boots with; `palettes.light` and `palettes.dark`
// are what renders. A rule that measures only the boot object reports a token
// nobody paints (boot `primary` is #6165ef; the themes paint #18181B and
// #FAFAFA) and hides one that only the light theme dislikes (`info`).
const CONTRAST_CODES = [
  "LOW_CONTRAST",
  "LOW_CONTRAST_UI",
  "LOW_CONTRAST_SOFT",
  "LOW_CONTRAST_ON_SURFACE",
];

const IMPORTS = `import { AppBar, Chip, Container, Icon, Row, Slider, Text, colors } from "flet-box";\n`;

/** A screen that must come back with no contrast finding at all. */
const quiet = (name, body) =>
  check(`${name} → stays quiet`, async () => {
    const hits = (await scan(`${IMPORTS}\nconst screen = () => ${body};\n`)).filter((item) =>
      CONTRAST_CODES.includes(item.code),
    );
    assert.deepEqual(
      hits.map((item) => `${item.code} L${item.line} ${item.message}`),
      [],
      "a contrast rule fired on a screen that reads in both themes",
    );
  });

await quiet(
  "the brand token, which only the boot palette dislikes",
  `Text({ text: "Total", size: 16, color: colors.primary })`,
);

await quiet(
  "words on a fill this pass cannot name",
  `const slide = (title, tone) =>
     Container({ backgroundColor: tone, child: Text({ text: title, size: 24, weight: "600", color: colors.onPrimary }) });`,
);

await quiet(
  "an icon on a gradient bar",
  `AppBar({
       title: "Tonight's special",
       gradient: \`linear-gradient(90deg, \${colors.primary}, \${colors.secondary})\`,
       actions: [Icon({ name: "favorite", size: 22, color: colors.onPrimary })],
     })`,
);

await check("the light theme's own failure still bites, and says so", async () => {
  const findings = await scan(
    `${IMPORTS}\nconst screen = () => Text({ text: "Total", size: 16, color: colors.info });\n`,
  );
  const hit = findings.find((item) => item.code === "LOW_CONTRAST_ON_SURFACE");
  assert.ok(hit, "info as body ink is 3.52:1 on the light surface and the gate said nothing");
  assert.match(hit.message, /light theme/, `the finding blames no theme: ${hit.message}`);
});

// `*Strong` is the red an app writes *words* in, and it has to clear AA in the
// theme that is on screen. It used to be a deep plate in dark — 1.77:1 there —
// so a delete labelled `color: colors.dangerStrong` was unreadable for every
// reader on a dark page, and a gate that only measured the boot palette said
// nothing. The deep fills moved to `*Plate`, which is what the widgets that
// write white on them now read.
await quiet(
  "the readable red, written as words in either theme",
  `Row({
       children: [
         Text({ text: "Delete 3 files", size: 16, weight: "600", color: colors.dangerStrong }),
         Text({ text: "Restore", size: 16, color: colors.successStrong }),
       ],
     })`,
);

await check("a plate colour written as words still bites, and blames the dark theme", async () => {
  const findings = await scan(
    `${IMPORTS}\nconst screen = () => Text({ text: "Delete 3 files", size: 16, color: colors.dangerPlate });\n`,
  );
  const hit = findings.find((item) => CONTRAST_CODES.includes(item.code));
  assert.ok(hit, "dangerPlate is 1.77:1 on a dark surface and the gate let it through");
  assert.match(hit.message, /dark theme/, `the finding blames no theme: ${hit.message}`);
});

// A widget that reads `color` into a plate writes its own ink on it, so the app
// never chose that ink and is not being told about it. `Slider` puts the accent
// on a track with no words at all; the reading that matters for `Chip` is
// `colors.onPrimary` — white in light, the page's own ink in dark — on the accent.
await quiet(
  "an accent with no words on it",
  `Slider({ value: 50, color: colors.info })`,
);

await check("a chip too light to carry its own label bites as the chip's problem", async () => {
  const findings = await scan(
    `${IMPORTS}\nconst screen = () => Chip({ label: "Info", color: colors.info });\n`,
  );
  const hits = findings.filter((item) => CONTRAST_CODES.includes(item.code));
  assert.equal(hits.length, 1, `expected one contrast finding, got ${hits.length}`);
  const hit = hits[0];
  assert.match(hit.message, /writes .* on its `color` plate/, `the finding blames the wrong half: ${hit.message}`);
  assert.match(hit.message, /light theme/, "the light theme is the one where white on #3b82f6 is 3.68:1");
  assert.ok(!/3\.52/.test(hit.message), "it still measured the accent as words on the page");
});

await quiet(
  "a chip on an accent that carries its label",
  `Chip({ label: "Primary", color: colors.primary })`,
);

// The accent reading is variant-bound, not widget-bound: an outlined chip paints
// no plate and writes `color` as its own label, so that one is still ink on the
// page and the same #3b82f6 is a finding again.
await check("an outlined chip still answers for its own words", async () => {
  const findings = await scan(
    `${IMPORTS}\nconst screen = () => Chip({ label: "Info", variant: "outlined", color: colors.info });\n`,
  );
  const hit = findings.find((item) => item.code === "LOW_CONTRAST_ON_SURFACE");
  assert.ok(hit, "the outlined chip writes its accent as its label and 3.52:1 went unreported");
  assert.match(hit.message, /3\.5\d:1/, `the finding lost the page number: ${hit.message}`);
});

// A Tooltip reaches the DOM as `aria-describedby`, and a description is not a
// name: the glyph is still a button a screen reader announces without a word for
// what it does. A real name is `aria-label`/`aria-labelledby`, which this lexical
// pass can see even when the control is built by a helper and labelled at the
// call site.
await check("a tooltip is a description, not a name", async () => {
  const findings = await scan(
    `import { Icon, Tooltip } from "flet-box";\nconst screen = () => Tooltip({ text: "Share", child: Icon({ name: "share", size: 44, onPress: () => {} }) });\n`,
  );
  assert.ok(
    findings.some((item) => item.code === "ICON_ONLY_CONTROL"),
    "a tooltip counted as the control's accessible name",
  );
});
await check("a glyph control that names itself is not nameless", async () => {
  const findings = await scan(
    `${IMPORTS}\nconst iconButton = (name, label) => Button({ icon: name, "aria-label": label, onPress: () => {} });\nconst screen = () => iconButton("share", "Share");\n`,
  );
  const hits = findings.filter((item) => item.code === "ICON_ONLY_CONTROL");
  assert.deepEqual(hits, [], "an aria-labelled button was still reported as an unnamed glyph");
});

// The example files print the call under each widget as the text the reader
// copies, so one screen holds the same call twice by design. Only the one that
// renders can be wrong, and a finding for the copy teaches the reader to distrust
// the count.
await check("an example shown twice is reported once", async () => {
  const findings = await scan(
    `${IMPORTS}\nconst example = {\n  build: () => Chip({ label: "Info", color: colors.info }),\n  code: 'Chip({ label: "Info", color: colors.info })',\n};\n`,
  );
  const hits = findings.filter((item) => CONTRAST_CODES.includes(item.code));
  assert.equal(
    hits.length,
    1,
    `one call rendered and the same call written as text produced ${hits.length} findings`,
  );
});

// 5 — the two themes answer the same token names.
//
// A contrast rule can only measure a token that exists, and the advice the gate
// prints ("`colors.primaryBg`, `colors.errorBg` and friends are the tints") is the
// same sentence in either theme. The light palette used to be missing `error`,
// `errorBg`, `successBg`, `warningBg` and `infoBg` — dark invented them because a
// pale fill dies on a black page, and nobody noticed that the boot palette
// (`DEFAULT_COLORS`) had them all along, so `setTheme("light")` deleted five tokens
// an app was already writing. An app that painted an error card the framework way
// got `bgColor: undefined` and no card at all: not a contrast finding, because
// there was no fill to measure.
await check("both themes carry the same token names", async () => {
  const { palettes, colors } = await import("../src/utils/themes.js");
  const light = Object.keys(palettes.light);
  const dark = Object.keys(palettes.dark);
  const onlyLight = light.filter((name) => !dark.includes(name));
  const onlyDark = dark.filter((name) => !light.includes(name));
  assert.deepEqual(
    { onlyLight, onlyDark },
    { onlyLight: [], onlyDark: [] },
    "a token exists in one theme and not the other",
  );
  for (const name of ["error", "errorBg", "successBg", "warningBg", "infoBg"]) {
    assert.ok(name in palettes.light, `the light theme has no ${name} for the gate to suggest`);
    assert.ok(name in colors, `the boot palette has no ${name} either`);
  }
});

// 6 — an accepted finding is a decision, and only the framework gets to make it.
//
// The framework runs this gate over its own `src/`, and two of its findings are a
// rule written for a screen applied to a module that is not one;
// `scripts/framework-ui-baseline.json` records them, each with its reason, and
// `check-framework-ui.mjs` has always honoured it. `flet-box verify` did not, so
// every run printed the same two entries under "what to review" — and a list that
// never changes is a list an agent learns to skip, which is exactly the finding
// that matters. Both directions are proven here: the framework checkout
// suppresses what it wrote down (even a code that is an error elsewhere, which is
// what the written reason is for), and an app holding the same finding is still
// told about it, because an app has no baseline to appeal to.
const VERIFY_SOURCE = `import { Container, ListView, Text } from "flet-box";
const screen = () =>
  Container({
    padding: 13,
    children: [Text({ text: "Inbox" }), ListView({ children: [Text({ text: "one" })] })],
  });
`;

/**
 * A project holding one off-scale padding and one list with no state.
 *
 * Both carry the baseline file, because the question is not whether the file
 * exists but who the project is. `asFramework` gives it the shape
 * `isFrameworkProject` recognises — a manifest whose `bin` points at a file that
 * exists — which is the only thing that may turn a finding into a decision.
 *
 * @param {string} name
 * @param {boolean} asFramework
 * @returns {string} the project root
 */
const verifyProject = (name, asFramework) => {
  const dir = path.join(scratch, name);
  fs.mkdirSync(path.join(dir, "src", "screens"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "screens", "S.js"), VERIFY_SOURCE, "utf8");
  fs.mkdirSync(path.join(dir, "scripts"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "scripts", "framework-ui-baseline.json"),
    JSON.stringify({
      "src/screens/S.js:OFF_SCALE_SPACING": "the fixture made this decision",
      "src/screens/S.js:LIST_WITHOUT_STATE": "the fixture made this decision",
    }),
    "utf8",
  );
  if (!asFramework) return dir;
  fs.mkdirSync(path.join(dir, "bin"), { recursive: true });
  fs.writeFileSync(path.join(dir, "bin", "cli.js"), "", "utf8");
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "flet-box", version: "1.1.2", bin: { "flet-box": "bin/cli.js" } }),
    "utf8",
  );
  return dir;
};

await check("verify stops re-reporting a finding the framework accepted", async () => {
  const report = await runGates(verifyProject("as-framework", true), ["ui"]);
  const ui = report.steps[0];
  assert.deepEqual(
    ui.findings.map((item) => item.code),
    [],
    "verify re-reported a finding its own baseline has decided",
  );
  assert.equal(ui.accepted.length, 2, "the accepted findings were not counted");
  assert.ok(
    ui.accepted.every((item) => item.why),
    "an accepted finding lost the reason that accepted it",
  );
  assert.equal(ui.exitCode, 0, "an accepted error code still failed the run");
  const text = formatReport(report).join("\n").replace(/\u001b\[[0-9;]*m/g, "");
  assert.match(text, /2 accepted/, "the report did not say how many findings were accepted");
});

await check("verify still reports the same finding inside an app", async () => {
  const report = await runGates(verifyProject("as-app", false), ["ui"]);
  const ui = report.steps[0];
  const codes = ui.findings.map((item) => item.code);
  assert.ok(codes.includes("OFF_SCALE_SPACING"), "an app lost the off-scale spacing finding");
  assert.ok(codes.includes("LIST_WITHOUT_STATE"), "an app lost the list-without-state finding");
  assert.equal(ui.accepted.length, 0, "an app's findings were accepted against the framework's baseline");
  assert.equal(ui.exitCode, 1, "an app's off-scale spacing did not fail the run");
});

console.log(
  failures.length
    ? `\n❌ ${failures.length} clean-UI contract failure(s): ${failures.join(", ")}\n`
    : "\n✅ Every tier bites, and the clean screen passes.\n",
);
process.exit(failures.length ? 1 : 0);
