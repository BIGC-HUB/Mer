var __initEdit = function() {
    var html =
        '<div id="edit-full"></div><ul id="edit-ul"></ul>' +
        '<div id="edit-cont">' +
            '<div class="tan">' +
                '<div class="text"></div>' +
                '<div id="edit-val"></div>' +
                '<div id="edit-btn"></div>' +
            '</div>' +
        '</div>'
    $('#edit').html(html)
}()

// 增删改查 | 复制全选
Mer.edit = {
    init: function(e, del) {
        // obj
        var i = {}
        i.cls = e.dataset.cls
        i.key = e.dataset.key
        i.tag = e.dataset.kind || e.localName
        if (e.className === 'show') {
            i.tag = e.dataset.key
        }
        i.kind = i.tag + 's'
        // init
        i.label = '引擎'
        var valHtml =
            '<div><span>名　字</span><input class="name" placeholder="…"></div>' +
            '<div><span>网　址</span><textarea spellcheck="false" class="url" rows="1" placeholder="…"></textarea></div>' +
            '<div class="half"><span>颜　色</span><input class="color" placeholder="…"></div>' +
            '<div class="half"><span>图　标</span><input class="icon" placeholder="…"></div>' +
            '<div><span>移动端</span><textarea spellcheck="false" class="wap" rows="1" placeholder="…"></textarea></div>'
        var btnHtml =
            '<button class="yes btn btn-blue"><div class="fa-2x iconfont icon-yes"></div>确认</button>' +
            '<button class="no  btn btn-white"><div class="fa-2x iconfont icon-no"></div>取消</button>'
        if (i.key) { // show
            if (i.tag === 'book') {
                valHtml =
                    '<div><span>名　字</span><input class="name" placeholder="…"></div>' +
                    '<div><span>网　址</span><textarea spellcheck="false" class="url" rows="1" placeholder="…"></textarea></div>' +
                    '<div><span>颜　色</span><input class="color" placeholder="…"></div>'
                i.label = '书签'
            }
        } else { // kind
            valHtml = '<div><span>名　字</span><input class="name" placeholder="…"></div>'
            i.label = '分组'
        }
        // button
        if (del) {
            btnHtml += '<button class="del btn btn-red"><div class="fa-2x iconfont icon-del"></div>删除</button>'
        }
        $('#edit-val').html(valHtml)
        $('#edit-btn').html(btnHtml)
        $('#edit-cont').animate({
            height: 'show'
        })
        return i
    },
    show: function(html) {
        Mer.edit.at = event.target
        var e = event.target
        if (html) {
            $('#edit-ul').html(html)
            var x = event.clientX - 80
            var y = event.clientY
            if (window.document.body.offsetWidth - x < 160) {
                x = window.document.body.offsetWidth - 165
            } else if (x < 0) {
                x = 5
            }
            $(e).addClass('edit-hover')
            $('#edit-ul, #edit-full').show()
            $('#edit-ul').css({
                top: y + "px",
                left: x + "px"
            })
            setTimeout(function() {
                $('body').one('click', function() {
                    var edit = event.target.classList.contains('edit')
                    if (edit) {
                        Mer.edit.hide(e)
                        Mer.edit[event.target.dataset.btn](e)
                    } else {
                        Mer.edit.hide(e)
                    }
                })
            }, 100)
        } else {
            $('top.home').click()
        }
    },
    hide: function(e) {
        $(e).removeClass('edit-hover')
        $('#edit-ul, #edit-full').hide()
    },
    at: {},
    new: function(e) {
        e = Mer.edit.init(e)
        $('#edit .text').text('添加·' + e.label)
        $('#edit-btn .yes')[0].dataset.btn = 'new'
    },
    amend: function(e) {
        e = Mer.edit.init(e, true)
        var text = '编辑·'
        if (e.key) { // show
            var i = User[e.kind][e.cls][e.key]
            if (e.tag === 'engine') {
                if (e.key === User.def.logo.key && e.cls === User.def.logo.cls) {
                    $('#edit-btn .del').hide()
                }
                $('#edit-val .wap').val(i.wap)
                $('#edit-val .icon').val(i.icon)
            }
            $('#edit-val .color').val(i.color)
            $('#edit-val .color')[0].style.color = i.color
            $('#edit-val .url').val(i.url)
            $('#edit-val .name').val(e.key)
        } else { // kind
            text = '重命名·'
            $('#edit-cont .name').val(e.cls)
        }
        $('#edit .text').text(text + e.label)
        $('#edit-btn .yes')[0].dataset.btn = 'amend'
    },
    move: function(e) {
        e = Mer.edit.init(e)
        $('#edit .text').text('移动·分组')
        var html = ''
        for (var cls of User.def.order[e.tag]) {
            html += '<tag>' + cls + '</tag>'
        }
        $('#edit-val').html(html)
        $('#edit-btn .yes')[0].dataset.btn = 'move'
        $('#edit-btn .yes')[0].dataset.move = ''
    },
    copy: function(e) {
        e.select()
        document.execCommand("Copy")
    },
    select: function(e) {
        e.select()
    },
    change: function(e) {
        log('修改', e.className)
    },
    exit: function() {
        c.Cookie('name', '', 0)
        c.Cookie('key', '', 0)
        Mer.load()
        Mer.login.hide()
    }
}

