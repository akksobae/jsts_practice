import {
    PalaceViewModel,
    LifeBoardViewModel,
    IUpdatableView,
} from "../src/script";

test('Toggle selection of palace 0', () => {
    let vm = new LifeBoardViewModel()
    expect(vm.palaces[0].isSelected).not.toBeTruthy()
    vm.palaces[0].toggle()
    expect(vm.palaces[0].isSelected).toBeTruthy()
    vm.palaces[0].toggle()
    expect(vm.palaces[0].isSelected).not.toBeTruthy()
})

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
        // vm.bind(this)
    }

    // fireUpdate(vm: LifeBoardViewModel) {

    // }
}

class PalaceTestView implements IUpdatableView {
    // on_click: () => void
    selectedStatus: string

    constructor() {
        // this.on_click = () => { }
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

test('Toggle selection of palace 0 via view', () => {
    let vm = new LifeBoardViewModel()
    let view = new LifeBoardTestView(vm)
    expect(view.palaces[0].selectedStatus).toBe("not selected")
    vm.palaces[0].isSelected = true
    expect(view.palaces[0].selectedStatus).toBe("selected")
    vm.palaces[0].isSelected = false
    expect(view.palaces[0].selectedStatus).toBe("not selected")
})
