const path = require('path')

module.exports = (env, {mode}) => ({
  mode: mode,
  entry: path.resolve(__dirname, mode === 'development' ? 'testClient.js' : 'src/client/index.js'),
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, mode === 'development' ? 'public' : 'dist')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'usage',
                  corejs: 3
                }
              ]
            ]
          }
        }
      }
    ]
  }
})
