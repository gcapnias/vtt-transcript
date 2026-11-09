/**
 * Compiles the standalone executable, stamped with its version (ADR-0012).
 *
 *   npm run build                             <version>-dev+<short sha>, or <version>-dev without git
 *   VTT_TRANSCRIPT_RELEASE=true npm run build  <version>, exactly as package.json has it
 *
 * Only the release workflow sets `VTT_TRANSCRIPT_RELEASE`, so a home-built
 * executable never passes for a released one. It is an environment variable,
 * not a flag, because `npm run build -- --release` loses its `--` when npm is
 * called from PowerShell, and npm then rejects `--release` as its own option.
 *
 * On Windows the file properties carry `X.Y.Z.0` either way: a file version is
 * four numbers and takes no suffix.
 *
 * Runs under Bun, not Node (`bun scripts/build.js`). On Windows `bun` is often
 * an npm `.cmd` shim, which Node cannot spawn without a shell, and a shell
 * would mangle the quotes in `--define`. Under Bun, `process.execPath` is the
 * real executable, so the compiler is spawned with an argument array and no
 * shell, and is certainly the Bun that `.bun-version` was checked against.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import pkg from '../package.json' with { type: 'json' };

const ENTRY = './bin/vtt-transcript.js';
const OUTFILE = 'dist/vtt-transcript';

/** The commit the build came from, or null when git or the repository is missing. */
function shortSha() {
  const result = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) return null;
  return result.stdout.trim() || null;
}

/** `X.Y.Z` with any pre-release or build suffix dropped, then `.0`. */
function windowsFileVersion(version) {
  const core = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!core) throw new Error(`package.json version is not semver: ${version}`);
  return `${core[1]}.${core[2]}.${core[3]}.0`;
}

function build(env) {
  if (typeof Bun === 'undefined') {
    console.error('Run this with Bun: npm run build');
    return 1;
  }

  // Local builds and CI must use the same Bun, and CI reads `.bun-version`.
  const pinned = fs.readFileSync(new URL('../.bun-version', import.meta.url), 'utf8').trim();
  if (Bun.version !== pinned) {
    console.error(`This is Bun ${Bun.version}, but .bun-version pins ${pinned}.`);
    console.error('Install that version, or update .bun-version (and the README) to move the pin.');
    return 1;
  }

  const release = env.VTT_TRANSCRIPT_RELEASE === 'true';
  const sha = release ? null : shortSha();
  const version = release ? pkg.version : `${pkg.version}-dev${sha ? `+${sha}` : ''}`;

  const args = [
    'build',
    '--compile',
    ENTRY,
    '--outfile',
    OUTFILE,
    '--define',
    `__APP_VERSION__=${JSON.stringify(version)}`,
  ];
  // Bun sets a file version only when it builds natively for Windows.
  if (process.platform === 'win32') args.push('--windows-version', windowsFileVersion(version));

  console.log(`vtt-transcript ${version}`);
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

if (import.meta.main) {
  process.exitCode = build(process.env);
}
