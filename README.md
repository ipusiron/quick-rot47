# QuickROT47 - ROT47変換ツール

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/quick-rot47?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/quick-rot47?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/quick-rot47)
![GitHub license](https://img.shields.io/github/license/ipusiron/quick-rot47)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://ipusiron.github.io/quick-rot47/)

---

## 📝 概要

**QuickROT47** は、ASCII可視文字（33〜126）を対象に47文字分ずらして変換する軽量暗号方式「ROT47」を、即座に体験できるシンプルなWebツールです。

平文・暗号文の相互変換をボタン1つで実行でき、教育用・学習用・デモンストレーション用として活用できます。

---

## 🚀 特徴

- ✅ ROT47による暗号化／復号をワンクリックで体験
- ✅ 入力欄・出力欄のシンプルな2カラム構成
- ✅ 複数行入力対応（メモや文章も変換可）
- ✅ コピー用ボタンつき
- ✅ ダークモード対応（※後日対応予定）

---

## 🌐 デモページ

👉 [https://ipusiron.github.io/quick-rot47/](https://ipusiron.github.io/quick-rot47/)

---

## 📸 スクリーンショット

> ![ダミー](assets/screenshot.png)  
>
> *ダミー*

---

## 🧪 ROT47とは？

ROT47は、ASCII文字（表示可能な範囲）を47文字分ローテーションさせて変換する簡易暗号方式です。
英字・数字・記号を含むため、ROT13よりも広範な文字を対象とできます。

暗号化も復号も**同じ処理をもう一度実行**することで元に戻ります。

---

## 📂 ディレクトリー構成

```
quick-rot47/
├── index.html # メインHTML
├── style.css # スタイル定義
├── script.js # ROT47変換処理
└── assets/
└── screenshot.png # 画面イメージ
```

---

## 📐 現在の仕様・デザイン案

### ✅ 実装仕様（v1.0）

| 項目         | 内容                                                                 |
|--------------|----------------------------------------------------------------------|
| ツール名     | QuickROT47                                                           |
| タイトル     | 🔐 QuickROT47 - ROT47変換ツール                                       |
| 入力欄       | `<textarea id="inputText">`：複数行入力に対応                         |
| 出力欄       | `<textarea id="outputText">`：変換結果表示、readonly属性あり         |
| ボタン構成   | 「変換する」「コピー」の2つのボタン                                 |
| 処理ロジック | ROT47を適用する変換処理（ASCII 33〜126範囲に対して）                |
| コピー機能   | 出力欄の内容をクリップボードにコピーする処理                         |
| レイアウト   | 中央寄せ、1カラム、モバイル対応（基本的なレスポンシブ）             |
| スタイル     | 明るい背景を基調としたシンプルUI（将来的にダークモード切替も検討）   |
| フッター     | GitHubリポジトリへのリンクを表示                                     |

---

### 🖥️ HTML構成（抜粋）

```html
<textarea id="inputText"></textarea>
<button onclick="convertText()">変換する</button>
<button onclick="copyResult()">コピー</button>
<textarea id="outputText" readonly></textarea>
```

---

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) をご覧ください。

---

## 🛠 このツールについて

本ツールは、「生成AIで作るセキュリティツール100」プロジェクトの一環として開発されました。 このプロジェクトでは、AIの支援を活用しながら、セキュリティに関連するさまざまなツールを100日間にわたり制作・公開していく取り組みを行っています。

プロジェクトの詳細や他のツールについては、以下のページをご覧ください。

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
