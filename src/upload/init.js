const DEFAULT_OPTIONS = {
    // 图片压缩成指定宽高，若指设置width值，则height将等比例缩放
    compressImage: {
        width: false,
        height: false
    },
    // 允许上传文件的类型
    fileTypes: [],
    // 文件大小限制(单位:kb)
    fileSizeLimit: 2048,
    form: {

    },
    type: 'post',
    // 额外参数
    formData: {},
    // 上传地址
    uploadUrl: '',
    // 自动上传
    auto: true,
    // 是否选择多个文件
    multiple: true
}

export default function initMixin(BUpload) {
    BUpload.prototype._init = function(options) {
        this.options = Object.assign({}, DEFAULT_OPTIONS, options)

        this.waitUploadFiles = []
        this._events = {}

        this._handleOptions(this.options)

        this._addDOMEvent()

        this.enable()
    }

    BUpload.prototype._handleOptions = function(options) {
        this.uploader.multiple = options.multiple

        // If the compressImage param is set, the fileSizeLimit param fails.
        this.options._fileSizeLimit = options.compressImage.width || options.compressImage.height ? false : options.fileSizeLimit

        if (options.fileTypes.length) {
            let fileTypes = options.fileTypes.map(item => `.${item}`).join(',')
            this.uploader.accept = fileTypes
        }
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
