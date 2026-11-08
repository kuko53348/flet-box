// scripts/check-ui-rules.mjs
// Contract for the UI rules the code-generation contract names, each of them
// proved twice — once by breaking it, once by obeying it. Run with:
//
//   node scripts/check-ui-rules.mjs
//
// The rules are not implemented here, and that is the point of this file:
// they already have an owner (`flet-box check-ui` reads the installed
// package's own prop registry and palette, so it cannot invent a prop while
// judging it) or belong to the structural gate (`flet-box check-structure`).
// A second copy of a rule is a second thing to keep in sync with the first, so
// the rules stay where they are and this file proves that each one bites — and,
// just as important, that each one stays quiet on the shape it is supposed to
// accept.
//
// The list grows with the contract: every code the rejection table in
// `AGENTS_FOR_CODE_GEN.md` names must be proven here or by the gate that owns
// it, so a code the contract names can never be one that nothing reports.
////
// The fixture is a temp directory with no `node_modules`: the package lookup
// falls back to this checkout, so the screen under test is judged against the
// sources it is being tested with.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkUi } from "../bin/commands/checkUi.js";
import { scanStructure } from "../bin/commands/checkStructure.js";

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-ui-rules-"));
const failures = [];

/**
 * Write one screen and scan it with both gates.
 *
 * @param {string} source
 * @returns {Promise<{ui: object[], structure: object[]}>}
 */
const scan = async (source) => {
  fs.rmSync(scratch, { recursive: true, force: true });
  fs.mkdirSync(path.join(scratch, "src"), { recursive: true });
  fs.writeFileSync(path.join(scratch, "src", "app.js"), source, "utf8");
  const ui = await checkUi(["--root", scratch], { print: () => {} });
  const structure = await scanStructure(scratch);
  return { ui: ui.findings, structure };
};

/**
 * @param {string} name
 * @param {() => void | Promise<void>} fn
 */
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
 * @param {object[]} findings
 * @param {string} code
 * @returns {object|undefined}
 */
const hit = (findings, code) => findings.find((item) => item.code === code);

// 1 — a hex value outside the theme.

await check("RAW_COLOR fires on a hand-typed colour", async () => {
  const { ui } = await scan(
    'import { Text } from "flet-box";\nexport const t = () => Text({ text: "Hi", color: "#4f46e5" });\n',
  );
  const found = hit(ui, "RAW_COLOR");
  assert.ok(found, `no colour finding — got ${[...new Set(ui.map((f) => f.code))].join(", ") || "nothing"}`);
  assert.ok(found.line >= 1, "the finding has no line to point at");
});

await check("RAW_COLOR accepts a token", async () => {
  const { ui } = await scan(
    'import { Text, colors } from "flet-box";\nexport const t = () => Text({ text: "Hi", color: colors.primary });\n',
  );
  assert.equal(hit(ui, "RAW_COLOR"), undefined, "a token was reported as a raw colour");
});

// 2 — a value that is not on the 8-based scale.

await check("OFF_SCALE_SPACING fires on a spacing that is not on the scale", async () => {
  const { ui } = await scan(
    'import { Container } from "flet-box";\nexport const c = () => Container({ padding: 13 });\n',
  );
  assert.ok(hit(ui, "OFF_SCALE_SPACING"), "13 was accepted as spacing");
});

await check("OFF_SCALE_SPACING accepts a step of the scale", async () => {
  const { ui } = await scan(
    'import { Container } from "flet-box";\nexport const c = () => Container({ padding: 16 });\n',
  );
  assert.equal(hit(ui, "OFF_SCALE_SPACING"), undefined, "16 was reported as off the scale");
});

await check("OFF_SCALE_TYPE fires on a type size that is not on the scale", async () => {
  const { ui } = await scan(
    'import { Text } from "flet-box";\nexport const t = () => Text({ text: "Hi", size: 15 });\n',
  );
  assert.ok(hit(ui, "OFF_SCALE_TYPE"), "15 was accepted as a type size");
});

await check("OFF_SCALE_RADIUS fires on a radius that is not on the scale", async () => {
  const { ui } = await scan(
    'import { Container } from "flet-box";\nexport const c = () => Container({ rounded: 13 });\n',
  );
  assert.ok(hit(ui, "OFF_SCALE_RADIUS"), "13 was accepted as a radius");
});

await check("OFF_SCALE_RADIUS accepts a radius on the scale", async () => {
  const { ui } = await scan(
    'import { Container } from "flet-box";\nexport const c = () => Container({ rounded: 16 });\n',
  );
  assert.equal(hit(ui, "OFF_SCALE_RADIUS"), undefined, "16 was reported as off the scale");
});

