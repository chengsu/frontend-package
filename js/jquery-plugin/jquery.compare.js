var moduleCompare = function($){
    var Exports = {};
    var dom = {
        template : {
            $body : $('' +
                '<div id="compareDiv">' +
                    '<h2>[<em class="compareNum">0</em>/4]对比栏</h2>' +
                    '<div class="close" title="关闭对比栏">×</div>' +
                    '<ul class="compareList"></ul>' +
                    '<a class="compareButton" target="_blank">对 比</a>' +
                    '<div class="d">清空对比栏</div>' +
                '</div>')
        },
        init:function(){
            dom.template.$body
                .hide()
                .appendTo(document.body)
                .find('.close')
                    .on('click', function(){
                        dom.template.$body.hide();
                    })
                .end().find('.compareButton')
                    .on('click', function(e){
                        if(state.list.length < 2){
                            alert(lang.msg.REQUIRE_MORE);
                            e.preventDefault();
                        }
                    })
                .end().find('.d')
                    .on('click', function(){
                        state.empty();
                    });
        },
        add:function(id, name, img){
            $(''+
                '<li>' +
                    '<a href="/product_item' + id + '-1" target="_blank" class="p">' + (img ? '<img src="' + img + '" alt="' + name + '">' : '暂无图片') + '</a>' +
                    '<span class="t"><a href="/product_item' + id + '-1" target="_blank">' + name + '</a></span>' +
                    '<span class="close" id="compareItemCloseId' + id + '" title="删除此项" onclick="removeCompare(this,' + id + ')">×</span>' +
                '</li>'
            ).appendTo(dom.template.$list)
                .hover(function(){
                    $(this).find('.close').css('visibility', 'visible');
                },function(){
                    $(this).find('.close').css('visibility', 'hidden');
                });
        },
        update:function(changeArr){
            var t = dom.template;
            var list = state.list;
            var href = '/compare/' + state.type;
            var i,len;
            
            dom.show();
            t.$list.empty();
            for(i = 0, len = list.length; i < len; i++){
                href += '_' + list[i].id;
                dom.add(list[i].id, list[i].name, list[i].img);
            }           
            
            t.$num.html(list.length);
            t.$button.attr('href', state.host + href);
            
            if(changeArr && changeArr.length){
                for(i = 0,len = changeArr.length; i < len; i++){
                    if(changeArr[i].obj){
                        changeArr[i].obj.innerHTML = changeArr[i].obj.innerHTML == lang.label.add ? lang.label.cancel : lang.label.add;
                    }
                }
            }
        },
        show:function(){
            this.template.$body.show();
        }
    };
    dom.template.$num = dom.template.$body.find('.compareNum');
    dom.template.$button = dom.template.$body.find('.compareButton');
    dom.template.$list = dom.template.$body.find('.compareList');
    
    var store = {
        _cookie : {
            get : function(name) {
                var cookieStart = document.cookie.indexOf(name);
                var cookieEnd = document.cookie.indexOf(";", cookieStart);
                return cookieStart == -1 ? '' : unescape(document.cookie.substring(cookieStart + name.length + 1, (cookieEnd > cookieStart ? cookieEnd : document.cookie.length)));
            },
            set : function(name, value, seconds, path, domain, secure) {
                var expires = new Date();
                expires.setTime(expires.getTime() + seconds);
                document.cookie = escape(name) + '=' + escape(value)
                    + (expires ? '; expires=' + expires.toGMTString() : '')
                    + (path ? '; path=' + path : '/')
                    + (domain ? '; domain=' + domain : '')
                    + (secure ? '; secure' : '');
            }
        },
        use : function(store){
            if(!store || !store[store]){
                store = '_cookie';
            }
            store.get = store[store].get;
            store.set = store[store].set;
        },
        save:function(){
            var list = state.list,
                i = 0,
                len = list.length,
                value = '';
            
            for(i = 0, len = list.length; i < len; i++){
                value += list[i].id + ',' + list[i].name + ',' + list[i].img + ',' + state.type + ';';
            }
            store.set('pcompare' + state.type, value.slice(0, -1));
        }
    };
    store.get = store._cookie.get;
    store.set = store._cookie.set;
    
    var state = {
        type : '',
        host : '',
        list:[],
        limit: 4,
        add:function(obj){
            state.list.push(obj);
            dom.update([obj]);
            store.save();
        },
        remove:function(id){
            var index = state.indexOf(id),
                change;
            if(index >= 0){
                change = state.list.splice(index, 1);
                dom.update(change);
                store.save();
            }
        },
        empty:function(){
            var change = state.list.splice(0,state.limit);
            dom.update(change);
            store.save();
        },
        init:function(type){
            var value,i,len,temp;
            state.type = window.compareType || type || '';
            if(state.type){
                value = store.get('pcompare' + state.type);
                if(value){
                    value = value.split(';');
                    for(i = 0, len = value.length; i < len; i++){
                        temp = value[i].split(',');
                        state.add({
                            id:parseInt(temp[0]),
                            name:temp[1],
                            img:temp[2],
                            obj:document.getElementById('compareItemId' + temp[0])
                        });
                    }
                }
            }
            dom.init();
            if(state.list.length > 0){
                dom.show();
            }
        },
        indexOf:function(item){
            for(var i = 0, len = state.list.length; i < len; i++) {
                if(state.list[i].id == item){
                    return i;
                }
            }
            return -1;
        }
    };
    
    var lang = {
        label : {
            add : '加入对比＋',
            cancel : '取消对比-'
        },
        msg : {
            OVER_THE_LIMIT : '抱歉，您只能选择 ' + state.limit + ' 款对比产品！',
            EXIST_IN_LIST : '比较列表中已经存在该项目!',
            REQUIRE_MORE : '需要两个或两个以上的项目才能进行比较!',
            REQUIRE_SAME_TYPE : '当前选择产品与对比栏中的产品不属于同类产品！\n请选择同类产品进行比较或清空当前对比栏以重新选择！'
        }
    };
    
    Exports.add = function(id, name, img, type, obj, labelAdd, labelCancel){
        state.type = state.type || type;
        lang.label.add = labelAdd || lang.label.add;
        lang.label.cancel = labelCancel || lang.label.cancel;
        
        if(obj.innerHTML == labelCancel){
            state.remove(id);
            return;
        }
        
        if(type !== state.type && state.list.length > 0){
            alert(lang.msg.REQUIRE_SAME_TYPE);
            return false;
        }
        else{
            state.type = type;
        }
        if(state.list.length >= state.limit){
            alert(lang.msg.OVER_THE_LIMIT);
            return false;
        }
        if(state.indexOf(id) >= 0){
            alert(lang.msg.EXIST_IN_LIST);
            return false;
        }
        
        state.add({
            id:id,
            name:name,
            img:img,
            obj:obj
        });
    };
    
    Exports.remove = function(obj, id){
        state.remove(id);
    };
    
    Exports.init = function(type, labelAdd, labelCancel, host){
        lang.label.add =  labelAdd || lang.label.add;
        lang.label.cancel = labelCancel || lang.label.cancel;
        state.init(type);
    };
    
    return Exports;
}(jQuery);

var addCompare = moduleCompare.add;
var compareInit = moduleCompare.init;
var removeCompare = moduleCompare.remove;