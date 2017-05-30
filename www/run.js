// 引入 express 并且创建一个 express 实例赋值给 app
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('cookie-session')

const log = console.log.bind(console)
const config = require('../data/config')

// 先初始化一个 express 实例
const app = express()

// 设置 bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// 设置 session
app.use(session({ secret: config.key, }))

// 公共 文件
app.use(express.static('public'))


// 引入 sms API
const Alidayu = require('super-alidayu')
const client = new Alidayu({
    app_key: '23658012',
    secret: '774c4d0876b01d83b58470809d1e8947'
})

// 摘要 算法
const crypto = require('crypto')
const sha1 = (password,salt='') => {
    const mode = 'sha1'
    let _init = function(str) {
        let hash = crypto.createHash(mode)
        hash.update(str)
        let hex = hash.digest('hex')
        return hex
    }
    let hash = _init(password)// hash
    return _init(hash + config.key) // 加盐
}
const enAes256 = (str, salt='') => {
    const mode = 'aes-256-cbc'
    let aes = crypto.createCipher(mode, config.key)
    let result = aes.update(str, 'utf8', 'hex')
    return result + aes.final('hex')
}
const deAes256 = (str, salt='') => {
    const mode = 'aes-256-cbc'
    let deAes = crypto.createDecipher(mode, config.key)
    let result = deAes.update(str, 'hex', 'utf8')
    return result + deAes.final('utf8')
}

// User 保存注册未完成信息
var User = {}
const Mer = {
    SMS: function() {
        return String(parseInt(Math.random()*(10000-1000)+1000))
    },
    cookie: function(req) {
        // Cookie
        var arr = req.headers.cookie.split('; ')
        var cookie = {}
        for (var i of arr) {
            var e = i.split('=')
            cookie[e[0]] = decodeURIComponent(e[1])
        }
        return cookie
    },
    data: function(cookie) {
        var i = new Object
        if (cookie.name) {
            name = cookie.name
        } else {
            return i
        }
        var Obj = JSON.parse(fs.readFileSync('data/user/phone.json', 'utf8'))
        // Phone Number
        if (!isNaN(name) && name.length === 11) {
            if (Obj[name] === undefined) {
                return i
            } else {
                i.phone = name
            }
        } else {
            for (var phone in Obj) {
                // 忽略大小写
                if (Obj[phone].name.toLowerCase() === name.toLowerCase()) {
                    i.phone = phone
                    break
                }
            }
            if (i.phone === undefined) {
                return i
            }
        }
        // Key
        i.key =  Obj[i.phone].key
        // Name
        i.name = Obj[i.phone].name
        return i
    }
}

// 主页
app.get('/', (req, res) => {
    let data
    let host = req.headers.host.split(':')[0]
    if (host === 'localhost' || host === '127.0.0.1') {
        data = fs.readFileSync('www/server.html', 'utf8')
    } else {
        data = fs.readFileSync('www/index.html', 'utf8')
    }
    res.send(data)
})
// 任意门
app.post('/door', function (req, res) {
    var random = function(obj) {
        var arr = Object.keys(obj)
        var i = parseInt(Math.random() * arr.length)
        return arr[i]
    }
    var data = JSON.parse(fs.readFileSync('data/user/13509185504.json', 'utf8'))
    var kind = 'books'
    var cls = random(data[kind])
    var url = ''
    if (Object.keys(data[kind][cls]).length) {
        var key = random(data[kind][cls])
        url = 'http://'+ data[kind][cls][key].url
    }
    res.send(url)
})