// Constants must not hide a literal, nor make a runtime value look like one.
for (const [declaration, widget, prop, code] of [
  ['const PAD = 13;', 'Container', 'padding: PAD', 'OFF_SCALE_SPACING'],
  ['const RADIO = 22;', 'Container', 'borderRadius: RADIO', 'OFF_SCALE_RADIUS'],
  ['const TIPO = 15;', 'Text', 'text: "Hi", size: TIPO', 'OFF_SCALE_TYPE'],
  ['const MARCA = "#4f46e5";', 'Container', 'bgColor: MARCA', 'RAW_COLOR'],
  ['const PAD = "12px 20px";', 'Container', 'padding: PAD', 'OFF_SCALE_SPACING'],
  ['const BASE = 6; const PAD = BASE * 2 + 1;', 'Container', 'padding: PAD', 'OFF_SCALE_SPACING'],
  ['const BASE = 6;', 'Container', 'padding: BASE * 2 + 1', 'OFF_SCALE_SPACING'],
  ['const ALTO = 32;', 'Button', 'text: "Go", height: ALTO, onPress: () => {}', 'SMALL_TAP_TARGET'],
  ['const INK = "#ffffff"; const BG = "#ffffff";', 'Text', 'text: "Hi", color: INK, bgColor: BG', 'LOW_CONTRAST'],
]) {
  await check(`${code} follows ${declaration}`, async () => {
    const { ui } = await scan(`import { ${widget} } from "flet-box";\n${declaration}\nexport const view = () => ${widget}({ ${prop} });\n`);
    const found = hit(ui, code);
    assert.ok(found, `${prop} hid ${code}`);
    assert.equal(found.line, 3, 'report the prop use, not its initializer');
  });
}

await check('a local constant, an alias and ASI still expose their literal', async () => {
  const { ui } = await scan(`import { Container } from "flet-box";
export const view = () => {
  const BASE = 13
  const PAD = BASE
  return Container({ padding: PAD });
};`);
  assert.equal(hit(ui, 'OFF_SCALE_SPACING')?.line, 5);
});

await check('on-scale constants, quoted numbers and token aliases stay clean', async () => {
  const { ui } = await scan(`import { Container, Text, colors } from "flet-box";
const PAD = 16, RADIO = 12;
const TIPO = 14;
const INK = colors.text;
const LABEL = "PAD 13";
export const view = () => Container({ padding: PAD, borderRadius: RADIO,
  child: Text({ text: LABEL, size: TIPO, color: INK }) });`);
  assert.deepEqual(ui, []);
});

// A file-wide name map is unsafe: any binding the pass cannot distinguish must
// stay unknown, even if that sacrifices resolution in an unrelated function.
for (const body of [
  'export const view = (PAD) => Container({ padding: PAD });',
  'export const view = PAD => Container({ padding: PAD });',
  'export const view = ({ PAD }) => Container({ padding: PAD });',
  'export const view = ({ value: PAD = 16 }) => Container({ padding: PAD });',
  'export const view = (...PAD) => Container({ padding: PAD });',
  'export function view(PAD = 16) { return Container({ padding: PAD }); }',
  'export const view = () => { let PAD = 16; return Container({ padding: PAD }); };',
  'export const view = () => { var PAD = 16; return Container({ padding: PAD }); };',
  'export const view = () => { const PAD = 16; return Container({ padding: PAD }); };',
  'export const view = () => { try {} catch (PAD) { return Container({ padding: PAD }); } };',
  'export const view = () => Container({ padding: settings.PAD });',
  'export const view = () => Container({ padding: unknown * 1.5 });',
  'export const view = () => Container({ padding: flag ? PAD : 16 });',
  'export const view = () => Container({ padding: compute(PAD) });',
]) {
  await check(`does not guess bindings/runtime values: ${body}`, async () => {
    const { ui } = await scan(`import { Container } from "flet-box";\nconst PAD = 13;\n${body}`);
    assert.equal(hit(ui, 'OFF_SCALE_SPACING'), undefined);
  });
}

