// ROT47変換関数
function rot47(str) {
  return str.split('').map(char => {
    const code = char.charCodeAt(0);
    // ASCII可視文字範囲（33-126）の場合、47文字シフト
    if (code >= 33 && code <= 126) {
      // 47文字シフトして、94文字の範囲内でループ
      return String.fromCharCode(33 + ((code - 33 + 47) % 94));
    }
    return char;
  }).join('');
}

// ボタンから呼ばれる変換処理
function convertText() {
  const input = document.getElementById('inputText').value;
  const output = rot47(input);
  document.getElementById('outputText').value = output;
}

// コピー処理
function copyResult() {
  const outputEl = document.getElementById('outputText');
  const toast = document.getElementById('toast');
  
  // モダンなClipboard APIを使用（フォールバックあり）
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(outputEl.value).then(() => {
      showToast(toast);
    }).catch(() => {
      // フォールバック: 旧式の方法
      outputEl.select();
      document.execCommand('copy');
      showToast(toast);
    });
  } else {
    // 旧式ブラウザ対応
    outputEl.select();
    document.execCommand('copy');
    showToast(toast);
  }
}

// トースト表示関数
function showToast(toastEl, message) {
  if (message) {
    toastEl.textContent = message;
  }
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
    // デフォルトメッセージに戻す
    if (message) {
      setTimeout(() => {
        toastEl.textContent = 'クリップボードにコピーしました';
      }, 300);
    }
  }, 2000);
}

// 出力を入力欄にセットする処理
function setToInput() {
  const outputEl = document.getElementById('outputText');
  const inputEl = document.getElementById('inputText');
  const toast = document.getElementById('toast');
  
  inputEl.value = outputEl.value;
  showToast(toast, '入力テキストにセットしました');
}

// サンプルテキストをセットする処理
function setSampleText() {
  const inputEl = document.getElementById('inputText');
  inputEl.value = 'Hello World! 123';
}
