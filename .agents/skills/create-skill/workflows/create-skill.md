# Workflow: Creating a Workspace Skill

This document details the process of scaffolding a modular Antigravity workspace skill using the `/create-skill` generator.

## Process

1. **Parameters Validation**:
   - Sanitizes the skill name to be a clean, lowercase folder name.
   - Cleans the list of steps to generate alphanumeric flags.
2. **Directory Scaffolding**:
   - Creates the main directory: `.agents/skills/<skill-name>/`
   - Creates workflows folder: `.agents/skills/<skill-name>/workflows/`
   - Creates tools folder: `.agents/skills/<skill-name>/tools/`
3. **Template Rendering**:
   - Writes the slim `SKILL.md` router.
   - Writes boilerplate workflow files for each step.
   - Generates the TypeScript Bun script with CLI arg parsing for each step and `--only` support.

## Scaffolding Directory Structure

The resulting skill follows this convention:
```
.agents/skills/<skill-name>/
├── SKILL.md                 # Slim Router
├── workflows/
│   ├── <step1>.md           # Modular Workflow Documentation
│   └── <step2>.md           
└── tools/
    └── <skill-name>.ts      # Automation Bun Script
```
