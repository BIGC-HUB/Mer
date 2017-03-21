var log = function() {
        console.log.apply(console, arguments)
}
// 引入 express 并且创建一个 express 实例赋值给 app
var bodyParser = require('body-parser')
var express = require('express')
var app = express()

// 引入 sms API
const AliDaYu = require('super-alidayu')
const client = new AliDaYu({
  app_key: '23658012',
  secret: '774c4d0876b01d83b58470809d1e8947',
})

var options = {
  sms_free_sign_name: '大海',
  sms_param: {
    code: '0129',
    product: '登录',
  },
  rec_num: '18966702120',
  sms_template_code: 'SMS_51075001',
}
// 发送短信，promise方式调用
client.sms(options)
  .then(ret => console.log('success', ret))
  .catch(err => console.log('error', err))

// 发送短信，callback方式调用
// client.sms(options, (err, ret) => {
//   if (err) {
//     console.log('error', err)
//   } else {
//     console.log('success', ret)
//   }
// })


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
    data: function(cookie) {
        var i = new Object
        var name = cookie.name
        if (name === '') { return i }
        var json = fs.readFileSync('user/phone.json', 'utf8')
        var Obj = JSON.parse(json)
        // Phone Number
        if (!isNaN(name) && name.length === 11) {
            i.phone = name
        } else {
            for (var key in Obj) {
                var re = new RegExp(name,'i')
                // 忽略大小写
                if (Obj[key].name.match(re)[0]) {
                    i.phone = key
                    break
                } else {
                    return i
                }
            }
        }
        // Key
        i.key =  Obj[i.phone].key
        // Name
        i.name = Obj[i.phone].name

        return i
    }
}

// 读取 文件
app.get('/', function(req, res) {
    var data = fs.readFileSync('www/index.html', 'utf8')
    res.send(data)
})
// 加载
app.post('/user/load', function (req, res) {
    var notLogin = function() {
        var data = fs.readFileSync('www/def.json', 'utf8')
        res.send({
            "user": JSON.parse(data),
            "text": '请输入名字',
            "login": false
        })
    }
    if (req.headers.cookie) {
        var cookie = user.cookie(req)
        var i = user.data(cookie)
        if (i.phone) {
            if (i.key === cookie.key){ // 登录成功
                var url = 'user/' + i.phone + '.json'
                var data = fs.readFileSync(url, 'utf8')
                res.send({
                    "user": JSON.parse(data),
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
        var cookie = user.cookie(req)
        var i = user.data(cookie)
        if (i.phone) {
            if (i.key === cookie.key){
                var data = JSON.stringify(req.body)
                var err = fs.writeFileSync('user/' + i.phone +'.json', data, 'utf8')
                res.send('写入成功！')
            }
        }
    }

})
// 登录
app.post('/user/login', function (req, res) {
    var cookie = user.cookie(req)
    var i = user.data(cookie)
    if (i.phone) {
        if (i.key === cookie.key){
            var url = 'user/' + i.phone + '.json'
            var data = fs.readFileSync(url, 'utf8')
            res.send({
                "user": JSON.parse(data),
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

// listen 函数监听端口
// nodemon --ignore public/ --ignore user/ run.js
var server = app.listen(80, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
