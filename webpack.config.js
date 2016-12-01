var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: [
    __dirname + '/src/app'
  ],
  devtool: 'eval',
  output: {
    path: __dirname + '/build',
    filename: 'app.js',
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: 'ts'}
    ]
  },
  resolve: {
    modulesDirectories: [
      'node_modules'
    ],
    extensions: ['.js', '.ts', '', '.json']
  }
};
