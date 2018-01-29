export default function eventMixin(BUpload) {
    BUpload.prototype.on = function(type, fn, context = this) {
        if (!this._events[type]) {
            this._events[type] = []
        }

        this._events[type].push([fn, context])
    }

    BUpload.prototype.off = function(type, fn) {
        let events = this._events[type]
        if (!events) {
            return
        }

        let len = events.length

        for (let i = 0; i < len; i++) {
            if (!fn || events[i][0] === fn) {
                events[i][0] = undefined
            }
        }
    }

    BUpload.prototype.trigger = function(type) {
        let events = this._events[type]
        if (!events) {
            return
        }

        let len = events.length

        for (let i = 0; i < len; i++) {
            let [fn, context] = events[i]
            if (fn) {
                fn.apply(context, [].slice.call(arguments, 1))
            }
        }
    }

    BUpload.prototype.once = function(type, fn, context = this) {
        function magic() {
            this.off(type, magic)

            fn.apply(context, arguments)
        }

        this.on(type, magic)
    }
}
