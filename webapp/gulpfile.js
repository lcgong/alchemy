var gulp = require('gulp');

gulp.task('default', function() {
  console.log('default');
  // 将你的默认的任务代码放在这
});

gulp.task('tsc:w', ['tsc'], function () {
    gulp.watch('web/**/*.ts', ['tsc']);
});

gulp.task('tsc', function () {
  var ts = require('gulp-typescript');
  var prj = ts.createProject('tsconfig.json');

  return gulp.src('web/**/*.ts')
    .pipe(ts(prj))
    .pipe(gulp.dest('web/transpiled'));
});

gulp.task('webapp', function() {
  // 前端HTTP服务器

  let port = 8888;

});



//--------------------------------------------------------------------------
const bundleOpts =  {
    minify: true,
    sourceMaps: true,
    mangle: false,
    format: 'umd'
};

gulp.task('thirdparty', ['thirdparty:rt', 'thirdparty:ts']);

gulp.task('thirdparty:rt', function() {
  //从jspm config读取所需要的包
  let jspmConfigMgr = require('jspm/lib/config');
  jspmConfigMgr.loadSync();

  // 运行时库
  let packages = Object.keys(jspmConfigMgr.loader.getConfig().map).sort();

  let Builder = require('jspm').Builder;
  let builder = new Builder();

  console.log('packages: ', packages.join(', '));
  return builder.bundle(packages.join(' + '), 'build/lib/rt.js', bundleOpts);
});

gulp.task('thirdparty:ts', function() {
  //从jspm config读取所需要的包
  let jspmConfigMgr = require('jspm/lib/config');
  jspmConfigMgr.loadSync();

  let config = Object.assign({}, jspmConfigMgr.loader.getConfig());

  let packages = Object.keys(config.devConfig.map).sort(); // 开发时的库

  // 将devConfig出现的包临时添加到主配置里，因为在bundle时无法找到devConfig定义的
  Object.assign(config.map, config.devConfig.map);
  Object.assign(config.packages, config.devConfig.packages);

  let Builder = require('jspm').Builder;
  let builder = new Builder();

  builder.loader.config(config);

  console.log('packages: ', packages.sort().join(', '));
  return builder.bundle(packages.join(' + '), 'build/lib/ts.transpiler.js', bundleOpts);
});
