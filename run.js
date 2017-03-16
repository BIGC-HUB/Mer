var log = function() {
        console.log.apply(console, arguments)
}
// 引入 express 并且创建一个 express 实例赋值给 app
var bodyParser = require('body-parser')
var express = require('express')
var app = express()

// 引入 fs
var fs = require('fs')

// 配置 body-Parser
app.use(bodyParser.json())

// 公共 文件
app.use(express.static('public'))

var user = {
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
    name: function (cookie) {
        // Phone Number
        var name = cookie.name
        if (!isNaN(name) && name.length === 13) {
            return name
        } else {
            var json = fs.readFileSync('user/name.json', 'utf8')
            var nameObj = JSON.parse(json)
            return nameObj[name]
        }
    },
    pass: function(phone) {
        // Key
        var json = fs.readFileSync('user/key.json', 'utf8')
        var keyObj = JSON.parse(json)
        return keyObj[phone]
    }
}

// 读取 文件
app.get('/', function(req, res) {
    var data = fs.readFileSync('index.html', 'utf8')
    res.send(data)
})

app.post('/user/def', function(req, res) {
    var data = fs.readFileSync('user/def.json', 'utf8')
    res.send(data)
})

app.post('/user/save', function (req, res) {
    var data = JSON.stringify(req.body)
    var err = fs.writeFileSync('user/18966702120.json', data, 'utf8')
    res.send('写入成功！')
})
app.post('/user/load', function (req, res) {
    var cookie = user.cookie(req)
    var phone = user.name(cookie)
    var key = user.pass(phone)
    if (key === cookie.key){
        var url = 'user/' + phone + '.json'
        var data = fs.readFileSync(url, 'utf8')
        res.send(data)
    } else {
        console.log('密码错误！', key, cookie.key)
        var data = fs.readFileSync('user/def.json', 'utf8')
        res.send(data)
    }

})

// listen 函数监听端口
var server = app.listen(80, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
