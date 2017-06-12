// 定制方法 / 函数
const log = console.log.bind(console)
// 去空格
String.prototype.html = function() {
    let html = this.slice(this.indexOf('<'))
    return html.replace(/>(\s+)</img, '><')
}
class c {
    // ( url, data, [func, sync, Method] )
    static Ajax(request) {
        var req = {
            url: request.url,
            data: request.data || null,
            sync: request.sync || true,
            method: request.method || 'POST',
            contentType: request.contentType || 'application/json',
            func: request.callback || function(res) {
                console.log('读取成功！')
            }
        }
        var res = null
        var r = new XMLHttpRequest()
        r.open(req.method, req.url, req.sync)
        r.setRequestHeader('Content-Type', req.contentType)
        r.onreadystatechange = function() {
            if (r.readyState === 4) {
                res = r.response
                req.func(res)
            }
        }
        if (req.method === 'GET') {
            r.send()
        } else {
            // POST
            r.send(req.data)
        }
        return res
    }
    // ( name, [value, day] )
    static Cookie(name, value, day) {
        if (value === undefined) {
            // GET Cookie
            var arr = document.cookie.split('; ')
            for (var i of arr) {
                var e = i.split('=')
                if (e[0] === name) {
                    return e[1]
                }
            }
        } else {
            // POST Cookie
            var date = new Date()
            var str = ''
            if (Number.isInteger(day)) {
                date.setTime(date.getTime() + day * 24 * 3600 * 1000)
                str = ";expires=" + date.toGMTString()
            }
            document.cookie = name + "=" + encodeURIComponent(value) + str
        }
    }
}
// 继承
// class User extends c {
//     constructor(data) {
//         super()
//     }
// }
