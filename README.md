# conveyer

Personal agent config: one `AGENTS.md`, shared skills, and settings overlays, installed the same way on the laptop and the dev host (rock). Also ships the hooks that report session status to catapult. See [`docs/guide.md`](docs/guide.md) and [`docs/plan.md`](docs/plan.md).

```sh
bin/install            # host auto-detected (rock-* → dev, else laptop); --host, --dry-run
bin/doctor             # verify links, settings, hooks, catapult reachability
npm test               # hook + merge tests (node:test)
```

Generated files (`~/.claude/settings.json`, `~/.claude/CLAUDE.md`, `~/.pi/agent/settings.json`, `~/.config/conveyer/env`) are overwritten on install; a hand-edited one is backed up first. Skills and `AGENTS.md` are symlinks into this repo.

Commits are scanned for secrets by `.githooks/pre-commit` (gitleaks); `bin/install` enables it for this clone.

## License

MIT. See [LICENSE](LICENSE).
