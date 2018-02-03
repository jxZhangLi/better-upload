const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./base.config')
const HtmlPlugin = require('html-webpack-plugin')
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()

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
        },
        // hotOnly: true
        before(app) {
            app.use(multipart({
                uploadDir:resolve('examples/uploads')
            }))
            app.post('/uploadFile', multipartMiddleware, function(req, res) {
                let pathArray = req.files.file.path.split('\\')
                let filename = pathArray[pathArray.length - 1]
                console.log(req.files)
                res.json({
                    name: req.body.name,
                    age: req.body.age,
                    imageUrl: req.protocol + '://' + req.host + ':3111' + '/uploads/' + filename
                })
            })
        }
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
