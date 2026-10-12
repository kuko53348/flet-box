/**
 * @file bin/commands/buildAndroid.js
 * @description Synchronizes a FletBox project with Capacitor and builds a debug
 *              APK, an unsigned release APK, or an unsigned release AAB.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { c, banner } from "../utils/colors.js";
import {
  assertCapacitorProject,
  commandExists,
  ensureNpmDependencies,
  run,
} from "../utils/capacitor.js";

const requiredPackages = [
  "@capacitor/android",
  "@capacitor/cli",
  "@capacitor/core",
  "flet-box",
  "sharp",
];

const requiredScripts = ["android:init", "android:sync"];

/** Well-known Android SDK locations per platform, most specific first. */
const androidSdkCandidates = () => {
  const candidates = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
  ].filter(Boolean);

  if (process.platform === "darwin") {
    candidates.push(path.join(os.homedir(), "Library", "Android", "sdk"));
  } else if (process.platform === "win32") {
    candidates.push(
      path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk"),
    );
  } else {
    candidates.push(path.join(os.homedir(), "Android", "Sdk"));
  }

  return candidates;
};

export const prepareAndroidEnvironment = () => {
  const sdkPath = androidSdkCandidates().find(
    (candidate) => candidate && fs.existsSync(candidate),
  );
  if (!sdkPath) {
    throw new Error(
      "Android SDK was not found. Install Android Studio and its Android SDK, or set ANDROID_HOME/ANDROID_SDK_ROOT.",
    );
  }

  if (!commandExists("java", ["-version"])) {
    throw new Error(
      "Java was not found. Install a JDK supported by your Android Gradle project and ensure `java` is on PATH.",
    );
  }

  return {
    ...process.env,
    ANDROID_HOME: sdkPath,
    ANDROID_SDK_ROOT: sdkPath,
  };
};

/**
 * Entry point for `flet-box build android`.
 *
 * @param {string[]} [rawArgs=[]] - Raw CLI flags: `--debug` (default) or
 *   `--release` (unsigned release APK/AAB, ready for your own signing).
 * @returns {void}
 */
export const buildAndroid = (rawArgs = []) => {
  const supportedFlags = ["--debug", "--release", "--aab"];
  const unknownFlags = rawArgs.filter((arg) => !supportedFlags.includes(arg));
  if (unknownFlags.length > 0) {
    throw new Error(
      `Unknown option for \`build android\`: ${unknownFlags.join(", ")}. Supported options: ${supportedFlags.join(", ")}.`,
    );
  }

  const release = rawArgs.includes("--release");
  const aab = rawArgs.includes("--aab");
  if (aab && !release) {
    throw new Error("`--aab` requires `--release`. Example: `flet-box build android --release --aab`.");
  }

  const mode = aab ? "release AAB" : release ? "unsigned release APK" : "debug APK";
  const gradleTask = aab ? "bundleRelease" : release ? "assembleRelease" : "assembleDebug";

  const { projectRoot } = assertCapacitorProject(requiredScripts);

  console.log(banner("🤖 Flet-Box Android", mode));
  ensureNpmDependencies(projectRoot, requiredPackages);
  const androidEnv = prepareAndroidEnvironment();

  const androidDir = path.join(projectRoot, "android");
  if (!fs.existsSync(androidDir)) {
    console.log(c("blue", "\n📱 Initializing the Android platform..."));
    run(
      "npm",
      ["run", "android:init"],
      projectRoot,
      "Android initialization",
      androidEnv,
    );
  }

  console.log(c("blue", "\n🔄 Building and synchronizing the app..."));
  run(
    "npm",
    ["run", "android:sync"],
    projectRoot,
    "Android synchronization",
    androidEnv,
  );

  const gradleWrapper =
    process.platform === "win32" ? "gradlew.bat" : "gradlew";
  const gradlePath = path.join(androidDir, gradleWrapper);
  if (!fs.existsSync(gradlePath)) {
    throw new Error(
      `Gradle wrapper not found at ${gradlePath}. Check that Capacitor Android initialization completed.`,
    );
  }

  console.log(c("blue", `\n🏗️ Compiling the ${mode}...`));
  run(
    process.platform === "win32" ? gradleWrapper : `./${gradleWrapper}`,
    [gradleTask],
    androidDir,
    "Gradle Android build",
    androidEnv,
  );

  const outputsDir = path.join(androidDir, "app", "build", "outputs");
  const artifact = findArtifact(outputsDir, aab, release);
  if (!artifact) {
    throw new Error(
      `Gradle completed, but the ${mode} was not found under ${outputsDir}.`,
    );
  }

  if (!release) {
    console.log(
      c(
        "green",
        `\n✅ Android APK created successfully.\n📍 APK path: adb install "${path.resolve(artifact)}"`,
      ),
    );
    return;
  }

  const signHint = aab
    ? `Sign it for Play with your upload key: jarsigner -keystore <tu.keystore> <alias> "${path.resolve(artifact)}"\n   Then upload it to the Play Console (Play App Signing applies the final key).`
    : `Sign it yourself (already aligned by Gradle, skip zipalign):\n   apksigner sign --ks <tu.keystore> --ks-key-alias <alias> --out app-firmado.apk "${path.resolve(artifact)}"\n   Then verify: apksigner verify --verbose --print-certs app-firmado.apk`;

  console.log(
    c(
      "green",
      `\n✅ Android ${mode} created successfully (unsigned by design).\n📍 Path: ${path.resolve(artifact)}\nℹ️ ${signHint}`,
    ),
  );
};

/**
 * Locates the Gradle output artifact for the selected build mode.
 *
 * Debug APKs land in `apk/debug/app-debug.apk`. Unsigned release APKs land in
 * `apk/release/` and may be named `app-release.apk` or `app-release-unsigned.apk`
 * depending on the Android Gradle Plugin version. AABs land in
 * `bundle/release/app-release.aab`.
 *
 * @param {string} outputsDir - The Gradle `app/build/outputs` directory.
 * @param {boolean} aab - Whether the target is a bundle instead of an APK.
 * @param {boolean} release - Whether the build is a release build.
 * @returns {string | null} Absolute path to the artifact, or null.
 */
const findArtifact = (outputsDir, aab, release) => {
  const candidates = [];
  if (aab) {
    candidates.push(path.join(outputsDir, "bundle", "release", "app-release.aab"));
  } else if (release) {
    const releaseDir = path.join(outputsDir, "apk", "release");
    if (fs.existsSync(releaseDir)) {
      const apks = fs.readdirSync(releaseDir).filter((file) => file.endsWith(".apk"));
      candidates.push(path.join(releaseDir, "app-release.apk"));
      candidates.push(path.join(releaseDir, "app-release-unsigned.apk"));
      for (const apk of apks) candidates.push(path.join(releaseDir, apk));
    }
  } else {
    candidates.push(path.join(outputsDir, "apk", "debug", "app-debug.apk"));
  }
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
};
