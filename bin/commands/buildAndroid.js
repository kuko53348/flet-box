/**
 * @file bin/commands/buildAndroid.js
 * @description Synchronizes a FletBox project with Capacitor and builds a debug APK.
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

const prepareAndroidEnvironment = () => {
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
 * @returns {void}
 */
export const buildAndroid = () => {
  const { projectRoot } = assertCapacitorProject(requiredScripts);

  console.log(banner("🤖 Flet-Box Android", "debug APK"));
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

  console.log(c("blue", "\n🏗️ Compiling the debug APK..."));
  run(
    process.platform === "win32" ? gradleWrapper : `./${gradleWrapper}`,
    ["assembleDebug"],
    androidDir,
    "Gradle Android build",
    androidEnv,
  );

  const apkPath = path.join(
    androidDir,
    "app",
    "build",
    "outputs",
    "apk",
    "debug",
    "app-debug.apk",
  );
  if (!fs.existsSync(apkPath)) {
    throw new Error(`Gradle completed, but the APK was not found at ${apkPath}.`);
  }

  console.log(
    c(
      "green",
      `\n✅ Android APK created successfully.\n📍 APK path: adb install "${path.resolve(apkPath)}"`,
    ),
  );
};
