#! /usr/bin/node

let port = process.env.PORT || 8800;
let mode = process.env.NODE_ENV || 'development';

let serveStatic = require('serve-static');
let historyHandler = require('connect-history-api-fallback');
let helmet = require('helmet');
let cors = require('cors');
let chalk = require('chalk');
let moment = require('moment');

let app = require('express')();

if (mode === 'development') {
  app.use(developmentLogger)
}

let yaml = require('js-yaml');
let fs   = require('fs');

function get_jwt_secure() {
  let doc = yaml.safeLoad(fs.readFileSync('../secrets/session.yml', 'utf8'));
  return doc['secure'];
}

// var jwt = require('jsonwebtoken');
// var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
// jwt.verify(token, 'shhhhh', { algorithm: 'HS256'});
// Buffer.from('abc').toString('base64')
// moment().unix()

console.log('secure: ' + get_jwt_secure());
// Get document, or throw exception on error


app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], connectSrc : ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"], //"'unsafe-inline'"
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


let path    = require("path");

// app.get('/js/myscript.js', function(req, res) {
//     res.render('myscript');
// });




app.get('/signin', function(req, res){
  res.sendFile(path.join(__dirname, 'login/signin.html'));
});

app.get('/signup', function(req, res){
  res.sendFile(path.join(__dirname, 'login/signup.html'));
});

var oauth_info = {
  weibo : {
    app_id: 1234,
    redirect_url: 'http....'
  }
}

let crypto = require('crypto');
let jwt = require('jsonwebtoken');

function generateCRSFToken() {

  return {crsf: token, signed: signedToken};
}

// var jwt = require('jsonwebtoken');
// var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
// jwt.verify(token, 'shhhhh', { algorithm: 'HS256'});
// Buffer.from('abc').toString('base64')
// moment().unix()

function renderOAuthSettings(isSignin) {

}

// if (isSignin) {
//   let crsf = crypto.randomBytes(16).toString('base64');
//   let data = {token: crsf, timestamp: moment().unix()};
//   let signed = jwt.sign(data, get_jwt_secure());
//
//   res.cookie('_oauth_crsf', signed, {maxAge: 600});
//
//   res.write('var _oauth_crsf = "' + crsf + '";');
//   console.log('234');
// }

app.get('/login/settings.js', function(req, res) {
  res.set({
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Expires': '0'
  });

  res.write('var LoginSettings = ' + JSON.stringify(oauth_info) + ';');
  res.end();
});


app.use(historyHandler({ // 所有没有后缀的访问路径均转向指定的页面
  index: '/index.html',
}));

app.use('/login', serveStatic('login'));
app.use('/app', serveStatic('app'));
app.use('/', serveStatic('webroot'));
app.use('/', serveStatic('build'));
app.use('/node_modules', serveStatic('node_modules'));
app.use('/jspm_packages', serveStatic('jspm_packages'));


function formatTimestamp() {
  let now = new Date();
  let padding = (n) => (n < 10) ? "0" + n : n;
  return ['[', chalk.grey(padding(now.getHours())), chalk.grey(':'),
          chalk.bold.grey(padding(now.getMinutes())), chalk.grey(':'),
          chalk.bold.grey(padding(now.getSeconds())), ']'].join('');
}

function developmentLogger(req, res, next) { // 记录访问日志
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

let server;
server = require('http').createServer(app);
server = require('http-shutdown')(server); // for gracefully shutdown

server.listen(port, function() {
  console.log('Webapp listening on port %d in env %s', port, mode);

  setTimeout(function() {
    if (process.send) { // In the child the process object has a send() method
      process.send('ready');
    }
  }, 2000);
});


process.on('SIGINT', function() {
  console.log('clean to close ...');
  server.shutdown(function() {
    console.log('Connections closed');
    process.exit(0);
  });
});

// process.on('message', function(msg) { // Windows graceful stop
//   if (msg == 'shutdown') {
//     console.log('Closing all connections...');
//     setTimeout(function() {
//       console.log('Finished closing connections');
//       process.exit(0);
//     }, 1500);
//   }
// });
