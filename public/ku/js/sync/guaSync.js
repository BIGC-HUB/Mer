const fs = requrie('fs')
const log = console.log.bind(console,'>>>')
const guaSync = function(callback) {
    setTimeout(function() {
        callback()
    }, 0)
}
