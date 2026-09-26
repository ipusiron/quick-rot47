const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rot-core.js');

test('the range is the 94 printable ASCII characters and the shift is half of it', () => {
  assert.deepEqual([R.FIRST, R.LAST, R.SIZE, R.SHIFT], [33, 126, 94, 47]);
  assert.ok(R.isTarget('!') && R.isTarget('~') && R.isTarget('A'));
  assert.ok(!R.isTarget(' ') && !R.isTarget('\t') && !R.isTarget(String.fromCharCode(127)) && !R.isTarget('あ'));
});

test('known answers', () => {
  assert.equal(R.rot47('Hello World! 123'), 'w6==@ (@C=5P `ab');
  assert.equal(R.rot47('A'), 'p', 'A (65) is 32 places after !, 32 + 47 = 79, so p (112)');
  assert.equal(R.rot47('!'), 'P');
  assert.equal(R.rot47('~'), 'O');
  assert.equal(R.rot47('The Quick Brown Fox'), '%96 "F:4< qC@H? u@I');
});

test('every printable character maps to a different one and back (self-inverse, no fixed points)', () => {
  const all = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).join('');
  const once = R.rot47(all);
  assert.equal(new Set(once).size, 94, 'a permutation');
  assert.equal(R.rot47(once), all);
  for (const ch of all) assert.notEqual(R.rot47(ch), ch, ch);
});

test('characters outside the range are left as they are', () => {
  const kept = ' \t\n\r日本語ＡＢＣ！　é' + String.fromCharCode(127);
  assert.equal(R.rot47(kept), kept);
  assert.equal(R.rot47('😀 ok'), '😀 @<', 'an emoji (surrogate pair) stays whole');
  assert.equal(R.rot47(''), '');
  assert.equal(R.rot47(null), '');
});

test('statistics count converted and kept characters, and full-width ASCII', () => {
  assert.deepEqual(R.stats('Hello World! 123'), { changed: 14, kept: 2, fullWidth: 0 });
  assert.deepEqual(R.stats('ＡＢＣ abc'), { changed: 3, kept: 4, fullWidth: 3 });
  assert.deepEqual(R.stats('😀'), { changed: 0, kept: 1, fullWidth: 0 }, 'counted by code point');
  assert.ok(R.isFullWidthAscii('！') && R.isFullWidthAscii('～') && !R.isFullWidthAscii('　'));
});
