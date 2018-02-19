const browserSync = require('browser-sync').create(),
    nunjucksRender = require('gulp-nunjucks-render'),
    imageResize = require('gulp-image-resize'),    
    beautify = require('gulp-html-beautify'),
    sassLint = require('gulp-sass-lint'),
    imagemin = require('gulp-imagemin'),    
    sequence = require('run-sequence'),    
    inject = require('gulp-inject'),
    watch = require('gulp-watch'),
    data = require('gulp-data'),
    sass = require('gulp-sass'),
    gulp = require('gulp'),
    fs = require('fs');

gulp.task('default', function() {
   sequence('images', 'dependencies', 'js', 'images:thumbs', 'sass', 'html', 'html:inject', 'browserSync:watch', 'browserSync:serve');   
})

// BROWSERSYNC / SERVE / WATCH / RELOAD

gulp.task('browserSync:watch', function() {
    watch(['dev/pages/**/*.njk','dev/layout/**/*.njk'], function() { sequence('html', 'html:inject', 'browserSync:reload') });
    watch('dev/assets/sass/**/*.scss', function() { sequence('sass', 'browserSync:reload') });
    watch('dev/assets/images/**/*.*', function() { sequence('images', 'browserSync:reload') });
    watch('dev/assets/js/**/*.js', function() { sequence('js', 'browserSync:reload') });
});

gulp.task('browserSync:serve', function () {
    browserSync.init({
        server: {
            baseDir: './prod'
        }
    });
});

gulp.task('browserSync:reload', function() {
    browserSync.reload();
})

// DEPEDENCIES

gulp.task('dependencies', function() {
    gulp.src(['./dev/assets/bootstrap/**/*.*','./dev/assets/jquery/**/*.*'], {base: './dev'})
    .pipe(gulp.dest('./prod'))
})

// SASS

gulp.task('sass', function() {
    return gulp.src('./dev/assets/sass/stylesheet.scss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./prod/assets/css'))
})

// JS

gulp.task('js', function() {
    return gulp.src('./dev/assets/js/**/*.js')    
    .pipe(gulp.dest('./prod/assets/js'))
})

// IMAGES / THUMBNAILS

gulp.task('images:thumbs', function(){
    return gulp.src('./dev/assets/images/**/*.*')
    .pipe(imageResize({
        width : 300,
        height : 300,
        crop : true,
        upscale : false
    }))
    .pipe(gulp.dest('./prod/assets/images/thumbs'))
})

gulp.task('images', function(){
    return gulp.src('./dev/assets/images/**/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest('./prod/assets/images'))
})

// HTML / INJECT

gulp.task('html', function() {    
    return gulp.src('dev/pages/**/*.njk')
    .pipe(data(function() { return JSON.parse(fs.readFileSync('./dev/assets/json/data.json')); }))
    .pipe(nunjucksRender({ path: 'dev/layout' }))
    .pipe(beautify())
    .pipe(gulp.dest('prod'));    
});

gulp.task('html:inject', function() {
    return gulp.src('./prod/**/*.html')
    .pipe(inject(gulp.src('./prod/assets/**/*.*{js,css}', {read: false}), {relative: true, removeTags: true}))
    .pipe(gulp.dest('./prod'))
})