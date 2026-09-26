const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

function luminance(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
const vars = {};
for (const [, name, value] of /:root\s*\{([^}]*)\}/.exec(css)[1].matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{3,6})/g)) vars[name] = value;

test('text colors meet 4.5:1 on their backgrounds', () => {
  assert.equal(Object.keys(vars).length, 13);
  const pairs = [
    ['#ffffff', vars.primary], ['#ffffff', vars['primary-dark']], ['#ffffff', vars.ok], ['#ffffff', vars.set], ['#ffffff', vars.sample],
    [vars.text, '#ffffff'], [vars.text, '#f8fafc'], [vars.muted, '#ffffff'], [vars.muted, '#f5f5f5'], [vars['warn-text'], '#fef9c3'],
    [vars.primary, '#ffffff'], [vars.primary, '#e8f1f8'], [vars.ok, '#ffffff'],
    ['#ffffff', '#374151'], ['#ffffff', '#166534'], ['#ffffff', '#0b5561'], [vars.text, '#e8f1f8'], [vars.muted, '#f8fafc'],
    [vars.text, vars['kind-symbol']], [vars.text, vars['kind-digit']], [vars.text, vars['kind-upper']], [vars.text, vars['kind-lower']]
  ];
  for (const [fg, bg] of pairs) assert.ok(ratio(fg, bg) >= 4.5, `${fg} on ${bg}: ${ratio(fg, bg).toFixed(2)}`);
});

test('the hover colors above are the ones the stylesheet uses, and field borders meet 3:1', () => {
  for (const rule of ['.sample-button:hover { background: #374151; }', '.action-button.copy:hover { background: #166534; }',
    '.action-button.set:hover { background: #0b5561; }', '.header-button:hover { background: #e8f1f8; }', '.small-button:hover { background: #e8f1f8; }',
    '.method-option:has(input:checked) { border-color: var(--primary); background: #e8f1f8; font-weight: 700; }']) {
    assert.ok(css.includes(rule), rule);
  }
  assert.ok(css.includes('border: 2px solid #64748b;'));
  assert.ok(ratio('#64748b', '#ffffff') >= 3);
});