// 加载
app.post('/user/load', function (req, res) {
    var notLogin = function() {
        var data = JSON.parse(fs.readFileSync('data/user/18966702120.json', 'utf8'))
        data.note = ''
        res.send({
            "user": data,
            "text": '请输入名字',
            "login": false
        })
    }
    if (req.headers.cookie) {
        var cookie = Mer.cookie(req)
        var i = Mer.data(cookie)
        if (i.phone) {
            if (i.key === cookie.key){ // 登录成功
                var url = 'data/user/' + i.phone + '.json'
                var data = JSON.parse(fs.readFileSync(url, 'utf8'))
                res.send({
                    "user": data,
                    "text": "欢迎回来",
                    "login": true,
                    "name": i.name,
                    "phone": i.phone,
                    "key": i.key
                })
            } else {
                notLogin()
            }
        } else {
            notLogin()
        }
    } else {
        notLogin()
    }
})
// 存储
app.post('/user/save', function (req, res) {
    if (req.headers.cookie) {
        var cookie = Mer.cookie(req)
        var i = Mer.data(cookie)
        if (i.phone) {
            if (i.key === cookie.key){
                var data = JSON.stringify(req.body, null, 2)
                var err = fs.writeFileSync('data/user/' + i.phone +'.json', data, 'utf8')
                res.send('写入成功！')
            }
        }
    }
})
// 登录
app.post('/user/login', function (req, res) {
    var cookie = Mer.cookie(req)
    var i = Mer.data(cookie)
    if (i.phone) {
        if (i.key === cookie.key){
            var url = 'data/user/' + i.phone + '.json'
            var data = JSON.parse(fs.readFileSync(url, 'utf8'))
            res.send({
                "user": data,
                "text": '欢迎回来',
                "login": true,
                "name": i.name,
                "phone": i.phone,
                "key": i.key
            })
        } else {
            res.send({
                "text": '密码错误！',
                "login": false
            })
        }
    } else {
        res.send({
            "text": '名字错误！',
            "login": false
        })
    }
})
// 注册
app.post('/user/join-sms', function (req, res) {
    var phone = req.body.phone
    var Obj = JSON.parse(fs.readFileSync('data/user/phone.json', 'utf8'))
    if (Obj[phone]) {
        res.send({send:false, text:'已注册，请登录'})
    } else {
        User[phone] = {}
        User[phone].sms = Mer.SMS()
        // 发送短信 promise 方式调用
        var options = {
            sms_free_sign_name: '大海',
            sms_param: {
                "number": User[phone].sms
            },
            "rec_num": phone,
            sms_template_code: 'SMS_51075001',
        }
        // 花钱的地方来了 take money this
        client.sms(options)
            .then(function(data) {
                res.send({send:true, text:'短信已发送，请耐心等候'})
            }).catch(function(err) {
                res.send({send:true, text:'短信发送失败，请联系管理员'})
            })
    }
})
app.post('/user/join', function (req, res) {
    var phone = req.body.phone
    var sms = req.body.sms
    if (User[phone]) {
        if (sms === User[phone].sms) {
            res.send({
                join: true,
                text: '欢迎加入，不知阁下如何称呼'
            })
        } else {
            res.send({
                join: false,
                text: '短信验证错误'
            })
        }
    } else {
        res.send({
            join: false,
            text: '手机号错误'
        })
    }
})
app.post('/user/join-name', function (req, res) {
    var name = JSON.parse(fs.readFileSync('data/user/name.json', 'utf8'))
    // 检查名字
    var bool = false
    for (var i of name) {
        // 忽略大小写
        if (i.toLowerCase() === req.body.name.toLowerCase()) {
            bool = true
            break
        }
    }
    if (bool) {
        res.send({
            "add": false,
            "text": (req.body.name + ' 已被占用')
        })
    } else {
        // name
        name.push(req.body.name)

        // 读取
        var data = JSON.parse(fs.readFileSync('data/user/18966702120.json', 'utf8'))
        data.note = '🍓' + req.body.name + '\n'
        data = JSON.stringify(data, null, 2)
        var phone = JSON.parse(fs.readFileSync('data/user/phone.json', 'utf8'))

        // phone
        phone[req.body.phone] = {}
        phone[req.body.phone].name = req.body.name
        phone[req.body.phone].key  = req.body.phone.slice(-4)

        // 写入
        var errData  = fs.writeFileSync('data/user/' + req.body.phone +'.json', data,  'utf8')
        var errName  = fs.writeFileSync('data/user/name.json',  JSON.stringify(name, null, 2),  'utf8')
        var errPhone = fs.writeFileSync('data/user/phone.json', JSON.stringify(phone, null, 2), 'utf8')
        if (errData || errName || errPhone) {
            res.send({
                "add": false,
                "text": '写入失败！'
            })
        } else {
            delete User[req.body.phone]
            res.send({
                "add": true,
                "text": '注册成功！'
            })
        }
    }
})

// MarkDown
app.get( '/md/:id?', function(req, res) {
    let data = fs.readFileSync('public/md/md.html', 'utf8')
    res.send(data)
})
// 加载
app.post('/md/load/:id?', function(req, res) {
    let id = req.params.id
    let path = 'data/note/' + id + '.json'
    let data
    if (fs.existsSync(path)) {
        data = fs.readFileSync(path, 'utf8')
    } else {
        data = fs.readFileSync('data/note/default.json', 'utf8')
    }
    res.send(data)
})
// 存储
app.post('/md/save', function(req, res) {
    let id = req.body.id || ''
    let path = 'data/note/' + id + '.json'
    // 如果路径无效则存储到默认
    if (fs.existsSync(path) === false) {
        path = 'data/note/default.json'
    }
    let data = JSON.stringify(req.body.json, null, 2)
    if (fs.existsSync(path)) {
        fs.writeFileSync(path, data, 'utf8')
        res.send('写入成功！')
    } else {
        res.send('写入失败！')
    }
})

// // 404
// app.use((req, res) => {
//     res.status(404)
//     res.send(fs.readFileSync('public/404.html', 'utf8'))
// })
// // 500
// app.use((err, req, res) => {
//     console.error(err.stack);
//     res.status(500)
//     res.send('<h1>500</h1>')
// })

// listen 函数监听端口
var server = app.listen(1207, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
