/*
 * hr系统原型开发node.js脚本
 * 1. 实时CSS合并;
 * 2. 实时JS合并；
 * 3. 实时html编译;
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
			if (st.isFile()) {
				// 如果是文件
				content += fs.readFileSync(url);
			} else if (st.isDirectory()) {
				// 作为文件夹
				fs.readdirSync(url).forEach(function (filename) {
					let dir = path.join(url, filename);
					if (fs.statSync(dir).isFile()) {
						content += fs.readFileSync(dir);
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
** qCss CSS快速书写
** @params src qcss原始文件所在目录
** @params dist 生成CSS文件所在目录
*/

let qCss = function (src, dist) {
  // key转换
  var keyMap = {
	dn: 'display: none',
	di: 'display: inline',
	dib: 'display: inline-block',
	db: 'display: block',
	dt: 'display: table',
	dtc: 'display: table-cell',
	m: 'margin: ',
	ml: 'margin-left: ',
	mt: 'margin-top: ',
	mr: 'margin-right: ',
	mb: 'margin-bottom: ',
	ma: 'margin: auto',
	mla: 'margin-left: auto',
	mra: 'margin-right: auto',
	p: 'padding: ',
	pl: 'padding-left: ',
	pt: 'padding-top: ',
	pr: 'padding-right: ',
	pb: 'padding-bottom: ',
	l: 'float: left',
	r: 'float: right',
	bg: 'background: ',
	bgc: 'background-color: ',
	bgi: 'background-image: ',
	bgr: 'background-repeat: ',
	bgp: 'background-position: ',
	c: 'color: ',
	bd: 'border: ',
	bdl: 'border-left: ',
	bdr: 'border-right: ',
	bdt: 'border-top: ',
	bdb: 'border-bottom: ',
	br: 'border-radius: ',
	bbb: 'box-sizing: border-box',
	o: 'outline: ',
	f: 'font-size: ',
	ff: 'font-family: ',
	fs: 'font-style: ',
	fw: 'font-weight: ',
	b: 'font-weight: bold',
	i: 'font-style: italic',
	n: 'font-weight: normal; font-style: normal',
	tdl: 'text-decoration: underline',
	tdn: 'text-decoration: none',
	tc: 'text-align: center',
	tl: 'text-align: left',
	tr: 'text-align: right',
	tj: 'text-align: justify',
	cl: 'clear: both',
	abs: 'position: absolute',
	rel: 'position: relative',
	fix: 'position: fixed',
	op: 'opacity: ',
	z: 'zoom: ',
	zx: 'z-index: ',
	h: 'height: ',
	w: 'width: ',
	minw: 'min-width: ',
	maxw: 'max-width: ',
	minh: 'min-height: ',
	maxh: 'max-height: ',
	lh: 'line-height: ',
	v: 'vertical-align: ',
	vt: 'vertical-align: top',
	vm: 'vertical-align: middle',
	vb: 'vertical-align: bottom',
	poi: 'cursor: pointer',
	def: 'cursor: default',
	ovh: 'overflow: hidden',
	ova: 'overflow: auto',
	vh: 'visibility: hidden',
	vv: 'visibility: visible',
	prew: 'white-space: pre-wrap',
	pre: 'white-space: pre',
	nowrap: 'white-space: nowrap',
	bk: 'word-break: break-all',
	bkw: 'word-wrap: break-word',
	ws: 'word-spacing: ',
	ls: 'letter-spacing: ',
	a: 'animation: ',
	tsf: 'transform: ',
	tsl: 'transition: ',
	bs: 'box-shadow: ',
	ts: 'text-shadow: ',
	con: 'content: ',
	center: 'position: absolute; top: 0; bottom: 0; right: 0; left: 0; margin: auto',
	ell: 'text-overflow: ellipsis; white-space: nowrap; overflow: hidden',
	clip: 'position: absolute; clip: rect(0 0 0 0)'
  };

  var valueMap = {
	s: 'solid',
	d: 'dashed',
	tt: 'transparent',
	cc: 'currentColor',
	n: 'normal',
	c: 'center',
	rx: 'repeat-x',
	ry: 'repeat-y',
	no: 'no-repeat',
	ih: 'inherit',
	l: 'left',
	t: 'top',
	r: 'right',
	b: 'bottom'
  };

	fs.readdirSync(src).forEach(function (filename) {
  		let st = fs.statSync(path.join(src, filename));
		if (/\.qcss$/.test(filename)) {
			// .qcss文件才处理
			// 读文件内容
			var data = fs.readFileSync(path.join(src, filename), {
				// 需要指定编码方式，否则返回原生buffer
				encoding: 'utf8'
			});

			// 计算出文件中设置的隐射
			  let valueMapCustom = {};

			  data.replace(/\/\*([\w\W]*?)\*\//, function (matchs, $1) {
				$1.split(';').forEach(function (parts) {
				  let needPart = parts.split('$')[1];
				  if (needPart && needPart.split('=').length == 2) {
					let keyValue = needPart.split('=');
					if (keyValue[1].trim() && keyValue[0].trim()) {
					  valueMapCustom[keyValue[0].trim()] = keyValue[1].trim();
					}
				  }
				});
			  });

			  let dataReplace = data.replace(/\{([\w\W]*?)\}/g, function (matchs, $1) {
				let space = '    ';
				let prefix = '{\n' + space, suffix = '\n}';
				// 查询语句处理
				if (/\{/.test($1)) {
					suffix = '\n' + space + '}';
					space = space + space;
				  prefix = '{' + $1.split('{')[0] + '{\n' + space;

				  $1 = $1.split('{')[1];
				}
				// 替换
				// 分号是分隔符
				return prefix + $1.split(';').map(function (state) {
				  state = state.trim();
				  if (!state) {
					return '';
				  }
				  if (state.indexOf(':') != -1) {
					return state;
				  }
				  // state指一段声明，例如f 20，此时下面的key是f, value是20
				  return state.replace(/^([a-z]+)(.*)$/g, function (matchs, key, value) {
					// 值主要是增加单位，和一些关键字转换
					value = (value || '').split(' ').map(function (parts) {
					  parts = parts.trim();
					  if (!parts) {
						return '';
					  }

					  if (!isNaN(parts)) {
						// 数值自动加px单位
						// 不包括行高
						if (key == 'lh' && parts < 5) {
							return parts;
						} else if (/^(?:zx|op|z|fw)$/.test(key) == false && parts != '0' && /^calc/.test(value.trim()) == false) {
						  parts = parts + 'px';
						}
					  } else if (key == 'tsl') {
					  	// transition过渡
						parts = (keyMap[parts] || parts).replace(':', '').trim();
					  } else if (key != 'a') {
						// CSS动画不对值进行替换
						parts = valueMapCustom[parts] || valueMap[parts] || parts;
					  }

					  return parts;
					}).join(' ');

					// 键转换
					key = keyMap[key] || key + ': ';

					return key + value.trim();
				  });
				}).join(';\n' + space).trim() + suffix;
			  }).replace(/\w\{/g, function (matchs) {
			  return matchs.replace('{', ' {');
			}).replace(/\}(\.|#|\:|\[|\w)/g, function (matchs) {
			  return matchs.replace('}', '}\n');
			});

			// 于是生成新的CSS文件
			let newFilename = filename.replace('.qcss', '.css');
			fs.writeFileSync(path.join(dist, newFilename), dataReplace, {
				encoding: 'utf8'
			});

			console.log(newFilename + '生成成功！');
		} else if (st.isDirectory()) {
			// 如果是文件夹
			let qcssDir = path.join(src, filename);
			let cssDir = qcssDir.replace('/qcss/', '/css/');
			createPath(cssDir);
			qCss(qcssDir, cssDir);
		}
	});
};

