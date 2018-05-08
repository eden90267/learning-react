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

