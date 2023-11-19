import {
    PalaceViewModel,
    LifeBoardViewModel,
    IUpdatableView,
} from "../src/viewmodel";

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
    }
}

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

test('Toggle selection of palace 0 of view', () => {
    let vm = new LifeBoardViewModel()
    let view = new LifeBoardTestView(vm)
    expect(view.palaces[0].selectedStatus).toBe("not selected")
    vm.palaces[0].isSelected = true
    expect(view.palaces[0].selectedStatus).toBe("selected")
    vm.palaces[0].isSelected = false
    expect(view.palaces[0].selectedStatus).toBe("not selected")
})

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
