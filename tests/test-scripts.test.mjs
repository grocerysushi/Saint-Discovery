import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// scripts/run-tests.mjs runs every unit test automatically but skips build and
// HTTP tests, which need a finished build or a running server. Those must be
// named in a package script (CI runs `test:build`), or they never run.
test('every build and HTTP test file is run by a package script', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const scripts = Object.values(pkg.scripts).join(' ');
  const files = fs.readdirSync(new URL('.', import.meta.url))
    .filter(name => name.endsWith('-build.test.mjs') || name.endsWith('-http.test.mjs'));
  const missing = files.filter(name => !scripts.includes(`tests/${name}`));
  assert.deepEqual(missing, [], `Add these to "test:build" (or another script): ${missing.join(', ')}`);
});