const pathSrcQCSS = './src/static/qcss/';
const pathSrcCSS = './src/static/css/';
const pathDistCSS = './dist/static/css/';
const pathSrcJS = './src/static/js/';
const pathDistJS = './dist/static/js/';
const pathSrcHTML = './src/views/html/';
const pathDistHTML = './dist/views/html/';
const pathSrcImage = './src/static/images/';
const pathDistImage = './dist/static/images/';

// 任务
const task = {
	qcss: {
		init: function () {
			if (fs.existsSync(pathSrcQCSS)) {
				qCss(pathSrcQCSS, pathSrcCSS);
			}
		}
	},
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
				if (st.isFile() && /\.css$/.test(filename)) {
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
	},
	image: {
		init: function () {
			clean(pathDistImage);
			createPath(pathDistImage);

			copy(pathSrcImage, pathDistImage);
			console.log('图片同步成功');
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
// QCSS监控任务
if (fs.existsSync(pathSrcQCSS)) {
	let timerQCSS;
	fs.watch(pathSrcQCSS, {
		recursive: true
	}, (eventType, filename) => {
		// 定时器让多文件同时变更只会只会执行一次合并
		clearTimeout(timerQCSS);
		console.log(filename + '发生了' + eventType + '变化');
		timerQCSS = setTimeout(() => {
			// qcss -> css
			task.qcss.init();
			// css合并
			console.log('css编译并合并...');
			task.css.init();
		}, 100);
	});
} else {
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
}

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

// 图片资源监控任务
let timerImage;
fs.watch(pathSrcImage, {
	recursive: true
}, (eventType, filename) => {
	clearTimeout(timerImage);
	console.log(filename + '发生了' + eventType + '变化');

	timerImage = setTimeout(() => {
		task.image.init();
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
  'xml': 'text/xml'
};

// 创建server
let server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var realPath = path.join('.', pathname);
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
let PORT = new Date().getFullYear();
server.listen(PORT, '127.0.0.1', function () {
    console.log('服务已经启动，端口为：' + PORT);
});



