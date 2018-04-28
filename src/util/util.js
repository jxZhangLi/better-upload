export function isFileTag(dom) {
    return dom.tagName === 'INPUT' && dom.type === 'file'
}

export function isBlob(obj) {
    return Object.prototype.toString.call(obj) === '[object Blob]'
}

export function deepCopy(obj) {
    if (typeof obj !== 'object') return
    let newObj = obj instanceof Array ? [] : {}
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key]
        }
    }
    return newObj
}

export function findItem(data, target) {
    return target ? [data[data.findIndex(file => file['id'] === target)]] : data
}

export function parseDOM(sHtml) {
    let createDiv = document.createElement('div')

    createDiv.innerHTML = sHtml

    return createDiv.children[0]
}

export function addEvent(el, type, fn, capture) {
    el.addEventListener(type, fn, {passive: false, capture: !!capture})
}

export function removeEvent(el, type, fn, capture) {
    el.removeEventListener(type, fn, {passive: false, capture: !!capture})
}
