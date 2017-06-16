const fs = require('fs')
const log = console.log.bind(console)
// config.db.url 数据库的地址 + 默认端口
// config.db.name 数据库的名称
const config = require('../data/config')
// 引入 mongoose
const mongoose = require('mongoose')
// 用一个 promise 来赋值为 mongoose.Promise
mongoose.Promise = global.Promise
mongoose.connect(config.db.url + config.db.name)
const startdb = () => {
    /* 定义一个 Schema */
    const schema = mongoose.Schema({
        mer:  { type: Object },
        name: { type: String },
        phone:{ type: String },
        key:  { type: String },
        mark: { type: String, default: '' },
        notes:{ type: Object, default: {} }
    }, {
        versionKey: false
    })
    // 用 Schema 的形式来写, 可以在 methods 上面添加一个方法
    // 所有 new 出来的实例都可以调用这个方法
    // 相当于 Func.prototype.method = function() {}
    // 需要注意的是, 这个添加方法的操作一定要在 mongoose.model 之前完成
    schema.methods.speak = function() {
        let name = ""
        if (this.name) {
            name = "Meow name is" + this.name
        } else {
            name = "I don't have a name"
        }
        log(name)
    }
    // 数据库的 collection 的名称是 model 后面的那个值决定的
    // 比如 Kitten -> kittens
    // config.db.class 数据库的 类
    return mongoose.model("bigsea", schema, config.db.class)
}
const e = startdb()

// 条件查询参考 http://www.jianshu.com/p/d8406b1cb028
const mongo = {
    load: async (query, arr=[]) => {
        return await e.findOne(query, arr)
    },
    save: async (query, data) => {
        let send = {
            message: '',
            ok: false
        }
        if (data) {
            let arr = await e.find(query)
            if (arr.length === 0) {
                let err = await new e(data).save()
                send.message = '注册成功！'
                send.ok = true
            } else if (arr.length === 1) {
                // 很皮
                let setData = { $set:{ } }
                for (let key of Object.keys(data)) {
                    setData.$set[key] = data[key]
                }
                let err = await e.findOneAndUpdate(query, setData)
                send.message = '写入成功！'
                send.ok = true
            } else {
                send.message = '存在多个！'
            }
        } else {
            send.message = '数据有误！'
        }
        return send
    },
    find: async (query, arr=[]) => {
        return await e.find(query, arr)
    }
}

// 备份
// mongodump -h 0.0.0.0 -o data/db/backup/
const backup = async () => {
    let db = await mongo.find({})
    let data = JSON.stringify(db)
    let time = (new Date).toJSON().replace(/:/g, "-")
    fs.writeFileSync(`data/db/backup/User-${time}`, data, 'base64')
}

// 监听
const db = mongoose.connection
db.on('error', () => {
    console.error('mongo connection error:')
})
db.once('open', () => {
    backup()
})

module.exports = mongo
