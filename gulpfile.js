var gulp = require('gulp'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    watch = require('gulp-watch');
var src = 'scripts/';
gulp.task('scripts', function() {
    gulp.src([src + 'app.js', src + '/components/**/*.js', src + '/shared/**/*.js'])
        .pipe(ngAnnotate())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js', {newLine: ';'}))
        //.pipe(uglify())
        .pipe(sourcemaps.write())
        //.pipe(rename({
        //    extname: '.min.js'
        //}))
        .pipe(gulp.dest('dist'));
});
gulp.task('watch', ['scripts'], function () {
    gulp.watch([src + 'app.js', src + '/components/**/*.js', src + '/shared/**/*.js'], ['scripts']);
});
