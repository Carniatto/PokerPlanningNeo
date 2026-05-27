# Workflow: Merging and Pushing to Main

This stage merges the feature branch into the `main` branch of the root repository and pushes the changes to the remote origin.

## Process
1. Check if the root repository has uncommitted changes. If yes, stash them to keep the branch checkout clean.
2. Check out the `main` branch at the repository root.
3. Pull the latest commits from the remote `main` branch.
4. Merge the feature branch into `main`.
5. Push `main` to `origin/main`.
6. Restore any stashed changes in the root repository.

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