// 增删改查 - 提交
Mer.send = {
    tag: $(),
    del: function(e) {
        //
        var tag = e.dataset.kind || e.localName
        var cls = e.dataset.cls
        var key = e.dataset.key
        var kind = tag + 's'
        //
        if (key) {
            delete User[kind][cls][key]
            e.remove()
            var show = $('#' + tag + ' .show')[0]
            if (Object.keys(User[kind][cls]).length === 0) {
                show.style.height = '10em'
                show.dataset.cls = cls
                show.dataset.kind = tag
            } else {
                show.style.height = 'auto'
            }
            $('#edit-btn .no').click()
            // logo
            var logo = $('logo i,logo span').data()
            if (logo.cls === cls && logo.key === key) {
                __initLogo(User.def.logo)
            }
            Mer.save()
        } else {
            if (Object.keys(User[kind][cls]).length) {
                $('#edit .text').html('提示：类不为空')
            } else {
                if (Object.keys(User[kind]).length === 1) {
                    $('#edit .text').html('提示：LivSyrup')
                } else {
                    var arr = User.def.order[tag]
                    for (var i = 0; i < arr.length; i++) {
                        if (cls === arr[i]) {
                            arr.splice(i, 1)
                        }
                    }
                    delete User[kind][cls]
                    e.remove()
                    $('#edit-btn .no').click()
                    Mer.save()
                }
            }
        }
    },
    new:  function(e) {
        //
        var cls = e.dataset.cls
        var tag = e.dataset.kind || e.localName
        var key = e.dataset.key
        if (e.className === 'show') {
            tag = e.dataset.key
        }
        var kind = tag + 's'
        //
        var newName = $('#edit-val .name').val()
        var newUrl = $('#edit-val .url').val()
        // 表单验证
        if (!newName) {
            $('#edit .text').text('名字不能为空')
            $('#edit-val .name').focus()
        } else {
            // 数据存储
            if (key) { // show
                if (!newUrl) {
                    $('#edit .text').text('网址不能为空')
                    $('#edit-val .url').focus()
                } else {
                    var i = {}
                    if (tag === 'engine') {
                        i.icon = $('#edit-val .icon').val()
                        i.color = $('#edit-val .color').val()
                        i.wap = $('#edit-val .wap').val()
                        i.url = $('#edit-val .url').val()
                    } else { // book
                        i.color = $('#edit-val .color').val()
                        i.url = $('#edit-val .url').val()
                    }
                    log()
                    var bool = new Set(Object.keys(User[kind][cls])).has(newName)
                    if (bool) {
                        $('#edit .text').text('名字不能重复')
                        $('#edit-cont .name').focus()
                    } else {
                        User[kind][cls][newName] = i
                        if (e.localName !== 'div') {
                            e = e.parentElement
                        }
                        $(e).html(Mer.showHtml(tag, cls))
                        $('#edit-btn .no').click()
                        Mer.save()
                    }
                }
            } else { // kind
                var bool = new Set(Object.keys(User[kind])).has(newName)
                if (bool) {
                    $('#edit .text').text('名字不能重复')
                    $('#edit-cont .name').focus()
                } else {
                    User[kind][newName] = {}
                    if (e.localName !== 'div') {
                        e = e.parentElement
                    }
                    $(e).append(`<tag data-kind="${tag}" data-cls="${newName}">${newName}</tag>`)
                    Mer.tagClick(tag, newName)
                    $('#edit-btn .no').click()
                    // 排序
                    User.def.order[tag].push(newName)
                    Mer.save()
                }
            }
        }
    },
    amend:  function(e) {
        //
        var tag = e.dataset.kind || e.localName
        var key = e.dataset.key
        var cls = e.dataset.cls
        var kind = tag + 's'
        //
        var newName = $('#edit-cont .name').val()
        var newUrl = $('#edit-val .url').val()
        // 表单验证
        if (!newName) {
            $('#edit .text').text('名字不能为空')
            $('#edit-cont .name').focus()
        } else {
            // 数据存储
            if (key) { // show
                if (!newUrl) {
                    $('#edit .text').text('网址不能为空')
                    $('#edit-val .url').focus()
                } else {
                    var i = {}
                    if (tag === 'engine') {
                        i.icon = $('#edit-val .icon').val()
                        i.color = $('#edit-val .color').val()
                        i.wap = $('#edit-val .wap').val()
                        i.url = $('#edit-val .url').val()
                    } else { // book
                        i.color = $('#edit-val .color').val()
                        i.url = $('#edit-val .url').val()
                    }
                    var bool = new Set(Object.keys(User[kind][cls])).has(newName)
                    if (!bool) {
                        User[kind][cls][newName] = JSON.parse(JSON.stringify(User[kind][cls][key]))
                        delete User[kind][cls][key]
                        // 没有重复才可以删除
                        $(e.parentElement).html(Mer.showHtml(tag, cls))
                        $('#edit-btn .no').click()
                        // def
                        if (key === User.def.logo.key && cls === User.def.logo.cls) {
                            User.def.logo.key = newName
                        }
                        // logo
                        var logo = $('logo i,logo span').data()
                        if (logo.cls === cls && logo.key === key) {
                            __initLogo({"key":newName,"cls":cls})
                        }
                        Mer.save()
                    } else if (key == newName) {
                        User[kind][cls][newName] = i
                        // 直接修改
                        $(e.parentElement).html(Mer.showHtml(tag, cls))
                        $('#edit-btn .no').click()
                        Mer.save()
                    } else {
                        $('#edit .text').text('名字不能重复')
                        $('#edit-cont .name').focus()
                    }
                }
            } else { // kind
                var bool = new Set(Object.keys(User[kind])).has(newName)
                if (bool) {
                    $('#edit .text').text('名字不能重复')
                    $('#edit-cont .name').focus()
                } else {
                    User[kind][newName] = JSON.parse(JSON.stringify(User[kind][cls]))
                    delete User[kind][cls]
                    e.innerText = newName
                    e.dataset.cls = newName
                    e.click()
                    $('#edit-btn .no').click()
                    // 默认引擎
                    if (cls === User.def.logo.cls) {
                        User.def.logo.cls = newName
                    }
                    // 排序
                    var arr = User.def.order[tag]
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] === cls) {
                            arr.splice(i, 1, newName)
                        }
                    }
                    // 保存
                    Mer.save()
                }
            }
        }
    },
    move:  function(e) {
        //
        var tag = e.dataset.kind || e.localName
        var key = e.dataset.key
        var cls = e.dataset.cls
        var kind = tag + 's'
        //
        var newCls = event.target.dataset.move
        if (newCls === '') {
            $('#edit .text').text('选择·分组')
        } else if (newCls === cls) {
            $('#edit-btn .no').click()
        } else {
            if (cls === User.def.logo.cls && key === User.def.logo.key) {
                User.def.logo.cls = newCls
            }
            User[kind][newCls][key] = JSON.parse(JSON.stringify(User[kind][cls][key]))
            delete User[kind][cls][key]
            e.remove()
            $('#edit-btn .no').click()
            // logo
            var logo = $('logo i,logo span').data()
            if (logo.cls === cls && logo.key === key) {
                __initLogo({"key":key,"cls":newCls})
            }
            Mer.save()
        }
    },
    name: (phone) => {
        var name = $('#edit-val .name').val()
        if (name) {
            c.Ajax('/user/join-name', {"name":name, "phone":phone}, (data) => {
                var data = JSON.parse(data)
                if (data.add) {
                    // 隐藏
                    $('#edit-cont').animate({ height: 'hide' })
                    // 登录
                    $('#login-zhuce').hide()
                    $('#login-dengl').animate({ height:'show' })
                    $('#login .text').text('请登录，初始密码：' + phone.slice(-4))
                    $('#login-key').val( phone.slice(-4) )
                } else {
                    $('#edit .text').text(data.text)
                }
            })
        }
    }
}

