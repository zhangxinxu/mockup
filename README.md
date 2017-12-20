# 魔卡——高保真原型交付工具

![魔卡](https://qidian.qpic.cn/qidian_common/349573/356d2993e7d6a0ea3eb56d2aaff6ceb4/0)

### 理想与现实

理想：大前端，工程化，前后端分离，模块化开发；<br>
现实：大兄弟，你这是啥啊？我们只要HTML静态页面就好了，你这搞了一堆什么跟什么！

历史遗留原因，很多团队还是传统后端开发套页面方式。即使前端工程化开发成熟大厂也会有类似需求，例如，负责运维公司内部系统的开发，又例如，跨部门甚至异地团队协作时候，希望前端重构交付的就是高质量的HTML原型页面即可，什么自动化工具，前端模板等高科技都不需要，因为对接的开发这些玩不转。

似乎又要回到痛苦的过去，例如：

* 传统静态HTML页面头尾无法公用，20多个页面，如果公用头部变化了，一改该好多地方，累！
* 类似Sass里面变量这么好用的东西就不支持了，万一所有的圆角从2px变成4px，替换都替换不了。
* 传统静态HTML使用file协议预览时候ajax请求一定失败，需要安装和配置Apache或IIS模拟服务环境，这个很烦的，好在一次性的。结果使用会议电脑演示的时候又嗝屁了。产品和开发解压你的压缩包体验时候，异步加载全军覆没，页面效果凄凄惨惨。你说，大大，要装个环境。好吧，我装，大大结果一看安装教程，足足十几步，步步不能错，相当年结婚流程都没这么长，整个人就不好了，友尽。
* 开发那边居然没有资源合并功能，前端只能把JS和CSS全部手动合在一起写，以后维护要看花眼咯。

矛盾就出现了：需求方和交接方希望干净的HTML原型，方便的效果预览；前端同学希望开发时候快速便捷好维护。

那有没有什么办法同时兼顾呢？

这样的痛点促使了“魔卡”的出现。免安装，直击静态页面开发痛点，提高开发效率降低维护成本。

## “魔卡”简介

“魔卡”是个Node.js小工具，纯原生，无任何安装包依赖，所以，就很轻量了。通常后端开发都是windows机器多，因此，还准备了run.bat文件，直接双击就可以跑。产品同学也可以玩，开发同学也可以玩。

相比工程化那套东西要简单很多，也没有乱七八糟npm package安装问题。

“魔卡”主要功能：

* HTML import功能，头部和尾部可以公用啦
* 基于文件夹的CSS和JS资源合并策略
* 支持qcss快速书写，变量以及@import模块引入
* 本地http环境一键开启，post/get请求轻松模拟

### 如何使用？

1. 下载项目zip包：[master.zip](https://github.com/zhangxinxu/mockup/archive/master.zip)
2. 安装[node.js](https://nodejs.org/zh-cn/)
3. 命令行node run。windows系统可以双击run.bat。

此时“魔卡”就开启了本地服务，http://127.0.0.1:2017/views/html/*.html 访问。这里2017是可变的，是基于当前年份设置的。

同时，全面监控HTML，CSS和JS资源。

模板目录结构：

<pre>
./src             --HTML, JS, CSS资源开发目录
  |--static
  |    |--qcss
  |    |    |--common
  |    |    |    |--_variable.qcss
  |    |    |    |--reset.qcss
  |    |    |    |--color.qcss
  |    |    |    |--layout.qcss
  |    |    |    |--animate.qcss
  |    |    |--details
  |    |    |    |--home.qcss
  |    |    |    |--page1.qcss
  |    |    |    |--page2.qcss
  |    |--css
  |    |    |--common
  |    |    |    |--reset.css
  |    |    |    |--color.css
  |    |    |    |--layout.css
  |    |    |    |--animate.css
  |    |    |--details
  |    |    |    |--home.css
  |    |    |    |--page1.css
  |    |    |    |--page2.css
  |    |--js
  |    |    |--common
  |    |    |    |--lib
  |    |    |    |    |--jquery.js
  |    |    |    |--header.js
  |    |    |--home
  |    |    |    |--home.js
  |    |    |--pages
  |    |    |    |--page1.js
  |    |    |    |--page2.js
  |--views
  |    |--html
  |    |    |--include
  |    |    |    |--meta.html
  |    |    |    |--header.html
  |    |    |    |--footer.html
  |    |    |--index.html
  |    |    |--page1.html
  |    |    |--page2.html
./dist            --最终给开发同学的资源目录
  |--static
  |    |--css
  |    |    |--common.css
  |    |    |--details.css
  |    |--js
  |    |    |--lib
  |    |    |    |--jquery.js
  |    |    |--common.js
  |    |    |--home.js
  |    |    |--pages.js
  |    |--images
  |    |--fonts
  |--views
  |    |--html
  |    |    |--index.html
  |    |    |--page1.html
  |    |    |--page2.html
  |    |--cgi
  |    |    |--succ.json
</pre>

<code>./src</code>  为开发目录，可以看到资源按照模块或者页面分得比较细<br>
<code>./dist</code> 为生成目录，原型预览，和静态资源交付都在这个文件夹下。相比<code>./src</code>目录，多了<code>static/images</code>和<code>static/fonts</code>以及<code>views/cgi</code>文件夹，分别放置图片资源、字体资源和ajax请求页面。因为这些资源不参与node任务，因此，直接安排在<code>./dist目录下，省去拷贝的成本。

一些说明：

* 上面文件目录结构中，<code>./src</code>中的css, js, html等目录名称和层级是不能调整的，否则会跑不起来。如果进行了修改，需要同步修改run.js相关路径。
* css, js及其以下子目录，目前仅支持1级文件夹结构，名称可以任意，例如page1.js, page2.js都是示意用，您可以删除或者改成你需要的名称。

## “魔卡”深入介绍

### 1. 关于qcss

qcss本质上是一个CSS编译工具，可以将自定义的语法转换成合法的CSS语法。

设计初衷源自：

CSS常用属性和组合就那么多，例如：<code>float: left</code>这句声明在一二大项目里，估计写个百八十遍都有的。即使有提示工具，还是要敲几个字母，还是要上下键选择，还是要回车。要是直接写一个字母<code>l</code>就表示<code>float: left</code>岂不写起来更快？
还有些CSS组合是固定的，例如，文本打点：
<pre>text-overflow: ellipsis; white-space: nowrap; overflow: hidden</pre>

要是直接<code>ell</code>写3个字母就有上面组合，岂不是写CSS要快很多。
  
基于这个诉求，于是创建了qcss，对将近90多个CSS属性和CSS声明进行了简化书写。例如：

<pre>.example {l; p10; m5 0; f12; cl; z1; }</pre>

会自动转换成如下CSS：

<pre>.example {
    float: left;
    padding: 10px;
    margin: 5px 0;
    font-size: 12px;
    clear: both;
    z-index: 1;
}</pre>

完整映射规则可参考这个项目的文档说明：https://github.com/zhangxinxu/gulp-qcss

名称映射规则源自我很早之前[zxx.lib.css](https://github.com/zhangxinxu/zxx.lib.css)的命名习惯。

一开始可能不太习惯，但是一旦熟练了，你就再也回不去了。

当然，你也可以按照自己的映射习惯修改，直接fork本项目，然后修改run.js中<code>qCss()</code>方法中的映射对象数据。

#### qcss更多功能

#####  ①. 支持变量

qcss还支持变量，变量声明写在qcss文件注释中，通过<code>$</code>标记，使用示意：

<pre>/*
$light = #eee;
*/</pre>

会替换：
<pre>.class { bg light; }</pre>

为：
<pre>.class { background: #eee }</pre>

也可以使用冒号标记：
<pre>/*
$light: #eee;
*/</pre>

注释也可以不正经：
<pre>/**!------
$light: #eee;
----**/</pre>

甚至可以乱入其他文字：
<pre>/*
定义单色变量
$light: #eee;
*/</pre>

变量值长度不受限：
<pre>/*
$font = 'Helvetica Neue','PingFang SC','Myriad Pro','Hiragino Sans GB','microsoft yahei';
*/</pre>

注意，变量只会替换属性值，不会替换属性名称。所以下面的写法是不行的：

<pre>/*
<del>$cb = color: blue;</del>
*/</pre>

如果要支持，请在run.js中添加。

同时注意不要和CSS关键字取同样的名字，例如：
<pre>/*
$left: 4px;
*/</pre>

可能会将正常的<code>left</code>关键字替换。

##### ②. 支持@import模块引入

qcss还支持@import模块引入，使用示意：

<pre>@import './_variable.qcss';</pre>

实际上，没有引号，使用双引号，或者<code>url()</code>括起来都是可以的，就是分号不能丢。

qcss只会对后缀名是<code>qcss</code>引入文件进行处理，如果是<code>css</code>后缀，则生成的CSS代码保留原样。也就是不会影响原始的@import引入CSS的功能。

#### qcss其他说明
所有qcss文件会一对一生成css文件，但是有一个例外，就是下划线<code>_</code>开头的qcss文件是不参与编译的，例如<code>_variable.qcss</code>就不会生成对应的CSS文件。

### 2. 关于合并

先说说为什么要合并。

合并规则具体：

...

## “魔卡”问答
