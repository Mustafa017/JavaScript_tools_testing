/* eslint-env node */
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const jasmineBrowser = require('gulp-jasmine-browser');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
// const uglify = require('gulp-uglify-es').default;
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

// incase you are working on a computer that is not configured with eslint,
// you can run eslint in your build.
const eslint = require('gulp-eslint');

gulp.task('lint', () => {
	return gulp.src(['js/*.js'])
		// eslint() attaches the lint output to the "eslint" property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError last.
		.pipe(eslint.failAfterError());
});

gulp.task('tests', function() {
	gulp.src('tests/spec/extraSpec.js')
	// This allows Jasmine tests to be run headlessly in the terminal itself.
	// .pipe(jasmineBrowser.specRunner({console: true}))
	// .pipe(jasmineBrowser.headless({driver: 'chrome'}));

		.pipe(jasmineBrowser.specRunner())
		.pipe(jasmineBrowser.server({port: 3001}));
});

gulp.task('styles', function() {
	gulp.src('sass/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
		}))
		.pipe(browserSync.stream());
});

gulp.task('copy-html', function() {
	gulp.src('./index.html')
		.pipe(gulp.dest('dist/'));
});

gulp.task('copy-images', function() {
	gulp.src('img/*')
		.pipe(imagemin({
			progressive: true,
			use: [imageminPngquant()],
		}))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('scripts', function() {
	gulp.src('js/**/*.js')
		.pipe(babel())
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js/'));
});

gulp.task('scripts-dist', function() {
	gulp.src('js/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('all.js'))
		// .pipe(rename('uglify.min.js')) used with gulp-uglify-es. check difference
		// with minify.min.js which uses gulp-babel
		.pipe(rename('minify.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js/'));
});

gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'lint',
	'scripts-dist',
]);

gulp.task('default', ['styles', 'lint', 'copy-html', 'copy-images'],
	function() {
		// console.log('gulp works');
		gulp.watch('sass/**/*.scss', ['styles']);
		gulp.watch('js/**/*.js', ['lint']);
		gulp.watch('./build/index.html').on('change', browserSync.reload);

		browserSync.init({
			server: 'dist/',
		});
	});
