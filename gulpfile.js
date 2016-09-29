const GULP = require('gulp'),
      PATH = require('path'),
      $ = require('gulp-load-plugins')();

////////////////////////////////////////////
//             CONFIGuration              //
////////////////////////////////////////////
const CONFIG = {
    styles: {
        src: ['src/public/sass/style.scss'],
        srcDir: 'src/public/sass/*.scss',
        dest: 'src/public/css/',
        prodDest: 'dist/public/css/'
    },
    scripts: {
        src: 'src/public/js/*.js',
        bundle: 'custom.js',
        dest: 'src/public/js/',
        prodDest: 'dist/public/js/'
    },
    jade:{
      src: 'src/views/index.jade',
      srcDir: 'src/views/**/*.jade',
      dest: 'dist/views/html/'
    },
    img:{
      srcDir: ['src/public/img/*.jpg','src/public/img/*.png'],
      dest: 'dist/public/img/'
    },
    html:{
      srcDir: 'src/views/html/*.html',
      dest: 'dist/views/html/'
    }
}

////////////////////////////////////////////
//             Development                //
////////////////////////////////////////////
GULP.task('dev:sass', ()=>{
  return GULP
    .src(CONFIG.styles.src)
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe($.sourcemaps.write())
    .pipe(GULP.dest(CONFIG.styles.dest));
});

GULP.task('dev:lint', ()=>{
  return GULP
    .src(CONFIG.scripts.src)
    .pipe($.cached('linting'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
});

GULP.task('dev:jadeLint', ()=>{
  return GULP
    .src(CONFIG.jade.srcDir)
    .pipe($.pugLint());
});

// GULP.task('dev:sassLint', ()=>{
//   return GULP.src(CONFIG.styles.srcDir)
//     .pipe($.scssLint());
// });

GULP.task('dev:jsBabel', ()=>{
  return GULP
    .src(CONFIG.scripts.src)
    .pipe($.babel({
			   presets: ['es2015']
		  }
    ))
    .pipe(GULP.dest(CONFIG.scripts.dest))
});

GULP.task('dev',
  GULP.parallel(
    'dev:sass',
    'dev:lint',
    'dev:jadeLint'//,
    //'dev:sassLint'//,
    // 'dev:jsBabel'
));

GULP.task('dev:watch', GULP.series('dev', devWatch));

function devWatch(){
    GULP.watch(CONFIG.styles.srcDir, GULP.series('dev:sass'));
    GULP.watch(CONFIG.scripts.src, GULP.series('dev:lint'));
    // GULP.watch(CONFIG.scripts.src, GULP.series('dev:jsBabel'));
    GULP.watch(CONFIG.jade.srcDir, GULP.series('dev:jadeLint'));
    //GULP.watch(CONFIG.styles.srcDir, GULP.series('dev:sassLint'));
}

GULP.task('default', GULP.series('dev:watch'));

////////////////////////////////////////////
//              Production                //
////////////////////////////////////////////
GULP.task('prod:sass', ()=>{
  return GULP
    .src(CONFIG.styles.src)
    .pipe($.sass())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe($.cleanCss())
    .pipe(GULP.dest(CONFIG.styles.prodDest));
});

GULP.task('prod:jsMini', ()=>{
  return GULP
    .src(CONFIG.scripts.src)
    .pipe($.babel({
			   presets: ['es2015']
		  }
    ))
    .pipe($.concat(CONFIG.scripts.bundle))
    .pipe($.uglify())
    .pipe(GULP.dest(CONFIG.scripts.prodDest))
});

GULP.task('prod:img', ()=>{
  return GULP.src(CONFIG.img.srcDir)
    .pipe($.imagemin({
      optimizationLevel: 7       //  0 thru 7 being the most abusive 3 is default
    }))
    .pipe(GULP.dest(CONFIG.img.dest));
});

GULP.task('production',          // GULP tasks are not hoisted like functions remmeber that
  GULP.parallel(
    'prod:sass',
    'prod:jsMini',
    'prod:img'
));



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                            Miscellaneous                                                                        //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////
//    Jade to HTML Compiling   //
/////////////////////////////////
GULP.task('jade', ()=>{
  return GULP.src(CONFIG.jade.src)
      .pipe($.jade({
        pretty: true
      }))
      .pipe(GULP.dest(CONFIG.jade.dest))
});

///////////////////////
//    HTML5 Linting  //
///////////////////////
GULP.task('dev:html', ()=>{
    return GULP.src(CONFIG.html.scrDir)
        .pipe($.html5Lint());
});

//////////////////////////////////////////////////////
//    Static Web File Watching w/ Live Reloading    //
//////////////////////////////////////////////////////
const browserSync = require('browser-sync').create(),
      reload      = browserSync.reload;

GULP.task('dev:serve', ()=>{

    browserSync.init({
      server: {
        baseDir: CONFIG.html.dest
      }
    });

    GULP.watch(CONFIG.html.srcDir).on("change", reload);
});
