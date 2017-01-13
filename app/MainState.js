import { State, Physics } from 'phaser'
import {
  MAIN_KEY,
  PLAYER,
  ROLLER,
  SLIME,
  COIN,
  LAVA,
  WALL,
  DEFAULT,
  SPRITE_IMAGES,
  GAME_IMAGES,
  GRAVITY
} from './constants'

const _flipSprite = (sprite) => {
  sprite.scale.x *= -1
}

class MainState extends State {

  preload() {
    for (const s of SPRITE_IMAGES) {
      this.game.load.spritesheet(s, `static/img/${s}.png`, 25, 25)
    }
    for (const img of GAME_IMAGES) {
      this.game.load.image(img, `static/img/${img}.png`)
    }
  }

  create() {
    this.game.stage.backgroundColor = '#3598db'
    this.game.physics.startSystem(Physics.ARCADE)
    this.game.world.enableBody = true

    this.cursor = this.game.input.keyboard.createCursorKeys()
    this.playerFacingLeft = true
    this.player = this.game.add.sprite(70, 300, PLAYER)
    this.player.anchor.setTo(0.5, 0.5)
    this.player.animations.add(DEFAULT)
    this.player.body.gravity.y = GRAVITY

    this.walls = this.game.add.group()
    this.coins = this.game.add.group()
    this.lavas = this.game.add.group()
    this.rollers = this.game.add.group()
    this.slimes = this.game.add.group()

    const level = [
      'xxxxxxxxx!xxxxxxxxxx',
      'x                 xx',
      'x        0  x   0 xx',
      'x    xxxxxxxxxx   xx',
      'x             x   xx',
      'xx       0    xxxxxx',
      'x       xxx   x    x',
      'x             xxxx x',
      'x             x    x',
      'x  xxxx!     xx   xx',
      'x                  x',
      'x           r      x',
      'x          xxxx    x',
      'x                  x',
      'x     s            x',
      'x   xxxx     r     x',
      'x            xxxx!!x',
      'x          xxxxxx!!x',
      'x  0   r xxxxxxxx!!x',
      'xxxxxxxxxxxxxxxxx!!x',
    ]

    level.forEach((row, i) => {
      row.split('').forEach((c, j) => {
        if (c === 'x') {
          const wall = this.game.add.sprite(25 * j, 25 * i, WALL)
          wall.body.immovable = true
          this.walls.add(wall)
        } else if (c === '0') {
          const coin = this.game.add.sprite(25 * j, 25 * i, COIN)
          this.coins.add(coin)
        } else if (c === '!') {
          const lava = this.game.add.sprite(25 * j, 25 * i, LAVA)
          lava.body.immovable = true
          this.lavas.add(lava)
        } else if (c === 'r') {
          const roller = this.game.add.sprite(25 * j, 25 * i, ROLLER)
          roller.anchor.setTo(0.5, 0.5)
          roller.animations.add(DEFAULT)
          roller.animations.play(DEFAULT, 15, true)
          roller.body.bounce.set(1.0)
          roller.body.velocity.x = this.game.rnd.integerInRange(50, 100)
          roller.body.velocity.y = this.game.rnd.integerInRange(75, 100)
          this.rollers.add(roller)
        } else if (c === 's') {
          const slime = this.game.add.sprite(25 * j, 25 * i, SLIME)
          slime.body.gravity.y = GRAVITY
          slime.anchor.setTo(0.5, 0.5)
          slime.animations.add(DEFAULT)
          slime.animations.play(DEFAULT, 15, true)
          slime.body.bounce.x = 1.0
          slime.body.velocity.x = this.game.rnd.integerInRange(50, 100)
          this.slimes.add(slime)
        }
      })
    })
  }

  update() {
    this.game.physics.arcade.overlap(this.player, this.lavas, this.restart, null, this)
    this.game.physics.arcade.overlap(this.player, this.rollers, this.restart, null, this)
    this.game.physics.arcade.overlap(this.player, this.slimes, this.restart, null, this)

    this.game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this)

    this.game.physics.arcade.collide(this.player, this.walls)

    this.game.physics.arcade.collide(this.rollers, this.rollers)
    this.game.physics.arcade.collide(this.rollers, this.walls)
    this.game.physics.arcade.collide(this.rollers, this.lavas)

    this.game.physics.arcade.collide(this.slimes, this.slimes)
    this.game.physics.arcade.collide(this.slimes, this.walls)
    this.game.physics.arcade.collide(this.slimes, this.lavas)

    this.game.physics.arcade.collide(this.rollers, this.slimes)

    if (!this.player.body.touching.down) {
      this.player.animations.play(DEFAULT, 30, true)
    } else {
      this.player.animations.stop(DEFAULT, true)
    }
    if (this.cursor.left.isDown) {
      if (!this.playerFacingLeft) {
        _flipSprite(this.player)
        this.playerFacingLeft = true
      }
      this.player.body.velocity.x = -200
    } else if (this.cursor.right.isDown) {
      if (this.playerFacingLeft) {
        _flipSprite(this.player)
        this.playerFacingLeft = false
      }
      this.player.body.velocity.x = 200
    } else {
      this.player.body.velocity.x = 0
    }

    if (this.cursor.up.isDown && this.player.body.touching.down) {
      this.player.body.velocity.y = -400
    }
  }

  takeCoin(player, coin) {
    coin.kill()
  }

  restart() {
    this.game.state.start(MAIN_KEY)
  }
}

export default MainState
