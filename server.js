const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path');
let players = []
const app = express()
app.use(cors())
const server = createServer(app)
// Serve static files (if your HTML is in a folder)
app.use(express.static(path.join(__dirname, 'public')));
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true
  }
});

io.on('connection', socket => {
  console.log('A user connected:', socket.id)
  socket.on('background-position-for-setting-initial-position', ({ backgroundPosition }) => {
    const player = {
      image: '',
      position: { x: backgroundPosition.x + 1242, y: backgroundPosition.y + 638 },
      id: socket.id
    }
    players.push(player)
    io.emit('player-joined', players)

  })
  socket.on('player-moving', data => {
    const { keys, moving, backgroundPosition, id } = data
    players.find(p => p.id == id).position.x = backgroundPosition.x + 1242
    players.find(p => p.id == id).position.y = backgroundPosition.y + 638
    socket.broadcast.emit('move-other-player', { keys, id: socket.id, moving })
  })
  socket.on('start-voice-call', ({ peerId, socketId }) => {
    io.to(socketId).emit('start-voice-call', peerId)
  })

  socket.on('disconnect', () => {
    players = players.filter(player => player.id != socket.id)
    io.emit('player-left', socket.id)
  })
})

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});