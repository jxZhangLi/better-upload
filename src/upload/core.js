import {warn} from '../util/debug'
import {FILE_STATUS, LIMIT_TYPES} from '../util/config'
import {isBlob, deepCopy, findItem} from '../util/util'
import {request} from '../util/http'

const CreateObjectURL = window.URL.createObjectURL
const Storage = window.localStorage

const limitType = function(typeName) {
    return LIMIT_TYPES.findIndex(type => typeName === type) !== -1
}

export default function coreMixin (BUpload) {
    BUpload.prototype.upload = function(id) {
        let files = findItem(this.uploadFiles, id)
        this._readerFile(files)
    }

    BUpload.prototype.cancel = function(id) {
        let files = findItem(this.uploadFiles, id)
        console.log(files)
    }

    BUpload.prototype._changeEvent = function(e) {
        if (!this.enabled || !this._supportAttr('FormData')) {
            return
        }

        let uploadFiles = this.uploadFiles
        let files = this._filterFiles(e.srcElement.files)
        uploadFiles.push.apply(uploadFiles, files)

        this.trigger('select', files)

        // auto upload
        if (this.options.auto) {
            this._readerFile(uploadFiles)
        }

        // 清除 input = ''
    }

    BUpload.prototype._supportAttr = function(attrName) {
        if (typeof window[attrName] === 'undefined') {
            warn(`the browser does not support the ${attrName} attribute`)
            return false
        }
        return true
    }

    BUpload.prototype._readerFile = function(files) {
        files.forEach((fileItem) => {
            // 只压缩图片
            if (!this.options._fileSizeLimit && limitType(fileItem.type) && !isBlob(fileItem.file)) {
                this._canvasCompress(fileItem.src).then((blob) => {
                    // blob -> file
                    fileItem.file = new File([blob], fileItem.file.name)
                    this._uploadFile(fileItem)
                })
            } else {
                this._uploadFile(fileItem)
            }
        })
    }

    BUpload.prototype._uploadFile = function(oFile) {
        if (oFile.status === FILE_STATUS.WAIT) {
            let self = this
            let options = deepCopy(this.options.config)

            this.trigger('beforeStart', options)

            request({
                ...options,
                fileInfo: oFile,
                sliceSize: this.options.fileSliceSize,
                onProgress(e) {
                    self.trigger('progress', e)
                },
                onSuccess(e) {
                    self.trigger('success', e)
                },
                onError(e) {
                    self.trigger('error', e)
                }
            })
        }
    }

    BUpload.prototype._canvasCompress = function(url) {
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        let image = new Image()
        image.src = url
        return new Promise((resolve, reject) => {
            image.onload = () => {
                let nWidth = image.width
                let nHeight = image.height
                let {csWidth, csHeight, cx, cy, width, height} = this._normalizeSize(nWidth, nHeight)
                // console.log(csWidth, csHeight, cx, cy, width, height)
                canvas.width = csWidth
                canvas.height = csHeight
                ctx.drawImage(image, cx, cy, width, height, 0, 0, csWidth, csHeight)
                canvas.toBlob(function(blob) {
                    resolve(blob)
                })
            }
        })
    }

    BUpload.prototype._normalizeSize = function(width, height) {
        let csImageWidth = this.options.compressImage.width
        let csImageHeight = this.options.compressImage.height
        let csWidth = width
        let csHeight = height
        let cx = 0
        let cy = 0

        if (csImageWidth && csImageHeight) {
            if (width > height) {
                width = height
            } else {
                height = width
            }
            cx = parseInt((csWidth - width) / 2)
            cy = parseInt((csHeight - height) / 2)
            csWidth = csImageWidth
            csHeight = csImageHeight
        } else if (csImageWidth) {
            csWidth = csImageWidth
            csHeight = parseInt(height * (csWidth / width))
        } else if (csImageHeight) {
            csHeight = csImageHeight
            csWidth = parseInt(width * (csHeight / height))
        }
        return {
            csWidth,
            csHeight,
            cx,
            cy,
            width,
            height
        }
    }

    BUpload.prototype._filterFiles = function(files) {
        let sliceSize = this.options.fileSliceSize
        let filterArray = []
        let types = {}

        this.options.fileTypes.forEach((type) => {
            let key = type.toLowerCase()
            if (!types[key]) {
                types[key] = true
            }
        })

        for (let i = 0; i < files.length; i++) {
            let splitArray = files[i].name.split('.')
            let imgType = splitArray[splitArray.length - 1].toLowerCase()
            let fileSize = parseFloat((files[i].size / 1024).toFixed(2))
            let randomId = Math.random().toString(36).substr(2)

            // if type and file size
            if (types[imgType]) {
                if (this.options.fileSizeLimit >= fileSize || !this.options.fileSizeLimit) {
                    let localFile = JSON.parse(Storage.getItem(files[i].name))
                    let file = {
                        file: files[i],
                        id: localFile ? localFile.id : randomId,
                        size: fileSize,
                        unit: 'kb',
                        type: imgType,
                        status: FILE_STATUS.WAIT,
                        src: CreateObjectURL(files[i]),
                        slice: localFile ? localFile.currentSlice : 0,
                        progress: localFile ? parseFloat((localFile.currentSlice * sliceSize / files[i].size).toFixed(2)) : 0
                    }
                    filterArray.push(file)
                } else {
                    warn(`限制文件大小为 ${this.options.fileSizeLimit}，但是当前文件大小为：${fileSize}`)
                }
            } else {
                warn(`当前文件：${files[i].name} 无法进行上传，需要在 fileTypes 参数中添加类型`)
            }
        }
        return filterArray
    }
}
