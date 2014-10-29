var gulp        = require('gulp'),
    bump        = require('gulp-bump'),
    concat      = require('gulp-concat'),
    filter      = require('gulp-filter'),
    git         = require('gulp-git'),
    rename      = require('gulp-rename'),
    tagVersion  = require('gulp-tag-version'),
    uglify      = require('gulp-uglify'),
    umd         = require('gulp-umd'),
    util        = require('gulp-util'),
    wrap        = require('gulp-wrap');


/**
 * @task
 *
 * Build
 */
gulp.task('build', function () {
  return gulp.src(['sloth.base.js', 'sloth.*-sloth.js'])
    .pipe(concat('sloth.js'))
    .pipe(wrap('"use strict";\n\r\n\r<%= contents %>'))
    .pipe(umd({
      exports: function() {
        return 'sloth';
      },
      namespace: function() {
        return 'Sloth';
      }
    }))
    .pipe(gulp.dest('dist'))
    .pipe(rename('sloth.module.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(rename('sloth.min.js'))
    .pipe(gulp.dest('dist'));
});


/**
 * @task
 *
 * Dev
 */
gulp.task('dev', function () {
  return gulp.src(['sloth.base.js', 'sloth.*-sloth.js'])
    .pipe(concat('sloth.js'))
    .pipe(wrap('"use strict";\n\r\n\r<%= contents %>'))
    .pipe(umd({
      exports: function() {
        return 'sloth';
      },
      namespace: function() {
        return 'Sloth';
      }
    }))
    .pipe(gulp.dest('test'));
});


/**
 * @task
 *
 * Release
 */
function release(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json', './bower.json'])
    // bump the version number in those files
    .pipe(bump({type: importance}))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    .pipe(git.commit('bumps package version'))
    // read only one file to get the version number
    .pipe(filter('package.json'))
    // tag it in the repository
    .pipe(tagVersion());
    //.pipe(git.push({ args: ' --tags' }), function(err){ err } );
}

gulp.task('patch', function() { return release('patch'); });
gulp.task('minor', function() { return release('minor'); });
gulp.task('major', function() { return release('major'); });


/**
 * @task
 *
 * DEFAULT
 */
gulp.task('default', ['dev'], function () {
  gulp.watch('*.js', ['dev']);
});
