import { State, Game, Physics } from 'phaser'

// Game key
const MAIN_KEY = 'main'

// Sprite/image keys
const PLAYER = 'player'
const COIN = 'coin'
const LAVA = 'lava'
const ROLLER = 'roller'
const WALL = 'wall'

// Animation key
const DEFAULT = 'default'

// Sprite/image Collections
const SPRITE_IMAGES = [
  PLAYER,
  ROLLER
]
const GAME_IMAGES = [
  COIN,
  LAVA,
  WALL
]

// Physics Constants
const GRAVITY = 800

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

    this.cursor = game.input.keyboard.createCursorKeys()
    this.playerFacingLeft = true
    this.player = game.add.sprite(70, 300, PLAYER)
    this.player.anchor.setTo(0.5, 0.5)
    this.player.animations.add(DEFAULT)
    this.player.body.gravity.y = GRAVITY

    this.walls = game.add.group()
    this.coins = game.add.group()
    this.lavas = game.add.group()
    this.rollers = game.add.group()

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
      'x                  x',
      'x   xxxx     r     x',
      'x            xxxx!!x',
      'x          xxxxxx!!x',
      'x  0   r xxxxxxxx!!x',
      'xxxxxxxxxxxxxxxxx!!x',
    ]

    level.forEach((row, i) => {
      row.split('').forEach((c, j) => {
        if (c === 'x') {
          const wall = game.add.sprite(25 * j, 25 * i, WALL)
          wall.body.immovable = true
          this.walls.add(wall)
        } else if (c === '0') {
          const coin = game.add.sprite(25 * j, 25 * i, COIN)
          this.coins.add(coin)
        } else if (c === '!') {
          const lava = game.add.sprite(25 * j, 25 * i, LAVA)
          lava.body.immovable = true
          this.lavas.add(lava)
        } else if (c === 'r') {
          const roller = game.add.sprite(25 * j, 25 * i, ROLLER)
          roller.anchor.setTo(0.5, 0.5)
          roller.animations.add(DEFAULT)
          roller.animations.play(DEFAULT, 15, true)
          roller.body.setCircle(12.5)
          roller.body.bounce.x = 1.0
          roller.body.bounce.y = 1.0
          roller.body.velocity.x = this.game.rnd.integerInRange(50, 100)
          roller.body.velocity.y = this.game.rnd.integerInRange(75, 100)
          this.rollers.add(roller)
        }
      })
    })
  }

  update() {
    this.game.physics.arcade.overlap(this.player, this.lavas, this.restart, null, this)
    this.game.physics.arcade.overlap(this.player, this.rollers, this.restart, null, this)

    this.game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this)

    this.game.physics.arcade.collide(this.player, this.walls)

    this.game.physics.arcade.collide(this.rollers, this.rollers)
    this.game.physics.arcade.collide(this.rollers, this.walls)
    this.game.physics.arcade.collide(this.rollers, this.lavas)

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

const game = new Game(500, 500)
game.state.add(MAIN_KEY, MainState, false)
game.state.start(MAIN_KEY)

