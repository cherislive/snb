/*!
 *  SNB v1.0.2 By cheris
 *  Github: https://github.com/cherislive/snb
 *  @author cheris <i@cheris.cn>
 *  @createTime 2017-08-07
 *  MIT Licensed.
 */
;(function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    var $ = require('jquery');
    module.exports = root.document ? factory(root, document, $, undefined) : function (w) {
      if (!w.document) {
        throw new Error('snb requires a window with a document');
      }
      return factory(w);
    }
  } else if(typeof define === 'function' && define.amd) {
    define(['jquery'], function ($) {
      root['snb'] = factory(root, document, $, undefined)
    })
  } else if(typeof exports === 'object') {
    var $ = require('jquery');
    exports['snb'] = factory(root, document, $, undefined)
  } else {
    root['snb'] = factory(root, document, root.jQuery, undefined)
  }
})(typeof window !== 'undefined' ? window : this, function (window, document, $, undefined) {  
  var _globalData = {};

  var snb = snb || {};  
  window.snb = snb;
  snb.VERSION = "2.0.3";

  // 当前页面的module,action和参数
  snb.MODULE  = "";
  snb.ACTION  = "";
  snb.REQUEST = {};

  // 用于弹出框的常量值
  snb.BACK    = 0;
  snb.RELOAD  = 1;
  
  // 全局配置信息
  snb.config  = {};
  
  _protoExtend(); // 对原生进行扩展
  _browserCheck();

  $(function(){
    _pageInit();
    snb.lazyLoad();
  });
  // dialog 弹窗组件
  snb.dialog = snb.dialog || {};

  /**
   * 管道节流，用于mouseover等调用频繁的优化处理
   * @name    throttle
   * @param   {Function}  真正用于执行的方法
   * @param   {Integer}   延时
   * @return  {Function}  节流方法
  */
  snb.throttle = function (fn, timeout) {
    var timer;
    return function () {
      var _this = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(_this, args);
      }, timeout);
    };
  };

  /**
   * 获得随机数，如果只传一个参数，则该参为最大数
   * @name    random
   * @param   {Integer}  最小数
   * @param   {Integer}  最大数
   * @return  {Integer}  随机数
  */
  snb.random = function (min, max) {
    if (!max) {
      max = min || 0;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  /**
   * 倒计时
   * @name    countDown
   * @param   {Integer}  当前到结束的时间差
   * @param   {Integer}  唯一索引，当存在多个倒计时时区分
   * @param   {Function} 显示回调方法，将传入时分秒等信息
   * @param   {Function} 倒计时结束的回调方法
  */
  snb.countDown = function (time, index, showCallback, doneCallback) {
    var initTime = new Date().getTime();
    var timeback = time;
    function start () {
      var sTime = new Date().getTime();
      var timeId = setInterval(function () {
        var offsetTime = new Date().getTime() - sTime;
        sTime = new Date().getTime();
        time -= offsetTime;
        var fTime = getFormatTime(time, 0);
        if(offsetTime > 1200 || offsetTime < 900){
          time =  timeback - (new Date().getTime() - initTime);
        }
        if(time <= 0){
          clearInterval(timeId);
          if(typeof doneCallback !== 'undefined') {
            doneCallback(index);
          }
        } else {
          showCallback && showCallback(fTime[0], fTime[1], fTime[2], fTime[3]);
        }
      },1000);
    }
    function getFormatTime (t, isShow) {
      t = t/1000;
      var day    = Math.floor(t / (60 * 60 * 24));
      var hour   = Math.floor((t - day * 24 * 60 * 60) / 3600);
      var minute = Math.floor((t - day * 24 * 60 * 60 - hour * 3600) / 60);
      var second = Math.floor(t - day * 24 * 60 * 60 - hour * 3600 - minute * 60);
      hour   = hour < 10 ? '0' + hour : hour;
      minute = minute < 10 ? '0' + minute : minute;
      second = second<10 ? '0' + second : second;
      isShow && showCallback && showCallback(day, hour, minute, second);
      return [day, hour, minute, second];
    }
    getFormatTime(time, 1);
    start();
  };

  /**
   * 图片加载
   * @name    imgLoad
   * @param   {String}    图片地址
   * @param   {Function}  加载完后的回调方法
  */
  snb.imgLoad = function (url, callback) {
    var image = new Image();
    image.src = url;
    if (image.readyState) {
      image.onreadystatechange = function () {
        if (image.readyState === 'loaded' || image.readyState === 'complete'){
          image.onreadystatechange = null;
          callback(image.width, image.height);
        }
      };
    } else {
      image.onload = function () {
        if (image.complete)
          callback(image.width, image.height);
      };
    }
  };

  /**
   * 判断是否为空对象，与jQuery.isEmptyObject功能相似
   * @name    isEmptyObject
   * @param   {Object}  要检测的对象
   * @return  {Boolean} 是否为空对象
  */
  snb.isEmptyObject = function (object) {
    for (var key in object){
      return false;
    }
    return true;
  };

  /**
   * 获得URL中以GET方式传输的参数
   * @name    getParamByName
   * @param   {String} 要获得的参数名
   * @return  {String} 指定参数名的值
  */
  snb.getParamByName = function (name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  };

  /**
   * 将Json数据转为String
   * @name    jsonToString
   * @param   {Object}  要转化的json对象
   * @param   {Boolean} 是否要进行转码以备URL传输
   * @return  {String}  转化后的字符串
  */
  snb.jsonToString = function (json, isEncode) {
    var strTemp = "";
    for (var key in json) {
      strTemp += key + '=' + (isEncode?encodeURIComponent(json[key]):json[key]) + '&';
    }
    return strTemp.slice(0, -1);
  };

  /**
   * 将String转为Json
   * @name    stringToJson
   * @param   {String}  要转化的字符串
   * @param   {Boolean} 是否要进行转码
   * @return  {String}  转化后的Json对象
  */
  snb.stringToJson = function (string,isDecode) {
    var tempURL = string.split('&'), json="";
    for(var i = 0;i<tempURL.length;i++){
      var t = tempURL[i].split('=');
      json += "'"+t[0]+"':'"+(isDecode?decodeURIComponent(t[1]):t[1])+"',";
    }
    return eval("({"+json.slice(0,-1)+"})");
  };

  /**
   * 去掉空格
   * @name    trim
   * @param   {String}  要去掉空格的字符串
   * @param   {Boolean} 是否去掉字符串中间的空格
   * @return  {String}  处理过的字符串
  */
  snb.trim = function (str, is_global) {
    if(!str) return '';
    //return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    //var result = str.replace(/(^\s+)|(\s+$)/g, "");
    var result = str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    if (is_global) result = result.replace(/\s/g, '');
    return result;
  };


  /**
   * 获取cookie和设置cookie
   * @name    cookie
   * @param   {String}  名字
   * @param   {String}  值
   * @param   {Object}  配置选项
   * @return  {String}  当只有名字时返回名字对应值
  */
  snb.cookie = function (name, value, options) {
    if (typeof value !== 'undefined') {
      options = options || {};
      if (value === null) {
        value = '';
        options = $.extend({}, options);
        options.expires = -1;
      }
      var expires = '';
      if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
        var date;
        if (typeof options.expires === 'number') {
          date = new Date();
          date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
        } else {
          date = options.expires;
        }
        expires = '; expires=' + date.toUTCString();
      }
      var path = options.path ? '; path=' + (options.path) : ';path=/';
      var domain = options.domain ? '; domain=' + (options.domain) : '';
      var secure = options.secure ? '; secure' : '';
      document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else {
      var cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = snb.trim(cookies[i]);
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }
  };

  /**
   * 删除cookie的快捷方法
   * @name    removeCookie
   * @param   {String}  名字
  */
  snb.removeCookie = function (key) {
    snb.cookie(key,'',{expires:-1});
  };

  /**
   * 用以解决回调地狱，参照Promise/A规范
   * @name    deferred
   * @return  {Object}  Promise对象
  */
  snb.deferred = function () {
    function Promise(){
      this.methods = [];
      this.isFirst = true;
    }
    Promise.prototype = {
      then : function (fn, context) {
        this.methods.push({callback:fn,context:this});
        if(this.isFirst){
          this.next();
          this.isFirst = false;
        }
        return this;
      },
      next : function(){
        var _this = this,
            _next = this.methods.shift(),
             args = Array.prototype.slice.call(arguments);
        args.unshift(function(){
          if(_next)
            _this.next.apply(_this,arguments);
        });
        if(_next){
          _next.callback.apply(_next.context,args);
        }
      }
    };
    return new Promise();
  };

  /**
   * 弹出loading
   * @name    loading
   * @param   {Function} 关闭后的回调方法
   * @param   {Object}   配置选项
   * @return  {String}   pop对象
  */
  snb.dialog.loading = function (callback, opts) {
    if(!$.isFunction(callback) && $.type(callback) === 'object')
      opts = callback;
    opts = opts || {};

    opts.content = $.type(callback) === 'string' ? callback : (opts.text ? opts.text : null);
    return _pop(snb.tpl(snb.config.loading, opts), callback, opts);
  };


  /**
   * 弹出信息
   * @name    alert
   * @param   {String}    弹出内容
   * @param   {Function}  关闭后的回调方法
   * @param   {Object}    配置选项
   * @return  {String}    pop对象
  */
  snb.dialog.alert = function (content, callback, opts) {
      if(!content) return;
      if(!$.isFunction(callback) && $.type(callback) === 'object')
        opts = callback;
      opts = opts || {};

     opts.content = content;
     snb.config.alert = _configTplTranslate(snb.config.alert);
     return _pop(snb.tpl(snb.config.alert, opts), callback, opts);
  };

  /**
   * 弹出确认
   * @name    confirm
   * @param   {String}    弹出内容
   * @param   {Function}  确定后的回调方法
   * @param   {Object}    配置选项
  */
  snb.dialog.confirm = function (content, callback, opts) {
      if(!content) return;
      if(!$.isFunction(callback) && $.type(callback) === 'object')
        opts = callback;
      opts = opts || {};

      opts.content = content;
      snb.config.confirm = _configTplTranslate(snb.config.confirm);

      opts.shown = function(){
        $('#Js-confirm-ok').click(function(){
          snb.dialog.popClose();
          if($.isFunction(callback))
            callback();
        });
      };
      return _pop(snb.tpl(snb.config.confirm, opts), opts);
  };

  /**
   * 弹框关闭
   * @name    popClose
  */
  snb.dialog.popClose = function() {
    if(_globalData.currentPop)
      _globalData.currentPop.close();
  };

  /**
   * 弹框
   * @name    pop
   * @param   {String}    弹出内容
   * @param   {Function}  关闭后的回调方法
   * @param   {Object}    配置选项
   * @return  {String}    pop对象
  */
  snb.dialog.pop = function(content, callback, opts) {
    if(!content) return;
    if(!$.isFunction(callback) && $.type(callback) === "object")
      opts = callback;
    opts = opts || {};
    var temp;
    if(/^#/.test(content)){
      if(!$(content).length) return;
      temp = _configTplTranslate(snb.config.pop);
      if(opts.removeAfterShow)
       $(content).remove();
    } else{
      temp = _configTplTranslate(snb.config.pop);
      
    }
    return _pop(snb.tpl(temp,opts),callback,opts);
  };

  //解决弹出模板问题
  function _configTplTranslate(string){
    return string.replace('<%',snb.config.tplOpenTag).replace('%>',snb.config.tplCloseTag);
  }

  //弹框的核心方法
  function _pop(content, callback, opts) {
    if(!$.isFunction(callback) && $.type(callback) === "object")
      opts = callback;
    opts = opts || {};

    if(callback === snb.RELOAD){
      callback = function(){
        location.reload();
      };
    } else if(callback === snb.BACK){
      callback = function(){
        history.back(-1);
      };
    } else if(callback && $.type(callback) === "string"){
      var jumpUrl = callback;
      callback = function(){
        location.href = jumpUrl;
      };
    }
    //立刻执行回调函数，不弹出浮框
    if(opts.notPop){
      callback();
      return;
    }

    $(".Js-pop").stop().remove();
    var htmlText = content;
    var temp = _getShadeLayer("Js-pop")+
                "<div id='Js-pop-body' class='Js-pop pop-container'>"+
                  htmlText+
                "</div>";
    $("body").append(temp).keyup(function(event){
      if(event.keyCode === 27)
        _close();
    });

    $("#Js-pop-body").children().show();
    snb.setEleToCenter("#Js-pop-body",opts);
    // resize下居中
    $(window).bind('resize',function(){
      snb.setEleToCenter("#Js-pop-body",opts);
    });
    // 设置可拖拽
    _moveAction(".title","#Js-pop-body");

    function _close(){
      if(opts.attachBg) $("body").css({"overflow":"auto","position":"static","height":"auto"});
      $("body").unbind("keyup");
      $(".Js-pop-close").unbind("click");
      $(".Js-pop").hide().remove();
      _globalData.currentPop = null;
    }

    if(opts.layerClick){
      $("#Js-shadeLayer").unbind("click").click(function(){
        _close();
      });
    }
    if(opts.attachBg){
      $("body").css({"overflow":"hidden","position":"relative","height":$(window).height()});
      $("#Js-shadeLayer").css({"width":$(window).width(),"height":$(window).height()});
    }
    
    _pluginCheck("#Js-pop-body");
    // 弹出框弹出后的回调方法
    if($.isFunction(opts.shown)){
      opts.shown();
    }
    snb.validator();
    $(".Js-pop-close").click(function(){
     _close();
     if($.isFunction(callback))
        callback();
     else if($.isFunction(opts.close))
        opts.close();
    });    
    // 根据autoCloseTime 后自动关闭弹出框
    if(opts.autoClose){
      window.setTimeout(function(){
        _close();
      },opts.autoCloseTime || 3000);
    }

    _globalData.currentPop = {
      close : _close,
      open  : function(){
        _pop(htmlText,callback,opts);
      }
    };

    return _globalData.currentPop;
  }

  //将元素设置为居中
  snb.setEleToCenter = function (eleId, opts) {
    opts = opts || {};
    var _winWidth  =  $(window).width(),
        _winHeight =  $(window).height(),
        y          =  opts.offsetY || -50,   //设置向上偏移
        $ele       =  $(eleId),
        width      =  $ele.width(),
        height     =  $ele.height();
    // if((snb.browser.msie && snb.browser.version <= 7) || opts.scrollFollow){
    //   y += $(document).scrollTop()+_winHeight/2-height/2;
    //   $ele.css("position","absolute");
    // }
    y += _winHeight/2-height/2;
    $ele.css({"position": "fixed",
              "top" : opts.y || (y<10 ? 10 : y),
              "left": opts.x || (_winWidth/2-width/2+(opts.offsetX||0)) });
  }
    
  //使元素可拖拽移动
  function _moveAction(moveBar, moveBody) {
    var isMove      = false,
        lastX       = -1,
        lastY       = -1,
        offsetX     = -1,
        offsetY     = -1,
        $winBody    = $("body"),
        $moveBar    = $(moveBar),
        $moveBody   = $(moveBody),
        isAbsoluate = $moveBody.css("position") === "absolute" ? true : false;

    if($moveBar.length === 0 || $moveBody.length === 0) return;
    $moveBar.css("cursor","move").unbind("mousedown").
      bind("mousedown",function(event){
        event.preventDefault();
        var body  = $moveBody,
            tempX = body.offset().left,
            tempY = body.offset().top - (isAbsoluate ? 0 : $(document).scrollTop());
        isMove  = true;
        lastX   = event.clientX;
        lastY   = event.clientY;
        offsetX = event.clientX - tempX;
        offsetY = event.clientY - tempY;
        $winBody.unbind("mousemove").bind("mousemove",function(event){
            if(!isMove) return false;
            event.preventDefault();
            event.stopPropagation();
            lastX = event.clientX - lastX;
            lastY = event.clientY - lastY;
            body.css({"left" : event.clientX-lastX-offsetX,"top" : event.clientY-lastY-offsetY});
            lastX = event.clientX;
            lastY = event.clientY;
        });
    }).unbind("mouseup").bind("mouseup",function(event){
        isMove = false;
        $winBody.unbind("mousemove");
    });
    $winBody.unbind("mouseup").bind("mouseup",function(){
        isMove = false;
    });
    $moveBar.blur(function(){
        isMove = false;
        $winBody.unbind("mousemove");
    });
  }

   //获得蒙版层
  function _getShadeLayer(layerClass) {
    return '<div id="Js-shadeLayer" class="'+layerClass+' pop-bg"></div>';
  }

  /**
   * 模板引擎
   * @name    tpl
   * @param   {String}  所要使用的模板，可以是id也可以是字符串
   * @param   {String}  需要结合的数据
   * @param   {String}  模板和数据结合后将append到这个元素里
  */
  snb.tpl = function(template,data,appendEle){
      snb.tpl.cache = snb.tpl.cache || {};
      if(!snb.tpl.cache[template]){
        var content    = template,
            match      = null,
            lastcursor = 0,
            codeStart  = 'var c = [];',
            codeEnd    = 'return c.join("");',
            param      = "",
            compileTpl = "",
            checkEXP   = /(^( )?(if|for|else|switch|case|continue|break|{|}))(.*)?/g,
            searchEXP  = new RegExp(snb.config.tplOpenTag+"(.*?)"+snb.config.tplCloseTag+"?","g"),
            replaceEXP = /[^\w$]+/g;

        if(template.charAt(0) === "#")
          content = $(template).html();
        else
          content = template;

        while(match = searchEXP.exec(content)){
          var b = RegExp.$1;
          var c = content.substring(lastcursor,match.index);
          c = _formatString(c);
          compileTpl += 'c.push("'+c+'");\n';
          if(checkEXP.test(b)){
            compileTpl += b;
          }
          else{
            compileTpl += 'c.push('+b+');\n';
          }
          _setVar(b);
          lastcursor = match.index+match[0].length;
        }
        compileTpl+= 'c.push("'+snb.trim(_formatString(content.substring(lastcursor)))+'");';
        snb.tpl.cache[template] = new Function('data','helper',param+codeStart+compileTpl+codeEnd);
      }

      var result = snb.tpl.cache[template].call(null,data,snb.tpl.helperList);
      if(appendEle){
       $(appendEle).append(result);
      }

      function _formatString(s){
        return s.replace(/^\s*|\s*$/gm, '').replace(/[\n\r\t\s]+/g, ' ').replace(/"/gm,'\\"');
      }

      function _setVar(code){
        code = code.replace(replaceEXP,',').split(',');
        for(var i=0,l=code.length;i<l;i++){
          code[i] = code[i].replace(checkEXP,'');
          if(!code[i].length || /^\d+$/.test(code[i])) continue;
          if(snb.tpl.helperList && code[i] in snb.tpl.helperList)
            param += code[i]+' = helper.'+code[i]+';';
          else
            param += 'var '+code[i]+' = data.'+code[i]+';';
        }
      }
    return result;
  };

  /**
   * 数据发送
   * 使用节流方法避免双击等重复提交
   * @name    sendData
   * @param   {String}   发送地址
   * @param   {Object}   配置选项，如果为字符串则当做发送参数
   * @param   {Function} 请求返回后的回调方法
  */
  var _lastSendDataUrl, _lastUrlTimeout = snb.throttle(function(){_lastSendDataUrl="";},1500);
  snb.sendData=function(url, options, callback) {
    var ajaxObj     = null,
        _this       = this,
        timeoutId   = -1,
        timerLoadId = -1,
        currentUrl  = url+(options.param || options),
        urlParam    = options.param || ($.type(options) === "string" ? options : '');

    if(!options.dontCheck && currentUrl === _lastSendDataUrl){
      return;
    }
    _lastUrlTimeout();
    _lastSendDataUrl = currentUrl;
    if($.isFunction(options)){
      callback = options;
      options  = {};
    }
    if(options.showLoad){
       timerLoadId = window.setTimeout(function(){
          snb.loading();
       },options.loadDelay || 10);
    }
    //设置发送延时
    if(options.sendTimeout){
      timeoutId = window.setTimeout(function(){
        ajaxObj.abort();
        if(callback) {
          callback.call(_this,{"snbStatus":"timeout"});
        }
        snb.alert("请求超时，请稍后再试！");
      }, options.sendTimeout||20000);
    }
    //发送前执行的方法
    if(options.beforeSendDate){
      if($.isFunction(options.beforeSendDate)){
          options.beforeSendDate();
      }
    }
    ajaxObj = $.ajax({
      type: options.type || "post",
      url: url,
      async:options.async === false ? false : true,
      context:options.context || this,
      data: urlParam,
      dataType: options.dataType || "json",
      success:function(backData, textStatus) {
        if(options.showLoad)
          snb.popClose();
        window.clearTimeout(timerLoadId);
        if(options.sendTimeout)
          window.clearTimeout(timeoutId);
        if(backData[snb.config.dataFlag] == snb.config.dataDefaultAlertVal && (options.alertPrompt !== undefined ? options.alertPrompt : true)){
          snb.dialog.alert(backData.message || backData.info,function(){if(callback) callback.call(options.context || _this, backData, options.extData);});
        } else {
          if(callback === snb.RELOAD)
            location.reload();
          else if($.isFunction(callback))
            callback.call(options.context||_this, backData, options.extData);
        }
      },error:function(xhr, textStatus, errorThrown) {
        window.clearTimeout(timerLoadId);
        window.clearTimeout(timeoutId);
        if(callback)
          callback.call(_this,{"snbStatus":"error",message:textStatus});
      }
    });
  };

  snb.validator = function () {

  };

  /**
   * 懒加载
   * @name    lazyLoad
   * @param   {String}    运行上下文
  */
  snb.lazyLoad = function(context) {
    var $els = $(context || "body").find("[snb-lz]:visible"),
        showType = snb.config.lazyLoadShowType,
        threshold  = snb.config.lazyLoadThreshold,
        _height = window.screen.height;
        
    if(!$els.length) return;

    $els.one("appear",function(){
      var $self = $(this),
          url   = $self.attr("snb-lz");
      $self.loaded = true;
      $self.hide();
      $("<img />").on("load", function(){
        if($self.is("img"))
          $self.attr("src",url);
        else
          $self.css("background-image","url("+url+")");
        $self[showType]();
      }).attr("src",url);
    });

    function update(){
      $els.each(function(){
        var $self = $(this);
        if($self.loaded) return;
        checkPos($self);
      });
    }

    function checkPos($el){
      var scroll = $(document).scrollTop()+_height;
      if($el.offset().top < scroll+threshold){
        $el.trigger('appear');
      }
    }

    $(window).on("scroll",snb.throttle(update,100));
    update();
  };

  //页面初始化
  function _pageInit() {
    if(window.console === undefined){
      window.console = {log:function(){}};
    }
    snb.log = function(text){
      console.log("%c"+text,"color:red;font-size:20px;font-weight:bold");
    };

    if (!snb.config.baseUrl) {
      var url = ''
      var tmpMailEl = $("script[snb-main]")
      if (tmpMailEl.length) {        
        url = tmpMailEl.attr("snb-main") ? tmpMailEl.attr("snb-main").split('/') : tmpMailEl.attr("src").split('/');
      } else {
        url = $("script:first").attr("src").split('/');
      }
      var src = url.slice(0,url.indexOf("js"));
      snb.config.baseUrl = src.length ? src.join('/')  + '/' : './';
    }

    if(snb.config.loading){
      _pageSetup();
    } else if(snb.config.baseUrl){
      var ls = window.localStorage;
      if(ls){
        var lastVersion = ls.getItem("snbVersion");
        var configData = ls.getItem("snbConfig");
        if(lastVersion && lastVersion === snb.VERSION && configData){
          window.setTimeout(function(){
           snb.config = snb.stringToJson(configData,true);
           _pageSetup();
          },0);
        } else {
          $.getScript(snb.config.baseUrl+"snb.config.js",function(){
              _pageSetup();
              if(snb.config.cache){
                ls.setItem("snbVersion",snb.VERSION);
                ls.setItem("snbConfig",snb.jsonToString(snb.config,true));
              }
          });
        }
      } else {
        $.getScript(snb.config.baseUrl+"snb.config.js",_pageSetup);
      }
    } else {
      snb.log("请设置静态文件路径");
    }
  }

  //页面构建
  function _pageSetup() {
    _pluginCheck();

    try{
      var path = location.pathname.substring(1).split("/");
      if(snb.config.route == 1){
        if(path[1]){
          for (var i = 0,list = path[1].split("-"),len = list.length; i < len; i+=2) {
            snb.REQUEST[list[i]] = list[i+1];
          }
        }
        snb.MODULE = path[0].split("-")[0];
        snb.ACTION = path[0].split("-")[1] || "index";
      }
    }
    catch(e){snb.log("路径解析错误");}

    if($.isFunction(window.snbInit))
      window.snbInit();
  }

  //对原生进行扩展
  function _protoExtend(){
    var arrayProto = Array.prototype,stringProto = String.prototype;
    if(stringProto.getBytes === undefined){
      stringProto.getBytes = function() {
        var cArr = this.match(/[^x00-xff]/ig);
        return this.length + (cArr === null ? 0 : cArr.length);
      };
    }
    if(arrayProto.remove === undefined){
      arrayProto.remove = function(index){
        return index > this.length ? this : this.splice(index,1) && this;
      };
    }
    if(arrayProto.indexOf === undefined){
      arrayProto.indexOf = function(value){
        for (var i = 0,len = this.length; i < len; i++) {
          if(this[i] === value)
            return i;
        }
        return -1;
      };
    }
  }

  //浏览器类型
  function _browserCheck(){
    snb.browser = snb.browser || {version:0};
    var ua = navigator.userAgent.toLowerCase(),
      msie = ua.indexOf("compatible") !== -1 && ua.indexOf("msie") !== -1;

    if(msie){
      snb.browser.msie = true;
      /msie (\d+\.\d+);/.test(ua);
      snb.browser.version = parseInt(RegExp.$1);
    }
  }

  //插件检测
  function _pluginCheck(context){
    var $body = $(context || "body");
    // var $snbUpload = $body.find("input[snb-upload]");
    // _uploadPlugin($snbUpload);
  }

  return snb
});
