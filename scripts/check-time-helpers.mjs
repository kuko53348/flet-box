#!/usr/bin/env node
/**
 * @file check-time-helpers.mjs
 * @description
 * Contract for the time and string helpers that `flet-box` exports.
 *
 * Two things are proven here.
 *
 * 1. Reachability. Every named export of `src/tools/time.js` and
 *    `src/tools/string.js` has to be a function on the public barrel. These
 *    modules were written years before anyone could import most of them: 43 of
 *    the 47 time helpers and 6 of the 12 string helpers stayed private, so an
 *    agent following the "use a tool, not boilerplate" rule reached for the
 *    language instead. A name that is implemented but not exported is a name
 *    that does not exist.
 *
 * 2. That the module agrees with itself, in every timezone a user can pick.
 *    `new Date("2024-01-15")` is UTC midnight, and every getter reads it back in
 *    the local zone, so west of Greenwich a bare calendar date was the day
 *    before: `isToday(today())` answered `false` and `dayOfWeek("2024-01-15")`
 *    answered "Sunday". Whole days are counted on the calendar for the same
 *    reason — `addDays("2024-10-26", 7)` stepped over the Madrid DST night by
 *    milliseconds and printed November 1.
 *
 * A timezone is part of the process environment read at startup, so the child
 * runs re-exec this file under `TZ`: one host must prove all of them, and the
 * assertion set cannot pass by accident on a UTC machine.
 *
 * Usage:
 *   node scripts/check-time-helpers.mjs
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ZONES = [
  "Etc/GMT+12", // UTC-12: the far side of the date-only-string bug
  "America/Argentina/Cordoba", // UTC-3, no DST
  "Europe/Madrid", // DST, spring forward and fall back
  "Pacific/Kiritimati", // UTC+14: the other side
  "UTC",
  "Asia/Kathmandu", // UTC+5:45 — a half-hour zone
];

const TIME_NAMES = "seconds minutes hours days weeks months years now today yesterday tomorrow dayOfWeek monthName isToday isYesterday isTomorrow isWeekend isLeapYear formatDate formatDateLong formatDateShort formatTime formatTimeAmPm parseDate dateDiff addDays addHours addMinutes addSeconds subtractDays subtractHours subtractMinutes subtractSeconds timeAgo relativeTime timeAgoLocale waitFor wait sleep waitUntil waitForElement timer every everySecond everyMinute everyHour everyDay".split(" ");
const STRING_NAMES = "startsWith endsWith includes split join trim capitalize capitalizeWords lowerCase upperCase reverseString truncate".split(" ");

const run = async (out) => {
  const F = await import(path.join(repoRoot, "src/index.js"));
  const time = await import(path.join(repoRoot, "src/tools/time.js"));
  const string = await import(path.join(repoRoot, "src/tools/string.js"));

  // ---- reachability: implemented is not the same as importable ----
  for (const [mod, names] of [
    [time, TIME_NAMES],
    [string, STRING_NAMES],
  ]) {
    const missing = names.filter((n) => !(n in mod));
    if (missing.length) out.push(`module has no ${missing.join(", ")}`);
    const unreachable = names.filter((n) => typeof F[n] !== "function");
    if (unreachable.length) {
      out.push(`not exported from the barrel: ${unreachable.join(", ")}`);
    }
  }

  // ---- the module reading its own output ----
  if (F.formatDate(F.today()) !== F.today()) {
    out.push(`formatDate(today()) is ${F.formatDate(F.today())}, not ${F.today()}`);
  }
  for (const [name, value] of [
    ["isToday", F.today()],
    ["isYesterday", F.yesterday()],
    ["isTomorrow", F.tomorrow()],
  ]) {
    if (!F[name](value)) out.push(`${name}(${value}) is false`);
  }

  // ---- a bare calendar date is that day, wherever the host sits ----
  const calendar = [
    ['dayOfWeek("2024-01-15")', F.dayOfWeek("2024-01-15"), "Monday"],
    ['monthName("2024-01-15")', F.monthName("2024-01-15"), "January"],
    ['formatDate("2024-02-29")', F.formatDate("2024-02-29"), "2024-02-29"],
    ['formatDateShort("2024-01-15")', F.formatDateShort("2024-01-15", "en-US").replace(/,?\s\d{4}$/, ""), "Jan 15"],
    ['dateDiff("2024-01-01", "2024-01-15", "days")', F.dateDiff("2024-01-01", "2024-01-15", "days"), 14],
    ['addDays("2024-02-28", 1) crosses February', F.formatDate(F.addDays("2024-02-28", 1)), "2024-02-29"],
    ['subtractDays("2024-03-01", 1) crosses February', F.formatDate(F.subtractDays("2024-03-01", 1)), "2024-02-29"],
    // the Madrid DST nights: 27 March springs forward, 27 October falls back
    ['addDays("2024-10-26", 7) over a fall-back week', F.formatDate(F.addDays("2024-10-26", 7)), "2024-11-02"],
    ['subtractDays("2024-11-02", 7) over a fall-back week', F.formatDate(F.subtractDays("2024-11-02", 7)), "2024-10-26"],
    ['addDays("2024-03-30", 1) over a spring-forward night', F.formatDate(F.addDays("2024-03-30", 1)), "2024-03-31"],
  ];
  for (const [label, got, want] of calendar) {
    if (got !== want) out.push(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }

  // ---- a timestamp is still an instant, not a day ----
  const instant = new Date("2024-01-15T23:30:00Z");
  const wantHM = `${String(instant.getHours()).padStart(2, "0")}:${String(instant.getMinutes()).padStart(2, "0")}`;
  const gotHM = F.formatDate("2024-01-15T23:30:00Z", "HH:mm");
  if (gotHM !== wantHM) {
    out.push(`formatDate("2024-01-15T23:30:00Z", "HH:mm"): got ${gotHM}, want ${wantHM} — an offset is an instant, not a calendar day`);
  }

  // ---- units, aliases and the English the docs promise ----
  const units = [
    ["seconds(1)", F.seconds(1), 1e3],
    ["minutes(1)", F.minutes(1), 6e4],
    ["hours(1)", F.hours(1), 36e5],
    ["days(1)", F.days(1), 864e5],
    ["weeks(1)", F.weeks(1), 6048e5],
    ['months(1) — a 30-day approximation', F.months(1), 30 * 864e5],
    ['years(1) — a 365-day approximation', F.years(1), 365 * 864e5],
  ];
  for (const [label, got, want] of units) {
    if (got !== want) out.push(`${label}: got ${got}, want ${want}`);
  }
  if (F.relativeTime !== F.timeAgo) out.push("relativeTime is no longer an alias of timeAgo");
  if (F.wait !== F.waitFor || F.sleep !== F.waitFor) out.push("wait/sleep are no longer aliases of waitFor");
  const ago = F.timeAgo(Date.now() - F.minutes(5));
  if (ago !== "5 minutes ago") out.push(`timeAgo(now() - minutes(5)): got ${JSON.stringify(ago)}, want "5 minutes ago"`);
  const agoEs = F.timeAgoLocale(Date.now() - F.hours(1), "es");
  if (agoEs !== "hace 1 hora") out.push(`timeAgoLocale(now() - hours(1), "es"): got ${JSON.stringify(agoEs)}, want "hace 1 hora"`);
  if (F.isLeapYear(2024) !== true) out.push('isLeapYear(2024) is false');
  if (F.isLeapYear(1900) !== false) out.push('isLeapYear(1900) is true');
  if (F.parseDate("15/01/2024", "DD/MM/YYYY").getDate() !== 15) {
    out.push('parseDate("15/01/2024", "DD/MM/YYYY") does not land on the 15th');
  }

  // ---- the string short forms ----
  const strings = [
    ['startsWith("flet-box", "flet")', F.startsWith("flet-box", "flet"), true],
    ['endsWith("flet-box", "box")', F.endsWith("flet-box", "box"), true],
    ['includes("flet-box", "box")', F.includes("flet-box", "box"), true],
    ['split("a,b", ",")', F.split("a,b", ",").join("|"), "a|b"],
    ['join(["a", "b"], "-")', F.join(["a", "b"], "-"), "a-b"],
    ['trim("  x  ")', F.trim("  x  "), "x"],
    ['truncate("flet-box is awesome", 10, "...")', F.truncate("flet-box is awesome", 10, "..."), "flet-box i..."],
    ['capitalizeWords("flet box")', F.capitalizeWords("flet box"), "Flet Box"],
    ['reverseString("abc")', F.reverseString("abc"), "cba"],
  ];
  for (const [label, got, want] of strings) {
    if (got !== want) out.push(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }

  // ---- an interval the app can hand back ----
  const watch = F.timer("guard");
  if (typeof watch.stop !== "function" || typeof watch.elapsed !== "function") {
    out.push('timer("label") no longer hands back { stop, elapsed }');
  }
  const tick = F.everySecond(() => {});
  clearInterval(tick);
  // Node hands back a Timeout object, a browser a number; what matters is that
  // the helper gives back the very handle `clearInterval` releases.
  if (!tick) out.push("everySecond returned nothing to clear");
  const slow = F.every(F.seconds(5), () => {});
  clearInterval(slow);
  if (!slow) out.push("every returned nothing to clear");
};

const main = async () => {
  if (!process.env.FLETBOX_TIME_HELPER_CHILD) {
    let failed = 0;
    for (const zone of ZONES) {
      const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], {
        env: { ...process.env, TZ: zone, FLETBOX_TIME_HELPER_CHILD: zone },
        encoding: "utf8",
      });
      const lines = child.stdout.split("\n").filter(Boolean);
      const problems = lines.filter((l) => l.startsWith("PROBLEM "));
      const okRun = lines.some((l) => l.startsWith("RAN "));
      if (!okRun) {
        console.log(`❌ TZ=${zone} — the run died:\n${[child.stdout, child.stderr].join("\n")}`);
        failed += 1;
        continue;
      }
      console.log(`${problems.length === 0 ? "✅" : "❌"} TZ=${zone}${problems.length ? ` — ${problems.length}` : ""}`);
      for (const p of problems) console.log(`     ${p.slice("PROBLEM ".length)}`);
      if (problems.length || child.status !== 0) failed += 1;
    }
    if (failed) {
      console.log(`\n${failed} timezone(s) disagree with the contract.`);
      process.exit(1);
    }
    console.log(
      `\n✅ time & string helpers — ${TIME_NAMES.length} + ${STRING_NAMES.length} names reachable from 'flet-box', in ${ZONES.length} timezones.`,
    );
    return;
  }

  const zone = process.env.FLETBOX_TIME_HELPER_CHILD;
  // A helper that throws is a finding, not a stack trace — and the findings it
  // had already made still have to reach the report, or a crash hides the very
  // name that crashed.
  const out = [];
  try {
    await run(out);
  } catch (err) {
    out.push(`threw in ${zone}: ${String(err.message).split("\n")[0]}`);
  }
  for (const p of out) console.log(`PROBLEM ${p}`);
  console.log(`RAN ${zone} (${out.length} problems)`);
  process.exit(out.length ? 1 : 0);
};

await main();
