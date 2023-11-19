import anime from "animejs"

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

function main() {
    const originalColor = "rgb(234, 222, 239)";
    const highlightColor = "rgb(224, 202, 233)";

    const palace_list: HTMLElement[] = []
    const palace_list_selected: boolean[] = []
    const n = 12
    for (let i = 0; i < n; i++) {
        const palace = document.getElementById(`palace-${i}`)
        if (palace == null) {
            throw new Error("palace not found.");
        }
        palace_list.push(palace)
        palace_list_selected.push(false)

        palace.addEventListener('click', () => {
            let next_state = !palace_list_selected[i]
            if (next_state) {
                AnimeChangeBorder(palace, "6px")
            }
            for (let j = 0; j < n; j++) {
                if (palace_list_selected[j]) {
                    palace_list_selected[j] = false
                    AnimeChangeBorder(palace_list[j], "2px")
                }
            }
            palace_list_selected[i] = next_state
        });

        palace.addEventListener('mouseover', () => {
            AnimeChangeColor(palace, highlightColor)
            AnimeChangeColor(palace_list[(i + 4) % n], highlightColor)
            AnimeChangeColor(palace_list[(i + 6) % n], highlightColor)
            AnimeChangeColor(palace_list[(i + 8) % n], highlightColor)
        });
        palace.addEventListener('mouseout', () => {
            AnimeChangeColor(palace, originalColor)
            AnimeChangeColor(palace_list[(i + 4) % n], originalColor)
            AnimeChangeColor(palace_list[(i + 6) % n], originalColor)
            AnimeChangeColor(palace_list[(i + 8) % n], originalColor)
        });
    }
}

main()
