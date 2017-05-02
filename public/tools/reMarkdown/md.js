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
    if (edit && !bool) {
        this.dataset.edit = true
        e.preventDefault()

        var html = ''
        var index = $(this).attr('name').split('#')[1]
        var json = localStorage.md || '["# new"]'
        var arr = JSON.parse(json)
        if (arr[index]) {
            html = '<textarea rows="1" spellcheck="false">'+ arr[index] +'</textarea><button class="btn btn-new">+</button>'
        } else {
            html = '<textarea rows="1" spellcheck="false"></textarea><button class="btn btn-new">+</button>'
        }
        $(this).html(html)
        $(this).find('textarea').focus()
    }
})
$('#md').on('blur', 'textarea', function() {
    var parent = this.parentElement
    var bool = Boolean(parent.dataset.edit)
    if (bool) {
        parent.dataset.edit = ''

        var id = parseInt($(parent).attr('name').split('#')[1])
        var json = localStorage.md || '["# new"]'
        var arr = JSON.parse(json)
        if (onlyNone(this.value)) {
            arr.splice(id, 1)
            var c = $('.c')
            for (var i = id + 1; i < c.length; i++) {
                $(c[i]).attr('name', 'c#' + (i - 1))
            }
            c[id].remove()
        } else {
            arr[id] = this.value
        }
        localStorage.md = JSON.stringify(arr)
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
    var id = parseInt($(parent).attr('name').split('#')[1])
    var c = $('.c')
    $(c[id]).after('<div name="c#' + (id + 1) + '" class="c"><h4>#</h4></div>')
    for (var i = id + 1; i < c.length; i++) {
        $(c[i]).attr('name', 'c#' + (i + 1))
    }
    var json = localStorage.md || '["# new"]'
    var arr = JSON.parse(json)
    arr.splice(id, 1, arr[id],'')
    localStorage.md = JSON.stringify(arr)
    // var parent = this.parentElement
    // var index = $(parent).attr('name').split('#')[1]
    // var json = localStorage.md || '["# new"]'
    // var arr = JSON.parse(json)
    // arr.splice(index, 1, arr[index],'new +')
    // $('#md').empty()
    // for (var i = 0; i < arr.length; i++) {
    //     var html = '<h4>#<h4>'
    //     if (!onlyNone(arr[i])) {
    //         html = md.render(arr[i])
    //     }
    //     $('#md').append('<div name="c#' + i + '" class="c">' + html + '</div>')
    // }
    // log($('div[name$=' + index + ']'))
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

var onlyNone = function(str) {
    if (str) {
        let temp = ''
        for (let e of str) {
            if (e !== '#' && e !== ' ' && e !== '\n') {
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
