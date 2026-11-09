# Releases come from `main`, and the version from `package.json`

The standalone executable carried no version, and nothing could be downloaded: the annotated tags
`v0.2.0` to `v0.3.0` were made by hand and had no GitHub releases (#22). **`package.json`'s
`version` is the only source of the version, bumped by hand on `develop` before the develop→main
pull request is opened; a push to `main` whose version has no `v<version>` tag yet builds one
Windows executable, tags it, and publishes it as a GitHub release with notes generated from the
conventional commits since the previous tag.** This is the plain pattern of the Bun-compile
projects surveyed in `archive/research/bun-compile-ci-semver-release-pipelines.md`, adapted to
this repo's develop→main flow.

- **Only `main` releases, and only once per version.** A push to `main` whose version is already
  tagged publishes nothing. A pull request into `main` fails its check if the version is already
  tagged, so a forgotten bump is caught before the merge rather than silently not released.
- **Outside a release, the version is marked as development**: `<version>-dev+<short sha>` from a
  local build, so a home-built executable never passes for a released one. `--version` prints
  the full string; the Windows file version, which takes four numbers, is `X.Y.Z.0`.
- **Windows only.** The executable is built natively on a Windows runner, which also allows its
  file version to be set; Bun cannot set it when cross-compiling.
- **Notes come from commits, not pull requests.** Task branches are merged into `develop`
  locally, so the only pull requests are develop→main, and GitHub's pull-request notes would be
  one line per release. git-cliff groups `feat`, `fix` and `refactor` commits and skips merges,
  `docs`, `chore` and `test` (`archive/research/commit-based-release-notes.md`).
- **Develop→main pull requests are merged with a merge commit.** A squash or rebase merge would
  collapse the commits the notes are drawn from into one.
- **Tests run on every pull request into `develop` and `main`**, not when releasing: what reaches
  `main` has already passed.

## Considered options

- **GitVersion, or `git describe`.** Rejected: none of the surveyed Bun-compile projects computes
  its version from history, and here `v0.3.0` sits on `main`'s merge commit, unreachable from
  `develop`, so a history-derived `develop` version would count from `v0.2.2`.
- **A hand-pushed `v*` tag as the trigger.** Rejected, though it is the most common pattern: the
  maintainer wanted merging into `main` to be the one act that publishes, and a bare tag trigger
  fires for a tag on any branch.
- **Automatic bumping (release-please, changesets, semantic-release).** Rejected: more process
  than a single-maintainer tool needs.
- **Compiling the executable in every pull request check.** Rejected for now: the tests are the
  gate, and a broken compile is caught by the release's own smoke test of `--version`.

## Consequences

- Whoever opens the develop→main pull request bumps the version first; `CLAUDE.md`'s branch
  workflow will say so, once #22 is implemented.
- Making the test check required, and allowing only merge commits into `main`, are repository
  settings, not code.
- The first real release can only be tested by a real merge into `main`.
