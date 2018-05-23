import React from 'react';
import ReactDOM from 'react-dom';
import App from "./components/App";
import storeFactory from './store';

const store = storeFactory();

const render = () =>
  ReactDOM.render(
    <App stpre={store} />,
    document.getElementById('react-container')
  );

store.subscribe(render);
render();