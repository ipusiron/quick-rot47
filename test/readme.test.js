const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const C = require('../js/rot-core.js');
const root = path.join(__dirname, '..');
const readme = { ja: fs.readFileSync(path.join(root, 'README.md'), 'utf8'), en: fs.readFileSync(path.join(root, 'README.en.md'), 'utf8') };
const cells = line => line.split(' | ').map(c => c.replace(/^\|\s*|\s*\|$/g, '').trim());
const unquote = s => s.replace(/^`` | ``$/g, '');
const rot13 = s => s.replace(/[A-Za-z]/g, ch => {
  const base = ch <= 'Z' ? 65 : 97;
  return String.fromCharCode(base + ((ch.charCodeAt(0) - base + 13) % 26));
});

// Text between `heading` and the next heading of any level
function section(text, heading) {
  const start = text.indexOf(heading + '\n');         // the whole heading line, not a longer heading that starts the same way
  assert.ok(start >= 0, heading);
  const rest = text.slice(start + heading.length);
  const end = rest.search(/\n#{2,4} /);
  return end < 0 ? rest : rest.slice(0, end);
}
const fence = text => text.slice(text.indexOf('```\n') + 4, text.indexOf('\n```', text.indexOf('```\n') + 4));

test('conversion examples match the core in both READMEs', () => {
  for (const [lang, heading] of [['ja', '### 変換例'], ['en', '### Examples']]) {
    const rows = section(readme[lang], heading).split('\n').filter(l => l.startsWith('|')).slice(2).map(cells);
    assert.ok(rows.length >= 4, lang);
    for (const [input, r13, r47] of rows.map(r => r.map(unquote))) {
      assert.equal(r13, rot13(input), `${lang} ROT13 ${input}`);
      assert.equal(r47, C.rot47(input), `${lang} ROT47 ${input}`);
    }
  }
});

test('the pair table lists all 94 characters as swapping pairs', () => {
  for (const [lang, heading] of [['ja', '### 94文字の対応表'], ['en', '### The 94 pairs']]) {
    const [top, bottom] = fence(section(readme[lang], heading)).split('\n');
    assert.equal(top.length, 47);
    assert.equal(new Set(top + bottom).size, 94);
    [...top].forEach((ch, i) => assert.equal(C.rotChar(ch), bottom[i], `${lang} ${ch}`));
  }
});

test('the layout example keeps line breaks and tabs', () => {
  for (const [lang, a, b] of [['ja', '次の2行', 'ROT47で変換すると、次のようになります。'], ['en', 'These two lines', 'become this after ROT47']]) {
    const text = readme[lang];
    const input = fence(text.slice(text.indexOf(a)));
    const output = fence(text.slice(text.indexOf(b)));
    assert.ok(input.includes('\t') && input.includes('\n'), lang);
    assert.equal(output, C.rot47(input), lang);
  }
});

test('the worked example follows the formula', () => {
  for (const lang of ['ja', 'en']) {
    const text = readme[lang];
    assert.ok(text.includes(`(32 + 47) mod 94 = 79`), lang);
    assert.ok(text.includes(`79 + 33 = 112 -> '${C.rotChar('A')}'`), lang);
    assert.ok(text.includes(`(79 + 47) mod 94 = 126 mod 94 = 32`), lang);
  }
});

test('YAML metadata keeps its structure', () => {
  const yaml = /^<!--\n---\n([\s\S]*?)\n---\n-->/.exec(readme.ja);
  assert.ok(yaml, 'YAML block');
  for (const line of ['id: day037', 'slug: quick-rot47', 'repo_url: "https://github.com/ipusiron/quick-rot47"',
    'demo_url: "https://ipusiron.github.io/quick-rot47/"', 'hub: true']) assert.ok(yaml[1].includes(line), line);
  for (const key of ['category_ja:', 'category_en:', 'tags:']) {
    const lines = yaml[1].split('\n');
    assert.match(lines[lines.indexOf(key) + 1], /^ {2}- /, key);
  }
  assert.ok(!readme.en.includes('id: day037'), 'YAML only in README.md');
});

test('both READMEs have the same section structure', () => {
  const headings = t => t.split('\n').filter(l => /^#{2,4} /.test(l)).map(l => l.match(/^#+/)[0].length);
  assert.deepEqual(headings(readme.ja), headings(readme.en));
  assert.ok(headings(readme.ja).length >= 30);
  assert.match(readme.ja, /\[English\]\(README\.en\.md\) · 日本語/);
  assert.match(readme.en, /English · \[日本語\]\(README\.md\)/);
});

test('bold markers render (CommonMark flanking rules with CJK punctuation)', () => {
  const PUNCT = /[\p{P}\p{S}]/u, SPACE = /\s/;
  for (const [lang, text] of Object.entries(readme)) {
    text.split('\n').forEach((line, n) => {
      let open = true;
      for (const m of line.matchAll(/\*\*/g)) {
        const before = line[m.index - 1] || ' ', after = line[m.index + 2] || ' ';
        const left = !SPACE.test(after) && (!PUNCT.test(after) || SPACE.test(before) || PUNCT.test(before));
        const right = !SPACE.test(before) && (!PUNCT.test(before) || SPACE.test(after) || PUNCT.test(after));
        assert.ok(open ? left : right, `${lang}:${n + 1}: ${line.slice(Math.max(0, m.index - 10), m.index + 12)}`);
        open = !open;
      }
    });
  }
});

test('images exist and assets holds only referenced PNGs', () => {
  const refs = new Set();
  for (const text of Object.values(readme)) for (const [, p] of text.matchAll(/!\[[^\]]*\]\((assets\/[^)]+)\)/g)) refs.add(p);
  assert.ok(refs.size >= 3);
  for (const p of refs) assert.ok(fs.existsSync(path.join(root, p)), p);
  const pngs = fs.readdirSync(path.join(root, 'assets'), { recursive: true }).map(f => 'assets/' + f.split(path.sep).join('/'))
    .filter(f => f.endsWith('.png'));
  for (const f of pngs) assert.ok(refs.has(f), `unreferenced ${f}`);
});

