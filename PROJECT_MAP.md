# Project Map

## Purpose

Project workspace for step-by-step AI-assisted work with explicit user test gates.

## Repository

- Local branch: `master`
- Remote `origin`: `https://github.com/dinhnamit06/DinaFlow.git`

## Tech Stack

- Framework: Not detected yet
- Language: Not detected yet
- Package manager: Not detected yet
- Test command: Not detected yet
- Build command: Not detected yet

## Important Files

- `AGENTS.md`: Project rules for AI agents
- `PROGRESS.md`: Current progress, test gate, and blockers
- `PROJECT_MAP.md`: Compact project summary, decisions, and known issues
- `.rgignore`: Ripgrep ignore rules for faster scans and smaller outputs

## Installed Local Skills

- `skillsentry`: enabled in Codex config
- `context-engineering`: enabled in Codex config
- `security-and-hardening`: installed, registered disabled
- `test-driven-development`: installed, registered disabled
- `code-review-and-quality`: installed, registered disabled
- `incremental-implementation`: installed, registered disabled

## Ignore When Scanning

- `.git`
- `node_modules`
- `dist`
- `build`
- `.next`
- `coverage`
- `vendor`
- `tmp`
- large binary/media/archive files

## Common Commands

- Scan files: `rg --files --hidden`
- Check git status: `git status --short`
- Check git remote: `git remote -v`
- Push current branch: `git push -u origin master`
- Run app: Not detected yet
- Test: Not detected yet
- Build: Not detected yet
- Check Codex config: `python -c "import tomllib, pathlib; tomllib.loads(pathlib.Path(r'C:\\Users\\Admin\\.codex\\config.toml').read_text(encoding='utf-8')); print('TOML_OK')"`

## Architecture Notes

- No application source structure detected yet.
- Current workspace contains project governance files only.

## Decisions

### Accepted

- 2026-06-15: Work must be split into small, testable steps.
- 2026-06-15: Each step must include user test instructions and wait for user `PASS` before continuing.
- 2026-06-15: Use `AGENTS.md` as the project rulebook for AI agents.
- 2026-06-15: Use `PROGRESS.md` as the project progress dashboard.
- 2026-06-15: Use `PROJECT_MAP.md` as compact project memory to reduce repeated scanning and token use.
- 2026-06-15: Use `.rgignore` to keep ripgrep scans focused and lightweight.
- 2026-06-15: Keep decisions and known issues inside `PROJECT_MAP.md` to avoid file sprawl.
- 2026-06-15: Install selected Addy Osmani agent skills only, not the full pack, to avoid context bloat.
- 2026-06-15: Enable `context-engineering` by default for token discipline; keep other Addy skills disabled until needed.

### Pending

- None

### Rejected

- None

## Known Issues

### Active Issues

- None

### Resolved Issues

- 2026-06-15: Python output in PowerShell can fail when printing emoji or Unicode because the terminal may use `cp1252`.
  Fix: set `$env:PYTHONIOENCODING = 'utf-8'` before running Python, or configure the script with `sys.stdout.reconfigure(encoding="utf-8")`.
- 2026-06-15: SkillSentry can false-positive on security documentation that contains examples of secrets, SSRF, or unsafe network calls.
  Fix: inspect flagged lines manually and keep broad third-party skills disabled until explicitly enabled.

### Debug Notes

- Before debugging a repeated issue, check this section first.
- Add only issues that are likely to recur or save meaningful investigation time.

## Last Known Good State

- 2026-06-15: `AGENTS.md` and `PROGRESS.md` created.
- 2026-06-15: `PROJECT_MAP.md` added to reduce repeated context scanning.
- 2026-06-15: `.rgignore` added to speed up ripgrep scans.
- 2026-06-15: Git remote `origin` connected to `dinhnamit06/DinaFlow`.
- 2026-06-15: Decisions and known issues consolidated into `PROJECT_MAP.md`.
- 2026-06-15: Selected Addy Osmani agent skills installed locally and registered disabled in Codex config.
- 2026-06-15: `context-engineering` enabled in Codex config; other selected Addy skills remain disabled.
