const gulp = require('gulp');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const closureCompiler = require('google-closure-compiler').gulp();
const watch = require('gulp-watch');

const outputWrapper = `(function(global){%output%\nconst erste = this.$jscompDefaultExport$$module$$src$index;if(typeof define=='function'&&define.amd){define(function(){return erste})}else if(typeof module=='object'&&typeof exports=='object'){module.exports=erste}else{window.erste=erste}}).call(null, {});`;

function compile() {
    const options = {
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        externs: './dist/externs.js',
        warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT7',
        assume_function_wrapper: true,
        language_out: 'ECMASCRIPT5',
        summary_detail_level: 3,
        new_type_inf: true,
        dependency_mode: 'STRICT',
        process_common_js_modules: true,
        jscomp_error: '*',
        jscomp_off: ['lintChecks'],
        hide_warnings_for: '[synthetic',
        entry_point: '/src/index',
        generate_exports: true,
        export_local_property_definitions: true,
        output_wrapper: outputWrapper,
        js_output_file: 'erste.js'
    };

    return gulp.src(['./src/lib/goog.js', './src/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(closureCompiler(options))
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('dist'));
}

gulp.task('clean', () => del(['dist/*', '!dist/externs.js']));
gulp.task('compile', compile);

gulp.task('watch', () => watch('./src/**/*.js', compile));

gulp.task('default', ['clean', 'compile']);
