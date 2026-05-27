# Workflow: Cleaning Up Worktree and Ports

This stage cleans up local and remote resources to keep the development environment clean after shipping a feature.

## Process
1. Release the claimed development server port in `.agent/active_ports.json` matching the worktree task name.
2. Remove the Git worktree.
3. Delete the local feature branch.
4. Delete the remote feature branch on origin.

## Commands
* Release Port:
  1. Read and parse `.agent/active_ports.json`.
  2. Find and delete the entry matching the task.
  3. Write back the updated JSON file.
* Remove Worktree:
  ```bash
  git worktree remove --force <worktree-path>
  ```
* Delete Local Branch:
  ```bash
  git branch -D <branch-name>
  ```
* Delete Remote Branch:
  ```bash
  git push origin --delete <branch-name>
  ```
