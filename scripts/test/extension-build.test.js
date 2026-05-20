const test = require('node:test');
const assert = require('node:assert/strict');
const eb = require('../lib/extension-build');

test('camelCase converts a kebab brand key', () => {
  assert.equal(eb.camelCase('new-south-wales'), 'newSouthWales');
  assert.equal(eb.camelCase('charli'), 'charli');
});

test('nsFor appends Theme to the camelCased key', () => {
  assert.equal(eb.nsFor('lucid-labs'), 'lucidLabsTheme');
  assert.equal(eb.nsFor('charli'), 'charliTheme');
});

test('monochromeSvg replaces {{role}} placeholders with currentColor', () => {
  const out = eb.monochromeSvg('<svg><path fill="{{accent}}"/></svg>');
  assert.equal(out, '<svg fill="currentColor"><path/></svg>');
});

test('monochromeSvg replaces literal hex fills with currentColor', () => {
  const out = eb.monochromeSvg('<svg><path fill="#339999"/><path fill="#ABC"/></svg>');
  assert.equal(out, '<svg fill="currentColor"><path/><path/></svg>');
});

test('monochromeSvg leaves an already-monochrome svg unchanged in meaning', () => {
  const out = eb.monochromeSvg('<svg fill="currentColor"><path d="M0 0"/></svg>');
  assert.match(out, /fill="currentColor"/);
  assert.doesNotMatch(out, /fill="currentColor"[^>]*fill="currentColor"/);
});
