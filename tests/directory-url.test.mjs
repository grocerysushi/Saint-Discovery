import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const {readDirectoryQuery,directoryQuery}=loadTs('lib/directory-url.ts');
test('directory filters round-trip through a shareable URL without losing accented names',()=>{
  const state=readDirectoryQuery('?q=Th%C3%A9r%C3%A8se&gender=Female&country=France&month=October&order=Carmelites');
  assert.equal(state.search,'Thérèse');
  assert.equal(state.gender,'Female');
  assert.deepEqual({...readDirectoryQuery(directoryQuery(state))},{...state});
  assert.equal(directoryQuery(readDirectoryQuery('')),'');
  assert.equal(directoryQuery(readDirectoryQuery('?unrelated=ignored')),'');
});
