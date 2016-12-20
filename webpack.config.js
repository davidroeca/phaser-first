const path = require('path')

const phaserModule = path.join(__dirname, '/node_modules/phaser-ce')
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  img: path.join(__dirname, 'assets', 'img'),
  phaser: path.join(phaserModule, 'build/custom/phaser-split.js'),
  pixi: path.join(phaserModule, 'build/custom/pixi.js'),
  p2: path.join(phaserModule, 'build/custom/p2.js')
}

module.exports = {
  entry: [
    'babel-polyfill',
    'pixi',
    'p2',
    path.join(PATHS.img, 'player.png'),
    path.join(PATHS.img, 'roller.png'),
    path.join(PATHS.img, 'slime.png'),
    path.join(PATHS.img, 'wall.png'),
    path.join(PATHS.img, 'coin.png'),
    path.join(PATHS.img, 'lava.png'),
    path.join(PATHS.app, 'index.js')
  ],
  output: {
    filename: 'bundle.js',
    path: PATHS.build,
    publicPath: '/static/'
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        include: [ PATHS.app ],
        loader: 'eslint'
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        include: [ PATHS.app ],
        loader: 'babel',
        query: {
          'presets': [
            'es2015'
          ]
        }
      },
      {
        test: /pixi.js/,
        loader: 'expose?PIXI'
      },
      {
        test: /phaser-split\.js/,
        loader: 'expose?Phaser'
      },
      {
        test: /p2\.js/,
        loader: 'expose?p2'
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'file?name=img/[name].[ext]'
      }
    ]
  },
  resolve: {
    alias: {
      'phaser': PATHS.phaser,
      'pixi': PATHS.pixi,
      'p2': PATHS.p2
    }
  }
}
