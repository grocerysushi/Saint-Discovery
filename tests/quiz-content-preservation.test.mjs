import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const baseline=JSON.parse(fs.readFileSync(new URL('./quiz-content-baseline.json',import.meta.url)));
test('redesign preserves all quiz wording, options, ordering, weights and scoring modules exactly',()=>{
  for(const [file,expected] of Object.entries(baseline.sha256)){
    const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8').replace(/\r\n/g,'\n');
    assert.equal(crypto.createHash('sha256').update(source).digest('hex'),expected,file);
  }
});
