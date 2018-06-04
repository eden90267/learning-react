const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: "./index-client.js",
  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'stage-0', 'react']
          }
        },
      }
    ]
  }
}