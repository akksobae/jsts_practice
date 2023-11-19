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