test('the directory tree lists every tracked file with a description', () => {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)
    .filter(f => !f.startsWith('.claude/'));
  for (const [lang, heading] of [['ja', '## 📂 ディレクトリー構成'], ['en', '## 📂 Directory Structure']]) {
    const tree = fence(section(readme[lang], heading));
    const lines = tree.split('\n').filter(l => l.trim() && !l.startsWith('quick-rot47/'));
    for (const l of lines) assert.match(l, /# \S/, `${lang}: ${l}`);
    for (const f of tracked) assert.ok(tree.includes(path.basename(f)), `${lang}: ${f}`);
    assert.ok(!tree.includes('script.js'), lang);
  }
});

test('Japanese text follows the house style', () => {
  let inFence = false;
  readme.ja.split('\n').forEach((line, n) => {
    if (line.startsWith('```')) inFence = !inFence;
    if (inFence || line.startsWith('```') || line.startsWith('|')) return;
    assert.ok(!/：$/.test(line.trim()), `ja:${n + 1}: trailing colon`);
    assert.ok(!/ブラウザ(?!ー)/.test(line), `ja:${n + 1}: ブラウザー`);
    assert.ok(!/[\u3040-\u30ff\u4e00-\u9fff] [A-Za-z0-9]|[A-Za-z0-9] [\u3040-\u30ff\u4e00-\u9fff]/.test(line.replace(/`[^`]*`/g, 'x')),
      `ja:${n + 1}: half-width space next to Japanese`);
  });
});

test('claims that did not hold up stay removed', () => {
  for (const bad of ['対象とできます', 'スクリーンショットを参照', '小文字はROT5', '軽量暗号', 'ログファイル内の個人情報', 'alt.folklore.computers',
    'RedditやDiscordなどで時折', 'execCommand', 'v1.5', '0x8000（32768）文字分シフト', '完全に難読化']) {
    assert.ok(!readme.ja.includes(bad), bad);
  }
  for (const bad of ['alt.folklore.computers', 'execCommand']) assert.ok(!readme.en.includes(bad), bad);
});

test('the method table and the guess examples match the core', () => {
  const rowsOf = (lang, heading) => section(readme[lang], heading).split('\n').filter(l => l.startsWith('|')).slice(2).map(cells);
  for (const [lang, methods, guesses] of [['ja', '### 方式ごとの対象', '### 判定の例'], ['en', '### What each method changes', '### Examples of guesses']]) {
    const rows = rowsOf(lang, methods);
    assert.deepEqual(rows.map(r => r[0].replace(/\*/g, '')), ['ROT47', 'ROT13', 'ROT5', 'ROT18', 'ROT-N'], lang);
    rows.forEach((r, i) => assert.equal(Number(r[2]), C.mapping(C.METHOD_IDS[i], 3).length, `${lang} ${r[0]}`));
    const examples = rowsOf(lang, guesses).map(r => r.map(unquote));
    assert.ok(examples.length >= 4, lang);
    for (const [cipher, name, plain] of examples) {
      const best = C.detect(cipher)[0];
      assert.equal(best.text, plain, `${lang} ${plain}`);
      assert.equal(best.method === 'rotn' ? 'ROT-' + best.n : best.method.toUpperCase(), name, `${lang} ${plain}`);
    }
  }
});
