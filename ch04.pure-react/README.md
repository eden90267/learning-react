# Chap 04. 純 React

> 本章目標：檢視背後的運行並認識 React 如何運作 (非 JavaScript as XML - JSX)

## 網頁設定

為讓 React 在瀏覽器中執行，我們需要兩個函式庫：

- React：建構 view 的函式庫
- ReactDOM：在瀏覽器中繪製 UI 的函式庫

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Pure React Samples</title>
</head>
<body>

<!-- Target container -->
<div class="react-container"></div>

<!-- React library & ReactDOM -->
<script src="https://unpkg.com/react@15.6.2/dist/react.js"></script>
<script src="https://unpkg.com/react-dom@15.6.2/dist/react-dom.js"></script>
<script>
  
  // 純 React 與 JavaScript 程式碼
  
</script>
</body>
</html>
```

這些是在瀏覽器中使用 React 的最基本需求。

## 虛擬 DOM

HTML 是瀏覽器在建構稱為 DOM 的文件文件模型時會執行的一組指令。組成 HTML
文件的元素會在瀏覽器載入 HTML 並繪製使用者介面時變成 DOM 元素。

在 HTML 中，階層中相關的元素與家族樹相似。

傳統上，網站由獨立的 HTML 網頁組成。使用者瀏覽這些網頁時，瀏覽器會請求與載入不同的
HTML 文件。AJAX 的發明產生了單頁應用程式。由於瀏覽器會使用 AJAX
請求與載入資料，整個網頁應用程式可在單一網頁中執行並依靠 JavaScript 更新使用者界面。

在 SPA 中，瀏覽器先載入初始 HTML
文件。使用者瀏覽時其實還在同一頁。使用者與應用程式互動過程中 JavaScript
清除與構建新的使用者介面，感覺上像是從一頁跳到另一頁，實際上還是在同一個 HTML
頁並由 JavaScript 執行工作。

DOM API 是一組 JavaScript 可與瀏覽器互動以改變 DOM 的物件。用過
document.createElement 或 document.appendChild 就是使用過 DOM API。在
JavaScript 中修改已經存在的 DOM
元素相當的簡單。然而，插入新元素的程序很慢。這表示網頁開發者注意修改 UI 的方式可改善應用程式的效能。

有效率地以 JavaScript 管理 DOM
的變化很複雜且花時間。從程式設計角度看，清除特定元素的所有子元素並重新建構比留下這些子元素並嘗試修改它們更為容易。問題是我們沒有時間或能力學習有效率操作
DOM API 的 JavaScript 進階知識。解決方案是依靠 React。

React 是用來更新瀏覽器的 DOM 的函式庫。我們不再需要為建構高效能 SPA
的複雜性傷腦筋，因為 React 可幫我們處理。使用 React 不需要直接處理 DOM
API。相對的，我們與*虛擬 DOM*互動或設定建構 UI 以及與瀏覽器互動的 React 指令。

虛擬 DOM 由概念上類似 HTML 元素的 React 元素組成，但實際上是 JavaScript
物件。直接使用 JavaScript 物件比透過 DOM API 更快。我們修改 JavaScript
物件與虛擬 DOM，而 React 盡可能有效率的使用 DOM API 來繪製這些改變。

## React 元素

瀏覽器的 DOM 由 DOM 元素組成。React 的 DOM 由 React 元素組成。React 元素是
DOM 元素外觀的描述。換句話說，React 元素是瀏覽器的 DOM 要如何建構的指令。

使用 React.creteElement 建構代表 h1 的 React 元素：

```javascript
React.createElement("h1", null, "Baked Salmon");
```

- 第一個參數：定義要建構的元素型別
- 第三個參數：元素的子元素
- 第二個元素：元素的屬性

繪製時，React 會將此元素轉換成實際的 DOM 元素：

```html
<h1>Baked Salmon</h1>
```

元素具有屬性時會以屬性描述。下面是具有 id 與 data-type 屬性的 h1 標籤範例：

```javascript
React.createElement("h1",
  {id: "recipe-0", 'data-type': "title"},
  "Baked Salmon"
);
```

```html
<h1 data-reactroot id="recipe-0" data-type="title">Baked Salmon</h1>
```

> Top! data-reactroot  
> data-reactroot 以 React 元件根元素的屬性存在。在 15 版之前，React 的 ID
> 會加到元件的每個節點，這樣可幫助繪製與追蹤需要更新的元素。現在只會在根加入一個屬性，而繪製則根據元素階層追蹤。

因此，React 元素只是告訴 React 如何建構 DOM 元素的 JavaScript 實字
(literal)。以下顯示 createElement 實際建構的元入：

```javascript
{
  $$typeof: Symbol(React.element),
  "type": "h1",
  "key": null,
  "ref": null,
  "props": {"children": "Baked Sakmon"},
  "_owner": null,
  "_store": {}
}
```

這是個 React 元素，具有 React 使用的欄位：_owner、_store、$$typeof。key 與
ref 是 React 元素的重要欄位，第五章將會說明。現在我們進一步檢視 type 與 props 欄位。

- type 屬性告訴 React 要建構哪一種 HTML 或 SVG 元素
- props 屬性代表建構 DOM 元素所需的子元素
  - children 屬性用於以文字顯示其他嵌套元素

## ReactDOM

ReactDOM 帶有在瀏覽器中繪製 React 元素所需的工具。我們可在 ReactDOM 中找到
render 方法與用於伺服器的 renderToString 與 renderToStaticMarkup
方法，它們會在第十二章深入討論。從虛擬 DOM 產生 HTML 的工具都在這個函式庫裡。

我們可使用 ReactDOM.render 在 DOM 中繪製 React 元素與其子元素。要繪製的元素作為第一個參數傳入，第二個參數是繪製此元素的目標節點：

```javascript
var dish = React.createElement('h1', null, "Backed Salmon")

