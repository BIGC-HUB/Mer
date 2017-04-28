// global
window.log = function() {
    console.log.apply(console, arguments)
}
window.md = new Remarkable({
    html: true,
    breaks: true,
    linkify: true,
    xhtmlOut: true,
    typographer: true,
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (err) {}
        }
        try {
            return hljs.highlightAuto(str).value;
        } catch (err) {}
        return ''
    }
})

// 渲染
$('#md').on('click', '.c', function(e) {
    var edit = Boolean(localStorage.edit)
    var bool = Boolean(this.dataset.edit)
    if (!bool && edit) {
        this.dataset.edit = true
        e.preventDefault()
        var html = ''
        if (this.dataset.str) {
            html = '<textarea rows="1" spellcheck="false">'+ this.dataset.str +'</textarea><button class="btn btn-new">+</button>'
        } else {
            html = '<textarea rows="1" spellcheck="false"># new</textarea><button class="btn btn-new">+</button>'
        }
        $(this).html(html)
        $(this).find('textarea').focus()
    }
})
$('#md').on('blur', 'textarea', function() {
    var parent = this.parentElement
    var edit = Boolean(localStorage.edit)
    var bool = Boolean(parent.dataset.edit)
    if (bool) {
        parent.dataset.edit = ''
        parent.dataset.str = this.value
        $(parent).html(md.render(this.value))
        // Save
        var arr = new Array
        for (let i of $('.c')) {
            arr.push(i.dataset.str)
        }
        localStorage.md = JSON.stringify(arr)
    }
})
// 自适应
$('#md').on('focus', 'textarea', function() {
    var i = this
    var dif = i.scrollHeight
    i.value += '\n'
    dif = i.scrollHeight - dif
    var arr = i.value.split('')
    arr.splice(-1, 1)
    i.value = arr.join('')
    i.rows = Math.round(i.scrollHeight / dif)
    i.dataset.dif = dif
})
$('#md').on('input', 'textarea', function() {
    var i = this
    if (i.value) {
        i.rows = Math.round(i.scrollHeight / i.dataset.dif)
    } else {
        i.parentElement.remove()
    }
})
// 新建
$('#md').on('mousedown', '.btn-new', function(e) {
    var parent = this.parentElement
    $(parent).after('<div data-str="# new" class="c"><h4>#</h4></div>')
})
// 底栏
$('#edit').on('click', function() {
    var edit = Boolean(localStorage.edit)
    if (edit) {
        delete localStorage.edit
        this.innerText = '编辑 off'
    } else {
        localStorage.edit = true
        this.innerText = '编辑 on'
    }
})
var initMarkdown = function() {
    var onlyNone = function(arr) {
        if (arr) {
            let temp = ''
            for (let e of arr) {
                if (e !== '#' && e !== ' ') {
                    temp += e
                }
            }
            if (temp) {
                return false
            }
        }
        return true
    }
    var json = localStorage.md || '["# new"]'
    var arr = JSON.parse(json)
    for (var i = 0; i < arr.length; i++) {
        var html = '<h4>#<h4>'
        if (!onlyNone(arr[i])) {
            html = md.render(arr[i])
        }
        $('#md').append('<div data-str="' + arr[i] + '" class="c">' + html + '</div>')
    }
}
var initButton = function() {
    var edit = Boolean(localStorage.edit)
    if (edit) {
        $('#edit').text('编辑 on')
    } else {
        $('#edit').text('编辑 off')
    }
}
var __init__ = function() {
    initMarkdown() // 渲染
    initButton() // 按钮
}
__init__()
