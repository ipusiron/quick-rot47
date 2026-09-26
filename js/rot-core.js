// ROT47 and its relatives (pure, no DOM). Each method rotates characters inside one or more rings.
// ROT47: the 94 printable ASCII characters from ! (33) to ~ (126), shifted by 47 (half of 94).
// ROT13: A-Z and a-z, shifted by 13. ROT5: 0-9, shifted by 5. ROT18: ROT13 and ROT5 together.
// ROT-N: A-Z and a-z, shifted by N (the Caesar cipher). Only a half-turn shift undoes itself.
const RotCore = (() => {
  const FIRST = 33;                  // !
  const LAST = 126;                  // ~
  const SIZE = LAST - FIRST + 1;     // 94
  const SHIFT = SIZE / 2;            // 47

  // A ring is a run of consecutive code points: [first, size]
  const RINGS = { ascii: [FIRST, SIZE], upper: [65, 26], lower: [97, 26], digit: [48, 10] };
  const METHODS = {
    rot47: { rings: [['ascii', 47]] },
    rot13: { rings: [['upper', 13], ['lower', 13]] },
    rot5: { rings: [['digit', 5]] },
    rot18: { rings: [['upper', 13], ['lower', 13], ['digit', 5]] },
    rotn: { rings: [['upper', null], ['lower', null]] }        // null: the shift chosen by the user
  };
  const METHOD_IDS = Object.keys(METHODS);

  const inRing = (code, [first, size]) => code >= first && code < first + size;
  const turn = (code, [first, size], shift) => first + ((((code - first + shift) % size) + size) % size);

  // Normalizes a ROT-N shift into 1..25 (0 and 26 would change nothing)
  function normalizeShift(n) {
    const value = Math.trunc(Number(n));
    if (!Number.isFinite(value)) return 13;
    const m = ((value % 26) + 26) % 26;
    return m === 0 ? 13 : m;
  }

  function plan(method, n) {
    const def = METHODS[method];
    if (!def) throw new Error('Unknown method: ' + method);
    return def.rings.map(([ring, shift]) => [RINGS[ring], shift === null ? normalizeShift(n) : shift]);
  }

  // One character through a plan; characters outside every ring stay as they are
  function convertChar(ch, steps) {
    const code = ch.codePointAt(0);
    for (const [ring, shift] of steps) if (inRing(code, ring)) return String.fromCharCode(turn(code, ring, shift));
    return ch;
  }

  // Iterates by code point, so characters outside the BMP (emoji) stay whole
  function convert(text, method = 'rot47', n = 13) {
    const steps = plan(method, n);
    return Array.from(String(text || ''), ch => convertChar(ch, steps)).join('');
  }
  const rot47 = text => convert(text, 'rot47');
  const rotChar = ch => convertChar(ch, plan('rot47'));
  const isTarget = ch => inRing(ch.codePointAt(0), RINGS.ascii);

  // Whether applying the method again gives the original text back
  const isSelfInverse = (method, n) => plan(method, n).every(([[, size], shift]) => (shift * 2) % size === 0);
  // The shift that undoes ROT-N
  const inverseShift = n => normalizeShift(26 - normalizeShift(n));

  // Every character the method changes, in ring order, with its image: [{ from, to, kind }]
  function mapping(method, n) {
    const out = [];
    for (const [ring, shift] of plan(method, n)) {
      for (let i = 0; i < ring[1]; i++) {
        const code = ring[0] + i;
        out.push({ from: String.fromCharCode(code), to: String.fromCharCode(turn(code, ring, shift)), kind: kindOf(code) });
      }
    }
    return out;
  }
  function kindOf(code) {
    if (inRing(code, RINGS.upper)) return 'upper';
    if (inRing(code, RINGS.lower)) return 'lower';
    if (inRing(code, RINGS.digit)) return 'digit';
    return 'symbol';
  }

  // Full-width ASCII (U+FF01 to U+FF5E) looks like the targets but is not converted
  const isFullWidthAscii = ch => ch.codePointAt(0) >= 0xff01 && ch.codePointAt(0) <= 0xff5e;

  // How many characters the method converts and how many it leaves as they are
  function stats(text, method = 'rot47', n = 13) {
    const steps = plan(method, n);
    const result = { changed: 0, kept: 0, fullWidth: 0 };
    for (const ch of String(text || '')) {
      if (steps.some(([ring]) => inRing(ch.codePointAt(0), ring))) result.changed++;
      else result.kept++;
      if (isFullWidthAscii(ch)) result.fullWidth++;
    }
    return result;
  }

  // ---------- Detection: which conversion turns the text into English? ----------
  // English letter frequencies (percent, A to Z)
  const FREQ = [8.2, 1.5, 2.8, 4.3, 12.7, 2.2, 2.0, 6.1, 7.0, 0.15, 0.77, 4.0, 2.4, 6.7, 7.5, 1.9, 0.095, 6.0, 6.3, 9.1, 2.8, 0.98, 2.4,
    0.15, 2.0, 0.074];
  const WORDS = new Set(('the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an' +
    ' will my one all would there their what so up out if about who get which go me when make can like time no just him know take people' +
    ' into year your good some could them see other than then now look only come its over think also back after use two how our work first' +
    ' well way even new want because any these give day most us is are was were has had been am did does said hello world flag ctf secret' +
    ' answer message key text code cipher meet noon attack dawn quick brown fox jumps lazy dog test yes thank thanks please here where why' +
    ' password user admin login pico welcome').split(' '));
  // Sentence punctuation is usual in English; other symbols (and digits in the middle of words) are not
  const USUAL = new Set(' .,!?\'"-:;()\n\t'.split(''));

  // Higher is more like English. Returns 0 for text with no ASCII letters.
  function englishScore(text) {
    const s = String(text || '');
    const letters = s.match(/[A-Za-z]/g) || [];
    if (!letters.length) return 0;
    const ascii = [...s].filter(ch => ch.codePointAt(0) < 128);
    const odd = ascii.filter(ch => !/[A-Za-z0-9]/.test(ch) && !USUAL.has(ch)).length;
    const oddRatio = odd / Math.max(1, ascii.length);
    const counts = new Array(26).fill(0);
    for (const ch of letters) counts[ch.toLowerCase().charCodeAt(0) - 97]++;
    let chi = 0;
    FREQ.forEach((f, i) => { const expected = f / 100 * letters.length; chi += (counts[i] - expected) ** 2 / expected; });
    const chiScore = 1 / (1 + chi / letters.length);           // 1 for a perfect match, towards 0 for random
    const tokens = s.toLowerCase().match(/[a-z]+/g) || [];
    const known = tokens.filter(w => WORDS.has(w)).reduce((sum, w) => sum + w.length, 0);
    const wordScore = known / Math.max(1, tokens.reduce((sum, w) => sum + w.length, 0));
    const flag = /\b(?:flag|ctf|picoctf)\{[^}]*\}/i.test(s) ? 1 : 0;
    return Math.max(0, 2 * wordScore + chiScore - 2 * oddRatio + flag);
  }

  // Candidates, best first: [{ method, n, text, score }]. 'none' is the text as it is.
  function detect(text) {
    const s = String(text || '');
    const candidates = [{ method: 'none', n: 0, text: s }];
    for (const method of ['rot47', 'rot13', 'rot5', 'rot18']) candidates.push({ method, n: 0, text: convert(s, method) });
    for (let n = 1; n < 26; n++) if (n !== 13) candidates.push({ method: 'rotn', n, text: convert(s, 'rotn', n) });
    // Methods that give the same text are one candidate; the simpler method (earlier in the list) is kept.
    // (ROT18 on text without digits is ROT13; ROT5 on text without digits changes nothing.)
    const seen = new Set();
    const unique = candidates.filter(c => !seen.has(c.text) && seen.add(c.text));
    // The sort is stable, so on a tie the simpler method stays first
    return unique.map(c => ({ ...c, score: englishScore(c.text) })).sort((a, b) => b.score - a.score);
  }

  return {
    FIRST, LAST, SIZE, SHIFT, METHOD_IDS, isTarget, rotChar, rot47, convert, normalizeShift, isSelfInverse, inverseShift,
    mapping, kindOf, isFullWidthAscii, stats, englishScore, detect
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = RotCore;
