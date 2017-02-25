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

  let express = require('express');
  let http = require('http');
  let serveStatic = require('serve-static');
  let historyHandler = require('connect-history-api-fallback');
  let helmet = require('helmet');
  let cors = require('cors');

  let app = express();
  app.use(loggerHandler)
  app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"], connectSrc : ["'self'"],
        scriptSrc: ["'self'"], // "'unsafe-eval'", "'unsafe-inline'"
        styleSrc: ["'self'"], imgSrc: ["'self'"],
        mediaSrc: ["'self'"], fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"], frameSrc: ["'none'"],
        reportUri: '/report-violation',
      }
    }));
  app.use(cors({
    "origin": ["*"],
    "methods": ['GET', 'HEAD'],
  }));
  app.use(historyHandler({ // 所有没有后缀的访问路径均转向指定的页面
    index: '/index.html',
  }));
  app.use('/', serveStatic('build/lib'));
  app.use('/', serveStatic('build/transpiled'));
  app.use('/', serveStatic('src'));
  app.use('/node_modules', serveStatic('node_modules'));
  app.use('/jspm_packages', serveStatic('jspm_packages'));

  http.createServer(app).listen(port, () => {
    console.log(formatTimestamp() + ' ' + 'Webapp is listening on ['
      + chalk.bold.yellow(port) + '] ...');
  });

  let chalk = require('chalk');
  let moment = require('moment');

  function formatTimestamp() {
    let now = new Date();
    let padding = (n) => (n < 10) ? "0" + n : n;
    return ['[', chalk.grey(padding(now.getHours())), chalk.grey(':'),
            chalk.bold.grey(padding(now.getMinutes())), chalk.grey(':'),
            chalk.bold.grey(padding(now.getSeconds())), ']'].join('');
  }

  function loggerHandler(req, res, next) { // 记录访问日志
    let path = req.url;
    var end = res.end;
    req._startTime = new Date();
    res.end = (chunk, encoding, callback) => {
      res.end = end;
      res.end(chunk, encoding, callback);
      process.nextTick(() => {
        // 等这轮事件结束再输出日志
        let code = (res.statusCode < 400) ? chalk.bold.green : chalk.bold.red;
        let msg = [
          formatTimestamp(),
          code(res.statusCode),
          chalk.bold.cyan(req.method),
          path,
          chalk.magenta('' + (new Date() - req._startTime) + 'ms')
        ].join(' ');
        console.log(msg);
      });
    };
    next();
  }
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
  return builder.bundle(packages.join(' + '), 'build/lib/ts.transpiler', bundleOpts);
});
