addEventListener('keydown', e => {
    //console.log(player.position)

    if (!musicIsPlaying && !battle.initiated) {
        //audio.map.play()
        musicIsPlaying = true
    }
    switch (e.key) {
        case 'ArrowUp':
            keys.up.pressed = true
            lastKey = 'ArrowUp'
            if (battle.initiated) return
            player.moving = true
            player.image = player.images.up
            break
        case 'ArrowDown':
            keys.down.pressed = true
            lastKey = 'ArrowDown'
            if (battle.initiated) return
            player.moving = true
            player.image = player.images.down
            break
        case 'ArrowLeft':
            keys.left.pressed = true
            lastKey = 'ArrowLeft'
            if (battle.initiated) return
            player.moving = true
            player.image = player.images.left
            break
        case 'ArrowRight':
            keys.right.pressed = true
            lastKey = 'ArrowRight'
            if (battle.initiated) return
            player.moving = true
            player.image = player.images.right
            break
        default:
            break
    }
})

addEventListener('keyup', e => {
    switch (e.key) {
        case 'ArrowUp':
            keys.up.pressed = false
            player.moving = false
            break
        case 'ArrowDown':
            keys.down.pressed = false
            player.moving = false
            break
        case 'ArrowLeft':
            keys.left.pressed = false
            player.moving = false
            break
        case 'ArrowRight':
            keys.right.pressed = false
            player.moving = false
            break
        default:
            break
    }
})
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    voiceChat.initiated = false

});