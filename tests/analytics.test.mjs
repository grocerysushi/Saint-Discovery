import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';

function load(file, dependencies = {}, globals = {}) {
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { module: loadedModule, exports: loadedModule.exports, URL, Date, Buffer, console,
    process: { env: { NODE_ENV: 'production' } }, require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
      return dependencies[name];
    }, ...globals });
  return loadedModule.exports;
}
const { createQuizTracker } = load('lib/quiz-analytics.ts', { './analytics': { track() {} } });
test('steps, backtracking, effect replays and restarts have consistent attempt counts', () => {
  const events = [];
  const emit = (name, params) => events.push({ name, params });
  const quiz = createQuizTracker(3, emit);
  quiz.view(1); quiz.view(1);
  assert.equal(events.filter(e => e.name === 'quiz_start').length, 0);
  quiz.answer(1); quiz.view(2); quiz.answer(2); quiz.view(3);
  quiz.back(3); quiz.view(2); quiz.answer(2); quiz.view(3); quiz.answer(3);
  assert.equal(quiz.complete('joseph'), true);
  assert.equal(quiz.complete('joseph'), false);
  quiz.answer(3); quiz.view(3);
  assert.equal(events.filter(e => e.name === 'quiz_start').length, 1);
  assert.equal(events.filter(e => e.name === 'quiz_complete').length, 1);
  assert.equal(events.filter(e => e.name === 'quiz_step_view').length, 3);
  assert.equal(events.filter(e => e.name === 'quiz_step_complete').length, 3);
  assert.equal(events.filter(e => e.name === 'quiz_step_back').length, 1);
  const restart = createQuizTracker(3, emit);
  restart.view(1); restart.answer(1);
  assert.equal(events.filter(e => e.name === 'quiz_start').length, 2);
  assert.doesNotMatch(JSON.stringify(events), /gender|scores|answer_id|email/);
});

function browserWindow(hostname = 'www.saintdiscoveryquiz.com', storage = new Map()) {
  return { location: { hostname, href: `https://${hostname}/subscribed?status=ok&token=private` },
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) } };
}
test('bootstrap queues early events after config, strips tokens, keeps campaign attribution', () => {
  const { ANALYTICS_BOOTSTRAP } = load('lib/analytics-bootstrap.ts');
  const window = browserWindow();
  window.location.href += '&utm_source=newsletter';
  vm.runInNewContext(ANALYTICS_BOOTSTRAP, { window, location: window.location, document: { referrer: 'https://www.saintdiscoveryquiz.com/confirm?token=private' }, URL });
  const { track } = load('lib/analytics.ts', {}, { window });
  assert.equal(track('quiz_complete', { saint_slug: 'joseph' }), true);
  assert.deepEqual(Array.from(window.dataLayer, args => args[0]), ['js', 'config', 'event']);
  assert.equal(window.dataLayer[1][1], 'G-C75CMC27YN');
  assert.doesNotMatch(JSON.stringify(window.dataLayer), /private|token=/);
  assert.match(JSON.stringify(window.dataLayer), /utm_source=newsletter/);
});
test('SSR, localhost, preview, unavailable or failing Google tag never break the app', () => {
  assert.equal(load('lib/analytics.ts').track('test'), false);
  for (const host of ['localhost', '127.0.0.1', 'preview.vercel.app']) {
    const window = browserWindow(host);
    window.gtag = () => { throw new Error('must not send'); };
    assert.equal(load('lib/analytics.ts', {}, { window }).track('test'), false);
  }
  const window = browserWindow();
  const analytics = load('lib/analytics.ts', {}, { window });
  assert.equal(analytics.track('test'), false);
  window.gtag = () => { throw new Error('blocked'); };
  assert.equal(analytics.track('test'), false);
});
test('confirmed subscriptions deduplicate reloads, allow different receipts, and retry unqueued events', () => {
  const window = browserWindow();
  const receipt = crypto.randomUUID();
  const analytics = load('lib/analytics.ts', {}, { window });
  assert.equal(analytics.trackConfirmedSubscription(receipt), false);
  const events = [];
  window.gtag = (...args) => events.push(args);
  assert.equal(analytics.trackConfirmedSubscription(receipt), true);
  assert.equal(analytics.trackConfirmedSubscription(receipt), false);
  const reload = load('lib/analytics.ts', {}, { window });
  assert.equal(reload.trackConfirmedSubscription(receipt), false);
  assert.equal(reload.trackConfirmedSubscription(crypto.randomUUID()), true);
  assert.equal(reload.trackConfirmedSubscription('forged'), false);
  assert.equal(events.length, 2);
  assert.doesNotMatch(JSON.stringify(events), new RegExp(receipt));
});
test('blocked storage still deduplicates React effect replays in memory', () => {
  const window = browserWindow(); let count = 0;
  window.localStorage = { getItem() { throw 0; }, setItem() { throw 0; } };
  window.gtag = () => count++;
  const { trackConfirmedSubscription } = load('lib/analytics.ts', {}, { window });
  const receipt = crypto.randomUUID();
  trackConfirmedSubscription(receipt); trackConfirmedSubscription(receipt);
  assert.equal(count, 1);
});

