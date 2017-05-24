const log = console.log.bind(console)
// 添加 Path 环境变量 C:\Program Files\MongoDB\Server\3.4\bin
// 运行数据库 $ mongod --dbpath C:\Users\iwang\Documents\Github\mer\data\db
const mongodb = require('mongodb')
// 启动 mongodb
const stratdb = async (url) => {
    try {
        const db = await mongodb.connect(url)
        return db
    } catch(err) {
        console.log('mongodb://localhost:27017 端口未开启，请检查')
        return false
    }
}

// 条件查询参考 http://www.jianshu.com/p/d8406b1cb028

// 增删改查
const add = async(e, data) => {
    // insertMany 是一次插入多条记录
    const result = await e.insertMany(data)
    log('添加成功！', result)
}
const find = async(e, query) => {
    const result = await e.find(query).toArray()
    log('查找完成！', result)
}
const update = async(e, query, form) => {
    // updateOne 更新第一条 updateMany 更新所有
    const before = await e.find(query).toArray()
    log('更新前：', before)

    await e.updateMany(query, form)

    const after = await e.find(query).toArray()
    log('更新后：', after)
}
const remove = async(e, query) => {
    // deleteOne 删除第一条 deleteMany 删除所有
    const before = await e.find(query).toArray()
    log('删除前：', before)

    await e.deleteOne(query)

    const after = await e.find(query).toArray()
    log('删除后：', after)
}

const test = async () => {
    // 数据库的地址 + 默认端口
    const url = 'mongodb://localhost:27017/'
    // 数据库的名称
    const dbname = 'node'
    // 检测 mongodb 是否启动
    let db = await stratdb(url + dbname)
    if (db !== false) {
        // 选择对应的 类
        const e = db.collection('test')

        const data = [
            {
                content: '孩子吃饭老不好，多半是装的',
                user_id: 1,
                username: 'gua',
                note: {
                    dx: 'daxiao',
                    ren: {
                        meng: "meng",
                        qiang: {
                            ying:"ying",
                            mazi: {
                                shuang: 'shuang'
                            }
                        }
                    }
                }
            },
            {
                content: '睡觉',
                done: true,
                username: 'gua2',
            },
        ]
        add(e, data)

        const query = {
            // 查找 random 不等于 dudu 的 （就是全部）
            random: {$ne: 'dudu'},
        }
        // remove(e, query)

        const query1 = {
            // 查找 username 等于 'gua' 的
            username: 'gua',
        }
        // find(e, query1)

        const query2 = {
            // 查找 content 等于 '睡觉' 的
            content: '睡觉',
        }
        const form1 = {
            // $set 新增 updated_time
            $set: {
                updated_time: Date.now()
            }
        }
        // update(e, query2, form1)
    }
}

if (require.main === module) {
    test()
}
