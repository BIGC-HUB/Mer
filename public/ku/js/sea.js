// 定义 log c
const log = function() {
    console.log.apply(console, arguments)
}
// 选择器
window.Sea = function(select) {
    var obj = new Sea.init
    if (select) {
        // 检查 select
        if (isNaN(Number(select.slice(0,1)))) {
            arr = document.querySelectorAll(select)
            obj.length = arr.length
            for (var i = 0; i < obj.length; i++) {
                obj[i] = arr[i]
            }
        }
    }
    return obj
}
// 原型链
Sea.init = function() {
    this.length = 0
}
Sea.init.prototype = {
    css: function(key, value) {
        for (var i = 0; i < this.length; i++) {
            this[i].style[key] = value
        }
    }
}

// 方法
// ( url, data, [func, sync, Method] )
Sea.Ajax = (url, data, func, sync, Method) => {
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
Sea.Cookie = (name, value, day) => {
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

window.c = window.Sea
window.c.prototype = window.Sea.prototype

$(function(){
    a = c('i')
})
