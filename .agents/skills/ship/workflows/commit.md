# Workflow: Staging and Committing Changes

This stage handles checking and committing any uncommitted changes in the target git worktree.

## Process
1. Check if the target worktree directory has uncommitted files.
2. If changes exist, stage them.
3. Commit them using Conventional Commits format.

## Commands
* Check status:
  ```bash
  git status --porcelain
  ```
* Stage changes:
  ```bash
  git add .
  ```
* Commit changes:
  ```bash
  git commit -m "<conventional-commit-message>"
  ```

## Automatic Message Formulation
If no commit message is supplied, a Conventional Commit message is formulated from the branch name:
- Branches prefixed with `fix/` default to: `fix: <branch-name-without-prefix>`
- All other branches default to: `feat: <branch-name-without-prefix>`
- Hyphens and underscores are replaced with spaces.
