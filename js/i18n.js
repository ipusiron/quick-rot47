// Japanese and English messages. The UI scripts keep no language-specific literals.
const I18n = (() => {
  const ja = {
    'app.title': 'QuickROT47 - ROT47変換ツール',
    'app.subtitle': 'ROT47を中心に、ROT13・ROT5・ROT18・ROT-Nも試せる変換ツール',
    'app.langButton': 'English',
    'app.footer': '🔗 GitHubリポジトリーはこちら（',
    'app.footerEnd': '）',
    'method.legend': '変換方式',
    'method.rot47': 'ROT47（記号・数字・英字）',
    'method.rot13': 'ROT13（英字）',
    'method.rot5': 'ROT5（数字）',
    'method.rot18': 'ROT18（英字と数字）',
    'method.rotn': 'ROT-N（英字をN文字ずらす）',
    'method.shiftLabel': 'ずらす数（N）',
    'method.invert': '戻す数にする（26−N）',
    'method.selfInverse': '{name}は、もう一度かけると元に戻ります。',
    'method.notSelfInverse': 'ROT-{n}は、もう一度かけても元に戻りません。元に戻すにはROT-{back}をかけます（「戻す数にする」を押すと切り替わります）。',
    'input.label': '入力テキスト',
    'input.placeholder': 'ここに平文または変換した文を入力',
    'sample.plain': 'サンプル: {text}',
    'sample.cipher': 'サンプル: {name}の文',
    'live.label': '入力に合わせて変換する',
    'convert': '🔁 変換する',
    'output.label': '出力テキスト',
    'copy': '📋 コピー',
    'setInput': '⬆ 入力テキストにセット',
    'status.copied': 'クリップボードにコピーしました。',
    'status.copyFailed': 'コピーできなかったので、出力を選択しました。Ctrl+C（Macは⌘+C）でコピーしてください。',
    'status.nothing': 'コピーする出力がありません。先に変換してください。',
    'status.set': '出力を入力テキストに移して変換しました。出力は元の文に戻っています。',
    'status.setShifted': '出力を入力テキストに移して、もう一度ROT-{n}をかけました。元に戻すにはROT-{back}をかけます（「戻す数にする」を押すと切り替わります）。',
    'status.setNothing': 'セットする出力がありません。',
    'status.inverted': 'ずらす数を{n}にしました。',
    'status.shiftFixed': 'ずらす数は1〜25の整数です。{n}にしました。',
    'status.used': '{name}で変換しました。',
    'scope.rot47': '空白・改行・日本語などはROT47の対象外',
    'scope.rot13': 'ROT13が変えるのは英字だけ',
    'scope.rot5': 'ROT5が変えるのは数字だけ',
    'scope.rot18': 'ROT18が変えるのは英字と数字だけ',
    'scope.rotn': 'ROT-Nが変えるのは英字だけ',
    'stats.line': '変換した文字: {changed}・そのままの文字: {kept}（{scope}）',
    'stats.fullWidth': '全角の文字が{count}文字あります（半角なら{name}で変換される文字）。{name}が変換するのは半角（ASCII）の文字だけです。',
    'map.title': '🔤 対応表',
    'map.caption': '各マスは「元の文字→変換後の文字」で、色は元の文字の種類です。入力に含まれる文字は太い枠で示します。',
    'map.kind.symbol': '記号',
    'map.kind.digit': '数字',
    'map.kind.upper': '大文字',
    'map.kind.lower': '小文字',
    'map.used': '入力に含まれる',
    'map.gridLabel': '{name}の対応表',
    'map.cell': '{from}は{to}になる',
    'map.cellUsed': '{from}は{to}になる（入力に含まれる）',
    'map.summary': '{name}が変える{count}文字のうち、入力に含まれるのは{used}文字です。',
    'detect.title': '🔎 方式の自動判定',
    'detect.lead': '入力テキストを各方式で変換し、英文として読めそうな順に並べます。',
    'detect.button': '判定する',
    'detect.use': '{name}で変換する',
    'detect.none': 'そのまま（変換しない）',
    'detect.rotnName': 'ROT-{n}（ROT-{back}の文を戻す）',
    'detect.best': 'いちばん英文らしい',
    'detect.bestTie': 'いちばん英文らしい（同点）',
    'detect.tieNote': '{names}は数字だけが違うので、点数では区別できません。',
    'detect.nameSep': '、',
    'detect.meter': '英文らしさ（1位を100、最下位を0とした値）: {percent}',
    'detect.result': '{count}通りの変換結果を比べ、英文らしい順に上位{shown}件を表示しています。',
    'detect.weak': 'どの結果も英文らしさがはっきりしないので、判定は当てになりません。',
    'detect.empty': '判定できる文字がありません。半角の英数字・記号を含む文を入れてください。',
    'detect.stale': '入力が変わりました。もう一度「判定する」を押してください。',
    'detect.note': '英語の文を前提にした推定です。短い文や英語以外の文では外れることがあります。',
    'help.open': 'ヘルプを開く',
    'help.close': '閉じる',
    'help.title': '📖 ヘルプ',
    'help.s1.h': '🔐 ROT47とは',
    'help.s1.p': 'ASCIIの可視文字94文字（「!」から「~」まで）を、47文字ずつずらして置き換える方法です。47は94のちょうど半分なので、もう一度同じ変換をすると元の文に戻ります。',
    'help.s2.h': '🧭 使い方',
    'help.s2.p': '変換方式を選び、入力テキストに文を入れて「変換する」を押します。変換した文を入れて同じ操作をすると、元の文に戻ります（ROT-Nを除く）。「入力テキストにセット」を押すと、出力を入力に移して変換し直します。',
    'help.s3.h': '🔤 ROTの仲間',
    'help.s3.p':
      'ROT13は英字だけ、ROT5は数字だけ、ROT18は英字と数字を変換します。どれも文字の輪をちょうど半周ずらすので、もう一度かけると元に戻ります。ROT-Nは英字をN文字ずらす方式（シーザー暗号）で、26−N文字ずらすと元に戻ります。もう一度かけて戻るのは、N＝13のときだけで' +
      'す。対応表では、どの文字が何になるかを確かめられます。',
    'help.s4.h': '🔎 自動判定',
    'help.s4.p':
      '入力を各方式で変換し、よく使われる英単語に当たる文字の割合・英字の出現頻度・英文にふつう出てこない記号の割合・CTFのフラグの形から「英文らしさ」を求めて並べます。どの方式で隠したかわからない文を調べるときに使えます。英語以外の文や短い文では外れることがあります。',
    'help.s5.h': '⚠️ 暗号ではありません',
    'help.s5.p': 'ROT47には鍵がなく、仕組みを知っていればだれでも元に戻せます。ネタバレ防止のような「うっかり読ませない」用途向けで、パスワードや個人情報の保護には使えません。',
    'help.s6.h': '🔒 このツールの動作',
    'help.s6.p': '変換はすべてブラウザーの中で行い、入力した文をどこへも送りません。'
  };

  const en = {
    'app.title': 'QuickROT47 - ROT47 Encoder/Decoder',
    'app.subtitle': 'A ROT47 tool that also does ROT13, ROT5, ROT18 and ROT-N',
    'app.langButton': '日本語',
    'app.footer': '🔗 GitHub repository (',
    'app.footerEnd': ')',
    'method.legend': 'Method',
    'method.rot47': 'ROT47 (symbols, digits, letters)',
    'method.rot13': 'ROT13 (letters)',
    'method.rot5': 'ROT5 (digits)',
    'method.rot18': 'ROT18 (letters and digits)',
    'method.rotn': 'ROT-N (shift letters by N)',
    'method.shiftLabel': 'Shift (N)',
    'method.invert': 'Switch to the undo shift (26 − N)',
    'method.selfInverse': 'Applying {name} again gives the original text back.',
    'method.notSelfInverse': 'Applying ROT-{n} again does not undo it. ROT-{back} does (press "Switch to the undo shift").',
    'input.label': 'Input text',
    'input.placeholder': 'Type plain text or converted text here',
    'sample.plain': 'Sample: {text}',
    'sample.cipher': 'Sample: {name} text',
    'live.label': 'Convert as I type',
    'convert': '🔁 Convert',
    'output.label': 'Output text',
    'copy': '📋 Copy',
    'setInput': '⬆ Use as input',
    'status.copied': 'Copied to the clipboard.',
    'status.copyFailed': 'Could not copy, so the output is selected. Press Ctrl+C (Cmd+C on a Mac) to copy it.',
    'status.nothing': 'There is no output to copy. Convert some text first.',
    'status.set': 'The output was moved into the input and converted, so the output is back to the original text.',
    'status.setShifted':
      'The output was moved into the input and ROT-{n} was applied again. ROT-{back} gives the original back (press "Switch to the undo shift").',
    'status.setNothing': 'There is no output to use.',
    'status.inverted': 'The shift is now {n}.',
    'status.shiftFixed': 'The shift must be a whole number from 1 to 25, so it is now {n}.',
    'status.used': 'Converted with {name}.',
    'scope.rot47': 'spaces, line breaks and non-ASCII text are not part of ROT47',
    'scope.rot13': 'ROT13 changes letters only',
    'scope.rot5': 'ROT5 changes digits only',
    'scope.rot18': 'ROT18 changes letters and digits only',
    'scope.rotn': 'ROT-N changes letters only',
    'stats.line': 'Converted: {changed}, left as they are: {kept} ({scope})',
    'stats.fullWidth':
      'The text has {count} full-width characters that {name} would convert in half-width form. {name} converts only half-width (ASCII) characters.',
    'map.title': '🔤 Character table',
    'map.caption':
      'Each cell shows "character → result", colored by the kind of the original character. Characters in the input have a thick border.',
    'map.kind.symbol': 'Symbols',
    'map.kind.digit': 'Digits',
    'map.kind.upper': 'Uppercase',
    'map.kind.lower': 'Lowercase',
    'map.used': 'In the input',
    'map.gridLabel': '{name} character table',
    'map.cell': '{from} becomes {to}',
    'map.cellUsed': '{from} becomes {to} (in the input)',
    'map.summary': 'Characters {name} changes: {count}. Of these, in the input: {used}.',
    'detect.title': '🔎 Guess the method',
    'detect.lead': 'Converts the input with each method and lists the results that look most like English first.',
    'detect.button': 'Guess',
    'detect.use': 'Convert with {name}',
    'detect.none': 'As it is (no conversion)',
    'detect.rotnName': 'ROT-{n} (undoes ROT-{back})',
    'detect.best': 'Most English-like',
    'detect.bestTie': 'Most English-like (tied)',
    'detect.tieNote': '{names} differ only in their digits, so the score cannot tell them apart.',
    'detect.nameSep': ' and ',
    'detect.meter': 'English-likeness (best = 100, worst = 0): {percent}',
    'detect.result': 'Compared {count} different results and listed the top {shown}, most English-like first.',
    'detect.weak': 'No result clearly looks like English, so this guess is not reliable.',
    'detect.empty': 'There is nothing to judge. Type text with half-width letters, digits or symbols.',
    'detect.stale': 'The input has changed. Press "Guess" again.',
    'detect.note': 'This is a guess that assumes English text. It can be wrong for short or non-English text.',
    'help.open': 'Open help',
    'help.close': 'Close',
    'help.title': '📖 Help',
    'help.s1.h': '🔐 What is ROT47?',
    'help.s1.p':
      'ROT47 replaces each of the 94 printable ASCII characters (from ! to ~) with the one 47 places further on, wrapping around after ~. Because' +
      ' 47 is exactly half of 94, applying the same conversion again gives the original text back.',
    'help.s2.h': '🧭 How to use it',
    'help.s2.p':
      'Choose a method, type text into the input and press "Convert". Converting the result the same way gives the original back (except ROT-N).' +
      ' "Use as input" moves the output into the input and converts it again.',
    'help.s3.h': '🔤 The ROT family',
    'help.s3.p':
      'ROT13 converts letters only, ROT5 digits only, and ROT18 letters and digits. Each turns its ring of characters exactly halfway, so applying' +
      ' it again undoes it. ROT-N shifts letters by N (the Caesar cipher). Shifting by 26 − N undoes it; only ROT-13 undoes itself. The character' +
      ' table shows what each character becomes.',
    'help.s4.h': '🔎 Guessing the method',
    'help.s4.p':
      'The input is converted with each method, and the results are ranked by how much they look like English: the share of letters in common' +
      ' words, the letter frequencies, the share of unusual symbols and the shape of a CTF flag. Use it when you do not know how a text was hidden.' +
      ' It can be wrong for non-English or short text.',
    'help.s5.h': '⚠️ Not encryption',
    'help.s5.p':
      'ROT47 has no key; anyone who knows it can undo it. It suits "do not read this by accident" uses such as spoilers, not protecting passwords' +
      ' or personal data.',
    'help.s6.h': '🔒 What this tool does',
    'help.s6.p': 'Everything runs in your browser. Nothing you type is sent anywhere.'
  };

  let language = 'ja';
  const STORAGE_KEY = 'quick-rot47-language';

  function t(key, values = {}) {
    const dict = language === 'en' ? en : ja;
    const message = dict[key];
    if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
    return message.replace(/\{(\w+)\}/g, (m, name) => (Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : m));
  }

  function apply(root = document) {
    document.documentElement.lang = language;
    document.title = t('app.title');
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      root.querySelectorAll(`[data-i18n-${attr}]`).forEach(el => el.setAttribute(attr, t(el.getAttribute(`data-i18n-${attr}`))));
    }
  }

  function setLanguage(value) {
    if (!['ja', 'en'].includes(value)) return;
    language = value;
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage may be blocked */ }
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage may be blocked */ }
    const query = new URLSearchParams(location.search).get('lang');
    language = [query, saved].find(v => v === 'ja' || v === 'en') || (/^ja\b/i.test(navigator.language || '') ? 'ja' : 'en');
    apply();
  }

  return { ja, en, t, apply, init, setLanguage, get language() { return language; } };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = I18n;
