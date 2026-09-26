# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickROT47 is a static web tool for ROT47: each printable ASCII character (codes 33-126) is replaced with the one 47 places further on. Because 47 is half of 94, the same conversion restores the text. It is Day037 of the "100 Security Tools with Generative AI" project. ROT47 is not encryption; the page and README say so.

## Commands

- **Run locally**: open `index.html` (works from `file://`) or serve the folder with any static server
- **Test**: `npm test` (runs `node --test`; no dependencies to install)
- **Deploy**: GitHub Pages from the main branch (https://ipusiron.github.io/quick-rot47/)
- **CI**: `.github/workflows/test.yml` runs `npm test` on push and pull_request

## Architecture

Classic scripts (no modules, so `file://` works), loaded in this order by `index.html`:

- `js/i18n.js` - `I18n`: Japanese and English messages (`I18n.ja`, `I18n.en`), `t(key, values)`, `apply()`, `setLanguage()`. Language order: `?lang=` in the URL, then `localStorage` (`quick-rot47-language`), then the browser language
- `js/rot-core.js` - `RotCore`: `rot47(text)`, `rotChar(ch)`, `isTarget(ch)`, `isFullWidthAscii(ch)`, `stats(text)` (`changed`, `kept`, `fullWidth`, counted per code point). No DOM, so the tests `require()` it
- `js/main.js` - page behaviour: convert, live conversion, samples, copy (falls back to selecting the output), "use as input", status messages (one timer), help dialog, language button

Each file ends with `if (typeof module !== 'undefined' && module.exports) module.exports = ...` so Node can load it.

## Rules for Changes

- Keep the CSP in `index.html` strict (`default-src 'none'`; no inline scripts, styles or event handlers)
- No `innerHTML`, `.style.` writes, `alert`/`confirm`, `window.open`, `execCommand` or network access (`test/html.test.js` checks this)
- Every UI string goes through `I18n` in both languages; `test/i18n.test.js` checks that the key sets match
- Colors are `:root` variables in `style.css`; text colors must stay at 4.5:1 or more (`test/contrast.test.js`)
- Buttons stay at least 44px high
- Lines stay under 160 characters (`test/format.test.js`)
- `README.md` and `README.en.md` are generated from templates outside this repository; `test/readme.test.js` checks their examples against `RotCore`, so update both READMEs when behaviour changes
