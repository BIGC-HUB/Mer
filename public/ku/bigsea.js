(function(global, factory ) {
	"use strict";
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = global.document ?
			factory(global, true) :
			function(w) {
				if (!w.document) {
					throw new Error("Sea requires a window with a document");
				}
				return factory(w);
			};
	} else {
		factory(global);
	}
}) ( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
"use strict";
// 选择器
var Sea = function(select) {
    if (typeof select === 'function') {
        window.onload = select
    } else {
        var push = [].push
        var obj = new Sea.init
        if (select) {
            // 检查 select
            if (isNaN(Number(select.slice(0,1)))) {
                var nodeList = document.querySelectorAll(select)
                for (var i = 0; i < nodeList.length; i++) {
                    push.call(obj, nodeList[i])
                }
                return obj
            }
        }
        return obj
    }
}
// 原型链
Sea.init = function() {}
Sea.init.prototype = {
    css: function(key, value) {
        for (var i = 0; i < this.length; i++) {
            this[i].style[key] = value
        }
        return this
    }
}

// 定制方法 / 函数
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

if ( !noGlobal ) {
	window.c = Sea;
    // 定义 log c
    window.log = function() {
        console.log.apply(console, arguments)
    }
}
return Sea
})
