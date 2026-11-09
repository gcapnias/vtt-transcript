# Release notes from conventional commits since the previous tag, in GitHub Actions (follow-up to gcapnias/yt-transcript#22)

Research date: 2026-11-09. Follows `bun-compile-ci-semver-release-pipelines.md`. Labels: **[V]** = verified by reading the file or doc named; **[I]** = my inference, no source states it. Scratch copies are in `.scratch/cl/` and `.firecrawl/` (gitignored).

## Executive summary

- **Recommendation: git-cliff, through `orhun/git-cliff-action@v4`, with a small `cliff.toml`.** It is the only tool in the candidate list that works from commit messages alone, needs no PR labels, needs no changelog file, and has real release workflows doing exactly "notes for the new tag go into the release body" (csview, kubenurse, git-cliff's own `cd.yml`). **[V]**
- **None of the 27 Bun-compile workflows uses git-cliff, release-changelog-builder or conventional-changelog.** 14 of the 27 use GitHub's auto notes (`generate_release_notes: true` or `--generate-notes`), 2 take notes from a `CHANGELOG.md` section (Archon, gbrain), 1 from `apps/cli/CHANGELOG.md` (relic), 3 delegate to release-please, 1 to semantic-release (keyshade). So there is no Bun-specific precedent to copy; the evidence comes from wider repos. **[V]** (grep of `.scratch/wf/*.yml`).
- **`--generate-notes` is ruled out for this repo** by the constraint already decided (the only PRs are develop to main, so it would list one line per release). Sampled repos that use it are listed below, for the record. **[V]** for who uses it; the one-line-per-release outcome is **[I]** from GitHub's PR-based behaviour, not tested.
- **`fetch-depth: 0` is required** by git-cliff-action's README. **[V]**
- **No tool forces a changelog file.** git-cliff-action writes its output to a file (default `git-cliff/CHANGELOG.md`, or `OUTPUT`), but that file is a temp artefact in the workspace; it is also exposed as the `content` output, which you pass to the release body. Nothing is committed unless you add a commit step. **[V]** (action README and `run.sh`).
- **Windows runner: the action has a Windows code path but no Windows CI of its own**, so "works on `windows-latest`" is **[I]**. The safe, proven shape is to generate the notes in a tiny `ubuntu-latest` job and pass the text to the Windows release job as a job output (csview, git-cliff `cd.yml`, kubenurse all run it on Ubuntu). **[V]** for those three.
- **Not verified end to end locally.** I ran git-cliff 2.14.2 once with the config below against a scratch clone of this repo after a simulated develop-to-main merge. It printed one warning ("1 commit(s) were skipped due to parse error(s)", the `Merge pull request #99 ...` commit) and produced an empty body, which is the correct answer for that range: the only non-merge commits since `v0.3.0` are `docs:` and `chore:`. A second run to inspect `-vv` output and a feat/fix range was blocked by the permission classifier, so grouping of `feat`/`fix` is **not exercised locally**. Run the config once on a range with feats before trusting it.

## Evidence: who does what

| Tool | Where it appears | Notes |
|---|---|---|
| `--generate-notes` / `generate_release_notes: true` | 14 of the 27 Bun-compile workflows: hntui, Archon (fallback only), brenner_bot, crm.cli, genmedia-cli, matter-cli, capa, linear-release, playground-cli, mcp-cli, slackcli, grok-cli, tinbase, n8n-cli **[V]** | GitHub-side, PR-based. Ruled out here. |
| `CHANGELOG.md` section extracted into the body | Archon ([release.yml](https://github.com/coleam00/Archon/blob/eaa5eee9df3edbad866f919e286b2ae6de697099/.github/workflows/release.yml), lines ~370-391 say the file "is the one source of truth"), gbrain ([release.yml](https://github.com/garrytan/gbrain/blob/ebc1ae8424013ffc52190b7ffbb3b1323961ca84/.github/workflows/release.yml) lines 193-210), relic **[V]** | Needs a hand-maintained changelog. Not wanted. |
| release-please / semantic-release / changesets | sessions, mkdnsite, floci-ui; keyshade; playground-cli **[V]** | Own the version bump too; conflicts with the hand-bumped `package.json`. **[I]** |
| **git-cliff-action** | [wfxr/csview](https://github.com/wfxr/csview/blob/d33b91b00440d91613ada5d780fa303965beb5cf/.github/workflows/release.yml) (700 stars); [orhun/git-cliff `cd.yml`](https://github.com/orhun/git-cliff/blob/bae8cfc60ccd3ae6f01c72f0fdad33635c28530c/.github/workflows/cd.yml) (12.5k, the tool's own repo); [postfinance/kubenurse](https://github.com/postfinance/kubenurse/blob/de31d7f3de34f11f97abe7e9f282bbf20a552dea/.github/workflows/release.yml) (500) **[V]** | All three: `fetch-depth: 0`, `config: cliff.toml`, body into the release. A `gh search code` for the action name returned mostly templates and forge workflows; I do not have a reliable count of adopters. |
| `mikepenz/release-changelog-builder-action` | [type-graphql](https://github.com/MichalLytek/type-graphql/blob/e185a067de7cb3108d9e6321994fb997daad05c5/.github/workflows/release.yml) (8.1k), [lindb](https://github.com/lindb/lindb/blob/c63e9d2f28cb4a68857823a4e4acadbd187dcbf0/.github/workflows/release.yml) (3k), [geotiff.js](https://github.com/geotiffjs/geotiff.js/blob/b2a1ad45c51ea9f0e921f59c9bcecd40eedab237/.github/workflows/release.yml) (1k) **[V]** | All three use the default, **PR mode** (none sets `mode`; geotiff.js grants `pull-requests: read`). Commit mode exists (`mode: "COMMIT"`) but its README says "the commit or hybrid modes are not fully supported" and it "looses access to information only available for PRs" ([README](https://github.com/mikepenz/release-changelog-builder-action#readme)). JSON config, node24 action. Not the boring choice for a no-PR repo. |
| `TriPSs/conventional-changelog-action` | [oh-my-posh release.yml](https://github.com/JanDeDobbeleer/oh-my-posh/blob/42d9d0a2883e238fbdf543d6f0930bc9107a13d6/.github/workflows/release.yml) (23.7k) **[V]** | Used with `skip-version-file`, `output-file: "false"`, `skip-commit`, `skip-tag` all `"true"` to switch off its defaults (it bumps the version, writes a file, commits and tags), and it derives the next version from the commits. A poor fit for a hand-bumped version. **[I]** |
| `requarks/changelog-action` | Not found: `gh search code "requarks/changelog-action path:.github/workflows"` returned `[]` **[V]** for the search only | Not investigated further. |
| Hand-rolled `git log` | None of the 27 workflows builds notes from `git log` (the `git log` grep hit is an epoch timestamp in floci-ui). Not searched beyond the 27. | Boring but no grouping or type filtering for free. |

## Candidate 1 (recommended): git-cliff

### How it finds the previous tag

- git-cliff reads tags from git history itself. `--unreleased` "Processes the commits that do not belong to a tag"; `--tag <TAG>` "Sets the tag for the latest version"; `git cliff --unreleased --tag 1.0.0` is the documented way to "generate changelog for unreleased commits" under a tag that does not exist yet ([usage examples](https://git-cliff.org/docs/usage/examples), [args](https://git-cliff.org/docs/usage/args)). **[V]**
- Alternative in the same page: an explicit git range, `git cliff v0.1.0..HEAD`. kubenurse does this, computing `PREV_TAG` with `git tag -l 'v*' | sort -V` and passing `--tag ${{ github.ref_name }} ${{ steps.prev-tag.outputs.range }}` ([workflow](https://github.com/postfinance/kubenurse/blob/de31d7f3de34f11f97abe7e9f282bbf20a552dea/.github/workflows/release.yml)). **[V]**
- Tags are filtered by `tag_pattern` (docs example `"v[0-9].*"`) ([git config](https://git-cliff.org/docs/configuration/git)). **[V]**
- "Previous tag" means a tag **reachable from HEAD**. On `main` after the develop-to-main merge, `v0.3.0` is reachable (it sits on a `main` merge commit), so `--unreleased` stops there. Checked with plain git in the scratch clone: `git describe --tags` printed `v0.3.0-5-g7952e3e` and `git log v0.3.0..HEAD` listed the 4 expected non-merge commits plus the simulated merge. **[V]**
- **`fetch-depth: 0` is needed**: "Check out the entire history via `fetch-depth: 0` before running this action. Otherwise, you might end up getting empty changelogs or `git ref` errors" ([action README](https://github.com/orhun/git-cliff-action#readme)). **[V]**

### Merge commits, noise types, grouping

- `conventional_commits = true` plus `filter_unconventional = true` drops commits that are not conventional ([git config](https://git-cliff.org/docs/configuration/git)). Merge subjects here (`Merge feat/21-greek-romanization: ...`, `Merge pull request #18 ...`) are not `type: description` with a bare type, so they should drop; the scratch run's "1 commit(s) were skipped due to parse error(s)" is consistent with that. **[V]** for the option, **[I]** that this alone catches every merge subject. Belt and braces: an explicit `{ message = "^Merge", skip = true }`, the documented pattern for skipping by regex (`{ message = "^revert", skip = true }`). **[V]**
- `filter_commits = true` removes commits matched by no parser ("commits that are not matched by commit_parsers are filtered out"). Parsers with `skip = true` drop a commit before grouping. **[V]**
- Group ordering uses the `<!-- 0 -->` prefix trick plus `| striptags | trim | upper_first` in the template, copied from [git-cliff's own cliff.toml](https://github.com/orhun/git-cliff/blob/4f65432ba95ad97147da655fac4071b4bbccb1db/cliff.toml). **[V]**
- Which types to skip is a project choice: git-cliff's own config groups docs/test/chore/ci as sections and skips only `chore(deps)`, `chore(release)` and similar. Dropping `chore`/`docs`/`test` entirely is this repo's decision, not a convention. **[V]** for what git-cliff does, **[I]** that it matches your preference.
- `(#21)` stays in the description text. A `commit_preprocessors` replace pattern for `\\(#([0-9]+)\\)` can turn it into a link later ([git config](https://git-cliff.org/docs/configuration/git)). **[V]** (not needed now).

### Windows

- `install.sh` in the action has `Windows) OS=pc-windows-msvc`, `7z x`, and `git-cliff.exe`; `run.sh` appends `.exe` when `RUNNER_OS` is `Windows`. The action is composite and runs `bash` steps ([action.yml](https://github.com/orhun/git-cliff-action/blob/a9a95522b26fe6403f7bb24031f21fb573d0f5ff/action.yml)). **[V]** that the code path exists. The action repo's own CI is `ubuntu-latest` only, so a working `windows-latest` run is **[I]**. git-cliff itself ships a `windows-2025` build ([cd.yml](https://github.com/orhun/git-cliff/blob/bae8cfc60ccd3ae6f01c72f0fdad33635c28530c/.github/workflows/cd.yml)), so the binary is fine on Windows; the unknown is only the action wrapper.
- `git-cliff-2.14.2-x86_64-pc-windows-msvc.zip` ran on Windows 11 locally (the single invocation in the summary). **[V]**

### Minimal config

`cliff.toml` (repo root):

```toml
[changelog]
header = ""
body = """
{% for group, commits in commits | group_by(attribute="group") %}\
### {{ group | striptags | trim | upper_first }}
{% for commit in commits %}\
- {% if commit.scope %}**{{ commit.scope }}:** {% endif %}{{ commit.message | upper_first }}
{% endfor %}
{% endfor %}"""
trim = true

[git]
conventional_commits = true
filter_unconventional = true
filter_commits = true
tag_pattern = "v[0-9].*"
sort_commits = "oldest"
commit_parsers = [
  { message = "^Merge", skip = true },
  { message = "^feat", group = "<!-- 0 -->Features" },
  { message = "^fix", group = "<!-- 1 -->Fixes" },
  { message = "^refactor", group = "<!-- 2 -->Refactoring" },
  { message = "^docs", skip = true },
  { message = "^chore", skip = true },
  { message = "^test", skip = true },
]
```

The template is a trimmed version of git-cliff's own and its `feat`/`fix` output was **not** rendered (see summary). **[I]** for its exact whitespace.

Workflow shape (notes on Ubuntu, release on Windows):

```yaml
on:
  push:
    branches: [main]

jobs:
  notes:
    runs-on: ubuntu-latest
    outputs:
      body: ${{ steps.cliff.outputs.content }}
      version: ${{ steps.ver.outputs.version }}
      exists: ${{ steps.ver.outputs.exists }}
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0          # required: history + tags
      - id: ver
        run: |
          v=$(node -p "require('./package.json').version")
          echo "version=$v" >> "$GITHUB_OUTPUT"
          if git rev-parse -q --verify "refs/tags/v$v" >/dev/null; then echo exists=true >> "$GITHUB_OUTPUT"; else echo exists=false >> "$GITHUB_OUTPUT"; fi
      - id: cliff
        if: steps.ver.outputs.exists == 'false'
        uses: orhun/git-cliff-action@v4
        with:
          config: cliff.toml
          args: --unreleased --tag v${{ steps.ver.outputs.version }} --strip header
  release:
    needs: notes
    if: needs.notes.outputs.exists == 'false'
    runs-on: windows-latest
    permissions:
      contents: write
    steps:
      # ... build the .exe ...
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ needs.notes.outputs.version }}
          target_commitish: ${{ github.sha }}
          body: ${{ needs.notes.outputs.body }}
          files: dist/yt-transcript.exe
```

Provenance: copied is the `fetch-depth: 0` + `config` + `args: ... --strip header` + `outputs.content` to release-body chain (git-cliff-action README "Advanced" example; csview; git-cliff `cd.yml`, which hands `steps.git-cliff.outputs.content` to a later job as `release_body`). Mine **[I]**: the `exists` check, `--unreleased --tag` on a push to `main`, the `softprops/action-gh-release` body wiring, and `target_commitish`. Nobody in the samples runs this exact combination. Check once: `v0.3.0` must be reachable from `main` at the pushed commit (it is, per the local check), and an empty notes body (only docs/chore since the last tag) should fall back to a fixed line.

## Candidate 2: mikepenz/release-changelog-builder-action in `mode: "COMMIT"`

- Node 24 action, needs a JSON configuration and a `GITHUB_TOKEN`; it calls the GitHub API to list commits between two tags (`offlineMode` exists but is marked EXPERIMENTAL). Conventional types can be pulled out of titles with `label_extractor`; `exclude_merge_branches` exists; categories map to sections. All from the [README](https://github.com/mikepenz/release-changelog-builder-action#readme). **[V]**
- The three real workflows found use PR mode, not commit mode, and the README says commit and hybrid modes "are not fully supported". Hence second place. **[V]**

## Recommendation

Use git-cliff via `orhun/git-cliff-action@v4`, config in `cliff.toml`, notes produced on `ubuntu-latest` and handed to the Windows release job as the release body. Reasons: commit-message driven, no PR or label dependence, no changelog file, a documented "unreleased under a not-yet-existing tag" mode, and the pattern appears in the tool's own release pipeline plus two other maintained repos. Fallback if the action wrapper misbehaves: install the binary yourself (the action README documents `taiki-e/install-action@git-cliff`) and call `git-cliff --unreleased --tag vX.Y.Z --strip header`. **[V]** for the install route being documented.

Sources:
- [git-cliff-action README](https://github.com/orhun/git-cliff-action#readme)
- [git-cliff-action action.yml (pinned)](https://github.com/orhun/git-cliff-action/blob/a9a95522b26fe6403f7bb24031f21fb573d0f5ff/action.yml)
- [git-cliff-action install.sh and run.sh (pinned tree)](https://github.com/orhun/git-cliff-action/tree/a9a95522b26fe6403f7bb24031f21fb573d0f5ff)
- [git-cliff docs: git configuration](https://git-cliff.org/docs/configuration/git)
- [git-cliff docs: usage examples](https://git-cliff.org/docs/usage/examples)
- [git-cliff docs: command-line arguments](https://git-cliff.org/docs/usage/args)
- [git-cliff cliff.toml (pinned)](https://github.com/orhun/git-cliff/blob/4f65432ba95ad97147da655fac4071b4bbccb1db/cliff.toml)
- [wfxr/csview release.yml](https://github.com/wfxr/csview/blob/d33b91b00440d91613ada5d780fa303965beb5cf/.github/workflows/release.yml)
- [orhun/git-cliff cd.yml](https://github.com/orhun/git-cliff/blob/bae8cfc60ccd3ae6f01c72f0fdad33635c28530c/.github/workflows/cd.yml)
- [postfinance/kubenurse release.yml](https://github.com/postfinance/kubenurse/blob/de31d7f3de34f11f97abe7e9f282bbf20a552dea/.github/workflows/release.yml)
- [mikepenz/release-changelog-builder-action README](https://github.com/mikepenz/release-changelog-builder-action#readme)
- [type-graphql release.yml](https://github.com/MichalLytek/type-graphql/blob/e185a067de7cb3108d9e6321994fb997daad05c5/.github/workflows/release.yml), [lindb release.yml](https://github.com/lindb/lindb/blob/c63e9d2f28cb4a68857823a4e4acadbd187dcbf0/.github/workflows/release.yml), [geotiff.js release.yml](https://github.com/geotiffjs/geotiff.js/blob/b2a1ad45c51ea9f0e921f59c9bcecd40eedab237/.github/workflows/release.yml)
- [oh-my-posh release.yml (TriPSs/conventional-changelog-action)](https://github.com/JanDeDobbeleer/oh-my-posh/blob/42d9d0a2883e238fbdf543d6f0930bc9107a13d6/.github/workflows/release.yml)
- [Archon release.yml](https://github.com/coleam00/Archon/blob/eaa5eee9df3edbad866f919e286b2ae6de697099/.github/workflows/release.yml), [gbrain release.yml](https://github.com/garrytan/gbrain/blob/ebc1ae8424013ffc52190b7ffbb3b1323961ca84/.github/workflows/release.yml)
