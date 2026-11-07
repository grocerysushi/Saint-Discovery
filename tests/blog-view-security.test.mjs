import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrations = fs.readdirSync(path.join(root, 'migrations'))
  .filter(name => name.endsWith('.sql'))
  .sort()
  .map(name => fs.readFileSync(path.join(root, 'migrations', name), 'utf8'))
  .join('\n');

// The public view is granted to anon and runs with owner privileges, so its
// WHERE clause is the only thing between a draft and an anonymous reader.
// These assertions fail if that boundary is narrowed by accident.
test('the public blog view exposes only published, untrashed posts', () => {
  const view = /CREATE VIEW public\.blog_published_posts AS([\s\S]*?);/.exec(migrations);
  assert.ok(view, 'blog_published_posts view not found in migrations');
  const body = view[1];
  assert.match(body, /c\.stage = 'published'/, 'must join the published snapshot');
  assert.match(body, /NOT p\.trashed/, 'must exclude trashed posts');
  assert.match(body, /p\.published_at IS NOT NULL/, 'must require a publication date');
  assert.doesNotMatch(body, /\bd\.stage\b/, 'must never read the draft snapshot');
});

test('drafts stay behind RLS and outside anonymous grants', () => {
  for (const table of ['blog_editors', 'blog_posts', 'blog_post_content']) {
    assert.match(
      migrations,
      new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`),
      `${table} must have RLS enabled`,
    );
  }
  assert.match(migrations, /REVOKE ALL ON public\.blog_posts, public\.blog_post_content FROM anon, authenticated/);
  assert.match(migrations, /GRANT SELECT ON public\.blog_published_posts TO anon, authenticated/);
  assert.doesNotMatch(migrations, /GRANT SELECT ON public\.blog_post_content TO anon/);
  assert.doesNotMatch(migrations, /GRANT SELECT ON public\.blog_posts TO anon/);
});

test('legacy email and quiz tables keep RLS enabled with no policies', () => {
  for (const table of ['email_signups', 'quiz_results']) {
    assert.match(
      migrations,
      new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`),
      `${table} must have RLS enabled`,
    );
    assert.doesNotMatch(
      migrations,
      new RegExp(`CREATE POLICY[^;]*ON public\\.${table}\\b`),
      `${table} must not gain a policy that widens access`,
    );
  }
});
