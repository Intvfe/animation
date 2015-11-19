(function(window, App, Intv){
    var url_arg = "v=1";

    if(!/app.intv.com.cn|qq.com$/.test(location.hostname) && location.hash.indexOf('debug=1') < 0){
        // 非生产环境、非腾讯服务器、并且参数后面没有debug=1参数的时候，模块后面一律追加随机参数
        // 主要是为了防止本地开发的缓存问题
        // url_arg += Date.now().toString();
        Vue.config.debug = true;
    }


    App.run({
        baseUrl: 'views',
        paths:{

        },
        urlArgs: url_arg,
        defaultView: 'index'
    });


})(window, App, window['Intv'] || (window['Intv'] = {}));
