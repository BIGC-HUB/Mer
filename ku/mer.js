// 定义 log enSure
var log = function() {
        console.log.apply(console, arguments)
    }
var ckXian = function() {
    var body  = document.querySelector('body')
    var style ='<style id="xm" media="screen"> * {outline: 1px red dashed} </style>'
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
// 大屏幕
var bigScreen = false
if (screen.width > 768) {
    bigScreen = true
}

// data.json = engines | tags | stars

// 构建 html
var __initTop__ = function() {
    var html =
        '<div class="top-center">' +
            '<top id=""><i class="iconfont icon-login fa-lg"></i>登录</top>' +
            '<top id="back">⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄</top>' +
            '<top id=""><i class="iconfont icon-stars fa-lg"></i>收藏</top>' +
        '</div>'
    $('#top').html(html)
}()
var __initMain__ = function(engines, def, key) {
    var e = engines[def][key]
    var html = `
        <div class="search">
            <logo><i data-cls="${def}" data-key="${key}" style="color:${e.color};" class="fa-5x iconfont icon-dahai"></i></logo>
            <input id="search-input" type="text" maxlength="140"><button id="search-button">
                <i class="fa-lg iconfont icon-search" aria-hidden="true"></i>
            </button>
        </div>
        <div class="more">
            <ul id="more-ul"></ul><div id="more-i">
                <button id="more-button">
                    <i class="transparent fa-1x iconfont icon-down" aria-hidden="true"></i>
                </button>
            </div>
        </div>`
    $('#main').html(html)
}(Mer.engines, '综合', '')
var __initEngine__ = function(engines, def) {
    var kindHtml = ''
    for (var cls in engines) {
        kindHtml += `<tag>${cls}</tag>`
    }
    var engineHtml = ''
    for (var key in engines[def]) {
        var e = engines[def][key]
        if (e.icon) {
            engineHtml += `<engine data-cls="${def}" data-key="${key}"><i style="color:${e.color}" class="fa-logo iconfont icon-${e.icon}"></i></engine>`
        } else {
            engineHtml += `<engine data-cls="${def}" data-key="${key}"><span style="color:${e.color}">${key}</span></engine>`
        }
    }
    var html = `
    <div class="kind">${kindHtml}</div>
    <div class="show">${engineHtml}</div>`
    $('#engine').html(html)
}(Mer.engines, '综合')

// var __initMini__ = function(engines, def) {
//     var miniHtml =`
// `
//     var styleHtml = ''
//     for (var key in engines[def]) {
//         var e = engines[def][key]
//         // key '' 默认
//         if (e.icon && key) {
//             miniHtml += `<i class="fa-mini iconfont icon-${e.icon}"></i>`
//             styleHtml += `.icon-${e.icon}:hover {color:${e.color}}`
//         }
//     }
//     $('#more-i').html(miniHtml)
//     $('style').append(styleHtml)
// }(Mer.engines, '综合')
// 顶部
$('logo').on('click', function() {
    $('#main').slideUp(618)
    setTimeout("$('#engine').slideDown(618);$('#top').show()", 618)
})
$('#back').on('click', function() {
    $('#top').hide()
    $('#engine').slideUp(382)
    setTimeout("$('#main').slideDown(382)", 382)
})

// 迷你
$('#more-button').on('mouseover', function() {
    $('#more-button i').removeClass('transparent')
})


// 智能联想
var moreHtml = ''
var soGou = function(value) {
    //组装 URL
    var sugurl = 'https://www.sogou.com/suggnew/ajajjson?type=web&key=' + encodeURI(value)
    //回调函数
    window.sogou = {
        sug: function(json) {
            var arr = json[1]
            if (arr.length) {
                var html = ''
                for (var li of arr) {
                    html += '<li>' + li +'</li>'
                }
                moreHtml = html
                $('#more-ul').html(moreHtml)
                $('#more-ul').addClass('more-border')
            } else {
                $('#more-ul').html('')
                $('#more-ul').removeClass('more-border')
            }
        }
    }
    //动态 JS脚本 cnblogs.com/woider/p/5805248.html
    $("#sug").html('<script src=' + sugurl + '></script>')
}

$('#search-input').on('keyup', function() {
    // 智能联想
    soGou(event.target.value)
})
$('#search-input').on('blur', function() {
    // 智能联想
    $('#more-ul').html('')
    $('#more-ul').removeClass('more-border')
})
$('#search-input').on('focus', function() {
    // 智能联想
    if (moreHtml) {
        $('#more-ul').html(moreHtml)
        $('#more-ul').addClass('more-border')
    }
})

// 搜索
var Search = function(value) {
    var i = $('logo i')[0].dataset
    var e = Mer.engines[i.cls][i.key]
    var url = e.url
    if (bigScreen) {
        if (e.wap) {
            url = e.wap
        }
    }
    url += encodeURI(value)
    window.open(url)
}
$('#more-ul').on('mousedown', 'li', function() {
    Search(event.target.innerText)
})
