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
 * @edited by littleLionGuoQing:  20-06-08 接口压缩
*/

const fs = require('fs');
const path = require('path');
const https = require('https');

const {createHash} = require('crypto');
const encrypt = (algorithm, content) => {
    let hash = createHash(algorithm);
    hash.update(content);
    return hash.digest('hex');
};

const md5 = (content) => encrypt('md5', content);

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
const copyFile = function (fileA, fileB) {
    let readable = fs.createReadStream(fileA);
    // 创建写入流
    let writable = fs.createWriteStream(fileB);
    // 通过管道来传输流
    readable.pipe(writable);
};
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
            copyFile(_src, _dst);
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

// 压缩
const opt = {
    hostname: 'yux.yuewen.com',
    port: '443',
    method: 'POST',
    path: '/minify/api/minify',
    headers: {
        'Content-Type': 'application/json'
    }
};

// 这里配置静态域名隐射地址
let config = {
    from: '../../static',
    to: 'https://qidian.gtimg.com/proj-name',

    // 测试页面，如果不需要，去掉或值为空即可
    oa: 'https://oaqidian.gtimg.com/proj-name',
    dev: 'https://devqidian.gtimg.com/proj-name',
    pre: 'https://preqidian.gtimg.com/proj-name'
};

// 新建build文件夹，如果没有
const pathBuild = './build';
if (!fs.existsSync(pathBuild)) {
    createPath(pathBuild);
}

const pathBuildServer = path.join(pathBuild, 'server');

let pathBuildOa = path.join(pathBuildServer, 'oa');
if (config.oa) {
    clean(pathBuildOa);
    createPath(pathBuildOa);
}
let pathBuildDev = path.join(pathBuildServer, 'dev');
if (config.oa) {
    clean(pathBuildDev);
    createPath(pathBuildDev);
}
let pathBuildPre = path.join(pathBuildServer, 'pre');
if (config.pre) {
    clean(pathBuildPre);
    createPath(pathBuildPre);
}

// 静态资源的版本
let jsonVersion = {};

// 静态资源拷贝
const pathBuildStatic = path.join(pathBuild, 'static');
copy(pathDistStatic, pathBuildStatic);

// 版本号检测
[pathDistCSS, pathDistJS].forEach(function (src, index) {
    var suffix = ['css', 'js'][index];
    fs.readdirSync(src).forEach(function (filename) {
        if (/\.(?:css|js)$/.test(filename)) {
            // 获取dist目录下静态资源的内容
            let dataCurrent = fs.readFileSync(path.join(src, filename), 'utf8');
            // 根据内容生成MD5，然后使用md5部分字符作为版本
            // 取最后6位
            let md5Filename = md5(dataCurrent).slice(-6);

            let hashName = filename.replace('.' + suffix, `.${md5Filename}.${suffix}`);
            let minName = hashName.replace('.' + suffix, '.min.' + suffix);

            jsonVersion[filename] = md5Filename;

            // 看看有没有当前hashName的文件
            // 如果有，说明文件内容没有变化
            // 如果没有，则说明文件内容发生了变化，重新生成
            let pathStaticSuffix = path.join(pathBuildStatic, suffix, hashName);
            let pathStaticSuffixMin = path.join(pathBuildStatic, suffix, minName);

            if (!fs.existsSync(pathStaticSuffix)) {
                // 写入dataCurrent到新文件
                console.log(filename + '发生变化，新文件' + pathStaticSuffix + '生成成功！');

                copyFile(path.join(src, filename), pathStaticSuffix);

                // 创建压缩版本
                const data = JSON.stringify({
                    type: suffix,
                    code: dataCurrent,
                    isEs6: suffix === 'js' ? 1 : 0
                });
                var body = '';

                const req = https.request(opt, function (res) {
                    res.setEncoding('utf8');
                    res.on('data', function (data) {
                        body += data;
                    }).on('end', function () {
                        body = JSON.parse(body);
                        if (body.code === 0) {
                            fs.writeFile(pathStaticSuffixMin, body.data.code, {
                                encoding: 'utf8'
                            }, function () {
                                console.log(minName + '压缩版本生成成功！');
                            });
                        }
                    });
                });
                req.on('error', (e) => {
                    console.error(`请求遇到问题: ${e.message}`);

                    fs.writeFile(pathStaticSuffixMin, dataCurrent, {
                        encoding: 'utf8'
                    }, function () {
                        console.log(minName + '使用非压缩版本代替');
                    });
                });
                req.write(data);
                req.end();
            } else {
                console.log(filename + '没有变化，版本号保持不变');
            }
        }
    });
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

            let regUrl = /(?:href|src)="([\w\W]+?)"/g;

            ['', 'oa', 'dev', 'pre'].forEach(function (type) {
                // 这里data.replace的代码注意解决2个问题：
                // 1. 相对地址转换成线上的绝对地址（config配置）
                // 2. 根据类型不同，使用压缩版本或非压缩版本（均使用带hash的文件名）
                let dataBuild = data.replace(regUrl, function (matches, $1) {
                    // originName是文件名，例如main.js
                    let originName = $1.split('/').slice(-1)[0];
                    // versionName是带hash版本号的名称
                    let versionName = originName;
                    // 如果是符合替换规则的URL地址
                    if ($1.indexOf(urlStaticFrom) != -1) {
                        // 同时存储了hash版本号
                        if (jsonVersion[originName]) {
                            if (type == 'oa' || type == 'dev') {
                                versionName = originName.replace(/(\.[a-z]+)$/, `.${jsonVersion[originName]}` + '$1');
                            } else {
                                // 这是带min的压缩版本
                                versionName = originName.replace(/(\.[a-z]+)$/, `.${jsonVersion[originName]}.min` + '$1');
                            }
                        }
                        return matches.replace(urlStaticFrom, config[type || 'to']).replace(originName, versionName);
                    }
                    return matches;
                });

                // HTML压缩
                const dataHTML = JSON.stringify({
                    type: 'html',
                    code: dataBuild
                });
                var body = '';

                // oa和dev版本的html不压缩
                if (type == 'oa' || type == 'dev') {
                    // 于是生成新的HTML文件
                    fs.writeFile(path.join(pathBuildServer, type, filename), dataBuild, {
                        encoding: 'utf8'
                    }, function () {
                        console.log(`${filename} ${type}生成成功！`);
                    });
                } else {
                    // html进行压缩
                    const req = https.request(opt, function (res) {
                        res.setEncoding('utf8');
                        res.on('data', function (data) {
                            body += data;
                        }).on('end', function () {
                            body = JSON.parse(body);
                            if (body.code === 0) {
                                // 于是生成新的HTML文件
                                fs.writeFile(path.join(pathBuildServer, type, filename), body.data.code, {
                                    encoding: 'utf8'
                                }, function () {
                                    console.log(`${filename} ${type}生成成功！`);
                                });
                            }
                        });
                    });
                    req.on('error', (e) => {
                        console.error(`请求遇到问题: ${e.message}`);

                        // 于是生成新的HTML文件
                        fs.writeFile(path.join(pathBuildServer, type, filename), dataBuild, {
                            encoding: 'utf8'
                        }, function () {
                            console.log(`${filename} ${type}替换为非压缩版本`);
                        });
                    });
                    req.write(dataHTML);
                    req.end();
                }
            });
        });
    }
});

