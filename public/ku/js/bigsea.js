// 定制方法 / 函数
const log = console.log.bind(console)
// 去空格
String.prototype.html = function() {
    let html = this.slice(this.indexOf('<'))
    return html.replace(/>(\s+)</img, '><')
}
class c {
    // ( url, data, [func, sync, Method] )
    static Ajax(url, data, func, sync, Method) {
        // true 异步
        sync = sync || true
        // 注册 响应函数
        func = func || function(e) {
            console.log(e)
        }
        Method = Method || 'POST'
        // 创建 AJAX 对象
        var r = new XMLHttpRequest()
        r.open(Method, url, sync)
        r.setRequestHeader('Content-Type', 'application/json')
        r.onreadystatechange = function() {
            // 完成
            if (r.readyState === 4) {
                func(r.response)
            }
        }
        // POST
        if (data) {
            data = JSON.stringify(data)
            r.send(data)
            // GET
        } else {
            // 发送 请求
            r.send()
        }
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
