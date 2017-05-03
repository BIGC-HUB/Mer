// global
window.log = function() {
    console.log.apply(console, arguments)
}
window.md = new Remarkable({
    html: true,
    breaks: true,
    linkify: true,
    linkTarget: '_blank',
    xhtmlOut: true,
    typographer: true,
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }
        try {
            return hljs.highlightAuto(str).value;
        } catch (__) {}
        return '';
    }
})
md.core.ruler.enable(['abbr'])
md.block.ruler.enable(['footnote','deflist'])
md.inline.ruler.enable(['footnote_inline','ins','mark','sub','sup'])
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

            let index = $(this).attr('name').split('#')[1]
            let json = localStorage.md || '["# new"]'
            let arr = JSON.parse(json)
            let val = arr[index] || ''
            $(this).html('')
            let editor = CodeMirror(this, {
                value: val,
                mode: 'gfm',
                lineNumbers: true,
                // 换行
                lineWiseCopyCut: true,
                lineWrapping: 'wrap',
                theme: "material"
            })
            editor.focus()
            $(this).append('<button class="btn btn-new"> + </button>')
            editor.on('input', function(e) {
                log(123)
            })
            editor.on('blur', function(e) {
                let parent = e.display.wrapper.parentElement
                let value = e.getValue()
                parent.dataset.edit = ''
                let id = parseInt($(parent).attr('name').split('#')[1])
                let json = localStorage.md || '["# new"]'
                let arr = JSON.parse(json)
                if (onlyNone(value)) {
                    arr.splice(id, 1)
                    let c = $('.c')
                    for (let i = id + 1; i < c.length; i++) {
                        $(c[i]).attr('name', 'c#' + (i - 1))
                    }
                    c[id].remove()
                } else {
                    arr[id] = value
                }
                localStorage.md = JSON.stringify(arr)
                // Show Html
                $(parent).html(md.render(value))
            })
        }
    })
    // btn-new
    $('#md').on('mousedown', '.btn-new', function(e) {
        let parent = this.parentElement
        let id = parseInt($(parent).attr('name').split('#')[1])
        let c = $('.c')
        $(c[id]).after('<div name="c#' + (id + 1) + '" class="c">在此输入内容…</div>')
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
        let html = '在此输入内容…'
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
