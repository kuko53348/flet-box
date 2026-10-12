/**
 * @file bin/commands/runNative.js
 * @description Compiles and launches a FletBox app on an Android emulator or
 * physical device, or on the iOS Simulator, wrapping Capacitor's `cap run`.
 *
 * Usage: `flet-box run-native <android|ios> [--device] [--livereload]`
 */

import fs from "node:fs";
import path from "node:path";
import { c, banner } from "../utils/colors.js";
import {
  assertCapacitorProject,
  ensureNpmDependencies,
  run,
} from "../utils/capacitor.js";
import { prepareAndroidEnvironment } from "./buildAndroid.js";
import { requireAppleToolchain } from "./buildIOS.js";

const androidPackages = [
  "@capacitor/android",
  "@capacitor/cli",
  "@capacitor/core",
  "flet-box",
  "sharp",
];

const iosPackages = [
  "@capacitor/cli",
  "@capacitor/core",
  "@capacitor/ios",
  "flet-box",
  "sharp",
];

/**
 * Entry point for `flet-box run-native`.
 *
 * @param {string[]} [rawArgs=[]] - Raw CLI args: `<android|ios>` platform plus
 *   `--device` (physical device) and `--livereload` (hot reload) flags.
 * @returns {void}
 */
export const runNative = (rawArgs = []) => {
  const platform = rawArgs[0];
  if (platform !== "android" && platform !== "ios") {
    throw new Error(
      'Usage: `flet-box run-native <android|ios>` — for example `flet-box run-native android`.',
    );
  }

  const supportedFlags = ["--device", "--livereload"];
  const unknownFlags = rawArgs.slice(1).filter((arg) => !supportedFlags.includes(arg));
  if (unknownFlags.length > 0) {
    throw new Error(
      `Unknown option for \`run-native ${platform}\`: ${unknownFlags.join(", ")}. Supported options: ${supportedFlags.join(", ")}.`,
    );
  }
  const device = rawArgs.includes("--device");
  const livereload = rawArgs.includes("--livereload");

  const isAndroid = platform === "android";
  const scripts = isAndroid ? ["android:init", "android:sync"] : ["ios:init", "ios:sync"];
  const packages = isAndroid ? androidPackages : iosPackages;

  const { projectRoot } = assertCapacitorProject(scripts);
  console.log(
    banner(
      "🚀 Flet-Box Native",
      isAndroid
        ? device ? "Android device" : "Android emulator"
        : device ? "iOS device" : "iOS Simulator",
    ),
  );

  ensureNpmDependencies(projectRoot, packages);

  let env = process.env;
  if (isAndroid) {
    env = prepareAndroidEnvironment();
  } else {
    requireAppleToolchain({ simulator: !device });
  }

  const platformDir = path.join(projectRoot, isAndroid ? "android" : "ios");
  if (!fs.existsSync(platformDir)) {
    console.log(c("blue", `\n📱 Initializing the ${isAndroid ? "Android" : "iOS"} platform...`));
    run("npm", ["run", isAndroid ? "android:init" : "ios:init"], projectRoot, `${platform} initialization`, env);
  }

  console.log(c("blue", "\n🔄 Building and synchronizing the app..."));
  run("npm", ["run", isAndroid ? "android:sync" : "ios:sync"], projectRoot, `${platform} synchronization`, env);

  const capArgs = ["cap", "run", platform];
  if (device) capArgs.push("--device");
  if (livereload) capArgs.push("--livereload");

  console.log(
    c("blue", `\n🏗️ Compiling and launching on the ${isAndroid ? "Android" : "iOS"} ${device ? "device" : "emulator/simulator"}...`),
  );
  run("npx", capArgs, projectRoot, `${platform} launch`, env);

  console.log(
    c(
      "green",
      `\n🚀 App launched on the ${isAndroid ? "Android" : "iOS"} ${device ? "device" : "emulator/simulator"}.` +
        `\n📍 Re-run \`flet-box run-native ${platform}\` to rebuild, or add \`--livereload\` for hot reload.`,
    ),
  );
};