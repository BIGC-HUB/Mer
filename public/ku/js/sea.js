// 定义 log c
const log = function() {
    console.log.apply(console, arguments)
}
window.c = function(select) {
    var arr = []
    if (select) {
        // 检查 select
        if (isNaN(Number(select.slice(0,1)))) {
            arr = document.querySelectorAll(select)
            if (arr.length === 1) {
                return arr[0]
            } else {
                return arr
            }
        }
    }
    return arr
}
// seaAjax ( url, data, [func, sync, Method] )
c.Ajax = (url, data, func, sync, Method) => {
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
// seaCookie ( name, [value, day] )
c.Cookie = (name, value, day) => {
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