const receiptDeps = { 'node:crypto': crypto, './config': { EMAIL_TOKEN_SECRET: 'test-only-secret-'.repeat(4) } };
const receipts = load('lib/emails/conversion-receipt.ts', receiptDeps);
test('receipts require authentic signatures, correct purpose and a live expiry', () => {
  const value = receipts.createConversionReceipt();
  assert.match(receipts.verifyConversionReceipt(value), /^[a-f0-9-]{36}$/);
  assert.equal(receipts.verifyConversionReceipt(value + 'x'), null);
  assert.equal(receipts.verifyConversionReceipt('status=ok'), null);
  assert.equal(receipts.verifyConversionReceipt(), null);
  const future = load('lib/emails/conversion-receipt.ts', receiptDeps, { Date: { now: () => Date.now() + 901000 } });
  assert.equal(future.verifyConversionReceipt(value), null);
  const disabled = load('lib/emails/conversion-receipt.ts', { ...receiptDeps, './config': { EMAIL_TOKEN_SECRET: '' } });
  assert.equal(disabled.verifyConversionReceipt(value), null);
  const tokens = load('lib/emails/tokens.ts', receiptDeps);
  assert.equal(receipts.verifyConversionReceipt(tokens.createToken({ email: 'test@example.invalid', slug: 'joseph', purpose: 'confirm', ttlSeconds: 900 })), null);
});

function confirmRoute({ valid = true, data = true, error = null, throws = false, delivered = true, allow = true } = {}) {
  let calls = 0;
  let sends = 0;
  class Response {
    constructor(_body, options) { Object.assign(this, options); this.cookieValues = {}; this.cookies = { set: (name, value, settings) => { this.cookieValues[name] = { value, ...settings }; } }; }
  }
  const route = load('app/api/confirm/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/insforge-admin': { getInsforgeAdmin: () => ({ database: { rpc: async () => { calls++; if (throws) throw Error('offline'); return { data, error }; } } }) },
    '@/lib/saints': { getSaintBySlug: async () => ({ slug: 'joseph' }) },
    '@/lib/emails/tokens': { verifyToken: () => valid ? { email: 'test@example.invalid', slug: 'joseph' } : null, createToken: () => 'test-unsubscribe' },
    '@/lib/emails/render': { buildResultEmail: () => ({}) },
    '@/lib/emails/resend': { sendEmail: async () => { sends++; return { ok: delivered }; } },
    '@/lib/emails/config': { emailLinkOrigin: () => 'https://example.invalid' },
    '@/lib/emails/rateLimit': { circuitAllows: () => true, reserveEmailSend: () => ({ allowed: allow, retryAfter: 60 }) },
    '@/lib/emails/confirmation-flow': { CONFIRM_RETRY_COOKIE: 'sd-email-retry', CONFIRM_RETRY_TTL: 900 },
    '@/lib/data/saint-db-ids.json': {},
    '@/lib/emails/conversion-receipt': receipts,
  }, { console: { warn() {}, info() {} } });
  return { run: () => route.POST({ nextUrl: new URL('https://example.invalid/api/confirm?token=test') }), calls: () => calls, sends: () => sends, GET: route.GET };
}

test('confirmation retries preserve signed recovery without sending on failed saves or cooldowns', async () => {
  for (const options of [{ error: {} }, { throws: true }, { data: null }, { allow: false }]) {
    const route = confirmRoute(options);
    const response = await route.run();
    assert.equal(route.sends(), 0);
    assert.match(response.headers.Location, options.allow === false ? /status=cooldown&retryAfter=60/ : /status=save_failed/);
    assert.equal(response.cookieValues['sd-email-retry'].value, 'test');
    assert.equal(response.cookieValues['sd-email-retry'].httpOnly, true);
    assert.equal(response.cookieValues['sd-email-retry'].path, '/subscribed');
    assert.equal(route.GET, undefined, 'GET cannot confirm or send mail');
  }
  const returning = confirmRoute({ data: false });
  assert.equal((await returning.run()).headers.Location, '/subscribed?status=ok');
  assert.equal(returning.sends(), 1, 'existing subscribers still get their requested result');
});
test('only a newly persisted, verified subscription earns a conversion receipt', async () => {
  for (const options of [{ valid: false }, { data: false }, { error: { code: 'database-failure' } }, { throws: true }, { data: null }]) {
    const route = confirmRoute(options);
    const response = await route.run();
    assert.equal(response.cookieValues[receipts.CONVERSION_COOKIE].maxAge, 0);
    if (options.valid === false) assert.equal(route.calls(), 0);
  }
  for (const delivered of [true, false]) {
    const response = await confirmRoute({ delivered }).run();
    const cookie = response.cookieValues[receipts.CONVERSION_COOKIE];
    assert.ok(receipts.verifyConversionReceipt(cookie.value));
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.path, '/subscribed');
    assert.equal(response.status, 303);
    assert.equal(response.headers.Location, `/subscribed?status=${delivered ? 'ok' : 'pending'}`);
  }
});
test('forged success URLs do not render the lead tracker without a signed server cookie', async () => {
  for (const value of [undefined, 'forged', receipts.createConversionReceipt()]) {
    const page = load('app/subscribed/page.tsx', {
      'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
      'next/link': 'Link', '@/components/EmailFlowCard': 'Card', '@/components/LeadPing': 'LeadPing',
      'next/headers': { cookies: async () => ({ get: () => ({ value }) }) },
      '@/lib/emails/conversion-receipt': receipts,
      '@/lib/emails/confirmation-flow': { CONFIRM_RETRY_COOKIE: 'sd-email-retry' },
      '@/lib/emails/tokens': { verifyToken: () => null },
      '@/components/EmailConfirmationForm': 'EmailConfirmationForm',
    });
    const result = await page.default({ searchParams: Promise.resolve({ status: 'ok' }) });
    assert.equal(JSON.stringify(result).includes('LeadPing'), !!receipts.verifyConversionReceipt(value));
  }
});
