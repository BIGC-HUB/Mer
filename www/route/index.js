const fs = require('fs')
const express = require('express')
const log = console.log.bind(console)

// 把 express.Router 的实例赋值给 index
// 路由文档 http://www.expressjs.com.cn/guide/routing.html

const index = express.Router()

// 主页
index.get('/', (req, res) => {
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
index.post('/door', function (req, res) {
    var random = function(obj) {
        var arr = Object.keys(obj)
        var i = parseInt(Math.random() * arr.length)
        return arr[i]
    }
    var data = JSON.parse(fs.readFileSync('user/13509185504.json', 'utf8'))
    var kind = 'books'
    var cls = random(data[kind])
    var url = ''
    if (Object.keys(data[kind][cls]).length) {
        var key = random(data[kind][cls])
        url = 'http://'+ data[kind][cls][key].url
    }
    res.send(url)
})

// 404 路由
index.get('/:any?', function(req, res) {
    let data = fs.readFileSync('public/404.html', 'utf8')
    res.status(404).send(data)
})

module.exports = index
