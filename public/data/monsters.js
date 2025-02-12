const embyImg = new Image()
embyImg.src = '../assets/embySprite.png'
const draggleImg = new Image()
draggleImg.src = '../assets/draggleSprite.png'
const monsters = {
    Emby: {
        position: { x: 500, y: 300 },
        image: embyImg,
        type: 'emby',
        attacks: [attacks.Fireball,
        attacks.Tackle]
    },
    Draggle: {
        position: { x: 800, y: 100 },
        image: draggleImg,
        type: 'draggle',
        attacks: [attacks.Tackle, attacks.Fireball]
    }
}