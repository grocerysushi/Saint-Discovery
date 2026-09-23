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
  vm.runInNewContext(code, { module: loadedModule, exports: loadedModule.exports, URL, Date, Buffer, AbortSignal,
    console: { warn() {}, info() {} }, process: { env: { NODE_ENV: 'production' } },
    require(name) { if (!(name in dependencies)) throw Error(`Unexpected dependency ${name}`); return dependencies[name]; }, ...globals });
  return loadedModule.exports;
}
const validation = load('lib/emails/validation.ts');
const suggestions = load('lib/emails/address-suggestion.ts');

test('address suggestions handle observed typo without guessing custom domains', () => {
  assert.equal(suggestions.suggestEmailAddress(' reader@GMAIL.CON '), 'reader@gmail.com');
  for (const email of ['reader@gmail.com', 'reader@parish.con', 'reader@example.org', 'reader@@gmail.con', '@gmail.con']) {
    assert.equal(suggestions.suggestEmailAddress(email), null);
  }
});

test('recipient cooldown enforces a minute and three sends per hour across normalized addresses', () => {
  let now = 100000;
  const limits = load('lib/emails/rateLimit.ts', { 'node:crypto': crypto }, { Date: { now: () => now } });
  assert.equal(limits.reserveEmailSend('Reader@Example.org').allowed, true);
  assert.equal(limits.reserveEmailSend(' reader@example.org ').allowed, false);
  now += 59000;
  assert.equal(limits.reserveEmailSend('reader@example.org').retryAfter, 1);
  now += 1000;
  assert.equal(limits.reserveEmailSend('reader@example.org').allowed, true);
  now += 60000;
  assert.equal(limits.reserveEmailSend('reader@example.org').allowed, true);
  now += 60000;
  assert.equal(limits.reserveEmailSend('reader@example.org').retryAfter, 3420);
  assert.equal(limits.reserveEmailSend('reader@example.org', 'result').allowed, true);
  now += 3420000;
  assert.equal(limits.reserveEmailSend('reader@example.org').allowed, true);
});

function subscribe({ sendOk = true, allow = true, tokenFails = false } = {}) {
  let sends = 0;
  const route = load('app/api/subscribe/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, ...options }) } },
    '@/lib/saints': { getSaintBySlug: async slug => slug === 'joseph' ? { slug } : null },
    '@/lib/emails/validation': validation,
    '@/lib/emails/tokens': { createToken: () => { if (tokenFails) throw Error('missing secret'); return 'private-token'; } },
    '@/lib/emails/render': { buildConfirmEmail: () => ({ subject: 'Confirm', html: '', text: '' }) },
    '@/lib/emails/resend': { sendEmail: async () => { sends++; return { ok: sendOk, id: 'test-id', code: 'http_503' }; } },
    '@/lib/emails/config': { emailLinkOrigin: () => 'https://example.invalid' },
    '@/lib/emails/rateLimit': { allowByIp: () => true, clientIp: () => 'test', circuitAllows: () => true,
      reserveEmailSend: () => ({ allowed: allow, retryAfter: 45 }) },
  });
  return { sends: () => sends, run: (body = { email: 'reader@example.org', saintSlug: 'joseph' }) => route.POST({
    headers: new Headers({ 'content-type': 'application/json' }), text: async () => typeof body === 'string' ? body : JSON.stringify(body),
  }) };
}

test('subscription success means accepted; provider/config failures are retryable errors', async () => {
  const route = subscribe();
  const response = await route.run();
  assert.equal(response.status, 200); assert.equal(response.body.status, 'accepted'); assert.equal(route.sends(), 1);
  assert.doesNotMatch(JSON.stringify(response.body), /reader@|private-token|test-id/);
  for (const options of [{ sendOk: false }, { tokenFails: true }]) {
    const result = await subscribe(options).run();
    assert.equal(result.status, 503); assert.equal(result.body.ok, false); assert.equal(result.headers['Retry-After'], '60');
  }
});

test('malformed requests, invalid recipients and cooldowns never send', async () => {
  for (const body of ['{broken', 'null', '[]', { email: 'broken', saintSlug: 'joseph' }, { email: 'reader@example.org', saintSlug: 'missing' }]) {
    const route = subscribe();
    assert.equal((await route.run(body)).status, 400); assert.equal(route.sends(), 0);
  }
  const route = subscribe({ allow: false });
  const response = await route.run();
  assert.equal(response.status, 429); assert.equal(response.headers['Retry-After'], '45'); assert.equal(route.sends(), 0);
  const honeypot = subscribe();
  assert.equal((await honeypot.run({ company: 'robot' })).status, 200); assert.equal(honeypot.sends(), 0);
});

