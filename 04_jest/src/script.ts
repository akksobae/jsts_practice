
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
