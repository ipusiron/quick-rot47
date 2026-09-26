const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const jsFiles = fs.readdirSync(path.join(root, 'js')).map(f => [f, fs.readFileSync(path.join(root, 'js', f), 'utf8')]);

test('CSP, referrer and noscript', () => {
  const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(html);
  assert.ok(csp, 'meta CSP');
  assert.match(csp[1], /default-src 'none'/);
  assert.match(csp[1], /script-src 'self'/);
  assert.match(csp[1], /style-src 'self'/);
  assert.doesNotMatch(csp[1], /unsafe-inline|unsafe-eval|frame-ancestors/);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
  assert.match(html, /<noscript>/);
});

test('no inline handlers, inline styles, inline scripts or modules', () => {
  assert.doesNotMatch(html, /\son[a-z]+="/i);
  assert.doesNotMatch(html, /\sstyle="/i);
  assert.doesNotMatch(html, /<script>(?!<\/script>)/);
  assert.doesNotMatch(html, /<style/);
  assert.doesNotMatch(html, /type="module"/, 'classic scripts so that file:// works');
});

test('dialog, labels, buttons and links', () => {
  assert.match(html, /<dialog id="help-modal"[^>]*aria-labelledby="help-title"/);
  for (const [, id] of html.matchAll(/<label for="([^"]+)"/g)) assert.match(html, new RegExp(`id="${id}"`), id);
  for (const [tag] of html.matchAll(/<button\b[^>]*>/g)) assert.match(tag, /type="button"|type="submit"/, tag);
  for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(tag, /rel="noopener noreferrer"/);
  assert.match(html, /id="status" role="status"/, 'status messages are announced');
  assert.match(html, /<textarea id="output-text"[^>]*readonly/);
});

test('scripts avoid innerHTML, style writes, dialogs from window and network access', () => {
  for (const [name, src] of jsFiles) {
    for (const bad of ['innerHTML', 'insertAdjacentHTML', 'outerHTML', '.style.', 'alert(', 'confirm(', 'onclick', 'eval(', 'fetch(',
      'XMLHttpRequest', 'window.open', 'import ', 'export ', 'execCommand']) {
      assert.ok(!src.includes(bad), `${name} contains ${bad}`);
    }
  }
});

test('the core does not use the DOM', () => {
  for (const name of ['rot-core.js']) {
    const src = jsFiles.find(([f]) => f === name)[1];
    assert.ok(!/document\.|window\.|localStorage/.test(src), name);
  }
});

test('method choice, character table and method guess', () => {
  const R = require('../js/rot-core.js');
  const radios = [...html.matchAll(/<input type="radio" name="method" value="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(radios, R.METHOD_IDS, 'one radio per method, in the same order');
  assert.match(html, /<fieldset class="method-area">\s*<legend/);
  assert.match(html, /<input type="radio" name="method" value="rot47" checked>/);
  assert.match(html, /<label for="rotn-shift"[^>]*>[\s\S]*?<input type="number" id="rotn-shift" min="1" max="25"/);
  assert.match(html, /<ol class="map-grid" id="map-grid"><\/ol>/);
  assert.match(html, /<p class="stats" id="detect-status" role="status"><\/p>/);
  for (const id of ['map-panel', 'detect-panel']) assert.match(html, new RegExp(`id="${id}" aria-labelledby="`), id);
});

test('script order: dictionary, core and store before the UI', () => {
  const order = [...html.matchAll(/<script src="js\/([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(order, ['i18n.js', 'rot-core.js', 'main.js']);
  assert.deepEqual(jsFiles.map(([f]) => f).sort(), [...order].sort(), 'every script is loaded');
});
