/**
 * @author zhangxinxu(.com)
 * @version -
 * @create 2017-12-20
 * @description
	魔卡——高保真原型交付Node.js工具，主要功能：
	1. HTML import功能，头部和尾部可以公用啦
	2. 基于文件夹的CSS和JS资源合并策略
	3. [本项已移除]支持qcss快速书写，[直接CSS文件支持]变量以及@import模块引入
	4. 本地http环境一键开启，post/get请求轻松模拟
 * @url https://github.com/zhangxinxu/mockup
 * @license MIT 保留原作者和原出处
*/

const fs = require('fs');
stat = fs.stat;

const path = require('path');
const url = require('url');

const http = require('http');

/*
** 文件合并方法
** @params arrUrls Array 需要合并的文件或文件夹（文件夹会合并其中所有1级文件）
** @params strUrl String 合并后的文件名称
*/

const combo = function (arrUrls, strUrl, filter) {
	var content = '';
	// 遍历url并读取文件内容
	if (arrUrls && arrUrls.length && strUrl) {
		arrUrls.forEach(function (url) {
			let st = fs.statSync(url);
			let filedata = '';
			if (st.isFile() && /^_/.test(path.basename(url)) == false) {
				// 如果是文件，且不是下划线开头
				filedata = fs.readFileSync(url, 'utf8');
				if (/\.css$/.test(url)) {
					filedata = qCss(url, filedata);
				}
				content += filedata;
			} else if (st.isDirectory()) {
				// 作为文件夹
				fs.readdirSync(url).forEach(function (filename) {
					let dir = path.join(url, filename);
					if (fs.statSync(dir).isFile() && /^_/.test(filename) == false) {
						filedata = fs.readFileSync(dir, 'utf8');
						if (/\.css$/.test(filename)) {
							filedata = qCss(url, filedata);
						}
						content += filedata;
					}
				});
			}
		});

		if (typeof filter == 'function') {
			content = filter(content);
		}

		// 写入新目录
		// 写入项目配置数据
		fs.writeFile(strUrl, content, function () {
			console.log('资源合并为' + strUrl + '成功');
		});
	}
};


/*
** 删除文件极其目录方法
** @src 删除的目录
*/
const clean = function (src) {
	if (!fs.existsSync(src)) {
		return;
	}

	// 读取目录中的所有文件/目录
	var paths = fs.readdirSync(src);

	paths.forEach(function (dir) {
		let _src = path.join(src, dir);

		let st = fs.statSync(_src);

		if (st.isFile()) {
			// 如果是文件，则删除
			fs.unlinkSync(_src);
		} else if (st.isDirectory()) {
			// 作为文件夹
			clean(_src);
		}
	});

	// 删除文件夹
	try {
		fs.rmdirSync(src);
		console.log('已清空文件夹' + src);
	} catch(e) {}
};


/*
** 创建路径对应的文件夹（如果没有）
** @params path 目标路径
*/
const createPath = function (path) {
	// 路径有下面这几种
	// 1. /User/...      OS X
	// 2. E:/mydir/...   window
	// 3. a/b/...        下面3个相对地址，与系统无关
	// 4. ./a/b/...
	// 5. ../../a/b/...

	path = path.replace(/\\/g, '/');

	var pathHTML = '.';
	if (path.slice(0,1) == '/') {
		pathHTML = '/';
	} else if (/:/.test(path)) {
		pathHTML = '';
	}

	path.split('/').forEach(function(filename) {
		if (filename) {
			// 如果是数据盘地址，忽略
			if (/:/.test(filename) == false) {
				pathHTML = pathHTML + '/' + filename;
				// 如果文件不存在
				if(!fs.existsSync(pathHTML)) {
					console.log('路径' + pathHTML + '不存在，新建之');
					fs.mkdirSync(pathHTML);
				}
			} else {
				pathHTML = filename;
			}
		}
	});
}


/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
const copy = function (src, dst) {
	if (!fs.existsSync(src)) {
		return;
	}

	// 读取目录中的所有文件/目录
	var paths = fs.readdirSync(src);

	paths.forEach(function (dir) {
		var _src = path.join(src, dir),
			_dst = path.join(dst, dir),
			readable, writable;

		let st = fs.statSync(_src);

		// 判断是否为文件
		if (st.isFile()) {
			// 创建读取流
			readable = fs.createReadStream(_src);
			// 创建写入流
			writable = fs.createWriteStream(_dst);
			// 通过管道来传输流
			readable.pipe(writable);
		} else if (st.isDirectory()) {
			// 作为文件夹处理
			createPath(_dst);
			copy(_src, _dst);
		}
	});
};

