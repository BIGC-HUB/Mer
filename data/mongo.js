const log = console.log.bind(console)

const mongodb = require('mongodb')

const test = async () => {
    // 数据库的地址 + 默认端口
    const url = 'mongodb://localhost:27017/'
    // 数据库的名称
    const name = 'node'
    // 连接 mongodb 数据库
    const db = await mongodb.connect(url + name)
    // 打开数据库的 类
    const e = db.collection('test')

    // const data = [
    //     {
    //         content: '吃饭',
    //         user_id: 1,
    //         username: 'gua',
    //         note: {
    //             dx: 'daxiao',
    //             ren: {
    //                 meng: "meng",
    //                 qiang: {
    //                     ying:"ying",
    //                     mazi: {
    //                         shuang: 'shuang'
    //                     }
    //                 }
    //             }
    //         }
    //     },
    //     {
    //         content: '睡觉',
    //         done: true,
    //         username: 'gua2',
    //     },
    // ]
    // add(e, data)

    // const query = {
    //     random: {$ne:15},
    // }
    // remove(e, query)

    const query1 = {
        username: 'gua',
    }
    find(e, query1)

    // const query2 = {
    //     content: '喝水',
    // }
    // update(e, query2)
}

// mongodb 默认实现了返回 promise,
// 所以我们可以直接使用 async 和 await 这样的语法

const add = async(e, data) => {
    // insertMany 是一次插入多条记录
    const result = await e.insertMany(data)
    log('添加成功！', result)
}

const find = async(e, query) => {
    const result = await e.find(query).toArray()
    log('查找完成！', result)
}

const update = async(e, query) => {
    const form = {
        $set: {
            random: 60,
        }
    }

    // update 方法已经废弃, 使用 updateOne 和 updateMany 方法更新数据
    // updateOne 更新查询出来的第一条数据
    // const r1 = await collection.find(query).toArray()
    // log('before update r1', r1)
    // await collection.updateOne(query, form)
    // const r2 = await collection.find(query).toArray()
    // log('after update r2', r2)

    // updateMany 更新查询出来的所有数据
    const query1 = {
        content: '吃饭',
    }

    // 更新的时候不仅可以改变现有字段的值
    // 也可以直接添加一个字段并且赋值
    const form1 = {
        $set: {
            updated_time: Date.now()
        }
    }

    await collection.updateMany(query1, form1)
    const r3 = await collection.find(query1).toArray()
    log('after update many r3', r3)
}

const remove = async(e, query) => {
    // 删除前
    const before = await e.find(query).toArray()
    log('before delete', before)

    await e.deleteOne(query)

    // 删除后
    const after = await e.find(query).toArray()
    log('after delete', after)
}

if (require.main === module) {
    test()
}
