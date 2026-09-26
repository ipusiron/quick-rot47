// ROT47 and character statistics (pure, no DOM). ROT47 rotates the 94 printable ASCII characters
// from ! (33) to ~ (126) by 47, half of 94, so applying it twice gives the original text back.
const RotCore = (() => {
  const FIRST = 33;                  // !
  const LAST = 126;                  // ~
  const SIZE = LAST - FIRST + 1;     // 94
  const SHIFT = SIZE / 2;            // 47

  const isTarget = ch => {
    const code = ch.codePointAt(0);
    return code >= FIRST && code <= LAST;
  };

  const rotChar = ch => (isTarget(ch) ? String.fromCharCode(FIRST + ((ch.codePointAt(0) - FIRST + SHIFT) % SIZE)) : ch);

  // Iterates by code point, so characters outside the BMP (emoji) stay whole
  function rot47(text) {
    return Array.from(String(text || ''), rotChar).join('');
  }

  // Full-width ASCII (U+FF01 to U+FF5E) looks like the targets but is not converted
  const isFullWidthAscii = ch => ch.codePointAt(0) >= 0xff01 && ch.codePointAt(0) <= 0xff5e;

  // How many characters were converted and how many were left as they are
  function stats(text) {
    const result = { changed: 0, kept: 0, fullWidth: 0 };
    for (const ch of String(text || '')) {
      if (isTarget(ch)) result.changed++;
      else result.kept++;
      if (isFullWidthAscii(ch)) result.fullWidth++;
    }
    return result;
  }

  return { FIRST, LAST, SIZE, SHIFT, isTarget, rotChar, rot47, isFullWidthAscii, stats };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = RotCore;
