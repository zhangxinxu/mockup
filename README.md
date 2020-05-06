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

“魔卡”是个Node.js小工具，开启一些动态特性，<strong>帮助前端人员以超高质量超高效率完成高保真静态原型页面</strong>，纯原生，无任何安装包依赖，很轻量。

通常后端开发都是windows机器多，因此，还准备了run.bat文件，直接双击就可以跑。产品同学也可以玩，开发同学也可以玩。

相比工程化那套东西要简单很多，也没有乱七八糟npm package安装问题。

“魔卡”主要功能：

* HTML import功能，头部和尾部可以公用啦
* 基于文件夹的CSS和JS资源合并策略
* 支持CSS变量以及@import模块引入
* 本地http环境一键开启，post/get请求轻松模拟
* 支持给静态资源自动添加版本号

Demo演示，基于“魔卡”生成的原型页面：[index.html](http://htmlpreview.github.io/?https://github.com/zhangxinxu/mockup/blob/master/dist/views/html/index.html)

### 如何使用？

1. 下载项目zip包：[master.zip](https://github.com/zhangxinxu/mockup/archive/master.zip)
2. 安装[node.js](https://nodejs.org/zh-cn/)
3. 命令行node run。windows系统可以双击run.bat。
4. [新]如果想要自动添加版本号，修改build.js中的config配置，然后执行node build，会自动给CSS和JS资源加版本号，便于发布使用。图片如有变化，自己手动加版本号。

此时“魔卡”就开启了本地服务，http://127.0.0.1:2019/views/html/*.html 访问（127.0.0.1也可以替换成localhost）。这里2019是可变的，是基于当前年份设置的。

同时，全面监控HTML，CSS和JS资源。

模板目录结构：

```js
./src             -> HTML, JS, CSS资源开发目录
  |--static
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
./dist            -> 预览和最终资源交付目录
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
  |    |--map.html             -> 地图和项目进度页面
```

* <code>./src</code> 为开发目录，可以看到资源按照模块或者页面分得比较细<br>
* <code>./dist</code> 为生成目录，原型预览，和静态资源交付都在这个文件夹下。相比<code>./src</code>目录，多了<code>static/images</code>和<code>static/fonts</code>以及<code>views/cgi</code>文件夹，分别放置图片资源、字体资源和ajax请求页面。因为这些资源不参与node任务，因此，直接安排在<code>./dist</code>目录下，省去拷贝的成本。
* <code>./dist/views/map.html</code> 是项目页面地图以及项目进度完成视觉化页面，可以让Leader和项目组一看看出目前进度，访问地址（假设端口号是2019）是 http://localhost:2019/views/map.html 。效果图示意：
![地图和进度](https://qidian.qpic.cn/qidian_common/349573/e86b91d6a2e49655e15201f813604eb4/0)

**一些说明：**

* 上面文件目录结构中，<code>./src</code>中的css, js, html等目录名称和层级是不能调整的，否则会跑不起来。如果进行了修改，需要同步修改run.js相关路径。
* css, js及其以下子目录，目前**仅支持1级文件夹结构**，名称可以任意。例如js文件夹下有一个名为pages的子目录，里面包含page1.js, page2.js两个示意JS文件，此时，魔卡会自动把page1.js, page2.js合并成pages.js（合并的名称是子目录名称）并放在dist目录下，但是，如果你在pages的子目录下面再新建一个文件夹，魔卡则会忽略。如果你是新建一个和pages平级的子目录，例如名为account，则account文件夹里面的JS资源会合并成account.js。

## “魔卡”深入介绍

### 1. 关于CSS编译

支持简单的模块引入和CSS变量编译，具体如下：

#### @import功能

下面两种引入方法都是支持的：

```css
@import '../_variable.css';
```

```css
@import url('../_variable.css');
```

仅支持一层关系import，多层关系不支持，例如a import b, b import c，则a文件编译时候，c是不会嵌套进来的。

毕竟写静态页面原型，不需要太复杂的结构。

#### CSS变量

CSS变量采用原生的CSS语法，也就是`--varname: value`声明变量，然后`var(--varname)`使用变量，具体可参见“<a href="https://www.zhangxinxu.com/wordpress/2016/11/css-css3-variables-var/">了解CSS/CSS3原生变量var</a>”这篇文章。

但是，细节上有差异，包括：

* 只支持`:root{}`，`html{}`，`body{}`中的CSS变量声明；
* 不支持CSS变量嵌套声明；

另外，为了避免和原生需要的CSS变量冲突，建议在语句块中加上`!;`进行区分，本工具在编译时候会过滤这段声明。例如：

```css
body {!;
    --borderRadius: 2px;
}
```

#### 其他

文件名以`_`下划线开头的CSS文件不会参与编译与合并，只能被@import导入。


### 2. 关于合并

合并仅在CSS和JS文件中存在，“魔卡”采用基于文件夹的合并策略。

具体表现为：
* <code>./src/static/js</code>下所有1级文件夹中的JS会合并为和文件夹同命名的独立文件。例如，<code>.src/static/js/pages</code>文件夹下有<code>page1.js</code>和<code>page2.js</code>，当“魔卡”运行后，就会在<code>./dist/static/js</code>目录下合并成一个<code>pages.js</code>。但是，直接暴露在<code>./src/static/js</code>下的js文件是不参与合并，直接复制到<code>./dist/static/js</code>目录下。
  其中，有一个例外，那就是<code>lib</code>文件夹下的JS是不参与合并的，通常用来放置JS框架，例如jquery, zepto之类。
* <code>./src/static/css</code>下所有1级文件夹中的CSS会合并为和文件夹同命名的独立文件。例如，<code>.src/static/js/details</code>文件夹下有<code>home.css</code>，<code>page1.css</code>和<code>page2.css</code>，结果“魔卡”运行后通通合并成了<code>details.css</code>，在<code>./dist/static/css</code>目录下。同样的，直接直接暴露在<code>./src/static/css</code>下的css文件是不参与合并的。

合并不支持多级目录，个人经验，很少项目会用到超过2级的CSS, JS资源。于是就简单点，工具层面约束项目复杂度，使结构更加扁平。

### 3. 关于HTML编译

html文件支持模块导入，采用html5 <code>import</code>语法，例如：

```html
<link rel="import" href="./include/header.html?nav1=active">
```

“魔卡”会将<code>"./include/header.html"</code>这个文件内容直接引入进来，类似php中的<code>include</code>功能。

#### HTML编译支持简易查询

“魔卡”的HTML编译支持通过URL查询字符串向引入的模块传递参数，不过功能比较单一，就是替换，例如：
```html
<link rel="import" href="./include/header.html?nav2=active">
```

这里的<code>nav2=active</code>就会替换header.html中的<code>$nav2$</code>为字符<code>'active'</code>。

header.html原始HTML为：
```html
<h3><a href="./index.html" class="nav-a $nav1$">首页</a></h3>
<h3><a href="./page1.html" class="nav-a $nav2$">页面1</a></h3>
<h3><a href="./page2.html" class="nav-a $nav3$">页面2</a></h3>
```

HTML模块引入后就是：
```html
<h3><a href="./index.html" class="nav-a ">首页</a></h3>
<h3><a href="./page1.html" class="nav-a active">页面1</a></h3>
<h3><a href="./page2.html" class="nav-a ">页面2</a></h3>
```

于是，当我们点击导航切换到“页面1”的时候会发现导航按钮一起跟着高亮了，就是上面<code>nav2=active</code>的作用，如下图：

![页面1导航高亮](https://qidian.qpic.cn/qidian_common/349573/38c37809be99c1ba497d985ca62b03f2/0)

替换细则如下：

替换所有前后都是<code>$</code>的字符单元，如果有匹配的查询关键字（如<code>nav2</code>），则替换为对应的值（如<code>active</code>）；否则替换为空字符串<code>''</code>。

因此，虽然概率较小，但依然有会将引入模块中正常的<code>$$</code>包含内容替换的风险。如果遇到该问题，可以修改run.js中的<code>$</code>字符为更为生僻字符，例如❤之类。

#### HTML编译的局限

目前“魔卡”仅支持直接暴露在<code>./src/views/html</code>目录下的<code>.html</code>文件的编译，子目录<code>.html</code>直接忽略。95%+项目无压力，如果项目真的很复杂，上百个原型页面，不能不文件夹分组，请参照run.js中的示意，自己动手，对这些文件夹调用<code>complie()</code>方法。

### 4. 关于本地服务
本地服务是一个用node.js写的简易服务，支持get/post等ajax请求模拟，和常规资源的加载和显示。

对于一些特殊格式资源，例如<code>.conf</code>，“魔卡”并未支持，需要自己在run.js中的mimetype对象中添加。

“魔卡”本地服务端口采用的是本地年份：

```javascript
let port = new Date().getFullYear();
```

因此，访问地址以 http://127.0.0.1:2019 或者 http://localhost:2019 开始，这就有一个问题，因为年份是固定的，所以，“魔卡”默认是不支持同时开多个本地服务的，如果想要同时开多个服务，需要你修改run.js中的port端口值。

<hr>

接下来内容与本工具关联不大，主要分享如何实现更好的静态原型页面。

## 前端和后端工作分离策略

通常项目开发，我们总会搭建一个和线上环境几乎类似的本地环境，ajax请求地址等等和线上都是一模一样的，唯一不同的就是域名（甚至通过host修改域名都是一样的），这样，JS中的ajax地址就能无缝上线。

但是，对于原型交付式，尤其包含完整交互的高保真原型，上面的策略往往就不太现实。和你对接的开发是深圳的，写页面的前端是上海的，怎么一致？又或者办公系统维护的开发用的是.net，前端全部都是mac机子，怎么一致？

因此，需要的是一个后端数据调试和前端JS，CSS完全分离的策略。

理想状态是这样的：前端原型交付，开发改改页面，Duang！项目就做好了！

有人可能会疑问，难道——
* 不需要知道后台数据接口名称是什么？
* 不需要知道后台什么开发模式开发环境？
* 不需要知道开发静态资源怎么整的？

对的，就是不需要！为什么呢？因为没有必要知道开发的环境、接口。

策略很简单：所有动态部分放在页面上就可以了！

4种处理手段，根据场景使用，包括：

1. 走原生&lt;form&gt;表单；
2. 模板以HTML形式呈现；
3. 特殊场景使用<code>data-\*</code>；
4. 页面底部JS初始化暴露动态参数。

#### 1. 走表单

如下：
```html
<form action="./cgi/getMessageData.json" method="get">
    <input type="hidden" name="type" value="message">
</form>
```

对于原型页面，CSS，JS以及图片等是前端的；HTML页面是开发的，HTML页面上的动态信息的改动是不会影响到前端的。

例如这里<code>action</code>就是和后端约定的接口地址，至于具体是什么，前端无需关心，只要我自己原型跑得通就可以，开发到时候替换成真实请求地址就好了；<code>name</code>属性值<code>type</code>就是接口数据需要的字段，开发觉得不满意，自己改掉就好了，随便改；如果发现还需要其他数据，再自己加一个<code>&lt;input&gt;</code>框就好了，例如加个用户id，直接<code>&lt;form&gt;</code>元素中再塞入一个：


```html
<input type="hidden" name="userid" value="10001">
```

#### 2. HTML模板

HTML模板字符放置在页面上，不要内联到JavaScript中，这样，开发可以根据自己习惯改变下图所示的这些字段名称：

<img src="https://qidian.qpic.cn/qidian_common/349573/4ff605dc242cf76d0cd52d6f224d47d1/0" width="521" height="275">

#### 3. data-\*自定义

这个通常用在独立的按钮上，例如收藏某一个作品。最好么走<code>&lt;form&gt;</code>，如果觉得啰嗦，也可以类似下面这样：

```html
<a href="javascript:" role="button" data-url="./cgi/fav.json" data-params="id=1&action=add">删除</a>
   ```

<code>data-url</code>就是接口地址，<code>data-params</code>中放置需要数据字段。如果是get请求，还请求字段还可以直接放在<code>data-url</code>中，例如：
```html
<a href="javascript:" role="button" data-url="./cgi/getData.json?id=1&page=2">删除</a>
```

#### 4. JS初始化暴露

在每个页面底部通过JS接口，或者全局参数暴露请求地址，例如：

```javascript
HOME.cgi.postUrl = '../cgi/succ.json';
HOME.init();
```

```javascript
var G_DATA = {
    postUrl: '../cgi/succ.json'
};
```

通过上面4中方式的处理，即使你在钓鱼，也不要担心开发同学进行不下去，因为JavaScript脚本中都是干干净净的交互逻辑，凡是开发同学需要的东西都在页面上。

### “魔卡”和分离策略

下面回到“魔卡”工具本身，当我们服务开启的时候，我们访问页面的URL就是一个很随便的URL，<code>/dist/views/html/xxx.html</code>，实际上线后路径多半是<code>/xxx.html</code>这种干净地址，如此随便的URL或许会让一个常年浸染于完整开发环境的前端不可理喻——和线上地址都不一样，上线不就出错了。

别！不会出错。

随便URL是合作方式和现实原因决定的，因为无论什么URL都不会影响实际开发：

1. 前端和后端工作分离，跳转链接，ajax请求地址，页面上CSS, JS和image引入开发都会修改成线上地址的。
2. CSS中的静态资源引用全部都相对路径，因为静态资源都是放在一个服务器上的，因此，上线到任何位置，只要在一起，也不会有路径问题。

也就是，前提是，前端重构人员脑中要有根弦，哪些信息是动态的，必须要放在页面上，一定要清楚；否则，如果混在JavaScript中，那联调起来就麻烦了。

换句话说，“魔卡”要想完全释放实战功力与前端和后端工作分离策略模切相关。

当然，如果前端仅仅是写CSS，不写交互，这些鬼策略可以不用care，大家随意随意。不过我是建议前端把所有JS交互也接管，对自己成长和项目质量把控都有帮助。

