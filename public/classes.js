class Boundry {
    static scaled = 48
    constructor({ position }) {
        this.position = position
        this.width = 48
        this.height = 48
    }
    draw() {
        c.fillStyle = 'rgba(255,0,0,0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Sprite {
    constructor({ position, opacity = 1, image, type = 'background', frames = 4, rotation = 0, attacks = [], images = [], id = '' }) {
        this.position = position
        this.image = image
        this.images = images
        this.type = type
        this.frames = frames;
        this.framePortion = 0
        this.elapsed = 0;
        this.moving = false
        this.width = this.image.width / this.frames
        this.height = this.image.height
        this.opacity = opacity;
        this.health = 100
        this.rotation = rotation;
        this.attacks = attacks
        this.id = id;
    }
    draw() {
        this.width = this.image.width / this.frames
        this.height = this.image.height
        c.save()
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
        c.rotate(this.rotation)
        c.translate(-(this.position.x + this.width / 2), -(this.position.y + this.height / 2))
        c.globalAlpha = this.opacity
        c.drawImage(this.image,
            this.framePortion * (this.width),
            0,
            this.width,
            this.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height,
        )
        c.restore()
        this.elapsed++;
        if (!this.moving && (this.type !== 'draggle' && this.type !== 'emby' && this.type !== 'fireball')) return
        if (this.elapsed % 15 == 0) {
            if (this.framePortion < this.frames - 1) {
                this.framePortion++
            }
            else this.framePortion = 0;
        }
    }
    attack({ attack, recipient, dynamicSprites }) {
        document.querySelector('#dialogBox').style.display = 'block'
        document.querySelector('#dialogBox').innerText = `${this.type} is used ${attack.name}`
        if (attack.name == 'Fireball') {
            audio.initFireball.play()
            const fireballImg = new Image()
            fireballImg.src = './assets/fireball.png'
            const fireball = new Sprite({ position: { x: this.position.x, y: this.position.y }, image: fireballImg, type: 'fireball', frames: 4, rotation: 1 })
            dynamicSprites.push(fireball)
            gsap.to(fireball.position, {
                x: recipient.position.x,
                y: recipient.position.y,
                duration: 0.6,
                onComplete() {
                    dynamicSprites.pop()
                    gsap.to(recipient, { opacity: 0, yoyo: true, repeat: 5, duration: 0.07 })
                    gsap.to(recipient.position, { x: recipient.position.x + 15, yoyo: true, repeat: 5, duration: 0.07 })
                    audio.fireballHit.play()
                }
            })
        }
        if (attack.name == 'Tackle') {
            audio.tackleHit.play()
            const tl = gsap.timeline()
            tl.to(this.position, {
                x: this.position.x - 20
            }).to(this.position, {
                x: this.position.x + 40,
                duration: 0.1,
                onComplete() {
                    gsap.to(recipient.position, { x: recipient.position.x + 15, yoyo: true, repeat: 5, duration: 0.08 })
                    gsap.to(recipient, { opacity: 0, yoyo: true, repeat: 5, duration: 0.08 })
                }
            }).to(this.position, {
                x: this.position.x
            })
        }
        const id = (recipient.type == 'draggle' ? '#enemyHealthBar' : recipient.type == 'emby' ? '#embyHealthBar' : '')
        gsap.to(id, { width: (recipient.health -= attack.damage) + '%' })
        if (recipient.health <= 0) gsap.to(recipient, { opacity: 0, duration: 0.2 })
    }

    faint() {
        console.log('faint');
        document.querySelector('#dialogBox').innerText = `${this.type} is fainted`
        audio.battle.stop()
        audio.victory.play()

    }
}