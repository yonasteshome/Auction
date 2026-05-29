const { execSync } = require("node:child_process");

const ports = [3000, 3001, 3002, 6006, 6007, 8000, 8001];

function getPidsByPort(port) {
  try {
    const output = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    });

    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((pid) => Number(pid))
      .filter(Number.isInteger);
  } catch {
    return [];
  }
}

function terminatePid(pid) {
  try {
    process.kill(pid, "SIGTERM");
    return true;
  } catch {
    return false;
  }
}

if (process.platform === "win32") {
  console.log("[predev] Port cleanup skipped on Windows.");
  process.exit(0);
}

const killed = new Set();

for (const port of ports) {
  const pids = getPidsByPort(port);
  for (const pid of pids) {
    if (killed.has(pid)) {
      continue;
    }

    if (terminatePid(pid)) {
      killed.add(pid);
      console.log(`[predev] Released port ${port} (pid ${pid}).`);
    }
  }
}

if (killed.size === 0) {
  console.log("[predev] No stale dev ports found.");
}
