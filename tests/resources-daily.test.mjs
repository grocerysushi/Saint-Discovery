import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { loadTs } from './load-ts.mjs';

const require = createRequire(import.meta.url);
const calendarSource = fs.readFileSync(new URL('../lib/calendar-date.ts', import.meta.url), 'utf8');
const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
}).outputText;

function renderDaily(saints, date) {
  const compiledModule = { exports: {} };
  vm.runInNewContext(compile(fs.readFileSync(new URL('../components/DirectoryDailySaints.tsx', import.meta.url), 'utf8')), {
    module: compiledModule, exports: compiledModule.exports, Date,
    require: specifier => {
      if (specifier === 'react' && date !== undefined) return { ...React, useSyncExternalStore: () => date };
      if (specifier.startsWith('@/')) return loadTs(`${specifier.slice(2)}.ts`);
      return require(specifier);
    },
  });
  return renderToStaticMarkup(React.createElement(compiledModule.exports.default, { saints }));
}

test('cached daily section has discoverable SSR navigation without a server-derived today', () => {
  const html = renderDaily([{ id: '1', slug: 'server-saint', name: 'Server Saint', feast_day: 'September 30' }]);
  assert.match(html, /Saint of the day/);
  assert.match(html, /href="\/saint-of-day"/);
  assert.doesNotMatch(html, /September 30|Server Saint/);
});

test('directory and daily reflection use the same local feast date across UTC midnight', async () => {
  const { getAllSaints } = loadTs('lib/saints.ts');
  const { getDailyExperience } = loadTs('lib/daily-experience.ts');
  const script = `const module = { exports: {} }; const exports = module.exports; ${compile(calendarSource)}; console.log(module.exports.localDateKey(new Date('2026-09-30T03:09:00Z')));`;
  const date = execFileSync(process.execPath, ['-e', script], { env: { ...process.env, TZ: 'America/Chicago' }, encoding: 'utf8' }).trim();
  assert.equal(date, '09-29');
  const saints = await getAllSaints();
  const daily = await getDailyExperience(date);
  const html = renderDaily(saints, date);
  assert.match(html, /September 29/);
  for (const saint of [daily.featured, ...daily.alsoToday]) assert.ok(html.includes(`/saints/${saint.slug}`), saint.slug);
  assert.doesNotMatch(html, /September 30|\/saints\/jerome"/);
  const tomorrow = renderDaily(saints, '09-30');
  assert.match(tomorrow, /September 30/);
  assert.match(tomorrow, /\/saints\/jerome"/);
  assert.doesNotMatch(tomorrow, /\/saints\/gabriel"/);
});

test('uncovered local dates keep the reflection link and explain the directory gap', () => {
  const html = renderDaily([], '02-29');
  assert.match(html, /February 29/);
  assert.match(html, /does not yet include an entry/);
  assert.match(html, /href="\/saint-of-day"/);
});

test('local calendar refreshes at midnight, catches up on visibility, and cleans up', () => {
  let now = new Date(2026, 8, 29, 23, 59, 50).getTime();
  class TestDate extends Date { constructor(...args) { super(...(args.length ? args : [now])); } }
  const timers = new Map();
  const listeners = new Map();
  let nextId = 0;
  let changes = 0;
  const document = {
    visibilityState: 'visible',
    addEventListener: (event, fn) => listeners.set(event, fn),
    removeEventListener: (event, fn) => { assert.equal(listeners.get(event), fn); listeners.delete(event); },
  };
  const compiledModule = { exports: {} };
  vm.runInNewContext(compile(calendarSource), {
    module: compiledModule, exports: compiledModule.exports, Date: TestDate, document,
    setTimeout: (fn, delay) => { timers.set(++nextId, { fn, delay }); return nextId; },
    clearTimeout: id => timers.delete(id),
  });
  const stop = compiledModule.exports.subscribeToLocalDate(() => changes++);
  assert.equal(compiledModule.exports.localDateKey(), '09-29');
  assert.equal(timers.size, 1);
  const [timerId, midnight] = [...timers.entries()][0];
  assert.equal(midnight.delay, 11_000);
  now += midnight.delay;
  timers.delete(timerId);
  midnight.fn();
  assert.equal(changes, 1);
  assert.equal(compiledModule.exports.localDateKey(), '09-30');
  assert.equal(timers.size, 1);
  document.visibilityState = 'hidden';
  listeners.get('visibilitychange')();
  assert.equal(changes, 1);
  now = new Date(2026, 9, 2, 12).getTime();
  document.visibilityState = 'visible';
  listeners.get('visibilitychange')();
  assert.equal(changes, 2);
  assert.equal(compiledModule.exports.localDateKey(), '10-02');
  assert.equal(timers.size, 1, 'reschedule instead of accumulating timers after visibility changes');
  stop();
  assert.equal(timers.size, 0);
  assert.equal(listeners.size, 0);
});
