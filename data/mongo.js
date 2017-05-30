const log = console.log.bind(console)
const fs = require('fs')
// 添加 Path 环境变量 C:\Program Files\MongoDB\Server\3.4\bin
// 运行数据库 $ mongod --dbpath C:\Users\iwang\Documents\Github\mer\data\db
const mongodb = require('mongodb')
const config = require('./config')
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

// 增删改查
class MongoDB {
    static async add(e, obj) {
        log(await this.find(e, {name: obj.name}))
        // const result = await e.insertOne(obj)
        // log('添加成功！', result.ops)
    }

    static async addAll(e, arr) {
        const result = await e.insertMany(arr)
        log('添加成功！addAll', result.ops)
    }

    static async remove(e, query) {
        // deleteOne 删除第一条 deleteMany 删除所有
        const before = await e.find(query).toArray()
        log('删除前：', before)

        await e.deleteOne(query)

        const after = await e.find(query).toArray()
        log('删除后：', after)
    }

    static async removeAll(e, query) {
        // deleteOne 删除第一条 deleteMany 删除所有
        const before = await e.find(query).toArray()
        log('删除前：', before)

        await e.deleteMany(query)

        const after = await e.find(query).toArray()
        log('删除后：', after)
    }

    static async update(e, query, form) {
        // updateOne 更新第一条 updateMany 更新所有
        const before = await e.find(query).toArray()
        log('更新前：', before)

        await e.updateOne(query, form)

        const after = await e.find(query).toArray()
        log('更新后：', after)
    }

    static async updateAll(e, query, form) {
        const before = await e.find(query).toArray()
        log('更新前：', before)

        await e.updateMany(query, form)

        const after = await e.find(query).toArray()
        log('更新后：', after)
    }

    static async find(query) {
        const e = await startdb()
        const result = await e.find(query).toArray()
        log('查找完成！', result)
        return result
    }
}

const test = async () => {
    // const json = fs.readFileSync('user/18966702120.json', 'utf8')
    // const data = {
    //     // data: json,
    //     name: '大海',
    //     phone: '1899702120',
    //     key: '2120'
    // }
    // // MongoDB.add(e, data)
    //
    // const query = {
    //     // 查找 random 不等于 dudu 的 （就是全部）
    //
    //     random: {$ne: 'dudu'},
    // }
    // // MongoDB.remove(e, query)
    // // MongoDB.removeAll(e, query)
    //
    const query1 = {
        // 查找 username 等于 'gua' 的
        name: '大海',
    }
    MongoDB.find(query1)
    //
    // const query2 = {
    //     // 查找 content 等于 '睡觉' 的
    //     content: '睡觉',
    // }
    // const form1 = {
    //     // $set 新增 updated_time
    //     $set: {
    //         updated_time: Date.now()
    //     }
    // }
    // MongoDB.update(e, query2, form1)
}

if (require.main === module) {
    test()
}
