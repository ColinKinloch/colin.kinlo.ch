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
          loader: 'json-loader'
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  targets: {
                    browsers: ["last 2 versions", "safari >= 7"]
                  },
                  modules: false
                }]
              ]
            }
          },
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
          loader: 'json-loader'
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  targets: {
                    node: 'current'
                  },
                  modules: false
                }]
              ]
            }
          },
          exclude: /node_modules/
        }
      ]
    }
  }
]
