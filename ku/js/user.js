Mer.editNew = function(e) {

}
Mer.editAmend = function(e) {
    var tag = e.dataset.kind || e.localName
    var cls = e.dataset.cls
    var key = e.dataset.key
    var kind = tag + 's'
    var html = ''
    var transE = {color: '颜　色',url: '网　址',wap: '移动端',icon: '图　标'}
    var transB = {color: '颜　色',url: '网　址'}
    if (key) {
        var obj = User[kind][cls][key]
        var arry = Object.keys(obj)
        if (kind === 'engines') {
            html += `<span>名　字</span><textarea rows="1">${key}</textarea>`
            for (var i of arry) {
                html += `<span>${transE[i]}</span><textarea rows="1">${obj[i]}</textarea>`
            }
        } else {
            html += `<span>名　字</span><textarea rows="1">${key}</textarea>`
            for (var i of arry) {
                html += `<span>${transB[i]}</span><textarea rows="1">${obj[i]}</textarea>`
            }
        }

    } else {
        html += `<span>标　签</span><textarea rows="1">${cls}</textarea>`
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
