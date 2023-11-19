import {
    LifeBoardViewModel,
} from "../src/viewmodel"

import {
    LifeBoardHTMLView,
} from "../src/view"

function main() {
    let vm = new LifeBoardViewModel()
    let view = new LifeBoardHTMLView(vm)
}

main()
