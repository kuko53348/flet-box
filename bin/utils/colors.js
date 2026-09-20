// bin/utils/colors.js
// Visual system of the CLI: ANSI + truecolor (gradients) with safe fallbacks.

const TRUE_COLOR = (() => {
  if (process.env.COLORTERM === "truecolor") return true;
  return /iTerm|vscode|kitty|ghostty|hyper|alacritty|wezterm|contour|tmux/i.test(
    process.env.TERM_PROGRAM || "",
  );
})();

// Colors only if there is a TTY and they weren't disabled (NO_COLOR, TERM=dumb)
const enabled = (() => {
  if (process.env.NO_COLOR) return false;
  if (process.env.TERM === "dumb") return false;
  try {
    return Boolean(process.stdout && process.stdout.isTTY);
  } catch {
    return false;
  }
})();

const code = (x) => (enabled ? x : "");
const reset = () => code("\x1b[0m");

export const colors = {
  // Standard
  black: code("\x1b[30m"),
  red: code("\x1b[31m"),
  green: code("\x1b[32m"),
  yellow: code("\x1b[33m"),
  blue: code("\x1b[34m"),
  magenta: code("\x1b[35m"),
  cyan: code("\x1b[36m"),
  white: code("\x1b[37m"),
  gray: code("\x1b[90m"),
  // Bright
  brightRed: code("\x1b[91m"),
  brightGreen: code("\x1b[92m"),
  brightYellow: code("\x1b[93m"),
  brightBlue: code("\x1b[94m"),
  brightMagenta: code("\x1b[95m"),
  brightCyan: code("\x1b[96m"),
  brightWhite: code("\x1b[97m"),
  // Styles
  bold: code("\x1b[1m"),
  dim: code("\x1b[2m"),
  italic: code("\x1b[3m"),
  underline: code("\x1b[4m"),
};

export const c = (color, text) => {
  const colorCode = colors[color];
  if (colorCode == null) return text;
  return `${colorCode}${text}${reset()}`;
};

// ---------- Truecolor ----------

const rgb = (r, g, b) => code(`\x1b[38;2;${r};${g};${b}m`);
const hex2rgb = (hex) => {
  let h = (hex || "#6366f1").replace("#", "");
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ];
};

// ANSI fallback for terminals without truecolor (e.g. Terminal.app)
const ANSI_FALLBACK = ["\x1b[36m", "\x1b[96m", "\x1b[35m", "\x1b[95m"];
const paintFallback = (text) => {
  const chars = [...text];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    out += ANSI_FALLBACK[i % ANSI_FALLBACK.length] + chars[i];
  }
  return out + reset();
};

export const hex = (text, hexColor = "#6366f1") => {
  if (!enabled || !TRUE_COLOR) return text;
  const [r, g, b] = hex2rgb(hexColor);
  return `${rgb(r, g, b)}${text}${reset()}`;
};

export const gradient = (text, from = "#6366f1", to = "#d946ef") => {
  if (!enabled || text.length === 0) return text;
  if (!TRUE_COLOR) return paintFallback(text);
  const [f1, f2, f3] = hex2rgb(from);
  const [t1, t2, t3] = hex2rgb(to);
  const chars = [...text];
  const N = Math.max(chars.length - 1, 1);
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    out +=
      rgb(
        Math.round(f1 + ((t1 - f1) * i) / N),
        Math.round(f2 + ((t2 - f2) * i) / N),
        Math.round(f3 + ((t3 - f3) * i) / N),
      ) + chars[i];
  }
  return out + reset();
};

const PALETTE = [
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#22d3ee",
  "#6366f1",
];

export const rainbow = (text) => {
  if (!enabled || text.length === 0) return text;
  if (!TRUE_COLOR) return paintFallback(text);
  const chars = [...text];
  const N = chars.length;
  let out = "";
  for (let i = 0; i < N; i++) {
    const [r, g, b] = hex2rgb(PALETTE[Math.floor((i / N) * (PALETTE.length - 1))]);
    out += rgb(r, g, b) + chars[i];
  }
  return out + reset();
};

// ---------- Layout helpers ----------

const strip = (t) => t.replace(/\x1b\[[0-9;]*m/g, "");
export const width = (t) => [...strip(t)].length;

// Display length: emoji / wide glyphs count as 2 cells
const dispLen = (t) =>
  [...strip(t)].reduce(
    (n, ch) => n + (ch.codePointAt(0) >= 0x1100 ? 2 : 1),
    0,
  );

export const divider = (text = "", color = "#8b5cf6") => {
  const line = "─".repeat(Math.max(2, 56 - width(text)));
  if (!text) return hex(line, color);
  return hex(line, color) + " " + text + " " + hex(line, color);
};

export const section = (icon, text, color = "#22d3ee") =>
  `\n  ${gradient(icon + "  " + text, color, "#a855f7")} ${hex("─".repeat(Math.max(4, 46 - width(text))), "#4338ca")}`;

// Double-line panel with gradient border and centered title
export const panel = (title, subtitle = "", { minW = 62 } = {}) => {
  const content = rainbow(title) + (subtitle ? c("gray", "  " + subtitle) : "");
  const cw = dispLen(content);
  const W = Math.max(cw + 4, minW);
  const total = W - cw;
  const left = " ".repeat(Math.floor(total / 2));
  const right = " ".repeat(Math.ceil(total / 2));
  const border = TRUE_COLOR
    ? gradient("═".repeat(W), "#6366f1", "#a855f7")
    : c("cyan", "═".repeat(W));
  const corner = (ch) => hex(ch, "#818cf8");
  return (
    "\n" +
    corner("╔") + border + corner("╗") + "\n" +
    corner("║") + left + content + right + corner("║") + "\n" +
    corner("╚") + border + corner("╝") + "\n"
  );
};

export const banner = (title, subtitle = "", opts = {}) =>
  panel(title, subtitle, opts);

export const badge = (icon, text, color = "brightCyan") =>
  `  ${c(color, icon + " " + text)}`;

// Status dot (green by default, red/amber for failures/warnings)
export const dot = (color = "#34d399") => hex("●", color);

// Typewriter effect: prints the text character by character (only on a TTY)
export const typewriter = async (
  text,
  { ms = 12, color = "#34d399" } = {},
) => {
  if (!enabled) {
    console.log(text);
    return;
  }
  const paint = TRUE_COLOR
    ? (() => {
        const [r, g, b] = hex2rgb(color);
        return (ch) => `\x1b[38;2;${r};${g};${b}m${ch}`;
      })()
    : (ch) => `\x1b[96m${ch}`;
  for (const ch of [...text]) {
    process.stdout.write(paint(ch));
    await new Promise((res) => setTimeout(res, ms));
  }
  process.stdout.write("\x1b[0m\n");
};

// Global Ctrl+C handler
export const setupCtrlC = () => {
  process.on("SIGINT", () => {
    console.log(`\n\n${rainbow("👋 Bye!")}\n`);
    process.exit(0);
  });
};

// Show help message for Ctrl+C
export const showExitHint = () => {
  console.log(`${c("gray", "Press Ctrl+C to exit")}`);
};