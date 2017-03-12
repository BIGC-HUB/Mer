// 引入 express 并且创建一个 express 实例赋值给 app
var bodyParser = require('body-parser')
var express = require('express')
var app = express()

// 引入 fs
var fs = require('fs')

// 安装 $ npm install body-parser
// 配置 body-Parser
app.use(bodyParser.json())

// 公共 文件
app.use(express.static('public'))

var sendFile = function(path, res) {
    var data = fs.readFileSync(path, 'utf8')
    res.send(data)
}

// 读取 文件
app.get('/', function(req, res) {
    sendFile('index.html', res)
})

// // 写入
// app.post('/todo/save', function (req, res) {
//     var data = JSON.stringify(req.body)
//     var fs = require("fs");
//     fs.writeFile('data', data, function (err) {
//         if (err) {
//               res.send('错误！')
//         } else {
//               res.send('POST 数据已保存')
//         }
//    })
// })

// listen 函数的第一个参数是我们要监听的端口
// 这个端口是要浏览器输入的
// 默认的端口是 80
// 所以如果你监听 80 端口的话，浏览器就不需要输入端口了
// 但是 1024 以下的端口是系统保留端口，需要管理员权限才能使用
var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
