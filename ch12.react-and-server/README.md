# Chap 12. React 與伺服器

目前我們使用 React
建構小應用程式完全在瀏覽器上執行．它們在瀏覽器上收集資料並以瀏覽器的儲存體儲存資料。這很合理，因為
React 是 view 層，它的目的是繪製 UI。然而，大部分的應用程式需要某種後端。我們必須認識如何建構有伺服器的應用程式。

就算你的用戶端應用程式完全依靠在雲端的後端，還是必須對這些服務收發資料。以 Flux
架構來說，有特定的地方可以進行這些交易，還有可處理 HTTP 請求延遲的函式庫。

此外 React
還可以**同構**的繪製，其表示它可以在瀏覽器以外的平台運作。這表示我們可以在傳送 UI
到瀏覽器前在伺服器上繪製。利用伺服器端的繪製，我們可以改善應用程式的效能、可攜性與安全性。

這一章從檢視同構與通用的差異以及兩者與 React
的關聯開始，接下來會看到如何使用通用的 JavaScript
建構同構應用程式。最後，我們會加上伺服器並在伺服器繪製 UI 以改善顏色管理的效能。

## 同構與通用

同構 (isomorphic) 與通用 (universal) 通常用於描述同時在用戶端與伺服器上運作的應用程式。雖然兩個詞都可以描述同一個應用程式，但還是有微妙的差別。

- **同構**應用程式是能在多種平台上繪製的應用程式
- **通用**程式碼表示完全相同的程式碼可在多種環境中執行

Node.js 能讓我們為瀏覽器寫的程式碼在其他伺服器、CLI
與原生平台上執行。讓我們看看一些通用的 JavaScript：

```javascript
var printNames = response => {
  var people = JSON.parse(response).results,
      names = people.map(({name}) => `${name.last}, ${name.first}`);
  console.log(names.join('\n'));
}
```

printNames 函式是通用的。同一個程式碼可在瀏覽器或伺服器上呼叫。通用 JavaScript
是在伺服器或用戶端執行都沒有問題的 JavaScript。

伺服器與用戶端是完全不同領域，因此 JavaScript 程式碼不會自動的通用。

```javascript
const request = new XMLHttpRequest();
request.open('GET', 'https://api.randomuser.me/?nat=US&results=10');
request.onload = () => printNames(request.response);
request.send();
```

若在瀏覽器執行正常，但在 Node.js 執行則會遇到錯誤：

```
ReferenceError: XMLHttpRequest is not defined
```

使用 Node.js 時，我們可以使用 http 模組發出請求：

```javascript
const https = require('https');
https.get(
  'https://api.randomuser.me/?nat=US&results=10',
  res => {
    
    let results = '';
    
    res.setEncoding('utf8');
    res.on('data', chunk => results += chunk);
    
    res.on('end', () => printNames(results));
  }
)
```

以 Node.js 從 API 載入資料需要用到核心模組，它需要不同程式碼。此例中，printNames
函式是通用的，因此同一個函式兩種環境都可運行。

你可以建構在瀏覽器或 Node.js 應用程式上輸出姓名到控制台的模組：

```javascript
var printNames = response => {
  var people = JSON.parse(response).results,
      names = people.map(({name}) => `${name.last}, ${name.first}`);
  console.log(names.join('\n'));
}
if (typeof window !== 'undefined') {
  const request = new XMLHttpRequest();
  request.open('GET', 'https://api.randomuser.me/?nat=US&results=10');
  request.onload = () => printNames(request.response);
  request.send();
} else {
  const https = require('https');
  https.get(
    'https://api.randomuser.me/?nat=US&results=10',
    res => {
      
      let results = '';
      
      res.setEncoding('utf8');
      res.on('data', chunk => results += chunk);
      
      res.on('end', () => printNames(results));
    }
  )
}
```

現在這個 JavaScript 檔案是同構的；它具有通用的 JavaScript。此程式碼並非通用，但檔案可在兩個環境上執行。

> Top! isomorphic-fetch  
> 我們使用 isomorphic-fetch 而非其他 WHATWG 函式是因為 isomorphic-fetch 可在多種環境運行。

讓我們看看 Star 元件。此元件是否通用？

```javascript
const Star = ({selected=false, onClick = f => f}) =>
  <div className={selected ? 'star select' : 'star'}
       onClick={onClick}>
  </div>
```

是通用的：此 JSX 會編議成 JavaScript。Star 元件只是函式。

我們可以在瀏覽器直接繪製這個元件，或在不同環境繪製並擷取 HTML 輸出字串，ReactDOM
有個 renderToString 方法可將 UI 繪製到 HTML 字串。

```javascript
ReactDOM.render(<Star />);

var html = ReactDOM.renderToString(<Star />);
```

我們可建構同構應用程式在不同平台上繪製元件，且能以跨多種環境重複使用 JavaScript
程式碼的方式設計這些應用程式。此外，我們可以使用 Go 或 Python
等其他語言建構同構應用程式，不只受限於 Node.js。

### 伺服器繪製 React

使用 ReactDOM.renderToString 方法可在伺服器上繪製
UI。伺服器能力很強；它們可以存取多種瀏覽器無法存取的資源。伺服器很安全，可存取受保護的資料。你可以在伺服器上繪製初始內容以利用這些優點。

