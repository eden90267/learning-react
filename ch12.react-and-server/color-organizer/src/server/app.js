import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';
import {Provider} from 'react-redux';
import {compose} from 'redux';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import storeFactory from "../store";
import initialState from '../../data/initialState';
import App from "../components/App";
import api from './color-api';

const staticCSS = fs.readFileSync(path.join(__dirname, '../../dist/assets/bundle.css'));
const fileAssets = express.static(path.join(__dirname, '../../dist/assets'));

const serverStore = storeFactory(true, initialState);

serverStore.subscribe(() =>
  fs.writeFile(
    path.join(__dirname, '../../data/initialState.json'),
    JSON.stringify(serverStore.getState()),
    error => (error) ?
      console.log('Error saving state!', error) :
      null
  )
);

const logger = (req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
};

const buildHTMLPage = ({html, state}) => `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Universal Color Organizer</title>
    <style>${staticCSS}</style>
  </head>
  <body>
  <div id="react-container">${html}</div>
  <script>
      window.__INITIAL_STATE__ = ${JSON.stringify(state)}
  </script>
  <script src="/bundle.js"></script>
  </body>
  </html>
`;

const renderComponentsToHTML = ({url, store}) =>
  ({
    state: store.getState(),
    html: renderToString(
      <Provider store={store}>
        <StaticRouter location={url} context={{}}>
          <App/>
        </StaticRouter>
      </Provider>
    )
  });

const makeClientStoreFrom = store => url =>
  ({
    store: storeFactory(false, store.getState()),
    url
  });

const htmlResponse = compose(
  buildHTMLPage,
  renderComponentsToHTML,
  makeClientStoreFrom(serverStore)
);

const respond = ({url}, res) =>
  res.status(200).send(
    htmlResponse(url)
  );

const addStoreToRequestPipeline = (req, res, next) => {
  req.store = serverStore;
  next();
};

export default express()
  .use(logger)
  .use(fileAssets)
  .use(bodyParser.json())
  .use(addStoreToRequestPipeline)
  .use('/api', api)
  .use(respond);