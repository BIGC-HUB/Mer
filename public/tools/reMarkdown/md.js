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
        var index = $(this).attr('name').split('#')[1]
        var json = localStorage.md || '["# new"]'
        var arr = JSON.parse(json)
        if (arr[index]) {
            html = '<textarea rows="1" spellcheck="false">'+ arr[index] +'</textarea><button class="btn btn-new">+</button>'
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
        if (onlyNone(this.value)) {
            parent.remove()
        }
        var index = $(parent).attr('name').split('#')[1]
        var json = localStorage.md || '["# new"]'
        var arr = JSON.parse(json)
        arr[index] = this.value
        // Save Temp
        var temp = new Array
        $('.c').each(function(i, e) {
            var id = $(e).attr('name').split('#')[1]
            var str = arr[id] || ''
            temp.push(str)
        })
        localStorage.md = JSON.stringify(temp)
        // Show Html
        $(parent).html(md.render(this.value))
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
    i.rows = Math.round(i.scrollHeight / i.dataset.dif)
})
// 新建
$('#md').on('mousedown', '.btn-new', function(e) {
    var parent = this.parentElement
    var json = localStorage.md || '["# new"]'
    var arr = JSON.parse(json)
    $(parent).after('<div name="c#' + arr.length + '" class="c"><h4>#</h4></div>')
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
var initMarkdown = function() {
    var json = localStorage.md || '["# new"]'
    var arr = JSON.parse(json)
    for (var i = 0; i < arr.length; i++) {
        var html = '<h4>#<h4>'
        if (!onlyNone(arr[i])) {
            html = md.render(arr[i])
        }
        $('#md').append('<div name="c#' + i + '" class="c">' + html + '</div>')
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
