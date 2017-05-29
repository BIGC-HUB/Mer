const fs = require('fs')
const express = require('express')
const log = console.log.bind(console)

// 把 express.Router 的实例赋值给 index
const md = express.Router()

// MarkDown
md.get( '/:id?', function(req, res) {
    let data = fs.readFileSync('public/md/md.html', 'utf8')
    res.send(data)
})
md.post('/:id?', function(req, res) {
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

md.post('save', function(req, res) {
    let id = req.body.id
    let path
    if (id) {
        path = 'data/note/' + id + '.json'
    } else {
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

module.exports = md
