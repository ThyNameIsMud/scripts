'use strict';

// Dependences
const gulp = require('gulp');

// Gulp Dependences
const less       = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS   = require('gulp-clean-css');


gulp.task('default', [ 'watch' ]);

gulp.task('less', () => {
    return gulp.src('./style.less')
                .pipe(sourcemaps.init())
                .pipe(less())
                .pipe(sourcemaps.write())
                .pipe(gulp.dest('.'));
});

gulp.task('css', () => {
    return gulp.src('./style.css')
                .pipe(cleanCSS({compatibility: 'ie8'}))
                .pipe(gulp.dest('.'));
});

gulp.task('watch', () => {
    gulp.watch(['./css/**/*.less'], ['less']);
    gulp.watch(['./*.css'], ['css']);
});
