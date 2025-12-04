const isObject = function(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
const isString = function(value) {
    return Object.prototype.toString.call(value) === '[object String]';
}
const isNumber = function(value) {
    return Object.prototype.toString.call(value) === '[object Number]';
}
const isBoolean = function(value) {
    return typeof value === 'boolean';
}

const _defaultConfig = {
    visible: true,
    sidebarExtId: '',
    style: {},
    tags: 'h1,h2,h3,h4,h5,h6'
};

const sidebarExtId = function() {
    return 'sidebarExt';
};

//插件样式
const createStyle = function() {
    const sidebarExtStyleId = 'sidebarExtCss';
    if (document.getElementById(sidebarExtStyleId))
        return;
    const styleTag = document.createElement('style');
    styleTag.id = sidebarExtStyleId;
    styleTag.innerHTML = `
    .sidebarExt {position: fixed;z-index: 99;width: 18%;min-height: 300px;max-height: 80%;overflow: auto;right: 20px;padding: 12px 24px;background-color: #FFF;border-left: 1px solid #EEE;font-size: 14px;top: 150px;}
    .sidebarExt .seItem {padding: 3px 6px;overflow: hidden;line-height: 30px;height: 30px;}
    .sidebarExt .seItem a {text-decoration: none;color: #666;}
    .sidebarExt .seItem a:hover {color: red;}
    .sidebarExt::-webkit-scrollbar {width : 5px;height: 1px;}
    .sidebarExt::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        border-radius: 10px;
        box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
        background   : #ccc;
        }
        /* 滚动条颜色 */
    .sidebarExt::-webkit-scrollbar-thumb {
        background: #33a9dc;
        background-image: linear-gradient(#cb6196,#33a9dc);
        border-radius: 2em;
    }
    .sidebarExt::-webkit-scrollbar-track {
        /*滚动条里面轨道*/
        box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.05);
        border-radius: 10px;
        background   : #ededed;
        }
    `;
    document.querySelector('head').appendChild(styleTag);
};

//把任意元素移动到指定的目标位置
const animate = function(element, target) {
    clearInterval(element.timer1);
    element.timer1 = setInterval(function() { //element是一个对象，对象点出来的属性有且只有一个，避免多次点击按钮产生多个定时器
        var current = element.offsetTop; //.offsetLeft; //获取当前位置，数字类型，没有px。
        //不可以用element.style.left，因为该写法只能获取到行内样式，不能获取到<style></style>标签内的样式
        var step = 10; //每次移动的距离
        step = current < target ? step : -step; //step的正负表示了向左或是向右移动
        current += step; //计算移动到的位置，数字类型，没有px
        if (Math.abs(target - current) > Math.abs(step)) { //当离目标位置的距离大于一步移动的距离
            element.style.top = current + "px"; //移动

        } else { //当间距小于一步的距离，则清理定时器，把元素直接拿到目标位置
            clearInterval(element.timer1);
            element.style.top = target + "px";

        }
    }, 20);
}

//插件入口
const sidebarExtPluginFunction = function(hook, vm) {
    letconfig = {};
    //sidebarExt插件配置
    if (vm.config && isObject(vm.config.sidebarExt)) {
        config = vm.config.sidebarExt;
        config.visible = isBoolean(config.visible) ? config.visible : _defaultConfig.visible;
        config.style = isObject(config.style) ? config.style : _defaultConfig.style;
        config.sidebarExtId = isString(config.sidebarExtId) && !document.getElementById(config.sidebarExtId) ? config.sidebarExtId : sidebarExtId();
        config.tags = isString(config.tags) ? config.tags : _defaultConfig.tags;
    } else {
        _defaultConfig.sidebarExtId = sidebarExtId();
        config = _defaultConfig;
    }


    var initSidebarExt = function(data) {
        if (!config.sidebarExtId)
            return null;


        //添加样式
        createStyle();
        const plugDiv = document.createElement('div');
        plugDiv.id = config.sidebarExtId;
        plugDiv.className = 'sidebarExt';

        // 遍历配置的样式对象，设置样式
        for (const key in config.style) {
            if (Object.prototype.hasOwnProperty.call(config.style, key)) {
                plugDiv.style.setProperty(key, config.style[key]);
            }
        }

        return plugDiv;

    };

    //格式化数据
    var formatData = function() {

        var data = document.querySelector('section.content').querySelectorAll(config.tags);
        var htmlStr = '';

        if (data.length > 0) {
            var arr1 = [];
            for (var i = 0; i < data.length; i++) {
                arr1[i] = data[i].nodeName;
            }
            //去重并从小大到排序
            var arr2 = Array.from(new Set(arr1)).sort();

            for (var i = 0; i < data.length; i++) {
                var o = data[i];
                var leftw = 0;
                var pos = arr2.indexOf(o.nodeName);
                var leftw = pos * 10;
                var leftStyle = 'padding-left:' + leftw + 'px;';
                var tag = '&rsaquo;';
                if (pos == 0) {
                    leftStyle += 'font-weight:bold;';
                    tag = '&raquo;';
                }

                var _url = '<a href="' + o.firstElementChild.href + '" data-id="' + o.id + '" >' + tag + '&nbsp&nbsp' + o.innerText + '</a>';

                htmlStr += '<div class="seItem" style="' + leftStyle + '">' + _url + '</div>';
            }
        }
        //清空数据
        if (document.getElementById(config.sidebarExtId)) {
            document.getElementById(config.sidebarExtId).innerHTML = '';
        }
        return htmlStr;
    };

    //创建侧边栏
    const createSidebarExt = function(data) {
        if (!config.visible)
            return;

        //创建元素节点
        if (document.getElementById(config.sidebarExtId)) {
            document.getElementById(config.sidebarExtId).innerHTML = formatData();

        } else {
            let plugDiv = initSidebarExt();
            plugDiv.innerHTML = formatData();
            var md = Docsify.dom.find("article.markdown-section");
            md.style.setProperty("float", "left");
            md.style.setProperty("width", "70%");
            md.style.setProperty("padding", "30px 15px 40px 70px");
            Docsify.dom.find("section.content").appendChild(plugDiv);
        }

    };

    // //每次路由切换时数据全部加载完成后调用，没有参数。
    hook.doneEach(function() {
        if ($docsify.coverpage !== "" && $docsify.coverpage !== false) {
            if (document.location.hash !== "#/")
                createSidebarExt();
        } else {
            createSidebarExt();
        }
    });

    hook.ready(function() {
        // 初始化并第一次加载完成数据后调用，没有参数。
        if (document.getElementById(config.sidebarExtId)) {
            var _div = document.getElementById(config.sidebarExtId);
            var _isTop = false;
            window.onscroll = function() {
                var t = document.documentElement.scrollTop || document.body.scrollTop;
                if (t >= 300) {
                    if (!_isTop) {
                        animate(_div, 30);
                        _isTop = true;
                    }
                } else {
                    if (_isTop) {
                        animate(_div, 150);
                        _isTop = false;
                    }
                }
            }
        }
    });



};






if ($docsify.plugins && Array.isArray($docsify.plugins)) {
    $docsify.plugins.push(sidebarExtPluginFunction);
} else {
    $docsify.plugins = [sidebarExtPluginFunction];
}
if ($docsify.plugins && Array.isArray($docsify.plugins)) {
    $docsify.plugins.push(sidebarExtPluginFunction);
} else {
    $docsify.plugins = [sidebarExtPluginFunction];
}