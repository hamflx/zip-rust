const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, opts) => ({
  mode: opts.mode || 'development',
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  plugins: [new HtmlWebpackPlugin(
    {
      template: path.resolve(__dirname, 'index.html'),
    }
  )],
})
