// Local-only preparation by default. --snapshot is explicit read-only database access.
import path from 'node:path';
import { prepare } from './daily-blog-pipeline.mjs';
const [directory,mode]=process.argv.slice(2);
if (!directory || (mode && mode !== '--snapshot') || process.argv.length>4) throw new Error('Usage: node scripts/prepare-daily-blog.mjs DAY_DIRECTORY [--snapshot]');
const dir=path.resolve(directory);
if (mode) { const {snapshot}=await import('./daily-blog-runtime.mjs'); await snapshot(dir); console.log('Read-only catalog snapshot saved; no publication.'); }
else { const post=await prepare(dir); console.log(`Prepared ${post.id}. Independent editorial review is required; nothing published.`); }
