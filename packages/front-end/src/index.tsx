/** ESPOIR TEMPLATE */
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app';

import './index.css';


const container = document.getElementById('root');

if (!container) {
  throw new Error(`container Node "#root" not found`);
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
