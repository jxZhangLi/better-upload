const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./base.config')
const HtmlPlugin = require('html-webpack-plugin')

const resolve = (dir) => {
    return path.join(__dirname, '..', dir)
}

module.exports = merge(baseConfig, {
    devServer: {
        // host: 'localhost',
        contentBase: resolve('examples'),
        // historyApiFallback: true,
        // inline: true,
        hot: true,
        port: 3111,
        overlay: {
            warnings: true,
            errors: true
        }
        // hotOnly: true
    },
    entry: resolve('examples/main.js'),
    output: {
        filename: 'main.js'
    },
    plugins: [
        new HtmlPlugin({
            filename: 'index.html',
            template: './examples/index.html'
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
})
