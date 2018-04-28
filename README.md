# better-upload
in development......

### 调用插件目前实现想法
```javascript
import BUpload from '@/index'

let fromUpload = new BUpload('.upload-input', {
    config: {
        url: 'http://localhost:3111/uploadFile',
        params: {
            name: 'Arey',
            age: 20
        }
    },
    multiple: true,
    fileSizeLimit: 50 * 1024,
    fileTypes: ['mp4', 'jpg'],
    // fileSliceSize: false,
    compressImage: {
        width: 500,
        height: 500
    },
    auto: false,
    // html 模板输入
    wrapperEl: '#app',
    HTMLtemplate(file) {
        return `
            <div class="upload-file-${file.id}">
                <img width="50" height="50" src="${file.src}"/>
                <span>序号：${file.id} 文件大小： ${file.size + file.unit}</span>
                <progress v-show="${file.progress !== 0}" value="${100 * file.progress}" max="100" class="progress"></progress>
                <span>${file.status === 0 ? '等待上传' : file.status === 1 ? '上传中' : file.status === 2 ? '上传成功' : '上传失败'}</span>
                <button v-click="uploadFn('${file.id}', true)" class="suc-btn">上传</button>
                <button v-click="cancelFn('${file.id}', false)" class="cancel-btn">取消</button>
            </div>
        `
    },
    methods: {
        uploadFn: function(fileId, boolean) {
            console.log(fileId, boolean)
            fromUpload.upload(fileId)
        },
        cancelFn(fileId, boolean) {
            console.log(fileId, boolean)
            fromUpload.cancel(fileId)
        }
    }
})

// fromUpload.on('select', function(files) {
//     console.log('select', files)
//     let form = ''
//     files.forEach((file) => {
//         form += `
//             <div class="upload-file-${file.id}">
//                 <img width="50" height="50" src="${file.src}"/>
//                 <span>序号：${file.id} 文件大小： ${file.size + file.unit}</span>
//                 <progress value="${100 * file.progress}" max="100" class="progress-${file.id}"></progress>
//                 <button onclick="uploadFn('${file.id}')" class="sucBtn-${file.id}">上传</button>
//                 <button onclick="cancelFn('${file.id}')" class="cancelBtn-${file.id}">取消</button>
//             </div>
//         `
//     })
//     document.querySelector('#app').innerHTML += form
// })

fromUpload.on('beforeStart', function(file) {
    // 可以动态修改参数
    console.log('beforeStart', file)
})

// fromUpload.on('progress', function(file) {
//     console.log('progress', file)
//     let progressDOM = document.querySelector('.progress-' + file.fileInfo.id)
//     progressDOM.value = 100 * file.progress
// })

fromUpload.on('success', function(file) {
    console.log('success', file)
})

fromUpload.on('error', function(file) {
    console.log('error', file)
})

window.fromUpload = fromUpload
console.log(window.fromUpload)

```
