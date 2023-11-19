import anime from "animejs"

function AnimeChangeColor(element: HTMLElement, color: string) {
    anime({
        targets: element,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}

function main() {
    const frame = document.getElementById('frame')
    if (frame == null) {
        throw new Error("frame not found.");
    }
    const originalColor = "rgb(48, 48, 128)"
    const highlightColor = "rgb(128, 48, 48)"

    frame.addEventListener('mouseover', () => {
        AnimeChangeColor(frame, highlightColor)
    });

    frame.addEventListener('mouseout', () => {
        AnimeChangeColor(frame, originalColor)
    });
}

main()