test('provider acceptance requires message ID and transport errors have safe diagnostic codes', async () => {
  const config = { RESEND_API_KEY: 'fake-key', RESEND_FROM: 'test@example.invalid' };
  for (const [result, code] of [
    [{ ok: true, json: async () => ({}) }, 'missing_message_id'],
    [{ ok: false, status: 429, json: async () => ({ message: 'private recipient rejected' }) }, 'http_429'],
    [null, 'transport_error'],
  ]) {
    const client = load('lib/emails/resend.ts', { './config': config }, { fetch: async (_url, init) => {
      assert.ok(init.signal); if (!result) throw Error('network'); return result;
    } });
    const response = await client.sendEmail({ to: 'test@example.invalid', subject: 'Test', html: '', text: '' });
    assert.equal(response.ok, false); assert.equal(response.code, code);
  }
});

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}

function captureHarness(responses) {
  let cursor = 0, tree, sends = 0, now = 100000;
  const hooks = [], events = [], pending = [];
  const jsx = (type, props) => ({ type, props });
  const component = load('components/EmailCapture.tsx', {
    react: {
      useState(initial) { const i = cursor++; hooks[i] ??= initial; return [hooks[i], value => { hooks[i] = value; }]; },
      useRef(initial) { const i = cursor++; hooks[i] ??= { current: initial }; return hooks[i]; },
      useEffect() {},
    },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'framer-motion': { motion: { div: 'div', form: 'form' } },
    '@/lib/analytics': { track: (name, params) => events.push({ name, params }) },
    '@/lib/emails/address-suggestion': suggestions,
  }, { Date: { now: () => now }, window: { requestAnimationFrame: fn => fn() },
    fetch: async () => { const response = responses[sends++]; if (response instanceof Error) throw response; return response; } });
  const render = () => { cursor = 0; tree = component.default({ saintSlug: 'joseph', saintName: 'Joseph' }); return tree; };
  const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); render(); };
  render();
  return { render, nodes: () => nodes(tree), events, sends: () => sends, settle,
    advance: () => { now += 60000; },
    enter: email => { nodes(tree).find(n => n.type === 'input' && n.props.name === 'email').props.onChange({ target: { value: email } }); render(); },
    submit: () => { tree.props.onSubmit({ preventDefault() {} }); pending.push(settle()); return pending.at(-1); },
  };
}
const accepted = { ok: true, status: 200, json: async () => ({ ok: true, status: 'accepted', retryAfter: 60 }) };

test('capture supports resend and changing address while excluding PII from events', async () => {
  const ui = captureHarness([accepted, accepted]);
  ui.enter('reader@gmail.con');
  ui.nodes().find(n => n.type === 'button' && n.props.children === 'reader@gmail.com').props.onClick();
  ui.render();
  assert.equal(ui.nodes().find(n => n.props?.name === 'email').props.value, 'reader@gmail.com');
  await ui.submit();
  assert.ok(ui.nodes().some(n => n.type === 'h2' && n.props.children === 'Confirm from your inbox'));
  const resendButton = () => ui.nodes().find(n => n.type === 'button' && String(n.props.children).startsWith('Resend'));
  assert.equal(resendButton().props.disabled, true);
  resendButton().props.onClick(); await ui.settle(); assert.equal(ui.sends(), 1);
  ui.advance(); resendButton().props.onClick(); await ui.settle(); assert.equal(ui.sends(), 2);
  ui.nodes().find(n => n.props?.children === 'Change email address').props.onClick(); ui.render();
  assert.ok(ui.nodes().some(n => n.type === 'input' && n.props.name === 'email'));
  assert.equal(ui.events.filter(e => e.name === 'email_signup').length, 1);
  assert.equal(ui.events.filter(e => e.name === 'email_confirmation_resend').length, 1);
  assert.doesNotMatch(JSON.stringify(ui.events), /reader@|gmail\.com/);
});

test('capture retains form and never claims success after provider, malformed or network failures', async () => {
  for (const response of [
    { ok: false, status: 503, json: async () => ({ ok: false, message: 'Try again', retryAfter: 60 }) },
    { ok: true, status: 200, json: async () => ({}) }, new Error('timeout'),
  ]) {
    const ui = captureHarness([response]); ui.enter('reader@example.org'); await ui.submit();
    assert.ok(ui.nodes().some(n => n.type === 'form'));
    assert.equal(ui.events.filter(e => e.name === 'email_signup').length, 0);
    assert.equal(ui.events.filter(e => e.name === 'email_confirmation_error').length, 1);
  }
});
