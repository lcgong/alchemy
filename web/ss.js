var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var options = {
  // key: fs.readFileSync('build/certs/key.pem'),
  // cert: fs.readFileSync('build/certs/cert.pem')
  key: fs.readFileSync('build/certs/localhost.key'),
  cert: fs.readFileSync('build/certs/localhost.cert')
};

var app = express();
app.disable('x-powered-by');
app.get('/', function (req, res) {
  res.send('Welcome');
});

http.createServer(app).listen(8008);
https.createServer(options, app).listen(1443);
