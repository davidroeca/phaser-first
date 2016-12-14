import 'pixi'
import 'p2'
import { State, Game, Physics } from 'phaser'

const MAIN_KEY = 'main'
const PLAYER = 'player'
const COIN = 'coin'
const LAVA = 'lava'
const WALL = 'wall'
const GAME_IMAGES = [
  PLAYER,
  COIN,
  LAVA,
  WALL
]

class MainState extends State {

  preload() {
    for (let img of GAME_IMAGES) {
      this.game.load.image(img, `static/img/${img}.png`)
    }
  }

  create() {
    this.game.stage.backgroundColor = '#3598db'
    this.game.physics.startSystem(Physics.ARCADE)
    this.game.world.enableBody = true

    this.cursor = game.input.keyboard.createCursorKeys()
    this.player = game.add.sprite(70, 100, PLAYER)
    this.player.body.gravity.y = 600

    this.walls = game.add.group()
    this.coins = game.add.group()
    this.lavas = game.add.group()


    const level = [
      'xxxxxxxxxxxxxxxxxxxx',
      '!        !         x',
      '!               0  x',
      '!        0         x',
      '!                  x',
      '!                  x',
      '!  0     !         x',
      'xxxxxxxxxxxxxxx!!!!x',
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
    this.game.physics.arcade.collide(this.player, this.walls)

    this.game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this)

    this.game.physics.arcade.overlap(this.player, this.lavas, this.restart, null, this)

    if (this.cursor.left.isDown) {
      this.player.body.velocity.x = -200
    } else if (this.cursor.right.isDown) {
      this.player.body.velocity.x = 200
    } else {
      this.player.body.velocity.x = 0
    }

    if (this.cursor.up.isDown && this.player.body.touching.down) {
      this.player.body.velocity.y = -300
    }
  }

  takeCoin(player, coin) {
    coin.kill()
  }

  restart() {
    this.game.state.start(MAIN_KEY)
  }
}

const game = new Game(500, 200)
game.state.add(MAIN_KEY, MainState, false)
game.state.start(MAIN_KEY)

