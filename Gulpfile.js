var gulp = require('gulp');
var del = require('del');
var path = require('path');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

function compileJs(options, cb) {
    var babel = require('babelify'),
        browserify = require('browserify'),
        buffer = require('vinyl-buffer'),
        closureCompile = require('./tasks/compile').closureCompile;

    options = options || {};

    var srcDir = './src/';
    var srcFilename = 'index.js';
    var destDir = './dest/';
    var destFilename = 'erste.js';

    var bundler = browserify(srcDir + srcFilename, { debug: true, paths: ['src/'] }).transform(babel);
    var activeBundleOperationCount = 0;

    function rebundle(cb) {
        activeBundleOperationCount++;
        bundler.bundle().on('error', function(err) {
            console.error(err);
            this.emit('end');
        }).pipe(lazybuild()).pipe(rename(destFilename)).pipe(lazywrite()).on('end', function() {
            activeBundleOperationCount--;
            if (activeBundleOperationCount == 0) {
                console.info('All current JS updates done.');
                cb && cb();
            }
        });
    }

    function minify(cb) {
        console.log('Minifying ' + srcFilename);
        closureCompile(srcDir + srcFilename, destDir, destFilename).then(function() {
            cb && cb();
        });
    }

    var lazybuild = lazypipe().pipe(source, srcFilename).pipe(buffer).pipe(sourcemaps.init.bind(sourcemaps));

    var lazywrite = lazypipe().pipe(gulp.dest.bind(gulp), destDir);

    if (options.closureCompile) {
        minify(cb);
    } else {
        rebundle(cb);
    }
}

gulp.task('compile-dev', function(cb) {
    compileJs({ watch: true }, cb);
});

gulp.task('compile-bundle', function(cb) {
    compileJs({ closureCompile: true }, cb);
});


gulp.task('default', function() {
    var closureCompiler = require('google-closure-compiler').gulp();

    var outputWrapper = `
(function(){\n%output%\n

if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function() {
        return erste;
    });
} else if (typeof exports === 'object') {
    // CommonJS
    exports.erste = erste;
}
else {
    // Browser global.
    window.erste = erste;
}
}).call(this);
`;

    return gulp.src(['./src/lib/goog.js', './src/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(closureCompiler({
            compilation_level: 'SIMPLE_OPTIMIZATIONS',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT7',
            assume_function_wrapper: true,
            language_out: 'ECMASCRIPT5',
            summary_detail_level: 3,
            new_type_inf: true,
            dependency_mode: 'STRICT',
            process_common_js_modules: true,
            formatting: ['PRETTY_PRINT'],
            jscomp_error: '*',
            jscomp_off: ['lintChecks'],
            hide_warnings_for: '[synthetic',
            entry_point: '/src/index',
            generate_exports: true,
            export_local_property_definitions: true,
            output_wrapper: outputWrapper,
            js_output_file: 'erste.min.js'
        }))
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('dist'));
});

gulp.task('bundle', function(callback) {
    runSequence('clean:before',
        ['compile-bundle'],
        callback);
});

gulp.task('bundle-prod', function(callback) {
    runSequence('clean:before',
        ['compile-bundle'],
        'concat',
        callback);
});

gulp.task('clean:before', function() {
    return del(['dist/*']);
});

