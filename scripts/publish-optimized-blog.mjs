// Entry point for future scheduled publishing. Existing per-day SQL guards stay intact.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { checkBlogCover } from './check-blog-cover.mjs';
const dir = path.resolve(process.argv[2] ?? '');
assert(process.argv[2], 'Provide the current reviewed daily folder');
await checkBlogCover(path.join(dir, 'post.json'), path.join(dir, 'images/image-optimization.json'), path.join(dir, 'images/metadata.optimized.json'));
const post = JSON.parse(await fs.readFile(path.join(dir, 'post.json'), 'utf8'));
const sql = await fs.readFile(path.join(dir, 'publish.sql'), 'utf8');
const encoded = [...sql.matchAll(/decode\('([A-Za-z0-9+/=]+)'\s*,\s*'base64'\)/g)];
assert.equal(encoded.length, 1, 'Expected exactly one reviewed publication payload');
assert.deepEqual(JSON.parse(Buffer.from(encoded[0][1], 'base64').toString('utf8')), post.published, 'SQL payload must match the optimized post');
assert.deepEqual(post.draft, post.published, 'Keep the editable draft and publication identical');
// The daily publisher still validates editorial hashes, date, deduplication,
// immediate database recheck and atomic insertion. This wrapper adds image gates.
await import(pathToFileURL(path.join(dir, 'publish-cli.mjs')).href);
