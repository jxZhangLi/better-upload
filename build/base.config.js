const path = require('path')

const resolve = (dir) => {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': resolve('src'),
            'examples': resolve('examples')
        }
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            },
            {
                test: /\.(css|styl)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            module: true
                        }
                    },
                    'stylus-loader'
                ]
            },
            {
                test: /\.js$/,
                use: ['babel-loader'],
                include: [resolve('src'), resolve('examples')]
            },
            {
                test: /\.(js)$/,
                enforce: 'pre',
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            formatter: require('eslint-friendly-formatter')
                        }
                    }
                ],
                include: [resolve('src'), resolve('examples')]
            }
        ]
    }
}
