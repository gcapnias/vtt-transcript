# CLAUDE.md

## Branch workflow

Work on `develop` in the primary checkout, or on task branches in linked worktrees. Start every new worktree task branch from the current `develop` commit, including work delegated to subagents. Merge completed worktree changes back into `develop`. Publish changes through a pull request from `develop` to `main`.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `gcapnias/yt-transcript`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as GitHub labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Git Commits

Use `/ce-commit` skill to create a git commit with a clear, value-communication message.

### Firecrawl

Read and follow `firecrawl-developer-index` for library or API behavior, configuration, migrations, errors, and bug fixes. Use `firecrawl` for broader web research and when the developer index provides insufficient evidence.

Execute these skills through the installed `firecrawl` CLI. Consult command help for syntax and options while retaining the skills’ search, verification, and source-handling guidance.

## Workspace folders

Create `.firecrawl/`, `.scratch/`, and `archive/` when needed if they do not exist. Create the `.worktrees/` parent directory before adding a linked worktree; let `git worktree add` create the checkout directory. For research, create `archive/research/` and its `README.md` index if absent.

### `.firecrawl/`

Gitignored temporary storage for Firecrawl output (fetched pages, extracted content). Contents may persist across sessions and can be reused, but may be deleted during cleanup. Store durable research artifacts in `archive/research/`.

### `.scratch/`

Gitignored temporary storage for ad-hoc operations (downloads, intermediate payloads, one-off notes). Contents may persist across sessions. Safe to write to freely; safe to delete completed-task contents. Preserve files used by active work. Store durable artifacts in `archive/`.

### `archive/`

Long-term storage for artifacts that are no longer actively used but need to be preserved. Notes and research materials can be placed here for future reference. Unlike `.scratch/` and `.firecrawl/`, files in `archive/` are committed and expected to remain intact over time. Every research artifact goes in `archive/research/`. Commit it on `develop` when working in the primary checkout, or on the task branch when working in a linked worktree. Include worktree research artifacts and their index entries when merging the task branch into `develop`, so they are available to anyone cloning `develop`. When you add an artifact, add a line for it to `archive/research/README.md`, the index of all research.
