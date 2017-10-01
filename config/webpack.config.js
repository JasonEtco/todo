const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const autoprefixer = require('autoprefixer')
const glob = require('glob')
const PurifyCSSPlugin = require('purifycss-webpack')

const browsers = [
  'last 2 versions',
  'ios_saf >= 8',
  'ie >= 10',
  'chrome >= 49',
  'firefox >= 49',
  '> 1%'
]

module.exports = {
  entry: {
    main: [
      'babel-polyfill',
      path.resolve(__dirname, '..', 'app', 'main.js')
    ]
  },
  output: {
    path: path.join(__dirname, '..', 'public'),
    filename: '[name].min.js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '..', 'app', 'index.tpl.html'),
      inject: 'body',
      filename: 'index.html'
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextPlugin('[name].min.css'),
    new PurifyCSSPlugin({
      moduleExtensions: ['.js'],
      paths: glob.sync(path.join(__dirname, '..', 'app', '**/*.js'))
    })
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', {
              targets: { browsers },
              debug: false,
              loose: true,
              modules: false,
              useBuiltIns: true
            }],
            'react'
          ]
        }
      }
    }, {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: ['css-loader', {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            plugins: () => [autoprefixer(browsers)]
          }
        }, {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            includePaths: [
              'node_modules'
            ]
          }
        }]
      })
    }]
  }
}
