// 定义 log enSure
var log = function() {
        console.log.apply(console, arguments)
    }
var ckXian = function() {
    var body  = document.querySelector('body')
    var style ='<style id="xm" media="screen"> * {outline: 1px red dashed!important} </style>'
    var i = false
    body.addEventListener('keydown', function(event) {
        if (event.keyCode === 77 && event.ctrlKey) {
            if (i) {
                var styletog = document.querySelector('#xm')
                styletog.remove()
                i = false
            } else {
                body.insertAdjacentHTML('afterbegin', style)
                i = true
            }
        }
    })
}()

// data.json = engines | books | note
var Mer = {}
var User = null || defUser

// initHtml
var __initTop = function() {
    var html =
        '<top data-id="user" class="user"><i class="iconfont icon-login fa-lg"></i>登录</top>' +
        '<top class="home"></top>' +
        '<top data-id="book" class="book"><i class="iconfont icon-books fa-lg"></i>书架</top>'
    $('#top').html(html)
}()
var __initMain = function() {
    var html = `
        <logo><i data-cls="综合" data-key="大海" style="color:#037DD8;" class="fa-5x iconfont icon-dahai"></i></logo>
        <div class="search">
            <input id="search-input" type="text" maxlength="70"><button id="search-button">
                <i class="fa-lg iconfont icon-search" aria-hidden="true"></i>
            </button>
        </div>
        <div class="more"><ul id="more-ul"></ul><div id="more-i">
                <button id="more-button">
                    <i class="transparent fa-1x iconfont icon-down" aria-hidden="true"></i>
                </button>
            </div>
        </div>`
    $('#search').html(html)
}()
var __initLogo = function(def, logo) {
    var i = User.engines[def][logo]
    var e = {cls:def, key:logo}
    var input = $('#search-input')[0]
    var html
    if (i.icon) {
        html = `<i data-cls="${e.cls}" data-key="${e.key}" style="color:${i.color};" class="fa-5x iconfont icon-${i.icon}"></i>`
        if (e.key != '大海') {
            input.placeholder = e.key
        }
    } else {
        html = `<span data-cls="${e.cls}" data-key="${e.key}" style="color:${i.color};">${e.key}</span>`
        input.placeholder = ''
    }
    $('logo').html(html)
}
var __initEdit = function() {
    var html = `
    <ul id="edit-ul">
      <li data-btn="new"   class="edit"><i class="fa-lg iconfont icon-new"></i><span>新建</span></li>
      <li data-btn="amend" class="edit"><i class="fa-lg iconfont icon-amend"></i><span>编辑</span></li>
      <li data-btn="del"   class="edit"><i class="fa-lg iconfont icon-del"></i><span>删除</span></li>
    </ul>`
    $('#edit').append(html)
    // $('#edit').html(html)
}()
var __initBookEngine = function(element, engines, def, tag) {
    var kindHtml = ''
    for (var cls in engines) {
        kindHtml += `<tag data-kind="${tag}" data-cls="${cls}">${cls}</tag>`
    }
    var showHtml = ''
    for (var key in engines[def]) {
        var e = engines[def][key]
        if (e.icon) {
            showHtml += `<${tag} data-cls="${def}" data-key="${key}"> <i style="color:${e.color}" class="fa-logo iconfont icon-${e.icon}"></i> </${tag}>`
        } else {
            showHtml += `<${tag} data-cls="${def}" data-key="${key}"> <span style="color:${e.color}">${key}</span> </${tag}>`
        }
    }
    var html = `
    <div class="kind">${kindHtml}</div>
    <div class="show">${showHtml}</div>`
    element.html(html)
}
var __init__ = function(User) {
    __initLogo(User.def.engine, User.def.logo)
    __initBookEngine($('#engine'), User.engines, User.def.engine, 'engine')
    __initBookEngine($('#book'), User.books, User.def.book, 'book')
}

// Top ！
$('#search').on('click', 'logo',function() {
    $('#search').hide()
    $('#engine').slideDown("slow")
})
$('#top').on('click', '.home', function() {
    if ($('#search').css('display') === 'none') {
        $('#engine,#book,#login').hide()
        $('#search').animate({ height:'show' })
    }
})
$('#top').on('click', '.book', function() {
    if ($('#book').css('display') === 'none') {
        $('#engine,#search,#login').hide()
        $('#book').animate({ height:'show' })
    } else {
        $('#top .home').click()
    }
})
$('#top').on('click', '.user', function() {
    if ($('#login').css('display') === 'none') {
        $('#engine,#search,#book').hide()
        $('#login').animate({ height:'show' })
    } else {
        $('#top .home').click()
    }
})

