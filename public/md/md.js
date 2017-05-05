// global
window.log = function() {
    console.log.apply(console, arguments)
}
window.Ajax = (url, data, func, sync, Method) => {
    // true 异步
    sync = sync || true
    // 注册 响应函数
    func = func || function(e) {
        console.log(e)
    }
    Method = Method || 'POST'
    // 创建 AJAX 对象
    var r = new XMLHttpRequest()
    r.open(Method, url, sync)
    r.setRequestHeader('Content-Type', 'application/json')
    r.onreadystatechange = function() {
        // 完成
        if (r.readyState === 4) {
            func(r.response)
        }
    }
    // POST
    if (data) {
        data = JSON.stringify(data)
        r.send(data)
        // GET
    } else {
        // 发送 请求
        r.send()
    }
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
            $(this).html('<div id="editor"></div>')
            $(this).append('<button class="btn btn-new"> + </button>')
            // 引入代码补全和提示模块
            ace.require("ace/ext/language_tools");
            // 创建编辑器
            md.editor = ace.edit("editor")
            md.editor.setValue(val)
            md.editor.$blockScrolling = Infinity
            md.editor.setOptions({
                // 高度自适应
                maxLines: 40,
                // 是否自动补全 联想提示
                // enableSnippets: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                // 折叠
                showFoldWidgets: false,
                // 模式
                mode: "ace/mode/markdown",
                autoScrollEditorIntoView: true
            })
            md.editor.setTheme("ace/theme/tomorrow_night")
            // 未知
            md.editor.renderer.setPrintMarginColumn(false)
            md.editor.session.setNewLineMode("unix")
            // 自动换行
            md.editor.session.setUseWrapMode(true)
            // 获得焦点
            md.editor.gotoLine(1)
            md.editor.renderer.textarea.focus()
        }
    })
    // hide
    $('#md').on('blur', '#editor', function() {
        let parent = this.parentElement
        let value = md.editor.getValue()
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
    // save
    $('#share').on('click', function() {
        var ok = confirm('是否发布')
        if (ok) {
            Ajax('save', {json: localStorage.md}, function(e) {
                log(e)
            })
        }
    })
}
let initMarkdown = function() {
    Ajax('load', null, function(data) {
        let json = data || '["# new"]'
        localStorage.md = json
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
    })
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
