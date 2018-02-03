import BUpload from '@/index'

let fromUpload = new BUpload('.upload-input', {
    config: {
        method: 'post',
        url: 'http://localhost:3111/uploadFile',
        params: {
            name: 'Arey',
            age: 20
        }
    },
    // multiple: false,
    fileSizeLimit: 31024,
    fileTypes: ['png', 'jpg', 'psd', 'zip'],
    compressImage: {
        width: 500,
        height: 500
    },
    auto: false
})

fromUpload.on('select', function(files) {
    console.log('select', files)
    let form = ''
    files.forEach((file) => {
        form += `
            <div class="upload-file-${file.id}">
                <img width="50" height="50" src="${file.src}"/>
                <span>序号：${file.id} 文件大小： ${file.size + file.unit}</span>
                <progress value="0" max="100"></progress>
                <button onclick="uploadFn(${file.id})">上传</button>
                <button onclick="cancelFn(${file.id})">暂停</button>
            </div>
        `
    })
    document.querySelector('#app').innerHTML += form
})

window.fromUpload = fromUpload
console.log(window.fromUpload)
