var gulp = require('gulp'),
    ugjs = require('gulp-uglify'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    csso = require('gulp-csso'),
    less = require('gulp-less'),
    gutil = require('gulp-util');

var changed = require('./gulp/gulp-changed/');

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix= new LessPluginAutoPrefix();

var srcPath = './src/';
var distPath = './public/';

var revOpt = {};
var changedOpt = {};
if(gutil.env.type == 'all'){
    changedOpt = {forceAll:true};
}else{
    revOpt = {merge:true};
}

//1.img
gulp.task('img', function() {
    return gulp.src([
            srcPath + 'img/**/*.@(jpg|png|gif)',
            '!' + srcPath + 'img/**/_*.@(jpg|png|gif)'
        ])
        .pipe(changed(changedOpt))
        .pipe(rev())
        .pipe(gulp.dest(distPath + 'img'))
        .pipe(rev.manifest(revOpt))
        .pipe(gulp.dest(distPath + 'img'));
});

//2.css
gulp.task('css', ['img'], function() {
    var manifest = gulp.src(distPath + "img/rev-manifest.json");
    return gulp.src([
            srcPath + 'css/**/*.css',
            '!' + srcPath + 'css/**/_*.css'
        ])
        .pipe(changed(changedOpt))
        .pipe(csso())
        .pipe(revReplace({manifest: manifest}))
        .pipe(rev())
        .pipe(gulp.dest(distPath + 'css'))
        .pipe(rev.manifest(revOpt))
        .pipe(gulp.dest(distPath + 'css'));
});

gulp.task('test',function(){
    gulp.src([
            srcPath + 'css/**/*.css',
            '!' + srcPath + 'css/**/_*.css'
        ])
        .pipe(changed(changedOpt))
        .pipe(gulp.dest('dist/css'));
});

//2.less
gulp.task('less', ['img'], function() {
    var manifest = gulp.src(distPath + "img/rev-manifest.json");
    return gulp.src([
            srcPath + 'css/**/*.less',
            '!' + srcPath + 'css/**/_*.less'
        ])
        .pipe(changed(changedOpt))
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(csso())
        .pipe(revReplace({manifest: manifest}))
        .pipe(rev())
        .pipe(gulp.dest(distPath + 'css'))
        .pipe(rev.manifest('rev-less-manifest.json'))
        .pipe(gulp.dest(distPath + 'css'));
});

//3.js
gulp.task('js', ['img','css','less'], function() {
    var manifest = gulp.src([
        distPath + "img/rev-manifest.json",
        distPath + "css/rev-manifest.json",
        distPath + "css/rev-less-manifest.json"
    ]);
    return gulp.src([
            srcPath + 'js/**/*.js',
            '!' + srcPath + 'js/**/_*.js'
        ])
        .pipe(changed(changedOpt))
        .pipe(ugjs({
            preserveComments:'license'
        }))
        .pipe(revReplace({manifest: manifest}))
        .pipe(rev())
        .pipe(gulp.dest(distPath + 'js'))
        .pipe(rev.manifest(revOpt))
        .pipe(gulp.dest(distPath + 'js'));
});

// 4.views
gulp.task('view', ['img','css','less','js'], function() {
    var manifest = gulp.src([
        distPath + "img/rev-manifest.json",
        distPath + "css/rev-manifest.json",
        distPath + "css/rev-less-manifest.json",
        distPath + "js/rev-manifest.json"
    ]);
    gulp.src([
            srcPath + 'view/**',
            '!' + srcPath + 'view/**/_*'
        ])
        .pipe(changed(changedOpt))
        .pipe(revReplace({
            manifest:manifest,
            replaceInExtensions:['.js', '.css', '.html', '.ejs', '.njk']
        }))
        .pipe(gulp.dest(distPath + 'view'));
});

// watch
gulp.task('watch', function(){
    var watcher = gulp.watch([
        srcPath + 'img/**/*.@(jpg|png|gif)',
        srcPath + 'css/**/*.css',
        srcPath + 'css/**/*.less',
        srcPath + 'js/**/*.js',
        srcPath + 'view/**'
    ],['view']);
});

gulp.task('default',[]);
gulp.task('build',['view']);
gulp.task('dev',['watch']);