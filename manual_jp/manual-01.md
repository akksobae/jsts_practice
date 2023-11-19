# 概要

ここでは、 JavaScript の実行環境である Node.js をインストールして、
Anime.js を使って簡単な Web アニメーションを試作する。

- [概要](#概要)
- [JavaScript の導入 (Node.js)](#javascript-の導入-nodejs)
- [Anime.js の導入](#animejs-の導入)
- [WEB ページの準備](#web-ページの準備)
  - [index.html](#indexhtml)
  - [style.css](#stylecss)
- [WEB アニメーションの試作 (script.js)](#web-アニメーションの試作-scriptjs)
- [まとめ](#まとめ)
- [参考文献](#参考文献)


# JavaScript の導入 (Node.js)

JavaScript を PC でどうやって実行するか。
昔は「ブラウザで実行すれば良いでしょ」というかそれしか方法が無かったが、
最近は Node.js という実行環境(runtime)でそれができるらしい。

* Node.js: https://nodejs.org/ja

Node.js 自体の概要については、
Qiita の 「[Node.jsとはなにか？なぜみんな使っているのか？](https://qiita.com/non_cal/items/a8fee0b7ad96e67713eb)」 の記事がわかりやすかった。

記事にある通り、私は Node.js を Web サーバーか何かと勘違いしていたが、そうではない。
`python xyz.py` とやれば python コードが動くように、
`node xyz.js` とやれば JavaScript コードが動くようにしたものが、　Node.js だそうだ。

おまけに、パッケージ管理ツールである npm までついてくる。
python でいうところの `pip` のように、
Ubuntu でいうところの `apt` のように、
便利なものを公開している人がいたら `npm instaxx xyz` とすればインストールできる。

では、これを使って早速 Web アニメーションを試作していこう。

# Anime.js の導入

JavaScript でアニメーションをしようとすると、
既存のパッケージが多く見つかる。
それらは詳しくないので、とりあえず、
容量が小さくて他のものへの依存がなさそうな Anime.js を使うことにした。

以下のコマンドで Anime.js をインストールできる。

```bash
npm install animejs
```

これを実行すると、**ローカルディレクトリ下に**パッケージがインストールされる。
具体的には、 `node_modules` というディレクトリが作られて、そこにインストールされる。
グローバルにインストールされる訳ではないので注意しよう。
逆に言うと、 pip のように、グローバルにインストールしまくったせいで、
開発環境用のライブラリの依存関係が分からなくなるということはデフォルトで防げる。

ついでに、パッケージ管理システムとして、
`package.json` や `package-lock.json` も作られる。
これらは、自身のパッケージが何のパッケージに依存しているかを記述しているようだ。
今の時点では、とりあえず自動生成に任せておこう。

# WEB ページの準備

アニメーションを実行するために、
先ずは簡単な web ページを作っていこう。

## index.html

HTML ファイルとして、以下のような `index.html` を作ってみよう。

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
    <script src="node_modules/animejs/lib/anime.min.js"></script>
    <script src="script.js"></script>
</body>

</html>
```

divタグ一個の、極めて単純な構造の HTML ファイルだ。

これはあくまで例なので、実際には好きな HTML ファイルを作ってもらって構わない。
ただ、 `<body>`タグと`<link>`タグ (CSS の参照) の中身は同じようにしておこう。

注意点として、 node_modules の anime.js ライブラリを直接参照しているが、
これは本番環境では適用できない。
あくまで今回の練習用としての方法で、
本番環境で使うべき(らしい) webpack を使った方式は次章で説明する。

## style.css

次は、 `style.css` という CSS を作ろう。

```css
body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.frame {
    background-color: rgb(48, 48, 128);
    height: 20vmin;
    width: 20vmin;
}
```

これで、 div 要素が藍色の正方形として表示されるようになる。

昔からそうだったのか最近のはやりなのかは知らないが、
div 要素を HTML で定義して、
CSS で見た目を(完全に)制御するというのが、
今流行の WEB ページ構築スタイルのようだ。
あるいは、 Figma の自動生成 WEB を見たからそう思い込んでいるだけかもしれないが。


# WEB アニメーションの試作 (script.js)

最後に、以下のような JavaScript コードを `script.js` として書こう。

```javascript
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

詳細は割愛するが、これで正方形の上にマウスを持っていくと赤色になり、
マウスを外すとまた藍色に戻るというアニメーションが実現できる。

これだけでも分かる人は、 mouseover のイベントを変えてみたり、
hightlightColor の色を変えてみたりすると、
どのようなときに何色になるかも自分で設定することができる。
もちろん、色を変えるだけでなく、大きさや位置を動かすこともできる。


# まとめ

とりあえず試作として、ごく簡単なアニメーションを表示する WEB ページを作ってみた。
次は、 HTML やアニメーションを工夫していく前に、環境構築をしていこう。
具体的には、
JavaScript 環境を TypeScript 環境にしたり、
今回ローカルファイルを無理やり指定した Anime.js をもうちょっとまともに参照したりする
方法を学んでいこう。

余談だが、 BingAI にはお世話になった。
JavaScript や CSS 周りは文献が多いのか、
自動コード生成でもかなりの精度で正しく動く WEB ページや CSS のコードを教えてくれた。


# 参考文献

* ["Node.js"](https://nodejs.org/ja)
* non_cal, ["Node.jsとはなにか？なぜみんな使っているのか？"](https://qiita.com/non_cal/items/a8fee0b7ad96e67713eb) -- Qiita, 2023/05
* Hiroki Matsumoto, ["【npm初心者】なんんとなく使っていた npm install の --save-dev ついて調べてみた"](https://zenn.dev/hrkmtsmt/articles/5f4a0e5c79b77a) -- Zenn, 2022/01
* 七転び八重子, ["【アニメーション特集 -5】JavaScriptアニメーションライブラリまとめ（2021年2月版）"](https://fastcoding.jp/blog/all/info/animation-5/) -- FASTCODING BLOG, 2021/02
* 池田 泰延, ["現場で使えるアニメーション系JSライブラリまとめ"](https://ics.media/entry/14973/) -- ICS MEDIA, 2023/07