const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');

process.noDeprecation = true

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist', 'assets'),
    filename: "bundle.js",
    publicPath: 'assets',
    sourceMapFilename: 'bundle.map'
  },
  devtool: '#source-map',
  devServer: {
    inline: true,
    contentBase: './dist',
    port: 3000
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
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['style-loader', 'css-loader', {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')]
            }
          }]
        })
      },
      {
        test: /\.scss/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')]
            }
          }, 'sass-loader']
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("bundle.css"),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      warnings: false,
      mangle: false
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.optimize\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {discardComments: {removeAll: true}},
      canPrint: true
    })
  ]
};