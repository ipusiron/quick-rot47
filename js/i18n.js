// Japanese and English messages. The UI scripts keep no language-specific literals.
const I18n = (() => {
  const ja = {
    'app.title': 'QuickROT47 - ROT47変換ツール',
    'app.subtitle': 'ASCII可視文字を47文字ずらすROT47変換ツール',
    'app.langButton': 'English',
    'app.langLabel': '英語に切り替え',
    'app.footer': '🔗 GitHubリポジトリーはこちら（',
    'app.footerEnd': '）',
    'input.label': '入力テキスト',
    'input.placeholder': 'ここに平文またはROT47の文を入力',
    'sample.plain': 'サンプル: Hello World! 123',
    'sample.cipher': 'サンプル: ROT47の文',
    'live.label': '入力に合わせて変換する',
    'convert': '🔁 変換する',
    'output.label': '出力テキスト',
    'copy': '📋 コピー',
    'setInput': '⬆ 入力テキストにセット',
    'status.copied': 'クリップボードにコピーしました。',
    'status.copyFailed': 'コピーできなかったので、出力を選択しました。Ctrl+C（Macは⌘+C）でコピーしてください。',
    'status.nothing': 'コピーする出力がありません。先に変換してください。',
    'status.set': '出力を入力テキストに移して変換しました。出力は元の文に戻っています。',
    'status.setNothing': 'セットする出力がありません。',
    'stats.line': '変換した文字: {changed}・そのままの文字: {kept}（空白・改行・日本語などはROT47の対象外）',
    'stats.fullWidth': '全角の英数字・記号が{count}文字あります。ROT47が変換するのは半角（ASCII）の文字だけです。',
    'help.open': 'ヘルプを開く',
    'help.close': '閉じる',
    'help.title': '📖 ヘルプ',
    'help.s1.h': '🔐 ROT47とは',
    'help.s1.p': 'ASCIIの可視文字94文字（「!」から「~」まで）を、47文字ずつずらして置き換える方法です。47は94のちょうど半分なので、もう一度同じ変換をすると元の文に戻ります。',
    'help.s2.h': '🧭 使い方',
    'help.s2.p': '入力テキストに文を入れて「変換する」を押します。ROT47の文を入れて同じ操作をすると、元の文に戻ります。「入力テキストにセット」を押すと、出力を入力に移して変換し直します。',
    'help.s3.h': '⚠️ 暗号ではありません',
    'help.s3.p': 'ROT47には鍵がなく、仕組みを知っていればだれでも元に戻せます。ネタバレ防止のような「うっかり読ませない」用途向けで、パスワードや個人情報の保護には使えません。',
    'help.s4.h': '🔒 このツールの動作',
    'help.s4.p': '変換はすべてブラウザーの中で行い、入力した文をどこへも送りません。'
  };

  const en = {
    'app.title': 'QuickROT47 - ROT47 Encoder/Decoder',
    'app.subtitle': 'A ROT47 tool that shifts the printable ASCII characters by 47',
    'app.langButton': '日本語',
    'app.langLabel': 'Switch to Japanese',
    'app.footer': '🔗 GitHub repository (',
    'app.footerEnd': ')',
    'input.label': 'Input text',
    'input.placeholder': 'Type plain text or ROT47 text here',
    'sample.plain': 'Sample: Hello World! 123',
    'sample.cipher': 'Sample: ROT47 text',
    'live.label': 'Convert as I type',
    'convert': '🔁 Convert',
    'output.label': 'Output text',
    'copy': '📋 Copy',
    'setInput': '⬆ Use as input',
    'status.copied': 'Copied to the clipboard.',
    'status.copyFailed': 'Could not copy, so the output is selected. Press Ctrl+C (Cmd+C on a Mac) to copy it.',
    'status.nothing': 'There is no output to copy. Convert some text first.',
    'status.set': 'The output was moved into the input and converted, so the output is back to the original text.',
    'status.setNothing': 'There is no output to use.',
    'stats.line': 'Converted: {changed}, left as they are: {kept} (spaces, line breaks and non-ASCII text are not part of ROT47)',
    'stats.fullWidth': 'The text has {count} full-width letters, digits or symbols. ROT47 converts only half-width (ASCII) characters.',
    'help.open': 'Open help',
    'help.close': 'Close',
    'help.title': '📖 Help',
    'help.s1.h': '🔐 What is ROT47?',
    'help.s1.p':
      'ROT47 replaces each of the 94 printable ASCII characters (from ! to ~) with the one 47 places further on. Because 47 is exactly half of 94,' +
      ' applying the same conversion again gives the original text back.',
    'help.s2.h': '🧭 How to use it',
    'help.s2.p':
      'Type text into the input and press "Convert". Convert ROT47 text the same way to read it. "Use as input" moves the output into the input and' +
      ' converts it again.',
    'help.s3.h': '⚠️ Not encryption',
    'help.s3.p':
      'ROT47 has no key; anyone who knows it can undo it. It suits "do not read this by accident" uses such as spoilers, not protecting passwords' +
      ' or personal data.',
    'help.s4.h': '🔒 What this tool does',
    'help.s4.p': 'Everything runs in your browser. Nothing you type is sent anywhere.'
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
