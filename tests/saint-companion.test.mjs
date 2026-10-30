import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const { companionDays, companionDocument } = loadTs('lib/saint-companion.ts');

test('companion uses the actual saint and includes three original, ungated reading steps', () => {
  const days = companionDays('St. Thérèse of Lisieux');
  assert.equal(days.length, 3);
  assert.match(days[0].copy, /Thérèse/);
  const html = companionDocument('St. Thérèse of Lisieux', 'therese-of-lisieux');
  assert.match(html, /\/saints\/therese-of-lisieux/);
  for (const n of [1, 2, 3]) assert.match(html, new RegExp(`Day ${n}:`));
  assert.match(html, /not quotations or religious obligations/);
  assert.match(html, /@media print/);
  assert.doesNotMatch(html, /<script|<form|<input/);
});

test('download escapes names and confines hostile slugs to the biography URL path', () => {
  const html = companionDocument('<img src=x onerror=alert(1)> & "Name"', 'saint?email=private#test');
  assert.doesNotMatch(html, /<img|<script/);
  assert.match(html, /&lt;img/);
  assert.match(html, /saint%3Femail%3Dprivate%23test/);
  assert.doesNotMatch(html, /\?email=/);
});
