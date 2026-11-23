import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// npm scripts list test files by name, so a new file is easy to forget and then
// never runs in CI. Every *.test.mjs must appear in at least one package script.
test('every test file is run by a package script', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const scripts = Object.values(pkg.scripts).join(' ');
  const files = fs.readdirSync(new URL('.', import.meta.url)).filter(name => name.endsWith('.test.mjs'));
  const missing = files.filter(name => !scripts.includes(`tests/${name}`));
  assert.deepEqual(missing, [], `Add these to "test" (or "test:build" if they need a build): ${missing.join(', ')}`);
});
