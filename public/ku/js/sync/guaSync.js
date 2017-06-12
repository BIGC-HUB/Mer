const fs = requrie('fs')
const guaSync = function(callback) {
    setTimeout(function() {
        callback()
    }, 0)
}
