//import 'pixi'
//import 'p2'
import { State, Game, Physics } from 'phaser'

const MAIN_KEY = 'main'
const PLAYER = 'player'
const COIN = 'coin'
const LAVA = 'lava'
const WALL = 'wall'
const FLAP = 'flap'
const GAME_IMAGES = [
  COIN,
  LAVA,
  WALL
]

const _flipSprite = (sprite) => {
  sprite.scale.x *= -1
}

class MainState extends State {

  preload() {
    game.load.spritesheet(PLAYER, `static/img/${PLAYER}.png`, 25, 25)
    for (let img of GAME_IMAGES) {
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
    this.player.animations.add(FLAP)
    this.player.body.gravity.y = 800

    this.walls = game.add.group()
    this.coins = game.add.group()
    this.lavas = game.add.group()


    const level = [
      'xxxxxxxxx!xxxxxxxxxx',
      'x                 !x',
      'x        0  x   0 !x',
      'x    xxxxxxxxxx   !x',
      'x             x   !x',
      'xx       0    x x!!x',
      'x       xxx   x    x',
      'x             x    x',
      'x             x    x',
      'x  xxxx!     xx!   x',
      'x                  x',
      'x                  x',
      'x          x!xx    x',
      'x                  x',
      'x                  x',
      'x   xx!x           x',
      'x          xxxxxx!!x',
      'x         xxxxxxx!!x',
      'x  0     xxxxxxxx!!x',
      'xxxxxxxxxxxxxxxxx!!x',
    ]
    level.forEach((row, i) => {
      row.split('').forEach((c, j) => {
        if (c === 'x') {
          const wall = game.add.sprite(25 * j, 25 * i, WALL)
          this.walls.add(wall)
          wall.body.immovable = true
        } else if (c === '0') {
          const coin = game.add.sprite(25 * j, 25 * i, COIN)
          this.coins.add(coin)
        } else if (c === '!') {
          const lava = game.add.sprite(25 * j, 25 * i, LAVA)
          this.lavas.add(lava)
        }
      })
    })
  }

  update() {
    this.game.physics.arcade.overlap(this.player, this.lavas, this.restart, null, this)

    this.game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this)

    this.game.physics.arcade.collide(this.player, this.walls)

    if (!this.player.body.touching.down) {
      this.player.animations.play(FLAP, 30, true)
    } else {
      this.player.animations.stop(FLAP, true)
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

