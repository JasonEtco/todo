const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
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

const web = {
  entry: {
    main: [
      'babel-polyfill',
      path.resolve(__dirname, 'src', 'main.js')
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].min.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextPlugin('[name].min.css'),
    new PurifyCSSPlugin({
      minimize: true,
      moduleExtensions: ['.js'],
      paths: glob.sync(path.join(__dirname, 'src', '**/*.js'))
    }),
    new CopyWebpackPlugin([
      {
        context: path.join(__dirname, 'src'),
        from: 'assets',
        to: 'assets'
      }
    ])
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

const server = {
  entry: {
    server: path.resolve(__dirname, 'src', 'components', 'App.js')
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].min.js',
    publicPath: '/',
    library: '',
    libraryTarget: 'commonjs'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
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
      use: 'ignore-loader'
    }]
  }
}

module.exports = [web, server]
