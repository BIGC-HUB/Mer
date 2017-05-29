(function(func) {
    "use strict";
    var Sea = new Object
	var fn = {
		css: function(key, value) {
			for (var i = 0; i < this.length; i++) {
				this[i].style[key] = value
			}
			return this
		},
		on: function(events, listen, func) {
			if (typeof listen === 'function') {
				func = listen
				for (var i = 0; i < this.length; i++) {
					this[i].addEventListener(events, func, false)
				}
			}
		},
		html: function(html) {
			if (html) {
				this[0].innerHTML = html
			} else {
				return this[0].innerHTML
			}
		}
	}
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = func(false, Sea)
    } else {
        // 选择器
        Sea = function(select) {
            if (typeof select === 'function') {
                window.onload = select
            } else {
                var push = [].push
                var obj = new Sea.init
                if (select) {
                    // 检查 select
                    if (isNaN(Number(select.slice(0, 1)))) {
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
        Sea.init.prototype = fn
        func(true, Sea)
    }
})(function(web, Sea) {
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
    // 前端
    if (web) {
        window.c = Sea;
        // 定义 log c
        window.log = function() {
            console.log.apply(console, arguments)
        }
    }
    return Sea
})
