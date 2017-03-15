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
    fs.writeFile('user/mer.json', data, 'utf8', function(err) {
        res.send('写入成功！')
    })
})
app.post('/user/load', function (req, res) {
    var data = fs.readFileSync( 'user/mer.json', 'utf8')
    res.send(data)
})

// listen 函数监听端口
var server = app.listen(80, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
