const path = require('path')

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
}

module.exports = {
  entry: path.join(PATHS.app, 'index.js'),
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
      }
    ]
  }
}
