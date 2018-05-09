# Chap 05. React 與 JSX

虛擬 DOM 是 React 建構與更新使用者介面時依循的一組指令，這些指令由 React 元素的
JavaScript 物件組成。我們已學過使用 React.createElement 與 factory。

另一種替代繁瑣的 React.createElement 的方式是 JSX，它是使用類似 HTML 語法定義
React 元素的 JavaScript 擴充。

這章將討論如何使用 JSX 建構虛擬 DOM 與 React 元素。

## 以 JSX 表示 React 元素

在 JSX 中，元素的型別是以一個標籤指定。該標籤屬性代表元素的屬性。元素的子元素可以放在標籤中間。

```javascript
<ul>
  <li>1 lb Salmon</li>
  <li>1 cup Pine Nuts</li>
  <li>2 cups Butter Lettuce</li>
  <li>1 Yellow Squash</li>
  <li>1/2 cup Olive Oil</li>
  <li>3 cloves of Garlic</li>
</ul>
```

將材料陣列以 JSX 傳給 IngredientsList：

```javascript
<IngredientsList list={[...]} />
```

傳遞材料陣列給此元件，我們必須以大括號包圍它。這稱為 JavaScript 表示式。以屬性傳遞
JavaScript 值給元件時必須這麼做。元件屬性有字串或 JavaScript 表示式。JavaScript
表示式可包含陣列、物件，甚至是函式。

## JSX 秘訣

### 嵌套的元件

```javascript
<IngredientsList>
  <Ingredient />
  <Ingredient />
  <Ingredient />
</IngredientsList>
```

### className

class 是 JavaScript 保留字，因此改用 className 來定義 class 屬性：

```javascript
<h1 className="fancy">Baked Salmon</h1>
```

### JavaScript 表示式

JavaScript
表示式包裝在大括弧中，且會回傳變數求值後的結果。舉例來說，若想要顯示元素中的 title
屬性值，我們可用 JavaScript 表示式插入該值。變數會求值並回傳：

```javascript
<h1>{this.props.title}</h1>
```

字串型別以外的值也可用 JavaScript 表示式：

```javascript
<input type="checkbox" defaultChecked={false}/>
```

### 求值

大括弧中間的 JavaScript 會被求值。這表示連接或相加等操作會執行，也表示
JavaScript 表示式中的函式會被呼叫：

```javascript
<h1>{"Hello" + this.props.title}</h1>

<h1>{this.props.title.toLowerCase().replace}</h1>

function appendTitle({this.props.title}) {
  console.log(`${this.props.title} is great!`)
}
```

### 對應陣列到 JSX 中

JSX 是 JavaScript，因此可以在 JavaScript 函式中直接使用 JSX。

```javascript
<ul>
  {this.props.ingredients.map((ingredient, i) =>
    <li key={i}>{ingredient}</li>
  )}
</ul>
```

JSX 整潔且易讀，但瀏覽器無法解意。JSX 必須被轉換成 createElement or
factory。Babel 可以完成這個工作。

## Babel

JavaScript 是個直譯語言：瀏覽器解譯程式文字，因此無需編譯 JavaScript。但並非所有
browser 都有支援 ES6、ES7 語法，且沒有 browser 支援 JSX 語法。所以需要 Babel
程序來轉譯。

Babel 使用方式很多。最簡單的方式直接在 HTML 中加入 babel-core
轉譯器的連結，它會轉譯任何型別為 “text/babel” 的程式區塊中的程式碼。Babel
會於執刑前在用戶端轉譯程式碼。這不是上線時的解決方案，卻是開始使用 JSX 的好辦法。

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>React example</title>
</head>
<body>
<div class="react-container"></div>

<script src="https://unpkg.com/react@15.6.2/dist/react.js"></script>
<script src="https://unpkg.com/react-dom@15.6.2/dist/react-dom.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.38/browser.js"></script>
<script type="text/babel">
  // JSX 程式碼放這裡，或連結帶有 JSX 的 JavaScript 檔案
