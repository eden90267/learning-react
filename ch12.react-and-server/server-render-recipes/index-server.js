import React from 'react';
import {renderToString} from 'react-dom/server';
import express from 'express';
import Menu from "./components/Menu";
import data from './assets/recipes';

global.React = React;

const html = renderToString(<Menu recipes={data}/>);

const logger = (req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
};

const sendHTMLPage = (req, res) =>
  res.status(200).send(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>React Recipes App</title>
    </head>
    <body>
    <div id="react-container">${html}</div>
    <script>
        window.__DATA__ = ${JSON.stringify(data)}
    </script>
    <script src="bundle.js"></script>
    </body>
    </html>
  `);


const app = express()
  .use(logger)
  .use(express.static('./assets'))
  .use(sendHTMLPage);

app.listen(3000, () =>
  console.log(`Recipe app running at 'http://localhost:3000'`)
);