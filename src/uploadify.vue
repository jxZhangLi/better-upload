<template>
    <div class="uploadify-wrapper">
        <input
            type="file"
            ref="uploadFiles"
            class="pubUploadImgFile"
            v-on:change="uploadImgFn($event)"
            accept="image/*"
            multiple
        />
    </div>
</template>
<style lang="stylus" rel="stylesheet/stylus">
    .uploadify-wrapper
        .pubUploadImgFile
            position: absolute
            left: 0
            top: 0
            width: 100%
            height: 100%
            opacity: 0
</style>
<script type="text/ecmascript-6">
    export default {
        data() {
            return {
            };
        },
        props: {
            isGif: {
                type: Boolean,
                defalut: false
            },
            // 上传url
            uploadUrl: String,
            // 压缩指定大小
            csWidth: Number,
            csHeight: Number,
            // 已上传的数量
            picLength: Number,
            // 只能上传的数量
            uploadCount: Number,
            // 是否存在删除图片
            delPhoto: String
        },
        methods: {
            uploadImgFn(event) {
                let el = event.srcElement;

                if (this.picLength + el.files.length > this.uploadCount) {
                    this.$emit('on-error', '最多只能上传'+ this.uploadCount +'张');
                    return;
                }

                if (typeof FileReader === 'undefined') {
                    this.$emit('on-error', '请更新浏览器在进行上传！');
                } else {
                    let reader = new FileReader(),
                        iNow = 0,
                        This = this;

                    callee(iNow);
                    function callee(i){
                        let type = el.files[i].type;

                        reader.readAsDataURL(el.files[i]);
                        reader.onload = function() {
                            let dataURL = this.result;

                            This.convertImgToBase64(dataURL, function(base64Img, urlType) {
                                This.imageToUpload(base64Img, el.files[i].name, urlType);

                                if (iNow === el.files.length - 1) {
                                    // 清空掉files中全部的文件
                                    This.$refs['uploadFiles'].value = '';
                                    return;
                                }
                                window.setTimeout(() => {
                                    callee(++iNow);
                                }, 1000);
                            }, type);
                        };
                    };

                }
            },
            imageToUpload(dataURL, name, urlType) {
                let formData = new FormData();
                    formData.append('file', this.convertBase64UrlToBlob(dataURL));
                    urlType = this.delPhoto || urlType;
                    formData.append('type', urlType);

                let _self = this;

                this.$http({
                  method: 'POST',
                  url: this.uploadUrl,
                  body: formData,
                  progress: function(xhr) {
                      if (xhr.lengthComputable) {
                          let progress = Math.round(xhr.loaded * 100 / xhr.total);
                          let obj = {
                              name: name,
                              progress: progress,
                              dataBase64: dataURL
                          };
                          _self.$emit('on-progress', obj);
                      }
                  }
                }).then((response) => {
                    let data = JSON.parse(response.data);
                    if (data instanceof Object) {
                        // 将这张图片的名字赋值进去
                        data.IMGname = name;
                    }
                    this.$emit('on-success', data);
                }, (response) => {
                    // 响应错误回调
                    this.$emit('on-error', '网络错误！');
                });
            },
            convertBase64UrlToBlob(urlData) {
                // 去掉url的头，并转换为byte
                let arrData = urlData.split(',');
                let bytes = window.atob(arrData[1]);
                let type = arrData[0].substring(5, arrData[0].length - 7);
                // 处理异常,将ascii码小于0的转换为大于0
                let ab = new ArrayBuffer(bytes.length);
                let ia = new Uint8Array(ab);
                for (let i = 0; i < bytes.length; i++) {
                    ia[i] = bytes.charCodeAt(i);
                }
                return new Blob([ab], {type: type || 'image/jpeg'});
            },
            // 压缩图片
            convertImgToBase64(url, callback, type) {
                let urlType;
                let isGif = type === 'image/gif';

                if (isGif && this.isGif) {
                    urlType = isGif ? '{gif}' : '';
                    callback.call(this, url, urlType);
                } else if (this.csWidth || this.csHeight) {
                    let This = this;
                    let canvas = document.createElement('CANVAS');
                    let ctx = canvas.getContext('2d');
                    let img = new Image();
                        img.src = url;
                        img.onload = function() {
                              let width = img.width,
                                  height = img.height;

                              let rect = This.diversCompress(width, height);
                              // console.log(rect);
                              let csWidth = rect.csWidth,
                                  csHeight = rect.csHeight,
                                  cx = rect.cx,
                                  cy = rect.cy,
                                  iWidth = rect.width,
                                  iHeight = rect.height;

                              canvas.width = csWidth;
                              canvas.height = csHeight;

                              ctx.drawImage(img, cx, cy, iWidth, iHeight, 0, 0, csWidth, csHeight);
                              let dataURL = canvas.toDataURL(type || 'image/jpeg');
                              // 判断是否为长图\是否为GIF
                              urlType = isGif ? '{gif}' : (parseInt(csWidth * 2.5) <= csHeight ? '{long}' : '');
                              callback.call(this, dataURL, urlType);
                              canvas = null;
                        };
                        img.onerror = function(e) {
                            This.$emit('on-error', '读取图片失败');
                        };
                }
            },
            diversCompress(oWdith, oHeight) {
                let csWidth  = oWdith,
                    csHeight = oHeight,
                    cx = 0,
                    cy = 0;

                if (this.csWidth && this.csHeight) {
                    if (oWdith > oHeight) {
                        oWdith = oHeight;
                    } else {
                        oHeight = oWdith;
                    }
                    cx = parseInt((csWidth - oWdith) / 2);
                    cy = parseInt((csHeight - oHeight) / 2);
                    // 设置
                    csWidth = this.csWidth;
                    csHeight = this.csHeight;
                } else if (this.csWidth) {
                    csWidth = this.csWidth;
                    csHeight = parseInt(oHeight * (csWidth / oWdith));
                } else if (this.csHeight) {
                    csHeight = this.csHeight;
                    csWidth = parseInt(oWdith * (csHeight / oHeight));
                }
                return {
                    csWidth,
                    csHeight,
                    cx,
                    cy,
                    width: oWdith,
                    height: oHeight
                }
            }
        }
    };
</script>