</script>
</body>
</html>
```

> Top! 需要 Babel v5.8  
> 要在瀏覽器轉譯程式碼，使用 Babel v5.8。Babel 6.0+ 不能作為瀏覽器中的轉譯器。

此章稍後會討論如何使用 Babel 與 webpack 靜態的轉譯 JavaScript 檔案。

## 以 JSX 表示食譜

喜愛 React
的一個原因是它能讓我們用漂亮的程式開發網頁應用程式，撰寫清楚表示應用程式如何運作的漂亮模組有很大的好處。JSX
提供清楚合理表示 React 元素的方式且讓其他工程師容易閱讀。

兩條食譜的陣列，並代表應用程式的狀態：

```javascript
var data = [
  {
      "name": "Baked Salmon",
      "ingredients": [
          { "name": "Salmon", "amount": 1, "measurement": "lb" },
          { "name": "Pine Nuts", "amount": 1, "measurement": "cup" },
          { "name": "Butter Lettuce", "amount": 2, "measurement": "cups" },
          { "name": "Yellow Squash", "amount": 1, "measurement": "med" },
          { "name": "Olive Oil", "amount": 0.5, "measurement": "cup" },
          { "name": "Garlic", "amount": 3, "measurement": "cloves" }
      ],
      "steps": [
          "Preheat the oven to 350 degrees.",
          "Spread the olive oil around a glass baking dish.",
          "Add the salmon, garlic, and pine nuts to the dish.",
          "Bake for 15 minutes.",
          "Add the yellow squash and put back in the oven for 30 mins.",
          "Remove from oven and let cool for 15 minutes. Add the lettuce and serve."
      ]
  },
  {
      "name": "Fish Tacos",
      "ingredients": [
          { "name": "Whitefish", "amount": 1, "measurement": "lb" },
          { "name": "Cheese", "amount": 1, "measurement": "cup" },
          { "name": "Iceberg Lettuce", "amount": 2, "measurement": "cups" },
          { "name": "Tomatoes", "amount": 2, "measurement": "large"},
          { "name": "Tortillas", "amount": 3, "measurement": "med" }
      ],
      "steps": [
          "Cook the fish on the grill until hot.",
          "Place the fish on the 3 tortillas.",
          "Top them with lettuce, tomatoes, and cheese."
      ]
  }
]
```

每個物件帶有食譜名稱、所需材料清單與烹飪步驟清單。

我們可用兩個元件建構食譜的 UI：menu 元件列出食譜和 Recipe 元件描述每個食譜的
UI。Menu 繪製到 DOM 中。透過 recipes 屬性傳入資料給 Menu 元件。

食譜的程式結構

```javascript
// 個別食譜的無狀態函式性元件
const Recipe = (props) => (
  ...
);

// 食譜選單的無狀態函式性元件
const Menu = (props) => (
  ...
);

