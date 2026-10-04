/**
 * @file bin/commands/buildIOS.js
 * @description Synchronizes a FletBox project with Capacitor and builds a native
 * iOS app.
 *
 * Two destinations are supported:
 * - default     → `App.app` for the iOS Simulator, no signing required.
 * - `--archive` → `App.xcarchive` for real devices, unsigned. The IPA is
 *                 exported from that archive in Xcode with an Apple team.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { c, banner } from "../utils/colors.js";
import {
  assertCapacitorProject,
  commandExists,
  ensureNpmDependencies,
  run,
} from "../utils/capacitor.js";

const requiredPackages = [
  "@capacitor/cli",
  "@capacitor/core",
  "@capacitor/ios",
  "flet-box",
  "sharp",
];

const requiredScripts = ["ios:init", "ios:sync"];

/** Path of the active Xcode developer directory, empty when unset. */
const developerDir = () => {
  const result = spawnSync("xcode-select", ["-p"], {
    stdio: ["ignore", "pipe", "ignore"],
  });
  return result.stdout ? result.stdout.toString().trim() : "";
};

/**
 * Validates the Apple toolchain needed to compile an iOS app.
 *
 * The Xcode Command Line Tools cannot do this job: they install a `xcodebuild`
 * stub and no simulator runtime, so the failure would only surface later as an
 * opaque Xcode error. Detecting that selection up front lets the command point
 * at the actual fix.
 *
 * @param {{ simulator: boolean }} options - `simulator` requests a simulator
 *   destination, which additionally needs `simctl`.
 * @returns {void}
 * @throws {Error} With an actionable message when a requirement is missing.
 */
const requireAppleToolchain = ({ simulator }) => {
  if (process.platform !== "darwin") {
    throw new Error(
      "Building iOS requires macOS with Xcode. Run `flet-box build ios` on a Mac.",
    );
  }

  const dir = developerDir();
  if (!dir) {
    throw new Error(
      "No active Xcode developer directory. Install Xcode from the App Store, then run `xcode-select --install`.",
    );
  }
  if (dir.includes("CommandLineTools")) {
    throw new Error(
      `The active developer directory is the Command Line Tools (${dir}), which cannot build iOS apps. Install the full Xcode app, then run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`,
    );
  }
  if (!commandExists("xcodebuild", ["-version"])) {
    throw new Error(
      "xcodebuild is not available. Open Xcode once so it finishes installing its components.",
    );
  }
  if (!commandExists("pod", ["--version"])) {
    throw new Error(
      "CocoaPods was not found. Capacitor links its native layer with CocoaPods, so install it with `sudo gem install cocoapods` (or `brew install cocoapods`) and run `pod setup` once.",
    );
  }
  if (simulator && !commandExists("xcrun", ["--find", "simctl"])) {
    throw new Error(
      "Simulator tools (simctl) were not found. Install an iOS simulator runtime from Xcode → Settings → Platforms, or build for a device with `flet-box build ios --archive`.",
    );
  }
};

/**
 * Runs `xcodebuild` on the generated Capacitor project.
 *
 * @param {object} options - Build options.
 * @param {string} options.iosDir - Absolute path of the `ios` directory.
 * @param {string} options.sdk - Xcode SDK to build against.
 * @param {string} options.destination - `xcodebuild -destination` value.
 * @param {string} options.configuration - `Debug` or `Release`.
 * @param {"build" | "archive"} options.action - Xcode action.
 * @param {string} [options.archivePath] - Required when the action is `archive`.
 * @returns {void}
 */
const xcodebuildRun = ({
  iosDir,
  sdk,
  destination,
  configuration,
  action,
  archivePath,
}) => {
  const args = [
    "-project",
    "App/App.xcodeproj",
    "-scheme",
    "App",
    "-configuration",
    configuration,
    "-sdk",
    sdk,
    "-destination",
    destination,
    "-derivedDataPath",
    "build",
    // Generated projects ship without a signing team, so signing is disabled.
    // Without this, the build fails while looking for an identity instead of
    // compiling anything.
    "CODE_SIGNING_ALLOWED=NO",
  ];

  if (action === "archive") {
    args.push("-archivePath", archivePath, "archive");
  } else {
    args.push("build");
  }

  run("xcodebuild", args, iosDir, `Xcode ${action} (${sdk})`);
};

