// import anime from "animejs"

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

// export class PalaceViewModel {
//     _isSelected: boolean
//     view: IViewModelObserver | null

//     constructor() {
//         this._isSelected = false
//         this.view = null
//     }

//     bind(view: IViewModelObserver) {
//         this.view = view
//     }

//     get isSelected() {
//         return this._isSelected
//     }

//     set isSelected(value: boolean) {
//         this._isSelected = value
//         if (this.view != null) {
//             this.view.fireUpdate(this)
//         }
//     }

//     toggle() {
//         this.isSelected = !this.isSelected
//     }
// }

// export class PalaceViewModel {
//     isSelected: boolean

//     constructor() {
//         this.isSelected = false
//     }

//     toggle() {
//         ;
//     }
// }

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

// function AnimeChangeBorder(element: HTMLElement, width: string) {
//     anime({
//         targets: element,
//         borderWidth: width,
//         duration: 200,
//         easing: 'linear'
//     })
// }

// function AnimeChangeColor(element: HTMLElement, color: string) {
//     anime({
//         targets: element,
//         backgroundColor: color,
//         duration: 200,
//         easing: 'linear'
//     })
// }

// function main() {
//     const originalColor = "rgb(234, 222, 239)";
//     const highlightColor = "rgb(224, 202, 233)";

//     const palace_list: HTMLElement[] = []
//     const palace_list_selected: boolean[] = []
//     const n = 12
//     for (let i = 0; i < n; i++) {
//         const palace = document.getElementById(`palace-${i}`)
//         if (palace == null) {
//             throw new Error("palace not found.");
//         }
//         palace_list.push(palace)
//         palace_list_selected.push(false)

//         palace.addEventListener('click', () => {
//             let next_state = !palace_list_selected[i]
//             if (next_state) {
//                 AnimeChangeBorder(palace, "6px")
//             }
//             for (let j = 0; j < n; j++) {
//                 if (palace_list_selected[j]) {
//                     palace_list_selected[j] = false
//                     AnimeChangeBorder(palace_list[j], "2px")
//                 }
//             }
//             palace_list_selected[i] = next_state
//         });

//         palace.addEventListener('mouseover', () => {
//             AnimeChangeColor(palace, highlightColor)
//             AnimeChangeColor(palace_list[(i + 4) % n], highlightColor)
//             AnimeChangeColor(palace_list[(i + 6) % n], highlightColor)
//             AnimeChangeColor(palace_list[(i + 8) % n], highlightColor)
//         });
//         palace.addEventListener('mouseout', () => {
//             AnimeChangeColor(palace, originalColor)
//             AnimeChangeColor(palace_list[(i + 4) % n], originalColor)
//             AnimeChangeColor(palace_list[(i + 6) % n], originalColor)
//             AnimeChangeColor(palace_list[(i + 8) % n], originalColor)
//         });
//     }
// }

// main()