ReactDOM.render(
  <Menu recipes={data} title="Delicious Recipes"/>,
  document.getElementById('react-container')
);
```

選單元件：

```javascript
const Menu = ({title, recipes}) => (
  <article>
    <header>
      <h1>{title}</h1>
    </header>
    <div class="recipes">
      {recipes.map((recipe, i) =>
        <Recipe key={i} {...recipe}/>
      )}
    </div>
  </article>
);
```

個別食譜元件：

```javascript
const Menu = ({title, recipes}) => (
  <article>
    <header>
      <h1>{title}</h1>
    </header>
    <div className="recipes">
      {recipes.map((recipe, i) =>
        <Recipe key={i} {...recipe}/>
      )}
    </div>
  </article>
);
```

### Babel 的 preset

Babel 6 將可能的轉換分成稱為 preset 的模組。工程師必須指定使用哪一個 preset
以明確的定義要使用什麼轉換。它的目標是讓所有東西更為模組化，以讓開發者決定哪個語法應該要轉換。外掛有分幾種類型，根據應用程式所需選擇使用。你很可能會用到的
preset 有：

- babel-preset-es2015

  ES6 的 ES2015 to ES5

- babel-preset-es2016

  ES2016 to ES2015

- babel-preset-es2017

  ES2017 to ES2016

- babel-preset-env

  編譯 ES2015、ES2016、ES2017。上面三個 preset 的總和

- babel-preset-react

  將 JSX 編譯成 React.createElement 呼叫


ECMAScript 規格提出新功能到接受會經過稱為 Strawman 的階段 0 (實驗性新提案)
到稱為 Finished 的階段 4 (成為標準的一部分) 等幾個階段。Babel 會為每個階段提供 preset，因此你可以選擇要在應用程式中套用什麼階段：

- babel-preset-stage-0：Strawman
- babel-preset-stage-1：Proposal
- babel-preset-stage-2：Draft
- babel-preset-stage-3：Candidate

## webpack

上線 React 後要考慮一些問題：

- 要如何處理 JSX 與 ES6+ 轉換？
- 要如何管理相依檔案？
- 要如何最佳化圖型與 CSS？


有不同工具可以回答這三個問題：Browserify、Gulp 與 Grunt。webpack
因功能與大公司的廣泛採用而成為 CommonJS 模組採用的工具之一。

webpack 是模組包裝工具。將不同檔案 (JavaScript、LESS、CSS、JSX、ES6)
轉換成單一檔案。包裝模組的兩個好處是**模組化**與**網路效能**。

模組化可讓你將原始碼拆解成團隊環境下更容易運用的模組。

網路效能提升是因為瀏覽器只需要載入一個相依檔案。可避免額外的延遲。

除了轉譯外，webpack 還可以處理：

- **程式碼切割**：將程式碼切割於有需要再載入。它們有時被稱為 rollup or layer；目的是將程式碼依不同網頁或裝置拆解
- **縮小**：刪除空白行、換行、長變數名稱與不必要的程式碼以減少檔案大小
- **功能標記**：測試功能時將程式碼傳送到一或多個——但非全部——環境中
- **熱模組替換**：監視原始碼修改。立即更新有異動的模組

### webpack 的loader

loader 是處理建構程序中的程式碼轉換的函式。使用到瀏覽器無法處理的語言。我們可指定
webpack.config.js 檔案中的 loader 執行程式碼轉換工作以使瀏覽器可以處理其語法。

數量龐大的 loader 可分為幾類：

loader 最常見的使用情境是方言中的轉譯。舉例：

- ES6 與 React 程式碼是以 babel-loader 轉譯

我們指定 Babel 應該處理的檔案類型，然後 webpack 處理其餘工作。

另一個常用 loader 是樣式設定。

- css-loader 尋找 .scss 副檔名的檔案並將其編譯成 CSS

css-loader 可用於引用包裝檔案中的 CSS 模組。所有的 CSS 被包裝成 JavaScript
並於引用包裝後 JavaScript 檔案時自動的加入，不需使用 link 元素來引用樣式表。

其他 loader：[https://webpack.js.org/concepts/loaders/](https://webpack.js.org/concepts/loaders/)

### 使用 webpack 建構的食譜應用程式

以 webpack 等工具靜態的建構你的用戶端
JavaScript，可讓團隊合作建構大型網頁應用程式。使用 webpack 模組包裝工具還有下列的好處：

- **模組化**

  使用 CommonJS 模組模式以匯出之後會匯入或被應用程式其他部分引用的模組可讓程式碼更容易存取，它能讓開發團隊更容易建構與運用不同的上線前靜態組合檔案。

- **組合**

  我們可使用模組建構可有效組成應用程式的小型、簡單、可重複使用的 React 元件。較小的元件更容易理解、測試與重複使用，也更容易在**改善應用程式時替換**。

- **速度**

  將應用程式的模組與相依檔案包裝到單一用戶端整合包可減少應用程式的載入時間，因為每個
  HTTP 請求都會產生延遲。將所有東西包裝到單一檔案意味著用戶端只需要發出單一請求。縮小包裝中的程式碼也能改善載入時間。

- **一致性**

  由於 webpack 會將 JSX 轉譯成 React 與 ES6 或 ES7 成通用
  JavaScript，我們現在就可以使用未來的 JavaScript 語法。Babel 支援多種 ESNext
  語法，這表示我們無須擔心瀏覽器是否支援我們的程式碼。它能讓開發者持續的使用最新的
  JavaScript 語法。

### 將元件拆成模組

目前的食譜元件：

```javascript
const Recipe = ({name, ingredients, steps}) => (
  <section id={name.toLowerCase().replace(/ /g, '-')}>
    <h1>{name}</h1>
    <ul className="ingredients">
      {ingredients.map((ingredient, i) =>
        <li key={i}>{ingredient.name}</li>
      )}
    </ul>
    <section className="instructions">
      <h2>Cooking Instructions</h2>
      {steps.map((step, i) =>
        <p key={i}>{step}</p>
      )}
    </section>
  </section>
);
```

此元件執行相當多的工作：

- 顯示食譜名稱
- 建構材料的無排序清單
- 獨立段落元素顯示每一個步驟

更函式性方式的 Recipe
元件會將它拆解成較小且功能更專注的函式性元件，然後再進行組合。我們可先抽出步驟成獨立的無狀態函式性元件開始，並建構可用於任何一組步驟的獨立檔案中的模組：

```javascript
const Instructions = ({title, steps}) =>
  <section className="instructions">
    <h2>{title}</h2>
    {steps.map((s, i) =>
      <p key={i}>{s}</p>
    )}
  </section>;

