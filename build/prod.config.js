const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./base.config')

const resolve = (dir) => {
    return path.join(__dirname, '..', dir)
}

module.exports = merge(baseConfig, {
    entry: [
        './src/index.js'
    ],
    output: {
        library: 'betterUpload',
        libraryTarget: 'umd',
        filename: 'better-upload.js',
        path: resolve('dist')
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]
})
