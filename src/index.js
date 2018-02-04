import initMixin from './upload/init'
import coreMixin from './upload/core'
import eventMixin from './upload/event'

import {warn} from './util/debug'
import {isFileTag} from './util/util'

function BUpload(el, options) {
    this.uploader = typeof el === 'string' ? document.querySelector(el) : el
    if (!this.uploader || !isFileTag(this.uploader)) {
        warn('can not resolve the uploader dom')
    }

    return this._init(options)
}

initMixin(BUpload)
coreMixin(BUpload)
eventMixin(BUpload)

BUpload.Version = '0.0.1'

export default BUpload
