var __initLogin = function() {
    var html = '<div style="color: rgba(207,216,230,0.1)" class="fa-5x iconfont icon-star"></div>' +
        '<div class="text"></div>' +
        '<div id="login-dengl">' +
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
                '<input id="login-phone" type="tel" maxlength="11" placeholder="手机">' +
                '<span  id="login-phone-11">11</span>' +
            '</inputbox>' +
            '<inputbox>' +
                '<i class="iconfont icon-sms"></i>' +
                '<input id="login-sms" type="tel" maxlength="4" placeholder="验证码">' +
                '<span  id="login-sms-60">60</span>' +
            '</inputbox>' +
        '</div>' +
        '<div id="login-information">' +
            '<inputbox class="name">' +
                '<i class="iconfont icon-login"></i>' +
                '<input type="text" maxlength="16">' +
                '<i class="iconfont icon-go"></i>' +
            '</inputbox>' +
            '<inputbox class="phone">' +
                '<i class="iconfont icon-phone"></i>' +
                '<input type="tel" maxlength="11">' +
                '<i class="iconfont icon-go"></i>' +
            '</inputbox>' +
            '<button class="enter btn btn-blue" type="button">进入</button>' +
            '<inputbox class="key">' +
                '<i class="iconfont icon-sms"></i>' +
                '<input  type="password" maxlength="30">' +
                '<i class="iconfont icon-go"></i>' +
            '</inputbox>' +
        '</div>' +
        '<div id="login-btn">' +
            '<button class="zhuce  btn btn-white" type="button">注册</button>' +
            '<button class="dengl btn btn-blue"  type="button">登录</button>' +
        '</div>'
    $('#login').html(html)
}()

Mer.login = {
    // 短信验证
    sms: function() {
        return (parseInt(Math.random()*(10000-1000)+1000))
    },
    hide: function() {
        $('#login-information').hide()
        $('#login-information input').val('')
        $('#login-btn, #login-dengl').animate({ opacity:'show' })
        $('.fa-mini').remove()
        $('#more-ul').html('')
        Mer.dengl = false
    },
    show: function(data) {
        $('#login-btn, #login-dengl').hide()
        $('#login-information').animate({ opacity:'show' })
        $('inputbox.phone input').val(data.phone)
        $('inputbox.name input').val(data.name)
        $('inputbox.key input').val(data.key)
        $('.fa-mini').remove()
        $('#more-ul').html('')
    }
}
// Login

$('#login input').on('focus', function() {
    event.target.parentElement.classList.add('theme')
})
$('#login input').on('blur', function() {
    event.target.parentElement.classList.remove('theme')
    var str = ''
    for (var i of event.target.value) {
        if (!/ /.test(i)) {
            str += i
        }
    }
    event.target.value = str
})
$('#login input').on('keydown', function() {
    if (/ /.test(event.key)) {
        event.preventDefault()
    }
})
// 登录
$('#login-name').on('focus', function() {
    $('#login .text').text('名字 | 手机号')
})
$('#login-name').on('keydown', function() {
    if (!/[\u4E00-\u9FA5|\u30A0-\u30FF|\u3100-\u312F|\u3200-\u32FF|\uAC00-\uD7FF]|[\d|\w|\-|_]/.test(event.key)) {
        event.preventDefault()
    }
})
$('#login-name').on('keyup', function() {
    if (event.keyCode === 13) {
        $('#login-key').focus()
    }
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
    $('#login .text').text('请输入密码')
})
$('#login-key').on('keyup', function() {
    if (event.keyCode === 13) {
        $('#login-btn .dengl').click()
    }
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
// 注册
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
    event.target.value = Mer.login.sms()
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
// 按钮
$('#login-btn .dengl').on('click', function() {
    var send = function() {
        var name = $('#login-name').val()
        var key  = $('#login-key').val()
        setCookie('name', name, 7)
        setCookie('key', key, 7)
        Ajax('user/login', null, function(data){
            var data = JSON.parse(data)
            $('#login .text').text(data.text)
            if (data.login) {
                User = data.user
                Mer.dengl = data.login
                __init__(User)
                Mer.login.show(data)
            }
        })
    }
    // 验证
    if ($('#login-dengl').css('display') === 'none') {
        $('#login-zhuce').hide()
        $('#login-dengl').animate({ height:'show' })
        $('#login .text').text('请输入名字')
    } else {
        if ($('#login-name').val() === '') {
            $('#login-name').focus()
        } else {
            if ($('#login-key').val() === '') {
                $('#login-key').focus()
            } else {
                send()
            }
        }
    }
})
$('#login-btn .zhuce').on('click', function() {
    if ($('#login-zhuce').css('display') === 'none') {
        $('#login-dengl').hide()
        $('#login-zhuce').animate({ height:'show' })
        $('#login .text').text('暂未开放注册')
    } else {
        console.log('注册')
    }
})
$('#login-information .enter').on('click', function() {
    Mer.Note(User.note)
    $('#more-button i').removeClass('transparent')
    $('top.home').click()
})
