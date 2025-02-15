var peer = new Peer();
let myPeerId = null;
peer.on('open', function (id) {
    console.log('My peer ID is: ' + id);
    myPeerId = id;
});
// // Change to your server URL if deployed
socket.on('player-joined', players => {
    //empty the other player and remove all the player from movables, because in each cycle we are getting all the players
    otherPlayers = [];
    movables = movables.filter(m => !(m.id))
    socketRef.id = socket.id
    console.log('player joined')
    //console.log(players)

    players
        .filter(p => p.id !== socket.id)
        .map(p => ({
            sprite: new Sprite({
                image: playerImageDown,
                type: 'player',
                position: {
                    x: p.position.x + background.position.x - OFFSET.x,
                    y: p.position.y + background.position.y - OFFSET.y
                },
                id: p.id,
                opacity: 0.8
            }),
            id: p.id,
            image: p.image
        }))
        .forEach(p => {
            otherPlayers.push(p.sprite)
        })
    movables.push(...otherPlayers)
})
socket.on('move-other-player', data => {
    const { keys, id, moving } = data
    let movedPlayer = otherPlayers.find(p => p.id == id)
    if (keys.down.pressed && moving) {
        movedPlayer.position.y += speed
        movedPlayer.image = playerImageDown
    } else if (keys.up.pressed && moving) {
        movedPlayer.position.y -= speed
        movedPlayer.image = playerImageUp
    } else if (keys.left.pressed && moving) {
        movedPlayer.position.x -= speed
        movedPlayer.image = playerImageLeft
    } else if (keys.right.pressed && moving) {
        movedPlayer.position.x += speed
        movedPlayer.image = playerImageRight
    }
})

socket.on('connect', () => {
    console.log('connected')

    socket.emit('background-position-for-setting-initial-position', {
        backgroundPosition: backgroundRef.position
    })
})
socket.on('player-left', playerId => {
    otherPlayers = otherPlayers.filter(p => p.id !== playerId)
    movables = movables.filter(movable => {
        return !movable.id || movable.id !== playerId
    })
    if (document.querySelector('#endCallBtn').style.display !== 'none') {
        document.getElementById('remoteAudio').srcObject = null;
        document.querySelector('#endCallBtn').style.display = 'none'
    }
    console.log('player left with this id: ' + playerId)
})
socket.on('disconnect', msg => {
    console.log('disconnected')
})
socket.on('start-voice-call', peerId => {
    //sender=>right side
    if (document.querySelector('#endCallBtn').style.display !== 'none') return
    Swal.fire({
        title: "Do you wanna have a voice chat?",
        text: `user with this peer id: ${peerId} wants to have a voice chat with you`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, start it!",
    }).then((result) => {
        if (result.isConfirmed) {
            navigator.getUserMedia({ audio: true }, function (stream) {
                var call = peer.call(peerId, stream);
                call.on('stream', function (remoteStream) {
                    document.querySelector('#endCallBtn').style.display = 'block'
                    document.querySelector('#endCallBtn').addEventListener('click', () => call.close())
                    // Show stream in some video/canvas element.
                    document.getElementById('remoteAudio').srcObject = remoteStream;
                    console.log('🎧 Receiving live audio stream!');
                });
                call.on('close', () => {
                    document.getElementById('remoteAudio').srcObject = null; // Stop audio playback
                    document.querySelector('#endCallBtn').style.display = 'none'
                })
            }, function (err) {
                console.log('Failed to get local stream', err);
            });
        }
    });
})
peer.on('call', function (call) {
    //reciever=>left user
    Swal.fire({
        title: 'call started🥳',
        timer: 3000
    })
    document.querySelector('#endCallBtn').style.display = 'block'
    document.querySelector('#endCallBtn').addEventListener('click', () => call.close())

    navigator.getUserMedia({ audio: true }, function (stream) {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', function (remoteStream) {
            // Show stream in some video/canvas element.
            document.getElementById('remoteAudio').srcObject = remoteStream;
            console.log('🎧 Receiving live audio stream!');
        });
        call.on('close', () => {
            document.getElementById('remoteAudio').srcObject = null; // Stop audio playback
            document.querySelector('#endCallBtn').style.display = 'none'
        });
    }, function (err) {
        console.log('Failed to get local stream', err);
    });
});
function startVoiceChat(socketId) {
    if (document.querySelector('#endCallBtn').style.display !== 'none') {
        return Swal.fire("you should end the current call before starting a new one!");
    }
    socket.emit('start-voice-call', { peerId: myPeerId, socketId })
    Swal.fire({
        title: 'the user recieved your request, if they accept, you can start the call',
        timer: 3000
    })
}