// 输入 - 智能联想
Mer.moreHtml = ''
Mer.now = -1
Mer.firstUp = true
Mer.soGou = function(value) {
    Mer.now = -1
    Mer.firstUp = true
    //组装 URL
    var sugurl = 'https://www.sogou.com/suggnew/ajajjson?type=web&key=' + encodeURI(value)
    //回调函数
    window.sogou = {
        sug: function(json) {
            var arr = json[1]
            if (arr.length) {
                var html = ''
                for (var i = 0; i < arr.length; i++) {
                    html += '<li data-id="' + i + '">' + arr[i] +'</li>'
                }
                Mer.moreHtml = html
                $('#more-ul').html(Mer.moreHtml)
                $('#more-ul').addClass('more-border')
                $('#search-input').addClass('more-radius')
            } else {
                $('#more-ul').html('')
                $('#more-ul').removeClass('more-border')
                $('#search-input').removeClass('more-radius')
            }
        }
    }
    //动态 JS脚本 cnblogs.com/woider/p/5805248.html
    $("#sug").html('<script src=' + sugurl + '></script>')
}
Mer.UpDn = function(next) {
    if (Mer.firstUp && next === -1) {
        next = 0
        Mer.firstUp = false
    }
    var old = Mer.now
    var all = $('#more-ul li')
    var now = (old + next + all.length) % all.length

    Mer.now = now
    event.target.value = all[now].innerText
    $(all[now]).addClass('li-hover')
    $(all[old]).removeClass('li-hover')
}
$('#search-input').on('blur', function() {
    // 智能联想
    if (screen.width > 768) {
        $('#more-ul').html('')
        $('#more-ul').removeClass('more-border')
        $('#search-input').removeClass('more-radius')
    }
})
$('#search-input').on('focus', function() {
    $('.fa-mini').remove()
    $('#more-button i').addClass('transparent')
    // 智能联想
    if (Mer.moreHtml && event.target.value) {
        $('#more-ul').html(Mer.moreHtml)
        $('#more-ul').addClass('more-border')
        $('#search-input').addClass('more-radius')
    } else {
        $('#more-ul').html('')
    }
})
$('#search-input').on('keyup', function() {
    if (event.keyCode === 13) {
        $('#search-button').click()
    } else if (event.keyCode === 38) {
        Mer.UpDn( -1 )
    } else if (event.keyCode === 40) {
        Mer.UpDn( +1 )
    } else {
        Mer.soGou(event.target.value)
    }
})
$('#search-input').on('keydown', function() {
     if (event.keyCode === 38) {
         event.preventDefault()
     }
})
$('#more-ul').on('mouseover', 'li', function() {
    var old = Mer.now
    var all = $('#more-ul li')
    var now = Number(event.target.dataset.id)

    Mer.now = now
    $(all[now]).addClass('li-hover')
    $(all[old]).removeClass('li-hover')
})

// Search
Mer.Search = function(value) {
    var target = $('logo i')[0] || $('logo span')[0]
    var i = target.dataset
    var e = User.engines[i.cls][i.key]
    var url = e.url
    if (screen.width < 768) {
        if (e.wap) {
            url = e.wap
        }
    }
    url += encodeURI(value)
    window.open(url)
}
$('#more-ul').on('mousedown', 'li', function() {
    Mer.Search(event.target.innerText)
})
$('#search-button').on('click', function() {
    var value = $('#search-input')[0].value
    if (value) {
        Mer.Search(value)
    } else {
        var input = $('#search-input')[0]
        input.focus()
    }
})

// More
Mer.Mini = function(engines, def) {
    $('.fa-mini').remove()
    var miniHtml = ''
    var styleHtml = ''
    for (var key in engines[def]) {
        var e = engines[def][key]
        if (e.icon && key != '大海') {
            miniHtml += `<i data-cls="${def}" data-key="${key}" class="fa-mini iconfont icon-${e.icon}"></i>`
            styleHtml += `.icon-${e.icon}:hover {color:${e.color}}`
        }
    }
    $('#more-i').append(miniHtml)
    $('style').append(styleHtml)
}
Mer.Note = function(note) {
    $('#more-ul').html('<textarea id="more-note"></textarea>')
    $('#more-note')[0].value = localStorage.note || note
}
$('#more-ul').on('focus', '#more-note',function() {
    $('.fa-mini').fadeOut(618)
})
$('#more-ul').on('blur', '#more-note',function() {
    var note = event.target.value
    localStorage.note = note
    User.note = note
})
$('#more-button').on('click', function() {
    $('#more-ul').removeClass('more-border')
    $('#search-input').removeClass('more-radius')
    Mer.Mini(User.engines, '综合')
    Mer.Note(User.note)
})
$('#more-button').on('mouseover', function() {
    $('#more-button i').removeClass('transparent')
})
$('#more-i').on('click', '.fa-mini', function() {
    Mer.Engine()
})

