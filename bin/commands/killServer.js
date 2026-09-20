// bin/commands/killServer.js
import { execSync } from "child_process";
import { c, banner, gradient, rainbow } from "../utils/colors.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const waitGone = async (pid, timeout) => {
  const start = Date.now();
  while (isAlive(pid) && Date.now() - start < timeout) {
    await sleep(100);
  }
  return !isAlive(pid);
};

const hasLsof = () => {
  try {
    execSync("command -v lsof", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
};

const listenersOnPort = (port) => {
  try {
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.split("\n").map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
};

export const killServer = async (portArg, { dryRun = false } = {}) => {
  const PORT = Number(portArg) || 8000;

  console.log(banner("🗡️  Kill Server", `port ${PORT}`));

  if (!hasLsof()) {
    console.error(c("red", "❌ lsof not found (needed to find processes)"));
    console.log(c("gray", `    Try manually: kill $(lsof -ti tcp:${PORT})`));
    process.exit(1);
  }

  const pids = listenersOnPort(PORT);

  if (pids.length === 0) {
    console.log(gradient(` ✅ No servers listening on port ${PORT}`, "#34d399", "#22d3ee"));
    return;
  }

  console.log(
    gradient(`Found ${pids.length} process(es) on port ${PORT}:`, "#fbbf24", "#fb923c"),
  );
  for (const pid of pids) {
    let name = "?";
    try {
      name = execSync(`ps -p ${pid} -o command=`, { encoding: "utf8" }).trim();
    } catch {
      // ignore
    }
    console.log(c("gray", `  · ${c("bold", rainbow(pid))}  ${c("dim", name)}`));
  }

  if (dryRun) {
    console.log(
      "\n" + gradient("--dry-run: nothing killed. Run without --dry-run to kill them.", "#22d3ee", "#38bdf8"),
    );
    return;
  }

  for (const pid of pids) {
    if (!isAlive(pid)) continue;
    try {
      execSync(`kill -TERM ${pid}`, { stdio: "ignore" });
      const gone = await waitGone(pid, 1500);
      if (!gone) {
        execSync(`kill -KILL ${pid}`, { stdio: "ignore" });
        await waitGone(pid, 1000);
      }
      console.log(gradient(` 💀 Killed: ${pid}`, "#f43f5e", "#fb923c"));
    } catch (e) {
      console.error(c("red", `❌ No se pudo matar ${pid}: ${e && e.message}`));
    }
  }

  await sleep(300);
  const restantes = listenersOnPort(PORT);
  if (restantes.length > 0) {
    console.log(c("yellow", `⚠️ Processes still on port ${PORT}: ${restantes.join(", ")}`));
  } else {
    console.log(gradient(` ✅ Port ${PORT} released.`, "#34d399", "#22d3ee"));
  }
};

export default killServer;