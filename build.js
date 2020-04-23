/**
 * @author zhangxinxu(.com)
 * @version -
 * @create 2020-04-23
 * @description 因为多次遇到直接静态原型最为最终上线版本的需求
 *              静态资源的版本管理，以及压缩等是个头疼的问题，因此
 *              有了本文件。
 *              静态资源版本添加，以及简易的压缩功能实现
 * @url https://github.com/zhangxinxu/mockup
 * @license MIT 保留原作者和原出处
*/

const fs = require('fs');
const path = require('path');

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
    if (path.slice(0, 1) == '/') {
        pathHTML = '/';
    } else if (/:/.test(path)) {
        pathHTML = '';
    }

    path.split('/').forEach(function (filename) {
        if (filename) {
            // 如果是数据盘地址，忽略
            if (/:/.test(filename) == false) {
                pathHTML = pathHTML + '/' + filename;
                // 如果文件不存在
                if (!fs.existsSync(pathHTML)) {
                    console.log('路径' + pathHTML + '不存在，新建之');
                    fs.mkdirSync(pathHTML);
                }
            } else {
                pathHTML = filename;
            }
        }
    });
};


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
        let _src = path.join(src, dir);
        let _dst = path.join(dst, dir);
        let readable, writable;

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

const pathDistStatic = './dist/static/';
const pathDistCSS = pathDistStatic + 'css/';
const pathDistJS = pathDistStatic + 'js/';
const pathDistHTML = './dist/views/html/';

// 这里配置静态域名隐射地址
let config = {
    from: '../../static',
    to: 'https://qidian.gtimg.com/proj-name',

    // 测试页面，如果不需要，去掉或值为空即可
    oa: 'https://oaqidian.gtimg.com/proj-name',
    dev: 'https://devqidian.gtimg.com/proj-name'
};

// 新建build文件夹，如果没有
const pathBilid = './build';
if (!fs.existsSync(pathBilid)) {
    createPath(pathBilid);
}

let pathBilidOa = path.join(pathBilid, 'oa');
if (config.oa) {
    clean(pathBilidOa);
    createPath(pathBilidOa);
}
let pathBilidDev = path.join(pathBilid, 'dev');
if (config.oa) {
    clean(pathBilidDev);
    createPath(pathBilidDev);
}

// 静态资源的版本
const pathBuildVersion = path.join(pathBilid, 'version.json');
let jsonVersion = {};

if (fs.existsSync(pathBuildVersion)) {
    jsonVersion = JSON.parse(fs.readFileSync(pathBuildVersion));
}

// 静态资源拷贝
const pathBilidStatic = path.join(pathBilid, 'static');
copy(pathDistStatic, pathBilidStatic);

// 版本号检测
[pathDistCSS, pathDistJS].forEach(function (src, index) {
    var suffix = ['css', 'js'][index];
    fs.readdirSync(src).forEach(function (filename) {
        if (/\.(?:css|js)$/.test(filename)) {
            let currentVersion = jsonVersion[filename];
            // 第一次这个CSS文件
            // 或者当前版本CSS和新的CSS内容不一样，则版本更新
            let dataCurrent = fs.readFileSync(path.join(src, filename), 'utf8');
            let dataVersion = '';
            if (currentVersion) {
                var nameNew = filename.replace('.' + suffix, `.${currentVersion}.${suffix}`);

                dataVersion = fs.readFileSync(path.join(pathBilidStatic, suffix, nameNew), 'utf8');
            }

            // 创建新的CSS
            if (!currentVersion || (dataCurrent != dataVersion)) {
                // 版本递增
                jsonVersion[filename] = (currentVersion || 0) + 1;

                // 新的版本文件创建
                nameNew = filename.replace('.' + suffix, `.${jsonVersion[filename]}.${suffix}`);
                fs.writeFile(path.join(pathBilidStatic, suffix, nameNew), dataCurrent, {
                    encoding: 'utf8'
                }, function () {
                    console.log(nameNew + '发生变化，新版本生成成功！');
                });
            } else {
                console.log(filename + '没有变化，版本号保持不变');
            }
        }
    });
});

// 存储版本号数据
fs.writeFile(pathBuildVersion, JSON.stringify(jsonVersion), {
    encoding: 'utf8'
}, function () {
    console.log(pathBuildVersion + '保存成功！');
});

// 遍历html页面
fs.readdirSync(pathDistHTML).forEach(function (filename) {
    if (/\.html$/.test(filename)) {
        // .html文件才处理
        // 读文件内容
        fs.readFile(path.join(pathDistHTML, filename), {
            // 需要指定编码方式，否则返回原生buffer
            encoding: 'utf8'
        }, function (err, data) {
            // 静态url地址替换
            let urlStaticFrom = config.from;

            let regUrl = /\s(?:href|src)="([\w\W]+?)"/g;

            ['', 'oa', 'dev'].forEach(function (type) {
                let dataBuild = data.replace(regUrl, function (matches, $1) {
                    let originName = $1.split('/').slice(-1)[0];
                    let versionName = originName;
                    if ($1.indexOf(urlStaticFrom) != -1) {
                        if (originName && jsonVersion[originName]) {
                            var arrSplit = versionName.split('.');
                            arrSplit.splice(-1, 0, jsonVersion[originName]);
                            versionName = arrSplit.join('.');
                        }
                        return matches.replace(urlStaticFrom, config[type || 'to']).replace(originName, versionName);
                    }
                    return matches;
                });

                // 简易HTML压缩
                if (type != 'oa') {
                    dataBuild = dataBuild.replace(/>\s+</g, '> <').replace(/>\s<\//g, '></');
                }

                // 于是生成新的HTML文件
                fs.writeFile(path.join(pathBilid, type, filename), dataBuild, {
                    encoding: 'utf8'
                }, function () {
                    console.log(`${filename} ${type}生成成功！`);
                });
            });
        });
    }
});

