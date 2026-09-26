const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rot-core.js');

const ALL = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).join('');
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

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
  assert.equal(R.convert('Hello World! 123', 'rot13'), 'Uryyb Jbeyq! 123');
  assert.equal(R.convert('Hello World! 123', 'rot5'), 'Hello World! 678');
  assert.equal(R.convert('Hello World! 123', 'rot18'), 'Uryyb Jbeyq! 678');
  assert.equal(R.convert('Attack at dawn', 'rotn', 3), 'Dwwdfn dw gdzq', 'Caesar used a shift of 3');
  assert.equal(R.convert('xyz XYZ', 'rotn', 3), 'abc ABC', 'wraps around within each case');
});

test('every printable character maps to a different one and back (self-inverse, no fixed points)', () => {
  const once = R.rot47(ALL);
  assert.equal(new Set(once).size, 94, 'a permutation');
  assert.equal(R.rot47(once), ALL);
  for (const ch of ALL) assert.notEqual(R.rot47(ch), ch, ch);
});

test('ROT13, ROT5 and ROT18 undo themselves; ROT-N is undone by 26 - N', () => {
  for (const method of ['rot47', 'rot13', 'rot5', 'rot18']) {
    assert.equal(R.convert(R.convert(ALL, method), method), ALL, method);
    assert.ok(R.isSelfInverse(method), method);
  }
  for (let n = 1; n < 26; n++) {
    assert.equal(R.convert(R.convert(ALL, 'rotn', n), 'rotn', R.inverseShift(n)), ALL, 'n = ' + n);
    assert.equal(R.isSelfInverse('rotn', n), n === 13, 'n = ' + n);
  }
  assert.equal(R.convert(LETTERS, 'rotn', 13), R.convert(LETTERS, 'rot13'));
});

test('each method changes only its own characters', () => {
  const changed = method => [...ALL].filter(ch => R.convert(ch, method, 3) !== ch).join('');
  assert.equal(changed('rot47'), ALL);
  assert.equal(changed('rot13'), LETTERS);
  assert.equal(changed('rot5'), '0123456789');
  assert.equal(changed('rot18').length, 62);
  assert.equal(changed('rotn'), LETTERS);
});

test('the ROT-N shift is kept within 1 to 25', () => {
  assert.deepEqual([1, 25, 26, 27, -1, 0, 3.7, 'x'].map(R.normalizeShift), [1, 25, 13, 1, 25, 13, 3, 13]);
});

test('the mapping lists every character the method changes, with its kind', () => {
  const sizes = { rot47: 94, rot13: 52, rot5: 10, rot18: 62, rotn: 52 };
  for (const [method, size] of Object.entries(sizes)) {
    const map = R.mapping(method, 5);
    assert.equal(map.length, size, method);
    for (const { from, to } of map) assert.equal(R.convert(from, method, 5), to, method + ' ' + from);
  }
  const kinds = R.mapping('rot47').reduce((acc, m) => ({ ...acc, [m.kind]: (acc[m.kind] || 0) + 1 }), {});
  assert.deepEqual(kinds, { symbol: 32, digit: 10, upper: 26, lower: 26 });
});

test('characters outside the range are left as they are', () => {
  const kept = ' \t\n\r日本語ＡＢＣ！　é' + String.fromCharCode(127);
  for (const method of ['rot47', 'rot13', 'rot5', 'rot18', 'rotn']) assert.equal(R.convert(kept, method, 3), kept, method);
  assert.equal(R.rot47('😀 ok'), '😀 @<', 'an emoji (surrogate pair) stays whole');
  assert.equal(R.rot47(''), '');
  assert.equal(R.rot47(null), '');
  assert.throws(() => R.convert('a', 'rot99'), /Unknown method/);
});

test('statistics count converted and kept characters for each method, and full-width ASCII', () => {
  assert.deepEqual(R.stats('Hello World! 123'), { changed: 14, kept: 2, fullWidth: 0 });
  assert.deepEqual(R.stats('Hello World! 123', 'rot13'), { changed: 10, kept: 6, fullWidth: 0 });
  assert.deepEqual(R.stats('Hello World! 123', 'rot5'), { changed: 3, kept: 13, fullWidth: 0 });
  assert.deepEqual(R.stats('ＡＢＣ abc'), { changed: 3, kept: 4, fullWidth: 3 });
  assert.deepEqual(R.stats('😀'), { changed: 0, kept: 1, fullWidth: 0 }, 'counted by code point');
  assert.ok(R.isFullWidthAscii('！') && R.isFullWidthAscii('～') && !R.isFullWidthAscii('　'));
});

test('detection finds the conversion that turns the text into English', () => {
  const cases = [
    ['rot47', 0, 'Hello World! 123'], ['rot47', 0, 'The quick brown fox jumps over the lazy dog'], ['rot47', 0, 'Meet me at noon'],
    ['rot47', 0, 'picoCTF{s3cr3t_fl4g}'], ['rot13', 0, 'Meet me at noon by the old bridge'], ['rot13', 0, 'flag{rot_thirteen}'],
    ['rotn', 3, 'Attack at dawn'], ['none', 0, 'This is plain text already']
  ];
  for (const [method, n, plain] of cases) {
    const cipher = method === 'none' ? plain : R.convert(plain, method, n);
    const best = R.detect(cipher)[0];
    const expected = method === 'rotn' ? { method, n: R.inverseShift(n) } : { method, n: 0 };
    assert.deepEqual({ method: best.method, n: best.n }, expected, plain);
    assert.equal(best.text, plain, plain);
  }
});

test('detection lists each distinct result once, simpler methods first on a tie', () => {
  const list = R.detect('Uryyb Jbeyq');
  const texts = list.map(c => c.text);
  assert.equal(new Set(texts).size, texts.length, 'no duplicates');
  assert.ok(!list.some(c => c.method === 'rot18'), 'ROT18 without digits is the same as ROT13');
  assert.equal(R.detect('Hello World! 123')[0].method, 'none', 'plain text stays first even though ROT5 only changes the digits');
  assert.deepEqual(R.detect(''), [{ method: 'none', n: 0, text: '', score: 0 }]);
  assert.equal(R.englishScore('日本語だけ'), 0);
});
