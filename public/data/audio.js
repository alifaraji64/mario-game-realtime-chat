const audio = {
    map: new Howl({
        src: '../assets/audio/map.wav',
        html5: true
    }),
    initBattle: new Howl({
        src: '../assets/audio/initBattle.wav',
        html5: true,
        volume: 0.1
      }),
      battle: new Howl({
        src: '../assets/audio/battle.mp3',
        html5: true,
        volume: 0.1
      }),
      tackleHit: new Howl({
        src: '../assets/audio/tackleHit.wav',
        html5: true,
        volume: 0.1
      }),
      fireballHit: new Howl({
        src: '../assets/audio/fireballHit.wav',
        html5: true,
        volume: 0.1
      }),
      initFireball: new Howl({
        src: '../assets/audio/initFireball.wav',
        html5: true,
        volume: 0.1
      }),
      victory: new Howl({
        src: '../assets/audio/victory.wav',
        html5: true,
        volume: 0.1
      })
}