import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Main repository root path
const ROOT_PATH = "/Users/mateuscarniatto/dev/PokerPlanningNeo";

// Help menu & args checking
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h") || args.length < 3) {
  console.log(`
🚀 /create-skill - Meta-skill generator for Antigravity Workspace Skills

Usage:
  bun .agents/skills/create-skill/tools/create-skill.ts <skill-name> "<description>" "<comma-separated-steps>"

Arguments:
  skill-name             Alphanumeric folder name (e.g. lint, deploy-db)
  description            Short user-facing explanation of the skill
  comma-separated-steps  List of workflow steps (e.g. "format,check,fix")

Example:
  bun .agents/skills/create-skill/tools/create-skill.ts lint "Lint and format project files" "format,check"
`);
  process.exit(args.length < 3 ? 1 : 0);
}

const skillName = args[0].toLowerCase().replace(/[^a-z0-9-_]/g, "");
const description = args[1];
const stepsRaw = args[2];

if (!skillName) {
  console.error("❌ Invalid skill name.");
  process.exit(1);
}

const steps = stepsRaw
  .split(",")
  .map(s => s.trim().toLowerCase().replace(/[^a-z0-9-_]/g, ""))
  .filter(Boolean);

if (steps.length === 0) {
  console.error("❌ You must specify at least one step.");
  process.exit(1);
}

const skillDir = join(ROOT_PATH, `.agents/skills/${skillName}`);
const workflowsDir = join(skillDir, "workflows");
const toolsDir = join(skillDir, "tools");

console.log(`\n🛠️ Scaffolding skill: ${skillName}`);
console.log(`📂 Destination:       ${skillDir}`);
console.log(`📝 Steps:             ${steps.join(", ")}`);

// Create directories
if (!existsSync(skillDir)) mkdirSync(skillDir, { recursive: true });
if (!existsSync(workflowsDir)) mkdirSync(workflowsDir, { recursive: true });
if (!existsSync(toolsDir)) mkdirSync(toolsDir, { recursive: true });

// 1. Generate SKILL.md router
const skillMdContent = `---
name: ${skillName}
description: "${description}. Triggers on /${skillName}."
---

# ${skillName.toUpperCase()} Skill (/${skillName})

${description}.

## Routing Instructions

All deterministic execution steps are handled by the Bun-based automation script located at [${skillName}.ts](file://${toolsDir}/${skillName}.ts).

### Running the Entire Workflow
When the user types /${skillName} or asks to run it:
1. Run the automation script:
   \`\`\`bash
   bun .agents/skills/${skillName}/tools/${skillName}.ts
   \`\`\`

### Running Specific Phases
The script supports granular execution. Translate the user request to appropriate flags:
${steps.map(step => `- **${step.toUpperCase()}**: \`bun .agents/skills/${skillName}/tools/${skillName}.ts --${step}\``).join("\n")}

If the user wants to run **only** a specific action without the rest of the pipeline, append the \`--only\` flag (e.g., \`bun .agents/skills/${skillName}/tools/${skillName}.ts --${steps[0]} --only\`).

## Detailed Reference
For an in-depth breakdown of each phase, refer to the individual workflow documentation:
${steps.map((step, idx) => `* **Stage ${idx + 1} (${step.toUpperCase()})**: [${step}.md](file://${workflowsDir}/${step}.md)`).join("\n")}
`;

writeFileSync(join(skillDir, "SKILL.md"), skillMdContent, "utf-8");
console.log("✅ Generated SKILL.md");

// 2. Generate Workflows
steps.forEach((step, idx) => {
  const workflowContent = `# Workflow: ${step.toUpperCase()}

This stage handles the ${step} phase of the ${skillName} process.

## Process
1. Describe the actions taken during this step.
2. Outline decision logic and conditions.

## Commands
* Example command to execute:
  \`\`\`bash
  # Add command here
  \`\`\`
`;
  writeFileSync(join(workflowsDir, `${step}.md`), workflowContent, "utf-8");
  console.log(`✅ Generated workflows/${step}.md`);
});

// 3. Generate tools/<name>.ts script
const scriptContent = `import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Main repository root path
const ROOT_PATH = "/Users/mateuscarniatto/dev/PokerPlanningNeo";

// Helper for running synchronous commands and getting status/output
function runCmd(args: string[], cwd: string = process.cwd(), inheritIO = true) {
  const result = Bun.spawnSync(args, {
    cwd,
    stdout: inheritIO ? "inherit" : "pipe",
    stderr: inheritIO ? "inherit" : "pipe",
  });
  
  const stdoutStr = result.stdout ? result.stdout.toString().trim() : "";
  const stderrStr = result.stderr ? result.stderr.toString().trim() : "";
  
  return {
    success: result.success,
    exitCode: result.exitCode,
    stdout: stdoutStr,
    stderr: stderrStr,
  };
}

// Parse Command Line Arguments
const args = process.argv.slice(2);
const flags = {
${steps.map(step => `  ${step}: args.includes("--${step}"),`).join("\n")}
  only: args.includes("--only"),
};

// Help menu
if (args.includes("--help") || args.includes("-h")) {
  console.log(\`
🚀 /${skillName} - ${description}

Usage:
  bun .agents/skills/${skillName}/tools/${skillName}.ts [options]

Options:
${steps.map(step => `  --${step.padEnd(16)} Run ${step} stage`).join("\n")}
  --only            Only execute the specified steps (do not run full sequence)
  -h, --help        Show this help menu
\`);
  process.exit(0);
}

const runAll = !flags.only;

${steps.map((step, idx) => `// Phase ${idx + 1}: ${step.toUpperCase()}
if (runAll || flags.${step}) {
  console.log("\\n--- [${idx + 1}/${steps.length}] Running ${step.toUpperCase()} ---");
  // TODO: Implement ${step} logic
  console.log("✅ Completed ${step.toUpperCase()}");
}`).join("\n\n")}
`;

writeFileSync(join(toolsDir, `${skillName}.ts`), scriptContent, "utf-8");
console.log(`✅ Generated tools/${skillName}.ts`);
console.log(`\n🎉 Skill '${skillName}' successfully created!`);
