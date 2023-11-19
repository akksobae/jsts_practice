
export interface IUpdatableView {
    updateSelectedStatus(vm: any): void
    updateFocusedStatus(vm: any): void
}

export class PalaceViewModel {
    _isSelected: boolean
    _isFocused: boolean
    view: IUpdatableView | null

    constructor() {
        this._isSelected = false
        this._isFocused = false
        this.view = null
    }

    toggle() {
        this.isSelected = !this.isSelected
    }

    bind(view: IUpdatableView) {
        this.view = view
    }

    get isSelected() {
        return this._isSelected
    }

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
