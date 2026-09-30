import http from 'node:http';
import { once } from 'node:events';

// A local HTTP protocol fixture, not a query-builder mock. Quoted logic values
// follow PostgREST's backslash escaping; LIKE then interprets its own escapes.
// https://postgrest.org/en/v12/references/api/url_grammar.html#reserved-characters
function parseOr(expression) {
  let cursor = 1;
  const conditions = [];
  if (expression[0] !== '(') throw new Error('Expected logic group');
  while (cursor < expression.length) {
    const field = /^(published->>(?:title|excerpt))\.ilike\."/.exec(expression.slice(cursor));
    if (!field) throw new Error('Expected quoted ILIKE filter');
    cursor += field[0].length;
    let value = '';
    while (cursor < expression.length && expression[cursor] !== '"') {
      if (expression[cursor] === '\\') cursor++;
      if (cursor >= expression.length) throw new Error('Unfinished escape');
      value += expression[cursor++];
    }
    if (expression[cursor++] !== '"') throw new Error('Unfinished quoted value');
    conditions.push({ field: field[1].slice(12), pattern: value });
    if (expression[cursor] === ')') {
      if (cursor + 1 !== expression.length) throw new Error('Trailing filter input');
      return conditions;
    }
    if (expression[cursor++] !== ',') throw new Error('Expected filter separator');
  }
  throw new Error('Unfinished logic group');
}

function ilike(value, pattern) {
  const literal = character => character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let expression = '^';
  // PostgREST also accepts * as an alias for SQL's % wildcard.
  pattern = pattern.replaceAll('*', '%');
  for (let i = 0; i < pattern.length; i++) {
    const character = pattern[i];
    if (character === '\\') {
      if (++i === pattern.length) throw new Error('LIKE pattern ends with escape');
      expression += literal(pattern[i]);
    } else expression += character === '%' ? '[\\s\\S]*' : character === '_' ? '[\\s\\S]' : literal(character);
  }
  return new RegExp(`${expression}$`, 'iu').test(value ?? '');
}

export async function startBlogBackend(rows) {
  const state = { failure: null, requests: [], rangeFailures: 0 };
  const backend = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    state.requests.push({ method: req.method, url });
    const fail = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (state.failure) { fail(state.failure.status, state.failure.body); return; }
    if (url.pathname !== '/api/database/records/blog_published_posts') { fail(404, {}); return; }
    try {
      let filtered = [...rows];
      for (const field of ['slug', 'category']) {
        const filter = url.searchParams.get(`published->>${field}`);
        if (filter) {
          if (!filter.startsWith('eq.')) throw new Error('Expected equality filter');
          filtered = filtered.filter(row => row.published[field] === filter.slice(3));
        }
      }
      const or = url.searchParams.get('or');
      if (or) {
        const conditions = parseOr(or);
        filtered = filtered.filter(row => conditions.some(({ field, pattern }) => ilike(row.published[field], pattern)));
      }
      const order = url.searchParams.get('order');
      if (order) filtered.sort((left, right) => {
        for (const term of order.split(',')) {
          const [field, direction] = term.split('.');
          const difference = String(left[field]).localeCompare(String(right[field]));
          if (difference) return direction === 'desc' ? -difference : difference;
        }
        return 0;
      });
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = Number(url.searchParams.get('limit') || 500);
      if (offset > 0 && offset >= filtered.length) {
        state.rangeFailures++;
        res.setHeader('content-range', `*/${filtered.length}`);
        fail(416, { code: 'PGRST103', details: `An offset of ${offset} was requested, but there are only ${filtered.length} rows.`, hint: null, message: 'Requested range not satisfiable' });
        return;
      }
      const select = url.searchParams.get('select') || '*';
      const body = filtered.slice(offset, offset + limit).map(row => select === '*' ? row : Object.fromEntries(select.split(',').map(column => {
        const [alias, expression] = column.split(':');
        return [alias, expression?.startsWith('published->>') ? row.published[expression.slice(12)] : row[alias]];
      })));
      const range = body.length ? `${offset}-${offset + body.length - 1}` : '*';
      res.writeHead(200, { 'content-type': 'application/json', 'content-range': `${range}/${filtered.length}` });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify(body));
    } catch (error) { fail(400, { code: 'PGRST100', message: error.message }); }
  });
  backend.listen(0, '127.0.0.1');
  await once(backend, 'listening');
  return { state, origin: `http://127.0.0.1:${backend.address().port}`, close: async () => {
    backend.closeAllConnections();
    await new Promise(resolve => backend.close(resolve));
  } };
}
