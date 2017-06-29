const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function () {
  return {
    entry: {
      exif: './src/exif.js',
      main: './src/cropper.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          })
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin('[name].css'),
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      })
    ],
    devServer: {
      host: '0.0.0.0',
      disableHostCheck: true,
      port: 8200
    }
  }
}