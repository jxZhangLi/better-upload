const DEFAULT_OPTIONS = {
    // 图片压缩成指定宽高，若指设置width值，则height将等比例缩放
    compressImage: {
        width: false,
        height: false
    },
    // 上传配置
    config: {
        method: 'post',
        url: '',
        params: {}
    },
    // 允许上传文件的类型
    fileTypes: [],
    // 文件大小限制(单位:kb)
    fileSizeLimit: 1024 * 2,
    // 断点传续每次文件大小(单位:b)
    fileSliceSize: 1024 * 1024 * 2,
    // 自动上传
    auto: true,
    // 是否选择多个文件
    multiple: true
}

export default function initMixin(BUpload) {
    BUpload.prototype._init = function(options) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options)

        this.uploadFiles = []
        this._events = {}

        this._handleOptions(this.options)

        this._addDOMEvent()

        this.enable()
    }

    BUpload.prototype._handleOptions = function(options) {
        this.uploader.multiple = options.multiple

        // 如果设置了 compressImage 参数的话，则 fileSizeLimit 参数失效.
        options._fileSizeLimit = options.compressImage.width || options.compressImage.height ? false : options.fileSizeLimit

        if (options.fileTypes.length) {
            let fileTypes = options.fileTypes.map(item => `.${item}`).join(',')
            this.uploader.accept = fileTypes
        }

        options.config = Object.assign({}, DEFAULT_OPTIONS.config, options.config)
    }

    BUpload.prototype._addDOMEvent = function() {
        this.uploader.addEventListener('change', this._changeEvent.bind(this), false)
    }

    BUpload.prototype._removeDOMEvent = function() {
        this.uploader.removeEventListener('change', this._changeEvent.bind(this), false)
    }

    BUpload.prototype.enable = function () {
        this.enabled = true
    }

    BUpload.prototype.disable = function () {
        this.enabled = false
    }
}
