

const CSRFTokens = require('csrf');

const csrfTokens = new CSRFTokens();

const csrfSecret = 'DjwennlKciQiTlxKmYtWqH8N';

const path = require('path');


const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: process.env.LOG_LEVEL || 'debug',
            timestamp: function () {
                return (new Date()).toISOString();
            }
        })
    ]
});


const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

logger.stream = { 
    write: (message, encoding) => { 
      logger.info(message.trim()); 
    } 
}; 
app.use(morgan('dev', { "stream": logger.stream }));

app.use(cookieParser());


const rndm = require('rndm')

function authCookieMaker(req, res, next) {

    // 生成浏览器的会话ID，缺省7天
    let uasid = req.cookies['x-ua-sid'];
    if (uasid === undefined || uasid.length !== 16) {
        uasid = rndm(16);
        res.cookie('x-ua-sid', uasid, { 
            maxAge: 7*86400000,  // milliseconds
            httpOnly: true,
            sameSite: true
        });
    }

    let token = csrfTokens.create(csrfSecret + uasid);
    res.cookie('x-csrf-token', token, {
        sameSite: true
    });

    next();
}



// create  parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonBodyParser = bodyParser.json();

// authCookieMaker, 
// signid and passwd
app.post('/signin', authCookieMaker, urlencodedParser, jsonBodyParser, (req, res, next) => {

    const signid = req.body.signid;
    const passwd = req.body.passwd;

    if (typeof signid !=='string') {
        res.status(400);
        res.json({error: `Arguments: <signid>, [passwd]`});
        return;
    }

    // updateBrowserAuthCookies(req, res);


    axios.post("http://bacon-police.com/auth", creds)
        .then(response => response.data)
        .then(auth => {
            // this is the part where you preconfigure authoken
            // based on your auth service response
            req.axios = axios.create({
                headers: {Authtoken: auth.token}
            });
            next(); // <- handing over to the next middleware
        })
        .catch(error => {
        res.status(401).json({error: "authentication failed"});
        });

    logger.info(`welcome, ${signid} (${passwd})`);

    res.send('');

    // res.send(`welcome, ${signid} (${passwd})`);

});


app.use(express.static(path.join(__dirname, 'build'), {index: false}));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    logger.info(`WebWorker listening on port ${port}`);
});
