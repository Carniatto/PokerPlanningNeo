# Workflow: Monitoring CI/CD Deployment

This stage watches the remote deployment process on GitHub Actions to ensure the feature goes live successfully.

## Process
1. Query the GitHub API via `gh` CLI to identify the new workflow run triggered by the push to `main`.
2. Watch the progress of this specific run in real-time.

## Commands
* Find Run ID:
  ```bash
  gh run list --branch main --limit 3 --json databaseId,createdAt,url
  ```
* Watch Run:
  ```bash
  gh run watch <run-id> --compact --exit-status
  ```
