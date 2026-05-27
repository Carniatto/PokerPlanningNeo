# Workflow: Verification and Testing

This stage runs unit and E2E verification tests to ensure the codebase remains healthy and all checks pass prior to shipping.

## Process
1. Run the local unit tests via Vitest.
2. Run the local end-to-end (E2E) tests via Playwright.

## Commands
* Run Unit Tests:
  ```bash
  pnpm exec vitest run
  ```
* Run E2E Tests:
  ```bash
  pnpm exec playwright test
  ```

## Safe Execution
If any test suite exits with a non-zero code, the shipping process is immediately aborted to prevent broken code from being pushed to the `main` branch.
