/*
* 兼容ie8+
*/
!function($){
    $.fn.formsave=function(option){
        // 如果不支持 localStrage ，则什么也不做
        if(!localStorage || !JSON){
            return this;
        }else{
            var ls=localStorage;
            option=$.extend({},$.fn.formsave.defaults,option);

            return this.each(function(){
                var self=this;
                var $self=$(self);
                var key='formdata'+option.customKeySuffix;
                var target=':text,:checkbox,:radio,select,textarea';
                var data=JSON.parse(ls.getItem(key)||'{}');

                function getWholeKeyName(ele){
                    return $(ele).attr('name') || '';
                }

                function isIncluded(ele){
                    if((option.excludeNames.length && $.inArray(ele.name,option.excludeNames) >= 0) ||
                        (option.excludeFields && option.excludeFields.index(ele) >= 0) ||
                        $(ele).is(':disabled') || $(ele).is('[readonly]') ||
                        (option.excludeType.length && $.inArray(ele.type,option.excludeType) >= 0)){
                        return false;
                    }else{
                        return true;
                    }
                }

                function storeValue(ele){
                    var name=getWholeKeyName(ele);
                    if(name){
                        if(ele.type=='checkbox'){
                            data[name]=ele.checked;
                        }else{
                            data[name]=ele.value;
                        }
                        data._time=(new Date()).getTime();
                        try{
                            ls.setItem(key,JSON.stringify(data));
                        }catch(e){
                            ls.clear();
                            ls.setItem(key,JSON.stringify(data));
                        }
                    }
                }

                function restoreValue(ele){
                    var val=data[getWholeKeyName(ele)];
                    if(typeof val != 'undefined'){
                        if(ele.type=='radio'){
                            if(ele.value==val){
                                ele.checked=true;
                            }
                        }else if(ele.type=='checkbox'){
                            ele.checked = val;
                        }else{
                            ele.value=val;
                        }
                    }
                }

                function clearAll(){
                    data={};
                    ls.removeItem(key);
                }

                function restoreAll(){
                    $self.find(target).each(function(){
                        isIncluded(this) && restoreValue(this);
                    });
                }

                function clearObsoleteData(){
                    var i,len,key,data,removeArr=[];
                    for(i=0,len=ls.length;i<len;i++){
                        key=ls.key(i);
                        if(/^formdata/.test(key)){
                            data=JSON.parse(ls.getItem(key));
                            if(!data._time || (new Date()).getTime()-parseInt(data._time) > option.timeout){
                                removeArr.push(key);
                            }
                        }
                    }
                    for(i=0,len=removeArr.length;i<len;i++){
                        ls.removeItem(removeArr[i]);
                    }
                    ls.removeItem('_sjyz');
                }


                !function(){
                    var $tipStyle='<style>.m-formdata{position: fixed;z-index: 1000;text-align: center;width: 100%;top: -50px;left: 0;}.m-formdata p{display: inline-block;border: 1px #ddd solid;padding: 10px;background: #f1f1f1;}.m-formdata a{margin: 0 10px;color:#196baf;cursor: pointer;}.m-formdata a:hover{color:#f00;}</style>';
                    var $tip=$('<div class="m-formdata"><p>是否恢复之前填写的表单内容？<a href="javascript:void(0);" id="jsFormdataYes">恢复</a><a href="javascript:void(0);" id="jsFormdataNo">取消</a></p></div>');
                    var showTip=!!ls.getItem(key);
                    var tipTimeout=null;
                    var $body=$(document.body);

                    $body.append($tipStyle);

                    if(showTip){
                        $body.append($tip);
                        $tip.animate({top:0},500);
                        clearTimeout(tipTimeout);
                        tipTimeout=setTimeout(function(){
                            $tip.animate({top:-50},500);
                        },20000);
                    }

                    $body.on('click','#jsFormdataYes',function(){
                        restoreAll();
                        showTip=false;
                        clearTimeout(tipTimeout);
                        $tip.animate({top:-50},500);
                    });

                    $body.on('click','#jsFormdataNo',function(){
                        showTip=false;
                        clearTimeout(tipTimeout);
                        $tip.animate({top:-50},500);
                    });

                    if(option.autoRelease){
                        $self.on('submit reset',clearAll);
                    }

                    $self.on('change keyup',target,function(){
                        isIncluded(this) && storeValue(this);
                    });

                    clearObsoleteData();
                    if(option.autoRestore){
                        restoreAll();
                    }
                }();
            });
        }
    };

    $.fn.formsave.defaults={
        excludeFields: null,
        excludeNames: [],
        excludeType: [],
        customKeySuffix: "",
        timeout: 12*3600*1000,
        autoRestore: false,
        autoRelease: false,
        onSave: function(){},
        onBeforeRestore: function(){},
        onRestore: function(){},
        onRelease: function(){}
    };
}(jQuery);