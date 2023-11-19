# 概要

前回は、 JEST の導入と TDD (テスト駆動開発) を進めるだけで終わってしまった。
今回は、 TestView を経由して MVVM (Model-View-ViewModel) パターンを導入していこう。

- [概要](#概要)
- [TestView を使ったテストの作成](#testview-を使ったテストの作成)
- [TestView の定義](#testview-の定義)
- [ViewModel の変更を View に伝えるアイデア(問題あり)](#viewmodel-の変更を-view-に伝えるアイデア問題あり)
  - [問題1: View の受け取り方](#問題1-view-の受け取り方)
  - [問題2: View の更新の仕方](#問題2-view-の更新の仕方)
  - [問題3: View の参照の仕方](#問題3-view-の参照の仕方)
- [データバインディング](#データバインディング)
  - [解決策1: bind](#解決策1-bind)
  - [解決策2: update](#解決策2-update)
  - [解決策3: Interface](#解決策3-interface)
- [実装とテスト](#実装とテスト)
- [まとめ](#まとめ)

# TestView を使ったテストの作成

TestView を作る前にまずテストを書く。
ただ、どんなものかは先に定義しておこう。

TestView は、実際には LifeBoardTestView と PalaceTestView から成ると想定する。
LifeBoardTestView は PalaceTestView を 12個持っている。
PalaceTestView は選択状態に応じてテキストが変わるとしよう。
ここでは、選択状態のときに "selected" になり、
非選択状態のときに "not selected" になるとする。

これを使って、 ViewModel の変更が View に反映されるようなテストを書いてみよう。

```javascript
test('Toggle selection of palace 0 of view', () => {
    let vm = new LifeBoardViewModel()
    let view = new LifeBoardTestView(vm)
    expect(view.palaces[0].selectedStatus).toBe("not selected")
    vm.palaces[0].isSelected = true
    expect(view.palaces[0].selectedStatus).toBe("selected")
    vm.palaces[0].isSelected = false
    expect(view.palaces[0].selectedStatus).toBe("not selected")
})
```

`vm.palaces[0].isSelected = true/false` で、
ViewModel の `isSeleted` が変更される。
このとき、 View 側の `PalaceTestView.selectedStatus` が "selected" に変わる。
この機能をテストしていこう。

# TestView の定義

`npm test` してみると、
テストはまず LifeBoardTestView と PalaceTestView が存在しないことを指摘する。

```console
error TS2304: Cannot find name 'LifeBoardTestView'.
```

なので、 ViewModel の実装をコピーするような形で、この２つのクラスを定義してみよう。

```javascript
class LifeBoardTestView {
    palaces: PalaceTestView[]
    n: number

    constructor(vm: LifeBoardViewModel) {
        this.palaces = []
        this.n = 12

        for (let i = 0; i < this.n; i++) {
            let palace = new PalaceTestView()
            this.palaces.push(palace)
        }
    }
}

class PalaceTestView {
    selectedStatus: string

    constructor() {
        this.selectedStatus = "not selected"
    }
}
```

これで `npm test` してみると、今度はテストが失敗する。

```console
 FAIL  test/script.test.ts
  √ Toggle selection of palace 0 (2 ms)
  × Toggle selection of palace 0 of view (3 ms)

  ● Toggle selection of palace 0 of view

    expect(received).toBe(expected) // Object.is equality

    Expected: "selected"
    Received: "not selected"

      58 |     expect(view.palaces[0].selectedStatus).toBe("not selected")
      59 |     vm.palaces[0].isSelected = true
    > 60 |     expect(view.palaces[0].selectedStatus).toBe("selected")
         |                                            ^
      61 |     vm.palaces[0].isSelected = false
```

初期状態が "not selected" にしたので１つ目の expect は通るが、
ViewModel の変更が反映されるようにしていないので、
2つ目の expect が通らない。

# ViewModel の変更を View に伝えるアイデア(問題あり)

ViewModel のパラメータの変更を View に反映したい。
この目標を達成するにはどうすればいいだろうか。

最も直感的な方法は、 ViewModel に View のインスタンスを持たせて、
そこで View の値を書き換える方法だ。
例えば、 PalaceViewModel を次のように実装することを考えてみよう。

```javascript

export class PalaceViewModel {
    _isSelected: boolean
    view: PalaceTestView

    constructor(view) {
        this._isSelected = false
        // (1) コンストラクターで view を受け取る
        this.view = view
    }

    // (2) 直接 isSelected を書き換えるかわりに getter/setter を使う
    get isSelected() {
        return this._isSelected
    }

    set isSelected(value: boolean) {
        this._isSelected = value
        // (3) value の set 時に、同時に view の値を書き換える
        if (value) {
            this.view.selectedStatus = "selected"
        } else {
            this.view.selectedStatus = "not selected"
        }
    }

    toggle() {
        this.isSelected = !this.isSelected
    }
}
```

コメントを記したように、主に3つのコード改変を行った。

1. まず、 ViewModel が View を触れるようにするために、
    コンストラクターで View を受け取れるようにした。
2. 次に、 isSelected を外部から書き換えたときの処理の内容を弄れるように、
    内部的には `_isSelected` (アンダーバー付き)の変数を持つようにして、
    getter/setter を経由して値の取得・変更を行えるようにした。
3. 最後に、 `isSelected` の書き換えが行われようとしたとき(setterが呼び出されたとき)、
    View の selectedStatus のテキストを変更するようにした。

ぱっと見動きそうと思えるコードだ。
ViewModel が View を触れるようになっているし、
`ViewModel.isSelected` が変更されたら `View.selectedStatus` が更新される、
という目標を達成できるようになっているように見える。

しかし、問題が3つある。

## 問題1: View の受け取り方

1つは、コンストラクターで View を受け取ろうとしているところだ。
そもそも、テスト側の ViewModel の初期化は、View よりも先なのだ。
見直してみよう。

```javascript
test('Toggle selection of palace 0 of view', () => {
    let vm = new LifeBoardViewModel()
    let view = new LifeBoardTestView(vm)
    // [...]
}
```

という訳で、 `let vm = new LifeBoardViewModel()` の引数に
`view` を与えることはできない。
別の方法を用意してやる必要がある。

## 問題2: View の更新の仕方

もう一つの問題は Setter にある。
ViewModel のクラスが、 View 固有のメンバー変数である 
selectedStatus にアクセスしてしまっている点だ。
「ViewModel のクラスが、 View の知識を持ってしまっている」という言い方もできる。

MVVM の考察で話をした通り、 View と ViewModel は相互依存関係にある。
しかし、それは「こういうコードを認めていい」という意味ではない。
ViewModel はドメインロジック側に近いコードなので、
View のことを知っておくべきではないのだ。

実際、今回は `selectedStatus` という文字列型の変数を持つテスト用の View を用意した。
しかし、最終的には元の実装に戻って、視覚的に宮の枠線が太くなるだけにしたいのだ。
そのとき、 setter のコードはどうなるだろうか？無理やりやるとしたら、以下のようになるだろう。

```javascript
set isSelected(value: boolean) {
    this._isSelected = value
    if (this.view instanceof PalaceTestView) {
        if (value) {
            this.view.selectedStatus = "selected"
        } else {
            this.view.selectedStatus = "not selected"
        }
    } else if (this.view instanceof PalaceHTMLView) {
        if (value) {
            // [...] // 宮の枠線を太くするアニメーションのコード
        } else {
            // [...] // 宮の枠線を細くするアニメーションのコード
        }
    }
}
```

このように、テスト用の View である PalaceTestView と、
本番の HTML 用の View (まだ定義していないが) である PalaceHTMLView の
両方の View について、 Setter が書くことになる。
また、未知の PalaceHogehogeView とかが出てきたら、
そのコードもこの if 文に追加しなければならない。

## 問題3: View の参照の仕方

更に悪いことに、クラスの参照の仕方にも問題がある。
というのも、 PalaceTestView の定義はテストコードで行っている。
そのため、 script.ts のロジックコードに書かれたクラス Palace ViewModel が、
テストコードを書いた script.test.ts 中の PalaceTestView に依存するように、
インポートを変更しなければならないだろう。

つまり、テストコードがロジックコードに依存するのは分かるが、
ロジックコードがテストコードに依存しなければならない。
明らかに依存関係の矢印が間違っているし、しかも相互参照になる。気持ち悪いことこの上ない。

# データバインディング

解決方法は無いだろうか。
例えば、なんとかして、

* **コンストラクター以外からViewのインスタンスを受け取りつつ、**
* **isSelectedに変更があったことだけをView側に伝えて、**
    **実際のViewの振る舞いはView側で定義する、**
* **加えて、script.tsやViewModelが具体的なViewのクラスを参照しないようにする、**

といったことができないだろうか。

これらを解決する方法が、一般にデータバインディングと呼ばれる方法となる。
(正確には、ここでやっているのは Observer パターンと言われるものの導入になる。)

## 解決策1: bind

1つ目の問題の解決策は意外と簡単で、
ViewModel が View を受け取るメソッドを別に用意してやればいい。

```javascript

export class PalaceViewModel {
    _isSelected: boolean
    view: PalaceTestView | null

    constructor() {
        this._isSelected = false
        this.view = null
    }

    // (1) bind メソッドで view を受け取る
    bind(view: PalaceTestView) {
        this.view = view
    }

    // [...]
}
```

bind メソッドの呼び出しは後でやるとして、
`PalaceViewModel.bind(View)` という形で呼び出せば、
ViewModel に View を渡すことができる。

ただし、コンストラクター呼び出し時点では null なので、
view 変数の型が `PalaceTestView` から `PalaceTestView | null` となっている。

## 解決策2: update

2つ目の解決策、つまり、 View の更新の仕方は少し工夫が要る。

まず、 setter の中身を以下のように変更する。

```javascript
set isSelected(value: boolean) {
    this._isSelected = value
    // (3) value の set 時に、同時に view を更新する
    if (this.view != null) {
        this.view.update(this)
    }
}
```

そして、 View 側に update という関数を用意して、
このときに ViewModel 自身を渡す。
これで、 ViewModel の状態に依存しつつ、
View の更新コードを View 側で定義できるようになった。

実際の PalaceTestView 側のコードは以下のようになる。

```javascript
class PalaceTestView {
    selectedStatus: string

    constructor() {
        this.selectedStatus = "not selected"
    }

    update(vm: PalaceViewModel) {
        if (vm.isSelected) {
            this.selectedStatus = "selected"
        } else {
            this.selectedStatus = "not selected"
        }
    }
}
```

## 解決策3: Interface

ロジックコードがテストコードに依存してしまって困る。
こういうときに使うのが依存関係逆転の原則であり、
その実現手段に Interface (インターフェース) がある。

今回、 ViewModel が求めているものが何かを見直そう。
ViewModel が View に求めているのは、とりあえず bind して自分と結びついてくれることと、
update を呼び出したときに適切に更新されてくれることだ。
更に突き詰めれば、 bind をどう呼び出すか、
update 時にどんなふうに更新されるかは実装依存であり、
ViewModel が本当に求めているのは「update メソッドを実装していること」だけだと分かる。

本当はテストコードを通じたリファクタリングでインターフェースの抽象を導き出していきたいところだが、
ここは一足飛びでインターフェースを定義しよう。

```javascript
export interface IUpdatableView {
    update(vm: any): void
}
```

IUpdatableView は update メソッドを定義したインターフェースである(IはInterfaceのI)。

そして、 PalaceViewModel は、
PalaceTestView の代わりに、この IUpdatableView に依存するように書き換える。

```javascript
export class PalaceViewModel {
    _isSelected: boolean
    view: IUpdatableView | null

    constructor() {
        this._isSelected = false
        this.view = null
    }

    // (1) bind メソッドで view を受け取る
    bind(view: IUpdatableView) {
        this.view = view
    }

    // [...]
}
```

更に、 PalaceTestView が、
IUpdatableView を実装するように書き換える。

```javascript
class PalaceTestView implements IUpdatableView {
    selectedStatus: string

    constructor() {
        this.selectedStatus = "not selected"
    }

    update(vm: PalaceViewModel) {
        if (vm.isSelected) {
            this.selectedStatus = "selected"
        } else {
            this.selectedStatus = "not selected"
        }
    }
}
```

これで、 PalaceViewModel はロジックコード中の IUpdatableView にのみ依存するようになり、
テストコードへの依存はなくなった。
そして、逆にテストコードが、ロジックコード中で定義された IUpdatableView という抽象に
依存するようになった。
これが依存関係逆転の原則の実践である。

# 実装とテスト

最後に、 bind を呼び出すコードを LifeBoardTestView に追加して、テストしよう。
コードの全体は以下のようになっている。

* **script.ts**

```javascript
export class LifeBoardViewModel {
    palaces: PalaceViewModel[]
    n: number

    constructor() {
        this.palaces = []
        this.n = 12

        for (let i = 0; i < this.n; i++) {
            let palace = new PalaceViewModel()
            this.palaces.push(palace)
        }
    }

}

export interface IUpdatableView {
    update(vm: any): void
}

export class PalaceViewModel {
    _isSelected: boolean
    view: IUpdatableView | null

    constructor() {
        this._isSelected = false
        this.view = null
    }

    // (1) bind メソッドで view を受け取る
    bind(view: IUpdatableView) {
        this.view = view
    }

    // (2) 直接 isSelected を書き換えるかわりに getter/setter を使う
    get isSelected() {
        return this._isSelected
    }

    set isSelected(value: boolean) {
        this._isSelected = value
        // (3) value の set 時に、同時に view を更新する
        if (this.view != null) {
            this.view.update(this)
        }
    }

    toggle() {
        this.isSelected = !this.isSelected
    }
}
```

* **scripts.test.ts**

```javascript
import {
    PalaceViewModel,
    LifeBoardViewModel,
    IUpdatableView,
} from "../src/script";


class LifeBoardTestView {
    palaces: PalaceTestView[]
    n: number

    constructor(vm: LifeBoardViewModel) {
        this.palaces = []
        this.n = 12

        for (let i = 0; i < this.n; i++) {
            let palace = new PalaceTestView()
            this.palaces.push(palace)
            vm.palaces[i].bind(palace)
        }
    }
}

class PalaceTestView implements IUpdatableView {
    selectedStatus: string

    constructor() {
        this.selectedStatus = "not selected"
    }

    update(vm: PalaceViewModel) {
        if (vm.isSelected) {
            this.selectedStatus = "selected"
        } else {
            this.selectedStatus = "not selected"
        }
    }
}

test('Toggle selection of palace 0 of view', () => {
    let vm = new LifeBoardViewModel()
    let view = new LifeBoardTestView(vm)
    expect(view.palaces[0].selectedStatus).toBe("not selected")
    vm.palaces[0].isSelected = true
    expect(view.palaces[0].selectedStatus).toBe("selected")
    vm.palaces[0].isSelected = false
    expect(view.palaces[0].selectedStatus).toBe("not selected")
})

```

テストの実行結果は以下のようになり、パスしていることが確認できる。

```console
$ npm test

> test
> jest

 PASS  test/script.test.ts
  √ Toggle selection of palace 0 (2 ms)
  √ Toggle selection of palace 0 of view

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.392 s
Ran all test suites.
```

# まとめ

コード量もかなり多くなってきたが、
段階を踏んで説明してきたから着いてきてもらえていれば幸いである。
もし着いてこれてなくても、とりあえずデータバインディングの仕組みを
一定の手順を踏んで導入できたことだけ把握してもらえていれば十分かと思う。
今後はこの仕組みを使ってテストや TestView を充実させていき、
命盤アニメーションの完成を目指す。
