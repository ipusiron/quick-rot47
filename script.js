// ROT47変換関数
function rot47(str) {
  return str.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 33 && code <= 126) {
      return String.fromCharCode(33 + ((code + 14) % 94));
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
  outputEl.select();
  document.execCommand('copy');

  // トースト的通知（任意：alertで代用）
  alert('コピーしました！');
}
