import {warn} from '../util/debug'
import {FILE_STATUS} from '../util/config'
import {isBlob} from '../util/dom'

let fileCount = 0
const createObjectURL = window.URL.createObjectURL
const FORM_DATA = 'FormData'
const limitTypes = ['jpg', 'png']

const limitType = function(typeName) {
    return limitTypes.findIndex(type => typeName === type) !== -1
}

export default function coreMixin (BUpload) {
    BUpload.prototype.upload = function(fileId) {
        let waitFiles = this.waitUploadFiles
        if (!waitFiles.length) {
            return
        }

        let files = fileId ? [waitFiles[waitFiles.findIndex(file => file.id === fileId)]] : waitFiles
        this._readerFile(files)
    }

    BUpload.prototype.cancel = function(fileId) {
        console.log(fileId)
    }

    BUpload.prototype._changeEvent = function(e) {
        if (!this.enabled || !this._supportAttr(FORM_DATA)) {
            return
        }

        let files = this._filterFiles(e.srcElement.files)
        this.waitUploadFiles.push.apply(this.waitUploadFiles, files)

        this.trigger('select', files)

        // auto upload
        if (this.options.auto) {
            this._readerFile(this.waitUploadFiles)
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
        files.forEach((file) => {
            if (!this.options._fileSizeLimit && limitType(file.type) && !isBlob(file.file)) {
                console.log(file.id + '进行压缩')
                this._canvasCompress(file.src).then((blob) => {
                    file.file = blob
                    this._uploadFile(file)
                })
            } else {
                console.log(file.id + '不进行压缩')
                this._uploadFile(file)
            }
        })
    }

    BUpload.prototype._uploadFile = function(file) {
        if (file.status === FILE_STATUS.WAIT) {
            file.status = FILE_STATUS.PROGRESS
            console.log(file)
            let xhr = new XMLHttpRequest()
            // let formData = new FormData()
            xhr.open()
            xhr.send()
            xhr.onreadystatechange = function() {

            }
            xhr.onprogress = function() {

            }
            console.log(xhr)
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
        let filterArray = []
        let types = {}
        this.options.fileTypes.forEach((type) => {
            let key = type.toLowerCase()
            if (!types[key]) {
                types[key] = true
            }
        })
        for (let i = 0; i < files.length; i++) {
            let filesSplit = files[i].name.split('.')
            let imgType = filesSplit[filesSplit.length - 1].toLowerCase()
            let fileSize = parseFloat((files[i].size / 1024).toFixed(2))
            // if type and file size
            if (types[imgType] && (this.options.fileSizeLimit >= fileSize || !this.options.fileSizeLimit)) {
                let file = {
                    file: files[i],
                    id: ++fileCount,
                    size: fileSize,
                    unit: 'kb',
                    type: imgType,
                    status: FILE_STATUS.WAIT,
                    src: createObjectURL(files[i])
                }
                filterArray.push(file)
            }
        }
        return filterArray
    }
}
