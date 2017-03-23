var iconv = require('iconv-lite');
var hasha = require('hasha');
var fs = require('fs');
var path = require('path');

module.exports = function(grunt){
    var config = {};
    
    if(!grunt.file.exists('meta.json')){
        grunt.file.write('meta.json','');
    }
    
    var meta = grunt.file.read('meta.json');
    
    meta = meta || '{}';
    meta = JSON.parse(meta);

    config.iconv = {
        'g2u':{
            options:{
                method : 'g2u'                
            },
            files : [{
                expand : true,
                cwd : 'src/js/',
                src : ['**/*.js'],
                dest : 'static/js/'
            },{
                expand : true,
                cwd : 'src/css/',
                src : ['**/*.css'],
                dest : 'static/css/'
            },{
                expand : true,
                cwd : 'src/default/',
                src : ['**'],
                filter : 'isFile',
                dest : 'template/default/'
            }]
        },
        'u2g':{
            options:{

            },
            files : [{
                expand : true,
                cwd : 'static/js/',
                src : ['**/*.js'],
                dest : 'static/js/'
            },{
                expand : true,
                cwd : 'static/css/',
                src : ['**/*.css'],
                dest : 'static/css/'
            },{
                expand : true,
                cwd : 'template/default/',
                src : ['**/*.tpl','**/*.tpl.php'],
                filter : 'isFile',
                dest : 'template/default/'
            }]
        }
    };
    
    config.copy = {
        'build':{
            options:{

            },
            files : [{
                expand : true,
                cwd : 'src/image/',
                src : ['**'],
                dest : 'static/image/'
            },{
                expand : true,
                cwd : 'src/webuploader/',
                src : ['**'],
                dest : 'static/webuploader/'
            },{
                expand : true,
                cwd : 'src/js/',
                src : ['*.swf'],
                dest : 'static/js/'
            }]
        }
    };
    
    config.clean = ['dist/**'];
    
    config.uglify = {
        'build':{
            options:{
                
            },
            files : [{
                expand : true,
                cwd : 'static/js/',
                src : ['**/*.js'],
                dest : 'static/js/'
            }]
        }
    };

    config.cssmin = {
        'build': {
            options:{

            },
            files : [{
                expand : true,
                cwd : 'static/css/',
                src : ['**/*.css'],
                dest : 'static/css/'
            }]
        }
    };
    
    config.less = {
        'build' : {
            options:{
                plugins: [
                    new (require('less-plugin-autoprefix'))({browsers: ["chrome >= 31","ie >= 6","firefox >= 18","opera >= 10","safari >= 5"]})
                ]
            },
            files : [{
                expand : true,
                cwd : 'src/css/',
                src : ['**/*.less'],
                dest : 'static/css/',
                ext : '.css'
            }]
        }
    };
    
    config.md5 = {
        'build':{
            options:{

            },
            files : [{
                expand : true,
                cwd : 'static/js/',
                src : ['**/*.js']
            },{
                expand : true,
                cwd : 'static/image/',
                src : ['**/*.{jpg,png,gif}']
            }]
        },
        'css':{
            options:{

            },
            files : [{
                expand : true,
                cwd : 'static/css/',
                src : ['**/*.css']
            }]
        }
    };
    
    config.usemd5 = {
        'build':{
            files : [{
                expand : true,
                cwd : 'template/default/',
                src : ['**/*.{php,tpl}'],
                dest: 'template/default/'
            }]
        },
        'css':{
            files : [{
                expand : true,
                cwd : 'static/css/',
                src : ['**/*.css'],
                dest: 'static/css/'
            }]
        }
    };
    
    config.watch = {
        files:['src/**'],
        tasks:['copy','iconv:g2u','less','iconv:u2g'],
        options:{
            atBegin:true,
            livereload:true
        }
    };

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerMultiTask('iconv','iconv task',function(){
        var option = this.options();
        if(option.method == 'g2u'){
            this.files.forEach(function(f){
                f.src.forEach(function(file){
                    var content = grunt.file.read(file,{encoding:'gbk'});
                    var re = /[\u0000-\u00ff\u4e00-\u9fa5\u2014\u2018\u2019\u201c\u201d\u2026\u25bc\u2190\u2191\u2192\u2193\u221a\u2264\u2265\u25a0\u25b2\u25cf\u3000\u3001\u3002\u3008\u3009\u300a\u300b\u300c\u300d\u300e\u300f\u3010\u3011\u3014\u3015\ufe43\ufe44\ufe4f\uff01\uff08\uff09\uff0b\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]*/;
                    var result = re.exec(content);
                    if(content.length !== result[0].length){
                        grunt.log.error('file is not gbk: ' + file);
                        grunt.log.error('content length :',content.length);
                        grunt.log.error('error position :',result[0].length);
                        grunt.log.error(result[0].slice(-250,-1),'$$$');
                    }
                    else{
                        grunt.file.write(f.dest,content,{encoding:'utf8'});
                    }
                });
            });
        }
        else{
            this.files.forEach(function(f){
                f.src.forEach(function(file){
                    var content = grunt.file.read(file,{encoding:'utf8'});
                    grunt.file.write(f.dest,content,{encoding:'gbk'});
                });
            });
        }
    });
    
    grunt.registerMultiTask('usemd5','usemd5 task',function(){
        this.files.forEach(function(f){
            f.src.forEach(function(file){
                var content = '';
                if(/\.css$/.test(file)){
                    content = grunt.file.read(file);
                    content = content.replace(/微软雅黑|黑体|宋体/g,function(match){
                        var font = {
                            '微软雅黑' : 'Microsoft YaHei',
                            '黑体' : 'SimHei',
                            '宋体' : 'SimSun'
                        };
                        return font[match] || match;
                    }).replace(/url\(([^\)]+)\)/g,function(match,p1){
                        var resouceName = path.resolve(path.dirname(file),p1)
                            .replace(process.cwd(),'')
                            .replace(/\\/g,'/')
                            .slice(1);
                        grunt.log.writeln(match);
                        if(meta[resouceName]){
                            meta[resouceName].refCount += 1;
                        }
                        return meta[resouceName] ? 'url(' + p1 + '?v=' + meta[resouceName].mtime + ')' : match;
                    });
                    grunt.file.write(f.dest,content);
                    grunt.log.ok(file);
                }
                else if(/\.(tpl|php)$/.test(file)){
                    content = grunt.file.read(file);
                    content = content.replace(/href="([^"]+\.css)"|src="([^"]+\.(js|png|jpg|gif))"|url\(([^\)]+)\)/g,function(match,p1,p2,p3,p4){
                        var resouceName = '';
                        grunt.log.writeln(match);
                        if(p1){
                            resouceName = p1.replace(/^\{\$sc\.staticUrl\}|\/sd\/|\/static\//,'static/');
                            if(meta[resouceName]){
                                meta[resouceName].refCount += 1;
                            }
                            return meta[resouceName] ? 'href="' + p1 + '?v=' + meta[resouceName].mtime + '"' : match;
                        }
                        else if(p2){
                            resouceName = p2.replace(/^\{\$sc\.staticUrl\}|\/sd\/|\/static\//,'static/');
                            if(meta[resouceName]){
                                meta[resouceName].refCount += 1;
                            }
                            return meta[resouceName] ? 'src="' + p2 + '?v=' + meta[resouceName].mtime + '"' : match;
                        }
                        else if(p4){
                            resouceName = p4.replace(/^\{\$sc\.staticUrl\}|\/sd\/|\/static\//,'static/');
                            if(meta[resouceName]){
                                meta[resouceName].refCount += 1;
                            }
                            return meta[resouceName] ? 'url(' + p4 + '?v=' + meta[resouceName].mtime + ')' : match;
                        }
                        else{
                            return match;
                        }                        
                    });
                    grunt.file.write(f.dest,content);
                    grunt.log.ok(file);
                }
            });
        });
        grunt.file.write('meta.json', JSON.stringify(meta));
    });
    
    grunt.registerMultiTask('md5','md5 task',function(){
        this.files.forEach(function(f){
            f.src.forEach(function(file){
                var stat = fs.statSync(file);
                var fileStat = meta[file] || {};
                var mtime = new Date(stat.mtime).getTime();
                var md5 = '';
                if(mtime != fileStat.mtime){
                    md5 = hasha.fromFileSync(file, {algorithm:'md5'}).slice(-7);
                    if(md5 != fileStat.md5){
                        fileStat.mtime = mtime;
                        fileStat.md5 = md5;
                    }
                }
                fileStat.refCount = 0;
                meta[file] = fileStat;
            });
        });
        grunt.file.write('meta.json', JSON.stringify(meta));
    });
    
    grunt.registerTask('default',['build']);
    grunt.registerTask('build',['clean','iconv:g2u','copy','uglify','cssmin','md5:build','usemd5:css','md5:css','usemd5:build','iconv:u2g']);
    grunt.registerTask('dev',['watch']);
    grunt.registerTask('test',['clean','iconv:g2u','copy']);
};