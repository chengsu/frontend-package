// 不定大小图片在固定大小容器中缩放居中
(function($){
    $.fn.imgresize=function(){
        return this.each(function(){
            if(this.imgresized)return;
            this.imgresized=true;
            var that=this,
                p=that.parentNode,
                pw=p.clientWidth,
                ph=p.clientHeight,
                w,h,temp=0,img;

            if(that.complete){
                // 图片已从缓存中加载
                _imageresize();
            }else{
                // 图片等待加载
                $(that).on('load',function(){
                    _imageresize();
                });
            }

            function _imageresize(){
                if(that.naturalWidth){
                    // 现代浏览器
                    w=that.naturalWidth;
                    h=that.naturalHeight;
                    resize();
                }else{
                    // IE6-8
                    img = new Image();
                    img.onload = function() {
                        w=img.width;
                        h=img.height;
                        resize();
                        img=null;
                    };
                    img.src = that.src;
                }
            }

            function resize(){
                if(pw/w*h<ph){
                    // 高度拉满，宽度溢出隐藏
                    that.style.height=ph+'px';
                    temp=ph/h*w;
                    that.style.width=temp+'px';
                    that.style.marginLeft=-(temp-pw)/2+'px';
                }else{
                    // 宽度拉满，高度溢出隐藏
                    that.style.width=pw+'px';
                    temp=pw/w*h;
                    that.style.height=temp+'px';
                    that.style.marginTop=-(temp-ph)/2+'px';
                }
            }
        });
    };
})(jQuery);

// 使用方式
$(function(){
    $('.jsImgResize').imgresize();
});