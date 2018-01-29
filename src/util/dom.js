export function isFileTag(dom) {
    return dom.tagName === 'INPUT' && dom.type === 'file'
}

export function isBlob(obj) {
    return Object.prototype.toString.call(obj) === '[object Blob]'
}
