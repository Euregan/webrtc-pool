const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'public')
  }
}
