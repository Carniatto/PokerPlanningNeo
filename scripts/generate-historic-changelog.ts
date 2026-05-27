import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

const ROOT = "/Users/mateuscarniatto/dev/PokerPlanningNeo";

/**
 * Keywords that indicate a commit is a technical/infrastructure chore rather
 * than a user-facing feature or bug fix. Commits whose cleaned message
 * contains any of these patterns (case-insensitive) are excluded from the
 * user-visible changelog.
 */
const CHORE_PATTERNS: RegExp[] = [
  /\bangular\s+\d+/i,           // Angular version upgrades
  /\bupgrade\b.*\bangular\b/i,
  /\bmigrat/i,                  // migrations (gen 2, firestore, etc.)
  /\bgen 2\b/i,
  /\bnode runtime\b/i,
  /\bci\/cd\b/i,
  /\bci\s+workflow\b/i,
  /\bworkflow push\b/i,
  /\bdeployment.*workflow\b/i,
  /\bauto.?deploy\b/i,
  /\bcloud functions\b/i,
  /\bsetup.*deploy/i,
  /\bhosting.*deploy/i,
  /\bfirebase hosting\b/i,
  /\bpnpm.*npm\b/i,             // package manager switches
  /\blockfile/i,
  /\btsconfig/i,
  /\bvitest\b/i,
  /\bplaywright\b/i,
  /\bzoneless\b/i,
  /\bzone\.js\b/i,
  /\boauth return\b/i,
  /\bcross.?domain redirect\b/i,
  /\bfirebase project\b/i,
  /\bsite for deploy\b/i,
  /\bprovide ?router\b/i,
  /\bsignal forms api\b/i,
  /\bsave lockfiles\b/i,
  /\borgon\b/i,
  /\beurope.?west\b/i,
];

/**
 * Returns true if the cleaned commit message describes a technical/infrastructure
 * change that should NOT appear in the user-facing changelog.
 */
function isChore(message: string): boolean {
  return CHORE_PATTERNS.some(re => re.test(message));
}

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
      // Skip technical/infrastructure chores
      if (!isChore(formatted) && !groups[date].features.includes(formatted)) {
        groups[date].features.push(formatted);
      }
    } else if (/^fix(\([a-z0-9-]+\))?:/.test(message)) {
      const cleanMsg = message.replace(/^fix(\([a-z0-9-]+\))?:\s*/, "");
      const formatted = cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
      // Skip technical/infrastructure fixes
      if (!isChore(formatted) && !groups[date].fixes.includes(formatted)) {
        groups[date].fixes.push(formatted);
      }
    }
  }

  // Filter out dates that have no user-facing features and no fixes, and sort by date descending
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
  console.log(`Successfully generated retroactive changelog with ${entries.length} release entries (user-facing only)!`);
} catch (error) {
  console.error("Failed to generate retroactive changelog:", error);
  process.exit(1);
}