/**
 * Entry point for `flet-box build ios`.
 *
 * @param {string[]} [rawArgs=[]] - Raw CLI flags: `--simulator` (default) or `--archive`.
 * @returns {void}
 */
export const buildIOS = (rawArgs = []) => {
  const supportedFlags = ["--simulator", "--archive"];
  const unknownFlags = rawArgs.filter((arg) => !supportedFlags.includes(arg));
  if (unknownFlags.length > 0) {
    throw new Error(
      `Unknown option for \`build ios\`: ${unknownFlags.join(", ")}. Supported options: ${supportedFlags.join(", ")}.`,
    );
  }
  const archive = rawArgs.includes("--archive");

  const { projectRoot } = assertCapacitorProject(requiredScripts);

  console.log(
    banner(
      "🍎 Flet-Box iOS",
      archive ? "device archive" : "iOS Simulator app",
    ),
  );
  requireAppleToolchain({ simulator: !archive });
  ensureNpmDependencies(projectRoot, requiredPackages);

  const iosDir = path.join(projectRoot, "ios");
  if (!fs.existsSync(iosDir)) {
    console.log(c("blue", "\n📱 Initializing the iOS platform..."));
    run("npm", ["run", "ios:init"], projectRoot, "iOS initialization");
  }

  console.log(c("blue", "\n🔄 Building and synchronizing the app..."));
  run("npm", ["run", "ios:sync"], projectRoot, "iOS synchronization");

  const xcodeProject = path.join(iosDir, "App", "App.xcodeproj");
  if (!fs.existsSync(xcodeProject)) {
    throw new Error(
      `Xcode project not found at ${xcodeProject}. Check that Capacitor iOS initialization completed.`,
    );
  }

  const derivedDataPath = path.join(iosDir, "build");

  if (archive) {
    const archivePath = path.join(derivedDataPath, "App.xcarchive");
    console.log(c("blue", "\n🏗️ Archiving for real devices..."));
    xcodebuildRun({
      iosDir,
      sdk: "iphoneos",
      destination: "generic/platform=iOS",
      configuration: "Release",
      action: "archive",
      archivePath,
    });

    if (!fs.existsSync(archivePath)) {
      throw new Error(
        `Xcode completed, but no archive was found at ${archivePath}.`,
      );
    }

    console.log(
      c(
        "green",
        `\n✅ iOS archive created successfully.\n📍 Archive path: ${path.resolve(archivePath)}\nℹ️ The archive is unsigned. Export an IPA from it in Xcode (Product → Archive) with your Apple signing team, or with \`xcodebuild -exportArchive\` plus an ExportOptions.plist.`,
      ),
    );
    return;
  }

  console.log(c("blue", "\n🏗️ Compiling for the iOS Simulator..."));
  xcodebuildRun({
    iosDir,
    sdk: "iphonesimulator",
    destination: "generic/platform=iOS Simulator",
    configuration: "Debug",
    action: "build",
  });

  const appPath = path.join(
    derivedDataPath,
    "Build",
    "Products",
    "Debug-iphonesimulator",
    "App.app",
  );
  if (!fs.existsSync(appPath)) {
    throw new Error(
      `Xcode completed, but the simulator app was not found at ${appPath}.`,
    );
  }

  console.log(
    c(
      "green",
      `\n✅ iOS Simulator app created successfully.\n📍 App path: ${path.resolve(appPath)}\nℹ️ Install it on a running simulator with: xcrun simctl install booted ${path.resolve(appPath)}\nℹ️ For a signed IPA, run \`flet-box build ios --archive\`.`,
    ),
  );
};
