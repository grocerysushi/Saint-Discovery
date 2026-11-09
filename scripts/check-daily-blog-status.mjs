// Read-only recovery, including yesterday's unknown outcomes. Never removes locks or publishes.
import path from 'node:path';
import assert from 'node:assert/strict';
import {readJSON,dailyId,makePost} from './daily-blog-pipeline.mjs';
import {assertProject,cli,database,reconcileSQL,reconciled} from './daily-blog-runtime.mjs';
assert(process.argv.length===3,'Usage: node scripts/check-daily-blog-status.mjs DAY_DIRECTORY');
const dir=path.resolve(process.argv[2]);
const plan=await readJSON(path.join(dir,'plan.json'));
const post=await readJSON(path.join(dir,'post.json'));
assert.equal(post.id,dailyId(plan.date)); assert.deepEqual(post,makePost(plan,post.published));
assertProject(cli(['current']));
console.log(JSON.stringify({id:post.id,status:reconciled(database(reconcileSQL(post)),plan)?'published-matching':'not-found'},null,2));