// Engine
Mer.Engine = function() {
    var e = event.target.dataset
    var i = User.engines[e.cls][e.key]
    var input = $('#search-input')[0]
    var html
    if (i.icon) {
        html = `<i data-cls="${e.cls}" data-key="${e.key}" style="color:${i.color};" class="fa-5x iconfont icon-${i.icon}"></i>`
        input.placeholder = e.key
    } else {
        html = `<span data-cls="${e.cls}" data-key="${e.key}" style="color:${i.color};">${e.key}</span>`
        input.placeholder = ''
    }
    $('logo').html(html)
    input.focus()
}
$('#engine').on('click', 'tag', function() {
    if (Mer.rest.short) {
        $('#engine .show').html(Mer.showHtml(User.engines, 'engine'))
    } else {
        Mer.edit.show()
    }
})
$('#engine').on('click', 'engine', function() {
    if (Mer.rest.short) {
        Mer.Engine()
        $('#engine').hide()
        $('#search').slideDown("slow")
    } else {
        Mer.edit.show()
    }
})

// Book
Mer.showHtml = function(engines, tag) {
    var cls = event.target.innerText
    var showHtml = ''
    for (var key in engines[cls]) {
        var e = engines[cls][key]
        if (e.icon) {
            showHtml += `<${tag} data-cls="${cls}" data-key="${key}"><i style="color:${e.color}" class="fa-logo iconfont icon-${e.icon}"></i></${tag}>`
        } else {
            showHtml += `<${tag} data-cls="${cls}" data-key="${key}"><span style="color:${e.color}">${key}</span></${tag}>`
        }
    }
    return showHtml
}
$('#book').on('click', 'tag' , function() {
    if (Mer.rest.short) {
        $('#book .show').html( Mer.showHtml(User.books, 'book') )
    } else {
        Mer.edit.show()
    }
})
$('#book').on('click', 'book', function() {
    if (Mer.rest.short) {
        var e = event.target.dataset
        var i = User.books[e.cls][e.key]
        window.open(i.url)
    } else {
        Mer.edit.show()
    }
})

// Edit
Mer.edit = {
    cont: function() {
        $('#edit-cont').show()
        $('#edit-cont textarea').each( function(i,e) {
            var dif = e.scrollHeight
            e.value += '\n'
            var dif = e.scrollHeight - dif
            var arr = e.value.split('')
            arr.splice(-1, 1)
            e.value = arr.join('')
            e.rows = parseInt(e.scrollHeight / dif)
            e.dataset.dif = dif
        })
    },
    show: function() {
        var x = event.clientX
        if (window.document.body.offsetWidth - x < 125) {
            x -= 125
        }
        var e = event.target
        $(e).addClass('edit-hover')
        $('#edit-ul').css({
            display: "block",
            top: event.clientY + "px",
            left: x + "px"
        })
        setTimeout(function(){
            $('body').one('mousedown', function() {
                var edit = event.target.classList.contains('edit')
                var key  = event.target.dataset.btn
                if (edit) {
                    Mer.edit[key](e)
                } else {
                    $(e).removeClass('edit-hover')
                    $('#edit-ul').hide()
                }
            })
        }, 100)
    },
    hide: function(e) {
        $(e).removeClass('edit-hover')
        $('#edit-ul').hide()
    },
    new: function(e) {
        Mer.edit.hide(e)
        log(e)
    },
    amend: function(e) {
        Mer.edit.hide(e)
        $('#engine,#book').hide()
        var tag = e.dataset.kind || e.localName
        var cls = e.dataset.cls
        var key = e.dataset.key
        var kind = tag + 's'
        var html = ''
        Mer.edit.cont()
        if (key) {
            var i = User[kind][cls][key]
            $('#edit-cont-name').val(key)
            $('#edit-cont-url').val(i.url)
            log(key, i)
        } else {
            $('#edit-cont-name').val(cls)
            log(kind,cls)
        }
    },
    del: function(e) {
        Mer.edit.hide(e)
        var tag = e.dataset.kind || e.localName
        var cls = e.dataset.cls
        var key = e.dataset.key
        var kind = tag + 's'
        if (key) {
            delete User[kind][cls][key]
            e.remove()
        } else {
            if (Object.keys(User[kind][cls]).length) {
                $('.show').html('<div class="text">提示：类不为空</div>')
            } else {
                delete User[kind][cls]
                e.remove()
            }
        }
    }
}
Mer.rest = {
    time: 0,
    short: true
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
$('body').on('mouseup', function() {
    document.oncontextmenu = function() {
        var name = event.target.localName
        if (name === 'tag' || name === 'book' || name === 'engine') {
            Mer.edit.show()
        }
        return false;
    }
})

$('textarea').on('focus', function() {

})
$('textarea').on('input', function() {
    var e = event.target
    e.value = e.value.replace(/\n| /g,'')
    if (e.value) {
        e.rows = parseInt(e.scrollHeight / e.dataset.dif)
    } else {
        e.rows = 1
    }
})
__init__(User)