export default Instructions;
```

我們會傳入步驟的名稱與步驟給 Instructions 的新元件。

接下來考慮材料。在 Recipe
元件，我們只顯示材料的名稱，但資料中的材料還有分量與單位。我們可建構一個無狀態函式性元件來表示單一材料：

```javascript
const Ingredient = ({amount, measurement, name}) =>
  <li>
    <span className="amount">{amount}</span>
    <span className="measurement">{measurement}</span>
    <span className="name">{name}</span>
  </li>;

export default Ingredient;
```

再來使用 Ingredient 元件建構顯示材料清單的 IngredientsList 元件：

```javascript
import Ingredient from "./Ingredient";

const IngredientsList = ({list}) =>
  <ul className="ingredients">
    {list.map((ingredient, i) => <Ingredient key={i} {...ingredient}/>)}
  </ul>;

export default IngredientsList;
```

有了材料與步驟元件，我們可透過這些元件組成食譜：

```javascript
import IngredientsList from "./IngredientsList";
import Instructions from "./Instructions";

const Recipe = ({name, ingredients, steps}) =>
  <section id={name.toLowerCase().replace(/ /g, '-')}>
    <h1>{name}</h1>
    <IngredientsList list={ingredients} />
    <Instructions title="Cooking Instructions"
                  steps={steps} />
  </section>;

export default Recipe;
```

我們以組合較小的元件更宣告式的表示我們的食譜。不只是程式碼比較漂亮與簡單，也更容易閱讀。它表示食譜應該顯示食譜名稱、材料清單與烹飪。我們將材料與步驟的顯示抽出放在較小、較簡單的元件中。

在 CommonJS 的模組化方式中，Menu 元件看起來很相似。關鍵差別在於它儲存在獨立的檔案中、匯入所用到的模組，以及匯出它自己：

```javascript
import Recipe from "./Recipe";

const Menu = ({recipes}) =>
  <article>
    <header>
      <h1>Delicious Recipes</h1>
    </header>
    <div className="recipes">
      {recipes.map((recipe, i) =>
        <Recipe key={i} {...recipe} />)
      }
    </div>
  </article>;

