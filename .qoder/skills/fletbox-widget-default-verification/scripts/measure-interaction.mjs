#!/usr/bin/env node
/**
 * Measure what hover and press actually do to a widget — in settled values.
 *
 *   node measure-interaction.mjs --root <flet-box checkout> --widget Button \
 *        [--props '{"text":"Save"}'] [--event hover|press|both] [--theme light] \
 *        [--update-during-hover] [--wait 320] [--no-handler]
 *
 * Two rules make the numbers trustworthy: every state is read only after
 * `--wait` ms (the factory transitions the shadow for 0.2s, so an early read
 * returns an interpolating value), and shadows are compared by geometry, not
 * by string (the browser serialises `0 3px 6px` as `rgba(...) 0px 3px 6px 0px`).
 */
import { openProbe, parseArgs, parsePropsArg, need, fail, shadowGeometry } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const root = args.root || process.cwd();
const widgetName = need(args.widget, "widget");
const props = parsePropsArg(args.props);
const theme = String(args.theme || "light");
const event = String(args.event || "both");
const waitMs = Number(args.wait || 320);
const withHandler = !args["no-handler"];
const reUpdate = Boolean(args["update-during-hover"]);
const usePress = event === "press" || event === "both";
const useHover = event === "hover" || event === "both";

const probe = await openProbe({ root, scale: Number(args.scale || 2) });

const build = () =>
  probe.page.evaluate(
    async ({ widgetName, props, theme, withHandler }) => {
      const FB = await import("/src/index.js");
      const { setTheme, colors } = await import("/src/utils/themes.js");
      const { SHADOW_LEVELS } = await import("/src/tools/shadow.js");
      setTheme(theme);

      const make = FB[widgetName];
      if (typeof make !== "function") return { error: `"${widgetName}" is not an exported widget` };

      document.getElementById("fbprobe")?.remove();
      const host = document.createElement("div");
      host.id = "fbprobe";
      host.style.cssText =
        `position:fixed;left:40px;top:120px;z-index:9999;padding:32px;display:flex;gap:24px;` +
        `background:${colors.background};color:${colors.text};`;
      const widget = make(withHandler ? { onPress: () => {}, ...props } : props);
      host.append(widget);
      document.body.appendChild(host);
      window.__PROBE = widget;
      window.__LEVELS = SHADOW_LEVELS;
      await new Promise((r) => setTimeout(r, 300));
      return { ok: true, levels: SHADOW_LEVELS };
    },
    { widgetName, props, theme, withHandler },
  );

const snapshot = (label) =>
  probe.page.evaluate((label) => {
    const el = window.__PROBE;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      label,
      top: Math.round(r.top * 100) / 100,
      translate: cs.translate,
      scale: cs.scale,
      transform: cs.transform,
      boxShadow: cs.boxShadow,
    };
  }, label);

const built = await build();
if (built.error) fail(built.error);

const states = {};
const levelOf = (value) => {
  const nums = shadowGeometry(value);
  if (!nums) return /^(none|)$/i.test(String(value).trim()) ? "none" : "not-a-shadow";
  const hit = Object.entries(built.levels).find(([, css]) => {
    const candidate = shadowGeometry(css);
    return candidate && candidate.every((n, i) => Math.abs(n - nums[i]) < 0.01);
  });
  return hit ? `L${hit[0]}` : "off-scale";
};

states.rest = await snapshot("rest");

if (useHover) {
  await probe.page.evaluate(() =>
    window.__PROBE.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false })),
  );
  await new Promise((r) => setTimeout(r, waitMs));
  states.dispatchedHover = await snapshot("dispatched-mouseenter");

  await probe.page.evaluate(() =>
    window.__PROBE.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false })),
  );
  await new Promise((r) => setTimeout(r, waitMs));

  const box = await probe.page.evaluate(() => {
    const r = window.__PROBE.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await probe.page.mouse.move(box.x + box.w / 2, box.y + box.h / 2);
  await new Promise((r) => setTimeout(r, waitMs));
  states.realHover = await snapshot("real-pointer");

  if (reUpdate) {
    await probe.page.evaluate(() => window.__PROBE.update({ opacity: 0.99 }));
    await new Promise((r) => setTimeout(r, waitMs));
    states.updateWhileHovered = await snapshot("update() while hovered");
  }

  await probe.page.mouse.move(5, 700);
  await new Promise((r) => setTimeout(r, waitMs));
  states.afterLeave = await snapshot("after mouseleave");
}

const descendantBoxes = () =>
  probe.page.evaluate(() => {
    const el = window.__PROBE;
    return [...el.querySelectorAll("*")].slice(0, 14).map((n) => {
      const r = n.getBoundingClientRect();
      return { name: n._widgetName || n.tagName.toLowerCase(), x: Math.round(r.x * 100) / 100, y: Math.round(r.y * 100) / 100, w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100 };
    });
  });

if (usePress) {
  const box = await probe.page.evaluate(() => {
    const r = window.__PROBE.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await probe.page.mouse.move(box.x + box.w / 2, box.y + box.h / 2);
  await new Promise((r) => setTimeout(r, 50));
  const baseline = await descendantBoxes();
  await probe.page.mouse.down();
  await new Promise((r) => setTimeout(r, waitMs));
  states.press = await snapshot("pressing");
  const during = await descendantBoxes();
  // A labelled control that scales its own root drags its label: the honest
  // signal is the descendant's box moving, not its own `scale` (which stays
  // `none` because only the root is transformed).
  states.press.draggedDescendants = during
    .map((d, i) => ({ ...d, before: baseline[i] }))
    .filter((d) =>
      Math.abs(d.x - d.before.x) > 0.5 ||
      Math.abs(d.y - d.before.y) > 0.5 ||
      Math.abs(d.w - d.before.w) > 0.5 ||
      Math.abs(d.h - d.before.h) > 0.5,
    )
    .map((d) => `${d.name} ${d.before.w}x${d.before.h} @${d.before.x},${d.before.y} -> ${d.w}x${d.h} @${d.x},${d.y}`);
  await probe.page.mouse.up();
  await new Promise((r) => setTimeout(r, waitMs));
}

await probe.close();

console.log(`${widgetName} (${theme}) rest shadow = ${levelOf(states.rest.boxShadow)} ${states.rest.boxShadow}`);
for (const [key, s] of Object.entries(states)) {
  if (key === "rest") continue;
  const moved = Math.round((states.rest.top - s.top) * 100) / 100;
  console.log(
    `${key.padEnd(19)} top ${s.top} (Δ ${moved})  translate "${s.translate}"  scale "${s.scale}"  ` +
      `shadow ${levelOf(s.boxShadow)} ${s.boxShadow}`,
  );
  if (s.draggedDescendants?.length) {
    console.log(
      `${" ".repeat(20)}· ${s.draggedDescendants.length} descendant box(es) moved with the root's scale. ` +
        `Intended when the root IS the tappable unit (a Button); the bug when the root is a labelled ` +
        `row (Switch/Checkbox/Radio) — then the label should stay put.`,
    );
    for (const line of s.draggedDescendants) console.log(`${" ".repeat(22)}- ${line}`);
  }
}
