/**
** home.js
** @create 2017-12-19
** @author zhangxinxu
** @version
** @description 主页相关脚本，通常主页JS体积大，并且和其他页面脚本多不重复，因此独立。如果项目主页比较简单，可以和其他页面JS放在一个文件夹下面
*/

$('#btnPost').on('click', function () {
	var elBtn = $(this);
	$.ajax({
		url: G_DATA.postUrl,
		type: 'post',
		dataType: 'json',
		success: function (json) {
			elBtn.parent().after('<p>'+ json.msg +'</p>');
		},
        error: function () {
            elBtn.parent().after('<p>ajax请求失败</p>');
        }
	});
});