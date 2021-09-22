let project_folder = 'dist';
let source_folder  = 'src';

// Pathes
let path = {

    // Compiled data
    build: {
        html:   project_folder + '/',
        css:    project_folder + '/css/',
        js:     project_folder + '/js/',
        img:    project_folder + '/img/',
        fonts:  project_folder + '/fonts/',
    },

    // Source data
    src: {
        html:  [source_folder + '/html/*.html', "!" + source_folder + '/html/_*.html'],
        css:    source_folder + '/scss/main.scss',
        js:     source_folder + '/js/main.js',
        img:    source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts:  source_folder + '/fonts/**/*.{woff,woff2}',
    },

    // Listener
    watch: {
        html:   source_folder + '/html/**/*.html',
        css:    source_folder + '/scss/**/*.scss',
        js:     source_folder + '/js/**/*.js',
        img:    source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    },

    clean: './' + project_folder + '/'
    
}

// Dependencies
let {src,dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    sassGlob =  require('gulp-sass-glob'),
    uglify = require('gulp-uglify-es').default;

function browserSync(params) {
    browsersync.init({
        watch: true,
        server: {
            baseDir: './' + project_folder + '/',
        },
        port: 3000,
        notify: false,
    })
}

// HTML combine
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

// CSS combine
function css() {
    return src(path.src.css)
        .pipe(
            sassGlob()
        )
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserlist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

// JS combine
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(uglify())
        .pipe(dest(path.build.js))
        /*.pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))*/
        .pipe(browsersync.stream())
}

// Images
function img() {
    return src(path.src.img)
        .pipe(dest(path.build.img));
}

// Fonts
function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts));
}

// Watch file changes in source folder
function watchFiles(params) {
    gulp.watch([path.watch.html], { delay: 1000 }, html);
    gulp.watch([path.watch.css], { delay: 1000 }, css);
    gulp.watch([path.watch.js ], { delay: 1000 }, js);
}

// Remove files from dist
function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js,css,img,html,fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.js = js;
exports.img = img;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;