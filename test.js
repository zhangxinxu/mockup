
const fs = require('fs');

const path = require('path');
const url = require('url');

const http = require('http');

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
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
const copy = function (src, dst, callback) {
	if (!fs.existsSync(src)) {
		return;
	}

	// 读取目录中的所有文件/目录
	var paths = fs.readdirSync(src);
	paths.forEach(function (dir) {
		var _src = path.join(src, dir);
		var	_dst = path.join(dst, dir);

        let st = fs.statSync(_src);

		// 判断是否为文件
		if (st.isFile()) {
            if(path.extname(_src) === '.html'){
                fs.readFile(_src,'utf8',function(err,file){
                    const filename = path.join(dst, path.basename(_src));
                    file = callback(file,dst);
                    fs.writeFile(filename,file,function(err){
                        console.log('正在生成'+filename)
                    })
                })
            }else{
                const readable = fs.createReadStream(_src);
                // 创建写入流
                const writable = fs.createWriteStream(_dst);
                // 通过管道来传输流
                readable.pipe(writable);
            }

		} else if (st.isDirectory()) {
			// 作为文件夹处理
			createPath(_dst);
			copy(_src, _dst, callback);
		}
	});
};


const imglist = [
    'https://www.pakutaso.com/shared/img/thumb/tomcat1581_TP_V.jpg',
    'https://www.pakutaso.com/shared/img/thumb/nekocyan458A5629_TP_V4.jpg',
    'https://www.pakutaso.com/shared/img/thumb/tomneko12151301_TP_V.jpg',
    'https://images.unsplash.com/photo-1593454878077-79fa932b79f1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1593363747901-b983a9d6b3b1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1593418270780-4c6e6b7eb5af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
]

const pathSrc = './dist/';
const pathDist = './test/';

const tasks = [
    {
        desc: '内容比较多的情况',
        dir: 'overflow/',
        times: 4,
        img: true
    },
    {
        desc: '内容为空的情况',
        dir: 'empty/',
        times: 0,
        img: false
    }
]

const randomImg = function(){
    const len = imglist.length;
    return imglist[Math.floor(Math.random()*len)];
}


clean(pathDist);
tasks.forEach(function(task){
    const dist = pathDist+task.dir;
    createPath(dist);
    copy(pathSrc,dist,function(file,dst){
        const reg_txt = /(?<=>)[^<>\n]+(?=<(?!\/title|\/style|\/script))/g;
        const reg_img = /<img [^>]*src=['"]([^'"]+)[^>]*>/gi;
        return file.replace(reg_txt,function(txt){
            return txt.repeat(task.times);
        }).replace(reg_img, function (match, capture) {
            return match.replace(capture,task.img?randomImg():null)
        });
    });
})