讓我們使用 Node.js 與 Express 建構一個基本的網頁伺服器。Express 是開發網頁伺服器的函式庫：

```shell
$ npm i express --save
```

讓我們看一個簡單的 Express 應用程式。

- 每個請求日誌紀錄在控制台
- 伺服器回應某些 HTML
- 這些步驟是內建在它的函式並以 .use() 方法鏈結
- Express 自動以參數插入請求與回應參數到這些函式中

```javascript


const logger = (req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
};

const sayHello = (req, res) =>
  res.status(200).send('<h1>Hello World</h1>');

const app = express()
  .use(logger)
  .use(sayHello);

app.listen(3000, () =>
  console.log(`Recipe app running at 'http://localhost:3000'`)
);
```

logger 與 sayHello 函式是中介軟體 (.use()
方法鏈接)。請求發生時，每個中介軟體函式逐個被呼叫直到送出回應。

第十章使用 babel-cli 執行測試。我們在此處使用 babel-cli 執行此 Express
應用程式，因為它現在的 Node.js 版本不支援 ES6 import 陳述。

> Top! babel-cli 並非上線應用程式最好的解決方案，我們也不一定要用 babel-cli
> 執行每個使用 ES6 的 Node.js 應用程式。目前 Node.js 尚不支援 ES6 import 陳述。
>
> 另一個選項是建構為後端程式碼設計的 webpack。webpack 可匯出能在舊版 Node.js
> 執行的 JavaScript 包。

執行 babel-node 需要做一些設定。首先我們必須安裝：

```shell
$ npm i babel-cli babel-loader babel-preset-env babel-preset-react babel-preset-stage-0 --save
```

再來是加入 .babelrc 檔案：

```
{
  "presets": [
    "env",
    "stage-0",
    "react"
  ]
}
```

執行 `babel-node index-server.js`，Babel 會尋找這個檔案並套用我們有安裝的 preset。

最後，讓我們在 package.json 檔案加入 start 腳本：

```json
"scripts": {
  "start": "babel-node index-server.js"
},
```

現在我們可以使用 `npm start` 執行 Express 伺服器：

```shell
$ npm start

Recipe app running at 'http://localhost:3000'
```

目前此 Express
應用程式以相同的字串回應所有的請求。讓我們繪製第四章與第五章的食譜應用程式，我們可使用
ReactDOM 的 renderToString 繪製 Menu 元件與一些食譜資料：

```javascript
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
    </body>
    </html>
  `);


const app = express()
  .use(logger)
  .use(sendHTMLPage);

app.listen(3000, () =>
  console.log(`Recipe app running at 'http://localhost:3000'`)
);
```

React 全域的顯露，因此 renderToString 可正確的運作。

我們有了伺服器繪製的 Menu 元件。我們的應用程式還不是同構，因為元件只在伺服器繪製。要讓它同構，我們需要在回應加上一些 JavaScript，以讓同一個元件可在瀏覽器中繪製。

讓我們建構在瀏覽器中執行的 index-client.js 檔案：

```javascript
import React from 'react';
import {render} from 'react-dom';
import Menu from "./components/Menu";

window.React = React;

alert('bundle loaded, Rendering in browser');

render(
  <Menu recipes={__DATA__}/>,
  document.getElementById('react-container')
);

alert('render complete');
```

瀏覽器載入此腳本時，`__DATA__` 已經存在與全域範圍中。alert 方法用於提示瀏覽器繪製了 UI。

我們需要將 client.js 檔案加入瀏覽器使用的程式包。一個基本的 webpack 組態可處理：

```javascript
const webpack = require('webpack');

module.exports = {
  entry: "./index-client.js",
  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'stage-0', 'react']
          }
        },
      }
    ]
  }
}
```

我們想要在每次啟動應用程式時建構用戶端程式包，因此必須將啟動腳本加入到 package.json 檔案中：

```json
"scripts": {
  "prestart": "webpack --progress",
  "start": "babel-node index-server.js"
},
```

最後是修改伺服器：

```javascript
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
```

現在我們同構了 React 元件，先是伺服器，然後是瀏覽器。執行此應用程式時，你會在瀏覽器繪製該元件前後看到警示對話框。你會注意到關閉第一個警示對話框前內容已經顯示，這是因為它是在伺服器上繪製。

繪製同一個內容兩次似乎不太對，但這樣有好處。此應用程式在各種瀏覽器上繪製相同內容，就算關掉 JavaScript 也一樣。由於內容是初始請求載入，網站會跑得比較快且更快的傳送資料給行動使用者。它無需等待行動處理器繪製 UI —— UI 已經就位。此外，此應用程式利用了 SPA 的各種好處。同構的 React 應用程式兩面玲瓏。

## 通用顏色管理

前面五章建構顏色管理應用程式。我們已經有許多程式碼可供建構網頁伺服器時重複使用。

讓我們為此應用程式建構一個 Express 伺服器並盡可能重複使用程式碼。首先，需要設定 Express 應用程式實例的模組，所以讓我們建構 ./server/app.js：

```javascript
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
```

此模組是我們通用應用程式的啟動點。