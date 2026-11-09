import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { main } from '../src/cli.js';

// The source of truth the spec names: `package.json`'s version, read from disk
// here rather than through the module under test.
const PACKAGE_VERSION = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const VIDEO = 'https://www.youtube.com/watch?v=o3CX_Y59_74';

function capture() {
  const out = [];
  const err = [];
  return { out, err, io: { out: (line) => out.push(line), err: (line) => err.push(line) } };
}

/** Every dependency that would touch yt-dlp, the network or the disk, failing loudly if reached. */
const untouchable = {
  preflight: async () => assert.fail('--version ran the yt-dlp preflight'),
  fetchTranscript: async () => assert.fail('--version fetched'),
  expandPlaylist: async () => assert.fail('--version expanded a playlist'),
  rebuildCatalog: async () => assert.fail('--version rebuilt the catalog'),
  readExistingUrls: async () => assert.fail('--version read the disk'),
  transcribeMeeting: async () => assert.fail('--version transcribed a meeting'),
};

test('--version prints the package.json version and exits 0, without yt-dlp', async () => {
  const { out, err, io } = capture();

  assert.equal(await main(['--version'], io, untouchable), 0);
  assert.deepEqual(out, [PACKAGE_VERSION]);
  assert.deepEqual(err, []);
});

test('--version after a target prints the version instead of fetching', async () => {
  const { out, err, io } = capture();

  assert.equal(await main([VIDEO, '--version'], io, untouchable), 0);
  assert.deepEqual(out, [PACKAGE_VERSION]);
  assert.deepEqual(err, []);
});

test('--version wins over flags and the catalog subcommand alike', async () => {
  for (const argv of [['--lang', 'el', VIDEO, '--version'], ['catalog', '--version']]) {
    const { out, io } = capture();
    assert.equal(await main(argv, io, untouchable), 0, argv.join(' '));
    assert.deepEqual(out, [PACKAGE_VERSION], argv.join(' '));
  }
});

test('the usage text lists --version', async () => {
  const { err, io } = capture();

  await main([], io);
  assert.match(err.join('\n'), /--version/);
});

test('usage errors are unchanged by the new flag', async () => {
  const cases = [
    [[], 'A video URL or id is required.'],
    [['--versions', VIDEO], 'Unknown option: --versions'],
    [['-v', VIDEO], 'Unknown option: -v'],
    [['--lang'], '--lang needs a language code.'],
    [[VIDEO, VIDEO], 'Only one target may be given.'],
  ];
  for (const [argv, message] of cases) {
    const { out, err, io } = capture();
    assert.equal(await main(argv, io, untouchable), 1, argv.join(' '));
    assert.equal(err[0], message, argv.join(' '));
    assert.match(err.join('\n'), /Usage: vtt-transcript/);
    assert.deepEqual(out, []);
  }
});
