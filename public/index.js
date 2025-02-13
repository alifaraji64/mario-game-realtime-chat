const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576
const socket = io('http://localhost:3000')
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
console.log(battleZones)

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
  otherPlayers.forEach(obj => {
    if (mouseX > obj.position.x && mouseX < obj.position.x + obj.width &&
      mouseY > obj.position.y && mouseY < obj.position.y + obj.height) {
      console.log('Clicked on object:', obj.id);
    }
  });
  if (
    keys.up.pressed ||
    keys.down.pressed ||
    keys.left.pressed ||
    keys.right.pressed
  ) {
    // const isPlayerChangedInitialPosition = Math.abs(background.position.y-OFFSET.y)>Boundry.scaled+16
    // for (let i = 0; i < otherPlayers.length; i++) {
    //   const otherPlayer = otherPlayers[i];
    //   if (rectangularCollision({ player, boundary: otherPlayer }) && isPlayerChangedInitialPosition) {
    //     console.log('starting');
    //   }
    // }

    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingWidth =
        Math.min(
          battleZone.position.x + battleZone.width,
          player.position.x + player.width
        ) - Math.max(battleZone.position.x, player.position.x)
      const overlappingHeight =
        Math.min(
          battleZone.position.y + battleZone.height,
          player.position.y + player.height
        ) - Math.max(battleZone.position.y, player.position.y)
      const overlappingArea = overlappingHeight * overlappingWidth
      if (
        rectangularCollision({
          player,
          boundary: battleZone
        })
      ) {
        if (
          overlappingArea > (player.width * player.height) / 3 &&
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

addEventListener('keydown', e => {
  //console.log(player.position)

  if (!musicIsPlaying && !battle.initiated) {
    audio.map.play()
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
});
