---
name: create-skill
description: "Generate a boilerplate template for a new workspace-specific skill following modular router, workflows, and tools design conventions. Triggers on /create-skill."
---

# Skill Creator Skill (/create-skill)

This skill automates the creation of new workspace-specific skills following the established design pattern.

## Routing Instructions

All scaffolding execution is handled by the Bun-based automation script located at [create-skill.ts](file:///Users/mateuscarniatto/dev/PokerPlanningNeo/.agents/skills/create-skill/tools/create-skill.ts).

### Running the Creator
When the user types `/create-skill` or asks to scaffold/create a new skill:
1. Identify the name of the skill, description, and list of steps/phases.
2. Run the automation script:
   ```bash
   bun .agents/skills/create-skill/tools/create-skill.ts <skill-name> "<description>" "<comma-separated-steps>"
   ```

## Detailed Reference
For more details about directory layouts and parameter formatting, refer to the workflow documentation:
* **Workflow Steps**: [create-skill.md](file:///Users/mateuscarniatto/dev/PokerPlanningNeo/.agents/skills/create-skill/workflows/create-skill.md)
