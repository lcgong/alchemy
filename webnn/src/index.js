import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';


import axios from 'axios';

ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

async function hi() {
    await axios.post('/signin', {
        signid: 'Fred',
        passwd: 'Flintstone'
      })
      .then(function (response) {
        console.log(444, response);
      })
      .catch(function (error) {
        console.log(333, error.response.data);
    });
}

hi();
