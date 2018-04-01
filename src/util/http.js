import {FILE_STATUS} from '../util/config'

const Storage = window.localStorage

export function request (options) {
    let { fileInfo, onSuccess, onError, onProgress, sliceSize } = options
    let currentSlice = fileInfo.slice
    let sliceSum = Math.ceil(fileInfo.file.size / sliceSize)
    let isSlice = sliceSize && fileInfo.file.size > sliceSize
    let xhr = new XMLHttpRequest()

    fileInfo.status = FILE_STATUS.PROGRESS

    xhr.onreadystatechange = function(e) {
        if (xhr.readyState === 4) {
            let res = JSON.parse(xhr.responseText)
            if (xhr.status === 200) {
                if (isSlice && currentSlice <= sliceSum) {
                    currentSlice++

                    // 需要存储 name -> object([slice, id])
                    let saveData = {
                        id: fileInfo.id,
                        currentSlice
                    }

                    Storage.setItem(fileInfo.file.name, JSON.stringify(saveData))

                    _sendBlob({
                        xhr,
                        file: fileInfo.file,
                        currentSlice,
                        ...options
                    })
                } else {
                    fileInfo.status = FILE_STATUS.SUCCESS
                    Storage.removeItem(fileInfo.file.name)

                    onSuccess && onSuccess({
                        res,
                        fileInfo
                    })
                }
            } else {
                fileInfo.status = FILE_STATUS.ERROR
                onError && onError({
                    res,
                    fileInfo
                })
            }
        }
    }
    xhr.upload.onprogress = function(e) {
        let progress = 0

        if (isSlice) {
            progress = parseFloat((currentSlice / sliceSum).toFixed(2))
        } else {
            progress = parseFloat((e.loaded / e.total).toFixed(2))
        }

        onProgress && onProgress({
            progress,
            fileInfo
        })
    }

    _sendBlob({
        xhr,
        file: fileInfo.file,
        currentSlice,
        ...options
    })
}

function _sendBlob(options) {
    let { xhr, method, url, params, sliceSize, file, currentSlice, fileInfo } = options
    let fd = new FormData()

    xhr.open(method, url, true)
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    if (sliceSize && file.size > sliceSize) {
        // slice file
        params.file = file.slice(currentSlice * sliceSize, (currentSlice + 1) * sliceSize)
    } else {
        // all file
        params.file = file
    }

    params.fileName = `${fileInfo.id}.${fileInfo.type}`

    if (params) {
        for (let key in params) {
            fd.append(key, params[key])
        }
    }
    xhr.send(fd)
}
