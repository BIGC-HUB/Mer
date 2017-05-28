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
app.use(bodyParser.urlencoded({
    extended: true,
}))
// 设置 session, 这里的 config 是从 config.js 文件中拿到的
app.use(session({
    secret: config.key,
}))

// 公共 文件
app.use(express.static('public'))

// 引入路由文件
app.use('/', require('./route/index'))
app.use('/user', require('./route/user'))
app.use('/md', require('./route/markdown'))

// 404
app.use((req, res) => {
    res.status(404)
    res.send(fs.readFileSync('public/404.html', 'utf8'))
})
// 500
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500)
    res.send('<h1>500</h1>')
})

// listen 函数监听端口
var server = app.listen(1207, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
