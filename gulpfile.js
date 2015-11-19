var gulp        = require('gulp'),
    jshint      = require('gulp-jshint'),
    sass        = require('gulp-ruby-sass'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    cssmin      = require('gulp-cssmin'),
    imagemin    = require('gulp-imagemin'),
    gutil       = require('gulp-util'),
    pngquant    = require('imagemin-pngquant'),
    jpegtran    = require('imagemin-jpegtran'),
    prefix      = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    jade        = require('gulp-jade'),
    path        = require('path'),
    inas        = require('inas'),
    fs          = require('fs'),
    gulpif      = require('gulp-if'),
    px2rem      = require('gulp-px2rem'),
    spritesmith = require('gulp.spritesmith'),
    templater   = require('spritesheet-templates'),
    wrap        = require('gulp-wrap-amd');

var paths = {
    js: 'views/*.js',
    img: 'images/*.png',
    sass: ['css/_sass/**/*','css/_sass/*'],
    jade: 'templates/_jade/*.jade',
    sprite: ['images/slice/*', 'sass.handlebars'],
    css: 'css/*.css'
}

var output = {
    js: 'views',
    img: 'images',
    css: 'css',
    template: 'templates'
}

gulp.task('sprite', function () {
    var sassHandlebars = fs.readFileSync('sass.handlebars', 'utf8');
    templater.addHandlebarsTemplate('sass.handlebars', sassHandlebars);

    return gulp.src('images/slice/*.png')
    .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.sass',
        padding: 2,
        cssTemplate: 'sass.handlebars'
    }))
    .pipe(gulpif('*.png', gulp.dest('./images/')))
    .pipe(gulpif('*.sass', gulp.dest('./css/_sass/components/')));
});

gulp.task('inas-check', function () {
  return inas.validate('inas.html')
})

gulp.task('inas-push', function(){
    var program = inas.validate('./inas.html');
    if(program){
        inas.publish(program);
    }
})

gulp.task('jade', function () {
  return gulp.src(paths.jade)
    .on('error', function (err) {
        console.error('Error!', err.message);
    })
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(output.template))
    .pipe(browserSync.reload({stream: true}));
})

gulp.task('js', function () {
  return gulp.src(paths.js)
    .on('error', function (err) {
        console.error('Error!', err.message);
    })
    .pipe(browserSync.reload({stream: true}));
})

