# Workflow: Syncing with Main

This stage ensures the local feature branch is up-to-date with the remote `main` branch before any verification or merging.

## Process
1. Fetch the latest commits from the remote repository.
2. Integrate `origin/main` into the current feature branch. This can be done via merge (default) or rebase.

## Commands
* Fetch remote:
  ```bash
  git fetch origin main
  ```
* Merge (Default):
  ```bash
  git merge origin/main --no-edit
  ```
* Rebase (Alternative):
  ```bash
  git rebase origin/main
  ```

## Conflict Resolution
If conflicts occur, the execution is halted. You must resolve the conflicts manually inside the worktree directory, commit them, and run the ship command again.
