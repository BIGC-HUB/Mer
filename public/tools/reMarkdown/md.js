// global
const log = function() {
    console.log.apply(console, arguments)
}
const md = new Remarkable({
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
let onlyNone = function(str) {
    if (str) {
        let temp = ''
        for (let e of str) {
            if (!/#| |\n/.test(e)) {
                temp += e
            }
        }
        if (temp) {
            return false
        }
    }
    return true
}
let bindEvent = function() {
    // show
    $('#md').on('click', '.c', function(e) {
        let edit = Boolean(localStorage.edit)
        let bool = Boolean(this.dataset.edit)
        if (edit && !bool) {
            this.dataset.edit = true
            e.preventDefault()
            let html = ''
            let index = $(this).attr('name').split('#')[1]
            let json = localStorage.md || '["# new"]'
            let arr = JSON.parse(json)
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
        let parent = this.parentElement
        let bool = Boolean(parent.dataset.edit)
        if (bool) {
            parent.dataset.edit = ''

            let id = parseInt($(parent).attr('name').split('#')[1])
            let json = localStorage.md || '["# new"]'
            let arr = JSON.parse(json)
            if (onlyNone(this.value)) {
                arr.splice(id, 1)
                let c = $('.c')
                for (let i = id + 1; i < c.length; i++) {
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
    // textarea
    $('#md').on('focus', 'textarea', function() {
        let i = this
        let dif = i.scrollHeight
        i.value += '\n'
        dif = i.scrollHeight - dif
        let arr = i.value.split('')
        arr.splice(-1, 1)
        i.value = arr.join('')
        i.rows = Math.round(i.scrollHeight / dif)
        i.dataset.dif = dif
    })
    $('#md').on('input', 'textarea', function() {
        let i = this
        i.rows = Math.round(i.scrollHeight / i.dataset.dif)
    })
    // btn-new
    $('#md').on('mousedown', '.btn-new', function(e) {
        let parent = this.parentElement
        let id = parseInt($(parent).attr('name').split('#')[1])
        let c = $('.c')
        $(c[id]).after('<div name="c#' + (id + 1) + '" class="c"><h4>#</h4></div>')
        for (let i = id + 1; i < c.length; i++) {
            $(c[i]).attr('name', 'c#' + (i + 1))
        }
        let json = localStorage.md || '["# new"]'
        let arr = JSON.parse(json)
        arr.splice(id, 1, arr[id],'')
        localStorage.md = JSON.stringify(arr)
    })
    // footer
    $('#edit').on('click', function() {
        let edit = Boolean(localStorage.edit)
        if (edit) {
            delete localStorage.edit
            this.innerText = '编辑 off'
        } else {
            localStorage.edit = true
            this.innerText = '编辑 on'
        }
    })
}
let initMarkdown = function() {
    let json = localStorage.md || '["# new"]'
    let arr = JSON.parse(json)
    if (arr.length === 0) {
        arr = ["# new"]
    }
    for (let i = 0; i < arr.length; i++) {
        let html = '<h4>#<h4>'
        if (!onlyNone(arr[i])) {
            html = md.render(arr[i])
        }
        $('#md').append('<div name="c#' + i + '" class="c">' + html + '</div>')
    }
}
let initButton = function() {
    let edit = Boolean(localStorage.edit)
    if (edit) {
        $('#edit').text('编辑 on')
    } else {
        $('#edit').text('编辑 off')
    }
}
let __init__ = function() {
    initMarkdown() // 渲染
    initButton() // 按钮
    bindEvent()
}
__init__()
