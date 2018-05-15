var path = require('path');

process.noDeprecation = true;

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist', 'assets'),
    filename: "bundle.js"
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
      },
    ]
  }
};