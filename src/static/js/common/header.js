/**
 * @description 头部公用JS演示，点击logo文字变色，实际开发这里代码需要删掉
 *              你也可以新建其他平级的公用JS文件，最终会统一合并到./dist/static/js/common.js中
 */

$('.logo').on('click', function () {
    $(this).css('filter', 'hue-rotate(' + Math.round(Math.random() * 360) + 'deg)');
});