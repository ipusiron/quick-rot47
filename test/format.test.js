const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const files = ['style.css', ...fs.readdirSync(path.join(root, 'js')).map(f => 'js/' + f), ...fs.readdirSync(path.join(root, 'test')).map(f => 'test/' + f)];

test('no minified lines', () => {
  for (const f of files) {
    const longest = Math.max(...read(f).split(/\r?\n/).map(l => l.length));
    assert.ok(longest <= 160, `${f}: ${longest}`);
  }
  const html = Math.max(...read('index.html').split(/\r?\n/).map(l => l.length));
  assert.ok(html <= 250, `index.html: ${html}`);
});

test('no control characters or leftover escapes in the sources', () => {
  for (const f of [...files, 'index.html']) {
    const text = read(f);
    assert.ok(![...text].some(ch => ch.charCodeAt(0) < 32 && !'\n\r\t'.includes(ch)), `${f}: control character`);
  }
});

test('files keep their size', () => {
  const minimum = { 'style.css': 120, 'index.html': 60, 'js/i18n.js': 90, 'js/rot-core.js': 35, 'js/main.js': 90 };
  for (const [f, n] of Object.entries(minimum)) {
    const lines = read(f).split(/\r?\n/).length;
    assert.ok(lines >= n, `${f}: ${lines} < ${n}`);
  }
});
