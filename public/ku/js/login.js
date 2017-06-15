const __initLogin = function() {
    let html = `
        <div style="color: rgba(207,216,230,0.1)" class="fa-5x iconfont icon-star"></div>
        <div class="text"></div>
        <div id="login-dengl">
            <inputbox>
                <i class="iconfont icon-login"></i>
                <input id="login-name" type="text" placeholder="名字" maxlength="16">
                <i class="transparent iconfont icon-xclear"></i>
            </inputbox>
            <inputbox>
                <i class="iconfont icon-lock"></i>
                <input id="login-key"  type="password" placeholder="密码" maxlength="30">
                <i class="iconfont icon-biyan"></i>
            </inputbox>
        </div>
        <div id="login-zhuce">
            <inputbox>
                <i class="iconfont icon-phone"></i>
                <input id="login-phone" type="tel" maxlength="11" placeholder="手机">
                <span  id="login-phone-11">11</span>
            </inputbox>
            <inputbox>
                <i class="iconfont icon-sms"></i>
                <input id="login-sms" type="tel" maxlength="4" placeholder="验证码">
                <span  id="login-sms-60">60</span>
            </inputbox>
        </div>
        <div id="login-information">
            <inputbox class="name">
                <i class="iconfont icon-login"></i>
                <input type="text" maxlength="16">
                <i class="iconfont icon-go"></i>
            </inputbox>
            <inputbox class="phone">
                <i class="iconfont icon-phone"></i>
                <input type="tel" maxlength="11">
                <i class="iconfont icon-go"></i>
            </inputbox>
            <button class="enter btn btn-blue" type="button">进入</button>
            <inputbox class="key">
                <i class="iconfont icon-sms"></i>
                <input  type="password" maxlength="30">
                <i class="iconfont icon-go"></i>
            </inputbox>
        </div>
        <div id="login-btn">
            <button class="zhuce  btn btn-white" type="button">注册</button>
            <button class="dengl btn btn-blue"  type="button">登录</button>
        </div>`.html()
    $('#login').html(html)
}()

Mer.login = {
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
        if (!/　/.test(i)) {
            str += i
        }
    }
    event.target.value = str
})
$('#login input').on('keydown', function() {
    if (/ |　/.test(event.key)) {
        event.preventDefault()
    }
})
// 登录
$('#login-name').on('focus', function() {
    $('#login .text').text('名字 | 手机号')
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
$('#login-phone').on('focus', function() {
    $('#login .text').text('注册手机号')
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
        $('#login-phone-11').html('<i class="sms iconfont icon-go"></i>')
        $('#login .text').text('点击发送')
    }
})
$('#login-phone').on('input', function() {
    var num = (11 - $('#login-phone')[0].value.length)
    $('#login-phone-11').text(num)
})
$('#login-phone').on('keyup', function() {
    if (event.keyCode === 13) {
        event.target.blur()
    }
})
$('#login-sms').on('focus', function() {
    $('#login .text').text('短信验证码')
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
        $('#login .text').text('正在登录，请稍后')
        $('#login-btn, #login-dengl').css('pointer-events','none')
        var name = $('#login-name').val()
        var key  = $('#login-key').val()
        c.Cookie('name', name, 7)
        c.Cookie('key', key, 7)
        c.Ajax({
            url: 'user/login',
            callback: function(data){
                var data = JSON.parse(data)
                $('#login .text').text(data.text)
                $('#login-btn, #login-dengl').css('pointer-events','auto')
                if (data.login) {
                    User = data.user
                    Mer.dengl = data.login
                    __init__(User)
                    Mer.login.show(data)
                }
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
    var zhuce = function() {
        var phone = $('#login-phone').val()
        var sms  = $('#login-sms').val()
        c.Ajax({
            url: 'user/join',
            data: {"phone": phone, "sms": sms},
            callback: (data) => {
                var data = JSON.parse(data)
                if (data.join) {
                    $('#login-sms').val('')
                    $('#login-phone').val('')
                    Mer.edit.at = phone
                    $('#edit-val').html('<div><span>名　字</span><input class="name" placeholder="…"></div>')
                    $('#edit-btn').html('<button data-btn="name" class="yes btn btn-blue"><div class="fa-2x iconfont icon-yes"></div>确认</button>')
                    $('#edit .text').text(data.text)
                    $('#edit-cont').animate({height: 'show'})
                } else {
                    $('#login .text').text(data.text)
                }
            }
        })
    }
    if ($('#login-zhuce').css('display') === 'none') {
        $('#login-dengl').hide()
        $('#login-zhuce').animate({ height:'show' })
        $('#login .text').text('请输入手机 | 发送验证码')
    } else {
        if ($('#login-phone').val().length === 11) {
            if ($('#login-sms').val().length === 4) {
                zhuce()
            } else {
                $('#login-sms').focus()
            }
        } else {
            $('#login-phone').focus()
        }
    }
})
$('#login-phone-11').on('click', '.sms', function() {
    var input = $('#login-phone')
    var go = $('#login-phone-11')
    var time = $('#login-sms-60')
    c.Ajax({
        url: 'user/join-sms',
        data: { phone: input.val() },
        callback: (data) => {
            var data = JSON.parse(data)
            $('#login .text').text(data.text)
            if (data.send) {
                go.html('<i class="iconfont icon-more"></i>')
                input.off('blur')
                input.attr("readonly", "readonly")
                var s = 60
                var countTime = setInterval(function() {
                    s -= 1
                    time.text(s)
                    if (s == 0) {
                        time.text(60)
                        clearInterval(countTime)
                        input.removeAttr("readonly")
                        input.on('blur', function() {
                            var str = ''
                            for (var i of event.target.value) {
                                if (/\d/.test(i)) {
                                    str += i
                                }
                            }
                            event.target.value = str
                            var num = 11 - str.length
                            if (num) {
                                go.text(num)
                            } else {
                                go.html('<i class="sms iconfont icon-go"></i>')
                                $('#login .text').text('短信验证码')
                            }
                        })
                    }
                }, 1000)
            }
        }
    })
})

// 进入 按钮
$('#login-information .enter').on('click', function() {
    Mer.Note(User.note)
    $('#more-button').css('color', '#444')
    $('top.home').click()
})
