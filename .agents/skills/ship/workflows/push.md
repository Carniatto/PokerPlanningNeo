# Workflow: Merging and Pushing to Main

This stage merges the feature branch into the `main` branch of the root repository and pushes the changes to the remote origin.

## Process
1. **Approval Verification**: Verify that the `--approve` flag is present, or check if the terminal is interactive (TTY) to prompt the user. Exit immediately if not approved.
2. Check if the root repository has uncommitted changes. If yes, stash them to keep the branch checkout clean.
3. Check out the `main` branch at the repository root.
4. Pull the latest commits from the remote `main` branch.
5. Merge the feature branch into `main`.
6. Push `main` to `origin/main`.
7. Restore any stashed changes in the root repository.

## Commands
* Checkout main:
  ```bash
  git -C <root> checkout main
  ```
* Pull latest:
  ```bash
  git -C <root> pull origin main
  ```
* Merge branch:
  ```bash
  git -C <root> merge <feature-branch> --no-edit
  ```
* Push remote:
  ```bash
  git -C <root> push origin main
  ```
