import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const { FEAST_MONTHS, parseFeastDay, feastDayHref, feastDaysInMonth, getFeastMonth } = loadTs('lib/feast-days.ts');
const { saintShortSummary } = loadTs('lib/saint-seo.ts');
const { getAllSaints } = loadTs('lib/saints.ts');
const saints = await getAllSaints();
// loadTs runs modules in a vm realm; copy values out so deepStrictEqual compares plain data.
const plain = value => JSON.parse(JSON.stringify(value));

test('feast days parse only real calendar dates', () => {
  assert.equal(parseFeastDay('November 24').month.slug, 'november');
  assert.equal(parseFeastDay('November 24').day, 24);
  assert.equal(parseFeastDay('February 29').day, 29);
  for (const value of ['February 30', 'April 31', 'November 0', 'Nov 24', 'November', 'Sunday after Pentecost', '', null, undefined]) {
    assert.equal(parseFeastDay(value), null, String(value));
  }
  assert.equal(feastDayHref('December 12'), '/feast-days/december#december-12');
  assert.equal(feastDayHref('Movable'), null);
  assert.equal(getFeastMonth('june').name, 'June');
  assert.equal(getFeastMonth('juneteenth'), null);
});

test('every published feast day appears on exactly one month page', () => {
  const withFeast = saints.filter(saint => saint.feast_day);
  const unparsed = plain(withFeast.filter(saint => !parseFeastDay(saint.feast_day)).map(saint => `${saint.slug}: ${saint.feast_day}`));
  assert.deepEqual(unparsed, [], 'A feast day the calendar cannot place would be missing from the month pages');
  const listed = FEAST_MONTHS.flatMap(month => feastDaysInMonth(saints, month).flatMap(day => day.saints.map(saint => saint.slug)));
  assert.equal(listed.length, withFeast.length);
  assert.equal(new Set(listed).size, listed.length);
});

test('month groups are ordered by day, then name', () => {
  const groups = feastDaysInMonth([
    { name: 'Zita', feast_day: 'April 27' }, { name: 'Anselm', feast_day: 'April 21' },
    { name: 'Adalbert', feast_day: 'April 23' }, { name: 'George', feast_day: 'April 23' },
    { name: 'Other month', feast_day: 'May 1' },
  ], getFeastMonth('april'));
  assert.deepEqual(plain(groups.map(group => [group.label, group.anchor, group.saints.map(saint => saint.name)])), [
    ['April 21', 'april-21', ['Anselm']],
    ['April 23', 'april-23', ['Adalbert', 'George']],
    ['April 27', 'april-27', ['Zita']],
  ]);
});

test('short summaries are reviewed text, bounded, and never cut after an abbreviation', () => {
  for (const saint of saints) {
    const summary = saintShortSummary(saint);
    assert.ok(summary.length > 0, saint.slug);
    assert.ok(summary.length <= 220, saint.slug);
    assert.ok(saint.description.replace(/\s+/g, ' ').startsWith(summary.replace(/…$/, '')), `${saint.slug}: summary must come from the reviewed description`);
    assert.doesNotMatch(summary, /(?:^|\s)(?:St|Sts|Bl|Fr|c)\.$/, saint.slug);
  }
  const long = `He was born c. 1181 in Assisi and later St. Clare joined him. ${'More detail follows here. '.repeat(20)}`;
  assert.equal(saintShortSummary({ description: long }).startsWith('He was born c. 1181 in Assisi and later St. Clare joined him.'), true);
});
