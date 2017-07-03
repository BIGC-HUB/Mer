// 定制方法 / 函数
const log = console.log.bind(console,'>>>')
// 去空格
String.prototype.html = function() {
    let html = this.slice(this.indexOf('<'))
    return html.replace(/>(\s+)</img, '><')
}
class c {
    // ( url, data, [func, sync, Method] )
    static guaSync(func) {
        setTimeout(function() {
            func()
        }, 0)
    }
    static find(select) {
        return Array.from(document.querySelectorAll(select))
    }
    static Ajax(request) {
        let req = {
            url: request.url,
            // 传对象 自动转JSON
            data: JSON.stringify(request.data) || null,
            method: request.method || 'POST',
            header: request.header || {},
            contentType: request.contentType || 'application/json',
            callback: request.callback || function(res) {
                console.log('读取成功！')
            }
        }
        let r = new XMLHttpRequest()
        let promise = new Promise(function(resolve, reject) {
            r.open(req.method, req.url, true)
            r.setRequestHeader('Content-Type', req.contentType)
            // setHeader
            Object.keys(req.header).forEach(key => {
                r.setRequestHeader(key, req.header[key])
            })
            r.onreadystatechange = function() {
                if (r.readyState === 4) {
                    let res = r.response
                    // 回调函数
                    req.callback(res)
                    // Promise 成功
                    resolve(res)
                }
            }
            r.onerror = function (err) {
                reject(err)
            }
            if (req.method === 'GET') {
                r.send()
            } else {
                // POST
                r.send(req.data)
            }
        })
        return promise
    }
    // ( name, [value, day] )
    static Cookie(name, value, day) {
        if (value === undefined) {
            // GET Cookie
            let arr = document.cookie.split('; ')
            for (let i of arr) {
                let e = i.split('=')
                if (e[0] === name) {
                    return e[1]
                }
            }
        } else {
            // POST Cookie
            let date = new Date()
            let str = ''
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
