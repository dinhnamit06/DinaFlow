# Project Rules

## Fast Project Scan

- Read `PROJECT_MAP.md` first before scanning the whole project.
- Read `PROGRESS.md` before starting any task.
- Before editing, scan the project structure quickly with `rg --files`.
- Identify the framework, package manager, entry points, config files, and test commands first.
- Ignore heavy or generated folders unless directly relevant: `.git`, `node_modules`, `dist`, `build`, `.next`, `coverage`, `vendor`, `tmp`.
- Do not read huge files fully unless required; inspect only targeted sections.
- Avoid repeated scanning of unchanged files.

## Context Budget Rules

- Prefer file summaries over full file dumps.
- Read only files directly relevant to the current step.
- Do not paste large command outputs into chat; summarize important lines.
- When command output is long, report only errors, warnings, touched files, and final status.
- Keep each step report short and actionable.
- Update `PROJECT_MAP.md` only when architecture, commands, important files, or the last known good state change.
- Use `PROGRESS.md` for step state instead of repeating long history in chat.

## Standard Workflow

- Work in this order: scan -> understand -> plan small step -> edit -> update `PROGRESS.md` -> test -> report -> wait for PASS.
- Prefer targeted fixes over broad refactors.
- Follow existing architecture, naming, style, folder conventions, and helper APIs.
- Change the smallest safe surface area.
- Do not introduce a new library unless necessary and explained.
- Do not touch unrelated files.

## Security Rules

- Do not print, copy, commit, upload, or expose secrets, API keys, tokens, passwords, cookies, private keys, or `.env` values.
- Do not read sensitive files such as `.env`, credential stores, private keys, browser profiles, or system secrets unless the user explicitly asks and the task requires it.
- Do not send project files, logs, secrets, or user data to external services unless the user explicitly approves the destination and purpose.
- Do not run destructive commands, recursive deletes, disk cleanup, credential changes, permission changes, or system-level modifications without explicit user approval.
- Do not install new dependencies, CLIs, browser extensions, MCP servers, or plugins unless necessary, explained, and approved when risk is non-trivial.
- Audit third-party skills, plugins, scripts, and generated install commands before enabling or running them.
- Treat obfuscated code, encoded commands, hidden network calls, lifecycle scripts, and postinstall hooks as suspicious until reviewed.
- Prefer local/offline checks for sensitive data and summarize findings without revealing secret values.
- If a secret is accidentally exposed, stop, report what type of secret was exposed without repeating the value, and recommend rotation.

## Progress Tracking

- Use `PROGRESS.md` as the project status dashboard.
- Update `PROGRESS.md` after each completed step.
- Keep the current step status accurate: TODO, IN_PROGRESS, WAITING_USER_TEST, PASS, or FAIL.
- Record user test instructions, expected result, and user result.
- Add blockers when work cannot continue without user input or an external fix.

## Step-by-step Delivery

- Break work into small, testable functions or steps.
- Complete only one small function or step at a time.
- After each step, explain clearly what changed.
- Give the user simple test instructions for that exact step.
- Wait for the user to confirm the test passed before moving to the next step.
- If the user reports a failure, fix that step first and provide a new test.
- Do not continue to later steps until the current step is confirmed as passed.

## Quality And Error Control

- Reproduce or identify the failure before fixing when possible.
- Check the `Known Issues` section in `PROJECT_MAP.md` before debugging repeated or environment-specific failures.
- After every edit, run the most relevant fast check first.
- Prefer targeted test commands during iteration.
- Run full verification only after the main steps pass.
- Never hide, skip, weaken, or delete failing tests to make the result pass.
- If a test fails, fix the current step before adding new work.

## User Test Gate

- For each step, provide exact user test instructions.
- Include the expected result and what to report if it fails.
- Continue only after the user confirms `PASS`.
- If the user reports `FAIL`, diagnose and fix that step before continuing.

## Step Report Format

- After each step, report briefly:
  - What changed
  - Files touched
  - Test command run
  - Result
  - User test instructions

## Definition Of Done

- A step is done only when:
  - The code change is complete
  - Relevant checks pass or the limitation is clearly reported
  - The user has a clear test path
  - No unrelated files were changed
  - The user confirms `PASS` before the next step begins
