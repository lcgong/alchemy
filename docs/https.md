

从http://www.selfsignedcertificate.com/生成一个自签名的证书，或者按照下面产生证书
```
openssl genrsa -out localhost.key 2048
openssl req -new -x509 -key localhost.key -out localhost.cert -days 3650 -subj "/CN=localhost"
```

使用nodejs的express建立https
```
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var options = {
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
```
