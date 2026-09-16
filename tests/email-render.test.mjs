import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const { buildResultEmail, buildConfirmEmail } = loadTs('lib/emails/render.ts');
const params = {
  saintUrl: 'https://example.org/saints/michael-mcgivney',
  unsubscribeUrl: 'https://example.org/unsubscribe?token=test',
  siteUrl: 'https://example.org',
  postalAddress: 'Test address',
};

test('reviewed Blessed email retains its title and omits absent devotional fields', () => {
  const result = buildResultEmail({ ...params, saint: {
    name: 'Michael McGivney', slug: 'michael-mcgivney', kind: 'blessed',
    description: 'A parish priest.', tagline: '', prayer: null, feast_day: 'August 13',
  } });
  for (const output of [result.html, result.text, result.subject]) {
    assert.match(output, /Blessed Michael McGivney/);
    assert.doesNotMatch(output, /St\. (?:Blessed )?Michael|\{\{|\[\[/);
  }
  assert.doesNotMatch(result.html, /&ldquo;&rdquo;|The Prayer|words below/);
  assert.doesNotMatch(result.text, /""|The Prayer|words below/);
  assert.match(result.html, /August 13/);
  assert.ok(result.html.includes(params.unsubscribeUrl));
});

test('available tagline and prayer survive rendering with HTML escaping', () => {
  const result = buildResultEmail({ ...params, saint: {
    name: 'Joseph', slug: 'joseph', kind: 'saint', description: '<script>test</script>',
    tagline: 'Care & service', prayer: 'Pray for us.', feast_day: null,
  } });
  assert.match(result.html, /St\. Joseph/);
  assert.match(result.html, /Care &amp; service/);
  assert.match(result.html, /&lt;script&gt;test&lt;\/script&gt;/);
  assert.match(result.text, /"Care & service"/);
  assert.match(result.text, /Pray for us\./);
  assert.doesNotMatch(result.html, /Feast Day|St\. St\./);
});

test('confirmation still carries its actionable subscription link', () => {
  const confirmUrl = 'https://example.org/confirm?token=test';
  const result = buildConfirmEmail({ confirmUrl, siteUrl: params.siteUrl });
  assert.ok(result.html.includes(confirmUrl));
  assert.ok(result.text.includes(confirmUrl));
  assert.doesNotMatch(result.html, /\{\{|\[\[/);
});
