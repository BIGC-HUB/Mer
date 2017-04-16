// 定义 log c
const log = function() {
    console.log.apply(console, arguments)
}
window.c = new Object
// url data 必填
c.Ajax = function(url, data, func, sync, Method) {
    sync = sync || true // true 异步
    func = func || function(e) {
        console.log(e)
    }
    Method = Method || 'POST'
    var r = new XMLHttpRequest() // 创建 AJAX 对象
    r.open(Method, url, sync) // 请求方法 网址 同步异步
    r.setRequestHeader('Content-Type', 'application/json')
    r.onreadystatechange = function() {
        if (r.readyState === 4) { // 完成
            func(r.response) // 注册 响应函数 结果
        }
    }
    if (data) { // POST
        data = JSON.stringify(data)
        r.send(data)
    } else { // GET
        r.send()
    } // 发送 请求
}
// name 必填
c.Cookie = function(name, value, day) {
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
