define(['base', _buildTextPath()], function(Baseview, Html) {
    "use strict";
    var vm,vData,vMethods,view,
        debug = true;
    vData = {
        toastMsg: '',
        animationList: {
            anicollection:{
                fading_entrances   : ['fadeIn','fadeInDown','fadeInDownBig','fadeInLeft','fadeInLeftBig','fadeInRight','fadeInRightBig','fadeInUp','fadeInUpBig'],
                fading_exits       : ['fadeOut','fadeOutDown','fadeOutDownBig','fadeOutLeft','fadeOutLeftBig','fadeOutRight','fadeOutRightBig','fadeOutUp','fadeOutUpBig'],
                attention_seekers  : ['bounce','flash','pulse','rubberBand','shake','swing','tada','wobble'],
                bouncing_entrances : ['bounceIn','bounceInDown','bounceInLeft','bounceInRight','bounceInUp'],
                bouncing_exits     : ['bounceOut','bounceOutDown','bounceOutLeft','bounceOutRight','bounceOutUp'],
                rotating           : ['rotate','rotateDownLeft','rotateDownRight','rotateUpLeft','rotateUpRight'],
                rotating_entrances : ['rotateIn','rotateInDownLeft','rotateInDownRight','rotateInUpLeft','rotateInUpRight'],
                rotating_exits     : ['rotateOut','rotateOutDownLeft','rotateOutDownRight','rotateOutUpLeft','rotateOutUpRight'],
                zooming_entrances  : ['zoomIn','zoomInDown','zoomInLeft','zoomInRight','zoomInUp'],
                zooming_exits      : ['zoomOut','zoomOutDown','zoomOutLeft','zoomOutRight','zoomOutUp'],
                flippers           : ['flip','flipInX','flipInY','flipOutX','flipOutY'],
                sliding_entrances  : ['slideInDown','slideInLeft','slideInRight','slideInUp'],
                sliding_exits      : ['slideOutDown','slideOutLeft','slideOutRight','slideOutUp'],
                specials           : ['hinge','rollIn','rollOut'],
                lightspeed         : ['lightSpeedIn','lightSpeedOut'],
            },
            magic:{
                Perspective        : ['perspectiveDown','perspectiveUp','perspectiveLeft','perspectiveRight','perspectiveDownRetourn','perspectiveUpRetourn','perspectiveLeftRetourn','perspectiveRightRetourn'],
                Static_Effects     : ['openDownLeft','openDownRight','openUpLeft','openUpRight','openDownLeftRetourn','openDownRightRetourn','openUpLeftRetourn','openUpRightRetourn'],
                Slide              : ['slideDown','slideUp','slideLeft','slideRight','slideDownRetourn','slideUpRetourn','slideLeftRetourn','slideRightRetourn'],
                On_the_Space       : ['spaceOutUp','spaceOutRight','spaceOutDown','spaceOutLeft','spaceInUp','spaceInRight','spaceInDown','spaceInLeft'],
                Tin                : ['tinRightOut','tinLeftOut','tinUpOut','tinDownOut','tinRightIn','tinLeftIn','tinUpIn','tinDownIn'],
                Static_Effects_Out : ['openDownLeftOut','openDownRightOut','openUpLeftOut','openUpRightOut'],
                Math_z             : ['swashOut','swashIn','foolishOut','foolishIn','holeOut'],
                Rotate             : ['rotateDown','rotateUp','rotateLeft','rotateRight'],
                Magic_Effects      : ['magic','twisterInDown','twisterInUp','swap'],
                Bling              : ['puffIn','puffOut','vanishIn','vanishOut'],
                Bomb               : ['bombRightOut','bombLeftOut'],
                Boing              : ['boingInUp','boingOutDown'],
            }
        }
    }
    vMethods = {
        doAnimation: function(v,e){
            e.srcElement.className = (v + ' animated');
            setTimeout(function(){
                e.srcElement.className = '';
            }, 1000)
        },
        showPop:function(v){
            this.toastMsg = v;
            var input = document.createElement('input');
            input.type = 'text';
            input.value = this.toastMsg;
            document.body.appendChild(input);
            input.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? '复制成功' : '复制失败';
                input.remove();
                App.UI.showToast(msg,1)
            } catch (err) {
                console.log('Oops, unable to copy');
            }
        }
    };
    view = Baseview.extend({
        render: function() {
            this.$el.html(Html);
        },
        onCreate: function() {
            var _this = this;
            _this.render();
            vm = new Vue({
                el: "#"+_this.$el[0].id,
                data: vData,
                methods: vMethods
            });
            if(debug) window.vm = vm;
        },
        onShow: function() {
        },
        onHide: function() {
        }
    });
    return view;
});