/*
** html文件import编译方法
** @src String html开发目录
** @dist String html编译目录
*/
const compile = function (src, dist) {
	// 遍历文件夹下的文件
	fs.readdirSync(src).forEach(function (filename) {
		if (/\.html$/.test(filename)) {
			// .html文件才处理
			// 读文件内容
			fs.readFile(path.join(src, filename), {
				// 需要指定编码方式，否则返回原生buffer
				encoding: 'utf8'
			}, function (err, data) {
				// 下面要做的事情就是把
				// <link rel="import" href="header.html">
				// 这段HTML替换成href文件中的内容
				let arrQuery = [];
				// 可以求助万能的正则
				let dataReplace = data.replace(/<link\srel="import"\shref="(.*)">/gi, function (matchs, m1) {
					// m1就是匹配的路径地址了
					let roots = m1.split('?')[0];

					if (m1 !== roots) {
						arrQuery.push(m1.split('?')[1]);
					}

					// 然后就可以读文件了
					return fs.readFileSync(path.join(src, roots), {
						encoding: 'utf8'
					});
				});

				if (arrQuery.length) {
					arrQuery.forEach(function (query) {
						// 查询与替换
						query.split('&').forEach(function (parts) {
							let key = parts.split('=')[0];
							let value = parts.split('=')[1] || '';

							dataReplace = dataReplace.replace('$' + key + '$', value);
						});
					});
				}

				// 替换多余的变量
				dataReplace = dataReplace.replace(/\$\w+\$/g, '');

				// 于是生成新的HTML文件
				fs.writeFile(path.join(dist, filename), dataReplace, {
					encoding: 'utf8'
				}, function () {
					console.log(filename + '生成成功！');
				});
			});
		}
	});
};

