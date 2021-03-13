//
var injectStr = `
<!--injected by ui-check-->
<style>
[data-title] {
    position: relative;
    overflow: visible;
}

[data-title]:before,
[data-title]:after {
    display: block;
    position: absolute;
    z-index: 1;
    left: 50%;
    bottom: 100%;
    transform: translate(-50%, -20px);
    opacity: 0;
    transition: .15s .15s;
    color: #373c42;
    visibility: hidden;
}

[data-title]:before {
    content: attr(data-title);
    border-radius: 3px;
    padding: 6px 10px;
    line-height: 18px;
    text-align: left;
    background-color: #373c42;
    color: #fff;
    font-size: 12px;
    font-style: normal;
    white-space: nowrap;
}

[data-title]:after {
    content: '';
    width: 0;
    height: 0;
    margin-bottom: -12px;
    overflow: hidden;
    border: 6px solid transparent;
    border-top-color: currentColor;
}

[data-title]:hover:before,
[data-title]:hover:after {
    visibility: visible;
    transform: translate(-50%, -10px);
    opacity: 1;
}

/* right */
[data-title][data-title-dir="right"]:before,
[data-title][data-title-dir="right"]:after{
    left: 100%;
    top: 50%;
    bottom: auto;
    transform: translate(20px, -50%);
}
[data-title][data-title-dir="right"]:after {
    margin: 0;
    margin-left: -12px;
    border-color: transparent;
    border-right-color: currentColor;
}
[data-title][data-title-dir="right"]:hover:before,
[data-title][data-title-dir="right"]:hover:after {
    visibility: visible;
    transform: translate(10px, -50%);
    opacity: 1;
}

/* bottom */
[data-title][data-title-dir="bottom"]:before,
[data-title][data-title-dir="bottom"]:after{
    left: 50%;
    top: 100%;
    bottom: auto;
    transform: translate(-50%, 20px);
}
[data-title][data-title-dir="bottom"]:after {
    margin: 0;
    margin-top: -12px;
    border-color: transparent;
    border-bottom-color: currentColor;
}
[data-title][data-title-dir="bottom"]:hover:before,
[data-title][data-title-dir="bottom"]:hover:after {
    visibility: visible;
    transform: translate(-50%, 10px);
    opacity: 1;
}

/* left */
[data-title][data-title-dir="left"]:before,
[data-title][data-title-dir="left"]:after{
    left: auto;
    right: 100%;
    top: 50%;
    bottom: auto;
    transform: translate(-20px, -50%);
}
[data-title][data-title-dir="left"]:after {
    margin: 0;
    margin-right: -12px;
    border-color: transparent;
    border-left-color: currentColor;
}
[data-title][data-title-dir="left"]:hover:before,
[data-title][data-title-dir="left"]:hover:after {
    visibility: visible;
    transform: translate(-10px, -50%);
    opacity: 1;
}

/* muti */
[data-title][data-title-muti]:before {
    width: 150px;
    white-space: normal;
}

/* success */
[data-title][data-title-type="success"]:before {
    background-color: #52c41a;
}
[data-title][data-title-type="success"]:after {
    color:#52c41a;
}
/* error */
[data-title][data-title-type="error"]:before {
    background-color: #f44336;
}
[data-title][data-title-type="error"]:after {
    color:#f44336;
}
/* warn */
[data-title][data-title-type="warn"]:before {
    background-color: #faad14;
}
[data-title][data-title-type="warn"]:after {
    color:#faad14;
}
.ui-check-btn-group{
    position: fixed;
    right: 10px;
    top: 50%;
    margin-top: -130px;
    white-space: nowrap;
    padding: 10px;
    background: #fff;
    border-radius: 40px;
    background: rgba(255,255,255,0.6);
    box-shadow: 0px 3px 10px rgba(0,0,0,0.1);
    z-index: 9999;
    display: none;
}
:root .ui-check-btn-group {
    display: block;
}
.ui-check-button{
    display: block;
    line-height: 20px;
    font-size: 14px;
    text-align: center;
    color: #4c5161;
    border-radius: 4px;
    border: 1px solid #d0d0d5;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 50%;
    padding: 0;
    background-color: #fff;
    background-repeat: no-repeat;
    background-position: center;
    text-decoration: none;
    box-sizing: border-box;
    transition: border-color .15s, box-shadow .15s, opacity .15s;
    font-family: inherit;
    cursor: pointer;
    overflow: visible;
    outline: 0;
    border: 0;
    color: #fff;
}
.ui-check-button+.ui-check-button{
    margin-top: 10px;
}
.ui-check-button:not(.disabled):not(.loading):not(:disabled):hover {
    border-color: #ababaf;
    box-shadow: inset 0 1px 2px rgba(0,0,0,.01), inset 0 0 0 100px rgba(0,0,0,.05);
}
.ui-check-button:not(.disabled):not(.loading):not(:disabled):active {
    box-shadow: inset 0 1px 2px rgba(0,0,0,.1), inset 0 0 0 100px rgba(0,0,0,.1);
}

/* primary button */
.ui-check-button[data-type="primary"],
.ui-check-button[data-type="remind"] {
    background-color: #2a80eb;
}
/* error button */
.ui-check-button[data-type="error"]{
    background-color: #f44336;
}
</style>
<div class="ui-check-btn-group" id="ui-check-btn-group">
    <button class="ui-check-button" data-title-dir="left" data-title="文字比较多，图片随机的情况" data-type="primary" data-info="overflow">溢出</button>
    <button class="ui-check-button" data-title-dir="left" data-title="文字为空，图片缺失的情况" data-type="primary" data-info="empty">空白</button>
    <button class="ui-check-button" data-title-dir="left" data-title="文字随机，图片随机的情况" data-type="primary" data-info="random">随机</button>
    <button class="ui-check-button" data-title-dir="left" data-title="恢复至默认布局" data-type="primary" data-info="normal">正常</button>
    <button class="ui-check-button" data-title-dir="left" data-title-type="error" data-title="关闭悬浮层，刷新后重新出现" data-type="error" data-info="close">关闭</button>
</div>
<script>
(function(){

    if (!String.prototype.repeat) {
        String.prototype.repeat = function (count) {
            'use strict';
            if (this == null) {
                throw new TypeError('cant convert ' + this + ' to object');
            }
            var str = '' + this;
            count = +count;
            if (count != count) {
                count = 0;
            }
            if (count < 0) {
                throw new RangeError('repeat count must be non-negative');
            }
            if (count == Infinity) {
                throw new RangeError('repeat count must be less than infinity');
            }
            count = Math.floor(count);
            if (str.length == 0 || count == 0) {
                return '';
            }
            if (str.length * count >= 1 << 28) {
                throw new RangeError('repeat count must not overflow maximum string size');
            }
            var rpt = '';
            for (; ;) {
                if ((count & 1) == 1) {
                    rpt += str;
                }
                count >>>= 1;
                if (count == 0) {
                    break;
                }
                str += str;
            }
            return rpt;
        }
    }

    var text_nodes = [];
    var img_nodes = [];

    var map = function (nodes) {
        Array.prototype.concat.apply([],nodes.childNodes).forEach(function (el) {
            if (el.id === 'ui-check-btn-group' || el.tagName === 'STYLE' || el.tagName === 'SCRIPT') {
                return
            } else if (el.nodeType === 3) {
                if (el.data.trim() && !el.isRender) {
                    el.isRender = true;
                    text_nodes.push(el);
                }
            } else if (el.nodeType === 1) {
                if (el.tagName === 'IMG' && !el.isRender ) {
                    el.isRender = true;
                    img_nodes.push(el);
                } else {
                    map(el);
                }
            }
        })
    }
    var randomImg = function (title) {
        var w = parseInt(Math.random() * 75 + 5) * 10;
        var h = parseInt(Math.random() * 75 + 5) * 10;
        return 'https://via.placeholder.com/'+w+'x'+h+'?text='+(title||'ui-check');
    }


    // 文本过多
    var overflow = function () {
        map(document.body)
        text_nodes.forEach(function (el) {
            if (!el.bak) {
                el.bak = el.data;
            }
            el.data = el.bak.repeat(4);
        })
        img_nodes.forEach(function (el) {
            if (!el.bak) {
                el.bak = el.src;
            }
            el.src = randomImg(el.alt||el.title);
        })
    }

    // 文本为空
    var empty = function () {
        map(document.body);
        text_nodes.forEach(function (el) {
            if (!el.bak) {
                el.bak = el.data;
            }
            el.data = '';
        })
        img_nodes.forEach(function (el) {
            if (!el.bak) {
                el.bak = el.src;
            }
            el.src = '';
        })
    }

    // 随机
    var random = function () {
        map(document.body);
        text_nodes.forEach(function (el) {
            if (!el.bak) {
                el.bak = el.data;
            }
            el.data = el.bak.repeat(Math.floor(Math.random() * 5));
        })
        img_nodes.forEach(function (el) {
            if (!el.bak) {
                el.bak = el.src;
            }
            el.src = Math.random() > .5 ? randomImg(el.alt||el.title) : null;
        })
    }

    // 正常
    var normal = function () {
        map(document.body);
        text_nodes.forEach(function (el) {
            if (el.bak) {
                el.data = el.bak;
            }
        })
        img_nodes.forEach(function (el) {
            if (el.bak) {
                el.src = el.bak;
            }
        })
    }

    
    var group = document.getElementById('ui-check-btn-group');
    var btns = Array.prototype.concat.apply([],group.getElementsByTagName('button'));
    // 关闭
    var close = function () {
        document.body.removeChild(group);
    }
    var check = {
        'overflow': overflow,
        'empty': empty,
        'random': random,
        'normal': normal,
        'close': close,
    }
    for (var i=0;i<btns.length;i++) {
        (function(j){
            btns[j].onclick = function(){
                var fn = btns[j].getAttribute('data-info');
                check[fn]();
            }
        })(i)
    }
})()
</script>
`

module.exports = injectStr;