// 长按
Mer.rest = {
    time: 0,
    short: true,
    tag: function(e, arr) {
        for (var i of arr) {
            if (i === e.localName) {
                return true
            }
        }
        return false
    },
    cls: function(e, arr) {
        for (var i of arr) {
            if (e.classList.contains(i)) {
                return true
            }
        }
        return false
    },
    html: function(e) {
        var html = ''
        if (Mer.rest.tag(e, ['book', 'engine'])) {
            html =
                '<li data-btn="new"   class="edit"><span>添加</span></li>' +
                '<li data-btn="amend" class="edit"><span>编辑</span></li>' +
                '<li data-btn="move"  class="edit"><span>移动</span></li>'
        } else if (Mer.rest.tag(e, ['tag'])) {
            html =
                '<li data-btn="new"   class="edit"><span>添加</span></li>' +
                '<li data-btn="amend" class="edit"><span>重命名</span></li>'
        } else if (Mer.rest.cls(e, ['show', 'kind'])) {
            html =
                '<li data-btn="new"   class="edit"><span>添加</span></li>'
        } else if (Mer.rest.tag(e, ['textarea', 'input'])) {
            html =
                '<li data-btn="copy"  class="edit"><span>复制</span></li>' +
                '<li data-btn="select" class="edit"><span>全选</span></li>'
        } else if (Mer.rest.cls(e, ['name', 'phone', 'key'])) {
            html =
                '<li data-btn="change"  class="edit"><span>修改</span></li>' +
                '<li data-btn="exit" class="edit"><span>退出登录</span></li>'
        }
        return html
    }
}
$('body').on('touchstart', function() {
    Mer.rest.time = parseInt(event.timeStamp)
})
$('body').on('touchend', function() {
    var time = parseInt(event.timeStamp) - Mer.rest.time
    if (time < 300) {
        Mer.rest.short = true
    } else {
        Mer.rest.short = false
    }
})
$('#edit-full').on('click', function() {
    $(event.target).hide()
})