// 编译Sass
gulp.task('sass', function() {
    return sass(['css/_sass/*','css/_sass/**/*'],{style: 'compressed'})
        .on('error', sass.logError)
        .pipe(px2rem({
            replace: true
        }))
        .pipe(prefix('ios 6', 'android 4'))
        .pipe(gulp.dest(output.css))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task( 'build-mainjs', [ 'build-views' ], function(){

    var config  = require( './build.js' );
    var namAmd  = require( 'gulp-name-amd' ),
        through = require( 'through2' ),
        fs      = require( 'fs' ),
        path    = require( 'path' );

    var bundles =  config.bundles || [];

    // 如果配置的有views下面的文件的话，切换到build 下面
    var viewsRegx = /^\.\/views\//;
    for( var i=0; i< bundles.length; i++){
        if( viewsRegx.test( bundles[i] )){
            bundles[i] = bundles[i].replace( viewsRegx,'./build/views/' )
        }
    }

    return gulp.src( ['./main.js'].concat( bundles ) )
        .pipe( bundles.length ? namAmd() :  gutil.noop()  )
        .pipe( through.obj(function( file, encoding, callback ){

            if( !/main\.js$/.test( file.path )){
                callback( null, file );
                return;
            }

            var content = file.contents.toString();
            content = content.replace( /baseUrl\s*:\s*['"]([a-z\/]+)['"]/ig, 'baseUrl:"build/$1"' );

            var baseurl = RegExp.$1,
                match   = content.match( /paths:({[^}]*})/ ),
                paths   = { },
                hasCdn  = !!config.cdnPath;

            if( hasCdn && !/\/$/.test( config.cdnPath ) ){

                config.cdnPath += '/';
            }

            if( match ){

                try{
                    paths = eval( '('+ match[1] +')' );
                }
                catch(err){
                    gutil.log( gutil.colors.red( "build-mainjs: synax error in main.js; in [pathes] section;" ) );
                }
            }

            if( hasCdn ){

              var rootPath    = process.cwd(),
                  baseUrlPath = path.join( rootPath, baseurl );

                for( var m in paths ){

                    if( !/^http/.test( paths[m] ) ){

                        paths[m] = path.join( baseUrlPath , paths[m] );
                        paths[m] = path.join( 'build' , paths[m].replace( rootPath, '' ) );
                        paths[m] = config.cdnPath + paths[m].replace(/\\/g, "/");
                    }
                }
            }

            hasCdn && (function addPath( root ){

                var views_js = fs.readdirSync( root );

                // console.log(root );

                views_js.forEach(function( v ){

                    var viewName = v.replace( /\.js$/, '' );
                    var ext = path.extname ( v );
                    if( ext == '.js' ){

                        paths[viewName] = path.join( root, viewName );
                        paths[viewName] = config.cdnPath + paths[viewName].replace(/\\/g, "/");
                    }
                    else if( ext == '' ){

                        addPath( path.join( root, viewName ) );
                    }

                });
            })(  'build/views' );

            // replace path
            content = content.replace( match[0], 'paths:' + JSON.stringify( paths ) );

            // replace urlArgs
            content = content.replace(/(urlArgs:)([^,]+),/gi, '$1\'v=' + Date.now() + '\',' );

            file.contents = new Buffer( content );

            callback( null, file );

         }))
        .pipe( concat( 'main.js' ) )
        .pipe( uglify().on('error', gutil.log) )
        .pipe( gulp.dest( './build' ) );

})

gulp.task( 'build-common', function(){

    // gutil.log( '  build common' );
    return gulp.src('./common/**/*.js')
        .pipe( uglify().on('error', gutil.log)  )
        .pipe( gulp.dest( './build/common' ) );
});

gulp.task( 'build-index', [ 'build-mainjs' ], function(){

    var config  = require( './build.js' ),
        rename  = require( 'gulp-rename' ),
        fs      = require( 'fs' ),
        replace = require( 'gulp-replace' ),
        filemd5 = require( 'md5-file' );


    var mainjs_v = filemd5( './build/main.js' ).substr( 0, 5 );

    return gulp.src('./index.dev.html')
        // .pipe( replace( /(<link.+href=['"])(css\/[\w\.\-\/]+\.css)(['"][^>\/]+\/?>)/mgi, '$1'+ config.cdnPath + '$2$3' ) )
        .pipe( replace( /(<link.+href=['"])(css\/[\w\.\-\/]+\.css)(\??[\w=]*)?(['"][^>\/]+\/?>)/mgi, function( match, m1, m2, m3, m4 ){
            // 给css 添加版本号
            return m1 + config.cdnPath + m2 + '?v=' + filemd5( m2 ).substr( 0, 5 ) + m4;
         }))
        .pipe( replace( /[^\/]main\.js\??[^'"]*/g, '"' + config.cdnPath + 'build/main.js?v=' + mainjs_v ) )
        .pipe( replace( /intv\.seed\.dev\.js/g, 'intv.seed.js' ) )
        .pipe( rename ( 'index.html' ) )
        .pipe( gulp.dest( './' ) );

})

gulp.task( 'build-image', function(){

    var config   = require( './build.js' ),
        imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant'),
        jpegtran = require('imagemin-jpegtran');

    if( config.imagemin ){

        // gutil.log( '  compress images' );
        return gulp.src( ['./images/**/*.*'] )
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
            .pipe(gulp.dest('./images'));
    }
})

gulp.task( 'build-views', function(){

    var config  = require( './build.js' ),
        through = require( 'through2' ),
        path    = require( 'path' ),
        injecthtml  = require('gulp-inject-html');

    var viewsDir  = path.join( __dirname , 'views' );
    var targetDir_view = path.join( __dirname , 'build' , 'views' );

    var injectConfig = { templates: 'templates', baseUrl: 'views' };

    if( config.pathBuilder && config.pathBuilder.length ){

        injectConfig.pathBuilder = config.pathBuilder ;
    }

    return gulp.src( path.join( viewsDir, '**/*.js' ) )
        .pipe( injecthtml( injectConfig ) )
        .pipe( uglify().on('error', gutil.log)  )
        .pipe( gulp.dest( targetDir_view ));

})

gulp.task( 'build', [ 'sass', 'jade', 'build-index', 'build-common', 'build-image' ] , function(){

    var del = require( 'del' ),
        bundles = require( './build' ).bundles;

    // 清除build 下面已经打包进 main.js 的文件
    if( bundles && bundles.length ){
        bundles.forEach( function( js, idx ){
            if( !/^\.\/build\//.test( js ) ){
                bundles[idx] = js.replace( /^\.\//, './build/')
            }
        });

        del( bundles );
    }
});

gulp.task('watch', function() {
    browserSync.init({
        // proxy: 'http://192.168.9.111'
        server: './'
    });
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.jade, ['jade']);
    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.sprite, ['sprite']);
});

// 默认任务
gulp.task('default', ['watch', 'sass', 'jade', 'sprite']);

