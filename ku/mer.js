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

// engine.json
// tag.json
// star.json

// 构建 html
var __initMain__ = function() {
    var html = `
        <div class="search">
            <logo><i data-cls="综合" data-key="大海" style="color:#037DD8;" class="fa-5x iconfont icon-dahai"></i></logo>
            <input id="search-input" type="text" maxlength="140"><button id="search-button">
                <i class="fa-lg iconfont icon-search" aria-hidden="true"></i>
            </button>
        </div>
        <div class="more">
            <ul id="more-ul"></ul><div id="more-i">
                <button id="more-button">
                    <i class="fa-1x iconfont icon-down" aria-hidden="true"></i>
                </button>
            </div>
        </div>`
    $('#main').html(html)
}()
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

// 切换
$('logo').on('click', function() {
    $('#main').slideUp(618)
    setTimeout("$('#engine').slideDown(618);$('#top').show()", 618)
})
$('#top').on('click', function() {
    $('#top').hide()
    $('#engine').slideUp(382)
    setTimeout("$('#main').slideDown(382)", 382)
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
    if (screen.width < 768) {
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
