/**
 * The tool's version, as `--version` prints it (ADR-0012).
 *
 * A compiled executable has it stamped in at build time: `scripts/build.js`
 * passes `bun build --define __APP_VERSION__=...`, which is the plain
 * `package.json` version in a release and `<version>-dev+<short sha>` in a
 * local build. Bun replaces the identifier, `typeof` included, so the stamped
 * string is all that survives into the bundle.
 *
 * Run from source (`npx .`) nothing is stamped, and the identifier is never
 * declared: `typeof` is the only way to ask without a ReferenceError. The
 * fallback is a static JSON import, not a disk read at run time, because Bun
 * bundles the import into the executable and no `package.json` ships beside
 * it. Silent on every Node version in `engines`; measured on 22.18 and 24.
 */
import pkg from '../package.json' with { type: 'json' };

/* global __APP_VERSION__ */
export const VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : pkg.version;
