// Html
var __initTop = function() {
    var html = `
        <top data-id="user" class="user">
            <i class="iconfont icon-login fa-lg"></i>登录
        </top>
        <top class="home"></top>
        <top data-id="book" class="book">
            <i class="iconfont icon-books fa-lg"></i>书架
        </top>`.html()
    $('#top').html(html)
}()
var __initMain = function() {
    var html =`<logo></logo>
        <div class="search">
            <input id="search-input" type="text" maxlength="70">
            <a><i class="fa-1x iconfont icon-xclear"></i></a>
            <button id="search-button">
                <i class="fa-lg iconfont icon-search" aria-hidden="true"></i>
            </button>
        </div>
        <div class="more">
            <ul id="more-ul"></ul>
            <div id="more-i">
                <button id="more-button">
                    <i class="fa-1x iconfont icon-down" aria-hidden="true"></i>
                </button>
            </div>
        </div>`.html()
    $('#search').html(html)
}()
var __initLogo = function(logo) {
    var i = User.engines[logo.cls][logo.key]
    var e = logo
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
var __initBookEngine = function(tag) {
    var element = $('#' + tag)
    var kind = tag + 's'
    var def
    var first = true
    var tagHtml = ''
    for (var cls of User.def.order[tag]) {
        if (first) {
            def = cls
            first = false
        }
        tagHtml += `<tag data-kind="${tag}" data-cls="${cls}">${cls}</tag>`
    }
    var showHtml = Mer.showHtml(tag, def)
    var html = `
    <div class="kind" data-kind="${tag}" data-cls="${def}">${tagHtml}</div>
    <div class="show" data-cls="${def}"  data-key="${tag}">${showHtml}</div>`.html()
    element.html(html)
}
var __init__ = function(User) {
    __initLogo(User.def.logo)
    __initBookEngine('engine')
    __initBookEngine('book')
}

var Mer = {}
var User = {}

// data.json = engines | books | note

// Top
Mer.load = function() {
    c.Ajax('user/load', null, function(data) {
        var data = JSON.parse(data)
        User = data.user
        Mer.dengl = data.login
        __init__(User)
        $('body').click()
        $('#login .text').text(data.text)
        if (Mer.dengl) {
            Mer.login.show(data)
        }
    })
}
Mer.save = function() {
    if (Mer.dengl) {
        c.Ajax('user/save', User)
    }
}
$('#search').on('click', 'logo', function() {
    if (Mer.door.open) {
        window.open(Mer.door.url)
    } else {
        $('#search').hide()
        $('#engine').show()
    }
})
$('#top').on('click', '.home', function() {
    if ($('#search').css('display') === 'none') {
        $('#engine,#book,#login,#edit-cont').hide()
        $('#search').show()
    } else {
        $('#search').hide()
        $('#engine').show()
    }
})
$('#top').on('click', '.book', function() {
    if ($('#book').css('display') === 'none') {
        $('#engine,#search,#login,#edit-cont').hide()
        $('#book').show()
    } else {
        $('top.home').click()
    }
})
$('#top').on('click', '.user', function() {
    if ($('#login').css('display') === 'none') {
        $('#engine,#search,#book,#edit-cont').hide()
        $('#login').show()
    } else {
        $('top.home').click()
    }
})

// 输入 - 智能联想
Mer.ai = {
    isPC: function() {
        var userAgent = navigator.userAgent;
        var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"]
        for (var i of Agents) {
            if (userAgent.indexOf(i) > 0) {
                return false
            }
        }
        return true
    },
    moreHtml: '',
    now: -1,
    firstUp: true,
    soGou: function(value) {
        Mer.ai.now = -1
        Mer.ai.firstUp = true
        //组装 URL
        var sugurl = 'https://www.sogou.com/suggnew/ajajjson?type=web&key=' + encodeURI(value)
        //回调函数
        window.sogou = {
            sug: function(json) {
                var arr = json[1]
                if (arr.length) {
                    var html = ''
                    for (var i = 0; i < arr.length; i++) {
                        html += '<li data-id="' + i + '">' + arr[i] + '</li>'
                    }
                    Mer.ai.moreHtml = html
                    $('#more-ul').html(Mer.ai.moreHtml)
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
    },
    UpDn: function(next) {
        if (Mer.ai.firstUp && next === -1) {
            next = 0
            Mer.ai.firstUp = false
        }
        var old = Mer.ai.now
        var all = $('#more-ul li')
        var now = (old + next + all.length) % all.length

        Mer.ai.now = now
        event.target.value = all[now].innerText
        $(all[now]).addClass('li-hover')
        $(all[old]).removeClass('li-hover')
    },
    hide: function() {
        $('#search-input ~ a').hide()
        $('#more-ul').html('')
        $('#more-ul').removeClass('more-border')
        $('#search-input').removeClass('more-radius')
    }
}
Mer.pc = Mer.ai.isPC()
$('#search-input').on('blur', function() {
    if (screen.width > 768) {
        $('#more-ul').html('')
        $('#more-ul').removeClass('more-border')
        $('#search-input').removeClass('more-radius')
    }
})
$('#search-input').on('focus', function() {
    $('.fa-mini').remove()
    $('#more-button').css('color', 'transparent')
    // 智能联想
    if (Mer.ai.moreHtml && event.target.value) {
        $('#more-ul').html(Mer.ai.moreHtml)
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
        Mer.ai.UpDn(-1)
    } else if (event.keyCode === 40) {
        Mer.ai.UpDn(+1)
    }
})
$('#search-input').on('keydown', function() {
    if (event.keyCode === 38) {
        // UP
        event.preventDefault()
    }
})
$('#more-ul').on('mouseover', 'li', function() {
    var old = Mer.ai.now
    var all = $('#more-ul li')
    var now = Number(event.target.dataset.id)

    Mer.ai.now = now
    $(all[now]).addClass('li-hover')
    $(all[old]).removeClass('li-hover')
})
$('#search-input').on('input', function() {
    var val = event.target.value
    if (val) {
        // 智能联想
        Mer.ai.soGou(val)
        $('#search-input ~ a').show()
    } else {
        Mer.ai.hide()
    }
})
$('#search-input ~ a').on('click', function() {
    event.preventDefault()
    var input = $('#search-input')[0]
    input.value = ''
    input.focus()
    Mer.ai.hide()
})

// Search
Mer.Search = function(value) {
    var target = $('logo i')[0] || $('logo span')[0]
    var i = target.dataset
    var url = 'www.baidu.com/s?wd='
    if (User.def) {
        var e = User.engines[i.cls][i.key]
        url = e.url
        if (screen.width < 768) {
            if (e.wap) {
                url = e.wap
            }
        }
    }
    url += encodeURI(value)
    window.open('http://' + url)
}
Mer.door = {
    url: '',
    open: false,
    show: function() {
        if (!Mer.door.open) {
            c.Ajax('door', null, function(url) {
                Mer.door.url = url
            })
            var logo = $('logo')
            var obj = logo.children()[0].dataset
            $('#top, #more-button').css('color', '#444')
            logo.html('<i style="color:#193943" class="fa-5x iconfont icon-door"></i>')
            setTimeout(function() {
                $('body').one('click', function() {
                    __initLogo(obj)
                    $('#top, #more-button').css('color', 'transparent')
                    $('#search-input')[0].placeholder = ''
                    Mer.door.open = false
                })
            }, 100)
            Mer.door.open = true
        }
    }
}
$('#more-ul').on('mousedown', 'li', function() {
    Mer.Search(event.target.innerText)
})
$('#search-button').on('click', function() {
    var input = $('#search-input')[0]
    if (input.value) {
        Mer.Search(input.value)
    } else {
        Mer.door.show()
        input.placeholder = '任意门'
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
    $('style').html(styleHtml)
}
Mer.Note = function(note) {
    if (Mer.dengl) {
        $('#more-ul').html('<textarea id="more-note"></textarea>')
        $('#more-note')[0].value = note
    } else {
        $('#more-ul').html('')
    }
}
$('#more-ul').on('focus', '#more-note', function() {
    $('.fa-mini').fadeOut(618)
})
$('#more-ul').on('blur', '#more-note', function() {
    User.note = event.target.value
    Mer.save()
})
$('#more-button').on('click', function() {
    $('#more-button').css('color', 'black')
    $('#more-ul').removeClass('more-border')
    $('#search-input').removeClass('more-radius')
    if (User.def) {
        Mer.Mini(User.engines, User.def.logo.cls)
        Mer.Note(User.note)
    }
})
$('#more-button').on('mouseover', function() {
    $('#more-button').css('color', '#444')
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
    Mer.tagClick('engine')
})
$('#engine').on('click', 'engine', function() {
    if (Mer.rest.short) {
        Mer.Engine()
        $('#engine').hide()
        $('top.home').click()
    }
})

// Book
Mer.showHtml = function(tag, def) {
    var kind = User[tag + 's']
    var cls = def || event.target.innerText
    var html = ''
    for (var key in kind[cls]) {
        var e = kind[cls][key]
        if (e.icon) {
            html += `<${tag} data-cls="${cls}" data-key="${key}"><i style="color:${e.color}" class="fa-logo iconfont icon-${e.icon}"></i></${tag}>`
        } else {
            html += `<${tag} data-cls="${cls}" data-key="${key}"><span style="color:${e.color}">${key}</span></${tag}>`
        }
    }
    return html
}
Mer.tagClick = function(tag, def) {
    if (Mer.rest.short) {
        var html = Mer.showHtml(tag)
        var show = $('#' + tag + ' .show')[0]
        show.innerHTML = html
        show.dataset.cls = def || event.target.innerText
        if (html === '') {
            show.style.height = '10em'
        } else {
            show.style.height = 'auto'
        }
    }
}
$('#book').on('click', 'tag', function() {
    Mer.tagClick('book')
})
$('#book').on('click', 'book', function() {
    if (Mer.rest.short) {
        var e = event.target.dataset
        var i = User.books[e.cls][e.key]
        window.open('http://' + i.url)
    }
})