/*
** qCss CSS @import导入，以及变量处理
** @params src 当前CSS文件所在路径
** @params data 字符数据
*/
let qCss = function (src, data) {
	if (typeof data != 'string') {
		console.error('data数据格式不对，原路返回');
		return data;
	}
	// @import处理
	data = data.replace(/@import\s+([\w\W]*?);/g, function (matchs, url) {
		// 过滤引号，括号，或者url等
		url = url.replace(/url|\'|\"|\(|\)/g, '');
		// 判断qcss文件是否有
		var pathImportCss = path.join(src, url);

		if (!fs.existsSync(pathImportCss)) {
			console.error(pathImportCss + '文件不存在，忽略这段引入');
			return '/* '+ matchs +' */';
		}
		// 替换成对应文件内容
		return fs.readFileSync(pathImportCss);
	});

	// 计算出文件中设置CSS变量
	// 只支持:root, html, body{}中的变量设置
	var valueMapCustom = {};

	data = data.replace(/(?:\:root|html|body)\s*\{([\w\W]*?)\}/g, function (matchs, $1) {
		var isReplaced = false;
		$1.split(';').forEach(function (parts) {
			if (parts.trim() == '!') {
				isReplaced = true;
				return;
			}
	  		if (parts.split(/:/).length == 2) {
				var keyValue = parts.split(/:/);
				if (keyValue[1].trim() && keyValue[0].trim()) {
		  			valueMapCustom[keyValue[0].trim()] = keyValue[1].trim();
				}
	  		}
		});

		// 设置了!;标示的声明块直接删除，不保留
		if (isReplaced) {
			return '';
		}

		return matchs;
	});
	// 替换var()中的变量设置
  	data = data.replace(/\{([\w\W]*?)\}/g, function (matchs, $1) {
  		return matchs.replace($1, $1.split(';').map(function (state) {
  			if (/:/.test(state) == false || /var\(--.*\)/.test(state) == false) {
  				return state;
  			}
  			// var(--blue, #000)
  			return state.replace(/var\(([\w\W]*?)\)/, function (varMatchs, $var1) {
  				let keyVar = $var1.split(',')[0].trim();
  				let backupVar = $var1.split(',')[1];
  				if (backupVar) {
  					backupVar = backupVar.trim() || 'initial';
  				}

  				return valueMapCustom[keyVar] || backupVar || 'initial';
  			});
  		}).join(';'));
  	});

  	return data.replace(/[\r\n]+/g, '\n');
};

const pathSrcCSS = './src/static/css/';
const pathDistCSS = './dist/static/css/';
const pathSrcJS = './src/static/js/';
const pathDistJS = './dist/static/js/';
const pathSrcHTML = './src/views/html/';
const pathDistHTML = './dist/views/html/';

// 任务
const task = {
	css: {
		init: function () {
			// 资源清理
			clean(pathDistCSS);
			createPath(pathDistCSS);

			// 遍历CSS文件目录
			// 以文件夹的形式进行合并（合并的CSS名称就是文件夹名称）
			// 直接暴露在文件夹中的CSS不合并
			fs.readdirSync(pathSrcCSS).forEach(function (filename) {
				let cssPath = path.join(pathSrcCSS, filename);
				let st = fs.statSync(cssPath);
				// 下划线开头的CSS文件不处理
				if (st.isFile() && /\.css$/.test(filename) && /^_/.test(filename) == false) {
					// 转移
					fs.writeFileSync(path.join(pathDistCSS, filename), fs.readFileSync(cssPath, {
						encoding: 'utf8'
					}), {
						encoding: 'utf8'
					});
				} else if (st.isDirectory()) {
					combo([cssPath], pathDistCSS + filename + '.css');
				}
			});
		}
	},
	js: {
		init: function () {
			// 删除原来的JS
			clean(pathDistJS);
			createPath(pathDistJS);

			// JS合并与转移
			fs.readdirSync(pathSrcJS).forEach(function (filename) {
				let jsPath = path.join(pathSrcJS, filename);
				let jsPathTo = path.join(pathDistJS, filename);
				let st = fs.statSync(jsPath);
				if (st.isFile() && /\.js$/.test(filename)) {
					// 转移
					fs.writeFileSync(jsPathTo, fs.readFileSync(jsPath, {
						encoding: 'utf8'
					}), {
						encoding: 'utf8'
					});
				} else if (st.isDirectory()) {
					combo([jsPath], pathDistJS + filename + '.js');
				}
			});
			// lib资源复制
			createPath(pathDistJS + 'lib');
			copy(pathSrcJS + 'common/lib', pathDistJS + 'lib');
		}
	},
	html: {
		compile: function () {
			compile(pathSrcHTML, pathDistHTML);
		},
		init: function () {
			// 删除对应文件夹
			clean(pathDistHTML);
			createPath(pathDistHTML);

			this.compile();
		}
	}
};


// 一开始第一次任务
for (var keyTask in task) {
	if (typeof task[keyTask] == 'function'){
		task[keyTask]();
	} else if (task[keyTask].init) {
		task[keyTask].init();
	}
}

// 开启watch任务
// CSS监控任务
let timerCSS;
// 监控CSS
fs.watch(pathSrcCSS, {
	recursive: true
}, (eventType, filename) => {
	// 定时器让多文件同时变更只会只会执行一次合并
	clearTimeout(timerCSS);
	console.log(filename + '发生了' + eventType + '变化');
	timerCSS = setTimeout(() => {
		// css合并
		console.log('css合并...');
		task.css.init();
	}, 100);
});

// JS监控任务
let timerJS;
fs.watch(pathSrcJS, {
	recursive: true
}, (eventType, filename) => {
	// 定时器让多文件同时变更只会只会执行一次合并
	clearTimeout(timerJS);
	console.log(filename + '发生了' + eventType + '变化');
	timerJS = setTimeout(() => {
		console.log('重新合并js...');
		task.js.init();
	}, 100);
});

// HTML监控任务
let timerHTML;
fs.watch(pathSrcHTML, {
	recursive: true
}, (eventType, filename) => {
	clearTimeout(timerHTML);

	console.log(filename + '发生了' + eventType + '变化');

	timerHTML = setTimeout(() => {
		task.html.init();
		console.log('HTML编译执行...');
	}, 100);
});

setTimeout(function () {
	console.log('静态资源全面监控中...');
}, 200);


let mimetype = {
  'css': 'text/css',
  'gif': 'image/gif',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'webp': 'image/webp',
  'js': 'text/javascript',
  'json': 'application/json',
  'pdf': 'application/pdf',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'swf': 'application/x-shockwave-flash',
  'woff': 'application/font-woff',
  'woff2': 'application/font-woff2',
  'ttf': 'application/x-font-ttf',
  'eot': 'application/vnd.ms-fontobject',
  'txt': 'text/plain',
  'wav': 'audio/x-wav',
  'mp3': 'audio/mpeg3',
  'mp4': 'video/mp4',
  'xml': 'text/xml'
};

// 创建server
let server = http.createServer(function (request, response) {
	var pathname = url.parse(request.url).pathname;
	var realPath = path.join('dist', pathname);
	//console.log(realPath);
	var ext = path.extname(realPath);
	ext = ext ? ext.slice(1) : 'unknown';
	fs.exists(realPath, function (exists) {
		if (!exists) {
			response.writeHead(404, {
				'Content-Type': 'text/plain'
			});

			response.write('This request URL ' + pathname + ' was not found on this server.');
			response.end();
		} else {
			fs.readFile(realPath, 'binary', function (err, file) {
				if (err) {
					response.writeHead(500, {
						'Content-Type': 'text/plain'
					});
					response.end(err);
				} else {
					var contentType = mimetype[ext] || 'text/plain';
					response.writeHead(200, {
						'Content-Type': contentType
					});
					response.write(file, 'binary');
					response.end();
				}
			});
		}
	});
});

//设置监听端口
let port = new Date().getFullYear();
server.listen(port, '127.0.0.1', function () {
	console.log('服务已经启动，访问地址为：\nhttp://127.0.0.1:'+ port +'/views/html/index.html');
});



