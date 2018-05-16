

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

const axios = require('axios');

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

    const {login_id, client_id, passwd} = req.body;

    if (typeof login_id !=='string') {
        res.status(400);
        res.json({error: `Arguments: <login_id>, [passwd]`});
        return;
    }


    let creds = {
        login_id: login_id,
        client_id: client_id,
        passwd: passwd
    }

    origin = req.get('Origin')
    const headers = {
        Origin: origin
    };

    let val;
    val = req.get('X-CSRF-Token');
    if (val) {
        headers['X-CSRF-Token'] = val;
    }

    val = req.get('User-Agent')
    if (val) {
        headers['User-Agent'] = val;
    }

    val = req.get('Cookie');
    if (val) {
        headers['Cookie'] = val;
    }

    const signin_url = "http://localhost:8500/api/signin";

    const config = {
        headers: headers
    };

    axios.post(signin_url, creds, config)
        .then(response => {
            const {token, expires} = response.data;
            res.cookie('authentication', token, {
                expires: new Date(expires),
                httpOnly: true,
                sameSite: true
            });

            next(); 
        })
        .catch(error => {
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
    
            } else if (error.request) {
                res.status(500).json({error: error.message});

            } else {
                res.status(500).json({error: error.message});

            }
        });
});


app.use(express.static(path.join(__dirname, 'build'), {index: false}));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    logger.info(`WebWorker listening on port ${port}`);
});
