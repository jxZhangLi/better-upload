const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./base.config')
const HtmlPlugin = require('html-webpack-plugin')
// var axios = require('axios')
// const multipart = require('connect-multiparty')
// const multipartMiddleware = multipart()
var multiparty = require('multiparty');
var fs = require('fs');
// formidable = require("formidable")

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
            /**
             * 断点续传的方法
             */
            app.post("/uploadFile", function(req, res, next) {
                console.log("断点续传......");
                var form = new multiparty.Form();
                var count = 0;
                var fileName = "";
                var isLastChunk = false;
                var chunkImgData = null; //分块数据
                var chunks = [];
                var size = 0;
                form.on('error', function(err) {
                    console.error('Error parsing form: ' + err.stack);
                });

                //获取表单的文本字段
                form.on("field", function(name, value) {
                    console.log(name + "       >>>>>>>>>>>>>>>" + value)
                    if (name === "fileName") {
                        fileName = value;
                    }else if(name==="isLastChunk"){
                        isLastChunk=value;
                    }
                });

                //拿到分段上传的数据    
                form.on('part', function(part) {
                    console.log("图片名称:>>>>>>>>>>>>>>>>:" + part.filename + ">>>>>>" + part.name)
                    // Object.keys(part).forEach(function(name) {
                    //     console.log('>>>>>>>>>>> ' + name);
                    // });

                    if (!part.filename) {
                        console.log('got field named ' + part.name);
                        // part.resume();
                    }

                    if (part.filename) {
                        count++;
                        console.log('got file named ' + part.name);
                        // part.resume();
                    }

                    chunks = [];
                    size = 0;
                    //分段数据在part的data事件中获取，一次请求中的数据会放分成多个buffer，所以需要一个imgFile数组累加
                    part.on("data", function(chunk) {
                        if (chunk.length === 0) {
                            return;
                        }
                        chunks.push(chunk);
                        size += chunk.length;
                    });

                    //分段数据结束
                    part.on("end", function() {
                        chunkImgData = bufferUtils(chunks, size);
                    });

                    part.on('error', function(err) {
                        console.error(err);
                    });
                });

                // Close emitted after form parsed 
                form.on('close', function() {
                    console.log("================================="+fileName)
                    var filename = resolve('examples/uploads/') + fileName;
                    console.log(filename)
                    saveFile(filename, chunkImgData,size);
                    console.log('Upload completed!');
                });

                form.parse(req);
                res.json({
                    "success":true
                })
                
            });

            /**
             * 写数据到文件
             */
            function saveFile(path, data,size) {
                fs.open(path, 'a', function(err, fd) {
                    if (err) {
                        throw err;
                    }
                    fs.write(fd, data, 0, size, function() {
                        fs.close(fd);
                    })
                })
            }

            /**
             * buffer组装的工具类
             */
            function bufferUtils(chunks, size) {
                var data = new Buffer(size);
                for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                    var chunk = chunks[i];
                    chunk.copy(data, pos);
                    pos += chunk.length;
                }
                return data;
            }

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
