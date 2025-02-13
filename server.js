const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
let players = []
const app = express()
app.use(cors())
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (adjust for security in production)
    methods: ['GET', 'POST']
  }
})

io.on('connection', socket => {
  console.log('A user connected:', socket.id)
  socket.on('background-position-for-setting-initial-position', ({ backgroundPosition }) => {
    const player = {
      image: '',
      position: { x: backgroundPosition.x + 1242, y: backgroundPosition.y + 638 },
      id: socket.id
    }
    console.log('____');
    console.log({ x: backgroundPosition.x + 1242, y: backgroundPosition.y + 638 });
    console.log('____');



    players.push(player)
    io.emit('player-joined', players)

  })
  socket.on('player-moving', data => {

    //bgref
    const { keys, moving, backgroundPosition, id } = data
    players.find(p => p.id == id).position.x = backgroundPosition.x + 1242
    players.find(p => p.id == id).position.y = backgroundPosition.y + 638
    console.log('players');

    console.log(players);


    console.log('background position')

    console.log(backgroundPosition)
    console.log(players.find(p => p.id == id).position);



    socket.broadcast.emit('move-other-player', { keys, id: socket.id, moving })
  })

  socket.on('disconnect', () => {
    players = players.filter(player => player.id != socket.id)
    io.emit('player-left', socket.id)
  })
})

// Serve static files (if your HTML is in a folder)
app.use(express.static('public'))

// Start server
server.listen(3000, () => {
  console.log('Server running on port 3000')
})
