define(['baseview', _buildTextPath('_components.html')], function(Baseview , Components){
    "use strict";

    var $Components = $( Components ).filter('template');

    // 总参与人数组件
    Vue.component('topic-info', {
        template: $Components.filter('[id="topic-info"]').html(),
        data: function(){
            return {name: 'test'}
        }
    });

    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
        if (window.orientation === 180 || window.orientation === 0) {  //竖屏状态！
            $(".transverse").hide();
        }
        if (window.orientation === 90 || window.orientation === -90 ){ //横屏状态！
            $(".transverse").show();
        }
    }, false);

    return Baseview;
});
