# conveyer — Plan

> Follows [`guide.md`](./guide.md).

## Goal

One versioned repo holding how *you* want agents to behave, installed identically on your laptop and the dev host, with small per-host differences. It also ships the hook scripts that report session status to catapult.

## Non-goals

- Job-specific prompts for workers. Those live in `catapult/workers/*`.
- Memory. There is a reserved slot (`memory/`) but no design until guide phase 6 (D12).
- Secrets. Never committed. Hosts get them from Doppler or env.

## Layout

```
conveyer/
  AGENTS.md                     # global instructions, shared by both harnesses
  skills/                       # shared skills (SKILL.md format) used by claude and pi
    <skill-name>/SKILL.md
  claude/
    CLAUDE.md                   # imports ../AGENTS.md, plus Claude-specific notes
    settings.base.json          # permissions, sandbox, hooks
    commands/                   # slash commands
  pi/
    settings.base.json
    extensions/
      catapult-status/           # pi extension: POST lifecycle events to ingest
  hooks/
    catapult-event               # single fail-open script used by all hooks
  hosts/
    laptop.json                 # overlay: e.g. sandbox off, different model defaults
    dev.json                 # overlay: sandbox on, CATAPULT_INGEST_URL set
  memory/                       # reserved (mem0 later)
  bin/
    install                     # symlink + merge base+host settings; idempotent
    doctor                      # check that links, hooks and ingest are reachable
```

## Design

### Instructions
- `AGENTS.md` is the single source. `claude/CLAUDE.md` imports it with `@../AGENTS.md` (or it is symlinked), so the two harnesses don't drift.
- Keep it short: coding standards, commit conventions, "show evidence when you claim done", and "never push to main". Project-specific rules stay in each project repo.

### Skills
- Write skills once in the shared `SKILL.md` format under `skills/`. `bin/install` links them into `~/.claude/skills/` and pi's skills directory.
- Start with the skills you already repeat by hand: address PR review comments, write a triage report, refine a ticket. Catapult workers can call these skills, which keeps worker prompts short.

### Settings and overlays
- `bin/install` deep-merges `*.base.json` with `hosts/<host>.json` and writes the result to `~/.claude/settings.json` and pi's settings file. Generated files are not symlinks, so local edits are overwritten on the next install. That is intended.
- Host is detected from `hostname`, or passed with `--host`.

### Hooks (catapult contract)
- One script, `hooks/catapult-event <event-name>`, reads the hook's JSON from stdin and POSTs `{harness, event, session_id, cwd, transcript_path, ts, payload}` to `$CATAPULT_INGEST_URL`.
- **Fail open:** 300 ms timeout, output discarded, always `exit 0`. It must never block or slow a session.
- Unset `CATAPULT_INGEST_URL` (as on the laptop) means the script does nothing.
- Claude Code events to wire up: `SessionStart`, `UserPromptSubmit`, `Notification` (maps to needs input), `Stop`, `SubagentStop`, `SessionEnd`.
- The pi extension `catapult-status` maps pi's lifecycle events to the same payload shape.

### Sandbox defaults
- dev host overlay: Claude Code sandbox **on** for interactive sessions. Jobs launched by catapult override this with sandbox off, because they run under `srt` (guide §5, no stacking).
- laptop overlay: your choice; default off.

## Phases

### A0 — Minimal sync (guide phase 0)
- `AGENTS.md`, `claude/CLAUDE.md`, `bin/install` with symlinks only.
- **Acceptance:** `bin/install` on laptop and dev host gives both harnesses the same global instructions; running it twice changes nothing.

### A1 — Settings overlays and hooks (guide phase 1)
- `settings.base.json`, `hosts/*`, merge logic, `hooks/catapult-event`, pi extension.
- **Acceptance:** with a stub HTTP listener on the dev host, an interactive `claude` session and a `pi` session each produce start, prompt, stop and end events. With the listener down, sessions behave normally and show no delay.

### A2 — Shared skills (guide phase 4)
- Extract 3–5 skills that catapult workers and you both use.
- **Acceptance:** the same skill is invoked successfully from Claude Code and pi.

### A3 — Memory slot (guide phase 6)
- Out of scope until then (D12).

## Risks

- **Harness config formats change.** Mitigation: `bin/doctor` validates the generated settings, and versions are pinned in dev host.
- **Hook latency.** Mitigation: strict timeout, fire-and-forget. Measure in A1.
- **Accidental secret commits.** Mitigation: gitignore, plus a pre-commit secret scanner such as gitleaks.
