// Credential-free CLI context guard shared by every daily upload/publication entry point.
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('../',import.meta.url));
const CLI = path.join(ROOT,'node_modules/@insforge/cli/dist/index.js');
export function cli(args, cwd = ROOT) {
  const p = spawnSync(process.execPath,[CLI,'--json',...args],{cwd,encoding:'utf8',timeout:120000,maxBuffer:16*1024*1024});
  if (p.error || p.status !== 0) throw new Error('InsForge CLI failed or timed out. Do not infer whether a write committed; reconcile before retrying.');
  return JSON.parse(p.stdout);
}
export function assertProject(context) {
  assert.equal(context.authenticated,true,'InsForge login required');
  assert.equal(context.project?.project_id,'e1018255-7faf-4675-b407-80cd00a62bca','Wrong linked InsForge project');
  assert.equal(context.project.appkey,'f6zwvi29','Wrong backend');
  assert.equal(new URL(context.project.oss_host).origin,'https://f6zwvi29.us-east.insforge.app','Wrong backend host');
}
