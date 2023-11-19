import anime from "animejs"

import {
    PalaceViewModel,
    LifeBoardViewModel,
    IUpdatableView,
} from "../src/viewmodel"

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
