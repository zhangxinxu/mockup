/**
 * 头部公用JS演示，点击logo文字变色
 */

$('.logo').on('click', function () {
    $(this).css('color', '#f' + (Math.random() + '').slice(-5));
});