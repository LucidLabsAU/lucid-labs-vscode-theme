'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { parseJsonc, stripJsonc } = require('../lib/jsonc');

test('parses plain JSON unchanged', () => {
  assert.deepStrictEqual(parseJsonc('{"a": 1, "b": [1, 2]}'), { a: 1, b: [1, 2] });
});

test('strips full-line comments', () => {
  assert.deepStrictEqual(parseJsonc('{\n  // colour of things\n  "a": "#FFF"\n}'), { a: '#FFF' });
});

test('strips inline comments after values', () => {
  assert.deepStrictEqual(parseJsonc('{"a": "#FFF" // editor bg\n}'), { a: '#FFF' });
});

test('strips block comments', () => {
  assert.deepStrictEqual(parseJsonc('{/* header */ "a": 1, "b": /* mid */ 2}'), { a: 1, b: 2 });
});

test('removes trailing commas in objects and arrays', () => {
  assert.deepStrictEqual(parseJsonc('{"a": [1, 2,], "b": 3,}'), { a: [1, 2], b: 3 });
});

test('removes a trailing comma separated from the brace by a comment', () => {
  assert.deepStrictEqual(parseJsonc('{"a": 1, // last one\n}'), { a: 1 });
});

test('leaves // inside string values alone', () => {
  assert.deepStrictEqual(parseJsonc('{"url": "https://example.com"}'), { url: 'https://example.com' });
});

test('leaves ",}" and comment markers inside string values alone', () => {
  assert.deepStrictEqual(parseJsonc('{"a": "x,}", "b": "not /* a */ comment"}'), {
    a: 'x,}',
    b: 'not /* a */ comment',
  });
});

test('handles escaped quotes inside strings', () => {
  assert.deepStrictEqual(parseJsonc('{"a": "say \\"hi\\" // ok"}'), { a: 'say "hi" // ok' });
});

test('preserves line numbers when blanking comments', () => {
  const stripped = stripJsonc('{\n// one\n// two\n"a": 1\n}');
  assert.strictEqual(stripped.split('\n').length, 5);
});
