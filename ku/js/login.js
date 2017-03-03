var html =
    '<div class="text">' +
        '请输入名字' +
    '</div>' +
    '<div id="login-denglu">' +
        '<inputbox>' +
            '<i class="iconfont icon-login"></i>' +
            '<input id="login-name" type="text" placeholder="名字" maxlength="16">' +
            '<i class="transparent iconfont icon-xclear"></i>' +
        '</inputbox>' +
        '<inputbox>' +
            '<i class="iconfont icon-lock"></i>' +
            '<input id="login-key"  type="password" placeholder="密码" maxlength="30">' +
            '<i class="iconfont icon-biyan"></i>' +
        '</inputbox>' +
    '</div>' +
    '<div id="login-zhuce">' +
        '<inputbox>' +
            '<i class="iconfont icon-phone"></i>' +
            '<input id="login-phone" type="text" maxlength="11" placeholder="手机">' +
            '<span  id="login-phone-11">11</span>' +
        '</inputbox>' +
        '<inputbox>' +
            '<i class="iconfont icon-sms"></i>' +
            '<input id="login-sms" type="text" maxlength="4" placeholder="验证码">' +
            '<span  id="login-sms-60">60</span>' +
        '</inputbox>' +
    '</div>' +
    '<button class="btn-white" id="login-btn-zhuce" type="button">注册</button>' +
    '<button class="btn-blue" id="login-btn-denglu"  type="button">登录</button>'
$('#login').html(html)
// 短信验证
var sms = function() {
    return (parseInt(Math.random()*(10000-1000)+1000))
}

// Login
$('#login input').on('focus', function() {
    event.target.parentElement.classList.add('theme')
})
$('#login input').on('blur', function() {
    event.target.parentElement.classList.remove('theme')
})
$('#login input').on('keydown', function() {
    if (/ /.test(event.key)) {
        event.preventDefault()
    }
})

$('#login-denglu input').on('blur', function() {
    var arr = [$('#login-name'), $('#login-key')]
    var ok = true
    for (var i of arr) {
        if (!i.val()) {
            ok = false
            break
        }
    }
    if (ok) {
        $('#login .text').text('点击登录')
    }
})
$('#login-name').on('focus', function() {
    $('#login .text').text('名字 | 手机号')
})
$('#login-name').on('keydown', function() {
    if (!/[\u4E00-\u9FA5|\u30A0-\u30FF|\u3100-\u312F|\u3200-\u32FF|\uAC00-\uD7FF]|[\d|\w|\-|_]/.test(event.key)) {
        event.preventDefault()
    }
})
$('#login-name').on('keyup', function() {
    if (event.target.value) {
        $('#login-name ~ i').removeClass('transparent')
    } else {
        $('#login-name ~ i').addClass('transparent')
    }
})
$('#login-name ~ i').on('click', function() {
    $('#login-name')[0].value = ''
    $('#login-name ~ i').addClass('transparent')
    $('#login-name').focus()
})
$('#login-key').on('focus', function() {
    event.target.parentElement.classList.add('theme')
    $('#login .text').text('请输入密码')
})
$('#login-key ~ i').on('click', function() {
    var i = $(event.target)
    var e = $('#login-key')[0]
    if (e.type === 'text') {
        e.type = 'password'
        i.removeClass('icon-zhengyan')
    } else {
        e.type = 'text'
        i.addClass('icon-zhengyan')
    }
})

$('#login-phone').on('blur', function() {
    var str = ''
    for (var i of event.target.value) {
        if (/\d/.test(i)) {
            str += i
        }
    }
    event.target.value = str

    var num = 11 - str.length
    if (num) {
        $('#login-phone-11').text(num)
    } else {
        $('#login-phone-11').html('<i class="iconfont icon-go"></i>')
        $('#login .text').text('发送验证码')
    }
})
$('#login-phone').on('keyup', function() {
    var num = (11 - $('#login-phone')[0].value.length)
    if (num) {
        $('#login-phone-11').text(num)
        $('#login .text').text('请输入手机')
    } else {
        $('#login-phone-11').html('<i class="iconfont icon-go"></i>')
    }
})
$('#login-sms').on('focus', function() {
    event.target.value = sms()
})
$('#login-sms').on('blur', function() {
    var str = ''
    for (var i of event.target.value) {
        if (/\d/.test(i)) {
            str += i
        }
    }
    event.target.value = str
})

$('#login-btn-denglu').on('click', function() {
    $('#login-zhuce').hide()
    $('#login-denglu').animate({ height:'show' })
    $('#login .text').text('请输入名字')
})
$('#login-btn-zhuce').on('click', function() {
    $('#login-denglu').hide()
    $('#login .text').text('请输入手机')
    $('#login-zhuce').animate({ height:'show' })
})
