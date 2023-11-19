# 概要

ここでは、これまで作ってきた GUI モデルに MVVM (Model-View-ViewModel) パターンを導入する。
テストもできるようにする。というか、 TDD (テスト駆動開発) も導入しながら進めていく。

- [概要](#概要)
- [MVC/MVVM の解説](#mvcmvvm-の解説)
  - [MVC モデル](#mvc-モデル)
    - [View へのドメインロジックの侵入](#view-へのドメインロジックの侵入)
    - [View の肥大化](#view-の肥大化)
    - [Controller の肥大化](#controller-の肥大化)
    - [View と Controller の相互依存](#view-と-controller-の相互依存)
  - [MVVM モデル](#mvvm-モデル)
- [JEST の導入](#jest-の導入)
- [宮選択機能](#宮選択機能)
  - [ViewModel テスト](#viewmodel-テスト)
    - [LifeBoardViewModel の定義](#lifeboardviewmodel-の定義)
    - [PalaceViewModel の定義](#palaceviewmodel-の定義)
    - [PalaceViewModel の実装](#palaceviewmodel-の実装)
- [まとめ](#まとめ)

# MVC/MVVM の解説

前章で作成した script.ts に MVVM (Model-View-ViewModel) パターンを導入する。

まず、 MVVM について解説したいところだが、専門知識があるわけではないため、
私が認識している範囲で簡単に説明する。

## MVC モデル

MVVM より先に、 GUI を考慮したモデルとして MVC (Model-View-Controller) があった。
まず Model というのはドメインロジックとかビジネスロジックと呼ばれるが、
要は見た目や操作インターフェース等を除いた、純粋な機能部分のことだ。
おそらく業務用プログラムが想定されることが多いので、ビジネスロジックと言われることが多い。
ドメイン駆動設計という分野の背景で、この部分は特別に「ドメイン」とも呼ばれる
(更に、ドメインをどのように定義するかのノウハウやテクニックもある)ので、ドメインロジックとも呼ばれる。

次に、これを操作するのが Controller だと思ってみることにしよう。
CLI (コマンドラインインターフェース) プログラムを書くときの呼び出し方のようなものだ。
例えば、 ls と書けばファイルの一覧が見れる。
この「ls」が操作用のインターフェース、 Controller に当たる。
しかし、実際には Model としてファイルの一覧を取得してくるコードが内部にあるはずである。

最後に、 View は見た目を制御する部分である。
ここで、ボタンを押すと Controller の操作インターフェースを叩くようにプログラムすれば、
CUI プログラムを GUI プログラムに簡単に再設計できる。
例えば、「ファイル一覧表示」というボタンがあれば、それをクリックすると「ls」コマンドが呼び出され、
lsコマンドの中身の Model が実行される、というような具合である。

多分この MVC の認識は正しくないが、私のイメージとしてはこんな感じである。

### View へのドメインロジックの侵入

さて、この MVC モデルの何が問題なのかというと、
**View にドメインロジックが紛れ込む**という問題が起きる。

CLI としての ls コマンドは空白区切りの文字列としてファイル名一覧を出力する。

しかし、 View、つまり例えば普通のウィンドウにどのようにファイル名一覧を表示すればいいだろうか。

例えば、単純に文字列の一覧としてリストボックスに表示してやるかもしれない。
あるいは、ファイルの拡張子ごとにアイコンをつけてきれいにリスト表示してやるかもしれない。

ここで、「Model には文字列を取得する機能しかなかったから、アイコンを読み込む機能を View 側に加えた」というような対応をしてしまうと、
アイコンを読み込む機能のコードは、 View と一緒でなければ動かないということになる。

これが「View にドメインロジックが侵入する」等の呼び方をされた状態である。
アイコン読込機能は View と一緒でなければ動かない。
こういう「何かと一緒でなければ動かない」ような機能を書いたコードは、
一般的に**再利用性が低く、テストもしづらい**。
特に、その「何か」が GUI やユーザのアクションが必要となるコードの場合は、
その機能を使うために当然 GUI やユーザのアクションが必要なので、非常に使いづらい。

### View の肥大化

他にも、現代ではゲームのようにグラフィカルな GUI も多い。

ファイル名一覧を管理する GUI が、ファイル名を監視しておいて、
ファイルが追加されたらアニメーションとともにアイコンと文字列が浮かび上がってくる、
というような(無駄に)豪華な GUI を考えてみよう。

ファイルの監視やアニメーションは、「View の実装に必要な機能だから」と思って View に追加していくと、
View がどんどん肥大化していく。
もちろん、見た目を制御するアニメーションの実装は View 側の責任なのだが、
ファイル監視やアニメーション用のパラメータ制御等は、 Model 側の責任とすべき部分もある。

ファイル監視は直感的に Model 側の責任だと再認識できるかもしれないが、
アニメーション用のパラメータ制御とはなんだろうか。
例えば、ファイル拡張子に応じてアニメーションの仕方を変えたい場合は、これも Model に当たるだろう。
その理由は、これもテスト可能性で判断してみるとわかりやすい。
もし拡張子に応じたアニメーションの選択が View に入っていると、
「この拡張子のときに、ちゃんとこのアニメーションタイプが指定されるか」という
**機能をテストできなくなってしまう**。
View は、「拡張子とアニメーションの紐づけ機能」を
**実装はせず呼び出すだけ**(それも Controller 経由)で、
そこで指定されたアニメーションを再生するだけに留めるべきだ。

### Controller の肥大化

では、 Controller にドメインロジックを入れればいいのではないか。
Controller の機能は基本的に CLI で表現可能なものなので、文字列一致比較でテストが書けるはずだ。

しかし、こうなると **Controller と Model の責任の範囲がややこしくなる**。
もし Controller にドメインロジックを入れることを許容すると、
「何の機能をどこに入れればいいのか」で混乱することになってしまう。
Controller は**基本的に Model の機能を「選んで呼び出す」だけに留めるべきだ**。

内部ロジックを覆い隠してシンプルに外部に公開する方法を Facade (ファサード)パターンと呼ぶが、
Controller は Facade となるように設計すべきである。
そして、 View はその Controller の機能を呼び出すだけで機能を実現できるようにして、
そこにグラフィック要素を追加するだけに留めるべきである。

### View と Controller の相互依存

更に別の問題として、 Controller 側が View の操作もやるようになると、更にややこしい問題が起きる。
実際にこれは必要なことで、例えば先程の ls コマンドの例で、
ファイル監視機能が Model 側にあるとすると、
ファイル変更検知イベントは Model 側から発生することになる。

これを View 側に伝えるためには、 Controller がその更新を通知することになるだろう。
すると、 View は Controller の機能を呼び出して GUI 機能を実現しつつ、
Controller は View の機能を呼び出して GUI の更新を実現する、ということになる。
この関係は、お互いがお互いを呼び出す**相互依存関係**である。

もし View や Controller にドメインロジックが紛れ込むと、
その機能をテストするためには**View と Controller どちらも必要**ということになる。
こうなると、単純に Controller が使いづらくなるだけでなく、
**コードの再利用性が失われ、テストもしづらい**という問題が起きる。

## MVVM モデル

という訳で、以下のような原則が分かった。

* MVC モデルだと、 View や Controller にドメインロジックが侵入しやすい。
* View や Controller にドメインロジックが紛れ込むと、肥大化し、機能の再利用性やテスト可能性で問題が起きる。
* View と Controller は相互依存関係になることが避けられないので、 View と Controller は機能的に可能な限りスリムであることが望ましい。

という訳で、View と Controller のスリム化を徹底するために
Controller の役目を徹底的に限定したのが ViewModel というものになる。

MVVM (Model-View-ViewModel) の Model と View は概念的には MVC のそれと同じだが、
ViewModel は「View と一体化した、 View のパラメータ的な複製」となるようにする。
まさしく、 View の Model である。

ViewModel は Controller としての役割を引き継いでいるので、
「GUI の操作」を何らかの関数として持っている。
例えば、 View の「ファイル一覧表示」というボタンを叩くことは、
ViewModel の「listFile」関数を呼ぶことと等しいかもしれない。

また、 ViewModel は View と一体化しているので、
ViewModel への変更は View への変更となるし、
View の変更は ViewModel への変更となる。
こうなるように ViewModel を設計することで、
相互依存関係にある View と ViewModel がシンプルに保たれる。

これを簡単に実現する仕組みとして、 DataBinding (データバインディング)等がある。
JavaScript/TypeScript だと React などのフレームワークがサポートしてくれているらしい。

再利用性やテスト可能性も優れている。
ViewModel はあくまでパラメータ的な View の複製なので、
View 側がどんなチープな見た目でも豪華な見た目でも関係なく、
そのパラメータを実装している View に対しては再利用できる。
また、 ViewModel をテストしてパラメータの変更が起きていることをテストすれば、
それとデータバインディングされている View のテストをすることになるため、テストも容易にできる
(もちろん、ちゃんとデータバインディングされているかは、 GUI を使ったテストが必要だが)。

以上の MVVM のコンセプトは、私なりの解釈なので、
一般的な解釈と合致しているか、そもそも正しいのかも不明だ
(正しい解釈を解説している web や本があれば誰か紹介してください)。


# JEST の導入

ともあれ、 MVVM で謳われている内容を考慮しつつ、
前章で書いた script.ts の ViewModel を作っていってみよう。

もちろん、テスト駆動開発を行うので、テストから始める。

まず、 JavaScript/TypeScript のテスト環境である JEST をインストールしよう。
[JESTの「はじめましょう」](https://jestjs.io/ja/docs/getting-started)と
[ts-jest のインストールページ](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/)を参考に、
Jestとその関連パッケージをインストールするコマンドは、以下の通りである。

```
npm install --save-dev jest ts-jest @types/jest ts-node
npm install --save-dev babel-jest @babel/core @babel/preset-env @babel/preset-typescript
```

次に、コンフィグファイルを初期化する。

```
npx ts-jest config:init
```

また、以下の内容の `babel.config.js` ファイルを作成する。

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};
```

これでテストができるようになったが、まだテストファイルが無い。

`test` ディレクトリ下に以下のようなテストファイル `script.test.ts` を用意しよう。

```
test('First test', () => {
    const a = 1
    expect(a).toBe(1)
})
```

必ず通るテストだ。
そして、 `npx jest` コマンドを実行してみる。

```
> npx jest
 PASS  test/script.test.ts
  √ First test (2 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.303 s
Ran all test suites.
```

`npx jest` は直接 jest を叩いてしまっているので、
`npm test` から呼べるように package.json の scripts に追加しておく。

```json
{
  [...],
  "scripts": {
    "dev": "webpack --mode development",
    "build": "webpack --mode production",
    "test": "jest"
  }
}
```

これで以降は `npm test` でテストを実行できるようになった。

これで JEST の準備は完了である。

# 宮選択機能

テストコードを含み、ここからは順番にやっていこう。
まず、宮選択機能について、テストを書き、
それが通るようなコードを実装していこう。

## ViewModel テスト

では、早速 ViewModel のテストコードを書こう。
ここでは、命盤の ViewModel を作るので、
LifeBoardViewModel という名前にしよう。
そして、その0番目の宮の選択状態を切り替える(toggle)テストを書いてみる。

```typescript
import {
    LifeBoardViewModel,
} from "../src/script";

test('Toggle selection of palace 0', () => {
    let vm = new LifeBoardViewModel()
    expect(vm.palaces[0].isSelected).not.toBeTruthy()
    vm.palaces[0].toggle()
    expect(vm.palaces[0].isSelected).toBeTruthy()
    vm.palaces[0].toggle()
    expect(vm.palaces[0].isSelected).not.toBeTruthy()
})
```

最初非選択状態にあり、次に toggle して選択状態になり、
最後にもう一度 toggle して非選択状態になるテストである。

最初の import は、 LifeBoardViewModel を script.ts からインポートするための文である。
(ちなみに、 babel をインストールしていないと、 import ができなくてエラー文が出る。
webpack を使えたら統一できて良さそうなのだが、やり方が不明なので使えるものは使っていく。)

### LifeBoardViewModel の定義

`src/script.ts` 中で LifeBoardViewModel を定義しよう。

```typescript
export class LifeBoardViewModel { }
```

これがクラス定義の最小限の形である。
export とつけると、この script.ts ファイル外でも利用可能なクラスということになる。
テストファイル `test/script.test.ts` に読み込ませる上で必要だ。

一歩ずつ進むとして、ひとまずこれでもう一度 `npm test` してみよう。

```console
 FAIL  test/script.test.ts
  ● Test suite failed to run

    test/script.test.ts:7:15 - error TS2339: Property 'palaces' does not exist on type 'LifeBoardViewModel'.

    7     expect(vm.palaces[0].isSelected).not.toBeTruthy()
                    ~~~~~~~
[...]
Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        1.314 s, estimated 2 s
Ran all test suites.
```

当たり前だが、 palaces メンバー変数が存在しないと怒られている。
追加しよう。

```typescript
export class LifeBoardViewModel {
    palaces: any[]
    
    constructor() {
        this.palaces = []
    }
}
```

TypeScript では、このような形で型付きメンバー変数を定義する。
palaces に該当する型(クラス)をまだ用意していないので、仕方なく `any[]` にしている。

`constructor()` は文字通りコンストラクターであり、
LifeBoardViewModel クラスが初期化されるときに読み込まれる関数である。
palaces の初期化ができないので、とりあえず配列を与えてみている。

これでもう一度 `npm test` してみよう。

```console
 FAIL  test/script.test.ts
  × Toggle selection of palace 0 (2 ms)

  ● Toggle selection of palace 0

    TypeError: Cannot read properties of undefined (reading 'isSelected')
    
       5 | test('Toggle selection of palace 0', () => {
       6 |     let vm = new LifeBoardViewModel()
    >  7 |     expect(vm.palaces[0].isSelected).not.toBeTruthy()
         |                          ^
[...]
```

案の定、今度は宮を表す `palaces[]` に `isSelected` 変数が無いと言われた。

### PalaceViewModel の定義

では、同じ要領で PalaceViewModel というクラスを用意してみよう。
後々 toggle() が無いと言われるのも確実なので、それも追加しておく。

```typescript
export class PalaceViewModel {
    isSelected: boolean

    constructor() {
        this.isSelected = false
    }
    
    toggle() { }
}
```

これで LifeBoardViewModel の方の palaces 変数も初期化できるようになった。

```typescript
export class LifeBoardViewModel {
    palaces: PalaceViewModel[]
    
    constructor() {
        this.palaces = []
        for (let i = 0; i < 12; i++) {
            let palace = new PalaceViewModel()
            this.palaces.push(palace)
        }
    }
}
```

一足飛びに進んでしまったが(読者にとってはこれでもゆっくりに思われそうだが)、
これでもう一度テストをしてみよう。

```console
 FAIL  test/script.test.ts
  × Toggle selection of palace 0 (3 ms)

  ● Toggle selection of palace 0

    expect(received).toBeTruthy()

    Received: false

       7 |     expect(vm.palaces[0].isSelected).not.toBeTruthy()
       8 |     vm.palaces[0].toggle()
    >  9 |     expect(vm.palaces[0].isSelected).toBeTruthy()
         |                                      ^
```

これで静的型チェックのエラーからは解放された。

### PalaceViewModel の実装

最後に、 toggle の実装をしてしまおう。

```typescript
    toggle() {
        this.isSelected = !this.isSelected
    }
```

これでテストが通るようになる。

```console
 PASS  test/script.test.ts
  √ Toggle selection of palace 0 (2 ms)
```

この時点でのコード全体は以下のようになる。

```typescript
export class PalaceViewModel {
    isSelected: boolean

    constructor() {
        this.isSelected = false
    }

    toggle() {
        this.isSelected = !this.isSelected
    }
}

export class LifeBoardViewModel {
    palaces: PalaceViewModel[]

    constructor() {
        this.palaces = []
        for (let i = 0; i < 12; i++) {
            let palace = new PalaceViewModel()
            this.palaces.push(palace)
        }
    }
}
```

# まとめ

これでは単に内部的に boolean の値が切り替わっているだけで、
HTML 側の表示が変わるところまでコードが辿り着いていない。
そこに至れるようにテストをするにはどうすればいいだろうか？

一番直感的なのは、実際に index.html にこの LifeBoardViewModel を導入してテストすることだが、
それでは MVVM を採用した利点が損なわれてしまう。
ViewModel はどんなView に対しても一体化させていいのだから、
テストコードが書きやすいテスト用の View を作ることにしよう。

しかし、長くなってしまったので、 TestView を用いた MVVM の実装は次章に譲る。


