const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576
const socket = io('wss://mario-game-realtime-chat.onrender.com', { transports: ['websocket'] });
const socketRef = { id: null }
let mouseX;
let mouseY;
const speed = 5
const OFFSET = {
  x: -750,
  y: -350
}
let musicIsPlaying = false
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, i + 70))
}

const battleZoneMap = []
for (let i = 0; i < battleZoneData.length; i += 70) {
  battleZoneMap.push(battleZoneData.slice(i, i + 70))
}

const boundries = []
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol == 0) return
    boundries.push(
      new Boundry({
        position: {
          x: j * Boundry.scaled + OFFSET.x,
          y: i * Boundry.scaled + OFFSET.y
        }
      })
    )
  })
})

const battleZones = []
battleZoneMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol == 0) return
    battleZones.push(
      new Boundry({
        position: {
          x: j * Boundry.scaled + OFFSET.x,
          y: i * Boundry.scaled + OFFSET.y
        }
      })
    )
  })
})

const image = new Image()
image.src = './assets/map.png'

const playerImageUp = new Image()
playerImageUp.src = './assets/playerUp.png'
const playerImageDown = new Image()
playerImageDown.src = './assets/playerDown.png'
const playerImageLeft = new Image()
playerImageLeft.src = './assets/playerLeft.png'
const playerImageRight = new Image()
playerImageRight.src = './assets/playerRight.png'

const foregroundImage = new Image()
foregroundImage.src = './assets/foreground.png'

const background = new Sprite({
  position: {
    ...OFFSET
  },
  image,
  frames: 1
})
const backgroundRef = { position: { ...background.position } }
const foreground = new Sprite({
  position: {
    ...OFFSET
  },
  image: foregroundImage,
  frames: 1
})
const player = new Sprite({
  image: playerImageDown,
  type: 'player',
  position: {
    x: canvas.width / 2 - playerImageDown.width / 8 - 20,
    y: canvas.height / 2 - playerImageDown.height / 2
  },
  images: {
    up: playerImageUp,
    down: playerImageDown,
    left: playerImageLeft,
    right: playerImageRight
  }
})
const keys = {
  up: { pressed: false },
  down: { pressed: false },
  left: { pressed: false },
  right: { pressed: false }
}
let otherPlayers = []
let movingPlayers = []
let movables = [background, ...boundries, foreground, ...battleZones]

function rectangularCollision({ player, boundary }) {
  return (
    player.position.x + player.image.width / 4 >= boundary.position.x &&
    player.position.x <= boundary.position.x + boundary.width &&
    player.position.y + player.image.height >= boundary.position.y &&
    player.position.y <= boundary.position.y + boundary.height
  )
}
function emitMoving(keys, moving, backgroundPosition) {
  socket.emit('player-moving', {
    keys,
    moving,
    backgroundPosition,
    id: socketRef.id
  })
}

let lastKey = ''
const battle = { initiated: false }
const voiceChat = { initiated: false }
function animate() {
  const animationId = requestAnimationFrame(animate)
  c.clearRect(0, 0, canvas.width, canvas.height)
  movables.forEach(movable => {
    movable.draw()
  })
  movingPlayers.forEach(p => p.draw())
  player.draw()

  let moving = true
  if (battle.initiated) return
  if (voiceChat.initiated == false) {
    otherPlayers.forEach(obj => {
      if (mouseX > obj.position.x && mouseX < obj.position.x + obj.width &&
        mouseY > obj.position.y && mouseY < obj.position.y + obj.height) {
        startVoiceChat(obj.id)
        voiceChat.initiated = true;
      }
    });
  }
  //console.log(voiceChat.initiated);

  if (
    keys.up.pressed ||
    keys.down.pressed ||
    keys.left.pressed ||
    keys.right.pressed
  ) {

    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      if (
        rectangularCollision({
          player,
          boundary: battleZone
        })
      ) {
        if (
          calcOverlappingArea({ player, battleZone }) > (player.width * player.height) / 3 &&
          Math.random() < 0.02
        ) {
          console.log('battle started')
          battle.initiated = true
          cancelAnimationFrame(animationId)
          audio.map.stop()
          musicIsPlaying = false
          audio.initBattle.play()
          audio.battle.play()
          gsap.to('#overlappingDiv', {
            opacity: 1,
            repeat: 3,
            yoyo: true,
            duration: 0.5,
            onComplete() {
              gsap.to('#overlappingDiv', {
                opacity: 1,
                onComplete() {
                  initBattle()
                  animateBattle()
                  gsap.to('#overlappingDiv', {
                    opacity: 0,
                    duration: 0.4,
                    onComplete() {
                      document.querySelector('#battle-wrapper').style.display =
                        'block'
                    }
                  })
                }
              })
            }
          })
          break
        }
      }
    }
  }
  if (keys.up.pressed && lastKey == 'ArrowUp') {
    for (let i = 0; i < boundries.length; i++) {
      const boundary = boundries[i]
      if (
        rectangularCollision({
          player,
          boundary: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + speed
            }
          }
        })
      ) {
        moving = false
        break
      }
    }
    if (moving) {
      movables.forEach(movable => (movable.position.y += speed))
      backgroundRef.position.y -= speed
    }
    emitMoving(keys, moving, backgroundRef.position)
  }
  if (keys.down.pressed && lastKey == 'ArrowDown') {
    for (let i = 0; i < boundries.length; i++) {
      const boundary = boundries[i]
      if (
        rectangularCollision({
          player,
          boundary: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - speed
            }
          }
        })
      ) {
        moving = false
        break
      }
    }
    if (moving) {
      movables.forEach(movable => (movable.position.y -= speed))
      backgroundRef.position.y += speed
    }
    emitMoving(keys, moving, backgroundRef.position)
  }
  if (keys.left.pressed && lastKey == 'ArrowLeft') {
    for (let i = 0; i < boundries.length; i++) {
      const boundary = boundries[i]
      if (
        rectangularCollision({
          player,
          boundary: {
            ...boundary,
            position: {
              x: boundary.position.x + speed,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }
    if (moving) {
      movables.forEach(movable => (movable.position.x += speed))
      backgroundRef.position.x -= speed
    }
    emitMoving(keys, moving, backgroundRef.position)
  }
  if (keys.right.pressed && lastKey == 'ArrowRight') {
    for (let i = 0; i < boundries.length; i++) {
      const boundary = boundries[i]
      if (
        rectangularCollision({
          player,
          boundary: {
            ...boundary,
            position: {
              x: boundary.position.x - speed,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }
    if (moving) {
      movables.forEach(movable => (movable.position.x -= speed))
      backgroundRef.position.x += speed
    }
    emitMoving(keys, moving, backgroundRef.position)
  }
}
animate()


