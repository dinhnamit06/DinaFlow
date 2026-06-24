# Project Map

## Purpose

Project workspace for step-by-step AI-assisted work with explicit user test gates.

## Repository

- Local branch: `master`
- Remote `origin`: `https://github.com/dinhnamit06/DinaFlow.git`

## Tech Stack

- Framework: Not detected in repository source yet
- Language: Not detected in repository source yet
- Package manager: Not detected yet
- Test command: Not detected yet
- Build command: Not detected yet
- Intended stack from DOCX planning document: Flutter, Node.js/Express, Prisma, Socket.io, MySQL, Python/Pandas/Streamlit
- Current product direction: complete responsive website first; native mobile/Flutter after the web experience is stable

## Important Files

- `AGENTS.md`: Project rules for AI agents
- `PROGRESS.md`: Current progress, test gate, and blockers
- `PROJECT_MAP.md`: Compact project summary, decisions, and known issues
- `.rgignore`: Ripgrep ignore rules for faster scans and smaller outputs
- `Dưới đây là một bản Tài liệu Đặc tả Yêu cầu.docx`: untracked SRS/SDD + product pitch draft for BioSaaS
- `docs/MVP_SCOPE.md`: web-first MVP boundary extracted from the DOCX, including in-scope features, exclusions, data entities, and acceptance criteria

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
- Current workspace contains project governance files plus one untracked DOCX planning document.
- DOCX describes BioSaaS, a bio-driven productivity app with Micro-Tasks, Dopamine Wallet, Bio Logs, Duo-Sync, App Blocker, and Burnout Predictor.
- MVP scope prioritizes a complete responsive website first: dashboard, tasks, timer, rewards, bio logs, and local product rules. Native mobile, Duo-Sync, native App Blocker, offline-first sync, and AI prediction are deferred.

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
- 2026-06-15: Build the complete responsive website first, then move to native mobile/Flutter after the web experience is stable.

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
- 2026-06-15: Governance baseline committed and pushed to `origin/master`.
- 2026-06-15: DOCX structural scan completed: 14 pages, 2,450 words, 171 non-empty paragraphs, 1 table, no images, no comments, no tracked changes; visual render QA unavailable because LibreOffice/soffice is not installed.
- 2026-06-15: MVP scope documented in `docs/MVP_SCOPE.md`.
- 2026-06-15: MVP scope revised to website-first based on user feedback.
