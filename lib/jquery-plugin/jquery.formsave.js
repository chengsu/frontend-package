!function($){
    $.fn.formsave=function(option){
        // 如果不支持 localStrage ，则什么也不做
        if(!window.localStorage || !window.JSON){
            return {
                data      : {},
                fnShowTip : function(){},
                hideTip   : function(){},
                save      : function(){},
                restore   : function(){},
                bind      : function(){},
                unbind    : function(){}
            };
        }else{
            var ls=localStorage,
                storage={};
            option=$.extend({},$.fn.formsave.defaults,option);

            var self=this[0];
            var $self=$(self);
            var key='formdata'+option.customKeySuffix;
            var target=':text,:checkbox,:radio,select,textarea';
            var data=JSON.parse(ls.getItem(key)||'{}');

            var $tipStyle='<style>.m-formdata{position: fixed;z-index: 1000;text-align: center;width: 100%;top: -50px;left: 0;}.m-formdata p{display: inline-block;border: 1px #ddd solid;padding: 10px;background: #f1f1f1;}.m-formdata a{margin: 0 10px;color:#196baf;cursor: pointer;}.m-formdata a:hover{color:#f00;}</style>';
            var $tip=$('<div class="m-formdata"><p>是否恢复之前填写的表单内容？<a href="javascript:void(0);" id="jsFormdataYes">恢复</a><a href="javascript:void(0);" id="jsFormdataNo">取消</a></p></div>');
            var showTip=false;
            var tipTimeout=null;
            var $body=$(document.body);

            function getWholeKeyName(ele){
                if(ele.type=='radio'){
                    return $(ele).attr('name') || '';
                }else if(ele.type=='checkbox' && ele.value){
                    return $(ele).attr('name') + '_' + ele.value;
                }else{
                    var name = $(ele).attr('name');
                    return name + '_' + $('[name="' + name + '"]').index(ele) || '';
                }
            }

            function isIncluded(ele){
                return $.inArray(ele, option.includeFields) >= 0 ||
                        !(
                            (option.excludeNames.length && $.inArray(ele.name,option.excludeNames) >= 0) ||
                            (option.excludeFields && option.excludeFields.index(ele) >= 0) ||
                            (option.excludeType.length && $.inArray(ele.type,option.excludeType) >= 0) ||
                            $(ele).is(':disabled') || $(ele).is('[readonly]')
                        );
            }

            function storeValue(ele){
                if(!ele)
                    return;
                var name=$(ele).data('name')||getWholeKeyName(ele);
                if(name){
                    if(ele.type=='checkbox'){
                        data[name]=ele.checked;
                    }else{
                        data[name]=ele.value;
                    }
                    data['_time']=(new Date).getTime();
                    try{
                        ls.setItem(key,JSON.stringify(data));
                    }catch(e){
                        ls.clear();
                        ls.setItem(key,JSON.stringify(data));
                    }
                }
            }

            function restoreValue(ele){
                if(!ele)
                    return;
                var val=data[$(ele).data('name')||getWholeKeyName(ele)];
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
                option.beforeRestore(storage);
                $self.find(target).each(function(){
                    isIncluded(this) && restoreValue(this);
                });
                option.afterRestore(storage);
            }

            function clearObsoleteData(){
                var i,len,key,data,removeArr=[];
                for(i=0,len=ls.length;i<len;i++){
                    key=ls.key(i);
                    if(/^formdata/.test(key)){
                        data=JSON.parse(ls.getItem(key));
                        if(!data['_time'] || (new Date).getTime()-parseInt(data['_time']) > option.timeout){
                            removeArr.push(key);
                        }
                    }
                }
                for(i=0,len=removeArr.length;i<len;i++){
                    ls.removeItem(removeArr[i]);
                }
                ls.removeItem('_sjyz');
            }

            function fnShowTip(){
                $tip.animate({top:0},500);
                clearTimeout(tipTimeout);
                tipTimeout=setTimeout(function(){
                    $tip.animate({top:-50},500);
                },20000);
            }

            function hideTip(){
                showTip=false;
                clearTimeout(tipTimeout);
                $tip.animate({top:-50},500);
            }

            function init(){
                clearObsoleteData();
                showTip=!!ls.getItem(key);

                $body.append($tipStyle);
                $body.append($tip);

                if(showTip && option.autoShowTip){
                    fnShowTip();
                }

                $body.on('click','#jsFormdataYes',function(){
                    restoreAll();
                    hideTip();
                });

                $body.on('click','#jsFormdataNo',hideTip);

                if(option.autoRelease){
                    $self.on('submit reset',clearAll);
                }

                $self.on('change keyup blur',target,function(){
                    isIncluded(this) && storeValue(this);
                });

                if(option.autoRestore){
                    restoreAll();
                }
            }

            init();

            storage.data = data;
            storage.fnShowTip = fnShowTip;
            storage.hideTip = hideTip;
            storage.save = storeValue;
            storage.restore = restoreValue;
            storage.bind = function(ele,name){
                if(!ele){
                    return;
                }
                if($.inArray(ele, option.includeFields) < 0){
                    option.includeFields.push(ele);
                    $(ele).data('name',name);
                }
            };
            storage.unbind = function(ele,name){
                if(!ele){
                    return;
                }
                var index = $.inArray(ele, option.includeFields);
                if(index >= 0){
                    option.includeFields.splice(index, 1);
                    $(ele).data('name','');
                }
            };

            return storage;
        }
    };

    $.fn.formsave.defaults={
        excludeFields  : null,
        excludeNames   : [],
        excludeType    : ['hidden','submit', 'file', 'reset'],
        includeFields  : [],
        customKeySuffix: location.pathname + location.search,
        timeout        : 12*3600*1000,
        autoRestore    : false,
        autoRelease    : false,
        autoShowTip    : true,
        beforeRestore  : function(storage){},
        afterRestore   : function(storage){}
    }
}(jQuery);