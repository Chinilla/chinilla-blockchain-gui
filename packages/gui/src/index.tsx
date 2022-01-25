import './polyfill';
import './config/env';
import React from 'react';
import ReactDOM from 'react-dom';
import './config/env';
import AppRouter from './components/app/AppRouter';

// we need to use additional root for hot reloading
function Root() {
  return (
    <App />
  );
}

ReactDOM.render(<Root />, document.querySelector('#root'));