export default Menu;
```

我們還是需要 ReactDOM.render 繪製 Menu 元件。我們需要 index.js 檔案：

```javascript
import React from 'react'
import {render} from 'react-dom'
import Menu from "./components/Menu";
import data from '../data/recipes'

window.React = React;

render(
  <Menu recipes={data}/>,
  document.getElementById('react-container')
);
```

將 window.React 設定成 React 使 React 函式庫在瀏覽器中全域顯露。這種方式可確保
React.createElement 的呼叫可用。

現在我們已將程式碼抽出到獨立的模組與檔案中，讓我們建構以 webpack
建構靜態的建構程序來將所有東西放回單一檔案中。

### 安裝 webpack 相依檔案

全域安裝 webpack 以便在各處使用 webpack 命令：

```shell
npm i -g webpack@3.11.0
```

再來安裝一些 loader 與 preset 來達成轉譯：

```shell
npm i babel-core babel-loader babel-preset-env babel-preset-react babel-preset-stage-0 -D
```

我們需要區域性的安裝 React 與 ReactDOM 的相依檔案：

```shell
npm i react@15.6.2 react-dom@15.6.2 --save
```

現在我們已經安裝好 webpack 的靜態建構程序所需的所有東西。

### 設定 webpack

我們必須告訴 webpack 如何將原始碼包裝到單一檔案中。我們可使用 webpack
預設的組態檔案：webpack.config.js

我們的啟動檔案是 index.js，它會匯入 React、ReactDOM 與 Menu.js 檔案，webpack
會依 import 陳述，順著匯入樹引入必要的模組到整合檔案中。

> Top! ES6 的 import 陳述  
> ES6 的 import 陳述目前並未被大部分瀏覽器或 Node.js 支援。ES6 的 import
> 能運作的原因是 Babel 會將它們轉換成 `require('module/path');`
> 的陳述。CommonJS 的模組通常以 require 函式載入。

我們建構程序有三個步驟：

1. JSX 轉 React 元素
2. 以 ES5 替換 ES6
3. 匯出單一檔案

webpack.config.js 檔案只是另一個匯出 JavaScript 實字物件以描述 webpack 應該採取的動作之模組。

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist', 'assets'),
    filename: "bundle.js"
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
};;
```

首先，我們告訴 webpack 用戶端的進入點是 `./src/index.js`。它會自動根據檔案開始處的
import 陳述建構相依檔案樹。

指定輸出整合 JavaScript 檔案到 `./dist/asserts/bundle.js`。

下一組 webpack 指令由特定模組中的 loader 清單組成。rules
欄位為陣列是因為有很多種 loader 可用於 webpack。此例中，我們只使用了 babel。

每個 loader 都是 JavaScript 物件。test 欄位是尋找 loader
應該操作的模組之檔案路徑的正規表示式。此例中，我們對 node_modules
目錄外的所有匯入 JavaScript 檔案執行 babel-loader。babel-loader 會使用 ES6
與 React 的 preset 以將 ES6 或 JSX 語法轉譯成瀏覽器均可執行的 JavaScript。

webpack 靜態的執行。整合包通常在部署到伺服器前建構。

```shell
$ webpack
```

webpack 會成功建構整合包或顯示錯誤，大部分錯誤都與匯入參考有關。對 webpack
除錯時要仔細檢查 import 陳述式中的檔案名稱與路徑。

### 載入整合包

將整合包匯出到 dist 目錄。此目錄包含你想要在網頁伺服器上執行的檔案。dist
目錄是儲存 index.html 檔案的地方：

```html
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
<div id="react-container"></div>
<script src="assets/bundle.js"></script>
</body>
</html>
```

這是你應用程式的首頁。它會以一個 HTTP 請求從 bundle.js
檔案載入所需的所有東西。你必須部署這些檔案到網頁伺服器上或以 Node.js、Ruby on
Rails 等建構提供這些檔案的網頁伺服器應用程式。

### 原始碼對應 (sourcemap)

