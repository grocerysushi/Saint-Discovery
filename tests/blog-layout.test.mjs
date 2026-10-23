import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const { articleLayout } = loadTs('lib/blog-layout.ts');
const paragraph = (words = 80) => ({ type: 'paragraph', content: [{ type: 'text', text: 'word '.repeat(words) }] });
const heading = level => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text: 'Section' }] });

test('move only the first real introductory paragraph, preserving the original nodes', () => {
  const nodes = [paragraph(), heading(2), paragraph(), paragraph(), heading(2), paragraph(), paragraph()];
  const original = JSON.stringify(nodes);
  const layout = articleLayout(nodes);
  assert.equal(layout.leadIndex, 0);
  assert.equal(layout.adAfterIndex, 3);
  assert.equal(JSON.stringify(nodes), original);
  const renderedIndices = [layout.leadIndex, ...nodes.map((_, i) => i).filter(i => i !== layout.leadIndex)];
  assert.equal(new Set(renderedIndices).size, nodes.length);
  for (const start of [heading(2), { type: 'image' }, { type: 'paragraph', content: [] }]) {
    assert.equal(articleLayout([start, paragraph()]).leadIndex, -1);
  }
});

test('short articles and non-paragraph boundaries do not get an in-article ad', () => {
  assert.equal(articleLayout([paragraph(), paragraph()]).adAfterIndex, -1);
  assert.equal(articleLayout(Array.from({ length: 5 }, () => paragraph(10))).adAfterIndex, -1);
  const list = { type: 'bulletList', content: [] };
  assert.equal(articleLayout([paragraph(), heading(2), paragraph(), list, heading(2), paragraph(), paragraph(), paragraph()]).adAfterIndex, -1);
});

test('unsectioned articles use a paragraph break; subheadings do not split a section', () => {
  assert.equal(articleLayout(Array.from({ length: 5 }, () => paragraph())).adAfterIndex, 2);
  const nodes = [paragraph(), heading(2), paragraph(), heading(3), paragraph(), heading(2), paragraph(), paragraph()];
  assert.equal(articleLayout(nodes).adAfterIndex, 4);
});
