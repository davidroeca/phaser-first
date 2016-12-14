import 'pixi'
import 'p2'
import Phaser from 'phaser'

const preload = () => {
  game.load.image('logo', 'static/img/phaser.png');
}

const create = () => {
  const logo = game.add.sprite(
    game.world.centerX, game.world.centerY, 'logo'
  );
  logo.anchor.setTo(0.5, 0.5);
}

let game = new Phaser.Game(
  800, 600, Phaser.AUTO, '', { preload: preload, create: create }
)
