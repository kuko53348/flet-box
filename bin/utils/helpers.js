// bin/utils/helpers.js
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { c } from "./colors.js";

export const createFile = (filePath, content) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`${c("green", "✅")} Created: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(
      `${c("red", "❌")} Failed to create ${filePath}: ${error.message}`,
    );
  }
};

export const copyFile = (source, dest) => {
  try {
    if (fs.existsSync(source)) {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(source, dest);
      console.log(`${c("green", "✅")} Copied: ${path.basename(source)}`);
      return true;
    } else {
      console.log(
        `${c("yellow", "⚠️")} Source not found: ${path.basename(source)}`,
      );
      return false;
    }
  } catch (error) {
    console.error(
      `${c("red", "❌")} Failed to copy ${path.basename(source)}: ${error.message}`,
    );
    return false;
  }
};

export const makeExecutable = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.chmodSync(filePath, 0o755);
      console.log(`${c("blue", "🔧")} Executable: ${path.basename(filePath)}`);
    }
  } catch (error) {
    if (process.env.DEBUG) {
      console.error(
        `${c("red", "⚠️")} Could not make executable: ${path.basename(filePath)}`,
      );
    }
  }
};

export const execCmd = (cmd) => {
  try {
    execSync(cmd, {
      stdio: "inherit",
      shell: true,
    });
    return true;
  } catch (error) {
    console.error(`${c("red", "❌")} Command failed: ${cmd}`);
    if (process.env.DEBUG) {
      console.error(error.message);
    }
    return false;
  }
};

// Fixed: Now returns actual package path
export const getPackagePath = () => {
  return path.join(process.cwd(), "node_modules", "flet-box");
};