ReactDOM.render(dish, document.getElementById('react-container'))
```

React 所有 DOM 繪製功能被移到 ReactDOM 中，因為我們也可以用 React
建構原生應用程式。瀏覽器只是 React 的標的之一。

你要做的就是這些。建構元素然後在 DOM 中繪製。下一節討論如何使用 props.children。

## 子元素

ReactDOM 可讓你在 DOM 中繪製單一元素。React 將它的標籤設定為
data-reactroot。其他 React 元素嵌套在單一元素中。

React 使用 props.children 繪製子元素。我們也可將其他 React 元素繪製成子元素，就構出元素樹。

```javascript
React.createElement(
  "ul",
  null,
  React.createElement('li', null, "1 lb Salmon"),
  React.createElement('li', null, "1 cup Pine Nuts"),
  React.createElement('li', null, "2 cups Butter Lettuce"),
  React.createElement('li', null, "1 Yellow Squash"),
  React.createElement('li', null, "1/2 cup Olive Oil"),
  React.createElement('li', null, "3 cloves of Garlic"),
);
```

傳送給 createElement 函式的其他參數是其他子元素。React 建構這些子元素的陣列並設定 props.children
值給該陣列。

檢視產生出的 React 元素會看到每個清單項目代表一個 React 元素並加入
props.children 陣列：

```javascript
{
  "type": "ul",
  "props": {
    "children": [
      {"type": "li", "props": {"children": "1 lb Salmon"} ...},
      {"type": "li", "props": {"children": "1 cup Pine Nuts"} ...},
      {"type": "li", "props": {"children": "2 cups Butter Lettuce"} ...},
      {"type": "li", "props": {"children": "1 Yellow Squash"} ...},
      {"type": "li", "props": {"children": "1/2 cup Olive Oil"} ...},
      {"type": "li", "props": {"children": "3 cloves of Garlic"} ...},
    ]
    ...
  }
}
```

可看到每個清單項目都是各子元素。


> Top! React 的 className  
> 任何具有 HTML class 屬性的元素使用 className 屬性取代 class。由於 class 是
> JavaScript 保留字，我們必須使用 className 來定義 HTML 元素的 class 屬性

純 React 看起來就像是這樣。最終在瀏覽器中執行的是純 React。虛擬 DOM 是 React
元素從單一根長出的樹。

**React 元素是 React 用於在瀏覽器中建構 UI 的指令**。

## 以資料建構元素

使用 React 的主要好處是能夠分離 UI 元素與資料。由於 React 只是
JavaScript，我們可加上 JavaScript 邏輯來幫助我們建構 React
元件樹。舉例來說，材料可以儲存在陣列中，而我們可以對應該陣列與 React 元素。

```javascript
var items = [
  "1 lb Salmon",
  "1 cup Pine Nuts",
  "2 cups Butter Lettuce",
  "1 Yellow Squash",
  "1/2 cup Olive Oil",
  "3 cloves of Garlic"
]

React.createElement(
  "ul",
  {className: 'ingredients'},
  items.map(ingredient => React.createElement('li', null, ingredient))
);
```