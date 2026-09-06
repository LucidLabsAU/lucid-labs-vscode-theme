'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { bump, localDate } = require('../bump-versions');

test('bump raises the patch by default', () => {
  assert.strictEqual(bump('1.9.3', 'patch'), '1.9.4');
});

test('bump raises the minor and zeroes the patch', () => {
  assert.strictEqual(bump('1.9.3', 'minor'), '1.10.0');
});

test('bump raises the major and zeroes the rest', () => {
  assert.strictEqual(bump('1.9.3', 'major'), '2.0.0');
});

test('bump rejects an unparseable version', () => {
  assert.throws(() => bump('1.x.3', 'patch'), /Unparseable version/);
});

test('localDate formats as YYYY-MM-DD', () => {
  assert.match(localDate(), /^\d{4}-\d{2}-\d{2}$/);
});

test('localDate pads single-digit months and days', () => {
  assert.strictEqual(localDate(new Date(2026, 0, 5, 12, 0, 0)), '2026-01-05');
});

test('localDate keeps the local day when UTC has already rolled back', () => {
  // 09:29 on the 7th in Brisbane is still the 6th in UTC.
  const brisbaneMorning = new Date(2026, 8, 7, 9, 29, 0);
  assert.strictEqual(localDate(brisbaneMorning), '2026-09-07');
});
