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
    var url = 'http://www.sogou.com/web?ie={inputEncoding}&query=' + encodeURI(value)
    window.open(url)
}

$('#more-ul').on('mousedown', 'li', function() {
    Search(event.target.innerText)
})
