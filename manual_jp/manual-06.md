# 概要

TestView を用いた MVVM (Model-View-ViewModel) パターン実装の続きに取り組む。

- [概要](#概要)
- [View イベント: 宮の選択](#view-イベント-宮の選択)
  - [テスト](#テスト)
  - [実装](#実装)
- [View イベント: 宮のマウスオーバー](#view-イベント-宮のマウスオーバー)
  - [テスト](#テスト-1)
  - [TestView の実装(1)](#testview-の実装1)
  - [ViewModel の実装(1)](#viewmodel-の実装1)
  - [アニメーションのためのデータバインディング再考](#アニメーションのためのデータバインディング再考)
  - [ViewModel の実装(2)](#viewmodel-の実装2)
  - [TestView の実装(2)](#testview-の実装2)
  - [ViewModel の実装(3)](#viewmodel-の実装3)
- [HTMLView での動作確認](#htmlview-での動作確認)
- [まとめ](#まとめ)

# View イベント: 宮の選択

## テスト

今度は、次のテストをこなしていく。

```javascript
test('Toggle selection of palace 0, 1 via view', () => {
    let vm = new LifeBoardViewModel()
    let view = new LifeBoardTestView(vm)
    vm.toggle_palace(0)
    expect(view.palaces[0].selectedStatus).toBe("selected")
    expect(view.palaces[1].selectedStatus).toBe("not selected")
    vm.toggle_palace(1)
    expect(view.palaces[0].selectedStatus).toBe("not selected")
    expect(view.palaces[1].selectedStatus).toBe("selected")
    vm.toggle_palace(1)
    expect(view.palaces[0].selectedStatus).toBe("not selected")
    expect(view.palaces[1].selectedStatus).toBe("not selected")
})
```

ViewModel の変数を変更するのではなく、
View で発生したイベントを処理する形にする。
View にはイベントリスナーに ViewModel のメソッド実行を登録するので、
ここでは ViewModel の toggle_palace というイベントハンドラ用メソッドを用意することにする。

このとき、宮0が最初に選択され、次に宮1が選択される。
最初に宮0が選択された後、宮0は選択状態になる。
次に、宮1が選択されたとき、宮1が選択状態になる。
同時に、選択状態の宮は一つしか認めないので、宮0が非選択状態になる。
最後に、宮1が再度選択されると、宮1が非選択状態になる。

## 実装

LifeBoardViewModel に toggle_palace を実装していく。

```javascript
export class LifeBoardViewModel {
    // [...]

    toggle_palace(i: number) {
        let nextState = !this.palaces[i].isSelected
        for (let j = 0; j < this.n; j++) {
            if (this.palaces[j].isSelected) {
                this.palaces[j].isSelected = false
            }
        }
        if (nextState) {
            this.palaces[i].isSelected = nextState
        }
    }
}
```

要領は [3. 命盤用の盤面の作成]() でやったのと同じだ。

# View イベント: 宮のマウスオーバー

## テスト

宮の選択が実装できたので、今度は宮のマウスオーバーを実装していく。
関係する宮が増えるので少し長くなるが、以下のようなテストをこなす。

```javascript
test('Mouse over palace 0, 1 via view', () => {
    let vm = new LifeBoardViewModel()
    let view = new LifeBoardTestView(vm)
    for (let i = 0; i < 12; i++) {
        expect(view.palaces[i].focusedStatus).toBe("not focused")

    }
    vm.focus_palace(0)
    expect(view.palaces[0].focusedStatus).toBe("focused")
    expect(view.palaces[4].focusedStatus).toBe("focused")
    expect(view.palaces[6].focusedStatus).toBe("focused")
    expect(view.palaces[8].focusedStatus).toBe("focused")
    vm.unfocus_palace(0)
    expect(view.palaces[0].focusedStatus).toBe("not focused")
    expect(view.palaces[4].focusedStatus).toBe("not focused")
    expect(view.palaces[6].focusedStatus).toBe("not focused")
    expect(view.palaces[8].focusedStatus).toBe("not focused")
    vm.focus_palace(1)
    expect(view.palaces[1].focusedStatus).toBe("focused")
    expect(view.palaces[5].focusedStatus).toBe("focused")
    expect(view.palaces[7].focusedStatus).toBe("focused")
    expect(view.palaces[9].focusedStatus).toBe("focused")
    vm.unfocus_palace(1)
    expect(view.palaces[1].focusedStatus).toBe("not focused")
    expect(view.palaces[5].focusedStatus).toBe("not focused")
    expect(view.palaces[7].focusedStatus).toBe("not focused")
    expect(view.palaces[9].focusedStatus).toBe("not focused")
})
```

マウスオーバー時の状態を "focused" (注目されている) と定義している。
マウスオーバー時には focus_palace が呼ばれ、
マウスアウト時には unfocus_palace が呼ばれる想定である。

テスト項目については、すでに説明済みの項目なので、説明を省略する。
一言だけ説明すると、宮0から宮1へ順番にマウスが動いている場合のテストである。

## TestView の実装(1)

これでテストすると、 focusedStatus が無いと怒られる。
PalaceTestView に focusedStatus の記述を加えよう。

```javascript
class PalaceTestView implements IUpdatableView {
    selectedStatus: string
    focusedStatus: string

    constructor() {
        this.selectedStatus = "not selected"
        this.focusedStatus = "not focused"
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

## ViewModel の実装(1)

PalaceViewModel に、 `_isSelected` と同様の実装を加えてみる。

```javascript
export class PalaceViewModel {
    _isSelected: boolean
    _isFocused: boolean

    // [...]

    get isFocused() {
        return this._isFocused
    }

    set isFocused(value: boolean) {
        this._isFocused = value
        if (this.view != null) {
            this.view.update(this)
        }
    }
}
```

ここで気づくことがある。
`this.view.update(this)` と呼び出してはいるものの、これでいいのだろうか。
ここで update を呼び出したときに何がおきるかというと、
(まだ実装していないが) isFucused 関連のアニメーションが起きることを期待していると同時に、
先に実装した isSelected 関連のアニメーションが起きることも期待している。

つまり、 isFocused のアニメーション実行のための update が、
isSelected のアニメーションも実行させてしまいかねないコードになっている。

これを避けるにはどうすればいいだろうか。

## アニメーションのためのデータバインディング再考

案は3つほどある。

* (1) 値別に update させたいのだから、 update の名前をそれぞれ別にする。例えば、 updateSelected と updateFocused を定義して、 View 側でも別々にこれらの update メソッドを実装する。
* (2) 宮の update なのだから、 update は一つに絞る。代わりに、 View 側で値の変更を管理できるようにコードを改造する。例えば、変更前の ViewModel と変更後の ViewModel を View 側に渡して、値の変更は View 側で管理するようにする。
* (3) update はバインドしたデータの update なのだから、 新しく「値が変化したこと」を表す変数を作り、それに対してデータバインディングすることを考える。例えば、 selectedStatusChanged と focusedStatusChanged という変数を作り、これに変化があったときに update が呼ばれるようにする。

振り返って考えると、 ViewModel は、言葉の通り View のモデルだ。
View の実情を反映していなければならない。
そして、 View の実情として、値に変化があったときにアニメーションをしてほしいと考えている。

だとすると、(1)のような方法や、今までテストで行ってきたような、
変化した値のスナップショットに関してデータバインディングするのは良い方法とは言えない。
(2)の方法で差分を見れるようにするか、
(3)の方法でアニメーションの契機に対してデータバインディングするのが良いように思われる。

(2)の方法はどうだろうか。
アニメーションはあくまで「View がどう描画するか」という View の責任の範疇だと考えるなら、
(2)の方法が適しているように思われる。
つまり、「変化する前後のスナップショットを渡してやるから、どう描画するか考えろ」という風に
View に責任転嫁してしまうのである。
しかし、責任転嫁するということは、
「スナップショットの変化を検知してアニメーションを発生させる」というロジックまで
View に含まれてしまうことになる。
View がテストしづらいことは言うまでもないので、このままではテストしづらい上に、
「２つの ViewModel の変更を検知する」という結構複雑そうなロジックが 
View に侵入してしまいかねない。

(3)についても、実際に実装したところを考えてみよう。
xxxStatusChanged は、アニメーションの実行前後で true/false が切り替わってしまうので、
愚直に実装するなら、アニメーションを実行する度に update がニ回呼ばれることになってしまう。
しかも、二回目の呼び出しのときは xxxStatusChanged は常に false なので、
アニメーションを実行する必要が無いにも関わらず update が呼び出されることになる。
それなら、そもそも update を呼び出すのが値の変化があったときになるようにした方が筋が良さそうだ。

こうして考えてみると、 (1) の方法が悪くないように思えてくる。
(1)の方法を採用して2つの update メソッドを定義しつつ、
値に変化があったときにだけ update を呼び出すようにする。

メソッドを別々に用意する代わりに、イベントハンドラを使えば、
より直感的に定義できると思いついたが、ここは以前の実装を踏襲し、
インターフェースを使う方針で拡張していこう。

## ViewModel の実装(2)

という訳で、インターフェースを含めて PalaceViewModel を以下のように書き換えよう。

```javascript
export interface IUpdatableView {
    updateSelectedStatus(vm: any): void
    updateFocusedStatus(vm: any): void
}

export class PalaceViewModel {
    _isSelected: boolean
    _isFocused: boolean
    view: IUpdatableView | null

    // [...]
    
    set isSelected(value: boolean) {
        this._isSelected = value
        if (this.view != null) {
            this.view.updateSelectedStatus(this)
        }
    }

    get isFocused() {
        return this._isFocused
    }

    set isFocused(value: boolean) {
        this._isFocused = value
        if (this.view != null) {
            this.view.updateFocusedStatus(this)
        }
    }
}
```

今まで update メソッドで済ませていた部分が、
二種類の update メソッド updateSelectedStatus と updateFocusedStatus になった。

## TestView の実装(2)

TestView の方も書き換えなければならない。

```javascript
class PalaceTestView implements IUpdatableView {
    selectedStatus: string
    focusedStatus: string

    constructor() {
        this.selectedStatus = "not selected"
        this.focusedStatus = "not focused"
    }

    updateSelectedStatus(vm: PalaceViewModel) {
        if (vm.isSelected) {
            this.selectedStatus = "selected"
        } else {
            this.selectedStatus = "not selected"
        }
    }

    updateFocusedStatus(vm: PalaceViewModel) {
        if (vm.isFocused) {
            this.focusedStatus = "focused"
        } else {
            this.focusedStatus = "not focused"
        }
    }
}
```

これで　selected と focused の更新を別々に扱えるようになった。

## ViewModel の実装(3)

次に通らないテストは、focus_palace が無いという内容になる。
そこで、 LifeBoardViewModel に以下のメソッドを加える。
一緒に unfocus_palace も追加しておいた。

```javascript
export class LifeBoardViewModel {
    // [...]

    focus_palace(i: number) {
        this.palaces[i].isFocused = true
        this.palaces[(i + 4) % this.n].isFocused = true
        this.palaces[(i + 6) % this.n].isFocused = true
        this.palaces[(i + 8) % this.n].isFocused = true
    }

    unfocus_palace(i: number) {
        this.palaces[i].isFocused = false
        this.palaces[(i + 4) % this.n].isFocused = false
        this.palaces[(i + 6) % this.n].isFocused = false
        this.palaces[(i + 8) % this.n].isFocused = false
    }
}
```

これでテストが通った。

# HTMLView での動作確認

テストが完璧とは言えないが、
ひとまず TestView を通じて実装したいことはすべて実装できた。

これを HTML 版の処理に直せば終わりだ。
[3. 命盤用の盤面の作成]() の処理を参考にしつつ書くと、以下のようになる。

```javascript
import anime from "animejs"

export class LifeBoardHTMLView {
    palaces: PalaceHTMLView[]
    n: number

    constructor(vm: LifeBoardViewModel) {
        this.palaces = []
        this.n = 12

        for (let i = 0; i < this.n; i++) {
            let palace = new PalaceHTMLView(i)
            palace.htmlElement.addEventListener("click", () => {
                vm.toggle_palace(i)
            })
            palace.htmlElement.addEventListener("mouseover", () => {
                vm.focus_palace(i)
            })
            palace.htmlElement.addEventListener("mouseout", () => {
                vm.unfocus_palace(i)
            })
            this.palaces.push(palace)
            vm.palaces[i].bind(palace)
        }
    }
}

export class PalaceHTMLView implements IUpdatableView {
    selectedStatus: string
    focusedStatus: string
    htmlElement: HTMLElement

    constructor(i: number) {
        this.selectedStatus = "not selected"
        this.focusedStatus = "not focused"

        const element = document.getElementById(`palace-${i}`)
        if (element == null) {
            throw new Error("palace not found.");
        }
        element.addEventListener("click", () => {

        })
        this.htmlElement = element
    }

    updateSelectedStatus(vm: PalaceViewModel) {
        if (vm.isSelected) {
            AnimeChangeBorder(this.htmlElement, "6px")
        } else {
            AnimeChangeBorder(this.htmlElement, "2px")
        }
    }

    updateFocusedStatus(vm: PalaceViewModel) {
        const originalColor = "rgb(234, 222, 239)";
        const highlightColor = "rgb(224, 202, 233)";
        if (vm.isFocused) {
            AnimeChangeColor(this.htmlElement, highlightColor)
        } else {
            AnimeChangeColor(this.htmlElement, originalColor)
        }
    }
}

function AnimeChangeBorder(element: HTMLElement, width: string) {
    anime({
        targets: element,
        borderWidth: width,
        duration: 200,
        easing: 'linear'
    })
}

function AnimeChangeColor(element: HTMLElement, color: string) {
    anime({
        targets: element,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}
```

コードは長くなってしまったが、構造はかなりすっきりしたと思う。

# まとめ

これ以降は、ボタンを押したら命盤が自動で設定される等の詳細に移っていくので、
今回の企画はこれで終わりにしようと思う。

全体としては、 JavaScript/TypeScript を導入し、
TDD をベースにした開発方式で MVVM を導入可能な下地を作っただけだが、
随分と長くなってしまった。
主に HTML 周りの開発環境が整備されなさすぎというのが問題だと思う。

今後は、今回開発したものをベースにして占いサイト的なものを書いていきたいと思う。
