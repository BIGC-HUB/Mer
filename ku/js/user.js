Mer.editNew = function(e) {

}
Mer.editAmend = function(e) {
    var tag = e.dataset.kind || e.localName
    var cls = e.dataset.cls
    var key = e.dataset.key
    var kind = tag + 's'
    var html = ''
    var transE = {color: '颜　色',url: 'ＰＣ端',wap: '移动端',icon: '图　标'}
    var transB = {color: '颜　色',url: '链　接'}
    if (key) {
        var obj = User[kind][cls][key]
        var arry = Object.keys(obj)
        if (kind === 'engines') {
            html += `<inputbox><span>引　擎</span><input type="text" value="${key}"></inputbox>`
            for (var i of arry) {
                html += `<inputbox><span>${transE[i]}</span><input type="text" value="${obj[i]}"></inputbox>`
            }
        } else {
            html += `<inputbox><span>书　签</span><input type="text" value="${key}"></inputbox>`
            for (var i of arry) {
                html += `<inputbox><span>${transB[i]}</span><input type="text" value="${obj[i]}"></inputbox>`
            }
        }

    } else {
        html += `<inputbox><span>标　签</span><input type="text" value="${cls}"></inputbox>`
    }
    $('#' + tag + ' .edit').append(html)
}
Mer.editDel = function(e) {
    var tag = e.dataset.kind || e.localName
    var cls = e.dataset.cls
    var key = e.dataset.key
    var kind = tag + 's'
    if (key) {
        delete User[kind][cls][key]
        e.remove()
    } else {
        if (Object.keys(User[kind][cls]).length) {
            Mer.edit.element.removeClass('edit-hover')
            Mer.edit.element.html(Mer.edit.html)
            $('.show').html('<div class="text">提示：类不为空</div>')
        } else {
            delete User[kind][cls]
            e.remove()
        }
    }
    $('.edit').animate({ height:'hide' })
}
