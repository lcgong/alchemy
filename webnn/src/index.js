import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
// import registerServiceWorker from './registerServiceWorker';

import axios from "axios";
axios.defaults.xsrfHeaderName = "X-CSRF-Token";
axios.defaults.xsrfCookieName = "x-csrf-token";

ReactDOM.render(<App />, document.getElementById("root"));
// registerServiceWorker();



// function hh() {
//     console.log(this);
// }

// console.log(777, new hh());

async function hi() {
    // try {
        await signin('user@abc.com', 'pass123');
    // } catch(error) {
    //     console.error(555, error.message);
    // }
}

hi();


/**
 * Ping一下页面服务，同时获得或更新当前的CRSF token.
 */
async function ping() {
    const clientId = await getClientID();

}

/**
 * 使用登陆ID和密码登陆
 * @param {string} loginId  登陆ID
 * @param {string} passwd 密码
 */
async function signin(login_id, passwd) {
    const client_id = await getClientID();

    try {
        const data = {
            login_id: login_id,
            passwd: passwd,
            client_id: client_id
        };

        await axios.post("/signin", data);
        await axios.get("/usr/profile/basic");
    } catch (error) {
        throw new (makeRESTfulErrorClass(error))();
    }
}


/**
 * 得到客户端ID
 */
async function getClientID() {
    let clientId = window.localStorage.getItem("client-id");
    if (!clientId) {
        clientId = await generateSPAClientID();
        window.localStorage.setItem("client-id", clientId);
    }
    return clientId;
}

/**
 * 生成客户端ID号
 */
async function generateSPAClientID() {
    let naunce = new ArrayBuffer(16);
    let seconds = Math.trunc(new Date().getTime() / 1000);
    new DataView(naunce, 0, 4).setInt32(0, seconds);
    window.crypto.getRandomValues(new Uint8Array(naunce, 4, 12));

    let buffer = new Uint8Array(await crypto.subtle.digest("SHA-1", naunce));

    const base = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const baseArray = new TextEncoder("UTF-8").encode(base);
    for (let i = buffer.length; i >= 0; i--) {
        buffer[i] = baseArray[buffer[i] % baseArray.length];
    }
    return "spa|" + new TextDecoder("utf-8").decode(buffer);
}


function makeRESTfulErrorClass(error) {
    console.log(333, error.response.data)

    var instance;  
    var cls;
    if (error.response) {
        const {status, headers, data} = error.response;
        if (status === 401) {
            cls = UnauthorizedError;
            instance = new UnauthorizedError(error);
        } else if (status === 403) {
            cls = ForbiddenError;
            instance = new ForbiddenError(error);

        } else if (status === 404) {
            cls = NotFoundError;
            instance = new NotFoundError(error);
        
        } else if (status === 409) {
            cls = InvalidOperationError;
            instance = new InvalidOperationError(error);
        
        } else {
            cls = RESTfulError;
            instance = new RESTfulError(error);
        }

    } else if (error.request) {
        // 请求已经发送，但没有收到响应
        console.error(error);
        cls = RESTfulError;
        instance = new RESTfulError(error);

    } else {
        console.error(error);
        cls = Error;
        instance = new Error(error.message);
    }

    // 动态生成一个子类
    function CustomError() {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
        if (Error.captureStackTrace) {
            Error.captureStackTrace(instance, CustomError);
        }
        return instance;
    }
      
    CustomError.prototype = Object.create(cls.prototype, {
        constructor: {
          value: Error,
          enumerable: false,
          writable: true,
          configurable: true
        }
    });
      
    Object.setPrototypeOf(CustomError, cls);
          

    return CustomError;
}



class RESTfulError extends Error {
    constructor(error) {
        const response = error.response;

        super(response.data.error);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RESTfulError);
        }

        this.name = 'RESTfulError';
        this.details = response.data.details;
        this.status = response.status;
    }
}



class UnauthorizedError extends RESTfulError {
    constructor(error) {
      super(error);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, UnauthorizedError);
      }
      this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends RESTfulError {
    constructor(error) {
        super(error);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ForbiddenError);
        }

        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends RESTfulError {
    constructor(error) {
        super(error);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotFoundError);
        }

        this.name = 'NotFoundError';
    }
}

class InvalidOperationError extends RESTfulError {
    constructor(error) {
        super(error);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidOperationError);
        }
        this.name = 'InvalidOperationError';
    }
}