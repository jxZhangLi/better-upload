import {FILE_STATUS} from '../util/config'

export function request (options) {
    let xhr = new XMLHttpRequest()
    let fd = new FormData()

    options.fileInfo.status = FILE_STATUS.PROGRESS
    xhr.open(options.method, options.url, true)
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    if (options.params) {
        for (let key in options.params) {
            fd.append(key, options.params[key])
        }
    }
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                options.fileInfo.status = FILE_STATUS.SUCCESS
                options.onSuccess && options.onSuccess({
                    msg: '上传成功！',
                    fileInfo: options.fileInfo
                })
            } else {
                options.fileInfo.status = FILE_STATUS.ERROR
                options.onError && options.onError({
                    msg: '上传失败！',
                    fileInfo: options.fileInfo
                })
            }
        }
    }
    xhr.upload.onprogress = function(e) {
        let progress = parseFloat((e.loaded / e.total).toFixed(2))
        options.onProgress && options.onProgress({
            progress,
            fileInfo: options.fileInfo
        })
    }
    xhr.send(fd)
}
