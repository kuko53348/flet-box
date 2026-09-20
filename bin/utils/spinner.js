// bin/utils/spinner.js
// Dependency-free CLI spinner (keeps flet-box zero-deps, looks like ora).

import { execSync } from "child_process";
import { c } from "./colors.js";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL = 80;
const RESET = "\x1b[0m";
const CYAN = "\x1b[96m";

const isTTY = () => Boolean(process.stdout && process.stdout.isTTY);

class Spinner {
  constructor(text = "") {
    this.text = text;
    this.frame = 0;
    this.timer = null;
    this.running = false;
  }

  start() {
    if (this.running) return this;
    this.running = true;
    process.stdout.write("\n");
    this.timer = setInterval(() => this.render(), INTERVAL);
    this.render();
    return this;
  }

  render() {
    const f = FRAMES[this.frame % FRAMES.length];
    process.stdout.write(`\x1b[1A\x1b[K${CYAN}${f}${RESET} ${this.text}\n`);
    this.frame++;
  }

  stop(msg) {
    if (!this.running) return;
    this.running = false;
    clearInterval(this.timer);
    process.stdout.write(`\x1b[1A\x1b[K${msg}\n`);
  }

  succeed(text) {
    this.stop(`${c("green", "✔")} ${text ?? this.text}`);
  }

  fail(text) {
    this.stop(`${c("red", "✖")} ${text ?? this.text}`);
  }

  setText(text) {
    this.text = text;
  }
}

// Return a no-op spinner when there is no TTY (instant clean output)
export const spinner = (text) => {
  if (!isTTY()) {
    console.log(c("gray", text));
    return { succeed: () => {}, fail: () => {}, stop: () => {}, setText: () => {} };
  }
  return new Spinner(text).start();
};

// Run a shell command with a spinner. Silences stdout/stderr; on failure the
// last lines of stderr are shown.
export const execSpin = (text, cmd) => {
  if (!isTTY()) {
    try {
      execSync(cmd, { stdio: "inherit", shell: true });
      console.log(c("green", `✔ ${text}`));
      return true;
    } catch {
      console.log(c("red", `✖ ${text}`));
      return false;
    }
  }
  const s = new Spinner(text).start();
  try {
    execSync(cmd, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      encoding: "utf8",
    });
    s.succeed(text);
    return true;
  } catch (e) {
    s.fail(text);
    const err = (e.stderr || "").toString().trim();
    if (err) {
      console.log(c("red", err.split("\n").slice(-4).join("\n")));
    }
    return false;
  }
};