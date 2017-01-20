import { State, Physics } from 'phaser'
import {
  MAIN_KEY,
  PLAYER,
  ROLLER,
  SLIME,
  COIN,
  LAVA,
  WALL,
  PLAYER_MATERIAL,
  ENEMY_MATERIAL,
  WALL_MATERIAL,
  COIN_MATERIAL,
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
    this.game.physics.startSystem(Physics.P2JS)
    this.game.world.enableBody = true
    this.game.physics.p2.setImpactEvents(true)
    this.game.physics.p2.restitution = 1.0
    this.game.physics.p2.gravity.y = GRAVITY

    this.players = this.game.add.group()
    this.walls = this.game.add.group()
    this.coins = this.game.add.group()
    this.lavas = this.game.add.group()
    this.rollers = this.game.add.group()
    this.slimes = this.game.add.group()

    for (let group of [
      this.players, this.walls, this.coins, this.lavas, this.rollers, this.slimes
    ]) {
      group.enableBody = true
      group.physicsBodyType = Physics.P2JS
    }

    const playerMaterial = this.game.physics.p2.createMaterial(PLAYER_MATERIAL)
    const enemyMaterial = this.game.physics.p2.createMaterial(ENEMY_MATERIAL)
    const wallMaterial = this.game.physics.p2.createMaterial(WALL_MATERIAL)
    const coinMaterial = this.game.physics.p2.createMaterial(COIN_MATERIAL)
    const playerCoinContact = this.game.physics.p2.createContactMaterial(
      playerMaterial,
      coinMaterial
    )
    playerCoinContact.restitution = 0.0
    playerCoinContact.friction = 0.0

    const playerWallContact = this.game.physics.p2.createContactMaterial(
      playerMaterial,
      wallMaterial
    )
    playerWallContact.restitution = 0.0
    playerWallContact.friction = 0.0

    this.wallsCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.coinsCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.lavasCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup()


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
      'x     s            x',
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
          const wall = this.walls.create(25 * j + 12.5, 25 * i + 12.5, WALL)
          //wall.anchor.setTo(0.0, 0.0)
          wall.body.kinematic = true
          wall.body.setCollisionGroup(this.wallsCollisionGroup)
          wall.body.setMaterial(wallMaterial)
          wall.body.collides([
            this.playerCollisionGroup,
            this.enemyCollisionGroup
          ])
        } else if (c === '0') {
          const coin = this.coins.create(25 * j + 12.5, 25 * i + 12.5, COIN)
          coin.body.static = true
          coin.body.setCollisionGroup(this.coinsCollisionGroup)
          coin.body.setMaterial(coinMaterial)
          coin.body.collides([
            this.playerCollisionGroup
          ])
        } else if (c === '!') {
          const lava = this.lavas.create(25 * j + 12.5, 25 * i + 12.5, LAVA)
          lava.body.kinematic = true
          lava.body.setMaterial(wallMaterial)
          lava.body.setCollisionGroup(this.lavasCollisionGroup)
          lava.body.collides([
            this.enemyCollisionGroup,
            this.playerCollisionGroup
          ])
        } else if (c === 'r') {
          const roller = this.rollers.create(25 * j + 12.5, 25 * i + 12.5, ROLLER)
          roller.animations.add(DEFAULT)
          roller.animations.play(DEFAULT, 15, true)
          roller.body.setMaterial(enemyMaterial)
          roller.body.setCircle(12.5)
          roller.body.fixedRotation = true
          roller.body.data.gravityScale = 0.0
          roller.body.velocity.x = this.game.rnd.integerInRange(50, 100)
          roller.body.velocity.y = this.game.rnd.integerInRange(75, 100)
          roller.body.setCollisionGroup(this.enemyCollisionGroup)
          roller.body.collides([
            this.enemyCollisionGroup,
            this.playerCollisionGroup,
            this.wallsCollisionGroup,
            this.lavasCollisionGroup
          ])
        } else if (c === 's') {
          const slime = this.slimes.create(25 * j + 12.5, 25 * i + 12.5, SLIME)
          slime.animations.add(DEFAULT)
          slime.animations.play(DEFAULT, 15, true)
          slime.body.setMaterial(enemyMaterial)
          slime.body.fixedRotation = true
          slime.body.velocity.x = this.game.rnd.integerInRange(50, 100)
          slime.body.setCollisionGroup(this.enemyCollisionGroup)
          slime.body.collides([
            this.enemyCollisionGroup,
            this.playerCollisionGroup,
            this.wallsCollisionGroup,
            this.lavasCollisionGroup
          ])
        }
      })
    })

    this.playerFacingLeft = true
    this.player = this.players.create(70, 300, PLAYER)
    this.player.animations.add(DEFAULT)
    this.player.body.setRectangle(25, 25)
    this.player.body.setMaterial(playerMaterial)
    this.player.body.fixedRotation = true
    this.player.body.setCollisionGroup(this.playerCollisionGroup)

    // Define the ramifications of each collision
    this.player.body.collides(this.wallsCollisionGroup)
    this.player.body.collides(
      [
        this.lavasCollisionGroup,
        this.enemyCollisionGroup
      ],
      this.restart,
      this
    )
    this.player.body.collides(
      this.coinsCollisionGroup,
      this.takeCoin,
      this
    )

    this.game.physics.p2.updateBoundsCollisionGroup()
    this.game.stage.backgroundColor = '#3598db'
    this.cursor = this.game.input.keyboard.createCursorKeys()
  }

  update() {
    this.player.animations.play(DEFAULT, 30, true)
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

    if (this.cursor.up.isDown) {
      this.player.body.velocity.y = -200
    }
  }

  takeCoin(player, coin) {
    coin.sprite.kill()
  }

  restart() {
    this.game.state.start(MAIN_KEY)
  }
}

export default MainState
