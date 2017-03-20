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

app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], connectSrc : ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"], //"'unsafe-inline'"
      styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'"],
      mediaSrc: ["'self'"], fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"], frameSrc: ["'none'"],
      reportUri: '/report-violation',
    }
  }));

app.use(cors({
  "origin": ["*"],
  "methods": ['GET', 'HEAD'],
}));



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




let path    = require("path");


function crsfProtection(req, res) {
  let crsf = crypto.randomBytes(12).toString('base64');
  let salt = crypto.randomBytes(3).toString('base64');
  let data = {crsf: crsf, salt: salt, ts: moment().unix()};
  let signed = jwt.sign(data, get_jwt_secure(), {expiresIn:'1d'});

  let expires = new Date(Date.now() + 24*3600*1000);

  // script can access the unsigned version
  res.cookie('_crsf_token', crsf, { expires: expires });

  // script cannot access this signed cookie.
  res.cookie('_crsf_signed', signed, { expires: expires, httpOnly: true });
}

app.get('/signin', function(req, res){
  crsfProtection(req, res)

  res.sendFile(path.join(__dirname, 'login/signin.html'));
});

app.get('/signup', function(req, res){
  res.sendFile(path.join(__dirname, 'login/signup.html'));
});


function get_oauth_settings() {
  let doc = yaml.safeLoad(fs.readFileSync('../secrets/oauth.yml', 'utf8'));
  return doc;
}


// var oauth_info = get_oauth_settings();


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



app.get('/login/settings.js', function(req, res) {
  res.set({
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Expires': '0'
  });

  let oauth_info = get_oauth_settings();

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
