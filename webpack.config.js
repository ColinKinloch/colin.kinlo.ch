/* global __dirname */

module.exports = [
  {
    name: 'client',
    entry: {
      js: './client/'
    },
    output: {
      path: __dirname + '/dist/public/',
      filename: 'client.js'
    },
    target: 'web',
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/
        }
      ]
    }
  },
  {
    name: 'server',
    entry: {
      js: './server/'
    },
    output: {
      path: __dirname + '/dist/',
      filename: 'server.js'
    },
    target: 'node',
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/
        }
      ]
    }
  }
]