// PC右键菜单 + 移动端长按
$('body').on('click', function() {
    document.oncontextmenu = function() {
        var e = event.target
        if (Mer.rest.tag(e, ['textarea', 'input']) && !Mer.pc) {
            return true
        } else {
            if (Mer.dengl) {
                Mer.edit.show(Mer.rest.html(e))
            }
            return false
        }
    }
    var e = event.target
    if (!Mer.rest.short) {
        if (!Mer.rest.tag(e, ['textarea', 'input'])) {
            if (Mer.dengl) {
                Mer.edit.show(Mer.rest.html(e))
            }
        }
    }
})

// 事件委托
$('#edit-val').on('blur', '.icon', function() {
    event.target.value = event.target.value.toLowerCase()
})
$('#edit-val').on('blur', '.color', function() {
    var val = event.target.value.toUpperCase()
    if (val.slice(0,1) === '#') {
        event.target.value = val
    }
    event.target.style.color = event.target.value
})
$('#edit-val').on('blur', 'input', function() {
    var str = ''
    for (var i of event.target.value) {
        if (!/ /.test(i)) {
            str += i
        }
    }
    event.target.value = str
})
$('#edit-val').on('blur', 'textarea', function() {
    event.target.rows = 1
    var str = ''
    for (var i of event.target.value) {
        if (!/ /.test(i)) {
            str += i
        }
    }
    if (str.slice(0, 4) === 'http') {
        event.target.value = str.slice(7)
        if (str.slice(4, 5) === 's') {
            event.target.value = str.slice(8)
        }
    }
})
$('#edit-val').on('input', 'textarea', function() {
    var e = event.target
    e.value = e.value.replace(/\n| /g, '')
    if (e.value) {
        e.rows = parseInt(e.scrollHeight / e.dataset.dif)
    } else {
        e.rows = 1
    }
})
$('#edit-val').on('focus', 'textarea', function() {
    var e = event.target
    var dif = e.scrollHeight
    e.value += '\n'
    dif = e.scrollHeight - dif
    var arr = e.value.split('')
    arr.splice(-1, 1)
    e.value = arr.join('')
    e.rows = parseInt(e.scrollHeight / dif)
    e.dataset.dif = dif
    e.select()
})
$('#edit-val').on('click', 'tag', function() {
    Mer.send.tag.remove('edit-hover')
    Mer.send.tag = event.target.classList
    Mer.send.tag.add('edit-hover')
    $('#edit .text').text(event.target.innerText + '·分组')
    $('#edit-btn .yes')[0].dataset.move = event.target.innerText
})

// 按钮
$('#edit-btn').on('click', '.yes', function() {
    Mer.send[event.target.dataset.btn](Mer.edit.at)
})
$('#edit-btn').on('click', '.no', function() {
    $('#edit-cont').animate({ height: 'hide' })
})
$('#edit-btn').on('click', '.del', function() {
    Mer.send.del(Mer.edit.at)
})
