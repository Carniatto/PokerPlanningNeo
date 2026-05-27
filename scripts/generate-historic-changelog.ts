import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

const ROOT = "/Users/mateuscarniatto/dev/PokerPlanningNeo/worktrees/wt-changelog-retroactive";

try {
  const gitLog = execSync('git log --date=short --pretty=format:"%ad %s"', { cwd: ROOT }).toString();
  const lines = gitLog.split("\n").filter(Boolean);

  interface Entry {
    version: string;
    date: string;
    features: string[];
    fixes: string[];
  }

  const groups: Record<string, Entry> = {};

  for (const line of lines) {
    const date = line.substring(0, 10);
    const message = line.substring(11).trim();

    if (!groups[date]) {
      groups[date] = {
        version: date.replace(/-/g, "."),
        date: date,
        features: [],
        fixes: []
      };
    }

    if (/^feat(\([a-z0-9-]+\))?:/.test(message)) {
      const cleanMsg = message.replace(/^feat(\([a-z0-9-]+\))?:\s*/, "");
      const formatted = cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
      if (!groups[date].features.includes(formatted)) {
        groups[date].features.push(formatted);
      }
    } else if (/^fix(\([a-z0-9-]+\))?:/.test(message)) {
      const cleanMsg = message.replace(/^fix(\([a-z0-9-]+\))?:\s*/, "");
      const formatted = cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
      if (!groups[date].fixes.includes(formatted)) {
        groups[date].fixes.push(formatted);
      }
    }
  }

  // Filter out dates that have no features and no fixes, and sort by date descending
  const entries = Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map(date => groups[date])
    .filter(entry => entry.features.length > 0 || entry.fixes.length > 0);

  const fileContent = `export interface ChangelogEntry {
  version: string;
  date: string;
  features: string[];
  fixes?: string[];
}

export const CHANGELOG: ChangelogEntry[] = ${JSON.stringify(entries, null, 2)};
`;

  writeFileSync(join(ROOT, "src/app/changelog.ts"), fileContent, "utf-8");
  console.log(`Successfully generated retroactive changelog with ${entries.length} release entries!`);
} catch (error) {
  console.error("Failed to generate retroactive changelog:", error);
  process.exit(1);
}
