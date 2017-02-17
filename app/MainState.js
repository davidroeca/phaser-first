import { ScaleManager, State, Physics, Tilemap } from 'phaser'
import {
  MAIN_KEY,
  LEVEL1,
  BACKGROUND_LAYER,
  BLOCKED_LAYER,
  OBJECT_LAYER,
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
  PHYSICS_DATA,
  DEFAULT,
  SPRITE_IMAGES,
  GAME_IMAGES,
  GRAVITY,
  BASE_SIZE
} from './constants'

const _flipSprite = (sprite) => {
  sprite.scale.x *= -1
}

const findObjectsByType = (type, tilemap, layerName) => {
  const tilemapObjects = tilemap.objects[layerName]
  return tilemapObjects.filter(o => o.type === type).map(o => {
    const newObj = Object.assign({}, o, {
      // Need to adjust tile placement based on axis shift in phaser
      x: o.x + tilemap.tileHeight / 2,
      y: o.y - tilemap.tileHeight / 2
    })
    return newObj
  })
}

const createFromTiledObject = (element, group, spriteName) => {
  return group.create(element.x, element.y, spriteName)
}

class MainState extends State {

  preload() {
    this.game.load.tilemap(
      LEVEL1, `static/tilesets/${LEVEL1}.json`, null, Tilemap.TILED_JSON
    )
    for (const s of SPRITE_IMAGES) {
      this.game.load.spritesheet(s, `static/img/${s}.png`, BASE_SIZE, BASE_SIZE)
    }
    for (const img of GAME_IMAGES) {
      this.game.load.image(img, `static/img/${img}.png`)
    }
    this.game.load.physics(PHYSICS_DATA, 'static/json/bodies.json')
  }

  create() {
    // Set up camera
    this.game.scale = new ScaleManager(this.game, 500, 500)
    this.game.scale.scaleMode = ScaleManager.SHOW_ALL
    this.game.scale.setGameSize(500, 500)
    // Physics and object creation
    this.game.physics.startSystem(Physics.P2JS)
    this.game.world.enableBody = true
    this.game.physics.p2.gravity.y = GRAVITY
    //
    this.tilemap = this.game.add.tilemap(LEVEL1)
    for (const s of GAME_IMAGES) {
      this.tilemap.addTilesetImage(s, s)
    }

    this.backgroundLayer = this.tilemap.createLayer(BACKGROUND_LAYER)
    this.backgroundLayer.resizeWorld();
    // Set collision info on layer
    this.tilemap.setCollisionBetween(1, 5000, true, BLOCKED_LAYER)
    this.blockedLayer = this.tilemap.createLayer(BLOCKED_LAYER)
    this.blockedLayerBodies = this.game.physics.p2.convertTilemap(
      this.tilemap, this.blockedLayer, true, true
    )

    this.game.physics.p2.setImpactEvents(true)
    this.game.physics.p2.restitution = 1.0

    this.players = this.game.add.group()
    this.walls = this.game.add.group()
    this.coins = this.game.add.group()
    this.lavas = this.game.add.group()
    this.rollers = this.game.add.group()
    this.slimes = this.game.add.group()

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

    for (const group of [
      this.players, this.walls, this.coins, this.lavas, this.rollers, this.slimes
    ]) {
      group.enableBody = true
      group.physicsBodyType = Physics.P2JS
    }

    // Add back

    this.wallsCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.coinsCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.lavasCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup()

    for (const blockBody of this.blockedLayerBodies) {
      blockBody.kinematic = true
      blockBody.setCollisionGroup(this.wallsCollisionGroup)
      blockBody.setMaterial(wallMaterial)
      blockBody.collides([
        this.enemyCollisionGroup,
        this.playerCollisionGroup
      ])
    }

    //this.blockedLayer.body.setCollisionGroup(this.wallsCollisionGroup)

    // Create coins
    for (const coinObj of findObjectsByType(COIN, this.tilemap, OBJECT_LAYER)) {
      const coin = createFromTiledObject(coinObj, this.coins, COIN)
      coin.body.kinematic = true
      coin.body.setCollisionGroup(this.coinsCollisionGroup)
      coin.body.setMaterial(coinMaterial)
      coin.body.collides([
        this.playerCollisionGroup
      ])
    }
    for (const lavaObj of findObjectsByType(
      LAVA, this.tilemap, OBJECT_LAYER
    )) {
      const lava = createFromTiledObject(lavaObj, this.lavas, LAVA)
      lava.body.kinematic = true
      lava.body.setMaterial(wallMaterial)
      lava.body.setCollisionGroup(this.lavasCollisionGroup)
      lava.body.collides([
        this.enemyCollisionGroup,
        this.playerCollisionGroup
      ])
    }
    for (const slimeObj of findObjectsByType(
      SLIME, this.tilemap, OBJECT_LAYER
    )) {
      const slime = createFromTiledObject(slimeObj, this.slimes, SLIME)
      slime.animations.add(DEFAULT)
      slime.animations.play(DEFAULT, 15, true)
      //slime.body.clearShapes()
      slime.body.loadPolygon(PHYSICS_DATA, SLIME)
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
    for (const rollerObj of findObjectsByType(
      ROLLER, this.tilemap, OBJECT_LAYER
    )) {
      const roller = createFromTiledObject(rollerObj, this.rollers, ROLLER)
      roller.animations.add(DEFAULT)
      roller.animations.play(DEFAULT, 15, true)
      roller.body.setMaterial(enemyMaterial)
      roller.body.setCircle(BASE_SIZE / 2)
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
    }



    const [playerObj] = findObjectsByType(PLAYER, this.tilemap, OBJECT_LAYER)
    this.player = createFromTiledObject(playerObj, this.players, PLAYER)
    this.playerFacingLeft = true
    //this.player = this.players.create(70, 300, PLAYER)
    this.player.animations.add(DEFAULT)
    this.player.body.loadPolygon(PHYSICS_DATA, PLAYER)
    this.player.body.setRectangle(BASE_SIZE, BASE_SIZE)
    this.player.body.setMaterial(playerMaterial)
    this.player.body.fixedRotation = true
    this.player.body.setCollisionGroup(this.playerCollisionGroup)
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

    // Define the ramifications of each collision

    this.game.camera.follow(this.player)
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