將原始碼包裝在單一檔案中會導致應用程式於瀏覽器中除錯的問題，我們可提供 sourcemap
來消除這個問題。sourcemap 是個對應整合包與原始碼檔案的一個檔案。使用 webpack
時，我們只需在 webpack.config.js 加上幾行：

```javascript
const path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist', 'assets'),
    filename: "bundle.js",
    sourceMapFilename: 'bundle.map'
  },
  devtool: '#source-map',
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
};
```

將 devtool 屬性設定為 '#source-map' 會告訴 webpack
你想要使用原始碼對應。sourceMapFilename
是必要的。將原始碼對應檔案依目標檔案命名是個好主意，webpack
會在匯出時對應整合檔案與原始碼。

打開 browser devtools 工具，在 sources 分頁中看到
`webpack://目錄`，此目錄下可找到整合包中的所有原始檔。

你可使用瀏覽器的除錯工具對這些檔案逐步執行。

- 任何行號插入中斷點
- Scope 分頁檢查變數
- Watch 分頁將變數加入觀察

### 整合包最佳化

縮小檔案，包括刪除空白、縮小變數名稱為一個字元與刪除直譯器不會碰到的行。

webpack 有內建的外掛可醜化整合包

```shell
npm i webpack -D
```

```javascript
// webpack.config.js
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist', 'assets'),
    filename: "bundle.js",
    sourceMapFilename: 'bundle.map'
  },
  devtool: '#source-map',
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
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      warnings: false,
      mangle: true
    })
  ]
};
```

- sourceMap 設為 true 來對應原始碼
- warning 設為 true 會消除匯出時的控制台警告
- mangle 表示要將 recipes 或 ingredients 等長變數名稱改為單一字母

### 整合 CSS

CSS 可使用 import 陳述加入整合包。這些陳述告訴 webpack 將 CSS 與 JavaScript
模組包在一起：

```javascript
import Recipe from "./Recipe";
import '../../stylesheets/Menu.css';

const Menu = ({recipes}) =>
  <article>
    <header>
      <h1>Delicious Recipes</h1>
    </header>
    <div className="recipes">
      {recipes.map((recipe, i) =>
        <Recipe key={i} {...recipe} />)
      }
    </div>
  </article>;

export default Menu;
```

要在 webpack 設定中引入 CSS，必須安裝一些 loader：

```shell
npm i style-loader css-loader postcss-loader -D
```

```javascript
// webpack.config.js
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist', 'assets'),
    filename: "bundle.js",
    sourceMapFilename: 'bundle.map'
  },
  devtool: '#source-map',
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
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: () => [require('autoprefixer')]
          }
        }]
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      warnings: false,
      mangle: true
    })
  ]
};
```

### create-react-app

如 Facebook 團隊在他們的部落格所述：“React 的生態系與工具的大爆發有關”。React
團隊發布 create-react-app 命令列工具以自動產生 React 專案。

create-react-app 受 Ember CLI 專案的啟發，能讓開發者快速啟動 React
專案而無須手動設定 webpack、Babel、ESLint 與相關工具。

```shell
npm i -g create-react-app
```

```shell
create-react-app my-react-project
```

如此會在該目錄建構有三個依賴工具的 React 專案：React、ReactDOM 與
react-scripts。實際執行工作的 react-scripts 也是 Facebook 開發的。它會安裝
Babel、ESLint、webpack 與其他工具，因此你無需手動設定它們。在它產生的目錄中有個
src 目錄待有一個 App.js 檔案，你可以修改根元件並匯入其他元件檔案。

```shell
npm start
```

```shell
npm test
```

這樣會在埠 3000 執行你的應用程式。

你也可執行 npm run build 命令或 yarn
build。如此會建構可上線的轉譯與縮小過的整合包。

create-react-app 是很好的 React
新手與老手工具。隨著工具演進，還會加入更多功能，因此要注意 Github 上的動態。