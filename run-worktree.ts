import { existsSync } from "fs";
import { join, basename } from "path";

if (process.argv.length < 3) {
  console.error("Usage: bun run-worktree.ts <worktree-folder-path>");
  process.exit(1);
}

const targetFolder = process.argv[2];

if (!existsSync(targetFolder)) {
  console.error(`Error: Target folder '${targetFolder}' does not exist.`);
  process.exit(1);
}

// 1. Determine Port from active_ports.json
const portsPath = join(process.cwd(), ".agent/active_ports.json");
let port = "4201"; // Fallback default port
const folderBase = basename(targetFolder);

if (existsSync(portsPath)) {
  try {
    const portsData = JSON.parse(await Bun.file(portsPath).text());
    
    // Attempt to match the folder name with descriptions in active_ports.json
    const matchedEntry = Object.entries(portsData).find(([p, desc]) => {
      const d = String(desc).toLowerCase();
      const f = folderBase.toLowerCase();
      // Matches if descriptions overlap (e.g. "drag-drop-tasks" matches "worktrees/wt-drag-drop-tasks")
      return f.includes(d) || d.includes(f) || f.replace("wt-", "").includes(d);
    });

    if (matchedEntry) {
      port = matchedEntry[0];
      console.log(`Found registered port ${port} for task '${matchedEntry[1]}' in active_ports.json.`);
    } else {
      console.log(`No specific port registered for '${folderBase}' in active_ports.json. Using fallback port ${port}.`);
    }
  } catch (error) {
    console.warn("Warning: Could not parse .agent/active_ports.json. Using fallback port 4201.", error);
  }
} else {
  console.log(`active_ports.json not found. Using fallback port ${port}.`);
}

// 2. Start processes
console.log("\n🚀 Starting Firebase Emulator (Project-wide)...");
const emulator = Bun.spawn(["pnpm", "exec", "firebase", "emulators:start", "--project", "pokerplanningneo"], {
  stdout: "inherit",
  stderr: "inherit",
});

console.log(`\n🚀 Starting Angular Dev Server in '${targetFolder}' on port ${port}...`);
const devServer = Bun.spawn(["pnpm", "exec", "ng", "serve", "--port", port], {
  cwd: targetFolder,
  stdout: "inherit",
  stderr: "inherit",
});

// 3. Process termination cleanup
const cleanup = () => {
  console.log("\nStopping servers...");
  try {
    emulator.kill();
    devServer.kill();
  } catch (e) {
    // Ignore errors on double-kills
  }
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
