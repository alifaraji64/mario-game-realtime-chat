const battleBgImg = new Image()
battleBgImg.src = './assets/battleBackground.png'
const battleBackground = new Sprite({ position: { x: 0, y: 0 }, image: battleBgImg, frames: 1 })
let draggle;
let emby;
const dynamicSprites = []
let battleAnimationId;
const queue = []
function animateBattle() {
    battleAnimationId = requestAnimationFrame(animateBattle)
    battleBackground.draw()
    draggle.draw()
    emby.draw()
    dynamicSprites.forEach(sprite => sprite.draw())
}



function initBattle() {
    draggle = new Sprite(monsters.Draggle)
    emby = new Sprite(monsters.Emby)
    document.querySelector('#enemyHealthBar').style.width = '100%'
    document.querySelector('#embyHealthBar').style.width = '100%'
    document.querySelector('#dialogBox').style.display = 'none' 
    document.querySelector('#attackBox').innerHTML='' 
    emby.attacks.forEach(attack => {
        const button = document.createElement('button')
        button.style.backgroundColor = attack.color
        button.style.color = 'white'
        button.innerText = attack.name
        document.querySelector('#attackBox').append(button)
    })
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            emby.attack({
                attack: attacks[button.innerText],
                recipient: draggle,
                dynamicSprites
            })
            const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]
            if (draggle.health > 0) {
                queue.push(() => {
                    draggle.attack({
                        attack: randomAttack,
                        recipient: emby,
                        dynamicSprites
                    })
                })
                return;
            }
            draggle.faint()
            queue.push(() => {
                gsap.to('#overlappingDiv', {
                    opacity: 1, onComplete() {
                        audio.battle.stop()
                        cancelAnimationFrame(battleAnimationId)
                        animate()
                        document.querySelector('#battle-wrapper').style.display = 'none'
                        gsap.to('#overlappingDiv', { opacity: 0 })
                        player.position.y += 48*2
                        battle.initiated = false

                    }
                })
            })
        })
        button.addEventListener('mouseenter', () => {
            document.querySelector('#attackType').innerText = attacks[button.innerText].name
            document.querySelector('#attackType').style.color = attacks[button.innerText].color

        })
    })
}

document.querySelector('#dialogBox').addEventListener('click', () => {
    console.log('click');
    if (queue.length) {
        queue[0]()
        queue.shift()
    }
    else
        document.querySelector('#dialogBox').style.display = 'none'

})