import React from 'react';
import {render} from 'react-dom';
import App from "./components/App";
import storeFactory from './store';
import {Provider} from "react-redux";
import {BrowserRouter} from 'react-router-dom';

const store = storeFactory(false, window.__INITIAL_STATE__);

window.React = React;
window.store = store;

render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('react-container')
);