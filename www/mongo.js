const log = console.log.bind(console)
const fs = require('fs')
// 添加 Path 环境变量 C:\Program Files\MongoDB\Server\3.4\bin
// 运行数据库 $ mongod --dbpath C:\Users\iwang\Documents\Github\mer\data\db
const mongodb = require('mongodb')
const config = require('../data/config')
// 启动 mongodb
const startdb = async () => {
    // config.url 数据库的地址 + 默认端口
    // config.dbname 数据库的名称
    // config.documents 数据库的 类
    let url = config.url + config.dbname
    let cls = config.documents
    // 检测 mongodb 是否启动
    try {
        const db = await mongodb.connect(url)
        const e = await db.collection(cls)
        return e
    } catch(err) {
        console.log(config.url + ' 端口未开启，请检查')
        return null
    }
}

// 条件查询参考 http://www.jianshu.com/p/d8406b1cb028
const mongo = {
    load: async (query) => {
        const e = await startdb()
        const arr = await e.find(query,{"_id":false}).toArray()
        if (arr.length === 0) {
            return '尚未注册！'
        } else if (arr.length === 1) {
            return arr
        } else {
            return '存在多个！'
        }
    },
    save: async (obj) => {
        const e = await startdb()
        let query = {
            $or: [
                {name: obj.name},
                {phone: obj.phone}
            ]
        }
        let data = {
            $set: {
                mer: obj.mer
            }
        }
        let arr = await e.find(query, {"_id":false}).toArray()
        let send = {
            message: '',
            ok: true
        }
        if (arr.length === 0) {
            await e.insertOne(obj)
            send.message = '注册成功！'
            return send
        } else if (arr.length === 1) {
            let err = await e.updateOne(query, data)
            send.message = '写入成功！'
            return send
        } else {
            send.message = '存在多个！'
            send.ok = false
            return send
        }
    }
}

const test = async () => {
    // $set 新增 | $or 或
    let _init = async () => {
        const arr = JSON.parse(fs.readFileSync('../data/user/phone.json', 'utf8'))
        for (let i of Object.keys(arr)) {
            let e = arr[i]
            const obj = JSON.parse(fs.readFileSync(`../data/user/${i}.json`, 'utf8'))
            const data = {
                mer: obj,
                name: e.name,
                phone: i,
                key: e.key,
                mark: e.mark || ''
            }
            let err = await  mongo.save(data)
            log(err)
        }
    }
    // _init()
    let data = await mongo.load({
        name: '大海',
        phone: '18966702120'
    })
    // log(data)
}
if (require.main === module) {
    test()
}

module.exports = mongo
