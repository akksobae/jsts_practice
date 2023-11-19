var frame = document.getElementById('frame')
var originalColor = "rgb(48, 48, 128)"
var highlightColor = "rgb(128, 48, 48)"

function AnimeChangeColor(color) {
    anime({
        targets: frame,
        backgroundColor: color,
        duration: 200,
        easing: 'linear'
    })
}

frame.addEventListener('mouseover', () => {
    AnimeChangeColor(highlightColor)
});

frame.addEventListener('mouseout', () => {
    AnimeChangeColor(originalColor)
});
