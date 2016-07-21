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
                var data={};

                function getWholeKeyName(el){
                    return el.attr('name') || '';
                }

                function isIncluded(ele){
                    if((option.excludeType.length && $.inArray(ele.type,option.excludeType) >= 0) ||
                        (option.excludeNames.length && $.inArray(ele.name,option.excludeNames) >= 0) ||
                        (option.excludeFields && option.excludeFields.index(ele) >= 0)){
                        return false;
                    }else{
                        return true;
                    }
                }

                function storeValue(ele){
                    if(isIncluded(ele)){
                        var name=getWholeKeyName($(ele));
                        if(name){
                            if(ele.type=='checkbox'){
                                data[name]=ele.checked;
                            }else{
                                data[name]=ele.value;
                            }
                            ls.setItem(option.customKeySuffix,JSON.stringify(data));
                        }
                    }
                }

                function restoreValue(ele){
                    var val=data[getWholeKeyName($(ele))];
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
                    }else{
                        storeValue(ele);
                    }
                }

                $self.on('change blur keyup','input,select,textarea',function(){
                    storeValue(this);
                });

                $(function(){
                    data=JSON.parse(ls.getItem(option.customKeySuffix)||'{}');
                    $self.find('input,select,textarea').each(function(){
                        restoreValue(this);
                    });
                });
            })
        }

    };

    $.fn.formsave.defaults={
        excludeFields: null,
        excludeNames:[],
        excludeType:[],
        customKeySuffix: "",
        locationBased: false,
        timeout: 0,
        autoRelease: true,
        onSave: function() {},
        onBeforeRestore: function() {},
        onRestore: function() {},
        onRelease: function() {}
    }
}(jQuery);