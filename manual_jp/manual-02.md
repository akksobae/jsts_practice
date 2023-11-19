# 概要

ここでは、 JavaScript で作った環境を TypeScript に変換して、
Anime.js を使った簡単な Web アニメーションの試作を再現してみる。

- [概要](#概要)
- [TypeScript の導入](#typescript-の導入)
- [JavaScript から TypeScript への変換とコンパイル](#javascript-から-typescript-への変換とコンパイル)
  - [main 関数の導入](#main-関数の導入)
  - [frame の null チェック](#frame-の-null-チェック)
  - [let, var, const の違い](#let-var-const-の違い)
  - [function の引数の型](#function-の引数の型)
- [webpack の導入](#webpack-の導入)
- [TypeScript コンパイル](#typescript-コンパイル)
- [まとめ](#まとめ)
- [参考文献](#参考文献)

# TypeScript の導入

TypeScript のインストールは、 npm 経由で実現できる。

```
npm install -g typescript
```

`-g` はグローバル環境へのインストールを意味するオプションである。
最終的には JavaScript に変換するので、
TypeScript 自体はグローバル環境で実行できるようにしておこう。


次に、コンフィグファイルを生成するために、以下のコマンドを実行する。

```
tsc --init
```

これで `tsconfig.json` ができたはずである。


# JavaScript から TypeScript への変換とコンパイル

`script.js` の名前を `script.ts` に変えて、編集していこう。
変換した時点では以下のようになっているはずだ。

```typescript
var frame = document.getElementById('frame')
var originalColor = "rgb(48, 48, 128)"
var highlightColor = "rgb(128, 48, 48)"

function AnimeChangeColor(color) {
    anime({
        targets: frame,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}

frame.addEventListener('mouseover', () => {
    AnimeChangeColor(highlightColor)
});

frame.addEventListener('mouseout', () => {
    AnimeChangeColor(originalColor)
});
```

ここで、修正しなければならない問題が3つある。

* **color (function の引数) に型がない。** TypeScript は型付きなので、関数の引数には型をつけてやるべきだ。というか、そうしないなら TypeScript にする意味がない。
* **frame が null かもしれない。** frame の null チェックをしないと、それを指摘するエラーが出てしまう。
* **エラー時の終了処理が書けない。** null チェックをするのはいいが、チェック後にエラー終了させることができない。

というわけで、順番に問題を解決していこう。

## main 関数の導入

後ろから順番にいこう。
エラー終了させるためには、基本的には例外を投げるべきだ。
あるいは、 main() 関数で括って return させるのが良いだろう。
後者の対策ができるように、まずは地の文で書いていた処理を main で括ることにしよう。

```typescript
function AnimeChangeColor(color) {
    anime({
        targets: frame,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}

function main() {
    var frame = document.getElementById('frame')
    var originalColor = "rgb(48, 48, 128)"
    var highlightColor = "rgb(128, 48, 48)"

    frame.addEventListener('mouseover', () => {
        AnimeChangeColor(highlightColor)
    });

    frame.addEventListener('mouseout', () => {
        AnimeChangeColor(originalColor)
    });
}

main()
```

これで、 main 関数に return を書けるようになった。
忘れずに main 関数をコールする `main()` も書いておく。

おっと、 `frame` を `main` で括ってしまったので、
`AnimeChangeColor` のスコープ外になってしまっている。
引数に `element` を追加して、 `frame` を受け渡しできるようにしよう。

```typescript
function AnimeChangeColor(element, color) {
    anime({
        targets: element,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}

function main() {
    var frame = document.getElementById('frame')
    var originalColor = "rgb(48, 48, 128)"
    var highlightColor = "rgb(128, 48, 48)"

    frame.addEventListener('mouseover', () => {
        AnimeChangeColor(frame, highlightColor)
    });

    frame.addEventListener('mouseout', () => {
        AnimeChangeColor(frame, originalColor)
    });
}

main()
```

## frame の null チェック

VScode なら、 `document.getElementById` をマウスオーバーすると、
そのシグネチャ(どんな型を引数に取り、どんな型を返すのか)を確認できる。
返り値の型は `HTMLElement | null` となっているので、
null チェックが必要だ。

というわけで、 if 文で簡単に null チェックをすることにしよう。

```typescript
function main() {
    var frame = document.getElementById('frame')
    if (frame == null) {
        console.error("frame not found.")
        return
    }
    var originalColor = "rgb(48, 48, 128)"
    var highlightColor = "rgb(128, 48, 48)"

    frame.addEventListener('mouseover', () => {
        AnimeChangeColor(frame, highlightColor)
    });

    frame.addEventListener('mouseout', () => {
        AnimeChangeColor(frame, originalColor)
    });
}
```

これでチェックはできるが、もし null だった場合にエラー内容が分からないのは困る。
なので、 Console にエラーメッセージを出して  return するのではなく、
例外を投げるようにしよう。

```typescript
var frame = document.getElementById('frame')
if (frame == null) {
    throw new Error("frame not found.");
}
```

これで OK だろうか？
実はこれでも問題がある。
というのも、 `var` で変数 frame を定義したばっかりに、
frame に null が再代入される可能性があるからだ。
なので、コンパイルしようとすると以下のように怒られる。

```
Argument of type 'HTMLElement | null' is not assignable to parameter of type 'HTMLElement'.
```

これを防ぐには、変数が再代入されないように、定数として定義してやればいい。
ついでに、他の var である必要がないものも const にしておこう。

```typescript
function AnimeChangeColor(element, color) {
    anime({
        targets: element,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}

function main() {
    const frame = document.getElementById('frame')
    if (frame == null) {
        throw new Error("frame not found.");
    }
    const originalColor = "rgb(48, 48, 128)"
    const highlightColor = "rgb(128, 48, 48)"

    frame.addEventListener('mouseover', () => {
        AnimeChangeColor(frame, highlightColor)
    });

    frame.addEventListener('mouseout', () => {
        AnimeChangeColor(frame, originalColor)
    });
}

main()
```

## let, var, const の違い

ここで、 JavaScript の変数定義の仕方３種類をまとめておく。

* 変数(再代入してもいいもの)
  * 再宣言できるもの: `var`
  * 再宣言できないもの: `let`
* 定数(再代入してはいけないもの): `const`

以上から、コードの保守上最も好ましいのは constで、
次に let, 最後に var ということになる。

var で宣言してしまうと、予期せず同じ名前で変数を再宣言して上書きする、ということが起きうる。
なので、変数を宣言したい場合はなるべく let にした方が良さそうだ。
例えば、二重 for ループを書いたりして、繰り返し変数の i を再宣言するようなことも防げる
(普通は起こらないけど、ループをコピペするとそういうことが起きうる、かもしれない)。

## function の引数の型

`AnimeChangeColor()` 関数の引数に型を指定していこう。
element は、先程見たように HTMLElement を指定する。
color は、一般的には文字列型 string を指定すればいいようだ。

```typescript
function AnimeChangeColor(element: HTMLElement, color: string) {
    anime({
        targets: element,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}
```

呼び出し側の frame の型は `HTMLElement | null` だったが、
null チェックのおかげで `HTMLElement` として渡せるようになっている。

これで TypeScript のコードは完成だ。

最後に、コードの全体をもう一度再掲しておこう。

```typescript
import anime from "animejs"

function AnimeChangeColor(element: HTMLElement, color: string) {
    anime({
        targets: element,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}

function main() {
    const frame = document.getElementById('frame')
    if (frame == null) {
        throw new Error("frame not found.");
    }
    const originalColor = "rgb(48, 48, 128)"
    const highlightColor = "rgb(128, 48, 48)"

    frame.addEventListener('mouseover', () => {
        AnimeChangeColor(frame, highlightColor)
    });

    frame.addEventListener('mouseout', () => {
        AnimeChangeColor(frame, originalColor)
    });
}

main()
```

# webpack の導入

index.html から Anime.js を参照する際に、
前回は、 npm install で取ってきた Anime.js のローカルファイルパスを無理やり指定した。
今回は、もう少しまともに参照できるようにしたい。

TypeScript 用のコンパイラ(トランスパイラ)として、 tsc というのがある。
tsc でコンパイルすれば、その js が animejs を
参照してくれるようにはなっていないのだろうか？
どうも、 tsc は単なるコンパイラでしかないようで、
JavaScript を TypeScript に変換するということしかやってくれないようだった。

方法はいくつかあるようだが、
ここでは webpack というのを使うことにしてみる。
webpack というのは「モジュールバンドラー」と呼ばれているらしく、
要は複数のモジュール(Anime.jsとか)をまとめて一つにする(バンドルする)ものらしい。

つまり、ここで書いた script.js と Anime.js のモジュールを一つにまとめてくれるはずだ。

まず、 npm でインストールしよう。コマンドは以下の通りだ。

```
npm install --save-dev ts-loader webpack-cli
```

webpack はあくまで開発用に使うだけなので、
オプションには `--save-dev` をつける。

また、 TypeScript を使うには ts-loader というローダーが必要だそうで、これもインストールしている。
これは、 JavaScript 以外の要素を JavaScript として扱うためのアダプターのようなものらしい。
ts-loader の場合は、 TypeScript をロードして JavaScript に変換し、 webpack に渡すものとなる。
内部的には tsc という TypeScript 用のコンパイラが動いているそうだ。

使用するにはコンフィグファイルが必要らしいので、
以下のコンフィグファイル `webpack.config.js` も作ろう。

```javascript
const path = require('path');

module.exports = {
  entry: './src/script.ts',  // TypeScriptエントリーポイント
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'script.js',  // 出力ファイル名
    path: path.resolve(__dirname, 'dist'),
  },
};
```

これを作るに当たって、ディレクトリ構造を少し変更した。
`script.ts` はルートではなく `src` ディレクトリの下に置くことにする。
また、`dist` ディレクトリも同時に作成しておく。
`src` をコンパイルして、 `dist` に成果物が生成される、という流れになるようにしよう。

# TypeScript コンパイル


それでは、設定も終わったところで、実際にコンパイルしてみよう。
コマンドは以下。

```
npx webpack
```

だが、どうもすんなりいかず、エラーを吐いてくる。

```bash
WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

ERROR in .\jsts_practice\02_typescript\src\script.ts
[tsl] ERROR
      TS18002: The 'files' list in config file 'tsconfig.json' is empty.
ts-loader-default_e3b0c44298fc1c14

ERROR in .\jsts_practice\02_typescript\src\script.ts
Module build failed (from .\jsts_practice\02_typescript\node_modules\ts-loader\index.js):
Error: error while parsing tsconfig.json
    at Object.loader (.\jsts_practice\02_typescript\node_modules\ts-loader\dist\index.js:17:18)

webpack 5.88.2 compiled with 2 errors and 1 warning in 371 ms
```

どうも、 tsconfig.json というのが無いことを怒っているようだ。

調べたところ、 tsconfig.json は `tsc --init` というコマンドで生成できるようだ。
実際に実行してみると、大量のコメントアウトされた json ファイルができあがる。

```json
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */
    [...(100行くらい省略)]
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  }
}
```

もうひとつ、mode option が無いという warning も出ている。
これは package.json に、 webpack を使ってコンパイルする旨を書けばいいらしい。
以下のように、 `scripts` の項目を書き加える。

```json
{
  "dependencies": {
    "@types/animejs": "^3.1.7",
    "animejs": "^3.2.1"
  },
  "devDependencies": {
    "@webpack-cli/generators": "^3.0.7",
    "ts-loader": "^9.4.4",
    "webpack-cli": "^5.1.4"
  },
  "scripts": {
    "dev": "webpack --mode development",
    "build": "webpack --mode production"
  }
}
```

こうすることで、以下の2つのコマンドとモードでコンパイルができるようになる。

* `npm run dev`: 開発モード
* `npm run bulid`: 公開(本番)モード

実際に、 `npm run dev` でコンパイルしてみると、
dist ディレクトリ下に script.js ができているのを確認できる。

最後に、 index.html を書き換えて、 dist/script.js を参照するようにしてみよう。
anime.js への参照も削除する。

```html
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="utf-8">
    <title>練習</title>
    <meta name="description" content="HTML 練習">
    <meta name="keywords" content="HTML">
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div id="frame" class="frame"> </div>
    <script src="dist/script.js"></script>
</body>

</html>
```

これで一章でやったことが、 TypeScript で再現できていると思う。
index.html を開いて、正方形の上にマウスを持っていくと赤色になり、
マウスを外すとまた藍色に戻るというアニメーションが再現されるはずだ。

# まとめ

本章では、 TypeScript を導入して、
JavaScript を TypeScript に変換してみた。
また、そのコードを Anime.js のパッケージとバンドルする webpack を導入し、
TypeScript で書かれたアニメーションコードを実際に動かしてみた。

現在のツリー構造は以下のようになっている。

```tree
.
├── index.html
├── style.css
├── src
│   └── script.ts
├── package.json
├── package-lock.json
├── webpack.config.js
├── tsconfig.json
└── dist
    └── script.js
```

次章からは、ここで培った技術を使い、
実際に紫微斗数という占いの命盤を操作する簡単な Web ページを作成していこう。

# 参考文献

* YYTypeScript, ["サバイバル TypeScript"](https://typescriptbook.jp/) -- accessed on 2023/09 

