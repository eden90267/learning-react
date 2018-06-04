import React from 'react';
import {renderToString} from 'react-dom/server';
import express from 'express';
import path from 'path';

global.React = React;

const html = renderToString(<Menu recipes={data}/>);

const fileAssets = express.static(
  path.join(__dirname, '../../dist/assets')
);

const logger = (req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
};

const respond = (req, res) =>
  res.status(200).send(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Universal Color Oraganizer</title>
    </head>
    <body>
    <div id="react-container">ready...</div>
    </body>
    </html>
  `);


const app = express()
  .use(logger)
  .use(fileAssets)
  .use(respond);

app.listen(3000, () =>
  console.log(`Recipe app running at 'http://localhost:3000'`)
);