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
        let onEdit = Boolean(localStorage.edit)
        let edit = Boolean(this.dataset.edit)
        if (onEdit && !edit) {
            this.dataset.edit = true
            e.preventDefault()
            let index = $(this).attr('name').split('#')[1]
            let json = md.data || '["# new"]'
            let arr = JSON.parse(json)
            let val = arr[index] || ''
            let normal = Boolean(localStorage.normal)
            if(normal) {
                $(this).html('<textarea class="normal" rows="1" spellcheck="false">'+ val +'</textarea>')
                $(this).append('<button class="btn btn-new"> + </button>')
                $('textarea.normal').focus()
            } else {
                $(this).html('<div id="editor"></div>')
                $(this).append('<button class="btn btn-new"> + </button>')
                // 引入代码补全和提示模块
                ace.require("ace/ext/language_tools");
                // 创建编辑器
                md.editor = ace.edit("editor")
                md.editor.$blockScrolling = Infinity
                md.editor.setValue(val)
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
        }
    })
    // hide
    $('#md').on('blur', '#editor', function() {
        let parent = this.parentElement
        let value = md.editor.getValue()
        parent.dataset.edit = ''
        let id = parseInt($(parent).attr('name').split('#')[1])
        let json = md.data || '["# new"]'
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
        md.data = JSON.stringify(arr)
        // Show Html
        $(parent).html(md.render(value))
    })
    $('#md').on('blur', 'textarea.normal', function() {
        let parent = this.parentElement
        let value = this.value
        parent.dataset.edit = ''
        let id = parseInt($(parent).attr('name').split('#')[1])
        let json = md.data || '["# new"]'
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
        md.data = JSON.stringify(arr)
        // Show Html
        $(parent).html(md.render(value))
    })
    // btn-new
    $('#md').on('mousedown', '.btn-new', function() {
        let parent = this.parentElement
        let id = parseInt($(parent).attr('name').split('#')[1])
        let c = $('.c')
        $(c[id]).after('<div name="c#' + (id + 1) + '" class="c">在此输入内容…</div>')
        for (let i = id + 1; i < c.length; i++) {
            $(c[i]).attr('name', 'c#' + (i + 1))
        }
        let json = md.data || '["# new"]'
        let arr = JSON.parse(json)
        arr.splice(id, 1, arr[id],'')
        md.data = JSON.stringify(arr)
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
    // normal
    $('#normal').on('click', function() {
        let normal = Boolean(localStorage.normal)
        if (normal) {
            delete localStorage.normal
            this.innerText = '普通 off'
        } else {
            localStorage.normal = true
            this.innerText = '普通 on'
        }
    })
    // save
    $('#share').on('click', function() {
        let search = {}
        if (location.search) {
            let arr = location.search.slice(1).split('&')
            for (let i of arr) {
                let e = i.split('=')
                search[e[0]] = e[1]
            }
        }
        let ok = confirm('是否发布')
        if (ok) {
            Ajax('save', {id:search.id, json: JSON.parse(md.data)}, function(e) {
                log(e)
            })
        }
    })
    // textarea
    $('#md').on('focus', 'textarea.normal', function() {
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
    $('#md').on('input', 'textarea.normal', function() {
        let i = this
        i.rows = Math.round(i.scrollHeight / i.dataset.dif)
    })
    // toggle
    $('#zx').on('mouseenter', function() {
        if (md.hide) {
            clearTimeout(md.hide)
            md.hide = undefined
        }
        if ($('#zx-button').css('display') === 'none') {
            $('#zx-button').slideDown()
        }
    })
    $('#zx').on('mouseleave', function() {
        if (!localStorage.toggle) {
            md.hide = setTimeout(function(){
                $('#zx-button').slideUp()
            }, 2000)
        }
    })
    $('#zx-toggle').on('click', function() {
        let e = $('#toggle')
        let normal = Boolean(localStorage.toggle)
        if (normal) {
            delete localStorage.toggle
            e.text('▲')
        } else {
            localStorage.toggle = true
            e.text('▼')
        }
    })

}
let initMarkdown = function() {
    let search = {}
    if (location.search) {
        let arr = location.search.slice(1).split('&')
        for (let i of arr) {
            let e = i.split('=')
            search[e[0]] = e[1]
        }
    }
    Ajax('load', search, function(data) {
        log('load')
        let json = data || '["# new"]'
        md.data = json
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
    let e
    // edit
    e = $('#edit')
    if (Boolean(localStorage.edit)) {
        e.text('编辑 on')
    } else {
        e.text('编辑 off')
    }
    // normal
    e = $('#normal')
    if (Boolean(localStorage.normal)) {
        e.text('普通 on')
    } else {
        e.text('普通 off')
    }
    // toggle > hide edit btn
    delete localStorage.toggle
}
let __init__ = function() {
    initMarkdown() // 渲染
    initButton() // 按钮
    bindEvent()
}
__init__()