for (const source of [
  'const view = () => Container({ padding: PAD }); const PAD = unknown;',
  '{ const PAD = 13; } const view = () => Container({ padding: PAD });',
  'const view = () => Container({ padding: PAD }); const PAD = 13;',
  'for (const PAD of values) { Container({ padding: PAD }); }',
  'for (const PAD = 13; false;) {} Container({ padding: PAD });',
  'let PAD = 13; PAD = 16; Container({ padding: PAD });',
  'const PAD = unknown; Container({ padding: PAD * 1.5 });',
  'const PAD = other; const other = PAD; Container({ padding: PAD });',
  'const sample = "const PAD = 13;"; Container({ padding: PAD });',
  'const sample = /const PAD = 13;/; Container({ padding: PAD });',
  'const sample = `const PAD = 13;`; Container({ padding: PAD });',
  '// const PAD = 13;\nContainer({ padding: PAD });',
]) {
  await check(`leaves unsupported declarations unknown: ${source}`, async () => {
    const { ui } = await scan(`import { Container } from "flet-box";\n${source}`);
    assert.equal(hit(ui, 'OFF_SCALE_SPACING'), undefined);
  });
}

// 3 — a button that shows a glyph and no name.

await check("ICON_ONLY_CONTROL fires on a button with an icon and no name", async () => {
  const { ui } = await scan(
    'import { Button, Container } from "flet-box";\nexport const c = () => Container({ children: [Button({ icon: "add" })] });\n',
  );
  const found = hit(ui, "ICON_ONLY_CONTROL");
  assert.ok(found, `no name finding — got ${[...new Set(ui.map((f) => f.code))].join(", ") || "nothing"}`);
  assert.ok(found.detail.length > 40, "the finding carries no advice");
});

await check("ICON_ONLY_CONTROL accepts a button named with aria-label", async () => {
  const { ui } = await scan(
    'import { Button, Container } from "flet-box";\nexport const c = () => Container({ children: [Button({ icon: "add", "aria-label": "Add" })] });\n',
  );
  assert.equal(hit(ui, "ICON_ONLY_CONTROL"), undefined, "a named button was reported");
});

await check("ICON_ONLY_CONTROL accepts a button with words", async () => {
  const { ui } = await scan(
    'import { Button, Container } from "flet-box";\nexport const c = () => Container({ children: [Button({ icon: "add", text: "Add" })] });\n',
  );
  assert.equal(hit(ui, "ICON_ONLY_CONTROL"), undefined, "a button with words was reported");
});

// 4 — a control too small for a finger.

await check("SMALL_TAP_TARGET fires on a pressable control under 40", async () => {
  const { ui } = await scan(
    'import { Button } from "flet-box";\nexport const b = () => Button({ text: "Save", onPress: () => {}, height: 30 });\n',
  );
  const found = hit(ui, "SMALL_TAP_TARGET");
  assert.ok(found, "a 30px button was accepted");
  assert.ok(found.detail.length > 20, "the finding carries no advice");
});

await check("SMALL_TAP_TARGET accepts a control of 40", async () => {
  const { ui } = await scan(
    'import { Button } from "flet-box";\nexport const b = () => Button({ text: "Save", onPress: () => {}, height: 40 });\n',
  );
  assert.equal(hit(ui, "SMALL_TAP_TARGET"), undefined, "a 40px button was reported");
});

// 5 — a field with no name.

await check("UNLABELED_FIELD fires on a field with neither label nor placeholder", async () => {
  const { ui } = await scan(
    'import { Input } from "flet-box";\nexport const i = () => Input({ value: "" });\n',
  );
  assert.ok(hit(ui, "UNLABELED_FIELD"), "a nameless field was accepted");
});

await check("UNLABELED_FIELD accepts a field with a label", async () => {
  const { ui } = await scan(
    'import { Input } from "flet-box";\nexport const i = () => Input({ label: "Email", value: "" });\n',
  );
  assert.equal(hit(ui, "UNLABELED_FIELD"), undefined, "a labelled field was reported");
});

// 6 — markup written by hand.

await check("HAND_WRITTEN_DOM fires on innerHTML in app code", async () => {
  const { structure } = await scan(
    'const el = document.getElementById("root");\nel.innerHTML = "<b>Hi</b>";\n',
  );
  const found = hit(structure, "HAND_WRITTEN_DOM");
  assert.ok(found, "innerHTML in app code was accepted");
  assert.equal(found.severity, "error");
});

await check("HAND_WRITTEN_DOM accepts a screen built with widgets", async () => {
  const { structure } = await scan(
    'import { Container, Text } from "flet-box";\nexport const c = () => Container({ child: Text({ text: "Hi" }) });\n',
  );
  assert.equal(hit(structure, "HAND_WRITTEN_DOM"), undefined, "a widget-built screen was reported");
});

fs.rmSync(scratch, { recursive: true, force: true });

console.log(
  failures.length
    ? `\n❌ ${failures.length} UI-rule contract failure(s): ${failures.join(", ")}\n`
    : "\n✅ Every UI rule bites, and the clean screen passes.\n",
);
process.exit(failures.length ? 1 : 0);
